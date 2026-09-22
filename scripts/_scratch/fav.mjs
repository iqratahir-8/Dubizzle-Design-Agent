import { connectToSession, ORIGIN } from '../capture-session.mjs';
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const b=await connectToSession();const p=await b.newPage();await p.setViewport({width:1440,height:900});
await p.goto(ORIGIN+'/en/myfavorites',{waitUntil:'domcontentloaded'});await sleep(6000);
console.log(await p.evaluate(()=>{const t=document.body.innerText;const m=t.match(/(\d+)\s+(ads?|Favourites?)/i);const cards=[...document.querySelectorAll('article, li')].filter(e=>/EGP/.test(e.innerText)).map(e=>e.innerText.split('\n').filter(Boolean).slice(0,3).join(' / ').slice(0,90));return [...new Set(cards)].slice(0,6).join('\n')}));
await p.close();await b.disconnect();
