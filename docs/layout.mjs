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
const feet={western:[609,609,608,585,584,585],ceremony:[611,613,612,579,578,580],evening:[612,614,615,581,580,580]};
export function spriteFootOffset(outfit,pose){return 1-(feet[outfit]||feet.western)[pose]/627;}
const left={western:[19,40,37,48,60,27],ceremony:[18,39,34,45,54,26],evening:[17,36,30,38,46,23]};
export function spriteClipLeft(outfit,pose){return Math.max(0,(left[outfit]||left.western)[pose]-2)/418;}
