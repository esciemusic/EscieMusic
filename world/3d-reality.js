/* ESCIE 3D REALITY LAYER
 * Procedural Montréal-inspired playable scene.
 * No canonical truth is written here; gameplay state remains separate.
 */
(function(){
"use strict";
const root=window;
let renderer,scene,camera,clock,avatar,worldGroup,thirdPerson=false,started=false,paused=false,raf=0,dayLight,ambientLight,resizeObserver,visibilityHandler;
const obstacles=[],actors=[],doors=[],lights=[],evidence=[]; const perf={quality:"auto",frameMs:16,lowFrames:0,last:performance.now(),hud:0};
const keys=new Set();
const player={x:0,z:8,y:1.7,yaw:0,pitch:0,speed:4.2,sprint:7.5,lastSync:0,lastGridX:null,lastGridY:null,inVehicle:false,vehicleId:null,npcSync:0,lawSync:0,lastSprintDrain:0,worldTick:0};
let interiorMode=false,interiorGroup=null,interiorBuilding=null,interiorSaved=null;
const bounds=54;
const stage=()=>document.getElementById("world-stage");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const makeMat=(color,roughness=1,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
function box(w,h,d,color,x,y,z,opts={}){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),makeMat(color,opts.roughness??.92,opts.metalness??0));
 m.position.set(x,y,z); if(opts.rot)m.rotation.y=opts.rot; worldGroup.add(m); if(opts.solid)obstacles.push({x,z,w,d}); return m;
}
function cyl(r,h,color,x,y,z){
 const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),makeMat(color,.8));m.position.set(x,y,z);worldGroup.add(m);return m;
}
function createGround(){
 const g=new THREE.Mesh(new THREE.PlaneGeometry(130,130),new THREE.MeshStandardMaterial({color:0x1b1c1f,roughness:1}));
 g.rotation.x=-Math.PI/2;worldGroup.add(g);
 for(let i=-50;i<=50;i+=10){box(.08,.01,130,0x3a3c3c,i,.01,0);box(130,.01,.08,0x3a3c3c,0,.012,i);}
 box(9,.04,130,0x171918,0,.04,0);
 for(let z=-54;z<54;z+=8){box(.18,.025,3.6,0xc7c8bd,0,.07,z);}
}
function door(x,z,w,h,seed,building){
 const mat=makeMat(seed%2?0x292a2e:0x101114,.72,seed%2?.2:0);
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,.08),mat);m.position.set(x, h/2, z);worldGroup.add(m);
 const sign=new THREE.Mesh(new THREE.BoxGeometry(w*.7,.08,.02),makeMat(0x2f80ff,.7));sign.position.set(x,h*.78,z-.06);worldGroup.add(sign);
 doors.push({mesh:m,x,z,w:.9,h:2.2,id:"door-"+seed,open:false,building});
 return m;
}
function building(x,z,w,d,h,seed,buildingRef){
 const wall=[0x1b1c1f,0x292a2e,0x303235,0x101114][seed%4];
 box(w,h,d,wall,x,h/2,z,{roughness:.96,solid:true});
 const rows=Math.max(2,Math.floor(h/3)), cols=Math.max(2,Math.floor(w/2.8));
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
   const px=x-w/2+1.2+c*((w-2.4)/Math.max(1,cols-1));
   const py=1.8+r*((h-3)/Math.max(1,rows-1));
   const lit=(seed+r*7+c*3)%5===0;
   box(.55,.85,.035,lit?0x70747a:0x101114,px,py,z-d/2-.02);
 }
 if(seed%3===0) box(w*.65,.12,d*.7,0x1e2020,x,h+.08,z);
 if(seed%2===0) door(x,z-d/2-.055,1.15,2.2,seed,buildingRef);
}
function actor(x,z,seed){
 const g=new THREE.Group();
 const coat=[0x141918,0x202726,0x303735][seed%3];
 const b=new THREE.Mesh(new THREE.CapsuleGeometry(.2,.65,4,8),makeMat(coat,.95));b.position.y=.62;g.add(b);
 const h=new THREE.Mesh(new THREE.SphereGeometry(.17,12,8),makeMat(0x373b38,.98));h.position.y=1.3;g.add(h);
 g.position.set(x,0,z);g.userData={id:"street-person-"+seed,drift:(seed%2?1:-1),base:x,phase:seed};
 worldGroup.add(g);actors.push(g);
}
function gridToWorld(p){return {x:Number(p?.x||0)/15*108-54,z:Number(p?.y||0)/9*108-54}}
function createEvidence(){const objects=root.ESCIE_WORLD_ACTIONS?.objects||[];objects.forEach(o=>{const q=gridToWorld(o);const m=box(.28,.08,.28,o.id==="signal"?0x6f3faf:0x8e1f2d,q.x,.08,q.z);m.userData.evidence=o;evidence.push(m)});}
function updateEvidence(){evidence.forEach(m=>{const d=Math.hypot(player.x-m.position.x,player.z-m.position.z);m.visible=d<18;});const near=evidence.find(m=>Math.hypot(player.x-m.position.x,player.z-m.position.z)<2.2);if(near){say3D("INVESTIGATE · "+near.userData.evidence.label+" · E / INTERACT");}return near;}
function createStreetLife(){
 const live=root.ESCIE_WORLD_NPC?.state?.().npcs||{};const list=Object.values(live).filter(n=>n&&n.id&&Number.isFinite(Number(n.x))&&Number.isFinite(Number(n.y))).slice(0,28);
 if(list.length){list.forEach((n,i)=>{const q=gridToWorld(n);actor(q.x,q.z,i);const a=actors[actors.length-1];a.userData.id=n.id;a.userData.canonical=true;a.userData.npc=n});}
 for(let i=list.length;i<18;i++){const x=(i%2?1:-1)*(6.5+(i%4)*1.1),z=-45+i*5.2;actor(x,z,i+100);}
}
function syncCanonicalNPCs(t){const api=root.ESCIE_WORLD_NPC;if(!api)return;const live=api.state?.().npcs||{};actors.forEach(a=>{if(!a.userData.canonical)return;const n=live[a.userData.id];if(!n){a.visible=false;return}a.visible=Number(n.health??100)>0;const q=gridToWorld(n);a.position.x+=(q.x-a.position.x)*.18;a.position.z+=(q.z-a.position.z)*.18;a.rotation.y=n.facing==="E"?Math.PI/2:n.facing==="W"?-Math.PI/2:n.facing==="N"?Math.PI:0;a.userData.activity=n.activity||"IDLE";});player.npcSync=performance.now();}

