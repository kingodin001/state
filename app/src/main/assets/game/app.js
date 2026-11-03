(function(){
'use strict';
const $=id=>document.getElementById(id),levels=TERRA_LEVELS;
const icons={
 coin:'<circle cx="16" cy="16" r="13" fill="#efb334" stroke="#d99420" stroke-width="2"/><circle cx="16" cy="16" r="9" fill="none" stroke="#ffe197" stroke-width="2"/><path d="M17 9h-4v14h4q6 0 6-7t-6-7" fill="none" stroke="#fff0b0" stroke-width="3"/>',
 gear:'<path d="m13 3 6 0 1 4 4 2 4-1 3 5-3 3 0 4 3 3-3 5-4-1-4 2-1 4-6 0-1-4-4-2-4 1-3-5 3-3 0-4-3-3 3-5 4 1 4-2z" fill="currentColor" transform="translate(0 -2) scale(.95)"/><circle cx="15" cy="15" r="5" fill="white"/>',
 arrow:'<path d="M6 16h19m-8-8 8 8-8 8" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
 chevron:'<path d="m8 12 8 8 8-8" fill="none" stroke="currentColor" stroke-width="3"/>',
 flag:'<path d="M8 28V4m1 1h16l-3 6 3 6H9" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
 world:'<circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="m7 6 6 2 1 6-5 3 3 5-1 5m12-22-4 6 3 4 6-1m-8 7 4 4" fill="none" stroke="currentColor" stroke-width="3"/>',
 army:'<path d="m16 2 12 5v9c0 7-12 14-12 14S4 23 4 16V7z" fill="currentColor"/><path d="m16 8 2.5 5 5.5.7-4 3.9 1 5.4-5-2.6-5 2.6 1-5.4-4-3.9 5.5-.7z" fill="white"/>',
 tasks:'<rect x="6" y="5" width="21" height="25" rx="4" fill="currentColor"/><rect x="11" y="2" width="11" height="6" rx="2" fill="#e9f0f7"/><path d="m10 15 2 2 4-4m-6 10 2 2 4-4m3-6h4m-4 8h4" stroke="white" stroke-width="2" fill="none"/>',
 gift:'<path d="M5 13h23v16H5z" fill="#64ace7"/><rect x="3" y="9" width="27" height="7" rx="2" fill="#86c5f4"/><path d="M14 10v19h5V10" fill="#ffc356"/><path d="M16 9C4 9 6-2 12 3zm0 0C28 9 26-2 20 3z" fill="none" stroke="#f4b63f" stroke-width="3"/>',
 leader:'<path d="M4 29q0-12 12-12t12 12" fill="#74aee0"/><circle cx="16" cy="12" r="8" fill="#f0bf89"/><path d="M7 11V7L16 2l9 5v4z" fill="#526a80"/><path d="m16 4 1 2 2 .5-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L13 6.5l2-.5z" fill="#ffe196"/>',
 units:'<circle cx="16" cy="8" r="4" fill="currentColor"/><circle cx="7" cy="13" r="3" fill="currentColor"/><circle cx="25" cy="13" r="3" fill="currentColor"/><path d="M10 27v-9q0-5 6-5t6 5v9M2 28v-8q0-4 5-4m23 12v-8q0-4-5-4" fill="none" stroke="currentColor" stroke-width="4"/>',
 speed:'<path d="m18 1-14 18h10l-1 12L29 12H18z" fill="currentColor"/>',
 income:'<path d="M5 15 16 5l11 10v14H5z" fill="currentColor"/><path d="M10 16h12m-12 5h12m-12 5h12" stroke="white" stroke-width="2"/>',
 pause:'<rect x="8" y="6" width="5" height="20" rx="2" fill="currentColor"/><rect x="19" y="6" width="5" height="20" rx="2" fill="currentColor"/>',
 help:'<circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M11 11q1-5 6-4t4 6l-5 4v3" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="25" r="1.5" fill="currentColor"/>',
 select:'<path d="M10 3H3v7m19-7h7v7M3 22v7h7m12 0h7v-7" stroke="currentColor" fill="none" stroke-width="3"/><circle cx="12" cy="13" r="3" fill="currentColor"/><circle cx="21" cy="19" r="3" fill="currentColor"/>',
 plus:'<circle cx="16" cy="16" r="13" fill="#67b9e9"/><path d="M16 8v16M8 16h16" stroke="white" stroke-width="4"/>',
 shield:'<path d="m16 2 12 5v9c0 7-12 14-12 14S4 23 4 16V7z" fill="#b097e7"/><path d="m16 7 7 3v7c0 3-7 8-7 8z" fill="#d9c9ff"/>',
 trophy:'<path d="M8 4h16v9q0 9-8 9t-8-9z" fill="#f5bc45"/><path d="M8 7H3v6q0 6 7 6m14-12h5v6q0 6-7 6" fill="none" stroke="#edaa2d" stroke-width="3"/><path d="M16 21v6m-7 2h14" stroke="#e8a12a" stroke-width="4" stroke-linecap="round"/><path d="m16 8 2 3 3 .5-2.3 2.3.5 3.2-3.2-1.5-3.2 1.5.5-3.2-2.3-2.3 3-.5z" fill="#ffe7a3"/>',
 castle:'<path d="M4 28V10h5V4h5v6h4V4h5v6h5v18z" fill="currentColor"/><path d="M13 28v-8q3-4 6 0v8" fill="white"/>',
 diamond:'<path d="m16 2 13 14-13 14L3 16z" fill="currentColor"/>',
 star:'<path d="m16 2 4 9 10 1-7 7 2 11-9-5-9 5 2-11-7-7 10-1z" fill="currentColor"/>',
 rocket:'<path d="M12 21 7 16C8 7 21 1 29 3c1 9-4 20-14 23l-5-5-5 6 1-8 6 2" fill="currentColor"/><circle cx="22" cy="10" r="3" fill="white"/>',
 check:'<path d="m7 17 6 6L26 9" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
 lock:'<rect x="6" y="13" width="20" height="16" rx="4" fill="currentColor"/><path d="M10 13V9a6 6 0 0 1 12 0v4" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="16" cy="21" r="2" fill="white"/>',
 sound:'<path d="M3 12h6l8-7v22l-8-7H3z" fill="currentColor"/><path d="M22 10q7 6 0 12m4-16q11 10 0 20" fill="none" stroke="currentColor" stroke-width="2"/>'
};
function icon(name,color){if(name==='coin')return TerraUI.resource('coins');const key={gear:'settings',world:'play',army:'army',tasks:'quests',gift:'chest_basic',leader:'army',units:'production',speed:'move_boost',income:'idle',shield:'upgrades',trophy:'league',castle:'extra_base',diamond:'gems',star:'stars',rocket:'move_boost',flag:'garrison'}[name];if(key)return '<svg viewBox="0 0 32 32" aria-hidden="true"><image href="'+TerraIdentity.file(key)+'" width="32" height="32" preserveAspectRatio="xMidYMid meet"/></svg>';return '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"'+(color?' style="color:'+color+'"':'')+'>'+icons[name]+'</svg>';}
const palette=['#969696','#438df5','#ed5e65','#a75fdf','#efbe39'];
const fills=['#d6e3f8','#6fa9fa','#f58f94','#bd8feb','#f5d167'];
let data;
function defaults(){return {version:1,coins:0,unlocked:0,completed:[],stars:{},level:0,upgrades:[0,0,0],color:0,base:0,fighter:0,leader:0,owned:{color:[0],base:[0],fighter:[0]},sound:true,vibration:true,wins:0,captures:0,sent:0,commands:0,daily:0,streak:0,claimed:[],lastSeen:Date.now(),seenHelp:false};}
const saveStores=[];for(const name of ['localStorage','sessionStorage']){try{saveStores.push(window[name]);}catch(_){}}
data={...defaults(),...TerraSaveStore.load(saveStores)};
TerraCampaign.normalize(data);const eco=new TerraCollection.Economy(data),meta=new TerraMeta.Meta(eco);let hub=null,features=null,operationMode=false,battleMode='campaign';
data.version=3;
function save(){data.lastSeen=Date.now();TerraSaveStore.save(data,saveStores);}
// Repair an older disk copy immediately after restoring the newer checkpoint.
TerraSaveStore.save(data,saveStores);
const offline=Math.min(8*3600,Math.max(0,(Date.now()-data.lastSeen)/1000));
const offlineReward=!eco.source&&offline>180?Math.floor(offline*(100+data.upgrades[2]*75)/3600):0;
if(offlineReward){data.coins+=offlineReward;meta.m.lastOfflineReward=offlineReward;save();}
let mode='menu',battle=null,currentLevel=data.level,modalType=null,selected=new Set(),fraction=1,casting=null,particles=[],shotLines=[],toastTimer=0,view={s:1,x:0,y:0},drag=null,pointer={x:0,y:0},lastFrame=performance.now(),lastUi=0,scale=1,zoom=1,pan={x:0,y:0},overview=false,defaultZoom=1,cameraFocus=null,cameraTween=null,hoverTarget=null,orderPulses=[],countdownActive=false,countdownRun=0;
const armyBar=new TerraAppearance.ArmyBar($('balance'),owner=>TerraAppearance.hex(sourcePalette(owner).Area.Color));
const canvas=$('map'),ctx=canvas.getContext('2d',{alpha:false});let W=400,H=800,DPR=1,paths=[],dots=[];
let soundCtx=null;const artImage=new Image();artImage.src='art/terra-collection.webp';
const spriteCache=new Map(),spriteImages=new Map([['art/terra-collection.webp',artImage]]);
function paintSprite(index,x,y,w,h,hue=0,tint=null){
 const record=TerraSourceRuntime.vectorForArt(index);
 if(record){const key=record.file+':'+(tint||'white');let image=spriteImages.get(record.file);if(!image){image=new Image();image.src=record.file;spriteImages.set(record.file,image);}if(!image.complete||!image.naturalWidth)return false;
  if(!spriteCache.has(key)){const c=document.createElement('canvas');c.width=c.height=128;const sc=c.getContext('2d'),ratio=image.naturalWidth/image.naturalHeight;const rw=ratio>1?128:128*ratio,rh=ratio>1?128/ratio:128;sc.drawImage(image,(128-rw)/2,(128-rh)/2,rw,rh);if(tint){sc.globalCompositeOperation='source-in';sc.fillStyle=tint;sc.fillRect(0,0,128,128);}spriteCache.set(key,c);}ctx.drawImage(spriteCache.get(key),x,y,w,h);return true;
 }

 const src=TerraCollection.sheet(index);if(!spriteImages.has(src)){const im=new Image();im.src=src;spriteImages.set(src,im);}const source=spriteImages.get(src);if(!source.complete||!source.naturalWidth)return false;const key=index+':'+hue+':'+(tint||'');
 if(!spriteCache.has(key)){const sprite=document.createElement('canvas');sprite.width=192;sprite.height=192;const sc=sprite.getContext('2d');if(hue)sc.filter='hue-rotate('+hue+'deg)';const crop=TerraCollection.rect(index).map((v,i)=>v*(i%2?source.naturalHeight:source.naturalWidth)/1254);sc.drawImage(source,...crop,0,0,192,192);if(tint){sc.filter='none';sc.globalCompositeOperation='source-atop';sc.globalAlpha=.72;sc.fillStyle=tint;sc.fillRect(0,0,192,192);}spriteCache.set(key,sprite);}
 ctx.drawImage(spriteCache.get(key),x,y,w,h);return true;
}

function tone(freq=440,duration=.08){if(!data.sound)return;try{soundCtx=soundCtx||new(window.AudioContext||window.webkitAudioContext)();if(soundCtx.state==='suspended')soundCtx.resume();const o=soundCtx.createOscillator(),g=soundCtx.createGain();o.connect(g);g.connect(soundCtx.destination);o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(.035,soundCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,soundCtx.currentTime+duration);o.start();o.stop(soundCtx.currentTime+duration);}catch(e){}}
function vibrate(){if(!data.vibration)return;try{if(window.Android)Android.vibrate();else if(navigator.vibrate)navigator.vibrate(15);}catch(e){}}
let musicStep=0;
function musicBeat(){
 if(!data.music||document.hidden)return;
 try{soundCtx=soundCtx||new(window.AudioContext||window.webkitAudioContext)();if(soundCtx.state==='suspended')soundCtx.resume();const melody=[0,7,12,15,12,7,3,10,0,7,12,19,15,12,7,3],note=melody[musicStep%melody.length],o=soundCtx.createOscillator(),gain=soundCtx.createGain(),t=soundCtx.currentTime;o.type='triangle';o.frequency.value=146.83*Math.pow(2,note/12);o.connect(gain);gain.connect(soundCtx.destination);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.009,t+.025);gain.gain.exponentialRampToValueAtTime(.0001,t+.65);o.start(t);o.stop(t+.7);musicStep++;}catch(e){}
}
setInterval(musicBeat,480);
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600);}
function fmt(n){return n>=100000?(n/1000).toFixed(0)+'k':Math.floor(n).toLocaleString('ru-RU');}
function time(t){return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');}
function sourcePalette(owner){
 const id=owner===0?'c_n':owner===1?eco.item(eco.c.equipped.color).nativeId:battle?.botProfiles[owner]?.skins.color||['c_2','c_4','c_6','c_8','c_10'].filter(x=>x!==eco.item(eco.c.equipped.color).nativeId)[owner-2];return TerraSource.palettes[eco.c.sourceStyle||'stl_1_origin'][id]||TerraSource.palettes.stl_1_origin.c_0;
}
function color(owner){return TerraAppearance.hex(sourcePalette(owner).Base.Color);}
function fill(owner){return TerraAppearance.hex(sourcePalette(owner).Area.Color);}
function sourceProduction(){return TerraSourceMath.upgrade(12,data.upgrades[1])*(1+eco.bonuses().production);}
function sourceStart(){return Math.floor(TerraSourceMath.upgrade(11,data.upgrades[0])*(1+(eco.bonuses().sourcePassives[11]||0)));}
function battleConfig(){return TerraCampaign.combat(levels[currentLevel],{start:sourceStart(),production:sourceProduction(),limit:eco.bonuses().limit});}
function inside(x,y,poly){let v=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>y)!==(b[1]>y))&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])v=!v;}return v;}
function prepareMap(){
 const map=battle?battle.level:levels[currentLevel];paths=map.regions.map(r=>{const p=new Path2D();for(const poly of r.polys||[r.poly]){poly.forEach((a,i)=>i?p.lineTo(a[0],a[1]):p.moveTo(a[0],a[1]));p.closePath();}return p;});
 dots=map.sourcePort?[]:map.regions.map(r=>Array.from({length:150},(_,i)=>({...TerraField.slot(r,i),phase:i*2.399963})));
 defaultZoom=1;zoom=1;cameraFocus=null;cameraTween=null;pan={x:0,y:0};overview=false;resize();

}
function resize(){
 const box=$('app').getBoundingClientRect();W=box.width;H=box.height;DPR=Math.min(2,window.devicePixelRatio||1);
 const cw=Math.round(W*DPR),ch=Math.round(H*DPR);if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}canvas.style.width=W+'px';canvas.style.height=H+'px';
 const map=battle?battle.level:levels[currentLevel];let rect;
 if(mode==='battle'){
  const top=map.sourcePort?0:$('battle-top').getBoundingClientRect().bottom-box.top+13,bottom=map.sourcePort?H:$('battle-bottom').getBoundingClientRect().top-box.top-12;
  rect={x:0,y:top,width:W,height:Math.max(160,bottom-top)};
  view=TerraField.camera(map,rect,{zoom,pan,overview,focus:overview?null:cameraFocus,stage:battle?.stage||0});

 }else{
  const top=map.sourcePort?0:$('map-caption').getBoundingClientRect().bottom-box.top+10,loadout=$('main-loadout'),bottom=map.sourcePort?H:(getComputedStyle(loadout).display!=='none'?loadout:$('menu-bottom')).getBoundingClientRect().top-box.top-12;
  rect=map.sourcePort?{x:0,y:0,width:W,height:H}:{x:12,y:top,width:W-24,height:Math.max(120,bottom-top)};view=map.sourcePort?TerraField.menuCamera(map,rect):TerraField.camera(map,rect,{overview:true});
 }
 $('zoom-reset').hidden=true;
}

