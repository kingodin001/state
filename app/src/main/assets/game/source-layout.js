/* Unity RectTransform coordinates, evaluated against the actual viewport. */
(function(g){'use strict';
const data=g.TerraSourceLayout,menu=g.TerraSourceMenu;if(menu){Object.assign(data.scenes[menu.scene],menu.nodes);for(const [id,node]of Object.entries(menu.bindings))data.bindings[id]=[menu.scene,node];}
function box(scene,id,width,height){const nodes=data.scenes[scene],scale=width/data.designWidth,root={x:0,y:0,width:data.designWidth,height:height/scale};
 function solve(id){const n=nodes[id];if(!n.parent)return root;const p=solve(n.parent),r=n.rect;if(!r)return p;const min=r.m_AnchorMin,max=r.m_AnchorMax,pivot=r.m_Pivot,pos=r.m_AnchoredPosition,delta=r.m_SizeDelta,w=p.width*(max.x-min.x)+delta.x,h=p.height*(max.y-min.y)+delta.y;return {x:p.x+p.width*(min.x+(max.x-min.x)*pivot.x)+pos.x-w*pivot.x,y:p.y+p.height*(min.y+(max.y-min.y)*pivot.y)+pos.y-h*pivot.y,width:w,height:h};}
 const b=solve(id);return {x:b.x*scale,y:height-(b.y+b.height)*scale,width:b.width*scale,height:b.height*scale};
}
function apply(){const app=document.getElementById('app'),w=app.clientWidth,h=app.clientHeight;app.style.setProperty('--source-unit',w/1080+'px');for(const [id,[scene,node]]of Object.entries(data.bindings)){const el=document.getElementById(id);if(!el)continue;const b=box(scene,node,w,h);Object.assign(el.style,{position:'absolute',left:b.x+'px',top:b.y+'px',right:'auto',bottom:'auto',width:b.width+'px',height:b.height+'px',margin:'0',transform:'none'});}g.TerraMainMenu?.layout(w,h);const u=w/1080;for(const [id,x,y,bw,bh]of [['balance',176,186,728,44],['pause',49,170,80,80],['battle-portrait',190,108,80,80]]){const el=document.getElementById(id);if(el)Object.assign(el.style,{position:'absolute',left:x*u+'px',top:y*u+'px',width:bw*u+'px',height:bh*u+'px'});}const leader=document.getElementById('leader-skill');if(leader)Object.assign(leader.style,{left:(w-206*u)/2+'px',top:h-206*u-22*u+'px',width:206*u+'px',height:206*u+'px'});}
g.TerraLayout={box,apply};if(typeof module!=='undefined')module.exports=g.TerraLayout;
if(typeof document!=='undefined'){window.addEventListener('resize',apply);apply();}
})(globalThis);
