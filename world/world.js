"use strict";
const KEY="escie_game_state_v1",W=16,H=10,start={x:2,y:7};
let npcs=[{id:"witness",x:8,y:3,label:"THE WITNESS",lines:["You came through the signal. I have seen that before.","Do not confuse what you find with what is proven."],choices:[{label:"WHO ARE YOU?",text:"Someone who stayed long enough to notice the pattern."},{label:"WHAT IS THIS PLACE?",text:"A real street. Everything after that is interpretation."},{label:"I NEED THE KEY.",text:"Then find the thing that responds to the distortion.",discovery:"game-discovery-witness",queries:["query:witness","query:key"]}]}];
const objects=[
{id:"camera",x:12,y:2,label:"CAMERA",text:"A camera watches the lane. Its lens is pointed somewhere specific.",discovery:"game-discovery-camera",queries:["query:camera","query:surveillance"]},
{id:"shoe",x:6,y:5,label:"BABY SHOE",text:"A small shoe sits near the curb. Meaning unresolved.",discovery:"game-discovery-shoe",queries:["query:baby shoe","query:shoe","query:childhood"],item:"game-item-baby-shoe"},
{id:"signal",x:13,y:7,label:"SIGNAL",text:"The distortion is strongest here. Something continues beyond this street.",discovery:"game-discovery-trail",queries:["query:trail","query:path","query:signal","query:distortion"]},
{id:"door",x:3,y:2,label:"DOOR",text:"Locked. Behind it: fluorescent light and something that sounds like a television.",discovery:null},
{id:"chair",x:9,y:7,label:"CHAIR",text:"An empty chair faces the wall. There is nothing on it.",discovery:null}
];
if(window.ESCIE_WORLD_NPC){window.ESCIE_WORLD_NPC.registerNPC({id:"witness",x:8,y:3,role:"WITNESS",status:"UNKNOWN",awareness:78,social_context:"LOCAL",facing:"S",peripheral:true,schedule:[{start:0,end:420,activity:"SLEEP",target:{x:8,y:3}},{start:420,end:540,activity:"COMMUTE",target:{x:10,y:3}},{start:540,end:1020,activity:"WATCH",target:{x:8,y:3}},{start:1020,end:1260,activity:"SOCIAL",target:{x:10,y:7}},{start:1260,end:1440,activity:"HOME",target:{x:8,y:3}}]});window.ESCIE_WORLD_NPC.registerSurveillance({id:"lane-camera",x:12,y:2,type:"CAMERA",radius:5,awareness:95,facing:"S",peripheral:false});}window.ESCIE_WORLD_SIMULATION?.seedWorldNPCs?.();
const syncNPCVisuals=()=>{const sim=window.ESCIE_WORLD_SIMULATION,npcApi=window.ESCIE_WORLD_NPC;if(!sim||!npcApi)return;try{sim.seedWorldNPCs?.();const d=String(sim.state()?.neighbourhood||"PARC-EXTENSION").toUpperCase();const live=npcApi.state?.().npcs||{};const locals=Object.values(live).filter(n=>String(n.district||"").toUpperCase()===d&&n.id!=="witness").map(n=>Object.assign({},n,{label:n.role||"RESIDENT",text:(n.activity||"IDLE")+" · "+(n.role||"LOCAL"),lines:[]}));const witness=npcs.find(n=>n.id==="witness");npcs=witness?[witness,...locals]:locals}catch(e){}}
const walls=new Set(["0,0","1,0","2,0","3,0","4,0","5,0","6,0","7,0","8,0","9,0","10,0","11,0","12,0","13,0","14,0","15,0","0,1","15,1","0,2","15,2","0,3","4,3","5,3","15,3","0,4","4,4","5,4","15,4","0,5","4,5","15,5","0,6","15,6","0,7","15,7","0,8","15,8","0,9","1,9","2,9","3,9","4,9","5,9","6,9","7,9","8,9","9,9","10,9","11,9","12,9","13,9","14,9","15,9"]);
let pos={...start},target=null,gamepadPrev={},dialogue=null,room="lane",roomObjects=[],roomState={};
const MARKET=[
 {id:"game-item-green-pass",title:"GREEN PASS",description:"A future access token for deeper layers of THE WORLD.",price:3,currency:"SIGNAL",type:"EARNED"},
 {id:"game-item-vhs-tape",title:"VHS TAPE",description:"A found recording from ROOM 01. It is also evidence.",price:0,currency:"SIGNAL",type:"FOUND"},
 {id:"game-item-baby-shoe",title:"BABY SHOE",description:"A found object. Meaning unresolved.",price:0,currency:"SIGNAL",type:"FOUND"}
];
const stage=document.getElementById("world-stage"),player=document.getElementById("world-player"),map=document.getElementById("world-map"),log=document.getElementById("world-log"),interact=document.getElementById("world-interact");
function esc(v){return String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))}
function syncSimulationPosition(){const s=window.ESCIE_WORLD_SIMULATION?.state?.();if(s?.position&&Number.isFinite(s.position.x)&&Number.isFinite(s.position.y)&&s.neighbourhood==="PARC-EXTENSION"&&pos.x===2&&pos.y===7)return;window.ESCIE_WORLD_SIMULATION?.setPosition?.(pos.x,pos.y)}
function state(){try{const parsed=JSON.parse(localStorage.getItem(KEY)||"{}");return parsed&&typeof parsed==="object"&&!Array.isArray(parsed)?parsed:{}}catch(e){return {}}}
function registryState(seed){const registry=window.ESCIE_GAME_REGISTRY;if(!registry?.createPlayerState)return seed&&typeof seed==="object"?seed:{};const s=seed&&typeof seed==="object"?seed:{};return registry.createPlayerState({session_id:s.session_id||"local-world",player_id:s.player_id||window.ESCIE_GAME_PROFILE?.id||null,episode_id:s.episode_id||"the-world",current_scene:s.world_room||room,current_location:s.neighbourhood||"PARC-EXTENSION",observed:s.observed,interacted:s.interacted,heard:s.heard,seen:s.seen,collected:s.collected,connections:s.connections,discoveries:s.discoveries,missed:s.missed,visited_scenes:s.visited_scenes,visited_locations:s.visited_locations,signals:s.signal_ids,unknown:s.unknown,unresolved:s.unresolved,unlocked:s.unlocked||s.world_unlocks,path:s.path,event_count:s.event_count});}
function syncRegistryState(local){if(!local||!window.ESCIE_GAME_REGISTRY?.createPlayerState)return local;const r=registryState(local);local.observed=r.observed;local.interacted=r.interacted;local.heard=r.heard;local.seen=r.seen;local.collected=r.collected;local.connections=r.connections;local.discoveries=r.discoveries;local.missed=r.missed;local.visited_scenes=r.visited_scenes;local.visited_locations=r.visited_locations;local.unknown=r.unknown;local.unresolved=r.unresolved;local.unlocked=r.unlocked;local.path=r.path;local.event_count=r.event_count;local.last_seen_at=r.last_seen_at;return local;}
function save(s){try{syncRegistryState(s);return commitStorageBatch({[KEY]:s})}catch(e){return false}}
function say(t){log.textContent=t}
function rpgState(s){
 const current=s&&typeof s==="object"?s:{};
 if(window.ESCIE_RPG&&!current.rpg)current.rpg=window.ESCIE_RPG.default();
 if(!current.rpg&&typeof current==="object")current.rpg={version:1,class_id:"DRIFTER",level:1,xp:0,unspent_points:0,attributes:{BODY:1,MIND:1,NERVE:1,SOCIAL:1},skills:{ATHLETICS:0,PARKOUR:0,STREETWISE:0,INVESTIGATION:0,TECH:0,CHARISMA:0,COMBAT:0,STEALTH:0},perks:[],quests:{active:[],completed:[],failed:[]},rewards:[],loot:[],equipment:{head:null,body:null,hands:null,feet:null,weapon:null,accessory:null},combat:{kills:0,knockouts:0,damage_dealt:0,damage_taken:0},dialogue:{choices:0,successes:0},discoveries:0};
 return current.rpg;
}
function awardRPGXP(amount,reason){
 const s=state(),r=rpgState(s),result=window.ESCIE_RPG?.gainXP?.(r,amount,reason);
 if(!result)return false;
 s.rpg=result.state;
 if(result.gained>0){
   const levelText=result.leveled?" · LEVEL "+result.state.level+" · +"+(result.levels*2)+" POINTS":"";
   if(!save(s)){say("RPG · SAVE FAILED");return false}
   say("XP +"+result.gained+" · "+String(reason||"PROGRESS").toUpperCase()+levelText);
 }
 return result;
}
function character(){
 const s=state(),r=rpgState(s),summary=window.ESCIE_RPG?.summary?.(r)||r,board=document.getElementById("rpg-board"),panel=document.getElementById("world-rpg");
 if(!board||!panel)return summary;
 const attrs=Object.entries(summary.attributes||{}).map(([k,v])=>"<div><span>"+esc(k)+"</span><strong>"+Number(v||0)+"</strong></div>").join("");
 const skills=Object.entries(summary.skills||{}).map(([k,v])=>"<div><span>"+esc(k)+"</span><strong>"+Number(v||0)+"</strong></div>").join("");
 const next=summary.next_xp==null?"MAX":summary.next_xp;
 board.innerHTML="<article class=\"rpg-card rpg-identity\"><span class=\"world-kicker\">CHARACTER</span><h3>"+esc(summary.class_id)+" · LEVEL "+Number(summary.level||1)+"</h3><p>XP "+Number(summary.xp||0)+" / "+next+" · "+Number(summary.unspent_points||0)+" POINTS AVAILABLE</p></article><section class=\"rpg-grid\"><div><h3>ATTRIBUTES</h3>"+attrs+"</div><div><h3>SKILLS</h3>"+skills+"</div></section><section class=\"rpg-combat\"><h3>COMBAT RECORD</h3><p>KILLS "+Number(summary.combat?.kills||0)+" · KNOCKOUTS "+Number(summary.combat?.knockouts||0)+" · DAMAGE "+Number(summary.combat?.damage_dealt||0)+" / "+Number(summary.combat?.damage_taken||0)+"</p></section><p class=\"investigation-note\">Progression is game-state only. It changes what the player can do; it does not rewrite the underlying reality.</p>";
 panel.hidden=false;return summary;
}
function spendRPGPoint(type,id){
 const s=state(),r=rpgState(s),result=window.ESCIE_RPG?.spendPoint?.(r,type,id);
 if(!result?.ok){say("RPG · "+String(result?.reason||"CANNOT SPEND"));return false}
 s.rpg=result.state;if(!save(s)){say("RPG · SAVE FAILED");return false}character();say("RPG · "+result.reason);return true;
}
function openDialogue(n){dialogue=n;const choices=n.choices||[];say(n.label+" · "+n.lines[0]+(choices.length?" · CHOOSE: "+choices.map((c,i)=>(i+1)+" "+c.label).join(" / "):""));}
function chooseDialogue(i){if(!dialogue)return;const c=(dialogue.choices||[])[i];if(!c)return;const s0=state(),rr=rpgState(s0);if(window.ESCIE_RPG){const xp=window.ESCIE_RPG.gainXP(rr,10,"DIALOGUE");s0.rpg=xp.state;save(s0)}const sim=window.ESCIE_WORLD_SIMULATION;if(sim){if(c.label==="WHO ARE YOU?")sim.choice("witness_identity","WHO ARE YOU?",{stress:1,social:2});else if(c.label==="WHAT IS THIS PLACE?")sim.choice("witness_place","WHAT IS THIS PLACE?",{stress:-1,social:1});else if(c.label==="I NEED THE KEY.")sim.choice("witness_key","I NEED THE KEY.",{stress:2,reputation:1});}say(window.ESCIE_WORLD_LANGUAGE?.speakToPlayer?.(dialogue,c.text)||c.text);window.ESCIE_WORLD_NPC?.rememberInteraction?.("witness",{choice:c.label,text:c.text});window.ESCIE_WORLD_NPC?.relationship?.("witness",c.label==="I NEED THE KEY."?5:2,c.label);if(c.discovery){const o={discovery:c.discovery,queries:c.queries||[]};discover(o);if(c.discovery==="game-discovery-witness"){const s=state();s.inventory=Array.isArray(s.inventory)?s.inventory:[];if(!s.inventory.includes("game-item-signal-key")){s.inventory.push("game-item-signal-key");if(!save(s)){say("SIGNAL KEY · SAVE FAILED");return}say(c.text+" The Witness places the Signal Key in your hand.");}}}dialogue=null;render();}
function isWall(x,y){return walls.has(x+","+y)}
function hasItem(id){const s=state();return Array.isArray(s.inventory)&&s.inventory.includes(id)}
function roomSetup(){const s=state();roomState={tvHeard:Array.isArray(s.discoveries)&&s.discoveries.includes("game-discovery-tv"),tapeTaken:Array.isArray(s.inventory)&&s.inventory.includes("game-item-vhs-tape"),room02:room==="room02"};roomObjects=room==="trace"?[{id:"trace-core",x:4,y:4,label:"TRACE CORE",text:"The signal has stopped behaving like a clue. It is behaving like a path.",discovery:"game-discovery-trace-core",queries:["query:trace-core","query:path","query:signal"]},{id:"exit-signal",x:6,y:2,label:"SIGNAL EXIT",text:"A final marker points toward something outside the playable layer.",discovery:"game-discovery-exit",queries:["query:exit","query:outside"]},{id:"return-frame",x:1,y:1,label:"RETURN FRAME",text:"A frame back to ROOM 02.",discovery:null}]:room==="room02"?[{id:"console",x:5,y:3,label:"GREEN TERMINAL",text:"A green terminal wakes when it recognizes the pass. It displays three options: LISTEN, TRACE, OPEN.",discovery:"game-discovery-terminal",queries:["query:terminal","query:deeper"]},{id:"archive",x:2,y:6,label:"ARCHIVE CABINET",text:"The cabinet contains an index of places, people and moments. Several entries are deliberately blank.",discovery:"game-discovery-deeper-archive",queries:["query:archive","query:places","query:people"]},{id:"trace-gate",x:6,y:6,label:"TRACE GATE",text:"A narrow green frame has appeared in the wall. It has no handle. The terminal may be the only way through.",discovery:null}]:[{id:"tv",x:5,y:2,label:"TELEVISION",text:"The television has no picture. The audio is a low recording of street noise.",discovery:"game-discovery-tv",queries:["query:television","query:audio"]},{id:"tape",x:2,y:5,label:"TAPE",text:"A VHS tape marked only with a date. No name.",discovery:"game-discovery-tape",queries:["query:tape","query:archive"],item:"game-item-vhs-tape"},{id:"green-door",x:7,y:6,label:"GREEN DOOR",text:"A second door. The lock has a green indicator and no handle.",discovery:null}]}
function cleanupWorldLifecycle(reason="ROOM_TRANSITION"){window.ESCIE_WORLD_DREAM_PLAY?.cancel?.(reason);window.ESCIE_WORLD_INTERIOR?.close?.();const dream=document.getElementById("dream-play-layer");if(dream)dream.hidden=true}
function transitionRoom(nextRoom,nextPos,message){cleanupWorldLifecycle("ROOM_TRANSITION");room=nextRoom;pos={x:Number(nextPos?.x)||0,y:Number(nextPos?.y)||0};roomSetup();window.ESCIE_WORLD_SIMULATION?.advance?.(5);const sim=window.ESCIE_WORLD_SIMULATION?.state?.();if(sim)window.ESCIE_WORLD_NPC?.tick?.(sim.day,sim.hour,sim.minute,(x,y)=>room==="lane"?isWall(x,y):false,5);window.ESCIE_WORLD_NPC_LIFE?.syncRelationships?.();syncSimulationPosition();persistRoom();if(message)say(message);render();return true}
function persistRoom(){const s=state();s.world_room=room;s.world_position={x:Number(pos.x)||0,y:Number(pos.y)||0};s.world_room_state=roomState;syncRegistryState(s);if(!save(s))return false;return !!saveWorldState()}
function enterDoor(){if(!target)return false;if(target.id==="trace-gate"){const s=state();if(!Array.isArray(s.discoveries)||!s.discoveries.includes("game-discovery-terminal")){say("TRACE GATE · TERMINAL ACCESS REQUIRED.");return true}if(!Array.isArray(s.world_unlocks)||!s.world_unlocks.includes("query:trace")){say("TRACE GATE · COMPLETE THE TERMINAL TRACE FIRST.");return true}return transitionRoom("trace",{x:1,y:1},"TRACE ACCEPTED. The green frame opens into a new layer.")}if(target.id==="door"){if(!hasItem("game-item-signal-key")){say("The lock stays silent. The Signal Key is still missing.");return true}return transitionRoom("room01",{x:2,y:7},"The door opens. Fluorescent light spills into the lane.")}if(target.id==="green-door"){if(!hasItem("game-item-green-pass")){say("GREEN DOOR · ACCESS DENIED. The World Market has the pass.");return true}return transitionRoom("room02",{x:1,y:1},"GREEN ACCESS ACCEPTED. A deeper layer opens.")}return false}
function leaveRoom(){if(room==="trace")return transitionRoom("room02",{x:6,y:6},"You return from the trace layer. The green frame remains.");if(room==="room02")return transitionRoom("room01",{x:6,y:5},"You return from the deeper layer. The green door remains unlocked.");if(room==="room01")return transitionRoom("lane",{x:3,y:3},"You step back into the lane. Nothing outside has changed.");return false}
function drawMap(){map.innerHTML="";for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=document.createElement("span");t.className="world-tile "+(isWall(x,y)?"wall":"floor");t.style.left=(x/W*100)+"%";t.style.top=(y/H*100)+"%";t.style.width=(100/W)+"%";t.style.height=(100/H)+"%";map.appendChild(t)}
const visible=(room==="room01"?roomObjects:objects.concat(npcs));visible.forEach(o=>{const n=document.createElement("span");n.className="world-object";n.dataset.entity=o.id==="camera"?"camera":o.id==="signal"?"signal":o.id==="witness"?"npc":o.id==="door"||o.id==="green-door"||o.id==="trace-gate"?"building":"object"; n.dataset.state=o.id==="camera"&&semanticWorldState().lawActive?"ACTIVE":o.id==="signal"?"DISTORTION":o.id==="witness"?"SOCIAL":"VISIBLE";n.textContent=o.id==="shoe"?"◊":o.id==="camera"?"●":o.id==="signal"?"≈":o.id==="chair"?"□":o.id==="witness"?"W":"▣";n.style.left=((o.x+.5)/W*100)+"%";n.style.top=((o.y+.5)/H*100)+"%";n.title=o.label;map.appendChild(n)})}
function semanticWorldState(){
 const sim=window.ESCIE_WORLD_SIMULATION?.state?.()||{};
 const law=window.ESCIE_WORLD_LAW?.state?.()||{};
 const veh=window.ESCIE_WORLD_VEHICLES?.state?.()||{};
 return {wanted:Number(sim.wanted||0),lawActive:!!law.active,transport:String(sim.transport||"FOOT"),vehicleCondition:Number(veh.condition??100)};
}
function render(){syncNPCVisuals();if(room==="room01"){target=roomObjects.find(o=>Math.abs(o.x-pos.x)<=1&&Math.abs(o.y-pos.y)<=1)||null}else{target=objects.concat(npcs).find(o=>Math.abs(o.x-pos.x)<=1&&Math.abs(o.y-pos.y)<=1)||null}document.getElementById("world-location").textContent=room==="room01"?"ROOM 01 · UNKNOWN ADDRESS":room==="room02"?"GREEN ACCESS · DEEPER LAYER":room==="trace"?"TRACE LAYER · SIGNAL PATH":"PARC-EXTENSION";player.style.left=((pos.x+.5)/W*100)+"%";player.style.top=((pos.y+.5)/H*100)+"%";if(target){interact.hidden=false;interact.textContent="● "+target.label;interact.style.left=((target.x+.5)/W*100)+"%";interact.style.top=((target.y+.5)/H*100)+"%"}else interact.hidden=true;const s=state();document.getElementById("world-coordinates").textContent=String(pos.x).padStart(2,"0")+" · "+String(pos.y).padStart(2,"0");document.getElementById("world-signal").textContent=(Number(s.signals)||0)+" SIGNAL"}
function move(dx,dy){const sim=window.ESCIE_WORLD_SIMULATION;if(room==="room01"||room==="room02"||room==="trace"){const nx=Math.max(0,Math.min(7,pos.x+dx)),ny=Math.max(0,Math.min(7,pos.y+dy));if(nx===pos.x&&ny===pos.y)return;pos={x:nx,y:ny};if(sim)sim.advance(2);const rs=sim?.state?.();if(rs)window.ESCIE_WORLD_NPC?.tick?.(rs.day,rs.hour,rs.minute,(x,y)=>false,2);window.ESCIE_WORLD_NPC_LIFE?.syncRelationships?.();persistRoom();say("The room hums. The television is on, but there is no picture.");render();return}const nx=Math.max(0,Math.min(W-1,pos.x+dx)),ny=Math.max(0,Math.min(H-1,pos.y+dy));if(isWall(nx,ny)){if(sim)sim.change({stress:1});say("Concrete. Locked space. Find another route.");return}if(nx===pos.x&&ny===pos.y)return;let movement=null;if(sim?.movePlayer){movement=sim.movePlayer(nx-pos.x,ny-pos.y,{mode:sim.state().transport||"FOOT"});if(!movement?.ok)return;}else{pos={x:nx,y:ny};sim?.setPosition?.(pos.x,pos.y);sim?.advance?.(1)}pos={x:nx,y:ny};if(sim){sim.advance(1);if(sim.state().transport==="RUN"||sim.state().transport==="PARKOUR")sim.change({hunger:-1});sim.decayWanted?.(0.02);window.ESCIE_WORLD_NPC?.tick?.(sim.state().day,sim.state().hour,sim.state().minute,(x,y)=>isWall(x,y),1);window.ESCIE_WORLD_NPC?.observe?.("MOVEMENT",pos,{radius:sim?.state?.().transport==="RUN"||sim?.state?.().transport==="PARKOUR"?5:4,speed:sim?.state?.().transport||"WALK",blocked:(x,y)=>isWall(x,y)});}say(movement?.to_node?("The street is real. SIGNAL ROUTE · "+movement.to_node+"."): "The street is real. The signal moves with you.");render()}
function registryDiscovery(id,queries){const registry=window.ESCIE_GAME_REGISTRY;if(!registry?.applyGameEvent)return true;const current=registryState(state());const next=registry.applyGameEvent(current,{type:"DISCOVER",target_id:id,queries:queries||[],timestamp:new Date().toISOString()});const local=state();syncRegistryState(Object.assign(local,next,{world_room:local.world_room,inventory:local.inventory,signals:local.signals,world_unlocks:local.world_unlocks}));return !!save(local);}
function discover(o){if(o.id==="tv")roomState.tvHeard=true;if(o.id==="tape")roomState.tapeTaken=true;const s=state();s.discoveries=Array.isArray(s.discoveries)?s.discoveries:[];s.world_unlocks=Array.isArray(s.world_unlocks)?s.world_unlocks:[];if(o.discovery&&!s.discoveries.includes(o.discovery)){s.discoveries.push(o.discovery);awardRPGXP(15,"DISCOVERY");(o.queries||[]).forEach(q=>{if(!s.world_unlocks.includes(q))s.world_unlocks.push(q)});s.signals=(Number(s.signals)||0)+1;if(!registryDiscovery(o.discovery,o.queries))return false}if(o.item){s.inventory=Array.isArray(s.inventory)?s.inventory:[];if(!s.inventory.includes(o.item))s.inventory.push(o.item)}s.entered=true;s.entry_source="world";if(!save(s))return false;return persistRoom()}
function unlockFromEvidence(){const s=state();s.world_unlocks=Array.isArray(s.world_unlocks)?s.world_unlocks:[];["query:tape","query:television","query:archive","query:audio","query:date"].forEach(q=>{if(!s.world_unlocks.includes(q))s.world_unlocks.push(q)});s.signals=(Number(s.signals)||0)+1;s.unresolved=Array.isArray(s.unresolved)?s.unresolved:[];if(!s.unresolved.includes("room01-date"))s.unresolved.push("room01-date");return !!save(s)}
function npcDialogue(n){const rel=Number(window.ESCIE_WORLD_NPC?.state?.().npcs?.[n.id]?.relationship||0),role=n.role||"LOCAL",lang=window.ESCIE_WORLD_LANGUAGE?.profile?.(n)||{};return {id:n.id,label:n.label||role,lines:[role+" · "+(n.activity||"IDLE")+" · "+String(lang.community||"LOCAL")],choices:[{label:"TALK",text:rel>=40?"You seem familiar. We can talk.":rel<=-40?"I don't have much to say to you.":"What's up?"},{label:"HELP",text:"You offer to help."},{label:"JOB",text:"Ask if they have work."},{label:"FAVOR",text:"Ask if there's something useful to do."},{label:"INSULT",text:"The mood changes immediately."},{label:"GIVE",text:"You offer something without explaining why."}]};}
function chooseDialogueLegacy(i){if(!dialogue)return;const c=(dialogue.choices||[])[i];if(!c)return;const sim=window.ESCIE_WORLD_SIMULATION;
if(dialogue._npc&&dialogue.id!=="witness"){if(c.label==="JOB"){const offer=sim?.npcJobOffer?.(dialogue.id)||{};const result=offer.ok&&offer.available?sim.npcJobAccept(dialogue.id):offer;say(result.ok?(result.offer.label+" · +$"+result.offer.pay):"NO WORK · "+String(result.reason||"UNAVAILABLE"));dialogue=null;render();return;}if(c.label==="FAVOR"){const result=sim?.npcFavor?.(dialogue.id,"FAVOR")||{};say(result.ok?"FAVOR COMPLETE · +$"+result.reward:"NO FAVOR · "+String(result.reason||"TRUST REQUIRED"));dialogue=null;render();return;}const type=c.label==="GIVE"?"GIFT":c.label;const result=sim?.npcInteraction?.(dialogue.id,type)||{};say((result.reaction||"OBSERVANT")+" · "+(result.relationship??0)+" RELATIONSHIP");window.ESCIE_PHONE_GAMEPLAY?.relationshipMessage?.(dialogue.id,c.text);dialogue=null;render();return;}
if(sim){if(c.label==="WHO ARE YOU?")sim.choice("witness_identity","WHO ARE YOU?",{stress:1,social:2});else if(c.label==="WHAT IS THIS PLACE?")sim.choice("witness_place","WHAT IS THIS PLACE?",{stress:-1,social:1});else if(c.label==="I NEED THE KEY.")sim.choice("witness_key","I NEED THE KEY.",{stress:2,reputation:1});}say(window.ESCIE_WORLD_LANGUAGE?.speakToPlayer?.(dialogue,c.text)||c.text);window.ESCIE_WORLD_NPC?.rememberInteraction?.("witness",{choice:c.label,text:c.text});window.ESCIE_WORLD_NPC?.relationship?.("witness",c.label==="I NEED THE KEY."?5:2,c.label);if(c.discovery){const o={discovery:c.discovery,queries:c.queries||[]};discover(o);if(c.discovery==="game-discovery-witness"){const s=state();s.inventory=Array.isArray(s.inventory)?s.inventory:[];if(!s.inventory.includes("game-item-signal-key")){s.inventory.push("game-item-signal-key");if(!save(s)){say("SIGNAL KEY · SAVE FAILED");return}say(c.text+" The Witness places the Signal Key in your hand.");}}}dialogue=null;render();}
const nearbyBuilding=()=>{
 const sim=window.ESCIE_WORLD_SIMULATION;if(!sim)return null;
 const s=sim.state?.()||{},d=String(s.neighbourhood||"PARC-EXTENSION").toUpperCase(),p=pos;
 const buildings=sim.districtBuildings?.(d)||[];
 let best=null;
 buildings.forEach(b=>{
   const lm=sim.findLandmark?.(d,b.landmark);const node=(sim.streetNodes?.[d]||[]).find(x=>x.id===lm?.node);
   if(!node)return;
   const distance=Math.abs(Number(p.x)-node.x)+Math.abs(Number(p.y)-node.y);
   if(distance<=1&&(!best||distance<best.distance))best={building:b,node,distance};
 });
 return best;
};
function enterNearbyBuilding(){
 const sim=window.ESCIE_WORLD_SIMULATION,b=nearbyBuilding();if(!sim||!b)return false;
 const result=sim.enterBuilding?.(String(sim.state().neighbourhood||"").toUpperCase(),b.building.id);
 if(!result?.ok){say(b.building.name+" · "+String(result.reason||"ACCESS REQUIRED"));return true;}
 const live=window.ESCIE_WORLD_NPC?.state?.().npcs||{};
 const occupants=Object.values(live).filter(n=>n.interior?.entered&&n.interior.building_id===b.building.id);
 const names=occupants.map(n=>n.name||n.label||n.role||"LOCAL");
 const interior=result.interior?.name||b.building.interior;
 say(interior+" · ENTERED · "+(names.length?names.length+" PEOPLE INSIDE · "+names.slice(0,4).join(", "):"NO ONE HERE"));
 window.dispatchEvent(new CustomEvent("escie:world-interior-enter",{detail:{building:b.building,occupants}}));
 return true;
}
function interactNPC(n){const d=npcDialogue(n);d.choices.forEach(ch=>ch.text=ch.text);dialogue=d;openDialogue(d);dialogue._npc=true;return d;}
function chooseDialogue(i){if(!dialogue)return;const c=(dialogue.choices||[])[i];if(!c)return;const sim=window.ESCIE_WORLD_SIMULATION;
if(dialogue._npc&&dialogue.id!=="witness"){const type=c.label==="GIVE"?"GIFT":c.label;const result=sim?.npcInteraction?.(dialogue.id,type)||{};say((result.reaction||"OBSERVANT")+" · "+(result.relationship??0)+" RELATIONSHIP");if(window.ESCIE_PHONE_GAMEPLAY?.relationshipMessage)window.ESCIE_PHONE_GAMEPLAY.relationshipMessage(dialogue.id,c.text);dialogue=null;render();return;}
if(sim){if(c.label==="WHO ARE YOU?")sim.choice("witness_identity","WHO ARE YOU?",{stress:1,social:2});else if(c.label==="WHAT IS THIS PLACE?")sim.choice("witness_place","WHAT IS THIS PLACE?",{stress:-1,social:1});else if(c.label==="I NEED THE KEY.")sim.choice("witness_key","I NEED THE KEY.",{stress:2,reputation:1});}say(window.ESCIE_WORLD_LANGUAGE?.speakToPlayer?.(dialogue,c.text)||c.text);window.ESCIE_WORLD_NPC?.rememberInteraction?.("witness",{choice:c.label,text:c.text});window.ESCIE_WORLD_NPC?.relationship?.("witness",c.label==="I NEED THE KEY."?5:2,c.label);if(c.discovery){const o={discovery:c.discovery,queries:c.queries||[]};discover(o);if(c.discovery==="game-discovery-witness"){const s=state();s.inventory=Array.isArray(s.inventory)?s.inventory:[];if(!s.inventory.includes("game-item-signal-key")){s.inventory.push("game-item-signal-key");save(s);say(c.text+" The Witness places the Signal Key in your hand.");}}}dialogue=null;render();}
function isWall(x,y){return walls.has(x+","+y)}
function hasItem(id){const s=state();return Array.isArray(s.inventory)&&s.inventory.includes(id)}
function interactNow(){if(!target){say("Nothing nearby to interact with.");return false}const sim=window.ESCIE_WORLD_SIMULATION;if(sim){if(target.id==="camera")sim.change({stress:2});if(target.id==="shoe")sim.change({stress:1,social:1});if(target.id==="signal")sim.change({stress:-2,reputation:1});}say(target.text||target.label||"INTERACTION");discover(target);if(room==="room01"&&(target.id==="tv"||target.id==="tape")){unlockFromEvidence();say(target.id==="tv"?"The audio resolves into a date. Something in the archive is now reachable.":"The tape is now yours. Its date matches the signal thread.");}if(target.id==="door"||target.id==="green-door"||target.id==="trace-gate"){if(enterDoor())return true}if(room==="room02"&&target.id==="console"){terminalChoices();return true}if(room==="trace"&&target.id==="return-frame"){leaveRoom();return true}render();return true}
const QUESTS=[
 {id:"quest-first-signal",title:"FIRST SIGNAL",description:"Find the strongest distortion in the lane.",requires:["game-discovery-trail"],reward:1},
 {id:"quest-witness",title:"THE WITNESS",description:"Speak to THE WITNESS and receive the key instruction.",requires:["game-discovery-witness"],reward:1},
 {id:"quest-room01",title:"ROOM 01",description:"Open the locked door and enter the unknown address.",requires:["room01"],reward:2},
 {id:"quest-archive",title:"THE DATED TAPE",description:"Find the television and VHS tape inside ROOM 01.",requires:["game-discovery-tv","game-discovery-tape"],reward:2},
 {id:"quest-green-access",title:"GREEN ACCESS",description:"Acquire the Green Pass and enter the deeper layer.",requires:["game-item-green-pass","room02"],reward:3},
 {id:"quest-trace",title:"TRACE",description:"Wake the Green Terminal and open the Trace Gate.",requires:["game-discovery-terminal","query:trace"],reward:4},
 {id:"quest-exit",title:"THE SIGNAL EXIT",description:"Reach the end marker in the Trace Layer.",requires:["game-discovery-exit"],reward:5}
];
function questStatus(q,s){const done=Array.isArray(s.completed_quests)&&s.completed_quests.includes(q.id);const met=q.requires.every(id=>id==="room01"?s.world_room==="room01":id==="room02"?s.world_room==="room02":id==="trace"?s.world_room==="trace":id.startsWith("query:")?(Array.isArray(s.world_unlocks)&&s.world_unlocks.includes(id)):(Array.isArray(s.discoveries)&&s.discoveries.includes(id))||(Array.isArray(s.inventory)&&s.inventory.includes(id)));return {done,met};}
function grantQuestRewards(){
 const s=state();s.completed_quests=Array.isArray(s.completed_quests)?s.completed_quests:[];let gained=0;
 QUESTS.forEach(q=>{const st=questStatus(q,s);if(!st.done&&st.met){s.completed_quests.push(q.id);gained+=q.reward;}});
 if(gained){
   const r=rpgState(s),xp=window.ESCIE_RPG?.gainXP?.(r,gained*25,"QUEST");
   if(xp)s.rpg=xp.state;
   const registry=window.ESCIE_GAME_REGISTRY;
   if(registry&&registry.applyEconomyEvent){
     const economy={balances:{SIGNAL:Number(s.signals||0)}};
     const next=registry.applyEconomyEvent(economy,{type:"EARN",amount:gained,currency:"SIGNAL",reason:"WORLD QUEST REWARD",timestamp:new Date().toISOString()});
     s.signals=Number(next.balances.SIGNAL||0);
   }else s.signals=Number(s.signals||0)+gained;
   if(!save(s)){say("QUEST COMPLETE · SAVE FAILED");return}say("QUEST COMPLETE · +"+gained+" SIGNAL");
   return gained;
 }
 return 0;
}
function quests(){
 const s=state(),board=document.getElementById("quest-board"),panel=document.getElementById("world-quests");if(!board||!panel)return;
 board.innerHTML=QUESTS.map(q=>{const st=questStatus(q,s);return "<article class=\"world-quest "+(st.done?"complete":st.met?"ready":"locked")+"\"><span>"+(st.done?"COMPLETE":st.met?"READY":"IN PROGRESS")+"</span><h3>"+esc(q.title)+"</h3><p>"+esc(q.description)+"</p><small>"+(st.done?"REWARD CLAIMED · "+q.reward+" SIGNAL":st.met?"RETURN TO QUESTS TO CLAIM · "+q.reward+" SIGNAL":"REQUIREMENTS · "+q.requires.join(" · "))+"</small></article>"}).join("");
 panel.hidden=false;
}
function terminalChoices(){const s=state();const board=document.getElementById("quest-board");const panel=document.getElementById("world-quests");if(!board||!panel)return;const choices=[["LISTEN","Follow the audio pattern.","query:trace-audio"],["TRACE","Map the signal as a path.","query:trace"],["OPEN","Expose the archive layer.","query:trace-archive"]];board.innerHTML="<article class=\"world-quest ready\"><span>GREEN TERMINAL</span><h3>CHOOSE A METHOD</h3><p>The terminal does not tell you which interpretation is correct.</p><div class=\"terminal-choice-list\">"+choices.map(x=>"<button type=\"button\" data-terminal-choice=\""+x[2]+"\"><strong>"+x[0]+"</strong><small>"+x[1]+"</small></button>").join("")+"</div></article>";panel.hidden=false;board.querySelectorAll("[data-terminal-choice]").forEach(b=>b.addEventListener("click",()=>{const q=b.dataset.terminalChoice;s.world_unlocks=Array.isArray(s.world_unlocks)?s.world_unlocks:[];if(!s.world_unlocks.includes(q)){s.world_unlocks.push(q);s.signals=(Number(s.signals)||0)+1}s.terminal_choice=q;if(!save(s)){say("TERMINAL · SAVE FAILED");return}panel.hidden=true;say("TERMINAL · "+q.replace("query:","").toUpperCase()+" SELECTED · +1 SIGNAL");render()}))}
function inventory(){grantQuestRewards();const s=state(),inv=Array.isArray(s.inventory)?s.inventory:[],eq=window.ESCIE_WORLD_EQUIPMENT?.describe?.();const gear=eq?(" · HAND "+(eq.equipped.hand?.label||"NONE")+" · BODY "+(eq.equipped.body?.label||"NONE")):"";say((inv.length?"INVENTORY · "+inv.join(" · "):"INVENTORY EMPTY")+gear);return eq}
function investigationLegacy(){const s=state(),d=Array.isArray(s.discoveries)?s.discoveries:[],u=Array.isArray(s.unresolved)?s.unresolved:[],w=Array.isArray(s.world_unlocks)?s.world_unlocks:[],inv=Array.isArray(s.inventory)?s.inventory:[];const board=document.getElementById("investigation-board"),panel=document.getElementById("world-investigation");const nodes=[["CAMERA",d.includes("game-discovery-camera"),"query:camera"],["BABY SHOE",d.includes("game-discovery-shoe"),"query:shoe"],["WITNESS",d.includes("game-discovery-witness"),"query:witness"],["TELEVISION",d.includes("game-discovery-tv"),"query:television"],["VHS TAPE",d.includes("game-discovery-tape"),"query:tape"],["SIGNAL TRAIL",d.includes("game-discovery-trail"),"query:trail"],["SIGNAL KEY",inv.includes("game-item-signal-key"),"query:key"],["ROOM 01",w.includes("query:archive"),"query:archive"]];const links=[["CAMERA","TELEVISION","Both are observation/recording devices; the game places them in the same evidence chain."],["TELEVISION","VHS TAPE","The television produces the audio clue; the tape carries a dated recording. That makes a media trail worth examining."],["VHS TAPE","ROOM 01","The tape is found in Room 01, so the physical location and the object are directly connected."],["BABY SHOE","WITNESS","The shoe is a childhood object while the Witness points toward memory and pattern. The connection is thematic, not proof."],["WITNESS","SIGNAL KEY","The Witness points you toward the thing that responds to the distortion; the Signal Key is the games response to that instruction."],["SIGNAL KEY","ROOM 01","The key is required to open the door into Room 01. This is a game-state connection, not evidence of who made either object."],["SIGNAL TRAIL","CAMERA","The signal trail and camera occupy the same wider lane investigation; the game invites you to compare them."]];const explain=(l)=>{const a=l[0],b=l[1],found=nodes.filter(n=>n[0]===a||n[0]===b).every(n=>n[1]);return `<button class="investigation-link ${found?"active":""}" type="button" data-link-a="${a}" data-link-b="${b}"><span>${a}</span><b>↔</b><span>${b}</span><small>${found?"EXAMINE CONNECTION":"LOCKED · FIND BOTH"}</small></button>`};const details={CAMERA:["OBSERVATION","A camera watches the lane. Its lens is pointed somewhere specific.","DISCOVERY: surveillance thread unlocked. Question: what was being recorded, and why?"],["BABY SHOE"]:["OBJECT","A small shoe sits near the curb. Meaning unresolved.","DISCOVERY: childhood thread unlocked. Question: is the meaning personal, symbolic, or simply coincidental?"],WITNESS:["PERSON","Someone who stayed long enough to notice a pattern. The Witness warns against confusing discovery with proof.","DISCOVERY: witness/key thread unlocked. Question: is the Witness reliable, symbolic, or another layer of the investigation?"],TELEVISION:["RECORDING","The television has no picture. Its audio is a low recording of street noise.","DISCOVERY: audio thread unlocked. Question: what does the recording actually establish?"],["VHS TAPE"]:["OBJECT / RECORDING","A VHS tape marked only with a date. No name.","DISCOVERY: archive thread unlocked. Question: whose recording is this, and what does the date mean?"],["SIGNAL TRAIL"]:["ANOMALY","The distortion is strongest here. Something continues beyond the street.","DISCOVERY: path/distortion thread unlocked. Question: is the signal a thing, a pattern, or an interpretation?"],["SIGNAL KEY"]:["GAME OBJECT","The key responds to the distortion and opens the route into Room 01.","GAME-STATE CONNECTION: required for the door. This does not prove an origin story."],["ROOM 01"]:["LOCATION","An unknown address reached through the locked door.","GAME-STATE CONNECTION: the room links the key, television, tape, and archive thread."]};board.innerHTML=nodes.map(n=>`<article class="investigation-node ${n[1]?"found":"unknown"}" data-query="${n[2]}"><span>${n[1]?"FOUND":"UNKNOWN"}</span><strong>${n[0]}</strong><small>${n[1]?"THREAD CONNECTED":"NO CONFIRMED CONNECTION"}</small></article>`).join("")+`<div class="investigation-links">${links.map(explain).join("")}</div><div id="investigation-detail" class="investigation-detail" hidden></div>`;board.querySelectorAll(".investigation-node.found").forEach(n=>n.addEventListener("click",()=>{const key=n.querySelector("strong").textContent,detail=document.getElementById("investigation-detail"),d=details[key];if(!d)return;detail.hidden=false;detail.innerHTML="<span>"+d[0]+"</span><strong>"+key+"</strong><p>"+d[1]+"</p><small>"+d[2]+"</small>";detail.scrollIntoView({behavior:"smooth",block:"nearest"})}));board.querySelectorAll(".investigation-link").forEach((b,i)=>b.addEventListener("click",()=>{const l=links[i],detail=document.getElementById("investigation-detail");detail.hidden=false;if(!b.classList.contains("active")){detail.innerHTML="<strong>CONNECTION LOCKED</strong><p>Find both pieces of the thread before drawing a conclusion.</p>";return}detail.innerHTML="<span>WHY THIS CONNECTION APPEARS</span><strong>"+l[0]+" ↔ "+l[1]+"</strong><p>"+l[2]+"</p><small>CONNECTED IN THE GAME · NOT CONFIRMED AS CANONICAL PROOF</small>";}));if(u.length){board.insertAdjacentHTML("beforeend",`<article class="investigation-node unresolved"><span>UNRESOLVED</span><strong>${u.join(" · ").toUpperCase()}</strong><small>DO NOT ASSUME · INVESTIGATE</small></article>`)}panel.hidden=false}
function glass(){const s=state();say("GLASS EYE · "+(s.discoveries||[]).length+" DISCOVERIES · "+(s.unresolved||[]).length+" UNRESOLVED · "+(s.world_unlocks||[]).length+" WORLD THREADS")}
const CONTROL_SCHEMES={
  AUTO:{label:"AUTO",primary:"INTERACT",secondary:"OPEN",movement:"LEFT",actions:"RIGHT"},
  TOUCH:{label:"TOUCH",primary:"INTERACT",secondary:"OPEN",movement:"LEFT",actions:"RIGHT"},
  KEYBOARD:{label:"KEYBOARD",primary:"INTERACT",secondary:"OPEN",movement:"WASD",actions:"E/Q/F"},
  GAMEPAD:{label:"GAMEPAD",primary:"A · INTERACT",secondary:"Y · OPEN",movement:"LEFT STICK",actions:"X · FIGHT / LB+RB · SPRINT / START · PAUSE / BACK · INVENTORY"}
};
function controlScheme(){try{return localStorage.getItem("escie_world_control_scheme_v1")||"AUTO"}catch(e){return "AUTO"}}
function setControlScheme(v){return commitStorageBatch({"escie_world_control_scheme_v1":String(v||"AUTO").toUpperCase()})}
function activeInputDevice(kind){const k=String(kind||"").toUpperCase();if(k==="GAMEPAD"||k==="KEYBOARD"||k==="TOUCH")setControlScheme(k);else if(controlScheme()==="AUTO"&&k)setControlScheme(k);const label=controlScheme();const el=document.getElementById("device-status");if(el)el.textContent="● "+label;return label}
function preventInputRepeat(e){if(e.repeat)return true;if(["INPUT","TEXTAREA","SELECT"].includes(e.target?.tagName))return true;return false}
function performControlAction(type){
 const sim=window.ESCIE_WORLD_SIMULATION,s=sim?.state?.();if(!sim||!s)return;
 const t=String(type||"").toUpperCase();
 if(t==="SPRINT"){const s=state();sim.advance?.(1);say("SPRINT · MOVEMENT SPEED INCREASED · "+Number(s.energy??0)+" ENERGY");return}
 if(t==="OPEN"){const v=window.ESCIE_WORLD_VEHICLES;const s=state();if(v&&s.transport==="CAR"&&v.state().current){const radio=v.radio();say(radio.ok?("RADIO · "+radio.line):"CAR · NO RADIO");return}if(enterNearbyBuilding())return;interactNow();return}
 if(t==="STEAL"){const target=npcs.find(n=>Math.abs(n.x-pos.x)<=1&&Math.abs(n.y-pos.y)<=1);if(!target){say("STEAL · NO VALID TARGET");return}const r=sim.steal?.("npc:"+target.id,false);say(r?.ok===false?"STEAL · FAILED":"STEAL · ACTION TAKEN · NO WITNESS");return}
 if(t==="FIGHT"){const target=npcs.find(n=>Math.abs(n.x-pos.x)<=1&&Math.abs(n.y-pos.y)<=1);if(!target){say("FIGHT · NO VALID TARGET");return}const attack=sim.combatAttack?.(target.id,{weapon:"FIST"});if(attack?.reason==="EXHAUSTED"){say("FIGHT · TOO EXHAUSTED");return}if(!attack?.ok){say("FIGHT · "+String(attack?.reason||"FAILED"));return}window.ESCIE_WORLD_NPC?.relationship?.(target.id,-8,"FIGHT");if(attack.target?.down){const s0=state(),rr=rpgState(s0),xp=window.ESCIE_RPG?.gainXP?.(rr,40,"COMBAT");if(xp){s0.rpg=window.ESCIE_RPG.recordCombat(xp.state,"knockout",{dealt:Number(attack.damage||0),taken:0});save(s0)}say("TARGET DOWN · +40 XP · CONSEQUENCE REGISTERED");}else{const retaliation=Math.max(2,Math.min(12,Math.round((100-(attack.target?.health??100))/12)));const hit=sim.applyDamage?.(retaliation,"NPC_RETALIATION");if(hit?.dead){const r=sim.respawn?.();say(r?.ok?"YOU DIED · RESPAWNED · 06:00 · PARC-EXTENSION":"YOU DIED · NO RESPAWN");return}if(hit?.hospital){say("SERIOUS INJURY · HOSPITAL REQUIRED");return}say("FIGHT · TARGET HP "+Number(attack.target?.health??0)+" · YOUR HP "+Number(hit?.state?.health??0));}return}
}
function key(e){if(preventInputRepeat(e))return;const k=e.key.toLowerCase();activeInputDevice("KEYBOARD");if(k==="arrowup"||k==="w")move(0,-1);else if(k==="arrowdown"||k==="s")move(0,1);else if(k==="arrowleft"||k==="a")move(-1,0);else if(k==="arrowright"||k==="d")move(1,0);else if(k==="enter"||k===" ")interactNow();else if(k==="i")inventory();else if(k==="g")glass();else if(k==="escape"&&room==="room01")leaveRoom();else if(dialogue&&["1","2","3"].includes(k))chooseDialogue(Number(k)-1)}
window.ESCIE_WORLD_ACTIONS={performControlAction,discover:(o)=>discover(o),interactObject:(o)=>{if(!o)return false;const sim=window.ESCIE_WORLD_SIMULATION;if(sim){if(o.id==="camera")sim.change({stress:2});if(o.id==="shoe")sim.change({stress:1,social:1});if(o.id==="signal")sim.change({stress:-2,reputation:1});}say(o.text||o.label||"INTERACTION");return discover(o)}};
document.addEventListener("keydown",key);
document.querySelectorAll("[data-dir]").forEach(b=>b.addEventListener("click",()=>{activeInputDevice("TOUCH");const d=b.dataset.dir;move(d==="left"?-1:d==="right"?1:0,d==="up"?-1:d==="down"?1:0)}));
document.querySelectorAll("[data-control-action]").forEach(b=>b.addEventListener("click",()=>{activeInputDevice("TOUCH");performControlAction(b.dataset.controlAction)}));
document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>{activeInputDevice("TOUCH");interactNow()}));
document.querySelector("[data-inventory]")?.addEventListener("click",inventory);document.querySelector("[data-character]")?.addEventListener("click",character);document.querySelector("[data-close-rpg]")?.addEventListener("click",()=>{document.getElementById("world-rpg").hidden=true});
document.querySelector("[data-glass]")?.addEventListener("click",glass);document.querySelector("[data-investigation]")?.addEventListener("click",investigation);document.querySelector("[data-close-investigation]")?.addEventListener("click",()=>{document.getElementById("world-investigation").hidden=true});document.querySelector("[data-market]")?.addEventListener("click",market);document.querySelector("[data-close-quests]")?.addEventListener("click",()=>{document.getElementById("world-quests").hidden=true});document.querySelector("[data-quests]")?.addEventListener("click",()=>{grantQuestRewards();quests()});document.querySelector("[data-close-market]")?.addEventListener("click",()=>{document.getElementById("world-market").hidden=true});
function poll(){try{const p=Array.from(navigator.getGamepads?navigator.getGamepads():[]).find(Boolean);if(p){const a=i=>!!(p.buttons[i]&&p.buttons[i].pressed),x=p.axes[0]||0,y=p.axes[1]||0,l=x<-.65,r=x>.65,u=y<-.65,d=y>.65,startBtn=a(9),backBtn=a(8),xBtn=a(2),yBtn=a(3),lb=a(4),rb=a(5),used=l||r||u||d||startBtn||backBtn||xBtn||yBtn||lb||rb||a(0)||a(1);if(used)activeInputDevice("GAMEPAD");if((l&&!gamepadPrev.l)||(r&&!gamepadPrev.r))move(r?1:-1,0);if((u&&!gamepadPrev.u)||(d&&!gamepadPrev.d))move(0,d?1:-1);if(a(0)&&!gamepadPrev.a)interactNow();if(a(1)&&!gamepadPrev.b)glass();if(xBtn&&!gamepadPrev.x)performControlAction("FIGHT");if(yBtn&&!gamepadPrev.y)performControlAction("OPEN");if(startBtn&&!gamepadPrev.start)pauseMenu();if(backBtn&&!gamepadPrev.back)inventory();if((lb&&!gamepadPrev.lb)||(rb&&!gamepadPrev.rb))performControlAction("SPRINT");gamepadPrev={l,r,u,d,a:a(0),b:a(1),x:xBtn,y:yBtn,start:startBtn,back:backBtn,lb,rb}}}catch(e){}requestAnimationFrame(poll)}
window.addEventListener("gamepadconnected",()=>activeInputDevice("GAMEPAD"));
window.addEventListener("gamepaddisconnected",()=>{if(controlScheme()==="GAMEPAD")activeInputDevice("AUTO")});
// --- WORLD HARDENING / MARKET / EVIDENCE ACCESSIBILITY ---
function esc(v){return String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]))}
const MARKET_ITEMS=[
 {id:"game-item-green-pass",title:"GREEN PASS",description:"A future access token for deeper layers of THE WORLD.",price:3,currency:"SIGNAL",type:"EARNED"},
 {id:"game-item-vhs-tape",title:"VHS TAPE",description:"A found recording from ROOM 01. It is also evidence.",price:0,currency:"SIGNAL",type:"FOUND"},
 {id:"game-item-baby-shoe",title:"BABY SHOE",description:"A found object. Meaning unresolved.",price:0,currency:"SIGNAL",type:"FOUND"}
];
function openEvidence(title,d){
 const panel=document.getElementById("investigation-detail");if(!panel)return;
 panel.hidden=false;
 panel.innerHTML="<span>"+esc(d[0])+"</span><strong>"+esc(title)+"</strong><p>"+esc(d[1])+"</p><p>"+esc(d[2])+"</p><small>"+esc(d[3])+"</small><div class=\"evidence-detail-actions\"><button type=\"button\" data-close-evidence>CLOSE DETAIL</button><button type=\"button\" data-pin-evidence>PIN TO LOG</button></div>";
 panel.querySelector("[data-close-evidence]").onclick=()=>{panel.hidden=true};
 panel.querySelector("[data-pin-evidence]").onclick=()=>say("EVIDENCE PINNED · "+title);
 panel.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function market(){
 const s=state(),inv=Array.isArray(s.inventory)?s.inventory:[],board=document.getElementById("market-board");if(!board)return;
 board.innerHTML="";
 MARKET_ITEMS.forEach(it=>{
   const owned=inv.includes(it.id),card=document.createElement("article");card.className="market-item "+(owned?"owned":"");
   card.innerHTML="<span class=\"world-kicker\">"+it.type+"</span><h3>"+esc(it.title)+"</h3><p>"+esc(it.description)+"</p><span class=\"market-price\">"+esc(it.type==="EARNED"?it.price+" "+it.currency:"FOUND IN WORLD")+"</span><span class=\"market-status\">"+(owned?"OWNED":"AVAILABLE")+"</span>";
   if(it.type==="EARNED"){
     const b=document.createElement("button");b.type="button";b.textContent=owned?"OWNED":"BUY · "+it.price+" SIGNAL";b.disabled=owned||Number(s.signals||0)<it.price;
     b.onclick=()=>{const cur=state();if(Number(cur.signals||0)<it.price){say("NOT ENOUGH SIGNAL.");return}const registry=window.ESCIE_GAME_REGISTRY;const item=registry&&registry.gameItem?registry.gameItem({id:it.id,type:"game_item",title:it.title,description:it.description,price:it.price,price_type:"EARNED",currency:it.currency,availability:"AVAILABLE"}):null;if(registry&&item&&registry.acquireGameItem){const economy={balances:{SIGNAL:Number(cur.signals||0)},owned:Array.isArray(cur.inventory)?cur.inventory.filter(Boolean):[],purchases:[]};const result=registry.acquireGameItem(economy,item,{timestamp:new Date().toISOString()});if(!result.ok){say("PURCHASE FAILED · "+result.reason.toUpperCase());return}cur.signals=Number(result.economy.balances.SIGNAL||0);cur.inventory=result.economy.owned.slice();cur.purchases=Array.isArray(cur.purchases)?cur.purchases:[];cur.purchases.push({item_id:it.id,currency:it.currency,price:it.price,timestamp:new Date().toISOString(),engine:"ESCIE_GAME_REGISTRY"});}else{cur.signals=Number(cur.signals||0)-it.price;cur.inventory=Array.isArray(cur.inventory)?cur.inventory:[];if(!cur.inventory.includes(it.id))cur.inventory.push(it.id);cur.purchases=Array.isArray(cur.purchases)?cur.purchases:[];cur.purchases.push({item_id:it.id,currency:it.currency,price:it.price,timestamp:new Date().toISOString(),engine:"LOCAL_FALLBACK"});}if(!save(cur)){say("PURCHASE FAILED · SAVE ERROR");return}say("PURCHASE COMPLETE · "+it.title);market();render()};
     card.appendChild(b);
   }
   board.appendChild(card);
 });
 document.getElementById("world-market").hidden=false;
}
function investigation(){
 const s=state(),d=Array.isArray(s.discoveries)?s.discoveries:[],u=Array.isArray(s.unresolved)?s.unresolved:[],inv=Array.isArray(s.inventory)?s.inventory:[];
 const found=id=>d.includes(id)||inv.includes(id);
 const nodes=[
  ["CAMERA","game-discovery-camera","OBSERVATION","A camera watches the lane.","What was recorded, and why?"],
  ["BABY SHOE","game-discovery-shoe","OBJECT","A small shoe was found near the curb.","Personal, symbolic, or coincidence?"],
  ["WITNESS","game-discovery-witness","PERSON","The Witness claims to have noticed a pattern.","How reliable is the Witness?"],
  ["TELEVISION","game-discovery-tv","RECORDING","A television produced low street-noise audio.","What does the recording establish?"],
  ["VHS TAPE","game-discovery-tape","OBJECT / RECORDING","A dated tape has no name.","Whose tape is it, and what does the date mean?"],
  ["SIGNAL TRAIL","game-discovery-trail","ANOMALY","Distortion is strongest along a specific path.","Signal, pattern, or interpretation?"],
  ["SIGNAL KEY","game-item-signal-key","GAME OBJECT","The key responds to distortion and opens ROOM 01.","Game-state connection, not origin proof."],
  ["ROOM 01","room01","LOCATION","An unknown address reached through the locked door.","Why does this room connect the archive thread?"]
 ];
 const details={
  "CAMERA":["OBSERVATION","A camera watches the lane.","The surveillance thread is connected.","The game records the discovery; it does not establish who operated the camera."],
  "BABY SHOE":["OBJECT","A small shoe sits near the curb.","The childhood thread is connected.","The object has meaning only as far as the evidence supports."],
  "WITNESS":["PERSON","The Witness warns against confusing discovery with proof.","The witness/key thread is connected.","Treat the Witness as an observation, not automatic truth."],
  "TELEVISION":["RECORDING","The television has no picture but carries street noise.","The audio thread is connected.","The recording may be evidence, but its origin remains unresolved."],
  "VHS TAPE":["OBJECT / RECORDING","A dated tape has no name.","The archive thread is connected.","The date is a clue, not a conclusion."],
  "SIGNAL TRAIL":["ANOMALY","Distortion is strongest here.","The path/distortion thread is connected.","The player decides whether the pattern means anything beyond the game."],
  "SIGNAL KEY":["GAME OBJECT","The key responds to distortion and opens ROOM 01.","The game-state thread is connected.","Opening a game door does not prove the key's origin."],
  "ROOM 01":["LOCATION","An unknown address reached through the locked door.","The archive thread is connected.","The room links key, television, tape, and unresolved questions."]
 };
 const board=document.getElementById("investigation-board");if(!board)return;board.innerHTML="";
 nodes.forEach(n=>{
   const ok=found(n[1]),el=document.createElement(ok?"button":"article");el.className="investigation-node "+(ok?"found evidence-node-button":"unknown");el.innerHTML="<span>"+(ok?"FOUND":"UNKNOWN")+"</span><strong>"+esc(n[0])+"</strong><small>"+esc(n[2])+"</small>"+(!ok?"<small>LOCKED · DISCOVER IT IN THE WORLD</small>":"");
   if(ok){el.type="button";el.title="Open evidence";el.addEventListener("click",()=>openEvidence(n[0],details[n[0]]))}
   board.appendChild(el);
 });
 const rel=[["CAMERA","TELEVISION","Both are observation/recording devices."],["TELEVISION","VHS TAPE","Both create a media trail."],["VHS TAPE","ROOM 01","The tape is found in Room 01."],["BABY SHOE","WITNESS","Both touch the childhood/memory thread."],["WITNESS","SIGNAL KEY","The Witness points toward the responding object."],["SIGNAL KEY","ROOM 01","The key opens the room."],["SIGNAL TRAIL","CAMERA","Both belong to the lane investigation."]];
 const wrap=document.createElement("div");wrap.className="investigation-links";
 rel.forEach(([a,b,why])=>{const an=nodes.find(n=>n[0]===a),bn=nodes.find(n=>n[0]===b),ok=found(an[1])&&found(bn[1]),btn=document.createElement("button");btn.type="button";btn.className="investigation-link "+(ok?"active":"");btn.disabled=!ok;btn.innerHTML="<span>"+a+"</span><b>↔</b><span>"+b+"</span><small>"+(ok?"EXAMINE CONNECTION":"LOCKED · FIND BOTH")+"</small>";if(ok)btn.onclick=()=>openEvidence(a+" ↔ "+b,["RELATIONSHIP",why,"CONNECTED IN THE GAME · NOT CONFIRMED AS CANONICAL PROOF","Connections are suggestions. The player decides what the evidence means."]);wrap.appendChild(btn)});
 board.appendChild(wrap);
 if(u.length){const un=document.createElement("article");un.className="investigation-node unresolved";un.innerHTML="<span>UNRESOLVED</span><strong>"+esc(u.join(" · ").toUpperCase())+"</strong><small>DO NOT ASSUME · INVESTIGATE</small>";board.appendChild(un)}
 const panel=document.createElement("div");panel.id="investigation-detail";panel.className="investigation-detail";panel.hidden=true;board.appendChild(panel);
 document.getElementById("world-investigation").hidden=false;
}

const PREF_KEY="escie_world_preferences_v1";
function prefs(){try{const v=JSON.parse(localStorage.getItem(PREF_KEY)||"{}");return v&&typeof v==="object"&&!Array.isArray(v)?v:{}}catch(e){return {}}}
function savePrefs(p){return commitStorageBatch({[PREF_KEY]:p})}
function applyPrefs(){const p=prefs();document.body.dataset.worldMotion=p.motion||"full";document.body.dataset.worldGraphics=p.graphics||"standard";document.body.dataset.worldText=p.text||"standard";if(p.controls)commitStorageBatch({"escie_world_control_mode":String(p.controls).toUpperCase()});if(p.display==="handheld"&&typeof setHandheld==="function")setHandheld(true);else if(p.display==="device"&&typeof deviceMode==="function")deviceMode();if(p.orientation==="landscape"&&screen.orientation?.lock)screen.orientation.lock("landscape").catch(()=>{});if(p.orientation==="portrait"&&screen.orientation?.lock)screen.orientation.lock("portrait").catch(()=>{});}
function feedback(kind){const p=prefs();if(p.vibration==="off")return;if(kind==="select"||kind==="discover"){try{navigator.vibrate?.(kind==="discover"?[18,25,28]:10)}catch(e){}}}
const PROFILE_KEY="escie_world_profile_v1";
function getProfile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||"null")}catch(e){return null}}
function ensureProfile(){let p=getProfile();if(!p){p={id:(window.ESCIE_GAME_GATEWAY?.getMemory?.()?.player_id)||("player-"+Math.random().toString(36).slice(2,10)),name:"PLAYER",created_at:new Date().toISOString()};if(!commitStorageBatch({[PROFILE_KEY]:p}))return null;}return p}
function profileMenu(){let el=document.getElementById("world-profile");if(!el){el=document.createElement("section");el.id="world-profile";el.className="world-profile";el.hidden=true;el.innerHTML='<div class="profile-panel" role="dialog" aria-modal="true" aria-label="Player profile"><span class="world-kicker">PLAYER SYSTEM</span><h2>PROFILE</h2><div class="profile-id" data-profile-id></div><div class="profile-form"><label for="world-player-name">DISPLAY NAME</label><input id="world-player-name" maxlength="24" autocomplete="nickname" spellcheck="false" value="PLAYER"></div><div class="profile-actions"><button data-profile-save>SAVE PROFILE</button><button data-profile-close>CLOSE</button></div></div>';document.body.appendChild(el);el.querySelector("[data-profile-close]").onclick=()=>el.hidden=true;el.querySelector("[data-profile-save]").onclick=()=>{const p=ensureProfile();if(!p)return say?.("PROFILE SAVE FAILED.");function syncMainSitePlayerProfile(){const current=getProfile();if(!current)return false;return commitStorageBatch({"escie_active_player_v1":{id:current.id,name:current.name||"PLAYER",source:"THE_WORLD",updated_at:new Date().toISOString()}})}
p.name=(el.querySelector("#world-player-name").value||"PLAYER").trim().slice(0,24)||"PLAYER";p.updated_at=new Date().toISOString();if(!commitStorageBatch({[PROFILE_KEY]:p}))return say?.("PROFILE SAVE FAILED.");if(!syncMainSitePlayerProfile())return say?.("PROFILE LINK SAVE FAILED.");el.hidden=true;say?.("PROFILE SAVED.");saveWorldState?.()}}const p=ensureProfile();el.querySelector("[data-profile-id]").textContent="PLAYER ID · "+p.id;el.querySelector("#world-player-name").value=p.name||"PLAYER";el.hidden=false;el.querySelector("#world-player-name")?.focus()}
document.querySelector("[data-profile]")?.addEventListener("click",profileMenu);
ensureProfile();
const SAVE_KEY="escie_world_save_v1",SAVE_VERSION=2,SAVE_SLOT_COUNT=3,ACTIVE_SLOT_KEY="escie_world_active_slot_v1",SAVE_SLOT_PREFIX="escie_world_save_slot_v1_";
function activeSaveSlot(){try{const n=Number(localStorage.getItem(ACTIVE_SLOT_KEY)||1);return Number.isInteger(n)&&n>=1&&n<=SAVE_SLOT_COUNT?n:1}catch(e){return 1}}
function saveSlotKey(slot=activeSaveSlot()){const n=Number(slot);return SAVE_SLOT_PREFIX+(Number.isInteger(n)&&n>=1&&n<=SAVE_SLOT_COUNT?n:1)}
const PHONE_STORE_KEY="escie_phone_v1";
const SAVE_STORE_KEYS=["escie_world_simulation_v1","escie_world_npc_v1","escie_world_npc_life_v1","escie_world_equipment_v1","escie_world_vehicles_v1","escie_world_law_v1",PHONE_STORE_KEY];
function saveSlotStores(){const stores={};for(const k of SAVE_STORE_KEYS){const raw=localStorage.getItem(k);if(raw===null)throw new Error("MISSING_STORE:"+k);try{stores[k]=JSON.parse(raw)}catch(e){throw new Error("INVALID_STORE_JSON:"+k)}}return stores}
function restoreSaveStores(stores){if(!stores||typeof stores!=="object"||Array.isArray(stores))return false;const payload={};for(const k of SAVE_STORE_KEYS){if(!Object.prototype.hasOwnProperty.call(stores,k))return false;try{payload[k]=JSON.stringify(stores[k])}catch(e){return false}}const previous={};try{for(const k of SAVE_STORE_KEYS)previous[k]=localStorage.getItem(k);for(const k of SAVE_STORE_KEYS)localStorage.setItem(k,payload[k]);for(const k of SAVE_STORE_KEYS)if(localStorage.getItem(k)!==payload[k])throw new Error("RESTORE_VERIFY_FAILED:"+k);return true}catch(e){let rollbackOk=true;try{for(const k of SAVE_STORE_KEYS){if(previous[k]===null)localStorage.removeItem(k);else localStorage.setItem(k,previous[k])}for(const k of SAVE_STORE_KEYS)if(localStorage.getItem(k)!==previous[k])rollbackOk=false}catch(_e){rollbackOk=false}return false}}
function quarantineSave(slot,raw,reason="INVALID_SAVE"){try{const key="escie_world_quarantine_v1_"+Number(slot)+"_"+Date.now();localStorage.setItem(key,JSON.stringify({version:1,slot:Number(slot),reason:String(reason),quarantined_at:new Date().toISOString(),raw:String(raw||"")}));localStorage.removeItem(saveSlotKey(slot));return true}catch(e){return false}}
function validateStoreBundle(stores){if(stores==null)return "";if(typeof stores!=="object"||Array.isArray(stores))return "INVALID_STORES";const checks={PHONE_STORE_KEY:v=>v&&typeof v==="object"&&!Array.isArray(v),"escie_world_simulation_v1":v=>v&&typeof v==="object"&&!Array.isArray(v)&&v.position&&Number.isFinite(Number(v.position.x))&&Number.isFinite(Number(v.position.y)),"escie_world_npc_v1":v=>v&&typeof v==="object"&&!Array.isArray(v)&&v.npcs&&typeof v.npcs==="object"&&!Array.isArray(v.npcs),"escie_world_npc_life_v1":v=>v&&typeof v==="object"&&!Array.isArray(v)&&v.npcs&&typeof v.npcs==="object"&&!Array.isArray(v.npcs),"escie_world_equipment_v1":v=>v&&typeof v==="object"&&!Array.isArray(v)&&Array.isArray(v.owned)&&v.equipped&&typeof v.equipped==="object"&&!Array.isArray(v.equipped),"escie_world_vehicles_v1":v=>v&&typeof v==="object"&&!Array.isArray(v)&&Array.isArray(v.owned),"escie_world_law_v1":v=>v&&typeof v==="object"&&!Array.isArray(v)&&Array.isArray(v.units)};for(const k of Object.keys(stores)){if(checks[k]&&!checks[k](stores[k]))return "INVALID_STORE_"+k.replace(/^escie_world_/,"").replace(/_v1$/,"").toUpperCase()}return ""}
const SIMULATION_DEFAULTS={money:40,stamina:100,neighbourhood:"PARC-EXTENSION",hunger:82,energy:78,health:100,stress:12,social:35,reputation:0,status:"UNKNOWN",path:"UNDEFINED",transport:"FOOT",season:"AUTUMN",weather:"COLD",day:1,hour:12,minute:0,wanted:0,legal_status:"CLEAR",sentence_minutes:0,damage:0,sleep:0,drug_effect:0,alcohol_effect:0,position:{x:start.x,y:start.y},access:[],skills:{fitness:0,skate:0,parkour:0},jobs:[],clubs:[],events:[],relationships:{},inventory:[],property:[],graffiti:[],dreams:[],choice_history:[],npc_memory:{},jobs_history:[],financial_history:[],health_history:[],surveillance:[],transport_history:[],access_history:[]};
function simulationDefaults(seed){const source=seed&&typeof seed==="object"&&!Array.isArray(seed)?seed:{};return Object.assign({},SIMULATION_DEFAULTS,source,{position:Object.assign({},SIMULATION_DEFAULTS.position,source.position||{}),access:Array.isArray(source.access)?source.access.slice():[],skills:Object.assign({},SIMULATION_DEFAULTS.skills,source.skills||{}),jobs:Array.isArray(source.jobs)?source.jobs.slice():[],clubs:Array.isArray(source.clubs)?source.clubs.slice():[],events:Array.isArray(source.events)?source.events.slice():[],relationships:Object.assign({},source.relationships||{}),inventory:Array.isArray(source.inventory)?source.inventory.slice():[],property:Array.isArray(source.property)?source.property.slice():[],graffiti:Array.isArray(source.graffiti)?source.graffiti.slice():[],dreams:Array.isArray(source.dreams)?source.dreams.slice():[],choice_history:Array.isArray(source.choice_history)?source.choice_history.slice():[],npc_memory:Object.assign({},source.npc_memory||{}),jobs_history:Array.isArray(source.jobs_history)?source.jobs_history.slice():[],financial_history:Array.isArray(source.financial_history)?source.financial_history.slice():[],health_history:Array.isArray(source.health_history)?source.health_history.slice():[],surveillance:Array.isArray(source.surveillance)?source.surveillance.slice():[],transport_history:Array.isArray(source.transport_history)?source.transport_history.slice():[],access_history:Array.isArray(source.access_history)?source.access_history.slice():[]})}
const defaultStoreBundle=sim=>({"escie_world_simulation_v1":simulationDefaults(sim),"escie_world_npc_v1":{npcs:{witness:{id:"witness",role:"WITNESS",status:"UNKNOWN",awareness:78,social_context:"LOCAL"}},observations:[],detections:[]},"escie_world_npc_life_v1":{npcs:{},events:[]},"escie_world_equipment_v1":{owned:["FISTS"],equipped:{HAND:"FISTS",BODY:null}},"escie_world_vehicles_v1":{owned:["BIKE","SKATEBOARD","ROLLERBLADES"],current:null,radio:true,condition:{},history:[]},"escie_world_law_v1":{units:[],active:false,level:0,lastDispatch:null,arrests:0,escapes:0},[PHONE_STORE_KEY]:{}});
function normalizeSaveStores(snapshot){const source=snapshot?.stores&&typeof snapshot.stores==="object"&&!Array.isArray(snapshot.stores)?snapshot.stores:{};const sim=simulationDefaults(source["escie_world_simulation_v1"]||snapshot?.simulation_state);const base=defaultStoreBundle(sim);const stores=Object.assign(base,source);stores["escie_world_simulation_v1"]=simulationDefaults(stores["escie_world_simulation_v1"]);return stores}
function captureRuntimeStores(){ensurePhoneStore();const stores={};for(const k of SAVE_STORE_KEYS){const raw=localStorage.getItem(k);if(raw===null)throw new Error("MISSING_RUNTIME_STORE:"+k);try{stores[k]=JSON.parse(raw)}catch(e){throw new Error("INVALID_RUNTIME_STORE:"+k)}}const invalid=validateStoreBundle(stores);if(invalid)throw new Error(invalid);stores["escie_world_simulation_v1"]=simulationDefaults(stores["escie_world_simulation_v1"]);return stores}
function validateSaveSnapshot(snapshot,slot){if(!snapshot||typeof snapshot!=="object"||Array.isArray(snapshot))return "NOT_OBJECT";if(snapshot.version!==1&&snapshot.version!==SAVE_VERSION)return "UNSUPPORTED_VERSION";if(snapshot.slot!=null&&Number(snapshot.slot)!==Number(slot))return "SLOT_MISMATCH";const w=snapshot.world_state;if(!w||typeof w!=="object"||Array.isArray(w))return "INVALID_WORLD_STATE";if(w.world_position&&(!Number.isFinite(Number(w.world_position.x))||!Number.isFinite(Number(w.world_position.y))))return "INVALID_POSITION";const storeError=validateStoreBundle(snapshot.stores);if(storeError)return storeError;const sim=snapshot.stores?.["escie_world_simulation_v1"]||snapshot.simulation_state;if(sim&&w.world_position&&sim.position){if(Math.abs(Number(sim.position.x)-Number(w.world_position.x))>1||Math.abs(Number(sim.position.y)-Number(w.world_position.y))>1)return "STATE_POSITION_DIVERGENCE"}if(snapshot.input_mode!=null&&!["AUTO","KEYBOARD","TOUCH","GAMEPAD"].includes(String(snapshot.input_mode).toUpperCase()))return "INVALID_INPUT_MODE";return ""} 
function clearRuntimeStores(){const keys=[KEY,...SAVE_STORE_KEYS];try{keys.forEach(k=>localStorage.removeItem(k));if(keys.some(k=>localStorage.getItem(k)!==null))throw new Error("CLEAR_RUNTIME_VERIFY_FAILED");return true}catch(e){return false}}
function migrateLegacySave(){try{if(localStorage.getItem(saveSlotKey()))return;const raw=localStorage.getItem(SAVE_KEY);if(!raw)return;let parsed;try{parsed=JSON.parse(raw)}catch(e){return}const legacy=parsed&&typeof parsed==="object"&&!Array.isArray(parsed)&&parsed.world_state?parsed:{version:1,slot:1,world_state:parsed};const staged=Object.assign({},legacy,{version:legacy.version||1,slot:1,stores:normalizeSaveStores(legacy)});staged.stores[PHONE_STORE_KEY]=readStorageJSON(PHONE_STORE_KEY,{});if(validateSaveSnapshot(staged,1))return;const payload={};payload[saveSlotKey(1)]=staged;payload[ACTIVE_SLOT_KEY]="1";if(!commitStorageBatch(payload))return;saveIndicator("LEGACY SAVE · MIGRATED TO SLOT 1")}catch(e){}}
function readStorageJSON(key,fallback={}){try{const raw=localStorage.getItem(key);if(raw===null)return fallback;const value=JSON.parse(raw);return value&&typeof value==="object"&&!Array.isArray(value)?value:fallback}catch(e){return fallback}}
function commitStorageBatch(updates){const entries=Object.entries(updates||{});if(!entries.length)return true;const previous={};try{for(const [k] of entries)previous[k]=localStorage.getItem(k);const serialized=entries.map(([k,v])=>[k,JSON.stringify(v)]);for(const [k,raw] of serialized)localStorage.setItem(k,raw);for(const [k,raw] of serialized)if(localStorage.getItem(k)!==raw)throw new Error("STORAGE_VERIFY_FAILED:"+k);return true}catch(e){let rollbackOk=true;try{for(const [k] of entries){if(previous[k]===null)localStorage.removeItem(k);else localStorage.setItem(k,previous[k])}for(const [k] of entries)if(localStorage.getItem(k)!==previous[k])rollbackOk=false}catch(_e){rollbackOk=false}return false}}
function writePhoneState(value){return commitStorageBatch({[PHONE_STORE_KEY]:value})}
function ensurePhoneStore(){const raw=localStorage.getItem(PHONE_STORE_KEY);if(raw!==null)return true;return commitStorageBatch({[PHONE_STORE_KEY]:{}})}
function saveIndicator(msg="GAME SAVED"){let el=document.getElementById("world-save-indicator");if(!el){el=document.createElement("div");el.id="world-save-indicator";el.className="world-save-indicator";document.body.appendChild(el)}el.textContent=msg;el.classList.add("visible");clearTimeout(window.__saveTimer);window.__saveTimer=setTimeout(()=>el.classList.remove("visible"),1400)}
function saveWorldState(){let previousSlotRaw=null,previousKeyRaw=null,previousActiveRaw=null,slot=null;try{
  migrateLegacySave();
  slot=activeSaveSlot();
  previousSlotRaw=localStorage.getItem(saveSlotKey(slot));
  previousKeyRaw=localStorage.getItem(KEY);
  previousActiveRaw=localStorage.getItem(ACTIVE_SLOT_KEY);
  const current=state();
  current.world_room=room;
  current.world_position={x:Number(pos.x)||0,y:Number(pos.y)||0};
  current.input_mode=controlScheme();
  const sim=window.ESCIE_WORLD_SIMULATION?.state?.();
  const stores=saveSlotStores();
  const snapshot={version:SAVE_VERSION,saved_at:new Date().toISOString(),slot,world_state:current,simulation_state:sim&&typeof sim==="object"?sim:null,input_mode:controlScheme(),stores};
  const invalid=validateSaveSnapshot(snapshot,slot);if(invalid)throw new Error(invalid);
  const serialized=JSON.stringify(snapshot);
  const worldSerialized=JSON.stringify(current);
  localStorage.setItem(KEY,worldSerialized);
  if(localStorage.getItem(KEY)!==worldSerialized)throw new Error("SAVE_WORLD_STATE_VERIFY_FAILED");
  localStorage.setItem(saveSlotKey(slot),serialized);
  if(localStorage.getItem(saveSlotKey(slot))!==serialized)throw new Error("SAVE_SLOT_VERIFY_FAILED");
  const activeSerialized=String(slot);
  localStorage.setItem(ACTIVE_SLOT_KEY,activeSerialized);
  if(localStorage.getItem(ACTIVE_SLOT_KEY)!==activeSerialized)throw new Error("SAVE_ACTIVE_SLOT_VERIFY_FAILED");
  saveIndicator("SLOT "+slot+" SAVED");
  return true;
}catch(e){let rollbackOk=true;try{if(slot!==null){if(previousSlotRaw===null)localStorage.removeItem(saveSlotKey(slot));else localStorage.setItem(saveSlotKey(slot),previousSlotRaw);if(localStorage.getItem(saveSlotKey(slot))!==previousSlotRaw)rollbackOk=false}if(previousKeyRaw===null)localStorage.removeItem(KEY);else localStorage.setItem(KEY,previousKeyRaw);if(localStorage.getItem(KEY)!==previousKeyRaw)rollbackOk=false;if(previousActiveRaw===null)localStorage.removeItem(ACTIVE_SLOT_KEY);else localStorage.setItem(ACTIVE_SLOT_KEY,previousActiveRaw);if(localStorage.getItem(ACTIVE_SLOT_KEY)!==previousActiveRaw)rollbackOk=false}catch(_e){rollbackOk=false}saveIndicator("SAVE FAILED · "+(rollbackOk?String(e?.message||"STORAGE"):"ROLLBACK FAILED"));return false}}
function createFreshSnapshot(slot){const n=Number(slot);const simulation=defaultStoreBundle(null)["escie_world_simulation_v1"];simulation.position={x:start.x,y:start.y};return {version:SAVE_VERSION,saved_at:new Date().toISOString(),slot:n,world_state:{version:1,session_id:"local-world",player_id:window.ESCIE_GAME_PROFILE?.id||null,episode_id:"the-world",world_room:"lane",world_position:{x:start.x,y:start.y},inventory:[],discoveries:[],world_unlocks:[],signals:0,entered:false,entry_source:"new-game",unresolved:[],unknown:[],completed_quests:[],input_mode:"AUTO",created_at:new Date().toISOString()},simulation_state:simulation,input_mode:"AUTO",stores:defaultStoreBundle(simulation)}}
function initializeEmptySave(slot=activeSaveSlot()){let previousSlotRaw=null,previousKeyRaw=null,previousActiveRaw=null,backup=null,wasActive=false;try{
  const n=Number(slot);if(!Number.isInteger(n)||n<1||n>SAVE_SLOT_COUNT)return false;
  const fresh=createFreshSnapshot(n);
  const invalid=validateSaveSnapshot(fresh,n);if(invalid)return false;
  wasActive=n===activeSaveSlot();
  previousSlotRaw=localStorage.getItem(saveSlotKey(n));
  previousKeyRaw=localStorage.getItem(KEY);
  if(wasActive)backup=captureRuntimeStores();
  previousActiveRaw=localStorage.getItem(ACTIVE_SLOT_KEY);
  const freshSerialized=JSON.stringify(fresh);
  localStorage.setItem(saveSlotKey(n),freshSerialized);
  if(localStorage.getItem(saveSlotKey(n))!==freshSerialized)throw new Error("FRESH_SLOT_WRITE_FAILED");
  if(wasActive){
    if(!clearRuntimeStores())throw new Error("FRESH_CLEAR_FAILED");
    const freshWorldSerialized=JSON.stringify(fresh.world_state);
    localStorage.setItem(KEY,freshWorldSerialized);
    if(localStorage.getItem(KEY)!==freshWorldSerialized)throw new Error("FRESH_WORLD_WRITE_FAILED");
    if(!restoreSaveStores(fresh.stores))throw new Error("FRESH_STORE_RESTORE_FAILED");
    const freshActiveSerialized=String(n);
    localStorage.setItem(ACTIVE_SLOT_KEY,freshActiveSerialized);
    if(localStorage.getItem(ACTIVE_SLOT_KEY)!==freshActiveSerialized)throw new Error("FRESH_ACTIVE_WRITE_FAILED");
    if(!saveWorldState())throw new Error("FRESH_SAVE_FAILED");
  }
  saveIndicator("SLOT "+n+" · NEW GAME");
  return true;
}catch(e){
  try{
    if(previousSlotRaw===null)localStorage.removeItem(saveSlotKey(Number(slot)));else localStorage.setItem(saveSlotKey(Number(slot)),previousSlotRaw);
    if(localStorage.getItem(saveSlotKey(Number(slot)))!==previousSlotRaw)throw new Error("NEW_GAME_SLOT_ROLLBACK_FAILED");
    if(wasActive){
      if(previousKeyRaw===null)localStorage.removeItem(KEY);else localStorage.setItem(KEY,previousKeyRaw);
      if(previousActiveRaw===null)localStorage.removeItem(ACTIVE_SLOT_KEY);else localStorage.setItem(ACTIVE_SLOT_KEY,previousActiveRaw);
      if(localStorage.getItem(ACTIVE_SLOT_KEY)!==previousActiveRaw)throw new Error("NEW_GAME_ACTIVE_ROLLBACK_FAILED");
      if(backup&&!restoreSaveStores(backup))throw new Error("NEW_GAME_STORE_ROLLBACK_FAILED");
    }
  }catch(_e){}
  saveIndicator("SLOT "+Number(slot)+" · NEW GAME FAILED");
  return false;
}}
function deleteSaveSlot(slot){let removed=false,previous=null,quarantineKeys=[];try{
  const n=Number(slot);if(!Number.isInteger(n)||n<1||n>SAVE_SLOT_COUNT)return false;
  if(n===activeSaveSlot()){resetLocalGame();return true}
  const key=saveSlotKey(n);previous=localStorage.getItem(key);
  for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&k.startsWith("escie_world_quarantine_v1_"+n+"_"))quarantineKeys.push([k,localStorage.getItem(k)])}
  localStorage.removeItem(key);removed=true;
  if(localStorage.getItem(key)!==null)throw new Error("DELETE_SLOT_FAILED");
  for(const [k] of quarantineKeys)localStorage.removeItem(k);
  for(const [k] of quarantineKeys)if(localStorage.getItem(k)!==null)throw new Error("DELETE_QUARANTINE_FAILED");
  saveIndicator("SLOT "+n+" · DELETED");return true;
}catch(e){
  try{
    if(removed&&Number.isInteger(Number(slot))){
      const n=Number(slot),key=saveSlotKey(n);
      if(localStorage.getItem(key)===null&&typeof previous!=="undefined"&&previous!==null)localStorage.setItem(key,previous);
      if(previous!==null&&localStorage.getItem(key)!==previous)throw new Error("DELETE_SLOT_ROLLBACK_FAILED");
      for(const [k,v] of quarantineKeys)if(v!==null&&localStorage.getItem(k)===null)localStorage.setItem(k,v);
      for(const [k,v] of quarantineKeys)if(v!==null&&localStorage.getItem(k)!==v)throw new Error("DELETE_QUARANTINE_ROLLBACK_FAILED");
    }
  }catch(_e){}
  saveIndicator("SLOT "+Number(slot)+" · DELETE FAILED");return false;
}}
function saveSlotStatus(slot){try{const n=Number(slot);if(!Number.isInteger(n)||n<1||n>SAVE_SLOT_COUNT)return "INVALID";const raw=localStorage.getItem(saveSlotKey(n));if(!raw)return "EMPTY";let p;try{p=JSON.parse(raw)}catch(e){return "CORRUPT"}const staged=p&&typeof p==="object"&&!Array.isArray(p)&&p.world_state?Object.assign({},p,{stores:normalizeSaveStores(p)}):{version:1,slot:n,world_state:p,stores:normalizeSaveStores({world_state:p})};const invalid=validateSaveSnapshot(staged,n);if(invalid)return "CORRUPT";const w=staged.world_state||{};const legacy=p?.stores==null;return (legacy?"SAVED · LEGACY":"SAVED")+" · "+String(w.world_room||"LANE").toUpperCase()+" · "+Number(w.signals||0)+" SIGNAL"}catch(e){return "CORRUPT"}}
function loadWorldSave(slot=activeSaveSlot()){let backup=null,previousKeyRaw=null,previousActiveRaw=null,previousSlotRaw=null;try{
  migrateLegacySave();
  const n=Number(slot);if(!Number.isInteger(n)||n<1||n>SAVE_SLOT_COUNT)return false;
  const raw=localStorage.getItem(saveSlotKey(n));
  if(!raw)return initializeEmptySave(n);
  let parsed;try{parsed=JSON.parse(raw)}catch(e){quarantineSave(n,raw,"JSON_PARSE_FAILED");saveIndicator("SLOT "+n+" QUARANTINED");return false}
  const snapshot=parsed&&typeof parsed==="object"&&!Array.isArray(parsed)&&parsed.world_state?parsed:{version:1,slot:n,world_state:parsed};
  const stores=normalizeSaveStores(snapshot);
  const staged=Object.assign({},snapshot,{stores});
  const invalid=validateSaveSnapshot(staged,n);if(invalid){quarantineSave(n,raw,invalid);saveIndicator("SLOT "+n+" QUARANTINED");return false}
  backup=captureRuntimeStores();
  previousKeyRaw=localStorage.getItem(KEY);
  previousActiveRaw=localStorage.getItem(ACTIVE_SLOT_KEY);
  previousSlotRaw=localStorage.getItem(saveSlotKey(n));
  if(!clearRuntimeStores())throw new Error("CLEAR_RUNTIME_FAILED");
  localStorage.setItem(KEY,JSON.stringify(staged.world_state));
  if(localStorage.getItem(KEY)!==JSON.stringify(staged.world_state))throw new Error("WORLD_STATE_VERIFY_FAILED");
  if(!restoreSaveStores(stores))throw new Error("RESTORE_FAILED");
  if(["AUTO","KEYBOARD","TOUCH","GAMEPAD"].includes(String(staged.input_mode||staged.world_state.input_mode||"").toUpperCase()))setControlScheme(String(staged.input_mode||staged.world_state.input_mode).toUpperCase());
  localStorage.setItem(ACTIVE_SLOT_KEY,String(n));
  if(localStorage.getItem(ACTIVE_SLOT_KEY)!==String(n))throw new Error("ACTIVE_SLOT_VERIFY_FAILED");
  if(snapshot.stores==null){const migrated=JSON.stringify(Object.assign({},staged,{saved_at:new Date().toISOString()}));localStorage.setItem(saveSlotKey(n),migrated);if(localStorage.getItem(saveSlotKey(n))!==migrated)throw new Error("MIGRATION_SAVE_VERIFY_FAILED");}
  return true;
}catch(e){
  let rollbackOk=true;
  try{
    if(!clearRuntimeStores())rollbackOk=false;
    if(backup&&!restoreSaveStores(backup))rollbackOk=false;
    if(previousKeyRaw===null)localStorage.removeItem(KEY);else localStorage.setItem(KEY,previousKeyRaw);
    if(localStorage.getItem(KEY)!==previousKeyRaw)rollbackOk=false;
    if(previousActiveRaw===null)localStorage.removeItem(ACTIVE_SLOT_KEY);else localStorage.setItem(ACTIVE_SLOT_KEY,previousActiveRaw);
    if(localStorage.getItem(ACTIVE_SLOT_KEY)!==previousActiveRaw)rollbackOk=false;
    if(previousSlotRaw!==null)localStorage.setItem(saveSlotKey(Number(slot)),previousSlotRaw);
    if(previousSlotRaw!==null&&localStorage.getItem(saveSlotKey(Number(slot)))!==previousSlotRaw)rollbackOk=false;
  }catch(_e){rollbackOk=false}
  saveIndicator(rollbackOk?"LOAD FAILED · RESTORED":"LOAD FAILED · ROLLBACK FAILED");
  return false}}
