/* Daily routine — pre-market, trade plan, post-trade review */
(function(){
  const ITEMS = {
    pre: [
      { id:"pre_market",  q:"Checked calendar / news for EUR/USD today?" },
      { id:"pre_bias",    q:"Written a directional bias (long / short / neutral)?" },
      { id:"pre_levels",  q:"Marked key support & resistance zones?" }
    ],
    plan: [
      { id:"plan_setup",  q:"Defined the specific A+ setup you'll take today?" },
      { id:"plan_risk",   q:"Set max 1% risk per trade, max 3% day, max 3 trades?" },
      { id:"plan_invalid",q:"Written what invalidates the setup (no-trade rule)?" }
    ],
    post: [
      { id:"post_trades", q:"Reviewed each trade: entry reason, exit reason?" },
      { id:"post_rules",  q:"Check: did I follow all prop rules today?" },
      { id:"post_lesson", q:"Recorded 1 lesson learned in the journal?" }
    ]
  };
  function today(){ return new Date().toISOString().slice(0,10); }
  function state(){
    const r = Store.get("routine");
    if(!r[today()]) r[today()] = {};
    Store.set("routine", r);
    return r[today()];
  }
  function save(s){
    const r = Store.get("routine"); r[today()] = s; Store.set("routine", r);
  }
  function allDone(){
    const s = state();
    return Object.values(ITEMS).flat().every(x => s[x.id]);
  }
  function render(container){
    const s = state();
    container.innerHTML = "";
    ["pre","plan","post"].forEach(phase=>{
      const card = document.createElement("div"); card.className="card";
      const title = { pre:"Pre-market", plan:"Trade plan", post:"Post-trade review" }[phase];
      card.innerHTML = `<h3>${title}</h3>`;
      ITEMS[phase].forEach(x=>{
        const row = document.createElement("label");
        row.style.cssText="display:flex;gap:8px;align-items:center;color:var(--fg);padding:4px 0";
        const cb = document.createElement("input"); cb.type="checkbox"; cb.style.width="auto"; cb.checked = !!s[x.id];
        cb.onchange = ()=>{ s[x.id] = cb.checked; save(s); if(allDone()){ Gami.addXP(30,"Routine complete"); Gami.grant("routine5"); } render(container); };
        row.appendChild(cb); row.insertAdjacentHTML("beforeend", `<span>${x.q}</span>`);
        card.appendChild(row);
      });
      container.appendChild(card);
    });
    if(allDone()){
      const d=document.createElement("div"); d.className="card ok";
      d.innerHTML = "✅ Routine complete for today. You just earned professional habit XP.";
      container.appendChild(d);
    }
  }
  window.Routine = { render, allDone, ITEMS };
})();
