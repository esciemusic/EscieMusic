/* ESCIE RECORD CONTRACT
 * Universal storage compatibility layer.
 *
 * World has a smaller canonical public model:
 * PERSON / PLACE / MOMENT / OBJECT / ART.
 * This contract remains broad because Central, Case Files and the game use
 * additional record fields. Public World projection is normalized separately.
 */
const ESCIE_RECORD_CONTRACT={
  version:"2.0.0",
  visibilities:["private","review","public","archived"],
  legacy_visibilities:["withheld","limited","internal"],
  statuses:["review","active","archived","silence"],
  release_statuses:["locked","ready","released"],
  release_modes:["progressive"],
  world_types:["person","place","moment","object","art"],
  deep_types:["fragment","proof","body","archive"],
  fields:[
    "id","type","title","description","status","visibility","published",
    "certainty","knowledge","presence",
    "date","date_start","date_end",
    "people","locations","media","evidence","symbols","tags",
    "relationships","related_content","project","parent","source",
    "origin","transformation","archive_state","release_status","release_mode",
    "episode","scene","conditions","interactions","discoveries","questions","player_state","provenance",
    "game_id","game_version","player_visible","canonical_write"
  ]
};

const ESCIE_RECORD_VISIBILITY_MAP={
  public:"public",
  private:"private",
  review:"review",
  archived:"archived",
  internal:"review",
  withheld:"private",
  limited:"review"
};

const ESCIE_RECORD_STATUS_MAP={
  development:"review",
  review:"review",
  active:"active",
  published:"active",
  archived:"archived",
  silence:"archived"
};

function normalizeRecordVisibility(value){
  return ESCIE_RECORD_VISIBILITY_MAP[String(value||"review").toLowerCase()]||"review";
}

function normalizeRecordStatus(value){
  return ESCIE_RECORD_STATUS_MAP[String(value||"development").toLowerCase()]||"review";
}

function normalizeEscieRecord(record,type){
  if(!record||typeof record!=="object") return null;
  const normalized=Object.assign({},record);
  normalized.id=record.id||record.recordId||null;
  normalized.type=String(record.type||type||"record").toLowerCase();
  normalized.title=record.title||record.name||"UNTITLED";
  normalized.description=record.description||"";
  normalized.visibility=normalizeRecordVisibility(record.visibility);
  normalized.status=normalizeRecordStatus(record.status);
  normalized.published=record.published===true;
  normalized.certainty=record.certainty||null;
  normalized.knowledge=record.knowledge||null;
  normalized.presence=record.presence||record.presence_state||null;
  normalized.date=record.date||null;
  normalized.date_start=record.date_start||null;
  normalized.date_end=record.date_end||null;
  normalized.project=record.project||null;
  normalized.parent=record.parent||null;
  normalized.source=record.source||null;
  normalized.origin=record.origin||null;
  normalized.transformation=record.transformation||null;
  normalized.archive_state=record.archive_state||null;
  normalized.release_status=record.release_status ? String(record.release_status).toLowerCase() : "locked";
  normalized.release_mode=record.release_mode ? String(record.release_mode).toLowerCase() : null;
  normalized.episode=record.episode||null;
  normalized.scene=record.scene||null;
  normalized.conditions=Array.isArray(record.conditions)?record.conditions:[];
  normalized.interactions=Array.isArray(record.interactions)?record.interactions:[];
  normalized.discoveries=Array.isArray(record.discoveries)?record.discoveries:[];
  normalized.questions=Array.isArray(record.questions)?record.questions:[];
  normalized.player_state=record.player_state||null;
  normalized.provenance=record.provenance||null;
  normalized.game_id=record.game_id||null;
  normalized.game_version=record.game_version||null;
  normalized.player_visible=record.player_visible!==false;
  normalized.canonical_write=record.canonical_write===true;
  normalized.people=Array.isArray(record.people)?record.people:[];
  normalized.locations=Array.isArray(record.locations)?record.locations:[];
  normalized.media=Array.isArray(record.media)?record.media:[];
  normalized.evidence=Array.isArray(record.evidence)?record.evidence:[];
  normalized.symbols=Array.isArray(record.symbols)?record.symbols:[];
  normalized.tags=Array.isArray(record.tags)?record.tags:[];
  normalized.relationships=Array.isArray(record.relationships)?record.relationships:[];
  normalized.related_content=Array.isArray(record.related_content)?record.related_content:[];
  return normalized;
}

function validateEscieRecord(record){
  const errors=[],warnings=[];
  if(!record||typeof record!=="object") return {ok:false,errors:["record is not an object"],warnings:[]};
  if(!record.id) errors.push("missing id");
  if(!record.title||record.title==="UNTITLED") warnings.push("missing title");
  if(!ESCIE_RECORD_CONTRACT.visibilities.includes(normalizeRecordVisibility(record.visibility))) warnings.push("unknown visibility: "+record.visibility);
  if(!ESCIE_RECORD_CONTRACT.statuses.includes(normalizeRecordStatus(record.status))) warnings.push("unknown status: "+record.status);
  if(record.release_status&&!ESCIE_RECORD_CONTRACT.release_statuses.includes(String(record.release_status).toLowerCase())) errors.push("unknown release_status: "+record.release_status);
  if(record.release_mode&&!ESCIE_RECORD_CONTRACT.release_modes.includes(String(record.release_mode).toLowerCase())) errors.push("unknown release_mode: "+record.release_mode);
  if(String(record.release_mode||"").toLowerCase()==="progressive" && String(record.type||"").toLowerCase()!=="project") warnings.push("progressive release_mode is normally reserved for project records");
  ["people","locations","media","evidence","symbols","tags","relationships","related_content","conditions","interactions","discoveries","questions"].forEach(key=>{if(!Array.isArray(record[key])) errors.push(key+" must be an array");});
  if(Array.isArray(record.media)){
    record.media.forEach((item,index)=>{
      if(typeof item==="string"){if(!item.trim())warnings.push("media["+index+"] is empty");return;}
      if(!item||typeof item!=="object"){errors.push("media["+index+"] must be an object or URL string");return;}
      const url=item.url||item.src||item.href||item.embed;
      if(!url)errors.push("media["+index+"] is missing a URL");
      const mediaType=String(item.type||item.kind||"").toLowerCase();
      if(mediaType&&!["audio","video","image","photo","iframe","embed"].includes(mediaType))errors.push("media["+index+"] has unsupported type: "+mediaType);
    });
  }
  if(record.visibility==="public"&&String(record.release_status||"locked").toLowerCase()!=="released")warnings.push("public record is not released");
  return {ok:errors.length===0,errors,warnings};
}

if(typeof window!=="undefined"){
  window.ESCIE_RECORD_CONTRACT=ESCIE_RECORD_CONTRACT;
  window.normalizeEscieRecord=normalizeEscieRecord;
  window.validateEscieRecord=validateEscieRecord;
  window.normalizeRecordVisibility=normalizeRecordVisibility;
  window.normalizeRecordStatus=normalizeRecordStatus;
}
if(typeof module!=="undefined"&&module.exports){
  module.exports={ESCIE_RECORD_CONTRACT,normalizeEscieRecord,validateEscieRecord,normalizeRecordVisibility,normalizeRecordStatus};
}
