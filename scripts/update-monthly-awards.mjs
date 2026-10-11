import { readFile, writeFile } from 'node:fs/promises';

const SEASON=2026;
const seasonUrl=`https://en.wikipedia.org/wiki/${SEASON}_WNBA_season`;
const officialAwards='https://www.wnba.com/watch?collection=weekly-and-monthly-awards';
const dataPath=new URL('../stat-kitchen-monthly-data.js',import.meta.url);
const pagePath=new URL('../stat-kitchen.html',import.meta.url);
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

function decode(value=''){
  return String(value).replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&#x27;|&apos;/g,"'").replace(/&nbsp;|&#160;/g,' ').replace(/&ndash;|&#8211;/g,'–').replace(/&mdash;|&#8212;/g,'—').replace(/\s+/g,' ').trim();
}
function cleanPlayer(value=''){return decode(value).replace(/\s+\(\d+\)$/,'').trim();}
function sectionTable(html,id){
  const start=html.search(new RegExp(`id=["']${id}["']`,'i'));
  if(start<0)throw new Error(`${id} section not found`);
  const tableStart=html.indexOf('<table',start);
  const tableEnd=html.indexOf('</table>',tableStart);
  if(tableStart<0||tableEnd<0)throw new Error(`${id} table not found`);
  return html.slice(tableStart,tableEnd+8);
}
function parseRows(table,width){
  const rows=[];
  const carry=new Map();
  for(const rowMatch of table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)){
    const row=Array(width).fill('');
    for(const [index,item] of [...carry.entries()]){
      row[index]=item.value;
      item.left-=1;
      if(item.left<=0)carry.delete(index);else carry.set(index,item);
    }
    let cursor=0;
    const cells=[...rowMatch[1].matchAll(/<(th|td)([^>]*)>([\s\S]*?)<\/\1>/gi)];
    for(const cell of cells){
      while(cursor<width&&row[cursor]!=='')cursor+=1;
      if(cursor>=width)break;
      const value=decode(cell[3]);
      row[cursor]=value;
      const span=Number(cell[2].match(/rowspan=["']?(\d+)/i)?.[1]||1);
      if(span>1)carry.set(cursor,{value,left:span-1});
      cursor+=1;
    }
    const first=String(row[0]||'').replace(/\.$/,'');
    if(MONTHS.some(month=>month.toLowerCase()===first.toLowerCase()))rows.push(row);
  }
  return rows;
}
function parseData(source){
  const monthly=source.match(/window\.STAT_KITCHEN_MONTHLY_AWARDS=(\[[\s\S]*?\]);/)?.[1];
  const rookie=source.match(/window\.STAT_KITCHEN_ROOKIE_MONTH_AWARDS=(\[[\s\S]*?\]);/)?.[1];
  if(!monthly||!rookie)throw new Error('Monthly Stat Kitchen data could not be parsed');
  return {
    monthly:Function(`"use strict";return (${monthly});`)(),
    rookie:Function(`"use strict";return (${rookie});`)()
  };
}
function q(value){return `'${String(value||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'")}'`;}
function serialize(monthly,rookie){
  const monthRows=monthly.map(item=>`  {month:${q(item.month)},announced:${q(item.announced)},east:{name:${q(item.east.name)},team:${q(item.east.team)},line:${q(item.east.line)},source:${q(item.east.source)}},west:{name:${q(item.west.name)},team:${q(item.west.team)},line:${q(item.west.line)},source:${q(item.west.source)}}}`);
  const rookieRows=rookie.map(item=>`  {month:${q(item.month)},announced:${q(item.announced)},name:${q(item.name)},team:${q(item.team)},line:${q(item.line)},source:${q(item.source)}}`);
  return `window.STAT_KITCHEN_MONTHLY_AWARDS=[\n${monthRows.join(',\n')}\n];\n\nwindow.STAT_KITCHEN_ROOKIE_MONTH_AWARDS=[\n${rookieRows.join(',\n')}\n];\n`;
}
function sameCore(a,b,type){
  const core=items=>items.map(item=>type==='monthly'?{month:item.month,east:item.east?.name,eastTeam:item.east?.team,west:item.west?.name,westTeam:item.west?.team}:{month:item.month,name:item.name,team:item.team});
  return JSON.stringify(core(a))===JSON.stringify(core(b));
}

const response=await fetch(seasonUrl,{headers:{'User-Agent':'WeKnowTheW monthly awards updater/1.0 (public awards sync)'}});
if(!response.ok)throw new Error(`Awards source returned HTTP ${response.status}`);
const html=await response.text();
const monthlyRows=parseRows(sectionTable(html,'Players_of_the_Month'),5);
const rookieRows=parseRows(sectionTable(html,'Rookies_of_the_Month'),3);
if(!monthlyRows.length||!rookieRows.length)throw new Error('Monthly award tables returned no usable rows');

const source=await readFile(dataPath,'utf8');
const current=parseData(source);
const currentMonthly=new Map(current.monthly.map(item=>[item.month,item]));
const currentRookie=new Map(current.rookie.map(item=>[item.month,item]));
const order=value=>MONTHS.findIndex(month=>month.toLowerCase()===String(value).replace(/\.$/,'').toLowerCase());

const monthly=monthlyRows.map(row=>{
  const month=MONTHS[order(row[0])];
  const old=currentMonthly.get(month)||{};
  return {month,announced:old.announced||'Official WNBA release',east:{name:cleanPlayer(row[1]),team:decode(row[2]),line:'Kia WNBA Eastern Conference Player of the Month',source:officialAwards},west:{name:cleanPlayer(row[3]),team:decode(row[4]),line:'Kia WNBA Western Conference Player of the Month',source:officialAwards}};
}).filter(item=>item.month&&item.east.name&&item.east.team&&item.west.name&&item.west.team).sort((a,b)=>order(b.month)-order(a.month));

const rookie=rookieRows.map(row=>{
  const month=MONTHS[order(row[0])];
  const old=currentRookie.get(month)||{};
  const count=order(month)>=4?order(month)-3:1;
  const line=count>1?`${count===2?'Second':count===3?'Third':count===4?'Fourth':`${count}th`} consecutive Kia WNBA Rookie of the Month honor`:'Kia WNBA Rookie of the Month';
  return {month,announced:old.announced||'Official WNBA release',name:cleanPlayer(row[1]),team:decode(row[2]),line,source:officialAwards};
}).filter(item=>item.month&&item.name&&item.team).sort((a,b)=>order(b.month)-order(a.month));

if(!monthly.length||!rookie.length)throw new Error('Parsed monthly awards were incomplete');
if(sameCore(monthly,current.monthly,'monthly')&&sameCore(rookie,current.rookie,'rookie')){
  console.log(`Monthly awards are current through ${current.monthly[0]?.month||'the latest release'}.`);
  process.exit(0);
}

await writeFile(dataPath,serialize(monthly,rookie));
const stamp=new Date().toISOString().slice(0,10).replaceAll('-','');
const page=await readFile(pagePath,'utf8');
const updatedPage=page.replace(/stat-kitchen-monthly-data\.js\?v=[^"']+/,`stat-kitchen-monthly-data.js?v=${stamp}-monthly`);
await writeFile(pagePath,updatedPage);
console.log(`Monthly awards updated through ${monthly[0].month}: ${monthly[0].east.name}, ${monthly[0].west.name}; rookie ${rookie[0].name}.`);
