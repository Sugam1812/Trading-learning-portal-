import { Lesson, Module } from '@/types/content';

export const M8: Module = {
  id: 'm8',
  order: 8,
  world: 'Signal Observatory',
  title: 'Indicators',
  tagline: 'What indicators calculate, what they cannot know, and when fewer is better.',
  icon: '📐',
  skills: ['strategy', 'math'],
  lessonIds: ['m8l1', 'm8l2', 'm8l3', 'm8l4'],
  prereq: 'm4',
};

export const M8_LESSONS: Lesson[] = [
  {
    id: 'm8l1',
    moduleId: 'm8',
    title: 'Moving Averages',
    objective: 'Understand what a moving average calculates and why it always lags.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm8l1b1',
        skill: 'strategy',
        title: 'The average of the recent past',
        body:
          'A simple moving average (SMA) adds the last N closing prices and divides by N. A 20-period SMA is the average close of the last 20 candles, recalculated every candle. Because it only uses past prices, it always lags: it describes where price HAS been, never where it is going.',
        bullets: [
          'Price above a rising SMA: recent closes are above the recent average — an uptrend description.',
          'An exponential moving average (EMA) weighs recent candles more, so it turns faster but whipsaws more.',
          'The gold line below is a 20-period SMA computed live from the candles.',
        ],
        figure: {
          packId: 'eu-up-1',
          sma: [{ period: 20 }],
          caption: 'A 20-period SMA (gold) trailing an uptrend. Note how it starts only after 20 candles exist.',
        },
        mistake: 'Treating an SMA crossover as a prediction. It is a summary of the past, restated — nothing more.',
      },
      {
        kind: 'number',
        id: 'm8l1b2',
        skill: 'math',
        prompt: 'A 4-period SMA uses the last four closes: 1.10, 1.12, 1.14, 1.16. What is its value?',
        answer: 1.13,
        tolerance: 0.001,
        hint: 'Add the four closes and divide by 4.',
        explain: '(1.10 + 1.12 + 1.14 + 1.16) ÷ 4 = 1.13. Every indicator is just arithmetic on past prices.',
      },
      {
        kind: 'mcq',
        id: 'm8l1b3',
        skill: 'strategy',
        prompt: 'Price crosses above the 50 SMA. What does this FACTUALLY tell you?',
        options: [
          { text: 'Price will now rise' },
          {
            text: 'The current price is above the average of the last 50 closes — nothing about the future',
            explain: 'Indicators describe; they do not predict.',
          },
          { text: 'Institutions are buying' },
        ],
        correctIndex: 1,
        explain:
          'A crossover can be part of a tested rule set, but by itself it is a description of the past. Whether it has predictive value in YOUR rules is exactly what backtesting measures.',
      },
      {
        kind: 'truefalse',
        id: 'm8l1b4',
        skill: 'strategy',
        statement: 'A shorter moving average reacts faster but produces more false signals in choppy markets.',
        answer: true,
        explain:
          'Speed and noise are a trade-off you cannot escape — a faster average follows every wiggle, a slower one arrives late to every turn. There is no magic period; there are only tested trade-offs.',
      },
    ],
  },
  {
    id: 'm8l2',
    moduleId: 'm8',
    title: 'Oscillators: RSI and Friends',
    objective: 'Read momentum oscillators without falling for the overbought myth.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm8l2b1',
        skill: 'strategy',
        title: 'Measuring the speed of recent moves',
        body:
          'RSI (Relative Strength Index) compares the size of recent up-closes to recent down-closes and squeezes the result between 0 and 100. High RSI (say above 70) means recent candles were strongly bullish — traders call this "overbought". But overbought does NOT mean "must fall": in strong trends, RSI can stay above 70 for a very long time while price keeps climbing.',
        example:
          'A market rallies for ten straight days. RSI reads 82 the whole week. Sellers who shorted "because overbought" were run over daily. Overbought describes speed, not a ceiling.',
        mistake:
          'Selling only because RSI is above 70. In an uptrend that is often the strongest part of the move.',
      },
      {
        kind: 'mcq',
        id: 'm8l2b2',
        skill: 'strategy',
        prompt: 'RSI reads 25 in a strong downtrend. Your friend says "it must bounce now — it is oversold". What is the honest reply?',
        options: [
          { text: 'Agreed — oversold means a bounce is due' },
          {
            text: 'Oversold describes recent selling speed; trends can stay oversold far longer than your account can stay solvent',
            explain: 'Exactly. "Due" thinking is the gambler’s fallacy dressed in an indicator.',
          },
          { text: 'RSI below 30 is a broker error' },
        ],
        correctIndex: 1,
        explain:
          'Oscillator extremes are context, not commands. Some tested strategies use them as filters — but only with structure, invalidation and a real sample behind them.',
      },
      {
        kind: 'match',
        id: 'm8l2b3',
        skill: 'strategy',
        prompt: 'Match each indicator to what it actually measures.',
        pairs: [
          { left: 'RSI', right: 'Speed of recent up-moves versus down-moves' },
          { left: 'ATR', right: 'Average size of recent candle ranges (volatility)' },
          { left: 'MACD', right: 'Distance between two moving averages over time' },
          { left: 'Bollinger Bands', right: 'How far price sits from its average, in volatility units' },
        ],
        explain:
          'Every indicator answers one narrow question about the past. Knowing THE question is what separates use from superstition.',
      },
      {
        kind: 'scenario',
        id: 'm8l2b4',
        skill: 'strategy',
        situation:
          'You notice RSI "worked" on the last three reversals you scrolled past on the chart. You feel ready to trade it live tomorrow. What is the professional move?',
        options: [
          {
            text: 'Define an objective RSI rule, then backtest it across dozens of setups including the ones that failed',
            quality: 'best',
            explain: 'Scrolled hindsight finds only the survivors. A rule plus a fair sample finds the truth.',
          },
          { text: 'Trade it live — three for three is proof', quality: 'poor', explain: 'Three hand-picked examples is marketing, not evidence.' },
          { text: 'Add two more indicators to confirm it first', quality: 'poor', explain: 'Stacking untested indicators multiplies assumptions, not evidence.' },
        ],
      },
    ],
  },
  {
    id: 'm8l3',
    moduleId: 'm8',
    title: 'ATR and Volatility',
    objective: 'Use volatility to size stops that respect how much the market actually moves.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm8l3b1',
        skill: 'risk',
        title: 'How far does this market breathe?',
        body:
          'ATR (Average True Range) measures the average size of recent candles, including gaps. If EUR/USD H1 has an ATR of 12 pips, a typical hour moves about 12 pips. This has a very practical use: a 5-pip stop in a market that breathes 12 pips per hour is not a stop — it is a donation. Volatility-aware stops sit beyond the market’s normal noise.',
        example:
          'ATR(14) on your chart reads 20 pips. Your setup’s stop is 8 pips away. Normal wiggles alone will hit it — the trade idea never gets a chance to play out.',
      },
      {
        kind: 'number',
        id: 'm8l3b2',
        skill: 'math',
        prompt: 'The last four candle ranges are 10, 14, 12 and 16 pips. What is the 4-period average range?',
        answer: 13,
        tolerance: 0.1,
        unit: 'pips',
        explain: '(10 + 14 + 12 + 16) ÷ 4 = 13 pips. ATR is essentially this, with an adjustment for gaps.',
      },
      {
        kind: 'mcq',
        id: 'm8l3b3',
        skill: 'risk',
        prompt: 'ATR doubles from 10 to 20 pips after a news week. You keep the same 15-pip stop and the same lot size. What just happened to your trade quality?',
        options: [
          { text: 'Nothing — the stop distance is unchanged' },
          {
            text: 'Your stop is now inside normal noise, so random wiggles will stop you out far more often',
            explain: 'The market got louder; a fixed stop got relatively tighter.',
          },
          { text: 'The trade got safer because volatility means opportunity' },
        ],
        correctIndex: 1,
        explain:
          'Stops should scale with volatility (and size should scale DOWN to keep money risk constant). That is why ATR-based stops are a common tested approach.',
      },
      {
        kind: 'truefalse',
        id: 'm8l3b4',
        skill: 'risk',
        statement: 'When volatility rises, keeping money risk constant means using a wider stop AND a smaller position.',
        answer: true,
        explain:
          'Wider stop × smaller size = same planned loss. This is position sizing and volatility working together — the core mechanic of professional risk control.',
      },
    ],
  },
  {
    id: 'm8l4',
    moduleId: 'm8',
    title: 'Indicator Hygiene',
    objective: 'Detect redundant indicators and strip a chart back to what earns its place.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm8l4b1',
        skill: 'strategy',
        title: 'Five indicators, one opinion',
        body:
          'RSI, Stochastic and MACD histogram all measure recent momentum from the same closing prices. Stacking them is not "confirmation" — it is the same witness testifying three times. Real confluence combines INDEPENDENT information: structure, a level, volatility, session context. Redundant indicators mostly add lag, clutter and false confidence.',
        mistake:
          '"I enter when RSI, Stochastic and MACD all agree." They almost always agree — they are cousins reading the same data.',
      },
      {
        kind: 'multi',
        id: 'm8l4b2',
        skill: 'strategy',
        prompt: 'Which pairs give genuinely independent information? Select all that apply.',
        options: [
          { text: 'Market structure + ATR (direction + volatility)' },
          { text: 'RSI + Stochastic (momentum + momentum)' },
          { text: 'A support zone + session timing (location + liquidity context)' },
          { text: 'MACD + RSI (momentum + momentum)' },
        ],
        correctIndexes: [0, 2],
        hint: 'Ask: do both inputs come from the same calculation family?',
        explain: 'Direction, location, volatility and timing are different questions. Momentum thrice is one question, asked loudly.',
      },
      {
        kind: 'scenario',
        id: 'm8l4b3',
        skill: 'strategy',
        situation:
          'Your chart has 6 indicators and you have not taken a trade in two weeks because they never all align. What is the strongest fix?',
        options: [
          {
            text: 'Strip to at most one or two indicators that answer different questions, and let structure lead',
            quality: 'best',
            explain: 'Fewer, independent inputs produce decisions. Six overlapping ones produce paralysis.',
          },
          { text: 'Add a seventh indicator that summarises the others', quality: 'poor', explain: 'An average of redundant signals is still redundant.' },
          { text: 'Trade whenever any 4 of 6 agree', quality: 'ok', explain: 'At least it is a rule — but it still stacks correlated inputs. Test it and you will likely find the extra indicators add nothing.' },
        ],
      },
      {
        kind: 'reflection',
        id: 'm8l4b4',
        skill: 'strategy',
        prompt: 'For each indicator you like, write the one question it answers. If two answer the same question, which one goes?',
      },
    ],
  },
];
