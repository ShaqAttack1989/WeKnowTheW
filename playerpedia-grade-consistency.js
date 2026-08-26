(()=>{
  const modal=document.getElementById('playerModalBody');
  const grid=document.getElementById('playerGrid');
  if(!modal)return;

  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const gradeClass=letter=>{const value=String(letter||'NR').toUpperCase();return value==='NR'?'grade-nr':`grade-${value.charAt(0).toLowerCase()}`;};
  let modalTimer=null;
  let gridTimer=null;

  function parsedGrade(section,kind){
    if(!section)return null;
    const badge=section.querySelector('.player-history-grade-badge,.player-grade-badge');
    if(!badge)return null;
    const letter=badge.textContent.trim()||'NR';
    let score='';
    if(kind==='retired')score=section.querySelector('.research-retired-grade b')?.textContent?.trim()||'';
    else score=section.querySelector('.player-history-profile-grade strong')?.textContent?.trim()||'';
    if(!score||score==='—'||letter==='NR')return null;
    return {letter,score};
  }

  function canonicalMarkup(grade,label){
    return `<span class="player-grade-badge ${gradeClass(grade.letter)}">${safe(grade.letter)}</span><span class="player-grade-score">${safe(grade.score)} ${safe(label)}</span>`;
  }

  function placeCanonical(title,grade,label,source){
    if(!title||!grade)return;
    let line=modal.querySelector('.profile-grade-line');
    const sig=`${source}:${grade.letter}:${grade.score}`;
    if(line?.dataset.canonicalGradeSignature===sig)return;
    if(!line){line=document.createElement('div');line.className='profile-grade-line';title.insertAdjacentElement('afterend',line);}
    line.classList.add('profile-grade-canonical');
    line.dataset.canonicalGradeSignature=sig;
    line.dataset.gradeSource=source;
    line.innerHTML=canonicalMarkup(grade,label);
  }

  function removeWrongCurrentGrade(){
    modal.querySelectorAll('.profile-grade-line').forEach(line=>{
      if(line.dataset.gradeSource==='retired'||line.dataset.gradeSource==='recent')return;
      line.remove();
    });
  }

  function syncModal(){
    const title=modal.querySelector('#playerModalTitle');
    if(!title)return;

    const retiredProfile=modal.querySelector('[data-retired-profile]');
    if(retiredProfile){
      const seasonSection=retiredProfile.querySelector('.research-retired-season');
      const grade=parsedGrade(seasonSection,'retired');
      if(!grade){removeWrongCurrentGrade();return;}
      const season=seasonSection.querySelector('.research-retired-kicker')?.textContent?.match(/\b(?:19|20)\d{2}\b/)?.[0]||'Final season';
      placeCanonical(title,grade,`${season} final-season weighted league grade`,'retired');
      return;
    }

    const recentProfile=modal.querySelector('.player-history-profile');
    if(recentProfile){
      const grade=parsedGrade(recentProfile,'recent');
      if(!grade){removeWrongCurrentGrade();return;}
      const season=recentProfile.querySelector('.player-history-profile-head h4')?.textContent?.match(/\b(?:19|20)\d{2}\b/)?.[0]||'Last season';
      placeCanonical(title,grade,`${season} last-active weighted league grade`,'recent');
      return;
    }

    const line=modal.querySelector('.profile-grade-line');
    if(line?.dataset.gradeSource==='retired'||line?.dataset.gradeSource==='recent')line.remove();
  }

  function syncRecentCards(){
    if(!grid)return;
    grid.querySelectorAll('.player-history-card .player-card-grade').forEach(host=>{
      if(host.textContent.includes('last-active grade'))return;
      if(host.dataset.historySignature){
        host.removeAttribute('data-grade-signature');
        const card=host.closest('.player-card');
        card?.dispatchEvent(new CustomEvent('playerpedia-history-resync',{bubbles:true}));
      }
    });
  }

  function scheduleModal(){clearTimeout(modalTimer);modalTimer=setTimeout(syncModal,70);}
  function scheduleGrid(){clearTimeout(gridTimer);gridTimer=setTimeout(syncRecentCards,120);}

  new MutationObserver(scheduleModal).observe(modal,{childList:true,subtree:true});
  if(grid)new MutationObserver(scheduleGrid).observe(grid,{childList:true});
  scheduleModal();
  scheduleGrid();
})();
