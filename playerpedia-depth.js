(()=>{
  'use strict';
  const FACT_FILES=['ab','cf','gj','kn','os','tz'].map(group=>`/data/playerpedia-facts-${group}.json`);
  const WNBA_TEAMS=new Set(['Atlanta Dream','Charlotte Sting','Chicago Sky','Cleveland Rockers','Connecticut Sun','Dallas Wings','Detroit Shock','Golden State Valkyries','Houston Comets','Indiana Fever','Las Vegas Aces','Los Angeles Sparks','Miami Sol','Minnesota Lynx','New York Liberty','Orlando Miracle','Phoenix Mercury','Portland Fire','Sacramento Monarchs','San Antonio Silver Stars','San Antonio Stars','Seattle Storm','Toronto Tempo','Tulsa Shock','Utah Starzz','Washington Mystics']);
  const cache={facts:null,draft:null,curated:null,affiliations:null,players:null};
  let renderToken=0;

  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const unique=list=>[...new Set(list.filter(Boolean).map(value=>String(value).trim()).filter(Boolean))];
  async function json(url){const response=await fetch(url,{headers:{Accept:'application/json'}});if(!response.ok)throw new Error(`${url} ${response.status}`);return response.json();}
  async function baseData(){
    if(cache.facts&&cache.draft&&cache.curated&&cache.affiliations&&cache.players)return cache;
    const [factSets,draft,curated,affiliations,playersPayload]=await Promise.all([
      Promise.all(FACT_FILES.map(url=>json(url).catch(()=>({})))),
      json('/data/wnba-draft-history.json').catch(()=>({picks:[],aliases:{}})),
      json('/data/playerpedia-depth-curated.json').catch(()=>({players:{}})),
      json('/pro-offseason-affiliations.json').catch(()=>({})),
      json('/api/players').catch(()=>({players:[]}))
    ]);
    cache.facts=Object.assign({},...factSets);
    cache.draft=draft;
    cache.curated=curated;
    cache.affiliations=affiliations;
    const rows=Array.isArray(playersPayload)?playersPayload:(playersPayload.players||[]);
    cache.players=new Map(rows.map(player=>[key(player.name),player]));
    return cache;
  }
  function legacyFor(name){return (window.WPlayerpediaLegacy||[]).find(player=>key(player.name)===key(name))||null;}
  function draftFor(name,draft){
    const wanted=key(name),aliases=draft?.aliases||{};
    const aliasTarget=Object.entries(aliases).find(([alias])=>key(alias)===wanted)?.[1];
    const target=key(aliasTarget||name);
    return (draft?.picks||[]).find(item=>key(item.player)===target||key(item.player)===wanted)||null;
  }
  function relatedTeam(item={}){return item.strFormerTeam||item.strTeam||item.strName||item.team||item.name||'';}
  function relatedLeague(item={}){return item.strLeague||item.strLeagueName||item.league||'';}
  function relatedYears(item={}){
    const from=item.strJoined||item.strYearStart||item.intFormedYear||item.yearStart||item.from||'';
    const to=item.strDeparted||item.strYearEnd||item.yearEnd||item.to||'';
    return [from,to].filter(Boolean).join(from&&to?'–':'');
  }
  function franchiseTrail(name,current,legacy,detail){
    const stops=[];
    (legacy?.teams||[]).forEach(stop=>{if(Array.isArray(stop)&&stop[0])stops.push({team:stop[0],years:stop[1]||''});});
    (detail?.formerTeams||[]).forEach(item=>{const team=relatedTeam(item);if(WNBA_TEAMS.has(team))stops.push({team,years:relatedYears(item)});});
    const currentTeam=(current?.currentRoster===false?current.lastTeam:current?.team)||current?.lastTeam||detail?.player?.team||'';
    if(currentTeam&&!/^Free Agent/i.test(currentTeam))stops.push({team:currentTeam.replace(/^Free Agent\s*·\s*last:\s*/i,''),years:current?.lastWnbaSeason?String(current.lastWnbaSeason):''});
    const out=[];const seen=new Set();
    stops.forEach(stop=>{const id=key(stop.team);if(!id||seen.has(id))return;seen.add(id);out.push(stop);});
    return out;
  }
  function affiliationLines(name,aff={}){
    const id=key(name),items=[];
    const usa=aff.teamUSA||{};
    if((usa.players||[]).some(player=>key(player)===id))items.push({label:'TEAM USA',text:`${usa.season||2026} ${usa.competition||'USA Basketball'}`,url:aff.sources?.teamUSA||''});
    if((usa.withdrawals||[]).some(player=>key(player)===id))items.push({label:'TEAM USA',text:`Selected for ${usa.season||2026}, later withdrew`,url:aff.sources?.teamUSAUpdate||aff.sources?.teamUSA||''});
    const unrivaled=[...(aff.unrivaled?.players||[]),...(aff.unrivaled?.season3Signed||[])].find(row=>key(row?.[0])===id);
    if(unrivaled)items.push({label:'UNRIVALED',text:`${unrivaled[1]} · ${unrivaled[1]==='Club TBD'?'Season 3 signing':'2026'}`,url:aff.sources?.unrivaled||''});
    const au=(aff.athletesUnlimited?.players||[]).find(row=>key(row?.[0])===id);
    if(au)items.push({label:'ATHLETES UNLIMITED',text:`${au[1]} · ${aff.athletesUnlimited?.label||2026}`,url:aff.sources?.au||''});
    return items;
  }
  function achievementText(item={}){return item.strHonour||item.strHonor||item.strMilestone||item.strAchievement||item.strEvent||item.strName||item.title||item.name||item.description||'';}
  function achievements(detail,memorable){
    const list=[...(detail?.honours||[]),...(detail?.milestones||[])].map(achievementText).filter(Boolean);
    if(memorable)list.push(memorable);
    return unique(list).slice(0,6);
  }
  function factFileValue(name,facts){return facts?.[key(name)]||'';}
  function profileName(){
    const title=document.getElementById('playerModalTitle');
    if(title?.textContent?.trim())return title.textContent.trim();
    return document.querySelector('#playerModalBody .research-retired-hero h2')?.textContent?.trim()||'';
  }
  function teamHint(current){
    if(current?.currentRoster===false)return current.lastTeam||'';
    return current?.team||current?.lastTeam||'';
  }
  function sourceLink(url,label='Source'){return url?`<a href="${safe(url)}" target="_blank" rel="noopener">${safe(label)} ↗</a>`:'';}
  function sectionCard(label,title,body,extra='',className=''){
    return `<article class="deep-bio-card ${className}"><span>${safe(label)}</span><h4>${safe(title)}</h4>${body}${extra}</article>`;
  }
  function draftCard(record,college){
    if(!record)return sectionCard('DRAFT FILE','WNBA entry','<p>No verified WNBA draft selection is attached to this profile. That can mean undrafted, pre-draft-era entry, or a record still being researched.</p>');
    const pick=record.pick?`No. ${record.pick} overall`:record.round?`Round ${record.round}`:'Draft selection';
    const collegeLine=college?`<p><strong>College:</strong> ${safe(college)}</p>`:'';
    return sectionCard('DRAFT FILE',`${record.year} · ${pick}`,`<p><strong>Drafted by:</strong> ${safe(record.team||'WNBA team')}</p>${collegeLine}`,sourceLink(record.source||record.sourceUrl,record.sourceLabel||'Draft record'));
  }
  function pronunciationCard(curated){
    const pronunciation=curated?.pronunciation||'';
    const nickname=curated?.nickname||'';
    if(!pronunciation){
      const nicknameLine=nickname?`<p><strong>Documented nickname:</strong> ${safe(nickname)}</p>`:'';
      return sectionCard('SAY THE NAME','Pronunciation guide',`${nicknameLine}<p class="deep-bio-muted">No verified pronunciation guide has been added yet. Playerpedia does not guess name pronunciations.</p>`,'','pronunciation');
    }
    return sectionCard('SAY THE NAME',pronunciation,`${nickname?`<p><strong>Documented nickname:</strong> ${safe(nickname)}</p>`:''}`,sourceLink(curated.pronunciationSource,'Pronunciation source'),'pronunciation');
  }
  function trailCard(trail){
    if(!trail.length)return sectionCard('FRANCHISE TRAIL','WNBA path','<p class="deep-bio-muted">A verified franchise trail has not been assembled for this profile yet.</p>');
    return sectionCard('FRANCHISE TRAIL','WNBA path',`<div class="deep-trail">${trail.map((stop,index)=>`<div><i>${index+1}</i><p><strong>${safe(stop.team)}</strong>${stop.years?`<small>${safe(stop.years)}</small>`:''}</p></div>`).join('')}</div>`);
  }
  function collegeInternationalCard(college,nationality,connections){
    const lines=[];
    if(college)lines.push(`<p><strong>College:</strong> ${safe(college)}</p>`);
    if(nationality)lines.push(`<p><strong>Nationality:</strong> ${safe(nationality)}</p>`);
    if(connections.length)lines.push(`<div class="deep-connections">${connections.map(item=>`<div><span>${safe(item.label)}</span><p>${safe(item.text)}</p>${sourceLink(item.url,'Connection')}</div>`).join('')}</div>`);
    if(!lines.length)lines.push('<p class="deep-bio-muted">College or international/pro context has not been verified for this profile yet.</p>');
    return sectionCard('COLLEGE + INTERNATIONAL','Beyond the WNBA',lines.join(''));
  }
  function accomplishmentCard(items){
    if(!items.length)return sectionCard('HARDWARE + HIGHLIGHTS','Accomplishments','<p class="deep-bio-muted">A separate accomplishment list is still being researched for this profile.</p>');
    return sectionCard('HARDWARE + HIGHLIGHTS','Accomplishments',`<ul class="deep-list">${items.map(item=>`<li>${safe(item)}</li>`).join('')}</ul>`);
  }
  function memorableCard(fact){return sectionCard('REMEMBER THIS','Memorable fact',fact?`<p>${safe(fact)}</p>`:'<p class="deep-bio-muted">The individualized memorable fact is still being upgraded from the archive fallback.</p>','','memorable');}
  function offCourtCard(curated){
    if(!curated?.offCourt&&!curated?.nickname)return sectionCard('BEYOND THE LINES','Off-court connections','<p class="deep-bio-muted">No verified off-court connection has been attached yet. Playerpedia leaves this blank rather than inventing personal details.</p>');
    const body=`${curated.offCourt?`<p>${safe(curated.offCourt)}</p>`:''}${curated.nickname?`<p><strong>Nickname:</strong> ${safe(curated.nickname)}</p>`:''}`;
    return sectionCard('BEYOND THE LINES','Off-court connections',body,curated.offCourtLink?`<a href="${safe(curated.offCourtLink)}">Follow the connection →</a>`:'','offcourt');
  }
  async function renderDepth(){
    const modal=document.getElementById('playerModalBody');if(!modal)return;
    const name=profileName();if(!name||modal.querySelector('.playerpedia-deep-file'))return;
    const token=++renderToken;
    const loading=document.createElement('section');loading.className='playerpedia-deep-file deep-file-loading';loading.dataset.forPlayer=key(name);loading.innerHTML='<div class="deep-file-head"><div><span>THE DEEP FILE</span><h3>Researching the whole career…</h3></div></div>';
    modal.appendChild(loading);
    try{
      const data=await baseData();if(token!==renderToken||profileName()!==name)return;
      const current=data.players.get(key(name))||null;
      const legacy=legacyFor(name);
      const detail=await json(`/api/player?name=${encodeURIComponent(name)}&team=${encodeURIComponent(teamHint(current))}`).catch(()=>({}));
      if(token!==renderToken||profileName()!==name)return;
      const curated=data.curated?.players?.[key(name)]||{};
      const draft=draftFor(name,data.draft);
      const fact=factFileValue(name,data.facts)||legacy?.fact||'';
      const college=detail?.player?.college||legacy?.college||draft?.college||'';
      const nationality=detail?.player?.nationality||'';
      const trail=franchiseTrail(name,current,legacy,detail);
      const connections=affiliationLines(name,data.affiliations);
      const accomplishments=achievements(detail,fact);
      const populated=[curated.pronunciation,draft,trail.length,college||nationality||connections.length,accomplishments.length,fact,curated.offCourt||curated.nickname].filter(Boolean).length;
      loading.className='playerpedia-deep-file';
      loading.innerHTML=`<div class="deep-file-head"><div><span>THE DEEP FILE</span><h3>More than a directory entry.</h3><p>Pronunciation, draft history, franchise trail, college and international context, accomplishments, memorable facts and connections beyond the box score.</p></div><b>${populated}/7 researched</b></div><div class="deep-bio-grid">${pronunciationCard(curated)}${draftCard(draft,college)}${trailCard(trail)}${collegeInternationalCard(college,nationality,connections)}${accomplishmentCard(accomplishments)}${memorableCard(fact)}${offCourtCard(curated)}</div><p class="deep-file-method"><strong>Research rule:</strong> documented facts stay documented. Missing pronunciation or personal details are marked as unfinished instead of guessed.</p>`;
    }catch(error){loading.innerHTML='<div class="deep-file-head"><div><span>THE DEEP FILE</span><h3>Deep profile temporarily unavailable.</h3><p>The standard Playerpedia profile remains available while the research layer reconnects.</p></div></div>';}
  }
  const observer=new MutationObserver(()=>{
    const modal=document.getElementById('playerModalBody');if(!modal)return;
    const existing=modal.querySelector('.playerpedia-deep-file');const name=profileName();
    if(existing&&existing.dataset.forPlayer&&existing.dataset.forPlayer!==key(name))existing.remove();
    if(name&&!modal.querySelector('.playerpedia-deep-file'))setTimeout(renderDepth,40);
  });
  const start=()=>{const modal=document.getElementById('playerModalBody');if(modal){observer.observe(modal,{childList:true,subtree:true});renderDepth();}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
