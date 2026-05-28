import { useState } from 'react'
import { CheckCircle, XCircle, ChevronRight, Trophy, RotateCcw, Brain, Zap } from 'lucide-react'
import { Quiz } from '../../data/quizzes'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Props {
  quiz: Quiz
  onComplete: (score: number, total: number, passed: boolean) => void
  onClose: () => void
}

export default function QuizEngine({ quiz, onComplete, onClose }: Props) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const question = quiz.questions[current]
  const isLast = current === quiz.questions.length - 1
  const passed = score >= Math.ceil(quiz.questions.length * 0.7)

  const handleSelect = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    setShowExplanation(true)
  }

  const handleNext = () => {
    const newAnswers = [...answers, selected ?? -1]
    setAnswers(newAnswers)
    if (isLast) finishQuiz(newAnswers)
    else { setCurrent((c) => c + 1); setSelected(null); setShowExplanation(false) }
  }

  const finishQuiz = async (finalAnswers: number[]) => {
    const finalScore = finalAnswers.reduce((s, a, i) => s + (a === quiz.questions[i].correctIndex ? 1 : 0), 0)
    setScore(finalScore)
    setFinished(true)
    setSubmitting(true)
    try {
      const res = await axios.post('/api/progress/quizzes', {
        module_id: quiz.moduleId, quiz_id: quiz.id,
        score: finalScore, total: quiz.questions.length, answers: finalAnswers,
      })
      if (res.data.passed) toast.success(`Quiz passed! +${res.data.xp_gained} XP`, { duration: 3000 })
      else toast(`Score: ${finalScore}/${quiz.questions.length}. Need 70% to pass.`)
      onComplete(finalScore, quiz.questions.length, res.data.passed)
    } catch {
      toast.error('Failed to save quiz result')
    } finally {
      setSubmitting(false)
    }
  }

  const restart = () => {
    setCurrent(0); setSelected(null); setAnswers([])
    setShowExplanation(false); setFinished(false); setScore(0)
  }

  if (finished) {
    const pct = Math.round((score / quiz.questions.length) * 100)
    return (
      <div className="flex flex-col items-center py-6 px-4 text-center animate-fade-in">
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 border ${
          passed ? 'bg-bull/10 border-bull/30' : 'bg-bear/10 border-bear/30'
        }`} style={{ boxShadow: passed ? '0 0 20px rgba(0,255,136,0.1)' : '0 0 20px rgba(255,51,85,0.1)' }}>
          <span className="text-3xl">{passed ? '🏆' : '📚'}</span>
        </div>
        <div className="hud-label mb-1">{passed ? 'MODULE CLEARED' : 'INSUFFICIENT SCORE'}</div>
        <div className={`text-5xl font-black font-mono mb-1 tabular-nums ${passed ? 'text-bull' : 'text-bear'}`}
             style={{ textShadow: passed ? '0 0 20px rgba(0,255,136,0.3)' : '0 0 20px rgba(255,51,85,0.3)' }}>
          {pct}%
        </div>
        <p className="text-[10px] text-slate-500 font-mono mb-1">{score} of {quiz.questions.length} correct</p>
        <p className="text-[9px] text-slate-600 font-hud tracking-wider mb-5">
          {passed ? 'EXCELLENT — PROCEED TO NEXT MODULE' : 'NEED 70% TO PASS — REVIEW AND RETRY'}
        </p>

        <div className="w-full space-y-1.5 mb-5">
          {quiz.questions.map((q, i) => (
            <div key={i} className={`flex items-start gap-2 p-2.5 rounded border text-left ${
              answers[i] === q.correctIndex ? 'border-bull/20 bg-bull/5' : 'border-bear/20 bg-bear/5'
            }`}>
              {answers[i] === q.correctIndex
                ? <CheckCircle size={12} className="text-bull mt-0.5 flex-shrink-0" />
                : <XCircle size={12} className="text-bear mt-0.5 flex-shrink-0" />}
              <div>
                <p className="text-[10px] text-slate-300 font-mono leading-relaxed">{q.question}</p>
                {answers[i] !== q.correctIndex && (
                  <p className="text-[9px] text-bull mt-1 font-hud tracking-wider">✓ {q.options[q.correctIndex]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={restart} className="btn-ghost flex items-center gap-1.5 text-[9px] tracking-widest font-hud py-1.5 px-3">
            <RotateCcw size={11} />
            RETRY
          </button>
          <button onClick={onClose} className="btn-primary flex items-center gap-1.5 text-[9px] tracking-widest font-hud py-1.5 px-3">
            <Zap size={11} />
            CONTINUE
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain size={12} className="text-xp" />
          <span className="hud-label">{quiz.title.toUpperCase()}</span>
        </div>
        <span className="text-[9px] font-mono text-slate-500 tabular-nums">{current + 1} / {quiz.questions.length}</span>
      </div>
      <div className="progress-bar mb-5">
        <div className="progress-fill bg-xp" style={{ width: `${(current / quiz.questions.length) * 100}%`, boxShadow: '0 0 6px rgba(139,92,246,0.4)' }} />
      </div>

      <h3 className="text-sm font-semibold text-slate-100 mb-4 leading-relaxed">{question.question}</h3>

      <div className="space-y-2 mb-4">
        {question.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = i === question.correctIndex
          const showResult = selected !== null

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={`w-full text-left p-3 rounded-lg border text-xs transition-all duration-200 ${
                showResult
                  ? isCorrect
                    ? 'border-bull/50 bg-bull/10 text-bull'
                    : isSelected && !isCorrect
                    ? 'border-bear/50 bg-bear/10 text-bear'
                    : 'border-border-dim text-slate-600'
                  : 'border-border-dim hover:border-cyber-cyan/30 hover:bg-bg-elevated text-slate-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 text-[9px] font-bold font-hud ${
                  showResult && isCorrect ? 'border-bull bg-bull/20 text-bull' :
                  showResult && isSelected ? 'border-bear bg-bear/20 text-bear' :
                  'border-border text-slate-500'
                }`}>
                  {showResult && isCorrect ? <CheckCircle size={10} /> :
                   showResult && isSelected ? <XCircle size={10} /> :
                   String.fromCharCode(65 + i)}
                </div>
                <span className="leading-relaxed">{opt}</span>
              </div>
            </button>
          )
        })}
      </div>

      {showExplanation && (
        <div className="bg-bg-elevated border border-cyber-cyan/20 rounded-lg p-3 mb-4 animate-fade-in">
          <div className="hud-label text-cyber-cyan/80 mb-1.5">EXPLANATION</div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">{question.explanation}</p>
        </div>
      )}

      {selected !== null && (
        <button onClick={handleNext} className="w-full btn-primary flex items-center justify-center gap-2 text-[9px] tracking-widest font-hud">
          {isLast ? (
            <><Trophy size={12} />FINISH QUIZ</>
          ) : (
            <>NEXT QUESTION<ChevronRight size={12} /></>
          )}
        </button>
      )}
    </div>
  )
}
