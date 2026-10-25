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
 return items.filter(v=>v&&typeof v==="object"&&v.id&&v.section&&v.status!=="hidden").map(v=>({
  id:String(v.id),section:String(v.section),mode:String(v.mode||"default"),
  symbols:Array.isArray(v.symbols)?v.symbols.map(String):[],
  intensity:Math.max(0,Math.min(1,Number(v.intensity??.7))),
  asset:v.asset||null,
  status:String(v.status||"active")
 }));
}
if(typeof window!=="undefined"){window.ESCIE_VISUALS=ESCIE_VISUALS;window.normalizeEscieVisuals=normalizeEscieVisuals;}
if(typeof module!=="undefined"&&module.exports)module.exports={ESCIE_VISUALS,normalizeEscieVisuals};
