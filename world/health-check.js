/* ESCIE WORLD HEALTH — post-boot dependency and contract guard */
(function(root){
  "use strict";
  function run(){
    const required=[
      ["Three.js",!!root.THREE],
      ["world content",!!root.ESCIE_WORLD_CONTENT],
      ["world city",!!root.ESCIE_WORLD_CITY],
      ["world items",!!root.ESCIE_WORLD_ITEMS],
      ["world quests",Array.isArray(root.ESCIE_WORLD_QUESTS)],
      ["world runtime",!!root.ESCIE_WORLD_ACTIONS],
      ["RPG runtime",!!root.ESCIE_RPG],
      ["equipment runtime",!!root.ESCIE_EQUIPMENT],
      ["vehicle runtime",!!root.ESCIE_VEHICLES],
      ["law runtime",!!root.ESCIE_LAW]
    ];
    const missing=required.filter(x=>!x[1]).map(x=>x[0]);
    const result={ok:missing.length===0,missing,timestamp:new Date().toISOString()};
    root.ESCIE_WORLD_HEALTH=result;
    try{root.dispatchEvent(new CustomEvent("escie:world-health",{detail:result}));}catch(e){}
    if(missing.length){
      console.error("ESCIE WORLD HEALTH FAILURE",missing);
      const gate=document.getElementById("game-boot");
      const msg=document.getElementById("game-boot-status");
      if(gate&&msg){msg.textContent="WORLD SYSTEM ERROR · "+missing.join(" · ");gate.hidden=false;gate.classList.add("boot-error");document.body.classList.remove("game-live");}
    } else {
      root.dispatchEvent(new CustomEvent("escie:world-ready"));
    }
    return result;
  }
  root.ESCIE_WORLD_HEALTH_CHECK=run;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})(window);
