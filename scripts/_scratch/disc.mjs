import { connectToSession, ORIGIN } from '../capture-session.mjs';
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const b=await connectToSession();const p=await b.newPage();await p.setViewport({width:1440,height:900});
for (const url of process.argv.slice(2)){
await p.goto(ORIGIN+url,{waitUntil:'domcontentloaded'});await sleep(7000);
const r=await p.evaluate(()=>{const seen=new Set();return [...document.querySelectorAll('button,[role=button],[aria-haspopup],a[href="#"],div[class]')].filter(e=>{const c=getComputedStyle(e);return (e.tagName==='BUTTON'||e.getAttribute('role')==='button'||c.cursor==='pointer')&&e.getBoundingClientRect().width>0&&!e.closest('nav')&&!e.closest('a[href^="/"]')}).map(e=>{const t=(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ').slice(0,40);return t}).filter(t=>t&&!/\d{6,}|@/.test(t)&&!seen.has(t)&&seen.add(t))});
console.log('\n'+url.replace(/\d{6,}/g,'#')+'\n  '+r.join(' · '));}
await p.close();await b.disconnect();
