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
function transactionType(detail=''){
  const value=String(detail);
  if(/\btraded?\b/i.test(value))return 'TRADE';
  if(/\bretired|retirement\b/i.test(value))return 'RETIREMENT';
  if(/\bdrafted?\b/i.test(value))return /Allocation Draft/i.test(value)?'ALLOCATION DRAFT':/Elite Draft/i.test(value)?'ELITE DRAFT':/Expansion Draft/i.test(value)?'EXPANSION DRAFT':'DRAFT';
  if(/\b(hired|fired|resigns?|reassigned)\b.*\b(?:Head|Interim) Coach\b|\bHead Coach\b.*\b(hired|fired|resigns?|reassigned)\b/i.test(value))return 'COACHING';
  if(/\bsigned|re-signed|extended|extension\b/i.test(value))return 'SIGNING';
  if(/\bclaimed|acquired\b/i.test(value))return 'ACQUISITION';
  if(/\bwaived|released\b/i.test(value))return 'WAIVER';
  if(/\bsuspended|activated|converted\b/i.test(value))return 'ROSTER';
  return 'TRANSACTION';
}
function impactScore(item={}){
  const detail=String(item.detail||''),type=item.type||transactionType(detail);
  let score={TRADE:100,RETIREMENT:98,'EXPANSION DRAFT':96,'ALLOCATION DRAFT':94,'ELITE DRAFT':92,DRAFT:82,COACHING:78,ACQUISITION:72,SIGNING:62,ROSTER:45,WAIVER:30,TRANSACTION:20}[type]||20;
  if(/\b1st round|1st pick|1st overall|first overall\b/i.test(detail))score+=10;
  if(/\bcontract extension\b/i.test(detail))score+=5;
  if(/\bHead Coach\b/i.test(detail))score+=5;
  if(/\bfuture considerations|draft pick/i.test(detail)&&type==='TRADE')score+=3;
  return score;
}
function parseMarkdown(raw='',season){
  const verbs=/\b(traded?|signed|signs|re-signed|waived|waives|released|releases|claimed|claims|acquired|acquires|retired|retires|retirement|suspended|activated|converted|drafted|selected|allocated|hired|fired|resigns?|reassigned|extended|extension)\b/i;
  const dateRx=/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?\s*[:–-]?\s*(.*)$/i;
  const out=[];let currentDate='';
  for(const rawLine of String(raw).split(/\r?\n/)){
    const line=clean(rawLine.replace(/^[-*#>\s]+/,''));if(!line)continue;
    if(line===String(season)){currentDate=`${season}-01-01`;continue;}
    const match=line.match(dateRx);
    if(match){currentDate=dateKey(`${match[1]} ${line.match(/\d{1,2}/)?.[0]||1}, ${season}`);const detail=clean(match[2]);if(detail&&verbs.test(detail)){const type=transactionType(detail);out.push({date:currentDate,type,detail});}continue;}
    if(currentDate&&verbs.test(line)&&line.length>18&&line.length<800){const type=transactionType(line);out.push({date:currentDate,type,detail:line});}
  }
  const seen=new Set();return out.filter(item=>{const sig=`${item.date}|${item.detail.toLowerCase()}`;if(seen.has(sig))return false;seen.add(sig);return true;});
}
function majorTransactions(items=[]){
  return [...items]
    .map(item=>({...item,impact:impactScore(item)}))
    .sort((a,b)=>b.impact-a.impact||String(b.date).localeCompare(String(a.date))||a.detail.localeCompare(b.detail))
    .slice(0,18)
    .map(({impact,...item})=>item);
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
    try{transactions=parseMarkdown(await fetchText(url,{Accept:'text/plain','User-Agent':'WeKnowTheW season yearbook/2.0'}),season);if(transactions.length)break;}catch(error){errors.push(error.message);}
  }
  transactions=majorTransactions(transactions);
  return res.status(200).json({season,transactions,source,selection:'Season-defining moves prioritized over routine roster churn',partial:!transactions.length,errors});
};
module.exports._test={parseMarkdown,transactionType,impactScore,majorTransactions};
