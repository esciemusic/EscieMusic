/* ESCIE DREAM STATE BRIDGE
 * Dreams remain part of the RPG state, but never become a 2D gameplay layer.
 * A future dream sequence must enter the same 3D renderer architecture.
 */
(function(){
"use strict";
const dreamWalls={
 "PARC-EXTENSION-DREAM":new Set(["7,3","8,3","9,3","10,3","11,3","7,4","11,4","7,5","11,5","7,6","8,6","9,6","10,6","11,6"]),
 "PLATEAU-DREAM":new Set(["4,2","5,2","6,2","7,2","8,2","9,2","10,2","10,3","10,4","10,5","4,6","5,6","6,6","7,6","8,6"]),
 "DOWNTOWN-DREAM":new Set(["3,1","4,1","5,1","6,1","7,1","8,1","9,1","10,1","3,2","10,2","3,3","10,3","3,4","10,4","3,5","4,5","5,5","6,5","7,5","8,5","9,5","10,5"]),
 "UNKNOWN-DREAM":new Set()
};
function blocked(s,x,y){const walls=dreamWalls[s?.level?.label?.split(" · ")[0]+"-DREAM"]||dreamWalls["UNKNOWN-DREAM"];return x<0||x>15||y<0||y>9||walls.has(x+","+y);}
const original=window.ESCIE_WORLD_DREAM_PLAY;
if(!original)return;
const move=original.move;
original.move=function(dx,dy){
 const s=window.ESCIE_WORLD_DREAM_STATE;
 if(!s?.active)return null;
 const nx=s.player.x+dx,ny=s.player.y+dy;
 if(blocked(s,nx,ny)){window.ESCIE_PHONE_GAMEPLAY?.notify?.("DREAM · PATH BLOCKED","DREAM");return s;}
 const out=move(dx,dy);if(!out)return out;
 out.history=Array.isArray(out.history)?out.history:[];
 out.history.push({x:out.player.x,y:out.player.y,turn:out.turns});
 const obj=(out.level.objects||[]).find(o=>Math.abs(o.x-out.player.x)<=1&&Math.abs(o.y-out.player.y)<=1);
 if(obj&&!out.found){out.found=obj.id;window.ESCIE_PHONE_GAMEPLAY?.notify?.("DREAM CLUE · "+obj.label,"CLUE");window.ESCIE_WORLD_INVESTIGATION?.query?.("query:"+String(obj.id).toLowerCase());}
 if(out.active&&out.turns%2===0){const t=out.threat,dxp=Math.sign(out.player.x-t.x),dyp=Math.sign(out.player.y-t.y),candidates=[[t.x+dxp,t.y],[t.x,t.y+dyp],[t.x-dxp,t.y],[t.x,t.y-dyp]],next=candidates.find(p=>!blocked(out,p[0],p[1])&&!(p[0]===out.player.x&&p[1]===out.player.y));if(next){t.x=next[0];t.y=next[1];}}
 return out;
};
original.cancel=function(reason="CANCELLED"){const s=window.ESCIE_WORLD_DREAM_STATE;if(!s)return false;s.cancelled=true;s.active=false;s.result=reason;window.ESCIE_WORLD_DREAM_STATE=null;return true;};
original.hide=function(){const s=window.ESCIE_WORLD_DREAM_STATE;if(!s?.active)return null;s.hidden=!s.hidden;window.ESCIE_PHONE_GAMEPLAY?.notify?.(s.hidden?"DREAM · YOU ARE HIDING":"DREAM · YOU STEP OUT OF COVER","DREAM");return s;};
document.addEventListener("escie-dream-play-start",e=>{const s=e.detail;if(s){s.hidden=false;s.clues=[];s.lastDetection=0;}});
document.addEventListener("escie-dream-complete",e=>{
 const s=e.detail;if(!s||s.cancelled)return;
 try{const key="escie_world_simulation_v1",data=JSON.parse(localStorage.getItem(key)||"{}");data.dream_history=Array.isArray(data.dream_history)?data.dream_history:[];data.dream_history.unshift({level:s.level?.label||"DREAM",result:s.result||"WAKE",detected:!!s.detected,clue:s.found||null,turns:s.turns||0,day:data.day||1});data.dream_history=data.dream_history.slice(0,30);if(s.found){data.dream_clues=Array.isArray(data.dream_clues)?data.dream_clues:[];if(!data.dream_clues.includes(s.found))data.dream_clues.push(s.found);}localStorage.setItem(key,JSON.stringify(data));}catch(e){}
});
})();
