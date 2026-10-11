const liveUpdates=require('../player-live-updates.json');

function text(value=''){
  return String(value??'')
    .replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')
    .replace(/<\/?(?:strong|b|span|a)\b[^>]*>?/gi,' ')
    .replace(/<[^>]+>/g,' ')
    .replace(/[<>]/g,' ')
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
    if(h.includes('player')&&h.includes('gs')&&h.includes('pts')&&h.includes('ast')){
      ix={player:h.indexOf('player'),team:h.indexOf('team'),pos:h.indexOf('pos'),g:lastIndex(h,'g'),gs:lastIndex(h,'gs'),mp:lastIndex(h,'mp'),
        fg:h.indexOf('fg'),fga:h.indexOf('fga'),fgPct:h.indexOf('fg%'),three:h.indexOf('3p'),threeA:h.indexOf('3pa'),threePct:h.indexOf('3p%'),
        orb:h.indexOf('orb'),trb:h.indexOf('trb'),ast:h.indexOf('ast'),stl:h.indexOf('stl'),blk:h.indexOf('blk'),tov:h.indexOf('tov'),pts:h.indexOf('pts')};
      continue;
    }
    if(!ix||c.every(v=>/^[-: ]+$/.test(v)))continue;
    const name=text(c[ix.player]);if(!name||name.toLowerCase()==='player')continue;
    rows.push({name,team:text(c[ix.team]),position:text(c[ix.pos]),g:num(c[ix.g]),gs:num(c[ix.gs]),mpg:num(c[ix.mp]),
      fg:num(c[ix.fg]),fga:num(c[ix.fga]),fgPct:pct(c[ix.fgPct]),three:num(c[ix.three]),threeA:num(c[ix.threeA]),threePct:pct(c[ix.threePct]),
      orb:num(c[ix.orb]),trb:num(c[ix.trb]),ast:num(c[ix.ast]),stl:num(c[ix.stl]),blk:num(c[ix.blk]),tov:num(c[ix.tov]),pts:num(c[ix.pts])});
  }
  return rows;
}

function parsePerGameHtml(raw=''){
  const rows=[];
  for(const m of String(raw).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)){
    const r=m[1],name=text(cellByStat(r,'player'));if(!name||name.toLowerCase()==='player')continue;
    const item={name,team:text(cellByStat(r,'team_name_abbr')||cellByStat(r,'team_id')),position:text(cellByStat(r,'pos')),
      g:num(text(cellByStat(r,'g'))),gs:num(text(cellByStat(r,'gs'))),mpg:num(text(cellByStat(r,'mp_per_g'))),
      fg:num(text(cellByStat(r,'fg_per_g'))),fga:num(text(cellByStat(r,'fga_per_g'))),fgPct:pct(text(cellByStat(r,'fg_pct'))),
      three:num(text(cellByStat(r,'fg3_per_g'))),threeA:num(text(cellByStat(r,'fg3a_per_g'))),threePct:pct(text(cellByStat(r,'fg3_pct'))),
      orb:num(text(cellByStat(r,'orb_per_g'))),trb:num(text(cellByStat(r,'trb_per_g'))),ast:num(text(cellByStat(r,'ast_per_g'))),
      stl:num(text(cellByStat(r,'stl_per_g'))),blk:num(text(cellByStat(r,'blk_per_g'))),tov:num(text(cellByStat(r,'tov_per_g'))),pts:num(text(cellByStat(r,'pts_per_g')))};
    if(item.g!==null&&item.mpg!==null)rows.push(item);
  }
  return rows;
}

