import { connectToSession, ORIGIN } from '../capture-session.mjs';
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const b=await connectToSession();const p=await b.newPage();await p.setViewport({width:1440,height:900});
const CASES=JSON.parse(process.argv[2]);
for (const [url,trigger] of CASES){
 await p.goto(ORIGIN+url,{waitUntil:'domcontentloaded'});await sleep(7000);
 const pt=await p.evaluate((t)=>{let el=null;if(t.at){return t.at}
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))if(n.nodeValue.trim()===t.text&&n.parentElement.getBoundingClientRect().width>0&&!n.parentElement.closest('nav')){el=n.parentElement;break}
  if(!el)for(const e of document.querySelectorAll('[aria-label]'))if(e.getAttribute('aria-label')===t.text){el=e;break}
  if(!el)return null;el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]},trigger);
 if(!pt){console.log(url,trigger,'NOT FOUND');continue}
 await sleep(300);
 const pt2=trigger.at?pt:await p.evaluate((t)=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n,el;while((n=w.nextNode()))if(n.nodeValue.trim()===t.text&&n.parentElement.getBoundingClientRect().width>0&&!n.parentElement.closest('nav')){el=n.parentElement;break}if(!el)for(const e of document.querySelectorAll('[aria-label]'))if(e.getAttribute('aria-label')===t.text){el=e;break}const r=el.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]},trigger);
 await p.evaluate(()=>{window.__b=new Set(document.querySelectorAll('body *'))});
 const u=p.url();
 await p.mouse.click(...pt2);await sleep(2500);
 const r=await p.evaluate(()=>{const fresh=[...document.querySelectorAll('body *')].filter(e=>!window.__b.has(e)&&e.getBoundingClientRect().height>20);const top=fresh.filter(e=>!fresh.includes(e.parentElement));top.sort((a,b)=>b.getBoundingClientRect().height*b.getBoundingClientRect().width-a.getBoundingClientRect().height*a.getBoundingClientRect().width);const t=top[0];if(!t)return 'nothing new';const r=t.getBoundingClientRect();
  const words=(t.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).filter(s=>!/\d{7,}|@/.test(s)).slice(0,6).map(s=>s.slice(0,40));return `${Math.round(r.width)}x${Math.round(r.height)}@${Math.round(r.x)},${Math.round(r.y)} :: ${words.join(' | ')}`});
 console.log((url.replace(/\d{6,}/g,'#')+' ['+(trigger.text||trigger.at)+']').padEnd(60), p.url()!==u?'(URL changed) ':'', r);
 await p.keyboard.press('Escape');await sleep(500);
}
await p.close();await b.disconnect();
