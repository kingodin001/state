/* Bot skins use source level curves and rarity normalization, never player wallet
 * or purchased upgrade counts. Native BotsSkinsDataProvider floors the product. */
(function(g){'use strict';
const S=g.TerraSource||(typeof require!=='undefined'?require('./reference/config.js'):null),R=g.TerraSourceRules||(typeof require!=='undefined'?require('./source-rules.js'):null),M=g.TerraSourceMath||(typeof require!=='undefined'?require('./source-math.js'):null),D=R.data.BotSkinsUpgradesConfig[0],F=Math.fround;
function level(index,type,skin){const curve=D._skinsUpgradesGainBalances.find(x=>x._skinType===type)?._levelGainBalances,base=Math.trunc(M.gain(curve,index+1)),modifier=D._rarityModifiers.find(x=>x._skinType===type)?._rarityModifiers.find(x=>x._rarityType===skin._rarity)?._modifier??1;return Math.max(0,Math.min(skin._upgradesMaxLevel||50,Math.floor(F(base*modifier))));}
function record(rows,lv){return lv>0?[...rows||[]].reverse().find(x=>x.Level<=lv):null;}
function loadout(profile,index){const stats={10:0,11:0,12:0,14:0,15:0},skills=[],levels={};let leader=null;
 for(const [cat,type]of [['base',0],['fighter',1],['leader',4]]){const skin=S.skins.find(x=>x.nativeId===profile.skins[cat]);if(!skin)continue;const lv=levels[cat]=level(index,type,skin);for(const r of skin._roleStats?._roleStats||[]){const p=record(r._stat._data,lv);if(p)stats[r._upgradeType]=F((stats[r._upgradeType]||0)+p.Value);}for(const x of skin.skills||[]){const p=record(x.data?._stat?._data,lv);if(!p)continue;const skill={kind:x.kind,upgradeType:x.data?._upgradeType,operationType:x.data?._operationType,...p};if(/^Leader/.test(x.kind))leader=skill;else skills.push(skill);}}
 return {stats,skills,levels,leader};
}
function setup(b){for(const owner of b.factions){const p=b.botProfiles[owner];if(!p)continue;const x=p.loadout=loadout(p,b.level.index||0);p.effects={};p.abilityCooldown=x.leader?F(x.leader.Cooldown*(1-x.leader.Preload)):Infinity;p.abilityDelay=null;
 for(const r of b.regions)if(r.active&&r.owner===owner&&!r.sourceOverride)r.units=Math.floor(F(r.units*(1+x.stats[11])));
 }}
function effect(b,owner,name){return b.botProfiles[owner]?.effects?.[name];}
function limit(b,owner){return owner===1?b.playerLimit:b.enemyLimit*(1+(b.botProfiles[owner]?.loadout?.stats[10]||0));}
function speed(b,owner){if(owner===1)return b.playerSpeed;let n=1+(b.botProfiles[owner]?.loadout?.stats[14]||0);const x=effect(b,owner,'speed');if(x?.until>b.time)n*=1+x.value;return n;}
function production(b,owner){if(owner===1)return b.sourceProduction*b.production*(b.productionBoost>0?(b.sourceBoost||1.8):1);let n=b.level.enemyRate*(1+(b.botProfiles[owner]?.loadout?.stats[12]||0));const x=effect(b,owner,'production');if(x?.until>b.time)n*=x.value;return n;}
function request(b,owner){const p=b.botProfiles[owner],s=p?.loadout?.leader;if(!s||p.abilityCooldown>0||p.abilityDelay!==null)return;const d=p.preset._abilityActivationDelay;p.abilityDelay=d?d.x+(d.y-d.x)*b.rng.next():0;}
function activate(b,owner){const p=b.botProfiles[owner],s=p?.loadout?.leader,own=b.regions.filter(r=>r.active&&r.owner===owner).sort((a,c)=>a.units-c.units),hostile=b.regions.filter(r=>r.active&&r.owner&&r.owner!==owner).sort((a,c)=>a.units-c.units);if(!s||!own.length)return false;
 if(s.kind.includes('Shield'))own[0].shieldPoints+=Math.ceil(limit(b,owner)*s.Stat1);
 else if(s.kind.includes('ProductionBoost'))p.effects.production={until:b.time+s.Stat2,value:s.Stat1};
 else if(s.kind.includes('IncreaseSpeed'))p.effects.speed={until:b.time+s.Stat2,value:s.Stat1};
 else if(s.kind.includes('Berserker'))p.effects.damage={until:b.time+s.Stat2,value:s.Stat1};
 else if(s.kind.includes('Poison'))for(const r of hostile){r.poison=s.Stat2;r.poisonElapsed=0;r.poisonDamage=s.Stat1;r.frozen=s.Stat2;}
 else if(s.kind.includes('Freeze')){for(const r of hostile)r.frozen=s.Stat2;p.effects.freeze={until:b.time+s.Stat2,value:s.Stat1};}
 else if(s.kind.includes('Sabotage')){const targets=b.regions.filter(r=>r.active&&r.owner!==owner).sort((a,c)=>a.units-c.units),r=targets[0];if(!r)return false;const start=b.level.regions.find(r=>r.stage===0&&r.owner===owner)?.units||10;(g.TerraSourceEffects||(typeof require!=='undefined'?require('./source-effects.js'):null)).drop(b,r.id,owner,Math.floor(start*s.Stat1),'sabotage',s.Stat2||1);}
 else return false;
 p.abilityCooldown=s.Cooldown;p.abilityDelay=null;b.emit('bot-ability',{owner,kind:s.kind,id:own[0].id});return true;
}
function tick(b,dt){for(const owner of b.factions){const p=b.botProfiles[owner],s=p?.loadout?.leader;if(!s||!b.regions.some(r=>r.active&&r.owner===owner))continue;p.abilityCooldown=Math.max(0,p.abilityCooldown-dt);if(p.abilityCooldown===0&&/Poison|Shield|ProductionBoost/.test(s.kind))request(b,owner);if(p.abilityDelay!==null){p.abilityDelay-=dt;if(p.abilityDelay<=0&&!activate(b,owner))p.abilityDelay=null;}}}
function movementFactor(b,owner){let n=1;for(const other of b.factions)if(other!==owner){const x=effect(b,other,'freeze');if(x?.until>b.time)n*=x.value;}return n;}
const api={level,loadout,setup,request,tick,effect,limit,speed,production,movementFactor,activate};g.TerraBotLoadout=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
