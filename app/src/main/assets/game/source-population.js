/* Population.TryPopulate / CanSpawn: integer population, retained fractional
 * production, and the 0.5-second block after a departure or incoming damage. */
(function(g){'use strict';const F=Math.fround;
function tick(r,now,dt,rate,limit,enabled=true,overflow=false){now=F(now);const last=r.lastSpawnTimestamp??-1;r.lastSpawnTimestamp=now;const elapsed=last===-1?0:F(now-F(last));let amount=F(r.productionAmount||0);if(!enabled||!rate||r.units>=limit&&!overflow||F(now-F(r.lastBlockTimestamp??0))<.5){r.productionAmount=F(amount-Math.floor(amount));return 0;}amount=F(amount+F(elapsed*F(rate)));const n=Math.max(0,Math.min(Math.floor(amount),overflow?Infinity:Math.ceil(limit-r.units)));r.units+=n;r.productionAmount=F(amount-Math.floor(amount));return n;}
const api={tick};g.TerraSourcePopulation=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
