import { boundedScene } from './depth.mjs';
export function boundedProgress(value,count=6){return boundedScene(value,count);}
const smooth=t=>t*t*(3-2*t);
const mixWindow=(t,a,b)=>smooth(Math.max(0,Math.min(1,(t-a)/(b-a))));
// Exact critically damped integration: retargeting preserves camera velocity.
export function advanceCamera(position,velocity,target,seconds){
 const dt=Math.max(0,Math.min(.1,seconds)),omega=6.5,decay=Math.exp(-omega*dt);
 const distance=position-target,travel=(velocity+omega*distance)*dt;
 return {position:target+(distance+travel)*decay,velocity:(velocity-omega*travel)*decay};
}
function lensAt(progress){
 const stops=[1.025,1.075,1.04,1.025,1.055,1.08];
 const i=Math.min(stops.length-2,Math.floor(progress)),t=progress-i;
 const a=stops[Math.max(0,i-1)],b=stops[i],c=stops[i+1],d=stops[Math.min(stops.length-1,i+2)];
 return Math.max(1.02,Math.min(1.085,.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)));
}
export function cameraState(value,count=6){
 const progress=boundedProgress(value,count),base=Math.floor(progress),fraction=progress-base;
 const dissolve=mixWindow(fraction,.28,.72),poseDissolve=mixWindow(fraction,.4,.82);
 const active=Math.min(count-1,base+(dissolve>=.5?1:0));
 return {
  progress,active,scale:lensAt(Math.min(5,progress)),subjectZ:progress*2,
  gardenScale:1+progress*.008,gardenZ:-28+progress*2,
  scenes:Array.from({length:count},(_,i)=>{
   const weight=i===base?1-dissolve:i===base+1?dissolve:0;
   const distance=progress-i;
   return {weight,transform:`translateZ(${(distance*100).toFixed(3)}px) scale(${Math.max(.8,Math.min(1.2,1+distance*.035)).toFixed(5)})`,filter:`blur(${((1-weight)*3).toFixed(3)}px)`};
  }),
  poses:Array.from({length:count},(_,i)=>i===base?1-poseDissolve:i===base+1?poseDissolve:0)
 };
}
