/* Source rates are per hour. Claims are explicit, persistent transactions. */
(function(g){'use strict';
const R=g.TerraSourceRules||(typeof require!=='undefined'?require('./source-rules.js'):null),M=g.TerraSourceMath||(typeof require!=='undefined'?require('./source-math.js'):null),S=g.TerraSource||(typeof require!=='undefined'?require('./reference/config.js'):null),T=g.TerraMeta||(typeof require!=='undefined'?require('./meta.js'):null),C=g.TerraCollection||(typeof require!=='undefined'?require('./collection.js'):null),HOUR=3600000;
function core(state,index){const values=[0,1,3].map(i=>Math.max(0,state.upgrades[i]||0)),base=Math.floor(Math.min(...values)/10)*10,count=state.upgrades[index]||0,level=Math.min(10,Math.max(0,count-base));return {base,level,max:count>=base+10,progress:values.reduce((a,b)=>a+b,0),next:base+10};}
function hourly(state){const row=R.data.IdleEarningRewardsConfigs[0]._idleEarningRewards[0],rate=M.gain(S.currencyRates._data[0].RateBalances,(state.level||0)+1),out={};for(const r of row._rewards)out[{Soft:'coins',Hard:'gems',Supply:'supply'}[r._id]]=r._rate*(r._rewardType===11?rate:1);return out;}
function rewards(rates,hours){return Object.fromEntries(Object.entries(rates).map(([k,n])=>[k,Math.floor(n*hours+1e-7)]));}
Object.assign(T.Meta.prototype,{
 idleInfo(now=Date.now()){
  const cfg=R.data.IdleEarningRewardsConfigs[0];if(!R.featureAvailable('idle',this.state))return {available:false,ready:false,hours:0,rewards:{},hourly:hourly(this.state)};
  if(!Number.isFinite(this.m.idleAt)){const last=this.state.lastSeen||now;this.m.idleAt=Math.min(now,last);if(!this.m.idleStarted){this.m.idleAt=Math.min(this.m.idleAt,now-cfg._firstRewardTime*60000);this.m.idleStarted=true;}}
  const elapsed=Math.max(0,Math.min(cfg._idleRewardConfig._idleTime.y*60000,now-this.m.idleAt)),hours=elapsed/HOUR,rates=hourly(this.state);
  return {available:true,ready:elapsed>=cfg._idleRewardConfig._idleTime.x*60000,start:this.m.idleAt,end:now,elapsed,hours,maxHours:cfg._idleRewardConfig._idleTime.y/60,hourly:rates,rewards:rewards(rates,hours)};
 },
 claimIdle(quote,videoCompleted=false,multiplier=1,now=Date.now()){
  if(!quote||quote.start!==this.m.idleAt||quote.end>now||![1,2].includes(multiplier)||multiplier===2&&!videoCompleted)return false;
  const fresh=this.idleInfo(quote.end);if(!fresh.ready)return false;const value=Object.fromEntries(Object.entries(fresh.rewards).map(([k,n])=>[k,n*multiplier]));this.reward(value);this.m.idleAt=quote.end;this.m.lastOfflineReward=value.coins;return value;
 },
 instantIncome(now=Date.now(),videoCompleted=false){const status=this.instantStatus(now);if(!videoCompleted||!R.featureAvailable('idle',this.state)||!status.remaining)return false;const value=rewards(hourly(this.state),status.minutes/60);this.m.instantClaims++;this.reward(value);return value;}
});
/* The supplied APK omits remotely supplied free-slot values. Keep these own
 * daily allowances explicit; video claims have no daily ceiling. */
const gifts={coins:{free:3,amount:state=>Math.round(M.gain(S.currencyRates._data[0].RateBalances,(state.level||0)+1))},gems:{free:2,amount:()=>5},supply:{free:3,amount:()=>25}};
Object.assign(C.Economy.prototype,{
 resourceGift(kind,now=Date.now()){const cfg=gifts[kind];if(!cfg)return null;const day=T.day(now);if(this.c.giftDay!==day){this.c.giftDay=day;this.c.giftCounts={};}return {kind,amount:cfg.amount(this.state),remaining:Math.max(0,cfg.free-(this.c.giftCounts[kind]||0)),limit:cfg.free};},
 claimResourceGift(kind,videoCompleted=false,now=Date.now()){const offer=this.resourceGift(kind,now);if(!offer||!offer.remaining&&!videoCompleted)return false;if(offer.remaining)this.c.giftCounts[kind]=(this.c.giftCounts[kind]||0)+1;this.reward({[kind]:offer.amount});return {[kind]:offer.amount};}
});
const api={core,hourly,rewards,gifts};g.TerraProgression=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
