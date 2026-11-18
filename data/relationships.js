/* ESCIE CANONICAL RELATIONSHIPS
 * Seed relationships only. The contract lives in web-contract.js.
 * Legacy field names are exposed for compatibility with older consumers.
 */
const ESCIE_RELATIONSHIPS=[
  {
    id:"rel-escie-montreal",
    source_id:"escie",
    target_id:"montreal",
    relationship_type:"LOCATED_AT",
    direction:"DIRECTED",
    time:null,
    context:"ESCIE is rooted in Montréal.",
    strength:"verified",
    certainty:"CONFIRMED",
    status:"ACTIVE",
    visibility:"PUBLIC",
    release_status:"RELEASED",
    provenance:"canonical-seed",
    evidence:[]
  },
  {
    id:"rel-parc-extension-montreal",
    source_id:"parc-extension",
    target_id:"montreal",
    relationship_type:"BELONGS_TO",
    direction:"DIRECTED",
    time:null,
    context:"Parc-Extension is a neighbourhood within Montréal.",
    strength:"verified",
    certainty:"CONFIRMED",
    status:"ACTIVE",
    visibility:"PUBLIC",
    release_status:"RELEASED",
    provenance:"canonical-seed",
    evidence:[]
  },
  {
    id:"rel-mile-end-montreal",
    source_id:"mile-end",
    target_id:"montreal",
    relationship_type:"BELONGS_TO",
    direction:"DIRECTED",
    time:null,
    context:"Mile End is a Montréal neighbourhood.",
    strength:"verified",
    certainty:"CONFIRMED",
    status:"ACTIVE",
    visibility:"PUBLIC",
    release_status:"RELEASED",
    provenance:"canonical-seed",
    evidence:[]
  },
  {
    id:"rel-rosemont-montreal",
    source_id:"rosemont",
    target_id:"montreal",
    relationship_type:"BELONGS_TO",
    direction:"DIRECTED",
    time:null,
    context:"Rosemont is a Montréal neighbourhood.",
    strength:"verified",
    certainty:"CONFIRMED",
    status:"ACTIVE",
    visibility:"PUBLIC",
    release_status:"RELEASED",
    provenance:"canonical-seed",
    evidence:[]
  }
];

function legacyRelationshipView(r){
  return Object.assign({},r,{
    from:r.source_id,
    type:r.relationship_type,
    to:r.target_id,
    canonical_status:"canonical",
    public_disclosure:r.visibility==="PUBLIC"
  });
}

const ESCIE_RELATIONSHIPS_LEGACY=ESCIE_RELATIONSHIPS.map(legacyRelationshipView);

if(typeof window!=="undefined"){
  window.ESCIE_RELATIONSHIPS=ESCIE_RELATIONSHIPS;
  window.ESCIE_RELATIONSHIPS_LEGACY=ESCIE_RELATIONSHIPS_LEGACY;
}
if(typeof module!=="undefined"&&module.exports)module.exports=ESCIE_RELATIONSHIPS;
