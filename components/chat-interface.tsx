"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, AlertCircle, Copy, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ReactMarkdown from "react-markdown"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  error?: boolean
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm Gemini, an AI assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Set isMounted to true when component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const copyToClipboard = (id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Reset any previous errors
    setError(null)

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Filter out the initial welcome message when sending history to API
      const chatHistory = messages.filter((msg, index) => {
        // Skip the initial welcome message
        if (index === 0 && msg.role === "assistant") {
          return false
        }
        return true
      })

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          history: chatHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to get response")
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      // Set the error state
      setError(error instanceof Error ? error.message : "An unknown error occurred")

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date(),
        error: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Only render content after component has mounted on the client
  if (!isMounted) {
    return null // Return null on first render to avoid hydration mismatch
  }

  return (
    <Card className="w-full max-w-3xl shadow-lg">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="public\gemini-logo.png" alt="Gemini" />
            <AvatarFallback className="bg-purple-600 text-white">GI</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">Gemini AI</h2>
            <p className="text-xs text-muted-foreground">Powered by Google</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <ScrollArea className="h-[500px] p-4">
        <div className="flex flex-col gap-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col gap-2 rounded-lg p-4 relative group",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : message.error
                    ? "bg-destructive/10 border border-destructive/20"
                    : "bg-muted",
                message.role === "user" ? "max-w-[80%]" : "max-w-[85%]",
              )}
            >
              <div className="flex items-center gap-2">
                {message.role === "assistant" && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="public\gemini-logo.png" alt="Gemini" />
                    <AvatarFallback className="text-xs bg-purple-600 text-white">GI</AvatarFallback>
                  </Avatar>
                )}
                <span className="text-xs font-medium">{message.role === "user" ? "You" : "Gemini"}</span>

                {message.role === "assistant" && !message.error && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                    onClick={() => copyToClipboard(message.id, message.content)}
                  >
                    {copied === message.id ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="sr-only">Copy message</span>
                  </Button>
                )}
              </div>

              <div className="overflow-hidden prose dark:prose-invert prose-sm max-w-none">
                {message.role === "assistant" && !message.error ? (
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-2" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-2" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-md font-bold my-1" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props} />
                        ) : (
                          <code
                            className="block bg-gray-200 dark:bg-gray-800 p-2 rounded-md text-sm overflow-x-auto my-2"
                            {...props}
                          />
                        ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                )}
              </div>

              <span className="text-xs opacity-50">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="flex max-w-[85%] flex-col gap-2 rounded-lg p-4 bg-muted">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="public\gemini-logo.png" alt="Gemini" />
                  <AvatarFallback className="text-xs bg-purple-600 text-white">GI</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">Gemini</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
