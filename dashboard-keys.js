(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.WDashboardKeys = factory(); root.WDashboardKeys.start(root); }
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const VERSION = '20260828-v1';
  const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const perGame = [
    ['PPG', 'Points per game.'], ['RPG', 'Rebounds per game.'], ['APG', 'Assists per game.'],
    ['SPG', 'Steals per game.'], ['BPG', 'Blocks per game.'], ['TOPG / TOV', 'Turnovers per game on a per-game board. Fewer is better.']
  ];
  const shooting = [
    ['FG%', 'Field goals made divided by field-goal attempts, including two- and three-point shots.'],
    ['3P%', 'Three-point shots made divided by three-point attempts.'],
    ['FT%', 'Free throws made divided by free-throw attempts.']
  ];
  const advanced = [
    ['PER', 'Player Efficiency Rating: a pace-adjusted measure of box-score production per minute. Higher is better.'],
    ['TS%', 'True shooting percentage: scoring efficiency across two-pointers, three-pointers and free throws.'],
    ['WS/40', 'Estimated win shares per 40 minutes.'],
    ['AST/TO', 'Assists relative to turnovers. Higher means more assists for each giveaway.']
  ];
  const gamesPlayed = [['G / GP', 'Games played.'], ['MPG', 'Minutes played per game.']];
  const missing = [['— / Unavailable', 'A missing or unavailable value, not a recorded zero.']];
  const checked = [['Updated / Checked', 'The time attached to the data check. Scores and reports can lag behind the action.']];
  const snapshot = [['Snapshot / Archive', 'A dated edition or past season. Its numbers stay attached to that date rather than changing with live results.']];
  const positions = [['PG · SG · SF · PF · C', 'Point guard · shooting guard · small forward · power forward · center. G means guard; F means forward.']];
  const roster = [
    ['Current / On the Floor', 'Listed with a current team. Roster membership does not guarantee availability for a game.'],
    ['Recent / Between Stops', 'Recently active, but not currently listed on a team roster. This does not by itself mean retired.'],
    ['Retired / Legends Lounge', 'A completed playing career. Historical statistics retain their original season.'],
    ['Developmental', 'A player listed on a developmental contract; separate from injury or game status.']
  ];
  const playerGrade = [
    ['W score / W grade', 'We Know the W’s player composite, scaled from 55 to 99. Higher is stronger relative to that WNBA season. A score displayed with a % sign is a rating, not a shooting percentage or win probability.'],
    ['Player letter grades', 'A+: 95–99; A: 90–94; A−: 87–89; B+: 84–86; B: 80–83; B−: 77–79; C+: 74–76; C: 70–73; C−: 67–69; D+: 64–66; D: 60–63; F: 55–59.'],
    ['NR', 'Not rated or ranked: no published grade for the displayed season or edition. This is not a zero or an F.']
  ];
  const liveProvisional = ['PROV / Provisional', 'A small playing-time sample: below the season’s game minimum or under 8 MPG. The game minimum is 25% of the largest games-played total in the season’s player data, rounded up and limited to 5–12 games. This label is not an injury or eligibility status.'];
  const standings = [
    ['W / L / W–L', 'Wins / losses / win–loss record.'],
    ['PCT', 'Winning percentage written as a decimal: .750 means 75% of games won.'],
    ['GB', 'Games behind the leader of the displayed standings. A dash in GB indicates no gap to the leader.'],
    ['CONF · HOME · ROAD', 'Win–loss records against conference opponents, at home and on the road.'],
    ['STREAK / STRK / Strk', 'Current run of wins or losses. W3 means three straight wins; L2 means two straight losses.'],
    ['L-10 / L10 / Last 10', 'Win–loss record over the last ten games, or the available games if fewer than ten have been played.']
  ];
  const playoffStatus = [
    ['✓ / Clinched', 'A playoff berth is secured. A final seed or home-court position is not necessarily secured.'],
    ['× / Eliminated', 'The team can no longer qualify for that season’s playoffs.'],
    ['Seed', 'Position in the playoff field. Before seeds are final, the displayed order can change.']
  ];
  const standingsColors = [['Standings colors', 'Green marks a winning streak or winning last-ten record; red marks a losing one. The W/L text and record carry the same information without color.']];
  const ratings = [
    ['Team W Rating', 'A team composite from 0 to 100: net rating 35%, offense 20%, defense 20%, SRS 15% and win percentage 10%, using league-relative ranks. It differs from a player’s W score.'],
    ['Team letter grade', 'A band based on the team’s W Rating rank within the league. Team grades do not use the player score cutoffs.'],
    ['Offense / OffRtg', 'Points scored per 100 possessions. Higher is better.'],
    ['Defense / DefRtg', 'Points allowed per 100 possessions. Lower is better.'],
    ['Net / NetRtg', 'Offensive rating minus defensive rating. A positive number means the team scores more than it allows per 100 possessions.']
  ];
  const availability = [
    ['Available / Probable', 'Available means listed as able to play; probable means likely to play. Status can change before tipoff.'],
    ['Questionable / Doubtful', 'Questionable means uncertain; doubtful means unlikely to play. Neither is a confirmed absence.'],
    ['GTD / Day-to-day', 'Game-time decision / an absence being reassessed as the next game approaches. Neither confirms a return.'],
    ['Out / Out for season', 'Out applies to the listed game or report. Out for season identifies a season-long absence.'],
    ['Not submitted', 'The team’s report is still pending. It does not mean everyone is available.'],
    ['Additional tracked absence / Cross-check', 'An absence carried from another source or an earlier report, outside the current official report window.'],
    ['Expected return', 'An estimate, not a confirmed return date.']
  ];
  const movement = [
    ['Signed', 'A player has joined a team on the contract described.'],
    ['Waived / Released', 'The team has removed the player from its roster. This does not mean retired.'],
    ['Traded', 'A move between teams; the listed destination is the receiving team.'],
    ['Free agent', 'Not currently under a team contract in the roster record.']
  ];
  const games = [
    ['LIVE', 'The game is in progress. Scores and clocks can be delayed by the source.'],
    ['Q1–Q4 · Half · OT', 'First through fourth quarter · halftime · overtime. The clock is time remaining in the displayed period.'],
    ['Final / F', 'The game has ended; the score is a result, not a live score.'],
    ['Upcoming / Scheduled / UP', 'The game has not started. TBD means the time, opponent or detail is not yet determined.'],
    ['@', 'Away team at home team.'],
    ['ET', 'Eastern Time, including the seasonal daylight-saving adjustment.'],
    ['Record in parentheses', 'The team’s season win–loss record, separate from the score of this game.'],
    ['Cup / Playoffs', 'The competition shown. Cup pool games count in the regular season; the Cup championship does not.']
  ];
  const teamCodes = ['Team codes', 'ATL: Atlanta; CHI: Chicago; CON: Connecticut; DAL: Dallas; GSV: Golden State; IND: Indiana; LVA: Las Vegas; LAS: Los Angeles; MIN: Minnesota; NYL: New York; PHO/PHX: Phoenix; POR/PDX: Portland; SEA: Seattle; TOR: Toronto; WAS: Washington.'];
  const rivalry = [
    ['W–L / Matrix cells', 'Wins and losses for the row team against the column opponent, or for the selected team against its listed opponent.'],
    ['Leading / Trailing / Even', 'More wins than losses / more losses than wins / equal wins and losses in that matchup.'],
    ['No meetings / 0–0', 'No completed meetings in the selected data window.'],
    ['All time', 'The historical regular-season franchise series covered by the archive, including linked relocation history. Coverage notes identify the available seasons.'],
    ['Rivalry colors', 'Green: leading. Red: trailing. Yellow: even. Neutral: no meetings. Records and edge labels also show the result.'],
    ['—', 'In the matrix diagonal, a team cannot play itself. In an archive field, a dash means the record is unavailable.']
  ];
  const leagueTeamStats = [
    ['PPG / OPPG', 'Points scored / opponent points allowed per game.'],
    ['Diff / Point diff', 'Points scored minus points allowed. Positive means outscoring opponents; negative means being outscored.'],
    ['PF / PA', 'Total points for / points against. On a team standings board, PF means points for, not personal fouls or power forward.']
  ];
  const types = {
    playoff: {title:'Playoff player rankings', hint:'Provisional = small sample · NR = unranked', rows: context => [
      ['Provisional', Number.isFinite(context.minGames) && Number.isFinite(context.minimumMinutes)
        ? `Fewer than ${context.minGames} games OR under ${context.minimumMinutes} minutes per game in this edition. The same grading formula is used, but a small sample can change more quickly. This is not an injury or playoff-eligibility label.`
        : 'Below this edition’s games-played or minutes-per-game minimum. The same grading formula is used on a smaller sample; this is not an injury or playoff-eligibility label.'],
      ...playerGrade,
      ['#1 badge', 'A qualified leader in that statistic across the whole WNBA, not just playoff teams. Co-leaders receive credit.'],
      ['Score tiebreaker', 'At the same numeric W score: more league-leading categories, then higher PER, higher TS%, then more games. An alphabetical display order does not break a remaining statistical tie. Matching letters alone are not a score tie.'],
      ['Rank', 'Overall place among this edition’s ranked players. Filtering to one team does not renumber the ranking.'],
      ...perGame, ...gamesPlayed, ...shooting, ...advanced,
      ['3PM / 3PM total', 'Total made three-pointers for the season, not threes per game.'],
      ...playoffStatus, ...snapshot, teamCodes, ...missing
    ]},
    teamLeaders: {title:'Team stat leaders', hint:'Per-game stats · shooting · shared leads', rows: () => [
      ...perGame.filter(([label]) => !label.startsWith('TOPG')), ['3PM/G', 'Made three-pointers per game.'], ...shooting,
      ['Team leader / Co-leaders', 'The highest exact rate among qualifying current roster members. Exact ties share the lead; equal rounded displays alone do not.'],
      ['Qualifying player', 'At least 5 games for this team. Shooting categories also require 50 FGA, 20 three-point attempts or 20 FTA, respectively. These are this dashboard’s minimums.'],
      ['FGA / FTA · made/attempted', 'Field-goal attempts / free-throw attempts. A line such as 40/80 means 40 shots made in 80 attempts.'],
      ['Games with this team', 'Only the player’s production for the displayed team counts. Statistics from a previous team are excluded.'],
      ['Out / Out for season', 'An availability label. An injured roster member can retain a lead earned earlier in the season.'],
      ['No qualifying player', 'No current roster member has the required games and attempts for that category. This does not mean a value of zero.'],
      ['Saved statistics / Refresh unavailable', 'Previously checked statistics remain visible because a fresh check could not finish. The displayed timestamp identifies their age.'],
      ...checked
    ]},
    standings: {title:'Standings', hint:'Records · streaks · playoff markers', rows: () => [...standings, ...playoffStatus, ...standingsColors, ['Cup / Series', 'Cup standings cover Cup pool play. Playoff series wins count games won within a postseason matchup, not regular-season wins.'], ...checked, ['Missing split', 'A dash in a record or split means that information is unavailable.']]},
    games: {title:'Games', hint:'Live · final · clock · time zone', rows: () => [...games, teamCodes, ...checked]},
    teamNow: {title:'Team season overview', hint:'Record · percentage · recent form', rows: () => [...standings, ...playoffStatus, ...checked]},
    teamRating: {title:'The Seasoning Scale', hint:'Team rating · letter grades · efficiency', rows: () => [...ratings, ['League average', 'The mean W Rating of the teams on this board; a comparison line, not an extra ranked team.'], ['Record', 'Season wins followed by losses.'], ['SRS', 'Simple Rating System: average scoring margin adjusted for strength of schedule.'], ...checked, ...missing]},
    dna: {title:'Team DNA', hint:'Ratings · colors · Team Temperature', rows: () => [
      ...ratings,
      ['#n of N / Colors', 'The team’s metric rank within the available league pool. Green: top third; yellow: middle third; red: bottom third. Pace and schedule strength remain neutral.'],
      ['Pace / poss.', 'Possessions per 40 minutes / possessions. Faster describes tempo, not automatically better play.'],
      ['eFG% / Effective FG%', 'Field-goal percentage adjusted to give three-pointers their extra scoring value.'],
      ...advanced.filter(([label]) => label === 'TS%'),
      ['Turnover % / Forced turnover %', 'Share of possessions ending in a turnover, for the team / its opponents. Lower is better for the team’s own turnovers; higher is better for forced turnovers.'],
      ['Offensive / Defensive rebound %', 'Share of available rebounds collected at the offensive / defensive end.'],
      ['Free throw rate · FTA/FGA', 'Free-throw attempts per field-goal attempt; this board expresses the rate per 100 field-goal attempts.'],
      ['Opponent FT/FGA', 'Free throws made by opponents per 100 field-goal attempts. This differs from free-throw attempts.'],
      ['SRS / Strength of schedule', 'Simple Rating System combines scoring margin with schedule strength. Higher schedule strength means tougher opposition.'],
      ['Average margin / Expected W–L', 'Average points scored minus points allowed per game / a modeled win–loss record based on scoring, not the actual record.'],
      ['Team Temperature', 'Recent-form composite: W Rating 55%, last-ten win rate 35%, streak score 10%. It is not a playoff forecast.'],
      ['Temperature labels', 'Scorching: 82+; Heating Up: 68 to under 82; Steady: 48 to under 68; Cold: 32 to under 48; In Trouble: under 32.'],
      ...standings.filter(([label]) => /STREAK|L-10|CONF/.test(label)), ...missing
    ]},
    players: {title:'Playerpedia', hint:'W grades · PROV · career stages · stats', rows: () => [
      ...playerGrade, liveProvisional, ...roster, ...positions, ...perGame, ...gamesPlayed, ...shooting, ...advanced,
      ['PTS · REB · AST · STL · BLK', 'Points · rebounds · assists · steals · blocks. On a season-average panel these are per game; on a career-total panel they are totals.'],
      ['Last active season', 'A historical season snapshot, not current-season production or an all-career grade.'], ...snapshot, ...missing
    ]},
    retired: {title:'Historical player statistics', hint:'Season grades · career records · missing data', rows: () => [
      ...playerGrade, ['Last active / Last-season snapshot', 'Statistics and a league-relative grade from the displayed WNBA season, not career averages or a comparison with today’s players.'],
      ['PTS · REB · AST · STL · BLK', 'Points · rebounds · assists · steals · blocks per game on the season snapshot. Career totals are identified separately.'],
      ...gamesPlayed, ...advanced, ...snapshot, ...missing
    ]},
    roster: {title:'Roster', hint:'Positions · developmental · game status', rows: () => [...positions, ...roster, ['Waived / Released', 'No longer on that team’s current roster. A past team can still appear in the player’s career history.'], ...checked]},
    availability: {title:'Availability report', hint:'Out · questionable · reports pending', rows: () => [...availability, ...checked]},
    movement: {title:'Player movement', hint:'Signed · waived · traded · free agent', rows: () => [...movement, ['Checked / Transaction date', 'Checked is the data-check time. The transaction date identifies when the move occurred.']]},
    weekly: {title:'Weekly Heat Check', hint:'First Serving · Repeat Heat · Latest', rows: () => [
      ['First Serving', 'The player’s first recorded weekly award win of this season.'], ['Repeat Heat / nth win', 'A player who won in an earlier week; the number counts her wins through the displayed week.'],
      ['Latest / Current winner', 'The newest award week recorded here, not a live statistical ranking.'], ['East / West', 'Eastern / Western Conference award winner.'], ...perGame
    ]},
    kitchen: {title:'Stat Kitchen leaders', hint:'Head Chef · per-game stats · turnovers', rows: () => [
      ['Head Chef / #1', 'The first-ranked player in the selected statistic. For turnovers, the highest value means the most giveaways, not the best performance.'],
      ...perGame, ['3PG / 3PM', 'Made three-pointers per game on this leaderboard. The playoff board separately labels season totals.'], ['Qualified', 'Meets the source’s minimum participation requirements for the selected leaderboard.'], ...checked, ...missing
    ]},
    rivalry: {title:'Head-to-head records', hint:'Leading · trailing · matchup records', rows: () => [...rivalry, ...checked]},
    teamRivalry: {title:'Team rivalry board', hint:'Series edge · Struggle meter', rows: () => [
      ...rivalry, ['Struggle meter', 'Percentage of this franchise’s recorded all-time meetings with the opponent that ended in losses. Higher means more losses, not a forecast.'],
      ['Meter labels', 'You own this stop: up to 35% losses; Light traffic: over 35% to 50%; Rush hour: over 50% to 60%; Uphill transfer: over 60% to 70%; Service disruption: over 70%.'], ...checked
    ]},
    starting: {title:'Starting Five', hint:'Positions · editorial rotation · archive', rows: () => [...positions, ['Starting Five', 'Shak’s five editorial selections for the displayed week, arranged by position. This is not an official team starting lineup.'], ...snapshot]},
    bench: {title:'Bench Mob', hint:'Sixth Woman · 3 & D · role selections', rows: () => [
      ['Bench Mob', 'Shak’s weekly role selections. A Bench Mob role does not necessarily match the player’s official team role.'],
      ['Sixth Woman', 'The first impact option beyond the starting five.'], ['Microwave Scorer', 'A player who can produce points in a hurry.'], ['3 & D Wing', 'A perimeter player valued for three-point shooting and defense.'],
      ['Glue Player / Floor General', 'A connector who organizes play and helps the lineup function together.'], ['Backup Floor General', 'A second playmaker who can direct the offense.'], ['Energy Big', 'A frontcourt player bringing rebounding, defensive activity and effort.'], ...perGame, ...shooting, ...snapshot
    ]},
    college: {title:'College statistics', hint:'Total points · per-game averages · season', rows: () => [...perGame, ...shooting, ['PTS / Total points', 'Points scored across the games in the displayed season. Total points and PPG are different rankings.'], ['Season / As of', 'The season and date represented by the college data, separate from WNBA production.'], ...missing]},
    upshot: {title:'UPSHOT standings and team statistics', hint:'W–L · PPG · OPPG · point differential', rows: () => [...standings, ...leagueTeamStats, ['Home / Away', 'Win–loss records at home / away from home.'], ...snapshot, ...missing]},
    upshotPlayers: {title:'UPSHOT player leaders', hint:'Points · averages · call-ups', rows: () => [...perGame, ...shooting, ['Call-up', 'A player moving from UPSHOT to the WNBA on the contract listed.'], ['As of', 'The date attached to that player’s statistic; different rows can have different dates.'], ...missing]},
    unrivaledStandings: {title:'Unrivaled standings', hint:'Record · PF · PA · differential', rows: () => [...standings.filter(([label]) => !/CONF|GB/.test(label)), ...leagueTeamStats, ['Finish', 'Postseason outcome, which can differ from regular-season rank.'], ...snapshot]},
    unrivaledPlayers: {title:'Unrivaled player board', hint:'Unrivaled grade · GP · STL+BLK · NR', rows: () => [
      ['Unrivaled grade', 'A separate rating within this archive’s listed player sample: scoring 35%, rebounds 18%, assists 18%, steals plus blocks 12%, turnover control 7%, team win rate 10%. It is not the WNBA W composite.'],
      ['Grade score', 'The composite order is scaled to 98 for first, then two points lower per place. Letter bands summarize that separate scale. The row order is not necessarily the grade order.'],
      ['Unrivaled letter bands', 'A+: 97+; A: 93–96; A−: 90–92; B+: 87–89; B: 83–86; B−: 80–82; C+: 77–79; C: 73–76; C−: 70–72; D+: 67–69; D: 63–66; D−: below 63.'],
      ['NR / Season 3 grade', 'No grade recorded for that Unrivaled season. A prior-season grade remains labeled with its original year.'],
      ...perGame, ...gamesPlayed, ['STL+BLK', 'Steals plus blocks per game.'], ...snapshot
    ]},
    au: {title:'Athletes Unlimited leaderboard', hint:'AU points · AU grade · captain', rows: () => [
      ['pts / AU points', 'AU leaderboard points earned through team wins, individual statistics and MVP votes. These are not simply basketball points scored.'],
      ['AU grade', 'A separate 80–99 rating for this listed leaderboard sample: normalized AU points 85% and rank 15%. It is not the WNBA W composite.'],
      ['AU letter bands', 'A+: 97–99; A: 93–96; A−: 90–92; B+: 87–89; B: 83–86; B−: 80–82 on this board.'],
      ['Captain / Week 4', 'The player who drafted that weekly team / the final-week roster shown. AU teams are redrafted weekly.'], ...snapshot
    ]},
    duos: {title:'Legendary duos rankings', hint:'Rank · repeat appearances · provisional season', rows: () => [
      ['Rank / Year', 'Shak’s editorial order among the selected season duos / the season that pairing represents.'],
      ['2×, 3× and higher', 'The number of yearly selections featuring that player in the main ranked list.'],
      ['2026* / Provisional', 'The season is unfinished, so this duo’s historical placement can change. Here it describes the season, not a player’s games or minutes.'],
      ['Honorable mention', 'Additional pairings recognized for the same season, outside its main selection.'], ['MVP / Finals MVP / DPOY', 'Most Valuable Player / Finals Most Valuable Player / Defensive Player of the Year.']
    ]},
    records: {title:'Record boards', hint:'Single game · career totals · tied ranks', rows: () => [
      ['Single game / Season / Rookie / Career', 'A record from one game / one season / a rookie season / an entire career. These are not per-game averages.'],
      ['PTS · REB · AST · STL · BLK · 3PM', 'Points · rebounds · assists · steals · blocks · made three-pointers.'],
      ['T / Tied rank', 'T1 means tied for first. Players or teams sharing the same recorded mark share a rank. More than five names can appear in five ranking positions.'], ['Bold names', 'Players marked active by the roster check or the saved record snapshot.'], ['Regular season', 'Playoff performances are excluded unless a board explicitly identifies them.'], ...checked, ...missing
    ]}
  };
  const entry = (id, target, type, extra = {}) => ({id, target, type, ...extra});
  const routes = {
    'index.html': [entry('home-standings','#homeStandings','standings'), entry('home-games','#homeResults','games')],
    'playoff-player-rankings.html': [entry('playoff','#playoffResults','playoff')],
    'team.html': [entry('team-now','#dreamStatGrid','teamNow'), entry('team-leaders','#teamLeadersGrid','teamLeaders'), entry('team-dna','#teamDnaBody','dna'), entry('team-rivalry','#teamRivalryBody','teamRivalry'), entry('team-upcoming','#dreamUpcomingGames','games'), entry('team-results','#dreamRecentGames','games'), entry('team-availability','#dreamTeamUpdates','availability'), entry('team-roster','#teamRoster','roster')],
    'live-stats.html': [entry('live-standings','#liveStatsTable','standings')],
    'around-the-w.html': [entry('around-standings','#aroundStandings','standings')],
    'games.html': [entry('games','#gamesList','games')],
    'stat-kitchen.html': [entry('weekly-awards','#awardLegend','weekly', {placement:'replace'}), entry('team-ratings','#compositeTable','teamRating'), entry('kitchen-leaders','#leaderboard','kitchen')],
    'playerpedia.html': [entry('players','#playerGrid','players'), entry('player-profile','#playerModalBody','players', {placement:'afterbegin'}), entry('player-availability','#injuryFeed','availability'), entry('player-movement','#transactionFeed','movement')],
    'retired-players.html': [entry('retired-players','#retiredPlayerGrid','retired')],
    'availability-report.html': [entry('availability','#wireList','availability')],
    'player-movement.html': [entry('movement','#wireList','movement')],
    'no-love-lost.html': [entry('rivalries','#rivalryFocus','rivalry')],
    'starting-five.html': [entry('starting-five','#startingFiveGrid','starting')],
    'bench-mob.html': [entry('bench-mob','#benchMobGrid','bench')],
    'class-is-in-session.html': [entry('college-stats','#statWatch','college'), entry('college-points','#collegePointsLeaders','college'), entry('college-ppg','#collegePpgLeaders','college')],
    'the-call-up.html': [entry('upshot-pulse','#upshotSnapshot','upshot'), entry('upshot-standings','#upshotStandings','upshot'), entry('upshot-team','#upshotTeamPanel','upshot'), entry('upshot-stats','#upshotMetricBoard','upshot'), entry('upshot-players','#upshotLeaderGrid','upshotPlayers')],
    'unrivaled.html': [entry('unrivaled-signings','#unrivaledSignings','unrivaledPlayers'), entry('unrivaled-archive-teams','#unrivaledArchiveStandings','unrivaledStandings'), entry('unrivaled-archive-players','#unrivaledArchivePlayers','unrivaledPlayers'), entry('unrivaled-standings','#unrivaledStandings','unrivaledStandings'), entry('unrivaled-club','#unrivaledClubPanel','unrivaledStandings'), entry('unrivaled-leaders','#unrivaledPlayerLeaders','unrivaledPlayers'), entry('unrivaled-team-leaders','#unrivaledTeamLeaders','unrivaledStandings')],
    'athletes-unlimited.html': [entry('au-leaders','#auLeaderboard','au'), entry('au-team','#auTeamPanel','au')],
    'legendary-wnba-duos.html': [entry('duos','#duoRanking','duos')],
    'trophy-case.html': [entry('game-records','#recordRackBoards','records'), entry('career-records','#recordRackCareerBoards','records'), entry('team-records','#squadGoalsBoards','records')]
  };
  function render(config, context = {}, open = false) {
    const type = types[config.type];
    if (!type) throw new Error(`Unknown dashboard key: ${config.type}`);
    return `<details class="w-dashboard-key" id="dashboard-key-${safe(config.id)}" aria-label="${safe(type.title)}: dashboard key"${open ? ' open' : ''}><summary><span class="w-dashboard-key-title">Dashboard key</span><span class="w-dashboard-key-hint">${safe(type.hint)}</span></summary><dl>${type.rows(context).map(([term, meaning]) => `<div><dt>${safe(term)}</dt><dd>${safe(meaning)}</dd></div>`).join('')}</dl></details>`;
  }
  function contextFrom(document) {
    try { return JSON.parse(document.getElementById('playoffSnapshot')?.textContent || '{}'); }
    catch { return {}; }
  }
  function mount(document, configs, context = {}, openKeys = new Map()) {
    for (const config of configs) {
      if (document.getElementById(`dashboard-key-${config.id}`)) continue;
      const target = document.querySelector(config.target);
      if (!target) continue;
      const html = render(config, context, openKeys.get(config.id));
      if (config.placement === 'replace') target.innerHTML = html;
      else target.insertAdjacentHTML(config.placement || 'beforebegin', html);
    }
  }
  function start(window) {
    const document = window.document;
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const configs = routes[page];
    if (!configs || window.__wDashboardKeysStarted) return;
    window.__wDashboardKeysStarted = true;
    if (!document.querySelector('link[data-dashboard-keys]')) {
      const style = document.createElement('link');
      style.rel = 'stylesheet'; style.href = `/dashboard-keys.css?v=${VERSION}`;
      style.dataset.dashboardKeys = 'true'; document.head.appendChild(style);
    }
    const openKeys = new Map();
    document.addEventListener('toggle', event => {
      if (event.target.classList?.contains('w-dashboard-key')) openKeys.set(event.target.id.replace('dashboard-key-', ''), event.target.open);
    }, true);
    function attach() {
      const context = contextFrom(document);
      const update = () => mount(document, configs, context, openKeys);
      update();
      let queued = false;
      // Team refreshes and player dialogs can replace their entire contents.
      const observer = new window.MutationObserver(() => {
        if (queued) return;
        queued = true;
        window.setTimeout(() => { queued = false; update(); }, 0);
      });
      observer.observe(document.body, {childList:true, subtree:true});
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach, {once:true});
    else attach();
  }
  return {VERSION, types, routes, render, mount, contextFrom, start};
});
