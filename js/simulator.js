/* Candle-by-candle trading simulator */
(function(){
  const PIP = 0.0001;
  const PIP_PER_LOT_USD = 10;   // EUR/USD pip value per 1.0 lot

  const state = {
    candles: [],
    idx: 0,
    playing: false,
    timer: null,
    speedMs: 500,
    position: null,
    markers: [],
    dataSource: "sample"
  };

  function render(){
    const canvas = document.getElementById("chart");
    const visible = state.candles.slice(Math.max(0,state.idx-120), state.idx+1);
    Chart.draw(canvas, visible, {
      position: state.position,
      markers: state.markers.filter(m=>visible.find(c=>c.t===m.t))
    });
    updateUI();
  }

  function current(){ return state.candles[state.idx]; }

  function onRR(){
    const sl = parseFloat(document.getElementById("simSL").value)||0;
    const tp = parseFloat(document.getElementById("simTP").value)||0;
    document.getElementById("simRR").textContent = sl>0 ? (tp/sl).toFixed(2) : "—";
  }

  function sizeLots(riskPct, stopPips){
    const r = Store.get("rules");
    const eq = equity();
    const riskUSD = eq * (riskPct/100);
    if(stopPips<=0) return 0;
    return Math.max(0.01, +(riskUSD / (stopPips * PIP_PER_LOT_USD)).toFixed(2));
  }

  function equity(){
    const arr = Store.get("equity");
    return arr.length ? arr[arr.length-1].v : Store.get("rules").balance;
  }

  function open(side){
    const chk = Discipline.canTrade();
    if(!chk.ok){ Toast("🚫 "+chk.why,"bad"); return; }
    if(state.position){ Toast("Close current position first.","warn"); return; }
    const bar = current(); if(!bar){ Toast("Load data first.","warn"); return; }
    const riskPct = parseFloat(document.getElementById("simRisk").value)||1;
    const slPips  = parseFloat(document.getElementById("simSL").value)||20;
    const tpPips  = parseFloat(document.getElementById("simTP").value)||40;
    const lots = sizeLots(riskPct, slPips);
    const entry = bar.c;
    const sl = side==="buy" ? entry - slPips*PIP : entry + slPips*PIP;
    const tp = side==="buy" ? entry + tpPips*PIP : entry - tpPips*PIP;
    state.position = {
      id: "t_"+Date.now(), side, entry, sl, tp, lots,
      riskPct, slPips, tpPips, openedAt: Date.now(), openedBarT: bar.t,
      rr_planned: tpPips/slPips
    };
    state.markers.push({ t: bar.t, price: entry, side });
    Discipline.onTradeOpened();
    log(`OPEN ${side.toUpperCase()} ${lots} lots @ ${entry.toFixed(5)} · SL ${sl.toFixed(5)} · TP ${tp.toFixed(5)}`);
    render();
  }

  function close(reason="manual"){
    if(!state.position){ Toast("No open position.","warn"); return; }
    const bar = current();
    const exit = bar.c;
    const p = state.position;
    const pips = (p.side==="buy" ? (exit - p.entry) : (p.entry - exit)) / PIP;
    const pnl = +(pips * p.lots * PIP_PER_LOT_USD).toFixed(2);
    const rr = p.slPips>0 ? +(pips/p.slPips).toFixed(2) : 0;

    const trade = {
      id: p.id, side: p.side, lots: p.lots, size: p.lots,
      entry: p.entry, exit, sl: p.sl, tp: p.tp,
      pips: +pips.toFixed(1), pnl, rr, reason,
      riskPct: p.riskPct, slPips: p.slPips, tpPips: p.tpPips,
      openedAt: p.openedAt, closedAt: Date.now(),
      openedBarT: p.openedBarT, closedBarT: bar.t,
      status:"closed"
    };
    const trades = Store.get("trades"); trades.push(trade); Store.set("trades",trades);

    // equity
    const eqArr = Store.get("equity");
    const newEq = +(equity() + pnl).toFixed(2);
    eqArr.push({ t: Date.now(), v: newEq }); Store.set("equity", eqArr);

    Discipline.onTradeClosed(trade);
    Gami.addXP(pnl>0?15:5, pnl>0?"Winning trade":"Trade closed");
    Gami.updateBadges();
    log(`CLOSE ${p.side.toUpperCase()} @ ${exit.toFixed(5)} (${reason}) · ${pips.toFixed(1)} pips · $${pnl} · R:${rr}`);
    state.markers.push({ t: bar.t, price: exit, side: p.side==="buy"?"sell":"buy" });
    state.position = null;
    render();
  }

  /* SL/TP check each new bar */
  function checkSLTP(){
    if(!state.position) return;
    const bar = current();
    const p = state.position;
    if(p.side==="buy"){
      if(bar.l <= p.sl) return close("stop");
      if(bar.h >= p.tp) return close("take");
    } else {
      if(bar.h >= p.sl) return close("stop");
      if(bar.l <= p.tp) return close("take");
    }
  }

  function step(){
    if(state.idx >= state.candles.length-1){ pause(); Toast("End of data.","warn"); return; }
    state.idx++;
    checkSLTP();
    render();
  }

  function play(){
    if(state.playing) return;
    state.playing = true;
    state.timer = setInterval(step, state.speedMs);
  }
  function pause(){ state.playing=false; if(state.timer){clearInterval(state.timer); state.timer=null;} }

  async function load(){
    pause();
    const src = document.getElementById("simDataSource").value;
    const tf  = document.getElementById("simTF").value;
    state.dataSource = src;
    let candles = [];
    if(src === "sample"){
      candles = await TDAPI.loadSample();
    } else if(src === "cached"){
      const c = Store.get(`cache:ts:${APP_CONFIG.SYMBOL}:${tf}`);
      candles = c ? c.v : await TDAPI.loadSample();
    } else {
      try { candles = await TDAPI.timeSeries({ interval: tf, outputsize: 500 }); }
      catch(e){ Toast(e.message,"warn"); candles = await TDAPI.loadSample(); }
    }
    state.candles = candles;
    state.idx = Math.min(150, candles.length-1);
    state.position = null;
    state.markers = [];
    log(`Loaded ${candles.length} candles · ${tf} · ${src}`);
    render();
  }

  function updateUI(){
    const bar = current();
    const pos = state.position;
    const posEl = document.getElementById("simPos");
    if(pos && bar){
      const pips = (pos.side==="buy" ? (bar.c-pos.entry) : (pos.entry-bar.c)) / PIP;
      const upnl = +(pips * pos.lots * PIP_PER_LOT_USD).toFixed(2);
      posEl.innerHTML = `<b>${pos.side.toUpperCase()}</b> ${pos.lots} lots<br/>
        Entry ${pos.entry.toFixed(5)} · ${pips.toFixed(1)} pips<br/>
        uPnL: <b class="${upnl>=0?'ok':'bad'}">$${upnl}</b>`;
    } else posEl.textContent="No open position";

    document.getElementById("simEquity").textContent = "$"+equity().toLocaleString();
    const ds = Discipline.summary();
    document.getElementById("simDayPL").textContent =
      (ds.dayPnL>=0?"+$":"-$") + Math.abs(ds.dayPnL).toFixed(0);
    document.getElementById("simTradesToday").textContent = `${ds.tradesToday}/${ds.maxTrades}`;
    const lockEl = document.getElementById("simLock");
    const chk = Discipline.canTrade();
    if(!chk.ok){ lockEl.classList.remove("hidden"); lockEl.textContent = "🚫 "+chk.why; }
    else lockEl.classList.add("hidden");
    document.getElementById("balanceBadge").textContent = "$"+equity().toLocaleString();
    Discipline.updateBadge();
  }

  function log(msg){
    const el = document.getElementById("simLog");
    if(!el) return;
    const ts = new Date().toLocaleTimeString();
    el.innerHTML = `<div>[${ts}] ${msg}</div>` + el.innerHTML;
  }

  function bind(){
    document.getElementById("simLoad").onclick = load;
    document.getElementById("simPlay").onclick = ()=>{ state.speedMs = 1100 - 50*parseInt(document.getElementById("simSpeed").value); play(); };
    document.getElementById("simPause").onclick = pause;
    document.getElementById("simStep").onclick  = step;
    document.getElementById("simBuy").onclick   = ()=>open("buy");
    document.getElementById("simSell").onclick  = ()=>open("sell");
    document.getElementById("simClose").onclick = ()=>close("manual");
    document.getElementById("simSL").oninput = onRR;
    document.getElementById("simTP").oninput = onRR;
    load();
  }

  window.Simulator = { bind, state };
})();
