/* App router + boot */
(function(){

  /* Toast */
  window.Toast = function(msg, kind="ok"){
    const host = document.getElementById("toasts");
    const t = document.createElement("div"); t.className = "toast "+kind;
    t.textContent = msg; host.appendChild(t);
    setTimeout(()=>{ t.style.opacity="0"; setTimeout(()=>t.remove(),300); }, 3200);
  };

  /* Routing */
  const routes = {
    dashboard: ()=>{
      mount("tpl-dashboard");
      const k = Analytics.kpis();
      document.getElementById("dWin").textContent = (k.winRate*100).toFixed(1)+"%";
      document.getElementById("dRR").textContent  = k.avgRR.toFixed(2);
      document.getElementById("dDD").textContent  = (k.maxDD*100).toFixed(1)+"%";
      document.getElementById("dTrades").textContent = k.trades;
      const n = Adaptive.nextLesson();
      document.getElementById("dLesson").innerHTML = n
        ? `<b>${n.lesson.title}</b><br/><span class="dim">${n.reason}</span>`
        : "You've completed the curriculum.";
      const c = Adaptive.nextChallenge();
      document.getElementById("dChallenge").innerHTML = c
        ? `<b>${c.title}</b><br/><span class="dim">${c.brief}</span>`
        : "—";
      // Routine snapshot
      const dt = new Date().toISOString().slice(0,10);
      const r = (Store.get("routine")||{})[dt] || {};
      const total = Object.values(Routine.ITEMS).flat().length;
      const done = Object.values(r).filter(Boolean).length;
      document.getElementById("dRoutine").innerHTML = `${done}/${total} tasks complete today.`;
      document.querySelectorAll("[data-go]").forEach(b=>{
        b.onclick = ()=> go(b.getAttribute("data-go"));
      });
    },
    curriculum: ()=>{
      mount("tpl-curriculum");
      Curriculum.listView(document.getElementById("curriculumList"));
    },
    simulator: ()=>{
      mount("tpl-simulator");
      Simulator.bind();
    },
    challenges: ()=>{
      mount("tpl-challenges");
      Quiz.challengeList(document.getElementById("challengeList"));
    },
    quiz: ()=>{
      mount("tpl-quiz");
      Quiz.listView(document.getElementById("quizList"));
    },
    strategy: ()=>{
      mount("tpl-strategy");
      Strategy.bind();
    },
    journal: ()=>{
      mount("tpl-journal");
      Journal.bind();
    },
    routine: ()=>{
      mount("tpl-routine");
      Routine.render(document.getElementById("routineList"));
    },
    analytics: ()=>{
      mount("tpl-analytics");
      Analytics.render();
    },
    mentor: ()=>{
      mount("tpl-mentor");
      Mentor.bind();
    },
    achievements: ()=>{
      mount("tpl-achievements");
      document.getElementById("progBar").style.width = Gami.progressPct()+"%";
      const u = Gami.user();
      const host = document.getElementById("badges");
      host.innerHTML = Gami.BADGES.map(b=>{
        const got = u.badges.includes(b.id);
        return `<div class="badge-card ${got?"":"locked"}">
          <div class="ic">${b.ic}</div>
          <div><b>${b.name}</b></div>
          <div class="dim" style="font-size:11px">${b.desc}</div>
        </div>`;
      }).join("");
    },
    settings: ()=>{
      mount("tpl-settings");
      bindSettings();
    }
  };

  function mount(tplId){
    const tpl = document.getElementById(tplId);
    const view = document.getElementById("view");
    view.innerHTML = "";
    view.appendChild(tpl.content.cloneNode(true));
  }

  function go(route){
    (routes[route] || routes.dashboard)();
    document.querySelectorAll("#sidebar a").forEach(a=>{
      a.classList.toggle("active", a.getAttribute("data-route")===route);
    });
    location.hash = "#"+route;
    refreshStatus();
  }

  /* Settings page */
  function bindSettings(){
    document.getElementById("setKey").value = Store.get("apiKey") || "";
    document.getElementById("setKeySave").onclick = ()=>{
      const v = document.getElementById("setKey").value.trim();
      if(!v){ Toast("Paste a key first.","warn"); return; }
      Store.set("apiKey", v); Toast("Key saved.","ok");
    };
    document.getElementById("setKeyClear").onclick = ()=>{
      Store.del("apiKey"); document.getElementById("setKey").value=""; Toast("Key cleared.","warn");
    };
    const r = Store.get("rules");
    document.getElementById("setBal").value = r.balance;
    document.getElementById("setDL").value  = r.dailyLossPct;
    document.getElementById("setTD").value  = r.totalDDPct;
    document.getElementById("setMT").value  = r.maxTrades;
    document.getElementById("setCD").value  = r.cooldownLosses;
    document.getElementById("setRulesSave").onclick = ()=>{
      Store.set("rules", {
        balance: +document.getElementById("setBal").value,
        dailyLossPct: +document.getElementById("setDL").value,
        totalDDPct: +document.getElementById("setTD").value,
        maxTrades: +document.getElementById("setMT").value,
        cooldownLosses: +document.getElementById("setCD").value
      });
      Toast("Rules saved.","ok"); refreshStatus();
    };
    document.getElementById("setExport").onclick = ()=>{
      const blob = new Blob([JSON.stringify(Store.all(),null,2)], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href=url; a.download="trading_portal_backup.json"; a.click();
    };
    document.getElementById("setImport").onclick = ()=>document.getElementById("setImportFile").click();
    document.getElementById("setImportFile").onchange = async (e)=>{
      const f = e.target.files[0]; if(!f) return;
      const text = await f.text();
      try {
        const obj = JSON.parse(text);
        Object.entries(obj).forEach(([k,v]) => Store.set(k, v));
        Toast("Imported.","ok"); setTimeout(()=>location.reload(), 500);
      } catch(err){ Toast("Invalid file.","bad"); }
    };
    document.getElementById("setReset").onclick = ()=>{
      if(!confirm("Wipe ALL progress, trades, journal, strategies? This cannot be undone.")) return;
      Store.clearAll();
      location.reload();
    };
  }

  /* Top-bar status */
  function refreshStatus(){
    const u = Gami.user();
    document.getElementById("levelBadge").textContent = "Lv "+u.level;
    document.getElementById("xpBadge").textContent = u.xp+" XP";
    const eq = (Store.get("equity")||[]).slice(-1)[0];
    document.getElementById("balanceBadge").textContent = "$" + (eq?eq.v:Store.get("rules").balance).toLocaleString();
    const a = Store.get("apiLog");
    document.getElementById("apiBadge").textContent = `API ${a.count}/${APP_CONFIG.DAILY_API_BUDGET}`;
    if(a.count >= APP_CONFIG.DAILY_API_BUDGET*0.9) document.getElementById("apiBadge").className = "badge warn";
    Discipline.updateBadge();
  }

  function keyBanner(){
    const key = APP_CONFIG.TWELVE_DATA_API_KEY;
    if((!key || key==="PASTE_YOUR_KEY_HERE") && !Store.get("apiKey")){
      Toast("API key not set — running in offline sample mode. Settings → API Key.","warn");
    }
  }

  /* Nav wire-up */
  document.querySelectorAll("#sidebar a").forEach(a=>{
    a.onclick = (e)=>{ e.preventDefault(); go(a.getAttribute("data-route")); };
  });

  /* Boot */
  const first = (location.hash||"#dashboard").replace("#","");
  go(first);
  keyBanner();
  setInterval(refreshStatus, 3000);
})();
