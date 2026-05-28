import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, BookOpen, Brain, Target,
  Calendar, Trophy, Zap, AlertCircle, ArrowRight, BarChart2,
  Activity, Cpu, Shield
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useTradeStore } from '../store/useTradeStore'
import { getLevelInfo } from '../data/badges'
import { curriculum } from '../data/curriculum'
import { useProgressStore } from '../store/useProgressStore'
import axios from 'axios'

export default function Dashboard() {
  const { profile, setProfile } = useAppStore()
  const { stats, setStats } = useTradeStore()
  const { completedLessons } = useProgressStore()
  const [dailyRoutine, setDailyRoutine] = useState<any>(null)
  const [quote, setQuote] = useState<any>(null)

  useEffect(() => {
    axios.get('/api/progress/profile').then((r) => setProfile(r.data)).catch(() => {})
    axios.get('/api/trades/stats').then((r) => setStats(r.data)).catch(() => {})
    axios.get('/api/progress/daily-routine').then((r) => setDailyRoutine(r.data)).catch(() => {})
    axios.get('/api/market/quote').then((r) => setQuote(r.data)).catch(() => {})
  }, [])

  const levelInfo = profile ? getLevelInfo(profile.xp) : null
  const totalLessons = curriculum.reduce((s, m) => s + m.lessons.length, 0)
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0

  const TRADING_QUOTES = [
    "The goal of a successful trader is to make the best trades. Money is secondary. — Alexander Elder",
    "Risk comes from not knowing what you're doing. — Warren Buffett",
    "The market transfers money from the impatient to the patient. — Warren Buffett",
    "In trading, the person who wins is the one who loses the least. — Unknown",
    "Plan the trade. Trade the plan. — Unknown",
  ]
  const dailyQuote = TRADING_QUOTES[new Date().getDay() % TRADING_QUOTES.length]

  const statCards = [
    {
      label: 'ACCOUNT BALANCE',
      value: profile ? `$${profile.account_balance.toLocaleString('en', { minimumFractionDigits: 2 })}` : '—',
      sub: profile ? `Origin: $${profile.starting_balance.toLocaleString()}` : '',
      icon: Activity,
      color: 'text-bull',
      glow: '#00ff88',
    },
    {
      label: 'TOTAL P&L',
      value: stats ? `${stats.total_pnl >= 0 ? '+' : ''}$${stats.total_pnl.toFixed(2)}` : '—',
      sub: stats ? `${stats.profit_percent >= 0 ? '+' : ''}${stats.profit_percent.toFixed(2)}% return` : '',
      icon: TrendingUp,
      color: stats?.total_pnl >= 0 ? 'text-bull' : 'text-bear',
      glow: stats?.total_pnl >= 0 ? '#00ff88' : '#ff3355',
    },
    {
      label: 'WIN RATE',
      value: stats?.total ? `${stats.win_rate}%` : '—',
      sub: stats?.total ? `${stats.wins}W / ${stats.losses}L` : 'No trades yet',
      icon: Target,
      color: 'text-cyber-cyan',
      glow: '#00e5ff',
    },
    {
      label: 'XP POINTS',
      value: profile ? `${profile.xp.toLocaleString()} XP` : '—',
      sub: levelInfo ? `LV.${levelInfo.currentLevel.level} — ${levelInfo.currentLevel.name}` : '',
      icon: Zap,
      color: 'text-xp',
      glow: '#8b5cf6',
    },
  ]

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Command Header */}
      <div className="relative overflow-hidden rounded-xl border border-border-dim p-5"
           style={{ background: 'linear-gradient(135deg, #020f1e 0%, #03101f 60%, #0a0820 100%)', boxShadow: '0 0 40px rgba(0,229,255,0.04)' }}>
        <div className="absolute inset-0 bg-grid-cyan bg-grid opacity-30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={12} className="text-cyber-cyan" />
              <span className="text-[9px] tracking-[0.25em] text-cyber-cyan/60 font-hud">NEURAL COMMAND CENTER</span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 mb-1">
              OPERATOR: <span className="text-cyber-cyan" style={{ textShadow: '0 0 12px rgba(0,229,255,0.4)' }}>{profile?.username?.toUpperCase() || 'TRADER'}</span>
            </h1>
            <p className="text-slate-500 text-xs max-w-xl leading-relaxed font-mono">
              "{dailyQuote}"
            </p>
          </div>
          {levelInfo && (
            <div className="flex-shrink-0 text-right">
              <div className="text-[9px] tracking-widest text-slate-600 font-hud mb-1">CLEARANCE</div>
              <div className="text-base font-bold text-cyber-cyan font-hud" style={{ textShadow: '0 0 10px rgba(0,229,255,0.5)' }}>
                {levelInfo.currentLevel.name.toUpperCase()}
              </div>
              <div className="text-[9px] text-slate-500 font-hud">LEVEL {levelInfo.currentLevel.level}</div>
              <div className="mt-2 w-24">
                <div className="progress-bar">
                  <div className="progress-fill bg-xp" style={{ width: `${levelInfo.progress}%` }} />
                </div>
                <div className="text-[8px] text-slate-600 font-mono mt-0.5 text-right">{levelInfo.progress}%</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EUR/USD Market Feed */}
      {quote && (
        <div className="card-cyber relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent" />
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <div className="text-[9px] tracking-widest text-slate-600 font-hud mb-0.5">EUR/USD FEED</div>
              <div className="text-2xl font-bold font-mono"
                   style={{ color: quote.percent_change >= 0 ? '#00ff88' : '#ff3355', textShadow: quote.percent_change >= 0 ? '0 0 12px rgba(0,255,136,0.3)' : '0 0 12px rgba(255,51,85,0.3)' }}>
                {quote.close?.toFixed(5)}
              </div>
            </div>
            <div className={`flex items-center gap-1 ${quote.percent_change >= 0 ? 'text-bull' : 'text-bear'}`}>
              {quote.percent_change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="font-mono text-sm font-bold">
                {quote.percent_change >= 0 ? '+' : ''}{quote.percent_change?.toFixed(2)}%
              </span>
            </div>
            <div className="flex gap-5">
              {[['OPEN', quote.open?.toFixed(5)], ['HIGH', quote.high?.toFixed(5)], ['LOW', quote.low?.toFixed(5)]].map(([l, v]) => (
                <div key={l}>
                  <div className="hud-label">{l}</div>
                  <div className="text-xs font-mono text-slate-300 tabular-nums">{v}</div>
                </div>
              ))}
            </div>
            {quote.source === 'simulated' && (
              <span className="ml-auto tag tag-gold text-[9px] tracking-widest font-hud">SIM DATA</span>
            )}
          </div>
        </div>
      )}

      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, sub, icon: Icon, color, glow }) => (
          <div key={label} className="card-cyber group relative overflow-hidden">
            <div className="corner-tl" />
            <div className="flex items-start justify-between mb-3">
              <div className="hud-label">{label}</div>
              <div className="w-7 h-7 rounded flex items-center justify-center"
                   style={{ background: `${glow}15`, border: `1px solid ${glow}30` }}>
                <Icon size={13} className={color} style={{ filter: `drop-shadow(0 0 4px ${glow})` }} />
              </div>
            </div>
            <div className={`text-xl font-bold font-mono tabular-nums ${color}`}
                 style={{ textShadow: `0 0 10px ${glow}40` }}>
              {value}
            </div>
            <div className="text-[9px] text-slate-600 font-mono mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Daily Routine */}
        <div className="card-cyber space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-cyber-cyan" />
              <span className="panel-title">DAILY OPS</span>
            </div>
            <Link to="/routine" className="flex items-center gap-1 text-[9px] text-cyber-cyan/60 hover:text-cyber-cyan transition-colors font-hud tracking-wider">
              OPEN <ArrowRight size={9} />
            </Link>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Pre-Market Analysis', done: dailyRoutine?.pre_market_done },
              { label: 'Trade Plan Written', done: dailyRoutine?.trade_plan },
              { label: 'Post-Trade Review', done: dailyRoutine?.post_review_done },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-2.5 py-1">
                <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors ${
                  done ? 'bg-bull/20 border-bull/60' : 'border-border-dim'
                }`}>
                  {done && <span className="text-[7px] text-bull font-bold">✓</span>}
                </div>
                <span className={`text-[10px] font-hud tracking-wider ${done ? 'text-slate-600 line-through' : 'text-slate-400'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum Progress */}
        <div className="card-cyber space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={12} className="text-gold" />
              <span className="panel-title">NEURAL TRAINING</span>
            </div>
            <Link to="/curriculum" className="flex items-center gap-1 text-[9px] text-cyber-cyan/60 hover:text-cyber-cyan transition-colors font-hud tracking-wider">
              STUDY <ArrowRight size={9} />
            </Link>
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[9px] text-slate-500 font-mono">{completedLessons.length} / {totalLessons} LESSONS</span>
              <span className="text-[9px] text-gold font-mono font-bold">{overallProgress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${overallProgress}%`, backgroundColor: '#ffd700', boxShadow: '0 0 6px rgba(255,215,0,0.4)' }} />
            </div>
          </div>
          <div className="space-y-1.5">
            {curriculum.slice(0, 3).map((mod) => {
              const done = completedLessons.filter((l) => l.module_id === mod.id).length
              const pct = Math.round((done / mod.lessons.length) * 100)
              return (
                <div key={mod.id} className="flex items-center gap-2">
                  <span className="text-sm">{mod.icon}</span>
                  <span className="text-[10px] text-slate-500 flex-1 truncate font-hud tracking-wider">{mod.title.toUpperCase()}</span>
                  <span className={`text-[9px] font-mono ${pct === 100 ? 'text-bull' : 'text-slate-600'}`}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Nav */}
        <div className="card-cyber space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={12} className="text-xp" />
            <span className="panel-title">QUICK ACCESS</span>
          </div>
          {[
            { to: '/simulator', icon: TrendingUp, label: 'TRADE SIMULATOR', color: 'text-bull', glow: '#00ff88' },
            { to: '/mentor', icon: Brain, label: 'AI MENTOR', color: 'text-cyber-cyan', glow: '#00e5ff' },
            { to: '/quiz', icon: Target, label: 'KNOWLEDGE OPS', color: 'text-xp', glow: '#8b5cf6' },
            { to: '/journal', icon: BookOpen, label: 'TRADE JOURNAL', color: 'text-gold', glow: '#ffd700' },
            { to: '/gamification', icon: Trophy, label: 'ACHIEVEMENTS', color: 'text-gold', glow: '#ffd700' },
          ].map(({ to, icon: Icon, label, color, glow }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-bg-elevated border border-transparent hover:border-border-dim transition-all group"
            >
              <Icon size={12} className={color} style={{ filter: `drop-shadow(0 0 4px ${glow})` }} />
              <span className="text-[9px] font-hud tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
              <ArrowRight size={10} className="ml-auto text-slate-700 group-hover:text-slate-500" />
            </Link>
          ))}
        </div>
      </div>

      {/* Trading Performance */}
      {stats && stats.total > 0 && (
        <div className="card-cyber">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={12} className="text-cyber-cyan" />
            <span className="panel-title">PERFORMANCE MATRIX</span>
            <Link to="/analytics" className="ml-auto flex items-center gap-1 text-[9px] text-cyber-cyan/60 hover:text-cyber-cyan font-hud tracking-wider transition-colors">
              FULL REPORT <ArrowRight size={9} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'PROFIT FACTOR', value: stats.profit_factor, display: stats.profit_factor.toFixed(2), good: stats.profit_factor >= 1.5 },
              { label: 'AVG R:R', value: stats.avg_rr, display: `${stats.avg_rr.toFixed(2)}:1`, good: stats.avg_rr >= 1.5 },
              { label: 'BEST TRADE', value: 1, display: `+$${stats.best_trade?.toFixed(0) || 0}`, good: true },
              { label: 'MAX DRAWDOWN', value: stats.max_drawdown < 500 ? 1 : 0, display: `$${stats.max_drawdown.toFixed(0)}`, good: stats.max_drawdown < 500 },
            ].map(({ label, display, good }) => (
              <div key={label} className="text-center">
                <div className="hud-label mb-1">{label}</div>
                <div className={`text-base font-bold font-mono tabular-nums ${good ? 'text-bull' : 'text-bear'}`}
                     style={{ textShadow: good ? '0 0 8px rgba(0,255,136,0.3)' : '0 0 8px rgba(255,51,85,0.3)' }}>
                  {display}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onboarding CTA */}
      {stats?.total === 0 && (
        <div className="card-cyber border-cyber-cyan/20 flex items-start gap-3"
             style={{ boxShadow: '0 0 20px rgba(0,229,255,0.05)' }}>
          <Shield size={16} className="text-cyber-cyan mt-0.5 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 6px #00e5ff)' }} />
          <div>
            <div className="text-sm font-bold text-slate-200 mb-1 font-hud tracking-wider">SYSTEM READY — AWAITING FIRST TRADE</div>
            <p className="text-xs text-slate-500 font-mono leading-relaxed">
              Access the{' '}
              <Link to="/curriculum" className="text-cyber-cyan hover:underline">Neural Training</Link>
              {' '}module to study EUR/USD trading, then execute your first trade in the{' '}
              <Link to="/simulator" className="text-cyber-cyan hover:underline">Trade Simulator</Link>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
