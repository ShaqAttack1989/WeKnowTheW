(()=>{
  const root=document.getElementById('dreamTeamUpdates');
  if(!root||!window.WTeamUpdates)return;

  const esc=(value='')=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const slug=new URLSearchParams(location.search).get('team')||'';
  if(slug==='cleveland-sirens')return;
  const teamData=typeof teamBySlug==='function'?teamBySlug(slug):null;
  const teamName=teamData?.name||document.getElementById('teamName')?.textContent||'';
  if(!teamName)return;

  const heading=document.querySelector('.dream-roster-wire .dream-panel-heading span');
  const title=document.getElementById('dreamRosterWireHeading');
  const fullLink=document.querySelector('.dream-roster-wire .dream-panel-heading a');
  if(heading)heading.textContent='ROSTER · AVAILABILITY · STORIES';
  if(title)title.textContent='The latest team updates';
  if(fullLink){fullLink.textContent='Full report →';fullLink.href=`/team-season-report.html?team=${encodeURIComponent(slug)}`;}

  const shortDate=value=>{
    const iso=String(value||'').slice(0,10);
    const date=new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso)?`${iso}T12:00:00`:value);
    return Number.isNaN(date.getTime())?'Current':new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(date);
  };
  const checked=value=>{
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return '';
    return new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(date)+' ET';
  };
  function card(item){
    const href=item.href||'';
    const content=`<div><span>${esc(item.kind||'UPDATE')}</span><time datetime="${esc(item.date||'')}">${esc(shortDate(item.date))}</time></div><strong>${esc(item.title||'Team update')}</strong><p>${esc(item.detail||'')}</p><small>${esc(item.category==='story'?'We Know the W story':item.category==='movement'?'Player Movement':'Availability')}</small>`;
    return href?`<article class="team-update-card team-update-${esc(item.category||'update')}"><a class="team-update-card-link" href="${esc(href)}">${content}</a></article>`:`<article class="team-update-card">${content}</article>`;
  }
  async function refresh(){
    try{
      const result=await WTeamUpdates.loadTeamUpdates(teamName,slug);
      const updates=result.dashboard||[];
      root.innerHTML=updates.length?updates.map(card).join(''):`<div class="dream-wire-clear"><span aria-hidden="true">✓</span><div><strong>No current ${esc(teamName)} updates are loaded.</strong><p>Use the full report to review the 2026 season archive.</p></div></div>`;
      const oldSource=root.parentElement?.querySelector('.team-availability-source');
      if(oldSource)oldSource.remove();
      const source=document.createElement('div');
      source.className='team-availability-source';
      source.innerHTML=`Newest updates first · roster movement · availability · site stories${result.checkedAt?` · checked ${esc(checked(result.checkedAt))}`:''} · <a href="/team-season-report.html?team=${encodeURIComponent(slug)}">full report →</a>`;
      root.insertAdjacentElement('afterend',source);
    }catch(error){
      root.innerHTML=`<div class="team-error">The team update desk is temporarily unavailable. <a href="/team-season-report.html?team=${encodeURIComponent(slug)}">Open the full report →</a></div>`;
    }
  }
  refresh();
  setInterval(()=>{if(!document.hidden)refresh();},30*60*1000);
  window.addEventListener('focus',refresh);
})();