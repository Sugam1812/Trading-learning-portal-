import { useEffect, useState } from 'react'
import { Trophy, Zap, Star, Lock } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { BADGES, LEVELS, getLevelInfo } from '../data/badges'
import axios from 'axios'

export default function Gamification() {
  const { profile, setProfile } = useAppStore()
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])

  useEffect(() => {
    axios.get('/api/progress/profile').then((r) => {
      setProfile(r.data)
      setEarnedBadges(r.data.badges?.map((b: any) => b.badge_id) || [])
    }).catch(() => {})
  }, [])

  const levelInfo = profile ? getLevelInfo(profile.xp) : null

  const rarityColors = {
    common: 'border-slate-600 bg-slate-800/50',
    rare: 'border-accent-blue/50 bg-accent-blue/10',
    epic: 'border-xp/50 bg-xp/10',
    legendary: 'border-gold/50 bg-gold/10',
  }
  const rarityLabels = {
    common: 'text-slate-400',
    rare: 'text-accent-blue',
    epic: 'text-xp',
    legendary: 'text-gold',
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        <Trophy size={20} className="text-gold" />
        Achievements & Progress
      </h1>

      {/* Level card */}
      {profile && levelInfo && (
        <div className="card bg-gradient-to-r from-xp/10 to-accent-blue/10 border-xp/20">
          <div className="flex items-center gap-5">
            <div className="flex-shrink-0 text-center">
              <div className="text-5xl font-black text-xp">{levelInfo.currentLevel.level}</div>
              <div className="text-xs text-slate-400">Level</div>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-slate-100 mb-0.5">{levelInfo.currentLevel.name}</div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <Zap size={11} className="text-xp" />
                {profile.xp.toLocaleString()} XP total
              </div>
              <div className="progress-bar mb-1">
                <div className="progress-fill bg-xp" style={{ width: `${levelInfo.progress}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{levelInfo.currentLevel.minXP.toLocaleString()} XP</span>
                <span>{Math.round(levelInfo.progress)}% to {levelInfo.nextLevel.name}</span>
                <span>{levelInfo.nextLevel.minXP.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level progression */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Star size={14} className="text-gold" />
          Level Progression
        </h3>
        <div className="space-y-2">
          {LEVELS.map((lv) => {
            const isCurrent = levelInfo?.currentLevel.level === lv.level
            const isDone = (profile?.xp || 0) >= lv.minXP
            return (
              <div
                key={lv.level}
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                  isCurrent ? 'bg-xp/10 border border-xp/30' :
                  isDone ? 'bg-bg-elevated' : 'opacity-40'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: isDone ? lv.color + '30' : undefined, color: isDone ? lv.color : '#475569', border: `1px solid ${isDone ? lv.color + '60' : '#334155'}` }}
                >
                  {lv.level}
                </div>
                <div className="flex-1">
                  <div className={`text-xs font-semibold ${isDone ? 'text-slate-200' : 'text-slate-600'}`}>{lv.name}</div>
                  <div className="text-[10px] text-slate-500">{lv.minXP.toLocaleString()} XP required</div>
                </div>
                {isCurrent && <span className="text-[10px] tag tag-xp">Current</span>}
                {isDone && !isCurrent && <span className="text-[10px] text-bull">✓</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Trophy size={14} className="text-gold" />
            Badges
          </h3>
          <span className="text-xs text-slate-500">{earnedBadges.length} / {BADGES.length} earned</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BADGES.map((badge) => {
            const earned = earnedBadges.includes(badge.id)
            return (
              <div
                key={badge.id}
                className={`relative p-3 rounded-xl border transition-all ${
                  earned ? rarityColors[badge.rarity] : 'border-border-dim opacity-40 grayscale'
                }`}
              >
                <div className="text-2xl mb-2">{earned ? badge.icon : '🔒'}</div>
                <div className="text-xs font-semibold text-slate-200 mb-0.5">{badge.name}</div>
                <div className="text-[10px] text-slate-500 leading-relaxed mb-2">{badge.description}</div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold capitalize ${earned ? rarityLabels[badge.rarity] : 'text-slate-600'}`}>
                    {badge.rarity}
                  </span>
                  <span className="text-[10px] text-xp flex items-center gap-0.5">
                    <Zap size={9} />{badge.xpReward} XP
                  </span>
                </div>
                {!earned && (
                  <div className="absolute top-2 right-2">
                    <Lock size={11} className="text-slate-600" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* How to earn XP */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">How to Earn XP</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { action: 'Complete a lesson', xp: '+20 XP' },
            { action: 'Pass a quiz', xp: '+50-100 XP' },
            { action: 'Open a trade', xp: '+5 XP' },
            { action: 'Close a winning trade', xp: '+25 XP' },
            { action: 'Close a losing trade', xp: '+10 XP' },
            { action: 'Write journal entry', xp: '+15 XP' },
            { action: 'Pre-market routine', xp: '+10 XP' },
            { action: 'Post-trade review', xp: '+15 XP' },
            { action: 'Run a backtest', xp: '+30 XP' },
            { action: 'Earn a badge', xp: '+50-2000 XP' },
          ].map(({ action, xp }) => (
            <div key={action} className="flex items-center justify-between text-xs p-2 bg-bg-elevated rounded-lg">
              <span className="text-slate-400">{action}</span>
              <span className="text-xp font-semibold">{xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
