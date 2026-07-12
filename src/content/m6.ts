import { Lesson, Module } from '@/types/content';

export const M6: Module = {
  id: 'm6',
  order: 6,
  world: 'Psychology Summit',
  title: 'Trading Psychology',
  tagline: 'FOMO, revenge, biases — and the process mindset that defeats them.',
  icon: '🧠',
  skills: ['psychology'],
  lessonIds: ['m6l1', 'm6l2', 'm6l3'],
  prereq: 'm4',
};

export const M6_LESSONS: Lesson[] = [
  {
    id: 'm6l1',
    moduleId: 'm6',
    title: 'Your Brain on Trading',
    objective: 'Recognise FOMO, revenge trading and overconfidence in the moment they appear.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm6l1b1',
        skill: 'psychology',
        title: 'The three classic hijacks',
        body:
          'FOMO (fear of missing out) makes you chase moves that already happened. Revenge trading makes you attack the market to win back a loss. Overconfidence after a winning streak makes you oversize exactly when you feel invincible. All three replace your tested rules with emotions — and all three feel completely justified in the moment.',
        bullets: [
          'FOMO says: "It is running without me!" — chase.',
          'Revenge says: "The market owes me." — oversize.',
          'Overconfidence says: "I have figured it out." — abandon rules.',
        ],
      },
      {
        kind: 'scenario',
        id: 'm6l1b2',
        skill: 'psychology',
        situation:
          'You have lost three trades in a row, but all three followed your tested rules. What should you do?',
        options: [
          {
            text: 'Nothing special — keep following the rules; streaks are normal variance',
            quality: 'best',
            explain:
              'A tested process is judged over dozens of trades, not three. Changing rules after every streak means never having rules at all.',
          },
          {
            text: 'Increase the size on the next trade to recover the losses quickly',
            quality: 'poor',
            explain: 'Revenge trading: the fastest way to turn a normal streak into serious damage.',
          },
          {
            text: 'Abandon the strategy — three losses proves it stopped working',
            quality: 'poor',
            explain: 'Three trades prove nothing. Every profitable strategy in history has had far longer losing streaks.',
          },
          {
            text: 'Take a short break, then continue with normal size if your daily limit allows',
            quality: 'ok',
            explain: 'A pause is healthy — as long as the return to trading follows the same rules, not a "recovery" mindset.',
          },
        ],
      },
      {
        kind: 'mcq',
        id: 'm6l1b3',
        skill: 'psychology',
        prompt: 'Which feeling is the most reliable signal that you are about to break your rules?',
        options: [
          { text: 'Calm boredom' },
          { text: 'Urgency — "I must act RIGHT NOW or miss it"', explain: 'Urgency collapses thinking. Real setups survive a two-minute checklist.' },
          { text: 'Mild curiosity' },
        ],
        correctIndex: 1,
        explain:
          'Markets reopen tomorrow. Almost nothing in trading genuinely requires instant action — urgency is usually emotion wearing a disguise.',
      },
      {
        kind: 'truefalse',
        id: 'm6l1b4',
        skill: 'psychology',
        statement: 'Feeling emotions while trading means you are not cut out for it.',
        answer: false,
        explain:
          'Everyone feels them — professionals included. The skill is not feeling nothing; it is having rules and routines so the feelings do not drive the decisions.',
      },
    ],
  },
  {
    id: 'm6l2',
    moduleId: 'm6',
    title: 'Biases that Empty Accounts',
    objective: 'Name the mental shortcuts that distort trading decisions.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm6l2b1',
        skill: 'psychology',
        title: 'Bugs in human reasoning',
        body:
          'Your brain uses shortcuts that are helpful in daily life and expensive in markets. Loss aversion makes a $100 loss hurt more than a $100 win feels good — so you hold losers and cut winners. Confirmation bias makes you see only evidence that agrees with your position. The gambler’s fallacy whispers that after five red candles, green is "due". It never is.',
      },
      {
        kind: 'match',
        id: 'm6l2b2',
        skill: 'psychology',
        prompt: 'Match each bias to its behaviour.',
        pairs: [
          { left: 'Loss aversion', right: 'Holding losers too long, cutting winners early' },
          { left: 'Confirmation bias', right: 'Only noticing evidence that supports your trade' },
          { left: 'Gambler’s fallacy', right: 'Believing a win is "due" after several losses' },
          { left: 'Recency bias', right: 'Overweighting the last few trades over the long record' },
        ],
        explain: 'Naming a bias while it happens is half the cure. The other half is rules that do not care how you feel.',
      },
      {
        kind: 'scenario',
        id: 'm6l2b3',
        skill: 'psychology',
        situation:
          'Your long trade is 30 pips underwater, 5 pips from the stop. You suddenly find three fresh reasons why it will recover, and consider moving the stop lower "to give it room". What is happening?',
        options: [
          {
            text: 'Confirmation bias plus loss aversion — the stop must stay where the plan put it',
            quality: 'best',
            explain: 'The "fresh reasons" appeared only after the pain did. The plan was made by the calm you; trust that version.',
          },
          { text: 'Smart adaptation to new information', quality: 'poor', explain: 'If the information only ever appears when you are losing, it is not information — it is rationalisation.' },
          { text: 'Move the stop but only this once', quality: 'poor', explain: 'Every moved stop is "only this once". That is how small losses become account-defining ones.' },
        ],
      },
      {
        kind: 'truefalse',
        id: 'm6l2b4',
        skill: 'psychology',
        statement: 'After six losing trades, the probability that the next trade wins has increased.',
        answer: false,
        explain:
          'Trades are independent events. The market has no memory of your results — believing otherwise is the gambler’s fallacy in action.',
      },
    ],
  },
  {
    id: 'm6l3',
    moduleId: 'm6',
    title: 'Process over Outcome',
    objective: 'Judge decisions by their quality, not by whether one trade happened to win.',
    xp: 65,
    blocks: [
      {
        kind: 'concept',
        id: 'm6l3b1',
        skill: 'psychology',
        title: 'Good decisions can lose; bad ones can win',
        body:
          'A trade that followed every rule and lost was a GOOD trade. A reckless gamble that happened to win was a BAD trade — it just was not punished yet. If you judge yourself by single outcomes, the market will train you to gamble. Judge the process: over hundreds of trades, process quality and results converge.',
        mistake:
          'Celebrating a rule-breaking winner. Every celebrated violation buys you a bigger one later.',
      },
      {
        kind: 'scenario',
        id: 'm6l3b2',
        skill: 'psychology',
        situation:
          'Trader A followed every rule and lost 1R. Trader B skipped the checklist, oversized on a hunch, and made 3R. Who traded better?',
        options: [
          {
            text: 'Trader A — the loss was the cost of a good process',
            quality: 'best',
            explain: 'Repeat A’s day 100 times and the tested edge pays. Repeat B’s day 100 times and the account dies on schedule.',
          },
          { text: 'Trader B — money is the only scoreboard', quality: 'poor', explain: 'One outcome is luck. The scoreboard that matters is expectancy over many trades.' },
          { text: 'Neither — both should have made money', quality: 'poor', explain: 'Expecting every trade to win misunderstands what trading is.' },
        ],
      },
      {
        kind: 'mcq',
        id: 'm6l3b3',
        skill: 'psychology',
        prompt: 'What is the healthiest daily goal for a developing trader?',
        options: [
          { text: '"Make at least $50 today"' },
          {
            text: '"Follow my rules on every decision today, including the decision not to trade"',
            explain: 'Process goals are fully in your control; profit goals on a random day are not.',
          },
          { text: '"Find at least three trades today"' },
        ],
        correctIndex: 1,
        explain:
          'Daily P&L is dominated by variance. Rule adherence is the only lever you fully control — and it is what compounds.',
      },
      {
        kind: 'reflection',
        id: 'm6l3b4',
        skill: 'psychology',
        prompt:
          'Recall a decision (in trading or life) that was correct even though the outcome was bad. What made it correct?',
      },
    ],
  },
];
