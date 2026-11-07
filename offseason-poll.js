(() => {
  const choices=document.getElementById('lotteryPollChoices');
  const status=document.getElementById('lotteryPollStatus');
  if(!choices||!status)return;
  const teams=['Houston','Toronto','Washington','Seattle','Portland','Los Angeles'];
  const key='wktw-draft-lottery-pick-2027';
  let selected='';
  try{selected=localStorage.getItem(key)||'';}catch{}
  function render(){
    choices.innerHTML=teams.map(team=>'<button type="button" data-team="'+team+'" aria-pressed="'+(team===selected)+'">'+team+'</button>').join('');
    status.textContent=selected?'Your pick is saved on this device: '+selected+'. Change it any time.':'Choose a team. Your pick is saved only in this browser.';
  }
  choices.addEventListener('click',event=>{
    const button=event.target.closest('button[data-team]');
    if(!button)return;
    selected=button.dataset.team;
    try{localStorage.setItem(key,selected);}catch{}
    render();
  });
  render();
})();
