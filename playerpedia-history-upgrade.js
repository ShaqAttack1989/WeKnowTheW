(()=>{
  const grid=document.getElementById('playerGrid');
  const modal=document.getElementById('playerModalBody');
  if(!grid||!modal)return;

  const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const num=value=>{const n=Number(value);return Number.isFinite(n)?n:null;};
  const one=value=>{const n=num(value);return n===null?'—':n.toFixed(1);};
  const pct=value=>{const n=num(value);return n===null?'—':`${(Math.abs(n)<=1?n*100:n).toFixed(1)}%`;};
  const gradeClass=letter=>{const value=String(letter||'NR').toUpperCase();return value==='NR'?'grade-nr':`grade-${value.charAt(0).toLowerCase()}`;};
  const idle=(fn,timeout=1800)=>window.requestIdleCallback?requestIdleCallback(fn,{timeout}):setTimeout(fn,Math.min(timeout,900));

  let rosterByName=new Map();
  const snapshotBySeason=new Map();
  let ready=false;
  let cardTimer=null;
  let modalTimer=null;

  function seasonFor(player={}){const season=Number(player.lastWnbaSeason);return Number.isInteger(season)&&season>=2024&&season<=2026?season:null;}
  function historical(player={}){return player.currentRoster===false&&Boolean(seasonFor(player));}
  function snapshotFor(player={}){return snapshotBySeason.get(seasonFor(player))?.get(key(player.name))||null;}
  function inlineGrade(snapshot,season){
    const letter=snapshot?.letter||'NR';
    const score=num(snapshot?.score);
    return `<span class="player-grade-badge ${gradeClass(letter)}">${safe(letter)}</span><span class="player-grade-score">${score===null?'—':`${Math.round(score)}%`} · ${safe(season)} last-active grade</span>`;
  }
  function modalGrade(snapshot,season){
    const letter=snapshot?.letter||'NR';
    const score=num(snapshot?.score);
    return `<span class="player-history-grade"><span class="player-history-grade-badge ${gradeClass(letter)}">${safe(letter)}</span><span><strong>${score===null?'—':`${Math.round(score)}%`}</strong><small>${safe(season||'Last')} last-active grade</small></span></span>`;
  }
  function compactStats(snapshot,season){
    const parts=[];
    if(snapshot){parts.push(`${one(snapshot.ppg)} PTS`,`${one(snapshot.rpg)} REB`,`${one(snapshot.apg)} AST`);}
    return `<span class="player-card-history-label">${safe(season)} · LAST ACTIVE</span>${parts.length?`<span class="player-card-history-stats">${parts.map(x=>`<b>${safe(x)}</b>`).join('')}</span>`:''}`;
  }

  function decorateCards(){
    if(!ready)return;
    grid.querySelectorAll('.player-card[data-player-id]').forEach(card=>{
      const copy=card.querySelector('.player-card-copy');
      const name=copy?.querySelector('.player-card-name')?.textContent?.trim()||copy?.querySelector('strong')?.textContent?.trim()||'';
      const player=rosterByName.get(key(name));
      if(!copy||!player||!historical(player))return;
      const season=seasonFor(player),snapshot=snapshotFor(player);
      const sig=`${season}:${snapshot?.letter||'NR'}:${Math.round(Number(snapshot?.score)||0)}:${snapshot?.ppg??''}:${snapshot?.rpg??''}:${snapshot?.apg??''}`;
      card.classList.add('player-history-card');
      card.querySelector('.player-history-card-meta')?.remove();

      let grade=copy.querySelector('.player-card-grade');
      if(!grade){grade=document.createElement('span');grade.className='player-card-grade';copy.appendChild(grade);}
      if(grade.dataset.historySignature!==sig){
        grade.dataset.historySignature=sig;
        grade.innerHTML=inlineGrade(snapshot,season);
      }

      let note=copy.querySelector('.player-card-history-inline');
      if(!note){note=document.createElement('span');note.className='player-card-history-inline';copy.appendChild(note);}
      if(note.dataset.historySignature!==sig){note.dataset.historySignature=sig;note.innerHTML=compactStats(snapshot,season);}
    });
  }
  function scheduleCards(){clearTimeout(cardTimer);cardTimer=setTimeout(decorateCards,120);}

  function decorateModal(){
    if(!ready||modal.querySelector('.profile-loading'))return;
    const title=modal.querySelector('#playerModalTitle');if(!title)return;
    const player=rosterByName.get(key(title.textContent.trim()));
    if(!player||!historical(player))return;
    const season=seasonFor(player),snapshot=snapshotFor(player);
    const sig=`${key(player.name)}:${season}:${snapshot?.letter||'NR'}:${Math.round(Number(snapshot?.score)||0)}`;
    let history=modal.querySelector('.player-history-profile');
    if(history?.dataset.historySignature===sig)return;
    const lastTeam=player.lastTeam||String(player.team||'').replace(/^Free Agent\s*·\s*last:\s*/i,'')||'WNBA';
    const wrap=document.createElement('div');
    wrap.innerHTML=`<section class="player-history-profile" data-history-signature="${safe(sig)}"><div class="player-history-profile-head"><div><span>LAST ACTIVE SEASON</span><h4>${safe(season)} · ${safe(lastTeam)}</h4></div><div class="player-history-profile-grade">${modalGrade(snapshot,season)}</div></div><div class="player-history-profile-stats"><div><span>PTS</span><strong>${one(snapshot?.ppg)}</strong></div><div><span>REB</span><strong>${one(snapshot?.rpg)}</strong></div><div><span>AST</span><strong>${one(snapshot?.apg)}</strong></div><div><span>STL</span><strong>${one(snapshot?.spg)}</strong></div><div><span>BLK</span><strong>${one(snapshot?.bpg)}</strong></div><div><span>G</span><strong>${snapshot?.games??'—'}</strong></div></div><div class="player-history-profile-eff"><span><b>PER</b> ${one(snapshot?.per)}</span><span><b>TS%</b> ${pct(snapshot?.tsPct)}</span></div><p>This profile keeps the player’s most recent WNBA season instead of replacing her production with zeroes.</p></section>`;
    const next=wrap.firstElementChild;if(!next)return;
    if(history)history.replaceWith(next);
    else (modal.querySelector('.playerpedia-metrics-block')||modal.querySelector('.profile-facts'))?.insertAdjacentElement('afterend',next);
  }
  function scheduleModal(){clearTimeout(modalTimer);modalTimer=setTimeout(decorateModal,160);}

  async function loadSnapshot(season){
    try{
      const response=await fetch(`/api/player-season-snapshot?season=${season}`,{headers:{Accept:'application/json'}});
      const payload=await response.json().catch(()=>({}));
      if(response.ok&&Array.isArray(payload.players))snapshotBySeason.set(season,new Map(payload.players.map(item=>[key(item.name),item])));
    }catch{}
  }

  async function load(){
    try{
      const response=await fetch('/api/players?playerHistory=optimized',{headers:{Accept:'application/json'}});
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error('Player history unavailable');
      const roster=Array.isArray(payload.players)?payload.players:[];
      rosterByName=new Map(roster.map(player=>[key(player.name),player]));
      const seasons=[...new Set(roster.filter(historical).map(seasonFor).filter(Boolean))].sort((a,b)=>b-a);
      for(const season of seasons)await loadSnapshot(season);
      ready=true;
      decorateCards();
      decorateModal();
    }catch{}
  }

  new MutationObserver(scheduleCards).observe(grid,{childList:true});
  new MutationObserver(scheduleModal).observe(modal,{childList:true});
  idle(load,1800);
})();