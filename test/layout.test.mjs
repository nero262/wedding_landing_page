import test from 'node:test';
import assert from 'node:assert/strict';
import {actorLayout,keyboardVisible} from '../public/layout.mjs';
import {cameraState,portalFrame} from '../public/camera.mjs';
test('actors remain fully inside portrait, landscape, tablet and desktop viewports',()=>{
 for(const [w,h,stacked] of [[320,568,true],[390,844,true],[768,1024,true],[844,390,false],[1366,768,false],[1920,1080,false]]){
  for(let p=0;p<=6;p+=.025){const m=actorLayout(w,h,cameraState(p).actor,stacked);assert.ok(m.top>=0);assert.ok(m.left>=0);assert.ok(m.left+m.width<=w);assert.ok(m.foot<=h-72);}
 }
});
test('opening and closing actors stand on the shared portal sill above the controls',()=>{
 for(const [w,h,stacked] of [[320,568,true],[390,844,true],[844,390,false],[1440,900,false]]){
  const frame=portalFrame(w,h),ground=frame.y+frame.height*775/800;
  for(const progress of [0,6]){
   const actor=actorLayout(w,h,cameraState(progress).actor,stacked);
   assert.ok(Math.abs(actor.foot-ground)<1e-10);
   assert.ok(actor.width<=frame.width*.61,'couple fits within the arch opening');
  }
 }
});
test('keyboard detection ignores browser chrome and hides the decorative actors while editing',()=>{
 assert.equal(keyboardVisible(844,420,true),true);assert.equal(keyboardVisible(844,770,true),false);assert.equal(keyboardVisible(844,420,false),false);
 assert.equal(actorLayout(390,844,cameraState(4).actor,true,true).width,0);
});
