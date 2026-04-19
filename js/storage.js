/* Simple localStorage wrapper with namespacing + JSON */
(function(){
  const NS = "ptg:";
  const store = {
    get(k, def){
      try { const v = localStorage.getItem(NS+k); return v==null?def:JSON.parse(v); }
      catch(e){ return def; }
    },
    set(k, v){ localStorage.setItem(NS+k, JSON.stringify(v)); },
    del(k){ localStorage.removeItem(NS+k); },
    all(){
      const out = {};
      for(let i=0;i<localStorage.length;i++){
        const key = localStorage.key(i);
        if(key && key.startsWith(NS)) out[key.slice(NS.length)] = JSON.parse(localStorage.getItem(key));
      }
      return out;
    },
    clearAll(){
      const keys=[];
      for(let i=0;i<localStorage.length;i++){
        const key = localStorage.key(i);
        if(key && key.startsWith(NS)) keys.push(key);
      }
      keys.forEach(k=>localStorage.removeItem(k));
    }
  };
  window.Store = store;

  // default state bootstrap
  if(!store.get("user")){
    store.set("user", { xp:0, level:1, badges:[], created: Date.now() });
  }
  if(!store.get("rules")){
    store.set("rules", {
      balance: APP_CONFIG.DEFAULT_BALANCE,
      dailyLossPct: APP_CONFIG.DEFAULT_DAILY_LOSS_PCT,
      totalDDPct: APP_CONFIG.DEFAULT_TOTAL_DD_PCT,
      maxTrades: APP_CONFIG.DEFAULT_MAX_TRADES,
      cooldownLosses: APP_CONFIG.DEFAULT_COOLDOWN_LOSSES
    });
  }
  if(!store.get("trades")) store.set("trades", []);
  if(!store.get("journal")) store.set("journal", []);
  if(!store.get("strategies")) store.set("strategies", []);
  if(!store.get("lessons")) store.set("lessons", {}); // id -> {completed, score}
  if(!store.get("equity")) store.set("equity", [{ t: Date.now(), v: store.get("rules").balance }]);
  if(!store.get("apiLog")) store.set("apiLog", { date: new Date().toISOString().slice(0,10), count: 0 });
  if(!store.get("routine")) store.set("routine", {});
})();
