"""
Strategy Research Agent — self-improving autonomous strategy engine.
Monitors performance degradation, evolves strategies automatically.
Inspired by TradingAgents + FinRL + vectorbt research patterns.
PAPER TRADING ONLY.
"""
import logging
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional

log = logging.getLogger("strategy_agent")

# Strategy library — each strategy has a regime affinity and parameters
STRATEGY_LIBRARY: Dict[str, Dict] = {
    "trend_following": {
        "name": "EMA Trend Following",
        "description": "Trade EMA 8/21 crossovers with RSI momentum confirmation",
        "params": {"ema_fast": 8, "ema_slow": 21, "rsi_confirm_min": 45, "rsi_confirm_max": 65},
        "regime": "TRENDING",
        "sessions": ["LONDON", "OVERLAP", "NEW_YORK"],
    },
    "mean_reversion": {
        "name": "Bollinger Band Reversion",
        "description": "Mean-revert from BB extremes with RSI divergence",
        "params": {"bb_period": 20, "bb_std": 2.0, "rsi_buy": 30, "rsi_sell": 70},
        "regime": "RANGING",
        "sessions": ["ALL"],
    },
    "breakout": {
        "name": "Volatility Breakout",
        "description": "Trade breakouts from ATR compression with volume confirmation",
        "params": {"atr_mult": 1.5, "compression_candles": 10, "vol_mult": 1.3},
        "regime": "TRENDING",
        "sessions": ["LONDON", "OVERLAP"],
    },
    "session_momentum": {
        "name": "London Open Momentum",
        "description": "Ride directional momentum at London session open",
        "params": {"session": "LONDON", "lookback_candles": 5, "min_atr_pct": 0.05},
        "regime": "TRENDING",
        "sessions": ["LONDON", "OVERLAP"],
    },
}


@dataclass
class StrategyPerformance:
    strategy_id: str
    trades: int = 0
    wins: int = 0
    losses: int = 0
    total_pnl: float = 0.0
    consecutive_losses: int = 0
    last_updated: float = field(default_factory=time.time)

    @property
    def win_rate(self) -> float:
        return self.wins / self.trades if self.trades > 0 else 0.0

    @property
    def profit_factor(self) -> float:
        gross_wins = self.total_pnl if self.total_pnl > 0 else 0
        gross_loss = abs(self.total_pnl) if self.total_pnl < 0 else 0
        return gross_wins / gross_loss if gross_loss > 0 else 1.0

    @property
    def is_degraded(self) -> bool:
        """Degraded = 5+ trades AND (win rate < 40% OR 3+ consecutive losses)."""
        return self.trades >= 5 and (self.win_rate < 0.40 or self.consecutive_losses >= 3)


class StrategyResearchAgent:
    name = "StrategyResearchAgent"

    def __init__(self):
        self.active_strategy = "trend_following"
        self._performance: Dict[str, StrategyPerformance] = {
            sid: StrategyPerformance(strategy_id=sid)
            for sid in STRATEGY_LIBRARY
        }

    def get_active_strategy(self) -> Dict:
        return STRATEGY_LIBRARY[self.active_strategy]

    def get_active_strategy_id(self) -> str:
        return self.active_strategy

    def record_trade(self, strategy_id: str, pnl: float):
        if strategy_id not in self._performance:
            self._performance[strategy_id] = StrategyPerformance(strategy_id=strategy_id)
        p = self._performance[strategy_id]
        p.trades += 1
        p.total_pnl += pnl
        if pnl > 0:
            p.wins += 1
            p.consecutive_losses = 0
        else:
            p.losses += 1
            p.consecutive_losses += 1
        p.last_updated = time.time()
        log.debug(f"Strategy '{strategy_id}' recorded: P&L ${pnl:.2f} | WR: {p.win_rate:.0%} | Trades: {p.trades}")

    async def evaluate_and_evolve(self, current_regime: str = "TRENDING") -> Optional[str]:
        """
        Check if the active strategy is degraded.
        If so, find the best-performing alternative for the current regime.
        Returns an evolution message if strategy switched, None otherwise.
        """
        active_perf = self._performance.get(self.active_strategy)
        if not active_perf or not active_perf.is_degraded:
            return None

        log.info(f"Strategy '{self.active_strategy}' degraded — searching for replacement...")

        best_strategy: Optional[str] = None
        best_score: float = -999.0

        for sid, strategy in STRATEGY_LIBRARY.items():
            if sid == self.active_strategy:
                continue
            # Prefer strategies matching current regime; any regime accepted too
            regime_match = strategy["regime"] == current_regime or current_regime == "UNKNOWN"
            if not regime_match:
                continue

            perf = self._performance[sid]
            if perf.trades > 0:
                # Composite score: win rate weighted more heavily than PnL
                score = perf.win_rate * 2.0 + (perf.total_pnl / 500.0)
            else:
                score = 0.5  # Untested strategy gets benefit of the doubt

            if score > best_score:
                best_score = score
                best_strategy = sid

        # Try any regime if no regime-matching strategy found
        if best_strategy is None:
            for sid in STRATEGY_LIBRARY:
                if sid == self.active_strategy:
                    continue
                perf = self._performance[sid]
                score = perf.win_rate * 2.0 + (perf.total_pnl / 500.0) if perf.trades > 0 else 0.5
                if score > best_score:
                    best_score = score
                    best_strategy = sid

        if best_strategy and best_strategy != self.active_strategy:
            old_name = STRATEGY_LIBRARY[self.active_strategy]["name"]
            new_name = STRATEGY_LIBRARY[best_strategy]["name"]
            old_wr = active_perf.win_rate

            self.active_strategy = best_strategy
            log.info(f"Strategy evolved: '{old_name}' → '{new_name}'")

            return (
                f"⚡ STRATEGY EVOLVED: '{old_name}' degraded "
                f"({old_wr:.0%} WR, {active_perf.consecutive_losses} consec losses) "
                f"→ deploying '{new_name}' for {current_regime} regime"
            )

        return None

    def get_status(self) -> Dict:
        active = self.active_strategy
        perf = self._performance[active]
        return {
            "active_strategy": STRATEGY_LIBRARY[active]["name"],
            "strategy_id": active,
            "description": STRATEGY_LIBRARY[active]["description"],
            "trades": perf.trades,
            "win_rate": round(perf.win_rate * 100, 1),
            "total_pnl": round(perf.total_pnl, 2),
            "consecutive_losses": perf.consecutive_losses,
            "degraded": perf.is_degraded,
            "all_strategies": {
                sid: {
                    "name": STRATEGY_LIBRARY[sid]["name"],
                    "regime": STRATEGY_LIBRARY[sid]["regime"],
                    "trades": self._performance[sid].trades,
                    "win_rate": round(self._performance[sid].win_rate * 100, 1),
                    "pnl": round(self._performance[sid].total_pnl, 2),
                    "active": sid == active,
                    "degraded": self._performance[sid].is_degraded,
                }
                for sid in STRATEGY_LIBRARY
            },
        }
