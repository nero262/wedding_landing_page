import {portalFrame,mix} from './camera.mjs';
export function keyboardVisible(baseline,current,editing){return editing&&baseline-current>140&&current<baseline*.78;}
export function actorLayout(width,height,actor,stacked=false,keyboard=false){
 const portal=portalFrame(width,height),portalGround=portal.y+portal.height*775/800;
 const regular=Math.min(260,width*(stacked?.28:.20),height*(stacked?.28:.39)/1.5);
 const base=mix(regular,Math.min(260,portal.width*.44),actor.portal||0);
 const w=keyboard?0:Math.max(0,base*actor.size);
 const foot=Math.min(mix(height*actor.y,portalGround,actor.portal||0),height-72);
 return {width:w,left:width*actor.x-w/2,top:foot-w*1.5,foot};
}

// Bottom edges of the connected couple in each atlas tile; transparent padding varies by pose.
const feet={day:[602,602,601,587,587,581],dusk:[604,603,602,589,589,583],night:[604,605,604,589,589,584]};
export function spriteFootOffset(theme,pose){return 1-(feet[theme]||feet.day)[pose]/627;}
const left={day:[18,46,61,23,52,48],dusk:[18,44,58,21,49,47],night:[18,43,59,21,50,47]};
export function spriteClipLeft(theme,pose){return Math.max(0,(left[theme]||left.day)[pose]-2)/418;}
