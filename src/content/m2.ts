import { swingHighIndexes, swingLowIndexes, getPack } from '@/data/packs';
import { Lesson, Module } from '@/types/content';

export const M2: Module = {
  id: 'm2',
  order: 2,
  world: 'Structure City',
  title: 'Market Structure',
  tagline: 'Swings, trends, ranges, and the difference between a break and a fake.',
  icon: '🏙️',
  skills: ['structure'],
  lessonIds: ['m2l1', 'm2l2', 'm2l3', 'm2l4'],
  prereq: 'm1',
};

// Correct answers for tap exercises are computed from the data itself,
// so they can never drift out of sync with the generated packs.
const upPack = getPack('eu-up-1');
const UP_SWING_HIGHS = swingHighIndexes(upPack.candles, 3, 40);
const UP_SWING_LOWS = swingLowIndexes(upPack.candles, 3, 40);

export const M2_LESSONS: Lesson[] = [
  {
    id: 'm2l1',
    moduleId: 'm2',
    title: 'Swing Highs and Swing Lows',
    objective: 'Identify the turning points that structure is built from.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm2l1b1',
        skill: 'structure',
        title: 'The skeleton of the chart',
        body:
          'A swing high is a peak: a candle whose high is higher than the candles around it. A swing low is a valley. Connect the swings and you see the market’s skeleton — where price turned, and in which direction the turns are stepping.',
        bullets: [
          'Swing high: local peak, surrounded by lower highs.',
          'Swing low: local valley, surrounded by higher lows.',
          'Structure = the sequence of swings, read left to right.',
        ],
      },
      {
        kind: 'tapcandle',
        id: 'm2l1b2',
        skill: 'structure',
        prompt: 'Tap a candle that forms a SWING HIGH (a peak with lower highs on both sides).',
        packId: 'eu-up-1',
        visible: 40,
        targetIndexes: UP_SWING_HIGHS,
        hint: 'Look for a peak — candles to its left AND right have lower highs.',
        explain: 'Peaks like these are swing highs. In an uptrend, each new swing high tends to form above the previous one.',
      },
      {
        kind: 'tapcandle',
        id: 'm2l1b3',
        skill: 'structure',
        prompt: 'Now tap a SWING LOW — a valley with higher lows on both sides.',
        packId: 'eu-up-1',
        visible: 40,
        targetIndexes: UP_SWING_LOWS,
        hint: 'Find a dip where price turned back up.',
        explain: 'Swing lows in an uptrend are where buyers stepped back in. They are natural reference points for stops.',
      },
      {
        kind: 'mcq',
        id: 'm2l1b4',
        skill: 'structure',
        prompt: 'Why do traders care about swing points instead of every small wiggle?',
        options: [
          { text: 'Swings are where price actually turned — they filter noise into structure' },
          { text: 'Swing points guarantee reversals' },
          { text: 'Charts look tidier with fewer marks' },
        ],
        correctIndex: 0,
        explain:
          'Structure turns thousands of candles into a readable sequence of decisions: higher highs, lower lows, and everything between.',
      },
    ],
  },
  {
    id: 'm2l2',
    moduleId: 'm2',
    title: 'Trends: Higher Highs, Higher Lows',
    objective: 'Define a trend objectively using the sequence of swings.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm2l2b1',
        skill: 'structure',
        title: 'A trend you can define, not feel',
        body:
          'An uptrend is a sequence of higher highs (HH) and higher lows (HL). A downtrend is lower lows (LL) and lower highs (LH). This definition is objective: two people looking at the same swings should reach the same answer. "It feels bullish" is not a definition.',
        figure: {
          packId: 'eu-up-1',
          caption: 'Higher highs and higher lows stepping upward — an objective uptrend.',
        },
        mistake: 'Calling a trend after one push up. One impulse is not a trend — you need the sequence.',
      },
      {
        kind: 'order',
        id: 'm2l2b2',
        skill: 'structure',
        prompt: 'Arrange the pieces of a healthy uptrend cycle in order.',
        items: ['Impulse up makes a higher high', 'Pullback holds above the last swing low', 'A higher low forms', 'Next impulse breaks to a new higher high'],
        explain: 'Impulse, pullback, higher low, new impulse — the heartbeat of a trend.',
      },
      {
        kind: 'chartchoice',
        id: 'm2l2b3',
        skill: 'structure',
        prompt: 'Read the swings on this chart. What is the structure?',
        packId: 'gu-down-1',
        visible: 45,
        options: [
          { text: 'Uptrend — higher highs and higher lows' },
          { text: 'Downtrend — lower lows and lower highs', explain: 'Each rally fails below the previous peak, each drop makes a new low.' },
          { text: 'Range — no direction' },
        ],
        correctIndex: 1,
        explain: 'The peaks step down and the valleys step down: an objective downtrend.',
      },
      {
        kind: 'truefalse',
        id: 'm2l2b4',
        skill: 'structure',
        statement: 'In a downtrend, pullbacks UP are normal and do not by themselves end the trend.',
        answer: true,
        explain:
          'Trends breathe: impulse, pullback, impulse. The trend is questioned only when the swing sequence breaks — for example a higher high forming in a downtrend.',
      },
    ],
  },
  {
    id: 'm2l3',
    moduleId: 'm2',
    title: 'Ranges and Consolidation',
    objective: 'Recognise when the market has no direction — and why forcing trades there hurts.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm2l3b1',
        skill: 'structure',
        title: 'When nobody is winning',
        body:
          'A range is a sideways battle: price bounces between a ceiling (resistance) and a floor (support) with no lasting winner. Ranges are normal — markets spend a lot of time consolidating. Trend-following rules lose repeatedly inside ranges, which is why identifying the condition comes before choosing the tactic.',
        figure: { packId: 'eu-range-1', caption: 'Price oscillating between a ceiling and a floor.' },
      },
      {
        kind: 'chartchoice',
        id: 'm2l3b2',
        skill: 'structure',
        prompt: 'Trend or range?',
        packId: 'eu-range-1',
        visible: 40,
        options: [
          { text: 'Uptrend' },
          { text: 'Downtrend' },
          { text: 'Range', explain: 'Highs and lows keep forming at similar levels — no stepping sequence.' },
        ],
        correctIndex: 2,
        explain: 'No higher-high/higher-low or lower-low/lower-high sequence: this is a range.',
      },
      {
        kind: 'multi',
        id: 'm2l3b3',
        skill: 'structure',
        prompt: 'Which behaviours fit a ranging market? Select all that apply.',
        options: [
          { text: 'Price repeatedly rejects the same ceiling area' },
          { text: 'Breakout attempts often fail and fall back inside' },
          { text: 'Each new high is clearly above the last one' },
          { text: 'The middle of the range is choppy and unreliable' },
        ],
        correctIndexes: [0, 1, 3],
        explain: 'Stepping highs belong to trends. Ranges reject their edges and chop in the middle.',
      },
      {
        kind: 'scenario',
        id: 'm2l3b4',
        skill: 'strategy',
        situation: 'Your strategy is trend-following. Today the market is stuck in a tight range. What is the professional choice?',
        options: [
          {
            text: 'Stand aside — your edge does not exist in this condition',
            quality: 'best',
            explain: 'Correct. "No trade" is a position. A tested edge only pays in the conditions it was tested for.',
          },
          { text: 'Trade anyway but with double size to make the session worthwhile', quality: 'poor', explain: 'Doubling size in the wrong condition compounds the mistake.' },
          { text: 'Flip a coin for direction since the range is 50/50', quality: 'poor', explain: 'Coin flips have no edge, and spread makes random trading a guaranteed slow loss.' },
        ],
      },
    ],
  },
  {
    id: 'm2l4',
    moduleId: 'm2',
    title: 'Breakouts and Fakeouts',
    objective: 'Tell a break of structure from a failed breakout — after the evidence arrives.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm2l4b1',
        skill: 'structure',
        title: 'The break… and the trap',
        body:
          'A breakout is price escaping a range or level with follow-through. A fakeout (failed breakout) pokes beyond the level, finds no interest, and snaps back. Both look identical at the moment of the break. The difference appears AFTER: does price hold beyond the level, or close back inside?',
        figure: { packId: 'eu-break-1', caption: 'A breakout that held: escape, retest, continuation.' },
        mistake: 'Chasing the very first candle through a level. Waiting for a close beyond, or a retest, filters many traps.',
      },
      {
        kind: 'chartchoice',
        id: 'm2l4b2',
        skill: 'structure',
        prompt: 'Price pushed above the range here. Judging by what followed, what was it?',
        packId: 'eu-fake-1',
        visible: 34,
        options: [
          { text: 'A clean breakout with follow-through' },
          { text: 'A fakeout — the push failed and price fell back inside', explain: 'The candles after the poke closed back inside and kept falling.' },
          { text: 'Impossible to say even with hindsight' },
        ],
        correctIndex: 1,
        explain:
          'The market broke the ceiling, found no buyers, and collapsed back through the range — the classic trap for breakout chasers.',
      },
      {
        kind: 'nextcandle',
        id: 'm2l4b3',
        skill: 'structure',
        prompt: 'Price just broke above the consolidation. Commit: does the next candle close up or down?',
        packId: 'eu-break-1',
        visible: 23,
        explain: 'Even at good breakouts, individual candles stay noisy. Structure gives context, not certainty.',
      },
      {
        kind: 'scenario',
        id: 'm2l4b4',
        skill: 'strategy',
        situation: 'Price breaks above a well-watched resistance. You missed the entry. It is now 15 pips above the level and still running. What is the strongest process?',
        options: [
          {
            text: 'Wait for a possible retest of the broken level with a fresh, planned setup',
            quality: 'best',
            explain: 'A retest gives a defined entry, a logical stop, and a measurable reward-to-risk. Chasing gives none of those.',
          },
          { text: 'Jump in now at market — it is running away!', quality: 'poor', explain: 'Chasing means a random entry, a distant stop, and FOMO doing the sizing.' },
          { text: 'Short it because it has gone "too far"', quality: 'poor', explain: '"Too far" is not a rule. Fading strength without a tested reason is how accounts bleed.' },
        ],
      },
    ],
  },
];
