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

function metric(value=''){
  const text=stripHtml(value).trim();
  return /^[-+]?\d*\.?\d+$/.test(text)?text:'';
}

function parseHtml(html=''){
  const rows=[];
  for(const match of String(html).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)){
    const row=match[1];
    const player=row.match(/<(?:th|td)[^>]*data-stat=["']player["'][^>]*>([\s\S]*?)<\/(?:th|td)>/i);
    if(!player)continue;
    const per=row.match(/<td[^>]*data-stat=["']per["'][^>]*>([\s\S]*?)<\/td>/i);
    const ts=row.match(/<td[^>]*data-stat=["']ts_pct["'][^>]*>([\s\S]*?)<\/td>/i);
    const team=row.match(/<td[^>]*data-stat=["']team_name_abbr["'][^>]*>([\s\S]*?)<\/td>/i)
      ||row.match(/<td[^>]*data-stat=["']team_id["'][^>]*>([\s\S]*?)<\/td>/i);
    const name=cleanName(player[1]);
    if(name&&name.toLowerCase()!=='player')rows.push({name,team:stripHtml(team?.[1]||''),per:metric(per?.[1]||''),tsPct:metric(ts?.[1]||'')});
  }
  return rows;
}

function parseMarkdown(text=''){
  const rows=[];
  for(const raw of String(text).split(/\r?\n/)){
    if(!raw.includes('|'))continue;
    const cells=raw.split('|').map(cell=>cell.trim()).filter((cell,index,array)=>!(index===0&&cell==='')&&!(index===array.length-1&&cell===''));
    if(cells.length<9)continue;
    const name=cleanName(cells[0]);
    if(!name||name.toLowerCase()==='player'||/^[-: ]+$/.test(name))continue;
    const per=metric(cells[7]);
    const tsPct=metric(cells[8]);
    if(!per&&!tsPct)continue;
    rows.push({name,team:cleanName(cells[1]),per,tsPct});
  }
  return rows;
}

async function fetchText(url,headers={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8500);
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
  res.setHeader('Cache-Control','s-maxage=21600, stale-while-revalidate=86400');

  let rows=[];
  let resolvedBy='Basketball-Reference';
  let directError='';

  try{
    const html=await fetchText(sourceUrl,{
      Accept:'text/html,application/xhtml+xml',
      'User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0; +https://we-know-the-w.vercel.app)'
    });
    rows=parseHtml(html);
  }catch(error){directError=error.message;}

  if(!rows.length){
    try{
      const mirror=`https://r.jina.ai/http://www.basketball-reference.com/wnba/years/${season}_advanced.html`;
      const text=await fetchText(mirror,{Accept:'text/plain'});
      rows=parseMarkdown(text);
      resolvedBy='Basketball-Reference via text reader';
    }catch(error){
      return res.status(502).json({error:'Advanced player metrics are temporarily unavailable.',detail:directError||error.message,season,source:sourceUrl});
    }
  }

  const players=[...new Map(rows.map(row=>[row.name.toLowerCase(),row])).values()]
    .sort((a,b)=>a.name.localeCompare(b.name));

  return res.status(200).json({
    source:'Basketball-Reference',
    sourceUrl,
    resolvedBy,
    season,
    updatedAt:new Date().toISOString(),
    playerCount:players.length,
    players
  });
};