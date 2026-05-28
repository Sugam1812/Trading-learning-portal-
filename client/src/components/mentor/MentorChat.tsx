import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, MessageCircle } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_QUESTIONS = [
  'How do I find the best EUR/USD setups?',
  'What is the proper position size for a $10k account?',
  'How do I deal with losing streaks?',
  'Explain the London open strategy',
  'How do I set stop losses correctly?',
  'What are the FTMO prop firm rules?',
]

export default function MentorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Welcome, Trader. I'm your dedicated EUR/USD mentor with 15+ years of prop firm trading experience.\n\nI'm here to help you:\n- **Analyze your trades** and find mistakes\n- **Build solid risk management** habits\n- **Pass prop firm challenges** like FTMO\n- **Answer any trading question** you have\n\nWhat would you like to work on today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text?: string) => {
    const message = text || input.trim()
    if (!message || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: message, timestamp: new Date() }])
    setLoading(true)

    const history = messages.map((m) => ({ role: m.role, content: m.content }))

    try {
      const res = await axios.post('/api/mentor/chat', { message, history })
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.content, timestamp: new Date() },
      ])
    } catch {
      toast.error('Mentor unavailable. Check your API key.')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I\'m temporarily unavailable. Add your ANTHROPIC_API_KEY in the server .env file for full AI responses.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-slate-100 mt-2 first:mt-0">{line.slice(2, -2)}</p>
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-3 list-disc text-slate-300">{formatInline(line.slice(2))}</li>
      }
      if (line.startsWith('# ')) {
        return <h3 key={i} className="font-bold text-slate-100 text-base mt-2">{line.slice(2)}</h3>
      }
      if (line.trim() === '') return <br key={i} />
      return <p key={i} className="text-slate-300">{formatInline(line)}</p>
    })
  }

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i} className="text-slate-100 font-semibold">{part.slice(2, -2)}</strong>
        : part
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === 'assistant' ? 'bg-accent-blue/20 border border-accent-blue/30' : 'bg-bg-elevated border border-border'
            }`}>
              {msg.role === 'assistant' ? <Bot size={14} className="text-accent-blue" /> : <User size={14} className="text-slate-400" />}
            </div>
            <div className={`max-w-[85%] rounded-xl p-3.5 text-sm leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-bg-elevated border border-border-dim'
                : 'bg-accent-blue/15 border border-accent-blue/30'
            }`}>
              <div className="space-y-0.5 list-none">
                {formatContent(msg.content)}
              </div>
              <div className="text-[10px] text-slate-600 mt-2">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-accent-blue/20 border border-accent-blue/30">
              <Bot size={14} className="text-accent-blue" />
            </div>
            <div className="bg-bg-elevated border border-border-dim rounded-xl p-3.5">
              <Loader2 size={14} className="animate-spin text-accent-blue" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="py-3 border-t border-border-dim">
          <p className="text-[10px] text-slate-500 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-[10px] bg-bg-elevated hover:bg-border-dim border border-border-dim text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border-dim pt-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            className="input-field flex-1"
            placeholder="Ask your mentor anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="btn-primary px-3 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
