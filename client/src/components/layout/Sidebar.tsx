import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, TrendingUp, BarChart2,
  BookMarked, Brain, MessageCircle, Settings2, Trophy,
  Calendar, Zap, ChevronLeft, ChevronRight, Cpu, Activity
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { getLevelInfo } from '../../data/badges'

const NAV = [
  { to: '/',            label: 'COMMAND CENTER', icon: LayoutDashboard, group: 'main' },
  { to: '/ai-fund',     label: 'AI FUND',         icon: Activity,        group: 'main' },
  { to: '/curriculum',  label: 'NEURAL TRAINING', icon: BookOpen,        group: 'main' },
  { to: '/simulator',   label: 'TRADE SIMULATOR', icon: TrendingUp,      group: 'main' },
  { to: '/analytics',   label: 'ANALYTICS',       icon: BarChart2,       group: 'data' },
  { to: '/journal',     label: 'TRADE JOURNAL',   icon: BookMarked,      group: 'data' },
  { to: '/quiz',        label: 'KNOWLEDGE OPS',   icon: Brain,           group: 'data' },
  { to: '/mentor',      label: 'AI MENTOR',       icon: MessageCircle,   group: 'ai'   },
  { to: '/strategy',    label: 'STRATEGY LAB',    icon: Settings2,       group: 'ai'   },
  { to: '/routine',     label: 'DAILY ROUTINE',   icon: Calendar,        group: 'ops'  },
  { to: '/gamification',label: 'ACHIEVEMENTS',    icon: Trophy,          group: 'ops'  },
]

const GROUP_LABELS: Record<string, string> = {
  main: 'CORE',
  data: 'ANALYTICS',
  ai:   'AI SYSTEMS',
  ops:  'OPS',
}

export default function Sidebar() {
  const { profile, sidebarOpen, setSidebarOpen } = useAppStore()
  const levelInfo = profile ? getLevelInfo(profile.xp) : null
  const groups = ['main', 'data', 'ai', 'ops']

  return (
    <aside
      className={`flex flex-col bg-bg-secondary border-r border-border-dim transition-all duration-300 h-screen sticky top-0 z-30 ${sidebarOpen ? 'w-56' : 'w-14'}`}
      style={{ backgroundImage: 'linear-gradient(180deg, #03101f 0%, #020817 100%)' }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-border-dim ${!sidebarOpen && 'justify-center px-0'}`}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center"
             style={{ boxShadow: '0 0 12px rgba(0,229,255,0.2)' }}>
          <Cpu size={15} className="text-cyber-cyan" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <div className="text-xs font-bold tracking-widest text-cyber-cyan font-hud">TRADEROS</div>
            <div className="text-[9px] tracking-widest text-slate-600 font-hud">EUR/USD SYSTEM v1.0</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {groups.map((group) => {
          const items = NAV.filter((n) => n.group === group)
          return (
            <div key={group} className="mb-1">
              {sidebarOpen && (
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[8px] tracking-[0.2em] text-slate-600 font-hud">{GROUP_LABELS[group]}</span>
                </div>
              )}
              {items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-2 mx-2 rounded-lg text-sm transition-all duration-150 group relative
                    ${sidebarOpen ? 'px-3' : 'justify-center px-0 mx-1'}
                    ${isActive
                      ? 'bg-cyber-cyan/8 text-cyber-cyan border border-cyber-cyan/20'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-bg-elevated border border-transparent'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-cyber-cyan rounded-full"
                              style={{ boxShadow: '0 0 6px #00e5ff' }} />
                      )}
                      <Icon size={15} className="flex-shrink-0" />
                      {sidebarOpen && (
                        <span className="text-[10px] font-bold tracking-wider font-hud truncate">{label}</span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      {/* XP Bar */}
      {sidebarOpen && profile && levelInfo && (
        <div className="px-4 py-3 border-t border-border-dim">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap size={10} className="text-xp" />
              <span className="text-[9px] font-bold tracking-widest text-xp font-hud">{levelInfo.currentLevel.name}</span>
            </div>
            <span className="text-[9px] text-slate-600 font-mono">LV.{levelInfo.currentLevel.level}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill bg-xp" style={{ width: `${levelInfo.progress}%`, boxShadow: '0 0 8px #8b5cf6' }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-slate-600 font-mono">{profile.xp} XP</span>
            <span className="text-[8px] text-slate-600 font-mono">{levelInfo.nextLevel.minXP} XP</span>
          </div>
        </div>
      )}

      {/* Collapse */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex items-center justify-center h-8 border-t border-border-dim text-slate-600 hover:text-cyber-cyan hover:bg-bg-elevated transition-colors"
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </aside>
  )
}
