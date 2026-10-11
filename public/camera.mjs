export const CAMERA_STOPS=[0,18,41,66,92,119,145];
export const HILL_DEPTHS=[27,38,51,67,84,104,128,139,192];
export const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
export const ease=t=>{t=clamp(t);return clamp(t*t*t*(t*(t*6-15)+10));};
export const mix=(a,b,t)=>a+(b-a)*t;
// A C2-continuous breath: position, velocity and acceleration all settle at each cut-free stop.
export const travelPulse=t=>{t=clamp(t);return 64*t*t*t*(1-t)*(1-t)*(1-t);};
export function boundedProgress(value,count=7){return clamp(Number(value)||0,0,count-1);}
// The camera is held for the entire visible reading range. Only blank gaps advance it.
export function journeyProgress(scroll,ranges){
 if(!ranges.length)return 0;
 if(scroll<=ranges[0].end)return 0;
 for(let i=1;i<ranges.length;i++){
  const previous=ranges[i-1],current=ranges[i];
  if(scroll<current.start)return i-1+clamp((scroll-previous.end)/Math.max(1,current.start-previous.end));
  if(scroll<=current.end)return i;
 }
 return ranges.length-1;
}
export function readingRange(top,bottom,height){return {start:Math.max(0,top-height),end:Math.max(0,bottom)};}
export function portalFrame(width,height){
 const narrow=width<720;
 const frameWidth=Math.min(width*(narrow?.98:.62),height*.65,Math.max(0,height-80)*.75),frameHeight=frameWidth*4/3;
 const ground=Math.min(height*.95-frameHeight/32,height-80);
 return {x:(width-frameWidth)/2,y:ground-frameHeight*775/800,width:frameWidth,height:frameHeight};
}
// Every value is a pure function of scroll progress, so reversing retraces the same route.
export function cameraState(value){
 const progress=boundedProgress(value),base=Math.min(5,Math.floor(progress)),t=progress-base,u=ease(t);
 const x=[0,.35,.85,1.1,.9,.45,0],elevation=[3,3.02,3.08,3.04,2.98,3.01,3];
 const actorX=[.5,.79,.20,.80,.20,.79,.5],actorY=[.92,.9,.89,.9,.89,.9,.92];
 const actorMix=base===0?ease((t-.62)/.38):u;
 const poseIndices=[0,0,1,2,3,4,5];
 const actorBreath=travelPulse(actorMix);
 // A brief hidden edit under motion blur preserves one face per person throughout.
 const poses=Array(6).fill(0);poses[poseIndices[base+(base>0&&t>=.52?1:0)]]=1;
 return {
  progress,active:Math.min(6,Math.round(progress)),z:mix(CAMERA_STOPS[base],CAMERA_STOPS[base+1],u),
  x:mix(x[base],x[base+1],u),elevation:mix(elevation[base],elevation[base+1],u),
  roll:-travelPulse(t)*.0008,
  room:base===0?1-ease((t-.36)/.24):0,roomScale:base===0?1+ease(t/.6)*2.7:3.7,
  actor:{x:mix(actorX[base],actorX[base+1],actorMix),y:mix(actorY[base],actorY[base+1],actorMix)-actorBreath*.016,size:mix(base===0?1.32:1,1,actorMix)*(1-actorBreath*.10),turn:actorBreath*(base%2?1.2:-1.2),portal:base===0?1-actorMix:base===5?actorMix:0},
  poses,poseBlur:base>0?6*travelPulse((t-.47)/.10):0,portalScale:22/(167-mix(CAMERA_STOPS[base],CAMERA_STOPS[base+1],u))
 };
}
// Used by all scenery planes; near objects expand and leave the frame as the lens passes.
export function projectPlane(depth,cameraZ){const distance=depth-cameraZ;return {distance,scale:distance>0?40/distance:0,opacity:ease((distance-3)/8)};}
