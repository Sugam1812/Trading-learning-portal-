/* XP, levels, badges */
(function(){
  const LEVELS = [0,100,250,500,900,1500,2400,3600,5200,7500,10500];
  const BADGES = [
    { id:"first_trade", ic:"🎯", name:"First Trade",      desc:"Close your first simulated trade." },
    { id:"first_win",   ic:"✅", name:"First Win",        desc:"Close a trade in profit." },
    { id:"rr2",         ic:"⚖️", name:"R:R ≥ 2",          desc:"Hit a trade with realised R:R ≥ 2." },
    { id:"disciplined", ic:"🛡️", name:"Disciplined",      desc:"Follow prop rules for 5 days." },
    { id:"journaller",  ic:"📔", name:"Journaller",       desc:"Write 10 journal entries." },
    { id:"student",     ic:"🎓", name:"Student",          desc:"Complete 5 lessons." },
    { id:"strategist",  ic:"🧠", name:"Strategist",       desc:"Backtest 3 strategies." },
    { id:"routine5",    ic:"🔁", name:"Routine x5",       desc:"Complete full routine 5 days." },
    { id:"no_revenge",  ic:"🧘", name:"Ice Cold",         desc:"Go 10 trades with no revenge flag." },
    { id:"prop_ready",  ic:"🏆", name:"Prop Ready",       desc:"Hit +8% with no rule breach." }
  ];

  function user(){ return Store.get("user"); }
  function save(u){ Store.set("user", u); }

  function addXP(n, reason){
    const u = user();
    u.xp += n;
    while(u.level < LEVELS.length && u.xp >= LEVELS[u.level]) u.level++;
    save(u);
    if(window.Toast) Toast(`+${n} XP — ${reason}`, "ok");
    updateBadges();
  }

  function grant(id){
    const u = user();
    if(u.badges.includes(id)) return;
    u.badges.push(id); save(u);
    const b = BADGES.find(x=>x.id===id);
    if(b && window.Toast) Toast(`🏅 ${b.name} unlocked`, "ok");
  }

  function updateBadges(){
    const trades = Store.get("trades")||[];
    const closed = trades.filter(t=>t.status==="closed");
    const wins   = closed.filter(t=>t.pnl>0);
    if(closed.length >= 1) grant("first_trade");
    if(wins.length >= 1)   grant("first_win");
    if(closed.some(t=>t.rr && t.rr>=2)) grant("rr2");
    if((Store.get("journal")||[]).length>=10) grant("journaller");
    const lessons = Store.get("lessons")||{};
    if(Object.values(lessons).filter(l=>l.completed).length>=5) grant("student");
    if((Store.get("strategies")||[]).length>=3) grant("strategist");
  }

  function progressPct(){
    const u = user();
    const cur = LEVELS[u.level-1]||0;
    const next = LEVELS[u.level]||LEVELS[LEVELS.length-1];
    return Math.min(100, Math.round(((u.xp-cur)/(next-cur||1))*100));
  }

  window.Gami = { addXP, grant, BADGES, LEVELS, user, progressPct, updateBadges };
})();
