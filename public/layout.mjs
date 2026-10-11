// Sizes are based on the actual stage, including browser chrome and keyboard changes.
export function stageLayout(width,height,stacked,keyboard=false){
 const w=Math.max(0,width),h=Math.max(0,height);
 if(stacked){
  const floor=keyboard?0:Math.min(240,h*(h<300?.26:.34));
  const couple=Math.max(0,Math.min(144,(floor-24)/1.65,w*.44));
  return {floor,couple,bottom:12,garden:Math.min(w,couple*2.2+24)};
 }
 return {floor:0,couple:Math.max(0,Math.min(380,w*.28,h*.74/1.65)),bottom:h*.12,garden:0};
}
export function keyboardVisible(baseline,current,editing){return editing&&baseline-current>140&&current<baseline*.78;}
