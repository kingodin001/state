/* Shared battlefield geometry. Coordinates and timings never depend on the display FPS. */
(function(root){
'use strict';
const TIMING=Object.freeze({departureInterval:.095,marchSpeed:100,marchVariation:.04});
function inside(x,y,poly){let v=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>y)!==(b[1]>y))&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])v=!v;}return v;}
function slot(region,index){
 const x=region.x===undefined?region.center[0]:region.x,y=region.y===undefined?region.center[1]:region.y;
 const angle=index*2.399963+region.id*.73,radius=19+Math.sqrt((index%80)/80)*62;
 for(let k=0;k<7;k++){const r=radius*Math.pow(.72,k),p={x:x+Math.cos(angle)*r,y:y+Math.sin(angle)*r};if(!region.poly||inside(p.x,p.y,region.poly))return p;}
 return {x,y};
}
function bounds(map,overview){
 if(overview)return {x:0,y:0,width:map.width,height:map.height};
 const xs=map.regions.map(r=>r.center[0]),ys=map.regions.map(r=>r.center[1]);
 return {x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
}
function camera(map,rect,options={}){
 const b=bounds(map,options.overview),pad=options.overview?12:25;
 const s=Math.min((rect.width-pad*2)/Math.max(1,b.width),(rect.height-pad*2)/Math.max(1,b.height));
 const zoom=options.zoom||1;
 return {s:s*zoom,baseScale:s,x:rect.x+rect.width/2-(b.x+b.width/2)*s*zoom+(options.pan?.x||0),y:rect.y+rect.height/2-(b.y+b.height/2)*s*zoom+(options.pan?.y||0),rect:{...rect},bounds:b};
}
const api={TIMING,inside,slot,bounds,camera};root.TerraField=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
