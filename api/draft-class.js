function clean(value=''){
  return String(value||'').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#39;|&#x27;/g,"'").replace(/&nbsp;/g,' ').replace(/\*\*/g,' ').replace(/\s+/g,' ').trim();
}
function key(value=''){return clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function cells(line=''){const c=String(line).split('|').map(v=>v.trim());if(c[0]==='')c.shift();if(c[c.length-1]==='')c.pop();return c;}
function hkey(value=''){return clean(value).toLowerCase().replace(/[^a-z0-9]/g,'');}
function num(value){const m=String(value||'').match(/\d+/);return m?Number(m[0]):null;}
function parseMarkdown(raw=''){
  const rows=[];let ix=null;
  for(const line of String(raw).split(/\r?\n/)){
    if(!line.includes('|'))continue;
    const c=cells(line);if(c.length<3)continue;
    const h=c.map(hkey);
    if(h.includes('player')&&(h.includes('pick')||h.includes('pk')||h.includes('overall'))){
      ix={player:h.indexOf('player'),pick:h.includes('pick')?h.indexOf('pick'):h.includes('pk')?h.indexOf('pk'):h.indexOf('overall'),round:h.indexOf('round')>=0?h.indexOf('round'):h.indexOf('rnd'),team:h.indexOf('team')>=0?h.indexOf('team'):h.indexOf('tm')};
      continue;
    }
    if(!ix||c.every(v=>/^[-: ]+$/.test(v)))continue;
    const player=clean(c[ix.player]);const pick=num(c[ix.pick]);if(!player||!pick)continue;
    rows.push({player,pick,round:ix.round>=0?num(c[ix.round]):null,team:ix.team>=0?clean(c[ix.team]):''});
  }
  return rows;
}
function cell(row,stat){const rx=new RegExp(`<(?:th|td)[^>]*data-stat=["']${stat}["'][^>]*>([\\s\\S]*?)<\\/(?:th|td)>`,'i');return row.match(rx)?.[1]||'';}
function parseHtml(raw=''){
  const rows=[];
  for(const m of String(raw).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)){
    const r=m[1];const player=clean(cell(r,'player'));const pick=num(clean(cell(r,'pick_overall')||cell(r,'pick')));if(!player||!pick||/^(player|per game|advanced)$/i.test(player))continue;
    rows.push({player,pick,round:num(clean(cell(r,'round')||cell(r,'draft_round'))),team:clean(cell(r,'team')||cell(r,'team_name_abbr')||cell(r,'team_id'))});
  }
  return rows;
}
async function fetchText(url,headers={}){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
  try{const r=await fetch(url,{headers,signal:controller.signal});if(!r.ok)throw new Error(`${url} returned ${r.status}`);return await r.text();}finally{clearTimeout(timer);}
}
module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const year=Number.parseInt(String(req.query.year||''),10);if(!Number.isInteger(year)||year<1997||year>2100)return res.status(400).json({error:'Valid WNBA draft year required'});
  res.setHeader('Cache-Control','s-maxage=604800, stale-while-revalidate=2592000');
  const source=`https://www.basketball-reference.com/wnba/draft/${year}.html`;const readers=[`https://r.jina.ai/http://www.basketball-reference.com/wnba/draft/${year}.html`,`https://r.jina.ai/https://www.basketball-reference.com/wnba/draft/${year}.html`];
  let rows=[];const errors=[];
  for(const reader of readers){try{const parsed=parseMarkdown(await fetchText(reader,{Accept:'text/plain'}));if(parsed.length>rows.length)rows=parsed;if(rows.length>=8)break;}catch(e){errors.push(e.message);}}
  if(rows.length<8){try{const parsed=parseHtml(await fetchText(source,{Accept:'text/html','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0)'}));if(parsed.length>rows.length)rows=parsed;}catch(e){errors.push(e.message);}}
  if(!rows.length)return res.status(502).json({error:'Draft class unavailable',detail:errors.join(' | '),year,source});
  const seen=new Set();const picks=rows.filter(item=>{const k=`${item.pick}|${key(item.player)}`;if(seen.has(k))return false;seen.add(k);return true;}).sort((a,b)=>a.pick-b.pick);
  return res.status(200).json({year,updatedAt:new Date().toISOString(),source,picks});
};
