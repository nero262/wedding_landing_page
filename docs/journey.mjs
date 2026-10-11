import {clamp} from './camera.mjs';
export function timelineValue(scroll,maxScroll,count=7){return maxScroll>0?clamp(scroll/maxScroll)*(count-1):0;}
export function timelineScroll(value,maxScroll,count=7){return Math.max(0,maxScroll)*clamp(value/(count-1));}
// Keep fractional travel independent of browser scroll rounding and display refresh rate.
// Integrating the exponential velocity exactly also removes abrupt reading/gap speed changes.
export function advancePlayback(state,seconds,reading,height,maxScroll){
 const dt=clamp(seconds,0,.1),tau=.55,target=Math.max(0,height)/(reading?13:4.2),decay=Math.exp(-dt/tau);
 const distance=target*dt+(state.speed-target)*tau*(1-decay);
 return {position:clamp(state.position+distance,0,Math.max(0,maxScroll)),speed:target+(state.speed-target)*decay};
}
