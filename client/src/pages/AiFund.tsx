import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Cpu, TrendingUp, TrendingDown, AlertTriangle,
  Play, Square, Zap, Brain, Shield, BarChart3, RefreshCw,
  ChevronRight, Circle, Wifi, WifiOff, Database, MessageSquare,
  Globe, Layers, Search, Briefcase, GraduationCap, Network,
  Gauge, Target, Flame, Sparkles, TrendingUp as TU, LayoutDashboard,
} from 'lucide-react'
import { useAiFundStore, AgentLog } from '../store/useAiFundStore'
import {
  LiquidityGlobe, WeightTopography, NeuralNodeGraph,
  MiniGauge, HyperParam, ProbabilityBars,
} from '../components/aifund/HermesVisuals'

/* ════════════════════════════════════════════════════════════════════
   HERMES AI TRADING OS — Futuristic Multi-Screen Interface
   Screens: Portfolio Manager · Agent Training · Neural Memory · Risk Center
   ════════════════════════════════════════════════════════════════════ */

const AGENT_COLORS: Record<string, string> = {
  TechnicalAgent:        '#00e5ff',
  SentimentAgent:        '#a855f7',
  MacroAgent:            '#10b981',
  LiquidityAgent:        '#6366f1',
  RiskAgent:             '#f59e0b',
  PortfolioManager:      '#22c55e',
  ReflectionAgent:       '#f472b6',
  StrategyResearchAgent: '#ec4899',
}

const AGENT_ICONS: Record<string, typeof Activity> = {
  TechnicalAgent:        BarChart3,
  SentimentAgent:        Brain,
  MacroAgent:            Globe,
  LiquidityAgent:        Layers,
  RiskAgent:             Shield,
  PortfolioManager:      Cpu,
  ReflectionAgent:       RefreshCw,
  StrategyResearchAgent: Search,
}

const AGENT_DESC: Record<string, string> = {
  TechnicalAgent:        'EMA · RSI · MACD · Bollinger · ATR',
  SentimentAgent:        'Momentum + volume sentiment fusion',
  MacroAgent:            'Session bias + macro news context',
  LiquidityAgent:        'Regime + spread + volatility gate',
  RiskAgent:             'Position sizing + drawdown guard',
  PortfolioManager:      'Trade execution + orchestration',
  ReflectionAgent:       'Post-trade learning + memory write',
  StrategyResearchAgent: 'Self-evolving strategy selection',
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

const SESSION_COLORS: Record<string, string> = {
  LONDON:   '#00e5ff',
  OVERLAP:  '#22c55e',
  NEW_YORK: '#f59e0b',
  ASIAN:    '#475569',
  UNKNOWN:  '#334155',
}

type ScreenId = 'command' | 'portfolio' | 'training' | 'memory' | 'risk'

const SCREENS: { id: ScreenId; label: string; icon: typeof Activity; color: string }[] = [
  { id: 'command',   label: 'COMMAND CENTER',    icon: LayoutDashboard, color: '#22c55e' },
  { id: 'portfolio', label: 'PORTFOLIO MANAGER', icon: Briefcase,      color: '#00e5ff' },
  { id: 'training',  label: 'AGENT TRAINING',    icon: GraduationCap,  color: '#a855f7' },
  { id: 'memory',    label: 'NEURAL MEMORY',     icon: Network,        color: '#ec4899' },
  { id: 'risk',      label: 'RISK CENTER',       icon: Gauge,          color: '#f59e0b' },
]

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

/* ─── Shared atoms ──────────────────────────────────────────────────── */

function LogLevel({ level }: { level: string }) {
  const c = STATUS_COLOR[level] || STATUS_COLOR.info
  return (
    <span className="text-[8px] font-bold tracking-wider font-hud px-1.5 py-0.5 rounded"
          style={{ color: c, background: c + '20', border: `1px solid ${c}40` }}>
      {level.toUpperCase()}
    </span>
  )
}

function GlowPanel({ children, color = '#00e5ff', className = '', glow = true }: {
  children: React.ReactNode; color?: string; className?: string; glow?: boolean
}) {
  return (
    <div className={`relative rounded-xl border overflow-hidden ${className}`}
         style={{
           background: 'linear-gradient(160deg, #070f1c 0%, #050b16 100%)',
           borderColor: color + '25',
           boxShadow: glow ? `0 0 24px ${color}0d, inset 0 1px 0 ${color}10` : 'none',
         }}>
      <div className="absolute top-0 left-0 right-0 h-px"
           style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />
      {children}
    </div>
  )
}

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 2, color }: {
  value: number; prefix?: string; suffix?: string; decimals?: number; color?: string
}) {
  const [display, setDisplay] = useState(value)
  const raf = useRef<number>()
  const from = useRef(value)
  useEffect(() => {
    from.current = display
    const start = performance.now()
    const dur = 500
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from.current + (value - from.current) * eased)
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return (
    <span style={{ color }}>
      {prefix}{display.toLocaleString('en', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  )
}

function SparkLine({ data, height = 48, color }: {
  data: { time: string; balance: number }[]; height?: number; color?: string
}) {
  if (data.length < 2) return (
    <div className="flex items-center justify-center text-[8px] font-hud text-slate-700" style={{ height }}>
      ACCUMULATING DATA...
    </div>
  )
  const balances = data.map(d => d.balance)
  const min = Math.min(...balances)
  const max = Math.max(...balances)
  const range = max - min || 1
  const isUp = balances[balances.length - 1] >= balances[0]
  const lineColor = color || (isUp ? '#22c55e' : '#ef4444')
  const w = 100, h = height
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((d.balance - min) / range) * (h - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const pathD = `M${pts.join(' L')}`
  const fillD = `${pathD} L${w},${h} L0,${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${lineColor}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#sg-${lineColor})`} />
      <motion.path d={pathD} fill="none" stroke={lineColor} strokeWidth="1.5"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }}
        style={{ filter: `drop-shadow(0 0 3px ${lineColor})` }} />
    </svg>
  )
}

function StatCard({ label, value, color, icon: Icon, sub, index = 0 }: {
  label: string; value: React.ReactNode; color: string
  icon: typeof Activity; sub?: string; index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ y: -3, boxShadow: `0 8px 30px ${color}25` }}
      className="flex flex-col gap-1 p-3 rounded-xl border relative overflow-hidden"
      style={{ background: '#0a1628', borderColor: color + '30' }}>
      <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-[0.06]" style={{ background: color }} />
      <div className="flex items-center gap-1.5">
        <Icon size={10} style={{ color }} />
        <span className="text-[8px] tracking-widest font-hud text-slate-500">{label}</span>
      </div>
      <div className="text-sm font-bold font-mono" style={{ color }}>{value}</div>
      {sub && <div className="text-[9px] font-mono" style={{ color: color + 'aa' }}>{sub}</div>}
    </motion.div>
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
      if (!log.symbol || log.symbol === current.symbol) current.entries.push(log)
      else if (log.agent === 'TechnicalAgent' && log.level === 'signal') {
        cycles.push(current)
        current = { symbol: log.symbol, timestamp: log.timestamp, entries: [log] }
      }
    }
  }
  if (current) cycles.push(current)
  return cycles.reverse().slice(0, 20)
}

