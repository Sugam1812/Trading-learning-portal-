"""
Technical Analysis Agent — inspired by TradingAgents Technical Analyst role.
Uses EMA, RSI, MACD, Bollinger Bands, ATR for signal generation.
Pure mathematical analysis — no LLM calls (fast, deterministic).
"""
import asyncio
import logging
import statistics
import time
from dataclasses import dataclass
from typing import List, Optional, Dict, Tuple

log = logging.getLogger("technical_agent")


@dataclass
class TechnicalSignal:
    symbol: str
    signal: str          # LONG / SHORT / HOLD
    confidence: float    # 0.0 - 1.0
    reasoning: str
    indicators: Dict
    price: float
    timestamp: float


def ema(prices: List[float], period: int) -> Optional[float]:
    if len(prices) < period:
        return None
    k = 2 / (period + 1)
    ema_val = sum(prices[:period]) / period
    for price in prices[period:]:
        ema_val = price * k + ema_val * (1 - k)
    return ema_val


def rsi(prices: List[float], period: int = 14) -> Optional[float]:
    if len(prices) < period + 1:
        return None
    deltas = [prices[i] - prices[i-1] for i in range(1, len(prices))]
    gains = [max(d, 0) for d in deltas[-period:]]
    losses = [abs(min(d, 0)) for d in deltas[-period:]]
    avg_gain = sum(gains) / period
    avg_loss = sum(losses) / period
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def macd(prices: List[float]) -> Tuple[Optional[float], Optional[float], Optional[float]]:
    """Returns (macd_line, signal_line, histogram)"""
    if len(prices) < 26:
        return None, None, None
    fast = ema(prices, 12)
    slow = ema(prices, 26)
    if fast is None or slow is None:
        return None, None, None
    macd_line = fast - slow
    # Signal line needs 9 periods of MACD — approximate with current
    return macd_line, macd_line * 0.95, macd_line - macd_line * 0.95


def bollinger_bands(prices: List[float], period: int = 20, std_dev: float = 2.0):
    """Returns (upper, middle, lower)"""
    if len(prices) < period:
        return None, None, None
    recent = prices[-period:]
    middle = sum(recent) / period
    variance = sum((p - middle) ** 2 for p in recent) / period
    std = variance ** 0.5
    return middle + std_dev * std, middle, middle - std_dev * std


def atr(highs: List[float], lows: List[float], closes: List[float], period: int = 14) -> Optional[float]:
    # Use aligned length — closes may include live candle (1 longer than highs/lows)
    n = min(len(highs), len(lows), len(closes))
    if n < period + 1:
        return None
    highs, lows, closes = highs[:n], lows[:n], closes[:n]
    trs = []
    for i in range(1, n):
        tr = max(highs[i] - lows[i], abs(highs[i] - closes[i-1]), abs(lows[i] - closes[i-1]))
        trs.append(tr)
    return sum(trs[-period:]) / period


