/* ESCIE PUBLIC PUBLISHING CONTRACT
 * Determines whether a normalized record may cross into a public section.
 * This is a gate, not an editor: it never changes source records.
 * Central remains the private control plane; this is the public projection boundary.
 */
(function(){
  "use strict";
  const BLOCKED_VISIBILITY=new Set(["private","withheld","limited"]);
  const PUBLIC_SECTIONS=new Set(["now","art","world","web","archives","investigation","glass-eye","escie"]);
  function approved(record){
    if(!record||!record.id)return false;
    const published=record.published===true||String(record.status||"").toLowerCase()==="published";
    if(!published||BLOCKED_VISIBILITY.has(String(record.visibility||"").toLowerCase()))return false;
    if(record.release_state!==undefined&&record.release_state!==null&&String(record.release_state).toUpperCase()!=="RELEASED")return false;
    if(record.release_status!==undefined&&record.release_status!==null&&String(record.release_status).toLowerCase()!=="released")return false;
    if(record.public_disclosure===false||record.approved===false)return false;
    return true;
  }
  function sectionAudit(record){
    const errors=[],values=record&&record.public_sections;
    if(values===undefined||values===null)return errors;
    if(!Array.isArray(values)){errors.push({record:record.id||null,error:"public_sections must be an array"});return errors;}
    values.forEach(section=>{if(!PUBLIC_SECTIONS.has(section))errors.push({record:record.id||null,section,error:"unknown public section"});});
    return errors;
  }
  function boundaryAudit(record){
    const errors=[];
    if(!record||typeof record!=="object")return {ok:false,errors:["record is not an object"]};
    if(!record.id)errors.push("missing stable entity id");
    if(record.canonical_write===true)errors.push("public projection cannot request canonical write");
    if(record.central_secret===true)errors.push("Central secret material cannot cross public boundary");
    if(String(record.public_source||"").toLowerCase()==="central")errors.push("public source must be a projection, not Central storage");
    if(record.locked===true||String(record.release_state||"").toUpperCase()==="LOCKED")errors.push("locked record cannot cross public boundary");
    return {ok:errors.length===0,errors};
  }
  function explicitSections(record){const values=record&&record.public_sections;return Array.isArray(values)?values.filter(id=>PUBLIC_SECTIONS.has(id)):[];}
  function inferSections(record){
    if(!approved(record))return [];
    const registry=window.ESCIE_RECORD_REGISTRY;
    const manifest=registry&&typeof registry.manifestFor==="function"?registry.manifestFor(record.id):null;
    const sections=manifest&&manifest.sections?manifest.sections:{},result=[];
    Object.keys(sections).forEach(id=>{if(sections[id]&&PUBLIC_SECTIONS.has(id))result.push(id);});
    return result;
  }
  function sectionsFor(record){const explicit=explicitSections(record);return explicit.length?explicit:inferSections(record);}
  function canEnter(record,section){return PUBLIC_SECTIONS.has(section)&&boundaryAudit(record).ok&&approved(record)&&sectionAudit(record).length===0&&sectionsFor(record).includes(section);}
  function publicRecords(section){
    const registry=window.ESCIE_RECORD_REGISTRY;
    if(!registry||typeof registry.allPublicRecords!=="function")return [];
    return registry.allPublicRecords().filter(record=>canEnter(record,section));
  }
  function audit(records){
    const errors=[];
    (Array.isArray(records)?records:[]).forEach(record=>{
      sectionAudit(record).forEach(error=>errors.push(error));
      const boundary=boundaryAudit(record); if(!boundary.ok)boundary.errors.forEach(error=>errors.push({record:record.id||null,error}));
      if(record&&((record.release_state!==undefined&&String(record.release_state).toUpperCase()==="LOCKED")||(record.release_status!==undefined&&String(record.release_status).toLowerCase()==="locked")))errors.push({record:record.id,error:"locked record cannot enter public surface"});
    });
    return {ok:errors.length===0,errors};
  }
  window.ESCIE_PUBLIC_PUBLISHING={version:"1.4.0",sections:Array.from(PUBLIC_SECTIONS),approved,boundaryAudit,sectionAudit,sectionsFor,canEnter,publicRecords,audit};
  if(typeof module!=="undefined"&&module.exports)module.exports=window.ESCIE_PUBLIC_PUBLISHING;
})();