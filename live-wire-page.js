function wSafe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}
function wShortDate(value=''){
  if(!value)return '';
  const d=new Date(String(value).slice(0,10)+'T12:00:00');
  return Number.isNaN(d.getTime())?String(value):d.toLocaleDateString([],{month:'short',day:'numeric'});
}
function wClass(value=''){
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
function wPageDate(){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric'}).format(new Date());
  return parts;
}
function wTeam(value=''){
  const team=String(value||'').trim();
  return team&&!/^WNBA$/i.test(team)?team:'';
}
function statusWeight(value=''){return value==='OUT FOR SEASON'?0:value==='OUT'?1:value==='DAY TO DAY'?2:3;}

(async()=>{
  const mode=document.body.dataset.wirePage||'movement';
  const list=document.getElementById('wireList');
  const status=document.getElementById('wireStatus');
  const updated=document.getElementById('wireUpdated');
  if(updated)updated.textContent=`Updated ${wPageDate()}`;
  try{
    const r=await fetch('/api/players',{headers:{Accept:'application/json'},cache:'no-store'});
    const p=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(p.error||'Live player feed unavailable');

    if(mode==='availability'){
      const items=Array.isArray(p.injuries)?[...p.injuries].sort((a,b)=>statusWeight(a.status)-statusWeight(b.status)||String(b.updated||'').localeCompare(String(a.updated||''))):[];
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
      if(status)status.textContent=`${items.length} availability updates · live feed connected`;
    }else{
      const items=Array.isArray(p.transactions)?p.transactions:[];
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
      if(status)status.textContent=`${items.length} roster transactions · live feed connected`;
    }
  }catch(error){
    list.innerHTML='<div class="wire-empty"><strong>Live player feed unavailable.</strong><p>Try again shortly.</p></div>';
    if(status)status.textContent='Live feed temporarily unavailable';
  }
})();
