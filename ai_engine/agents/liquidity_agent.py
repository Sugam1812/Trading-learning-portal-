"""
Liquidity + Market Regime Agent.
Detects trending vs ranging, volatility regime, spread conditions.
Inspired by TradingAgents market analyst + Freqtrade's trend detection.
"""
import logging
from typing import Dict, List

log = logging.getLogger("liquidity_agent")

# Typical forex spreads in pips (simulated — tighter during London/NY)
FOREX_SPREADS = {
    "EUR/USD": 1.2,
    "GBP/USD": 1.8,
}


class LiquidityAgent:
    name = "LiquidityAgent"

    def analyze(self, symbol: str, closes: List[float], atr_pct: float) -> Dict:
        if len(closes) < 10:
            return {
                "regime": "UNKNOWN",
                "trending": False,
                "volatility": "NORMAL",
                "spread_pips": FOREX_SPREADS.get(symbol, 2.0),
                "spread_ok": True,
                "tradeable": True,
                "range_ratio": 0.5,
            }

        # Regime detection: directional efficiency ratio
        recent = closes[-20:] if len(closes) >= 20 else closes
        total_range = max(recent) - min(recent)
        avg_move = sum(abs(recent[i] - recent[i-1]) for i in range(1, len(recent))) / (len(recent) - 1)
        range_ratio = total_range / (avg_move * len(recent)) if avg_move > 0 else 0.5

        trending = range_ratio > 0.55
        regime = "TRENDING" if trending else "RANGING"

        # Volatility regime based on ATR % of price
        if atr_pct < 0.03:
            volatility = "LOW"
        elif atr_pct < 0.12:
            volatility = "NORMAL"
        elif atr_pct < 0.25:
            volatility = "HIGH"
        else:
            volatility = "EXTREME"

        spread_pips = FOREX_SPREADS.get(symbol, 2.0)
        spread_ok = spread_pips < 3.0
        tradeable = spread_ok and volatility != "EXTREME"

        return {
            "regime": regime,
            "trending": trending,
            "range_ratio": round(range_ratio, 3),
            "volatility": volatility,
            "spread_pips": spread_pips,
            "spread_ok": spread_ok,
            "tradeable": tradeable,
            "reason": f"{regime} market | Vol: {volatility} | Spread: {spread_pips:.1f}p",
        }
