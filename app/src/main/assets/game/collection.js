/* Terra Storm collectible economy. All purchases use earned in-game resources. */
(function(g){'use strict';
const RARITIES=[{name:'ОБЫЧНЫЙ',color:'#6b8dc8'},{name:'РЕДКИЙ',color:'#239deb'},{name:'ЭПИЧЕСКИЙ',color:'#a24ce3'},{name:'ЛЕГЕНДАРНЫЙ',color:'#f3a92c'}];
const COLORS=['#4ab4f8','#f05f65','#65be55','#aa68f0','#f2b93c','#29c4c2','#ef78bf','#ec8744','#3267d1','#98cf35','#df516e','#7c76e9'];
const CATALOG=[];
const names={base:['Синий бастион','Астральный шпиль','Дворец солнца','Радарный пост','Ледяная цитадель','Обсидиановая башня','Золотой оазис','Нефритовый дозор','Небесный замок','Башня гроз','Имперская крепость','Звёздный маяк','Мраморный храм','Медная кузница','Коралловый дворец','Серебряный форт','Башня знаний','Лесной оплот','Караван-сарай','Морской бастион','Изумрудная обсерватория','Лаборатория эфира','Рубиновый дворец','Часовая цитадель','Бронзовый зиккурат','Розовый маяк','Солнечный зеркальник','Лунный храм','Врата дракона','Паровая крепость','Жемчужный замок','Сапфировая башня','Дворец короны'],fighter:['Гвардеец','Искра','Сокол','Байт','Полярный страж','Комета','Стрекоза','Кибер','Королевский гвардеец','Метеор','Феникс','Титан','Грозовой танк','Лунный рыцарь','Шершень','Нефритовый голем','Алый грифон','Аквадрон','Механический скорпион','Светлый медик','Эфирный страж','Серебряный орёл','Осадный танк','Механический лев','Паук-часовщик','Ледяной дракон','Морской дозор','Лесной лучник','Плазменный страж','Реактивный сокол','Розовый паладин'],leader:['Маршал','Навигатор','Хранитель','Механик','Алхимик','Хрономант','Паладин','Изобретатель'],color:['Лазурь','Коралл','Нефрит','Аметист','Золото','Бирюза','Роза','Янтарь','Сапфир','Лайм','Рубин','Сирень']};
for(const category of ['base','fighter','leader','color'])names[category].forEach((name,i)=>{
 const group=category==='leader'?Math.floor(i/2):i<12?Math.floor(i/3):Math.floor((i-12)/5),rarity=Math.min(3,group);
 const art=category==='base'?(i<4?4+i:16+i-4):category==='fighter'?(i<4?8+i:48+i-4):category==='leader'?(i<4?i:80+i-4):15;
 CATALOG.push({id:category[0]+i,category,index:i,name,rarity,art,hue:0,price:category==='leader'?180+i*75:category==='color'?75+i*20:100+i*45});
});

function day(now=Date.now()){const d=new Date(now);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function sheet(i){return i<16?'art/terra-collection.webp':i<32?'art/bases-a.webp':i<48?'art/bases-b.webp':i<64?'art/fighters-a.webp':i<80?'art/fighters-b.png':'art/leaders.webp';}
function rect(i){if(i>=16){const count=i>=80?2:4,n=i>=80?i-80:(i-16)%16,size=1254/count;return [n%count*size,Math.floor(n/count)*size,size,size];}const edges=[0,350,665,955,1254],row=Math.floor(i/4),col=i%4;return [col*313.5,edges[row],313.5,edges[row+1]-edges[row]];}
function art(i,hue=0,extra=''){const [x,y,w,h]=rect(i),px=x/(1254-w)*100,py=y/(1254-h)*100;return '<span class="art '+extra+'" style="background-image:url(\''+sheet(i)+'\');background-size:'+1254/w*100+'% '+1254/h*100+'%;background-position:'+px+'% '+py+'%;'+(hue?'filter:hue-rotate('+hue+'deg)':'')+'" aria-hidden="true"></span>';}

class Economy{
 constructor(state){
  this.state=state;
  if(!state.collection){
   state.collection={cards:{},equipped:{base:'b0',fighter:'f0',leader:'l0',color:'c0'},dailyDay:'',dailyBought:[],chests:{basic:1,royal:0,legend:0},giftClaimed:'',boosters:{reinforce:0,shield:0},album:[],albumClaims:[],operationsClaimed:[],opProgress:{},seed:1743};
   state.gems=120;state.supply=6;state.coins+=250;state.profileName='Командир';
   for(const id of ['b0','f0','l0','c0'])state.collection.cards[id]={owned:true,level:1,shards:0};
   for(const category of ['base','fighter','color'])for(const i of state.owned?.[category]||[]){const id=category[0]+i;if(this.item(id))state.collection.cards[id]={owned:true,level:1,shards:0};}
   for(const category of ['base','fighter','color']){const id=category[0]+(state[category]||0);if(state.collection.cards[id]?.owned)state.collection.equipped[category]=id;}
   if(state.leaderOwned1)state.collection.cards.l1={owned:true,level:1,shards:0};if(state.leaderOwned2)state.collection.cards.l2={owned:true,level:1,shards:0};
  }
  state.gems=Math.max(0,Math.floor(state.gems||0));state.supply=Math.max(0,Math.floor(state.supply||0));this.refresh();
 }
 get c(){return this.state.collection;} item(id){return CATALOG.find(x=>x.id===id);} inventory(id){return this.c.cards[id]||{owned:false,level:0,shards:0};}
 refresh(now=Date.now()){
  const today=day(now);if(this.c.dailyDay!==today){this.c.dailyDay=today;this.c.dailyBought=[];this.c.dailyRefresh=0;this.c.opProgress={day:today,wins:this.state.wins||0,captures:this.state.captures||0,sent:this.state.sent||0};}
 }
 spend(currency,amount){if(!['coins','gems','supply','tickets'].includes(currency)||!Number.isSafeInteger(amount)||amount<0||!Number.isFinite(this.state[currency])||this.state[currency]<amount)return false;this.state[currency]-=amount;return true;}
 reward(rewards){for(const [k,n]of Object.entries(rewards))if(['coins','gems','supply','tickets'].includes(k)&&Number.isFinite(n)&&n>0)this.state[k]=(this.state[k]||0)+Math.floor(n);}
 unlockNeed(id){return 8*(this.item(id).rarity+1);}
 buyCard(id){const item=this.item(id);if(!item)return false;if(this.inventory(id).owned)return this.equip(id);const frag=this.inventory(id);if(frag.shards>=this.unlockNeed(id)){frag.shards-=this.unlockNeed(id);frag.owned=true;frag.level=1;return true;}const currency=item.category==='leader'?'gems':'coins',price=item.category==='leader'?Math.ceil(item.price/5):item.price;if(!this.spend(currency,price))return false;const old=this.inventory(id);this.c.cards[id]={owned:true,level:1,shards:old.shards};return true;}
 equip(id){const item=this.item(id);if(!item||!this.inventory(id).owned)return false;this.c.equipped[item.category]=id;this.state[item.category]=item.index;return true;}
 upgradeCost(id){const n=this.inventory(id).level;return {coins:60*n*(this.item(id).rarity+1),shards:3+n*2};}
 upgrade(id){const inv=this.inventory(id),cost=this.upgradeCost(id);if(!inv.owned||inv.level>=10||inv.shards<cost.shards||!this.spend('coins',cost.coins))return false;inv.shards-=cost.shards;inv.level++;return true;}
 grantShards(id,n){const inv=this.c.cards[id]||(this.c.cards[id]={owned:false,level:0,shards:0});inv.shards+=n;return {id,count:n};}
 random(){let s=this.c.seed>>>0;s=(Math.imul(s,1664525)+1013904223)>>>0;this.c.seed=s;return s/4294967296;}
 buyChest(type){const costs={basic:25,royal:65,legend:140};if(!(type in costs)||!this.spend('gems',costs[type]))return false;this.c.chests[type]++;return true;}
 openChest(type){
  if(!['basic','royal','legend'].includes(type)||!this.c.chests[type])return null;this.c.chests[type]--;
  const tier=type==='basic'?0:type==='royal'?1:2,reward={coins:50+tier*100+Math.floor(this.random()*50),gems:3+tier*5,supply:1+tier};this.reward(reward);
  const cards=[];for(let i=0;i<3+tier;i++){const pool=CATALOG.filter(c=>c.category!=='color'&&(c.source?._isAvailable!==0)&&c.rarity<=Math.min(3,tier+1));const item=pool[Math.floor(this.random()*pool.length)],n=3+tier*3+Math.floor(this.random()*4);cards.push(this.grantShards(item.id,n));}
  if(tier>0){const pool=CATALOG.filter(c=>c.category!=='color'&&(c.source?._isAvailable!==0)&&c.rarity>=tier);const item=pool[Math.floor(this.random()*pool.length)];if(!this.inventory(item.id).owned){const inv=this.inventory(item.id);this.c.cards[item.id]={...inv,owned:true,level:1};cards.push({id:item.id,count:1,unlocked:true});}}
  return {type,...reward,cards};
 }
 dailyOffers(){this.refresh();const seed=[...this.c.dailyDay].reduce((a,b)=>a+b.charCodeAt(0),0)+(this.c.dailyRefresh||0)*17;return Array.from({length:this.c.dailySlots||3},(_,i)=>i).map(i=>{const pool=CATALOG.filter(c=>c.category!=='color');const item=pool[(seed*7+i*13)%pool.length];return {slot:i,item,shards:5+i*3,cost:60+i*55,bought:this.c.dailyBought.includes(i)};});}
 buyOffer(slot){const o=this.dailyOffers().find(o=>o.slot===slot);if(!o||o.bought||!this.spend('coins',o.cost))return false;this.grantShards(o.item.id,o.shards);this.c.dailyBought.push(slot);return true;}
 claimShopGift(){this.refresh();if(this.c.giftClaimed===this.c.dailyDay)return false;this.c.giftClaimed=this.c.dailyDay;this.reward({coins:80,gems:8,supply:1});return true;}
 exchange(type,index){const rows={coins:[[20,500],[50,1500],[120,4000],[240,9000]],supply:[[10,3],[25,10],[60,30],[110,60],[200,120]]},p=rows[type]?.[index];if(!p||!this.spend('gems',p[0]))return false;this.state[type]+=p[1];return true;}
 buyBooster(type){if(!['reinforce','shield'].includes(type)||!this.spend('gems',12))return false;this.c.boosters[type]++;return true;}
 operations(){this.refresh();const d=this.c.opProgress;return [{id:'wins',title:'Выиграй 2 сражения',goal:2,value:Math.max(0,this.state.wins-d.wins),reward:{gems:15,supply:2}},{id:'capture',title:'Захвати 15 территорий',goal:15,value:Math.max(0,this.state.captures-d.captures),reward:{coins:180,gems:8}},{id:'sent',title:'Отправь 250 бойцов',goal:250,value:Math.max(0,this.state.sent-d.sent),reward:{coins:120,gems:10}}].map(x=>({...x,key:this.c.dailyDay+':'+x.id,claimed:this.c.operationsClaimed.includes(this.c.dailyDay+':'+x.id)}));}
 claimOperation(id){const op=this.operations().find(x=>x.id===id);if(!op||op.claimed||op.value<op.goal)return false;this.reward(op.reward);this.c.operationsClaimed.push(op.key);return true;}
 victory(level,campaign=true){
  const reward=g.TerraCampaign?g.TerraCampaign.reward(level):{gems:8+Math.min(4,Math.floor(level/5))*2,supply:1,shards:3+Math.min(7,Math.floor(level/10))};this.reward({gems:reward.gems,supply:reward.supply});const sticker=level;
  if(campaign&&!this.c.album.includes(sticker))this.c.album.push(sticker);
  const owned=CATALOG.filter(x=>this.inventory(x.id).owned&&x.category!=='color');const chosen=owned[Math.floor(this.random()*owned.length)];if(chosen)this.grantShards(chosen.id,reward.shards);
  this.c.chests.basic++;
 }
 claimAlbum(index){if(!this.c.album.includes(index)||this.c.albumClaims.includes(index))return false;this.reward({gems:15,coins:60});this.c.albumClaims.push(index);return true;}
 bonuses(){const get=cat=>{const item=this.item(this.c.equipped[cat]),inv=this.inventory(item.id);return {item,level:inv.level};};const b=get('base'),f=get('fighter'),l=get('leader');return {start:Math.max(0,b.level-1)*2+(l.item.index%4===0?l.level+2:0),production:l.item.index%4===3?.1+.02*(l.level-1):0,speed:1+.025*(f.level-1),limit:50+Math.max(0,b.level-1)*3+(this.state.upgrades?.[3]||0)*5,leader:l.item.index};}
}
g.TerraCollection={Economy,CATALOG,RARITIES,COLORS,art,rect,sheet,day};if(typeof module!=='undefined')module.exports=g.TerraCollection;
})(typeof globalThis!=='undefined'?globalThis:this);
