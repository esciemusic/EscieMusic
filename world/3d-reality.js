/* ESCIE 3D REALITY LAYER
 * Procedural Montréal-inspired playable scene.
 * No canonical truth is written here; gameplay state remains separate.
 */
(function(){
"use strict";
const root=window;
let renderer,scene,camera,clock,avatar,worldGroup,thirdPerson=true,started=false,paused=false,raf=0,dayLight,ambientLight,playerLight,resizeObserver,visibilityHandler;
const obstacles=[],actors=[],doors=[],lights=[],evidence=[],interiorActors=[],interiorStations=[],securityCameras=[];
const windowLights=[],streetMarkings=[],laneMarkings=[],groundMeshes=[],readabilityLights=[],facadeMeshes=[],playerRimLights=[],doorSignals=[],actorReadabilityMeshes=[],traffic=[];
const vehicleImpacts={last:0,cooldown:900}; const perf={quality:"auto",frameMs:16,lowFrames:0,last:performance.now(),hud:0}; let lastEnvironmentKey="";let lastDistrictKey="";let snowMesh=null;
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
 const g=new THREE.Mesh(new THREE.PlaneGeometry(130,130),new THREE.MeshStandardMaterial({color:0x1d1f20,roughness:.94,metalness:.02}));
 g.userData.worldGround=true;g.rotation.x=-Math.PI/2;worldGroup.add(g);groundMeshes.push(g);
 for(let i=-50;i<=50;i+=10){const a=box(.08,.01,130,0x3a3c3c,i,.01,0);const b=box(130,.01,.08,0x3a3c3c,0,.012,i);a.userData.streetMarking=true;b.userData.streetMarking=true;streetMarkings.push(a,b);}
 box(9,.04,130,0x171918,0,.04,0);
 for(let z=-54;z<54;z+=8){const m=box(.18,.025,3.6,0xc7c8bd,0,.07,z);m.userData.laneMarking=true;laneMarkings.push(m);}
}
function door(x,z,w,h,seed,building){
 const mat=makeMat(seed%2?0x292a2e:0x101114,.72,(seed%2 ? .2 : 0));
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,.08),mat);m.position.set(x, h/2, z);worldGroup.add(m);
 const sign=new THREE.Mesh(new THREE.BoxGeometry(w*.7,.08,.02),makeMat(0x2f80ff,.7));sign.position.set(x,h*.78,z-.06);sign.userData.doorSignal=true;sign.userData.baseEmissive=.12;sign.material.emissive=new THREE.Color(0x2f80ff);sign.material.emissiveIntensity=.12;worldGroup.add(sign);doorSignals.push(sign);
 doors.push({mesh:m,x,z,w:.9,h:2.2,id:"door-"+seed,open:false,building});
 return m;
}
function building(x,z,w,d,h,seed,buildingRef){
 const wall=[0x1b1c1f,0x292a2e,0x303235,0x101114][seed%4];
 const facade=box(w,h,d,wall,x,h/2,z,{roughness:.96,solid:true});
 facade.userData.facade=true;facade.userData.baseFacadeColor=wall;facadeMeshes.push(facade);
 const rows=Math.max(2,Math.floor(h/3)), cols=Math.max(2,Math.floor(w/2.8));
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
   const px=x-w/2+1.2+c*((w-2.4)/Math.max(1,cols-1));
   const py=1.8+r*((h-3)/Math.max(1,rows-1));
   const lit=(seed+r*7+c*3)%5===0;
   const window=box(.55,.85,.035,lit?0x70747a:0x101114,px,py,z-d/2-.02);
   if(lit){window.userData.windowLight=true;window.userData.baseEmissive=.35;window.material.emissive=new THREE.Color(0x3d4039);window.material.emissiveIntensity=.35;windowLights.push(window);}
 }
 if(seed%3===0){
   box(w*.65,.12,d*.7,0x1e2020,x,h+.08,z);
   const interiorLight=new THREE.PointLight(0xc7d6c0,.35,7,2);
   interiorLight.position.set(x,Math.min(h-1.2,Math.max(2.2,h*.55)),z-d/2+.5);
   interiorLight.userData.baseIntensity=.35;
   interiorLight.userData.readabilityLight=true;
   worldGroup.add(interiorLight);lights.push(interiorLight);readabilityLights.push(interiorLight);
 }
 if(seed%2===0 || buildingRef){const dm=door(x,z-d/2-.055,1.15,2.2,seed,buildingRef);if(buildingRef)buildingRef.__worldDoor={x,z:z-d/2-.055,mesh:dm};}
}
function actor(x,z,seed){
 const g=new THREE.Group();
 const coat=[0x141918,0x202726,0x303735][seed%3];
 const b=new THREE.Mesh(new THREE.CapsuleGeometry(.2,.65,4,8),makeMat(coat,.95));b.position.y=.62;g.add(b);
 const h=new THREE.Mesh(new THREE.SphereGeometry(.17,12,8),makeMat(0x373b38,.98));h.position.y=1.3;g.add(h);
 g.position.set(x,0,z);g.userData={id:"street-person-"+seed,drift:(seed%2?1:-1),base:x,phase:seed,readabilityMeshes:[b,h],baseCoatColor:coat,baseHeadColor:0x373b38};actorReadabilityMeshes.push(g);
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
function syncCanonicalNPCs(t){
 const api=root.ESCIE_WORLD_NPC;if(!api)return;
 const live=api.state?.().npcs||{},now=performance.now();
 const sim=root.ESCIE_WORLD_SIMULATION?.state?.()||{};
 const minute=Number(sim.hour||12)*60+Number(sim.minute||0);
 const currentWindow=n=>Array.isArray(n.schedule)?(n.schedule.find(v=>minute>=Number(v.start||0)&&minute<Number(v.end||0))||null):null;
 actors.forEach(a=>{
  if(!a.userData.canonical)return;
  const n=live[a.userData.id];if(!n){a.visible=false;return}
  a.visible=Number(n.health??100)>0;
  const scheduleWindow=currentWindow(n),scheduledActivity=String(scheduleWindow?.activity||n.activity||"IDLE").toUpperCase();
  const district=String(n.district||sim.neighbourhood||"").toUpperCase();
  if(!["WORK","SOCIAL","SLEEP","HOME","COMMUTE"].includes(scheduledActivity)){a.visible=Number(n.health??100)>0;n.current_building_id=null;n.current_building_state="OUTSIDE";a.userData.enteringBuilding=null;a.userData.enteringUntil=0;a.userData.doorTransition="OUTSIDE";}

  const buildings=root.ESCIE_WORLD_SIMULATION?.districtBuildings?.(district)||[];
  const destinationId=scheduledActivity==="WORK"?(n.workplace_id||n.work_building?.id):scheduledActivity==="SOCIAL"?(n.social_place_id||n.social_building?.id):["SLEEP","HOME"].includes(scheduledActivity)?(n.home_building?.id||n.home?.id):null;
  const destination=destinationId?buildings.find(b=>String(b.id)===String(destinationId)):null;
  const currentBuilding=n.current_building_id?buildings.find(b=>String(b.id)===String(n.current_building_id)):null;
  const destinationDoor=destination?.__worldDoor||null;
  if(scheduledActivity==="COMMUTE"&&currentBuilding?.__worldDoor){
    const exitDoor=currentBuilding.__worldDoor;
    const dx=exitDoor.x-a.position.x,dz=exitDoor.z-a.position.z,dist=Math.hypot(dx,dz);
    a.visible=Number(n.health??100)>0;
    n.current_building_state="EXITING";
    a.userData.doorTransition="EXIT";
    if(exitDoor.mesh){exitDoor.open=true;exitDoor.mesh.rotation.y=Math.PI/2;}
    if(dist>.9){
      a.position.x+=dx/dist*Math.min(dist,.075);a.position.z+=dz/dist*Math.min(dist,.075);
      a.rotation.y=Math.atan2(dx,dz);
      a.userData.lastWorldX=a.position.x;a.userData.lastWorldZ=a.position.z;
      a.userData.traveling=true;
    }else{
      n.current_building_id=null;n.current_building_state="OUTSIDE";
      root.ESCIE_WORLD_NPC?.setInteriorPresence?.(n.id,{clear:true});
      a.userData.traveling=false;a.userData.doorTransition="OUTSIDE";
      if(exitDoor.mesh){exitDoor.open=false;exitDoor.mesh.rotation.y=0;}
    }
    a.userData.activity=scheduledActivity;
    a.userData.scheduleWindow=scheduleWindow?.end!=null?String(scheduleWindow.start)+"-"+String(scheduleWindow.end):"ROUTINE";
    return;
  }
  const target=scheduleWindow?.target;
  const routeTarget=destinationDoor||((target&&Number.isFinite(Number(target.x))&&Number.isFinite(Number(target.y)))?{...gridToWorld(target)}:null);
  if(routeTarget&&Number.isFinite(Number(routeTarget.x))&&Number.isFinite(Number(routeTarget.z??routeTarget.y))){
    const tq=Number.isFinite(Number(routeTarget.z))?routeTarget:{x:Number(routeTarget.x),z:Number(routeTarget.y)};
    const dx=tq.x-a.position.x,dz=tq.z-a.position.z,dist=Math.hypot(dx,dz);
    if(dist>.9){
      const speed=scheduledActivity==="COMMUTE"?.075:.045;
      a.position.x+=dx/dist*Math.min(dist,speed);
      a.position.z+=dz/dist*Math.min(dist,speed);
      a.rotation.y=Math.atan2(dx,dz);
      a.userData.lastWorldX=a.position.x;a.userData.lastWorldZ=a.position.z;
      a.userData.traveling=true;
      a.userData.destinationBuilding=destination?.id||null;
    }else{
      a.userData.traveling=false;
      a.userData.destinationBuilding=destination?.id||null;
      if(destination){
        if(a.userData.enteringBuilding!==destination.id){
          a.userData.enteringBuilding=destination.id;
          a.userData.enteringUntil=now+850;
          n.current_building_id=destination.id;
          n.current_building_state="ARRIVING";
          root.ESCIE_WORLD_NPC?.setInteriorPresence?.(n.id,{building_id:destination.id,interior:destination.interior,entered:false,activity:scheduledActivity});
          const entryDoor=destination.__worldDoor;
          if(entryDoor?.mesh){
            entryDoor.open=true;
            entryDoor.mesh.rotation.y=Math.PI/2;
          }
          a.visible=true;
          a.userData.doorTransition="ENTER";
        }else if(now>=Number(a.userData.enteringUntil||0)){
          n.current_building_id=destination.id;
          n.current_building_state="INSIDE";
          root.ESCIE_WORLD_NPC?.setInteriorPresence?.(n.id,{building_id:destination.id,interior:destination.interior,entered:true,activity:scheduledActivity});
          a.visible=false;
          a.userData.doorTransition="INSIDE";
          const entryDoor=destination.__worldDoor;
          if(entryDoor?.mesh){entryDoor.open=false;entryDoor.mesh.rotation.y=0;}
        }
      }else{
        if(Number.isFinite(Number(target?.x)))n.x=Number(target.x);
        if(Number.isFinite(Number(target?.y)))n.y=Number(target.y);
      }
    }
  }else{
    const q=gridToWorld(n);
    const targetX=Number.isFinite(Number(a.userData.lastWorldX))?a.userData.lastWorldX:q.x;
    const targetZ=Number.isFinite(Number(a.userData.lastWorldZ))?a.userData.lastWorldZ:q.z;
    a.position.x+=(targetX-a.position.x)*.18;a.position.z+=(targetZ-a.position.z)*.18;
    a.userData.traveling=false;
  }
  a.userData.activity=scheduledActivity;
  a.userData.scheduleWindow=scheduleWindow?.end!=null?String(scheduleWindow.start)+"-"+String(scheduleWindow.end):"ROUTINE";
  a.userData.workplaceId=n.workplace_id||n.work_building?.id||null;
  a.userData.socialPlaceId=n.social_place_id||n.social_building?.id||null;
  const reaction=a.userData.reaction&&now<Number(a.userData.reactionUntil||0)?a.userData.reaction:null;
  if(reaction){
    const dx=player.x-a.position.x,dz=player.z-a.position.z,d=Math.hypot(dx,dz)||1;
    if(reaction==="HOSTILE"){a.rotation.y=Math.atan2(dx,dz);if(d>2.4){a.position.x+=dx/d*.045;a.position.z+=dz/d*.045;}a.userData.activity="CONFRONT";}
    else{const away=1/d;a.position.x-=dx*away*.42;a.position.z-=dz*away*.42;a.rotation.y=Math.atan2(-dx,-dz);a.userData.activity="ALERT";}
  }else if(!a.userData.traveling){
    a.rotation.y=n.facing==="E"?Math.PI/2:n.facing==="W"?-Math.PI/2:n.facing==="N"?Math.PI:0;
  }
 });
 player.npcSync=now;
}

function streetProps(){
 for(let z=-48;z<=48;z+=12){
   cyl(.08,4.5,0x151718,-5,2.25,z);
   const lamp=box(.12,.12,.9,0x70747a,-5,4.35,z,{metalness:.6});lamp.rotation.z=.15;
   box(.28,.08,.18,0x2f80ff,-5.25,4.25,z);
   const practical=new THREE.PointLight(0xc7d6c0,.75,10,2);practical.position.set(-5,4.05,z);practical.userData.baseIntensity=.75;practical.userData.readabilityLight=true;worldGroup.add(practical);lights.push(practical);readabilityLights.push(practical);
 }
 for(let z=-44;z<=44;z+=11){
   const side=z%22===0?-9:9;
   box(1.8,.45,4.1,0x292a2e,side,.45,z,{roughness:.8});
   box(1.55,.3,1.9,0x101114,side,1.0,z);
 }
}
function clearWorld(){
 interiorActors.length=0;interiorStations.length=0;securityCameras.length=0;traffic.lastImpact=0;if(typeof updateVehicles==="function")updateVehicles.car=null;if(typeof updatePolice==="function")updatePolice.group=null;obstacles.length=0;actors.length=0;doors.length=0;lights.length=0;evidence.length=0;windowLights.length=0;streetMarkings.length=0;laneMarkings.length=0;groundMeshes.length=0;readabilityLights.length=0;facadeMeshes.length=0;playerRimLights.length=0;doorSignals.length=0;traffic.length=0;lastEnvironmentKey="";snowMesh=null;}
function createTraffic(){
 for(let i=0;i<6;i++){
   const g=new THREE.Group();g.userData.traffic=true;g.userData.lane=i%2===0?-2.35:2.35;g.userData.speed=.9+(i%3)*.18;g.userData.offset=i*19;
   const body=new THREE.Mesh(new THREE.BoxGeometry(1.45,.48,2.8),makeMat(i%3===0?0x292a2e:i%3===1?0x171918:0x303735,.72,.2));body.position.y=.5;g.add(body);
   const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.05,.35,1.35),makeMat(0x101114,.6));cabin.position.y=.9;g.add(cabin);
   const tail=new THREE.Mesh(new THREE.BoxGeometry(.9,.08,.06),makeMat(0x7b2222,.5));tail.position.set(0,.58,1.42);g.add(tail);
   g.position.set(g.userData.lane,0,-54+g.userData.offset);g.rotation.y=i%2===0?0:Math.PI;worldGroup.add(g);traffic.push(g);
 }
}
function updateTraffic(t){
 traffic.forEach((g,i)=>{
   const direction=i%2===0?1:-1;
   const dz=Math.abs(player.z-g.position.z),dx=Math.abs(player.x-g.position.x);
   const incidentDistance=streetIncident.type?Math.hypot(g.position.x-streetIncident.x,g.position.z-streetIncident.z):99;
   const nearPlayer=dx<2.2&&dz<8&&!player.inVehicle;
   const nearIncident=incidentDistance<8;
   if(nearIncident)g.userData.incidentSlow=.45; else g.userData.incidentSlow=1;
   const speed=g.userData.speed*(nearPlayer?.34:1)*Number(g.userData.incidentSlow||1);
   g.position.z+=direction*speed*.035;
   if(g.position.z>56)g.position.z=-56;
   if(g.position.z<-56)g.position.z=56;
   g.rotation.y=direction>0?0:Math.PI;
   if(dx<1.45&&dz<1.7&&performance.now()-traffic.lastImpact>1800){
     traffic.lastImpact=performance.now();
     const hit=Math.max(3,Math.min(12,Math.round(8+speed*2)));
     if(player.inVehicle){
       const result=root.ESCIE_WORLD_VEHICLES?.impact?.(Math.max(2,Math.round(hit*.7)),"TRAFFIC_COLLISION");
       root.ESCIE_WORLD_ACTIONS?.awardRPGXP?.(1,"TRAFFIC CONSEQUENCE");
       reactToCrime("VEHICLE COLLISION",1,9);
       say3D("TRAFFIC · COLLISION · VEHICLE "+Number(result?.condition??100)+"%");
       if(result?.disabled){root.ESCIE_WORLD_VEHICLES?.exit?.();player.inVehicle=false;player.vehicleId=null;say3D("VEHICLE · DISABLED · ON FOOT");}
     }else{
       root.ESCIE_WORLD_SIMULATION?.applyDamage?.(hit,"TRAFFIC");
       root.ESCIE_WORLD_ACTIONS?.awardRPGXP?.(1,"TRAFFIC CONSEQUENCE");
       reactToCrime("TRAFFIC COLLISION",1,9);
       say3D("TRAFFIC · COLLISION · HEALTH -"+hit);
     }
   }
 });
}
function createSnow(){
 const geo=new THREE.BufferGeometry(),n=850,pos=new Float32Array(n*3);
 for(let i=0;i<n;i++){pos[i*3]=(Math.random()-.5)*120;pos[i*3+1]=Math.random()*22;pos[i*3+2]=(Math.random()-.5)*120;}
 geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
 const mat=new THREE.PointsMaterial({color:0xd9ddda,size:.055,transparent:true,opacity:.62});
 snowMesh=new THREE.Points(geo,mat);worldGroup.add(snowMesh);
}
function cityProfile(){
 const sim=root.ESCIE_WORLD_SIMULATION,st=sim?.state?.()||{},district=String(st.neighbourhood||"PARC-EXTENSION").toUpperCase();
 const ref=sim?.districtReference?.(district)||root.ESCIE_CITY_REFERENCE?.districts?.[district]||{};
 const texture=sim?.districtTexture?.(district)||root.ESCIE_CITY_REFERENCE?.district_texture?.[district]||{};
 return {district,ref,texture,season:sim?.seasonalSurface?.()||null};
}
function streetWorldPoint(n){
 if(!n)return {x:0,z:0};
 return {x:Number(n.x||0)/15*108-54,z:Number(n.y||0)/9*108-54};
}
function createStreetSegment(a,b,meta,index){
 const p1=streetWorldPoint(a),p2=streetWorldPoint(b),dx=p2.x-p1.x,dz=p2.z-p1.z;
 const length=Math.max(.1,Math.hypot(dx,dz)),angle=Math.atan2(dx,dz);
 const width=meta?.classification==="ARTERIAL"?7.2:meta?.classification==="COLLECTOR"?5.2:meta?.classification==="LANEWAY"?2.8:4.2;
 const road=box(width,.09,length,0x222524,(p1.x+p2.x)/2,.055,(p1.z+p2.z)/2);
 road.rotation.y=angle;road.userData.streetSegment={from:a.id,to:b.id,label:a.label+" / "+b.label,classification:meta?.classification||"LOCAL"};
 if(meta?.parking){for(const side of[-1,1]){const curb=box(.12,.13,length,(index+side)%2?0x454845:0x3b3e3c,(p1.x+p2.x)/2+Math.cos(angle)*side*(width/2+.08),.13,(p1.z+p2.z)/2-Math.sin(angle)*side*(width/2+.08));curb.rotation.y=angle;curb.userData.curb=true;}}
 if(meta?.sidewalk){for(const side of[-1,1]){const sw=box(.65,.16,length,0x3b3e3d,(p1.x+p2.x)/2+Math.cos(angle)*side*(width/2+.48),.1,(p1.z+p2.z)/2-Math.sin(angle)*side*(width/2+.48));sw.rotation.y=angle;sw.userData.sidewalk=true;}}
 if(meta?.lanes>=4){for(const side of[-.25,.25]){const mark=box(.06,.02,length*.92,0x777a73,(p1.x+p2.x)/2+Math.cos(angle)*side*width,.16,(p1.z+p2.z)/2-Math.sin(angle)*side*width);mark.rotation.y=angle;mark.userData.laneMarking=true;laneMarkings.push(mark);}}
}
function createMontrealStreetLayer(){
 const p=cityProfile(),t=p.texture||{},api=root.ESCIE_WORLD_SIMULATION;
 const commercial=(t.activity||[]).some(x=>/shops|storefront|commercial|caf|bars|markets|takeout|restaurants/i.test(x));
 const cycling=(t.street||[]).some(x=>/bike|cycling/i.test(x))||p.season?.cycling;
 const waterfront=(t.activity||[]).some(x=>/waterfront|canal/i.test(x));
 const alley=(t.street||[]).some(x=>/alley|back lane|narrow/i.test(x));
 const graph=api?.streetGraph?.(p.district),nodes=graph?.nodes||[],byId={};nodes.forEach(n=>byId[n.id]=n);
 (graph?.edges||[]).forEach((edge,i)=>{
   const a=byId[edge[0]],b=byId[edge[1]];if(!a||!b)return;
   const meta=api?.streetContext?.(p.district,a.id)||{classification:"LOCAL",lanes:2,sidewalk:true,parking:true};
   createStreetSegment(a,b,meta,i);
 });
 nodes.forEach((n,i)=>{
   const q=streetWorldPoint(n),size=n.type==="METRO"?1.35:.8;
   const crossing=box(size,.045,size,0x4a4d49,q.x,.16,q.z);crossing.userData.intersection=true;
   if(n.type==="METRO"){
     const marker=cyl(.28,.08,0x2f80ff,q.x,.24,q.z);
     marker.userData.transitStation=n.station||n.label;
     const pole=box(.05,1.6,.05,0x5b605b,q.x,.98,q.z);
     pole.userData.transitPole=true;
   }
   if(n.type==="STREET"&&commercial){
     const sign=box(.32,.08,.04,0x6b6d68,q.x,.22,q.z);sign.userData.streetSign=n.label;
   }
 });
 if(commercial){for(let z=-50;z<=50;z+=10){box(.7,.12,.45,0x4b4e4a,-7.15,.2,z);box(.7,.12,.45,0x4b4e4a,7.15,.2,z);}}
 if(cycling){for(let z=-48;z<=48;z+=7){const m=box(.08,.025,2.2,0x5b6a60,-3.25,.12,z);m.userData.cyclingMarking=true;laneMarkings.push(m);}}
 if(waterfront){box(18,.18,1.2,0x33413d,0,.16,-49);for(let x=-8;x<=8;x+=2)box(.06,.5,.06,0x52635b,x,.35,-49);}
 if(alley){for(let z=-44;z<=44;z+=9)box(.9,.08,.12,0x3d403e,9.1,.13,z);}
}
function createCanonicalBuildings(){
 const s=root.ESCIE_WORLD_SIMULATION?.state?.()||{},p=cityProfile(),t=p.texture||{};
 const list=root.ESCIE_WORLD_SIMULATION?.districtBuildings?.(s.neighbourhood)||[];
 const archetypes=t.building||[];
 list.forEach((b,i)=>{
   const type=String(archetypes[i%Math.max(1,archetypes.length)]||"plex").toLowerCase();
   const width=type.includes("high-rise")?13:type.includes("row")?8:type.includes("storefront")?11:10;
   const depth=type.includes("high-rise")?13:type.includes("loft")?12:10;
   const height=type.includes("high-rise")?24:type.includes("historic")?14:type.includes("walkup")?15:12+(i%3);
   building(-27+(i%4)*18,-38+Math.floor(i/4)*18,width,depth,height,i+1,b);
 });
}

