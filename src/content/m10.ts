import { Lesson, Module } from '@/types/content';

export const M10: Module = {
  id: 'm10',
  order: 10,
  world: 'Global Stage',
  title: 'Fundamentals & News',
  tagline: 'Central banks, the economic calendar, and why first reactions lie.',
  icon: '🏛️',
  skills: ['terminology', 'execution'],
  lessonIds: ['m10l1', 'm10l2', 'm10l3'],
  prereq: 'm5',
};

export const M10_LESSONS: Lesson[] = [
  {
    id: 'm10l1',
    moduleId: 'm10',
    title: 'What Moves Currencies',
    objective: 'Connect interest rates, inflation and economic strength to currency demand.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm10l1b1',
        skill: 'terminology',
        title: 'Money flows toward reward',
        body:
          'Currencies are claims on economies. When a central bank raises interest rates, holding that currency pays more, so demand for it tends to rise. Inflation, employment and growth data matter mostly because they change what the central bank is expected to do next. Markets trade EXPECTATIONS: by the time a decision is announced, much of it is often already priced in.',
        bullets: [
          'Higher expected interest rates → currency tends to strengthen (all else equal).',
          '"Hawkish" = leaning toward higher rates. "Dovish" = leaning toward lower rates.',
          'Data matters through one question: what does this mean for future rates?',
        ],
        example:
          'US inflation comes in far above forecast. Traders expect the central bank to keep rates higher for longer — the dollar often strengthens within seconds.',
        mistake:
          'Believing strong data ALWAYS strengthens a currency. If the market expected even stronger data, the currency can fall on "good" news.',
      },
      {
        kind: 'match',
        id: 'm10l1b2',
        skill: 'terminology',
        prompt: 'Match each term to its plain meaning.',
        pairs: [
          { left: 'Hawkish', right: 'Leaning toward higher interest rates' },
          { left: 'Dovish', right: 'Leaning toward lower interest rates' },
          { left: 'Priced in', right: 'Already reflected in the current price before the event' },
          { left: 'Risk-off', right: 'Investors fleeing to safer assets in fear' },
        ],
        explain:
          'These four terms unlock most financial headlines. Note how each is about expectations and behaviour, not certainty.',
      },
      {
        kind: 'mcq',
        id: 'm10l1b3',
        skill: 'terminology',
        prompt: 'A central bank raises rates exactly as everyone forecast, and hints at no further hikes. The currency FALLS. Why is this not crazy?',
        options: [
          { text: 'The market malfunctioned' },
          {
            text: 'The hike was already priced in, and the "no further hikes" hint was new dovish information',
            explain: 'The surprise was in the guidance, not the decision.',
          },
          { text: 'Rate hikes always weaken currencies' },
        ],
        correctIndex: 1,
        explain:
          'Markets move on the gap between expectation and reality. The expected part was old news; the guidance was the actual event.',
      },
      {
        kind: 'truefalse',
        id: 'm10l1b4',
        skill: 'terminology',
        statement: 'If you know tomorrow’s data release will be strong, you are guaranteed to profit by buying the currency now.',
        answer: false,
        explain:
          'Even perfect data foresight does not fix your entry, the market’s expectation, positioning, or the reaction path. This is why "trading the news" is far harder than it looks — and why we teach a news-avoidance rule first.',
      },
    ],
  },
  {
    id: 'm10l2',
    moduleId: 'm10',
    title: 'Reading the Economic Calendar',
    objective: 'Use forecast vs previous vs actual, and impact ratings, to plan your week.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm10l2b1',
        skill: 'execution',
        title: 'The trader’s weather forecast',
        body:
          'An economic calendar lists scheduled releases with three numbers: Previous (last time), Forecast (what analysts expect) and Actual (what arrives). Volatility comes from the SURPRISE — the gap between actual and forecast. Calendars also rate expected impact (low/medium/high). High-impact events on your pair’s currencies are the ones your news rule must respect.',
        example:
          'Non-farm payrolls: previous 180k, forecast 200k, actual 320k. A huge upside surprise — expect violent dollar moves, spread spikes, and slippage for several minutes.',
      },
      {
        kind: 'mcq',
        id: 'm10l2b2',
        skill: 'execution',
        prompt: 'Forecast inflation: 3.0%. Actual: 3.1%. Previous: 3.4%. Which framing best predicts the likely reaction size?',
        options: [
          { text: 'Huge move — inflation is above 3%' },
          {
            text: 'Modest surprise — actual barely beat forecast, so the reaction is likely contained',
            explain: 'Reaction size tracks the forecast gap, not the absolute number.',
          },
          { text: 'No move ever happens on inflation data' },
        ],
        correctIndex: 1,
        explain:
          'Markets pre-position around the forecast. A 0.1 beat is a small surprise; the same number versus a 2.5% forecast would be an earthquake.',
      },
      {
        kind: 'multi',
        id: 'm10l2b3',
        skill: 'execution',
        prompt: 'You trade EUR/USD. Which calendar events belong in your news filter? Select all that apply.',
        options: [
          { text: 'High-impact US employment data' },
          { text: 'European Central Bank rate decisions' },
          { text: 'A low-impact New Zealand dairy auction' },
          { text: 'High-impact US inflation (CPI)' },
        ],
        correctIndexes: [0, 1, 3],
        hint: 'Filter by the two currencies in YOUR pair and the impact rating.',
        explain:
          'EUR and USD events with high impact can hit your pair directly. Unrelated low-impact events are noise for this pair.',
      },
      {
        kind: 'order',
        id: 'm10l2b4',
        skill: 'execution',
        prompt: 'Build the weekly news routine in order.',
        items: [
          'Sunday: scan the week’s high-impact events for your currencies',
          'Mark no-trade windows around each event',
          'Each morning: re-check today’s calendar before the first trade',
          'Near an event: flatten or skip per your news rule',
          'After the event: wait for spreads to normalise before re-evaluating',
        ],
        explain: 'Ten minutes of calendar work per week removes the single most violent execution risk a beginner faces.',
      },
    ],
  },
  {
    id: 'm10l3',
    moduleId: 'm10',
    title: 'Why First Reactions Lie',
    objective: 'Respect the chaos of release minutes and build a personal news rule.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm10l3b1',
        skill: 'execution',
        title: 'The whipsaw minutes',
        body:
          'In the first seconds after a big release, prices are driven by algorithms reacting to headlines, stop-loss cascades, and evaporating liquidity. It is common for price to spike one way and finish the hour the other way — both moves "real", both untradeable for a beginner. Spreads can widen tenfold, and stops fill wherever there is liquidity, not where you placed them.',
        mistake:
          'Judging your analysis by the first 60 seconds after news. That window is a liquidity event, not a verdict.',
      },
      {
        kind: 'scenario',
        id: 'm10l3b2',
        skill: 'execution',
        situation:
          'You are long EUR/USD from a tested setup. High-impact US news lands in 10 minutes and your trade is +0.5R. Your plan has no explicit news-management rule yet. Best action?',
        options: [
          {
            text: 'Reduce or close before the release, then write the missing rule into the plan tonight',
            quality: 'best',
            explain: 'Unmanaged news risk on an open position is a plan gap. Fix the exposure now, fix the plan permanently after.',
          },
          { text: 'Hold and hope — it is only 10 minutes', quality: 'poor', explain: 'Ten minutes of tenfold spread and slippage risk on an unprotected position is exactly how +0.5R becomes −2R.' },
          { text: 'Double the position to exploit the volatility', quality: 'poor', explain: 'Adding size into maximum uncertainty is the inverse of risk management.' },
        ],
      },
      {
        kind: 'mcq',
        id: 'm10l3b3',
        skill: 'execution',
        prompt: 'What is the main reason beginners are told to AVOID trading news rather than exploit it?',
        options: [
          { text: 'News trading is illegal for retail traders' },
          {
            text: 'Execution costs explode exactly when direction is most random — a double penalty with no tested edge',
            explain: 'Wide spreads + slippage + whipsaws + no edge = negative expectancy by construction.',
          },
          { text: 'News never moves prices' },
        ],
        correctIndex: 1,
        explain:
          'Some professionals do trade events — with infrastructure, models and years of testing. The beginner’s edge around news is absence.',
      },
      {
        kind: 'reflection',
        id: 'm10l3b4',
        skill: 'execution',
        prompt: 'Write your personal news rule: which events, how many minutes before and after, and what happens to open trades.',
      },
    ],
  },
];
