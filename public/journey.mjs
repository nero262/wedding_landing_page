import {clamp} from './camera.mjs';
export function timelineValue(scroll,maxScroll,count=7){return maxScroll>0?clamp(scroll/maxScroll)*(count-1):0;}
export function timelineScroll(value,maxScroll,count=7){return Math.max(0,maxScroll)*clamp(value/(count-1));}
