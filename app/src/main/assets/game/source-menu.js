/* Main-menu placement and state from the source MenuView contracts. */
(function(g){'use strict';
const source=g.TerraSourceMenu,$=id=>document.getElementById(id);
function image(id){return '<img class="source-art" src="'+g.TerraAssets.sprites[id].file+'" alt="" draggable="false">';}
function layout(w,h){
 const grid=source.rightGrid,host=$('meta-shortcuts');if(host.hidden||$('side-menu').hidden)return;
 const u=w/1080,top=host.getBoundingClientRect().top,limit=$('quests').getBoundingClientRect().top-12*u,ideal=grid.order.length*grid.height+(grid.order.length-1)*grid.spacing,fit=Math.min(1,Math.max(.1,(limit-top)/(ideal*u)));
 let cell=grid.height*u*fit,gap=grid.spacing*u*fit,bw=grid.width*u,row=fit<.55,hw=host.getBoundingClientRect().width;
 if(row){const headerBottom=Math.max(...['settings','wallet-coins','wallet-gems','wallet-supply','wallet-tickets'].map(id=>$(id).getBoundingClientRect().bottom)),rowTop=Math.max(top,headerBottom+12*u);cell=Math.max(24,Math.min(grid.height*u,limit-rowTop));hw=w-100*u;gap=(hw-3*bw)/2;Object.assign(host.style,{left:50*u+'px',top:rowTop+'px',width:hw+'px',height:cell+'px'});}
 for(const [index,kind]of grid.order.entries()){
  const button=host.querySelector('[data-feature="'+kind+'"]');
  Object.assign(button.style,{width:bw+'px',height:cell+'px',left:(row?index*(bw+gap):(hw-bw)/2)+'px',top:(row?0:index*(cell+gap))+'px',gap:Math.min(6*u,cell*.04)+'px'});
  button.querySelector('span').style.height=Math.max(16,cell-34*u)+'px';button.querySelector('small').style.fontSize=Math.min(24*u,cell*.24)+'px';
 }
 const play=$('play').getBoundingClientRect(),app=$('app').getBoundingClientRect();
 Object.assign($('source-difficulty').style,{left:play.left-app.left+'px',top:play.top-app.top-24*u+'px',width:play.width+'px'});
}
function update({data,level,meta}){
 const available=kind=>g.TerraSourceRules.featureAvailable(kind,data),progress=$('source-region-progress'),n=level.sourceStageIndex||0,total=level.sourceStageCount||1;
 progress.querySelector('b').innerHTML=Array.from({length:4},(_,i)=>{const value=Math.max(1,data.level+i),current=i===1;return '<i class="progress-node '+(i===0?'done':current?'current':i===3?'next':'')+'">'+value+'</i>';}).join('');progress.querySelector('span').style.setProperty('--progress',n/total*100+'%');
 const difficulty=$('source-difficulty');difficulty.hidden=level.difficulty===10;difficulty.textContent=level.difficulty===30?'ОЧЕНЬ СЛОЖНЫЙ':'СЛОЖНЫЙ';difficulty.classList.toggle('extra',level.difficulty===30);
 $('menu-league').disabled=!available('duel');$('menu-league').querySelector('small').textContent=available('duel')?'ЛИГА':'С УР. '+g.TerraSourceRules.featureLevel('duel');
 document.querySelectorAll('#side-menu [data-feature],#meta-shortcuts [data-feature]').forEach(button=>{
  const kind=button.dataset.feature,level=g.TerraSourceRules.featureLevel(kind);if(level){button.disabled=!available(kind);button.title=button.disabled?'Откроется с уровня '+level:'';}
 });
 document.querySelector('#meta-shortcuts [data-feature="idle"] small').textContent=meta.idleInfo?.().ready?'ЗАБРАТЬ':'ДОХОД';
 $('quests').querySelector('i').hidden=!meta.eco.operations().some(q=>!q.claimed&&q.value>=q.goal);
}
function init(){
 for(const [id,key]of [['menu-duel','duel'],['menu-league','league'],['menu-operations','operations'],['quests','quests']])$(id).querySelector('span').innerHTML=image(source.images[key]);
 for(const kind of source.rightGrid.order){const span=document.querySelector('#meta-shortcuts [data-feature="'+kind+'"] span');span.innerHTML=image(source.images[kind]);if(kind==='wheel')span.innerHTML+=image(source.images.wheelPin);}
}
g.TerraMainMenu={init,layout,update};init();
})(globalThis);
