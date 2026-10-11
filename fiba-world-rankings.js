(()=>{
  const root=document.getElementById('fibaWorldCupHub');
  if(!root)return;

  const FALLBACK=[
    ['USA','United States','🇺🇸',1,719.1],['FRA','France','🇫🇷',2,596.6],['AUS','Australia','🇦🇺',3,596.4],['CHN','China','🇨🇳',4,585.8],
    ['BEL','Belgium','🇧🇪',5,585.5],['ESP','Spain','🇪🇸',6,574.2],['NGR','Nigeria','🇳🇬',8,525.2],['JPN','Japan','🇯🇵',10,505.1],
    ['GER','Germany','🇩🇪',11,504.8],['PUR','Puerto Rico','🇵🇷',13,445.5],['ITA','Italy','🇮🇹',14,412.6],['KOR','Korea','🇰🇷',15,405.5],
    ['TUR','Türkiye','🇹🇷',16,338.8],['CZE','Czechia','🇨🇿',17,337.3],['MLI','Mali','🇲🇱',18,302.4],['HUN','Hungary','🇭🇺',19,293.5]
  ].map(([code,name,flag,worldRank,rankingPoints])=>({code,name,flag,worldRank,rankingPoints}));
  const GROUPS={JPN:'A',ESP:'A',GER:'A',MLI:'A',HUN:'B',KOR:'B',NGR:'B',FRA:'B',BEL:'C',AUS:'C',PUR:'C',TUR:'C',USA:'D',CZE:'D',ITA:'D',CHN:'D'};
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  let rankings=FALLBACK;
  let rankMap=new Map(rankings.map(item=>[item.code,item]));

  const style=document.createElement('style');
  style.dataset.fibaWorldRankings='true';
  style.textContent=`
    .fiba-world-ranking-panel{margin-top:26px;background:linear-gradient(145deg,#fff,#f3f7fc)}
    .fiba-world-ranking-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:2px 0 14px;color:#718096;font-size:.65rem;font-weight:800}
    .fiba-world-ranking-meta b{padding:5px 8px;border-radius:999px;background:#0d2a4e;color:#fff;letter-spacing:.05em}
    .fiba-world-ranking-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
    .fiba-world-rank-card{display:grid;grid-template-columns:42px auto 1fr;gap:8px;align-items:center;padding:12px;border:1px solid #e0e7f0;border-radius:16px;background:#fff;min-width:0}
    .fiba-world-rank-card.is-usa{border:2px solid #a61f32;background:linear-gradient(135deg,#fff7f8,#eef5ff)}
    .fiba-world-rank-number{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#0d2a4e;color:#ffcf45;font-size:1rem;font-weight:950}
    .fiba-world-rank-card.is-usa .fiba-world-rank-number{background:#a61f32;color:#fff}
    .fiba-world-rank-flag{font-size:1.4rem}
    .fiba-world-rank-copy{min-width:0}
    .fiba-world-rank-copy strong{display:block;color:#17243a;font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .fiba-world-rank-copy span{display:block;margin-top:2px;color:#758296;font-size:.58rem;font-weight:800}
    .fiba-world-ranking-key{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}
    .fiba-world-ranking-key span{padding:6px 8px;border-radius:9px;background:#eaf0f7;color:#5c697a;font-size:.59rem;font-weight:800}
    .fiba-world-ranking-key b{color:#18385f}
    .fiba-group-head.has-world-rank,.fiba-group-row.has-world-rank{grid-template-columns:minmax(0,1fr) 38px 32px 32px 42px}
    .fiba-group-row .fiba-world-rank-cell{text-align:center!important;color:#37689e;font-weight:950!important}
    .fiba-group-row.team-usa .fiba-world-rank-cell{color:#a61f32}
    @media(max-width:980px){.fiba-world-ranking-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:620px){.fiba-world-ranking-grid{grid-template-columns:1fr}.fiba-world-rank-card{grid-template-columns:42px auto 1fr}}
  `;
  if(!document.querySelector('style[data-fiba-world-rankings]'))document.head.appendChild(style);

  function renderBoard(payload={}){
    rankings=(payload.rankings||FALLBACK).slice().sort((a,b)=>a.worldRank-b.worldRank);
    rankMap=new Map(rankings.map(item=>[item.code,item]));
    const grid=document.getElementById('fibaWorldRankingGrid');
    if(grid){
      grid.innerHTML=rankings.map(item=>`<article class="fiba-world-rank-card ${item.code==='USA'?'is-usa':''}">
        <span class="fiba-world-rank-number">#${safe(item.worldRank)}</span>
        <span class="fiba-world-rank-flag">${safe(item.flag||'')}</span>
        <div class="fiba-world-rank-copy"><strong>${safe(item.code)} · ${safe(item.name)}</strong><span>${safe(Number(item.rankingPoints).toFixed(1))} pts · Group ${safe(GROUPS[item.code]||'—')}</span></div>
      </article>`).join('');
    }
    const meta=document.getElementById('fibaWorldRankingMeta');
    if(meta){
      const date=payload.rankingDate||'Apr 1, 2026';
      const state=payload.live?'FIBA RANKING CONNECTED':'VERIFIED FIBA SNAPSHOT';
      meta.innerHTML=`<b>${safe(state)}</b><span>Ranking date: ${safe(date)}</span><span>·</span><span>Only the 16 Berlin World Cup countries are shown.</span>`;
    }
    const note=document.getElementById('fibaWorldRankingNote');
    if(note)note.textContent=payload.warning||'World rank is separate from World Cup group position and tournament record.';
    injectIntoStandings();
  }

  function injectIntoStandings(){
    const standings=document.getElementById('fibaStandingsGrid');
    if(!standings)return;
    standings.querySelectorAll('.fiba-group-card').forEach(card=>{
      const head=card.querySelector('.fiba-group-head');
      if(head&&!head.querySelector('[data-world-rank-head]')){
        const cell=document.createElement('span');
        cell.dataset.worldRankHead='true';
        cell.textContent='WR';
        head.insertBefore(cell,head.children[1]||null);
      }
      head?.classList.add('has-world-rank');
      card.querySelectorAll('.fiba-group-row').forEach(row=>{
        const code=row.querySelector('strong')?.textContent?.trim();
        const item=rankMap.get(code);
        if(!item)return;
        let cell=row.querySelector('[data-world-rank-cell]');
        if(!cell){
          cell=document.createElement('span');
          cell.dataset.worldRankCell='true';
          cell.className='fiba-world-rank-cell';
          row.insertBefore(cell,row.children[1]||null);
        }
        cell.textContent=`#${item.worldRank}`;
        cell.title=`FIBA World Rank: ${item.name} #${item.worldRank}`;
        row.classList.add('has-world-rank');
      });
    });
  }

  const standings=document.getElementById('fibaStandingsGrid');
  if(standings){
    let queued=false;
    const observer=new MutationObserver(()=>{
      if(queued)return;
      queued=true;
      requestAnimationFrame(()=>{queued=false;injectIntoStandings();});
    });
    observer.observe(standings,{childList:true,subtree:true});
  }

  renderBoard({rankingDate:'Apr 1, 2026',live:false,rankings:FALLBACK});
  fetch('/api/fiba-world-ranking',{headers:{Accept:'application/json'}})
    .then(response=>response.ok?response.json():Promise.reject(new Error(`Ranking feed returned ${response.status}`)))
    .then(renderBoard)
    .catch(()=>renderBoard({rankingDate:'Apr 1, 2026',live:false,rankings:FALLBACK,warning:'Official ranking refresh is temporarily unavailable; the verified Apr 1, 2026 FIBA ranking snapshot remains displayed.'}));
})();
