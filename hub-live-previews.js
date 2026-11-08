(()=>{
 const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
 const fmtTime=value=>{const date=value?new Date(value):new Date();return Number.isNaN(+date)?'':date.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})};
 const fallbackText='Snapshot from Nov. 8, 2026';
 const initials=name=>String(name||'').trim().split(/\s+/).filter(Boolean).map(part=>part[0]).slice(0,2).join('').toUpperCase();
 const ncaawHost=document.getElementById('ncaawHubPreview');
 async function loadNcaaw(){
  if(!ncaawHost)return;
  const status=document.getElementById('ncaawHubStatus');
  try{
   const response=await fetch('/api/ncaaw-stat-kitchen',{cache:'no-store',signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw new Error('Feed unavailable');
   const data=await response.json();
   const rows=data?.leaders?.pointsPerGame||[];
   if(!rows.length)throw new Error('No scoring leaders');
   ncaawHost.innerHTML=rows.slice(0,5).map(player=>{
    const photo=player.photo?'<img src="'+safe(player.photo)+'" alt="" loading="lazy" decoding="async">':safe(initials(player.name));
    return '<li class="ncaaw-hub-leader"><span class="ncaaw-preview-rank">'+safe(player.rank)+'</span><span class="ncaaw-preview-photo" aria-hidden="true">'+photo+'</span><span class="ncaaw-preview-player"><strong>'+safe(player.name)+'</strong><small>'+safe(player.team)+'</small></span><span class="ncaaw-preview-value">'+safe(player.displayValue)+' <small>PPG</small></span></li>';
   }).join('');
   if(status)status.textContent='Live feed updated '+fmtTime(data.updatedAt)+' · refreshes every 10 minutes while this page is open.';
  }catch{
   if(status)status.textContent=fallbackText+' · the live feed is delayed. Open the full Stat Kitchen for the complete board and official NCAA links.';
  }
 }
 function fmtMetric(value,metric){
  const n=Number(value);if(!Number.isFinite(n))return'—';
  if(metric.format==='int')return Math.round(n).toLocaleString();
  if(metric.format==='pct1')return n.toFixed(metric.decimals??1)+'%';
  return n.toFixed(metric.decimals??1);
 }
 async function loadOffseasonCard(card){
  const response=await fetch(card.dataset.source,{headers:{Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new Error('Season data unavailable');
  const payload=await response.json();
  if(!Array.isArray(payload.players)||!Array.isArray(payload.metrics))throw new Error('Season data unavailable');
  const metrics=card.dataset.metrics.split(',').map(key=>payload.metrics.find(metric=>metric.key===key)).filter(Boolean);
  const rows=metrics.map(metric=>{
   const players=payload.players.filter(player=>Number.isFinite(Number(player[metric.key])));
   players.sort((a,b)=>metric.sort==='asc'?Number(a[metric.key])-Number(b[metric.key]):Number(b[metric.key])-Number(a[metric.key]));
   const leader=players[0];
   return leader?'<div><dt>'+safe(metric.label)+'</dt><dd>'+safe(fmtMetric(leader[metric.key],metric))+'</dd><small>'+safe(leader.name)+'</small></div>':'';
  }).join('');
  if(rows)card.querySelector('.no-offseason-leaders').innerHTML=rows;
  const sourceLink=card.querySelector('[data-source-link]');
  if(sourceLink&&payload.sourceUrl){sourceLink.href=payload.sourceUrl;sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';sourceLink.textContent=(payload.sourceLabel||'Official source')+' ↗';}
 }
 async function loadOffseason(){
  const cards=[...document.querySelectorAll('[data-offseason-preview]')];
  if(!cards.length)return;
  const status=document.getElementById('noOffseasonPreviewStatus');
  const results=await Promise.allSettled(cards.map(loadOffseasonCard));
  const failed=results.filter(result=>result.status==='rejected').length;
  if(status)status.textContent=failed===cards.length?'Final 2026 boards are saved on this page. The latest source check is delayed.':failed?'One season feed is delayed; its last verified final values remain visible.':'Final boards checked '+fmtTime()+' · rechecks every 10 minutes.';
 }
 if(ncaawHost){loadNcaaw();setInterval(loadNcaaw,10*60*1000);}
 if(document.querySelector('[data-offseason-preview]')){loadOffseason();setInterval(loadOffseason,10*60*1000);}
})();