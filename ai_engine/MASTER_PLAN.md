# TRADEROS — AUTONOMOUS AI FUND — MASTER BUILD PLAN

## Architecture Overview
- **ai_engine/** — Python FastAPI service (port 8000)
- **client/** — React frontend (existing, extended)
- **server/** — Express backend (existing, unchanged)
- **Redis** — pub/sub between agents and WebSocket broadcaster
- **PostgreSQL** — trades, memory, agent logs, performance metrics

## Task List

### ✅ DONE
- [x] Install Python packages (fastapi, uvicorn, ccxt, google-generativeai, asyncpg, aioredis)
- [x] Start Redis + PostgreSQL
- [x] Create PostgreSQL database

### 🔨 BUILDING NOW

#### Phase 1 — Database Layer
- [x] db/schema.sql — all tables
- [x] db/database.py — asyncpg pool + CRUD operations

#### Phase 2 — Market Feed
- [x] engine/market_feed.py — Binance WebSocket (BTC/USDT, ETH/USDT live)
- [x] engine/candle_store.py — in-memory candle ring buffer per symbol/timeframe

#### Phase 3 — AI Agents (inspired by TradingAgents framework)
- [x] agents/technical_agent.py — EMA/RSI/MACD/BB analysis → LONG/SHORT/HOLD signals
- [x] agents/sentiment_agent.py — market regime, fear/greed simulation
- [x] agents/risk_agent.py — position sizing, drawdown check, confidence threshold
- [x] agents/portfolio_manager.py — orchestrates agents, makes final trade decision
- [x] agents/reflection_agent.py — post-trade learning, stores AI memory

#### Phase 4 — Trading Engine
- [x] engine/trading_engine.py — main async loop (feed→agents→risk→execute→manage→reflect)
- [x] engine/position_manager.py — SL/TP/trailing stops, auto-close
- [x] engine/risk_manager.py — daily loss limit, max drawdown, cooldowns, volatility

#### Phase 5 — Runtime + WebSocket
- [x] engine/runtime_manager.py — START/STOP/RECOVER state
- [x] services/broadcaster.py — Redis pub/sub → WebSocket fan-out
- [x] main.py — FastAPI app with /ws endpoint

#### Phase 6 — Frontend
- [x] AiFund.tsx — new AI Fund dashboard page
- [x] useAiFundStore.ts — WebSocket state management
- [x] Sidebar.tsx — add AI FUND nav entry

## AI Providers (Free Tier)
- Google Gemini Flash: 15 RPM, 1M tokens/day — used for agent reasoning
- Fallback: rule-based signal generation (no API key needed)

## Market Data (Free, No API Key)
- Binance public WebSocket: BTC/USDT, ETH/USDT realtime candles + ticker
- CCXT for REST fallback

## Key Design Decisions
- PAPER TRADING ONLY — no real money, no real orders
- Simulate 0.1% fee + 0.05% slippage on every trade
- Each agent runs independently async, results merged by Portfolio Manager
- Memory persisted in PostgreSQL + Redis cache (inspired by agentmemory/mem0 patterns)
- Trade lifecycle: pending → opened → managing → partially_closed → closed/cancelled
