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
function icon(name,color){return '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"'+(color?' style="color:'+color+'"':'')+'>'+icons[name]+'</svg>';}
const palette=['#9facba','#4cabe8','#ef765f','#ae8bdc','#eaba53'];
const fills=['#dce3ea','#a8d7f5','#f5baa9','#d1bee9','#f4d793'];
let data;
function defaults(){return {version:1,coins:0,unlocked:0,completed:[],stars:{},level:0,upgrades:[0,0,0],color:0,base:0,fighter:0,leader:0,owned:{color:[0],base:[0],fighter:[0]},sound:true,vibration:true,wins:0,captures:0,sent:0,commands:0,daily:0,streak:0,claimed:[],lastSeen:Date.now(),seenHelp:false};}
try{data={...defaults(),...JSON.parse(localStorage.getItem('terra-storm-v1')||'{}')};}catch(e){data=defaults();}
data.level=Math.max(0,Math.min(4,data.level||0));data.unlocked=Math.max(0,Math.min(4,data.unlocked||0));
function save(){try{data.lastSeen=Date.now();localStorage.setItem('terra-storm-v1',JSON.stringify(data));}catch(e){}}
const offline=Math.min(8*3600,Math.max(0,(Date.now()-data.lastSeen)/1000));
const offlineReward=offline>180?Math.floor(offline*(100+data.upgrades[2]*75)/3600):0;
if(offlineReward){data.coins+=offlineReward;save();}
let mode='menu',battle=null,currentLevel=data.level,modalType=null,selected=new Set(),fraction=1,casting=null,particles=[],shotLines=[],toastTimer=0,view={s:1,x:0,y:0},drag=null,pointer={x:0,y:0},lastFrame=performance.now(),lastUi=0,scale=1,zoom=1,pan={x:0,y:0};
const canvas=$('map'),ctx=canvas.getContext('2d',{alpha:false});let W=400,H=800,DPR=1,paths=[],dots=[];
let soundCtx=null;
function tone(freq=440,duration=.08){if(!data.sound)return;try{soundCtx=soundCtx||new(window.AudioContext||window.webkitAudioContext)();if(soundCtx.state==='suspended')soundCtx.resume();const o=soundCtx.createOscillator(),g=soundCtx.createGain();o.connect(g);g.connect(soundCtx.destination);o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(.035,soundCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,soundCtx.currentTime+duration);o.start();o.stop(soundCtx.currentTime+duration);}catch(e){}}
function vibrate(){if(!data.vibration)return;try{if(window.Android)Android.vibrate();else if(navigator.vibrate)navigator.vibrate(15);}catch(e){}}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600);}
function fmt(n){return n>=100000?(n/1000).toFixed(0)+'k':Math.floor(n).toLocaleString('ru-RU');}
function time(t){return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');}
function color(owner){if(owner===1)return ['#4cabe8','#65be87','#b68add','#eeb44f','#e87891','#54bebd'][data.color];return palette[owner];}
function fill(owner){if(owner===1)return ['#a8d7f5','#b0e1c2','#d5bdec','#f5d990','#f3b9c8','#a6dedb'][data.color];return fills[owner];}
function inside(x,y,poly){let v=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>y)!==(b[1]>y))&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])v=!v;}return v;}
function prepareMap(){
 const map=levels[currentLevel];paths=map.regions.map(r=>{const p=new Path2D();r.poly.forEach((a,i)=>i?p.lineTo(a[0],a[1]):p.moveTo(a[0],a[1]));p.closePath();return p;});
 const rand=new TerraRandom(436+currentLevel);dots=map.regions.map(r=>{const pts=[];let attempts=0;while(pts.length<70&&attempts++<2000){const a=rand.next()*Math.PI*2,rad=23+Math.sqrt(rand.next())*85,x=r.center[0]+Math.cos(a)*rad,y=r.center[1]+Math.sin(a)*rad;if(inside(x,y,r.poly))pts.push({x,y,phase:rand.next()*6});}return pts;});
 zoom=1;pan={x:0,y:0};resize();
}
function resize(){
 const box=$('app').getBoundingClientRect();W=box.width;H=box.height;DPR=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);canvas.style.width=W+'px';canvas.style.height=H+'px';
 const map=levels[currentLevel],landscape=W>H*1.3;
 let left=18,right=W-18,top=mode==='menu'?(H<690?160:191):157,bottom=mode==='menu'?H-Math.max(H*.335,232)-60:H-157;
 if(landscape){left=25;right=W-300;top=mode==='menu'?80:113;bottom=H-55;}
 const s=Math.min((right-left)/map.width,(bottom-top)/map.height)*.98;
 view={s:s*zoom,x:left+(right-left-map.width*s*zoom)/2+pan.x,y:top+(bottom-top-map.height*s*zoom)/2+pan.y};
 $('zoom-reset').hidden=mode!=='battle'||zoom===1;
}
function showMenu(){
 mode='menu';battle=null;selected.clear();casting=null;particles=[];shotLines=[];
 $('header').hidden=false;$('menu-top').hidden=false;$('menu-bottom').hidden=false;$('side-menu').hidden=false;$('map-caption').hidden=false;
 $('battle-top').hidden=true;$('battle-bottom').hidden=true;$('hint').hidden=true;closeModal(false);prepareMap();updateMenu();
}
function updateMenu(){
 $('coins').textContent=fmt(data.coins);$('level-label').textContent='УРОВЕНЬ '+(currentLevel+1);$('map-name').textContent=levels[currentLevel].name;$('map-subtitle').textContent=levels[currentLevel].subtitle;
 $('campaign-dots').innerHTML=levels.map((_,i)=>'<i class="'+(data.completed.includes(i)?'done':'')+'"></i>').join('');
 $('play-label').textContent=data.completed.includes(currentLevel)?'ИГРАТЬ СНОВА':'ИГРАТЬ';
 const specs=[['units','Стартовый отряд','бойцов','СТАРТОВЫЙ ОТРЯД','#63b3e9','#4196ca'],['speed','Скорость производства','бойцов в секунду','ПРОИЗВОДСТВО','#a58cdb','#8c73be'],['income','Доход вне игры','монет в час','ДОХОД ВНЕ ИГРЫ','#edba55','#d29b36']];
 $('upgrades').innerHTML=specs.map((sp,i)=>{const lv=data.upgrades[i],price=upgradePrice(i),value=i===0?18+lv*3:i===1?(1+lv*.18).toFixed(2):100+lv*75;return '<article class="upgrade" style="--tone:'+sp[4]+';--dark:'+sp[5]+'"><div class="upgrade-icon">'+icon(sp[0])+'</div><strong>'+value+'</strong><span class="unit">'+sp[2]+'</span><h3>'+sp[3]+'</h3><span class="lv">УР. '+(lv+1)+'</span><button data-upgrade="'+i+'" aria-label="Улучшить: '+sp[1]+'" '+(data.coins<price?'disabled':'')+'>'+icon('coin')+fmt(price)+'</button></article>';}).join('');
 $('gift').querySelector('i').hidden=sameDay(data.daily,Date.now());
 $('nav-tasks').querySelector('i').hidden=!tasks().some(t=>t.current>=t.goal&&!data.claimed.includes(t.id));
}
function upgradePrice(i){return Math.floor((i===2?65:50)*Math.pow(1.48,data.upgrades[i]));}
function startBattle(){
 closeModal(false);mode='battle';selected.clear();casting=null;fraction=1;particles=[];shotLines=[];
 battle=new TerraBattle(levels[currentLevel],{start:data.upgrades[0]*3+(data.leader===1?3:0),production:data.upgrades[1],skipTutorial:data.completed.includes(0)});
 if(data.leader===2)battle.production*=1.12;
 $('header').hidden=true;$('menu-top').hidden=true;$('menu-bottom').hidden=true;$('side-menu').hidden=true;$('map-caption').hidden=true;
 $('battle-top').hidden=false;$('battle-bottom').hidden=false;$('battle-label').textContent='УРОВЕНЬ '+(currentLevel+1);$('fraction').querySelector('b').textContent='100%';
 $('reinforce').hidden=currentLevel<2;$('shield').hidden=currentLevel<2;
 $('hint').hidden=currentLevel!==0||data.completed.includes(0);$('hint').textContent='Проведи от синей базы к серой территории';
 $('skill-hint').textContent='Проведи от своей базы к цели';prepareMap();updateBattle();tone(520);
}
function updateBattle(){
 if(!battle)return;
 $('battle-time').textContent=time(battle.time);const shares=battle.territoryShare(),tot=battle.totals(),count=battle.regions.length;
 $('balance').innerHTML=shares.map((n,i)=>n?'<i style="background:'+color(i)+';width:'+n/count*100+'%"></i>':'').join('');
 $('force-counts').innerHTML=tot.map((n,i)=>i&&n?'<span style="color:'+color(i)+'"><i style="background:'+color(i)+'"></i>'+n+'</span>':'').join('');
 $('region-status').textContent='ТЕРРИТОРИИ '+shares[1]+' / '+count+'  •  АРМИЯ '+tot[1];
 for(const type of ['reinforce','shield']){$(type).disabled=!battle.skillCharges[type];$(type).classList.toggle('selected',casting===type);$(type).querySelector('i').textContent=battle.skillCharges[type]?'1':'0';}
 $('select-all').classList.toggle('selected',selected.size>0);
 if(currentLevel===0&&!data.completed.includes(0)&&battle.firstCommand){$('hint').textContent=battle.regions.filter(r=>r.owner===1).length>1?'Теперь отправь бойцов к красной базе':'Каждая захваченная база производит бойцов';if(battle.time>25)$('hint').hidden=true;}
}
function finish(result){
 const b=battle;const won=result==='win';if(won){
  data.wins++;data.captures+=b.stats.captured;data.sent+=b.stats.sent;data.commands+=b.stats.commands;
  const first=!data.completed.includes(currentLevel),reward=first?levels[currentLevel].reward:Math.floor(levels[currentLevel].reward*.45);data.coins+=reward;
  if(first)data.completed.push(currentLevel);data.unlocked=Math.min(4,Math.max(data.unlocked,currentLevel+1));
  const stars=b.time<95?3:b.time<170?2:1;data.stars[currentLevel]=Math.max(data.stars[currentLevel]||0,stars);save();
  for(let i=0;i<75;i++)particles.push({screen:true,x:W/2,y:H*.35,vx:(Math.random()-.5)*230,vy:-Math.random()*200-60,life:2+Math.random(),color:['#6cb7ed','#79cd8e','#f0bf5b','#b5a0e1'][i%4]});
  openModal('result','<div class="result-icon">'+icon('trophy')+'</div><h2 class="result-title">ПОБЕДА!</h2><div class="result-sub">'+(data.completed.length===5?'Весь мир под твоим флагом':levels[currentLevel].name+' — под твоим флагом')+'</div><div style="text-align:center;margin-top:13px;color:#edb344;display:flex;justify-content:center;gap:5px">'+Array.from({length:3},(_,i)=>icon('star',i<stars?'#edb344':'#d9e2eb')).join('')+'</div><div class="result-stats"><div><b>'+time(b.time)+'</b><small>ВРЕМЯ</small></div><div><b>'+b.stats.captured+'</b><small>ЗАХВАЧЕНО</small></div><div><b>'+b.stats.sent+'</b><small>ОТПРАВЛЕНО</small></div></div><div class="reward">'+icon('coin')+'+'+reward+'</div><button class="primary modal-primary" id="next-level">'+(currentLevel<4?'ПРОДОЛЖИТЬ':'КАРТА МИРА')+icon('arrow')+'</button><button class="text-action" id="result-menu">В главное меню</button>');
  $('next-level').onclick=()=>{currentLevel=Math.min(4,currentLevel+1);data.level=currentLevel;save();showMenu();if(data.completed.length===5)showWorld();};
  tone(660,.2);setTimeout(()=>tone(880,.25),150);
 }else{
  data.sent+=b.stats.sent;data.commands+=b.stats.commands;data.captures+=b.stats.captured;save();
  openModal('result','<div class="result-icon" style="background:#f8e8e3">'+icon('flag','#e78a78')+'</div><h2 class="result-title" style="color:#dc8a79">ЕЩЁ ПОПЫТКА</h2><div class="result-sub">Измени тактику и верни свои территории</div><div class="result-stats"><div><b>'+time(b.time)+'</b><small>ВРЕМЯ</small></div><div><b>'+b.stats.captured+'</b><small>ЗАХВАЧЕНО</small></div></div><button class="primary modal-primary" id="retry">НАЧАТЬ ЗАНОВО</button><button class="text-action" id="result-menu">В главное меню</button>');$('retry').onclick=startBattle;tone(200,.2);
 }
 $('result-menu').onclick=showMenu;
}
function openModal(type,html){modalType=type;$('panel-content').innerHTML=html;$('modal').hidden=false;if(battle&&!battle.result)battle.paused=true;const close=$('close-modal');if(close)close.onclick=()=>closeModal();}
function closeModal(resume=true){$('modal').hidden=true;modalType=null;if(resume&&battle&&!battle.result)battle.paused=false;}
function head(title){return '<div class="modal-head"><h2>'+title+'</h2><button class="close" id="close-modal" aria-label="Закрыть">×</button></div>';}
function sameDay(a,b){return a&&new Date(a).toDateString()===new Date(b).toDateString();}
function showWorld(){
 openModal('world',head('Карта мира')+'<p class="modal-sub">Пять кампаний. Одна цель — покорить мир.</p>'+levels.map((l,i)=>{const done=data.completed.includes(i),locked=i>data.unlocked;return '<div class="level-row '+(done?'done':'')+(locked?' locked':'')+'"><div class="level-no">'+(done?'✓':i+1)+'</div><div><b>'+l.name+'</b><small>'+l.subtitle+'</small>'+(done?'<small style="color:#e5b149">'+'★'.repeat(data.stars[i]||1)+'</small>':'')+'</div><button data-level="'+i+'" '+(locked?'disabled':'')+'>'+(locked?'ЗАКРЫТО':done?'СНОВА':'ИГРАТЬ')+'</button></div>';}).join('')+'<div class="footnote">'+data.completed.length+' / 5 кампаний завершено</div>');
 document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{currentLevel=+b.dataset.level;data.level=currentLevel;save();showMenu();});
}
function showSettings(){
 openModal('settings',head('Настройки')+'<div class="option-row">Звук<button id="sound-toggle" class="switch '+(data.sound?'on':'')+'" aria-label="Переключить звук"></button></div><div class="option-row">Вибрация<button id="vibration-toggle" class="switch '+(data.vibration?'on':'')+'" aria-label="Переключить вибрацию"></button></div><button class="secondary" id="help-settings">Как играть</button><button class="secondary" id="about">Об игре</button><div class="footnote">ТЕРРА ШТОРМ • 0.1.0<br>Прогресс сохраняется автоматически</div>');
 $('sound-toggle').onclick=()=>{data.sound=!data.sound;save();$('sound-toggle').classList.toggle('on',data.sound);tone();};$('vibration-toggle').onclick=()=>{data.vibration=!data.vibration;save();$('vibration-toggle').classList.toggle('on',data.vibration);vibrate();};$('help-settings').onclick=showHelp;$('about').onclick=()=>openModal('about',head('Терра Шторм')+'<p class="modal-sub">Стратегия в реальном времени. Захватывай территории, управляй армией и развивай своё государство.</p><p class="modal-sub">Пять кампаний, улучшения, командиры и коллекция оформления. Игра работает без подключения к интернету.</p><p class="modal-sub">Географические карты используются как условное игровое поле.</p><div class="footnote">Версия 0.1.0 • © 2026<br>Картография: Natural Earth, общественное достояние</div>');
}
function showPause(){if(!battle||battle.result)return;openModal('pause',head('Пауза')+'<p class="modal-sub">'+levels[currentLevel].name+' • '+time(battle.time)+'</p><button class="primary modal-primary" id="resume">ПРОДОЛЖИТЬ</button><button class="secondary" id="restart">Начать заново</button><button class="secondary" id="back-menu">В главное меню</button>');$('resume').onclick=()=>closeModal();$('restart').onclick=startBattle;$('back-menu').onclick=showMenu;}
function showHelp(){
 openModal('help',head('Как играть')+'<div class="help-step"><i>1</i><div><b>Выбери свою базу</b><br>Проведи пальцем от цветного круга к серой или вражеской базе. Бойцы отправятся после отпускания пальца.</div></div><div class="help-step"><i>2</i><div><b>Объединяй силы</b><br>Проведи через несколько своих баз и закончи на цели. Или нажми «Все базы», затем укажи цель.</div></div><div class="help-step"><i>3</i><div><b>Развивай преимущество</b><br>Каждая твоя база производит бойцов до 50. Подкрепления могут превысить этот предел. Нейтральные базы не растут.</div></div><div class="help-step"><i>4</i><div><b>Сражайся с умом</b><br>Встречные отряды уничтожают друг друга. Враг тоже захватывает базы. Не оставляй весь тыл без защиты! Двумя пальцами можно приблизить и сдвинуть карту.</div></div><div class="help-step"><i>5</i><div><b>Особые базы и способности</b><br>Завод быстрее производит бойцов, башня стреляет по врагам, форт крепче защищён. С 3-го уровня доступны разовые подкрепление и щит: выбери способность, затем свою базу.</div></div><button class="primary modal-primary" id="help-ok">ПОНЯТНО</button>');$('help-ok').onclick=()=>{data.seenHelp=true;save();closeModal();};
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
 const regions=battle?battle.regions:levels[currentLevel].regions.map(r=>({...r,x:r.center[0],y:r.center[1]}));
 let nearest=null,min=Infinity;for(const r of regions){const d=Math.hypot(r.x-p.x,r.y-p.y)*view.s;if(d<min){min=d;nearest=r;}}
 if(min<Math.max(22,15*zoom))return nearest;
 const index=regions.findIndex(r=>inside(p.x,p.y,r.poly));return index<0?null:regions[index];
}
// Two-finger zoom and pan. One finger remains reserved for troop commands.
const touchPoints=new Map();let pinch=null;
canvas.addEventListener('pointerdown',ev=>{
 if(mode!=='battle'||!$('modal').hidden)return;
 touchPoints.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
 if(touchPoints.size===2){
  const pts=[...touchPoints.values()],rect=canvas.getBoundingClientRect(),mx=(pts[0].x+pts[1].x)/2-rect.left,my=(pts[0].y+pts[1].y)/2-rect.top;
  pinch={distance:Math.max(1,Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y)),zoom,world:{x:(mx-view.x)/view.s,y:(my-view.y)/view.s}};
  drag=null;selected.clear();ev.preventDefault();ev.stopImmediatePropagation();canvas.setPointerCapture(ev.pointerId);
 }
},true);
canvas.addEventListener('pointermove',ev=>{
 if(!touchPoints.has(ev.pointerId))return;touchPoints.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
 if(pinch&&touchPoints.size>=2){
  const pts=[...touchPoints.values()],rect=canvas.getBoundingClientRect(),mx=(pts[0].x+pts[1].x)/2-rect.left,my=(pts[0].y+pts[1].y)/2-rect.top;
  const distance=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);zoom=Math.max(1,Math.min(3,pinch.zoom*distance/pinch.distance));resize();pan.x+=mx-(pinch.world.x*view.s+view.x);pan.y+=my-(pinch.world.y*view.s+view.y);resize();ev.preventDefault();ev.stopImmediatePropagation();
 }
},true);
for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,ev=>{touchPoints.delete(ev.pointerId);if(pinch){ev.stopImmediatePropagation();if(touchPoints.size<2)pinch=null;drag=null;}},true);
canvas.addEventListener('pointerdown',ev=>{
 if(mode!=='battle'||!$('modal').hidden||!battle||battle.result)return;ev.preventDefault();canvas.setPointerCapture(ev.pointerId);const p=mapPoint(ev),r=regionAt(p);pointer=p;
 if(casting){if(r&&r.owner===1&&battle.cast(casting,r.id)){tone(800);vibrate();casting=null;$('skill-hint').textContent='Способность применена';updateBattle();}else toast('Выбери свою базу');return;}
 if(selected.size&&r&&r.owner!==1){battle.command([...selected],r.id,fraction);selected.clear();tone();vibrate();updateBattle();return;}
 if(r&&r.owner===1){selected.add(r.id);drag={start:r.id,pointer:ev.pointerId};tone(400,.03);}
 else if(r&&selected.size){battle.command([...selected],r.id,fraction);selected.clear();}
 else selected.clear();
});
canvas.addEventListener('pointermove',ev=>{
 if(!drag||!battle||battle.paused)return;pointer=mapPoint(ev);const r=regionAt(pointer);if(r&&r.owner===1)selected.add(r.id);
});
canvas.addEventListener('pointerup',ev=>{
 if(!drag||!battle)return;const p=mapPoint(ev),r=regionAt(p);if(r&&(!selected.has(r.id)||r.id!==drag.start&&selected.size>1)){
  const sources=[...selected].filter(i=>i!==r.id);if(battle.command(sources,r.id,fraction)){selected.clear();tone(540);vibrate();$('hint').hidden=true;}
 }drag=null;updateBattle();
});
canvas.addEventListener('pointercancel',()=>{drag=null;selected.clear();});
canvas.addEventListener('wheel',ev=>{if(mode!=='battle')return;ev.preventDefault();zoom=Math.max(1,Math.min(2.5,zoom+(ev.deltaY<0?.15:-.15)));resize();},{passive:false});
function drawDot(x,y,r,owner,shape){
 ctx.fillStyle=color(owner);if(!shape){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();return;}
 if(shape===1){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x-r,y-r);ctx.lineTo(x-r*.5,y);ctx.lineTo(x-r,y+r);ctx.closePath();ctx.fill();}
 else if(shape===2){ctx.beginPath();ctx.ellipse(x,y,r*1.6,r*.65,-.6,0,6.3);ctx.fill();}
 else if(shape===3){ctx.beginPath();ctx.moveTo(x,y-r*1.4);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r*1.4);ctx.lineTo(x-r,y);ctx.fill();}
 else{ctx.save();ctx.translate(x,y);ctx.beginPath();for(let i=0;i<10;i++){let rad=i%2?r*.5:r*1.5,a=i*Math.PI/5-Math.PI/2;ctx.lineTo(Math.cos(a)*rad,Math.sin(a)*rad);}ctx.closePath();ctx.fill();ctx.restore();}
}
function render(now){
 const dt=Math.min(.05,(now-lastFrame)/1000);lastFrame=now;
 if(battle&&!battle.paused&&!battle.result){battle.step(dt);for(const ev of battle.drainEvents()){
  if(ev.type==='capture'){for(let i=0;i<12;i++)particles.push({x:ev.x,y:ev.y,vx:(Math.random()-.5)*120,vy:(Math.random()-.5)*120,life:.6,color:color(ev.owner)});if(ev.owner===1){tone(650,.08);vibrate();}}
  else if(ev.type==='clash')particles.push({x:ev.x,y:ev.y,vx:0,vy:0,life:.18,color:'#ffffff'});
  else if(ev.type==='shot')shotLines.push({...ev,life:.15});else if(ev.type==='finish')finish(ev.result);
 }}
 if(now-lastUi>180){lastUi=now;if(mode==='battle')updateBattle();}
 ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#edf2f7';ctx.fillRect(0,0,W,H);
 // Subtle sea graticule grounds the map without competing with the units.
 ctx.strokeStyle='#e6edf3';ctx.lineWidth=.6;ctx.beginPath();for(let x=0;x<W;x+=42){ctx.moveTo(x,0);ctx.lineTo(x,H);}for(let y=0;y<H;y+=42){ctx.moveTo(0,y);ctx.lineTo(W,y);}ctx.stroke();
 ctx.save();ctx.translate(view.x,view.y);ctx.scale(view.s,view.s);
 const regions=battle?battle.regions:levels[currentLevel].regions.map(r=>({...r,x:r.center[0],y:r.center[1]}));
 ctx.save();ctx.translate(0,4/view.s);ctx.fillStyle='#cbd7e0';for(const path of paths)ctx.fill(path);ctx.restore();
 for(let i=0;i<regions.length;i++){
  const r=regions[i];ctx.fillStyle=fill(r.owner);ctx.strokeStyle='#f8fbfd';ctx.lineWidth=2/view.s;ctx.lineJoin='round';ctx.fill(paths[i]);ctx.stroke(paths[i]);
  if(r.pulse>0){ctx.globalAlpha=r.pulse*.35;ctx.fillStyle='#fff';ctx.fill(paths[i]);ctx.globalAlpha=1;}
 }
 for(let i=0;i<regions.length;i++){
  const r=regions[i],qty=Math.min(65,Math.floor(r.units));if(!r.owner)continue;
  for(let j=0;j<qty&&j<dots[i].length;j++){const d=dots[i][j],wiggle=Math.sin(now*.0017+d.phase)*1.7;drawDot(d.x+wiggle,d.y,Math.max(2.7,1.75/view.s),r.owner,r.owner===1?data.fighter:0);}
 }
 if(battle){
  for(const line of shotLines){ctx.strokeStyle=color(line.owner);ctx.lineWidth=2/view.s;ctx.globalAlpha=Math.min(1,line.life*7);ctx.beginPath();ctx.moveTo(line.x,line.y);ctx.lineTo(line.tx,line.ty);ctx.stroke();line.life-=dt;}shotLines=shotLines.filter(l=>l.life>0);ctx.globalAlpha=1;
  for(const u of battle.units)drawDot(u.x,u.y,Math.max(3,2.1/view.s),u.owner,u.owner===1?data.fighter:0);
 }
 if(selected.size&&mode==='battle'){
  for(const id of selected){const r=regions[id];ctx.strokeStyle=color(1);ctx.lineWidth=2.5/view.s;ctx.setLineDash([4/view.s,4/view.s]);ctx.beginPath();ctx.arc(r.x,r.y,23/view.s+Math.sin(now/150)*1.5/view.s,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
   if(drag){ctx.strokeStyle=color(1);ctx.globalAlpha=.6;ctx.lineWidth=2/view.s;ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(pointer.x,pointer.y);ctx.stroke();ctx.globalAlpha=1;}
  }
 }
 for(const r of regions){
  const radius=(r.owner?13.4:11.7)/view.s;ctx.fillStyle=r.owner?color(r.owner):'#b4c1ce';ctx.strokeStyle='#fff';ctx.lineWidth=1.8/view.s;
  ctx.beginPath();if(r.owner===1&&data.base===2){ctx.moveTo(r.x,r.y-radius*1.2);ctx.lineTo(r.x+radius,r.y);ctx.lineTo(r.x,r.y+radius*1.2);ctx.lineTo(r.x-radius,r.y);ctx.closePath();}else if(r.owner===1&&data.base===1){ctx.roundRect?ctx.roundRect(r.x-radius,r.y-radius,radius*2,radius*2,3/view.s):ctx.rect(r.x-radius,r.y-radius,radius*2,radius*2);}else if(r.owner===1&&data.base===3){for(let i=0;i<10;i++){const rad=i%2?radius*.8:radius*1.35,a=i*Math.PI/5-Math.PI/2;ctx.lineTo(r.x+Math.cos(a)*rad,r.y+Math.sin(a)*rad);}ctx.closePath();}else{ctx.arc(r.x,r.y,radius,0,Math.PI*2);}ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 '+(r.units>=100?10:11)/view.s+'px Arial';ctx.fillText(Math.floor(r.units),r.x,r.y+.5/view.s);
  if(r.kind!=='normal'){
   ctx.fillStyle=r.kind==='factory'?'#63b882':r.kind==='turret'?'#d6967a':'#9c8ec6';ctx.beginPath();ctx.arc(r.x+10/view.s,r.y-12/view.s,6/view.s,0,6.3);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold '+7/view.s+'px Arial';ctx.fillText(r.kind==='factory'?'+':r.kind==='turret'?'T':'F',r.x+10/view.s,r.y-12/view.s);
  }
  if(r.owner===1&&data.base>=4){ctx.strokeStyle='#ffffff';ctx.lineWidth=2/view.s;if(data.base===4){ctx.beginPath();ctx.moveTo(r.x,r.y-12/view.s);ctx.lineTo(r.x,r.y-27/view.s);ctx.lineTo(r.x+10/view.s,r.y-23/view.s);ctx.lineTo(r.x,r.y-19/view.s);ctx.stroke();}else{ctx.beginPath();ctx.arc(r.x,r.y,17/view.s,0,Math.PI*2);ctx.stroke();}}
  if(r.shield>0){ctx.strokeStyle='#a98cdc';ctx.lineWidth=2.4/view.s;ctx.globalAlpha=.7+.2*Math.sin(now/100);ctx.beginPath();ctx.arc(r.x,r.y,23/view.s,0,6.3);ctx.stroke();ctx.globalAlpha=1;}
 }
 // Tutorial hand/route is a hint only; never sends an order for the player.
 if(battle&&currentLevel===0&&!battle.firstCommand&&!data.completed.includes(0)){
  const a=regions.find(r=>r.owner===1),b=regions.find(r=>r.name==='Nevada'),t=(now%2000)/2000;
  ctx.globalAlpha=.45;ctx.strokeStyle=color(1);ctx.lineWidth=3/view.s;ctx.setLineDash([5/view.s,6/view.s]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.8;ctx.fillStyle='#fff';ctx.strokeStyle='#77a4c6';ctx.lineWidth=2/view.s;ctx.beginPath();ctx.arc(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,8/view.s,0,6.3);ctx.fill();ctx.stroke();ctx.globalAlpha=1;
 }
 for(const p of particles.filter(p=>!p.screen)){ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,3/view.s,0,6.3);ctx.fill();}ctx.globalAlpha=1;ctx.restore();
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.screen){p.vy+=170*dt;ctx.globalAlpha=Math.min(1,p.life);ctx.fillStyle=p.color;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(now/300+p.vx);ctx.fillRect(-3,-2,6,4);ctx.restore();}}ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);
 requestAnimationFrame(render);
}
const bindIcon=(id,name)=>$(id).innerHTML=icon(name);
bindIcon('settings','gear');bindIcon('coin-icon','coin');bindIcon('level-open','chevron');bindIcon('play-arrow','arrow');bindIcon('pause','pause');bindIcon('help','help');
for(const [id,name] of [['gift','gift'],['leader','leader'],['nav-army','army'],['nav-world','world'],['nav-tasks','tasks'],['select-all','select'],['reinforce','plus'],['shield','shield']])$(id).querySelector('span').innerHTML=icon(name);
$('settings').onclick=showSettings;$('level-open').onclick=showWorld;$('nav-world').onclick=showWorld;$('nav-army').onclick=()=>showArmy();$('nav-tasks').onclick=showTasks;$('gift').onclick=showGift;$('leader').onclick=showLeaders;
$('play').onclick=startBattle;$('pause').onclick=showPause;$('help').onclick=showHelp;
$('upgrades').onclick=e=>{const button=e.target.closest('[data-upgrade]');if(!button)return;const i=+button.dataset.upgrade,price=upgradePrice(i);if(data.coins<price)return;data.coins-=price;data.upgrades[i]++;save();updateMenu();tone(750);vibrate();};
$('select-all').onclick=()=>{if(!battle)return;casting=null;const own=battle.regions.filter(r=>r.owner===1);if(selected.size===own.length)selected.clear();else own.forEach(r=>selected.add(r.id));$('skill-hint').textContent=selected.size?'Теперь укажи цель':'Проведи от своей базы к цели';updateBattle();};
$('fraction').onclick=()=>{fraction=fraction===1?.5:1;$('fraction').querySelector('b').textContent=fraction===1?'100%':'50%';tone(500,.04);};
for(const key of ['reinforce','shield'])$(key).onclick=()=>{casting=casting===key?null:key;selected.clear();$('skill-hint').textContent=casting?'Выбери свою базу для '+(key==='shield'?'защиты':'подкрепления'):'Проведи от своей базы к цели';updateBattle();};
$('scrim').onclick=()=>{if(modalType!=='result')closeModal();};$('zoom-reset').onclick=()=>{zoom=1;pan={x:0,y:0};resize();};
let awaySince=0;
function pauseApp(){if(!awaySince)awaySince=Date.now();save();if(mode==='battle'&&battle&&!battle.result&&$('modal').hidden)showPause();}
function resumeApp(){if(awaySince){const elapsed=Math.min(8*3600,Math.max(0,(Date.now()-awaySince)/1000));awaySince=0;if(elapsed>180){const reward=Math.floor(elapsed*(100+data.upgrades[2]*75)/3600);if(reward){data.coins+=reward;save();updateMenu();toast('Доход вне игры: +'+reward+' монет');}}}lastFrame=performance.now();}
window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>document.hidden?pauseApp():resumeApp());
document.addEventListener('terraPause',pauseApp);document.addEventListener('terraResume',resumeApp);
window.terraBack=()=>{if(!$('modal').hidden&&modalType!=='result'){closeModal();return true;}if(mode==='battle'){showPause();return true;}if(modalType==='result'){showMenu();return true;}return false;};
window.addEventListener('pagehide',save);setInterval(()=>{if(mode==='menu')save();},30000);
// Read-only diagnostic snapshot, useful for regression tests and support.
window.terraSnapshot=()=>({mode,level:currentLevel,battle:battle?{time:battle.time,result:battle.result,paused:battle.paused,stats:{...battle.stats},regions:battle.regions.map(r=>({id:r.id,owner:r.owner,units:r.units})),units:battle.units.length}:null,progress:JSON.parse(JSON.stringify(data))});
showMenu();requestAnimationFrame(render);setTimeout(()=>{$('loading').classList.add('out');setTimeout(()=>{$('loading').hidden=true;if(offlineReward)toast('Пока тебя не было: +'+offlineReward+' монет');},400);},850);
})();
// Native lifecycle can pause before WebView visibility has propagated.
document.addEventListener('terraPause', function(){
 const p=document.getElementById('pause');
 if(p&&!document.getElementById('battle-top').hidden&&document.getElementById('modal').hidden)p.click();
});
