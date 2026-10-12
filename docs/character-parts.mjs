import {spriteFootOffset} from './layout.mjs';
// All faces are sampled from this single atlas, including when the clothes change.
export const FACE_ATLAS='couple-western.webp';
const groom=[
 [[70,102],[81,69],[111,44],[150,34],[188,49],[207,78],[210,115],[193,146],[169,170],[146,182],[127,184],[103,173],[84,151],[70,134]],
 [[84,102],[94,70],[127,46],[167,35],[205,50],[224,80],[225,115],[210,149],[187,172],[163,188],[144,191],[121,181],[103,161],[85,141]],
 [[64,112],[72,79],[103,54],[143,42],[184,53],[206,80],[212,114],[196,148],[174,173],[149,192],[127,198],[105,187],[84,168],[66,147]],
 [[84,92],[94,55],[123,27],[164,17],[204,37],[221,72],[216,111],[190,142],[165,161],[143,168],[123,163],[104,149],[87,126]],
 [[88,91],[99,51],[135,22],[174,12],[214,35],[235,70],[227,111],[201,141],[176,157],[153,165],[132,161],[111,147],[91,126]],
 [[58,89],[66,53],[98,23],[140,11],[181,24],[205,53],[213,89],[196,123],[176,144],[156,156],[137,162],[115,158],[96,145],[75,129],[59,110]]
];
const bride=[
 [[198,163],[207,130],[231,109],[265,96],[298,102],[322,120],[335,149],[327,184],[309,212],[288,220],[275,230],[255,234],[237,226],[219,210],[205,188]],
 [[176,164],[188,132],[216,115],[248,108],[281,114],[307,137],[324,164],[316,194],[294,218],[270,225],[252,237],[232,239],[213,231],[193,214],[180,189]],
 [[178,157],[195,123],[221,107],[251,98],[285,107],[309,128],[324,159],[314,191],[291,215],[276,226],[255,234],[234,227],[214,211],[192,188]],
 [[193,121],[205,91],[231,72],[267,64],[299,77],[323,99],[337,128],[328,159],[309,180],[288,184],[276,197],[255,203],[237,196],[218,180],[202,158]],
 [[193,119],[204,90],[230,72],[264,65],[297,78],[321,102],[333,130],[322,162],[303,179],[286,187],[269,196],[249,198],[231,191],[212,174],[199,151]],
 [[185,106],[198,79],[225,59],[264,54],[295,65],[319,88],[333,116],[325,148],[308,169],[286,178],[273,190],[253,192],[233,184],[212,171],[196,149]]
];
const veils=[[[347,179],[365,197],[402,240],[405,271],[378,296],[353,273]],[[335,177],[361,203],[391,253],[377,288],[347,311],[330,279],[337,239]]];
const eyes={1:[[121,122,29,24],[168,132,30,25]],4:[[124,95,28,21],[170,107,28,19]]};
const normalize=points=>points.map(([x,y])=>[x/418,y/627]);
const path=points=>points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(7)} ${y.toFixed(7)}`).join(' ')+'Z';
const centroid=points=>points.reduce(([x,y],[a,b])=>[x+a/points.length,y+b/points.length],[0,0]);
const shrink=(points,yShift=0)=>{const[cx,cy]=centroid(points);return points.map(([x,y])=>[cx+(x-cx)*.982,cy+(y-cy)*.982+yShift]);};
export function characterClips(pose,outfit){
 const headShift=spriteFootOffset('western',pose)-spriteFootOffset(outfit,pose);
 const heads=[normalize(groom[pose]),normalize(bride[pose])];
 const veil=outfit==='western'&&veils[pose]?normalize(veils[pose]):[];
 const hem=[[.58,.68],[1,.68],[1,1],[.50,1]];
 return {
  headShift,groom:path(heads[0]),bride:path(heads[1]),hem:path(hem),veil:veil.length?path(veil):'',
  body:'M0 0H1V1H0Z '+heads.map(points=>path(shrink(points,headShift))).join(' ')+' '+path(hem)+(veil.length?' '+path(veil):''),
  origins:heads.map(centroid),eyes:(eyes[pose]||[]).map(([x,y,w,h])=>[x/418,y/627,w/418,h/627])
 };
}
export function initializeCharacterParts(poses){
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),defs=document.createElementNS(ns,'defs');
 svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');svg.classList.add('character-defs');svg.append(defs);document.body.append(svg);
 const makeClip=(id,d)=>{const clip=document.createElementNS(ns,'clipPath'),shape=document.createElementNS(ns,'path');clip.id=id;clip.setAttribute('clipPathUnits','objectBoundingBox');shape.setAttribute('d',d);shape.setAttribute('clip-rule','evenodd');clip.append(shape);defs.append(clip);return `url(#${id})`;};
 poses.forEach((pose,i)=>{for(const outfit of ['western','ceremony','evening']){
  const part=pose.querySelector('.outfit-'+outfit),geometry=characterClips(i,outfit),id=`character-${i}-${outfit}`;
  part.style.setProperty('--face-atlas',`url("${new URL('./assets/'+FACE_ATLAS,import.meta.url).href}")`);
  for(const kind of ['body','hem','veil','groom','bride']){
   const layer=part.querySelector(kind==='groom'||kind==='bride'?'.'+kind+'-head':'.doll-'+kind);
   if(!geometry[kind]){layer.style.display='none';continue;}
   layer.style.clipPath=makeClip(id+'-'+kind,geometry[kind]);
  }
  for(const [n,kind] of ['groom','bride'].entries()){
   const head=part.querySelector('.'+kind+'-head'),[x,y]=geometry.origins[n];head.style.transformOrigin=`${x*100}% ${y*100}%`;
  }
  part.querySelectorAll('.eye-lid').forEach((lid,n)=>{
   const eye=geometry.eyes[n];if(!eye){lid.style.display='none';return;}
   const[x,y,w,h]=eye;Object.assign(lid.style,{left:x*100+'%',top:y*100+'%',width:w*100+'%',height:h*100+'%'});
  });
 }});
}
