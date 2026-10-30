const contract=require("../data/universe-contract.js");

function assert(condition,message){if(!condition)throw new Error(message);}

const result=contract.validate();
const manifest=require("../data/file-manifest.js");
assert(result.ok,"ESCIE universe contract must validate");
assert(manifest.contracts.includes("universe-contract"),"file manifest must register the shared universe contract");
assert(contract.boundaries.realityFilter===false,"Reality Filter must remain removed");
assert(contract.boundaries.gameplay2D===false,"gameplay must remain 3D");
assert(contract.boundaries.pauseMap2DOnly===true,"pause/map must remain the only 2D interface");
assert(contract.boundaries.publicIsCanonicalDoorway===true,"public site must remain canonical doorway");
assert(contract.boundaries.gameIsExtension===true,"game must remain an extension of the universe");
assert(contract.boundaries.centralHumanApproval===true,"Central must retain human approval");
assert(contract.worldClasses.length===4,"world must expose four RPG classes");
assert(contract.publicSections.includes("THE WORLD"),"public site must retain THE WORLD");
assert(contract.publicSections.includes("GLASS EYE"),"public site must retain GLASS EYE");
console.log("ESCIE universe contract OK");
