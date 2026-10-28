(function(){
"use strict";
const root=typeof window!=="undefined"?window:globalThis;
const KEY="escie_game_state_v1";
const defaults={version:2,player_id:null,screen:"gateway",scene:"threshold",visited:[],inventory:[],signals:0,entered:false};
const scenes=[
 {id:"threshold",label:"THE THRESHOLD",title:"THE FIRST DOOR",text:"You are not entering another universe. You are entering another layer of the same one.",item:null,next:"laneway"},
 {id:"laneway",label:"PARC-EXTENSION",title:"THE LANEWAY",text:"Concrete. Winter air. A camera where there should not be one. Something has been left behind.",item:"game-item-baby-shoe",next:"signal"},
 {id:"signal",label:"THE SIGNAL",title:"FOLLOW THE DISTORTION",text:"The signal is weak, but it is not random. Look closer. Listen longer.",item:"game-item-signal-key",next:"return"},
 {id:"return",label:"RETURN",title:"NOTHING STAYS IN THE SCREEN",text:"What you find here can become part of your route through ESCIE. The world remains grounded in reality.",item:null,next:null}
];
const items=[
 {id:"game-item-baby-shoe",title:"BABY SHOE",description:"A found object. Meaning unresolved.",price_type:"FREE",availability:"AVAILABLE"},
 {id:"game-item-signal-key",title:"SIGNAL KEY",description:"A digital key that marks a discovered thread.",price_type:"EARNED",price:1,currency:"SIGNAL",availability:"AVAILABLE"}
];
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||"null");return Object.assign({},defaults,s||{})}catch(e){return Object.assign({},defaults)}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function esc(v){return String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))}
function current(s){return scenes.find(x=>x.id===s.scene)||scenes[0]}
function item(id){return items.find(x=>x.id===id)}
function ensurePlayer(s){if(!s.player_id)s.player_id="visitor-"+Math.random().toString(36).slice(2,10);return s}
function visit(s,id){if(!s.visited.includes(id))s.visited.push(id)}
function collect(s,id){
 if(!s.inventory.includes(id)){
  const it=item(id);
  if(it&&it.price_type==="EARNED"){if(s.signals<Number(it.price||0))return false;s.signals-=Number(it.price||0)}
  s.inventory.push(id);
 }
 return true
}
function render(){
 const el=document.getElementById("game-container");if(!el)return;
 let s=ensurePlayer(load()),c=current(s);save(s);
 if(!s.entered){
  el.innerHTML=`<div class="game-gateway game-entry-gateway"><div class="game-gateway-head"><span class="game-kicker">ESCIE / THE WORLD</span><span class="game-status">SIGNAL DETECTED</span></div><div class="game-entry-main"><span class="game-kicker">THE GLASS EYE</span><h3>YOU ARE ALREADY HERE.</h3><p>This is not a separate world. It is another layer of the same one. Enter when you are ready.</p><div class="game-entry-route"><span>ESCIE</span><i>→</i><span>THE WORLD</span><i>→</i><strong>THE SIGNAL</strong></div><button type="button" class="game-enter-button" data-game-enter>ENTER THE WORLD</button></div></div>`;
  const b=el.querySelector("[data-game-enter]");if(b)b.onclick=()=>{s.entered=true;visit(s,"threshold");save(s);render()};
  return;
 }
 const inv=s.inventory.map(id=>item(id)).filter(Boolean);
 const found=c.item?item(c.item):null;
 el.innerHTML='<div class="game-gateway"><div class="game-gateway-head"><span class="game-kicker">ESCIE / PLAYABLE LAYER</span><span class="game-status">LOCAL PLAYER STATE</span></div>'+
 '<div class="game-gateway-main"><div class="game-signal-mark" aria-hidden="true"><span></span></div><div class="game-copy"><span class="game-kicker">'+esc(c.label)+'</span><h3>'+esc(c.title)+'</h3><p>'+esc(c.text)+'</p>'+
 (found?'<div class="game-discovery"><span class="game-kicker">OBJECT IN FRAME</span><strong>'+esc(found.title)+'</strong><small>'+esc(found.description)+'</small><button type="button" data-game-collect="'+esc(found.id)+'">'+(s.inventory.includes(found.id)?"COLLECTED":"TAKE IT")+'</button></div>':"")+
 '<div class="game-actions">'+(c.next?'<button type="button" data-game-next>CONTINUE →</button>': '<button type="button" data-game-reset>RESTART EXPERIENCE</button>')+'<button type="button" data-game-inventory>INVENTORY ('+inv.length+')</button></div></div></div>'+
 '<div class="game-progress"><span>'+esc(String(s.visited.length))+' LOCATIONS VISITED</span><span>'+esc(String(s.signals))+' SIGNAL</span><span>'+esc(String(inv.length))+' ITEMS</span></div></div>';
 bind(el,s)
}
function bind(el,s){
 el.querySelectorAll("[data-game-next]").forEach(b=>b.onclick=()=>{const c=current(s);if(c.next){s.scene=c.next;visit(s,s.scene);save(s);render();}});
 el.querySelectorAll("[data-game-collect]").forEach(b=>b.onclick=()=>{const ok=collect(s,b.dataset.gameCollect);if(ok){visit(s,s.scene);save(s);render()}else{b.textContent="NEED 1 SIGNAL";}});
 el.querySelectorAll("[data-game-reset]").forEach(b=>b.onclick=()=>{localStorage.removeItem(KEY);render()});
 el.querySelectorAll("[data-game-inventory]").forEach(b=>b.onclick=()=>{const inv=s.inventory.map(id=>item(id)).filter(Boolean);alert(inv.length?inv.map(x=>x.title).join("\n"):"INVENTORY EMPTY")});
}
function init(){
 const el=document.getElementById("game-container");if(!el)return;
 const s=load();ensurePlayer(s);save(s);render();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
root.ESCIE_GAME_GATEWAY={version:"1.1.0",scenes,items,enter(){const s=ensurePlayer(load());s.entered=true;visit(s,"threshold");save(s);render()},reset(){localStorage.removeItem(KEY);render()},getState(){return load()}};
})();