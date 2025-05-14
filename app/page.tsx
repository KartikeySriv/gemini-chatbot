import ChatInterface from "@/components/chat-interface"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="gemini-theme">
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <main className="container flex flex-col items-center justify-center gap-4 px-4 py-8 md:py-16">
          <h1 className="text-center text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">
            Gemini <span className="text-purple-600 dark:text-purple-400">AI</span> Chat
          </h1>
          <p className="max-w-[700px] text-center text-gray-600 dark:text-gray-400">
            An advanced AI chatbot powered by Google's Gemini API
          </p>
          <ChatInterface />
        </main>
      </div>
    </ThemeProvider>
  )
}
