/* Villa Salvia — behaviour. Vanilla JS, no dependencies. */
(()=>{
'use strict';
const d=document,root=d.documentElement,$=(s,r=d)=>r.querySelector(s),$$=(s,r=d)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(min-width:1024px) and (hover:hover) and (pointer:fine)'),mouse=matchMedia('(hover:hover) and (pointer:fine)');
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ---------- theme (day / evening) ---------- */
const themeBtn=$('.theme-btn'),metaTheme=$('meta[name=theme-color]');
function applyTheme(t){
 if(t==='dark')root.dataset.theme='dark';else root.removeAttribute('data-theme');
 themeBtn.setAttribute('aria-label',t==='dark'?'Switch to day mode':'Switch to evening mode');
 metaTheme.content=t==='dark'?'#121a15':'#687565';
}
applyTheme(root.dataset.theme==='dark'?'dark':'light');
themeBtn.addEventListener('click',()=>{
 const next=root.dataset.theme==='dark'?'light':'dark';
 applyTheme(next);store.set('vs-theme',next);
});

/* ---------- images fade in once loaded ---------- */
function watch(img){
 const ok=()=>img.classList.add('ld');
 if(img.complete&&(img.naturalWidth||img.currentSrc))return ok();
 img.addEventListener('load',ok,{once:true});img.addEventListener('error',ok,{once:true});
}
$$('img').forEach(watch);

/* ---------- reveal on scroll ---------- */
function clean(el,ms,attr){setTimeout(()=>{el.removeAttribute(attr);el.classList.remove('in');},ms);}
function show(el){
 if(el.classList.contains('in'))return;
 const dl=parseFloat(el.style.getPropertyValue('--d'))||0;
 el.classList.add('in');
 if(el.hasAttribute('data-lines'))clean(el,(dl+2.4)*1000,'data-lines');
 else clean(el,(dl+(el.dataset.r==='img'?2.6:1.6))*1000,'data-r');
}
$$('[data-stagger]').forEach(p=>{
 const step=parseFloat(p.dataset.stagger)||.1;
 [...p.children].forEach((c,i)=>{
  if(!c.hasAttribute('data-r'))c.setAttribute('data-r','');
  c.style.setProperty('--d',(i*step).toFixed(2)+'s');
 });
});
let io=null;
if('IntersectionObserver' in window){
 io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting||e.boundingClientRect.top<0){show(e.target);io.unobserve(e.target);}
 }),{rootMargin:'0px 0px -7% 0px',threshold:.01});
}
const observe=el=>io?io.observe(el):show(el);
$$('[data-r],[data-lines]').forEach(observe);

/* ---------- count-up numbers ---------- */
function countUp(el){
 const to=+el.dataset.count,plus=el.hasAttribute('data-plus'),dur=1600,t0=performance.now();
 if(reduce.matches){el.textContent=to+(plus?'+':'');return;}
 (function tick(t){
  const p=clamp((t-t0)/dur,0,1),e=1-Math.pow(1-p,4);
  el.textContent=Math.round(to*e)+(p===1&&plus?'+':'');
  if(p<1)requestAnimationFrame(tick);
 })(t0);
}
if('IntersectionObserver' in window){
 const cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){countUp(e.target);cio.unobserve(e.target);}}),{threshold:.6});
 $$('[data-count]').forEach(el=>cio.observe(el));
}else $$('[data-count]').forEach(countUp);

/* ---------- 3D tilt for dish cards ---------- */
function tilt(el){
 if(!fine.matches||reduce.matches)return;
 el.addEventListener('pointermove',e=>{
  const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  el.style.transform=`rotateY(${(x*10).toFixed(2)}deg) rotateX(${(-y*10).toFixed(2)}deg) translateZ(6px)`;
 });
 el.addEventListener('pointerleave',()=>{el.style.transform='';});
}

