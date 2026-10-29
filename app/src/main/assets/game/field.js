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
 if(map.reference&&map.stages){
  const stage=options.stage||0,c=options.overview?map.previewCamera:map.stages[stage].camera,regs=options.overview?map.regions:map.regions.filter(r=>(r.stage||0)===stage),pad=options.overview?15:26,top=options.overview?16:42;
  const xs=regs.map(r=>r.center[0]),ys=regs.map(r=>r.center[1]),b={x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
  const sourceScale=rect.height/(2*c.halfHeight),fit=Math.min((rect.width-pad*2)/Math.max(1,b.width),(rect.height-top-pad)/Math.max(1,b.height)),s=Math.min(sourceScale,fit);
  let x=rect.x+rect.width/2-c.center[0]*s,y=rect.y+rect.height/2-c.center[1]*s;
  // Respect the serialized camera while keeping counters reachable on narrow phones.
  x=Math.max(rect.x+pad-b.x*s,Math.min(rect.x+rect.width-pad-(b.x+b.width)*s,x));
  y=Math.max(rect.y+top-b.y*s,Math.min(rect.y+rect.height-pad-(b.y+b.height)*s,y));
  return {s,baseScale:s,x,y,rect:{...rect},bounds:b,sourceCamera:c,stage};
 }
 const b=bounds(map,options.overview),pad=options.overview?12:25,top=options.overview?40:42;
 const s=Math.min((rect.width-pad*2)/Math.max(1,b.width),(rect.height-top-pad)/Math.max(1,b.height));
 const zoom=options.zoom||1;
 const center=options.focus||{x:b.x+b.width/2,y:b.y+b.height/2};
 return {s:s*zoom,baseScale:s,x:rect.x+rect.width/2-center.x*s*zoom+(options.pan?.x||0),y:rect.y+top+(rect.height-top-pad)/2-center.y*s*zoom+(options.pan?.y||0),rect:{...rect},bounds:b};
}
const SOURCE_TIMING=Object.freeze({departureInterval:.25,marchSpeed:120,marchVariation:0,waveSize:5});
const api={SOURCE_TIMING,TIMING,inside,slot,bounds,camera};root.TerraField=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
