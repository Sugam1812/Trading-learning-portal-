/*  ╔══════════════════════════════════════════════════════════════╗
    ║   CONFIG — paste your Twelve Data API key below.             ║
    ║   Get a free key at https://twelvedata.com                   ║
    ╚══════════════════════════════════════════════════════════════╝  */

window.APP_CONFIG = {
  TWELVE_DATA_API_KEY: "PASTE_YOUR_KEY_HERE",   // <-- change this line
  SYMBOL: "EUR/USD",
  DAILY_API_BUDGET: 800,       // hard daily cap (Twelve Data free tier)
  LIVE_REFRESH_SECONDS: 60,    // min seconds between live quote fetches
  CACHE_TTL_HOURS: 24,         // historical bars cached this long
  DEFAULT_BALANCE: 100000,
  DEFAULT_DAILY_LOSS_PCT: 5,
  DEFAULT_TOTAL_DD_PCT: 10,
  DEFAULT_MAX_TRADES: 5,
  DEFAULT_COOLDOWN_LOSSES: 3
};
