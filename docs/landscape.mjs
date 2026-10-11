import {HILL_DEPTHS,projectPlane,portalFrame,ease,clamp,mix} from './camera.mjs';
const colorMix=(a,b,t)=>{const A=a.slice(1).match(/../g).map(x=>parseInt(x,16)),B=b.slice(1).match(/../g).map(x=>parseInt(x,16));return `rgb(${A.map((v,i)=>Math.round(mix(v,B[i],t))).join(',')})`;};
const palettes={
 day:{sky:['#b4c9c7','#d9e3d7','#f3e8cb'],sun:'#fff5cd',far:'#bdcfbf',near:'#526955',ridge:'#d5dcc0',fog:'#e6e9d6',lake:['#c3d7d1','#6e9691'],wall:['#ece5d3','#c8c6af'],wood:'#8b9175',trim:'#f8f1dc',room:'#535f4d'},
 dusk:{sky:['#657b90','#c5a0a0','#efd0ad'],sun:'#ffe0a2',far:'#b5b7ae',near:'#5a6562',ridge:'#e1c4ac',fog:'#dbc6b6',lake:['#d2b9ac','#6b8188'],wall:['#dcd0c4','#ae9b90'],wood:'#8b7466',trim:'#f8dbc0',room:'#705d56'},
 night:{sky:['#030815','#0a1630','#253449'],sun:'#e1ecff',far:'#34485c',near:'#102a31',ridge:'#718c9a',fog:'#344b5b',lake:['#2b4758','#071b29'],wall:['#162232','#0b1524'],wood:'#344459',trim:'#879fbb',room:'#070e1c'}
};
const sceneryLayers=[...HILL_DEPTHS.map((depth,index)=>({kind:'hill',depth,index})),{kind:'arch',depth:167},{kind:'lake',depth:108},{kind:'tree',depth:82}].sort((a,b)=>b.depth-a.depth);
// Authored profiles: nine distinct ridgelines, painted in back-to-front world coordinates.
const ridges=[
 [.30,.18,.29,.08,.35,.15,.25], [.22,.32,.13,.27,.08,.28,.16],
 [.12,.26,.10,.31,.18,.08,.26], [.27,.09,.21,.14,.34,.20,.12],
 [.16,.07,.26,.12,.19,.30,.11], [.26,.14,.06,.19,.11,.24,.15],
 [.09,.22,.13,.05,.18,.12,.21], [.17,.09,.19,.10,.04,.17,.12], [.12,.07,.14,.03,.11,.08,.14]
];
export function createLandscape(canvas,onReady=()=>{}){
 const ctx=canvas.getContext('2d',{alpha:false});let width=0,height=0,lastState=null,lastTheme='day';
 const art={};
 for(const [key,file] of [['tree','cinematic-tree.svg'],['arch','cinematic-arch.svg']]){
  const img=new Image();img.decoding='async';img.src=new URL('./assets/'+file,import.meta.url).href;
  img.onload=()=>{art[key]=img;if(lastState)render(lastState,lastTheme);onReady();};
 }
 function resize(w,h){width=Math.max(1,w);height=Math.max(1,h);const d=Math.min(devicePixelRatio||1,width<700?1.75:2);canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx?.setTransform(d,0,0,d,0,0);if(lastState)render(lastState,lastTheme);}
 function archPath(frame){
  const{x,y,width:w,height:h}=frame,X=n=>x+n*w/600,Y=n=>y+n*h/800;
  ctx.moveTo(X(117),Y(775));ctx.lineTo(X(117),Y(314));
  ctx.bezierCurveTo(X(117),Y(178),X(197),Y(93),X(300),Y(93));
  ctx.bezierCurveTo(X(403),Y(93),X(483),Y(178),X(483),Y(314));ctx.lineTo(X(483),Y(775));
 }
 function paintSky(p,night){
  const g=ctx.createLinearGradient(0,0,0,height);p.sky.forEach((c,i)=>g.addColorStop(i/2,c));ctx.fillStyle=g;ctx.fillRect(-width*.02,-height*.02,width*1.04,height*1.04);
  const sx=width*.76,sy=height*.27,rad=Math.min(width,height)*(night?.031:.049);
  const halo=ctx.createRadialGradient(sx,sy,rad*.2,sx,sy,rad*9);halo.addColorStop(0,night?'rgba(172,207,247,.12)':'rgba(255,243,199,.40)');halo.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,width,height);
  ctx.beginPath();ctx.arc(sx,sy,rad,0,Math.PI*2);ctx.fillStyle=p.sun;ctx.fill();
  if(night){ctx.fillStyle=p.sky[0];ctx.beginPath();ctx.arc(sx+rad*.55,sy-rad*.18,rad*.87,0,Math.PI*2);ctx.fill();}
  else{ctx.save();ctx.globalAlpha=.075;ctx.fillStyle=p.sun;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(sx+(i-2)*rad,sy);ctx.lineTo(width*(.28+i*.12),height);ctx.lineTo(width*(.34+i*.15),height);ctx.closePath();ctx.fill();}ctx.restore();}
 }
 function ridgePath(i,projection,state){
  const s=projection.scale,baseline=height*(.46+(state.elevation-3)*.006)+height*.35*s,elevation=height*.60*s;
  const span=width*(2.2+s*.2),offset=-width*.6-state.x*s*width*.012,values=ridges[i];
  const archScale=22/(167-state.z),centre=width*.5-state.x*archScale*width*.015;
  const corridor=width*(.32+.035*Math.min(s,2)),floor=height*(.46+(HILL_DEPTHS[i]>167?.035:.22)*s);
  const points=[];
  for(let j=0;j<=64;j++){
   const ratio=j/64,position=ratio*(values.length-1),index=Math.min(values.length-2,Math.floor(position)),x=offset+span*ratio;
   const raw=baseline-(mix(values[index],values[index+1],ease(position-index))+.4)*elevation;
   const opening=Math.cos(Math.min(1,Math.abs(x-centre)/corridor)*Math.PI/2)**2;
   points.push([x,Math.max(raw,mix(raw,floor,opening))]);
  }
  const path=new Path2D();path.moveTo(...points[0]);
  for(let j=1;j<points.length;j++){const[a,b]=points[j-1],[x,y]=points[j];path.quadraticCurveTo(a,b,(a+x)/2,(b+y)/2);}
  path.lineTo(...points.at(-1));path.lineTo(offset+span,height*6);path.lineTo(offset,height*6);path.closePath();
  return {path,baseline,s,offset,span};
 }
 function paintHill(i,state,p){
  const q=projectPlane(HILL_DEPTHS[i],state.z);if(q.opacity<=0)return;
  ctx.save();ctx.globalAlpha=q.opacity;
  const depthTint=(8-i)/8;const g=ctx.createLinearGradient(0,height*.30,0,height*1.1);g.addColorStop(0,colorMix(p.far,p.near,depthTint*.62));g.addColorStop(1,colorMix(p.far,p.near,.30+depthTint*.68));ctx.fillStyle=g;
  const r=ridgePath(i,q,state);ctx.fill(r.path);
  // Fine contours disappear into atmospheric perspective rather than a hard outline.
  ctx.save();ctx.clip(r.path);ctx.strokeStyle=p.ridge;ctx.lineWidth=.75;ctx.globalAlpha*=.07+(.10*(8-i)/8);
  for(let line=0;line<5;line++){const y=r.baseline+line*height*.014*q.scale;ctx.beginPath();ctx.moveTo(-width*.1,y);ctx.bezierCurveTo(width*.25,y-height*.055*q.scale,width*.55,y+height*.1*q.scale,width*1.1,y-height*.01*q.scale);ctx.stroke();}
  ctx.restore();
  ctx.globalAlpha=q.opacity*(.04+i*.019);ctx.fillStyle=p.fog;ctx.fill(r.path);ctx.restore();
 }
 function paintLake(state,p,night){
  const q=projectPlane(108,state.z);if(q.opacity<=0)return;
  const s=q.scale,cx=width*.53-state.x*s*width*.012,cy=height*.43+height*.30*s;
  const rx=width*.42*s,ry=height*.13*s;
  if(cy-ry>height*1.2||rx>width*6)return;
  ctx.save();ctx.globalAlpha=q.opacity;ctx.beginPath();ctx.moveTo(cx-rx,cy);
  ctx.bezierCurveTo(cx-rx*.74,cy-ry*.70,cx-rx*.20,cy-ry,cx+rx*.44,cy-ry*.44);
  ctx.bezierCurveTo(cx+rx*1.15,cy-ry*.20,cx+rx*1.09,cy+ry*.66,cx+rx*.16,cy+ry);
  ctx.bezierCurveTo(cx-rx*.49,cy+ry*1.03,cx-rx*.78,cy+ry*.44,cx-rx,cy);ctx.closePath();ctx.clip();
  const g=ctx.createLinearGradient(cx,cy-ry,cx,cy+ry);g.addColorStop(0,p.lake[0]);g.addColorStop(1,p.lake[1]);ctx.fillStyle=g;ctx.fillRect(cx-rx,cy-ry,rx*2.2,ry*2.1);
  ctx.fillStyle=p.far;ctx.globalAlpha=q.opacity*.13;ctx.beginPath();ctx.moveTo(cx-rx,cy-ry);ctx.bezierCurveTo(cx-rx*.4,cy+ry*.15,cx+rx*.3,cy-ry*.6,cx+rx,cy+ry*.15);ctx.lineTo(cx+rx,cy-ry);ctx.closePath();ctx.fill();
  ctx.globalAlpha=q.opacity*.16;ctx.strokeStyle=p.sun;ctx.lineWidth=Math.max(.7,s*.65);
  for(let i=0;i<14;i++){const y=cy-ry*.64+i*ry*.11,a=rx*(.10+(i%4)*.052);ctx.beginPath();ctx.moveTo(cx+rx*.2-a,y);ctx.quadraticCurveTo(cx+rx*.2,y+ry*.01,cx+rx*.2+a,y);ctx.stroke();}
  ctx.restore();
  // Shore light and a quiet shadow anchor water to the surrounding ground.
  ctx.save();ctx.globalAlpha=q.opacity*.16;ctx.strokeStyle=night?p.ridge:p.trim;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,.10,Math.PI*.83);ctx.stroke();ctx.restore();
 }
 function paintTree(state,p,night){
  const q=projectPlane(82,state.z);if(!art.tree||q.opacity<=0)return;
  const s=q.scale,x=width*.30-state.x*s*width*.012-width*.34*s,foot=height*.43+height*.35*s;
  const h=height*.61*s,w=h*.75;
  if(w>width*8)return;
  ctx.save();ctx.globalAlpha=q.opacity;
  ctx.fillStyle=night?'rgba(0,4,14,.26)':'rgba(34,57,42,.12)';ctx.beginPath();ctx.ellipse(x+w*.5,foot-h*.01,w*.55,h*.024,-.12,0,Math.PI*2);ctx.fill();
  if(night)ctx.filter='brightness(.72) saturate(.65)';else if(lastTheme==='dusk')ctx.filter='sepia(.15)';
  ctx.drawImage(art.tree,x,foot-h,w,h);ctx.restore();
 }
 function paintArch(state,p,night){
  const frame=portalFrame(width,height),s=22/(167-state.z);
  const w=frame.width*s,h=frame.height*s;
  const x=width/2-w/2-state.x*s*width*.015,y=height*.43+(frame.y-frame.height*.0-height*.43)*s;
  const box={x,y,width:w,height:h};
  ctx.save();ctx.globalAlpha=.90;
  ctx.fillStyle=night?'rgba(0,4,14,.32)':'rgba(51,67,47,.15)';ctx.beginPath();ctx.ellipse(x+w*.5,y+h*.96,w*.40,h*.021,0,0,Math.PI*2);ctx.fill();
  if(art.arch){if(night)ctx.filter='brightness(1.12) saturate(.38)';else if(lastTheme==='dusk')ctx.filter='sepia(.16)';ctx.drawImage(art.arch,x,y,w,h);ctx.filter='none';}
  else{ctx.strokeStyle=p.trim;ctx.lineWidth=Math.max(1,5*s);ctx.beginPath();archPath(box);ctx.stroke();}
  if(night){
   // D & N are local to the arch, so the stars stay physically inside its opening.
   const letters=[[[.36,.43],[.36,.28],[.40,.28],[.44,.32],[.44,.39],[.40,.43],[.36,.43]],[[.56,.43],[.56,.28],[.64,.43],[.64,.28]]];
   const alpha=ease((state.z-102)/30);ctx.globalAlpha=alpha;ctx.strokeStyle='rgba(194,218,255,.55)';ctx.lineWidth=Math.max(.55,s*.8);
   for(const points of letters){ctx.beginPath();points.forEach(([a,b],i)=>i?ctx.lineTo(x+w*a,y+h*b):ctx.moveTo(x+w*a,y+h*b));ctx.stroke();for(const[a,b]of points){const px=x+w*a,py=y+h*b;const halo=ctx.createRadialGradient(px,py,0,px,py,Math.max(2,6*s));halo.addColorStop(0,'rgba(231,241,255,.8)');halo.addColorStop(1,'rgba(180,210,255,0)');ctx.fillStyle=halo;ctx.fillRect(px-6*s,py-6*s,12*s,12*s);ctx.fillStyle='#f3f7ff';ctx.beginPath();ctx.arc(px,py,Math.max(.7,1.5*s),0,Math.PI*2);ctx.fill();}}
   ctx.font=`italic ${Math.max(6,w*.045)}px Georgia`;ctx.textAlign='center';ctx.fillStyle='#dce9ff';ctx.fillText('&',x+w*.495,y+h*.36);
  }
  ctx.restore();
 }
 function paintPorch(state,p){
  if(state.room<=0)return;const f=portalFrame(width,height);
  ctx.save();ctx.globalAlpha=state.room*.95;
  const w=f.width*.62*(1+ease(state.progress/.6)*2),x=width*.5-w*.5,y=height*.85,bottom=f.y+f.height*.97;
  const g=ctx.createLinearGradient(0,y,0,bottom);g.addColorStop(0,p.ridge);g.addColorStop(1,p.wood);
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x+w*.06,y);ctx.lineTo(x+w*.94,y);ctx.lineTo(x+w,bottom);ctx.lineTo(x,bottom);ctx.closePath();ctx.fill();
  ctx.strokeStyle=p.trim;ctx.lineWidth=.7;ctx.globalAlpha*=.40;
  for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(x+w*(.06+i*.176),y);ctx.lineTo(x+w*i*.20,bottom);ctx.stroke();}
  ctx.beginPath();ctx.moveTo(x,y+(bottom-y)*.46);ctx.lineTo(x+w,y+(bottom-y)*.46);ctx.stroke();ctx.restore();
 }
 function paintRoom(state,p){
  if(state.room<=0)return;const frame=portalFrame(width,height),exitScale=Math.max(width/(frame.width*.61),height/(frame.height*.85))*1.20,scale=1+(state.roomScale-1)*(exitScale-1)/2.7;
  ctx.save();ctx.globalAlpha=state.room;ctx.translate(width*.5,height*.52);ctx.scale(scale,scale);ctx.translate(-width*.5,-height*.52);
  const wall=ctx.createLinearGradient(0,0,width,height);wall.addColorStop(0,p.wall[1]);wall.addColorStop(.6,p.wall[0]);wall.addColorStop(1,p.wall[1]);
  ctx.beginPath();ctx.rect(-width*3,-height*3,width*7,height*7);archPath(frame);ctx.closePath();ctx.fillStyle=wall;ctx.fill('evenodd');
  // Two plaster wings, deep wooden jambs, inset moulding and a sill catching the light.
  ctx.shadowColor='rgba(15,24,18,.40)';ctx.shadowBlur=18;ctx.shadowOffsetX=-8;ctx.shadowOffsetY=6;
  ctx.strokeStyle=p.wood;ctx.lineWidth=width<700?13:22;ctx.beginPath();archPath(frame);ctx.stroke();ctx.shadowColor='transparent';
  ctx.strokeStyle=p.trim;ctx.lineWidth=1.4;ctx.beginPath();archPath({x:frame.x-8,y:frame.y-8,width:frame.width+16,height:frame.height+8});ctx.stroke();
  ctx.strokeStyle=p.wood;ctx.globalAlpha=state.room*.24;ctx.lineWidth=1;
  for(const side of [frame.x*.38,width-frame.x*.38]){ctx.strokeRect(side-width*.055,height*.22,width*.11,height*.54);ctx.strokeRect(side-width*.05,height*.229,width*.10,height*.52);}
  ctx.globalAlpha=state.room;const sill=ctx.createLinearGradient(0,frame.y+frame.height*.969,0,frame.y+frame.height*1.02);sill.addColorStop(0,p.trim);sill.addColorStop(.16,p.wood);sill.addColorStop(1,p.room);ctx.fillStyle=sill;ctx.fillRect(frame.x+frame.width*.18,frame.y+frame.height*.969,frame.width*.64,frame.height*.044);
  // Floorboards converge on the shared optical centre, a physical room rather than an overlay border.
  ctx.fillStyle=p.wall[1];ctx.fillRect(-width*3,height*.99,width*7,height*3);
  ctx.strokeStyle=p.wood;ctx.globalAlpha=state.room*.27;ctx.lineWidth=1;
  for(let i=-3;i<=8;i++){ctx.beginPath();ctx.moveTo(width*.5+(i-2.5)*width*.08,height*.98);ctx.lineTo(width*.5+(i-2.5)*width*.32,height*1.7);ctx.stroke();}
  ctx.restore();
 }
 function render(state,theme='day'){
  lastState=state;lastTheme=theme;if(!ctx||!width||!height)return;
  const p=palettes[theme]||palettes.day,night=theme==='night';ctx.clearRect(0,0,width,height);
  ctx.save();ctx.translate(width*.5,height*.5);ctx.rotate(state.roll);ctx.translate(-width*.5,-height*.5);
  paintSky(p,night);
  // The distant ceremonial arch remains legible beyond every ridge; nearby tree/water have their own depth.
  for(const layer of sceneryLayers){
   if(layer.kind==='hill')paintHill(layer.index,state,p);
   else if(layer.kind==='arch')paintArch(state,p,night);
   else if(layer.kind==='lake')paintLake(state,p,night);
   else paintTree(state,p,night);
  }
  const mist=ctx.createLinearGradient(0,height*.35,0,height*.57);mist.addColorStop(0,'rgba(230,235,218,0)');mist.addColorStop(.5,night?'rgba(145,178,202,.025)':'rgba(240,244,228,.12)');mist.addColorStop(1,'rgba(230,235,218,0)');ctx.fillStyle=mist;ctx.fillRect(0,0,width,height);
  paintPorch(state,p);paintRoom(state,p);ctx.restore();
  const vignette=ctx.createRadialGradient(width*.5,height*.48,height*.2,width*.5,height*.5,Math.max(width,height)*.69);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,night?'rgba(0,4,14,.42)':'rgba(55,66,47,.12)');ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);
 }
 return {resize,render};
}
