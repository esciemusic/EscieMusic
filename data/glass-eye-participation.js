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
    maxBytes:10*1024*1024
  };
  function headers(){
    return {apikey:CONFIG.publishableKey,Authorization:"Bearer "+CONFIG.publishableKey,"Content-Type":"application/json"};
  }
  async function submit(input){
    const kind=String(input.kind||"COMMENT").toUpperCase();
    const displayName=String(input.displayName||"ANONYMOUS").trim().slice(0,80)||"ANONYMOUS";
    const body=String(input.body||"").trim().slice(0,5000);
    const location=String(input.location||"").trim().slice(0,160)||null;
    let mediaPath=null;
    const file=input.file||null;
    if(!body && !file) throw new Error("ADD A COMMENT, THEORY, FINDING OR FILE FIRST.");
    if(file){
      if(file.size>CONFIG.maxBytes) throw new Error("FILE IS TOO LARGE. MAXIMUM 10 MB.");
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
      body:JSON.stringify({kind,display_name:displayName,body:body||null,media_path:mediaPath,location_label:location,status:"PENDING_REVIEW",public_disclosure:false})
    });
    if(!response.ok) throw new Error("THE SUBMISSION COULD NOT BE SAVED. TRY AGAIN.");
    return {ok:true};
  }
  async function approved(limit=20){
    const query="?select=id,created_at,kind,display_name,body,media_path,location_label&status=eq.APPROVED&public_disclosure=eq.true&order=created_at.desc&limit="+encodeURIComponent(limit);
    const response=await fetch(CONFIG.endpoint+"/rest/v1/glass_eye_submissions"+query,{headers:{apikey:CONFIG.publishableKey,Authorization:"Bearer "+CONFIG.publishableKey}});
    if(!response.ok)return [];
    return response.json();
  }
  root.ESCIE_GLASS_EYE_PARTICIPATION={submit,approved,config:CONFIG};
})(typeof window!=="undefined"?window:globalThis);