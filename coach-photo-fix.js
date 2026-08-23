(()=>{
  const fixes={
    'Becky Hammon':{
      source:'https://aces.wnba.com/head-coach-becky-hammon',
      credit:'Official Las Vegas Aces photo'
    },
    'Sonia Raman':{
      source:'https://storm.wnba.com/news/coach-sonia-raman',
      credit:'Official Seattle Storm photo'
    },
    'Sandy Brondello':{
      source:'https://tempo.wnba.com/news/toronto-tempo-names-sandy-brondello-head-coach',
      credit:'Official Toronto Tempo photo'
    }
  };

  async function hydrateCard(card,name,config){
    const photo=card.querySelector('.culture-photo');
    if(!photo||photo.dataset.coachPhotoFixed==='true')return;
    photo.dataset.coachPhotoFixed='true';
    try{
      const response=await fetch(`/api/culture-image?url=${encodeURIComponent(config.source)}&coachPhotoFix=20260823-v1`,{headers:{Accept:'application/json'},cache:'no-store'});
      const payload=await response.json().catch(()=>({}));
      if(!response.ok||!payload?.found||!payload.image)return;
      photo.querySelectorAll('img,.culture-photo-credit').forEach(node=>node.remove());
      photo.querySelector('.culture-initials')?.remove();
      const img=document.createElement('img');
      img.src=payload.image;
      img.alt=`${name} — head coach`;
      img.loading='lazy';
      img.decoding='async';
      img.addEventListener('error',()=>img.remove(),{once:true});
      photo.prepend(img);
      const credit=document.createElement('a');
      credit.className='culture-photo-credit';
      credit.href=payload.sourceUrl||config.source;
      credit.target='_blank';
      credit.rel='noopener';
      credit.textContent=config.credit;
      photo.appendChild(credit);
    }catch{/* Existing fallback remains visible. */}
  }

  function apply(){
    document.querySelectorAll('.culture-card').forEach(card=>{
      const name=card.querySelector('h3')?.textContent?.trim();
      if(!name||!fixes[name])return;
      hydrateCard(card,name,fixes[name]);
    });
  }

  apply();
  const targets=[document.getElementById('cultureGrid'),document.getElementById('clipboardGrid')].filter(Boolean);
  targets.forEach(target=>new MutationObserver(apply).observe(target,{childList:true,subtree:true}));
  setTimeout(apply,500);
})();
