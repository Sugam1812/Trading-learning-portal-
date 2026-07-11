import { ChartChallenge } from '@/types/content';
import { dayKey, hashString } from '@/lib/rng';

/**
 * Chart-guessing challenges: analyze the visible candles, commit with a
 * confidence level, then reveal the hidden future. Process is scored
 * separately from outcome — choosing "no trade" is often the best answer.
 */
export const CHALLENGES: ChartChallenge[] = [
  {
    id: 'ch-trend-1',
    title: 'Call the Trend',
    mode: 'trend',
    difficulty: 1,
    packId: 'eu-up-1',
    visible: 32,
    question: 'What is the market structure of the visible chart?',
    options: [
      { text: 'Uptrend — higher highs and higher lows', quality: 'best', explain: 'The swings step upward consistently.' },
      { text: 'Downtrend', quality: 'poor', explain: 'The lows are rising, not falling.' },
      { text: 'Range', quality: 'poor', explain: 'Highs and lows are stepping upward, not oscillating around the same levels.' },
    ],
    skill: 'structure',
    reveal: 'The uptrend continued after this point — but the correct answer was about the visible structure, not luck about the future.',
  },
  {
    id: 'ch-trend-2',
    title: 'Bear Territory',
    mode: 'trend',
    difficulty: 1,
    packId: 'gu-down-1',
    visible: 30,
    question: 'You want to trade WITH the trend. Which direction is aligned?',
    options: [
      { text: 'Short — the structure steps down', quality: 'best', explain: 'Lower lows and lower highs: shorts are trend-aligned.' },
      { text: 'Long — it must bounce eventually', quality: 'poor', explain: '"Due for a bounce" is the gambler’s fallacy wearing a chart.' },
      { text: 'Both directions equally', quality: 'poor', explain: 'Trend-following means one direction has structural support. This is not it.' },
    ],
    skill: 'structure',
    reveal: 'The downtrend extended further. Counter-trend longs would have fought the dominant flow the whole way.',
  },
  {
    id: 'ch-range-1',
    title: 'Trend or Range?',
    mode: 'structure',
    difficulty: 1,
    packId: 'eu-range-1',
    visible: 36,
    question: 'A trend-following strategy asks for a trade here. What is the right process call?',
    options: [
      { text: 'No trade — this is a range, the strategy’s condition is absent', quality: 'best', explain: 'The edge only exists in the tested condition. Standing aside is the skilled move.' },
      { text: 'Force a long — price is near the bottom of the screen', quality: 'poor', explain: 'Screen position is not analysis.' },
      { text: 'Trade both directions at once to be safe', quality: 'poor', explain: 'Two spreads, zero edge.' },
    ],
    skill: 'strategy',
    reveal: 'Price kept chopping sideways. The no-trade decision preserved capital and rule integrity — that is a win for process.',
  },
  {
    id: 'ch-break-1',
    title: 'Break or Fake?',
    mode: 'breakout',
    difficulty: 2,
    packId: 'eu-fake-1',
    visible: 19,
    question: 'Price has just pushed above the consolidation ceiling. Your breakout strategy needs a CLOSE above plus a successful retest. What now?',
    options: [
      { text: 'Wait for the close and retest that the rules demand', quality: 'best', explain: 'The rules exist precisely because early breaks often fail.' },
      { text: 'Buy immediately — it is escaping!', quality: 'poor', explain: 'Chasing the first poke is the classic fakeout donation.' },
      { text: 'Short it — breakouts always fail', quality: 'poor', explain: '"Always" is not a statistic. Untested fading is guessing.' },
    ],
    skill: 'structure',
    reveal: 'This one was a fakeout: price collapsed back into the range. The patient rule avoided the trap this time — and would occasionally miss real moves. That trade-off is what testing quantifies.',
  },
  {
    id: 'ch-break-2',
    title: 'The Retest',
    mode: 'breakout',
    difficulty: 2,
    packId: 'eu-break-1',
    visible: 26,
    question: 'Price broke above the range and is now pulling back toward the broken area. Your tested plan: long at the retest, stop below the zone, 1:2 target. Decision?',
    options: [
      { text: 'Take the planned long with normal size', quality: 'best', explain: 'Setup, trigger, invalidation and ratio are all present — this is exactly what the plan is for.' },
      { text: 'Skip it — it might fail', quality: 'ok', explain: '"Might fail" is true of every trade. If the tested conditions are met, skipping from fear erodes the edge.' },
      { text: 'Enter with triple size because it looks perfect', quality: 'poor', explain: '"Looks perfect" is a feeling. Size comes from the risk rule, not excitement.' },
    ],
    skill: 'strategy',
    reveal: 'The retest held and price continued upward. Note: the decision quality was set at entry time — the outcome only confirms it this once.',
  },
  {
    id: 'ch-decision-1',
    title: 'News in Five Minutes',
    mode: 'decision',
    difficulty: 2,
    packId: 'eu-up-1',
    visible: 40,
    question:
      'Uptrend, pullback holding at prior resistance-turned-support, bullish rejection candle — AND a major USD news release in five minutes. What is the strongest decision?',
    options: [
      { text: 'Wait — major news can wreck spreads, fills and stops regardless of the setup', quality: 'best', explain: 'A good setup with terrible execution conditions is not a good trade.' },
      { text: 'Buy immediately before the news makes it go up', quality: 'poor', explain: 'News direction is unknowable; pre-news entries gamble on a coin with a widened spread.' },
      { text: 'Sell — price has already risen a lot', quality: 'poor', explain: '"Already risen" is not a tested reason to fade a trend.' },
      { text: 'Double the size because the setup looks strong', quality: 'poor', explain: 'Increasing risk into maximum uncertainty inverts risk management.' },
    ],
    skill: 'execution',
    reveal: 'Whatever the candles did next, the decision to stand aside was correct: execution risk around high-impact news is real, measurable, and avoidable.',
  },
  {
    id: 'ch-risk-1',
    title: 'The Cramped Target',
    mode: 'risk',
    difficulty: 2,
    packId: 'eu-rr-1',
    visible: 22,
    question:
      'Uptrend pullback into a former resistance zone with a small bullish rejection — but the next major resistance is close above, offering only about 1:0.8 reward-to-risk. Best decision?',
    options: [
      { text: 'Skip the trade — the available reward is too small for the risk', quality: 'best', explain: 'Direction can be right and the trade still bad. Space to the target is part of the setup.' },
      { text: 'Take it anyway — the direction looks correct', quality: 'poor', explain: 'At 1:0.8 you need a ~56% win rate just to break even, before costs.' },
      { text: 'Take it but move the target beyond the resistance for a better ratio', quality: 'poor', explain: 'Stretching targets past real obstacles turns a bad ratio into a bad probability.' },
    ],
    skill: 'risk',
    reveal: 'Identifying a likely direction is not enough: a valid plan also needs acceptable risk and room to the target. Skipping cramped trades is a rewarded skill here.',
  },
  {
    id: 'ch-jpy-1',
    title: 'Yen Trend Check',
    mode: 'trend',
    difficulty: 2,
    packId: 'uj-up-1',
    visible: 34,
    question: 'USD/JPY on H4. A pullback is in progress. For a trend-continuation strategy, which plan is coherent?',
    options: [
      { text: 'Wait for the pullback to hold and a bullish trigger candle, then long with stop below the swing low', quality: 'best', explain: 'Continuation logic: trend + pullback + trigger + defined invalidation.' },
      { text: 'Short the pullback — it is moving down right now', quality: 'poor', explain: 'Trading the last few candles against the structure is fighting the tide for pennies.' },
      { text: 'Long immediately without waiting for any trigger', quality: 'ok', explain: 'Trend-aligned but trigger-less: entering mid-pullback often means a worse price and an unclear stop.' },
    ],
    skill: 'strategy',
    reveal: 'The uptrend resumed after the pullback. The disciplined plan captured it with a clear invalidation; the early entry survived only by luck.',
  },
];

export function getChallenge(id: string): ChartChallenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

/** Deterministic daily challenge: same for the whole day, rotates daily. */
export function dailyChallenge(date = new Date()): ChartChallenge {
  return CHALLENGES[hashString(dayKey(date)) % CHALLENGES.length];
}