let worldStorageBusy=false;
function withWorldStorageLock(fn){if(worldStorageBusy){saveIndicator("STORAGE BUSY · PLEASE WAIT");return false}worldStorageBusy=true;try{return fn()}finally{worldStorageBusy=false}}
function switchSaveSlot(slot){const n=Number(slot);if(!Number.isInteger(n)||n<1||n>SAVE_SLOT_COUNT)return false;if(n===activeSaveSlot())return true;try{if(!saveWorldState()){saveIndicator("SLOT SWITCH BLOCKED · SAVE FAILED");return false}if(!loadWorldSave(n)){saveIndicator("SLOT SWITCH BLOCKED · LOAD FAILED");return false}location.reload();return true}catch(e){saveIndicator("SLOT SWITCH BLOCKED");return false}}
const RESET_FLAG="escie_world_reset_pending_v1";
function resetLocalGame(){
  const removed=[];
  try{
    localStorage.setItem(RESET_FLAG,"1");
    const active=activeSaveSlot();
    const keys=[KEY,SAVE_KEY,saveSlotKey(active),...SAVE_STORE_KEYS];
    for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&k.startsWith("escie_world_quarantine_v1_"+active+"_"))keys.push(k)}
    keys.forEach(k=>{localStorage.removeItem(k);removed.push(k)});
    if(keys.some(k=>localStorage.getItem(k)!==null))throw new Error("RESET_INCOMPLETE");
    sessionStorage.removeItem("escie_handheld_mode");
    sessionStorage.removeItem("escie_device_mode");
    location.reload();
  }catch(e){
    try{localStorage.removeItem(RESET_FLAG)}catch(_e){}
    saveIndicator("RESET FAILED · NOTHING RELOADED");
    return false;
  }
  return true;
}
function resetPending(){try{return localStorage.getItem(RESET_FLAG)==="1"}catch(e){return false}}
function clearResetFlag(){try{localStorage.removeItem(RESET_FLAG)}catch(e){}}
document.addEventListener("visibilitychange",()=>{if(document.hidden&&!resetPending())saveWorldState()});
window.addEventListener("pagehide",()=>{if(!resetPending())saveWorldState()});
document.querySelector("[data-save]")?.addEventListener("click",()=>withWorldStorageLock(()=>saveWorldState()));
const WORLD_BOOT_DEPENDENCIES=[
  ["GAME_REGISTRY","ESCIE_GAME_REGISTRY",true],
  ["SIMULATION","ESCIE_WORLD_SIMULATION",true],
  ["CITY","ESCIE_CITY_REFERENCE",false],
  ["NPC","ESCIE_WORLD_NPC",true],
  ["NPC_LIFE","ESCIE_WORLD_NPC_LIFE",false],
  ["EQUIPMENT","ESCIE_WORLD_EQUIPMENT",false],
  ["VEHICLES","ESCIE_WORLD_VEHICLES",false],
  ["LAW","ESCIE_WORLD_LAW",false],
  ["LANGUAGE","ESCIE_WORLD_LANGUAGE",false],
  ["DIALOGUE","ESCIE_WORLD_DIALOGUE",false],
  ["INTERIOR","ESCIE_WORLD_INTERIOR",false]
];
function worldBootAudit(){
  const missing=WORLD_BOOT_DEPENDENCIES.filter(d=>d[2]&&!window[d[1]]).map(d=>d[0]);
  const optionalMissing=WORLD_BOOT_DEPENDENCIES.filter(d=>!d[2]&&!window[d[1]]).map(d=>d[0]);
  const status={ready:missing.length===0,missing,optionalMissing,timestamp:new Date().toISOString()};
  window.ESCIE_WORLD_BOOT=status;
  if(missing.length)saveIndicator("BOOT BLOCKED · "+missing.join(", "));
  else if(optionalMissing.length)say("WORLD READY · OPTIONAL SYSTEMS PENDING: "+optionalMissing.join(", "));
  return status;
}
const bootStatus=worldBootAudit();
if(!bootStatus.ready)throw new Error("ESCIE WORLD BOOT DEPENDENCY FAILURE: "+bootStatus.missing.join(", "));
migrateLegacySave();
const bootSlot=activeSaveSlot();
const bootSaveOk=loadWorldSave(bootSlot);
window.ESCIE_WORLD_BOOT=Object.assign({},window.ESCIE_WORLD_BOOT||{},{
  save_ready:!!bootSaveOk,
  save_slot:bootSlot,
  save_status:saveSlotStatus(bootSlot)
});
if(!bootSaveOk){
  saveIndicator("BOOT SAVE FAILED · SLOT "+bootSlot);
  throw new Error("ESCIE WORLD BOOT SAVE FAILURE · SLOT "+bootSlot+" · "+String(window.ESCIE_WORLD_BOOT.save_status));
}
(function restoreWorldRuntime(){
  const s=state();
  const allowed=["lane","room01","room02","trace"];
  room=allowed.includes(String(s.world_room))?String(s.world_room):"lane";
  const p=s.world_position&&typeof s.world_position==="object"?s.world_position:null;
  if(p&&Number.isFinite(Number(p.x))&&Number.isFinite(Number(p.y))){
    pos={x:Number(p.x),y:Number(p.y)};
  }else{
    pos={...start};
  }
  if(room==="lane"){
    pos={x:Math.max(0,Math.min(W-1,pos.x)),y:Math.max(0,Math.min(H-1,pos.y))};
  }else{
    pos={x:Math.max(0,Math.min(7,pos.x)),y:Math.max(0,Math.min(7,pos.y))};
  }
  roomSetup();
  syncSimulationPosition();
  drawMap();
  render();
})();
clearResetFlag();

