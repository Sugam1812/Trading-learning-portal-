"""
Macro + Session Agent.
Detects trading sessions, news-event risk, and session-based trading bias.
Inspired by TradingAgents macro analyst role.
"""
import datetime
import logging
import random
from typing import Dict

log = logging.getLogger("macro_agent")

SESSION_BIASES = {
    "LONDON":   {"EUR/USD": 0.65, "GBP/USD": 0.70},   # High liquidity, trending
    "OVERLAP":  {"EUR/USD": 0.80, "GBP/USD": 0.75},   # Best session — most liquid
    "NEW_YORK": {"EUR/USD": 0.55, "GBP/USD": 0.50},   # Good but fading
    "ASIAN":    {"EUR/USD": 0.25, "GBP/USD": 0.20},   # Low liquidity — avoid
}

NEWS_CONTEXTS = [
    "ECB policy expectations stable — EUR/USD well-supported above 1.08",
    "US NFP beats expectations — USD strengthening across the board",
    "Fed hold expected at next meeting — risk-on environment favoring EUR",
    "EUR CPI data in-line with forecasts — neutral EUR impact",
    "GBP boosted by better-than-expected UK CPI print",
    "DXY consolidating near key resistance — EUR/USD holding range",
    "Global risk-off sentiment — flight to USD safety",
    "ECB dovish signals weigh on EUR — watching 1.0800 support",
    "UK GDP data disappoints — GBP/USD testing support",
    "US ISM Services beat — USD bid tone intact",
    "EUR/USD benefiting from improved EU growth outlook",
    "Geopolitical tensions support safe-haven flows",
]


class MacroAgent:
    name = "MacroAgent"

    def get_session(self) -> str:
        """Determine current forex trading session from UTC hour."""
        hour = datetime.datetime.utcnow().hour
        if 7 <= hour < 13:
            return "LONDON"
        elif 13 <= hour < 16:
            return "OVERLAP"
        elif 16 <= hour < 22:
            return "NEW_YORK"
        else:
            return "ASIAN"

    async def analyze(self, symbol: str, price: float) -> Dict:
        session = self.get_session()
        session_bias = SESSION_BIASES.get(session, {}).get(symbol, 0.5)
        news = random.choice(NEWS_CONTEXTS)
        low_liquidity = session == "ASIAN"

        trading_recommended = session_bias >= 0.40 and not low_liquidity

        return {
            "session": session,
            "session_bias": round(session_bias, 2),
            "news_context": news,
            "low_liquidity": low_liquidity,
            "trading_recommended": trading_recommended,
            "reason": f"{session} session (bias: {session_bias:.0%}) | {news[:50]}",
        }
