// Re-render the dated edition after updating its reviewed source snapshot.
// No live API request is made by this build or by the dashboard.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const page = require(path.join(root, 'playoff-player-rankings.js'));
const model = require(path.join(root, 'playoff-ranking-model.js'));
const keys = require(path.join(root, 'dashboard-keys.js'));
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/playoff-player-rankings-2026.json'), 'utf8'));
const safe = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const file = path.join(root, 'playoff-player-rankings.html');
let html = fs.readFileSync(file, 'utf8');
function replace(name, content) {
  const pattern = new RegExp(`<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->`);
  if (!pattern.test(html)) throw new Error(`Missing ${name} build region`);
  html = html.replace(pattern, () => `<!-- ${name}:start -->${content}<!-- ${name}:end -->`);
}
replace('podium', page.podium(data));
replace('dashboard-key', keys.render(keys.routes['playoff-player-rankings.html'][0], data));
replace('teams', page.teams(data));
replace('rows', page.rows(model.rankPlayers(data.players), data));
replace('options', data.teams.map(team => `<option value="${safe(team.slug)}">${safe(team.name)}</option>`).join(''));
replace('sources', data.sources.map(source => `<a href="${safe(source.url)}" target="_blank" rel="noopener noreferrer">${safe(source.label)}</a>`).join(''));
replace('roster-sources', data.teams.map(team => `<a href="${safe(team.rosterUrl)}" target="_blank" rel="noopener noreferrer">${safe(team.name)}</a>`).join(''));
replace('photo-credits', data.players.filter(player => player.photoCredit).map(player => `<p>${safe(player.name)} portrait: <a href="${safe(player.photoSourceUrl)}" target="_blank" rel="noopener noreferrer">${safe(player.photoCredit)}</a>.</p>`).join(''));
replace('snapshot', `<script type="application/json" id="playoffSnapshot">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`);
fs.writeFileSync(file, html);
console.log(`Built ${data.players.length} roster entries (${data.players.filter(player => model.finite(player.score)).length} ranked).`);
