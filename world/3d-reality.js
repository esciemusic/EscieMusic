/* ESCIE 3D REALITY LAYER
 * Procedural Montréal-inspired playable scene.
 * No canonical truth is written here; gameplay state remains separate.
 */
(function(){
"use strict";
const root=window;
let renderer,scene,camera,clock,avatar,worldGroup,thirdPerson=false,started=false,raf=0;
const obstacles=[],actors=[];
const keys=new Set();
const player={x:0,z:8,y:1.7,yaw:0,pitch:0,speed:4.2,sprint:7.5};
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
 const g=new THREE.Mesh(new THREE.PlaneGeometry(130,130),new THREE.MeshStandardMaterial({color:0x292b2b,roughness:1}));
 g.rotation.x=-Math.PI/2;worldGroup.add(g);
 for(let i=-50;i<=50;i+=10){box(.08,.01,130,0x3a3c3c,i,.01,0);box(130,.01,.08,0x3a3c3c,0,.012,i);}
 box(9,.04,130,0x171918,0,.04,0);
 for(let z=-54;z<54;z+=8){box(.18,.025,3.6,0xc7c8bd,0,.07,z);}
}
function building(x,z,w,d,h,seed){
 const wall=[0x343638,0x45474a,0x56585a,0x303235][seed%4];
 box(w,h,d,wall,x,h/2,z,{roughness:.96,solid:true});
 const rows=Math.max(2,Math.floor(h/3)), cols=Math.max(2,Math.floor(w/2.8));
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
   const px=x-w/2+1.2+c*((w-2.4)/Math.max(1,cols-1));
   const py=1.8+r*((h-3)/Math.max(1,rows-1));
   const lit=(seed+r*7+c*3)%5===0;
   box(.55,.85,.035,lit?0x9ca36f:0x171a1a,px,py,z-d/2-.02);
 }
 if(seed%3===0) box(w*.65,.12,d*.7,0x1e2020,x,h+.08,z);
}
function actor(x,z,seed){
 const g=new THREE.Group();
 const coat=[0x141918,0x202726,0x303735][seed%3];
 const b=new THREE.Mesh(new THREE.CapsuleGeometry(.2,.65,4,8),makeMat(coat,.95));b.position.y=.62;g.add(b);
 const h=new THREE.Mesh(new THREE.SphereGeometry(.17,12,8),makeMat(0x373b38,.98));h.position.y=1.3;g.add(h);
 g.position.set(x,0,z);g.userData={id:"street-person-"+seed,drift:(seed%2?1:-1),base:x,phase:seed};
 worldGroup.add(g);actors.push(g);
}
function createStreetLife(){
 for(let i=0;i<18;i++){const x=(i%2?1:-1)*(6.5+(i%4)*1.1),z=-45+i*5.2;actor(x,z,i);}
}
function streetProps(){
 for(let z=-48;z<=48;z+=12){
   cyl(.08,4.5,0x151718,-5,2.25,z);
   const lamp=box(.12,.12,.9,0x8e918c,-5,4.35,z,{metalness:.6});lamp.rotation.z=.15;
   box(.28,.08,.18,0xb9c4a0,-5.25,4.25,z);
 }
 for(let z=-44;z<=44;z+=11){
   const side=z%22===0?-9:9;
   box(1.8,.45,4.1,0x343a3c,side,.45,z,{roughness:.8});
   box(1.55,.3,1.9,0x202324,side,1.0,z);
 }
}
function createSnow(){
 const geo=new THREE.BufferGeometry(),n=850,pos=new Float32Array(n*3);
 for(let i=0;i<n;i++){pos[i*3]=(Math.random()-.5)*120;pos[i*3+1]=Math.random()*22;pos[i*3+2]=(Math.random()-.5)*120;}
 geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
 const mat=new THREE.PointsMaterial({color:0xd9ddda,size:.055,transparent:true,opacity:.62});
 worldGroup.add(new THREE.Points(geo,mat));
}
function buildScene(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0x090d0c);scene.fog=new THREE.FogExp2(0x0b100f,.018);
 worldGroup=new THREE.Group();scene.add(worldGroup);
 scene.add(new THREE.HemisphereLight(0xaebbc0,0x101312,.8));
 const moon=new THREE.DirectionalLight(0xb9d0c9,1.5);moon.position.set(-18,30,12);scene.add(moon);
 const green=new THREE.PointLight(0x8faf72,3.5,20);green.position.set(0,5,6);scene.add(green);
 createGround();
 let seed=1;
 for(let x=-34;x<=34;x+=12)for(let z=-52;z<=52;z+=13){
   if(Math.abs(x)<10)continue;
   building(x,z,9+seed%4,9+seed%5,9+(seed%5)*2,seed++);
 }
 streetProps();createStreetLife();createSnow();
 avatar=new THREE.Group();
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.9,5,10),makeMat(0x111313,.9));
 body.position.y=.8;avatar.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),makeMat(0x303535,.95));head.position.y=1.55;avatar.add(head);
 avatar.position.set(player.x,.0,player.z);scene.add(avatar);
}
function resize(){
 const s=stage();if(!renderer||!s)return;const r=s.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
}
function setup(){
 const s=stage();if(!s||!window.THREE)return false;
 if(s.querySelector(".escie-3d-canvas"))return true;
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.domElement.className="escie-3d-canvas";renderer.domElement.setAttribute("aria-label","ESCIE 3D playable world");s.appendChild(renderer.domElement);
 camera=new THREE.PerspectiveCamera(70,1,.05,180);clock=new THREE.Clock();buildScene();resize();window.addEventListener("resize",resize);
 renderer.domElement.addEventListener("click",()=>renderer.domElement.requestPointerLock?.());
 renderer.domElement.addEventListener("mousemove",e=>{if(document.pointerLockElement!==renderer.domElement)return;player.yaw-=e.movementX*.0022;player.pitch=clamp(player.pitch-e.movementY*.0018,-1.2,1.2);});
 document.addEventListener("keydown",e=>{keys.add(e.key.toLowerCase());if(["w","a","s","d","shift","arrowup","arrowdown","arrowleft","arrowright"].includes(e.key.toLowerCase()))e.preventDefault();});
 document.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
 document.addEventListener("keydown",e=>{if(e.key.toLowerCase()==="e"){document.querySelector("[data-action-primary]")?.click();}});
 let touchLook=null;
 renderer.domElement.addEventListener("touchstart",e=>{if(e.touches.length===1)touchLook={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
 renderer.domElement.addEventListener("touchmove",e=>{if(!touchLook||e.touches.length!==1)return;const t=e.touches[0];player.yaw-=(t.clientX-touchLook.x)*.006;player.pitch=clamp(player.pitch-(t.clientY-touchLook.y)*.004,-1.2,1.2);touchLook={x:t.clientX,y:t.clientY};},{passive:true});
 renderer.domElement.addEventListener("touchend",()=>touchLook=null,{passive:true});
 document.addEventListener("blur",()=>keys.clear());
 return true;
}
function gamepadInput(){
 const pads=navigator.getGamepads?.()||[];const p=[...pads].find(Boolean);if(!p)return {f:0,str:0,sprint:false,action:false};
 return {f:-Number(p.axes?.[1]||0),str:Number(p.axes?.[0]||0),sprint:!!p.buttons?.[10]?.pressed,action:!!p.buttons?.[0]?.pressed};
}
function blocked(x,z){
 const r=.45;
 return obstacles.some(o=>Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r);
}
function move(dt){
 const gp=gamepadInput();
 if(gp.action&&!move._lastAction){document.querySelector("[data-action-primary]")?.click()} move._lastAction=gp.action;
 let f=(keys.has("w")||keys.has("arrowup")?1:0)-(keys.has("s")||keys.has("arrowdown")?1:0);
 let str=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0);f+=gp.f;str+=gp.str;
 const len=Math.hypot(f,str)||1;f/=len;str/=len;
 const speed=((keys.has("shift")||gp.sprint)?player.speed*1.75:player.speed)*dt;
 const c=Math.cos(player.yaw),si=Math.sin(player.yaw);
 const nx=player.x+(-si*f+c*str)*speed,nz=player.z+(-c*f-si*str)*speed;
 if(!blocked(nx,player.z))player.x=nx;if(!blocked(player.x,nz))player.z=nz;
 player.x=clamp(player.x,-bounds,bounds);player.z=clamp(player.z,-bounds,bounds);
 const sim=root.ESCIE_WORLD_SIMULATION,st=sim?.state?.();if(st&&st.position){st.position.x=player.x;st.position.y=player.z;}
 avatar.position.set(player.x,0,player.z);avatar.rotation.y=player.yaw;
}
function updateHud(){
 const coord=document.getElementById("world-coordinates"),sig=document.getElementById("world-signal");
 if(coord)coord.textContent=Math.round(player.x+54).toString().padStart(2,"0")+" · "+Math.round(player.z+54).toString().padStart(2,"0");
 if(sig){const distance=Math.hypot(player.x,player.z);sig.textContent=Math.max(0,100-Math.round(distance)).toString()+" SIGNAL";}
}
function updateActors(t){
 actors.forEach(a=>{a.position.x=a.userData.base+Math.sin(t*.35+a.userData.phase)*.8;a.rotation.y=Math.sin(t*.35+a.userData.phase)*.25;});
}
function render(){
 const dt=Math.min(clock.getDelta(),.05);move(dt);updateActors(clock.elapsedTime);updateHud();
 if(thirdPerson){
   const back=new THREE.Vector3(Math.sin(player.yaw)*4.2,2.4,Math.cos(player.yaw)*4.2);
   camera.position.set(player.x+back.x,back.y,player.z+back.z);camera.lookAt(player.x,1.1,player.z);
 }else{
   camera.position.set(player.x,player.y,player.z);
   camera.rotation.order="YXZ";camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;
 }
 renderer.render(scene,camera);raf=requestAnimationFrame(render);
}
function setMode(v){
 thirdPerson=!!v;avatar.visible=thirdPerson;
 const log=document.getElementById("world-log");if(log)log.textContent=thirdPerson?"3D REALITY · THIRD PERSON":"3D REALITY · FIRST PERSON";
}
function bind(){
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
root.ESCIE_3D_WORLD={start,ready:()=>!!renderer,toggleCamera:()=>setMode(!thirdPerson)};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();