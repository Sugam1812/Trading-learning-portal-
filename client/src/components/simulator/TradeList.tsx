import { useState } from 'react'
import { TrendingUp, TrendingDown, X } from 'lucide-react'
import { Trade } from '../../store/useTradeStore'
import { formatPrice, formatPnL, formatPips } from '../../utils/calculations'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Props {
  openTrades: Trade[]
  recentTrades: Trade[]
  currentPrice: number | null
  onRefresh: () => void
}

export default function TradeList({ openTrades, recentTrades, currentPrice, onRefresh }: Props) {
  const [closing, setClosing] = useState<number | null>(null)
  const [tab, setTab] = useState<'open' | 'history'>('open')

  const handleClose = async (tradeId: number) => {
    if (!currentPrice) return toast.error('No current price available')
    setClosing(tradeId)
    try {
      const res = await axios.post(`/api/trades/close/${tradeId}`, { exit_price: currentPrice })
      toast.success(res.data.message)
      onRefresh()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to close trade')
    } finally {
      setClosing(null)
    }
  }

  const getFloatingPnL = (trade: Trade) => {
    if (!currentPrice) return 0
    const pips = trade.direction === 'buy'
      ? (currentPrice - trade.entry_price) * 10000
      : (trade.entry_price - currentPrice) * 10000
    return pips * 10 * trade.lot_size
  }

  const closedTrades = recentTrades.filter((t) => t.status !== 'open')

  return (
    <div className="space-y-2">
      {/* Tabs */}
      <div className="flex border border-border-dim rounded overflow-hidden">
        {([['open', `OPEN (${openTrades.length})`], ['history', `HISTORY (${closedTrades.length})`]] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-[9px] font-bold tracking-widest transition-colors font-hud ${
              tab === t ? 'bg-cyber-cyan/10 text-cyber-cyan' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Open Trades */}
      {tab === 'open' && (
        <div className="space-y-1.5">
          {openTrades.length === 0 && (
            <div className="text-center py-4 text-[9px] text-slate-600 font-mono">NO OPEN POSITIONS</div>
          )}
          {openTrades.map((trade) => {
            const floating = getFloatingPnL(trade)
            return (
              <div key={trade.id}
                className={`p-2.5 rounded border transition-all ${
                  trade.direction === 'buy' ? 'border-bull/20 bg-bull/5' : 'border-bear/20 bg-bear/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {trade.direction === 'buy'
                      ? <TrendingUp size={11} className="text-bull" style={{ filter: 'drop-shadow(0 0 3px #00ff88)' }} />
                      : <TrendingDown size={11} className="text-bear" style={{ filter: 'drop-shadow(0 0 3px #ff3355)' }} />}
                    <span className={`text-[9px] font-bold font-hud tracking-wider ${trade.direction === 'buy' ? 'text-bull' : 'text-bear'}`}>
                      {trade.direction.toUpperCase()}
                    </span>
                    <span className="text-[9px] text-slate-600 font-mono">{trade.lot_size}L</span>
                  </div>
                  <div className={`text-sm font-bold font-mono tabular-nums ${floating >= 0 ? 'text-bull' : 'text-bear'}`}
                       style={{ textShadow: floating >= 0 ? '0 0 6px rgba(0,255,136,0.3)' : '0 0 6px rgba(255,51,85,0.3)' }}>
                    {floating >= 0 ? '+' : ''}${floating.toFixed(2)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {[
                    { l: 'ENTRY', v: formatPrice(trade.entry_price), c: 'text-slate-300' },
                    { l: 'SL', v: formatPrice(trade.stop_loss), c: 'text-bear' },
                    { l: 'TP', v: formatPrice(trade.take_profit), c: 'text-bull' },
                  ].map(({ l, v, c }) => (
                    <div key={l}>
                      <div className="hud-label" style={{ fontSize: 8 }}>{l}</div>
                      <div className={`text-[9px] font-mono ${c}`}>{v}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleClose(trade.id)}
                  disabled={closing === trade.id}
                  className="w-full text-[9px] py-1.5 rounded bg-bg-elevated hover:bg-border-dim text-slate-400 hover:text-slate-200 border border-border-dim transition-colors flex items-center justify-center gap-1 font-hud tracking-wider"
                >
                  <X size={9} />
                  {closing === trade.id ? 'CLOSING...' : `CLOSE @ ${currentPrice ? formatPrice(currentPrice) : '...'}`}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="space-y-1">
          {closedTrades.length === 0 && (
            <div className="text-center py-4 text-[9px] text-slate-600 font-mono">NO TRADE HISTORY</div>
          )}
          {closedTrades.slice(0, 15).map((trade) => (
            <div key={trade.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-bg-elevated border border-border-dim">
              <div className={`w-1 h-4 rounded-full flex-shrink-0 ${trade.direction === 'buy' ? 'bg-bull' : 'bg-bear'}`}
                   style={{ boxShadow: trade.direction === 'buy' ? '0 0 4px #00ff88' : '0 0 4px #ff3355' }} />
              <span className={`text-[10px] font-mono font-bold tabular-nums ${trade.pnl && trade.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                {trade.pnl ? formatPnL(trade.pnl) : '—'}
              </span>
              <span className="text-[9px] text-slate-600 font-mono">{trade.pips ? formatPips(trade.pips) : '—'}</span>
              <span className="text-[9px] text-slate-700 flex-1 text-right font-mono truncate">{trade.strategy || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
