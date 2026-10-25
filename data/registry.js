/* ESCIE RECORD REGISTRY
 * Single normalized view of public-facing content.
 * Data files remain canonical; this layer only composes them.
 */
(function(){
  "use strict";
  function collection(name){
    const value=window[name];
    if(Array.isArray(value)) return value;
    if(value&&Array.isArray(value.records)) return value.records;
    if(value&&typeof value==="object") return Object.values(value);
    return [];
  }
  const sources=[
    ["identity",()=>{const about=window.ESCIE_ABOUT; return about?[about]:[];}],
    ["project",()=>collection("ESCIE_PROJECTS")],
    ["music",()=>collection("ESCIE_MUSIC")],
    ["person",()=>collection("ESCIE_PEOPLE")],
    ["location",()=>collection("ESCIE_LOCATIONS")],
    ["moment",()=>collection("ESCIE_MOMENTS")],
    ["fragment",()=>collection("ESCIE_FRAGMENTS")],
    ["body",()=>collection("ESCIE_BODIES")],
    ["path",()=>collection("ESCIE_PATHS")],
    ["investigation",()=>collection("ESCIE_INVESTIGATION")],
    ["archive",()=>collection("ESCIE_ARCHIVE")],
    ["signal",()=>collection("ESCIE_SIGNALS")]
  ];
  function build(){
    const records=[]; const seen=new Set(); const duplicates=[];
    sources.forEach(([type,getter])=>getter().forEach(record=>{
      if(!record||!record.id) return;
      if(seen.has(record.id)){duplicates.push(record.id);return;}
      seen.add(record.id);
      const normalizer=window.normalizeEscieRecord;
      records.push(
        typeof normalizer==="function"
          ? normalizer(record,type)
          : Object.assign({type:type},record)
      );
    }));
    return {records,byId:Object.fromEntries(records.map(r=>[r.id,r])),duplicates};
  }
  const built=build();
  window.ESCIE_RECORDS=built.records;
  window.ESCIE_RECORD_INDEX=built.byId;
  function contractAudit(){
    const validator=window.validateEscieRecord;
    const current=build();
    if(typeof validator!=="function") return {ok:true,available:false,errors:[],warnings:[]};
    const results=current.records.map(record=>({id:record.id,validation:validator(record)}));
    const errors=results.flatMap(item=>item.validation.errors.map(error=>({record:item.id,error})));
    const warnings=results.flatMap(item=>item.validation.warnings.map(warning=>({record:item.id,warning})));
    return {ok:errors.length===0,available:true,errors,warnings};
  }

  function relationshipAudit(){
    const current=build();
    const relationships=collection("ESCIE_RELATIONSHIPS");
    const missing=[];
    relationships.forEach(r=>{
      if(!r||!r.from||!r.to) return;
      if(!current.byId[r.from]) missing.push({id:r.id||null,side:"from",record:r.from});
      if(!current.byId[r.to]) missing.push({id:r.id||null,side:"to",record:r.to});
    });
    return {ok:missing.length===0&&current.duplicates.length===0,missing,duplicates:current.duplicates};
  }
  function contextFor(id){
    const current=build();
    const record=current.byId[id]||null;
    if(!record||!releaseVisible(record)) return {record:null,connections:[],parents:[],children:[]};
    const relationships=collection("ESCIE_RELATIONSHIPS");
    const connected=relationships
      .filter(r=>r&&r.public_disclosure===true&&(r.from===id||r.to===id))
      .map(r=>({
        id:r.id||null,
        type:r.type||"connection",
        direction:r.from===id?"out":"in",
        record:r.from===id?r.to:r.from
      }))
      .filter(item=>current.byId[item.record] && releaseVisible(current.byId[item.record]));
    return {
      record:current.byId[id]||null,
      connections:connected,
      parents:connected.filter(item=>item.direction==="in"&&["contains","parent","part-of","includes"].includes(item.type)),
      children:connected.filter(item=>item.direction==="out"&&["contains","includes","has-part"].includes(item.type))
    };
  }

  function referenceAudit(){
    const current=build();
    const symbols=collection("ESCIE_SYMBOLS");
    const symbolIds=new Set(symbols.map(s=>s&&s.id).filter(Boolean));
    const relationships=collection("ESCIE_RELATIONSHIPS");
    const hard=[]; const warnings=[];
    const checkRecordRef=(record,field,id)=>{
      if(!id) return;
      if(!current.byId[id]) warnings.push({record:record.id,field,reference:id});
    };
    current.records.forEach(record=>{
      ["people","locations","related_content"].forEach(field=>{
        const values=Array.isArray(record[field])?record[field]:[];
        values.forEach(id=>checkRecordRef(record,field,id));
      });
      ["project","parent","source"].forEach(field=>checkRecordRef(record,field,record[field]));
      (Array.isArray(record.symbols)?record.symbols:[]).forEach(id=>{
        if(!symbolIds.has(id)) warnings.push({record:record.id,field:"symbols",reference:id});
      });
      if(Array.isArray(record.relationships)){
        record.relationships.forEach(id=>{
          if(!relationships.some(rel=>rel&&rel.id===id)) warnings.push({record:record.id,field:"relationships",reference:id});
        });
      }
    });
    relationships.forEach(rel=>{
      if(!rel||!rel.id) return;
      if(!rel.from||!rel.to) hard.push({relationship:rel.id,error:"relationship requires from and to"});
    });
    return {ok:hard.length===0,errors:hard,warnings};
  }

  function publicNodes(){
    const nodes=collection("ESCIE_NODES").filter(node=>node&&node.public!==false);
    return nodes.slice().sort((a,b)=>(Number(a.order)||999)-(Number(b.order)||999)).map(node=>{
      const section=node.section||null;
      const records=section
        ? build().records.filter(record=>{
            const manifest=manifestFor(record.id);
            return releaseVisible(record)&&manifest&&manifest.sections&&manifest.sections[section]===true;
          })
        : [];
      return Object.assign({},node,{records:records.map(record=>record.id),recordCount:records.length});
    });
  }
  function nodeFor(id){
    return publicNodes().find(node=>node.id===id)||null;
  }

  function allPublicRecords(){
    return build().records.filter(record=>releaseVisible(record)&&record.published!==false&&record.visibility!=="private"&&record.visibility!=="withheld"&&record.visibility!=="limited");
  }

  function releaseVisible(record){
    if(!record) return false;
    if(record.release_status) return record.release_status==="released";
    if(record.type==="project"&&record.release_mode==="progressive"){
      return currentMusic().some(track=>track&&track.project===record.id&&track.release_status==="released");
    }
    return true;
  }
  function currentMusic(){ return collection("ESCIE_MUSIC"); }

  function releaseAudit(){
    const current=build();
    const errors=[];
    current.records.forEach(record=>{
      if(record.type!=="project"||record.release_mode!=="progressive") return;
      const tracks=currentMusic().filter(track=>track&&track.project===record.id);
      if(!tracks.length) errors.push({record:record.id,error:"progressive project has no release-controlled tracks"});
      const structure=Array.isArray(record.structure)?record.structure:[];
      const structureIds=structure.map(part=>part&&part.trackId).filter(Boolean);
      const uniqueStructureIds=new Set(structureIds);
      if(structureIds.length!==uniqueStructureIds.size){
        errors.push({record:record.id,error:"progressive project structure contains duplicate track ids"});
      }
      structureIds.forEach(trackId=>{
        const track=current.byId[trackId];
        if(!track) errors.push({record:record.id,track:trackId,error:"project structure references missing track"});
        else if(track.type!=="music") errors.push({record:record.id,track:trackId,error:"project structure reference is not a music record"});
        else if(track.project!==record.id) errors.push({record:record.id,track:trackId,error:"project structure track belongs to another project"});
      });
      tracks.forEach(track=>{
        if(!["locked","released"].includes(track.release_status)){
          errors.push({record:track.id,error:"release_status must be locked or released"});
        }
      });
    });
    return {ok:errors.length===0,errors};
  }

  function publicRelationships(filters){
    const current=build();
    const relationships=collection("ESCIE_RELATIONSHIPS");
    const f=filters||{};
    return relationships.filter(rel=>{
      if(!rel||rel.public_disclosure!==true) return false;
      if(rel.visibility&&["private","withheld"].includes(String(rel.visibility).toLowerCase())) return false;
      if(!rel.from||!rel.to||!current.byId[rel.from]||!current.byId[rel.to]) return false;
      if(!releaseVisible(current.byId[rel.from])||!releaseVisible(current.byId[rel.to])) return false;
      if(f.type&&String(rel.type||"").toLowerCase()!==String(f.type).toLowerCase()) return false;
      if(f.category&&typeof window!=="undefined"&&window.ESCIE_RELATIONSHIP&&typeof window.ESCIE_RELATIONSHIP.getCategory==="function"){
        if(window.ESCIE_RELATIONSHIP.getCategory(rel.type)!==f.category) return false;
      }
      if(f.record&&rel.from!==f.record&&rel.to!==f.record) return false;
      return true;
    });
  }
  function relationshipTypes(filters){
    return Array.from(new Set(publicRelationships(filters).map(rel=>rel.type).filter(Boolean))).sort();
  }
  function relationshipCategories(filters){
    const helper=typeof window!=="undefined"?window.ESCIE_RELATIONSHIP:null;
    return Array.from(new Set(publicRelationships(filters).map(rel=>helper&&typeof helper.getCategory==="function"?helper.getCategory(rel.type):null).filter(Boolean))).sort();
  }
  function relationshipsFor(id,filters){
    return publicRelationships(Object.assign({},filters||{}, {record:id}));
  }
  function relationshipCounts(filters){
    const list=publicRelationships(filters);
    const byType={}; const byCategory={}; const nodes=new Set();
    list.forEach(rel=>{
      nodes.add(rel.from); nodes.add(rel.to);
      byType[rel.type||"connection"]=(byType[rel.type||"connection"]||0)+1;
      const helper=typeof window!=="undefined"?window.ESCIE_RELATIONSHIP:null;
      const category=helper&&typeof helper.getCategory==="function"?helper.getCategory(rel.type):"UNKNOWN";
      byCategory[category||"UNKNOWN"]=(byCategory[category||"UNKNOWN"]||0)+1;
    });
    return {relationships:list.length,nodes:nodes.size,byType,byCategory};
  }

  function manifestFor(id){
    const current=build();
    const record=current.byId[id]||null;
    if(!record) return null;
    const media=Array.isArray(record.media)?record.media:[];
    const evidence=Array.isArray(record.evidence)?record.evidence:[];
    const relationships=collection("ESCIE_RELATIONSHIPS");
    const hasPublicConnection=relationships.some(rel =>
      rel && rel.public_disclosure===true &&
      (rel.from===id || rel.to===id) &&
      current.byId[rel.from] && current.byId[rel.to] &&
      releaseVisible(current.byId[rel.from]) &&
      releaseVisible(current.byId[rel.to])
    );
    const work=record.type==="project"||record.type==="music"||record.type==="body"||!!record.project;
    const archive=record.type==="archive"||media.length>0||evidence.length>0||record.archive_state==="active";
    const investigation=record.type==="investigation"||hasPublicConnection||record.type==="moment"||record.type==="fragment"||evidence.length>0;
    const glassEye=media.some(item=>{
      if(typeof item==="string") return /image|photo|video|film|vhs|jpg|jpeg|png|webp|gif|mp4|mov/i.test(item);
      if(!item) return false;
      return /image|photo|video|film|vhs|jpg|jpeg|png|webp|gif|mp4|mov/i.test([item.type,item.kind,item.mime,item.url,item.src].filter(Boolean).join(" "));
    });
    const released=releaseVisible(record);
    const sections=released
      ? {work,web:hasPublicConnection,archive,investigation,glassEye}
      : {work:false,web:false,archive:false,investigation:false,glassEye:false};
    const search=record.search!==false&&released;
    return {
      id, work, archive, investigation, glassEye, search, released,
      sections,
      appearsIn:Object.keys(sections).filter(section=>sections[section])
    };
  }

  function filter(records,filters){
    const list=Array.isArray(records)?records:[];
    const f=filters||{};
    const match=(value,expected)=>!expected||String(value||"").toLowerCase()===String(expected).toLowerCase();
    return list.filter(record=>{
      if(f.type&&!match(record.type,f.type)) return false;
      if(f.status&&!match(record.status,f.status)) return false;
      if(f.reality&&!match(record.reality||record.reality_level,f.reality)) return false;
      if(f.location&&!(Array.isArray(record.locations)&&record.locations.includes(f.location))) return false;
      if(f.symbol&&!(Array.isArray(record.symbols)&&record.symbols.includes(f.symbol))) return false;
      if(f.project){
        const projectId=record.type==="project"?record.id:record.project;
        if(projectId!==f.project) return false;
      }
      return true;
    });
  }

  function sectionAudit(){
    const current=build();
    const errors=[];
    current.records.forEach(record=>{
      const manifest=manifestFor(record.id);
      if(!manifest||!manifest.sections){
        errors.push({record:record.id,error:"manifest missing sections"});
        return;
      }
      Object.keys(manifest.sections).forEach(section=>{
        if(typeof manifest.sections[section]!=="boolean"){
          errors.push({record:record.id,section,error:"section value must be boolean"});
        }
      });
      const expected=Object.keys(manifest.sections).filter(section=>manifest.sections[section]);
      if(expected.join("|")!==(manifest.appearsIn||[]).join("|")){
        errors.push({record:record.id,error:"appearsIn does not match section manifest"});
      }
    });
    return {ok:errors.length===0,errors};
  }

  function symbolAudit(){
    const symbols=collection("ESCIE_SYMBOLS");
    const symbolIds=new Set(symbols.map(symbol=>symbol&&symbol.id).filter(Boolean));
    const records=build().records;
    const missing=[];
    records.forEach(record=>{
      if(!Array.isArray(record.symbols)) return;
      record.symbols.forEach(symbolId=>{
        if(!symbolIds.has(symbolId)){
          missing.push({record:record.id,symbol:symbolId});
        }
      });
    });
    return {ok:missing.length===0,missing};
  }
  window.ESCIE_RECORD_REGISTRY={version:"1.14.0",build,records:()=>build().records,publicNodes,nodeFor,allPublicRecords,get:(id)=>build().byId[id]||null,duplicates:()=>build().duplicates,relationshipAudit,symbolAudit,sectionAudit,contractAudit,referenceAudit,releaseAudit,manifestFor,filter,contextFor,publicRelationships,relationshipTypes,relationshipCategories,relationshipsFor,relationshipCounts,releaseVisible};
})();
