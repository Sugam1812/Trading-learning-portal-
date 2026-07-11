# Content authoring guide

All learning content is data in `src/content/`. No UI code changes are needed to add content, and the content-integrity test suite (`src/lib/__tests__/content.test.ts`) validates every reference at test time.

## Quality rules (enforced by review + tests)

- Short paragraphs, simple international English, one idea at a time
- Explain every term immediately in plain language
- Include a realistic example and a common mistake where possible
- Show losing examples; teach when NOT to trade
- Never promise profits or certainty (a test scans for forbidden claim phrases)
- Every lesson needs: objective, xp, ≥3 blocks, unique block ids

## Adding a lesson

1. Open the module file (e.g. `src/content/m4.ts`) or create `m8.ts`.
2. Append a `Lesson` object and add its id to the module's `lessonIds` (order = unlock order).
3. For a new module: export `M8` + `M8_LESSONS`, register both in `src/content/curriculum.ts`, set `prereq` to gate it, and pick a `world` name (new worlds appear automatically on the course map).
4. Run `npm test` — the integrity suite catches broken pack ids, bad answer indexes, duplicate ids, etc.

## Block types (see `src/types/content.ts`)

`concept`, `mcq`, `multi`, `truefalse`, `number` (with tolerance/unit/hint), `order`, `match`, `tappart` (candle anatomy), `tapcandle` (chart hotspot), `nextcandle` (predict + reveal), `chartchoice`, `scenario` (process-scored), `rrbuilder` (interactive stop/target), `reflection` (free text, saved).

Every interactive block gets: correct/incorrect states, explanation, optional hint, one retry, accessibility labels, XP + mastery + mistake-notebook wiring — all provided by `BlockRenderer` and the lesson player.

## Adding a chart pack

Add a `pack(...)` entry in `src/data/packs.ts`: id, pair, timeframe, seed, start price and drift/vol segments that engineer the scenario (trend, range, breakout, fakeout…). Packs must be deterministic — never use `Math.random()`. Use `swingHighIndexes`/`swingLowIndexes` to compute correct answers for tap exercises instead of hard-coding indexes.

Licensed real historical data can replace synthetic packs later by returning the same `ChartPack` shape from a different source — `packs.ts` is the provider seam.

## Adding a chart challenge

Append to `CHALLENGES` in `src/content/challenges.ts`: pick a pack, choose `visible` (must leave hidden future candles — tested), write exactly one `best` option plus tempting `ok`/`poor` options, each with an explanation, and a `reveal` that separates process from outcome.

## Adding glossary terms

Append to `src/content/glossary.ts` with a unique id/term and a plain-language definition (>15 chars, tested).
