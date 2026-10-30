/* ESCIE FILE MANIFEST — canonical ownership map */
(function(root){
  "use strict";
  const manifest={
    content:["media","about","archive","bodies","clothing","fragments","games","glass-eye-journey","glass-eye-memory","investigation","locations","merch","moments","music","nodes","paths","people","projects","public-live","record-contract","relationships","release-runtime","registry","signals","site","social","symbols","visuals","world-quests"],
    world:["world-content","world-city","world-items","city-reference","world-simulation","npc-identity-system","npc-life-system","npc-system","npc-dialogue-system","language-system","law-system","vehicle-system","equipment","rpg-system","interior-system","dream-play","world-quests","world","3d-reality","health-check"],
    presentation:["index","world.css","game-shell.css"],
    contracts:["record-contract","universe-contract","layer-balance","service-contract","core/performance.js","signal/countdown.js","signal/countdown-ui.js","central-connect/third-party-broker.js","central-connect/command-desk.js","tests/"]
  };
  root.ESCIE_FILE_MANIFEST=manifest;
  if(typeof module!=="undefined"&&module.exports)module.exports=manifest;
})(typeof window!=="undefined"?window:globalThis);
