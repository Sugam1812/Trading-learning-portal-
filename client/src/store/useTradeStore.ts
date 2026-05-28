import { create } from 'zustand'

export interface Trade {
  id: number
  pair: string
  direction: 'buy' | 'sell'
  entry_price: number
  exit_price?: number
  stop_loss: number
  take_profit: number
  lot_size: number
  risk_percent: number
  risk_amount: number
  pnl?: number
  pips?: number
  status: 'open' | 'closed' | 'stopped'
  session?: string
  strategy?: string
  notes?: string
  opened_at: string
  closed_at?: string
}

export interface TradeStats {
  total: number
  wins: number
  losses: number
  win_rate: number
  total_pnl: number
  avg_win: number
  avg_loss: number
  profit_factor: number
  avg_rr: number
  max_drawdown: number
  best_trade: number
  worst_trade: number
  account_balance: number
  starting_balance: number
  profit_percent: number
}

interface TradeState {
  openTrades: Trade[]
  recentTrades: Trade[]
  stats: TradeStats | null
  loading: boolean
  setOpenTrades: (trades: Trade[]) => void
  setRecentTrades: (trades: Trade[]) => void
  setStats: (s: TradeStats) => void
  setLoading: (v: boolean) => void
}

export const useTradeStore = create<TradeState>((set) => ({
  openTrades: [],
  recentTrades: [],
  stats: null,
  loading: false,
  setOpenTrades: (trades) => set({ openTrades: trades }),
  setRecentTrades: (trades) => set({ recentTrades: trades }),
  setStats: (s) => set({ stats: s }),
  setLoading: (v) => set({ loading: v }),
}))
