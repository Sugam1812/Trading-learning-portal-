/* Twelve Data API wrapper — caching + daily budget guard + offline fallback */
(function(){
  const BASE = "https://api.twelvedata.com";

  function today(){ return new Date().toISOString().slice(0,10); }
  function getKey(){
    const override = Store.get("apiKey");
    if(override) return override;
    const k = APP_CONFIG.TWELVE_DATA_API_KEY;
    return (k && k !== "PASTE_YOUR_KEY_HERE") ? k : null;
  }
  function budget(){
    let log = Store.get("apiLog");
    if(log.date !== today()) log = { date: today(), count: 0 };
    return log;
  }
  function spend(n=1){
    const log = budget();
    log.count += n;
    Store.set("apiLog", log);
    return log.count;
  }
  function canSpend(){
    return budget().count < APP_CONFIG.DAILY_API_BUDGET;
  }

  async function fetchJSON(url){
    const r = await fetch(url);
    if(!r.ok) throw new Error("HTTP "+r.status);
    const j = await r.json();
    if(j.status === "error") throw new Error(j.message || "API error");
    return j;
  }

  /* Price (live quote). Cached for LIVE_REFRESH_SECONDS. */
  async function price(symbol=APP_CONFIG.SYMBOL){
    const cKey = "cache:price:"+symbol;
    const c = Store.get(cKey);
    const now = Date.now();
    if(c && (now - c.t) < APP_CONFIG.LIVE_REFRESH_SECONDS*1000) return c.v;

    const key = getKey();
    if(!key) throw new Error("API key missing. Open Settings.");
    if(!canSpend()) throw new Error("Daily API budget reached. Using cache.");
    const url = `${BASE}/price?symbol=${encodeURIComponent(symbol)}&apikey=${key}`;
    const j = await fetchJSON(url);
    spend(1);
    const v = parseFloat(j.price);
    Store.set(cKey, { t: now, v });
    return v;
  }

  /* Time series. Cached in localStorage by (symbol,interval). */
  async function timeSeries({symbol=APP_CONFIG.SYMBOL, interval="1h", outputsize=500, force=false}={}){
    const cKey = `cache:ts:${symbol}:${interval}`;
    const c = Store.get(cKey);
    const fresh = c && (Date.now() - c.t) < APP_CONFIG.CACHE_TTL_HOURS*3600*1000;
    if(c && fresh && !force && c.v.length >= outputsize) return c.v.slice(-outputsize);

    const key = getKey();
    if(!key){
      if(c) return c.v.slice(-outputsize);
      return loadSample();
    }
    if(!canSpend()){
      if(c) return c.v.slice(-outputsize);
      return loadSample();
    }

    const url = `${BASE}/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${key}`;
    try {
      const j = await fetchJSON(url);
      spend(1);
      const candles = (j.values || []).map(v => ({
        t: new Date(v.datetime.replace(" ","T")+"Z").getTime(),
        o: parseFloat(v.open), h: parseFloat(v.high),
        l: parseFloat(v.low),  c: parseFloat(v.close),
        v: parseFloat(v.volume || 0)
      })).reverse();
      Store.set(cKey, { t: Date.now(), v: candles });
      return candles;
    } catch(err){
      console.warn("API failed, falling back:", err.message);
      if(c) return c.v.slice(-outputsize);
      return loadSample();
    }
  }

  /* Sample data fallback. Generated deterministically so it looks like EURUSD. */
  let _sample = null;
  async function loadSample(){
    if(_sample) return _sample;
    try {
      const r = await fetch("data/eurusd_sample.json");
      if(r.ok){ _sample = await r.json(); return _sample; }
    } catch(e){}
    _sample = generateSynthetic(1000);
    return _sample;
  }
  function generateSynthetic(n){
    let price = 1.0850;
    const out = [];
    const startT = Date.now() - n*3600*1000;
    let rnd = 42;
    function prnd(){ rnd = (rnd*9301+49297)%233280; return rnd/233280; }
    for(let i=0;i<n;i++){
      const drift = (prnd()-0.5)*0.0006;
      const range = 0.0008 + prnd()*0.0020;
      const open = price;
      const close = Math.max(0.9, open + drift);
      const high = Math.max(open,close) + range*prnd();
      const low  = Math.min(open,close) - range*prnd();
      out.push({ t: startT + i*3600*1000, o:open, h:high, l:low, c:close, v: Math.floor(prnd()*1000) });
      price = close;
    }
    return out;
  }

  window.TDAPI = { price, timeSeries, loadSample, budget, canSpend, getKey };
})();
