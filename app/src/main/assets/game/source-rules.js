/* Rules selected from the APK's serialized configuration. No native SDKs. */
(function(g){'use strict';
if(typeof module!=='undefined')require('./reference/meta-config.js');
const D=g.TerraSourceMeta,groups=k=>D[k]?.[0]?._groups||[],records=k=>D[k]||[];
const group=(kind,id)=>groups(kind).find(x=>x._id===id);
function select(kind,id,ordinal=0,random=()=>.5,excluded=[]){const x=group(kind,id);if(!x)throw Error('Unknown source group '+kind+':'+id);const pool=x._items.filter(i=>!excluded.includes(i));if(!pool.length)throw Error('Empty source group '+id);return pool[x._selectionMode===0?Math.min(pool.length-1,Math.floor(random()*pool.length)):ordinal%pool.length];}
function bot(stage,ordinal,random=()=>.5,playerColor='c_0',usedColors=[]){
 const cfg=stage?._bots;if(!cfg)return null;
 const id=select('BotPresetsGroupsConfig',cfg.PresetGroupId,ordinal,random),preset=['BotPresetV3','BotPresetV4','BotPresetV5'].flatMap(records).find(x=>x.m_Name===id);
 const behaviorId=select('BotBehavioursGroupsConfig',cfg.BehaviourGroupId,ordinal,random),behavior=records('BotBehaviourConfig').find(x=>x.m_Name===behaviorId);
 if(!preset||!behavior)throw Error('Missing source bot '+id);
 const skins={};for(const [key,field]of Object.entries({base:'BuildingGroupId',fighter:'FighterGroupId',leader:'LeaderGroupId',color:'ColorGroupId'})){const id=cfg.Skins[field],x=group('BotSkinsGroupsConfig',id),excluded=key==='color'&&[11,21].includes(x?._selectionMode)?[playerColor,...(x._selectionMode===21?usedColors:[])]:[];skins[key]=select('BotSkinsGroupsConfig',id,ordinal,random,excluded);}
 return {preset,behavior,skins};
}
const chestIds={basic:'booster_1',royal:'booster_0',legend:'booster_store_2',onboarding:'onboarding_booster_1'};
function chest(type){const id=chestIds[type],config=records('BoosterConfig').find(x=>x._id===id),store=records('BoostersStoreGroupConfig')[0]?._items.find(x=>x._boosterId===id);return config?{id,config,price:store?._price??null,currency:store?._costType===64?'gems':null,rolls:config._dropsData._rollsCountRange.x}:null;}
const rarityNames=['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY'];
function weighted(rows,random){const sum=rows.reduce((n,r)=>n+r._weight,0);if(sum<=0)return null;let pick=random()*sum;for(const r of rows){pick-=r._weight;if(pick<0)return r;}return rows.at(-1);}
const api={data:D,group,select,bot,chest,chestIds,rarityNames,weighted,range:(range,random)=>range.x+(range.y-range.x)*random()};g.TerraSourceRules=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
