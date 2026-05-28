import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LessonProgress {
  module_id: string
  lesson_id: string
  completed: boolean
  completed_at?: string
}

interface ProgressState {
  completedLessons: LessonProgress[]
  setCompletedLessons: (l: LessonProgress[]) => void
  markLessonComplete: (moduleId: string, lessonId: string) => void
  isLessonComplete: (moduleId: string, lessonId: string) => boolean
  getModuleProgress: (moduleId: string, totalLessons: number) => number
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      setCompletedLessons: (l) => set({ completedLessons: l }),
      markLessonComplete: (moduleId, lessonId) =>
        set((s) => {
          if (s.completedLessons.some((l) => l.module_id === moduleId && l.lesson_id === lessonId)) return {}
          return {
            completedLessons: [...s.completedLessons, { module_id: moduleId, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() }],
          }
        }),
      isLessonComplete: (moduleId, lessonId) =>
        get().completedLessons.some((l) => l.module_id === moduleId && l.lesson_id === lessonId && l.completed),
      getModuleProgress: (moduleId, totalLessons) => {
        const done = get().completedLessons.filter((l) => l.module_id === moduleId && l.completed).length
        return totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0
      },
    }),
    { name: 'trader-progress' }
  )
)
