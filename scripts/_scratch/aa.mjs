import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const p=await b.newPage();await p.setViewport({width:1440,height:900});
await p.goto('file:///Users/iqratahir/Dubizzle-Design-System/design-kit/templates/desktop/portal-ad-agent.html');
console.log(await p.evaluate(()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;const o=[];while((n=w.nextNode()))if(n.nodeValue.trim()==='Assign Agent'){const r=n.parentElement.getBoundingClientRect();const h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);o.push([Math.round(r.x),Math.round(r.y),Math.round(r.width)].join(',')+' hit='+(h&&h.tagName+'.'+h.className).slice(0,50)+' same='+(h&&(h===n.parentElement||n.parentElement.contains(h)||h.contains(n.parentElement))))}return o}));
await b.close();
