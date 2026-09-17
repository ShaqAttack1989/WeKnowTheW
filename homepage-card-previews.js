(()=>{
  const svgData=svg=>`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
  let standingsPreview='';

  function seasonPreview(){
    return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 420" role="img" aria-label="Player movement and availability dashboard preview">
      <defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#160b33"/><stop offset="1" stop-color="#43216c"/></linearGradient></defs>
      <rect width="720" height="420" rx="28" fill="url(#g)"/>
      <circle cx="650" cy="46" r="90" fill="#c7ff35" opacity=".08"/><circle cx="60" cy="380" r="110" fill="#7b55ff" opacity=".15"/>
      <text x="38" y="54" fill="#c7ff35" font-family="Arial,sans-serif" font-size="14" font-weight="800" letter-spacing="2">CURRENT SEASON HQ</text>
      <text x="38" y="88" fill="#fff" font-family="Arial,sans-serif" font-size="30" font-weight="900">PLAYER MOVEMENT + AVAILABILITY</text>
      <rect x="38" y="118" width="306" height="238" rx="20" fill="#fff" opacity=".97"/>
      <rect x="376" y="118" width="306" height="238" rx="20" fill="#fff" opacity=".97"/>
      <text x="62" y="151" fill="#6c2a92" font-family="Arial,sans-serif" font-size="13" font-weight="800" letter-spacing="1.5">PLAYER MOVEMENT</text>
      <text x="400" y="151" fill="#6c2a92" font-family="Arial,sans-serif" font-size="13" font-weight="800" letter-spacing="1.5">AVAILABILITY</text>
      <circle cx="82" cy="193" r="24" fill="#160b33"/><circle cx="82" cy="249" r="24" fill="#6c2a92"/><circle cx="82" cy="305" r="24" fill="#c7ff35"/>
      <path d="M118 193h118" stroke="#160b33" stroke-width="8" stroke-linecap="round"/><path d="M118 249h92" stroke="#6c2a92" stroke-width="8" stroke-linecap="round"/><path d="M118 305h138" stroke="#a6d414" stroke-width="8" stroke-linecap="round"/>
      <text x="274" y="198" fill="#160b33" font-family="Arial,sans-serif" font-size="20" font-weight="900">↗</text><text x="274" y="254" fill="#160b33" font-family="Arial,sans-serif" font-size="20" font-weight="900">↔</text><text x="274" y="310" fill="#160b33" font-family="Arial,sans-serif" font-size="20" font-weight="900">+</text>
      <g font-family="Arial,sans-serif" font-size="16" font-weight="800" fill="#160b33"><text x="400" y="196">ACTIVE</text><text x="400" y="252">GAME STATUS</text><text x="400" y="308">RETURN WATCH</text></g>
      <g><circle cx="636" cy="190" r="10" fill="#56c271"/><circle cx="636" cy="246" r="10" fill="#f4b740"/><circle cx="636" cy="302" r="10" fill="#9d83c9"/></g>
      <text x="38" y="392" fill="#d8d0ea" font-family="Arial,sans-serif" font-size="13" font-weight="700">SIGNINGS · TRADES · WAIVERS · ROSTER CHANGES · INJURY WATCH</text>
    </svg>`);
  }

  function standingsSvg(items=[]){
    const rows=(items||[]).slice(0,8);
    const rowMarkup=rows.length?rows.map((item,index)=>{
      const name=esc(item?.team?.full_name||item?.team_name||item?.name||'Team');
      const rank=Number(item?.overall_rank)||index+1;
      const wins=item?.wins??'—',losses=item?.losses??'—';
      const y=128+index*33;
      return `<rect x="34" y="${y-23}" width="652" height="29" rx="9" fill="${index%2?'#241342':'#2d1850'}"/><text x="50" y="${y}" fill="#c7ff35" font-family="Arial,sans-serif" font-size="14" font-weight="900">${rank}</text><text x="84" y="${y}" fill="#fff" font-family="Arial,sans-serif" font-size="15" font-weight="800">${name}</text><text x="602" y="${y}" fill="#fff" font-family="Arial,sans-serif" font-size="15" font-weight="900" text-anchor="end">${wins}-${losses}</text>`;
    }).join(''):`<text x="360" y="225" fill="#fff" font-family="Arial,sans-serif" font-size="22" font-weight="800" text-anchor="middle">Loading current standings…</text>`;
    return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 420" role="img" aria-label="Current 2026 WNBA standings preview"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#12082a"/><stop offset="1" stop-color="#3c1b65"/></linearGradient></defs><rect width="720" height="420" rx="28" fill="url(#g)"/><text x="36" y="48" fill="#c7ff35" font-family="Arial,sans-serif" font-size="14" font-weight="900" letter-spacing="2">LIVE PLAYOFF RACE</text><text x="36" y="82" fill="#fff" font-family="Arial,sans-serif" font-size="30" font-weight="900">2026 WNBA CURRENT STANDINGS</text><text x="602" y="82" fill="#d8d0ea" font-family="Arial,sans-serif" font-size="12" font-weight="800" text-anchor="end">W-L</text>${rowMarkup}<line x1="34" y1="374" x2="686" y2="374" stroke="#c7ff35" stroke-width="2" opacity=".85"/><text x="36" y="401" fill="#d8d0ea" font-family="Arial,sans-serif" font-size="12" font-weight="800">TOP EIGHT · LIVE STANDINGS</text><text x="684" y="401" fill="#c7ff35" font-family="Arial,sans-serif" font-size="12" font-weight="900" text-anchor="end">WE KNOW THE W</text></svg>`);
  }

  function apply(){
    const liveImg=document.querySelector('.home-season-spotlight a[href="/live-stats.html"] .season-story-media img');
    const seasonImg=document.querySelector('.home-season-spotlight a[href="/around-the-w.html"] .season-story-media img');
    if(liveImg){liveImg.src=standingsPreview||standingsSvg([]);liveImg.alt='Current 2026 WNBA standings preview';}
    if(seasonImg){seasonImg.src=seasonPreview();seasonImg.alt='Current Season HQ preview for player movement and availability';}
  }

  async function refreshStandings(){
    try{
      const response=await fetch(`/api/stats?season=2026&cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
      const payload=await response.json();
      if(response.ok&&Array.isArray(payload.standings)){standingsPreview=standingsSvg(payload.standings);apply();}
    }catch{}
  }

  let attempts=0;
  const waitForCards=()=>{apply();if(++attempts<30&&!document.querySelector('.home-season-spotlight a[href="/live-stats.html"] .season-story-media img'))setTimeout(waitForCards,150);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',waitForCards,{once:true});else waitForCards();
  const observer=new MutationObserver(()=>requestAnimationFrame(apply));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  refreshStandings();
  setInterval(()=>{if(!document.hidden)refreshStandings();},60000);
})();
