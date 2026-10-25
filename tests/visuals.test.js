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
  assert(window.ESCIE_VISUALS_UI.renderAsset({type:"video",url:"javascript:alert(1)"})==="","unsafe visual URLs must fail closed");
  assert(window.ESCIE_VISUALS_UI.renderAsset({type:"iframe",url:"https://evil.example/visual"})==="","untrusted iframe hosts must fail closed");
  assert(window.ESCIE_VISUALS_UI.renderAsset({type:"iframe",url:"https://www.youtube.com/embed/example"})!=="","allowlisted iframe hosts must render");
  const normalizedAsset=window.normalizeEscieVisualAsset&&window.normalizeEscieVisualAsset({url:"https://example.com/a.webp",type:"image",alt:"test"});
  assert(normalizedAsset&&normalizedAsset.type==="image","visual asset normalizer must accept valid assets");
  assert(window.normalizeEscieVisualAsset({url:"javascript:alert(1)",type:"image"})!==null,"data normalizer may preserve URL for presentation-layer validation");
  assert(window.normalizeEscieVisualAsset({url:"https://example.com/a.webp",type:"unknown"})===null,"visual asset normalizer must reject unknown types");
  const audit=window.auditEscieVisuals&&window.auditEscieVisuals(items);
  assert(audit&&audit.ok===true,"visual registry audit must pass");
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
