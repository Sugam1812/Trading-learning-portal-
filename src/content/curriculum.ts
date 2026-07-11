import { Lesson, Module } from '@/types/content';
import { M0, M0_LESSONS } from './m0';
import { M1, M1_LESSONS } from './m1';
import { M2, M2_LESSONS } from './m2';
import { M3, M3_LESSONS } from './m3';
import { M4, M4_LESSONS } from './m4';
import { M5, M5_LESSONS } from './m5';
import { M6, M6_LESSONS } from './m6';
import { M7, M7_LESSONS } from './m7';

export const MODULES: Module[] = [M0, M1, M2, M3, M4, M5, M6, M7];

export const LESSONS: Lesson[] = [
  ...M0_LESSONS,
  ...M1_LESSONS,
  ...M2_LESSONS,
  ...M3_LESSONS,
  ...M4_LESSONS,
  ...M5_LESSONS,
  ...M6_LESSONS,
  ...M7_LESSONS,
];

const lessonMap = new Map(LESSONS.map((l) => [l.id, l]));
const moduleMap = new Map(MODULES.map((m) => [m.id, m]));

export function getLesson(id: string): Lesson | undefined {
  return lessonMap.get(id);
}

export function getModule(id: string): Module | undefined {
  return moduleMap.get(id);
}

/** Worlds in curriculum order, each with its modules. */
export function worlds(): { name: string; modules: Module[] }[] {
  const out: { name: string; modules: Module[] }[] = [];
  for (const m of [...MODULES].sort((a, b) => a.order - b.order)) {
    const w = out.find((x) => x.name === m.world);
    if (w) w.modules.push(m);
    else out.push({ name: m.world, modules: [m] });
  }
  return out;
}

/** A module unlocks when its prerequisite module is fully completed. */
export function isModuleUnlocked(moduleId: string, completedLessons: Record<string, { completed: boolean }>): boolean {
  const mod = moduleMap.get(moduleId);
  if (!mod) return false;
  if (!mod.prereq) return true;
  const prereq = moduleMap.get(mod.prereq);
  if (!prereq) return true;
  return prereq.lessonIds.every((id) => completedLessons[id]?.completed);
}

export function moduleProgress(moduleId: string, completedLessons: Record<string, { completed: boolean }>): number {
  const mod = moduleMap.get(moduleId);
  if (!mod || mod.lessonIds.length === 0) return 0;
  const done = mod.lessonIds.filter((id) => completedLessons[id]?.completed).length;
  return done / mod.lessonIds.length;
}

/** The next lesson the learner should take (first incomplete lesson of first unlocked module). */
export function nextLesson(completedLessons: Record<string, { completed: boolean }>): Lesson | undefined {
  for (const mod of [...MODULES].sort((a, b) => a.order - b.order)) {
    if (!isModuleUnlocked(mod.id, completedLessons)) continue;
    for (const id of mod.lessonIds) {
      if (!completedLessons[id]?.completed) return lessonMap.get(id);
    }
  }
  return undefined;
}
