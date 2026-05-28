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

interface Props {
  refresh?: number
}

export default function PropFirmPanel({ refresh }: Props) {
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
      label: 'Daily Loss Limit',
      value: `${stats.dailyLossPercent.toFixed(1)}% / ${stats.rules.maxDailyLossPercent}%`,
      ok: stats.dailyLossPercent < stats.rules.maxDailyLossPercent * 0.8,
      warn: stats.dailyLossPercent >= stats.rules.maxDailyLossPercent * 0.6,
      pct: dailyLossPct,
      color: dailyLossPct > 80 ? '#ff4757' : dailyLossPct > 60 ? '#f59e0b' : '#00d4aa',
    },
    {
      label: 'Max Drawdown',
      value: `${drawdownPct.toFixed(1)}% / ${stats.rules.maxDrawdownPercent}%`,
      ok: drawdownPct < stats.rules.maxDrawdownPercent * 0.8,
      warn: drawdownPct >= stats.rules.maxDrawdownPercent * 0.6,
      pct: (drawdownPct / stats.rules.maxDrawdownPercent) * 100,
      color: drawdownPct > 8 ? '#ff4757' : drawdownPct > 6 ? '#f59e0b' : '#00d4aa',
    },
    {
      label: 'Trades Today',
      value: `${stats.tradeCount} / ${stats.rules.maxTradesPerDay}`,
      ok: stats.tradeCount < stats.rules.maxTradesPerDay * 0.8,
      warn: stats.tradeCount >= stats.rules.maxTradesPerDay * 0.6,
      pct: (stats.tradeCount / stats.rules.maxTradesPerDay) * 100,
      color: stats.tradeCount >= stats.rules.maxTradesPerDay ? '#ff4757' : stats.tradeCount >= 7 ? '#f59e0b' : '#00d4aa',
    },
  ]

  return (
    <div className="bg-bg-card border border-border-dim rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={15} className="text-accent-blue" />
          <span className="text-sm font-semibold text-slate-200">Prop Firm Rules</span>
        </div>
        {stats.blocked ? (
          <div className="flex items-center gap-1 text-xs text-bear bg-bear/10 px-2 py-0.5 rounded-full border border-bear/30">
            <XCircle size={10} />
            BLOCKED
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-bull bg-bull/10 px-2 py-0.5 rounded-full border border-bull/30">
            <CheckCircle size={10} />
            ACTIVE
          </div>
        )}
      </div>

      {/* Daily P&L */}
      <div className={`p-3 rounded-lg border ${stats.dailyPnL >= 0 ? 'bg-bull/5 border-bull/20' : 'bg-bear/5 border-bear/20'}`}>
        <div className="text-xs text-slate-500 mb-0.5">Today's P&L</div>
        <div className={`text-lg font-bold font-mono ${stats.dailyPnL >= 0 ? 'text-bull' : 'text-bear'}`}>
          {stats.dailyPnL >= 0 ? '+' : ''}${stats.dailyPnL.toFixed(2)}
        </div>
      </div>

      {/* Rules */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.label}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                {rule.ok ? (
                  <CheckCircle size={11} className="text-bull" />
                ) : rule.warn ? (
                  <AlertTriangle size={11} className="text-gold" />
                ) : (
                  <XCircle size={11} className="text-bear" />
                )}
                {rule.label}
              </div>
              <span className="text-xs font-mono text-slate-300">{rule.value}</span>
            </div>
            <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, rule.pct)}%`, backgroundColor: rule.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      {stats.blocked && (
        <div className="flex items-start gap-2 bg-bear/10 border border-bear/30 rounded-lg p-3">
          <TrendingDown size={14} className="text-bear mt-0.5 flex-shrink-0" />
          <div className="text-xs text-bear">
            Trading is blocked for today. A discipline rule has been violated. Come back tomorrow with a fresh mindset.
          </div>
        </div>
      )}

      {/* Tips */}
      {!stats.blocked && stats.tradeCount >= 2 && (
        <div className="text-[10px] text-slate-500 border-t border-border-dim pt-3">
          💡 {stats.tradeCount >= 7
            ? 'Approaching trade limit — be very selective.'
            : stats.dailyLossPercent > 3
            ? 'Significant daily loss — consider reducing size.'
            : 'Staying disciplined. Keep it up.'}
        </div>
      )}
    </div>
  )
}
