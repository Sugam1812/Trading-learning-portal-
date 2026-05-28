import { useEffect, useState } from 'react'
import { Wifi, WifiOff, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { formatPrice, getCurrentSession } from '../../utils/calculations'
import axios from 'axios'

export default function Header() {
  const { profile } = useAppStore()
  const [price, setPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [connected, setConnected] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await axios.get('/api/market/price')
        setPrice((prev) => {
          if (prev !== null) setPriceChange(res.data.price - prev)
          return res.data.price
        })
        setConnected(true)
      } catch {
        setConnected(false)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const session = getCurrentSession()

  return (
    <header className="sticky top-0 z-20 bg-bg-secondary/95 backdrop-blur-sm border-b border-border-dim h-14 flex items-center px-4 gap-4">
      {/* EUR/USD Price */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-bg-elevated px-3 py-1.5 rounded-lg border border-border-dim">
          <span className="text-xs text-slate-500 font-mono">EUR/USD</span>
          {price ? (
            <>
              <span className="font-mono text-sm font-bold text-slate-100">{formatPrice(price)}</span>
              {priceChange !== 0 && (
                <span className={`flex items-center gap-0.5 text-xs font-mono ${priceChange > 0 ? 'text-bull' : 'text-bear'}`}>
                  {priceChange > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {priceChange > 0 ? '+' : ''}{(priceChange * 10000).toFixed(1)}p
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-500 font-mono">Loading...</span>
          )}
        </div>

        {/* Session indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          <div className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse" />
          {session}
        </div>
      </div>

      <div className="flex-1" />

      {/* Time */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
        <Clock size={12} />
        {time.toUTCString().split(' ').slice(4, 5).join(' ')} UTC
      </div>

      {/* Connection status */}
      <div className={`flex items-center gap-1 text-xs ${connected ? 'text-bull' : 'text-slate-500'}`}>
        {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
        <span className="hidden sm:inline">{connected ? 'Live' : 'Sim'}</span>
      </div>

      {/* Balance */}
      {profile && (
        <div className="flex items-center gap-2 bg-bg-elevated px-3 py-1.5 rounded-lg border border-border-dim">
          <span className="text-xs text-slate-500">Balance</span>
          <span className="font-mono text-sm font-bold text-slate-100">
            ${profile.account_balance.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </header>
  )
}
