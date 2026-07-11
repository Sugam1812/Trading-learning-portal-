import { mulberry32 } from '@/lib/rng';
import { Candle, ChartPack, Timeframe } from '@/types/trading';

/**
 * Synthetic, openly-licensed chart data.
 *
 * Every pack is generated from a fixed seed, so exercises are reproducible and
 * no proprietary market data is shipped. Packs are engineered scenario-by-
 * scenario (trend, range, breakout, fakeout) so each one supports a specific
 * learning objective. The data-provider surface is this module: swapping in
 * licensed historical data later only requires returning the same ChartPack
 * shape from a different source.
 */

interface Segment {
  bars: number;
  /** Average drift per bar, in pips. */
  drift: number;
  /** Noise amplitude per bar, in pips. */
  vol: number;
}

function genCandles(seed: number, start: number, pipSize: number, segments: Segment[]): Candle[] {
  const rnd = mulberry32(seed);
  const candles: Candle[] = [];
  let price = start;
  let t = 0;
  for (const seg of segments) {
    for (let i = 0; i < seg.bars; i++) {
      const o = price;
      const move = (seg.drift + (rnd() - 0.5) * 2 * seg.vol) * pipSize;
      const c = o + move;
      const wickUp = rnd() * seg.vol * 0.8 * pipSize;
      const wickDown = rnd() * seg.vol * 0.8 * pipSize;
      const h = Math.max(o, c) + wickUp;
      const l = Math.min(o, c) - wickDown;
      candles.push({
        t,
        o: round(o, pipSize),
        h: round(h, pipSize),
        l: round(l, pipSize),
        c: round(c, pipSize),
      });
      price = c;
      t++;
    }
  }
  return candles;
}

function round(v: number, pipSize: number): number {
  const dp = pipSize === 0.01 ? 3 : 5;
  return Number(v.toFixed(dp));
}

function pack(
  id: string,
  pair: string,
  timeframe: Timeframe,
  seed: number,
  start: number,
  segments: Segment[],
  description: string,
): ChartPack {
  const pipSize = pair.includes('JPY') ? 0.01 : 0.0001;
  return { id, pair, timeframe, pipSize, candles: genCandles(seed, start, pipSize, segments), description };
}

