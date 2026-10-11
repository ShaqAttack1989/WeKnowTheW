import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const CURRENT_PATH='on-the-wire-current.json';
const ARCHIVE_PATH='on-the-wire-archive.json';
const RETENTION_DAYS=14;
const DAILY_LIMIT=12;
const FEEDS=[
  'https://news.google.com/rss/search?q=WNBA+when%3A1d&hl=en-US&gl=US&ceid=US%3Aen',
  'https://news.google.com/rss/search?q=WNBA+ESPN+when%3A1d&hl=en-US&gl=US&ceid=US%3Aen',
  'https://news.google.com/rss/search?q=WNBA+Associated+Press+when%3A1d&hl=en-US&gl=US&ceid=US%3Aen'
];
const PREFERRED=[
  'ESPN','Associated Press','AP News','CBS Sports','Sports Illustrated','Yahoo Sports','USA TODAY','The Athletic','Just Women’s Sports','Just Womens Sports','NBC Sports','FOX Sports','WNBA','The New York Times','The Washington Post','Los Angeles Times','Chicago Tribune','IndyStar','The Seattle Times','Star Tribune','azcentral','Bleacher Report'
];
const BLOCKED=/\b(betting|odds|parlay|sportsbook|gambling|prop bets?|tickets?|prediction market|promo code)\b/i;

function decodeXml(value=''){
  return String(value)
    .replace(/^<!\[CDATA\[|\]\]>$/g,'')
    .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'")
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
    .trim();
}
function tag(block,name){
  const hit=block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i'));
  return hit?decodeXml(hit[1].replace(/<[^>]+>/g,'')):'';
}
function sourceName(block){
  const hit=block.match(/<source(?:\s[^>]*)?>([\s\S]*?)<\/source>/i);
  return hit?decodeXml(hit[1].replace(/<[^>]+>/g,'')):'';
}
function normalizeTitle(value=''){
  return String(value).toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9]+/g,' ').trim();
}
function cleanTitle(title,source){
  const suffix=` - ${source}`;
  return source&&title.endsWith(suffix)?title.slice(0,-suffix.length).trim():title.trim();
}
function categoryFor(title=''){
  const t=title.toLowerCase();
  if(/retir|legacy|hall of fame|final season/.test(t))return 'Legacy';
  if(/salary|cba|contract|money|business|invest|endorsement|ownership/.test(t))return 'Money and business';
  if(/trade|waiv|signs?\b|released|roster move|free agent/.test(t))return 'Player movement';
  if(/injur|out for|questionable|doubtful|return from|availability/.test(t))return 'Availability';
  if(/mvp|rookie of the year|dpoy|award|player of the week|all.wnba/.test(t))return 'Awards';
  if(/playoff|seed|standings|postseason|clinches?/.test(t))return 'Playoff race';
  if(/eject|confront|courtside|fan|altercation/.test(t))return 'Courtside incident';
  return 'League news';
}
function sourceScore(source=''){
  const s=source.toLowerCase();
  return PREFERRED.some(name=>s.includes(name.toLowerCase()))?4:0;
}
function storyScore(item){
  let score=sourceScore(item.source);
  if(/\bWNBA\b/i.test(item.title))score+=2;
  if(item.category!=='League news')score+=1;
  if(/A'ja|Wilson|Collier|Stewart|Bueckers|Clark|Ionescu|Reese|Ogwumike|Fudd|Miles|Mitchell|Cloud/i.test(item.title))score+=1;
  return score;
}
function idFor(item){
  return crypto.createHash('sha1').update(`${normalizeTitle(item.title)}|${item.source}|${item.publishedAt}`).digest('hex').slice(0,16);
}
async function fetchFeed(url){
  const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0; +https://weknowthew.com)','Accept':'application/rss+xml,application/xml,text/xml'}});
  if(!response.ok)throw new Error(`Feed ${response.status}: ${url}`);
  const xml=await response.text();
  const blocks=xml.match(/<item>[\s\S]*?<\/item>/gi)||[];
  return blocks.map(block=>{
    const source=sourceName(block)||'News source';
    const rawTitle=tag(block,'title');
    const publishedAt=new Date(tag(block,'pubDate')).toISOString();
    const item={
      title:cleanTitle(rawTitle,source),
      url:tag(block,'link'),
      source,
      publishedAt,
      category:categoryFor(rawTitle),
      origin:'auto'
    };
    item.id=idFor(item);
    return item;
  }).filter(item=>item.title&&item.url&&item.publishedAt&&!BLOCKED.test(item.title));
}
async function readJson(path,fallback){
  try{return JSON.parse(await fs.readFile(path,'utf8'));}catch{return fallback;}
}
function dedupe(items){
  const seen=new Set();
  const result=[];
  for(const item of items){
    const key=normalizeTitle(item.title);
    if(!key||seen.has(key))continue;
    seen.add(key);result.push(item);
  }
  return result;
}
function validDate(item){
  const time=new Date(item.publishedAt).getTime();
  return Number.isFinite(time)?time:0;
}

const now=new Date();
const cutoff=now.getTime()-RETENTION_DAYS*24*60*60*1000;
const [current,archive]=await Promise.all([
  readJson(CURRENT_PATH,{items:[]}),
  readJson(ARCHIVE_PATH,{items:[]})
]);

const feedResults=await Promise.allSettled(FEEDS.map(fetchFeed));
const discovered=dedupe(feedResults.flatMap(result=>result.status==='fulfilled'?result.value:[]))
  .filter(item=>validDate(item)>=now.getTime()-48*60*60*1000)
  .sort((a,b)=>storyScore(b)-storyScore(a)||validDate(b)-validDate(a));
const preferred=discovered.filter(item=>sourceScore(item.source)>0);
const daily=(preferred.length>=6?preferred:discovered).slice(0,DAILY_LIMIT);

const merged=dedupe([...(current.items||[]),...daily]).sort((a,b)=>validDate(b)-validDate(a));
const stillCurrent=[];
const moved=[];
for(const item of merged){
  if(validDate(item)<cutoff)moved.push(item);else stillCurrent.push(item);
}
const archived=dedupe([...(archive.items||[]),...moved]).sort((a,b)=>validDate(b)-validDate(a));
const updatedAt=now.toISOString();

await fs.writeFile(CURRENT_PATH,JSON.stringify({updatedAt,retentionDays:RETENTION_DAYS,items:stillCurrent},null,2)+'\n');
await fs.writeFile(ARCHIVE_PATH,JSON.stringify({updatedAt,retentionDays:RETENTION_DAYS,items:archived},null,2)+'\n');

console.log(`On the Wire refreshed: ${daily.length} discovered today, ${stillCurrent.length} current, ${archived.length} archived.`);
for(const result of feedResults){if(result.status==='rejected')console.warn(result.reason?.message||result.reason);}
