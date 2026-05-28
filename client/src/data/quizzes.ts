export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Quiz {
  id: string
  moduleId: string
  title: string
  questions: QuizQuestion[]
}

export const quizzes: Quiz[] = [
  {
    id: 'quiz-module-1',
    moduleId: 'module-1',
    title: 'Forex Foundations Quiz',
    questions: [
      {
        id: 'q1',
        question: 'What does it mean when you BUY EUR/USD?',
        options: [
          'You are selling Euros and buying Dollars',
          'You are buying Euros and selling Dollars',
          'You are buying both currencies simultaneously',
          'You are predicting the price will fall',
        ],
        correctIndex: 1,
        explanation: 'When you BUY EUR/USD, you believe the Euro will strengthen against the Dollar. You are buying Euros and simultaneously selling Dollars.',
      },
      {
        id: 'q2',
        question: 'Which trading session has the HIGHEST volume for EUR/USD?',
        options: [
          'Asian session (00:00-08:00 UTC)',
          'London session only (08:00-12:00 UTC)',
          'London/New York overlap (13:00-17:00 UTC)',
          'New York session close (21:00-22:00 UTC)',
        ],
        correctIndex: 2,
        explanation: 'The London/NY overlap (13:00-17:00 UTC) sees the highest trading volume as both major financial centers are active simultaneously, creating the best setups.',
      },
      {
        id: 'q3',
        question: 'On a $10,000 account with 1% risk and a 20-pip stop loss, what is the correct lot size?',
        options: ['0.1 lots', '0.25 lots', '0.5 lots', '1.0 lots'],
        correctIndex: 2,
        explanation: 'Risk Amount = 1% × $10,000 = $100. Lot Size = $100 ÷ (20 pips × $10/pip) = 0.5 lots.',
      },
      {
        id: 'q4',
        question: 'What is a "pip" in EUR/USD?',
        options: [
          'A movement of 0.001 (3rd decimal place)',
          'A movement of 0.0001 (4th decimal place)',
          'A movement of 0.01 (2nd decimal place)',
          'A movement of 1.0 (whole number)',
        ],
        correctIndex: 1,
        explanation: 'For EUR/USD, a pip is 0.0001 or the 4th decimal place. When EUR/USD moves from 1.0850 to 1.0851, that is exactly 1 pip.',
      },
      {
        id: 'q5',
        question: 'What is the pip value for 1 standard lot of EUR/USD?',
        options: ['$1 per pip', '$5 per pip', '$10 per pip', '$100 per pip'],
        correctIndex: 2,
        explanation: '1 standard lot of EUR/USD = 100,000 units. The pip value is approximately $10 per pip.',
      },
    ],
  },
  {
    id: 'quiz-module-2',
    moduleId: 'module-2',
    title: 'Market Structure Quiz',
    questions: [
      {
        id: 'q1',
        question: 'What defines an uptrend in terms of market structure?',
        options: [
          'Lower highs and lower lows',
          'Higher highs and higher lows',
          'Equal highs and equal lows',
          'Volatile price with no clear direction',
        ],
        correctIndex: 1,
        explanation: 'An uptrend is defined by a series of Higher Highs (HH) and Higher Lows (HL). Each new high is higher than the previous, and each pullback finds support higher than the previous pullback.',
      },
      {
        id: 'q2',
        question: 'What happens when previous support is broken?',
        options: [
          'It disappears and has no more relevance',
          'It becomes stronger support',
          'It typically becomes new resistance',
          'Nothing — the level is irrelevant after being broken',
        ],
        correctIndex: 2,
        explanation: 'The Flip Principle: Broken support becomes resistance. Traders who bought at the support level will sell when price returns there to break even, creating selling pressure.',
      },
      {
        id: 'q3',
        question: 'Approximately what percentage of the time is EUR/USD in a ranging market?',
        options: ['20%', '40%', '60%', '70%'],
        correctIndex: 3,
        explanation: 'EUR/USD is in a range approximately 70% of the time. Only 30% of the time does it show a clear trending structure. This is why range trading skills are essential.',
      },
      {
        id: 'q4',
        question: 'What is a "Change of Character" (CHoCH) in market structure?',
        options: [
          'When volume increases suddenly',
          'When price fails to make a new high/low and breaks the opposite swing point',
          'When price breaks through a round number',
          'When a new candlestick pattern forms',
        ],
        correctIndex: 1,
        explanation: 'A CHoCH signals a potential reversal. In an uptrend, it occurs when price fails to make a new HH and instead breaks the previous HL — suggesting sellers may be taking control.',
      },
      {
        id: 'q5',
        question: 'Which is the MOST significant EUR/USD level type?',
        options: ['15-minute chart highs and lows', 'Round psychological numbers (1.0800, 1.0900)', 'Random swing points', '5-pip intervals'],
        correctIndex: 1,
        explanation: 'Round psychological numbers (1.0800, 1.0900, 1.1000) are the most significant because institutional orders, retail stop losses, and options barriers cluster at these levels.',
      },
    ],
  },
  {
    id: 'quiz-module-3',
    moduleId: 'module-3',
    title: 'Candlestick Patterns Quiz',
    questions: [
      {
        id: 'q1',
        question: 'A bearish pin bar at resistance has a long wick pointing:',
        options: ['Downward', 'Upward', 'Both directions equally', 'It has no wick'],
        correctIndex: 1,
        explanation: 'A bearish pin bar at resistance has a long UPPER wick, showing price tried to push higher but was strongly rejected by sellers. This is a signal to sell.',
      },
      {
        id: 'q2',
        question: 'What is the minimum wick-to-body ratio for a valid pin bar?',
        options: ['1:1', '2:1', '3:1', 'Any size works'],
        correctIndex: 1,
        explanation: 'A valid pin bar should have a wick at least 2x the size of the body. Larger ratios (3:1 or more) indicate stronger rejection and higher probability setups.',
      },
      {
        id: 'q3',
        question: 'For an engulfing pattern to be valid, the engulfing candle must:',
        options: [
          'Be the same size as the previous candle',
          'Completely cover the previous candle\'s body',
          'Only partially overlap with the previous candle',
          'Be smaller than the previous candle',
        ],
        correctIndex: 1,
        explanation: 'In a valid engulfing pattern, the new candle\'s body must completely engulf (cover) the previous candle\'s body. The larger the engulfing candle relative to the previous, the stronger the signal.',
      },
      {
        id: 'q4',
        question: 'When should you AVOID trading doji candles?',
        options: [
          'During the London session',
          'At key support/resistance levels',
          'During major news events (NFP, FOMC, ECB)',
          'On H4 timeframe',
        ],
        correctIndex: 2,
        explanation: 'During major news events, doji candles form frequently due to volatility and uncertainty. These are unreliable setups as price can move in either direction explosively after the news.',
      },
      {
        id: 'q5',
        question: 'A Dragonfly Doji is most significant when found at:',
        options: [
          'The top of an uptrend (resistance)',
          'The bottom of a downtrend (support)',
          'In the middle of a trading range',
          'During the Asian session in a range',
        ],
        correctIndex: 1,
        explanation: 'A Dragonfly Doji (long lower wick, no upper wick) at support indicates strong buying rejection of lower prices. This is a powerful bullish reversal signal when context is right.',
      },
    ],
  },
  {
    id: 'quiz-module-4',
    moduleId: 'module-4',
    title: 'Risk Management Quiz',
    questions: [
      {
        id: 'q1',
        question: 'With a $10,000 account and 1% risk rule, what is the MAXIMUM you should lose per trade?',
        options: ['$50', '$100', '$200', '$500'],
        correctIndex: 1,
        explanation: '$10,000 × 1% = $100 maximum risk per trade. This is the 1% rule — the cornerstone of professional risk management.',
      },
      {
        id: 'q2',
        question: 'Where is the BEST place to put your stop loss?',
        options: [
          'At a round number (e.g., exactly at 1.0800)',
          'Beyond the nearest structural level with a small buffer',
          'Exactly 20 pips from entry regardless of structure',
          'As close to entry as possible to minimize loss',
        ],
        correctIndex: 1,
        explanation: 'Stops should be placed beyond structural levels (swing highs/lows) with a 5-10 pip buffer. Round numbers are avoided because stop hunts target these obvious levels.',
      },
      {
        id: 'q3',
        question: 'What is the minimum Risk:Reward ratio you should accept for a trade?',
        options: ['1:0.5', '1:1', '1:1.5', '1:3'],
        correctIndex: 2,
        explanation: 'The minimum acceptable R:R is 1:1.5, though professionals target 1:2 or better. At 1:2, you only need a 33% win rate to be profitable.',
      },
      {
        id: 'q4',
        question: 'Once a stop loss is set, you should:',
        options: [
          'Move it further away if price approaches it',
          'Remove it entirely if you\'re confident in the trade',
          'Never move it further away; only toward entry (tighter) if justified',
          'Double your position size to average down',
        ],
        correctIndex: 2,
        explanation: 'A stop loss should never be moved further away from entry — this is emotional risk management and a sign of a losing trader. It can be moved toward entry (tighter) only to lock in profits.',
      },
      {
        id: 'q5',
        question: 'After 2 consecutive losses in a day, what should a disciplined trader do?',
        options: [
          'Double position size to recover losses',
          'Continue trading with the same strategy',
          'Switch to a different strategy',
          'Stop trading for the rest of the day',
        ],
        correctIndex: 3,
        explanation: 'After 2 consecutive losses, stop trading for the day. This prevents revenge trading and the emotional cascade that leads to account blowups. Protect capital — tomorrow is another day.',
      },
    ],
  },
  {
    id: 'quiz-module-5',
    moduleId: 'module-5',
    title: 'Psychology Quiz',
    questions: [
      {
        id: 'q1',
        question: 'FOMO (Fear of Missing Out) most commonly leads traders to:',
        options: [
          'Wait patiently for better setups',
          'Chase price after a big move has already happened',
          'Use smaller position sizes',
          'Review their trade plan before entering',
        ],
        correctIndex: 1,
        explanation: 'FOMO causes traders to chase price after the opportunity has passed, often entering at the worst possible price and getting caught in a reversal.',
      },
      {
        id: 'q2',
        question: 'Revenge trading refers to:',
        options: [
          'Shorting a stock that was previously in an uptrend',
          'Trading the opposite direction of your previous trade',
          'Taking impulsive trades after a loss to try to recover',
          'Holding a losing position without a stop loss',
        ],
        correctIndex: 2,
        explanation: 'Revenge trading is the emotional impulse to recover losses by taking new trades immediately, often with larger size. It is one of the most destructive behaviors in trading.',
      },
      {
        id: 'q3',
        question: 'A professional trader evaluates their week primarily based on:',
        options: [
          'Total dollar profit or loss',
          'How many pips they made',
          'Rule adherence and process quality',
          'Whether they hit their profit target',
        ],
        correctIndex: 2,
        explanation: 'Professionals judge performance on process, not outcomes. A loss that followed all rules is a good trade. A win that broke the rules is a dangerous precedent.',
      },
    ],
  },
  {
    id: 'quiz-module-6',
    moduleId: 'module-6',
    title: 'Prop Firm Rules Quiz',
    questions: [
      {
        id: 'q1',
        question: 'On a $10,000 FTMO challenge account, what is the typical maximum daily loss?',
        options: ['$100 (1%)', '$200 (2%)', '$500 (5%)', '$1,000 (10%)'],
        correctIndex: 2,
        explanation: 'FTMO\'s standard daily loss limit is 5% of the account balance. On a $10,000 account, this means you cannot lose more than $500 in any single trading day.',
      },
      {
        id: 'q2',
        question: 'The overall maximum drawdown on a standard prop firm challenge is typically:',
        options: ['5% of starting balance', '10% of starting balance', '15% of starting balance', '20% of starting balance'],
        correctIndex: 1,
        explanation: 'Most prop firms including FTMO set a 10% maximum drawdown limit. If your account equity drops 10% below the starting balance, the account is failed.',
      },
      {
        id: 'q3',
        question: 'Which event should you AVOID trading EUR/USD around?',
        options: [
          'Minor economic reports (housing data)',
          'Non-Farm Payrolls (NFP) release',
          'Standard market open times',
          'When spreads are low',
        ],
        correctIndex: 1,
        explanation: 'NFP (Non-Farm Payrolls) releases cause extreme EUR/USD volatility — often 50-150 pip moves in seconds. This unpredictability can wipe out multiple trades and violate daily loss limits.',
      },
      {
        id: 'q4',
        question: 'What is the BEST strategy when you\'re down 3% during a prop firm challenge?',
        options: [
          'Increase position size to recover quickly',
          'Stop trading for the week',
          'Reduce risk to 0.25-0.5% and trade conservatively',
          'Switch to a completely different strategy',
        ],
        correctIndex: 2,
        explanation: 'When down significantly in a challenge, drop risk dramatically. You only have 2% of daily loss room left. Protect the remaining capital with tiny position sizes until you can rebuild confidence.',
      },
    ],
  },
]
