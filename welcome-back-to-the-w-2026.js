(()=>{
  const GUIDE_DATE='2026-09-17';
  const REFRESH_MS=60000;
  const TIME_ZONE='America/New_York';
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');
  const initials=value=>String(value||'').trim().split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()||'').join('')||'W';

  const TEAM_META={
    'Connecticut Sun':{tag:'CON',slug:'connecticut-sun'},
    'Atlanta Dream':{tag:'ATL',slug:'atlanta-dream'},
    'Washington Mystics':{tag:'WAS',slug:'washington-mystics'},
    'Chicago Sky':{tag:'CHI',slug:'chicago-sky'},
    'Los Angeles Sparks':{tag:'LAS',slug:'los-angeles-sparks'},
    'Dallas Wings':{tag:'DAL',slug:'dallas-wings'},
    'Phoenix Mercury':{tag:'PHX',slug:'phoenix-mercury'},
    'Portland Fire':{tag:'POR',slug:'portland-fire'},
    'Las Vegas Aces':{tag:'LVA',slug:'las-vegas-aces'},
    'Seattle Storm':{tag:'SEA',slug:'seattle-storm'}
  };

  const GAMES=[
    {away:'Connecticut Sun',home:'Atlanta Dream',time:'7:30 PM ET',broadcast:'League Pass',tags:['Seeding','Young core'],title:'Atlanta comes home with something to protect.',copy:'Atlanta is above the playoff line, Connecticut is not. Watch whether the Dream reestablishes its half court hierarchy quickly, and whether the Sun can turn young legs into transition pressure.'},
    {away:'Washington Mystics',home:'Chicago Sky',time:'7:30 PM ET',broadcast:'League Pass',tags:['Seeding','Spoiler'],title:'Washington needs precision. Chicago gets freedom.',copy:'Washington has postseason positioning to manage. Chicago can play spoiler without carrying the same standings pressure. That is a useful test of who controls pace when only one team needs the result.'},
    {away:'Los Angeles Sparks',home:'Dallas Wings',time:'8:00 PM ET',broadcast:'USA Network',tags:['National TV','Playoff rhythm'],title:'Dallas gets a prime time playoff tuneup.',copy:'The Wings are in the postseason mix and the Sparks can make every possession uncomfortable. Watch the point of attack defense around Paige Bueckers and how Dallas creates clean late clock offense.'},
    {away:'Phoenix Mercury',home:'Portland Fire',time:'10:00 PM ET',broadcast:'League Pass',tags:['Late window','Development'],title:'A veteran scoring test meets a young expansion team.',copy:'Portland is collecting reps that matter beyond one night. Phoenix brings experienced shot creation. The teaching point is simple: can the Fire defend the first action and still recover to the second one?'},
    {away:'Las Vegas Aces',home:'Seattle Storm',time:'10:00 PM ET',broadcast:'USA Network',tags:['National TV','FIBA turnaround'],title:'Gold medal legs meet a late night seed fight.',copy:'Las Vegas has playoff position on the line. Seattle gets a home stage and a chance to stress the Aces with size and youth. Watch the closing five, especially after two weeks of international role changes.'}
  ];

  const PLAYER_TARGETS={
    'Connecticut Sun':['Aaliyah Edwards','Marina Mabrey','Diamond Miller'],
    'Atlanta Dream':['Rhyne Howard','Angel Reese','Allisha Gray'],
    'Washington Mystics':['Sonia Citron','Shakira Austin','Kiki Iriafen'],
    'Chicago Sky':['Rickea Jackson','Kamilla Cardoso','Skylar Diggins'],
    'Los Angeles Sparks':['Kelsey Plum','Nneka Ogwumike','Dearica Hamby','Cameron Brink'],
    'Dallas Wings':['Paige Bueckers','Jessica Shepard'],
    'Phoenix Mercury':['Kahleah Copper','Alyssa Thomas','Satou Sabally'],
    'Portland Fire':['Carla Leite','Bridget Carleton','Sarah Ashlee Barker'],
    'Las Vegas Aces':['Jackie Young','A’ja Wilson','Chelsea Gray'],
    'Seattle Storm':['Dominique Malonga','Ezi Magbegor','Natisha Hiedeman','Awa Fam']
  };

  const PLAYER_READS={
    'Aaliyah Edwards':'Track her screen angles and rim runs. Connecticut needs simple actions to create efficient paint touches.',
    'Rhyne Howard':'She can score, defend and initiate. The question is how quickly she shifts from national team role to club creator.',
    'Angel Reese':'Rebounding is offense when it creates another possession. Watch how many Atlanta misses become second chances.',
    'Sonia Citron':'A connector who can also score. Watch whether Washington uses her to punish tilted defenses instead of forcing the first look.',
    'Shakira Austin':'Interior position can bend a defense before the ball arrives. Watch the early seals and how Chicago responds.',
    'Rickea Jackson':'Her shot creation matters most when the first action breaks down. Count how often she rescues a possession without freezing the offense.',
    'Kamilla Cardoso':'Rim protection is more than blocks. Watch how many drives change direction because she is already waiting.',
    'Kelsey Plum':'The defense has to decide whether to chase over screens or concede space. That choice shapes everything behind it.',
    'Nneka Ogwumike':'Veteran efficiency starts with footwork and timing. Watch how she gets to a clean attempt before the defense is fully organized.',
    'Paige Bueckers':'The teaching tape is pace control. Watch when she accelerates, when she rejects a screen and when she keeps a defender in jail.',
    'Kahleah Copper':'Downhill pressure forces help. The key is what Phoenix creates after the second defender commits.',
    'Alyssa Thomas':'She turns rebounds into offense without an outlet pass. Watch how quickly Phoenix can attack before the defense gets matched.',
    'Carla Leite':'Young point guard reps are decision reps. Watch the balance between probing for her own lane and moving the defense for someone else.',
    'Bridget Carleton':'Spacing is a skill. Watch how her positioning creates room even on possessions when she never touches the ball.',
    'Jackie Young':'She just handled international pressure. Watch whether the aggression comes home with her while her WNBA responsibilities expand again.',
    'A’ja Wilson':'Her gravity changes the floor before the catch. Watch what the weak side defense gives up when Seattle sends extra attention.',
    'Dominique Malonga':'Size is only part of the problem. Watch how Seattle uses her mobility in screen actions and how Las Vegas keeps her away from easy catches.',
    'Ezi Magbegor':'A mobile big can erase mistakes and still recover. Watch her pick and roll coverage, not just the block column.'
  };

  function playerPhoto(player={}){
    const cutout=[player.officialHeadshot,player.photoCutout].find(value=>/^https?:\/\//i.test(String(value||'').trim()));
    if(cutout)return String(cutout).trim();
    const id=String(player.espnId||'').replace(/[^0-9]/g,'');
    if(id)return `/api/photo?id=${id}`;
    const direct=[player.photo,player.photoThumb,player.headshot].find(value=>/^https?:\/\//i.test(String(value||'').trim()));
    if(!direct)return'';
    const espn=String(direct).match(/headshots\/(wnba|womens-college-basketball)\/players\/full\/(\d+)\.(?:png|jpg)/i);
    if(espn)return `/api/photo?id=${espn[2]}${espn[1]==='wnba'?'':'&league=ncaaw'}`;
    return `/api/photo?src=${encodeURIComponent(String(direct).trim())}`;
  }

  function easternTime(game={}){
    const direct=String(game.startTimeUtc||'').trim();
    if(direct){
      const normalized=/Z$|[+-]\d{2}:?\d{2}$/i.test(direct)?direct:`${direct}Z`;
      const date=new Date(normalized);
      if(!Number.isNaN(date.getTime()))return new Intl.DateTimeFormat('en-US',{timeZone:TIME_ZONE,hour:'numeric',minute:'2-digit'}).format(date)+' ET';
    }
    return'';
  }

  function recordFor(standings,name){return standings.find(row=>norm(row.team?.full_name)===norm(name))||null;}
  function gameFor(games,matchup){return games.find(game=>String(game.date||'').slice(0,10)===GUIDE_DATE&&norm(game.awayTeam)===norm(matchup.away)&&norm(game.homeTeam)===norm(matchup.home))||null;}
  function assetFor(assets,name){return assets.find(item=>norm(item.name)===norm(name))||null;}
  function logoMarkup(name,assets){
    const asset=assetFor(assets,name),src=asset?.badge||asset?.logo||'';
    return `<span class="wbw-team-logo">${src?`<img src="${safe(src)}" alt="${safe(name)} logo" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.hidden=false"><span class="wbw-logo-fallback" hidden>${safe(TEAM_META[name]?.tag||initials(name))}</span>`:`<span class="wbw-logo-fallback">${safe(TEAM_META[name]?.tag||initials(name))}</span>`}</span>`;
  }
  function recordText(row){return row?`${row.wins}-${row.losses}`:'Record loading';}
  function formText(row){return row?`${row.streak||'—'} · L10 ${row.last_ten||'—'}`:'Live form loading';}
  function scoreText(game){
    const hasScores=Number.isFinite(Number(game?.awayScore))&&Number.isFinite(Number(game?.homeScore));
    return hasScores?`${Number(game.awayScore)} · ${Number(game.homeScore)}`:'VS';
  }
  function statusText(game,matchup){
    if(!game)return matchup.time;
    const status=String(game.status||'').trim();
    if(game.completed||/final|ft/i.test(status))return 'FINAL';
    if(/q[1-4]|half|ot|progress|end/i.test(status))return status||'LIVE';
    return easternTime(game)||matchup.time;
  }
  function isLiveGame(game){return game&&!game.completed&&/q[1-4]|half|ot|progress|end/i.test(String(game.status||''));}

  function renderGames(payload={},assets=[]){
    const host=document.getElementById('returnGameGrid');if(!host)return;
    const standings=Array.isArray(payload.standings)?payload.standings:[];
    const games=[...(payload.liveGames||[]),...(payload.upcomingGames||[]),...(payload.pastGames||[]),...(payload.recentResults||[])];
    host.innerHTML=GAMES.map((matchup,index)=>{
      const game=gameFor(games,matchup),away=recordFor(standings,matchup.away),home=recordFor(standings,matchup.home),status=statusText(game,matchup);
      return `<article class="wbw-game-card${index===4?' feature':''}">
        <div class="wbw-game-top"><span>${safe(matchup.broadcast)} · ${safe(matchup.time)}</span><span class="wbw-game-status${isLiveGame(game)?' live':''}">${safe(status)}</span></div>
        <div class="wbw-matchup">
          <div class="wbw-team-side">${logoMarkup(matchup.away,assets)}<div class="wbw-team-copy"><b>${safe(matchup.away)}</b><small>${safe(recordText(away))} · ${safe(formText(away))}</small></div></div>
          <div class="wbw-score"><strong>${safe(scoreText(game))}</strong><span>${game&&scoreText(game)!=='VS'?'AWAY · HOME':'SEPT 17'}</span></div>
          <div class="wbw-team-side home"><div class="wbw-team-copy"><b>${safe(matchup.home)}</b><small>${safe(recordText(home))} · ${safe(formText(home))}</small></div>${logoMarkup(matchup.home,assets)}</div>
        </div>
        <div class="wbw-game-body"><div class="wbw-game-tags">${matchup.tags.map(tag=>`<span>${safe(tag)}</span>`).join('')}</div><h3>${safe(matchup.title)}</h3><p>${safe(matchup.copy)}</p><div class="wbw-game-links"><a href="/team.html?team=${safe(TEAM_META[matchup.away]?.slug||'')}">${safe(TEAM_META[matchup.away]?.tag||'Away')} team hub →</a><a href="/team.html?team=${safe(TEAM_META[matchup.home]?.slug||'')}">${safe(TEAM_META[matchup.home]?.tag||'Home')} team hub →</a></div></div>
      </article>`;
    }).join('');
  }

  function choosePlayer(players,team){
    const current=players.filter(player=>norm(player.team)===norm(team)&&player.currentRoster!==false);
    const targets=PLAYER_TARGETS[team]||[];
    for(const target of targets){const match=current.find(player=>norm(player.name)===norm(target));if(match)return match;}
    return current[0]||null;
  }
  function metric(value,digits=1){const number=Number(value);return Number.isFinite(number)?number.toFixed(digits):'—';}
  function ts(value){const number=Number(value);if(!Number.isFinite(number))return'—';return `${(Math.abs(number)<=1?number*100:number).toFixed(1)}%`;}

  function renderPlayers(players=[],advanced=[]){
    const host=document.getElementById('returnPlayerGrid');if(!host)return;
    const advancedMap=new Map(advanced.map(row=>[norm(row.name),row]));
    const chosen=Object.keys(TEAM_META).map(team=>({team,player:choosePlayer(players,team)})).filter(item=>item.player);
    if(!chosen.length){host.innerHTML='<div class="wbw-player-loading">Current roster photography is reconnecting. Playerpedia remains available while the feed retries.</div>';return;}
    host.innerHTML=chosen.map(({team,player})=>{
      const photo=playerPhoto(player),adv=advancedMap.get(norm(player.name))||{},read=PLAYER_READS[player.name]||`Watch how ${player.name} fits the first action, then what changes when the defense takes that option away.`;
      return `<article class="wbw-player-card">
        <div class="wbw-player-photo"><span class="fallback">${safe(initials(player.name))}</span>${photo?`<img src="${safe(photo)}" alt="Real roster photo of ${safe(player.name)}" loading="lazy" decoding="async" onerror="this.style.display='none'">`:''}</div>
        <div class="wbw-player-card-body"><span>${safe(TEAM_META[team]?.tag||team)} · ${safe(player.position||'PLAYER')}</span><h3>${safe(player.name)}</h3><p>${safe(read)}</p><div class="wbw-player-metrics"><div><span>PER</span><strong>${safe(metric(adv.per))}</strong></div><div><span>TRUE SHOOTING</span><strong>${safe(ts(adv.tsPct))}</strong></div></div><a href="/playerpedia.html?search=${encodeURIComponent(player.name)}">Open Playerpedia profile →</a></div>
      </article>`;
    }).join('');
  }

  function renderStandings(standings=[],assets=[],updatedAt=''){
    const host=document.getElementById('returnStandings');if(!host)return;
    const rows=[...standings].sort((a,b)=>Number(a.overall_rank||999)-Number(b.overall_rank||999));
    if(!rows.length){host.innerHTML='<div class="wbw-loading-row">Standings are reconnecting. Open Live Stats for the latest table.</div>';return;}
    host.innerHTML=rows.map((row,index)=>{
      const rank=Number(row.overall_rank)||index+1,name=row.team?.full_name||'Team',asset=assetFor(assets,name),logo=asset?.badge||asset?.logo||'',inside=rank<=8;
      return `<div class="wbw-standing-row ${inside?'inside':'outside'}${rank===8?' cut':''}"><span class="wbw-standing-rank">${rank}</span><span class="wbw-standing-team">${logo?`<img src="${safe(logo)}" alt="" loading="lazy" decoding="async">`:''}${safe(name)}</span><span class="wbw-standing-record">${safe(`${row.wins}-${row.losses}`)}</span><span class="wbw-standing-form">${safe(row.streak||'—')}</span><span class="wbw-standing-form lastten">${safe(row.last_ten||'—')}</span></div>`;
    }).join('');
    const stamp=document.getElementById('standingsUpdated');
    if(stamp){const date=new Date(updatedAt||Date.now());stamp.textContent=Number.isNaN(date.getTime())?'Live feed':`Updated ${new Intl.DateTimeFormat('en-US',{timeZone:TIME_ZONE,month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(date)} ET`;}
  }

  async function getJson(url){
    const joiner=url.includes('?')?'&':'?';
    const response=await fetch(`${url}${joiner}cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
    if(!response.ok)throw new Error(`${url} returned ${response.status}`);
    return response.json();
  }

  async function refresh(){
    const status=document.getElementById('guideFeedStatus');
    const results=await Promise.allSettled([
      getJson('/api/stats?season=2026'),
      getJson('/api/players?publicCopy=20260917-return-guide-v1'),
      getJson('/api/teams'),
      getJson('/api/advanced-stats?season=2026')
    ]);
    const stats=results[0].status==='fulfilled'?results[0].value:{};
    const roster=results[1].status==='fulfilled'?results[1].value:{};
    const teams=results[2].status==='fulfilled'?results[2].value:{};
    const advanced=results[3].status==='fulfilled'?results[3].value:{};
    const assets=Array.isArray(teams.teams)?teams.teams:[];
    const players=Array.isArray(roster.players)?roster.players:[];
    const advancedPlayers=Array.isArray(advanced.players)?advanced.players:[];
    renderGames(stats,assets);
    renderPlayers(players,advancedPlayers);
    renderStandings(Array.isArray(stats.standings)?stats.standings:[],assets,stats.updatedAt);
    if(status){
      const liveCount=(stats.liveGames||[]).filter(game=>String(game.date||'').slice(0,10)===GUIDE_DATE).length;
      const failed=results.filter(result=>result.status==='rejected').length;
      status.classList.toggle('is-error',failed>=3);
      status.innerHTML=`<span aria-hidden="true"></span>${failed>=3?'Live feeds are retrying':liveCount?`${liveCount} return night ${liveCount===1?'game is':'games are'} live`:'Dynamic dashboards connected'}`;
    }
  }

  refresh();
  setInterval(()=>{if(!document.hidden)refresh();},REFRESH_MS);
  window.addEventListener('focus',refresh);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
