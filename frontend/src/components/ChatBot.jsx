import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react'
import api from '../api/client'

const SUGGESTIONS = [
  'Recommend mind-bending sci-fi movies',
  'Movies like Interstellar but darker',
  'Best psychological thrillers after 2015',
  'Heartwarming animated films for adults',
  'Underrated crime dramas',
]

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm **CineAI**, your personal movie assistant. Ask me anything — recommendations, similar movies, or what's trending. 🎬",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  const send = async (text = input.trim()) => {
    if (!text || loading) return
    const userMsg = { role: 'user', content: text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { data } = await api.post('/chat/message', {
        message: text,
        history: messages.slice(-6),
      })
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    }
    setLoading(false)
  }

  const renderContent = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />')
  }

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cinema-500 shadow-2xl flex items-center justify-center text-white ${open ? 'hidden' : ''}`}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-950" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] flex flex-col card shadow-2xl shadow-black/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-gradient-to-r from-cinema-500/20 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cinema-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">CineAI Assistant</p>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                    Online
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-96">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.role === 'assistant' ? 'bg-cinema-500/20 border border-cinema-500/30' : 'bg-slate-700'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-cinema-400" /> : <User className="w-4 h-4 text-slate-300" />}
                  </div>
                  <div className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
                      : 'bg-cinema-500 text-white rounded-tr-sm'
                  }`}>
                    <span dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-cinema-500/20 border border-cinema-500/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-cinema-400" />
                  </div>
                  <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-slate-500 rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ delay: i * 0.15, repeat: Infinity, duration: 0.8 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                {SUGGESTIONS.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="flex-shrink-0 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700 transition-colors"
                  >
                    {s.length > 30 ? s.slice(0, 30) + '...' : s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-slate-800 flex gap-2">
              <input
                ref={inputRef}
                className="input py-2 text-sm flex-1"
                placeholder="Ask about movies..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                disabled={loading}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-cinema-500 hover:bg-cinema-600 disabled:opacity-40 flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
