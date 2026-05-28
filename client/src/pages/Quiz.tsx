import { useState } from 'react'
import { Brain, CheckCircle, Lock, Trophy, ChevronRight } from 'lucide-react'
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
      <div className="max-w-xl mx-auto">
        <div className="card">
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
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Brain size={20} className="text-xp" />
          Knowledge Quizzes
        </h1>
        <p className="text-sm text-slate-500 mt-1">Test your understanding. Pass with 70% to earn XP and badges.</p>
      </div>

      <div className="space-y-3">
        {quizzes.map((quiz) => {
          const mod = curriculum.find((m) => m.id === quiz.moduleId)
          const unlocked = isModuleUnlocked(quiz.moduleId)
          const result = results[quiz.id]

          return (
            <div
              key={quiz.id}
              className={`card flex items-center gap-4 transition-all ${
                unlocked ? 'hover:border-border cursor-pointer' : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => unlocked && setActiveQuiz(quiz)}
            >
              <div className="text-3xl flex-shrink-0">{mod?.icon || '📝'}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-200">{quiz.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{quiz.questions.length} questions • 70% to pass</div>
                <div className="text-[10px] text-slate-600 mt-1">Module: {mod?.title}</div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {result ? (
                  <div className="text-right">
                    <div className={`text-sm font-bold ${result.passed ? 'text-bull' : 'text-bear'}`}>
                      {Math.round((result.score / result.total) * 100)}%
                    </div>
                    <div className={`text-[10px] ${result.passed ? 'text-bull' : 'text-bear'}`}>
                      {result.passed ? 'Passed' : 'Failed'}
                    </div>
                  </div>
                ) : null}

                {!unlocked ? (
                  <Lock size={16} className="text-slate-600" />
                ) : result?.passed ? (
                  <CheckCircle size={18} className="text-bull" />
                ) : (
                  <ChevronRight size={18} className="text-slate-500" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="card bg-gold/5 border-gold/20">
        <div className="flex items-start gap-3">
          <Trophy size={16} className="text-gold mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-slate-200 mb-1">How to Unlock Quizzes</div>
            <p className="text-xs text-slate-400">
              Complete at least half the lessons in a module to unlock its quiz. Each passed quiz earns 50+ XP and contributes toward badges.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
