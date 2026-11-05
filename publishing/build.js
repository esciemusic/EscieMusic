/* ESCIE PUBLISHING — BUILD */
function isPublicRecord(record={}){
  if(!record)return false;
  const gate=typeof window!=="undefined"?window.ESCIE_PUBLIC_PUBLISHING:null;
  if(gate&&typeof gate.approved==="function")return gate.approved(record);
  const registry=typeof window!=="undefined"?window.ESCIE_RECORD_REGISTRY:null;
  if(registry&&typeof registry.releaseVisible==="function"){if(!registry.releaseVisible(record))return false;}
  else if(record.release_status&&record.release_status!=="released")return false;
  else if(record.type==="project"&&record.release_mode==="progressive")return false;
  if(!(record.published===true||record.status==="published"))return false;
  if(["private","withheld","limited"].includes(String(record.visibility||"").toLowerCase()))return false;
  return record.public_disclosure!==false;
}
function buildPublicRecords(records=[]){
  if(!Array.isArray(records))return [];
  const seenIds=new Set();
  return records.filter(isPublicRecord).filter(record=>{const id=record&&record.id;if(!id||seenIds.has(id))return false;seenIds.add(id);return true;}).map(record=>({id:record.id||null,type:record.type||null,title:record.title||"",data:{...record}}));
}
function createBuildPlan(input={}){
  const registry=typeof window!=="undefined"?window.ESCIE_RECORD_REGISTRY:null;
  const supplied=Array.isArray(input.records)?input.records:[];
  const records=registry&&typeof registry.allPublicRecords==="function"?registry.allPublicRecords():supplied;
  const seenIds=new Set();
  records.forEach(record=>{if(!isPublicRecord(record))return;const id=record&&record.id;if(!id)return;if(seenIds.has(id))throw new Error("Duplicate public record id: "+id);seenIds.add(id);});
  return {createdAt:new Date().toISOString(),environment:input.environment||"production",records:buildPublicRecords(records),routes:Array.isArray(input.routes)?[...input.routes]:[],assets:Array.isArray(input.assets)?[...input.assets]:[]};
}
const ESCIE_PUBLISH_BUILD={isPublicRecord,buildPublicRecords,createBuildPlan};
if(typeof window!=="undefined")window.ESCIE_PUBLISH_BUILD=ESCIE_PUBLISH_BUILD;
if(typeof module!=="undefined"&&module.exports)module.exports=ESCIE_PUBLISH_BUILD;