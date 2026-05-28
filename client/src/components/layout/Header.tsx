import { useEffect, useState } from 'react'
import { Wifi, WifiOff, TrendingUp, TrendingDown, Activity, Signal } from 'lucide-react'
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
    <header
      className="sticky top-0 z-20 border-b border-border-dim h-12 flex items-center px-4 gap-3"
      style={{ background: 'rgba(3,16,31,0.95)', backdropFilter: 'blur(12px)' }}
    >
      {/* EUR/USD Price display */}
      <div className="flex items-center gap-2 bg-bg-elevated border border-border-dim rounded px-3 h-7">
        <span className="text-[9px] tracking-widest text-slate-600 font-hud">EUR/USD</span>
        {price ? (
          <>
            <span
              className="font-mono text-sm font-bold"
              style={{ color: priceChange >= 0 ? '#00ff88' : '#ff3355', textShadow: priceChange >= 0 ? '0 0 8px rgba(0,255,136,0.4)' : '0 0 8px rgba(255,51,85,0.4)' }}
            >
              {formatPrice(price)}
            </span>
            {priceChange !== 0 && (
              <span className={`flex items-center gap-0.5 text-[10px] font-mono ${priceChange > 0 ? 'text-bull' : 'text-bear'}`}>
                {priceChange > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {priceChange > 0 ? '+' : ''}{(priceChange * 10000).toFixed(1)}p
              </span>
            )}
          </>
        ) : (
          <span className="text-[10px] text-slate-600 font-mono animate-pulse">LOADING</span>
        )}
      </div>

      {/* Session tag */}
      <div className="hidden sm:flex items-center gap-1.5">
        <div className="dot-live animate-pulse-fast" />
        <span className="text-[9px] tracking-widest text-slate-500 font-hud">{session}</span>
      </div>

      <div className="flex-1" />

      {/* UTC Clock */}
      <div className="hidden sm:flex items-center gap-1.5 bg-bg-elevated border border-border-dim rounded px-2.5 h-7">
        <Activity size={10} className="text-cyber-cyan/60" />
        <span className="text-[10px] font-mono text-slate-400 tabular-nums">
          {time.toUTCString().slice(17, 25)} UTC
        </span>
      </div>

      {/* Connection status */}
      <div className="flex items-center gap-1.5">
        {connected ? (
          <>
            <Signal size={12} className="text-bull" style={{ filter: 'drop-shadow(0 0 4px #00ff88)' }} />
            <span className="text-[9px] tracking-widest text-bull font-hud hidden sm:inline">LIVE</span>
          </>
        ) : (
          <>
            <WifiOff size={12} className="text-slate-600" />
            <span className="text-[9px] tracking-widest text-slate-600 font-hud hidden sm:inline">SIM</span>
          </>
        )}
      </div>

      {/* Balance */}
      {profile && (
        <div className="flex items-center gap-2 bg-bg-elevated border border-cyber-cyan/20 rounded px-3 h-7"
             style={{ boxShadow: '0 0 8px rgba(0,229,255,0.05)' }}>
          <span className="text-[9px] tracking-widest text-slate-600 font-hud">BALANCE</span>
          <span className="font-mono text-sm font-bold text-cyber-cyan tabular-nums"
                style={{ textShadow: '0 0 8px rgba(0,229,255,0.3)' }}>
            ${profile.account_balance.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </header>
  )
}
