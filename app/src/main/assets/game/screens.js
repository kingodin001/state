(function(g){'use strict';
const C=TerraCollection,$=id=>document.getElementById(id),art=C.art;
function create(h){
 const {data,eco,icon,meta,features}=h;let tab='play',category='base',filter='all',lastResult=null,albumPage=0;
 const names={leader:'ЛИДЕРЫ',fighter:'БОЙЦЫ',base:'БАЗЫ'};
 function wallet(){meta.refresh();for(const k of ['coins','gems','supply','tickets'])$(k).textContent=TerraUI.short(data[k]);loadout();}
 function changed(){h.save();wallet();h.updateMenu();}
 function currency(k,n){return TerraUI.amount(k,n);}
 function title(n,desc=''){return '<div class="hub-title"><h1>'+n+'</h1>'+(desc?'<small>'+desc+'</small>':'')+'</div>';}
 function button(text,attrs='',cl='green-button'){return '<button class="'+cl+'" '+attrs+'>'+text+'</button>';}
 function loadout(){if(!$('main-loadout'))return;$('main-loadout').innerHTML=['base','fighter','leader'].map(cat=>{const it=eco.item(eco.c.equipped[cat]),inv=eco.inventory(it.id);return '<button data-preview="'+it.id+'" style="--rarity:'+C.RARITIES[it.rarity].color+'">'+art(it.art,it.hue)+'<small>УР. '+inv.level+'</small></button>';}).join('');}
 function home(){tab='play';$('meta-shortcuts').hidden=false;$('hub-screen').hidden=true;$('global-nav').hidden=false;$('main-loadout').hidden=false;document.querySelectorAll('#global-nav button').forEach(b=>b.classList.toggle('active',b.id==='nav-world'));wallet();}
 function open(next,cat){
  tab=next;$('hub-screen').dataset.view=next;$('meta-shortcuts').hidden=true;if(cat)category=cat;h.closeModal(false);$('hub-screen').hidden=false;$('menu-top').hidden=true;$('menu-bottom').hidden=true;$('side-menu').hidden=true;$('main-loadout').hidden=true;$('map-caption').hidden=true;$('global-nav').hidden=false;
  document.querySelectorAll('#global-nav button').forEach(b=>b.classList.toggle('active',b.id===({store:'nav-store',arsenal:'nav-army',albums:'nav-albums',events:'nav-events',upgrades:'nav-upgrades'}[next])));
  wallet();render();$('hub-screen').scrollTop=0;
 }
 function render(){if(tab==='store')store();else if(tab==='arsenal')arsenal();else if(tab==='albums')albums();else if(tab==='events')events();else if(tab==='upgrades')upgrades();TerraLayout.apply();}
 function cardTile(it){
  if(it.category==='color'){const inv=eco.inventory(it.id),selected=eco.c.equipped.color===it.id;return '<button class="collect-card color-card '+(selected?'equipped':'')+'" data-card="'+it.id+'"><span class="paint-orb" style="--paint:'+C.COLORS[it.index]+'"></span><b class="card-name">'+it.name+'</b><small>'+(selected?'ВЫБРАНО':inv.owned?'ВЫБРАТЬ':'ВИДЕО')+'</small>'+(selected?'<i class="equipped-badge">✓</i>':'')+'</button>';}
  const inv=eco.inventory(it.id),selected=eco.c.equipped[it.category]===it.id,cost=inv.owned?eco.upgradeCost(it.id):{shards:eco.unlockNeed(it.id)},can=inv.owned&&inv.level<it.maxLevel&&inv.shards>=cost.shards&&data[cost.currency]>=cost.amount;
  return '<button class="collect-card rarity-'+it.rarity+(selected?' equipped':'')+(!inv.owned?' not-owned':'')+'" data-card="'+it.id+'" style="--rarity:'+C.RARITIES[it.rarity].color+'"><div class="rarity-label">'+C.RARITIES[it.rarity].name+'</div>'+(it.category==='color'?'<span class="paint-orb" style="--paint:'+C.COLORS[it.index]+'"></span>':art(it.art,it.hue))+'<b class="card-name">'+it.name+'</b><div class="card-level">'+(inv.owned?'УР. '+inv.level:inv.shards?'ФРАГМЕНТЫ':'НЕ ОТКРЫТО')+'</div><div class="fragment-bar"><i style="width:'+Math.min(100,inv.shards/Math.max(1,cost.shards)*100)+'%"></i><small>'+inv.shards+' / '+cost.shards+'</small></div>'+(selected?'<i class="equipped-badge">✓</i>':can?'<i class="upgrade-badge">↑</i>':'')+'</button>';
 }
 function arsenal(){
  const selected=eco.item(eco.c.equipped[category]),inv=eco.inventory(selected.id),items=C.CATALOG.filter(it=>it.category===category&&eco.visible(it.id)&&(filter!=='owned'||eco.inventory(it.id).owned));
  $('hub-screen').innerHTML=title('АРСЕНАЛ','Собирай • улучшай • побеждай')+'<div class="arsenal-preview rarity-'+selected.rarity+'"><div class="preview-rays"></div><div class="preview-copy"><small>'+C.RARITIES[selected.rarity].name+'</small><h2>'+selected.name+'</h2><span>УРОВЕНЬ '+inv.level+'</span>'+button('ПОДРОБНЕЕ','data-card="'+selected.id+'"','blue-button')+'</div>'+(category==='color'?'<span class="paint-orb" style="--paint:'+C.COLORS[selected.index]+'"></span>':art(selected.art,selected.hue))+'</div><button class="color-shortcut" data-color-panel><i style="background:'+C.COLORS[data.color%C.COLORS.length]+'"></i>ЦВЕТА</button><button class="color-shortcut" data-feature="styles">СТИЛЬ КАРТЫ</button><div class="arsenal-tabs">'+Object.entries(names).map(([key,name])=>'<button data-category="'+key+'" class="'+(category===key?'active':'')+'">'+name+'</button>').join('')+'</div><div class="collection-summary"><b>КОЛЛЕКЦИЯ '+C.CATALOG.filter(it=>it.category===category&&eco.inventory(it.id).owned).length+' / '+C.CATALOG.filter(it=>it.category===category&&eco.visible(it.id)).length+'</b><button id="collection-filter">'+(filter==='owned'?'ТОЛЬКО МОИ':'ВСЕ КАРТОЧКИ')+' ▾</button></div><div class="collection-grid">'+items.map(cardTile).join('')+'</div><p class="hub-footnote">Фрагменты из сундуков повышают уровень карточек.</p>';
 }
 function details(id){
  const it=eco.item(id);if(!it)return;const inv=eco.inventory(id),cost=eco.upgradeCost(id),selected=eco.c.equipped[it.category]===id;
  if(it.category==='color'){h.openModal('color',h.head('ЦВЕТ')+'<div class="source-color-detail"><span class="paint-orb" style="--paint:'+C.COLORS[it.index]+'"></span><h2>'+it.name+'</h2></div>'+(inv.owned?button(selected?'ВЫБРАНО':'ВЫБРАТЬ','data-equip="'+id+'"'+(selected?' disabled':'')):button('ОТКРЫТЬ — ВИДЕО','data-color-ad="'+id+'" disabled','blue-button')));return;}
  const desc=it.description||(it.category==='color'?'Цвет твоих территорий, гарнизонов и отрядов.':it.nativeId==='l_0'?'Базовый командир. Активного умения нет.':'Коллекционное оформление армии.');
  const currencyKey=eco.unlockCost(id).currency,price=eco.unlockCost(id).amount,labels={10:'ЛИМИТ',11:'СТАРТОВЫЙ ОТРЯД',12:'ПРОИЗВОДСТВО',14:'СКОРОСТЬ',15:'ДВОЙНОЙ БОЕЦ'};
  const stats=(it.source?._roleStats?._roleStats||[]).map(r=>[labels[r._upgradeType]||'БОНУС','+'+Math.round((r._stat._data.find(x=>x.Level===Math.max(1,inv.level))||r._stat._data[0]).Value*100)+'%']);
  const skill=it.source?.skills.find(x=>/^Leader/.test(x.kind)),record=skill?.data?._stat?._data?.find(x=>x.Level===Math.max(1,inv.level));if(record)stats.push(['ПЕРЕЗАРЯДКА',record.Cooldown+' с'],['ДЛИТЕЛЬНОСТЬ',record.Stat2+' с']);
  h.openModal('card',h.head('КАРТОЧКА')+'<div class="card-detail rarity-'+it.rarity+'"><span class="detail-rarity">'+C.RARITIES[it.rarity].name+'</span><div class="detail-art">'+(it.category==='color'?'<span class="paint-orb" style="--paint:'+C.COLORS[it.index]+'"></span>':art(it.art,it.hue))+'</div><h2>'+it.name+'</h2><b class="detail-level">'+(inv.owned?'УРОВЕНЬ '+inv.level:'НОВАЯ КАРТОЧКА')+'</b></div><p class="detail-description">'+desc+'</p><div class="card-ability-stats">'+stats.map(([name,val])=>'<div><small>'+name+'</small><b>'+val+'</b></div>').join('')+'</div><div class="detail-stats"><div><small>ФРАГМЕНТЫ</small><b>'+inv.shards+' / '+cost.shards+'</b></div><div><small>РЕДКОСТЬ</small><b>'+['★','★★','★★★','★★★★','★★★★★'][it.rarity]+'</b></div></div>'+(inv.owned?button(selected?'ВЫБРАНО':'ВЫБРАТЬ','data-equip="'+id+'"'+(selected?' disabled':''))+(it.maxLevel>0?button(inv.level>=it.maxLevel?'МАКСИМАЛЬНЫЙ УРОВЕНЬ':'УЛУЧШИТЬ '+currency(cost.currency,cost.amount),'data-upgrade-card="'+id+'" '+(inv.level>=it.maxLevel||inv.shards<cost.shards||data[cost.currency]<cost.amount?'disabled':''),'gold-button'):''):button('СОБРАТЬ '+currency(currencyKey,price)+' · '+eco.unlockNeed(id)+' ФРАГМЕНТ','data-buy-card="'+id+'"'+(inv.shards<eco.unlockNeed(id)||data[currencyKey]<price||(it.source?._isAvailable===0||it.category==='color'&&it.source?._isLocked)?' disabled':'')))+'<button class="secondary" data-shop-link>Сундуки и фрагменты в магазине</button>');
 }
 function chestCard(type,name,cost,rarity,qty){return '<article class="chest-card rarity-'+rarity+'"><h3>'+name+'</h3>'+art(type==='basic'||type==='onboarding'?12:13,type==='legend'?42:0)+'<small>'+qty+' КАРТОЧКИ • РЕСУРСЫ</small>'+button(currency('gems',cost),'data-chest-buy="'+type+'"')+'</article>';}
 function store(){
  eco.refresh();meta.refresh();const has=Object.values(eco.c.chests).reduce((a,b)=>a+b,0);
  const heading=(name,id)=>'<div class="section-heading" id="shop-'+id+'"><h2>'+name+'</h2></div>';
  const sections=[['starter','НАБОРЫ'],['boosters','СУНДУКИ'],['daily','НА ДЕНЬ'],['gems','КРИСТАЛЛЫ'],['coins','МОНЕТЫ'],['supply','ПРИПАСЫ'],['tickets','БИЛЕТЫ']];
  const owned=has?'<section class="owned-chests"><div><b>ТВОИ СУНДУКИ</b><small>Готовы к открытию: '+has+'</small></div>'+Object.entries(eco.c.chests).filter(([k,n])=>n>0).map(([k,n])=>'<button data-chest-open="'+k+'">'+art(k==='basic'||k==='onboarding'?12:13,k==='legend'?42:0)+'<i>'+n+'</i><small>ОТКРЫТЬ</small></button>').join('')+'</section>':'';
  const chests=[['basic','ОБЫЧНЫЙ',1],['royal','ЭПИЧЕСКИЙ',3],['legend','ЛЕГЕНДАРНЫЙ',4]].map(([type,name,rarity])=>{const x=eco.chestSpec(type);return chestCard(type,name,x.price,rarity,x.rolls);}).join('');
  const offers=eco.dailyOffers().map(o=>'<article class="daily-offer rarity-'+o.item.rarity+'"><span class="offer-count">×'+o.shards+'</span>'+(o.item.bonusIcon?'<img class="source-art art" src="'+TerraSourceRuntime.file(o.item.bonusIcon)+'" alt="">':art(o.item.art,o.item.hue))+'<b>'+o.item.name+'</b><small>'+(o.type==='consumable'?'УСИЛЕНИЕ':'ФРАГМЕНТЫ')+'</small>'+button(o.bought?'ПОЛУЧЕНО':currency(o.currency,o.cost),'data-daily-offer="'+o.slot+'" '+(o.bought?'disabled':''))+'</article>').join('');
  $('hub-screen').innerHTML=title('МАГАЗИН')+'<div class="shop-sections">'+sections.map(([id,label])=>'<button data-shop-section="'+id+'">'+label+'</button>').join('')+'</div>'+heading('ОСОБЫЕ НАБОРЫ','starter')+features.starter()+features.consumables()+heading('СУНДУКИ И КАРТОЧКИ','boosters')+owned+'<div class="chests-grid">'+chests+'</div>'+heading('ЕЖЕДНЕВНЫЕ ПРЕДЛОЖЕНИЯ','daily')+'<div class="daily-refresh"><span>Новый ассортимент каждый день</span>'+button('ОБНОВИТЬ — ВИДЕО','data-daily-refresh disabled','blue-button')+'</div><div class="daily-offers">'+offers+'</div>'+heading('КРИСТАЛЛЫ','gems')+features.packs('gems')+heading('МОНЕТЫ','coins')+features.packs('coins')+heading('ПРИПАСЫ','supply')+features.packs('supply')+heading('ЭКСПРЕСС-БИЛЕТЫ','tickets')+features.packs('tickets')+'<p class="hub-footnote">Платные наборы станут доступны после подключения оплаты.</p>';
 }

 function chest(type){
  if(!eco.c.chests[type])return;
  h.openModal('chest',h.head('ТВОЙ СУНДУК')+'<div class="chest-opening rarity-'+(type==='basic'?1:type==='royal'?2:3)+'"><div class="preview-rays"></div>'+art(type==='basic'||type==='onboarding'?12:13,type==='legend'?42:0)+'<h2>'+({basic:'Сундук командира',royal:'Эпический сундук',legend:'Легендарный сундук',onboarding:'Первый сундук командира'}[type])+'</h2><p>Карточки и ресурсы уже ждут тебя</p></div>'+button('ОТКРЫТЬ','data-reveal-chest="'+type+'"'));
 }
 function reveal(type){
  const loot=eco.openChest(type);if(!loot)return;lastResult=loot;changed();
  h.openModal('loot',h.head('НАГРАДЫ!')+'<div class="loot-resources">'+currency('coins',loot.coins||0)+currency('gems',loot.gems||0)+currency('supply',loot.supply||0)+'</div><div class="loot-grid">'+loot.cards.map((r,i)=>{const it=eco.item(r.id);return '<div class="loot-card rarity-'+it.rarity+'" style="animation-delay:'+i*.09+'s">'+art(it.art,it.hue)+'<b>'+it.name+'</b><small>'+(r.unlocked?'НОВАЯ КАРТОЧКА':'+'+r.count+' ФРАГМЕНТОВ')+'</small></div>';}).join('')+'</div>'+button('ЗАБРАТЬ','data-loot-close'));
  h.tone(880,.2);
 }
 function albums(){
  const have=Object.keys(meta.m.stickers).filter(k=>meta.m.stickers[k]>0).length;
  $('hub-screen').innerHTML=title('АЛЬБОМЫ','Коллекция миров')+'<div class="album-collection-link">'+button('КОЛЛЕКЦИЯ МИРОВ '+currency('stars',meta.m.albumStars),'data-feature="stickers"','gold-button')+'</div><div class="collection-summary"><b>НАКЛЕЙКИ '+have+' / 54</b><span>9 НАБОРОВ</span></div><div class="source-albums">'+TerraSource.stickerSets.map((set,i)=>{const count=set.stickers.filter((_,j)=>meta.m.stickers[i*6+j]>0).length;return '<button class="album-set" data-sticker-world="'+i+'">'+TerraSourceRuntime.image(set.sprite)+'<b>'+TerraUI.escape(TerraSourceRuntime.term(set.title))+'</b><span>'+count+' / '+set.stickers.length+'</span></button>';}).join('')+'</div>';
 }

 function upgrades(){
  const items=[['53864172bb828476d9c412ea64ababa9:1','ГАРНИЗОН',0,11],['8474cd43765994a16a12222f0c31e10c:1','ПРОИЗВОДСТВО',1,12],['16d0141da09bc45ab9afda3cdb4df4d5:1','ВМЕСТИМОСТЬ',3,10]],bonuses=eco.bonuses();
  $('hub-screen').innerHTML=title('РАЗВИТИЕ')+'<div class="source-core-stats" id="source-core-stats">'+items.map(([sprite,name,i])=>'<div>'+TerraSourceRuntime.image(sprite)+'<b>'+h.upgradeValue(i)+'</b><small>'+name+'</small></div>').join('')+'</div><div id="source-core-cards">'+items.map(([sprite,name,i,type])=>{const level=data.upgrades[i],max=level>=300,mult=1+(bonuses.sourcePassives[type]||0),delta=(TerraSourceMath.upgrade(type,level+1)-TerraSourceMath.upgrade(type,level))*mult;return '<article class="source-core-card"><span class="source-core-level">'+(max?'МАКС.':'УРОВЕНЬ '+(level+1))+'</span><span class="source-core-icon">'+TerraSourceRuntime.image(sprite)+'</span><strong class="source-core-delta">+'+Number(delta.toFixed(2))+(i===1?'<small>/СЕК</small>':'')+'</strong><h2>'+name+'</h2>'+button(max?'МАКС.':currency('coins',h.upgradePrice(i)),'data-core-upgrade="'+i+'" '+(max||data.coins<h.upgradePrice(i)?'disabled':''))+'</article>';}).join('')+'</div>';
  TerraLayout.apply();
 }
 function events(){
  const ops=eco.operations();$('hub-screen').innerHTML=title('СОБЫТИЯ','Вызовы, награды и новые рубежи')+'<div class="events-quick">'+[['wheel','КОЛЕСО','Один подарок каждый день','gift'],['duel','ДУЭЛЬ','Сражение с ботом и личная лига','trophy'],['rush','ГОНКА','90 секунд на захват территорий','flag']].map(([id,name,desc,ico])=>'<button class="event-tile" data-feature="'+id+'"><span>'+icon(ico)+'</span><div><b>'+name+'</b><small>'+desc+'</small></div><i>›</i></button>').join('')+'</div><section class="operation-banner">'+art(1)+'<div><span class="offer-ribbon">ЕЖЕДНЕВНАЯ ОПЕРАЦИЯ</span><h2>ТАКТИЧЕСКИЙ РЕЙД</h2><p>Усиленный противник. В старших главах — туман и зоны замедления.</p>'+button('НАЧАТЬ '+currency('supply',1),'data-start-operation')+'</div></section><div class="section-heading"><h2>ЕЖЕДНЕВНЫЕ ЗАДАНИЯ</h2><button data-feature="quests">?</button></div><div class="operation-list">'+ops.map(op=>'<article class="operation-item"><div class="operation-medal">'+icon(op.id==='wins'?'trophy':op.id==='capture'?'flag':'units')+'</div><div><b>'+op.title+'</b><div class="quest-progress"><i style="width:'+Math.min(100,op.value/op.goal*100)+'%"></i><small>'+Math.min(op.goal,op.value)+' / '+op.goal+'</small></div><span>'+Object.entries(op.reward).map(([k,n])=>currency(k,n)).join('')+'</span></div>'+button(op.claimed?'✓':op.value>=op.goal?'ЗАБРАТЬ':'В БОЙ','data-operation="'+op.id+'" '+(op.claimed?'disabled':''))+'</article>').join('')+'</div>'+button('ЕЖЕНЕДЕЛЬНЫЕ ЗАДАНИЯ','data-feature="weekly"','blue-button')+'<section class="event-path"><span class="event-badge">'+icon('trophy')+'</span><div><small>ПУТЬ ЗАВОЕВАТЕЛЯ</small><h2>МИРОВАЯ КАМПАНИЯ</h2><p>Победы, карточки и награды за достижения</p>'+button('ОТКРЫТЬ ДОСТИЖЕНИЯ','data-achievements','blue-button')+'</div></section><div class="event-stats"><div><b>'+data.wins+'</b><small>ПОБЕД</small></div><div><b>'+data.captures+'</b><small>ЗАХВАТОВ</small></div><div><b>'+C.CATALOG.filter(it=>eco.inventory(it.id).owned).length+'</b><small>КАРТОЧЕК</small></div></div>';
 }

 function fail(msg='Недостаточно ресурсов'){h.toast(msg);h.tone(180,.05);}
 function handle(e){
  const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
  if('colorPanel'in d){h.openModal('colors',h.head('ЦВЕТА')+'<div class="collection-grid color-grid">'+C.CATALOG.filter(it=>it.category==='color'&&eco.visible(it.id)).map(cardTile).join('')+'</div>');}
  else if(d.coreUpgrade!==undefined){if(h.buyUpgrade(+d.coreUpgrade)){wallet();upgrades();}}
  else if(d.shopSection){document.getElementById('shop-'+d.shopSection)?.scrollIntoView({block:'start',behavior:'smooth'});}
  else if(d.albumPage!==undefined){albumPage=Math.max(0,Math.min(19,+d.albumPage));albums();$('hub-screen').scrollTop=0;}
  else if(d.category){category=d.category;filter='all';arsenal();}
  else if(b.id==='collection-filter'){filter=filter==='all'?'owned':'all';arsenal();}
  else if(d.card)details(d.card);
  else if(d.preview)details(d.preview);
  else if(d.buyCard){if(!eco.buyCard(d.buyCard)){features.insufficient(eco.unlockCost(d.buyCard).currency);return;}eco.equip(d.buyCard);changed();details(d.buyCard);h.tone(680);}
  else if(d.equip){if(eco.equip(d.equip)){changed();details(d.equip);}}
  else if(d.upgradeCard){if(eco.upgrade(d.upgradeCard)){changed();details(d.upgradeCard);h.tone(840,.15);}else fail('Нужны припасы и фрагменты');}
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
  else if('chestHelp'in d)h.openModal('info',h.head('СУНДУКИ')+'<p class="detail-description">Обычный: 2 набора фрагментов и 10 припасов.<br><br>Эпический: 3 набора и 25 припасов.<br><br>Легендарный: 4 набора и 150 припасов.<br><br>Редкость и число фрагментов определяются таблицей сундука. Для особых героев действуют отдельные условия открытия.</p>');
  else if('startOperation'in d){if(data.supply<1){fail('Нужен 1 припас. Получи его в магазине или наградах.');return;}home();h.playOperation();}
  else if(d.operation){const op=eco.operations().find(o=>o.id===d.operation);if(op&&op.value>=op.goal){if(eco.claimOperation(op.id)){changed();events();h.tone(850);}}else{home();h.showMenu();}}
 }
 $('hub-screen').addEventListener('click',handle);$('panel-content').addEventListener('click',handle);$('main-loadout').addEventListener('click',handle);
 $('nav-upgrades').onclick=()=>open('upgrades');$('nav-upgrades').querySelector('span').innerHTML=icon('speed');
 $('nav-store').onclick=()=>open('store');$('nav-army').onclick=()=>open('arsenal');$('nav-world').onclick=()=>{home();h.showMenu();};$('nav-albums').onclick=()=>open('albums');$('nav-events').onclick=()=>open('events');
 for(const key of ['coins','gems','supply','tickets'])$('wallet-'+key).onclick=()=>features.open(key);$('leader').onclick=()=>open('arsenal','leader');$('quests').onclick=()=>features.open('quests');
 $('nav-store').querySelector('span').innerHTML=art(12);$('nav-army').querySelector('span').innerHTML=art(4);$('nav-world').querySelector('span').innerHTML=icon('world');$('nav-albums').querySelector('span').innerHTML='<span class="album-nav-icon">★</span>';$('nav-events').querySelector('span').innerHTML=icon('trophy');$('quests').querySelector('span').innerHTML=icon('tasks');$('leader').querySelector('span').innerHTML=art(0);$('gift').querySelector('span').innerHTML=art(12);
 for(const [id,name] of Object.entries({'nav-store':'menu_store_icon','nav-army':'menu_squad','nav-world':'menu_play_icon','nav-upgrades':'menu_icon','nav-albums':'album menu icon','nav-events':'menu_coming_soon_icon'})){const path=TerraSourceRuntime.file(name);if(path)$(id).querySelector('span').innerHTML='<img class="source-art nav-source-icon" src="'+path+'" alt="" draggable="false">';}
 $('nav-events').querySelector('small').textContent='СКОРО';$('nav-events').disabled=true;
 return {open,home,wallet,render,details,get tab(){return tab;},back(){if(tab!=='play'){home();h.showMenu();return true;}return false;}};
}
g.TerraScreens={create};
})(typeof globalThis!=='undefined'?globalThis:this);
