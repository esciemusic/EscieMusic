/* ESCIE TESTS — VISUALS
 * Contract checks for modular section visual metadata.
 */
(function(){
 "use strict";
 function assert(condition,message){if(!condition)throw new Error(message);}
 function run(){
  const items=window.ESCIE_VISUALS;
  const normalize=window.normalizeEscieVisuals;
  assert(Array.isArray(items),"visual registry must be an array");
  assert(typeof normalize==="function","visual normalizer must exist");
  assert(window.ESCIE_VISUALS_UI&&typeof window.ESCIE_VISUALS_UI.init==="function","visual UI must exist");
  assert(typeof window.ESCIE_VISUALS_UI.renderAsset==="function","visual asset renderer must exist");
  const video=window.ESCIE_VISUALS_UI.renderAsset({type:"video",url:"https://example.com/visual.mp4",poster:"https://example.com/poster.jpg"});
  assert(video.includes("<video"),"video assets must render as video");
  assert(video.includes("muted")&&video.includes("loop")&&video.includes("playsinline"),"visual videos must be silent and inline");
  const normalized=normalize(items);
  assert(normalized.length===7,"all seven public sections should have a visual");
  assert(new Set(normalized.map(v=>v.id)).size===normalized.length,"visual IDs must be unique");
  normalized.forEach(v=>{
   assert(v.section&&v.mode,"visual requires section and mode");
   assert(v.intensity>=0&&v.intensity<=1,"visual intensity must be bounded");
  });
  return {passed:true};
 }
 if(typeof window!=="undefined")window.ESCIE_TEST_VISUALS={run};
 if(typeof module!=="undefined"&&module.exports)module.exports={run};
})();
