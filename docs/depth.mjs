export function boundedScene(index,count){return Math.max(0,Math.min(count-1,Number(index)||0));}
export function depthFrames(direction=1){
 const forward=direction>0;
 return {
  out:[
   {opacity:1,transform:'translateZ(0px) scale(1)',filter:'blur(0px)'},
   {offset:.45,opacity:.18,transform:`translateZ(${forward?95:-100}px) scale(${forward?1.06:.94})`,filter:'blur(3px)'},
   {opacity:0,transform:`translateZ(${forward?190:-200}px) scale(${forward?1.13:.88})`,filter:'blur(6px)'}
  ],
  incoming:[
   {opacity:0,transform:`translateZ(${forward?-240:150}px) scale(${forward?.85:1.1})`,filter:'blur(7px)'},
   {offset:.5,opacity:.8,transform:`translateZ(${forward?-55:35}px) scale(${forward?.97:1.025})`,filter:'blur(1px)'},
   {opacity:1,transform:'translateZ(0px) scale(1)',filter:'blur(0px)'}
  ]
 };
}
