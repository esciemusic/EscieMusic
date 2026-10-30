/* ESCIE THE WORLD · Investigation bridge
 * Runtime only. Canonical evidence remains in simulation/law state.
 */
(()=>{"use strict";
const law=()=>window.ESCIE_WORLD_LAW;
const target=source=>{const m=String(source||"").match(/(?:CAMERA|WITNESS|SECURITY REPORT)\s*[·:]\s*([A-Z0-9_-]+)/i);return m?m[1]:null};
const cases=()=>{const s=law()?.state?.()||{};return (s.caseFiles||[]).map(c=>Object.assign({},c,{target:c.target||target(c.source),evidence:c.evidence||[]}))};
const review=(id,action="REVIEW",evidence=[])=>law()?.investigate?.(id,action,{evidence});
const search=(id,evidence=[])=>review(id,"SEARCH",evidence);
const trace=(id,evidence=[])=>review(id,"TRACE",evidence);
const close=(id,evidence=[])=>review(id,"CLOSE",evidence);
const summary=()=>{const all=cases();return {open:all.filter(c=>["OPEN","INVESTIGATING"].includes(c.status)).length,investigating:all.filter(c=>c.status==="INVESTIGATING").length,resolved:all.filter(c=>["CLOSED","ARRESTED","EXPIRED"].includes(c.status)).length,cases:all.slice(-20)}};
window.ESCIE_WORLD_INVESTIGATION={cases,review,search,trace,close,summary};
})();