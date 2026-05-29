"""
Live Market Feed — Forex (EUR/USD, GBP/USD) with Binance fallback.
Tries Binance WebSocket first; falls back to realistic forex simulation.
Inspired by Freqtrade's exchange/streaming architecture.
"""
import asyncio
import datetime
import json
import logging
import time
from collections import deque
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Callable, Deque
import websockets

log = logging.getLogger("market_feed")

BINANCE_WS = "wss://stream.binance.com:9443/stream?streams="

# Primary: Forex pairs (paper trading simulation)
SYMBOLS = ["EUR/USD", "GBP/USD"]
FOREX_SYMBOLS = {"EUR/USD": "eurusd", "GBP/USD": "gbpusd"}

# Fallback: also support crypto if needed
BINANCE_SYMBOLS = {"BTC/USDT": "btcusdt", "ETH/USDT": "ethusdt"}


def get_session() -> str:
    """Detect current forex trading session based on UTC hour."""
    hour = datetime.datetime.utcnow().hour
    if 7 <= hour < 13:
        return "LONDON"
    elif 13 <= hour < 16:
        return "OVERLAP"   # London + New York overlap — most liquid
    elif 16 <= hour < 22:
        return "NEW_YORK"
    else:
        return "ASIAN"


@dataclass
class Candle:
    symbol: str
    timeframe: str
    open_time: int
    open: float
    high: float
    low: float
    close: float
    volume: float
    close_time: int
    is_closed: bool = False

    def to_dict(self):
        return {
            "symbol": self.symbol,
            "timeframe": self.timeframe,
            "open_time": self.open_time,
            "open": self.open,
            "high": self.high,
            "low": self.low,
            "close": self.close,
            "volume": self.volume,
            "close_time": self.close_time,
            "is_closed": self.is_closed,
        }


@dataclass
class Ticker:
    symbol: str
    price: float
    change_pct: float
    volume_24h: float
    high_24h: float
    low_24h: float
    timestamp: int

    def to_dict(self):
        return {
            "symbol": self.symbol,
            "price": self.price,
            "change_pct": self.change_pct,
            "volume_24h": self.volume_24h,
            "high_24h": self.high_24h,
            "low_24h": self.low_24h,
            "timestamp": self.timestamp,
        }


class CandleStore:
    """Ring buffer of candles per symbol/timeframe."""

    def __init__(self, max_candles: int = 500):
        self._store: Dict[str, Deque[Candle]] = {}
        self._max = max_candles
        self._current: Dict[str, Candle] = {}

    def _key(self, symbol: str, tf: str) -> str:
        return f"{symbol}_{tf}"

    def update(self, candle: Candle):
        key = self._key(candle.symbol, candle.timeframe)
        if key not in self._store:
            self._store[key] = deque(maxlen=self._max)

        if candle.is_closed:
            self._store[key].append(candle)
            self._current.pop(key, None)
        else:
            self._current[key] = candle

    def get_closed(self, symbol: str, tf: str = "1m") -> List[Candle]:
        return list(self._store.get(self._key(symbol, tf), []))

    def get_current(self, symbol: str, tf: str = "1m") -> Optional[Candle]:
        return self._current.get(self._key(symbol, tf))

    def get_closes(self, symbol: str, tf: str = "1m", n: int = 100) -> List[float]:
        candles = self.get_closed(symbol, tf)[-n:]
        cur = self.get_current(symbol, tf)
        if cur:
            candles = list(candles) + [cur]
        return [c.close for c in candles]

    def get_highs(self, symbol: str, tf: str = "1m", n: int = 100) -> List[float]:
        return [c.high for c in self.get_closed(symbol, tf)[-n:]]

    def get_lows(self, symbol: str, tf: str = "1m", n: int = 100) -> List[float]:
        return [c.low for c in self.get_closed(symbol, tf)[-n:]]

    def get_volumes(self, symbol: str, tf: str = "1m", n: int = 100) -> List[float]:
        return [c.volume for c in self.get_closed(symbol, tf)[-n:]]

    def count(self, symbol: str, tf: str = "1m") -> int:
        return len(self._store.get(self._key(symbol, tf), []))


