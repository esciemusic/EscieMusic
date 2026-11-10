/* ESCIE GLASS EYE PARTICIPATION
 * Public submissions are never canon by default.
 * Central reviews them before disclosure.
 */
(function(root){
  "use strict";
  const CONFIG={
    submissionEndpoint:"https://ljdkjzvnwnaluevtzker.supabase.co/functions/v1/glass-eye-public",
    publishableKey:"sb_publishable_ICPqqxh3c32b7eb5PYqUaA_Cem3vvB9",
    maxBytes:10*1024*1024
  };
  const allowedKinds=new Set(["COMMENT","THEORY","FINDING","MENTION"]);
  const allowedMedia=new Set(["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/webm","audio/mpeg","audio/wav","audio/ogg"]);
  let submitting=false;
  async function submit(input){
    if(submitting)throw new Error("A SUBMISSION IS ALREADY BEING SENT.");
    submitting=true;
    try{
      const kind=String(input.kind||"COMMENT").toUpperCase();
      if(!allowedKinds.has(kind))throw new Error("INVALID SUBMISSION TYPE.");
      const displayName=String(input.displayName||"ANONYMOUS").trim().slice(0,80)||"ANONYMOUS";
      const body=String(input.body||"").trim().slice(0,5000);
      const location=String(input.location||"").trim().slice(0,160)||"";
      const file=input.file&&input.file.size?input.file:null;
      if(!body&&!file)throw new Error("ADD A COMMENT, THEORY, FINDING OR FILE FIRST.");
      if(file){
        if(file.size>CONFIG.maxBytes)throw new Error("FILE IS TOO LARGE. MAXIMUM 10 MB.");
        if(!allowedMedia.has(String(file.type||"").toLowerCase()))throw new Error("ONLY PHOTO, VIDEO OR AUDIO FILES ARE ACCEPTED.");
      }
      const form=new FormData();
      form.set("kind",kind);form.set("displayName",displayName);form.set("location",location);form.set("body",body);
      if(file)form.set("file",file,file.name);
      const response=await fetch(CONFIG.submissionEndpoint,{method:"POST",headers:{apikey:CONFIG.publishableKey},body:form});
      let payload=null;try{payload=await response.json()}catch(_){}
      if(!response.ok)throw new Error(String(payload&&(payload.error||payload.detail)||"SUBMISSION_FAILED").replace(/_/g," "));
      return payload||{ok:true};
    }finally{submitting=false;}
  }
  async function approved(limit=20){
    const safeLimit=Math.max(1,Math.min(20,Number(limit)||20));
    try{
      const response=await fetch(CONFIG.submissionEndpoint+"?limit="+encodeURIComponent(safeLimit),{headers:{apikey:CONFIG.publishableKey}});
      if(!response.ok)return [];
      const payload=await response.json();
      return Array.isArray(payload)?payload:(Array.isArray(payload.items)?payload.items:[]);
    }catch(error){return [];}
  }
  root.ESCIE_GLASS_EYE_PARTICIPATION={submit,approved,config:CONFIG};
})(typeof window!=="undefined"?window:globalThis);
