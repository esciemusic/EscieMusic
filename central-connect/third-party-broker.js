(()=>{
  "use strict";
  const SERVICE_CONTRACT=window.ESCIE_SERVICE_CONTRACT||null;
  const PROVIDERS=Object.freeze({
    STORAGE:{id:"supabase-storage",kind:"STORAGE",mode:"CONNECTED",availability:"READY",label:"Central private storage",purpose:"Private intake and media storage"},
    RESEARCH:{id:"web-research",kind:"RESEARCH",mode:"EXTERNAL_READY",availability:"READY",label:"Web research",purpose:"Fresh research when Central needs information"},
    IMAGE:{id:"image-generation",kind:"IMAGE",mode:"EXTERNAL_READY",availability:"READY",label:"Image generation",purpose:"Production-ready visual asset generation when requested"},
    DISTRIBUTION:{id:"external-distribution",kind:"DISTRIBUTION",mode:"EXTERNAL_READY",availability:"AWAITING_PROVIDER",label:"External distribution",purpose:"Specialist publishing and platform delivery"},
    INSTAGRAM:{id:"instagram",kind:"INSTAGRAM",mode:"EXTERNAL_READY",availability:"AWAITING_PROVIDER",label:"Instagram",purpose:"Social publishing when provider execution is configured"},
    TIKTOK:{id:"tiktok",kind:"TIKTOK",mode:"EXTERNAL_READY",availability:"AWAITING_PROVIDER",label:"TikTok",purpose:"Social publishing when provider execution is configured"},
    YOUTUBE:{id:"youtube",kind:"YOUTUBE",mode:"EXTERNAL_READY",availability:"AWAITING_PROVIDER",label:"YouTube",purpose:"Video publishing when provider execution is configured"},
    SOUNDCLOUD:{id:"soundcloud",kind:"SOUNDCLOUD",mode:"EXTERNAL_READY",availability:"AWAITING_PROVIDER",label:"SoundCloud",purpose:"Direct audio upload, metadata and playlist management"},
    BANDCAMP:{id:"bandcamp",kind:"BANDCAMP",mode:"EXTERNAL_READY",availability:"AWAITING_PROVIDER",label:"Bandcamp",purpose:"Music and merchandise account operations when API access is approved"},
    MUSIC_DISTRIBUTOR:{id:"music-distributor",kind:"MUSIC_DISTRIBUTOR",mode:"EXTERNAL_EVALUATION",availability:"AWAITING_PROVIDER",label:"Music distributor",purpose:"Delivery to Spotify, Apple Music, Amazon Music and other DSPs"},
    GAME:{id:"external-game-platform",kind:"GAME",mode:"EXTERNAL_EVALUATION",availability:"PLANNED",label:"External game platform",purpose:"Future 3D RPG hosting/distribution"},
    AUTOMATION:{id:"external-automation",kind:"AUTOMATION",mode:"EXTERNAL_READY",availability:"READY",label:"External automation",purpose:"Scheduled or platform-specific automation when it is better than rebuilding it"},
    LEGAL:{id:"central-legal",kind:"LEGAL",mode:"INTERNAL",availability:"READY",label:"Legal and contracts",purpose:"Contract analysis, drafting, comparison and legal-risk triage with human authorization"},
    RIGHTS:{id:"central-rights",kind:"RIGHTS",mode:"INTERNAL",availability:"READY",label:"Rights and clearance",purpose:"Permissions, releases, licenses, samples and ownership tracking"},
    FUNDING:{id:"grants-funding",kind:"FUNDING",mode:"EXTERNAL_READY",availability:"READY",label:"Grants and funding",purpose:"Grant research, eligibility, deadlines, applications and budgets"},
    EDITOR:{id:"central-editor",kind:"EDITOR",mode:"INTERNAL",availability:"READY",label:"Proofreading and editorial",purpose:"Proofreading, consistency and multilingual copy review"},
    ADMIN:{id:"central-admin",kind:"ADMIN",mode:"INTERNAL",availability:"READY",label:"IP and business administration",purpose:"IP records, renewals, invoices, deliverables and administrative deadlines"}
  });
  function session(){return window.ESCIE_CENTRAL_API?.getSession?.()||null}
  function workspace(){return window.ESCIE_CENTRAL_API?.getWorkspaceId?.()||null}
  function plan(kind,request,extra={}){
    const p=PROVIDERS[kind];
    return {provider:p?.id||null,kind,mode:p?.mode||"UNAVAILABLE",request:String(request||""),workspace_id:workspace(),requires_human_approval:true,...extra};
  }
  async function deletePrivate(path){
    if(!path)throw Error("STORAGE_DELETE_INPUT_MISSING");
    const s=session(); if(!s?.access_token)throw Error("CENTRAL_SESSION_UNAVAILABLE");
    const base="https://ljdkjzvnwnaluevtzker.supabase.co/storage/v1/object/central-private/";
    const safe=String(path).replace(/^\/+/, "").split("/").map(x=>encodeURIComponent(x)).join("/");
    const r=await fetch(base+safe,{method:"DELETE",headers:{Authorization:"Bearer "+s.access_token}});
    if(!r.ok&&r.status!==404)throw Error("FILE_DELETE_FAILED_HTTP_"+r.status);
    return {provider:PROVIDERS.STORAGE.id,bucket:"central-private",storage_path:path};
  }
  async function uploadPrivate(file,path){
    if(!file||!path)throw Error("STORAGE_UPLOAD_INPUT_MISSING");
    const s=session(); if(!s?.access_token)throw Error("CENTRAL_SESSION_UNAVAILABLE");
    const base="https://ljdkjzvnwnaluevtzker.supabase.co/storage/v1/object/central-private/";
    const safe=String(path).replace(/^\/+/,"").split("/").map(x=>encodeURIComponent(x)).join("/");
    const r=await fetch(base+safe,{method:"POST",headers:{Authorization:"Bearer "+s.access_token,x_upsert:"false"},body:file});
    if(!r.ok)throw Error("FILE_UPLOAD_FAILED_HTTP_"+r.status);
    return {provider:PROVIDERS.STORAGE.id,bucket:"central-private",storage_path:path};
  }
  async function research(query,limit=12){
    if(!String(query||"").trim())throw Error("RESEARCH_QUERY_MISSING");
    const s=session(); if(!s?.access_token)throw Error("CENTRAL_SESSION_UNAVAILABLE");
    const r=await fetch("https://ljdkjzvnwnaluevtzker.supabase.co/functions/v1/central-research",{method:"POST",headers:{Authorization:"Bearer "+s.access_token,"Content-Type":"application/json"},body:JSON.stringify({query:String(query),limit})});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw Error(data?.error||"RESEARCH_FAILED_HTTP_"+r.status);
    return data;
  }\n  function handoff(kind,request,extra){return plan(kind,request,extra)}
  window.ESCIE_THIRD_PARTY_BROKER=Object.freeze({version:"1.4.0",contract:SERVICE_CONTRACT,providers:PROVIDERS,plan,handoff,research,uploadPrivate,deletePrivate});
})();
