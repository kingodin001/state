/* Terra Storm simulation. Independent of rendering, storage and Android. */
(function(root){
'use strict';
class Random { constructor(seed=1){this.state=seed>>>0;} next(){this.state=(Math.imul(this.state,1664525)+1013904223)>>>0;return this.state/4294967296;} }
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
class Battle {
 constructor(level,options={}){
  this.level=level;this.rng=new Random(options.seed||level.seed*7919);this.time=0;this.result=null;this.paused=false;
  this.regions=level.regions.map(r=>({...r,x:r.center[0],y:r.center[1],units:r.units+(r.owner===1?(options.start||0):0),pulse:0,shield:0,shot:0}));
  this.units=[];this.waves=[];this.events=[];this.cooldowns={reinforce:0,shield:0};this.skillCharges={reinforce:1,shield:1};
  this.production=1+(options.production||0)*.18;this.factions=[...new Set(this.regions.map(r=>r.owner))].filter(x=>x>1);
  this.aiTimers={};for(const f of this.factions)this.aiTimers[f]=level.aiInterval+this.rng.next()*1.2;
  this.stats={sent:0,captured:0,lost:0,kills:0,commands:0};this.id=0;this.tutorial=level.seed===1&&!options.skipTutorial;
  this.firstCommand=false;this.lastCollisionCheck=0;
 }
 emit(type,data={}){this.events.push({type,...data});}
 drainEvents(){return this.events.splice(0);}
 command(sources,target,fraction=1,owner=1){
  if(this.result||this.paused||!this.regions[target])return 0;
  let sent=0;const dest=this.regions[target];
  for(const id of [...new Set(sources)]){
   const s=this.regions[id];if(!s||s.id===target||s.owner!==owner)continue;
   const count=Math.floor(s.units*Math.min(1,Math.max(.05,fraction)));if(count<1)continue;
   s.units-=count;s.pulse=.3;
   this.waves.push({from:s.id,to:target,owner,count,left:count,clock:0,sequence:0});sent+=count;
  }
  if(sent&&owner===1){this.stats.sent+=sent;this.stats.commands++;this.firstCommand=true;this.emit('command',{count:sent,target});}
  return sent;
 }
 cast(type,target){
  const r=this.regions[target];if(this.result||this.paused||!r||r.owner!==1||this.cooldowns[type]>0||!this.skillCharges[type])return false;
  if(type==='reinforce'){r.units+=25;this.cooldowns[type]=30;this.emit('reinforce',{id:target});}
  else if(type==='shield'){r.shield=14;this.cooldowns[type]=35;this.emit('shield',{id:target});}
  else return false;
  this.skillCharges[type]--;return true;
 }
 ai(owner){
  const own=this.regions.filter(r=>r.owner===owner);if(!own.length)return;
  const enemies=this.regions.filter(r=>r.owner!==owner);if(!enemies.length)return;
  let best=null,bestScore=-Infinity;
  for(const s of own){
   if(s.units<5)continue;
   for(const t of enemies){
    const d=distance(s,t);const incoming=this.units.filter(u=>u.owner===owner&&u.to===t.id).length+this.waves.filter(w=>w.owner===owner&&w.to===t.id).reduce((sum,w)=>sum+w.left,0);
    const needed=t.units+(t.owner?d/220*.8:0)+2-incoming;
    if(needed<0)continue;
    const score=(s.units-needed)*.6-d*.025+(t.owner===0?8:0)+(t.kind==='factory'?7:0)+this.rng.next()*4;
    if(score>bestScore){bestScore=score;best={s,t,needed};}
   }
  }
  if(best&&(best.s.units>best.needed*1.13||best.s.units>=this.level.cap*.9)){
   this.command([best.s.id],best.t.id,best.s.units>25?.85:1,owner);return;
  }
  // Interior garrisons reinforce the closest threatened front.
  if(own.length>1){
   const fronts=own.map(r=>({r,d:Math.min(...enemies.map(t=>distance(r,t)))})).sort((a,b)=>a.d-b.d);
   const rear=own.filter(r=>r.id!==fronts[0].r.id&&r.units>15).sort((a,b)=>b.units-a.units)[0];
   if(rear)this.command([rear.id],fronts[0].r.id,.7,owner);
  }
 }
 arrive(u){
  const r=this.regions[u.to];if(r.owner===u.owner){r.units=Math.min(999,r.units+1);return;}
  if(r.shield>0){this.emit('blocked',{x:r.x,y:r.y,owner:r.owner});return;}
  const damage=r.kind==='fort'?.7:1;r.units-=damage;
  if(r.units<0){
   const oldOwner=r.owner;r.owner=u.owner;r.units=Math.abs(r.units);r.pulse=1;r.shield=0;
   if(u.owner===1)this.stats.captured++;if(oldOwner===1)this.stats.lost++;
   this.emit('capture',{id:r.id,owner:r.owner,oldOwner,x:r.x,y:r.y});
  }
 }
 step(dt){
  if(this.result||this.paused)return;
  // Fixed substeps keep collisions and production independent of rendering rate.
  let left=Math.min(Math.max(dt,0),.5);while(left>1e-7){const d=Math.min(left,1/40);this.tick(d);left-=d;if(this.result)break;}
 }
 tick(dt){
  this.time+=dt;
  for(const key in this.cooldowns)this.cooldowns[key]=Math.max(0,this.cooldowns[key]-dt);
  for(const r of this.regions){
   r.pulse=Math.max(0,r.pulse-dt*2);r.shield=Math.max(0,r.shield-dt);
   if(r.owner&&r.units<this.level.cap){
    let rate=r.owner===1?this.production:this.level.enemyRate;
    if(this.tutorial&&(!this.firstCommand||this.time<13)&&r.owner!==1)rate=0;
    r.units=Math.min(this.level.cap,r.units+dt*rate*(r.kind==='factory'?1.6:1));
   }
   if(r.kind==='turret'&&r.owner){
    r.shot-=dt;if(r.shot<=0){
     const target=this.units.find(u=>u.owner!==r.owner&&!u.dead&&distance(u,r)<135);
     if(target){target.dead=true;r.shot=.65;this.emit('shot',{x:r.x,y:r.y,tx:target.x,ty:target.y,owner:r.owner});}
    }
   }
  }
  for(const wave of this.waves){
   wave.clock+=dt;while(wave.left>0&&wave.clock>=.038){
    wave.clock-=.038;const a=this.regions[wave.from],b=this.regions[wave.to];const d=Math.max(1,distance(a,b));const nx=-(b.y-a.y)/d,ny=(b.x-a.x)/d;
    const offset=((wave.sequence%5)-2)*6+(this.rng.next()-.5)*3;wave.sequence++;
    this.units.push({id:this.id++,from:a.id,to:b.id,owner:wave.owner,x:a.x+nx*offset,y:a.y+ny*offset,tx:b.x,ty:b.y,speed:205+this.rng.next()*25,dead:false});wave.left--;
   }
  }
  this.waves=this.waves.filter(w=>w.left>0);
  for(const u of this.units){
   if(u.dead)continue;
   const dx=u.tx-u.x,dy=u.ty-u.y,d=Math.hypot(dx,dy),travel=u.speed*dt;
   if(d<=travel+5){u.dead=true;this.arrive(u);}else{u.x+=dx/d*travel;u.y+=dy/d*travel;}
  }
  // Spatial hash: opposing dots annihilate on contact, including crossing attacks.
  const grid=new Map(),size=12;
  for(const u of this.units){
   if(u.dead)continue;const gx=Math.floor(u.x/size),gy=Math.floor(u.y/size);let hit=null;
   for(let xx=gx-1;xx<=gx+1&&!hit;xx++)for(let yy=gy-1;yy<=gy+1&&!hit;yy++){
    const bucket=grid.get(xx+','+yy);if(bucket)hit=bucket.find(v=>!v.dead&&v.owner!==u.owner&&Math.abs(u.x-v.x)<9&&Math.abs(u.y-v.y)<9&&distance(u,v)<9);
   }
   if(hit){hit.dead=true;u.dead=true;if(u.owner===1||hit.owner===1)this.stats.kills++;this.emit('clash',{x:u.x,y:u.y});}
   else{const key=gx+','+gy;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(u);}
  }
  this.units=this.units.filter(u=>!u.dead);
  if(!this.tutorial||this.firstCommand&&this.time>13){
   for(const owner of this.factions){this.aiTimers[owner]-=dt;if(this.aiTimers[owner]<=0){this.aiTimers[owner]=this.level.aiInterval*(.85+this.rng.next()*.3);this.ai(owner);}}
  }
  const owners=new Set(this.regions.map(r=>r.owner).filter(Boolean));
  for(const u of this.units)owners.add(u.owner);for(const w of this.waves)owners.add(w.owner);
  if(!owners.has(1)){this.result='lose';this.emit('finish',{result:'lose'});}
  else if(owners.size===1&&this.regions.every(r=>r.owner===1)){this.result='win';this.emit('finish',{result:'win'});}
 }
 totals(){const a=[0,0,0,0,0];for(const r of this.regions)a[r.owner]+=Math.floor(r.units);for(const u of this.units)a[u.owner]++;for(const w of this.waves)a[w.owner]+=w.left;return a;}
 territoryShare(){const a=[0,0,0,0,0];for(const r of this.regions)a[r.owner]++;return a;}
}
root.TerraBattle=Battle;root.TerraRandom=Random;if(typeof module!=='undefined')module.exports={Battle,Random,distance};
})(typeof globalThis!=='undefined'?globalThis:this);
