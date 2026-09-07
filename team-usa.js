(()=>{
  const root=document.getElementById('teamUsaHub');
  if(!root)return;
  const byId=id=>document.getElementById(id);
  const safe=value=>String(value??'');
  const localDate=value=>{
    if(!value)return 'Schedule updating';
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return 'Schedule updating';
    return new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(date);
  };

  async function loadWorldCupPulse(){
    try{
      const response=await fetch('/api/fiba-world-cup',{headers:{Accept:'application/json'}});
      if(!response.ok)throw new Error('feed unavailable');
      const data=await response.json();
      const usa=data.usa||{};
      const games=(data.games||[]).filter(game=>game.home?.code==='USA'||game.away?.code==='USA');
      const upcoming=games.find(game=>game.status!=='final');
      const completed=[...games].reverse().find(game=>game.status==='final');
      const record=byId('usaHubRecord');
      const rank=byId('usaHubRank');
      const pulse=byId('usaHubWorldCupStatus');
      const updated=byId('usaHubUpdated');

      if(record)record.textContent=`${usa.wins||0}-${usa.losses||0}`;
      if(rank)rank.textContent=`#${usa.worldRank||1}`;
      if(pulse){
        if(upcoming){
          const opponent=upcoming.home?.code==='USA'?upcoming.away:upcoming.home;
          pulse.innerHTML=`<small>NEXT USA GAME</small><strong>USA vs ${safe(opponent?.code||'TBD')}</strong><span>${safe(localDate(upcoming.startTimeUtc))}</span>`;
        }else if(completed){
          pulse.innerHTML='<small>WORLD CUP STATUS</small><strong>USA schedule live</strong><span>Open the dashboard for the latest bracket.</span>';
        }
      }
      if(updated){
        const timestamp=data.updatedAt?new Date(data.updatedAt):null;
        updated.textContent=timestamp&&!Number.isNaN(timestamp.getTime())?`FIBA feed updated ${timestamp.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`:'Official FIBA feed connected';
      }
    }catch{
      const updated=byId('usaHubUpdated');
      if(updated)updated.textContent='Open the World Cup dashboard for official live updates';
    }
  }

  loadWorldCupPulse();
})();

