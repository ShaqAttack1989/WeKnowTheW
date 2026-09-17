(()=>{
  const BASE='/assets/images/snack-shak/welcome-back-playoff-field-story-hq';
  const PART_COUNT=10;
  const ALT='2026 WNBA playoff field showing the eight seeded teams, records, featured players and championship history through September 16';

  async function loadHqSrc(){
    const parts=await Promise.all(Array.from({length:PART_COUNT},(_,i)=>i+1).map(index=>
      fetch(`${BASE}/part-${index}.txt?v=20260916-hq2`,{cache:'force-cache'}).then(response=>{
        if(!response.ok)throw new Error(`HQ playoff field image part ${index} returned ${response.status}`);
        return response.text();
      })
    ));
    return `data:image/avif;base64,${parts.join('')}`;
  }

  async function upgradePlayoffField(){
    const main=document.querySelector('main');
    const briefing=document.getElementById('briefing');
    if(!main||!briefing)return;
    try{
      const src=await loadHqSrc();
      const existing=document.getElementById('playoffFieldFeature');
      const section=document.createElement('section');
      section.className='wbw-playoff-field-feature';
      section.id='playoffFieldFeature';
      section.dataset.storyImageQuality='hq';
      section.setAttribute('aria-label','2026 WNBA playoff field');
      section.innerHTML=`<div class="page-shell"><div class="wbw-playoff-field-intro"><p class="kicker">THE FIELD IS SET</p><h2>Eight teams. One trophy. The receipts are here.</h2><p>Seeds and records through Sept. 16, paired with each franchise's playoff history through 2025.</p></div><figure class="wbw-playoff-field-figure"><img alt="${ALT}" width="1040" height="1300" loading="eager" decoding="async"><figcaption><strong>2026 PLAYOFF FIELD</strong> · Your quick visual before the September 17 return night sprint.</figcaption></figure></div>`;
      section.querySelector('img').src=src;
      if(existing)existing.replaceWith(section);
      else main.insertBefore(section,briefing);
    }catch(error){
      console.warn('Welcome Back HQ playoff field image could not load',error);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',upgradePlayoffField,{once:true});
  else upgradePlayoffField();
})();
