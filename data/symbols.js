/* ESCIE SYMBOL REGISTRY
 * Symbols are recurring signs inside the World.
 * They are portals: meaning stays stable; destination is contextual.
 *
 * Cultural-source notes:
 * - OJÚ draws from Yorùbá concepts of ojú òde / ojú inú (outer / inner eye).
 * - MAYA SPEECH uses the historical speech-scroll convention found in Maya/Mesoamerican art.
 * - THOTH / WRITING draws from ancient Egyptian scribal and Thoth traditions.
 * - VITRUVIAN MAN remains Leonardo's artwork; it is not redrawn into a generic people icon.
 * - STARGATE is an ESCIE interpretation of celestial threshold / passage.
 * - ORION uses the actual Orion constellation as the trace/connection sign.
 *
 * Source accuracy rule: historical source first, ESCIE interpretation second.
 */
const ESCIE_SYMBOLS=[
{id:"symbol-oju",name:"OJÚ",motif:"seeing / perception / looking beneath the surface",placements:["entry","art","visual"],status:"portal",glyph:"oju",channel:"visual",verb:"SEE",destination:"visual",source:"Yorùbá",sourceNote:"ojú òde / ojú inú",fallbackGlyph:"glass-eye",glyphClass:"derived",codepoint:"U+E100",sourceStatus:"verified-concept",sourceRule:"derived-from-source"},
{id:"symbol-maya-speech",name:"MAYA SPEECH",motif:"voice / sound / transmission",placements:["entry","art","audio"],status:"portal",glyph:"maya-speech",channel:"audio",verb:"HEAR",destination:"audio",source:"Maya / Mesoamerican speech-scroll tradition",fallbackGlyph:"music-note",glyphClass:"derived",codepoint:"U+E101",sourceStatus:"verified-convention",sourceRule:"derived-from-source"},
{id:"symbol-thoth",name:"THOTH",motif:"writing / recording / knowledge",placements:["entry","art","writing"],status:"portal",glyph:"thoth",channel:"writing",verb:"READ",destination:"writing",source:"Ancient Egyptian",sourceNote:"Thoth / scribal tradition",fallbackGlyph:"feather",glyphClass:"derived",codepoint:"U+E102",sourceStatus:"verified-association",sourceRule:"derived-from-source"},
{id:"symbol-vitruvian-man",name:"VITRUVIAN MAN",motif:"human presence / proportion / existence",placements:["entry","people"],status:"portal",glyph:"vitruvian-man",channel:"people",verb:"MEET",destination:"people",source:"Leonardo da Vinci",sourceNote:"Use the original artwork; do not redraw",fallbackGlyph:"person",glyphClass:"source-artwork",codepoint:null,sourceStatus:"source-artwork-required",sourceRule:"use-original-artwork"},
{id:"symbol-stargate",name:"STARGATE",motif:"place / passage / spatial connection",placements:["entry","places"],status:"portal",glyph:"stargate",channel:"places",verb:"GO",destination:"places",source:"ESCIE original interpretation",sourceNote:"celestial threshold / passage",fallbackGlyph:"world",glyphClass:"derived",codepoint:"U+E104",sourceStatus:"escie-original",sourceRule:"original-escie-interpretation"},
{id:"symbol-orion",name:"ORION",motif:"trace / pattern / connection",placements:["entry","traces","web","archives","investigation"],status:"portal",glyph:"orion",channel:"traces",verb:"CONNECT",destination:"traces",source:"Orion constellation",sourceNote:"use the actual Orion star pattern",fallbackGlyph:"web",glyphClass:"derived",codepoint:"U+E105",sourceStatus:"verified-geometry",sourceRule:"derive-from-actual-constellation"},

{id:"symbol-home",name:"HOME",motif:"origin / center / return",placements:["world","entry"],status:"portal",glyph:"home",role:"structural",destination:"world",verb:"RETURN"},
{id:"symbol-now",name:"NOW",motif:"the living present",placements:["now","entry"],status:"portal",glyph:"now",role:"structural",destination:"now",verb:"PRESENT"},
{id:"symbol-path",name:"PATH",motif:"movement through connected things",placements:["world","web"],status:"portal",glyph:"path",role:"structural",destination:"path",verb:"FOLLOW"},
{id:"symbol-gravity",name:"GRAVITY",motif:"what pulls things together",placements:["world","web"],status:"portal",glyph:"gravity",role:"structural",destination:"web",verb:"FOLLOW THE PULL"},
{id:"symbol-unknown",name:"UNKNOWN",motif:"what remains unresolved",placements:["world","archives","investigation"],status:"portal",glyph:"unknown",role:"structural",destination:"unknown",verb:"GO DEEPER"},

{id:"symbol-camera",name:"CAMERA",motif:"observation / recording",placements:["glass-eye","investigation"],status:"recurring",glyph:"camera",role:"motif"},
{id:"symbol-daisy",name:"DAISY",motif:"beauty / persistence / what survives",placements:["art"],status:"recurring",glyph:"daisy",role:"motif"},
{id:"symbol-child-shoe",name:"CHILD'S SHOE",motif:"childhood / absence / memory",placements:["archives","investigation"],status:"recurring",glyph:"child-shoe",role:"motif"},
{id:"symbol-nightlight",name:"NIGHTLIGHT",motif:"small illumination / fear / childhood",placements:["now","archives"],status:"recurring",glyph:"nightlight",role:"motif"},
{id:"symbol-key",name:"KEY",motif:"access / threshold / what is hidden",placements:["web"],status:"recurring",glyph:"key",role:"motif"},
{id:"symbol-empty-chair",name:"EMPTY CHAIR",motif:"absence / witness / aftermath",placements:["investigation","archives"],status:"recurring",glyph:"empty-chair",role:"motif"},
{id:"symbol-vhs",name:"VHS",motif:"distortion / missing time / recorded memory",placements:["archives","glass-eye","art"],status:"recurring",glyph:"vhs",role:"motif"},
];
if(typeof window!=="undefined") window.ESCIE_SYMBOLS=ESCIE_SYMBOLS;
if(typeof module!=="undefined"&&module.exports) module.exports=ESCIE_SYMBOLS;
