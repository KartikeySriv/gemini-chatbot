import { GoogleGenerativeAI } from "@google/generative-ai"

// Configure the API key
const apiKey = "AIzaSyBckEuem-Q3zhZmeNgNcw_1kR8xnHR9fgM"
const genAI = new GoogleGenerativeAI(apiKey)

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json()

    // Initialize the model - using the updated model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

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
      const result = await model.generateContent(message)
      response = await result.response
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

      // Send the current message
      const result = await chat.sendMessage(message)
      response = await result.response
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
