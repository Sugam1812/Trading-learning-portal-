/* Canvas candlestick renderer — zero dependency */
(function(){
  function draw(canvas, candles, opts={}){
    if(!canvas || !candles || !candles.length) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || canvas.width;
    const cssH = canvas.clientHeight || canvas.height;
    if(canvas.width !== cssW*dpr){ canvas.width = cssW*dpr; canvas.height = cssH*dpr; }
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);

    const W = cssW, H = cssH;
    const padL = 6, padR = 60, padT = 8, padB = 24;
    const chartW = W - padL - padR, chartH = H - padT - padB;

    const lo = Math.min(...candles.map(c=>c.l));
    const hi = Math.max(...candles.map(c=>c.h));
    const range = hi - lo || 0.001;
    const y = p => padT + (1 - (p - lo)/range) * chartH;

    const cw = chartW / candles.length;
    const bodyW = Math.max(1, cw*0.7);

    // grid
    ctx.strokeStyle = "#1b2440"; ctx.lineWidth = 1;
    ctx.fillStyle = "#8895ad"; ctx.font = "10px ui-monospace,Menlo,monospace";
    for(let i=0;i<=4;i++){
      const gy = padT + (chartH/4)*i;
      ctx.beginPath(); ctx.moveTo(padL,gy); ctx.lineTo(padL+chartW,gy); ctx.stroke();
      const p = hi - (range/4)*i;
      ctx.fillText(p.toFixed(5), padL+chartW+4, gy+4);
    }

    candles.forEach((c, i)=>{
      const cx = padL + i*cw + cw/2;
      const up = c.c >= c.o;
      ctx.strokeStyle = up ? "#16c784" : "#ea3943";
      ctx.fillStyle   = up ? "#16c784" : "#ea3943";
      ctx.beginPath();
      ctx.moveTo(cx, y(c.h)); ctx.lineTo(cx, y(c.l)); ctx.stroke();
      const yO = y(c.o), yC = y(c.c);
      const top = Math.min(yO,yC), h = Math.max(1, Math.abs(yO-yC));
      ctx.fillRect(cx - bodyW/2, top, bodyW, h);
    });

    // overlays: position
    if(opts.position){
      const p = opts.position;
      const yEntry = y(p.entry);
      ctx.strokeStyle = "#4ea3ff"; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(padL, yEntry); ctx.lineTo(padL+chartW, yEntry); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#4ea3ff"; ctx.fillText("ENTRY "+p.entry.toFixed(5), padL+4, yEntry-2);
      if(p.sl){
        const ys = y(p.sl); ctx.strokeStyle="#ea3943"; ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.moveTo(padL,ys); ctx.lineTo(padL+chartW,ys); ctx.stroke();
        ctx.fillStyle="#ea3943"; ctx.fillText("SL "+p.sl.toFixed(5), padL+4, ys-2);
      }
      if(p.tp){
        const yt = y(p.tp); ctx.strokeStyle="#16c784"; ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.moveTo(padL,yt); ctx.lineTo(padL+chartW,yt); ctx.stroke();
        ctx.fillStyle="#16c784"; ctx.fillText("TP "+p.tp.toFixed(5), padL+4, yt-2);
      }
      ctx.setLineDash([]);
    }

    // overlays: trade markers
    if(opts.markers){
      opts.markers.forEach(m=>{
        const i = candles.findIndex(c=>c.t===m.t);
        if(i<0) return;
        const cx = padL + i*cw + cw/2;
        const yy = y(m.price);
        ctx.fillStyle = m.side==="buy"?"#16c784":"#ea3943";
        ctx.beginPath();
        if(m.side==="buy"){ ctx.moveTo(cx,yy+8); ctx.lineTo(cx-5,yy+16); ctx.lineTo(cx+5,yy+16); }
        else { ctx.moveTo(cx,yy-8); ctx.lineTo(cx-5,yy-16); ctx.lineTo(cx+5,yy-16); }
        ctx.closePath(); ctx.fill();
      });
    }

    // overlays: line (e.g. EMA, equity curve)
    if(opts.lines){
      opts.lines.forEach(ln=>{
        ctx.strokeStyle = ln.color || "#f3c13a"; ctx.lineWidth = 1.5; ctx.beginPath();
        ln.data.forEach((p,i)=>{
          if(p==null) return;
          const cx = padL + i*cw + cw/2;
          const yy = y(p);
          if(i===0) ctx.moveTo(cx,yy); else ctx.lineTo(cx,yy);
        });
        ctx.stroke();
      });
    }

    // last price label
    const last = candles[candles.length-1];
    if(last){
      ctx.fillStyle = last.c>=last.o?"#16c784":"#ea3943";
      ctx.fillRect(padL+chartW, y(last.c)-8, padR-4, 16);
      ctx.fillStyle = "#001426"; ctx.font="bold 10px ui-monospace";
      ctx.fillText(last.c.toFixed(5), padL+chartW+4, y(last.c)+3);
    }
  }

  function drawEquity(canvas, series){
    if(!canvas || !series || !series.length) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || canvas.width, cssH = canvas.clientHeight || canvas.height;
    if(canvas.width !== cssW*dpr){ canvas.width = cssW*dpr; canvas.height = cssH*dpr; }
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);
    const padL=50,padR=10,padT=10,padB=24;
    const W=cssW-padL-padR,H=cssH-padT-padB;
    const vs = series.map(p=>p.v);
    const lo = Math.min(...vs), hi=Math.max(...vs), rng=hi-lo||1;
    ctx.strokeStyle="#1b2440";
    for(let i=0;i<=4;i++){
      const gy=padT+(H/4)*i;
      ctx.beginPath();ctx.moveTo(padL,gy);ctx.lineTo(padL+W,gy);ctx.stroke();
      ctx.fillStyle="#8895ad";ctx.font="10px ui-monospace";
      ctx.fillText("$"+Math.round(hi-(rng/4)*i).toLocaleString(), 4, gy+4);
    }
    ctx.strokeStyle="#4ea3ff"; ctx.lineWidth=2; ctx.beginPath();
    series.forEach((p,i)=>{
      const x = padL + (i/(series.length-1||1))*W;
      const y = padT + (1-(p.v-lo)/rng)*H;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    });
    ctx.stroke();
  }

  window.Chart = { draw, drawEquity };
})();
