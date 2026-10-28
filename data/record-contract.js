/* ESCIE RECORD CONTRACT
 * One reusable metadata shape for every record type.
 * Empty arrays are intentional: absence of data is not permission to invent it.
 */
const ESCIE_RECORD_CONTRACT={
  version:"1.2.0",
  visibilities:["public","private","withheld","limited"],
  statuses:["development","active","published","archived","silence"],
  release_statuses:["locked","released"],
  release_modes:["progressive"],
  fields:[
    "id","type","title","description","status","visibility","published",
    "certainty","knowledge",
    "date","date_start","date_end",
    "people","locations","media","evidence","symbols","tags",
    "relationships","related_content","project","parent","source",
    "origin","transformation","archive_state","release_status","release_mode"
  ]
};

function normalizeEscieRecord(record,type){
  if(!record||typeof record!=="object") return null;
  const normalized=Object.assign({},record);
  normalized.id=record.id||record.recordId||null;
  normalized.type=record.type||type||"record";
  normalized.title=record.title||record.name||"UNTITLED";
  normalized.description=record.description||"";
  normalized.visibility=record.visibility||"public";
  normalized.status=record.status||"development";
  normalized.published=record.published===true;
  normalized.visibility=String(normalized.visibility).toLowerCase();
  normalized.status=String(normalized.status).toLowerCase();
  normalized.certainty=record.certainty||null;
  normalized.knowledge=record.knowledge||null;
  normalized.date=record.date||null;
  normalized.date_start=record.date_start||null;
  normalized.date_end=record.date_end||null;
  normalized.project=record.project||null;
  normalized.parent=record.parent||null;
  normalized.source=record.source||null;
  normalized.origin=record.origin||null;
  normalized.transformation=record.transformation||null;
  normalized.archive_state=record.archive_state||null;
  normalized.release_status=record.release_status ? String(record.release_status).toLowerCase() : null;
  normalized.release_mode=record.release_mode ? String(record.release_mode).toLowerCase() : null;
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
  const errors=[];
  const warnings=[];
  if(!record||typeof record!=="object") return {ok:false,errors:["record is not an object"],warnings:[]};
  if(!record.id) errors.push("missing id");
  if(!record.title||record.title==="UNTITLED") warnings.push("missing title");
  if(!ESCIE_RECORD_CONTRACT.visibilities.includes(String(record.visibility||"public").toLowerCase())) warnings.push("unknown visibility: "+record.visibility);
  if(!ESCIE_RECORD_CONTRACT.statuses.includes(String(record.status||"development").toLowerCase())) warnings.push("unknown status: "+record.status);
  if(record.release_status && !ESCIE_RECORD_CONTRACT.release_statuses.includes(String(record.release_status).toLowerCase())) errors.push("unknown release_status: "+record.release_status);
  if(record.release_mode && !ESCIE_RECORD_CONTRACT.release_modes.includes(String(record.release_mode).toLowerCase())) errors.push("unknown release_mode: "+record.release_mode);
  if(String(record.release_mode||"").toLowerCase()==="progressive" && record.type!=="project") warnings.push("progressive release_mode is normally reserved for project records");
  ["people","locations","media","evidence","symbols","tags","relationships","related_content"].forEach(key=>{if(!Array.isArray(record[key])) errors.push(key+" must be an array");});
  if(Array.isArray(record.media)){
    record.media.forEach((item,index)=>{
      if(typeof item==="string"){
        if(!item.trim()) warnings.push("media["+index+"] is empty");
        return;
      }
      if(!item||typeof item!=="object"){
        errors.push("media["+index+"] must be an object or URL string");
        return;
      }
      const url=item.url||item.src||item.href||item.embed;
      if(!url) errors.push("media["+index+"] is missing a URL");
      const type=String(item.type||item.kind||"").toLowerCase();
      if(type&&!["audio","video","image","photo","iframe","embed"].includes(type)){
        errors.push("media["+index+"] has unsupported type: "+type);
      }
    });
  }

  return {ok:errors.length===0,errors,warnings};
}

if(typeof window!=="undefined"){
  window.ESCIE_RECORD_CONTRACT=ESCIE_RECORD_CONTRACT;
  window.normalizeEscieRecord=normalizeEscieRecord;
  window.validateEscieRecord=validateEscieRecord;
}
if(typeof module!=="undefined"&&module.exports){
  module.exports={ESCIE_RECORD_CONTRACT,normalizeEscieRecord,validateEscieRecord};
}