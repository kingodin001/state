const assert=require('node:assert/strict'),{Battle}=require('../app/src/main/assets/game/engine.js'),campaign=require('../app/src/main/assets/game/campaign.js'),{Economy}=require('../app/src/main/assets/game/collection.js'),{Meta}=require('../app/src/main/assets/game/meta.js');
// Plays the complete campaign using earned resources and the actual starting commander.
// There are no injected coins, ad rewards, paid packs, instant victories, or per-level cheats.
const state={coins:0,level:0,unlocked:0,completed:[],stars:{},upgrades:[0,0,0,0],wins:0,captures:0,sent:0};campaign.normalize(state);const eco=new Economy(state),meta=new Meta(eco);
function upgrade(){for(let n=0;n<100;n++){const choices=[0,1,3].filter(i=>state.upgrades[i]<20).map(i=>({i,cost:Math.floor((i===3?60:50)*Math.pow(1.48,state.upgrades[i]))})).sort((a,b)=>a.cost-b.cost);if(!choices.length||choices[0].cost>state.coins)break;state.coins-=choices[0].cost;state.upgrades[choices[0].i]++;}}
function order(b){
 const own=b.regions.filter(r=>r.owner===1),others=b.regions.filter(r=>r.owner!==1);if(!own.length||!others.length)return;
 if(b.leaderCooldown<=0&&b.leaderCharges>0){const base=[...own].sort((a,c)=>a.units-c.units)[0];b.activateLeader(base.id);}
 let best=null,score=-Infinity;
 for(const t of others){const incoming=b.units.filter(u=>u.owner===1&&u.to===t.id).length+b.waves.filter(w=>w.owner===1&&w.to===t.id).reduce((n,w)=>n+w.left,0);if(incoming>t.units+8)continue;
  const sources=own.filter(s=>b.available(s.id)>4).sort((a,c)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(c.x-t.x,c.y-t.y));let sum=0,selected=[];
  for(const s of sources){sum+=b.available(s.id);selected.push(s.id);const d=Math.hypot(s.x-t.x,s.y-t.y),need=(t.units+(t.owner?d/100:0)+4)*(t.kind==='fort'?1.45:1);if(sum>need){const value=(t.owner===0?15:8)-d*.02+(sum-t.units)*.05-selected.length*2;if(value>score){score=value;best={selected:[...selected],id:t.id};}break;}}
 }
 if(best)b.command(best.selected,best.id);
}
const results=[];let failures=[];
for(const l of campaign.levels){
 upgrade();const bonus=eco.bonuses(),b=new Battle(l,{start:state.upgrades[0]*3+bonus.start,production:state.upgrades[1],speed:bonus.speed,limit:bonus.limit,leader:bonus.leader});b.production+=bonus.production;
 for(let i=0;i<40*600&&!b.result;i++){if(i%40===0)order(b);b.step(.025);}
 results.push({level:l.index+1,result:b.result,seconds:+b.time.toFixed(1),upgrades:[...state.upgrades]});
 if(b.result!=='win')failures.push(l.index+1);
 else{meta.result('campaign',true,b,true);const stars=b.time<95?3:b.time<170?2:1;meta.m.albumStars+=stars;state.stars[l.index]=stars;state.coins+=l.reward;state.wins++;state.captures+=b.stats.captured;state.sent+=b.stats.sent;state.completed.push(l.index);eco.victory(l.index);state.unlocked=Math.min(199,l.index+1);}
 if((l.index+1)%10===0)console.log('Chapter',Math.floor(l.index/10)+1,'wins',results.slice(-10).filter(x=>x.result==='win').length+'/10','coins',state.coins,'upgrades',state.upgrades.join('/'));
}
const fs=require('node:fs'),path=require('node:path'),out=path.join(__dirname,'../test-results/v4');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/progression.json',JSON.stringify({results,failures,coins:state.coins,upgrades:state.upgrades},null,2));
assert.deepEqual(failures,[],'Every campaign must be completable with legitimately earned upgrades');assert.equal(state.completed.length,200);assert.equal(eco.c.album.length,200);assert.equal(state.unlocked,199);assert.equal(Object.keys(meta.m.stickers).length,80);assert.equal(meta.m.stickerPacks,20);console.log('PASS all 200 scenarios, finite economy, 200 album entries, final unlock');
