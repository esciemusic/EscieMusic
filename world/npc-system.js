(()=>{"use strict";
const KEY="escie_world_npc_v1";
const DEFAULT={npcs:{witness:{id:"witness",role:"WITNESS",status:"UNKNOWN",awareness:78,social_context:"LOCAL"}},observations:[],detections:[]};
const read=()=>{try{return Object.assign({},DEFAULT,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){return JSON.parse(JSON.stringify(DEFAULT))}};
const save=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}return s};
const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);const lineOfSight=(a,b,blocked)=>{if(typeof blocked!=="function")return true;let x=a.x,y=a.y,dx=Math.abs(b.x-x),dy=Math.abs(b.y-y),sx=x<b.x?1:-1,sy=y<b.y?1:-1,err=dx-dy;while(x!==b.x||y!==b.y){const e2=2*err;if(e2>-dy){err-=dy;x+=sx}if(e2<dx){err+=dx;y+=sy}if(x===b.x&&y===b.y)break;if(blocked(x,y))return false}return true};const visibility=(action,distance,awareness,opts={})=>{const speed=opts.speed||"WALK";const noise=speed==="RUN"||speed==="PARKOUR"?12:speed==="SKATEBOARD"||speed==="ROLLERBLADES"||speed==="BIKE"?8:0;const actionBonus=action==="THEFT"||action==="GRAFFITI"?8:0;const facing=Number.isFinite(Number(opts.facing))?Number(opts.facing):1;const facingBonus=facing>0?4:0;return awareness+noise+actionBonus+facingBonus>=Math.max(20,60-distance*10)};
const registerNPC=n=>{const s=read();s.npcs[n.id]=Object.assign({},s.npcs[n.id]||{},n);save(s);return s.npcs[n.id]};
const registerSurveillance=n=>{const s=read();s.surveillance=s.surveillance||{};s.surveillance[n.id]=Object.assign({},n);save(s);return n};
const observe=(action,pos,opts={})=>{
 const s=read(),sim=window.ESCIE_WORLD_SIMULATION;
 const radius=Number.isFinite(Number(opts.radius))?Number(opts.radius):4,candidates=[];
 Object.values(s.npcs||{}).forEach(n=>{if(typeof n.x!=="number"||typeof n.y!=="number")return;const d=dist(pos,n);if(d<=radius&&lineOfSight(n,pos,opts.blocked))candidates.push({source:"NPC:"+n.id,distance:d,awareness:Number(n.awareness??50)})});
 Object.values(s.surveillance||{}).forEach(c=>{if(typeof c.x!=="number"||typeof c.y!=="number")return;const d=dist(pos,c);if(d<=Number(c.radius||5)&&lineOfSight(c,pos,opts.blocked))candidates.push({source:"CAMERA:"+c.id,distance:d,awareness:Number(c.awareness??90)})});
 const visible=candidates.find(v=>visibility(action,v.distance,v.awareness,opts));
 s.observations=(s.observations||[]).concat([{action,day:sim?.state?.().day||1,observed:!!visible,sources:candidates.map(v=>v.source)}]).slice(-100);
 if(visible&&sim?.detect){s.detections=(s.detections||[]).concat([{action,source:visible.source,day:sim.state().day}]).slice(-100);save(s);sim.detect(visible.source,action==="THEFT"?8:2)}
 else save(s);
 return {observed:!!visible,source:visible?.source||null,candidates};
};
const memory=(id,data={})=>{const sim=window.ESCIE_WORLD_SIMULATION;return sim?.npcMemory?sim.npcMemory(id,data):null};
window.ESCIE_WORLD_NPC={state:read,registerNPC,registerSurveillance,observe,memory};
if(!localStorage.getItem(KEY))save(DEFAULT);
})();