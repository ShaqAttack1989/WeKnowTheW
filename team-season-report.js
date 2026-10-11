(()=>{
  const params=new URLSearchParams(location.search);
  const slug=params.get('team')||'';
  const team=typeof teamBySlug==='function'?teamBySlug(slug):null;
  const esc=(value='')=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const title=document.getElementById('reportTeamName');
  const copy=document.getElementById('reportTeamCopy');
  const back=document.getElementById('reportBack');
  const grid=document.getElementById('teamReportGrid');
  const stamp=document.getElementById('reportStamp');
  if(back)back.href=slug?'/team.html?team='+encodeURIComponent(slug):'/around-the-w.html';
  if(!team||!window.WTeamUpdates){
    if(title)title.textContent='Team season report';
    if(grid)grid.innerHTML='<div class="team-report-empty">Choose a current WNBA team from Around the W to open its 2026 update archive.</div>';
    return;
  }
  document.documentElement.style.setProperty('--team-primary',team.primary||'#6c2ad9');
  document.documentElement.style.setProperty('--team-primary-text',team.primary||'#5c1fc1');
  document.title=team.name+' 2026 Team Report | We Know the W';
  if(title)title.textContent=team.name+' · 2026 report';
  if(copy)copy.textContent='Roster movement, availability notes, milestones and We Know the W stories connected to this team, newest first.';
  const fmt=value=>{const iso=String(value||'').slice(0,10);const d=new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso)?iso+'T12:00:00':value);return Number.isNaN(d.getTime())?'Current':d.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'});};
  const card=item=>`<article class="team-report-card" data-category="${esc(item.category||'update')}"><header><span>${esc(item.kind||'UPDATE')}</span><time>${esc(fmt(item.date))}</time></header><h2>${esc(item.title||'Team update')}</h2><p>${esc(item.detail||'')}</p>${item.href?`<a href="${esc(item.href)}">Open source/story →</a>`:''}</article>`;
  let all=[];
  function render(filter='all'){
    const items=filter==='all'?all:all.filter(item=>item.category===filter);
    grid.innerHTML=items.length?items.map(card).join(''):'<div class="team-report-empty">No updates in this category yet.</div>';
  }
  document.querySelectorAll('[data-report-filter]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-report-filter]').forEach(b=>b.classList.toggle('active',b===button));
    render(button.dataset.reportFilter||'all');
  }));
  WTeamUpdates.loadTeamUpdates(team.name,slug).then(result=>{
    all=result.items||[];
    render();
    if(stamp)stamp.textContent=result.checkedAt?'Updated '+new Date(result.checkedAt).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'2026 archive';
  }).catch(()=>{
    grid.innerHTML='<div class="team-report-empty">The season report is reconnecting. Try again shortly.</div>';
  });
})();