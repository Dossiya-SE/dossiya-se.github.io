const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const root = process.cwd();
const server=http.createServer((req,res)=>{
 const url=decodeURIComponent((req.url||'/').split('?')[0]);
 if(!['/scientific-visual-verification.html','/research-ecosystem.json'].includes(url)){res.writeHead(404);res.end();return}
 const file=path.join(root,url.slice(1));
 res.setHeader('Content-Type',url.endsWith('.json')?'application/json':'text/html; charset=utf-8');
 fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port;
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [390,768,1280]){
   const page=await browser.newPage({viewport:{width,height:850},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+port+'/scientific-visual-verification.html');
   await page.waitForFunction(()=>document.querySelector('#family').options.length===5);
   assert.equal(await page.locator('#family option').count(),5);
   assert.equal(await page.locator('#tree g[role=button]').count(),4);
   for(let i=0;i<5;i++){
    await page.locator('#family').selectOption({index:i});
    const expected=[4,3,6,3,2][i];
    assert.equal(await page.locator('#tree g[role=button]').count(),expected);
    await page.locator('#tree g[role=button]').first().focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#detail a').count(),1);
   }
   await page.locator('#time').fill('18');
   assert.equal(await page.locator('#time-label').textContent(),'18.0');
   const r=Number(await page.locator('#residual').textContent());
   assert.ok(r<1e-12);
   await page.locator('#reset').click();
   assert.equal(await page.locator('#time-label').textContent(),'0.0');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   assert.equal(overflow,false,'horizontal overflow '+width);
   await page.addScriptTag({path:require.resolve('axe-core')});
   const accessibility=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   assert.deepEqual(accessibility.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),[],'accessibility violations '+width);
   assert.deepEqual(errors,[],'page errors '+width);
   await page.close();
   console.log('PASS browser viewport '+width);
  }
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
