const ESCIE_RELATIONSHIPS=[
{id:"rel-escie-bam",from:"escie",type:"created",to:"bam-by-any-means",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true},
{id:"rel-escie-montreal",from:"escie",type:"anchored_in",to:"montreal",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true}
];
if(typeof window!=="undefined")window.ESCIE_RELATIONSHIPS=ESCIE_RELATIONSHIPS;
if(typeof module!=="undefined"&&module.exports)module.exports=ESCIE_RELATIONSHIPS;
