/* ESCIE GLASS EYE MEMORY
 * Public/player-facing memory layer. It records experience locally and never writes
 * canonical ESCIE truth. The game registry remains the source of event semantics.
 */
(function(){
  "use strict";
  const root=typeof window!=="undefined"?window:globalThis;
  const KEY="escie_glass_eye_memory_v1";
  const MAX_EVENTS=500;

  function safeRead(){
    try{
      if(!root.localStorage)return null;
      const raw=root.localStorage.getItem(KEY);
      return raw?JSON.parse(raw):null;
    }catch(e){return null;}
  }
  function safeWrite(value){
    try{
      if(!root.localStorage)return false;
      root.localStorage.setItem(KEY,JSON.stringify(value));
      return true;
    }catch(e){return false;}
  }
  function state(){
    const games=root.ESCIE_GAME_REGISTRY;
    const base=games&&typeof games.createPlayerState==="function"
      ? games.createPlayerState(safeRead()||{})
      : {version:1,event_count:0,path:[],observed:[],interacted:[],heard:[],seen:[],collected:[],connections:[],discoveries:[],missed:[],visited_scenes:[],visited_locations:[],signals:[],unknown:[],unresolved:[],canonical_write:false};
    base.path=Array.isArray(base.path)?base.path.slice(-MAX_EVENTS):[];
    return base;
  }
  function record(event){
    const games=root.ESCIE_GAME_REGISTRY;
    if(!games||typeof games.applyPlayerEvent!=="function")return state();
    const next=games.applyPlayerEvent(state(),event);
    next.path=next.path.slice(-MAX_EVENTS);
    next.canonical_write=false;
    safeWrite(next);
    try{root.dispatchEvent(new CustomEvent("escie:glass-eye-memory",{detail:{event,eventCount:next.event_count}}));}catch(e){}
    return next;
  }
  function clear(){
    try{if(root.localStorage)root.localStorage.removeItem(KEY);}catch(e){}
    return state();
  }
  function summary(){
    const s=state();
    return {
      observed:s.observed.length,
      interacted:s.interacted.length,
      discoveries:s.discoveries.length,
      connections:s.connections.length,
      missed:s.missed.length,
      unknown:s.unknown.length,
      unresolved:s.unresolved.length,
      visited:s.visited_scenes.length+s.visited_locations.length,
      events:s.event_count
    };
  }
  function render(){
    const container=root.document&&root.document.getElementById("glass-eye-memory");
    if(!container)return;
    const s=state(),m=summary();
    const esc=v=>root.ESCIE_ESCAPE_HTML&&typeof root.ESCIE_ESCAPE_HTML==="function"
      ? root.ESCIE_ESCAPE_HTML(v):String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const last=s.path.slice(-8).reverse();
    container.innerHTML=
      '<div class="glass-memory-panel">'+
      '<div class="glass-memory-head"><strong>YOUR MEMORY</strong><span>LOCAL / PRIVATE / NON-CANONICAL</span></div>'+
      '<div class="glass-memory-grid">'+
      '<span>OBSERVED <b>'+m.observed+'</b></span><span>CONNECTED <b>'+m.connections+'</b></span>'+
      '<span>DISCOVERED <b>'+m.discoveries+'</b></span><span>MISSED <b>'+m.missed+'</b></span>'+
      '<span>UNKNOWN <b>'+m.unknown+'</b></span><span>VISITED <b>'+m.visited+'</b></span>'+
      '</div>'+
      '<div class="glass-memory-path"><span>RECENT PATH</span>'+
      (last.length?last.map(e=>'<div><b>'+esc(e.type)+'</b> '+esc(e.target_id||"—")+'</div>').join(""):'<div>NO OBSERVATIONS YET.</div>')+
      '</div>'+
      '<button type="button" class="glass-memory-clear">CLEAR MY MEMORY</button>'+
      '</div>';
    const button=container.querySelector(".glass-memory-clear");
    if(button)button.addEventListener("click",()=>{clear();render();});
  }
  const API={key:KEY,state,record,clear,summary,render};
  root.ESCIE_GLASS_EYE_MEMORY=API;
  if(root.document)root.addEventListener("DOMContentLoaded",render);
})();