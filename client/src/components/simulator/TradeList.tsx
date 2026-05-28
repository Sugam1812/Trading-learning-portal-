import { useState } from 'react'
import { TrendingUp, TrendingDown, X, ExternalLink } from 'lucide-react'
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
    if (!currentPrice) {
      toast.error('No current price available')
      return
    }
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

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex border border-border-dim rounded-lg overflow-hidden">
        <button
          onClick={() => setTab('open')}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            tab === 'open' ? 'bg-accent-blue/20 text-accent-blue' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Open ({openTrades.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            tab === 'history' ? 'bg-accent-blue/20 text-accent-blue' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          History ({recentTrades.filter((t) => t.status !== 'open').length})
        </button>
      </div>

      {/* Open Trades */}
      {tab === 'open' && (
        <div className="space-y-2">
          {openTrades.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-500">No open trades</div>
          )}
          {openTrades.map((trade) => {
            const floating = getFloatingPnL(trade)
            return (
              <div
                key={trade.id}
                className={`p-3 rounded-lg border transition-all ${
                  trade.direction === 'buy' ? 'border-bull/20 bg-bull/5' : 'border-bear/20 bg-bear/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {trade.direction === 'buy' ? (
                      <TrendingUp size={13} className="text-bull" />
                    ) : (
                      <TrendingDown size={13} className="text-bear" />
                    )}
                    <span className={`text-xs font-bold ${trade.direction === 'buy' ? 'text-bull' : 'text-bear'}`}>
                      {trade.direction.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500">{trade.lot_size} lot</span>
                  </div>
                  <div className={`text-sm font-bold font-mono ${floating >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {floating >= 0 ? '+' : ''}${floating.toFixed(2)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500 mb-2">
                  <div>Entry: <span className="text-slate-300 font-mono">{formatPrice(trade.entry_price)}</span></div>
                  <div>SL: <span className="text-bear font-mono">{formatPrice(trade.stop_loss)}</span></div>
                  <div>TP: <span className="text-bull font-mono">{formatPrice(trade.take_profit)}</span></div>
                </div>
                <button
                  onClick={() => handleClose(trade.id)}
                  disabled={closing === trade.id}
                  className="w-full text-xs py-1.5 rounded bg-bg-elevated hover:bg-border-dim text-slate-300 border border-border-dim transition-colors flex items-center justify-center gap-1"
                >
                  <X size={11} />
                  {closing === trade.id ? 'Closing...' : `Close at ${currentPrice ? formatPrice(currentPrice) : '...'}`}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="space-y-1.5">
          {recentTrades.filter((t) => t.status !== 'open').length === 0 && (
            <div className="text-center py-6 text-xs text-slate-500">No closed trades yet</div>
          )}
          {recentTrades
            .filter((t) => t.status !== 'open')
            .slice(0, 15)
            .map((trade) => (
              <div key={trade.id} className="flex items-center gap-2 p-2 rounded-lg bg-bg-elevated border border-border-dim text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${trade.direction === 'buy' ? 'bg-bull' : 'bg-bear'}`} />
                <span className={`font-mono font-semibold ${trade.pnl && trade.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {trade.pnl ? formatPnL(trade.pnl) : '-'}
                </span>
                <span className="text-slate-500">{trade.pips ? formatPips(trade.pips) : '-'}</span>
                <span className="text-slate-600 flex-1 text-right">{trade.strategy || '-'}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
