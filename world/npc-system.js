(()=>{"use strict";
const KEY="escie_world_npc_v1";
const DEFAULT={npcs:{witness:{id:"witness",role:"WITNESS",status:"UNKNOWN",awareness:78,social_context:"LOCAL"}},observations:[],detections:[]};
const read=()=>{try{return Object.assign({},DEFAULT,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){return JSON.parse(JSON.stringify(DEFAULT))}};
const save=s=>{try{const raw=JSON.stringify(s);localStorage.setItem(KEY,raw);if(localStorage.getItem(KEY)!==raw)throw new Error("SAVE_VERIFY_FAILED:"+KEY);return s}catch(e){return null}};
const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);const direction=(a,b)=>{const dx=b.x-a.x,dy=b.y-a.y;if(Math.abs(dx)>=Math.abs(dy))return dx>=0?"E":"W";return dy>=0?"S":"N"};const inField=(source,target)=>{const f=source.facing||"ALL",d=direction(source,target);if(f==="ALL")return true;if(f===d)return true;const side=(f==="N"||f==="S")?(d==="E"||d==="W"):(d==="N"||d==="S");return !!source.peripheral&&side};const lineOfSight=(a,b,blocked)=>{if(typeof blocked!=="function")return true;let x=a.x,y=a.y,dx=Math.abs(b.x-x),dy=Math.abs(b.y-y),sx=x<b.x?1:-1,sy=y<b.y?1:-1,err=dx-dy;while(x!==b.x||y!==b.y){const e2=2*err;if(e2>-dy){err-=dy;x+=sx}if(e2<dx){err+=dx;y+=sy}if(x===b.x&&y===b.y)break;if(blocked(x,y))return false}return true};const visibility=(action,distance,awareness,opts={})=>{const speed=opts.speed||"WALK";const noise=speed==="RUN"||speed==="PARKOUR"?12:speed==="SKATEBOARD"||speed==="ROLLERBLADES"||speed==="BIKE"?8:0;const actionBonus=action==="THEFT"||action==="GRAFFITI"?8:0;const facing=Number.isFinite(Number(opts.facing))?Number(opts.facing):1;const facingBonus=facing>0?4:0;return awareness+noise+actionBonus+facingBonus>=Math.max(20,60-distance*10)};
const registerNPC=n=>{const s=read(),existing=s.npcs[n.id]||{},district=String(n.district||existing.district||window.ESCIE_WORLD_SIMULATION?.state?.().neighbourhood||"PARC-EXTENSION").toUpperCase(),lp=window.ESCIE_WORLD_LANGUAGE?.profile?.(Object.assign({},existing,n,{district}))||{};const identity=window.ESCIE_WORLD_IDENTITY?.profile?.(Object.assign({},existing,n,{district,native_language:lp.nativeLanguage||"en"}))||{};const demographic=Object.assign({community:lp.community||"LOCAL",native_language:lp.nativeLanguage||"en",languages:Array.isArray(lp.languages)?lp.languages:["en"],income_band:n.income_band||identity.incomeBand||"MIXED",occupation:n.occupation||n.role||"LOCAL"},existing.demographic||{},n.demographic||{});s.npcs[n.id]=Object.assign({},existing,n,{district,demographic,community:demographic.community,native_language:demographic.native_language,languages:demographic.languages,name:n.name||identity.name||existing.name||n.role||n.id,age:n.age||identity.age||existing.age||30,personality:n.personality||identity.personality||existing.personality||"OBSERVANT",income_band:demographic.income_band,occupation:demographic.occupation});const tier=existing.simulation_tier||window.ESCIE_WORLD_NPC_LIFE?.tiers?.(n.id)||"GENERIC";s.npcs[n.id].simulation_tier=tier;
if(!Array.isArray(s.npcs[n.id].schedule)||!s.npcs[n.id].schedule.length){
 const base=window.ESCIE_WORLD_SIMULATION?.state?.().position||{x:2,y:7};
 const h=Math.abs(String(n.id).split("").reduce((a,ch)=>a+ch.charCodeAt(0),0));
 const home={x:Number(base.x||2)+(h%3)-1,y:Number(base.y||7)+((h>>2)%3)-1};
 const work={x:Number(base.x||2)+((h>>3)%5)-2,y:Number(base.y||7)+((h>>5)%5)-2};
 const social={x:Number(base.x||2)+((h>>7)%5)-2,y:Number(base.y||7)+((h>>9)%5)-2};
 const occupation=String(s.npcs[n.id].occupation||s.npcs[n.id].role||"LOCAL").toUpperCase();
 const socialOffsets={MUSICIAN:{x:3,y:2},BARISTA:{x:2,y:1},SHOPKEEPER:{x:-2,y:2},TRAINER:{x:1,y:-2},OFFICE_WORKER:{x:-3,y:-1},CLINIC_WORKER:{x:-2,y:-2},VENUE_WORKER:{x:3,y:-2},ARCHIVIST:{x:-3,y:2},VENDOR:{x:2,y:-3}};
 const roleOffset=socialOffsets[occupation]||{x:0,y:0};
 social.x=Math.max(0,Math.min(15,social.x+roleOffset.x));social.y=Math.max(0,Math.min(9,social.y+roleOffset.y));
 const buildings=window.ESCIE_WORLD_SIMULATION?.districtBuildings?.(district)||[];
 const preferred={MUSICIAN:["STUDIO","VENUE"],BARISTA:["CAFE"],SHOPKEEPER:["SHOP"],TRAINER:["GYM"],OFFICE_WORKER:["OFFICE"],CLINIC_WORKER:["CLINIC"],VENUE_WORKER:["VENUE"],ARCHIVIST:["ARCHIVE"],VENDOR:["SHOP","VENUE"]}[occupation]||[];
 const pickBuilding=(types,exclude=[])=>buildings.find(b=>types.some(t=>String(b.interior||"").toUpperCase()===t||String(b.type||"").toUpperCase()===t)&&!exclude.includes(b.id))||buildings.find(b=>!exclude.includes(b.id))||null;
 const workBuilding=pickBuilding(preferred); const socialBuilding=pickBuilding(["CLUB","CAFE","VENUE","STUDIO"],workBuilding?[workBuilding.id]:[]);
 s.npcs[n.id].workplace_id=workBuilding?.id||null;s.npcs[n.id].social_place_id=socialBuilding?.id||null;
 if(workBuilding)s.npcs[n.id].work_building=workBuilding;if(socialBuilding)s.npcs[n.id].social_building=socialBuilding;
 s.npcs[n.id].home=Object.assign({district},home);s.npcs[n.id].work=Object.assign({district},work);s.npcs[n.id].social=Object.assign({district},social);
 const socialStart=1020+(h%3)*30;
 const socialEnd=Math.min(1260,socialStart+90+(h%2)*30);
 const workPoint=landmarkPoint(district,workBuilding?.landmark)||work;
 const socialPoint=landmarkPoint(district,socialBuilding?.landmark)||social;
 s.npcs[n.id].schedule=[{start:0,end:420,activity:"SLEEP",target:home},{start:420,end:540,activity:"COMMUTE",target:workPoint},{start:540,end:1020,activity:"WORK",target:workPoint},{start:socialStart,end:socialEnd,activity:"SOCIAL",target:socialPoint},{start:socialEnd,end:1320,activity:"COMMUTE",target:home},{start:1320,end:1440,activity:"HOME",target:home}];
}
save(s);if(tier!=="GENERIC")window.ESCIE_WORLD_NPC_LIFE?.ensure?.(s.npcs[n.id]);return s.npcs[n.id]};
const registerSurveillance=n=>{const s=read();s.surveillance=s.surveillance||{};s.surveillance[n.id]=Object.assign({},n);save(s);return n};
const observe=(action,pos,opts={})=>{
 const s=read(),sim=window.ESCIE_WORLD_SIMULATION;
 const radius=Number.isFinite(Number(opts.radius))?Number(opts.radius):4,candidates=[];
 Object.values(s.npcs||{}).forEach(n=>{if(typeof n.x!=="number"||typeof n.y!=="number")return;const d=dist(pos,n);if(d<=radius&&inField(n,pos)&&lineOfSight(n,pos,opts.blocked))candidates.push({source:"NPC:"+n.id,distance:d,awareness:Number(n.awareness??50)})});
 Object.values(s.surveillance||{}).forEach(c=>{if(typeof c.x!=="number"||typeof c.y!=="number")return;const d=dist(pos,c);if(d<=Number(c.radius||5)&&inField(c,pos)&&lineOfSight(c,pos,opts.blocked))candidates.push({source:"CAMERA:"+c.id,distance:d,awareness:Number(c.awareness??90)})});
 const visible=candidates.find(v=>visibility(action,v.distance,v.awareness,opts));
 s.observations=(s.observations||[]).concat([{action,day:sim?.state?.().day||1,observed:!!visible,sources:candidates.map(v=>v.source)}]).slice(-100);
 if(visible){window.ESCIE_WORLD_NPC_LIFE?.engage?.(visible.source.replace(/^NPC:/,""),action==="THEFT"?"WITNESSED_THEFT":"OBSERVED");} if(visible&&sim?.detect){window.ESCIE_WORLD_NPC_LIFE?.engage?.(String(visible.source||"").replace(/^NPC:/,""),"WITNESSED_ACTION");s.detections=(s.detections||[]).concat([{action,source:visible.source,day:sim.state().day}]).slice(-100);save(s);sim.detect(visible.source,action==="THEFT"?8:2)}
 else save(s);
 return {observed:!!visible,source:visible?.source||null,candidates};
};
const scheduleFor=(n,minute)=>{const s=n.schedule||[];if(!s.length)return null;return s.find(v=>minute>=v.start&&minute<v.end)||s[s.length-1]};
const landmarkPoint=(district,landmark)=>{
 const sim=window.ESCIE_WORLD_SIMULATION;if(!sim)return null;
 const lm=sim.findLandmark?.(district,landmark);if(!lm)return null;
 const node=(sim.streetNodes?.[String(district||"").toUpperCase()]||[]).find(x=>x.id===lm.node);
 return node?Object.assign({},lm,{x:node.x,y:node.y}):null;
};
const buildingAtTarget=(n,a)=>{
 const b=a?.activity==="WORK"?n.work_building:a?.activity==="SOCIAL"?n.social_building:null;
 if(!b)return null;
 const lm=landmarkPoint(n.district,b.landmark);
 return lm?{building:b,landmark:lm}:null;
};
const updateInteriorPresence=(n,a,minute)=>{
 n.interior=n.interior||null;
 const target=buildingAtTarget(n,a);
 const near=target&&Math.abs(Number(n.x)-Number(target.landmark.x||0))+Math.abs(Number(n.y)-Number(target.landmark.y||0))<=1;
 if(target&&near&&["WORK","SOCIAL"].includes(a.activity)){
   n.interior={building_id:target.building.id,interior:target.building.interior,room:target.building.interior==="OFFICE"?"WORKSPACE":target.building.interior==="CAFE"?"COUNTER":target.building.interior==="STUDIO"?"LOUNGE":target.building.interior==="GYM"?"FLOOR":target.building.interior==="CLINIC"?"WAITING":"MAIN",entered:true,activity:a.activity,day:window.ESCIE_WORLD_SIMULATION?.state?.().day||1,minute};
 }else if(n.interior&&(!target||a.activity==="COMMUTE"||a.activity==="SLEEP"||a.activity==="HOME")){
   n.interior=null;
 }
 return n.interior;
};
const interiorSocialTick=(st,day,hour,minute)=>{
 const groups={},seen=new Set();
 Object.values(st.npcs||{}).forEach(n=>{if(n.interior?.entered&&n.interior.building_id)(groups[n.interior.building_id]||(groups[n.interior.building_id]=[])).push(n)});
 Object.values(groups).forEach(group=>{
  for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++){
   const a=group[i],b=group[j],key=[a.id,b.id].sort().join("|");if(seen.has(key)||a.activity==="DOWN"||b.activity==="DOWN")continue;seen.add(key);
   const language=(a.native_language||"en")===(b.native_language||"en")?(a.native_language||"en"):"mixed";
   const tense=Number(a.relationship||0)<-40||Number(b.relationship||0)<-40;
   const exchange=window.ESCIE_WORLD_DIALOGUE?.generate?.(a,b,{day,hour,minute,language,community:a.community||"LOCAL",tension:tense})||null;
   st.social_exchanges.unshift({day,hour,minute,from:a.id,to:b.id,language,community:a.community||"LOCAL",type:tense?"INTERIOR_TENSION":"INTERIOR_CONVERSATION",building_id:a.interior.building_id,line:exchange?.line||null,topic:exchange?.topic||"LOCAL"});
   st.social_exchanges=st.social_exchanges.slice(0,100);npcLink(a.id,b.id,tense?-1:1,"interior social");
   if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent("escie:npc-interior-exchange",{detail:{from:a,to:b,building:a.interior.building_id,exchange}}));
  }
 });
 return Object.keys(groups).length;
};
const socialTick=(day,hour,minute)=>{const st=read(),sim=window.ESCIE_WORLD_SIMULATION,s=sim?.state?.()||{};const active=Object.values(st.npcs||{}).filter(n=>n.district&&n.x!=null&&n.y!=null);st.social_exchanges=st.social_exchanges||[];for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){const a=active[i],b=active[j];if(a.district!==b.district||Math.abs(a.x-b.x)+Math.abs(a.y-b.y)>2)continue;const tense=(a.relationship||0)<-40||(b.relationship||0)<-40;if(tense){a.activity="TENSION";b.activity="TENSION"}else if(a.activity!=="DOWN"&&b.activity!=="DOWN"){const language=(a.native_language||"en")===(b.native_language||"en")?(a.native_language||"en"):"mixed";const exchange=window.ESCIE_WORLD_DIALOGUE?.generate?.(a,b,{day,hour,minute,language,community:a.community||"LOCAL",tension:false})||null;st.social_exchanges.unshift({day,hour,minute,from:a.id,to:b.id,language,community:a.community||"LOCAL",type:"CONVERSATION",line:exchange?.line||null,topic:exchange?.topic||"LOCAL"});st.social_exchanges=st.social_exchanges.slice(0,100);if(exchange&&typeof window!=="undefined")window.dispatchEvent(new CustomEvent("escie:npc-social-exchange",{detail:exchange}));}}save(st);return active.length};
const tick=(day,hour,minute,blocked,elapsedMinutes=30)=>{const st=read(),sim=window.ESCIE_WORLD_SIMULATION,now=Number(hour)*60+Number(minute);Object.values(st.npcs||{}).forEach(n=>{if(typeof n.x!=="number"||typeof n.y!=="number")return;const a=scheduleFor(n,now);if(!a||!a.target)return;const dx=Math.sign(a.target.x-n.x),dy=Math.sign(a.target.y-n.y);let nx=n.x,ny=n.y;if(dx&&!(blocked&&blocked(n.x+dx,n.y)))nx+=dx;else if(dy&&!(blocked&&blocked(n.x,n.y+dy)))ny+=dy;if(nx!==n.x||ny!==n.y){n.x=nx;n.y=ny;n.facing=dx?dx>0?"E":"W":dy?dy>0?"S":"N":n.facing||"S";}n.activity=a.activity||n.activity||"IDLE";n.schedule_day=day;n.schedule_minute=now;updateInteriorPresence(n,a,now);});interiorSocialTick(st,day,hour,minute);window.ESCIE_WORLD_NPC_LIFE?.tick?.(Math.max(1,Number(elapsedMinutes)||30));window.ESCIE_WORLD_NPC_LIFE?.syncRelationships?.();save(st);return st.npcs};
const damageNPC=(id,amount=0,cause="FIST")=>{
 const s=read(),n=s.npcs[id];if(!n)return {ok:false,reason:"NPC_NOT_FOUND"};
 const d=Math.max(0,Number(amount)||0);n.health=Math.max(0,Number(n.health??100)-d);n.damage=Math.min(100,Number(n.damage||0)+d);n.activity=n.health<=0?"DOWN":"COMBAT";n.last_combat={cause,damage:d,day:window.ESCIE_WORLD_SIMULATION?.state?.().day||1};s.npcs[id]=n;save(s);
 return {ok:true,health:n.health,down:n.health<=0,npc:n};
};
const relationship=(id,delta=0,reason="")=>{window.ESCIE_WORLD_NPC_LIFE?.engage?.(id,"RELATIONSHIP");const s=read(),n=s.npcs[id]||{};const before=Number(n.relationship||0);n.relationship=Math.max(-100,Math.min(100,before+Number(delta||0)));n.last_interaction={reason,day:window.ESCIE_WORLD_SIMULATION?.state?.().day||1};s.npcs[id]=n;save(s);if(typeof window!=="undefined"){window.dispatchEvent(new CustomEvent("escie:npc-relationship",{detail:{id,delta:Number(delta||0),reason,relationship:n.relationship,text:(Number(delta||0)>=0?"RELATIONSHIP +":"RELATIONSHIP ")+Number(delta||0)+" · "+(reason||"interaction")}}))}return n.relationship};
const rememberInteraction=(id,data={})=>{const sim=window.ESCIE_WORLD_SIMULATION;if(sim?.npcMemory)sim.npcMemory(id,data);const s=read(),n=s.npcs[id]||{id};n.interactions=Number(n.interactions||0)+1;n.last_seen_day=sim?.state?.().day||1;s.npcs[id]=n;save(s);return n};
const reaction=(id,context={})=>{const s=read(),n=s.npcs[id]||{},rel=Number(n.relationship||0),status=String(context.status||window.ESCIE_WORLD_SIMULATION?.state?.().status||"UNKNOWN"),wanted=Number(context.wanted||window.ESCIE_WORLD_SIMULATION?.state?.().wanted||0);if(wanted>=8)return "ALERT";if(rel>=40)return "TRUSTING";if(rel<=-40)return "HOSTILE";if(status==="UNKNOWN")return "CAUTIOUS";if(status==="LOW"||status==="WORKING")return "NEUTRAL";return "OBSERVANT"};
const npcLink=(aId,bId,delta=0,reason="social")=>{const s=read();const a=s.npcs[aId]||{id:aId},b=s.npcs[bId]||{id:bId};a.links=a.links||{};b.links=b.links||{};a.links[bId]=Math.max(-100,Math.min(100,Number(a.links[bId]||0)+Number(delta||0)));b.links[aId]=Math.max(-100,Math.min(100,Number(b.links[aId]||0)+Number(delta||0)));a.last_social={with:bId,reason,day:window.ESCIE_WORLD_SIMULATION?.state?.().day||1};b.last_social={with:aId,reason,day:window.ESCIE_WORLD_SIMULATION?.state?.().day||1};s.npcs[aId]=a;s.npcs[bId]=b;save(s);return {a:a.links[bId],b:b.links[aId]};};
const rumor=(fromId,subject,text,importance=1)=>{const s=read(),sim=window.ESCIE_WORLD_SIMULATION,day=sim?.state?.().day||1;const seen=[];Object.values(s.npcs||{}).forEach(n=>{if(n.id===fromId)return;n.rumors=n.rumors||[];n.rumors.unshift({subject,text,importance,from:fromId,day});n.rumors=n.rumors.slice(0,20);seen.push(n.id)});save(s);return seen};
const memory=(id,data={})=>{const sim=window.ESCIE_WORLD_SIMULATION;return sim?.npcMemory?sim.npcMemory(id,data):null};
window.ESCIE_WORLD_NPC={state:read,registerNPC,registerSurveillance,observe,tick,socialTick,interiorSocialTick,updateInteriorPresence,npcLink,rumor,memory,relationship,rememberInteraction,reaction,damageNPC};
if(!localStorage.getItem(KEY))save(DEFAULT);
})();