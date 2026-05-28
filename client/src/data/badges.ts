export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xpReward: number
}

export const BADGES: Badge[] = [
  {
    id: 'first_lesson',
    name: 'First Steps',
    description: 'Completed your first lesson',
    icon: '📖',
    rarity: 'common',
    xpReward: 50,
  },
  {
    id: 'ten_lessons',
    name: 'Knowledge Hungry',
    description: 'Completed 10 lessons',
    icon: '📚',
    rarity: 'common',
    xpReward: 100,
  },
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Completed 30 lessons — full curriculum done!',
    icon: '🎓',
    rarity: 'epic',
    xpReward: 500,
  },
  {
    id: 'first_journal',
    name: 'The Journalist',
    description: 'Logged your first journal entry',
    icon: '📝',
    rarity: 'common',
    xpReward: 50,
  },
  {
    id: 'quiz_passer',
    name: 'Quiz Passer',
    description: 'Passed your first quiz with 70%+ score',
    icon: '✅',
    rarity: 'common',
    xpReward: 75,
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Passed 5 or more quizzes',
    icon: '🧠',
    rarity: 'rare',
    xpReward: 200,
  },
  {
    id: 'first_win',
    name: 'First Blood',
    description: 'Closed your first profitable trade',
    icon: '💰',
    rarity: 'common',
    xpReward: 100,
  },
  {
    id: 'ten_wins',
    name: 'On a Roll',
    description: 'Closed 10 profitable trades',
    icon: '🔥',
    rarity: 'rare',
    xpReward: 250,
  },
  {
    id: 'routine_trader',
    name: 'Routine Trader',
    description: 'Completed a full daily trading routine (pre-market + post-review)',
    icon: '⏰',
    rarity: 'common',
    xpReward: 75,
  },
  {
    id: 'backtest_pro',
    name: 'Backtest Pro',
    description: 'Ran your first strategy backtest',
    icon: '📊',
    rarity: 'rare',
    xpReward: 150,
  },
  {
    id: 'risk_master',
    name: 'Risk Master',
    description: 'Maintained ≤1% risk on 20 consecutive trades',
    icon: '🛡️',
    rarity: 'epic',
    xpReward: 300,
  },
  {
    id: 'discipline_king',
    name: 'Iron Discipline',
    description: '7-day streak of following all prop firm rules',
    icon: '👑',
    rarity: 'legendary',
    xpReward: 1000,
  },
  {
    id: 'profitable_week',
    name: 'Green Week',
    description: 'Finished a week with positive P&L',
    icon: '📈',
    rarity: 'rare',
    xpReward: 200,
  },
  {
    id: 'mentor_chat',
    name: 'Always Learning',
    description: 'Asked the AI mentor 10 questions',
    icon: '🤖',
    rarity: 'common',
    xpReward: 50,
  },
  {
    id: 'journal_streak',
    name: 'Journal Streak',
    description: 'Journaled 5 days in a row',
    icon: '🗓️',
    rarity: 'rare',
    xpReward: 200,
  },
  {
    id: 'prop_firm_ready',
    name: 'Prop Firm Ready',
    description: 'Completed all modules and maintained positive P&L',
    icon: '🏆',
    rarity: 'legendary',
    xpReward: 2000,
  },
]

export const LEVELS = [
  { level: 1, name: 'Rookie', minXP: 0, color: '#94a3b8' },
  { level: 2, name: 'Learner', minXP: 500, color: '#3b82f6' },
  { level: 3, name: 'Apprentice', minXP: 1000, color: '#3b82f6' },
  { level: 4, name: 'Trader', minXP: 1500, color: '#00d4aa' },
  { level: 5, name: 'Advanced Trader', minXP: 2000, color: '#00d4aa' },
  { level: 6, name: 'Pro Trader', minXP: 3000, color: '#f59e0b' },
  { level: 7, name: 'Expert', minXP: 4000, color: '#f59e0b' },
  { level: 8, name: 'Master', minXP: 5500, color: '#a855f7' },
  { level: 9, name: 'Elite', minXP: 7000, color: '#a855f7' },
  { level: 10, name: 'Prop Firm Pro', minXP: 10000, color: '#ff4757' },
]

export function getLevelInfo(xp: number) {
  let currentLevel = LEVELS[0]
  let nextLevel = LEVELS[1]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      currentLevel = LEVELS[i]
      nextLevel = LEVELS[i + 1] || LEVELS[i]
      break
    }
  }
  const progress = nextLevel !== currentLevel
    ? ((xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100
    : 100
  return { currentLevel, nextLevel, progress: Math.min(100, progress) }
}
