import puppeteer from 'puppeteer-core';
const DIR='file:///Users/iqratahir/Dubizzle-Design-System/design-kit/reference/live/';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const p=await b.newPage();await p.setViewport({width:1440,height:900});
const K=['paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopWidth','borderTopColor','borderRadius','backgroundColor','backgroundImage','color','fontSize','fontWeight','lineHeight','gap','boxShadow','marginTop','marginBottom'];
const args=JSON.parse(process.argv[2]);
for(const [f,items] of Object.entries(args)){await p.goto(DIR+f+'.html');await new Promise(r=>setTimeout(r,300));
 const r=await p.evaluate((items,K)=>items.map(([name,text,up,nth])=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n,el=null,k=0;while((n=w.nextNode()))if(n.nodeValue.trim()===text&&n.parentElement.tagName!=='SCRIPT'){const e=n.parentElement;const r=e.getBoundingClientRect();if(r.width>0&&r.y<900&&r.y>-1){const h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);if(h&&(e.contains(h)||h.contains(e))){if(k++===(nth||0)){el=e;break}}}}
 if(!el)return name+': MISSING';for(let i=0;i<(up||0);i++)el=el.parentElement;const cs=getComputedStyle(el);const r=el.getBoundingClientRect();
 const o={x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};for(const k of K){const v=cs[k];if(v&&v!=='0px'&&v!=='normal'&&v!=='none'&&v!=='rgba(0, 0, 0, 0)'&&!(k==='borderTopColor'&&cs.borderTopWidth==='0px'))o[k]=v}const svg=el.querySelector('svg');if(svg){const s=svg.getBoundingClientRect();o.svg=Math.round(s.width)+'x'+Math.round(s.height)+'@'+Math.round(s.x-r.x)}return name+' <'+el.tagName+'> '+JSON.stringify(o)}),items,K);
 console.log('\n# '+f);r.forEach(x=>console.log(x))}
await b.close();
