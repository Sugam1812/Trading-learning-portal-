/** Core trading domain types shared across the chart engine, lab, and journal. */

export interface Candle {
  /** Sequential index-based time (bar number). Packs are synthetic, evenly spaced. */
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

export type Timeframe = 'M15' | 'H1' | 'H4' | 'D1';

export interface ChartPack {
  id: string;
  pair: string;
  timeframe: Timeframe;
  /** Size of one pip in price units (0.0001 for most pairs, 0.01 for JPY pairs). */
  pipSize: number;
  candles: Candle[];
  /** What this pack demonstrates. Shown after exercises, never before. */
  description: string;
}

export type TradeDirection = 'long' | 'short';

export interface SimTrade {
  id: string;
  direction: TradeDirection;
  entry: number;
  stop: number;
  target: number;
  /** Bar index where the trade was opened. */
  entryIndex: number;
  /** Bar index where it resolved, if resolved. */
  exitIndex?: number;
  /** Result in R multiples. -1 = full stop, +2 = 2R win, 0 = still open/breakeven. */
  resultR?: number;
  outcome?: 'win' | 'loss' | 'open';
  reason: string;
  skipped?: boolean;
}

export interface BacktestSession {
  id: string;
  createdAt: number;
  packId: string;
  strategyId?: string;
  riskPercent: number;
  trades: SimTrade[];
  /** How many candles have been revealed so far. */
  cursor: number;
  finished: boolean;
  mode: 'backtest' | 'forward';
}

export interface BacktestMetrics {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  avgWinR: number;
  avgLossR: number;
  expectancyR: number;
  profitFactor: number;
  netR: number;
  maxDrawdownR: number;
  bestR: number;
  worstR: number;
  longestWinStreak: number;
  longestLossStreak: number;
  equityCurveR: number[];
  longNetR: number;
  shortNetR: number;
}

export type EmotionTag =
  | 'calm'
  | 'confident'
  | 'anxious'
  | 'fomo'
  | 'revenge'
  | 'bored'
  | 'frustrated'
  | 'excited';

export type MistakeTag =
  | 'no-plan'
  | 'moved-stop'
  | 'oversized'
  | 'chased-entry'
  | 'early-exit'
  | 'held-loser'
  | 'news-ignored'
  | 'overtraded'
  | 'against-trend'
  | 'revenge-trade';

export interface JournalTrade {
  id: string;
  createdAt: number;
  pair: string;
  direction: TradeDirection;
  session: 'sydney' | 'tokyo' | 'london' | 'newyork';
  setup: string;
  entry: number;
  stop: number;
  target: number;
  riskPercent: number;
  plannedRR: number;
  resultR: number | null;
  entryReason: string;
  exitReason: string;
  emotionBefore: EmotionTag;
  emotionAfter: EmotionTag;
  followedRules: boolean;
  mistakes: MistakeTag[];
  lesson: string;
  planned: boolean;
}

export interface Strategy {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  market: string;
  timeframe: Timeframe;
  session: string;
  direction: 'long' | 'short' | 'both';
  trendFilter: string;
  setup: string;
  entryTrigger: string;
  stopRule: string;
  targetRule: string;
  minRR: number;
  riskPercent: number;
  maxTradesPerDay: number;
  newsRule: string;
  invalidation: string;
  version: number;
}

export interface StrategyIssue {
  severity: 'error' | 'warning';
  field: string;
  message: string;
}
