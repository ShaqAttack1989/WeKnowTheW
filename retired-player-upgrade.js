(()=>{
  const catalog=window.WPlayerpediaLegacy;
  window.W_RETIRED_MEDIA=Object.fromEntries(catalog.players.filter(player=>player.mediaId).map(player=>[player.name,[player.mediaId,player.years]]));
  async function resolveFallback(img,name){
    if(!img||img.dataset.fallbackTried==='1')return;
    img.dataset.fallbackTried='1';
    try{
      const r=await fetch(`/api/media?type=player&name=${encodeURIComponent(name)}`,{headers:{Accept:'application/json'}}),p=await r.json();
      if(p?.found&&p.item?.image){img.src=p.item.image;return;}
    }catch{}
    img.style.display='none';
  }
  function wireFallbacks(){
    document.querySelectorAll('#retiredPlayerGrid .retired-player-photo img').forEach(img=>{
      if(img.dataset.fallbackWired==='1')return;img.dataset.fallbackWired='1';
      const name=img.closest('.retired-card')?.querySelector('h3')?.textContent?.trim()||img.alt||'';
      img.addEventListener('error',()=>catalog.find(name)?.photoSource?img.style.display='none':resolveFallback(img,name));
      if(img.complete&&img.naturalWidth===0&&!catalog.find(name)?.photoSource)resolveFallback(img,name);
    });
  }
  card=function(player){
    const esc=escRetired;
    const photo=player.photo?`<img src="${esc(player.photo)}" alt="${esc(player.name)}" loading="lazy" decoding="async"${player.photoSource?' class="legacy-portrait"':''}>`:'';
    const credit=player.photoSource?`<p class="legacy-photo-credit">Photo: <a href="${esc(player.photoSource)}" target="_blank" rel="noopener">${esc(player.photoCredit)}</a> · <a href="${esc(player.photoLicenseUrl)}" target="_blank" rel="noopener">${esc(player.photoLicense)}</a> · cropped to fit.</p>`:'';
    const clipboard=player.clipboard?'<a class="retired-card-playerpedia" href="/coaches.html#court-to-clipboard">Court to Clipboard →</a>':'';
    const career=player.careerStats?`<p class="legacy-career-summary"><strong>Career regular season</strong><br>${player.careerStats.games} games · ${player.careerStats.ppg.toFixed(1)} PPG · ${player.careerStats.rpg.toFixed(1)} RPG · ${player.careerStats.apg.toFixed(1)} APG</p>`:'';
    return `<article class="retired-card"><div class="retired-card-top"><span class="retired-player-photo"><span>${esc(initials(player.name))}</span>${photo}</span><div><small>${esc(player.years)}</small><h3>${esc(player.name)}</h3><small>${esc(catalog.statusLabel(player))}</small></div></div><div class="retired-card-body">${credit}<p>${esc(player.fact)}</p>${career}<div class="retired-team-path">${player.teams.map(teamStop).join('')}</div><div class="retired-card-links"><a class="retired-card-playerpedia" href="${esc(catalog.profileHref(player))}">Playerpedia · stats and profile →</a><a class="retired-card-source" href="${esc(player.source)}" target="_blank" rel="noopener">${esc(player.sourceLabel)} ↗</a>${player.statsSource?`<a class="retired-card-source" href="${esc(player.statsSource)}" target="_blank" rel="noopener">Basketball-Reference · statistics ↗</a>`:''}${clipboard}</div></div></article>`;
  };
  const baseRender=renderRetired;
  renderRetired=function(){baseRender();wireFallbacks();};
  renderRetired();
  new MutationObserver(wireFallbacks).observe(document.getElementById('retiredPlayerGrid'),{childList:true});
  if(!document.querySelector('script[data-legacy-team-assets]')){const script=document.createElement('script');script.src='/legacy-team-assets.js?v=20260823-v1';script.dataset.legacyTeamAssets='true';document.body.appendChild(script);}
})();
