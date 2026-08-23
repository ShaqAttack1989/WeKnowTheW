(function(){
  const root=document.getElementById('dreamTeamUpdates');
  if(!root)return;
  const esc=(value='')=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm=(value='')=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const slug=new URLSearchParams(location.search).get('team')||'';
  if(slug==='cleveland-sirens')return;
  const teamName=(typeof MASCOT_TEAMS!=='undefined'&&MASCOT_TEAMS[slug]?.team)||document.getElementById('teamName')?.textContent||'';
  if(!teamName)return;

  let applying=false;
  let authoritativeHtml='';
  const shortDate=value=>{
    const raw=String(value||'').slice(0,10);
    const iso=/^\d{4}-\d{2}-\d{2}$/.test(raw)?raw:(()=>{const m=String(value||'').match(/^(\d{2})\/(\d{2})\/(\d{4})/);return m?`${m[3]}-${m[1]}-${m[2]}`:'';})();
    if(!iso)return 'Current';
    const date=new Date(`${iso}T12:00:00`);
    return Number.isNaN(date.getTime())?'Current':new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(date);
  };
  const checked=value=>{
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return '';
    return new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(date)+' ET';
  };
  function card(item){
    return `<article><div><span>${esc(item.kind)}</span><time>${esc(item.date||'Current')}</time></div><strong>${esc(item.player)}</strong><p>${esc(item.detail)}</p>${item.context?`<small>${esc(item.context)}</small>`:''}</article>`;
  }
  function apply(html){
    authoritativeHtml=html;
    applying=true;
    root.innerHTML=html;
    queueMicrotask(()=>{applying=false;});
  }
  const observer=new MutationObserver(()=>{
    if(!applying&&authoritativeHtml&&root.innerHTML!==authoritativeHtml)apply(authoritativeHtml);
  });
  observer.observe(root,{childList:true,subtree:true});

  async function refresh(){
    try{
      const [availabilityResponse,movementResponse]=await Promise.all([
        fetch('/api/availability',{headers:{Accept:'application/json'},cache:'no-store'}),
        fetch('/api/player-movement',{headers:{Accept:'application/json'},cache:'no-store'})
      ]);
      const availability=await availabilityResponse.json().catch(()=>({}));
      const movement=await movementResponse.json().catch(()=>({}));
      if(!availabilityResponse.ok)throw new Error(availability.error||'Availability unavailable');

      const teamKey=norm(teamName);
      const pending=(Array.isArray(availability.teamStatuses)?availability.teamStatuses:[]).find(item=>norm(item.team)===teamKey);
      const injuries=(Array.isArray(availability.injuries)?availability.injuries:[])
        .filter(item=>norm(item.team)===teamKey&&!['AVAILABLE','ACTIVE','CLEARED'].includes(String(item.status||'').toUpperCase()))
        .map(item=>({
          kind:item.status||'Availability',
          player:item.player||'Player update',
          detail:item.reason||'Availability update',
          date:shortDate(item.updated||item.gameDate),
          context:[item.matchup,item.gameTime].filter(Boolean).join(' · '),
          priority:item.officialCurrentReport?0:1
        }))
        .sort((a,b)=>a.priority-b.priority||a.player.localeCompare(b.player));
      const transactions=(Array.isArray(movement.transactions)?movement.transactions:[])
        .filter(item=>norm(item.team)===teamKey)
        .slice(0,2)
        .map(item=>({kind:item.type||'Movement',player:item.player||'Team update',detail:item.detail||'Roster update',date:shortDate(item.date),context:'Player Movement',priority:2}));

      let html='';
      if(pending){
        html+=`<article class="team-availability-pending"><div><span>OFFICIAL REPORT</span><time>${esc(shortDate(pending.gameDate))}</time></div><strong>${esc(teamName)} · NOT YET SUBMITTED</strong><p>The WNBA has not yet received this team’s official availability report for ${esc(pending.matchup||'the upcoming game')}.</p></article>`;
      }
      const updates=[...injuries,...transactions].slice(0,6);
      html+=updates.map(card).join('');
      if(!html){
        html=`<div class="dream-wire-clear"><span aria-hidden="true">✓</span><div><strong>No active ${esc(teamName)} availability entries in the current official report.</strong><p>The team box checks the same WNBA report as the full Availability page every 30 minutes.</p></div></div>`;
      }
      const source=`<div class="team-availability-source">Official availability ${availability.reportLabel?`· ${esc(availability.reportLabel)}`:''}${availability.checkedAt?` · checked ${esc(checked(availability.checkedAt))}`:''} · <a href="/availability-report.html">full report →</a></div>`;
      apply(html+source);
    }catch(error){
      if(!authoritativeHtml)apply(`<div class="team-error">The official availability feed is temporarily unavailable. <a href="/availability-report.html">Open the full report →</a></div>`);
    }
  }

  setTimeout(refresh,250);
  setInterval(refresh,30*60*1000);
})();
