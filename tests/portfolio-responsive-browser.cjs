const { chromium } = require('playwright');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = process.cwd();
const screenshots = path.join(root, 'test-artifacts', 'responsive');
fs.mkdirSync(screenshots, { recursive: true });
const contentTypes = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'application/javascript; charset=utf-8', '.mjs':'application/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml',
  '.gif':'image/gif', '.png':'image/png', '.webp':'image/webp'
};
const server = http.createServer((req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    const filename = pathname === '/' ? '/index.html' : pathname;
    const filepath = path.resolve(root, '.' + filename);
    if (!filepath.startsWith(root + path.sep) || !fs.existsSync(filepath) || !fs.statSync(filepath).isFile()) {
      res.writeHead(404); res.end(); return;
    }
    res.setHeader('Content-Type', contentTypes[path.extname(filepath)] || 'application/octet-stream');
    fs.createReadStream(filepath).pipe(res);
  } catch(error) {res.writeHead(400);res.end(String(error.message));}
});

async function inspectPage(browser,port,pageName,width) {
  const page = await browser.newPage({
    viewport:{width,height:900},
    colorScheme:'light',
    reducedMotion:'reduce'
  });
  try {
    await page.goto('http://127.0.0.1:'+port+'/'+pageName,{waitUntil:'domcontentloaded',timeout:40000});
    // Force lazy scientific SVGs to load in this verification environment.
    // Viewport-independent decoding avoids mistaking unvisited lazy images for broken assets.
    await page.evaluate(() => { for(const img of document.images) img.loading='eager'; });
    await page.waitForFunction(() => [...document.images].every(i => i.complete),{timeout:12000});
    const state = await page.evaluate(() => ({
      background:getComputedStyle(document.body).backgroundColor,
      scrollWidth:document.documentElement.scrollWidth,
      viewportWidth:innerWidth,
      heading:document.querySelector('h1')?.textContent?.trim() || '',
      imageCount:document.images.length,
      brokenImages:[...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src),
      overflowingElements:[...document.querySelectorAll('body *')].map(el=>({el,r:el.getBoundingClientRect()}))
        .filter(({r})=>r.right>innerWidth+1 || r.left < -1)
        .slice(0,32).map(({el,r})=>({
          tag:el.tagName.toLowerCase(),id:el.id,cls:(typeof el.className==='string'?el.className:''),
          left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),
          scrollWidth:el.scrollWidth,word:(el.textContent||'').trim().slice(0,65)
        }))
    }));
    await page.screenshot({path:path.join(screenshots,pageName.replace('.html','')+'-'+width+'.png'),fullPage:false});
    assert.equal(state.background,'rgb(5, 7, 11)',pageName+': dark full-page background at '+width);
    assert.ok(state.scrollWidth <= state.viewportWidth + 1,pageName+': document horizontal overflow at '+width+': '+JSON.stringify(state));
    assert.equal(state.brokenImages.length,0,pageName+': broken images');
    assert.ok(state.heading.length > 5,pageName+': missing page heading');
    if (pageName === 'index.html') {
      assert.equal(await page.locator('#about .about-copy p').count(),3,'Protected About Me paragraphs');
      assert.equal(await page.locator('.evidence-card').count(),4,'Evidence highlights');
      assert.equal(await page.locator('.work-card').count(),6,'Selected project descriptions');
      if(width <= 980) {
        const mobile=page.locator('.mobile-nav');
        assert.ok(await mobile.isVisible(),'Mobile homepage menu not visible at '+width);
        await mobile.locator('summary').click();
        assert.ok(await mobile.locator('a[href="lab.html"]').isVisible(),'Mobile Lab link hidden at '+width);
      } else assert.ok(await page.locator('.nav-links').isVisible(),'Desktop nav hidden at '+width);
    }
    if (pageName === 'lab.html' && width <= 1080) {
      const mobile=page.locator('.lab-mobile-nav');
      assert.ok(await mobile.isVisible(),'Mobile research lab navigation missing at '+width);
      await mobile.locator('summary').click();
      assert.ok(await mobile.locator('a[href="#laboratory"]').isVisible(),'Research Lab navigation item hidden at '+width);
    }
    if (pageName === 'index.html' && (width === 375 || width === 1440)) {
      await page.addScriptTag({path:require.resolve('axe-core')});
      const results=await page.evaluate(async() => await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
      assert.deepEqual(results.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),[], 'WCAG AA violations at '+width);
    }

    console.log('PASS',pageName,width+'px','background='+state.background,'no horizontal overflow','images='+state.imageCount);
  } finally { await page.close(); }
}

(async() => {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port = server.address().port;
  const browser=await chromium.launch({headless:true});
  try {
    const failures=[];
    for(const [name,widths] of [['index.html',[320,375,768,1024,1440]],['lab.html',[375,1024]],['research-ecosystem.html',[375,1440]]]){
      for(const width of widths){
        try{ await inspectPage(browser,port,name,width); }
        catch(error){ console.error('FAIL VIEWPORT',name,width,error.message); failures.push({name,width,error:error.message}); }
      }
    }
    if(failures.length) throw new Error(failures.length+' viewport checks failed: '+JSON.stringify(failures));
  } finally { await browser.close(); server.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
