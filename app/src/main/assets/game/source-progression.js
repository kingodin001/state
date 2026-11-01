/* Source rates are per hour. Claims are explicit, persistent transactions. */
(function(g){'use strict';
const E=g.TerraSourceExtra||(typeof require!=='undefined'?require('./reference/extra-config.js'):null),R=g.TerraSourceRules||(typeof require!=='undefined'?require('./source-rules.js'):null),M=g.TerraSourceMath||(typeof require!=='undefined'?require('./source-math.js'):null),S=g.TerraSource||(typeof require!=='undefined'?require('./reference/config.js'):null),T=g.TerraMeta||(typeof require!=='undefined'?require('./meta.js'):null),C=g.TerraCollection||(typeof require!=='undefined'?require('./collection.js'):null),HOUR=3600000;
function core(state,index){const values=[0,1,3].map(i=>Math.max(0,state.upgrades[i]||0)),size=E[383]._remoteConfigData._maxUpgradesPerStage,base=Math.floor(Math.min(...values)/size)*size,count=state.upgrades[index]||0,level=Math.min(size,Math.max(0,count-base));return {base,level,max:count>=base+size,progress:values.reduce((a,b)=>a+b,0),next:base+size};}
function hourly(state){const row=R.data.IdleEarningRewardsConfigs[0]._idleEarningRewards[0],rate=M.gain(S.currencyRates._data[0].RateBalances,(state.level||0)+1),out={};for(const r of row._rewards)out[{Soft:'coins',Hard:'gems',Supply:'supply'}[r._id]]=r._rate*(r._rewardType===11?rate:1);return out;}
function rewards(rates,hours){return Object.fromEntries(Object.entries(rates).map(([k,n])=>[k,Math.floor(n*hours+1e-7)]));}
Object.assign(T.Meta.prototype,{
 idleInfo(now=Date.now()){
  const cfg=R.data.IdleEarningRewardsConfigs[0];if(!R.featureAvailable('idle',this.state))return {available:false,ready:false,hours:0,rewards:{},hourly:hourly(this.state)};
  if(!Number.isFinite(this.m.idleAt)){const last=this.state.lastSeen||now;this.m.idleAt=Math.min(now,last);if(!this.m.idleStarted){this.m.idleAt=Math.min(this.m.idleAt,now-cfg._idleRewardConfig._firstRewardTime*60000);this.m.idleStarted=true;}}
  const elapsed=Math.max(0,Math.min(cfg._idleRewardConfig._idleTime.y*60000,now-this.m.idleAt)),hours=elapsed/HOUR,rates=hourly(this.state);
  return {available:true,ready:elapsed>=cfg._idleRewardConfig._idleTime.x*60000,start:this.m.idleAt,end:now,elapsed,hours,maxHours:cfg._idleRewardConfig._idleTime.y/60,hourly:rates,rewards:rewards(rates,hours)};
 },
 claimIdle(quote,videoCompleted=false,multiplier=1,now=Date.now()){
  if(!quote||quote.start!==this.m.idleAt||quote.end>now||![1,2].includes(multiplier)||multiplier===2&&!videoCompleted)return false;
  const fresh=this.idleInfo(quote.end);if(!fresh.ready)return false;const value=Object.fromEntries(Object.entries(fresh.rewards).map(([k,n])=>[k,n*multiplier]));this.reward(value);this.m.idleAt=quote.end;this.m.lastOfflineReward=value.coins;return value;
 },
 instantIncome(now=Date.now(),videoCompleted=false){const status=this.instantStatus(now);if(!videoCompleted||!R.featureAvailable('idle',this.state)||!status.remaining)return false;const value=rewards(hourly(this.state),status.minutes/60);this.m.instantClaims++;this.reward(value);return value;}
});
/* Original ordered free/video rows. The final video row repeats, as requested. */
const kinds={coins:'Soft',gems:'Hard',supply:'Supply',chest:'skins_booster'},gifts=Object.fromEntries(Object.entries(kinds).map(([k,id])=>[k,E[Object.keys(E).find(id=>E[id].kind==='ExtraItemsConfig')]._groups.find(x=>x._id===id)._items]));
Object.assign(C.Economy.prototype,{
 resourceGift(kind,now=Date.now()){const rows=gifts[kind];if(!rows)return null;const day=T.day(now);if(this.c.giftDay!==day){this.c.giftDay=day;this.c.giftCounts={};}const count=this.c.giftCounts[kind]||0,row=rows[Math.min(count,rows.length-1)],limit=rows.filter(r=>r._costType===32).length;return {kind,index:count,amount:row._rewardAmount*(row._rewardType===11?Math.round(M.gain(S.currencyRates._data[0].RateBalances,(this.state.level||0)+1)):1),remaining:row._costType===32?1:0,limit,row};},
 claimResourceGift(kind,videoCompleted=false,now=Date.now()){const o=this.resourceGift(kind,now);if(!o||!o.remaining&&!videoCompleted)return false;this.c.giftCounts[kind]=o.index+1;if(kind==='chest'){this.c.chests.basic++;return {chest:1};}this.reward({[kind]:o.amount});return {[kind]:o.amount};},
 coreRewards(){const rank=core(this.state,0).progress,cfg=E[383]._remoteConfigData,rows=cfg._rewards.map(x=>({...x,rank:x._rank}));for(let cycle=0;120+cycle*30<rank+30;cycle++)for(const x of cfg._cycleRewards)rows.push({...x,rank:120+cycle*30+x._rank});this.c.coreClaims=this.c.coreClaims||[];return rows.filter(x=>x.rank>=rank-30&&x.rank<=rank+30).map(x=>({...x,ready:x.rank<=rank,claimed:this.c.coreClaims.includes(x.rank)}));},
 claimCoreReward(rank){const r=this.coreRewards().find(r=>r.rank===rank);if(!r||!r.ready||r.claimed)return false;if(r._rewardType===40){const type=Object.keys(R.chestIds).find(k=>R.chestIds[k]===r._rewardId);if(!type)return false;this.c.chests[type]++;}else this.reward({[{Soft:'coins',Hard:'gems',Skipit:'tickets'}[r._rewardId]]:r._rewardAmount});this.c.coreClaims.push(rank);return true;}
});
const api={core,hourly,rewards,gifts};g.TerraProgression=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
