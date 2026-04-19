/* Quizzes + scenario-based market challenges */
(function(){

  const QUIZZES = [
    {
      id:"q_basics", title:"Basics check", topic:"foundations",
      questions:[
        { q:"On EUR/USD, 1 pip = ?", opts:["0.001","0.0001","0.01","0.1"], a:1 },
        { q:"1 standard lot = how many units?", opts:["1,000","10,000","100,000","1,000,000"], a:2 },
        { q:"You buy at which price?", opts:["bid","ask","mid","last"], a:1 },
        { q:"Most volatile EUR/USD session?", opts:["Sydney","Tokyo","London/NY overlap","Wellington"], a:2 }
      ]
    },
    {
      id:"q_risk", title:"Risk management", topic:"risk",
      questions:[
        { q:"Acceptable risk per trade for a prop trader?", opts:["5%","2%","1% or less","10%"], a:2 },
        { q:"Min R:R to break even at 40% win rate?", opts:["1:1","1.5:1","2:1","3:1"], a:1 },
        { q:"-50% drawdown requires what % gain to recover?", opts:["50%","75%","100%","200%"], a:2 },
        { q:"Expectancy formula?", opts:["Win% × AvgWin","Win% × AvgWin − Loss% × AvgLoss","AvgWin/AvgLoss","Win% − Loss%"], a:1 }
      ]
    },
    {
      id:"q_psych", title:"Psychology", topic:"psych",
      questions:[
        { q:"Entering a bigger trade right after a loss to get it back?", opts:["scaling","revenge trading","martingale","hedging"], a:1 },
        { q:"Best antidote to FOMO?", opts:["Bigger size","Written plan + wait for setup","Switch timeframes","Add indicators"], a:1 },
        { q:"You're paid to be…?", opts:["right","disciplined","fast","lucky"], a:1 }
      ]
    },
    {
      id:"q_prop", title:"Prop firm rules", topic:"prop",
      questions:[
        { q:"Most common daily loss cap?", opts:["2%","5%","10%","15%"], a:1 },
        { q:"Most common max total drawdown?", opts:["5%","8%","10%","20%"], a:2 },
        { q:"Profit target for most challenges?", opts:["1-2%","3-5%","8-10%","25%"], a:2 },
        { q:"A consistency rule typically caps one day at ~?", opts:["10%","20%","30-40%","60%"], a:2 }
      ]
    }
  ];

  /* Scenario challenges use a shaped candle array + a decision question. */
  const SCENARIOS = [
    {
      id:"sc_breakout",
      title:"London breakout — buy, sell, or skip?",
      brief:"Price ranged in Asia, broke above the high at 08:15 GMT on strong candle.",
      gen(){
        // synthetic: 30 range bars then breakout
        const c = []; let p = 1.0800; const tStart = Date.now()-30*3600*1000;
        for(let i=0;i<30;i++){
          const o=p, r=0.0005, move=(Math.random()-0.5)*r;
          const cl=p+move, h=Math.max(o,cl)+Math.random()*r*0.4, l=Math.min(o,cl)-Math.random()*r*0.4;
          c.push({t:tStart+i*3600*1000,o,h,l,c:cl,v:1}); p=cl;
        }
        // breakout
        for(let i=0;i<3;i++){
          const o=p, cl=p+0.0018+Math.random()*0.0005;
          c.push({t:Date.now()+(i-3)*3600*1000, o, h:cl+0.0003, l:o-0.0002, c:cl, v:1}); p=cl;
        }
        return c;
      },
      choices:[
        { label:"Buy breakout, SL below range, TP = 2x risk", correct:true, fb:"Correct — momentum + clean structure + defined SL." },
        { label:"Sell the breakout — it must mean-revert", correct:false, fb:"Counter-trend without confirmation. Classic FOMO-reversal trap." },
        { label:"Skip — no edge here", correct:false, fb:"Acceptable, but you missed a textbook A+ setup." }
      ]
    },
    {
      id:"sc_news",
      title:"NFP in 5 minutes — position open",
      brief:"You are +1R on a long. NFP drops in 5 minutes.",
      gen(){
        const c=[]; let p=1.0900; const t=Date.now()-50*3600*1000;
        for(let i=0;i<50;i++){ const cl=p+(Math.random()-0.3)*0.0006; c.push({t:t+i*3600*1000,o:p,h:Math.max(p,cl)+0.0003,l:Math.min(p,cl)-0.0003,c:cl,v:1}); p=cl; }
        return c;
      },
      choices:[
        { label:"Close half, move stop to breakeven on rest", correct:true, fb:"Locks in gains; lets winner run without news risk." },
        { label:"Hold full size — let it fly through news", correct:false, fb:"News = slippage + random result. Never let a winner become a loser." },
        { label:"Add more size into the news", correct:false, fb:"Pure gambling. Instant prop-firm killer." }
      ]
    },
    {
      id:"sc_revenge",
      title:"You just lost 2 in a row",
      brief:"You took a setup and lost -1R. Revenge long -1R. A new setup appears.",
      gen(){
        const c=[]; let p=1.0850; const t=Date.now()-60*3600*1000;
        for(let i=0;i<60;i++){ const cl=p+(Math.random()-0.5)*0.0006; c.push({t:t+i*3600*1000,o:p,h:Math.max(p,cl)+0.0003,l:Math.min(p,cl)-0.0003,c:cl,v:1}); p=cl; }
        return c;
      },
      choices:[
        { label:"Stop trading, 15-min cooldown, journal", correct:true, fb:"Textbook. Protect mental capital = protect money." },
        { label:"Take it at 2x normal size", correct:false, fb:"This is how prop accounts die in 10 minutes." },
        { label:"Switch to GBP/JPY for 'easier' moves", correct:false, fb:"Tilt in a new suit. Same outcome." }
      ]
    }
  ];

  /* Rendering */
  function listView(container){
    container.innerHTML = "";
    const card = document.createElement("div"); card.className="card";
    card.innerHTML = "<h3>Knowledge quizzes</h3>";
    QUIZZES.forEach(q=>{
      const b = document.createElement("button"); b.className="btn ghost";
      b.textContent = q.title; b.onclick=()=>runQuiz(q);
      card.appendChild(b);
    });
    container.appendChild(card);
  }
  function runQuiz(quiz){
    const host = document.getElementById("quizRun");
    host.classList.remove("hidden"); host.innerHTML="";
    let i=0, score=0;
    const card = document.createElement("div"); card.className="card";
    host.appendChild(card);
    function render(){
      if(i>=quiz.questions.length){
        const pct = Math.round(score/quiz.questions.length*100);
        card.innerHTML = `<h3>Done — ${score}/${quiz.questions.length} (${pct}%)</h3>`;
        Gami.addXP(10 + score*5, `Quiz: ${quiz.title}`);
        Store.set("quiz:"+quiz.id, { score, total: quiz.questions.length, t:Date.now(), topic: quiz.topic });
        return;
      }
      const Q = quiz.questions[i];
      card.innerHTML = `<h3>${quiz.title} · ${i+1}/${quiz.questions.length}</h3><p>${Q.q}</p>`;
      Q.opts.forEach((o,idx)=>{
        const b=document.createElement("button"); b.className="btn ghost"; b.textContent=o;
        b.style.display="block"; b.style.width="100%";
        b.onclick=()=>{
          if(idx===Q.a){ score++; Toast("Correct","ok"); } else { Toast("Wrong — "+Q.opts[Q.a],"bad"); }
          i++; render();
        };
        card.appendChild(b);
      });
    }
    render();
  }

  function challengeList(container){
    container.innerHTML = "";
    SCENARIOS.forEach(sc=>{
      const c=document.createElement("div"); c.className="card";
      c.innerHTML=`<h3>${sc.title}</h3><p class="dim">${sc.brief}</p>`;
      const b=document.createElement("button"); b.className="btn"; b.textContent="Start scenario";
      b.onclick=()=>runChallenge(sc);
      c.appendChild(b);
      container.appendChild(c);
    });
  }

  function runChallenge(sc){
    const host=document.getElementById("challengeRun");
    host.classList.remove("hidden"); host.innerHTML="";
    const card=document.createElement("div"); card.className="card";
    card.innerHTML = `<h3>${sc.title}</h3><p class="dim">${sc.brief}</p>
      <canvas id="scChart" width="900" height="320"></canvas>
      <div id="scChoices" style="margin-top:10px"></div>
      <div id="scFB" style="margin-top:10px"></div>`;
    host.appendChild(card);
    const candles = sc.gen();
    Chart.draw(document.getElementById("scChart"), candles, {});
    const holder = document.getElementById("scChoices");
    sc.choices.forEach(ch=>{
      const b = document.createElement("button"); b.className="btn ghost";
      b.style.cssText="display:block;width:100%;text-align:left";
      b.textContent = ch.label;
      b.onclick=()=>{
        const fb = document.getElementById("scFB");
        if(ch.correct){ fb.innerHTML=`<span class="ok">✅ ${ch.fb}</span>`; Gami.addXP(30, `Scenario: ${sc.title}`); }
        else { fb.innerHTML=`<span class="bad">❌ ${ch.fb}</span>`; Gami.addXP(5, "Scenario attempted"); }
      };
      holder.appendChild(b);
    });
  }

  /* Which topic is user weakest in? (used by adaptive engine) */
  function topicScores(){
    const out = {};
    QUIZZES.forEach(q=>{
      const r = Store.get("quiz:"+q.id);
      if(!r) return;
      out[q.topic] = out[q.topic] || { s:0, t:0 };
      out[q.topic].s += r.score;
      out[q.topic].t += r.total;
    });
    return out;
  }

  window.Quiz = { QUIZZES, SCENARIOS, listView, runQuiz, challengeList, runChallenge, topicScores };
})();