const ENTRY_SEEN_KEY="escie_world_entry_seen_v1";
function worldEntryGate(){
  if(document.getElementById("world-entry-gate"))return;
  const slot=activeSaveSlot(), status=saveSlotStatus(slot), currentState=state(), freshStart=currentState&&currentState.entry_source==="new-game"&&!currentState.entered, hasSave=status.startsWith("SAVED")&&!freshStart;
  const el=document.createElement("section");
  el.id="world-entry-gate";
  el.className="world-entry-gate";
  el.innerHTML='<div class="entry-panel" role="dialog" aria-modal="true" aria-label="Enter The World"><span class="world-kicker">ESCIE / THE WORLD</span><h2>ENTER THE WORLD</h2><p>You are entering another layer of the same reality.</p><p class="entry-status">SLOT '+slot+' · '+esc(status)+'</p><div class="entry-actions">'+
    (hasSave?'<button type="button" data-entry-continue>CONTINUE</button>':'<button type="button" data-entry-new>NEW GAME</button>')+
    '<button type="button" data-entry-slots>SAVE / LOAD</button><button type="button" data-entry-exit>RETURN TO ESCIE</button></div></div>';
  document.body.appendChild(el);
  const close=()=>{el.hidden=true;try{sessionStorage.setItem(ENTRY_SEEN_KEY,"1")}catch(e){};stage?.focus?.()};
  el.querySelector("[data-entry-continue]")?.addEventListener("click",()=>{close();say("RESUMED · SLOT "+slot);render()});
  el.querySelector("[data-entry-new]")?.addEventListener("click",()=>withWorldStorageLock(()=>{const ok=initializeEmptySave(slot);if(!ok)return false;safelyMarkEntrySeen();location.reload();return true}));
  el.querySelector("[data-entry-slots]")?.addEventListener("click",()=>{close();systemMenu();document.getElementById("world-system")?.removeAttribute("hidden")});
  el.querySelector("[data-entry-exit]")?.addEventListener("click",()=>{location.href="../"});
  el.hidden=false;
}
function safelyMarkEntrySeen(){try{sessionStorage.setItem(ENTRY_SEEN_KEY,"1")}catch(e){}}
try{if(sessionStorage.getItem(ENTRY_SEEN_KEY)!=="1")worldEntryGate()}catch(e){worldEntryGate()}
function systemMenu(){let el=document.getElementById("world-system");
if(!el){el=document.createElement("section");el.id="world-system";el.className="world-system";el.hidden=true;
el.innerHTML='<div class="system-panel" role="dialog" aria-modal="true" aria-label="World system"><div class="system-head"><div><span class="world-kicker">ESCIE / THE WORLD</span><h2>SYSTEM</h2></div><button class="system-close" data-system-close>CLOSE</button></div><div class="system-grid"><div class="system-card"><strong>STATE</strong><span>LOCAL PLAYER STATE ACTIVE</span></div><div class="system-card"><strong>CANON</strong><span>GAME CANNOT WRITE CANONICAL TRUTH</span></div><div class="system-card"><strong>INPUT</strong><span data-system-input>DETECTING…</span></div><div class="system-card"><strong>DISPLAY</strong><span data-system-display>DETECTING…</span></div><div class="system-card"><strong>SAVE SLOT</strong><span data-system-slot>SLOT 1</span></div><div class="system-card"><strong>SIGNAL</strong><span data-system-signal>0</span></div><div class="system-card"><strong>DISCOVERIES</strong><span data-system-discoveries>0</span></div></div><div class="system-save-manager"><h3>SAVE / LOAD</h3><div class="save-slot-list" data-save-slot-list></div></div><div class="system-actions"><button data-system-prefs>PREFERENCES</button><button data-system-pause>PAUSE MENU</button><button data-system-reset>RESET ACTIVE SLOT</button></div></div>';
document.body.appendChild(el);el.querySelector("[data-system-close]").onclick=()=>el.hidden=true;el.querySelector("[data-system-prefs]").onclick=()=>{el.hidden=true;preferences()};el.querySelector("[data-system-pause]").onclick=()=>{el.hidden=true;pauseMenu()};el.querySelector("[data-system-reset]").onclick=()=>{if(confirm("Reset the ACTIVE save slot? This clears gameplay, simulation, NPC, equipment, vehicle and law state for SLOT "+activeSaveSlot()+". Other save slots, profile and preferences remain.")){withWorldStorageLock(()=>resetLocalGame())}}}
const refreshSaveManager=()=>{const list=el.querySelector("[data-save-slot-list]");if(!list)return;list.innerHTML=[1,2,3].map(function(n){const status=saveSlotStatus(n),active=n===activeSaveSlot();return '<article class="save-slot-card '+(active?"active ":"")+status.toLowerCase().replace(/[^a-z]+/g,"-")+'"><strong>SLOT '+n+(active?" · ACTIVE":"")+'</strong><span>'+esc(status)+'</span><div><button type="button" data-slot-load="'+n+'">LOAD</button><button type="button" data-slot-new="'+n+'">NEW</button><button type="button" data-slot-delete="'+n+'">DELETE</button></div></article>'}).join("");
list.querySelectorAll("[data-slot-load]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.slotLoad);if(worldStorageBusy){saveIndicator("STORAGE BUSY · PLEASE WAIT");return}if(n===activeSaveSlot()){say("SLOT "+n+" · ACTIVE");return}withWorldStorageLock(()=>{if(saveSlotStatus(n)==="EMPTY"){if(!initializeEmptySave(n)){say("SLOT "+n+" · NEW GAME FAILED");return false}localStorage.setItem(ACTIVE_SLOT_KEY,String(n));if(localStorage.getItem(ACTIVE_SLOT_KEY)!==String(n)){say("SLOT "+n+" · SWITCH FAILED");return false}location.reload();return true}if(confirm("Load SAVE SLOT "+n+"? Current progress will be saved to SLOT "+activeSaveSlot()+".")){return switchSaveSlot(n)}return false})});
list.querySelectorAll("[data-slot-new]").forEach(b=>b.onclick=()=>{if(worldStorageBusy){saveIndicator("STORAGE BUSY · PLEASE WAIT");return}withWorldStorageLock(()=>{const n=Number(b.dataset.slotNew);if(saveSlotStatus(n)!=="EMPTY"&&!confirm("Replace SAVE SLOT "+n+" with a NEW GAME? Existing progress will be deleted."))return false;if(n===activeSaveSlot())return resetLocalGame();const ok=initializeEmptySave(n);say(ok?"SLOT "+n+" · NEW GAME READY":"SLOT "+n+" · NEW GAME FAILED");refreshSaveManager();return ok})});
list.querySelectorAll("[data-slot-delete]").forEach(b=>b.onclick=()=>{if(worldStorageBusy){saveIndicator("STORAGE BUSY · PLEASE WAIT");return}withWorldStorageLock(()=>{const n=Number(b.dataset.slotDelete);if(saveSlotStatus(n)==="EMPTY"){say("SLOT "+n+" · EMPTY");return false}if(confirm("Delete SAVE SLOT "+n+"? This cannot be undone.")){const ok=deleteSaveSlot(n);if(n!==activeSaveSlot())refreshSaveManager();return ok}return false})})};
const s=readStorageJSON(KEY,{});el.querySelector("[data-system-input]").textContent=(prefs().controls||controlScheme()||"AUTO").toUpperCase();el.querySelector("[data-system-display]").textContent=(prefs().display||"DEVICE").toUpperCase();el.querySelector("[data-system-slot]").textContent="SLOT "+activeSaveSlot();el.querySelector("[data-system-signal]").textContent=String(s.signals||0);el.querySelector("[data-system-discoveries]").textContent=String((s.discoveries||[]).length);refreshSaveManager();el.hidden=false;el.querySelector("[data-system-close]")?.focus()}

document.querySelector("[data-system]")?.addEventListener("click",systemMenu);
function pauseMenu(){let el=document.getElementById("world-pause");if(!el){el=document.createElement("section");el.id="world-pause";el.className="world-pause";el.hidden=true;el.innerHTML='<div class="pause-panel" role="dialog" aria-modal="true" aria-label="Pause menu"><span class="world-kicker">ESCIE / THE WORLD</span><h2>PAUSED</h2><div class="pause-status">GAME STATE IS LOCAL · CANON REMAINS UNCHANGED</div><div class="pause-actions"><button data-resume>RESUME</button><button data-open-prefs>SETTINGS</button><button data-open-inventory>INVENTORY</button><button data-open-glass>GLASS EYE</button><button data-exit-world>EXIT TO ESCIE</button></div></div>';document.body.appendChild(el);el.querySelector("[data-resume]").onclick=()=>el.hidden=true;el.querySelector("[data-open-prefs]").onclick=()=>{el.hidden=true;preferences()};el.querySelector("[data-open-inventory]").onclick=()=>{el.hidden=true;inventory?.()};el.querySelector("[data-open-glass]").onclick=()=>{el.hidden=true;glass?.()};el.querySelector("[data-exit-world]").onclick=()=>location.href="../"}el.hidden=false;el.querySelector("[data-resume]")?.focus()}
document.querySelector("[data-pause]")?.addEventListener("click",pauseMenu);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!document.getElementById("world-preferences")?.hidden){return}if(e.key==="Escape"&&!document.getElementById("world-pause")?.hidden){return}if(e.key==="Escape")pauseMenu()});
function preferences(){let p=prefs();const panel=document.getElementById("world-preferences");if(!panel){const el=document.createElement("section");el.id="world-preferences";el.className="world-preferences";el.hidden=true;el.innerHTML='<div class="preferences-panel" role="dialog" aria-modal="true" aria-label="World preferences"><div class="preferences-head"><div><span class="world-kicker">SYSTEM</span><h2>PREFERENCES</h2></div><button class="preferences-close" data-close-preferences>CLOSE</button></div><div class="preference-group"><h3>DISPLAY</h3><div class="preference-row"><label>DISPLAY MODE<small>Choose the default presentation.</small></label><select data-pref="display"><option value="device">DEVICE</option><option value="handheld">HANDHELD</option><option value="standard">STANDARD</option></select></div><div class="preference-row"><label>ORIENTATION<small>Landscape is recommended for the game screen.</small></label><select data-pref="orientation"><option value="auto">AUTO</option><option value="landscape">LANDSCAPE</option><option value="portrait">PORTRAIT</option></select></div><div class="preference-row"><label>GRAPHICS<small>Lower effects can improve weaker devices.</small></label><select data-pref="graphics"><option value="standard">STANDARD</option><option value="low">LOW</option><option value="high">HIGH</option></select></div></div><div class="preference-group"><h3>CONTROLS</h3><div class="preference-row"><label>CONTROL STYLE<small>Touch, keyboard, gamepad, or automatic.</small></label><select data-pref="controls"><option value="auto">AUTO</option><option value="touch">TOUCH</option><option value="keyboard">KEYBOARD</option><option value="gamepad">GAMEPAD</option></select></div><div class="preference-row"><label>VIBRATION<small>Use controller/device vibration when supported.</small></label><select data-pref="vibration"><option value="on">ON</option><option value="off">OFF</option></select></div></div><div class="preference-group"><h3>ACCESSIBILITY</h3><div class="preference-row"><label>MOTION<small>Reduce non-essential movement.</small></label><select data-pref="motion"><option value="full">FULL</option><option value="reduced">REDUCED</option></select></div><div class="preference-row"><label>TEXT SIZE<small>Adjust interface readability.</small></label><select data-pref="text"><option value="standard">STANDARD</option><option value="large">LARGE</option></select></div></div><div class="preference-actions"><button data-save-preferences>SAVE PREFERENCES</button><button data-reset-preferences>RESET DEFAULTS</button></div></div>';document.body.appendChild(el)}const box=document.getElementById("world-preferences");box.hidden=false;box.querySelectorAll("[data-pref]").forEach(x=>x.value=p[x.dataset.pref]||x.options[0].value);box.querySelector("[data-close-preferences]").onclick=()=>box.hidden=true;box.querySelector("[data-save-preferences]").onclick=()=>{box.querySelectorAll("[data-pref]").forEach(x=>p[x.dataset.pref]=x.value);if(!savePrefs(p))return say("PREFERENCES SAVE FAILED.");applyPrefs();box.hidden=true;say("PREFERENCES SAVED.");};box.querySelector("[data-reset-preferences]").onclick=()=>{if(!commitStorageBatch({[PREF_KEY]:{}}))return say("PREFERENCES RESET FAILED.");p={};preferences();say("PREFERENCES RESET.")}}
document.querySelector("[data-preferences]")?.addEventListener("click",preferences);
applyPrefs();
function deviceMode(){const d=document.getElementById("world-device");const game=document.querySelector(".world-game");if(!d||!game)return;const on=d.classList.toggle("device-immersive");game.classList.toggle("handheld-mode",on);try{sessionStorage.setItem("escie_device_mode",on?"1":"0")}catch(e){}if(on)requestFullscreen();render()}
document.querySelector("[data-device]")?.addEventListener("click",deviceMode);
function setHandheld(on){const game=document.querySelector(".world-game");if(!game)return;game.classList.toggle("handheld-mode",on);try{sessionStorage.setItem("escie_handheld_mode",on?"1":"0")}catch(e){}if(on)requestFullscreen();render()}
async function requestFullscreen(){const el=document.documentElement;try{if(!document.fullscreenElement&&el.requestFullscreen)await el.requestFullscreen({navigationUI:"hide"});if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock("landscape").catch(()=>{});}catch(e){}}
function toggleFullscreen(){if(document.fullscreenElement){document.exitFullscreen?.();}else requestFullscreen();}
function rotateGame(){requestFullscreen();say("ROTATION REQUESTED · TURN DEVICE SIDEWAYS FOR THE FULL GAME VIEW.");}
document.querySelector("[data-fullscreen]")?.addEventListener("click",toggleFullscreen);document.querySelector("[data-rotate]")?.addEventListener("click",rotateGame);
try{if(sessionStorage.getItem("escie_handheld_mode")==="1")setHandheld(true);if(sessionStorage.getItem("escie_device_mode")==="1")document.getElementById("world-device")?.classList.add("device-immersive")}catch(e){}
document.addEventListener("fullscreenchange",()=>{document.body.classList.toggle("fullscreen-active",!!document.fullscreenElement)});
const boot=state();
if(boot.world_position&&Number.isFinite(Number(boot.world_position.x))&&Number.isFinite(Number(boot.world_position.y)))pos={x:Math.max(0,Math.min(W-1,Number(boot.world_position.x))),y:Math.max(0,Math.min(H-1,Number(boot.world_position.y)))};
if(boot.world_room==="trace"){room="trace";roomSetup();}else if(boot.world_room==="room02"){room="room02";roomSetup();}else if(boot.world_room==="room01"){room="room01";roomSetup();}
syncSimulationPosition();drawMap();render();stage.focus();poll();

