import { useEffect, useState } from 'react'
import { Trophy, Zap, Star, Lock, Shield } from 'lucide-react'
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

  const rarityStyle: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    common:    { border: '#1a3a5c', bg: '#071528', text: '#64748b', glow: 'transparent' },
    rare:      { border: '#00e5ff30', bg: '#00e5ff08', text: '#00e5ff', glow: 'rgba(0,229,255,0.06)' },
    epic:      { border: '#8b5cf630', bg: '#8b5cf608', text: '#8b5cf6', glow: 'rgba(139,92,246,0.06)' },
    legendary: { border: '#ffd70040', bg: '#ffd70008', text: '#ffd700', glow: 'rgba(255,215,0,0.08)' },
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Trophy size={14} className="text-gold" style={{ filter: 'drop-shadow(0 0 6px #ffd700)' }} />
        <h1 className="text-sm font-bold tracking-widest text-slate-200 font-hud">ACHIEVEMENTS & PROGRESSION</h1>
      </div>

      {/* Level Card */}
      {profile && levelInfo && (
        <div className="card-cyber relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-xp/40 to-transparent" />
          <div className="absolute inset-0 opacity-10"
               style={{ background: `radial-gradient(circle at 80% 50%, ${levelInfo.currentLevel.color}20, transparent 60%)` }} />
          <div className="relative flex items-center gap-6">
            <div className="flex-shrink-0 text-center">
              <div className="text-5xl font-black font-hud"
                   style={{ color: levelInfo.currentLevel.color, textShadow: `0 0 20px ${levelInfo.currentLevel.color}60` }}>
                {levelInfo.currentLevel.level}
              </div>
              <div className="hud-label">LEVEL</div>
            </div>
            <div className="flex-1">
              <div className="text-base font-bold text-slate-100 font-hud tracking-wider mb-0.5">{levelInfo.currentLevel.name.toUpperCase()}</div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mb-3">
                <Zap size={10} className="text-xp" />
                {profile.xp.toLocaleString()} XP total
              </div>
              <div className="progress-bar mb-1">
                <div className="progress-fill bg-xp" style={{ width: `${levelInfo.progress}%`, boxShadow: '0 0 8px rgba(139,92,246,0.5)' }} />
              </div>
              <div className="flex justify-between text-[8px] text-slate-600 font-mono mt-1">
                <span>{levelInfo.currentLevel.minXP.toLocaleString()} XP</span>
                <span>{Math.round(levelInfo.progress)}% → {levelInfo.nextLevel.name.toUpperCase()}</span>
                <span>{levelInfo.nextLevel.minXP.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level Progression */}
      <div className="card-cyber">
        <div className="panel-header">
          <Star size={12} className="text-gold" />
          <span className="panel-title">LEVEL PROGRESSION</span>
        </div>
        <div className="space-y-1.5">
          {LEVELS.map((lv) => {
            const isCurrent = levelInfo?.currentLevel.level === lv.level
            const isDone = (profile?.xp || 0) >= lv.minXP
            return (
              <div
                key={lv.level}
                className={`flex items-center gap-3 px-3 py-2 rounded transition-all ${
                  isCurrent ? 'border border-xp/30 bg-xp/5' : isDone ? 'bg-bg-elevated' : 'opacity-40'
                }`}
                style={isCurrent ? { boxShadow: '0 0 8px rgba(139,92,246,0.08)' } : {}}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 font-mono"
                     style={{ backgroundColor: isDone ? lv.color + '20' : undefined, color: isDone ? lv.color : '#475569', border: `1px solid ${isDone ? lv.color + '40' : '#1a3a5c'}` }}>
                  {lv.level}
                </div>
                <div className="flex-1">
                  <div className={`text-[10px] font-bold font-hud tracking-wider ${isDone ? 'text-slate-300' : 'text-slate-700'}`}>{lv.name.toUpperCase()}</div>
                  <div className="text-[8px] text-slate-600 font-mono">{lv.minXP.toLocaleString()} XP</div>
                </div>
                {isCurrent && <span className="tag tag-xp text-[8px] font-hud tracking-wider">CURRENT</span>}
                {isDone && !isCurrent && <span className="text-[10px] text-bull" style={{ filter: 'drop-shadow(0 0 3px #00ff88)' }}>✓</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="card-cyber">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={12} className="text-gold" />
            <span className="panel-title">ACHIEVEMENT BADGES</span>
          </div>
          <span className="text-[9px] text-slate-600 font-mono">{earnedBadges.length} / {BADGES.length} EARNED</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BADGES.map((badge) => {
            const earned = earnedBadges.includes(badge.id)
            const style = rarityStyle[badge.rarity]
            return (
              <div
                key={badge.id}
                className={`relative p-3 rounded-xl border transition-all ${!earned ? 'opacity-40 grayscale' : ''}`}
                style={earned ? { borderColor: style.border, background: style.bg, boxShadow: `0 0 12px ${style.glow}` } : { borderColor: '#0a1f3a', background: '#040e1c' }}
              >
                <div className="text-2xl mb-1.5">{earned ? badge.icon : '🔒'}</div>
                <div className="text-[10px] font-bold text-slate-200 font-hud tracking-wider mb-0.5">{badge.name.toUpperCase()}</div>
                <div className="text-[8px] text-slate-600 leading-relaxed font-mono mb-2">{badge.description}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: earned ? style.text : '#475569' }}>
                    {badge.rarity}
                  </span>
                  <span className="text-[8px] text-xp flex items-center gap-0.5 font-mono">
                    <Zap size={8} />{badge.xpReward}
                  </span>
                </div>
                {!earned && (
                  <div className="absolute top-2 right-2">
                    <Lock size={10} className="text-slate-700" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* XP Guide */}
      <div className="card-cyber">
        <div className="panel-header">
          <Shield size={12} className="text-cyber-cyan" />
          <span className="panel-title">XP REWARD TABLE</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
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
            { action: 'Earn a badge', xp: '+50–2000 XP' },
          ].map(({ action, xp }) => (
            <div key={action} className="flex items-center justify-between text-[9px] p-2 bg-bg-elevated rounded border border-border-dim">
              <span className="text-slate-500 font-mono">{action}</span>
              <span className="text-xp font-bold font-mono" style={{ textShadow: '0 0 6px rgba(139,92,246,0.3)' }}>{xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
