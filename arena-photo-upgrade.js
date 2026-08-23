(function(){
  if(document.body.dataset.culturePage!=='vibes')return;
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const cards=[...document.querySelectorAll('.vibe-card')];
  if(!cards.length)return;

  function wrapCopy(card){
    if(card.querySelector('.vibe-card-copy'))return card.querySelector('.vibe-card-copy');
    const copy=document.createElement('div');
    copy.className='vibe-card-copy';
    [...card.childNodes].forEach(node=>copy.appendChild(node));
    card.appendChild(copy);
    return copy;
  }
  function applyVenue(card,item){
    const copy=wrapCopy(card);
    card.classList.add('has-arena-photo');
    const figure=document.createElement('div');
    figure.className='arena-photo-shell';
    const source=item.sourceUrl||'';
    const image=item.image||'';
    figure.innerHTML=`${source?`<a class="arena-photo-link" href="${esc(source)}" target="_blank" rel="noopener" aria-label="Open ${esc(item.venue)} photo source">`:''}${image?`<img src="${esc(image)}" alt="${esc(item.venue)}" loading="lazy" decoding="async">`:''}<span class="arena-photo-shade" aria-hidden="true"></span><span class="arena-venue-label"><b>${esc(item.venue)}</b>${item.note?`<small>${esc(item.note)}</small>`:''}</span><span class="arena-photo-credit">${image?'Arena photo · Wikimedia':'Arena'}</span>${source?'</a>':''}`;
    copy.insertAdjacentElement('beforebegin',figure);
    const img=figure.querySelector('img');
    if(img)img.addEventListener('error',()=>{img.remove();figure.classList.add('arena-photo-missing');},{once:true});
  }

  fetch('/api/arena-photo?v=20260823-v1',{headers:{Accept:'application/json'}})
    .then(response=>response.ok?response.json():Promise.reject(new Error('Arena photo feed unavailable')))
    .then(payload=>{
      const byTeam=new Map((payload.items||[]).map(item=>[item.team,item]));
      cards.forEach(card=>{
        const team=card.querySelector(':scope > span')?.textContent?.trim()||card.querySelector('span')?.textContent?.trim()||'';
        const item=byTeam.get(team);
        if(item)applyVenue(card,item);
      });
    })
    .catch(()=>{});
})();
