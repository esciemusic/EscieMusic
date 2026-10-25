/* ESCIE RECORD CONTRACT
 * One reusable metadata shape for every record type.
 * Empty arrays are intentional: absence of data is not permission to invent it.
 */
const ESCIE_RECORD_CONTRACT={
  version:"1.0.0",
  fields:[
    "id","type","title","description","status","visibility","published",
    "reality","reality_level","certainty","knowledge",
    "date","date_start","date_end",
    "people","locations","media","evidence","symbols","tags",
    "relationships","related_content","project","parent","source",
    "origin","transformation","archive_state"
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

if(typeof window!=="undefined"){
  window.ESCIE_RECORD_CONTRACT=ESCIE_RECORD_CONTRACT;
  window.normalizeEscieRecord=normalizeEscieRecord;
}
if(typeof module!=="undefined"&&module.exports){
  module.exports={ESCIE_RECORD_CONTRACT,normalizeEscieRecord};
}