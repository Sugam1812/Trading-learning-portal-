# Decision log, known limitations, roadmap

## Verified decisions

| Decision | Rationale |
| --- | --- |
| **Local-first, no backend/auth** | No API keys or backend exist in this environment; the spec requires full offline capability anyway. Stores are isolated behind Zustand so a Supabase sync layer can be added without touching screens. "Auth" is a local profile; privacy story is stronger (nothing leaves the device). |
| **Synthetic seeded chart data** | Avoids licensing issues entirely; lets scenarios be engineered per learning objective; deterministic seeds make exercises and tests reproducible. `src/data/packs.ts` is the provider seam for licensed data later. |
| **SVG chart engine (no Skia)** | react-native-svg is stable across platforms incl. web export used for e2e; chart windows are ≤70 candles so performance is fine on mid-range devices. |
| **RN `Animated`/state over reanimated as load-bearing dependency** | Keeps Jest/node and web export simple and reliable; reanimated is installed and can be adopted screen-by-screen for richer motion. |
| **Worst-case trade resolution** | A revealed bar touching both stop and target counts as a stop-out. Intrabar order is unknowable; honest backtesting under-promises. Unit-tested. |
| **Computed exercise answers** | Tap-the-swing answers are derived from swing detection over the generated data, so content can never drift from data. |
| **Two-attempt answer flow** | First miss shows a hint and allows one retry (retry XP halved); second miss reveals the explanation and files the item into the SRS Mistake Notebook. |
| **Process-scored challenges** | Challenge score depends on decision quality (best/ok/poor), stated confidence is recorded, and the reveal explicitly separates outcome from process. "No trade" is frequently the rewarded answer. |
| **Jest without jest-expo preset** | jest-expo had a version clash with jest 30 in this environment; all tested code is pure TS, so babel-jest + node env is sufficient and faster. |

## Known limitations (honest list)

- **No real market data / no live prices** — by design for v1; the app says so in-app.
- **Pip-value model simplified** to USD-quoted pairs (≈$10/pip/lot); stated wherever used. Cross-currency conversion is a future calculator upgrade.
- **No push notifications yet** — the notification plan (supportive, non-manipulative, quiet hours) is specced in the master prompt but not implemented; requires a dev build.
- **No screenshots in journal entries** — text-first journal for v1 (image picker + storage is a straightforward follow-up).
- **Curriculum covers 15 modules / 54 lessons** (foundations → candles → structure → S/R → risk → execution → psychology → strategy/backtesting → indicators → multi-timeframe → fundamentals & news → sessions → broker literacy → advanced concepts → capstone trading plan). Remaining specced depth (checkpoint exams, dedicated chart-pattern module, an interactive capstone program with gated requirements) is content/feature work on the existing data-driven engine.
- **AI tutor not included** — core curriculum works without AI per spec §12; the Socratic tutor needs a server-side proxy (never ship API keys in the client).
- **E2E runs against the exported web build** (Playwright + Chromium) rather than Maestro/Detox on-device — that is what this environment can execute; flows verified are identical route/logic code paths.
- **Spread/slippage simulation** in the replay lab is limited to the worst-case fill rule; a configurable spread model is on the roadmap.
- Default lint config not installed (`expo lint` needs network access to fetch config packages); TypeScript strict + tests are the enforced gates.

## Roadmap

1. Content: checkpoint exams; a dedicated chart-pattern module; an interactive capstone program with gated completion requirements
2. Journal screenshots + calendar view; weekly review ritual
3. Notifications (opt-in, quiet hours); daily-goal scheduling from onboarding pace
4. Spread/slippage/commission models in the lab; walk-forward missions; parameter-sensitivity explorer
5. Optional cloud sync (Supabase, RLS) + AI tutor behind a rate-limited server proxy
6. Maestro e2e on device farms; performance profiling on low-end Android
