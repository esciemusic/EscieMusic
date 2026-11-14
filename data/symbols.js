/* ESCIE SYMBOL REGISTRY
 * Recurring motifs are contextual visual language, not scattered decoration.
 * Meanings remain open unless explicitly established by canon.
 */
const ESCIE_SYMBOLS=[
{id:"symbol-camera",name:"CAMERA",motif:"observation / recording",placements:["glass-eye","investigation"],status:"recurring",glyph:"camera"},
{id:"symbol-daisy",name:"DAISY",motif:"beauty / persistence / what survives",placements:["art"],status:"recurring",glyph:"daisy"},
{id:"symbol-child-shoe",name:"CHILD'S SHOE",motif:"childhood / absence / memory",placements:["archives","investigation"],status:"recurring",glyph:"child-shoe"},
{id:"symbol-nightlight",name:"NIGHTLIGHT",motif:"small illumination / fear / childhood",placements:["now","archives"],status:"recurring",glyph:"nightlight"},
{id:"symbol-key",name:"KEY",motif:"access / threshold / what is hidden",placements:["web"],status:"recurring",glyph:"key"},
{id:"symbol-empty-chair",name:"EMPTY CHAIR",motif:"absence / witness / aftermath",placements:["investigation","archives"],status:"recurring",glyph:"empty-chair"},
{id:"symbol-vhs",name:"VHS",motif:"distortion / missing time / recorded memory",placements:["archives","glass-eye","art"],status:"recurring",glyph:"vhs"}
];
if(typeof window!=="undefined") window.ESCIE_SYMBOLS=ESCIE_SYMBOLS;
if(typeof module!=="undefined"&&module.exports) module.exports=ESCIE_SYMBOLS;