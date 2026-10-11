const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('Snack Shak collection loader parses and both collection pages point to it',()=>{
  const loader=read('snack-shak-collections.js');
  assert.doesNotThrow(()=>new Function(loader));
  const food=read('food-for-thought.html');
  const bytes=read('snack-shak-bytes.html');
  assert.match(food,/data-snack-collection="feature"/);
  assert.match(bytes,/data-snack-collection="byte"/);
  assert.match(food,/snack-shak-collections\.js\?v=/);
  assert.match(bytes,/snack-shak-collections\.js\?v=/);
});

test('sitewide primary navigation only points at pages that exist',()=>{
  const site=read('site.js');
  assert.doesNotThrow(()=>new Function(site));
  const refs=[...site.matchAll(/['"`](\/[A-Za-z0-9._/?=&%#-]+\.html(?:\?[^'"`]*)?(?:#[^'"`]*)?)['"`]/g)].map(match=>match[1]);
  const missing=[...new Set(refs)].filter(raw=>{
    const target=raw.split('?')[0].split('#')[0].replace(/^\//,'');
    return target&&!fs.existsSync(path.join(root,target));
  });
  assert.deepEqual(missing,[]);
});

test('Snack Shak subnavigation targets exist',()=>{
  const nav=read('snack-shak-nav.js');
  assert.doesNotThrow(()=>new Function(nav));
  const refs=[...nav.matchAll(/['"`](\/[A-Za-z0-9._/?=&%#-]+\.html(?:\?[^'"`]*)?(?:#[^'"`]*)?)['"`]/g)].map(match=>match[1]);
  const missing=[...new Set(refs)].filter(raw=>{
    const target=raw.split('?')[0].split('#')[0].replace(/^\//,'');
    return target&&!fs.existsSync(path.join(root,target));
  });
  assert.deepEqual(missing,[]);
});
