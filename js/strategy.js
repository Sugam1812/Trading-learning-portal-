/* Strategy builder + backtester. Uses cached/sample data only (no API cost). */
(function(){

  function ema(values, period){
    const k = 2/(period+1);
    const out = []; let prev = null;
    values.forEach((v,i)=>{
      if(i===0){ out.push(v); prev=v; }
      else { prev = v*k + prev*(1-k); out.push(prev); }
    });
    return out;
  }
  function atr(candles, period=14){
    const trs = candles.map((c,i)=>{
      if(i===0) return c.h-c.l;
      const pc = candles[i-1].c;
      return Math.max(c.h-c.l, Math.abs(c.h-pc), Math.abs(c.l-pc));
    });
    const out = []; let sum = 0;
    trs.forEach((v,i)=>{
      if(i<period){ sum+=v; out.push(v); }
      else if(i===period){ out.push(sum/period); }
      else { const prev = out[out.length-1]; out.push((prev*(period-1)+v)/period); }
    });
    return out;
  }

  function triggerFns(cfg){
    const fnE = (candles,i, closes)=>{
      const f = ema(closes, cfg.emaF);
      const s = ema(closes, cfg.emaS);
      if(i<1) return null;
      if(f[i-1] <= s[i-1] && f[i] > s[i]) return "long";
      if(f[i-1] >= s[i-1] && f[i] < s[i]) return "short";
      return null;
    };
    const fnB = (candles,i)=>{
      if(i<cfg.lb) return null;
      const win = candles.slice(i-cfg.lb,i);
      const hh = Math.max(...win.map(x=>x.h));
      const ll = Math.min(...win.map(x=>x.l));
      if(candles[i].c > hh) return "long";
      if(candles[i].c < ll) return "short";
      return null;
    };
    const fnP = (candles,i, closes)=>{
      const f = ema(closes,cfg.emaF);
      const s = ema(closes,cfg.emaS);
      if(i<2) return null;
      const up = f[i]>s[i];
      const dn = f[i]<s[i];
      if(up && candles[i-1].l <= f[i-1] && candles[i].c > f[i]) return "long";
      if(dn && candles[i-1].h >= f[i-1] && candles[i].c < f[i]) return "short";
      return null;
    };
    const fnEng = (candles,i)=>{
      if(i<1) return null;
      const p=candles[i-1], c=candles[i];
      if(c.c>c.o && p.c<p.o && c.c>p.o && c.o<p.c) return "long";
      if(c.c<c.o && p.c>p.o && c.c<p.o && c.o>p.c) return "short";
      return null;
    };
    return { ema_cross:fnE, breakout:fnB, pullback_ema:fnP, engulfing:fnEng }[cfg.trigger];
  }

  async function run(cfg){
    let candles;
    const c = Store.get(`cache:ts:${APP_CONFIG.SYMBOL}:${cfg.tf}`);
    candles = c ? c.v : await TDAPI.loadSample();
    if(!candles.length) return { error:"No data" };

    const closes = candles.map(x=>x.c);
    const atrs = atr(candles, 14);
    const fn = triggerFns(cfg);
    if(!fn) return { error:"Unknown trigger" };

    const PIP = 0.0001, PPL = 10;
    let eq = Store.get("rules").balance;
    const equity = [{t:candles[0].t, v:eq}];
    const trades = [];
    let pos = null;

    for(let i=0;i<candles.length;i++){
      const bar = candles[i];
      if(pos){
        const hit = pos.side==="long"
          ? (bar.l<=pos.sl?"stop":bar.h>=pos.tp?"take":null)
          : (bar.h>=pos.sl?"stop":bar.l<=pos.tp?"take":null);
        if(hit){
          const exit = hit==="stop"?pos.sl:pos.tp;
          const pips = (pos.side==="long"?(exit-pos.entry):(pos.entry-exit))/PIP;
          const pnl = +(pips * pos.lots * PPL).toFixed(2);
          eq = +(eq+pnl).toFixed(2);
          trades.push({ ...pos, exit, pnl, pips, rr: +(pips/pos.slPips).toFixed(2), reason:hit, closedAt: bar.t });
          equity.push({ t: bar.t, v: eq });
          pos = null;
        }
      }
      if(!pos){
        const side = fn(candles, i, closes);
        if(side && (cfg.dir==="both" || cfg.dir===side)){
          const atrV = atrs[i] || (bar.h-bar.l);
          const slDist = atrV * cfg.slAtr;
          const tpDist = atrV * cfg.tpAtr;
          if(slDist>0){
            const slPips = slDist/PIP;
            const lots = Math.max(0.01, +(eq*(cfg.risk/100)/(slPips*PPL)).toFixed(2));
            const entry = bar.c;
            pos = {
              side, entry,
              sl: side==="long"?entry-slDist:entry+slDist,
              tp: side==="long"?entry+tpDist:entry-tpDist,
              slPips, lots, openedAt: bar.t
            };
          }
        }
      }
    }

    // metrics
    const wins = trades.filter(x=>x.pnl>0);
    const winRate = trades.length? wins.length/trades.length:0;
    const avgRR   = trades.length? trades.reduce((a,b)=>a+b.rr,0)/trades.length:0;
    let peak=-Infinity, mdd=0;
    equity.forEach(p=>{ if(p.v>peak)peak=p.v; mdd = Math.max(mdd,(peak-p.v)/peak); });
    const total = eq - Store.get("rules").balance;
    return { trades, equity, winRate, avgRR, maxDD:mdd, total, n: trades.length };
  }

  function readCfg(){
    return {
      dir: document.getElementById("stDir").value,
      trigger: document.getElementById("stTrig").value,
      emaF: +document.getElementById("stEmaF").value,
      emaS: +document.getElementById("stEmaS").value,
      lb:   +document.getElementById("stLb").value,
      slAtr:+document.getElementById("stSL").value,
      tpAtr:+document.getElementById("stTP").value,
      risk: +document.getElementById("stRisk").value,
      tf:   document.getElementById("stTF").value
    };
  }

  async function onRun(){
    const cfg = readCfg();
    Toast("Running backtest…","ok");
    const r = await run(cfg);
    const host = document.getElementById("stResult");
    host.classList.remove("hidden");
    if(r.error){ host.innerHTML = `<p class="bad">${r.error}</p>`; return; }
    host.innerHTML = `
      <h3>Result — ${cfg.trigger} · ${cfg.tf}</h3>
      <div class="grid-4">
        <div class="card"><div class="k">Trades</div><div class="v">${r.n}</div></div>
        <div class="card"><div class="k">Win rate</div><div class="v">${(r.winRate*100).toFixed(1)}%</div></div>
        <div class="card"><div class="k">Avg R</div><div class="v">${r.avgRR.toFixed(2)}</div></div>
        <div class="card"><div class="k">Max DD</div><div class="v">${(r.maxDD*100).toFixed(1)}%</div></div>
      </div>
      <div><b>Net P/L:</b> <span class="${r.total>=0?'ok':'bad'}">$${r.total.toFixed(2)}</span></div>
      <canvas id="stChart" width="900" height="220" style="margin-top:10px;background:#0d1322;border-radius:8px"></canvas>
    `;
    Chart.drawEquity(document.getElementById("stChart"), r.equity);
  }

  function onSave(){
    const cfg = readCfg();
    const r = Store.get("strategies");
    r.push({ cfg, savedAt: Date.now(), name: `${cfg.trigger}_${cfg.tf}_${Date.now()}` });
    Store.set("strategies", r);
    Gami.addXP(20, "Strategy saved");
    Gami.updateBadges();
    renderSaved();
    Toast("Saved.","ok");
  }

  function renderSaved(){
    const host = document.getElementById("stSaved");
    const arr = Store.get("strategies")||[];
    if(!arr.length){ host.innerHTML=""; return; }
    host.innerHTML = `<div class="card"><h3>Saved strategies (${arr.length})</h3>` +
      arr.slice().reverse().map(s=>`<div class="dim" style="padding:4px 0;border-top:1px solid var(--border)">
        ${new Date(s.savedAt).toLocaleString()} · ${s.cfg.trigger} · ${s.cfg.tf} · risk ${s.cfg.risk}%</div>`).join("") +
      "</div>";
  }

  function bind(){
    document.getElementById("stRun").onclick = onRun;
    document.getElementById("stSave").onclick = onSave;
    renderSaved();
  }

  window.Strategy = { bind, run };
})();
