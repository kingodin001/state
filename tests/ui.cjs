const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const url='file://'+path.resolve(__dirname,'../app/src/main/assets/game/index.html');
const args={headless:true,args:['--no-sandbox','--disable-dev-shm-usage']};if(process.env.CHROMIUM_PATH)args.executablePath=process.env.CHROMIUM_PATH;
(async()=>{
 const browser=await chromium.launch(args);const errors=[];
 for(const size of (process.env.TERRA_DENSE_ONLY?[]:[{width:390,height:844},{width:360,height:640},{width:412,height:915}])){
  const c=await browser.newContext({viewport:size,deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.on('pageerror',e=>errors.push(String(e)));await p.goto(url);await p.waitForTimeout(1400);
  assert.equal((await p.evaluate(()=>terraSnapshot())).mode,'menu');
  for(const id of ['play','nav-world','nav-army','nav-tasks','gift','leader']){const b=await p.locator('#'+id).boundingBox();assert(b&&b.x>=0&&b.y>=0&&b.x+b.width<=size.width+1&&b.y+b.height<=size.height+1,id+' is on screen');}
  await p.locator('#gift').click();await p.locator('#claim-gift').click();assert.equal((await p.evaluate(()=>terraSnapshot())).progress.coins,50);assert(await p.locator('#claim-gift').isDisabled());await p.locator('#close-modal').click();
  await p.locator('[data-upgrade="1"]').click();assert.equal((await p.evaluate(()=>terraSnapshot())).progress.upgrades[1],1);assert.equal((await p.evaluate(()=>terraSnapshot())).progress.coins,0);
  await p.reload();await p.waitForTimeout(1400);assert.equal((await p.evaluate(()=>terraSnapshot())).progress.upgrades[1],1);
  await p.locator('#nav-army').click();await p.locator('[data-tab="fighter"]').click();await p.locator('[data-skin="1"]').click();assert.equal((await p.evaluate(()=>terraSnapshot())).progress.fighter,0);await p.locator('#close-modal').click();
  await p.locator('#play').click();await p.waitForTimeout(100);
  const points=await p.evaluate(()=>{
   const map=TERRA_LEVELS[0],W=innerWidth,H=innerHeight,left=18,right=W-18,top=157,bottom=H-157,s=Math.min((right-left)/map.width,(bottom-top)/map.height)*.98,x=left+(right-left-map.width*s)/2,y=top+(bottom-top-map.height*s)/2;
   return map.regions.map(r=>({name:r.name,x:x+r.center[0]*s,y:y+r.center[1]*s}));
  });
  const a=points.find(r=>r.name==='California'),b=points.find(r=>r.name==='Nevada');
  await p.mouse.move(a.x,a.y);await p.mouse.down();await p.mouse.move(b.x,b.y,{steps:8});await p.mouse.up();await p.waitForTimeout(1700);
  let snap=await p.evaluate(()=>terraSnapshot());assert(snap.battle.stats.sent>=18,'Drag sends troops');assert.equal(snap.battle.regions[1].owner,1,'Nevada captured by touch order');
  await p.locator('#pause').click();const old=(await p.evaluate(()=>terraSnapshot())).battle.time;await p.waitForTimeout(400);assert.equal((await p.evaluate(()=>terraSnapshot())).battle.time,old);
  await p.locator('#restart').click();snap=await p.evaluate(()=>terraSnapshot());assert.equal(snap.battle.stats.sent,0);assert.equal(snap.battle.regions[1].owner,0);assert.equal(snap.battle.units,0);
  await p.locator('#pause').click();await p.locator('#back-menu').click();assert.equal((await p.evaluate(()=>terraSnapshot())).mode,'menu');
  await p.evaluate(()=>{const now=Date.now();document.dispatchEvent(new Event('terraPause'));Date.now=()=>now+3600000;document.dispatchEvent(new Event('terraResume'));});
  assert.equal((await p.evaluate(()=>terraSnapshot())).progress.coins,100,'Background earnings are credited once');
  await p.evaluate(()=>document.dispatchEvent(new Event('terraResume')));assert.equal((await p.evaluate(()=>terraSnapshot())).progress.coins,100);
  console.log('PASS mobile UI',size.width+'x'+size.height);await c.close();
 }
 // Inspect the dense final map and every modal after unlocking in a test profile.
 const c=await browser.newContext({viewport:{width:390,height:844}});await c.addInitScript(()=>localStorage.setItem('terra-storm-v1',JSON.stringify({unlocked:4,level:4,coins:1000})));const p=await c.newPage();p.on('pageerror',e=>errors.push(String(e)));await p.goto(url);await p.waitForTimeout(1300);
 assert.equal((await p.evaluate(()=>terraSnapshot())).level,4);
 const out=path.resolve(__dirname,'../test-results');fs.mkdirSync(out,{recursive:true});await p.screenshot({path:out+'/level5-menu.png'});
 for(const id of ['nav-army','leader','nav-tasks','settings','nav-world']){await p.locator('#'+id).click();await p.screenshot({path:out+'/'+id+'.png'});await p.locator('#close-modal').click();}
 await p.locator('#play').click();await p.waitForTimeout(200);
 const cdp=await c.newCDPSession(p);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:130,y:360},{x:220,y:360}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:85,y:360},{x:265,y:360}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert(await p.locator('#zoom-reset').isVisible(),'Two fingers zoom the map');assert.equal((await p.evaluate(()=>terraSnapshot())).battle.stats.commands,0,'Zoom does not send a troop command');await p.locator('#zoom-reset').click();
 await p.locator('#reinforce').click();assert.equal(await p.locator('#reinforce').getAttribute('class'),'selected');
 const home=await p.evaluate(()=>{const map=TERRA_LEVELS[4],W=innerWidth,H=innerHeight,left=18,right=W-18,top=157,bottom=H-157,s=Math.min((right-left)/map.width,(bottom-top)/map.height)*.98,x=left+(right-left-map.width*s)/2,y=top+(bottom-top-map.height*s)/2,r=map.regions.find(r=>r.owner===1);return{x:x+r.center[0]*s,y:y+r.center[1]*s,id:r.id};});
 const before=(await p.evaluate(()=>terraSnapshot())).battle.regions[home.id].units;await p.mouse.click(home.x,home.y);assert((await p.evaluate(()=>terraSnapshot())).battle.regions[home.id].units>=before+24.9);assert(await p.locator('#reinforce').isDisabled());
 await p.screenshot({path:out+'/level5-battle.png'});assert.deepEqual(errors,[]);console.log('PASS all modal screens, final map, no JavaScript errors');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
