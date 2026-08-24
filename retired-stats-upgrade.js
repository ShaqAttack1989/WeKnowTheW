(()=>{
  const grid=document.getElementById('retiredPlayerGrid');if(!grid)return;
  const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const number=value=>{const n=Number(value);return Number.isFinite(n)?n:null;};
  const one=value=>{const n=number(value);return n===null?'—':n.toFixed(1);};
  const pct=value=>{const n=number(value);return n===null?'—':`${(Math.abs(n)<=1?n*100:n).toFixed(1)}%`;};
  const gradeClass=letter=>{const value=String(letter||'NR').toUpperCase();return value==='NR'?'grade-nr':`grade-${value.charAt(0).toLowerCase()}`;};
  const bySeason=new Map();let timer=null;

  function yearsForCard(card){
    const name=card.querySelector('h3')?.textContent?.trim()||'';
    const media=window.W_RETIRED_MEDIA?.[name];
    return String(media?.[1]||card.querySelector('.retired-card-top small')?.textContent||'');
  }
  function finalSeason(card){
    const years=yearsForCard(card).match(/\b(?:19|20)\d{2}\b/g)||[];
    const values=years.map(Number).filter(Number.isFinite);return values.length?Math.max(...values):null;
  }
  function snapshotFor(card){
    const season=finalSeason(card);if(!season)return null;
    const name=card.querySelector('h3')?.textContent?.trim()||'';
    return bySeason.get(season)?.get(key(name))||null;
  }
  function ensurePhoto(card){
    const name=card.querySelector('h3')?.textContent?.trim()||'';
    const media=window.W_RETIRED_MEDIA?.[name];
    const host=card.querySelector('.retired-player-photo');if(!host||!media?.[0])return;
    let img=host.querySelector('img');
    if(!img){img=document.createElement('img');img.alt=name;img.loading='lazy';img.decoding='async';host.appendChild(img);}
    if(!img.getAttribute('src')||img.style.display==='none'){img.style.display='';img.src=`https://cdn.wnba.com/headshots/wnba/latest/1040x760/${media[0]}.png`;}
  }
  function gradeMarkup(snapshot){
    const letter=snapshot?.letter||'NR';const score=number(snapshot?.score);
    return `<span class="player-history-grade-badge ${gradeClass(letter)}">${safe(letter)}</span><small>${score===null?'—':`${Math.round(score)}%`} grade</small>`;
  }
  function historyMarkup(card,snapshot){
    const season=finalSeason(card);
    if(!season)return '';
    return `<div class="retired-last-season"><div class="retired-last-season-head"><span>${season} · FINAL ACTIVE SEASON</span><span class="retired-last-season-grade">${gradeMarkup(snapshot)}</span></div><div class="retired-last-season-stats"><span><b>${one(snapshot?.ppg)}</b>PTS</span><span><b>${one(snapshot?.rpg)}</b>REB</span><span><b>${one(snapshot?.apg)}</b>AST</span><span><b>${one(snapshot?.spg)}</b>STL</span><span><b>${snapshot?.games??'—'}</b>G</span></div><div class="retired-last-season-eff"><span><b>PER</b> ${one(snapshot?.per)}</span><span><b>TS%</b> ${pct(snapshot?.tsPct)}</span>${snapshot?'<span>League-relative grade preserved from that season.</span>':'<span>Historical stats are reconnecting.</span>'}</div></div>`;
  }
  function decorate(){
    grid.querySelectorAll('.retired-card').forEach(card=>{
      ensurePhoto(card);
      const snapshot=snapshotFor(card);
      const existing=card.querySelector('.retired-last-season');
      const body=card.querySelector('.retired-card-body');if(!body)return;
      const wrap=document.createElement('div');wrap.innerHTML=historyMarkup(card,snapshot);const next=wrap.firstElementChild;
      if(!next)return;
      if(existing)existing.replaceWith(next);
      else{const source=body.querySelector('.retired-card-source');if(source)body.insertBefore(next,source);else body.appendChild(next);}
    });
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(decorate,80);}
  async function fetchSeason(season){
    try{
      const response=await fetch(`/api/player-season-snapshot?season=${encodeURIComponent(season)}&legacy=20260824-v1`,{headers:{Accept:'application/json'}});
      const payload=await response.json().catch(()=>({}));if(!response.ok||!Array.isArray(payload.players))return;
      bySeason.set(season,new Map(payload.players.map(item=>[key(item.name),item])));
    }catch{}
  }
  async function load(){
    const cards=[...grid.querySelectorAll('.retired-card')];
    const seasons=[...new Set(cards.map(finalSeason).filter(Boolean))].sort((a,b)=>b-a);
    await Promise.allSettled(seasons.map(fetchSeason));decorate();
  }
  new MutationObserver(schedule).observe(grid,{childList:true,subtree:true});
  setTimeout(load,60);
})();
