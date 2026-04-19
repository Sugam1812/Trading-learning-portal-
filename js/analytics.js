/* Analytics + behaviour detection */
(function(){
  function closed(){ return (Store.get("trades")||[]).filter(t=>t.status==="closed"); }

  function kpis(){
    const t = closed();
    const n = t.length;
    if(!n) return { winRate:0, avgRR:0, expectancy:0, maxDD:0, trades:0 };
    const wins = t.filter(x=>x.pnl>0);
    const losses = t.filter(x=>x.pnl<=0);
    const winRate = wins.length/n;
    const avgWin = wins.length ? wins.reduce((a,b)=>a+b.pnl,0)/wins.length : 0;
    const avgLoss= losses.length? Math.abs(losses.reduce((a,b)=>a+b.pnl,0)/losses.length) : 0;
    const avgRR  = t.reduce((a,b)=>a+(b.rr||0),0)/n;
    const expectancy = winRate*avgWin - (1-winRate)*avgLoss;

    const eq = Store.get("equity");
    let peak=-Infinity, mdd=0;
    eq.forEach(p=>{ if(p.v>peak) peak=p.v; mdd = Math.max(mdd, (peak-p.v)/peak); });

    return { winRate, avgRR, expectancy, maxDD: mdd, trades:n };
  }

  function behaviour(){
    const t = closed();
    const out = [];
    if(t.length < 3) { out.push("Not enough data yet — take a few more trades."); return out; }

    // Overtrading
    const byDay = {};
    t.forEach(x=>{
      const d = new Date(x.closedAt).toISOString().slice(0,10);
      byDay[d] = (byDay[d]||0)+1;
    });
    const avgPerDay = t.length / Object.keys(byDay).length;
    if(avgPerDay > 5) out.push(`🔴 Overtrading: avg ${avgPerDay.toFixed(1)} trades/day. Cap yourself at 3–5.`);

    // Exit too early (TP hit rate very low but positive pnl)
    const reached = t.filter(x=>x.reason==="take").length;
    const manual  = t.filter(x=>x.reason==="manual" && x.pnl>0).length;
    if(manual > reached && manual>3) out.push("🟡 You close winners manually more than you let them hit TP. You're exiting too early — trust your R:R.");

    // Weak risk management
    const highRisk = t.filter(x=>(x.riskPct||0) > 2).length;
    if(highRisk/t.length > 0.3) out.push("🔴 Risk management weak: >30% of trades used >2% risk.");

    // Revenge flags
    const rev = t.filter(x=>x.revenge).length;
    if(rev >= 2) out.push(`🔴 Revenge trading pattern: ${rev} flagged trades.`);

    // Session performance
    const sessPnL = { asia:0, london:0, ny:0 };
    t.forEach(x=>{
      const h = new Date(x.closedAt).getUTCHours();
      const s = h<7 ? "asia" : h<12 ? "london" : h<20 ? "ny" : "asia";
      sessPnL[s] += x.pnl;
    });
    const worst = Object.entries(sessPnL).sort((a,b)=>a[1]-b[1])[0];
    if(worst[1] < 0) out.push(`🟡 You lose money most in the ${worst[0].toUpperCase()} session ($${worst[1].toFixed(0)}). Consider skipping it.`);

    // Positive feedback
    if(out.length===0) out.push("🟢 No red flags detected. Keep executing your edge.");
    return out;
  }

  function tradeHistoryTable(container){
    const t = closed().slice().reverse();
    if(!t.length){ container.innerHTML = "<p class='dim'>No trades yet.</p>"; return; }
    const rows = t.slice(0,30).map(x=>`
      <tr>
        <td>${new Date(x.closedAt).toLocaleString()}</td>
        <td>${x.side.toUpperCase()}</td>
        <td>${x.lots}</td>
        <td>${x.entry.toFixed(5)}</td>
        <td>${x.exit.toFixed(5)}</td>
        <td>${x.pips}</td>
        <td class="${x.pnl>=0?'ok':'bad'}">$${x.pnl}</td>
        <td>${x.rr}</td>
        <td>${x.reason}${x.revenge?' 🔥':''}</td>
      </tr>`).join("");
    container.innerHTML = `<div style="overflow-x:auto"><table style="width:100%;font-size:12px;border-collapse:collapse">
      <thead><tr style="text-align:left;color:var(--dim)">
        <th>Time</th><th>Side</th><th>Lots</th><th>Entry</th><th>Exit</th><th>Pips</th><th>P/L</th><th>R</th><th>Why</th>
      </tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function render(){
    const k = kpis();
    document.getElementById("aWin").textContent = (k.winRate*100).toFixed(1)+"%";
    document.getElementById("aRR").textContent  = k.avgRR.toFixed(2);
    document.getElementById("aExp").textContent = "$"+k.expectancy.toFixed(2);
    document.getElementById("aDD").textContent  = (k.maxDD*100).toFixed(1)+"%";
    const behaveEl = document.getElementById("aBehave");
    behaveEl.innerHTML = behaviour().map(x=>`<div>${x}</div>`).join("");
    Chart.drawEquity(document.getElementById("equityChart"), Store.get("equity"));
    tradeHistoryTable(document.getElementById("aTrades"));
  }

  window.Analytics = { kpis, behaviour, render };
})();
