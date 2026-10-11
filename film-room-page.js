const filmPositions = [
  {
    number: 1,
    short: 'PG',
    title: 'Point guard',
    player: 'Chelsea Gray',
    photo: 'https://cdn.wnba.com/headshots/wnba/latest/1040x760/203833.png',
    color: '#6f2bd9',
    description: 'Organizes the offense, controls pace and puts teammates in positions where they can succeed.',
    jobs: ['Initiate', 'Create', 'Manage pace']
  },
  {
    number: 2,
    short: 'SG',
    title: 'Shooting guard',
    player: 'Kelsey Mitchell',
    photo: 'https://cdn.wnba.com/headshots/wnba/latest/1040x760/1628909.png',
    color: '#ff6b57',
    description: 'Stretches the defense with shooting, attacks closeouts and scores on or away from the ball.',
    jobs: ['Shoot', 'Cut', 'Attack gaps']
  },
  {
    number: 3,
    short: 'SF',
    title: 'Wing / small forward',
    player: 'Napheesa Collier',
    photo: 'https://cdn.wnba.com/headshots/wnba/latest/1040x760/1629483.png',
    color: '#42b99b',
    description: 'Connects the lineup with versatile scoring, rebounding and the ability to defend several roles.',
    jobs: ['Connect', 'Defend wings', 'Rebound']
  },
  {
    number: 4,
    short: 'PF',
    title: 'Power forward',
    player: 'Breanna Stewart',
    photo: 'https://cdn.wnba.com/headshots/wnba/latest/1040x760/1627668.png',
    color: '#f0be32',
    description: 'Creates matchup problems with size, skill, screening and shooting from multiple levels.',
    jobs: ['Screen', 'Space', 'Score inside-out']
  },
  {
    number: 5,
    short: 'C',
    title: 'Center',
    player: "A'ja Wilson",
    photo: 'https://cdn.wnba.com/headshots/wnba/latest/1040x760/1628932.png',
    color: '#3265bd',
    description: 'Anchors the paint, protects the rim, screens, rebounds and creates efficient interior offense.',
    jobs: ['Protect rim', 'Screen', 'Finish']
  }
];

