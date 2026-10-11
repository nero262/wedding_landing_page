'use strict';
import { boundedScene } from './depth.mjs';
import { boundedProgress,advanceCamera,cameraState } from './camera.mjs';
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
function setTheme(){const hour=new Date().getHours(),choice=$('#theme').value;mode=choice==='auto'?(hour>=6&&hour<16?'day':hour>=16&&hour<19?'dusk':'night'):choice;document.body.dataset.theme=mode;document.querySelector('meta[name=theme-color]').content=getComputedStyle(document.body).getPropertyValue('--bg').trim()||'#f7eee2';drawSky(performance.now());}
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
function closeIntro(animate){if(opening)return;opening=true;$('#open').disabled=true;intro.classList.toggle('opening',animate&&!reduced);const finish=()=>{intro.classList.add('gone');intro.inert=true;document.body.classList.remove('intro-open');safeSet('opened','1');document.querySelectorAll('.hero .reveal').forEach(el=>el.classList.add('visible'));};if(animate&&!reduced)setTimeout(finish,2600);else finish();}
if(safeGet('opened')==='1'||location.hash)closeIntro(false);else document.body.classList.add('intro-open');$('#open').onclick=()=>closeIntro(true);$('#skip').onclick=()=>closeIntro(false);
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


// One uninterrupted camera timeline. Text, scenery and actors share its position.
const film=$('#film');
initGarden();
const scenes=Array.from(film.children).filter(el=>el.matches('section,footer'));
const sceneNames=['Lời mời','Những ngày có nhau','Lễ cưới','Hồi âm','Lời chúc','Lời cảm ơn'];
const position=$('#scene-position'),playButton=$('#play-film');
position.max=String(scenes.length-1);
const poses=Array.from(document.querySelectorAll('.doll-pose'));
let activeScene=0,cameraPosition=0,cameraVelocity=0,targetProgress=0,cameraFrame=0,lastCameraTime=0;
let playing=false,replaying=false,seeking=false,wheelTimer=0;
scenes.forEach(scene=>scene.classList.add('depth-scene'));
function updateScene(){
 position.setAttribute('aria-valuetext',sceneNames[activeScene]);
 $('#scene-label').textContent=`${String(activeScene+1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')} · ${sceneNames[activeScene]}`;
 $('#scene-prev').disabled=activeScene===0;$('#scene-next').disabled=activeScene===scenes.length-1;
 scenes.forEach((scene,i)=>{scene.classList.toggle('current',i===activeScene);scene.inert=i!==activeScene;scene.setAttribute('aria-hidden',String(i!==activeScene));});
 document.querySelectorAll('.bottom-nav a').forEach(a=>{if(a.hash==='#'+scenes[activeScene].id)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
 playButton.disabled=reduced;playButton.setAttribute('aria-label',playing?'Dừng phim tại chặng hiện tại':'Xem thiệp như một đoạn phim tự chạy');playButton.setAttribute('aria-pressed',String(playing));playButton.textContent=playing?'Dừng phim Ⅱ':'Xem như phim ▷';
}
function renderCamera(){
 const view=cameraState(cameraPosition,scenes.length);
 if(view.active!==activeScene){
  if(scenes[activeScene].contains(document.activeElement))film.focus({preventScroll:true});
  activeScene=view.active;updateScene();
 }
 if(!seeking)position.value=view.progress.toFixed(3);
 film.style.setProperty('--camera-scale',view.scale.toFixed(5));film.style.setProperty('--camera-z',view.subjectZ.toFixed(3)+'px');
 film.style.setProperty('--garden-scale',view.gardenScale.toFixed(5));film.style.setProperty('--garden-z',view.gardenZ.toFixed(3)+'px');
 scenes.forEach((scene,i)=>{const state=view.scenes[i];scene.classList.toggle('in-view',state.weight>.001);scene.style.opacity=String(state.weight);scene.style.transform=state.transform;scene.style.filter=state.filter;});
 poses.forEach((pose,i)=>{pose.style.opacity=String(view.poses[i]);pose.classList.toggle('current',view.poses[i]>.5);});
}
function requestCamera(){if(!cameraFrame&&!document.hidden)cameraFrame=requestAnimationFrame(tickCamera);}
function tickCamera(time){
 cameraFrame=0;const dt=lastCameraTime?Math.min(.05,(time-lastCameraTime)/1000):1/60;lastCameraTime=time;
 if(playing){
  if(replaying){if(cameraPosition<.002&&Math.abs(cameraVelocity)<.005)replaying=false;}
  else targetProgress=boundedProgress(targetProgress+dt/9.5,scenes.length);
 }
 const next=advanceCamera(cameraPosition,cameraVelocity,targetProgress,dt);
 cameraPosition=boundedProgress(next.position,scenes.length);cameraVelocity=next.velocity;
 if(Math.abs(cameraPosition-targetProgress)<.0002&&Math.abs(cameraVelocity)<.001){cameraPosition=targetProgress;cameraVelocity=0;}
 renderCamera();
 if(playing&&targetProgress===scenes.length-1&&cameraVelocity===0){playing=false;updateScene();}
 if(playing||cameraVelocity!==0||cameraPosition!==targetProgress)requestCamera();else lastCameraTime=0;
}
function pauseFilm(){if(playing){playing=false;replaying=false;updateScene();}}
function seekCamera(value,immediate=false){
 targetProgress=boundedProgress(value,scenes.length);if(reduced)targetProgress=Math.round(targetProgress);
 if(reduced||immediate){cancelAnimationFrame(cameraFrame);cameraFrame=0;lastCameraTime=0;cameraPosition=targetProgress;cameraVelocity=0;renderCamera();}
 else requestCamera();
}
function goScene(index,immediate=false){pauseFilm();clearTimeout(wheelTimer);seekCamera(Math.round(boundedScene(index,scenes.length)),immediate);}
$('#scene-prev').onclick=()=>goScene(Math.ceil(targetProgress-.001)-1);
$('#scene-next').onclick=()=>goScene(Math.floor(targetProgress+.001)+1);
position.oninput=()=>{pauseFilm();clearTimeout(wheelTimer);seekCamera(Number(position.value));};
position.addEventListener('pointerdown',()=>seeking=true);
window.addEventListener('pointerup',()=>{seeking=false;});window.addEventListener('pointercancel',()=>{seeking=false;});
playButton.onclick=()=>{
 clearTimeout(wheelTimer);
 if(playing){pauseFilm();seekCamera(activeScene);return;}
 if(reduced)return;
 playing=true;replaying=cameraPosition>=scenes.length-1-.01;
 if(replaying)targetProgress=0;else targetProgress=cameraPosition;
 updateScene();requestCamera();
};
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const i=scenes.findIndex(scene=>scene.id===a.hash.slice(1));if(i<0)return;e.preventDefault();goScene(i);history.replaceState(null,'',a.hash);}));
film.addEventListener('wheel',e=>{
 if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||dialog.open)return;
 if(e.target.closest('input,select,textarea,.paper,.wish-list,#event-cards')){if(playing){pauseFilm();seekCamera(activeScene);}return;}
 const scene=scenes[activeScene],down=e.deltaY>0;
 if(scene.scrollHeight>scene.clientHeight+2&&(down&&scene.scrollTop+scene.clientHeight<scene.scrollHeight-3||!down&&scene.scrollTop>3)){if(playing){pauseFilm();seekCamera(activeScene);}return;}
 e.preventDefault();pauseFilm();
 const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?film.clientHeight:1);
 if(reduced){clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>goScene(activeScene+(down?1:-1)),120);return;}
 seekCamera(targetProgress+Math.max(-.35,Math.min(.35,delta/500)));
 clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>seekCamera(down?Math.ceil(targetProgress-.001):Math.floor(targetProgress+.001)),220);
},{passive:false});
let gesture=null;film.addEventListener('touchstart',e=>{if(playing){pauseFilm();seekCamera(activeScene);}if(e.target.closest('input,textarea,select,.paper,.memory-card,.wish-list,#event-cards'))return;gesture={x:e.touches[0].clientX,y:e.touches[0].clientY,top:scenes[activeScene].scrollTop};},{passive:true});
film.addEventListener('touchend',e=>{if(!gesture)return;const dx=e.changedTouches[0].clientX-gesture.x,dy=e.changedTouches[0].clientY-gesture.y,scene=scenes[activeScene];const scrolled=Math.abs(scene.scrollTop-gesture.top)>2;gesture=null;if(!scrolled&&Math.abs(dy)>70&&Math.abs(dy)>Math.abs(dx)*1.4)goScene(activeScene+(dy<0?1:-1));},{passive:true});
document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select,button,[contenteditable]')||dialog.open||document.body.classList.contains('intro-open'))return;if(['ArrowDown','PageDown'].includes(e.key)){e.preventDefault();goScene(Math.floor(targetProgress+.001)+1);}if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();goScene(Math.ceil(targetProgress-.001)-1);}if(e.key==='Home'){e.preventDefault();goScene(0);}if(e.key==='End'){e.preventDefault();goScene(scenes.length-1);}});
film.addEventListener('focusin',e=>{if(e.target.closest('input,textarea,select,.paper')){pauseFilm();clearTimeout(wheelTimer);seekCamera(activeScene);}});
$('#memory').addEventListener('click',()=>{pauseFilm();seekCamera(activeScene);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseFilm();cancelAnimationFrame(cameraFrame);cameraFrame=0;lastCameraTime=0;}else if(cameraPosition!==targetProgress)requestCamera();});
function settleReducedMotion(){if(reduced){pauseFilm();clearTimeout(wheelTimer);seekCamera(activeScene,true);document.querySelectorAll('.memory-image-frame img').forEach(img=>img.getAnimations().forEach(a=>a.cancel()));}updateScene();}
$('#motion').addEventListener('click',settleReducedMotion);preference.addEventListener('change',settleReducedMotion);
updateScene();renderCamera();if(location.hash){const i=scenes.findIndex(scene=>scene.id===location.hash.slice(1));if(i>=0)goScene(i,true);}

