import { Router } from 'express';
import { askMentor } from '../services/aiMentor.js';
const router = Router();
router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message required' });
  try { res.json(await askMentor(message, history)); } catch (e) { res.status(500).json({ error: e.message }); }
});
export default router;
