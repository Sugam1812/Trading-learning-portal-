import { Brain, Cpu } from 'lucide-react'
import MentorChat from '../components/mentor/MentorChat'

export default function Mentor() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-5rem)] animate-fade-in gap-3">
      {/* Header */}
      <div className="card-cyber flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center flex-shrink-0"
                 style={{ boxShadow: '0 0 12px rgba(0,229,255,0.15)' }}>
              <Brain size={15} className="text-cyber-cyan" />
            </div>
            <div>
              <div className="text-[9px] tracking-[0.25em] text-cyber-cyan/60 font-hud">NEURAL INTERFACE v2.0</div>
              <div className="text-sm font-bold text-slate-200 font-hud tracking-wider">AI TRADING MENTOR</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 bg-bg-elevated px-2.5 py-1.5 rounded border border-border-dim font-hud tracking-wider">
            <Cpu size={10} className="text-cyber-cyan/50" />
            CLAUDE AI
          </div>
        </div>
        <p className="text-[10px] text-slate-600 mt-2 font-mono leading-relaxed">
          EUR/USD specialist — trade reviews, strategy analysis, psychology coaching, and prop firm guidance.
        </p>
      </div>

      {/* Chat */}
      <div className="flex-1 card-cyber min-h-0 flex flex-col">
        <MentorChat />
      </div>
    </div>
  )
}
