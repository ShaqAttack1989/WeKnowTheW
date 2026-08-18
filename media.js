let mediaLibraryPromise;

function mediaSafe(value=''){
  return String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function loadMediaLibrary(){
  if(!mediaLibraryPromise){
    mediaLibraryPromise=fetch('/media-library.json',{headers:{Accept:'application/json'}})
      .then(response=>response.ok?response.json():{items:[]})
      .catch(()=>({items:[]}));
  }
  return mediaLibraryPromise;
}

async function mediaFor(type,subject){
  const library=await loadMediaLibrary();
  const key=String(subject||'').trim().toLowerCase();
  return (library.items||[]).find(item=>String(item.type||'').toLowerCase()===String(type||'').toLowerCase()&&String(item.subject||'').trim().toLowerCase()===key)||null;
}

function attributedFigure(item,className='profile-photo'){
  if(!item?.image)return '';
  const creditParts=[];
  if(item.creator)creditParts.push(mediaSafe(item.creator));
  if(item.license)creditParts.push(mediaSafe(item.license));
  const credit=creditParts.join(' · ');
  const sourceOpen=item.sourceUrl?`<a href="${mediaSafe(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a>`:'';
  const licenseOpen=item.licenseUrl?`<a href="${mediaSafe(item.licenseUrl)}" target="_blank" rel="noopener noreferrer">License</a>`:'';
  return `<figure class="${mediaSafe(className)}"><img src="${mediaSafe(item.image)}" alt="${mediaSafe(item.alt||item.subject||'Profile image')}" loading="lazy"><figcaption>${item.caption?`<span>${mediaSafe(item.caption)}</span>`:''}${credit?`<small>${credit}${sourceOpen||licenseOpen?' · ':''}${sourceOpen}${sourceOpen&&licenseOpen?' · ':''}${licenseOpen}</small>`:(sourceOpen||licenseOpen?`<small>${sourceOpen}${sourceOpen&&licenseOpen?' · ':''}${licenseOpen}</small>`:'')}</figcaption></figure>`;
}

window.mediaFor=mediaFor;
window.attributedFigure=attributedFigure;