function createSecurityCamera(building,index,coverage){
 const door=building?.__worldDoor;if(!door)return;
 const g=new THREE.Group();g.userData.securityCamera=true;g.userData.buildingId=building.id;g.userData.coverage=coverage;g.userData.alertDelay=Number(root.ESCIE_WORLD_CITY?.buildingSecurity?.[building.id]?.alertDelay||1800);
 const body=new THREE.Mesh(new THREE.BoxGeometry(.16,.12,.28),makeMat(0x171918,.7,.2));g.add(body);
 const lens=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.08,10),makeMat(0x2f80ff,.4));lens.rotation.x=Math.PI/2;lens.position.z=-.16;g.add(lens);
 const side=index%2?-.72:.72;g.position.set(door.x+side,2.45,door.z+.25);g.rotation.y=index%2?Math.PI*.18:-Math.PI*.18;worldGroup.add(g);securityCameras.push(g);
}
function createSecurityCameras(){
 securityCameras.length=0;const list=root.ESCIE_WORLD_SIMULATION?.districtBuildings?.(root.ESCIE_WORLD_SIMULATION?.state?.().neighbourhood)||[],defs=root.ESCIE_WORLD_CITY?.buildingSecurity||{};
 list.forEach(b=>{const d=defs[b.id];if(!d?.cameras)return;for(let i=0;i<Number(d.cameras);i++)createSecurityCamera(b,i,Number(d.coverage||9));});
}
function updateSecurityCameras(){
 if(interiorMode)return;
 const sim=root.ESCIE_WORLD_SIMULATION,st=sim?.state?.()||{},now=performance.now(),crime=st.crime_job,suspicious=Number(st.wanted||0)>0||!!crime;
 securityCameras.forEach(cam=>{
   const dx=player.x-cam.position.x,dz=player.z-cam.position.z,d=Math.hypot(dx,dz),facing=Math.cos(Math.atan2(dx,dz)-cam.rotation.y);
   if(suspicious&&d<=Number(cam.userData.coverage||9)&&facing>.05){
     cam.userData.firstSeen??=now;
     if(now-cam.userData.firstSeen>=Number(cam.userData.alertDelay||1800)&&now-Number(cam.userData.lastReport||0)>9000){
       cam.userData.lastReport=now;root.ESCIE_WORLD_SIMULATION?.detect?.("SECURITY CAMERA · "+String(cam.userData.buildingId||"UNKNOWN"),1);say3D("SECURITY CAMERA · ACTIVITY RECORDED · POLICE RISK");
     }
   }else cam.userData.firstSeen=0;
 });
}