function showMenu(){
 $('battle-objective').hidden=true;
 try{window.Android?.bannerVisible?.(true);}catch(_){}
 countdownActive=false;countdownRun++;$('countdown').hidden=true;mode='menu';$('meta-shortcuts').hidden=false;$('selection-info').hidden=true;$('fraction-panel').hidden=true;$('app').dataset.mode='menu';battle=null;selected.clear();casting=null;particles=[];shotLines=[];hoverTarget=null;drag=null;orderPulses=[];
 $('header').hidden=false;$('menu-top').hidden=false;$('menu-bottom').hidden=false;$('side-menu').hidden=false;$('map-caption').hidden=false;
 $('battle-top').hidden=true;$('battle-bottom').hidden=true;$('hint').hidden=true;closeModal(false);if(hub)hub.home();prepareMap();updateMenu();TerraLayout.apply();
}
function updateMenu(){
 document.querySelectorAll('[data-feature]').forEach(el=>{const kind=el.dataset.feature,level=TerraSourceRules.featureLevel(kind);if(level){el.disabled=!TerraSourceRules.featureAvailable(kind,data);el.title=el.disabled?'С уровня '+level:'';}});
 TerraPresentation.wallet('coins',data.coins);$('level-label').textContent='УРОВЕНЬ '+(currentLevel+1);$('map-name').textContent=levels[currentLevel].name;$('map-subtitle').textContent=levels[currentLevel].subtitle;const modifiers=levels[currentLevel];$('map-modifiers').innerHTML=(modifiers.fog?'<button data-feature="fog">ТУМАН РАЗВЕДКИ ?</button>':'')+((modifiers.zones||[]).length?'<button data-feature="slow">ЗОНА ЗАМЕДЛЕНИЯ ?</button>':'');
 const current=levels[currentLevel],start=currentLevel-current.sourceStageIndex,stageCount=TerraCampaign.get(currentLevel).sourceStageCount;$('campaign-dots').innerHTML=Array.from({length:stageCount},(_,j)=>'<i class="'+(data.completed.includes(start+j)?'done':j===current.sourceStageIndex?'current':'')+'"></i>').join('');document.querySelector('.campaign-progress>span').textContent=current.name+' • '+(current.sourceStageIndex+1)+' / '+stageCount;
 $('play-label').innerHTML='ИГРАТЬ<small>УРОВЕНЬ '+(currentLevel+1)+'</small>';
 if(hub)hub.wallet();
 const specs=[['units','Стартовый отряд','бойцов','СТАРТОВЫЙ ОТРЯД','#63b3e9','#4196ca',0],['speed','Скорость производства','бойцов в секунду','ПРОИЗВОДСТВО','#a58cdb','#8c73be',1],['castle','Лимит гарнизона','бойцов на базе','ЛИМИТ ГАРНИЗОНА','#edba55','#d29b36',3]];
 $('upgrades').innerHTML=specs.map(sp=>{const i=sp[6],lv=data.upgrades[i],price=upgradePrice(i),value=upgradeValue(i);return '<article class="upgrade" style="--tone:'+sp[4]+';--dark:'+sp[5]+'"><div class="upgrade-icon">'+icon(sp[0])+'</div><strong>'+value+'</strong><span class="unit">'+sp[2]+'</span><h3>'+sp[3]+'</h3><span class="lv">УР. '+(lv+1)+'</span><button data-upgrade="'+i+'" aria-label="Улучшить: '+sp[1]+'" '+(data.coins<price||lv>=300?'disabled':'')+'>'+(lv>=300?'МАКС.':icon('coin')+fmt(price))+'</button></article>';}).join('');
 TerraMainMenu.update({data,level:current,meta});
 $('gift').querySelector('i').hidden=sameDay(data.daily,Date.now());
 $('nav-events').querySelector('i').hidden=!tasks().some(t=>t.current>=t.goal&&!data.claimed.includes(t.id));if(mode==='menu')resize();
}
function upgradePrice(i){return i===2?Math.floor(65*Math.pow(1.48,data.upgrades[i])):TerraSourceMath.upgradeCost(({0:11,1:12,3:10})[i],data.upgrades[i]);}
function upgradeValue(i){return i===0?sourceStart():i===1?sourceProduction().toFixed(2):i===2?100+data.upgrades[2]*75:eco.bonuses().limit;}
function buyUpgrade(i){if(!Number.isInteger(i)||i<0||i>3||TerraProgression.core(data,i).max||data.coins<upgradePrice(i))return false;data.coins-=upgradePrice(i);data.upgrades[i]++;save();updateMenu();tone(750);vibrate();return true;}
let pendingBonusSelection=null;
function sourceBonusesDialog(options,selection=null){
 const names={0:['ДОПОЛНИТЕЛЬНАЯ БАЗА','extra_base_big'],10:['СКОРОСТЬ ПРОИЗВОДСТВА +100%','produce_speed_big'],100:['СКОРОСТЬ ПЕРЕМЕЩЕНИЯ +100%','move_speed_big']};
 const session=selection||new TerraPrebattle.Selection(currentLevel,eco.bonusConfigs());pendingBonusSelection=session;
 const selected=session.selected;
 $('app').dataset.prebattle='true';for(const id of ['header','menu-bottom','side-menu','meta-shortcuts','global-nav','hub-screen','main-loadout'])$(id).hidden=true;view=TerraField.camera(battleConfig(),{x:0,y:0,width:W,height:H},{stage:0});openModal('source-bonuses',head('ВЫБЕРИ ДО 3 УСИЛЕНИЙ')+'<div class="source-bonus-choices">'+eco.bonusConfigs().sort((a,b)=>[0,10,100].indexOf(a._bonusType)-[0,10,100].indexOf(b._bonusType)).map(x=>{const chosen=selected.includes(x._bonusType);return '<article class="'+(chosen?'bonus-selected':'')+'"><img class="source-art" src="'+TerraSourceRuntime.file(names[x._bonusType][1])+'" alt=""><b>'+names[x._bonusType][0]+'</b><small>'+(chosen?'✓':x.available?'':'С УРОВНЯ '+x._openFromLevel)+'</small><button class="source-bonus-video blue-button" data-ad-placement="battle_bonus" data-ad-value="'+x._bonusType+'" data-ad-locked="'+(!x.available||chosen)+'" disabled>'+(chosen?'✓ ВЫБРАНО':'ПОЛУЧИТЬ — ВИДЕО')+'</button></article>';}).join('')+'</div><img class="bonus-tutorial-hand" src="'+TerraSourceRuntime.file('tutorial_finger')+'" alt=""><button class="primary modal-primary" id="source-bonuses-play">В БОЙ</button>');
 $('source-bonuses-play').onclick=()=>startBattle({...options,sourceBonusSelection:session});
 document.querySelectorAll('[data-ad-placement="battle_bonus"]').forEach(button=>button.onclick=async()=>{
  const ok=await session.watch(+button.dataset.adValue,globalThis.TerraAds);
  if(pendingBonusSelection!==session||modalType!=='source-bonuses')return;
  if(ok)sourceBonusesDialog(options,session);else toast('Видео сейчас недоступно');
 });
}
function startBattle(options={}){
 eco.refresh();meta.refresh();const requestedMode=options.operation===true?'operation':['campaign','operation','duel','rush'].includes(options.mode)?options.mode:'campaign',chosenMode=requestedMode==='rush'?'campaign':requestedMode;
 if(requestedMode==='rush'&&!TerraSourceModes.raceStart(data)){features.open('rush');return;}
 if(chosenMode==='operation'){const board=TerraSourceModes.operations(data);options.operationMission=options.operationMission||TerraSourceModes.nextMission(board);if(!TerraSourceModes.canStart(board,options.operationMission))return;}
 if(levels[currentLevel].sourcePort&&['campaign','operation'].includes(chosenMode)&&currentLevel+1>=7&&options.sourceBonusSelection!==pendingBonusSelection){sourceBonusesDialog(options);return;}
 const bonusSession=options.sourceBonusSelection;const selectedBonuses=bonusSession?.selected||[];if(bonusSession&&(bonusSession.closed||bonusSession.busy||bonusSession.level!==currentLevel||bonusSession!==pendingBonusSelection))return;
 if(!levels[currentLevel].sourcePort&&currentLevel>=2&&options.loadout===undefined&&['reinforce','shield'].some(k=>eco.c.boosters[k]>0)){
  showMenu();openModal('loadout',head('Подготовка к бою')+'<p class="detail-description">Выбери дополнительные усиления из запаса. Неиспользованные предметы останутся в арсенале.</p><div class="prebattle-loadout">'+['reinforce','shield'].filter(k=>eco.c.boosters[k]>0).map(k=>'<label><span>'+icon(k==='shield'?'shield':'plus')+'</span><div><b>'+(k==='shield'?'ЗАЩИТНЫЙ ЩИТ':'ПОДКРЕПЛЕНИЕ')+'</b><small>В запасе: '+eco.c.boosters[k]+' · +1 заряд в бою</small></div><input type="checkbox" data-loadout="'+k+'"></label>').join('')+'</div><button id="confirm-battle" class="primary modal-primary">В БОЙ</button>');
  $('confirm-battle').onclick=()=>{const loadout=[...document.querySelectorAll('[data-loadout]:checked')].map(x=>x.dataset.loadout);startBattle({mode:chosenMode,loadout});};return;
 }
 try{window.Android?.bannerVisible?.(false);}catch(_){}
 $('app').dataset.prebattle='false';countdownActive=false;countdownRun++;$('countdown').hidden=true;battleMode=chosenMode;$('app').dataset.battleMode=battleMode;operationMode=battleMode!=='campaign';$('meta-shortcuts').hidden=true;if(hub)hub.home();$('meta-shortcuts').hidden=true;$('global-nav').hidden=true;$('hub-screen').hidden=true;$('main-loadout').hidden=true;
 const bonuses=eco.bonuses();
 if(bonusSession){bonusSession.take(currentLevel);pendingBonusSelection=null;}closeModal(false);mode='battle';$('fraction-panel').hidden=true;$('app').dataset.mode='battle';selected.clear();casting=null;fraction=1;particles=[];shotLines=[];hoverTarget=null;drag=null;orderPulses=[];
 let config=battleConfig();

 if(battleMode==='operation')config=TerraSourceModes.operationBattle(data,options.operationMission,{start:sourceStart(),production:sourceProduction(),limit:bonuses.limit});
 if(battleMode==='duel')config=TerraSourceModes.pvp(data,{start:sourceStart(),production:sourceProduction(),limit:bonuses.limit,playerColor:eco.item(eco.c.equipped.color).nativeId,skinLevels:Object.fromEntries(['base','fighter','leader'].map(k=>[k,eco.inventory(eco.c.equipped[k]).level]))},()=>eco.random());
 if(selectedBonuses.includes(0)){const start=config.regions.find(r=>r.owner===1&&r.stage===0),target=config.regions.filter(r=>r.owner===0&&r.stage===0).sort((a,b)=>Math.hypot(a.center[0]-start.center[0],a.center[1]-start.center[1])-Math.hypot(b.center[0]-start.center[0],b.center[1]-start.center[1]))[0];if(target)config={...config,regions:config.regions.map(r=>r.id===target.id?{...r,owner:1}:r)};}
 armyBar.reset();battle=new TerraBattle(config,{start:0,production:0,sourceStart:sourceStart(),sourceLeader:bonuses.sourceLeader,sourceSkills:bonuses.sourceSkills,playerColor:eco.item(eco.c.equipped.color).nativeId,sourceProduction:sourceProduction(),productionMultiplier:selectedBonuses.includes(10)?2:1,speed:bonuses.speed*(selectedBonuses.includes(100)?2:1),limit:bonuses.limit,leader:bonuses.leader,skipTutorial:operationMode||data.completed.includes(currentLevel)});

 pendingBonusSelection=null;
 for(const k of ['reinforce','shield'])if(currentLevel>=2&&options.loadout?.includes(k)&&eco.c.boosters[k]>0){eco.c.boosters[k]--;battle.skillCharges[k]++;}save();
 $('header').hidden=true;$('menu-top').hidden=true;$('menu-bottom').hidden=true;$('side-menu').hidden=true;$('map-caption').hidden=true;
 $('battle-top').hidden=false;$('battle-bottom').hidden=false;$('battle-label').textContent=({campaign:'УРОВЕНЬ ',operation:'ОПЕРАЦИЯ • ',duel:'АРЕНА • ',rush:'ГОНКА • '}[battleMode])+(battleMode==='operation'?config.sourceMission.number:currentLevel+1);$('fraction').querySelector('b').textContent='100%';
 $('reinforce').hidden=currentLevel<2;$('shield').hidden=currentLevel<2;
 $('hint').hidden=currentLevel!==0||data.completed.includes(0);$('hint').textContent='Проведи от своей базы к серой территории';
 $('leader-skill').querySelector('span').innerHTML=TerraCollection.art(eco.item(eco.c.equipped.leader).art);$('battle-portrait').innerHTML=TerraCollection.art(eco.item(eco.c.equipped.leader).art);const abilityName={LeaderIncreaseSpeedSkillConfig:'Property 1=speed_up',LeaderShieldSkillConfig:'Property 1=protect_bases',LeaderBerserkerSkillConfig:'Property 1=rage',LeaderPoisonSkillConfig:'Property 1=biohazard',LeaderFreezeSkillConfig:'Property 1=freeze',LeaderProductionBoostSkillConfig:'Property 1=boost_production',LeaderSabotageSkillConfig:'Property 1=spawn_units'}[bonuses.sourceLeader?.kind],abilityFile=TerraSourceRuntime.file(abilityName);if(abilityFile)$('leader-skill').querySelector('span').innerHTML='<img class="source-art" src="'+abilityFile+'" alt="">';$('app').dataset.sourceBattle=String(config.sourcePort===true);$('battle-footer').hidden=!config.sourcePort||!bonuses.sourceLeader;$('fraction').hidden=!!(config.sourcePort&&bonuses.sourceLeader);
 $('skill-hint').textContent='Проведи от своей базы к цели';prepareMap();updateBattle();tone(520);if(battleMode==='duel'){const run=++countdownRun;countdownActive=true;battle.paused=true;const pulse=n=>{if(run!==countdownRun||!battle)return;if(n===0){countdownActive=false;$('countdown').hidden=true;battle.paused=!$('modal').hidden;return;}$('countdown').hidden=false;$('countdown').querySelector('b').textContent=n;setTimeout(()=>pulse(n-1),1000);};pulse(3);}
}
function updateBattle(){
 if(!battle)return;
 const objective=battle.objective,hud=$('battle-objective');hud.hidden=objective.type===10;hud.textContent=objective.type===40?'УДЕРЖИВАЙ '+objective.required+' ТЕРР. '+(objective.holdUntil!==null?' · '+Math.max(0,Math.ceil(objective.holdUntil-battle.time))+' С':'10 С'):objective.type===30?'ШАХТЫ · '+Object.entries(objective.scores).map(([owner,score])=>(+owner===1?'ТЫ':'СОПЕРНИК '+(+owner-1))+': '+Math.floor(score)+'/100').join(' · '):objective.type===50?'ЗАХВАТИ СТОЛИЦЫ ПРОТИВНИКОВ':objective.type===20?'СУЖЕНИЕ ЗОНЫ · '+Math.max(0,Math.ceil(objective.zone.next-battle.time))+' С':'';
 $('battle-time').textContent=time(battle.level.timeLimit?Math.max(0,battle.level.timeLimit-battle.time):battle.time);const shares=battle.territoryShare(),tot=battle.totals(),count=battle.regions.filter(r=>r.active).length;$('stage-label').hidden=!battle.level.stages||battle.level.stages.length<2;$('stage-label').textContent='УЧАСТОК '+(battle.stage+1)+' / '+(battle.level.stages?.length||1);
 armyBar.update(tot);
 $('force-counts').innerHTML=tot.map((n,i)=>i&&n?'<span style="color:'+color(i)+'"><i style="background:'+color(i)+'"></i>'+n+'</span>':'').join('');
 $('region-status').textContent='ТЕРРИТОРИИ '+shares[1]+' / '+count+'  •  АРМИЯ '+tot[1];
 for(const type of ['reinforce','shield']){$(type).disabled=!battle.skillCharges[type];$(type).classList.toggle('selected',casting===type);$(type).querySelector('i').textContent=battle.cooldowns[type]>0?Math.ceil(battle.cooldowns[type])+'с':battle.skillCharges[type];}
 const ability=$('leader-skill');ability.hidden=battle.level.sourcePort&&!battle.sourceLeader;ability.disabled=battle.leaderCharges<=0;ability.style.setProperty('--leader-ready',Math.max(0,Math.min(100,100*(1-battle.leaderCooldown/(battle.sourceLeader?.Cooldown||24))))+'%');ability.classList.toggle('selected',casting==='leader');ability.querySelector('i').textContent=battle.leaderCooldown>0?Math.ceil(battle.leaderCooldown)+'с':battle.level.sourcePort?'✓':battle.leaderCharges;
 $('select-all').classList.toggle('selected',selected.size>0);
 const ready=[...selected].filter(id=>battle.regions[id].active&&battle.regions[id].owner===1),amount=ready.reduce((n,id)=>n+Math.floor(battle.orderable(id)*fraction),0);
 $('selection-info').hidden=!ready.length;$('selection-info').textContent=ready.length+' '+(ready.length===1?'БАЗА':'БАЗЫ')+' · '+amount+' БОЙЦОВ';
 if(currentLevel===0&&!data.completed.includes(0)&&battle.firstCommand){$('hint').textContent=battle.regions.filter(r=>r.active&&r.owner===1).length>1?'Теперь отправь бойцов к вражеской базе':'Каждая захваченная база производит бойцов';if(battle.time>25)$('hint').hidden=true;}
}
function sourceResult(won,reward){
 const prefix=won?'source-win':'source-lose',art=won?'cb711f91c5a274db488448c7416ed481:1':'e72513c886c8c4f6f82e82f8d783d181:1';
 return '<div class="source-result '+(won?'won':'lost')+'"><div class="source-result-frame" id="'+prefix+'-frame"></div><div class="source-result-ribbon" id="'+prefix+'-ribbon"></div><div id="'+prefix+'-art">'+TerraSourceRuntime.image(art)+'</div><h2 id="'+prefix+'-title">'+(won?'ПОБЕДА':'ПОРАЖЕНИЕ')+'</h2><div id="'+prefix+'-reward-label">ТВОЯ НАГРАДА</div><div class="source-result-reward" id="'+prefix+'-reward">'+TerraUI.amount('coins',reward)+'</div>'+(won?'<div id="source-win-multiply" class="source-result-multiply"><b>ПОЛУЧИТЬ ×3 МОНЕТ</b><div>'+TerraUI.amount('coins',reward*3)+'</div><button class="blue-button" data-ad-placement="result_x3" disabled>БЕСПЛАТНО — ВИДЕО</button></div>':'')+'<button class="primary" id="'+(won?'next-level':'retry')+'">'+(won?'ПРОДОЛЖИТЬ':'ЕЩЁ РАЗ')+'</button><button class="text-action" id="result-menu">В главное меню</button></div>';
}
function finish(result){
 const b=battle;if(!b||b.rewardSettled)return;b.rewardSettled=true;const won=result==='win',first=won&&battleMode==='campaign'&&!data.completed.includes(currentLevel);meta.result(battleMode,won,b,first);if(battleMode==='campaign')TerraSourceModes.raceResult(data,won);if(won){
  data.wins++;data.captures+=b.stats.captured;data.sent+=b.stats.sent;data.commands+=b.stats.commands;
  eco.victory(currentLevel,!operationMode);
  let reward;if(battleMode==='operation'){b.modeReward=TerraSourceModes.operationReward(eco,b.level.sourceMission);reward=b.modeReward.wallet.coins;}else{reward=battleMode==='duel'?eco.pvpReward(true):eco.stageReward(currentLevel);data.coins+=reward;}b.resultCoinReward=reward;
  if(first)data.completed.push(currentLevel);if(!operationMode){data.unlocked=Math.max(data.unlocked,currentLevel+1);TerraCampaign.ensure(data.unlocked);}
  const stars=b.time<95?3:b.time<170?2:1;if(!b.level.sourcePort&&!operationMode){meta.m.albumStars+=Math.max(0,stars-(data.stars[currentLevel]||0));data.stars[currentLevel]=Math.max(data.stars[currentLevel]||0,stars);}save();
  for(let i=0;i<75;i++)particles.push({screen:true,x:W/2,y:H*.35,vx:(Math.random()-.5)*230,vy:-Math.random()*200-60,life:2+Math.random(),color:['#6cb7ed','#79cd8e','#f0bf5b','#b5a0e1'][i%4]});
  openModal('result',sourceResult(true,reward));if(b.modeReward){const el=document.createElement('div');el.className='operation-extra-loot';el.innerHTML=Object.entries(b.modeReward.wallet).filter(([k,n])=>k!=='coins'&&n).map(([k,n])=>TerraUI.amount(k,n)).join('')+b.modeReward.extra.map(x=>TerraIdentity.image(x.kind==='chest'?'chest_'+x.id:'albums')+' ×'+x.amount).join('');document.querySelector('.source-result-reward').append(el);}TerraLayout.apply();
  $('next-level').onclick=()=>afterResultAd(b,()=>{if(battleMode==='operation'){showMenu();features.open('operation');return;}if(operationMode){startBattle({mode:battleMode});return;}currentLevel++;TerraCampaign.ensure(currentLevel);data.level=currentLevel;save();showMenu();});
  tone(660,.2);setTimeout(()=>tone(880,.25),150);
 }else{
  data.sent+=b.stats.sent;data.commands+=b.stats.commands;data.captures+=b.stats.captured;const reward=battleMode==='campaign'?eco.defeatReward(currentLevel):battleMode==='duel'?eco.pvpReward(false):0;data.coins+=reward;save();
  openModal('result',sourceResult(false,reward));TerraLayout.apply();$('retry').onclick=()=>afterResultAd(b,()=>startBattle({mode:battleMode}));tone(200,.2);
 }
 if(battleMode==='rush'||battleMode==='duel'){const shares=b.territoryShare(),totals=b.totals(),factions=[1,...b.factions].map(owner=>({owner,territories:shares[owner],troops:totals[owner]})).sort((a,c)=>c.territories-a.territories||c.troops-a.troops);const table=document.createElement('div');table.className='battle-ranking';table.innerHTML=(battleMode==='duel'?'<strong>ОЧКИ ЛИГИ: '+meta.m.rating+'</strong>':'<strong>ИТОГ ГОНКИ</strong>')+factions.map((f,i)=>'<div><i style="background:'+color(f.owner)+'">'+(i+1)+'</i><b>'+(f.owner===1?TerraUI.escape(data.profileName):'Командир ИИ '+(f.owner-1))+'</b><span>'+f.territories+' терр. · '+f.troops+' бойцов</span></div>').join('');const action=$('next-level')||$('retry');action.parentNode.insertBefore(table,action);}
 $('result-menu').onclick=()=>afterResultAd(b,showMenu);
}
function openModal(type,html){modalType=type;$('modal').dataset.kind=type;drag=null;hoverTarget=null;$('fraction-panel').hidden=true;$('panel-content').innerHTML=html;globalThis.TerraAds?.refreshButtons();$('modal').hidden=false;TerraLayout.apply();if(battle&&!battle.result)battle.paused=true;const close=$('close-modal');if(close)close.onclick=()=>closeModal();}
function closeModal(resume=true){const cancelledPrebattle=modalType==='source-bonuses'&&pendingBonusSelection;if(cancelledPrebattle){pendingBonusSelection.cancel();pendingBonusSelection=null;}$('modal').hidden=true;modalType=null;if(mode==='battle')$('header').hidden=true;$('app').dataset.result='false';if(cancelledPrebattle){$('app').dataset.prebattle='false';showMenu();return;}if(resume&&battle&&!battle.result)battle.paused=countdownActive;}
function head(title){return '<div class="modal-head"><h2>'+title+'</h2><button class="close" id="close-modal" aria-label="Закрыть">×</button></div>';}
function sameDay(a,b){return a&&new Date(a).toDateString()===new Date(b).toDateString();}
function showWorld(page){
 const totalPages=Math.ceil(Math.max(200,data.unlocked+11)/10),chapter=Number.isInteger(page)?Math.max(0,Math.min(totalPages-1,page)):Math.floor(currentLevel/10),start=chapter*10;
 TerraCampaign.ensure(start+9);
 const firstPage=Math.max(0,Math.min(chapter-3,totalPages-7));
 openModal('world',head('Кампании')+'<p class="modal-sub">Исходные карты и этапы • повторная кампания</p><div class="chapter-switch"><button data-chapter="'+(chapter-1)+'" '+(!chapter?'disabled':'')+'>‹</button><b>УРОВНИ '+(start+1)+'–'+(start+10)+'</b><button data-chapter="'+(chapter+1)+'" '+(chapter===totalPages-1?'disabled':'')+'>›</button></div><div class="chapter-index">'+Array.from({length:Math.min(7,totalPages)},(_,j)=>firstPage+j).map(i=>'<button data-chapter="'+i+'" class="'+(i===chapter?'active':'')+'">'+(i+1)+'</button>').join('')+'</div>'+levels.slice(start,start+10).map((l,j)=>{const i=start+j,done=data.completed.includes(i),locked=i>data.unlocked;return '<div class="level-row '+(done?'done':'')+(locked?' locked':'')+'"><div class="level-no">'+(done?'✓':i+1)+'</div><div><b>'+l.name+'</b><small>'+l.subtitle+'</small>'+(done?'<small style="color:#e5b149">'+'★'.repeat(data.stars[i]||1)+'</small>':'')+'</div><button data-level="'+i+'" '+(locked?'disabled':'')+'>'+(locked?'ЗАКРЫТО':done?'СНОВА':'ИГРАТЬ')+'</button></div>';}).join('')+'<div class="footnote">Пройдено этапов: '+data.completed.length+'</div>');
 document.querySelectorAll('[data-chapter]').forEach(b=>b.onclick=()=>showWorld(+b.dataset.chapter));
 document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{currentLevel=+b.dataset.level;data.level=currentLevel;save();showMenu();});
}

