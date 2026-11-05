/* ESCIE PUBLIC ARTIFACT CONTRACT
 * Preparation records only. No record is public until release_status=released
 * and published=true through the public publishing gate.
 */
const ESCIE_PUBLIC_ARTIFACTS={
  version:"1.0.0",
  status:"preparation",
  release_date:"2026-11-22",
  artist_approval_required:true,
  records:[
    {id:"D01",title:"26",type:"artifact",public_section:"art",status:"development",visibility:"private",published:false,release_status:"locked"},
    {id:"D02",title:"DISTANCE",type:"artifact",public_section:"world",status:"development",visibility:"private",published:false,release_status:"locked"},
    {id:"D03",title:"UNDER SIX",type:"artifact",public_section:"glass-eye",status:"development",visibility:"private",published:false,release_status:"locked"},
    {id:"D04",title:"WINDOW",type:"artifact",public_section:"glass-eye",status:"development",visibility:"private",published:false,release_status:"locked"},
    {id:"D05",title:"PINK",type:"artifact",public_section:"art",status:"development",visibility:"private",published:false,release_status:"locked"},
    {id:"D06",title:"FRAGMENT",type:"artifact",public_section:"art",status:"development",visibility:"private",published:false,release_status:"locked"},
    {id:"D07",title:"MAP",type:"artifact",public_section:"world",status:"development",visibility:"private",published:false,release_status:"locked"},
    {id:"D08",title:"SOUND FROM NOWHERE",type:"artifact",public_section:"glass-eye",status:"development",visibility:"private",published:false,release_status:"locked"},
    {id:"D09",title:"THREE",type:"artifact",public_section:"art",status:"development",visibility:"private",published:false,release_status:"locked"},
    {id:"D10",title:"EMPTY CHAIR",type:"artifact",public_section:"world",status:"development",visibility:"private",published:false,release_status:"locked"},
    {id:"D11",title:"CAMERA",type:"artifact",public_section:"glass-eye",status:"development",visibility:"private",published:false,release_status:"locked"},
    {id:"D12",title:"THE VIEW",type:"artifact",public_section:"glass-eye",status:"development",visibility:"private",published:false,release_status:"locked"}
  ]
};
if(typeof window!=="undefined") window.ESCIE_PUBLIC_ARTIFACTS=ESCIE_PUBLIC_ARTIFACTS;
if(typeof module!=="undefined"&&module.exports) module.exports=ESCIE_PUBLIC_ARTIFACTS;