/* ---------- menu ---------- */
const dishes={
 signatures:[["Tagliatelle al Tartufo","€28","Fresh ribbon pasta, truffle cream, Parmigiano Reggiano.","photo-1551183053-bf91a1d81141","Signature"],["Risotto al Limone","€26","Carnaroli rice, lemon zest, aged Parmesan, garden herbs.","photo-1473093295043-cdd812d0e601","Seasonal"],["Branzino alla Griglia","€36","Grilled sea bass, seasonal greens, lemon & olive oil.","photo-1510130387422-82bed34b37e9","Lake day"]],
 antipasti:[["Burrata e Pomodori","€18","Creamy burrata, heritage tomatoes, basil, extra virgin olive oil.","photo-1608897013039-887f21d8c804","Fresh"],["Insalata del Giardino","€16","Tender garden leaves, seasonal vegetables, lemon dressing.","photo-1512621776951-a57141f2eefd","Garden"],["Pane della Casa","€9","Warm bread, rosemary olive oil, sea salt.","photo-1509440159596-0249088772ff","Baked daily"]],
 dolci:[["Tiramisù della Villa","€12","Espresso-soaked savoiardi, mascarpone, a dusting of cacao.","photo-1571877227200-a0d98ea607e9","House classic"],["Dolce al Cioccolato","€13","Rich chocolate cake, silky cream, seasonal garnish.","photo-1578985545062-69928b1d9587","Decadent"],["Gelato Artigianale","€10","A seasonal selection of three artisan gelato flavours.","photo-1563805042-7684c019e1cb","Cold & sweet"]]
};
const panel=$('#menu-panel'),tabs=$$('.menu-tab');
let current=null,swapToken=0;
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function render(cat){
 panel.innerHTML=dishes[cat].map((x,i)=>`<article class="dish" data-r style="--d:${(i*.11).toFixed(2)}s"><div class="dish-image media"><span class="tag">${esc(x[4])}</span><img src="https://images.unsplash.com/${x[3]}?auto=format&fit=crop&w=800&q=80" alt="Illustrative photograph of ${esc(x[0])}" loading="lazy" decoding="async"></div><div class="dish-top"><h3>${esc(x[0])}</h3><span class="price">${x[1]}</span></div><p>${esc(x[2])}</p></article>`).join('');
 $$('img',panel).forEach(watch);
 $$('[data-r]',panel).forEach(observe);
 $$('.dish-image',panel).forEach(tilt);
}
function showMenu(cat){
 if(cat===current)return;
 const first=current===null;current=cat;
 tabs.forEach(t=>{const a=t.dataset.category===cat;t.setAttribute('aria-selected',String(a));t.tabIndex=a?0:-1;});
 panel.setAttribute('aria-labelledby','tab-'+cat);
 if(first||reduce.matches){render(cat);return;}
 const token=++swapToken;
 panel.style.minHeight=panel.offsetHeight+'px';
 panel.classList.add('swap');
 setTimeout(()=>{
  if(token!==swapToken)return;
  render(cat);panel.classList.remove('swap');
  setTimeout(()=>{if(token===swapToken)panel.style.minHeight='';},1000);
 },230);
}
tabs.forEach((t,i)=>{
 t.addEventListener('click',()=>showMenu(t.dataset.category));
 t.addEventListener('keydown',e=>{
  let n;if(e.key==='ArrowRight')n=(i+1)%3;if(e.key==='ArrowLeft')n=(i+2)%3;if(e.key==='Home')n=0;if(e.key==='End')n=2;
  if(n!==undefined){e.preventDefault();tabs[n].focus();showMenu(tabs[n].dataset.category);}
 });
});
showMenu('signatures');

/* ---------- navigation ---------- */
const header=$('header'),toggle=$('.mobile-toggle'),links=$('#nav-links');
function setNav(o){links.classList.toggle('open',o);toggle.setAttribute('aria-expanded',String(o));toggle.textContent=o?'✕':'☰';}
toggle.addEventListener('click',()=>setNav(!links.classList.contains('open')));
links.addEventListener('click',e=>{if(e.target.closest('a'))setNav(false);});
d.addEventListener('click',e=>{if(!header.contains(e.target))setNav(false);});
if('IntersectionObserver' in window){
 const navLinks=$$('.links a[href^="#"]:not(.btn)');
 const secIO=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting)navLinks.forEach(a=>a.classList.toggle('cur',a.getAttribute('href')==='#'+e.target.id));
 }),{rootMargin:'-20% 0px -60% 0px'});
 $$('main section[id]').forEach(s=>secIO.observe(s));
}

