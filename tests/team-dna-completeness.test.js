const assert=require('node:assert/strict');
const {test}=require('node:test');
const handler=require('../api/team-dna');

const names=['Atlanta Dream','Chicago Sky','Connecticut Sun','Dallas Wings','Golden State Valkyries','Indiana Fever','Las Vegas Aces','Los Angeles Sparks','Minnesota Lynx','New York Liberty','Phoenix Mercury','Portland Fire','Seattle Storm','Toronto Tempo','Washington Mystics'];
const cell=(stat,value)=>`<td data-stat="${stat}">${value}</td>`;
const html=names.map((name,index)=>`<tr>${cell('team',name)}${cell('wins',11+index)}${cell('losses',33-index)}${cell('mov',-9+index)}${cell('off_rtg',99+index)}${cell('def_rtg',110-index)}${cell('pace',79)}</tr>`).join('')+
  names.map((name,index)=>`<tr>${cell('team',name)}${cell('g',44)}${cell('pts',78+index)}${cell('ast',18+index)}${cell('fg3_pct','.334')}${cell('stl',7+index/10)}${cell('blk',3+index/10)}</tr>`).join('');

test('merges per-game team stats and derives opponent scoring for all active teams',async()=>{
  const fetchBefore=global.fetch;
  global.fetch=async url=>{
    if(String(url).includes('basketball-reference.com/wnba/years/2026.html')&&!String(url).includes('r.jina.ai'))return {ok:true,text:async()=>html};
    return {ok:false,status:403};
  };
  try{
    let result;
    await handler({method:'GET',query:{season:2026}},{setHeader(){},status(code){this.code=code;return this;},json(body){result=body;return body;}});
    assert.equal(result.teamCount,15);
    for(const row of result.teams){
      for(const field of ['ppg','oppPpg','threePct','ast','stl','blk'])assert.notEqual(row[field],null,`${row.name} ${field}`);
      assert.equal(row.oppPpg,Number((row.ppg-row.mov).toFixed(2)));
      assert.ok(row.ppgRank>=1&&row.ppgRank<=15);
    }
  }finally{global.fetch=fetchBefore;}
});
