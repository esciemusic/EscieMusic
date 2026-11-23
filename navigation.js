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


/*
 * Detailed Index: the World map behind the simple public doorway.
 * Primary navigation remains HOME / THE WORLD / TRACE.
 * The Index exposes the deeper structure without turning the World itself
 * into a conventional menu.
 */
const ESCIE_INDEX=[
  {
    id:"world",
    label:"THE WORLD",
    entries:[
      {label:"PEOPLE",target:"#world-tab=people"},
      {label:"PLACES",target:"#world-tab=places"},
      {label:"MOMENTS",target:"#world-tab=moments"},
      {label:"OBJECTS",target:"#world-tab=objects"},
      {label:"ART",target:"#art"}
    ]
  },
  {
    id:"depth",
    label:"DEPTH",
    entries:[
      {label:"FRAGMENTS",target:"#world-tab=fragments"},
      {label:"PROOF",target:"#world-tab=proof"},
      {label:"BODIES",target:"#world-tab=bodies"},
      {label:"ARCHIVES",target:"#archives"},
      {label:"CONNECTIONS",target:"#trace"}
    ]
  },
  {
    id:"trace",
    label:"TRACE",
    entries:[
      {label:"YOUR THREAD",target:"#trace"},
      {label:"WORLD THREADS",target:"#trace"},
      {label:"CONNECTED RECORDS",target:"#trace"},
      {label:"DISCOVERIES",target:"#trace"}
    ]
  },
  {
    id:"art",
    label:"ART",
    entries:[
      {label:"MUSIC",target:"#art/music"},
      {label:"WORDS",target:"#art/words"},
      {label:"VISUAL",target:"#art/visual"},
      {label:"PROJECTS",target:"#art/projects"}
    ]
  },
  {
    id:"records",
    label:"RECORDS",
    entries:[
      {label:"PEOPLE",target:"#world-tab=people"},
      {label:"PLACES",target:"#world-tab=places"},
      {label:"MOMENTS",target:"#world-tab=moments"},
      {label:"OBJECTS",target:"#world-tab=objects"},
      {label:"FRAGMENTS",target:"#world-tab=fragments"},
      {label:"PROOF",target:"#world-tab=proof"},
      {label:"BODIES",target:"#world-tab=bodies"},
      {label:"ARCHIVES",target:"#archives"}
    ]
  },
  {
    id:"eye",
    label:"THE EYE",
    entries:[
      {label:"GLASS EYE",target:"#glass-eye"},
      {label:"OBSERVE",target:"#glass-eye"},
      {label:"HEAR",target:"#glass-eye"},
      {label:"FOLLOW",target:"#glass-eye"},
      {label:"RETURN",target:"#glass-eye"}
    ]
  },
  {
    id:"investigations",
    label:"INVESTIGATIONS",
    entries:[
      {label:"CASE FILES",target:"#investigation"},
      {label:"EVIDENCE",target:"#investigation"},
      {label:"QUESTIONS",target:"#investigation"},
      {label:"UNRESOLVED",target:"#investigation"}
    ]
  },
  {
    id:"projects",
    label:"PROJECTS",
    entries:[
      {label:"BAM",target:"#projects"},
      {label:"CLOTHING",target:"#projects"},
      {label:"GAME",target:"#glass-eye"}
    ]
  },
  {
    id:"archive",
    label:"ARCHIVE",
    entries:[
      {label:"DOCUMENTS",target:"#archives"},
      {label:"PHOTOGRAPHS",target:"#archives"},
      {label:"AUDIO",target:"#archives"},
      {label:"VIDEO",target:"#archives"},
      {label:"PRESERVED RECORDS",target:"#archives"}
    ]
  },
  {
    id:"outside",
    label:"OUTSIDE",
    entries:[
      {label:"MUSIC",target:"#art/music"},
      {label:"SOCIAL",target:"#glass-eye"},
      {label:"GAME",target:"#glass-eye"}
    ]
  }
];

if(typeof window!=="undefined") window.ESCIE_INDEX=ESCIE_INDEX;
if(typeof module!=="undefined"&&module.exports) module.exports.index=ESCIE_INDEX;
