import { GoogleGenerativeAI } from "@google/generative-ai"

// Configure the API key
// NOTE: avoid hardcoding API keys in source. Prefer process.env.GOOGLE_API_KEY
const apiKey = process.env.GOOGLE_API_KEY ?? "AIzaSyBckEuem-Q3zhZmeNgNcw_1kR8xnHR9fgM"
const genAI = new GoogleGenerativeAI(apiKey)

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json()

    // Helper: exponential backoff sleep
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

    // Helper: fetch available models (REST) and return normalized ids array
    const fetchAvailableModelIds = async () => {
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
      const res = await fetch(listUrl)
      if (!res.ok) {
        const body = await res.text()
        console.error("ListModels HTTP error during fallback retry:", res.status, body)
        return []
      }
      const listed = await res.json()
      const available = Array.isArray(listed) ? listed : listed?.models ?? []
      return available.map((m: any) => String(m?.name || m?.id || m?.model || m).replace(/^models\//, ""))
    }

    // Initialize the model - try preferred model, fallback to a supported model if not found
    let model
  // Prefer a model known to support generateContent from your ListModels output
  // (change this if you want a different model)
  const preferredModelName = "gemini-2.5-flash"
    try {
      model = genAI.getGenerativeModel({ model: preferredModelName })
    } catch (err) {
      // If the requested model is not available for this API version, list models and pick a fallback
      console.warn(
        `Preferred model ${preferredModelName} unavailable, attempting to discover a supported model...`,
        err,
      )

      let listed: any
      try {
        // Use the REST ListModels endpoint directly to avoid depending on SDK method availability.
        // We use the API key as a query parameter here. If you're using OAuth access tokens, switch to Bearer auth.
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
        const res = await fetch(listUrl)
        if (!res.ok) {
          const body = await res.text()
          console.error("ListModels HTTP error:", res.status, body)
          throw new Error(`ListModels failed: ${res.status}`)
        }
        listed = await res.json()
      } catch (listErr) {
        console.error("Failed to list models for fallback discovery:", listErr)
        // Re-throw original error to be handled by outer catch
        throw err
      }

      // `listed` is expected to be an object like { models: [...] } from the REST API. Normalize to array.
      const available = Array.isArray(listed) ? listed : listed?.models ?? []
      console.info("Discovered models count:", available.length)

      // Prefer models that advertise the generateContent method and have names indicating chat/generative capability
      const candidate = available.find((m: any) => {
        const id = String(m?.name || m?.id || m?.model || m)
        const methods = Array.isArray(m?.supportedGenerationMethods) ? m.supportedGenerationMethods : []
        const supportsGenerate = methods.includes("generateContent") || methods.includes("batchGenerateContent")
        return supportsGenerate && /gemini|bison|text-bison|chat/i.test(id)
      })

      if (!candidate) {
        console.error("No suitable fallback model found in list:", available)
        throw err
      }

  // The REST API returns names like "models/gemini-2.5-flash".
  // The SDK's getGenerativeModel expects the model id (e.g. "gemini-2.5-flash").
  const rawName = String(candidate?.name || candidate?.id || candidate?.model || candidate)
  const fallbackName = rawName.replace(/^models\//, "")
  console.info("Falling back to model (raw):", rawName, "=> using:", fallbackName)
  model = genAI.getGenerativeModel({ model: fallbackName })
    }

    // Filter out the initial welcome message and ensure the first message is from a user
    const filteredHistory = history.filter((msg: { role: string; content: string }, index: number) => {
      // If it's the first message and it's from the assistant, skip it
      if (index === 0 && msg.role === "assistant") {
        return false
      }
      return true
    })

    // Create a chat session
    let response

    if (filteredHistory.length === 0) {
      // If no history, just send the message directly
      try {
        const result = await model.generateContent(message)
        response = await result.response
      } catch (e: any) {
        const msg = (e && e.message) || String(e)
        // If overloaded, try retries then try another model
        if (/503|overload|overloaded/i.test(msg)) {
          console.warn("Model appears overloaded, retrying with backoff then attempting model switch...", msg)
          // Retry a few times with backoff
          let ok = false
          let lastError: any
          for (let i = 0; i < 3 && !ok; i++) {
            await sleep(500 * Math.pow(2, i))
            try {
              const result = await model.generateContent(message)
              response = await result.response
              ok = true
            } catch (err2) {
              lastError = err2
            }
          }
          if (!ok) {
            // Try switching to another model from ListModels
            const ids = await fetchAvailableModelIds()
            const alt = ids.find((id: string) => id !== (model?.model || "") )
            if (alt) {
              console.info("Switching to alternative model due to overload:", alt)
              model = genAI.getGenerativeModel({ model: alt })
              const result = await model.generateContent(message)
              response = await result.response
            } else {
              throw lastError ?? e
            }
          }
        } else {
          throw e
        }
      }
    } else {
      // Format history for the chat
      const formattedHistory = filteredHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }))

      // Start a chat session
      const chat = model.startChat({
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      })

      // Send previous messages to build context
      for (const msg of formattedHistory) {
        if (msg.role === "user") {
          await chat.sendMessage(msg.parts[0].text)
        }
      }

      // Send the current message with retry and fallback on overload
      try {
        const result = await chat.sendMessage(message)
        response = await result.response
      } catch (e: any) {
        const msg = (e && e.message) || String(e)
        if (/503|overload|overloaded/i.test(msg)) {
          console.warn("Chat send appears overloaded, retrying with backoff then attempting model switch...", msg)
          let ok = false
          let lastError: any
          for (let i = 0; i < 3 && !ok; i++) {
            await sleep(500 * Math.pow(2, i))
            try {
              const result = await chat.sendMessage(message)
              response = await result.response
              ok = true
            } catch (err2) {
              lastError = err2
            }
          }
          if (!ok) {
            const ids = await fetchAvailableModelIds()
            const alt = ids.find((id: string) => id !== (model?.model || ""))
            if (alt) {
              console.info("Switching to alternative model for chat due to overload:", alt)
              model = genAI.getGenerativeModel({ model: alt })
              const chat2 = model.startChat({
                generationConfig: {
                  temperature: 0.7,
                  topP: 0.95,
                  topK: 40,
                },
              })
              // replay history
              for (const msg of formattedHistory) {
                if (msg.role === "user") await chat2.sendMessage(msg.parts[0].text)
              }
              const result = await chat2.sendMessage(message)
              response = await result.response
            } else {
              throw lastError ?? e
            }
          }
        } else {
          throw e
        }
      }
    }

    const text = response.text()
    return Response.json({ response: text })
  } catch (error) {
    console.error("Error processing chat request:", error)
    return Response.json(
      {
        error: "Failed to process your request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
