import { Lesson, Module } from '@/types/content';

export const M9: Module = {
  id: 'm9',
  order: 9,
  world: 'Signal Observatory',
  title: 'Multiple Timeframes',
  tagline: 'Top-down analysis: context above, execution below, one routine forever.',
  icon: '🔭',
  skills: ['structure', 'strategy'],
  lessonIds: ['m9l1', 'm9l2', 'm9l3'],
  prereq: 'm8',
};

export const M9_LESSONS: Lesson[] = [
  {
    id: 'm9l1',
    moduleId: 'm9',
    title: 'The Top-Down Routine',
    objective: 'Build a repeatable higher-to-lower timeframe analysis sequence.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm9l1b1',
        skill: 'structure',
        title: 'Context first, trigger last',
        body:
          'Markets are fractal: the same swings, ranges and breaks appear on every timeframe. Professionals resolve this by assigning jobs. A higher timeframe (H4/D1) answers "which direction, and where are the important zones?". A lower timeframe (M15/H1) answers "is there a precise entry with a tight invalidation?". Always in that order — context first, trigger last.',
        bullets: [
          'Context timeframe: direction + key zones. Decided BEFORE looking closer.',
          'Execution timeframe: trigger + stop placement inside the higher-timeframe plan.',
          'Never let a lower timeframe wiggle overrule the context you already mapped.',
        ],
      },
      {
        kind: 'order',
        id: 'm9l1b2',
        skill: 'strategy',
        prompt: 'Arrange the top-down routine in the professional order.',
        items: [
          'Read D1/H4 structure: trend, range or transition?',
          'Mark the higher-timeframe zones that matter',
          'Define the only trades acceptable in this context',
          'Drop to the execution timeframe and wait at the zones',
          'Take the trigger with stop and size from the plan — or take nothing',
        ],
        explain:
          'The order is the discipline: by the time you see an exciting M15 candle, the decision about what is allowed was already made calmly above.',
      },
      {
        kind: 'mcq',
        id: 'm9l1b3',
        skill: 'structure',
        prompt: 'H4 shows a clean uptrend. M15 shows a sharp two-hour decline into an H4 support zone. What is the top-down reading?',
        options: [
          { text: 'The trend is over — M15 is falling' },
          {
            text: 'A higher-timeframe pullback arriving at a mapped zone — exactly where continuation setups are hunted',
            explain: 'The M15 "downtrend" is the H4 pullback seen up close.',
          },
          { text: 'The two timeframes contradict, so the market is broken' },
        ],
        correctIndex: 1,
        explain:
          'Lower timeframes zoom into higher-timeframe moves. What looks like a reversal up close is often just the breathing of the bigger trend.',
      },
      {
        kind: 'truefalse',
        id: 'm9l1b4',
        skill: 'strategy',
        statement: 'Checking five timeframes before every trade makes analysis more objective.',
        answer: false,
        explain:
          'More timeframes usually means more ways to justify anything (analysis paralysis or confirmation shopping). Two timeframes with fixed jobs beat five with none.',
      },
    ],
  },
  {
    id: 'm9l2',
    moduleId: 'm9',
    title: 'Walking a Top-Down Analysis',
    objective: 'Apply the routine on real charts: context, zone, then trigger or no trade.',
    xp: 65,
    blocks: [
      {
        kind: 'concept',
        id: 'm9l2b1',
        skill: 'structure',
        title: 'Step 1: the context chart',
        body:
          'Here is an H4 chart. Before any entry thinking, answer the context questions: which way are the swings stepping, and where did buyers or sellers clearly act? That is all a context chart is for.',
        figure: {
          packId: 'uj-up-1',
          visible: 40,
          caption: 'USD/JPY H4 — the context timeframe. Read the swings before anything else.',
        },
      },
      {
        kind: 'chartchoice',
        id: 'm9l2b2',
        skill: 'structure',
        prompt: 'Context call on this H4 chart: what is the higher-timeframe state?',
        packId: 'uj-up-1',
        visible: 40,
        options: [
          { text: 'Uptrend — higher highs and higher lows, currently pulling back', explain: 'That pullback into prior structure is where continuation plans live.' },
          { text: 'Downtrend — the last few candles are red' },
          { text: 'Untradeable chaos' },
        ],
        correctIndex: 0,
        hint: 'Judge the swing sequence, not the last three candles.',
        explain: 'Recent red candles inside rising swings = pullback within an uptrend. Context: look for longs at logical zones, or nothing.',
      },
      {
        kind: 'chartchoice',
        id: 'm9l2b3',
        skill: 'strategy',
        prompt: 'Execution decision: given a bullish H4 context and price pulling back, which plan is coherent on the lower timeframe?',
        packId: 'eu-rr-1',
        visible: 22,
        options: [
          { text: 'Short the pullback — it is moving down right now' },
          {
            text: 'Wait for the pullback to hold and a bullish trigger candle, then long with the stop below the swing low',
            explain: 'Execution serves context: trigger, tight invalidation, trend direction.',
          },
          { text: 'Buy immediately anywhere — the trend will save me' },
        ],
        correctIndex: 1,
        explain:
          '"The trend will save me" skips invalidation; shorting fights your own context. The patient trigger is the only plan consistent with the top-down read.',
      },
      {
        kind: 'scenario',
        id: 'm9l2b4',
        skill: 'psychology',
        situation:
          'Your H4 context says "longs only at the marked zone". Price never reaches the zone all session, but M15 prints two tempting bullish patterns elsewhere. What do you do?',
        options: [
          {
            text: 'Nothing — the patterns are outside the plan, and no-trade is the planned outcome',
            quality: 'best',
            explain: 'A context that only counts when convenient is not context. Empty sessions are tuition the market refunds later.',
          },
          { text: 'Take the M15 patterns — signals are signals', quality: 'poor', explain: 'That deletes the entire point of top-down analysis.' },
          { text: 'Move the zone to where price actually is', quality: 'poor', explain: 'Redrawing zones toward price is confirmation bias with a drawing tool.' },
        ],
      },
    ],
  },
  {
    id: 'm9l3',
    moduleId: 'm9',
    title: 'Timeframe Conflicts',
    objective: 'Decide what to do when timeframes genuinely disagree.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm9l3b1',
        skill: 'strategy',
        title: 'When the maps disagree',
        body:
          'Sometimes D1 is bullish while H4 is clearly breaking down. Conflicts are information: they often mark transitions or ranges, where edges are thinnest. You have three honest options: trade smaller, wait for realignment, or stand aside entirely. What you may not do is scroll timeframes until one agrees with the trade you already want.',
        mistake:
          '"Timeframe shopping": hunting through M5, M15, H1, H4 until some chart supports the position you emotionally committed to.',
      },
      {
        kind: 'mcq',
        id: 'm9l3b2',
        skill: 'strategy',
        prompt: 'D1 uptrend, H4 just printed a lower low and lower high. Your strategy needs both aligned. The correct action is:',
        options: [
          { text: 'Trust D1 and go long — bigger timeframe always wins' },
          { text: 'Trust H4 and go short — newer information always wins' },
          {
            text: 'No trade until your alignment condition returns',
            explain: 'The strategy defined its condition; the condition is absent.',
          },
        ],
        correctIndex: 2,
        hint: 'What does YOUR tested rule say about conflict?',
        explain:
          'Neither timeframe "wins" by decree. Your tested rule set required alignment — trading without it means trading an untested strategy.',
      },
      {
        kind: 'truefalse',
        id: 'm9l3b3',
        skill: 'structure',
        statement: 'A range on a higher timeframe often looks like alternating trends on a lower timeframe.',
        answer: true,
        explain:
          'Inside an H4 range, M15 shows "uptrends" to the ceiling and "downtrends" to the floor. Zoomed-in trend tools fire constantly and die at the edges — context explains why.',
      },
      {
        kind: 'reflection',
        id: 'm9l3b4',
        skill: 'strategy',
        prompt: 'Write your own two-timeframe rule: which timeframe sets context, which executes, and what happens on conflict?',
      },
    ],
  },
];