/* ---------- preloader → hero intro ---------- */
const hero=$('.hero'),heroImg=$('.hero-photo'),heroPx=$('.hero-px'),heroContent=$('.hero-content');
const pre=$('.pre'),preBar=$('.pre-line i'),preCount=$('.pre-count');
let introDone=false;
function startIntro(){
 if(introDone)return;introDone=true;
 root.classList.add('loaded');d.body.classList.remove('lock');
 setTimeout(()=>requestAnimationFrame(()=>hero.classList.add('play')),reduce.matches?0:420);
}
if(reduce.matches||!pre){startIntro();}
else{
 d.body.classList.add('lock');
 const imgReady=new Promise(r=>{if(heroImg.classList.contains('ld'))return r();heroImg.addEventListener('load',r,{once:true});heroImg.addEventListener('error',r,{once:true});});
 const fontsReady=d.fonts&&d.fonts.ready?d.fonts.ready:Promise.resolve();
 let ready=false,shown=0;const t0=performance.now();
 Promise.all([imgReady,fontsReady]).then(()=>{ready=true;});
 setTimeout(()=>{ready=true;},3200);
 (function step(t){
  const target=ready?100:Math.min(88,(t-t0)/22);
  shown+=(target-shown)*.12+(ready?.8:0);
  shown=Math.min(shown,100);
  preBar.style.transform=`scaleX(${(shown/100).toFixed(3)})`;
  preCount.textContent=Math.round(shown)+'%';
  if(shown>=99.5&&t-t0>1100){preCount.textContent='100%';setTimeout(startIntro,260);return;}
  requestAnimationFrame(step);
 })(t0);
}
$('.hero-replay').addEventListener('click',()=>{hero.classList.remove('play');void hero.offsetWidth;hero.classList.add('play');});

/* ---------- fireflies (hero canvas) ---------- */
(function(){
 const cv=$('#fireflies');if(!cv||reduce.matches)return;
 const ctx=cv.getContext('2d');let W=0,H=0,dpr=1,ps=[],run=false,vis=true;
 function size(){
  dpr=Math.min(devicePixelRatio||1,2);W=hero.clientWidth;H=hero.clientHeight;
  cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  const n=W<720?20:44;
  ps=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2.2+.8,vx:(Math.random()-.5)*.25,vy:-(Math.random()*.3+.05),ph:Math.random()*6.28,sp:Math.random()*.02+.008}));
 }
 function loop(){
  if(!run)return;
  ctx.clearRect(0,0,W,H);
  for(const p of ps){
   p.x+=p.vx+Math.sin(p.ph)*.18;p.y+=p.vy;p.ph+=p.sp;
   if(p.y<-10){p.y=H+10;p.x=Math.random()*W;}
   if(p.x<-10)p.x=W+10;if(p.x>W+10)p.x=-10;
   const a=.25+.75*Math.abs(Math.sin(p.ph)),g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*7);
   g.addColorStop(0,`rgba(255,226,150,${(a*.9).toFixed(3)})`);g.addColorStop(.25,`rgba(240,196,110,${(a*.35).toFixed(3)})`);g.addColorStop(1,'rgba(240,196,110,0)');
   ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*7,0,6.283);ctx.fill();
  }
  requestAnimationFrame(loop);
 }
 function sync(){const go=vis&&!d.hidden;if(go&&!run){run=true;requestAnimationFrame(loop);}else if(!go)run=false;}
 size();addEventListener('resize',size,{passive:true});
 d.addEventListener('visibilitychange',sync);
 if('IntersectionObserver' in window)new IntersectionObserver(es=>{vis=es[0].isIntersecting;sync();}).observe(hero);
 sync();
})();

