import db from '../db/database.js';

const TWELVEDATA_BASE = 'https://api.twelvedata.com';
const API_KEY = process.env.TWELVEDATA_API_KEY;

function getCached(key) {
  const row = db.prepare('SELECT data, expires_at FROM api_cache WHERE key = ?').get(key);
  if (row && Date.now() < row.expires_at) return JSON.parse(row.data);
  return null;
}

function setCache(key, data, ttlMs) {
  db.prepare('INSERT OR REPLACE INTO api_cache (key, data, expires_at) VALUES (?, ?, ?)').run(key, JSON.stringify(data), Date.now() + ttlMs);
}

async function fetchTwelveData(endpoint, params) {
  if (!API_KEY || API_KEY === 'your_twelvedata_api_key_here') return null;
  const url = new URL(`${TWELVEDATA_BASE}/${endpoint}`);
  url.searchParams.set('apikey', API_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.status === 'error' || data.code) return null;
  return data;
}

export async function getLivePrice() {
  const cached = getCached('live_eurusd');
  if (cached) return cached;
  const data = await fetchTwelveData('price', { symbol: 'EUR/USD' });
  if (data) {
    const result = { price: parseFloat(data.price), source: 'live', ts: Date.now() };
    setCache('live_eurusd', result, 5 * 60 * 1000);
    return result;
  }
  return getSimulatedPrice();
}

export async function getHistoricalCandles(interval = '1h', outputsize = 200) {
  const cacheKey = `candles_${interval}_${outputsize}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  const data = await fetchTwelveData('time_series', { symbol: 'EUR/USD', interval, outputsize });
  if (data && data.values) {
    const candles = data.values.map((v) => ({
      time: Math.floor(new Date(v.datetime).getTime() / 1000),
      open: parseFloat(v.open), high: parseFloat(v.high),
      low: parseFloat(v.low), close: parseFloat(v.close),
      volume: parseFloat(v.volume || 0),
    })).reverse();
    const result = { candles, source: 'live', interval };
    setCache(cacheKey, result, 60 * 60 * 1000);
    return result;
  }
  return { candles: generateSimulatedCandles(interval, outputsize), source: 'simulated', interval };
}

export async function getQuote() {
  const cached = getCached('quote_eurusd');
  if (cached) return cached;
  const data = await fetchTwelveData('quote', { symbol: 'EUR/USD' });
  if (data) {
    const result = {
      symbol: 'EUR/USD', open: parseFloat(data.open), high: parseFloat(data.high),
      low: parseFloat(data.low), close: parseFloat(data.close),
      change: parseFloat(data.change), percent_change: parseFloat(data.percent_change), source: 'live',
    };
    setCache('quote_eurusd', result, 5 * 60 * 1000);
    return result;
  }
  return getSimulatedQuote();
}

function getSimulatedPrice() {
  const base = 1.0850 + Math.sin(Date.now() / 100000) * 0.003;
  return { price: parseFloat(base.toFixed(5)), source: 'simulated', ts: Date.now() };
}

function getSimulatedQuote() {
  const base = 1.0850;
  const open = base + (Math.random() - 0.5) * 0.003;
  const close = open + (Math.random() - 0.5) * 0.004;
  const high = Math.max(open, close) + Math.random() * 0.002;
  const low = Math.min(open, close) - Math.random() * 0.002;
  return {
    symbol: 'EUR/USD',
    open: parseFloat(open.toFixed(5)), high: parseFloat(high.toFixed(5)),
    low: parseFloat(low.toFixed(5)), close: parseFloat(close.toFixed(5)),
    change: parseFloat((close - open).toFixed(5)),
    percent_change: parseFloat(((close - open) / open * 100).toFixed(2)),
    source: 'simulated',
  };
}

export function generateSimulatedCandles(interval = '1h', count = 200) {
  const intervals = { '1min': 60, '5min': 300, '15min': 900, '30min': 1800, '1h': 3600, '4h': 14400, '1day': 86400 };
  const secondsPerCandle = intervals[interval] || 3600;
  const candles = [];
  let price = 1.0850;
  let time = Math.floor(Date.now() / 1000) - count * secondsPerCandle;
  for (let i = 0; i < count; i++) {
    const trend = Math.sin(i / 30) * 0.0010;
    const noise = (Math.random() - 0.5) * 0.0020;
    const open = price;
    const close = price + trend + noise;
    const range = Math.abs(noise) + Math.random() * 0.0010;
    candles.push({
      time, open: parseFloat(open.toFixed(5)), high: parseFloat((Math.max(open, close) + range * 0.5).toFixed(5)),
      low: parseFloat((Math.min(open, close) - range * 0.5).toFixed(5)), close: parseFloat(close.toFixed(5)),
      volume: Math.floor(Math.random() * 5000 + 1000),
    });
    price = close;
    time += secondsPerCandle;
  }
  return candles;
}
