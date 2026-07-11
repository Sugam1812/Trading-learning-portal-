import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { uid } from '@/lib/rng';
import { JournalTrade } from '@/types/trading';

interface JournalState {
  trades: JournalTrade[];
  addTrade: (t: Omit<JournalTrade, 'id' | 'createdAt'>) => void;
  updateTrade: (id: string, patch: Partial<JournalTrade>) => void;
  deleteTrade: (id: string) => void;
  resetAll: () => void;
}

export const useJournal = create<JournalState>()(
  persist(
    (set) => ({
      trades: [],
      addTrade: (t) =>
        set((s) => ({ trades: [{ ...t, id: uid(), createdAt: Date.now() }, ...s.trades] })),
      updateTrade: (id, patch) =>
        set((s) => ({ trades: s.trades.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTrade: (id) => set((s) => ({ trades: s.trades.filter((t) => t.id !== id) })),
      resetAll: () => set({ trades: [] }),
    }),
    { name: 'pq-journal', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
