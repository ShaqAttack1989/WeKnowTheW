(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.WTeamPlayerDashboard=factory();
})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const codes={
    atlantadream:'ATL',atl:'ATL',
    chicagosky:'CHI',chi:'CHI',
    connecticutsun:'CON',con:'CON',
    dallaswings:'DAL',dal:'DAL',
    goldenstatevalkyries:'GSV',gsv:'GSV',
    indianafever:'IND',ind:'IND',
    lasvegasaces:'LVA',lva:'LVA',
    losangelessparks:'LAS',las:'LAS',
    minnesotalynx:'MIN',min:'MIN',
    newyorkliberty:'NYL',nyl:'NYL',
    phoenixmercury:'PHO',pho:'PHO',phx:'PHO',
    portlandfire:'POR',por:'POR',
    seattlestorm:'SEA',sea:'SEA',
    torontotempo:'TOR',tor:'TOR',
    washingtonmystics:'WAS',was:'WAS'
  };
  const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const finite=value=>typeof value==='number'&&Number.isFinite(value);
  function number(value){
    if(value===null||value===undefined||value==='')return null;
    const n=Number(value);return Number.isFinite(n)?n:null;
  }
  function teamCode(value){return codes[key(value)]||'';}
  function perGame(total,games){return finite(total)&&finite(games)&&games>0?total/games:null;}
  function percentage(made,attempts){return finite(made)&&finite(attempts)&&attempts>0?made/attempts:null;}
  function normalize(row={}){
    const games=number(row.g??row.games);
    const totals={
      g:games,mp:number(row.mp??row.minutes),pts:number(row.pts),trb:number(row.trb??row.reb),
      ast:number(row.ast),stl:number(row.stl),blk:number(row.blk),tov:number(row.tov),
      fg:number(row.fg??row.fgm),fga:number(row.fga),
      fg3:number(row.fg3??row.fg3m??row['3p']),fg3a:number(row.fg3a),
      ft:number(row.ft??row.ftm),fta:number(row.fta)
    };
    return {
      name:String(row.name||row.player||'').trim(),team:teamCode(row.team??row.teamCode??row.teamAbbreviation),
      ...totals,
      mpPerGame:perGame(totals.mp,games),ptsPerGame:perGame(totals.pts,games),
      trbPerGame:perGame(totals.trb,games),astPerGame:perGame(totals.ast,games),
      stlPerGame:perGame(totals.stl,games),blkPerGame:perGame(totals.blk,games),
      tovPerGame:perGame(totals.tov,games),fgPct:percentage(totals.fg,totals.fga),
      fg3Pct:percentage(totals.fg3,totals.fg3a),ftPct:percentage(totals.ft,totals.fta)
    };
  }
  function build(teamName,rows=[]){
    const code=teamCode(teamName),playersByName=new Map();
    if(!code)return {team:teamName,code,players:[]};
    for(const source of rows){
      const player=normalize(source);
      if(!player.name||player.team!==code||!finite(player.g)||player.g<=0)continue;
      const identity=key(player.name),previous=playersByName.get(identity);
      if(!previous||player.g>previous.g||(player.g===previous.g&&(player.mp||0)>(previous.mp||0)))playersByName.set(identity,player);
    }
    return {team:teamName,code,players:[...playersByName.values()].sort((a,b)=>a.name.localeCompare(b.name))};
  }
  function metric(player,sort='pts',mode='perGame'){
    if(['fgPct','fg3Pct','ftPct','g'].includes(sort))return player[sort];
    if(sort==='mp')return mode==='totals'?player.mp:player.mpPerGame;
    return mode==='totals'?player[sort]:player[`${sort}PerGame`];
  }
  function sortPlayers(players=[],sort='pts',mode='perGame'){
    return [...players].sort((a,b)=>{
      const first=metric(a,sort,mode),second=metric(b,sort,mode);
      if(first===null||first===undefined)return second===null||second===undefined?a.name.localeCompare(b.name):1;
      if(second===null||second===undefined)return -1;
      return second-first||a.name.localeCompare(b.name);
    });
  }
  function searchPlayers(players=[],query=''){
    const wanted=key(query);return wanted?players.filter(player=>key(player.name).includes(wanted)):[...players];
  }
  return {build,key,metric,number,percentage,perGame,searchPlayers,sortPlayers,teamCode};
});
