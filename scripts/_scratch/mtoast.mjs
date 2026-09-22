import { connectToSession, ORIGIN } from '../capture-session.mjs';
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const b=await connectToSession();const p=await b.newPage();
await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
await p.goto(ORIGIN+'/en/vehicles/cars-for-sale/',{waitUntil:'domcontentloaded'});await sleep(7000);
const pt=await p.evaluate(()=>{const s=[...document.querySelectorAll('svg')].find(s=>s.querySelector('path[d^="M15.71 5"]'))||[...document.querySelectorAll('[aria-label*="avourite" i]')][0];if(!s)return null;s.scrollIntoView({block:'center'});const r=s.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]});
console.log('heart',pt);if(!pt){await p.close();await b.disconnect();process.exit()}
await sleep(500);const pt2=await p.evaluate(()=>{const s=[...document.querySelectorAll('svg')].find(s=>s.querySelector('path[d^="M15.71 5"]'))||[...document.querySelectorAll('[aria-label*="avourite" i]')][0];const r=s.getBoundingClientRect();window.__b=new Set(document.querySelectorAll('body *'));return [r.x+r.width/2,r.y+r.height/2]});
await p.touchscreen.tap(...pt2);
for(const t of [300,700,1500]){await sleep(t);console.log(t,await p.evaluate(()=>{const f=[...document.querySelectorAll('body *')].filter(e=>!window.__b.has(e)&&e.getBoundingClientRect().height>10);return f.filter(e=>!f.includes(e.parentElement)).slice(0,3).map(e=>{const r=e.getBoundingClientRect();return `${getComputedStyle(e).position} ${[r.x,r.y,r.width,r.height].map(Math.round)} "${(e.innerText||'').slice(0,80).replace(/\n/g,' | ')}"`})}))}
await sleep(1500);await p.touchscreen.tap(...pt2);await sleep(1500);
await p.close();await b.disconnect();
