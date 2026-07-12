# PipQuest 🕯️

**Learn the craft of trading. Respect the risk.**

PipQuest is an interactive forex trading academy for Android and iOS, built with Expo + React Native + TypeScript. It takes a complete beginner from "what is a pip?" to building, backtesting and journaling a rule-based trading system — through hands-on practice, not articles.

> ⚠️ PipQuest is **education only**. It never promises profits, provides no signals, and is not financial advice. All chart data is synthetic training data.

## What's inside

| Area | Features |
| --- | --- |
| **Learn** | 16 modules across 9 themed worlds, 58 interactive lessons (foundations, candles, structure, S/R, risk, execution, psychology, backtesting, indicators with live SMA overlays, multi-timeframe analysis, fundamentals & news, sessions, broker literacy & scam defence, advanced concepts, capstone trading plan), 14 reusable exercise block types, prerequisite-gated course map, glossary (78 plain-language terms), checkpoint exams with course-map crowns |
| **Practice** | Chart-guessing challenges with hidden future candles, confidence ratings, process-vs-outcome scoring, deterministic daily challenge, Mistake Notebook with spaced repetition (1→3→7→14→30 days) |
| **Lab** | Candle-by-candle replay backtester (look-ahead impossible by construction), forward-test simulator with play/pause/speed, no-code strategy builder with a rule-quality checker, position-size / reward-to-risk / expectancy / survival calculators |
| **Journal** | Full trade journal (emotions, mistake tags, rule adherence), analytics (equity curve in R, compliance, top mistake, tilt warning) |
| **Profile** | XP + levels + streaks, per-skill mastery (EWMA), achievements that reward honesty and discipline, dark/light/system themes, color-blind-friendly chart mode, haptics & motion toggles, JSON data export, full local reset |

Everything runs **offline-first**: all state persists locally (AsyncStorage via Zustand), no account or API key required.

## Getting started

```bash
npm install
npm start          # Expo dev server (scan QR with Expo Go, or press a/i)
```

Useful scripts:

```bash
npm run typecheck  # strict TypeScript
npm test           # 75 unit + content-integrity tests (Jest)
npx expo export --platform web   # production web bundle (used for e2e smoke)
```

## Verification

The repo is verified at three levels:

1. **Unit tests** — every calculator (pip value, position size, R-multiples, expectancy, break-even win rate, drawdown, streaks, Monte-Carlo survival), backtest metrics, trade resolution (including worst-case both-sides bars), XP/levels/streaks, mastery EWMA, spaced repetition, seeded RNG, strategy rule checker.
2. **Content-integrity tests** — every lesson block, chart reference, quiz answer index, challenge and glossary entry is validated against the real data; a content typo fails CI. A dedicated test asserts no content promises profits.
3. **E2E smoke drive** — a Playwright script (`docs/` describes it) drives the exported web build through onboarding → lesson completion → chart challenge → calculators → strategy builder → backtest session → journal entry → theme switch → persistence-across-reload, asserting zero console errors.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — stack, folder layout, state, chart engine, data flow
- [`docs/CONTENT.md`](docs/CONTENT.md) — how to add a lesson, a quiz block, a chart pack, or a challenge
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — decision log, known limitations, roadmap

## Safety & ethics

- Clear risk disclaimers at onboarding and in-app (`About & Disclaimers`)
- Age (18+) confirmation during onboarding
- Rewards mastery, honest backtests, rule-following and **choosing not to trade** — never trade frequency, leverage or simulated profits
- No deposits, no live trading, no signals, no copy trading, no fake testimonials, no manipulative urgency
- Synthetic, openly-generated chart data only — no proprietary market data
