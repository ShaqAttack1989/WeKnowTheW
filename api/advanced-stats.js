const { getOfficialPlayerPerGame } = require('../lib/wnba-official-stats');

function decodeEntities(value=''){
  return String(value)
    .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'")
    .replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}

function stripHtml(value=''){
  return decodeEntities(String(value).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
}

function cleanName(value=''){
  return stripHtml(String(value)
    .replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')
    .replace(/[*_`]/g,''))
    .replace(/\*$/,'')
    .trim();
}

function nameKey(value=''){
  return cleanName(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]/g,'');
}

function metric(value=''){
  const text=stripHtml(value).trim();
  return /^[-+]?\d*\.?\d+$/.test(text)?text:'';
}

function numeric(value=''){
  const n=Number(value);
  return value!==''&&Number.isFinite(n)?n:null;
}

function tableCells(raw=''){
  const cells=String(raw).split('|').map(cell=>cell.trim());
  if(cells[0]==='')cells.shift();
  if(cells[cells.length-1]==='')cells.pop();
  return cells;
}

function headerKey(value=''){
  return stripHtml(value).replace(/[*_`]/g,'').trim().toLowerCase().replace(/\s+/g,'');
}

function parseMarkdown(text=''){
  const lines=String(text).split(/\r?\n/);
  const rows=[];
  let indexes=null;

  for(const raw of lines){
    if(!raw.includes('|'))continue;
    const cells=tableCells(raw);
    if(cells.length<3)continue;
    const headers=cells.map(headerKey);

    if(headers.includes('player')&&headers.includes('per')&&(headers.includes('ts%')||headers.includes('ts'))){
      indexes={
        player:headers.indexOf('player'),
        team:headers.indexOf('team'),
        per:headers.indexOf('per'),
        ts:headers.includes('ts%')?headers.indexOf('ts%'):headers.indexOf('ts'),
        g:headers.indexOf('g'),
        mp:headers.indexOf('mp')
      };
      continue;
    }

    if(!indexes)continue;
    if(cells.every(cell=>/^[-: ]+$/.test(cell)))continue;
    const name=cleanName(cells[indexes.player]||'');
    if(!name||name.toLowerCase()==='player')continue;
    const per=metric(cells[indexes.per]||'');
    const tsPct=metric(cells[indexes.ts]||'');
    if(!per&&!tsPct)continue;

    rows.push({
      name,
      team:indexes.team>=0?cleanName(cells[indexes.team]||''):'',
      games:indexes.g>=0?metric(cells[indexes.g]||''):'',
      minutes:indexes.mp>=0?metric(cells[indexes.mp]||''):'',
      per,
      tsPct
    });
  }
  return rows;
}

function cellByStat(row,stat){
  const rx=new RegExp(`<(?:th|td)[^>]*data-stat=["']${stat}["'][^>]*>([\\s\\S]*?)<\\/(?:th|td)>`,'i');
  return row.match(rx)?.[1]||'';
}

function parseHtml(html=''){
  const rows=[];
  for(const match of String(html).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)){
    const row=match[1];
    const name=cleanName(cellByStat(row,'player'));
    if(!name||name.toLowerCase()==='player')continue;
    const per=metric(cellByStat(row,'per'));
    const tsPct=metric(cellByStat(row,'ts_pct'));
    if(!per&&!tsPct)continue;
    rows.push({
      name,
      team:cleanName(cellByStat(row,'team_name_abbr')||cellByStat(row,'team_id')),
      games:metric(cellByStat(row,'g')),
      minutes:metric(cellByStat(row,'mp')),
      per,
      tsPct
    });
  }
  return rows;
}

function chooseBestRows(rows=[]){
  const best=new Map();
  for(const row of rows){
    const key=nameKey(row.name);
    if(!key)continue;
    const team=String(row.team||'').toUpperCase();
    const combined=/^\d+TM$/.test(team)?1:0;
    const score=combined*1e9+(numeric(row.minutes)||0)*1000+(numeric(row.games)||0);
    const current=best.get(key);
    if(!current||score>current.score)best.set(key,{row,score});
  }
  return [...best.values()].map(item=>item.row);
}

function addRanks(players=[]){
  const perRows=players.filter(p=>numeric(p.per)!==null).sort((a,b)=>numeric(b.per)-numeric(a.per));
  const tsRows=players.filter(p=>numeric(p.tsPct)!==null).sort((a,b)=>numeric(b.tsPct)-numeric(a.tsPct));
  const perRank=new Map(perRows.map((p,i)=>[nameKey(p.name),i+1]));
  const tsRank=new Map(tsRows.map((p,i)=>[nameKey(p.name),i+1]));
  return players.map(player=>({
    ...player,
    perRank:perRank.get(nameKey(player.name))||null,
    perPool:perRows.length,
    tsRank:tsRank.get(nameKey(player.name))||null,
    tsPool:tsRows.length
  }));
}

async function fetchText(url,headers={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),10000);
  try{
    const response=await fetch(url,{headers,signal:controller.signal});
    if(!response.ok)throw new Error(`Advanced stats source returned ${response.status}`);
    return await response.text();
  }finally{clearTimeout(timer);}
}

