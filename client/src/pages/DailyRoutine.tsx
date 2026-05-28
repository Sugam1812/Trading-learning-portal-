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
  const [form, setForm] = useState({ market_analysis: '', trade_plan: '', post_review: '' })
  const [activeSection, setActiveSection] = useState<'pre' | 'post'>('pre')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios.get('/api/progress/daily-routine').then((r) => {
      setRoutine(r.data || {})
      setForm({ market_analysis: r.data?.market_analysis || '', trade_plan: r.data?.trade_plan || '', post_review: r.data?.post_review || '' })
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
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="card-cyber relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent" />
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={12} className="text-cyber-cyan" />
              <span className="panel-title">DAILY TRADING ROUTINE</span>
            </div>
            <p className="text-[9px] text-slate-600 font-mono">{today.toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-2">
            {routine.pre_market_done && (
              <span className="flex items-center gap-1 text-[9px] text-bull bg-bull/10 px-2 py-1 rounded border border-bull/20 font-hud tracking-wider">
                <CheckCircle size={9} />
                PRE-MKT DONE
              </span>
            )}
            {routine.post_review_done && (
              <span className="flex items-center gap-1 text-[9px] text-gold bg-gold/10 px-2 py-1 rounded border border-gold/20 font-hud tracking-wider">
                <CheckCircle size={9} />
                REVIEW DONE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Session Status */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { name: 'LONDON', open: isLondonOpen, time: '08:00–17:00 UTC', glow: '#00e5ff' },
          { name: 'OVERLAP', open: isOverlap, time: '13:00–17:00 UTC', highlight: true, glow: '#00ff88' },
          { name: 'NEW YORK', open: isNYOpen, time: '13:00–22:00 UTC', glow: '#00e5ff' },
        ].map(({ name, open, time, highlight, glow }) => (
          <div key={name} className={`card-cyber text-center py-3 ${highlight && open ? 'border-bull/40' : ''}`}
               style={highlight && open ? { boxShadow: '0 0 16px rgba(0,255,136,0.08)' } : {}}>
            <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${open ? 'animate-pulse-fast' : ''}`}
                 style={{ backgroundColor: open ? glow : '#334155', boxShadow: open ? `0 0 6px ${glow}` : 'none' }} />
            <div className="text-[9px] font-bold tracking-wider text-slate-300 font-hud">{name}</div>
            <div className="text-[8px] text-slate-600 font-mono mt-0.5">{time}</div>
            <div className={`text-[9px] font-bold font-hud tracking-wider mt-1 ${open ? 'text-bull' : 'text-slate-700'}`}
                 style={open ? { textShadow: '0 0 6px rgba(0,255,136,0.3)' } : {}}>
              {open ? 'OPEN' : 'CLOSED'}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border border-border-dim rounded-lg overflow-hidden">
        {(['pre', 'post'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveSection(t)}
            className={`flex-1 py-2.5 text-[9px] font-bold tracking-widest flex items-center justify-center gap-2 transition-all font-hud ${
              activeSection === t
                ? 'bg-cyber-cyan/10 text-cyber-cyan border-r border-border-dim'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t === 'pre' ? <Sun size={12} /> : <Moon size={12} />}
            {t === 'pre' ? 'PRE-MARKET ANALYSIS' : 'POST-TRADE REVIEW'}
          </button>
        ))}
      </div>

      {activeSection === 'pre' && (
        <div className="space-y-3 animate-fade-in">
          {/* Checklist */}
          <div className="card-cyber">
            <div className="panel-header">
              <CheckCircle size={12} className="text-bull" />
              <span className="panel-title">PRE-MARKET CHECKLIST</span>
            </div>
            <div className="space-y-2">
              {PRE_MARKET_CHECKLIST.map(({ id, label }) => (
                <label key={id} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                      checklist[id] ? 'bg-bull/20 border-bull/60' : 'border-border-dim group-hover:border-bull/30'
                    }`}
                    onClick={() => setChecklist((p) => ({ ...p, [id]: !p[id] }))}
                  >
                    {checklist[id] && <span className="text-[8px] text-bull font-bold">✓</span>}
                  </div>
                  <span className={`text-[10px] font-hud tracking-wider ${checklist[id] ? 'text-slate-600 line-through' : 'text-slate-400'}`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* News Events */}
          <div className="card-cyber">
            <div className="panel-header">
              <AlertCircle size={12} className="text-bear" />
              <span className="panel-title">KEY NEWS EVENTS (TYPICAL)</span>
            </div>
            <div className="space-y-1.5">
              {NEWS_EVENTS.map((event) => (
                <div key={event.name} className="flex items-center gap-3 p-2 rounded bg-bg-elevated border border-border-dim">
                  <Clock size={10} className="text-slate-600 flex-shrink-0" />
                  <span className="text-[9px] font-mono text-slate-500 w-20">{event.time}</span>
                  <span className="text-[10px] text-slate-300 flex-1 font-hud tracking-wider">{event.name.toUpperCase()}</span>
                  <span className={`tag text-[8px] tracking-wider ${event.impact === 'high' ? 'tag-bear' : 'tag-gold'}`}>
                    {event.impact.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[8px] text-slate-700 mt-2 font-mono">* Check ForexFactory.com for actual today's events.</p>
          </div>

          {/* Analysis Form */}
          <div className="card-cyber">
            <div className="panel-header">
              <TrendingUp size={12} className="text-cyber-cyan" />
              <span className="panel-title">MARKET ANALYSIS & TRADE PLAN</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="hud-label mb-1 block">EUR/USD ANALYSIS</label>
                <textarea className="textarea-field text-xs" rows={4} value={form.market_analysis}
                  onChange={(e) => setForm({ ...form, market_analysis: e.target.value })}
                  placeholder="Daily bias: Bullish/Bearish&#10;Key levels:&#10;Structure:&#10;Session plan:" />
              </div>
              <div>
                <label className="hud-label mb-1 block">TRADE PLAN</label>
                <textarea className="textarea-field text-xs" rows={3} value={form.trade_plan}
                  onChange={(e) => setForm({ ...form, trade_plan: e.target.value })}
                  placeholder="I will look for... setups at... with SL at... targeting..." />
              </div>
              <button
                onClick={() => handleSave('pre')}
                disabled={saving || (!form.market_analysis && !form.trade_plan)}
                className="btn-primary w-full flex items-center justify-center gap-2 text-[9px] tracking-widest font-hud"
              >
                <CheckCircle size={12} />
                {saving ? 'SAVING...' : 'SAVE PRE-MARKET ROUTINE (+10 XP)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'post' && (
        <div className="space-y-3 animate-fade-in">
          <div className="card-cyber">
            <div className="panel-header">
              <FileText size={12} className="text-gold" />
              <span className="panel-title">POST-TRADE REVIEW</span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Did I follow my trade plan?',
                  'Did I respect my stop losses?',
                  'Did I revenge trade or FOMO?',
                  'Was my position sizing correct?',
                ].map((q) => (
                  <div key={q} className="flex items-start gap-2 p-2 bg-bg-elevated rounded border border-border-dim">
                    <div className="w-3.5 h-3.5 rounded border border-border-dim flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer hover:border-cyber-cyan/30" />
                    <span className="text-[9px] text-slate-500 font-mono leading-relaxed">{q}</span>
                  </div>
                ))}
              </div>
              <div>
                <label className="hud-label mb-1 block">POST-TRADE REFLECTION</label>
                <textarea className="textarea-field text-xs" rows={5} value={form.post_review}
                  onChange={(e) => setForm({ ...form, post_review: e.target.value })}
                  placeholder="What went well today?&#10;What went wrong?&#10;What will I do differently tomorrow?&#10;Key lessons:" />
              </div>
              <button
                onClick={() => handleSave('post')}
                disabled={saving || !form.post_review}
                className="btn-primary w-full flex items-center justify-center gap-2 text-[9px] tracking-widest font-hud"
              >
                <Moon size={12} />
                {saving ? 'SAVING...' : 'SAVE POST-REVIEW (+15 XP)'}
              </button>
            </div>
          </div>

          {routine.market_analysis && (
            <div className="card-cyber border-gold/20" style={{ boxShadow: '0 0 8px rgba(255,215,0,0.04)' }}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={11} className="text-gold" />
                <span className="hud-label text-gold/80">TODAY'S EARLIER ANALYSIS</span>
              </div>
              <p className="text-[10px] text-slate-500 whitespace-pre-line font-mono leading-relaxed">{routine.market_analysis}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
