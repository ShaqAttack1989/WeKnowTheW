(()=>{
  // Official team articles are the first choice for coaching portraits.
  // Existing card artwork remains until a real image is fully loaded.
  const byName = new Map();
  for (const coach of (typeof COURTSIDE_COACHES !== 'undefined' ? COURTSIDE_COACHES : [])) {
    if (coach.name && coach.source && !/vacancy/i.test(coach.name)) byName.set(coach.name, coach.source);
  }
  for (const coach of (typeof COURT_TO_CLIPBOARD !== 'undefined' ? COURT_TO_CLIPBOARD : [])) {
    if (coach.name && coach.source) byName.set(coach.name, coach.source);
  }
  const attempted = new WeakSet();
  const verified = new Map();
  async function imageFromSource(source) {
    if (!verified.has(source)) {
      verified.set(source, fetch('/api/culture-image?url='+encodeURIComponent(source)+'&v=20261009-portrait-audit', {
        headers:{Accept:'application/json'}
      }).then(async response => {
        if (!response.ok) return null;
        const data = await response.json();
        if (!data.found || !/^https?:\/\//i.test(data.image||'')) return null;
        return {image:data.image,source:data.sourceUrl||source};
      }).catch(()=>null));
    }
    return verified.get(source);
  }
  function preload(src) {
    return new Promise(resolve=>{
      const img = new Image();
      img.onload=()=>resolve(img);
      img.onerror=()=>resolve(null);
      img.src=src;
    });
  }
  async function repair(card) {
    const name=card.querySelector('h3')?.textContent?.trim();
    const photo=card.querySelector('.culture-photo');
    const source=byName.get(name);
    if (!photo || !source || attempted.has(photo)) return;
    attempted.add(photo);
    // The normal image resolver gets first chance; the official source is a backup.
    const result=await imageFromSource(source);
    if (!result) return;
    const img=await preload(result.image);
    if (!img || !photo.isConnected) return;
    const current=photo.querySelector('img');
    if (current && current.complete && current.naturalWidth>0 && !current.classList.contains('is-fallback')) return;
    img.alt=name+' — official coaching portrait';
    img.className='culture-verified-portrait';
    img.loading='lazy';
    img.decoding='async';
    photo.querySelectorAll('img,.culture-photo-credit').forEach(node=>node.remove());
    photo.querySelector('.culture-initials')?.remove();
    photo.prepend(img);
    const credit=document.createElement('a');
    credit.className='culture-photo-credit';
    credit.href=result.source;
    credit.target='_blank';
    credit.rel='noopener noreferrer';
    credit.textContent='Official team photo';
    photo.append(credit);
  }
  function scan(){ document.querySelectorAll('#cultureGrid .culture-card, #clipboardGrid .culture-card').forEach(repair); }
  scan();
  for(const target of [document.getElementById('cultureGrid'),document.getElementById('clipboardGrid')].filter(Boolean)){
    new MutationObserver(scan).observe(target,{childList:true});
  }
})();