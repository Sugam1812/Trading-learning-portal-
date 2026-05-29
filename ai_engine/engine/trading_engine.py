"""
Autonomous Trading Engine — the brain of the AI Fund.
Implements the full loop: Feed → Agents → Risk → Execute → Manage → Reflect.
Inspired by TradingAgents orchestration + Freqtrade's bot loop.
PAPER TRADING ONLY.
"""
import asyncio
import json
import logging
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Callable

from engine.market_feed import market_feed, SYMBOLS, get_session
from engine.position_manager import PositionManager
from agents.technical_agent import TechnicalAgent
from agents.ai_agent import SentimentAgent, RiskAgent, ReflectionAgent
from agents.macro_agent import MacroAgent
from agents.liquidity_agent import LiquidityAgent
from agents.strategy_agent import StrategyResearchAgent
from db import database as db

log = logging.getLogger("trading_engine")

ANALYSIS_INTERVAL = 30  # seconds between analysis cycles
POSITION_UPDATE_INTERVAL = 2  # seconds between position price checks


class TradingEngine:
    """
    The autonomous AI trading engine.
    All operations are paper trading — zero real money.
    """

    def __init__(self):
        self.running = False
        self._tasks: List[asyncio.Task] = []
        self._broadcast: Optional[Callable] = None

        # Agents (modeled after TradingAgents multi-agent architecture)
        self.technical = TechnicalAgent()
        self.sentiment = SentimentAgent()
        self.risk = RiskAgent()
        self.reflection = ReflectionAgent()
        self.macro = MacroAgent()
        self.liquidity = LiquidityAgent()
        self.strategy_research = StrategyResearchAgent()

        # Position management
        self.positions = PositionManager()
        self.positions.on_close(self._on_position_closed)
        self.positions.on_update(self._on_position_update)

        # State — $5,000 demo forex account
        self._balance = 5000.0
        self._initial_balance = 5000.0
        self._peak_balance = 5000.0
        self._agent_status = {
            "TechnicalAgent": "idle",
            "SentimentAgent": "idle",
            "MacroAgent": "idle",
            "LiquidityAgent": "idle",
            "RiskAgent": "idle",
            "PortfolioManager": "idle",
            "ReflectionAgent": "idle",
            "StrategyResearchAgent": "idle",
        }
        self._cycle_count = 0
        self._last_analysis: Dict[str, float] = {}  # symbol -> timestamp

    def set_broadcaster(self, broadcaster: Callable):
        self._broadcast = broadcaster

    async def _emit(self, event_type: str, data: dict):
        if self._broadcast:
            await self._broadcast(event_type, data)

    async def _log_agent(self, agent: str, message: str, level: str = "info",
                          symbol: str = None, data: dict = None):
        self._agent_status[agent] = level
        ts = datetime.now(timezone.utc).strftime("%H:%M:%S")
        log_entry = {
            "timestamp": ts,
            "agent": agent,
            "message": message,
            "level": level,
            "symbol": symbol,
        }
        await self._emit("agent_log", log_entry)
        try:
            await db.log_agent(agent, message, level, symbol, data)
        except Exception:
            pass

    async def start(self):
        if self.running:
            return

        log.info("🚀 Starting Autonomous AI Trading Engine")
        self.running = True

        # Load persisted state
        state = await db.get_runtime_state()
        if state:
            self._balance = float(state.get("current_balance", 5000))
            self._initial_balance = float(state.get("initial_balance", 5000))
            self._peak_balance = float(state.get("peak_balance", 5000))

        await db.update_runtime_state(
            is_active=True,
            started_at=datetime.now(timezone.utc)
        )

        # Register market feed callback
        market_feed.on_update(self._on_market_event)

        # Start background tasks
        self._tasks = [
            asyncio.create_task(self._market_feed_task()),
            asyncio.create_task(self._analysis_loop()),
            asyncio.create_task(self._position_monitor_loop()),
        ]

        await self._emit("runtime", {"status": "started", "balance": self._balance})
        await self._log_agent("PortfolioManager", "🚀 AI Fund ONLINE — autonomous trading active", "signal")

    async def stop(self):
        if not self.running:
            return

        log.info("Stopping trading engine...")
        self.running = False

        # Cancel tasks
        for task in self._tasks:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
        self._tasks = []

        await market_feed.stop()
        await db.update_runtime_state(
            is_active=False,
            stopped_at=datetime.now(timezone.utc),
            current_balance=self._balance,
            peak_balance=self._peak_balance,
        )

        await self._emit("runtime", {"status": "stopped", "balance": self._balance})
        await self._log_agent("PortfolioManager", "⏹ AI Fund OFFLINE", "warning")

    async def _market_feed_task(self):
        """Runs the Binance WebSocket feed."""
        try:
            await market_feed.start()
        except asyncio.CancelledError:
            pass

    async def _on_market_event(self, event_type: str, data: dict):
        """Receives events from the Binance WebSocket feed."""
        if event_type == "ticker":
            await self._emit("ticker", data)
        elif event_type == "candle" and data.get("is_closed"):
            await self._emit("candle", data)
        elif event_type == "connected":
            await self._log_agent("PortfolioManager", "📡 Live forex feed connected — streaming EUR/USD, GBP/USD", "signal")

    async def _analysis_loop(self):
        """
        Main AI analysis cycle.
        Every 30s: analyze markets → generate signals → validate → execute.
        """
        # Wait for initial candles to accumulate
        await asyncio.sleep(5)
        await self._log_agent("TechnicalAgent", "Initializing market analysis...", "info")

        while self.running:
            try:
                self._cycle_count += 1
                await self._run_cycle()
                await asyncio.sleep(ANALYSIS_INTERVAL)
            except asyncio.CancelledError:
                break
            except Exception as e:
                log.error(f"Analysis loop error: {e}", exc_info=True)
                await asyncio.sleep(10)

    async def _run_cycle(self):
        """One full analysis cycle across all symbols."""
        # Emit session + strategy info every cycle
        session = self.macro.get_session()
        strategy_status = self.strategy_research.get_status()
        await self._emit("session_info", {
            "session": session,
            "strategy": strategy_status["active_strategy"],
            "strategy_id": strategy_status["strategy_id"],
        })

        for symbol in SYMBOLS:
            last = self._last_analysis.get(symbol, 0)
            if time.time() - last < ANALYSIS_INTERVAL * 0.8:
                continue

            self._last_analysis[symbol] = time.time()

            try:
                await self._analyze_symbol(symbol)
            except Exception as e:
                log.error(f"Error analyzing {symbol}: {e}")

    async def _analyze_symbol(self, symbol: str):
        """Full agent pipeline for one symbol."""
        candle_count = market_feed.candle_store.count(symbol, "1m")
        if candle_count < 5:
            await self._log_agent("TechnicalAgent",
                f"{symbol}: Accumulating data... {candle_count}/5 candles", "info", symbol)
            return

        price = market_feed.get_price(symbol)
        if not price:
            return

        # === TECHNICAL AGENT ===
        self._agent_status["TechnicalAgent"] = "analyzing"
        await self._emit("agent_status", self._agent_status)

        tech_signal = await self.technical.analyze(symbol, market_feed.candle_store)
        if not tech_signal:
            return

        await self._log_agent("TechnicalAgent",
            f"{symbol} @ {price:.5f} — {tech_signal.signal} ({tech_signal.confidence:.0%}) | {tech_signal.reasoning[:80]}",
            "signal" if tech_signal.signal != "HOLD" else "info", symbol,
            {"indicators": tech_signal.indicators})

        self._agent_status["TechnicalAgent"] = "idle"

        if tech_signal.signal == "HOLD":
            return

        # === MACRO AGENT (session + news) ===
        self._agent_status["MacroAgent"] = "analyzing"
        await self._emit("agent_status", self._agent_status)

        macro_result = await self.macro.analyze(symbol, price)
        await self._log_agent("MacroAgent",
            f"{symbol}: {macro_result['session']} session (bias {macro_result['session_bias']:.0%}) | "
            f"{macro_result['news_context'][:70]}",
            "info" if macro_result["trading_recommended"] else "warning", symbol)

        self._agent_status["MacroAgent"] = "idle"
        await self._emit("agent_status", self._agent_status)

        if not macro_result["trading_recommended"]:
            await self._log_agent("MacroAgent",
                f"{symbol}: ⚠ {macro_result['session']} session — low liquidity, skipping",
                "warning", symbol)
            return

        # === LIQUIDITY AGENT (regime + spread) ===
        self._agent_status["LiquidityAgent"] = "analyzing"
        await self._emit("agent_status", self._agent_status)

        closes_for_liquidity = market_feed.candle_store.get_closes(symbol, "1m", 50)
        atr_pct_for_liq = tech_signal.indicators.get("atr_pct", 0.08) or 0.08
        liquidity_result = self.liquidity.analyze(symbol, closes_for_liquidity, atr_pct_for_liq)
        await self._log_agent("LiquidityAgent",
            f"{symbol}: {liquidity_result['regime']} | Vol: {liquidity_result['volatility']} "
            f"| Spread: {liquidity_result['spread_pips']:.1f}p | Tradeable: {liquidity_result['tradeable']}",
            "info" if liquidity_result["tradeable"] else "warning", symbol)

        self._agent_status["LiquidityAgent"] = "idle"
        await self._emit("agent_status", self._agent_status)

        if not liquidity_result["tradeable"]:
            return

        # === SENTIMENT AGENT ===
        self._agent_status["SentimentAgent"] = "analyzing"
        await self._emit("agent_status", self._agent_status)

        sentiment = await self.sentiment.analyze(symbol, tech_signal.indicators, price)

        await self._log_agent("SentimentAgent",
            f"{symbol}: {sentiment['sentiment']} ({sentiment['confidence']:.0%}) — {sentiment['reason'][:80]}",
            "signal", symbol)

        self._agent_status["SentimentAgent"] = "idle"

        # Consensus check: technical + sentiment must agree
        tech_bull = tech_signal.signal == "LONG"
        sent_bull = sentiment["sentiment"] == "BULLISH"
        tech_bear = tech_signal.signal == "SHORT"
        sent_bear = sentiment["sentiment"] == "BEARISH"

        consensus = (tech_bull and sent_bull) or (tech_bear and sent_bear)

        # RSI extreme override: high-confidence extreme RSI signal bypasses sentiment consensus
        rsi_val = tech_signal.indicators.get("rsi")
        rsi_extreme = rsi_val is not None and (rsi_val < 30 or rsi_val > 70)
        rsi_override = not consensus and tech_signal.confidence >= 0.70 and rsi_extreme

        if not consensus and not rsi_override:
            await self._log_agent("PortfolioManager",
                f"{symbol}: Technical + Sentiment DISAGREE — skipping trade", "info", symbol)
            return

        # Combined confidence (RSI override carries a 50% size penalty)
        if rsi_override:
            combined_confidence = tech_signal.confidence * 0.5
            await self._log_agent("PortfolioManager",
                f"{symbol}: ⚡ RSI EXTREME OVERRIDE {rsi_val:.1f} — proceeding with 50% position size",
                "warning", symbol)
        else:
            combined_confidence = tech_signal.confidence * 0.6 + sentiment["confidence"] * 0.4

        direction = "long" if tech_signal.signal == "LONG" else "short"

        # === RISK AGENT ===
        self._agent_status["RiskAgent"] = "validating"
        await self._emit("agent_status", self._agent_status)

        open_positions = self.positions.get_open_positions()
        already_in_symbol = any(p["symbol"] == symbol for p in open_positions)
        if already_in_symbol:
            return  # Already have a position in this symbol

        state = await db.get_runtime_state()
        daily_pnl = await db.get_daily_pnl()
        atr_pct = tech_signal.indicators.get("atr_pct", 1.0) or 1.0

        risk_result = await self.risk.validate(
            symbol=symbol,
            direction=direction,
            confidence=combined_confidence,
            price=price,
            atr_pct=atr_pct,
            balance=self._balance,
            open_positions=len(open_positions),
            daily_pnl=daily_pnl,
            initial_balance=self._initial_balance,
            runtime_state=dict(state) if state else {},
        )

        await self._log_agent("RiskAgent",
            f"{symbol}: {risk_result['reason']}",
            "signal" if risk_result["approved"] else "warning", symbol)

        self._agent_status["RiskAgent"] = "idle"

        if not risk_result["approved"]:
            return

        # === PORTFOLIO MANAGER — EXECUTE TRADE ===
        self._agent_status["PortfolioManager"] = "executing"
        await self._emit("agent_status", self._agent_status)

        atr_val = tech_signal.indicators.get("atr", price * 0.01) or price * 0.01
        entry_params = self.positions.calculate_entry(direction, price, atr_val)

        lot_size = risk_result["lot_size"]
        position_value = lot_size * price

        reasoning = (
            f"Tech: {tech_signal.reasoning} | "
            f"Sentiment: {sentiment['sentiment']} {sentiment['confidence']:.0%} | "
            f"Combined confidence: {combined_confidence:.0%} | "
            f"Risk: {risk_result['reason']}"
        )

        trade_data = {
            "symbol": symbol,
            "direction": direction,
            "status": "opened",
            "entry_price": entry_params["entry_price"],
            "stop_loss": entry_params["stop_loss"],
            "take_profit": entry_params["take_profit"],
            "trailing_stop": entry_params["trailing_stop_distance"],
            "lot_size": lot_size,
            "position_value": round(position_value, 2),
            "confidence": round(combined_confidence, 3),
            "signal_source": "ai_multi_agent",
            "agent_reasoning": reasoning[:500],
            "timeframe": "1m",
            "risk_reward": entry_params["risk_reward"],
            "opened_at": datetime.now(timezone.utc),
            "fees": round(position_value * 0.001, 4),
        }

        trade_id = await db.insert_trade(trade_data)
        trade_data["id"] = trade_id
        trade_data["trailing_stop_distance"] = entry_params["trailing_stop_distance"]

        self.positions.add_position(trade_data)

        # Log and broadcast
        await self._log_agent("PortfolioManager",
            f"📈 OPENED {direction.upper()} #{trade_id} {symbol} @ {entry_params['entry_price']:.5f} | "
            f"SL: {entry_params['stop_loss']:.5f} | TP: {entry_params['take_profit']:.5f} | "
            f"R:R {entry_params['risk_reward']:.2f}:1 | Size: {lot_size:.6f}",
            "signal", symbol)

        await self._emit("trade_opened", trade_data)
        await self._update_balance_display()

        self._agent_status["PortfolioManager"] = "idle"
        await self._emit("agent_status", self._agent_status)

        # Save signal to DB
        await db.insert_signal({
            "symbol": symbol,
            "timeframe": "1m",
            "signal": tech_signal.signal,
            "confidence": round(combined_confidence, 3),
            "technical_score": round(tech_signal.confidence, 3),
            "sentiment_score": round(sentiment["confidence"], 3),
            "price": price,
            "indicators": json.dumps(tech_signal.indicators),
            "acted_on": True,
        })

    async def _position_monitor_loop(self):
        """Monitors open positions every 2 seconds."""
        while self.running:
            try:
                prices = {sym: market_feed.get_price(sym) for sym in SYMBOLS}
                prices = {k: v for k, v in prices.items() if v}

                if prices and self.positions.get_open_positions():
                    closed_trades = await self.positions.update_prices(prices)
                    for trade in closed_trades:
                        pass  # handled by _on_position_closed callback

                await asyncio.sleep(POSITION_UPDATE_INTERVAL)
            except asyncio.CancelledError:
                break
            except Exception as e:
                log.error(f"Position monitor error: {e}")
                await asyncio.sleep(5)

    async def _on_position_closed(self, trade: Dict):
        """Called when position hits SL or TP."""
        pnl = trade["pnl"]
        self._balance = round(self._balance + pnl, 2)
        if self._balance > self._peak_balance:
            self._peak_balance = self._balance

        # Update DB
        await db.update_trade(
            trade["id"],
            status="closed",
            exit_price=trade["exit_price"],
            pnl=trade["pnl"],
            pnl_pct=trade["pnl_pct"],
            fees=trade.get("fees", 0),
            closed_at=trade["closed_at"],
        )

        await db.update_runtime_state(
            current_balance=self._balance,
            peak_balance=self._peak_balance,
        )

        emoji = "💚" if pnl > 0 else "🔴"
        await self._log_agent("PortfolioManager",
            f"{emoji} CLOSED #{trade['id']} {trade['direction'].upper()} {trade['symbol']} "
            f"@ {trade['exit_price']:.5f} | P&L: ${pnl:+.2f} ({trade['pnl_pct']:+.2f}%) "
            f"| Balance: ${self._balance:,.2f} | Reason: {trade.get('close_reason', '')}",
            "signal" if pnl > 0 else "warning", trade["symbol"])

        await self._emit("trade_closed", {**trade, "balance": self._balance})
        await self._update_balance_display()

        # === STRATEGY RESEARCH AGENT — record + evaluate ===
        self._agent_status["StrategyResearchAgent"] = "reflecting"
        await self._emit("agent_status", self._agent_status)

        active_strat = self.strategy_research.get_active_strategy_id()
        self.strategy_research.record_trade(active_strat, float(trade["pnl"]))

        # Check if strategy needs to evolve
        current_regime = "TRENDING"  # default; ideally from last liquidity analysis
        evolution_msg = await self.strategy_research.evaluate_and_evolve(current_regime)
        if evolution_msg:
            await self._log_agent("StrategyResearchAgent", evolution_msg, "warning", trade["symbol"])
            # Broadcast updated strategy info
            strat_status = self.strategy_research.get_status()
            await self._emit("session_info", {
                "session": self.macro.get_session(),
                "strategy": strat_status["active_strategy"],
                "strategy_id": strat_status["strategy_id"],
            })
        else:
            strat_status = self.strategy_research.get_status()
            await self._log_agent("StrategyResearchAgent",
                f"Strategy '{strat_status['active_strategy']}': "
                f"{strat_status['trades']} trades | WR {strat_status['win_rate']:.1f}% | "
                f"P&L ${strat_status['total_pnl']:+.2f}",
                "info", trade["symbol"])

        self._agent_status["StrategyResearchAgent"] = "idle"
        await self._emit("agent_status", self._agent_status)

        # === REFLECTION AGENT ===
        self._agent_status["ReflectionAgent"] = "reflecting"
        await self._emit("agent_status", self._agent_status)

        lesson = await self.reflection.reflect(trade, db.save_memory)
        await self._log_agent("ReflectionAgent",
            f"💭 Reflection on #{trade['id']}: {lesson[:100]}", "info", trade["symbol"])

        self._agent_status["ReflectionAgent"] = "idle"
        await self._emit("agent_status", self._agent_status)

    async def _on_position_update(self, trade_id: int, pos: Dict):
        """Called every 2s with live P&L for open positions."""
        await self._emit("position_update", {
            "id": trade_id,
            "symbol": pos["symbol"],
            "direction": pos["direction"],
            "entry_price": pos["entry_price"],
            "current_price": pos.get("current_price"),
            "live_pnl": pos.get("live_pnl", 0),
            "live_pnl_pct": pos.get("live_pnl_pct", 0),
            "stop_loss": pos["stop_loss"],
            "take_profit": pos["take_profit"],
            "trailing_activated": pos.get("trailing_activated", False),
            "status": "managing",
        })

    async def _update_balance_display(self):
        state = await db.get_runtime_state()
        total_pnl = self._balance - self._initial_balance
        drawdown = (self._peak_balance - self._balance) / self._peak_balance * 100 if self._peak_balance > 0 else 0
        open_pos = self.positions.get_open_positions()

        await self._emit("balance_update", {
            "balance": self._balance,
            "initial_balance": self._initial_balance,
            "total_pnl": round(total_pnl, 2),
            "total_pnl_pct": round(total_pnl / self._initial_balance * 100, 3),
            "drawdown_pct": round(drawdown, 2),
            "peak_balance": self._peak_balance,
            "open_positions": len(open_pos),
        })

    def get_status(self) -> Dict:
        open_pos = self.positions.get_open_positions()
        total_pnl = self._balance - self._initial_balance
        return {
            "running": self.running,
            "balance": self._balance,
            "initial_balance": self._initial_balance,
            "total_pnl": round(total_pnl, 2),
            "total_pnl_pct": round(total_pnl / self._initial_balance * 100, 3),
            "open_positions": len(open_pos),
            "cycle_count": self._cycle_count,
            "market_connected": market_feed.connected,
            "agent_status": self._agent_status,
        }


# Global singleton
trading_engine = TradingEngine()
