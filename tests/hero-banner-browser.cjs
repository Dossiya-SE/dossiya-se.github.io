const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const root=process.cwd();
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'};
const server=http.createServer((req,res)=>{
 try{
  const u=new URL(req.url||'/', 'http://localhost');
  const file=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname)));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
 }catch(e){res.writeHead(400);res.end();}
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});
 try{
  for(const [prefers,initial] of [['no-preference','portfolio-v2-hero-animated.svg'],['reduce','portfolio-v2-hero.svg']]){
   const page=await browser.newPage({viewport:{width:1024,height:1000},colorScheme:'dark',reducedMotion:prefers});
   const errs=[];page.on('pageerror',e=>errs.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded'});
   const img=page.locator('[data-scientific-hero]');
   const toggle=page.locator('[data-hero-motion-toggle]');
   await page.waitForFunction(()=>document.querySelector('[data-hero-motion-toggle]')?.dataset.playing);
   await img.evaluate(el=>new Promise(resolve=>{if(el.complete)resolve();else el.addEventListener('load',resolve,{once:true})}));
   assert.equal((await img.getAttribute('src')).split('/').at(-1),initial,'Initial state '+prefers);
   assert.ok(await img.evaluate(el=>el.complete&&el.naturalWidth>0&&el.naturalHeight>0),'SVG image must load and decode');
   const alternate=initial==='portfolio-v2-hero.svg'?'portfolio-v2-hero-animated.svg':'portfolio-v2-hero.svg';
   await toggle.click();
   await img.evaluate(el=>new Promise(resolve=>{if(el.complete)resolve();else el.addEventListener('load',resolve,{once:true})}));
   assert.equal((await img.getAttribute('src')).split('/').at(-1),alternate,'Click toggles motion '+prefers);
   await toggle.click();
   assert.equal((await img.getAttribute('src')).split('/').at(-1),initial,'Second click restores source '+prefers);
   if(prefers==='no-preference'){
     // Isolate the image from the unrelated animated canvas background.
     await page.addStyleTag({content:'.hero-math-field{display:none!important}'});
     await img.evaluate(el=>new Promise(resolve=>{if(el.complete)resolve();else el.addEventListener('load',resolve,{once:true})}));
     const before=await img.screenshot();
     await page.waitForTimeout(1250);
     const after=await img.screenshot();
     assert.ok(!before.equals(after),'Animated SVG must produce visually distinct frames');
   }
   assert.deepEqual(errs,[],'Unexpected page script errors '+prefers);
   await page.close();
   console.log('PASS animated scientific hero, play/pause, SVG image loading and reduced-motion state:',prefers);
  }
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
