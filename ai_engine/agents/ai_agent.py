"""
AI Reasoning Agent — uses Google Gemini Flash (free tier) for natural language analysis.
Inspired by TradingAgents multi-agent architecture.
Falls back to deterministic rule-based reasoning if no API key.
"""
import asyncio
import logging
import os
import time
import json
from typing import Dict, Optional, List
import random

log = logging.getLogger("ai_agent")

# Try to import Gemini
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


class GeminiClient:
    """Wrapper for Google Gemini Flash — free tier."""

    def __init__(self):
        self.available = False
        self.model = None
        self._last_call = 0
        self._min_interval = 4.1  # 15 RPM free tier = 4s between calls

        if GEMINI_AVAILABLE and GEMINI_API_KEY:
            try:
                genai.configure(api_key=GEMINI_API_KEY)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                self.available = True
                log.info("✅ Gemini Flash AI connected (free tier)")
            except Exception as e:
                log.warning(f"Gemini init failed: {e}")

    async def generate(self, prompt: str, max_tokens: int = 300) -> Optional[str]:
        if not self.available:
            return None

        # Rate limit: 15 RPM
        elapsed = time.time() - self._last_call
        if elapsed < self._min_interval:
            await asyncio.sleep(self._min_interval - elapsed)

        self._last_call = time.time()

        try:
            response = await asyncio.to_thread(
                self.model.generate_content,
                prompt,
                generation_config={"max_output_tokens": max_tokens, "temperature": 0.3}
            )
            return response.text.strip()
        except Exception as e:
            log.error(f"Gemini error: {e}")
            return None


# Singleton
_gemini = GeminiClient()


class SentimentAgent:
    """
    Market sentiment analysis.
    Uses Gemini if available, else simulates sentiment from price action.
    Modeled after TradingAgents Sentiment Analyst.
    """
    name = "SentimentAgent"

    MARKET_CONTEXTS = [
        "Bitcoin showing institutional accumulation patterns in daily structure",
        "Crypto market in risk-off mode following macro uncertainty",
        "BTC dominance rising — altcoins rotating into Bitcoin",
        "Fear & Greed Index in Greed zone — momentum buying continuing",
        "Options market showing bullish bias with call skew elevated",
        "Whale wallets accumulating on dips — smart money bullish",
        "Retail sentiment bearish while smart money positioning long",
        "Global liquidity expanding — risk assets supported",
    ]

    async def analyze(self, symbol: str, indicators: Dict, price: float) -> Dict:
        rsi_val = indicators.get("rsi", 50)
        ema8 = indicators.get("ema8")
        ema21 = indicators.get("ema21")
        vol_ratio = indicators.get("volume_ratio", 1.0)

        if _gemini.available:
            prompt = f"""You are a crypto market sentiment analyst. Analyze {symbol} at ${price:.2f}.
Technical context: RSI={rsi_val:.1f}, EMA8/21={'bullish' if ema8 and ema21 and ema8 > ema21 else 'bearish'}, Volume ratio={vol_ratio:.1f}x.
Give a 1-sentence sentiment assessment (BULLISH/BEARISH/NEUTRAL) with confidence 0-100%.
Format: SENTIMENT: [BULLISH/BEARISH/NEUTRAL] | CONFIDENCE: [0-100]% | REASON: [1 sentence]"""

            response = await _gemini.generate(prompt, max_tokens=100)
            if response:
                try:
                    parts = response.split("|")
                    sentiment = "NEUTRAL"
                    confidence = 50
                    reason = response
                    for p in parts:
                        p = p.strip()
                        if p.startswith("SENTIMENT:"):
                            s = p.replace("SENTIMENT:", "").strip().upper()
                            if "BULLISH" in s:
                                sentiment = "BULLISH"
                            elif "BEARISH" in s:
                                sentiment = "BEARISH"
                        elif p.startswith("CONFIDENCE:"):
                            try:
                                confidence = int(p.replace("CONFIDENCE:", "").replace("%", "").strip())
                            except:
                                pass
                        elif p.startswith("REASON:"):
                            reason = p.replace("REASON:", "").strip()
                    return {
                        "sentiment": sentiment,
                        "confidence": confidence / 100,
                        "reason": reason,
                        "source": "gemini",
                    }
                except Exception as e:
                    log.error(f"Gemini parse error: {e}")

        # Fallback: derive from technicals
        score = 0
        if rsi_val:
            if rsi_val > 60:
                score += 1
            elif rsi_val < 40:
                score -= 1
        if ema8 and ema21:
            score += 1 if ema8 > ema21 else -1
        if vol_ratio and vol_ratio > 1.3:
            score += 0.5 if score > 0 else -0.5

        context = random.choice(self.MARKET_CONTEXTS)
        if score > 0.5:
            return {"sentiment": "BULLISH", "confidence": 0.55 + min(score * 0.1, 0.3),
                    "reason": context, "source": "rule-based"}
        elif score < -0.5:
            return {"sentiment": "BEARISH", "confidence": 0.55 + min(abs(score) * 0.1, 0.3),
                    "reason": context, "source": "rule-based"}
        return {"sentiment": "NEUTRAL", "confidence": 0.4, "reason": context, "source": "rule-based"}


