import { Candle } from '@/types/trading';

/** SMA of closes; entries before a full window are null (no look-ahead, no fake values). */
export function smaSeries(candles: Candle[], period: number, upTo: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < upTo; i++) {
    sum += candles[i].c;
    if (i >= period) sum -= candles[i - period].c;
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}
