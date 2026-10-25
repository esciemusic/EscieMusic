/* ESCIE VISUALS
 * Presentation layer. It reads the visual registry but never creates canon.
 */
(function(){
 "use strict";
 function init(){
  const items=window.ESCIE_VISUALS||[];
  const normalized=typeof window.normalizeEscieVisuals==="function"?window.normalizeEscieVisuals(items):items;
  normalized.forEach(v=>{
   const el=Array.from(document.querySelectorAll(".section-visual")).find(node=>node.dataset.visualSection===v.section);
   if(!el)return;
   el.dataset.visualMode=v.mode;
   el.style.setProperty("--visual-intensity",String(v.intensity));
   if(v.symbols.length)el.dataset.visualSymbols=v.symbols.join(" ");
  });
 }
 window.ESCIE_VISUALS_UI={init};
})();
