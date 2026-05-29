"""
Live Market Feed — Binance WebSocket (public, no API key needed).
Streams: kline_1m, ticker, miniTicker.
Inspired by Freqtrade's exchange/streaming architecture.
"""
import asyncio
import json
import logging
import time
from collections import deque
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Callable, Deque
import websockets

log = logging.getLogger("market_feed")

BINANCE_WS = "wss://stream.binance.com:9443/stream?streams="
BINANCE_WS_FALLBACK = "wss://stream.binance.com:443/stream?streams="

# Supported pairs
SYMBOLS = ["BTC/USDT", "ETH/USDT"]
BINANCE_SYMBOLS = {"BTC/USDT": "btcusdt", "ETH/USDT": "ethusdt"}


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
    """Ring buffer of candles per symbol/timeframe — inspired by vectorbt's data structures."""

    def __init__(self, max_candles: int = 500):
        self._store: Dict[str, Deque[Candle]] = {}
        self._max = max_candles
        self._current: Dict[str, Candle] = {}  # live (unclosed) candle

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
    Binance WebSocket market feed.
    No API key required — uses public streams.
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

    def _build_streams(self) -> str:
        streams = []
        for sym_name in BINANCE_SYMBOLS.values():
            streams.append(f"{sym_name}@kline_1m")
            streams.append(f"{sym_name}@ticker")
        return "/".join(streams)

    async def start(self):
        self._running = True
        # Try live Binance feed first, fall back to simulated feed
        try:
            await asyncio.wait_for(self._try_connect_once(), timeout=6)
            log.info("Binance connection succeeded — using live feed")
            await self._run_live_feed()
        except Exception:
            log.warning("Binance unreachable — switching to SIMULATED market feed")
            await self._run_simulated_feed()

    async def _try_connect_once(self):
        streams = self._build_streams()
        url = BINANCE_WS + streams
        async with websockets.connect(url, ping_interval=None, open_timeout=5) as ws:
            pass  # just test connectivity

    async def _run_live_feed(self):
        while self._running:
            try:
                await self._connect()
            except Exception as e:
                log.warning(f"Market feed disconnected: {e}, reconnecting in {self._reconnect_delay}s")
                self.connected = False
                await asyncio.sleep(self._reconnect_delay)
                self._reconnect_delay = min(self._reconnect_delay * 2, 30)

    async def _run_simulated_feed(self):
        """
        Simulates live BTC/USDT and ETH/USDT data using random-walk price model.
        Generates 1m candles and ticker events at realistic intervals.
        """
        import random
        import math

        prices = {"BTC/USDT": 95000.0, "ETH/USDT": 3200.0}
        vols = {"BTC/USDT": 0.0015, "ETH/USDT": 0.002}
        candle_opens = {sym: p for sym, p in prices.items()}
        candle_highs = {sym: p for sym, p in prices.items()}
        candle_lows = {sym: p for sym, p in prices.items()}
        candle_vols = {sym: 0.0 for sym in SYMBOLS}
        candle_start = int(time.time())

        self.connected = True
        log.info("📡 SIMULATED market feed active — BTC/USDT, ETH/USDT (realistic random walk)")
        await self._notify("connected", {"message": "Simulated market feed active (Binance unreachable)"})

        tick_count = 0

        while self._running:
            now = int(time.time())
            candle_age = now - candle_start

            for sym in SYMBOLS:
                vol = vols[sym]
                # Add trending bias + mean reversion + noise
                drift = random.gauss(0, vol)
                mean_revert = (prices[sym] - candle_opens[sym]) / candle_opens[sym] * -0.1
                change = drift + mean_revert
                prices[sym] = max(prices[sym] * (1 + change), 100)

                candle_highs[sym] = max(candle_highs[sym], prices[sym])
                candle_lows[sym] = min(candle_lows[sym], prices[sym])
                candle_vols[sym] += random.uniform(0.01, 0.5)

                candle = Candle(
                    symbol=sym,
                    timeframe="1m",
                    open_time=candle_start * 1000,
                    open=candle_opens[sym],
                    high=candle_highs[sym],
                    low=candle_lows[sym],
                    close=prices[sym],
                    volume=candle_vols[sym],
                    close_time=(candle_start + 60) * 1000,
                    is_closed=False,
                )
                self.candle_store.update(candle)
                await self._notify("candle", candle.to_dict())

                change_pct = (prices[sym] - candle_opens[sym]) / candle_opens[sym] * 100
                ticker = Ticker(
                    symbol=sym,
                    price=round(prices[sym], 2),
                    change_pct=round(change_pct, 3),
                    volume_24h=round(candle_vols[sym] * 1440, 2),
                    high_24h=round(candle_highs[sym] * 1.005, 2),
                    low_24h=round(candle_lows[sym] * 0.995, 2),
                    timestamp=now * 1000,
                )
                self.tickers[sym] = ticker
                await self._notify("ticker", ticker.to_dict())

            # Every 10s = new candle (fast simulation mode)
            if candle_age >= 10:
                for sym in SYMBOLS:
                    # Emit closed candle
                    closed = Candle(
                        symbol=sym,
                        timeframe="1m",
                        open_time=candle_start * 1000,
                        open=candle_opens[sym],
                        high=candle_highs[sym],
                        low=candle_lows[sym],
                        close=prices[sym],
                        volume=candle_vols[sym],
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
                log.info(f"Sim candle closed: BTC=${prices['BTC/USDT']:,.0f} ETH=${prices['ETH/USDT']:,.0f}")

            tick_count += 1
            self.last_update = now * 1000
            await asyncio.sleep(0.5)  # 0.5s ticks

    async def stop(self):
        self._running = False
        if self._ws:
            await self._ws.close()

    async def _connect(self):
        streams = self._build_streams()
        url = BINANCE_WS + streams
        log.info(f"Connecting to Binance WebSocket: {url[:80]}...")

        async with websockets.connect(
            url,
            ping_interval=20,
            ping_timeout=10,
            close_timeout=5,
        ) as ws:
            self._ws = ws
            self.connected = True
            self._reconnect_delay = 1
            log.info("✅ Binance WebSocket connected — streaming live market data")
            await self._notify("connected", {"message": "Live market feed connected"})

            async for raw_msg in ws:
                if not self._running:
                    break
                try:
                    msg = json.loads(raw_msg)
                    await self._process(msg)
                except Exception as e:
                    log.error(f"Message processing error: {e}")

    async def _process(self, msg: dict):
        stream = msg.get("stream", "")
        data = msg.get("data", {})
        self.last_update = int(time.time() * 1000)

        # Map Binance symbol to our format
        binance_sym = stream.split("@")[0].upper()
        our_sym = None
        for our, bn in BINANCE_SYMBOLS.items():
            if bn.upper() == binance_sym:
                our_sym = our
                break
        if not our_sym:
            return

        if "@kline" in stream:
            k = data.get("k", {})
            candle = Candle(
                symbol=our_sym,
                timeframe="1m",
                open_time=k["t"],
                open=float(k["o"]),
                high=float(k["h"]),
                low=float(k["l"]),
                close=float(k["c"]),
                volume=float(k["v"]),
                close_time=k["T"],
                is_closed=k["x"],
            )
            self.candle_store.update(candle)
            await self._notify("candle", candle.to_dict())

        elif "@ticker" in stream:
            ticker = Ticker(
                symbol=our_sym,
                price=float(data["c"]),
                change_pct=float(data["P"]),
                volume_24h=float(data["v"]),
                high_24h=float(data["h"]),
                low_24h=float(data["l"]),
                timestamp=self.last_update,
            )
            self.tickers[our_sym] = ticker
            await self._notify("ticker", ticker.to_dict())

    def get_price(self, symbol: str) -> Optional[float]:
        t = self.tickers.get(symbol)
        return t.price if t else None

    def get_ticker(self, symbol: str) -> Optional[Ticker]:
        return self.tickers.get(symbol)


# Global singleton
market_feed = MarketFeed()
