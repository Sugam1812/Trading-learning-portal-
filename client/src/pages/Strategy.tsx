import { useState, useEffect } from 'react'
import { Settings2, Play, Plus, TrendingUp, TrendingDown, BarChart2, Trash2 } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
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
    name: '',
    description: '',
    entry_type: 'ma_cross',
    ma_period: 20,
    rsi_period: 14,
    rsi_oversold: 30,
    rsi_overbought: 70,
    risk_percent: 1,
    stop_loss_pips: 20,
    take_profit_pips: 40,
  })

  useEffect(() => {
    axios.get('/api/strategy').then((r) => setStrategies(r.data)).catch(() => {})
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return toast.error('Strategy name required')

    const entry_rules = {
      entry_type: form.entry_type,
      ma_period: form.ma_period,
      rsi_period: form.rsi_period,
      rsi_oversold: form.rsi_oversold,
      rsi_overbought: form.rsi_overbought,
      risk_percent: form.risk_percent,
    }
    const exit_rules = {
      stop_loss_pips: form.stop_loss_pips,
      take_profit_pips: form.take_profit_pips,
    }

    try {
      const res = await axios.post('/api/strategy', {
        name: form.name,
        description: form.description,
        entry_rules,
        exit_rules,
      })
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

  const equityChartData = backtestResult?.equity_curve.map((p, i) => ({
    t: i,
    equity: p.equity,
  })) || []

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings2 size={20} className="text-accent-blue" />
            Strategy Lab
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Build and backtest EUR/USD trading strategies on 500 simulated candles.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} />
          New Strategy
        </button>
      </div>

      {/* Build Form */}
      {showForm && (
        <form onSubmit={handleSave} className="card space-y-4 border-accent-blue/30 animate-fade-in">
          <h3 className="text-sm font-semibold text-slate-200">Build New Strategy</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Strategy Name</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My EUR/USD Strategy" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Entry Type</label>
              <select className="input-field" value={form.entry_type} onChange={(e) => setForm({ ...form, entry_type: e.target.value })}>
                {ENTRY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {form.entry_type === 'ma_cross' && (
            <div>
              <label className="text-xs text-slate-400 mb-1 block">MA Period</label>
              <input className="input-field w-32" type="number" min={5} max={200} value={form.ma_period} onChange={(e) => setForm({ ...form, ma_period: parseInt(e.target.value) })} />
            </div>
          )}

          {form.entry_type === 'rsi' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">RSI Period</label>
                <input className="input-field" type="number" value={form.rsi_period} onChange={(e) => setForm({ ...form, rsi_period: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Oversold</label>
                <input className="input-field" type="number" value={form.rsi_oversold} onChange={(e) => setForm({ ...form, rsi_oversold: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Overbought</label>
                <input className="input-field" type="number" value={form.rsi_overbought} onChange={(e) => setForm({ ...form, rsi_overbought: parseInt(e.target.value) })} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Risk %</label>
              <input className="input-field" type="number" step="0.1" value={form.risk_percent} onChange={(e) => setForm({ ...form, risk_percent: parseFloat(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">SL Pips</label>
              <input className="input-field" type="number" value={form.stop_loss_pips} onChange={(e) => setForm({ ...form, stop_loss_pips: parseInt(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">TP Pips</label>
              <input className="input-field" type="number" value={form.take_profit_pips} onChange={(e) => setForm({ ...form, take_profit_pips: parseInt(e.target.value) })} />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description (Optional)</label>
            <textarea className="textarea-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe when and why you'd use this strategy..." />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm">Save Strategy</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Strategy List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {strategies.length === 0 && !showForm && (
          <div className="col-span-2 text-center py-12 text-slate-500">
            <Settings2 size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No strategies yet. Create your first EUR/USD strategy above.</p>
          </div>
        )}

        {strategies.map((s) => {
          const entry = JSON.parse(s.entry_rules || '{}')
          const exit = JSON.parse(s.exit_rules || '{}')
          const bt = s.backtest_results ? JSON.parse(s.backtest_results) : null

          return (
            <div key={s.id} className="card space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-100">{s.name}</div>
                  {s.description && <div className="text-xs text-slate-500 mt-0.5">{s.description}</div>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => runBacktest(s.id)}
                    disabled={runningId === s.id}
                    className="flex items-center gap-1 text-xs btn-primary py-1 px-2.5"
                  >
                    <Play size={11} />
                    {runningId === s.id ? 'Running...' : 'Backtest'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-bg-elevated rounded-lg p-2 border border-border-dim">
                  <div className="text-slate-500 mb-1">Entry</div>
                  <div className="text-slate-300 font-semibold">
                    {ENTRY_TYPES.find((t) => t.value === entry.entry_type)?.label || entry.entry_type}
                  </div>
                  {entry.ma_period && <div className="text-slate-500">MA({entry.ma_period})</div>}
                  {entry.rsi_period && <div className="text-slate-500">RSI({entry.rsi_period})</div>}
                </div>
                <div className="bg-bg-elevated rounded-lg p-2 border border-border-dim">
                  <div className="text-slate-500 mb-1">Exit</div>
                  <div className="text-bear">SL: {exit.stop_loss_pips} pips</div>
                  <div className="text-bull">TP: {exit.take_profit_pips} pips</div>
                  <div className="text-slate-400">R:R {(exit.take_profit_pips / exit.stop_loss_pips).toFixed(1)}:1</div>
                </div>
              </div>

              {bt && (
                <div className="border-t border-border-dim pt-3 space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Last Backtest Results</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { l: 'Trades', v: bt.total_trades },
                      { l: 'Win Rate', v: `${bt.win_rate}%`, color: bt.win_rate >= 50 ? 'text-bull' : 'text-bear' },
                      { l: 'P&L', v: `${bt.total_pnl >= 0 ? '+' : ''}$${bt.total_pnl?.toFixed(0)}`, color: bt.total_pnl >= 0 ? 'text-bull' : 'text-bear' },
                      { l: 'Profit Factor', v: bt.profit_factor, color: bt.profit_factor >= 1.5 ? 'text-bull' : 'text-bear' },
                      { l: 'Max DD', v: `$${bt.max_drawdown?.toFixed(0)}`, color: bt.max_drawdown > 2000 ? 'text-bear' : 'text-gold' },
                      { l: 'Return', v: `${bt.profit_percent >= 0 ? '+' : ''}${bt.profit_percent}%`, color: bt.profit_percent >= 0 ? 'text-bull' : 'text-bear' },
                    ].map(({ l, v, color }) => (
                      <div key={l} className="bg-bg-primary rounded p-1.5">
                        <div className="text-slate-600 text-[10px]">{l}</div>
                        <div className={`font-mono font-bold ${color || 'text-slate-300'}`}>{v}</div>
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
        <div className="card animate-fade-in">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Backtest Equity Curve ({backtestResult.total_trades} trades)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={equityChartData}>
              <defs>
                <linearGradient id="bt-equity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={backtestResult.total_pnl >= 0 ? '#00d4aa' : '#ff4757'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={backtestResult.total_pnl >= 0 ? '#00d4aa' : '#ff4757'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4d" />
              <XAxis dataKey="t" stroke="#475569" tick={{ fontSize: 10 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip
                contentStyle={{ background: '#0f1629', border: '1px solid #1e2d4d', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, 'Equity']}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke={backtestResult.total_pnl >= 0 ? '#00d4aa' : '#ff4757'}
                fill="url(#bt-equity)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
