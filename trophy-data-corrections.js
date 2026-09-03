(()=>{
  const data=window.TROPHY_DATA;
  if(!data||!Array.isArray(data.champions))return;
  const row=data.champions.find(item=>Number(item.year)===2025);
  if(row){
    row.champion='Las Vegas Aces';
    row.runnerUp='Phoenix Mercury';
    row.result='4 to 0';
    row.finalsMvp="A'ja Wilson";
  }
})();
