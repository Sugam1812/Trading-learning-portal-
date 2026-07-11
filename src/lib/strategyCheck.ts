import { Strategy, StrategyIssue } from '@/types/trading';

const VAGUE_WORDS = [
  'maybe',
  'probably',
  'looks good',
  'feels',
  'gut',
  'obvious',
  'strong-ish',
  'roughly',
  'around there',
  'sometimes',
  'when it seems',
  'if i think',
  'vibe',
];

const CERTAINTY_WORDS = ['guaranteed', 'always wins', 'never loses', '100%', 'cannot fail', 'sure thing'];

function containsAny(text: string, words: string[]): string | null {
  const lower = text.toLowerCase();
  for (const w of words) if (lower.includes(w)) return w;
  return null;
}

/**
 * Rule-quality checker: flags vague wording, missing risk controls,
 * unrealistic promises and contradictory settings before a strategy is saved.
 */
export function checkStrategy(s: Strategy): StrategyIssue[] {
  const issues: StrategyIssue[] = [];
  const req: [keyof Strategy, string][] = [
    ['setup', 'Describe the setup: what must the chart show before you consider a trade?'],
    ['entryTrigger', 'Define an objective entry trigger, e.g. "15m candle closes above the previous high".'],
    ['stopRule', 'A strategy without a stop-loss rule cannot be tested or traded safely.'],
    ['targetRule', 'Define how the target is placed, e.g. "2R" or "previous swing high".'],
    ['invalidation', 'State what makes the setup invalid, so you know when NOT to trade it.'],
  ];
  for (const [field, message] of req) {
    if (!String(s[field] ?? '').trim()) issues.push({ severity: 'error', field: String(field), message });
  }

  for (const field of ['setup', 'entryTrigger', 'stopRule', 'targetRule', 'trendFilter'] as const) {
    const hit = containsAny(String(s[field] ?? ''), VAGUE_WORDS);
    if (hit) {
      issues.push({
        severity: 'warning',
        field,
        message: `"${hit}" is subjective. Rewrite the rule so two different people would take the same trades.`,
      });
    }
    const certain = containsAny(String(s[field] ?? ''), CERTAINTY_WORDS);
    if (certain) {
      issues.push({
        severity: 'error',
        field,
        message: `"${certain}" is a promise no strategy can keep. Remove certainty language.`,
      });
    }
  }

  if (s.riskPercent <= 0) {
    issues.push({ severity: 'error', field: 'riskPercent', message: 'Risk per trade must be above 0%.' });
  } else if (s.riskPercent > 2) {
    issues.push({
      severity: 'warning',
      field: 'riskPercent',
      message: `${s.riskPercent}% per trade is aggressive. Most professionals stay at or below 1–2%.`,
    });
  }

  if (s.minRR < 1) {
    issues.push({
      severity: 'warning',
      field: 'minRR',
      message: 'A reward-to-risk below 1:1 needs a very high win rate to break even. Check the math module.',
    });
  }

  if (s.maxTradesPerDay > 5) {
    issues.push({
      severity: 'warning',
      field: 'maxTradesPerDay',
      message: 'More than 5 trades per day invites overtrading. Consider a lower cap while testing.',
    });
  }

  if (!s.newsRule.trim()) {
    issues.push({
      severity: 'warning',
      field: 'newsRule',
      message: 'Add a news rule (e.g. "no entries within 15 minutes of high-impact news").',
    });
  }

  return issues;
}
