import test from 'node:test';
import assert from 'node:assert/strict';
import {advancePlayback,timelineValue,timelineScroll} from '../public/journey.mjs';

test('seeking crosses chapter numbers continuously and round-trips the document position',()=>{
 const max=23000;
 for(let value=0;value<=6;value+=.013){
  const position=timelineScroll(value,max);
  assert.ok(Math.abs(timelineValue(position,max)-value)<1e-10);
 }
 for(let stop=1;stop<6;stop++)assert.ok(timelineScroll(stop+1e-7,max)-timelineScroll(stop-1e-7,max)<.001);
 assert.equal(timelineValue(50,0),0);assert.equal(timelineScroll(6,0),0);
});

test('playback keeps fractional travel and follows the same timing at 30, 60 and 120 Hz',()=>{
 const run=hz=>{
  let state={position:0,speed:0};
  for(const [reading,seconds] of [[true,3],[false,2],[true,3]])
   for(let frame=0;frame<seconds*hz;frame++)state=advancePlayback(state,1/hz,reading,568,30000);
  return state;
 };
 const reference=run(30);
 for(const hz of [60,120]){
  const state=run(hz);
  assert.ok(Math.abs(state.position-reference.position)<1e-8);
  assert.ok(Math.abs(state.speed-reference.speed)<1e-8);
 }
 let state={position:500,speed:568/13};
 for(let frame=0;frame<120;frame++)state=advancePlayback(state,1/120,true,568,30000);
 assert.ok(state.position>540,'fractional steps must accumulate despite rounded browser scroll positions');
});

test('reading-speed changes ease in and playback stops exactly at the document end',()=>{
 const initial={position:500,speed:568/13};
 const next=advancePlayback(initial,.001,false,568,30000);
 assert.ok(next.speed>initial.speed&&next.speed-initial.speed<1);
 assert.ok(next.position-initial.position<.05);
 const end=advancePlayback({position:999.99,speed:100},.1,false,568,1000);
 assert.equal(end.position,1000);
});
