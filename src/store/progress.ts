import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MasteryMap, updateMastery } from '@/lib/mastery';
import { dayKey, uid } from '@/lib/rng';
import { initialReview, isDue, isRetired, ReviewState, reviewOutcome } from '@/lib/srs';
import { nextStreak } from '@/lib/xp';
import { SkillId } from '@/types/content';

export interface LessonProgress {
  completed: boolean;
  /** Correct-first-try ratio 0..1 for the latest completion. */
  score: number;
  completedAt?: number;
}

/** A wrong answer saved to the Mistake Notebook for spaced review. */
export interface MistakeItem {
  id: string;
  lessonId: string;
  blockId: string;
  skill: SkillId;
  prompt: string;
  createdAt: number;
  review: ReviewState;
}

export interface ChallengeResult {
  challengeId: string;
  quality: 'best' | 'ok' | 'poor';
  confidence: number;
  at: number;
}

export interface ExamResult {
  bestScore: number;
  total: number;
  passed: boolean;
  attempts: number;
  lastAt: number;
}

interface ProgressState {
  xp: number;
  streakCount: number;
  streakLastDay: string | null;
  lessons: Record<string, LessonProgress>;
  mastery: MasteryMap;
  mistakes: MistakeItem[];
  challengeResults: ChallengeResult[];
  reflections: { at: number; prompt: string; text: string }[];
  /** Day keys with any learning activity, for the weekly chart. */
  activeDays: Record<string, number>;
  /** Checkpoint exam results per module. */
  exams: Record<string, ExamResult>;

  addXp: (amount: number) => void;
  recordExam: (moduleId: string, correct: number, total: number, passed: boolean) => void;
  recordAnswer: (skill: SkillId, correct: boolean) => void;
  addMistake: (m: Omit<MistakeItem, 'id' | 'createdAt' | 'review'>) => void;
  reviewMistake: (id: string, correct: boolean) => void;
  completeLesson: (lessonId: string, score: number) => void;
  recordChallenge: (r: ChallengeResult) => void;
  addReflection: (prompt: string, text: string) => void;
  touchActivity: () => void;
  resetAll: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: 0,
      streakCount: 0,
      streakLastDay: null,
      lessons: {},
      mastery: {},
      mistakes: [],
      challengeResults: [],
      reflections: [],
      activeDays: {},
      exams: {},

      recordExam: (moduleId, correct, total, passed) => {
        get().touchActivity();
        set((s) => {
          const prev = s.exams[moduleId];
          return {
            exams: {
              ...s.exams,
              [moduleId]: {
                bestScore: Math.max(prev?.bestScore ?? 0, correct),
                total,
                passed: (prev?.passed ?? false) || passed,
                attempts: (prev?.attempts ?? 0) + 1,
                lastAt: Date.now(),
              },
            },
          };
        });
      },

      addXp: (amount) => {
        get().touchActivity();
        set((s) => ({ xp: s.xp + amount }));
      },

      recordAnswer: (skill, correct) =>
        set((s) => ({ mastery: updateMastery(s.mastery, skill, correct ? 1 : 0) })),

      addMistake: (m) =>
        set((s) => {
          // Only keep one live notebook item per block.
          if (s.mistakes.some((x) => x.blockId === m.blockId)) return s;
          return {
            mistakes: [
              ...s.mistakes,
              { ...m, id: uid(), createdAt: Date.now(), review: initialReview(Date.now()) },
            ],
          };
        }),

      reviewMistake: (id, correct) =>
        set((s) => ({
          mistakes: s.mistakes
            .map((m) => (m.id === id ? { ...m, review: reviewOutcome(m.review, correct, Date.now()) } : m))
            .filter((m) => !isRetired(m.review)),
        })),

      completeLesson: (lessonId, score) => {
        get().touchActivity();
        set((s) => ({
          lessons: {
            ...s.lessons,
            [lessonId]: { completed: true, score, completedAt: Date.now() },
          },
        }));
      },

      recordChallenge: (r) => {
        get().touchActivity();
        set((s) => ({ challengeResults: [...s.challengeResults, r] }));
      },

      addReflection: (prompt, text) =>
        set((s) => ({ reflections: [...s.reflections, { at: Date.now(), prompt, text }] })),

      touchActivity: () =>
        set((s) => {
          const today = dayKey();
          const streak = nextStreak(s.streakLastDay, s.streakCount, today);
          return {
            streakCount: streak.count,
            streakLastDay: streak.lastDay,
            activeDays: { ...s.activeDays, [today]: (s.activeDays[today] ?? 0) + 1 },
          };
        }),

      resetAll: () =>
        set({
          xp: 0,
          streakCount: 0,
          streakLastDay: null,
          lessons: {},
          mastery: {},
          mistakes: [],
          challengeResults: [],
          reflections: [],
          activeDays: {},
          exams: {},
        }),
    }),
    { name: 'pq-progress', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export function dueMistakes(mistakes: MistakeItem[], now = Date.now()): MistakeItem[] {
  return mistakes.filter((m) => isDue(m.review, now));
}
