import test from 'node:test';
import assert from 'node:assert/strict';
import {stageLayout,keyboardVisible} from '../public/layout.mjs';

test('couple remains inside its reserved stage across phone, tablet and PC sizes',()=>{
 for(const [width,height,stacked] of [[296,380,true],[366,656,true],[744,836,true],[816,222,false],[1318,580,false],[1392,712,false],[1872,892,false]]){
  const m=stageLayout(width,height,stacked);
  assert.ok(m.couple>0);
  assert.ok(m.couple*1.65+m.bottom<=(stacked?m.floor:height),`${width}x${height}: character exceeds stage`);
  assert.ok(m.couple<=width);
  if(stacked){assert.ok(height-m.floor>=height*.65);assert.ok(m.garden<=width);}
 }
});
test('keyboard reserves the stage for the form and ignores ordinary browser chrome changes',()=>{
 assert.equal(keyboardVisible(844,420,true),true);
 assert.equal(keyboardVisible(844,770,true),false);
 assert.equal(keyboardVisible(844,420,false),false);
 const m=stageLayout(366,280,true,true);
 assert.equal(m.floor,0);
 assert.equal(m.couple,0);
});
