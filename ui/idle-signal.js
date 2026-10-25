/*
 * ESCIE IDLE SIGNAL
 * Presentation-only atmosphere for periods when the public registry
 * contains no transmitted work. It creates no records and no canon.
 */
(function(){
  "use strict";
  const STATES=[
    "SIGNAL // STANDBY",
    "GLASS EYE // OPEN",
    "ARCHIVE // QUIET",
    "TRANSMISSION // PENDING"
  ];

  function hasPublicTransmission(sourceRegistry){
    const registry=sourceRegistry||((typeof window!=="undefined")?window.ESCIE_RECORD_REGISTRY:null);
    if(!registry||typeof registry.allPublicRecords!=="function") return true;
    return registry.allPublicRecords().some(record=>record&&(record.type==="music"||record.type==="project"));
  }

  function apply(){
    document.documentElement.classList.toggle("idle-universe",!hasPublicTransmission());
  }

  function init(){
    const node=document.querySelector(".signal-status");
    if(!node) return;
    apply();
    const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(hasPublicTransmission()||reduced)return;
    let index=0;
    const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const set=()=>{
      node.classList.remove("signal-status-shift");
      void node.offsetWidth;
      node.textContent=STATES[index];
      node.classList.add("signal-status-shift");
      index=(index+1)%STATES.length;
    };
    set();
    window.setInterval(set,5200);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
if(typeof window!=="undefined") window.ESCIE_IDLE_SIGNAL={states:["SIGNAL // STANDBY","GLASS EYE // OPEN","ARCHIVE // QUIET","TRANSMISSION // PENDING"]};
