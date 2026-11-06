(function(){
 const tabs=document.getElementById('projectBStopTabs'),panel=document.getElementById('projectBStopPanel');
 if(!tabs||!panel)return;
 const stops=[
  {city:'Hangzhou',country:'China',window:'January 19–24, 2027',venue:'Hangzhou Olympic Sports AT Center Gymnasium',detail:'The first competition stop of the inaugural global basketball Grand Prix. The official announcement places the event in Hangzhou and confirms the arena.',source:'https://finance.yahoo.com/media-advertising/articles/project-b-announces-hangzhou-china-100000784.html',sourceLabel:'Project B announcement via Business Wire ↗',accent:'#23b7c8'},
  {city:'Valencia',country:'Spain',window:'March 2027',venue:'Roig Arena',detail:'A European stop on the inaugural circuit. The host arena and Valencia event listing both identify March 2027; the published closing date differs by one day between those calendars.',source:'https://www.roigarena.com/en/noticias/roig-arena-acogera-nuevo-torneo-mundial-baloncesto-project-b/',sourceLabel:'Roig Arena announcement ↗',secondSource:'https://www.fdmvalencia.es/es/eventos/project-b/',secondSourceLabel:'Valencia city event listing ↗',accent:'#f5ae36'},
  {city:'Tokyo',country:'Japan',window:'March 26–April 4, 2027',venue:'Toyota Arena Tokyo',detail:'Project B’s official announcement confirms Tokyo as a host city and names the March 26–April 4 event window.',source:'https://www.linkedin.com/posts/projectb-global_project-bs-core-has-always-been-to-grow-activity-7416992968013709312-mzYM',sourceLabel:'Project B Tokyo announcement ↗',accent:'#9c69d5'}
 ];
 function render(index){
  const stop=stops[index]||stops[0];
  tabs.querySelectorAll('[data-stop]').forEach((button,i)=>{const active=i===index;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));});
  const tab=tabs.querySelector('[data-stop="'+index+'"]');
  panel.setAttribute('aria-labelledby',tab?tab.id:'');
  panel.style.setProperty('--project-stop-accent',stop.accent);
  panel.innerHTML='<article class="project-b-stop-card"><div class="project-b-stop-mark" aria-hidden="true"><span>'+String(index+1).padStart(2,'0')+'</span><strong>TOUR STOP</strong></div><div class="project-b-stop-copy"><span>'+stop.country+' · ANNOUNCED HOST CITY</span><h3>'+stop.city+'</h3><strong class="project-b-stop-window">'+stop.window+'</strong><p class="project-b-stop-venue">'+stop.venue+'</p><p>'+stop.detail+'</p><div class="project-b-stop-sources"><a href="'+stop.source+'" target="_blank" rel="noopener noreferrer">'+stop.sourceLabel+'</a>'+(stop.secondSource?'<a href="'+stop.secondSource+'" target="_blank" rel="noopener noreferrer">'+stop.secondSourceLabel+'</a>':'')+'</div></div></article>';
 }
 tabs.querySelectorAll('[data-stop]').forEach((button,index)=>{button.id='projectBStopTab'+index;button.addEventListener('click',()=>render(index));});
 render(0);
})();