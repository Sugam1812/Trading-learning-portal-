import { getPack, swingLowIndexes } from '@/data/packs';
import { Lesson, Module } from '@/types/content';

export const M3: Module = {
  id: 'm3',
  order: 3,
  world: 'Structure City',
  title: 'Support & Resistance',
  tagline: 'Zones where price reacts — and how to avoid over-marking your chart.',
  icon: '🧱',
  skills: ['levels'],
  lessonIds: ['m3l1', 'm3l2', 'm3l3'],
  prereq: 'm2',
};

const srPack = getPack('eu-sr-1');
const SR_SWING_LOWS = swingLowIndexes(srPack.candles, 3);
// The shared floor: average of the swing-low prices, computed from the data.
const SUPPORT_PRICE = Number(
  (SR_SWING_LOWS.reduce((a, i) => a + srPack.candles[i].l, 0) / Math.max(1, SR_SWING_LOWS.length)).toFixed(4),
);

export const M3_LESSONS: Lesson[] = [
  {
    id: 'm3l1',
    moduleId: 'm3',
    title: 'Zones, Not Lines',
    objective: 'Understand support and resistance as areas where price has reacted before.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm3l1b1',
        skill: 'levels',
        title: 'Where price has memory',
        body:
          'Support is an area below price where falls have previously stopped — buyers showed up there. Resistance is an area above price where rallies have stalled — sellers showed up. Think in ZONES a few pips wide, not exact lines: markets turn in areas, rarely at one perfect price.',
        figure: {
          packId: 'eu-sr-1',
          lines: [{ price: SUPPORT_PRICE, label: 'Support zone', color: 'accent', dashed: true }],
          caption: 'Several separate dips found buyers in the same area.',
        },
        mistake: 'Expecting price to respect a line to the exact pip. Wicks pierce zones all the time — that alone is not a "break".',
      },
      {
        kind: 'tapcandle',
        id: 'm3l1b2',
        skill: 'levels',
        prompt: 'Tap one of the candles where price bounced from the support zone.',
        packId: 'eu-sr-1',
        targetIndexes: SR_SWING_LOWS,
        hint: 'Look for the valleys that touched the same area and turned upward.',
        explain: 'Each of those valleys is a test of support. The more cleanly a zone turns price, the more traders watch it next time.',
      },
      {
        kind: 'truefalse',
        id: 'm3l1b3',
        skill: 'levels',
        statement: 'A support zone that has been tested and held is guaranteed to hold on the next test.',
        answer: false,
        explain:
          'Nothing is guaranteed. Every test consumes some of the buying interest sitting at a zone. Levels hold — until they do not. That is why stops exist.',
      },
      {
        kind: 'mcq',
        id: 'm3l1b4',
        skill: 'levels',
        prompt: 'Why do many traders prefer FRESH zones (few touches) over zones tested five times?',
        options: [
          { text: 'Fresh zones look nicer on screenshots' },
          {
            text: 'Each test can absorb the orders waiting there, so heavily tested zones may be running empty',
            explain: 'A zone is only as strong as the interest still waiting in it.',
          },
          { text: 'Old zones expire automatically after a week' },
        ],
        correctIndex: 1,
        explain:
          'This is an interpretation many traders share, not a law of physics — which is exactly why you backtest it before trusting it.',
      },
    ],
  },
  {
    id: 'm3l2',
    moduleId: 'm3',
    title: 'Role Reversal and Retests',
    objective: 'See how broken resistance can become support, and how retests are traded.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm3l2b1',
        skill: 'levels',
        title: 'When the ceiling becomes the floor',
        body:
          'When price breaks decisively above resistance, that same area often acts as support afterwards. Traders call this role reversal. The return of price to a broken level is a retest — a popular entry spot because the invalidation point (back inside the old range) is close and clear.',
        figure: { packId: 'eu-break-1', caption: 'Break above the ceiling, pull back to retest it, continue.' },
      },
      {
        kind: 'chartchoice',
        id: 'm3l2b2',
        skill: 'levels',
        prompt: 'After the breakout on this chart, price dipped back to the broken area and held. What is that dip called?',
        packId: 'eu-break-1',
        visible: 30,
        options: [
          { text: 'A retest of the broken level', explain: 'Price returned to the scene of the break and found support.' },
          { text: 'A fakeout' },
          { text: 'A gap fill' },
        ],
        correctIndex: 0,
        explain: 'Breakout → pullback to the level → continuation is the textbook break-and-retest sequence.',
      },
      {
        kind: 'mcq',
        id: 'm3l2b3',
        skill: 'levels',
        prompt: 'Why do many traders prefer entering on the retest instead of the breakout candle itself?',
        options: [
          { text: 'Retests always work' },
          {
            text: 'The stop can sit just beyond the level, making risk smaller and invalidation clearer',
            explain: 'Tighter, logical stops and cleaner invalidation are the practical benefits.',
          },
          { text: 'Breakout candles are illegal to trade in some countries' },
        ],
        correctIndex: 1,
        explain:
          'The trade-off is real, though: waiting for a retest sometimes means missing moves that never look back. Every entry style has a cost.',
      },
    ],
  },
  {
    id: 'm3l3',
    moduleId: 'm3',
    title: 'Fewer, Better Levels',
    objective: 'Mark only the levels that matter and rank their quality.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm3l3b1',
        skill: 'levels',
        title: 'The over-marked chart',
        body:
          'A chart with twenty lines gives twenty excuses to see whatever you want. Professionals mark few levels: recent, clearly respected, visible on higher timeframes. If a level did not obviously turn price, it does not deserve ink.',
        bullets: [
          'Prefer levels that produced clear, visible reactions.',
          'Prefer levels that are recent and still relevant.',
          'Higher-timeframe levels outrank lower-timeframe ones.',
        ],
        mistake: 'Marking every tiny bump. If everything is a level, nothing is.',
      },
      {
        kind: 'multi',
        id: 'm3l3b2',
        skill: 'levels',
        prompt: 'Which levels deserve to stay on your chart? Select all that apply.',
        options: [
          { text: 'A zone that produced three sharp reversals on the H4 chart' },
          { text: 'A line touching one small wick from three weeks ago' },
          { text: 'The area where a major breakout started last week' },
          { text: 'A level you drew because price is near it right now' },
        ],
        correctIndexes: [0, 2],
        hint: 'Ask: did price clearly and repeatedly react there?',
        explain: 'Strong reactions and origins of major moves earn a place. Single wicks and convenience lines are noise.',
      },
      {
        kind: 'scenario',
        id: 'm3l3b3',
        skill: 'levels',
        situation:
          'Your chart has 14 horizontal lines and you feel unable to decide anything. What is the best fix?',
        options: [
          {
            text: 'Delete everything, then re-mark only the 2–3 zones with the clearest reactions',
            quality: 'best',
            explain: 'A reset forces you to justify each level. Clarity beats coverage.',
          },
          { text: 'Add an indicator to confirm the lines', quality: 'poor', explain: 'More inputs on top of noise produces decorated noise.' },
          { text: 'Trade the nearest line since it is probably important', quality: 'poor', explain: 'Proximity is not evidence. That is convenience masquerading as analysis.' },
        ],
      },
      {
        kind: 'reflection',
        id: 'm3l3b4',
        skill: 'levels',
        prompt: 'Describe in your own words what makes a support or resistance zone "high quality".',
      },
    ],
  },
];
