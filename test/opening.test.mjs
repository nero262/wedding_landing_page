import test from 'node:test';
import assert from 'node:assert/strict';
import {paperBridgeFrames} from '../public/opening.mjs';
import {portalFrame} from '../public/camera.mjs';
test('the opening paper resolves to the actual room aperture on phone and desktop',()=>{
 const rect={left:25,top:110,width:296,height:186};
 for(const [width,height] of [[320,568],[390,844],[844,390],[1440,900]]){
  const [start,end]=paperBridgeFrames(rect,width,height),door=portalFrame(width,height);
  assert.equal(parseFloat(start.left),rect.left);assert.equal(parseFloat(start.width),rect.width);
  assert.ok(Math.abs(parseFloat(end.left)+parseFloat(end.width)/2-width/2)<1e-10);
  assert.ok(Math.abs(parseFloat(end.top)+parseFloat(end.height)-(door.y+door.height*775/800))<1e-10);
  assert.ok(parseFloat(end.top)>=0&&parseFloat(end.width)>0);
  assert.equal(end.opacity,0);
 }
});
