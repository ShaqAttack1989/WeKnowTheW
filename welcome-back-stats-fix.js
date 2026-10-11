(()=>{
  const SEASON=2026;
  const GRID_ID='returnPlayerGrid';
  const TEAM_CODES={CON:['CON'],ATL:['ATL'],WAS:['WAS'],CHI:['CHI'],LAS:['LAS'],DAL:['DAL'],PHX:['PHX','PHO'],POR:['POR'],LVA:['LVA','LVA','VEG'],SEA:['SEA']};
  const PLAYOFF_FIELD_BASE='/assets/images/snack-shak/welcome-back-playoff-field';
  const PLAYOFF_FIELD_ALT='2026 WNBA playoff field showing the eight seeded teams, records, featured players and championship history through September 16';
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
  let playoffFieldPromise=null;

  function playoffFieldSrc(){
    if(playoffFieldPromise)return playoffFieldPromise;
    playoffFieldPromise=Promise.all([1,2,3,4,5].map(index=>
      fetch(`${PLAYOFF_FIELD_BASE}/part-${index}.txt?v=20260916`,{cache:'force-cache'}).then(response=>{
        if(!response.ok)throw new Error(`playoff field image part ${index} returned ${response.status}`);
        return response.text();
      })
    )).then(parts=>`data:image/jpeg;base64,${parts.join('')}`);
    return playoffFieldPromise;
  }

  function ensurePlayoffFieldStyles(){
    if(document.getElementById('welcomeBackPlayoffFieldStyles'))return;
    const style=document.createElement('style');
    style.id='welcomeBackPlayoffFieldStyles';
    style.textContent=`
      .wbw-playoff-field-feature{padding:34px 0 20px;background:linear-gradient(180deg,#f4f0fa 0%,#fff 100%)}
      .wbw-playoff-field-feature .wbw-playoff-field-intro{max-width:760px;margin:0 auto 18px;text-align:center}
      .wbw-playoff-field-feature .wbw-playoff-field-intro .kicker{margin-bottom:7px}
      .wbw-playoff-field-feature .wbw-playoff-field-intro h2{margin:0 0 8px;color:#160b33}
      .wbw-playoff-field-feature .wbw-playoff-field-intro p:last-child{margin:0;color:#5f5770}
      .wbw-playoff-field-figure{max-width:520px;margin:0 auto;background:#160b33;border-radius:24px;overflow:hidden;box-shadow:0 22px 60px rgba(21,10,48,.22)}
      .wbw-playoff-field-figure img{display:block;width:100%;height:auto;background:#160b33}
      .wbw-playoff-field-figure figcaption{padding:14px 18px 16px;color:#f8f5ff;background:#160b33;font-size:.9rem;line-height:1.45;text-align:center}
      .wbw-playoff-field-figure figcaption strong{color:#c7ff35}
      @media(max-width:640px){.wbw-playoff-field-feature{padding:24px 0 14px}.wbw-playoff-field-figure{border-radius:18px}.wbw-playoff-field-figure figcaption{font-size:.82rem}}
    `;
    document.head.appendChild(style);
  }

  async function ensurePlayoffFieldFeature(){
    const main=document.querySelector('main');
    const briefing=document.getElementById('briefing');
    if(!main||!briefing||document.getElementById('playoffFieldFeature'))return;
    ensurePlayoffFieldStyles();
    const section=document.createElement('section');
    section.className='wbw-playoff-field-feature';
    section.id='playoffFieldFeature';
    section.setAttribute('aria-label','2026 WNBA playoff field');
    section.innerHTML=`<div class="page-shell"><div class="wbw-playoff-field-intro"><p class="kicker">THE FIELD IS SET</p><h2>Eight teams. One trophy. The receipts are here.</h2><p>Seeds and records through Sept. 16, paired with each franchise's playoff history through 2025.</p></div><figure class="wbw-playoff-field-figure"><img alt="${PLAYOFF_FIELD_ALT}" width="420" height="525" loading="eager"><figcaption><strong>2026 PLAYOFF FIELD</strong> · Your quick visual before the September 17 return night sprint.</figcaption></figure></div>`;
    main.insertBefore(section,briefing);
    const image=section.querySelector('img');
    try{image.src=await playoffFieldSrc();}
    catch(error){
      console.warn('Welcome Back playoff field image could not load',error);
      section.remove();
    }
  }

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
    ensurePlayoffFieldFeature();
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
