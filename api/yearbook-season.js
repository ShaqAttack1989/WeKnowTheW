const EXPECTED_TEAM_COUNTS={1997:8,1998:10,1999:12,2000:16,2001:16,2002:16,2003:14,2004:13,2005:13,2006:14,2007:13,2008:14,2009:13,2010:12,2011:12,2012:12,2013:12,2014:12,2015:12,2016:12,2017:12,2018:12,2019:12,2020:12,2021:12,2022:12,2023:12,2024:12,2025:13};
const EXPECTED_GAMES={1997:28,1998:30,1999:32,2000:32,2001:32,2002:32,2003:34,2004:34,2005:34,2006:34,2007:34,2008:34,2009:34,2010:34,2011:34,2012:34,2013:34,2014:34,2015:34,2016:34,2017:34,2018:34,2019:34,2020:22,2021:32,2022:36,2023:40,2024:40,2025:44};

const TEAM_LABELS={ATL:'Atlanta Dream',CHA:'Charlotte Sting',CHI:'Chicago Sky',CLE:'Cleveland Rockers',CON:'Connecticut Sun',DAL:'Dallas Wings',DET:'Detroit Shock',GSV:'Golden State Valkyries',HOU:'Houston Comets',IND:'Indiana Fever',LAS:'Los Angeles Sparks',LVA:'Las Vegas Aces',MIA:'Miami Sol',MIN:'Minnesota Lynx',NYL:'New York Liberty',ORL:'Orlando Miracle',PHO:'Phoenix Mercury',POR:'Portland Fire',SAC:'Sacramento Monarchs',SAS:'San Antonio Stars',SEA:'Seattle Storm',TUL:'Tulsa Shock',UTA:'Utah Starzz',WAS:'Washington Mystics'};

