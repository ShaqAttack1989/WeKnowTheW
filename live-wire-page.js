function wSafe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}
function wShortDate(value=''){
  if(!value)return '';
  const raw=String(value).slice(0,10);
  const iso=/^\d{4}-\d{2}-\d{2}$/.test(raw)?raw:(()=>{const m=String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})/);return m?`${m[3]}-${m[1]}-${m[2]}`:raw;})();
  const d=new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime())?String(value):d.toLocaleDateString([],{month:'short',day:'numeric'});
}
function wIsoDate(value=''){
  const raw=String(value||'').slice(0,10);
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw))return raw;
  const m=String(value||'').match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  return m?`${m[3]}-${m[1]}-${m[2]}`:'';
}
function wItemDate(item={}){
  return wIsoDate(item.updated||item.gameDate||item.date||'');
}
function wClass(value=''){
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
function wChecked(value=''){
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return '';
  return new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(d)+' ET';
}
function wTeam(value=''){
  const team=String(value||'').trim();
  return team&&!/^WNBA$/i.test(team)?team:'';
}
function visibleInjury(item={}){
  const status=String(item.status||'').toUpperCase();
  return !['AVAILABLE','ACTIVE','CLEARED'].includes(status);
}
function availabilityRow(item={},extraClass=''){
  const team=wTeam(item.team);
  const identity=[item.player||'Player',team].filter(Boolean).join(' · ');
  const date=wShortDate(item.updated||item.gameDate||'');
  const expected=item.returnDate?` · expected ${wSafe(wShortDate(item.returnDate))}`:'';
  const context=[date,item.matchup,item.gameTime].filter(Boolean).join(' · ');
  return `<article class="wire-row availability-row ${extraClass}">
    <span class="wire-status ${wClass(item.status||'status')}">${wSafe(item.status||'STATUS')}</span>
    <div class="wire-copy">
      <strong>${wSafe(identity)}</strong>
      <p>${wSafe(item.reason||'Availability update')}${expected}</p>
      ${context?`<small class="wire-report-context">${wSafe(context)}</small>`:''}
    </div>
  </article>`;
}

(async()=>{
  const mode=document.body.dataset.wirePage||'movement';
  const list=document.getElementById('wireList');
  const status=document.getElementById('wireStatus');
  const updated=document.getElementById('wireUpdated');
  const endpoint=mode==='availability'?'/api/availability':'/api/player-movement';
  try{
    const r=await fetch(endpoint,{headers:{Accept:'application/json'},cache:'no-store'});
    const p=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(p.error||'Live player feed unavailable');

    if(mode==='availability'){
      const items=(Array.isArray(p.injuries)?p.injuries.filter(visibleInjury):[])
        .sort((a,b)=>wItemDate(b).localeCompare(wItemDate(a))||String(a.player||'').localeCompare(String(b.player||'')));
      if(updated)updated.textContent=`Checked ${wChecked(p.checkedAt)||'recently'} · newest update ${wShortDate(items[0]?.updated||items[0]?.gameDate)||'—'} · every 30 min`;
      list.innerHTML=items.length?items.map(item=>availabilityRow(item,item.seasonLongCarryover?'season-long-row':item.officialCurrentReport?'official-report-row':'additional-report-row')).join(''):'<div class="wire-empty"><strong>No current availability entries returned.</strong></div>';
      const reportHref=p.officialPdf||p.officialSource||'https://www.wnba.com/wnba-injury-report';
      const reportLabel=p.officialPdfLive?'latest official PDF ↗':'official WNBA Injury Report ↗';
      const seasonLong=items.filter(item=>String(item.status||'').toUpperCase().includes('SEASON')).length;
      if(status){status.hidden=false;status.innerHTML=`${items.length} tracked player availability updates · ${seasonLong} season-ending absences preserved · newest first · <a href="${wSafe(reportHref)}" target="_blank" rel="noopener noreferrer">${reportLabel}</a>`;}
    }else{
      const items=(Array.isArray(p.transactions)?p.transactions:[])
        .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(a.player||'').localeCompare(String(b.player||'')));
      if(updated)updated.textContent=`Checked ${wChecked(p.checkedAt)||'recently'} · newest move ${wShortDate(p.latestTransactionDate)||'—'}`;
      list.innerHTML=items.length?items.map(item=>{
        const team=wTeam(item.team);
        const identity=[item.player||'Player',team].filter(Boolean).join(' · ');
        const type=String(item.type||'UPDATE');
        return `<article class="wire-row movement-row">
          <span class="wire-date">${wSafe(wShortDate(item.date))}</span>
          <div class="wire-copy">
            <span class="wire-chip ${wClass(type)}">${wSafe(type)}</span>
            <strong>${wSafe(identity)}</strong>
            <p>${wSafe(item.detail||'Roster update')}</p>
          </div>
        </article>`;
      }).join(''):'<div class="wire-empty"><strong>No recent player movement returned.</strong></div>';
      if(status){status.hidden=false;status.innerHTML=`${items.length} recent transactions · newest transaction ${wSafe(wShortDate(p.latestTransactionDate)||'—')} · newest first · <a href="https://www.wnba.com/players/transactions?transaction=&team=all&month=0" target="_blank" rel="noopener noreferrer">official WNBA Transactions ↗</a>`;}
    }
  }catch(error){
    if(updated)updated.textContent='Refresh check failed';
    list.innerHTML='<div class="wire-empty"><strong>Live player feed unavailable.</strong><p>Try again shortly.</p></div>';
    if(status){status.hidden=false;status.textContent='Live feed temporarily unavailable';}
  }
})();
