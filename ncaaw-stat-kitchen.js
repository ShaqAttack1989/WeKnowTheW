(()=> {
 const API='/api/ncaaw-stat-kitchen';
 const state={busy:false,timer:null};
 const $=id=>document.getElementById(id);
 const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
 const fmtDate=value=>{if(!value)return'';const d=new Date(value);return Number.isNaN(+d)?String(value):d.toLocaleDateString(undefined,{month:'short',day:'numeric'})};
 const fmtTime=value=>{if(!value)return'';const d=new Date(value);return Number.isNaN(+d)?String(value):d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})};
 function statsMap(entry){const map={};for(const s of entry?.stats||[])map[s.name]=s.displayValue??s.value;return map}
 function findGroups(node,out=[],parentName=''){
  if(!node||typeof node!=='object')return out;
  if(Array.isArray(node.entries)&&node.entries.some(e=>e.team)){const own=node.name||node.abbreviation||'';out.push({name:/^overall$/i.test(own)?(parentName||'Division I'):own||parentName||'Division I',entries:node.entries});return out}
  const nextName=node.name&&!/^overall$/i.test(node.name)?node.name:(node.abbreviation||parentName);
  for(const [key,val]of Object.entries(node))if(key!=='entries'&&val&&typeof val==='object')findGroups(val,out,nextName);
  return out;
 }
 const teamLogo=team=>team?.logos?.[0]?.href||team?.logo||'';
 function renderStandings(data){
  const root=$('ncaawStandings');if(!root)return;
  const groups=findGroups(data?.children||data?.standings||data);
  if(!groups.length){root.innerHTML='<p class="ncaaw-empty">Standings have not been posted by the feed yet. Open the official NCAA standings for the current table.</p>';return}
  root.innerHTML=groups.map(group=>{
   const rows=group.entries.map(e=>({team:e.team||{},s:statsMap(e)})).sort((a,b)=>Number(b.s.winPercent||b.s.winningPercentage||0)-Number(a.s.winPercent||a.s.winningPercentage||0)||Number(b.s.wins||0)-Number(a.s.wins||0));
   return '<article class="ncaaw-conference"><h3>'+escape(group.name)+'</h3><div class="ncaaw-table-wrap"><table class="ncaaw-table"><thead><tr><th>Team</th><th>Conf</th><th>Overall</th></tr></thead><tbody>'+rows.map(({team,s})=>'<tr><td><span class="ncaaw-team-cell">'+(teamLogo(team)?'<img src="'+escape(teamLogo(team))+'" alt="" loading="lazy" decoding="async">':'')+'<span>'+escape(team.displayName||team.name)+'</span></span></td><td>'+escape(s.wins??'—')+'–'+escape(s.losses??'—')+'</td><td>'+escape(s.overall??s.overallRecord??s.record??'—')+'</td></tr>').join('')+'</tbody></table></div></article>'
  }).join('');
 }
 function renderRankings(data){
  const root=$('ncaawRankings');if(!root)return;
  const polls=data?.rankings||data?.polls||[];
  if(!polls.length){root.innerHTML='<p class="ncaaw-empty">The latest poll feed is not available yet. Check the official NCAA rankings page for current polls.</p>';return}
  root.innerHTML=polls.map(poll=>{
   const teams=poll.ranks||poll.entries||poll.teams||[];
   return '<article class="ncaaw-poll"><h3>'+escape(poll.name||poll.shortName||'National Poll')+'</h3><div class="ncaaw-table-wrap"><table class="ncaaw-table"><thead><tr><th>#</th><th>Team</th><th>Record</th></tr></thead><tbody>'+teams.slice(0,25).map((r,i)=>{const t=r.team||{};return '<tr><td class="ncaaw-rank">'+escape(Number(r.current)>0?r.current:(Number(r.rank)>0?r.rank:i+1))+'</td><td><span class="ncaaw-team-cell">'+(teamLogo(t)?'<img src="'+escape(teamLogo(t))+'" alt="" loading="lazy" decoding="async">':'')+'<span>'+escape(t.displayName||t.name||r.name)+'</span></span></td><td>'+escape(r.recordSummary||r.record||'—')+'</td></tr>'}).join('')+'</tbody></table></div><small>Updated '+escape(fmtDate(poll.lastUpdated||data.lastUpdated))+'</small></article>'
  }).join('');
 }
 function renderScores(data){
  const root=$('ncaawScores');if(!root)return;
  const events=data?.events||[];
  if(!events.length){root.innerHTML='<p class="ncaaw-empty">No Division I games are listed across the current date window. Check the NCAA scoreboard for the full schedule.</p>';return}
  root.innerHTML=events.map(event=>{
   const comp=event.competitions?.[0]||{},competitors=comp.competitors||[];
   const status=comp.status?.type?.shortDetail||comp.status?.type?.description||event.status?.type?.shortDetail||'Scheduled';
   return '<article class="ncaaw-game"><div class="ncaaw-game-top"><span>'+escape(fmtDate(event.date))+'</span><span class="ncaaw-game-status">'+escape(status)+'</span></div>'+competitors.map(c=>'<div class="ncaaw-game-team"><span>'+(teamLogo(c.team)?'<img src="'+escape(teamLogo(c.team))+'" alt="" loading="lazy" decoding="async">':'')+escape(c.team?.displayName||c.team?.name||'Team')+'</span><span class="ncaaw-game-score">'+escape(c.score&&c.score!=='0'?c.score:(/scheduled|pre-game|pregame/i.test(status)?'—':c.score||'—'))+'</span></div>').join('')+'</article>'
  }).join('');
 }
 const leaderInfo={
  pointsPerGame:{label:'Points per game',short:'PPG'},
  totalPoints:{label:'Total points',short:'PTS'},
  reboundsPerGame:{label:'Rebounds per game',short:'RPG'},
  assistsPerGame:{label:'Assists per game',short:'APG'},
  stealsPerGame:{label:'Steals per game',short:'SPG'},
  blocksPerGame:{label:'Blocks per game',short:'BPG'}
 };
 function renderLeaderRows(root,leaders,key,updatedAt){
  const target=root.querySelector('[data-ncaaw-leader-rows]');if(!target)return;
  const rows=leaders?.[key]||[];
  if(!rows.length){target.innerHTML='<p class="ncaaw-empty">This leaderboard is not available from the live feed right now. Try refreshing or use the official NCAA statistics link.</p>';return}
  target.innerHTML=rows.map(player=>{
   const name=escape(player.name||'Player'),team=escape(player.team||'School');
   const initials=name.split(/\s+/).map(word=>word[0]).slice(0,2).join('').toUpperCase();
   const portrait=player.photo?'<img src="'+escape(player.photo)+'" alt="" loading="lazy" decoding="async">':'<span>'+escape(initials)+'</span>';
   const logo=player.teamLogo?'<img src="'+escape(player.teamLogo)+'" alt="" loading="lazy" decoding="async">':'';
   const profile=player.profileUrl?'<a href="'+escape(player.profileUrl)+'" target="_blank" rel="noopener noreferrer" aria-label="Open '+name+' profile">'+name+'</a>':name;
   const gp=player.gamesPlayed==null?'':'<span class="ncaaw-leader-gp">'+escape(player.gamesPlayed)+' GP</span>';
   return '<article class="ncaaw-leader-row"><span class="ncaaw-leader-rank">'+escape(player.rank)+'</span><span class="ncaaw-leader-photo">'+portrait+'</span><span class="ncaaw-leader-player"><strong>'+profile+'</strong><small>'+logo+team+'</small></span><span class="ncaaw-leader-value">'+escape(player.displayValue||'—')+'</span>'+gp+'</article>';
  }).join('');
  const status=root.querySelector('[data-ncaaw-leader-status]');if(status)status.textContent=updatedAt?'Feed updated '+fmtTime(updatedAt):'Live player statistics';
 }
 function renderLeaders(leaders,updatedAt){
  document.querySelectorAll('[data-ncaaw-leaders]').forEach(root=>{
   let active=root.dataset.defaultMetric||'pointsPerGame';
   const tabs=[...root.querySelectorAll('[data-leader-key]')];
   const draw=()=>{
    const info=leaderInfo[active]||leaderInfo.pointsPerGame;
    tabs.forEach(button=>{const on=button.dataset.leaderKey===active;button.setAttribute('aria-selected',String(on));button.classList.toggle('is-active',on)});
    const label=root.querySelector('[data-ncaaw-leader-label]');if(label)label.textContent=info.label;
    renderLeaderRows(root,leaders,active,updatedAt);
   };
   if(!root.dataset.ncaawBound){
    tabs.forEach(button=>button.addEventListener('click',()=>{active=button.dataset.leaderKey;draw()}));
    root.dataset.ncaawBound='true';
   }
   draw();
  });
 }
 function renderTabs(){
  document.querySelectorAll('.ncaaw-tab').forEach(button=>button.addEventListener('click',()=>{
   const name=button.dataset.tab;
   document.querySelectorAll('.ncaaw-tab').forEach(item=>{const active=item.dataset.tab===name;item.classList.toggle('is-active',active);item.setAttribute('aria-selected',String(active))});
   document.querySelectorAll('.ncaaw-board').forEach(panel=>{const active=panel.id==='panel-'+name;panel.classList.toggle('is-active',active);panel.hidden=!active});
  }));
 }
 async function load(){
  if(state.busy)return;state.busy=true;
  const label=$('kitchenUpdate');
  try{
   const response=await fetch(API,{cache:'no-store'});if(!response.ok)throw new Error('Feed response '+response.status);
   const data=await response.json();
   renderLeaders(data.leaders||{},data.updatedAt);
   renderStandings(data.standings);renderRankings(data.rankings);renderScores(data.scores);
   if(label)label.textContent=(data.partial?'Some feeds delayed · ':'Updated ')+fmtTime(data.updatedAt)+' · refreshes every 10 minutes';
  }catch(error){
   if(label)label.textContent='Live feed is temporarily unavailable · try refreshing';
   document.querySelectorAll('[data-ncaaw-leaders]').forEach(root=>renderLeaderRows(root,{},root.dataset.defaultMetric||'pointsPerGame',''));
   ['ncaawStandings','ncaawRankings','ncaawScores'].forEach(id=>{const root=$(id);if(root&&!root.dataset.loaded)root.innerHTML='<p class="ncaaw-error">We could not reach this feed just now. Use the official NCAA link above or refresh shortly.</p>'});
  }finally{state.busy=false}
 }
 renderTabs();
 $('kitchenRefresh')?.addEventListener('click',load);
 load();state.timer=setInterval(load,10*60*1000);
})();