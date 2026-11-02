// Canvas seascape renderer, used when a listing has no uploaded photos.
  function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function hex(s){var n=parseInt(s.slice(1),16);return((n>>16)&255)+','+((n>>8)&255)+','+(n&255)}
  var P={
    twilight:{sky:[[0,'#0d1620'],[.55,'#364555'],[.88,'#b3a597'],[1,'#e5d6c0']],hz:.66,sun:{x:.72,r:.15,c:'240,214,178'},sea:['#47525d','#090e14'],lit:1},
    mist:{sky:[[0,'#bcc7cc'],[1,'#eeece6']],hz:.62,sun:{x:.28,r:.1,c:'255,252,244'},sea:['#a9b7bc','#6d7f87'],lit:0},
    dawn:{sky:[[0,'#66748a'],[.6,'#c6b8b5'],[1,'#f2e3d0']],hz:.64,sun:{x:.3,r:.13,c:'255,236,208'},sea:['#a69fa5','#46505f'],lit:0},
    slate:{sky:[[0,'#222c36'],[1,'#7b8892']],hz:.62,sun:{x:.78,r:.09,c:'225,230,235'},sea:['#566570','#161e25'],lit:1},
    sand:{sky:[[0,'#a7b4b7'],[.7,'#e4d6bf'],[1,'#f6ebd6']],hz:.62,sun:{x:.6,r:.12,c:'255,244,214'},sea:['#c1b093','#5a6a6a'],lit:0},
    ink:{sky:[[0,'#04070b'],[1,'#16212c']],hz:.62,sun:{x:.82,r:.06,c:'214,226,244'},sea:['#0c1722','#03060a'],lit:1,stars:1},
    lagoon:{sky:[[0,'#82a3b0'],[1,'#ebe8d8']],hz:.62,sun:{x:.7,r:.1,c:'255,251,236'},sea:['#86b6b4','#2f6169'],lit:0,hills:[{h:.03,c:'#4e6e68',s:3}]},
    ceylon:{sky:[[0,'#5d7a80'],[.6,'#d6b88c'],[1,'#f5e2bd']],hz:.62,sun:{x:.4,r:.12,c:'255,236,196'},sea:['#a98f64','#2d4040'],lit:0,hills:[{h:.1,c:'#33493f',s:4},{h:.05,c:'#233a34',s:7}]},
    isles:{sky:[[0,'#6e8aa4'],[1,'#eee8dc']],hz:.6,sun:{x:.25,r:.1,c:'255,251,238'},sea:['#5f8ba9','#183a56'],lit:0,hills:[{h:.12,c:'#9aaab6',s:5},{h:.07,c:'#62798a',s:9}]},
    riviera:{sky:[[0,'#2b3650'],[.6,'#9a8396'],[1,'#f0bd96']],hz:.62,sun:{x:.68,r:.13,c:'255,208,160'},sea:['#554a62','#0b0e18'],lit:1,hills:[{h:.15,c:'#3a3249',s:2}]}
  };
  function yacht(c,x,y,L,lit){
    var H=L*.075,yd=-H*1.12,i;
    c.save();c.translate(x,y);
    var hg=c.createLinearGradient(0,-H*1.6,0,0);hg.addColorStop(0,'#1d2833');hg.addColorStop(1,'#080d12');
    c.fillStyle=hg;c.beginPath();c.moveTo(0,-H*1.06);c.lineTo(L*.9,-H*1.22);c.quadraticCurveTo(L*.985,-H*1.3,L,-H*1.62);c.lineTo(L*.945,0);c.lineTo(L*.035,0);c.closePath();c.fill();
    c.strokeStyle='rgba(238,233,220,.85)';c.lineWidth=Math.max(1,L*.003);c.beginPath();c.moveTo(L*.012,-H*.62);c.lineTo(L*.965,-H*.78);c.stroke();
    function deck(p){var g=c.createLinearGradient(0,p[0][1],0,p[3][1]);g.addColorStop(0,'#cdc7ba');g.addColorStop(1,'#f5f2eb');
      c.fillStyle=g;c.beginPath();c.moveTo(p[0][0]*L,p[0][1]);for(var k=1;k<p.length;k++)c.lineTo(p[k][0]*L,p[k][1]);c.closePath();c.fill();}
    deck([[.075,yd],[.80,yd-H*.04],[.725,yd-H],[.095,yd-H]]);
    deck([[.12,yd-H],[.70,yd-H],[.625,yd-H*1.95],[.15,yd-H*1.95]]);
    deck([[.2,yd-H*1.95],[.56,yd-H*1.95],[.50,yd-H*2.7],[.235,yd-H*2.7]]);
    c.fillStyle='rgba(14,20,26,.5)';c.fillRect(L*.075,yd-H*1.0,L*.65,H*.05);c.fillRect(L*.12,yd-H*1.95,L*.5,H*.05);
    function win(x1,x2,y1,y2,n){
      c.fillStyle='#0b1218';c.fillRect(x1*L,y1,(x2-x1)*L,y2-y1);var w=((x2-x1)*L)/n;
      for(var k=0;k<n;k++){
        if(lit){c.save();c.shadowColor='rgba(255,200,125,.85)';c.shadowBlur=L*.02;c.fillStyle='#ffd9a2';c.fillRect(x1*L+k*w+w*.12,y1+(y2-y1)*.18,w*.76,(y2-y1)*.64);c.restore()}
        else{c.fillStyle='#2a3841';c.fillRect(x1*L+k*w+w*.12,y1+(y2-y1)*.18,w*.76,(y2-y1)*.64)}
      }
    }
    win(.14,.68,yd-H*.8,yd-H*.3,14);win(.18,.58,yd-H*1.78,yd-H*1.28,10);win(.265,.455,yd-H*2.5,yd-H*2.1,5);
    c.strokeStyle='#dcd7cb';c.lineWidth=Math.max(1,L*.003);
    c.beginPath();c.moveTo(L*.385,yd-H*2.7);c.lineTo(L*.385,yd-H*4.2);c.stroke();
    c.beginPath();c.moveTo(L*.36,yd-H*3.7);c.lineTo(L*.41,yd-H*3.7);c.stroke();
    c.restore();
  }
  function hills(c,w,h,hz,list,seed){
    list.forEach(function(o,idx){
      var r=rng(seed+idx*7),ph=[r()*6,r()*6,r()*6],base=h*hz;
      c.fillStyle=o.c;c.beginPath();c.moveTo(0,base);
      for(var x=0;x<=w;x+=3){var u=x/w*o.s,n=.5+.28*Math.sin(u*3+ph[0])+.16*Math.sin(u*7.3+ph[1])+.06*Math.sin(u*17+ph[2]);c.lineTo(x,base-h*o.h*n)}
      c.lineTo(w,base);c.closePath();c.fill();
    });
  }
  function scene(cv,key,opt,t){
    opt=opt||{};t=t||0;
    var p=P[key],w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
    var d=Math.min(window.devicePixelRatio||1,2);
    if(cv.width!==Math.round(w*d)||cv.height!==Math.round(h*d)){cv.width=Math.round(w*d);cv.height=Math.round(h*d)}
    var c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);
    var hz=p.hz*h,g=c.createLinearGradient(0,0,0,hz);
    p.sky.forEach(function(s){g.addColorStop(s[0],s[1])});c.fillStyle=g;c.fillRect(0,0,w,hz+1);
    if(p.stars){var r=rng(11);for(var i=0;i<120;i++){var sx=r()*w,sy=r()*hz*.8,a=(.25+r()*.55)*(1-sy/hz)*(.8+.2*Math.sin(t*1.4+i));c.fillStyle='rgba(255,255,255,'+a.toFixed(3)+')';c.fillRect(sx,sy,1.2,1.2)}}
    var sx0=p.sun.x*w,sy0=hz-h*.02,sr=p.sun.r*Math.min(w,h*1.5),rg=c.createRadialGradient(sx0,sy0,0,sx0,sy0,sr*3);
    rg.addColorStop(0,'rgba('+p.sun.c+',.9)');rg.addColorStop(.14,'rgba('+p.sun.c+',.45)');rg.addColorStop(1,'rgba('+p.sun.c+',0)');
    c.fillStyle=rg;c.fillRect(0,0,w,hz);
    if(p.hills)hills(c,w,h,p.hz,p.hills,opt.seed||3);
    var sg=c.createLinearGradient(0,hz,0,h);sg.addColorStop(0,p.sea[0]);sg.addColorStop(1,p.sea[1]);c.fillStyle=sg;c.fillRect(0,hz,w,h-hz);
    for(var y=hz+1;y<h;y+=3){var k=(y-hz)/(h-hz),ww=sr*(.5+k*2.2)*(.55+.45*Math.sin(t*1.2+y*.6));c.fillStyle='rgba('+p.sun.c+','+(.36*(1-k*.7)).toFixed(3)+')';c.fillRect(sx0-ww/2,y,ww,1.3)}
    if(opt.yacht){
      var L=w*opt.yacht.L,x=w*opt.yacht.x,wl=hz+h*(opt.yacht.dy||.07);
      c.save();c.beginPath();c.rect(0,wl,w,h-wl);c.clip();c.globalAlpha=.28;c.translate(0,2*wl);c.scale(1,-1);yacht(c,x,wl,L,p.lit);c.restore();
      for(var y2=wl;y2<h;y2+=3){var kk=(y2-wl)/(h-wl);c.fillStyle='rgba('+hex(p.sea[1])+','+(.55+.3*Math.sin(t*1.5+y2*.9)).toFixed(3)+')';c.fillRect(0,y2+1,w,1+kk*1.6)}
      yacht(c,x,wl,L,p.lit);
    }
  }


export { scene, P };
