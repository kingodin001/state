(function(g){'use strict';
const C=TerraCollection,$=id=>document.getElementById(id),art=C.art;
function create(h){
 const {data,eco,icon}=h;let tab='play',category='base',filter='all',lastResult=null;
 const names={base:'БАЗЫ',fighter:'БОЙЦЫ',leader:'ЛИДЕРЫ',color:'ЦВЕТА'};
 function wallet(){for(const k of ['coins','gems','supply'])$(k).textContent=Math.floor(data[k]).toLocaleString('ru-RU');loadout();}
 function changed(){h.save();wallet();h.updateMenu();}
 function currency(k,n){return '<span class="cost '+k+'">'+(k==='gems'?'<i class="gem-symbol"></i>':k==='supply'?'<i class="bolt-symbol">ϟ</i>':icon('coin'))+'<b>'+n+'</b></span>';}
 function title(n,desc=''){return '<div class="hub-title"><h1>'+n+'</h1>'+(desc?'<small>'+desc+'</small>':'')+'</div>';}
 function button(text,attrs='',cl='green-button'){return '<button class="'+cl+'" '+attrs+'>'+text+'</button>';}
 function loadout(){if(!$('main-loadout'))return;$('main-loadout').innerHTML=['base','fighter','leader'].map(cat=>{const it=eco.item(eco.c.equipped[cat]),inv=eco.inventory(it.id);return '<button data-preview="'+it.id+'" style="--rarity:'+C.RARITIES[it.rarity].color+'">'+art(it.art,it.hue)+'<small>УР. '+inv.level+'</small></button>';}).join('');}
 function home(){tab='play';$('hub-screen').hidden=true;$('global-nav').hidden=false;$('main-loadout').hidden=false;document.querySelectorAll('#global-nav button').forEach(b=>b.classList.toggle('active',b.id==='nav-world'));wallet();}
 function open(next,cat){
  tab=next;if(cat)category=cat;h.closeModal(false);$('hub-screen').hidden=false;$('menu-top').hidden=true;$('menu-bottom').hidden=true;$('side-menu').hidden=true;$('main-loadout').hidden=true;$('map-caption').hidden=true;$('global-nav').hidden=false;
  document.querySelectorAll('#global-nav button').forEach(b=>b.classList.toggle('active',b.id===({store:'nav-store',arsenal:'nav-army',albums:'nav-albums',events:'nav-events'}[next])));
  wallet();render();$('hub-screen').scrollTop=0;
 }
 function render(){if(tab==='store')store();else if(tab==='arsenal')arsenal();else if(tab==='albums')albums();else if(tab==='events')events();}
 function cardTile(it){
  const inv=eco.inventory(it.id),selected=eco.c.equipped[it.category]===it.id,cost=inv.owned?eco.upgradeCost(it.id):{shards:eco.unlockNeed(it.id)},can=inv.owned&&inv.level<10&&inv.shards>=cost.shards&&data.coins>=cost.coins;
  return '<button class="collect-card rarity-'+it.rarity+(selected?' equipped':'')+(!inv.owned?' not-owned':'')+'" data-card="'+it.id+'" style="--rarity:'+C.RARITIES[it.rarity].color+'"><div class="rarity-label">'+C.RARITIES[it.rarity].name+'</div>'+(it.category==='color'?'<span class="paint-orb" style="--paint:'+C.COLORS[it.index]+'"></span>':art(it.art,it.hue))+'<b class="card-name">'+it.name+'</b><div class="card-level">'+(inv.owned?'УР. '+inv.level:inv.shards?'ФРАГМЕНТЫ':'НЕ ОТКРЫТО')+'</div><div class="fragment-bar"><i style="width:'+Math.min(100,inv.shards/cost.shards*100)+'%"></i><small>'+inv.shards+' / '+cost.shards+'</small></div>'+(selected?'<i class="equipped-badge">✓</i>':can?'<i class="upgrade-badge">↑</i>':'')+'</button>';
 }
 function arsenal(){
  const selected=eco.item(eco.c.equipped[category]),inv=eco.inventory(selected.id),items=C.CATALOG.filter(it=>it.category===category&&(filter!=='owned'||eco.inventory(it.id).owned));
  $('hub-screen').innerHTML=title('АРСЕНАЛ','Собирай • улучшай • побеждай')+'<div class="arsenal-preview rarity-'+selected.rarity+'"><div class="preview-rays"></div><div class="preview-copy"><small>'+C.RARITIES[selected.rarity].name+'</small><h2>'+selected.name+'</h2><span>УРОВЕНЬ '+inv.level+'</span>'+button('ПОДРОБНЕЕ','data-card="'+selected.id+'"','blue-button')+'</div>'+(category==='color'?'<span class="paint-orb" style="--paint:'+C.COLORS[selected.index]+'"></span>':art(selected.art,selected.hue))+'</div><div class="arsenal-tabs">'+Object.entries(names).map(([key,name])=>'<button data-category="'+key+'" class="'+(category===key?'active':'')+'">'+name+'</button>').join('')+'</div><div class="collection-summary"><b>КОЛЛЕКЦИЯ '+C.CATALOG.filter(it=>it.category===category&&eco.inventory(it.id).owned).length+' / '+C.CATALOG.filter(it=>it.category===category).length+'</b><button id="collection-filter">'+(filter==='owned'?'ТОЛЬКО МОИ':'ВСЕ КАРТОЧКИ')+' ▾</button></div><div class="collection-grid">'+items.map(cardTile).join('')+'</div><p class="hub-footnote">Фрагменты из сундуков повышают уровень карточек.</p>';
 }
 function details(id){
  const it=eco.item(id);if(!it)return;const inv=eco.inventory(id),cost=eco.upgradeCost(id),selected=eco.c.equipped[it.category]===id;
  let desc=it.category==='base'?'Новая база появляется на карте. Каждый уровень даёт +2 стартовых бойца и +3 к пределу гарнизона.':it.category==='fighter'?'Твоя армия использует этот облик. Каждый уровень повышает скорость перемещения на 2,5%.':it.category==='color'?'Этот цвет используется для твоих областей, отрядов и счётчиков.':[
   'Маршал усиливает стартовый отряд. Его приказ отправляет дополнительные подкрепления на свою базу.',
   'Навигатор временно замораживает производство вражеской базы. Выбери красную или другую вражескую базу.',
   'Хранитель защищает свою базу щитом. Во время действия щита вражеские бойцы не наносят урон.',
   'Механик ускоряет производство армии. Его приказ даёт временный производственный рывок всем твоим базам.'
  ][it.index%4];
  const currencyKey=it.category==='leader'?'gems':'coins',price=currencyKey==='gems'?Math.ceil(it.price/5):it.price;
  h.openModal('card',h.head('КАРТОЧКА')+'<div class="card-detail rarity-'+it.rarity+'"><span class="detail-rarity">'+C.RARITIES[it.rarity].name+'</span><div class="detail-art">'+(it.category==='color'?'<span class="paint-orb" style="--paint:'+C.COLORS[it.index]+'"></span>':art(it.art,it.hue))+'</div><h2>'+it.name+'</h2><b class="detail-level">'+(inv.owned?'УРОВЕНЬ '+inv.level:'НОВАЯ КАРТОЧКА')+'</b></div><p class="detail-description">'+desc+'</p><div class="detail-stats"><div><small>ФРАГМЕНТЫ</small><b>'+inv.shards+' / '+cost.shards+'</b></div><div><small>РЕДКОСТЬ</small><b>'+['★','★★','★★★','★★★★'][it.rarity]+'</b></div></div>'+(inv.owned?button(selected?'ВЫБРАНО':'ВЫБРАТЬ','data-equip="'+id+'"'+(selected?' disabled':''))+(it.category!=='color'?button(inv.level>=10?'МАКСИМАЛЬНЫЙ УРОВЕНЬ':'УЛУЧШИТЬ '+currency('coins',cost.coins),'data-upgrade-card="'+id+'" '+(inv.level>=10||inv.shards<cost.shards||data.coins<cost.coins?'disabled':''),'gold-button'):''):button(inv.shards>=eco.unlockNeed(id)?'СОБРАТЬ ЗА ФРАГМЕНТЫ':'ОТКРЫТЬ '+currency(currencyKey,price),'data-buy-card="'+id+'"'))+'<button class="secondary" data-shop-link>Сундуки и фрагменты в магазине</button>');
 }
 function chestCard(type,name,cost,rarity,qty){return '<article class="chest-card rarity-'+rarity+'"><h3>'+name+'</h3>'+art(type==='basic'?12:13,type==='legend'?42:0)+'<small>'+qty+' КАРТОЧКИ • РЕСУРСЫ</small>'+button(currency('gems',cost),'data-chest-buy="'+type+'"')+'</article>';}
 function store(){
  eco.refresh();const claimed=eco.c.giftClaimed===eco.c.dailyDay,has=Object.values(eco.c.chests).reduce((a,b)=>a+b,0);
  $('hub-screen').innerHTML=title('МАГАЗИН','Припасы для твоей империи')+'<section class="welcome-offer"><div><span class="offer-ribbon">ЕЖЕДНЕВНЫЙ ПОДАРОК</span><h2>Запасы для победы</h2><p>80 монет + 8 кристаллов + 1 запас</p>'+button(claimed?'ПОЛУЧЕНО':'ЗАБРАТЬ БЕСПЛАТНО','data-shop-gift '+(claimed?'disabled':''))+'</div>'+art(12)+'</section>'+(has?'<section class="owned-chests"><div><b>ТВОИ СУНДУКИ</b><small>Готовы к открытию: '+has+'</small></div>'+Object.entries(eco.c.chests).filter(([k,n])=>n>0).map(([k,n])=>'<button data-chest-open="'+k+'">'+art(k==='basic'?12:13)+'<i>'+n+'</i><small>ОТКРЫТЬ</small></button>').join('')+'</section>':'')+'<div class="section-heading"><h2>ЕЖЕДНЕВНЫЕ ПРЕДЛОЖЕНИЯ</h2><small>Обновление каждый день</small></div><div class="daily-offers">'+eco.dailyOffers().map(o=>'<article class="daily-offer rarity-'+o.item.rarity+'"><span class="offer-count">×'+o.shards+'</span>'+art(o.item.art,o.item.hue)+'<b>'+o.item.name+'</b><small>ФРАГМЕНТЫ</small>'+button(o.bought?'ПОЛУЧЕНО':currency('coins',o.cost),'data-daily-offer="'+o.slot+'" '+(o.bought?'disabled':''))+'</article>').join('')+'</div><div class="section-heading"><h2>СУНДУКИ</h2><button data-chest-help>?</button></div><div class="chests-grid">'+chestCard('basic','ОБЫЧНЫЙ',25,1,3)+chestCard('royal','ЭПИЧЕСКИЙ',65,2,4)+chestCard('legend','ЛЕГЕНДАРНЫЙ',140,3,5)+'</div><div class="featured-bundle"><span class="offer-ribbon">КОМАНДИР НЕДЕЛИ</span>'+art(2)+'<div><small>ЛЕГЕНДА ТВОЕЙ АРМИИ</small><h2>ХРАНИТЕЛЬ</h2><p>Щит для своей базы</p>'+button(eco.inventory('l2').owned?'В АРСЕНАЛЕ':'ОТКРЫТЬ '+currency('gems',66),'data-card="l2"','gold-button')+'</div></div><div class="section-heading"><h2>МОНЕТЫ</h2><small>Обмен кристаллов</small></div><div class="exchange-grid">'+[500,1500,4000].map((n,i)=>'<article class="exchange-card">'+art(14)+'<b>'+n.toLocaleString('ru-RU')+'</b>'+button(currency('gems',[20,50,120][i]),'data-exchange="coins:'+i+'"','blue-button')+'</article>').join('')+'</div><div class="section-heading"><h2>ПРИПАСЫ И УСИЛЕНИЯ</h2></div><div class="exchange-grid">'+[3,10,30].map((n,i)=>'<article class="exchange-card supply-pack"><span class="supply-crate">ϟ</span><b>'+n+' ПРИПАСОВ</b>'+button(currency('gems',[10,25,60][i]),'data-exchange="supply:'+i+'"','blue-button')+'</article>').join('')+'</div><div class="booster-shop">'+['reinforce','shield'].map(k=>'<article><span class="booster-icon">'+icon(k==='shield'?'shield':'plus')+'</span><div><b>'+(k==='shield'?'Защитный щит':'Подкрепление')+'</b><small>В запасе: '+eco.c.boosters[k]+'</small></div>'+button(currency('gems',12),'data-booster="'+k+'"','blue-button')+'</article>').join('')+'</div><p class="hub-footnote">Кристаллы зарабатываются в сражениях, заданиях и альбомах.<br>Все предложения используют игровые ресурсы.</p>';
 }
 function chest(type){
  if(!eco.c.chests[type])return;
  h.openModal('chest',h.head('ТВОЙ СУНДУК')+'<div class="chest-opening rarity-'+(type==='basic'?1:type==='royal'?2:3)+'"><div class="preview-rays"></div>'+art(type==='basic'?12:13,type==='legend'?42:0)+'<h2>'+({basic:'Сундук командира',royal:'Эпический сундук',legend:'Легендарный сундук'}[type])+'</h2><p>Карточки и ресурсы уже ждут тебя</p></div>'+button('ОТКРЫТЬ','data-reveal-chest="'+type+'"'));
 }
 function reveal(type){
  const loot=eco.openChest(type);if(!loot)return;lastResult=loot;changed();
  h.openModal('loot',h.head('НАГРАДЫ!')+'<div class="loot-resources">'+currency('coins',loot.coins)+currency('gems',loot.gems)+currency('supply',loot.supply)+'</div><div class="loot-grid">'+loot.cards.map((r,i)=>{const it=eco.item(r.id);return '<div class="loot-card rarity-'+it.rarity+'" style="animation-delay:'+i*.09+'s">'+art(it.art,it.hue)+'<b>'+it.name+'</b><small>'+(r.unlocked?'НОВАЯ КАРТОЧКА':'+'+r.count+' ФРАГМЕНТОВ')+'</small></div>';}).join('')+'</div>'+button('ЗАБРАТЬ','data-loot-close'));
  h.tone(880,.2);
 }
 function albums(){
  const owned=eco.c.album.length,claimed=eco.c.albumClaims.length;
  $('hub-screen').innerHTML=title('АЛЬБОМЫ','История твоих завоеваний')+'<div class="album-cover"><div class="album-emblem">'+icon('world')+'</div><div><small>ПЕРВЫЙ СЕЗОН</small><h2>НОВЫЙ МИР</h2><p>Побеждай в пяти кампаниях и собери альбом.</p></div><div class="album-progress"><i style="width:'+owned/5*100+'%"></i><b>'+owned+' / 5</b></div></div><div class="sticker-grid">'+TERRA_LEVELS.map((l,i)=>{const have=eco.c.album.includes(i),done=eco.c.albumClaims.includes(i);return '<button class="sticker '+(have?'collected':'missing')+'" data-album="'+i+'"><span class="sticker-no">0'+(i+1)+'</span>'+art([0,4,2,7,1][i])+'<b>'+l.name+'</b><small>'+(done?'НАГРАДА ПОЛУЧЕНА':have?'ЗАБРАТЬ НАГРАДУ':'ПОБЕДИ В УРОВНЕ '+(i+1))+'</small></button>';}).join('')+'<div class="sticker album-reward">'+art(13)+'<b>ПОЛНАЯ КОЛЛЕКЦИЯ</b><small>5 / 5 КАМПАНИЙ</small></div></div><div class="album-prizes"><h3>НАГРАДЫ ЗА КОЛЛЕКЦИЮ</h3><p>За каждый новый стикер: 15 кристаллов и 60 монет.</p><b>Получено наград: '+claimed+' / 5</b></div>';
 }
 function events(){
  const ops=eco.operations();$('hub-screen').innerHTML=title('ОПЕРАЦИИ','Каждый день — новый вызов')+'<section class="operation-banner">'+art(1)+'<div><span class="offer-ribbon">ЕЖЕДНЕВНАЯ ОПЕРАЦИЯ</span><h2>ТАКТИЧЕСКИЙ РЕЙД</h2><p>Победи на знакомой карте с усиленным противником.</p>'+button('НАЧАТЬ '+currency('supply',1),'data-start-operation')+'</div></section><div class="section-heading"><h2>ЕЖЕДНЕВНЫЕ ЗАДАНИЯ</h2><small>Обновление каждый день</small></div><div class="operation-list">'+ops.map(op=>'<article class="operation-item"><div class="operation-medal">'+icon(op.id==='wins'?'trophy':op.id==='capture'?'flag':'units')+'</div><div><b>'+op.title+'</b><div class="quest-progress"><i style="width:'+Math.min(100,op.value/op.goal*100)+'%"></i><small>'+Math.min(op.goal,op.value)+' / '+op.goal+'</small></div><span>'+Object.entries(op.reward).map(([k,n])=>currency(k,n)).join('')+'</span></div>'+button(op.claimed?'✓':op.value>=op.goal?'ЗАБРАТЬ':'В БОЙ','data-operation="'+op.id+'" '+(op.claimed?'disabled':''))+'</article>').join('')+'</div><section class="event-path"><span class="event-badge">'+icon('trophy')+'</span><div><small>ПУТЬ ЗАВОЕВАТЕЛЯ</small><h2>Пять кампаний</h2><p>Победы, карточки и награды за достижения</p>'+button('ОТКРЫТЬ ЗАДАНИЯ','data-achievements','blue-button')+'</div></section><div class="event-stats"><div><b>'+data.wins+'</b><small>ПОБЕД</small></div><div><b>'+data.captures+'</b><small>ЗАХВАТОВ</small></div><div><b>'+C.CATALOG.filter(it=>eco.inventory(it.id).owned).length+'</b><small>КАРТОЧЕК</small></div></div>';
 }
 function fail(msg='Недостаточно ресурсов'){h.toast(msg);h.tone(180,.05);}
 function handle(e){
  const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
  if(d.category){category=d.category;filter='all';arsenal();}
  else if(b.id==='collection-filter'){filter=filter==='all'?'owned':'all';arsenal();}
  else if(d.card)details(d.card);
  else if(d.preview)details(d.preview);
  else if(d.buyCard){if(!eco.buyCard(d.buyCard)){fail();return;}eco.equip(d.buyCard);changed();details(d.buyCard);h.tone(680);}
  else if(d.equip){if(eco.equip(d.equip)){changed();details(d.equip);}}
  else if(d.upgradeCard){if(eco.upgrade(d.upgradeCard)){changed();details(d.upgradeCard);h.tone(840,.15);}else fail('Нужны монеты и фрагменты');}
  else if('shopLink'in d){open('store');}
  else if('shopGift'in d){if(eco.claimShopGift()){changed();store();h.toast('+80 монет, +8 кристаллов, +1 припас');h.tone(900);}}
  else if(d.dailyOffer!==undefined){if(eco.buyOffer(+d.dailyOffer)){changed();store();}else fail();}
  else if(d.chestBuy){if(eco.buyChest(d.chestBuy)){changed();chest(d.chestBuy);}else fail();}
  else if(d.chestOpen)chest(d.chestOpen);
  else if(d.revealChest)reveal(d.revealChest);
  else if('lootClose'in d){h.closeModal();if(tab!=='play')render();wallet();}
  else if(d.exchange){const [type,i]=d.exchange.split(':');if(eco.exchange(type,+i)){changed();store();h.tone(700);}else fail();}
  else if(d.booster){if(eco.buyBooster(d.booster)){changed();store();}else fail();}
  else if(d.album!==undefined){const i=+d.album;if(eco.claimAlbum(i)){changed();albums();h.toast('+15 кристаллов и +60 монет');}else h.toast(eco.c.album.includes(i)?'Награда уже получена':'Пройди соответствующую кампанию');}
  else if('achievements'in d)h.showTasks();
  else if('chestHelp'in d)h.openModal('info',h.head('СУНДУКИ')+'<p class="detail-description">Обычный сундук: 3 стопки фрагментов и ресурсы.<br><br>Эпический: 4 стопки и новая карточка эпической или легендарной редкости, если она ещё не открыта.<br><br>Легендарный: 5 стопок и новая легендарная карточка, если она ещё не открыта.<br><br>Содержимое определяется при открытии. Если выпала уже открытая карточка, остаются фрагменты и ресурсы.</p>');
  else if('startOperation'in d){if(!eco.spend('supply',1)){fail('Нужен 1 припас. Получи его в магазине или наградах.');return;}changed();home();h.playOperation();}
  else if(d.operation){const op=eco.operations().find(o=>o.id===d.operation);if(op&&op.value>=op.goal){if(eco.claimOperation(op.id)){changed();events();h.tone(850);}}else{home();h.showMenu();}}
 }
 $('hub-screen').addEventListener('click',handle);$('panel-content').addEventListener('click',handle);$('main-loadout').addEventListener('click',handle);
 $('nav-store').onclick=()=>open('store');$('nav-army').onclick=()=>open('arsenal');$('nav-world').onclick=()=>{home();h.showMenu();};$('nav-albums').onclick=()=>open('albums');$('nav-events').onclick=()=>open('events');
 $('wallet-coins').onclick=()=>open('store');$('wallet-gems').onclick=()=>open('store');$('wallet-supply').onclick=()=>open('store');$('leader').onclick=()=>open('arsenal','leader');$('quests').onclick=h.showTasks;
 $('nav-store').querySelector('span').innerHTML=art(12);$('nav-army').querySelector('span').innerHTML=art(4);$('nav-world').querySelector('span').innerHTML=icon('world');$('nav-albums').querySelector('span').innerHTML='<span class="album-nav-icon">★</span>';$('nav-events').querySelector('span').innerHTML=icon('trophy');$('quests').querySelector('span').innerHTML=icon('tasks');$('leader').querySelector('span').innerHTML=art(0);$('gift').querySelector('span').innerHTML=art(12);
 return {open,home,wallet,render,details,get tab(){return tab;},back(){if(tab!=='play'){home();h.showMenu();return true;}return false;}};
}
g.TerraScreens={create};
})(typeof globalThis!=='undefined'?globalThis:this);
