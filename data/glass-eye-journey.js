(function(){
"use strict";
const root=typeof window!=="undefined"?window:globalThis;
function memory(){return root.ESCIE_GLASS_EYE_MEMORY&&typeof root.ESCIE_GLASS_EYE_MEMORY.state==="function"?root.ESCIE_GLASS_EYE_MEMORY.state():null;}
function journey(){
 const s=memory()||{};
 return {
  path:Array.isArray(s.path)?s.path.slice():[],
  connections:Array.isArray(s.connections)?s.connections.slice():[],
  discoveries:Array.isArray(s.discoveries)?s.discoveries.slice():[],
  missed:Array.isArray(s.missed)?s.missed.slice():[],
  unknown:Array.isArray(s.unknown)?s.unknown.slice():[],
  questions:Array.isArray(s.unresolved)?s.unresolved.slice():[],
  last_signal:Array.isArray(s.signals)&&s.signals.length?s.signals[s.signals.length-1]:null
 };
}
root.ESCIE_GLASS_EYE_JOURNEY={journey};
})();