(function(){
function openSimulation(){
 const a=window.ESCIE_WORLD_SIMULATION,e=document.getElementById("world-simulation");
 if(!a||!e)return;
 const r=()=>{
  const s=a.state(),v={MONEY:"$"+s.money,HUNGER:Math.round(s.hunger)+"%",ENERGY:Math.round(s.energy)+"%",HEALTH:Math.round(s.health)+"%",STRESS:Math.round(s.stress)+"%",SOCIAL:Math.round(s.social)+"%",REPUTATION:s.reputation,STATUS:s.status,PATH:s.path,TRANSPORT:s.transport,SEASON:s.season,WEATHER:s.weather,TIME:String(s.hour).padStart(2,"0")+":"+String(s.minute).padStart(2,"0"),LOCATION:s.neighbourhood,WANTED:s.wanted,SENTENCE:s.sentence_minutes+" MIN"};
  e.querySelector("[data-sim-grid]").innerHTML=Object.entries(v).map(x=>"<div class='sim-card'><strong>"+x[0]+"</strong><span>"+x[1]+"</span></div>").join("");
  const t=e.querySelector("[data-transit-panel]");
  if(t){
   const routes=a.transitRoutes||{},here=String(s.neighbourhood||"PARC-EXTENSION").toUpperCase();
   t.innerHTML="<div class='transit-head'><strong>PUBLIC TRANSIT</strong><span>SKIPPABLE JOURNEYS · FARE REQUIRED</span></div><div class='transit-mode'><button type='button' data-transit-mode='METRO' class='active'>METRO</button><button type='button' data-transit-mode='BUS'>BUS</button></div><div class='transit-routes'>"+Object.keys(routes).filter(d=>d!==here).map(d=>"<button type='button' data-transit-destination='"+d+"'><b>"+d+"</b><small>"+(routes[d].lines||[]).join(" / ")+" · METRO / BUS · $"+Number(routes[d].baseFare).toFixed(2)+"</small></button>").join("")+"</div>";
   t.querySelectorAll("[data-transit-mode]").forEach(b=>b.onclick=()=>{window.__escieTransitMode=b.dataset.transitMode;t.querySelectorAll("[data-transit-mode]").forEach(x=>x.classList.toggle("active",x===b))});
   t.querySelectorAll("[data-transit-destination]").forEach(b=>b.onclick=()=>{
    const result=a.publicTransit(window.__escieTransitMode||"METRO",b.dataset.transitDestination);
    if(!result.ok){say?.(result.reason==="INSUFFICIENT_FUNDS"?"TRANSIT · NOT ENOUGH MONEY FOR THE FARE.":result.reason==="ALREADY_THERE"?"TRANSIT · YOU ARE ALREADY THERE.":result.reason==="SERVICE_CLOSED"?"TRANSIT · METRO SERVICE IS CLOSED. TRY A BUS.":"TRANSIT · ROUTE UNAVAILABLE.");r();return}
    feedback?.("select");say?.(result.mode+" · "+result.destination+" · "+result.minutes+" MINUTES SKIPPED · $"+result.fare.toFixed(2)+" · "+(result.lines||[]).join(" / ")+" · ARRIVED");r();render?.();
   });
  }
 };
 e.hidden=false;r();
 e.querySelector("[data-sim-close]").onclick=()=>e.hidden=true;
 e.querySelectorAll("[data-sim-transport]").forEach(b=>b.onclick=()=>{a.setTransport(b.dataset.simTransport);r()});
 e.querySelector("[data-sim-eat]").onclick=()=>{const x=a.activity("EAT");say?.(x.ok?"FOOD · HUNGER RECOVERED.":"FOOD · NOT ENOUGH MONEY.");r()};e.querySelector("[data-sim-sleep]").onclick=()=>{a.activity("SLEEP");say?.("SLEEP · TIME ADVANCED.");r()};e.querySelector("[data-sim-rest]").onclick=()=>{a.activity("REST");r()};e.querySelector("[data-sim-work]").onclick=()=>{const x=a.activity("WORK",{id:"LOCAL SHIFT",pay:25});say?.(x.ok?"WORK · $25 EARNED.":"WORK · UNAVAILABLE.");r()};e.querySelector("[data-sim-social]").onclick=()=>{a.activity("SOCIAL");r()};e.querySelector("[data-sim-time]").onclick=()=>{a.advance(30);r()};
 e.querySelector("[data-sim-train]").onclick=()=>{a.train("fitness",5);r()};
 e.querySelector("[data-sim-graffiti]").onclick=()=>{a.graffiti("PLAYER",a.state().neighbourhood||"MONTRÉAL");r()};
}
document.querySelector("[data-life-systems]")?.addEventListener("click",openSimulation)
})();
function phoneApp(tab="notifications"){const root=document.getElementById("world-phone"),out=document.getElementById("phone-content");if(!root||!out)return;root.hidden=false;let m=readStorageJSON(PHONE_STORE_KEY,{});const s=window.ESCIE_WORLD_SIMULATION?.state?.()||{};const contacts=Array.isArray(m.contacts)?m.contacts:[{id:"witness",name:"THE WITNESS"},{id:"unknown",name:"UNKNOWN NUMBER"}];const list=a=>Array.isArray(a)&&a.length?a.map(x=>"<div class='phone-card'>"+String(typeof x==="string"?x:JSON.stringify(x)).replace(/[&<>"]/g,"")+"</div>").join(""):"<p class='phone-empty'>Nothing here yet.</p>";if(tab==="calls")out.innerHTML="<div class='phone-card'><strong>CONTACTS</strong><button data-phone-call='witness'>CALL THE WITNESS</button><button data-phone-call='unknown'>UNKNOWN NUMBER</button></div>"+list(m.calls);else if(tab==="photos")out.innerHTML="<div class='phone-card'><strong>CAMERA</strong><button data-phone-photo>TAKE SNAPSHOT</button></div>"+list(m.photos);else if(tab==="notes")out.innerHTML="<div class='phone-card'><textarea id='phone-note' class='phone-input' rows='5' placeholder='Write a note...'></textarea><button data-phone-save-note>SAVE NOTE</button></div>"+list(m.notes);else if(tab==="messages"){const msgs=Array.isArray(m.messages)?m.messages:[];out.innerHTML="<div class='phone-card'><strong>MESSAGES</strong><p>CONNECTIONS CHANGE WITH THE WORLD.</p></div>"+list(msgs)}else if(tab==="notifications")out.innerHTML="<div class='phone-card'><strong>"+(s.neighbourhood||"PARC-EXTENSION")+" · DAY "+(s.day||1)+" · "+String(s.hour??12).padStart(2,"0")+":"+String(s.minute??0).padStart(2,"0")+"</strong></div>"+list(m.notifications);else if(tab==="qr")out.innerHTML="<div class='phone-card'><strong>QR / SIGNAL</strong><input id='phone-qr-input' class='phone-input' placeholder='ESCIE://...'><button data-phone-qr>PROCESS CODE</button></div>"+list(m.qr);else if(tab==="map"){const routes=window.ESCIE_WORLD_SIMULATION?.transitRoutes||{};const current=String(s.neighbourhood||"PARC-EXTENSION").toUpperCase();const service=window.ESCIE_WORLD_SIMULATION?.transitService;const planner=window.ESCIE_WORLD_SIMULATION?.routePlan;const currentInfo=routes[current]||{};const districts=Object.keys(routes).filter(d=>d!==current);out.innerHTML="<div class='phone-card'><strong>CITY MAP</strong><p>CURRENT · "+current+"</p><p>POSITION · "+Number(s.position?.x??0)+" · "+Number(s.position?.y??0)+"</p><p>TRANSPORT · "+String(s.transport||"FOOT")+"</p><p>MONEY · $"+Number(s.money||0).toFixed(2)+"</p><p>LOCAL METRO · "+(currentInfo.metro||[]).join(", ")+"</p><p>LOCAL BUS · "+(currentInfo.bus||[]).join(", ")+"</p></div><div class='phone-card'><strong>ROUTE PREVIEW</strong><small>SELECT A DESTINATION TO SEE THE ACTUAL WALK + TRANSIT COST BEFORE TRAVEL.</small>"+districts.map(d=>{const x=routes[d]||{};const metroOpen=service?service(s,"METRO"):true;const preferred=metroOpen&&Array.isArray(x.lines)&&x.lines.length?"METRO":"BUS";const plan=planner?.(d,preferred)||null;const mode=plan?.mode||preferred;const walk=plan?.walking_minutes??"--";const ride=plan?.minutes??"--";const total=plan?.total_minutes??"--";const fare=Number(plan?.fare??x.baseFare??0).toFixed(2);const status=plan?.ok?"READY":(plan?.reason==="INSUFFICIENT_FUNDS"?"NEED FUNDS":plan?.reason==="SERVICE_CLOSED"?"CLOSED":"UNAVAILABLE");return "<div class='phone-route'><strong>"+d+"</strong><p>WALK "+walk+" MIN → "+mode+" · "+ride+" MIN · TOTAL "+total+" MIN · $"+fare+"</p><small>"+status+" · "+(x.lines||[]).join(" / ")+" · "+(x.metro||[]).slice(0,2).join(", ")+"</small><button data-phone-transit='"+d+"' data-phone-mode='"+mode+"' "+(plan?.ok?"":"disabled")+">"+(plan?.ok?"TRAVEL · "+mode:status)+"</button></div>";}).join("")+"</div>";}else if(tab==="music")out.innerHTML="<div class='phone-card'><strong>MUSIC PLAYER</strong><audio id='phone-audio' class='phone-player' controls></audio><input id='phone-audio-file' type='file' accept='audio/*' multiple><div id='phone-tracks'></div></div>";}
window.addEventListener("escie:npc-relationship",e=>{const d=e.detail||{};if(d.id)relationshipMessage(d.id,d.text||"THE WORLD REMEMBERS.");});
document.addEventListener("click",e=>{
 const tab=e.target.closest("[data-phone-tab]")?.dataset.phoneTab;if(tab)phoneApp(tab);
 if(e.target.closest("[data-phone-open]"))phoneApp("calls");
 if(e.target.closest("[data-phone-close]"))document.getElementById("world-phone").hidden=true;
 if(e.target.closest("[data-phone-save-note]")){const v=document.getElementById("phone-note")?.value.trim();if(v){const m=readStorageJSON(PHONE_STORE_KEY,{notes:[]});m.notes=m.notes||[];m.notes.unshift(v.replace(/[<>&"]/g,""));if(writePhoneState(m))phoneApp("notes");else saveIndicator("PHONE SAVE FAILED");}}
 const tr=e.target.closest("[data-phone-transit]");if(tr){const d=tr.dataset.phoneTransit;const mode=tr.dataset.phoneMode||"METRO";const sim=window.ESCIE_WORLD_SIMULATION;if(sim?.navigate){const plan=sim.routePlan?.(d,mode);if(!plan?.ok){if(window.ESCIE_PHONE_GAMEPLAY?.notify)window.ESCIE_PHONE_GAMEPLAY.notify("TRANSIT · "+(plan?.reason||"UNAVAILABLE"),"ERROR");phoneApp("map");return}const x=sim.navigate(d,mode);if(window.ESCIE_PHONE_GAMEPLAY?.notify)window.ESCIE_PHONE_GAMEPLAY.notify(x.ok?"ARRIVED · "+d+" · "+x.total_minutes+" MIN":"TRANSIT · "+(x.reason||"UNAVAILABLE"),x.ok?"TRANSIT":"ERROR");phoneApp("map");}}if(e.target.closest("[data-phone-photo]")){const m=readStorageJSON(PHONE_STORE_KEY,{});m.photos=m.photos||[];m.photos.unshift("PHOTO · "+new Date().toLocaleString());if(writePhoneState(m))phoneApp("photos");else saveIndicator("PHONE SAVE FAILED");}
});
document.addEventListener("change",e=>{if(e.target.id==="phone-audio-file"){const box=document.getElementById("phone-tracks");[...e.target.files].forEach(f=>{const u=URL.createObjectURL(f),a=document.createElement("button");a.textContent=f.name;a.onclick=()=>{document.getElementById("phone-audio").src=u;document.getElementById("phone-audio").play();};box.appendChild(a);});}});

window.addEventListener("escie:financial-event",e=>{const d=e.detail||{};if(window.ESCIE_PHONE_GAMEPLAY?.notify)window.ESCIE_PHONE_GAMEPLAY.notify((d.type==="INCOME"?"+$":"-$")+Number(d.amount||0)+" · "+(d.reason||"FINANCE"),"FINANCE");});
(function phoneGameplayBridge(){
 const KEY="escie_phone_v1";
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return {}}};
 const write=x=>writePhoneState(x);
 const notify=(text,type="INFO")=>{const m=read();m.notifications=m.notifications||[];m.notifications.unshift({text,type,day:window.ESCIE_WORLD_SIMULATION?.state?.day||1,time:new Date().toLocaleTimeString()});m.notifications=m.notifications.slice(0,50);write(m);};
 const call=(contact,text)=>{const m=read();m.calls=m.calls||[];m.calls.unshift({contact,text,time:new Date().toLocaleTimeString()});m.calls=m.calls.slice(0,50);write(m);notify("CALL · "+contact,"CALL");};
 const message=(contact,text)=>{const m=read();m.messages=m.messages||[];m.messages.unshift({contact,text,day:window.ESCIE_WORLD_SIMULATION?.state?.().day||1,time:new Date().toLocaleTimeString(),unread:true});m.messages=m.messages.slice(0,100);write(m);notify("MESSAGE · "+contact,"MESSAGE");};const relationshipMessage=(id,text)=>{const n=window.ESCIE_WORLD_NPC?.state?.().npcs?.[id]||{};const contact=n.name||id;message(contact,text);};
 window.ESCIE_PHONE_GAMEPLAY={notify,call,message,relationshipMessage};

function processWorldQR(raw){
  const value=String(raw||"").trim(), normalized=value.replace(/^escie:\/\//i,"");
  let parts;
  try{parts=normalized.split("/").map(x=>decodeURIComponent(x).trim()).filter(Boolean)}catch(e){return {ok:false,message:"QR · INVALID CODE"}}
  const kind=String(parts.shift()||"").toUpperCase(), payload=parts.join("/"), sim=window.ESCIE_WORLD_SIMULATION, s=sim?.state?.();
  let qrState=readStorageJSON(KEY,{});
  const allowed=/^[A-Z0-9_ .-]+$/i;
  const m=readStorageJSON(PHONE_STORE_KEY,{});
  m.qr=Array.isArray(m.qr)?m.qr:[];
  const record={code:value.slice(0,160),day:s?.day||1,time:new Date().toLocaleTimeString(),ok:false};
  const reject=(message)=>{record.message=message;m.qr.unshift(record);m.qr=m.qr.slice(0,50);writePhoneState(m);return {ok:false,message}};
  if(!/^ESCIE:\/\//i.test(value))return reject("QR · INVALID ESCIE CODE");
  if(!parts.length||!allowed.test(payload))return reject("QR · UNSUPPORTED CODE");
  let message="";
  if(kind==="QUERY"){
    const q="query:"+payload.toLowerCase();
    qrState.world_unlocks=Array.isArray(qrState.world_unlocks)?qrState.world_unlocks:[];
    if(!qrState.world_unlocks.includes(q))qrState.world_unlocks.push(q);
    qrState.signals=(Number(qrState.signals)||0)+1;
    qrState.qr_history=(qrState.qr_history||[]).concat([{query:q,day:s?.day||1}]).slice(-100);
    window.ESCIE_GAME_REGISTRY?.applyPlayerEvent?.({event:"DISCOVERED",target:"qr:"+q,queries:[q]});
    record.ok=true;message="QR · QUERY UNLOCKED · "+q;
  }else if(kind==="DISCOVER"){
    const id=payload.toLowerCase().startsWith("game-")?payload:"game-discovery-"+payload.toLowerCase().replace(/[^a-z0-9_-]+/g,"-");
    qrState.discoveries=Array.isArray(qrState.discoveries)?qrState.discoveries:[];
    if(!qrState.discoveries.includes(id))qrState.discoveries.push(id);
    qrState.signals=(Number(qrState.signals)||0)+1;
    window.ESCIE_GAME_REGISTRY?.applyPlayerEvent?.({event:"DISCOVERED",target:id,queries:["query:"+payload.toLowerCase()]});
    record.ok=true;message="QR · DISCOVERY RECORDED · "+id;
  }else if(kind==="DISTRICT"){
    const d=payload.toUpperCase(), known=sim?.districts?.[d];
    if(!known)return reject("QR · UNKNOWN DISTRICT");
    sim.activateDistrict?.(d,"QR");
    record.ok=true;message="QR · DISTRICT ACCESS · "+d;
  }else if(kind==="SIGNAL"){
    const amount=Math.max(1,Math.min(25,Number(payload)));
    if(!Number.isFinite(amount))return reject("QR · INVALID SIGNAL VALUE");
    qrState.signals=(Number(qrState.signals)||0)+amount;
    record.ok=true;message="QR · SIGNAL +"+amount;
  }else return reject("QR · CODE TYPE NOT RECOGNIZED");
  record.message=message;m.qr.unshift(record);m.qr=m.qr.slice(0,50);
  const updates={[PHONE_STORE_KEY]:m};
  if(kind==="QUERY"||kind==="DISCOVER"||kind==="SIGNAL")updates[KEY]=qrState;
  if(!commitStorageBatch(updates))return {ok:false,message:"QR · SAVE FAILED"};
  return {ok:true,message};
}

 document.addEventListener("click",e=>{
   const b=e.target.closest("[data-phone-call]"); if(b){const id=b.dataset.phoneCall;const contact=id==="witness"?"THE WITNESS":"UNKNOWN CONTACT";call(contact,"Connection established.");if(id==="witness"){window.ESCIE_WORLD_NPC?.rememberInteraction?.("witness",{channel:"PHONE",text:"Called the Witness."});const rel=window.ESCIE_WORLD_NPC?.relationship?.("witness",1,"PHONE CALL");message(contact,rel>=40?"You can call me again.":rel<=-40?"Do not call me again.":"I know. I am listening.");}}
   const q=e.target.closest("[data-phone-qr]"); if(q){
  const input=document.getElementById("phone-qr-input"),raw=String(input?.value||"").trim();
  if(!raw){notify("QR · ENTER A CODE FIRST","QR");return;}
  const result=processWorldQR(raw);
  notify(result.message||("QR · "+(result.ok?"ACCEPTED":"REJECTED")),"QR");
  phoneApp("qr");
}
 });
})();

(function dreamState(){
 const trigger=()=>{const sim=window.ESCIE_WORLD_SIMULATION;if(!sim?.evaluateDream)return;const d=sim.evaluateDream(sim.state);if(!d)return;const e=sim.enterDream(d.id)||d;window.ESCIE_PHONE_GAMEPLAY?.notify?.("DREAM EVENT · "+e.title,e.horror?"HORROR":"MEMORY");window.ESCIE_WORLD_DREAM={active:true,event:e};};
 window.ESCIE_WORLD_DREAM={active:false,trigger};
})();

(function renderDreamOverlay(){
 const o=document.getElementById("dream-overlay"),t=document.getElementById("dream-title"),p=document.getElementById("dream-text");
 const state=window.ESCIE_WORLD_DREAM;
 const show=e=>{if(!o||!e)return;t.textContent=e.title||"NIGHT SIGNAL";p.textContent=(e.reasons||[]).join(" · ")+" · THE CITY IS NOT WHERE YOU LEFT IT.";o.hidden=false};
 document.addEventListener("click",ev=>{const b=ev.target.closest("[data-dream]");if(!b)return;if(b.dataset.dream==="wake"){if(o)o.hidden=true;if(window.ESCIE_WORLD_DREAM)window.ESCIE_WORLD_DREAM.active=false;}else{show(state?.event);}});
 if(state?.active&&state.event)show(state.event);
})();

(function dreamChoices(){
 const choice=(id)=>{const sim=window.ESCIE_WORLD_SIMULATION;if(!sim)return;sim.choice?.("DREAM_"+id,"DREAM");const s=typeof sim.state==="function"?sim.state():sim.state;s.stress=Math.max(0,Number(s.stress)+(id==="FOLLOW"?8:-4));s.sleep=0;if(!commitStorageBatch({"escie_world_simulation_v1":s}))return;if(window.ESCIE_PHONE_GAMEPLAY?.notify)window.ESCIE_PHONE_GAMEPLAY.notify("DREAM CHOICE · "+id,"DREAM");};
 window.ESCIE_WORLD_DREAM_CHOICE={choice};
 document.addEventListener("click",e=>{const b=e.target.closest("[data-dream-choice]");if(b)choice(b.dataset.dreamChoice);});
})();

(function runDreamDirector(){
 window.ESCIE_WORLD_DREAM_DIRECTOR={generate:()=>{const sim=window.ESCIE_WORLD_SIMULATION;if(!sim?.dreamDirector)return null;const d=sim.dreamDirector.choose(sim.state);window.ESCIE_WORLD_DREAM_CONTEXT={scenario:d};return d;}};
})();

(function dreamLevelBridge(){
 window.ESCIE_WORLD_DREAM_LEVEL={enter:()=>{const sim=window.ESCIE_WORLD_SIMULATION;if(!sim?.buildDreamLevel)return null;const level=sim.buildDreamLevel();window.ESCIE_WORLD_DREAM={active:true,event:level.scenario,level};return level;}};
})();

/* PLAYABLE DREAM SPACE */
(function(){
 const levels={
  "PARC-EXTENSION-DREAM":{size:[16,10],player:{x:2,y:7},exit:{x:14,y:2},threat:{id:"WATCHER",x:12,y:3,vision:4},objects:[{id:"REPEATING_SHOE",x:6,y:5,label:"THE SHOE"}]},
  "PLATEAU-DREAM":{size:[16,10],player:{x:2,y:7},exit:{x:2,y:7},threat:{id:"DOOR",x:10,y:4,vision:3},objects:[{id:"LOOP_DOOR",x:10,y:4,label:"THE DOOR"}]},
  "DOWNTOWN-DREAM":{size:[16,10],player:{x:8,y:8},exit:{x:8,y:1},threat:{id:"EMPTY_WITNESS",x:8,y:3,vision:5},objects:[{id:"SIGNAL_SCREEN",x:4,y:4,label:"THE SCREEN"}]},
  "UNKNOWN-DREAM":{size:[16,10],player:{x:2,y:7},exit:{x:14,y:7},threat:{id:"UNKNOWN",x:10,y:5,vision:4},objects:[]}
 };
 window.ESCIE_WORLD_DREAM_PLAY={start:function(level){
   const l=levels[level?.location?.id||level?.id||"UNKNOWN-DREAM"]||levels["UNKNOWN-DREAM"];
   const state={active:true,level:l,player:{...l.player},threat:{...l.threat},found:false,turns:0};
   window.ESCIE_WORLD_DREAM_STATE=state;
   document.dispatchEvent(new CustomEvent("escie-dream-play-start",{detail:state}));
   return state;
 },move:function(dx,dy){
   const s=window.ESCIE_WORLD_DREAM_STATE;if(!s?.active)return null;
   s.player.x=Math.max(0,Math.min(15,s.player.x+dx));s.player.y=Math.max(0,Math.min(9,s.player.y+dy));s.turns++;
   const t=s.threat,dist=Math.abs(s.player.x-t.x)+Math.abs(s.player.y-t.y);
   if(dist<=t.vision){s.detected=true;document.dispatchEvent(new CustomEvent("escie-dream-detected",{detail:s}));}
   if(s.player.x===s.level.exit.x&&s.player.y===s.level.exit.y){s.active=false;s.result="WAKE";document.dispatchEvent(new CustomEvent("escie-dream-complete",{detail:s}));}
   return s;
 }};
})();

/* DREAM RENDERER + CONSEQUENCE LOOP */
(function(){
 const q=s=>document.querySelector(s), esc=v=>String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
 function overlay(){let el=q("#dream-play-layer");if(!el){el=document.createElement("div");el.id="dream-play-layer";el.className="dream-play-layer";el.innerHTML='<div class="dream-map"><div class="dream-map-head"><span id="dream-map-title">NIGHT SIGNAL</span><span id="dream-map-state">ACTIVE</span></div><div id="dream-map-grid"></div><div class="dream-map-help">MOVE · REACH THE EXIT · AVOID WHAT SEES YOU</div></div>';document.body.appendChild(el)}return el}
 function render(s){const el=overlay(),grid=el.querySelector("#dream-map-grid"),L=s.level;let html="";
  for(let y=0;y<10;y++)for(let x=0;x<16;x++){let cls="dream-cell";if(x===s.player.x&&y===s.player.y)cls+=" player";if(x===L.exit.x&&y===L.exit.y)cls+=" exit";if(x===s.threat.x&&y===s.threat.y)cls+=" threat";(L.objects||[]).forEach(o=>{if(o.x===x&&o.y===y)cls+=" object"});html+='<i class="'+cls+'" data-x="'+x+'" data-y="'+y+'"></i>'}
  grid.innerHTML=html;el.querySelector("#dream-map-title").textContent=L.label||"THE DREAM";el.querySelector("#dream-map-state").textContent=s.detected?"DETECTED":"ACTIVE";el.hidden=false;
 }
 function finish(s){if(s?.cancelled)return;const sim=window.ESCIE_WORLD_SIMULATION;if(sim?.choice)sim.choice("dream:"+s.level.id,s.result||"WAKE",{stress:s.detected?8:-5,health:s.detected?-5:0});if(window.ESCIE_WORLD_DREAM_STATE===s)window.ESCIE_WORLD_DREAM_STATE=null;const el=q("#dream-play-layer");if(el)el.hidden=true}
 document.addEventListener("escie-dream-play-start",e=>render(e.detail));
 document.addEventListener("escie-dream-complete",e=>{render(e.detail);setTimeout(()=>finish(e.detail),450)});
 document.addEventListener("escie-dream-detected",e=>render(e.detail));
 document.addEventListener("keydown",e=>{if(!window.ESCIE_WORLD_DREAM_STATE?.active)return;const m={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};const v=m[e.key];if(v&&window.ESCIE_WORLD_DREAM_PLAY){e.preventDefault();const s=window.ESCIE_WORLD_DREAM_PLAY.move(...v);if(s)render(s)}});
 document.addEventListener("pointerdown",e=>{const b=e.target.closest("[data-dream-move]");if(!b)return;const v=b.dataset.dreamMove.split(",").map(Number);const s=window.ESCIE_WORLD_DREAM_PLAY?.move(...v);if(s)render(s)});
 window.ESCIE_WORLD_DREAM_RENDER={render};
})();
