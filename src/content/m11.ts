import { Lesson, Module } from '@/types/content';

export const M11: Module = {
  id: 'm11',
  order: 11,
  world: 'Global Stage',
  title: 'Sessions & Market Rhythm',
  tagline: 'Sydney to New York: when your pair is alive, asleep, or dangerous.',
  icon: '🌐',
  skills: ['execution', 'terminology'],
  lessonIds: ['m11l1', 'm11l2', 'm11l3'],
  prereq: 'm10',
};

export const M11_LESSONS: Lesson[] = [
  {
    id: 'm11l1',
    moduleId: 'm11',
    title: 'The 24-Hour Relay',
    objective: 'Know the four sessions and how liquidity hands over around the clock.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm11l1b1',
        skill: 'terminology',
        title: 'Follow the sun',
        body:
          'Forex runs 24 hours because financial centres open in relay: Sydney, then Tokyo, then London, then New York. Each session has a personality. Tokyo tends to be quieter and range-bound for European pairs; London brings the day’s first surge of liquidity and often sets the daily direction; the London–New York overlap is typically the most active window of all; late New York into early Sydney is the thinnest, most treacherous time.',
        bullets: [
          'London open: liquidity floods in; spreads tighten; moves get real.',
          'London–New York overlap: usually the day’s peak activity.',
          'Post-New York lull: thin books, wide spreads, erratic moves.',
        ],
      },
      {
        kind: 'order',
        id: 'm11l1b2',
        skill: 'terminology',
        prompt: 'Order the sessions as they open through the trading day (starting from the earliest).',
        items: ['Sydney opens', 'Tokyo opens', 'London opens', 'New York opens'],
        explain: 'The relay: Asia-Pacific first, then Europe, then America — liquidity passes westward around the globe.',
      },
      {
        kind: 'match',
        id: 'm11l1b3',
        skill: 'terminology',
        prompt: 'Match each pair to the session where it is usually most active.',
        pairs: [
          { left: 'USD/JPY', right: 'Tokyo session' },
          { left: 'EUR/GBP', right: 'London session' },
          { left: 'EUR/USD', right: 'London–New York overlap' },
          { left: 'AUD/USD', right: 'Sydney/Tokyo hours' },
        ],
        explain:
          'A pair wakes up when its home economies are at their desks. Trading EUR/GBP in the dead of Asian night means fighting wide spreads for tiny moves.',
      },
      {
        kind: 'truefalse',
        id: 'm11l1b4',
        skill: 'execution',
        statement: 'Because forex is open 24 hours, all hours are equally good for trading.',
        answer: false,
        explain:
          'Open is not the same as liquid. Thin hours have wider spreads, more erratic moves and less follow-through — the market is technically on, practically asleep.',
      },
    ],
  },
  {
    id: 'm11l2',
    moduleId: 'm11',
    title: 'Liquidity and the Clock',
    objective: 'Understand how session liquidity changes spreads, moves and your costs.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm11l2b1',
        skill: 'execution',
        title: 'Same pair, different market',
        body:
          'EUR/USD at 03:00 London time and EUR/USD at 09:00 London time are practically different instruments. In thin hours a modest order can push price several pips and spreads may double; in deep hours the same order vanishes into the book. Your strategy’s costs, stop behaviour and follow-through all change with the clock — which is why serious strategies specify their session.',
        example:
          'A breakout strategy tested only on London-session data will meet totally different fakeout rates at midnight. Same rules, different market, different results.',
        mistake:
          'Backtesting without a session filter, then trading the signals around the clock and wondering why live results differ.',
      },
      {
        kind: 'mcq',
        id: 'm11l2b2',
        skill: 'execution',
        prompt: 'Your EUR/USD strategy fires a signal at 23:30 London time (post-New York lull). The identical setup at 09:00 would be valid. What is the disciplined action?',
        options: [
          { text: 'Take it — a setup is a setup' },
          {
            text: 'Skip it if your rules specify active sessions; the conditions the edge was tested in are absent',
            explain: 'The session is part of the setup, whether the candles admit it or not.',
          },
          { text: 'Take it with double size to compensate for the wide spread' },
        ],
        correctIndex: 1,
        explain:
          'Thin-session signals live in a different statistical universe: wider costs, weaker follow-through. If you want to trade them, test them separately first.',
      },
      {
        kind: 'multi',
        id: 'm11l2b3',
        skill: 'execution',
        prompt: 'Which are typical features of LOW-liquidity hours? Select all that apply.',
        options: [
          { text: 'Wider spreads' },
          { text: 'Erratic moves that reverse without follow-through' },
          { text: 'Tighter spreads and deep order books' },
          { text: 'Higher slippage on stops' },
        ],
        correctIndexes: [0, 1, 3],
        explain: 'Thin books make everything more expensive and less reliable. Deep books are a feature of PEAK hours.',
      },
      {
        kind: 'truefalse',
        id: 'm11l2b4',
        skill: 'execution',
        statement: 'Daylight-saving time changes can shift session overlaps by an hour twice a year.',
        answer: true,
        explain:
          'The US and Europe change clocks on different dates, so overlap windows genuinely move. Professionals re-check session times each March and October — set a reminder.',
      },
    ],
  },
  {
    id: 'm11l3',
    moduleId: 'm11',
    title: 'Building a Session Routine',
    objective: 'Design a personal trading window that fits your strategy and your life.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm11l3b1',
        skill: 'execution',
        title: 'Trade a window, not a lifestyle collapse',
        body:
          'You do not need to watch markets all day — you need one well-chosen window traded consistently. Pick the session that fits your strategy AND your timezone and energy. A rested trader with 90 focused London-open minutes beats an exhausted one grazing charts for 12 hours. Consistent windows also make your journal comparable: same conditions, same you.',
        mistake:
          'Trading whenever you happen to be free, then comparing results as if they came from one market. They came from five different ones.',
      },
      {
        kind: 'scenario',
        id: 'm11l3b2',
        skill: 'psychology',
        situation:
          'Your job means you can only trade 21:00–23:00 local time, which lands in a thin market for your pair. What is the wisest adaptation?',
        options: [
          {
            text: 'Adapt the plan: switch to a pair active in your window, use higher-timeframe setups, or place pre-planned pending orders',
            quality: 'best',
            explain: 'Fit the strategy to the window you truly have — there are always honest options.',
          },
          { text: 'Force your London strategy into the thin window anyway', quality: 'poor', explain: 'The edge was tested elsewhere; the thin market will charge you the difference.' },
          { text: 'Sleep less and trade London at 4 a.m. before work every day', quality: 'poor', explain: 'Chronic exhaustion destroys discipline faster than any market. This plan fails at the human layer.' },
        ],
      },
      {
        kind: 'mcq',
        id: 'm11l3b3',
        skill: 'execution',
        prompt: 'What is the strongest reason to trade the SAME window every day while learning?',
        options: [
          { text: 'Markets reward loyalty' },
          {
            text: 'It holds conditions constant, so your journal measures your skill instead of the clock',
            explain: 'One variable at a time — the scientist’s habit applied to practice.',
          },
          { text: 'Brokers give discounts for consistent hours' },
        ],
        correctIndex: 1,
        explain:
          'Learning requires comparable feedback. A fixed window turns your journal into a controlled experiment on yourself.',
      },
      {
        kind: 'reflection',
        id: 'm11l3b4',
        skill: 'execution',
        prompt: 'Define your trading window: which hours (your local time), which session that maps to, and which pair fits it best.',
      },
    ],
  },
];
