import { Lesson, Module } from '@/types/content';

export const M13: Module = {
  id: 'm13',
  order: 13,
  world: 'Professional Desk',
  title: 'Advanced Market Concepts',
  tagline: 'Liquidity, imbalances and "smart money" ideas — separated into fact, interpretation and hypothesis.',
  icon: '🧬',
  skills: ['structure', 'strategy'],
  lessonIds: ['m13l1', 'm13l2', 'm13l3'],
  prereq: 'm7',
};

export const M13_LESSONS: Lesson[] = [
  {
    id: 'm13l1',
    moduleId: 'm13',
    title: 'Liquidity and Stop Clusters',
    objective: 'Understand where resting orders gather and why price often visits them.',
    xp: 65,
    blocks: [
      {
        kind: 'concept',
        id: 'm13l1b1',
        skill: 'structure',
        title: 'Where the orders sleep',
        body:
          'Every trader with a position has a stop somewhere — and stops cluster at obvious places: just beyond swing highs and lows, round numbers, and yesterday’s extremes. A stop is an order waiting to trade, so these clusters are pools of liquidity. FACT: large orders need liquidity to fill. INTERPRETATION: price often pushes into these pools, triggers the stops, and reverses — what traders call a liquidity sweep or stop hunt. Useful lens; not a law.',
        example:
          'Price briefly moved above the previous high, triggered the buy-stops resting there, and then fell strongly. Traders call this a liquidity sweep — you already met it as the "fakeout" in Structure City.',
        figure: {
          packId: 'eu-fake-1',
          caption: 'The fakeout, re-read as liquidity: the poke above the range found the stops, then price collapsed.',
        },
      },
      {
        kind: 'mcq',
        id: 'm13l1b2',
        skill: 'structure',
        prompt: 'Why do stops cluster just beyond obvious swing highs and lows?',
        options: [
          { text: 'Brokers place them there' },
          {
            text: 'Because most traders are taught to put stops just beyond structure — the textbook creates the cluster',
            explain: 'Shared rules produce shared stop locations.',
          },
          { text: 'Random chance' },
        ],
        correctIndex: 1,
        explain:
          'The very lesson "stop below the swing low" — sensible for each trader — creates a predictable pool when thousands follow it. Markets are made of participants reading the same books.',
      },
      {
        kind: 'truefalse',
        id: 'm13l1b3',
        skill: 'strategy',
        statement: '"Price always sweeps liquidity before reversing" is a tested fact you can trade directly.',
        answer: false,
        explain:
          '"Always" is the giveaway. Sweeps happen often enough to be a useful lens, and fail often enough to need rules, invalidation and a backtest like everything else. Turn the lens into a measurable rule before trusting it.',
      },
      {
        kind: 'scenario',
        id: 'm13l1b4',
        skill: 'strategy',
        situation:
          'A video explains that "smart money engineered liquidity" on a chart, tracing arrows after the fact. It looks completely convincing. What is the scientific response?',
        options: [
          {
            text: 'Note the idea, define it as a testable rule (e.g. "sweep of a 3-candle swing high, then close back inside → short"), and backtest it',
            quality: 'best',
            explain: 'Hindsight arrows always look perfect. The rule-then-test path is how a story becomes (or fails to become) an edge.',
          },
          { text: 'Adopt the narrative — the arrows fit perfectly', quality: 'poor', explain: 'Any squiggle can be narrated in hindsight. Fitting the past is easy; the test is the future.' },
          { text: 'Dismiss all liquidity concepts as nonsense', quality: 'ok', explain: 'Healthy instinct, but overcorrecting discards a genuinely useful lens. Test, then judge.' },
        ],
      },
    ],
  },
  {
    id: 'm13l2',
    moduleId: 'm13',
    title: 'Gaps, Imbalances and Zones',
    objective: 'Read fair value gaps and supply/demand ideas as frameworks, not magic.',
    xp: 65,
    blocks: [
      {
        kind: 'concept',
        id: 'm13l2b1',
        skill: 'structure',
        title: 'When price moves too fast to negotiate',
        body:
          'A strong impulse candle can leave an "imbalance": a stretch of prices where almost all trading happened one-way. Traders call the untraded pocket a fair value gap (FVG), and the zone where the impulse launched an order block or demand/supply zone. The DESCRIPTIVE part is real — you can see the one-sided candle. The PREDICTIVE claims ("price must return to fill the gap", "the zone must hold") are hypotheses that vary wildly by market and context.',
        bullets: [
          'Observable fact: a large one-directional candle exists.',
          'Interpretation: the move left unfinished two-way business.',
          'Hypothesis: price will return there and react. Test it.',
        ],
        mistake:
          'Marking every gap and zone on the chart. Like support lines in Structure City: if everything is a zone, nothing is.',
      },
      {
        kind: 'match',
        id: 'm13l2b2',
        skill: 'strategy',
        prompt: 'Sort each statement into its epistemic category.',
        pairs: [
          { left: 'Observable fact', right: 'This H1 candle is 4× larger than its neighbours' },
          { left: 'Interpretation', right: 'That candle suggests one-sided aggressive buying' },
          { left: 'Hypothesis', right: 'Price will return to the gap before continuing' },
          { left: 'Tested rule', right: 'In my 80-trade backtest, gap-refills held 55% of the time' },
        ],
        explain:
          'This ladder — fact → interpretation → hypothesis → tested rule — is the whole module in one exercise. Most trading arguments confuse the rungs.',
      },
      {
        kind: 'mcq',
        id: 'm13l2b3',
        skill: 'strategy',
        prompt: 'Two educators disagree: one says "gaps always fill", the other "gaps are meaningless". Who is right?',
        options: [
          { text: 'The first — gaps must fill eventually' },
          { text: 'The second — ignore all gaps' },
          {
            text: 'Neither as stated: fill rates are an empirical question that differs by market, timeframe and definition',
            explain: '"Always" and "never" are both untested absolutes.',
          },
        ],
        correctIndex: 2,
        explain:
          'The only honest answer to "how often do gaps fill?" is a measured number with a definition attached. Everything else is rhetoric.',
      },
      {
        kind: 'truefalse',
        id: 'm13l2b4',
        skill: 'strategy',
        statement: 'Renaming support and resistance as "order blocks" makes the analysis more accurate.',
        answer: false,
        explain:
          'Vocabulary is not evidence. Some framings add genuinely new definitions worth testing; often it is familiar structure wearing new branding. Judge concepts by testability, not by how institutional they sound.',
      },
    ],
  },
  {
    id: 'm13l3',
    moduleId: 'm13',
    title: 'Correlation and Market Regimes',
    objective: 'See how pairs move together and why strategies die when regimes change.',
    xp: 65,
    blocks: [
      {
        kind: 'concept',
        id: 'm13l3b1',
        skill: 'strategy',
        title: 'The hidden wiring between pairs',
        body:
          'Currency pairs are wired together: EUR/USD and GBP/USD often move in the same direction (both priced against the dollar), while EUR/USD and USD/CHF often mirror each other. Two "different" trades can therefore be one doubled bet — you met this in Risk Fortress as correlated exposure. Correlations also shift over months. Markets likewise move between REGIMES: trending vs ranging, calm vs violent. A strategy is usually a regime specialist — knowing which regime feeds yours is survival knowledge.',
        example:
          'Long EUR/USD and long GBP/USD, 1% risk each. A single strong dollar rally hits both stops: you did not take two 1% risks, you took one 2% risk wearing two names.',
      },
      {
        kind: 'mcq',
        id: 'm13l3b2',
        skill: 'risk',
        prompt: 'You are long EUR/USD. Which additional trade adds the LEAST new dollar risk?',
        options: [
          { text: 'Long GBP/USD (moves with EUR/USD)' },
          { text: 'Short USD/CHF (mirrors EUR/USD)' },
          {
            text: 'A trade on EUR/GBP (neither leg doubles the dollar bet)',
            explain: 'A cross pair diversifies away from the shared USD exposure.',
          },
        ],
        correctIndex: 2,
        hint: 'Which option does not repeat the "dollar weakens" bet?',
        explain:
          'Both other options are the same dollar view restated. Correlation-aware risk counts exposures by THEME, not by ticket.',
      },
      {
        kind: 'scenario',
        id: 'm13l3b3',
        skill: 'strategy',
        situation:
          'Your trend-following strategy earned +15R over four months, then lost 6R in six weeks with no rule broken. The market has visibly shifted from trending to tight ranging. What is the professional read?',
        options: [
          {
            text: 'A regime change: reduce or pause the strategy per plan, keep records, and resume when its conditions return',
            quality: 'best',
            explain: 'Strategies are regime specialists. Recognising the off-season is a skill, not an excuse.',
          },
          { text: 'The strategy is broken forever — delete it', quality: 'poor', explain: 'A regime shift is not a refutation. The four trending months were real too.' },
          { text: 'Add filters until recent losses disappear in the backtest', quality: 'poor', explain: 'That is curve-fitting to the newest noise — the Backtest Laboratory’s cardinal sin.' },
        ],
      },
      {
        kind: 'reflection',
        id: 'm13l3b4',
        skill: 'strategy',
        prompt: 'Name the regime your (planned) strategy needs to thrive, and one signal you could use to notice that regime has left.',
      },
    ],
  },
];
