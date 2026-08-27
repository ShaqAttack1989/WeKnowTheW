const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const valid = {name:'Reader',email:'reader@example.com',page:'https://www.weknowthew.com/team.html?team=chicago-sky',category:'Other',message:'This is a local test report, not a live email.',_honey:''};
const jsonResponse = (body, ok = true) => ({ok, json: async () => body});
function server(fetchImpl, timers = {}) {
  const context = {module:{exports:{}},require,Buffer,URL,AbortController,setTimeout,clearTimeout,fetch:fetchImpl,...timers};
  vm.runInNewContext(fs.readFileSync(path.join(root,'api/report-a-problem.js'),'utf8'),context);
  return async (overrides = {}) => {
    const req = {method:'POST',headers:{origin:'https://www.weknowthew.com','content-type':'application/json','x-forwarded-for':'127.0.0.1'},body:{...valid},...overrides};
    const res = {headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(body){this.body=body;return this;}};
    await context.module.exports(req,res);return res;
  };
}

test('rejects invalid methods, origins, fields, links, and spam without contacting provider', async () => {
  let sends=0;const invoke=server(async()=>{sends++;return jsonResponse({success:true});});
  const cases=[{method:'GET'},{headers:{origin:'https://elsewhere.example','content-type':'application/json'}},{headers:{origin:'https://www.weknowthew.com','content-type':'text/plain'}},{body:'{'},{body:{...valid,message:'short'}},{body:{...valid,email:'bad email'}},{body:{...valid,_honey:'bot'}},{body:{...valid,page:'https://example.com/'}},{body:{...valid,message:['invalid']}},{body:{...valid,message:'x'.repeat(6001)}}];
  for(const req of cases){const r=await invoke(req);assert.ok(r.code>=400);}
  assert.equal(sends,0);
});
test('fixed recipient and fields prevent arbitrary email routing', async () => {
  let sent;const invoke=server(async(url,options)=>{sent={url,options};return jsonResponse({success:'true',message:'Form submitted successfully'});});
  const r=await invoke({body:{...valid,to:'other@example.com',_cc:'other@example.com',_webhook:'https://example.com/',_subject:'Injected'}});
  assert.equal(r.body.status,'accepted');assert.equal(sent.url,'https://formsubmit.co/ajax/books@adventuresinzen.com');
  const data=JSON.parse(sent.options.body);assert.equal(data._cc,undefined);assert.equal(data.to,undefined);assert.equal(data._webhook,undefined);assert.equal(data._subject,'We Know the W · Problem report');assert.equal(data.email,valid.email);
});
test('activation responses are not treated as completed reports',async()=>{
  for(const success of [true,false]){
    const r=await server(async()=>jsonResponse({success,message:'Please activate your form by checking your inbox'}))();
    assert.equal(r.code,202);assert.equal(r.body.status,'activation_required');
  }
});
test('false success flags, HTTP failure, and malformed responses never become acceptance', async()=>{
  for(const response of [jsonResponse({success:'false'}),jsonResponse({success:true},false),jsonResponse({}),{ok:true,json:async()=>{throw new Error('HTML instead of JSON');}}]){
    const r=await server(async()=>response)();assert.ok(r.code>=500);assert.equal(r.body.status,'error');
  }
});
test('provider timeout returns an explicit uncertain status without a retry',async()=>{
  let calls=0;
  const invoke=server(async(url,options)=>{calls++;return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('timeout'))));},{setTimeout:fn=>setTimeout(fn,0)});
  const r=await invoke();assert.equal(calls,1);assert.equal(r.code,503);assert.match(r.body.message,/could not confirm/);
});
test('basic per-instance throttling stops repeated sends',async()=>{
  let calls=0;const invoke=server(async()=>{calls++;return jsonResponse({success:true});});
  for(let i=0;i<5;i++)assert.equal((await invoke()).code,200);
  const r=await invoke();assert.equal(r.code,429);assert.equal(r.headers['Retry-After'],'900');assert.equal(calls,5);
});