const screenVariants = {
  initial: { opacity: 0, x: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit:    { opacity: 0, x: -24, filter: 'blur(4px)' },
}

/* ════════════════════════════════════════════════════════════════════
   SCREEN 1 — PORTFOLIO MANAGER
   ════════════════════════════════════════════════════════════════════ */
function PortfolioScreen() {
  const {
    balance, totalPnl, totalPnlPct, dailyPnl, drawdownPct, peakBalance,
    openTrades, closedTrades, balanceHistory, isRunning, currentStrategy, currentSession,
  } = useAiFundStore()
  const [tab, setTab] = useState<'positions' | 'history'>('positions')
  const pnlColor = totalPnl >= 0 ? '#22c55e' : '#ef4444'
  const dailyColor = dailyPnl >= 0 ? '#22c55e' : '#ef4444'
  const sessionColor = SESSION_COLORS[currentSession] || SESSION_COLORS.UNKNOWN

  return (
    <div className="flex flex-col gap-4">
      {/* STAT GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard index={0} label="DEMO BALANCE" color="#00e5ff" icon={Database}
          value={<AnimatedNumber value={balance} prefix="$" />} />
        <StatCard index={1} label="TOTAL P&L" color={pnlColor} icon={TrendingUp}
          value={<><span>{totalPnl >= 0 ? '+' : ''}</span><AnimatedNumber value={totalPnl} prefix="$" /></>}
          sub={`${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`} />
        <StatCard index={2} label="DAILY P&L" color={dailyColor} icon={Activity}
          value={<><span>{dailyPnl >= 0 ? '+' : ''}</span><AnimatedNumber value={dailyPnl} prefix="$" /></>} />
        <StatCard index={3} label="DRAWDOWN" color={drawdownPct > 5 ? '#ef4444' : drawdownPct > 2 ? '#f59e0b' : '#22c55e'}
          icon={TrendingDown} value={<AnimatedNumber value={drawdownPct} suffix="%" />} />
        <StatCard index={4} label="PEAK BAL" color="#a855f7" icon={Zap}
          value={<AnimatedNumber value={peakBalance} prefix="$" decimals={0} />} />
        <StatCard index={5} label="POSITIONS" color="#00e5ff" icon={Target}
          value={String(openTrades.length)} sub="OPEN" />
      </div>

      {/* EQUITY + STRATEGY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlowPanel color="#00e5ff" className="lg:col-span-2 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TU size={12} style={{ color: '#00e5ff' }} />
              <span className="text-[10px] tracking-[0.2em] font-bold font-hud text-slate-400">EQUITY CURVE</span>
            </div>
            <span className="text-[10px] font-mono font-bold" style={{ color: pnlColor }}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </span>
          </div>
          <SparkLine data={balanceHistory} height={120} color="#00e5ff" />
          {balanceHistory.length >= 2 && (
            <div className="flex justify-between mt-1">
              <span className="text-[7px] font-mono text-slate-700">{balanceHistory[0].time}</span>
              <span className="text-[7px] font-mono text-slate-700">{balanceHistory[balanceHistory.length - 1].time}</span>
            </div>
          )}
        </GlowPanel>

        <GlowPanel color="#ec4899" className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={12} style={{ color: '#ec4899' }} />
            <span className="text-[10px] tracking-[0.2em] font-bold font-hud text-slate-400">ACTIVE STRATEGY</span>
          </div>
          <div>
            <motion.div key={currentStrategy} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-lg font-bold font-hud text-pink-400 leading-tight"
              style={{ textShadow: '0 0 16px #ec489960' }}>
              {currentStrategy || 'EMA Trend Following'}
            </motion.div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border"
                   style={{ background: sessionColor + '12', borderColor: sessionColor + '40' }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sessionColor }} />
                <span className="text-[9px] font-bold font-hud" style={{ color: sessionColor }}>{currentSession}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                   style={{ background: '#ec489912', border: '1px solid #ec489930' }}>
                <Flame size={9} className="text-pink-400" />
                <span className="text-[9px] font-bold font-hud text-pink-400">EVOLVING</span>
              </div>
            </div>
          </div>
        </GlowPanel>
      </div>

      {/* GLOBAL LIQUIDITY MAP + AGENT CONSENSUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlowPanel color="#00e5ff" className="lg:col-span-2 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Globe size={12} style={{ color: '#00e5ff' }} />
              <span className="text-[10px] tracking-[0.2em] font-bold font-hud text-slate-400">GLOBAL LIQUIDITY MAP</span>
            </div>
            <span className="text-[8px] font-hud tracking-wider" style={{ color: sessionColor }}>{currentSession} SESSION ACTIVE</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <LiquidityGlobe active={isRunning} size={300} />
          </div>
          <div className="flex items-center justify-center gap-6 mt-1">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono" style={{ color: pnlColor, textShadow: `0 0 20px ${pnlColor}50` }}>
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(0)}
              </div>
              <div className="text-[8px] tracking-wider font-hud text-slate-600">NET P&L</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-slate-300">{openTrades.length}</div>
              <div className="text-[8px] tracking-wider font-hud text-slate-600">ACTIVE NODES</div>
            </div>
          </div>
        </GlowPanel>

        <GlowPanel color="#a855f7" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={12} style={{ color: '#a855f7' }} />
            <span className="text-[10px] tracking-[0.2em] font-bold font-hud text-slate-400">AGENT CONSENSUS</span>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'TECHNICAL', conf: Math.min(95, 55 + openTrades.length * 8), c: '#00e5ff' },
              { name: 'SENTIMENT', conf: Math.min(92, 48 + closedTrades.length * 3), c: '#a855f7' },
              { name: 'MACRO', conf: currentSession === 'OVERLAP' ? 80 : currentSession === 'LONDON' ? 68 : 40, c: '#10b981' },
              { name: 'RISK GAUGE', conf: Math.max(20, 90 - drawdownPct * 8), c: '#f59e0b' },
            ].map((a, i) => (
              <motion.div key={a.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="p-2.5 rounded-lg border" style={{ background: a.c + '08', borderColor: a.c + '25' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold font-hud tracking-wider" style={{ color: a.c }}>{a.name}</span>
                  <span className="text-[9px] font-mono" style={{ color: a.c }}>{a.conf.toFixed(0)}%</span>
                </div>
                <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${a.conf}%` }}
                    transition={{ duration: 0.8, delay: i * 0.07 }} style={{ background: a.c, boxShadow: `0 0 6px ${a.c}` }} />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] tracking-wider font-hud text-slate-500">BUY PROBABILITY</span>
              <span className="text-[9px] font-mono text-cyan-400">{Math.min(88, 50 + openTrades.length * 6)}%</span>
            </div>
            <ProbabilityBars values={[40, 55, 48, 62, 70, 58, 75, 68, 80, 72, 85, 78]} color="#00e5ff" />
          </div>
        </GlowPanel>
      </div>

      {/* TRADES TABLE */}
      <GlowPanel color="#00e5ff">
        <div className="flex border-b border-slate-800">
          {(['positions', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex items-center gap-1.5 px-5 py-3 text-[10px] font-bold tracking-widest font-hud transition-all border-b-2"
              style={{
                borderBottomColor: tab === t ? '#00e5ff' : 'transparent',
                color: tab === t ? '#00e5ff' : '#475569',
                background: tab === t ? '#00e5ff08' : 'transparent',
              }}>
              {t === 'positions'
                ? <><Activity size={10} />OPEN POSITIONS ({openTrades.length})</>
                : <><ChevronRight size={10} />TRADE HISTORY ({closedTrades.length})</>}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
          {tab === 'positions' ? (
            openTrades.length === 0 ? (
              <EmptyState icon={Activity} title="NO OPEN POSITIONS"
                sub={isRunning ? 'AGENTS SCANNING EUR/USD & GBP/USD...' : 'START AI FUND TO BEGIN TRADING'} />
            ) : (
              <table className="w-full text-xs">
                <thead><tr className="border-b border-slate-800">
                  {['#', 'PAIR', 'DIR', 'ENTRY', 'CURRENT', 'SL', 'TP', 'LIVE P&L', 'CONF'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[8px] font-bold tracking-wider font-hud text-slate-600">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  <AnimatePresence>
                    {openTrades.map(trade => {
                      const c = (trade.live_pnl ?? 0) >= 0 ? '#22c55e' : '#ef4444'
                      const dc = trade.direction === 'long' ? '#22c55e' : '#ef4444'
                      return (
                        <motion.tr key={trade.id} layout
                          initial={{ opacity: 0, backgroundColor: '#00e5ff15' }}
                          animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0)' }}
                          exit={{ opacity: 0, x: 40 }}
                          className="border-b border-slate-800/50 hover:bg-slate-800/20">
                          <td className="px-3 py-2 text-[9px] font-mono text-slate-500">#{trade.id}</td>
                          <td className="px-3 py-2 text-[9px] font-bold font-hud tracking-wider text-slate-300">{trade.symbol.replace('/USD', '')}</td>
                          <td className="px-3 py-2"><span className="text-[8px] font-bold font-hud px-1.5 py-0.5 rounded"
                            style={{ color: dc, background: dc + '20', border: `1px solid ${dc}40` }}>{trade.direction.toUpperCase()}</span></td>
                          <td className="px-3 py-2 font-mono text-[9px] text-slate-400">{Number(trade.entry_price).toFixed(5)}</td>
                          <td className="px-3 py-2 font-mono text-[9px]" style={{ color: c }}>{trade.current_price ? Number(trade.current_price).toFixed(5) : '—'}</td>
                          <td className="px-3 py-2 font-mono text-[9px] text-red-500/70">{Number(trade.stop_loss).toFixed(5)}</td>
                          <td className="px-3 py-2 font-mono text-[9px] text-green-500/70">{Number(trade.take_profit).toFixed(5)}</td>
                          <td className="px-3 py-2 font-mono text-[9px] font-bold" style={{ color: c }}>
                            {(trade.live_pnl ?? 0) >= 0 ? '+' : ''}${(trade.live_pnl ?? 0).toFixed(2)}
                            {trade.trailing_activated && <span className="ml-1 text-[7px] text-yellow-500">TRAIL</span>}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <div className="w-10 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <motion.div className="h-full rounded-full bg-cyan-400"
                                  initial={{ width: 0 }} animate={{ width: `${Math.min(100, (trade.confidence ?? 0) * 100)}%` }} />
                              </div>
                              <span className="text-[8px] font-mono text-slate-500">{Math.round((trade.confidence ?? 0) * 100)}%</span>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            )
          ) : (
            closedTrades.length === 0 ? (
              <EmptyState icon={Database} title="NO TRADE HISTORY" sub="CLOSED TRADES APPEAR HERE" />
            ) : (
              <table className="w-full text-xs">
                <thead><tr className="border-b border-slate-800">
                  {['#', 'PAIR', 'DIR', 'ENTRY', 'EXIT', 'P&L', 'REASON', 'CONF'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[8px] font-bold tracking-wider font-hud text-slate-600">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {closedTrades.slice(0, 50).map(trade => {
                    const c = (trade.pnl ?? 0) >= 0 ? '#22c55e' : '#ef4444'
                    const dc = trade.direction === 'long' ? '#22c55e' : '#ef4444'
                    const rc = trade.close_reason === 'TAKE_PROFIT' ? '#22c55e' : trade.close_reason === 'STOP_LOSS' ? '#ef4444' : '#f59e0b'
                    return (
                      <tr key={trade.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                        <td className="px-3 py-2 text-[9px] font-mono text-slate-500">#{trade.id}</td>
                        <td className="px-3 py-2 text-[9px] font-bold font-hud tracking-wider text-slate-300">{trade.symbol.replace('/USD', '')}</td>
                        <td className="px-3 py-2"><span className="text-[8px] font-bold font-hud px-1.5 py-0.5 rounded"
                          style={{ color: dc, background: dc + '20', border: `1px solid ${dc}40` }}>{trade.direction.toUpperCase()}</span></td>
                        <td className="px-3 py-2 font-mono text-[9px] text-slate-400">{Number(trade.entry_price).toFixed(5)}</td>
                        <td className="px-3 py-2 font-mono text-[9px] text-slate-400">{trade.exit_price ? Number(trade.exit_price).toFixed(5) : '—'}</td>
                        <td className="px-3 py-2 font-mono text-[9px] font-bold" style={{ color: c }}>{(trade.pnl ?? 0) >= 0 ? '+' : ''}${(trade.pnl ?? 0).toFixed(2)}</td>
                        <td className="px-3 py-2"><span className="text-[8px] font-hud font-bold" style={{ color: rc }}>{trade.close_reason || '—'}</span></td>
                        <td className="px-3 py-2 font-mono text-[9px] text-slate-500">{Math.round((trade.confidence ?? 0) * 100)}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          )}
        </div>
      </GlowPanel>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   SCREEN 2 — AGENT TRAINING
   ════════════════════════════════════════════════════════════════════ */
function TrainingScreen() {
  const { agentStatus, agentLogs, isRunning, clearLogs, currentStrategy, closedTrades } = useAiFundStore()
  const [debateMode, setDebateMode] = useState(true)
  const [logFilter, setLogFilter] = useState('all')
  const [epoch, setEpoch] = useState(0)
  const logRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = 0 }, [agentLogs.length])
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => setEpoch(e => e + 1), 2500)
    return () => clearInterval(id)
  }, [isRunning])

  const debateCycles = groupDebateCycles(agentLogs)
  const filteredLogs = logFilter === 'all' ? agentLogs : agentLogs.filter(l => l.level === logFilter || l.agent === logFilter)
  const wins = closedTrades.filter(t => (t.pnl ?? 0) > 0).length
  const winRate = closedTrades.length ? (wins / closedTrades.length) * 100 : 0

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      {/* AGENT GRID */}
      <div className="xl:col-span-7 flex flex-col gap-4">
        {/* NEURAL TRAINING — weight topography + metrics + hyperparams */}
        <GlowPanel color="#a855f7" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[11px] tracking-[0.15em] font-bold font-hud text-purple-300">
                NEURAL AGENT TRAINING: {(currentStrategy || 'Alpha-Go-X').toUpperCase()}
              </div>
              <div className="text-[8px] font-hud text-slate-600 mt-0.5">
                STATUS: {isRunning ? `TRAINING · EPOCH ${epoch.toString().padStart(4, '0')}` : 'IDLE'}
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: '#a855f712', border: '1px solid #a855f730' }}>
              <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'animate-pulse' : ''}`} style={{ background: isRunning ? '#a855f7' : '#334155' }} />
              <span className="text-[8px] font-bold font-hud text-purple-300">{isRunning ? 'LEARNING' : 'PAUSED'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="text-[8px] tracking-wider font-hud text-slate-600 mb-2">WEIGHT MATRIX TOPOGRAPHY</div>
              <WeightTopography active={isRunning} />
            </div>
            <div>
              <div className="text-[8px] tracking-wider font-hud text-slate-600 mb-2">PERFORMANCE METRICS</div>
              <div className="flex justify-around mb-3">
                <MiniGauge value={winRate} label="WIN RATE" color="#22c55e" />
                <MiniGauge value={Math.min(99, 60 + epoch * 0.5)} label="ACCURACY" color="#00e5ff" />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="text-[8px] tracking-wider font-hud text-slate-600 mb-2">HYPERPARAMETERS</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <HyperParam label="LEARNING RATE" value={34} display="0.0034" color="#a855f7" />
              <HyperParam label="BATCH SIZE" value={64} display="64" color="#00e5ff" />
              <HyperParam label="DROPOUT RATE" value={20} display="0.20" color="#ec4899" />
            </div>
            <button className="w-full mt-3 py-2 rounded-lg text-[9px] font-bold tracking-widest font-hud transition-all"
              style={{ background: 'linear-gradient(135deg, #a855f730, #ec489930)', border: '1px solid #a855f750', color: '#c4b5fd', boxShadow: '0 0 16px #a855f720' }}>
              ⚡ APPLY MUTATION
            </button>
          </div>
        </GlowPanel>

        <GlowPanel color="#a855f7" className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Network size={13} style={{ color: '#a855f7' }} />
              <span className="text-[11px] tracking-[0.2em] font-bold font-hud text-slate-300">NEURAL AGENT NETWORK</span>
            </div>
            <span className="text-[9px] tracking-wider text-slate-600 font-hud">8 AGENTS · ONLINE</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(agentStatus).map(([name, status], i) => {
              const color = AGENT_COLORS[name] || '#00e5ff'
              const sColor = STATUS_COLOR[status] || STATUS_COLOR.idle
              const Icon = AGENT_ICONS[name] || Activity
              const active = status !== 'idle'
              return (
                <motion.div key={name}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative flex items-center gap-3 p-3 rounded-xl border overflow-hidden"
                  style={{
                    borderColor: active ? color + '60' : '#1e293b',
                    background: active ? color + '0c' : '#0a1628',
                    boxShadow: active ? `0 0 20px ${color}22` : 'none',
                  }}>
                  {active && (
                    <motion.div className="absolute inset-0 pointer-events-none"
                      animate={{ opacity: [0.04, 0.12, 0.04] }} transition={{ duration: 2, repeat: Infinity }}
                      style={{ background: `radial-gradient(circle at 20% 50%, ${color}, transparent 70%)` }} />
                  )}
                  <div className="relative w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                       style={{ background: color + '15', border: `1px solid ${color}40` }}>
                    <Icon size={16} style={{ color }} />
                    {active && <motion.div className="absolute inset-0 rounded-lg border"
                      animate={{ scale: [1, 1.25], opacity: [0.6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ borderColor: color }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold font-hud tracking-wider truncate" style={{ color }}>
                      {name.replace('Agent', '').replace('Research', ' RESEARCH').toUpperCase()}
                    </div>
                    <div className="text-[8px] text-slate-600 font-hud truncate">{AGENT_DESC[name]}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[9px] font-bold font-hud" style={{ color: sColor }}>{status.toUpperCase()}</div>
                    {active && <div className="w-1.5 h-1.5 rounded-full ml-auto mt-1 animate-pulse" style={{ background: sColor }} />}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </GlowPanel>
      </div>

      {/* DEBATE / TELEMETRY */}
      <div className="xl:col-span-5">
        <GlowPanel color="#00e5ff" className="flex flex-col" >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] tracking-[0.2em] font-bold font-hud text-cyan-400">
                {debateMode ? 'AI DEBATE TERMINAL' : 'AGENT TELEMETRY'}
              </span>
              <span className="text-[8px] font-mono text-slate-600">{debateMode ? `${debateCycles.length} cycles` : agentLogs.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDebateMode(d => !d)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[7px] font-bold tracking-wider font-hud"
                style={{ color: debateMode ? '#a855f7' : '#475569', background: debateMode ? '#a855f720' : 'transparent', border: `1px solid ${debateMode ? '#a855f740' : '#1e293b'}` }}>
                <MessageSquare size={8} />{debateMode ? 'DEBATE' : 'LOG'}
              </button>
              {!debateMode && <button onClick={clearLogs} className="text-[8px] text-slate-600 hover:text-slate-400 font-hud tracking-wider">CLEAR</button>}
            </div>
          </div>

          {!debateMode && (
            <div className="flex gap-1 px-3 py-2 border-b border-slate-800 flex-wrap">
              {['all', 'signal', 'warning', 'TechnicalAgent', 'MacroAgent', 'LiquidityAgent', 'RiskAgent'].map(f => (
                <button key={f} onClick={() => setLogFilter(f)}
                  className="px-2 py-0.5 rounded text-[7px] font-bold tracking-wider font-hud"
                  style={{ color: logFilter === f ? (AGENT_COLORS[f] || '#00e5ff') : '#475569', background: logFilter === f ? (AGENT_COLORS[f] || '#00e5ff') + '15' : 'transparent', border: `1px solid ${logFilter === f ? (AGENT_COLORS[f] || '#00e5ff') + '40' : '#1e293b'}` }}>
                  {f.replace('Agent', '').toUpperCase()}
                </button>
              ))}
            </div>
          )}

          <div ref={logRef} className="overflow-y-auto px-3 py-2 space-y-1.5" style={{ height: 'calc(100vh - 260px)', minHeight: 360 }}>
            {debateMode ? (
              debateCycles.length === 0 ? (
                <EmptyState icon={MessageSquare} title={isRunning ? 'WAITING FOR ANALYSIS CYCLES...' : 'START AI FUND TO SEE DEBATE'} />
              ) : (
                <AnimatePresence initial={false}>
                  {debateCycles.map((cycle, ci) => (
                    <motion.div key={`${cycle.symbol}-${cycle.timestamp}-${ci}`}
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-slate-800 overflow-hidden mb-2" style={{ background: '#0a1628' }}>
                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800" style={{ background: '#060e1a' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-cyan-400" />
                          <span className="text-[8px] font-bold font-hud tracking-wider text-slate-400">CYCLE — {cycle.symbol}</span>
                        </div>
                        <span className="text-[7px] font-mono text-slate-700">{cycle.timestamp}</span>
                      </div>
                      <div className="p-2 space-y-1.5">
                        {cycle.entries.map((entry, ei) => {
                          const ac = AGENT_COLORS[entry.agent] || '#64748b'
                          const Icon = AGENT_ICONS[entry.agent] || Activity
                          return (
                            <motion.div key={ei} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: ei * 0.05 }} className="flex gap-2 items-start">
                              <div className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center mt-0.5" style={{ background: ac + '15' }}>
                                <Icon size={8} style={{ color: ac }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[7px] font-bold font-hud" style={{ color: ac }}>{entry.agent.replace('Agent', '').toUpperCase()}</span>
                                  <LogLevel level={entry.level} />
                                </div>
                                <p className="text-[8px] text-slate-400 leading-relaxed break-words" style={{ fontFamily: 'Share Tech Mono, monospace' }}>{entry.message}</p>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )
            ) : (
              filteredLogs.length === 0 ? (
                <EmptyState icon={Brain} title={isRunning ? 'WAITING FOR AGENT ACTIVITY...' : 'START AI FUND TO SEE REASONING'} />
              ) : (
                filteredLogs.map((log, i) => {
                  const ac = AGENT_COLORS[log.agent] || '#64748b'
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col gap-0.5 px-2 py-1.5 rounded-lg border border-transparent hover:border-slate-800" style={{ background: '#0a1628' }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[7px] font-mono text-slate-700">{log.timestamp}</span>
                        <span className="text-[7px] font-bold font-hud tracking-wider" style={{ color: ac }}>{log.agent.replace('Agent', '').toUpperCase()}</span>
                        {log.symbol && <span className="text-[7px] font-mono text-slate-600">[{log.symbol}]</span>}
                        <LogLevel level={log.level} />
                      </div>
                      <div className="text-[9px] text-slate-400 leading-relaxed" style={{ fontFamily: 'Share Tech Mono, monospace' }}>{log.message}</div>
                    </motion.div>
                  )
                })
              )
            )}
          </div>
        </GlowPanel>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   SCREEN 3 — NEURAL MEMORY
   ════════════════════════════════════════════════════════════════════ */
function MemoryScreen() {
  const { closedTrades } = useAiFundStore()
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [filter, setFilter] = useState('all')

  const fetchMemory = async () => {
    try {
      const res = await fetch('http://localhost:8000/memory?limit=60')
      if (res.ok) setEntries(await res.json())
    } catch {}
  }
  useEffect(() => { fetchMemory() }, [])
  useEffect(() => { if (closedTrades.length > 0) fetchMemory() }, [closedTrades.length])

  const { isRunning } = useAiFundStore()
  const agents = Array.from(new Set(entries.map(e => e.agent_name)))
  const filtered = filter === 'all' ? entries : entries.filter(e => e.agent_name === filter)
  const avgImportance = entries.length ? entries.reduce((s, e) => s + e.importance, 0) / entries.length : 0

  return (
    <div className="flex flex-col gap-4">
      {/* DECISION NEXUS GRAPH */}
      <GlowPanel color="#ec4899" className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Network size={12} style={{ color: '#ec4899' }} />
            <span className="text-[10px] tracking-[0.2em] font-bold font-hud text-slate-400">MEMORY BANK · DECISION NEXUS</span>
          </div>
          <span className="text-[8px] font-hud tracking-wider text-slate-600">{isRunning ? 'PROPAGATING' : 'DORMANT'}</span>
        </div>
        <NeuralNodeGraph active={isRunning} height={240} />
      </GlowPanel>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard index={0} label="TOTAL MEMORIES" color="#ec4899" icon={Network} value={String(entries.length)} />
        <StatCard index={1} label="AVG IMPORTANCE" color="#a855f7" icon={Sparkles} value={<AnimatedNumber value={avgImportance * 100} suffix="%" decimals={0} />} />
        <StatCard index={2} label="ACTIVE AGENTS" color="#00e5ff" icon={Cpu} value={String(agents.length)} />
        <StatCard index={3} label="LESSONS LEARNED" color="#22c55e" icon={Brain} value={String(entries.filter(e => e.memory_type === 'trade_lesson').length)} />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {['all', ...agents].map(a => (
          <button key={a} onClick={() => setFilter(a)}
            className="px-3 py-1 rounded-lg text-[8px] font-bold tracking-wider font-hud transition-all"
            style={{ color: filter === a ? (AGENT_COLORS[a] || '#ec4899') : '#475569', background: filter === a ? (AGENT_COLORS[a] || '#ec4899') + '15' : '#0a1628', border: `1px solid ${filter === a ? (AGENT_COLORS[a] || '#ec4899') + '40' : '#1e293b'}` }}>
            {a === 'all' ? 'ALL' : a.replace('Agent', '').toUpperCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlowPanel color="#ec4899" className="p-10"><EmptyState icon={Network} title="NO MEMORIES YET" sub="THE NETWORK STORES LESSONS AFTER TRADES CLOSE" /></GlowPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <AnimatePresence>
            {filtered.map((m, i) => {
              const c = AGENT_COLORS[m.agent_name] || '#64748b'
              const pct = Math.round(m.importance * 100)
              const Icon = AGENT_ICONS[m.agent_name] || Brain
              return (
                <motion.div key={m.id} layout
                  initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }} transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  whileHover={{ y: -4, boxShadow: `0 10px 30px ${c}25` }}
                  className="relative p-4 rounded-xl border overflow-hidden"
                  style={{ background: `linear-gradient(160deg, ${c}0a, #070f1c)`, borderColor: c + '30' }}>
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c}, transparent)` }} />
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: c + '15', border: `1px solid ${c}30` }}>
                        <Icon size={11} style={{ color: c }} />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold font-hud tracking-wider" style={{ color: c }}>{m.agent_name.replace('Agent', '').toUpperCase()}</div>
                        <div className="text-[7px] text-slate-600 font-hud uppercase">{m.memory_type.replace('_', ' ')}{m.symbol ? ` · ${m.symbol}` : ''}</div>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono font-bold" style={{ color: c }}>{pct}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-3" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                    {m.content.slice(0, 180)}{m.content.length > 180 ? '...' : ''}
                  </p>
                  <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   SCREEN 4 — RISK CENTER
   ════════════════════════════════════════════════════════════════════ */
function RiskGauge({ value, max, label, color, unit = '%' }: {
  value: number; max: number; label: string; color: string; unit?: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  const r = 42, circ = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="7" />
          <motion.circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (pct / 100) * circ }} transition={{ duration: 1, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold font-mono" style={{ color }}>{value.toFixed(value < 10 ? 2 : 0)}{unit}</span>
        </div>
      </div>
      <span className="text-[9px] tracking-wider font-hud text-slate-500">{label}</span>
    </div>
  )
}

function RiskScreen() {
  const {
    balance, initialBalance, drawdownPct, peakBalance, openTrades, closedTrades, dailyPnl,
  } = useAiFundStore()

  const totalExposure = openTrades.reduce((s, t) => s + (t.position_value || 0), 0)
  const exposurePct = balance > 0 ? (totalExposure / balance) * 100 : 0
  const wins = closedTrades.filter(t => (t.pnl ?? 0) > 0).length
  const winRate = closedTrades.length ? (wins / closedTrades.length) * 100 : 0
  const dailyLossLimit = initialBalance * 0.05
  const dailyLossUsed = dailyPnl < 0 ? Math.abs(dailyPnl) : 0
  const dailyLossPct = (dailyLossUsed / dailyLossLimit) * 100
  const riskLevel = drawdownPct > 5 || exposurePct > 80 ? 'HIGH' : drawdownPct > 2 || exposurePct > 50 ? 'MODERATE' : 'LOW'
  const riskColor = riskLevel === 'HIGH' ? '#ef4444' : riskLevel === 'MODERATE' ? '#f59e0b' : '#22c55e'

  return (
    <div className="flex flex-col gap-4">
      {/* RISK BANNER */}
      <GlowPanel color={riskColor} className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: riskColor + '15', border: `1px solid ${riskColor}40`, boxShadow: `0 0 24px ${riskColor}30` }}>
              <Shield size={24} style={{ color: riskColor }} />
            </motion.div>
            <div>
              <div className="text-[10px] tracking-[0.2em] font-hud text-slate-500">SYSTEM RISK LEVEL</div>
              <div className="text-2xl font-bold font-hud" style={{ color: riskColor, textShadow: `0 0 20px ${riskColor}60` }}>{riskLevel}</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {[
              { l: 'CAPITAL PRESERVED', v: `${((balance / initialBalance) * 100).toFixed(1)}%`, c: balance >= initialBalance ? '#22c55e' : '#ef4444' },
              { l: 'WIN RATE', v: `${winRate.toFixed(0)}%`, c: '#00e5ff' },
              { l: 'OPEN RISK', v: `${exposurePct.toFixed(0)}%`, c: exposurePct > 50 ? '#f59e0b' : '#22c55e' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-xl font-bold font-mono" style={{ color: s.c }}>{s.v}</div>
                <div className="text-[8px] tracking-wider font-hud text-slate-600">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </GlowPanel>

      {/* GAUGES */}
      <GlowPanel color="#f59e0b" className="p-5">
        <div className="flex items-center gap-2 mb-5">
          <Gauge size={13} style={{ color: '#f59e0b' }} />
          <span className="text-[11px] tracking-[0.2em] font-bold font-hud text-slate-300">RISK GAUGES</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <RiskGauge value={drawdownPct} max={10} label="DRAWDOWN" color={drawdownPct > 5 ? '#ef4444' : '#f59e0b'} />
          <RiskGauge value={exposurePct} max={100} label="CAPITAL EXPOSURE" color={exposurePct > 80 ? '#ef4444' : '#00e5ff'} />
          <RiskGauge value={dailyLossPct} max={100} label="DAILY LOSS LIMIT" color={dailyLossPct > 80 ? '#ef4444' : '#22c55e'} />
          <RiskGauge value={winRate} max={100} label="WIN RATE" color="#a855f7" />
        </div>
      </GlowPanel>

      {/* RISK RULES + EXPOSURE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlowPanel color="#22c55e" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={12} style={{ color: '#22c55e' }} />
            <span className="text-[10px] tracking-[0.2em] font-bold font-hud text-slate-400">RISK GUARDRAILS</span>
          </div>
          <div className="space-y-2.5">
            {[
              { rule: 'Max 1% account risk per trade', ok: true },
              { rule: 'Minimum 1:2 risk-reward ratio enforced', ok: true },
              { rule: 'Min 10-pip stop loss on every position', ok: true },
              { rule: `Daily loss limit: $${dailyLossLimit.toFixed(0)} (5%)`, ok: dailyLossPct < 100 },
              { rule: 'Max drawdown circuit breaker at 10%', ok: drawdownPct < 10 },
              { rule: 'Trading paused during ASIAN low-liquidity', ok: true },
            ].map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: r.ok ? '#22c55e08' : '#ef444410', border: `1px solid ${r.ok ? '#22c55e25' : '#ef444440'}` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.ok ? '#22c55e' : '#ef4444', boxShadow: `0 0 6px ${r.ok ? '#22c55e' : '#ef4444'}` }} />
                <span className="text-[10px] font-hud" style={{ color: r.ok ? '#94a3b8' : '#fca5a5' }}>{r.rule}</span>
                <span className="ml-auto text-[8px] font-bold font-hud" style={{ color: r.ok ? '#22c55e' : '#ef4444' }}>{r.ok ? 'ACTIVE' : 'BREACH'}</span>
              </motion.div>
            ))}
          </div>
        </GlowPanel>

        <GlowPanel color="#6366f1" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={12} style={{ color: '#6366f1' }} />
            <span className="text-[10px] tracking-[0.2em] font-bold font-hud text-slate-400">LIVE EXPOSURE</span>
          </div>
          {openTrades.length === 0 ? (
            <EmptyState icon={Layers} title="NO ACTIVE EXPOSURE" sub="ALL CAPITAL IN RESERVE" />
          ) : (
            <div className="space-y-3">
              {openTrades.map(t => {
                const pct = balance > 0 ? ((t.position_value || 0) / balance) * 100 : 0
                const c = t.direction === 'long' ? '#22c55e' : '#ef4444'
                return (
                  <div key={t.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold font-hud text-slate-300">{t.symbol} · {t.direction.toUpperCase()}</span>
                      <span className="text-[9px] font-mono" style={{ color: c }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min(100, pct)}%` }}
                        style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
                    </div>
                  </div>
                )
              })}
              <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[9px] font-hud text-slate-500">TOTAL EXPOSURE</span>
                <span className="text-sm font-bold font-mono" style={{ color: exposurePct > 50 ? '#f59e0b' : '#00e5ff' }}>${totalExposure.toFixed(2)}</span>
              </div>
            </div>
          )}
        </GlowPanel>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   SCREEN 0 — COMMAND CENTER
   ════════════════════════════════════════════════════════════════════ */