class MarketFeed:
    """
    Forex market feed — simulates EUR/USD and GBP/USD with realistic
    random-walk prices, session-aware volatility, and pip precision.
    """

    def __init__(self):
        self.candle_store = CandleStore()
        self.tickers: Dict[str, Ticker] = {}
        self._callbacks: List[Callable] = []
        self._running = False
        self._ws = None
        self.connected = False
        self.last_update = 0
        self._reconnect_delay = 1

    def on_update(self, callback: Callable):
        self._callbacks.append(callback)

    async def _notify(self, event_type: str, data: dict):
        for cb in self._callbacks:
            try:
                await cb(event_type, data)
            except Exception as e:
                log.error(f"Callback error: {e}")

    async def start(self):
        self._running = True
        # Always use simulated forex feed (no Binance for forex pairs)
        log.info("Starting forex market simulation feed...")
        await self._run_simulated_feed()

    async def _run_simulated_feed(self):
        """
        Realistic EUR/USD and GBP/USD simulation.
        Session-aware volatility: higher during London/NY, lower during Asian.
        Pip precision: 5 decimal places for forex.
        """
        import random
        import math

        # Starting prices (realistic 2024 levels)
        prices = {
            "EUR/USD": 1.0850,
            "GBP/USD": 1.2650,
        }

        # Session-based volatility multipliers
        session_vol = {
            "LONDON":   1.2,
            "OVERLAP":  1.5,   # Most volatile
            "NEW_YORK": 1.0,
            "ASIAN":    0.4,   # Low volatility
        }

        # Base pip volatility per tick (1 pip = 0.0001 for EUR/USD)
        base_vol = {
            "EUR/USD": 0.00015,   # ~1.5 pips per tick
            "GBP/USD": 0.00020,   # ~2 pips per tick (GBP more volatile)
        }

        candle_opens = {sym: p for sym, p in prices.items()}
        candle_highs = {sym: p for sym, p in prices.items()}
        candle_lows = {sym: p for sym, p in prices.items()}
        candle_vols = {sym: 0.0 for sym in SYMBOLS}
        candle_start = int(time.time())

        self.connected = True
        log.info("📡 SIMULATED FOREX feed active — EUR/USD, GBP/USD (realistic random walk)")
        await self._notify("connected", {
            "message": "Simulated forex feed active (EUR/USD, GBP/USD)",
            "session": get_session(),
        })

        while self._running:
            now = int(time.time())
            candle_age = now - candle_start
            session = get_session()
            vol_mult = session_vol.get(session, 1.0)

            for sym in SYMBOLS:
                vol = base_vol[sym] * vol_mult
                p = prices[sym]

                # Random walk: Gaussian drift + mean reversion
                drift = random.gauss(0, vol)
                mean_revert = (p - candle_opens[sym]) / candle_opens[sym] * -0.05
                change = drift + mean_revert
                new_price = round(max(p * (1 + change), 0.5), 5)  # 5 decimal places
                prices[sym] = new_price

                candle_highs[sym] = round(max(candle_highs[sym], new_price), 5)
                candle_lows[sym] = round(min(candle_lows[sym], new_price), 5)
                candle_vols[sym] += random.uniform(100, 1000)  # notional volume

                candle = Candle(
                    symbol=sym,
                    timeframe="1m",
                    open_time=candle_start * 1000,
                    open=round(candle_opens[sym], 5),
                    high=candle_highs[sym],
                    low=candle_lows[sym],
                    close=new_price,
                    volume=round(candle_vols[sym], 0),
                    close_time=(candle_start + 60) * 1000,
                    is_closed=False,
                )
                self.candle_store.update(candle)
                await self._notify("candle", candle.to_dict())

                change_pct = (new_price - candle_opens[sym]) / candle_opens[sym] * 100
                ticker = Ticker(
                    symbol=sym,
                    price=round(new_price, 5),
                    change_pct=round(change_pct, 4),
                    volume_24h=round(candle_vols[sym] * 1440, 0),
                    high_24h=round(candle_highs[sym] * 1.003, 5),
                    low_24h=round(candle_lows[sym] * 0.997, 5),
                    timestamp=now * 1000,
                )
                self.tickers[sym] = ticker
                await self._notify("ticker", ticker.to_dict())

            # New candle every 10 seconds (fast simulation)
            if candle_age >= 10:
                for sym in SYMBOLS:
                    closed = Candle(
                        symbol=sym,
                        timeframe="1m",
                        open_time=candle_start * 1000,
                        open=round(candle_opens[sym], 5),
                        high=candle_highs[sym],
                        low=candle_lows[sym],
                        close=prices[sym],
                        volume=round(candle_vols[sym], 0),
                        close_time=now * 1000,
                        is_closed=True,
                    )
                    self.candle_store.update(closed)
                    await self._notify("candle", closed.to_dict())
                    candle_opens[sym] = prices[sym]
                    candle_highs[sym] = prices[sym]
                    candle_lows[sym] = prices[sym]
                    candle_vols[sym] = 0.0

                candle_start = now
                log.debug(
                    f"[{session}] Candle closed — "
                    f"EUR/USD: {prices['EUR/USD']:.5f} | GBP/USD: {prices['GBP/USD']:.5f}"
                )

            self.last_update = now * 1000
            await asyncio.sleep(0.5)

    async def stop(self):
        self._running = False
        if self._ws:
            await self._ws.close()

    def get_price(self, symbol: str) -> Optional[float]:
        t = self.tickers.get(symbol)
        return t.price if t else None

    def get_ticker(self, symbol: str) -> Optional[Ticker]:
        return self.tickers.get(symbol)


# Global singleton
market_feed = MarketFeed()
