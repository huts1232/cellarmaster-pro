'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Wine } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  "What should I drink with lamb?",
  "Which wines are undervalued?",
  "Suggest a 3-course wine pairing",
  "Best time to open my 2016 Barolo?",
]

export function WineChatbot({ wines }: { wines: any[] }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length])

  async function send(text?: string) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, wines }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-xl shadow-purple-900/30 flex items-center justify-center hover:scale-105 transition-transform z-50">
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Wine className="h-5 w-5 text-purple-200" />
              <div><p className="text-white font-semibold text-sm">AI Sommelier</p><p className="text-purple-200 text-[10px]">Ask anything about wine</p></div>
            </div>
            <button onClick={() => setOpen(false)} className="text-purple-200 hover:text-white"><X className="h-5 w-5" /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <Wine className="h-10 w-10 text-purple-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">Ask your personal sommelier anything about your collection</p>
                <div className="space-y-2">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => send(s)} className="block w-full text-left px-3 py-2 text-xs text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start"><div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md"><Loader2 className="h-4 w-4 animate-spin text-purple-500" /></div></div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex-shrink-0">
            <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask your sommelier..."
                className="flex-1 px-3 py-2 border rounded-xl text-sm outline-none focus:border-purple-400" disabled={loading} />
              <button type="submit" disabled={!input.trim() || loading}
                className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 disabled:opacity-30">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