function filmSafe(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function positionMarkup(item) {
  const href = `/playerpedia.html?search=${encodeURIComponent(item.player)}`;
  return `
    <article class="position-card" style="--role-color:${filmSafe(item.color)}">
      <div class="position-photo">
        <span class="position-number">${item.number}</span>
        <img src="${filmSafe(item.photo)}" alt="${filmSafe(item.player)}" loading="lazy" decoding="async">
      </div>
      <div class="position-copy">
        <small>${filmSafe(item.short)} · ROLE EXAMPLE</small>
        <h3>${filmSafe(item.title)}</h3>
        <span class="player-example">Watch: ${filmSafe(item.player)}</span>
        <p>${filmSafe(item.description)}</p>
        <ul class="position-jobs">${item.jobs.map(job => `<li>${filmSafe(job)}</li>`).join('')}</ul>
        <a href="${href}">Player profile →</a>
      </div>
    </article>`;
}

function arrowDefs(id) {
  return `<defs>
    <marker id="${id}-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#1c1830"/></marker>
    <marker id="${id}-pass" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#6d29cf"/></marker>
  </defs>`;
}

function court() {
  return `<g class="board-court"><rect x="9" y="9" width="302" height="202" rx="3"/><path d="M116 9v72h88V9M116 81h88M116 81a50 50 0 0 0 88 0M87 9a73 73 0 0 0 146 0"/><circle cx="160" cy="31" r="5"/><path d="M145 26h30"/></g>`;
}

function offensePlayer(x, y, n) {
  return `<g><circle class="board-o" cx="${x}" cy="${y}" r="15"/><text class="board-text" x="${x}" y="${y}">${n}</text></g>`;
}

function defensePlayer(x, y, n) {
  return `<g class="board-x"><path d="M${x - 10} ${y - 10}L${x + 10} ${y + 10}M${x + 10} ${y - 10}L${x - 10} ${y + 10}"/><text class="board-text" x="${x}" y="${y + 25}">X${n}</text></g>`;
}

const boards = {
  pickRoll: {
    label: 'TWO-PLAYER ENGINE',
    title: 'High pick-and-roll',
    description: 'The 5 screens for the 1. The ballhandler reads the on-ball defender, the big defender and the weak-side help.',
    watch: 'Watch the defender guarding 5: drop, switch, hedge or blitz?',
    drawing(id) { return `${arrowDefs(id)}${court()}
      ${offensePlayer(160,170,'1')}${offensePlayer(204,138,'5')}${offensePlayer(55,160,'2')}${offensePlayer(265,160,'3')}${offensePlayer(62,62,'4')}
      <path class="board-screen" d="M187 138l18 15"/><path class="board-line" marker-end="url(#${id}-arrow)" d="M160 153c8-20 21-30 37-34"/><path class="board-line" marker-end="url(#${id}-arrow)" d="M211 123c-3-35-17-55-37-70"/><text class="board-note" x="204" y="181">screen → roll</text>`; }
  },
  horns: {
    label: 'MULTIPLE DOORS',
    title: 'Horns alignment',
    description: 'Two players begin at the elbows while shooters occupy the corners. The point guard can use either screen, enter a handoff or trigger a high-low action.',
    watch: 'Do both elbow players screen, or does one pop while the other rolls?',
    drawing(id) { return `${arrowDefs(id)}${court()}
      ${offensePlayer(160,181,'1')}${offensePlayer(118,103,'4')}${offensePlayer(202,103,'5')}${offensePlayer(48,55,'2')}${offensePlayer(272,55,'3')}
      <path class="board-screen" d="M104 107l8 22M216 107l-8 22"/><path class="board-line" marker-end="url(#${id}-arrow)" d="M155 164c-4-28-17-36-31-42"/><path class="board-pass" marker-end="url(#${id}-pass)" d="M149 174Q110 142 116 117"/><text class="board-note" x="126" y="202">choose an elbow</text>`; }
  },
  spain: {
    label: 'THREE-PLAYER PUZZLE',
    title: 'Spain pick-and-roll',
    description: 'The 5 screens for the ball, then the 2 back-screens the defender responsible for the rolling 5 before popping to space.',
    watch: 'The defense must cover the ball, the roll and the popping shooter at once.',
    drawing(id) { return `${arrowDefs(id)}${court()}
      ${offensePlayer(150,180,'1')}${offensePlayer(190,137,'5')}${offensePlayer(185,92,'2')}${offensePlayer(50,155,'3')}${offensePlayer(270,155,'4')}
      ${defensePlayer(192,112,'5')}<path class="board-screen" d="M176 140l19 13M171 99h28"/><path class="board-line" marker-end="url(#${id}-arrow)" d="M153 163c8-23 19-32 31-38"/><path class="board-line" marker-end="url(#${id}-arrow)" d="M194 124c1-33-8-53-23-67"/><path class="board-line" marker-end="url(#${id}-arrow)" d="M198 88c28-9 46-2 57 11"/>`; }
  },
  drop: {
    label: 'PICK-AND-ROLL COVERAGE',
    title: 'Drop coverage',
    description: 'The big defender stays below the screen to protect the rim while the guard defender fights over and pressures from behind.',
    watch: 'The tradeoff is space for pull-up jumpers and pocket passes.',
    drawing(id) { return `${arrowDefs(id)}${court()}
      ${offensePlayer(145,170,'1')}${offensePlayer(190,135,'5')}${defensePlayer(145,146,'1')}${defensePlayer(177,88,'5')}
      <path class="board-screen" d="M176 138l17 14"/><path class="board-line" marker-end="url(#${id}-arrow)" d="M148 154c8-17 21-27 34-33"/><path class="board-line" marker-end="url(#${id}-arrow)" d="M155 140c12-9 19-13 28-14"/><path class="board-line" marker-end="url(#${id}-arrow)" d="M177 104v-8"/><text class="board-note" x="190" y="61">X5 protects paint</text>`; }
  },
  switch: {
    label: 'EXCHANGE ASSIGNMENTS',
    title: 'Switch',
    description: 'The two defenders exchange matchups when the screen arrives, attempting to remove the immediate advantage without losing contact.',
    watch: 'Can the offense punish the new matchup in space or in the post?',
    drawing(id) { return `${arrowDefs(id)}${court()}
      ${offensePlayer(140,170,'1')}${offensePlayer(190,132,'5')}${defensePlayer(140,145,'1')}${defensePlayer(202,112,'5')}
      <path class="board-screen" d="M177 135l18 15"/><path class="board-line" marker-end="url(#${id}-arrow)" d="M145 134Q176 101 195 105"/><path class="board-line" marker-end="url(#${id}-arrow)" d="M197 123Q173 149 156 161"/><text class="board-note" x="235" y="177">trade matchups</text>`; }
  },
  zone: {
    label: 'AREA DEFENSE',
    title: '2–3 zone',
    description: 'Two defenders form the top line and three protect the back line. Players guard areas and pass cutters between zones.',
    watch: 'Look for gaps at the nail, short corner and behind the top line.',
    drawing(id) { return `${arrowDefs(id)}${court()}
      ${defensePlayer(118,142,'1')}${defensePlayer(202,142,'2')}${defensePlayer(62,72,'3')}${defensePlayer(160,68,'5')}${defensePlayer(258,72,'4')}
      <path class="board-pass" marker-end="url(#${id}-pass)" d="M47 168Q158 123 273 168"/><path class="board-line" marker-end="url(#${id}-arrow)" d="M118 130l18-25M202 130l-18-25"/><text class="board-note" x="160" y="194">move the zone with the pass</text>`; }
  }
};

function clipboardMarkup(key, index) {
  const item = boards[key];
  const id = `film-${key}-${index}`;
  return `<article class="clipboard-card">
    <div class="clipboard-top">${filmSafe(item.label)}</div>
    <div class="clipboard-drawing"><svg viewBox="0 0 320 220" role="img" aria-label="Clipboard diagram of ${filmSafe(item.title)}">${item.drawing(id)}</svg></div>
    <div class="clipboard-copy"><h3>${filmSafe(item.title)}</h3><p>${filmSafe(item.description)}</p><strong>Coach's eye: ${filmSafe(item.watch)}</strong></div>
  </article>`;
}

const coachSteps = [
  ['Before the action', 'Name the lineup', 'Identify the primary ballhandler, screeners, shooters and likely matchup targets.'],
  ['First five seconds', 'Read transition', 'Did the offense push, flow directly into an action or pull the ball out to organize?'],
  ['At the screen', 'Find the coverage', 'Watch both defenders involved in the screen—not only the player with the ball.'],
  ['Away from the ball', 'Track the low defender', 'Who tags the roller, bumps a cutter or leaves the corner to protect the rim?'],
  ['When advantage appears', 'Follow the rotation', 'Which defender helps next, and which pass becomes available because of that help?'],
  ['After the shot', 'Finish the possession', 'Notice box-outs, rebound lanes, transition balance and who leaks out early.'],
  ['Across possessions', 'Spot the adjustment', 'Look for a coverage change, different matchup, new screen angle or substitution response.']
];

function coachMarkup(item, index) {
  return `<article class="coach-step"><span>${index + 1}</span><div><strong>${filmSafe(item[0])}</strong><h3>${filmSafe(item[1])}</h3></div><div><p>${filmSafe(item[2])}</p></div></article>`;
}

document.getElementById('positionGrid').innerHTML = filmPositions.map(positionMarkup).join('');
document.getElementById('offenseBoards').innerHTML = ['pickRoll', 'horns', 'spain'].map(clipboardMarkup).join('');
document.getElementById('defenseBoards').innerHTML = ['drop', 'switch', 'zone'].map(clipboardMarkup).join('');
document.getElementById('coachChecklist').innerHTML = coachSteps.map(coachMarkup).join('');
