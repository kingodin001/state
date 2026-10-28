const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const launch={headless:true,args:['--no-sandbox','--disable-dev-shm-usage']};if(process.env.CHROMIUM_PATH)launch.executablePath=process.env.CHROMIUM_PATH;
const url='file://'+path.resolve(__dirname,'../app/src/main/assets/game/index.html'),out=path.resolve(__dirname,'../test-results/v6');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch(launch),errors=[],report=[];
 for(const size of [{width:360,height:640},{width:390,height:844},{width:412,height:915}]){
  const context=await browser.newContext({viewport:size,isMobile:true,hasTouch:true});await context.addInitScript(()=>localStorage.setItem('terra-storm-v1',JSON.stringify({coins:0,unlocked:199,level:0,sound:false,completed:[],upgrades:[0,0,0,0]})));const p=await context.newPage();p.on('pageerror',e=>errors.push(String(e)));await p.goto(url);await p.waitForTimeout(1400);
  const checked=await p.evaluate(async()=>{
   const bad=[],metrics=[];
   for(let index=0;index<200;index++){
    document.getElementById('level-open').click();document.querySelector('.chapter-index [data-chapter="'+Math.floor(index/10)+'"]').click();document.querySelector('[data-level="'+index+'"]').click();document.getElementById('play').click();
    await new Promise(resolve=>requestAnimationFrame(resolve));const s=terraSnapshot(),v=s.camera;
    if(s.mode!=='battle'||s.level!==index||!s.battle)bad.push({index,reason:'level did not launch'});
    else for(const r of s.battle.regions.filter(r=>r.active!==false&&r.owner)){
     if(r.screenX<13||r.screenX>innerWidth-13||r.screenY-36<v.rect.y-1||r.screenY+18>v.rect.y+v.rect.height+1)bad.push({index,region:r.id,x:r.screenX,y:r.screenY,rect:v.rect,reason:'base/counter clipped'});
    }
    metrics.push({level:index+1,width:innerWidth,height:innerHeight,scale:v.s,regions:s.battle.regions.length,fog:s.battle.fog});
    document.getElementById('pause').click();document.getElementById('back-menu').click();
   }
   return {bad,metrics};
  });
  report.push(...checked.metrics);assert.deepEqual(checked.bad,[]);console.log('PASS all 200 scenarios launch, paint and keep starting faction bases/counters on screen',size.width+'x'+size.height);
  if(size.width===390){for(const index of [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,47,99,149,199]){
   await p.evaluate(index=>{document.getElementById('level-open').click();document.querySelector('.chapter-index [data-chapter="'+Math.floor(index/10)+'"]').click();document.querySelector('[data-level="'+index+'"]').click();document.getElementById('play').click();},index);await p.waitForTimeout(120);await p.screenshot({path:out+'/level-'+String(index+1).padStart(3,'0')+'.png'});await p.locator('#pause').click();await p.locator('#back-menu').click();
  }}await context.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/campaign-layout.json',JSON.stringify(report,null,2));console.log('PASS 600 rendered battle layouts, no JS errors');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
