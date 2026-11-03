/* ESCIE LOCATION REGISTRY — only the current public world is exposed here. */
const ESCIE_LOCATIONS=[
{id:"montreal",type:"place",title:"MONTRÉAL",slug:"montreal",description:"The city anchoring the ESCIE world. New locations enter as the record progresses.",visibility:"public",public_disclosure:true,archive_state:"active",knowledge:"known",origin:"observation",transformation:"none",certainty:"verified",status:"active",tags:["montréal","quebec","canada","physical-anchor"]},
{id:"parc-extension",type:"place",title:"PARC-EXTENSION",slug:"parc-extension",description:"A future location record. It remains withheld until ESCIE establishes it in the progressing public world.",visibility:"withheld",public_disclosure:false,archive_state:"pending",knowledge:"known",origin:"reference",transformation:"none",certainty:"unresolved",status:"withheld",tags:["montréal","parc-extension","future-location"]}
];
if(typeof window!=="undefined")window.ESCIE_LOCATIONS=ESCIE_LOCATIONS;
if(typeof module!=="undefined"&&module.exports)module.exports=ESCIE_LOCATIONS;