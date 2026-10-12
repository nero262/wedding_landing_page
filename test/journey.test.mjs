import test from 'node:test';
import assert from 'node:assert/strict';
import {timelineValue,timelineScroll} from '../public/journey.mjs';

test('seeking crosses chapter numbers continuously and round-trips the document position',()=>{
 const max=23000;
 for(let value=0;value<=6;value+=.013){
  const position=timelineScroll(value,max);
  assert.ok(Math.abs(timelineValue(position,max)-value)<1e-10);
 }
 for(let stop=1;stop<6;stop++)assert.ok(timelineScroll(stop+1e-7,max)-timelineScroll(stop-1e-7,max)<.001);
 assert.equal(timelineValue(50,0),0);assert.equal(timelineScroll(6,0),0);
});
