import { useEffect, useState } from 'react'
import { BookMarked, Plus, Bot, Calendar, Smile, Frown, Meh, ChevronDown, ChevronUp, Brain } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useTradeStore } from '../store/useTradeStore'

interface JournalEntry {
  id: number
  date: string
  market_analysis: string
  trade_plan: string
  emotions_before: string
  emotions_after: string
  lessons_learned: string
  ai_feedback: string
  mood_rating: number
  confidence_rating: number
  discipline_rating: number
  direction?: string
  pnl?: number
}

const EMOTIONS = ['Calm', 'Confident', 'Anxious', 'Greedy', 'Fearful', 'Impatient', 'Disciplined', 'Overconfident', 'Frustrated', 'Focused']

export default function Journal() {
  const { recentTrades, setRecentTrades } = useTradeStore()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    trade_id: '',
    market_analysis: '',
    trade_plan: '',
    emotions_before: [] as string[],
    emotions_after: [] as string[],
    lessons_learned: '',
    mood_rating: 5,
    confidence_rating: 5,
    discipline_rating: 5,
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [journalRes, tradesRes] = await Promise.all([
      axios.get('/api/journal').catch(() => ({ data: [] })),
      axios.get('/api/trades').catch(() => ({ data: [] })),
    ])
    setEntries(journalRes.data)
    setRecentTrades(tradesRes.data)
  }

  const toggleEmotion = (emotion: string, phase: 'before' | 'after') => {
    const key = phase === 'before' ? 'emotions_before' : 'emotions_after'
    setForm((prev) => {
      const current = prev[key] as string[]
      return { ...prev, [key]: current.includes(emotion) ? current.filter((e) => e !== emotion) : [...current, emotion] }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post('/api/journal', {
        ...form,
        trade_id: form.trade_id ? parseInt(form.trade_id) : null,
        emotions_before: form.emotions_before.join(', '),
        emotions_after: form.emotions_after.join(', '),
      })
      toast.success('Journal saved! AI feedback generated.')
      setShowForm(false)
      setForm({ trade_id: '', market_analysis: '', trade_plan: '', emotions_before: [], emotions_after: [], lessons_learned: '', mood_rating: 5, confidence_rating: 5, discipline_rating: 5 })
      loadData()
    } catch {
      toast.error('Failed to save journal entry')
    } finally {
      setSubmitting(false)
    }
  }

  const moodIcon = (r: number) => r >= 7
    ? <Smile size={13} className="text-bull" style={{ filter: 'drop-shadow(0 0 4px #00ff88)' }} />
    : r >= 4 ? <Meh size={13} className="text-gold" /> : <Frown size={13} className="text-bear" />

  const closedTrades = recentTrades.filter((t) => t.status !== 'open')

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked size={14} className="text-gold" style={{ filter: 'drop-shadow(0 0 6px #ffd700)' }} />
          <h1 className="text-sm font-bold tracking-widest text-slate-200 font-hud">TRADE JOURNAL — PSYCH LOG</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-[9px] tracking-widest font-hud flex items-center gap-1.5 py-1.5 px-3">
          <Plus size={11} />
          NEW ENTRY
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-cyber space-y-4 animate-fade-in border-cyber-cyan/20">
          <div className="flex items-center gap-2 mb-1">
            <BookMarked size={12} className="text-cyber-cyan" />
            <span className="panel-title">NEW LOG ENTRY</span>
          </div>

          <div>
            <label className="hud-label mb-1 block">LINK TO TRADE (OPTIONAL)</label>
            <select className="input-field text-xs" value={form.trade_id} onChange={(e) => setForm({ ...form, trade_id: e.target.value })}>
              <option value="">— NOT LINKED —</option>
              {closedTrades.slice(0, 10).map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.id} {t.direction?.toUpperCase()} — {t.pnl !== undefined ? `$${t.pnl.toFixed(2)}` : 'Open'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="hud-label mb-1 block">MARKET ANALYSIS</label>
            <textarea className="textarea-field text-xs" rows={3} value={form.market_analysis}
              onChange={(e) => setForm({ ...form, market_analysis: e.target.value })}
              placeholder="Market structure, key levels, trend direction..." />
          </div>

          <div>
            <label className="hud-label mb-1 block">TRADE PLAN</label>
            <textarea className="textarea-field text-xs" rows={3} value={form.trade_plan}
              onChange={(e) => setForm({ ...form, trade_plan: e.target.value })}
              placeholder="Entry reason, stop placement, target, risk..." />
          </div>

          <div>
            <label className="hud-label mb-2 block">EMOTIONS — PRE-TRADE</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOTIONS.map((e) => (
                <button key={e} type="button" onClick={() => toggleEmotion(e, 'before')}
                  className={`text-[9px] font-hud tracking-wider px-2 py-1 rounded border transition-all ${
                    form.emotions_before.includes(e)
                      ? 'bg-cyber-cyan/15 border-cyber-cyan/50 text-cyber-cyan'
                      : 'border-border-dim text-slate-500 hover:border-border hover:text-slate-400'
                  }`}>
                  {e.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="hud-label mb-2 block">EMOTIONS — POST-TRADE</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOTIONS.map((e) => (
                <button key={e} type="button" onClick={() => toggleEmotion(e, 'after')}
                  className={`text-[9px] font-hud tracking-wider px-2 py-1 rounded border transition-all ${
                    form.emotions_after.includes(e)
                      ? 'bg-gold/15 border-gold/50 text-gold'
                      : 'border-border-dim text-slate-500 hover:border-border hover:text-slate-400'
                  }`}>
                  {e.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'mood_rating', label: 'MOOD' },
              { key: 'confidence_rating', label: 'CONFIDENCE' },
              { key: 'discipline_rating', label: 'DISCIPLINE' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="hud-label mb-1 block">{label}: {(form as any)[key]}/10</label>
                <input type="range" min="1" max="10" value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value) })}
                  className="w-full accent-cyber-cyan" />
              </div>
            ))}
          </div>

          <div>
            <label className="hud-label mb-1 block">LESSONS LEARNED</label>
            <textarea className="textarea-field text-xs" rows={2} value={form.lessons_learned}
              onChange={(e) => setForm({ ...form, lessons_learned: e.target.value })}
              placeholder="What did you learn? What would you do differently?" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary flex-1 text-[9px] tracking-widest font-hud">
              {submitting ? 'SAVING & ANALYZING...' : 'SAVE + GET AI FEEDBACK'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-[9px] tracking-widest font-hud">CANCEL</button>
          </div>
        </form>
      )}

      {/* Entries */}
      <div className="space-y-2">
        {entries.length === 0 && !showForm && (
          <div className="text-center py-12">
            <BookMarked size={32} className="text-slate-700 mx-auto mb-3" />
            <div className="hud-label mb-1">NO LOG ENTRIES</div>
            <p className="text-xs text-slate-600 font-mono">Start logging your trades and psychological state.</p>
          </div>
        )}

        {entries.map((entry) => {
          const isExpanded = expandedId === entry.id
          return (
            <div key={entry.id} className="card-cyber transition-all">
              <button className="w-full flex items-center justify-between gap-4 text-left"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}>
                <div className="flex items-center gap-3">
                  <Calendar size={11} className="text-slate-600 flex-shrink-0" />
                  <span className="text-[10px] font-bold tracking-wider text-slate-300 font-hud">{entry.date}</span>
                  {entry.pnl !== null && entry.pnl !== undefined && (
                    <span className={`text-xs font-mono font-bold tabular-nums ${entry.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {entry.pnl >= 0 ? '+' : ''}${entry.pnl.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {entry.mood_rating && moodIcon(entry.mood_rating)}
                  <div className="flex gap-1">
                    {['mood_rating', 'confidence_rating', 'discipline_rating'].map((k) => (
                      <div key={k} className="w-1 rounded-full" style={{
                        height: 14,
                        backgroundColor: (entry as any)[k] >= 7 ? '#00ff88' : (entry as any)[k] >= 4 ? '#ffd700' : '#ff3355',
                        opacity: 0.7,
                      }} />
                    ))}
                  </div>
                  {isExpanded ? <ChevronUp size={12} className="text-slate-600" /> : <ChevronDown size={12} className="text-slate-600" />}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-3 space-y-3 border-t border-border-dim pt-3 animate-fade-in">
                  {entry.market_analysis && (
                    <div>
                      <div className="hud-label mb-1">MARKET ANALYSIS</div>
                      <p className="text-xs text-slate-400 font-mono leading-relaxed">{entry.market_analysis}</p>
                    </div>
                  )}
                  {entry.emotions_before && (
                    <div>
                      <div className="hud-label mb-1.5">EMOTIONS — BEFORE</div>
                      <div className="flex flex-wrap gap-1">
                        {entry.emotions_before.split(', ').map((e) => (
                          <span key={e} className="tag tag-blue text-[9px]">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {entry.emotions_after && (
                    <div>
                      <div className="hud-label mb-1.5">EMOTIONS — AFTER</div>
                      <div className="flex flex-wrap gap-1">
                        {entry.emotions_after.split(', ').map((e) => (
                          <span key={e} className="tag tag-gold text-[9px]">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {entry.lessons_learned && (
                    <div>
                      <div className="hud-label mb-1">LESSONS LEARNED</div>
                      <p className="text-xs text-slate-400 font-mono leading-relaxed">{entry.lessons_learned}</p>
                    </div>
                  )}
                  {entry.ai_feedback && (
                    <div className="bg-cyber-cyan/5 border border-cyber-cyan/15 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain size={11} className="text-cyber-cyan" style={{ filter: 'drop-shadow(0 0 4px #00e5ff)' }} />
                        <span className="hud-label text-cyber-cyan/80">AI MENTOR FEEDBACK</span>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono">{entry.ai_feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
