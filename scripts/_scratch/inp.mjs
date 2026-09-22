import puppeteer from 'puppeteer-core';
const DIR='file:///Users/iqratahir/Dubizzle-Design-System/design-kit/reference/live/';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const p=await b.newPage();await p.setViewport({width:1440,height:900});
for(const f of ['dpv-report-form','portal-ads-more-filters','portal-agents-invite']){await p.goto(DIR+f+'.desktop.html');await new Promise(r=>setTimeout(r,300));
console.log(f,await p.evaluate(()=>[...document.querySelectorAll('input,textarea')].filter(i=>{const r=i.getBoundingClientRect();return r.width>0&&r.y>0&&r.y<900&&i.type!=='checkbox'}).slice(0,4).map(i=>{const c=getComputedStyle(i),pc=getComputedStyle(i.parentElement),r=i.getBoundingClientRect(),pr=i.parentElement.getBoundingClientRect();return `${i.tagName} type=${i.type} ph="${i.placeholder}" ${Math.round(r.width)}x${Math.round(r.height)} b=${c.borderTopWidth} ${c.borderTopColor} r=${c.borderRadius} pad=${c.padding} fs=${c.fontSize} | parent ${Math.round(pr.width)}x${Math.round(pr.height)} b=${pc.borderTopWidth} ${pc.borderTopColor} r=${pc.borderRadius}`})))}
await p.goto(DIR+'dpv-report-form.desktop.html');
console.log(await p.evaluate(()=>{const i=[...document.querySelectorAll('input[type=radio]')][0];let e=i;const o=[];for(let k=0;k<3;k++){const c=getComputedStyle(e),r=e.getBoundingClientRect();o.push(`${e.tagName} ${Math.round(r.width)}x${Math.round(r.height)} b=${c.borderTopWidth} ${c.borderTopColor} r=${c.borderRadius} disp=${c.display} op=${c.opacity}`);e=e.nextElementSibling||e.parentElement}return o.join(' || ')}));
await b.close();
