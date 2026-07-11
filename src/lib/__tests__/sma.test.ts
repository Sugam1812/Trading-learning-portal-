import { smaSeries } from '@/lib/sma';
import { getPack } from '@/data/packs';
import { Candle } from '@/types/trading';

function candles(closes: number[]): Candle[] {
  return closes.map((c, t) => ({ t, o: c, h: c, l: c, c }));
}

describe('smaSeries', () => {
  it('computes the simple average over the window', () => {
    const s = smaSeries(candles([1, 2, 3, 4, 5]), 3, 5);
    expect(s[0]).toBeNull();
    expect(s[1]).toBeNull();
    expect(s[2]).toBeCloseTo(2); // (1+2+3)/3
    expect(s[3]).toBeCloseTo(3);
    expect(s[4]).toBeCloseTo(4);
  });

  it('matches the m8 lesson example: closes 1.10, 1.12, 1.14, 1.16 → SMA4 = 1.13', () => {
    const s = smaSeries(candles([1.1, 1.12, 1.14, 1.16]), 4, 4);
    expect(s[3]).toBeCloseTo(1.13);
  });

  it('never looks past upTo (no look-ahead)', () => {
    const pack = getPack('eu-up-1');
    const partial = smaSeries(pack.candles, 20, 30);
    expect(partial.length).toBe(30);
    // Recomputing with more data must not change earlier values.
    const full = smaSeries(pack.candles, 20, pack.candles.length);
    for (let i = 0; i < 30; i++) {
      if (partial[i] === null) expect(full[i]).toBeNull();
      else expect(full[i]).toBeCloseTo(partial[i] as number, 10);
    }
  });
});
