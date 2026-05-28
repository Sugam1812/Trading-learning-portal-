import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, TrendingUp, BarChart2,
  BookMarked, Brain, MessageCircle, Settings2, Trophy,
  Calendar, Zap, ChevronLeft, ChevronRight, Target
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { getLevelInfo } from '../../data/badges'
import clsx from 'clsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/curriculum', label: 'Curriculum', icon: BookOpen },
  { to: '/simulator', label: 'Simulator', icon: TrendingUp },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/journal', label: 'Journal', icon: BookMarked },
  { to: '/quiz', label: 'Quizzes', icon: Brain },
  { to: '/mentor', label: 'AI Mentor', icon: MessageCircle },
  { to: '/strategy', label: 'Strategy Lab', icon: Settings2 },
  { to: '/routine', label: 'Daily Routine', icon: Calendar },
  { to: '/gamification', label: 'Progress', icon: Trophy },
]

export default function Sidebar() {
  const { profile, sidebarOpen, setSidebarOpen } = useAppStore()
  const levelInfo = profile ? getLevelInfo(profile.xp) : null

  return (
    <aside
      className={clsx(
        'flex flex-col bg-bg-secondary border-r border-border-dim transition-all duration-300 h-screen sticky top-0 z-30',
        sidebarOpen ? 'w-56' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className={clsx('flex items-center gap-3 px-4 py-5 border-b border-border-dim', !sidebarOpen && 'justify-center px-0')}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-blue flex items-center justify-center">
          <Target size={16} className="text-white" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-100 truncate">TraderPro</div>
            <div className="text-[10px] text-slate-500 truncate">EUR/USD Training</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all duration-150 group',
                sidebarOpen ? '' : 'justify-center px-0 mx-1',
                isActive
                  ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-bg-elevated'
              )
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="font-medium truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* XP Bar */}
      {sidebarOpen && profile && levelInfo && (
        <div className="px-4 py-3 border-t border-border-dim">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-xp" />
              <span className="text-xs font-semibold text-xp">{levelInfo.currentLevel.name}</span>
            </div>
            <span className="text-[10px] text-slate-500">Lv.{levelInfo.currentLevel.level}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill bg-xp"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-500">{profile.xp} XP</span>
            <span className="text-[10px] text-slate-500">{levelInfo.nextLevel.minXP} XP</span>
          </div>
        </div>
      )}

      {/* Collapse button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex items-center justify-center h-10 border-t border-border-dim text-slate-500 hover:text-slate-200 hover:bg-bg-elevated transition-colors"
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </aside>
  )
}
