import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Shield, Target, AlertTriangle, Calculator } from 'lucide-react'
import { calcLotSize, calcRR, calcSLPips, calcPips, formatPrice } from '../../utils/calculations'
import { useAppStore } from '../../store/useAppStore'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Props {
  currentPrice: number | null
  onTradeOpened: () => void
}

const SESSIONS = ['London Session', 'New York Session', 'London/NY Overlap', 'Asian Session', 'Off Hours']
const STRATEGIES = ['Pin Bar', 'Engulfing', 'London Breakout', 'S/R Bounce', 'SMC Setup', 'Range Trade', 'Other']

export default function TradeForm({ currentPrice, onTradeOpened }: Props) {
  const { profile } = useAppStore()
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy')
  const [entryPrice, setEntryPrice] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [riskPercent, setRiskPercent] = useState('1')
  const [session, setSession] = useState(SESSIONS[0])
  const [strategy, setStrategy] = useState(STRATEGIES[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [violations, setViolations] = useState<string[]>([])

  useEffect(() => {
    if (currentPrice && !entryPrice) {
      setEntryPrice(formatPrice(currentPrice))
    }
  }, [currentPrice])

  const entry = parseFloat(entryPrice)
  const sl = parseFloat(stopLoss)
  const tp = parseFloat(takeProfit)
  const risk = parseFloat(riskPercent)
  const balance = profile?.account_balance ?? 10000

  const slPips = entry && sl ? calcSLPips(entry, sl) : 0
  const lotSize = entry && sl && risk ? calcLotSize(balance, risk, slPips) : 0
  const rr = entry && sl && tp ? calcRR(entry, sl, tp) : 0
  const riskAmount = (risk / 100) * balance

  const fillFromCurrentPrice = () => {
    if (currentPrice) {
      setEntryPrice(formatPrice(currentPrice))
      if (direction === 'buy') {
        setStopLoss(formatPrice(currentPrice - 0.0020))
        setTakeProfit(formatPrice(currentPrice + 0.0040))
      } else {
        setStopLoss(formatPrice(currentPrice + 0.0020))
        setTakeProfit(formatPrice(currentPrice - 0.0040))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entry || !sl || !tp) {
      toast.error('Fill in all price fields')
      return
    }

    if (direction === 'buy' && sl >= entry) {
      toast.error('Stop Loss must be below entry for a BUY trade')
      return
    }
    if (direction === 'sell' && sl <= entry) {
      toast.error('Stop Loss must be above entry for a SELL trade')
      return
    }

    setLoading(true)
    setViolations([])
    try {
      await axios.post('/api/trades/open', {
        direction,
        entry_price: entry,
        stop_loss: sl,
        take_profit: tp,
        lot_size: lotSize,
        risk_percent: risk,
        session,
        strategy,
        notes,
      })

      toast.success(`${direction.toUpperCase()} trade opened at ${formatPrice(entry)}`)
      onTradeOpened()
      setNotes('')
    } catch (err: any) {
      if (err.response?.data?.violations) {
        setViolations(err.response.data.violations)
        toast.error('Trade blocked by discipline rules!', { duration: 4000 })
      } else {
        toast.error(err.response?.data?.error || 'Failed to open trade')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Direction */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setDirection('buy')}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${
            direction === 'buy'
              ? 'bg-bull text-bg-primary shadow-lg shadow-bull/20'
              : 'bg-bull/10 text-bull border border-bull/30 hover:bg-bull/20'
          }`}
        >
          <TrendingUp size={16} />
          BUY
        </button>
        <button
          type="button"
          onClick={() => setDirection('sell')}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${
            direction === 'sell'
              ? 'bg-bear text-white shadow-lg shadow-bear/20'
              : 'bg-bear/10 text-bear border border-bear/30 hover:bg-bear/20'
          }`}
        >
          <TrendingDown size={16} />
          SELL
        </button>
      </div>

      {/* Quick fill */}
      <button
        type="button"
        onClick={fillFromCurrentPrice}
        className="w-full text-xs text-slate-400 hover:text-accent-blue border border-border-dim hover:border-accent-blue/50 rounded-lg py-2 transition-colors"
      >
        <Calculator size={12} className="inline mr-1.5" />
        Auto-fill from current price (±20 pip default)
      </button>

      {/* Prices */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Entry Price</label>
          <input
            className="input-field font-mono"
            type="number"
            step="0.00001"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            placeholder="1.08500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs flex items-center gap-1 text-slate-400 mb-1">
              <Shield size={10} className="text-bear" />
              Stop Loss
            </label>
            <input
              className="input-field font-mono"
              type="number"
              step="0.00001"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder={direction === 'buy' ? '1.08300' : '1.08700'}
            />
          </div>
          <div>
            <label className="text-xs flex items-center gap-1 text-slate-400 mb-1">
              <Target size={10} className="text-bull" />
              Take Profit
            </label>
            <input
              className="input-field font-mono"
              type="number"
              step="0.00001"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder={direction === 'buy' ? '1.08900' : '1.08100'}
            />
          </div>
        </div>
      </div>

      {/* Risk */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Risk % per Trade</label>
        <div className="flex items-center gap-2">
          <input
            className="input-field font-mono flex-1"
            type="number"
            step="0.1"
            min="0.1"
            max="5"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
          />
          <div className="flex gap-1">
            {['0.5', '1', '2'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setRiskPercent(v)}
                className={`text-xs px-2 py-1.5 rounded border transition-colors ${
                  riskPercent === v
                    ? 'bg-accent-blue/20 border-accent-blue/50 text-accent-blue'
                    : 'border-border-dim text-slate-400 hover:border-border'
                }`}
              >
                {v}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calculated stats */}
      {entry && sl && tp && lotSize > 0 && (
        <div className="bg-bg-elevated rounded-lg p-3 border border-border-dim space-y-2">
          <div className="text-xs font-semibold text-slate-300 mb-2">Trade Calculation</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Lot Size</span>
              <span className="font-mono text-slate-200">{lotSize.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Risk $</span>
              <span className="font-mono text-bear">${riskAmount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SL Pips</span>
              <span className="font-mono text-slate-200">{slPips.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">R:R</span>
              <span className={`font-mono font-bold ${rr >= 2 ? 'text-bull' : rr >= 1.5 ? 'text-gold' : 'text-bear'}`}>
                1:{rr.toFixed(2)}
              </span>
            </div>
          </div>
          {rr < 1.5 && (
            <div className="text-[10px] text-bear bg-bear/10 rounded px-2 py-1">
              ⚠ R:R below 1:1.5 — consider adjusting levels
            </div>
          )}
        </div>
      )}

      {/* Session & Strategy */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Session</label>
          <select className="input-field text-xs" value={session} onChange={(e) => setSession(e.target.value)}>
            {SESSIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Strategy</label>
          <select className="input-field text-xs" value={strategy} onChange={(e) => setStrategy(e.target.value)}>
            {STRATEGIES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Trade Notes</label>
        <textarea
          className="textarea-field text-xs"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Why are you taking this trade? What's the setup?"
        />
      </div>

      {/* Violations */}
      {violations.length > 0 && (
        <div className="bg-bear/10 border border-bear/30 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-bear mb-1">
            <AlertTriangle size={12} />
            Trade Blocked — Rule Violations
          </div>
          {violations.map((v, i) => (
            <div key={i} className="text-xs text-bear/90">• {v}</div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !entry || !sl || !tp}
        className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
          direction === 'buy'
            ? 'btn-bull disabled:opacity-50 disabled:cursor-not-allowed'
            : 'btn-bear disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {loading ? 'Opening...' : `Open ${direction.toUpperCase()} Trade`}
      </button>
    </form>
  )
}
