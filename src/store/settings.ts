import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'light' | 'system';
export type Track = 'beginner' | 'restart' | 'strategy' | 'backtesting' | 'psychology';

export interface OnboardingProfile {
  name: string;
  track: Track;
  experience: 'none' | 'some' | 'traded';
  minutesPerDay: 5 | 10 | 20;
  goal: 'learn-basics' | 'build-strategy' | 'test-strategy' | 'discipline';
}

interface SettingsState {
  onboarded: boolean;
  disclaimerAccepted: boolean;
  profile: OnboardingProfile | null;
  themeMode: ThemeMode;
  colorBlindMode: boolean;
  haptics: boolean;
  reduceMotion: boolean;
  setProfile: (p: OnboardingProfile) => void;
  acceptDisclaimer: () => void;
  completeOnboarding: () => void;
  setThemeMode: (m: ThemeMode) => void;
  setColorBlindMode: (v: boolean) => void;
  setHaptics: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  resetAll: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      onboarded: false,
      disclaimerAccepted: false,
      profile: null,
      themeMode: 'system',
      colorBlindMode: false,
      haptics: true,
      reduceMotion: false,
      setProfile: (profile) => set({ profile }),
      acceptDisclaimer: () => set({ disclaimerAccepted: true }),
      completeOnboarding: () => set({ onboarded: true }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setColorBlindMode: (colorBlindMode) => set({ colorBlindMode }),
      setHaptics: (haptics) => set({ haptics }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      resetAll: () =>
        set({ onboarded: false, disclaimerAccepted: false, profile: null }),
    }),
    { name: 'pq-settings', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
