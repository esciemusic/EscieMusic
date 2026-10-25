/* ESCIE PUBLIC PROJECT REGISTRY
 * Only transmitted structure belongs here.
 * Future transmissions are injected during the private Pages build.
 */
const ESCIE_PROJECTS=[{
  id:"bam-by-any-means",
  artist:"ESCIE",
  title:"BAM: BY ANY MEANS",
  type:"project",
  status:"active",
  published:true,
  release_mode:"progressive",
  visibility:"public",
  description:"ESCIE's debut project — first transmission, investigation, evidence, event, and doorway.",
  structure:[
    {number:"001",title:"DALLAS '63",role:"THE MYTH",trackId:"bam-001-dallas-63"}
  ]
}];
if(typeof window!=="undefined") window.ESCIE_PROJECTS=ESCIE_PROJECTS;
if(typeof module!=="undefined"&&module.exports) module.exports=ESCIE_PROJECTS;
