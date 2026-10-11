'use strict';
import { boundedProgress,cameraState,journeyProgress,readingRange } from './camera.mjs';
import { createLandscape } from './landscape.mjs';
import { actorLayout,keyboardVisible,spriteFootOffset,spriteClipLeft } from './layout.mjs';
import { advancePlayback,timelineValue,timelineScroll } from './journey.mjs';
document.documentElement.classList.add('js');
const $=s=>document.querySelector(s);
const demo=document.body.dataset.demo==='true';
const safeGet=k=>{try{return localStorage.getItem(k);}catch{return null;}};
const safeSet=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=safeGet('motion')===null?preference.matches:safeGet('motion')==='reduce';
function setMotion(){document.body.classList.toggle('reduced',reduced);$('#motion').setAttribute('aria-pressed',String(reduced));$('#motion').textContent=reduced?'Chuyển động nhẹ · Bật lại':'Giảm chuyển động';drawSky(performance.now());}
$('#motion').onclick=()=>{reduced=!reduced;safeSet('motion',reduced?'reduce':'full');setMotion();cancelAnimationFrame(frame);if(!reduced)frame=requestAnimationFrame(loop);};
preference.addEventListener('change',e=>{if(safeGet('motion')===null){reduced=e.matches;setMotion();}});
let mode='day';$('#theme').value=safeGet('theme')||'auto';
function setTheme(){const hour=new Date().getHours(),choice=$('#theme').value;mode=choice==='auto'?(hour>=6&&hour<16?'day':hour>=16&&hour<19?'dusk':'night'):choice;document.body.dataset.theme=mode;document.querySelector('meta[name=theme-color]').content=getComputedStyle(document.body).getPropertyValue('--bg').trim()||'#f7eee2';drawSky(performance.now());document.dispatchEvent(new Event('palettechange'));}
$('#theme').onchange=()=>{safeSet('theme',$('#theme').value);setTheme();};setInterval(setTheme,60000);
const canvas=$('#sky'),ctx=canvas.getContext('2d');let w=0,h=0,particles=[],frame;
function resizeSky(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx?.setTransform(d,0,0,d,0,0);particles=Array.from({length:w<700?45:100},(_,i)=>({x:Math.random()*w,y:Math.random()*h,r:.35+Math.random()*1.35,s:Math.random()*6.28,speed:.2+Math.random()*.6,glint:i%7===0}));drawSky(performance.now());}
function drawSky(t){
 if(!ctx)return;
 ctx.clearRect(0,0,w,h);
 const night=mode==='night',dusk=mode==='dusk';
 const tint=night?'205,225,255':dusk?'231,151,102':'230,181,94';
 // Shafts share the upper-right light source used by the stationery shadows.
 // Their slow luminance change keeps the central reading area calm.
 if(!night){
  const breath=reduced?.8:.8+Math.sin(t*.00018)*.2;
  for(const [edge,width,strength] of [[.81,.045,.095],[.94,.09,.055],[1.08,.16,.035]]){
   const ray=ctx.createLinearGradient(w*edge,0,w*(edge-.52),h);
   ray.addColorStop(0,`rgba(${tint},${strength*breath})`);
   ray.addColorStop(.55,`rgba(${tint},${strength*.35*breath})`);
   ray.addColorStop(1,`rgba(${tint},0)`);
   ctx.fillStyle=ray;ctx.beginPath();ctx.moveTo(w*edge,0);
   ctx.lineTo(w*(edge+width),0);ctx.lineTo(w*(edge-.42+width),h);
   ctx.lineTo(w*(edge-.58),h);ctx.closePath();ctx.fill();
  }
 }
 for(const p of particles){
  const phase=reduced?.65:(Math.sin(t*.0006*p.speed+p.s)+1)/2;
  const y=night||reduced?p.y:((p.y-t*.006*p.speed)%h+h)%h;
  // Suppress highlights over the text column; retain bright points at the edges.
  const quiet=p.x>w*.08&&p.x<w*.51&&y>h*.16&&y<h*.8;
  const a=((night?.22:.1)+phase*(night?.64:.3))*(quiet?.45:1);
  if(p.glint){
   const radius=p.r*(night?7:5);
   const halo=ctx.createRadialGradient(p.x,y,0,p.x,y,radius);
   halo.addColorStop(0,`rgba(${tint},${a*.4})`);
   halo.addColorStop(.25,`rgba(${tint},${a*.12})`);
   halo.addColorStop(1,`rgba(${tint},0)`);
   ctx.fillStyle=halo;ctx.fillRect(p.x-radius,y-radius,radius*2,radius*2);
   const length=p.r*(night?4:2.8),spark=phase*phase;
   ctx.strokeStyle=`rgba(${tint},${a*spark*.6})`;ctx.lineWidth=.65;
   ctx.beginPath();ctx.moveTo(p.x-length,y);ctx.lineTo(p.x+length,y);
   ctx.moveTo(p.x,y-length*1.4);ctx.lineTo(p.x,y+length*1.4);ctx.stroke();
  }
  ctx.beginPath();ctx.fillStyle=`rgba(${night?'244,248,255':tint},${a})`;
  ctx.arc(p.x,y,p.glint?p.r*.75:p.r*.55,0,Math.PI*2);ctx.fill();
 }
}
function loop(t){if(reduced)return;drawSky(t);frame=requestAnimationFrame(loop);}document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);if(!document.hidden)frame=requestAnimationFrame(loop);});window.addEventListener('resize',resizeSky);resizeSky();setTheme();setMotion();frame=requestAnimationFrame(loop);
const intro=$('#intro');let opening=false;
function closeIntro(animate){if(opening)return;opening=true;$('#open').disabled=true;intro.classList.toggle('opening',animate&&!reduced);const finish=()=>{intro.classList.add('gone');intro.inert=true;document.body.classList.remove('intro-open');document.querySelectorAll('header,#film,.film-controls,.bottom-nav').forEach(el=>el.inert=false);if(document.activeElement?.closest('#intro'))$('#arrival').focus({preventScroll:true});safeSet('opened-cinema','1');document.dispatchEvent(new Event('invitationopen'));document.querySelectorAll('.hero .reveal').forEach(el=>el.classList.add('visible'));};if(animate&&!reduced)setTimeout(finish,2600);else finish();}
if(safeGet('opened-cinema')==='1'||location.hash)closeIntro(false);else document.body.classList.add('intro-open');$('#open').onclick=()=>closeIntro(true);$('#skip').onclick=()=>closeIntro(false);
if(document.body.classList.contains('intro-open')){document.querySelectorAll('header,#film,.film-controls,.bottom-nav').forEach(el=>el.inert=true);$('#open').focus({preventScroll:true});}
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
let memories=[],index=0,busy=false;
fetch('/api/content').then(r=>{if(!r.ok)throw Error();return r.json();}).then(config=>{memories=config.memories;renderMemory();renderContent(config);}).catch(()=>{memories=['hero-dawn','memory-rings','memory-night'].map((name,n)=>({src:`/assets/${name}.webp`,alt:'Tranh màu nước minh họa lễ cưới',caption:['Một khởi đầu dịu dàng','Chọn một người, cùng một đời','Cùng nhau, qua mọi sắc trời'][n],placeholder:true}));renderMemory();});
function renderContent(config){
 if(config.couple){const c=config.couple,h=$('.hero h1');h.replaceChildren(document.createTextNode(c.shortGroom+' '));const em=document.createElement('em');em.textContent='&';h.append(em,document.createElement('br'),document.createTextNode(c.shortBride));$('.fullnames').textContent=c.groom+' & '+c.bride;$('.signature').textContent=c.shortGroom+' & '+c.shortBride;document.title=c.shortGroom+' & '+c.shortBride+' · '+config.date.split('-').reverse().join('.');}
 if(config.date)$('.hero .date').textContent=config.date.split('-').reverse().join(' · ');
 if(config.invitation)$('.tagline').textContent=config.invitation;
 if(config.events){const area=$('#event-cards');area.replaceChildren();for(const event of config.events){const card=document.createElement('article');card.className='event-card';const title=document.createElement('p');title.className='eyebrow';title.textContent=event.title;const date=document.createElement('div');date.className='event-date';date.textContent=event.date.split('-').reverse().join('.');date.classList.add('compact-date');const time=document.createElement('p');time.textContent=event.time?'Giờ tổ chức: '+event.time+' · Việt Nam':'Giờ tổ chức sẽ cập nhật';const venue=document.createElement('h3');venue.textContent=event.venue||'Địa điểm sẽ cập nhật';const address=document.createElement('p');address.textContent=event.address||'Chúng mình sẽ bổ sung địa chỉ và lịch trình khi mọi thứ đã sẵn sàng.';const actions=document.createElement('div');actions.className='actions';if(event.mapUrl&&event.mapUrl.startsWith('https://')){const link=document.createElement('a');link.className='button';link.textContent='Chỉ đường ↗';link.href=event.mapUrl;link.target='_blank';link.rel='noopener noreferrer';actions.append(link);}else{const b=document.createElement('button');b.disabled=true;b.textContent='Chỉ đường · Sắp có';actions.append(b);}const calendar=document.createElement('button');calendar.textContent=event.time&&event.venue?'Thêm vào lịch':'Thêm lịch · Sắp có';calendar.disabled=!(event.time&&event.venue);calendar.onclick=()=>downloadCalendar(event);actions.append(calendar);card.append(title,date,time,document.createElement('hr'),venue,address,actions);area.append(card);}}
}
function downloadCalendar(event){const esc=s=>String(s||'').replaceAll('\\','\\\\').replaceAll(';','\\;').replaceAll(',','\\,').replace(/\n/g,'\\n');const start=new Date(event.date+'T'+event.time+':00+07:00');const end=new Date(start.getTime()+2*3600000);const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Duong Ngan//Wedding//VI','BEGIN:VEVENT','UID:'+crypto.randomUUID()+'@wedding','DTSTAMP:'+stamp(new Date()),'DTSTART:'+stamp(start),'DTEND:'+stamp(end),'SUMMARY:'+esc(event.title+' · Dương & Ngân'),'LOCATION:'+esc(event.venue+' '+event.address),'END:VEVENT','END:VCALENDAR'];const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='le-cuoi.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function renderMemory(){if(!memories.length)return;const m=memories[index];$('#memory-image').src=m.src;$('#memory-image').alt=m.alt;$('#memory-caption').textContent=m.caption;if(!reduced&&$('#memory-image').animate){$('#memory-image').getAnimations().forEach(a=>a.cancel());$('#memory-image').animate([{transform:'scale(1.06)',filter:'brightness(1.06)'},{transform:'scale(1)',filter:'brightness(1)'}],{duration:1800,easing:'cubic-bezier(.22,1,.36,1)'});}$('#memory-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(memories.length).padStart(2,'0')}`;$('#memory small').textContent=m.placeholder?'HÌNH MINH HỌA · SẼ THAY BẰNG ẢNH CỦA CHÚNG MÌNH':'';}
async function changeMemory(delta){if(busy||!memories.length)return;busy=true;const next=(index+delta+memories.length)%memories.length,img=new Image();img.src=memories[next].src;try{await img.decode();}catch{busy=false;return;}$('#memory').classList.add('changing');setTimeout(()=>{index=next;renderMemory();$('#memory').classList.remove('changing');busy=false;},reduced?0:350);}
$('#prev').onclick=()=>changeMemory(-1);$('#next').onclick=()=>changeMemory(1);let touchX=0;$('#memory').addEventListener('touchstart',e=>touchX=e.touches[0].clientX,{passive:true});let swiped=false;$('#memory').addEventListener('touchend',e=>{const delta=e.changedTouches[0].clientX-touchX;if(Math.abs(delta)>50){swiped=true;changeMemory(delta>0?-1:1);setTimeout(()=>swiped=false,300);}},{passive:true});
const dialog=$('#lightbox');$('#memory').onclick=()=>{if(swiped)return;dialog.querySelector('img').src=$('#memory-image').src;dialog.querySelector('img').alt=$('#memory-image').alt;dialog.querySelector('p').textContent=$('#memory-caption').textContent;dialog.showModal();};$('#close-lightbox').onclick=()=>dialog.close();
$('#rsvp-form [name=attendance]').onchange=e=>{$('#guests-label').hidden=e.target.value!=='yes';$('#rsvp-form [name=guests]').required=e.target.value==='yes';};
function attachForm(selector,endpoint,success){const form=$(selector);if(demo){form.querySelector('[type=submit]').disabled=true;form.querySelector('.status').textContent='Bản demo: biểu mẫu chưa kết nối máy chủ. Thông tin sẽ không được gửi hoặc lưu.';return;}let id=crypto.randomUUID();form.addEventListener('submit',async e=>{e.preventDefault();const status=form.querySelector('.status'),button=form.querySelector('[type=submit]'),values=Object.fromEntries(new FormData(form));values.id=id;if(values.guests)values.guests=Number(values.guests);button.disabled=true;status.classList.remove('error');status.textContent='Đang gửi…';try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)}),data=await r.json();if(!r.ok)throw Error(data.error||'Chưa gửi được.');status.textContent=success;form.reset();id=crypto.randomUUID();if(selector==='#rsvp-form'){$('#guests-label').hidden=false;}}catch(err){status.classList.add('error');status.textContent=err.message||'Kết nối gián đoạn, vui lòng thử lại.';}finally{button.disabled=false;}});}
attachForm('#rsvp-form','/api/rsvp','Chúng mình đã nhận lời hồi âm của bạn. Cảm ơn bạn thật nhiều ♡');attachForm('#wish-form','/api/wishes','Đã nhận lời thương của bạn. Lời chúc sẽ xuất hiện sau khi được duyệt ♡');
if(!demo)fetch('/api/wishes').then(r=>{if(!r.ok)throw Error();return r.json();}).then(items=>{for(const item of items){const card=document.createElement('article');card.className='wish-note';const p=document.createElement('p'),name=document.createElement('small');p.textContent=item.message;name.textContent=item.name;card.append(p,name);$('#wish-list').append(card);}}).catch(()=>{$('#wish-list').textContent='Chưa tải được lời chúc. Bạn có thể thử lại sau.';});


