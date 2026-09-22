import { connectToSession, ORIGIN } from '../capture-session.mjs';
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const b=await connectToSession();const p=await b.newPage();await p.setViewport({width:1440,height:900});
await p.goto(ORIGIN+'/en/ad/mercedes-benz-e300-2018-amg-ID208928385.html',{waitUntil:'domcontentloaded'});await sleep(6000);
const pt=await p.evaluate(()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))if(n.nodeValue.trim()==='See location'){const e=n.parentElement;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();window.__b=new Set(document.querySelectorAll('body *'));return [r.x+r.width/2,r.y+r.height/2]}});
await p.mouse.click(...pt);await sleep(3500);
console.log(await p.evaluate(()=>{const f=[...document.querySelectorAll('body *')].filter(e=>!window.__b.has(e));const t=f.filter(e=>!f.includes(e.parentElement));return t.slice(0,5).map(e=>e.tagName+'.'+(e.className+'').slice(0,60)+' role='+e.getAttribute('role')+' imgs='+e.querySelectorAll('img,canvas,iframe').length+' '+[...e.querySelectorAll('[aria-label]')].map(a=>a.getAttribute('aria-label')).slice(0,6).join(','))}));
await p.close();await b.disconnect();
