function clean(value=''){
  return String(value||'')
    .replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')
    .replace(/<[^>]+>/g,' ')
    .replace(/&amp;/g,'&').replace(/&#39;|&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g,' ')
    .replace(/\s+/g,' ').trim();
}
function dateKey(value=''){
  const parsed=Date.parse(value);
  return Number.isFinite(parsed)?new Date(parsed).toISOString().slice(0,10):'';
}
async function fetchText(url,headers={}){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
  try{const response=await fetch(url,{headers,signal:controller.signal});if(!response.ok)throw new Error(`${response.status}`);return await response.text();}
  finally{clearTimeout(timer);}
}
function parseMarkdown(raw='',season){
  const verbs=/\b(traded|trade|signed|signs|waived|waives|released|releases|claimed|claims|acquired|acquires|retired|retires|suspended|activated|converted|re-signed|re-signed|re-signed)\b/i;
  const dateRx=/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?\s*[:–-]?\s*(.*)$/i;
  const out=[];let currentDate='';
  for(const rawLine of String(raw).split(/\r?\n/)){
    const line=clean(rawLine.replace(/^[-*#>\s]+/,''));if(!line)continue;
    const match=line.match(dateRx);
    if(match){currentDate=dateKey(`${match[1]} ${line.match(/\d{1,2}/)?.[0]||1}, ${season}`);const detail=clean(match[2]);if(detail&&verbs.test(detail))out.push({date:currentDate,detail});continue;}
    if(currentDate&&verbs.test(line)&&line.length>24&&line.length<600)out.push({date:currentDate,detail:line});
  }
  const seen=new Set();return out.filter(item=>{const sig=`${item.date}|${item.detail.toLowerCase()}`;if(seen.has(sig))return false;seen.add(sig);return true;});
}

module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const season=Number.parseInt(String(req.query.season||''),10);
  if(!Number.isInteger(season)||season<1997||season>2100)return res.status(400).json({error:'Valid WNBA season required.'});
  if(season===2026)return res.status(200).json({season,transactions:[],note:'Use the live Player Movement feed for the current season.'});
  res.setHeader('Cache-Control','s-maxage=604800, stale-while-revalidate=2592000');
  const source=`https://www.basketball-reference.com/wnba/years/${season}_transactions.html`;
  const readers=[`https://r.jina.ai/http://www.basketball-reference.com/wnba/years/${season}_transactions.html`,`https://r.jina.ai/https://www.basketball-reference.com/wnba/years/${season}_transactions.html`];
  const errors=[];let transactions=[];
  for(const url of readers){
    try{transactions=parseMarkdown(await fetchText(url,{Accept:'text/plain','User-Agent':'WeKnowTheW season yearbook/1.0'}),season);if(transactions.length)break;}catch(error){errors.push(error.message);}
  }
  transactions=transactions.sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,18);
  return res.status(200).json({season,transactions,source,partial:!transactions.length,errors});
};
