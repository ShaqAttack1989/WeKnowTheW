(()=>{
  if(!window.WGameCards||typeof WGameCards.render!=='function')return;
  const originalRender=WGameCards.render.bind(WGameCards);
  const safe=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const slug=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const key=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const TIME_ZONE='America/New_York';
  let officialGames=[];
  let officialLoadedAt=0;
  let officialPromise=null;

  const normalizeNetwork=value=>{
    const raw=String(value||'').trim();
    const low=raw.toLowerCase();
    if(low==='abc'||/\babc\b/.test(low))return {label:'ABC',cls:'abc'};
    if(low.includes('espn2'))return {label:'ESPN2',cls:'espn2'};
    if(low.includes('espn'))return {label:'ESPN',cls:'espn'};
    if(low.includes('ion'))return {label:'ION',cls:'ion'};
    if(low.includes('nba tv')||low.includes('nbatv'))return {label:'NBA TV',cls:'nba-tv'};
    if(low.includes('cbs sports'))return {label:'CBS Sports',cls:'cbs-sports'};
    if(low==='cbs'||/\bcbs\b/.test(low))return {label:'CBS',cls:'cbs'};
    if(low.includes('paramount'))return {label:'Paramount+',cls:'paramount'};
    if(low.includes('prime'))return {label:'Prime Video',cls:'prime'};
    if(low.includes('peacock'))return {label:'Peacock',cls:'peacock'};
    if(low.includes('nbcsn'))return {label:'NBCSN',cls:'nbcsn'};
    if(low==='nbc'||/\bnbc\b/.test(low))return {label:'NBC',cls:'nbc'};
    if(low.includes('usa network')||low==='usa')return {label:'USA',cls:'usa'};
    if(low.includes('league pass'))return {label:'League Pass',cls:'league-pass'};
    if(low.includes('tsn+'))return {label:'TSN+',cls:'tsn-plus'};
    if(low==='tsn'||/\btsn\b/.test(low))return {label:'TSN',cls:'tsn'};
    if(low.includes('crave'))return {label:'Crave',cls:'crave'};
    return {label:raw,cls:slug(raw)};
  };

  const networks=game=>{
    const values=[...(Array.isArray(game?.broadcasts)?game.broadcasts:[]),game?.broadcast,game?.network,game?.tv].flat().filter(Boolean);
    const seen=new Set();
    return values.map(normalizeNetwork).filter(item=>item.label&&!seen.has(item.label.toLowerCase())&&seen.add(item.label.toLowerCase())).slice(0,6);
  };

  const badges=game=>{
    const items=networks(game);
    if(!items.length)return '<span class="network-icon network-tbd">TV TBD</span>';
    return items.map(item=>`<span class="network-icon network-${safe(item.cls)}" title="Watch on ${safe(item.label)}">${safe(item.label)}</span>`).join('');
  };

  function dateKey(game={}){
    if(/^\d{4}-\d{2}-\d{2}$/.test(String(game.date||'')))return String(game.date);
    const raw=String(game.startTimeUtc||game.timestamp||'').trim();
    if(!raw)return String(game.date||'');
    const date=new Date(raw);
    if(Number.isNaN(date.getTime()))return String(game.date||'');
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
    const get=type=>parts.find(part=>part.type===type)?.value||'';
    return `${get('year')}-${get('month')}-${get('day')}`;
  }

  function officialKey(game={}){
    return `${dateKey(game)}|${key(game.awayTeam)}|${key(game.homeTeam)}`;
  }

  function enrichGames(items=[],schedule=officialGames){
    if(!Array.isArray(items)||!items.length||!Array.isArray(schedule)||!schedule.length)return Array.isArray(items)?items:[];
    const map=new Map(schedule.map(game=>[officialKey(game),game]));
    return items.map(game=>{
      const match=map.get(officialKey(game));
      if(!match)return game;
      const officialBroadcasts=Array.isArray(match.broadcasts)?match.broadcasts.filter(Boolean):[];
      return {
        ...game,
        venue:match.venue||game.venue||'',
        broadcasts:officialBroadcasts.length?officialBroadcasts:(Array.isArray(game.broadcasts)?game.broadcasts:[]),
        officialWnbaGameId:match.gameId||game.officialWnbaGameId||'',
        whereToWatchSource:officialBroadcasts.length?'Official WNBA schedule':game.whereToWatchSource||''
      };
    });
  }

  function enrichPayload(payload={},schedule=officialGames){
    return {
      ...payload,
      liveGames:enrichGames(payload.liveGames||[],schedule),
      upcomingGames:enrichGames(payload.upcomingGames||[],schedule),
      pastGames:enrichGames(payload.pastGames||[],schedule),
      recentResults:enrichGames(payload.recentResults||[],schedule),
      whereToWatchSource:schedule.length?'Official WNBA schedule':payload.whereToWatchSource||''
    };
  }

  async function loadOfficialSchedule(force=false){
    if(!force&&officialGames.length&&Date.now()-officialLoadedAt<300000)return officialGames;
    if(officialPromise&&!force)return officialPromise;
    const cb=Date.now();
    officialPromise=fetch(`/api/wnba-schedule?season=2026&cb=${cb}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'})
      .then(async response=>{
        const payload=await response.json().catch(()=>({}));
        if(!response.ok||!Array.isArray(payload.games))throw new Error(payload.error||'Official WNBA schedule unavailable');
        officialGames=payload.games;
        officialLoadedAt=Date.now();
        return officialGames;
      })
      .catch(()=>officialGames)
      .finally(()=>{officialPromise=null;});
    return officialPromise;
  }

  WGameCards.render=(items=[],mode='upcoming',options={})=>{
    const html=originalRender(items,mode,options);
    if(!html||typeof DOMParser==='undefined')return html;
    try{
      const doc=new DOMParser().parseFromString(`<div id="broadcastRoot">${html}</div>`,'text/html');
      const cards=[...doc.querySelectorAll('.schedule-game-card')];
      const shown=items.slice(0,Number(options.limit)||20);
      cards.forEach((card,index)=>{
        const game=shown[index]||{};
        const bottom=card.querySelector('.schedule-game-bottom');
        if(!bottom)return;
        const detail=[...bottom.children].find((node,i)=>i>=2);
        const venue=String(game.venue||detail?.textContent||'Venue to be announced').trim();
        const line=doc.createElement('span');
        line.className='schedule-venue-line';
        line.innerHTML=`<span class="schedule-venue">${safe(venue)}</span>${badges(game)}`;
        if(detail)detail.replaceWith(line);else bottom.appendChild(line);
      });
      return doc.querySelector('#broadcastRoot')?.innerHTML||html;
    }catch{return html;}
  };

  window.WGameBroadcasts={loadOfficialSchedule,enrichGames,enrichPayload,networks,badges};
  loadOfficialSchedule(false);
})();
