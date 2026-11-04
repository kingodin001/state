/* Population.TryPopulate / CanSpawn: integer population, retained fractional
 * production, and the 0.5-second block after a departure or incoming damage. */
(function(g){'use strict';const F=Math.fround;
function tick(r,now,dt,rate,limit,enabled=true,overflow=false){now=F(now);const last=r.lastSpawnTimestamp??-1;r.lastSpawnTimestamp=now;const elapsed=last===-1?0:F(now-F(last));let amount=F(r.productionAmount||0);if(!enabled||!rate||r.units>=limit&&!overflow||F(now-F(r.lastBlockTimestamp??0))<.5){r.productionAmount=F(amount-Math.floor(amount));return 0;}amount=F(amount+F(elapsed*F(rate)));const n=Math.max(0,Math.min(Math.floor(amount),overflow?Infinity:Math.ceil(limit-r.units)));r.units+=n;r.productionAmount=F(amount-Math.floor(amount));return n;}
function remove(r,damage){damage=F(damage);let used=0;const available=F(r.units-F(r.fractionalDamage||0));if(damage>0&&available>0){used=Math.min(damage,available);const total=F(F(r.fractionalDamage||0)+used),whole=Math.floor(total);r.fractionalDamage=F(total-whole);if(whole>=1)r.units=Math.max(0,r.units-whole);if(!r.units)r.fractionalDamage=0;}return used;}
const api={tick,remove};g.TerraSourcePopulation=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
