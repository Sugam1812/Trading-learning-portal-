# EUR/USD Prop Trader Training Portal

A disciplined, adaptive, browser-based training environment that takes a beginner from zero to prop-firm-ready on EUR/USD. It is **not a course** — it is a simulator + rule-enforced trading gym with AI mentor, journal, analytics, gamification and strategy backtester.

> Runs **100% in the browser**. No backend. Works on PC and on your phone's Chrome browser.

---

## Features at a glance

1. Structured curriculum (Beginner → Advanced) — price action, structure, risk, psychology, prop-firm rules.
2. Candle-by-candle trading **simulator** with Buy/Sell, SL/TP, risk %, replay.
3. Interactive quizzes + scenario-based market challenges.
4. Performance analytics dashboard (win rate, R:R, drawdown, behaviour patterns).
5. Prop-firm **discipline enforcement** (daily loss lock, max trades, cooldown, revenge-trade detection).
6. **Adaptive learning engine** — re-teaches your weakest areas automatically.
7. Strategy builder + backtester on historical EUR/USD.
8. **AI mentor** that reviews trades and asks reflective questions.
9. Daily routine (pre-market → planning → post-trade review).
10. Smart journal (auto-logs entries, exits, reasoning, emotional state, AI pattern insights).
11. Gamification — XP, levels, badges, progress bar.
12. Twelve Data API integration with aggressive caching (< 800 calls/day, single key).

---

## Quick start — Run locally on PC

### Option A — simplest (double-click)

1. **Download / clone** this repo.
2. Open the folder.
3. Double-click `index.html`. It opens in Chrome. Done.

> Note: Chrome may block some `fetch()` calls from `file://`. If charts or API don't load, use Option B.

### Option B — local static server (recommended)

Any static server works. Pick one:

```bash
# Python 3 (already installed on most machines)
cd Trading-learning-portal-
python3 -m http.server 8080
```

```bash
# Node.js
npx serve .
```

```bash
# VS Code
# Install "Live Server" extension → right-click index.html → "Open with Live Server"
```

Then open **http://localhost:8080** in Chrome.

---

## Run on your phone (Chrome on Android / iOS)

### Easiest — same Wi-Fi as your PC

1. Start the local server on your PC (Option B above).
2. Find your PC's local IP:
   - Windows: `ipconfig` → look for `IPv4 Address` (e.g. `192.168.1.23`)
   - Mac/Linux: `ifconfig` or `ip a`
3. On your phone's Chrome, visit: `http://192.168.1.23:8080`
4. Done. Works like a full app. You can **Add to Home Screen** from Chrome's menu for an app-like shortcut.

### Fully standalone on phone (no PC)

1. Install **Termux** (Android) or **a-Shell** (iOS).
2. Copy the project folder to the phone.
3. In Termux: `cd trading-learning-portal && python -m http.server 8080`
4. Open Chrome on the phone → `http://localhost:8080`.

---

## Where to paste your Twelve Data API key

