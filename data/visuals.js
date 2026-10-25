/* ESCIE VISUAL REGISTRY
 * Presentation metadata only. Visuals do not establish canon or truth.
 */
const ESCIE_VISUALS=[
{id:"visual-now",section:"now",mode:"nightlight",symbols:["symbol-nightlight"],intensity:.72,status:"active",asset:null},
{id:"visual-work",section:"work",mode:"vhs-daisy",symbols:["symbol-vhs","symbol-daisy"],intensity:.68,status:"active",asset:null},
{id:"visual-web",section:"the-web",mode:"network",symbols:["symbol-key"],intensity:.64,status:"active",asset:null},
{id:"visual-archive",section:"archive",mode:"archive-tape",symbols:["symbol-child-shoe","symbol-empty-chair","symbol-vhs"],intensity:.66,status:"active",asset:null},
{id:"visual-investigation",section:"investigation",mode:"evidence",symbols:["symbol-camera","symbol-child-shoe","symbol-empty-chair"],intensity:.70,status:"active",asset:null},
{id:"visual-glass-eye",section:"glass-eye",mode:"camera",symbols:["symbol-camera","symbol-vhs"],intensity:.74,status:"active",asset:null},
{id:"visual-escie",section:"escie",mode:"presence",symbols:[],intensity:.60,status:"active",asset:null}
];
function normalizeEscieVisuals(items){
 if(!Array.isArray(items))return [];
 const seen=new Set();
 return items.filter(v=>v&&typeof v==="object"&&v.id&&v.section&&v.status!=="hidden").map(v=>({
  id:String(v.id),section:String(v.section),mode:String(v.mode||"default"),
  symbols:Array.isArray(v.symbols)?v.symbols.map(String):[],
  intensity:Math.max(0,Math.min(1,Number.isFinite(Number(v.intensity))?Number(v.intensity):.7)),
  asset:v.asset||null,
  status:String(v.status||"active")
 })).filter(v=>{if(seen.has(v.id))return false;seen.add(v.id);return true;});
}
function auditEscieVisuals(items){
 const normalized=normalizeEscieVisuals(items);
 const sections=["now","work","the-web","archive","investigation","glass-eye","escie"];
 const ids=normalized.map(v=>v.id);
 return {ok:sections.every(section=>normalized.some(v=>v.section===section))&&new Set(ids).size===ids.length,sections,configured:normalized.length,missing:sections.filter(section=>!normalized.some(v=>v.section===section)),duplicateIds:ids.filter((id,i)=>ids.indexOf(id)!==i)};
}
if(typeof window!=="undefined"){window.ESCIE_VISUALS=ESCIE_VISUALS;window.normalizeEscieVisuals=normalizeEscieVisuals;window.auditEscieVisuals=auditEscieVisuals;}
if(typeof module!=="undefined"&&module.exports)module.exports={ESCIE_VISUALS,normalizeEscieVisuals,auditEscieVisuals};
