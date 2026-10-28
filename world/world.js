(function(){
"use strict";
const KEY="escie_game_state_v1";
const W=12,H=8;
const start={x:2,y:6};
const objects=[
{id:"camera",x:9,y:2,label:"CAMERA",text:"A camera watches the lane. Its lens is pointed somewhere specific.",discovery:"game-discovery-camera"},
{id:"shoe",x:5,y:4,label:"BABY SHOE",text:"A small shoe sits near the curb. Meaning unresolved.",discovery:"game-discovery-shoe"},
{id:"signal",x:10,y:6,label:"SIGNAL",text:"The distortion is strongest here.",discovery:"game-discovery-trail"}
];
let pos={...start},target=null,gamepadPrev={};
const stage=document.getElementById("world-stage"),player=document.getElementById("world-player"),map=document.getElementById("world-map"),log=document.getElementById("world-log"),interact=document.getElementById("world-interact");
function state(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return {}}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function say(t){log.textContent=t}
function render(){
 player.style.left=((pos.x+.5)/W*100)+"%";player.style.top=((pos.y+.5)/H*100)+"%";
 target=objects.find(o=>Math.abs(o.x-pos.x)<=1&&Math.abs(o.y-pos.y)<=1)||null;
 if(target){interact.hidden=false;interact.textContent="● "+target.label;interact.style.left=((target.x+.5)/W*100)+"%";interact.style.top=((target.y+.5)/H*100)+"%"}else interact.hidden=true;
 const s=state();document.getElementById("world-coordinates").textContent=String(pos.x).padStart(2,"0")+" · "+String(pos.y).padStart(2,"0");document.getElementById("world-signal").textContent=(Number(s.signals)||0)+" SIGNAL";
}
function move(dx,dy){const nx=Math.max(0,Math.min(W-1,pos.x+dx)),ny=Math.max(0,Math.min(H-1,pos.y+dy));if(nx===pos.x&&ny===pos.y)return;say("You move through the lane. The environment is listening.");pos={x:nx,y:ny};render()}
function discover(id){
 const s=state();s.discoveries=Array.isArray(s.discoveries)?s.discoveries:[];s.world_unlocks=Array.isArray(s.world_unlocks)?s.world_unlocks:[];
 if(!s.discoveries.includes(id))s.discoveries.push(id);
 const q={camera:["query:camera","query:surveillance"],"shoe":["query:baby shoe","query:shoe","query:childhood"],signal:["query:trail","query:path","query:signal","query:distortion"]};
 (q[id]||[]).forEach(x=>{if(!s.world_unlocks.includes(x))s.world_unlocks.push(x)});
 s.signals=(Number(s.signals)||0)+1;s.entered=true;s.entry_source="world";save(s);
}
function interactNow(){
 if(!target){say("Nothing close enough to touch. Move toward an object.");return}
 say(target.text);discover(target.discovery);render()
}
function inventory(){const s=state();const inv=Array.isArray(s.inventory)?s.inventory:[];say(inv.length?"INVENTORY · "+inv.join(" · "):"INVENTORY EMPTY")}
function glass(){const s=state();say("GLASS EYE · "+(s.discoveries||[]).length+" DISCOVERIES · "+(s.unresolved||[]).length+" UNRESOLVED")}
function key(e){if(["INPUT","TEXTAREA"].includes(e.target.tagName))return;const k=e.key.toLowerCase();if(k==="arrowup"||k==="w")move(0,-1);else if(k==="arrowdown"||k==="s")move(0,1);else if(k==="arrowleft"||k==="a")move(-1,0);else if(k==="arrowright"||k==="d")move(1,0);else if(k==="enter"||k===" ")interactNow();else if(k==="i")inventory();else if(k==="g")glass()}
document.addEventListener("keydown",key);
document.querySelectorAll("[data-dir]").forEach(b=>b.addEventListener("click",()=>{const d=b.dataset.dir;move(d==="left"?-1:d==="right"?1:0,d==="up"?-1:d==="down"?1:0)}));
document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",interactNow));
document.querySelector("[data-inventory]").addEventListener("click",inventory);
document.querySelector("[data-glass]").addEventListener("click",glass);
function poll(){try{const p=Array.from(navigator.getGamepads?navigator.getGamepads():[]).find(Boolean);if(p){const a=i=>!!(p.buttons[i]&&p.buttons[i].pressed),x=p.axes[0]||0,y=p.axes[1]||0;const l=x<-.65,r=x>.65,u=y<-.65,d=y>.65;if((l&&!gamepadPrev.l)||(r&&!gamepadPrev.r))move(r?1:-1,0);if((u&&!gamepadPrev.u)||(d&&!gamepadPrev.d))move(0,d?1:-1);if(a(0)&&!gamepadPrev.a)interactNow();if(a(1)&&!gamepadPrev.b)glass();gamepadPrev={l,r,u,d,a:a(0),b:a(1)}}}catch(e){}requestAnimationFrame(poll)}
render();stage.focus();poll();
})();