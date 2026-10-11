(function(){
  const OLIVIA_VUKOSA_PHOTO='https://images.sidearmdev.com/resize?height=300&type=webp&url=https%3A%2F%2Fdxbhsrqyrr690.cloudfront.net%2Fsidearm.nextgen.sites%2Fuconnhuskies.com%2Fimages%2F2025%2F11%2F12%2F20251011_WBBRecruit_0064__1_.jpg';

  function applyOliviaPhoto(){
    for(const card of document.querySelectorAll('.prospect-card')){
      const name=card.querySelector('h3')?.textContent?.trim();
      if(name!=='Olivia Vukosa')continue;
      const photo=card.querySelector('.prospect-photo');
      if(!photo)continue;
      let img=photo.querySelector('img');
      if(!img){
        img=document.createElement('img');
        photo.prepend(img);
      }
      img.src=OLIVIA_VUKOSA_PHOTO;
      img.alt='Olivia Vukosa';
      img.loading='lazy';
      img.decoding='async';
      img.referrerPolicy='no-referrer';
      img.onerror=function(){this.hidden=true;photo.classList.add('photo-fallback');};
      photo.classList.remove('photo-fallback');
    }
  }

  document.addEventListener('DOMContentLoaded',applyOliviaPhoto);
  new MutationObserver(applyOliviaPhoto).observe(document.documentElement,{childList:true,subtree:true});
})();
