import { useEffect, useState, useCallback } from 'react'
import TradingChart from '../components/simulator/TradingChart'
import TradeForm from '../components/simulator/TradeForm'
import PropFirmPanel from '../components/simulator/PropFirmPanel'
import TradeList from '../components/simulator/TradeList'
import { useTradeStore } from '../store/useTradeStore'
import { useAppStore } from '../store/useAppStore'
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

  useEffect(() => {
    loadTrades()
  }, [])

  const handleTradeOpened = () => {
    loadTrades()
    setRefresh((r) => r + 1)
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex gap-4">
      {/* Chart — takes most space */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex-1 min-h-0">
          <TradingChart
            openTrades={openTrades}
            onPriceUpdate={setCurrentPrice}
          />
        </div>
        {/* Open trades at bottom of chart area */}
        <div className="h-52 overflow-y-auto">
          <TradeList
            openTrades={openTrades}
            recentTrades={recentTrades}
            currentPrice={currentPrice}
            onRefresh={handleTradeOpened}
          />
        </div>
      </div>

      {/* Right panel */}
      <div className="w-72 flex flex-col gap-4 overflow-y-auto flex-shrink-0">
        <div className="card">
          <div className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-bull animate-pulse" />
            New Trade
          </div>
          <TradeForm currentPrice={currentPrice} onTradeOpened={handleTradeOpened} />
        </div>
        <PropFirmPanel refresh={refresh} />
      </div>
    </div>
  )
}
