/* Main-menu placement and state from the source MenuView contracts. */
(function(g){'use strict';
const source=g.TerraSourceMenu,$=id=>document.getElementById(id);
function image(id){return '<img class="source-art" src="'+g.TerraAssets.sprites[id].file+'" alt="" draggable="false">';}
function layout(w,h){
 const u=w/1080,grid=source.rightGrid,host=$('meta-shortcuts'),top=host.getBoundingClientRect().top,limit=$('quests').getBoundingClientRect().top-12*u,ideal=grid.order.length*grid.height+(grid.order.length-1)*grid.spacing,fit=Math.min(1,Math.max(.35,(limit-top)/(ideal*u)));const cell=grid.height*u*fit,gap=grid.spacing*u*fit;
 host.style.setProperty('--menu-cell',cell+'px');host.style.setProperty('--menu-gap',gap+'px');
 for(const [index,kind]of grid.order.entries()){
  const button=host.querySelector('[data-feature="'+kind+'"]');
  button.style.width=grid.width*u+'px';button.style.height=cell+'px';button.style.top=index*(cell+gap)+'px';
 }
 const play=$('play').getBoundingClientRect(),app=$('app').getBoundingClientRect();
 Object.assign($('source-difficulty').style,{left:play.left-app.left+'px',top:play.top-app.top-24*u+'px',width:play.width+'px'});
}
function update({data,level,meta}){
 const available=kind=>g.TerraSourceRules.featureAvailable(kind,data),progress=$('source-region-progress'),n=level.sourceStageIndex||0,total=level.sourceStageCount||1;
 progress.querySelector('b').textContent=n+' / '+total;progress.querySelector('span').style.setProperty('--progress',n/total*100+'%');
 const difficulty=$('source-difficulty');difficulty.hidden=level.difficulty===10;difficulty.textContent=level.difficulty===30?'ОЧЕНЬ СЛОЖНЫЙ':'СЛОЖНЫЙ';difficulty.classList.toggle('extra',level.difficulty===30);
 $('menu-league').disabled=!available('duel');$('menu-league').querySelector('small').textContent=available('duel')?'ЛИГА':'С УР. '+g.TerraSourceRules.featureLevel('duel');
 document.querySelectorAll('#side-menu [data-feature],#meta-shortcuts [data-feature]').forEach(button=>{
  const kind=button.dataset.feature,level=g.TerraSourceRules.featureLevel(kind);if(level){button.disabled=!available(kind);button.title=button.disabled?'Откроется с уровня '+level:'';}
 });
 $('quests').querySelector('i').hidden=!meta.eco.operations().some(q=>!q.claimed&&q.value>=q.goal);
}
function init(){
 for(const [id,key]of [['menu-duel','duel'],['menu-league','league'],['menu-operations','operations'],['quests','quests']])$(id).querySelector('span').innerHTML=image(source.images[key]);
 for(const kind of source.rightGrid.order){const span=document.querySelector('#meta-shortcuts [data-feature="'+kind+'"] span');span.innerHTML=image(source.images[kind]);if(kind==='wheel')span.innerHTML+=image(source.images.wheelPin);}
}
g.TerraMainMenu={init,layout,update};init();
})(globalThis);