class TechnicalAgent:
    """
    Analyzes market structure using technical indicators.
    Returns a signal with confidence score and detailed reasoning.
    Modeled after TradingAgents' Technical Analyst agent.
    """

    name = "TechnicalAgent"

    async def analyze(self, symbol: str, candle_store) -> Optional[TechnicalSignal]:
        closes = candle_store.get_closes(symbol, "1m", 100)
        highs = candle_store.get_highs(symbol, "1m", 100)
        lows = candle_store.get_lows(symbol, "1m", 100)
        volumes = candle_store.get_volumes(symbol, "1m", 100)

        if len(closes) < 5:
            return None  # Not enough data yet

        price = closes[-1]
        signals = []
        reasons = []
        indicators = {}

        # EMA Cross (8/21)
        ema8 = ema(closes, 8)
        ema21 = ema(closes, 21)
        ema50 = ema(closes[-60:], 50) if len(closes) >= 60 else None
        indicators["ema8"] = round(ema8, 4) if ema8 else None
        indicators["ema21"] = round(ema21, 4) if ema21 else None
        indicators["ema50"] = round(ema50, 4) if ema50 else None

        if ema8 and ema21:
            prev_ema8 = ema(closes[:-1], 8)
            prev_ema21 = ema(closes[:-1], 21)
            if prev_ema8 and prev_ema21:
                if prev_ema8 <= prev_ema21 and ema8 > ema21:
                    signals.append(1.0)
                    reasons.append("EMA8 crossed above EMA21 (bullish crossover)")
                elif prev_ema8 >= prev_ema21 and ema8 < ema21:
                    signals.append(-1.0)
                    reasons.append("EMA8 crossed below EMA21 (bearish crossover)")
                elif ema8 > ema21:
                    signals.append(0.5)
                    reasons.append(f"EMA8 ({ema8:.2f}) above EMA21 ({ema21:.2f}) — uptrend")
                else:
                    signals.append(-0.5)
                    reasons.append(f"EMA8 ({ema8:.2f}) below EMA21 ({ema21:.2f}) — downtrend")

        # RSI
        rsi_val = rsi(closes, 14)
        indicators["rsi"] = round(rsi_val, 2) if rsi_val else None
        if rsi_val:
            if rsi_val < 30:
                signals.append(1.0)
                reasons.append(f"RSI {rsi_val:.1f} oversold — potential reversal up")
            elif rsi_val > 70:
                signals.append(-1.0)
                reasons.append(f"RSI {rsi_val:.1f} overbought — potential reversal down")
            elif 40 < rsi_val < 60:
                signals.append(0.0)
                reasons.append(f"RSI {rsi_val:.1f} neutral")
            elif rsi_val >= 50:
                signals.append(0.3)
                reasons.append(f"RSI {rsi_val:.1f} bullish territory")
            else:
                signals.append(-0.3)
                reasons.append(f"RSI {rsi_val:.1f} bearish territory")

        # MACD
        macd_line, signal_line, histogram = macd(closes)
        indicators["macd"] = round(macd_line, 4) if macd_line else None
        indicators["macd_histogram"] = round(histogram, 4) if histogram else None
        if macd_line is not None:
            if macd_line > 0:
                signals.append(0.4)
                reasons.append(f"MACD {macd_line:.4f} positive (bullish momentum)")
            else:
                signals.append(-0.4)
                reasons.append(f"MACD {macd_line:.4f} negative (bearish momentum)")

        # Bollinger Bands
        bb_upper, bb_mid, bb_lower = bollinger_bands(closes, 20)
        indicators["bb_upper"] = round(bb_upper, 4) if bb_upper else None
        indicators["bb_lower"] = round(bb_lower, 4) if bb_lower else None
        if bb_upper and bb_lower:
            bb_position = (price - bb_lower) / (bb_upper - bb_lower)
            indicators["bb_position"] = round(bb_position, 3)
            if bb_position < 0.1:
                signals.append(0.8)
                reasons.append("Price near lower Bollinger Band — oversold squeeze")
            elif bb_position > 0.9:
                signals.append(-0.8)
                reasons.append("Price near upper Bollinger Band — overbought")
            elif bb_position > 0.5:
                signals.append(0.2)
                reasons.append(f"Price in upper BB zone ({bb_position:.2f})")
            else:
                signals.append(-0.2)
                reasons.append(f"Price in lower BB zone ({bb_position:.2f})")

        # ATR (volatility)
        atr_val = atr(highs, lows, closes, 14)
        indicators["atr"] = round(atr_val, 4) if atr_val else None
        if atr_val:
            atr_pct = (atr_val / price) * 100
            indicators["atr_pct"] = round(atr_pct, 3)
            if atr_pct > 2:
                reasons.append(f"⚠ High volatility ATR {atr_pct:.2f}%")

        # Volume trend
        if len(volumes) >= 10:
            recent_vol = sum(volumes[-3:]) / 3
            avg_vol = sum(volumes[-10:]) / 10
            vol_ratio = recent_vol / avg_vol if avg_vol > 0 else 1
            indicators["volume_ratio"] = round(vol_ratio, 2)
            if vol_ratio > 1.5:
                reasons.append(f"📈 Volume surge {vol_ratio:.1f}x average (confirms move)")
            elif vol_ratio < 0.5:
                reasons.append(f"📉 Low volume {vol_ratio:.1f}x average (weak conviction)")

        # Aggregate signal
        if not signals:
            return None

        avg_signal = sum(signals) / len(signals)

        if avg_signal > 0.3:
            direction = "LONG"
            confidence = min(avg_signal, 1.0)
        elif avg_signal < -0.3:
            direction = "SHORT"
            confidence = min(abs(avg_signal), 1.0)
        else:
            direction = "HOLD"
            confidence = 1 - abs(avg_signal)

        reasoning = f"Technical: {direction} ({confidence:.0%}) — " + " | ".join(reasons[:3])

        return TechnicalSignal(
            symbol=symbol,
            signal=direction,
            confidence=confidence,
            reasoning=reasoning,
            indicators=indicators,
            price=price,
            timestamp=time.time(),
        )
