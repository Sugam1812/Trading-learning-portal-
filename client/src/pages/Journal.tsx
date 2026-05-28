import { useEffect, useState } from 'react'
import { BookMarked, Plus, Bot, Calendar, Smile, Frown, Meh, ChevronDown, ChevronUp } from 'lucide-react'
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

  useEffect(() => {
    loadData()
  }, [])

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
      return {
        ...prev,
        [key]: current.includes(emotion) ? current.filter((e) => e !== emotion) : [...current, emotion],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await axios.post('/api/journal', {
        ...form,
        trade_id: form.trade_id ? parseInt(form.trade_id) : null,
        emotions_before: form.emotions_before.join(', '),
        emotions_after: form.emotions_after.join(', '),
      })
      toast.success('Journal saved! AI feedback generated.', { duration: 3000 })
      setShowForm(false)
      setForm({
        trade_id: '', market_analysis: '', trade_plan: '',
        emotions_before: [], emotions_after: [], lessons_learned: '',
        mood_rating: 5, confidence_rating: 5, discipline_rating: 5,
      })
      loadData()
    } catch {
      toast.error('Failed to save journal entry')
    } finally {
      setSubmitting(false)
    }
  }

  const moodIcon = (rating: number) => {
    if (rating >= 7) return <Smile size={14} className="text-bull" />
    if (rating >= 4) return <Meh size={14} className="text-gold" />
    return <Frown size={14} className="text-bear" />
  }

  const closedTrades = recentTrades.filter((t) => t.status !== 'open')

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookMarked size={20} className="text-gold" />
            Trading Journal
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Log trades, emotions, and lessons. Get AI feedback.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} />
          New Entry
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-5 animate-fade-in border-accent-blue/30">
          <h3 className="text-base font-semibold text-slate-100">New Journal Entry</h3>

          {/* Link to trade */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Link to Trade (Optional)</label>
            <select className="input-field" value={form.trade_id} onChange={(e) => setForm({ ...form, trade_id: e.target.value })}>
              <option value="">— Not linked to a trade —</option>
              {closedTrades.slice(0, 10).map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.id} {t.direction?.toUpperCase()} — {t.pnl !== undefined ? `$${t.pnl.toFixed(2)}` : 'Open'}
                </option>
              ))}
            </select>
          </div>

          {/* Market Analysis */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Market Analysis (What did you see?)</label>
            <textarea
              className="textarea-field"
              rows={3}
              value={form.market_analysis}
              onChange={(e) => setForm({ ...form, market_analysis: e.target.value })}
              placeholder="Describe the market structure, key levels, trend direction..."
            />
          </div>

          {/* Trade Plan */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Trade Plan (What was your plan?)</label>
            <textarea
              className="textarea-field"
              rows={3}
              value={form.trade_plan}
              onChange={(e) => setForm({ ...form, trade_plan: e.target.value })}
              placeholder="Entry reason, stop placement, target, risk per trade..."
            />
          </div>

          {/* Emotions Before */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Emotions Before Trading</label>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleEmotion(e, 'before')}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    form.emotions_before.includes(e)
                      ? 'bg-accent-blue/20 border-accent-blue text-accent-blue'
                      : 'border-border-dim text-slate-400 hover:border-border'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Emotions After */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Emotions After Trading</label>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleEmotion(e, 'after')}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    form.emotions_after.includes(e)
                      ? 'bg-gold/20 border-gold text-gold'
                      : 'border-border-dim text-slate-400 hover:border-border'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'mood_rating', label: 'Mood' },
              { key: 'confidence_rating', label: 'Confidence' },
              { key: 'discipline_rating', label: 'Discipline' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-slate-400 mb-1 block">{label}: {(form as any)[key]}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value) })}
                  className="w-full accent-accent-blue"
                />
              </div>
            ))}
          </div>

          {/* Lessons Learned */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Lessons Learned</label>
            <textarea
              className="textarea-field"
              rows={2}
              value={form.lessons_learned}
              onChange={(e) => setForm({ ...form, lessons_learned: e.target.value })}
              placeholder="What did you learn? What would you do differently?"
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Saving & Analyzing...' : 'Save + Get AI Feedback'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Entries */}
      <div className="space-y-3">
        {entries.length === 0 && !showForm && (
          <div className="text-center py-12 text-slate-500">
            <BookMarked size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No journal entries yet. Start logging your trades!</p>
          </div>
        )}

        {entries.map((entry) => {
          const isExpanded = expandedId === entry.id
          return (
            <div key={entry.id} className="card border border-border-dim hover:border-border transition-colors">
              <button
                className="w-full flex items-center justify-between gap-4 text-left"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                <div className="flex items-center gap-3">
                  <Calendar size={13} className="text-slate-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-200">{entry.date}</span>
                  {entry.pnl !== null && entry.pnl !== undefined && (
                    <span className={`text-xs font-mono font-bold ${entry.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {entry.pnl >= 0 ? '+' : ''}${entry.pnl.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {entry.mood_rating && moodIcon(entry.mood_rating)}
                  <div className="flex gap-1.5">
                    {['mood_rating', 'confidence_rating', 'discipline_rating'].map((k) => (
                      <div
                        key={k}
                        className="w-1.5 rounded-full"
                        style={{
                          height: 16,
                          backgroundColor: (entry as any)[k] >= 7 ? '#00d4aa' : (entry as any)[k] >= 4 ? '#f59e0b' : '#ff4757',
                          opacity: 0.8,
                        }}
                      />
                    ))}
                  </div>
                  {isExpanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 space-y-4 border-t border-border-dim pt-4 animate-fade-in">
                  {entry.market_analysis && (
                    <div>
                      <div className="text-xs font-semibold text-slate-400 mb-1">Market Analysis</div>
                      <p className="text-sm text-slate-300">{entry.market_analysis}</p>
                    </div>
                  )}
                  {entry.emotions_before && (
                    <div>
                      <div className="text-xs font-semibold text-slate-400 mb-1">Emotions Before</div>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.emotions_before.split(', ').map((e) => (
                          <span key={e} className="tag tag-blue">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {entry.emotions_after && (
                    <div>
                      <div className="text-xs font-semibold text-slate-400 mb-1">Emotions After</div>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.emotions_after.split(', ').map((e) => (
                          <span key={e} className="tag tag-gold">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {entry.lessons_learned && (
                    <div>
                      <div className="text-xs font-semibold text-slate-400 mb-1">Lessons Learned</div>
                      <p className="text-sm text-slate-300">{entry.lessons_learned}</p>
                    </div>
                  )}
                  {entry.ai_feedback && (
                    <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot size={13} className="text-accent-blue" />
                        <span className="text-xs font-semibold text-accent-blue">AI Mentor Feedback</span>
                      </div>
                      <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{entry.ai_feedback}</p>
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
