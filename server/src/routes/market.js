import { Router } from 'express';
import { getLivePrice, getHistoricalCandles, getQuote, generateSimulatedCandles } from '../services/marketData.js';
const router = Router();
router.get('/price', async (req, res) => { try { res.json(await getLivePrice()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/quote', async (req, res) => { try { res.json(await getQuote()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/candles', async (req, res) => { try { const { interval = '1h', outputsize = '200' } = req.query; res.json(await getHistoricalCandles(interval, parseInt(outputsize))); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/replay', (req, res) => { const { interval = '1h', count = '300' } = req.query; res.json({ candles: generateSimulatedCandles(interval, parseInt(count)), source: 'replay', interval }); });
export default router;
