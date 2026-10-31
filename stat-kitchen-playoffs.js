(()=>{const host=document.getElementById('playoffLeaderRows');if(!host)return;let rows=[],mode='pergame',stat='pts';const cats={pts:'Points',trb:'Rebounds',ast:'Assists',stl:'Steals',blk:'Blocks',tov:'Turnovers',fg3m:'Threes made'};const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));function render(){document.getElementById('playoffLeaderCategories').innerHTML=Object.entries(cats).map(([k,v])=>'<button type="button" data-playoff-stat="'+k+'" aria-pressed="'+(k===stat)+'" class="'+(k===stat?'active':'')+'">'+v+'</button>').join('');const selected=rows.filter(p=>p.games>0&&Number.isFinite(p[stat])).sort((a,b)=>b[stat]-a[stat]||a.name.localeCompare(b.name)).slice(0,10);host.innerHTML='<div class="leaderboard-head"><span>Rank</span><span>Player · GP</span><span>Team</span><span>'+(mode==='totals'?'Total':'Per game')+'</span></div>'+selected.map((p,i)=>'<article class="leader-row"><span>'+(i+1)+'</span><div><a href="/playerpedia.html?search='+encodeURIComponent(p.name)+'">'+safe(p.name)+'</a><small>'+p.games+' games</small></div><span>'+safe(p.team)+'</span><b>'+Number(p[stat]).toFixed(mode==='totals'?0:1)+'</b></article>').join('');document.querySelectorAll('[data-playoff-stat]').forEach(b=>b.onclick=()=>{stat=b.dataset.playoffStat;render()})}async function load(){const status=document.getElementById('playoffLeaderStatus');try{status.textContent='Checking postseason stats…';const r=await fetch('/api/playoff-leaders?mode='+mode,{cache:'no-store'}),d=await r.json();if(!r.ok||!Array.isArray(d.players))throw Error();rows=d.players;render();status.textContent=d.stale?'Verified snapshot · through '+(d.through||'2026-10-29')+' · official feed retrying':'Official WNBA playoffs · checked '+new Date(d.updatedAt).toLocaleString();}catch{try{const backup=await fetch('/data/playoff-leaders-2026.json').then(r=>r.json());rows=backup[mode].players;render();status.textContent='Verified snapshot · through '+(backup[mode].through||'2026-10-29');return;}catch{}status.textContent='Postseason feed unavailable';if(!rows.length)host.innerHTML='<p>Playoff leaders are temporarily unavailable. <a href="https://stats.wnba.com/players/traditional/?Season=2026&SeasonType=Playoffs">Open official playoff stats</a>.</p>';}}document.getElementById('playoffLeaderMode').onchange=e=>{mode=e.target.value;load()};load();setInterval(load,300000);})();

// Separate Finals series totals from all-round postseason leaders.
// Both views use official final box scores; the saved file is the offline fallback.
(function () {
  const mount = document.getElementById('finalsLeaderSummary');
  if (!mount) return;
  const categories = [
    ['pts', 'Points', 'PTS'],
    ['trb', 'Rebounds', 'REB'],
    ['ast', 'Assists', 'AST'],
    ['blk', 'Blocks', 'BLK'],
    ['stl', 'Steals', 'STL'],
    ['fg3m', '3-pointers made', '3PM']
  ];
  const escapeText = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => (
    {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]
  ));
  const teamNames = { ATL: 'Atlanta Dream', GSV: 'Golden State Valkyries' };
  const finiteNumber = value => Number.isFinite(Number(value)) ? Number(value) : 0;

  function leadersFromGames(games) {
    const players = new Map();
    games.forEach(game => {
      ['ATL', 'GSV'].forEach(team => {
        (game[team]?.players || []).forEach(player => {
          const key = team + '|' + player.name;
          const row = players.get(key) || {
            name: player.name, team: team, pts: 0, trb: 0,
            ast: 0, blk: 0, stl: 0, fg3m: 0, games: 0
          };
          row.pts += finiteNumber(player.points);
          row.trb += finiteNumber(player.reboundsTotal);
          row.ast += finiteNumber(player.assists);
          row.blk += finiteNumber(player.blocks);
          row.stl += finiteNumber(player.steals);
          row.fg3m += finiteNumber(String(player.three || '0-0').split('-')[0]);
          row.games += 1;
          players.set(key, row);
        });
      });
    });
    return [...players.values()];
  }

  function render(games, source) {
    const finalGames = games.filter(game => Number.isInteger(game.number) && game.ATL && game.GSV)
      .sort((a, b) => a.number - b.number);
    if (!finalGames.length) throw Error('No completed Finals games');
    const players = leadersFromGames(finalGames);
    const latest = finalGames[finalGames.length - 1];
    mount.innerHTML = '<div class="fls-heading">' +
      '<div><p class="kicker">2026 WNBA FINALS · SERIES TOTALS ONLY</p>' +
      '<h3>Finals Stat Leaders</h3>' +
      '<p>Through Game ' + latest.number + ' · ' + escapeText(latest.date) +
      ' · Atlanta Dream vs. Golden State Valkyries</p></div>' +
      '<a href="#finals-game-dashboard">View game box scores</a></div>' +
      '<div class="fls-grid">' + categories.map(([key, label, short]) => {
        const leader = players.slice().sort((a, b) =>
          b[key] - a[key] || a.name.localeCompare(b.name))[0];
        if (!leader) return '';
        return '<article class="fls-card"><span class="fls-category">' + label +
          '</span><strong class="fls-total">' + leader[key] + ' <small>' + short + '</small></strong>' +
          '<a class="fls-player" href="/playerpedia.html?search=' +
          encodeURIComponent(leader.name) + '">' + escapeText(leader.name) + '</a>' +
          '<span class="fls-team">' + escapeText(teamNames[leader.team]) +
          ' · ' + leader.games + ' GP</span></article>';
      }).join('') + '</div>' +
      '<p class="fls-source">Cumulative Finals numbers, separate from the full playoff leader rankings below. ' +
      (source === 'snapshot' ? 'Showing saved final box scores while the live feed reconnects.' :
        'Updated from official WNBA final box scores.') + '</p>';
  }

  async function load() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      let response;
      try {
        response = await fetch('/api/finals-game-stats', {
          cache: 'no-store', signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }
      if (!response.ok) throw Error('Finals stats API unavailable');
      const result = await response.json();
      if (!Array.isArray(result.games) || !result.games.length) throw Error('Empty Finals results');
      render(result.games, result.stale ? 'snapshot' : 'live');
    } catch (error) {
      try {
        const response = await fetch('/finals-game-dashboard.json', {cache:'no-store'});
        if (!response.ok) throw Error('Saved Finals results unavailable');
        const result = await response.json();
        render(result.games, 'snapshot');
      } catch {
        mount.textContent = 'Finals stat leaders are temporarily unavailable. See the official box scores below.';
      }
    }
  }
  load();
  setInterval(() => { if (!document.hidden) load(); }, 300000);
})();
