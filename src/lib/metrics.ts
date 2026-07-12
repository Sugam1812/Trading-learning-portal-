import { BacktestMetrics, SimTrade } from '@/types/trading';
import { equityCurve, longestStreak, maxDrawdown, profitFactor } from './calc';

/** Full metric set for a backtest / forward-test session. Skipped trades excluded. */
export function computeBacktestMetrics(trades: SimTrade[]): BacktestMetrics {
  const closed = trades.filter((t) => !t.skipped && typeof t.resultR === 'number');
  const results = closed.map((t) => t.resultR as number);
  const wins = results.filter((r) => r > 0);
  const losses = results.filter((r) => r < 0);
  const grossWin = wins.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
  const curve = equityCurve(results);
  const netR = results.reduce((a, b) => a + b, 0);
  const longR = closed.filter((t) => t.direction === 'long').reduce((a, t) => a + (t.resultR ?? 0), 0);
  const shortR = closed.filter((t) => t.direction === 'short').reduce((a, t) => a + (t.resultR ?? 0), 0);

  return {
    totalTrades: closed.length,
    wins: wins.length,
    losses: losses.length,
    winRate: closed.length ? wins.length / closed.length : 0,
    avgWinR: wins.length ? grossWin / wins.length : 0,
    avgLossR: losses.length ? grossLoss / losses.length : 0,
    expectancyR: closed.length ? netR / closed.length : 0,
    profitFactor: profitFactor(grossWin, grossLoss),
    netR,
    maxDrawdownR: maxDrawdown(curve),
    bestR: results.length ? Math.max(...results) : 0,
    worstR: results.length ? Math.min(...results) : 0,
    longestWinStreak: longestStreak(results, 'win'),
    longestLossStreak: longestStreak(results, 'loss'),
    equityCurveR: curve,
    longNetR: longR,
    shortNetR: shortR,
  };
}

/**
 * Resolve an open simulated trade against a newly revealed candle.
 * Conservative rule: if a candle touches both stop and target, the stop is
 * assumed to fill first (worst case), because intrabar order is unknown.
 */
export function resolveTradeAgainstCandle(
  trade: SimTrade,
  candle: { h: number; l: number },
  candleIndex: number,
): SimTrade {
  if (trade.resultR !== undefined || trade.skipped) return trade;
  const risk = Math.abs(trade.entry - trade.stop);
  if (risk === 0) return trade;

  const hitStop = trade.direction === 'long' ? candle.l <= trade.stop : candle.h >= trade.stop;
  const hitTarget = trade.direction === 'long' ? candle.h >= trade.target : candle.l <= trade.target;

  if (hitStop) {
    return { ...trade, resultR: -1, outcome: 'loss', exitIndex: candleIndex };
  }
  if (hitTarget) {
    const rewardR = Math.abs(trade.target - trade.entry) / risk;
    return { ...trade, resultR: Number(rewardR.toFixed(2)), outcome: 'win', exitIndex: candleIndex };
  }
  return trade;
}
