/* Visual effects never delay or mutate the underlying wallet transaction. */
(function(g){'use strict';
const $=id=>document.getElementById(id),values=new Map();let origin=null;
const film='<svg class="video-glyph" viewBox="0 0 40 34" aria-hidden="true"><rect x="2" y="2" width="36" height="30" rx="3" fill="#e9f1ff" stroke="#6b7ea4" stroke-width="2"/><path d="M5 6h4v4H5zm0 9h4v4H5zm0 9h4v4H5zM31 6h4v4h-4zm0 9h4v4h-4zm0 9h4v4h-4z" fill="#8296bc"/><path d="m15 9 12 8-12 8z" fill="#95b8ed" stroke="#6b7ea4" stroke-width="1.5"/></svg>';
function decorate(root=document){root.querySelectorAll('[data-ad-placement]').forEach(b=>{const selected=b.closest('.bonus-selected'),only=b.dataset.adPlacement==='battle_bonus';b.setAttribute('aria-label',selected?'Усиление выбрано':'Получить за просмотр видео');const html=selected?'<span class="reward-selected">✓</span>':film+(only?'':'<span>БЕСПЛАТНО</span>');if(b.innerHTML!==html)b.innerHTML=html;b.classList.add('video-button');});}
function particle(kind,from,to,index){const app=$('app'),base=app.getBoundingClientRect(),el=document.createElement('span');el.className='resource-icon resource-'+kind+' wallet-particle';app.append(el);const x=from.x-base.x,y=from.y-base.y,dx=to.x-from.x,dy=to.y-from.y;el.style.left=x+'px';el.style.top=y+'px';el.animate([{transform:'translate(-50%,-50%) scale(.4)',opacity:0},{transform:'translate('+(-12+index*5)+'px,-25px) scale(1)',opacity:1,offset:.22},{transform:'translate('+dx+'px,'+dy+'px) scale(.6)',opacity:0}],{duration:650,index,delay:index*40,easing:'cubic-bezier(.2,.6,.4,1)'}).finished.finally(()=>el.remove());}
function wallet(kind,target){const el=$(kind);if(!el)return;target=Math.floor(target||0);let v=values.get(kind);if(!v){values.set(kind,{target,display:target,run:0});el.textContent=target.toLocaleString('ru-RU');return;}if(v.target===target)return;const delta=target-v.target,start=v.display,run=++v.run;v.target=target;const t=performance.now();
 const box=$('wallet-'+kind).getBoundingClientRect(),point={x:box.x+box.width*.17,y:box.y+box.height*.5},other=origin&&performance.now()-origin.at<1200?origin:point;
 for(let i=0;i<6;i++)particle(kind,delta<0?point:other,delta<0?other:point,i);
 const pop=document.createElement('span');pop.className='wallet-delta '+(delta<0?'debit':'credit');pop.textContent=(delta>0?'+':'−')+TerraUI.short(Math.abs(delta));$('wallet-'+kind).append(pop);setTimeout(()=>pop.remove(),1000);$('wallet-'+kind).animate([{transform:'scale(1)'},{transform:'scale(1.07)'},{transform:'scale(1)'}],{duration:420});
 function step(now){if(v.run!==run)return;const f=Math.min(1,(now-t)/650);v.display=start+(target-start)*(1-Math.pow(1-f,3));el.textContent=Math.floor(v.display).toLocaleString('ru-RU');if(f<1)requestAnimationFrame(step);else{v.display=target;el.textContent=target.toLocaleString('ru-RU');}}
 requestAnimationFrame(step);
}
document.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const r=b.getBoundingClientRect();origin={x:r.x+r.width/2,y:r.y+r.height/2,at:performance.now()};b.animate([{scale:1},{scale:.94},{scale:1}],{duration:180});},true);
const original=g.TerraLayout.apply;
function layout(){original();const app=$('app'),w=app.clientWidth,h=app.clientHeight,u=w/590,nav=$('global-nav').getBoundingClientRect(),menu=app.dataset.mode!=='battle',result=$('modal').dataset.kind==='result'&&!$('modal').hidden;
 app.style.setProperty('--ui-unit',u+'px');const headerY=Math.min(112*u,Math.max(22*u,h*.098));
 const place=(id,x,y,bw,bh)=>{const e=$(id);if(e)Object.assign(e.style,{position:'absolute',left:x*u+'px',top:y+'px',width:bw*u+'px',height:bh*u+'px',right:'auto',bottom:'auto',margin:0,transform:'none'});};
 place('settings',30,headerY,49,48);for(const [id,x]of [['tickets',102],['gems',259],['coins',416]])place('wallet-'+id,x,headerY,145,47);place('wallet-supply',416,headerY+63*u,145,47);
 app.dataset.result=String(result);$('header').classList.toggle('result-wallet',result);if(result)$('header').hidden=false;
 if(menu){const navY=nav.top-app.getBoundingClientRect().top,playY=navY-144*u;place('play',164,playY,262,97);place('menu-league',30,playY,98,97);place('menu-duel',459,playY,103,97);place('menu-operations',30,playY-133*u,98,102);place('quests',471,playY-128*u,82,99);place('gift',471,playY-128*u,82,99);place('source-region-progress',148,playY-81*u,300,40);
  const host=$('meta-shortcuts');Object.assign(host.style,{left:465*u+'px',top:(headerY+110*u)+'px',width:96*u+'px',height:370*u+'px'});const room=playY-128*u-(headerY+110*u)-18*u,cell=Math.min(100*u,room/3.5),gap=Math.min(25*u,cell*.25);for(const [i,b]of [...host.querySelectorAll('button')].entries())Object.assign(b.style,{position:'absolute',left:0,top:i*(cell+gap)+'px',width:96*u+'px',height:cell+'px'});
  $('hub-screen').style.top=(headerY+72*u)+'px';$('hub-screen').style.bottom=h-navY+'px';
 }
 if($('hub-screen').dataset.view==='upgrades'){const hub=$('hub-screen'),hh=hub.getBoundingClientRect().height;Object.assign($('source-core-stats').style,{left:'10%',top:'30%',width:'80%',height:'11%'});}
 if(result){const k=$('source-win-title')?'win':'lose',frameTop=Math.min(h*.41,467*u),ratio=Math.min(1,(h-headerY-100*u)/(940*u)),y=v=>frameTop+(v-467)*u*ratio;
  for(const [id,x,top,bw,bh]of [[k+'-art',128,195,334,225],[k+'-frame',33,467,524,249],[k+'-ribbon',45,411,500,88],[k+'-title',45,423,500,65],[k+'-reward-label',70,519,450,50],[k+'-reward',242,574,103,98],['win-multiply',33,744,524,235]])place('source-'+id,x,y(top),bw,bh*ratio);
  place(k==='win'?'next-level':'retry',70,y(1030),450,60*ratio);place('result-menu',170,y(1100),250,30*ratio);
 }
 decorate();
}
g.TerraLayout.apply=layout;window.addEventListener('resize',layout);document.documentElement.style.setProperty('--source-coins','url("art/currency-dollar.svg")');g.TerraPresentation={wallet,decorate,layout,film};
})(globalThis);