function parseAdvancedMarkdown(raw=''){
  const rows=[];let ix=null;
  for(const line of String(raw).split(/\r?\n/)){
    if(!line.includes('|'))continue;
    const c=cells(line);if(c.length<10)continue;
    const h=c.map(hkey);
    if(h.includes('player')&&h.includes('per')&&(h.includes('ts%')||h.includes('ts'))){
      ix={player:h.indexOf('player'),team:h.indexOf('team'),per:h.indexOf('per'),ts:h.includes('ts%')?h.indexOf('ts%'):h.indexOf('ts'),
        trbPct:h.indexOf('trb%'),astPct:h.indexOf('ast%'),stlPct:h.indexOf('stl%'),blkPct:h.indexOf('blk%'),tovPct:h.indexOf('tov%'),usgPct:h.indexOf('usg%'),
        ortg:h.indexOf('ortg'),drtg:h.indexOf('drtg'),ows:h.indexOf('ows'),dws:h.indexOf('dws'),ws:h.indexOf('ws'),ws40:h.indexOf('ws/40')};
      continue;
    }
    if(!ix||c.every(v=>/^[-: ]+$/.test(v)))continue;
    const name=text(c[ix.player]);if(!name||name.toLowerCase()==='player')continue;
    rows.push({name,team:text(c[ix.team]),per:num(c[ix.per]),tsPct:pct(c[ix.ts]),trbPct:num(c[ix.trbPct]),astPct:num(c[ix.astPct]),stlPct:num(c[ix.stlPct]),blkPct:num(c[ix.blkPct]),tovPct:num(c[ix.tovPct]),usgPct:num(c[ix.usgPct]),ortg:num(c[ix.ortg]),drtg:num(c[ix.drtg]),ows:num(c[ix.ows]),dws:num(c[ix.dws]),ws:num(c[ix.ws]),ws40:num(c[ix.ws40])});
  }
  return rows;
}

