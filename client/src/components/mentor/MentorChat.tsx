import { useState, useRef, useEffect } from 'react'
import { Send, Brain, User, Loader2 } from 'lucide-react'
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
      content: `NEURAL MENTOR ONLINE\n\nWelcome, Trader. I'm your dedicated EUR/USD mentor with 15+ years of prop firm trading experience.\n\nI'm here to help you:\n- **Analyze your trades** and find mistakes\n- **Build solid risk management** habits\n- **Pass prop firm challenges** like FTMO\n- **Answer any trading question** you have\n\nWhat would you like to work on today?`,
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
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.content, timestamp: new Date() }])
    } catch {
      toast.error('Mentor unavailable. Check your API key.')
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'SYSTEM OFFLINE — Add your ANTHROPIC_API_KEY in the server .env file for full AI responses.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-slate-100 mt-2 first:mt-0">{line.slice(2, -2)}</p>
      if (line.startsWith('- ')) return <li key={i} className="ml-3 list-disc text-slate-400 text-xs">{formatInline(line.slice(2))}</li>
      if (line.startsWith('# ')) return <div key={i} className="font-bold text-cyber-cyan text-xs tracking-widest font-hud mt-2">{line.slice(2).toUpperCase()}</div>
      if (line.trim() === '') return <br key={i} />
      return <p key={i} className="text-slate-300 text-xs leading-relaxed">{formatInline(line)}</p>
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
      <div className="flex-1 overflow-y-auto space-y-3 p-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded flex-shrink-0 flex items-center justify-center ${
              msg.role === 'assistant'
                ? 'bg-cyber-cyan/10 border border-cyber-cyan/20'
                : 'bg-bg-elevated border border-border'
            }`}>
              {msg.role === 'assistant'
                ? <Brain size={13} className="text-cyber-cyan" style={{ filter: 'drop-shadow(0 0 4px #00e5ff)' }} />
                : <User size={13} className="text-slate-400" />}
            </div>
            <div className={`max-w-[88%] rounded-lg p-3 ${
              msg.role === 'assistant'
                ? 'bg-bg-elevated border border-border-dim'
                : 'bg-cyber-cyan/10 border border-cyber-cyan/20'
            }`}>
              <div className="space-y-0.5 list-none">
                {formatContent(msg.content)}
              </div>
              <div className="text-[8px] text-slate-700 mt-2 font-mono">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded flex-shrink-0 flex items-center justify-center bg-cyber-cyan/10 border border-cyber-cyan/20">
              <Brain size={13} className="text-cyber-cyan" />
            </div>
            <div className="bg-bg-elevated border border-border-dim rounded-lg p-3">
              <div className="flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin text-cyber-cyan" />
                <span className="text-[9px] text-slate-600 font-mono animate-pulse">PROCESSING...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="py-3 border-t border-border-dim">
          <p className="hud-label mb-2">QUICK QUERIES</p>
          <div className="flex flex-wrap gap-1">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-[9px] font-hud tracking-wider bg-bg-elevated hover:bg-border-dim border border-border-dim text-slate-500 hover:text-cyber-cyan px-2 py-1 rounded transition-colors"
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
            className="input-field flex-1 text-xs"
            placeholder="ASK YOUR MENTOR ANYTHING..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="btn-primary px-3 disabled:opacity-40"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
