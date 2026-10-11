import {test} from 'node:test';
import assert from 'node:assert/strict';
import {advanceCamera,cameraState,boundedProgress} from '../public/camera.mjs';
function run(rate){let state={position:0,velocity:0};for(let i=0;i<rate*2;i++)state=advanceCamera(state.position,state.velocity,4,1/rate);return state;}
test('camera convergence is independent of display refresh rate',()=>{
 const slow=run(30),fast=run(120);
 assert.ok(Math.abs(slow.position-fast.position)<1e-10);
 assert.ok(Math.abs(slow.velocity-fast.velocity)<1e-10);
 assert.ok(Math.abs(fast.position-4)<.001);
});
test('retargeting keeps motion continuous and converges after reversing',()=>{
 let state={position:0,velocity:0};
 for(let i=0;i<20;i++)state=advanceCamera(state.position,state.velocity,4,1/60);
 const before=state;state=advanceCamera(state.position,state.velocity,0,1/1000);
 assert.ok(Math.abs(state.position-before.position)<.01);
 assert.ok(Math.abs(state.velocity-before.velocity)<.2);
 for(let i=0;i<240;i++)state=advanceCamera(state.position,state.velocity,0,1/60);
 assert.ok(Math.abs(state.position)<.001);assert.ok(Math.abs(state.velocity)<.001);
});
test('every camera position keeps actors visible and permits only depth scene motion',()=>{
 for(let i=0;i<=500;i++){
  const view=cameraState(i/100);
  assert.ok(Math.abs(view.scenes.reduce((sum,s)=>sum+s.weight,0)-1)<1e-10);
  assert.ok(Math.abs(view.poses.reduce((sum,p)=>sum+p,0)-1)<1e-10);
  assert.ok(view.scenes[view.active].weight>=.5);
  assert.ok(view.scale>=1.02&&view.scale<=1.085);
  for(const scene of view.scenes){assert.match(scene.transform,/translateZ/);assert.doesNotMatch(scene.transform,/translateX|translateY|translate3d/);}
 }
 for(let i=0;i<6;i++){const view=cameraState(i);assert.equal(view.active,i);assert.equal(view.scenes[i].weight,1);assert.equal(view.poses[i],1);}
 assert.equal(boundedProgress(-1),0);assert.equal(boundedProgress(8),5);
});
test('lens and scenery do not jump at chapter boundaries',()=>{
 for(let i=1;i<5;i++){
  const left=cameraState(i-1e-5),middle=cameraState(i),right=cameraState(i+1e-5);
  assert.ok(Math.abs(left.scale-right.scale)<1e-5);
  assert.ok(Math.abs((middle.scale-left.scale)-(right.scale-middle.scale))<1e-8);
  assert.ok(Math.abs(left.gardenScale-right.gardenScale)<1e-5);
 }
});
