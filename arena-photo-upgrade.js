(function(){
  if(document.body.dataset.culturePage!=='vibes')return;
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function cards(){return [...document.querySelectorAll('.vibe-card')];}
  function wrapCopy(card){
    if(card.querySelector('.vibe-card-copy'))return card.querySelector('.vibe-card-copy');
    const copy=document.createElement('div');copy.className='vibe-card-copy';[...card.childNodes].forEach(node=>copy.appendChild(node));card.appendChild(copy);return copy;
  }
  function applyVenue(card,item){
    if(card.querySelector('.arena-photo-shell'))return;
    const image=item.image||'';if(!image)return;
    const copy=wrapCopy(card);card.classList.add('has-arena-photo');
    const figure=document.createElement('div');figure.className='arena-photo-shell';
    const source=item.sourceUrl||'';
    figure.innerHTML=`${source?`<a class="arena-photo-link" href="${esc(source)}" target="_blank" rel="noopener" aria-label="Open ${esc(item.venue)} photo source">`:''}<img src="${esc(image)}" alt="${esc(item.venue)}" loading="lazy" decoding="async"><span class="arena-photo-shade" aria-hidden="true"></span><span class="arena-venue-label"><b>${esc(item.venue)}</b>${item.note?`<small>${esc(item.note)}</small>`:''}</span><span class="arena-photo-credit">Arena photo · Wikimedia</span>${source?'</a>':''}`;
    copy.insertAdjacentElement('beforebegin',figure);
    const img=figure.querySelector('img');
    img.addEventListener('error',()=>{figure.remove();card.classList.remove('has-arena-photo');if(copy)copy.classList.add('arena-image-retry');},{once:true});
  }
  async function loadArenaPhotos(){
    const vibeCards=cards();if(!vibeCards.length)return false;
    try{
      const response=await fetch(`/api/arena-photo?v=20260823-v2&t=${Date.now()}`,{headers:{Accept:'application/json'},cache:'no-store'});
      if(!response.ok)throw new Error('Arena photo feed unavailable');
      const payload=await response.json();
      const byTeam=new Map((payload.items||[]).map(item=>[item.team,item]));
      vibeCards.forEach(card=>{
        const team=card.querySelector(':scope > span')?.textContent?.trim()||card.querySelector('.vibe-card-copy > span')?.textContent?.trim()||'';
        const item=byTeam.get(team);if(item?.image)applyVenue(card,item);
      });
      return true;
    }catch{return false;}
  }
  function boot(attempt=0){
    loadArenaPhotos().then(ok=>{if((!ok||cards().some(card=>!card.querySelector('.arena-photo-shell')))&&attempt<3)setTimeout(()=>boot(attempt+1),900*(attempt+1));});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});else boot();
})();
