import {
  breakEvenWinRate,
  equityCurve,
  expectancyR,
  longestStreak,
  maxDrawdown,
  pipSizeForPair,
  positionSize,
  priceToPips,
  profitFactor,
  rewardToRisk,
  rMultiple,
  survivalSimulation,
} from '../calc';
import { mulberry32 } from '../rng';

describe('pip helpers', () => {
  it('uses 0.0001 for non-JPY and 0.01 for JPY pairs', () => {
    expect(pipSizeForPair('EUR/USD')).toBe(0.0001);
    expect(pipSizeForPair('USD/JPY')).toBe(0.01);
    expect(pipSizeForPair('eur/jpy')).toBe(0.01);
  });

  it('converts price distance to pips', () => {
    expect(priceToPips(1.1 - 1.098, 0.0001)).toBeCloseTo(20);
    expect(priceToPips(148.5 - 148.0, 0.01)).toBeCloseTo(50);
  });
});

describe('positionSize', () => {
  it('matches the classic $1000 / 1% / 20 pips example (0.05 lots)', () => {
    const r = positionSize({ balance: 1000, riskPercent: 1, stopPips: 20 });
    expect(r.riskAmount).toBe(10);
    expect(r.lots).toBeCloseTo(0.05);
    expect(r.units).toBe(5000);
    expect(r.pipValue).toBeCloseTo(0.5);
  });

  it('rounds lots DOWN so real risk never exceeds planned risk', () => {
    const r = positionSize({ balance: 1000, riskPercent: 1, stopPips: 33 });
    // exact = 10 / 330 = 0.0303..., floor to 0.03
    expect(r.lots).toBe(0.03);
    expect(r.lots * 33 * 10).toBeLessThanOrEqual(10);
  });

  it('returns zero size for a zero-distance stop', () => {
    const r = positionSize({ balance: 1000, riskPercent: 1, stopPips: 0 });
    expect(r.lots).toBe(0);
  });
});

describe('rewardToRisk and rMultiple', () => {
  it('computes 1:2 for the lesson example (entry 1.1000 stop 1.0980 target 1.1040)', () => {
    expect(rewardToRisk(1.1, 1.098, 1.104)).toBeCloseTo(2);
  });

  it('works for shorts', () => {
    expect(rewardToRisk(1.1, 1.102, 1.096)).toBeCloseTo(2);
    expect(rMultiple(1.1, 1.102, 1.096, 'short')).toBeCloseTo(2);
    expect(rMultiple(1.1, 1.102, 1.102, 'short')).toBeCloseTo(-1);
  });

  it('a losing long is -1R at the stop', () => {
    expect(rMultiple(1.1, 1.098, 1.098, 'long')).toBeCloseTo(-1);
  });
});

describe('expectancy math', () => {
  it('matches the curriculum example: 40% win rate, 2R winners, 1R losers = +0.2R', () => {
    expect(expectancyR(0.4, 2, 1)).toBeCloseTo(0.2);
  });

  it('break-even win rate for 1:2 is 33.3%', () => {
    expect(breakEvenWinRate(2)).toBeCloseTo(1 / 3);
    expect(breakEvenWinRate(1)).toBeCloseTo(0.5);
  });

  it('profit factor handles zero losses', () => {
    expect(profitFactor(10, 5)).toBe(2);
    expect(profitFactor(10, 0)).toBe(Infinity);
    expect(profitFactor(0, 0)).toBe(0);
  });
});

describe('equity curve and drawdown', () => {
  it('accumulates R results starting at 0', () => {
    expect(equityCurve([1, -1, 2])).toEqual([0, 1, 0, 2]);
  });

  it('finds the largest peak-to-trough drop', () => {
    expect(maxDrawdown([0, 2, 1, 3, -1, 0])).toBe(4);
    expect(maxDrawdown([0, 1, 2, 3])).toBe(0);
  });

  it('tracks streaks', () => {
    const rs = [1, 1, -1, -1, -1, 2, -1];
    expect(longestStreak(rs, 'win')).toBe(2);
    expect(longestStreak(rs, 'loss')).toBe(3);
  });
});

describe('survivalSimulation', () => {
  it('is deterministic for a fixed seed and higher risk ruins more often', () => {
    const a = survivalSimulation(0.45, 2, 1, 100, 30, 300, mulberry32(7));
    const b = survivalSimulation(0.45, 2, 1, 100, 30, 300, mulberry32(7));
    const risky = survivalSimulation(0.45, 2, 10, 100, 30, 300, mulberry32(7));
    expect(a).toBe(b);
    expect(risky).toBeGreaterThan(a);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThanOrEqual(1);
  });
});
