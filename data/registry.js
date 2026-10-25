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
  window.ESCIE_RECORD_REGISTRY={version:"1.2.0",build,records:()=>build().records,get:(id)=>build().byId[id]||null,duplicates:()=>build().duplicates,relationshipAudit,symbolAudit};
})();
