import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const ROOT=process.cwd();
const DATA_PATH=path.join(ROOT,'data','wpba-2026.json');
const BASE='https://www.womenspba.com/stats#/2693';
const DIVISION='49639';
const METRIC_GROUP={PPG:'Scoring','FG%':'Scoring','2PT FG%':'Shooting','3PT FG%':'Shooting','FT%':'Shooting',APG:'Playmaking',RPG:'Rebounding',SPG:'Defense',BPG:'Defense'};
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const num=value=>Number(String(value??'').replace(/[^0-9.-]/g,''));

async function openDashboard(page,route,readyText){
  const separator=route.includes('?')?'&':'?';
  await page.goto(`${BASE}/${route}${separator}division_id=${DIVISION}`,{waitUntil:'domcontentloaded',timeout:90000});
  await page.getByText(readyText,{exact:false}).first().waitFor({state:'visible',timeout:90000});
  await page.waitForTimeout(2500);
}

async function scrapeStandings(page){
  await openDashboard(page,'standings','Standings');
  const tables=await page.locator('main table').evaluateAll(nodes=>nodes.map(table=>({
    headers:[...table.querySelectorAll('thead th')].map(cell=>cell.textContent.replace(/\s+/g,' ').trim()),
    rows:[...table.querySelectorAll('tbody tr')].map(row=>[...row.querySelectorAll('th,td')].map(cell=>cell.textContent.replace(/\s+/g,' ').trim()))
  })));
  const names=tables.find(table=>table.headers.some(header=>/^team$/i.test(header))&&table.rows.length>=8);
  const stats=tables.find(table=>table.headers.includes('GP')&&table.headers.some(header=>/W%/.test(header))&&table.rows.length>=8);
  if(!names||!stats)throw new Error('Could not identify the official WPBA standings tables');
  const column=label=>stats.headers.findIndex(header=>clean(header).toLowerCase()===label.toLowerCase());
  const nameColumn=Math.max(0,names.headers.findIndex(header=>/^team$/i.test(header)));
  const rows=stats.rows.slice(0,8).map((values,index)=>({
    rank:index+1,
    team:clean(names.rows[index]?.[nameColumn]||names.rows[index]?.find(Boolean)),
    gp:num(values[column('GP')]),w:num(values[column('W')]),l:num(values[column('L')]),
    pct:clean(values[column('W%')]),pf:num(values[column('PF')]),pa:num(values[column('PA')]),
    gb:clean(values[column('GB')]),l10:clean(values[column('L10')]),streak:clean(values[column('Streak')])
  }));
  if(rows.length!==8||rows.some(row=>!row.team||!Number.isFinite(row.gp)))throw new Error('Official WPBA standings were incomplete');
  return rows;
}

async function scrapeLeaders(page,previous){
  await openDashboard(page,'leaders/grid?game_type=Regular%20Season','Leaders');
  const found=await page.evaluate(metrics=>{
    const normalize=value=>String(value??'').replace(/\s+/g,' ').trim();
    const output=[];
    for(const metric of metrics){
      const heading=[...document.querySelectorAll('h2,h3,h4')].find(node=>normalize(node.textContent).toUpperCase()===metric.toUpperCase());
      if(!heading)continue;
      let container=heading.parentElement;
      for(let i=0;i<4&&container;i+=1){
        const links=[...container.querySelectorAll('a')].filter(link=>normalize(link.textContent)&&!normalize(link.textContent).match(/view|more|team|leader/i));
        if(links.length){
          const playerLink=links[0],player=normalize(playerLink.textContent);
          let row=playerLink.parentElement;
          for(let j=0;j<4&&row;j+=1){
            const text=normalize(row.textContent);
            const values=text.match(/\b\d+(?:\.\d+)?%?\b/g)||[];
            if(text.includes(player)&&values.length){
              const nearbyLinks=[...row.querySelectorAll('a')].map(link=>normalize(link.textContent)).filter(Boolean);
              output.push({metric,player,team:nearbyLinks.find(value=>value!==player)||'',value:values[values.length-1]});
              break;
            }
            row=row.parentElement;
          }
          break;
        }
        container=container.parentElement;
      }
    }
    return output;
  },Object.keys(METRIC_GROUP));
  if(found.length<5)return previous;
  const previousByMetric=new Map(previous.map(item=>[item.metric,item]));
  found.forEach(item=>{
    if(item.player&&item.value){
      const old=previousByMetric.get(item.metric)||{};
      previousByMetric.set(item.metric,{group:METRIC_GROUP[item.metric],metric:item.metric,player:item.player,team:item.team||old.team||'',value:item.value});
    }
  });
  return [...previousByMetric.values()];
}

async function scrapeGames(page,previous){
  await openDashboard(page,'scores','Scores');
  const scraped=await page.locator('main article[aria-label*=" vs "]').evaluateAll(nodes=>nodes.map(node=>({label:node.getAttribute('aria-label')||'',text:node.textContent.replace(/\s+/g,' ').trim()})));
  const parsed=scraped.map(item=>{
    const match=item.label.match(/^(.*?)\s+vs\s+(.*?)\s+on\s+(\d{4}-\d{2}-\d{2})(?:\s+at\s+(.+))?$/i);
    if(!match)return null;
    const scorePair=item.text.match(/\b(\d{1,3})\s*[-–]\s*(\d{1,3})\b/);
    const status=/forfeit/i.test(item.text)?'Forfeit':/final/i.test(item.text)?'Final':'Scheduled';
    return {date:match[3],time:clean(match[4]),away:clean(match[1]),home:clean(match[2]),awayScore:scorePair?num(scorePair[1]):null,homeScore:scorePair?num(scorePair[2]):null,status,venue:item.text.match(/San Leandro High School/i)?.[0]||''};
  }).filter(Boolean);
  if(parsed.length<4)return previous;
  const prior=new Map(previous.map(game=>[`${game.date}|${game.away}|${game.home}`,game]));
  return parsed.map(game=>{
    const old=prior.get(`${game.date}|${game.away}|${game.home}`)||{};
    return {...old,...game,awayScore:game.awayScore??old.awayScore??null,homeScore:game.homeScore??old.homeScore??null,venue:game.venue||old.venue||''};
  });
}

const stable=value=>JSON.stringify(value,(key,item)=>key==='updatedAt'?undefined:item);
const previous=JSON.parse(await fs.readFile(DATA_PATH,'utf8'));
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1200}});
let next=structuredClone(previous);
try{
  const standings=await scrapeStandings(page);
  const idByName=new Map(previous.standings.map(row=>[row.team,row.teamId]));
  next.standings=standings.map(row=>({...row,teamId:idByName.get(row.team)||null}));
  next.leaders=await scrapeLeaders(page,previous.leaders||[]);
  next.games=await scrapeGames(page,previous.games||[]);
}finally{
  await browser.close();
}
if(stable(next)===stable(previous)){
  console.log('WPBA dashboard already matches the official feed.');
  process.exit(0);
}
next.updatedAt=new Date().toISOString();
await fs.writeFile(DATA_PATH,`${JSON.stringify(next,null,2)}\n`);
console.log(`Updated WPBA dashboard at ${next.updatedAt}.`);
