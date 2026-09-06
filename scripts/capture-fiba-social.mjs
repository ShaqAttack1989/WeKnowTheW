import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const SITE='https://www.weknowthew.com/fiba-world-cup.html';
const OUT=path.resolve('social/fiba');
await fs.mkdir(OUT,{recursive:true});

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1200,height:1800},deviceScaleFactor:1});
await page.goto(SITE,{waitUntil:'domcontentloaded',timeout:90000});
await page.waitForSelector('#fibaGamesGrid .fiba-game-card.is-final',{timeout:90000});
await page.waitForFunction(()=>document.querySelectorAll('#fibaGamesGrid .fiba-game-card.is-final .fiba-game-potg.is-ready').length>0,{timeout:90000}).catch(()=>{});

const dates=await page.$$eval('#fibaGamesGrid .fiba-game-card.is-final',cards=>[...new Set(cards.map(card=>card.dataset.gameDate).filter(Boolean))].sort());

for(const date of dates){
  await page.evaluate(date=>{
    document.querySelectorAll('#fibaGamesGrid .fiba-game-card').forEach(card=>{
      card.style.display=card.classList.contains('is-final')&&card.dataset.gameDate===date?'block':'none';
    });
    const grid=document.getElementById('fibaGamesGrid');
    if(grid){grid.style.maxHeight='none';grid.style.overflow='visible';grid.style.gridTemplateColumns='repeat(2,minmax(0,1fr))';grid.style.gap='14px';}
    const filters=document.getElementById('fibaGameFilters');if(filters)filters.style.display='none';
    const panel=grid?.closest('.fiba-panel');
    if(panel){
      panel.style.width='1080px';panel.style.maxWidth='1080px';panel.style.margin='0 auto';panel.style.boxSizing='border-box';
      const heading=panel.querySelector('.fiba-panel-head h3');if(heading)heading.textContent='FIBA World Cup · '+date+' Finals';
      const note=panel.querySelector('.fiba-panel-head small');if(note)note.textContent='Final scores + official FIBA Player of the Game · We Know the W';
    }
  },date);
  const panel=page.locator('#fibaGamesGrid').locator('xpath=ancestor::*[contains(@class,"fiba-panel")][1]');
  await panel.screenshot({path:path.join(OUT,`${date}-fiba-results.png`)});
}

await browser.close();
console.log(`Captured ${dates.length} FIBA social screenshots: ${dates.join(', ')}`);
