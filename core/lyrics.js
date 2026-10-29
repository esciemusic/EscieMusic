/* ESCIE LYRIC VERSION SYSTEM
 * Lyrics are living source material.
 * Drafts remain editable; released versions are preserved as snapshots.
 */
(function(){
  "use strict";
  const STATES=Object.freeze({DRAFT:"draft",REVIEW:"review",APPROVED:"approved",RELEASED:"released",ARCHIVED:"archived"});
  const clone=v=>v==null?v:(typeof structuredClone==="function"?structuredClone(v):JSON.parse(JSON.stringify(v)));
  function normalize(input={},n=1){
    const number=Number.isFinite(Number(input.version_number))?Number(input.version_number):n;
    return {
      id:input.id||((input.track_id||"track")+"::lyrics::"+number),
      track_id:input.track_id||null, version_number:number,
      label:input.label||("VERSION "+String(number).padStart(2,"0")),
      state:input.state||STATES.DRAFT, text:typeof input.text==="string"?input.text:"",
      language:input.language||"en", created_at:input.created_at||new Date().toISOString(),
      updated_at:input.updated_at||new Date().toISOString(), edited_at:new Date().toISOString(),
      source_ids:Array.isArray(input.source_ids)?[...input.source_ids]:[],
      notes:input.notes||"", released_at:input.released_at||null,
      immutable:input.state===STATES.RELEASED||input.immutable===true
    };
  }
  function nextNumber(list=[]){return list.reduce((m,v)=>Math.max(m,Number(v&&v.version_number)||0),0)+1;}
  function appendDraft(list=[],trackId,text="",meta={}){const n=nextNumber(list);return [...list,normalize(Object.assign({},meta,{track_id:trackId,version_number:n,text,state:STATES.DRAFT}),n)];}
  function update(version,patch={}){if(!version||version.immutable||version.state===STATES.RELEASED)return {ok:false,error:"Released lyric versions are immutable snapshots.",version:clone(version)};return {ok:true,error:null,version:normalize(Object.assign({},version,patch,{id:version.id,track_id:version.track_id,version_number:version.version_number,updated_at:new Date().toISOString()}),version.version_number)};}
  function release(version){if(!version)return {ok:false,error:"Missing lyric version.",version:null};return {ok:true,error:null,version:normalize(Object.assign({},version,{state:STATES.RELEASED,released_at:new Date().toISOString(),immutable:true}),version.version_number)};}
  function audit(list=[]){const errors=[],seen=new Set();(Array.isArray(list)?list:[]).forEach(v=>{if(!v||!v.id)errors.push("Every lyric version needs an id.");if(v&&seen.has(v.id))errors.push("Duplicate lyric version id: "+v.id);if(v&&v.id)seen.add(v.id);if(v&&!Object.values(STATES).includes(v.state))errors.push("Invalid lyric version state: "+v.state);if(v&&v.state===STATES.RELEASED&&v.immutable!==true)errors.push("Released lyric versions must be immutable snapshots.");});return {ok:errors.length===0,errors};}
  const API={STATES,normalize,nextNumber,appendDraft,update,release,audit,clone};
  if(typeof window!=="undefined")window.ESCIE_LYRICS=API;
  if(typeof module!=="undefined"&&module.exports)module.exports=API;
})();