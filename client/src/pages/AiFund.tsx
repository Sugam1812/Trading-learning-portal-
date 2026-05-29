import { useEffect, useRef, useState } from 'react'
import {
  Activity, Cpu, TrendingUp, TrendingDown, AlertTriangle,
  Play, Square, Zap, Brain, Shield, BarChart3, RefreshCw,
  ChevronRight, Circle, Wifi, WifiOff, Database, MessageSquare
} from 'lucide-react'
import { useAiFundStore, AgentLog } from '../store/useAiFundStore'

const AGENT_COLORS: Record<string, string> = {
  TechnicalAgent:   '#00e5ff',
  SentimentAgent:   '#a855f7',
  RiskAgent:        '#f59e0b',
  PortfolioManager: '#22c55e',
  ReflectionAgent:  '#f472b6',
}

const AGENT_ICONS: Record<string, typeof Activity> = {
  TechnicalAgent:   BarChart3,
  SentimentAgent:   Brain,
  RiskAgent:        Shield,
  PortfolioManager: Cpu,
  ReflectionAgent:  RefreshCw,
}

const STATUS_COLOR: Record<string, string> = {
  idle:       '#334155',
  analyzing:  '#00e5ff',
  validating: '#f59e0b',
  executing:  '#22c55e',
  reflecting: '#f472b6',
  signal:     '#22c55e',
  warning:    '#f59e0b',
  critical:   '#ef4444',
  info:       '#64748b',
}

interface MemoryEntry {
  id: number
  agent_name: string
  memory_type: string
  content: string
  importance: number
  symbol?: string
  created_at: string
}

interface DebateCycle {
  symbol: string
  timestamp: string
  entries: AgentLog[]
}

function AgentCard({ name, status }: { name: string; status: string }) {
  const color = AGENT_COLORS[name] || '#00e5ff'
  const sColor = STATUS_COLOR[status] || STATUS_COLOR.idle
  const Icon = AGENT_ICONS[name] || Activity
  const isActive = status !== 'idle'

  return (
    <div
      className="relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-300"
      style={{
        borderColor: isActive ? color + '60' : '#1e293b',
        background: isActive ? color + '08' : '#0a1628',
        boxShadow: isActive ? `0 0 20px ${color}20` : 'none',
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: color + '15', border: `1px solid ${color}40` }}
      >
        <Icon size={14} style={{ color }} />
      </div>
      <div className="text-center">
        <div className="text-[8px] font-bold tracking-widest font-hud text-slate-400">
          {name.replace('Agent', '').toUpperCase()}
        </div>
        <div className="text-[8px] font-hud mt-0.5" style={{ color: sColor }}>
          {status.toUpperCase()}
        </div>
      </div>
      {isActive && (
        <div
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: sColor }}
        />
      )}
    </div>
  )
}

function LogLevel({ level }: { level: string }) {
  const c = STATUS_COLOR[level] || STATUS_COLOR.info
  return (
    <span
      className="text-[8px] font-bold tracking-wider font-hud px-1.5 py-0.5 rounded"
      style={{ color: c, background: c + '20', border: `1px solid ${c}40` }}
    >
      {level.toUpperCase()}
    </span>
  )
}

