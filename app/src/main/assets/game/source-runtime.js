/* Adapters for extracted data. Native executable code and SDKs are not included. */
(function(g){'use strict';
const S=g.TerraSource||(typeof require!=='undefined'?require('./reference/config.js'):null),C=g.TerraCollection||(typeof require!=='undefined'?require('./collection.js'):null),M=g.TerraSourceMath||(typeof require!=='undefined'?require('./source-math.js'):null);
const R=g.TerraSourceRules||(typeof require!=='undefined'?require('./source-rules.js'):null);
const hex=c=>'#'+['r','g','b'].map(k=>Math.round(c[k]*255).toString(16).padStart(2,'0')).join(''),term=id=>S.terms[id]?.ru||S.terms[id]?.en||'';
const leaderIds=['l_0','l_1','l_2','l_3','l_berserk','l_biohazard','l_cryomancer','l_production'],leaders=['Маршал','Диверсант','Навигатор','Хранитель','Берсерк','Алхимик','Хрономант','Механик'],native=new Map(S.skins.map(x=>[x.nativeId,x]));
const colors=S.skins.filter(x=>x.category==='color').sort((a,b)=>a.nativeId==='c_0'?-1:b.nativeId==='c_0'?1:a.nativeId.localeCompare(b.nativeId,undefined,{numeric:true}));
C.RARITIES.splice(0,C.RARITIES.length,...S.rarities.map((r,i)=>({...r,name:['ОБЫЧНЫЙ','НЕОБЫЧНЫЙ','РЕДКИЙ','ЭПИЧЕСКИЙ','ЛЕГЕНДАРНЫЙ'][i],color:hex(r.color)})));
for(const it of C.CATALOG){const id=it.category==='leader'?leaderIds[it.index]:it.category==='color'?colors[it.index]?.nativeId:it.category==='fighter'&&it.index===30?'f_phoenix':it.id[0]+'_'+it.index,src=native.get(id);if(!src)continue;Object.assign(it,{nativeId:id,source:src,rarity:src._rarity,maxLevel:src._upgradesMaxLevel||0,sourceSprite:src.sprite,sourcePreview:src.preview,description:term(src._descriptionLocalizedString?.mTerm)});if(it.category==='leader')it.name=leaders[it.index];}
const palettes=S.palettes.stl_1_origin;C.COLORS.splice(0,C.COLORS.length,...colors.map(x=>hex(palettes[x.nativeId].Area.Color)));
const Base=C.Economy;
class SourceEconomy extends Base{
 constructor(state){const fresh=!state.collection,coins=state.coins||0;super(state);this.c.sourceStyle=this.c.sourceStyle||'stl_1_origin';this.source=true;if(fresh){state.coins=coins;state.gems=0;state.supply=0;this.c.chests={basic:0,royal:0,legend:0,onboarding:0};}this.c.sourceDropCounters=this.c.sourceDropCounters||{};this.c.sourceBonuses=this.c.sourceBonuses||Object.fromEntries(R.data.BonusConfig.map(x=>[x._bonusType,x._startAmount]));for(const it of C.CATALOG.filter(x=>x.category==='color'&&x.source?._isAvailable&&x.source?._isLocked===0)){if(!this.inventory(it.id).owned)this.c.cards[it.id]={...this.inventory(it.id),owned:true,level:1};}}
 visible(id){const it=this.item(id),s=it?.source;if(!s)return false;if(s._availabilityRule===2||(it.category!=='color'&&!s._hasCard))return false;return s._isAvailable!==0&&(s._availabilityRule!==1||this.inventory(id).owned);}
 droppable(id){const it=this.item(id),s=it?.source;if(!s||s._isAvailable===0||s._dropRule===2||!s._hasCard||it.category==='color')return false;return s._dropRule===1?this.inventory(id).owned:(this.state.level||0)+1>=s._playerLevelUnlock;}
 unlockNeed(id){return this.unlockCost(id).shards;}
 chestSpec(type){return R.chest(type);}
 buyChest(type){const x=this.chestSpec(type);if(!x||x.price===null||!this.spend(x.currency,x.price))return false;this.c.chests[type]=(this.c.chests[type]||0)+1;return true;}
 dropPool(target){const rarity=R.rarityNames.indexOf(target);return C.CATALOG.filter(x=>this.droppable(x.id)&&(rarity<0?x.nativeId===target:x.rarity===rarity));}
 openChest(type){
  const spec=this.chestSpec(type);if(!spec||!this.c.chests[type])return null;
  const rows=spec.config._dropsData._rewards,counters=this.c.sourceDropCounters[spec.id]||(this.c.sourceDropCounters[spec.id]={}),cards=[],reward={coins:0,gems:0,supply:0,tickets:0};
  const usable=r=>r._rewardType!==31||this.dropPool(r._rewardId).length;
  const grant=(r)=>{const n=Math.floor(r._amountRange.x+this.random()*(r._amountRange.y-r._amountRange.x+1));if(r._rewardType===31){const pool=this.dropPool(r._rewardId),it=pool[Math.floor(this.random()*pool.length)];if(it)cards.push(this.grantShards(it.id,n));}else if(r._rewardType===10){const k={Soft:'coins',Hard:'gems',Supply:'supply',Skipit:'tickets'}[r._rewardId];if(k)reward[k]+=n;}counters[r._rewardId]=0;};
  this.c.chests[type]--;for(const r of rows)counters[r._rewardId]=(counters[r._rewardId]||0)+1;
  // Guaranteed zero-weight rewards are additional to the configured random rolls.
  for(const r of rows.filter(r=>r._weight===0&&r._pityTimer>0&&counters[r._rewardId]>=r._pityTimer&&usable(r)))grant(r);
  const forced=rows.filter(r=>r._weight>0&&r._pityTimer>0&&counters[r._rewardId]>=r._pityTimer&&usable(r)).sort((a,b)=>b._pityTimer-a._pityTimer);
  for(let i=0;i<spec.rolls;i++){const r=forced.shift()||R.weighted(rows.filter(r=>r._weight>0&&usable(r)),()=>this.random());if(r)grant(r);}
  this.reward(reward);return {type,...reward,cards};
 }
 dailyOffers(){
  this.refresh();const stamp='source-v2:'+this.c.dailyDay+':'+(this.c.dailyRefresh||0),bonuses=R.data.BonusConfig.filter(x=>Math.max(this.state.level||0,this.state.unlocked||0)+1>=x._openFromLevel);
  if(this.c.sourceOfferStamp!==stamp){this.c.sourceOfferStamp=stamp;this.c.sourceOffers=R.data.DailySlotsStoreGroupConfig[0]._slots.map((slot,i)=>{const row=R.weighted(slot._rewards.filter(r=>r._rewardType===50?bonuses.length:r._rewardType===31&&this.dropPool(r._target).length),()=>this.random());const common={slot:i,shards:row?._amount||0,cost:slot._price,currency:'gems'};if(row?._rewardType===50)return {...common,type:'consumable',bonus:bonuses[Math.floor(this.random()*bonuses.length)]._bonusType};const pool=row?this.dropPool(row._target):[],it=pool[Math.floor(this.random()*pool.length)];return {...common,type:'fragments',itemId:it?.id};});}
  const names={0:['Дополнительная база','extra_base_big'],10:['Производство ×2','produce_speed_big'],100:['Скорость ×2','Movement_Speed_Icon']};
  return this.c.sourceOffers.map(o=>({...o,item:o.type==='consumable'?{id:'bonus'+o.bonus,name:names[o.bonus][0],bonusIcon:names[o.bonus][1],rarity:2}:this.item(o.itemId),bought:this.c.dailyBought.includes(o.slot)})).filter(o=>o.item);
 }
 buyOffer(slot){const o=this.dailyOffers().find(o=>o.slot===slot);if(!o||o.bought||!this.spend(o.currency,o.cost))return false;if(o.type==='consumable')this.c.sourceBonuses[o.bonus]=(this.c.sourceBonuses[o.bonus]||0)+o.shards;else this.grantShards(o.item.id,o.shards);this.c.dailyBought.push(slot);return true;}

 bonusConfigs(){return R.data.BonusConfig.map(x=>({...x,available:Math.max(this.state.level||0,this.state.unlocked||0)+1>=x._openFromLevel,amount:this.c.sourceBonuses[x._bonusType]||0}));}
 buySourceBonus(type){const x=this.bonusConfigs().find(x=>x._bonusType===type);if(!x||!x.available||!this.spend('gems',x._priceInHard))return false;this.c.sourceBonuses[type]=(this.c.sourceBonuses[type]||0)+1;return true;}
 validBonuses(types){return Array.isArray(types)&&types.length<=3&&new Set(types).size===types.length&&types.every(type=>this.bonusConfigs().some(x=>x._bonusType===type&&x.available&&x.amount>0));}
 consumeBonuses(types){if(!this.validBonuses(types))return false;for(const type of types)this.c.sourceBonuses[type]--;return true;}
 packOffers(type){const kind={coins:'SoftPacksStoreGroupConfig',supply:'SupplyPacksStoreGroupConfig',gems:'HardPacksStoreGroupConfig',tickets:'SkipitPacksStoreGroupConfig'}[type];return (R.data[kind]?.[0]?._items||[]).map(row=>({price:row._price,currency:row._costType===64?'gems':null,amount:row._costType===8?(row.payouts||[]).filter(p=>p.t==='Currency').reduce((n,p)=>n+p.q,0):type==='coins'?Math.round(M.gain(S.currencyRates._data[0].RateBalances,(this.state.level||0)+1)*row._reward):row._reward,productKey:row.productKey,available:row._costType===64}));}
 exchange(type,index){const o=this.packOffers(type)[index];if(!o||!o.available||!this.spend(o.currency,o.price))return false;this.reward({[type]:o.amount});return true;}
 victory(level,campaign=true){if(!campaign)return;const cfg=R.data.LevelsStagesRewardsConfig[0],id=(g.TerraCampaign||(typeof require!=='undefined'?require('./campaign.js'):null)).get(level).sourceStageConfig._winRewardsId,row=cfg._data.find(x=>x._id===id);for(const ref of row?._rewardsCollectionData._rewards||[]){const r=cfg.references.RefIds.find(x=>String(x.rid)===String(ref.rid));if(r?.type.class==='SkinsBoosterRewardData'){const key=Object.keys(R.chestIds).find(k=>R.chestIds[k]===r.data._boosterId);if(key)this.c.chests[key]=(this.c.chests[key]||0)+r.data._amount;}}if(!this.c.album.includes(level))this.c.album.push(level);}
 stageReward(level){const cfg=R.data.LevelsStagesRewardsConfig[0],id=(g.TerraCampaign||(typeof require!=='undefined'?require('./campaign.js'):null)).get(level).sourceStageConfig._winRewardsId,row=cfg._data.find(x=>x._id===id);return (row?._rewardsCollectionData._rewards||[]).reduce((n,ref)=>{const r=cfg.references.RefIds.find(x=>String(x.rid)===String(ref.rid));return n+(r?.type.class==='CurrencyByLevelRewardData'&&r.data._currencyType==='Soft'?Math.round(M.gain(S.currencyRates._data[0].RateBalances,level+1)*r.data._amount):0);},0);}

 pvpReward(won){const row=R.data.PvpRewardsMetaConfigs[0][won?'_rewardsForWin':'_rewardsForLose']._softFactor;return Math.round(Math.fround(M.gain(S.currencyRates._data[0].RateBalances,(this.state.level||0)+1)*(row.x+this.random()*(row.y-row.x))));}
 defeatReward(level){return Math.round(Math.fround(M.gain(S.currencyRates._data[0].RateBalances,level+1)*R.data.MetaConfig[0]._levelLoseRewardMultiplier));}
 priceRow(id,level){const it=this.item(id),rows=S.skinUpgrades._upgradesData.find(x=>x._id===it.source?._costsId)?._pricesData._prices;return rows?.find(x=>x.Level===level)||{Cost:0,Fragments:0};}
 cardCost(p){const currency=R.data.InventoryConfig[0]._remoteConfigData._isSupplyCurrencyEnabled?'supply':'coins';return {currency,amount:p.Cost,coins:currency==='coins'?p.Cost:0,supply:currency==='supply'?p.Cost:0,shards:p.Fragments};}
 unlockCost(id){return this.cardCost(this.priceRow(id,1));}
 upgradeCost(id){return this.cardCost(this.priceRow(id,this.inventory(id).level+1));}
 buyCard(id){const it=this.item(id);if(!it)return false;const inv=this.inventory(id);if(inv.owned)return this.equip(id);if(it.source?._isAvailable===0||it.category==='color'&&it.source?._isLocked)return false;if(it.source?._unlockRule===0)return false;if(it.source?._unlockRule===2&&(this.state.level||0)+1<it.source._playerLevelUnlock)return false;const p=this.unlockCost(id);if(inv.shards<p.shards||!this.spend(p.currency,p.amount))return false;this.c.cards[id]={...inv,owned:true,level:1,shards:inv.shards-p.shards};return true;}
 upgrade(id){const it=this.item(id),inv=this.inventory(id),p=this.upgradeCost(id);if(!it||!inv.owned||inv.level>=it.maxLevel||inv.shards<p.shards||!this.spend(p.currency,p.amount))return false;inv.shards-=p.shards;inv.level++;return true;}
 bonuses(){const stats={10:0,11:0,12:0,14:0,15:0};for(const cat of ['base','fighter','leader']){const it=this.item(this.c.equipped[cat]),inv=this.inventory(it.id);for(const r of it.source?._roleStats?._roleStats||[]){const p=r._stat._data.find(x=>x.Level===inv.level)||r._stat._data.at(-1);if(p)stats[r._upgradeType]=(stats[r._upgradeType]||0)+p.Value;}}
 const leader=this.item(this.c.equipped.leader),skill=leader.source?.skills.find(x=>/^Leader.*SkillConfig$/.test(x.kind)),lv=this.inventory(leader.id).level,p=skill?.data?._stat?._data?.find(x=>x.Level===lv)||skill?.data?._stat?._data?.at(-1);
 return {start:Math.floor(M.upgrade(11,this.state.upgrades[0])*stats[11]),production:stats[12],speed:1+stats[14],limit:Math.floor(M.upgrade(10,this.state.upgrades[3])*(1+stats[10])),duplicate:stats[15],leader:leader.index,sourceLeader:skill?{kind:skill.kind,...p}:null,sourceSkills:['base','fighter'].flatMap(cat=>{const it=this.item(this.c.equipped[cat]),lv=this.inventory(it.id).level;return (it.source?.skills||[]).map(x=>({kind:x.kind,...(x.data?._stat?._data?.find(r=>r.Level===lv)||x.data?._stat?._data?.at(-1)||{})}));}),sourcePassives:stats};}
}
C.Economy=SourceEconomy;
function file(name){const ids=g.TerraAssets?.names[name];return ids?.length?g.TerraAssets.sprites[ids[0]].file:null;}
function image(id,extra=''){const x=g.TerraAssets?.sprites[id];return x?'<img class="source-art '+extra+'" src="'+x.file+'" alt="" draggable="false">':'';}
function vectorForArt(index){const item=C.CATALOG.find(x=>x.art===index&&x.category!=='color');return g.TerraAssets?.sprites[item?.sourceSprite];}
const oldArt=C.art;C.art=function(i,hue=0,extra=''){const it=C.CATALOG.find(x=>x.art===i&&x.category!=='color');if(it?.category==='leader'&&it.nativeId!=='l_0')return '<img class="source-art art own-leader '+extra+'" src="art/leaders/'+it.nativeId+'.webp" alt="" draggable="false">';if(it&&g.TerraAssets?.sprites[it.sourcePreview||it.sourceSprite])return image(it.sourcePreview||it.sourceSprite,'art '+extra+' source-preview');if(i===12||i===13){const path=file(i===12?'Booster_MINI_Blue':hue?'Booster_MINI_Gold':'Booster_MINI_Red');if(path)return '<img class="art source-art '+extra+'" src="'+path+'" alt="" draggable="false">';}return oldArt(i,hue,extra);};
g.TerraSourceRuntime={...M,term,hex,leaderIds,native,file,image,vectorForArt,SourceEconomy};if(typeof module!=='undefined')module.exports=g.TerraSourceRuntime;
})(globalThis);
