import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const p=await b.newPage();await p.setViewport({width:1440,height:900});
await p.goto('file:///Users/iqratahir/Dubizzle-Design-System/design-kit/reference/live/dpv-report-form.desktop.html');await new Promise(r=>setTimeout(r,300));
console.log(await p.evaluate(()=>{const t=document.querySelector('textarea');const o=[];for(let e=t,k=0;k<3;k++,e=e.parentElement){const c=getComputedStyle(e);o.push(`${e.tagName} bg=${c.backgroundColor} b=${c.borderTopWidth} ${c.borderTopColor} bb=${c.borderBottomWidth} ${c.borderBottomColor} r=${c.borderRadius} mb=${c.marginBottom}`)}
const ph=getComputedStyle(t,'::placeholder');o.push('ph '+ph.color);const rl=[...document.querySelectorAll('span')].find(s=>s.textContent.trim()==='Fraud');const row=rl.parentElement;const ic=row.firstElementChild;const cc=getComputedStyle(ic);const ir=ic.getBoundingClientRect();o.push(`radio first child ${ic.tagName} ${Math.round(ir.width)}x${Math.round(ir.height)} b=${cc.borderTopWidth} ${cc.borderTopColor} r=${cc.borderRadius} gap to label ${Math.round(rl.getBoundingClientRect().x-ir.right)} x from row ${Math.round(ir.x-row.getBoundingClientRect().x)}`);
const panel=document.querySelector('h2').parentElement;const pc=getComputedStyle(panel);const pr=panel.getBoundingClientRect();o.push(`panel ${Math.round(pr.width)}x${Math.round(pr.height)} pad=${pc.padding} r=${pc.borderRadius}`);return o.join('\n')}));
await b.close();
