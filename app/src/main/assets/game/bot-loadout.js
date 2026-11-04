/* Bot skins use source level curves and rarity normalization, never player wallet
 * or purchased upgrade counts. Native BotsSkinsDataProvider floors the product. */
(function(g){'use strict';
const Ab=g.TerraSourceAbilities||(typeof require!=='undefined'?require('./source-abilities.js'):null);
const S=g.TerraSource||(typeof require!=='undefined'?require('./reference/config.js'):null),R=g.TerraSourceRules||(typeof require!=='undefined'?require('./source-rules.js'):null),M=g.TerraSourceMath||(typeof require!=='undefined'?require('./source-math.js'):null),D=R.data.BotSkinsUpgradesConfig[0],F=Math.fround;
function level(index,type,skin){const curve=D._skinsUpgradesGainBalances.find(x=>x._skinType===type)?._levelGainBalances,base=Math.trunc(M.gain(curve,index+1)),modifier=D._rarityModifiers.find(x=>x._skinType===type)?._rarityModifiers.find(x=>x._rarityType===skin._rarity)?._modifier??1;return Math.max(0,Math.min(skin._upgradesMaxLevel||50,Math.floor(F(base*modifier))));}
function record(rows,lv){return lv>0?[...rows||[]].reverse().find(x=>x.Level<=lv):null;}
function loadout(profile,index){const stats={10:0,11:0,12:0,14:0,15:0},skills=[],levels={};let leader=null;
 for(const [cat,type]of [['base',0],['fighter',1],['leader',4]]){const skin=S.skins.find(x=>x.nativeId===profile.skins[cat]);if(!skin)continue;const lv=levels[cat]=profile.skinLevels?.[cat]??Math.floor(level(index,type,skin)*(profile.levelMultipliers?.[{base:'Building',fighter:'Fighter',leader:'Leader'}[cat]]??1));for(const r of skin._roleStats?._roleStats||[]){const p=record(r._stat._data,lv);if(p)stats[r._upgradeType]=F((stats[r._upgradeType]||0)+p.Value);}for(const x of skin.skills||[]){const p=record(x.data?._stat?._data,lv);if(!p)continue;const skill={kind:x.kind,upgradeType:x.data?._upgradeType,operationType:x.data?._operationType,playerActivationDelay:x.data?._playerActivationDelay,botActivationDelay:x.data?._botActivationDelay,...p};if(/^Leader/.test(x.kind))leader=skill;else skills.push(skill);}}
 return {stats,skills,levels,leader};
}
function setup(b){for(const owner of b.factions){const p=b.botProfiles[owner];if(!p)continue;const x=p.loadout=loadout(p,b.level.index||0);p.effects={};p.abilityCooldown=x.leader?F(x.leader.Cooldown*(1-x.leader.Preload)):Infinity;p.abilityDelay=null;
 for(const r of b.regions)if(r.active&&r.owner===owner&&!r.sourceOverride)r.units=Math.floor(F(r.units*(1+x.stats[11])));
 }}
function effect(b,owner,name){return b.botProfiles[owner]?.effects?.[name];}
function limit(b,owner){return owner===1?b.playerLimit:(b.botProfiles[owner]?.upgrades?.[10]??b.enemyLimit)*(1+(b.botProfiles[owner]?.loadout?.stats[10]||0));}
function speed(b,owner){if(owner===1)return b.playerSpeed;return 1+(b.botProfiles[owner]?.loadout?.stats[14]||0)+Ab.speedBonus(b,owner);}
function production(b,owner){if(owner===1)return b.sourceProduction*b.production*(b.productionBoost>0?(b.sourceBoost||1.8):1)*Ab.productionFactor(b,owner);return (b.botProfiles[owner]?.upgrades?.[12]??b.level.enemyRate)*(1+(b.botProfiles[owner]?.loadout?.stats[12]||0))*Ab.productionFactor(b,owner);}
function request(b,owner,trigger='send'){const p=b.botProfiles[owner],s=p?.loadout?.leader;if(!s||p.abilityCooldown>0||p.abilityDelay!==null)return;const kind=Ab.type(s),mode=['poison','production','shield'].includes(kind)?'ready':kind==='freeze'?'attacked':'send';if(trigger!==mode)return;const d=p.preset._abilityActivationDelay;p.abilityDelay=d?d.x+(d.y-d.x)*b.rng.next():0;}
function activate(b,owner){const p=b.botProfiles[owner],s=p?.loadout?.leader;if(!s||!Ab.schedule(b,owner,s))return false;p.abilityCooldown=s.Cooldown;p.abilityDelay=null;return true;}
function tick(b,dt){for(const owner of b.factions){const p=b.botProfiles[owner],s=p?.loadout?.leader;if(!s||!b.regions.some(r=>r.active&&r.owner===owner))continue;p.abilityCooldown=Math.max(0,p.abilityCooldown-dt);if(p.abilityCooldown===0&&/Poison|Shield|ProductionBoost/.test(s.kind))request(b,owner,'ready');if(p.abilityDelay!==null){p.abilityDelay-=dt;if(p.abilityDelay<=0&&!activate(b,owner))p.abilityDelay=null;}}}
function movementFactor(b,owner){return Ab.enemyFactors(b,owner);}
const api={level,loadout,setup,request,tick,effect,limit,speed,production,movementFactor,activate};g.TerraBotLoadout=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
