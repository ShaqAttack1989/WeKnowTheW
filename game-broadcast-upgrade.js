(()=>{
  if(!window.WGameCards||typeof WGameCards.render!=='function')return;
  const originalRender=WGameCards.render.bind(WGameCards);
  const safe=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const slug=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const normalizeNetwork=value=>{
    const raw=String(value||'').trim();
    const low=raw.toLowerCase();
    if(low==='abc'||low.includes('abc'))return {label:'ABC',cls:'abc'};
    if(low.includes('espn2'))return {label:'ESPN2',cls:'espn2'};
    if(low.includes('espn'))return {label:'ESPN',cls:'espn'};
    if(low.includes('ion'))return {label:'ION',cls:'ion'};
    if(low.includes('nba tv')||low.includes('nbatv'))return {label:'NBA TV',cls:'nba-tv'};
    if(low.includes('cbs sports'))return {label:'CBS Sports',cls:'cbs-sports'};
    if(low==='cbs'||low.includes('cbs'))return {label:'CBS',cls:'cbs'};
    if(low.includes('prime'))return {label:'Prime',cls:'prime'};
    if(low.includes('peacock'))return {label:'Peacock',cls:'peacock'};
    return {label:raw,cls:slug(raw)};
  };
  const networks=game=>{
    const values=[...(Array.isArray(game?.broadcasts)?game.broadcasts:[]),game?.broadcast,game?.network,game?.tv].flat().filter(Boolean);
    const seen=new Set();
    return values.map(normalizeNetwork).filter(item=>item.label&&!seen.has(item.label.toLowerCase())&&seen.add(item.label.toLowerCase())).slice(0,3);
  };
  const badges=game=>{
    const items=networks(game);
    if(!items.length)return '<span class="network-icon network-tbd">TV TBD</span>';
    return items.map(item=>`<span class="network-icon network-${safe(item.cls)}" title="Watch on ${safe(item.label)}">${safe(item.label)}</span>`).join('');
  };
  WGameCards.render=(items=[],mode='upcoming',options={})=>{
    const html=originalRender(items,mode,options);
    if(!html||typeof DOMParser==='undefined')return html;
    try{
      const doc=new DOMParser().parseFromString(`<div id="broadcastRoot">${html}</div>`,'text/html');
      const cards=[...doc.querySelectorAll('.schedule-game-card')];
      const shown=items.slice(0,Number(options.limit)||20);
      cards.forEach((card,index)=>{
        const game=shown[index]||{};
        const bottom=card.querySelector('.schedule-game-bottom');
        if(!bottom)return;
        const detail=[...bottom.children].find((node,i)=>i>=2);
        const venue=String(game.venue||detail?.textContent||'Venue to be announced').trim();
        const line=doc.createElement('span');
        line.className='schedule-venue-line';
        line.innerHTML=`<span class="schedule-venue">${safe(venue)}</span>${badges(game)}`;
        if(detail)detail.replaceWith(line);else bottom.appendChild(line);
      });
      return doc.querySelector('#broadcastRoot')?.innerHTML||html;
    }catch{return html;}
  };
})();
