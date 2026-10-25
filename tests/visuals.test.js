/* ESCIE TESTS — VISUALS
 * Contract checks for modular section visual metadata.
 */
(function(){
 "use strict";
 function assert(condition,message){if(!condition)throw new Error(message);}
 function run(){
  const items=window.ESCIE_VISUALS;
  const normalize=window.normalizeEscieVisuals;
  const normalizeAsset=window.normalizeEscieVisualAsset;
  const audit=window.auditEscieVisuals;
  assert(Array.isArray(items),"visual registry must be an array");
  assert(typeof normalize==="function","visual normalizer must exist");
  assert(typeof normalizeAsset==="function","visual asset normalizer must exist");
  assert(typeof audit==="function","visual audit must exist");
  assert(window.ESCIE_VISUALS_UI&&typeof window.ESCIE_VISUALS_UI.init==="function","visual UI must exist");
  assert(typeof window.ESCIE_VISUALS_UI.chooseVisualFocus==="function","visual focus selector must exist");
  const focus=window.ESCIE_VISUALS_UI.chooseVisualFocus;
  assert(focus([],1000,800)===-1,"empty focus must return none");
  assert(focus([{top:0,bottom:800,left:0,right:1000}],1000,800)===0,"single visual must win");
  assert(focus([{top:0,bottom:800,left:0,right:1000},{top:700,bottom:900,left:0,right:1000}],1000,800)===0,"stronger visible area must win");
  assert(focus([{top:-200,bottom:200,left:0,right:1000},{top:300,bottom:700,left:0,right:1000}],1000,800)===1,"center proximity must resolve focus");
  assert(focus([{top:0,bottom:800,left:0,right:1000},{top:0,bottom:800,left:0,right:1000}],1000,800)===0,"equal candidates must resolve to the first deterministically");

  assert(typeof window.ESCIE_VISUALS_UI.renderAsset==="function","visual UI renderer must exist");
  assert(typeof window.ESCIE_VISUALS_UI.renderAsset==="function","visual asset renderer must exist");
  const video=window.ESCIE_VISUALS_UI.renderAsset({type:"video",url:"https://example.com/visual.mp4",poster:"https://example.com/poster.jpg"});
  assert(video.includes("<video"),"video assets must render as video");
  assert(video.includes("muted")&&video.includes("loop")&&video.includes("playsinline"),"visual videos must be silent and inline");
  assert(window.ESCIE_VISUALS_UI.renderAsset({type:"video",url:"javascript:alert(1)"})==="","unsafe visual URLs must fail closed");
  assert(window.ESCIE_VISUALS_UI.renderAsset({type:"iframe",url:"https://evil.example/visual"})==="","untrusted iframe hosts must fail closed");
  assert(window.ESCIE_VISUALS_UI.renderAsset({type:"iframe",url:"https://www.youtube.com/embed/example"})!=="","allowlisted iframe hosts must render");
  const normalizedAsset=normalizeAsset({url:"https://example.com/a.webp",type:"image",alt:"test"});
  assert(normalizedAsset&&normalizedAsset.type==="image","visual asset normalizer must accept valid assets");
  assert(normalizeAsset({url:"javascript:alert(1)",type:"image"})!==null,"data normalizer should preserve candidate URLs for presentation-layer validation");
  assert(normalizeAsset({url:"https://example.com/a.webp",type:"unknown"})===null,"visual asset normalizer must reject unknown types");
  assert(audit(items).ok===true,"visual registry audit must pass");
  assert(window.ESCIE_RUNTIME&&typeof window.ESCIE_RUNTIME.visualAudit==="function","runtime visual audit must be exposed");
  assert(window.ESCIE_RUNTIME.visualAudit().ok===true,"runtime visual audit must pass");
  const malformed=[{id:"bad",section:"now",mode:"x",intensity:.5,status:"active",asset:{type:"image"}}];
  assert(audit(malformed).invalidAssets.includes("bad"),"visual audit must identify malformed assets");
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