class RiskAgent:
    """
    Risk validation agent.
    Checks position sizing, drawdown limits, cooldown periods.
    Modeled after TradingAgents Risk Manager.
    """
    name = "RiskAgent"

    def __init__(self):
        self._trade_times: List[float] = []  # recent trade timestamps
        self.COOLDOWN_SECONDS = 60
        self.MAX_TRADES_PER_HOUR = 10

    async def validate(self, symbol: str, direction: str, confidence: float,
                       price: float, atr_pct: float, balance: float,
                       open_positions: int, daily_pnl: float,
                       initial_balance: float, runtime_state: Dict) -> Dict:

        risk_per_trade = float(runtime_state.get("risk_per_trade", 1.5) or 1.5)
        max_daily_loss_pct = 5.0
        max_drawdown_pct = 10.0

        issues = []
        approved = True

        # Min confidence threshold
        if confidence < 0.45:
            approved = False
            issues.append(f"Confidence {confidence:.0%} below 45% threshold")

        # Daily loss limit
        daily_loss_pct = abs(min(0, float(daily_pnl))) / float(initial_balance) * 100 if initial_balance else 0
        if daily_loss_pct >= max_daily_loss_pct:
            approved = False
            issues.append(f"Daily loss limit reached: {daily_loss_pct:.1f}%/{max_daily_loss_pct}%")

        # Max drawdown — cast Decimal→float for arithmetic
        peak = float(runtime_state.get("peak_balance", initial_balance) or initial_balance)
        drawdown = (peak - float(balance)) / peak * 100 if peak > 0 else 0
        if drawdown >= max_drawdown_pct:
            approved = False
            issues.append(f"Max drawdown reached: {drawdown:.1f}%/{max_drawdown_pct}%")

        # Max simultaneous positions
        if open_positions >= 3:
            approved = False
            issues.append(f"Max open positions (3) reached")

        # Cooldown check
        now = time.time()
        self._trade_times = [t for t in self._trade_times if now - t < 3600]
        if len(self._trade_times) >= self.MAX_TRADES_PER_HOUR:
            approved = False
            issues.append(f"Hourly trade limit ({self.MAX_TRADES_PER_HOUR}) reached")

        recent_trades = [t for t in self._trade_times if now - t < self.COOLDOWN_SECONDS]
        if recent_trades:
            wait = self.COOLDOWN_SECONDS - (now - recent_trades[-1])
            approved = False
            issues.append(f"Cooldown active: {wait:.0f}s remaining")

        # Volatility check
        if atr_pct and atr_pct > 3.5:
            approved = False
            issues.append(f"Extreme volatility ATR {atr_pct:.1f}% > 3.5%")

        # Position sizing
        risk_amount = balance * (risk_per_trade / 100)
        atr_based_sl = atr_pct / 100 * price * 2 if atr_pct else price * 0.01
        lot_size = risk_amount / atr_based_sl if atr_based_sl > 0 else 0.001
        lot_size = max(0.001, min(lot_size, balance * 0.05 / price))

        if approved:
            self._trade_times.append(now)

        reason = "✅ Risk approved" if approved else " | ".join(issues)

        return {
            "approved": approved,
            "reason": reason,
            "lot_size": round(lot_size, 6),
            "risk_amount": round(risk_amount, 2),
            "stop_loss_distance": round(atr_based_sl, 4),
            "daily_loss_pct": round(daily_loss_pct, 2),
            "drawdown_pct": round(drawdown, 2),
        }


class ReflectionAgent:
    """
    Post-trade reflection and learning.
    Inspired by Hermes Agent's memory system and agentmemory patterns.
    Stores lessons in PostgreSQL agent_memory table.
    """
    name = "ReflectionAgent"

    async def reflect(self, trade: Dict, memory_store) -> str:
        pnl = trade.get("pnl", 0)
        pnl_pct = trade.get("pnl_pct", 0)
        direction = trade.get("direction", "")
        symbol = trade.get("symbol", "")
        reasoning = trade.get("agent_reasoning", "")
        confidence = trade.get("confidence", 0)

        outcome = "WIN" if pnl > 0 else "LOSS"

        if _gemini.available:
            prompt = f"""You are a trading reflection agent. A paper trade just closed:
Symbol: {symbol} | Direction: {direction.upper()} | Outcome: {outcome}
P&L: ${pnl:.2f} ({pnl_pct:.2f}%) | Initial confidence: {confidence:.0%}
Original reasoning: {reasoning}

Write one key trading lesson from this trade (max 50 words). Be specific and actionable."""

            lesson = await _gemini.generate(prompt, max_tokens=100)
            if lesson:
                await memory_store(
                    agent_name="ReflectionAgent",
                    memory_type="trade_lesson",
                    content=lesson,
                    symbol=symbol,
                    importance=min(abs(pnl_pct) / 5, 1.0),
                    metadata={"outcome": outcome, "pnl": pnl, "confidence": confidence}
                )
                return lesson

        # Rule-based reflection
        if pnl > 0:
            lessons = [
                f"{symbol}: {direction.upper()} worked — confidence {confidence:.0%} was justified.",
                f"Pattern confirmed: technical signal + risk validation = profitable {outcome}.",
                f"Held discipline, respected SL/TP, result: +${pnl:.2f}.",
            ]
        else:
            lessons = [
                f"{symbol}: {direction.upper()} at {confidence:.0%} confidence failed — review indicators.",
                f"Loss of ${abs(pnl):.2f} — check if market was in ranging/low-liquidity phase.",
                f"Failed trade — consider higher confidence threshold or better entry timing.",
            ]

        lesson = random.choice(lessons)
        await memory_store(
            agent_name="ReflectionAgent",
            memory_type="trade_lesson",
            content=lesson,
            symbol=symbol,
            importance=0.5,
        )
        return lesson
