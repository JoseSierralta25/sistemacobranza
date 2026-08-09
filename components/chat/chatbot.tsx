"use client"
import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Bot, X, Send, User, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 p-4 rounded-full bg-gradient-to-r from-[#38bdf8] to-[#818cf8] text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-110 transition-all duration-300"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6 animate-pulse" />}
      </button>

      {/* Ventana de Chat */}
      {isOpen && (
        <Card className="fixed bottom-36 md:bottom-24 right-4 md:right-8 z-50 w-[90vw] md:w-[400px] h-[500px] max-h-[70vh] flex flex-col shadow-2xl glass-panel border-outline-variant animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden">
          <CardHeader className="bg-surface-variant/40 border-b border-outline-variant p-4 py-3 shrink-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-[#facc15]" />
              Copiloto MR
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <Bot className="h-12 w-12 text-primary" />
                  <p className="text-sm">Hola, soy el asistente inteligente de MR. ¿En qué te puedo ayudar hoy?</p>
                </div>
              )}
              
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`flex max-w-[85%] rounded-2xl px-4 py-2 ${
                      m.role === "user"
                        ? "bg-primary text-on-primary rounded-br-sm"
                        : "bg-surface-variant text-on-surface rounded-bl-sm border border-outline-variant/30"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-surface-variant text-on-surface rounded-2xl rounded-bl-sm px-4 py-2 border border-outline-variant/30">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-outline-variant bg-surface-container shrink-0 flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Pregúntale algo a Gemini..."
                className="flex-1 rounded-full bg-black/20 border-white/10"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-full rounded-tl-sm bg-primary hover:bg-primary/90 transition-transform active:scale-95 shrink-0"
                disabled={isLoading || !input?.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  )
}
