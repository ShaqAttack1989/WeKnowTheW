function collegeSafe(value=''){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function shortDate(value=''){if(!value)return '';const date=new Date(`${String(value).slice(0,10)}T12:00:00`);return Number.isNaN(date.getTime())?value:date.toLocaleDateString([],{month:'short',day:'numeric'});}

function collegeGameMarkup(game,label='F'){
  const score=game.awayScore==null||game.homeScore==null?'vs.':`${game.awayScore}–${game.homeScore}`;
  return `<div class="simple-row"><span class="badge">${label}</span><div><strong>${collegeSafe(game.awayTeam||'TBD')} ${score} ${collegeSafe(game.homeTeam||'TBD')}</strong><small>${collegeSafe(game.label||game.date||'College game')}</small></div><span>${label==='F'?'Completed':'Upcoming'}</span></div>`;
}

function leaderMarkup(items=[]){
  if(!items.length)return '<div class="college-leader-row"><span>—</span><div><strong>No leader data returned.</strong></div></div>';
  return items.map(item=>`<div class="college-leader-row"><span class="college-rank">${collegeSafe(item.rank)}</span><div><strong>${collegeSafe(item.name)}</strong><small>${collegeSafe(item.team)}</small></div><b>${collegeSafe(item.stat)} <small>${collegeSafe(item.metric)}</small></b></div>`).join('');
}

function snapshotMarkup(snapshot){
  if(!snapshot?.championship)return '';
  const championship=snapshot.championship;
  return `<article class="college-snapshot-card champion-card"><span>NATIONAL CHAMPION</span><strong>${collegeSafe(championship.champion)}</strong><b>${collegeSafe(championship.record||'')}</b><p>${collegeSafe(championship.score)} over ${collegeSafe(championship.runnerUp)} · ${collegeSafe(championship.note||'')}</p></article><article class="college-snapshot-card"><span>FINAL FOUR</span><strong>${(snapshot.finalFour||[]).map(collegeSafe).join(' · ')}</strong><p>The four teams left standing in the 2026 NCAA tournament.</p></article><article class="college-snapshot-card"><span>TITLE GAME</span><strong>${collegeSafe(championship.champion)} ${collegeSafe(championship.score)} ${collegeSafe(championship.runnerUp)}</strong><p>${collegeSafe(championship.date||'')}</p></article>`;
}

async function loadCollege(){
  const feed=document.getElementById('collegeFeed');
  const status=document.getElementById('collegeStatus');
  const seasonTitle=document.getElementById('collegeSeasonTitle');
  const snapshotEl=document.getElementById('collegeSnapshot');
  const pointsEl=document.getElementById('collegePointsLeaders');
  const ppgEl=document.getElementById('collegePpgLeaders');
  const sourceNote=document.getElementById('collegeSourceNote');
  try{
    const response=await fetch('/api/next',{headers:{Accept:'application/json'}});
    const payload=await response.json().catch(()=>({}));
    const upcoming=Array.isArray(payload.upcoming)?payload.upcoming:[];
    const recent=Array.isArray(payload.recent)?payload.recent:[];
    const snapshot=payload.snapshot||null;

    seasonTitle.textContent=snapshot?.label||`${payload.season||''} college tracker`;
    snapshotEl.innerHTML=snapshotMarkup(snapshot);
    pointsEl.innerHTML=leaderMarkup(snapshot?.scoringLeaders||[]);
    ppgEl.innerHTML=leaderMarkup(snapshot?.pointsPerGameLeaders||[]);

    const games=recent.length?recent:upcoming;
    if(!games.length){
      feed.innerHTML='<div class="simple-row"><span class="badge">W</span><div><strong>No game list is available from the provider.</strong><small>The season stats snapshot above remains available.</small></div></div>';
    }else{
      feed.innerHTML=games.slice(0,8).map(game=>collegeGameMarkup(game,recent.length?'F':'UP')).join('');
    }

    status.textContent=payload.providerMessage||`${payload.season||''} college data`;
    sourceNote.innerHTML=snapshot?`Season snapshot source: <a href="${collegeSafe(snapshot.sourceUrl||'https://www.ncaa.com/')}" target="_blank" rel="noopener noreferrer">${collegeSafe(snapshot.source||'NCAA.com')}</a>. The independent schedule feed remains separate.`:'';
  }catch(error){
    feed.innerHTML='<div class="simple-row"><span class="badge">!</span><div><strong>College data could not load.</strong><small>Try again shortly.</small></div></div>';
    status.textContent='College tracker temporarily unavailable';
  }
}

function upshotTeamsMarkup(items=[]){
  if(!items.length)return '<article class="upshot-team-card"><strong>UPSHOT records are refreshing.</strong></article>';
  return items.map(item=>`<article class="upshot-team-card"><span>${collegeSafe(item.status||'PUBLIC SNAPSHOT')}</span><strong>${collegeSafe(item.team)}</strong><b>${collegeSafe(item.record||'—')}</b><small>as of ${collegeSafe(shortDate(item.asOf))}</small></article>`).join('');
}

function upshotLeadersMarkup(items=[]){
  if(!items.length)return '<div class="college-leader-row"><span>—</span><div><strong>Leader data is refreshing.</strong></div></div>';
  return items.map((item,index)=>`<div class="college-leader-row"><span class="college-rank">${index+1}</span><div><strong>${collegeSafe(item.player)}</strong><small>${collegeSafe(item.team)} · as of ${collegeSafe(shortDate(item.asOf))}</small></div><b>${collegeSafe(item.stat)} <small>${collegeSafe(item.metric)}</small></b></div>`).join('');
}

function upshotCallupMarkup(items=[]){
  if(!items.length)return '<article class="upshot-callup-card"><strong>No call-ups loaded yet.</strong></article>';
  return items.map(item=>`<article class="upshot-callup-card"><span class="upshot-callup-date">${collegeSafe(shortDate(item.date))}</span><div class="upshot-callup-route"><b>${collegeSafe(item.from)}</b><span>→</span><b>${collegeSafe(item.to)}</b></div><strong>${collegeSafe(item.player)}</strong><p>${collegeSafe(item.contract||'WNBA opportunity')}</p><small>${collegeSafe(item.stats||'')}</small><em>${collegeSafe(item.milestone||'')}</em></article>`).join('');
}

async function loadUpshot(){
  const teamGrid=document.getElementById('upshotTeamGrid');
  const leaderGrid=document.getElementById('upshotLeaderGrid');
  const callups=document.getElementById('upshotCallups');
  const callupCount=document.getElementById('upshotCallupCount');
  const status=document.getElementById('upshotStatus');
  const next=document.getElementById('upshotNext');
  const sourceNote=document.getElementById('upshotSourceNote');
  if(!teamGrid||!leaderGrid||!callups)return;
  try{
    const response=await fetch('/upshot-live.json',{headers:{Accept:'application/json'},cache:'no-cache'});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error('UPSHOT snapshot unavailable');
    const teams=Array.isArray(payload.teams)?payload.teams:[];
    const leaders=Array.isArray(payload.leaders)?payload.leaders:[];
    const moves=Array.isArray(payload.callUps)?payload.callUps:[];
    teamGrid.innerHTML=upshotTeamsMarkup(teams);
    leaderGrid.innerHTML=upshotLeadersMarkup(leaders);
    callups.innerHTML=upshotCallupMarkup(moves);
    callupCount.textContent=`${moves.length} ${moves.length===1?'player has':'players have'} moved UP to WNBA contracts`;
    const updated=payload.updatedAt?new Date(payload.updatedAt):null;
    status.textContent=updated&&!Number.isNaN(updated.getTime())?`Public-source snapshot checked ${updated.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'})}.`:'Public-source UPSHOT snapshot connected.';
    next.textContent=payload.next||'';
    const sources=Array.isArray(payload.sources)?payload.sources:[];
    sourceNote.innerHTML=sources.length?`Sources: ${sources.map(source=>`<a href="${collegeSafe(source.url)}" target="_blank" rel="noopener noreferrer">${collegeSafe(source.label)}</a>`).join(' · ')}.`:'';
  }catch(error){
    teamGrid.innerHTML='<article class="upshot-team-card"><strong>UPSHOT tracker is temporarily unavailable.</strong><small>The college tracker above is unaffected.</small></article>';
    leaderGrid.innerHTML='<div class="college-leader-row"><span>!</span><div><strong>Stat snapshot unavailable.</strong></div></div>';
    callups.innerHTML='<article class="upshot-callup-card"><strong>Call-up tracker unavailable.</strong></article>';
    status.textContent='UPSHOT tracker temporarily unavailable';
  }
}

loadCollege();
loadUpshot();