function buildScene(){
 clearWorld();scene=new THREE.Scene();scene.background=new THREE.Color(0x101714);scene.fog=new THREE.FogExp2(0x151a18,.012);
 worldGroup=new THREE.Group();scene.add(worldGroup);
 const hemi=new THREE.HemisphereLight(0xe7e1d4,0x18211c,1.35);scene.add(hemi);
 const moon=new THREE.DirectionalLight(0xb8c4d0,1.7);moon.position.set(-18,30,12);scene.add(moon);
 const fill=new THREE.DirectionalLight(0x62736a,.55);fill.position.set(22,10,-18);scene.add(fill);
 const signal=new THREE.PointLight(0x2f80ff,2.1,28,2);signal.userData.criticalSignal=true;signal.position.set(0,5,6);scene.add(signal);lights.push(signal);
 playerLight=new THREE.PointLight(0xe5dfd2,.42,10,2);scene.add(playerLight);
 const rimA=new THREE.PointLight(0x9aa6a1,.12,5,2);rimA.userData.baseIntensity=.12;scene.add(rimA);playerRimLights.push(rimA);
 const rimB=new THREE.PointLight(0x2f80ff,.08,4,2);rimB.userData.baseIntensity=.08;scene.add(rimB);playerRimLights.push(rimB);
 dayLight=moon;ambientLight=hemi;
 createGround();createMontrealStreetLayer();createCanonicalBuildings();createSecurityCameras();
 let seed=1;
 for(let x=-34;x<=34;x+=12)for(let z=-52;z<=52;z+=13){
   if(Math.abs(x)<10)continue;
   building(x,z,9+seed%4,9+seed%5,9+(seed%5)*2,seed++);
 }
 streetProps();createTraffic();createEvidence();createStreetLife();createSnow();
 avatar=new THREE.Group();
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.9,5,10),makeMat(0x101114,.9));
 body.position.y=.8;avatar.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),makeMat(0x70747a,.95));head.position.y=1.55;avatar.add(head);
 avatar.userData.readabilityMeshes=[body,head];avatar.userData.baseBodyColor=0x101114;avatar.userData.baseHeadColor=0x70747a;
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
 document.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();if(interiorMode){exit3DInterior();return}togglePause();}});
 document.addEventListener("keydown",e=>{if(e.key.toLowerCase()==="e"){if(!interact())document.querySelector("[data-action-primary]")?.click();}});
 let touchLook=null;
 renderer.domElement.addEventListener("touchstart",e=>{if(e.touches.length===1)touchLook={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
 renderer.domElement.addEventListener("touchmove",e=>{if(!touchLook||e.touches.length!==1)return;const t=e.touches[0];player.yaw-=(t.clientX-touchLook.x)*.006;player.pitch=clamp(player.pitch-(t.clientY-touchLook.y)*.004,-1.2,1.2);touchLook={x:t.clientX,y:t.clientY};},{passive:true});
 renderer.domElement.addEventListener("touchend",()=>touchLook=null,{passive:true});
 document.addEventListener("blur",()=>keys.clear());
 visibilityHandler=()=>{if(document.hidden){root.ESCIE_WORLD_SIMULATION?.flush?.();if(raf)cancelAnimationFrame(raf);raf=0}else if(started&&!paused&&!raf){clock.start();render();}};document.addEventListener("visibilitychange",visibilityHandler);
 return true;
}
const touchPad={moveX:0,moveY:0,lookX:0,lookY:0,buttons:{a:false,b:false,x:false,y:false,lb:false,rb:false,start:false,back:false}};
function gamepadInput(){
 const pads=navigator.getGamepads?.()||[];const p=[...pads].find(Boolean);const dz=v=>Math.abs(v)<.12?0:v;
 if(p)return {f:-dz(Number(p.axes?.[1]||0)),str:dz(Number(p.axes?.[0]||0)),lookX:dz(Number(p.axes?.[2]||0)),lookY:dz(Number(p.axes?.[3]||0)),sprint:!!p.buttons?.[10]?.pressed,action:!!p.buttons?.[0]?.pressed,start:!!p.buttons?.[9]?.pressed,back:!!p.buttons?.[8]?.pressed,fight:!!p.buttons?.[2]?.pressed,open:!!p.buttons?.[3]?.pressed};
 return {f:-touchPad.moveY,str:touchPad.moveX,lookX:touchPad.lookX,lookY:touchPad.lookY,sprint:touchPad.buttons.b||touchPad.buttons.rb,action:touchPad.buttons.a,start:touchPad.buttons.start,back:touchPad.buttons.back,fight:touchPad.buttons.x,open:touchPad.buttons.y};
}
function evidenceInteract(){const m=updateEvidence();if(!m)return false;const o=m.userData.evidence;const r=root.ESCIE_WORLD_ACTIONS?.interactObject?.(o);if(r!==false){say3D("EVIDENCE · "+String(o.label||o.id)+" · LOGGED");return true}return false}
function crimeInteract(){
 if(interiorMode)return false;
 const near=doors.find(d=>d.building&&Math.hypot(player.x-d.x,player.z-d.z)<2.2);
 const sim=root.ESCIE_WORLD_SIMULATION,st=sim?.state?.()||{};
 const j=st.crime_job;
 if(j?.step==="FENCE"&&near?.building&&String(near.building.interior||"").toUpperCase()==="SHOP"){
   const r=sim.crimeJobProgress?.("FENCE",{target:near.building.id});
   if(r?.ok){say3D("FENCE · STOLEN GOODS MOVED · +$"+Number(r.reward||0));return true}
   return false;
 }
 if(!near||near.open)return false;
 const b=near.building,interior=String(b?.interior||"").toUpperCase();
 if(!b)return false;
 const night=Number(st.hour||12)>=22||Number(st.hour||12)<6;
 if(!j){
   const kind=night?"BURGLARY":(interior==="SHOP"?"ROBBERY":null);
   if(!kind)return false;
   const accepted=sim?.crimeJobAccept?.(kind,b.id);
   if(accepted?.ok){say3D("CRIME JOB · "+accepted.job.title+" · PREPARE FIRST");return true}
   return false;
 }
 if(String(j.target||"").toUpperCase()!==String(b.id||"").toUpperCase())return false;
 if(j.step==="PREPARE"){
   const prepared=sim?.crimeJobProgress?.("PREPARE",{target:b.id});
   if(prepared?.ok){say3D(j.id==="ROBBERY"?"ROBBERY · GEAR READY · RETURN TO ENTRY":"BURGLARY · GEAR READY · RETURN TO ENTRY");return true}
 }
 if(j.step==="ENTER"){
   const entered=sim?.crimeJobProgress?.("ENTER",{target:b.id});
   if(entered?.ok){
     const result=sim?.enterBuilding?.(st.neighbourhood,b.id);
     if(result?.ok){enter3DInterior(b);root.ESCIE_WORLD_ACTIONS?.awardRPGXP?.(10,j.id+" ENTRY");say3D(j.id+" · "+interior+" · INSIDE");return true}
   }
 }
 return false;
}
function crimeInteriorAction(){
 const sim=root.ESCIE_WORLD_SIMULATION,st=sim?.state?.()||{},j=st.crime_job;
 if(!j||!interiorBuilding)return false;
 if(j.step==="TAKE"){
   if(j.id==="ROBBERY")sim?.commitCrime?.("ROBBERY",{target:interiorBuilding.id,risk:3,witnessed:true});
   else sim?.commitCrime?.("BURGLARY",{target:interiorBuilding.id,risk:2,witnessed:false});
   const r=sim.crimeJobProgress?.("TAKE",{target:interiorBuilding.id});
   if(r?.ok){root.ESCIE_WORLD_ACTIONS?.awardRPGXP?.(15,j.id+" LOOT");say3D(j.id+" · LOOT TAKEN · GET OUT");return true}
 }
 return false;
}
function use3DInteriorAction(){
 if(crimeInteriorAction())return true;
 const b=interiorBuilding,sim=root.ESCIE_WORLD_SIMULATION,def=b&&root.ESCIE_WORLD_CITY?.interiors?.[b.interior];
 if(!b||!def)return false;
 const nearNpc=interiorActors.find(a=>a.userData.canonical&&Math.hypot(player.x-a.position.x,player.z-a.position.z)<2.4);
 if(nearNpc)return npcInteract();
 const near=interiorStations.find(m=>m.userData.interiorStation&&Math.hypot(player.x-m.position.x,player.z-m.position.z)<2.1);
 if(!near){say3D("INTERIOR · MOVE TO A SIGNAL POINT / STATION");return true}
 const station=near.userData.interiorStation,action=station.action;
 let result={ok:true};
 if(["EAT","SLEEP","REST","SOCIAL","WORK","TRAIN"].includes(action)) result=sim?.activity?.(action,{id:b.id,skill:action==="TRAIN"?"fitness":undefined,pay:action==="WORK"?30:undefined})||{ok:false,reason:"SIMULATION_UNAVAILABLE"};
 else if(action==="BUY") result=root.ESCIE_WORLD_ACTIONS?.purchaseGameItem?.("game-item-green-pass")||{ok:false,reason:"PURCHASE_UNAVAILABLE"};
 else if(["WORK","TRAIN","SOCIAL","EAT","LISTEN","READ","INVESTIGATE","TRACE","PREPARE"].includes(action)){
   const target=String(b?.interior||"").toUpperCase();
   const mission=root.ESCIE_WORLD_SIMULATION?.state?.()?.active_mission;
   if(mission){
     const interiorType=String(b?.interior||"").toUpperCase();
     const p=root.ESCIE_WORLD_SIMULATION?.npcMissionProgress?.(action,interiorType);
     if(p?.ok){result=p;root.ESCIE_WORLD_ACTIONS?.awardRPGXP?.(12,"MISSION OBJECTIVE");say3D("MISSION · OBJECTIVE COMPLETE");}
   }
 else if(action==="HEAL") result=sim?.buildingAction?.(b.interior,"HEAL",{cost:20})||{ok:false,reason:"SIMULATION_UNAVAILABLE"};
 else {const s=sim?.state?.();if(s){s.events=(s.events||[]).concat([{type:"INTERIOR_ACTION",action,building:b.id,room:station.room,day:s.day,hour:s.hour}]).slice(-200);sim?.save?.();}}
 if(result?.ok!==false)root.ESCIE_WORLD_ACTIONS?.awardRPGXP?.(2,"INTERIOR "+action);
 say3D(String(b.name||"INTERIOR")+" · "+station.room+" · "+action+(result?.ok===false?" · "+String(result.reason||"UNAVAILABLE"):" · DONE"));
 return true;
}
function crimeExitProgress(){
 const sim=root.ESCIE_WORLD_SIMULATION,st=sim?.state?.(),j=st?.crime_job;
 if(!j||j.step!=="ESCAPE")return false;
 const r=sim.crimeJobProgress?.("ESCAPE",{target:j.target});
 if(r?.ok){say3D("ESCAPE · STOLEN GOODS SECURED · FIND A FENCE");return true}
 return false;
}
function exit3DInterior(){
 crimeExitProgress();
 if(!interiorMode)return false;
 root.ESCIE_WORLD_SIMULATION?.leaveBuilding?.();
 if(interiorGroup){worldGroup.remove(interiorGroup);interiorGroup=null}
 worldGroup.children.forEach(o=>o.visible=true);
 doors.forEach(d=>{d.open=false;d.mesh.rotation.y=0;});
 interiorMode=false;
 interiorActors.length=0;interiorStations.length=0;
 interiorBuilding=null;
 obstacles.splice(0,obstacles.length,...(interiorSaved?.obstacles||[]));
 player.x=interiorSaved?.x??player.x;
 player.z=interiorSaved?.z??player.z;
 player.yaw=interiorSaved?.yaw??player.yaw;
 avatar.position.set(player.x,0,player.z);
 say3D("EXITED · BACK ON THE STREET");
 return true;
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
 if(gp.back&&!move._lastBack){togglePause(true);} move._lastBack=gp.back;
 player.yaw+=gp.lookX*dt*2.4;player.pitch=clamp(player.pitch-gp.lookY*dt*1.8,-1.2,1.2);
 if(gp.action&&!move._lastAction){interact()} move._lastAction=gp.action;if(gp.fight&&!move._lastFight){fight3D()} move._lastFight=gp.fight;if(gp.open&&!move._lastOpen){interact()} move._lastOpen=gp.open;
 let f=(keys.has("w")||keys.has("arrowup")?1:0)-(keys.has("s")||keys.has("arrowdown")?1:0);
 let str=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0);f+=gp.f;str+=gp.str;
 const len=Math.hypot(f,str)||1;f/=len;str/=len;
 const sprinting=!player.inVehicle&&(keys.has("shift")||gp.sprint||move._touchSprint);const rpg=root.ESCIE_RPG,rs=root.ESCIE_WORLD_SIMULATION?.state?.()||{};const sprintCheck=rpg?.check?.(rs.rpg||{}, "ATHLETICS",2);let canSprint=sprinting&&(!rpg||!sprintCheck||sprintCheck.ok);if(canSprint&&performance.now()-player.lastSprintDrain>900){const body=root.ESCIE_WORLD_EQUIPMENT?.describe?.().equipped?.body?.id;const cost=body==="JACKET"?2:1;if(Number(rs.energy??0)<cost){canSprint=false;say3D("SPRINT · TOO EXHAUSTED");}else{root.ESCIE_WORLD_SIMULATION?.change?.({energy:-cost});player.lastSprintDrain=performance.now();}}const base=player.inVehicle?9.5:4.2;const speed=(canSprint?base*1.45:base)*dt;
 const c=Math.cos(player.yaw),si=Math.sin(player.yaw);
 const nx=player.x+(-si*f+c*str)*speed,nz=player.z+(-c*f-si*str)*speed;
 const oldX=player.x,oldZ=player.z;
 const attempted=Math.hypot(nx-oldX,nz-oldZ);
 const xBlocked=blocked(nx,player.z),zBlocked=blocked(player.x,nz);
 if(!xBlocked)player.x=nx;if(!zBlocked)player.z=nz;
 if(player.inVehicle&&attempted>.08&&performance.now()-vehicleImpacts.last>vehicleImpacts.cooldown){
   const actual=Math.hypot(player.x-oldX,player.z-oldZ);
   const boundary=Math.abs(nx)>bounds||Math.abs(nz)>bounds;
   const collision=xBlocked||zBlocked||boundary;
   if(collision){
     const severity=Math.max(2,Math.min(18,Math.round(attempted*5)));
     const result=root.ESCIE_WORLD_VEHICLES?.impact?.(severity,"3D_COLLISION");
     vehicleImpacts.last=performance.now();
     if(result?.ok){
       say3D("VEHICLE · IMPACT · CONDITION "+Number(result.condition||0)+"%");
       if(Number(result.condition||0)<=0){
         root.ESCIE_WORLD_VEHICLES?.exit?.();
         player.inVehicle=false;player.vehicleId=null;player.speed=4.2;
         say3D("VEHICLE · DISABLED · ON FOOT");
       }
     }
   }
 }
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
     const body=new THREE.Mesh(new THREE.BoxGeometry(1.7,.55,3.4),makeMat(0x101114,.65,.35));body.position.y=.55;updateVehicles.car.add(body);updateVehicles.car.userData.headlights=[];
     const roof=new THREE.Mesh(new THREE.BoxGeometry(1.2,.35,1.6),makeMat(0x111615,.6));roof.position.y=.98;updateVehicles.car.add(roof);
     [-.52,.52].forEach(x=>{const lamp=new THREE.SpotLight(0xdde8d8,.7,16,Math.PI/7,.45,1.5);lamp.position.set(x,.62,-1.75);lamp.target.position.set(x,.35,-8);lamp.userData.baseIntensity=.7;updateVehicles.car.add(lamp);updateVehicles.car.add(lamp.target);updateVehicles.car.userData.headlights.push(lamp);});
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
 updateVehicles.car.userData.disabled=condition<=0;
 updateVehicles.car.scale.setScalar(condition<=0 ? .82 : 1);
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
function worldHeartbeat(){if(!started||paused)return;const now=performance.now(),step=5000;if(!player.worldTick){player.worldTick=now;player.npcTick=now;return}if(now-player.worldTick<step)return;const elapsedMinutes=Math.max(1,Math.round((now-player.worldTick)/60000));player.worldTick=now;const sim=root.ESCIE_WORLD_SIMULATION,st=sim?.advance?.(elapsedMinutes);const s=sim?.state?.();if(s){if(!player.npcTick||now-player.npcTick>=30000){player.npcTick=now;root.ESCIE_WORLD_NPC?.tick?.(s.day,s.hour,s.minute,(x,y)=>{
   const q=gridToWorld({x,y});
   return blocked(q.x,q.z);
 },elapsedMinutes);root.ESCIE_WORLD_NPC_LIFE?.syncRelationships?.();}root.ESCIE_WORLD_LAW?.tick?.();}}
function updateEnvironment(t){
 const st=root.ESCIE_WORLD_SIMULATION?.state?.()||{},district=String(st.neighbourhood||"PARC-EXTENSION").toUpperCase();
 if(lastDistrictKey&&district!==lastDistrictKey&&!interiorMode&&worldGroup){buildScene();say3D("DISTRICT · "+district+" · CITY LAYER UPDATED");}
 lastDistrictKey=district;
 const cycle=((Number(st.hour||12)*60+Number(st.minute||0))/1440),angle=cycle*Math.PI*2;
 const daylight=Math.max(.06,Math.sin(angle-Math.PI/2)*.5+.5);const weather=String(st.weather||"COLD").toUpperCase();if(snowMesh)snowMesh.visible=perf.quality!=="low"&&(weather.includes("SNOW")||weather.includes("COLD"));
 const night=1-daylight,poorVisibility=weather.includes("SNOW")||weather.includes("FOG")||weather.includes("STORM"),snowWeather=weather.includes("SNOW"),fogWeather=weather.includes("FOG"),stormWeather=weather.includes("STORM"); const environmentKey=weather+"|"+Math.round(night*100); const environmentChanged=environmentKey!==lastEnvironmentKey;
 if(dayLight){const dawn=Math.max(0,1-Math.abs(daylight-.22)/.22),dusk=Math.max(0,1-Math.abs(daylight-.42)/.22);dayLight.intensity=(.32+daylight*1.55)*(snowWeather ? .94 :1)*(fogWeather ? .88 :1)*(stormWeather ? .82 :1);dayLight.position.set(Math.cos(angle)*25,8+daylight*28,Math.sin(angle)*25);dayLight.color.set(dawn||dusk?(dawn>.5?0xb8a78f:0xa7a0a1):(daylight>.45?0xd8d4ca:0x758394));}
 if(ambientLight)ambientLight.intensity=(.34+daylight*.68)*(snowWeather?1.08:1)*(fogWeather ? .94 :1)*(stormWeather ? .9 :1);
 if(playerLight){playerLight.intensity=.12+night*.72+(poorVisibility ? .18 : 0);playerLight.position.set(player.x,1.9,player.z);}
 if(playerRimLights.length){const rimBoost=.04+night*.16+(poorVisibility ? .08 : 0);const yaw=player.yaw;const r1=playerRimLights[0],r2=playerRimLights[1];r1.position.set(player.x+Math.sin(yaw)*1.8,1.35,player.z+Math.cos(yaw)*1.8);r2.position.set(player.x-Math.sin(yaw)*1.5,1.1,player.z-Math.cos(yaw)*1.5);r1.intensity=Number(r1.userData.baseIntensity||.12)*(rimBoost/.12);r2.intensity=Number(r2.userData.baseIntensity||.08)*(rimBoost/.12)*.55;}
 if(scene?.fog)scene.fog.density=.008+night*.010+(fogWeather ? .008 :0)+(snowWeather ? .003 :0)+(stormWeather ? .004 :0);if(updatePolice.group){updatePolice.group.children.forEach((g,i)=>{const beacon=g.userData.beacon;if(beacon){const base=Number(beacon.userData.baseIntensity||.45);const pulse=.88+Math.sin(t*7+i*1.7)*.12;beacon.intensity=base*(poorVisibility?1.35:1)*(night>.35?1:.35)*pulse;}});}
 if(renderer){const exposure=stormWeather ? .94 :(fogWeather ? .99 :(snowWeather?1.02:(night>.72?1.1:1.05)));renderer.toneMappingExposure+=(exposure-renderer.toneMappingExposure)*.04;}
 lights.forEach((l,i)=>{if(!l.isPointLight)return;const isSignal=l===lights[0];if(isSignal){l.intensity=(1.15+night*1.1)*(stormWeather ? .82 :1);}else if(l.userData.readabilityLight){const base=Number(l.userData.baseIntensity||.35);const visibilityBoost=poorVisibility ? .22 : 0;l.intensity=base*(.2+night*.8+visibilityBoost)*(snowWeather?1.08:1)*(stormWeather ? .78 :1);}else{const base=Number(l.userData.baseIntensity||.35);l.intensity=base*(.18+night*.82)*(snowWeather?1.08:1)*(stormWeather ? .78 :1);}});
 if(environmentChanged){windowLights.forEach(o=>{const base=Number(o.userData.baseEmissive||.35);o.material.emissiveIntensity=base*(.12+night*.88);}); doorSignals.forEach(o=>{const base=Number(o.userData.baseEmissive||.12);o.material.emissiveIntensity=base*(.08+night*.92+(poorVisibility ? .18 : 0));}); streetMarkings.forEach(o=>{o.material.emissiveIntensity=.015+night*.035;}); laneMarkings.forEach(o=>{o.material.emissiveIntensity=.02+night*.06;});groundMeshes.forEach(o=>o.material.color.set(night>.65?0x171a1b:0x242728)); const facadeNight=night*.12+(poorVisibility ? .025 : 0); facadeMeshes.forEach(o=>{const base=Number(o.userData.baseFacadeColor||0x202224),r=((base>>16)&255)/255,g=((base>>8)&255)/255,b=(base&255)/255,scale=1-facadeNight;o.material.color.setRGB(r*scale,g*scale,b*scale);}); const actorLift=night*.12+(poorVisibility ? .04 : 0); actorReadabilityMeshes.forEach(g=>{const coat=Number(g.userData.baseCoatColor||0x202726),head=Number(g.userData.baseHeadColor||0x373b38),cr=((coat>>16)&255)/255,cg=((coat>>8)&255)/255,cb=(coat&255)/255,hr=((head>>16)&255)/255,hg=((head>>8)&255)/255,hb=(head&255)/255,scale=1+actorLift;g.userData.readabilityMeshes?.[0]?.material.color.setRGB(Math.min(1,cr*scale),Math.min(1,cg*scale),Math.min(1,cb*scale));g.userData.readabilityMeshes?.[1]?.material.color.setRGB(Math.min(1,hr*scale),Math.min(1,hg*scale),Math.min(1,hb*scale));}); const playerLift=night*.08+(poorVisibility ? .04 : 0); const pm=avatar?.userData?.readabilityMeshes||[]; if(pm[0]&&pm[1]){const body=Number(avatar.userData.baseBodyColor||0x101114),head=Number(avatar.userData.baseHeadColor||0x70747a),br=((body>>16)&255)/255,bg=((body>>8)&255)/255,bb=(body&255)/255,hr=((head>>16)&255)/255,hg=((head>>8)&255)/255,hb=(head&255)/255,bs=1+playerLift,hs=1+playerLift*.7;pm[0].material.color.setRGB(Math.min(1,br*bs),Math.min(1,bg*bs),Math.min(1,bb*bs));pm[1].material.color.setRGB(Math.min(1,hr*hs),Math.min(1,hg*hs),Math.min(1,hb*hs));} lastEnvironmentKey=environmentKey;}
 const headlights=updateVehicles.car?.userData?.headlights||[];headlights.forEach(l=>{const base=Number(l.userData.baseIntensity||.7);const visibilityBoost=poorVisibility ? .55 :0;const daylightCut=daylight>.58 ? .12 :1;l.intensity=base*(.25+night*.9+visibilityBoost)*daylightCut;});
}
function syncPauseMap(){const map=document.getElementById("world-map"),p=document.getElementById("world-player");if(!map||!p)return;const x=Math.max(0,Math.min(100,(player.x+54)/108*100)),y=Math.max(0,Math.min(100,(player.z+54)/108*100));p.style.left=x+"%";p.style.top=y+"%";p.title="PLAYER · "+Math.round(player.x+54)+" · "+Math.round(player.z+54);const sim=root.ESCIE_WORLD_SIMULATION?.state?.()||{};map.dataset.neighbourhood=String(sim.neighbourhood||"PARC-EXTENSION");map.dataset.transport=String(sim.transport||"FOOT");}
function updateHud(){
 const st=root.ESCIE_WORLD_SIMULATION?.state?.()||{},coord=document.getElementById("world-coordinates"),sig=document.getElementById("world-signal");
 if(coord)coord.textContent=Math.round(player.x+54).toString().padStart(2,"0")+" · "+Math.round(player.z+54).toString().padStart(2,"0");if(st)document.getElementById("world-location")&&(document.getElementById("world-location").textContent=st.neighbourhood||"PARC-EXTENSION");
 if(sig){const distance=Math.hypot(player.x,player.z),wanted=Number(st?.wanted||0);sig.textContent=Math.max(0,100-Math.round(distance)+wanted*5).toString()+" SIGNAL";}const status=document.getElementById("escie-3d-status");if(status){status.textContent="LV "+Number(st?.rpg?.level||1)+" · HP "+Number(st.health??100)+" · ENERGY "+Number(st.energy??100)+" · WANTED "+Number(st.wanted||0)+" · $"+Number(st.money||0);}
}
function updateQuality(dt){
 const ms=dt*1000;
 perf.frameMs=perf.frameMs*.92+ms*.08;
 if(perf.frameMs>28){
   perf.lowFrames++;
 }else{
   perf.lowFrames=Math.max(0,perf.lowFrames-1);
 }
 if(perf.lowFrames>90&&perf.quality!=="low"){
   perf.quality="low";
   worldGroup?.traverse(o=>{
     if(o.isPoints){
       o.userData.lowQualityHidden=true;
       o.visible=false;
     }
     if(o.isPointLight&&!o.userData.readabilityLight&&!o.userData.criticalSignal&&!o.userData.policeBeacon){
       o.userData.lowQualityHidden=true;
       o.visible=false;
     }
   });
   if(snowMesh)snowMesh.visible=false;
   renderer?.setPixelRatio(Math.min(devicePixelRatio||1,1));
 }else if(perf.quality==="low"&&perf.frameMs<20&&perf.lowFrames===0){
   perf.quality="auto";
   worldGroup?.traverse(o=>{
     if(o.userData.lowQualityHidden){
       o.userData.lowQualityHidden=false;
       o.visible=true;
     }
   });
   renderer?.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
 }
} 
function updateActors(t){
 actors.forEach(a=>{if(a.userData.canonical){if(a.userData.reaction&&performance.now()<Number(a.userData.reactionUntil||0)){a.rotation.y+=a.userData.reaction==="HOSTILE" ? .08 : -.04;}return}a.position.x=a.userData.base+Math.sin(t*.35+a.userData.phase)*.8;a.rotation.y=Math.sin(t*.35+a.userData.phase)*.25;});
}
function render(){
 updateStreetEncounters(performance.now());
 updateStreetIncident(performance.now());
 const dt=Math.min(clock.getDelta(),.05);updateQuality(dt);move(dt);worldHeartbeat();updateLaw();updateActors(clock.elapsedTime);updateHostileNPCs(performance.now());syncCanonicalNPCs(clock.elapsedTime);updateTraffic(clock.elapsedTime);updateVehicles(clock.elapsedTime);updatePolice();policeCollision();updateEnvironment(clock.elapsedTime);updateSecurityCameras();if(performance.now()-perf.hud>120){updateHud();syncPauseMap();perf.hud=performance.now();}
 if(thirdPerson){
   const vehicle=player.inVehicle,dist=vehicle?6.2:4.8,height=vehicle?2.9:2.45;
   const shoulder=new THREE.Vector3(Math.sin(player.yaw)*dist,height,Math.cos(player.yaw)*dist);
   const target=new THREE.Vector3(player.x,vehicle?0.9:1.15,player.z);
   const desired=new THREE.Vector3(player.x+shoulder.x,shoulder.y,player.z+shoulder.z);
   camera.position.lerp(desired,.16);camera.lookAt(target);
   camera.fov+=(vehicle?74:70-camera.fov)*.08;camera.updateProjectionMatrix();
 }else{
   camera.position.set(player.x,player.y,player.z);
   camera.rotation.order="YXZ";camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;
   camera.fov+=(70-camera.fov)*.08;camera.updateProjectionMatrix();
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
   const r=e.target.closest("[data-world-resume]");if(r)togglePause(false);const s=e.target.closest("[data-save]");if(s&&paused){root.ESCIE_WORLD_ACTIONS?.save?.();}const x=e.target.closest("[data-return-pause]");if(x&&paused){window.location.href="../";} const open=e.target.closest("[data-pause-open]");if(open&&paused){const api=root.ESCIE_WORLD_UI,type=open.dataset.pauseOpen;if(type==="inventory")api?.inventory?.();else if(type==="character")api?.character?.();else if(type==="investigation")api?.investigation?.();else if(type==="market")api?.market?.();else if(type==="phone")api?.phoneApp?.("notifications");else if(type==="quests")api?.quests?.();else if(type==="simulation")api?.openSimulation?.();else if(type==="system")api?.systemMenu?.();else if(type==="profile")api?.profileMenu?.();else if(type==="preferences")api?.preferences?.();else if(type==="glass")api?.glass?.();}
 });
 const mobilePad=document.getElementById("mobile-gamepad");if(mobilePad){mobilePad.querySelectorAll("[data-stick]").forEach(zone=>{const kind=zone.dataset.stick,knob=zone.querySelector(".mobile-stick");let id=null,cx=0,cy=0,max=1;const reset=()=>{id=null;knob.style.transform="translate(-50%,-50%)";if(kind==="move"){touchPad.moveX=touchPad.moveY=0}else{touchPad.lookX=touchPad.lookY=0}};zone.addEventListener("pointerdown",e=>{e.preventDefault();activeInputDevice("TOUCH");id=e.pointerId;const r=zone.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;max=Math.min(r.width,r.height)*.32;zone.setPointerCapture?.(id)});zone.addEventListener("pointermove",e=>{if(id!==e.pointerId)return;const dx=e.clientX-cx,dy=e.clientY-cy,len=Math.hypot(dx,dy)||1,x=Math.max(-1,Math.min(1,dx/max)),y=Math.max(-1,Math.min(1,dy/max));knob.style.transform="translate(calc(-50% + "+Math.max(-max,Math.min(max,dx))+"px),calc(-50% + "+Math.max(-max,Math.min(max,dy))+"px))";if(kind==="move"){touchPad.moveX=x;touchPad.moveY=y}else{touchPad.lookX=x;touchPad.lookY=y}});["pointerup","pointercancel","lostpointercapture"].forEach(ev=>zone.addEventListener(ev,reset))});mobilePad.querySelectorAll("[data-pad-button]").forEach(btn=>{const k=btn.dataset.padButton;const down=e=>{e.preventDefault();activeInputDevice("TOUCH");touchPad.buttons[k]=true;btn.classList.add("pressed")};const up=e=>{e.preventDefault();touchPad.buttons[k]=false;btn.classList.remove("pressed")};btn.addEventListener("pointerdown",down);["pointerup","pointercancel","pointerleave"].forEach(ev=>btn.addEventListener(ev,up))})}document.querySelectorAll("[data-dir]").forEach(b=>{
   const map={up:"w",down:"s",left:"a",right:"d"};const k=map[b.dataset.dir];
   const on=e=>{e.preventDefault();keys.add(k)},off=e=>{e.preventDefault();keys.delete(k)};
   b.addEventListener("pointerdown",on);b.addEventListener("pointerup",off);b.addEventListener("pointerleave",off);b.addEventListener("pointercancel",off);
 });
}
function start(){
 if(started)return;
 if(document.getElementById("game-boot")&&!document.body.classList.contains("game-live"))return;
 started=true;if(!setup()){started=false;return;}
 bind();const s=stage();s.classList.add("three-active");setMode(true);togglePause(false);render();
}
root.ESCIE_3D_WORLD={start,stop,ready:()=>!!renderer,toggleCamera:()=>setMode(!thirdPerson),pause:()=>togglePause(true),resume:()=>togglePause(false),isPaused:()=>paused,interact,fight:fight3D,setSprint:(v)=>{move._touchSprint=!!v},status:()=>({ready:!!renderer,paused,quality:perf.quality,frameMs:Math.round(perf.frameMs)})};
root.addEventListener?.("escie:world-enter",()=>start());
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();