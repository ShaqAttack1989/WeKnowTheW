const { getOfficialPlayerPerGame } = require('../lib/wnba-official-stats');

function text(value=''){
  return String(value??'')
    .replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')
    .replace(/<\/?(?:strong|b|span|a)\b[^>]*>?/gi,' ')
    .replace(/<[^>]+>/g,' ')
    .replace(/&amp;/g,'&').replace(/&#39;|&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g,' ')
    .replace(/\*\*/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}
function key(value=''){return text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function num(value){const n=Number(String(value??'').replace('%','').trim());return Number.isFinite(n)?n:null;}
function safe(n,fallback=0){return Number.isFinite(n)?n:fallback;}
function pct(value){const n=num(value);return n===null?null:(n>1?n/100:n);}
function cells(raw=''){const out=String(raw).split('|').map(v=>v.trim());if(out[0]==='')out.shift();if(out[out.length-1]==='')out.pop();return out;}
function hkey(value=''){return text(value).replace(/[*_`]/g,'').toLowerCase().replace(/\s+/g,'');}
function allIndexes(list,value){const out=[];list.forEach((item,i)=>{if(item===value)out.push(i);});return out;}
function lastIndex(list,value){const hits=allIndexes(list,value);return hits.length?hits[hits.length-1]:-1;}
function cellByStat(row,stat){const rx=new RegExp(`<(?:th|td)[^>]*data-stat=["']${stat}["'][^>]*>([\\s\\S]*?)<\\/(?:th|td)>`,'i');return row.match(rx)?.[1]||'';}

function parsePerGameMarkdown(raw=''){
  const rows=[];let ix=null;
  for(const line of String(raw).split(/\r?\n/)){
    if(!line.includes('|'))continue;
    const c=cells(line);if(c.length<10)continue;
    const h=c.map(hkey);
    if(h.includes('player')&&h.includes('pts')&&h.includes('ast')&&h.includes('trb')){
      ix={player:h.indexOf('player'),team:h.indexOf('team'),pos:h.indexOf('pos'),g:lastIndex(h,'g'),mp:lastIndex(h,'mp'),
        trb:h.indexOf('trb'),ast:h.indexOf('ast'),stl:h.indexOf('stl'),blk:h.indexOf('blk'),tov:h.indexOf('tov'),pts:h.indexOf('pts')};
      continue;
    }
    if(!ix||c.every(v=>/^[-: ]+$/.test(v)))continue;
    const name=text(c[ix.player]);if(!name||name.toLowerCase()==='player')continue;
    rows.push({name,team:text(c[ix.team]),position:text(c[ix.pos]),g:num(c[ix.g]),mpg:num(c[ix.mp]),trb:num(c[ix.trb]),ast:num(c[ix.ast]),stl:num(c[ix.stl]),blk:num(c[ix.blk]),tov:num(c[ix.tov]),pts:num(c[ix.pts])});
  }
  return rows;
}
function parsePerGameHtml(raw=''){
  const rows=[];
  for(const m of String(raw).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)){
    const r=m[1],name=text(cellByStat(r,'player'));if(!name||name.toLowerCase()==='player')continue;
    const item={name,team:text(cellByStat(r,'team_name_abbr')||cellByStat(r,'team_id')),position:text(cellByStat(r,'pos')),
      g:num(text(cellByStat(r,'g'))),mpg:num(text(cellByStat(r,'mp_per_g'))),trb:num(text(cellByStat(r,'trb_per_g'))),ast:num(text(cellByStat(r,'ast_per_g'))),
      stl:num(text(cellByStat(r,'stl_per_g'))),blk:num(text(cellByStat(r,'blk_per_g'))),tov:num(text(cellByStat(r,'tov_per_g'))),pts:num(text(cellByStat(r,'pts_per_g')))};
    if(item.g!==null&&item.mpg!==null)rows.push(item);
  }
  return rows;
}
function parseAdvancedMarkdown(raw=''){
  const rows=[];let ix=null;
  for(const line of String(raw).split(/\r?\n/)){
    if(!line.includes('|'))continue;
    const c=cells(line);if(c.length<8)continue;
    const h=c.map(hkey);
    if(h.includes('player')&&h.includes('per')&&(h.includes('ts%')||h.includes('ts'))){
      ix={player:h.indexOf('player'),team:h.indexOf('team'),per:h.indexOf('per'),ts:h.includes('ts%')?h.indexOf('ts%'):h.indexOf('ts'),ws40:h.indexOf('ws/40')};
      continue;
    }
    if(!ix||c.every(v=>/^[-: ]+$/.test(v)))continue;
    const name=text(c[ix.player]);if(!name||name.toLowerCase()==='player')continue;
    rows.push({name,team:text(c[ix.team]),per:num(c[ix.per]),tsPct:pct(c[ix.ts]),ws40:num(c[ix.ws40])});
  }
  return rows;
}
function parseAdvancedHtml(raw=''){
  const rows=[];
  for(const m of String(raw).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)){
    const r=m[1],name=text(cellByStat(r,'player'));if(!name||name.toLowerCase()==='player')continue;
    const item={name,team:text(cellByStat(r,'team_name_abbr')||cellByStat(r,'team_id')),per:num(text(cellByStat(r,'per'))),tsPct:pct(text(cellByStat(r,'ts_pct'))),ws40:num(text(cellByStat(r,'ws_per_40')))};
    if(item.per!==null||item.tsPct!==null)rows.push(item);
  }
  return rows;
}
async function fetchText(url,headers={}){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
  try{const r=await fetch(url,{headers,signal:controller.signal});if(!r.ok)throw new Error(`${url} returned ${r.status}`);return await r.text();}
  finally{clearTimeout(timer);}
}
async function sourceRows(season,suffix,markdownParser,htmlParser){
  const source=`https://www.basketball-reference.com/wnba/years/${season}_${suffix}.html`;
  const readers=[`https://r.jina.ai/http://www.basketball-reference.com/wnba/years/${season}_${suffix}.html`,`https://r.jina.ai/https://www.basketball-reference.com/wnba/years/${season}_${suffix}.html`];
  const errors=[];let rows=[];
  for(const reader of readers){
    try{const parsed=markdownParser(await fetchText(reader,{Accept:'text/plain'}));if(parsed.length>rows.length)rows=parsed;if(rows.length>=20)break;}catch(e){errors.push(e.message);}
  }
  if(rows.length<20){
    try{const parsed=htmlParser(await fetchText(source,{Accept:'text/html','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0)'}));if(parsed.length>rows.length)rows=parsed;}catch(e){errors.push(e.message);}
  }
  if(rows.length<20)throw new Error(`${suffix} stats unavailable: ${errors.join(' | ')}`);
  return {rows,source};
}
function chooseBest(rows=[]){
  const best=new Map();
  for(const row of rows){
    const k=key(row.name);if(!k)continue;
    const combined=/^\d+TM$/i.test(String(row.team||''));
    const score=(combined?1e9:0)+safe(row.g)*1e5+safe(row.mpg)*100;
    const cur=best.get(k);if(!cur||score>cur.score)best.set(k,{row,score});
  }
  return [...best.values()].map(x=>x.row);
}
function percentile(value,values,higher=true){
  if(!Number.isFinite(value))return null;
  const clean=values.filter(Number.isFinite).sort((a,b)=>a-b);if(!clean.length)return null;
  let count=0;for(const x of clean){if(x<=value)count++;}
  const p=count/clean.length;return higher?p:1-p+1/clean.length;
}
function letter(score){
  if(!Number.isFinite(score))return 'NR';
  if(score>=95)return 'A+';if(score>=90)return 'A';if(score>=87)return 'A-';
  if(score>=84)return 'B+';if(score>=80)return 'B';if(score>=77)return 'B-';
  if(score>=74)return 'C+';if(score>=70)return 'C';if(score>=67)return 'C-';
  if(score>=64)return 'D+';if(score>=60)return 'D';return 'F';
}
function metricPools(players){
  const defs=[
    ['per',p=>p.per,true,.24],['ts',p=>p.tsPct,true,.14],['pts',p=>p.pts,true,.18],['ast',p=>p.ast,true,.10],
    ['trb',p=>p.trb,true,.10],['stocks',p=>safe(p.stl)+safe(p.blk),true,.08],['ws40',p=>p.ws40,true,.10],
    ['astTo',p=>p.ast===null?null:safe(p.ast)/Math.max(safe(p.tov),.5),true,.06]
  ];
  const pools={};defs.forEach(([id,get])=>pools[id]=players.map(get).filter(Number.isFinite));
  return {defs,pools};
}
function gradePlayer(player,defs,pools){
  let weighted=0,total=0;
  for(const [id,get,higher,weight] of defs){
    const value=get(player);const p=percentile(value,pools[id],higher);if(p===null)continue;
    weighted+=p*weight;total+=weight;
  }
  if(!total)return {score:null,letter:'NR'};
  const normalized=weighted/total;
  const score=Math.max(55,Math.min(99,Math.round(55+normalized*44)));
  return {score,letter:letter(score)};
}
module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const requested=Number.parseInt(String(req.query.season||'2026'),10);const season=Number.isFinite(requested)?requested:2026;
  res.setHeader('Cache-Control','s-maxage=1800, stale-while-revalidate=21600');
  try{
    const [pg,adv,official]=await Promise.all([
      sourceRows(season,'per_game',parsePerGameMarkdown,parsePerGameHtml),
      sourceRows(season,'advanced',parseAdvancedMarkdown,parseAdvancedHtml),
      getOfficialPlayerPerGame(season).catch(()=>[])
    ]);
    let perGame=chooseBest(pg.rows);
    if(official.length>=10){
      const officialMap=new Map(official.map(row=>[key(row.name),row]));
      perGame=perGame.map(row=>{
        const live=officialMap.get(key(row.name));
        return live?{...row,team:live.team||row.team,position:live.position||row.position,g:live.games,mpg:live.minutes,trb:live.trb,ast:live.ast,stl:live.stl,blk:live.blk,tov:live.tov,pts:live.pts}:row;
      });
    }
    const advanced=chooseBest(adv.rows),advMap=new Map(advanced.map(row=>[key(row.name),row]));
    const merged=perGame.map(row=>({...row,...(advMap.get(key(row.name))||{})}));
    const maxGames=Math.max(...merged.map(p=>safe(p.g)),1);const minGames=Math.max(5,Math.min(12,Math.ceil(maxGames*.25)));
    const qualified=merged.filter(p=>safe(p.g)>=minGames&&safe(p.mpg)>=8&&(Number.isFinite(p.per)||Number.isFinite(p.pts)));
    const {defs,pools}=metricPools(qualified.length?qualified:merged);
    const players=merged.map(player=>{
      const grade=gradePlayer(player,defs,pools);
      return {name:player.name,team:player.team,position:player.position,games:player.g,minutes:player.mpg,per:player.per,tsPct:player.tsPct,
        score:grade.score,letter:grade.letter,provisional:safe(player.g)<minGames||safe(player.mpg)<8};
    }).sort((a,b)=>(b.score||0)-(a.score||0)||a.name.localeCompare(b.name));
    return res.status(200).json({season,updatedAt:new Date().toISOString(),source:official.length>=10?'Official WNBA statistics + Basketball-Reference advanced metrics':'Basketball-Reference',sourceUrls:['https://stats.wnba.com/players/traditional/',pg.source,adv.source],minGames,
      methodology:'2K-style league grade: weighted league-relative percentiles for PER, true shooting, scoring, assists, rebounding, steals+blocks, win shares per 40 and assist-to-turnover ratio. Score is scaled 55–99; low-sample grades are marked provisional.',players});
  }catch(error){return res.status(502).json({error:error.message||'Player grades unavailable'});}
};