function parseAdvancedHtml(raw=''){
  const rows=[];
  for(const m of String(raw).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)){
    const r=m[1],name=text(cellByStat(r,'player'));if(!name||name.toLowerCase()==='player')continue;
    const item={name,team:text(cellByStat(r,'team_name_abbr')||cellByStat(r,'team_id')),per:num(text(cellByStat(r,'per'))),tsPct:pct(text(cellByStat(r,'ts_pct'))),
      trbPct:num(text(cellByStat(r,'trb_pct'))),astPct:num(text(cellByStat(r,'ast_pct'))),stlPct:num(text(cellByStat(r,'stl_pct'))),blkPct:num(text(cellByStat(r,'blk_pct'))),
      tovPct:num(text(cellByStat(r,'tov_pct'))),usgPct:num(text(cellByStat(r,'usg_pct'))),ortg:num(text(cellByStat(r,'off_rtg'))),drtg:num(text(cellByStat(r,'def_rtg'))),
      ows:num(text(cellByStat(r,'ows'))),dws:num(text(cellByStat(r,'dws'))),ws:num(text(cellByStat(r,'ws'))),ws40:num(text(cellByStat(r,'ws_per_40')))};
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
  const reader=`https://r.jina.ai/http://www.basketball-reference.com/wnba/years/${season}_${suffix}.html`;
  const errors=[];let rows=[];
  try{rows=markdownParser(await fetchText(reader,{Accept:'text/plain'}));if(rows.length<20)throw new Error(`reader parsed ${rows.length}`);}catch(e){errors.push(e.message);}
  if(rows.length<20){
    try{rows=htmlParser(await fetchText(source,{Accept:'text/html','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0)'}));if(rows.length<20)throw new Error(`direct parsed ${rows.length}`);}catch(e){errors.push(e.message);}
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
function percentile(value,values,higher=true){const v=safe(value,0);const clean=values.filter(Number.isFinite).sort((a,b)=>a-b);if(!clean.length)return .5;let count=0;for(const x of clean){if(x<=v)count++;}const p=count/clean.length;return higher?p:1-p+1/clean.length;}
function weightedScores(candidates,metrics){
  const pools={};for(const m of metrics)pools[m.key]=candidates.map(p=>m.value(p)).filter(Number.isFinite);
  return candidates.map(p=>{let score=0,total=0;for(const m of metrics){const v=m.value(p);if(!Number.isFinite(v))continue;score+=percentile(v,pools[m.key],m.higher!==false)*m.weight;total+=m.weight;}return {...p,roleScore:total?score/total:0};}).sort((a,b)=>b.roleScore-a.roleScore);
}
function per36(value,mpg){return mpg>0?safe(value)*36/mpg:0;}
function rate(p){return p.g>0?safe(p.gs)/p.g:1;}
function isGuard(p){return /G/i.test(p.position||'');}
function isWing(p){return /G|F/i.test(p.position||'')&&!/^C$/i.test(p.position||'');}
function isBig(p){return /C|F-C|C-F/i.test(p.position||'');}
function fmt(n,d=1){return Number.isFinite(n)?Number(n).toFixed(d):'—';}
function percent(n,d=1){return Number.isFinite(n)?`${(n*100).toFixed(d)}%`:'—';}

const STARTING_FIVE=new Set(['kelseymitchell','paigebueckers','napheesacollier','breannastewart','ajawilson']);
const INACTIVE_PLAYERS=new Set((liveUpdates.rosterOverrides||[])
  .filter(item=>['waived','released','inactive'].includes(String(item.status||'').toLowerCase()))
  .map(item=>key(item.name)));

const roles=[
  {id:'sixth-woman',title:'Sixth Woman',subtitle:'The best all-around bench impact.',filter:p=>rate(p)<=.65,metrics:[
    {key:'pts',weight:.25,value:p=>p.pts},{key:'per',weight:.20,value:p=>p.per},{key:'ts',weight:.15,value:p=>p.tsPct},{key:'ws40',weight:.15,value:p=>p.ws40},{key:'ast',weight:.10,value:p=>p.ast},{key:'trb',weight:.10,value:p=>p.trb},{key:'stl',weight:.05,value:p=>p.stl}]},
  {id:'microwave',title:'Microwave Scorer',subtitle:'Instant offense without needing starter minutes.',filter:p=>rate(p)<=.75,metrics:[
    {key:'pts36',weight:.35,value:p=>per36(p.pts,p.mpg)},{key:'usg',weight:.20,value:p=>p.usgPct},{key:'ts',weight:.20,value:p=>p.tsPct},{key:'three36',weight:.15,value:p=>per36(p.three,p.mpg)},{key:'per',weight:.10,value:p=>p.per}]},
  {id:'three-d',title:'3 & D Wing',subtitle:'Spacing plus disruptive perimeter defense.',filter:p=>isWing(p)&&rate(p)<=.85&&safe(p.threeA)>=1.5,metrics:[
    {key:'threePct',weight:.28,value:p=>p.threePct},{key:'three',weight:.17,value:p=>p.three},{key:'stocks36',weight:.22,value:p=>per36(safe(p.stl)+safe(p.blk),p.mpg)},{key:'stlPct',weight:.13,value:p=>p.stlPct},{key:'blkPct',weight:.08,value:p=>p.blkPct},{key:'dws',weight:.12,value:p=>p.dws}]},
  {id:'glue',title:'Glue Player · Floor General',subtitle:'Connects possessions, protects the ball and keeps everyone organized.',filter:p=>isGuard(p)&&rate(p)<=.80,metrics:[
    {key:'astTo',weight:.30,value:p=>safe(p.ast)/Math.max(safe(p.tov),.5)},{key:'ast',weight:.25,value:p=>p.ast},{key:'astPct',weight:.15,value:p=>p.astPct},{key:'stl',weight:.10,value:p=>p.stl},{key:'ts',weight:.10,value:p=>p.tsPct},{key:'tov',weight:.10,value:p=>p.tov,higher:false}]},
  {id:'backup-pg',title:'Backup Floor General',subtitle:'Runs the second unit and settles the offense.',filter:p=>isGuard(p)&&rate(p)<=.55,metrics:[
    {key:'astTo',weight:.35,value:p=>safe(p.ast)/Math.max(safe(p.tov),.5)},{key:'ast',weight:.30,value:p=>p.ast},{key:'astPct',weight:.15,value:p=>p.astPct},{key:'ts',weight:.10,value:p=>p.tsPct},{key:'stl',weight:.10,value:p=>p.stl}]},
  {id:'energy-big',title:'Energy Big',subtitle:'Rebounds, rim protection, screens and extra-effort possessions.',filter:p=>isBig(p)&&rate(p)<=.70,metrics:[
    {key:'reb36',weight:.30,value:p=>per36(p.trb,p.mpg)},{key:'orb36',weight:.20,value:p=>per36(p.orb,p.mpg)},{key:'blk36',weight:.20,value:p=>per36(p.blk,p.mpg)},{key:'per',weight:.15,value:p=>p.per},{key:'ts',weight:.10,value:p=>p.tsPct},{key:'dws',weight:.05,value:p=>p.dws}]}
];

function roleLine(role,p){
  if(role.id==='sixth-woman')return `${fmt(p.pts)} PPG · ${fmt(p.mpg)} MPG · ${Math.round(rate(p)*100)}% starts · PER ${fmt(p.per)}`;
  if(role.id==='microwave')return `${fmt(per36(p.pts,p.mpg))} pts/36 · ${percent(p.tsPct)} TS · ${fmt(per36(p.three,p.mpg))} 3PM/36`;
  if(role.id==='three-d')return `${percent(p.threePct)} 3PT · ${fmt(p.stl)} STL · ${fmt(p.blk)} BLK · ${fmt(p.dws)} DWS`;
  if(role.id==='glue')return `${fmt(p.ast)} AST · ${fmt(safe(p.ast)/Math.max(safe(p.tov),.5),2)} AST/TO · ${fmt(p.stl)} STL`;
  if(role.id==='backup-pg')return `${fmt(p.ast)} AST · ${fmt(safe(p.ast)/Math.max(safe(p.tov),.5),2)} AST/TO · ${Math.round(rate(p)*100)}% starts`;
  return `${fmt(per36(p.trb,p.mpg))} REB/36 · ${fmt(per36(p.orb,p.mpg))} OREB/36 · ${fmt(per36(p.blk,p.mpg))} BLK/36`;
}
function why(role){
  const copy={
    'sixth-woman':'The strongest blend of bench scoring, efficiency and all-around impact in this week’s season-to-date pool.',
    'microwave':'Her scoring rate and efficiency jump off the page when production is adjusted for minutes.',
    'three-d':'She grades best at combining real 3-point volume with steals, blocks and defensive value.',
    'glue':'Her assist creation, ball security and connective guard play make her the board’s stabilizer.',
    'backup-pg':'Among true bench guards, she gives the best mix of playmaking, control and efficient decision-making.',
    'energy-big':'Her per-minute rebounding and rim protection create the kind of bench energy that changes possessions.'
  };
  return copy[role.id]||role.subtitle;
}

module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const seasonRaw=Number.parseInt(String(req.query.season||'2026'),10);const season=Number.isFinite(seasonRaw)?seasonRaw:2026;
  const week=/^\d{4}-\d{2}-\d{2}$/.test(String(req.query.week||''))?String(req.query.week):'';
  res.setHeader('Cache-Control','s-maxage=604800, stale-while-revalidate=86400');
  try{
    const [pg,adv]=await Promise.all([
      sourceRows(season,'per_game',parsePerGameMarkdown,parsePerGameHtml),
      sourceRows(season,'advanced',parseAdvancedMarkdown,parseAdvancedHtml)
    ]);
    const pgRows=chooseBest(pg.rows),advRows=chooseBest(adv.rows),advBy=new Map(advRows.map(p=>[key(p.name),p]));
    let players=pgRows.map(p=>({...p,...(advBy.get(key(p.name))||{}),name:text(p.name),team:p.team,position:p.position}));
    const maxG=Math.max(...players.map(p=>safe(p.g)),1),minGames=Math.max(8,Math.floor(maxG*.33));
    players=players.filter(p=>safe(p.g)>=minGames&&safe(p.mpg)>=8&&!STARTING_FIVE.has(key(p.name))&&!INACTIVE_PLAYERS.has(key(p.name)));
    const used=new Set(),picks=[];
    for(const role of roles){
      let pool=players.filter(p=>role.filter(p)&&!used.has(key(p.name)));
      if(pool.length<3)pool=players.filter(p=>!used.has(key(p.name)));
      const ranked=weightedScores(pool,role.metrics);const pick=ranked[0];if(!pick)continue;
      used.add(key(pick.name));
      picks.push({role:role.title,roleId:role.id,subtitle:role.subtitle,name:text(pick.name),team:pick.team,position:pick.position,score:Number((pick.roleScore*100).toFixed(1)),statLine:roleLine(role,pick),why:why(role),stats:{g:pick.g,gs:pick.gs,mpg:pick.mpg,pts:pick.pts,trb:pick.trb,ast:pick.ast,stl:pick.stl,blk:pick.blk,tov:pick.tov,three:pick.three,threePct:pick.threePct,per:pick.per,tsPct:pick.tsPct,ws40:pick.ws40}});
    }
    return res.status(200).json({season,week:week||null,updatedAt:new Date().toISOString(),minGames,picks,methodology:'Season-to-date per-game and advanced metrics. Waived and inactive players are excluded, Shak’s Starting Five is excluded, and one player can hold only one Bench Mob role.',sources:[pg.source,adv.source]});
  }catch(error){return res.status(502).json({error:'Bench Mob stats are temporarily unavailable.',detail:error.message,season,week:week||null});}
};
