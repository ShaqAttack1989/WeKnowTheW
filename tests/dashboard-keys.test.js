const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const keys = require('../dashboard-keys');
const snapshot = require('../data/playoff-player-rankings-2026.json');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = (type, context = {}) => keys.render({id:type, type}, context);

// A small DOM fixture exercises insertion, replacement and delayed dashboard mounts.
function fixture(page = 'team.html', readyState = 'complete') {
  const nodes = new Map(), events = new Map(), timers = [], observers = [], styles = [];
  const document = {
    readyState, body:{},
    getElementById:id => nodes.get(id) || null,
    querySelector:selector => selector === 'link[data-dashboard-keys]' ? styles[0] || null : nodes.get(selector.slice(1)) || null,
    createElement:() => ({dataset:{}}),
    head:{appendChild:node => styles.push(node)},
    addEventListener:(type, callback) => events.set(type, callback)
  };
  function target(id) {
    const node = {id, writes:[], textContent:'', children:new Set()};
    function insert(position, content) {
      node.writes.push({position, content});
      const keyId = content.match(/id="([^"]+)"/)[1];
      const keyNode = {id:keyId, open:/ aria-label="[^"]+" open>/.test(content), classList:{contains:value => value === 'w-dashboard-key'}};
      nodes.set(keyId, keyNode);
      if (position === 'afterbegin' || position === 'replace') node.children.add(keyId);
    }
    node.insertAdjacentHTML = insert;
    Object.defineProperty(node, 'innerHTML', {set(content) {
      for (const child of node.children) nodes.delete(child);
      node.children.clear();
      if (content.includes('w-dashboard-key')) insert('replace', content);
    }});
    nodes.set(id, node);
    return node;
  }
  const window = {
    document, location:{pathname:'/' + page},
    MutationObserver:class {constructor(callback) {this.callback=callback;observers.push(this);} observe(node, options) {this.node=node;this.options=options;}},
    setTimeout:callback => timers.push(callback)
  };
  return {document, window, target, nodes, events, timers, observers, styles, flush:() => {while(timers.length)timers.shift()();}};
}

test('all keys render semantic, named, expandable definitions with visible hints', () => {
  for (const [type, definition] of Object.entries(keys.types)) {
    const content = html(type, snapshot);
    assert.match(content, /^<details class="w-dashboard-key"/);
    assert.match(content, /<summary><span class="w-dashboard-key-title">Dashboard key<\/span>/);
    assert.ok(content.includes(definition.hint.replace(/&/g,'&amp;')));
    assert.match(content, /aria-label="[^"<>]+: dashboard key"/);
    assert.equal((content.match(/<dt>/g)||[]).length, (content.match(/<dd>/g)||[]).length);
    assert.ok(definition.rows(snapshot).every(([term, meaning]) => term && meaning));
    assert.doesNotMatch(content, /\b(?:Codex|ChatGPT|TODO|developer note|your instructions|you asked|approval workflow|how to read)\b/i);
  }
});

test('playoff provisional definition follows the edition rather than a hard-coded season threshold', () => {
  assert.match(html('playoff', snapshot), /Fewer than 10 games OR under 8 minutes/);
  assert.match(html('playoff', {...snapshot,minGames:12,minimumMinutes:9}), /Fewer than 12 games OR under 9 minutes/);
  assert.match(html('playoff'), /Below this edition’s games-played/);
  assert.match(html('playoff'), /not an injury or playoff-eligibility label/);
  assert.match(html('duos'), /Here it describes the season, not a player/);
});

test('leader, missing-value and score-tie definitions retain their actual scope', () => {
  const playoff = html('playoff', snapshot), leaders = html('teamLeaders');
  assert.match(playoff, /whole WNBA, not just playoff teams/);
  assert.match(playoff, /same numeric W score/);
  assert.match(playoff, /Matching letters alone are not a score tie/);
  assert.match(playoff, /not a zero or an F/);
  assert.match(leaders, /At least 5 games/);
  assert.match(leaders, /50 FGA, 20 three-point attempts or 20 FTA/);
  assert.match(leaders, /Statistics from a previous team are excluded/);
  assert.match(leaders, /Exact ties share the lead/);
  assert.match(html('standings'), /dash in GB indicates no gap/);
  assert.match(html('rivalry'), /matrix diagonal, a team cannot play itself/);
  assert.match(html('kitchen'), /3PG \/ 3PM/);
});

