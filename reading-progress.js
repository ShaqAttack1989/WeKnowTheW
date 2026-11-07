(() => {
  const bar=document.createElement('div');
  bar.className='reading-progress';
  bar.setAttribute('role','progressbar');
  bar.setAttribute('aria-label','Article reading progress');
  bar.setAttribute('aria-valuemin','0');
  bar.setAttribute('aria-valuemax','100');
  bar.innerHTML='<span></span>';
  document.body.appendChild(bar);
  const fill=bar.firstElementChild;
  let article=null,queued=false;
  const update=()=>{
    queued=false;
    if(!article){bar.hidden=true;return;}
    const start=window.scrollY+article.getBoundingClientRect().top;
    const distance=Math.max(1,article.offsetHeight-window.innerHeight);
    const percent=Math.max(0,Math.min(100,((window.scrollY-start)/distance)*100));
    fill.style.transform='scaleX('+(percent/100)+')';
    bar.setAttribute('aria-valuenow',String(Math.round(percent)));
    bar.hidden=false;
  };
  const queue=()=>{if(!queued){queued=true;requestAnimationFrame(update);}};
  const findArticle=()=>{
    const next=document.querySelector('#snackCollectionStory .snack-post');
    if(next!==article){article=next;queue();}
  };
  new MutationObserver(findArticle).observe(document.getElementById('snackCollectionStory')||document.body,{childList:true,subtree:true});
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue,{passive:true});
  findArticle();
})();
