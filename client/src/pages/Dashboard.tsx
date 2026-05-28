import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, BookOpen, Brain, Target,
  Calendar, Trophy, Zap, AlertCircle, ArrowRight, BarChart2
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
    "The market is a device for transferring money from the impatient to the patient. — Warren Buffett",
    "In trading, the person who wins is the one who loses the least. — Unknown",
    "Plan the trade. Trade the plan. — Unknown",
  ]
  const dailyQuote = TRADING_QUOTES[new Date().getDay() % TRADING_QUOTES.length]

  const statCards = [
    {
      label: 'Account Balance',
      value: profile ? `$${profile.account_balance.toLocaleString('en', { minimumFractionDigits: 2 })}` : '-',
      sub: profile ? `Started at $${profile.starting_balance.toLocaleString()}` : '',
      icon: TrendingUp,
      color: 'text-bull',
      bg: 'bg-bull/10',
    },
    {
      label: 'Total P&L',
      value: stats ? `${stats.total_pnl >= 0 ? '+' : ''}$${stats.total_pnl.toFixed(2)}` : '-',
      sub: stats ? `${stats.profit_percent >= 0 ? '+' : ''}${stats.profit_percent.toFixed(2)}% return` : '',
      icon: BarChart2,
      color: stats?.total_pnl >= 0 ? 'text-bull' : 'text-bear',
      bg: stats?.total_pnl >= 0 ? 'bg-bull/10' : 'bg-bear/10',
    },
    {
      label: 'Win Rate',
      value: stats?.total ? `${stats.win_rate}%` : '-',
      sub: stats?.total ? `${stats.wins}W / ${stats.losses}L` : 'No trades yet',
      icon: Target,
      color: 'text-accent-blue',
      bg: 'bg-accent-blue/10',
    },
    {
      label: 'XP Points',
      value: profile ? `${profile.xp.toLocaleString()} XP` : '-',
      sub: levelInfo ? `Level ${levelInfo.currentLevel.level} — ${levelInfo.currentLevel.name}` : '',
      icon: Zap,
      color: 'text-xp',
      bg: 'bg-xp/10',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-accent-blue/10 to-xp/5 border border-accent-blue/20 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">
              Welcome back, {profile?.username || 'Trader'} 👋
            </h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              "{dailyQuote}"
            </p>
          </div>
          {levelInfo && (
            <div className="flex-shrink-0 text-center">
              <div className="text-3xl mb-1">
                {levelInfo.currentLevel.level >= 8 ? '🏆' : levelInfo.currentLevel.level >= 5 ? '⭐' : '📈'}
              </div>
              <div className="text-xs font-bold text-slate-200">{levelInfo.currentLevel.name}</div>
              <div className="text-[10px] text-slate-500">Lv.{levelInfo.currentLevel.level}</div>
            </div>
          )}
        </div>
      </div>

      {/* EUR/USD Market Snapshot */}
      {quote && (
        <div className="card flex items-center gap-6">
          <div>
            <div className="text-xs text-slate-500 mb-0.5">EUR/USD</div>
            <div className="text-2xl font-bold font-mono text-slate-100">{quote.close?.toFixed(5)}</div>
          </div>
          <div className={`flex items-center gap-1 ${quote.percent_change >= 0 ? 'text-bull' : 'text-bear'}`}>
            {quote.percent_change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-mono text-sm font-semibold">
              {quote.percent_change >= 0 ? '+' : ''}{quote.percent_change?.toFixed(2)}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 ml-4">
            {[['Open', quote.open?.toFixed(5)], ['High', quote.high?.toFixed(5)], ['Low', quote.low?.toFixed(5)]].map(([l, v]) => (
              <div key={l}>
                <div className="text-[10px] text-slate-500">{l}</div>
                <div className="text-xs font-mono text-slate-300">{v}</div>
              </div>
            ))}
          </div>
          {quote.source === 'simulated' && (
            <span className="ml-auto text-[10px] tag tag-gold">Simulated Data</span>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
              <Icon size={16} className={color} />
            </div>
            <div className="text-xs text-slate-500">{label}</div>
            <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
            <div className="text-[10px] text-slate-600">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Routine */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-accent-blue" />
              <span className="text-sm font-semibold text-slate-200">Daily Routine</span>
            </div>
            <Link to="/routine" className="text-[10px] text-accent-blue hover:underline flex items-center gap-1">
              Open <ArrowRight size={10} />
            </Link>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Pre-Market Analysis', done: dailyRoutine?.pre_market_done },
              { label: 'Trade Plan Written', done: dailyRoutine?.trade_plan },
              { label: 'Post-Trade Review', done: dailyRoutine?.post_review_done },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${done ? 'bg-bull border-bull' : 'border-border'}`}>
                  {done && <span className="text-[8px] text-bg-primary font-bold">✓</span>}
                </div>
                <span className={`text-xs ${done ? 'text-slate-400 line-through' : 'text-slate-300'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum Progress */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-gold" />
              <span className="text-sm font-semibold text-slate-200">Curriculum</span>
            </div>
            <Link to="/curriculum" className="text-[10px] text-accent-blue hover:underline flex items-center gap-1">
              Study <ArrowRight size={10} />
            </Link>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">{completedLessons.length} / {totalLessons} lessons</span>
              <span className="text-gold font-semibold">{overallProgress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill bg-gold" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
          <div className="space-y-1.5">
            {curriculum.slice(0, 3).map((mod) => {
              const done = completedLessons.filter((l) => l.module_id === mod.id).length
              const pct = Math.round((done / mod.lessons.length) * 100)
              return (
                <div key={mod.id} className="flex items-center gap-2 text-xs">
                  <span className="text-base">{mod.icon}</span>
                  <span className="text-slate-400 flex-1 truncate">{mod.title}</span>
                  <span className={`font-semibold ${pct === 100 ? 'text-bull' : 'text-slate-500'}`}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Brain size={14} className="text-xp" />
            <span className="text-sm font-semibold text-slate-200">Quick Actions</span>
          </div>
          {[
            { to: '/simulator', icon: TrendingUp, label: 'Open Trade Simulator', color: 'text-bull' },
            { to: '/mentor', icon: Brain, label: 'Ask AI Mentor', color: 'text-accent-blue' },
            { to: '/quiz', icon: Target, label: 'Take a Quiz', color: 'text-xp' },
            { to: '/journal', icon: BookOpen, label: 'Log Trade Journal', color: 'text-gold' },
            { to: '/gamification', icon: Trophy, label: 'View Achievements', color: 'text-gold' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-bg-elevated transition-colors group"
            >
              <Icon size={14} className={color} />
              <span className="text-xs text-slate-300 group-hover:text-slate-100 transition-colors">{label}</span>
              <ArrowRight size={12} className="ml-auto text-slate-600 group-hover:text-slate-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Trading Stats */}
      {stats && stats.total > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={14} className="text-accent-blue" />
            <span className="text-sm font-semibold text-slate-200">Trading Performance</span>
            <Link to="/analytics" className="ml-auto text-[10px] text-accent-blue hover:underline flex items-center gap-1">
              Full Report <ArrowRight size={10} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Profit Factor', value: stats.profit_factor, good: stats.profit_factor >= 1.5, suffix: '' },
              { label: 'Avg R:R', value: stats.avg_rr.toFixed(2), good: stats.avg_rr >= 1.5, suffix: ':1' },
              { label: 'Best Trade', value: `+$${stats.best_trade.toFixed(0)}`, good: true },
              { label: 'Max Drawdown', value: `$${stats.max_drawdown.toFixed(0)}`, good: stats.max_drawdown < 500 },
            ].map(({ label, value, good, suffix }) => (
              <div key={label} className="text-center">
                <div className="text-xs text-slate-500 mb-1">{label}</div>
                <div className={`text-base font-bold font-mono ${good ? 'text-bull' : 'text-bear'}`}>
                  {value}{suffix}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.total === 0 && (
        <div className="card flex items-start gap-3 border-accent-blue/20 bg-accent-blue/5">
          <AlertCircle size={16} className="text-accent-blue mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-slate-200 mb-1">Ready to Start Trading?</div>
            <p className="text-xs text-slate-400">
              Visit the <Link to="/curriculum" className="text-accent-blue hover:underline">Curriculum</Link> to learn EUR/USD trading, then practice in the <Link to="/simulator" className="text-accent-blue hover:underline">Simulator</Link>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
