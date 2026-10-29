/* ESCIE 3D REALITY LAYER
 * Procedural Montréal-inspired playable scene.
 * No canonical truth is written here; gameplay state remains separate.
 */
(function(){
"use strict";
const root=window;
let renderer,scene,camera,clock,avatar,worldGroup,thirdPerson=false,started=false,raf=0,dayLight,ambientLight,resizeObserver,visibilityHandler;
const obstacles=[],actors=[],doors=[],lights=[],evidence=[]; const perf={quality:"auto",frameMs:16,lowFrames:0,last:performance.now(),hud:0};
const keys=new Set();
const player={x:0,z:8,y:1.7,yaw:0,pitch:0,speed:4.2,sprint:7.5,lastSync:0,lastGridX:null,lastGridY:null,inVehicle:false,vehicleId:null,npcSync:0,lawSync:0};
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
 if(s.querySelector(".escie-3d-canvas"))return true;
 try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});}catch(e){say3D("3D UNAVAILABLE · 2D MAP REMAINS PLAYABLE");return false}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.domElement.className="escie-3d-canvas";renderer.domElement.setAttribute("aria-label","ESCIE 3D playable world");s.appendChild(renderer.domElement);
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
 visibilityHandler=()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0}else if(started&&!raf){clock.start();render();}};document.addEventListener("visibilitychange",visibilityHandler);
 return true;
}
function gamepadInput(){
 const pads=navigator.getGamepads?.()||[];const p=[...pads].find(Boolean);if(!p)return {f:0,str:0,lookX:0,lookY:0,sprint:false,action:false};
 const dz=v=>Math.abs(v)<.14?0:v;return {f:-dz(Number(p.axes?.[1]||0)),str:dz(Number(p.axes?.[0]||0)),lookX:dz(Number(p.axes?.[2]||0)),lookY:dz(Number(p.axes?.[3]||0)),sprint:!!p.buttons?.[10]?.pressed,action:!!p.buttons?.[0]?.pressed};
}
function evidenceInteract(){const m=updateEvidence();if(!m)return false;const o=m.userData.evidence;const r=root.ESCIE_WORLD_ACTIONS?.interactObject?.(o);if(r!==false){say3D("EVIDENCE · "+String(o.label||o.id)+" · LOGGED");return true}return false}
function vehicleInteract(){const vs=root.ESCIE_WORLD_VEHICLES;if(!vs)return false;if(player.inVehicle){const r=vs.exit?.();if(r?.ok){player.inVehicle=false;player.vehicleId=null;say3D("VEHICLE · EXITED");return true}return true}const d=updateVehicles.car;if(!d||Math.hypot(player.x-d.position.x,player.z-d.position.z)>3)return false;const id=d.userData.vehicleId||vs.state?.()?.owned?.[0]?.id||"TAXI";const r=vs.enter?.(id);if(r?.ok){player.inVehicle=true;player.vehicleId=id;say3D("VEHICLE · DRIVE");return true}say3D("VEHICLE · "+String(r?.reason||"UNAVAILABLE"));return true}
function interact(){if(evidenceInteract())return true;if(vehicleInteract())return true;
 const near=doors.find(d=>Math.hypot(player.x-d.x,player.z-d.z)<2.4);
 if(near){if(near.open){root.ESCIE_WORLD_INTERIOR?.exit?.();near.open=false;near.mesh.rotation.y=0;say3D("EXITED · BACK ON THE STREET");return true}const st=root.ESCIE_WORLD_SIMULATION?.state?.(),b=near.building;if(b){const result=root.ESCIE_WORLD_SIMULATION?.enterBuilding?.(st?.neighbourhood,b.id);if(!result?.ok){say3D("ACCESS · "+String(result?.reason||"DENIED"));return true}root.dispatchEvent(new CustomEvent("escie:world-interior-enter",{detail:result}));}near.open=true;near.mesh.rotation.y=Math.PI/2;say3D(b?"ENTERED · "+b.name:"DOOR OPEN · INTERIOR LAYER AVAILABLE");return true}
 return false;
}
function say3D(t){const log=document.getElementById("world-log");if(log)log.textContent=t}
function blocked(x,z){
 const r=.45;
 const openDoor=doors.some(d=>d.open&&Math.hypot(x-d.x,z-d.z)<1.35);
 if(openDoor)return false;
 return obstacles.some(o=>Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r);
}
function move(dt){
 const gp=gamepadInput();
 player.yaw+=gp.lookX*dt*2.4;player.pitch=clamp(player.pitch-gp.lookY*dt*1.8,-1.2,1.2);
 if(gp.action&&!move._lastAction){document.querySelector("[data-action-primary]")?.click()} move._lastAction=gp.action;
 let f=(keys.has("w")||keys.has("arrowup")?1:0)-(keys.has("s")||keys.has("arrowdown")?1:0);
 let str=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0);f+=gp.f;str+=gp.str;
 const len=Math.hypot(f,str)||1;f/=len;str/=len;
 const base=player.inVehicle?9.5:player.speed;const speed=((keys.has("shift")||gp.sprint||move._touchSprint)?base*1.45:base)*dt;
 const c=Math.cos(player.yaw),si=Math.sin(player.yaw);
 const nx=player.x+(-si*f+c*str)*speed,nz=player.z+(-c*f-si*str)*speed;
 if(!blocked(nx,player.z))player.x=nx;if(!blocked(player.x,nz))player.z=nz;
 player.x=clamp(player.x,-bounds,bounds);player.z=clamp(player.z,-bounds,bounds);
 const sim=root.ESCIE_WORLD_SIMULATION,st=sim?.state?.();if(st?.position&&performance.now()-player.lastSync>250){const gx=Math.max(0,Math.min(15,Math.round((player.x+54)/108*15))),gy=Math.max(0,Math.min(9,Math.round((player.z+54)/108*9)));if(gx!==player.lastGridX||gy!==player.lastGridY){sim.setPosition?.(gx,gy);player.lastGridX=gx;player.lastGridY=gy;}player.lastSync=performance.now();}
 avatar.position.set(player.x,0,player.z);avatar.rotation.y=player.yaw;
}
function updateVehicles(t){
 const vs=root.ESCIE_WORLD_VEHICLES?.state?.(); if(!vs)return;
 if(!updateVehicles.car){
  updateVehicles.car=new THREE.Group();updateVehicles.car.userData.escieVehicle=true;const body=new THREE.Mesh(new THREE.BoxGeometry(1.7,.55,3.4),makeMat(0x101114,.65,.35));body.position.y=.55;updateVehicles.car.add(body);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(1.2,.35,1.6),makeMat(0x111615,.6));roof.position.y=.98;updateVehicles.car.add(roof);
  updateVehicles.car.position.set(-4,.0,-10);worldGroup.add(updateVehicles.car);
 }
 const active=vs.current;updateVehicles.car.visible=!!active;
 if(player.inVehicle){updateVehicles.car.position.set(player.x,0,player.z);updateVehicles.car.rotation.y=player.yaw;updateVehicles.car.visible=true}else if(active){updateVehicles.car.position.x=-4+Math.sin(t*.12)*7;updateVehicles.car.position.z=-10+Math.cos(t*.12)*18;updateVehicles.car.rotation.y=t*.12;}
}
function updateLaw(){const law=root.ESCIE_WORLD_LAW?.state?.();if(law)player.lawSync=performance.now()}
function updateEnvironment(t){
 const st=root.ESCIE_WORLD_SIMULATION?.state?.()||{},cycle=((Number(st.hour||12)*60+Number(st.minute||0))/1440),angle=cycle*Math.PI*2;
 const daylight=Math.max(.08,Math.sin(angle-Math.PI/2)*.5+.5);const weather=String(st.weather||"COLD").toUpperCase();const snow=worldGroup?.children.find(o=>o.isPoints);if(snow)snow.visible=weather.includes("SNOW")||weather.includes("COLD");
 if(dayLight){dayLight.intensity=.35+daylight*1.25;dayLight.position.set(Math.cos(angle)*25,8+daylight*28,Math.sin(angle)*25);}
 if(ambientLight)ambientLight.intensity=.25+daylight*.6;
 if(scene?.fog)scene.fog.density=.014+(1-daylight)*.012;
}
function updateHud(){
 const st=root.ESCIE_WORLD_SIMULATION?.state?.()||{},coord=document.getElementById("world-coordinates"),sig=document.getElementById("world-signal");
 if(coord)coord.textContent=Math.round(player.x+54).toString().padStart(2,"0")+" · "+Math.round(player.z+54).toString().padStart(2,"0");if(st)document.getElementById("world-location")&&(document.getElementById("world-location").textContent=st.neighbourhood||"PARC-EXTENSION");
 if(sig){const distance=Math.hypot(player.x,player.z),wanted=Number(st?.wanted||0);sig.textContent=Math.max(0,100-Math.round(distance)+wanted*5).toString()+" SIGNAL";}
}
function updateQuality(dt){const ms=dt*1000;perf.frameMs=perf.frameMs*.92+ms*.08;if(perf.frameMs>28)perf.lowFrames++;else perf.lowFrames=Math.max(0,perf.lowFrames-1);if(perf.lowFrames>90&&perf.quality!=="low"){perf.quality="low";worldGroup?.traverse(o=>{if(o.isPoints)o.visible=false;});renderer?.setPixelRatio(Math.min(devicePixelRatio||1,1));}} 
function updateActors(t){
 actors.forEach(a=>{if(a.userData.canonical)return;a.position.x=a.userData.base+Math.sin(t*.35+a.userData.phase)*.8;a.rotation.y=Math.sin(t*.35+a.userData.phase)*.25;});
}
function render(){
 const dt=Math.min(clock.getDelta(),.05);updateQuality(dt);move(dt);updateLaw();updateActors(clock.elapsedTime);syncCanonicalNPCs(clock.elapsedTime);updateVehicles(clock.elapsedTime);updateEnvironment(clock.elapsedTime);if(performance.now()-perf.hud>120){updateHud();perf.hud=performance.now();}
 if(thirdPerson){
   const back=new THREE.Vector3(Math.sin(player.yaw)*4.2,2.4,Math.cos(player.yaw)*4.2);
   camera.position.set(player.x+back.x,back.y,player.z+back.z);camera.lookAt(player.x,1.1,player.z);
 }else{
   camera.position.set(player.x,player.y,player.z);
   camera.rotation.order="YXZ";camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;
 }
 renderer.render(scene,camera);raf=requestAnimationFrame(render);
}
function stop(){if(raf)cancelAnimationFrame(raf);raf=0;document.exitPointerLock?.();if(resizeObserver){resizeObserver.disconnect();resizeObserver=null;}window.removeEventListener("resize",resize);if(visibilityHandler)document.removeEventListener("visibilitychange",visibilityHandler);started=false;}
function setMode(v){
 thirdPerson=!!v;avatar.visible=thirdPerson;
 const log=document.getElementById("world-log");if(log)log.textContent=thirdPerson?"3D REALITY · THIRD PERSON":"3D REALITY · FIRST PERSON";
}
function bind(){
 document.addEventListener("click",e=>{const control=e.target.closest("[data-control-action]");if(control){const type=control.dataset.controlAction;if(type==="SPRINT"){move._touchSprint=true;setTimeout(()=>move._touchSprint=false,500)}else if(type==="OPEN")interact();else if(type==="FIGHT"||type==="STEAL")root.ESCIE_WORLD_ACTIONS?.performControlAction?.(type);}});
 document.addEventListener("click",e=>{
   const b=e.target.closest("[data-3d-camera]");if(b){setMode(!thirdPerson);b.textContent=thirdPerson?"FIRST PERSON":"THIRD PERSON";}
   const t=e.target.closest("[data-3d-toggle]");if(t){const s=stage();s?.classList.toggle("three-active");t.textContent=s?.classList.contains("three-active")?"2D MAP":"3D REALITY";resize();}
 });
 document.querySelectorAll("[data-dir]").forEach(b=>{
   const map={up:"w",down:"s",left:"a",right:"d"};const k=map[b.dataset.dir];
   const on=e=>{e.preventDefault();keys.add(k)},off=e=>{e.preventDefault();keys.delete(k)};
   b.addEventListener("pointerdown",on);b.addEventListener("pointerup",off);b.addEventListener("pointerleave",off);b.addEventListener("pointercancel",off);
 });
}
function start(){
 if(started)return;started=true;if(!setup()){started=false;return;}
 bind();const s=stage();s.classList.add("three-active");setMode(false);render();
}
root.ESCIE_3D_WORLD={start,stop,ready:()=>!!renderer,toggleCamera:()=>setMode(!thirdPerson),status:()=>({ready:!!renderer,quality:perf.quality,frameMs:Math.round(perf.frameMs)})};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();