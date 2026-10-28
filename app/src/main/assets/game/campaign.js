/* Campaign built from reference territory outlines, base positions and stage cameras. */
(function(g){'use strict';
 const templates=typeof module!=='undefined'?require('./maps.js'):g.TERRA_LEVELS,reference=typeof module!=='undefined'?require('./reference-levels.js'):g.TerraReference;
 const TOTAL=200,CHAPTER_SIZE=10,layouts=reference.maps;
 const names=[['Madagascar','Мадагаскар',5],['USA','Северная Америка',1],['EU','Европа',2],['Italy','Италия',6],['Africa','Африка',3],['Arabian','Аравия',18],['India','Индия',9],['China','Китай',4],['Japan','Япония',7],['Korea','Корея',17],['UK','Британия',8],['Latin','Южная Америка',11],['Oceania','Океания',10]];
 function make(index){
  const layoutIndex=index<2?index:2+(index-2)%(layouts.length-2),source=layouts[layoutIndex],cycle=index<2?0:Math.floor((index-2)/(layouts.length-2)),theme=names.find(n=>source.source.includes(n[0]))||names[0];
  const regions=source.regions.map(r=>({...r,units:r.sourceOverride?r.units:r.owner>1?r.units+Math.min(12,cycle*3):r.units}));
  return {...source,regions,layoutIndex,index,template:theme[2],chapter:Math.floor(index/CHAPTER_SIZE),name:index===0?'Первый рубеж':index===1?'Объединение сил':theme[1],subtitle:index<2?'Обучение':source.stages.length+' участка · глава '+(Math.floor(index/10)+1),seed:index+1,
   difficulty:1+index/199*3,cap:50,reward:125+Math.floor(index*1.25),firstReward:125+Math.floor(index*1.25),aiInterval:Math.max(2.8,4.6-index/199*1.6),enemyRate:.72+index/199*.3,reference:true,
   fog:index>=44&&index%10===7,vision:330};
 }
 const levels=Array.from({length:TOTAL},(_,i)=>make(i));
 function combat(level,options={}){
  const start=options.start||0,tier=(level.index||0)/199,homes=new Map();for(const r of level.regions)if(r.owner===1)homes.set(r.stage||0,r.units+start);
  return {...level,enemyCap:options.limit||level.cap,regions:level.regions.map(r=>({...r,units:r.owner>1&&!r.sourceOverride?Math.max(r.units,(homes.get(r.stage||0)||15+start)+3+Math.floor(tier*4)):r.units}))};
 }
 function reward(level){return {gems:8+Math.min(4,Math.floor(Math.max(0,level)/5))*2,supply:1,shards:3+Math.min(7,Math.floor(Math.max(0,level)/10))};}
 function normalize(state){
  state.level=Math.max(0,Math.min(TOTAL-1,Math.floor(Number(state.level)||0)));state.unlocked=Math.max(0,Math.min(TOTAL-1,Math.floor(Number(state.unlocked)||0)));
  state.completed=[...new Set((state.completed||[]).filter(i=>Number.isInteger(i)&&i>=0&&i<TOTAL))];while(state.completed.includes(state.unlocked)&&state.unlocked<TOTAL-1)state.unlocked++;
  state.level=Math.min(state.level,state.unlocked);state.upgrades=Array.from({length:4},(_,i)=>Math.max(0,Math.min(20,Math.floor(state.upgrades?.[i]||0))));return state;
 }
 const api={TOTAL,CHAPTER_SIZE,templates,layouts,reference,levels,make,combat,reward,normalize};g.TerraCampaign=api;g.TERRA_LEVELS=levels;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
