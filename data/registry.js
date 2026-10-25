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
    const relationships=collection("ESCIE_RELATIONSHIPS");
    const connected=relationships
      .filter(r=>r&&r.public_disclosure===true&&(r.from===id||r.to===id))
      .map(r=>({
        id:r.id||null,
        type:r.type||"connection",
        direction:r.from===id?"out":"in",
        record:r.from===id?r.to:r.from
      }))
      .filter(item=>current.byId[item.record]);
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
      ["project","parent"].forEach(field=>checkRecordRef(record,field,record[field]));
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

  function manifestFor(id){
    const record=build().byId[id]||null;
    if(!record) return null;
    const media=Array.isArray(record.media)?record.media:[];
    const evidence=Array.isArray(record.evidence)?record.evidence:[];
    const relationships=Array.isArray(record.relationships)?record.relationships:[];
    return {
      id,
      work:record.type==="project"||record.type==="music"||record.type==="body"||!!record.project,
      archive:record.type==="archive"||media.length>0||evidence.length>0||record.archive_state==="active",
      investigation:record.type==="investigation"||relationships.length>0||record.type==="moment"||record.type==="fragment",
      glassEye:media.some(item=>typeof item==="string" ? /image|photo|video|film|vhs/i.test(item) : !!item&&/image|photo|video|film|vhs/i.test(item.type||"")),
      search:true
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
      if(f.project&&record.project!==f.project) return false;
      return true;
    });
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
  window.ESCIE_RECORD_REGISTRY={version:"1.3.0",build,records:()=>build().records,get:(id)=>build().byId[id]||null,duplicates:()=>build().duplicates,relationshipAudit,symbolAudit,contractAudit,referenceAudit,manifestFor,filter,contextFor};
})();
