/* ESCIE LIVE PUBLIC SOURCE
 * Read-only bridge from the public-safe Supabase records into the static ESCIE shell.
 * Only PUBLIC + PUBLISHED + RELEASED rows are exposed by the release gate.
 */
(function(){
  "use strict";
  const root=window;
  const API="https://ljdkjzvnwnaluevtzker.supabase.co/rest/v1";
  const KEY="sb_publishable_ICPqqxh3c32b7eb5PYqUaA_Cem3vvB9";
  function headers(){return {apikey:KEY,Accept:"application/json"};}
  function safeURL(value){
    const raw=String(value==null?"":value).trim();
    if(!raw)return "";
    try{
      const parsed=new URL(raw,root.location&&root.location.href||undefined);
      return ["http:","https:"].includes(parsed.protocol)?parsed.href:"";
    }catch(error){return "";}
  }
  function publicMedia(items){
    return (Array.isArray(items)?items:[]).map(item=>{
      if(!item||typeof item!=="object")return null;
      return {
        id:item.id?String(item.id):null,
        type:item.type?String(item.type).toLowerCase():null,
        title:item.title?String(item.title):"",
        label:item.label?String(item.label):"",
        alt:item.alt?String(item.alt):"",
        url:safeURL(item.url)
      };
    }).filter(item=>item&&item.url);
  }
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
      publication_state:String(row.publication_state||"").toUpperCase(),
      release_state:String(row.release_state||"").toUpperCase(),
      release_status:"released",
      certainty:row.certainty||"UNKNOWN",
      tags:Array.isArray(row.tags)?row.tags:[],
      people:Array.isArray(row.people)?row.people:[],
      locations:Array.isArray(row.places)?row.places:[],
      moments:Array.isArray(row.moments)?row.moments:[],
      related_content:Array.isArray(row.related_records)?row.related_records:[],
      media:publicMedia(row.media),
      symbols:Array.isArray(row.symbols)?row.symbols:[],
      project:row.project||null,
      date:row.due_date||null
    };
  }
  async function get(path){
    const response=await fetch(API+path,{headers:headers(),cache:"no-store"});
    if(!response.ok)throw Error("PUBLIC_SOURCE_HTTP_"+response.status);
    return response.json();
  }
  async function load(){
    const rows=await get("/records?select=*&visibility=eq.PUBLIC&publication_state=eq.PUBLISHED&release_state=eq.RELEASED&order=updated_at.desc");
    const publicRecords=(Array.isArray(rows)?rows:[]).map(normalize).filter(x=>x.id);
    const publicIds=new Set(publicRecords.map(x=>x.id));
    const relationships=await get("/record_relationships?select=id,from:from_record_id,to:to_record_id,type:relationship_type,status&status=eq.RELEASED&order=created_at.desc");
    root.ESCIE_LIVE_RECORDS=publicRecords;
    root.ESCIE_LIVE_RELATIONSHIPS=(Array.isArray(relationships)?relationships:[]).filter(x=>publicIds.has(String(x.from||""))&&publicIds.has(String(x.to||"")));
    return {records:root.ESCIE_LIVE_RECORDS,relationships:root.ESCIE_LIVE_RELATIONSHIPS};
  }
  root.ESCIE_PUBLIC_LIVE={version:"1.2.0",status:"LOADING",ready:load().then(function(result){root.ESCIE_PUBLIC_LIVE.status="READY";return result;}).catch(function(error){root.ESCIE_PUBLIC_LIVE.status="OFFLINE";root.ESCIE_PUBLIC_LIVE.error=String(error&&error.message||error);return {records:[],relationships:[]};})};
})();