function SparkLine({ data, height = 48 }: {
  data: { time: string; balance: number }[]
  height?: number
}) {
  if (data.length < 2) return (
    <div className="flex items-center justify-center text-[8px] font-hud text-slate-700"
         style={{ height }}>
      ACCUMULATING DATA...
    </div>
  )
  const balances = data.map(d => d.balance)
  const min = Math.min(...balances)
  const max = Math.max(...balances)
  const range = max - min || 1
  const isUp = balances[balances.length - 1] >= balances[0]
  const lineColor = isUp ? '#22c55e' : '#ef4444'
  const w = 100
  const h = height
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((d.balance - min) / range) * (h - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const pathD = `M${pts.join(' L')}`
  const fillD = `${pathD} L${w},${h} L0,${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#sg)" />
      <path d={pathD} fill="none" stroke={lineColor} strokeWidth="1.5"
            style={{ filter: `drop-shadow(0 0 3px ${lineColor})` }} />
    </svg>
  )
}

function groupDebateCycles(logs: AgentLog[]): DebateCycle[] {
  const cycles: DebateCycle[] = []
  const chrono = [...logs].reverse()
  let current: DebateCycle | null = null

  for (const log of chrono) {
    if (log.agent === 'TechnicalAgent' && log.level === 'signal' && log.symbol) {
      if (current) cycles.push(current)
      current = { symbol: log.symbol, timestamp: log.timestamp, entries: [log] }
    } else if (current) {
      if (!log.symbol || log.symbol === current.symbol) {
        current.entries.push(log)
      } else if (log.agent === 'TechnicalAgent' && log.level === 'signal') {
        cycles.push(current)
        current = { symbol: log.symbol, timestamp: log.timestamp, entries: [log] }
      }
    }
  }
  if (current) cycles.push(current)
  return cycles.reverse().slice(0, 20)
}

export default function AiFund() {
  const {
    wsConnected, wsError, isRunning,
    balance, initialBalance, totalPnl, totalPnlPct, dailyPnl, drawdownPct, peakBalance,
    openTrades, closedTrades, agentStatus, agentLogs, tickers, balanceHistory,
    connect, disconnect, startFund, stopFund, clearLogs,
  } = useAiFundStore()

  const [activeTab, setActiveTab] = useState<'positions' | 'history' | 'memory'>('positions')
  const [logFilter, setLogFilter] = useState<string>('all')
  const [debateMode, setDebateMode] = useState(false)
  const [memoryEntries, setMemoryEntries] = useState<MemoryEntry[]>([])
  const logRef = useRef<HTMLDivElement>(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    connect()
    fetchMemory()
    return () => disconnect()
  }, [])

  useEffect(() => {
    if (closedTrades.length > 0) fetchMemory()
  }, [closedTrades.length])

  const fetchMemory = async () => {
    try {
      const res = await fetch('http://localhost:8000/memory?limit=30')
      if (res.ok) setMemoryEntries(await res.json())
    } catch {}
  }

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0
  }, [agentLogs.length])

  const handleToggle = async () => {
    setStarting(true)
    try {
      if (isRunning) await stopFund()
      else await startFund()
    } finally {
      setStarting(false)
    }
  }

  const pnlColor = totalPnl >= 0 ? '#22c55e' : '#ef4444'
  const dailyPnlColor = dailyPnl >= 0 ? '#22c55e' : '#ef4444'
  const btc = tickers['BTC/USDT']
  const eth = tickers['ETH/USDT']

  const filteredLogs = logFilter === 'all'
    ? agentLogs
    : agentLogs.filter(l => l.level === logFilter || l.agent === logFilter)

  const debateCycles = groupDebateCycles(agentLogs)

  return (
    <div className="flex flex-col h-full bg-bg-primary" style={{ minHeight: '100vh' }}>
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
           style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.5) 2px, rgba(0,229,255,0.5) 4px)' }} />

      {/* ─── TOP CONTROL BAR ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-slate-800/50"
           style={{ background: 'linear-gradient(90deg, #020f20 0%, #030d1a 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: '#00e5ff10', border: '1px solid #00e5ff40', boxShadow: '0 0 20px #00e5ff20' }}>
            <Activity size={18} className="text-cyber-cyan" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-[0.25em] text-cyber-cyan font-hud"
                 style={{ textShadow: '0 0 20px #00e5ff80' }}>
              HERMES AI FUND
            </div>
            <div className="text-[9px] tracking-widest text-slate-600 font-hud">
              AUTONOMOUS PAPER TRADING SYSTEM v2.0
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {btc && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800"
                 style={{ background: '#0a1628' }}>
              <span className="text-[9px] text-slate-500 font-hud tracking-wider">BTC/USDT</span>
              <span className="text-xs font-bold font-mono text-slate-200">${btc.price.toLocaleString()}</span>
              <span className="text-[9px] font-mono"
                    style={{ color: btc.change_pct >= 0 ? '#22c55e' : '#ef4444' }}>
                {btc.change_pct >= 0 ? '+' : ''}{btc.change_pct.toFixed(2)}%
              </span>
            </div>
          )}
          {eth && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800"
                 style={{ background: '#0a1628' }}>
              <span className="text-[9px] text-slate-500 font-hud tracking-wider">ETH/USDT</span>
              <span className="text-xs font-bold font-mono text-slate-200">${eth.price.toLocaleString()}</span>
              <span className="text-[9px] font-mono"
                    style={{ color: eth.change_pct >= 0 ? '#22c55e' : '#ef4444' }}>
                {eth.change_pct >= 0 ? '+' : ''}{eth.change_pct.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {wsConnected
              ? <Wifi size={12} className="text-cyber-cyan" />
              : <WifiOff size={12} className="text-red-500" />
            }
            <span className="text-[9px] font-hud tracking-wider"
                  style={{ color: wsConnected ? '#00e5ff' : '#ef4444' }}>
              {wsConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border"
               style={{
                 background: isRunning ? '#22c55e10' : '#0a1628',
                 borderColor: isRunning ? '#22c55e40' : '#1e293b',
               }}>
            <Circle size={6} className={isRunning ? 'animate-pulse' : ''}
                    style={{ fill: isRunning ? '#22c55e' : '#334155', color: isRunning ? '#22c55e' : '#334155' }} />
            <span className="text-[9px] font-bold tracking-widest font-hud"
                  style={{ color: isRunning ? '#22c55e' : '#475569' }}>
              {isRunning ? 'RUNNING' : 'STANDBY'}
            </span>
          </div>

          <button
            onClick={handleToggle}
            disabled={starting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs tracking-widest font-hud transition-all duration-200 disabled:opacity-50"
            style={{
              background: isRunning
                ? 'linear-gradient(135deg, #ef444420, #dc262620)'
                : 'linear-gradient(135deg, #00e5ff20, #06b6d420)',
              border: `1px solid ${isRunning ? '#ef444460' : '#00e5ff60'}`,
              color: isRunning ? '#ef4444' : '#00e5ff',
              boxShadow: isRunning ? '0 0 15px #ef444420' : '0 0 15px #00e5ff20',
            }}
          >
            {starting ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : isRunning ? (
              <Square size={12} />
            ) : (
              <Play size={12} />
            )}
            {isRunning ? 'STOP FUND' : '▶ START AI FUND'}
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden"
           style={{ maxHeight: 'calc(100vh - 68px)' }}>

        {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-y-auto">

          {/* PORTFOLIO STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {[
              { label: 'BALANCE', value: `$${balance.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#00e5ff', icon: Database },
              { label: 'TOTAL P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: pnlColor, icon: TrendingUp, sub: `${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%` },
              { label: 'DAILY P&L', value: `${dailyPnl >= 0 ? '+' : ''}$${dailyPnl.toFixed(2)}`, color: dailyPnlColor, icon: Activity },
              { label: 'DRAWDOWN', value: `${drawdownPct.toFixed(2)}%`, color: drawdownPct > 5 ? '#ef4444' : drawdownPct > 2 ? '#f59e0b' : '#22c55e', icon: TrendingDown },
              { label: 'PEAK BAL', value: `$${peakBalance.toLocaleString('en', { maximumFractionDigits: 0 })}`, color: '#a855f7', icon: Zap },
              { label: 'POSITIONS', value: String(openTrades.length), color: '#00e5ff', icon: Activity, sub: 'OPEN' },
            ].map(({ label, value, color, icon: Icon, sub }) => (
              <div key={label}
                   className="flex flex-col gap-1 p-3 rounded-xl border"
                   style={{ background: '#0a1628', borderColor: color + '30', boxShadow: `0 0 20px ${color}10` }}>
                <div className="flex items-center gap-1.5">
                  <Icon size={10} style={{ color }} />
                  <span className="text-[8px] tracking-widest font-hud" style={{ color: '#64748b' }}>{label}</span>
                </div>
                <div className="text-sm font-bold font-mono" style={{ color }}>{value}</div>
                {sub && <div className="text-[9px] font-mono" style={{ color: color + 'aa' }}>{sub}</div>}
              </div>
            ))}
          </div>

          {/* AGENT NETWORK */}
          <div className="rounded-xl border border-slate-800 p-4" style={{ background: '#070f1c' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[9px] tracking-[0.2em] text-slate-500 font-hud">AGENT NEURAL NETWORK</div>
              <div className="text-[8px] tracking-wider text-slate-600 font-hud">5 AGENTS ONLINE</div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(agentStatus).map(([name, status]) => (
                <AgentCard key={name} name={name} status={status} />
              ))}
            </div>
          </div>

          {/* TRADES PANEL */}
          <div className="flex-1 rounded-xl border border-slate-800 overflow-hidden"
               style={{ background: '#070f1c', minHeight: '200px' }}>
            <div className="flex border-b border-slate-800">
              {(['positions', 'history', 'memory'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-2 px-4 py-2.5 text-[9px] font-bold tracking-widest font-hud transition-colors border-b-2"
                  style={{
                    borderBottomColor: activeTab === tab ? '#00e5ff' : 'transparent',
                    color: activeTab === tab ? '#00e5ff' : '#475569',
                    background: activeTab === tab ? '#00e5ff08' : 'transparent',
                  }}
                >
                  {tab === 'positions' ? (
                    <><Activity size={10} />OPEN POSITIONS ({openTrades.length})</>
                  ) : tab === 'history' ? (
                    <><ChevronRight size={10} />TRADE HISTORY ({closedTrades.length})</>
                  ) : (
                    <><Brain size={10} />NEURAL MEMORY ({memoryEntries.length})</>
                  )}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
              {activeTab === 'positions' ? (
                openTrades.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-700">
                    <Activity size={24} className="mb-2 opacity-30" />
                    <div className="text-[9px] tracking-widest font-hud">NO OPEN POSITIONS</div>
                    <div className="text-[8px] text-slate-800 mt-1">
                      {isRunning ? 'AGENTS SCANNING MARKETS...' : 'START AI FUND TO BEGIN TRADING'}
                    </div>
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {['#', 'PAIR', 'DIR', 'ENTRY', 'CURRENT', 'SL', 'TP', 'LIVE P&L', 'CONF'].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[8px] font-bold tracking-wider font-hud text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {openTrades.map(trade => {
                        const tPnlColor = (trade.live_pnl ?? 0) >= 0 ? '#22c55e' : '#ef4444'
                        const dirColor = trade.direction === 'long' ? '#22c55e' : '#ef4444'
                        return (
                          <tr key={trade.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                            <td className="px-3 py-2 text-[9px] font-mono text-slate-500">#{trade.id}</td>
                            <td className="px-3 py-2">
                              <span className="text-[9px] font-bold font-hud tracking-wider text-slate-300">
                                {trade.symbol.replace('/USDT', '')}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span className="text-[8px] font-bold font-hud px-1.5 py-0.5 rounded"
                                    style={{ color: dirColor, background: dirColor + '20', border: `1px solid ${dirColor}40` }}>
                                {trade.direction.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-mono text-[9px] text-slate-400">
                              ${Number(trade.entry_price).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 font-mono text-[9px]" style={{ color: tPnlColor }}>
                              {trade.current_price ? `$${Number(trade.current_price).toLocaleString()}` : '—'}
                            </td>
                            <td className="px-3 py-2 font-mono text-[9px] text-red-500/70">
                              ${Number(trade.stop_loss).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 font-mono text-[9px] text-green-500/70">
                              ${Number(trade.take_profit).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 font-mono text-[9px] font-bold" style={{ color: tPnlColor }}>
                              {(trade.live_pnl ?? 0) >= 0 ? '+' : ''}${(trade.live_pnl ?? 0).toFixed(2)}
                              <span className="text-[8px] ml-1 opacity-70">
                                ({(trade.live_pnl_pct ?? 0) >= 0 ? '+' : ''}{(trade.live_pnl_pct ?? 0).toFixed(2)}%)
                              </span>
                              {trade.trailing_activated && (
                                <span className="ml-1 text-[7px] text-yellow-500">TRAIL</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1">
                                <div className="w-12 h-1.5 rounded-full bg-slate-800">
                                  <div className="h-full rounded-full bg-cyber-cyan"
                                       style={{ width: `${Math.min(100, (trade.confidence ?? 0) * 100)}%` }} />
                                </div>
                                <span className="text-[8px] font-mono text-slate-500">
                                  {Math.round((trade.confidence ?? 0) * 100)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )
              ) : activeTab === 'history' ? (
                closedTrades.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-700">
                    <Database size={24} className="mb-2 opacity-30" />
                    <div className="text-[9px] tracking-widest font-hud">NO TRADE HISTORY</div>
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {['#', 'PAIR', 'DIR', 'ENTRY', 'EXIT', 'P&L', 'REASON', 'CONF'].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[8px] font-bold tracking-wider font-hud text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {closedTrades.slice(0, 50).map(trade => {
                        const tPnlColor = (trade.pnl ?? 0) >= 0 ? '#22c55e' : '#ef4444'
                        const dirColor = trade.direction === 'long' ? '#22c55e' : '#ef4444'
                        const reasonColor = trade.close_reason === 'TAKE_PROFIT' ? '#22c55e' : trade.close_reason === 'STOP_LOSS' ? '#ef4444' : '#f59e0b'
                        return (
                          <tr key={trade.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                            <td className="px-3 py-2 text-[9px] font-mono text-slate-500">#{trade.id}</td>
                            <td className="px-3 py-2 text-[9px] font-bold font-hud tracking-wider text-slate-300">
                              {trade.symbol.replace('/USDT', '')}
                            </td>
                            <td className="px-3 py-2">
                              <span className="text-[8px] font-bold font-hud px-1.5 py-0.5 rounded"
                                    style={{ color: dirColor, background: dirColor + '20', border: `1px solid ${dirColor}40` }}>
                                {trade.direction.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-mono text-[9px] text-slate-400">
                              ${Number(trade.entry_price).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 font-mono text-[9px] text-slate-400">
                              {trade.exit_price ? `$${Number(trade.exit_price).toLocaleString()}` : '—'}
                            </td>
                            <td className="px-3 py-2 font-mono text-[9px] font-bold" style={{ color: tPnlColor }}>
                              {(trade.pnl ?? 0) >= 0 ? '+' : ''}${(trade.pnl ?? 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2">
                              <span className="text-[8px] font-hud font-bold"
                                    style={{ color: reasonColor }}>{trade.close_reason || '—'}</span>
                            </td>
                            <td className="px-3 py-2 font-mono text-[9px] text-slate-500">
                              {Math.round((trade.confidence ?? 0) * 100)}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )
              ) : (
                /* NEURAL MEMORY TAB */
                memoryEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-700">
                    <Brain size={24} className="mb-2 opacity-30" />
                    <div className="text-[9px] tracking-widest font-hud">NO MEMORIES YET</div>
                    <div className="text-[8px] text-slate-800 mt-1">LESSONS STORED AFTER TRADES CLOSE</div>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {memoryEntries.map(m => {
                      const mColor = AGENT_COLORS[m.agent_name] || '#64748b'
                      const importancePct = Math.round(m.importance * 100)
                      return (
                        <div key={m.id} className="p-3 rounded-lg border"
                             style={{ background: mColor + '08', borderColor: mColor + '30' }}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-bold font-hud tracking-wider"
                                    style={{ color: mColor }}>
                                {m.agent_name.replace('Agent', '').toUpperCase()}
                              </span>
                              <span className="text-[7px] font-hud text-slate-600 uppercase">{m.memory_type}</span>
                              {m.symbol && (
                                <span className="text-[7px] font-mono text-slate-700">[{m.symbol}]</span>
                              )}
                            </div>
                            <span className="text-[7px] font-mono text-slate-700">{importancePct}%</span>
                          </div>
                          <p className="text-[9px] text-slate-400 leading-relaxed"
                             style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                            {m.content.slice(0, 140)}{m.content.length > 140 ? '...' : ''}
                          </p>
                          <div className="mt-2 h-0.5 rounded-full bg-slate-800">
                            <div className="h-full rounded-full transition-all duration-500"
                                 style={{ width: `${importancePct}%`, background: mColor }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3 overflow-hidden">

          {wsError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10">
              <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
              <span className="text-[9px] text-red-400 font-hud">{wsError}</span>
            </div>
          )}

          {/* EQUITY CURVE */}
          <div className="rounded-xl border border-slate-800 p-3" style={{ background: '#070f1c' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={10} style={{ color: '#00e5ff' }} />
                <span className="text-[9px] tracking-[0.2em] font-bold font-hud text-slate-500">EQUITY CURVE</span>
              </div>
              <span className="text-[8px] font-mono" style={{ color: pnlColor }}>
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </span>
            </div>
            <SparkLine data={balanceHistory} height={48} />
            {balanceHistory.length >= 2 && (
              <div className="flex justify-between mt-1">
                <span className="text-[7px] font-mono text-slate-700">{balanceHistory[0].time}</span>
                <span className="text-[7px] font-mono text-slate-700">
                  {balanceHistory[balanceHistory.length - 1].time}
                </span>
              </div>
            )}
          </div>

          {/* AI DEBATE / TELEMETRY */}
          <div className="flex-1 rounded-xl border border-slate-800 overflow-hidden flex flex-col"
               style={{ background: '#070f1c', maxHeight: 'calc(100vh - 300px)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
                <span className="text-[9px] tracking-[0.2em] font-bold font-hud text-cyber-cyan">
                  {debateMode ? 'AI DEBATE TERMINAL' : 'AGENT TELEMETRY'}
                </span>
                <span className="text-[8px] font-mono text-slate-600">
                  {debateMode ? `${debateCycles.length} cycles` : `${agentLogs.length} entries`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDebateMode(d => !d)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[7px] font-bold tracking-wider font-hud transition-all"
                  style={{
                    color: debateMode ? '#a855f7' : '#475569',
                    background: debateMode ? '#a855f720' : 'transparent',
                    border: `1px solid ${debateMode ? '#a855f740' : '#1e293b'}`,
                  }}
                >
                  <MessageSquare size={8} />
                  {debateMode ? 'DEBATE' : 'LOG'}
                </button>
                {!debateMode && (
                  <button
                    onClick={clearLogs}
                    className="text-[8px] text-slate-600 hover:text-slate-400 font-hud tracking-wider transition-colors"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>

            {/* Filter tabs (log mode) */}
            {!debateMode && (
              <div className="flex gap-1 px-3 py-2 border-b border-slate-800 flex-wrap">
                {['all', 'signal', 'warning', 'TechnicalAgent', 'SentimentAgent', 'RiskAgent', 'PortfolioManager'].map(f => (
                  <button
                    key={f}
                    onClick={() => setLogFilter(f)}
                    className="px-2 py-0.5 rounded text-[7px] font-bold tracking-wider font-hud transition-colors"
                    style={{
                      color: logFilter === f ? '#00e5ff' : '#475569',
                      background: logFilter === f ? '#00e5ff15' : 'transparent',
                      border: `1px solid ${logFilter === f ? '#00e5ff40' : '#1e293b'}`,
                    }}
                  >
                    {f.replace('Agent', '').toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div ref={logRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
              {debateMode ? (
                debateCycles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <MessageSquare size={20} className="mb-2 opacity-20 text-slate-700" />
                    <div className="text-[9px] tracking-widest font-hud text-center text-slate-700">
                      {isRunning ? 'WAITING FOR ANALYSIS CYCLES...' : 'START AI FUND TO SEE DEBATE'}
                    </div>
                  </div>
                ) : (
                  debateCycles.map((cycle, ci) => (
                    <div key={ci} className="rounded-lg border border-slate-800 overflow-hidden mb-2"
                         style={{ background: '#0a1628', animation: 'fadeIn 0.35s ease-out' }}>
                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800"
                           style={{ background: '#060e1a' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-cyber-cyan" />
                          <span className="text-[8px] font-bold font-hud tracking-wider text-slate-400">
                            CYCLE — {cycle.symbol}
                          </span>
                        </div>
                        <span className="text-[7px] font-mono text-slate-700">{cycle.timestamp}</span>
                      </div>
                      <div className="p-2 space-y-1.5">
                        {cycle.entries.map((entry, ei) => {
                          const agentColor = AGENT_COLORS[entry.agent] || '#64748b'
                          const Icon = AGENT_ICONS[entry.agent] || Activity
                          return (
                            <div key={ei} className="flex gap-2 items-start">
                              <div className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center mt-0.5"
                                   style={{ background: agentColor + '15' }}>
                                <Icon size={8} style={{ color: agentColor }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[7px] font-bold font-hud"
                                        style={{ color: agentColor }}>
                                    {entry.agent.replace('Agent', '').toUpperCase()}
                                  </span>
                                  <LogLevel level={entry.level} />
                                </div>
                                <p className="text-[8px] text-slate-400 leading-relaxed break-words"
                                   style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                                  {entry.message}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )
              ) : (
                filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Brain size={20} className="mb-2 opacity-20 text-slate-700" />
                    <div className="text-[9px] tracking-widest font-hud text-center text-slate-700">
                      {isRunning ? 'WAITING FOR AGENT ACTIVITY...' : 'START AI FUND TO SEE LIVE REASONING'}
                    </div>
                  </div>
                ) : (
                  filteredLogs.map((log, i) => {
                    const agentColor = AGENT_COLORS[log.agent] || '#64748b'
                    return (
                      <div
                        key={i}
                        className="flex flex-col gap-0.5 px-2 py-1.5 rounded-lg border border-transparent hover:border-slate-800 transition-colors"
                        style={{ background: '#0a1628' }}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[7px] font-mono text-slate-700">{log.timestamp}</span>
                          <span className="text-[7px] font-bold font-hud tracking-wider"
                                style={{ color: agentColor }}>
                            {log.agent.replace('Agent', '').toUpperCase()}
                          </span>
                          {log.symbol && (
                            <span className="text-[7px] font-mono text-slate-600">[{log.symbol}]</span>
                          )}
                          <LogLevel level={log.level} />
                        </div>
                        <div className="text-[9px] text-slate-400 leading-relaxed"
                             style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                          {log.message}
                        </div>
                      </div>
                    )
                  })
                )
              )}
            </div>
          </div>

          {/* DISCLAIMER */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
            <AlertTriangle size={10} className="text-yellow-500 flex-shrink-0" />
            <span className="text-[8px] text-yellow-500/70 font-hud tracking-wider">
              PAPER TRADING ONLY — NO REAL MONEY
            </span>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
