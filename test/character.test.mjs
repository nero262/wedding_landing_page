import {test} from 'node:test';
import assert from 'node:assert/strict';
import {characterState} from '../public/character.mjs';
import {journeyProgress,readingRange} from '../public/camera.mjs';

const motionKeys=['occlusion','lean','veil','sleeve','blink','faceTurn','blur'];
const stopOutfits=['western','western','western','ceremony','evening','evening','evening'];
const stopPoses=[0,0,1,2,3,4,5];

test('reading stops retain the right ceremonial wardrobe, calm pose and still gestures',()=>{
 for(let stop=0;stop<=6;stop++){
  const state=characterState(stop);
  assert.equal(state.outfit,stopOutfits[stop]);
  assert.equal(state.pose,stopPoses[stop]);
  for(const key of motionKeys)assert.equal(state[key],0,`${key} at stop ${stop}`);
 }
});

test('wardrobe changes only at the two concealed edits, independently of poses and light theme',()=>{
 const wardrobe=[];
 for(let n=0;n<=6000;n++){
  const state=characterState(n/1000);
  assert.equal(typeof state.outfit,'string');
  assert.ok(['western','ceremony','evening'].includes(state.outfit));
  assert.ok(Number.isInteger(state.pose)&&state.pose>=0&&state.pose<6);
  assert.equal('outfitWeights' in state,false);
  assert.equal('poseWeights' in state,false);
  if(!wardrobe.length||wardrobe.at(-1)!==state.outfit)wardrobe.push(state.outfit);
 }
 assert.deepEqual(wardrobe,['western','ceremony','evening']);
 for(const [cut,before,after]of [[2.52,'western','ceremony'],[3.52,'ceremony','evening']]){
  assert.equal(characterState(cut-1e-6).outfit,before);
  assert.equal(characterState(cut).outfit,after);
  assert.equal(characterState(cut+1e-6).outfit,after);
 }
});

test('a pose or wardrobe cut is already concealed before changing and clears before the next hold',()=>{
 for(let leg=1;leg<6;leg++){
  const before=characterState(leg+.52-1e-6),after=characterState(leg+.52+1e-6);
  assert.notEqual(before.pose,after.pose);
  assert.ok(before.occlusion>.999&&after.occlusion>.999);
  assert.ok(before.blur>5.99&&after.blur>5.99);
  assert.equal(characterState(leg+.43).occlusion,0);
  assert.equal(characterState(leg+.61).occlusion,0);
  assert.ok(characterState(leg+.50).occlusion>0,'concealment begins before the cut');
 }
});

test('the first door passage contains no gesture before the room has gone',()=>{
 for(let n=0;n<=62;n++){
  const state=characterState(n/100);
  assert.equal(state.outfit,'western');assert.equal(state.pose,0);
  for(const key of motionKeys)assert.equal(state[key],0,`${key} during door passage`);
 }
 assert.ok(characterState(.81).lean>0);
 assert.equal(characterState(.81).occlusion,0,'the first leg needs no sprite edit');
});

test('scrolling back retraces the exact character state and visible paper ranges stay held',()=>{
 const forward=Array.from({length:601},(_,n)=>characterState(n/100));
 for(let n=600;n>=0;n--)assert.deepEqual(characterState(n/100),forward[n]);
 const ranges=Array.from({length:7},(_,i)=>readingRange(i*2400,i*2400+700,800));
 for(let i=0;i<ranges.length;i++)for(let y=ranges[i].start;y<=ranges[i].end;y+=37)
  assert.deepEqual(characterState(journeyProgress(y,ranges)),characterState(i));
});

test('gestures remain small, blink is one brief pulse, and reduced motion keeps the story without effects',()=>{
 for(let n=0;n<=1200;n++){
  const p=n/200,state=characterState(p),still=characterState(p,true);
  assert.ok(Math.abs(state.lean)<=.5);
  assert.ok(Math.abs(state.veil)<=2&&Math.abs(state.sleeve)<=2);
  assert.ok(Math.abs(state.faceTurn)<=.5);
  assert.ok(state.occlusion>=0&&state.occlusion<=1);
  assert.ok(state.blink>=0&&state.blink<=.18);
  assert.ok(state.blur>=0&&state.blur<=6);
  assert.equal(still.outfit,state.outfit);assert.equal(still.pose,state.pose);
  for(const key of motionKeys)assert.equal(still[key],0,`${key} in reduced motion`);
 }
 assert.ok(characterState(1.75).blink>0);
 assert.equal(characterState(1.65).blink,0);
 assert.equal(characterState(1.85).blink,0);
 assert.equal(characterState(2.75).blink,0);
 assert.deepEqual(characterState(-10),characterState(0));
 assert.deepEqual(characterState(10),characterState(6));
 assert.deepEqual(characterState(Number.NaN),characterState(0));
});
