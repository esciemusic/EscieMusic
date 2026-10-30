/* ESCIE LIVE PUBLIC SOURCE
 * Read-only bridge from the public-safe Supabase records into the static ESCIE shell.
 * Only PUBLIC + PUBLISHED rows are exposed by RLS.
 */
(function(){
  "use strict";
  const root=window;
  const API="https://ljdkjzvnwnaluevtzker.supabase.co/rest/v1";
  const KEY="sb_publishable_ICPqqxh3c32b7eb5PYqUaA_Cem3vvB9";
  function headers(){return {apikey:KEY,Accept:"application/json"};}
  function normalize(row){
    const source=row&&row.source&&typeof row.source==="object"?row.source:{};
    return {
      id:String(row.id||""),
      type:String(row.type||"record").toLowerCase(),
      title:String(row.title||"UNTITLED"),
      description:String(row.description||""),
      status:String(row.status||"active").toLowerCase(),
      visibility:String(row.visibility||"PUBLIC").toLowerCase(),
      published:String(row.publication_state||"")=="PUBLISHED",
      release_status:"released",
      certainty:row.certainty||"UNKNOWN",
      tags:Array.isArray(row.tags)?row.tags:[],
      people:Array.isArray(row.people)?row.people:[],
      locations:Array.isArray(row.places)?row.places:[],
      moments:Array.isArray(row.moments)?row.moments:[],
      related_content:Array.isArray(row.related_records)?row.related_records:[],
      evidence:Array.isArray(row.evidence)?row.evidence:[],
      media:Array.isArray(row.media)?row.media:[],
      symbols:Array.isArray(source.symbols)?source.symbols:(Array.isArray(row.symbols)?row.symbols:[]),
      project:row.project||null,
      date:row.due_date||source.date||null,
      source:source,
      provenance:source.provenance||null
    };
  }
  async function get(path){
    const response=await fetch(API+path,{headers:headers(),cache:"no-store"});
    if(!response.ok)throw Error("PUBLIC_SOURCE_HTTP_"+response.status);
    return response.json();
  }
  async function load(){
    const rows=await get("/records?select=*&visibility=eq.PUBLIC&publication_state=eq.PUBLISHED&order=updated_at.desc");
    const relationships=await get("/record_relationships?select=*&order=created_at.desc");
    root.ESCIE_LIVE_RECORDS=(Array.isArray(rows)?rows:[]).map(normalize).filter(x=>x.id);
    root.ESCIE_LIVE_RELATIONSHIPS=Array.isArray(relationships)?relationships:[];
    return {records:root.ESCIE_LIVE_RECORDS,relationships:root.ESCIE_LIVE_RELATIONSHIPS};
  }
  root.ESCIE_PUBLIC_LIVE={version:"1.0.0",status:"LOADING",ready:load().then(function(result){root.ESCIE_PUBLIC_LIVE.status="READY";return result;}).catch(function(error){root.ESCIE_PUBLIC_LIVE.status="OFFLINE";root.ESCIE_PUBLIC_LIVE.error=String(error&&error.message||error);return {records:[],relationships:[]};})};
})();
