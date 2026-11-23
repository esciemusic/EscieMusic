const ESCIE_NAVIGATION=[
{id:"home",label:"HOME",target:"#entry",primary:true,order:1,symbol:"escie",symbolMeaning:"Home",symbolPurpose:"Return to the surface"},
{id:"world",label:"THE WORLD",target:"#world",primary:true,order:2,symbol:"world",symbolMeaning:"The shared world",symbolPurpose:"Enter the World"},
{id:"trace",label:"TRACE",target:"#trace",primary:true,order:3,symbol:"web",symbolMeaning:"Connections",symbolPurpose:"Follow the thread"}
];

const ESCIE_NAVIGATION_CONTRACT={
  order:["home","world","trace"],
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
