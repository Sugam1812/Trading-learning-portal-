import { useEffect, useRef, useState } from 'react'
import {
  Activity, Cpu, TrendingUp, TrendingDown, AlertTriangle,
  Play, Square, Zap, Brain, Shield, BarChart3, RefreshCw,
  ChevronRight, Circle, Wifi, WifiOff, Database
} from 'lucide-react'
import { useAiFundStore } from '../store/useAiFundStore'

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

export default function AiFund() {
  const {
    wsConnected, wsError, isRunning,
    balance, initialBalance, totalPnl, totalPnlPct, dailyPnl, drawdownPct, peakBalance,
    openTrades, closedTrades, agentStatus, agentLogs, tickers,
    connect, disconnect, startFund, stopFund, clearLogs,
  } = useAiFundStore()

  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions')
  const [logFilter, setLogFilter] = useState<string>('all')
  const logRef = useRef<HTMLDivElement>(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [])

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = 0
    }
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

  return (
    <div className="flex flex-col h-full bg-bg-primary" style={{ minHeight: '100vh' }}>
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
           style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.5) 2px, rgba(0,229,255,0.5) 4px)' }} />

      {/* ─── TOP CONTROL BAR ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-slate-800/50"
           style={{ background: 'linear-gradient(90deg, #020f20 0%, #030d1a 100%)' }}>
        {/* Title */}
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

        {/* Market Tickers */}
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

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* WS Status */}
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

          {/* ENGINE STATUS */}
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

          {/* START / STOP Button */}
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
      <div className="relative z-10 flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden" style={{ maxHeight: 'calc(100vh - 68px)' }}>

        {/* ── LEFT COLUMN: Stats + Agents + Trades ─────────────────────── */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-y-auto">

          {/* ── PORTFOLIO STATS ROW ───────────────────────────────────── */}
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

          {/* ── AGENT STATUS ROW ─────────────────────────────────────── */}
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

          {/* ── TRADES PANEL ─────────────────────────────────────────── */}
          <div className="flex-1 rounded-xl border border-slate-800 overflow-hidden" style={{ background: '#070f1c', minHeight: '200px' }}>
            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              {(['positions', 'history'] as const).map(tab => (
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
                  ) : (
                    <><ChevronRight size={10} />TRADE HISTORY ({closedTrades.length})</>
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
                        const pnlColor = (trade.live_pnl ?? 0) >= 0 ? '#22c55e' : '#ef4444'
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
                            <td className="px-3 py-2 font-mono text-[9px]" style={{ color: pnlColor }}>
                              {trade.current_price ? `$${Number(trade.current_price).toLocaleString()}` : '—'}
                            </td>
                            <td className="px-3 py-2 font-mono text-[9px] text-red-500/70">
                              ${Number(trade.stop_loss).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 font-mono text-[9px] text-green-500/70">
                              ${Number(trade.take_profit).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 font-mono text-[9px] font-bold" style={{ color: pnlColor }}>
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
              ) : (
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
                        const pnlColor = (trade.pnl ?? 0) >= 0 ? '#22c55e' : '#ef4444'
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
                            <td className="px-3 py-2 font-mono text-[9px] font-bold" style={{ color: pnlColor }}>
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
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Agent Telemetry ───────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3 overflow-hidden">

          {/* Error banner */}
          {wsError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10">
              <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
              <span className="text-[9px] text-red-400 font-hud">{wsError}</span>
            </div>
          )}

          {/* AI REASONING TELEMETRY */}
          <div className="flex-1 rounded-xl border border-slate-800 overflow-hidden flex flex-col"
               style={{ background: '#070f1c', maxHeight: 'calc(100vh - 200px)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
                <span className="text-[9px] tracking-[0.2em] font-bold font-hud text-cyber-cyan">
                  AGENT TELEMETRY
                </span>
                {agentLogs.length > 0 && (
                  <span className="text-[8px] font-mono text-slate-600 ml-1">
                    {agentLogs.length} entries
                  </span>
                )}
              </div>
              <button
                onClick={clearLogs}
                className="text-[8px] text-slate-600 hover:text-slate-400 font-hud tracking-wider transition-colors"
              >
                CLEAR
              </button>
            </div>

            {/* Filter tabs */}
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

            {/* Log feed */}
            <div ref={logRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5"
                 style={{ maxHeight: 'calc(100vh - 320px)' }}>
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-800">
                  <Brain size={20} className="mb-2 opacity-30" />
                  <div className="text-[9px] tracking-widest font-hud text-center">
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
              )}
            </div>
          </div>

          {/* PAPER TRADING DISCLAIMER */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
            <AlertTriangle size={10} className="text-yellow-500 flex-shrink-0" />
            <span className="text-[8px] text-yellow-500/70 font-hud tracking-wider">
              PAPER TRADING ONLY — NO REAL MONEY
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
