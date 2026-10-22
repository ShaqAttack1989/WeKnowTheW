(()=> {
 const BOX_URL='https://www.wnba.com/game/gsv-vs-atl-1042600303/box-score';
 const GAME_URL='https://www.wnba.com/game/gsv-vs-atl-1042600303';
 const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function init(){
  if(new URLSearchParams(location.search).get('post')!=='the-playoff-watch-party-2026')return;
  const article=document.querySelector('.snack-post');
  if(!article||article.querySelector('.fgd-live'))return;
  const status=article.querySelector("#finals-game3-score-anchor");
  if(!status)return;
  const board=document.createElement('section');
  board.className='fgd-live snack-section';
  board.setAttribute('aria-label','Finals Game 3 confirmed final scoreboard');
  board.innerHTML='<div class="fgd-live-head"><div><p class="fgd-live-kicker">FINALS GAME 3 · FINAL SCORE</p><h3>Atlanta closes strong</h3><p>Atlanta finished with a 97–71 win at State Farm Arena.</p></div><span class="fgd-live-status is-final">FINAL</span></div><div class="fgd-live-scoreline"><div class="fgd-live-team is-gsv"><span>GOLDEN STATE</span><strong>71</strong></div><div class="fgd-live-middle">FINAL<small>GAME 3</small></div><div class="fgd-live-team is-atl"><span>ATLANTA</span><strong>97</strong></div></div><div class="fgd-live-meta"><span>State Farm Arena · Atlanta</span><span>Official WNBA box score</span><span>October 21, 2026</span></div><div class="fgd-live-series">Atlanta leads the best-of-seven Finals 2–1.</div><div class="fgd-live-links"><a href="'+BOX_URL+'" target="_blank" rel="noopener noreferrer">Official WNBA box score ↗</a><a href="'+GAME_URL+'" target="_blank" rel="noopener noreferrer">Game 3 details ↗</a></div>';
  status.after(board);
 }
 new MutationObserver(init).observe(document.body,{childList:true,subtree:true});
 init();
})();
