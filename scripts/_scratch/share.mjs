import { connectToSession, ORIGIN } from '../capture-session.mjs';
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const b=await connectToSession();const p=await b.newPage();await p.setViewport({width:1440,height:900});
const ctx=b.defaultBrowserContext();await ctx.overridePermissions(ORIGIN,['clipboard-read','clipboard-write','clipboard-sanitized-write']).catch(()=>{});
await p.goto(ORIGIN+'/en/ad/mercedes-benz-e300-2018-amg-ID208928385.html',{waitUntil:'domcontentloaded'});await sleep(6000);
const box=async(sel)=>p.evaluate((sel)=>{const e=[...document.querySelectorAll('[aria-label],button,span,div')].find(e=>(e.getAttribute('aria-label')===sel||(e.children.length===0&&e.textContent.trim()===sel))&&e.getBoundingClientRect().width>0);if(!e)return null;const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]},sel);
const snap=()=>p.evaluate(()=>{window.__b=new Set(document.querySelectorAll('body *'))});
const fresh=()=>p.evaluate(()=>{const f=[...document.querySelectorAll('body *')].filter(e=>!window.__b.has(e)&&e.getBoundingClientRect().height>10);const t=f.filter(e=>!f.includes(e.parentElement));return t.slice(0,4).map(e=>{const r=e.getBoundingClientRect();return `${getComputedStyle(e).position} ${[r.x,r.y,r.width,r.height].map(Math.round)} "${(e.innerText||'').slice(0,80).replace(/\n/g,' | ')}"`})});
let pt=await box('Share button');console.log('share',pt);await snap();await p.mouse.click(...pt);
for(const t of [300,800,1500]){await sleep(t);console.log(t,await fresh())}
await p.keyboard.press('Escape');await sleep(500);
pt=await box('Gallery');await p.mouse.click(...pt);await sleep(2000);pt=await box('Share');console.log('gallery share',pt);await snap();if(pt){await p.mouse.click(...pt);for(const t of [300,800,1500]){await sleep(t);console.log(t,await fresh())}}
await p.close();await b.disconnect();
