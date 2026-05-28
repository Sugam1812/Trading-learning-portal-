"""PostgreSQL async connection pool + all CRUD operations."""
import asyncpg
import os
import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://traderos:traderos_pass@localhost/traderos_ai")

_pool: Optional[asyncpg.Pool] = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
        await _init_schema()
    return _pool


async def _init_schema():
    pool = await get_pool()
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path) as f:
        sql = f.read()
    async with pool.acquire() as conn:
        await conn.execute(sql)


async def get_runtime_state() -> Dict:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM runtime_state WHERE id=1")
        return dict(row) if row else {}


async def update_runtime_state(**kwargs):
    pool = await get_pool()
    kwargs["updated_at"] = datetime.now(timezone.utc)
    sets = ", ".join(f"{k}=${i+1}" for i, k in enumerate(kwargs))
    vals = list(kwargs.values()) + [1]
    async with pool.acquire() as conn:
        await conn.execute(
            f"UPDATE runtime_state SET {sets} WHERE id=${len(vals)}",
            *vals
        )


async def insert_trade(trade: Dict) -> int:
    pool = await get_pool()
    cols = ", ".join(trade.keys())
    placeholders = ", ".join(f"${i+1}" for i in range(len(trade)))
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            f"INSERT INTO ai_trades ({cols}) VALUES ({placeholders}) RETURNING id",
            *trade.values()
        )
        return row["id"]


async def update_trade(trade_id: int, **kwargs):
    pool = await get_pool()
    sets = ", ".join(f"{k}=${i+1}" for i, k in enumerate(kwargs))
    vals = list(kwargs.values()) + [trade_id]
    async with pool.acquire() as conn:
        await conn.execute(
            f"UPDATE ai_trades SET {sets} WHERE id=${len(vals)}",
            *vals
        )


async def get_open_trades() -> List[Dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM ai_trades WHERE status IN ('opened','managing','partially_closed') ORDER BY opened_at DESC"
        )
        return [dict(r) for r in rows]


async def get_recent_trades(limit: int = 20) -> List[Dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM ai_trades ORDER BY created_at DESC LIMIT $1", limit
        )
        return [dict(r) for r in rows]


async def log_agent(agent_name: str, message: str, level: str = "info",
                    symbol: str = None, data: Dict = None):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO agent_logs (agent_name, log_level, message, symbol, data) VALUES ($1,$2,$3,$4,$5)",
            agent_name, level, message, symbol, json.dumps(data or {})
        )


async def save_memory(agent_name: str, memory_type: str, content: str,
                      symbol: str = None, importance: float = 0.5, metadata: Dict = None):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """INSERT INTO agent_memory (agent_name, memory_type, content, symbol, importance, metadata)
               VALUES ($1,$2,$3,$4,$5,$6)""",
            agent_name, memory_type, content, symbol, importance, json.dumps(metadata or {})
        )


async def get_memories(agent_name: str, limit: int = 10) -> List[Dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """SELECT * FROM agent_memory WHERE agent_name=$1
               ORDER BY importance DESC, created_at DESC LIMIT $2""",
            agent_name, limit
        )
        return [dict(r) for r in rows]


async def insert_signal(signal: Dict):
    pool = await get_pool()
    cols = ", ".join(signal.keys())
    placeholders = ", ".join(f"${i+1}" for i in range(len(signal)))
    async with pool.acquire() as conn:
        await conn.execute(
            f"INSERT INTO market_signals ({cols}) VALUES ({placeholders})",
            *signal.values()
        )


async def get_daily_pnl() -> float:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """SELECT COALESCE(SUM(pnl), 0) as daily_pnl FROM ai_trades
               WHERE status='closed' AND closed_at >= CURRENT_DATE"""
        )
        return float(row["daily_pnl"])
