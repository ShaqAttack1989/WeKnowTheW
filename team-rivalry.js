(()=>{
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));
  const teamSlug=new URLSearchParams(location.search).get('team')||'';
  if(!teamSlug||teamSlug==='cleveland-sirens')return;

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='/rivalry.css?v=20260823-v5';
  document.head.appendChild(css);

  function label(p){
    if(p<=35)return 'You own this stop';
    if(p<=50)return 'Light traffic';
    if(p<=60)return 'Rush hour';
    if(p<=70)return 'Uphill transfer';
    return 'Service disruption';
  }

  function ensureSection(){
    let section=document.getElementById('head-to-head');
    if(section)return section;
    const live=document.getElementById('whats-happening');
    if(!live)return null;
    section=document.createElement('section');
    section.className='team-content team-rivalry-section';
    section.id='head-to-head';
    section.innerHTML='<div class="team-section-heading"><p class="kicker">NO LOVE LOST · HEAD TO HEAD</p><h2>Who has the upper hand?</h2><p>2026 season series beside the all-time franchise line. The Struggle Meter measures how much of the historical matchup has gone the other way.</p></div><div id="teamRivalryBody" class="team-rivalry-table"><div class="page-note"><strong>Loading rivalry history…</strong><p>Checking the current season and franchise series.</p></div></div><div class="dream-source-row"><a href="/no-love-lost.html">Open the league rivalry board →</a><a href="https://www.espn.com/wnba/schedule" target="_blank" rel="noopener">Schedule cross-check ↗</a></div>';
    live.insertAdjacentElement('afterend',section);
    const nav=document.querySelector('.team-local-nav-inner');
    if(nav&&!nav.querySelector('a[href="#head-to-head"]')){
      const a=document.createElement('a');
      a.href='#head-to-head';
      a.textContent='Head to head';
      nav.querySelector('a[href="#whats-happening"]')?.insertAdjacentElement('afterend',a);
    }
    return section;
  }

  function render(rows=[]){
    const body=document.getElementById('teamRivalryBody');
    if(!body)return;
    if(!rows.length){
      body.innerHTML='<div class="page-note"><strong>No rivalry rows were returned.</strong><p>The feed loaded, but this franchise did not match the current team list.</p></div>';
      return;
    }
    body.innerHTML=`<div class="team-rivalry-row head"><span>Opponent</span><span>2026</span><span>2026 edge</span><span>All time</span><span>All-time edge</span><span>Struggle meter</span></div>${rows.map(r=>`<div class="team-rivalry-row"><a class="team-rivalry-opponent" href="/team.html?team=${encodeURIComponent(r.opponent.slug)}"><strong>${esc(r.opponent.name)}</strong><span>→</span></a><strong>${r.season.wins}-${r.season.losses}</strong><span>${esc(r.season.edge)}</span><strong>${r.allTime.wins}-${r.allTime.losses}</strong><span>${esc(r.allTime.edge)}</span><div class="struggle-meter"><div class="struggle-track" title="${r.strugglePct}% of all-time meetings are losses"><div class="struggle-fill" style="width:${Math.max(0,Math.min(100,r.strugglePct))}%"></div></div><small>${r.strugglePct}% · ${esc(label(r.strugglePct))}</small></div></div>`).join('')}`;
  }

  const section=ensureSection();
  if(!section)return;

  (async()=>{
    try{
      const cacheBust=Date.now();
      const response=await fetch(`/api/rivalries?season=2026&team=${encodeURIComponent(teamSlug)}&v=20260823-5&cb=${cacheBust}`,{
        headers:{Accept:'application/json','Cache-Control':'no-cache'},
        cache:'no-store'
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(payload.error||'Rivalry history unavailable');
      if(!String(payload.sourceVersion||'').startsWith('20260823-rivalries-v4')){
        throw new Error('A stale rivalry response was blocked. Reload once more to pull the current feed.');
      }
      const rows=Array.isArray(payload.rows)?payload.rows:[];
      const seasonMeetings=rows.reduce((sum,row)=>sum+Number(row?.season?.wins||0)+Number(row?.season?.losses||0),0);
      const seasonGameCount=Number(payload.coverage?.seasonGameCount||0);
      if(seasonGameCount>0&&seasonMeetings===0){
        throw new Error('The current feed returned league games but no matchups for this team, so zero records were suppressed.');
      }
      render(rows);
      if(payload.partial){
        const missing=Array.isArray(payload.coverage?.missingYears)?payload.coverage.missingYears:[];
        const detail=missing.length?`Missing season${missing.length===1?'':'s'}: ${missing.join(', ')}.`:'One or more older season feeds are retrying.';
        document.getElementById('teamRivalryBody')?.insertAdjacentHTML('beforeend',`<div class="page-note"><strong>Historical cross-check is partial.</strong><p>${esc(detail)} The available seasons are still included in the all-time line.</p></div>`);
      }
    }catch(error){
      const body=document.getElementById('teamRivalryBody');
      if(body)body.innerHTML=`<div class="page-note"><strong>Rivalry records are temporarily unavailable.</strong><p>${esc(error.message||'Try again shortly.')}</p><a href="/no-love-lost.html">Open No Love Lost →</a></div>`;
    }
  })();
})();