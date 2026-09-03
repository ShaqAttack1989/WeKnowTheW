import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const BASE=String(process.env.YEARBOOK_BASE_URL||'https://www.weknowthew.com').replace(/\/$/,'');
const now=new Date();
const requested=Number.parseInt(String(process.env.YEARBOOK_SEASON||now.getUTCFullYear()),10);
const season=Number.isInteger(requested)&&requested>=1997?requested:now.getUTCFullYear();
const force=/^(1|true|yes)$/i.test(String(process.env.FORCE_YEARBOOK_FREEZE||''));
const earliest=new Date(Date.UTC(season,10,15,12));
const targetDir=path.resolve('data/season-yearbooks');
const target=path.join(targetDir,`${season}.json`);
const feeds=['snack-shak-latest.json','snack-shak-breaking.json','snack-shak-specials.json','snack-shaq-posts.json'];

async function fetchJson(route){
  const url=route.startsWith('http')?route:`${BASE}/${route.replace(/^\//,'')}`;
  const response=await fetch(`${url}${url.includes('?')?'&':'?'}yearbook=${Date.now()}`,{headers:{Accept:'application/json','User-Agent':'WeKnowTheW yearbook freeze/1.0'},cache:'no-store'});
  if(!response.ok)throw new Error(`${url} returned ${response.status}`);
  return response.json();
}
function number(value){const n=Number(value);return Number.isFinite(n)?n:null;}
function inferChampion(competition={}){
  const games=Array.isArray(competition?.playoffs?.games)?competition.playoffs.games.filter(game=>game.completed):[];
  if(!games.length)return null;
  const latest=[...games].sort((a,b)=>String(b.date||b.startTimeUtc).localeCompare(String(a.date||a.startTimeUtc)))[0];
  if(!latest)return null;
  const pair=[latest.homeTeam,latest.awayTeam].sort();
  const finals=games.filter(game=>[game.homeTeam,game.awayTeam].sort().join('|')===pair.join('|'));
  const wins=new Map(pair.map(team=>[team,0]));
  finals.forEach(game=>{const home=number(game.homeScore),away=number(game.awayScore);if(home===null||away===null||home===away)return;const winner=home>away?game.homeTeam:game.awayTeam;wins.set(winner,(wins.get(winner)||0)+1);});
  const order=[...wins.entries()].sort((a,b)=>b[1]-a[1]);
  if((order[0]?.[1]||0)<3)return null;
  return {year:String(season),champion:order[0][0],runnerUp:order[1][0],result:`${order[0][1]} to ${order[1][1]}`,finalsMvp:null};
}
async function snackRanking(){
  const results=await Promise.allSettled(feeds.map(fetchJson)),map=new Map();
  results.forEach(result=>{if(result.status==='fulfilled'&&Array.isArray(result.value.posts))result.value.posts.forEach(post=>{if(post?.slug)map.set(post.slug,post);});});
  return [...map.values()].filter(post=>String(post.published||'').startsWith(String(season))&&Array.isArray(post.rankings)&&post.rankings.length).sort((a,b)=>String(b.published).localeCompare(String(a.published))||Number(b.priority||0)-Number(a.priority||0))[0]||null;
}
async function existingFrozen(){
  if(!existsSync(target))return false;
  try{return Boolean(JSON.parse(await readFile(target,'utf8')).frozen);}catch{return false;}
}

if(!force&&now<earliest){
  console.log(`Season ${season} is still inside the live yearbook window. Freeze begins after Nov. 15.`);
  process.exit(0);
}
if(await existingFrozen()){
  console.log(`Season ${season} is already frozen. No rewrite permitted.`);
  process.exit(0);
}

const [stats,players,transactions,rotationHistory,competition,ranking]=await Promise.all([
  fetchJson(`api/stats?season=${season}`),
  fetchJson(`api/player-season-snapshot?season=${season}`),
  season===now.getUTCFullYear()?fetchJson('api/player-movement'):fetchJson(`api/yearbook-transactions?season=${season}`),
  fetchJson('rotation-history.json'),
  fetchJson(`api/competition?season=${season}`),
  snackRanking()
]);
const champion=inferChampion(competition);
if(!force&&!champion){
  console.log(`Season ${season} does not yet have a completed Finals series in the verified competition feed. Not freezing.`);
  process.exit(0);
}
if(!Array.isArray(stats.standings)||stats.standings.length<10)throw new Error(`Season ${season} standings are incomplete; refusing to freeze.`);
if(!Array.isArray(players.players)||players.players.length<80)throw new Error(`Season ${season} player snapshot is incomplete; refusing to freeze.`);

const snapshot={
  season,
  frozen:true,
  frozenAt:new Date().toISOString(),
  archiveRule:'Immutable once written. Corrections require a deliberate manual edit with source documentation.',
  champion,
  stats:{...stats,liveGames:[],upcomingGames:[]},
  players,
  transactions:Array.isArray(transactions.transactions)?transactions.transactions:[],
  rotationHistory,
  snackRanking:ranking,
  competition,
  sources:[stats.source,players.source,transactions.source,'We Know the W rotation archive','We Know the W Snack Shak archive'].filter(Boolean)
};
await mkdir(targetDir,{recursive:true});
await writeFile(target,JSON.stringify(snapshot,null,2)+'\n','utf8');
console.log(`Frozen The W Rewind yearbook for ${season} at ${target}.`);
