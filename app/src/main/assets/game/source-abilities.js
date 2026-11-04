/* Shared leader ability execution for the player and bots. Recovered native
 * contracts keep the two activation delays, target count and damage ticks distinct. */
(function(g){'use strict';const F=Math.fround;
function state(b){return b.sourceAbilities||(b.sourceAbilities={pending:[],effects:[]});}
function type(s){return /Sabotage/.test(s.kind)?'sabotage':/Shield/.test(s.kind)?'shield':/ProductionBoost/.test(s.kind)?'production':/IncreaseSpeed/.test(s.kind)?'speed':/Berserker/.test(s.kind)?'damage':/Poison/.test(s.kind)?'poison':/Freeze/.test(s.kind)?'freeze':/Invincibility/.test(s.kind)?'invincible':null;}
function active(b,owner,kind){return state(b).effects.find(x=>x.owner===owner&&x.kind===kind&&x.until>b.time);}
function baseStart(b,owner){return owner===1?b.options.sourceBaseStart??b.options.sourceStart??10:b.botProfiles[owner]?.upgrades?.[11]??b.level.regions.find(r=>r.owner===owner)?.units??10;}
function interval(rate){return F(Math.max(F(.05),Math.min(1,F(1/Math.max(F(.0001),F(rate))))));}
function refill(r,amount){const old=r.abilityShieldPoints||0,mechanic=Math.max(0,F((r.shieldPoints||0)-old));r.abilityShieldPoints=Math.max(0,F(amount));r.shieldPoints=F(mechanic+r.abilityShieldPoints);}
function absorb(r,damage){const n=Math.min(r.shieldPoints||0,damage),ability=Math.min(r.abilityShieldPoints||0,n);r.abilityShieldPoints=F((r.abilityShieldPoints||0)-ability);r.shieldPoints=F((r.shieldPoints||0)-n);return n;}
function apply(b,owner,s){const own=b.regions.filter(r=>r.active&&r.owner===owner);if(!own.length)return false;const kind=type(s),a=state(b);if(!kind)return false;
 if(kind==='shield'){const targets=own.sort((a,c)=>Number(a.shieldPoints>0)-Number(c.shieldPoints>0)||a.units-c.units),count=Math.trunc(s.Stat2??0),amount=Math.trunc(F(F(baseStart(b,owner))*F(s.Stat1)));for(const r of(count===0?targets:targets.slice(0,Math.max(0,count))))refill(r,amount);}
 else if(kind==='sabotage'){const targets=b.regions.filter(r=>r.active&&r.owner!==owner).sort((a,c)=>c.units-a.units),count=Math.trunc(s.Stat2??0),n=Math.trunc(F(F(baseStart(b,owner))*F(s.Stat1))),effects=g.TerraSourceEffects||(typeof require!=='undefined'?require('./source-effects.js'):null);for(const r of(count===0?targets:targets.slice(0,Math.max(0,count))))effects.drop(b,r.id,owner,n,'sabotage',1);}
 else {const e={owner,kind,value:F(s.Stat1||0),until:F(b.time+F(kind==='invincible'?s.Stat1:s.Stat2)),interval:kind==='poison'?interval(s.Stat1):0,next:F(b.time+(kind==='poison'?interval(s.Stat1):0))};a.effects=a.effects.filter(x=>x.owner!==owner||x.kind!==kind);a.effects.push(e);if(owner>1&&b.botProfiles[owner])b.botProfiles[owner].effects[kind]=e;}
 b.emit(owner===1?'boost':'bot-ability',{owner,kind:s.kind,id:own[0].id});return true;
}
function schedule(b,owner,s){if(!type(s)||!b.regions.some(r=>r.active&&r.owner===owner))return false;const delay=owner===1?s.playerActivationDelay||0:s.botActivationDelay||0;if(delay>0)state(b).pending.push({owner,skill:{...s},at:F(b.time+delay)});else apply(b,owner,s);return true;}
function tick(b){const a=state(b),ready=a.pending.filter(x=>x.at<=b.time+1e-6);a.pending=a.pending.filter(x=>x.at>b.time+1e-6);for(const x of ready)apply(b,x.owner,x.skill);
 for(const e of a.effects)if(e.kind==='poison')while(e.next<=b.time+1e-6&&e.next<e.until){const damage=F(e.value*e.interval),population=g.TerraSourcePopulation||(typeof require!=='undefined'?require('./source-population.js'):null);for(const r of b.regions)if(r.active&&r.owner&&r.owner!==e.owner){if(population.remove(r,damage)>0)r.lastBlockTimestamp=b.time;}e.next=F(e.next+e.interval);}
 a.effects=a.effects.filter(x=>x.until>b.time);
}
function productionFactor(b,owner){return active(b,owner,'production')?.value??1;}
function speedBonus(b,owner){return active(b,owner,'speed')?.value??0;}
function damageFactor(b,owner){return active(b,owner,'damage')?.value??1;}
function enemyFactors(b,owner){let n=1;for(const e of state(b).effects)if(e.until>b.time&&e.owner!==owner&&e.kind==='freeze')n=F(n*e.value);return n;}
function productionLocked(b,owner){return !!owner&&state(b).effects.some(e=>e.until>b.time&&e.owner!==owner&&e.kind==='poison');}
function invincible(b,owner){return !!active(b,owner,'invincible');}
const api={state,type,active,baseStart,interval,refill,absorb,apply,schedule,tick,productionFactor,speedBonus,damageFactor,enemyFactors,productionLocked,invincible};g.TerraSourceAbilities=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
