import {clamp,ease,travelPulse,boundedProgress} from './camera.mjs';

const STOP_POSES=[0,0,1,2,3,4,5];
const CUT=.52;
const EDIT_START=.44,EDIT_END=.60;
// A single restrained gesture per travel leg. Units: degrees, CSS pixels, degrees.
// These are render hints for the illustrated layers, not a skeletal character rig.
const GESTURES=[
 {lean:.18,veil:.8,sleeve:0,faceTurn:0},
 {lean:-.35,veil:1.6,sleeve:0,faceTurn:-.25},
 {lean:.2,veil:0,sleeve:-.8,faceTurn:.1},
 {lean:-.15,veil:.6,sleeve:.8,faceTurn:0},
 {lean:.25,veil:.9,sleeve:0,faceTurn:.2},
 {lean:-.4,veil:0,sleeve:.6,faceTurn:.15}
];
const STILL={occlusion:0,lean:0,veil:0,sleeve:0,blink:0,faceTurn:0,blur:0};

/**
 * One outfit and one pose at every scroll position, reproducible in either direction.
 * `occlusion` is a 0..1 concealment hint for a brief edit; `blur` is CSS pixels.
 * `blink` is an optional 0..0.18 eye-overlay hint. It does not animate source eyes.
 * No clock, frame loop, DOM, random state or playback history is involved.
 */
export function characterState(value,reduced=false){
 const progress=boundedProgress(value);
 const leg=Math.min(5,Math.floor(progress)),t=progress-leg;
 // Compare the global boundary so exact .52 cuts do not depend on subtraction rounding.
 const afterCut=leg>0&&progress>=leg+CUT;
 const pose=STOP_POSES[leg+(afterCut?1:0)];
 const outfit=progress<2+CUT?'western':progress<3+CUT?'ceremony':'evening';
 if(reduced)return {outfit,pose,...STILL};

 // The room leaves at .60. The first gesture begins only at .62, with settled edges.
 const gesturePhase=leg===0?clamp((t-.62)/.38):t;
 const gesture=clamp(travelPulse(ease(gesturePhase)));
 const hint=GESTURES[leg];
 const editPhase=clamp((t-EDIT_START)/(EDIT_END-EDIT_START));
 const occlusion=leg>0?clamp(travelPulse(editPhase)):0;
 // One small closing/opening hint, after the pose edit. Never a repeating blink loop.
 const blink=(leg===1||leg===4)?.18*clamp(travelPulse(clamp((t-.70)/.10))):0;
 // Avoid negative zero at held stops; it also makes serialised states unambiguous.
 const scale=amount=>gesture===0?0:amount*gesture;
 return {
  outfit,pose,occlusion,
  lean:scale(hint.lean),veil:scale(hint.veil),sleeve:scale(hint.sleeve),
  blink,faceTurn:scale(hint.faceTurn),blur:6*occlusion
 };
}
