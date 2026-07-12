import { Lesson, Module } from '@/types/content';

export const M15: Module = {
  id: 'm15',
  order: 15,
  world: 'Structure City',
  title: 'Chart Patterns',
  tagline: 'Double tops, head and shoulders, flags — and the failure rates nobody advertises.',
  icon: '🏗️',
  skills: ['structure', 'strategy'],
  lessonIds: ['m15l1', 'm15l2', 'm15l3', 'm15l4'],
  prereq: 'm3',
};

export const M15_LESSONS: Lesson[] = [
  {
    id: 'm15l1',
    moduleId: 'm15',
    title: 'Patterns Are Structure With Names',
    objective: 'See every classic pattern as a structure story, not a magic shape.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm15l1b1',
        skill: 'structure',
        title: 'Why shapes repeat',
        body:
          'Chart patterns are recurring structure stories. A double top is two failed attempts at the same high — buyers ran out of conviction twice. A flag is a shallow pullback after an impulse — profit-taking, not reversal. The pattern name is shorthand; the STORY of buyers and sellers underneath is what you already learned in Structure City. Read the story and the names take care of themselves.',
        bullets: [
          'Double top / bottom: two rejections of the same level — a failed second attempt.',
          'Head and shoulders: a final higher high that immediately fails — trend exhaustion.',
          'Flags and pennants: tight pullbacks that keep an impulse’s gains — continuation stories.',
        ],
        mistake:
          'Hunting for shapes first and stories second. A "double top" in the middle of a strong uptrend with no rejection behaviour is just two candles at similar prices.',
      },
      {
        kind: 'match',
        id: 'm15l1b2',
        skill: 'structure',
        prompt: 'Match each pattern to the structure story it tells.',
        pairs: [
          { left: 'Double top', right: 'Second attempt at the high fails — buyers exhausted' },
          { left: 'Head & shoulders', right: 'A last higher high fails and the swing sequence breaks' },
          { left: 'Bull flag', right: 'Shallow pullback holding most of an impulse’s gains' },
          { left: 'Triangle', right: 'Contracting range — both sides compressing toward a decision' },
        ],
        explain: 'Four names, four structure stories. If you can tell the story without the name, you understand the pattern.',
      },
      {
        kind: 'mcq',
        id: 'm15l1b3',
        skill: 'structure',
        prompt: 'What single ingredient turns "two highs at a similar price" into a meaningful double top?',
        options: [
          { text: 'The highs being exactly equal to the pip' },
          {
            text: 'Visible rejection at both attempts plus a break of the low between them (the neckline)',
            explain: 'Rejection twice + confirmation break = the story is complete.',
          },
          { text: 'The pattern appearing on a Friday' },
        ],
        correctIndex: 1,
        explain:
          'The neckline break is the confirmation: until the low between the two peaks gives way, the "double top" is just a range at highs.',
      },
      {
        kind: 'truefalse',
        id: 'm15l1b4',
        skill: 'structure',
        statement: 'A pattern is complete and tradeable the moment you can see its shape forming.',
        answer: false,
        explain:
          'Half-formed patterns morph constantly — the "head and shoulders" that becomes a bull flag is a classic. Confirmation (usually the neckline or boundary break) is what separates a pattern from a possibility.',
      },
    ],
  },
  {
    id: 'm15l2',
    moduleId: 'm15',
    title: 'Necklines, Triggers and Targets',
    objective: 'Trade patterns with defined confirmation, invalidation and measured targets.',
    xp: 65,
    blocks: [
      {
        kind: 'concept',
        id: 'm15l2b1',
        skill: 'strategy',
        title: 'The three lines every pattern trade needs',
        body:
          'A tradeable pattern gives you three things. Confirmation: the level whose break completes the story (the neckline for tops/bottoms, the boundary for flags and triangles). Invalidation: the level that proves the story wrong (beyond the second peak, or the flag’s far edge). Target: the measured move — project the pattern’s height from the breakout point. All three exist BEFORE entry, which is exactly what makes patterns testable.',
        example:
          'Double top: peaks at 1.1050, neckline at 1.1000 → height 50 pips. Neckline breaks → confirmation at 1.1000, stop above 1.1055, measured target 1.0950. Reward-to-risk computable before the trade exists.',
      },
      {
        kind: 'number',
        id: 'm15l2b2',
        skill: 'math',
        prompt: 'A double top has peaks at 1.2080 and a neckline at 1.2030. What is the measured-move target after a neckline break? (Enter the price, e.g. 1.1990)',
        answer: 1.198,
        tolerance: 0.0002,
        hint: 'Height = peaks − neckline. Project that height DOWN from the neckline.',
        explain: 'Height = 50 pips. Target = 1.2030 − 0.0050 = 1.1980. Measured moves are estimates, not promises — real targets also respect nearby levels.',
      },
      {
        kind: 'chartchoice',
        id: 'm15l2b3',
        skill: 'strategy',
        prompt: 'This chart broke out of a consolidation and is retesting the broken boundary — the same behaviour a flag or rectangle gives after confirmation. Where does the pattern say your stop belongs?',
        packId: 'eu-break-1',
        visible: 30,
        options: [
          { text: 'No stop — patterns are reliable enough without one' },
          {
            text: 'Back inside the broken pattern, beyond the boundary that should now hold',
            explain: 'If price re-enters the pattern decisively, the breakout story is dead — that is the invalidation.',
          },
          { text: 'Ten times the pattern height away, to be safe' },
        ],
        correctIndex: 1,
        explain:
          'Pattern invalidation is structural: the trade idea is "the boundary now holds". The stop goes where that idea is proven wrong, not at a random distance.',
      },
      {
        kind: 'mcq',
        id: 'm15l2b4',
        skill: 'strategy',
        prompt: 'Your measured-move target sits 20 pips BEYOND a major H4 resistance zone. What is the professional adjustment?',
        options: [
          { text: 'Keep the measured target — the pattern outranks the level' },
          {
            text: 'Take the nearer of the two: real obstacles beat geometric projections',
            explain: 'Levels are where other traders act; projections are arithmetic.',
          },
          { text: 'Skip all trades with any resistance anywhere above' },
        ],
        correctIndex: 1,
        explain:
          'Measured moves are one estimate among several. When geometry and structure disagree, respect the structure — or size the target conservatively.',
      },
    ],
  },
  {
    id: 'm15l3',
    moduleId: 'm15',
    title: 'When Patterns Fail',
    objective: 'Expect failure rates, recognise failed patterns early, and trade the failure honestly.',
    xp: 65,
    blocks: [
      {
        kind: 'concept',
        id: 'm15l3b1',
        skill: 'structure',
        title: 'The textbook forgot the losers',
        body:
          'Every pattern book shows ten perfect examples. Real charts serve the same patterns with meaningful failure rates: necklines that break and immediately reverse, flags that become full reversals, triangles that break both ways in one week. Failure is not noise — it is information. A confirmed pattern that fails often travels HARD the other way, because everyone who trusted the pattern is now trapped and exiting.',
        figure: {
          packId: 'eu-fake-1',
          caption: 'A breakout pattern that failed: confirmation, no follow-through, collapse. The trapped longs fueled the fall.',
        },
        mistake:
          'Re-entering the same failed pattern repeatedly because "it should work". The market already voted.',
      },
      {
        kind: 'scenario',
        id: 'm15l3b2',
        skill: 'strategy',
        situation:
          'Your double-bottom long confirmed, then price broke back below the neckline and closed there. You are -0.6R with the stop 15 pips lower. The pattern that got you in is now officially failed. What is the honest action?',
        options: [
          {
            text: 'Exit now — the reason for the trade no longer exists, saving 0.4R is a win',
            quality: 'best',
            explain: 'When the premise dies, the trade dies. Waiting for the full stop out of hope is paying extra for the same information.',
          },
          { text: 'Hold to the stop — rules are rules', quality: 'ok', explain: 'Defensible if your tested plan says "always hold to stop" — but many tested plans include premise-failure exits precisely for this case. Know which plan you tested.' },
          { text: 'Add to the position at the better price', quality: 'poor', explain: 'Averaging into a failed premise is how -1R becomes -3R.' },
        ],
      },
      {
        kind: 'truefalse',
        id: 'm15l3b3',
        skill: 'structure',
        statement: 'A failed bullish pattern can itself be a tested setup for a trade in the opposite direction.',
        answer: true,
        explain:
          'Failed patterns trap participants; their exits fuel the reverse move. "Failed breakout" strategies are a legitimate family — but like everything, they earn trust only through your own backtest.',
      },
      {
        kind: 'mcq',
        id: 'm15l3b4',
        skill: 'backtesting',
        prompt: 'How would you honestly measure whether double tops "work" for you?',
        options: [
          { text: 'Collect memorable examples from chart scrolling' },
          {
            text: 'Write an objective definition (peaks, neckline, confirmation), then log EVERY instance in the replay Lab — wins and failures',
            explain: 'Definition + full census = a real failure rate instead of a highlight reel.',
          },
          { text: 'Trust the pattern book’s success percentage' },
        ],
        correctIndex: 1,
        explain:
          'Published pattern statistics vary wildly with definitions and markets. Your tested definition on your market is the only number that applies to you.',
      },
    ],
  },
  {
    id: 'm15l4',
    moduleId: 'm15',
    title: 'The Subjectivity Trap',
    objective: 'Defend against seeing patterns that are not there — including in your own backtests.',
    xp: 65,
    blocks: [
      {
        kind: 'concept',
        id: 'm15l4b1',
        skill: 'backtesting',
        title: 'Your brain is a pattern factory',
        body:
          'Humans see faces in clouds and patterns in noise — psychologists call it pareidolia. On charts it is dangerous: with enough squinting, every reversal "was" a head and shoulders in hindsight. The defence is definitional discipline: fixed rules for what counts as a peak, how equal the tops must be, what confirms. If your definition needs adjusting per example, you are drawing the target around the arrow.',
        mistake:
          'Marking patterns AFTER seeing the outcome. In hindsight, all patterns work — that is precisely why hindsight is worthless as evidence.',
      },
      {
        kind: 'multi',
        id: 'm15l4b2',
        skill: 'backtesting',
        prompt: 'Which habits keep pattern trading objective? Select all that apply.',
        options: [
          { text: 'A written definition with measurable criteria (swing size, tolerance, confirmation)' },
          { text: 'Marking patterns only on the hard right edge, before the outcome' },
          { text: 'Adjusting the definition case-by-case so good examples qualify' },
          { text: 'Recording every qualifying instance, not just the pretty ones' },
        ],
        correctIndexes: [0, 1, 3],
        explain: 'Fixed definition, real-time marking, full census. The third option is the subjectivity trap wearing a lab coat.',
      },
      {
        kind: 'scenario',
        id: 'm15l4b3',
        skill: 'psychology',
        situation:
          'Reviewing your journal, you notice you called THREE different formations "the pattern" across your last ten pattern trades, and the definition quietly changed each time you lost. What has your journal just caught?',
        options: [
          {
            text: 'Definition drift — the pattern was following your hopes; freeze one written definition and re-test from zero',
            quality: 'best',
            explain: 'This catch is the journal doing its highest-value job. A drifting definition means the ten trades tested nothing.',
          },
          { text: 'Bad luck — patterns just failed this month', quality: 'poor', explain: 'The drift is documented in your own words. Luck is not the story here.' },
          { text: 'Proof that patterns never work', quality: 'poor', explain: 'You have not yet tested A pattern — you tested three moods. Conclusions come after a frozen definition.' },
        ],
      },
      {
        kind: 'reflection',
        id: 'm15l4b4',
        skill: 'backtesting',
        prompt:
          'Pick one pattern and write its frozen definition: what makes a valid peak/trough, the maximum tolerance between tops/bottoms, and the exact confirmation. This definition is now testable in the Lab.',
      },
    ],
  },
];