function showSettings(){
 openModal('settings',head('Настройки')+'<div class="option-row">Звук<button id="sound-toggle" class="switch '+(data.sound?'on':'')+'" aria-label="Переключить звук"></button></div><div class="option-row">Вибрация<button id="vibration-toggle" class="switch '+(data.vibration?'on':'')+'" aria-label="Переключить вибрацию"></button></div><div class="option-row">Музыка<button id="music-toggle" class="switch '+(data.music?'on':'')+'" aria-label="Переключить музыку"></button></div><button class="secondary" data-feature="profile">Профиль командира</button><button class="secondary" data-feature="idle">Доход империи</button><button class="secondary" data-feature="rules">Правила и данные</button><button class="secondary" data-feature="privacy">Конфиденциальность</button><button class="secondary" id="help-settings">Как играть</button><button class="secondary" id="about">Об игре</button><div class="footnote">СТЕЙТ ШТОРМ • 0.19.0<br>Прогресс сохраняется автоматически</div>');
 $('music-toggle').onclick=()=>{data.music=!data.music;musicBeat();save();$('music-toggle').classList.toggle('on',data.music);};$('sound-toggle').onclick=()=>{data.sound=!data.sound;save();$('sound-toggle').classList.toggle('on',data.sound);tone();};$('vibration-toggle').onclick=()=>{data.vibration=!data.vibration;save();$('vibration-toggle').classList.toggle('on',data.vibration);vibrate();};$('help-settings').onclick=showHelp;$('about').onclick=()=>openModal('about',head('Стейт Шторм')+'<p class="modal-sub">Стратегия в реальном времени. Захватывай территории, управляй армией и развивай своё государство.</p><p class="modal-sub">Кампания на восстановленных картах с последовательностью и повторением этапов, улучшения, командиры и коллекция оформления. Игра работает без подключения к интернету.</p><p class="modal-sub">Географические карты используются как условное игровое поле.</p><div class="footnote">Версия 0.19.0 • © 2026<br>Картография: Natural Earth, общественное достояние</div>');
}
function showPause(){if(!battle||battle.result)return;openModal('pause',head('Пауза')+'<p class="modal-sub">'+levels[currentLevel].name+' • '+time(battle.time)+'</p><button class="primary modal-primary" id="resume">ПРОДОЛЖИТЬ</button><button class="secondary" id="restart">Начать заново</button><button class="secondary" id="back-menu">В главное меню</button>');$('resume').onclick=()=>closeModal();$('restart').onclick=()=>startBattle({mode:battleMode});$('back-menu').onclick=()=>{if(battleMode!=='duel'){showMenu();return;}openModal('leave',head('Покинуть дуэль?')+'<p class="detail-description">Выход будет учтён как поражение. Ты потеряешь 2 очка личной лиги.</p><button id="leave-duel" class="primary modal-primary">ПОКИНУТЬ</button><button id="stay-duel" class="secondary">ПРОДОЛЖИТЬ БОЙ</button>');$('stay-duel').onclick=()=>closeModal();$('leave-duel').onclick=()=>{battle.result='lose';finish('lose');showMenu();};};}
function showHelp(){
 openModal('help',head('Как играть')+'<div class="help-step"><i>1</i><div><b>Выбери свою базу</b><br>Проведи пальцем от цветного круга к серой или вражеской базе. Бойцы начнут выходить по одному после отпускания пальца. Кнопка процента задаёт размер отряда.</div></div><div class="help-step"><i>2</i><div><b>Объединяй силы</b><br>Проведи через несколько своих баз и закончи на цели. Или нажми «Все базы», затем укажи цель.</div></div><div class="help-step"><i>3</i><div><b>Развивай преимущество</b><br>Каждая твоя база производит бойцов до лимита гарнизона. Улучшения повышают вместимость; подкрепления могут превысить этот предел. Нейтральные базы не растут.</div></div><div class="help-step"><i>4</i><div><b>Сражайся с умом</b><br>Встречные отряды уничтожают друг друга. Враг тоже захватывает базы. Не оставляй весь тыл без защиты! Камера неподвижна. Если во время приказа коснуться поля вторым пальцем, выбор отменится.</div></div><div class="help-step"><i>5</i><div><b>Особые базы и способности</b><br>Завод быстрее производит бойцов, башня стреляет по врагам, форт крепче защищён. С 3-го уровня доступны разовые подкрепление и щит: выбери способность, затем свою базу.</div></div><button class="primary modal-primary" id="help-ok">ПОНЯТНО</button>');$('help-ok').onclick=()=>{data.seenHelp=true;save();closeModal();};
}
const skinDefs={base:[['Круг','circle',0],['Крепость','castle',120],['Кристалл','diamond',180],['Звезда','star',220],['Штаб','flag',260],['Щит','army',300]],fighter:[['Точки','circle',0],['Стрелы','arrow',100],['Ракеты','rocket',170],['Ромбы','diamond',200],['Звёзды','star',240],['Искры','speed',280]],color:[['Лазурь','#4cabe8',0],['Нефрит','#65be87',90],['Аметист','#b68add',120],['Золото','#eeb44f',160],['Коралл','#e87891',190],['Бирюза','#54bebd',210]]};
function showArmy(tab='base'){
 const tabs=[['base','БАЗЫ'],['fighter','БОЙЦЫ'],['color','ЦВЕТ']];
 openModal('army',head('Твоя армия')+'<p class="modal-sub">Побеждай, зарабатывай монеты и создавай свой стиль.</p><div class="tabs">'+tabs.map(([key,n])=>'<button data-tab="'+key+'" class="'+(key===tab?'active':'')+'">'+n+'</button>').join('')+'</div><div class="skin-grid">'+skinDefs[tab].map(([name,shape,price],i)=>{const own=data.owned[tab].includes(i);return '<button data-skin="'+i+'" class="skin-card '+(data[tab]===i?'selected':'')+'">'+(tab==='color'?'<span class="color-swatch" style="background:'+shape+'"></span>':shape==='circle'?'<span class="color-swatch" style="background:'+color(1)+'"></span>':icon(shape,color(1)))+'<b>'+name+'</b><small>'+(data[tab]===i?'ВЫБРАНО':own?'ВЫБРАТЬ':price+' монет')+'</small></button>';}).join('')+'</div><div class="footnote">'+icon('coin').replace('<svg ','<svg style="display:inline;width:15px;height:15px;vertical-align:middle" ')+' '+fmt(data.coins)+' монет</div>');
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>showArmy(b.dataset.tab));document.querySelectorAll('[data-skin]').forEach(b=>b.onclick=()=>{const i=+b.dataset.skin,price=skinDefs[tab][i][2];if(!data.owned[tab].includes(i)){if(data.coins<price){toast('Недостаточно монет. Побеждай в кампаниях!');return;}data.coins-=price;data.owned[tab].push(i);tone(780);}data[tab]=i;save();updateMenu();showArmy(tab);});
}
function showLeaders(){
 const defs=[['Стратег','leader','Сбалансированная армия. Доступен сразу.',0],['Командир','army','+3 бойца на старте каждой битвы.',150],['Инженер','castle','Производство бойцов быстрее на 12%.',250]];
 openModal('leaders',head('Командиры')+'<p class="modal-sub">Выбери бонус для своей стратегии.</p>'+defs.map(([name,ic,desc,price],i)=>'<div class="leader-card '+(data.leader===i?'selected':'')+'"><span>'+icon(ic)+'</span><div><b>'+name+'</b><small>'+desc+'</small></div><button data-leader="'+i+'">'+(data.leader===i?'ВЫБРАН':i===0||data['leaderOwned'+i]?'ВЫБРАТЬ':price+' '+ 'монет')+'</button></div>').join(''));
 document.querySelectorAll('[data-leader]').forEach(b=>b.onclick=()=>{const i=+b.dataset.leader,price=defs[i][3];if(i&&!data['leaderOwned'+i]){if(data.coins<price){toast('Нужно '+price+' монет');return;}data.coins-=price;data['leaderOwned'+i]=true;}data.leader=i;save();updateMenu();showLeaders();});
}
function tasks(){return [{id:'win1',title:'Первая победа',goal:1,current:data.wins,reward:40,icon:'trophy'},{id:'capture10',title:'Покори 10 территорий',goal:10,current:data.captures,reward:65,icon:'flag'},{id:'send100',title:'Отправь 100 бойцов',goal:100,current:data.sent,reward:50,icon:'units'},{id:'win5',title:'Выиграй 5 сражений',goal:5,current:data.wins,reward:100,icon:'world'},{id:'upgrade5',title:'Купи 5 улучшений',goal:5,current:data.upgrades.reduce((a,b)=>a+b,0),reward:90,icon:'speed'},{id:'campaign',title:'Покори весь мир',goal:5,current:data.completed.length,reward:250,icon:'star'}];}
function showTasks(){
 openModal('tasks',head('Задания')+'<p class="modal-sub">Каждое достижение приносит новые возможности.</p>'+tasks().map(t=>{const claimed=data.claimed.includes(t.id),ready=t.current>=t.goal;return '<div class="task-row"><span>'+icon(t.icon)+'</span><div><b>'+t.title+'</b><small>'+Math.min(t.goal,t.current)+' / '+t.goal+'</small></div><button data-task="'+t.id+'" '+(!ready||claimed?'disabled':'')+'>'+(claimed?'✓':ready?'+'+t.reward:t.reward+' монет')+'</button></div>';}).join(''));
 document.querySelectorAll('[data-task]').forEach(b=>b.onclick=()=>{const t=tasks().find(t=>t.id===b.dataset.task);if(!t||data.claimed.includes(t.id)||t.current<t.goal)return;data.coins+=t.reward;data.claimed.push(t.id);save();updateMenu();showTasks();tone(900);});
}
function showGift(){
 const claimed=sameDay(data.daily,Date.now()),consecutive=(Date.now()-data.daily)<48*3600*1000,streak=consecutive?data.streak%5:0,rewards=[50,75,100,150,250];
 openModal('gift',head('Ежедневная награда')+'<div class="gift-big">'+icon('gift')+'</div><p class="modal-sub" style="text-align:center">Возвращайся каждый день.<br>Твоя империя становится сильнее!</p><div class="daily-grid">'+rewards.map((n,i)=>'<div class="'+(i===streak?'today':'')+'"><small>ДЕНЬ '+(i+1)+'</small><b>'+n+'</b></div>').join('')+'</div><button class="primary modal-primary" id="claim-gift" '+(claimed?'disabled style="background:#c7d5e1;box-shadow:0 4px 0 #aebfd0"':'')+'>'+(claimed?'ПОЛУЧЕНО • ДО ЗАВТРА':'ЗАБРАТЬ '+rewards[streak]+' МОНЕТ')+'</button>');
 $('claim-gift').onclick=()=>{if(sameDay(data.daily,Date.now()))return;data.coins+=rewards[streak];data.daily=Date.now();data.streak=streak+1;save();updateMenu();showGift();tone(880);};
}
function mapPoint(ev){const r=canvas.getBoundingClientRect();return {x:(ev.clientX-r.left-view.x)/view.s,y:(ev.clientY-r.top-view.y)/view.s,sx:ev.clientX-r.left,sy:ev.clientY-r.top};}
function regionAt(p){
 const regions=battle?battle.regions:battleConfig().regions.map(r=>({...r,x:r.center[0],y:r.center[1],units:r.units,active:(r.stage||0)===0}));
 let nearest=null,min=Infinity;for(const r of regions){if(r.active===false)continue;const dy=(battle?battle.level:levels[currentLevel]).sourcePort?-26*W/390:r.owner?20:0,d=Math.min(Math.hypot(r.x-p.x,r.y-p.y)*view.s,Math.hypot((r.x-p.x)*view.s,(r.y-p.y)*view.s-dy));if(d<min){min=d;nearest=r;}}
 if(min<22)return nearest;
 const index=regions.findIndex(r=>r.active!==false&&(r.polys||[r.poly]).some(poly=>inside(p.x,p.y,poly)));return index<0?null:regions[index];
}
function ownBaseAt(p){return battle.regions.find(r=>r.active!==false&&r.owner===1&&Math.hypot(r.x-p.x,r.y-p.y)*view.s<24);}
function sendOrder(target){
 const sources=[...selected].filter(id=>id!==target&&battle.regions[id].owner===1),count=battle.command(sources,target,fraction);
 if(count){for(const id of sources)orderPulses.push({from:id,to:target,life:.3});selected.clear();tone(540);vibrate();$('hint').hidden=true;$('skill-hint').textContent='Отряд выходит с базы';}
 hoverTarget=null;updateBattle();return count;
}
// Fixed battlefield. Multi-touch cancels an in-progress command until all fingers lift.
const touchPoints=new Map();let multiTouch=false;
canvas.addEventListener('pointerdown',ev=>{
 if(mode!=='battle'||!$('modal').hidden||!battle||battle.paused)return;
 touchPoints.set(ev.pointerId,true);
 if(touchPoints.size>=2){multiTouch=true;drag=null;selected.clear();hoverTarget=null;ev.preventDefault();ev.stopImmediatePropagation();canvas.setPointerCapture(ev.pointerId);}
},true);
canvas.addEventListener('pointermove',ev=>{if(multiTouch){ev.preventDefault();ev.stopImmediatePropagation();}},true);
for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,ev=>{
 touchPoints.delete(ev.pointerId);if(multiTouch){ev.stopImmediatePropagation();drag=null;hoverTarget=null;selected.clear();if(!touchPoints.size)multiTouch=false;}
},true);
canvas.addEventListener('pointerdown',ev=>{
 if(mode!=='battle'||!$('modal').hidden||!battle||battle.result||battle.paused||battle.stageTransition>0||multiTouch)return;
 ev.preventDefault();$('fraction-panel').hidden=true;canvas.setPointerCapture(ev.pointerId);const p=mapPoint(ev),r=regionAt(p);pointer=p;
 if(casting){if(r&&(casting==='leader'?battle.activateLeader(r.id):r.owner===1&&battle.cast(casting,r.id))){tone(800);vibrate();casting=null;$('skill-hint').textContent='Способность применена';updateBattle();}else toast(casting==='leader'&&[1,4].includes(battle.leaderType)?'Выбери вражескую базу':'Выбери свою базу');return;}
 const had=r&&selected.has(r.id);
 if(r&&r.owner===1){selected.add(r.id);drag={kind:'order',start:r.id,pointer:ev.pointerId,origin:p,moved:false,had};tone(400,.03);}
 else if(selected.size&&r){drag={kind:'target',start:null,pointer:ev.pointerId,origin:p,moved:false};hoverTarget=r.id;}
 else{selected.clear();hoverTarget=null;drag={kind:'pan',pointer:ev.pointerId,origin:p,last:p,moved:false};}
 updateBattle();
});
canvas.addEventListener('pointermove',ev=>{
 if(!drag||drag.pointer!==ev.pointerId||!battle||battle.paused)return;
 const p=mapPoint(ev);pointer=p;drag.moved=drag.moved||Math.hypot(p.sx-drag.origin.sx,p.sy-drag.origin.sy)>7;
 if(drag.kind==='pan')return;
 const own=ownBaseAt(p);if(own&&drag.kind==='order')selected.add(own.id);
 const r=regionAt(p);hoverTarget=r&&r.id!==drag.start?r.id:null;
});
canvas.addEventListener('pointerup',ev=>{
 if(!drag||drag.pointer!==ev.pointerId||!battle)return;
 const d=drag,p=mapPoint(ev),r=regionAt(p);drag=null;
 if(d.kind!=='pan'&&!battle.paused){
  if(r&&r.id!==d.start)sendOrder(r.id);
  else if(d.moved){selected.clear();hoverTarget=null;}
  else if(d.had){selected.delete(d.start);hoverTarget=null;}
 }
 hoverTarget=null;updateBattle();
});
canvas.addEventListener('pointercancel',()=>{drag=null;selected.clear();hoverTarget=null;});
canvas.addEventListener('lostpointercapture',()=>{if(drag){drag=null;hoverTarget=null;selected.clear();}});
canvas.addEventListener('wheel',ev=>{if(mode==='battle')ev.preventDefault();},{passive:false});
function commandArrow(a,b,alpha=1){
 if(battle?.level.sourcePort){const record=TerraAssets.sprites['143e1e11d349942ddb4807c5c4f2680d:1'];let image=spriteImages.get(record.file);if(!image){image=new Image();image.src=record.file;spriteImages.set(record.file,image);}if(image.complete&&image.naturalWidth){const key='arrow:'+color(1);if(!spriteCache.has(key)){const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;const sc=c.getContext('2d');sc.drawImage(image,0,0);sc.globalCompositeOperation='source-in';sc.fillStyle=color(1);sc.fillRect(0,0,c.width,c.height);spriteCache.set(key,c);}const tinted=spriteCache.get(key),dx=b.x-a.x,dy=b.y-a.y,length=Math.max(1,Math.hypot(dx,dy)-12/view.s),height=32/view.s,left=height*record.border[0]/record.size[1],right=Math.min(length-left,height*record.border[2]/record.size[1]);if(length>left+right){ctx.save();ctx.translate(a.x,a.y);ctx.rotate(Math.atan2(dy,dx));ctx.globalAlpha=alpha;const [l,,r]=record.border,sw=record.size[0],sh=record.size[1];ctx.drawImage(tinted,0,0,l,sh,0,-height/2,left,height);ctx.drawImage(tinted,l,0,sw-l-r,sh,left,-height/2,length-left-right,height);ctx.drawImage(tinted,sw-r,0,r,sh,length-right,-height/2,right,height);ctx.restore();return;}}}
 const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy),inset=19/view.s;if(dist<inset*1.5)return;
 const length=dist-inset,head=Math.min(22/view.s,length*.5),half=5/view.s,wing=12/view.s;
 ctx.save();ctx.translate(a.x,a.y);ctx.rotate(Math.atan2(dy,dx));ctx.globalAlpha=alpha;ctx.fillStyle=color(1);ctx.strokeStyle='#ffffffdb';ctx.lineWidth=1.4/view.s;ctx.lineJoin='round';
 ctx.beginPath();ctx.moveTo(inset,-half);ctx.lineTo(length-head,-half);ctx.lineTo(length-head,-wing);ctx.lineTo(length,0);ctx.lineTo(length-head,wing);ctx.lineTo(length-head,half);ctx.lineTo(inset,half);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}
