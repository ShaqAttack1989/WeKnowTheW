(()=>{
  const nativeFetch=window.fetch.bind(window);
  const cleanText=value=>String(value??'')
    .replace(/\s*No AI[- ]generated player imagery is used(?: on this page| in this edition)?\.?/gi,'')
    .replace(/\s*No AI imagery is used in this edition\.?/gi,'')
    .replace(/\s*No synthetic player portraits\.?/gi,'')
    .replace(/\s*with no AI[- ]generated player imagery\.?/gi,'')
    .replace(/\bReal roster photo of\b/gi,'Player photo of')
    .replace(/\bReal player photography\b/gi,'Player photography')
    .replace(/\bReal player photos\b/gi,'Player photos');

  const scrub=value=>{
    if(typeof value==='string')return cleanText(value);
    if(Array.isArray(value))return value.map(scrub);
    if(value&&typeof value==='object'){
      const next={};
      for(const [key,item] of Object.entries(value))next[key]=scrub(item);
      return next;
    }
    return value;
  };

  function cleanPost(post={}){
    let next=scrub(post);
    if(Array.isArray(next.sections)){
      next.sections=next.sections.filter(section=>!/^real players only$/i.test(String(section?.title||'').trim()));
    }
    if(next.slug==='welcome-back-to-the-w-september-17-2026'){
      next.storyImageCaption='Jackie Young returns from World Cup play as the WNBA schedule resumes September 17.';
    }
    if(next.slug==='shaks-all-fiba-starting-five-bench-mob-2026'){
      next.storyImageCaption='Jackie Young headlines Shak’s All FIBA rotation after USA’s World Cup title.';
    }
    if(next.slug==='we-know-the-w-2026-mock-awards'){
      next.imageAlt=`We Know the W 2026 mock WNBA awards board with A'ja Wilson as MVP and Defensive Player of the Year, Olivia Miles as Rookie of the Year, Megan DiLeo as Most Improved Player, Janelle Salaün as Sixth Player of the Year, Natalie Nakase as Coach of the Year, and an All-WNBA First Team of Wilson, Miles, Breanna Stewart, Jackie Young and Kelsey Mitchell`;
      next.storyImageCaption='Updated We Know the W mock ballot using W Composite grades through September 16, 2026. This is an editorial exercise, not the official WNBA awards ballot.';
    }
    return next;
  }

  window.fetch=async function(input,init){
    const response=await nativeFetch(input,init);
    if(!response.ok)return response;
    try{
      const raw=typeof input==='string'?input:input?.url||String(input||'');
      const url=new URL(raw,location.href);
      if(url.origin!==location.origin||!/^\/snack-sha[kkq].*\.json$/i.test(url.pathname))return response;
      const payload=await response.clone().json();
      if(!Array.isArray(payload?.posts))return response;
      payload.posts=payload.posts.map(cleanPost);
      const headers=new Headers(response.headers);
      headers.delete('content-length');
      headers.delete('content-encoding');
      headers.set('content-type','application/json; charset=utf-8');
      return new Response(JSON.stringify(payload),{status:response.status,statusText:response.statusText,headers});
    }catch{return response;}
  };

  function cleanElement(root){
    if(!root||root.nodeType!==1)return;
    const elements=[root,...root.querySelectorAll('*')];
    for(const el of elements){
      for(const attr of ['alt','title','aria-label']){
        if(!el.hasAttribute?.(attr))continue;
        const before=el.getAttribute(attr)||'';
        const after=cleanText(before);
        if(after!==before)el.setAttribute(attr,after);
      }
    }
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      const before=node.nodeValue||'';
      const after=cleanText(before);
      if(after!==before)node.nodeValue=after;
    }
  }

  const run=()=>cleanElement(document.body);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType===1)cleanElement(node);
      }
    }
  });
  const startObserver=()=>document.body&&observer.observe(document.body,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startObserver,{once:true});else startObserver();
})();