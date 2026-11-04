/* BotCalculationLogicV5: native power deltas, command budget and decision rank. */
(function(g){'use strict';
const F=Math.fround,add=(a,b)=>F(F(a)+F(b)),sub=(a,b)=>F(F(a)-F(b)),mul=(a,b)=>F(F(a)*F(b)),div=(a,b)=>F(F(a)/F(b));
function power(state,include){let forces=0,buildings=0,spawn=0;for(const r of state.regions)if(include(r.owner)){forces=add(forces,r.units);buildings++;spawn=add(spawn,Math.min(F(r.info.rate),sub(r.info.limit,r.units)));}for(const x of state.groups)if(include(x.owner))forces=add(forces,x.n);return {forces,buildings,spawn};}
function strongestEnemy(state,owner){let best=0,forces=-Infinity;const owners=[...new Set([1,...state.regions.map(r=>r.owner),...state.groups.map(g=>g.owner)])].filter(o=>o&&o!==owner).sort((a,b)=>a-b);for(const o of owners){const value=power(state,x=>x===o).forces;if(value>forces){forces=value;best=o;}}return best;}
function subtract(a,b){return {forces:sub(a.forces,b.forces),buildings:a.buildings-b.buildings,spawn:sub(a.spawn,b.spawn)};}
function stateScore(before,after,owner,mainEnemy,weights,expected=false,targetOwner=owner,targetSpawn=0){
 const delta=test=>subtract(power(after,test),power(before,test)),mine=delta(o=>o===owner),neutral=delta(o=>o===0),main=delta(o=>o===mainEnemy),enemies=subtract(subtract(delta(o=>o!==0),mine),main);
 if(expected&&targetOwner!==owner){mine.buildings++;mine.spawn=add(mine.spawn,targetSpawn);const lost=targetOwner===0?neutral:targetOwner===mainEnemy?main:enemies;lost.buildings--;lost.spawn=sub(lost.spawn,targetSpawn);}
 const total=power(before,()=>true).forces,count=before.regions.length;
 const terms=(d,w)=>{const f=div(mul(w.forces,d.forces),total),b=div(mul(w.buildings,d.buildings),count),s=mul(w.spawn,d.spawn);return [f,b,s];};
 const a=terms(mine,weights.mine),b=terms(main,weights.main),c=terms(enemies,weights.enemies),d=terms(neutral,weights.neutral);
 const own=add(add(a[0],a[1]),a[2]),primary=add(b[2],add(b[0],b[1])),others=add(c[2],add(c[0],c[1])),unowned=add(d[2],add(d[0],d[1]));return add(unowned,add(add(own,primary),others));
}
function interest(score,factor,multiplier){factor=Number.isFinite(factor)?F(factor):0;multiplier=Math.max(0,Number.isFinite(multiplier)?F(multiplier):0);return score>=0?mul(mul(Math.abs(score),factor),multiplier):div(-mul(Math.abs(score),factor),Math.max(multiplier,F(.0001)));}
function commandScore(score,reached,trace,executeFactor,factor,multiplier){const time=reached===-1?trace:reached,penalty=Math.abs(mul(div(time,trace),executeFactor));return interest(sub(score,penalty),factor,multiplier);}
function canDefend(state,owner){if(state.regions.filter(r=>r.owner===owner).length<2)return false;if(state.groups.some(x=>x.owner!==owner&&state.regions.find(r=>r.id===x.to)?.owner===owner))return true;return state.groups.length<(state.groupCapacity??256)&&state.regions[0]?.owner===owner;}
function budget(commands,max,rng){const a=[...commands];for(let n=a.length;n>1;n--){const i=Math.floor(rng()*n);[a[i],a[n-1]]=[a[n-1],a[i]];}if(a.length>max)a.splice(max,a.length-max-1);return a;}
function rank(count,order,rng){return count<2||order<2?0:rng.int(0,Math.min(count,rng.int(order)));}
function baseline(state,step,sim,intersections){const out=sim.clone(state);sim.step(out,step,intersections);sim.step(out,step,intersections);return out;}
const api={strongestEnemy,power,stateScore,commandScore,interest,canDefend,budget,rank,baseline};g.TerraSourceAIV5=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
