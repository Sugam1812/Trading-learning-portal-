import { SkillId } from '@/types/content';

/**
 * Mastery per skill: exponential moving average of answer correctness (0..1).
 * New evidence moves the estimate 25% of the way toward the observed score,
 * so mastery responds to trends without over-reacting to single answers.
 */
export const MASTERY_ALPHA = 0.25;

export type MasteryMap = Partial<Record<SkillId, { value: number; samples: number }>>;

export function updateMastery(map: MasteryMap, skill: SkillId, score: number): MasteryMap {
  const prev = map[skill] ?? { value: 0.5, samples: 0 };
  const value = prev.samples === 0 ? score : prev.value + MASTERY_ALPHA * (score - prev.value);
  return { ...map, [skill]: { value: clamp01(value), samples: prev.samples + 1 } };
}

export function masteryLabel(value: number): string {
  if (value >= 0.85) return 'Strong';
  if (value >= 0.65) return 'Developing';
  if (value >= 0.45) return 'Shaky';
  return 'Needs work';
}

/** Skills sorted weakest first, only those with real evidence. */
export function weakestSkills(map: MasteryMap, minSamples = 3): SkillId[] {
  return (Object.keys(map) as SkillId[])
    .filter((k) => (map[k]?.samples ?? 0) >= minSamples)
    .sort((a, b) => (map[a]?.value ?? 1) - (map[b]?.value ?? 1));
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
