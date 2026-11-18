/* ESCIE CONNECTION / WORLD CONTRACT
 * Canonical public relationship contract for ESCIE's World.
 * World contains things. Connections define meaningful relationships.
 * Trace presents those relationships as a visitor experience.
 * Web remains the internal name for the total network.
 *
 * Compatibility note:
 * Older records may use legacy visibility/status/field names. Normalization
 * accepts them while exposing one canonical shape to the public system.
 */
(function(root){
"use strict";

const WORLD_TYPES=["PERSON","PLACE","MOMENT","OBJECT","ART"];
const DEEP_TYPES=["FRAGMENT","PROOF","BODY","ARCHIVE"];
const NODE_TYPES=WORLD_TYPES.concat(DEEP_TYPES,["CASE_FILE","SIGNAL","RECORD","EVENT","SYMBOL"]);
const PRESENCE_STATES=["PRESENT","RECORDED","REMEMBERED","ABSENT","UNRESOLVED","EMERGING"];
const CERTAINTY=["CONFIRMED","DOCUMENTED","ATTRIBUTED","SUGGESTED","UNRESOLVED","CONTRADICTED","UNKNOWN"];
const VISIBILITY=["PRIVATE","REVIEW","PUBLIC","ARCHIVED"];
const RELEASE_STATUS=["LOCKED","READY","RELEASED"];

const RELATIONSHIP_TYPES=[
  "LOCATED_AT","PASSED_THROUGH","CONNECTED_TO","INVOLVES","KNOWS",
  "RELATED_TO","BELONGS_TO","PRECEDES","FOLLOWS","OCCURRED_DURING",
  "CREATED","CREATED_BY","INSPIRED","INSPIRED_BY","APPEARS_IN","REFERENCES","BECAME",
  "DOCUMENTED_BY","SUPPORTED_BY","CONTRADICTED_BY","POINTS_TO","LEADS_TO",
  "REVEALS","HIDES","ECHOES","DISCOVERED_FROM","DISCOVERED_BY",
  "CONTAINS","PART_OF","VERSION_OF","GROUPED_WITH","DERIVED_FROM",
  "CONTRIBUTED_TO","RESPONDS_TO","RECONTEXTUALIZES","CONTRASTS_WITH",
  "FAMILY_OF","FRIEND_OF","COLLABORATED_WITH","INFLUENCED_BY","FEATURED_IN","SUBJECT_OF",
  "CREATED_AT","RECORDED_AT","PERFORMED_AT","OCCURRED_AT","DEPICTS","ANCHORED_IN",
  "CREATED_DURING","PRECEDED_BY","FOLLOWED_BY","COINCIDES_WITH","RESULTED_IN",
  "CONTRADICTS","CORROBORATES","CONTEXTUALIZES","CHALLENGES","INVESTIGATES","EXAMINES","INCLUDES",
  "POSSIBLY_RELATED","RESEMBLES","ASSOCIATED_WITH"
];

const RELATIONSHIP_STATUS=["ACTIVE","ARCHIVED","UNRESOLVED","CONTESTED"];
const RELATIONSHIP_DIRECTIONS=["DIRECTED","UNDIRECTED"];

const LEGACY_VISIBILITY_MAP={
  PUBLIC:"PUBLIC",
  PRIVATE:"PRIVATE",
  INTERNAL:"REVIEW",
  REVIEW:"REVIEW",
  ARCHIVED:"ARCHIVED",
  WITHHELD:"PRIVATE",
  LIMITED:"REVIEW"
};

const LEGACY_STATUS_MAP={
  DEVELOPMENT:"REVIEW",
  ACTIVE:"ACTIVE",
  PUBLISHED:"ACTIVE",
  ARCHIVED:"ARCHIVED",
  SILENCE:"ARCHIVED",
  CONFIRMED:"ACTIVE",
  DOCUMENTED:"ACTIVE",
  SUGGESTED:"UNRESOLVED",
  UNRESOLVED:"UNRESOLVED",
  CONTRADICTED:"CONTESTED",
  UNKNOWN:"UNRESOLVED"
};

const NODE_SCHEMA={
  id:null,type:null,title:"UNTITLED",short_description:"",
  visibility:"PRIVATE",status:"REVIEW",presence:"UNRESOLVED",
  certainty:"UNKNOWN",release_status:"LOCKED",
  date:null,date_start:null,date_end:null,location:null,media:[],
  tags:[],provenance:null,relationships:[]
};

const RELATIONSHIP_SCHEMA={
  id:null,source_id:null,target_id:null,relationship_type:null,
  direction:"DIRECTED",time:null,context:"",
  strength:null,certainty:"UNKNOWN",status:"UNRESOLVED",
  visibility:"PRIVATE",release_status:"LOCKED",
  provenance:null,evidence:[],created_at:null,updated_at:null
};

const list=v=>Array.isArray(v)?v.slice():[];
const upper=v=>String(v||"").toUpperCase();
const normalizeVisibility=v=>LEGACY_VISIBILITY_MAP[upper(v)||"PRIVATE"]||"PRIVATE";
const normalizeNodeStatus=v=>LEGACY_STATUS_MAP[upper(v)||"DEVELOPMENT"]||"REVIEW";
const normalizeRelationshipStatus=v=>{
  const s=upper(v||"UNRESOLVED");
  return ["ACTIVE","ARCHIVED","UNRESOLVED","CONTESTED"].includes(s)?s:LEGACY_STATUS_MAP[s]||"UNRESOLVED";
};

function normalizeNode(input){
  const s=input&&typeof input==="object"?input:{};
  return Object.assign({},NODE_SCHEMA,s,{
    id:s.id||null,
    type:upper(s.type)||null,
    title:String(s.title||s.name||"UNTITLED"),
    short_description:String(s.short_description||s.description||""),
    visibility:normalizeVisibility(s.visibility),
    status:normalizeNodeStatus(s.status),
    presence:upper(s.presence||s.presence_state||"UNRESOLVED"),
    certainty:upper(s.certainty||"UNKNOWN"),
    release_status:upper(s.release_status||(s.public_disclosure===true?"RELEASED":"LOCKED")),
    media:list(s.media),tags:list(s.tags),
    relationships:list(s.relationships)
  });
}

function normalizeRelationship(input){
  const s=input&&typeof input==="object"?input:{};
  const source=s.source_id||s.from||null;
  const target=s.target_id||s.to||null;
  const type=upper(s.relationship_type||s.type||"");
  return Object.assign({},RELATIONSHIP_SCHEMA,s,{
    id:s.id||null,
    source_id:source,
    target_id:target,
    relationship_type:type||null,
    direction:upper(s.direction||"DIRECTED"),
    time:s.time||s.temporal_context||s.date||null,
    context:String(s.context||s.description||""),
    strength:s.strength||s.confidence||null,
    certainty:upper(s.certainty||s.status||"UNKNOWN"),
    status:normalizeRelationshipStatus(s.lifecycle_status||s.status),
    visibility:normalizeVisibility(s.visibility),
    release_status:upper(s.release_status||"LOCKED"),
    provenance:s.provenance||null,
    evidence:list(s.evidence)
  });
}

function isPublicReleased(r){
  return !!r&&r.visibility==="PUBLIC"&&r.release_status==="RELEASED";
}

function validateNode(input){
  const node=normalizeNode(input),errors=[],warnings=[];
  if(!node.id)errors.push("missing id");
  if(!NODE_TYPES.includes(node.type))errors.push("unsupported node type: "+node.type);
  if(!VISIBILITY.includes(node.visibility))errors.push("unsupported visibility: "+node.visibility);
  if(!PRESENCE_STATES.includes(node.presence))errors.push("unsupported presence: "+node.presence);
  if(!CERTAINTY.includes(node.certainty))errors.push("unsupported certainty: "+node.certainty);
  if(!RELEASE_STATUS.includes(node.release_status))errors.push("unsupported release_status: "+node.release_status);
  if(node.visibility==="PUBLIC"&&node.release_status!=="RELEASED")warnings.push("public node is not released");
  return {ok:errors.length===0,errors,warnings,node};
}

function validateRelationship(input){
  const relationship=normalizeRelationship(input),errors=[],warnings=[];
  if(!relationship.id)errors.push("missing id");
  if(!relationship.source_id)errors.push("missing source_id");
  if(!relationship.target_id)errors.push("missing target_id");
  if(relationship.source_id===relationship.target_id)errors.push("self relationship is not allowed");
  if(!RELATIONSHIP_TYPES.includes(relationship.relationship_type))errors.push("unsupported relationship type: "+relationship.relationship_type);
  if(!RELATIONSHIP_DIRECTIONS.includes(relationship.direction))errors.push("unsupported direction: "+relationship.direction);
  if(!RELATIONSHIP_STATUS.includes(relationship.status))errors.push("unsupported relationship status: "+relationship.status);
  if(!VISIBILITY.includes(relationship.visibility))errors.push("unsupported visibility: "+relationship.visibility);
  if(!RELEASE_STATUS.includes(relationship.release_status))errors.push("unsupported release_status: "+relationship.release_status);
  if(relationship.visibility==="PUBLIC"&&relationship.release_status!=="RELEASED")warnings.push("public relationship is not released");
  return {ok:errors.length===0,errors,warnings,relationship};
}

const ESCIE_WEB_CONTRACT={
  version:"2.0.0",
  world_types:WORLD_TYPES,
  deep_types:DEEP_TYPES,
  node_types:NODE_TYPES,
  presence_states:PRESENCE_STATES,
  certainty:CERTAINTY,
  visibility:VISIBILITY,
  release_status:RELEASE_STATUS,
  relationship_types:RELATIONSHIP_TYPES,
  relationship_status:RELATIONSHIP_STATUS,
  relationship_directions:RELATIONSHIP_DIRECTIONS,
  node_schema:NODE_SCHEMA,
  relationship_schema:RELATIONSHIP_SCHEMA,
  governing_principle:"EVERYTHING CAN CONNECT. NOTHING CONNECTS WITHOUT A REASON.",
  roles:{
    world:"canonical things that exist",
    connections:"meaningful relationships between things",
    trace:"visitor experience of following connections",
    web:"total internal network",
    case_files:"investigative mode",
    glass_eye:"visitor participation"
  }
};

root.ESCIE_WEB_CONTRACT=ESCIE_WEB_CONTRACT;
root.ESCIE_WEB={normalizeNode,normalizeRelationship,validateNode,validateRelationship,isPublicReleased,normalizeVisibility,normalizeNodeStatus,normalizeRelationshipStatus};
if(typeof module!=="undefined"&&module.exports)module.exports={ESCIE_WEB_CONTRACT,normalizeNode,normalizeRelationship,validateNode,validateRelationship,isPublicReleased,normalizeVisibility,normalizeNodeStatus,normalizeRelationshipStatus};
})(typeof window!=="undefined"?window:globalThis);
