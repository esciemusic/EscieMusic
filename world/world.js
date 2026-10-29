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
function esc(v){return String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",\"":"&quot;"}[m]))}\nfunction syncSimulationPosition(){const s=window.ESCIE_WORLD_SIMULATION?.state?.();if(s?.position&&Number.isFinite(s.position.x)&&Number.isFinite(s.position.y)&&s.neighbourhood==="PARC-EXTENSION"&&pos.x===2&&pos.y===7)return;window.ESCIE_WORLD_SIMULATION?.setPosition?.(pos.x,pos.y)}
function state(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return {}}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function say(t){log.textContent=t}
function openDialogue(n){dialogue=n;const choices=n.choices||[];say(n.label+" · "+n.lines[0]+(choices.length?" · CHOOSE: "+choices.map((c,i)=>(i+1)+" "+c.label).join(" / "):""));}
function chooseDialogue(i){if(!dialogue)return;const c=(dialogue.choices||[])[i];if(!c)return;const sim=window.ESCIE_WORLD_SIMULATION;if(sim){if(c.label==="WHO ARE YOU?")sim.choice("witness_identity","WHO ARE YOU?",{stress:1,social:2});else if(c.label==="WHAT IS THIS PLACE?")sim.choice("witness_place","WHAT IS THIS PLACE?",{stress:-1,social:1});else if(c.label==="I NEED THE KEY.")sim.choice("witness_key","I NEED THE KEY.",{stress:2,reputation:1});}say(c.text);window.ESCIE_WORLD_NPC?.rememberInteraction?.("witness",{choice:c.label,text:c.text});window.ESCIE_WORLD_NPC?.relationship?.("witness",c.label==="I NEED THE KEY."?5:2,c.label);if(c.discovery){const o={discovery:c.discovery,queries:c.queries||[]};discover(o);if(c.discovery==="game-discovery-witness"){const s=state();s.inventory=Array.isArray(s.inventory)?s.inventory:[];if(!s.inventory.includes("game-item-signal-key")){s.inventory.push("game-item-signal-key");save(s);say(c.text+" The Witness places the Signal Key in your hand.");}}}dialogue=null;render();}
function isWall(x,y){return walls.has(x+","+y)}
function hasItem(id){const s=state();return Array.isArray(s.inventory)&&s.inventory.includes(id)}
function roomSetup(){const s=state();roomState={tvHeard:Array.isArray(s.discoveries)&&s.discoveries.includes("game-discovery-tv"),tapeTaken:Array.isArray(s.inventory)&&s.inventory.includes("game-item-vhs-tape"),room02:s.world_room==="room02"};roomObjects=room==="trace"?[{id:"trace-core",x:4,y:4,label:"TRACE CORE",text:"The signal has stopped behaving like a clue. It is behaving like a path.",discovery:"game-discovery-trace-core",queries:["query:trace-core","query:path","query:signal"]},{id:"exit-signal",x:6,y:2,label:"SIGNAL EXIT",text:"A final marker points toward something outside the playable layer.",discovery:"game-discovery-exit",queries:["query:exit","query:outside"]},{id:"return-frame",x:1,y:1,label:"RETURN FRAME",text:"A frame back to ROOM 02.",discovery:null}]:room==="room02"?[{id:"console",x:5,y:3,label:"GREEN TERMINAL",text:"A green terminal wakes when it recognizes the pass. It displays three options: LISTEN, TRACE, OPEN.",discovery:"game-discovery-terminal",queries:["query:terminal","query:deeper"]},{id:"archive",x:2,y:6,label:"ARCHIVE CABINET",text:"The cabinet contains an index of places, people and moments. Several entries are deliberately blank.",discovery:"game-discovery-deeper-archive",queries:["query:archive","query:places","query:people"]},{id:"trace-gate",x:6,y:6,label:"TRACE GATE",text:"A narrow green frame has appeared in the wall. It has no handle. The terminal may be the only way through.",discovery:null}]:[{id:"tv",x:5,y:2,label:"TELEVISION",text:"The television has no picture. The audio is a low recording of street noise.",discovery:"game-discovery-tv",queries:["query:television","query:audio"]},{id:"tape",x:2,y:5,label:"TAPE",text:"A VHS tape marked only with a date. No name.",discovery:"game-discovery-tape",queries:["query:tape","query:archive"],item:"game-item-vhs-tape"},{id:"green-door",x:7,y:6,label:"GREEN DOOR",text:"A second door. The lock has a green indicator and no handle.",discovery:null}]}
function persistRoom(){const s=state();s.world_room=room;s.world_room_state=roomState;save(s)}
function enterDoor(){if(!target)return false;if(target.id==="trace-gate"){const s=state();if(!Array.isArray(s.discoveries)||!s.discoveries.includes("game-discovery-terminal")){say("TRACE GATE · TERMINAL ACCESS REQUIRED.");return true}if(!Array.isArray(s.world_unlocks)||!s.world_unlocks.includes("query:trace")){say("TRACE GATE · COMPLETE THE TERMINAL TRACE FIRST.");return true}room="trace";roomSetup();pos={x:1,y:1};persistRoom();say("TRACE ACCEPTED. The green frame opens into a new layer.");render();return true}if(target.id==="door"){if(!hasItem("game-item-signal-key")){say("The lock stays silent. The Signal Key is still missing.");return true}room="room01";roomSetup();pos={x:2,y:7};persistRoom();say("The door opens. Fluorescent light spills into the lane.");render();return true}if(target.id==="green-door"){if(!hasItem("game-item-green-pass")){say("GREEN DOOR · ACCESS DENIED. The World Market has the pass.");return true}room="room02";roomSetup();pos={x:1,y:1};persistRoom();say("GREEN ACCESS ACCEPTED. A deeper layer opens.");render();return true}return false}
function leaveRoom(){if(room==="trace"){room="room02";roomSetup();pos={x:6,y:6};persistRoom();say("You return from the trace layer. The green frame remains.");render();return true}if(room==="room02"){room="room01";roomSetup();pos={x:6,y:5};persistRoom();say("You return from the deeper layer. The green door remains unlocked.");render();return true}if(room==="room01"){room="lane";roomObjects=[];persistRoom();pos={x:3,y:3};say("You step back into the lane. Nothing outside has changed.");render();return true}return false}
function drawMap(){map.innerHTML="";for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=document.createElement("span");t.className="world-tile "+(isWall(x,y)?"wall":"floor");t.style.left=(x/W*100)+"%";t.style.top=(y/H*100)+"%";t.style.width=(100/W)+"%";t.style.height=(100/H)+"%";map.appendChild(t)}
const visible=(room==="room01"?roomObjects:objects.concat(npcs));visible.forEach(o=>{const n=document.createElement("span");n.className="world-object";n.textContent=o.id==="shoe"?"◊":o.id==="camera"?"●":o.id==="signal"?"≈":o.id==="chair"?"□":o.id==="witness"?"W":"▣";n.style.left=((o.x+.5)/W*100)+"%";n.style.top=((o.y+.5)/H*100)+"%";n.title=o.label;map.appendChild(n)})}
function render(){syncNPCVisuals();if(room==="room01"){target=roomObjects.find(o=>Math.abs(o.x-pos.x)<=1&&Math.abs(o.y-pos.y)<=1)||null}else{target=objects.concat(npcs).find(o=>Math.abs(o.x-pos.x)<=1&&Math.abs(o.y-pos.y)<=1)||null}document.getElementById("world-location").textContent=room==="room01"?"ROOM 01 · UNKNOWN ADDRESS":room==="room02"?"GREEN ACCESS · DEEPER LAYER":room==="trace"?"TRACE LAYER · SIGNAL PATH":"PARC-EXTENSION";player.style.left=((pos.x+.5)/W*100)+"%";player.style.top=((pos.y+.5)/H*100)+"%";if(target){interact.hidden=false;interact.textContent="● "+target.label;interact.style.left=((target.x+.5)/W*100)+"%";interact.style.top=((target.y+.5)/H*100)+"%"}else interact.hidden=true;const s=state();document.getElementById("world-coordinates").textContent=String(pos.x).padStart(2,"0")+" · "+String(pos.y).padStart(2,"0");document.getElementById("world-signal").textContent=(Number(s.signals)||0)+" SIGNAL"}
function move(dx,dy){const sim=window.ESCIE_WORLD_SIMULATION;if(room==="room01"||room==="room02"||room==="trace"){const nx=Math.max(0,Math.min(7,pos.x+dx)),ny=Math.max(0,Math.min(7,pos.y+dy));if(nx===pos.x&&ny===pos.y)return;pos={x:nx,y:ny};if(sim)sim.advance(2);say("The room hums. The television is on, but there is no picture.");render();return}const nx=Math.max(0,Math.min(W-1,pos.x+dx)),ny=Math.max(0,Math.min(H-1,pos.y+dy));if(isWall(nx,ny)){if(sim)sim.change({stress:1});say("Concrete. Locked space. Find another route.");return}if(nx===pos.x&&ny===pos.y)return;let movement=null;if(sim?.movePlayer){movement=sim.movePlayer(nx-pos.x,ny-pos.y,{mode:sim.state().transport||"FOOT"});if(!movement?.ok)return;}else{pos={x:nx,y:ny};sim?.setPosition?.(pos.x,pos.y);sim?.advance?.(1)}pos={x:nx,y:ny};if(sim){sim.advance(1);if(sim.state().transport==="RUN"||sim.state().transport==="PARKOUR")sim.change({hunger:-1});sim.decayWanted?.(0.02);window.ESCIE_WORLD_NPC?.tick?.(sim.state().day,sim.state().hour,sim.state().minute,(x,y)=>isWall(x,y));window.ESCIE_WORLD_NPC?.observe?.("MOVEMENT",pos,{radius:sim?.state?.().transport==="RUN"||sim?.state?.().transport==="PARKOUR"?5:4,speed:sim?.state?.().transport||"WALK",blocked:(x,y)=>isWall(x,y)});}say(movement?.to_node?("The street is real. SIGNAL ROUTE · "+movement.to_node+"."): "The street is real. The signal moves with you.");render()}
function registryDiscovery(id,queries){const registry=window.ESCIE_GAME_REGISTRY;if(registry&&registry.applyPlayerEvent){try{registry.applyPlayerEvent({event:"DISCOVERED",target:id,queries:queries||[]})}catch(e){}}}
function discover(o){if(o.id==="tv")roomState.tvHeard=true;if(o.id==="tape")roomState.tapeTaken=true;persistRoom();const s=state();s.discoveries=Array.isArray(s.discoveries)?s.discoveries:[];s.world_unlocks=Array.isArray(s.world_unlocks)?s.world_unlocks:[];if(o.discovery&&!s.discoveries.includes(o.discovery)){s.discoveries.push(o.discovery);(o.queries||[]).forEach(q=>{if(!s.world_unlocks.includes(q))s.world_unlocks.push(q)});s.signals=(Number(s.signals)||0)+1;registryDiscovery(o.discovery,o.queries)}if(o.item){s.inventory=Array.isArray(s.inventory)?s.inventory:[];if(!s.inventory.includes(o.item))s.inventory.push(o.item)}s.entered=true;s.entry_source="world";save(s)}
function unlockFromEvidence(){const s=state();s.world_unlocks=Array.isArray(s.world_unlocks)?s.world_unlocks:[];["query:tape","query:television","query:archive","query:audio","query:date"].forEach(q=>{if(!s.world_unlocks.includes(q))s.world_unlocks.push(q)});s.signals=(Number(s.signals)||0)+1;s.unresolved=Array.isArray(s.unresolved)?s.unresolved:[];if(!s.unresolved.includes("room01-date"))s.unresolved.push("room01-date");save(s)}
function npcDialogue(n){const rel=Number(window.ESCIE_WORLD_NPC?.state?.().npcs?.[n.id]?.relationship||0),role=n.role||"LOCAL";return {id:n.id,label:n.label||role,lines:[role+" · "+(n.activity||"IDLE")],choices:[{label:"TALK",text:rel>=40?"You seem familiar. We can talk.":rel<=-40?"I don't have much to say to you.":"What's up?"},{label:"HELP",text:"You offer to help."},{label:"JOB",text:"Ask if they have work."},{label:"FAVOR",text:"Ask if there's something useful you can do."},{label:"INSULT",text:"The mood changes immediately."},{label:"GIVE",text:"You offer something without explaining why."}]};}
function chooseDialogueLegacy(i){if(!dialogue)return;const c=(dialogue.choices||[])[i];if(!c)return;const sim=window.ESCIE_WORLD_SIMULATION;
if(dialogue._npc&&dialogue.id!=="witness"){if(c.label==="JOB"){const offer=sim?.npcJobOffer?.(dialogue.id)||{};const result=offer.ok&&offer.available?sim.npcJobAccept(dialogue.id):offer;say(result.ok?(result.offer.label+" · +$"+result.offer.pay):"NO WORK · "+String(result.reason||"UNAVAILABLE"));dialogue=null;render();return;}if(c.label==="FAVOR"){const result=sim?.npcFavor?.(dialogue.id,"FAVOR")||{};say(result.ok?"FAVOR COMPLETE · +$"+result.reward:"NO FAVOR · "+String(result.reason||"TRUST REQUIRED"));dialogue=null;render();return;}const type=c.label==="GIVE"?"GIFT":c.label;const result=sim?.npcInteraction?.(dialogue.id,type)||{};say((result.reaction||"OBSERVANT")+" · "+(result.relationship??0)+" RELATIONSHIP");window.ESCIE_PHONE_GAMEPLAY?.relationshipMessage?.(dialogue.id,c.text);dialogue=null;render();return;}
if(sim){if(c.label==="WHO ARE YOU?")sim.choice("witness_identity","WHO ARE YOU?",{stress:1,social:2});else if(c.label==="WHAT IS THIS PLACE?")sim.choice("witness_place","WHAT IS THIS PLACE?",{stress:-1,social:1});else if(c.label==="I NEED THE KEY.")sim.choice("witness_key","I NEED THE KEY.",{stress:2,reputation:1});}say(c.text);window.ESCIE_WORLD_NPC?.rememberInteraction?.("witness",{choice:c.label,text:c.text});window.ESCIE_WORLD_NPC?.relationship?.("witness",c.label==="I NEED THE KEY."?5:2,c.label);if(c.discovery){const o={discovery:c.discovery,queries:c.queries||[]};discover(o);if(c.discovery==="game-discovery-witness"){const s=state();s.inventory=Array.isArray(s.inventory)?s.inventory:[];if(!s.inventory.includes("game-item-signal-key")){s.inventory.push("game-item-signal-key");save(s);say(c.text+" The Witness places the Signal Key in your hand.");}}}dialogue=null;render();}
function interactNPC(n){const d=npcDialogue(n);d.choices.forEach(ch=>ch.text=ch.text);dialogue=d;openDialogue(d);dialogue._npc=true;return d;}
function chooseDialogue(i){if(!dialogue)return;const c=(dialogue.choices||[])[i];if(!c)return;const sim=window.ESCIE_WORLD_SIMULATION;
if(dialogue._npc&&dialogue.id!=="witness"){const type=c.label==="GIVE"?"GIFT":c.label;const result=sim?.npcInteraction?.(dialogue.id,type)||{};say((result.reaction||"OBSERVANT")+" · "+(result.relationship??0)+" RELATIONSHIP");if(window.ESCIE_PHONE_GAMEPLAY?.relationshipMessage)window.ESCIE_PHONE_GAMEPLAY.relationshipMessage(dialogue.id,c.text);dialogue=null;render();return;}
if(sim){if(c.label==="WHO ARE YOU?")sim.choice("witness_identity","WHO ARE YOU?",{stress:1,social:2});else if(c.label==="WHAT IS THIS PLACE?")sim.choice("witness_place","WHAT IS THIS PLACE?",{stress:-1,social:1});else if(c.label==="I NEED THE KEY.")sim.choice("witness_key","I NEED THE KEY.",{stress:2,reputation:1});}say(c.text);window.ESCIE_WORLD_NPC?.rememberInteraction?.("witness",{choice:c.label,text:c.text});window.ESCIE_WORLD_NPC?.relationship?.("witness",c.label==="I NEED THE KEY."?5:2,c.label);if(c.discovery){const o={discovery:c.discovery,queries:c.queries||[]};discover(o);if(c.discovery==="game-discovery-witness"){const s=state();s.inventory=Array.isArray(s.inventory)?s.inventory:[];if(!s.inventory.includes("game-item-signal-key")){s.inventory.push("game-item-signal-key");save(s);say(c.text+" The Witness places the Signal Key in your hand.");}}}dialogue=null;render();}
function isWall(x,y){return walls.has(x+","+y)}
function hasItem(id){const s=state();return Array.isArray(s.inventory)&&s.inventory.includes(id)}
function roomSetup(){const sim=window.ESCIE_WORLD_SIMULATION;if(sim){if(target.id==="camera")sim.change({stress:2});if(target.id==="shoe")sim.change({stress:1,social:1});if(target.id==="signal")sim.change({stress:-2,reputation:1});}say(target.text);discover(target);if(room==="room01"&&(target.id==="tv"||target.id==="tape")){unlockFromEvidence();say(target.id==="tv"?"The audio resolves into a date. Something in the archive is now reachable.":"The tape is now yours. Its date matches the signal thread.");}if(target.id==="door"||target.id==="green-door"||target.id==="trace-gate"){if(enterDoor())return}if(room==="room02"&&target.id==="console"){terminalChoices();return}if(room==="trace"&&target.id==="return-frame"){leaveRoom();return}render()}
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
   const registry=window.ESCIE_GAME_REGISTRY;
   if(registry&&registry.applyEconomyEvent){
     const economy={balances:{SIGNAL:Number(s.signals||0)}};
     const next=registry.applyEconomyEvent(economy,{type:"EARN",amount:gained,currency:"SIGNAL",reason:"WORLD QUEST REWARD",timestamp:new Date().toISOString()});
     s.signals=Number(next.balances.SIGNAL||0);
   }else s.signals=Number(s.signals||0)+gained;
   save(s);say("QUEST COMPLETE · +"+gained+" SIGNAL");
   return gained;
 }
 return 0;
}
function quests(){
 const s=state(),board=document.getElementById("quest-board"),panel=document.getElementById("world-quests");if(!board||!panel)return;
 board.innerHTML=QUESTS.map(q=>{const st=questStatus(q,s);return "<article class=\"world-quest "+(st.done?"complete":st.met?"ready":"locked")+"\"><span>"+(st.done?"COMPLETE":st.met?"READY":"IN PROGRESS")+"</span><h3>"+esc(q.title)+"</h3><p>"+esc(q.description)+"</p><small>"+(st.done?"REWARD CLAIMED · "+q.reward+" SIGNAL":st.met?"RETURN TO QUESTS TO CLAIM · "+q.reward+" SIGNAL":"REQUIREMENTS · "+q.requires.join(" · "))+"</small></article>"}).join("");
 panel.hidden=false;
}
function terminalChoices(){const s=state();const board=document.getElementById("quest-board");const panel=document.getElementById("world-quests");if(!board||!panel)return;const choices=[["LISTEN","Follow the audio pattern.","query:trace-audio"],["TRACE","Map the signal as a path.","query:trace"],["OPEN","Expose the archive layer.","query:trace-archive"]];board.innerHTML="<article class=\"world-quest ready\"><span>GREEN TERMINAL</span><h3>CHOOSE A METHOD</h3><p>The terminal does not tell you which interpretation is correct.</p><div class=\"terminal-choice-list\">"+choices.map(x=>"<button type=\"button\" data-terminal-choice=\""+x[2]+"\"><strong>"+x[0]+"</strong><small>"+x[1]+"</small></button>").join("")+"</div></article>";panel.hidden=false;board.querySelectorAll("[data-terminal-choice]").forEach(b=>b.addEventListener("click",()=>{const q=b.dataset.terminalChoice;s.world_unlocks=Array.isArray(s.world_unlocks)?s.world_unlocks:[];if(!s.world_unlocks.includes(q)){s.world_unlocks.push(q);s.signals=(Number(s.signals)||0)+1}s.terminal_choice=q;save(s);panel.hidden=true;say("TERMINAL · "+q.replace("query:","").toUpperCase()+" SELECTED · +1 SIGNAL");render()}))}
function inventory(){grantQuestRewards();const s=state(),inv=Array.isArray(s.inventory)?s.inventory:[],eq=window.ESCIE_WORLD_EQUIPMENT?.describe?.();const gear=eq?(" · HAND "+(eq.equipped.hand?.label||"NONE")+" · BODY "+(eq.equipped.body?.label||"NONE")):"";say((inv.length?"INVENTORY · "+inv.join(" · "):"INVENTORY EMPTY")+gear);return eq}
function investigation(){const s=state(),d=Array.isArray(s.discoveries)?s.discoveries:[],u=Array.isArray(s.unresolved)?s.unresolved:[],w=Array.isArray(s.world_unlocks)?s.world_unlocks:[],inv=Array.isArray(s.inventory)?s.inventory:[];const board=document.getElementById("investigation-board"),panel=document.getElementById("world-investigation");const nodes=[["CAMERA",d.includes("game-discovery-camera"),"query:camera"],["BABY SHOE",d.includes("game-discovery-shoe"),"query:shoe"],["WITNESS",d.includes("game-discovery-witness"),"query:witness"],["TELEVISION",d.includes("game-discovery-tv"),"query:television"],["VHS TAPE",d.includes("game-discovery-tape"),"query:tape"],["SIGNAL TRAIL",d.includes("game-discovery-trail"),"query:trail"],["SIGNAL KEY",inv.includes("game-item-signal-key"),"query:key"],["ROOM 01",w.includes("query:archive"),"query:archive"]];const links=[["CAMERA","TELEVISION","Both are observation/recording devices; the game places them in the same evidence chain."],["TELEVISION","VHS TAPE","The television produces the audio clue; the tape carries a dated recording. That makes a media trail worth examining."],["VHS TAPE","ROOM 01","The tape is found in Room 01, so the physical location and the object are directly connected."],["BABY SHOE","WITNESS","The shoe is a childhood object while the Witness points toward memory and pattern. The connection is thematic, not proof."],["WITNESS","SIGNAL KEY","The Witness points you toward the thing that responds to the distortion; the Signal Key is the games response to that instruction."],["SIGNAL KEY","ROOM 01","The key is required to open the door into Room 01. This is a game-state connection, not evidence of who made either object."],["SIGNAL TRAIL","CAMERA","The signal trail and camera occupy the same wider lane investigation; the game invites you to compare them."]];const explain=(l)=>{const a=l[0],b=l[1],found=nodes.filter(n=>n[0]===a||n[0]===b).every(n=>n[1]);return `<button class="investigation-link ${found?"active":""}" type="button" data-link-a="${a}" data-link-b="${b}"><span>${a}</span><b>↔</b><span>${b}</span><small>${found?"EXAMINE CONNECTION":"LOCKED · FIND BOTH"}</small></button>`};const details={CAMERA:["OBSERVATION","A camera watches the lane. Its lens is pointed somewhere specific.","DISCOVERY: surveillance thread unlocked. Question: what was being recorded, and why?"],["BABY SHOE"]:["OBJECT","A small shoe sits near the curb. Meaning unresolved.","DISCOVERY: childhood thread unlocked. Question: is the meaning personal, symbolic, or simply coincidental?"],WITNESS:["PERSON","Someone who stayed long enough to notice a pattern. The Witness warns against confusing discovery with proof.","DISCOVERY: witness/key thread unlocked. Question: is the Witness reliable, symbolic, or another layer of the investigation?"],TELEVISION:["RECORDING","The television has no picture. Its audio is a low recording of street noise.","DISCOVERY: audio thread unlocked. Question: what does the recording actually establish?"],["VHS TAPE"]:["OBJECT / RECORDING","A VHS tape marked only with a date. No name.","DISCOVERY: archive thread unlocked. Question: whose recording is this, and what does the date mean?"],["SIGNAL TRAIL"]:["ANOMALY","The distortion is strongest here. Something continues beyond the street.","DISCOVERY: path/distortion thread unlocked. Question: is the signal a thing, a pattern, or an interpretation?"],["SIGNAL KEY"]:["GAME OBJECT","The key responds to the distortion and opens the route into Room 01.","GAME-STATE CONNECTION: required for the door. This does not prove an origin story."],["ROOM 01"]:["LOCATION","An unknown address reached through the locked door.","GAME-STATE CONNECTION: the room links the key, television, tape, and archive thread."]};board.innerHTML=nodes.map(n=>`<article class="investigation-node ${n[1]?"found":"unknown"}" data-query="${n[2]}"><span>${n[1]?"FOUND":"UNKNOWN"}</span><strong>${n[0]}</strong><small>${n[1]?"THREAD CONNECTED":"NO CONFIRMED CONNECTION"}</small></article>`).join("")+`<div class="investigation-links">${links.map(explain).join("")}</div><div id="investigation-detail" class="investigation-detail" hidden></div>`;board.querySelectorAll(".investigation-node.found").forEach(n=>n.addEventListener("click",()=>{const key=n.querySelector("strong").textContent,detail=document.getElementById("investigation-detail"),d=details[key];if(!d)return;detail.hidden=false;detail.innerHTML="<span>"+d[0]+"</span><strong>"+key+"</strong><p>"+d[1]+"</p><small>"+d[2]+"</small>";detail.scrollIntoView({behavior:"smooth",block:"nearest"})}));board.querySelectorAll(".investigation-link").forEach((b,i)=>b.addEventListener("click",()=>{const l=links[i],detail=document.getElementById("investigation-detail");detail.hidden=false;if(!b.classList.contains("active")){detail.innerHTML="<strong>CONNECTION LOCKED</strong><p>Find both pieces of the thread before drawing a conclusion.</p>";return}detail.innerHTML="<span>WHY THIS CONNECTION APPEARS</span><strong>"+l[0]+" ↔ "+l[1]+"</strong><p>"+l[2]+"</p><small>CONNECTED IN THE GAME · NOT CONFIRMED AS CANONICAL PROOF</small>";}));if(u.length){board.insertAdjacentHTML("beforeend",`<article class="investigation-node unresolved"><span>UNRESOLVED</span><strong>${u.join(" · ").toUpperCase()}</strong><small>DO NOT ASSUME · INVESTIGATE</small></article>`)}panel.hidden=false}
function glass(){const s=state();say("GLASS EYE · "+(s.discoveries||[]).length+" DISCOVERIES · "+(s.unresolved||[]).length+" UNRESOLVED · "+(s.world_unlocks||[]).length+" WORLD THREADS")}
const CONTROL_SCHEMES={
  AUTO:{label:"AUTO",primary:"INTERACT",secondary:"OPEN",movement:"LEFT",actions:"RIGHT"},
  TOUCH:{label:"TOUCH",primary:"INTERACT",secondary:"OPEN",movement:"LEFT",actions:"RIGHT"},
  KEYBOARD:{label:"KEYBOARD",primary:"INTERACT",secondary:"OPEN",movement:"WASD",actions:"E/Q/F"},
  GAMEPAD:{label:"GAMEPAD",primary:"INTERACT",secondary:"OPEN",movement:"LEFT STICK",actions:"FACE BUTTONS"}
};
function controlScheme(){try{return localStorage.getItem("escie_world_control_scheme_v1")||"AUTO"}catch(e){return "AUTO"}}
function setControlScheme(v){try{localStorage.setItem("escie_world_control_scheme_v1",String(v||"AUTO").toUpperCase())}catch(e){}}
function performControlAction(type){
 const sim=window.ESCIE_WORLD_SIMULATION,s=sim?.state?.();if(!sim||!s)return;
 const t=String(type||"").toUpperCase();
 if(t==="SPRINT"){const s=state();sim.advance?.(1);say("SPRINT · MOVEMENT SPEED INCREASED · "+Number(s.energy??0)+" ENERGY");return}
 if(t==="OPEN"){const v=window.ESCIE_WORLD_VEHICLES;const s=state();if(v&&s.transport==="CAR"&&v.state().current){const radio=v.radio();say(radio.ok?("RADIO · "+radio.line):"CAR · NO RADIO");return}interactNow();return}
 if(t==="STEAL"){const target=npcs.find(n=>Math.abs(n.x-pos.x)<=1&&Math.abs(n.y-pos.y)<=1);if(!target){say("STEAL · NO VALID TARGET");return}const r=sim.steal?.("npc:"+target.id,false);say(r?.ok===false?"STEAL · FAILED":"STEAL · ACTION TAKEN · NO WITNESS");return}
 if(t==="FIGHT"){const target=npcs.find(n=>Math.abs(n.x-pos.x)<=1&&Math.abs(n.y-pos.y)<=1);if(!target){say("FIGHT · NO VALID TARGET");return}const attack=sim.combatAttack?.(target.id,{weapon:"FIST"});if(attack?.reason==="EXHAUSTED"){say("FIGHT · TOO EXHAUSTED");return}if(!attack?.ok){say("FIGHT · "+String(attack?.reason||"FAILED"));return}window.ESCIE_WORLD_NPC?.relationship?.(target.id,-8,"FIGHT");if(attack.target?.down){say("TARGET DOWN · CONSEQUENCE REGISTERED");}else{const retaliation=Math.max(2,Math.min(12,Math.round((100-(attack.target?.health??100))/12)));const hit=sim.applyDamage?.(retaliation,"NPC_RETALIATION");if(hit?.dead){const r=sim.respawn?.();say(r?.ok?"YOU DIED · RESPAWNED · 06:00 · PARC-EXTENSION":"YOU DIED · NO RESPAWN");return}if(hit?.hospital){say("SERIOUS INJURY · HOSPITAL REQUIRED");return}say("FIGHT · TARGET HP "+Number(attack.target?.health??0)+" · YOUR HP "+Number(hit?.state?.health??0));}return}
}
function key(e){if(["INPUT","TEXTAREA"].includes(e.target.tagName))return;const k=e.key.toLowerCase();if(k==="arrowup"||k==="w")move(0,-1);else if(k==="arrowdown"||k==="s")move(0,1);else if(k==="arrowleft"||k==="a")move(-1,0);else if(k==="arrowright"||k==="d")move(1,0);else if(k==="enter"||k===" ")interactNow();else if(k==="i")inventory();else if(k==="g")glass();else if(k==="escape"&&room==="room01")leaveRoom();else if(dialogue&&["1","2","3"].includes(k))chooseDialogue(Number(k)-1)}
document.addEventListener("keydown",key);
document.querySelectorAll("[data-dir]").forEach(b=>b.addEventListener("click",()=>{const d=b.dataset.dir;move(d==="left"?-1:d==="right"?1:0,d==="up"?-1:d==="down"?1:0)}));
document.querySelectorAll("[data-control-action]").forEach(b=>b.addEventListener("click",()=>performControlAction(b.dataset.controlAction)));
document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",interactNow));
document.querySelector("[data-inventory]").addEventListener("click",inventory);
document.querySelector("[data-glass]").addEventListener("click",glass);document.querySelector("[data-investigation]").addEventListener("click",investigation);document.querySelector("[data-close-investigation]").addEventListener("click",()=>{document.getElementById("world-investigation").hidden=true});document.querySelector("[data-market]").addEventListener("click",market);document.querySelector("[data-close-quests]").addEventListener("click",()=>{document.getElementById("world-quests").hidden=true});document.querySelector("[data-quests]").addEventListener("click",()=>{grantQuestRewards();quests()});document.querySelector("[data-close-market]").addEventListener("click",()=>{document.getElementById("world-market").hidden=true});
function poll(){try{const p=Array.from(navigator.getGamepads?navigator.getGamepads():[]).find(Boolean);if(p){const a=i=>!!(p.buttons[i]&&p.buttons[i].pressed),x=p.axes[0]||0,y=p.axes[1]||0,l=x<-.65,r=x>.65,u=y<-.65,d=y>.65;if((l&&!gamepadPrev.l)||(r&&!gamepadPrev.r))move(r?1:-1,0);if((u&&!gamepadPrev.u)||(d&&!gamepadPrev.d))move(0,d?1:-1);if(a(0)&&!gamepadPrev.a)interactNow();if(a(1)&&!gamepadPrev.b)glass();gamepadPrev={l,r,u,d,a:a(0),b:a(1)}}}catch(e){}requestAnimationFrame(poll)}
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
     b.onclick=()=>{const cur=state();if(Number(cur.signals||0)<it.price){say("NOT ENOUGH SIGNAL.");return}const registry=window.ESCIE_GAME_REGISTRY;const item=registry&&registry.gameItem?registry.gameItem({id:it.id,type:"game_item",title:it.title,description:it.description,price:it.price,price_type:"EARNED",currency:it.currency,availability:"AVAILABLE"}):null;if(registry&&item&&registry.acquireGameItem){const economy={balances:{SIGNAL:Number(cur.signals||0)},owned:Array.isArray(cur.inventory)?cur.inventory.filter(Boolean):[],purchases:[]};const result=registry.acquireGameItem(economy,item,{timestamp:new Date().toISOString()});if(!result.ok){say("PURCHASE FAILED · "+result.reason.toUpperCase());return}cur.signals=Number(result.economy.balances.SIGNAL||0);cur.inventory=result.economy.owned.slice();cur.purchases=Array.isArray(cur.purchases)?cur.purchases:[];cur.purchases.push({item_id:it.id,currency:it.currency,price:it.price,timestamp:new Date().toISOString(),engine:"ESCIE_GAME_REGISTRY"});}else{cur.signals=Number(cur.signals||0)-it.price;cur.inventory=Array.isArray(cur.inventory)?cur.inventory:[];if(!cur.inventory.includes(it.id))cur.inventory.push(it.id);cur.purchases=Array.isArray(cur.purchases)?cur.purchases:[];cur.purchases.push({item_id:it.id,currency:it.currency,price:it.price,timestamp:new Date().toISOString(),engine:"LOCAL_FALLBACK"});}save(cur);say("PURCHASE COMPLETE · "+it.title);market();render()};
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
function prefs(){try{return JSON.parse(localStorage.getItem(PREF_KEY)||"{}")}catch(e){return {}}}
function savePrefs(p){try{localStorage.setItem(PREF_KEY,JSON.stringify(p))}catch(e){}}
function applyPrefs(){const p=prefs();document.body.dataset.worldMotion=p.motion||"full";document.body.dataset.worldGraphics=p.graphics||"standard";document.body.dataset.worldText=p.text||"standard";if(p.controls){try{localStorage.setItem("escie_world_control_mode",p.controls)}catch(e){}}if(p.display==="handheld"&&typeof setHandheld==="function")setHandheld(true);else if(p.display==="device"&&typeof deviceMode==="function")deviceMode();if(p.orientation==="landscape"&&screen.orientation?.lock)screen.orientation.lock("landscape").catch(()=>{});if(p.orientation==="portrait"&&screen.orientation?.lock)screen.orientation.lock("portrait").catch(()=>{});}
function feedback(kind){const p=prefs();if(p.vibration==="off")return;if(kind==="select"||kind==="discover"){try{navigator.vibrate?.(kind==="discover"?[18,25,28]:10)}catch(e){}}}
const PROFILE_KEY="escie_world_profile_v1";
function getProfile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||"null")}catch(e){return null}}
function ensureProfile(){let p=getProfile();if(!p){p={id:(window.ESCIE_GAME_GATEWAY?.getMemory?.()?.player_id)||("player-"+Math.random().toString(36).slice(2,10)),name:"PLAYER",created_at:new Date().toISOString()};try{localStorage.setItem(PROFILE_KEY,JSON.stringify(p))}catch(e){}}return p}
function profileMenu(){let el=document.getElementById("world-profile");if(!el){el=document.createElement("section");el.id="world-profile";el.className="world-profile";el.hidden=true;el.innerHTML='<div class="profile-panel" role="dialog" aria-modal="true" aria-label="Player profile"><span class="world-kicker">PLAYER SYSTEM</span><h2>PROFILE</h2><div class="profile-id" data-profile-id></div><div class="profile-form"><label for="world-player-name">DISPLAY NAME</label><input id="world-player-name" maxlength="24" autocomplete="nickname" spellcheck="false" value="PLAYER"></div><div class="profile-actions"><button data-profile-save>SAVE PROFILE</button><button data-profile-close>CLOSE</button></div></div>';document.body.appendChild(el);el.querySelector("[data-profile-close]").onclick=()=>el.hidden=true;el.querySelector("[data-profile-save]").onclick=()=>{const p=ensureProfile();function syncMainSitePlayerProfile(){try{const p=JSON.parse(localStorage.getItem("escie_world_profile_v1")||"null");if(!p)return;localStorage.setItem("escie_active_player_v1",JSON.stringify({id:p.id,name:p.name||"PLAYER",source:"THE_WORLD",updated_at:new Date().toISOString()}))}catch(e){}}
syncMainSitePlayerProfile();
p.name=(el.querySelector("#world-player-name").value||"PLAYER").trim().slice(0,24)||"PLAYER";p.updated_at=new Date().toISOString();localStorage.setItem(PROFILE_KEY,JSON.stringify(p));el.hidden=true;say?.("PROFILE SAVED.");saveWorldState?.()}}const p=ensureProfile();el.querySelector("[data-profile-id]").textContent="PLAYER ID · "+p.id;el.querySelector("#world-player-name").value=p.name||"PLAYER";el.hidden=false;el.querySelector("#world-player-name")?.focus()}
document.querySelector("[data-profile]")?.addEventListener("click",profileMenu);
ensureProfile();
const SAVE_KEY="escie_world_save_v1";
function saveIndicator(msg="GAME SAVED"){let el=document.getElementById("world-save-indicator");if(!el){el=document.createElement("div");el.id="world-save-indicator";el.className="world-save-indicator";document.body.appendChild(el)}el.textContent=msg;el.classList.add("visible");clearTimeout(window.__saveTimer);window.__saveTimer=setTimeout(()=>el.classList.remove("visible"),1400)}
function saveWorldState(){try{const raw=localStorage.getItem("escie_game_state_v1");if(raw)localStorage.setItem(SAVE_KEY,raw);saveIndicator()}catch(e){saveIndicator("SAVE FAILED")}}
function loadWorldSave(){try{const raw=localStorage.getItem(SAVE_KEY);if(raw&&!localStorage.getItem("escie_game_state_v1"))localStorage.setItem("escie_game_state_v1",raw)}catch(e){}}
document.addEventListener("visibilitychange",()=>{if(document.hidden)saveWorldState()});
window.addEventListener("pagehide",saveWorldState);
document.querySelector("[data-save]")?.addEventListener("click",saveWorldState);
loadWorldSave();
function systemMenu(){let el=document.getElementById("world-system");if(!el){el=document.createElement("section");el.id="world-system";el.className="world-system";el.hidden=true;el.innerHTML='<div class="system-panel" role="dialog" aria-modal="true" aria-label="World system"><div class="system-head"><div><span class="world-kicker">ESCIE / THE WORLD</span><h2>SYSTEM</h2></div><button class="system-close" data-system-close>CLOSE</button></div><div class="system-grid"><div class="system-card"><strong>STATE</strong><span>LOCAL PLAYER STATE ACTIVE</span></div><div class="system-card"><strong>CANON</strong><span>GAME CANNOT WRITE CANONICAL TRUTH</span></div><div class="system-card"><strong>INPUT</strong><span data-system-input>DETECTING…</span></div><div class="system-card"><strong>DISPLAY</strong><span data-system-display>DETECTING…</span></div><div class="system-card"><strong>SIGNAL</strong><span data-system-signal>0</span></div><div class="system-card"><strong>DISCOVERIES</strong><span data-system-discoveries>0</span></div></div><div class="system-actions"><button data-system-prefs>PREFERENCES</button><button data-system-pause>PAUSE MENU</button><button data-system-reset>RESET LOCAL GAME</button></div></div>';document.body.appendChild(el);el.querySelector("[data-system-close]").onclick=()=>el.hidden=true;el.querySelector("[data-system-prefs]").onclick=()=>{el.hidden=true;preferences()};el.querySelector("[data-system-pause]").onclick=()=>{el.hidden=true;pauseMenu()};el.querySelector("[data-system-reset]").onclick=()=>{if(confirm("Reset local THE WORLD progress?")){localStorage.removeItem("escie_game_state_v1");sessionStorage.removeItem("escie_handheld_mode");location.reload()}}}const s=JSON.parse(localStorage.getItem("escie_game_state_v1")||"{}");el.querySelector("[data-system-input]").textContent=(prefs().controls||"AUTO").toUpperCase();el.querySelector("[data-system-display]").textContent=(prefs().display||"DEVICE").toUpperCase();el.querySelector("[data-system-signal]").textContent=String(s.signals||0);el.querySelector("[data-system-discoveries]").textContent=String((s.discoveries||[]).length);el.hidden=false;el.querySelector("[data-system-close]")?.focus()}
document.querySelector("[data-system]")?.addEventListener("click",systemMenu);
function pauseMenu(){let el=document.getElementById("world-pause");if(!el){el=document.createElement("section");el.id="world-pause";el.className="world-pause";el.hidden=true;el.innerHTML='<div class="pause-panel" role="dialog" aria-modal="true" aria-label="Pause menu"><span class="world-kicker">ESCIE / THE WORLD</span><h2>PAUSED</h2><div class="pause-status">GAME STATE IS LOCAL · CANON REMAINS UNCHANGED</div><div class="pause-actions"><button data-resume>RESUME</button><button data-open-prefs>SETTINGS</button><button data-open-inventory>INVENTORY</button><button data-open-glass>GLASS EYE</button><button data-exit-world>EXIT TO ESCIE</button></div></div>';document.body.appendChild(el);el.querySelector("[data-resume]").onclick=()=>el.hidden=true;el.querySelector("[data-open-prefs]").onclick=()=>{el.hidden=true;preferences()};el.querySelector("[data-open-inventory]").onclick=()=>{el.hidden=true;inventory?.()};el.querySelector("[data-open-glass]").onclick=()=>{el.hidden=true;glass?.()};el.querySelector("[data-exit-world]").onclick=()=>location.href="../"}el.hidden=false;el.querySelector("[data-resume]")?.focus()}
document.querySelector("[data-pause]")?.addEventListener("click",pauseMenu);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!document.getElementById("world-preferences")?.hidden){return}if(e.key==="Escape"&&!document.getElementById("world-pause")?.hidden){return}if(e.key==="Escape")pauseMenu()});
function preferences(){let p=prefs();const panel=document.getElementById("world-preferences");if(!panel){const el=document.createElement("section");el.id="world-preferences";el.className="world-preferences";el.hidden=true;el.innerHTML='<div class="preferences-panel" role="dialog" aria-modal="true" aria-label="World preferences"><div class="preferences-head"><div><span class="world-kicker">SYSTEM</span><h2>PREFERENCES</h2></div><button class="preferences-close" data-close-preferences>CLOSE</button></div><div class="preference-group"><h3>DISPLAY</h3><div class="preference-row"><label>DISPLAY MODE<small>Choose the default presentation.</small></label><select data-pref="display"><option value="device">DEVICE</option><option value="handheld">HANDHELD</option><option value="standard">STANDARD</option></select></div><div class="preference-row"><label>ORIENTATION<small>Landscape is recommended for the game screen.</small></label><select data-pref="orientation"><option value="auto">AUTO</option><option value="landscape">LANDSCAPE</option><option value="portrait">PORTRAIT</option></select></div><div class="preference-row"><label>GRAPHICS<small>Lower effects can improve weaker devices.</small></label><select data-pref="graphics"><option value="standard">STANDARD</option><option value="low">LOW</option><option value="high">HIGH</option></select></div></div><div class="preference-group"><h3>CONTROLS</h3><div class="preference-row"><label>CONTROL STYLE<small>Touch, keyboard, gamepad, or automatic.</small></label><select data-pref="controls"><option value="auto">AUTO</option><option value="touch">TOUCH</option><option value="keyboard">KEYBOARD</option><option value="gamepad">GAMEPAD</option></select></div><div class="preference-row"><label>VIBRATION<small>Use controller/device vibration when supported.</small></label><select data-pref="vibration"><option value="on">ON</option><option value="off">OFF</option></select></div></div><div class="preference-group"><h3>ACCESSIBILITY</h3><div class="preference-row"><label>MOTION<small>Reduce non-essential movement.</small></label><select data-pref="motion"><option value="full">FULL</option><option value="reduced">REDUCED</option></select></div><div class="preference-row"><label>TEXT SIZE<small>Adjust interface readability.</small></label><select data-pref="text"><option value="standard">STANDARD</option><option value="large">LARGE</option></select></div></div><div class="preference-actions"><button data-save-preferences>SAVE PREFERENCES</button><button data-reset-preferences>RESET DEFAULTS</button></div></div>';document.body.appendChild(el)}const box=document.getElementById("world-preferences");box.hidden=false;box.querySelectorAll("[data-pref]").forEach(x=>x.value=p[x.dataset.pref]||x.options[0].value);box.querySelector("[data-close-preferences]").onclick=()=>box.hidden=true;box.querySelector("[data-save-preferences]").onclick=()=>{box.querySelectorAll("[data-pref]").forEach(x=>p[x.dataset.pref]=x.value);savePrefs(p);applyPrefs();box.hidden=true;say("PREFERENCES SAVED.");};box.querySelector("[data-reset-preferences]").onclick=()=>{localStorage.removeItem(PREF_KEY);p={};preferences();say("PREFERENCES RESET.")}}
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
const boot=state();if(boot.world_room==="trace"){room="trace";roomSetup();}else if(boot.world_room==="room02"){room="room02";roomSetup();}else if(boot.world_room==="room01"){room="room01";roomSetup();}drawMap();render();stage.focus();poll();

})();
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
function phoneApp(tab="notifications"){const root=document.getElementById("world-phone"),out=document.getElementById("phone-content");if(!root||!out)return;root.hidden=false;let m={};try{m=JSON.parse(localStorage.getItem("escie_phone_v1")||"{}")}catch(e){};const s=window.ESCIE_WORLD_SIMULATION?.state?.()||{};const contacts=Array.isArray(m.contacts)?m.contacts:[{id:"witness",name:"THE WITNESS"},{id:"unknown",name:"UNKNOWN NUMBER"}];const list=a=>Array.isArray(a)&&a.length?a.map(x=>"<div class='phone-card'>"+String(typeof x==="string"?x:JSON.stringify(x)).replace(/[&<>"]/g,"")+"</div>").join(""):"<p class='phone-empty'>Nothing here yet.</p>";if(tab==="calls")out.innerHTML="<div class='phone-card'><strong>CONTACTS</strong><button data-phone-call='witness'>CALL THE WITNESS</button><button data-phone-call='unknown'>UNKNOWN NUMBER</button></div>"+list(m.calls);else if(tab==="photos")out.innerHTML="<div class='phone-card'><strong>CAMERA</strong><button data-phone-photo>TAKE SNAPSHOT</button></div>"+list(m.photos);else if(tab==="notes")out.innerHTML="<div class='phone-card'><textarea id='phone-note' class='phone-input' rows='5' placeholder='Write a note...'></textarea><button data-phone-save-note>SAVE NOTE</button></div>"+list(m.notes);else if(tab==="messages"){const msgs=Array.isArray(m.messages)?m.messages:[];out.innerHTML="<div class='phone-card'><strong>MESSAGES</strong><p>CONNECTIONS CHANGE WITH THE WORLD.</p></div>"+list(msgs)}else if(tab==="notifications")out.innerHTML="<div class='phone-card'><strong>"+(s.neighbourhood||"PARC-EXTENSION")+" · DAY "+(s.day||1)+" · "+String(s.hour??12).padStart(2,"0")+":"+String(s.minute??0).padStart(2,"0")+"</strong></div>"+list(m.notifications);else if(tab==="qr")out.innerHTML="<div class='phone-card'><strong>QR / SIGNAL</strong><input id='phone-qr-input' class='phone-input' placeholder='ESCIE://...'><button data-phone-qr>PROCESS CODE</button></div>"+list(m.qr);else if(tab==="map"){const routes=window.ESCIE_WORLD_SIMULATION?.transitRoutes||{};const current=String(s.neighbourhood||"PARC-EXTENSION").toUpperCase();const service=window.ESCIE_WORLD_SIMULATION?.transitService;const planner=window.ESCIE_WORLD_SIMULATION?.routePlan;const currentInfo=routes[current]||{};const districts=Object.keys(routes).filter(d=>d!==current);out.innerHTML="<div class='phone-card'><strong>CITY MAP</strong><p>CURRENT · "+current+"</p><p>POSITION · "+Number(s.position?.x??0)+" · "+Number(s.position?.y??0)+"</p><p>TRANSPORT · "+String(s.transport||"FOOT")+"</p><p>MONEY · $"+Number(s.money||0).toFixed(2)+"</p><p>LOCAL METRO · "+(currentInfo.metro||[]).join(", ")+"</p><p>LOCAL BUS · "+(currentInfo.bus||[]).join(", ")+"</p></div><div class='phone-card'><strong>ROUTE PREVIEW</strong><small>SELECT A DESTINATION TO SEE THE ACTUAL WALK + TRANSIT COST BEFORE TRAVEL.</small>"+districts.map(d=>{const x=routes[d]||{};const metroOpen=service?service(s,"METRO"):true;const preferred=metroOpen&&Array.isArray(x.lines)&&x.lines.length?"METRO":"BUS";const plan=planner?.(d,preferred)||null;const mode=plan?.mode||preferred;const walk=plan?.walking_minutes??"--";const ride=plan?.minutes??"--";const total=plan?.total_minutes??"--";const fare=Number(plan?.fare??x.baseFare??0).toFixed(2);const status=plan?.ok?"READY":(plan?.reason==="INSUFFICIENT_FUNDS"?"NEED FUNDS":plan?.reason==="SERVICE_CLOSED"?"CLOSED":"UNAVAILABLE");return "<div class='phone-route'><strong>"+d+"</strong><p>WALK "+walk+" MIN → "+mode+" · "+ride+" MIN · TOTAL "+total+" MIN · $"+fare+"</p><small>"+status+" · "+(x.lines||[]).join(" / ")+" · "+(x.metro||[]).slice(0,2).join(", ")+"</small><button data-phone-transit='"+d+"' data-phone-mode='"+mode+"' "+(plan?.ok?"":"disabled")+">"+(plan?.ok?"TRAVEL · "+mode:status)+"</button></div>";}).join("")+"</div>";}else if(tab==="music")out.innerHTML="<div class='phone-card'><strong>MUSIC PLAYER</strong><audio id='phone-audio' class='phone-player' controls></audio><input id='phone-audio-file' type='file' accept='audio/*' multiple><div id='phone-tracks'></div></div>";}
window.addEventListener("escie:npc-relationship",e=>{const d=e.detail||{};if(d.id)relationshipMessage(d.id,d.text||"THE WORLD REMEMBERS.");});
document.addEventListener("click",e=>{
 const tab=e.target.closest("[data-phone-tab]")?.dataset.phoneTab;if(tab)phoneApp(tab);
 if(e.target.closest("[data-phone-open]"))phoneApp("calls");
 if(e.target.closest("[data-phone-close]"))document.getElementById("world-phone").hidden=true;
 if(e.target.closest("[data-phone-save-note]")){const v=document.getElementById("phone-note")?.value.trim();if(v){const m=JSON.parse(localStorage.getItem("escie_phone_v1")||'{"notes":[]}');m.notes=m.notes||[];m.notes.unshift(v.replace(/[<>&"]/g,""));localStorage.setItem("escie_phone_v1",JSON.stringify(m));phoneApp("notes");}}
 const tr=e.target.closest("[data-phone-transit]");if(tr){const d=tr.dataset.phoneTransit;const mode=tr.dataset.phoneMode||"METRO";const sim=window.ESCIE_WORLD_SIMULATION;if(sim?.navigate){const plan=sim.routePlan?.(d,mode);if(!plan?.ok){if(window.ESCIE_PHONE_GAMEPLAY?.notify)window.ESCIE_PHONE_GAMEPLAY.notify("TRANSIT · "+(plan?.reason||"UNAVAILABLE"),"ERROR");phoneApp("map");return}const x=sim.navigate(d,mode);if(window.ESCIE_PHONE_GAMEPLAY?.notify)window.ESCIE_PHONE_GAMEPLAY.notify(x.ok?"ARRIVED · "+d+" · "+x.total_minutes+" MIN":"TRANSIT · "+(x.reason||"UNAVAILABLE"),x.ok?"TRANSIT":"ERROR");phoneApp("map");}}if(e.target.closest("[data-phone-photo]")){const m=JSON.parse(localStorage.getItem("escie_phone_v1")||'{}');m.photos=m.photos||[];m.photos.unshift("PHOTO · "+new Date().toLocaleString());localStorage.setItem("escie_phone_v1",JSON.stringify(m));phoneApp("photos");}
});
document.addEventListener("change",e=>{if(e.target.id==="phone-audio-file"){const box=document.getElementById("phone-tracks");[...e.target.files].forEach(f=>{const u=URL.createObjectURL(f),a=document.createElement("button");a.textContent=f.name;a.onclick=()=>{document.getElementById("phone-audio").src=u;document.getElementById("phone-audio").play();};box.appendChild(a);});}});

window.addEventListener("escie:financial-event",e=>{const d=e.detail||{};if(window.ESCIE_PHONE_GAMEPLAY?.notify)window.ESCIE_PHONE_GAMEPLAY.notify((d.type==="INCOME"?"+$":"-$")+Number(d.amount||0)+" · "+(d.reason||"FINANCE"),"FINANCE");});
(function phoneGameplayBridge(){
 const KEY="escie_phone_v1";
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return {}}};
 const write=x=>localStorage.setItem(KEY,JSON.stringify(x));
 const notify=(text,type="INFO")=>{const m=read();m.notifications=m.notifications||[];m.notifications.unshift({text,type,day:window.ESCIE_WORLD_SIMULATION?.state?.day||1,time:new Date().toLocaleTimeString()});m.notifications=m.notifications.slice(0,50);write(m);};
 const call=(contact,text)=>{const m=read();m.calls=m.calls||[];m.calls.unshift({contact,text,time:new Date().toLocaleTimeString()});m.calls=m.calls.slice(0,50);write(m);notify("CALL · "+contact,"CALL");};
 const message=(contact,text)=>{const m=read();m.messages=m.messages||[];m.messages.unshift({contact,text,day:window.ESCIE_WORLD_SIMULATION?.state?.().day||1,time:new Date().toLocaleTimeString(),unread:true});m.messages=m.messages.slice(0,100);write(m);notify("MESSAGE · "+contact,"MESSAGE");};const relationshipMessage=(id,text)=>{const n=window.ESCIE_WORLD_NPC?.state?.().npcs?.[id]||{};const contact=n.name||id;message(contact,text);};
 window.ESCIE_PHONE_GAMEPLAY={notify,call,message,relationshipMessage};

function processWorldQR(raw){
  const value=String(raw||"").trim(), normalized=value.replace(/^escie:\/\//i,"");
  const parts=normalized.split("/").map(x=>decodeURIComponent(x).trim()).filter(Boolean);
  const kind=String(parts.shift()||"").toUpperCase(), payload=parts.join("/"), sim=window.ESCIE_WORLD_SIMULATION, s=sim?.state?.();
  const allowed=/^[A-Z0-9_ .-]+$/i;
  let m={};try{m=JSON.parse(localStorage.getItem("escie_phone_v1")||"{}")}catch(e){}
  m.qr=Array.isArray(m.qr)?m.qr:[];
  const writeQR=x=>localStorage.setItem("escie_phone_v1",JSON.stringify(x));
  const record={code:value.slice(0,160),day:s?.day||1,time:new Date().toLocaleTimeString(),ok:false};
  const reject=(message)=>{record.message=message;m.qr.unshift(record);m.qr=m.qr.slice(0,50);writeQR(m);return {ok:false,message};};
  if(!/^ESCIE:\/\//i.test(value))return reject("QR · INVALID ESCIE CODE");
  if(!parts.length||!allowed.test(payload))return reject("QR · UNSUPPORTED CODE");
  let message="";
  if(kind==="QUERY"){
    const q="query:"+payload.toLowerCase();
    const state=JSON.parse(localStorage.getItem("escie_game_state_v1")||"{}");
    state.world_unlocks=Array.isArray(state.world_unlocks)?state.world_unlocks:[];
    if(!state.world_unlocks.includes(q))state.world_unlocks.push(q);
    state.signals=(Number(state.signals)||0)+1;
    state.qr_history=(state.qr_history||[]).concat([{query:q,day:s?.day||1}]).slice(-100);
    localStorage.setItem("escie_game_state_v1",JSON.stringify(state));
    window.ESCIE_GAME_REGISTRY?.applyPlayerEvent?.({event:"DISCOVERED",target:"qr:"+q,queries:[q]});
    record.ok=true;message="QR · QUERY UNLOCKED · "+q;
  }else if(kind==="DISCOVER"){
    const id=payload.toLowerCase().startsWith("game-")?payload:"game-discovery-"+payload.toLowerCase().replace(/[^a-z0-9_-]+/g,"-");
    const state=JSON.parse(localStorage.getItem("escie_game_state_v1")||"{}");
    state.discoveries=Array.isArray(state.discoveries)?state.discoveries:[];
    if(!state.discoveries.includes(id))state.discoveries.push(id);
    state.signals=(Number(state.signals)||0)+1;
    localStorage.setItem("escie_game_state_v1",JSON.stringify(state));
    window.ESCIE_GAME_REGISTRY?.applyPlayerEvent?.({event:"DISCOVERED",target:id,queries:["query:"+payload.toLowerCase()]});
    record.ok=true;message="QR · DISCOVERY RECORDED · "+id;
  }else if(kind==="DISTRICT"){
    const d=payload.toUpperCase();
    const known=sim?.districts?.[d];
    if(!known)return reject("QR · UNKNOWN DISTRICT");
    sim.activateDistrict?.(d,"QR");
    record.ok=true;message="QR · DISTRICT ACCESS · "+d;
  }else if(kind==="SIGNAL"){
    const amount=Math.max(1,Math.min(25,Number(payload)));
    if(!Number.isFinite(amount))return reject("QR · INVALID SIGNAL VALUE");
    const state=JSON.parse(localStorage.getItem("escie_game_state_v1")||"{}");
    state.signals=(Number(state.signals)||0)+amount;
    localStorage.setItem("escie_game_state_v1",JSON.stringify(state));
    record.ok=true;message="QR · SIGNAL +"+amount;
  }else{
    return reject("QR · CODE TYPE NOT RECOGNIZED");
  }
  record.message=message;m.qr.unshift(record);m.qr=m.qr.slice(0,50);writeQR(m);return {ok:true,message};
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
 const choice=(id)=>{const sim=window.ESCIE_WORLD_SIMULATION;if(!sim)return;sim.choice?.("DREAM_"+id,"DREAM");const s=sim.state;s.stress=Math.max(0,Number(s.stress)+(id==="FOLLOW"?8:-4));s.sleep=0;localStorage.setItem("escie_world_simulation_v1",JSON.stringify(s));if(window.ESCIE_PHONE_GAMEPLAY?.notify)window.ESCIE_PHONE_GAMEPLAY.notify("DREAM CHOICE · "+id,"DREAM");};
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
 function finish(s){const sim=window.ESCIE_WORLD_SIMULATION;if(sim?.choice)sim.choice("dream:"+s.level.id,s.result||"WAKE",{stress:s.detected?8:-5,health:s.detected?-5:0});window.ESCIE_WORLD_DREAM_STATE=null;const el=q("#dream-play-layer");if(el)el.hidden=true}
 document.addEventListener("escie-dream-play-start",e=>render(e.detail));
 document.addEventListener("escie-dream-complete",e=>{render(e.detail);setTimeout(()=>finish(e.detail),450)});
 document.addEventListener("escie-dream-detected",e=>render(e.detail));
 document.addEventListener("keydown",e=>{const m={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};const v=m[e.key];if(v&&window.ESCIE_WORLD_DREAM_PLAY){e.preventDefault();const s=window.ESCIE_WORLD_DREAM_PLAY.move(...v);if(s)render(s)}});
 document.addEventListener("pointerdown",e=>{const b=e.target.closest("[data-dream-move]");if(!b)return;const v=b.dataset.dreamMove.split(",").map(Number);const s=window.ESCIE_WORLD_DREAM_PLAY?.move(...v);if(s)render(s)});
 window.ESCIE_WORLD_DREAM_RENDER={render};
})();
