/* Prop-firm discipline engine. Tracks daily loss, drawdown, trade count,
   revenge-trade detection, cooldown after consecutive losses. */
(function(){
  function today(){ return new Date().toISOString().slice(0,10); }

  function state(){
    const s = Store.get("discipline") || {
      date: today(),
      startEquity: Store.get("rules").balance,
      dayPnL: 0,
      tradesToday: 0,
      consecLosses: 0,
      lockedUntil: 0,
      breaches: [],
      dayStreaks: 0       // rule-following days
    };
    if(s.date !== today()){
      // roll day
      if(s.breaches.length===0) s.dayStreaks = (s.dayStreaks||0)+1;
      s.date = today();
      s.startEquity = equity();
      s.dayPnL = 0;
      s.tradesToday = 0;
      s.consecLosses = 0;
      s.lockedUntil = 0;
      s.breaches = [];
      Store.set("discipline", s);
      if(s.dayStreaks >= 5) Gami.grant("disciplined");
    }
    return s;
  }

  function equity(){
    const arr = Store.get("equity")||[];
    return arr.length ? arr[arr.length-1].v : Store.get("rules").balance;
  }

  function canTrade(){
    const s = state();
    const r = Store.get("rules");
    const now = Date.now();
    if(s.lockedUntil > now){
      const mins = Math.ceil((s.lockedUntil-now)/60000);
      return { ok:false, why:`Cooldown: ${mins} min remaining.` };
    }
    if(s.tradesToday >= r.maxTrades){
      return { ok:false, why:`Max ${r.maxTrades} trades/day hit. Stop for today.` };
    }
    const dl = -s.dayPnL / s.startEquity * 100;
    if(dl >= r.dailyLossPct){
      return { ok:false, why:`Daily loss limit ${r.dailyLossPct}% breached. Trading locked for today.` };
    }
    const eq = equity();
    const start = Store.get("rules").balance;
    const totalDD = (start - eq)/start*100;
    if(totalDD >= r.totalDDPct){
      return { ok:false, why:`Total drawdown ${r.totalDDPct}% breached. Account blown.` };
    }
    return { ok:true };
  }

  function onTradeOpened(){
    const s = state();
    s.tradesToday++;
    Store.set("discipline", s);
  }

  function onTradeClosed(trade){
    const s = state();
    const r = Store.get("rules");
    s.dayPnL += trade.pnl;

    if(trade.pnl < 0){
      s.consecLosses++;
      if(s.consecLosses >= r.cooldownLosses){
        s.lockedUntil = Date.now() + 15*60*1000; // 15 min cooldown
        s.breaches.push({ t:Date.now(), type:"cooldown" });
        Toast(`🧊 Cooldown triggered: ${s.consecLosses} losses in a row. 15 min lock.`, "warn");
      }
    } else {
      s.consecLosses = 0;
    }

    // Revenge trade detection: opened <60s after a losing trade
    const trades = Store.get("trades")||[];
    const prev = trades.filter(t=>t.status==="closed").slice(-2,-1)[0];
    if(prev && prev.pnl<0 && (trade.openedAt - prev.closedAt) < 60*1000 && (trade.size > (prev.size||0))){
      trade.revenge = true;
      Toast(`⚠️ Revenge-trade flag: opened ${Math.round((trade.openedAt-prev.closedAt)/1000)}s after a loss.`, "bad");
      s.breaches.push({ t:Date.now(), type:"revenge" });
    }

    // Breach checks
    const dl = -s.dayPnL / s.startEquity * 100;
    if(dl >= r.dailyLossPct){
      s.breaches.push({ t:Date.now(), type:"daily_loss" });
      Toast(`🚫 Daily loss breached (${dl.toFixed(2)}%). Trading locked.`, "bad");
    }
    Store.set("discipline", s);
    updateBadge();
  }

  function updateBadge(){
    const el = document.getElementById("disciplineBadge");
    if(!el) return;
    const c = canTrade();
    el.className = "badge " + (c.ok ? "ok" : "bad");
    el.textContent = c.ok ? "OK" : "LOCKED";
    el.title = c.ok ? "Rules OK" : c.why;
  }

  function summary(){
    const s = state();
    const r = Store.get("rules");
    return {
      dayPnL: s.dayPnL,
      dayPct: (-s.dayPnL/s.startEquity*100).toFixed(2),
      tradesToday: s.tradesToday,
      maxTrades: r.maxTrades,
      locked: s.lockedUntil>Date.now(),
      lockMinsLeft: Math.max(0, Math.ceil((s.lockedUntil-Date.now())/60000)),
      breaches: s.breaches,
      streakDays: s.dayStreaks||0
    };
  }

  window.Discipline = { canTrade, onTradeOpened, onTradeClosed, summary, state, updateBadge };
})();
