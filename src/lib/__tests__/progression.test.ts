import { levelFromXp, nextStreak, xpForLevel } from '../xp';
import { updateMastery, weakestSkills, masteryLabel, MasteryMap } from '../mastery';
import { initialReview, isDue, isRetired, reviewOutcome, SRS_INTERVALS_DAYS } from '../srs';
import { seededShuffle, mulberry32, dayKey } from '../rng';

describe('xp and levels', () => {
  it('level 1 starts at 0 xp and needs 100 xp', () => {
    const l = levelFromXp(0);
    expect(l.level).toBe(1);
    expect(l.needed).toBe(100);
    expect(l.intoLevel).toBe(0);
  });

  it('levels up after cumulative thresholds', () => {
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(100 + 160).level).toBe(3);
    expect(xpForLevel(2)).toBe(160);
  });

  it('carries leftover xp into the next level', () => {
    const l = levelFromXp(130);
    expect(l.level).toBe(2);
    expect(l.intoLevel).toBe(30);
  });
});

describe('streaks', () => {
  it('same day leaves the streak unchanged', () => {
    expect(nextStreak('2026-07-11', 4, '2026-07-11')).toEqual({ lastDay: '2026-07-11', count: 4 });
  });

  it('consecutive day increments', () => {
    expect(nextStreak('2026-07-10', 4, '2026-07-11')).toEqual({ lastDay: '2026-07-11', count: 5 });
  });

  it('a gap resets to 1, and a fresh user starts at 1', () => {
    expect(nextStreak('2026-07-08', 9, '2026-07-11').count).toBe(1);
    expect(nextStreak(null, 0, '2026-07-11').count).toBe(1);
  });

  it('handles month boundaries', () => {
    expect(nextStreak('2026-06-30', 2, '2026-07-01').count).toBe(3);
  });
});

describe('mastery', () => {
  it('first sample sets the value directly', () => {
    const m = updateMastery({}, 'risk', 1);
    expect(m.risk?.value).toBe(1);
    expect(m.risk?.samples).toBe(1);
  });

  it('moves 25% toward new evidence afterwards', () => {
    let m: MasteryMap = updateMastery({}, 'risk', 1);
    m = updateMastery(m, 'risk', 0);
    expect(m.risk?.value).toBeCloseTo(0.75);
  });

  it('ranks weakest skills first, requiring minimum samples', () => {
    let m: MasteryMap = {};
    for (let i = 0; i < 3; i++) m = updateMastery(m, 'risk', 1);
    for (let i = 0; i < 3; i++) m = updateMastery(m, 'candles', 0);
    m = updateMastery(m, 'structure', 0); // only 1 sample, excluded
    expect(weakestSkills(m)).toEqual(['candles', 'risk']);
  });

  it('labels bands', () => {
    expect(masteryLabel(0.9)).toBe('Strong');
    expect(masteryLabel(0.3)).toBe('Needs work');
  });
});

describe('spaced repetition', () => {
  const now = 1_700_000_000_000;

  it('new items are due immediately', () => {
    expect(isDue(initialReview(now), now)).toBe(true);
  });

  it('correct reviews climb the ladder; wrong resets', () => {
    let s = initialReview(now);
    s = reviewOutcome(s, true, now);
    expect(s.stage).toBe(1);
    expect(s.dueAt).toBe(now + 1 * 86400000);
    s = reviewOutcome(s, true, now);
    expect(s.stage).toBe(2);
    s = reviewOutcome(s, false, now);
    expect(s.stage).toBe(0);
  });

  it('retires at the top stage', () => {
    let s = initialReview(now);
    for (let i = 0; i < SRS_INTERVALS_DAYS.length; i++) s = reviewOutcome(s, true, now);
    expect(isRetired(s)).toBe(true);
  });
});

describe('rng utilities', () => {
  it('seeded shuffle is deterministic and a permutation', () => {
    const items = [1, 2, 3, 4, 5, 6];
    const a = seededShuffle(items, 42);
    const b = seededShuffle(items, 42);
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual(items);
  });

  it('mulberry32 yields stable values in [0,1)', () => {
    const r = mulberry32(1);
    const v = r();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
    expect(mulberry32(1)()).toBe(v);
  });

  it('dayKey formats local dates', () => {
    expect(dayKey(new Date(2026, 6, 11))).toBe('2026-07-11');
  });
});
