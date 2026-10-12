import test from 'node:test';
import assert from 'node:assert/strict';
import {characterClips,FACE_ATLAS} from '../public/character-parts.mjs';
import {spriteFootOffset,actorLayout} from '../public/layout.mjs';
import {cameraState} from '../public/camera.mjs';

test('wardrobe changes keep exactly the same face crop and screen anchor for every pose',()=>{
 assert.ok(FACE_ATLAS.endsWith('.webp'));
 for(let pose=0;pose<6;pose++){
  const reference=characterClips(pose,'western');
  for(const outfit of ['ceremony','evening']){
   const parts=characterClips(pose,outfit);
   assert.equal(parts.groom,reference.groom);assert.equal(parts.bride,reference.bride);
   assert.deepEqual(parts.origins,reference.origins);
   for(const [w,h,stacked]of [[390,844,true],[1440,900,false]]){
    const actor=actorLayout(w,h,cameraState(3).actor,stacked),tileHeight=actor.width*1.5;
    const faceTop=actor.top+(spriteFootOffset(outfit,pose)+parts.headShift)*tileHeight;
    assert.ok(Math.abs(faceTop-(actor.top+spriteFootOffset('western',pose)*tileHeight))<1e-10);
   }
  }
 }
});

test('veil is limited to the western travelling poses and eye hints use measured local regions',()=>{
 for(const pose of [0,1])assert.ok(characterClips(pose,'western').veil);
 for(let pose=0;pose<6;pose++){
  for(const outfit of ['ceremony','evening'])assert.equal(characterClips(pose,outfit).veil,'');
  const regions=characterClips(pose,'western').eyes;
  assert.equal(regions.length,[1,4].includes(pose)?2:0);
  for(const[x,y,w,h]of regions){assert.ok(x>0&&y>0&&x+w<1&&y+h<.4);}
 }
});
