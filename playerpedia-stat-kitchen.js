(()=>{
  const grid=document.getElementById('playerGrid');
  const modalBody=document.getElementById('playerModalBody');
  if(!grid||!modalBody)return;

  const key=(value='')=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const safe=(value='')=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const numeric=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?Number(value):null;
  const one=value=>{const number=numeric(value);return number===null?'N/A':number.toFixed(1);};
  const whole=value=>{const number=numeric(value);return number===null?'N/A':String(Math.round(number));};
  const percent=value=>{const number=numeric(value);return number===null?'N/A':`${(Math.abs(number)<=1?number*100:number).toFixed(1)}%`;};
  const kitchenUrl=(name,category='',anchor='stat-kitchen')=>`/stat-kitchen.html?player=${encodeURIComponent(name)}${category?`&category=${encodeURIComponent(category)}`:''}#${anchor}`;
  const weeklyAwards=Array.isArray(window.STAT_KITCHEN_WEEKLY_AWARDS)?window.STAT_KITCHEN_WEEKLY_AWARDS:[];
  const snapshotByName=new Map();
  const leadersByName=new Map();
  const weeklyByName=new Map();
  let modalTimer=null;
  let cardTimer=null;

  weeklyAwards.forEach(week=>{
    ['east','west'].forEach(side=>{
      const player=week?.[side];
      if(!player?.name)return;
      const playerKey=key(player.name);
      if(!weeklyByName.has(playerKey))weeklyByName.set(playerKey,[]);
      weeklyByName.get(playerKey).push({week:week.week,dates:week.dates,conference:side==='east'?'Eastern':'Western',team:player.team,line:player.line});
    });
  });

  function cardName(card){return card.querySelector('.player-card-name')?.textContent?.trim()||card.querySelector('.player-card-copy strong')?.textContent?.trim()||'';}
  function playerConnections(name){return {weekly:weeklyByName.get(key(name))||[],leaders:leadersByName.get(key(name))||[]};}
  function connectionLabel(name){
    const {weekly,leaders}=playerConnections(name),parts=[];
    if(weekly.length)parts.push(`${weekly.length}× POTW`);
    if(leaders.length){const best=[...leaders].sort((a,b)=>a.rank-b.rank)[0];parts.push(`#${best.rank} ${best.label.toUpperCase()}`);}
    return parts.join(' · ');
  }

  function decorateCards(){
    grid.querySelectorAll('.player-card[data-player-id]').forEach(card=>{
      const name=cardName(card),copy=card.querySelector('.player-card-copy');
      if(!name||!copy)return;
      const label=connectionLabel(name);
      let badge=copy.querySelector('.player-card-kitchen-badge');
      if(!label){badge?.remove();return;}
      if(!badge){badge=document.createElement('span');badge.className='player-card-kitchen-badge';copy.appendChild(badge);}
      if(badge.textContent!==label)badge.textContent=label;
      badge.setAttribute('aria-label',`Stat Kitchen: ${label}`);
    });
  }

  function setText(node,value){if(node&&node.textContent!==value)node.textContent=value;}
  function syncExistingMetrics(row){
    if(!row)return;
    const metrics=[...modalBody.querySelectorAll('.why-metric')];
    if(metrics.length<2)return;
    const per=numeric(row.per),ts=numeric(row.tsPct);
    setText(metrics[0].querySelector('strong'),per===null?'N/A':per.toFixed(1));
    setText(metrics[1].querySelector('strong'),percent(ts));
    setText(metrics[0].querySelector('small'),per===null?'PER · not published for this season yet':'PER · per-minute all-around production');
    setText(metrics[1].querySelector('small'),ts===null?'TS% · not published for this season yet':'TS% · scoring efficiency across 2s, 3s + free throws');
    metrics[0].classList.toggle('metric-unavailable',per===null);
    metrics[1].classList.toggle('metric-unavailable',ts===null);
  }

  function seasonMarkup(row){
    if(!row)return '';
    const stats=[['G',whole(row.games)],['MIN',one(row.minutes)],['PTS',one(row.ppg)],['REB',one(row.rpg)],['AST',one(row.apg)],['STL',one(row.spg)],['BLK',one(row.bpg)],['TO',one(row.topg)]];
    const grade=row.letter&&row.letter!=='NR'?`${row.letter}${numeric(row.score)!==null?` · ${Math.round(Number(row.score))}`:''}`:'N/A';
    return `<div class="playerpedia-season-grid">${stats.map(([label,value])=>`<div><span>${label}</span><strong>${safe(value)}</strong></div>`).join('')}</div><div class="playerpedia-efficiency-row"><div><span>PER</span><strong>${safe(numeric(row.per)===null?'N/A':Number(row.per).toFixed(1))}</strong></div><div><span>TRUE SHOOTING</span><strong>${safe(percent(row.tsPct))}</strong></div><div><span>W GRADE</span><strong>${safe(grade)}</strong></div></div>`;
  }

  function kitchenMarkup(name,connections){
    if(!connections.weekly.length&&!connections.leaders.length)return '';
    const weekly=connections.weekly.length?`<a class="playerpedia-kitchen-connection" href="${safe(kitchenUrl(name,'','weekly-heat-check'))}"><span>PLAYER OF THE WEEK</span><strong>${connections.weekly.length} ${connections.weekly.length===1?'win':'wins'}</strong><small>${connections.weekly.map(item=>`Week ${item.week} · ${item.conference}`).join(' • ')}</small></a>`:'';
    const leaders=connections.leaders.map(item=>`<a class="playerpedia-kitchen-connection" href="${safe(kitchenUrl(name,item.category))}"><span>LEAGUE TOP FIVE</span><strong>#${safe(item.rank)} ${safe(item.label)}</strong><small>${safe(one(item.value))} ${safe(item.unit)}</small></a>`).join('');
    return `<div class="playerpedia-kitchen-connections"><div class="playerpedia-connected-heading"><div><span>CONNECTED TO THE STAT KITCHEN</span><strong>Where ${safe(name)} is cooking</strong></div><a href="${safe(kitchenUrl(name,connections.leaders[0]?.category||'',connections.leaders.length?'stat-kitchen':'weekly-heat-check'))}">Open the full board →</a></div><div class="playerpedia-kitchen-grid">${weekly}${leaders}</div></div>`;
  }

  function decorateModal(){
    if(modalBody.querySelector('.profile-loading'))return;
    const title=modalBody.querySelector('#playerModalTitle');
    const name=title?.textContent?.trim()||'';
    if(!name||name==='Loading…')return;
    const row=snapshotByName.get(key(name));
    const connections=playerConnections(name);
    syncExistingMetrics(row);
    if(!row&&!connections.weekly.length&&!connections.leaders.length)return;
    const signature=JSON.stringify({name:key(name),row,weekly:connections.weekly,leaders:connections.leaders});
    let section=modalBody.querySelector('.playerpedia-connected-stats');
    if(section?.dataset.signature===signature)return;
    if(!section){
      section=document.createElement('section');
      section.className='playerpedia-connected-stats';
      const facts=modalBody.querySelector('.profile-facts');
      if(facts)facts.insertAdjacentElement('afterend',section);else modalBody.appendChild(section);
    }
    section.dataset.signature=signature;
    section.innerHTML=`<div class="playerpedia-connected-heading"><div><span>2026 SEASON SNAPSHOT</span><strong>The current numbers</strong></div>${row?.team?`<small>${safe(row.team)}</small>`:''}</div>${seasonMarkup(row)}${kitchenMarkup(name,connections)}<p class="playerpedia-connected-source">Official WNBA season averages refresh automatically. Advanced values appear when the season source publishes them.</p>`;
  }

  function scheduleCards(){clearTimeout(cardTimer);cardTimer=setTimeout(decorateCards,50);}
  function scheduleModal(){clearTimeout(modalTimer);modalTimer=setTimeout(decorateModal,70);}

  function collectLeaders(payload={}){
    Object.entries(payload.categories||{}).forEach(([category,details])=>{
      (details.leaders||[]).forEach(player=>{
        const playerKey=key(player.name);
        if(!playerKey)return;
        if(!leadersByName.has(playerKey))leadersByName.set(playerKey,[]);
        leadersByName.get(playerKey).push({category,label:details.label||category,unit:details.unit||'',rank:player.rank,value:player.value});
      });
    });
  }

  async function loadConnections(){
    const [snapshotResult,leaderResult]=await Promise.allSettled([
      fetch('/api/player-season-snapshot?season=2026&playerpedia=connected-v1',{headers:{Accept:'application/json'},cache:'no-store'}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Season snapshot unavailable');return payload;}),
      fetch('/api/leaderboard?season=2026&playerpedia=connected-v1',{headers:{Accept:'application/json'},cache:'no-store'}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Leaderboard unavailable');return payload;})
    ]);
    if(snapshotResult.status==='fulfilled'){
      (snapshotResult.value.players||[]).forEach(player=>snapshotByName.set(key(player.name),player));
    }
    if(leaderResult.status==='fulfilled')collectLeaders(leaderResult.value);
    decorateCards();
    decorateModal();
  }

  new MutationObserver(scheduleCards).observe(grid,{childList:true,subtree:true});
  new MutationObserver(scheduleModal).observe(modalBody,{childList:true,subtree:true});
  decorateCards();
  loadConnections().catch(()=>{decorateCards();decorateModal();});
})();
