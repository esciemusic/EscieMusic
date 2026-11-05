/* ESCIE SYMBOL REGISTRY
 * Recurring motifs are contextual visual language, not scattered decoration.
 * Meanings remain open unless explicitly established by canon.
 */
const ESCIE_SYMBOLS=[
{id:"symbol-camera",name:"CAMERA",motif:"observation / recording",placements:["glass-eye","investigation"],status:"recurring"},
{id:"symbol-daisy",name:"DAISY",motif:"beauty / persistence",placements:["art","entry"],status:"recurring"},
{id:"symbol-child-shoe",name:"CHILD'S SHOE",motif:"childhood / absence / memory",placements:["archives","investigation"],status:"recurring"},
{id:"symbol-nightlight",name:"NIGHTLIGHT",motif:"small illumination / fear / childhood",placements:["now","archives"],status:"recurring"},
{id:"symbol-key",name:"KEY",motif:"access / threshold / what is hidden",placements:["web","entry"],status:"recurring"},
{id:"symbol-empty-chair",name:"EMPTY CHAIR",motif:"absence / witness / aftermath",placements:["investigation","archives"],status:"recurring"},
{id:"symbol-vhs",name:"VHS",motif:"distortion / missing time / recorded memory",placements:["archives","glass-eye","art"],status:"recurring"}
];
if(typeof window!=="undefined") window.ESCIE_SYMBOLS=ESCIE_SYMBOLS;
if(typeof module!=="undefined"&&module.exports) module.exports=ESCIE_SYMBOLS;