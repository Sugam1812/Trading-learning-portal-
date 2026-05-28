import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useTradeStore } from '../store/useTradeStore'
import axios from 'axios'
import { TrendingUp, TrendingDown, Target, Shield, Zap, BarChart2 } from 'lucide-react'

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

  // Equity curve
  const equityCurve = (() => {
    let balance = 10000
    return closedTrades.slice().reverse().map((t, i) => {
      balance += t.pnl || 0
      return { trade: i + 1, equity: parseFloat(balance.toFixed(2)) }
    })
  })()

  // Daily P&L
  const dailyPnL = closedTrades.reduce((acc: Record<string, number>, t) => {
    const day = t.opened_at?.split('T')[0] || t.closed_at?.split('T')[0] || 'Unknown'
    acc[day] = (acc[day] || 0) + (t.pnl || 0)
    return acc
  }, {})
  const dailyData = Object.entries(dailyPnL).map(([date, pnl]) => ({
    date: date.slice(5),
    pnl: parseFloat(pnl.toFixed(2)),
  })).slice(-14)

  // Win/loss by session
  const sessionData = closedTrades.reduce((acc: Record<string, { wins: number; losses: number }>, t) => {
    const s = t.session || 'Unknown'
    if (!acc[s]) acc[s] = { wins: 0, losses: 0 }
    if ((t.pnl || 0) > 0) acc[s].wins++
    else acc[s].losses++
    return acc
  }, {})
  const sessionChart = Object.entries(sessionData).map(([session, { wins, losses }]) => ({ session: session.split(' ')[0], wins, losses }))

  // Strategy breakdown
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
    { name: 'Wins', value: stats?.wins || 0, color: '#00d4aa' },
    { name: 'Losses', value: stats?.losses || 0, color: '#ff4757' },
  ]

  const metricCards = [
    { label: 'Win Rate', value: `${stats?.win_rate || 0}%`, good: (stats?.win_rate || 0) >= 50, icon: Target },
    { label: 'Profit Factor', value: (stats?.profit_factor || 0).toFixed(2), good: (stats?.profit_factor || 0) >= 1.5, icon: TrendingUp },
    { label: 'Avg R:R', value: `1:${(stats?.avg_rr || 0).toFixed(2)}`, good: (stats?.avg_rr || 0) >= 1.5, icon: Shield },
    { label: 'Max Drawdown', value: `$${(stats?.max_drawdown || 0).toFixed(0)}`, good: (stats?.max_drawdown || 0) < 500, icon: TrendingDown, invert: true },
    { label: 'Avg Win', value: `$${(stats?.avg_win || 0).toFixed(0)}`, good: true, icon: Zap },
    { label: 'Total Trades', value: `${stats?.total || 0}`, good: true, icon: BarChart2 },
  ]

  if (!stats || stats.total === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart2 size={40} className="text-slate-600 mx-auto mb-3" />
          <h3 className="text-slate-300 font-semibold mb-1">No Trade Data Yet</h3>
          <p className="text-slate-500 text-sm">Complete some trades in the Simulator to see your analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Performance Analytics</h1>
        <div className={`text-sm font-bold ${(stats.total_pnl || 0) >= 0 ? 'text-bull' : 'text-bear'}`}>
          Total P&L: {(stats.total_pnl || 0) >= 0 ? '+' : ''}${(stats.total_pnl || 0).toFixed(2)}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricCards.map(({ label, value, good, icon: Icon, invert }) => (
          <div key={label} className="stat-card text-center">
            <Icon size={14} className={`mx-auto mb-1 ${(invert ? !good : good) ? 'text-bull' : 'text-bear'}`} />
            <div className="text-[10px] text-slate-500">{label}</div>
            <div className={`text-sm font-bold font-mono ${(invert ? !good : good) ? 'text-bull' : 'text-bear'}`}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Equity Curve */}
        <div className="lg:col-span-2 card">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Equity Curve</h3>
          {equityCurve.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={equityCurve}>
                <defs>
                  <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4d" />
                <XAxis dataKey="trade" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <Tooltip
                  contentStyle={{ background: '#0f1629', border: '1px solid #1e2d4d', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Equity']}
                />
                <Area type="monotone" dataKey="equity" stroke="#3b82f6" fill="url(#equity)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">Need more trades to show equity curve</div>
          )}
        </div>

        {/* Win/Loss Pie */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Win / Loss Split</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid #1e2d4d', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-around text-center mt-2">
            <div>
              <div className="text-bull text-lg font-bold">{stats.wins}</div>
              <div className="text-[10px] text-slate-500">Wins</div>
            </div>
            <div>
              <div className="text-bear text-lg font-bold">{stats.losses}</div>
              <div className="text-[10px] text-slate-500">Losses</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily P&L */}
        {dailyData.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Daily P&L (Last 14 Days)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4d" />
                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#0f1629', border: '1px solid #1e2d4d', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, 'P&L']}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}
                  fill="#3b82f6"
                  label={false}
                >
                  {dailyData.map((entry, i) => (
                    <Cell key={i} fill={entry.pnl >= 0 ? '#00d4aa' : '#ff4757'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Strategy P&L */}
        {strategyChart.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">P&L by Strategy</h3>
            <div className="space-y-2">
              {strategyChart.slice(0, 6).map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="text-xs text-slate-400 w-24 truncate">{s.name}</div>
                  <div className="flex-1 h-5 bg-bg-elevated rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${Math.min(100, Math.abs(s.pnl) / Math.max(...strategyChart.map((x) => Math.abs(x.pnl))) * 100)}%`,
                        backgroundColor: s.pnl >= 0 ? '#00d4aa' : '#ff4757',
                      }}
                    />
                  </div>
                  <div className={`text-xs font-mono w-16 text-right ${s.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {s.pnl >= 0 ? '+' : ''}${s.pnl.toFixed(0)}
                  </div>
                  <div className="text-[10px] text-slate-600 w-8">{s.count}x</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Pattern Analysis */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200">AI Mistake Pattern Analysis</h3>
          <button
            onClick={loadPatterns}
            disabled={loadingPatterns}
            className="btn-ghost text-xs"
          >
            {loadingPatterns ? 'Analyzing...' : 'Analyze My Patterns'}
          </button>
        </div>
        {patterns ? (
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-bg-elevated p-4 rounded-lg border border-border-dim">
            {patterns}
          </div>
        ) : (
          <div className="text-sm text-slate-500 text-center py-4">
            Click "Analyze My Patterns" to get AI-powered insights on your trading mistakes and patterns.
          </div>
        )}
      </div>
    </div>
  )
}
