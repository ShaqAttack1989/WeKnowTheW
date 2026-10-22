(function(){
  const esc=function(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
  const overviewMetrics=[
    ['fieldGoalsPercentage','FG %','pct'],
    ['threePointersPercentage','3PT %','pct'],
    ['pointsInThePaint','Paint points'],
    ['reboundsTotal','Rebounds']
  ];
  const extraMetrics=[
    ['assists','Assists'],['turnoversTotal','Turnovers','low'],['freeThrowsMade','Free throws made'],
    ['pointsFromTurnovers','Points off turnovers'],
    ['pointsSecondChance','Second-chance points'],
    ['steals','Steals'],
    ['blocks','Blocks'],
    ['benchPoints','Bench points']
  ];
  const sortOptions=[
    ['points','Points'],['reboundsTotal','Rebounds'],['assists','Assists'],
    ['steals','Steals'],['blocks','Blocks'],['plusMinusPoints','Plus/minus']
  ];
  const seriesOptions=[
    ['points','Points'],['fieldGoalsPercentage','FG %','pct'],
    ['threePointersPercentage','3PT %','pct'],['pointsInThePaint','Paint points'],
    ['reboundsTotal','Rebounds'],['turnoversTotal','Turnovers'],['benchPoints','Bench points']
  ];
  const fmt=function(value,type){
    if(type==='pct')return (Number(value)*100).toFixed(1)+'%';
    if(type==='low')return String(value);
    return String(value==null?0:value);
  };
  const teamName=function(team){return team==='ATL'?'Atlanta Dream':'Golden State Valkyries'};
  function statCards(game,defs){
    return defs.map(function(def){
      const key=def[0],label=def[1],type=def[2];
      const atl=game.ATL.stats[key]||0,gsv=game.GSV.stats[key]||0,total=atl+gsv||1;
      const a=fmt(atl,type),b=fmt(gsv,type);
      const aria=label+': Atlanta '+a+', Golden State '+b;
      return '<article class="fgd-stat-card" role="group" aria-label="'+esc(aria)+'"><span class="fgd-stat-label">'+esc(label)+'</span><div class="fgd-stat-pair"><span><strong class="fgd-atl">'+a+'</strong><small>ATL</small></span><span><strong class="fgd-gsv">'+b+'</strong><small>GSV</small></span></div><div class="fgd-track" aria-hidden="true"><i style="width:'+Math.max(0,Math.min(100,100*atl/total))+'%"></i></div></article>';
    }).join('');
  }
  function quarters(game){
    return '<div class="fgd-quarter-strip" aria-label="Quarter scores">'+game.ATL.quarters.map(function(points,index){
      return '<article><span>Q'+(index+1)+'</span><strong><em class="fgd-atl">'+points+'</em><i aria-hidden="true">–</i><em class="fgd-gsv">'+game.GSV.quarters[index]+'</em></strong></article>';
    }).join('')+'</div>';
  }
  function scorebar(game){
    return '<div class="fgd-scorebar" aria-live="polite"><div class="fgd-score-team"><span>GOLDEN STATE</span><strong class="fgd-gsv">'+game.GSV.stats.points+'</strong></div><div class="fgd-score-status">FINAL<small>GAME '+game.number+' · '+esc(game.date)+'</small></div><div class="fgd-score-team"><span>ATLANTA</span><strong class="fgd-atl">'+game.ATL.stats.points+'</strong></div></div>';
  }
  function selectControl(label,key,options,current,id){
    return '<label for="'+id+'">'+label+'<select id="'+id+'" data-fgd="'+key+'">'+options.map(function(option){
      return '<option value="'+esc(option[0])+'" '+(String(option[0])===String(current)?'selected':'')+'>'+esc(option[1])+'</option>';
    }).join('')+'</select></label>';
  }
  function playerList(game,team,sort){
    const teams=['ATL','GSV'].filter(function(t){return team==='ALL'||team===t});
    const rows=[];
    teams.forEach(function(t){game[t].players.forEach(function(player){rows.push({team:t,player:player})})});
    rows.sort(function(a,b){return (Number(b.player[sort])||0)-(Number(a.player[sort])||0)||(Number(b.player.points)||0)-(Number(a.player.points)||0)});
    return rows.slice(0,4).map(function(row,index){
      const p=row.player;
      return '<article class="fgd-player-card"><span class="fgd-player-rank">0'+(index+1)+'</span><div class="fgd-player-main"><div class="fgd-player-name"><strong>'+esc(p.name)+'</strong><small>'+esc(row.team)+'</small></div><b class="fgd-player-lead">'+esc(fmt(p[sort],sort==='plusMinusPoints'?'low':''))+'<small>'+esc(sortOptions.find(function(x){return x[0]===sort})[1])+'</small></b><p>'+p.points+' PTS · '+p.reboundsTotal+' REB · '+p.assists+' AST</p></div></article>';
    }).join('');
  }
  function fullBox(game,team,sort){
    return ['ATL','GSV'].filter(function(t){return team==='ALL'||team===t}).map(function(t){
      const rows=game[t].players.slice().sort(function(a,b){return (Number(b[sort])||0)-(Number(a[sort])||0)||(Number(b.points)||0)-(Number(a.points)||0)});
      return '<section class="fgd-team-box"><h5>'+teamName(t)+'</h5><div class="fgd-scroll" tabindex="0" role="region" aria-label="'+t+' full player box score"><table><caption>Game '+game.number+' · sorted by '+esc(sortOptions.find(function(x){return x[0]===sort})[1])+'</caption><thead><tr>'+['Player','MIN','PTS','REB','AST','STL','BLK','TO','FG','3PT','FT','+/−'].map(function(x){return '<th scope="col">'+x+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(p){
        return '<tr><th scope="row">'+esc(p.name)+(p.starter?' <small>STARTER</small>':'')+'</th><td>'+esc(p.minutes)+'</td>'+['points','reboundsTotal','assists','steals','blocks','turnovers'].map(function(k){return '<td>'+p[k]+'</td>'}).join('')+'<td>'+esc(p.fg)+'</td><td>'+esc(p.three)+'</td><td>'+esc(p.ft)+'</td><td>'+(p.plusMinusPoints>0?'+':'')+p.plusMinusPoints+'</td></tr>';
      }).join('')+'</tbody></table></div></section>';
    }).join('');
  }
  function seriesValue(game,team,metric){
    const def=seriesOptions.find(function(option){return option[0]===metric})||seriesOptions[0];
    return fmt(game[team].stats[def[0]],def[2]);
  }
  function seriesCards(games,metric){
    return games.slice().sort(function(a,b){return b.number-a.number}).map(function(game){
      return '<article class="fgd-series-card"><span class="fgd-series-game">GAME '+game.number+'</span><small>'+esc(game.date)+'</small><div class="fgd-series-pair"><b class="fgd-atl">'+seriesValue(game,'ATL',metric)+'<small>ATL</small></b><i aria-hidden="true">·</i><b class="fgd-gsv">'+seriesValue(game,'GSV',metric)+'<small>GSV</small></b></div><p>Final: '+game.ATL.stats.points+'–'+game.GSV.stats.points+'</p></article>';
    }).join('');
  }
  async function init(){
    const article=document.querySelector('.snack-post');
    const slug=new URLSearchParams(location.search).get('post')||'';
    if(!article||slug.indexOf('the-playoff-watch-party-2026')===-1)return;
    let mount=article.querySelector('#finals-game-dashboard')||article.querySelector('.finals-game-dashboard');
    if(!mount){
      mount=document.createElement('section');
      mount.className='finals-game-dashboard snack-section';
      mount.id='finals-game-dashboard';
      mount.setAttribute('aria-label','Finals game statistics dashboard');
      const anchors=article.querySelectorAll('.playoff-game-one');
      const anchor=anchors[anchors.length-1];
      if(anchor)anchor.after(mount);else article.append(mount);
    }
    if(mount.dataset.loaded==='true'||mount.dataset.loading==='true')return;
    mount.dataset.loading='true';
    try{
      const response=await fetch('/finals-game-dashboard.json?v=20261022-compact-finals-dashboard-v3');
      if(!response.ok)throw Error('Dashboard data unavailable');
      const data=await response.json();
      let gameNumber=data.games[data.games.length-1].number;
      let team='ALL',sort='points',view='overview',seriesMetric='points';
      function render(){
        const game=data.games.find(function(item){return item.number===gameNumber})||data.games[data.games.length-1];
        const tabs=[['overview','Overview'],['players','Players'],['series','Series']];
        const tabMarkup=tabs.map(function(tab){
          return '<button class="fgd-tab" type="button" role="tab" id="fgd-tab-'+tab[0]+'" aria-controls="fgd-panel-'+tab[0]+'" aria-selected="'+(view===tab[0])+'" tabindex="'+(view===tab[0]?'0':'-1')+'" data-fgd-tab="'+tab[0]+'">'+tab[1]+'</button>';
        }).join('');
        const gameOptions=data.games.slice().sort(function(a,b){return b.number-a.number}).map(function(item){
          return [item.number,'Game '+item.number+' · '+item.date];
        });
        function gameControl(id){return '<div class="fgd-game-control">'+selectControl('Final game','game',gameOptions,gameNumber,id)+'</div>'}
        const overviewPanel='<div class="fgd-panel" id="fgd-panel-overview" role="tabpanel" aria-labelledby="fgd-tab-overview" '+(view==='overview'?'':'hidden')+'>'+gameControl('fgd-overview-game')+scorebar(game)+'<h4 class="fgd-section-title">Quarter scores <small>ATL · GSV</small></h4>'+quarters(game)+'<h4 class="fgd-section-title">Team comparison <small>ATL in red · GSV in violet</small></h4><div class="fgd-stat-grid">'+statCards(game,overviewMetrics)+'</div><details class="fgd-details fgd-extra-stats"><summary>More team stats</summary><div class="fgd-stat-grid">'+statCards(game,extraMetrics)+'</div></details></div>';
        const playerControls='<div class="fgd-controls">'+gameControl('fgd-player-game')+selectControl('Player team','team',[['ALL','Both teams'],['ATL','Atlanta'],['GSV','Golden State']],team,'fgd-team-select')+selectControl('Rank by','sort',sortOptions,sort,'fgd-sort-select')+'</div>';
        const visibleCount=(team==='ALL'||team==='ATL'?game.ATL.players.length:0)+(team==='ALL'||team==='GSV'?game.GSV.players.length:0);
        const playerPanel='<div class="fgd-panel" id="fgd-panel-players" role="tabpanel" aria-labelledby="fgd-tab-players" '+(view==='players'?'':'hidden')+'>'+playerControls+'<p class="fgd-panel-note">Top four players by '+esc(sortOptions.find(function(x){return x[0]===sort})[1])+'.</p><div class="fgd-player-leaders">'+playerList(game,team,sort)+'</div><details class="fgd-details fgd-full-box"><summary>Full player box scores · '+visibleCount+' players</summary>'+fullBox(game,team,sort)+'<p class="fgd-note">MIN: minutes · PTS: points · REB: rebounds · AST: assists · STL: steals · BLK: blocks · TO: turnovers. FG / 3PT / FT are made–attempted; +/− is the on-court scoring margin.</p></details></div>';
        const seriesPanel='<div class="fgd-panel" id="fgd-panel-series" role="tabpanel" aria-labelledby="fgd-tab-series" '+(view==='series'?'':'hidden')+'><div class="fgd-series-control">'+selectControl('Compare across games','seriesMetric',seriesOptions,seriesMetric,'fgd-series-select')+'</div><div class="fgd-series-grid">'+seriesCards(data.games,seriesMetric)+'</div><p class="fgd-note">Official WNBA final box scores. Latest game first.</p></div>';
        mount.innerHTML='<header class="fgd-header"><p class="fgd-kicker">THE FINALS · INSIDE THE BOX SCORE</p><h3>Game '+game.number+' dashboard</h3></header><div class="fgd-tabs" role="tablist" aria-label="Finals dashboard views">'+tabMarkup+'</div>'+overviewPanel+playerPanel+seriesPanel;
        mount.dataset.activeView=view;
      }
      mount.addEventListener('click',function(event){
        const tab=event.target.closest('[data-fgd-tab]');
        if(!tab)return;
        view=tab.dataset.fgdTab;
        render();
        mount.querySelector('[data-fgd-tab="'+view+'"]').focus();
      });
      mount.addEventListener('keydown',function(event){
        const tab=event.target.closest('[data-fgd-tab]');
        if(!tab)return;
        const views=['overview','players','series'];
        let index=views.indexOf(view);
        if(event.key==='ArrowRight')index=(index+1)%views.length;
        else if(event.key==='ArrowLeft')index=(index+views.length-1)%views.length;
        else if(event.key==='Home')index=0;
        else if(event.key==='End')index=views.length-1;
        else return;
        event.preventDefault();
        view=views[index];
        render();
        mount.querySelector('[data-fgd-tab="'+view+'"]').focus();
      });
      mount.addEventListener('change',function(event){
        const key=event.target.dataset.fgd,focusId=event.target.id;
        if(key==='game')gameNumber=Number(event.target.value);
        else if(key==='team')team=event.target.value;
        else if(key==='sort')sort=event.target.value;
        else if(key==='seriesMetric')seriesMetric=event.target.value;
        else return;
        render();
        const next=focusId?document.getElementById(focusId):mount.querySelector('[data-fgd="'+key+'"]');
        if(next)next.focus();
      });
      render();
      mount.dataset.loaded='true';
      delete mount.dataset.loading;
    }catch(error){
      mount.innerHTML='<h3>Finals game statistics</h3><p>The statistics board is reconnecting. <a href="https://www.wnba.com/game/gsv-vs-atl-1042600303/box-score">Open the official Game 3 final box score ↗</a></p>';
      mount.dataset.loaded='true';
      delete mount.dataset.loading;
    }
  }
  new MutationObserver(function(){init()}).observe(document.body,{childList:true,subtree:true});
  init();
})();