import {portalFrame} from './camera.mjs';
// The paper expands into the exact visible opening used by the room renderer.
export function paperBridgeFrames(rect,width,height){
 const frame=portalFrame(width,height);
 return [
  {left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,borderRadius:'2px',opacity:1},
  {left:`${frame.x+frame.width*117/600}px`,top:`${frame.y+frame.height*93/800}px`,width:`${frame.width*366/600}px`,height:`${frame.height*682/800}px`,borderRadius:'50% 50% 0 0 / 33% 33% 0 0',opacity:0}
 ];
}
