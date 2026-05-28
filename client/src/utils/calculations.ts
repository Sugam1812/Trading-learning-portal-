export function calcLotSize(accountBalance: number, riskPercent: number, stopLossPips: number): number {
  const riskAmount = (riskPercent / 100) * accountBalance
  const lotSize = riskAmount / (stopLossPips * 10)
  return Math.round(lotSize * 100) / 100
}

export function calcSLPips(entryPrice: number, stopLoss: number): number {
  return Math.abs(entryPrice - stopLoss) * 10000
}

export function calcPips(entryPrice: number, exitPrice: number, direction: 'buy' | 'sell'): number {
  return direction === 'buy'
    ? (exitPrice - entryPrice) * 10000
    : (entryPrice - exitPrice) * 10000
}

export function calcRR(entryPrice: number, stopLoss: number, takeProfit: number): number {
  const risk = Math.abs(entryPrice - stopLoss)
  const reward = Math.abs(takeProfit - entryPrice)
  return risk > 0 ? reward / risk : 0
}

export function formatPrice(price: number): string {
  return price.toFixed(5)
}

export function formatPips(pips: number): string {
  return `${pips >= 0 ? '+' : ''}${pips.toFixed(1)} pips`
}

export function formatPnL(pnl: number): string {
  return `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`
}

export function getLevelInfo(xp: number) {
  const LEVELS = [
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

export function getCurrentSession(): string {
  const hour = new Date().getUTCHours()
  if (hour >= 0 && hour < 7) return 'Asian Session'
  if (hour >= 7 && hour < 9) return 'Pre-London'
  if (hour >= 9 && hour < 12) return 'London Session'
  if (hour >= 12 && hour < 17) return 'London/NY Overlap'
  if (hour >= 17 && hour < 21) return 'New York Session'
  return 'Off Hours'
}
