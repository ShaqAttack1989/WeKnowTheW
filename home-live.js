(()=>{
  const loadScript=src=>new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=src;
    script.async=false;
    script.onload=resolve;
    script.onerror=reject;
    document.head.appendChild(script);
  });

  loadScript('/home-live-core.js?v=20260917-home-preview-v1')
    .then(()=>loadScript('/homepage-card-previews.js?v=20260917-home-preview-v1'))
    .catch(error=>console.warn('Homepage live modules could not load',error));
})();
