import { MessageCircle, Info } from 'lucide-react'
import MentorChat from '../components/mentor/MentorChat'

export default function Mentor() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-5rem)] animate-fade-in">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <MessageCircle size={20} className="text-accent-blue" />
            AI Trading Mentor
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Your personal EUR/USD mentor — trade reviews, strategy help, and psychology coaching.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-bg-elevated px-3 py-1.5 rounded-lg border border-border-dim">
          <Info size={12} />
          Powered by Claude AI
        </div>
      </div>
      <div className="flex-1 card min-h-0 flex flex-col">
        <MentorChat />
      </div>
    </div>
  )
}
