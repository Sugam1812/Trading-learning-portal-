import { useEffect, useState, useCallback } from 'react'
import TradingChart from '../components/simulator/TradingChart'
import TradeForm from '../components/simulator/TradeForm'
import PropFirmPanel from '../components/simulator/PropFirmPanel'
import TradeList from '../components/simulator/TradeList'
import { useTradeStore } from '../store/useTradeStore'
import { useAppStore } from '../store/useAppStore'
import { TrendingUp } from 'lucide-react'
import axios from 'axios'

export default function Simulator() {
  const { openTrades, recentTrades, setOpenTrades, setRecentTrades, setStats } = useTradeStore()
  const { setProfile } = useAppStore()
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [refresh, setRefresh] = useState(0)

  const loadTrades = useCallback(async () => {
    try {
      const [openRes, allRes] = await Promise.all([
        axios.get('/api/trades/open'),
        axios.get('/api/trades'),
      ])
      setOpenTrades(openRes.data)
      setRecentTrades(allRes.data)
      const statsRes = await axios.get('/api/trades/stats')
      setStats(statsRes.data)
      const profileRes = await axios.get('/api/progress/profile')
      setProfile(profileRes.data)
    } catch {}
  }, [])

  useEffect(() => { loadTrades() }, [])

  const handleTradeOpened = () => {
    loadTrades()
    setRefresh((r) => r + 1)
  }

  return (
    <div className="h-[calc(100vh-3rem)] flex gap-3">
      {/* Chart + trades */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex-1 min-h-0">
          <TradingChart openTrades={openTrades} onPriceUpdate={setCurrentPrice} />
        </div>
        <div className="h-52 overflow-y-auto">
          <TradeList openTrades={openTrades} recentTrades={recentTrades} currentPrice={currentPrice} onRefresh={handleTradeOpened} />
        </div>
      </div>

      {/* Right panel */}
      <div className="w-72 flex flex-col gap-3 overflow-y-auto flex-shrink-0">
        <div className="card-cyber">
          <div className="flex items-center gap-2 mb-4">
            <div className="dot-live animate-pulse-fast" />
            <span className="panel-title">NEW TRADE</span>
          </div>
          <TradeForm currentPrice={currentPrice} onTradeOpened={handleTradeOpened} />
        </div>
        <PropFirmPanel refresh={refresh} />
      </div>
    </div>
  )
}
