const {Battle}=require('../app/src/main/assets/game/engine.js'),levels=require('../app/src/main/assets/game/campaign.js').levels.slice(0,5);
// A simple expansion policy validates that every campaign can finish without buying upgrades.
function commandPlayer(b){
 const own=b.regions.filter(r=>r.owner===1),others=b.regions.filter(r=>r.owner!==1);if(!others.length)return;
 // Attack from the nearest base, combining selected garrisons when necessary.
 let best=null,score=-Infinity;
 for(const t of others){const incoming=b.units.filter(u=>u.owner===1&&u.to===t.id).length+b.waves.filter(w=>w.owner===1&&w.to===t.id).reduce((n,w)=>n+w.left,0);if(incoming>t.units+8)continue;const sources=own.filter(s=>b.available(s.id)>4).sort((a,c)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(c.x-t.x,c.y-t.y));let sum=0,selected=[];
  for(const s of sources){sum+=b.available(s.id);selected.push(s.id);const d=Math.hypot(s.x-t.x,s.y-t.y);if(sum>(t.units+4)*(t.kind==='fort'?1.45:1)){const v=(t.owner===0?15:8)-d*.02+(sum-t.units)*.05-selected.length*2;if(v>score){score=v;best={selected:[...selected],id:t.id};}break;}}
 }
 if(best)b.command(best.selected,best.id);
}
let failures=0;
for(const l of levels){const b=new Battle(l);for(let i=0;i<60*40*12&&!b.result;i++){if(i%40===0)commandPlayer(b);b.step(.025);}console.log(l.name,JSON.stringify({result:b.result,time:+b.time.toFixed(1),captures:b.stats.captured,units:b.totals()}));if(b.result!=='win')failures++;}
process.exitCode=failures?1:0;
