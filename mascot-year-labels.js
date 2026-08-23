(function(){
  const all=[...(typeof CURRENT_MASCOTS!=='undefined'?CURRENT_MASCOTS:[]),...(typeof RETIRED_MASCOTS!=='undefined'?RETIRED_MASCOTS:[])];
  const byId=Object.fromEntries(all.map(item=>[item.id,item]));
  function labelCards(root=document){
    root.querySelectorAll('.mascot-card[data-mascot-id]').forEach(card=>{
      const item=byId[card.dataset.mascotId];
      if(!item)return;
      const meta=card.querySelector('.mascot-species');
      if(!meta)return;
      const intro=item.introduced||item.debut||'';
      const era=card.dataset.retired==='true'&&item.years?` · Era ${item.years}`:'';
      meta.textContent=`${item.species||'Mascot'}${intro?` · Introduced ${intro}`:''}${era}`;
    });
    root.querySelectorAll('.mascot-modal-meta span').forEach(span=>{
      if(span.textContent.startsWith('Debut:'))span.textContent=span.textContent.replace(/^Debut:/,'Introduced:');
    });
  }
  labelCards();
  ['mascotGrid','retiredMascotGrid','mascotDialogBody'].forEach(id=>{
    const node=document.getElementById(id);
    if(!node)return;
    new MutationObserver(()=>labelCards(node)).observe(node,{childList:true,subtree:true});
  });
})();
