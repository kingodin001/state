/* Two hundred authored deterministic scenarios on twenty original tactical maps. */
(function(g){'use strict';
 const templates=typeof module!=='undefined'?require('./maps.js'):g.TERRA_LEVELS;
 const TOTAL=200,CHAPTER_SIZE=10;
 function random(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
 function area(r){let a=0;for(let i=0,j=r.poly.length-1;i<r.poly.length;j=i++)a+=r.poly[j][0]*r.poly[i][1]-r.poly[i][0]*r.poly[j][1];return Math.abs(a/2);}
 function make(index){
  const ti=index<5?index:(index-5)%templates.length,base=templates[ti],rng=random(90271+index*7919),tier=index/(TOTAL-1);
  if(index<5)return {...base,index,template:ti,chapter:0,difficulty:1+index*.15,firstReward:base.reward};
  const regions=base.regions.map(r=>({...r,owner:0,kind:'normal',units:4+Math.floor(rng()*(7+Math.floor(tier*9)))}));
  const large=[...regions].sort((a,b)=>area(b)-area(a)).slice(0,Math.max(3,Math.ceil(regions.length*.6))),home=large[Math.floor(rng()*large.length)];home.owner=1;home.units=18;
  const opponents=index<15?1:index<45?2:3;
  const occupied=[home];
  for(let owner=2;owner<opponents+2;owner++){
   const pool=regions.filter(r=>!r.owner).map(r=>({r,score:Math.min(...occupied.map(a=>Math.hypot(a.center[0]-r.center[0],a.center[1]-r.center[1])))*(1+rng()*.1)})).sort((a,b)=>b.score-a.score);
   const enemy=pool[0].r;enemy.owner=owner;enemy.units=12+Math.floor(tier*19)+Math.floor(rng()*4);occupied.push(enemy);
  }
  if(index>=14){const pool=regions.filter(r=>r!==home&&!r.owner).sort((a,b)=>area(b)-area(a));if(pool[0])pool[0].kind=index%3===0?'factory':index%3===1?'turret':'fort';}
  const zones=index>=24&&index%8===3?[{...regions[Math.floor(rng()*regions.length)],factor:.55,radius:85}].map(r=>({x:r.center[0],y:r.center[1],radius:r.radius,factor:r.factor})):[];
  return {...base,index,template:ti,chapter:Math.floor(index/CHAPTER_SIZE),seed:1000+index*31,regions,zones,fog:index>=44&&index%10===7,vision:330,
   cap:50,enemyRate:.68+tier*.36,aiInterval:4.8-tier*2.5,reward:125+Math.floor(index*1.25),firstReward:125+Math.floor(index*1.25),difficulty:1+tier*4,
   subtitle:'Глава '+(Math.floor(index/CHAPTER_SIZE)+1)+' · '+['Разведка','Прорыв','Захват','Манёвр','Окружение','Контрудар','Рубеж','Дозор','Наступление','Решающий бой'][index%10]};
 }
 const levels=Array.from({length:TOTAL},(_,i)=>make(i));
 function reward(level){return {gems:8+Math.min(4,Math.floor(Math.max(0,level)/5))*2,supply:1,shards:3+Math.min(7,Math.floor(Math.max(0,level)/10))};}
 function normalize(state){
  state.level=Math.max(0,Math.min(TOTAL-1,Math.floor(Number(state.level)||0)));state.unlocked=Math.max(0,Math.min(TOTAL-1,Math.floor(Number(state.unlocked)||0)));
  state.completed=[...new Set((state.completed||[]).filter(i=>Number.isInteger(i)&&i>=0&&i<TOTAL))];
  // A save completed under the former five-level cap must unlock the sixth level.
  while(state.completed.includes(state.unlocked)&&state.unlocked<TOTAL-1)state.unlocked++;
  state.level=Math.min(state.level,state.unlocked);state.upgrades=Array.from({length:4},(_,i)=>Math.max(0,Math.min(20,Math.floor(state.upgrades?.[i]||0))));return state;
 }
 const api={TOTAL,CHAPTER_SIZE,templates,levels,make,reward,normalize};g.TerraCampaign=api;g.TERRA_LEVELS=levels;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