test('standalone archive ratings are not described as WNBA player composites', () => {
  assert.match(html('unrivaledPlayers'), /not the WNBA W composite/);
  assert.match(html('au'), /not the WNBA W composite/);
  assert.match(html('au'), /not simply basketball points scored/);
  assert.match(html('teamRating'), /Team grades do not use the player score cutoffs/);
});

test('all route targets exist in their page or its dynamic renderer', () => {
  const dynamic = {'team.html':read('team-rivalry.js')};
  const seen = new Set();
  for (const [page, configs] of Object.entries(keys.routes)) {
    const source = read(page) + (dynamic[page] || '');
    for (const config of configs) {
      assert.ok(keys.types[config.type], config.type);
      assert.ok(!seen.has(config.id), `Duplicate key ID: ${config.id}`);seen.add(config.id);
      assert.ok(source.includes(`id="${config.target.slice(1)}"`), `${page}: missing ${config.target}`);
      assert.ok(!['table','tbody','thead','tr'].includes(config.target), 'Do not insert details within table structure');
    }
  }
  const clubs = require('../team-stat-leaders-model').codes;
  assert.equal(Object.keys(clubs).length,15);
  assert.ok(keys.routes['team.html'].some(config => config.type==='teamLeaders'));
  assert.ok(keys.routes['team.html'].some(config => config.type==='dna'));
});

test('mount preserves board contents and does not duplicate keys after data or filter refreshes', () => {
  const f=fixture();const board=f.target('teamLeadersGrid');
  const config=keys.routes['team.html'].find(config => config.type==='teamLeaders');
  keys.mount(f.document,[config]);keys.mount(f.document,[config]);
  assert.equal(board.writes.length,1);
  assert.equal(board.writes[0].position,'beforebegin');
  board.innerHTML='<article>Refreshed leaders</article>';
  keys.mount(f.document,[config]);assert.equal(board.writes.length,1);
});

test('dialog contents and the existing weekly legend can be rebuilt without losing their key', () => {
  const f=fixture('playerpedia.html');const modal=f.target('playerModalBody');
  const config=keys.routes['playerpedia.html'].find(config => config.id==='player-profile');
  keys.mount(f.document,[config]);assert.equal(modal.writes[0].position,'afterbegin');
  modal.innerHTML='<h2>A different player</h2>';
  keys.mount(f.document,[config],{},new Map([['player-profile',true]]));
  assert.equal(modal.writes.length,2);assert.equal(f.nodes.get('dashboard-key-player-profile').open,true);
  const award=f.target('awardLegend'), awardConfig=keys.routes['stat-kitchen.html'][0];
  keys.mount(f.document,[awardConfig]);award.innerHTML='<strong>Old legend from a refresh</strong>';keys.mount(f.document,[awardConfig]);
  assert.equal(award.writes.length,2);assert.equal(award.writes[0].position,'replace');
});

test('late team sections mount automatically and repeated mutations are coalesced', () => {
  const f=fixture();f.target('teamLeadersGrid');keys.start(f.window);
  assert.equal(f.styles.length,1);assert.equal(f.observers.length,1);
  const board=f.target('teamDnaBody');
  f.observers[0].callback();f.observers[0].callback();
  assert.equal(f.timers.length,1);f.flush();assert.equal(board.writes.length,1);
  const keyNode=f.nodes.get('dashboard-key-team-dna');keyNode.open=true;f.events.get('toggle')({target:keyNode});
  f.nodes.delete('dashboard-key-team-dna');
  f.observers[0].callback();f.flush();
  assert.equal(f.nodes.get('dashboard-key-team-dna').open,true);
  keys.start(f.window);assert.equal(f.observers.length,1);assert.equal(f.styles.length,1);
});

