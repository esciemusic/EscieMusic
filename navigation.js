const ESCIE_NAVIGATION=[
{id:"now",label:"NOW",target:"#now",primary:true,order:1,symbol:"now",symbolMeaning:"Present state",symbolPurpose:"See what is current"},
{id:"art",label:"ART",target:"#art",primary:true,order:2,symbol:"art",symbolMeaning:"Creation",symbolPurpose:"Enter the work"},
{id:"world",label:"THE WORLD",target:"#world",primary:true,order:3,symbol:"world",symbolMeaning:"The shared world environment",symbolPurpose:"Enter the World"},
{id:"glass-eye",label:"GLASS EYE",target:"#glass-eye",primary:true,order:4,symbol:"glass-eye",symbolMeaning:"Witness",symbolPurpose:"See through the screen"},
{id:"trace",label:"TRACE",target:"#trace",primary:true,order:5,symbol:"web",symbolMeaning:"Connections",symbolPurpose:"Follow the thread"},
{id:"archives",label:"THE ARCHIVES",target:"#archives",primary:true,order:6,symbol:"archives",symbolMeaning:"Record",symbolPurpose:"Open the preserved record"},
{id:"investigation",label:"THE CASE FILES",target:"#investigation",primary:true,order:7,symbol:"case-files",symbolMeaning:"Inquiry",symbolPurpose:"Follow the evidence"},
{id:"escie",label:"ESCIE",target:"#escie",primary:true,order:8,symbol:"escie",symbolMeaning:"Identity",symbolPurpose:"Return to ESCIE"}
];

const ESCIE_NAVIGATION_CONTRACT={
  order:["now","art","world","glass-eye","web","archives","investigation","escie"],
  validate:function(items){
    const list=Array.isArray(items)?items:[];
    const errors=[];
    const ids=list.map(item=>item&&item.id).filter(Boolean);
    const targets=list.map(item=>item&&item.target).filter(Boolean);
    const sorted=list.slice().sort((a,b)=>(Number(a&&a.order)||999)-(Number(b&&b.order)||999));
    const expected=this.order;
    if(list.filter(item=>item&&item.primary===true).length!==expected.length) errors.push("primary navigation count");
    if(new Set(ids).size!==ids.length) errors.push("duplicate navigation ids");
    if(new Set(targets).size!==targets.length) errors.push("duplicate navigation targets");
    if(JSON.stringify(sorted.map(item=>item&&item.id))!==JSON.stringify(expected)) errors.push("navigation order");
    return {ok:errors.length===0,errors};
  }
};
if(typeof window!=="undefined"){
  window.ESCIE_NAVIGATION=ESCIE_NAVIGATION;
  window.ESCIE_NAVIGATION_CONTRACT=ESCIE_NAVIGATION_CONTRACT;
}
if(typeof module!=="undefined"&&module.exports){
  module.exports=ESCIE_NAVIGATION;
  module.exports.contract=ESCIE_NAVIGATION_CONTRACT;
}
