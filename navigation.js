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
    description:"The shared place where people, places, moments, objects, and art meet.",
    entries:[
      {label:"PEOPLE",target:"#world-tab=people",description:"The people inside the World." ,symbol:"people"},
      {label:"PLACES",target:"#world-tab=places",description:"Places with memory, presence, and connection." ,symbol:"place"},
      {label:"MOMENTS",target:"#world-tab=moments",description:"Moments that give the World its time." ,symbol:"moon"},
      {label:"OBJECTS",target:"#world-tab=objects",description:"Physical things that carry meaning." ,symbol:"object"},
      {label:"ART",target:"#art",description:"Where life becomes the medium." ,symbol:"art"}
    ]
  },
  {
    id:"depth",
    label:"DEEPER",
    description:"The layers beneath the first view.",
    entries:[
      {label:"FRAGMENTS",target:"#world-tab=fragments",description:"Pieces that do not tell the whole story alone." ,symbol:"fragment"},
      {label:"PROOF",target:"#world-tab=proof",description:"Records, sources, and things that can be examined." ,symbol:"proof"},
      {label:"BODIES",target:"#world-tab=bodies",description:"The physical and human record." ,symbol:"body"},
      {label:"ARCHIVES",target:"#archives",description:"What has been preserved." ,symbol:"archives"},
      {label:"CONNECTIONS",target:"#trace",description:"Where separate records begin to touch." ,symbol:"connection"}
    ]
  },
  {
    id:"trace",
    label:"TRACE",
    description:"The thread you build by moving through what you find.",
    entries:[
      {label:"YOUR THREAD",target:"#trace",description:"Your path through the World." ,symbol:"trace"},
      {label:"WORLD THREADS",target:"#trace",description:"Connections already present between records." ,symbol:"connection"},
      {label:"CONNECTED RECORDS",target:"#trace",description:"What becomes related as you discover it." ,symbol:"connection"},
      {label:"DISCOVERIES",target:"#trace",description:"The marks your passage leaves behind." ,symbol:"trace"}
    ]
  },
  {
    id:"art",
    label:"ART",
    description:"Different forms of the same life.",
    entries:[
      {label:"MUSIC",target:"#art/music",description:"Sound, tracks, and musical work." ,symbol:"music"},
      {label:"WORDS",target:"#art/words",description:"Writing, poetry, and language." ,symbol:"words"},
      {label:"VISUAL",target:"#art/visual",description:"Drawings, painting, photography, and film." ,symbol:"visual"},
      {label:"PROJECTS",target:"#art/projects",description:"Larger bodies of work." ,symbol:"project"}
    ]
  },
  {
    id:"records",
    label:"RECORDS",
    description:"The forms the World can take when something is kept.",
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
    description:"The part of the World that lets you look, listen, respond, and return.",
    entries:[
      {label:"GLASS EYE",target:"#glass-eye",description:"The screen as an active point of contact." ,symbol:"aperture"},
      {label:"OBSERVE",target:"#glass-eye"},
      {label:"HEAR",target:"#glass-eye"},
      {label:"FOLLOW",target:"#glass-eye"},
      {label:"RETURN",target:"#glass-eye"}
    ]
  },
  {
    id:"investigations",
    label:"INVESTIGATIONS",
    description:"Questions, evidence, and records that may not resolve cleanly.",
    entries:[
      {label:"CASE FILES",target:"#investigation" ,symbol:"case-files"},
      {label:"EVIDENCE",target:"#investigation"},
      {label:"QUESTIONS",target:"#investigation"},
      {label:"UNRESOLVED",target:"#investigation"}
    ]
  },
  {
    id:"archive",
    label:"ARCHIVE",
    description:"Preserved material that gives the World a memory.",
    entries:[
      {label:"DOCUMENTS",target:"#archives"},
      {label:"PHOTOGRAPHS",target:"#archives"},
      {label:"AUDIO",target:"#archives"},
      {label:"VIDEO",target:"#archives"},
      {label:"PRESERVED RECORDS",target:"#archives"}
    ]
  },
  {
    id:"projects",
    label:"PROJECTS",
    description:"Work that extends beyond a single record.",
    entries:[
      {label:"CLOTHING",target:"#projects",description:"The wearable side of the work."},
      {label:"CURRENT WORK",target:"#projects",description:"Projects become public when they are ready."}
    ]
  }
];
