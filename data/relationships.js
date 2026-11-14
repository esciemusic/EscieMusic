const ESCIE_RELATIONSHIPS=[
{id:"rel-escie-montreal",from:"escie",type:"anchored_in",to:"montreal",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true},
{id:"rel-parc-extension-montreal",from:"parc-extension",type:"part_of",to:"montreal",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true,context:"Parc-Extension is a neighbourhood within Montréal; this connection establishes the public geographic thread without adding personal interpretation."},
{id:"rel-mile-end-montreal",from:"mile-end",type:"part_of",to:"montreal",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true,context:"Mile End is a Montréal neighbourhood; this connection keeps the public city record connected to its neighbourhood geography."},
{id:"rel-rosemont-montreal",from:"rosemont",type:"part_of",to:"montreal",status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true,context:"Rosemont is a Montréal neighbourhood; this connection keeps the public city record connected to its neighbourhood geography."}
];
if(typeof window!=="undefined")window.ESCIE_RELATIONSHIPS=ESCIE_RELATIONSHIPS;
if(typeof module!=="undefined"&&module.exports)module.exports=ESCIE_RELATIONSHIPS;
