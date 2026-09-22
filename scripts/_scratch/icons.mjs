import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';
const DIR='file:///Users/iqratahir/Dubizzle-Design-System/design-kit/reference/live/';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const p=await b.newPage();await p.setViewport({width:1440,height:900});
for (const [f,labels] of [['portal-ads-actions',['Edit Now','Mark as sold','Deactivate Ad','Assign Agent']],['portal-agents-actions',['Change Ads Ownership','Update Credits','Remove Agent','Unassign Agent Ads']]]){
 await p.goto(DIR+f+'.desktop.html');await new Promise(r=>setTimeout(r,300));
 const out=await p.evaluate((labels)=>labels.map(l=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))if(n.nodeValue.trim()===l){let e=n.parentElement;for(let i=0;i<3;i++){const s=e.querySelector('svg');if(s){const c=s.cloneNode(true);c.removeAttribute('class');c.setAttribute('xmlns','http://www.w3.org/2000/svg');c.querySelectorAll('[class]').forEach(x=>x.removeAttribute('class'));return [l,c.outerHTML,getComputedStyle(s).fill,getComputedStyle(s).color]}e=e.parentElement}}
  const img=null;return [l,null]}),labels);
 for(const [l,svg,fill,color] of out){console.log(f,l,svg?svg.length:'none',fill,color);if(svg)writeFileSync('src/assets/portal/action-'+l.toLowerCase().replace(/[^a-z]+/g,'-').replace(/-$/,'')+'.svg',svg.replace(/currentColor/g,'#23262a')+'\n')}}
await b.close();
