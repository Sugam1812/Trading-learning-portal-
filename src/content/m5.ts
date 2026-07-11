import { Lesson, Module } from '@/types/content';

export const M5: Module = {
  id: 'm5',
  order: 5,
  world: 'Risk Fortress',
  title: 'Orders & Execution',
  tagline: 'Order types, slippage, and turning analysis into a precise trade plan.',
  icon: '🎯',
  skills: ['execution'],
  lessonIds: ['m5l1', 'm5l2', 'm5l3'],
  prereq: 'm4',
};

export const M5_LESSONS: Lesson[] = [
  {
    id: 'm5l1',
    moduleId: 'm5',
    title: 'Order Types',
    objective: 'Choose the right order type for the plan you actually have.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm5l1b1',
        skill: 'execution',
        title: 'Three ways to enter',
        body:
          'A market order executes now at the current price. A limit order waits to enter at a BETTER price than now (buy lower / sell higher). A stop order waits to enter at a WORSE price (buy higher / sell lower) — used to join breakouts or to exit losers (stop-loss).',
        bullets: [
          'Market: "get me in now" — pays the spread, risks slippage.',
          'Limit: "only at my price or better" — may never fill.',
          'Stop: "when price proves the move, take me in" — fills into momentum.',
        ],
      },
      {
        kind: 'match',
        id: 'm5l1b2',
        skill: 'execution',
        prompt: 'Match each intention to the right order type.',
        pairs: [
          { left: 'Buy the pullback at 1.0950 while price is 1.0980', right: 'Buy limit' },
          { left: 'Buy only if price breaks above 1.1020', right: 'Buy stop' },
          { left: 'Enter immediately at whatever the price is', right: 'Market order' },
          { left: 'Automatically close my long if price falls to 1.0930', right: 'Stop-loss' },
        ],
        explain: 'Limit = better price, stop = worse price (or protective exit), market = right now.',
      },
      {
        kind: 'mcq',
        id: 'm5l1b3',
        skill: 'execution',
        prompt: 'You want to short GBP/USD, but only if it first rallies into resistance at 1.2780. Price is now 1.2740. Which order?',
        options: [
          { text: 'Sell market' },
          { text: 'Sell limit at 1.2780', explain: 'Selling at a better (higher) price than now = sell limit.' },
          { text: 'Sell stop at 1.2700' },
        ],
        correctIndex: 1,
        hint: 'Higher than the current price is a BETTER price for a seller.',
        explain: 'A sell limit rests above the market and fills if price rallies into it — the patient way to sell resistance.',
      },
      {
        kind: 'truefalse',
        id: 'm5l1b4',
        skill: 'execution',
        statement: 'A pending limit order is guaranteed to fill if price touches your level.',
        answer: false,
        explain:
          'A touch is not a guarantee — at fast moments there may not be enough volume at your price, and some fills happen only if price trades through the level.',
      },
    ],
  },
  {
    id: 'm5l2',
    moduleId: 'm5',
    title: 'Slippage, Spread and News',
    objective: 'Understand why fills differ from plans, and when execution risk explodes.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm5l2b1',
        skill: 'execution',
        title: 'The gap between plan and fill',
        body:
          'Slippage is the difference between the price you expected and the price you got. In calm markets it is tiny. Around major news, spreads widen violently and prices jump levels entirely — your stop can fill many pips worse than placed. This is not the broker cheating; it is how fast markets work.',
        mistake:
          'Testing a strategy with perfect fills, then trading it around news releases. Real execution costs can erase a thin edge entirely.',
      },
      {
        kind: 'mcq',
        id: 'm5l2b2',
        skill: 'execution',
        prompt: 'Your stop-loss was at 1.0950. A surprise news release hit and your long closed at 1.0938. What happened?',
        options: [
          { text: 'The broker stole 12 pips' },
          {
            text: 'Slippage: price gapped through the stop and the order filled at the next available price',
            explain: 'Stops become market orders when triggered — they fill at what is available.',
          },
          { text: 'The stop-loss malfunctioned and should be refunded' },
        ],
        correctIndex: 1,
        explain:
          'In fast markets there may be no orders between 1.0950 and 1.0938. Your stop triggered correctly and filled at the first real price.',
      },
      {
        kind: 'scenario',
        id: 'm5l2b3',
        skill: 'execution',
        situation:
          'A textbook-quality setup has formed, but a high-impact USD news release is due in 4 minutes. Your plan has no news rule yet. What is the strongest decision?',
        options: [
          {
            text: 'Wait until after the release and re-evaluate with fresh prices',
            quality: 'best',
            explain: 'Spreads widen, slippage explodes, and the first reaction often reverses. Waiting costs little; bad fills cost a lot.',
          },
          { text: 'Enter now with a wider stop to survive the volatility', quality: 'poor', explain: 'A wider stop with the same size means MORE money at risk in the most random minutes of the day.' },
          { text: 'Enter with double size — news means opportunity', quality: 'poor', explain: 'News volatility is not an edge; it is randomness with worse execution costs.' },
        ],
      },
      {
        kind: 'multi',
        id: 'm5l2b4',
        skill: 'execution',
        prompt: 'Which costs affect your real results but are invisible on a clean chart? Select all that apply.',
        options: [
          { text: 'Spread on every entry' },
          { text: 'Slippage in fast markets' },
          { text: 'Swap/rollover on positions held overnight' },
          { text: 'The color of your candlesticks' },
        ],
        correctIndexes: [0, 1, 2],
        explain: 'Honest backtesting subtracts realistic costs. A strategy that only works with zero costs does not work.',
      },
    ],
  },
  {
    id: 'm5l3',
    moduleId: 'm5',
    title: 'The Complete Trade Plan',
    objective: 'Assemble entry, stop, target and size into one testable plan.',
    xp: 65,
    blocks: [
      {
        kind: 'concept',
        id: 'm5l3b1',
        skill: 'execution',
        title: 'Five questions, every trade',
        body:
          'A complete plan answers, before entry: Where do I enter? Where am I wrong (stop)? Where do I take profit (target)? How big is the position (from risk %)? And what makes me skip the trade (news, spread, session)? If any answer is missing, there is no trade — only a guess.',
      },
      {
        kind: 'order',
        id: 'm5l3b2',
        skill: 'execution',
        prompt: 'Put the pre-trade checklist into a sensible order.',
        items: [
          'Read higher-timeframe structure and mark levels',
          'Wait for the setup and entry trigger',
          'Place the stop where the idea is invalidated',
          'Set a realistic target and check reward-to-risk ≥ minimum',
          'Calculate position size from the risk percent',
          'Check news and spread, then execute or skip',
        ],
        explain: 'Context → trigger → risk → reward → size → final safety check. Same order, every time — that is what makes it testable.',
      },
      {
        kind: 'rrbuilder',
        id: 'm5l3b3',
        skill: 'execution',
        prompt: 'Practice a SHORT: entry 1.2700. Build a plan with at least 1:1.5 reward-to-risk.',
        direction: 'short',
        entry: 1.27,
        pipSize: 0.0001,
        initialStopPips: 25,
        initialTargetPips: 25,
        requiredRatio: 1.5,
        explain: 'For a short, the stop sits ABOVE entry and the target BELOW. The math is mirror-imaged, the discipline identical.',
      },
      {
        kind: 'mcq',
        id: 'm5l3b4',
        skill: 'execution',
        prompt: 'Which of these is a COMPLETE trade plan?',
        options: [
          { text: '"Buy EUR/USD, it looks strong, I will exit when it feels right"' },
          {
            text: '"Long at 1.0950 on a retest; stop 1.0925; target 1.1000; risk 1%; skip if news within 15 min"',
            explain: 'Entry, invalidation, target, size, and a skip condition — all present and objective.',
          },
          { text: '"Short at market with a tight stop somewhere below"' },
        ],
        correctIndex: 1,
        explain: 'A plan that a stranger could execute identically is complete. Everything else is improvisation.',
      },
    ],
  },
];
