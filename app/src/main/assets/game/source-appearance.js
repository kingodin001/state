/* APK: Linear world colours, raw UI palette, army counts and fill speed 5. */
(function(g){'use strict';
const srgb=x=>x<=.0031308?12.92*x:1.055*Math.pow(x,1/2.4)-.055;
const hex=(c,linear=false)=>'#'+['r','g','b'].map(k=>Math.round(Math.max(0,Math.min(1,linear?srgb(c[k]):c[k]))*255).toString(16).padStart(2,'0')).join('');
function areaColor(p,stage,current,neutral=false){let c=p.Area.Color;if(stage<current)c={...c,r:(c.r+1)*.5,g:(c.g+1)*.5,b:(c.b+1)*.5};else if(stage===current&&neutral)c={...c,r:c.r*.8,g:c.g*.8,b:c.b*.8};return hex(c,true);}
function armyShares(totals){const sum=totals.reduce((n,v,i)=>n+(i>0?Math.max(0,v||0):0),0);return totals.map((v,i)=>i>0&&sum?Math.max(0,v||0)/sum:0);}
class ArmyBar{
 constructor(element,getColor){this.element=element;this.getColor=getColor;this.parts=new Map();}
 reset(){this.parts.clear();this.element.replaceChildren();}
 update(totals){const first=!this.parts.size;for(let owner=1;owner<totals.length;owner++){const target=Math.max(0,totals[owner]||0);if(!target&&!this.parts.has(owner))continue;if(!this.parts.has(owner)){const el=document.createElement('i');el.dataset.owner=owner;this.parts.set(owner,{el,value:first?target:0,target});this.element.append(el);}this.parts.get(owner).target=target;}for(const [owner,p]of this.parts){p.target=Math.max(0,totals[owner]||0);p.el.style.background=this.getColor(owner);}}
 step(dt){const values=[];for(const [owner,p]of this.parts){p.value+=(p.target-p.value)*Math.min(1,Math.max(0,dt)*5);if(p.target===0&&p.value<.01){p.el.remove();this.parts.delete(owner);continue;}values[owner]=p.value;}const shares=armyShares(values);for(const [owner,p]of this.parts){p.el.style.width=(shares[owner]*100)+'%';p.el.dataset.share=shares[owner];}}
}
const api={srgb,hex,areaColor,armyShares,ArmyBar};g.TerraAppearance=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
