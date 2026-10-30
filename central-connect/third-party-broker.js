(()=>{
  "use strict";
  const PROVIDERS=Object.freeze({
    STORAGE:{id:"supabase-storage",kind:"STORAGE",mode:"CONNECTED",label:"Central private storage",purpose:"Private intake and media storage"},
    RESEARCH:{id:"web-research",kind:"RESEARCH",mode:"EXTERNAL_READY",label:"Web research",purpose:"Fresh research when Central needs information"},
    IMAGE:{id:"image-generation",kind:"IMAGE",mode:"EXTERNAL_READY",label:"Image generation",purpose:"Production-ready visual asset generation when requested"},
    DISTRIBUTION:{id:"external-distribution",kind:"DISTRIBUTION",mode:"EXTERNAL_READY",label:"External distribution",purpose:"Specialist publishing and platform delivery"},
    GAME:{id:"external-game-platform",kind:"GAME",mode:"EXTERNAL_EVALUATION",label:"External game platform",purpose:"Future 3D RPG hosting/distribution"},
    AUTOMATION:{id:"external-automation",kind:"AUTOMATION",mode:"EXTERNAL_READY",label:"External automation",purpose:"Scheduled or platform-specific automation when it is better than rebuilding it"}
  });
  function session(){return window.ESCIE_CENTRAL_API?.getSession?.()||null}
  function workspace(){return window.ESCIE_CENTRAL_API?.getWorkspaceId?.()||null}
  function plan(kind,request,extra={}){
    const p=PROVIDERS[kind];
    return {provider:p?.id||null,kind,mode:p?.mode||"UNAVAILABLE",request:String(request||""),workspace_id:workspace(),requires_human_approval:true,...extra};
  }
  async function uploadPrivate(file,path){
    if(!file||!path)throw Error("STORAGE_UPLOAD_INPUT_MISSING");
    const s=session(); if(!s?.access_token)throw Error("CENTRAL_SESSION_UNAVAILABLE");
    const base="https://ljdkjzvnwnaluevtzker.supabase.co/storage/v1/object/central-private/";
    const safe=String(path).replace(/^\\/+/,"").split("/").map(x=>encodeURIComponent(x)).join("/");
    const r=await fetch(base+safe,{method:"POST",headers:{Authorization:"Bearer "+s.access_token,x_upsert:"false"},body:file});
    if(!r.ok)throw Error("FILE_UPLOAD_FAILED_HTTP_"+r.status);
    return {provider:PROVIDERS.STORAGE.id,bucket:"central-private",storage_path:path};
  }
  function handoff(kind,request,extra){return plan(kind,request,extra)}
  window.ESCIE_THIRD_PARTY_BROKER=Object.freeze({version:"1.0.0",providers:PROVIDERS,plan,handoff,uploadPrivate});
})();
