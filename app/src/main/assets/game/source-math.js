/* Selected source arithmetic; float rounding matches ARM64 single precision. */
(function(g){'use strict';const S=g.TerraSource||(typeof require!=='undefined'?require('./reference/config.js'):null),f=Math.fround;
function gain(c,level){level=Math.max(0,Math.floor(level));const rows=c._data||[],extra=c._extrapolationData||{};if(c._calculationMode===1){let value=c._baseValue||0;for(let i=0;i<rows.length;i++){const from=Math.max(1,rows[i]._level),to=Math.min(level,rows[i+1]?rows[i+1]._level:level);if(to>from)value=f(value+f((to-from)*rows[i]._value));}return value;}if(!rows.length)return 0;let r=rows[0];for(const x of rows){if(x._level>level)break;r=x;}return f(r._value+(extra.ExtrapolationType===1?(extra.A||0)*Math.max(0,level-r._level):0));}
function upgrade(type,purchased=0){const c=S.playerUpgrades._upgrades.find(x=>x._upgradeType===type);return c?gain(c._gainBalances,purchased+1):0;}
function upgradeCost(type,purchased=0){const c=S.playerUpgrades._upgradesCosts.find(x=>x._upgradeType===type);return c?Math.round(gain(c._gainBalances,purchased+2)):0;}
function actor(type,index,kind='bot',factor=1){const config=kind==='neutral'?S.neutralUpgrades:S.botUpgrades,c=config._upgrades.find(x=>x._upgradeType===type),lv=c?gain(c._gainBalances,index+1):1;return upgrade(type,Math.max(0,Math.floor(lv)-1))*factor;}
function waveDelay(metaSpeed,effectiveSpeed,multiplier=1){return f(f(.25)/f(effectiveSpeed/f(f(metaSpeed)*f(multiplier))));}
const api={gain,upgrade,upgradeCost,actor,waveDelay};g.TerraSourceMath=api;if(typeof module!=='undefined')module.exports=api;})(globalThis);
