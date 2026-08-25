const { getOfficialStandings } = require('../lib/wnba-official-stats');

function decodeEntities(value=''){
  return String(value)
    .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'")
    .replace(/&nbsp;|\u00a0/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}
function stripHtml(value=''){
  return decodeEntities(String(value).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
}
function cleanName(value=''){
  return stripHtml(String(value)
    .replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')
    .replace(/[*_`]/g,''))
    .replace(/\*$/,'').trim();
}
function key(value=''){
  return cleanName(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]/g,'');
}
function number(value){
  const text=stripHtml(value).replace(/%/g,'').replace(/^\+/,'').trim();
  if(!text||text==='—'||text==='-')return null;
  const n=Number(text);
  return Number.isFinite(n)?n:null;
}
function tableCells(raw=''){
  const cells=String(raw).split('|').map(cell=>cell.trim());
  if(cells[0]==='')cells.shift();
  if(cells[cells.length-1]==='')cells.pop();
  return cells;
}
function header(value=''){
  return stripHtml(value).replace(/[*_`]/g,'').trim().toLowerCase().replace(/\s+/g,'');
}
function occurrences(headers,name){
  const out=[];headers.forEach((value,index)=>{if(value===name)out.push(index);});return out;
}
function readMarkdownTable(lines,start,predicate){
  for(let i=start;i<lines.length;i++){
    if(!lines[i].includes('|'))continue;
    const cells=tableCells(lines[i]);
    const headers=cells.map(header);
    if(!predicate(headers))continue;
    const rows=[];
    for(let j=i+1;j<lines.length;j++){
      const raw=lines[j];
      if(!raw.includes('|')){
        if(rows.length)break;
        continue;
      }
      const values=tableCells(raw);
      if(values.every(cell=>/^[-: ]+$/.test(cell)))continue;
      const lowered=values.map(header);
      if(lowered.join('|')===headers.join('|'))continue;
      if(values.length<Math.max(3,headers.length-3)){
        if(rows.length)break;
        continue;
      }
      rows.push(values);
    }
    return {headers,rows,next:i+rows.length+1};
  }
  return null;
}
function parseMarkdown(text=''){
  const lines=String(text).split(/\r?\n/);
  const advanced=readMarkdownTable(lines,0,h=>h.includes('team')&&h.includes('ortg')&&h.includes('drtg')&&h.includes('nrtg')&&h.includes('pace'));
  const perGame=readMarkdownTable(lines,0,h=>h.includes('team')&&h.includes('pts')&&h.includes('3p%')&&h.includes('ast')&&h.includes('stl')&&h.includes('blk')&&h.includes('tov'));
  const standings=[];
  let cursor=0;
  while(cursor<lines.length){
    const table=readMarkdownTable(lines,cursor,h=>h.includes('team')&&h.includes('w')&&h.includes('l')&&h.includes('ps/g')&&h.includes('pa/g'));
    if(!table)break;
    standings.push(table);cursor=table.next+1;
  }
  if(!advanced)return [];

  const ai=name=>advanced.headers.indexOf(name);
  const efg=occurrences(advanced.headers,'efg%');
  const tov=occurrences(advanced.headers,'tov%');
  const ftfga=occurrences(advanced.headers,'ft/fga');
  const teamIndex=ai('team');
  const map=new Map();
  for(const cells of advanced.rows){
    const name=cleanName(cells[teamIndex]||'');
    if(!name||name.toLowerCase()==='team')continue;
    const item={
      name,
      wins:number(cells[ai('w')]),losses:number(cells[ai('l')]),
      expectedWins:number(cells[ai('pw')]),expectedLosses:number(cells[ai('pl')]),
      mov:number(cells[ai('mov')]),sos:number(cells[ai('sos')]),srs:number(cells[ai('srs')]),
      offRtg:number(cells[ai('ortg')]),defRtg:number(cells[ai('drtg')]),netRtg:number(cells[ai('nrtg')]),pace:number(cells[ai('pace')]),
      ftr:number(cells[ai('ftr')]),threePar:number(cells[ai('3par')]),tsPct:number(cells[ai('ts%')]),
      offEfgPct:efg[0]!==undefined?number(cells[efg[0]]):null,
      offTovPct:tov[0]!==undefined?number(cells[tov[0]]):null,
      orbPct:number(cells[ai('orb%')]),
      offFtFga:ftfga[0]!==undefined?number(cells[ftfga[0]]):null,
      defEfgPct:efg[1]!==undefined?number(cells[efg[1]]):null,
      defTovPct:tov[1]!==undefined?number(cells[tov[1]]):null,
      drbPct:number(cells[ai('drb%')]),
      defFtFga:ftfga[1]!==undefined?number(cells[ftfga[1]]):null
    };
    const played=(item.wins||0)+(item.losses||0);
    item.winPct=played?Number(item.wins||0)/played:null;
    map.set(key(name),item);
  }

  if(perGame){
    const pi=name=>perGame.headers.indexOf(name);
    const teamPi=pi('team');
    for(const cells of perGame.rows){
      const name=cleanName(cells[teamPi]||'');const item=map.get(key(name));if(!item)continue;
      Object.assign(item,{
        games:number(cells[pi('g')]),fgPct:number(cells[pi('fg%')]),threePct:number(cells[pi('3p%')]),
        orb:number(cells[pi('orb')]),drb:number(cells[pi('drb')]),reb:number(cells[pi('trb')]),
        ast:number(cells[pi('ast')]),stl:number(cells[pi('stl')]),blk:number(cells[pi('blk')]),
        tov:number(cells[pi('tov')]),ppg:number(cells[pi('pts')])
      });
    }
  }

  for(const table of standings){
    const si=name=>table.headers.indexOf(name);const teamSi=si('team');
    for(const cells of table.rows){
      const name=cleanName(cells[teamSi]||'');const item=map.get(key(name));if(!item)continue;
      item.psg=number(cells[si('ps/g')]);item.oppPpg=number(cells[si('pa/g')]);
    }
  }
  return [...map.values()];
}
function cell(row,stats=[]){
  for(const stat of stats){
    const rx=new RegExp(`<(?:th|td)[^>]*data-stat=["']${stat}["'][^>]*>([\\s\\S]*?)<\\/(?:th|td)>`,'i');
    const hit=row.match(rx);if(hit)return hit[1];
  }
  return '';
}
function parseHtml(html=''){
  const rows=[];
  for(const match of String(html).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)){
    const row=match[1];
    const name=cleanName(cell(row,['team','team_name']));
    const offRtg=number(cell(row,['off_rtg']));
    const defRtg=number(cell(row,['def_rtg']));
    const pace=number(cell(row,['pace']));
    if(!name||offRtg===null||defRtg===null||pace===null)continue;
    rows.push({
      name,
      wins:number(cell(row,['wins'])),losses:number(cell(row,['losses'])),
      expectedWins:number(cell(row,['wins_pyth','wins_pythag'])),expectedLosses:number(cell(row,['losses_pyth','losses_pythag'])),
      mov:number(cell(row,['mov'])),sos:number(cell(row,['sos'])),srs:number(cell(row,['srs'])),
      offRtg,defRtg,netRtg:number(cell(row,['net_rtg'])),pace,
      ftr:number(cell(row,['fta_per_fga_pct','ftr'])),threePar:number(cell(row,['fg3a_per_fga_pct','3par'])),tsPct:number(cell(row,['ts_pct'])),
      offEfgPct:number(cell(row,['efg_pct'])),offTovPct:number(cell(row,['tov_pct'])),orbPct:number(cell(row,['orb_pct'])),offFtFga:number(cell(row,['ft_rate','ft_per_fga_pct'])),
      defEfgPct:number(cell(row,['opp_efg_pct','efg_pct_opp'])),defTovPct:number(cell(row,['opp_tov_pct','tov_pct_opp'])),drbPct:number(cell(row,['drb_pct'])),defFtFga:number(cell(row,['opp_ft_rate','opp_ft_per_fga_pct'])),
      games:number(cell(row,['g'])),fgPct:number(cell(row,['fg_pct'])),threePct:number(cell(row,['fg3_pct'])),ast:number(cell(row,['ast'])),stl:number(cell(row,['stl'])),blk:number(cell(row,['blk'])),tov:number(cell(row,['tov'])),ppg:number(cell(row,['pts_per_g','pts'])),oppPpg:number(cell(row,['opp_pts_per_g']))
    });
  }
  const best=new Map();for(const row of rows){const k=key(row.name);const old=best.get(k);if(!old||Object.values(row).filter(v=>v!==null&&v!=='').length>Object.values(old).filter(v=>v!==null&&v!=='').length)best.set(k,row);}return [...best.values()];
}
function rank(players,field,direction='desc',rankName){
  const valid=players.filter(item=>Number.isFinite(Number(item[field]))).sort((a,b)=>direction==='asc'?Number(a[field])-Number(b[field]):Number(b[field])-Number(a[field]));
  valid.forEach((item,index)=>{item[rankName||`${field}Rank`]=index+1;item[`${rankName||`${field}Rank`}Pool`]=valid.length;});
}
function addRanks(players=[]){
  const specs=[
    ['offRtg','desc'],['defRtg','asc'],['netRtg','desc'],['pace','desc'],['ppg','desc'],['offEfgPct','desc'],['tsPct','desc'],['threePct','desc'],['ast','desc'],['offTovPct','asc'],['orbPct','desc'],['ftr','desc'],['oppPpg','asc'],['defEfgPct','asc'],['defTovPct','desc'],['drbPct','desc'],['stl','desc'],['blk','desc'],['mov','desc'],['srs','desc'],['sos','desc'],['winPct','desc']
  ];
  specs.forEach(([field,direction])=>rank(players,field,direction));
  const percentile=(item,field)=>{
    const r=Number(item[`${field}Rank`]),pool=Number(item[`${field}RankPool`]);
    if(!Number.isFinite(r)||!Number.isFinite(pool)||pool<2)return 50;
    return 100*(pool-r)/(pool-1);
  };
  players.forEach(item=>{
    const score=.35*percentile(item,'netRtg')+.20*percentile(item,'offRtg')+.20*percentile(item,'defRtg')+.15*percentile(item,'srs')+.10*percentile(item,'winPct');
    item.overallRating=Math.round(score);
  });
  rank(players,'overallRating','desc','overallRank');
  return players;
}
async function fetchText(url,headers={}){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),11000);
  try{
    const response=await fetch(url,{headers,signal:controller.signal});
    if(!response.ok)throw new Error(`Team DNA source returned ${response.status}`);
    return await response.text();
  }finally{clearTimeout(timer);}
}
module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const requested=Number.parseInt(String(req.query.season||'2026'),10);
  const season=Number.isFinite(requested)&&requested>=1997&&requested<=2100?requested:2026;
  const sourceUrl=`https://www.basketball-reference.com/wnba/years/${season}.html`;
  const readers=[`https://r.jina.ai/http://www.basketball-reference.com/wnba/years/${season}.html`,`https://r.jina.ai/https://www.basketball-reference.com/wnba/years/${season}.html`];
  const errors=[];let teams=[];let resolvedBy='';
  const officialStandingsPromise=getOfficialStandings(season).catch(error=>{errors.push(`Official WNBA standings: ${error.message}`);return [];});
  const results=await Promise.allSettled(readers.map(url=>fetchText(url,{Accept:'text/plain','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0)'})));
  results.forEach((result,index)=>{
    if(result.status==='fulfilled'){
      const parsed=parseMarkdown(result.value);if(parsed.length>teams.length){teams=parsed;resolvedBy=`Basketball-Reference via text reader ${index+1}`;}
      if(parsed.length<12)errors.push(`Reader ${index+1} returned ${parsed.length} team rows`);
    }else errors.push(`Reader ${index+1}: ${result.reason?.message||'unavailable'}`);
  });
  if(teams.length<12){
    try{
      const html=await fetchText(sourceUrl,{Accept:'text/html,application/xhtml+xml','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0; +https://www.weknowthew.com)'});
      const parsed=parseHtml(html);if(parsed.length>teams.length){teams=parsed;resolvedBy='Basketball-Reference direct';}
      if(parsed.length<12)errors.push(`Direct source returned ${parsed.length} team rows`);
    }catch(error){errors.push(`Direct source: ${error.message}`);}
  }
  if(teams.length<12){res.setHeader('Cache-Control','no-store, max-age=0');return res.status(502).json({error:'Team DNA metrics are temporarily unavailable.',detail:errors.join(' | '),season,source:sourceUrl});}
  const officialStandings=await officialStandingsPromise;
  const recordMap=new Map(officialStandings.map(record=>[key(record.team?.full_name),record]));
  teams=teams.filter(team=>key(team.name)!=='leagueaverage').map(team=>{
    const live=recordMap.get(key(team.name));
    return live?{...team,wins:live.wins,losses:live.losses,games:live.games_played,winPct:live.win_percentage}:team;
  });
  teams=addRanks(teams).sort((a,b)=>Number(a.overallRank||99)-Number(b.overallRank||99)||a.name.localeCompare(b.name));
  res.setHeader('Cache-Control','s-maxage=1800, stale-while-revalidate=21600');
  return res.status(200).json({source:officialStandings.length>=12?'Official WNBA records + Basketball-Reference team metrics':'Basketball-Reference',sourceUrl,resolvedBy:resolvedBy||'Basketball-Reference',season,updatedAt:new Date().toISOString(),refreshSeconds:1800,teamCount:teams.length,teams,diagnostics:{readerAttempts:readers.length,errors}});
};
