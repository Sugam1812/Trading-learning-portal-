-- TraderoS AI Fund — Database Schema
-- Inspired by TradingAgents + Freqtrade patterns

-- Runtime state (single row, persisted across restarts)
CREATE TABLE IF NOT EXISTS runtime_state (
    id SERIAL PRIMARY KEY,
    is_active BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ,
    stopped_at TIMESTAMPTZ,
    initial_balance DECIMAL(18,8) DEFAULT 5000.00,
    current_balance DECIMAL(18,8) DEFAULT 5000.00,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    total_pnl DECIMAL(18,8) DEFAULT 0,
    max_drawdown DECIMAL(10,4) DEFAULT 0,
    peak_balance DECIMAL(18,8) DEFAULT 5000.00,
    trading_pairs TEXT[] DEFAULT ARRAY['EUR/USD','GBP/USD'],
    risk_per_trade DECIMAL(5,2) DEFAULT 1.5,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO runtime_state (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Paper trades — full lifecycle
CREATE TABLE IF NOT EXISTS ai_trades (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL,  -- long / short
    status VARCHAR(20) DEFAULT 'pending',  -- pending/opened/managing/partially_closed/closed/cancelled
    entry_price DECIMAL(18,8),
    exit_price DECIMAL(18,8),
    stop_loss DECIMAL(18,8),
    take_profit DECIMAL(18,8),
    trailing_stop DECIMAL(18,8),
    lot_size DECIMAL(18,8),
    position_value DECIMAL(18,8),
    pnl DECIMAL(18,8),
    pnl_pct DECIMAL(10,4),
    fees DECIMAL(18,8) DEFAULT 0,
    slippage DECIMAL(18,8) DEFAULT 0,
    confidence DECIMAL(5,2),
    signal_source VARCHAR(50),
    agent_reasoning TEXT,
    timeframe VARCHAR(10) DEFAULT '1m',
    risk_reward DECIMAL(5,2),
    opened_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Agent reasoning logs (realtime feed)
CREATE TABLE IF NOT EXISTS agent_logs (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(50) NOT NULL,
    log_level VARCHAR(20) DEFAULT 'info',  -- info/signal/warning/critical
    message TEXT NOT NULL,
    symbol VARCHAR(20),
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_logs_created ON agent_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent ON agent_logs(agent_name, created_at DESC);

-- Agent memory (inspired by agentmemory/mem0 patterns)
CREATE TABLE IF NOT EXISTS agent_memory (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(50) NOT NULL,
    memory_type VARCHAR(30) NOT NULL,  -- trade_lesson/pattern/strategy/reflection
    content TEXT NOT NULL,
    symbol VARCHAR(20),
    importance DECIMAL(3,2) DEFAULT 0.5,  -- 0-1 importance score
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Performance snapshots (hourly)
CREATE TABLE IF NOT EXISTS performance_snapshots (
    id SERIAL PRIMARY KEY,
    balance DECIMAL(18,8),
    total_pnl DECIMAL(18,8),
    daily_pnl DECIMAL(18,8),
    total_trades INTEGER,
    win_rate DECIMAL(5,2),
    sharpe_ratio DECIMAL(8,4),
    max_drawdown DECIMAL(5,2),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market signals log
CREATE TABLE IF NOT EXISTS market_signals (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20),
    timeframe VARCHAR(10),
    signal VARCHAR(20),  -- LONG/SHORT/HOLD
    confidence DECIMAL(5,2),
    technical_score DECIMAL(5,2),
    sentiment_score DECIMAL(5,2),
    risk_score DECIMAL(5,2),
    price DECIMAL(18,8),
    indicators JSONB DEFAULT '{}',
    acted_on BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_symbol ON market_signals(symbol, created_at DESC);

-- Strategy performance tracking (self-improvement engine)
CREATE TABLE IF NOT EXISTS strategy_performance (
    id SERIAL PRIMARY KEY,
    strategy_id VARCHAR(50) NOT NULL UNIQUE,
    strategy_name VARCHAR(100),
    trades INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_pnl DECIMAL(12,4) DEFAULT 0,
    consecutive_losses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
