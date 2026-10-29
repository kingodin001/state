/* Adapters for extracted data. Native executable code and SDKs are not included. */
(function(g){'use strict';
const S=g.TerraSource||(typeof require!=='undefined'?require('./reference/config.js'):null),C=g.TerraCollection||(typeof require!=='undefined'?require('./collection.js'):null),M=g.TerraSourceMath||(typeof require!=='undefined'?require('./source-math.js'):null);
const hex=c=>'#'+['r','g','b'].map(k=>Math.round(c[k]*255).toString(16).padStart(2,'0')).join(''),term=id=>S.terms[id]?.ru||S.terms[id]?.en||'';
const leaderIds=['l_0','l_1','l_2','l_3','l_berserk','l_biohazard','l_cryomancer','l_production'],leaders=['Маршал','Диверсант','Навигатор','Хранитель','Берсерк','Алхимик','Хрономант','Механик'],native=new Map(S.skins.map(x=>[x.nativeId,x]));
const colors=S.skins.filter(x=>x.category==='color').sort((a,b)=>a.nativeId==='c_0'?-1:b.nativeId==='c_0'?1:a.nativeId.localeCompare(b.nativeId,undefined,{numeric:true}));
C.RARITIES.splice(0,C.RARITIES.length,...S.rarities.map((r,i)=>({...r,name:['ОБЫЧНЫЙ','НЕОБЫЧНЫЙ','РЕДКИЙ','ЭПИЧЕСКИЙ','ЛЕГЕНДАРНЫЙ'][i],color:hex(r.color)})));
for(const it of C.CATALOG){const id=it.category==='leader'?leaderIds[it.index]:it.category==='color'?colors[it.index]?.nativeId:it.category==='fighter'&&it.index===30?'f_phoenix':it.id[0]+'_'+it.index,src=native.get(id);if(!src)continue;Object.assign(it,{nativeId:id,source:src,rarity:src._rarity,maxLevel:src._upgradesMaxLevel||0,sourceSprite:src.sprite,sourcePreview:src.preview,description:term(src._descriptionLocalizedString?.mTerm)});if(it.category==='leader')it.name=leaders[it.index];}
const palettes=S.palettes.stl_1_origin;C.COLORS.splice(0,C.COLORS.length,...colors.map(x=>hex(palettes[x.nativeId].Area.Color)));
const Base=C.Economy;
class SourceEconomy extends Base{
 constructor(state){super(state);this.c.sourceStyle=this.c.sourceStyle||'stl_1_origin';this.source=true;}
 unlockNeed(id){return this.item(id)?.category==='color'?0:1;}
 priceRow(id,level){const it=this.item(id),rows=S.skinUpgrades._upgradesData.find(x=>x._id===it.source?._costsId)?._pricesData._prices;return rows?.find(x=>x.Level===level)||{Cost:0,Fragments:0};}
 unlockCost(id){const p=this.priceRow(id,1);return {coins:p.Cost,shards:p.Fragments};}
 upgradeCost(id){const p=this.priceRow(id,this.inventory(id).level+1);return {coins:p.Cost,shards:p.Fragments};}
 buyCard(id){const it=this.item(id);if(!it)return false;const inv=this.inventory(id);if(inv.owned)return this.equip(id);if(it.source?._isAvailable===0)return false;if(it.category==='color')return super.buyCard(id);const p=this.unlockCost(id);if(inv.shards<p.shards||!this.spend('coins',p.coins))return false;this.c.cards[id]={...inv,owned:true,level:1,shards:inv.shards-p.shards};return true;}
 upgrade(id){const it=this.item(id),inv=this.inventory(id),p=this.upgradeCost(id);if(!it||!inv.owned||inv.level>=it.maxLevel||inv.shards<p.shards||!this.spend('coins',p.coins))return false;inv.shards-=p.shards;inv.level++;return true;}
 bonuses(){const stats={10:0,11:0,12:0,14:0,15:0};for(const cat of ['base','fighter','leader']){const it=this.item(this.c.equipped[cat]),inv=this.inventory(it.id);for(const r of it.source?._roleStats?._roleStats||[]){const p=r._stat._data.find(x=>x.Level===inv.level)||r._stat._data.at(-1);if(p)stats[r._upgradeType]=(stats[r._upgradeType]||0)+p.Value;}}
 const leader=this.item(this.c.equipped.leader),skill=leader.source?.skills.find(x=>/^Leader.*SkillConfig$/.test(x.kind)),lv=this.inventory(leader.id).level,p=skill?.data?._stat?._data?.find(x=>x.Level===lv)||skill?.data?._stat?._data?.at(-1);
 return {start:Math.floor(M.upgrade(11,this.state.upgrades[0])*stats[11]),production:stats[12],speed:1+stats[14],limit:Math.floor(M.upgrade(10,this.state.upgrades[3])*(1+stats[10])),duplicate:stats[15],leader:leader.index,sourceLeader:skill?{kind:skill.kind,...p}:null,sourcePassives:stats};}
}
C.Economy=SourceEconomy;
function file(name){const ids=g.TerraAssets?.names[name];return ids?.length?g.TerraAssets.sprites[ids[0]].file:null;}
function image(id,extra=''){const x=g.TerraAssets?.sprites[id];return x?'<img class="source-art '+extra+'" src="'+x.file+'" alt="" draggable="false">':'';}
function vectorForArt(index){const item=C.CATALOG.find(x=>x.art===index&&x.category!=='color');return g.TerraAssets?.sprites[item?.sourceSprite];}
const oldArt=C.art;C.art=function(i,hue=0,extra=''){const it=C.CATALOG.find(x=>x.art===i&&x.category!=='color');if(it&&g.TerraAssets?.sprites[it.sourcePreview||it.sourceSprite])return image(it.sourcePreview||it.sourceSprite,'art '+extra+' source-preview');if(i===12||i===13){const path=file(i===12?'Booster_MINI_Blue':hue?'Booster_MINI_Red':'Booster_MINI_Gold');if(path)return '<img class="art source-art '+extra+'" src="'+path+'" alt="" draggable="false">';}return oldArt(i,hue,extra);};
g.TerraSourceRuntime={...M,term,hex,leaderIds,native,file,image,vectorForArt,SourceEconomy};if(typeof module!=='undefined')module.exports=g.TerraSourceRuntime;
})(globalThis);
