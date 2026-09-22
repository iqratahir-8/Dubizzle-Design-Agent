import { connectToSession, ORIGIN } from '../capture-session.mjs';
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const b=await connectToSession();const p=await b.newPage();await p.setViewport({width:1440,height:900});
await p.goto(ORIGIN+'/en/vehicles/cars-for-sale/',{waitUntil:'domcontentloaded'});await sleep(6000);
const pt=await p.evaluate(()=>{const s=document.querySelector('svg:has(> path[d^="M15.71 5"])');if(!s)return null;s.scrollIntoView({block:'center'});const r=s.getBoundingClientRect();window.__b=new Set(document.querySelectorAll('body *'));return [r.x+r.width/2,r.y+r.height/2]});
console.log('heart',pt);await sleep(400);
const pt2=await p.evaluate(()=>{const s=document.querySelector('svg:has(> path[d^="M15.71 5"])');const r=s.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]});
await p.mouse.click(...pt2);
for(const t of [150,400,900,1600,2600]){await sleep(t===150?150:t-[150,400,900,1600,2600][[150,400,900,1600,2600].indexOf(t)-1]);
 const r=await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>!window.__b.has(e)&&e.getBoundingClientRect().height>0).filter(e=>!window.__b.has(e.parentElement)===false).map(e=>{const c=getComputedStyle(e);const r=e.getBoundingClientRect();return `${e.tagName}.${(e.className+'').slice(0,30)} ${c.position} ${[r.x,r.y,r.width,r.height].map(Math.round)} tf=${c.transform} "${(e.innerText||'').slice(0,60).replace(/\n/g,' | ')}"`}).slice(0,6));
 console.log(t+'ms',r);}
// undo
await sleep(1500);await p.mouse.click(...pt2);await sleep(1500);
await p.close();await b.disconnect();
