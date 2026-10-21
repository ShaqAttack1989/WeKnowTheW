/* Deterministic browser checks of real pages and article feeds.
 * API fixtures isolate upstream outages; portrait URLs are asserted separately.
 * W_REAL_PHOTOS=/path/to/downloads can supply reviewed real images for visual QA. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const stories=require('../homepage-fresh-stories');
const portraits=require('../coach-photos');
const now=Date.parse('2026-10-21T21:00:00Z');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const pixel=Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7','base64');
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/')){
    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({found:false,items:[],teams:[],standings:[],liveGames:[],upcomingGames:[],pastGames:[],todayGames:[],playoffs:{started:true,games:[]},picks:[]}));return;
  }
  const file=path.join(root,decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});
  try{
    const context=await browser.newContext();
    await context.addInitScript(time=>{Date.now=()=>time;},now);
    const photoByUrl=new Map();
    for(const entry of portraits.photos)for(const candidate of entry.candidates)photoByUrl.set(decodeURIComponent(candidate.image),entry);
    await context.route('**/*',async route=>{
      const request=route.request();
      if(request.url().startsWith(origin))return route.continue();
      if(request.resourceType()==='image'){
        const photo=photoByUrl.get(decodeURIComponent(request.url()));
        if(photo&&process.env.W_REAL_PHOTOS){
          const name=photo.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.jpg';
          const file=path.join(process.env.W_REAL_PHOTOS,name);
          if(fs.existsSync(file))return route.fulfill({status:200,body:fs.readFileSync(file),contentType:'image/jpeg'});
        }
        return route.fulfill({status:200,body:pixel,contentType:'image/gif'});
      }
      return route.abort();
    });
    const page=await context.newPage();
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    for(const width of (process.env.W_QA_QUICK?[1600]:[390,900,1280,1440,1600])){
      await page.setViewportSize({width,height:1000});
      for(const route of (process.env.W_QA_QUICK?['/coaches.html']:['/coaches.html','/owners.html','/celebrity-fans.html','/gameday-vibes.html','/best-womens-basketball-coaches.html','/food-for-thought.html','/'])){
        errors.length=0;
        await page.goto(origin+route,{waitUntil:'networkidle'});
        assert.deepEqual(errors,[],`${route} runtime errors at ${width}`);
        const geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,brand:document.querySelector('.site-navigation .brand')?.getBoundingClientRect().toJSON(),nav:document.querySelector('.site-navigation')?.getBoundingClientRect().toJSON()}));
        if(geometry.scroll>width+2){
          console.log(await page.evaluate(()=>[...document.querySelectorAll('body *')].map(node=>({tag:node.tagName,class:node.className,text:node.textContent.slice(0,65),right:node.getBoundingClientRect().right,left:node.getBoundingClientRect().left})).filter(row=>row.right>innerWidth+2||row.left<-2).slice(0,15)));
          if(process.env.W_SCREENSHOTS)await page.screenshot({path:path.join(process.env.W_SCREENSHOTS,'layout-failure.png'),fullPage:true});
        }
        assert.ok(geometry.scroll<=width+2,`${route} overflows: ${geometry.scroll}px at ${width}px`);
        assert.ok(geometry.brand&&geometry.brand.right<=width,`${route}: brand outside viewport`);
        if(width>1460){
          const overlap=await page.evaluate(()=>document.querySelector('.site-navigation .brand').getBoundingClientRect().right>document.querySelector('#navLinks').getBoundingClientRect().left);
          assert.equal(overlap,false,`${route}: branding overlaps navigation`);
        }
        if(process.env.W_SCREENSHOTS&&['/coaches.html','/food-for-thought.html','/'].includes(route)){
          fs.mkdirSync(process.env.W_SCREENSHOTS,{recursive:true});
          await page.screenshot({path:path.join(process.env.W_SCREENSHOTS,`${route==='/'?'home':route.slice(1,-5)}-${width}.png`)});
          if(route==='/coaches.html'){
            for(const card of await page.locator('#cultureGrid .culture-card').all()){
              await card.scrollIntoViewIfNeeded();
              await card.locator('.culture-photo img').evaluate(img=>img.decode());
              await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
            }
            await page.locator('#cultureGrid').screenshot({path:path.join(process.env.W_SCREENSHOTS,`portraits-${width}.png`)});
          }
        }
        if(['/coaches.html','/owners.html','/celebrity-fans.html','/gameday-vibes.html'].includes(route))assert.ok(await page.locator('#cultureGrid .culture-card,.vibe-card').count()>0,`${route} cards empty`);
        if(route==='/coaches.html'){
          assert.equal(await page.locator('#cultureGrid .culture-verified-portrait').count(),15);
          assert.equal(await page.locator('#cultureGrid .culture-photo-credit').count(),15);
          const jose=page.locator('#cultureGrid .culture-card').filter({has:page.locator('h3',{hasText:'Jose Fernandez'})});
          assert.equal(await jose.locator('.culture-photo img').getAttribute('src'),portraits.get('Jose Fernandez').candidates[0].image);
          await page.locator('#coachDashboardSearch').fill('Nakase');
          assert.equal(await page.locator('#coachDashboardTable tr').count(),1);
          await page.locator('#coachDashboardSearch').fill('');
          await page.locator('button[data-coach-focus="Karl Smesko"]').click();
          assert.equal(await page.locator('#coachDashboardSelect').inputValue(),'Karl Smesko');
        }
        if(width===390){
          await page.locator('#menuButton').click();
          assert.equal(await page.locator('#menuButton').getAttribute('aria-expanded'),'true');
          const menu=page.locator('#navLinks');assert.ok(await menu.isVisible());
          await page.keyboard.press('Escape');assert.equal(await menu.isVisible(),false);
        }
        if(route==='/'&&width===1600){
          const expected=stories.selectStories(stories.feeds.map(url=>JSON.parse(fs.readFileSync(path.join(root,url),'utf8')).posts),now);
          const slugs=await page.locator('#freshTopStories [data-story-slug],#freshNextStory [data-story-slug],#freshMoreStories [data-story-slug]').evaluateAll(nodes=>nodes.map(node=>node.dataset.storySlug));
          assert.deepEqual(slugs,expected.slice(0,7).map(post=>post.slug));
          const headlineHrefs=await page.locator('#wDeskHeadlines a').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));
          assert.deepEqual(headlineHrefs,expected.slice(0,7).map(stories.href));
          const articleLinks=await page.locator('#freshTopStories a[data-story-slug],#freshNextStory a[data-story-slug],#freshMoreStories a[data-story-slug],#weekHubFood a,#weekHubByte a').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));
          for(const href of new Set(articleLinks)){
            const response=await page.goto(origin+href,{waitUntil:'networkidle'});assert.equal(response.status(),200,href);
            const slug=new URL(href,origin).searchParams.get('post');
            if(slug){
              const post=expected.find(post=>post.slug===slug);assert.ok(post,href);
              assert.ok((await page.locator('#snackCollectionStory').innerText()).includes(post.title),`${slug} did not resolve`);
            }
            assert.deepEqual(errors,[],`Article errors: ${href}`);
          }
        }
      }
      console.log(`PASS rendered pages, cards, menu and overflow at ${width}px`);
    }
    // Force the primary URL to fail; its reviewed backup must load with its own credit.
    await context.route(portraits.get('Karl Smesko').candidates[0].image,route=>route.fulfill({status:503,body:''}));
    await page.goto(origin+'/coaches.html',{waitUntil:'networkidle'});
    const karl=page.locator('#cultureGrid .culture-card').filter({has:page.locator('h3',{hasText:'Karl Smesko'})});
    await page.waitForFunction(()=>document.querySelector('[data-media-name="Karl Smesko"] img')?.naturalWidth>0);
    assert.equal(await karl.locator('.culture-photo img').getAttribute('src'),portraits.get('Karl Smesko').candidates[1].image);
    assert.equal(await karl.locator('.culture-photo-credit').getAttribute('href'),portraits.get('Karl Smesko').candidates[1].sourceUrl);
    // All photo candidates fail: keep readable identity, no logo and no stale credit.
    for(const entry of portraits.photos)for(const candidate of entry.candidates)await context.route(candidate.image,route=>route.fulfill({status:503,body:''}));
    await page.goto(origin+'/coaches.html',{waitUntil:'networkidle'});
    assert.equal(await page.locator('#cultureGrid .culture-photo img').count(),0);
    assert.equal(await page.locator('#cultureGrid .culture-photo-credit').count(),0);
    assert.equal(await page.locator('#cultureGrid .culture-initials').count(),15);
    console.log('PASS reviewed photo backups and complete photo outage');
    // A failed article refresh must retain the last successful feed snapshots.
    await page.goto(origin+'/',{waitUntil:'networkidle'});
    const before=await page.locator('#freshTopStories').innerText();
    await context.route('**/snack-*.json',route=>route.fulfill({status:503,body:''}));
    await page.evaluate(()=>window.WHomeStories.load({force:true}));
    assert.equal(await page.locator('#freshTopStories').innerText(),before);
    console.log('PASS article links and last-successful-feed behavior');
    await context.close();
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
