/* ESCIE ART REGISTRY
 * Creative forms beyond the existing music/project records.
 * Empty arrays are intentional until public work is approved for release.
 */
const ESCIE_POETRY=[];
const ESCIE_DRAWINGS=[];
const ESCIE_PAINTINGS=[];
const ESCIE_WRITING=[];
const ESCIE_VISUAL_ART=[];
const ESCIE_OTHER_ART=[];

const ESCIE_ART_CATEGORIES=[
  {id:"music",label:"MUSIC",types:["music"]},
  {id:"poetry",label:"POETRY",types:["poetry"]},
  {id:"drawings",label:"DRAWINGS",types:["drawing","drawings"]},
  {id:"painting",label:"PAINTING",types:["painting"]},
  {id:"writing",label:"WRITING",types:["writing"]},
  {id:"film-visual",label:"FILM / VISUAL",types:["visual","film","photography"]},
  {id:"other",label:"OTHER",types:["other_art"]}
];

if(typeof window!=="undefined"){
  window.ESCIE_POETRY=ESCIE_POETRY;
  window.ESCIE_DRAWINGS=ESCIE_DRAWINGS;
  window.ESCIE_PAINTINGS=ESCIE_PAINTINGS;
  window.ESCIE_WRITING=ESCIE_WRITING;
  window.ESCIE_VISUAL_ART=ESCIE_VISUAL_ART;
  window.ESCIE_OTHER_ART=ESCIE_OTHER_ART;
  window.ESCIE_ART_CATEGORIES=ESCIE_ART_CATEGORIES;
}
if(typeof module!=="undefined"&&module.exports){
  module.exports={ESCIE_POETRY,ESCIE_DRAWINGS,ESCIE_PAINTINGS,ESCIE_WRITING,ESCIE_VISUAL_ART,ESCIE_OTHER_ART,ESCIE_ART_CATEGORIES};
}
