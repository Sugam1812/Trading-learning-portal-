import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useTradeStore } from '../store/useTradeStore'
import axios from 'axios'
import { TrendingUp, TrendingDown, Target, Shield, Zap, BarChart2, Brain, Activity } from 'lucide-react'

const CHART_STYLE = {
  contentStyle: { background: '#040e1c', border: '1px solid #0d2850', borderRadius: 6, fontSize: 11, color: '#94a3b8' },
}

export default function Analytics() {
  const { stats, setStats, recentTrades, setRecentTrades } = useTradeStore()
  const [patterns, setPatterns] = useState<string>('')
  const [loadingPatterns, setLoadingPatterns] = useState(false)

  useEffect(() => {
    axios.get('/api/trades/stats').then((r) => setStats(r.data)).catch(() => {})
    axios.get('/api/trades').then((r) => setRecentTrades(r.data)).catch(() => {})
  }, [])

  const loadPatterns = async () => {
    setLoadingPatterns(true)
    try {
      const res = await axios.get('/api/journal/patterns')
      setPatterns(res.data.analysis)
    } catch {
      setPatterns('Unable to load pattern analysis.')
    } finally {
      setLoadingPatterns(false)
    }
  }

  const closedTrades = recentTrades.filter((t) => t.status !== 'open')

  const equityCurve = (() => {
    let balance = 10000
    return closedTrades.slice().reverse().map((t, i) => {
      balance += t.pnl || 0
      return { trade: i + 1, equity: parseFloat(balance.toFixed(2)) }
    })
  })()

  const dailyPnL = closedTrades.reduce((acc: Record<string, number>, t) => {
    const day = t.opened_at?.split('T')[0] || t.closed_at?.split('T')[0] || 'Unknown'
    acc[day] = (acc[day] || 0) + (t.pnl || 0)
    return acc
  }, {})
  const dailyData = Object.entries(dailyPnL).map(([date, pnl]) => ({
    date: date.slice(5),
    pnl: parseFloat((pnl as number).toFixed(2)),
  })).slice(-14)

  const sessionData = closedTrades.reduce((acc: Record<string, { wins: number; losses: number }>, t) => {
    const s = t.session || 'Unknown'
    if (!acc[s]) acc[s] = { wins: 0, losses: 0 }
    if ((t.pnl || 0) > 0) acc[s].wins++
    else acc[s].losses++
    return acc
  }, {})

  const strategyData = closedTrades.reduce((acc: Record<string, { pnl: number; count: number }>, t) => {
    const s = t.strategy || 'Other'
    if (!acc[s]) acc[s] = { pnl: 0, count: 0 }
    acc[s].pnl += t.pnl || 0
    acc[s].count++
    return acc
  }, {})
  const strategyChart = Object.entries(strategyData).map(([name, { pnl, count }]) => ({
    name, pnl: parseFloat(pnl.toFixed(2)), count
  })).sort((a, b) => b.pnl - a.pnl)

  const pieData = [
    { name: 'Wins', value: stats?.wins || 0, color: '#00ff88' },
    { name: 'Losses', value: stats?.losses || 0, color: '#ff3355' },
  ]

  const metricCards = [
    { label: 'WIN RATE', value: `${stats?.win_rate || 0}%`, good: (stats?.win_rate || 0) >= 50, icon: Target, glow: '#00e5ff' },
    { label: 'PROFIT FACTOR', value: (stats?.profit_factor || 0).toFixed(2), good: (stats?.profit_factor || 0) >= 1.5, icon: TrendingUp, glow: '#00ff88' },
    { label: 'AVG R:R', value: `1:${(stats?.avg_rr || 0).toFixed(2)}`, good: (stats?.avg_rr || 0) >= 1.5, icon: Shield, glow: '#00e5ff' },
    { label: 'MAX DRAWDOWN', value: `$${(stats?.max_drawdown || 0).toFixed(0)}`, good: (stats?.max_drawdown || 0) < 500, icon: TrendingDown, glow: '#ff3355', invert: true },
    { label: 'AVG WIN', value: `$${(stats?.avg_win || 0).toFixed(0)}`, good: true, icon: Zap, glow: '#8b5cf6' },
    { label: 'TOTAL TRADES', value: `${stats?.total || 0}`, good: true, icon: BarChart2, glow: '#00e5ff' },
  ]

  if (!stats || stats.total === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity size={36} className="text-cyber-cyan/20 mx-auto mb-3" style={{ filter: 'drop-shadow(0 0 8px #00e5ff)' }} />
          <div className="text-[9px] tracking-[0.25em] text-slate-600 font-hud mb-2">NO DATA STREAM</div>
          <p className="text-slate-500 text-xs font-mono">Execute trades in the Simulator to populate analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 size={14} className="text-cyber-cyan" />
          <h1 className="text-sm font-bold tracking-widest text-slate-200 font-hud">ANALYTICS — PERFORMANCE MATRIX</h1>
        </div>
        <div className={`text-sm font-bold font-mono ${(stats.total_pnl || 0) >= 0 ? 'text-bull' : 'text-bear'}`}
             style={{ textShadow: (stats.total_pnl || 0) >= 0 ? '0 0 8px rgba(0,255,136,0.3)' : '0 0 8px rgba(255,51,85,0.3)' }}>
          {(stats.total_pnl || 0) >= 0 ? '+' : ''}${(stats.total_pnl || 0).toFixed(2)} TOTAL P&L
        </div>
      </div>

      {/* Metric Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {metricCards.map(({ label, value, good, icon: Icon, glow, invert }) => {
          const isGood = invert ? !good : good
          return (
            <div key={label} className="card-cyber text-center py-3">
              <Icon size={12} className="mx-auto mb-1.5" style={{ color: isGood ? '#00ff88' : '#ff3355', filter: `drop-shadow(0 0 4px ${isGood ? '#00ff88' : '#ff3355'})` }} />
              <div className="hud-label mb-1">{label}</div>
              <div className="text-sm font-bold font-mono tabular-nums"
                   style={{ color: isGood ? '#00ff88' : '#ff3355', textShadow: `0 0 8px ${isGood ? 'rgba(0,255,136,0.3)' : 'rgba(255,51,85,0.3)'}` }}>
                {value}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Equity Curve */}
        <div className="lg:col-span-2 card-cyber">
          <div className="panel-header">
            <Activity size={12} className="text-cyber-cyan" />
            <span className="panel-title">EQUITY CURVE</span>
          </div>
          {equityCurve.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={equityCurve}>
                <defs>
                  <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0d2850" />
                <XAxis dataKey="trade" stroke="#1a3a5c" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'monospace' }} />
                <YAxis stroke="#1a3a5c" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'monospace' }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <Tooltip {...CHART_STYLE} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Equity']} />
                <Area type="monotone" dataKey="equity" stroke="#00e5ff" fill="url(#equity)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-600 text-xs font-mono">INSUFFICIENT DATA — NEED MORE TRADES</div>
          )}
        </div>

        {/* Win/Loss Pie */}
        <div className="card-cyber">
          <div className="panel-header">
            <Target size={12} className="text-cyber-cyan" />
            <span className="panel-title">WIN / LOSS SPLIT</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={4} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 4px ${entry.color})` }} />
                ))}
              </Pie>
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: '#64748b' }} />
              <Tooltip {...CHART_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-around text-center mt-1">
            <div>
              <div className="text-bull text-lg font-bold font-mono" style={{ textShadow: '0 0 8px rgba(0,255,136,0.3)' }}>{stats.wins}</div>
              <div className="hud-label">WINS</div>
            </div>
            <div className="w-px bg-border-dim" />
            <div>
              <div className="text-bear text-lg font-bold font-mono" style={{ textShadow: '0 0 8px rgba(255,51,85,0.3)' }}>{stats.losses}</div>
              <div className="hud-label">LOSSES</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Daily P&L */}
        {dailyData.length > 0 && (
          <div className="card-cyber">
            <div className="panel-header">
              <TrendingUp size={12} className="text-cyber-cyan" />
              <span className="panel-title">DAILY P&L — LAST 14 DAYS</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0d2850" />
                <XAxis dataKey="date" stroke="#1a3a5c" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'monospace' }} />
                <YAxis stroke="#1a3a5c" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'monospace' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip {...CHART_STYLE} formatter={(v: number) => [`$${v.toFixed(2)}`, 'P&L']} />
                <Bar dataKey="pnl" radius={[2, 2, 0, 0]}>
                  {dailyData.map((entry, i) => (
                    <Cell key={i} fill={entry.pnl >= 0 ? '#00ff88' : '#ff3355'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Strategy Breakdown */}
        {strategyChart.length > 0 && (
          <div className="card-cyber">
            <div className="panel-header">
              <Shield size={12} className="text-cyber-cyan" />
              <span className="panel-title">P&L BY STRATEGY</span>
            </div>
            <div className="space-y-2 mt-2">
              {strategyChart.slice(0, 6).map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="text-[9px] text-slate-500 w-20 truncate font-mono">{s.name}</div>
                  <div className="flex-1 h-4 bg-bg-elevated rounded overflow-hidden border border-border-dim">
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${Math.min(100, Math.abs(s.pnl) / Math.max(...strategyChart.map((x) => Math.abs(x.pnl))) * 100)}%`,
                        backgroundColor: s.pnl >= 0 ? '#00ff88' : '#ff3355',
                        boxShadow: s.pnl >= 0 ? '0 0 4px rgba(0,255,136,0.3)' : '0 0 4px rgba(255,51,85,0.3)',
                      }}
                    />
                  </div>
                  <div className={`text-[10px] font-mono w-14 text-right tabular-nums ${s.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {s.pnl >= 0 ? '+' : ''}${s.pnl.toFixed(0)}
                  </div>
                  <div className="text-[9px] text-slate-700 w-6 font-mono">{s.count}x</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Pattern Analysis */}
      <div className="card-cyber">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain size={12} className="text-xp" />
            <span className="panel-title">AI MISTAKE PATTERN ANALYSIS</span>
          </div>
          <button
            onClick={loadPatterns}
            disabled={loadingPatterns}
            className="btn-purple text-[9px] tracking-widest font-hud py-1.5 px-3"
          >
            {loadingPatterns ? 'ANALYZING...' : 'RUN ANALYSIS'}
          </button>
        </div>
        {patterns ? (
          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-bg-elevated p-4 rounded-lg border border-border-dim font-mono">
            {patterns}
          </div>
        ) : (
          <div className="text-xs text-slate-600 text-center py-6 font-mono">
            AWAITING COMMAND — CLICK "RUN ANALYSIS" TO GENERATE AI INSIGHTS
          </div>
        )}
      </div>
    </div>
  )
}
