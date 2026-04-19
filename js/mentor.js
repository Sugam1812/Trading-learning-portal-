/* AI mentor — rule-based with reflective questioning.
   Understands: trade review, concept Q&A, mindset checks. */
(function(){
  const KB = [
    { k:/pip/i, a:"A pip is the 4th decimal on EUR/USD (0.0001). On 0.1 lot it's $1; on 1 lot it's $10." },
    { k:/lot/i, a:"1 standard lot = 100,000 units. 0.1 = mini, 0.01 = micro. Always size by risk, not by feel." },
    { k:/(risk|sizing|position size)/i, a:"Cap risk per trade at 1%. Lots = (Account × Risk%) ÷ (StopPips × PipValue)." },
    { k:/(stop|sl)/i, a:"Stop belongs on the **structure** (beyond the swing). Use ATR × 1.5 if unsure. Never inside recent noise." },
    { k:/(take|tp|target)/i, a:"Target at least 2R. Partial at 1R if volatile. Don't move TP just because you feel nervous." },
    { k:/(rr|risk.reward|expectancy)/i, a:"Expectancy = Win% × AvgWin − Loss% × AvgLoss. Chase expectancy, not win rate." },
    { k:/(revenge|tilt)/i, a:"Revenge trading is a capital killer. Rule: 15 min cooldown + 1 journal line after ANY loss." },
    { k:/(fomo)/i, a:"FOMO = chasing moved candles. Wait for a pullback to your level; if no pullback, it wasn't your trade." },
    { k:/(news|nfp|cpi)/i, a:"Don't open trades in the 15 min before/after red-folder news. If in profit, take partials." },
    { k:/(prop|ftmo|challenge)/i, a:"Prop rules: daily loss ~5%, total DD ~10%, profit ~8–10%. Train well below those limits." },
    { k:/(session|london|ny)/i, a:"Best windows for EUR/USD: London open (07–10 GMT) and NY open (12–15 GMT). Skip Asia unless you have an edge." },
    { k:/(journal)/i, a:"Journal every trade: reason in, reason out, emotion. Patterns are hidden there." },
    { k:/(consistenc)/i, a:"Consistency > heroics. 1% × 8 good days beats 8% in one day — and most firms enforce that." },
    { k:/(hello|hi|hey)/i, a:"Hey trader. What are you working on today — a trade review, a concept, or a mindset check?" }
  ];

  function reviewLast(){
    const trades = (Store.get("trades")||[]).filter(x=>x.status==="closed");
    if(!trades.length) return "You haven't closed a trade yet. Open the Simulator and take one small trade — I'll review it.";
    const t = trades[trades.length-1];
    const lines = [];
    lines.push(`Last trade: ${t.side.toUpperCase()} ${t.lots} lots, entry ${t.entry.toFixed(5)}, exit ${t.exit.toFixed(5)}, ${t.pips} pips, <b>$${t.pnl}</b>, R = ${t.rr}.`);
    if(t.reason==="stop") lines.push("Stopped out. Did your setup truly invalidate, or was the stop too tight?");
    if(t.reason==="take") lines.push("Take-profit hit. Clean execution. Could you have run partials for more?");
    if(t.reason==="manual" && t.pnl>0 && t.rr<1.5) lines.push("You closed a winner manually before 1.5R — are you trusting the plan, or cutting early from fear?");
    if(t.riskPct>2) lines.push(`Risk was ${t.riskPct}%. Cap it at 1% while training.`);
    if(t.revenge) lines.push("⚠️ This trade was flagged as a revenge trade. Insert a cooldown next time.");
    lines.push("<i>Reflective question:</i> In one sentence — <b>why</b> did you take this trade?");
    return lines.join("<br/>");
  }

  function respond(msg){
    const m = msg.toLowerCase();
    if(/(review|last trade|my trade)/.test(m)) return reviewLast();
    if(/(weak|weakness|what should i learn)/.test(m)){
      const w = Adaptive.weakest();
      if(!w.length) return "You look solid right now. Keep journalling and stacking small wins.";
      return "Your weak spots:<br/>" + w.map(x=>`• ${x.reason}`).join("<br/>") + "<br/><i>Open the Curriculum — I've queued the right lesson for you.</i>";
    }
    if(/(why.*enter|why did i enter|confirmation)/.test(m)){
      return "Before you took the trade, what 2 things confirmed it? (structure + trigger + zone — you need at least 2.) Write them in the journal.";
    }
    for(const row of KB) if(row.k.test(m)) return row.a;
    return "I hear you. Can you rephrase? I can review your last trade, answer concept questions (pip, lot, risk, R:R, prop rules), or check your mindset.";
  }

  function addMsg(who, text){
    const chat = document.getElementById("chat");
    const div = document.createElement("div"); div.className = who==="me"?"me":"ai";
    div.innerHTML = text; chat.appendChild(div); chat.scrollTop = chat.scrollHeight;
  }

  function send(){
    const input = document.getElementById("chatMsg");
    const msg = input.value.trim(); if(!msg) return;
    addMsg("me", msg); input.value="";
    setTimeout(()=>addMsg("ai", respond(msg)), 300);
  }

  function bind(){
    document.getElementById("chatSend").onclick = send;
    document.getElementById("chatMsg").addEventListener("keydown", e=>{ if(e.key==="Enter") send(); });
    addMsg("ai", "I'm your trading mentor. Try: <b>review my last trade</b>, <b>what is R:R</b>, or <b>what should I learn next</b>.");
  }

  window.Mentor = { bind, respond };
})();
