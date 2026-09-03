(()=>{
  const CURRENT_SEASON=new Date().getFullYear();
  const selected=()=>{
    const q=Number.parseInt(new URLSearchParams(location.search).get('season')||'',10);
    return Number.isInteger(q)?q:CURRENT_SEASON;
  };
  if(selected()!==CURRENT_SEASON)return;

  const teamSlugs={
    'Atlanta Dream':'atlanta-dream','Chicago Sky':'chicago-sky','Connecticut Sun':'connecticut-sun','Dallas Wings':'dallas-wings','Golden State Valkyries':'golden-state-valkyries','Indiana Fever':'indiana-fever','Las Vegas Aces':'las-vegas-aces','Los Angeles Sparks':'los-angeles-sparks','Minnesota Lynx':'minnesota-lynx','New York Liberty':'new-york-liberty','Phoenix Mercury':'phoenix-mercury','Portland Fire':'portland-fire','Seattle Storm':'seattle-storm','Toronto Tempo':'toronto-tempo','Washington Mystics':'washington-mystics'
  };
  const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const playerHref=name=>`/playerpedia.html?search=${encodeURIComponent(name)}#playerpedia-directory`;
  const cleanTeam=value=>String(value||'').replace(/^Free Agent\s*·\s*last:\s*/i,'').trim();
  const teamHref=team=>teamSlugs[team]?`/team.html?team=${encodeURIComponent(teamSlugs[team])}`:'/franchise-family-tree.html';
  const teamLink=team=>`<a href="${teamHref(team)}">${safe(team)}</a>`;

  let rosterMap=null;
  let patchTimer=null;

  async function loadRosterMap(){
    if(rosterMap)return rosterMap;
    const response=await fetch(`/api/players?cb=${Date.now()}`,{headers:{Accept:'application/json'},cache:'no-store'});
    if(!response.ok)throw new Error(`Playerpedia roster map returned ${response.status}`);
    const payload=await response.json();
    const players=Array.isArray(payload)?payload:(Array.isArray(payload.players)?payload.players:[]);
    rosterMap=new Map();
    players.forEach(player=>{
      const name=String(player.name||'').trim();
      if(!name)return;
      const team=player.currentRoster===false
        ? cleanTeam(player.lastTeam||player.team)
        : cleanTeam(player.team||player.lastTeam);
      rosterMap.set(key(name),{
        name,
        team,
        position:String(player.position||'').trim(),
        currentRoster:player.currentRoster!==false,
        lastWnbaSeason:Number(player.lastWnbaSeason||CURRENT_SEASON)
      });
    });
    return rosterMap;
  }

  function teamForName(name){
    const player=rosterMap?.get(key(name));
    if(!player)return '';
    if(player.lastWnbaSeason&&player.lastWnbaSeason<CURRENT_SEASON)return '';
    return player.team||'';
  }

  function patchLeaders(root){
    root.querySelectorAll('#leaders .leader-card').forEach(card=>{
      const playerAnchor=card.querySelector('strong a');
      const teamLine=card.querySelector('p');
      if(!playerAnchor||!teamLine)return;
      const team=teamForName(playerAnchor.textContent);
      if(!team)return;
      teamLine.innerHTML=teamLink(team);
      card.dataset.currentTeamFixed='true';
    });
  }

  function patchRosters(root){
    const section=root.querySelector('#rosters');
    if(!section||section.dataset.currentTeamsFixed==='true')return;
    const oldGrid=section.querySelector('.roster-grid');
    if(!oldGrid)return;
    const rows=[];
    oldGrid.querySelectorAll('.roster-team li').forEach(li=>{
      const anchor=li.querySelector('a');
      if(!anchor)return;
      const name=anchor.textContent.trim();
      const mapped=rosterMap?.get(key(name));
      const team=teamForName(name);
      const suffix=li.textContent.slice(li.textContent.indexOf(name)+name.length).replace(/^\s*·\s*/,'').trim();
      rows.push({name,team,position:suffix||mapped?.position||''});
    });
    if(!rows.length)return;

    const groups=new Map();
    const unresolved=[];
    rows.forEach(row=>{
      if(!row.team){unresolved.push(row);return;}
      if(!groups.has(row.team))groups.set(row.team,[]);
      groups.get(row.team).push(row);
    });
    const ordered=[...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
    if(unresolved.length)ordered.push(['Other 2026 appearances',unresolved]);

    oldGrid.innerHTML=ordered.map(([team,list])=>`<article class="roster-team"><h4>${team==='Other 2026 appearances'?safe(team):teamLink(team)}</h4><ul>${list.sort((a,b)=>a.name.localeCompare(b.name)).map(player=>`<li><a href="${playerHref(player.name)}">${safe(player.name)}</a>${player.position?` · ${safe(player.position)}`:''}</li>`).join('')}</ul></article>`).join('');
    section.dataset.currentTeamsFixed='true';
  }

  function patchSourceNote(){
    const source=document.getElementById('yearbookSources');
    if(!source||source.dataset.currentTeamNote==='true')return;
    const note=' Current-season team labels and roster grouping are cross-checked against the live Playerpedia roster map.';
    source.textContent=`${source.textContent}${note}`;
    source.dataset.currentTeamNote='true';
  }

  async function apply(){
    const root=document.getElementById('yearbookPanels');
    if(!root)return;
    try{
      await loadRosterMap();
      patchLeaders(root);
      patchRosters(root);
      patchSourceNote();
    }catch(error){
      console.warn('W Rewind current-season roster cross-check unavailable:',error.message);
    }
  }

  function schedule(){
    clearTimeout(patchTimer);
    patchTimer=setTimeout(apply,60);
  }

  const root=document.getElementById('yearbookPanels');
  if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
})();
