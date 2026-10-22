/* Terra Storm simulation. Independent of rendering, storage and Android. */
(function(root){
'use strict';
const field=root.TerraField||(typeof require!=='undefined'?require('./field.js'):null),timing=field.TIMING;
class Random { constructor(seed=1){this.state=seed>>>0;} next(){this.state=(Math.imul(this.state,1664525)+1013904223)>>>0;return this.state/4294967296;} }
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
class Battle {
 constructor(level,options={}){
  this.level=level;this.playerLimit=options.limit||level.cap;this.playerSpeed=options.speed||1;this.leaderType=options.leader||0;this.leaderCharges=2;this.leaderCooldown=0;this.productionBoost=0;this.rng=new Random(options.seed||level.seed*7919);this.time=0;this.result=null;this.paused=false;
  this.regions=level.regions.map(r=>({...r,x:r.center[0],y:r.center[1],units:r.units+(r.owner===1?(options.start||0):0),pulse:0,shield:0,shot:0,frozen:0,poison:0}));this.speedBoost=0;
  this.units=[];this.waves=[];this.events=[];this.cooldowns={reinforce:0,shield:0};this.skillCharges={reinforce:1,shield:1};
  this.production=1+(options.production||0)*.18;this.factions=[...new Set(this.regions.map(r=>r.owner))].filter(x=>x>1);
  this.aiTimers={};for(const f of this.factions)this.aiTimers[f]=level.aiInterval+this.rng.next()*1.2;
  this.stats={sent:0,captured:0,lost:0,kills:0,commands:0};this.id=0;this.tutorial=level.seed===1&&!options.skipTutorial;
  this.firstCommand=false;this.lastCollisionCheck=0;this.departureClocks={};
 }
 emit(type,data={}){this.events.push({type,...data});}
 drainEvents(){return this.events.splice(0);}
 reserved(id){return this.waves.filter(w=>w.from===id&&w.owner===this.regions[id].owner).reduce((n,w)=>n+w.left,0);}
 available(id){return Math.max(0,Math.floor(this.regions[id].units)-this.reserved(id));}
 visible(owner,id){
  if(!this.level.fog||this.regions[id].owner===owner)return true;const r=this.regions[id],range=this.level.vision||330;
  return this.regions.some(s=>s.owner===owner&&distance(s,r)<=range)||this.units.some(u=>u.owner===owner&&distance(u,r)<=range*.6);
 }
 command(sources,target,fraction=1,owner=1){
  if(this.result||this.paused||!this.regions[target])return 0;
  let sent=0;const dest=this.regions[target];
  for(const id of [...new Set(sources)]){
   const s=this.regions[id];if(!s||s.id===target||s.owner!==owner)continue;
   const count=Math.floor(this.available(id)*Math.min(1,Math.max(.05,fraction)));if(count<1)continue;
   s.pulse=.3;
   this.waves.push({from:s.id,to:target,owner,count,left:count,sequence:0});sent+=count;
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
 activateLeader(target){
  const r=this.regions[target];if(this.result||this.paused||!r||this.leaderCharges<=0||this.leaderCooldown>0)return false;
  if(this.leaderType===1||this.leaderType===4){if(r.owner===0||r.owner===1)return false;if(this.leaderType===1){r.frozen=8;this.emit('freeze',{id:target});}else{r.poison=10;this.emit('poison',{id:target});}}
  else{if(r.owner!==1)return false;
   if(this.leaderType===0){r.units+=22;this.emit('reinforce',{id:target});}
   else if(this.leaderType===2){r.shield=12;this.emit('shield',{id:target});}
   else if(this.leaderType===3){this.productionBoost=10;this.emit('boost',{id:target});}
   else if(this.leaderType===5){this.speedBoost=10;this.emit('boost',{id:target});}
   else if(this.leaderType===6){const allies=this.regions.filter(s=>s.owner===1).sort((a,b)=>distance(a,r)-distance(b,r)).slice(0,3);for(const s of allies){s.shield=12;this.emit('shield',{id:s.id});}}
   else if(this.leaderType===7){for(const u of this.units)if(u.owner!==1&&distance(u,r)<180){u.dead=true;this.stats.kills++;this.emit('clash',{x:u.x,y:u.y});}this.units=this.units.filter(u=>!u.dead);this.emit('blast',{x:r.x,y:r.y});}
  }
  this.leaderCharges--;this.leaderCooldown=24;return true;
 }
 ai(owner){
  const own=this.regions.filter(r=>r.owner===owner);if(!own.length)return;
  const enemies=this.regions.filter(r=>r.owner!==owner);if(!enemies.length)return;
  let best=null,bestScore=-Infinity;
  for(const s of own){
   const available=this.available(s.id);if(available<5)continue;
   for(const t of enemies){
    const d=distance(s,t);const incoming=this.units.filter(u=>u.owner===owner&&u.to===t.id).length+this.waves.filter(w=>w.owner===owner&&w.to===t.id).reduce((sum,w)=>sum+w.left,0);
    const defense=this.visible(owner,t.id)?t.units:t.owner?15:8;
    const needed=defense+(t.owner?d/timing.marchSpeed*.8:0)+2-incoming;
    if(needed<0)continue;
    const score=(available-needed)*.6-d*.025+(t.owner===0?8:0)+(t.kind==='factory'?7:0)+this.rng.next()*4;
    if(score>bestScore){bestScore=score;best={s,t,needed};}
   }
  }
  if(best&&(this.available(best.s.id)>best.needed*1.13||this.available(best.s.id)>=this.level.cap*.9)){
   this.command([best.s.id],best.t.id,this.available(best.s.id)>25?.85:1,owner);return;
  }
  // Interior garrisons reinforce the closest threatened front.
  if(own.length>1){
   const fronts=own.map(r=>({r,d:Math.min(...enemies.map(t=>distance(r,t)))})).sort((a,b)=>a.d-b.d);
   const rear=own.filter(r=>r.id!==fronts[0].r.id&&this.available(r.id)>15).sort((a,b)=>this.available(b.id)-this.available(a.id))[0];
   if(rear)this.command([rear.id],fronts[0].r.id,.7,owner);
  }
 }
 arrive(u){
  const r=this.regions[u.to];if(r.owner===u.owner){r.units=Math.min(999,r.units+1);return;}
  if(r.shield>0){this.emit('blocked',{x:r.x,y:r.y,owner:r.owner});return;}
  const damage=r.kind==='fort'?.7:1;r.units-=damage;
  if(r.units<0){
   const oldOwner=r.owner;r.owner=u.owner;r.units=Math.abs(r.units);r.pulse=1;r.shield=0;r.poison=0;r.frozen=0;
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
  this.time+=dt;this.leaderCooldown=Math.max(0,this.leaderCooldown-dt);this.productionBoost=Math.max(0,this.productionBoost-dt);this.speedBoost=Math.max(0,this.speedBoost-dt);
  for(const key in this.cooldowns)this.cooldowns[key]=Math.max(0,this.cooldowns[key]-dt);
  for(const r of this.regions){
   r.pulse=Math.max(0,r.pulse-dt*2);r.shield=Math.max(0,r.shield-dt);r.frozen=Math.max(0,r.frozen-dt);if(r.poison>0){r.poison=Math.max(0,r.poison-dt);r.units=Math.max(0,r.units-dt*1.5);}
   const cap=r.owner===1?this.playerLimit:this.level.cap;
   if(r.owner&&r.units<cap&&r.frozen<=0){
    let rate=r.owner===1?this.production*(this.productionBoost>0?1.8:1):this.level.enemyRate;
    if(this.tutorial&&(!this.firstCommand||this.time<13)&&r.owner!==1)rate=0;
    r.units=Math.min(cap,r.units+dt*rate*(r.kind==='factory'?1.6:r.kind==='turret'?0:1));
   }
   if(r.kind==='turret'&&r.owner){
    r.shot-=dt;if(r.shot<=0){
     const target=this.units.find(u=>u.owner!==r.owner&&!u.dead&&distance(u,r)<135);
     if(target){target.dead=true;r.shot=.65;this.emit('shot',{x:r.x,y:r.y,tx:target.x,ty:target.y,owner:r.owner});}
    }
   }
  }
  // Reserved troops stay in the garrison, defend it, and leave one at a time.
  // A single departure clock per base prevents repeated orders multiplying its throughput.
  this.waves=this.waves.filter(w=>w.left>0&&this.regions[w.from].owner===w.owner);
  for(const a of this.regions){
   let wave=this.waves.find(w=>w.from===a.id&&w.left>0);
   if(!wave){this.departureClocks[a.id]=0;continue;}
   this.departureClocks[a.id]=(this.departureClocks[a.id]||0)+dt;
   while(wave&&this.departureClocks[a.id]>=timing.departureInterval){
    this.departureClocks[a.id]-=timing.departureInterval;
    if(a.units<1){for(const w of this.waves)if(w.from===a.id)w.left=0;break;}
    const b=this.regions[wave.to],d=Math.max(1,distance(a,b)),nx=-(b.y-a.y)/d,ny=(b.x-a.x)/d;
    const offset=Math.sin(wave.sequence*2.399963)*18,pos=field.slot(a,Math.max(0,Math.floor(a.units)-1));wave.sequence++;a.units-=1;
    this.units.push({id:this.id++,from:a.id,to:b.id,owner:wave.owner,x:pos.x,y:pos.y,tx:b.x+nx*offset*.35,ty:b.y+ny*offset*.35,speed:timing.marchSpeed*(1+(this.rng.next()-.5)*timing.marchVariation)*(wave.owner===1?this.playerSpeed:1),dead:false});wave.left--;
    wave=this.waves.find(w=>w.from===a.id&&w.left>0);
   }
  }
  this.waves=this.waves.filter(w=>w.left>0);
  for(const u of this.units){
   if(u.dead)continue;
   const dx=u.tx-u.x,dy=u.ty-u.y,d=Math.hypot(dx,dy);let factor=1;
   for(const zone of this.level.zones||[])if(Math.hypot(u.x-zone.x,u.y-zone.y)<=zone.radius)factor=Math.min(factor,zone.factor);
   const travel=u.speed*dt*factor*(u.owner===1&&this.speedBoost>0?1.4:1);
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
  if(!this.result&&this.level.timeLimit&&this.time>=this.level.timeLimit){const share=this.territoryShare(),totals=this.totals(),score=f=>share[f]*10000+totals[f];this.result=[2,3,4].every(f=>score(1)>score(f))?'win':'lose';this.emit('finish',{result:this.result});}
 }
  totals(){const a=[0,0,0,0,0];for(const r of this.regions)a[r.owner]+=Math.floor(r.units);for(const u of this.units)a[u.owner]++;return a;}
 territoryShare(){const a=[0,0,0,0,0];for(const r of this.regions)a[r.owner]++;return a;}
}
root.TerraBattle=Battle;root.TerraRandom=Random;if(typeof module!=='undefined')module.exports={Battle,Random,distance};
})(typeof globalThis!=='undefined'?globalThis:this);
