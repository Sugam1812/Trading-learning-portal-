/* Curriculum — modules, lessons, checkpoints */
(function(){
  const MODULES = [
    {
      id: "m1", name: "1 · Foundations",
      lessons: [
        { id:"l1.1", title:"What is a pip? What is a lot?",
          body:`A **pip** is the 4th decimal on EUR/USD (1.0851 → 1.0852 = 1 pip).
A **lot** is contract size. 1 standard lot = 100,000 units. 1 pip on 1 lot ≈ $10.
0.1 lot = mini, 0.01 = micro. On a $100k prop account, sizes of 0.5–2 lots are normal — not 10.`,
          key:["pip","lot"],
          checkpoint:{ q:"How much $ is 1 pip on 0.1 lot EUR/USD?", a:["1","$1","1$","1 dollar"] }
        },
        { id:"l1.2", title:"Bid, ask, spread, slippage",
          body:`You **buy at the ask**, **sell at the bid**. Spread = ask − bid = first cost.
Slippage = actual fill worse than expected during news/thin liquidity. Widen stops around news.`,
          key:["spread","slippage"],
          checkpoint:{ q:"If ask=1.0853 and bid=1.0851, spread in pips is?", a:["2","2 pips"] }
        },
        { id:"l1.3", title:"Sessions: Asia / London / NY",
          body:`EUR/USD is busiest **London (08–12 GMT)** and **NY overlap (12–16 GMT)**.
Asian session is slow, ranges. Most prop traders focus on London open + NY open.`,
          key:["session","london","ny"],
          checkpoint:{ q:"Which session usually has highest EUR/USD volatility?", a:["london","london/ny","ny","overlap"] }
        }
      ]
    },
    {
      id: "m2", name: "2 · Technical Analysis",
      lessons: [
        { id:"l2.1", title:"Market structure: HH, HL, LH, LL",
          body:`**Uptrend** = higher highs + higher lows. **Downtrend** = lower highs + lower lows.
A **break of structure (BOS)** signals trend change. Trade **with structure**, not against it.`,
          key:["structure","HH","HL","BOS"],
          checkpoint:{ q:"Lower highs + lower lows = which trend?", a:["down","downtrend","bearish"] }
        },
        { id:"l2.2", title:"Support & Resistance",
          body:`Support = price where demand stops falls. Resistance = where supply stops rises.
Draw from **swing points**, not random. Treat as **zones**, not exact lines.
Old resistance → new support after break. Trade **bounces** and **breakouts**.`,
          key:["support","resistance","zone"],
          checkpoint:{ q:"What does flipped resistance usually become?", a:["support"] }
        },
        { id:"l2.3", title:"Price action patterns",
          body:`**Pin bar / rejection** = long wick against level → reversal.
**Engulfing** = full body swallows prior body → momentum shift.
**Inside bar** = compression → breakout setup.
Always confirm with structure and location (S/R, trendline).`,
          key:["pin","engulfing","inside bar"],
          checkpoint:{ q:"A bullish candle that fully swallows the previous red candle is?", a:["engulfing","bullish engulfing"] }
        },
        { id:"l2.4", title:"Indicators used sparingly",
          body:`Indicators **confirm**, they don't lead. Stick to 1–2:
• EMA 20/50 for trend • RSI for extremes • ATR for stop sizing.
Never stack 7 indicators — it just hides the chart.`,
          key:["ema","rsi","atr"],
          checkpoint:{ q:"Which indicator is best for sizing your stop?", a:["atr"] }
        }
      ]
    },
    {
      id: "m3", name: "3 · Risk Management",
      lessons: [
        { id:"l3.1", title:"Risk per trade",
          body:`Professional cap: **0.5–1% per trade**. Never above 2%.
Formula: Lots = (Account × Risk%) / (StopPips × PipValuePerLot).
On $100k @ 1% risk, 20 pip stop ⇒ $1,000 / (20 × $10) = **0.5 lots**.`,
          key:["risk","position size"],
          checkpoint:{ q:"1% risk on $100k, 20 pip stop. Lots? (no units)", a:["0.5","0.50"] }
        },
        { id:"l3.2", title:"Risk-to-reward (R:R)",
          body:`R:R ≥ 2 means you only need ~40% win rate to be profitable.
**Expectancy = WinRate × AvgWin − LossRate × AvgLoss**. Chase expectancy, not win rate.`,
          key:["rr","expectancy"],
          checkpoint:{ q:"At 40% win rate, minimum R:R to break even?", a:["1.5","1.5:1","3/2"] }
        },
        { id:"l3.3", title:"Drawdown & capital protection",
          body:`Lose 50% → need +100% to recover. **Protect capital first.**
Rule: if down -3% for the day, stop. If -8% for the week, journal + rest.
Prop-firm common: 5% daily / 10% total. Train well below those.`,
          key:["drawdown"],
          checkpoint:{ q:"Loss needed to require 100% recovery?", a:["50","50%"] }
        }
      ]
    },
    {
      id: "m4", name: "4 · Psychology",
      lessons: [
        { id:"l4.1", title:"Discipline > prediction",
          body:`Markets are probabilistic. You're not paid to be right, you're paid to **follow your edge**.
Define your rules, execute them, review weekly. Emotion is the tax on impatience.`,
          key:["discipline"],
          checkpoint:{ q:"What tax do emotions add?", a:["impatience","the tax on impatience"] }
        },
        { id:"l4.2", title:"Revenge trading",
          body:`Entering immediately after a loss, bigger, to "get it back" — **fatal**.
Rule: after any loss, wait 15 minutes AND write 1 journal line before the next trade.`,
          key:["revenge"],
          checkpoint:{ q:"Minimum wait after a loss (min)?", a:["15"] }
        },
        { id:"l4.3", title:"FOMO and boredom",
          body:`FOMO = chasing moved candles. Boredom = forcing trades in no-trade zones.
Counter: written plan, session schedule, and step-away timer when no A+ setup.`,
          key:["fomo","boredom"],
          checkpoint:{ q:"Chasing a candle that already moved is called?", a:["fomo"] }
        }
      ]
    },
    {
      id: "m5", name: "5 · Prop-Firm Survival",
      lessons: [
        { id:"l5.1", title:"The rules you actually fail on",
          body:`Most traders fail by breaching **daily loss** (5%), **total drawdown** (10%),
or by holding through **news**. Not by lack of strategy.
Win the simulator by treating daily loss as the NEW account blow-up threshold.`,
          key:["prop","daily loss"],
          checkpoint:{ q:"Common prop daily loss cap %?", a:["5","5%"] }
        },
        { id:"l5.2", title:"Profit target with sanity",
          body:`Typical challenge: +8–10% in 30 days. At 1% risk and 2R winners,
you need ~4–5 winners net. **Do not overtrade to hit it faster.**
Average 1–2 A+ trades/day is enough.`,
          key:["target"],
          checkpoint:{ q:"Max winners per day you should chase?", a:["1","2","1-2","1 to 2"] }
        },
        { id:"l5.3", title:"Consistency rule",
          body:`Many firms enforce a **consistency rule**: no single day > 30–40% of total profit.
Implication: you must trade multiple solid days, not one lucky day.`,
          key:["consistency"],
          checkpoint:{ q:"Common max share of total profit from one day?", a:["30","30%","40","40%"] }
        }
      ]
    }
  ];

  function state(){ return Store.get("lessons") || {}; }
  function save(s){ Store.set("lessons", s); }

  function markComplete(id, score=1){
    const s = state();
    s[id] = { completed:true, score, t: Date.now() };
    save(s);
    Gami.addXP(25, "Lesson complete");
    Gami.updateBadges();
  }

  function listView(container){
    container.innerHTML = "";
    const s = state();
    MODULES.forEach(m=>{
      const done = m.lessons.filter(l=>s[l.id]?.completed).length;
      const card = document.createElement("div"); card.className="card";
      card.innerHTML = `<h3>${m.name} <span class="dim">(${done}/${m.lessons.length})</span></h3>`;
      m.lessons.forEach(l=>{
        const ok = s[l.id]?.completed;
        const row = document.createElement("div");
        row.style.cssText="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-top:1px solid var(--border)";
        row.innerHTML = `<span>${ok?"✅":"⭕"} ${l.title}</span>`;
        const btn = document.createElement("button"); btn.className="btn ghost"; btn.textContent=ok?"Review":"Open";
        btn.onclick = ()=>openLesson(l);
        row.appendChild(btn); card.appendChild(row);
      });
      container.appendChild(card);
    });
  }

  function openLesson(l){
    const v = document.getElementById("lessonView");
    v.classList.remove("hidden");
    v.innerHTML = `
      <h3>${l.title}</h3>
      <div class="lesson-body">${marked(l.body)}</div>
      <hr/>
      <h3>Checkpoint</h3>
      <p>${l.checkpoint.q}</p>
      <input id="lessonAns" placeholder="Your answer"/>
      <button class="btn" id="lessonSubmit">Submit</button>
      <div id="lessonFB" class="dim"></div>
    `;
    document.getElementById("lessonSubmit").onclick = ()=>{
      const ans = (document.getElementById("lessonAns").value||"").trim().toLowerCase();
      const ok = l.checkpoint.a.some(x => ans.includes(String(x).toLowerCase()));
      const fb = document.getElementById("lessonFB");
      if(ok){ fb.textContent = "✅ Correct. Lesson complete."; fb.className="ok"; markComplete(l.id,1); }
      else  { fb.textContent = "❌ Not quite. Re-read and try again."; fb.className="bad"; }
    };
    window.scrollTo({top: v.offsetTop-80, behavior:"smooth"});
  }

  function marked(s){
    return s.replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/\n/g,"<br/>");
  }

  /* Adaptive suggestion — pick the first incomplete lesson. */
  function nextSuggested(){
    const s = state();
    for(const m of MODULES)
      for(const l of m.lessons)
        if(!s[l.id]?.completed) return l;
    return null;
  }

  window.Curriculum = { MODULES, state, markComplete, listView, openLesson, nextSuggested };
})();