/* ---------- single rAF loop: progress, header, parallax ---------- */
const bar=$('.progress'),totop=$('.totop'),ring=$('.totop .ring');
const pxs=$$('.px').map(el=>({el,wrap:el.parentElement}));
let raf=0,lastY=scrollY,hidden=false,topShown=false,scrolled=false,mx=0,my=0,tx=0,ty=0,lastT=0,heroH=hero.offsetHeight;
function frame(t){
 raf=0;
 const y=scrollY,vh=innerHeight,range=d.documentElement.scrollHeight-vh,pr=range>0?clamp(y/range,0,1):0;
 const rects=reduce.matches?[]:pxs.map(p=>p.wrap.getBoundingClientRect());
 bar.style.transform=`scaleX(${pr.toFixed(4)})`;
 ring.style.strokeDashoffset=(138.2*(1-pr)).toFixed(2);
 const dy=y-lastY;
 if(Math.abs(dy)>4){
  const hide=dy>0&&y>160&&!links.classList.contains('open');
  if(hide!==hidden){hidden=hide;header.classList.toggle('hide',hide);}
  lastY=y;
 }
 if((y>10)!==scrolled){scrolled=y>10;header.classList.toggle('scrolled',scrolled);}
 if((y>vh)!==topShown){topShown=y>vh;totop.classList.toggle('show',topShown);}
 let settling=false;
 if(!reduce.matches){
  if(y<heroH*1.3){
   const p=clamp(y/heroH,0,1),dt=lastT?Math.min(50,t-lastT):16;lastT=t;
   const a=1-Math.exp(-dt/140);mx+=(tx-mx)*a;my+=(ty-my)*a;
   heroPx.style.transform=`translate3d(${(-mx*22).toFixed(2)}px,${(p*(fine.matches?60:22)-my*14).toFixed(2)}px,0)`;
   heroContent.style.transform=fine.matches?`translate3d(${(mx*10).toFixed(2)}px,${(my*6).toFixed(2)}px,0)`:'';
   settling=Math.abs(tx-mx)+Math.abs(ty-my)>.002;
   if(!settling)lastT=0;
  }
  pxs.forEach((p,i)=>{
   const r=rects[i];
   if(r.bottom<-60||r.top>vh+60)return;
   const c=clamp((r.top+r.height/2-vh/2)/(vh/2+r.height/2),-1,1);
   p.el.style.transform=`translate3d(0,${(-c*r.height*.085).toFixed(2)}px,0)`;
  });
 }
 if(settling)raf=requestAnimationFrame(frame);
}
const req=()=>{if(!raf)raf=requestAnimationFrame(frame);};
addEventListener('scroll',req,{passive:true});
addEventListener('resize',()=>{heroH=hero.offsetHeight;req();},{passive:true});
hero.addEventListener('pointermove',e=>{
 if(e.pointerType!=='mouse'||!fine.matches||reduce.matches)return;
 const r=hero.getBoundingClientRect();
 tx=clamp((e.clientX-r.left)/r.width*2-1,-1,1);ty=clamp((e.clientY-r.top)/r.height*2-1,-1,1);req();
},{passive:true});
hero.addEventListener('pointerleave',()=>{tx=ty=0;req();});
totop.addEventListener('click',()=>scrollTo({top:0,behavior:reduce.matches?'auto':'smooth'}));
req();

/* ---------- custom cursor + magnetic buttons ---------- */
if(mouse.matches&&!reduce.matches){
 const dot=$('.cur-dot'),rg=$('.cur-ring');
 let cx=0,cy=0,rx=0,ry=0,on=false;
 addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse')return;
  cx=e.clientX;cy=e.clientY;
  if(!on){on=true;rx=cx;ry=cy;d.body.classList.add('has-cursor');(function f(){rx+=(cx-rx)*.18;ry+=(cy-ry)*.18;dot.style.transform=`translate(${cx}px,${cy}px)`;rg.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(f);})();}
  const t=e.target;
  rg.classList.toggle('view',!!t.closest('[data-view]'));
  rg.classList.toggle('hov',!t.closest('[data-view]')&&!!t.closest('a,button,select,.dish-image'));
 },{passive:true});
 d.addEventListener('pointerleave',()=>d.body.classList.remove('has-cursor'));
 d.addEventListener('pointerenter',()=>{if(on)d.body.classList.add('has-cursor');});
 $$('.mag').forEach(b=>{
  b.addEventListener('pointermove',e=>{
   const r=b.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);
   b.style.transform=`translate(${(x*.18).toFixed(1)}px,${(y*.3).toFixed(1)}px)`;
  });
  b.addEventListener('pointerleave',()=>{b.style.transform='';});
 });
}

