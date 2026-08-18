function collegeSafe(value=''){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}

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

loadCollege();