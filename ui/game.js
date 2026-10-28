(function(){
"use strict";
const root=typeof window!=="undefined"?window:globalThis;
const KEY="escie_game_state_v1";
const defaults={version:6,control_mode:"AUTO",control_cursor:0,player_id:null,screen:"gateway",scene:"threshold",visited:[],inventory:[],signals:0,entered:false,entry_source:"site",entry_payload:null,discoveries:[],path:[],unresolved:[],world_unlocks:[]};

const scenes=[
 {id:"threshold",label:"THE THRESHOLD",title:"THE FIRST DOOR",text:"You are not entering another universe. You are entering another layer of the same one.",item:null,next:"laneway",signal:1,location:"the-world"},
 {id:"laneway",label:"PARC-EXTENSION",title:"THE LANEWAY",text:"Concrete. Winter air. A camera where there should not be one. Something has been left behind.",item:"game-item-baby-shoe",next:"signal",signal:1,location:"parc-extension",choices:[{id:"observe-camera",label:"WATCH THE CAMERA",discovery:"game-discovery-camera"},{id:"inspect-object",label:"INSPECT THE OBJECT",discovery:"game-item-baby-shoe"}]},
 {id:"signal",label:"THE SIGNAL",title:"FOLLOW THE DISTORTION",text:"The signal is weak, but it is not random. Look closer. Listen longer.",item:"game-item-signal-key",next:"return",signal:1,location:"signal-thread",choices:[{id:"listen",label:"LISTEN LONGER",discovery:"game-discovery-whisper"},{id:"follow",label:"FOLLOW THE DISTORTION",discovery:"game-discovery-trail"}]},
 {id:"return",label:"RETURN",title:"NOTHING STAYS IN THE SCREEN",text:"What you find here can become part of your route through ESCIE. The world remains grounded in reality.",item:null,next:null,signal:0,location:"the-world"}
];

const items=[
 {id:"game-item-baby-shoe",title:"BABY SHOE",description:"A found object. Meaning unresolved.",price_type:"FREE",availability:"AVAILABLE",digital:false},
 {id:"game-item-signal-key",title:"SIGNAL KEY",description:"A digital key that marks a discovered thread.",price_type:"EARNED",price:1,currency:"SIGNAL",availability:"AVAILABLE",digital:true},
 {id:"game-item-green-pass",title:"GREEN PASS",description:"A future access token. Not yet redeemable.",price_type:"EARNED",price:3,currency:"SIGNAL",availability:"LOCKED",digital:true}
];

const discoveries=[
 {id:"game-discovery-camera",title:"CAMERA FRAME",description:"The camera is pointed somewhere specific. The reason is unknown.",unresolved:true,world_queries:["camera","surveillance"]},
 {id:"game-discovery-whisper",title:"UNSTABLE AUDIO",description:"There is a voice beneath the distortion. You cannot yet identify it.",unresolved:true,world_queries:["whisper","audio","voice","signal"]},
 {id:"game-discovery-trail",title:"THE TRAIL",description:"The distortion points beyond the current scene.",unresolved:true,world_queries:["trail","path","signal","distortion"]},
 {id:"game-discovery-shoe",title:"CHILDHOOD OBJECT",description:"The found shoe is now a thread connecting the playable layer to the public world.",unresolved:true,world_queries:["baby shoe","child's shoe","shoe","childhood"]}
];

const aliases={threshold:"threshold",door:"threshold",world:"threshold",enter:"threshold",laneway:"laneway",lane:"laneway",parc:"laneway","parc-extension":"laneway",signal:"signal",distortion:"signal",key:"game-item-signal-key",shoe:"game-item-baby-shoe","baby-shoe":"game-item-baby-shoe",camera:"game-discovery-camera",whisper:"game-discovery-whisper",trail:"game-discovery-trail"};

function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||"null");return Object.assign({},defaults,s||{}, {world_unlocks:Array.isArray(s&&s.world_unlocks)?s.world_unlocks:[]})}catch(e){return Object.assign({},defaults)}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function esc(v){return String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))}
function current(s){return scenes.find(x=>x.id===s.scene)||scenes[0]}
function item(id){return items.find(x=>x.id===id)}
function discovery(id){return discoveries.find(x=>x.id===id)}
function ensurePlayer(s){if(!s.player_id)s.player_id="visitor-"+Math.random().toString(36).slice(2,10);return s}
function unique(a,v){if(v&&!a.includes(v))a.push(v)}
function awardSignal(s,n){s.signals=Math.max(0,Number(s.signals||0)+Number(n||0))}
function memoryEvent(s,type,target,extra){
 const entry={type,target_id:target,timestamp:new Date().toISOString()};s.path.push(entry);s.path=s.path.slice(-500);
 const api=root.ESCIE_GAME_REGISTRY;
 if(api&&typeof api.applyPlayerEvent==="function"){
  const state=api.applyPlayerEvent({player_id:s.player_id,visited_scenes:s.visited,collected:s.inventory,discoveries:s.discoveries,path:s.path},Object.assign({type,target_id:target,scene_id:s.scene},extra||{}));
  s.path=state.path||s.path;s.discoveries=state.discoveries||s.discoveries;s.unresolved=state.unresolved||s.unresolved;
 }
}
function unlockWorldThread(s,id){
 const d=discovery(id);if(!d)return;
 unique(s.discoveries,d.id);
 if(Array.isArray(d.world_queries))d.world_queries.forEach(q=>unique(s.world_unlocks,"query:"+String(q).toLowerCase()));
}
function unlockWorldThread(s,id){const d=discovery(id);if(!d)return;unique(s.discoveries,d.id);if(Array.isArray(d.world_queries))d.world_queries.forEach(q=>unique(s.world_unlocks,"query:"+String(q).toLowerCase()))}
function visit(s,id){
 if(!s.visited.includes(id)){s.visited.push(id);const scene=scenes.find(x=>x.id===id);if(scene&&scene.signal)awardSignal(s,scene.signal);memoryEvent(s,"ENTERED",id,{location_id:scene&&scene.location,signal_id:scene&&scene.signal?"signal-"+id:null})}
}
function getEntry(){
 try{
  const p=new URLSearchParams(location.search);const raw=(p.get("game")||p.get("entry")||"").trim().toLowerCase();const hash=(location.hash||"").replace(/^#/,"").trim().toLowerCase();
  const code=(raw||hash.replace(/^game[/:]?/,"")).replace(/^escie[/:]?/,"");if(!code)return null;const resolved=aliases[code]||code;
  return scenes.some(x=>x.id===resolved)||items.some(x=>x.id===resolved)||discoveries.some(x=>x.id===resolved)?resolved:null;
 }catch(e){return null}
}
function applyEntry(s){
 const code=getEntry();if(!code||s.entry_payload===code)return s;s.entered=true;s.entry_source="link";s.entry_payload=code;
 const targetScene=scenes.find(x=>x.id===code),targetItem=items.find(x=>x.id===code),targetDiscovery=discoveries.find(x=>x.id===code);
 if(targetScene){s.scene=targetScene.id;visit(s,targetScene.id)}
 if(targetItem){unique(s.inventory,targetItem.id);memoryEvent(s,"DISCOVERED",targetItem.id);if(targetItem.id==="game-item-baby-shoe")unlockWorldThread(s,"game-discovery-shoe")}
 if(targetDiscovery){unlockWorldThread(s,targetDiscovery.id);memoryEvent(s,"DISCOVERED",targetDiscovery.id,{unknown:targetDiscovery.unresolved,unresolved:targetDiscovery.unresolved})}
 return s;
}
function collect(s,id){
 if(s.inventory.includes(id))return true;const it=item(id);if(!it||it.availability==="LOCKED")return false;
 if(it.price_type==="EARNED"){if(s.signals<Number(it.price||0))return false;s.signals-=Number(it.price||0)}
 s.inventory.push(id);memoryEvent(s,"COLLECTED",id);if(id==="game-item-baby-shoe")unlockWorldThread(s,"game-discovery-shoe");return true;
}
function choose(s,id){
 const c=current(s),choice=(c.choices||[]).find(x=>x.id===id);if(!choice)return false;
 if(choice.discovery){
  const d=discovery(choice.discovery);
  if(d){unlockWorldThread(s,d.id);memoryEvent(s,"DISCOVERED",choice.discovery,{unknown:!!d.unresolved,unresolved:!!d.unresolved});awardSignal(s,1)}
  else if(choice.discovery==="game-item-baby-shoe")unlockWorldThread(s,"game-discovery-shoe");
 }
 return true;
}
function actionable(el){return Array.from(el.querySelectorAll("[data-game-choice],[data-game-next],[data-game-collect],[data-game-enter],[data-game-inventory],[data-game-reset]"))}
function moveCursor(s,dir,el){const a=actionable(el);if(!a.length)return; s.control_cursor=(Number(s.control_cursor||0)+dir+a.length)%a.length; a.forEach((b,i)=>b.classList.toggle("game-focus",i===s.control_cursor)); save(s)}
function activateCursor(s,el){const a=actionable(el);const b=a[Number(s.control_cursor||0)%Math.max(1,a.length)];if(b)b.click()}
function pollGamepad(){if(root.__ESCIE_GAMEPAD_LOOP)return;root.__ESCIE_GAMEPAD_LOOP=true;let prev={};const tick=()=>{try{const p=Array.from(navigator.getGamepads?navigator.getGamepads():[]).find(Boolean);if(p){const press=i=>!!(p.buttons[i]&&p.buttons[i].pressed);const x=p.axes[0]||0,y=p.axes[1]||0;const left=x<-.65,right=x>.65,up=y<-.65,down=y>.65,a=press(0),b=press(1);const el=document.getElementById("game-container"),s=load();if(el&&controlMode(s)==="GAMEPAD"){if((left&&!prev.left)||(right&&!prev.right))moveCursor(s,right?1:-1,el);if((up&&!prev.up)||(down&&!prev.down))moveCursor(s,down?1:-1,el);if(a&&!prev.a)activateCursor(s,el);if(b&&!prev.b){const r=el.querySelector("[data-game-reset]");if(r)r.focus()}save(s)}prev={left,right,up,down,a,b}}}catch(e){}requestAnimationFrame(tick)};requestAnimationFrame(tick)}
function controlMode(s){return String(s.control_mode||"AUTO").toUpperCase()}
function setControlMode(s,mode){const m=["AUTO","TOUCH","KEYBOARD","GAMEPAD"].includes(String(mode||"").toUpperCase())?String(mode).toUpperCase():"AUTO";s.control_mode=m;save(s);render()}
function gamepadConnected(){try{return !!(navigator.getGamepads&&Array.from(navigator.getGamepads()).some(Boolean))}catch(e){return false}}
function inputPanel(s){const m=controlMode(s);return '<div class="game-input-panel"><div class="game-input-head"><span class="game-kicker">CONTROL LAYER</span><span>'+esc(m)+' · '+(gamepadConnected()?"BLUETOOTH GAMEPAD DETECTED":"TOUCH / KEYBOARD READY")+'</span></div><div class="game-input-modes">'+["AUTO","TOUCH","KEYBOARD","GAMEPAD"].map(x=>'<button type="button" class="'+(m===x?"active":"")+'" data-game-mode="'+x+'">'+x+'</button>').join("")+'</div><div class="game-input-help">'+(m==="GAMEPAD"?"A / CROSS = SELECT · B / CIRCLE = BACK · DPAD / STICK = MOVE":m==="KEYBOARD"?"ENTER / SPACE = SELECT · ESC = BACK · ARROWS / WASD = MOVE":"ON-SCREEN CONTROLS AVAILABLE · TAP TO SELECT")+'</div><div class="game-virtual-controls"><button type="button" data-game-nav="up">▲</button><div><button type="button" data-game-nav="left">◀</button><button type="button" data-game-action>●</button><button type="button" data-game-nav="right">▶</button></div><button type="button" data-game-nav="down">▼</button></div></div>'}
function render(){
 const el=document.getElementById("game-container");if(!el)return;let s=ensurePlayer(load());s=applyEntry(s);const c=current(s);save(s);
 if(!s.entered){
  el.innerHTML=`<div class="game-gateway game-entry-gateway"><div class="game-gateway-head"><span class="game-kicker">ESCIE / THE WORLD</span><span class="game-status">SIGNAL DETECTED</span></div><div class="game-entry-main"><span class="game-kicker">THE GLASS EYE</span><h3>YOU ARE ALREADY HERE.</h3><p>This is not a separate world. It is another layer of the same one. Enter when you are ready.</p><div class="game-entry-route"><span>ESCIE</span><i>→</i><span>THE WORLD</span><i>→</i><strong>THE SIGNAL</strong></div><button type="button" class="game-enter-button" data-game-enter>ENTER THE WORLD</button></div></div>`;
  const b=el.querySelector("[data-game-enter]");if(b)b.onclick=()=>{s.entered=true;visit(s,"threshold");save(s);render()};return;
 }
 const inv=s.inventory.map(item).filter(Boolean),found=c.item?item(c.item):null;
 const choices=(c.choices||[]).map(x=>'<button type="button" data-game-choice="'+esc(x.id)+'">'+esc(x.label)+'</button>').join("");
 const foundMarkup=found?'<div class="game-discovery"><span class="game-kicker">OBJECT IN FRAME</span><strong>'+esc(found.title)+'</strong><small>'+esc(found.description)+'</small><button type="button" data-game-collect="'+esc(found.id)+'">'+(s.inventory.includes(found.id)?"COLLECTED":"TAKE IT")+'</button></div>':"";
 const choiceMarkup=choices?'<div class="game-choices"><span class="game-kicker">WHAT DO YOU DO?</span>'+choices+'</div>':"";
 const discovered=s.discoveries.map(discovery).filter(Boolean);
 const controls=inputPanel(s);const memory=discovered.length?'<div class="game-memory"><span class="game-kicker">GLASS EYE / DISCOVERIES</span>'+discovered.map(d=>'<span>'+esc(d.title)+'</span>').join("")+'</div>':"";
 el.innerHTML='<div class="game-gateway"><div class="game-gateway-head"><span class="game-kicker">ESCIE / PLAYABLE LAYER</span><span class="game-status">LOCAL PLAYER STATE</span></div><div class="game-gateway-main"><div class="game-signal-mark" aria-hidden="true"><span></span></div><div class="game-copy"><span class="game-kicker">'+esc(c.label)+'</span><h3>'+esc(c.title)+'</h3><p>'+esc(c.text)+'</p>'+foundMarkup+choiceMarkup+memory+'<div class="game-actions">'+(c.next?'<button type="button" data-game-next>CONTINUE →</button>':'<button type="button" data-game-reset>RESTART EXPERIENCE</button>')+'<button type="button" data-game-inventory>INVENTORY ('+inv.length+')</button></div></div></div>'+controls+'<div class="game-progress"><span>'+esc(String(s.visited.length))+' LOCATIONS VISITED</span><span>'+esc(String(s.signals))+' SIGNAL</span><span>'+esc(String(inv.length))+' ITEMS</span></div></div>';
 bind(el,s);
}
function bind(el,s){
 el.querySelectorAll("[data-game-mode]").forEach(b=>b.onclick=()=>setControlMode(s,b.dataset.gameMode));
 el.querySelectorAll("[data-game-action]").forEach(b=>b.onclick=()=>{const x=el.querySelector("[data-game-next], [data-game-collect], [data-game-choice], [data-game-enter]");if(x)x.click()});
 el.querySelectorAll("[data-game-nav]").forEach(b=>b.onclick=()=>{b.classList.add("pressed");setTimeout(()=>b.classList.remove("pressed"),120)});
 el.querySelectorAll("[data-game-next]").forEach(b=>b.onclick=()=>{const c=current(s);if(c.next){s.scene=c.next;visit(s,s.scene);save(s);render()}});
 el.querySelectorAll("[data-game-collect]").forEach(b=>b.onclick=()=>{const ok=collect(s,b.dataset.gameCollect);if(ok){save(s);render()}else{b.textContent="NEED MORE SIGNAL"}});
 el.querySelectorAll("[data-game-choice]").forEach(b=>b.onclick=()=>{choose(s,b.dataset.gameChoice);save(s);render()});
 el.querySelectorAll("[data-game-reset]").forEach(b=>b.onclick=()=>{localStorage.removeItem(KEY);render()});
 el.querySelectorAll("[data-game-inventory]").forEach(b=>b.onclick=()=>{const inv=s.inventory.map(item).filter(Boolean);alert(inv.length?inv.map(x=>x.title).join("\n"):"INVENTORY EMPTY")});
}
pollGamepad();
if(!root.__ESCIE_GAME_INPUT_BOUND){document.addEventListener("keydown",e=>{if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement&&document.activeElement.tagName))return;if(e.key==="ArrowDown"||e.key==="ArrowRight"||e.key==="s"||e.key==="d"){const el=document.getElementById("game-container"),s=load();moveCursor(s,1,el)}else if(e.key==="ArrowUp"||e.key==="ArrowLeft"||e.key==="w"||e.key==="a"){const el=document.getElementById("game-container"),s=load();moveCursor(s,-1,el)}else if(e.key==="Enter"||e.key===" "){const el=document.getElementById("game-container"),s=load();activateCursor(s,el)}});root.__ESCIE_GAME_INPUT_BOUND=true}
function init(){const el=document.getElementById("game-container");if(!el)return;const s=load();ensurePlayer(s);save(s);render()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();

root.ESCIE_GAME_GATEWAY={
 version:"1.4.0",scenes,items,discoveries,
 enter(){const s=ensurePlayer(load());s.entered=true;visit(s,"threshold");save(s);render();return true},
 route(code){const resolved=aliases[String(code||"").trim().toLowerCase()]||String(code||"").trim().toLowerCase();if(!scenes.some(x=>x.id===resolved)&&!items.some(x=>x.id===resolved)&&!discoveries.some(x=>x.id===resolved))return false;history.replaceState(null,"","?game="+encodeURIComponent(resolved));const s=ensurePlayer(load());s.entered=true;s.entry_source="api";s.entry_payload=resolved;if(scenes.some(x=>x.id===resolved)){s.scene=resolved;visit(s,resolved)}else if(items.some(x=>x.id===resolved)){unique(s.inventory,resolved);if(resolved==="game-item-baby-shoe")unlockWorldThread(s,"game-discovery-shoe")}else {unlockWorldThread(s,resolved);memoryEvent(s,"DISCOVERED",resolved)}save(s);render();return true},
 discover(id){const s=ensurePlayer(load()),d=discovery(id);if(!d)return false;unlockWorldThread(s,d.id);memoryEvent(s,"DISCOVERED",d.id,{unknown:d.unresolved,unresolved:d.unresolved});awardSignal(s,1);save(s);render();return true},
 reset(){localStorage.removeItem(KEY);render()},
 getState(){return load()},
 getMemory(){const s=load();return {player_id:s.player_id,visited:s.visited.slice(),inventory:s.inventory.slice(),signals:s.signals,discoveries:s.discoveries.slice(),path:s.path.slice(),unresolved:s.unresolved.slice(),world_unlocks:s.world_unlocks.slice()}},
 getWorldUnlocks(){const s=load();return s.world_unlocks.slice()}
};
})();