# Trader Training Machine — EUR/USD Prop Firm Platform

A complete, professional-grade trading education and simulation platform built for EUR/USD prop firm preparation.

## Features

| Module | Description |
|--------|-------------|
| 📊 **Dashboard** | Overview of account, P&L, progress, market snapshot |
| 📚 **Curriculum** | 10 modules, 25+ lessons covering beginner to advanced |
| 📈 **Simulator** | Live/simulated charts, Buy/Sell with SL/TP, prop firm rules enforcement |
| 📉 **Analytics** | Equity curve, win rate, profit factor, mistake pattern AI analysis |
| 📝 **Journal** | Emotion tracking, AI trade feedback, lesson logging |
| 🧠 **Quiz** | Module-based quizzes, 70% pass threshold, XP rewards |
| 💬 **AI Mentor** | Claude-powered EUR/USD mentor for Q&A, trade review |
| ⚙️ **Strategy Lab** | Build & backtest MA/RSI/Breakout strategies on 500 candles |
| 📅 **Daily Routine** | Pre-market analysis, trade plan, post-review system |
| 🏆 **Gamification** | XP, 10 levels, 16 badges, progress tracking |

## Quick Start

### 1. Install Dependencies

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Configure API Keys

Edit `server/.env`:

```env
TWELVEDATA_API_KEY=your_key_here    # Get free at twelvedata.com (800 calls/day)
ANTHROPIC_API_KEY=your_key_here     # Get at console.anthropic.com
PORT=3001
```

### 3. Run the App

```bash
# From root directory:
npm run dev

# OR separately:
npm run dev:server   # Backend on port 3001
npm run dev:client   # Frontend on port 5173
```

Then open http://localhost:5173

## Without API Keys

The platform works fully without API keys:
- **Market Data**: Uses realistic simulated EUR/USD price data (candlestick charts still work perfectly)
- **AI Mentor**: Uses intelligent fallback responses for common trading questions

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | TailwindCSS (custom dark theme) |
| Charts | Lightweight Charts (TradingView) + Recharts |
| State | Zustand |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Market Data | TwelveData API (with 5-min caching) |
| AI Mentor | Anthropic Claude API |

## Prop Firm Rules Enforced

- Max Daily Loss: 5% of account
- Max Drawdown: 10% of account
- Max Trades Per Day: 10
- Minimum R:R: 1:1 recommended (1:2 target)
- Risk per trade: Max 2% recommended (1% optimal)

## Curriculum Modules

1. Forex Foundations (Beginner)
2. Market Structure (Beginner)
3. Candlestick Patterns (Beginner)
4. Risk Management (Intermediate) ← Most important
5. Trading Psychology (Intermediate)
6. Prop Firm Trading (Intermediate)
7. EUR/USD Strategies (Advanced)
8. Trade Management (Advanced)
9. Advanced Analysis (Advanced)
10. Becoming Consistent (Advanced)

## Data Storage

All data is stored locally in `data/trader.db` (SQLite). No external database required.
