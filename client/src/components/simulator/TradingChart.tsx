import { useEffect, useRef, useState } from 'react'
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts'
import { RefreshCw, BarChart2 } from 'lucide-react'
import axios from 'axios'

interface Props {
  openTrades?: Array<{ direction: 'buy' | 'sell'; entry_price: number; stop_loss: number; take_profit: number }>
  onPriceUpdate?: (price: number) => void
}

const INTERVALS = ['15min', '30min', '1h', '4h', '1day'] as const
type Interval = typeof INTERVALS[number]

export default function TradingChart({ openTrades = [], onPriceUpdate }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const candleSeries = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const [interval, setInterval] = useState<Interval>('1h')
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'live' | 'simulated'>('simulated')

  useEffect(() => {
    if (!chartRef.current) return

    chart.current = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight,
      layout: {
        background: { color: '#070d1a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e2d4d' },
        horzLines: { color: '#1e2d4d' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#3b82f6', style: 1, width: 1, labelBackgroundColor: '#1d4ed8' },
        horzLine: { color: '#3b82f6', style: 1, width: 1, labelBackgroundColor: '#1d4ed8' },
      },
      rightPriceScale: {
        borderColor: '#1e2d4d',
        textColor: '#94a3b8',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#1e2d4d',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    candleSeries.current = chart.current.addCandlestickSeries({
      upColor: '#00d4aa',
      downColor: '#ff4757',
      borderUpColor: '#00d4aa',
      borderDownColor: '#ff4757',
      wickUpColor: '#00d4aa',
      wickDownColor: '#ff4757',
    })

    const ro = new ResizeObserver(() => {
      if (chartRef.current && chart.current) {
        chart.current.applyOptions({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight,
        })
      }
    })
    ro.observe(chartRef.current)

    return () => {
      ro.disconnect()
      chart.current?.remove()
    }
  }, [])

  useEffect(() => {
    fetchCandles()
  }, [interval])

  const fetchCandles = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/market/candles?interval=${interval}&outputsize=200`)
      const { candles, source: src } = res.data
      setSource(src)

      if (candleSeries.current && candles.length) {
        const data: CandlestickData[] = candles.map((c: any) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
        candleSeries.current.setData(data)
        chart.current?.timeScale().fitContent()

        const last = candles[candles.length - 1]
        if (last && onPriceUpdate) onPriceUpdate(last.close)

        // Draw open trade levels
        if (chart.current) {
          openTrades.forEach((trade) => {
            chart.current!.addLineSeries({
              color: trade.direction === 'buy' ? '#00d4aa40' : '#ff475740',
              lineWidth: 1,
              lineStyle: 2,
            }).setData([])
          })
        }
      }
    } catch (err) {
      console.error('Failed to load chart data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-bg-primary rounded-xl border border-border-dim overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border-dim bg-bg-secondary">
        <BarChart2 size={14} className="text-slate-400" />
        <span className="text-xs font-semibold text-slate-300 mr-2">EUR/USD</span>

        {INTERVALS.map((iv) => (
          <button
            key={iv}
            onClick={() => setInterval(iv)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              interval === iv
                ? 'bg-accent-blue text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-bg-elevated'
            }`}
          >
            {iv}
          </button>
        ))}

        <div className="flex-1" />

        {source === 'simulated' && (
          <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full border border-gold/20">
            Simulated
          </span>
        )}
        {source === 'live' && (
          <span className="text-[10px] bg-bull/10 text-bull px-2 py-0.5 rounded-full border border-bull/20">
            Live
          </span>
        )}

        <button
          onClick={fetchCandles}
          className="text-slate-400 hover:text-slate-200 transition-colors ml-1"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Chart */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 z-10">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin" />
              Loading chart...
            </div>
          </div>
        )}
        <div ref={chartRef} className="w-full h-full tv-chart-container" />
      </div>
    </div>
  )
}
