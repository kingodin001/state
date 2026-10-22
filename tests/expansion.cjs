const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const campaign=require('../app/src/main/assets/game/campaign.js'),C=require('../app/src/main/assets/game/collection.js'),{Meta}=require('../app/src/main/assets/game/meta.js'),{Battle}=require('../app/src/main/assets/game/engine.js');
function fresh(extra={}){const state={coins:0,wins:0,captures:0,sent:0,completed:[],stars:{},upgrades:[0,0,0,0],...extra};campaign.normalize(state);const eco=new C.Economy(state),meta=new Meta(eco);return {state,eco,meta};}
function fixture(options={}){return new Battle({seed:2,cap:50,enemyRate:0,aiInterval:9999,regions:[{id:0,owner:1,units:30,center:[0,0],kind:'normal'},{id:1,owner:0,units:5,center:[400,300],kind:'normal'},{id:2,owner:2,units:20,center:[1000,0],kind:'normal'}],...options});}
function advance(b,t){for(let i=0;i<Math.round(t*40);i++)b.step(.025);}
test('200 unique scenarios use all twenty maps, valid chapters, increasing long-term enemy strength and bounded rewards',()=>{
 assert.equal(campaign.levels.length,200);assert.equal(campaign.templates.length,20);assert.equal(new Set(campaign.levels.map(l=>l.template)).size,20);
 const sig=new Set();for(const l of campaign.levels){sig.add(JSON.stringify([l.template,l.regions.map(r=>[r.owner,r.units,r.kind])]));assert.equal(l.chapter,Math.floor(l.index/10));assert(l.enemyRate>0&&l.enemyRate<=1.1);assert(l.aiInterval>=2);assert(l.regions.some(r=>r.owner===1));assert(l.regions.some(r=>r.owner>1));const reward=campaign.reward(l.index);assert(reward.gems>=8&&reward.gems<=16&&reward.shards<=10);}
 assert.equal(sig.size,200);assert(campaign.levels[199].enemyRate>campaign.levels[20].enemyRate);assert(campaign.levels[199].aiInterval<campaign.levels[20].aiInterval);
});
test('Five-level saves unlock level six, retain currencies, purchases and old income upgrade without a reset',()=>{
 const old={level:4,unlocked:4,completed:[0,1,2,3,4],coins:432,gems:78,upgrades:[2,3,4],stars:{0:3},owned:{base:[0,1]}};campaign.normalize(old);assert.equal(old.unlocked,5);assert.equal(old.level,4);assert.deepEqual(old.upgrades,[2,3,4,0]);const e=new C.Economy(old);assert(e.inventory('b1').owned);const before=old.coins;campaign.normalize(old);new C.Economy(old);assert.equal(old.coins,before);assert.equal(old.upgrades[2],4);
 const completed=Array.from({length:200},(_,i)=>i);assert.equal(campaign.normalize({level:200,unlocked:200,completed}).level,199);
});
test('Catalog matches the discovered category counts and uses a different art rectangle for every base, fighter and leader',()=>{
 for(const [category,n]of [['base',33],['fighter',31],['leader',8],['color',12]]){const items=C.CATALOG.filter(i=>i.category===category);assert.equal(items.length,n);if(category!=='color')assert.equal(new Set(items.map(i=>C.sheet(i.art)+':'+C.rect(i.art).join(':'))).size,n);}
 assert.equal(new Set(C.CATALOG.map(i=>i.id)).size,84);
 for(const item of C.CATALOG){const [x,y,w,h]=C.rect(item.art);assert(x>=0&&y>=0&&x+w<=1254.01&&y+h<=1254.01);assert(fs.existsSync(path.join(__dirname,'../app/src/main/assets/game',C.sheet(item.art))));assert(!C.art(item.art).includes('NaN'));}
});
test('Capacity upgrade increases the production cap and preserves the separate offline income upgrade',()=>{const {state,eco}=fresh();state.upgrades[3]=4;state.upgrades[2]=7;assert.equal(eco.bonuses().limit,70);assert.equal(state.upgrades[2],7);});
test('Fog hides distant populations and scouts reveal them without changing the actual defenders',()=>{
 const b=fixture({fog:true,vision:330});assert(b.visible(1,0));assert(!b.visible(1,2));b.units.push({owner:1,x:900,y:0});assert(b.visible(1,2));assert.equal(b.regions[2].units,20);assert(b.visible(2,2));
});
test('Slow terrain changes movement by the specified factor, not departure cadence or army size',()=>{
 const a=fixture(),b=fixture({zones:[{x:0,y:0,radius:2000,factor:.55}]});a.production=0;b.production=0;a.command([0],2);b.command([0],2);advance(a,.1);advance(b,.1);const ax=a.units[0].x,bx=b.units[0].x;advance(a,1);advance(b,1);assert(Math.abs((b.units[0].x-bx)/(a.units[0].x-ax)-.55)<.02);assert.equal(a.units.length,b.units.length);assert.equal(a.totals()[1],b.totals()[1]);
});
test('Timed races end according to actual territories, with troops as tie breaker',()=>{
 const a=fixture({timeLimit:.5});a.regions[1].owner=1;advance(a,.5);assert.equal(a.result,'win');const b=fixture({timeLimit:.5});b.regions[1].owner=2;advance(b,.5);assert.equal(b.result,'lose');
});
test('Alchemist only poisons hostile bases, consumes one charge and cannot capture with poison alone',()=>{
 const b=fixture();b.leaderType=4;assert(!b.activateLeader(0));assert(!b.activateLeader(1));b.regions[2].units=5;assert(b.activateLeader(2));advance(b,8);assert.equal(b.regions[2].units,0);assert.equal(b.regions[2].owner,2);assert.equal(b.leaderCharges,1);assert(!b.activateLeader(2));
});
test('Chronomancer accelerates existing player troops, Paladin protects only three allies, Artificer removes hostile troops in range',()=>{
 const a=fixture(),b=fixture();a.production=0;b.production=0;a.command([0],2);b.command([0],2);advance(a,.1);advance(b,.1);const ax=a.units[0].x,bx=b.units[0].x;b.leaderType=5;assert(b.activateLeader(0));advance(a,1);advance(b,1);assert(Math.abs((b.units[0].x-bx)/(a.units[0].x-ax)-1.4)<.03);
 const p=fixture();for(let i=3;i<6;i++)p.regions.push({id:i,x:i*20,y:0,owner:1,units:10});p.leaderType=6;assert(p.activateLeader(0));assert.equal(p.regions.filter(r=>r.shield>0).length,3);assert.equal(p.regions[2].shield,0);
 const e=fixture();e.leaderType=7;e.units=[{owner:2,x:50,y:0},{owner:2,x:250,y:0},{owner:1,x:50,y:0}];assert(e.activateLeader(0));assert.equal(e.units.length,2);assert.equal(e.stats.kills,1);assert(e.units.some(u=>u.owner===1));
});
test('Express tickets are granted once and resources cannot be overspent',()=>{const {state,eco}=fresh();assert.equal(state.tickets,3);new Meta(eco);assert.equal(state.tickets,3);assert(!eco.spend('tickets',4));assert(!eco.spend('tickets',-1));assert(eco.spend('tickets',1));assert.equal(state.tickets,2);});
test('Supply regeneration is capped at ten; purchased overflow is preserved',()=>{
 const {state,meta}=fresh(),start=Date.now();state.supply=6;meta.m.supplyAt=start;meta.refresh(start+3600000);assert.equal(state.supply,8);meta.refresh(start+6*3600000);assert.equal(state.supply,10);state.supply=30;meta.refresh(start+8*3600000);assert.equal(state.supply,30);
});
test('Wheel awards actual resources, respects its three-spin daily cap and survives serialization',()=>{
 const {state,eco,meta}=fresh(),now=Date.now();const prizes=[meta.spin(now),meta.spin(now),meta.spin(now)];assert(prizes.every(Boolean));assert.equal(meta.m.wheelSpins,3);const before=JSON.stringify(state);assert.equal(meta.spin(now),null);assert.equal(JSON.stringify(state),before);new Meta(eco);assert.equal(meta.spin(now),null);assert(meta.spin(now+86400000));for(const k of ['coins','gems','supply','tickets'])assert(state[k]>=0);
});
test('Starter bundles are atomic, one-time purchases and give the advertised chest and resources',()=>{
 const {state,eco,meta}=fresh();assert(meta.buyPack('starter'));assert.equal(state.coins,750);assert.equal(state.gems,75);assert.equal(state.tickets,5);assert.equal(eco.c.chests.royal,1);const snapshot=JSON.stringify(state);assert(!meta.buyPack('starter'));assert(!meta.buyPack('royal'));assert.equal(JSON.stringify(state),snapshot);
});
test('Currency exchange rates cannot create an unlimited round-trip profit',()=>{
 const {state,eco,meta}=fresh();state.coins=12000;state.gems=0;assert(meta.diamonds(3));assert.equal(state.gems,200);assert.equal(state.coins,0);assert(eco.exchange('coins',2));assert.equal(state.coins,4000);assert(state.gems<200);assert(!meta.diamonds(3));assert(state.coins<12000);
});
test('Daily offer slots persist, refreshes charge rising costs and have a daily limit',()=>{
 const {state,eco,meta}=fresh();state.gems=1000;assert(meta.unlockDailySlot());assert.equal(eco.dailyOffers().length,4);const before=eco.dailyOffers().map(o=>o.item.id);assert(meta.refreshOffers());assert.notDeepEqual(eco.dailyOffers().map(o=>o.item.id),before);assert(meta.refreshOffers());assert(meta.refreshOffers());assert(!meta.refreshOffers());new Meta(eco);assert.equal(eco.dailyOffers().length,4);assert(!meta.refreshOffers());
});
test('Weekly rewards require real progress, cannot be claimed twice and persist after reload',()=>{
 const {state,eco,meta}=fresh();assert(!meta.claimWeekly('wins'));state.wins=12;const gems=state.gems,tickets=state.tickets;assert(meta.claimWeekly('wins'));assert.equal(state.gems,gems+60);assert.equal(state.tickets,tickets+2);new Meta(eco);assert(!meta.claimWeekly('wins'));
});
test('Timed chest slots allow one active opening; a ticket completes exactly one chest',()=>{
 const {state,eco,meta}=fresh(),now=Date.now();assert(meta.addChest(4));assert(meta.addChest(9));assert(meta.startSlot(0,now));assert(!meta.startSlot(1,now));assert(!meta.claimSlot(0,now));const tickets=state.tickets;assert(meta.speedSlot(0,now));assert.equal(state.tickets,tickets-1);const n=eco.c.chests.basic;assert(meta.claimSlot(0,now));assert.equal(eco.c.chests.basic,n+1);assert(!meta.claimSlot(0,now));assert(meta.startSlot(1,now));
});
test('Instant income spends crystals once per cooldown and never credits the same purchase twice',()=>{
 const {state,meta}=fresh(),now=Date.now();const coins=state.coins;assert.equal(meta.instantIncome(now),200);assert.equal(state.coins,coins+200);assert(!meta.instantIncome(now));assert(meta.instantIncome(now+4*3600000));
});
test('Album migration is one-time, duplicates become stars, packs consume stock and set rewards cannot repeat',()=>{
 const {state,eco,meta}=fresh({completed:[0,1],stars:{0:3,1:2}});assert.equal(meta.m.albumStars,5);new Meta(eco);assert.equal(meta.m.albumStars,5);meta.grantSticker(0);assert.equal(meta.m.albumStars,6);meta.m.albumStars=20;assert(meta.buyStickerPack());assert.equal(meta.m.albumStars,0);assert.equal(meta.openStickerPack().length,3);assert.equal(meta.openStickerPack(),null);for(let i=0;i<4;i++)meta.grantSticker(i);assert(meta.claimStickerSet(0));const before=JSON.stringify(state);assert(!meta.claimStickerSet(0));assert.equal(JSON.stringify(state),before);
});
test('Offline league records actual duel results, bounds losses at zero and keeps race records',()=>{
 const {meta}=fresh(),battle={stats:{captured:7}};meta.result('duel',true,battle);assert.equal(meta.m.rating,25);meta.result('duel',false,battle);assert.equal(meta.m.rating,13);meta.result('duel',false,battle);meta.result('duel',false,battle);assert.equal(meta.m.rating,0);assert.equal(meta.m.duels,4);assert.equal(meta.m.duelWins,1);meta.result('rush',false,battle);assert.equal(meta.m.bestRush,7);
});