module.exports=async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return res.status(405).json({error:'Method not allowed'});
  }

  const requested=Number.parseInt(String(req.query.season||'2026'),10);
  const season=Number.isFinite(requested)&&requested>=1997&&requested<=2100?requested:2026;
  const sourceUrl=`https://www.basketball-reference.com/wnba/years/${season}_advanced.html`;
  const readerUrls=[
    `https://r.jina.ai/http://www.basketball-reference.com/wnba/years/${season}_advanced.html`,
    `https://r.jina.ai/https://www.basketball-reference.com/wnba/years/${season}_advanced.html`
  ];
  res.setHeader('Cache-Control','s-maxage=1800, stale-while-revalidate=21600');

  let rows=[];
  let resolvedBy='';
  const errors=[];
  const officialPromise=getOfficialPlayerPerGame(season).catch(error=>{errors.push(`Official WNBA statistics: ${error.message}`);return [];});

  const readerResults=await Promise.allSettled(readerUrls.map(url=>fetchText(url,{Accept:'text/plain','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0)'})));
  readerResults.forEach((result,index)=>{
    if(result.status==='fulfilled'){
      const parsed=parseMarkdown(result.value);
      if(parsed.length>rows.length){rows=parsed;resolvedBy=`Basketball-Reference via text reader ${index+1}`;}
      if(parsed.length<10)errors.push(`Reader ${index+1} returned only ${parsed.length} advanced rows`);
    }else errors.push(`Reader ${index+1}: ${result.reason?.message||'unavailable'}`);
  });

  if(rows.length<10){
    try{
      const html=await fetchText(sourceUrl,{
        Accept:'text/html,application/xhtml+xml',
        'User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0; +https://www.weknowthew.com)'
      });
      const parsed=parseHtml(html);
      if(parsed.length>rows.length){rows=parsed;resolvedBy='Basketball-Reference direct';}
      if(parsed.length<10)errors.push(`Direct source returned only ${parsed.length} advanced rows`);
    }catch(error){errors.push(`Direct source: ${error.message}`);}
  }

  if(rows.length<10){
    res.setHeader('Cache-Control','no-store, max-age=0');
    return res.status(502).json({
      error:'Advanced player metrics are temporarily unavailable.',
      detail:errors.join(' | '),
      season,
      source:sourceUrl
    });
  }

  const official=await officialPromise;
  const officialMap=new Map(official.map(row=>[nameKey(row.name),row]));
  const players=addRanks(chooseBestRows(rows).map(row=>{
    const live=officialMap.get(nameKey(row.name));
    return live?{...row,team:live.team||row.team,games:String(live.games),minutes:String(live.minutes)}:row;
  })).sort((a,b)=>a.name.localeCompare(b.name));
  return res.status(200).json({
    source:official.length>=10?'Basketball-Reference advanced metrics + Official WNBA participation':'Basketball-Reference',
    sourceUrl,
    resolvedBy:resolvedBy||'Basketball-Reference',
    season,
    updatedAt:new Date().toISOString(),
    refreshSeconds:1800,
    playerCount:players.length,
    players,
    diagnostics:{readerAttempts:readerUrls.length,errors}
  });
};
