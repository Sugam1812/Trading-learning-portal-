import { useState } from 'react'
import { Brain, CheckCircle, Lock, Trophy, ChevronRight, Zap } from 'lucide-react'
import { quizzes } from '../data/quizzes'
import { curriculum } from '../data/curriculum'
import { useProgressStore } from '../store/useProgressStore'
import { useAppStore } from '../store/useAppStore'
import QuizEngine from '../components/quiz/QuizEngine'

export default function Quiz() {
  const [activeQuiz, setActiveQuiz] = useState<typeof quizzes[0] | null>(null)
  const [results, setResults] = useState<Record<string, { score: number; total: number; passed: boolean }>>({})
  const { completedLessons } = useProgressStore()
  const { addXP } = useAppStore()

  const isModuleUnlocked = (moduleId: string) => {
    const mod = curriculum.find((m) => m.id === moduleId)
    if (!mod) return false
    const completedInModule = completedLessons.filter((l) => l.module_id === moduleId).length
    return completedInModule >= Math.floor(mod.lessons.length / 2)
  }

  const handleComplete = (quizId: string, score: number, total: number, passed: boolean) => {
    setResults((prev) => ({ ...prev, [quizId]: { score, total, passed } }))
    if (passed) addXP(50 + score * 5)
    setTimeout(() => setActiveQuiz(null), 2000)
  }

  if (activeQuiz) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="card-cyber">
          <QuizEngine
            quiz={activeQuiz}
            onComplete={(score, total, passed) => handleComplete(activeQuiz.id, score, total, passed)}
            onClose={() => setActiveQuiz(null)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain size={14} className="text-xp" style={{ filter: 'drop-shadow(0 0 6px #8b5cf6)' }} />
        <h1 className="text-sm font-bold tracking-widest text-slate-200 font-hud">KNOWLEDGE OPS — QUIZ MODULES</h1>
      </div>
      <p className="text-[10px] text-slate-600 font-mono -mt-2">Pass with 70% to earn XP and unlock achievement badges.</p>

      <div className="space-y-2">
        {quizzes.map((quiz) => {
          const mod = curriculum.find((m) => m.id === quiz.moduleId)
          const unlocked = isModuleUnlocked(quiz.moduleId)
          const result = results[quiz.id]

          return (
            <div
              key={quiz.id}
              className={`card-cyber flex items-center gap-4 transition-all ${
                unlocked ? 'cursor-pointer hover:border-cyber-cyan/30' : 'opacity-50 cursor-not-allowed'
              }`}
              style={unlocked ? {} : {}}
              onClick={() => unlocked && setActiveQuiz(quiz)}
            >
              <span className="text-2xl flex-shrink-0">{mod?.icon || '📝'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold tracking-wider text-slate-300 font-hud">{quiz.title.toUpperCase()}</div>
                <div className="text-[9px] text-slate-600 font-mono mt-0.5">{quiz.questions.length} QUESTIONS · 70% TO PASS</div>
                <div className="text-[9px] text-slate-700 font-hud tracking-wider mt-0.5">MODULE: {mod?.title.toUpperCase()}</div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {result && (
                  <div className="text-right">
                    <div className={`text-sm font-bold font-mono tabular-nums ${result.passed ? 'text-bull' : 'text-bear'}`}
                         style={{ textShadow: result.passed ? '0 0 8px rgba(0,255,136,0.3)' : '0 0 8px rgba(255,51,85,0.3)' }}>
                      {Math.round((result.score / result.total) * 100)}%
                    </div>
                    <div className={`text-[9px] font-hud tracking-wider ${result.passed ? 'text-bull' : 'text-bear'}`}>
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </div>
                  </div>
                )}
                {!unlocked ? (
                  <Lock size={14} className="text-slate-600" />
                ) : result?.passed ? (
                  <CheckCircle size={16} className="text-bull" style={{ filter: 'drop-shadow(0 0 4px #00ff88)' }} />
                ) : (
                  <ChevronRight size={14} className="text-slate-500" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Info panel */}
      <div className="card-cyber border-xp/20" style={{ boxShadow: '0 0 12px rgba(139,92,246,0.05)' }}>
        <div className="flex items-start gap-3">
          <Trophy size={14} className="text-gold mt-0.5 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 4px #ffd700)' }} />
          <div>
            <div className="hud-label mb-1">HOW TO UNLOCK QUIZZES</div>
            <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
              Complete at least half the lessons in a module to unlock its quiz. Passing earns{' '}
              <span className="text-xp">50+ XP</span> and contributes toward achievement badges.
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border-dim flex items-center gap-1.5">
          <Zap size={10} className="text-xp" />
          <span className="text-[9px] text-slate-600 font-hud tracking-wider">XP REWARDS: BASE 50 XP + 5 XP PER CORRECT ANSWER</span>
        </div>
      </div>
    </div>
  )
}
