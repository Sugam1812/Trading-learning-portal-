import { create } from 'zustand'

export interface AgentLog {
  timestamp: string
  agent: string
  message: string
  level: string
  symbol?: string
}

export interface AiTrade {
  id: number
  symbol: string
  direction: 'long' | 'short'
  status: string
  entry_price: number
  exit_price?: number
  stop_loss: number
  take_profit: number
  lot_size: number
  position_value: number
  pnl?: number
  pnl_pct?: number
  confidence: number
  live_pnl?: number
  live_pnl_pct?: number
  current_price?: number
  trailing_activated?: boolean
  close_reason?: string
  agent_reasoning?: string
  opened_at?: string
  closed_at?: string
}

export interface AgentStatus {
  TechnicalAgent: string
  SentimentAgent: string
  MacroAgent: string
  LiquidityAgent: string
  RiskAgent: string
  PortfolioManager: string
  ReflectionAgent: string
  StrategyResearchAgent: string
}

export interface TickerData {
  symbol: string
  price: number
  change_pct: number
  volume_24h: number
  high_24h: number
  low_24h: number
}

interface AiFundState {
  // Connection
  wsConnected: boolean
  wsError: string | null

  // Engine state
  isRunning: boolean
  isActive: boolean

  // Financials
  balance: number
  initialBalance: number
  peakBalance: number
  totalPnl: number
  totalPnlPct: number
  dailyPnl: number
  drawdownPct: number

  // Positions
  openTrades: AiTrade[]
  closedTrades: AiTrade[]

  // Agents
  agentStatus: AgentStatus
  agentLogs: AgentLog[]

  // Market
  tickers: Record<string, TickerData>

  // Equity curve history
  balanceHistory: { time: string; balance: number }[]

  // Forex session + active strategy
  currentSession: string
  currentStrategy: string
  currentStrategyId: string

  // Actions
  connect: () => void
  disconnect: () => void
  startFund: () => Promise<void>
  stopFund: () => Promise<void>
  clearLogs: () => void
}

const AI_ENGINE_URL = 'http://localhost:8000'
const AI_ENGINE_WS = 'ws://localhost:8000/ws'

let wsInstance: WebSocket | null = null
let pingInterval: ReturnType<typeof setInterval> | null = null
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
let reconnectDelay = 1000

export const useAiFundStore = create<AiFundState>()((set, get) => ({
  wsConnected: false,
  wsError: null,
  isRunning: false,
  isActive: false,
  balance: 100000,
  initialBalance: 100000,
  peakBalance: 100000,
  totalPnl: 0,
  totalPnlPct: 0,
  dailyPnl: 0,
  drawdownPct: 0,
  openTrades: [],
  closedTrades: [],
  agentStatus: {
    TechnicalAgent: 'idle',
    SentimentAgent: 'idle',
    MacroAgent: 'idle',
    LiquidityAgent: 'idle',
    RiskAgent: 'idle',
    PortfolioManager: 'idle',
    ReflectionAgent: 'idle',
    StrategyResearchAgent: 'idle',
  },
  agentLogs: [],
  tickers: {},
  balanceHistory: [],
  currentSession: 'LONDON',
  currentStrategy: 'EMA Trend Following',
  currentStrategyId: 'trend_following',

  connect: () => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) return

    // Fetch initial status from REST
    fetch(`${AI_ENGINE_URL}/status`)
      .then(r => r.json())
      .then(data => {
        set({
          isRunning: data.engine_running,
          isActive: data.is_active,
          balance: data.balance,
          initialBalance: data.initial_balance,
          peakBalance: data.peak_balance,
          totalPnl: data.total_pnl,
          dailyPnl: data.daily_pnl,
          agentStatus: data.agent_status || get().agentStatus,
        })
      })
      .catch(() => {})

    try {
      const ws = new WebSocket(AI_ENGINE_WS)
      wsInstance = ws

      ws.onopen = () => {
        set({ wsConnected: true, wsError: null })
        reconnectDelay = 1000

        // Ping keepalive
        if (pingInterval) clearInterval(pingInterval)
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, 25000)
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          handleWsMessage(msg, set, get)
        } catch {}
      }

      ws.onerror = () => {
        set({ wsError: 'Connection error' })
      }

      ws.onclose = () => {
        set({ wsConnected: false })
        if (pingInterval) { clearInterval(pingInterval); pingInterval = null }

        // Auto-reconnect
        if (reconnectTimeout) clearTimeout(reconnectTimeout)
        reconnectTimeout = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 2, 30000)
          get().connect()
        }, reconnectDelay)
      }
    } catch (e) {
      set({ wsError: 'Failed to connect to AI engine' })
    }
  },

  disconnect: () => {
    if (pingInterval) { clearInterval(pingInterval); pingInterval = null }
    if (reconnectTimeout) { clearTimeout(reconnectTimeout); reconnectTimeout = null }
    if (wsInstance) {
      wsInstance.onclose = null
      wsInstance.close()
      wsInstance = null
    }
    set({ wsConnected: false })
  },

  startFund: async () => {
    try {
      const res = await fetch(`${AI_ENGINE_URL}/start`, { method: 'POST' })
      if (!res.ok) throw new Error(await res.text())
      set({ isRunning: true, isActive: true })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to start'
      set({ wsError: msg })
    }
  },

  stopFund: async () => {
    try {
      const res = await fetch(`${AI_ENGINE_URL}/stop`, { method: 'POST' })
      if (!res.ok) throw new Error(await res.text())
      set({ isRunning: false, isActive: false })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to stop'
      set({ wsError: msg })
    }
  },

  clearLogs: () => set({ agentLogs: [] }),
}))

