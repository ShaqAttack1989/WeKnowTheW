const { getOfficialLeagueLeaders } = require('../lib/wnba-official-stats');

function decode(value=''){
  return String(value).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'").replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}

function clean(value=''){
  return decode(String(value).replace(/<[^>]+>/g,' ').replace(/<\/[a-z0-9]+$/i,' ').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/[*_`]/g,'').replace(/\s+/g,' ').trim()).replace(/\*$/,'').trim();
}

function key(value=''){
  return clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
}

function number(value=''){
  const text=clean(value);
  const parsed=Number(text);
  return text!==''&&Number.isFinite(parsed)?parsed:null;
}

function cells(line=''){
  const parts=String(line).split('|').map(item=>item.trim());
  if(parts[0]==='')parts.shift();
  if(parts[parts.length-1]==='')parts.pop();
  return parts;
}

function header(value=''){
  return clean(value).toLowerCase().replace(/[^a-z0-9%]/g,'');
}

function parseMarkdown(text=''){
  const rows=[];
  let indexes=null;
  for(const line of String(text).split(/\r?\n/)){
    if(!line.includes('|'))continue;
    const row=cells(line);
    if(row.length<8)continue;
    const headers=row.map(header);
    if(headers.includes('player')&&headers.includes('pts')&&headers.includes('ast')){
      indexes={};
      ['player','team','g','mp','pts','trb','ast','stl','blk','tov','3p'].forEach(name=>{
        const aliases=name==='team'?['team','tm']:name==='3p'?['3p','fg3']:name==='trb'?['trb','reb']:[name];
        indexes[name]=aliases.map(alias=>headers.indexOf(alias)).find(index=>index>=0)??-1;
      });
      continue;
    }
    if(!indexes||row.every(item=>/^[-: ]+$/.test(item)))continue;
    const name=clean(row[indexes.player]||'');
    if(!name||name.toLowerCase()==='player')continue;
    const item={name,team:indexes.team>=0?clean(row[indexes.team]||''):'',games:indexes.g>=0?number(row[indexes.g]):null};
    for(const stat of ['pts','trb','ast','stl','blk','tov','3p'])item[stat]=indexes[stat]>=0?number(row[indexes[stat]]):null;
    if(item.pts!==null)rows.push(item);
  }
  return rows;
}

function statCell(row,stat){
  const match=String(row).match(new RegExp(`<(?:th|td)[^>]*data-stat=["']${stat}["'][^>]*>([\\s\\S]*?)<\\/(?:th|td)>`,'i'));
  return match?.[1]||'';
}

function parseHtml(html=''){
  const rows=[];
  for(const match of String(html).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)){
    const row=match[1];
    const name=clean(statCell(row,'player'));
    if(!name||name.toLowerCase()==='player')continue;
    const item={
      name,
      team:clean(statCell(row,'team')||statCell(row,'team_name_abbr')||statCell(row,'team_id')),
      games:number(statCell(row,'g')),
      pts:number(statCell(row,'pts_per_g')),
      trb:number(statCell(row,'trb_per_g')),
      ast:number(statCell(row,'ast_per_g')),
      stl:number(statCell(row,'stl_per_g')),
      blk:number(statCell(row,'blk_per_g')),
      tov:number(statCell(row,'tov_per_g')),
      '3p':number(statCell(row,'fg3_per_g'))
    };
    if(item.pts!==null)rows.push(item);
  }
  return rows;
}

function bestRows(rows=[]){
  const best=new Map();
  for(const row of rows){
    const id=key(row.name);
    if(!id)continue;
    const combined=/^(?:TOT|\d+TM)$/i.test(row.team||'');
    const score=(combined?100000:0)+(row.games||0);
    if(!best.has(id)||score>best.get(id).score)best.set(id,{row,score});
  }
  return [...best.values()].map(item=>item.row);
}

function leaders(rows,stat){
  return rows.filter(row=>Number.isFinite(row[stat])).sort((a,b)=>b[stat]-a[stat]||String(a.name).localeCompare(String(b.name))).slice(0,5).map((row,index)=>({rank:index+1,name:row.name,team:row.team,value:row[stat]}));
}

async function fetchText(url,headers={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),12000);
  try{
    const response=await fetch(url,{headers,signal:controller.signal});
    if(!response.ok)throw new Error(`Player statistics source returned ${response.status}`);
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
  const sourceUrl=`https://www.basketball-reference.com/wnba/years/${season}_per_game.html`;
  const readerUrls=[`https://r.jina.ai/http://www.basketball-reference.com/wnba/years/${season}_per_game.html`,`https://r.jina.ai/https://www.basketball-reference.com/wnba/years/${season}_per_game.html`];
  const errors=[];
  let rows=[];
  let resolvedBy='';
  res.setHeader('Cache-Control','s-maxage=1800, stale-while-revalidate=21600');
  try{
    const official=await getOfficialLeagueLeaders(season,'PerGame',5);
    const categories=official.categories||{};
    if(Object.keys(categories).length===7){
      return res.status(200).json({
        season,
        source:'Official WNBA statistics',
        sourceUrl:'https://stats.wnba.com/players/traditional/',
        resolvedBy:'Official WNBA qualified league leaders',
        updatedAt:new Date().toISOString(),
        refreshSeconds:1800,
        categories,
        diagnostics:{errors:official.errors||[]}
      });
    }
    errors.push(...(official.errors||[]));
  }catch(error){errors.push(`Official WNBA statistics: ${error.message}`);}
  const attempts=await Promise.allSettled(readerUrls.map(url=>fetchText(url,{Accept:'text/plain','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0)'})));
  attempts.forEach((result,index)=>{
    if(result.status==='fulfilled'){
      const parsed=parseMarkdown(result.value);
      if(parsed.length>rows.length){rows=parsed;resolvedBy=`Basketball Reference text reader ${index+1}`;}
      if(parsed.length<10)errors.push(`Reader ${index+1} returned ${parsed.length} rows`);
    }else errors.push(`Reader ${index+1}: ${result.reason?.message||'unavailable'}`);
  });
  if(rows.length<10){
    try{
      const html=await fetchText(sourceUrl,{Accept:'text/html','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0; +https://www.weknowthew.com)'});
      const parsed=parseHtml(html);
      if(parsed.length>rows.length){rows=parsed;resolvedBy='Basketball Reference direct';}
    }catch(error){errors.push(`Direct source: ${error.message}`);}
  }
  rows=bestRows(rows);
  if(rows.length<10)return res.status(502).json({error:'Player leaderboards are temporarily unavailable.',detail:errors.join(' | '),season,sourceUrl});
  const categories={
    pts:{label:'Points',unit:'PPG',leaders:leaders(rows,'pts')},
    trb:{label:'Rebounds',unit:'RPG',leaders:leaders(rows,'trb')},
    ast:{label:'Assists',unit:'APG',leaders:leaders(rows,'ast')},
    stl:{label:'Steals',unit:'SPG',leaders:leaders(rows,'stl')},
    blk:{label:'Blocks',unit:'BPG',leaders:leaders(rows,'blk')},
    tov:{label:'Turnovers',unit:'TOPG',leaders:leaders(rows,'tov')},
    '3p':{label:'Three Pointers',unit:'3PG',leaders:leaders(rows,'3p')}
  };
  return res.status(200).json({season,source:'Basketball Reference',sourceUrl,resolvedBy,updatedAt:new Date().toISOString(),refreshSeconds:1800,playerCount:rows.length,categories,diagnostics:{errors}});
};
