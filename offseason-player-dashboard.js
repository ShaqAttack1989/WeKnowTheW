(()=>{
  const safe=(value='')=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const norm=(value='')=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const initials=(value='')=>String(value).trim().split(/\s+/).filter(Boolean).map(part=>part[0]).join('').slice(0,2).toUpperCase();
  const num=value=>value===null||value===undefined||value===''?null:Number(value);
  const format=(value,metric={})=>{
    const n=num(value); if(n===null||Number.isNaN(n)) return '—';
    if(metric.format==='pct1') return `${n.toFixed(metric.decimals??1)}%`;
    if(metric.format==='pct3') return n.toFixed(metric.decimals??3).replace(/^0/,'.');
    if(metric.format==='int') return Math.round(n).toLocaleString();
    return n.toFixed(metric.decimals??1);
  };
  const playerArt=async(players=[])=>{
    const map=new Map();
    try{
      const response=await fetch('/api/players?headshots=transparent-v1',{headers:{Accept:'application/json'}});
      const payload=await response.json().catch(()=>({}));
      if(!response.ok||!Array.isArray(payload.players)) return map;
      payload.players.forEach(player=>{
        const photo=player.officialHeadshot||player.photoCutout||player.photo||player.photoThumb||player.headshot||'';
        if(photo) map.set(norm(player.name),{photo,cutout:Boolean(player.officialHeadshot||player.photoCutout)});
      });
    }catch{}
    players.forEach(player=>{if(player.photo&&!map.has(norm(player.name)))map.set(norm(player.name),{photo:player.photo,cutout:false});});
    return map;
  };
  const leaderFor=(players,metric)=>[...players].filter(player=>num(player[metric.key])!==null&&!Number.isNaN(num(player[metric.key]))).sort((a,b)=>{
    const av=num(a[metric.key]),bv=num(b[metric.key]);
    return metric.sort==='asc'?av-bv:bv-av;
  })[0];
  async function render(root){
    const source=root.dataset.source;
    if(!source)return;
    root.innerHTML='<div class="ps-empty">Loading player dashboard…</div>';
    try{
      const response=await fetch(source,{headers:{Accept:'application/json'},cache:'no-store'});
      const payload=await response.json().catch(()=>({}));
      if(!response.ok||!Array.isArray(payload.players))throw new Error('Player stat data unavailable');
      const players=payload.players;
      const metrics=Array.isArray(payload.metrics)?payload.metrics:[];
      const columns=Array.isArray(payload.tableColumns)&&payload.tableColumns.length?payload.tableColumns:metrics.map(metric=>metric.key);
      const metricMap=new Map(metrics.map(metric=>[metric.key,metric]));
      const art=await playerArt(players);
      const teams=[...new Set(players.map(player=>player.team).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
      let activeKey=payload.defaultMetric||metrics[0]?.key||'';
      let query='';
      let team='';
      const leaderMetrics=(payload.leaderMetrics||metrics.map(metric=>metric.key)).map(key=>metricMap.get(key)).filter(Boolean).slice(0,6);
      root.innerHTML=`
        <div class="ps-source-line"><div><strong>${safe(payload.scopeLabel||`${payload.season||''} ${payload.league||''} player stats`)}</strong><span class="ps-mini-count"> · ${players.length} players</span></div>${payload.sourceUrl?`<a href="${safe(payload.sourceUrl)}" target="_blank" rel="noopener noreferrer">${safe(payload.sourceLabel||'Official source')} ↗</a>`:''}</div>
        <div class="ps-leader-grid">${leaderMetrics.map(metric=>{const leader=leaderFor(players,metric);return `<article class="ps-leader-card"><span>${safe(metric.label)}</span><div><strong>${safe(leader?.name||'—')}</strong><small>${safe(leader?.team||payload.league||'')}</small></div><b>${leader?`${safe(format(leader[metric.key],metric))}${metric.unit?` ${safe(metric.unit)}`:''}`:'—'}</b></article>`}).join('')}</div>
        <div class="ps-controls"><input type="search" data-ps-search placeholder="Search player${teams.length?' or team':''}" aria-label="Search player stats">${teams.length?`<select data-ps-team aria-label="Filter by team"><option value="">All teams</option>${teams.map(item=>`<option value="${safe(item)}">${safe(item)}</option>`).join('')}</select>`:'<div></div>'}</div>
        <div class="ps-metric-tabs" role="tablist" aria-label="Sort player dashboard">${metrics.map((metric,index)=>`<button type="button" role="tab" data-ps-metric="${safe(metric.key)}" aria-selected="${metric.key===activeKey?'true':'false'}"><span>${safe(metric.short||metric.label)}</span>${metric.unit?` · ${safe(metric.unit)}`:''}</button>`).join('')}</div>
        <div class="ps-table-shell"><table class="ps-table"><thead><tr><th>RK</th><th>Player</th>${columns.map(key=>{const metric=metricMap.get(key)||{label:key};return `<th data-ps-head="${safe(key)}">${safe(metric.short||metric.label)}</th>`}).join('')}</tr></thead><tbody data-ps-body></tbody></table></div>
        <p class="ps-footnote">${safe(payload.note||'Stats are organized by We Know the W from the cited public source.')}</p>`;
      const body=root.querySelector('[data-ps-body]');
      const search=root.querySelector('[data-ps-search]');
      const teamSelect=root.querySelector('[data-ps-team]');
      const buttons=[...root.querySelectorAll('[data-ps-metric]')];
      const draw=()=>{
        const active=metricMap.get(activeKey)||metrics[0]||{key:activeKey,sort:'desc'};
        const filtered=players.filter(player=>{
          const text=`${player.name||''} ${player.team||''}`.toLowerCase();
          return (!query||text.includes(query))&&(!team||player.team===team);
        });
        const ranked=[...filtered].sort((a,b)=>{
          const av=num(a[active.key]),bv=num(b[active.key]);
          if(av===null&&bv===null)return String(a.name).localeCompare(String(b.name));
          if(av===null)return 1;if(bv===null)return -1;
          return active.sort==='asc'?av-bv:bv-av;
        });
        root.querySelectorAll('[data-ps-head]').forEach(th=>th.classList.toggle('ps-highlight',th.dataset.psHead===activeKey));
        buttons.forEach(button=>button.setAttribute('aria-selected',String(button.dataset.psMetric===activeKey)));
        body.innerHTML=ranked.length?ranked.map((player,index)=>{
          const media=art.get(norm(player.name));
          const photo=media?.photo||player.photo||'';
          return `<tr><td><span class="ps-rank">${index+1}</span></td><td><div class="ps-player-cell"><span class="ps-player-photo">${photo?`<img class="${media?.cutout?'cutout':''}" src="${safe(photo)}" alt="" loading="lazy" decoding="async" onerror="this.remove();this.parentElement.textContent='${safe(initials(player.name))}'">`:safe(initials(player.name))}</span><span class="ps-player-name"><strong>${safe(player.name)}</strong><small>${safe(player.team||player.detail||payload.league||'')}</small></span></div></td>${columns.map(key=>{const metric=metricMap.get(key)||{};const value=format(player[key],metric);return `<td class="${key===activeKey?'ps-highlight':''} ${value==='—'?'ps-na':''}">${safe(value)}${value!=='—'&&metric.unit?` <small>${safe(metric.unit)}</small>`:''}</td>`}).join('')}</tr>`;
        }).join(''):'<tr><td colspan="99"><div class="ps-empty">No players match this filter.</div></td></tr>';
      };
      search?.addEventListener('input',()=>{query=search.value.trim().toLowerCase();draw();});
      teamSelect?.addEventListener('change',()=>{team=teamSelect.value;draw();});
      buttons.forEach(button=>button.addEventListener('click',()=>{activeKey=button.dataset.psMetric;draw();}));
      draw();
    }catch(error){root.innerHTML='<div class="ps-empty">Player dashboard is temporarily unavailable.</div>';}
  }
  document.querySelectorAll('[data-player-dashboard]').forEach(render);
})();
