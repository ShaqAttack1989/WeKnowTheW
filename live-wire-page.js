function wSafe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}
function wShortDate(value=''){
  if(!value)return '';
  const d=new Date(String(value).slice(0,10)+'T12:00:00');
  return Number.isNaN(d.getTime())?String(value):d.toLocaleDateString([],{month:'short',day:'numeric'});
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
      const items=Array.isArray(p.injuries)
        ? [...p.injuries].filter(visibleInjury).sort((a,b)=>String(b.updated||'').localeCompare(String(a.updated||''))||String(a.player||'').localeCompare(String(b.player||'')))
        : [];
      if(updated)updated.textContent=`Checked ${wChecked(p.checkedAt)||'recently'} · every 30 min`;
      list.innerHTML=items.length?items.map(item=>{
        const team=wTeam(item.team);
        const identity=[item.player||'Player',team].filter(Boolean).join(' · ');
        const asOf=item.updated?` <span class="wire-asof">as of ${wSafe(wShortDate(item.updated))}</span>`:'';
        const expected=item.returnDate?` · expected ${wSafe(wShortDate(item.returnDate))}`:'';
        return `<article class="wire-row availability-row">
          <span class="wire-status ${wClass(item.status||'status')}">${wSafe(item.status||'STATUS')}</span>
          <div class="wire-copy">
            <strong>${wSafe(identity)}</strong>
            <p>${wSafe(item.reason||'Availability update')}${asOf}${expected}</p>
          </div>
        </article>`;
      }).join(''):'<div class="wire-empty"><strong>No current availability updates returned.</strong></div>';
      if(status){status.hidden=false;status.innerHTML=`${items.length} current entries · latest source date ${wSafe(wShortDate(p.latestReportDate)||'current')} · checks every 30 minutes · <a href="https://www.wnba.com/wnba-injury-report" target="_blank" rel="noopener noreferrer">official WNBA Injury Report ↗</a>`;}
    }else{
      const items=Array.isArray(p.transactions)?p.transactions:[];
      if(updated)updated.textContent=`Checked ${wChecked(p.checkedAt)||'recently'} · newest move ${wShortDate(p.latestTransactionDate)||'—'}`;
      list.innerHTML=items.length?items.map(item=>{
        const team=wTeam(item.team);
        const identity=[item.player||'Player',team].filter(Boolean).join(' · ');
        const type=String(item.type||'UPDATE');
        const cross=item.rosterCheck?`<small class="wire-crosscheck">${wSafe(item.rosterCheck)}</small>`:'';
        return `<article class="wire-row movement-row">
          <span class="wire-date">${wSafe(wShortDate(item.date))}</span>
          <div class="wire-copy">
            <span class="wire-chip ${wClass(type)}">${wSafe(type)}</span>
            <strong>${wSafe(identity)}</strong>
            <p>${wSafe(item.detail||'Roster update')}</p>${cross}
          </div>
        </article>`;
      }).join(''):'<div class="wire-empty"><strong>No recent player movement returned.</strong></div>';
      if(status){status.hidden=false;status.innerHTML=`${items.length} recent transactions · newest transaction ${wSafe(wShortDate(p.latestTransactionDate)||'—')} · automatic check every 24 hours · <a href="https://www.wnba.com/players/transactions?transaction=&team=all&month=0" target="_blank" rel="noopener noreferrer">official WNBA Transactions ↗</a>`;}
    }
  }catch(error){
    if(updated)updated.textContent='Refresh check failed';
    list.innerHTML='<div class="wire-empty"><strong>Live player feed unavailable.</strong><p>Try again shortly.</p></div>';
    if(status){status.hidden=false;status.textContent='Live feed temporarily unavailable';}
  }
})();