function sourceFighterVisible(u){if(battle?.effects.type!==40)return true;const c=battle.effects.cfg;if(u.owner===1)return !c._isOwnFightersHidden;const radius=(battle.level.unit||40)*c._buildingRevealRadius;return battle.regions.some(r=>r.active&&r.owner===1&&Math.hypot(r.x-u.x,r.y-u.y)<=radius);}
function drawDot(x,y,r,owner,shape,unit=null){
 if(owner&&artImage.complete&&artImage.naturalWidth){const it=owner===1?eco.item(eco.c.equipped.fighter):TerraCollection.CATALOG.find(x=>x.nativeId===battle?.botProfiles[owner]?.skins.fighter)||{art:8,hue:0};const source=battle?.level.sourcePort&&unit?.path,size=source?TerraSourceMovement.visualSize(battle.level,battle.regions[unit.from],it.nativeId):Math.min(14,10.5*Math.sqrt(zoom))/view.s;if(source){const p=unit.path[Math.min(unit.pathIndex,unit.path.length-1)];ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(p.y-unit.y,p.x-unit.x)+Math.PI/2);const drawn=paintSprite(it.art,-size*.5,-size*.5,size,size,it.hue,color(owner));ctx.restore();if(drawn)return;}else if(paintSprite(it.art,x-size*.5,y-size*.65,size,size,it.hue,color(owner)))return;}
 ctx.fillStyle=color(owner);if(!shape){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();return;}
 if(shape===1){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x-r,y-r);ctx.lineTo(x-r*.5,y);ctx.lineTo(x-r,y+r);ctx.closePath();ctx.fill();}
 else if(shape===2){ctx.beginPath();ctx.ellipse(x,y,r*1.6,r*.65,-.6,0,6.3);ctx.fill();}
 else if(shape===3){ctx.beginPath();ctx.moveTo(x,y-r*1.4);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r*1.4);ctx.lineTo(x-r,y);ctx.fill();}
 else{ctx.save();ctx.translate(x,y);ctx.beginPath();for(let i=0;i<10;i++){let rad=i%2?r*.5:r*1.5,a=i*Math.PI/5-Math.PI/2;ctx.lineTo(Math.cos(a)*rad,Math.sin(a)*rad);}ctx.closePath();ctx.fill();ctx.restore();}
}
function paintEffect(name,x,y,size,tint=null,angle=0){const file=TerraSourceRuntime.file(name);if(!file)return;let image=spriteImages.get(file);if(!image){image=new Image();image.src=file;spriteImages.set(file,image);}if(!image.complete||!image.naturalWidth)return;let sprite=image;if(tint){const key='effect:'+file+':'+tint;if(!spriteCache.has(key)){const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;const sc=c.getContext('2d');sc.drawImage(image,0,0);sc.globalCompositeOperation='source-in';sc.fillStyle=tint;sc.fillRect(0,0,c.width,c.height);spriteCache.set(key,c);}sprite=spriteCache.get(key);}ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(sprite,-size/2,-size/2,size,size);ctx.restore();}
function drawObjectives(){const o=battle.objective;if(o.type===20){const z=o.zone;ctx.save();ctx.beginPath();ctx.rect(-view.x/view.s,-view.y/view.s,W/view.s,H/view.s);ctx.arc(z.x,z.y,z.radius,0,Math.PI*2,true);ctx.fillStyle='#df455b24';ctx.fill('evenodd');ctx.beginPath();ctx.arc(z.x,z.y,z.radius,0,Math.PI*2);ctx.strokeStyle='#e85272';ctx.lineWidth=3/view.s;ctx.stroke();ctx.restore();}if(o.type===30)for(const id of o.mines){const r=battle.regions[id];paintEffect('icon_coin',r.x,r.y-31/view.s,25/view.s);}if(o.type===50)for(const [owner,id]of Object.entries(o.capitals))if(!o.eliminated.includes(+owner)){const r=battle.regions[id];paintEffect('capital crown',r.x,r.y-28/view.s,30/view.s);}}
function drawBattleEffects(){const e=battle.effects;if(!e)return;const now=battle.time;for(const f of e.flights){const r=battle.regions[f.target],progress=Math.min(1,(now-f.start)/(f.end-f.start)),left=-view.x/view.s-50/view.s,right=(W-view.x)/view.s+50/view.s,x=progress<=.5?left+(r.x-left)*progress*2:r.x+(right-r.x)*(progress-.5)*2,y=r.y-34/view.s;paintEffect('icon_airplane_stroke',x,y,44/view.s,null,Math.PI/2);paintEffect('icon_airplane',x,y,40/view.s,color(f.owner),Math.PI/2);ctx.fillStyle=color(f.owner);ctx.font='bold '+12/view.s+'px SourceRoboto';ctx.textAlign='center';ctx.fillText('+'+f.amount,x,y+28/view.s);}
for(const bomb of e.bombs){const r=battle.regions[bomb.target],remaining=Math.max(0,bomb.at-now),shake=remaining<.5?Math.sin(now*32)*.4:0;paintEffect('bomb_icon',r.x,r.y-36/view.s,34/view.s,null,shake);ctx.fillStyle='#fff';ctx.strokeStyle='#23354e';ctx.lineWidth=3/view.s;ctx.font='bold '+15/view.s+'px SourceRoboto';ctx.textAlign='center';const text=String(Math.ceil(remaining));ctx.strokeText(text,r.x,r.y-57/view.s);ctx.fillText(text,r.x,r.y-57/view.s);}
for(const hit of e.impacts){const r=battle.regions[hit.target],p=(now-hit.at)/hit.duration;paintEffect('Explosion_'+Math.min(5,Math.floor(p*6)),r.x,r.y,(36+28*Math.sin(p*Math.PI))/view.s);}}
// World zone surface: the small bm_* atlas image is a help icon, not the map material.
function drawSourceZone(zone){
 const {x,y,radius:r}=zone;ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();
 const up=zone.factor>1;ctx.fillStyle=up?'#71b28712':'#a9767410';ctx.fillRect(x-r,y-r,2*r,2*r);ctx.fillStyle=up?'#59926b80':'#8a707480';
 const stride=r*.48,aw=r*.105,ah=r*.2;
 for(let row=-2;row<=2;row++)for(let col=-2;col<=2;col++){
  const cx=x+col*stride+(row%2?stride*.5:0),cy=y+row*stride;ctx.save();ctx.translate(cx,cy);if(up)ctx.rotate(Math.PI);
  for(let k=0;k<4;k++)ctx.fillRect(-aw*.45,-ah*.8+k*ah*.12,aw*.9,ah*.055);
  ctx.beginPath();ctx.moveTo(-aw*.45,-ah*.25);ctx.lineTo(aw*.45,-ah*.25);ctx.lineTo(aw*.45,ah*.15);ctx.lineTo(aw,ah*.15);ctx.lineTo(0,ah*.85);ctx.lineTo(-aw,ah*.15);ctx.lineTo(-aw*.45,ah*.15);ctx.closePath();ctx.fill();ctx.restore();
 }
 ctx.restore();ctx.save();ctx.strokeStyle=up?'#56966c':'#a45d56';ctx.lineWidth=1*(W/390)/view.s;ctx.setLineDash([r*.13,r*.075]);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function render(now){
 const dt=Math.min(.2,Math.max(0,(now-lastFrame)/1000));lastFrame=now;
 if(battle&&!battle.paused&&!battle.result){battle.step(dt);for(const ev of battle.drainEvents()){
  if(ev.type==='capture'){if(!battle.level.sourcePort)for(let i=0;i<12;i++)particles.push({x:ev.x,y:ev.y,vx:(Math.random()-.5)*120,vy:(Math.random()-.5)*120,life:.6,color:color(ev.owner)});if(ev.owner===1){tone(650,.08);vibrate();}}
  else if(ev.type==='stage'){selected.clear();drag=null;hoverTarget=null;casting=null;orderPulses=[];particles=[];shotLines=[];const from={...view};resize();cameraTween={from,to:{...view},elapsed:0};toast('УЧАСТОК '+(ev.stage+1)+' ИЗ '+ev.total);updateBattle();}
  else if(ev.type==='blast'){for(let i=0;i<24;i++){const angle=i*Math.PI/12;particles.push({x:ev.x,y:ev.y,vx:Math.cos(angle)*240,vy:Math.sin(angle)*240,life:.5,color:'#c4f6ff'});}}
  else if(ev.type==='clash')particles.push({x:ev.x,y:ev.y,vx:0,vy:0,life:.18,color:'#ffffff'});
  else if(ev.type==='shot')shotLines.push({...ev,life:.15});else if(ev.type==='finish')finish(ev.result);
 }}

 if(mode==='battle'&&battle){armyBar.update(battle.totals());armyBar.step(dt);}
 if(cameraTween){cameraTween.elapsed+=dt;const f=Math.min(1,cameraTween.elapsed/.85),t=f*f*(3-2*f);for(const key of ['x','y','s'])view[key]=cameraTween.from[key]+(cameraTween.to[key]-cameraTween.from[key])*t;if(f===1)cameraTween=null;}
 if(now-lastUi>180){lastUi=now;if(mode==='battle')updateBattle();}
 ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle=mode==='menu'&&$('app').dataset.prebattle!=='true'?'#d2d2d2':TerraSourceRuntime.hex(TerraSource.styles.find(x=>x.id===eco.c.sourceStyle)?.background||TerraSource.styles[0].background);ctx.fillRect(0,0,W,H);
 ctx.save();ctx.beginPath();ctx.rect(view.rect.x,view.rect.y,view.rect.width,view.rect.height);ctx.clip();ctx.translate(view.x,view.y);ctx.scale(view.s,view.s);
 const regions=battle?battle.regions:battleConfig().regions.map(r=>({...r,x:r.center[0],y:r.center[1],units:r.units,active:(r.stage||0)===0}));
 ctx.save();ctx.translate(0,4/view.s);ctx.fillStyle='#0000001a';for(let i=0;i<paths.length;i++)if(!regions[i].sourceHidden)ctx.fill(paths[i]);ctx.restore();
 for(let i=0;i<regions.length;i++){
  const r=regions[i];if(r.sourceHidden)continue;const current=battle?battle.stage:0,sourceCurrent=(battle?battle.level:levels[currentLevel]).sourceStageIndex??current,sourceStage=r.sourceStageIndex??r.stage??0;ctx.globalAlpha=sourceStage>sourceCurrent?.25:1;ctx.fillStyle=TerraAppearance.areaColor(sourcePalette(r.owner),sourceStage,sourceCurrent,r.owner===0,eco.c.sourceStyle==='stl_1_origin'?'#cedbeb':null);if(mode==='menu'&&$('app').dataset.prebattle!=='true'){ctx.globalAlpha=1;if(sourceStage>sourceCurrent)ctx.fillStyle='#8f8f8f';}ctx.strokeStyle='#ffffff';ctx.lineWidth=(mode==='menu'?.65:2)/view.s;ctx.lineJoin='round';ctx.fill(paths[i]);ctx.stroke(paths[i]);
  if(selected.has(r.id)&&mode==='battle'){ctx.globalAlpha=.22;ctx.fillStyle='#fff';ctx.fill(paths[i]);ctx.globalAlpha=1;ctx.strokeStyle='#fff';ctx.lineWidth=3/view.s;ctx.stroke(paths[i]);}
  if(hoverTarget===r.id){ctx.globalAlpha=.2;ctx.fillStyle=r.owner===1?color(1):'#ff8c37';ctx.fill(paths[i]);ctx.globalAlpha=1;}
  if(battle&&battle.level.fog&&r.active&&!battle.visible(1,r.id)){ctx.globalAlpha=.18;ctx.fillStyle='#293665';ctx.fill(paths[i]);ctx.globalAlpha=1;}
  if(r.pulse>0&&!((battle?battle.level:levels[currentLevel]).sourcePort)){ctx.globalAlpha=r.pulse*.35;ctx.fillStyle='#fff';ctx.fill(paths[i]);ctx.globalAlpha=1;}
 }
 ctx.globalAlpha=1;for(const zone of (battle?battle.level.zones:[])||[]){const map=battle?battle.level:levels[currentLevel];if(map.sourcePort){if(zone.sourceStageIndex>map.sourceStageIndex)continue;drawSourceZone(zone);continue;}if(zone.stage!==undefined&&zone.stage!==(battle?.stage||0))continue;ctx.save();ctx.fillStyle=zone.factor>1?'#f4c04b32':'#8b6cce32';ctx.strokeStyle=zone.factor>1?'#d3a33588':'#7b69c988';ctx.lineWidth=2/view.s;ctx.setLineDash([4/view.s,5/view.s]);ctx.beginPath();ctx.arc(zone.x,zone.y,zone.radius,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#6558a6';ctx.font='bold '+8/view.s+'px SourceRoboto';ctx.textAlign='center';ctx.fillText('×'+zone.factor,zone.x,zone.y+zone.radius*.5);ctx.restore();}
 if(!((battle?battle.level:levels[currentLevel]).sourcePort))for(let i=0;i<regions.length;i++){
  const r=regions[i],qty=Math.min(150,Math.floor(r.units));if(!r.owner||r.active===false)continue;
  for(let j=0;j<qty&&j<dots[i].length;j++){const d=dots[i][j],wiggle=Math.sin(now*.0017+d.phase)*1.1;drawDot(d.x+wiggle,d.y,Math.max(2.7,1.75/view.s),r.owner,r.owner===1?data.fighter:0);}
 }
 if(battle){
  drawObjectives();drawBattleEffects();
  for(const line of shotLines){ctx.strokeStyle=color(line.owner);ctx.lineWidth=2/view.s;ctx.globalAlpha=Math.min(1,line.life*7);ctx.beginPath();ctx.moveTo(line.x,line.y);ctx.lineTo(line.tx,line.ty);ctx.stroke();line.life-=dt;}shotLines=shotLines.filter(l=>l.life>0);ctx.globalAlpha=1;
  for(const u of battle.units)if(sourceFighterVisible(u))drawDot(u.x,u.y+(battle.level.sourcePort?0:Math.sin(now*.013+u.id)*1.2/view.s),Math.max(3,2.1/view.s),u.owner,u.owner===1?data.fighter:0,u);
 }
 if(selected.size&&mode==='battle'){
  for(const id of selected){const r=regions[id];if(r.owner!==1)continue;ctx.strokeStyle='#fff';ctx.lineWidth=3/view.s;ctx.beginPath();ctx.arc(r.x,r.y,23/view.s,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=color(1);ctx.lineWidth=1.6/view.s;ctx.beginPath();ctx.arc(r.x,r.y,27/view.s,0,Math.PI*2);ctx.stroke();
   if(drag&&drag.kind!=='pan'&&(drag.moved||hoverTarget!==null)){const target=hoverTarget===null?pointer:regions[hoverTarget];if(target.id!==id)commandArrow(r,target,.92);}
  }
 }
 for(const order of orderPulses){commandArrow(regions[order.from],regions[order.to],Math.max(0,order.life/.3)*.55);order.life-=dt;}orderPulses=orderPulses.filter(o=>o.life>0);
 if(hoverTarget!==null){const r=regions[hoverTarget];ctx.strokeStyle=r.owner===1?color(1):'#ff9c3c';ctx.lineWidth=3/view.s;ctx.beginPath();ctx.arc(r.x,r.y,25/view.s,0,Math.PI*2);ctx.stroke();}
 for(const r of regions){
  if(mode==='menu'&&$('app').dataset.prebattle!=='true')continue;
  if(r.active===false){if(r.sourceEnabled===false)continue;const map=battle?battle.level:levels[currentLevel];if(map.sourcePort&&r.sourceStageIndex<map.sourceStageIndex){const base=eco.item(eco.c.equipped.base),size=34*(W/390)/view.s;const classic=eco.c.sourceStyle==='stl_1_origin';ctx.globalAlpha=classic?1:.14;paintSprite(base.art,r.x-size/2,r.y-size/2,size,size,base.hue,classic?'#b5c6d6':color(1));ctx.globalAlpha=1;}continue;}
  const source=(battle?battle.level:levels[currentLevel]).sourcePort;
  if(source){
   const ui=W/390,baseArt=r.owner===1?eco.item(eco.c.equipped.base):TerraCollection.CATALOG.find(x=>x.nativeId===battle?.botProfiles[r.owner]?.skins.base)||{art:4,hue:0},size=34*ui/view.s;
   if(!r.owner||!paintSprite(baseArt.art,r.x-size/2,r.y-size/2,size,size,baseArt.hue,color(r.owner))){ctx.fillStyle=r.owner?color(r.owner):'#fff';ctx.beginPath();ctx.arc(r.x,r.y,16.5*ui/view.s,0,Math.PI*2);ctx.fill();}
   const skinLevel=r.owner===1?eco.inventory(baseArt.id).level:1;
   if(r.owner&&skinLevel>1){ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 '+9*ui/view.s+'px SourceRoboto';ctx.lineWidth=2*ui/view.s;ctx.strokeStyle='#222';ctx.fillStyle='#fff';ctx.strokeText('Ⅱ',r.x+12*ui/view.s,r.y+10*ui/view.s);ctx.fillText('Ⅱ',r.x+12*ui/view.s,r.y+10*ui/view.s);}
   ctx.fillStyle='#000';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 '+14*ui/view.s+'px SourceRoboto';ctx.fillText(battle&&!battle.visible(1,r.id)?'?':Math.floor(r.units),r.x,r.y+26*ui/view.s);
  }else{
  if(r.owner){const baseArt=r.owner===1?eco.item(eco.c.equipped.base):TerraCollection.CATALOG.find(x=>x.nativeId===battle?.botProfiles[r.owner]?.skins.base)||{art:4,hue:0};const size=36/view.s;paintSprite(baseArt.art,r.x-size/2,r.y-size/2,size,size,baseArt.hue,color(r.owner));}
 const counterY=r.owner?r.y-23/view.s:r.y;ctx.save();ctx.translate(0,counterY-r.y);
 const radius=(r.owner?13:12)/view.s;ctx.fillStyle=r.owner?color(r.owner):'#969696';ctx.strokeStyle='#fff';ctx.lineWidth=1.8/view.s;
  ctx.beginPath();ctx.arc(r.x,r.y,radius,0,Math.PI*2);ctx.fill();ctx.stroke();
  if(battle&&r.owner&&battle.reserved(r.id)>0){const reserved=battle.reserved(r.id);ctx.strokeStyle='#fff';ctx.lineWidth=2.2/view.s;ctx.beginPath();ctx.arc(r.x,r.y,radius+3.5/view.s,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,reserved/Math.max(1,r.units)));ctx.stroke();}
  ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 '+(r.units>=100?11:13)/view.s+'px SourceRoboto';ctx.fillText(battle&&!battle.visible(1,r.id)?'?':Math.floor(r.units),r.x,r.y+.5/view.s);
  ctx.restore();
  }
  if(r.kind!=='normal'&&source){const name={reinforcement:'bm_add_unts_on_building',shield:'bm_shield_on_building',factory:'bm_propaganda_building',turret:'bm_turret_building'}[r.kind],file=TerraSourceRuntime.file(name);if(file){let im=spriteImages.get(file);if(!im){im=new Image();im.src=file;spriteImages.set(file,im);}const size=27*(W/390)/view.s;if(im.complete&&im.naturalWidth)ctx.drawImage(im,r.x-size*.1,r.y-size*.95,size,size);}}else if(r.kind!=='normal'){
   ctx.fillStyle=r.kind==='factory'?'#63b882':r.kind==='turret'?'#d6967a':'#9c8ec6';ctx.beginPath();ctx.arc(r.x+10/view.s,r.y-12/view.s,6/view.s,0,6.3);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold '+7/view.s+'px SourceRoboto';ctx.fillText(r.kind==='factory'?'+':r.kind==='turret'?'⊕':r.kind==='reinforcement'?'+50':r.kind==='shield'?'◆':'▣',r.x+10/view.s,r.y-12/view.s);
  }
  if(r.poison>0){ctx.strokeStyle='#8cdd6e';ctx.lineWidth=3/view.s;ctx.globalAlpha=.75;ctx.beginPath();ctx.arc(r.x,r.y,24/view.s,0,6.3);ctx.stroke();ctx.globalAlpha=1;}
  if(r.frozen>0){ctx.strokeStyle='#83eeff';ctx.lineWidth=3/view.s;ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(r.x,r.y,22/view.s,0,6.3);ctx.stroke();ctx.globalAlpha=1;}
  if(r.shield>0){ctx.strokeStyle='#a98cdc';ctx.lineWidth=2.4/view.s;ctx.globalAlpha=.7+.2*Math.sin(now/100);ctx.beginPath();ctx.arc(r.x,r.y,23/view.s,0,6.3);ctx.stroke();ctx.globalAlpha=1;}
 }
 // Repeat the gesture until the player actually sends an order.
 if(battle&&!battle.firstCommand&&!battle.result&&!battle.paused){
  const a=regions.find(r=>r.active&&r.owner===1),targets=a?regions.filter(r=>r.active&&r.owner!==1).sort((x,y)=>Math.hypot(x.x-a.x,x.y-a.y)-Math.hypot(y.x-a.x,y.y-a.y)):[],b=targets[0];
  if(a&&b){const t=(now%2400)/2400,f=Math.max(0,Math.min(1,(t-.18)/.6)),p={x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};let im=spriteImages.get('tutorial-hand');if(!im){im=new Image();im.src=TerraSourceRuntime.file('tutorial_finger');spriteImages.set('tutorial-hand',im);}ctx.globalAlpha=t>.87?(1-t)/.13:Math.min(1,t/.12);if(f>0&&t<.88)commandArrow(a,p,.5);const size=76*(W/590)/view.s;if(im.complete&&im.naturalWidth)ctx.drawImage(im,p.x-size*.22,p.y-size*.12,size,size);ctx.globalAlpha=1;}
 }
 for(const p of particles.filter(p=>!p.screen)){ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,3/view.s,0,6.3);ctx.fill();}ctx.globalAlpha=1;ctx.restore();
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.screen){p.vy+=170*dt;ctx.globalAlpha=Math.min(1,p.life);ctx.fillStyle=p.color;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(now/300+p.vx);ctx.fillRect(-3,-2,6,4);ctx.restore();}}ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);
 requestAnimationFrame(render);
}
let adPausedBattle=null;
window.addEventListener('terra-ad-start',()=>{if(battle&&!battle.result){adPausedBattle={battle,paused:battle.paused};battle.paused=true;}save();});
window.addEventListener('terra-ad-end',()=>{if(adPausedBattle?.battle===battle&&!battle.result)battle.paused=adPausedBattle.paused;adPausedBattle=null;});
window.addEventListener('terra-ad-state',()=>globalThis.TerraAds?.refreshButtons());
async function afterResultAd(target,action){if(target.resultTransition)return;target.resultTransition=true;try{if(!target.interstitialHandled&&!target.multiplied&&TerraAdPolicy.eligible(target.level.index+1,target.result,battleMode)){target.interstitialHandled=true;await globalThis.TerraAds?.interstitial();}if(battle===target)action();}finally{target.resultTransition=false;}}
document.addEventListener('click',async ev=>{
 const button=ev.target.closest('[data-ad-placement]');if(!button||button.disabled)return;
 const placement=button.dataset.adPlacement,value=button.dataset.adValue;
 if(['battle_bonus','skill_speedup','idle_instant','idle_double','resource_gift','wheel_spin','operation_reroll'].includes(placement))return;
 const target=battle;
 if(!await globalThis.TerraAds?.reward(placement))return;
 if(placement==='result_x3'){
  if(battle!==target||target.result!=='win'||target.multiplied||!target.resultCoinReward)return;
  target.multiplied=true;data.coins+=target.resultCoinReward*2;button.dataset.adLocked='true';button.disabled=true;button.textContent='ПОЛУЧЕНО';
 }else if(placement==='core_upgrade'){
  const i=+value;if(![0,1,3].includes(i)||TerraProgression.core(data,i).max)return;data.upgrades[i]++;
 }else if(placement==='color_unlock'){
  const it=eco.item(value);if(it?.category!=='color'||!eco.visible(value)||eco.inventory(value).owned)return;
  eco.c.cards[value]={...eco.inventory(value),owned:true,level:1};eco.c.equipped.color=value;save();hub.details(value);
 }else if(placement==='daily_refresh'){
  eco.c.dailyRefresh=(eco.c.dailyRefresh||0)+1;eco.c.dailyBought=[];eco.c.sourceOfferStamp='';eco.dailyOffers();
 }else return;
 save();updateMenu();if(hub.tab!=='play')hub.render();
});
function speedupSkill(type){
 if(!battle||battle.result)return;const remaining=type==='leader'?battle.leaderCooldown:battle.cooldowns[type];if(remaining<=0)return;
 openModal('speedup',head('Ускорить приказ')+'<div class="shortage-hero">'+TerraUI.resource('tickets')+'</div><p class="detail-description">До готовности: '+Math.ceil(remaining)+' секунд. Используй один экспресс-билет, чтобы завершить перезарядку. Билет не добавляет новых зарядов.</p><button id="speedup-skill" class="primary modal-primary" '+(!data.tickets?'disabled':'')+'>УСКОРИТЬ '+TerraUI.amount('tickets',1)+'</button><button class="blue-button" data-ad-placement="skill_speedup" disabled>УСКОРИТЬ — ВИДЕО</button>');
 const target=battle;document.querySelector('[data-ad-placement="skill_speedup"]').onclick=async()=>{if(await globalThis.TerraAds?.reward('skill_speedup')){if(battle===target&&!target.result){if(type==='leader')target.leaderCooldown=0;else target.cooldowns[type]=0;save();closeModal();updateBattle();}}};
 $('speedup-skill').onclick=()=>{if(!eco.spend('tickets',1))return;if(type==='leader')battle.leaderCooldown=0;else battle.cooldowns[type]=0;save();closeModal();updateBattle();};
}
const bindIcon=(id,name)=>$(id).innerHTML=id==='settings'?TerraIdentity.image('settings'):icon(name);
bindIcon('settings','gear');bindIcon('coin-icon','coin');bindIcon('level-open','chevron');bindIcon('play-arrow','arrow');bindIcon('pause','pause');bindIcon('help','help');
for(const [id,name] of [['gift','gift'],['leader','leader'],['nav-army','army'],['nav-world','world'],['nav-events','tasks'],['select-all','select'],['reinforce','plus'],['shield','shield']])$(id).querySelector('span').innerHTML=icon(name);
$('settings').onclick=showSettings;$('level-open').onclick=showWorld;$('nav-world').onclick=showWorld;$('nav-army').onclick=()=>showArmy();$('quests').onclick=showTasks;$('gift').onclick=showGift;$('leader').onclick=showLeaders;
$('play').onclick=startBattle;$('pause').onclick=showPause;$('help').onclick=showHelp;
$('upgrades').onclick=e=>{const button=e.target.closest('[data-upgrade]');if(button)buyUpgrade(+button.dataset.upgrade);};
$('select-all').onclick=()=>{if(!battle)return;casting=null;const own=battle.regions.filter(r=>r.active&&r.owner===1);if(selected.size===own.length)selected.clear();else own.forEach(r=>selected.add(r.id));$('skill-hint').textContent=selected.size?'Теперь укажи цель':'Проведи от своей базы к цели';updateBattle();};
$('fraction').onclick=()=>{if(!battle||battle.paused)return;if(battle.level.sourcePort){setFraction(fraction===1?50:100);return;}$('fraction-panel').hidden=!$('fraction-panel').hidden;$('fraction-range').value=Math.round(fraction*100);$('fraction-value').textContent=Math.round(fraction*100)+'%';};
function setFraction(percent){fraction=Math.max(.05,Math.min(1,percent/100));$('fraction').querySelector('b').textContent=Math.round(fraction*100)+'%';$('fraction-value').textContent=Math.round(fraction*100)+'%';$('fraction-range').value=Math.round(fraction*100);updateBattle();}
$('fraction-range').oninput=e=>setFraction(+e.target.value);
document.querySelectorAll('[data-fraction]').forEach(button=>button.onclick=()=>{setFraction(+button.dataset.fraction);$('fraction-panel').hidden=true;tone(500,.04);});
$('fraction-close').onclick=()=>{$('fraction-panel').hidden=true;};
for(const key of ['reinforce','shield'])$(key).onclick=()=>{if(battle&&battle.cooldowns[key]>0){speedupSkill(key);return;}casting=casting===key?null:key;selected.clear();$('skill-hint').textContent=casting?'Выбери свою базу для '+(key==='shield'?'защиты':'подкрепления'):'Проведи от своей базы к цели';updateBattle();};
$('scrim').onclick=()=>{if(modalType!=='result')closeModal();};$('zoom-reset').onclick=()=>{};
let awaySince=0;
function pauseApp(){if(!awaySince)awaySince=Date.now();save();if(mode==='battle'&&battle&&!battle.result&&$('modal').hidden&&!globalThis.TerraAds?.isBusy())showPause();}
function resumeApp(){if(awaySince){const elapsed=Math.min(8*3600,Math.max(0,(Date.now()-awaySince)/1000));awaySince=0;if(!eco.source&&elapsed>180){const reward=Math.floor(elapsed*(100+data.upgrades[2]*75)/3600);if(reward){data.coins+=reward;meta.m.lastOfflineReward=reward;save();updateMenu();toast('Доход вне игры: +'+reward+' монет');}}}lastFrame=performance.now();}
window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>document.hidden?pauseApp():resumeApp());
if(document.fonts)document.fonts.ready.then(resize);
document.addEventListener('terraPause',pauseApp);document.addEventListener('terraResume',resumeApp);
window.terraBack=()=>{if(globalThis.TerraAds?.isBusy())return true;if(!$('modal').hidden&&modalType!=='result'){closeModal();return true;}if(modalType==='result'){if(battle)afterResultAd(battle,showMenu);else showMenu();return true;}if(mode==='battle'){showPause();return true;}if(hub&&hub.back())return true;openModal('exit',head('Выйти из игры?')+'<p class="detail-description">Твой прогресс сохранён. Вернуться к завоеваниям можно в любой момент.</p><button id="exit-confirm" class="primary modal-primary">ВЫЙТИ</button><button id="exit-cancel" class="secondary">ОСТАТЬСЯ</button>');$('exit-confirm').onclick=()=>{save();if(window.Android&&Android.exitGame)Android.exitGame();else closeModal();};$('exit-cancel').onclick=()=>closeModal();return true;};
window.addEventListener('pagehide',save);setInterval(()=>{if(mode==='menu')save();},30000);
// Read-only diagnostic snapshot, useful for regression tests and support.
window.terraSnapshot=()=>({mode,battleMode,totalLevels:levels.length,camera:{...view,zoom,overview},selection:{sources:[...selected],target:hoverTarget,dragging:!!drag},screen:hub?hub.tab:'play',level:currentLevel,battle:battle?{source:battle.level.source,sourceLevelId:battle.level.sourceLevelId,stage:battle.stage,stageCount:battle.level.stages?.length||1,stageTransition:battle.stageTransition,fog:!!battle.level.fog,zones:battle.level.zones||[],timeLimit:battle.level.timeLimit||null,time:battle.time,result:battle.result,paused:battle.paused,effects:JSON.parse(JSON.stringify(battle.effects)),objective:JSON.parse(JSON.stringify(battle.objective)),sourceMission:battle.level.sourceMission,movementPacing:battle.movementPacing,stats:{...battle.stats},regions:battle.regions.map(r=>({id:r.id,active:r.active,stage:r.stage||0,kind:r.kind,owner:r.owner,units:r.units,available:battle.available(r.id),reserved:battle.reserved(r.id),screenX:r.x*view.s+view.x,screenY:r.y*view.s+view.y,visible:battle.visible(1,r.id)})),waves:battle.waves.map(w=>({...w})),troops:battle.units.map(u=>({id:u.id,owner:u.owner,x:u.x,y:u.y,speed:u.speed,from:u.from,to:u.to})),units:battle.units.length,skillCharges:{...battle.skillCharges},leaderCharges:battle.leaderCharges,leaderCooldown:battle.leaderCooldown,leaderType:battle.leaderType}:null,progress:JSON.parse(JSON.stringify(data))});
features=TerraFeatures.create({data,eco,meta,icon,save,toast,tone,head,openModal,closeModal,playMode:(mode,options={})=>startBattle({mode,...options}),refresh:()=>{if(hub){hub.wallet();if(hub.tab!=='play')hub.render();}updateMenu();}});
hub=TerraScreens.create({data,eco,meta,features,icon,save,toast,tone,showMenu,showWorld,showTasks,showGift,updateMenu,openModal,closeModal,head,upgradePrice,upgradeValue,buyUpgrade,playOperation:()=>startBattle({operation:true})});
TerraMainMenu.init();$('quests').onclick=null;
setInterval(()=>{features.tick();if(mode==='menu'&&hub)hub.wallet();},5000);
$('leader-skill').onclick=()=>{if(!battle)return;if(battle.level.sourcePort){if(battle.leaderCooldown>0){speedupSkill('leader');return;}if(battle.activateLeader())tone(700);updateBattle();return;}if(battle.leaderCooldown>0){speedupSkill('leader');return;}casting=casting==='leader'?null:'leader';selected.clear();$('skill-hint').textContent=casting?([1,4].includes(battle.leaderType)?'Выбери вражескую базу':'Выбери свою базу для приказа'):'Проведи от своей базы к цели';updateBattle();};
showMenu();requestAnimationFrame(render);setTimeout(()=>{$('loading').classList.add('out');setTimeout(()=>{$('loading').hidden=true;if(offlineReward)toast('Пока тебя не было: +'+offlineReward+' монет');},400);},850);
})();
// Native lifecycle can pause before WebView visibility has propagated.
document.addEventListener('terraPause', function(){
 const p=document.getElementById('pause');
 if(p&&!document.getElementById('battle-top').hidden&&document.getElementById('modal').hidden)p.click();
});