/* ---------- modal helper ---------- */
let openModal=null,lastFocus=null;
function openM(m){
 lastFocus=d.activeElement;openModal=m;m.classList.add('open');d.body.classList.add('lock');
 const f=$('[data-close]',m)||m;setTimeout(()=>f.focus(),50);
}
function closeM(){
 if(!openModal)return;
 openModal.classList.remove('open');openModal=null;d.body.classList.remove('lock');
 if(lastFocus&&lastFocus.focus)lastFocus.focus();
}
$$('.modal').forEach(m=>{
 m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-close]'))closeM();});
});
d.addEventListener('keydown',e=>{
 if(e.key==='Escape'){setNav(false);closeM();}
 if(openModal&&openModal.id==='lb'){if(e.key==='ArrowRight')lbGo(1);if(e.key==='ArrowLeft')lbGo(-1);}
 if(e.key==='Tab'&&openModal){
  const f=$$('button,a[href],input,select',openModal).filter(x=>x.offsetParent!==null||x.matches('.x'));
  if(!f.length)return;const a=f[0],z=f[f.length-1];
  if(e.shiftKey&&d.activeElement===a){e.preventDefault();z.focus();}
  else if(!e.shiftKey&&d.activeElement===z){e.preventDefault();a.focus();}
 }
});

/* ---------- lightbox ---------- */
const lb=$('#lb'),lbImg=$('#lb-img'),lbCap=$('#lb-cap');
const figs=$$('.gallery figure');let li=0;
function lbSet(i){
 li=(i+figs.length)%figs.length;
 const im=$('img',figs[li]);
 lbImg.src=im.src.replace(/w=\d+/,'w=2000');lbImg.alt=im.alt;
 lbCap.textContent=$('figcaption',figs[li]).textContent;
}
function lbGo(n){lbSet(li+n);}
figs.forEach((f,i)=>$('.hit',f).addEventListener('click',()=>{lbSet(i);openM(lb);}));
$('.lb-prev').addEventListener('click',e=>{e.stopPropagation();lbGo(-1);});
$('.lb-next').addEventListener('click',e=>{e.stopPropagation();lbGo(1);});
let sx=0;
lb.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;},{passive:true});
lb.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)lbGo(dx<0?1:-1);},{passive:true});

/* ---------- reservation form + ticket (demo) ---------- */
const date=$('#date'),now=new Date(),pad=n=>String(n).padStart(2,'0');
const local=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
date.min=local;date.value=local;$('#year').textContent=now.getFullYear();
date.addEventListener('input',()=>date.setCustomValidity(''));
let lastTicket=null;
$('#reservation-form').addEventListener('submit',e=>{
 e.preventDefault();
 if(date.value<local){date.setCustomValidity('Please choose today or a future date.');date.reportValidity();return;}
 date.setCustomValidity('');
 const f=new FormData(e.target),name=String(f.get('name')).trim(),g=String(f.get('guests')),time=String(f.get('time'));
 const when=new Date(f.get('date')+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let code='VS-';for(let i=0;i<4;i++)code+=A[Math.floor(Math.random()*A.length)];
 $('#t-name').textContent=name;$('#t-date').textContent=when;$('#t-time').textContent=time;
 $('#t-guests').textContent=(g==='7+'?'7+ guests · private dining enquiry':g+(g==='1'?' guest':' guests'));
 $('#t-code').textContent=code;
 lastTicket={date:String(f.get('date')),time,code};
 openM($('#ticket-modal'));
});
$('#ics').addEventListener('click',()=>{
 if(!lastTicket)return;
 const m=lastTicket.time.match(/(\d{2}):(\d{2})/),dt=lastTicket.date.replace(/-/g,''),h=+m[1],mi=m[2];
 const end=pad(h+2)+mi;
 const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Villa Salvia Concept//EN','BEGIN:VEVENT',
  `UID:${lastTicket.code}@villa-salvia.example`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').slice(0,15)}Z`,
  `DTSTART:${dt}T${pad(h)}${mi}00`,`DTEND:${dt}T${end}00`,
  'SUMMARY:Villa Salvia (demo reservation)','DESCRIPTION:Concept restaurant demo ticket '+lastTicket.code+'. No real booking.',
  'LOCATION:Lake Como\\, Italy (fictional)','END:VEVENT','END:VCALENDAR'].join('\r\n');
 const a=d.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='villa-salvia-'+lastTicket.code+'.ics';
 d.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
});

/* ---------- contact demo ---------- */
$('.v6-ig').addEventListener('click',()=>{$('.v6-contact-status').textContent='This is a demo Instagram handle. No external profile has been opened.';});
})();