function clean(value=''){
  return String(value??'')
    .replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')
    .replace(/<[^>]+>/g,' ')
    .replace(/&amp;/g,'&').replace(/&#39;|&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g,' ')
    .replace(/\*\*/g,'').replace(/\s+/g,' ').trim();
}
function cleanPlayer(value=''){return clean(value).replace(/\*+$/,'').trim();}
function cells(line=''){const out=String(line).split('|').map(v=>v.trim());if(out[0]==='')out.shift();if(out[out.length-1]==='')out.pop();return out;}
function number(value){const text=String(value??'').replace(/,/g,'').trim();if(!text||text==='—'||text==='-')return null;const n=Number(text);return Number.isFinite(n)?n:null;}
function normalize(value=''){return clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function teamLabel(code,season){const key=String(code||'').toUpperCase().trim();if(key==='SAS')return season<=2013?'San Antonio Silver Stars':'San Antonio Stars';if(key==='POR'&&season<2026)return 'Portland Fire';return TEAM_LABELS[key]||clean(code)||'Unknown team';}
function multiTeamCode(value=''){return /^(?:2|3|4|5)TM$/i.test(String(value||''));}
function stopStandings(line=''){return /^##\s+(?:Conference Standings|Expanded Standings|Playoff|Per Game|Total Stats|Advanced Stats|League Leaders|League Awards|All-Star)/i.test(String(line).trim());}

function parseStandingsMarkdown(raw='',season){
  const lines=String(raw).split(/\r?\n/);let active=false,currentConference='League';const rows=[];
  for(const rawLine of lines){
    const line=rawLine.trim();
    if(/League Standings Table/i.test(line)){active=true;continue;}
    if(!active&&/^##\s+League Standings/i.test(line)){active=true;continue;}
    if(!active)continue;
    if(rows.length&&stopStandings(line))break;
    if(!line.includes('|'))continue;
    const c=cells(line).map(clean);if(c.length<4)continue;
    const first=c[0].replace(/\*+$/,'').trim();
    if(/^Eastern Conference$/i.test(first)){currentConference='Eastern';continue;}
    if(/^Western Conference$/i.test(first)){currentConference='Western';continue;}
    if(/^Team$/i.test(first)){currentConference='League';continue;}
    if(/^[-: ]+$/.test(first)||/^(Eastern|Western) Conference$/i.test(first))continue;
    const wins=number(c[1]),losses=number(c[2]),winPercentage=number(c[3]);
    if(wins===null||losses===null||winPercentage===null)continue;
    rows.push({team:{full_name:first},conference:currentConference,wins,losses,win_percentage:winPercentage,games_back:number(c[4]),playoff:/\*$/.test(clean(c[0]))});
  }
  const rankByGroup=new Map();
  rows.forEach((row,index)=>{const group=row.conference||'League';rankByGroup.set(group,(rankByGroup.get(group)||0)+1);row.overall_rank=index+1;row.display_rank=rankByGroup.get(group);});
  return rows;
}

function validateStandings(rows=[],season){
  const expectedTeams=EXPECTED_TEAM_COUNTS[season],expectedGames=EXPECTED_GAMES[season];
  const errors=[];
  if(expectedTeams&&rows.length!==expectedTeams)errors.push(`expected ${expectedTeams} teams, received ${rows.length}`);
  if(expectedGames){
    const bad=rows.filter(row=>Number(row.wins)+Number(row.losses)!==expectedGames);
    if(bad.length)errors.push(`${bad.length} team records do not total ${expectedGames} games`);
  }
  const impossible=rows.filter(row=>/Golden State Valkyries|Toronto Tempo/i.test(row.team?.full_name||'')&&season<2025);
  if(impossible.length)errors.push('future expansion teams appeared in an earlier season');
  return {valid:errors.length===0,errors};
}

function hkey(value=''){return clean(value).replace(/[*_`]/g,'').toLowerCase().replace(/\s+/g,'');}
function lastIndex(list,value){let found=-1;list.forEach((item,i)=>{if(item===value)found=i;});return found;}
function parsePerGameMarkdown(raw='',season){
  const rows=[];let ix=null;
  for(const line of String(raw).split(/\r?\n/)){
    if(!line.includes('|'))continue;
    const c=cells(line);if(c.length<10)continue;const h=c.map(hkey);
    if(h.includes('player')&&h.includes('team')&&h.includes('pts')&&h.includes('trb')&&h.includes('ast')&&h.includes('stl')&&h.includes('blk')){
      ix={player:h.indexOf('player'),team:h.indexOf('team'),pos:h.indexOf('pos'),g:lastIndex(h,'g'),mp:lastIndex(h,'mp'),trb:h.indexOf('trb'),ast:h.indexOf('ast'),stl:h.indexOf('stl'),blk:h.indexOf('blk'),pts:h.indexOf('pts')};continue;
    }
    if(!ix||c.every(v=>/^[-: ]+$/.test(v)))continue;
    const name=cleanPlayer(c[ix.player]),teamCode=clean(c[ix.team]).toUpperCase();if(!name||name.toLowerCase()==='player'||!teamCode)continue;
    const games=number(c[ix.g]),minutes=number(c[ix.mp]),ppg=number(c[ix.pts]);if(games===null||ppg===null)continue;
    rows.push({season,name,team:teamCode,teamName:teamLabel(teamCode,season),position:clean(c[ix.pos]),games,minutes,ppg,rpg:number(c[ix.trb]),apg:number(c[ix.ast]),spg:number(c[ix.stl]),bpg:number(c[ix.blk])});
  }
  return rows;
}

const LEADER_HEADINGS=[
  [/^Points Per Game$/i,'ppg'],[/^(?:Total )?Rebounds Per Game$/i,'rpg'],[/^Assists Per Game$/i,'apg'],[/^Steals Per Game$/i,'spg'],[/^Blocks Per Game$/i,'bpg']
];
function parseLeaderMarkdown(raw='',season){
  const out={};let current=null;
  for(const rawLine of String(raw).split(/\r?\n/)){
    const line=clean(rawLine.replace(/^#+\s*/,''));
    const heading=LEADER_HEADINGS.find(([rx])=>rx.test(line));if(heading){current=heading[1];continue;}
    if(!current||out[current])continue;
    const match=line.match(/^1\.\s+(.+?)\s+[•·]\s+([A-Z0-9]+)\s+([0-9]+(?:\.[0-9]+)?)/);
    if(!match)continue;
    out[current]={name:cleanPlayer(match[1]),team:match[2],teamName:teamLabel(match[2],season),value:Number(match[3])};current=null;
  }
  return out;
}

function fallbackLeaders(rows=[],season){
  const maxGames=Math.max(0,...rows.filter(row=>!multiTeamCode(row.team)).map(row=>Number(row.games)||0));const minGames=Math.ceil(maxGames*.70);
  const poolByPlayer=new Map();
  rows.forEach(row=>{
    const key=normalize(row.name);if(!key)return;const current=poolByPlayer.get(key);
    const score=(multiTeamCode(row.team)?1e9:0)+(Number(row.games)||0);
    if(!current||score>current.score)poolByPlayer.set(key,{row,score});
  });
  const pool=[...poolByPlayer.values()].map(x=>x.row).filter(row=>Number(row.games)>=minGames);
  const result={};for(const field of ['ppg','rpg','apg','spg','bpg']){
    const best=[...pool].filter(row=>number(row[field])!==null).sort((a,b)=>Number(b[field])-Number(a[field]))[0];
    if(best)result[field]={name:best.name,team:best.team,teamName:best.teamName,value:Number(best[field])};
  }
  return result;
}
function attachLeaderTeams(leaders={},rows=[],season){
  const byPlayer=new Map();
  rows.filter(row=>!multiTeamCode(row.team)).forEach(row=>{const key=normalize(row.name);if(!byPlayer.has(key))byPlayer.set(key,[]);const list=byPlayer.get(key);if(!list.some(item=>item.code===row.team))list.push({code:row.team,name:teamLabel(row.team,season)});});
  const out={};for(const [field,leader] of Object.entries(leaders||{})){
    if(!leader)continue;const teams=byPlayer.get(normalize(leader.name))||[];
    out[field]={...leader,teams:teams.length?teams:[{code:leader.team,name:teamLabel(leader.team,season)}]};
  }
  return out;
}

async function fetchText(url){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
  try{const response=await fetch(url,{headers:{Accept:'text/plain','User-Agent':'WeKnowTheW season yearbook/2.0'},signal:controller.signal});if(!response.ok)throw new Error(`${url} returned ${response.status}`);return await response.text();}
  finally{clearTimeout(timer);}
}
async function firstAvailable(urls){const errors=[];for(const url of urls){try{return {text:await fetchText(url),reader:url};}catch(error){errors.push(error.message);}}throw new Error(errors.join(' | '));}

module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const season=Number.parseInt(String(req.query.season||''),10);
  if(!Number.isInteger(season)||season<1997||season>2025)return res.status(400).json({error:'Historical yearbook season must be between 1997 and 2025.'});
  res.setHeader('Cache-Control','s-maxage=604800, stale-while-revalidate=2592000');
  const summarySource=`https://www.basketball-reference.com/wnba/years/${season}.html`;
  const playersSource=`https://www.basketball-reference.com/wnba/years/${season}_per_game.html`;
  const leadersSource=`https://www.basketball-reference.com/wnba/years/${season}_leaders.html`;
  try{
    const [summary,playersPage,leadersPage]=await Promise.all([
      firstAvailable([`https://r.jina.ai/https://www.basketball-reference.com/wnba/years/${season}.html`,`https://r.jina.ai/http://www.basketball-reference.com/wnba/years/${season}.html`]),
      firstAvailable([`https://r.jina.ai/https://www.basketball-reference.com/wnba/years/${season}_per_game.html`,`https://r.jina.ai/http://www.basketball-reference.com/wnba/years/${season}_per_game.html`]),
      firstAvailable([`https://r.jina.ai/https://www.basketball-reference.com/wnba/years/${season}_leaders.html`,`https://r.jina.ai/http://www.basketball-reference.com/wnba/years/${season}_leaders.html`]).catch(()=>({text:''}))
    ]);
    const standings=parseStandingsMarkdown(summary.text,season);const validation=validateStandings(standings,season);
    if(!validation.valid)throw new Error(`Historical standings failed season validation: ${validation.errors.join('; ')}`);
    const allRows=parsePerGameMarkdown(playersPage.text,season);if(allRows.length<40)throw new Error(`Historical player table returned only ${allRows.length} rows.`);
    const rosterRows=allRows.filter(row=>!multiTeamCode(row.team));
    let leaders=parseLeaderMarkdown(leadersPage.text||'',season);const fallback=fallbackLeaders(allRows,season);leaders={...fallback,...leaders};leaders=attachLeaderTeams(leaders,allRows,season);
    return res.status(200).json({
      season,validated:true,validation:{expectedTeams:EXPECTED_TEAM_COUNTS[season],expectedGamesPerTeam:EXPECTED_GAMES[season]},
      stats:{season,standings,source:'Basketball-Reference historical standings',sourceUrl:summarySource,updatedAt:new Date().toISOString()},
      players:{season,players:rosterRows,leaders,source:'Basketball-Reference historical player statistics',sourceUrl:playersSource},
      sources:[summarySource,playersSource,leadersSource]
    });
  }catch(error){return res.status(502).json({error:error.message||'Historical season data unavailable',season,validated:false});}
};
module.exports._test={parseStandingsMarkdown,validateStandings,parsePerGameMarkdown,parseLeaderMarkdown,fallbackLeaders,teamLabel,EXPECTED_TEAM_COUNTS,EXPECTED_GAMES};
