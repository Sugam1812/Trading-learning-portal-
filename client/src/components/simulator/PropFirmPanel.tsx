import { useEffect, useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingDown } from 'lucide-react'
import axios from 'axios'

interface DayStats {
  trades: any[]
  dailyPnL: number
  tradeCount: number
  dailyLossLimit: number
  dailyLossPercent: number
  drawdownPercent: number
  rules: { maxDailyLossPercent: number; maxDrawdownPercent: number; maxTradesPerDay: number }
  blocked: boolean
}

export default function PropFirmPanel({ refresh }: { refresh?: number }) {
  const [stats, setStats] = useState<DayStats | null>(null)

  useEffect(() => {
    axios.get('/api/trades/today').then((res) => setStats(res.data)).catch(() => {})
  }, [refresh])

  if (!stats) return null

  const dailyLossUsed = Math.abs(Math.min(0, stats.dailyPnL))
  const dailyLossPct = (dailyLossUsed / stats.dailyLossLimit) * 100
  const drawdownPct = stats.drawdownPercent

  const rules = [
    {
      label: 'DAILY LOSS LIMIT',
      value: `${stats.dailyLossPercent.toFixed(1)}% / ${stats.rules.maxDailyLossPercent}%`,
      ok: stats.dailyLossPercent < stats.rules.maxDailyLossPercent * 0.8,
      warn: stats.dailyLossPercent >= stats.rules.maxDailyLossPercent * 0.6,
      pct: dailyLossPct,
      color: dailyLossPct > 80 ? '#ff3355' : dailyLossPct > 60 ? '#ffd700' : '#00ff88',
    },
    {
      label: 'MAX DRAWDOWN',
      value: `${drawdownPct.toFixed(1)}% / ${stats.rules.maxDrawdownPercent}%`,
      ok: drawdownPct < stats.rules.maxDrawdownPercent * 0.8,
      warn: drawdownPct >= stats.rules.maxDrawdownPercent * 0.6,
      pct: (drawdownPct / stats.rules.maxDrawdownPercent) * 100,
      color: drawdownPct > 8 ? '#ff3355' : drawdownPct > 6 ? '#ffd700' : '#00ff88',
    },
    {
      label: 'TRADES TODAY',
      value: `${stats.tradeCount} / ${stats.rules.maxTradesPerDay}`,
      ok: stats.tradeCount < stats.rules.maxTradesPerDay * 0.8,
      warn: stats.tradeCount >= stats.rules.maxTradesPerDay * 0.6,
      pct: (stats.tradeCount / stats.rules.maxTradesPerDay) * 100,
      color: stats.tradeCount >= stats.rules.maxTradesPerDay ? '#ff3355' : stats.tradeCount >= 7 ? '#ffd700' : '#00ff88',
    },
  ]

  return (
    <div className="card-cyber space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={12} className="text-cyber-cyan" />
          <span className="panel-title">PROP FIRM RULES</span>
        </div>
        {stats.blocked ? (
          <div className="flex items-center gap-1 text-[9px] text-bear bg-bear/10 px-2 py-0.5 rounded border border-bear/30 font-hud tracking-wider">
            <XCircle size={9} />
            BLOCKED
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[9px] text-bull bg-bull/10 px-2 py-0.5 rounded border border-bull/30 font-hud tracking-wider">
            <CheckCircle size={9} />
            ACTIVE
          </div>
        )}
      </div>

      {/* Daily P&L */}
      <div className={`p-2.5 rounded border ${stats.dailyPnL >= 0 ? 'bg-bull/5 border-bull/20' : 'bg-bear/5 border-bear/20'}`}>
        <div className="hud-label mb-0.5">TODAY'S P&L</div>
        <div className={`text-base font-bold font-mono tabular-nums ${stats.dailyPnL >= 0 ? 'text-bull' : 'text-bear'}`}
             style={{ textShadow: stats.dailyPnL >= 0 ? '0 0 8px rgba(0,255,136,0.3)' : '0 0 8px rgba(255,51,85,0.3)' }}>
          {stats.dailyPnL >= 0 ? '+' : ''}${stats.dailyPnL.toFixed(2)}
        </div>
      </div>

      {/* Rules */}
      <div className="space-y-2.5">
        {rules.map((rule) => (
          <div key={rule.label}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5">
                {rule.ok
                  ? <CheckCircle size={10} className="text-bull" />
                  : rule.warn
                  ? <AlertTriangle size={10} className="text-gold" />
                  : <XCircle size={10} className="text-bear" />}
                <span className="hud-label">{rule.label}</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 tabular-nums">{rule.value}</span>
            </div>
            <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, rule.pct)}%`, backgroundColor: rule.color, boxShadow: `0 0 4px ${rule.color}60` }}
              />
            </div>
          </div>
        ))}
      </div>

      {stats.blocked && (
        <div className="flex items-start gap-2 bg-bear/5 border border-bear/20 rounded p-2.5">
          <TrendingDown size={12} className="text-bear mt-0.5 flex-shrink-0" />
          <div className="text-[9px] text-bear font-mono leading-relaxed">
            TRADING BLOCKED — A discipline rule was violated. Return tomorrow with a fresh mindset.
          </div>
        </div>
      )}

      {!stats.blocked && stats.tradeCount >= 2 && (
        <div className="text-[8px] text-slate-600 border-t border-border-dim pt-2 font-mono leading-relaxed">
          {stats.tradeCount >= 7
            ? '⚠ Approaching trade limit — be very selective'
            : stats.dailyLossPercent > 3
            ? '⚠ Significant daily loss — reduce size'
            : '✓ Staying disciplined. Keep it up.'}
        </div>
      )}
    </div>
  )
}
