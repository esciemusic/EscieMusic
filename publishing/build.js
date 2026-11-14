/* ESCIE PUBLISHING — BUILD */
(function(){
"use strict";
const PUBLIC_GATE=typeof module!=="undefined"&&module.exports?require("../data/public-publishing.js"):window.ESCIE_PUBLIC_PUBLISHING;
function isPublicRecord(record={}){return !!record&&PUBLIC_GATE.boundaryAudit(record).ok&&PUBLIC_GATE.approved(record);}
function buildPublicRecords(records=[]){
  if(!Array.isArray(records))return [];
  const seenIds=new Set();
  return records.filter(isPublicRecord).filter(record=>{const id=record&&record.id;if(!id||seenIds.has(id))return false;seenIds.add(id);return true;}).map(record=>({id:record.id||null,type:record.type||null,title:record.title||"",data:{...record}}));
}
function createBuildPlan(input={}){
  const supplied=Array.isArray(input.records)?input.records:[];
  const records=supplied;
  const seenIds=new Set();
  records.forEach(record=>{if(!isPublicRecord(record))return;const id=record&&record.id;if(!id)return;if(seenIds.has(id))throw new Error("Duplicate public record id: "+id);seenIds.add(id);});
  return {createdAt:new Date().toISOString(),environment:input.environment||"production",records:buildPublicRecords(records),routes:Array.isArray(input.routes)?[...input.routes]:[],assets:Array.isArray(input.assets)?[...input.assets]:[]};
}
const ESCIE_PUBLISH_BUILD={isPublicRecord,buildPublicRecords,createBuildPlan};
if(typeof window!=="undefined")window.ESCIE_PUBLISH_BUILD=ESCIE_PUBLISH_BUILD;
if(typeof module!=="undefined"&&module.exports)module.exports=ESCIE_PUBLISH_BUILD;
})();