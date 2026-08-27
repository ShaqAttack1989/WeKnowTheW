(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.WTeamStatLeaders=factory();
})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const aliases={anastasiiaolairikosu:'anastasiiakosu',raquelcarreraquintana:'raquelcarrera',aliciaflorezgetino:'aliciaflorez'};
  function key(value){const n=String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');return aliases[n]||n;}
  const codes={atlantadream:'ATL',chicagosky:'CHI',connecticutsun:'CON',dallaswings:'DAL',goldenstatevalkyries:'GSV',indianafever:'IND',lasvegasaces:'LVA',losangelessparks:'LAS',minnesotalynx:'MIN',newyorkliberty:'NYL',phoenixmercury:'PHO',portlandfire:'POR',seattlestorm:'SEA',torontotempo:'TOR',washingtonmystics:'WAS'};
  const categories=[
    {id:'ppg',label:'Points',unit:'PPG',total:'pts',denominator:'g'},
    {id:'rpg',label:'Rebounds',unit:'RPG',total:'trb',denominator:'g'},
    {id:'apg',label:'Assists',unit:'APG',total:'ast',denominator:'g'},
    {id:'spg',label:'Steals',unit:'SPG',total:'stl',denominator:'g'},
    {id:'bpg',label:'Blocks',unit:'BPG',total:'blk',denominator:'g'},
    {id:'threes',label:'Made threes',unit:'3PM/G',total:'fg3',denominator:'g'},
    {id:'fg',label:'Field goals',unit:'FG%',total:'fg',denominator:'fga',attempts:50},
    {id:'threePct',label:'Three-point shooting',unit:'3P%',total:'fg3',denominator:'fg3a',attempts:20},
    {id:'ft',label:'Free throws',unit:'FT%',total:'ft',denominator:'fta',attempts:20}
  ];
  const finite=value=>typeof value==='number'&&Number.isFinite(value);
  function build(teamName,totals=[],roster=[],injuries=[]) {
    const code=codes[key(teamName)];
    const current=roster.filter(p=>key(p.team)===key(teamName)&&p.currentRoster!==false&&!/^(waived|released|free.agent|inactive)$/i.test(p.liveStatus||''));
    const stats=new Map();
    for(const row of totals){
      if(row.team!==code)continue;
      const k=key(row.name),existing=stats.get(k);
      if(!existing || row.g>existing.g || (row.g===existing.g&&(row.mp||0)>(existing.mp||0)))stats.set(k,row);
    }
    const seen=new Set();
    const matched=current.flatMap(player=>{
      const k=key(player.name),row=stats.get(k);
      if(!row||seen.has(k))return [];seen.add(k);return [{player,row}];
    });
    const cards=categories.map(category=>{
      const candidates=matched.filter(({row})=>row.g>=5&&finite(row[category.total])&&finite(row[category.denominator])&&row[category.denominator]>0&&(!category.attempts||row[category.denominator]>=category.attempts));
      candidates.sort((a,b)=>b.row[category.total]*a.row[category.denominator]-a.row[category.total]*b.row[category.denominator]);
      if(!candidates.length)return {...category,value:null,leaders:[],eligible:0};
      const top=candidates[0].row;
      const tied=candidates.filter(({row})=>row[category.total]*top[category.denominator]===top[category.total]*row[category.denominator]);
      const leaders=tied.map(({player,row})=>({name:player.name,id:player.wnbaId||player.id||key(player.name),photo:player.officialHeadshot||player.photoCutout||player.photo||player.photoThumb||'',games:row.g,total:row[category.total],attempts:category.attempts?row[category.denominator]:null,availability:injuries.find(item=>key(item.player||item.name)===key(player.name))?.status||''})).sort((a,b)=>key(a.name).localeCompare(key(b.name)));
      return {...category,value:top[category.total]/top[category.denominator],leaders,eligible:candidates.length};
    });
    return {team:teamName,code,rosterCount:current.length,matchedCount:matched.length,cards};
  }
  return {key,codes,categories,build};
});
