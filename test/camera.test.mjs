import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cameraState,journeyProgress,readingRange,portalFrame,HILL_DEPTHS,projectPlane} from '../public/camera.mjs';
const ranges=Array.from({length:7},(_,i)=>readingRange(i*2400,i*2400+700,800));
test('the camera stays still for the whole time each paper is visible',()=>{
 for(let i=0;i<ranges.length;i++)for(let y=ranges[i].start;y<=ranges[i].end;y+=37){
  assert.equal(journeyProgress(y,ranges),i);
  assert.equal(cameraState(journeyProgress(y,ranges)).z,cameraState(i).z);
 }
});
test('blank gaps advance monotonically and scrolling backward retraces the same camera route',()=>{
 const forward=[];let last=-1;
 for(let y=0;y<=16000;y+=20){const progress=journeyProgress(y,ranges);assert.ok(progress>=last);last=progress;forward.push(cameraState(progress));}
 for(let n=forward.length-1;n>=0;n--)assert.deepEqual(cameraState(journeyProgress(n*20,ranges)),forward[n]);
});
test('room has fully departed before the couple moves away from the porch',()=>{
 for(let n=0;n<=60;n++){const state=cameraState(n/100);assert.equal(state.actor.x,.5);assert.equal(state.actor.y,.92);assert.equal(state.actor.size,1.32);}
 assert.equal(cameraState(.6).room,0);assert.ok(cameraState(.8).actor.x>.5);
});
test('camera and actors are continuous with gentle departures and arrivals at all stops',()=>{
 for(let i=1;i<6;i++){
  const before=cameraState(i-1e-5),after=cameraState(i+1e-5);
  for(const key of ['z','x','elevation','room','roll'])assert.ok(Math.abs(before[key]-after[key])<1e-7,key);
  for(const key of ['x','y','size','turn','portal'])assert.ok(Math.abs(before.actor[key]-after.actor[key])<1e-7,key);
  const stop=cameraState(i),delta=.0001;
  for(const near of [cameraState(i-delta),cameraState(i+delta)])
   assert.ok(Math.abs(near.roll-stop.roll)/delta<1e-5,'banking must settle before every reading stop');
 }
 for(let n=0;n<=600;n++){const s=cameraState(n/100);assert.ok(Math.abs(s.poses.reduce((a,b)=>a+b)-1)<1e-10);assert.ok(s.poses.every(x=>x>=0&&x<=1));}
});
test('nine depth planes approach consistently and both portals share the same aspect and framing',()=>{
 assert.equal(HILL_DEPTHS.length,9);
 assert.ok(new Set(HILL_DEPTHS).size===9);
 for(const depth of HILL_DEPTHS){const a=projectPlane(depth,0),b=projectPlane(depth,depth-12);assert.ok(b.scale>a.scale);assert.equal(projectPlane(depth,depth+1).opacity,0);}
 for(const [w,h] of [[390,844],[844,390],[1440,900]]){const f=portalFrame(w,h);assert.ok(Math.abs(f.width/f.height-.75)<1e-10);assert.ok(f.x>=0&&f.y>=0);assert.ok(f.y+f.height<=h);}
 assert.equal(cameraState(6).portalScale,1);
});
test('pose changes never show duplicate faces and settle sharp at every reading stop',()=>{
 for(let n=0;n<=1200;n++){
  const state=cameraState(n/200);
  assert.equal(state.poses.filter(Boolean).length,1);
  assert.ok(state.poseBlur>=0&&state.poseBlur<=6);
 }
 for(let stop=0;stop<=6;stop++)assert.equal(cameraState(stop).poseBlur,0);
 const before=cameraState(2.51999),after=cameraState(2.52001);
 assert.notDeepEqual(before.poses,after.poses);
 assert.ok(before.poseBlur>5.99&&after.poseBlur>5.99,'the pose edit occurs under peak blur');
});
