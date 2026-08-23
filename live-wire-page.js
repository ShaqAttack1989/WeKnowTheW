function wSafe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}
function wShortDate(value=''){
  if(!value)return '';
  const raw=String(value).slice(0,10);
  const iso=/^\d{4}-\d{2}-\d{2}$/.test(raw)?raw:(()=>{const m=String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})/);return m?`${m[3]}-${m[1]}-${m[2]}`:raw;})();
  const d=new Date(`${iso}T12:00:00`);
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
function availabilityRow(item={},extraClass=''){
  const team=wTeam(item.team);
  const identity=[item.player||'Player',team].filter(Boolean).join(' · ');
  const asOf=item.updated?` <span class="wire-asof">as of ${wSafe(wShortDate(item.updated))}</span>`:'';
  const expected=item.returnDate?` · expected ${wSafe(wShortDate(item.returnDate))}`:'';
  const context=[item.matchup,item.gameTime].filter(Boolean).join(' · ');
  const source=item.crossCheckOnly?'<small class="wire-source-note">Cross-check feed, team is outside the current official report window</small>':item.seasonLongCarryover?'<small class="wire-source-note">Season-long absence carried from an official/team source</small>':'';
  return `<article class="wire-row availability-row ${extraClass}">
    <span class="wire-status ${wClass(item.status||'status')}">${wSafe(item.status||'STATUS')}</span>
    <div class="wire-copy">
      <strong>${wSafe(identity)}</strong>
      <p>${wSafe(item.reason||'Availability update')}${asOf}${expected}</p>
      ${context?`<small class="wire-report-context">${wSafe(context)}</small>`:''}${source}
    </div>
  </article>`;
}
function submissionRow(item={}){
  const context=[item.matchup,item.gameTime].filter(Boolean).join(' · ');
  return `<article class="wire-row availability-row submission-row">
    <span class="wire-status not-yet-submitted">NOT SUBMITTED</span>
    <div class="wire-copy"><strong>${wSafe(item.team||'Team')}</strong><p>The official WNBA report has not yet been submitted for this team.</p>${context?`<small class="wire-report-context">${wSafe(context)}</small>`:''}</div>
  </article>`;
}
function sectionLabel(title,copy=''){
  return `<div class="wire-section-label"><strong>${wSafe(title)}</strong>${copy?`<span>${wSafe(copy)}</span>`:''}</div>`;
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
      const items=Array.isArray(p.injuries)?p.injuries.filter(visibleInjury):[];
      const officialItems=items.filter(item=>item.officialCurrentReport);
      const additionalItems=items.filter(item=>!item.officialCurrentReport);
      const submissions=Array.isArray(p.teamStatuses)?p.teamStatuses:[];
      if(updated)updated.textContent=`Checked ${wChecked(p.checkedAt)||'recently'} · every 30 min`;
      let html='';
      html+=sectionLabel('CURRENT OFFICIAL WNBA REPORT',p.reportLabel||wShortDate(p.latestReportDate)||'Latest available PDF');
      html+=officialItems.length?officialItems.map(item=>availabilityRow(item,'official-report-row')).join(''):'<div class="wire-empty"><strong>No named players in the current official report.</strong></div>';
      if(submissions.length){
        html+=sectionLabel('TEAM REPORT STATUS','Teams whose official report is still pending');
        html+=submissions.map(submissionRow).join('');
      }
      if(additionalItems.length){
        html+=sectionLabel('ADDITIONAL TRACKED ABSENCES','Teams outside the current report window');
        html+=additionalItems.map(item=>availabilityRow(item,'additional-report-row')).join('');
      }
      list.innerHTML=html;
      const reportHref=p.officialPdf||p.officialSource||'https://www.wnba.com/wnba-injury-report';
      const reportLabel=p.officialPdfLive?'latest official PDF ↗':'official WNBA Injury Report ↗';
      if(status){status.hidden=false;status.innerHTML=`${officialItems.length} named players in the latest official report · ${submissions.length} team reports pending · <a href="${wSafe(reportHref)}" target="_blank" rel="noopener noreferrer">${reportLabel}</a>`;}
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
