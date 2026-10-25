/* ESCIE PROJECT REGISTRY */
const ESCIE_PROJECTS = [{
  id:"bam-by-any-means",
  artist:"ESCIE",
  title:"BAM: BY ANY MEANS",
  type:"project",
  status:"active",
  published:true,
  visibility:"public",
  description:"ESCIE's debut project — first transmission, investigation, evidence, event, and doorway.",
  questions:["WHO MADE HIM?","WHAT DID HE BECOME?","WHAT WILL HE MAKE?"],
  structure:[
    {number:"001",title:"DALLAS '63",role:"THE MYTH",trackId:"bam-001-dallas-63"},
    {number:"002",title:"PUMPY TO THE CHEST",role:"THE MONSTER",trackId:"bam-002-pumpy-to-the-chest"},
    {number:"003",title:"I NEED A FLEX",role:"THE FATHER",trackId:"bam-003-i-need-a-flex"},
    {number:"004",title:"SANA, SANA, COLITA DE RANA",role:"THE INHERITANCE",trackId:"bam-004-sana-sana"},
    {number:"005",title:"BACC 2 BASICS",role:"THE TRAP",trackId:"bam-005-bacc-2-basics"},
    {number:"006",title:"DICHOTOMY",role:"THE HUMAN",trackId:"bam-006-dichotomy"}
  ]
}];
if(typeof window!=="undefined") window.ESCIE_PROJECTS=ESCIE_PROJECTS;
if(typeof module!=="undefined"&&module.exports) module.exports=ESCIE_PROJECTS;