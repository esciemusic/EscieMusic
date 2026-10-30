function enter3DInterior(building){
 interiorMode=true;interiorBuilding=building;interiorSaved={x:player.x,z:player.z,yaw:player.yaw,obstacles:obstacles.slice()};
 interiorActors.length=0;interiorStations.length=0;
 doors.forEach(d=>{d.open=false;d.mesh.rotation.y=0});obstacles.length=0;
 worldGroup.children.forEach(o=>o.visible=false);
 interiorGroup=new THREE.Group();worldGroup.add(interiorGroup);
 const floor=new THREE.Mesh(new THREE.BoxGeometry(16,.12,12),makeMat(0x101114,.95));floor.position.y=0;interiorGroup.add(floor);
 [[0,2,-6],[0,2,6],[-8,2,0],[8,2,0]].forEach((p,i)=>{const w=new THREE.Mesh(new THREE.BoxGeometry(i<2?16:.12,4,i<2 ? .12 : 12),makeMat(0x292a2e,.96));w.position.set(p[0],p[1],p[2]);interiorGroup.add(w)});
 const type=String(building?.interior||"").toUpperCase();
 const def=root.ESCIE_WORLD_CITY?.interiors?.[type]||{};
 const rooms=Array.isArray(def.rooms)?def.rooms:[];
 const actions=Array.isArray(def.actions)?def.actions:[];
 const prop=(w,h,d,color,x,y,z,opts={})=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),makeMat(color,opts.roughness??.9,opts.metalness??0));m.position.set(x,y,z);interiorGroup.add(m);return m};
 const cylProp=(r,h,color,x,y,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),makeMat(color,.86));m.position.set(x,y,z);interiorGroup.add(m);return m};
 const roomAnchors=[[-4,-3],[4,-3],[-4,3],[4,3],[0,0],[0,3],[-3,0],[3,0]];
 rooms.slice(0,6).forEach((room,i)=>{
   const p=roomAnchors[i%roomAnchors.length];
   const label=prop(Math.min(3.8,Math.max(1.8,String(room).length*.18)),.05,.05,0x70747a,p[0],2.35,p[1]);
   label.userData.room=String(room);label.userData.interiorLabel=true;
 });
 // Canonical room structure: partitions deliberately leave walkable openings between room zones.
 if(rooms.length>1){
   prop(5.6,.08,.12,0x303235,0,1.25,0);
   prop(.12,1.4,4.6,0x303235,-2.6,.7,0);
   prop(.12,1.4,4.6,0x303235,2.6,.7,0);
 }
 if(type==="SHOP"){prop(4,.9,1.1,0x292a2e,-2,.45,1);prop(4,.9,1.1,0x292a2e,2,.45,1);for(let i=-2;i<=2;i++)prop(.5,.7,.5,0x70747a,i,.35,-4);}
 else if(type==="CAFE"){for(const x of [-3,0,3]){cylProp(.65,.12,0x8a4035,x,.75,0);for(const z of [-.75,.75])cylProp(.18,.9,0x292a2e,x,.38,z);}prop(6,1,1,0x1b1c1f,0,.5,-4);}
 else if(type==="STUDIO"){prop(5,.8,1.4,0x101114,0,.4,-2);for(const x of [-3,-1,1,3])prop(.7,1,.5,0x292a2e,x,.5,2);prop(2,.8,.5,0x6f3faf,0,.4,3.5);}
 else if(type==="CLUB"||type==="VENUE"){prop(7,.12,5,0x6f3faf,0,.06,0);for(let x=-3;x<=3;x+=2)cylProp(.08,3,0x2f80ff,x,1.5,-4.8);}
 else if(type==="GYM"){for(const x of [-3,0,3]){prop(.6,1.8,.6,0x303235,x,.9,-1);prop(2,.15,.8,0x70747a,x,1.85,-1);}prop(5,.08,4,0x101114,0,.05,2);}
 else if(type==="APARTMENT"||type==="ROOM_HOME"){prop(5,.5,2,0x292a2e,0,.25,-1);prop(2.8,.5,2,0x303235,-3,.25,2);prop(1,.8,1,0x70747a,3,.4,-2);}
 else if(type==="CLINIC"){prop(2.5,.7,6,0x70747a,0,.35,0);for(const x of [-3,3])prop(1,.8,1,0x292a2e,x,.4,2);}
 else if(type==="OFFICE"||type==="ARCHIVE"){for(const x of [-3,0,3])prop(1.2,2.8,.6,0x292a2e,x,1.4,2);prop(5,.9,1.2,0x1b1c1f,0,.45,-2);}
 // Usable 3D stations: actions are physical locations, not 2D menu commands.
 const preferred={SHOP:"BUY",CAFE:"EAT",STUDIO:"LISTEN",CLUB:"SOCIAL",GYM:"TRAIN",APARTMENT:"REST",CLINIC:"HEAL",OFFICE:"WORK",VENUE:"LISTEN",ARCHIVE:"INVESTIGATE",SIGNAL_ROOM:"TRACE",ROOM_HOME:"REST"};
 const stationActions=[...new Set([preferred[type],...actions].filter(Boolean))].slice(0,4);
 const stationPositions=[[-4,-4],[4,-4],[-4,3],[4,3]];
 stationActions.forEach((action,i)=>{
   const p=stationPositions[i%stationPositions.length],m=cylProp(.35,.08,action==="TRACE"||action==="INVESTIGATE"?0x6f3faf:0x2f80ff,p[0],.12,p[1]);
   m.userData.interiorStation={action:String(action).toUpperCase(),building:building.id,room:rooms[i%Math.max(1,rooms.length)]||"MAIN"};
   interiorStations.push(m);
 });
 // Occupants come only from canonical NPC population data already present in the simulation.
 const district=String(building?.district||root.ESCIE_WORLD_SIMULATION?.state?.().neighbourhood||"").toUpperCase();
 const population=(root.ESCIE_WORLD_CITY?.npcPopulations?.[district]||[]).filter(n=>{const live=root.ESCIE_WORLD_NPC?.state?.().npcs?.[n.id];return n&&(n.home===building.id||n.work===building.id||live?.workplace_id===building.id||live?.social_place_id===building.id);});
 population.slice(0,5).forEach((profile,i)=>{
   const live=root.ESCIE_WORLD_NPC?.state?.().npcs?.[profile.id];if(!live)return;
   const p=[[-4,1],[4,1],[-4,-1],[4,-1],[0,3]][i];
   const g=new THREE.Group();const coat=[0x141918,0x202726,0x303735][i%3];
   const body=new THREE.Mesh(new THREE.CapsuleGeometry(.2,.65,4,8),makeMat(coat,.95));body.position.y=.62;g.add(body);
   const head=new THREE.Mesh(new THREE.SphereGeometry(.17,12,8),makeMat(0x373b38,.98));head.position.y=1.3;g.add(head);
   g.position.set(p[0],0,p[1]);g.userData={id:profile.id,canonical:true,npc:live,interiorActivity:live.activity||"WORK",room:rooms[i%Math.max(1,rooms.length)]||"MAIN"};
   interiorGroup.add(g);interiorActors.push(g);
 });
 const signal=new THREE.Mesh(new THREE.BoxGeometry(.7,.08,.7),makeMat(type==="SIGNAL_ROOM"||type==="ARCHIVE"?0x6f3faf:0x2f80ff,.55,.2));signal.position.set(0,.95,-2);interiorGroup.add(signal);
 const light=new THREE.PointLight(0x4da3ff,2,18);light.position.set(0,3,0);interiorGroup.add(light);
 player.x=0;player.z=4.4;player.y=1.7;player.yaw=Math.PI;avatar.position.set(player.x,0,player.z);
 say3D("ENTERED · "+String(building?.name||"INTERIOR")+" · "+(rooms.length?rooms.length+" ROOMS":"OPEN FLOOR"));
}
function updateInteriorOccupants(t){
 if(!interiorMode||!interiorActors.length)return;
 const sim=root.ESCIE_WORLD_SIMULATION?.state?.()||{};
 const minute=Number(sim.hour||12)*60+Number(sim.minute||0);
 const hashId=id=>{let h=0;for(const ch of String(id||""))h=((h<<5)-h)+ch.charCodeAt(0)|0;return Math.abs(h)};
 const stationFor=(g,activity)=>{
   const compatible=interiorStations.filter(s=>{
     const a=String(s.userData.interiorStation?.action||"").toUpperCase();
     return a===activity ||
       (activity==="SOCIAL"&&["SOCIAL","TALK","DANCE"].includes(a)) ||
       (activity==="WORK"&&["WORK","RECORD","BUY","INVESTIGATE"].includes(a)) ||
       (activity==="CREATE"&&["RECORD","LISTEN","WORK"].includes(a)) ||
       (activity==="REST"&&["REST","SLEEP"].includes(a)) ||
       (activity==="EAT"&&["EAT","SOCIAL"].includes(a)) ||
       (activity==="TRAIN"&&["TRAIN","REST"].includes(a));
   });
   if(!compatible.length)return null;
   const slot=Math.floor(minute/15)+hashId(g.userData.id);
   return compatible[slot%compatible.length];
 };
 interiorActors.forEach((g,i)=>{
   const live=g.userData.npc||root.ESCIE_WORLD_NPC?.state?.().npcs?.[g.userData.id];
   if(!live)return;
   const schedule=Array.isArray(live.schedule)?live.schedule:[];
   const current=schedule.find(v=>minute>=Number(v.start||0)&&minute<Number(v.end||0))||null;
   const activity=String(current?.activity||live.activity||g.userData.interiorActivity||"WORK").toUpperCase();
   const expectedBuilding=
     activity==="WORK" ? live.work_building?.id :
     activity==="SOCIAL" ? (live.social_building?.id||live.social_place_id) :
     ["SLEEP","HOME"].includes(activity) ? (live.home?.id||live.home_building?.id) : null;
   const shouldBeHere=!expectedBuilding||String(expectedBuilding)===String(interiorBuilding?.id);
   g.visible=shouldBeHere;
   if(!shouldBeHere){g.userData.reacting=false;return;}
   g.userData.interiorActivity=activity;
   g.userData.scheduleWindow=current?.end!=null?String(current.start)+"-"+String(current.end):"ROUTINE";
   const nearbyPlayer=Math.hypot(player.x-g.position.x,player.z-g.position.z)<3.2;
   let target=null;
   if(nearbyPlayer){
     target={x:player.x,z:player.z};
     g.userData.reacting=true;
   }else{
     g.userData.reacting=false;
     const station=stationFor(g,activity);
     if(station){
       target=station.position;
       g.userData.targetStation=station.userData.interiorStation;
       g.userData.targetRoom=station.userData.interiorStation.room;
     }else if(interiorActors.length>1&&activity==="SOCIAL"){
       const others=interiorActors.filter(o=>o!==g&&o.visible);
       const other=others.length?others[(i+Math.floor(minute/30))%others.length]:null;
       if(other)target={x:other.position.x,z:other.position.z};
     }
   }
   if(target){
     const dx=target.x-g.position.x,dz=target.z-g.position.z,dist=Math.hypot(dx,dz);
     if(dist>.45){
       const speed=g.userData.reacting?.0.9:(activity==="COMMUTE"?.52:.38);
       const step=Math.min(dist,speed*.016);
       g.position.x+=dx/dist*step;g.position.z+=dz/dist*step;
       g.rotation.y=Math.atan2(dx,dz);
       g.position.y=Math.sin(t*8+i)*.018;
     }else{
       g.position.y=Math.sin(t*2+i)*.008;
       if(g.userData.reacting)g.rotation.y=Math.atan2(player.x-g.position.x,player.z-g.position.z);
       g.userData.stationHold=Math.floor(minute/15);
     }
   }
 });
}
function use3DInteriorAction(){
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
 else if(action==="HEAL") result=sim?.buildingAction?.(b.interior,"HEAL",{cost:20})||{ok:false,reason:"SIMULATION_UNAVAILABLE"};
 else {const s=sim?.state?.();if(s){s.events=(s.events||[]).concat([{type:"INTERIOR_ACTION",action,building:b.id,room:station.room,day:s.day,hour:s.hour}]).slice(-200);sim?.save?.();}}
 if(result?.ok!==false)root.ESCIE_WORLD_ACTIONS?.awardRPGXP?.(2,"INTERIOR "+action);
 say3D(String(b.name||"INTERIOR")+" · "+station.room+" · "+action+(result?.ok===false?" · "+String(result.reason||"UNAVAILABLE"):" · DONE"));
 return true;
}
function exit3DInterior(){
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
 const dt=Math.min(clock.getDelta(),.05);updateQuality(dt);move(dt);worldHeartbeat();updateLaw();updateActors(clock.elapsedTime);syncCanonicalNPCs(clock.elapsedTime);updateTraffic(clock.elapsedTime);updateVehicles(clock.elapsedTime);updateInteriorOccupants(clock.elapsedTime);updatePolice();policeCollision();updateEnvironment(clock.elapsedTime);if(performance.now()-perf.hud>120){updateHud();syncPauseMap();perf.hud=performance.now();}
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