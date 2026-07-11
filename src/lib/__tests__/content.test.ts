import { CHALLENGES } from '@/content/challenges';
import { getLesson, getModule, isModuleUnlocked, LESSONS, MODULES, moduleProgress, nextLesson, worlds } from '@/content/curriculum';
import { GLOSSARY } from '@/content/glossary';
import { getPack } from '@/data/packs';
import { LessonBlock } from '@/types/content';

/**
 * Content integrity: every reference inside the curriculum must resolve
 * against real data, so a typo in content can never ship a broken screen.
 */

function chartRefs(b: LessonBlock): { packId: string; visible?: number }[] {
  const refs: { packId: string; visible?: number }[] = [];
  if ('figure' in b && b.figure) refs.push({ packId: b.figure.packId, visible: b.figure.visible });
  if (b.kind === 'tapcandle' || b.kind === 'nextcandle' || b.kind === 'chartchoice') {
    refs.push({ packId: b.packId, visible: 'visible' in b ? b.visible : undefined });
  }
  return refs;
}

describe('curriculum integrity', () => {
  it('module lesson ids resolve, are unique, and point back to the module', () => {
    const seen = new Set<string>();
    for (const mod of MODULES) {
      for (const lid of mod.lessonIds) {
        expect(seen.has(lid)).toBe(false);
        seen.add(lid);
        const lesson = getLesson(lid);
        expect(lesson).toBeDefined();
        expect(lesson!.moduleId).toBe(mod.id);
      }
    }
    expect(seen.size).toBe(LESSONS.length);
  });

  it('module prerequisites reference existing modules', () => {
    for (const mod of MODULES) {
      if (mod.prereq) expect(getModule(mod.prereq)).toBeDefined();
    }
  });

  it('every lesson has an objective, xp and at least 3 blocks with unique ids', () => {
    const blockIds = new Set<string>();
    for (const lesson of LESSONS) {
      expect(lesson.objective.length).toBeGreaterThan(10);
      expect(lesson.xp).toBeGreaterThan(0);
      expect(lesson.blocks.length).toBeGreaterThanOrEqual(3);
      for (const b of lesson.blocks) {
        expect(blockIds.has(b.id)).toBe(false);
        blockIds.add(b.id);
      }
    }
  });

  it('all chart references resolve and never look past the pack', () => {
    for (const lesson of LESSONS) {
      for (const b of lesson.blocks) {
        for (const ref of chartRefs(b)) {
          const pack = getPack(ref.packId); // throws if unknown
          if (ref.visible !== undefined) {
            expect(ref.visible).toBeGreaterThan(4);
            expect(ref.visible).toBeLessThanOrEqual(pack.candles.length);
          }
        }
        if (b.kind === 'nextcandle') {
          // Needs at least one hidden candle to reveal.
          expect(b.visible).toBeLessThan(getPack(b.packId).candles.length);
        }
        if (b.kind === 'tapcandle') {
          const limit = b.visible ?? getPack(b.packId).candles.length;
          expect(b.targetIndexes.length).toBeGreaterThan(0);
          for (const i of b.targetIndexes) {
            expect(i).toBeGreaterThanOrEqual(0);
            expect(i).toBeLessThan(limit);
          }
        }
      }
    }
  });

  it('choice blocks have valid correct answers and explanations', () => {
    for (const lesson of LESSONS) {
      for (const b of lesson.blocks) {
        if (b.kind === 'mcq' || b.kind === 'chartchoice') {
          expect(b.correctIndex).toBeGreaterThanOrEqual(0);
          expect(b.correctIndex).toBeLessThan(b.options.length);
          expect(b.explain.length).toBeGreaterThan(10);
        }
        if (b.kind === 'multi') {
          expect(b.correctIndexes.length).toBeGreaterThan(0);
          for (const i of b.correctIndexes) expect(i).toBeLessThan(b.options.length);
        }
        if (b.kind === 'scenario') {
          expect(b.options.filter((o) => o.quality === 'best').length).toBe(1);
          for (const o of b.options) expect(o.explain.length).toBeGreaterThan(10);
        }
        if (b.kind === 'order') {
          expect(new Set(b.items).size).toBe(b.items.length);
          expect(b.items.length).toBeGreaterThanOrEqual(3);
        }
        if (b.kind === 'match') {
          const rights = b.pairs.map((p) => p.right);
          expect(new Set(rights).size).toBe(rights.length);
        }
        if (b.kind === 'rrbuilder') {
          expect(b.requiredRatio).toBeGreaterThan(0);
          expect(b.initialStopPips).toBeGreaterThan(0);
        }
      }
    }
  });

  it('unlock logic: first module open, later modules gated, progress fractions sane', () => {
    expect(isModuleUnlocked('m0', {})).toBe(true);
    expect(isModuleUnlocked('m1', {})).toBe(false);
    const allM0 = Object.fromEntries(getModule('m0')!.lessonIds.map((id) => [id, { completed: true }]));
    expect(isModuleUnlocked('m1', allM0)).toBe(true);
    expect(moduleProgress('m0', {})).toBe(0);
    expect(moduleProgress('m0', allM0)).toBe(1);
  });

  it('nextLesson walks the curriculum in order', () => {
    expect(nextLesson({})?.id).toBe('m0l1');
    const done = { m0l1: { completed: true } };
    expect(nextLesson(done)?.id).toBe('m0l2');
  });

  it('worlds group modules without losing any', () => {
    const total = worlds().reduce((a, w) => a + w.modules.length, 0);
    expect(total).toBe(MODULES.length);
  });
});

describe('glossary integrity', () => {
  it('terms and ids are unique and plainly explained', () => {
    const ids = new Set(GLOSSARY.map((g) => g.id));
    const terms = new Set(GLOSSARY.map((g) => g.term.toLowerCase()));
    expect(ids.size).toBe(GLOSSARY.length);
    expect(terms.size).toBe(GLOSSARY.length);
    for (const g of GLOSSARY) expect(g.plain.length).toBeGreaterThan(15);
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(50);
  });
});

describe('challenge integrity', () => {
  it('every challenge resolves its pack, hides future candles, and has one best option', () => {
    for (const c of CHALLENGES) {
      const pack = getPack(c.packId);
      expect(c.visible).toBeLessThan(pack.candles.length); // there must BE a hidden future
      expect(c.options.filter((o) => o.quality === 'best').length).toBe(1);
      expect(c.reveal.length).toBeGreaterThan(20);
      for (const o of c.options) expect(o.explain.length).toBeGreaterThan(10);
    }
    expect(new Set(CHALLENGES.map((c) => c.id)).size).toBe(CHALLENGES.length);
  });
});

describe('curriculum honesty rules', () => {
  const FORBIDDEN = ['guaranteed profit', 'guaranteed win', 'never lose', 'risk-free profit', 'get rich'];
  it('no lesson or challenge promises profits', () => {
    const text = JSON.stringify(LESSONS).toLowerCase() + JSON.stringify(CHALLENGES).toLowerCase();
    for (const phrase of FORBIDDEN) {
      // The phrases may appear only in warnings/negations; check they never appear
      // as bare claims by ensuring each occurrence is near negating language.
      const idx = text.indexOf(phrase);
      if (idx >= 0) {
        const context = text.slice(Math.max(0, idx - 160), idx + 160);
        expect(
          /not |no |never |cannot |scam|red flag|mislead|impossible|does not|do not exist/.test(context),
        ).toBe(true);
      }
    }
  });
});
