(()=>{
  const ensureFibaLink=()=>{
    const menu=document.querySelector('.no-offseason-menu');
    if(!menu)return false;
    if(menu.querySelector('a[href="/fiba-world-cup.html"]'))return true;
    const link=document.createElement('a');
    link.className='nav-direct-link';
    link.href='/fiba-world-cup.html';
    link.textContent='FIBA World Cup · Team USA';
    const parent=menu.querySelector('a[href="/no-offseason.html"]');
    if(parent)parent.insertAdjacentElement('afterend',link);
    else menu.prepend(link);
    return true;
  };

  if(ensureFibaLink())return;
  const observer=new MutationObserver(()=>{
    if(ensureFibaLink())observer.disconnect();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.setTimeout(()=>observer.disconnect(),5000);
})();
