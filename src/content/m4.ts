import { Lesson, Module } from '@/types/content';

export const M4: Module = {
  id: 'm4',
  order: 4,
  world: 'Risk Fortress',
  title: 'Risk Management',
  tagline: 'Position sizing, reward-to-risk, expectancy — the skills that keep accounts alive.',
  icon: '🛡️',
  skills: ['risk', 'math'],
  lessonIds: ['m4l1', 'm4l2', 'm4l3', 'm4l4', 'm4l5'],
  prereq: 'm1',
};

export const M4_LESSONS: Lesson[] = [
  {
    id: 'm4l1',
    moduleId: 'm4',
    title: 'Understanding Reward-to-Risk Ratio',
    objective: 'Compare how much you plan to gain with how much you are prepared to lose.',
    xp: 70,
    blocks: [
      {
        kind: 'concept',
        id: 'm4l1b1',
        skill: 'risk',
        title: 'Risking 20 to make 40',
        body:
          'If your stop-loss is 20 pips away and your target is 40 pips away, you are risking 20 pips to potentially make 40. This is a 1:2 reward-to-risk ratio — for every unit risked, you aim to make two. The ratio is decided BEFORE the trade, from your planned levels, not after.',
        bullets: [
          'Risk = distance from entry to stop-loss.',
          'Reward = distance from entry to target.',
          'Ratio = reward ÷ risk. 20 pips risk, 40 pips target → 1:2.',
        ],
        example: 'Entry 1.1000, stop 1.0980 (20 pips), target 1.1040 (40 pips) → reward-to-risk 1:2.',
      },
      {
        kind: 'rrbuilder',
        id: 'm4l1b2',
        skill: 'risk',
        prompt:
          'Your entry is 1.1000 (long). Move the stop and target until the trade offers AT LEAST 1:2 — then lock your levels.',
        direction: 'long',
        entry: 1.1,
        pipSize: 0.0001,
        initialStopPips: 30,
        initialTargetPips: 30,
        requiredRatio: 2,
        explain:
          'Notice the trade-offs: a tighter stop boosts the ratio but is easier to hit; a farther target boosts the ratio but is reached less often. The ratio is a lever, not a free lunch.',
      },
      {
        kind: 'number',
        id: 'm4l1b3',
        skill: 'math',
        prompt: 'Risk is $10 and the planned reward is $25. What is the reward-to-risk ratio? (Enter the reward side, e.g. 2 for 1:2.)',
        answer: 2.5,
        tolerance: 0.01,
        hint: 'Divide reward by risk.',
        explain: '$25 ÷ $10 = 2.5, so the trade is 1:2.5.',
      },
      {
        kind: 'concept',
        id: 'm4l1b4',
        skill: 'risk',
        title: 'The ratio alone is not an edge',
        body:
          'A high reward-to-risk ratio does not automatically make a strategy profitable. The target must be realistic, and price must actually reach it often enough. A 1:10 setup that almost never hits its target loses money beautifully.',
        mistake:
          'Stretching the target to force a better ratio. The chart decides where sensible targets are — not your wish for a prettier number.',
      },
      {
        kind: 'chartchoice',
        id: 'm4l1b5',
        skill: 'risk',
        prompt:
          'Uptrend pullback. Three plans for a long at the zone:\nA) Stop 60 pips below, target 30 pips above (1:0.5)\nB) Stop 20 pips below the swing low, target 40 pips at the prior high (1:2)\nC) No stop, "mental exit", target 100 pips (1:∞?)\nWhich plan is acceptable?',
        packId: 'eu-rr-1',
        visible: 24,
        options: [
          { text: 'Plan A' },
          { text: 'Plan B', explain: 'Clear invalidation, realistic target at a real reference, ratio ≥ 1:2.' },
          { text: 'Plan C' },
        ],
        correctIndex: 1,
        hint: 'A valid plan needs a real stop, a realistic target, and an acceptable ratio.',
        explain:
          'Plan A risks more than it can win. Plan C has no defined risk at all — "mental stops" fail exactly when it matters. Plan B is the only complete plan.',
      },
      {
        kind: 'reflection',
        id: 'm4l1b6',
        skill: 'risk',
        prompt:
          'Would you prefer a strategy that wins 70% but loses 3× more on each loss, or one that wins 45% and earns 2× what it risks? Write your reasoning — the expectancy lesson will give you the tool to answer precisely.',
      },
    ],
  },
  {
    id: 'm4l2',
    moduleId: 'm4',
    title: 'Position Sizing',
    objective: 'Size every trade so a loss costs exactly what you planned — never more.',
    xp: 65,
    blocks: [
      {
        kind: 'concept',
        id: 'm4l2b1',
        skill: 'risk',
        title: 'Size is the output, not the input',
        body:
          'Amateurs pick a size and hope. Professionals pick a risk amount and CALCULATE the size. The formula: risk amount ÷ (stop distance in pips × pip value per lot) = lots. The stop distance comes from the chart; the risk amount comes from your rules.',
        example:
          'Account $1,000, risk 1% → $10 maximum planned loss. Stop is 20 pips away. Pip value per standard lot ≈ $10. Size = 10 ÷ (20 × 10) = 0.05 lots. Now a stop-out costs $10, exactly as planned.',
      },
      {
        kind: 'number',
        id: 'm4l2b2',
        skill: 'risk',
        prompt: 'Account $1,000. Risk 1% ($10). Stop 20 pips. Pip value $10 per lot. What position size in lots keeps the planned loss at $10?',
        answer: 0.05,
        tolerance: 0.001,
        unit: 'lots',
        hint: 'lots = 10 ÷ (20 × 10)',
        explain: '$10 ÷ (20 pips × $10/pip) = 0.05 lots. The position-size calculator in the Lab does this instantly.',
      },
      {
        kind: 'number',
        id: 'm4l2b3',
        skill: 'risk',
        prompt: 'Same account, same 1% risk — but this setup needs a 50-pip stop. What size now?',
        answer: 0.02,
        tolerance: 0.001,
        unit: 'lots',
        hint: 'A wider stop forces a smaller size.',
        explain:
          '$10 ÷ (50 × $10) = 0.02 lots. Wider stop → smaller size, same money at risk. Risk stays constant; size breathes with the chart.',
      },
      {
        kind: 'mcq',
        id: 'm4l2b4',
        skill: 'risk',
        prompt: 'Your setup requires a 100-pip stop, and the calculated size feels "too small to bother". What is the professional response?',
        options: [
          { text: 'Increase the size anyway — small positions are a waste of time' },
          {
            text: 'Trade the calculated size or skip the trade; the risk limit is not negotiable',
            explain: 'The 1% rule only protects you if it survives feelings.',
          },
          { text: 'Move the stop closer so the size can be bigger' },
        ],
        correctIndex: 1,
        explain:
          'Moving a stop to fit a desired size puts the stop where the chart does NOT support it — the worst of both worlds. Size serves risk, never the reverse.',
      },
      {
        kind: 'truefalse',
        id: 'm4l2b5',
        skill: 'risk',
        statement: 'Risking a fixed 1% per trade means every losing trade costs the same fraction of your account, whatever the stop distance.',
        answer: true,
        explain:
          'That is the whole point of position sizing: the stop distance changes trade to trade, the money at risk does not.',
      },
    ],
  },
  {
    id: 'm4l3',
    moduleId: 'm4',
    title: 'Drawdown and Losing Streaks',
    objective: 'Expect losing streaks, survive them, and understand why recovery is asymmetric.',
    xp: 65,
    blocks: [
      {
        kind: 'concept',
        id: 'm4l3b1',
        skill: 'risk',
        title: 'Losing streaks are mathematics, not failure',
        body:
          'Even a good strategy with a 50% win rate will hit 5+ losses in a row surprisingly often over 100 trades. Drawdown is the drop from your account’s peak. The deeper the hole, the disproportionately harder the climb out: -10% needs +11% to recover, but -50% needs +100%.',
        bullets: [
          'Streaks of losses are normal for every strategy.',
          'Risking 1% per trade, a 6-loss streak costs about 6% — annoying.',
          'Risking 10% per trade, the same streak costs nearly half the account — devastating.',
        ],
      },
      {
        kind: 'number',
        id: 'm4l3b2',
        skill: 'math',
        prompt: 'You risk 2% per trade and lose 5 trades in a row. Roughly what percent of your account is gone? (Ignore compounding.)',
        answer: 10,
        tolerance: 0.5,
        unit: '%',
        explain: '5 × 2% ≈ 10%. Now imagine the same streak at 10% risk per trade — that is why risk caps exist.',
      },
      {
        kind: 'mcq',
        id: 'm4l3b3',
        skill: 'math',
        prompt: 'An account falls 50%. What gain is needed just to get back to break-even?',
        options: [
          { text: '50%' },
          { text: '75%' },
          { text: '100%', explain: 'From half the money you must double it.' },
        ],
        correctIndex: 2,
        hint: 'From $1,000 to $500… and back.',
        explain: 'Losses and gains are asymmetric. This is why protecting the downside is the first job of a trader.',
      },
      {
        kind: 'scenario',
        id: 'm4l3b4',
        skill: 'psychology',
        situation: 'You are down 4 trades today, all valid setups that followed your rules. You feel the urge to double the size on the next trade to "win it back". What do you do?',
        options: [
          {
            text: 'Stop for the day if your daily loss limit is hit; otherwise keep the normal size',
            quality: 'best',
            explain: 'Rules made in calm moments exist to protect you in exactly this moment.',
          },
          { text: 'Double the size — you are "due" a winner', quality: 'poor', explain: 'The market owes you nothing. This is the gambler’s fallacy plus revenge trading — the classic account killer.' },
          { text: 'Switch to a new strategy you saw online yesterday', quality: 'poor', explain: 'Strategy-hopping mid-drawdown replaces a tested edge with an untested one at the worst time.' },
        ],
      },
    ],
  },
  {
    id: 'm4l4',
    moduleId: 'm4',
    title: 'Expectancy: the Only Score that Matters',
    objective: 'Combine win rate, average win and average loss into expected value per trade.',
    xp: 70,
    blocks: [
      {
        kind: 'concept',
        id: 'm4l4b1',
        skill: 'math',
        title: 'Win rate lies when it stands alone',
        body:
          'Expectancy is the average R you make per trade over many trades: (win rate × average win) − (loss rate × average loss). A 40% win rate sounds bad — until you learn the wins are 2R and losses 1R. Then every trade is worth +0.2R on average.',
        example: 'Strategy A: wins 40%, average winner 2R, average loser 1R.\nExpectancy = (0.40 × 2R) − (0.60 × 1R) = +0.20R per trade. Over 100 trades ≈ +20R.',
      },
      {
        kind: 'number',
        id: 'm4l4b2',
        skill: 'math',
        prompt: 'A strategy wins 50% of the time. Winners average 1.5R, losers 1R. What is the expectancy in R per trade?',
        answer: 0.25,
        tolerance: 0.01,
        unit: 'R',
        hint: '(0.5 × 1.5) − (0.5 × 1)',
        explain: '0.75 − 0.5 = +0.25R per trade. Positive expectancy plus discipline plus sample size is the whole game.',
      },
      {
        kind: 'number',
        id: 'm4l4b3',
        skill: 'math',
        prompt: 'Trading 1:2 reward-to-risk, what break-even win rate do you need? (Percent, e.g. 40)',
        answer: 33.3,
        tolerance: 0.5,
        unit: '%',
        hint: 'Break-even win rate = 1 ÷ (1 + RR).',
        explain: '1 ÷ (1 + 2) = 33.3%. Win more than a third of 1:2 trades and the math is on your side — before costs.',
      },
      {
        kind: 'mcq',
        id: 'm4l4b4',
        skill: 'math',
        prompt: 'Strategy X: 70% win rate, wins 1R, losses 3R. Strategy Y: 45% win rate, wins 2R, losses 1R. Which has positive expectancy?',
        options: [
          { text: 'X — a 70% win rate must be better' },
          {
            text: 'Y — X actually loses money despite winning more often',
            explain: 'X: 0.7×1 − 0.3×3 = −0.2R. Y: 0.45×2 − 0.55×1 = +0.35R.',
          },
          { text: 'Both are profitable' },
        ],
        correctIndex: 1,
        hint: 'Run both through the expectancy formula.',
        explain:
          'X loses 0.2R per trade on average — the big losses silently eat the frequent small wins. This is the exact trap behind "it wins almost every time" systems.',
      },
      {
        kind: 'truefalse',
        id: 'm4l4b5',
        skill: 'math',
        statement: 'Ten trades is enough to know your strategy’s true expectancy.',
        answer: false,
        explain:
          'Ten trades is noise. Variance dominates small samples: a coin can easily land 7 heads in 10 flips. You need dozens to hundreds of trades before expectancy estimates mean anything.',
      },
    ],
  },
  {
    id: 'm4l5',
    moduleId: 'm4',
    title: 'Survival Rules',
    objective: 'Build the personal risk rules that make ruin nearly impossible.',
    xp: 65,
    blocks: [
      {
        kind: 'concept',
        id: 'm4l5b1',
        skill: 'risk',
        title: 'Rules that keep you in the game',
        body:
          'Risk of ruin is the chance of losing so much you must stop. It explodes with risk per trade. The defence is a small set of hard rules, written before trading: fixed risk per trade, a daily stop, a weekly stop, and a rule against increasing size after losses.',
        bullets: [
          'Risk per trade: commonly 0.5%–1% while learning.',
          'Daily loss limit: e.g. stop after −2% or 3 losses.',
          'Never increase size to recover losses.',
          'Correlated trades (EUR/USD + GBP/USD long) count as one bigger risk.',
        ],
        mistake: 'Treating rules as suggestions. A rule you break under stress is not a rule — it is a decoration.',
      },
      {
        kind: 'multi',
        id: 'm4l5b2',
        skill: 'risk',
        prompt: 'Which rules genuinely reduce your risk of ruin? Select all that apply.',
        options: [
          { text: 'Fixed fractional risk per trade (e.g. 1%)' },
          { text: 'A hard daily loss limit' },
          { text: 'Doubling size after each loss to recover faster' },
          { text: 'Counting correlated positions as combined risk' },
        ],
        correctIndexes: [0, 1, 3],
        explain:
          'Doubling after losses (martingale) is the fastest known route TO ruin — it guarantees that a normal streak eventually meets an oversized bet.',
      },
      {
        kind: 'scenario',
        id: 'm4l5b3',
        skill: 'risk',
        situation:
          'Monday: −1%. Tuesday: −1.5%. Your weekly stop is −4%. Wednesday morning offers a beautiful A+ setup. You take it and lose: −1.2%. Another decent setup appears an hour later. What now?',
        options: [
          {
            text: 'Stop trading — the weekly limit is one loss away, and protecting it is the job',
            quality: 'best',
            explain: 'You are at −3.7%. One normal loss breaches the weekly stop. Standing down IS the winning move this week.',
          },
          { text: 'Take it with half size to stay "involved"', quality: 'ok', explain: 'Better than full size, but limits work because they are binary. Half-breaking a rule is still breaking it.' },
          { text: 'Take it with normal size — it is a good setup after all', quality: 'poor', explain: 'Good setups appear every week. Blown weekly limits compound into blown accounts.' },
        ],
      },
      {
        kind: 'reflection',
        id: 'm4l5b4',
        skill: 'risk',
        prompt: 'Write your three personal survival rules: risk per trade, daily stop, and what you will do when the daily stop is hit.',
      },
    ],
  },
];
