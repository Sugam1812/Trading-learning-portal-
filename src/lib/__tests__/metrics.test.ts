import { SimTrade } from '@/types/trading';
import { computeBacktestMetrics, resolveTradeAgainstCandle } from '../metrics';

function trade(partial: Partial<SimTrade>): SimTrade {
  return {
    id: 'x',
    direction: 'long',
    entry: 1.1,
    stop: 1.098,
    target: 1.104,
    entryIndex: 0,
    reason: 'test',
    ...partial,
  };
}

describe('computeBacktestMetrics', () => {
  it('computes the full metric set', () => {
    const trades: SimTrade[] = [
      trade({ resultR: 2, outcome: 'win' }),
      trade({ resultR: -1, outcome: 'loss', direction: 'short' }),
      trade({ resultR: -1, outcome: 'loss' }),
      trade({ resultR: 2, outcome: 'win' }),
      trade({ skipped: true }),
    ];
    const m = computeBacktestMetrics(trades);
    expect(m.totalTrades).toBe(4);
    expect(m.wins).toBe(2);
    expect(m.losses).toBe(2);
    expect(m.winRate).toBeCloseTo(0.5);
    expect(m.avgWinR).toBeCloseTo(2);
    expect(m.avgLossR).toBeCloseTo(1);
    expect(m.expectancyR).toBeCloseTo(0.5);
    expect(m.profitFactor).toBeCloseTo(2);
    expect(m.netR).toBeCloseTo(2);
    expect(m.equityCurveR).toEqual([0, 2, 1, 0, 2]);
    expect(m.maxDrawdownR).toBeCloseTo(2);
    expect(m.longNetR).toBeCloseTo(3);
    expect(m.shortNetR).toBeCloseTo(-1);
  });

  it('handles the empty session safely', () => {
    const m = computeBacktestMetrics([]);
    expect(m.totalTrades).toBe(0);
    expect(m.winRate).toBe(0);
    expect(m.expectancyR).toBe(0);
  });
});

describe('resolveTradeAgainstCandle', () => {
  const open = trade({});

  it('does nothing while the candle touches neither level', () => {
    const r = resolveTradeAgainstCandle(open, { h: 1.101, l: 1.099 }, 5);
    expect(r.resultR).toBeUndefined();
  });

  it('closes a long at target for +2R', () => {
    const r = resolveTradeAgainstCandle(open, { h: 1.1045, l: 1.101 }, 5);
    expect(r.resultR).toBeCloseTo(2);
    expect(r.outcome).toBe('win');
    expect(r.exitIndex).toBe(5);
  });

  it('closes a long at stop for -1R', () => {
    const r = resolveTradeAgainstCandle(open, { h: 1.1005, l: 1.0975 }, 6);
    expect(r.resultR).toBe(-1);
    expect(r.outcome).toBe('loss');
  });

  it('assumes worst case when a candle spans both stop and target', () => {
    const r = resolveTradeAgainstCandle(open, { h: 1.105, l: 1.097 }, 7);
    expect(r.resultR).toBe(-1);
  });

  it('resolves shorts correctly', () => {
    const s = trade({ direction: 'short', entry: 1.1, stop: 1.102, target: 1.096 });
    const win = resolveTradeAgainstCandle(s, { h: 1.1005, l: 1.0955 }, 3);
    expect(win.resultR).toBeCloseTo(2);
    const loss = resolveTradeAgainstCandle(s, { h: 1.1025, l: 1.0995 }, 4);
    expect(loss.resultR).toBe(-1);
  });

  it('never re-resolves a closed or skipped trade', () => {
    const closed = trade({ resultR: 2, outcome: 'win' });
    expect(resolveTradeAgainstCandle(closed, { h: 9, l: 0 }, 9).resultR).toBe(2);
    const skipped = trade({ skipped: true });
    expect(resolveTradeAgainstCandle(skipped, { h: 9, l: 0 }, 9).resultR).toBeUndefined();
  });
});
