/** XP, levels and streaks. Rewards mastery and honest process, never trade frequency. */

export const XP_PER_CORRECT_FIRST_TRY = 10;
export const XP_PER_CORRECT_RETRY = 5;
export const XP_LESSON_COMPLETE_BONUS = 20;
export const XP_CHALLENGE_BEST = 25;
export const XP_CHALLENGE_OK = 10;
export const XP_REVIEW_ITEM = 8;
export const XP_BACKTEST_TRADE_LOGGED = 5;
export const XP_JOURNAL_ENTRY = 15;

const LEVEL_TITLES = [
  'Newcomer',
  'Chart Explorer',
  'Candle Reader',
  'Structure Spotter',
  'Level Mapper',
  'Risk Guardian',
  'Plan Builder',
  'Backtest Scientist',
  'Discipline Keeper',
  'Strategy Architect',
  'Process Master',
];

/** XP needed to go from level n to n+1 grows gently. */
export function xpForLevel(level: number): number {
  return 100 + (level - 1) * 60;
}

export function levelFromXp(totalXp: number): { level: number; title: string; intoLevel: number; needed: number } {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  return { level, title, intoLevel: remaining, needed: xpForLevel(level) };
}

/**
 * Update a learning streak given the last active day key and today's key.
 * Same day: unchanged. Consecutive day: +1. Gap: reset to 1.
 */
export function nextStreak(
  lastDay: string | null,
  count: number,
  todayKey: string,
): { lastDay: string; count: number } {
  if (lastDay === todayKey) return { lastDay, count };
  if (lastDay) {
    const prev = new Date(`${lastDay}T12:00:00`);
    const today = new Date(`${todayKey}T12:00:00`);
    const diffDays = Math.round((today.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) return { lastDay: todayKey, count: count + 1 };
  }
  return { lastDay: todayKey, count: 1 };
}
