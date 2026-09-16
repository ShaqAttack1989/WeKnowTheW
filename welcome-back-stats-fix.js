(()=>{
  const SEASON=2026;
  const GRID_ID='returnPlayerGrid';
  const TEAM_CODES={CON:['CON'],ATL:['ATL'],WAS:['WAS'],CHI:['CHI'],LAS:['LAS'],DAL:['DAL'],PHX:['PHX','PHO'],POR:['POR'],LVA:['LVA','LVA','VEG'],SEA:['SEA']};
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');
  const finite=value=>Number.isFinite(Number(value));
  const number=value=>finite(value)?Number(value):null;
  const one=value=>number(value)===null?'—':number(value).toFixed(1);
  const pct=value=>{
    const n=number(value);
    if(n===null)return '—';
    return `${(Math.abs(n)<=1?n*100:n).toFixed(1)}%`;
  };
  const getJson=async url=>{
    const response=await fetch(`${url}${url.includes('?')?'&':'?'}cb=${Date.now()}`,{headers:{Accept:'application/json'},cache:'no-store'});
    if(!response.ok)throw new Error(`${url} returned ${response.status}`);
    return response.json();
  };

  let seasonMap=new Map();
  let totalsByName=new Map();
  let loadedAt=0;
  let loading=null;

  function addTotal(row={}){
    const key=norm(row.name);
    if(!key)return;
    if(!totalsByName.has(key))totalsByName.set(key,[]);
    totalsByName.get(key).push(row);
  }

  function totalFor(name,teamTag=''){
    const rows=totalsByName.get(norm(name))||[];
    if(!rows.length)return null;
    const accepted=TEAM_CODES[String(teamTag||'').toUpperCase()]||[String(teamTag||'').toUpperCase()];
    const exact=rows.filter(row=>accepted.includes(String(row.team||'').toUpperCase()));
    const pool=exact.length?exact:rows;
    return [...pool].sort((a,b)=>(Number(b.g)||0)-(Number(a.g)||0))[0]||null;
  }

  function trueShootingFromTotals(row={}){
    const pts=number(row.pts),fga=number(row.fga),fta=number(row.fta);
    if(pts===null||fga===null||fta===null)return null;
    const denominator=2*(fga+.44*fta);
    return denominator>0?pts/denominator:null;
  }

  function ppgFromTotals(row={}){
    const pts=number(row.pts),games=number(row.g);
    return pts!==null&&games>0?pts/games:null;
  }

  async function load(force=false){
    if(!force&&loadedAt&&Date.now()-loadedAt<15*60*1000)return;
    if(loading)return loading;
    loading=Promise.allSettled([
      getJson(`/api/player-season-snapshot?season=${SEASON}`),
      getJson(`/api/team-player-totals?season=${SEASON}`)
    ]).then(results=>{
      const snapshot=results[0].status==='fulfilled'?results[0].value:{};
      const totals=results[1].status==='fulfilled'?results[1].value:{};
      seasonMap=new Map((Array.isArray(snapshot.players)?snapshot.players:[]).map(row=>[norm(row.name),row]));
      totalsByName=new Map();
      (Array.isArray(totals.players)?totals.players:[]).forEach(addTotal);
      loadedAt=Date.now();
    }).finally(()=>{loading=null;});
    return loading;
  }

  function updateCard(card){
    const name=card.querySelector('h3')?.textContent?.trim();
    const teamTag=card.querySelector('.wbw-player-card-body > span')?.textContent?.split('·')[0]?.trim()||'';
    const boxes=[...card.querySelectorAll('.wbw-player-metrics > div')];
    if(!name||boxes.length<2)return;
    const season=seasonMap.get(norm(name))||{};
    const totals=totalFor(name,teamTag)||{};
    const ppg=number(season.ppg)??ppgFromTotals(totals);
    const shooting=number(season.tsPct)??trueShootingFromTotals(totals);
    const games=number(season.games)??number(totals.g);

    const firstLabel=boxes[0].querySelector('span');
    const firstValue=boxes[0].querySelector('strong');
    const secondLabel=boxes[1].querySelector('span');
    const secondValue=boxes[1].querySelector('strong');
    if(firstLabel)firstLabel.textContent='PPG';
    if(firstValue)firstValue.textContent=one(ppg);
    if(secondLabel)secondLabel.textContent='TRUE SHOOTING';
    if(secondValue)secondValue.textContent=pct(shooting);
    card.dataset.statsSource=seasonMap.has(norm(name))?'season-snapshot':Object.keys(totals).length?'saved-totals':'unavailable';
    if(games!==null)card.dataset.games=String(games);
  }

  function updateCards(){
    const grid=document.getElementById(GRID_ID);
    if(!grid)return;
    grid.querySelectorAll('.wbw-player-card').forEach(updateCard);
  }

  async function sync(force=false){
    await load(force);
    updateCards();
  }

  function boot(){
    const grid=document.getElementById(GRID_ID);
    if(!grid)return;
    let scheduled=false;
    const observer=new MutationObserver(()=>{
      if(scheduled)return;
      scheduled=true;
      requestAnimationFrame(()=>{scheduled=false;updateCards();});
    });
    observer.observe(grid,{childList:true,subtree:true});
    sync();
    setInterval(()=>{if(!document.hidden)sync(true);},15*60*1000);
    window.addEventListener('focus',()=>sync());
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
