(()=>{
  const grid=document.getElementById('playerGrid');
  const modalBody=document.getElementById('playerModalBody');
  if(!grid||!modalBody)return;

  const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const number=value=>{const n=Number(value);return Number.isFinite(n)?n:null;};
  const one=value=>{const n=number(value);return n===null?'—':n.toFixed(1);};
  const pct=value=>{const n=number(value);return n===null?'—':`${(Math.abs(n)<=1?n*100:n).toFixed(1)}%`;};
  const gradeClass=letter=>{const value=String(letter||'NR').toUpperCase();return value==='NR'?'grade-nr':`grade-${value.charAt(0).toLowerCase()}`;};

  let roster=[];
  let rosterByName=new Map();
  const snapshotBySeason=new Map();
  const mediaCache=new Map();
  let decorateTimer=null;
  let modalTimer=null;

  function isHistorical(player={}){return player.currentRoster===false;}
  function playerFor(name){return rosterByName.get(key(name))||null;}
  function seasonFor(player={}){const season=Number(player.lastWnbaSeason);return Number.isInteger(season)&&season>=1997?season:null;}
  function snapshotFor(player={}){
    const season=seasonFor(player);if(!season)return null;
    const map=snapshotBySeason.get(season);return map?.get(key(player.name))||null;
  }
  function photoCandidate(player={}){
    const direct=[player.officialHeadshot,player.photoCutout,player.photo,player.photoThumb,player.headshot].find(value=>/^https?:\/\//i.test(String(value||'').trim()));
    if(direct)return String(direct).trim();
    const wnbaId=String(player.wnbaId||'').replace(/[^0-9]/g,'');
    if(wnbaId)return `https://cdn.wnba.com/headshots/wnba/latest/1040x760/${wnbaId}.png`;
    const espnId=String(player.espnId||'').replace(/[^0-9]/g,'');
    if(espnId)return `/api/photo?id=${espnId}`;
    return '';
  }
  async function mediaPhoto(name=''){
    const playerKey=key(name);if(!playerKey)return '';
    if(mediaCache.has(playerKey))return mediaCache.get(playerKey);
    const promise=fetch(`/api/media?type=player&name=${encodeURIComponent(name)}`,{headers:{Accept:'application/json'}})
      .then(async response=>{const payload=await response.json().catch(()=>({}));return response.ok&&payload?.found&&payload?.item?.image?String(payload.item.image):'';})
      .catch(()=>'');
    mediaCache.set(playerKey,promise);return promise;
  }
  function wirePhoto(img,name){
    if(!img||img.dataset.historyFallback==='1')return;
    img.dataset.historyFallback='1';
    img.addEventListener('error',async()=>{
      if(img.dataset.historyMediaTried==='1'){img.style.display='none';return;}
      img.dataset.historyMediaTried='1';
      const fallback=await mediaPhoto(name);
      if(fallback){img.style.display='';img.src=fallback;}else img.style.display='none';
    });
  }
  function ensureAvatar(avatar,player){
    if(!avatar||!player)return;
    let img=avatar.querySelector('img');
    const src=photoCandidate(player);
    if(!img&&src){
      img=document.createElement('img');
      img.className='player-avatar-image player-history-photo';img.alt='';img.loading='lazy';img.decoding='async';img.src=src;avatar.appendChild(img);
    }else if(img&&src&&(!img.getAttribute('src')||img.style.display==='none')){
      img.style.display='';img.src=src;
    }
    if(img)wirePhoto(img,player.name);
  }
  function gradeMarkup(snapshot,season){
    const letter=snapshot?.letter||'NR';
    const score=number(snapshot?.score);
    return `<span class="player-history-grade-badge ${gradeClass(letter)}">${safe(letter)}</span><span><strong>${score===null?'—':`${Math.round(score)}%`}</strong><small>${safe(season)} last-active grade</small></span>`;
  }
  function statsMarkup(snapshot){
    if(!snapshot)return '<span class="player-history-stat-unavailable">Last-season stats are being connected.</span>';
    return `<span><b>${one(snapshot.ppg)}</b> PTS</span><span><b>${one(snapshot.rpg)}</b> REB</span><span><b>${one(snapshot.apg)}</b> AST</span>`;
  }
  function decorateCards(){
    grid.querySelectorAll('.player-card[data-player-id]').forEach(card=>{
      const name=card.querySelector('.player-card-name')?.textContent?.trim()||card.querySelector('.player-card-copy strong')?.textContent?.trim()||'';
      const player=playerFor(name);if(!player||!isHistorical(player))return;
      card.classList.add('player-history-card');
      ensureAvatar(card.querySelector('.player-avatar'),player);
      const season=seasonFor(player);const snapshot=snapshotFor(player);
      let history=card.querySelector('.player-history-card-meta');
      if(!history){history=document.createElement('span');history.className='player-history-card-meta';const arrow=card.querySelector('.player-card-arrow');if(arrow)card.insertBefore(history,arrow);else card.appendChild(history);}
      history.innerHTML=`<span class="player-history-season">${season?`${season} · LAST ACTIVE`:'LAST ACTIVE SEASON'}</span><span class="player-history-grade">${gradeMarkup(snapshot,season||'')}</span><span class="player-history-stats">${statsMarkup(snapshot)}</span>`;
    });
  }
  function scheduleCards(){clearTimeout(decorateTimer);decorateTimer=setTimeout(decorateCards,80);}

  function modalHistoryMarkup(player,snapshot){
    const season=seasonFor(player);
    const lastTeam=player.lastTeam||String(player.team||'').replace(/^Free Agent\s*·\s*last:\s*/i,'')||'WNBA';
    return `<section class="player-history-profile"><div class="player-history-profile-head"><div><span>LAST ACTIVE SEASON</span><h4>${safe(season||'Most recent WNBA season')} · ${safe(lastTeam)}</h4></div><div class="player-history-profile-grade">${gradeMarkup(snapshot,season||'')}</div></div><div class="player-history-profile-stats"><div><span>PTS</span><strong>${one(snapshot?.ppg)}</strong></div><div><span>REB</span><strong>${one(snapshot?.rpg)}</strong></div><div><span>AST</span><strong>${one(snapshot?.apg)}</strong></div><div><span>STL</span><strong>${one(snapshot?.spg)}</strong></div><div><span>BLK</span><strong>${one(snapshot?.bpg)}</strong></div><div><span>G</span><strong>${snapshot?.games??'—'}</strong></div></div><div class="player-history-profile-eff"><span><b>PER</b> ${one(snapshot?.per)}</span><span><b>TS%</b> ${pct(snapshot?.tsPct)}</span></div><p>Free-agent and inactive profiles keep the rating and statistics from the player’s most recent WNBA season instead of replacing them with zeroes.</p></section>`;
  }
  function decorateModal(){
    if(modalBody.querySelector('.profile-loading'))return;
    const title=modalBody.querySelector('#playerModalTitle');if(!title)return;
    const player=playerFor(title.textContent.trim());if(!player||!isHistorical(player))return;
    const snapshot=snapshotFor(player);const season=seasonFor(player);
    modalBody.classList.add('player-history-modal');
    ensureAvatar(modalBody.querySelector('.player-avatar'),player);
    const gradeLine=modalBody.querySelector('.profile-grade-line');
    if(gradeLine)gradeLine.innerHTML=gradeMarkup(snapshot,season||'');
    const metrics=modalBody.querySelector('.playerpedia-metrics-block');
    if(metrics){
      metrics.innerHTML=`<h4>${safe(season||'Last active')} efficiency · last active season</h4><div class="playerpedia-metrics-grid"><div class="playerpedia-metric"><span>PLAYER EFFICIENCY RATING</span><strong>${one(snapshot?.per)}</strong><small>PER from the player’s last WNBA season</small></div><div class="playerpedia-metric"><span>TRUE SHOOTING</span><strong>${pct(snapshot?.tsPct)}</strong><small>TS% from the player’s last WNBA season</small></div></div>`;
    }
    let history=modalBody.querySelector('.player-history-profile');
    if(!history){
      const wrap=document.createElement('div');wrap.innerHTML=modalHistoryMarkup(player,snapshot);history=wrap.firstElementChild;
      const metricsBlock=modalBody.querySelector('.playerpedia-metrics-block');
      if(metricsBlock)metricsBlock.insertAdjacentElement('afterend',history);
      else modalBody.querySelector('.profile-facts')?.insertAdjacentElement('afterend',history);
    }else{
      const wrap=document.createElement('div');wrap.innerHTML=modalHistoryMarkup(player,snapshot);history.replaceWith(wrap.firstElementChild);
    }
  }
  function scheduleModal(){clearTimeout(modalTimer);modalTimer=setTimeout(decorateModal,140);}

  async function fetchSeason(season){
    try{
      const response=await fetch(`/api/player-season-snapshot?season=${encodeURIComponent(season)}&cb=20260824-v1`,{headers:{Accept:'application/json'}});
      const payload=await response.json().catch(()=>({}));
      if(!response.ok||!Array.isArray(payload.players))return;
      snapshotBySeason.set(season,new Map(payload.players.map(item=>[key(item.name),item])));
    }catch{}
  }
  async function load(){
    try{
      const response=await fetch('/api/players?playerHistory=20260824-v1',{headers:{Accept:'application/json'},cache:'no-store'});
      const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Player history unavailable');
      roster=Array.isArray(payload.players)?payload.players:[];rosterByName=new Map(roster.map(player=>[key(player.name),player]));
      const seasons=[...new Set(roster.filter(isHistorical).map(seasonFor).filter(Boolean))].sort((a,b)=>b-a);
      await Promise.allSettled(seasons.map(fetchSeason));
      decorateCards();decorateModal();
    }catch{}
  }

  new MutationObserver(scheduleCards).observe(grid,{childList:true,subtree:true});
  new MutationObserver(scheduleModal).observe(modalBody,{childList:true,subtree:true});
  load();
})();
