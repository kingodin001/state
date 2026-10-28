const {test}=require('node:test'),assert=require('node:assert/strict');
const {Battle}=require('../app/src/main/assets/game/engine.js'),field=require('../app/src/main/assets/game/field.js'),levels=require('../app/src/main/assets/game/maps.js');
function fixture(){const b=new Battle({seed:2,cap:50,enemyRate:0,aiInterval:9999,regions:[{id:0,owner:1,units:50,center:[0,0],kind:'normal'},{id:1,owner:0,units:5,center:[1000,0],kind:'normal'},{id:2,owner:2,units:10,center:[2000,0],kind:'normal'}]});b.production=0;return b;}
const advance=(b,t,fps=40)=>{for(let i=0;i<Math.round(t*fps);i++)b.step(1/fps);};
test('A 50 troop order takes 4.75 seconds to depart, retains defenders and conserves population',()=>{
 const b=fixture();assert.equal(b.command([0],1),50);assert.equal(b.regions[0].units,50);assert.equal(b.available(0),0);assert.equal(b.totals()[1],50);
 advance(b,1);assert.equal(b.units.length,10);assert.equal(b.regions[0].units,40);assert.equal(b.reserved(0),40);assert.equal(b.totals()[1],50);
 advance(b,3);assert.equal(b.units.length,42);assert.equal(b.regions[0].units,8);advance(b,.75);assert.equal(b.units.length,50);assert.equal(b.waves.length,0);assert.equal(b.totals()[1],50);
});
test('Repeated partial orders cannot reserve twice or increase the departure rate',()=>{
 const b=fixture();assert.equal(b.command([0],1,.5),25);assert.equal(b.command([0],2),25);assert.equal(b.command([0],1),0);
 advance(b,1);assert.equal(b.units.length,10);assert.equal(b.totals()[1],50);assert.equal(b.waves.reduce((n,w)=>n+w.left,0),40);
});
test('Capturing a source cancels unlaunched orders without spawning former defenders',()=>{
 const b=fixture();b.command([0],1);advance(b,.2);const old=b.units.length;b.regions[0].owner=2;b.regions[0].units=5;advance(b,1);
 assert.equal(b.waves.length,0);assert.equal(b.units.filter(u=>u.owner===1).length,old);assert.equal(b.regions[0].units,5);
});
test('Marching covers about 100 world units per second instead of teleporting',()=>{
 const b=fixture();b.command([0],1);advance(b,.1);const u=b.units[0],start={x:u.x,y:u.y};advance(b,1);
 const d=Math.hypot(u.x-start.x,u.y-start.y);assert(d>=98&&d<=102);assert.equal(b.regions[1].owner,0);
});
test('Departure cadence and travelled distance agree at 20, 30, 60 and 120 FPS',()=>{
 const samples=[20,30,60,120].map(fps=>{const b=fixture();b.command([0],1);advance(b,2,fps);return b;});
 for(const b of samples){assert.equal(b.units.length,21);assert.equal(b.regions[0].units,29);assert.equal(b.totals()[1],50);assert(Math.abs(b.time-2)<1e-6);assert(Math.abs(b.units[0].x-samples[0].units[0].x)<3);}
});
test('Pending troops still defend the source, and losses cannot create extra soldiers',()=>{
 const b=fixture();b.command([0],1);b.regions[0].units=3;advance(b,2);assert.equal(b.units.length,3);assert.equal(b.waves.length,0);assert.equal(b.totals()[1],3);
});
test('Tactical camera keeps every base and its counter clear of screen edges on the first four maps',()=>{
 for(const [width,height]of [[360,640],[390,844],[412,915]])for(const map of levels.slice(0,4)){
  const rect={x:0,y:104,width,height:height-226},v=field.camera(map,rect);
  for(const r of map.regions){const x=r.center[0]*v.s+v.x,y=r.center[1]*v.s+v.y;assert(x>=24.99&&x<=width-24.99);assert(y>=rect.y+24.99&&y<=rect.y+rect.height-24.99);}
 }
});
test('Camera enlargement exceeds 35% over 0.2.0 on the first level without changing geographic aspect',()=>{
 const map=levels[0],old=Math.min((390-36)/map.width,(844-314)/map.height)*.98,v=field.camera(map,{x:0,y:104,width:390,height:618});
 assert(v.s/old>1.35);assert(Math.abs((map.width*v.s)/(map.height*v.s)-map.width/map.height)<1e-8);
});
test('Overview includes the complete landmass and every garrison slot stays inside its region',()=>{
 for(const map of levels){const v=field.camera(map,{x:0,y:104,width:390,height:618},{overview:true});assert(v.x>=0&&v.x+map.width*v.s<=390);assert(v.y>=104&&v.y+map.height*v.s<=722);
  for(const r of map.regions)for(let i=0;i<90;i++){const p=field.slot(r,i);assert(field.inside(p.x,p.y,r.poly),r.name+' slot '+i);}
 }
});
