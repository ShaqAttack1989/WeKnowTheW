(()=>{
  'use strict';

  const FACT_FILES=['ab','cf','gj','kn','os','tz'].map(group=>`/data/playerpedia-facts-${group}.json`);
  const WNBA_TEAMS=new Set(['Atlanta Dream','Charlotte Sting','Chicago Sky','Cleveland Rockers','Connecticut Sun','Dallas Wings','Detroit Shock','Golden State Valkyries','Houston Comets','Indiana Fever','Las Vegas Aces','Los Angeles Sparks','Miami Sol','Minnesota Lynx','New York Liberty','Orlando Miracle','Phoenix Mercury','Portland Fire','Sacramento Monarchs','San Antonio Silver Stars','San Antonio Stars','Seattle Storm','Toronto Tempo','Tulsa Shock','Utah Starzz','Washington Mystics']);
  const TEAM_PRONUNCIATION_SLUGS={
    'Atlanta Dream':'atlanta-dream','Chicago Sky':'chicago-sky','Connecticut Sun':'connecticut-sun','Dallas Wings':'dallas-wings','Golden State Valkyries':'golden-state-valkyries','Indiana Fever':'indiana-fever','Las Vegas Aces':'las-vegas-aces','Los Angeles Sparks':'los-angeles-sparks','Minnesota Lynx':'minnesota-lynx','New York Liberty':'new-york-liberty','Phoenix Mercury':'phoenix-mercury','Portland Fire':'portland-fire','Seattle Storm':'seattle-storm','Toronto Tempo':'toronto-tempo','Washington Mystics':'washington-mystics'
  };
  const cache={facts:null,draft:null,curated:null,affiliations:null,players:null};
  let renderToken=0;

  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const unique=list=>[...new Set((list||[]).filter(Boolean).map(value=>String(value).trim()).filter(Boolean))];
  async function json(url){const response=await fetch(url,{headers:{Accept:'application/json'}});if(!response.ok)throw new Error(`${url} ${response.status}`);return response.json();}

  async function baseData(){
    if(cache.facts&&cache.draft&&cache.curated&&cache.affiliations&&cache.players)return cache;
    const [factSets,draft,curated,affiliations,playersPayload]=await Promise.all([
      Promise.all(FACT_FILES.map(url=>json(url).catch(()=>({})))),
      json('/data/wnba-draft-history.json').catch(()=>({picks:[],undrafted:[],aliases:{}})),
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
    const drafted=(draft?.picks||[]).find(item=>key(item.player)===target||key(item.player)===wanted);
    if(drafted)return {...drafted,status:'drafted'};
    const undrafted=(draft?.undrafted||[]).find(player=>key(player)===target||key(player)===wanted);
    return undrafted?{player:undrafted,status:'undrafted',undrafted:true}:null;
  }

  function relatedTeam(item={}){return item.strFormerTeam||item.strTeam||item.strName||item.team||item.name||'';}
  function relatedLeague(item={}){return item.strLeague||item.strLeagueName||item.league||'';}
  function relatedYears(item={}){
    const from=item.strJoined||item.strYearStart||item.intFormedYear||item.yearStart||item.from||'';
    const to=item.strDeparted||item.strYearEnd||item.yearEnd||item.to||'';
    return [from,to].filter(Boolean).join(from&&to?'–':'');
  }

  function franchiseTrail(name,current,legacy,detail,curated={}){
    if(Array.isArray(curated.franchiseTrail)&&curated.franchiseTrail.length)return curated.franchiseTrail;
    const raw=[];
    (legacy?.teams||[]).forEach(stop=>{if(Array.isArray(stop)&&stop[0])raw.push({team:stop[0],years:stop[1]||''});});
    (detail?.formerTeams||[]).forEach(item=>{const team=relatedTeam(item);if(WNBA_TEAMS.has(team))raw.push({team,years:relatedYears(item)});});
    const currentTeam=(current?.currentRoster===false?current.lastTeam:current?.team)||current?.lastTeam||detail?.player?.team||'';
    if(currentTeam&&!/^Free Agent/i.test(currentTeam))raw.push({team:currentTeam.replace(/^Free Agent\s*·\s*last:\s*/i,''),years:current?.currentRoster===false?`${current.lastWnbaSeason||2026} · last WNBA team`:'2026 · current'});
    const map=new Map();
    raw.forEach(stop=>{
      const id=key(stop.team);if(!id)return;
      const currentStop=map.get(id)||{team:stop.team,years:[]};
      if(stop.years&&!currentStop.years.includes(stop.years))currentStop.years.push(stop.years);
      map.set(id,currentStop);
    });
    return [...map.values()].map(stop=>({team:stop.team,years:stop.years.join(' · ')}));
  }

  function internationalTrail(detail){
    const rows=[];
    (detail?.formerTeams||[]).forEach(item=>{
      const team=relatedTeam(item),league=relatedLeague(item),years=relatedYears(item);
      if(!team||WNBA_TEAMS.has(team))return;
      rows.push({team,league,years});
    });
    const seen=new Set();
    return rows.filter(item=>{const id=key(`${item.team}${item.league}${item.years}`);if(!id||seen.has(id))return false;seen.add(id);return true;}).slice(0,8);
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
  function descriptionSentences(text=''){return String(text||'').replace(/\s+/g,' ').split(/(?<=[.!?])\s+/).map(value=>value.trim()).filter(value=>value.length>24&&value.length<320);}
  function achievementSentences(text=''){
    const signal=/(mvp|most valuable|rookie of the year|defensive player|most improved|sixth player|all[- ]star|all[- ]wnba|all-american|champion|championship|title|medal|olympic|award|record|fastest|first player|first rookie|scoring title|assist title|rebound title)/i;
    return descriptionSentences(text).filter(sentence=>signal.test(sentence)).slice(0,5);
  }
  function personalSentences(text=''){
    const signal=/(born|grew up|family|sister|brother|twin|mother|father|degree|graduat|education|business|foundation|charity|community|advocacy|music|rapper|broadcast|commentary|media|entrepreneur)/i;
    return descriptionSentences(text).filter(sentence=>signal.test(sentence)).slice(0,2);
  }
  function factLooksLikeAchievement(fact=''){return /(won|champion|championship|mvp|award|record|first player|first rookie|all-american|medal|title|rookie of the year|defensive player|most improved|sixth player|fastest)/i.test(fact);}

  function achievements(detail,curated={},fact='',draft=null){
    if(Array.isArray(curated.achievements)&&curated.achievements.length)return unique(curated.achievements).slice(0,7);
    let list=unique([...(detail?.honours||[]),...(detail?.milestones||[])].map(achievementText).filter(Boolean));
    if(!list.length)list=achievementSentences(detail?.player?.description||'');
    if(!list.length&&factLooksLikeAchievement(fact))list=[fact];
    if(!list.length&&draft?.status==='drafted'&&draft.pick)list=[`Selected No. ${draft.pick} overall in the ${draft.year} WNBA Draft.`];
    if(!list.length&&draft?.undrafted)list=['Reached the WNBA as an undrafted player.'];
    return unique(list).slice(0,7);
  }

  function factFileValue(name,facts){return facts?.[key(name)]||'';}
  function profileName(){
    const title=document.getElementById('playerModalTitle');
    if(title?.textContent?.trim())return title.textContent.trim();
    return document.querySelector('#playerModalBody .research-retired-hero h2')?.textContent?.trim()||'';
  }
  function teamHint(current){return current?.currentRoster===false?(current.lastTeam||''):(current?.team||current?.lastTeam||'');}
  function officialPlayerUrl(current){return current?.wnbaId?`https://www.wnba.com/player/${encodeURIComponent(current.wnbaId)}`:'';}
  function teamPronunciationUrl(current){const slug=TEAM_PRONUNCIATION_SLUGS[current?.team||''];return slug?`https://herhoopstats.com/pronunciations/wnba/team/2026/${slug}/`:'';}

  function sourceLink(url,label='Source'){return /^https?:\/\//i.test(String(url||''))?`<a href="${safe(url)}" target="_blank" rel="noopener">${safe(label)} ↗</a>`:'';}
  function sourceLinks(urls,label='Sources'){
    const list=unique(Array.isArray(urls)?urls:[urls]);
    return list.map((url,index)=>sourceLink(url,list.length>1?`${label} ${index+1}`:label)).join(' ');
  }
  function sectionCard(label,title,body,extra='',className=''){return `<article class="deep-bio-card ${className}"><span>${safe(label)}</span><h4>${safe(title)}</h4>${body}${extra}</article>`;}

  function nicknameMarkup(curated={}){
    if(!curated.nickname)return '';
    return `<div class="deep-nickname"><p><strong>Documented nickname:</strong> ${safe(curated.nickname)}</p>${curated.nicknameNote?`<small>${safe(curated.nicknameNote)}</small>`:''}${sourceLink(curated.nicknameSource,'Nickname source')}</div>`;
  }

  function pronunciationCard(name,current,curated={}){
    const nickname=nicknameMarkup(curated);
    if(curated.pronunciation)return sectionCard('SAY THE NAME',curated.pronunciation,nickname,sourceLink(curated.pronunciationSource,'Pronunciation source'),'pronunciation');
    if(curated.pronunciationSource){
      const note=curated.pronunciationNote||`A verified audio pronunciation is available for ${name}.`;
      return sectionCard('SAY THE NAME','Audio pronunciation',`${nickname}<p>${safe(note)}</p>`,sourceLink(curated.pronunciationSource,'Hear pronunciation'),'pronunciation');
    }
    const teamAudio=teamPronunciationUrl(current);
    if(teamAudio)return sectionCard('SAY THE NAME','Audio pronunciation',`${nickname}<p>Use the 2026 ${safe(current.team)} player-name pronunciation guide for the verified audio version.</p>`,sourceLink(teamAudio,'Team pronunciation guide'),'pronunciation');
    if(nickname)return sectionCard('SAY THE NAME','Name guide',nickname,'','pronunciation');
    return sectionCard('SAY THE NAME','Name guide','<p>No alternate phonetic spelling is published in the verified sources attached to this profile, so Playerpedia does not invent one.</p>','','pronunciation');
  }

  function draftCard(record,college,curated={},current=null,legacy=null){
    if(curated.entry){
      const entry=curated.entry;
      const title=[entry.year,entry.status].filter(Boolean).join(' · ')||'WNBA entry';
      const body=`${entry.team?`<p><strong>WNBA entry team:</strong> ${safe(entry.team)}</p>`:''}${college?`<p><strong>College/development:</strong> ${safe(college)}</p>`:''}${entry.note?`<p>${safe(entry.note)}</p>`:''}`;
      return sectionCard('DRAFT FILE',title,body,sourceLink(entry.source,'Entry source'));
    }
    if(record?.status==='drafted'){
      const pick=record.pick?`No. ${record.pick} overall`:record.round?`Round ${record.round}`:'Draft selection';
      const collegeLine=college?`<p><strong>College/development:</strong> ${safe(college)}</p>`:'';
      const note=record.note?`<p>${safe(record.note)}</p>`:'';
      return sectionCard('DRAFT FILE',`${record.year} · ${pick}`,`<p><strong>Drafted by:</strong> ${safe(record.team||'WNBA team')}</p>${collegeLine}${note}`,sourceLink(record.source||record.sourceUrl,record.sourceLabel||'Draft record'));
    }
    if(record?.undrafted){
      const firstSeason=legacy?.start||current?.firstWnbaSeason||current?.rookieYear||'';
      return sectionCard('DRAFT FILE',`${firstSeason?`${firstSeason} · `:''}Undrafted`,`${college?`<p><strong>College/development:</strong> ${safe(college)}</p>`:''}<p><strong>Draft status:</strong> Undrafted. Reached the WNBA through free agency or roster competition.</p>`,sourceLink(officialPlayerUrl(current),'Official WNBA profile'));
    }
    const firstSeason=legacy?.start||current?.firstWnbaSeason||current?.rookieYear||'';
    return sectionCard('DRAFT FILE','WNBA entry',`<p>${firstSeason?`<strong>First WNBA season:</strong> ${safe(firstSeason)}. `:''}No standard draft selection appears in the Playerpedia draft ledger; this profile is treated as a non-draft or special-entry case rather than guessing a pick.</p>`,sourceLink(officialPlayerUrl(current),'Official WNBA profile'));
  }

  function trailCard(trail,curated={}){
    if(!trail.length)return sectionCard('FRANCHISE TRAIL','WNBA path','<p>The available profile sources do not list a second WNBA stop; the known WNBA team is shown elsewhere in the profile.</p>');
    const body=`<div class="deep-trail">${trail.map((stop,index)=>`<div><i>${index+1}</i><p><strong>${safe(stop.team)}</strong>${stop.years?`<small>${safe(stop.years)}</small>`:''}</p></div>`).join('')}</div>`;
    return sectionCard('FRANCHISE TRAIL','WNBA path',body,sourceLink(curated.franchiseTrailSource,'Franchise source'));
  }

  function collegeInternationalCard(college,nationality,connections,international,curated={}){
    const ci=curated.collegeInternational||{};
    const lines=[];
    if(ci.college)lines.push(`<p><strong>College/development:</strong> ${safe(ci.college)}</p>`);
    else if(college)lines.push(`<p><strong>College/development:</strong> ${safe(college)}</p>`);
    if(nationality)lines.push(`<p><strong>Nationality:</strong> ${safe(nationality)}</p>`);
    const clubLines=Array.isArray(ci.clubs)&&ci.clubs.length?ci.clubs:international.map(item=>`${item.team}${item.league?` · ${item.league}`:''}${item.years?` · ${item.years}`:''}`);
    if(clubLines.length)lines.push(`<div class="deep-international"><strong>Club / international trail</strong>${clubLines.map(item=>`<p>${safe(item)}</p>`).join('')}</div>`);
    if(Array.isArray(ci.nationalTeam)&&ci.nationalTeam.length)lines.push(`<div class="deep-international"><strong>National team</strong>${ci.nationalTeam.map(item=>`<p>${safe(item)}</p>`).join('')}</div>`);
    if(connections.length)lines.push(`<div class="deep-connections">${connections.map(item=>`<div><span>${safe(item.label)}</span><p>${safe(item.text)}</p>${sourceLink(item.url,'Connection')}</div>`).join('')}</div>`);
    if(!lines.length)lines.push('<p>The available player sources do not show a U.S. college or international club entry. Playerpedia keeps the field factual rather than inventing a school or overseas stop.</p>');
    return sectionCard('COLLEGE + INTERNATIONAL','Beyond the WNBA',lines.join(''),sourceLink(ci.source,'Career source'));
  }

  function accomplishmentCard(items,curated={}){
    const body=`<ul class="deep-list">${items.map(item=>`<li>${safe(item)}</li>`).join('')}</ul>`;
    return sectionCard('HARDWARE + HIGHLIGHTS','Accomplishments',body,sourceLinks(curated.achievementsSources,'Achievement source'));
  }

  function memorableCard(fact,curated={}){
    const text=curated.memorable||fact||'This profile is connected to Playerpedia through its verified career record; the memorable-fact line is being sourced from that record rather than filled with a generic league-era sentence.';
    return sectionCard('REMEMBER THIS','Memorable fact',`<p>${safe(text)}</p>`,sourceLink(curated.memorableSource,'Fact source'),'memorable');
  }

  function offCourtCard(curated={},detail={}){
    if(curated.offCourt)return sectionCard('BEYOND THE LINES','Off-court connections',`<p>${safe(curated.offCourt)}</p>`,`${sourceLink(curated.offCourtSource,'Off-court source')}${curated.offCourtLink?` <a href="${safe(curated.offCourtLink)}">Follow the connection →</a>`:''}`,'offcourt');
    const personal=personalSentences(detail?.player?.description||'');
    if(personal.length)return sectionCard('BEYOND THE LINES','Off-court connections',personal.map(sentence=>`<p>${safe(sentence)}</p>`).join(''));
    const roots=[];
    if(detail?.player?.birthPlace)roots.push(`<p><strong>Roots:</strong> ${safe(detail.player.birthPlace)}</p>`);
    if(detail?.player?.nationality)roots.push(`<p><strong>Country connection:</strong> ${safe(detail.player.nationality)}</p>`);
    if(curated.nickname)roots.push(`<p><strong>Known as:</strong> ${safe(curated.nickname)}</p>`);
    return sectionCard('BEYOND THE LINES','Off-court connections',roots.join('')||'<p>No personal-life detail is published in the verified sources attached to this profile. Playerpedia does not fill that gap with speculation.</p>','','offcourt');
  }

  async function renderDepth(){
    const modal=document.getElementById('playerModalBody');if(!modal)return;
    const name=profileName();if(!name||modal.querySelector('.playerpedia-deep-file'))return;
    const token=++renderToken;
    const loading=document.createElement('section');
    loading.className='playerpedia-deep-file deep-file-loading';
    loading.dataset.forPlayer=key(name);
    loading.innerHTML='<div class="deep-file-head"><div><span>THE DEEP FILE</span><p>Loading verified career research…</p></div></div>';
    modal.appendChild(loading);
    try{
      const data=await baseData();if(token!==renderToken||profileName()!==name)return;
      const current=data.players.get(key(name))||null;
      const legacy=legacyFor(name);
      const detail=await json(`/api/player?name=${encodeURIComponent(name)}&team=${encodeURIComponent(teamHint(current))}`).catch(()=>({}));
      if(token!==renderToken||profileName()!==name)return;
      const curated=data.curated?.players?.[key(name)]||{};
      const draft=draftFor(name,data.draft);
      const baseFact=factFileValue(name,data.facts)||legacy?.fact||'';
      const fact=curated.memorable||baseFact;
      const college=curated.collegeInternational?.college||detail?.player?.college||legacy?.college||draft?.college||'';
      const nationality=detail?.player?.nationality||'';
      const trail=franchiseTrail(name,current,legacy,detail,curated);
      const international=internationalTrail(detail);
      const connections=affiliationLines(name,data.affiliations);
      const accomplishmentList=achievements(detail,curated,baseFact,draft);
      loading.className='playerpedia-deep-file';
      loading.innerHTML=`<div class="deep-file-head"><div><span>THE DEEP FILE</span><p>Pronunciation, WNBA entry, franchise history, college and international basketball, accomplishments, memorable facts and connections beyond the box score.</p></div></div><div class="deep-bio-grid">${pronunciationCard(name,current,curated)}${draftCard(draft,college,curated,current,legacy)}${trailCard(trail,curated)}${collegeInternationalCard(college,nationality,connections,international,curated)}${accomplishmentCard(accomplishmentList,curated)}${memorableCard(fact,curated)}${offCourtCard(curated,detail)}</div>`;
    }catch(error){
      loading.innerHTML='<div class="deep-file-head"><div><span>THE DEEP FILE</span><p>The standard Playerpedia profile remains available while the research layer reconnects.</p></div></div>';
    }
  }

  const observer=new MutationObserver(()=>{
    const modal=document.getElementById('playerModalBody');if(!modal)return;
    const existing=modal.querySelector('.playerpedia-deep-file'),name=profileName();
    if(existing&&existing.dataset.forPlayer&&existing.dataset.forPlayer!==key(name))existing.remove();
    if(name&&!modal.querySelector('.playerpedia-deep-file'))setTimeout(renderDepth,40);
  });
  const start=()=>{const modal=document.getElementById('playerModalBody');if(modal){observer.observe(modal,{childList:true,subtree:true});renderDepth();}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