1. Go to [twelvedata.com](https://twelvedata.com/) → sign up → copy your free API key.
2. Open the file **`js/config.js`**.
3. Replace the placeholder:

```js
// js/config.js
window.APP_CONFIG = {
  TWELVE_DATA_API_KEY: "PASTE_YOUR_KEY_HERE",   // <-- put your key here
  SYMBOL: "EUR/USD",
  DAILY_API_BUDGET: 800,          // hard cap
  LIVE_REFRESH_SECONDS: 60,       // live quote refresh
  CACHE_TTL_HOURS: 24,            // historical bars cache
  USE_CACHE_ONLY_FOR: ["backtest", "quiz", "practice"], // these never hit API
  USE_API_FOR: ["live", "challenge"]
};
```

4. Save. Reload the browser. You're live.

> **Alternative:** You can also paste the key directly in the app — open **Settings → API Key** in the UI. It is stored in your browser's `localStorage` only (never sent anywhere except Twelve Data).

### What if I don't have a key?

The app still works **fully offline** in "Practice mode" — simulator, quizzes, curriculum, journal, backtester all use bundled sample data (`data/eurusd_sample.json`). Only live quote + live challenge need the API.

---

## Project structure

```
Trading-learning-portal-/
├── index.html              # SPA shell
├── README.md
├── css/
│   └── styles.css
├── js/
│   ├── config.js           # <-- YOUR API KEY GOES HERE
│   ├── app.js              # router + boot
│   ├── storage.js          # localStorage wrapper
│   ├── api.js              # Twelve Data + caching + budget guard
│   ├── curriculum.js       # lessons
│   ├── simulator.js        # candle-by-candle trade engine
│   ├── chart.js            # canvas candlestick renderer
│   ├── quiz.js             # quizzes + scenario challenges
│   ├── analytics.js        # KPIs + behaviour detection
│   ├── discipline.js       # prop-firm rule enforcement
│   ├── adaptive.js         # weakness-driven lesson picker
│   ├── strategy.js         # strategy builder + backtester
│   ├── mentor.js           # AI mentor (rule-based + reflective Qs)
│   ├── routine.js          # daily routine checklist
│   ├── journal.js          # smart journal + pattern insights
│   └── gamification.js     # XP / levels / badges
└── data/
    └── eurusd_sample.json  # offline fallback candles
```

---

## API usage strategy (how we stay under 800 calls/day)

| Purpose          | Source                 | Cost     |
|------------------|------------------------|----------|
| Live quote       | Twelve Data `/price`   | 1 call / 60s while trading screen open |
| Today's 1m bars  | Twelve Data `/time_series` | 1 call / 5min, cached |
| Historical (1h/1d) | cached in localStorage | 0 after first load |
| Backtests        | cached data only       | 0 |
| Quizzes / scenarios | bundled JSON        | 0 |
| Practice mode    | bundled JSON + cache   | 0 |

Hard daily budget (default 800) is tracked in localStorage. When 90 % is hit, the app auto-switches to cache-only and shows a banner.

---

## Missing / suggested future features (gaps in current version)

These are intentionally **not** built yet — add them as you grow:

- **Broker / MT5 bridge** — send simulator trades to a demo broker account.
- **Multi-pair** — currently EUR/USD only; add GBP/USD, XAU/USD, indices.
- **Economic calendar** — auto-block trading around red-folder news.
- **Order-flow / DOM view** — tape reading practice.
- **Voice journaling** — record your reasoning, transcribe via Web Speech API.
- **Peer leaderboards & copy-trade challenges** — needs a backend.
- **Push notifications** — "you've traded 3 losers, cooldown" even when tab closed.
- **Risk-of-ruin & Monte Carlo simulator** on your own equity curve.
- **Prop-firm template library** — FTMO / MFF / The5%ers exact rule presets.
- **Session heatmap** — show which hour you make/lose money.
- **Tilt detector using webcam + heart rate** (experimental).
- **Cloud sync** — currently journal lives only in this browser; add Firebase/Supabase.
- **Mobile PWA install + offline service worker** — works offline after first visit.
- **Real options/futures modules** — spot FX only right now.

---

## Troubleshooting

| Symptom | Fix |
|--|--|
| "API key missing" banner | Paste key in `js/config.js` or Settings → API Key. |
| Chart blank | Use Option B (local server) instead of `file://`. |
| "Daily budget reached" | Wait till midnight UTC or raise `DAILY_API_BUDGET` if your plan allows. |
| Phone can't reach PC | Both devices must be on the same Wi-Fi, and PC firewall must allow port 8080. |
| Data wiped | It's in `localStorage`; clearing browser data wipes progress. Use **Settings → Export** to back up. |

---

## License

MIT. Use it, modify it, ship it to your students.

Trade the plan. Plan the trade. Protect the capital. 🔒
