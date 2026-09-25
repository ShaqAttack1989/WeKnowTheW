(()=>{
  const loadScript=src=>new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=src;
    script.async=false;
    script.onload=resolve;
    script.onerror=reject;
    document.head.appendChild(script);
  });

  loadScript('/home-live-core.js?v=20260925-shared-cache-v2')
    .then(()=>{
      const needsLegacyPreview=document.querySelector('.home-season-spotlight a[href="/live-stats.html"] .season-story-media img,.home-season-spotlight a[href="/around-the-w.html"] .season-story-media img');
      return needsLegacyPreview?loadScript('/homepage-card-previews.js?v=20260925-on-demand-v2'):undefined;
    })
    .catch(error=>console.warn('Homepage live modules could not load',error));
})();
