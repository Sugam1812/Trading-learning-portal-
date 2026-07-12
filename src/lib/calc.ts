/**
 * Trading calculators. Pure functions, fully unit tested.
 *
 * Simplification used throughout (and explained to learners in-app): pip value
 * is computed for an account denominated in the quote currency, where one
 * standard lot (100,000 units) makes one pip worth 10 quote-currency units.
 */

export interface PositionSizeInput {
  balance: number;
  riskPercent: number;
  stopPips: number;
  /** Pip value per standard lot in account currency. Defaults to 10. */
  pipValuePerLot?: number;
}

export interface PositionSizeResult {
  riskAmount: number;
  lots: number;
  units: number;
  pipValue: number;
}

export function pipSizeForPair(pair: string): number {
  return pair.toUpperCase().includes('JPY') ? 0.01 : 0.0001;
}

export function priceToPips(priceDistance: number, pipSize: number): number {
  return Math.abs(priceDistance) / pipSize;
}

/** Position size that keeps planned loss at (balance * riskPercent). */
export function positionSize(input: PositionSizeInput): PositionSizeResult {
  const pipValuePerLot = input.pipValuePerLot ?? 10;
  const riskAmount = input.balance * (input.riskPercent / 100);
  if (input.stopPips <= 0 || pipValuePerLot <= 0) {
    return { riskAmount, lots: 0, units: 0, pipValue: 0 };
  }
  const lots = riskAmount / (input.stopPips * pipValuePerLot);
  const rounded = Math.floor(lots * 100) / 100; // round DOWN to 0.01 lot so risk never exceeds plan
  return {
    riskAmount,
    lots: rounded,
    units: Math.round(rounded * 100000),
    pipValue: rounded * pipValuePerLot,
  };
}

/** Reward-to-risk ratio, e.g. entry 1.1000 stop 1.0980 target 1.1040 -> 2. */
export function rewardToRisk(entry: number, stop: number, target: number): number {
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  if (risk === 0) return 0;
  return reward / risk;
}

/** Result of a closed trade in R multiples. Positive = win. */
export function rMultiple(entry: number, stop: number, exit: number, direction: 'long' | 'short'): number {
  const risk = Math.abs(entry - stop);
  if (risk === 0) return 0;
  const move = direction === 'long' ? exit - entry : entry - exit;
  return move / risk;
}

/** Expected value per trade in R. winRate is 0..1. Losses passed as positive size. */
export function expectancyR(winRate: number, avgWinR: number, avgLossR: number): number {
  return winRate * avgWinR - (1 - winRate) * avgLossR;
}

/** Minimum win rate (0..1) needed to break even at a given reward-to-risk. */
export function breakEvenWinRate(rewardToRiskRatio: number): number {
  if (rewardToRiskRatio <= 0) return 1;
  return 1 / (1 + rewardToRiskRatio);
}

export function profitFactor(grossWinR: number, grossLossR: number): number {
  if (grossLossR === 0) return grossWinR > 0 ? Infinity : 0;
  return grossWinR / grossLossR;
}

/** Cumulative equity curve from a series of R results. Starts at 0. */
export function equityCurve(resultsR: number[]): number[] {
  const curve: number[] = [0];
  let acc = 0;
  for (const r of resultsR) {
    acc += r;
    curve.push(acc);
  }
  return curve;
}

/** Largest peak-to-trough drop of an equity curve, in R (positive number). */
export function maxDrawdown(curve: number[]): number {
  let peak = -Infinity;
  let dd = 0;
  for (const v of curve) {
    peak = Math.max(peak, v);
    dd = Math.max(dd, peak - v);
  }
  return dd;
}

export function longestStreak(resultsR: number[], kind: 'win' | 'loss'): number {
  let best = 0;
  let run = 0;
  for (const r of resultsR) {
    const hit = kind === 'win' ? r > 0 : r < 0;
    run = hit ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

/**
 * Simple risk-of-ruin style survival simulation: probability (0..1) of losing
 * `ruinPercent` of the account within `trades` trades, estimated over `runs`
 * Monte Carlo runs with fixed fractional risk. Deterministic via `rnd`.
 */
export function survivalSimulation(
  winRate: number,
  rewardToRiskRatio: number,
  riskPercent: number,
  trades: number,
  ruinPercent: number,
  runs: number,
  rnd: () => number,
): number {
  let ruined = 0;
  for (let i = 0; i < runs; i++) {
    let balance = 100;
    for (let t = 0; t < trades; t++) {
      const risk = balance * (riskPercent / 100);
      balance += rnd() < winRate ? risk * rewardToRiskRatio : -risk;
      if (balance <= 100 - ruinPercent) {
        ruined++;
        break;
      }
    }
  }
  return ruined / runs;
}