function handleWsMessage(
  msg: { type: string; data: Record<string, unknown> },
  set: (partial: Partial<AiFundState> | ((state: AiFundState) => Partial<AiFundState>)) => void,
  get: () => AiFundState
) {
  const { type, data } = msg

  switch (type) {
    case 'init': {
      const state = data.state as Record<string, unknown>
      const openTrades = (data.open_trades as AiTrade[]) || []
      const recentTrades = (data.recent_trades as AiTrade[]) || []
      set({
        isRunning: Boolean(data.engine_running),
        isActive: Boolean((state as Record<string, unknown>)?.is_active),
        balance: Number((state as Record<string, unknown>)?.current_balance ?? 100000),
        initialBalance: Number((state as Record<string, unknown>)?.initial_balance ?? 100000),
        peakBalance: Number((state as Record<string, unknown>)?.peak_balance ?? 100000),
        openTrades,
        closedTrades: recentTrades.filter((t: AiTrade) => t.status === 'closed'),
      })
      break
    }

    case 'ticker': {
      const d = data as unknown as TickerData
      set(state => ({ tickers: { ...state.tickers, [d.symbol]: d } }))
      break
    }

    case 'agent_log': {
      const log = data as unknown as AgentLog
      set(state => ({
        agentLogs: [log, ...state.agentLogs].slice(0, 200)
      }))
      break
    }

    case 'agent_status': {
      set({ agentStatus: data as unknown as AgentStatus })
      break
    }

    case 'trade_opened': {
      const trade = data as unknown as AiTrade
      set(state => ({
        openTrades: [trade, ...state.openTrades.filter(t => t.id !== trade.id)]
      }))
      break
    }

    case 'trade_closed': {
      const trade = data as unknown as AiTrade & { balance?: number }
      set(state => ({
        openTrades: state.openTrades.filter(t => t.id !== trade.id),
        closedTrades: [trade, ...state.closedTrades].slice(0, 100),
        balance: trade.balance ?? state.balance,
      }))
      break
    }

    case 'position_update': {
      const update = data as { id: number } & Partial<AiTrade>
      set(state => ({
        openTrades: state.openTrades.map(t =>
          t.id === update.id ? { ...t, ...update } : t
        )
      }))
      break
    }

    case 'balance_update': {
      const d = data as {
        balance: number
        total_pnl: number
        total_pnl_pct: number
        drawdown_pct: number
        peak_balance: number
        initial_balance: number
      }
      const now = new Date().toLocaleTimeString('en', { hour12: false })
      set(state => ({
        balance: d.balance,
        totalPnl: d.total_pnl,
        totalPnlPct: d.total_pnl_pct,
        drawdownPct: d.drawdown_pct,
        peakBalance: d.peak_balance,
        initialBalance: d.initial_balance,
        balanceHistory: [...state.balanceHistory, { time: now, balance: d.balance }].slice(-100),
      }))
      break
    }

    case 'session_info': {
      const d = data as { session: string; strategy: string; strategy_id: string }
      set({
        currentSession: d.session || 'UNKNOWN',
        currentStrategy: d.strategy || 'EMA Trend Following',
        currentStrategyId: d.strategy_id || 'trend_following',
      })
      break
    }

    case 'runtime': {
      const d = data as { status: string; balance?: number }
      set({
        isRunning: d.status === 'started',
        isActive: d.status === 'started',
        ...(d.balance !== undefined ? { balance: d.balance } : {}),
      })
      break
    }
  }
}
