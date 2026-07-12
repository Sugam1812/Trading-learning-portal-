import { CHART_PACKS, getPack, highestIndex, lowestIndex, swingHighIndexes, swingLowIndexes } from '@/data/packs';

describe('chart packs', () => {
  it('every pack has valid OHLC candles', () => {
    for (const p of CHART_PACKS) {
      expect(p.candles.length).toBeGreaterThan(20);
      for (const c of p.candles) {
        expect(c.h).toBeGreaterThanOrEqual(Math.max(c.o, c.c));
        expect(c.l).toBeLessThanOrEqual(Math.min(c.o, c.c));
        expect(c.h).toBeGreaterThan(0);
      }
    }
  });

  it('packs are deterministic across calls', () => {
    const a = getPack('eu-up-1').candles[10];
    const b = getPack('eu-up-1').candles[10];
    expect(a).toEqual(b);
  });

  it('candles chain: each open equals the previous close', () => {
    const p = getPack('eu-up-1');
    for (let i = 1; i < p.candles.length; i++) {
      expect(p.candles[i].o).toBeCloseTo(p.candles[i - 1].c, 4);
    }
  });

  it('JPY packs use 0.01 pip size', () => {
    expect(getPack('uj-up-1').pipSize).toBe(0.01);
    expect(getPack('eu-up-1').pipSize).toBe(0.0001);
  });

  it('trend packs actually trend', () => {
    const up = getPack('eu-up-1').candles;
    expect(up[up.length - 1].c).toBeGreaterThan(up[0].o);
    const down = getPack('gu-down-1').candles;
    expect(down[down.length - 1].c).toBeLessThan(down[0].o);
  });

  it('the fakeout pack breaks up then closes back down', () => {
    const p = getPack('eu-fake-1').candles;
    const rangeHigh = Math.max(...p.slice(0, 16).map((c) => c.h));
    const spikeHigh = Math.max(...p.slice(16, 19).map((c) => c.h));
    expect(spikeHigh).toBeGreaterThan(rangeHigh);
    expect(p[p.length - 1].c).toBeLessThan(rangeHigh);
  });

  it('swing detection finds local extremes', () => {
    const p = getPack('eu-up-1');
    const highs = swingHighIndexes(p.candles, 3);
    expect(highs.length).toBeGreaterThan(0);
    for (const i of highs) {
      for (let j = i - 3; j <= i + 3; j++) {
        if (j !== i) expect(p.candles[i].h).toBeGreaterThan(p.candles[j].h);
      }
    }
    const lows = swingLowIndexes(p.candles, 3);
    expect(lows.length).toBeGreaterThan(0);
  });

  it('highest/lowest index respect the visibility limit (no look-ahead)', () => {
    const p = getPack('eu-up-1');
    const hi20 = highestIndex(p.candles, 20);
    expect(hi20).toBeLessThan(20);
    const lo = lowestIndex(p.candles);
    expect(lo).toBeGreaterThanOrEqual(0);
  });

  it('getPack throws for unknown ids', () => {
    expect(() => getPack('nope')).toThrow();
  });
});
