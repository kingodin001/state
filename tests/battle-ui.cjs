const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const launch={headless:true,args:['--no-sandbox','--disable-dev-shm-usage']};if(process.env.CHROMIUM_PATH)launch.executablePath=process.env.CHROMIUM_PATH;
const url='file://'+path.resolve(__dirname,'../app/src/main/assets/game/index.html'),out=path.resolve(__dirname,'../test-results/v3');fs.mkdirSync(out,{recursive:true});
const snap=p=>p.evaluate(()=>terraSnapshot()),point=(s,id)=>({x:s.battle.regions[id].screenX,y:s.battle.regions[id].screenY});
async function drag(p,a,b){await p.mouse.move(a.x,a.y);await p.mouse.down();await p.mouse.move(b.x,b.y,{steps:10});await p.mouse.up();}
(async()=>{
 const browser=await chromium.launch(launch),errors=[],metrics=[];
 for(const size of [{width:360,height:640},{width:390,height:844},{width:412,height:915}]){
  for(let level=0;level<5;level++){
   const c=await browser.newContext({viewport:size,isMobile:true,hasTouch:true});await c.addInitScript(level=>localStorage.setItem('terra-storm-v1',JSON.stringify({level,unlocked:4,sound:false,upgrades:[0,0,0]})),level);
   const p=await c.newPage();p.on('pageerror',e=>errors.push(String(e)));await p.goto(url);await p.waitForTimeout(1300);await p.locator('#play').click();let s=await snap(p);
   for(const r of s.battle.regions.filter(r=>r.owner))assert(r.screenX>=10&&r.screenX<size.width-10&&r.screenY>s.camera.rect.y+10&&r.screenY<s.camera.rect.y+s.camera.rect.height-10,'initial faction bases are visible');
   for(const id of ['pause','help','zoom-reset','select-all','fraction','leader-skill']){const b=await p.locator('#'+id).boundingBox();assert(b&&b.x>=0&&b.y>=0&&b.x+b.width<=size.width+1&&b.y+b.height<=size.height+1,id+' is accessible');}
   if(size.width===390){await p.screenshot({path:out+'/level'+(level+1)+'-battle.png'});metrics.push({level:level+1,scale:s.camera.s,rect:s.camera.rect});}
   const home=point(s,s.battle.regions.find(r=>r.owner===1).id);
   await p.locator('#zoom-reset').click();s=await snap(p);assert(s.camera.overview);const m=await p.evaluate(i=>({width:TERRA_LEVELS[i].width,height:TERRA_LEVELS[i].height}),level);assert(s.camera.x>=0&&s.camera.x+m.width*s.camera.s<=size.width+.1);assert(s.camera.y>=s.camera.rect.y&&s.camera.y+m.height*s.camera.s<=s.camera.rect.y+s.camera.rect.height+.1);
   await p.locator('#zoom-reset').click();s=await snap(p);assert(!s.camera.overview);
   const x=s.camera.x;await drag(p,{x:size.width/2,y:s.camera.rect.y+14},{x:size.width/2+34,y:s.camera.rect.y+20});assert(Math.abs((await snap(p)).camera.x-x)>15);assert.equal((await snap(p)).battle.stats.commands,0);
   if(size.width===390&&level===0){
    // Reset any pan, then verify the whole order lifecycle through actual input.
    await p.locator('#zoom-reset').click();await p.locator('#zoom-reset').click();s=await snap(p);let a=point(s,0),b=point(s,1);
    await p.mouse.move(a.x,a.y);await p.mouse.down();await p.mouse.move(b.x,b.y,{steps:8});await p.dispatchEvent('#map','pointercancel',{pointerId:1});await p.mouse.up();assert.equal((await snap(p)).battle.stats.commands,0);
    await p.locator('#fraction').click();await p.locator('[data-fraction="25"]').click();assert.equal(await p.locator('#fraction b').textContent(),'25%');await drag(p,a,b);s=await snap(p);assert.equal(s.battle.stats.commands,1);assert(s.battle.stats.sent>=5&&s.battle.stats.sent<=6);assert(s.battle.regions[0].units>=19);assert.equal(s.battle.regions[1].owner,0);
    await p.locator('#pause').click();await p.locator('#restart').click();s=await snap(p);a=point(s,0);b=point(s,1);
    await p.mouse.move(a.x,a.y);await p.mouse.down();await p.mouse.move(b.x,b.y,{steps:10});await p.waitForTimeout(60);s=await snap(p);assert.equal(s.selection.target,1);assert.equal(s.battle.stats.commands,0);assert(await p.locator('#selection-info').isVisible());await p.screenshot({path:out+'/aim-arrow.png'});await p.mouse.up();
    s=await snap(p);assert.equal(s.battle.stats.commands,1);assert(s.battle.regions[0].reserved>=18);assert(s.battle.regions[0].units>=19);assert.equal(s.battle.regions[1].owner,0);await p.waitForTimeout(1000);s=await snap(p);assert(s.battle.regions[0].reserved>0);assert(s.battle.troops.length>0);assert.equal(s.battle.regions[1].owner,0);await p.screenshot({path:out+'/departing-army.png'});
    await p.waitForFunction(()=>terraSnapshot().battle.regions[1].owner===1,{},{timeout:8000});await p.waitForTimeout(1200);s=await snap(p);a=point(s,0);b=point(s,1);const target=point(s,4),before=s.battle.stats.commands;
    await p.mouse.move(a.x,a.y);await p.mouse.down();await p.mouse.move(b.x,b.y,{steps:6});await p.mouse.move(target.x-12,target.y,{steps:8});s=await snap(p);assert(s.selection.sources.includes(0)&&s.selection.sources.includes(1));await p.screenshot({path:out+'/multi-base-arrow.png'});await p.mouse.up();assert.equal((await snap(p)).battle.stats.commands,before+1);
    await p.locator('#pause').click();await p.locator('#restart').click();s=await snap(p);a=point(s,0);target.x=point(s,4).x;target.y=point(s,4).y;
    await p.mouse.click(a.x,a.y);await p.mouse.move(target.x,target.y);await p.mouse.down();assert.equal((await snap(p)).battle.stats.commands,0);await p.mouse.up();assert.equal((await snap(p)).battle.stats.commands,1);
    await p.locator('#pause').click();await p.locator('#restart').click();const cdp=await c.newCDPSession(p);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:11,x:130,y:360},{id:12,x:230,y:360}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:11,x:100,y:360},{id:12,x:260,y:360}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{id:11,x:100,y:360}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:11,x:320,y:420}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal((await snap(p)).battle.stats.commands,0);assert.deepEqual((await snap(p)).selection.sources,[]);
   }
   await c.close();
  }
  console.log('PASS all five battle cameras, HUD, overview and pan',size.width+'x'+size.height);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/metrics.json',JSON.stringify(metrics,null,2));console.log('PASS arrow preview, progressive launch, fractions, cancellation, multi-base/tap orders, pinch suppression; no JS errors');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
