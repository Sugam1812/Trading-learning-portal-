import { Lesson, Module } from '@/types/content';
import { M0, M0_LESSONS } from './m0';
import { M1, M1_LESSONS } from './m1';
import { M2, M2_LESSONS } from './m2';
import { M3, M3_LESSONS } from './m3';
import { M4, M4_LESSONS } from './m4';
import { M5, M5_LESSONS } from './m5';
import { M6, M6_LESSONS } from './m6';
import { M7, M7_LESSONS } from './m7';
import { M8, M8_LESSONS } from './m8';
import { M9, M9_LESSONS } from './m9';
import { M10, M10_LESSONS } from './m10';
import { M11, M11_LESSONS } from './m11';
import { M12, M12_LESSONS } from './m12';
import { M13, M13_LESSONS } from './m13';
import { M14, M14_LESSONS } from './m14';
import { M15, M15_LESSONS } from './m15';

export const MODULES: Module[] = [M0, M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12, M13, M14, M15];

export const LESSONS: Lesson[] = [
  ...M0_LESSONS,
  ...M1_LESSONS,
  ...M2_LESSONS,
  ...M3_LESSONS,
  ...M4_LESSONS,
  ...M5_LESSONS,
  ...M6_LESSONS,
  ...M7_LESSONS,
  ...M8_LESSONS,
  ...M9_LESSONS,
  ...M10_LESSONS,
  ...M11_LESSONS,
  ...M12_LESSONS,
  ...M13_LESSONS,
  ...M14_LESSONS,
  ...M15_LESSONS,
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
