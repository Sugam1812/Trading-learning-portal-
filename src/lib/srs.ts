/**
 * Lightweight spaced repetition for the Mistake Notebook.
 * Correct reviews walk up an interval ladder; a wrong review resets to the start.
 */

export const SRS_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];

export interface ReviewState {
  /** Index into SRS_INTERVALS_DAYS. */
  stage: number;
  /** Epoch ms when the item is due again. */
  dueAt: number;
}

export function initialReview(now: number): ReviewState {
  return { stage: 0, dueAt: now };
}

export function reviewOutcome(state: ReviewState, correct: boolean, now: number): ReviewState {
  const stage = correct ? Math.min(state.stage + 1, SRS_INTERVALS_DAYS.length - 1) : 0;
  return { stage, dueAt: now + SRS_INTERVALS_DAYS[stage] * 86400000 };
}

export function isDue(state: ReviewState, now: number): boolean {
  return now >= state.dueAt;
}

/** An item is considered mastered (and can leave the notebook) at the top stage. */
export function isRetired(state: ReviewState): boolean {
  return state.stage >= SRS_INTERVALS_DAYS.length - 1;
}
