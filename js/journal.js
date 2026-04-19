/* Smart journal — auto-captures trades; adds manual reasoning + emotion.
   Generates AI-style pattern insights. */
(function(){

  function save(){
    const j = Store.get("journal");
    j.push({
      t: Date.now(),
      reason: document.getElementById("jReason").value.trim(),
      emotion: document.getElementById("jEmo").value,
      session: document.getElementById("jSess").value,
      tradesSnapshot: (Store.get("trades")||[]).length
    });
    Store.set("journal", j);
    document.getElementById("jReason").value="";
    Gami.addXP(10,"Journal entry");
    Gami.updateBadges();
    render();
    Toast("Journal saved.","ok");
  }

  function insights(){
    const j = Store.get("journal"); const t = (Store.get("trades")||[]).filter(x=>x.status==="closed");
    const out = [];
    if(!j.length) return ["Log a few entries to get insights."];

    // Emotion vs outcome — pair each journal entry with next trade
    const byEmo = {};
    j.forEach(e=>{
      const next = t.find(tr => tr.openedAt > e.t);
      if(!next) return;
      byEmo[e.emotion] = byEmo[e.emotion] || { n:0, pnl:0 };
      byEmo[e.emotion].n++; byEmo[e.emotion].pnl += next.pnl;
    });
    Object.entries(byEmo).forEach(([e,v])=>{
      if(v.n>=2){
        const avg = v.pnl/v.n;
        const good = avg>0;
        out.push(`${good?"🟢":"🔴"} When you feel <b>${e}</b>, your next trade averages <b>$${avg.toFixed(0)}</b> (${v.n} samples).`);
      }
    });

    // Session performance
    const bySess = { asia:[], london:[], ny:[] };
    j.forEach(e=>{
      const next = t.find(tr=>tr.openedAt>e.t);
      if(next) bySess[e.session].push(next.pnl);
    });
    Object.entries(bySess).forEach(([s,arr])=>{
      if(arr.length>=3){
        const avg = arr.reduce((a,b)=>a+b,0)/arr.length;
        if(avg<0) out.push(`🟡 You perform poorly during <b>${s.toUpperCase()}</b> (avg $${avg.toFixed(0)} over ${arr.length} trades).`);
      }
    });

    // Rule-break after losses
    const trades = t;
    let brokeAfterLoss = 0;
    for(let i=1;i<trades.length;i++){
      if(trades[i-1].pnl<0 && trades[i].revenge) brokeAfterLoss++;
    }
    if(brokeAfterLoss>=2) out.push(`🔴 Pattern: you break rules after losses (${brokeAfterLoss} flagged). Build in a 15-min cooldown.`);

    if(!out.length) out.push("No strong patterns yet. Keep journalling.");
    return out;
  }

  function render(){
    document.getElementById("jInsights").innerHTML = insights().map(x=>`<div>${x}</div>`).join("");
    const list = Store.get("journal").slice().reverse().slice(0,30);
    const host = document.getElementById("jList");
    if(!list.length){ host.innerHTML=""; return; }
    host.innerHTML = "<div class='card'><h3>Recent entries</h3>" + list.map(e=>`
      <div style="padding:8px 0;border-top:1px solid var(--border)">
        <div class="dim" style="font-size:11px">${new Date(e.t).toLocaleString()} · ${e.session} · ${e.emotion}</div>
        <div>${e.reason||"<i class='dim'>(no note)</i>"}</div>
      </div>`).join("") + "</div>";
  }

  function bind(){
    document.getElementById("jSave").onclick = save;
    render();
  }

  window.Journal = { bind, render, insights };
})();
