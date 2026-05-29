import asyncio
import json
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from db.database import get_pool, get_runtime_state, update_runtime_state
from engine.trading_engine import trading_engine
from services.broadcaster import manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Init DB pool
    pool = await get_pool()

    # Run schema if needed
    schema_path = os.path.join(os.path.dirname(__file__), "db", "schema.sql")
    if os.path.exists(schema_path):
        with open(schema_path) as f:
            ddl = f.read()
        async with pool.acquire() as conn:
            await conn.execute(ddl)

    # Wire broadcaster into trading engine
    trading_engine.set_broadcaster(manager.broadcast)

    yield

    # Shutdown
    await trading_engine.stop()
    await pool.close()


app = FastAPI(title="Hermes AI Trading OS", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── REST endpoints ────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "hermes-ai-trading-os"}


@app.get("/status")
async def get_status():
    from db.database import get_daily_pnl
    state = await get_runtime_state()
    total_trades = int(state.get("total_trades", 0) or 0)
    winning_trades = int(state.get("winning_trades", 0) or 0)
    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0.0
    daily_pnl = await get_daily_pnl()
    return {
        "is_active": bool(state.get("is_active", False)),
        "balance": float(state.get("current_balance", 100000.0)),
        "initial_balance": float(state.get("initial_balance", 100000.0)),
        "peak_balance": float(state.get("peak_balance", 100000.0)),
        "daily_pnl": daily_pnl,
        "total_pnl": float(state.get("total_pnl", 0.0)),
        "total_trades": total_trades,
        "win_rate": round(win_rate, 1),
        "engine_running": trading_engine.running,
        "connected_clients": manager.count,
        "agent_status": trading_engine._agent_status,
    }


@app.post("/start")
async def start_engine():
    if trading_engine.running:
        raise HTTPException(status_code=400, detail="Engine already running")
    await update_runtime_state(is_active=True)
    asyncio.create_task(trading_engine.start())
    return {"status": "started", "message": "Hermes AI Fund activated"}


@app.post("/stop")
async def stop_engine():
    await trading_engine.stop()
    await update_runtime_state(is_active=False)
    return {"status": "stopped", "message": "Hermes AI Fund deactivated"}


@app.post("/reset")
async def reset_engine():
    if trading_engine.running:
        await trading_engine.stop()
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("UPDATE runtime_state SET balance=10000, daily_pnl=0, total_trades=0, win_rate=0, is_active=false WHERE id=1")
        await conn.execute("DELETE FROM ai_trades")
        await conn.execute("DELETE FROM agent_logs")
        await conn.execute("DELETE FROM market_signals")
        await conn.execute("DELETE FROM performance_snapshots")
    return {"status": "reset", "message": "System reset to initial state"}


@app.get("/trades")
async def get_trades(limit: int = 50):
    from db.database import get_recent_trades, get_open_trades
    open_trades = await get_open_trades()
    closed_trades = await get_recent_trades(limit)
    return {"open": open_trades, "closed": closed_trades}


@app.get("/logs")
async def get_logs(limit: int = 100):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM agent_logs ORDER BY created_at DESC LIMIT $1", limit
        )
    return [dict(r) for r in rows]


@app.get("/memory")
async def get_memory(limit: int = 50):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM agent_memory ORDER BY importance DESC, created_at DESC LIMIT $1", limit
        )
    return [dict(r) for r in rows]


@app.get("/performance")
async def get_performance():
    pool = await get_pool()
    async with pool.acquire() as conn:
        snapshots = await conn.fetch(
            "SELECT * FROM performance_snapshots ORDER BY recorded_at DESC LIMIT 168"
        )
        state = await conn.fetchrow("SELECT * FROM runtime_state WHERE id=1")
    return {
        "snapshots": [dict(s) for s in snapshots],
        "current": dict(state) if state else {},
    }


# ─── WebSocket endpoint ────────────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    # Send init snapshot BEFORE joining broadcaster (prevents race with live events)
    try:
        state = await get_runtime_state()
        from db.database import get_open_trades, get_recent_trades
        open_trades = await get_open_trades()
        recent_trades = await get_recent_trades(20)
        await websocket.send_json({
            "type": "init",
            "data": {
                "state": {k: float(v) if hasattr(v, '__float__') and not isinstance(v, bool) else v
                          for k, v in state.items()},
                "open_trades": open_trades,
                "recent_trades": recent_trades,
                "engine_running": trading_engine.running,
            }
        })
    except Exception:
        pass

    # Now join broadcaster for live events
    manager._connections.add(websocket)

    try:
        while True:
            # Keep connection alive; handle ping/pong
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                elif msg.get("type") == "subscribe":
                    await websocket.send_json({"type": "subscribed", "data": msg.get("channels", [])})
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
