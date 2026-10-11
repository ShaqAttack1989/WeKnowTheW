(()=>{
  const TEAM_CODES={
    'Atlanta Dream':'ATL','Chicago Sky':'CHI','Connecticut Sun':'CON','Dallas Wings':'DAL','Golden State Valkyries':'GSV','Indiana Fever':'IND','Las Vegas Aces':'LVA','Los Angeles Sparks':'LAS','Minnesota Lynx':'MIN','New York Liberty':'NYL','Phoenix Mercury':'PHX','Portland Fire':'POR','Seattle Storm':'SEA','Toronto Tempo':'TOR','Washington Mystics':'WAS'
  };
  let standingsCache=[];
  let standingsLoadedAt=0;
  let standingsPromise=null;
  let enhancing=false;

  function codeFor(name=''){
    if(TEAM_CODES[name])return TEAM_CODES[name];
    return String(name).split(/\s+/).filter(Boolean).map(word=>word[0]).join('').slice(0,3).toUpperCase()||'W';
  }

  function standingsMarkup(items=[]){
    if(!items.length)return '<div class="spotlight-dashboard-loading">Loading the playoff race…</div>';
    return `<div class="spotlight-standings-grid">${items.slice(0,8).map((item,index)=>{
      const name=item?.team?.full_name||item?.team_name||item?.team||'Team';
      const wins=item?.wins??'—';
      const losses=item?.losses??'—';
      const rank=item?.overall_rank||index+1;
      return `<div class="spotlight-standing-row"><b>${rank}</b><strong title="${name.replace(/"/g,'&quot;')}">${codeFor(name)}</strong><small>${wins}-${losses}</small></div>`;
    }).join('')}</div>`;
  }

  function renderStandingsFigure(figure,items=[]){
    if(!figure?.isConnected)return;
    figure.classList.add('spotlight-dashboard-media');
    figure.dataset.spotlightDashboard='standings';
    figure.innerHTML=`<div class="spotlight-dashboard" aria-label="Current top eight WNBA standings preview">
      <div class="spotlight-dashboard-head"><div class="spotlight-dashboard-kicker">Top eight right now</div><div class="spotlight-dashboard-live"><i aria-hidden="true"></i> Live standings</div></div>
      ${standingsMarkup(items)}
      <div class="spotlight-dashboard-foot"><strong>2026 playoff field</strong><div>W–L snapshot</div></div>
    </div>`;
  }

  function renderHqFigure(figure){
    if(!figure?.isConnected)return;
    figure.classList.add('spotlight-dashboard-media');
    figure.dataset.spotlightDashboard='season-hq';
    figure.innerHTML=`<div class="spotlight-dashboard" aria-label="Current season headquarters preview">
      <div class="spotlight-dashboard-head"><div class="spotlight-dashboard-kicker">Current season HQ</div><div class="spotlight-dashboard-live"><i aria-hidden="true"></i> Around the W</div></div>
      <div class="spotlight-hq-grid">
        <div class="spotlight-hq-panel"><small>Player movement</small><strong>Roster watch</strong><div class="spotlight-hq-tags"><b>Signings</b><b>Trades</b><b>Waivers</b></div><div class="spotlight-hq-note">Track who moved and where they landed.</div></div>
        <div class="spotlight-hq-panel"><small>Availability</small><strong>Status board</strong><div class="spotlight-hq-tags"><b>Active</b><b>Out</b><b>Return watch</b></div><div class="spotlight-hq-note">See the latest game status and return context.</div></div>
      </div>
      <div class="spotlight-dashboard-foot"><strong>Teams · movement · availability</strong><div>One hub</div></div>
    </div>`;
  }

  async function loadStandings(force=false){
    if(!force&&standingsCache.length&&Date.now()-standingsLoadedAt<60000)return standingsCache;
    if(standingsPromise)return standingsPromise;
    standingsPromise=fetch(`/api/stats?season=2026&cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'})
      .then(async response=>{
        if(!response.ok)throw new Error('Standings unavailable');
        const payload=await response.json();
        standingsCache=Array.isArray(payload?.standings)?payload.standings.slice(0,8):[];
        standingsLoadedAt=Date.now();
        return standingsCache;
      })
      .catch(()=>standingsCache)
      .finally(()=>{standingsPromise=null;});
    return standingsPromise;
  }

  function enhance(){
    if(enhancing)return;
    enhancing=true;
    try{
      const spotlight=document.querySelector('.home-season-spotlight');
      if(!spotlight)return;
      const liveCard=spotlight.querySelector('.season-story[href="/live-stats.html"]');
      const liveFigure=liveCard?.querySelector('.season-story-media');
      if(liveFigure&&liveFigure.dataset.spotlightDashboard!=='standings'){
        renderStandingsFigure(liveFigure,standingsCache);
        loadStandings().then(items=>{
          const current=document.querySelector('.home-season-spotlight .season-story[href="/live-stats.html"] .season-story-media');
          if(current)renderStandingsFigure(current,items);
        });
      }

      const hqCard=spotlight.querySelector('.season-story[href="/around-the-w.html"]');
      const hqFigure=hqCard?.querySelector('.season-story-media');
      if(hqFigure&&hqFigure.dataset.spotlightDashboard!=='season-hq')renderHqFigure(hqFigure);
    }finally{
      enhancing=false;
    }
  }

  function start(){
    enhance();
    const spotlight=document.querySelector('.home-season-spotlight');
    if(spotlight){
      const observer=new MutationObserver(()=>requestAnimationFrame(enhance));
      observer.observe(spotlight,{childList:true,subtree:true});
    }
    setInterval(()=>{if(!document.hidden)loadStandings(true).then(()=>enhance());},60000);
    window.addEventListener('focus',()=>loadStandings(true).then(()=>enhance()));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
