const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'fiba-world-cup-final-2026.html'),'utf8');
const css=fs.readFileSync(path.join(root,'fiba-world-cup-final-2026.css'),'utf8');

test('final game dashboards keep core copy and data at a 12 point minimum',()=>{
  assert.match(css,/\.fg-country-context,[\s\S]*\.fg-source-grid span\{font-size:1rem\}/);
  assert.match(html,/\.fg-stat-table td\{font-size:1rem;line-height:1\.45\}/);
  assert.match(html,/\.fg-rec-metric,\.fg-rec-number,\.fg-edge-chip\{font-size:1rem/);
  assert.match(html,/\.fg-rank\{[^}]*font-size:1rem/);
});

test('compact headings may stay smaller without shrinking dashboard content',()=>{
  assert.match(css,/\.fg-history-big span\{font-size:\.75rem;line-height:1\.35\}/);
  assert.match(html,/\.fg-stat-table th,[^}]+font-size:\.75rem!important/);
});

test('larger recommendation text gets room before cards return to three columns',()=>{
  assert.match(html,/@media\(max-width:1100px\)\{\.fg-rec-grid\{grid-template-columns:1fr\}\}/);
  assert.match(html,/fiba-world-cup-final-2026\.css\?v=20260913-final-v4/);
});
