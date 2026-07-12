import { Lesson, Module } from '@/types/content';

export const M0: Module = {
  id: 'm0',
  order: 0,
  world: 'Currency Foundations',
  title: 'Forex Orientation',
  tagline: 'What forex is, how prices are quoted, and why it is risky.',
  icon: '🌍',
  skills: ['terminology'],
  lessonIds: ['m0l1', 'm0l2', 'm0l3', 'm0l4', 'm0l5'],
};

export const M0_LESSONS: Lesson[] = [
  {
    id: 'm0l1',
    moduleId: 'm0',
    title: 'What is Forex?',
    objective: 'Understand what the forex market is and what trading it actually means.',
    xp: 50,
    blocks: [
      {
        kind: 'concept',
        id: 'm0l1b1',
        skill: 'terminology',
        title: 'The biggest market you have never seen',
        body:
          'Forex (foreign exchange) is where one currency is swapped for another. When a company in Europe buys goods from Japan, euros must become yen. When you travel abroad and exchange money, you take part in forex. Traders try to profit from changes in the exchange rate between two currencies.',
        bullets: [
          'Forex runs 24 hours a day, 5 days a week, across world time zones.',
          'There is no single exchange building — banks and brokers trade over networks.',
          'You always trade one currency against another, never a currency alone.',
        ],
        example:
          'If EUR/USD moves from 1.1000 to 1.1100, one euro now buys more US dollars. Someone who bought euros earlier could sell them for a profit.',
      },
      {
        kind: 'mcq',
        id: 'm0l1b2',
        skill: 'terminology',
        prompt: 'What does a forex trader actually buy and sell?',
        options: [
          { text: 'Shares in currency companies' },
          { text: 'One currency in exchange for another', explain: 'Exactly — every forex trade is a pair of currencies.' },
          { text: 'Physical banknotes delivered by mail' },
          { text: 'Government bonds' },
        ],
        correctIndex: 1,
        hint: 'Think about what happens at an airport exchange desk.',
        explain: 'Forex trading always exchanges one currency for another, which is why prices are quoted in pairs.',
      },
      {
        kind: 'concept',
        id: 'm0l1b3',
        skill: 'terminology',
        title: 'Education first, honesty always',
        body:
          'Forex is risky. Most new traders lose money at first, and leverage can make losses bigger than expected. This app teaches skills and process. It does not give signals, does not predict live markets, and does not promise income. Anyone who promises guaranteed forex profits is misleading you.',
        mistake:
          'Believing that a course, robot, or signal group can guarantee profits. No honest educator promises returns.',
      },
      {
        kind: 'truefalse',
        id: 'm0l1b4',
        skill: 'terminology',
        statement: 'A good education guarantees that you will make money trading forex.',
        answer: false,
        explain:
          'Education improves your process, but no education can guarantee profits. Markets involve real risk and randomness — that is why we test everything and risk little.',
      },
      {
        kind: 'scenario',
        id: 'm0l1b5',
        skill: 'psychology',
        situation:
          'A social media account shows screenshots of huge daily profits and offers a "guaranteed 90% win rate" signal group for $99 a month. What is the wisest response?',
        options: [
          {
            text: 'Join quickly before the price goes up',
            quality: 'poor',
            explain: 'Urgency is a classic sales trick. Guaranteed win rates do not exist, and screenshots are easy to fake.',
          },
          {
            text: 'Ignore it — guaranteed win rates are a red flag for a scam',
            quality: 'best',
            explain:
              'Correct. No one can guarantee win rates. Real trading education talks about risk, testing, and losses — not certainty.',
          },
          {
            text: 'Join but only follow half of the signals',
            quality: 'poor',
            explain: 'Following an unverified stranger with any of your money is the problem, not the amount.',
          },
        ],
      },
    ],
  },
  {
    id: 'm0l2',
    moduleId: 'm0',
    title: 'Currency Pairs',
    objective: 'Read a currency pair and identify the base and quote currency.',
    xp: 50,
    blocks: [
      {
        kind: 'concept',
        id: 'm0l2b1',
        skill: 'terminology',
        title: 'Base and quote',
        body:
          'A pair like EUR/USD has two parts. The first currency (EUR) is the base — it is the thing being priced. The second (USD) is the quote — the currency used to state the price. EUR/USD = 1.1000 means: one euro costs 1.10 US dollars.',
        bullets: [
          'Base currency: the first one. You buy or sell one unit of it.',
          'Quote currency: the second one. The price is expressed in it.',
          'If EUR/USD rises, the euro is getting stronger against the dollar.',
        ],
        example: 'GBP/JPY = 190.50 means one British pound costs 190.50 Japanese yen.',
      },
      {
        kind: 'mcq',
        id: 'm0l2b2',
        skill: 'terminology',
        prompt: 'In the pair GBP/USD, which is the base currency?',
        options: [{ text: 'GBP (British pound)' }, { text: 'USD (US dollar)' }, { text: 'Both equally' }],
        correctIndex: 0,
        explain: 'The first currency in the pair is always the base. GBP/USD quotes the price of one pound in dollars.',
      },
      {
        kind: 'mcq',
        id: 'm0l2b3',
        skill: 'terminology',
        prompt: 'USD/JPY = 148.00. What does this price mean?',
        options: [
          { text: 'One yen costs 148 dollars' },
          { text: 'One dollar costs 148 yen', explain: 'Right — base first, priced in the quote currency.' },
          { text: '148 dollars equals 148 yen' },
        ],
        correctIndex: 1,
        hint: 'The base currency (first) is the one being priced.',
        explain: 'The base (USD) is priced in the quote (JPY): one dollar = 148 yen.',
      },
      {
        kind: 'match',
        id: 'm0l2b4',
        skill: 'terminology',
        prompt: 'Match each pair type with its description.',
        pairs: [
          { left: 'Major pair', right: 'Includes USD and is heavily traded, e.g. EUR/USD' },
          { left: 'Minor pair', right: 'Two major currencies without USD, e.g. EUR/GBP' },
          { left: 'Exotic pair', right: 'A major plus a smaller economy, e.g. USD/TRY' },
        ],
        explain:
          'Majors have the tightest spreads and deepest liquidity, which is why beginners usually learn with them. Exotics move wildly and cost more to trade.',
      },
      {
        kind: 'truefalse',
        id: 'm0l2b5',
        skill: 'terminology',
        statement: 'If EUR/USD falls, the US dollar is getting stronger against the euro.',
        answer: true,
        explain:
          'A falling EUR/USD means one euro buys fewer dollars — euro weaker, dollar stronger. Every pair is a see-saw between two currencies.',
      },
    ],
  },
  {
    id: 'm0l3',
    moduleId: 'm0',
    title: 'Pips and Price Moves',
    objective: 'Measure price movement in pips for normal and JPY pairs.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm0l3b1',
        skill: 'terminology',
        title: 'The pip: the trader’s centimetre',
        body:
          'A pip is the standard unit of price movement. For most pairs it is the 4th decimal place (0.0001). For pairs with Japanese yen it is the 2nd decimal (0.01). Many brokers also show a 5th decimal called a pipette — one tenth of a pip.',
        bullets: [
          'EUR/USD from 1.1000 to 1.1001 = 1 pip.',
          'USD/JPY from 148.00 to 148.01 = 1 pip.',
          'EUR/USD from 1.1000 to 1.10005 = half a pip (5 pipettes).',
        ],
        example: 'EUR/USD moves from 1.0850 to 1.0895. That is 45 pips.',
      },
      {
        kind: 'number',
        id: 'm0l3b2',
        skill: 'terminology',
        prompt: 'EUR/USD moves from 1.1000 to 1.1040. How many pips did it move?',
        answer: 40,
        unit: 'pips',
        hint: 'Count steps of 0.0001.',
        explain: '1.1040 − 1.1000 = 0.0040 = 40 pips.',
      },
      {
        kind: 'number',
        id: 'm0l3b3',
        skill: 'terminology',
        prompt: 'USD/JPY falls from 148.50 to 147.90. How many pips is the move?',
        answer: 60,
        unit: 'pips',
        hint: 'For JPY pairs one pip is 0.01.',
        explain: '148.50 − 147.90 = 0.60 = 60 pips, because JPY pairs count pips at the second decimal.',
      },
      {
        kind: 'mcq',
        id: 'm0l3b4',
        skill: 'terminology',
        prompt: 'Why do traders measure moves in pips instead of "the price went up a bit"?',
        options: [
          { text: 'It sounds more professional' },
          {
            text: 'Pips give an exact, comparable measure for risk and reward',
            explain: 'Yes — you cannot size a position or compare trades without exact units.',
          },
          { text: 'Brokers require it by law' },
        ],
        correctIndex: 1,
        explain:
          'Risk management is mathematics. "My stop is 20 pips away" can be turned into an exact money amount; "a bit lower" cannot.',
      },
    ],
  },
  {
    id: 'm0l4',
    moduleId: 'm0',
    title: 'Bid, Ask and Spread',
    objective: 'Understand the two prices you always trade between, and what they cost you.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm0l4b1',
        skill: 'terminology',
        title: 'Two prices, not one',
        body:
          'At any moment there are two prices. The bid is what buyers will pay (you sell at the bid). The ask is what sellers demand (you buy at the ask). The gap between them is the spread — the built-in cost of every trade.',
        bullets: [
          'Buy at the ask, sell at the bid. The ask is always slightly higher.',
          'The spread is measured in pips and goes to the market/broker, not to you.',
          'Every new trade starts slightly negative because of the spread.',
        ],
        example: 'EUR/USD bid 1.1000 / ask 1.1001 → the spread is 1 pip.',
        mistake:
          'Forgetting the spread when placing very tight stops. A 3-pip stop with a 1.5-pip spread is nearly impossible to trade.',
      },
      {
        kind: 'number',
        id: 'm0l4b2',
        skill: 'terminology',
        prompt: 'GBP/USD is quoted bid 1.2700 / ask 1.2703. What is the spread in pips?',
        answer: 3,
        unit: 'pips',
        explain: '1.2703 − 1.2700 = 0.0003 = 3 pips.',
      },
      {
        kind: 'mcq',
        id: 'm0l4b3',
        skill: 'execution',
        prompt: 'Two brokers quote EUR/USD. Broker A: 1.1000/1.1001. Broker B: 1.1000/1.1003. Which is cheaper to trade, all else equal?',
        options: [
          { text: 'Broker A — 1 pip spread', explain: 'Correct, a tighter spread means a smaller built-in cost.' },
          { text: 'Broker B — 3 pip spread' },
          { text: 'They cost the same' },
        ],
        correctIndex: 0,
        explain: 'The spread is a cost you pay on every trade. Over hundreds of trades, spread differences matter a lot.',
      },
      {
        kind: 'multi',
        id: 'm0l4b4',
        skill: 'execution',
        prompt: 'When does the spread usually get wider? Select all that apply.',
        options: [
          { text: 'During major news releases' },
          { text: 'In quiet hours with low liquidity (e.g. late Friday)' },
          { text: 'When you are winning' },
          { text: 'On exotic pairs' },
        ],
        correctIndexes: [0, 1, 3],
        hint: 'Spreads widen when fewer participants are quoting prices, or when uncertainty spikes.',
        explain:
          'News, thin liquidity, and exotic pairs all widen spreads. Your profit or loss has no effect on the spread.',
      },
    ],
  },
  {
    id: 'm0l5',
    moduleId: 'm0',
    title: 'Lots, Leverage, Long and Short',
    objective: 'Know how position size works and how leverage magnifies both gains and losses.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm0l5b1',
        skill: 'terminology',
        title: 'Lots: how much you trade',
        body:
          'Position size is measured in lots. One standard lot is 100,000 units of the base currency. A mini lot is 10,000, and a micro lot is 1,000. For most USD-quoted pairs, one standard lot makes each pip worth about $10, a mini lot about $1, and a micro lot about $0.10.',
        example:
          'You trade 0.10 lots (a mini lot) on EUR/USD. Price moves 25 pips in your favour: about 25 × $1 = $25 gain. It moves 25 pips against you: about $25 loss.',
      },
      {
        kind: 'number',
        id: 'm0l5b2',
        skill: 'math',
        prompt: 'You trade 0.10 lots on EUR/USD (about $1 per pip). Price moves 30 pips against you. Roughly how many dollars did you lose?',
        answer: 30,
        unit: 'USD',
        explain: '30 pips × $1 per pip = $30. Size converts pips into money — in both directions.',
      },
      {
        kind: 'concept',
        id: 'm0l5b3',
        skill: 'risk',
        title: 'Leverage: a magnifier, not a gift',
        body:
          'Leverage lets you control a large position with a small deposit (margin). With 1:100 leverage, $1,000 can control $100,000. This magnifies profits AND losses equally. Leverage does not change the market — it changes how hard each pip hits your account.',
        bullets: [
          'Margin is the deposit locked to open a position.',
          'High leverage + big positions = a few bad trades can empty an account.',
          'Professionals think in risk per trade, not in maximum possible leverage.',
        ],
        mistake:
          'Thinking higher leverage means higher expected profit. It only means bigger swings — the direction of the market does not care about your leverage.',
      },
      {
        kind: 'mcq',
        id: 'm0l5b4',
        skill: 'terminology',
        prompt: 'You believe EUR/USD will FALL. Which trade expresses that view?',
        options: [
          { text: 'Go long (buy) EUR/USD' },
          { text: 'Go short (sell) EUR/USD', explain: 'Right — selling first, hoping to buy back cheaper.' },
          { text: 'You cannot profit from falling prices in forex' },
        ],
        correctIndex: 1,
        explain:
          'Short selling means selling the base currency now and buying it back later. In forex you can trade both directions equally easily.',
      },
      {
        kind: 'scenario',
        id: 'm0l5b5',
        skill: 'risk',
        situation:
          'Two traders each have $1,000. Trader A risks $10 per trade. Trader B uses maximum leverage and risks $300 per trade. Both hit a normal streak of 3 losing trades. What happens?',
        options: [
          {
            text: 'A loses $30 (3%), B loses $900 (90%) — B is nearly ruined by a routine streak',
            quality: 'best',
            explain:
              'Exactly. Losing streaks are normal and unavoidable. Small risk per trade is what lets you survive them.',
          },
          {
            text: 'B was braver, and courage is rewarded in trading',
            quality: 'poor',
            explain: 'Markets do not pay for bravery. Oversized risk turns normal variance into ruin.',
          },
          {
            text: 'Both are fine because losses always come back',
            quality: 'poor',
            explain: 'Losses do not have to come back. A 90% drawdown needs a 900% gain just to break even.',
          },
        ],
      },
      {
        kind: 'reflection',
        id: 'm0l5b6',
        skill: 'psychology',
        prompt:
          'In one or two sentences: what would losing 10% of your savings feel like, and how much money could you truly afford to risk while learning?',
      },
    ],
  },
];