function CandleChart({ symbol, price, active }: { symbol: string; price: number; active: boolean }) {
  const [candles, setCandles] = useState<{ o: number; h: number; l: number; c: number }[]>([])
  useEffect(() => {
    if (!price) return
    setCandles(prev => {
      const last = prev[prev.length - 1]?.c ?? price
      const o = last
      const c = price
      const h = Math.max(o, c) * (1 + Math.random() * 0.0004)
      const l = Math.min(o, c) * (1 - Math.random() * 0.0004)
      return [...prev, { o, h, l, c }].slice(-40)
    })
  }, [price])

  if (candles.length < 2) return (
    <div className="flex items-center justify-center h-full text-[9px] font-hud text-slate-700">
      {active ? 'BUILDING PREDICTION MATRIX...' : 'START FUND TO STREAM DATA'}
    </div>
  )
  const all = candles.flatMap(c => [c.h, c.l])
  const max = Math.max(...all), min = Math.min(...all), range = max - min || 1
  const cw = 100 / candles.length
  const y = (v: number) => 100 - ((v - min) / range) * 96 - 2
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      {candles.map((c, i) => {
        const x = i * cw + cw / 2
        const up = c.c >= c.o
        const col = up ? '#22c55e' : '#ec4899'
        return (
          <g key={i}>
            <line x1={x} y1={y(c.h)} x2={x} y2={y(c.l)} stroke={col} strokeWidth="0.3" opacity="0.7" />
            <rect x={i * cw + cw * 0.2} y={y(Math.max(c.o, c.c))} width={cw * 0.6}
              height={Math.max(0.5, Math.abs(y(c.o) - y(c.c)))} fill={col}
              style={{ filter: `drop-shadow(0 0 1px ${col})` }} />
          </g>
        )
      })}
    </svg>
  )
}

