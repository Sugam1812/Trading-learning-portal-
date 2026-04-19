/* Adaptive engine — picks the next best lesson / challenge / quiz
   based on user's weakest signals. */
(function(){

  function weakest(){
    const weak = [];
    const k = Analytics.kpis();
    if(k.trades >= 5){
      if(k.winRate < 0.35) weak.push({ topic:"structure", reason:"Low win rate → work on setup quality + market structure." });
      if(k.avgRR < 1.3)    weak.push({ topic:"risk",      reason:"Low R:R → exits are too early or stops too wide." });
      if(k.maxDD > 0.1)    weak.push({ topic:"psych",     reason:"Large drawdown → discipline and sizing." });
    }
    // Quiz topic gaps
    const ts = Quiz.topicScores();
    Object.entries(ts).forEach(([topic, r])=>{
      if(r.t && r.s/r.t < 0.6) weak.push({ topic, reason:`Quiz weakness (${Math.round(r.s/r.t*100)}%) in ${topic}.` });
    });
    // Revenge / overtrading
    const flags = Analytics.behaviour().join(" ");
    if(/revenge/i.test(flags)) weak.push({ topic:"psych", reason:"Revenge-trading flagged." });
    if(/overtrading/i.test(flags)) weak.push({ topic:"prop", reason:"Overtrading flagged." });
    return weak;
  }

  function nextLesson(){
    const w = weakest();
    // Map topic → module id preference
    const map = { foundations:"m1", structure:"m2", risk:"m3", psych:"m4", prop:"m5" };
    const state = Curriculum.state();
    if(w.length){
      const pref = map[w[0].topic];
      const mod = Curriculum.MODULES.find(m=>m.id===pref);
      if(mod){
        const incomplete = mod.lessons.find(l => !state[l.id]?.completed);
        if(incomplete) return { lesson: incomplete, reason: w[0].reason };
      }
    }
    const fall = Curriculum.nextSuggested();
    return fall ? { lesson: fall, reason: "Continue the path." } : null;
  }

  function nextChallenge(){
    const w = weakest();
    if(w.some(x=>x.topic==="psych")) return Quiz.SCENARIOS.find(s=>s.id==="sc_revenge");
    if(w.some(x=>x.topic==="risk"))  return Quiz.SCENARIOS.find(s=>s.id==="sc_news");
    return Quiz.SCENARIOS[0];
  }

  window.Adaptive = { weakest, nextLesson, nextChallenge };
})();
