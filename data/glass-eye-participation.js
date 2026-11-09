/* ESCIE GLASS EYE PARTICIPATION
 * Public submissions are never canon by default.
 * Central reviews them before disclosure.
 */
(function(root){
  "use strict";
  const CONFIG={
    endpoint:"https://ljdkjzvnwnaluevtzker.supabase.co",
    publishableKey:"sb_publishable_ICPqqxh3c32b7eb5PYqUaA_Cem3vvB9",
    bucket:"glass-eye-submissions",
    maxBytes:10*1024*1024,
    approvedEndpoint:"https://ljdkjzvnwnaluevtzker.supabase.co/functions/v1/glass-eye-public"
  };
  const allowedKinds=new Set(["COMMENT","THEORY","FINDING","MENTION"]);
  const allowedMedia=new Set(["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/webm","audio/mpeg","audio/wav","audio/ogg"]);
  function headers(){
    return {apikey:CONFIG.publishableKey,Authorization:"Bearer "+CONFIG.publishableKey,"Content-Type":"application/json"};
  }
  let submitting=false;
  async function submit(input){
    if(submitting)throw new Error("A SUBMISSION IS ALREADY BEING SENT.");
    submitting=true;
    try{
    const kind=String(input.kind||"COMMENT").toUpperCase();
    if(!allowedKinds.has(kind))throw new Error("INVALID SUBMISSION TYPE.");
    const displayName=String(input.displayName||"ANONYMOUS").trim().slice(0,80)||"ANONYMOUS";
    const body=String(input.body||"").trim().slice(0,5000);
    const location=String(input.location||"").trim().slice(0,160)||null;
    let mediaPath=null;
    const file=input.file||null;
    if(!body && !file) throw new Error("ADD A COMMENT, THEORY, FINDING OR FILE FIRST.");
    if(file){
      if(file.size>CONFIG.maxBytes) throw new Error("FILE IS TOO LARGE. MAXIMUM 10 MB.");
      if(!allowedMedia.has(String(file.type||"").toLowerCase())) throw new Error("ONLY PHOTO, VIDEO OR AUDIO FILES ARE ACCEPTED.");
      const safeName=String(file.name||"upload").replace(/[^a-zA-Z0-9._-]/g,"-").slice(-120);
      const path=Date.now()+"-"+Math.random().toString(36).slice(2)+"-"+safeName;
      const upload=await fetch(CONFIG.endpoint+"/storage/v1/object/"+CONFIG.bucket+"/"+encodeURIComponent(path),{
        method:"POST",headers:{apikey:CONFIG.publishableKey,Authorization:"Bearer "+CONFIG.publishableKey,"Content-Type":file.type||"application/octet-stream","x-upsert":"false"},body:file
      });
      if(!upload.ok) throw new Error("THE FILE COULD NOT BE UPLOADED. TRY AGAIN.");
      mediaPath=path;
    }
    const response=await fetch(CONFIG.endpoint+"/rest/v1/glass_eye_submissions",{
      method:"POST",headers:{...headers(),Prefer:"return=minimal"},
      body:JSON.stringify({source:"GLASS_EYE",kind,display_name:displayName,body:body||null,media_path:mediaPath,location_label:location,status:"PENDING_REVIEW",public_disclosure:false})
    });
    if(!response.ok) throw new Error("THE SUBMISSION COULD NOT BE SAVED. TRY AGAIN.");
    return {ok:true};
    }finally{
      submitting=false;
    }
  }
  async function approved(limit=20){
    const safeLimit=Math.max(1,Math.min(20,Number(limit)||20));
    try{
      const response=await fetch(CONFIG.approvedEndpoint+"?limit="+encodeURIComponent(safeLimit),{headers:{apikey:CONFIG.publishableKey,Authorization:"Bearer "+CONFIG.publishableKey}});
      if(!response.ok)return [];
      const payload=await response.json();
      return Array.isArray(payload)?payload:(Array.isArray(payload.items)?payload.items:[]);
    }catch(error){
      return [];
    }
  }
  root.ESCIE_GLASS_EYE_PARTICIPATION={submit,approved,config:CONFIG};
})(typeof window!=="undefined"?window:globalThis);