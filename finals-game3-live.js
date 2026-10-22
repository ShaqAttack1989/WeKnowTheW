(()=> {
 const GAME_ID='1042600303';
 const LIVE_URL='https://www.wnba.com/game/gsv-vs-atl-1042600303';
 const BOX_URL='https://www.wnba.com/game/gsv-vs-atl-1042600303/box-score';
 const norm=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 async function refresh(board){
  if(!board||board.dataset.loading==='true')return;
  board.dataset.loading='true';
  try{
   const response=await fetch('/api/live-games?cb='+Date.now(),{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
   const payload=await response.json().catch(()=>({}));
   if(!response.ok)throw Error('Live score unavailable');
   const slate=[...(payload.todayGames||[]),...(payload.games||[])];
   const game=slate.find(item=>{
    const id=String(item.id||item.gameId||'');
    const teams=norm(item.homeTeam)+'|'+norm(item.awayTeam);
    return id===GAME_ID||item.gameId===GAME_ID||(String(item.date||'')==='2026-10-21'&&teams.includes('atlantadream')&&teams.includes('goldenstatevalkyries'));
   });
   if(!game){
    board.innerHTML='<div class="fgd-live-head"><div><p class="fgd-live-kicker">FINALS GAME 3 · LIVE TRACKER</p><h3>Dreams to Nightmares</h3><p>The official live score is reconnecting. Open the WNBA game page for the current box score.</p></div><span class="fgd-live-status">CONNECTING</span></div><div class="fgd-live-links"><a href="'+LIVE_URL+'" target="_blank" rel="noopener noreferrer">Official WNBA Game 3 page ↗</a></div>';
    return;
   }
   const away=game.awayTeam||'Golden State Valkyries',home=game.homeTeam||'Atlanta Dream';
   const final=Boolean(game.completed)||String(game.state||'').toLowerCase()==='post'||/final/i.test(String(game.status||''));
   const live=String(game.state||'').toLowerCase()==='in';
   const label=final?'FINAL':live?'LIVE':'SCHEDULED';
   const awayScore=game.awayScore??'–',homeScore=game.homeScore??'–';
   const winner=final?(Number(homeScore)>Number(awayScore)?home:away):'';
   const series=final?winner+' leads the best-of-seven Finals 2–1.':live?'The series entered Game 3 tied 1–1. A win tonight gives the winner a 2–1 lead.':'The series is tied 1–1 entering Game 3.';
   const updated=payload.updatedAt?new Date(payload.updatedAt):new Date();
   const stamp=Number.isNaN(updated.getTime())?'':updated.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
   const source=game.source||payload.source||'Live WNBA scoreboard';
   board.innerHTML='<div class="fgd-live-head"><div><p class="fgd-live-kicker">FINALS GAME 3 · LIVE TRACKER</p><h3>Dreams to Nightmares</h3><p>Follow the run that could swing the series. The score refreshes every 10 seconds.</p></div><span class="fgd-live-status'+(final?' is-final':'')+'">'+label+'</span></div><div class="fgd-live-scoreline"><div class="fgd-live-team is-gsv"><span>GOLDEN STATE</span><strong>'+esc(awayScore)+'</strong></div><div class="fgd-live-middle">'+esc(game.status||label)+'<small>GAME 3</small></div><div class="fgd-live-team is-atl"><span>ATLANTA</span><strong>'+esc(homeScore)+'</strong></div></div><div class="fgd-live-meta"><span>'+esc(home+' · '+(game.venue||'State Farm Arena'))+'</span><span>Feed: '+esc(source)+'</span><span>'+(stamp?'Updated '+esc(stamp):'Score updates automatically')+'</span></div><div class="fgd-live-series">'+esc(series)+'</div><div class="fgd-live-links"><a href="'+BOX_URL+'" target="_blank" rel="noopener noreferrer">Official WNBA box score ↗</a><a href="'+LIVE_URL+'" target="_blank" rel="noopener noreferrer">Game 3 live updates ↗</a></div>';
  }catch{
   board.innerHTML='<div class="fgd-live-head"><div><p class="fgd-live-kicker">FINALS GAME 3 · LIVE TRACKER</p><h3>Dreams to Nightmares</h3><p>The live score is reconnecting. The official WNBA page has the current game status and box score.</p></div><span class="fgd-live-status">RECONNECTING</span></div><div class="fgd-live-links"><a href="'+LIVE_URL+'" target="_blank" rel="noopener noreferrer">Official WNBA Game 3 page ↗</a></div>';
  }finally{board.dataset.loading='false';}
 }
 function init(){
  if(new URLSearchParams(location.search).get('post')!=='the-playoff-watch-party-2026')return;
  const article=document.querySelector('.snack-post');
  if(!article||article.querySelector('.fgd-live'))return;
  const status=article.querySelector('.playoff-game-one[aria-label="Finals Game 3 live status"]');
  if(!status)return;
  const board=document.createElement('section');
  board.className='fgd-live snack-section';
  board.setAttribute('aria-label','Live WNBA Finals Game 3 scoreboard');
  board.innerHTML='<p>Loading Game 3 live score…</p>';
  status.after(board);
  refresh(board);
  window.setInterval(()=>{if(!document.hidden)refresh(board);},10000);
  window.addEventListener('focus',()=>refresh(board));
 }
 new MutationObserver(init).observe(document.body,{childList:true,subtree:true});
 init();
})();
