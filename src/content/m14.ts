import { Lesson, Module } from '@/types/content';

export const M14: Module = {
  id: 'm14',
  order: 14,
  world: 'Professional Desk',
  title: 'Capstone: Your Trading Plan',
  tagline: 'Assemble everything into one written plan — and earn your academy rank.',
  icon: '🎓',
  skills: ['strategy', 'risk', 'psychology'],
  lessonIds: ['m14l1', 'm14l2', 'm14l3'],
  prereq: 'm13',
};

export const M14_LESSONS: Lesson[] = [
  {
    id: 'm14l1',
    moduleId: 'm14',
    title: 'Anatomy of a Trading Plan',
    objective: 'Know every section a complete plan must contain — and why each exists.',
    xp: 70,
    blocks: [
      {
        kind: 'concept',
        id: 'm14l1b1',
        skill: 'strategy',
        title: 'The document that trades when you cannot think',
        body:
          'A trading plan is the calm version of you, written down for the stressed version of you. It contains: markets and timeframes; your trading window; exact setup definitions; risk rules (per trade, daily stop, weekly stop, correlation cap); a news rule; management rules; a journal routine; testing requirements before any change; conditions for increasing size; and — most neglected — conditions for STOPPING. If a section is missing, that decision will be made live, under stress, by the worst version of you.',
        bullets: [
          'Everything you built here feeds it: strategy card, risk rules, session window, news rule, psychology protocols.',
          'A plan is judged by whether a stranger could follow it, and whether YOU do.',
          'Plans change only by scheduled review — never mid-trade.',
        ],
      },
      {
        kind: 'multi',
        id: 'm14l1b2',
        skill: 'strategy',
        prompt: 'Which sections belong in a complete trading plan? Select all that apply.',
        options: [
          { text: 'Exact setup definitions with invalidation' },
          { text: 'Daily and weekly loss limits' },
          { text: 'A monthly profit target the market must provide' },
          { text: 'Conditions for stopping and for increasing size' },
        ],
        correctIndexes: [0, 1, 3],
        hint: 'One of these demands something you cannot control.',
        explain:
          'Profit targets on random short horizons force overtrading when the market is quiet. Plans control process — setups, limits, conditions — never outcomes.',
      },
      {
        kind: 'order',
        id: 'm14l1b3',
        skill: 'strategy',
        prompt: 'Order the lifecycle of a healthy trading plan.',
        items: [
          'Write the plan from tested rules',
          'Trade it exactly, journaling every decision',
          'Hold a scheduled weekly review of journal vs plan',
          'Propose changes in writing, with reasons',
          'Test proposed changes before adopting them',
          'Adopt, version, and continue',
        ],
        explain:
          'Versioned, evidence-gated change is what separates a plan from a mood board. You already practice this loop in the Lab’s strategy versions.',
      },
      {
        kind: 'mcq',
        id: 'm14l1b4',
        skill: 'psychology',
        prompt: 'Where does a plan earn its keep the most?',
        options: [
          { text: 'On calm days when everything works' },
          {
            text: 'In the exact moments you want to abandon it — after losses, before news, during boredom',
            explain: 'The plan is a pre-commitment device for predictable weak moments.',
          },
          { text: 'In screenshots for social media' },
        ],
        correctIndex: 1,
        explain:
          'You wrote every rule for a specific failure mode you now know by name: revenge, FOMO, boredom, overconfidence. The plan is their antidote, ready in advance.',
      },
    ],
  },
  {
    id: 'm14l2',
    moduleId: 'm14',
    title: 'Stress-Testing Your Plan',
    objective: 'Attack your own plan with the scenarios that break most traders.',
    xp: 70,
    blocks: [
      {
        kind: 'scenario',
        id: 'm14l2b1',
        skill: 'psychology',
        situation:
          'Week one on the new plan: −3R, all rules followed. A trader friend laughs and shows you their +9R week from an untested "gap strategy". What does your plan-following self do?',
        options: [
          {
            text: 'Nothing changes: one week is noise for both of you, and your review is scheduled, not emotional',
            quality: 'best',
            explain: 'Their sample size is one week too. Envy is not evidence; the review cadence exists precisely for this.',
          },
          { text: 'Adopt the gap strategy this weekend', quality: 'poor', explain: 'Strategy-hopping after one comparative week resets your sample to zero, forever.' },
          { text: 'Run both strategies live simultaneously to hedge your doubt', quality: 'poor', explain: 'Two half-followed plans journal worse than one followed plan. Test the new idea in the Lab if it intrigues you.' },
        ],
      },
      {
        kind: 'scenario',
        id: 'm14l2b2',
        skill: 'risk',
        situation:
          'Month three: the plan is +11R overall and you feel ready to triple your risk per trade "to speed things up". Your plan says size increases only after 100 trades AND a maximum-drawdown review. You have 61 trades. What now?',
        options: [
          {
            text: 'Follow the written condition: keep size, keep collecting the sample',
            quality: 'best',
            explain: 'The condition was written by calm-you to protect against exactly this feeling. 61 good trades have not yet shown you the strategy’s worst drawdown.',
          },
          { text: 'Triple the risk — profits prove readiness', quality: 'poor', explain: 'Overconfidence after a good run is the setup for the oversized drawdown that undoes it all.' },
          { text: 'Compromise: double it quietly', quality: 'poor', explain: 'A negotiated rule is a broken rule with better manners.' },
        ],
      },
      {
        kind: 'scenario',
        id: 'm14l2b3',
        skill: 'psychology',
        situation:
          'A brutal stretch: daily stop hit three days in a row, all valid trades. You notice you are checking charts at midnight and feeling dread before each session. Your plan’s stopping rule covers losses, but says nothing about this. What is the professional move?',
        options: [
          {
            text: 'Invoke a personal circuit breaker — planned days off — and add a wellbeing clause to the plan at review',
            quality: 'best',
            explain: 'Sleep, dread and compulsive checking are risk factors as real as leverage. Professionals manage the trader, not just the trades.',
          },
          { text: 'Push through — discipline means never stopping', quality: 'poor', explain: 'Discipline means following rules, including rest rules. Grinding while degraded is how rule-breaks begin.' },
          { text: 'Trade smaller but every day, no break', quality: 'ok', explain: 'Size relief helps, but the signals here (sleep loss, dread) call for distance, not a discount.' },
        ],
      },
      {
        kind: 'truefalse',
        id: 'm14l2b4',
        skill: 'strategy',
        statement: 'A plan that has survived stress-testing on paper no longer needs journaling in practice.',
        answer: false,
        explain:
          'The journal is how you discover the gap between the plan and your actual behaviour — the gap where all trading results live. Capstone or not, the journal never retires.',
      },
    ],
  },
  {
    id: 'm14l3',
    moduleId: 'm14',
    title: 'Graduation: The Road From Here',
    objective: 'Lock in the full development path and write your own plan.',
    xp: 80,
    blocks: [
      {
        kind: 'concept',
        id: 'm14l3b1',
        skill: 'strategy',
        title: 'What you can now do',
        body:
          'You can read structure, judge levels, size positions so losses are planned, compute expectancy, write objective rules, backtest them honestly, forward-test them patiently, journal truthfully, and name the psychological traps as they appear. That is the complete apparatus of a developing trader. What no course can hand you is the sample size: the hundreds of recorded, rule-following decisions that turn apparatus into skill.',
        bullets: [
          'Next 30 days: one strategy, one pair, one session window, Lab-tested.',
          'Next 90 days: 50+ honest backtest setups, then forward testing with the journal.',
          'Always: risk small, review weekly, change nothing without evidence.',
        ],
        mistake:
          'Treating completion as readiness for size. Completion certifies education — only your own tested sample certifies anything else.',
      },
      {
        kind: 'order',
        id: 'm14l3b2',
        skill: 'strategy',
        prompt: 'Order the trader-development ladder you are now on.',
        items: [
          'Pass the foundations (done: you are here)',
          'Build one objective strategy in the Lab',
          'Backtest 50–100 valid setups honestly',
          'Validate on unseen data',
          'Forward test with a full journal',
          'Only then consider very small live risk — if it is legal and sensible where you live',
        ],
        explain:
          'Each rung is cheap; skipping rungs transfers the cost to a live account. The Lab and Journal tabs are the whole ladder, waiting.',
      },
      {
        kind: 'mcq',
        id: 'm14l3b3',
        skill: 'risk',
        prompt: 'Honest final check: what does finishing this academy guarantee about your future trading results?',
        options: [
          { text: 'Consistent profits within a year' },
          { text: 'Above-average returns' },
          {
            text: 'Nothing — it provides skills and process; markets guarantee no one anything',
            explain: 'The only honest answer, and knowing it is itself a graduation requirement.',
          },
        ],
        correctIndex: 2,
        explain:
          'Education raises the floor of your decisions; it cannot promise the market’s cooperation. Anyone who claims otherwise failed this module.',
      },
      {
        kind: 'reflection',
        id: 'm14l3b4',
        skill: 'strategy',
        prompt:
          'Write your trading plan, section by section: market, timeframe, window, setup, entry, stop, target, risk %, daily/weekly stops, news rule, journal routine, review day, size-increase condition, stopping condition. This is your graduation document — save it, and revisit it at every weekly review.',
      },
    ],
  },
];
