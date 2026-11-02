/* Burst forecasts keep unlaunched fighters at their source. A new order replaces
 * that source's remaining queue without redirecting fighters already in flight. */
(function(g){'use strict';
const F=Math.fround,clamp=x=>Math.max(0,Math.min(1,x));
// ARM64 BotBuildingsUtility.CalculateGroupToBuildingsAmount (0x383468c).
function arrivalAmount(amount,maxWave,factor,step,delay){const portion=Number.isFinite(step/delay)?Math.max(1,F(step/delay)):1,wave=Math.min(amount,Math.trunc(F(factor*Math.min(amount,maxWave))));return Math.min(amount,Math.trunc(F(portion*wave)));}
function initial(b,travel){const regions=b.regions.filter(r=>r.active).map(r=>({id:r.id,owner:r.owner,units:r.units,source:r})),groups=b.units.filter(u=>!u.dead).map(u=>({owner:u.owner,to:u.to,n:1,at:travel(b,u,{...b.regions[u.to],x:u.tx,y:u.ty},u.owner),from:{x:u.x,y:u.y},start:0})),queues=b.waves.filter(w=>b.regions[w.from]?.owner===w.owner).map(w=>({...w,n:w.left,next:Math.max(0,(b.departureDelays[w.from]||b.departureDelay(b.regions[w.from]))-(b.departureClocks[w.from]||0))}));return {regions,groups,queues};}
function point(group,t,b){const a=group.from,z=b.regions[group.to],f=clamp((t-group.start)/(group.at-group.start||1));return {x:a.x+(z.x-a.x)*f,y:a.y+(z.y-a.y)*f};}
function crossing(a,c,t,next,b){const p=point(a,t,b),q=point(c,t,b),p2=point(a,next,b),q2=point(c,next,b),x=p.x-q.x,y=p.y-q.y,dx=p2.x-q2.x-x,dy=p2.y-q2.y-y,f=clamp(-(x*dx+y*dy)/(dx*dx+dy*dy||1));return Math.hypot(x+dx*f,y+dy*f)<9;}
function forecast(b,state,command,owner,cfg,travel,rate,cap,send){const regions=state.regions.map(r=>({...r,lastAction:-Infinity})),groups=state.groups.map(x=>({...x})),queues=(state.queues||[]).map(x=>({...x})),target=regions.find(r=>r.id===command.target);let reached=-1,atReach=0;
 if(target)for(const id of command.sources){const r=regions.find(r=>r.id===id);for(let i=queues.length-1;i>=0;i--)if(queues[i].from===id)queues.splice(i,1);const n=send(r.units,command.partial);if(n)queues.push({from:id,to:target.id,owner,n,next:0});}
 const interval=b.timing.departureInterval,wave=b.timing.waveSize||1;
 for(let time=0;time<=cfg.trace+1e-8;time=F(time+cfg.step)){const next=F(time+cfg.step);
  for(const q of queues){const from=regions.find(r=>r.id===q.from);if(from.owner!==q.owner){q.n=0;continue;}while(q.n>0&&q.next<next-1e-8){const n=Math.min(wave,q.n,Math.floor(from.units));if(!n){q.n=0;break;}from.units=F(from.units-n);from.lastAction=q.next;q.n-=n;const at=q.next+travel(b,from.source,b.regions[q.to],q.owner);groups.push({owner:q.owner,to:q.to,n,from:from.source,start:q.next,at,interval:b.departureDelay(from.source)});q.next=F(q.next+b.departureDelay(from.source));}}
  if(cfg.preset?._isConsiderGroupToGroupIntersection)for(let i=0;i<groups.length;i++){const a=groups[i];if(!a.n)continue;for(let j=i+1;j<groups.length;j++){const c=groups[j];if(!c.n||a.owner===c.owner||Math.max(a.start,c.start)>next||!crossing(a,c,time,next,b))continue;const n=Math.min(a.n,c.n);a.n-=n;c.n-=n;}}
  groups.sort((a,c)=>a.at-c.at);for(const x of groups){if(!x.n||x.at>next)continue;const r=regions.find(r=>r.id===x.to);if(!r)continue;if(target&&r.id===target.id&&reached<0){reached=Math.max(time,x.at);atReach=r.units;}const n=arrivalAmount(x.n,wave,1,cfg.step,x.interval||interval);x.n-=n;r.lastAction=next;if(r.owner===x.owner)r.units=F(r.units+n);else if(r.units<n){r.owner=x.owner;r.units=F(n-r.units);}else r.units=F(r.units-n);}
  for(const r of regions)if(r.owner&&r.lastAction+.5<=next&&r.units<cap(b,r.source,r.owner))r.units=F(Math.min(cap(b,r.source,r.owner),r.units+rate(b,r.source,r.owner)*cfg.step));
 }
 return {regions,groups:groups.filter(x=>x.n>0),queues:queues.filter(x=>x.n>0),reached,atReach,target:target?.units??0,captured:!!target&&target.owner===owner};
}
const api={arrivalAmount,initial,forecast,crossing};g.TerraSourceSimulation=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
