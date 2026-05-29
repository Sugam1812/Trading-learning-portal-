"""
Position Manager — real-time position monitoring with SL/TP/trailing stops.
Inspired by Freqtrade's trade management architecture.
PAPER TRADING ONLY — no real orders.
"""
import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Callable

log = logging.getLogger("position_manager")

FEE_RATE = 0.00005      # 0.005% per trade (forex broker spread cost)
SLIPPAGE_RATE = 0.0001  # 0.01% slippage simulation (forex typical)

MIN_SL_PIPS = 10        # Minimum 10-pip stop loss
PIP = 0.0001            # 1 pip for 4-decimal forex pairs (EUR/USD, GBP/USD)
MIN_RR = 2.0            # Minimum 1:2 risk:reward enforced


class PositionManager:
    """
    Manages all open paper positions.
    Checks SL/TP every price update, handles trailing stops.
    """

    def __init__(self):
        self._positions: Dict[int, Dict] = {}  # trade_id -> position data
        self._close_callbacks: List[Callable] = []
        self._update_callbacks: List[Callable] = []

    def on_close(self, callback: Callable):
        self._close_callbacks.append(callback)

    def on_update(self, callback: Callable):
        self._update_callbacks.append(callback)

    def add_position(self, trade: Dict):
        self._positions[trade["id"]] = {
            **trade,
            "trailing_activated": False,
            "highest_price": trade["entry_price"],
            "lowest_price": trade["entry_price"],
        }
        log.info(f"Position opened: #{trade['id']} {trade['direction'].upper()} {trade['symbol']} @ {trade['entry_price']}")

    def remove_position(self, trade_id: int):
        self._positions.pop(trade_id, None)

    def get_open_positions(self) -> List[Dict]:
        return list(self._positions.values())

    def get_position(self, trade_id: int) -> Optional[Dict]:
        return self._positions.get(trade_id)

    async def update_prices(self, prices: Dict[str, float]) -> List[Dict]:
        """Called every price tick. Returns list of closed trades."""
        closed = []

        for trade_id, pos in list(self._positions.items()):
            symbol = pos["symbol"]
            price = prices.get(symbol)
            if not price:
                continue

            direction = pos["direction"]
            entry = pos["entry_price"]
            sl = pos["stop_loss"]
            tp = pos["take_profit"]
            lot = pos["lot_size"]

            # Track price extremes for trailing
            if direction == "long":
                pos["highest_price"] = max(pos["highest_price"], price)
            else:
                pos["lowest_price"] = min(pos["lowest_price"], price)

            # Trailing stop (activates after 15-pip / 0.15% move in favor)
            trail_distance = pos.get("trailing_stop_distance")
            if trail_distance:
                if direction == "long" and pos["highest_price"] > entry * 1.0015:
                    new_sl = pos["highest_price"] * (1 - trail_distance)
                    if new_sl > pos["stop_loss"]:
                        pos["stop_loss"] = new_sl
                        sl = new_sl
                        if not pos["trailing_activated"]:
                            pos["trailing_activated"] = True
                            log.info(f"#{trade_id} trailing stop activated at {sl:.5f}")
                elif direction == "short" and pos["lowest_price"] < entry * 0.9985:
                    new_sl = pos["lowest_price"] * (1 + trail_distance)
                    if new_sl < pos["stop_loss"]:
                        pos["stop_loss"] = new_sl
                        sl = new_sl

            # Calculate live P&L
            if direction == "long":
                pips_pct = (price - entry) / entry
                close_triggered = price <= sl or price >= tp
                exit_price = sl if price <= sl else tp
            else:
                pips_pct = (entry - price) / entry
                close_triggered = price >= sl or price <= tp
                exit_price = sl if price >= sl else tp

            live_pnl = pips_pct * pos["position_value"]
            pos["live_pnl"] = round(live_pnl, 2)
            pos["live_pnl_pct"] = round(pips_pct * 100, 3)
            pos["current_price"] = price

            # Notify live updates
            for cb in self._update_callbacks:
                try:
                    await cb(trade_id, pos)
                except Exception:
                    pass

            if close_triggered:
                closed_trade = await self._close_position(trade_id, pos, exit_price, prices)
                closed.append(closed_trade)

        return closed

    async def emergency_close_all(self, prices: Dict[str, float]) -> List[Dict]:
        """Close all positions immediately (risk shutdown)."""
        log.warning("⚠ EMERGENCY CLOSE ALL POSITIONS")
        closed = []
        for trade_id, pos in list(self._positions.items()):
            price = prices.get(pos["symbol"], pos["entry_price"])
            closed.append(await self._close_position(trade_id, pos, price, prices, reason="emergency"))
        return closed

    async def _close_position(self, trade_id: int, pos: Dict,
                               exit_price: float, prices: Dict,
                               reason: str = "sl_tp") -> Dict:
        entry = pos["entry_price"]
        direction = pos["direction"]
        lot = pos["lot_size"]
        pos_val = pos["position_value"]

        # Apply slippage to exit
        slippage = exit_price * SLIPPAGE_RATE
        if direction == "long":
            exit_price = exit_price - slippage  # worse fill
            pnl_pct = (exit_price - entry) / entry
        else:
            exit_price = exit_price + slippage
            pnl_pct = (entry - exit_price) / entry

        pnl = pnl_pct * pos_val
        fees = pos_val * FEE_RATE  # exit fee
        pnl -= fees

        sl_tolerance = PIP * 2  # 2-pip tolerance for SL/TP classification
        close_reason = "STOP_LOSS" if (
            (direction == "long" and exit_price <= pos["stop_loss"] + sl_tolerance) or
            (direction == "short" and exit_price >= pos["stop_loss"] - sl_tolerance)
        ) else "TAKE_PROFIT"
        if reason == "emergency":
            close_reason = "EMERGENCY"

        closed_trade = {
            **pos,
            "exit_price": round(exit_price, 4),
            "pnl": round(pnl, 2),
            "pnl_pct": round(pnl_pct * 100, 3),
            "fees": round(fees, 4),
            "close_reason": close_reason,
            "closed_at": datetime.now(timezone.utc),
            "status": "closed",
        }

        del self._positions[trade_id]

        emoji = "✅" if pnl > 0 else "❌"
        log.info(f"{emoji} #{trade_id} {direction.upper()} {pos['symbol']} closed @ {exit_price:.5f} | P&L: ${pnl:.2f} ({pnl_pct*100:.3f}%)")

        for cb in self._close_callbacks:
            try:
                await cb(closed_trade)
            except Exception as e:
                log.error(f"Close callback error: {e}")

        return closed_trade

    def calculate_entry(self, direction: str, price: float,
                        atr_distance: float) -> Dict[str, float]:
        """
        Calculate forex entry, SL, TP.
        Enforces: min 10-pip SL, min 1:2 RR, realistic pip precision.
        """
        slippage = price * SLIPPAGE_RATE
        fee = price * FEE_RATE

        # SL distance: use ATR but enforce minimum 10 pips
        min_sl_distance = MIN_SL_PIPS * PIP
        sl_distance = max(atr_distance * 1.5, min_sl_distance)

        # TP must be at least 2x the SL distance (1:2 RR minimum)
        tp_distance = max(sl_distance * MIN_RR, sl_distance * 2.0)

        if direction == "long":
            entry = round(price + slippage + fee, 5)
            sl = round(entry - sl_distance, 5)
            tp = round(entry + tp_distance, 5)
        else:
            entry = round(price - slippage - fee, 5)
            sl = round(entry + sl_distance, 5)
            tp = round(entry - tp_distance, 5)

        rr = tp_distance / sl_distance if sl_distance > 0 else MIN_RR
        trail_distance = 0.0015  # 15-pip trailing stop for forex

        return {
            "entry_price": entry,
            "stop_loss": sl,
            "take_profit": tp,
            "risk_reward": round(rr, 2),
            "trailing_stop_distance": trail_distance,
        }
