(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WPlayoffRanking = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const aliases = {
    anastasiiaolairikosu: 'anastasiiakosu',
    raquelcarreraquintana: 'raquelcarrera',
    aliciaflorezgetino: 'aliciaflorez'
  };
  const key = value => {
    const name = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return aliases[name] || name;
  };
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const numeric = value => finite(value) ? value : -Infinity;
  function leadersFor(name, categories) {
    return Object.entries(categories).flatMap(([id, category]) =>
      category.leaders.filter(leader => leader.rank === 1 && key(leader.name) === key(name))
        .map(leader => ({id, label: category.label, unit: category.unit, value: leader.value}))
    );
  }
  function decision(a, b) {
    const criteria = [
      ['score', 'W score', numeric(a.score), numeric(b.score)],
      ['leaders', 'league-leading categories', (a.leaders || []).length, (b.leaders || []).length],
      ['per', 'PER', numeric(a.per), numeric(b.per)],
      ['tsPct', 'true shooting', numeric(a.tsPct), numeric(b.tsPct)],
      ['games', 'games played', numeric(a.games), numeric(b.games)]
    ];
    for (const [criterion, label, left, right] of criteria) {
      if (left !== right) return {order: left > right ? -1 : 1, criterion, label};
    }
    return {order: key(a.name).localeCompare(key(b.name)), criterion: 'name', label: 'alphabetical display order (statistically tied)'};
  }
  function rankPlayers(players) {
    const scored = players.filter(player => finite(player.score)).map(player => ({...player})).sort((a, b) => decision(a, b).order);
    scored.forEach((player, index) => {
      player.rank = index + 1;
      const next = scored[index + 1];
      const previous = scored[index - 1];
      const peer = next?.score === player.score ? next : previous?.score === player.score ? previous : null;
      player.tieNote = '';
      if (peer) {
        const result = decision(player, peer);
        player.tieNote = result.criterion === 'name'
          ? `Statistically tied with ${peer.name}; alphabetical display order.`
          : `${result.order < 0 ? 'Ahead of' : 'Behind'} ${peer.name} on ${result.label} at ${player.score} W.`;
      }
    });
    const unranked = players.filter(player => !finite(player.score)).map(player => ({...player, rank: null, tieNote: ''}))
      .sort((a, b) => key(a.name).localeCompare(key(b.name)));
    return [...scored, ...unranked];
  }
  function filterPlayers(players, {search = '', team = '', leadersOnly = false} = {}) {
    const query = key(search);
    return players.filter(player => (!team || player.teamSlug === team)
      && (!leadersOnly || player.leaders.length > 0)
      && (!query || key(`${player.name} ${player.team} ${player.position}`).includes(query) || key(player.name).includes(query)));
  }
  return {key, finite, leadersFor, decision, rankPlayers, filterPlayers};
});