// The illustration remains visible as an image if SVG loading is unavailable.
function initGarden(){
 const image=$('.stage-art > img'),motes=$('.garden-motes');
 if(image)fetch(image.getAttribute('src')).then(r=>{if(!r.ok)throw Error();return r.text();}).then(source=>{
  const svg=new DOMParser().parseFromString(source,'image/svg+xml').documentElement;
  if(svg.localName!=='svg'||svg.namespaceURI!=='http://www.w3.org/2000/svg')return;
  svg.querySelectorAll('script,foreignObject').forEach(node=>node.remove());
  svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
  image.replaceWith(document.importNode(svg,true));
 }).catch(()=>{});
 if(motes)for(let i=0;i<8;i++){
  const petal=document.createElement('span');petal.style.setProperty('--mote-x',(12+i*10)+'%');
  petal.style.setProperty('--mote-delay',(-i*2.7)+'s');petal.style.setProperty('--mote-duration',(15+i%4*3)+'s');
  petal.style.setProperty('--mote-size',(i%3+3)+'px');motes.append(petal);
 }
 let pointerFrame=0;
 const reset=()=>{cancelAnimationFrame(pointerFrame);film.style.setProperty('--look-x','0px');film.style.setProperty('--look-y','0px');film.style.setProperty('--look-turn','0deg');};
 film.addEventListener('pointermove',e=>{
  if(reduced||e.pointerType!=='mouse'||!matchMedia('(hover:hover)').matches)return;
  cancelAnimationFrame(pointerFrame);
  pointerFrame=requestAnimationFrame(()=>{
   const box=film.getBoundingClientRect(),x=(e.clientX-box.left)/box.width-.5,y=(e.clientY-box.top)/box.height-.5;
   film.style.setProperty('--look-x',(x*6).toFixed(2)+'px');film.style.setProperty('--look-y',(y*4).toFixed(2)+'px');
   film.style.setProperty('--look-turn',(x*3).toFixed(2)+'deg');
  });
 },{passive:true});
 film.addEventListener('pointerleave',reset);$('#motion').addEventListener('click',reset);
 document.addEventListener('visibilitychange',()=>{film.classList.toggle('motion-paused',document.hidden);if(document.hidden)reset();});
}