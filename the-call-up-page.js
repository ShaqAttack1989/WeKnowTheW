function uSafe(value=''){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function uNorm(value=''){return String(value).toLowerCase().replace(/[^a-z0-9]/g,'');}
function uDate(value=''){if(!value)return '';const date=new Date(`${String(value).slice(0,10)}T12:00:00`);return Number.isNaN(date.getTime())?value:date.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'});}
function uInitials(value=''){return String(value).trim().split(/\s+/).map(part=>part[0]).join('').slice(0,2).toUpperCase();}
function hostedPhoto(url=''){
  const direct=String(url||'').trim();
  if(!/^https?:\/\//i.test(direct))return direct;
  const espn=direct.match(/headshots\/(wnba|womens-college-basketball)\/players\/full\/(\d+)\.(?:png|jpg)/i);
  if(espn)return `/api/photo?id=${espn[2]}${espn[1]==='wnba'?'':'&league=ncaaw'}`;
  return `/api/photo?src=${encodeURIComponent(direct)}`;
}
function callupPhoto(item={},players=[],extras=new Map()){
  const name=item.player||item.name||'';
  const match=players.find(player=>uNorm(player.name)===uNorm(name));
  const espnId=String(item.espnId||match?.espnId||'').replace(/[^0-9]/g,'');
  const raw=item.photo||match?.photo||match?.photoThumb||match?.headshot||extras.get(uNorm(name))||(espnId?`/api/photo?id=${espnId}${item.league==='ncaaw'?'&league=ncaaw':''}`:'');
  const src=/^https?:\/\//i.test(raw)?hostedPhoto(raw):raw;
  if(!src)return `<div class="callup-player-photo photo-fallback"><span class="photo-fallback-mark">${uSafe(uInitials(name))}</span></div>`;
  return `<div class="callup-player-photo"><img src="${uSafe(src)}" alt="${uSafe(name)}" loading="lazy" decoding="async" onerror="this.hidden=true;this.parentElement.classList.add('photo-fallback')"><span class="photo-fallback-mark">${uSafe(uInitials(name))}</span></div>`;
}
function upshotLeadersMarkup(items=[],extras=new Map()){if(!items.length)return '<div class="college-leader-row"><span>—</span><div><strong>Leader data is refreshing.</strong></div></div>';return items.map((item,index)=>{const espnId=String(item.espnId||'').replace(/[^0-9]/g,'');const raw=item.photo||extras.get(uNorm(item.player))||(espnId?`/api/photo?id=${espnId}${item.league==='ncaaw'?'&league=ncaaw':''}`:'');const photo=/^https?:\/\//i.test(raw)?hostedPhoto(raw):raw;const media=photo?`<img class="leader-mini-photo" src="${uSafe(photo)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`:'';return `<div class="college-leader-row">${media||`<span class="college-rank">${index+1}</span>`}<div><strong>${uSafe(item.player)}</strong><small>${uSafe(item.team)} · as of ${uSafe(uDate(item.asOf))}</small></div><b>${uSafe(item.stat)} <small>${uSafe(item.metric)}</small></b></div>`;}).join('');}
function upshotCallupMarkup(items=[],players=[],extras=new Map()){if(!items.length)return '<article class="upshot-callup-card"><strong>No call-ups loaded yet.</strong></article>';return items.map(item=>`<article class="upshot-callup-card callup-with-photo">${callupPhoto(item,players,extras)}<div class="callup-copy"><span class="upshot-callup-date">${uSafe(uDate(item.date))}</span><div class="upshot-callup-route"><b>${uSafe(item.from)}</b><span>→</span><b>${uSafe(item.to)}</b></div><strong>${uSafe(item.player)}</strong><p>${uSafe(item.contract||'WNBA opportunity')}</p><small>${uSafe(item.stats||'')}</small><em>${uSafe(item.milestone||'')}</em></div></article>`).join('');}
async function extraPlayerPhotos(names=[],players=[]){
  const extras=new Map();
  const needed=[...new Set(names.map(uNorm).filter(Boolean))].filter(key=>!players.some(player=>uNorm(player.name)===key&&(player.photo||player.espnId)));
  await Promise.all(needed.map(async key=>{
    const name=names.find(item=>uNorm(item)===key);
    if(!name)return;
    try{
      const response=await fetch(`/api/media?type=player&name=${encodeURIComponent(name)}`,{headers:{Accept:'application/json'}});
      const payload=await response.json().catch(()=>({}));
      if(payload.found&&payload.item?.image)extras.set(key,payload.item.image);
    }catch{}
  }));
  return extras;
}
function upshotTeamsMarkup(items=[]){if(!items.length)return '<article class="upshot-team-card"><strong>UPSHOT records are refreshing.</strong></article>';return items.map(item=>`<article class="upshot-team-card"><span>${uSafe(item.status||'PUBLIC SNAPSHOT')}</span><strong>${uSafe(item.team)}</strong><b>${uSafe(item.record||'—')}</b><small>as of ${uSafe(uDate(item.asOf))}</small></article>`).join('');}
async function loadUpshot(){
  const teamGrid=document.getElementById('upshotTeamGrid'),leaderGrid=document.getElementById('upshotLeaderGrid'),callups=document.getElementById('upshotCallups'),callupCount=document.getElementById('upshotCallupCount'),status=document.getElementById('upshotStatus'),next=document.getElementById('upshotNext'),sourceNote=document.getElementById('upshotSourceNote');
  if(!teamGrid||!leaderGrid||!callups)return;
  try{
    const [liveResult,playersResult]=await Promise.allSettled([
      fetch('/upshot-live.json',{headers:{Accept:'application/json'},cache:'no-store'}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error('UPSHOT snapshot unavailable');return payload;}),
      fetch('/api/players',{headers:{Accept:'application/json'}}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error('Player artwork unavailable');return payload;})
    ]);
    if(liveResult.status!=='fulfilled')throw liveResult.reason||new Error('UPSHOT snapshot unavailable');
    const payload=liveResult.value,teams=Array.isArray(payload.teams)?payload.teams:[],leaders=Array.isArray(payload.leaders)?payload.leaders:[],moves=Array.isArray(payload.callUps)?payload.callUps:[],players=playersResult.status==='fulfilled'&&Array.isArray(playersResult.value.players)?playersResult.value.players:[];
    const names=[...leaders.map(item=>item.player),...moves.map(item=>item.player)].filter(Boolean);
    const extras=await extraPlayerPhotos(names,players);
    teamGrid.innerHTML=upshotTeamsMarkup(teams);
    leaderGrid.innerHTML=upshotLeadersMarkup(leaders,extras);
    callups.innerHTML=upshotCallupMarkup(moves,players,extras);
    callupCount.textContent=`${moves.length} ${moves.length===1?'player has':'players have'} moved UP to WNBA contracts`;
    const updated=payload.updatedAt?new Date(payload.updatedAt):null;
    status.textContent=updated&&!Number.isNaN(updated.getTime())?`Public-source snapshot checked ${updated.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'})}.`:'Public-source UPSHOT snapshot connected.';
    next.textContent=payload.next||'';
    const sources=Array.isArray(payload.sources)?payload.sources:[];
    sourceNote.innerHTML=sources.length?`Sources: ${sources.map(source=>`<a href="${uSafe(source.url)}" target="_blank" rel="noopener noreferrer">${uSafe(source.label)}</a>`).join(' · ')}.`:'';
  }catch(error){
    teamGrid.innerHTML='<article class="upshot-team-card"><strong>UPSHOT tracker is temporarily unavailable.</strong></article>';
    leaderGrid.innerHTML='<div class="college-leader-row"><span>!</span><div><strong>Stat snapshot unavailable.</strong></div></div>';
    callups.innerHTML='<article class="upshot-callup-card"><strong>Call-up tracker unavailable.</strong></article>';
    status.textContent='UPSHOT tracker temporarily unavailable';
  }
}
loadUpshot();