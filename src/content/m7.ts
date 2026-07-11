import { Lesson, Module } from '@/types/content';

export const M7: Module = {
  id: 'm7',
  order: 7,
  world: 'Backtest Laboratory',
  title: 'Strategy & Backtesting',
  tagline: 'Objective rules, honest testing, and the road from idea to evidence.',
  icon: '🔬',
  skills: ['strategy', 'backtesting'],
  lessonIds: ['m7l1', 'm7l2', 'm7l3', 'm7l4'],
  prereq: 'm4',
};

export const M7_LESSONS: Lesson[] = [
  {
    id: 'm7l1',
    moduleId: 'm7',
    title: 'Objective Rules',
    objective: 'Write trading rules so precise that two strangers would take identical trades.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm7l1b1',
        skill: 'strategy',
        title: 'The stranger test',
        body:
          'A rule is objective if a stranger, given only your written words and the same chart, would make the same decision as you. "Buy when the trend is strong" fails the test. "Buy when the H4 chart shows two consecutive higher highs and price pulls back to the most recent higher low" passes. Objective rules are the ONLY rules that can be backtested.',
        mistake:
          '"I will know it when I see it." That is not a strategy — it is a mood, and moods cannot be tested or improved.',
      },
      {
        kind: 'multi',
        id: 'm7l1b2',
        skill: 'strategy',
        prompt: 'Which rules pass the stranger test? Select all that apply.',
        options: [
          { text: '"Enter long when a 15m candle closes above the previous candle high"' },
          { text: '"Enter when momentum looks strong"' },
          { text: '"Stop-loss 1 pip below the most recent swing low (3 candles each side)"' },
          { text: '"Exit when the trade feels wrong"' },
        ],
        correctIndexes: [0, 2],
        hint: 'Could a stranger execute it identically with no questions?',
        explain: '"Looks strong" and "feels wrong" are moods. Candle closes and defined swing lows are measurable facts.',
      },
      {
        kind: 'mcq',
        id: 'm7l1b3',
        skill: 'strategy',
        prompt: 'Why do vague rules quietly destroy learning, even in demo trading?',
        options: [
          { text: 'They make trades illegal' },
          {
            text: 'Every trade becomes a different experiment, so results can never accumulate into evidence',
            explain: '100 trades under changing rules = 100 samples of nothing.',
          },
          { text: 'Vague rules are fine as long as you win' },
        ],
        correctIndex: 1,
        explain:
          'Improvement requires comparing results of the SAME behaviour over time. Vague rules make the behaviour different every time.',
      },
      {
        kind: 'scenario',
        id: 'm7l1b4',
        skill: 'strategy',
        situation:
          'Your friend shares a "secret institutional strategy" from a video: "Enter at the order block when liquidity is engineered." You cannot tell exactly when its conditions are true. What is the professional move?',
        options: [
          {
            text: 'Translate it into measurable conditions first — if it cannot be defined, it cannot be tested or trusted',
            quality: 'best',
            explain: 'Impressive vocabulary is not evidence. Define it, test it, then judge it.',
          },
          { text: 'Trade it live — institutions know best', quality: 'poor', explain: 'A label like "institutional" is marketing, not a tested edge.' },
          { text: 'Reject all concepts that come from videos', quality: 'ok', explain: 'Healthy skepticism, but ideas from anywhere can be valid once defined and tested. Test, don’t just dismiss.' },
        ],
      },
    ],
  },
  {
    id: 'm7l2',
    moduleId: 'm7',
    title: 'What Backtesting Really Is',
    objective: 'Learn the honest backtesting workflow before touching the replay tool.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm7l2b1',
        skill: 'backtesting',
        title: 'Rehearsing the past, honestly',
        body:
          'Backtesting replays history one candle at a time and applies your rules exactly, WITHOUT seeing the future. Done honestly, it answers: did this rule set have an edge in this data? Done dishonestly — skipping losers, peeking ahead, changing rules mid-test — it produces confident nonsense.',
        bullets: [
          'Record EVERY valid setup, especially the losers.',
          'Decide entries using only candles visible at that moment.',
          'Change nothing mid-test; note ideas for the NEXT test.',
        ],
      },
      {
        kind: 'order',
        id: 'm7l2b2',
        skill: 'backtesting',
        prompt: 'Arrange the honest backtesting workflow.',
        items: [
          'Write the rules precisely before seeing results',
          'Replay candles and record every valid setup',
          'Log each result in R with the reason',
          'Compute metrics: win rate, expectancy, drawdown',
          'Judge sample size before judging the strategy',
          'Test the surviving idea on unseen data',
        ],
        explain: 'Rules first, evidence second, judgement last. Reversing the order produces curve-fit fantasies.',
      },
      {
        kind: 'truefalse',
        id: 'm7l2b3',
        skill: 'backtesting',
        statement: 'Using knowledge of candles that come AFTER your entry point to decide the entry is called look-ahead bias.',
        answer: true,
        explain:
          'Look-ahead bias is the deadliest testing error — the live market will never show you the future, so results built on it are fiction. The Lab hides future candles for exactly this reason.',
      },
      {
        kind: 'mcq',
        id: 'm7l2b4',
        skill: 'backtesting',
        prompt: 'Your new strategy won 7 of its first 10 backtest trades. What can you conclude?',
        options: [
          { text: 'It has a 70% win rate' },
          { text: 'It is ready for live money' },
          {
            text: 'Almost nothing yet — the sample is far too small',
            explain: 'Ten trades is variance territory. Keep testing.',
          },
        ],
        correctIndex: 2,
        hint: 'Would 7 heads in 10 coin flips convince you the coin is biased?',
        explain:
          'Small samples routinely produce impressive streaks by pure chance. Aim for 50–100+ trades before trusting any statistic.',
      },
    ],
  },
  {
    id: 'm7l3',
    moduleId: 'm7',
    title: 'The Ways Tests Lie',
    objective: 'Spot overfitting, cherry-picking and other silent test-killers.',
    xp: 65,
    blocks: [
      {
        kind: 'concept',
        id: 'm7l3b1',
        skill: 'backtesting',
        title: 'How to fool yourself with data',
        body:
          'Overfitting (curve fitting) means tuning rules until they perfectly match the PAST — and only the past. Add enough conditions and any random data can be "beaten". Cherry-picking means quietly skipping setups that lost. Both produce beautiful backtests that collapse on new data. The cure: fewer rules, every setup counted, and a final test on data the rules have never seen.',
        example:
          'A strategy tuned to "enter at 09:47 on Tuesdays when RSI is 61.3" earned +80R on last year’s data — and lost steadily this year. It had memorised history, not learned a pattern.',
        mistake: 'Adding one more filter every time the backtest shows losses. Each filter fits the noise more tightly.',
      },
      {
        kind: 'multi',
        id: 'm7l3b2',
        skill: 'backtesting',
        prompt: 'Which habits protect a test from lying to you? Select all that apply.',
        options: [
          { text: 'Recording every valid setup, including all losers' },
          { text: 'Keeping the rule count small and simple' },
          { text: 'Re-tuning parameters until last year looks perfect' },
          { text: 'Validating on unseen (out-of-sample) data' },
        ],
        correctIndexes: [0, 1, 3],
        explain: 'Perfect-looking history is a warning sign, not an achievement.',
      },
      {
        kind: 'scenario',
        id: 'm7l3b3',
        skill: 'backtesting',
        situation:
          'During a 50-trade backtest, trade #23 is a valid setup but you can already see it heading into strong resistance. You are tempted to skip it "because you would obviously not take it live". What do you do?',
        options: [
          {
            text: 'Record it — if "obvious resistance" matters, it must become a written rule tested from trade #1',
            quality: 'best',
            explain: 'Untested exceptions are cherry-picking. Either the filter is a rule for the whole test, or it does not exist.',
          },
          { text: 'Skip it silently — common sense is allowed', quality: 'poor', explain: 'Every skipped loser inflates the results. That is exactly how fake edges are manufactured.' },
          { text: 'Skip it but round the final win rate down to be safe', quality: 'poor', explain: 'You cannot un-bias data by guessing a correction afterwards.' },
        ],
      },
      {
        kind: 'truefalse',
        id: 'm7l3b4',
        skill: 'backtesting',
        statement: 'A strategy that performed well on historical data is guaranteed to perform well in the future.',
        answer: false,
        explain:
          'Markets change regimes, and any backtest may partly fit noise. History filters out bad ideas; it cannot certify good ones. That is why forward testing comes next.',
      },
    ],
  },
  {
    id: 'm7l4',
    moduleId: 'm7',
    title: 'From Backtest to Forward Test',
    objective: 'Graduate a strategy from history to real-time practice, step by disciplined step.',
    xp: 65,
    blocks: [
      {
        kind: 'concept',
        id: 'm7l4b1',
        skill: 'backtesting',
        title: 'The graduation ladder',
        body:
          'Backtesting proves the rules had an edge in history. Forward testing proves YOU can execute them in real time — with spreads, slippage, waiting, and emotions. The ladder: backtest ≥50 setups → forward test on replay/demo for weeks → only then consider very small live risk. Each step must be passed, not skipped.',
        bullets: [
          'Backtest answers: do the rules work on this data?',
          'Forward test answers: can I follow them live, at real speed?',
          'One good week proves nothing — insist on a real sample.',
        ],
      },
      {
        kind: 'order',
        id: 'm7l4b2',
        skill: 'backtesting',
        prompt: 'Order the graduation ladder correctly.',
        items: [
          'Write objective rules',
          'Backtest at least 50 valid setups honestly',
          'Analyze metrics and reject or refine ONCE',
          'Validate on unseen data',
          'Forward test in real time with a journal',
          'Consider very small live risk only after all steps pass',
        ],
        explain: 'Every rung filters out weaker ideas cheaply. Skipping rungs moves the cost to your live account.',
      },
      {
        kind: 'scenario',
        id: 'm7l4b3',
        skill: 'backtesting',
        situation:
          'Your backtest shows +0.3R expectancy over 60 trades. Your first forward-test week loses 4R while following every rule. What is the correct reading?',
        options: [
          {
            text: 'Within normal variance — continue the forward test to a proper sample',
            quality: 'best',
            explain: 'A -4R week happens routinely to positive-expectancy systems. Judge at 30–50 forward trades, not 5.',
          },
          { text: 'The backtest was fake; abandon everything', quality: 'poor', explain: 'One week cannot overturn 60 trades of evidence — unless you also mistrust the process that produced them.' },
          { text: 'Double the risk to recover the 4R faster', quality: 'poor', explain: 'Increasing risk during a drawdown is how survivable dips become fatal ones.' },
        ],
      },
      {
        kind: 'reflection',
        id: 'm7l4b4',
        skill: 'backtesting',
        prompt:
          'Your next step: open the Lab, pick a chart pack you have not seen, and run a 20-trade honest backtest of one simple rule. Write here which rule you will test.',
      },
    ],
  },
];