function client(fetchImpl, extra = {}) {
  const nodes = {};
  for (const id of ['problem-report-form','report-page','report-status','report-submit','report-email-fallback','report-copy','report-copy-status','report-manual-copy']) {
    nodes[id]={value:'',hidden:true,dataset:{},handlers:{},addEventListener(name,fn){this.handlers[name]=fn;},setAttribute(k,v){this[k]=v;},reportValidity(){return true;},focus(){},select(){}};
  }
  const form=nodes['problem-report-form'];form.fields={...valid};nodes['report-page'].value=valid.page;
  class Data {constructor(){return Object.entries({...form.fields,page:nodes['report-page'].value});}}
  const ctx={URL,URLSearchParams,AbortController,setTimeout,clearTimeout,FormData:Data,navigator:{},fetch:fetchImpl,
    location:{origin:'https://www.weknowthew.com',search:''},document:{referrer:'',getElementById:id=>nodes[id]},...extra};
  vm.runInNewContext(fs.readFileSync(path.join(root,'report-a-problem.js'),'utf8'),ctx);
  let prevented=0;
  return {nodes,ctx,submit:()=>form.handlers.submit({preventDefault(){prevented++;}}),prevented:()=>prevented};
}

test('browser submits to own API once and does not clear report or navigate',async()=>{
  let resolve,calls=0,endpoint;
  const c=client(async url=>{calls++;endpoint=url;return new Promise(r=>{resolve=r;});});
  const pending=c.submit();assert.equal(c.nodes['report-submit'].disabled,true);
  await c.submit();assert.equal(calls,1);
  resolve(jsonResponse({status:'accepted',message:'Accepted for email processing'}));await pending;
  assert.equal(endpoint,'/api/report-a-problem');assert.equal(c.prevented(),2);
  assert.equal(c.nodes['report-status'].dataset.state,'success');assert.equal(c.nodes['report-submit'].disabled,false);
  assert.equal(c.nodes['problem-report-form'].fields.message,valid.message);
});
test('browser errors and activation warnings retain input and restore the submit button',async()=>{
  for(const response of [jsonResponse({status:'activation_required',message:'Awaiting confirmation'}),jsonResponse({status:'error',message:'Unavailable'},false)]){
    const c=client(async()=>response);await c.submit();assert.equal(c.nodes['report-status'].dataset.state,'error');assert.equal(c.nodes['report-submit'].disabled,false);assert.equal(c.nodes['problem-report-form'].fields.message,valid.message);
  }
});
test('browser timeout stays on-page and offers a report-filled email fallback',async()=>{
  const c=client(async(url,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('timeout')))),{setTimeout:fn=>setTimeout(fn,0)});
  await c.submit();assert.equal(c.nodes['report-status'].dataset.state,'error');assert.match(c.nodes['report-status'].textContent,/could not confirm/);assert.equal(c.nodes['report-submit'].disabled,false);
  assert.ok(decodeURIComponent(c.nodes['report-email-fallback'].href).includes(valid.message));
  await c.nodes['report-copy'].handlers.click();assert.equal(c.nodes['report-manual-copy'].hidden,false);assert.ok(c.nodes['report-manual-copy'].value.includes(valid.message));
});
test('referring page retains team selection but strips unrelated query values',()=>{
  const page='https://www.weknowthew.com/team.html?team=chicago-sky&token=private#roster';
  const c=client(async()=>jsonResponse({}),{location:{origin:'https://www.weknowthew.com',search:'?page='+encodeURIComponent(page)}});
  assert.equal(c.nodes['report-page'].value,'https://www.weknowthew.com/team.html?team=chicago-sky#roster');
});
test('markup does not post to an external page and has accessible fallback controls',()=>{
  const html=fs.readFileSync(path.join(root,'report-a-problem.html'),'utf8');
  assert.match(html,/action="\/api\/report-a-problem"/);assert.doesNotMatch(html,/action="https:\/\/formsubmit/);assert.match(html,/id="report-status"[^>]*role="status"/);assert.match(html,/<noscript>/);
});
