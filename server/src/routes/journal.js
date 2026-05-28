import { Router } from 'express';
import db from '../db/database.js';
import { analyzeTradeJournal, getMistakePatterns } from '../services/aiMentor.js';
const router = Router();

router.get('/', (req, res) => res.json(db.prepare(`SELECT j.*, t.direction, t.entry_price, t.exit_price, t.pnl, t.pips, t.strategy FROM journal_entries j LEFT JOIN trades t ON j.trade_id=t.id ORDER BY j.created_at DESC LIMIT 50`).all()));

router.post('/', async (req, res) => {
  const { trade_id, market_analysis, trade_plan, emotions_before, emotions_after, lessons_learned, mood_rating, confidence_rating, discipline_rating } = req.body;
  let ai_feedback = '';
  if (trade_id) {
    const trade = db.prepare('SELECT * FROM trades WHERE id=?').get(trade_id);
    if (trade) { try { const r = await analyzeTradeJournal(trade, req.body); ai_feedback = r.feedback; } catch {} }
  }
  const entry = db.prepare(`INSERT INTO journal_entries (trade_id,market_analysis,trade_plan,emotions_before,emotions_after,lessons_learned,ai_feedback,mood_rating,confidence_rating,discipline_rating) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(trade_id || null, market_analysis, trade_plan, emotions_before, emotions_after, lessons_learned, ai_feedback, mood_rating, confidence_rating, discipline_rating);
  db.prepare(`UPDATE profile SET xp=xp+15 WHERE id=1`).run();
  db.prepare(`INSERT OR IGNORE INTO badges (badge_id) VALUES (?)`).run('first_journal');
  res.json({ id: entry.lastInsertRowid, ai_feedback });
});

router.get('/patterns', async (req, res) => {
  const trades = db.prepare(`SELECT * FROM trades WHERE status!='open' ORDER BY closed_at DESC LIMIT 30`).all();
  if (trades.length < 3) return res.json({ analysis: 'Complete at least 3 trades to see pattern analysis.', source: 'system' });
  try { res.json(await getMistakePatterns(trades)); } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
