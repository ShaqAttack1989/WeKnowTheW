(()=>{
  const ensureTeamUsaLink=()=>{
    const group=document.querySelector('[data-nav-section="offseason"]');
    const menu=group?.querySelector('.nav-menu-section');
    if(!menu)return false;
    if(menu.querySelector('a[href="/team-usa.html"]'))return true;
    const link=document.createElement('a');
    link.href='/team-usa.html';
    link.textContent='Team USA HQ';
    const fibaLink=menu.querySelector('a[href="/fiba-world-cup.html"]');
    if(fibaLink)fibaLink.before(link);else menu.appendChild(link);
    return true;
  };

  if(ensureTeamUsaLink())return;
  const observer=new MutationObserver(()=>{
    if(ensureTeamUsaLink())observer.disconnect();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.setTimeout(()=>observer.disconnect(),5000);
})();
