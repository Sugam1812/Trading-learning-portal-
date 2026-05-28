import { Router } from 'express';
import db from '../db/database.js';
const router = Router();

router.get('/profile', (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id=1').get();
  const badges = db.prepare('SELECT badge_id, earned_at FROM badges ORDER BY earned_at DESC').all();
  res.json({ ...profile, badges });
});

router.patch('/profile', (req, res) => {
  const { username, account_balance, starting_balance } = req.body;
  if (username) db.prepare('UPDATE profile SET username=? WHERE id=1').run(username);
  if (account_balance) db.prepare('UPDATE profile SET account_balance=? WHERE id=1').run(account_balance);
  if (starting_balance) db.prepare('UPDATE profile SET starting_balance=? WHERE id=1').run(starting_balance);
  res.json({ message: 'Updated' });
});

router.post('/reset', (req, res) => {
  db.prepare('UPDATE profile SET account_balance=starting_balance WHERE id=1').run();
  db.prepare('DELETE FROM trades').run();
  res.json({ message: 'Account reset' });
});

router.get('/lessons', (req, res) => res.json(db.prepare('SELECT * FROM lesson_progress').all()));

router.post('/lessons/complete', (req, res) => {
  const { module_id, lesson_id } = req.body;
  if (!module_id || !lesson_id) return res.status(400).json({ error: 'module_id and lesson_id required' });
  db.prepare(`INSERT OR IGNORE INTO lesson_progress (module_id,lesson_id,completed,completed_at) VALUES (?,?,1,datetime('now'))`).run(module_id, lesson_id);
  db.prepare(`UPDATE profile SET xp=xp+20 WHERE id=1`).run();
  const done = db.prepare('SELECT count(*) as c FROM lesson_progress WHERE completed=1').get();
  if (done.c === 1) db.prepare(`INSERT OR IGNORE INTO badges (badge_id) VALUES (?)`).run('first_lesson');
  if (done.c === 10) db.prepare(`INSERT OR IGNORE INTO badges (badge_id) VALUES (?)`).run('ten_lessons');
  if (done.c === 30) db.prepare(`INSERT OR IGNORE INTO badges (badge_id) VALUES (?)`).run('knowledge_seeker');
  const xp = db.prepare('SELECT xp FROM profile WHERE id=1').get();
  db.prepare('UPDATE profile SET level=? WHERE id=1').run(Math.floor(xp.xp / 500) + 1);
  res.json({ message: 'Lesson completed', xp_gained: 20 });
});

router.get('/quizzes', (req, res) => res.json(db.prepare('SELECT * FROM quiz_results ORDER BY taken_at DESC').all()));

router.post('/quizzes', (req, res) => {
  const { module_id, quiz_id, score, total, answers } = req.body;
  const passed = score >= Math.ceil(total * 0.7) ? 1 : 0;
  db.prepare(`INSERT INTO quiz_results (module_id,quiz_id,score,total,passed,answers) VALUES (?,?,?,?,?,?)`).run(module_id, quiz_id, score, total, passed, JSON.stringify(answers));
  const xpGain = passed ? 50 + score * 5 : 10;
  db.prepare(`UPDATE profile SET xp=xp+? WHERE id=1`).run(xpGain);
  if (passed) { db.prepare(`INSERT OR IGNORE INTO badges (badge_id) VALUES (?)`).run('quiz_passer'); const pc = db.prepare('SELECT count(*) as c FROM quiz_results WHERE passed=1').get(); if (pc.c >= 5) db.prepare(`INSERT OR IGNORE INTO badges (badge_id) VALUES (?)`).run('quiz_master'); }
  res.json({ passed: !!passed, xp_gained: xpGain, message: passed ? 'Quiz passed!' : 'Review and try again.' });
});

router.get('/daily-routine', (req, res) => {
  const r = db.prepare(`SELECT * FROM daily_routines WHERE date=date('now')`).get();
  res.json(r || { pre_market_done: 0, post_review_done: 0 });
});

router.post('/daily-routine', (req, res) => {
  const { pre_market_done, market_analysis, trade_plan, post_review_done, post_review } = req.body;
  db.prepare(`INSERT INTO daily_routines (date,pre_market_done,market_analysis,trade_plan,post_review_done,post_review) VALUES (date('now'),?,?,?,?,?) ON CONFLICT(date) DO UPDATE SET pre_market_done=excluded.pre_market_done,market_analysis=excluded.market_analysis,trade_plan=excluded.trade_plan,post_review_done=excluded.post_review_done,post_review=excluded.post_review`).run(pre_market_done ? 1 : 0, market_analysis, trade_plan, post_review_done ? 1 : 0, post_review);
  if (pre_market_done) db.prepare(`UPDATE profile SET xp=xp+10 WHERE id=1`).run();
  if (post_review_done) { db.prepare(`UPDATE profile SET xp=xp+15 WHERE id=1`).run(); db.prepare(`INSERT OR IGNORE INTO badges (badge_id) VALUES (?)`).run('routine_trader'); }
  res.json({ message: 'Routine updated' });
});

export default router;
