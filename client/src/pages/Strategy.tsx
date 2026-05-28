import { useState, useEffect } from 'react'
import { Settings2, Play, Plus, TrendingUp, TrendingDown, BarChart2, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Strategy {
  id: number
  name: string
  description: string
  entry_rules: string
  exit_rules: string
  backtest_results?: string
  created_at: string
}

interface BacktestResult {
  total_trades: number
  wins: number
  losses: number
  win_rate: number
  total_pnl: number
  profit_percent: number
  max_drawdown: number
  profit_factor: number
  avg_rr: number
  equity_curve: Array<{ time: number; equity: number }>
}

const ENTRY_TYPES = [
  { value: 'ma_cross', label: 'MA Crossover' },
  { value: 'rsi', label: 'RSI Overbought/Oversold' },
  { value: 'breakout', label: 'Price Breakout' },
]

export default function Strategy() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [showForm, setShowForm] = useState(false)
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [runningId, setRunningId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '', description: '', entry_type: 'ma_cross',
    ma_period: 20, rsi_period: 14, rsi_oversold: 30, rsi_overbought: 70,
    risk_percent: 1, stop_loss_pips: 20, take_profit_pips: 40,
  })

  useEffect(() => {
    axios.get('/api/strategy').then((r) => setStrategies(r.data)).catch(() => {})
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return toast.error('Strategy name required')
    const entry_rules = { entry_type: form.entry_type, ma_period: form.ma_period, rsi_period: form.rsi_period, rsi_oversold: form.rsi_oversold, rsi_overbought: form.rsi_overbought, risk_percent: form.risk_percent }
    const exit_rules = { stop_loss_pips: form.stop_loss_pips, take_profit_pips: form.take_profit_pips }
    try {
      await axios.post('/api/strategy', { name: form.name, description: form.description, entry_rules, exit_rules })
      toast.success('Strategy saved!')
      setShowForm(false)
      const updated = await axios.get('/api/strategy')
      setStrategies(updated.data)
    } catch {
      toast.error('Failed to save strategy')
    }
  }

  const runBacktest = async (id: number) => {
    setRunningId(id)
    setBacktestResult(null)
    try {
      const res = await axios.post(`/api/strategy/${id}/backtest`)
      setBacktestResult(res.data)
      toast.success('Backtest complete!')
    } catch {
      toast.error('Backtest failed')
    } finally {
      setRunningId(null)
    }
  }

  const equityChartData = backtestResult?.equity_curve.map((p, i) => ({ t: i, equity: p.equity })) || []

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 size={14} className="text-cyber-cyan" />
          <h1 className="text-sm font-bold tracking-widest text-slate-200 font-hud">STRATEGY LAB — BACKTEST ENGINE</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-[9px] tracking-widest font-hud flex items-center gap-1.5 py-1.5 px-3">
          <Plus size={11} />
          NEW STRATEGY
        </button>
      </div>
      <p className="text-[10px] text-slate-600 font-mono -mt-2">Build and backtest EUR/USD strategies on 500 simulated candles.</p>

      {/* Build Form */}
      {showForm && (
        <form onSubmit={handleSave} className="card-cyber space-y-4 animate-fade-in border-cyber-cyan/20">
          <div className="flex items-center gap-2 mb-1">
            <Settings2 size={12} className="text-cyber-cyan" />
            <span className="panel-title">BUILD NEW STRATEGY</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="hud-label mb-1 block">STRATEGY NAME</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My EUR/USD Strategy" />
            </div>
            <div>
              <label className="hud-label mb-1 block">ENTRY TYPE</label>
              <select className="input-field" value={form.entry_type} onChange={(e) => setForm({ ...form, entry_type: e.target.value })}>
                {ENTRY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {form.entry_type === 'ma_cross' && (
            <div>
              <label className="hud-label mb-1 block">MA PERIOD</label>
              <input className="input-field w-32" type="number" min={5} max={200} value={form.ma_period} onChange={(e) => setForm({ ...form, ma_period: parseInt(e.target.value) })} />
            </div>
          )}
          {form.entry_type === 'rsi' && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'rsi_period', label: 'RSI PERIOD' },
                { key: 'rsi_oversold', label: 'OVERSOLD' },
                { key: 'rsi_overbought', label: 'OVERBOUGHT' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="hud-label mb-1 block">{label}</label>
                  <input className="input-field" type="number" value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value) })} />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'risk_percent', label: 'RISK %', step: '0.1', float: true },
              { key: 'stop_loss_pips', label: 'SL PIPS' },
              { key: 'take_profit_pips', label: 'TP PIPS' },
            ].map(({ key, label, step, float }) => (
              <div key={key}>
                <label className="hud-label mb-1 block">{label}</label>
                <input className="input-field" type="number" step={step || '1'} value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: float ? parseFloat(e.target.value) : parseInt(e.target.value) })} />
              </div>
            ))}
          </div>

          <div>
            <label className="hud-label mb-1 block">DESCRIPTION (OPTIONAL)</label>
            <textarea className="textarea-field text-xs" rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe when and why you'd use this strategy..." />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-[9px] tracking-widest font-hud py-1.5 px-4">SAVE STRATEGY</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-[9px] tracking-widest font-hud py-1.5 px-4">CANCEL</button>
          </div>
        </form>
      )}

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {strategies.length === 0 && !showForm && (
          <div className="col-span-2 text-center py-12">
            <Settings2 size={32} className="text-slate-700 mx-auto mb-3" />
            <div className="hud-label mb-1">NO STRATEGIES</div>
            <p className="text-xs text-slate-600 font-mono">Build your first EUR/USD strategy above.</p>
          </div>
        )}

        {strategies.map((s) => {
          const entry = JSON.parse(s.entry_rules || '{}')
          const exit = JSON.parse(s.exit_rules || '{}')
          const bt = s.backtest_results ? JSON.parse(s.backtest_results) : null

          return (
            <div key={s.id} className="card-cyber space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-bold tracking-wider text-slate-200 font-hud">{s.name.toUpperCase()}</div>
                  {s.description && <div className="text-[9px] text-slate-600 font-mono mt-0.5">{s.description}</div>}
                </div>
                <button
                  onClick={() => runBacktest(s.id)}
                  disabled={runningId === s.id}
                  className="btn-primary text-[9px] tracking-widest font-hud flex items-center gap-1 py-1 px-2.5"
                >
                  <Play size={9} />
                  {runningId === s.id ? 'RUNNING...' : 'BACKTEST'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-bg-elevated rounded p-2 border border-border-dim">
                  <div className="hud-label mb-1">ENTRY</div>
                  <div className="text-[10px] text-slate-300 font-bold font-hud">
                    {ENTRY_TYPES.find((t) => t.value === entry.entry_type)?.label || entry.entry_type}
                  </div>
                  {entry.ma_period && <div className="text-[9px] text-slate-600 font-mono">MA({entry.ma_period})</div>}
                  {entry.rsi_period && <div className="text-[9px] text-slate-600 font-mono">RSI({entry.rsi_period})</div>}
                </div>
                <div className="bg-bg-elevated rounded p-2 border border-border-dim">
                  <div className="hud-label mb-1">EXIT</div>
                  <div className="text-[9px] text-bear font-mono">SL: {exit.stop_loss_pips}p</div>
                  <div className="text-[9px] text-bull font-mono">TP: {exit.take_profit_pips}p</div>
                  <div className="text-[9px] text-slate-400 font-mono">R:R {(exit.take_profit_pips / exit.stop_loss_pips).toFixed(1)}:1</div>
                </div>
              </div>

              {bt && (
                <div className="border-t border-border-dim pt-3">
                  <div className="hud-label mb-2">LAST BACKTEST</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { l: 'TRADES', v: bt.total_trades, color: 'text-slate-300' },
                      { l: 'WIN RATE', v: `${bt.win_rate}%`, color: bt.win_rate >= 50 ? 'text-bull' : 'text-bear' },
                      { l: 'P&L', v: `${bt.total_pnl >= 0 ? '+' : ''}$${bt.total_pnl?.toFixed(0)}`, color: bt.total_pnl >= 0 ? 'text-bull' : 'text-bear' },
                      { l: 'PROF FACTOR', v: bt.profit_factor, color: bt.profit_factor >= 1.5 ? 'text-bull' : 'text-bear' },
                      { l: 'MAX DD', v: `$${bt.max_drawdown?.toFixed(0)}`, color: bt.max_drawdown > 2000 ? 'text-bear' : 'text-gold' },
                      { l: 'RETURN', v: `${bt.profit_percent >= 0 ? '+' : ''}${bt.profit_percent}%`, color: bt.profit_percent >= 0 ? 'text-bull' : 'text-bear' },
                    ].map(({ l, v, color }) => (
                      <div key={l} className="bg-bg-primary rounded p-1.5 border border-border-dim">
                        <div className="hud-label" style={{ fontSize: 8 }}>{l}</div>
                        <div className={`text-[10px] font-mono font-bold ${color}`}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Backtest equity curve */}
      {backtestResult && equityChartData.length > 1 && (
        <div className="card-cyber animate-fade-in">
          <div className="panel-header">
            <Activity size={12} className="text-cyber-cyan" />
            <span className="panel-title">BACKTEST EQUITY CURVE — {backtestResult.total_trades} TRADES</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={equityChartData}>
              <defs>
                <linearGradient id="bt-equity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={backtestResult.total_pnl >= 0 ? '#00ff88' : '#ff3355'} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={backtestResult.total_pnl >= 0 ? '#00ff88' : '#ff3355'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#0d2850" />
              <XAxis dataKey="t" stroke="#1a3a5c" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'monospace' }} />
              <YAxis stroke="#1a3a5c" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'monospace' }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip contentStyle={{ background: '#040e1c', border: '1px solid #0d2850', borderRadius: 6, fontSize: 11, color: '#94a3b8' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Equity']} />
              <Area type="monotone" dataKey="equity" stroke={backtestResult.total_pnl >= 0 ? '#00ff88' : '#ff3355'} fill="url(#bt-equity)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
