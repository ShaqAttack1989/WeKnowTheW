(()=>{
  const BASE='/assets/images/snack-shak/welcome-back-playoff-field-story-hq';
  const PART_COUNT=10;
  const ALT='2026 WNBA playoff field showing the eight seeded teams, records, featured players and championship history through September 16';
  let lastTrigger=null;

  function ensureEnhancedStyles(){
    if(document.getElementById('welcomeBackPlayoffFieldEnhancedStyles'))return;
    const style=document.createElement('style');
    style.id='welcomeBackPlayoffFieldEnhancedStyles';
    style.textContent=`
      .wbw-playoff-field-feature .wbw-playoff-field-figure{
        width:min(calc(100vw - 32px),900px)!important;
        max-width:900px!important;
        margin:0 0 0 50%!important;
        transform:translateX(-50%);
      }
      .wbw-playoff-field-open{
        display:block;
        width:100%;
        padding:0;
        border:0;
        background:transparent;
        cursor:zoom-in;
      }
      .wbw-playoff-field-feature .wbw-playoff-field-figure img{
        display:block;
        width:100%!important;
        height:auto!important;
        max-width:none!important;
      }
      .wbw-playoff-field-figure figcaption{
        padding:14px 18px 16px!important;
      }
      .wbw-playoff-field-figure .wbw-enlarge-hint{
        display:block;
        margin-top:5px;
        color:#d8d0ea;
        font-size:.78rem;
        font-weight:700;
        letter-spacing:.04em;
        text-transform:uppercase;
      }
      .wbw-playoff-lightbox[hidden]{display:none!important}
      .wbw-playoff-lightbox{
        position:fixed;
        inset:0;
        z-index:10000;
        background:rgba(8,4,20,.94);
        overflow:auto;
        overscroll-behavior:contain;
        padding:54px 12px 24px;
      }
      .wbw-playoff-lightbox-inner{
        min-height:calc(100vh - 78px);
        display:flex;
        align-items:flex-start;
        justify-content:center;
      }
      .wbw-playoff-lightbox img{
        display:block;
        width:min(96vw,1040px);
        height:auto;
        max-width:none;
        border-radius:16px;
        box-shadow:0 24px 70px rgba(0,0,0,.45);
        cursor:zoom-in;
        touch-action:pinch-zoom;
      }
      .wbw-playoff-lightbox img.is-zoomed{
        width:1040px;
        cursor:zoom-out;
      }
      .wbw-playoff-lightbox-close{
        position:fixed;
        top:10px;
        right:10px;
        z-index:10001;
        width:40px;
        height:40px;
        border:0;
        border-radius:999px;
        background:#fff;
        color:#160b33;
        font-size:1.7rem;
        line-height:1;
        font-weight:800;
        cursor:pointer;
        box-shadow:0 8px 24px rgba(0,0,0,.25);
      }
      @media(max-width:640px){
        .wbw-playoff-field-feature .wbw-playoff-field-figure{
          width:calc(100vw - 20px)!important;
          max-width:none!important;
        }
        .wbw-playoff-field-feature .wbw-playoff-field-intro{
          padding-left:8px;
          padding-right:8px;
        }
        .wbw-playoff-field-figure figcaption{
          font-size:.84rem!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureLightbox(){
    let lightbox=document.getElementById('welcomeBackPlayoffLightbox');
    if(lightbox)return lightbox;
    lightbox=document.createElement('div');
    lightbox.id='welcomeBackPlayoffLightbox';
    lightbox.className='wbw-playoff-lightbox';
    lightbox.hidden=true;
    lightbox.setAttribute('role','dialog');
    lightbox.setAttribute('aria-modal','true');
    lightbox.setAttribute('aria-label','Expanded 2026 WNBA playoff field graphic');
    lightbox.innerHTML=`<button class="wbw-playoff-lightbox-close" type="button" aria-label="Close enlarged graphic">×</button><div class="wbw-playoff-lightbox-inner"><img alt="${ALT}"></div>`;
    const close=()=>{
      lightbox.hidden=true;
      document.body.style.overflow='';
      const image=lightbox.querySelector('img');
      image.classList.remove('is-zoomed');
      if(lastTrigger)lastTrigger.focus({preventScroll:true});
    };
    lightbox.querySelector('.wbw-playoff-lightbox-close').addEventListener('click',close);
    lightbox.addEventListener('click',event=>{if(event.target===lightbox||event.target.classList.contains('wbw-playoff-lightbox-inner'))close();});
    lightbox.querySelector('img').addEventListener('click',event=>{
      event.stopPropagation();
      event.currentTarget.classList.toggle('is-zoomed');
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!lightbox.hidden)close();});
    document.body.appendChild(lightbox);
    return lightbox;
  }

  function openLightbox(src,trigger){
    const lightbox=ensureLightbox();
    lastTrigger=trigger;
    const image=lightbox.querySelector('img');
    image.src=src;
    image.classList.remove('is-zoomed');
    lightbox.hidden=false;
    document.body.style.overflow='hidden';
    lightbox.querySelector('.wbw-playoff-lightbox-close').focus({preventScroll:true});
  }

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
      ensureEnhancedStyles();
      const src=await loadHqSrc();
      const existing=document.getElementById('playoffFieldFeature');
      const section=document.createElement('section');
      section.className='wbw-playoff-field-feature';
      section.id='playoffFieldFeature';
      section.dataset.storyImageQuality='hq';
      section.setAttribute('aria-label','2026 WNBA playoff field');
      section.innerHTML=`<div class="page-shell"><div class="wbw-playoff-field-intro"><p class="kicker">THE FIELD IS SET</p><h2>Eight teams. One trophy. The receipts are here.</h2><p>Seeds and records through Sept. 16, paired with each franchise's playoff history through 2025.</p></div><figure class="wbw-playoff-field-figure"><button class="wbw-playoff-field-open" type="button" aria-label="Open the 2026 playoff field graphic larger"><img alt="${ALT}" width="1040" height="1300" loading="eager" decoding="async"></button><figcaption><strong>2026 PLAYOFF FIELD</strong> · Your quick visual before the September 17 return night sprint.<span class="wbw-enlarge-hint">Tap image to enlarge · tap enlarged image to zoom</span></figcaption></figure></div>`;
      const image=section.querySelector('img');
      image.src=src;
      section.querySelector('.wbw-playoff-field-open').addEventListener('click',event=>openLightbox(src,event.currentTarget));
      if(existing)existing.replaceWith(section);
      else main.insertBefore(section,briefing);
    }catch(error){
      console.warn('Welcome Back HQ playoff field image could not load',error);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',upgradePlayoffField,{once:true});
  else upgradePlayoffField();
})();
