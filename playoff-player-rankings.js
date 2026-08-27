(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./playoff-ranking-model'));
  else { root.WPlayoffPage = factory(root.WPlayoffRanking); root.WPlayoffPage.start(); }
})(typeof globalThis === 'object' ? globalThis : this, function (model) {
  'use strict';
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const number = (value, decimals = 1) => model.finite(value) ? value.toFixed(decimals) : '—';
  const percent = value => model.finite(value) ? `${(value * 100).toFixed(1)}%` : '—';
  const playerHref = player => `/playerpedia.html?view=current&search=${encodeURIComponent(player.name)}#playerpedia-directory`;
  const teamHref = team => `/team.html?team=${encodeURIComponent(team.slug)}`;
  const initials = name => name.split(/\s+/).map(part => part[0]).filter(Boolean).slice(0, 2).join('');
  function portrait(player, large = false) {
    return `<span class="pr-portrait${large ? ' pr-portrait-large' : ''}"><span aria-hidden="true">${safe(initials(player.name))}</span><img src="${safe(player.photo)}" alt="${safe(player.name)}" width="${large ? 208 : 64}" height="${large ? 152 : 64}" loading="${large || (player.rank !== null && player.rank <= 12) ? 'eager' : 'lazy'}" decoding="async"></span>`;
  }
  function leaderValue(leader) {
    return leader.unit.includes('%') ? percent(leader.value) : `${number(leader.value, leader.unit === '3PM total' ? 0 : 1)} ${leader.unit}`;
  }
  function leaderBadges(player) {
    return player.leaders.map(leader => `<span class="pr-leader" title="League leader: ${safe(leaderValue(leader))}">#1 ${safe(leader.unit.replace(' total', ''))}</span>`).join('');
  }
  function rows(players, data) {
    return players.map(player => {
      const team = data.teams.find(team => team.slug === player.teamSlug);
      return `<tr data-player-id="${safe(player.id)}" data-global-rank="${player.rank ?? ''}">
        <td class="pr-rank">${player.rank ?? '<abbr title="Unranked: no published W grade">NR</abbr>'}</td>
        <th scope="row" class="pr-player"><div class="pr-player-line"><a class="pr-photo-link" href="${playerHref(player)}">${portrait(player)}</a><div><a class="pr-player-name" href="${playerHref(player)}">${safe(player.name)}</a><a class="pr-team-line" href="${teamHref(team)}"><img src="${safe(team.logo)}" alt="" width="23" height="23" loading="lazy">${safe(team.abbreviation)} <span>· ${safe(player.position)}</span></a><div class="pr-badges">${leaderBadges(player)}${player.provisional ? '<span class="pr-provisional">Provisional</span>' : ''}</div></div></div></th>
        <td class="pr-score"><strong>${player.score ?? 'NR'}</strong><span>${safe(player.letter || 'No grade')}</span></td>
        ${[['PPG',player.ppg],['RPG',player.rpg],['APG',player.apg],['PER',player.per],['TS%',player.tsPct]].map(([label,value]) => `<td class="pr-stat" data-label="${label}">${label === 'TS%' ? percent(value) : number(value)}</td>`).join('')}
        <td class="pr-more"><details><summary>Details<span class="pr-sr"> for ${safe(player.name)}</span></summary><div class="pr-detail-content"><dl><div><dt>Games</dt><dd>${number(player.games,0)}</dd></div><div><dt>MPG</dt><dd>${number(player.minutes)}</dd></div><div><dt>SPG</dt><dd>${number(player.spg)}</dd></div><div><dt>BPG</dt><dd>${number(player.bpg)}</dd></div><div><dt>TOPG</dt><dd>${number(player.topg)}</dd></div><div><dt>FG%</dt><dd>${percent(player.fgPct)}</dd></div><div><dt>3P%</dt><dd>${percent(player.threePct)}</dd></div><div><dt>FT%</dt><dd>${percent(player.ftPct)}</dd></div><div><dt>3PM total</dt><dd>${number(player.threes,0)}</dd></div></dl>${player.designation ? `<p>${safe(player.designation)}</p>` : ''}${player.tieNote ? `<p class="pr-tie-note">${safe(player.tieNote)}</p>` : ''}${player.note ? `<p>${safe(player.note)}</p>` : ''}${player.leaders.length ? `<p>League leader: ${player.leaders.map(leader => `${safe(leader.label)} (${safe(leaderValue(leader))})`).join('; ')}.</p>` : ''}<a href="${playerHref(player)}">Playerpedia profile →</a></div></details></td>
      </tr>`;
    }).join('');
  }
  function teams(data) {
    return data.teams.map(team => `<article class="pr-team-card" style="--club-color:${safe(team.color)}"><a href="${teamHref(team)}"><img src="${safe(team.logo)}" alt="${safe(team.name)} logo" width="56" height="56"><strong>${safe(team.name)}</strong></a><span>${team.wins}–${team.losses} · ${team.standing}${team.standing === 1 ? 'st' : team.standing === 2 ? 'nd' : team.standing === 3 ? 'rd' : 'th'}</span><b>Clinched</b><button type="button" data-team-filter="${safe(team.slug)}" disabled>View players</button></article>`).join('');
  }
  function podium(data) {
    return model.rankPlayers(data.players).slice(0,3).map(player => {
      const team = data.teams.find(team => team.slug === player.teamSlug);
      return `<a class="pr-podium-card" href="${playerHref(player)}" style="--club-color:${safe(team.color)}"><span class="pr-podium-rank">0${player.rank}</span>${portrait(player,true)}<div class="pr-podium-copy"><span class="pr-podium-team"><img src="${safe(team.logo)}" width="24" height="24" alt="">${safe(team.name)}</span><h2>${safe(player.name)}</h2><p>${number(player.ppg)} PPG · ${number(player.per)} PER</p></div><div class="pr-podium-score"><strong>${player.score}</strong><span>${player.letter} · W score</span></div></a>`;
    }).join('');
  }
  function start() {
    const script = document.getElementById('playoffSnapshot');
    if (!script) return;
    let data;
    try { data = JSON.parse(script.textContent); } catch { return; } // The full static table remains readable.
    const ranked = model.rankPlayers(data.players);
    const search = document.getElementById('playoffSearch');
    const select = document.getElementById('playoffTeam');
    const leaders = document.getElementById('playoffLeadersOnly');
    const reset = document.getElementById('playoffReset');
    const params = new URLSearchParams(location.search);
    const selected = data.teams.find(team => team.slug === params.get('team') || team.name === params.get('team'));
    select.value = selected?.slug || '';
    search.value = params.get('search') || '';
    leaders.checked = params.get('leaders') === '1';
    document.querySelectorAll('[data-playoff-control],[data-team-filter]').forEach(control => { control.disabled = false; });
    function render(updateUrl = true) {
      const matches = model.filterPlayers(ranked,{search:search.value,team:select.value,leadersOnly:leaders.checked});
      document.getElementById('playoffRows').innerHTML = rows(matches,data);
      const count = matches.filter(player => player.rank !== null).length;
      document.getElementById('playoffResults').textContent = `${count} ranked · ${matches.length - count} unranked · ${matches.length} of ${ranked.length} roster entries. Overall ranks stay fixed when filtered.`;
      document.getElementById('playoffEmpty').hidden = matches.length > 0;
      document.getElementById('playoffTable').hidden = matches.length === 0;
      document.querySelectorAll('[data-team-filter]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.teamFilter === select.value)));
      if (updateUrl) {
        const next = new URLSearchParams();
        if (select.value) next.set('team',select.value);
        if (search.value.trim()) next.set('search',search.value.trim());
        if (leaders.checked) next.set('leaders','1');
        history.replaceState(null,'',`${location.pathname}${next.size ? `?${next}` : ''}${location.hash}`);
      }
    }
    search.addEventListener('input',()=>render());
    select.addEventListener('change',()=>render());
    leaders.addEventListener('change',()=>render());
    reset.addEventListener('click',()=>{search.value='';select.value='';leaders.checked=false;render();search.focus();});
    document.querySelectorAll('[data-team-filter]').forEach(button => button.addEventListener('click',()=>{
      select.value = button.dataset.teamFilter; search.value = ''; leaders.checked = false; render();
      document.getElementById('rankings').scrollIntoView({block:'start'}); select.focus({preventScroll:true});
    }));
    document.addEventListener('error',event=>{
      if(event.target.tagName==='IMG' && event.target.closest('.pr-portrait')) {
        event.target.hidden=true;
        event.target.parentElement.title=`Portrait unavailable: ${event.target.alt}`;
      }
    },true);
    render(false);
  }
  return {rows,teams,podium,start};
});
