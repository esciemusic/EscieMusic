/* ESCIE PUBLIC PUBLISHING CONTRACT
 * Determines whether a normalized record may cross into a public section.
 * This is a gate, not an editor: it never changes source records.
 */
(function(){
  "use strict";

  const BLOCKED_VISIBILITY=new Set(["private","withheld","limited"]);
  const PUBLIC_SECTIONS=new Set(["now","art","world","web","archives","investigation","glass-eye","escie"]);

  function approved(record){
    if(!record||!record.id) return false;
    if(record.published!==true) return false;
    if(BLOCKED_VISIBILITY.has(String(record.visibility||"").toLowerCase())) return false;
    if(record.release_status && String(record.release_status).toLowerCase()!=="released") return false;
    return true;
  }

  function explicitSections(record){
    const values=record&&record.public_sections;
    return Array.isArray(values)?values.filter(id=>PUBLIC_SECTIONS.has(id)):[];
  }

  function inferSections(record){
    if(!approved(record)) return [];
    const contract=window.ESCIE_PUBLIC_SECTIONS;
    const manifest=window.ESCIE_RECORD_REGISTRY&&typeof window.ESCIE_RECORD_REGISTRY.manifestFor==="function"
      ? window.ESCIE_RECORD_REGISTRY.manifestFor(record.id):null;
    const sections=manifest&&manifest.sections?manifest.sections:{};
    const result=[];
    Object.keys(sections).forEach(id=>{ if(sections[id]&&PUBLIC_SECTIONS.has(id)) result.push(id); });
    return result;
  }

  function sectionsFor(record){
    const explicit=explicitSections(record);
    return explicit.length?explicit:inferSections(record);
  }

  function canEnter(record,section){
    return PUBLIC_SECTIONS.has(section)&&approved(record)&&sectionsFor(record).includes(section);
  }

  function publicRecords(section){
    const registry=window.ESCIE_RECORD_REGISTRY;
    if(!registry||typeof registry.allPublicRecords!=="function") return [];
    return registry.allPublicRecords().filter(record=>canEnter(record,section));
  }

  function audit(records){
    const list=Array.isArray(records)?records:[];
    const errors=[];
    list.forEach(record=>{
      if(!approved(record)) return;
      explicitSections(record).forEach(section=>{
        if(!PUBLIC_SECTIONS.has(section)) errors.push({record:record.id,section,error:"unknown public section"});
      });
      if(record.release_status && String(record.release_status).toLowerCase()==="locked"){
        errors.push({record:record.id,error:"locked record cannot enter public surface"});
      }
    });
    return {ok:errors.length===0,errors};
  }

  window.ESCIE_PUBLIC_PUBLISHING={
    version:"1.0.0",
    sections:Array.from(PUBLIC_SECTIONS),
    approved,
    sectionsFor,
    canEnter,
    publicRecords,
    audit
  };
})();
