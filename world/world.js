(function(){
"use strict";
const KEY="escie_game_state_v1",W=16,H=10,start={x:2,y:7};
const objects=[
{id:"camera",x:12,y:2,label:"CAMERA",text:"A camera watches the lane. Its lens is pointed somewhere specific.",discovery:"game-discovery-camera",queries:["query:camera","query:surveillance"]},
{id:"shoe",x:6,y:5,label:"BABY SHOE",text:"A small shoe sits near the curb. Meaning unresolved.",discovery:"game-discovery-shoe",queries:["query:baby shoe","query:shoe","query:childhood"],item:"game-item-baby-shoe"},
{id:"signal",x:13,y:7,label:"SIGNAL",text:"The distortion is strongest here. Something continues beyond this street.",discovery:"game-discovery-trail",queries:["query:trail","query:path","query:signal","query:distortion"]},
{id:"door",x:3,y:2,label:"DOOR",text:"Locked. Behind it: fluorescent light and something that sounds like a television.",discovery:null},
{id:"chair",x:9,y:7,label:"CHAIR",text:"An empty chair faces the wall. There is nothing on it.",discovery:null}
];
const walls=new Set(["0,0","1,0","2,0","3,0","4,0","5,0","6,0","7,0","8,0","9,0","10,0","11,0","12,0","13,0","14,0","15,0","0,1","15,1","0,2","15,2","0,3","4,3","5,3","15,3","0,4","4,4","5,4","15,4","0,5","4,5","15,5","0,6","15,6","0,7","15,7","0,8","15,8","0,9","1,9","2,9","3,9","4,9","5,9","6,9","7,9","8,9","9,9","10,9","11,9","12,9","13,9","14,9","15,9"]);
let pos={...start},target=null,gamepadPrev={};
const stage=document.getElementById("world-stage"),player=document.getElementById("world-player"),map=document.getElementById("world-map"),log=document.getElementById("world-log"),interact=document.getElementById("world-interact");
function state(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return {}}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function say(t){log.textContent=t}
function isWall(x,y){return walls.has(x+","+y)}
function drawMap(){map.innerHTML="";for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=document.createElement("span");t.className="world-tile "+(isWall(x,y)?"wall":"floor");t.style.left=(x/W*100)+"%";t.style.top=(y/H*100)+"%";t.style.width=(100/W)+"%";t.style.height=(100/H)+"%";map.appendChild(t)}
objects.forEach(o=>{const n=document.createElement("span");n.className="world-object";n.textContent=o.id==="shoe"?"◊":o.id==="camera"?"●":o.id==="signal"?"≈":o.id==="chair"?"□":"▣";n.style.left=((o.x+.5)/W*100)+"%";n.style.top=((o.y+.5)/H*100)+"%";n.title=o.label;map.appendChild(n)})}
function render(){player.style.left=((pos.x+.5)/W*100)+"%";player.style.top=((pos.y+.5)/H*100)+"%";target=objects.find(o=>Math.abs(o.x-pos.x)<=1&&Math.abs(o.y-pos.y)<=1)||null;if(target){interact.hidden=false;interact.textContent="● "+target.label;interact.style.left=((target.x+.5)/W*100)+"%";interact.style.top=((target.y+.5)/H*100)+"%"}else interact.hidden=true;const s=state();document.getElementById("world-coordinates").textContent=String(pos.x).padStart(2,"0")+" · "+String(pos.y).padStart(2,"0");document.getElementById("world-signal").textContent=(Number(s.signals)||0)+" SIGNAL"}
function move(dx,dy){const nx=Math.max(0,Math.min(W-1,pos.x+dx)),ny=Math.max(0,Math.min(H-1,pos.y+dy));if(isWall(nx,ny)){say("Concrete. Locked space. Find another route.");return}if(nx===pos.x&&ny===pos.y)return;pos={x:nx,y:ny};say("The street is real. The signal moves with you.");render()}
function discover(o){const s=state();s.discoveries=Array.isArray(s.discoveries)?s.discoveries:[];s.world_unlocks=Array.isArray(s.world_unlocks)?s.world_unlocks:[];if(o.discovery&&!s.discoveries.includes(o.discovery)){s.discoveries.push(o.discovery);(o.queries||[]).forEach(q=>{if(!s.world_unlocks.includes(q))s.world_unlocks.push(q)});s.signals=(Number(s.signals)||0)+1}if(o.item&&!Array.isArray(s.inventory)?false:false){s.inventory=Array.isArray(s.inventory)?s.inventory:[];if(!s.inventory.includes(o.item))s.inventory.push(o.item)}s.entered=true;s.entry_source="world";save(s)}
function interactNow(){if(!target){say("Nothing close enough to touch. Move toward an object.");return}say(target.text);discover(target);render()}
function inventory(){const s=state(),inv=Array.isArray(s.inventory)?s.inventory:[];say(inv.length?"INVENTORY · "+inv.join(" · "):"INVENTORY EMPTY")}
function glass(){const s=state();say("GLASS EYE · "+(s.discoveries||[]).length+" DISCOVERIES · "+(s.unresolved||[]).length+" UNRESOLVED · "+(s.world_unlocks||[]).length+" WORLD THREADS")}
function key(e){if(["INPUT","TEXTAREA"].includes(e.target.tagName))return;const k=e.key.toLowerCase();if(k==="arrowup"||k==="w")move(0,-1);else if(k==="arrowdown"||k==="s")move(0,1);else if(k==="arrowleft"||k==="a")move(-1,0);else if(k==="arrowright"||k==="d")move(1,0);else if(k==="enter"||k===" ")interactNow();else if(k==="i")inventory();else if(k==="g")glass()}
document.addEventListener("keydown",key);
document.querySelectorAll("[data-dir]").forEach(b=>b.addEventListener("click",()=>{const d=b.dataset.dir;move(d==="left"?-1:d==="right"?1:0,d==="up"?-1:d==="down"?1:0)}));
document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",interactNow));
document.querySelector("[data-inventory]").addEventListener("click",inventory);
document.querySelector("[data-glass]").addEventListener("click",glass);
function poll(){try{const p=Array.from(navigator.getGamepads?navigator.getGamepads():[]).find(Boolean);if(p){const a=i=>!!(p.buttons[i]&&p.buttons[i].pressed),x=p.axes[0]||0,y=p.axes[1]||0,l=x<-.65,r=x>.65,u=y<-.65,d=y>.65;if((l&&!gamepadPrev.l)||(r&&!gamepadPrev.r))move(r?1:-1,0);if((u&&!gamepadPrev.u)||(d&&!gamepadPrev.d))move(0,d?1:-1);if(a(0)&&!gamepadPrev.a)interactNow();if(a(1)&&!gamepadPrev.b)glass();gamepadPrev={l,r,u,d,a:a(0),b:a(1)}}}catch(e){}requestAnimationFrame(poll)}
drawMap();render();stage.focus();poll();
})();