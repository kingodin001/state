/* PathHolder.GeneratePath: four cross-sections, not random garrison positions.
 * World Y is inverted by the declarative map importer; sides follow that inversion. */
(function(g){'use strict';
const D=g.TerraControlConfig||(typeof require!=='undefined'?require('./reference/control-config.js'):null),F=Math.fround;
function settings(level,source){const row=D.paths[level.source];return row?.overrides[source.sourceId]||row?.defaults||{scale:1,secondForward:1,secondSide:1,thirdForward:1,thirdSide:1};}
function nodes(level,a,b,lane=.5){const c=settings(level,a),unit=level.unit||40,scale=F(c.scale*unit),dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<1e-8)return [{x:a.x,y:a.y},{x:b.x,y:b.y}];const x=dx/d,y=dy/d,nx=-y,ny=x,side=2*Math.max(0,Math.min(1,lane))-1;
 return [{x:a.x,y:a.y},{x:a.x+x*scale*c.secondForward+nx*scale*c.secondSide*side,y:a.y+y*scale*c.secondForward+ny*scale*c.secondSide*side},{x:b.x-x*scale*c.thirdForward+nx*scale*c.thirdSide*side,y:b.y-y*scale*c.thirdForward+ny*scale*c.thirdSide*side},{x:b.x,y:b.y}];}
function length(points,start=0,position=null){let total=0,a=position||points[start];for(let i=position?start:start+1;i<points.length;i++){const b=points[i];total+=Math.hypot(b.x-a.x,b.y-a.y);a=b;}return total;}
function lane(index,amount=5){const step=.25;return .5-Math.ceil(amount/2)*step+step+index*step;}
function move(unit,travel){if(unit.pathIndex>=unit.path.length)return true;const p=unit.path[unit.pathIndex],dx=p.x-unit.x,dy=p.y-unit.y,d=Math.hypot(dx,dy);if(d<=travel+1e-8){unit.x=p.x;unit.y=p.y;unit.pathIndex++;}else if(d){unit.x+=dx/d*travel;unit.y+=dy/d*travel;}return unit.pathIndex>=unit.path.length;}
function remaining(unit){return unit.path?length(unit.path,unit.pathIndex,unit):Math.hypot(unit.tx-unit.x,unit.ty-unit.y);}
const api={settings,nodes,length,lane,move,remaining};g.TerraSourceMovement=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
