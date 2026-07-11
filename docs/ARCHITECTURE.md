# Architecture

## Stack

- **Expo SDK 57** / React Native 0.86 / React 19, **TypeScript strict**
- **expo-router** (file-based navigation: root stack + bottom tabs)
- **Zustand + AsyncStorage** for all persisted state (local-first, no backend)
- **react-native-svg** for the candle chart engine and diagrams
- **Jest** (babel-jest, node env) for unit + content tests
- expo-haptics for feedback; RN `Animated`/plain state for motion (reanimated is installed for future use but deliberately not load-bearing)

## Folder layout

```
app/                    # expo-router routes (screens only, no business logic)
  (tabs)/               # Learn, Practice, Lab, Journal, Profile
  lesson/[id].tsx       # lesson player (block engine host)
  challenge/[id].tsx    # chart-guessing flow
  backtest.tsx          # replay backtester + forward simulator + results
  strategy-builder.tsx  # guided rule builder + checker
  ...
src/
  components/
    ui.tsx              # design-system primitives (Screen, Card, Button, Chip…)
    chart/              # CandleChart, EquitySparkline, RRDiagram, CandleAnatomy, Stepper
    blocks/             # BlockRenderer: all 14 lesson block types
  content/              # DATA ONLY: modules m0–m7, glossary, challenges
  data/packs.ts         # seeded synthetic OHLC generator + swing helpers (data-provider seam)
  lib/                  # pure logic: calc, metrics, xp, mastery, srs, rng, strategyCheck
  store/                # zustand stores: settings, progress, journal, lab
  theme/                # tokens + ThemeProvider (dark/light/system, color-blind mode)
  types/                # content & trading domain types
```

## Key design rules

1. **Screens render data; logic lives in `src/lib` and is unit-tested.** Every number the UI shows (position size, expectancy, drawdown, R results) comes from a tested pure function.
2. **Content is data.** Lessons/challenges are typed objects; adding a module never touches UI code. The `BlockRenderer` switch is the single mapping from block kind → interaction.
3. **No look-ahead by construction.** `CandleChart` receives `visible` and slices before layout; the backtest store only resolves trades against candles as `advanceCandle` reveals them; a bar spanning both stop and target resolves as a loss (worst case).
4. **Deterministic data.** Chart packs come from a seeded RNG (`mulberry32`), so every exercise, test and replay is reproducible, and correct answers for tap exercises are *computed* from the data (swing detection), never hard-coded.
5. **Local-first.** Four persisted stores (`pq-settings`, `pq-progress`, `pq-journal`, `pq-lab`). The entry route waits for hydration before redirecting. Swapping in a backend later means adding a sync layer behind the stores, not rewriting screens.
6. **Accessibility**: roles/labels on interactive elements, live regions for feedback banners, text summaries for charts, ≥36pt touch targets, color-blind bull/bear palette toggle, reduce-motion setting.

## State shape (summary)

- `settings`: onboarding profile, theme mode, color-blind, haptics, reduce motion, disclaimer acceptance
- `progress`: xp, streak (day-keyed), per-lesson completion + first-try score, per-skill mastery `{value, samples}`, mistake notebook items with SRS state, challenge results (quality + confidence), reflections, activity days
- `journal`: trades with emotions, mistake tags, rule adherence, R results
- `lab`: strategies (versioned), backtest/forward sessions (pack cursor, trades, mode)

## Gamification economics

XP sources reward process: correct first try (10), retry (5), lesson bonus (20), best-process challenge call (25), review item cleared (8), backtest trade logged (5), journal entry (15). Levels grow linearly (100 + 60/level). Nothing rewards trade frequency, size or leverage.
