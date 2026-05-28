import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Profile {
  id: number
  username: string
  account_balance: number
  starting_balance: number
  xp: number
  level: number
  streak_days: number
  badges: Array<{ badge_id: string; earned_at: string }>
}

interface AppState {
  profile: Profile | null
  sidebarOpen: boolean
  setProfile: (p: Profile) => void
  setSidebarOpen: (v: boolean) => void
  updateBalance: (balance: number) => void
  addXP: (amount: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      sidebarOpen: true,
      setProfile: (p) => set({ profile: p }),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      updateBalance: (balance) =>
        set((s) => ({ profile: s.profile ? { ...s.profile, account_balance: balance } : null })),
      addXP: (amount) =>
        set((s) => {
          if (!s.profile) return {}
          const newXP = s.profile.xp + amount
          return { profile: { ...s.profile, xp: newXP, level: Math.floor(newXP / 500) + 1 } }
        }),
    }),
    { name: 'trader-app', partialize: (s: AppState) => ({ sidebarOpen: s.sidebarOpen }) }
  )
)
