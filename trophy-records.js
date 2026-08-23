(() => {
  const data = window.TROPHY_RECORDS_DATA;
  if (!data) return;

  const esc = (value = '') => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const key = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const initials = (value = '') => String(value).split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0,3).toUpperCase();
  const scopeLabels = {game:'Single Game',season:'Season',rookie:'Rookie',career:'Career'};
  const playerBoardsRoot = document.getElementById('recordRackBoards');
  const careerBoardsRoot = document.getElementById('recordRackCareerBoards');
  const teamBoardsRoot = document.getElementById('squadGoalsBoards');
  const sourceRoot = document.getElementById('recordSources');
  const checked = document.getElementById('recordRackChecked');
  const activeNames = new Set();
  const teamLogoMap = new Map();

  function playerRow(entry, unit) {
    const active = Boolean(entry.activeAtSnapshot);
    return `<li class="record-row${active ? ' is-active' : ''}" data-player="${esc(key(entry.name))}">
      <span class="record-rank">${esc(entry.rank)}</span>
      <span class="record-person"><span class="record-name">${esc(entry.name)}</span><small>${esc(entry.detail || '')}</small></span>
      <span class="record-number"><b>${esc(entry.value)}</b><small>${esc(unit || '')}</small></span>
    </li>`;
  }

  function teamRow(entry, unit) {
    return `<li class="record-row team-record-row">
      <span class="record-rank">${esc(entry.rank)}</span>
      <span class="record-team"><span class="team-record-logo" data-record-team-logo="${esc(key(entry.team))}"><b>${esc(initials(entry.team))}</b></span><span><span class="record-name">${esc(entry.team)}</span><small>${esc(entry.detail || '')}</small></span></span>
      <span class="record-number"><b>${esc(entry.value)}</b><small>${esc(unit || '')}</small></span>
    </li>`;
  }

  function rowsMarkup(entries, unit, type = 'player') {
    return `<ol class="record-list">${(entries || []).map(entry => type === 'team' ? teamRow(entry, unit) : playerRow(entry, unit)).join('')}</ol>`;
  }

  function renderScopeBoard(board) {
    const scopes = ['game','season','rookie','career'].filter(scope => Array.isArray(board.scopes?.[scope]));
    const selected = scopes.includes(board.defaultScope) ? board.defaultScope : scopes[0];
    return `<article class="record-board" data-record-board="${esc(board.key)}" data-scope="${esc(selected)}">
      <header class="record-board-head"><div><span>${esc(board.eyebrow)}</span><h3>${esc(board.title)}</h3></div><b class="record-unit">${esc(board.unit)}</b></header>
      <div class="record-scope-tabs" role="tablist" aria-label="${esc(board.title)} record scope">
        ${scopes.map(scope => `<button type="button" role="tab" data-record-scope="${scope}" class="${scope === selected ? 'active' : ''}" aria-selected="${scope === selected ? 'true' : 'false'}">${esc(scopeLabels[scope])}</button>`).join('')}
      </div>
      <div class="record-board-body">${rowsMarkup(board.scopes[selected], board.unit)}</div>
      <footer class="record-board-foot"><a href="${esc(board.source)}" target="_blank" rel="noopener">Source ↗</a><span>Top five ranks · ties shown</span></footer>
    </article>`;
  }

  function renderCareerBoard(board) {
    return `<article class="record-board career-record-board" data-record-board="${esc(board.key)}">
      <header class="record-board-head"><div><span>${esc(board.eyebrow)}</span><h3>${esc(board.title)}</h3></div><b class="record-unit">${esc(board.unit)}</b></header>
      <div class="career-only-label">CAREER · REGULAR SEASON</div>
      <div class="record-board-body">${rowsMarkup(board.entries, board.unit)}</div>
      ${board.note ? `<p class="record-board-note">${esc(board.note)}</p>` : ''}
      <footer class="record-board-foot"><a href="${esc(board.source)}" target="_blank" rel="noopener">Source ↗</a><span>Top five ranks · ties shown</span></footer>
    </article>`;
  }

  function renderTeamBoard(board) {
    return `<article class="record-board team-record-board" data-team-record-board="${esc(board.key)}">
      <header class="record-board-head"><div><span>${esc(board.eyebrow)}</span><h3>${esc(board.title)}</h3></div><b class="record-unit">${esc(board.unit)}</b></header>
      <div class="career-only-label">TEAM · SINGLE GAME</div>
      <div class="record-board-body">${rowsMarkup(board.entries, board.unit, 'team')}</div>
      ${board.note ? `<p class="record-board-note">${esc(board.note)}</p>` : ''}
      <footer class="record-board-foot"><a href="${esc(board.source)}" target="_blank" rel="noopener">Source ↗</a><span>Top five ranks · ties shown</span></footer>
    </article>`;
  }

  if (playerBoardsRoot) playerBoardsRoot.innerHTML = data.playerBoards.map(renderScopeBoard).join('');
  if (careerBoardsRoot) careerBoardsRoot.innerHTML = data.careerOnlyBoards.map(renderCareerBoard).join('');
  if (teamBoardsRoot) teamBoardsRoot.innerHTML = data.teamBoards.map(renderTeamBoard).join('');
  if (checked) checked.textContent = `Snapshot updated ${new Date(`${data.updatedAt}T12:00:00`).toLocaleDateString([], {month:'long',day:'numeric',year:'numeric'})}`;

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-record-scope]');
    if (!button) return;
    const boardEl = button.closest('[data-record-board]');
    const board = data.playerBoards.find(item => item.key === boardEl?.dataset.recordBoard);
    const scope = button.dataset.recordScope;
    if (!board || !board.scopes?.[scope]) return;
    boardEl.dataset.scope = scope;
    boardEl.querySelectorAll('[data-record-scope]').forEach(tab => {
      const active = tab === button;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    const body = boardEl.querySelector('.record-board-body');
    if (body) body.innerHTML = rowsMarkup(board.scopes[scope], board.unit);
    applyActiveState(boardEl);
  });

  function applyActiveState(root = document) {
    root.querySelectorAll('[data-player]').forEach(row => {
      if (!activeNames.size) return;
      row.classList.toggle('is-active', activeNames.has(row.dataset.player));
    });
  }

  async function refreshActivePlayers() {
    try {
      const response = await fetch(`/api/players?recordRack=${Date.now()}`, {headers:{Accept:'application/json'},cache:'no-store'});
      const payload = await response.json();
      if (!response.ok || !Array.isArray(payload.players)) return;
      activeNames.clear();
      payload.players.forEach(player => activeNames.add(key(player.name)));
      applyActiveState();
      document.querySelectorAll('[data-active-legend]').forEach(node => node.textContent = 'Bold = on a current 2026 roster');
    } catch { /* Snapshot flags remain as the fallback. */ }
  }

  function hydrateTeamLogos(root = document) {
    root.querySelectorAll('[data-record-team-logo]').forEach(slot => {
      const source = teamLogoMap.get(slot.dataset.recordTeamLogo);
      if (!source || slot.querySelector('img')) return;
      const image = document.createElement('img');
      image.src = source;
      image.alt = '';
      image.loading = 'lazy';
      image.addEventListener('error', () => image.remove());
      slot.appendChild(image);
    });
  }

  async function refreshTeamLogos() {
    try {
      const response = await fetch('/api/teams?recordRack=20260823-v1', {headers:{Accept:'application/json'}});
      const payload = await response.json();
      (payload.teams || []).forEach(team => teamLogoMap.set(key(team.name), team.badge || team.logo || ''));
      hydrateTeamLogos();
    } catch { /* Initials remain as fallback. */ }
  }

  if (sourceRoot) sourceRoot.innerHTML = data.sources.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener"><strong>${esc(source.label)}</strong><span>${esc(source.note)}</span></a>`).join('');

  refreshActivePlayers();
  refreshTeamLogos();
})();