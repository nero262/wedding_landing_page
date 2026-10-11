export function keyboardVisible(baseline,current,editing){return editing&&baseline-current>140&&current<baseline*.78;}
export function actorLayout(width,height,actor,stacked=false,keyboard=false){
 const base=Math.min(260,width*(stacked?.24:.20),height*(stacked?.28:.39)/1.5);
 const w=keyboard?0:Math.max(0,base*actor.size);
 const foot=Math.min(height*actor.y,height-72);
 return {width:w,left:width*actor.x-w/2,top:foot-w*1.5,foot};
}
