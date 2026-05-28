import { Router } from 'express';
import db from '../db/database.js';
import { generateSimulatedCandles } from '../services/marketData.js';
const router = Router();

router.get('/', (req, res) => res.json(db.prepare('SELECT * FROM strategies ORDER BY created_at DESC').all()));

router.post('/', (req, res) => {
  const { name, description, entry_rules, exit_rules } = req.body;
  if (!name || !entry_rules || !exit_rules) return res.status(400).json({ error: 'Name, entry_rules, exit_rules required' });
  const s = db.prepare(`INSERT INTO strategies (name,description,entry_rules,exit_rules) VALUES (?,?,?,?)`).run(name, description, JSON.stringify(entry_rules), JSON.stringify(exit_rules));
  res.json({ id: s.lastInsertRowid, message: 'Strategy saved' });
});

router.post('/:id/backtest', (req, res) => {
  const strategy = db.prepare('SELECT * FROM strategies WHERE id=?').get(req.params.id);
  if (!strategy) return res.status(404).json({ error: 'Not found' });
  const entryRules = JSON.parse(strategy.entry_rules), exitRules = JSON.parse(strategy.exit_rules);
  const candles = generateSimulatedCandles('1h', 500);
  const results = runBacktest(candles, entryRules, exitRules);
  db.prepare('UPDATE strategies SET backtest_results=? WHERE id=?').run(JSON.stringify(results), req.params.id);
  db.prepare(`INSERT OR IGNORE INTO badges (badge_id) VALUES (?)`).run('backtest_pro');
  db.prepare(`UPDATE profile SET xp=xp+30 WHERE id=1`).run();
  res.json(results);
});

function runBacktest(candles, entryRules, exitRules) {
  let balance = 10000, inTrade = false, currentTrade = null;
  const trades = [], equityCurve = [{ time: candles[0]?.time, equity: balance }];
  const maWindow = entryRules.ma_period || 20, slPips = exitRules.stop_loss_pips || 20, tpPips = exitRules.take_profit_pips || 40, riskPct = entryRules.risk_percent || 1;
  const calcMA = (arr, p) => arr.length < p ? null : arr.slice(-p).reduce((s, v) => s + v, 0) / p;
  const calcRSI = (closes, p) => { if (closes.length < p + 1) return 50; let g = 0, l = 0; for (let i = closes.length - p; i < closes.length; i++) { const d = closes[i] - closes[i-1]; if (d > 0) g += d; else l += Math.abs(d); } const rs = (g/p) / (l/p || 0.001); return 100 - 100/(1+rs); };

  for (let i = maWindow + 15; i < candles.length; i++) {
    const closes = candles.slice(0, i+1).map(c => c.close);
    const cur = candles[i], prev = candles[i-1];
    const ma = calcMA(closes, maWindow), rsi = calcRSI(closes, entryRules.rsi_period || 14);

    if (inTrade && currentTrade) {
      const pm = 10000, slP = currentTrade.direction === 'buy' ? currentTrade.entry - slPips/pm : currentTrade.entry + slPips/pm, tpP = currentTrade.direction === 'buy' ? currentTrade.entry + tpPips/pm : currentTrade.entry - tpPips/pm;
      const hit = currentTrade.direction === 'buy' ? (cur.low <= slP || cur.high >= tpP) : (cur.high >= slP || cur.low <= tpP);
      if (hit) {
        const ep = currentTrade.direction === 'buy' ? (cur.low <= slP ? slP : tpP) : (cur.high >= slP ? slP : tpP);
        const pips = currentTrade.direction === 'buy' ? (ep - currentTrade.entry)*pm : (currentTrade.entry - ep)*pm;
        const lot = (balance * riskPct / 100) / (slPips * 10);
        const pnl = pips * 10 * lot;
        balance += pnl;
        trades.push({ ...currentTrade, pnl: parseFloat(pnl.toFixed(2)) });
        equityCurve.push({ time: cur.time, equity: parseFloat(balance.toFixed(2)) });
        inTrade = false; currentTrade = null;
      }
    }

    if (!inTrade && ma) {
      const prevCloses = candles.slice(0, i).map(c => c.close), prevMA = calcMA(prevCloses, maWindow);
      const et = entryRules.entry_type || 'ma_cross';
      let sig = null;
      if (et === 'ma_cross' && prevMA) { if (prev.close < prevMA && cur.close > ma) sig = 'buy'; else if (prev.close > prevMA && cur.close < ma) sig = 'sell'; }
      else if (et === 'rsi') { if (rsi < (entryRules.rsi_oversold || 30)) sig = 'buy'; else if (rsi > (entryRules.rsi_overbought || 70)) sig = 'sell'; }
      else if (et === 'breakout') { const lb = Math.min(20, i), hs = Math.max(...candles.slice(i-lb,i).map(c=>c.high)), ls = Math.min(...candles.slice(i-lb,i).map(c=>c.low)); if (cur.close > hs) sig = 'buy'; else if (cur.close < ls) sig = 'sell'; }
      if (sig) { inTrade = true; currentTrade = { direction: sig, entry: cur.close, time: cur.time }; }
    }
  }

  const wins = trades.filter(t => t.pnl > 0), losses = trades.filter(t => t.pnl < 0);
  const totalPnL = parseFloat((balance - 10000).toFixed(2));
  let peak = 10000, maxDD = 0, run = 10000;
  for (const t of trades) { run += t.pnl; if (run > peak) peak = run; const dd = peak - run; if (dd > maxDD) maxDD = dd; }
  return { total_trades: trades.length, wins: wins.length, losses: losses.length, win_rate: trades.length ? parseFloat(((wins.length/trades.length)*100).toFixed(1)) : 0, total_pnl: totalPnL, profit_percent: parseFloat((totalPnL/100).toFixed(2)), max_drawdown: parseFloat(maxDD.toFixed(2)), profit_factor: losses.length ? parseFloat((wins.reduce((s,t)=>s+t.pnl,0)/Math.abs(losses.reduce((s,t)=>s+t.pnl,0))).toFixed(2)) : 999, avg_rr: parseFloat((tpPips/slPips).toFixed(2)), equity_curve: equityCurve, sample_trades: trades.slice(-5) };
}

export default router;
