import { connectToSession, ORIGIN } from '../capture-session.mjs';
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const b=await connectToSession();const p=await b.newPage();await p.setViewport({width:1440,height:900});
await p.goto(ORIGIN+'/en/vehicles/cars-for-sale/',{waitUntil:'domcontentloaded'});await sleep(6000);
console.log(await p.evaluate(()=>{const s=document.querySelector('svg:has(> path[d^="M15.71 5"])');let c=s;for(let i=0;i<12&&c;i++){c=c.parentElement;if(c&&/EGP/.test(c.innerText)&&c.innerText.length>60)break}return (c?c.innerText.split('\n').filter(Boolean).slice(0,4).join(' / '):'?')}));
await p.close();await b.disconnect();
