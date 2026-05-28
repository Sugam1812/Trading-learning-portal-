import { useState, useEffect } from 'react'
import { Calendar, Sun, Moon, CheckCircle, Clock, AlertCircle, TrendingUp, BookOpen, FileText } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const NEWS_EVENTS = [
  { time: '08:30 UTC', name: 'EUR Economic Data', impact: 'high' },
  { time: '12:30 UTC', name: 'USD CPI / PPI', impact: 'high' },
  { time: '13:30 UTC', name: 'US Economic Data', impact: 'medium' },
  { time: '15:00 UTC', name: 'FOMC / Fed Speakers', impact: 'high' },
]

const PRE_MARKET_CHECKLIST = [
  { id: 'daily_bias', label: 'Check Daily chart bias (bullish / bearish)' },
  { id: 'h4_structure', label: 'Identify H4 market structure' },
  { id: 'key_levels', label: 'Mark key support/resistance levels' },
  { id: 'news_check', label: 'Check high-impact news for today (ForexFactory)' },
  { id: 'prev_day', label: 'Note Previous Day High, Low, Close' },
  { id: 'session_plan', label: 'Plan which session to trade (London/NY)' },
]

export default function DailyRoutine() {
  const [routine, setRoutine] = useState<any>({})
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState({
    market_analysis: '',
    trade_plan: '',
    post_review: '',
  })
  const [activeSection, setActiveSection] = useState<'pre' | 'post'>('pre')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios.get('/api/progress/daily-routine').then((r) => {
      setRoutine(r.data || {})
      setForm({
        market_analysis: r.data?.market_analysis || '',
        trade_plan: r.data?.trade_plan || '',
        post_review: r.data?.post_review || '',
      })
    }).catch(() => {})
  }, [])

  const handleSave = async (type: 'pre' | 'post') => {
    setSaving(true)
    try {
      const body = type === 'pre'
        ? { pre_market_done: true, market_analysis: form.market_analysis, trade_plan: form.trade_plan }
        : { post_review_done: true, post_review: form.post_review }

      await axios.post('/api/progress/daily-routine', body)
      toast.success(type === 'pre' ? 'Pre-market routine saved! +10 XP' : 'Post-trade review saved! +15 XP')
      const r = await axios.get('/api/progress/daily-routine')
      setRoutine(r.data || {})
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const utcHour = new Date().getUTCHours()
  const isLondonOpen = utcHour >= 8 && utcHour < 17
  const isNYOpen = utcHour >= 13 && utcHour < 22
  const isOverlap = utcHour >= 13 && utcHour < 17

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card bg-gradient-to-r from-accent-blue/10 to-transparent border-accent-blue/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Calendar size={20} className="text-accent-blue" />
              Daily Trading Routine
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-2">
            {routine.pre_market_done && (
              <span className="flex items-center gap-1 text-xs text-bull bg-bull/10 px-2 py-1 rounded-full border border-bull/20">
                <CheckCircle size={10} />
                Pre-Market Done
              </span>
            )}
            {routine.post_review_done && (
              <span className="flex items-center gap-1 text-xs text-gold bg-gold/10 px-2 py-1 rounded-full border border-gold/20">
                <CheckCircle size={10} />
                Review Done
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Session Status */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { name: 'London Session', open: isLondonOpen, time: '08:00-17:00 UTC' },
          { name: 'NY/London Overlap', open: isOverlap, time: '13:00-17:00 UTC', highlight: true },
          { name: 'New York Session', open: isNYOpen, time: '13:00-22:00 UTC' },
        ].map(({ name, open, time, highlight }) => (
          <div key={name} className={`card text-center py-3 ${highlight && open ? 'border-bull/40 bg-bull/5' : ''}`}>
            <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${open ? 'bg-bull animate-pulse' : 'bg-slate-600'}`} />
            <div className="text-xs font-semibold text-slate-200">{name}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{time}</div>
            <div className={`text-[10px] font-semibold mt-1 ${open ? 'text-bull' : 'text-slate-600'}`}>
              {open ? 'OPEN' : 'CLOSED'}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border border-border-dim rounded-xl overflow-hidden">
        {(['pre', 'post'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveSection(t)}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeSection === t ? 'bg-accent-blue/20 text-accent-blue' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'pre' ? <Sun size={15} /> : <Moon size={15} />}
            {t === 'pre' ? 'Pre-Market Analysis' : 'Post-Trade Review'}
          </button>
        ))}
      </div>

      {activeSection === 'pre' && (
        <div className="space-y-4 animate-fade-in">
          {/* Checklist */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <CheckCircle size={14} className="text-bull" />
              Pre-Market Checklist
            </h3>
            <div className="space-y-2">
              {PRE_MARKET_CHECKLIST.map(({ id, label }) => (
                <label key={id} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                      checklist[id] ? 'bg-bull border-bull' : 'border-border group-hover:border-bull/50'
                    }`}
                    onClick={() => setChecklist((p) => ({ ...p, [id]: !p[id] }))}
                  >
                    {checklist[id] && <span className="text-[10px] text-bg-primary font-bold">✓</span>}
                  </div>
                  <span className={`text-sm ${checklist[id] ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* News Events */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <AlertCircle size={14} className="text-bear" />
              Today's Key News Events (Typical)
            </h3>
            <div className="space-y-2">
              {NEWS_EVENTS.map((event) => (
                <div key={event.name} className="flex items-center gap-3 p-2 rounded-lg bg-bg-elevated">
                  <Clock size={12} className="text-slate-500 flex-shrink-0" />
                  <span className="text-xs font-mono text-slate-400 w-24">{event.time}</span>
                  <span className="text-xs text-slate-300 flex-1">{event.name}</span>
                  <span className={`text-[10px] tag ${event.impact === 'high' ? 'tag-bear' : 'tag-gold'}`}>
                    {event.impact}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-2">
              * Always check ForexFactory.com for actual today's scheduled events.
            </p>
          </div>

          {/* Market Analysis */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-accent-blue" />
              Market Analysis & Trade Plan
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Today's EUR/USD Analysis</label>
                <textarea
                  className="textarea-field"
                  rows={4}
                  value={form.market_analysis}
                  onChange={(e) => setForm({ ...form, market_analysis: e.target.value })}
                  placeholder="Daily bias: Bullish/Bearish&#10;Key levels: &#10;Structure: &#10;Session plan:"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Trade Plan for Today</label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  value={form.trade_plan}
                  onChange={(e) => setForm({ ...form, trade_plan: e.target.value })}
                  placeholder="I will look for... setups at... with SL at... targeting..."
                />
              </div>
              <button
                onClick={() => handleSave('pre')}
                disabled={saving || (!form.market_analysis && !form.trade_plan)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <CheckCircle size={14} />
                {saving ? 'Saving...' : 'Save Pre-Market Routine (+10 XP)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'post' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <FileText size={14} className="text-gold" />
              Post-Trade Review
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  'Did I follow my trade plan?',
                  'Did I respect my stop losses?',
                  'Did I revenge trade or FOMO?',
                  'Was my position sizing correct?',
                ].map((q) => (
                  <div key={q} className="flex items-start gap-2 p-2 bg-bg-elevated rounded-lg">
                    <div className="w-4 h-4 rounded border border-border flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer hover:border-bull/50" />
                    <span className="text-slate-400">{q}</span>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Post-Trade Reflection</label>
                <textarea
                  className="textarea-field"
                  rows={5}
                  value={form.post_review}
                  onChange={(e) => setForm({ ...form, post_review: e.target.value })}
                  placeholder="What went well today?&#10;What went wrong?&#10;What will I do differently tomorrow?&#10;Key lessons:"
                />
              </div>
              <button
                onClick={() => handleSave('post')}
                disabled={saving || !form.post_review}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Moon size={14} />
                {saving ? 'Saving...' : 'Save Post-Review (+15 XP)'}
              </button>
            </div>
          </div>

          {/* Previous routine */}
          {routine.market_analysis && (
            <div className="card border-gold/20 bg-gold/5">
              <h3 className="text-xs font-semibold text-gold mb-2 flex items-center gap-1.5">
                <BookOpen size={12} />
                Today's Earlier Analysis
              </h3>
              <p className="text-xs text-slate-400 whitespace-pre-line">{routine.market_analysis}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
