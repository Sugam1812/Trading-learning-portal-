import { Router } from 'express';
import db from '../db/database.js';
const router = Router();

const RULES = { maxDailyLossPercent: 5, maxDrawdownPercent: 10, maxTradesPerDay: 10 };
const getProfile = () => db.prepare('SELECT * FROM profile WHERE id = 1').get();
const getTodayTrades = () => db.prepare(`SELECT * FROM trades WHERE date(opened_at) = date('now')`).all();

function checkViolations(riskPercent) {
  const profile = getProfile();
  const today = getTodayTrades();
  const closedToday = today.filter(t => t.status !== 'open');
  const dailyPnL = closedToday.reduce((s, t) => s + (t.pnl || 0), 0);
  const violations = [];
  if (today.length >= RULES.maxTradesPerDay) violations.push(`Max ${RULES.maxTradesPerDay} trades per day reached.`);
  const dailyLimit = (RULES.maxDailyLossPercent / 100) * profile.starting_balance;
  if (dailyPnL <= -dailyLimit) violations.push(`Daily loss limit hit ($${dailyLimit.toFixed(0)}).`);
  const drawdownPct = ((profile.starting_balance - profile.account_balance) / profile.starting_balance) * 100;
  if (drawdownPct >= RULES.maxDrawdownPercent) violations.push(`Max drawdown reached (${drawdownPct.toFixed(1)}%).`);
  if (riskPercent > 2) violations.push(`Risk too high (${riskPercent}%). Max 2%.`);
  return violations;
}

router.get('/', (req, res) => res.json(db.prepare('SELECT * FROM trades ORDER BY opened_at DESC LIMIT 100').all()));
router.get('/open', (req, res) => res.json(db.prepare(`SELECT * FROM trades WHERE status='open' ORDER BY opened_at DESC`).all()));
router.get('/today', (req, res) => {
  const profile = getProfile();
  const today = getTodayTrades();
  const dailyPnL = today.filter(t => t.status !== 'open').reduce((s, t) => s + (t.pnl || 0), 0);
  const dailyLossLimit = (RULES.maxDailyLossPercent / 100) * profile.starting_balance;
  const drawdownPct = ((profile.starting_balance - profile.account_balance) / profile.starting_balance) * 100;
  res.json({ trades: today, dailyPnL, tradeCount: today.length, dailyLossLimit, dailyLossPercent: Math.abs((dailyPnL / profile.starting_balance) * 100), drawdownPercent: Math.max(0, drawdownPct), rules: RULES, blocked: today.length >= RULES.maxTradesPerDay || dailyPnL <= -dailyLossLimit || drawdownPct >= RULES.maxDrawdownPercent });
});

router.post('/open', (req, res) => {
  const { direction, entry_price, stop_loss, take_profit, lot_size, risk_percent, session, strategy, notes } = req.body;
  if (!direction || !entry_price || !stop_loss || !take_profit || !lot_size) return res.status(400).json({ error: 'Missing required fields' });
  const violations = checkViolations(risk_percent || 1);
  if (violations.length) { db.prepare('INSERT INTO discipline_log (violation_type, description) VALUES (?,?)').run('trade_blocked', violations.join('; ')); return res.status(403).json({ error: 'Trade blocked', violations }); }
  const profile = getProfile();
  const risk_amount = ((risk_percent || 1) / 100) * profile.account_balance;
  const trade = db.prepare(`INSERT INTO trades (direction,entry_price,stop_loss,take_profit,lot_size,risk_percent,risk_amount,session,strategy,notes,status) VALUES (?,?,?,?,?,?,?,?,?,?,'open')`).run(direction, entry_price, stop_loss, take_profit, lot_size, risk_percent || 1, risk_amount, session, strategy, notes);
  db.prepare(`UPDATE profile SET xp=xp+5,last_active=datetime('now') WHERE id=1`).run();
  res.json({ id: trade.lastInsertRowid, message: 'Trade opened', risk_amount });
});

router.post('/close/:id', (req, res) => {
  const trade = db.prepare(`SELECT * FROM trades WHERE id=? AND status='open'`).get(req.params.id);
  if (!trade) return res.status(404).json({ error: 'Trade not found' });
  const { exit_price } = req.body;
  if (!exit_price) return res.status(400).json({ error: 'Exit price required' });
  const pips = trade.direction === 'buy' ? (exit_price - trade.entry_price) * 10000 : (trade.entry_price - exit_price) * 10000;
  const pnl = pips * 10 * trade.lot_size;
  db.prepare(`UPDATE trades SET status='closed',exit_price=?,pnl=?,pips=?,closed_at=datetime('now') WHERE id=?`).run(exit_price, pnl, pips, req.params.id);
  const profile = getProfile();
  db.prepare('UPDATE profile SET account_balance=?,xp=xp+? WHERE id=1').run(profile.account_balance + pnl, pnl > 0 ? 25 : 10);
  if (pnl > 0) { const w = db.prepare(`SELECT count(*) as c FROM trades WHERE pnl>0`).get(); if (w.c === 1) db.prepare(`INSERT OR IGNORE INTO badges (badge_id) VALUES (?)`).run('first_win'); if (w.c === 10) db.prepare(`INSERT OR IGNORE INTO badges (badge_id) VALUES (?)`).run('ten_wins'); }
  res.json({ pnl, pips, new_balance: profile.account_balance + pnl, message: `${pips.toFixed(1)} pips` });
});

router.get('/stats', (req, res) => {
  const trades = db.prepare(`SELECT * FROM trades WHERE status != 'open'`).all();
  if (!trades.length) return res.json({ total: 0, wins: 0, losses: 0, win_rate: 0, total_pnl: 0, avg_win: 0, avg_loss: 0, profit_factor: 0, avg_rr: 0, max_drawdown: 0, best_trade: 0, worst_trade: 0, account_balance: getProfile().account_balance, starting_balance: getProfile().starting_balance, profit_percent: 0 });
  const wins = trades.filter(t => t.pnl > 0), losses = trades.filter(t => t.pnl < 0);
  const totalPnL = trades.reduce((s, t) => s + (t.pnl || 0), 0);
  const grossWin = wins.reduce((s, t) => s + t.pnl, 0), grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  let peak = 0, maxDD = 0, running = 0;
  for (const t of trades) { running += t.pnl || 0; if (running > peak) peak = running; const dd = peak - running; if (dd > maxDD) maxDD = dd; }
  const profile = getProfile();
  res.json({ total: trades.length, wins: wins.length, losses: losses.length, win_rate: parseFloat(((wins.length / trades.length) * 100).toFixed(1)), total_pnl: parseFloat(totalPnL.toFixed(2)), avg_win: wins.length ? parseFloat((grossWin / wins.length).toFixed(2)) : 0, avg_loss: losses.length ? parseFloat((-grossLoss / losses.length).toFixed(2)) : 0, profit_factor: grossLoss > 0 ? parseFloat((grossWin / grossLoss).toFixed(2)) : grossWin > 0 ? 999 : 0, avg_rr: 0, max_drawdown: parseFloat(maxDD.toFixed(2)), best_trade: parseFloat(Math.max(...trades.map(t => t.pnl || 0)).toFixed(2)), worst_trade: parseFloat(Math.min(...trades.map(t => t.pnl || 0)).toFixed(2)), account_balance: profile.account_balance, starting_balance: profile.starting_balance, profit_percent: parseFloat(((totalPnL / profile.starting_balance) * 100).toFixed(2)) });
});

export default router;
