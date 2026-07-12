import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { resolveTradeAgainstCandle } from '@/lib/metrics';
import { uid } from '@/lib/rng';
import { getPack } from '@/data/packs';
import { BacktestSession, SimTrade, Strategy } from '@/types/trading';

interface LabState {
  strategies: Strategy[];
  sessions: BacktestSession[];
  activeSessionId: string | null;

  saveStrategy: (s: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt' | 'version'> & { id?: string }) => string;
  deleteStrategy: (id: string) => void;

  startSession: (packId: string, mode: 'backtest' | 'forward', strategyId?: string, riskPercent?: number) => string;
  advanceCandle: (sessionId: string) => void;
  openTrade: (sessionId: string, t: Omit<SimTrade, 'id' | 'entryIndex'>) => void;
  skipSetup: (sessionId: string, reason: string) => void;
  finishSession: (sessionId: string) => void;
  deleteSession: (id: string) => void;
  resetAll: () => void;
}

/** Bars revealed at the start of a replay so there is context to analyze. */
export const REPLAY_WARMUP_BARS = 30;

export const useLab = create<LabState>()(
  persist(
    (set, get) => ({
      strategies: [],
      sessions: [],
      activeSessionId: null,

      saveStrategy: (input) => {
        const now = Date.now();
        const existing = input.id ? get().strategies.find((s) => s.id === input.id) : undefined;
        if (existing) {
          set((st) => ({
            strategies: st.strategies.map((s) =>
              s.id === existing.id ? { ...s, ...input, updatedAt: now, version: s.version + 1 } : s,
            ),
          }));
          return existing.id;
        }
        const id = uid();
        const strategy: Strategy = {
          ...input,
          id,
          createdAt: now,
          updatedAt: now,
          version: 1,
        };
        set((st) => ({ strategies: [strategy, ...st.strategies] }));
        return id;
      },

      deleteStrategy: (id) => set((st) => ({ strategies: st.strategies.filter((s) => s.id !== id) })),

      startSession: (packId, mode, strategyId, riskPercent = 1) => {
        const id = uid();
        const session: BacktestSession = {
          id,
          createdAt: Date.now(),
          packId,
          strategyId,
          riskPercent,
          trades: [],
          cursor: REPLAY_WARMUP_BARS,
          finished: false,
          mode,
        };
        set((st) => ({ sessions: [session, ...st.sessions], activeSessionId: id }));
        return id;
      },

      advanceCandle: (sessionId) =>
        set((st) => ({
          sessions: st.sessions.map((s) => {
            if (s.id !== sessionId || s.finished) return s;
            const pack = getPack(s.packId);
            if (s.cursor >= pack.candles.length) return { ...s, finished: true };
            const newCandle = pack.candles[s.cursor];
            const trades = s.trades.map((t) => resolveTradeAgainstCandle(t, newCandle, s.cursor));
            const cursor = s.cursor + 1;
            return { ...s, trades, cursor, finished: cursor >= pack.candles.length };
          }),
        })),

      openTrade: (sessionId, t) =>
        set((st) => ({
          sessions: st.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const trade: SimTrade = { ...t, id: uid(), entryIndex: s.cursor - 1 };
            return { ...s, trades: [...s.trades, trade] };
          }),
        })),

      skipSetup: (sessionId, reason) =>
        set((st) => ({
          sessions: st.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const trade: SimTrade = {
              id: uid(),
              direction: 'long',
              entry: 0,
              stop: 0,
              target: 0,
              entryIndex: s.cursor - 1,
              reason,
              skipped: true,
            };
            return { ...s, trades: [...s.trades, trade] };
          }),
        })),

      finishSession: (sessionId) =>
        set((st) => ({
          sessions: st.sessions.map((s) => (s.id === sessionId ? { ...s, finished: true } : s)),
          activeSessionId: null,
        })),

      deleteSession: (id) =>
        set((st) => ({
          sessions: st.sessions.filter((s) => s.id !== id),
          activeSessionId: st.activeSessionId === id ? null : st.activeSessionId,
        })),

      resetAll: () => set({ strategies: [], sessions: [], activeSessionId: null }),
    }),
    { name: 'pq-lab', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
