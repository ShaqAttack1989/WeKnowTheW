(()=>{
  if(location.pathname!=='/team.html')return;
  const team=new URLSearchParams(location.search).get('team')||'';
  if(!team)return;

  const REFRESH_MS=30*60*1000;
  const RETURN_REFRESH_MS=10*60*1000;
  let lastRefresh=Date.now();
  let refreshing=false;

  function annotateStatus(){
    const status=document.getElementById('teamDnaStatus');
    if(!status)return false;
    if(!/auto refresh/i.test(status.textContent||'')){
      status.insertAdjacentText('beforeend',' · Auto refresh every 30 min');
    }
    return true;
  }

  function cleanDuplicateStyles(){
    ['/rivalry.css','/team-dna.css'].forEach(part=>{
      const links=[...document.querySelectorAll(`link[rel="stylesheet"][href*="${part}"]`)];
      if(links.length>1)links.slice(0,-1).forEach(link=>link.remove());
    });
  }

  function refreshBoards(reason='scheduled update'){
    if(refreshing||document.visibilityState==='hidden')return;
    refreshing=true;
    const status=document.getElementById('teamDnaStatus');
    if(status)status.textContent=`Refreshing Team DNA… · ${reason}`;

    const script=document.createElement('script');
    script.src=`/team-rivalry.js?auto=${Date.now()}`;
    script.dataset.teamDnaAutoRefresh='true';
    script.onload=()=>{
      lastRefresh=Date.now();
      refreshing=false;
      cleanDuplicateStyles();
      setTimeout(annotateStatus,250);
      script.remove();
    };
    script.onerror=()=>{
      refreshing=false;
      if(status)status.textContent='Auto refresh will retry shortly';
      script.remove();
    };
    document.body.appendChild(script);
  }

  const watcher=new MutationObserver(()=>annotateStatus());
  watcher.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(annotateStatus,750);
  setTimeout(()=>{annotateStatus();watcher.disconnect();},10000);

  setInterval(()=>refreshBoards('scheduled update'),REFRESH_MS);

  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible'&&Date.now()-lastRefresh>=RETURN_REFRESH_MS){
      refreshBoards('welcome back');
    }
  });

  window.addEventListener('online',()=>{
    if(Date.now()-lastRefresh>=5*60*1000)refreshBoards('connection restored');
  });
})();