function streetProps(){
 for(let z=-48;z<=48;z+=12){
   cyl(.08,4.5,0x151718,-5,2.25,z);
   const lamp=box(.12,.12,.9,0x70747a,-5,4.35,z,{metalness:.6});lamp.rotation.z=.15;
   box(.28,.08,.18,0x2f80ff,-5.25,4.25,z);
 }
 for(let z=-44;z<=44;z+=11){
   const side=z%22===0?-9:9;
   box(1.8,.45,4.1,0x292a2e,side,.45,z,{roughness:.8});
   box(1.55,.3,1.9,0x101114,side,1.0,z);
 }
}
function clearWorld(){obstacles.length=0;actors.length=0;doors.length=0;lights.length=0;}
function createSnow(){
 const geo=new THREE.BufferGeometry(),n=850,pos=new Float32Array(n*3);
 for(let i=0;i<n;i++){pos[i*3]=(Math.random()-.5)*120;pos[i*3+1]=Math.random()*22;pos[i*3+2]=(Math.random()-.5)*120;}
 geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
 const mat=new THREE.PointsMaterial({color:0xd9ddda,size:.055,transparent:true,opacity:.62});
 worldGroup.add(new THREE.Points(geo,mat));
}
function createCanonicalBuildings(){const s=root.ESCIE_WORLD_SIMULATION?.state?.()||{};const list=root.ESCIE_WORLD_SIMULATION?.districtBuildings?.(s.neighbourhood)||[];list.forEach((b,i)=>building(-27+(i%4)*18,-38+Math.floor(i/4)*18,10,10,12+i%3,i+1,b));}
function buildScene(){
 clearWorld();scene=new THREE.Scene();scene.background=new THREE.Color(0x050505);scene.fog=new THREE.FogExp2(0x101114,.018);
 worldGroup=new THREE.Group();scene.add(worldGroup);
 scene.add(new THREE.HemisphereLight(0xd8d4ca,0x101114,.8));
 const moon=new THREE.DirectionalLight(0x70747a,1.5);moon.position.set(-18,30,12);scene.add(moon);
 const signal=new THREE.PointLight(0x2f80ff,2.2,20);signal.position.set(0,5,6);scene.add(signal);lights.push(signal);
 dayLight=moon;ambientLight=scene.children.find(o=>o instanceof THREE.HemisphereLight);
 createGround();createCanonicalBuildings();
 let seed=1;
 for(let x=-34;x<=34;x+=12)for(let z=-52;z<=52;z+=13){
   if(Math.abs(x)<10)continue;
   building(x,z,9+seed%4,9+seed%5,9+(seed%5)*2,seed++);
 }
 streetProps();createEvidence();createStreetLife();createSnow();
 avatar=new THREE.Group();
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.9,5,10),makeMat(0x101114,.9));
 body.position.y=.8;avatar.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),makeMat(0x70747a,.95));head.position.y=1.55;avatar.add(head);
 avatar.position.set(player.x,.0,player.z);scene.add(avatar);
}
function resize(){
 const s=stage();if(!renderer||!s)return;const r=s.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
}
function setup(){
 const s=stage();if(!s||!window.THREE)return false;
 const initial=root.ESCIE_WORLD_SIMULATION?.state?.()?.position||{x:2,y:7};player.x=Number(initial.x||0)/15*108-54;player.z=Number(initial.y||0)/9*108-54;
 if(renderer)return true;const stale=s.querySelector(".escie-3d-canvas");if(stale)stale.remove();const staleStatus=s.querySelector("#escie-3d-status");if(staleStatus)staleStatus.remove();
 try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});}catch(e){say3D("3D UNAVAILABLE · WEBGL REQUIRED");return false}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.domElement.className="escie-3d-canvas";renderer.domElement.setAttribute("aria-label","ESCIE 3D playable world");s.appendChild(renderer.domElement);const status=document.createElement("div");status.id="escie-3d-status";status.setAttribute("aria-live","polite");status.textContent="ESCIE WORLD · INITIALIZING";s.appendChild(status);
 camera=new THREE.PerspectiveCamera(70,1,.05,180);clock=new THREE.Clock();buildScene();resize();resizeObserver=window.ResizeObserver?new ResizeObserver(resize):null;resizeObserver?.observe(s);window.addEventListener("resize",resize);
 renderer.domElement.addEventListener("click",()=>renderer.domElement.requestPointerLock?.());
 renderer.domElement.addEventListener("mousemove",e=>{if(document.pointerLockElement!==renderer.domElement)return;player.yaw-=e.movementX*.0022;player.pitch=clamp(player.pitch-e.movementY*.0018,-1.2,1.2);});
 document.addEventListener("keydown",e=>{keys.add(e.key.toLowerCase());if(["w","a","s","d","shift","arrowup","arrowdown","arrowleft","arrowright"].includes(e.key.toLowerCase()))e.preventDefault();});
 document.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
 document.addEventListener("keydown",e=>{if(e.key.toLowerCase()==="e"){if(!interact())document.querySelector("[data-action-primary]")?.click();}});
 let touchLook=null;
 renderer.domElement.addEventListener("touchstart",e=>{if(e.touches.length===1)touchLook={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
 renderer.domElement.addEventListener("touchmove",e=>{if(!touchLook||e.touches.length!==1)return;const t=e.touches[0];player.yaw-=(t.clientX-touchLook.x)*.006;player.pitch=clamp(player.pitch-(t.clientY-touchLook.y)*.004,-1.2,1.2);touchLook={x:t.clientX,y:t.clientY};},{passive:true});
 renderer.domElement.addEventListener("touchend",()=>touchLook=null,{passive:true});
 document.addEventListener("blur",()=>keys.clear());
 visibilityHandler=()=>{if(document.hidden){root.ESCIE_WORLD_SIMULATION?.flush?.();if(raf)cancelAnimationFrame(raf);raf=0}else if(started&&!paused&&!raf){clock.start();render();}};document.addEventListener("visibilitychange",visibilityHandler);
 return true;
}
function gamepadInput(){
 const pads=navigator.getGamepads?.()||[];const p=[...pads].find(Boolean);if(!p)return {f:0,str:0,lookX:0,lookY:0,sprint:false,action:false,start:false,back:false};
 const dz=v=>Math.abs(v)<.14?0:v;return {f:-dz(Number(p.axes?.[1]||0)),str:dz(Number(p.axes?.[0]||0)),lookX:dz(Number(p.axes?.[2]||0)),lookY:dz(Number(p.axes?.[3]||0)),sprint:!!p.buttons?.[10]?.pressed,action:!!p.buttons?.[0]?.pressed,start:!!p.buttons?.[9]?.pressed,back:!!p.buttons?.[8]?.pressed};
}
function evidenceInteract(){const m=updateEvidence();if(!m)return false;const o=m.userData.evidence;const r=root.ESCIE_WORLD_ACTIONS?.interactObject?.(o);if(r!==false){say3D("EVIDENCE · "+String(o.label||o.id)+" · LOGGED");return true}return false}
function nearestNPC(max=2.8){const live=root.ESCIE_WORLD_NPC?.state?.().npcs||{};let best=null,bd=max;actors.forEach(a=>{if(!a.userData.canonical)return;const n=live[a.userData.id];if(!n||Number(n.health??100)<=0)return;const d=Math.hypot(player.x-a.position.x,player.z-a.position.z);if(d<bd){bd=d;best={npc:n,actor:a,d}}});return best}
function fight3D(){const hit=nearestNPC(2.8);if(!hit){say3D("COMBAT · NO TARGET IN RANGE");return false}const sim=root.ESCIE_WORLD_SIMULATION,weapon=root.ESCIE_WORLD_EQUIPMENT?.weapon?.()?.id||"FISTS",attack=sim?.combatAttack?.(hit.npc.id,{weapon});if(attack?.reason==="EXHAUSTED"){say3D("COMBAT · TOO EXHAUSTED");return true}if(!attack?.ok){say3D("COMBAT · "+String(attack?.reason||"FAILED"));return true}hit.actor.userData.reaction=attack.target?.down?"DOWN":"HOSTILE";hit.actor.userData.reactionUntil=performance.now()+2200;root.ESCIE_WORLD_NPC?.relationship?.(hit.npc.id,-8,"3D FIGHT");if(attack.target?.down){root.ESCIE_WORLD_ACTIONS?.awardRPGXP?.(40,"COMBAT KNOCKOUT");say3D("TARGET DOWN · +40 XP · CONSEQUENCE REGISTERED");}else{root.dispatchEvent(new CustomEvent("escie:world-detection",{detail:{source:"3D COMBAT",level:1}}));const retaliation=Math.max(2,Math.min(12,Math.round((100-(attack.target?.health??100))/12)));const hurt=sim?.applyDamage?.(retaliation,"NPC_RETALIATION");if(hurt?.dead){const rr=sim.respawn?.();say3D(rr?.ok?"YOU DIED · RESPAWNED":"YOU DIED");}else if(hurt?.hospital)say3D("SERIOUS INJURY · HOSPITAL REQUIRED");else say3D("COMBAT · TARGET HP "+Number(attack.target?.health??0)+" · WANTED RESPONSE");}return true}
function updatePolice(){const law=root.ESCIE_WORLD_LAW?.state?.();if(!law?.active){if(updatePolice.group)updatePolice.group.visible=false;return}const count=Math.max(1,Math.min(4,Number(law.units?.length||law.level||1)));if(!updatePolice.group){updatePolice.group=new THREE.Group();updatePolice.group.userData.policeResponse=true;worldGroup.add(updatePolice.group)}const group=updatePolice.group;while(group.children.length<count){const g=new THREE.Group();g.userData.police=true;const body=new THREE.Mesh(new THREE.BoxGeometry(1.45,.5,2.8),makeMat(0x292a2e,.7,.25));body.position.y=.5;g.add(body);const roof=new THREE.Mesh(new THREE.BoxGeometry(1.1,.28,1.1),makeMat(0x101114,.65));roof.position.y=.88;g.add(roof);const light=new THREE.Mesh(new THREE.BoxGeometry(.18,.08,.32),makeMat(0x2f80ff,.45));light.position.set(.28,1.08,0);g.add(light);group.add(g)}group.visible=true;const baseAng=Math.atan2(player.z,player.x);for(let i=0;i<group.children.length;i++){const g=group.children[i],active=i<count;g.visible=active;if(!active)continue;const spread=i===0?0:(i%2?1:-1)*(0.35+Math.floor(i/2)*0.18);const ang=baseAng+Math.PI+spread;const radius=Math.max(9,24-Number(law.level||1)*2-i*2);const tx=player.x+Math.cos(ang)*radius,tz=player.z+Math.sin(ang)*radius;g.position.x+=(tx-g.position.x)*.025;g.position.z+=(tz-g.position.z)*.025;g.rotation.y=Math.atan2(player.x-g.position.x,player.z-g.position.z);if(i===0&&Math.hypot(player.x-g.position.x,player.z-g.position.z)<3.2){const r=root.ESCIE_WORLD_LAW?.arrest?.();if(r?.ok)say3D("POLICE · ARRESTED · SENTENCE "+Number(r.sentence||0)+" MIN");}}}
function npcInteract(){const live=root.ESCIE_WORLD_NPC?.state?.().npcs||{};let best=null,bd=2.4;actors.forEach(a=>{if(!a.userData.canonical)return;const n=live[a.userData.id];if(!n||Number(n.health??100)<=0)return;const d=Math.hypot(player.x-a.position.x,player.z-a.position.z);if(d<bd){bd=d;best=n}});if(!best)return false;const sim=root.ESCIE_WORLD_SIMULATION?.state?.()||{};const raw=root.ESCIE_WORLD_DIALOGUE?.generate?.(best,{id:"player",name:"YOU"},{day:sim.day||1,hour:sim.hour||12,minute:sim.minute||0,language:best.native_language||"en",community:best.community||"LOCAL"})?.line||("LOCAL · "+(best.occupation||best.role||"RESIDENT"));const line=root.ESCIE_WORLD_LANGUAGE?.speakToPlayer?.(best,raw)||raw;root.ESCIE_WORLD_NPC?.rememberInteraction?.(best.id,{channel:"3D",text:raw});root.ESCIE_WORLD_NPC?.relationship?.(best.id,1,"3D CONVERSATION");root.ESCIE_WORLD_ACTIONS?.discover?.({id:"npc:"+best.id,label:best.name||best.role||best.id,discovery:"NPC CONTACT",queries:[best.occupation||best.role||"LOCAL"]});root.ESCIE_WORLD_ACTIONS?.awardRPGXP?.(5,"NPC CONTACT");say3D((best.name||best.role||"LOCAL")+" · "+line);return true}
function vehicleInteract(){const vs=root.ESCIE_WORLD_VEHICLES;if(!vs)return false;const state=vs.state?.()||{};if(player.inVehicle){const r=vs.exit?.();if(r?.ok){player.inVehicle=false;player.vehicleId=null;say3D("VEHICLE · EXITED · FOOT");return true}say3D("VEHICLE · "+String(r?.reason||"EXIT FAILED"));return true}const d=updateVehicles.car;if(!d||!d.visible||Math.hypot(player.x-d.position.x,player.z-d.position.z)>3)return false;const id=d.userData.vehicleId||state.owned?.[0]?.id||"TAXI";const r=vs.enter?.(id);if(r?.ok){player.inVehicle=true;player.vehicleId=id;say3D("VEHICLE · "+String(r.vehicle?.label||id)+" · DRIVE");return true}say3D("VEHICLE · "+String(r?.reason||"UNAVAILABLE"));return true}
function interact(){if(interiorMode)return exit3DInterior();if(evidenceInteract())return true;if(npcInteract())return true;if(vehicleInteract())return true;
 const near=doors.find(d=>Math.hypot(player.x-d.x,player.z-d.z)<2.4);
 if(near){if(near.open){root.ESCIE_WORLD_INTERIOR?.exit?.();near.open=false;near.mesh.rotation.y=0;say3D("EXITED · BACK ON THE STREET");return true}const st=root.ESCIE_WORLD_SIMULATION?.state?.(),b=near.building;if(b&&String(b.type||"").toUpperCase()==="SHOP"){const buy=root.ESCIE_WORLD_ACTIONS?.purchaseGameItem?.("game-item-green-pass");if(buy?.ok){say3D("SHOP · GREEN PASS PURCHASED · -3 SIGNAL");return true}if(buy?.reason==="INSUFFICIENT_SIGNAL"){say3D("SHOP · GREEN PASS · 3 SIGNAL REQUIRED");return true}if(buy?.reason==="ALREADY_OWNED")say3D("SHOP · GREEN PASS · ALREADY OWNED");}if(b){const result=root.ESCIE_WORLD_SIMULATION?.enterBuilding?.(st?.neighbourhood,b.id);if(!result?.ok){say3D("ACCESS · "+String(result?.reason||"DENIED"));return true}enter3DInterior(b);}near.open=true;near.mesh.rotation.y=Math.PI/2;say3D(b?"ENTERED · "+b.name:"DOOR OPEN · INTERIOR LAYER AVAILABLE");return true}
 return false;
}
function say3D(t){const log=document.getElementById("world-log");if(log)log.textContent=t}
function enter3DInterior(building){
 interiorMode=true;interiorBuilding=building;interiorSaved={x:player.x,z:player.z,yaw:player.yaw,obstacles:obstacles.slice()};
 doors.forEach(d=>{d.open=false;d.mesh.rotation.y=0});obstacles.length=0;
 worldGroup.children.forEach(o=>o.visible=false);
 interiorGroup=new THREE.Group();worldGroup.add(interiorGroup);
 const floor=new THREE.Mesh(new THREE.BoxGeometry(16,.12,12),makeMat(0x101114,.95));floor.position.y=0;interiorGroup.add(floor);
 [[0,2,-6],[0,2,6],[-8,2,0],[8,2,0]].forEach((p,i)=>{const w=new THREE.Mesh(new THREE.BoxGeometry(i<2?16:.12,4,i<2?.12:12),makeMat(0x292a2e,.96));w.position.set(p[0],p[1],p[2]);interiorGroup.add(w)});
 const desk=new THREE.Mesh(new THREE.BoxGeometry(3,.9,1.2),makeMat(0x1b1c1f,.9));desk.position.set(0,.45,-2);interiorGroup.add(desk);
 const signal=new THREE.Mesh(new THREE.BoxGeometry(.7,.08,.7),makeMat(0x2f80ff,.55,.2));signal.position.set(0,.95,-2);interiorGroup.add(signal);
 const light=new THREE.PointLight(0x4da3ff,2,18);light.position.set(0,3,0);interiorGroup.add(light);
 player.x=0;player.z=4.4;player.y=1.7;player.yaw=Math.PI;avatar.position.set(player.x,0,player.z);
 say3D("ENTERED · "+String(building?.name||"INTERIOR")+" · 3D");
}
function exit3DInterior(){
 if(!interiorMode)return false;root.ESCIE_WORLD_SIMULATION?.leaveBuilding?.();
 if(interiorGroup){worldGroup.remove(interiorGroup);interiorGroup=null}worldGroup.children.forEach(o=>o.visible=true);
 interiorMode=false;interiorBuilding=null;obstacles.splice(0,obstacles.length,...(interiorSaved?.obstacles||[]));
 player.x=interiorSaved?.x??player.x;player.z=interiorSaved?.z??player.z;player.yaw=interiorSaved?.yaw??player.yaw;avatar.position.set(player.x,0,player.z);
 say3D("EXITED · BACK ON THE STREET");return true;
}
function blocked(x,z){
 if(interiorMode)return Math.abs(x)>7.3||Math.abs(z)>5.3;
 const r=.45;
 const openDoor=doors.some(d=>d.open&&Math.hypot(x-d.x,z-d.z)<1.35);
 if(openDoor)return false;
 return obstacles.some(o=>Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r);
}
function move(dt){
 const gp=gamepadInput();
 if(gp.start&&!move._lastStart){togglePause();} move._lastStart=gp.start;
 if(gp.back&&!move._lastBack){document.querySelector("[data-system]")?.click?.();} move._lastBack=gp.back;
 player.yaw+=gp.lookX*dt*2.4;player.pitch=clamp(player.pitch-gp.lookY*dt*1.8,-1.2,1.2);
 if(gp.action&&!move._lastAction){document.querySelector("[data-action-primary]")?.click()} move._lastAction=gp.action;
 let f=(keys.has("w")||keys.has("arrowup")?1:0)-(keys.has("s")||keys.has("arrowdown")?1:0);
 let str=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0);f+=gp.f;str+=gp.str;
 const len=Math.hypot(f,str)||1;f/=len;str/=len;
 const sprinting=!player.inVehicle&&(keys.has("shift")||gp.sprint||move._touchSprint);const rpg=root.ESCIE_RPG,rs=root.ESCIE_WORLD_SIMULATION?.state?.()||{};const sprintCheck=rpg?.check?.(rs.rpg||{}, "ATHLETICS",2);let canSprint=sprinting&&(!rpg||!sprintCheck||sprintCheck.ok);if(canSprint&&performance.now()-player.lastSprintDrain>900){const body=root.ESCIE_WORLD_EQUIPMENT?.describe?.().equipped?.body?.id;const cost=body==="JACKET"?2:1;if(Number(rs.energy??0)<cost){canSprint=false;say3D("SPRINT · TOO EXHAUSTED");}else{root.ESCIE_WORLD_SIMULATION?.change?.({energy:-cost});player.lastSprintDrain=performance.now();}}const base=player.inVehicle?9.5:player.speed;const speed=(canSprint?base*1.45:base)*dt;
 const c=Math.cos(player.yaw),si=Math.sin(player.yaw);
 const nx=player.x+(-si*f+c*str)*speed,nz=player.z+(-c*f-si*str)*speed;
 if(!blocked(nx,player.z))player.x=nx;if(!blocked(player.x,nz))player.z=nz;
 player.x=clamp(player.x,-bounds,bounds);player.z=clamp(player.z,-bounds,bounds);
 const sim=root.ESCIE_WORLD_SIMULATION,st=sim?.state?.();if(st?.position&&performance.now()-player.lastSync>250){const gx=Math.max(0,Math.min(15,Math.round((player.x+54)/108*15))),gy=Math.max(0,Math.min(9,Math.round((player.z+54)/108*9)));if(gx!==player.lastGridX||gy!==player.lastGridY){sim.setPosition?.(gx,gy);player.lastGridX=gx;player.lastGridY=gy;}player.lastSync=performance.now();}
 avatar.position.set(player.x,0,player.z);avatar.rotation.y=player.yaw;
}
function updateVehicles(t){
 const vs=root.ESCIE_WORLD_VEHICLES?.state?.();if(!vs)return;
 const active=vs.current||vs.owned?.find?.(v=>v?.id)?.id||null;
 if(!updateVehicles.car){updateVehicles.car=new THREE.Group();updateVehicles.car.userData.escieVehicle=true;worldGroup.add(updateVehicles.car);}
 const type=String(vs.current?.type||vs.owned?.find?.(v=>v?.id===active)?.type||"").toUpperCase();
 if(active&&updateVehicles.car.userData.vehicleId!==active){
   updateVehicles.car.clear();
   const isCar=type==="CAR",isBike=type==="BIKE",isBoard=type==="BOARD";
   if(isCar){
     const body=new THREE.Mesh(new THREE.BoxGeometry(1.7,.55,3.4),makeMat(0x101114,.65,.35));body.position.y=.55;updateVehicles.car.add(body);
     const roof=new THREE.Mesh(new THREE.BoxGeometry(1.2,.35,1.6),makeMat(0x111615,.6));roof.position.y=.98;updateVehicles.car.add(roof);
   }else if(isBike){
     const frame=new THREE.Mesh(new THREE.BoxGeometry(.16,.16,2.4),makeMat(0x2f80ff,.55,.3));frame.position.y=.7;updateVehicles.car.add(frame);
     [-.82,.82].forEach(z=>{const wheel=new THREE.Mesh(new THREE.TorusGeometry(.38,.06,8,16),makeMat(0x101114,.8));wheel.rotation.x=Math.PI/2;wheel.position.set(0,.38,z);updateVehicles.car.add(wheel);});
     const seat=new THREE.Mesh(new THREE.BoxGeometry(.32,.12,.5),makeMat(0x292a2e,.8));seat.position.set(0,.9,.05);updateVehicles.car.add(seat);
   }else if(isBoard){
     const board=new THREE.Mesh(new THREE.BoxGeometry(.45,.08,2.3),makeMat(0x6f3faf,.7));board.position.y=.18;board.rotation.y=.08;updateVehicles.car.add(board);
     [-.7,.7].forEach(z=>{const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.12,12),makeMat(0x101114,.8));wheel.rotation.z=Math.PI/2;wheel.position.set(.18,.08,z);updateVehicles.car.add(wheel);});
   }
   updateVehicles.car.userData.vehicleId=active;updateVehicles.car.userData.vehicleType=type;
 }
 const condition=Math.max(0,Math.min(100,Number(vs.condition?.[active]??100)));
 const performanceFactor=.55+.45*(condition/100);
 updateVehicles.car.userData.condition=condition;
 updateVehicles.car.visible=!!active&&!interiorMode;
 if(player.inVehicle&&active){
   player.vehicleId=active;
   const base=type==="CAR"?9.5:type==="BIKE"?7.2:5.4;
   player.speed=base*performanceFactor;
   updateVehicles.car.position.set(player.x,0,player.z);updateVehicles.car.rotation.y=player.yaw;updateVehicles.car.visible=!interiorMode;
 }else if(active){
   updateVehicles.car.position.x=-4+Math.sin(t*.12)*7;updateVehicles.car.position.z=-10+Math.cos(t*.12)*18;updateVehicles.car.rotation.y=t*.12;
 }
}
function updateLaw(){const law=root.ESCIE_WORLD_LAW?.state?.();if(law)player.lawSync=performance.now()}
function worldHeartbeat(){if(!started||paused)return;const now=performance.now(),step=5000;if(!player.worldTick){player.worldTick=now;player.npcTick=now;return}if(now-player.worldTick<step)return;const elapsedMinutes=Math.max(1,Math.round((now-player.worldTick)/60000));player.worldTick=now;const sim=root.ESCIE_WORLD_SIMULATION,st=sim?.advance?.(elapsedMinutes);const s=sim?.state?.();if(s){if(!player.npcTick||now-player.npcTick>=30000){player.npcTick=now;root.ESCIE_WORLD_NPC?.tick?.(s.day,s.hour,s.minute,(x,y)=>{const d=String(s.neighbourhood||"PARC-EXTENSION").toUpperCase(),nodes=root.ESCIE_WORLD_SIMULATION?.streetGraph?.(d)?.nodes||[];const p=nodes.find(n=>Number(n.x)===Number(x)&&Number(n.y)===Number(y));if(!p)return false;return false;},elapsedMinutes);root.ESCIE_WORLD_NPC_LIFE?.syncRelationships?.();}root.ESCIE_WORLD_LAW?.tick?.();}}
function updateEnvironment(t){
 const st=root.ESCIE_WORLD_SIMULATION?.state?.()||{},cycle=((Number(st.hour||12)*60+Number(st.minute||0))/1440),angle=cycle*Math.PI*2;
 const daylight=Math.max(.08,Math.sin(angle-Math.PI/2)*.5+.5);const weather=String(st.weather||"COLD").toUpperCase();const snow=worldGroup?.children.find(o=>o.isPoints);if(snow)snow.visible=weather.includes("SNOW")||weather.includes("COLD");
 if(dayLight){dayLight.intensity=.35+daylight*1.25;dayLight.position.set(Math.cos(angle)*25,8+daylight*28,Math.sin(angle)*25);}
 if(ambientLight)ambientLight.intensity=.25+daylight*.6;
 if(scene?.fog)scene.fog.density=.014+(1-daylight)*.012;
}
function syncPauseMap(){const map=document.getElementById("world-map"),p=document.getElementById("world-player");if(!map||!p)return;const x=Math.max(0,Math.min(100,(player.x+54)/108*100)),y=Math.max(0,Math.min(100,(player.z+54)/108*100));p.style.left=x+"%";p.style.top=y+"%";p.title="PLAYER · "+Math.round(player.x+54)+" · "+Math.round(player.z+54);const sim=root.ESCIE_WORLD_SIMULATION?.state?.()||{};map.dataset.neighbourhood=String(sim.neighbourhood||"PARC-EXTENSION");map.dataset.transport=String(sim.transport||"FOOT");}
function updateHud(){
 const st=root.ESCIE_WORLD_SIMULATION?.state?.()||{},coord=document.getElementById("world-coordinates"),sig=document.getElementById("world-signal");
 if(coord)coord.textContent=Math.round(player.x+54).toString().padStart(2,"0")+" · "+Math.round(player.z+54).toString().padStart(2,"0");if(st)document.getElementById("world-location")&&(document.getElementById("world-location").textContent=st.neighbourhood||"PARC-EXTENSION");
 if(sig){const distance=Math.hypot(player.x,player.z),wanted=Number(st?.wanted||0);sig.textContent=Math.max(0,100-Math.round(distance)+wanted*5).toString()+" SIGNAL";}const status=document.getElementById("escie-3d-status");if(status){status.textContent="LV "+Number(st?.rpg?.level||1)+" · HP "+Number(st.health??100)+" · ENERGY "+Number(st.energy??100)+" · WANTED "+Number(st.wanted||0)+" · $"+Number(st.money||0);}
}
function updateQuality(dt){const ms=dt*1000;perf.frameMs=perf.frameMs*.92+ms*.08;if(perf.frameMs>28)perf.lowFrames++;else perf.lowFrames=Math.max(0,perf.lowFrames-1);if(perf.lowFrames>90&&perf.quality!=="low"){perf.quality="low";worldGroup?.traverse(o=>{if(o.isPoints)o.visible=false;});renderer?.setPixelRatio(Math.min(devicePixelRatio||1,1));}} 
function updateActors(t){
 actors.forEach(a=>{if(a.userData.canonical){if(a.userData.reaction&&performance.now()<Number(a.userData.reactionUntil||0)){a.rotation.y+=a.userData.reaction==="HOSTILE"?.08:-.04;}return}a.position.x=a.userData.base+Math.sin(t*.35+a.userData.phase)*.8;a.rotation.y=Math.sin(t*.35+a.userData.phase)*.25;});
}
function render(){
 const dt=Math.min(clock.getDelta(),.05);updateQuality(dt);move(dt);worldHeartbeat();updateLaw();updateActors(clock.elapsedTime);syncCanonicalNPCs(clock.elapsedTime);updateVehicles(clock.elapsedTime);updatePolice();updateEnvironment(clock.elapsedTime);if(performance.now()-perf.hud>120){updateHud();syncPauseMap();perf.hud=performance.now();}
 if(thirdPerson){
   const back=new THREE.Vector3(Math.sin(player.yaw)*4.2,2.4,Math.cos(player.yaw)*4.2);
   camera.position.set(player.x+back.x,back.y,player.z+back.z);camera.lookAt(player.x,1.1,player.z);
 }else{
   camera.position.set(player.x,player.y,player.z);
   camera.rotation.order="YXZ";camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;
 }
 renderer.render(scene,camera);raf=requestAnimationFrame(render);
}
function stop(){paused=false;if(raf)cancelAnimationFrame(raf);raf=0;document.exitPointerLock?.();if(resizeObserver){resizeObserver.disconnect();resizeObserver=null;}window.removeEventListener("resize",resize);if(visibilityHandler)document.removeEventListener("visibilitychange",visibilityHandler);started=false;}
function togglePause(force){
 const next=typeof force==="boolean"?force:!paused;
 paused=next;
 document.body.classList.toggle("is-world-paused",paused);
 const map=document.getElementById("world-map");
 if(map)map.setAttribute("aria-hidden",paused?"false":"true");
 const panel=document.getElementById("world-pause");
 if(panel)panel.hidden=!paused;
 if(paused){root.ESCIE_WORLD_SIMULATION?.flush?.();root.ESCIE_WORLD_ACTIONS?.save?.();syncPauseMap();if(raf)cancelAnimationFrame(raf);raf=0;document.exitPointerLock?.();}
 else if(started&&!raf){clock.start();render();}
 const log=document.getElementById("world-log");
 if(log)log.textContent=paused?"PAUSED · MAP / SYSTEM":"3D REALITY · "+(thirdPerson?"THIRD PERSON":"FIRST PERSON");
 return paused;
}
function setMode(v){
 thirdPerson=!!v;avatar.visible=thirdPerson;
 const log=document.getElementById("world-log");if(log)log.textContent=thirdPerson?"3D REALITY · THIRD PERSON":"3D REALITY · FIRST PERSON";
}
function bind(){
 document.addEventListener("click",e=>{const control=e.target.closest("[data-control-action]");if(control){const type=control.dataset.controlAction;if(type==="SPRINT"){move._touchSprint=true;setTimeout(()=>move._touchSprint=false,500)}else if(type==="OPEN")interact();else if(type==="FIGHT"){fight3D()||root.ESCIE_WORLD_ACTIONS?.performControlAction?.(type)}else if(type==="STEAL")root.ESCIE_WORLD_ACTIONS?.performControlAction?.(type);}});
 document.addEventListener("click",e=>{
   const b=e.target.closest("[data-3d-camera]");if(b){setMode(!thirdPerson);b.textContent=thirdPerson?"FIRST PERSON":"THIRD PERSON";}
   const p=e.target.closest("[data-pause]");if(p)togglePause();
   const r=e.target.closest("[data-world-resume]");if(r)togglePause(false);const s=e.target.closest("[data-save]");if(s&&paused){root.ESCIE_WORLD_ACTIONS?.save?.();}const x=e.target.closest("[data-return-pause]");if(x&&paused){window.location.href="../";}
 });
 document.querySelectorAll("[data-dir]").forEach(b=>{
   const map={up:"w",down:"s",left:"a",right:"d"};const k=map[b.dataset.dir];
   const on=e=>{e.preventDefault();keys.add(k)},off=e=>{e.preventDefault();keys.delete(k)};
   b.addEventListener("pointerdown",on);b.addEventListener("pointerup",off);b.addEventListener("pointerleave",off);b.addEventListener("pointercancel",off);
 });
}
function start(){
 if(started)return;started=true;if(!setup()){started=false;return;}
 bind();const s=stage();s.classList.add("three-active");setMode(false);togglePause(false);render();
}
root.ESCIE_3D_WORLD={start,stop,ready:()=>!!renderer,toggleCamera:()=>setMode(!thirdPerson),interact,fight:fight3D,setSprint:(v)=>{move._touchSprint=!!v},status:()=>({ready:!!renderer,quality:perf.quality,frameMs:Math.round(perf.frameMs)})};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();