// The page scrolls normally. The landscape is scenery, never a pinned content container.
const film=$('#film'),landscape=createLandscape($('#world'),schedulePaint);
const scenes=Array.from(film.children).filter(el=>el.matches('section,footer'));
const sceneNames=['Khung cửa','Lời mời','Những ngày có nhau','Lễ cưới','Hồi âm','Lời chúc','Lời cảm ơn'];
const position=$('#scene-position'),playButton=$('#play-film'),couple=$('#couple-companion');
const poses=Array.from(document.querySelectorAll('.doll-pose'));
poses.forEach((pose,i)=>{for(const theme of ['day','dusk','night']){
 const outfit=pose.querySelector('.outfit-'+theme);
 outfit.style.transform=`translateY(${(spriteFootOffset(theme,i)*100).toFixed(5)}%)`;
 outfit.style.clipPath=`inset(0 0 0 ${(spriteClipLeft(theme,i)*100).toFixed(5)}%)`;
}});
const foreground=$('#world-foreground'),foregroundCtx=foreground.getContext('2d');
position.max=String(scenes.length-1);
let ranges=[],activeScene=0,cameraPosition=0,playing=false,seeking=false,paintFrame=0;
let viewportWidth=innerWidth,viewportHeight=innerHeight,measureFrame=0,baseline=innerHeight,keyboard=false;
let playbackFrame=0,playbackTime=0,playbackState={position:0,speed:0};
const maximumScroll=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
const viewport=window.visualViewport;
const editing=()=>Boolean(document.activeElement?.matches('#film input,#film textarea,#film select'));
function updateScene(){
 position.setAttribute('aria-valuetext',sceneNames[activeScene]);
 $('#scene-label').textContent=`${String(activeScene+1).padStart(2,'0')} / 07 · ${sceneNames[activeScene]}`;
 $('#scene-prev').disabled=activeScene===0;$('#scene-next').disabled=activeScene===scenes.length-1;
 document.querySelectorAll('.bottom-nav a').forEach(a=>{if(a.hash==='#'+scenes[activeScene].id)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
 playButton.disabled=reduced;playButton.setAttribute('aria-pressed',String(playing));playButton.textContent=playing?'Dừng phim Ⅱ':'Xem như phim ▷';
 playButton.setAttribute('aria-label',playing?'Dừng phim':'Xem hành trình tự động, có dừng để đọc từng tấm thiệp');
}
function renderCamera(){
 paintFrame=0;cameraPosition=journeyProgress(scrollY,ranges);
 const sample=reduced?Math.round(cameraPosition):cameraPosition,view=cameraState(sample);
 if(view.active!==activeScene){activeScene=view.active;updateScene();}
 if(!seeking)position.value=timelineValue(scrollY,maximumScroll()).toFixed(3);
 landscape.render(view,mode);
 if(document.body.dataset.layout==='stacked'&&foregroundCtx){foregroundCtx.clearRect(0,0,foreground.width,foreground.height);foregroundCtx.drawImage($('#world'),0,0);}
 const metrics=actorLayout(viewportWidth,viewportHeight,view.actor,document.body.dataset.layout==='stacked',keyboard);
 couple.style.width=metrics.width.toFixed(2)+'px';
 couple.style.setProperty('--pose-blur',view.poseBlur.toFixed(2)+'px');
 document.body.style.setProperty('--foreground-top',Math.max(0,metrics.top-24).toFixed(2)+'px');
 couple.style.transform=`translate3d(${metrics.left.toFixed(2)}px,${metrics.top.toFixed(2)}px,0) rotateY(${view.actor.turn.toFixed(2)}deg)`;
 poses.forEach((pose,i)=>{pose.style.opacity=String(view.poses[i]);pose.classList.toggle('current',view.poses[i]>.5);});
}
function schedulePaint(){if(!paintFrame)paintFrame=requestAnimationFrame(renderCamera);}
function measureJourney(){
 measureFrame=0;
 const focused=editing(),visualHeight=viewport?.height||innerHeight;
 if(!focused)baseline=visualHeight;
 keyboard=(!viewport||Math.abs(viewport.scale-1)<.02)&&keyboardVisible(baseline,visualHeight,focused);
 document.body.classList.toggle('keyboard-open',keyboard);
 if(!keyboard){
  viewportWidth=document.documentElement.clientWidth;viewportHeight=innerHeight;
  document.body.dataset.layout=viewportWidth<=700||(viewportWidth<=900&&viewportHeight>viewportWidth)?'stacked':'split';
  document.body.style.setProperty('--view-height',viewportHeight+'px');
  landscape.resize(viewportWidth,viewportHeight);
  foreground.width=$('#world').width;foreground.height=$('#world').height;
 }
 ranges=scenes.map((scene,i)=>{
  const subject=i===0?scene:scene.querySelector('.chapter-paper'),box=subject.getBoundingClientRect();
  return readingRange(scrollY+box.top,scrollY+box.bottom,viewportHeight);
 });
 renderCamera();
}
function scheduleMeasure(){if(!measureFrame)measureFrame=requestAnimationFrame(measureJourney);}
function pauseFilm(){playing=false;cancelAnimationFrame(playbackFrame);playbackFrame=0;playbackTime=0;updateScene();}
function goScene(i,immediate=false){
 pauseFilm();const stop=Math.round(boundedProgress(i));
 const subject=stop===0?scenes[stop]:scenes[stop].querySelector('.chapter-paper');
 const headerBottom=document.querySelector('header').getBoundingClientRect().bottom;
 const top=stop===0?0:Math.max(0,Math.min(maximumScroll(),scrollY+subject.getBoundingClientRect().top-headerBottom-24));
 window.scrollTo({top,behavior:immediate||reduced?'instant':'smooth'});
}
$('#scene-prev').onclick=()=>goScene(Math.ceil(cameraPosition-.001)-1);
$('#scene-next').onclick=()=>goScene(Math.floor(cameraPosition+.001)+1);
position.oninput=()=>{pauseFilm();window.scrollTo({top:timelineScroll(Number(position.value),maximumScroll()),behavior:'instant'});};
position.addEventListener('pointerdown',()=>seeking=true);
window.addEventListener('pointerup',()=>seeking=false);window.addEventListener('pointercancel',()=>seeking=false);
// Auto-play uses the same document path. Slow reading passes hold the camera still.
function playTick(time){
 if(!playing)return;
 const dt=playbackTime?Math.min(.1,(time-playbackTime)/1000):0;playbackTime=time;
 const max=maximumScroll(),reading=ranges.some(r=>playbackState.position>=r.start&&playbackState.position<=r.end);
 playbackState=advancePlayback(playbackState,dt,reading,viewportHeight,max);
 window.scrollTo({top:playbackState.position,behavior:'instant'});
 if(playbackState.position>=max-.01){pauseFilm();return;}
 playbackFrame=requestAnimationFrame(playTick);
}
playButton.onclick=()=>{
 if(playing){pauseFilm();return;}if(reduced||document.body.classList.contains('intro-open'))return;
 const restart=scrollY>=maximumScroll()-3;if(restart)window.scrollTo({top:0,behavior:'instant'});
 playbackState={position:restart?0:scrollY,speed:0};playing=true;playbackTime=0;updateScene();playbackFrame=requestAnimationFrame(playTick);
};
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
 const id=a.hash.slice(1),i=id==='home'&&a.closest('#thanks')?0:scenes.findIndex(s=>s.id===id);if(i<0)return;
 e.preventDefault();goScene(i);history.replaceState(null,'',i===0?'#arrival':a.hash);
}));
// Never prevent wheel, touch or native keyboard scrolling. The document supplies the motion.
window.addEventListener('scroll',schedulePaint,{passive:true});
window.addEventListener('wheel',()=>{if(playing)pauseFilm();},{passive:true});
window.addEventListener('touchstart',()=>{if(playing)pauseFilm();},{passive:true});
document.addEventListener('keydown',e=>{if(playing&&['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))pauseFilm();});
film.addEventListener('focusin',()=>{if(playing)pauseFilm();scheduleMeasure();});
document.addEventListener('focusout',scheduleMeasure);
$('#memory').addEventListener('click',()=>{if(playing)pauseFilm();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseFilm();else schedulePaint();});
document.addEventListener('palettechange',schedulePaint);
document.addEventListener('invitationopen',()=>{if(!location.hash)window.scrollTo({top:0,behavior:'instant'});scheduleMeasure();});
$('#motion').addEventListener('click',()=>{pauseFilm();schedulePaint();});preference.addEventListener('change',()=>{pauseFilm();schedulePaint();});
window.addEventListener('resize',scheduleMeasure);viewport?.addEventListener('resize',scheduleMeasure);
if('ResizeObserver' in window)new ResizeObserver(scheduleMeasure).observe(film);
document.fonts?.ready.then(scheduleMeasure);
updateScene();measureJourney();
if(location.hash){const i=scenes.findIndex(s=>s.id===location.hash.slice(1));if(i>=0)requestAnimationFrame(()=>goScene(i,true));}
