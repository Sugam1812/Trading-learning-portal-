import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import marketRouter from './routes/market.js';
import tradesRouter from './routes/trades.js';
import journalRouter from './routes/journal.js';
import mentorRouter from './routes/mentor.js';
import progressRouter from './routes/progress.js';
import strategyRouter from './routes/strategy.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json({ limit: '2mb' }));
app.use('/api/market', marketRouter);
app.use('/api/trades', tradesRouter);
app.use('/api/journal', journalRouter);
app.use('/api/mentor', mentorRouter);
app.use('/api/progress', progressRouter);
app.use('/api/strategy', strategyRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0', pair: 'EUR/USD', market_data: process.env.TWELVEDATA_API_KEY && process.env.TWELVEDATA_API_KEY !== 'your_twelvedata_api_key_here' ? 'live' : 'simulated', ai_mentor: process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here' ? 'active' : 'fallback' }));
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ error: 'Internal server error' }); });

app.listen(PORT, () => {
  console.log(`\n🚀 Trader Training Machine`);
  console.log(`   Server: http://localhost:${PORT}`);
  console.log(`   Market: ${process.env.TWELVEDATA_API_KEY && process.env.TWELVEDATA_API_KEY !== 'your_twelvedata_api_key_here' ? '✅ TwelveData Live' : '⚡ Simulated'}`);
  console.log(`   AI Mentor: ${process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here' ? '✅ Claude Active' : '⚡ Fallback mode'}\n`);
});