test('DOMContentLoaded is respected and pages without dashboards remain unchanged', () => {
  const f=fixture('index.html','loading');const board=f.target('homeStandings');keys.start(f.window);
  assert.equal(board.writes.length,0);f.events.get('DOMContentLoaded')();assert.equal(board.writes.length,1);
  const empty=fixture('about.html');keys.start(empty.window);assert.equal(empty.styles.length,0);assert.equal(empty.events.size,0);
});

test('a static playoff key survives boot without an extra copy or stylesheet', () => {
  const f=fixture('playoff-player-rankings.html');const board=f.target('playoffResults');
  f.nodes.set('dashboard-key-playoff',{id:'dashboard-key-playoff'});f.styles.push({rel:'stylesheet'});
  keys.start(f.window);assert.equal(board.writes.length,0);assert.equal(f.styles.length,1);
});

test('snapshot parsing and escaping cannot inject markup or require an API call', () => {
  const f=fixture();const node=f.target('playoffSnapshot');node.textContent='{broken';
  assert.deepEqual(keys.contextFrom(f.document),{});
  node.textContent=JSON.stringify({minGames:11,minimumMinutes:8});assert.equal(keys.contextFrom(f.document).minGames,11);
  const rendered=keys.render({id:'"><img src=x onerror=alert(1)>',type:'playoff'}, {minGames:'<script>',minimumMinutes:8});
  assert.doesNotMatch(rendered, /<img|<script>/);assert.match(rendered,/&lt;img/);
  assert.doesNotMatch(read('dashboard-keys.js'),/\bfetch\s*\(/);
});

test('the committed playoff key is static, reproducible and based on its embedded snapshot', () => {
  const before=read('playoff-player-rankings.html');
  const staticKey=before.match(/<!-- dashboard-key:start -->([\s\S]*?)<!-- dashboard-key:end -->/)[1];
  assert.equal(staticKey,keys.render(keys.routes['playoff-player-rankings.html'][0],snapshot));
  assert.ok(before.indexOf('dashboard-key-playoff') < before.indexOf('id="playoffTable"'));
  execFileSync(process.execPath,['scripts/build-playoff-board.cjs'],{cwd:root});assert.equal(read('playoff-player-rankings.html'),before);
});

test('public copy polishing leaves symbols and number ranges in keys intact', () => {
  const source=read('site.js');
  const functionSource=source.slice(source.indexOf('function polishPublicCopyTree('),source.indexOf('function runCopyPolish('));
  let accept;const node={nodeValue:'— / A+: 95–99',parentElement:{closest:selector => selector.includes('.w-dashboard-key')}};
  const context={NodeFilter:{SHOW_TEXT:4,FILTER_REJECT:2,FILTER_ACCEPT:1},INTERNAL_PUBLIC_COPY_PATTERNS:[],document:{body:{},createTreeWalker:(root,type,filter) => {
    accept=filter.acceptNode(node);return {nextNode:() => null};
  }}};
  vm.runInNewContext(functionSource+';polishPublicCopyTree();',context);
  assert.equal(accept,2);assert.equal(node.nodeValue,'— / A+: 95–99');
});

test('legend text colors meet normal-text contrast and mobile keys do not require horizontal scrolling', () => {
  function luminance(hex) {return hex.match(/\w\w/g).map(v => parseInt(v,16)/255).map(v => v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
  const background=luminance('faf7ff');
  for(const color of ['271a35','42225f','4e3b60'])assert.ok((background+.05)/(luminance(color)+.05)>=4.5);
  const css=read('dashboard-keys.css');assert.match(css,/@media \(max-width: 700px\)/);assert.match(css,/grid-template-columns: minmax\(0, 1fr\)/);assert.match(css,/min-height: 48px/);assert.match(css,/:focus-visible/);
});
