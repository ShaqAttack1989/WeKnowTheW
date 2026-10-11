// Public statistical tables only. No WNBA API is used by this feed.
const FIELDS = ['g','mp','pts','trb','ast','stl','blk','fg','fga','fg3','fg3a','ft','fta'];
const TEAM_CODES = new Set(['ATL','CHI','CON','DAL','GSV','IND','LVA','LAS','MIN','NYL','PHO','PHX','POR','SEA','TOR','WAS']);
function clean(value = '') {
  return String(value).replace(/<[^>]*>?/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ')
    .replace(/&#39;|&#x27;/gi,"'").replace(/&quot;/g,'"')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/\s+/g,' ').trim();
}
function numeric(value) {
  const text=clean(value).replace(/,/g,'');
  if(!text || !/^\d+(?:\.\d+)?$/.test(text))return null;
  const number=Number(text);return Number.isFinite(number)?number:null;
}
function cell(row, field) {
  return row.match(new RegExp(`<(?:td|th)\\b[^>]*data-stat=["']${field}["'][^>]*>([\\s\\S]*?)<\\/(?:td|th)>`,'i'))?.[1] || '';
}
function parseTotals(html) {
  const byPlayerTeam=new Map();
  for(const match of String(html).matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
    const raw=match[1],name=clean(cell(raw,'player'));
    const team=clean(cell(raw,'team')||cell(raw,'team_name_abbr')||cell(raw,'team_id')).toUpperCase();
    if(!name || !TEAM_CODES.has(team))continue; // Combined multi-team rows are never team statistics.
    const row={name,team:team==='PHX'?'PHO':team};
    for(const field of FIELDS)row[field]=numeric(cell(raw,field));
    if(!row.g || row.pts===null)continue;
    const key=`${name}|${row.team}`,old=byPlayerTeam.get(key);
    if(!old || row.g>old.g || (row.g===old.g && (row.mp||0)>(old.mp||0)))byPlayerTeam.set(key,row);
  }
  return [...byPlayerTeam.values()];
}
function complete(rows) {
  const teams=new Set(rows.map(row=>row.team));
  return rows.length>=120 && teams.size===15;
}
async function fetchTotals(fetchImpl=fetch, timeoutMs=6500) {
  const url='https://www.basketball-reference.com/wnba/years/2026_totals.html';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  try {
    const response=await fetchImpl(url,{headers:{Accept:'text/html','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0; +https://www.weknowthew.com)'},signal:controller.signal});
    if(!response.ok)throw new Error(`Statistics source returned ${response.status}`);
    const players=parseTotals(await response.text());
    if(!complete(players))throw new Error('Statistics source did not return all 15 active teams');
    return {season:2026,source:'Basketball-Reference',sourceUrl:url,checkedAt:new Date().toISOString(),players};
  } finally {clearTimeout(timer);}
}
module.exports={parseTotals,complete,fetchTotals};
