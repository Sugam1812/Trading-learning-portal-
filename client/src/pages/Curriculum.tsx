import { useState } from 'react'
import { CheckCircle, Clock, ChevronRight, BookOpen, Lock, Star } from 'lucide-react'
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

  const difficultyColors = {
    Beginner: 'tag-bull',
    Intermediate: 'tag-gold',
    Advanced: 'tag-blue',
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] gap-4">
      {/* Left: Module & Lesson list */}
      <div className="w-72 flex-shrink-0 overflow-y-auto space-y-3">
        {curriculum.map((mod) => {
          const { done, total, pct } = moduleProgress(mod)
          const isSelected = selectedModule.id === mod.id

          return (
            <div
              key={mod.id}
              className={`card cursor-pointer transition-all ${isSelected ? 'border-accent-blue/50 bg-accent-blue/5' : 'hover:border-border'}`}
              onClick={() => { setSelectedModule(mod); setSelectedLesson(mod.lessons[0]) }}
            >
              <div className="flex items-start gap-3 mb-2">
                <span className="text-xl">{mod.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-200 truncate">{mod.title}</div>
                  <span className={`tag text-[10px] mt-0.5 ${difficultyColors[mod.difficulty]}`}>
                    {mod.difficulty}
                  </span>
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0">{done}/{total}</span>
              </div>
              <div className="progress-bar mb-2">
                <div
                  className="progress-fill"
                  style={{ width: `${pct}%`, backgroundColor: mod.color }}
                />
              </div>

              {isSelected && (
                <div className="space-y-1 mt-3 border-t border-border-dim pt-3">
                  {mod.lessons.map((lesson) => {
                    const done = isLessonComplete(mod.id, lesson.id)
                    const isCurrentLesson = selectedLesson.id === lesson.id

                    return (
                      <button
                        key={lesson.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedLesson(lesson) }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
                          isCurrentLesson ? 'bg-accent-blue/15 text-accent-blue' : 'hover:bg-bg-elevated text-slate-400'
                        }`}
                      >
                        {done ? (
                          <CheckCircle size={12} className="text-bull flex-shrink-0" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-border flex-shrink-0" />
                        )}
                        <span className="text-xs truncate">{lesson.title}</span>
                        <span className="ml-auto text-[10px] text-slate-600 flex-shrink-0">{lesson.duration}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Right: Lesson content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Lesson header */}
        <div className="card mb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{selectedModule.icon}</span>
                <span className="text-xs text-slate-500">{selectedModule.title}</span>
                <ChevronRight size={12} className="text-slate-600" />
                <span className="text-xs text-slate-500">{selectedLesson.title}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100">{selectedLesson.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={11} />
                  {selectedLesson.duration}
                </div>
                <span className={`tag text-[10px] ${difficultyColors[selectedModule.difficulty]}`}>
                  {selectedModule.difficulty}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {isLessonComplete(selectedModule.id, selectedLesson.id) ? (
                <div className="flex items-center gap-1.5 text-bull text-sm font-semibold">
                  <CheckCircle size={16} />
                  Completed
                </div>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <Star size={14} />
                  {completing ? 'Saving...' : 'Mark Complete (+20 XP)'}
                </button>
              )}
            </div>
          </div>

          {/* Key points */}
          {selectedLesson.keyPoints.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-dim">
              <div className="text-xs font-semibold text-slate-400 mb-2">Key Points</div>
              <div className="flex flex-wrap gap-2">
                {selectedLesson.keyPoints.map((kp) => (
                  <span key={kp} className="text-xs bg-bg-elevated border border-border-dim text-slate-300 px-2.5 py-1 rounded-full">
                    {kp}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lesson content */}
        <div className="flex-1 overflow-y-auto card">
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
