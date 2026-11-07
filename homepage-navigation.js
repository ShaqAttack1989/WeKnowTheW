(()=>{
  const roots=document.querySelectorAll('[data-home-directory]');
  roots.forEach(root=>{
    const tabs=[...root.querySelectorAll('[role="tab"]')];
    const panels=[...root.querySelectorAll('[role="tabpanel"]')];
    if(!tabs.length||!panels.length)return;
    const activate=(tab,focus=false)=>{
      tabs.forEach(item=>{
        const selected=item===tab;
        item.setAttribute('aria-selected',String(selected));
        item.tabIndex=selected?0:-1;
      });
      panels.forEach(panel=>{panel.hidden=panel.id!==tab.getAttribute('aria-controls');});
      if(focus)tab.focus();
    };
    tabs.forEach((tab,index)=>{
      tab.addEventListener('click',()=>activate(tab));
      tab.addEventListener('keydown',event=>{
        let next=index;
        if(event.key==='ArrowRight')next=(index+1)%tabs.length;
        else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
        else if(event.key==='Home')next=0;
        else if(event.key==='End')next=tabs.length-1;
        else return;
        event.preventDefault();activate(tabs[next],true);
      });
    });
  });
})();