export const CHART_PACKS: ChartPack[] = [
  pack('eu-up-1', 'EUR/USD', 'H1', 11, 1.082, [
    { bars: 14, drift: 6, vol: 8 },
    { bars: 6, drift: -4, vol: 6 },
    { bars: 14, drift: 7, vol: 8 },
    { bars: 5, drift: -3, vol: 5 },
    { bars: 15, drift: 6, vol: 8 },
  ], 'A clean uptrend: impulses up, shallow pullbacks, higher highs and higher lows.'),

  pack('gu-down-1', 'GBP/USD', 'H1', 23, 1.274, [
    { bars: 12, drift: -7, vol: 9 },
    { bars: 5, drift: 4, vol: 6 },
    { bars: 13, drift: -8, vol: 9 },
    { bars: 6, drift: 3, vol: 5 },
    { bars: 14, drift: -6, vol: 8 },
  ], 'A downtrend: strong moves down, weak pullbacks up, lower highs and lower lows.'),

  pack('eu-range-1', 'EUR/USD', 'H4', 37, 1.09, [
    { bars: 8, drift: 4, vol: 7 },
    { bars: 8, drift: -4, vol: 7 },
    { bars: 8, drift: 4, vol: 7 },
    { bars: 8, drift: -4, vol: 7 },
    { bars: 8, drift: 4, vol: 7 },
    { bars: 8, drift: -4, vol: 7 },
  ], 'A range: price oscillates between a ceiling and a floor with no lasting direction.'),

  pack('eu-break-1', 'EUR/USD', 'H1', 51, 1.0865, [
    { bars: 16, drift: 0.5, vol: 6 },
    { bars: 6, drift: 9, vol: 7 },
    { bars: 5, drift: -4, vol: 5 },
    { bars: 13, drift: 8, vol: 8 },
  ], 'A breakout that held: consolidation, breakout, a retest of the broken area, continuation.'),

  pack('eu-fake-1', 'EUR/USD', 'H1', 67, 1.0912, [
    { bars: 16, drift: 0.5, vol: 6 },
    { bars: 3, drift: 10, vol: 7 },
    { bars: 15, drift: -9, vol: 9 },
  ], 'A failed breakout: price pushed above the range, found no buyers, and fell back through it.'),

  pack('uj-up-1', 'USD/JPY', 'H4', 79, 148.2, [
    { bars: 12, drift: 8, vol: 10 },
    { bars: 6, drift: -5, vol: 7 },
    { bars: 14, drift: 7, vol: 9 },
    { bars: 5, drift: -4, vol: 6 },
    { bars: 13, drift: 8, vol: 9 },
  ], 'USD/JPY uptrend. Note the pip size: 0.01 instead of 0.0001.'),

  pack('eu-sr-1', 'EUR/USD', 'H4', 91, 1.0845, [
    { bars: 7, drift: -6, vol: 6 },
    { bars: 7, drift: 6, vol: 6 },
    { bars: 7, drift: -6, vol: 5 },
    { bars: 7, drift: 7, vol: 6 },
    { bars: 7, drift: -6, vol: 5 },
    { bars: 9, drift: 8, vol: 7 },
  ], 'A support zone tested several times. Each dip into the same area found buyers.'),

  pack('eu-rr-1', 'EUR/USD', 'H1', 103, 1.0952, [
    { bars: 12, drift: 6, vol: 7 },
    { bars: 6, drift: -5, vol: 5 },
    { bars: 4, drift: 3, vol: 4 },
    { bars: 14, drift: 6, vol: 8 },
  ], 'Uptrend pullback used in the reward-to-risk lesson: entry, stop and target zones are visible.'),

  pack('bt-eu-1', 'EUR/USD', 'H1', 211, 1.078, [
    { bars: 25, drift: 5, vol: 9 },
    { bars: 10, drift: -4, vol: 7 },
    { bars: 25, drift: 6, vol: 9 },
    { bars: 20, drift: 0.5, vol: 8 },
    { bars: 20, drift: -6, vol: 9 },
    { bars: 12, drift: 3, vol: 7 },
    { bars: 28, drift: 6, vol: 9 },
  ], 'Backtest pack A: 140 bars mixing trend, range and reversal so honest testing is possible.'),

  pack('bt-gu-1', 'GBP/USD', 'H1', 223, 1.262, [
    { bars: 22, drift: -6, vol: 10 },
    { bars: 12, drift: 2, vol: 7 },
    { bars: 24, drift: -5, vol: 9 },
    { bars: 22, drift: 1, vol: 8 },
    { bars: 24, drift: 7, vol: 10 },
    { bars: 16, drift: -3, vol: 8 },
    { bars: 20, drift: -6, vol: 9 },
  ], 'Backtest pack B: bearish-leaning mixed regimes on GBP/USD.'),

  pack('bt-uj-1', 'USD/JPY', 'H4', 239, 146.5, [
    { bars: 20, drift: 7, vol: 11 },
    { bars: 14, drift: -2, vol: 8 },
    { bars: 22, drift: 8, vol: 10 },
    { bars: 18, drift: -7, vol: 10 },
    { bars: 16, drift: 1, vol: 8 },
    { bars: 24, drift: 6, vol: 10 },
  ], 'Backtest pack C: USD/JPY on H4 with a deep mid-test reversal.'),
];

export function getPack(id: string): ChartPack {
  const p = CHART_PACKS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown chart pack: ${id}`);
  return p;
}

/** Bars that are the highest high among `wing` bars on each side. */
export function swingHighIndexes(candles: Candle[], wing = 3, upTo?: number): number[] {
  const end = upTo ?? candles.length;
  const out: number[] = [];
  for (let i = wing; i < end - wing; i++) {
    let isSwing = true;
    for (let j = i - wing; j <= i + wing; j++) {
      if (j !== i && candles[j].h >= candles[i].h) {
        isSwing = false;
        break;
      }
    }
    if (isSwing) out.push(i);
  }
  return out;
}

export function swingLowIndexes(candles: Candle[], wing = 3, upTo?: number): number[] {
  const end = upTo ?? candles.length;
  const out: number[] = [];
  for (let i = wing; i < end - wing; i++) {
    let isSwing = true;
    for (let j = i - wing; j <= i + wing; j++) {
      if (j !== i && candles[j].l <= candles[i].l) {
        isSwing = false;
        break;
      }
    }
    if (isSwing) out.push(i);
  }
  return out;
}

/** Index of the highest high among the first `upTo` candles. */
export function highestIndex(candles: Candle[], upTo?: number): number {
  const end = upTo ?? candles.length;
  let best = 0;
  for (let i = 1; i < end; i++) if (candles[i].h > candles[best].h) best = i;
  return best;
}

export function lowestIndex(candles: Candle[], upTo?: number): number {
  const end = upTo ?? candles.length;
  let best = 0;
  for (let i = 1; i < end; i++) if (candles[i].l < candles[best].l) best = i;
  return best;
}
