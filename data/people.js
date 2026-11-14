/*
 * ESCIE PEOPLE REGISTRY
 *
 * Public people are established records, not automatic biographies.
 * Identity remains selective; absence is allowed.
 */
const ESCIE_PEOPLE=[
{id:"a-good-person",type:"person",title:"A GOOD PERSON",description:"A person can be good without being easy, polished or harmless. This record begins with the contradiction and leaves the rest to the work.",visibility:"public",public_disclosure:true,certainty:"known",status:"active",tags:["person","identity","contradiction"],role:"PERSON"}
];
if(typeof window!=="undefined")window.ESCIE_PEOPLE=ESCIE_PEOPLE;
if(typeof module!=="undefined"&&module.exports)module.exports=ESCIE_PEOPLE;