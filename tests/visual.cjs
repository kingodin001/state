const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 const p=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const errors=[];p.on('pageerror',e=>errors.push(String(e)));
 await p.goto('file://'+path.resolve(__dirname,'../app/src/main/assets/game/index.html'));await p.waitForTimeout(1500);
 const out=path.resolve(__dirname,'../test-results');fs.mkdirSync(out,{recursive:true});
 await p.screenshot({path:out+'/menu.png'});await p.locator('#play').click();await p.waitForTimeout(200);await p.screenshot({path:out+'/battle.png'});
 console.log('snapshot',JSON.stringify(await p.evaluate(()=>window.terraSnapshot())));console.log('errors',errors);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
