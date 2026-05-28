import { useState } from 'react'
import { CheckCircle, Clock, ChevronRight, BookOpen, Star, Zap } from 'lucide-react'
import { curriculum } from '../data/curriculum'
import { useProgressStore } from '../store/useProgressStore'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAppStore } from '../store/useAppStore'

export default function Curriculum() {
  const { completedLessons, markLessonComplete, isLessonComplete } = useProgressStore()
  const { addXP } = useAppStore()
  const [selectedModule, setSelectedModule] = useState(curriculum[0])
  const [selectedLesson, setSelectedLesson] = useState(curriculum[0].lessons[0])
  const [completing, setCompleting] = useState(false)

  const moduleProgress = (mod: typeof curriculum[0]) => {
    const done = mod.lessons.filter((l) => isLessonComplete(mod.id, l.id)).length
    return { done, total: mod.lessons.length, pct: Math.round((done / mod.lessons.length) * 100) }
  }

  const handleComplete = async () => {
    if (isLessonComplete(selectedModule.id, selectedLesson.id)) return
    setCompleting(true)
    try {
      await axios.post('/api/progress/lessons/complete', {
        module_id: selectedModule.id,
        lesson_id: selectedLesson.id,
      })
      markLessonComplete(selectedModule.id, selectedLesson.id)
      addXP(20)
      toast.success('Lesson complete! +20 XP', { icon: '🎯' })
      const modLessons = selectedModule.lessons
      const currentIdx = modLessons.findIndex((l) => l.id === selectedLesson.id)
      if (currentIdx < modLessons.length - 1) {
        setSelectedLesson(modLessons[currentIdx + 1])
      } else {
        const modIdx = curriculum.findIndex((m) => m.id === selectedModule.id)
        if (modIdx < curriculum.length - 1) {
          setSelectedModule(curriculum[modIdx + 1])
          setSelectedLesson(curriculum[modIdx + 1].lessons[0])
        }
      }
    } catch {
      toast.error('Failed to save progress')
    } finally {
      setCompleting(false)
    }
  }

  const difficultyTag: Record<string, string> = {
    Beginner: 'tag-bull',
    Intermediate: 'tag-gold',
    Advanced: 'tag-blue',
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] gap-3">
      {/* Module list */}
      <div className="w-64 flex-shrink-0 overflow-y-auto space-y-2 pr-1">
        {curriculum.map((mod) => {
          const { done, total, pct } = moduleProgress(mod)
          const isSelected = selectedModule.id === mod.id

          return (
            <div
              key={mod.id}
              className={`rounded-xl border cursor-pointer transition-all overflow-hidden ${
                isSelected
                  ? 'border-cyber-cyan/30 bg-cyber-cyan/5'
                  : 'border-border-dim bg-bg-card hover:border-border'
              }`}
              style={isSelected ? { boxShadow: '0 0 12px rgba(0,229,255,0.06)' } : {}}
              onClick={() => { setSelectedModule(mod); setSelectedLesson(mod.lessons[0]) }}
            >
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{mod.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold tracking-wider text-slate-300 font-hud truncate">{mod.title.toUpperCase()}</div>
                    <span className={`tag text-[9px] mt-0.5 ${difficultyTag[mod.difficulty]}`}>{mod.difficulty}</span>
                  </div>
                  <span className="text-[9px] text-slate-600 font-mono flex-shrink-0">{done}/{total}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill transition-all" style={{ width: `${pct}%`, backgroundColor: mod.color, boxShadow: `0 0 4px ${mod.color}60` }} />
                </div>
              </div>

              {isSelected && (
                <div className="border-t border-border-dim px-2 pb-2 pt-1 space-y-0.5">
                  {mod.lessons.map((lesson) => {
                    const done = isLessonComplete(mod.id, lesson.id)
                    const isCurrent = selectedLesson.id === lesson.id
                    return (
                      <button
                        key={lesson.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedLesson(lesson) }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all ${
                          isCurrent
                            ? 'bg-cyber-cyan/10 border border-cyber-cyan/20'
                            : 'hover:bg-bg-elevated border border-transparent'
                        }`}
                      >
                        {done ? (
                          <CheckCircle size={10} className="text-bull flex-shrink-0" style={{ filter: 'drop-shadow(0 0 3px #00ff88)' }} />
                        ) : (
                          <div className={`w-2.5 h-2.5 rounded-full border flex-shrink-0 ${isCurrent ? 'border-cyber-cyan' : 'border-border'}`} />
                        )}
                        <span className={`text-[9px] font-hud tracking-wider truncate ${isCurrent ? 'text-cyber-cyan' : done ? 'text-slate-600' : 'text-slate-400'}`}>
                          {lesson.title.toUpperCase()}
                        </span>
                        <span className="ml-auto text-[8px] text-slate-700 font-mono flex-shrink-0">{lesson.duration}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lesson content */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Lesson header */}
        <div className="card-cyber flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen size={10} className="text-slate-600" />
                <span className="text-[9px] text-slate-600 font-hud tracking-wider">{selectedModule.title.toUpperCase()}</span>
                <ChevronRight size={9} className="text-slate-700" />
                <span className="text-[9px] text-slate-500 font-hud">{selectedLesson.title.toUpperCase()}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mb-2">{selectedLesson.title}</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono">
                  <Clock size={10} />
                  {selectedLesson.duration}
                </div>
                <span className={`tag text-[9px] ${difficultyTag[selectedModule.difficulty]}`}>
                  {selectedModule.difficulty}
                </span>
              </div>
            </div>
            <div>
              {isLessonComplete(selectedModule.id, selectedLesson.id) ? (
                <div className="flex items-center gap-1.5 text-bull text-xs font-bold font-hud tracking-wider">
                  <CheckCircle size={14} style={{ filter: 'drop-shadow(0 0 4px #00ff88)' }} />
                  COMPLETED
                </div>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="btn-primary text-[9px] tracking-widest font-hud flex items-center gap-1.5 py-1.5 px-3"
                >
                  <Zap size={11} />
                  {completing ? 'SAVING...' : 'MARK COMPLETE (+20 XP)'}
                </button>
              )}
            </div>
          </div>

          {selectedLesson.keyPoints.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border-dim">
              <div className="hud-label mb-2">KEY POINTS</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedLesson.keyPoints.map((kp) => (
                  <span key={kp} className="text-[9px] bg-bg-elevated border border-border-dim text-slate-400 px-2 py-1 rounded font-mono">
                    {kp}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto card-cyber">
          <div
            className="lesson-content prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: selectedLesson.content
                .replace(/^# (.*)/gm, '<h1>$1</h1>')
                .replace(/^## (.*)/gm, '<h2>$1</h2>')
                .replace(/^### (.*)/gm, '<h3>$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/^> (.*)/gm, '<blockquote>$1</blockquote>')
                .replace(/^- (.*)/gm, '<li>$1</li>')
                .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
                .replace(/<div class="([^"]+)">([\s\S]*?)<\/div>/g, '<div class="$1">$2</div>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/^(?!<[h1-6|ul|ol|li|div|block])(.+)/gm, '<p>$1</p>')
            }}
          />
        </div>
      </div>
    </div>
  )
}
