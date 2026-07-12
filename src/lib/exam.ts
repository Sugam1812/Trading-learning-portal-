import { hashString, seededShuffle } from './rng';
import { Lesson, LessonBlock } from '@/types/content';

export const EXAM_QUESTIONS = 8;
export const EXAM_PASS_RATIO = 0.75;
export const EXAM_XP = 60;

/** Block kinds that work as exam questions (gradeable, no free text, no reveals). */
const EXAM_KINDS = new Set(['mcq', 'multi', 'truefalse', 'number', 'chartchoice', 'scenario', 'order', 'match']);

/**
 * Deterministically sample exam questions from a module's lessons.
 * The seed mixes module id and an attempt key (e.g. day key), so every retake
 * on a new day draws a fresh-but-reproducible question set.
 */
export function pickExamBlocks(lessons: Lesson[], moduleId: string, attemptKey: string): LessonBlock[] {
  const pool = lessons.flatMap((l) => l.blocks.filter((b) => EXAM_KINDS.has(b.kind)));
  const shuffled = seededShuffle(pool, hashString(`${moduleId}:${attemptKey}`));
  // Prefer breadth: at most 2 questions per source lesson while filling up.
  const perLesson = new Map<string, number>();
  const byLesson = new Map<string, string>();
  for (const l of lessons) for (const b of l.blocks) byLesson.set(b.id, l.id);
  const picked: LessonBlock[] = [];
  for (const b of shuffled) {
    const lid = byLesson.get(b.id) ?? '';
    if ((perLesson.get(lid) ?? 0) >= 2) continue;
    perLesson.set(lid, (perLesson.get(lid) ?? 0) + 1);
    picked.push(b);
    if (picked.length >= EXAM_QUESTIONS) break;
  }
  // Small modules may not fill the quota with the breadth cap; top up if needed.
  if (picked.length < Math.min(EXAM_QUESTIONS, pool.length)) {
    for (const b of shuffled) {
      if (picked.length >= EXAM_QUESTIONS) break;
      if (!picked.includes(b)) picked.push(b);
    }
  }
  return picked;
}

export function examPassed(correct: number, total: number): boolean {
  if (total === 0) return false;
  return correct / total >= EXAM_PASS_RATIO;
}
