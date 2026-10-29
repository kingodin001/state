/* Local progression for the offline game. No simulated online players or paid transactions. */
(function(g){'use strict';
const DAY=86400000,HOUR=3600000,day=now=>{const d=new Date(now);return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();};
const packs={starter:{cost:45,reward:{coins:500,supply:5,tickets:2},chest:'royal'},royal:{cost:120,reward:{coins:1500,supply:10,tickets:5},chest:'legend'}};
const wheels=[{name:'80 монет',kind:'coins',amount:80},{name:'10 кристаллов',kind:'gems',amount:10},{name:'2 припаса',kind:'supply',amount:2},{name:'1 билет',kind:'tickets',amount:1},{name:'150 монет',kind:'coins',amount:150},{name:'5 фрагментов',kind:'shards',amount:5}];
function week(now){const d=new Date(now);d.setHours(0,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return day(d.getTime());}
class Meta{
 constructor(eco){this.eco=eco;this.state=eco.state;const s=this.state;
  if(!s.meta)s.meta={version:1,ticketsGranted:false,profileTitle:'Командир',rating:0,duels:0,duelWins:0,bestRush:0,packs:[],slots:[null,null,null],wheelDay:'',wheelSpins:0,weekly:{},weeklyClaims:[],instantAt:0,supplyAt:Date.now(),lastOfflineReward:0};
  s.tickets=Math.max(0,Math.floor(s.tickets||0));if(!s.meta.ticketsGranted){if(!eco.source)s.tickets+=3;s.meta.ticketsGranted=true;}
  s.profileName=s.profileName||'Командир';s.collection.dailySlots=Math.max(3,Math.min(6,s.collection.dailySlots||3));this.refresh();
  this.m.stickers=this.m.stickers||{};this.m.stickerSets=this.m.stickerSets||[];this.m.stickerPacks=this.m.stickerPacks||0;this.m.albumStars=this.m.albumStars||0;
  if(!this.m.sourceAlbumMigrated){this.m.legacyStickers={...this.m.stickers};this.m.legacyStickerSets=[...this.m.stickerSets];const migrated={};for(const [id,count] of Object.entries(this.m.stickers)){const key=Number(id)%54;migrated[key]=(migrated[key]||0)+count;}this.m.stickers=migrated;this.m.stickerSets=[];this.m.sourceAlbumMigrated=true;}
  if(!this.m.albumMigrated){this.m.albumStars+=Object.values(s.stars||{}).reduce((n,v)=>n+Math.max(0,Math.min(3,Number(v)||0)),0);for(const i of s.completed||[]){const id=this.stickerId(i);this.m.stickers[id]=Math.max(1,this.m.stickers[id]||0);}this.m.albumMigrated=true;}
 }
 get m(){return this.state.meta;}
 refresh(now=Date.now()){
  const m=this.m,s=this.state,d=day(now),w=week(now);if(m.wheelDay!==d){m.wheelDay=d;m.wheelSpins=0;m.dailyRefreshes=0;}
  if(m.weekly.key!==w){m.weekly={key:w,wins:s.wins||0,captures:s.captures||0,sent:s.sent||0};}
  if(this.eco.source||s.supply>=10)m.supplyAt=now;else{const elapsed=Math.max(0,now-m.supplyAt),n=Math.floor(elapsed/(HOUR/2));if(n){s.supply=Math.min(10,s.supply+n);m.supplyAt+=n*HOUR/2;}}
  return this;
 }
 spend(kind,n){return this.eco.spend(kind,n);}
 reward(value){this.eco.reward(value);}
 buyPack(id){if(this.eco.source)return false;const p=packs[id];if(!p||this.m.packs.includes(id)||!this.spend('gems',p.cost))return false;this.reward(p.reward);this.eco.c.chests[p.chest]++;this.m.packs.push(id);return true;}
 diamonds(index){if(this.eco.source)return false;const p=[[600,10],[1800,30],[4500,75],[12000,200]][index];if(!p||!this.spend('coins',p[0]))return false;this.reward({gems:p[1]});return true;}
 tickets(index){if(this.eco.source)return false;const p=[[8,2],[30,10],[70,25],[130,50]][index];if(!p||!this.spend('gems',p[0]))return false;this.reward({tickets:p[1]});return true;}
 unlockDailySlot(){if(this.eco.source)return false;const n=this.eco.c.dailySlots;if(n>=6||!this.spend('gems',20+(n-3)*15))return false;this.eco.c.dailySlots++;return true;}
 refreshOffers(){if(this.eco.source)return false;this.refresh();const n=this.m.dailyRefreshes||0;if(n>=3||!this.spend('gems',5+n*5))return false;this.m.dailyRefreshes=n+1;this.eco.c.dailyRefresh=n+1;this.eco.c.dailyBought=[];return true;}
 spin(now=Date.now()){
  this.refresh(now);if(this.m.wheelSpins>=3)return null;if(this.m.wheelSpins>0&&!this.spend('tickets',1))return null;this.m.wheelSpins++;
  const index=Math.floor(this.eco.random()*wheels.length),prize={...wheels[index],index};
  if(prize.kind==='shards'){const pool=this.eco.c.equipped,ids=[pool.base,pool.fighter,pool.leader],id=ids[Math.floor(this.eco.random()*ids.length)];this.eco.grantShards(id,prize.amount);prize.card=id;}else this.reward({[prize.kind]:prize.amount});
  this.m.lastSpin={...prize,at:now};return prize;
 }
 weekly(){this.refresh();const w=this.m.weekly;return [{id:'wins',title:'Выиграй 12 сражений',goal:12,value:Math.max(0,(this.state.wins||0)-w.wins),reward:{gems:60,tickets:2}},{id:'capture',title:'Захвати 90 территорий',goal:90,value:Math.max(0,(this.state.captures||0)-w.captures),reward:{coins:900,supply:5}},{id:'sent',title:'Отправь 1500 бойцов',goal:1500,value:Math.max(0,(this.state.sent||0)-w.sent),reward:{gems:45,tickets:3}}].map(q=>({...q,key:w.key+':'+q.id,claimed:this.m.weeklyClaims.includes(w.key+':'+q.id)}));}
 claimWeekly(id){const q=this.weekly().find(q=>q.id===id);if(!q||q.claimed||q.value<q.goal)return false;this.reward(q.reward);this.m.weeklyClaims.push(q.key);return true;}
 instantIncome(now=Date.now()){
  if(now-this.m.instantAt<4*HOUR||!this.spend('gems',10))return false;const coins=(100+(this.state.upgrades[2]||0)*75)*2;this.reward({coins});this.m.instantAt=now;return coins;
 }
 addChest(level){if((level+1)%5!==0)return false;const i=this.m.slots.findIndex(s=>s===null);if(i<0)return false;this.m.slots[i]={type:(level+1)%20===0?'royal':'basic',duration:Math.min(600,60+level*2),ends:0};return true;}
 slot(index,now=Date.now()){const s=this.m.slots[index];return s?{...s,remaining:s.ends?Math.max(0,Math.ceil((s.ends-now)/1000)):s.duration,ready:s.ends>0&&s.ends<=now}:null;}
 startSlot(index,now=Date.now()){const s=this.m.slots[index];if(!s||s.ends||this.m.slots.some(x=>x&&x.ends>now))return false;s.ends=now+s.duration*1000;return true;}
 speedSlot(index,now=Date.now()){const s=this.m.slots[index];if(!s||s.ends>0&&s.ends<=now||!this.spend('tickets',1))return false;s.ends=now;return true;}
 claimSlot(index,now=Date.now()){const s=this.m.slots[index];if(!s||!s.ends||s.ends>now)return false;this.eco.c.chests[s.type]++;this.m.slots[index]=null;return true;}
 league(){const points=this.m.rating;return {name:points<250?'БРОНЗА':points<700?'СЕРЕБРО':points<1400?'ЗОЛОТО':'АЛМАЗ',points,next:points<250?250:points<700?700:points<1400?1400:2000,wins:this.m.duelWins,battles:this.m.duels};}
 stickerId(level){return Math.max(0,Math.floor(Number(level)||0))%54;}
 grantSticker(id){const duplicate=!!this.m.stickers[id];this.m.stickers[id]=(this.m.stickers[id]||0)+1;if(duplicate)this.m.albumStars++;return {id,duplicate};}
 buyStickerPack(){if(this.m.albumStars<20)return false;this.m.albumStars-=20;this.m.stickerPacks++;return true;}
 openStickerPack(){if(this.m.stickerPacks<1)return null;this.m.stickerPacks--;return Array.from({length:3},()=>this.grantSticker(Math.floor(this.eco.random()*54)));}
 claimStickerSet(world){if(!Number.isInteger(world)||world<0||world>=9||this.m.stickerSets.includes(world)||![0,1,2,3,4,5].every(i=>this.m.stickers[world*6+i]))return false;const reward={coins:150+world*10,gems:20,tickets:1};this.reward(reward);this.m.stickerSets.push(world);return reward;}
 result(mode,won,battle,first=false){if(mode==='duel'){this.m.duels++;if(won)this.m.duelWins++;this.m.rating=Math.max(0,this.m.rating+(won?25:-12));}if(mode==='rush')this.m.bestRush=Math.max(this.m.bestRush,battle.stats.captured);if(mode==='campaign'&&won&&first){this.addChest(battle.level.index);this.grantSticker(this.stickerId(battle.level.index));if((battle.level.index+1)%10===0)this.m.stickerPacks++;}}
}
g.TerraMeta={Meta,packs,wheels,day,week};if(typeof module!=='undefined')module.exports=g.TerraMeta;
})(typeof globalThis!=='undefined'?globalThis:this);
