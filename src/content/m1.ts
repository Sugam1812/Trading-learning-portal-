import { Lesson, Module } from '@/types/content';

export const M1: Module = {
  id: 'm1',
  order: 1,
  world: 'Candle Valley',
  title: 'Reading Price Charts',
  tagline: 'Candles, timeframes, and what one bar can and cannot tell you.',
  icon: '🕯️',
  skills: ['candles'],
  lessonIds: ['m1l1', 'm1l2', 'm1l3', 'm1l4', 'm1l5'],
  prereq: 'm0',
};

export const M1_LESSONS: Lesson[] = [
  {
    id: 'm1l1',
    moduleId: 'm1',
    title: 'Anatomy of a Candle',
    objective: 'Name the parts of a candlestick and read open, high, low and close.',
    xp: 50,
    blocks: [
      {
        kind: 'concept',
        id: 'm1l1b1',
        skill: 'candles',
        title: 'Four prices in one shape',
        body:
          'Each candle summarises one period of trading with four prices: Open (first trade), High (highest), Low (lowest) and Close (last trade). The thick part is the body — the distance between open and close. The thin lines are wicks — how far price stretched beyond the body before coming back.',
        bullets: [
          'Bullish candle: close above open (price rose during the period).',
          'Bearish candle: close below open (price fell).',
          'Long wicks mean price visited a level but was pushed back.',
        ],
      },
      {
        kind: 'tappart',
        id: 'm1l1b2',
        skill: 'candles',
        prompt: 'Tap the BODY of this bullish candle — the area between open and close.',
        part: 'body',
        bullish: true,
        explain: 'The body shows the net result of the period: where price started versus where it finished.',
      },
      {
        kind: 'tappart',
        id: 'm1l1b3',
        skill: 'candles',
        prompt: 'Now tap the UPPER WICK — the price territory that was explored but rejected.',
        part: 'upperWick',
        bullish: false,
        explain:
          'The upper wick shows how high price traded before sellers pushed it back down. On a bearish candle a long upper wick suggests selling pressure above.',
      },
      {
        kind: 'mcq',
        id: 'm1l1b4',
        skill: 'candles',
        prompt: 'A candle has Open 1.1000, High 1.1030, Low 1.0995, Close 1.1025. Is it bullish or bearish?',
        options: [
          { text: 'Bullish — it closed above its open', explain: 'Close 1.1025 > open 1.1000, so buyers won this period.' },
          { text: 'Bearish — the low is below the open' },
          { text: 'Neutral — highs and lows cancel out' },
        ],
        correctIndex: 0,
        hint: 'Compare only the open and the close.',
        explain: 'Bullish/bearish is decided by close versus open. Wicks describe the journey, the body describes the result.',
      },
      {
        kind: 'number',
        id: 'm1l1b5',
        skill: 'candles',
        prompt: 'Same candle: Open 1.1000, High 1.1030, Low 1.0995, Close 1.1025. How many pips tall is the full range (high to low)?',
        answer: 35,
        unit: 'pips',
        explain: '1.1030 − 1.0995 = 0.0035 = 35 pips. Range measures the whole candle including wicks.',
      },
    ],
  },
  {
    id: 'm1l2',
    moduleId: 'm1',
    title: 'Reading the Story of a Chart',
    objective: 'Read a sequence of candles as a story of buyers versus sellers.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm1l2b1',
        skill: 'candles',
        title: 'Candles in context',
        body:
          'One candle is a sentence; a chart is the story. A big bullish body after a fall can signal buyers stepping in. The same candle in the middle of nowhere means little. Always read candles together with what came before.',
        figure: {
          packId: 'eu-up-1',
          visible: 30,
          caption: 'EUR/USD (synthetic training data): a rising sequence — most bodies close higher.',
        },
      },
      {
        kind: 'truefalse',
        id: 'm1l2b2',
        skill: 'candles',
        statement: 'A single strong bullish candle proves that price will keep rising.',
        answer: false,
        explain:
          'No single candle predicts the future. It only shows what buyers and sellers just did. Probabilities come from context, structure and tested rules.',
      },
      {
        kind: 'nextcandle',
        id: 'm1l2b3',
        skill: 'candles',
        prompt: 'Study this chart. Will the NEXT candle close up or down? Commit before revealing.',
        packId: 'eu-up-1',
        visible: 24,
        explain:
          'In an uptrend more candles close up than down — but any single candle is close to a coin flip. That is why traders think in series of trades, not single predictions.',
      },
      {
        kind: 'mcq',
        id: 'm1l2b4',
        skill: 'candles',
        prompt: 'A candle has a tiny body and very long upper wick after a strong rally. What does it suggest?',
        options: [
          { text: 'Buyers are fully in control' },
          {
            text: 'Price pushed higher but sellers rejected it — the rally may be tiring',
            explain: 'A long upper wick means the highs did not hold.',
          },
          { text: 'The market is closed' },
        ],
        correctIndex: 1,
        explain:
          'Long wicks show rejection. After a rally, upper-wick rejection warns that sellers are active — a warning, not a guarantee.',
      },
    ],
  },
  {
    id: 'm1l3',
    moduleId: 'm1',
    title: 'How a Candle is Built',
    objective: 'Understand how a candle forms live, from open to close.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm1l3b1',
        skill: 'candles',
        title: 'A candle is born, lives and closes',
        body:
          'While a candle is forming, only its open is fixed. The high, low and close keep changing until the period ends. A candle that looks strongly bullish at minute 10 can close bearish at minute 60. This is why many rules wait for the candle to CLOSE.',
        mistake:
          'Acting on a candle pattern before the candle has closed. Half-formed candles change shape constantly.',
      },
      {
        kind: 'order',
        id: 'm1l3b2',
        skill: 'candles',
        prompt: 'Put the life of a 1-hour candle in the correct order.',
        items: [
          'The hour begins: the open price is set',
          'Price moves, stretching the high and low',
          'The hour ends: the close price is fixed',
          'The completed candle joins chart history',
        ],
        explain: 'Only after the close is the candle final. Rules based on closes are objective; mid-candle shapes are not.',
      },
      {
        kind: 'mcq',
        id: 'm1l3b3',
        skill: 'candles',
        prompt: 'Which set of prices makes a BEARISH candle?',
        options: [
          { text: 'Open 1.2000, Close 1.2040' },
          { text: 'Open 1.2000, Close 1.1970', explain: 'Close below open = bearish.' },
          { text: 'Open 1.2000, Close 1.2000' },
        ],
        correctIndex: 1,
        explain: 'Bearish means the close finished below the open. Equal open and close makes a doji — a draw between buyers and sellers.',
      },
      {
        kind: 'truefalse',
        id: 'm1l3b4',
        skill: 'candles',
        statement: 'The high of a candle can be lower than its close.',
        answer: false,
        explain: 'Impossible. The high is the highest traded price of the period, so it is always at or above both open and close.',
      },
    ],
  },
  {
    id: 'm1l4',
    moduleId: 'm1',
    title: 'Timeframes',
    objective: 'Understand how the same market looks different across timeframes.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm1l4b1',
        skill: 'candles',
        title: 'One market, many zoom levels',
        body:
          'A timeframe is how much time each candle covers. A daily (D1) candle summarises a whole day; an M15 candle covers 15 minutes. Higher timeframes show the big picture with less noise. Lower timeframes show detail but flip direction constantly. Neither is "correct" — they answer different questions.',
        bullets: [
          'Higher timeframe (H4, D1): context and direction.',
          'Lower timeframe (M15, H1): timing and entries.',
          'One D1 candle contains 96 M15 candles.',
        ],
      },
      {
        kind: 'number',
        id: 'm1l4b2',
        skill: 'candles',
        prompt: 'How many 15-minute candles fit inside one 4-hour candle?',
        answer: 16,
        hint: '4 hours = 240 minutes.',
        explain: '240 ÷ 15 = 16. A single H4 candle summarises sixteen M15 candles.',
      },
      {
        kind: 'mcq',
        id: 'm1l4b3',
        skill: 'candles',
        prompt: 'The daily chart shows a strong uptrend, but the 5-minute chart just printed three red candles. What is the most sensible reading?',
        options: [
          { text: 'The uptrend is over — the 5-minute chart is the newest information' },
          {
            text: 'Normal noise: tiny pullbacks live inside big trends',
            explain: 'Lower-timeframe wiggles are expected inside higher-timeframe trends.',
          },
          { text: 'The two charts show different markets' },
        ],
        correctIndex: 1,
        explain:
          'Small counter-moves on low timeframes happen constantly inside larger trends. Decide your context timeframe before judging any candle.',
      },
      {
        kind: 'multi',
        id: 'm1l4b4',
        skill: 'candles',
        prompt: 'Which statements about timeframes are true? Select all that apply.',
        options: [
          { text: 'Higher timeframes generally contain less random noise' },
          { text: 'Lower timeframes give more trade opportunities but more false signals' },
          { text: 'There is one officially correct timeframe for trading' },
          { text: 'The same support level can be visible on several timeframes' },
        ],
        correctIndexes: [0, 1, 3],
        explain:
          'No timeframe is officially correct — traders choose based on strategy and lifestyle, then stay consistent.',
      },
    ],
  },
  {
    id: 'm1l5',
    moduleId: 'm1',
    title: 'One Candle Never Speaks Alone',
    objective: 'Prove to yourself that single-candle prediction is close to a coin flip.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm1l5b1',
        skill: 'candles',
        title: 'The humility experiment',
        body:
          'You are about to predict two candles. Most people get about half right — like flipping a coin. That is the point: single candles are nearly random. Skilled trading is not predicting the next candle; it is finding repeatable situations where the odds tilt slightly in your favour over many trades.',
      },
      {
        kind: 'nextcandle',
        id: 'm1l5b2',
        skill: 'candles',
        prompt: 'Prediction 1 of 2: will the next candle close up or down?',
        packId: 'eu-range-1',
        visible: 20,
        explain: 'Inside a range, the next candle is very close to 50/50.',
      },
      {
        kind: 'nextcandle',
        id: 'm1l5b3',
        skill: 'candles',
        prompt: 'Prediction 2 of 2: and this one?',
        packId: 'gu-down-1',
        visible: 25,
        explain: 'In a downtrend the odds tilt slightly bearish — but only slightly. Edges are small; that is why risk control matters.',
      },
      {
        kind: 'scenario',
        id: 'm1l5b4',
        skill: 'psychology',
        situation: 'You predicted 2 candles and got both wrong. How should you react?',
        options: [
          {
            text: 'Accept it: single candles are nearly random, and that is exactly the lesson',
            quality: 'best',
            explain: 'Correct. Good trading is built on many trades with small edges, not single predictions.',
          },
          {
            text: 'Conclude you have no talent for trading',
            quality: 'poor',
            explain: 'Two candles prove nothing about you — sample size matters everywhere in trading.',
          },
          {
            text: 'Keep predicting until you get five in a row, then start trading',
            quality: 'poor',
            explain: 'Five in a row would be luck, not skill. Streaks happen by chance.',
          },
        ],
      },
      {
        kind: 'reflection',
        id: 'm1l5b5',
        skill: 'psychology',
        prompt: 'Write down: what is the difference between predicting one candle and having a tested edge over 100 trades?',
      },
    ],
  },
];