function CommandCenterScreen() {
  const { tickers, agentLogs, agentStatus, isRunning, balance, totalPnl } = useAiFundStore()
  const eurusd = tickers['EUR/USD']
  const recent = agentLogs.slice(0, 8)
  const pnlColor = totalPnl >= 0 ? '#22c55e' : '#ef4444'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* PREDICTION MATRIX */}
      <GlowPanel color="#ec4899" className="lg:col-span-2 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={12} style={{ color: '#ec4899' }} />
            <span className="text-[10px] tracking-[0.2em] font-bold font-hud text-slate-400">EUR/USD PREDICTION MATRIX</span>
          </div>
          {eurusd && <span className="text-sm font-bold font-mono text-slate-200">{eurusd.price.toFixed(5)}</span>}
        </div>
        <div className="flex-1" style={{ minHeight: 260 }}>
          <CandleChart symbol="EUR/USD" price={eurusd?.price ?? 0} active={isRunning} />
        </div>
      </GlowPanel>

      {/* ENHANCEMENT AGENTS */}
      <div className="flex flex-col gap-4">
        <GlowPanel color="#22c55e" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={12} style={{ color: '#22c55e' }} />
            <span className="text-[10px] tracking-[0.2em] font-bold font-hud text-slate-400">ENHANCEMENT AGENTS</span>
          </div>
          <div className="space-y-2">
            {[
              { n: 'ALPHA · TECH', d: 'Analyzing technical structure', c: '#00e5ff' },
              { n: 'META · SENTIMENT', d: 'Parsing social streams', c: '#a855f7' },
              { n: 'GAMMA · RISK', d: 'Monitoring exposure limits', c: '#f59e0b' },
            ].map((a, i) => (
              <motion.div key={a.n} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-2.5 p-2.5 rounded-lg border" style={{ background: a.c + '08', borderColor: a.c + '25' }}>
                <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'animate-pulse' : ''}`} style={{ background: a.c, boxShadow: `0 0 6px ${a.c}` }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-bold font-hud tracking-wider" style={{ color: a.c }}>{a.n}</div>
                  <div className="text-[7px] font-hud text-slate-600 truncate">{a.d}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlowPanel>
        <GlowPanel color="#00e5ff" className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-cyan-400">${balance.toFixed(0)}</div>
              <div className="text-[8px] tracking-wider font-hud text-slate-600">BALANCE</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono" style={{ color: pnlColor }}>{totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(0)}</div>
              <div className="text-[8px] tracking-wider font-hud text-slate-600">NET P&L</div>
            </div>
          </div>
        </GlowPanel>
      </div>

      {/* AI DEBATE TERMINAL */}
      <GlowPanel color="#a855f7" className="lg:col-span-3 p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={12} style={{ color: '#a855f7' }} />
          <span className="text-[10px] tracking-[0.2em] font-bold font-hud text-slate-400">AI DEBATE TERMINAL</span>
        </div>
        <div className="space-y-1 font-mono" style={{ minHeight: 120 }}>
          {recent.length === 0 ? (
            <EmptyState icon={MessageSquare} title={isRunning ? 'AGENTS INITIALIZING...' : 'START FUND TO BEGIN'} />
          ) : recent.map((log, i) => {
            const ac = AGENT_COLORS[log.agent] || '#64748b'
            return (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 text-[9px]">
                <span className="text-slate-700">[{log.timestamp}]</span>
                <span className="font-bold font-hud flex-shrink-0" style={{ color: ac }}>{log.agent.replace('Agent', '')}:</span>
                <span className="text-slate-400 truncate">{log.message}</span>
              </motion.div>
            )
          })}
        </div>
      </GlowPanel>
    </div>
  )
}

/* ─── Empty state ───────────────────────────────────────────────────── */
function EmptyState({ icon: Icon, title, sub }: { icon: typeof Activity; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon size={24} className="mb-3 opacity-20 text-slate-600" />
      <div className="text-[10px] tracking-widest font-hud text-center text-slate-600">{title}</div>
      {sub && <div className="text-[8px] text-slate-700 mt-1 font-hud tracking-wider">{sub}</div>}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   ROOT — shell with sidebar + screen router
   ════════════════════════════════════════════════════════════════════ */
export default function AiFund() {
  const {
    wsConnected, wsError, isRunning, tickers, currentSession,
    connect, disconnect, startFund, stopFund,
  } = useAiFundStore()

  const [screen, setScreen] = useState<ScreenId>('command')
  const [starting, setStarting] = useState(false)

  useEffect(() => { connect(); return () => disconnect() }, [])

  const handleToggle = async () => {
    setStarting(true)
    try { if (isRunning) await stopFund(); else await startFund() }
    finally { setStarting(false) }
  }

  const eurusd = tickers['EUR/USD']
  const gbpusd = tickers['GBP/USD']
  const sessionColor = SESSION_COLORS[currentSession] || SESSION_COLORS.UNKNOWN
  const activeScreen = SCREENS.find(s => s.id === screen)!

  return (
    <div className="flex flex-col h-full bg-bg-primary" style={{ minHeight: '100vh' }}>
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid opacity-30" />

      {/* TOP BAR */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-slate-800/50"
           style={{ background: 'linear-gradient(90deg, #020f20 0%, #030d1a 100%)' }}>
        <div className="flex items-center gap-3">
          <motion.div animate={{ boxShadow: ['0 0 20px #00e5ff20', '0 0 30px #00e5ff40', '0 0 20px #00e5ff20'] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#00e5ff10', border: '1px solid #00e5ff40' }}>
            <Activity size={18} className="text-cyan-400" />
          </motion.div>
          <div>
            <div className="text-sm font-bold tracking-[0.25em] text-cyan-400 font-hud" style={{ textShadow: '0 0 20px #00e5ff80' }}>
              HERMES AI TRADING OS
            </div>
            <div className="text-[9px] tracking-widest text-slate-600 font-hud">
              {activeScreen.label} · EUR/USD · $5,000 DEMO · 8 AGENTS
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border"
               style={{ background: sessionColor + '10', borderColor: sessionColor + '40' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sessionColor }} />
            <span className="text-[9px] font-bold font-hud tracking-wider" style={{ color: sessionColor }}>{currentSession}</span>
          </div>
          {[['EUR/USD', eurusd], ['GBP/USD', gbpusd]].map(([sym, t]: any) => t && (
            <div key={sym} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800" style={{ background: '#0a1628' }}>
              <span className="text-[9px] text-slate-500 font-hud tracking-wider">{sym}</span>
              <span className="text-xs font-bold font-mono text-slate-200">{t.price.toFixed(5)}</span>
              <span className="text-[9px] font-mono" style={{ color: t.change_pct >= 0 ? '#22c55e' : '#ef4444' }}>
                {t.change_pct >= 0 ? '+' : ''}{t.change_pct.toFixed(4)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {wsConnected ? <Wifi size={12} className="text-cyan-400" /> : <WifiOff size={12} className="text-red-500" />}
            <span className="text-[9px] font-hud tracking-wider" style={{ color: wsConnected ? '#00e5ff' : '#ef4444' }}>{wsConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border"
               style={{ background: isRunning ? '#22c55e10' : '#0a1628', borderColor: isRunning ? '#22c55e40' : '#1e293b' }}>
            <Circle size={6} className={isRunning ? 'animate-pulse' : ''} style={{ fill: isRunning ? '#22c55e' : '#334155', color: isRunning ? '#22c55e' : '#334155' }} />
            <span className="text-[9px] font-bold tracking-widest font-hud" style={{ color: isRunning ? '#22c55e' : '#475569' }}>{isRunning ? 'RUNNING' : 'STANDBY'}</span>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleToggle} disabled={starting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs tracking-widest font-hud disabled:opacity-50"
            style={{
              background: isRunning ? 'linear-gradient(135deg, #ef444420, #dc262620)' : 'linear-gradient(135deg, #00e5ff20, #06b6d420)',
              border: `1px solid ${isRunning ? '#ef444460' : '#00e5ff60'}`, color: isRunning ? '#ef4444' : '#00e5ff',
              boxShadow: isRunning ? '0 0 15px #ef444420' : '0 0 15px #00e5ff20',
            }}>
            {starting ? <RefreshCw size={12} className="animate-spin" /> : isRunning ? <Square size={12} /> : <Play size={12} />}
            {isRunning ? 'STOP FUND' : 'START AI FUND'}
          </motion.button>
        </div>
      </div>

      {/* BODY: rail + screen */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* SIDEBAR RAIL */}
        <div className="flex flex-col gap-2 py-4 px-2 border-r border-slate-800/50" style={{ background: '#040b16' }}>
          {SCREENS.map(s => {
            const active = screen === s.id
            const Icon = s.icon
            return (
              <motion.button key={s.id} onClick={() => setScreen(s.id)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="relative group flex flex-col items-center gap-1 w-16 py-3 rounded-xl transition-all"
                style={{ background: active ? s.color + '12' : 'transparent', border: `1px solid ${active ? s.color + '40' : 'transparent'}` }}>
                {active && <motion.div layoutId="railGlow" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />}
                <Icon size={18} style={{ color: active ? s.color : '#475569' }} />
                <span className="text-[6px] font-bold tracking-wider font-hud text-center leading-tight" style={{ color: active ? s.color : '#475569' }}>
                  {s.label.split(' ').map((w, i) => <div key={i}>{w}</div>)}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* SCREEN AREA */}
        <div className="flex-1 overflow-y-auto p-4">
          {wsError && (
            <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg border border-red-500/30 bg-red-500/10">
              <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
              <span className="text-[9px] text-red-400 font-hud">{wsError}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={screen} variants={screenVariants} initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}>
              {screen === 'command' && <CommandCenterScreen />}
              {screen === 'portfolio' && <PortfolioScreen />}
              {screen === 'training' && <TrainingScreen />}
              {screen === 'memory' && <MemoryScreen />}
              {screen === 'risk' && <RiskScreen />}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2 px-3 py-2 mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
            <AlertTriangle size={10} className="text-yellow-500 flex-shrink-0" />
            <span className="text-[8px] text-yellow-500/70 font-hud tracking-wider">
              PAPER TRADING ONLY — $5,000 DEMO FOREX ACCOUNT — NO REAL MONEY — NO LIVE EXECUTION
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
