import { getModule, getLesson } from '@/content/curriculum';
import { EXAM_QUESTIONS, examPassed, pickExamBlocks } from '../exam';
import { Lesson } from '@/types/content';

function moduleLessons(moduleId: string): Lesson[] {
  const mod = getModule(moduleId)!;
  return mod.lessonIds.map((id) => getLesson(id)!) as Lesson[];
}

describe('pickExamBlocks', () => {
  it('is deterministic for the same module and attempt key', () => {
    const lessons = moduleLessons('m0');
    const a = pickExamBlocks(lessons, 'm0', '2026-07-11').map((b) => b.id);
    const b = pickExamBlocks(lessons, 'm0', '2026-07-11').map((b) => b.id);
    expect(a).toEqual(b);
  });

  it('draws a different set on a different day (fresh retakes)', () => {
    const lessons = moduleLessons('m0');
    const a = pickExamBlocks(lessons, 'm0', '2026-07-11').map((b) => b.id);
    const b = pickExamBlocks(lessons, 'm0', '2026-07-12').map((b) => b.id);
    expect(a).not.toEqual(b);
  });

  it('fills the quota with gradeable kinds only, no duplicates', () => {
    for (const moduleId of ['m0', 'm1', 'm4', 'm15']) {
      const lessons = moduleLessons(moduleId);
      const picked = pickExamBlocks(lessons, moduleId, 'test-key');
      expect(picked.length).toBeGreaterThanOrEqual(Math.min(EXAM_QUESTIONS, 5));
      expect(picked.length).toBeLessThanOrEqual(EXAM_QUESTIONS);
      expect(new Set(picked.map((b) => b.id)).size).toBe(picked.length);
      for (const b of picked) {
        expect(['concept', 'reflection', 'tappart', 'tapcandle', 'nextcandle', 'rrbuilder']).not.toContain(b.kind);
      }
    }
  });

  it('every module produces an exam of quota size or its full gradeable pool', () => {
    const { MODULES } = require('@/content/curriculum');
    const gradeable = new Set(['mcq', 'multi', 'truefalse', 'number', 'chartchoice', 'scenario', 'order', 'match']);
    for (const mod of MODULES) {
      const lessons = moduleLessons(mod.id);
      const poolSize = lessons.flatMap((l) => l.blocks.filter((b) => gradeable.has(b.kind))).length;
      const picked = pickExamBlocks(lessons, mod.id, 'k');
      expect(picked.length).toBe(Math.min(EXAM_QUESTIONS, poolSize));
      expect(poolSize).toBeGreaterThanOrEqual(5); // every module must support a meaningful exam
    }
  });
});

describe('examPassed', () => {
  it('passes at 75% and above', () => {
    expect(examPassed(6, 8)).toBe(true);
    expect(examPassed(5, 8)).toBe(false);
    expect(examPassed(8, 8)).toBe(true);
    expect(examPassed(0, 0)).toBe(false);
  });
});
