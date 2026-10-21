import * as T from './vendor/three.module.min.js';
// A seeded, code-built set. All visible motion depends on journey progress, never wall time.
export function createNightLake(){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
 renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 const scene=new T.Scene();scene.background=new T.Color('#08162c');scene.fog=new T.FogExp2('#11243a',.004);
 const camera=new T.PerspectiveCamera(44,1,.1,600);
 scene.add(new T.HemisphereLight('#b4d3ff','#4c3828',2.2));
 const moonlight=new T.DirectionalLight('#a3c7ff',2.4);moonlight.position.set(-40,60,-45);scene.add(moonlight);
 const warm=new T.DirectionalLight('#ffca7b',2.6);warm.position.set(12,12,30);scene.add(warm);
 const mat=(c,props={})=>new T.MeshStandardMaterial({color:c,roughness:.82,...props});
 const ivory=mat('#e4d5b9'),stone=mat('#797d80'),edge=mat('#b2a38d'),gold=mat('#b18a4a',{metalness:.65,roughness:.3}),bark=mat('#292b24'),green=mat('#172e2c'),white=mat('#fff0d9'),pink=mat('#d5bda9');
 const lampMat=new T.MeshBasicMaterial({color:'#ffdf9c'});
 const unitSphere=new T.SphereGeometry(1,9,7),boxGeo=new T.BoxGeometry(1,1,1);
 let seed=721;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
 const mesh=(geo,material,x=0,y=0,z=0,sx=1,sy=sx,sz=sx,parent=scene)=>{const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;};
 const ball=(material,x,y,z,sx,sy=sx,sz=sx,parent=scene)=>mesh(unitSphere,material,x,y,z,sx,sy,sz,parent);
 const box=(material,x,y,z,sx,sy,sz,parent=scene)=>mesh(boxGeo,material,x,y,z,sx,sy,sz,parent);
 const glows=[];const leaves=[],petals=[],centres=[],lights=[],trunks=[],tiles=[];
 function item(list,x,y,z,sx,sy=sx,sz=sx,ry=0,rz=0){list.push({x,y,z,sx,sy,sz,ry,rz});}
 function instances(geo,material,list){const m=new T.InstancedMesh(geo,material,list.length),d=new T.Object3D();list.forEach((a,i)=>{d.position.set(a.x,a.y,a.z);d.scale.set(a.sx,a.sy,a.sz);d.rotation.set(0,a.ry||0,a.rz||0);d.updateMatrix();m.setMatrixAt(i,d.matrix);});m.computeBoundingSphere();scene.add(m);return m;}
 function glow(x,y,z,size=1,opacity=.3){glows.push({x,y,z,size,opacity});}
 function flower(x,y,z,s=.25){
  item(centres,x,y+.03,z,s*.27,s*.23,s*.27);
  for(let j=0;j<5;j++){const a=j*Math.PI*2/5;item(petals,x+Math.cos(a)*s*.47,y,z+Math.sin(a)*s*.47,s*.5,s*.17,s*.3,-a);}
  for(let j=0;j<2;j++){const a=random()*Math.PI*2;item(leaves,x+Math.cos(a)*s,y-.13,z+Math.sin(a)*s,s*.34,s*.14,s*.8,a);}
 }
 function bouquet(x,y,z,s=1){for(let i=0;i<12;i++){const a=random()*Math.PI*2,r=random()*s;flower(x+Math.cos(a)*r,y+random()*.6*s,z+Math.sin(a)*r,.15+random()*.20*s);}}
 function lantern(x,z,s=1,y=1.12){
  box(gold,x,y+.04*s,z,.56*s,.09*s,.56*s);box(gold,x,y+.87*s,z,.59*s,.08*s,.59*s);
  for(const a of [-1,1])for(const b of [-1,1])box(gold,x+a*.23*s,y+.44*s,z+b*.23*s,.025*s,.78*s,.025*s);
  mesh(new T.ConeGeometry(.43, .27,4),gold,x,y+1.03*s,z,1, s,1).rotation.y=Math.PI/4;
  mesh(new T.CylinderGeometry(.11*s,.12*s,.46*s,8),ivory,x,y+.28*s,z);
  ball(lampMat,x,y+.55*s,z,.06*s,.13*s);glow(x,y+.56*s,z,2*s,.45);
  glow(x,y+.01,z,3*s,.10);
 }
 function pathX(z){return Math.sin((z+28)/110*Math.PI*1.7)*7;}
 // The route is one continuous paved ribbon, not separate scene backgrounds.
 const pts=[];for(let i=0;i<=150;i++){const z=-28+i*.82;pts.push(new T.Vector3(pathX(z),1,z));}
 const vertices=[],uv=[];for(let i=0;i<pts.length;i++){for(const side of [-1,1]){vertices.push(pts[i].x+side*3.1,1,pts[i].z);uv.push(side===-1?0:1,i);}}
 const ix=[];for(let i=0;i<pts.length-1;i++){const n=i*2;ix.push(n,n+2,n+1,n+1,n+2,n+3);}
 const ribbon=new T.BufferGeometry();ribbon.setAttribute('position',new T.Float32BufferAttribute(vertices,3));ribbon.setAttribute('uv',new T.Float32BufferAttribute(uv,2));ribbon.setIndex(ix);ribbon.computeVertexNormals();
 const paving=stone.clone();paving.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 wp;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nwp=(modelMatrix*vec4(transformed,1.0)).xyz;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 wp;').replace('#include <color_fragment>',`#include <color_fragment>
 float line=max(step(.96,fract(wp.z*.62)),step(.97,fract((wp.x+floor(wp.z*.62)*.7)*.75)));
 float grain=fract(sin(dot(floor(wp.xz*60.),vec2(12.9898,78.233)))*43758.54);
 diffuseColor.rgb*=.84+grain*.17;diffuseColor.rgb*=1.-line*.28;
 float lamps=pow(max(0.,cos(wp.z*1.1)),12.)*.18;diffuseColor.rgb+=vec3(.7,.4,.13)*lamps;`);};
 mesh(ribbon,paving);
 // Raised masonry edge, flowers and small lanterns along both shores.
 for(let z=-26;z<94;z+=1.45){for(const side of [-1,1]){
  const x=pathX(z)+side*3.65;box(edge,x,.63,z,.9,.85,1.47);
  bouquet(x,1.14,z,.62);
  if(Math.round((z+26)/1.45)%4===0){lantern(x,z,.75);const xx=x+side*.65;item(trunks,xx,2.1,z,.08,2,.08);item(leaves,xx,3.25,z,.48,2,.48);}
 }}
 // The circular ceremony terrace and its concentric stone steps.
 for(let i=0;i<4;i++)mesh(new T.CylinderGeometry(7-i*.28,7-i*.28,.22,72),i===3?paving:edge,0,.22+i*.23,-30);
 const arch=new T.Group();arch.position.set(0,1.1,-32);scene.add(arch);
 const archPoints=[];archPoints.push(new T.Vector3(-3.5,0,0),new T.Vector3(-3.5,3.8,0));for(let i=0;i<=48;i++){const a=Math.PI-i/48*Math.PI;archPoints.push(new T.Vector3(Math.cos(a)*3.5,3.8+Math.sin(a)*3.5,0));}archPoints.push(new T.Vector3(3.5,0,0));
 const curve=new T.CatmullRomCurve3(archPoints);mesh(new T.TubeGeometry(curve,160,.09,8,false),gold,0,0,0,1,1,1,arch);
 for(let i=0;i<150;i++){const p=curve.getPoint(i/149);bouquet(p.x,1.1+p.y,-32,.46);}
 for(let x=-2.4;x<=2.4;x+=1.2){const top=1.1+3.8+Math.sqrt(12.25-x*x),end=top-1.2-random()*1.3;box(gold,x,(top+end)/2,-32,.012,top-end,.012);ball(lampMat,x,end,-32,.065,.14);glow(x,end,-32,1.6,.42);}
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2;if(Math.sin(a)>.65)continue;const x=Math.cos(a)*6.3,z=-30+Math.sin(a)*6.3;box(edge,x,1.6,z,.23,1.4,.23);if(i%3===0)lantern(x,z,1.1,2.25);else bouquet(x,2.2,z,.65);}
 for(const x of [-3.5,3.5]){lantern(x,-28,1.6);bouquet(x,1.2,-29,1.1);}
 // Garden branches sweep through foreground naturally as the camera passes them.
 function branch(a,b,r){const v=new T.Vector3().subVectors(b,a);const m=mesh(new T.CylinderGeometry(r*.6,r,v.length(),7),bark,...a.clone().add(b).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());}
 for(const [tx,tz,side] of [[-7,64,1],[8,40,-1],[-8,8,1],[9,-20,-1]]){
  const root=new T.Vector3(pathX(tz)+tx,1,tz),top=root.clone().add(new T.Vector3(side,10,-1));branch(root,top,.5);
  for(let i=0;i<7;i++){const end=top.clone().add(new T.Vector3(side*(1+random()*6),random()*2-2,(random()-.5)*8));branch(top,end,.15);
   for(let j=0;j<55;j++){const x=end.x+(random()-.5)*4,y=end.y+(random()-.5)*2,z=end.z+(random()-.5)*4;item(leaves,x,y,z,.22+random()*.25,.09,.38+random()*.4,random()*6.28,random());if(j%4===0)flower(x,y,z,.23);}
   if(i%2===0){const yy=end.y-1.8;box(gold,end.x,(end.y+yy)/2,end.z,.015,1.8,.015);lantern(end.x,end.z,.7,yy);}
  }
 }
 // Distant islands, cypress silhouettes and inhabited shoreline.
 for(let i=0;i<80;i++){
  const a=random()*Math.PI*2,r=50+random()*100,x=Math.cos(a)*r,z=Math.sin(a)*r-40;
  if(Math.abs(x)<15&&z>-35)continue;
  const size=2+random()*7;ball(green,x,-1,z,size,2,size*.65);
  for(let j=0;j<5;j++){const xx=x+(random()-.5)*size,zz=z+(random()-.5)*size;item(leaves,xx,1.3+random(),zz,.35,1.5+random()*1.7,.35);}
  if(i%2===0){box(ivory,x,1,z,1.4,1.5,1.2);mesh(new T.ConeGeometry(1.3,.8,4),bark,x,2.1,z).rotation.y=Math.PI/4;box(lampMat,x,.95,z+.62,.38,.6,.01);glow(x,1,z+.8,1.5,.2);}
 }
 // Irregular distant mountains rather than repeated cones.
 for(let row=0;row<3;row++){
  const geo=new T.PlaneGeometry(600,45,100,1),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i);if(pos.getY(i)>0)pos.setY(i,7+Math.pow(Math.sin(x*.022+row)*.5+.5,2)*20+Math.sin(x*.07+row)*3+random()*3);else pos.setY(i,-8);}
  geo.computeVertexNormals();mesh(geo,mat(['#182b44','#142b43','#10283b'][row],{side:T.DoubleSide}),0,0,-220+row*28);
 }
 // Night sky, moon and water share the same world-space light direction.
 const starPos=[];for(let i=0;i<1100;i++){const a=random()*Math.PI*2,e=random()*1.3+.08,r=250;starPos.push(Math.cos(a)*Math.cos(e)*r,Math.sin(e)*r,Math.sin(a)*Math.cos(e)*r);}
 const starsGeo=new T.BufferGeometry();starsGeo.setAttribute('position',new T.Float32BufferAttribute(starPos,3));scene.add(new T.Points(starsGeo,new T.PointsMaterial({color:'#dae5f2',size:.20,transparent:true,opacity:.8,sizeAttenuation:true})));
 ball(new T.MeshBasicMaterial({color:'#fff0cd'}),-65,63,-190,4);glow(-65,63,-190,25,.15);
 const waterMaterial=new T.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:`varying vec3 p;void main(){p=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`,fragmentShader:`varying vec3 p;uniform float time;void main(){
 float n=sin(p.x*2.3+sin(p.z*1.7+time*.4))*sin(p.z*9.+sin(p.x*.8));
 vec3 c=mix(vec3(.025,.065,.12),vec3(.065,.14,.23),n*.5+.5);
 float moon=exp(-pow((p.x+22.)/(5.+abs(p.z)*.07),2.))*pow(max(0.,n),12.);
 c+=vec3(.48,.45,.31)*moon*.6;
 float path=sin((p.z+28.)/110.*3.14159*1.7)*7.;
 float gold=exp(-abs(abs(p.x-path)-4.8)*.6)*pow(max(0.,sin(p.z*3.+sin(p.x*12.))),10.);
 c+=vec3(.7,.36,.08)*gold*.6;gl_FragColor=vec4(c,1.);}`});
 const water=mesh(new T.PlaneGeometry(650,650),waterMaterial,0,-.15,0);water.rotation.x=-Math.PI/2;
 // Organic miniature couple with consistently linked body parts; no raster character swap.
 const couple=new T.Group();scene.add(couple);const suit=mat('#15263e'),skin=mat('#bf927b'),hair=mat('#241d19'),dress=mat('#f2e7d4',{roughness:.45});
 function person(x,bride){const g=new T.Group();g.position.x=x;couple.add(g);
  if(bride){const points=[[1.05,0],[.94,.18],[.65,.65],[.37,1.18],[.25,1.62],[.37,1.94],[.34,2.12]].map(p=>new T.Vector2(...p));mesh(new T.LatheGeometry(points,40),dress,0,0,0,1,1,1,g);
   ball(dress,0,.03,.5,1.05,.07,1.8,g);
   const veilmat=new T.MeshStandardMaterial({color:'#fff7e8',transparent:true,opacity:.32,side:T.DoubleSide,roughness:.8,depthWrite:false});
   const vgeo=new T.PlaneGeometry(1.25,2.5,16,20),pos=vgeo.attributes.position;for(let i=0;i<pos.count;i++){const y=pos.getY(i);pos.setX(i,pos.getX(i)*(1.3-y*.35));pos.setZ(i,Math.sin(pos.getX(i)*10)*.04+(1.25-y)*.33);}vgeo.computeVertexNormals();mesh(vgeo,veilmat,0,1.3,.12,1,1,1,g);
  }else{ball(suit,0,1.65,0,.47,.65,.27,g);for(const side of [-1,1]){box(suit,side*.2,.57,0,.28,1.15,.3,g);ball(hair,side*.2,.08,-.06,.18,.09,.29,g);}box(ivory,0,1.98,-.26,.14,.35,.025,g);}
  ball(skin,0,2.43,0,.27,.34,.25,g);ball(hair,0,2.59,.05,.28,.23,.27,g);if(bride){ball(hair,0,2.35,.24,.21,.19,.16,g);for(let j=0;j<5;j++)ball(white,(j-2)*.07,2.4,.35,.055,.06,.04,g);}
  for(const side of [-1,1]){const arm=ball(bride?skin:suit,side*.43,1.58,0,.12,.5,.13,g);arm.rotation.z=side*.15;ball(skin,side*.49,1.12,0,.11,.14,.10,g);}
  return g;
 }
 person(-.56,false);person(.52,true);
 // Batched meshes keep thousands of flowers and leaves affordable on mobile.
 instances(unitSphere,green,leaves);instances(unitSphere,white,petals);instances(unitSphere,gold,centres);
 if(trunks.length)instances(boxGeo,bark,trunks);
 const glowCanvas=document.createElement('canvas');glowCanvas.width=64;glowCanvas.height=64;const gc=glowCanvas.getContext('2d'),gr=gc.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,232,179,1)');gr.addColorStop(.12,'rgba(255,197,105,.6)');gr.addColorStop(.4,'rgba(255,173,70,.13)');gr.addColorStop(1,'rgba(255,170,60,0)');gc.fillStyle=gr;gc.fillRect(0,0,64,64);const tex=new T.CanvasTexture(glowCanvas);
 for(const a of glows){const s=new T.Sprite(new T.SpriteMaterial({map:tex,color:'#ffdc9a',transparent:true,opacity:a.opacity,depthWrite:false,blending:T.AdditiveBlending}));s.position.set(a.x,a.y,a.z);s.scale.set(a.size,a.size,1);scene.add(s);}
 const stops=[{z:70,h:18,d:15,offset:0},{z:54,h:8,d:13,offset:7},{z:36,h:14,d:21,offset:9},{z:16,h:9,d:16,offset:-9},{z:-3,h:8,d:14,offset:-9},{z:-18,h:7,d:14,offset:-8},{z:-28,h:6,d:15,offset:0}];
 const ease=t=>t*t*t*(t*(t*6-15)+10),lerp=(a,b,t)=>a+(b-a)*t;
 let w=0,h=0,lastProgress=-1;function render(progress,width,height){
  if(progress===lastProgress&&width===w&&height===h)return renderer.domElement;lastProgress=progress;
  if(width!==w||height!==h){w=width;h=height;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  const p=Math.max(0,Math.min(6,progress)),i=Math.min(5,Math.floor(p)),u=ease(p-i),a=stops[i],b=stops[i+1],z=lerp(a.z,b.z,u),x=pathX(z),heightCam=lerp(a.h,b.h,u),d=lerp(a.d,b.d,u),offset=lerp(a.offset,b.offset,u)*(w/h<1?.18:1);
  couple.position.set(x,1.03,z);couple.rotation.y=.03*Math.sin(p*Math.PI*2);camera.position.set(x+offset*.3,heightCam,z+d);
  camera.lookAt(x+offset,2.4,z-7);waterMaterial.uniforms.time.value=p*8;renderer.render(scene,camera);return renderer.domElement;
 }
 return {render,renderer,scene,camera};
}
