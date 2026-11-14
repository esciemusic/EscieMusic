/* ESCIE PUBLISHING — VALIDATE */
const PUBLIC_GATE=require("../data/public-publishing.js");
const REQUIRED_PUBLIC_FIELDS=Object.freeze(["id","type"]);
function validatePublicRecord(record={}){
  const errors=[];
  for(const field of REQUIRED_PUBLIC_FIELDS)if(!record[field])errors.push(`Missing required public field: ${field}`);
  if(!PUBLIC_GATE.boundaryAudit(record).ok)PUBLIC_GATE.boundaryAudit(record).errors.forEach(error=>errors.push(error));
  if(!PUBLIC_GATE.approved(record))errors.push("Record is not approved by the canonical public publishing gate.");
  PUBLIC_GATE.sectionAudit(record).forEach(error=>errors.push(error.error||"Invalid public section."));
  return {valid:errors.length===0,errors};
}
function validateBuild(build={}){
  const errors=[],records=Array.isArray(build.records)?build.records:[],seenIds=new Set();
  records.forEach(record=>{
    const data=record.data||record;
    if(data&&data.published===false)return;
    const result=validatePublicRecord(data);
    if(!result.valid)errors.push({recordId:record.id||record.data?.id||null,errors:result.errors});
    const id=data&&data.id;
    if(id){if(seenIds.has(id))errors.push({recordId:id,errors:["Duplicate public record id."]});seenIds.add(id);}
  });
  return {valid:errors.length===0,errors};
}
const ESCIE_PUBLISH_VALIDATE={validatePublicRecord,validateBuild};
if(typeof window!=="undefined")window.ESCIE_PUBLISH_VALIDATE=ESCIE_PUBLISH_VALIDATE;
if(typeof module!=="undefined"&&module.exports)module.exports=ESCIE_PUBLISH_VALIDATE;