(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./team-stat-leaders-model'));
  else {root.WTeamLeadersPage=factory(root.WTeamStatLeaders);root.WTeamLeadersPage.start();}
})(typeof globalThis==='object'?globalThis:this,function(model){
  'use strict';
  const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const initials=name=>name.split(/\s+/).filter(Boolean).map(word=>word[0]).slice(0,2).join('');
  const profile=name=>`/playerpedia.html?view=current&search=${encodeURIComponent(name)}#playerpedia-directory`;
  function cards(result){
    return result.cards.map(card=>`<article class="team-leader-card" data-leader-stat="${safe(card.id)}">
      <header><h3>${safe(card.label)}</h3><span>${safe(card.unit)}</span></header>
      ${card.value===null?`<div class="team-leader-empty">No qualifying player yet.<small>At least 5 team games${card.attempts?` and ${card.attempts} attempts`:''}.</small></div>`:
      `<div class="team-leader-value">${(card.value*(card.attempts?100:1)).toFixed(1)}${card.attempts?'<span>%</span>':''}<small>${card.leaders.length>1?`${card.leaders.length} co-leaders`:'Team leader'}</small></div>
      <div class="team-leader-players">${card.leaders.map(player=>`<a class="team-leader-player" href="${profile(player.name)}"><span class="team-leader-photo"><span aria-hidden="true">${safe(initials(player.name))}</span>${/^https?:\/\//i.test(player.photo)?`<img src="${safe(player.photo)}" alt="${safe(player.name)}" width="76" height="76" loading="lazy" decoding="async">`:''}</span><span class="team-leader-name"><strong>${safe(player.name)}</strong><small>${player.games} games with this team${card.attempts?` · ${player.total}/${player.attempts}`:''}</small>${player.availability?`<em class="team-leader-availability">${safe(player.availability)}</em>`:''}<b>Playerpedia →</b></span></a>`).join('')}</div>`}
    </article>`).join('');
  }
  function dateLabel(value){
    const date=new Date(value);
    return Number.isNaN(date.getTime())?'date unavailable':new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(date);
  }
  async function request(url){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),14000);
    try{const response=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error('Feed unavailable');return await response.json();}
    finally{clearTimeout(timer);}
  }
  function bounded(promise){
    let timer;
    const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Roster timeout')),16000);});
    return Promise.race([promise,timeout]).finally(()=>clearTimeout(timer));
  }
  function start(){
    const section=document.getElementById('team-stat-leaders');
    if(!section)return;
    const slug=new URLSearchParams(location.search).get('team');
    const club=typeof teamBySlug==='function'?teamBySlug(slug):null;
    if(!club){section.hidden=true;return;}
    const grid=document.getElementById('teamLeadersGrid'),status=document.getElementById('teamLeadersStatus'),refresh=document.getElementById('teamLeadersRefresh');
    document.getElementById('teamLeadersTitle').textContent=`${club.name}: team stat leaders`;
    document.getElementById('teamLeadersPlayerpedia').href=`/playerpedia.html?view=current&team=${encodeURIComponent(club.name)}#playerpedia-directory`;
    if(!model.codes[model.key(club.name)]){
      document.getElementById('teamLeadersScope').textContent='Expansion franchise · No WNBA season statistics yet.';
      grid.innerHTML='<div class="team-leaders-message"><strong>The first leaders are still ahead.</strong><p>This board will begin with the franchise’s first regular-season games.</p></div>';
      status.textContent='No player statistics to rank yet.';refresh.hidden=true;document.getElementById('teamLeadersRules').hidden=true;section.setAttribute('aria-busy','false');return;
    }
    let loading=false,lastSuccessful=false,lastAttempt=0;
    async function load(initial=false){
      if(loading)return;loading=true;lastAttempt=Date.now();refresh.disabled=true;
      section.setAttribute('aria-busy','true');status.textContent=lastSuccessful?'Refreshing team leaders…':'Checking season statistics and the current roster…';
      try{
        const rosterRequest=initial&&root.WTeamRosterRequest?root.WTeamRosterRequest:request('/api/players?team-leaders=20260827');
        const [totals,roster]=await Promise.all([request('/api/team-player-totals?season=2026'),bounded(rosterRequest)]);
        if(!Array.isArray(totals.players)||!Array.isArray(roster.players))throw new Error('Incomplete feed');
        const result=model.build(club.name,totals.players,roster.players,roster.injuries||[]);
        if(!result.rosterCount)throw new Error('Roster unavailable');
        grid.innerHTML=cards(result);lastSuccessful=true;
        const check=dateLabel(totals.checkedAt);
        status.textContent=totals.stale?`Using saved statistics checked ${check}; the statistics source is temporarily unavailable.`:`Statistics checked ${check} · Refreshes automatically every 30 minutes.`;
        document.getElementById('teamLeadersCoverage').textContent=`${result.matchedCount} of ${result.rosterCount} current roster members have recorded statistics with this team. Roster checked ${dateLabel(roster.rosterCheckedAt||roster.updatedAt)}.`;
        section.classList.toggle('team-leaders-stale',Boolean(totals.stale));
      }catch{
        status.textContent=lastSuccessful?'Refresh unavailable. The last successfully checked leaders remain below.':'Team leaders are temporarily unavailable. Please try Refresh again.';
        section.classList.add('team-leaders-stale');
        if(!lastSuccessful)grid.innerHTML='<div class="team-leaders-message"><strong>We could not confirm the current leaders.</strong><p>The roster and statistics must both be available before we name team leaders.</p></div>';
      }finally{loading=false;refresh.disabled=false;section.setAttribute('aria-busy','false');}
    }
    refresh.addEventListener('click',()=>load());
    section.addEventListener('error',event=>{if(event.target.tagName==='IMG'){event.target.hidden=true;event.target.parentElement.title=`Portrait unavailable: ${event.target.alt}`;}},true);
    load(true);
    setInterval(()=>{if(!document.hidden)load();},30*60*1000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastAttempt>=30*60*1000)load();});
  }
  // The browser global is intentionally accessed only inside start().
  const root=typeof globalThis==='object'?globalThis:{};
  return {cards,start};
});
