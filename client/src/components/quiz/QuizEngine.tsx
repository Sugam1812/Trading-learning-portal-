import { useState } from 'react'
import { CheckCircle, XCircle, ChevronRight, Trophy, RotateCcw, Brain } from 'lucide-react'
import { Quiz, QuizQuestion } from '../../data/quizzes'
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

    if (isLast) {
      finishQuiz(newAnswers)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
      setShowExplanation(false)
    }
  }

  const finishQuiz = async (finalAnswers: number[]) => {
    const finalScore = finalAnswers.reduce((s, a, i) => s + (a === quiz.questions[i].correctIndex ? 1 : 0), 0)
    setScore(finalScore)
    setFinished(true)
    setSubmitting(true)

    try {
      const res = await axios.post('/api/progress/quizzes', {
        module_id: quiz.moduleId,
        quiz_id: quiz.id,
        score: finalScore,
        total: quiz.questions.length,
        answers: finalAnswers,
      })
      if (res.data.passed) {
        toast.success(`Quiz passed! +${res.data.xp_gained} XP`, { duration: 3000 })
      } else {
        toast(`Score: ${finalScore}/${quiz.questions.length}. Need 70% to pass.`)
      }
      onComplete(finalScore, quiz.questions.length, res.data.passed)
    } catch {
      toast.error('Failed to save quiz result')
    } finally {
      setSubmitting(false)
    }
  }

  const restart = () => {
    setCurrent(0)
    setSelected(null)
    setAnswers([])
    setShowExplanation(false)
    setFinished(false)
    setScore(0)
  }

  if (finished) {
    const pct = Math.round((score / quiz.questions.length) * 100)
    return (
      <div className="flex flex-col items-center py-8 px-4 text-center animate-fade-in">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 text-4xl ${passed ? 'bg-bull/20' : 'bg-bear/20'}`}>
          {passed ? '🏆' : '📚'}
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-1">
          {passed ? 'Quiz Passed!' : 'Keep Studying'}
        </h3>
        <div className={`text-5xl font-black font-mono mb-2 ${passed ? 'text-bull' : 'text-bear'}`}>
          {pct}%
        </div>
        <p className="text-slate-400 text-sm mb-1">
          {score} out of {quiz.questions.length} correct
        </p>
        <p className="text-xs text-slate-500 mb-6">
          {passed ? 'Excellent work! Move to the next lesson.' : 'You need 70% to pass. Review the lesson and try again.'}
        </p>

        {/* Question review */}
        <div className="w-full space-y-2 mb-6">
          {quiz.questions.map((q, i) => (
            <div key={i} className={`flex items-start gap-2 p-3 rounded-lg border text-left ${
              answers[i] === q.correctIndex ? 'border-bull/20 bg-bull/5' : 'border-bear/20 bg-bear/5'
            }`}>
              {answers[i] === q.correctIndex
                ? <CheckCircle size={14} className="text-bull mt-0.5 flex-shrink-0" />
                : <XCircle size={14} className="text-bear mt-0.5 flex-shrink-0" />}
              <div>
                <p className="text-xs text-slate-300">{q.question}</p>
                {answers[i] !== q.correctIndex && (
                  <p className="text-[10px] text-bull mt-1">✓ {q.options[q.correctIndex]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={restart} className="btn-ghost flex items-center gap-2 text-sm">
            <RotateCcw size={14} />
            Try Again
          </button>
          <button onClick={onClose} className="btn-primary text-sm">
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-xp" />
          <span className="text-xs font-semibold text-slate-300">{quiz.title}</span>
        </div>
        <span className="text-xs text-slate-500">{current + 1} / {quiz.questions.length}</span>
      </div>
      <div className="progress-bar mb-5">
        <div
          className="progress-fill bg-xp"
          style={{ width: `${((current) / quiz.questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <h3 className="text-base font-semibold text-slate-100 mb-5 leading-relaxed">{question.question}</h3>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {question.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = i === question.correctIndex
          const showResult = selected !== null

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all duration-200 ${
                showResult
                  ? isCorrect
                    ? 'border-bull bg-bull/10 text-bull'
                    : isSelected && !isCorrect
                    ? 'border-bear bg-bear/10 text-bear'
                    : 'border-border-dim text-slate-500'
                  : 'border-border-dim hover:border-accent-blue/50 hover:bg-bg-elevated text-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center mt-0.5 text-xs font-bold ${
                  showResult && isCorrect ? 'border-bull bg-bull text-bg-primary' :
                  showResult && isSelected ? 'border-bear bg-bear text-white' :
                  'border-border'
                }`}>
                  {showResult && isCorrect ? <CheckCircle size={12} /> :
                   showResult && isSelected ? <XCircle size={12} /> :
                   String.fromCharCode(65 + i)}
                </div>
                <span>{opt}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="bg-bg-elevated border border-accent-blue/30 rounded-xl p-4 mb-5 animate-fade-in">
          <div className="text-xs font-semibold text-accent-blue mb-1.5">Explanation</div>
          <p className="text-sm text-slate-300 leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* Next */}
      {selected !== null && (
        <button onClick={handleNext} className="w-full btn-primary flex items-center justify-center gap-2">
          {isLast ? (
            <>
              <Trophy size={15} />
              Finish Quiz
            </>
          ) : (
            <>
              Next Question
              <ChevronRight size={15} />
            </>
          )}
        </button>
      )}
    </div>
  )
}
