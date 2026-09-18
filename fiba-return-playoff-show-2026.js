(()=>{
  const DATE='2026-09-17';
  const PLAYOFF=new Set(['Atlanta Dream','Washington Mystics','Dallas Wings','Las Vegas Aces','Minnesota Lynx','Golden State Valkyries','Indiana Fever','New York Liberty']);
  const MATCHUPS=[
    {away:'Connecticut Sun',home:'Atlanta Dream',winner:'Atlanta Dream',fallback:[59,103],margin:44},
    {away:'Washington Mystics',home:'Chicago Sky',winner:'Washington Mystics',fallback:[110,80],margin:30},
    {away:'Los Angeles Sparks',home:'Dallas Wings',winner:'Dallas Wings',fallback:[77,97],margin:20},
    {away:'Phoenix Mercury',home:'Portland Fire',winner:'Phoenix Mercury',fallback:[94,91],margin:3},
    {away:'Las Vegas Aces',home:'Seattle Storm',winner:'Las Vegas Aces',fallback:[114,77],margin:37}
  ];
  const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');
  const getJson=async url=>{const j=url.includes('?')?'&':'?';const r=await fetch(url+j+'cb='+Date.now(),{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});if(!r.ok)throw new Error(url+' '+r.status);return r.json();};
  function gamePool(stats){return [].concat(stats.liveGames||[],stats.upcomingGames||[],stats.pastGames||[],stats.recentResults||[]);}
  function findGame(games,m){return games.find(g=>String(g.date||'').slice(0,10)===DATE&&norm(g.awayTeam)===norm(m.away)&&norm(g.homeTeam)===norm(m.home));}
  function finalScores(g,m){const a=Number(g?.awayScore),h=Number(g?.homeScore);return Number.isFinite(a)&&Number.isFinite(h)?[a,h]:m.fallback;}
  function renderScores(stats){
    const host=document.getElementById('returnScoreGrid'); if(!host)return;
    const games=gamePool(stats);
    host.innerHTML=MATCHUPS.map(m=>{
      const g=findGame(games,m),scores=finalScores(g,m),winnerHome=norm(m.winner)===norm(m.home),winnerTag=PLAYOFF.has(m.winner)?'PLAYOFF TEAM':'DEVELOPMENT GAME';
      const winnerScore=winnerHome?scores[1]:scores[0],loserScore=winnerHome?scores[0]:scores[1];
      const winnerCode=m.winner.split(' ').map(x=>x[0]).join('').slice(-3).toUpperCase();
      const loser=m.winner===m.home?m.away:m.home;
      const loserCode=loser.split(' ').map(x=>x[0]).join('').slice(-3).toUpperCase();
      return '<article class="return-score-card '+(PLAYOFF.has(m.winner)?'playoff':'')+'"><span>'+winnerTag+'</span><strong>'+safe(winnerCode)+' '+safe(winnerScore)+'</strong><b>'+safe(loserCode)+' '+safe(loserScore)+'</b><em>+'+safe(Math.abs(winnerScore-loserScore))+'</em></article>';
    }).join('');
  }
  function teamName(row){return row?.team?.full_name||row?.team||'Team';}
  function renderStandings(stats,teams){
    const host=document.getElementById('returnStandings'); if(!host)return;
    const logos=new Map((teams.teams||[]).map(t=>[norm(t.name),t.badge||t.logo||'']));
    const rows=[...(stats.standings||[])].sort((a,b)=>Number(a.overall_rank||a.playoff_seed||999)-Number(b.overall_rank||b.playoff_seed||999)).slice(0,8);
    if(!rows.length){host.innerHTML='<div class="return-loading">Standings are reconnecting. Open Live Stats for the current order.</div>';return;}
    host.innerHTML=rows.map((row,i)=>{
      const name=teamName(row),rank=Number(row.overall_rank||row.playoff_seed||i+1),logo=logos.get(norm(name))||'';
      return '<div class="return-standing-row '+(rank<=4?'homecourt':'')+'"><span class="return-standing-rank">'+safe(rank)+'</span><span class="return-standing-team">'+(logo?'<img src="'+safe(logo)+'" alt="" loading="lazy">':'')+safe(name)+'</span><b>'+safe(row.wins)+'–'+safe(row.losses)+'</b><b>'+safe(row.streak||'—')+'</b><b>'+safe(row.last_ten||'—')+'</b></div>';
    }).join('');
  }
  function gameTime(g){
    const raw=g.startTimeUtc||g.strTimestamp||g.timestamp||'';
    const d=raw?new Date(raw):new Date(String(g.date||'')+'T'+String(g.time||'12:00'));
    if(Number.isNaN(d.getTime()))return String(g.date||'TBD');
    return d.toLocaleString([],{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  }
  function renderNext(stats){
    const host=document.getElementById('returnNextGames'); if(!host)return;
    const games=(stats.upcomingGames||[]).filter(g=>PLAYOFF.has(g.awayTeam)||PLAYOFF.has(g.homeTeam)).slice(0,5);
    host.innerHTML=games.length?games.map(g=>'<div class="return-next-game"><strong>'+safe(g.awayTeam||'TBD')+' @ '+safe(g.homeTeam||'TBD')+'</strong><span>'+safe(gameTime(g))+(g.broadcast?' · '+safe(g.broadcast):'')+'</span></div>').join(''):'<p>The next-game window is refreshing. Open Games for the full slate.</p>';
  }
  async function refresh(){
    const status=document.getElementById('returnLiveStatus');
    const results=await Promise.allSettled([getJson('/api/stats?season=2026'),getJson('/api/teams?returnNight=20260917')]);
    const stats=results[0].status==='fulfilled'?results[0].value:{};
    const teams=results[1].status==='fulfilled'?results[1].value:{teams:[]};
    renderScores(stats);renderStandings(stats,teams);renderNext(stats);
    if(status){
      const failed=results.filter(r=>r.status==='rejected').length;
      status.classList.toggle('is-error',failed>0);
      const stamp=new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
      status.innerHTML='<span aria-hidden="true"></span> '+(failed===2?'Live feeds are retrying · verified finals remain on screen':'Dynamic dashboards connected · refreshed '+safe(stamp));
    }
  }
  refresh();
  setInterval(()=>{if(!document.hidden)refresh();},120000);
  window.addEventListener('focus',refresh);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();