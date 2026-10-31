/* ESCIE SERVICE CONTRACT — third-party delegation policy.
 * Central may use specialized external services when they are better suited to the job.
 * External services never become canonical authorities.
 */
(function(root){
  "use strict";
  const CONTRACT={
    id:"ESCIE_SERVICE_CONTRACT",
    version:"1.2.0",
    principle:"USE THE BEST TOOL; KEEP THE TRUTH HERE.",
    modes:Object.freeze(["INTERNAL","CONNECTED","EXTERNAL_READY","EXTERNAL_EVALUATION"]),
    services:Object.freeze({
      STORAGE:{mode:"CONNECTED",availability:"READY",authority:"CENTRAL",approval:false},
      RESEARCH:{mode:"EXTERNAL_READY",availability:"READY",authority:"CENTRAL",approval:true},
      IMAGE:{mode:"EXTERNAL_READY",availability:"READY",authority:"CENTRAL",approval:true},
      DISTRIBUTION:{mode:"EXTERNAL_READY",availability:"AWAITING_PROVIDER",authority:"CENTRAL",approval:true},
      INSTAGRAM:{mode:"EXTERNAL_READY",availability:"AWAITING_PROVIDER",authority:"CENTRAL",approval:true},
      TIKTOK:{mode:"EXTERNAL_READY",availability:"AWAITING_PROVIDER",authority:"CENTRAL",approval:true},
      YOUTUBE:{mode:"EXTERNAL_READY",availability:"AWAITING_PROVIDER",authority:"CENTRAL",approval:true},
      SOUNDCLOUD:{mode:"EXTERNAL_READY",availability:"AWAITING_PROVIDER",authority:"CENTRAL",approval:true},
      BANDCAMP:{mode:"EXTERNAL_READY",availability:"AWAITING_PROVIDER",authority:"CENTRAL",approval:true},
      MUSIC_DISTRIBUTOR:{mode:"EXTERNAL_EVALUATION",availability:"AWAITING_PROVIDER",authority:"CENTRAL",approval:true},
      GAME:{mode:"EXTERNAL_EVALUATION",availability:"PLANNED",authority:"CENTRAL",approval:true},
      AUTOMATION:{mode:"EXTERNAL_READY",availability:"READY",authority:"CENTRAL",approval:true},
      LEGAL:{mode:"INTERNAL",availability:"READY",authority:"CENTRAL",approval:true},
      RIGHTS:{mode:"INTERNAL",availability:"READY",authority:"CENTRAL",approval:true},
      FUNDING:{mode:"EXTERNAL_READY",availability:"READY",authority:"CENTRAL",approval:true},
      EDITOR:{mode:"INTERNAL",availability:"READY",authority:"CENTRAL",approval:false},
      ADMIN:{mode:"INTERNAL",availability:"READY",authority:"CENTRAL",approval:true}
    }),
    rules:Object.freeze([
      "Central chooses delegation based on capability, reliability, cost and ownership fit.",
      "Secrets and provider credentials remain outside public content and canonical records.",
      "External output enters Central as proposed or observed work, never automatic canon.",
      "External publishing requires human approval unless an explicit future policy says otherwise.",
      "Provider failure must degrade safely to an internal/manual path.",
      "The public ESCIE site remains the canonical doorway and source of truth."
    ]),
    validate(){
      const errors=[];
      for(const key of ["STORAGE","RESEARCH","IMAGE","DISTRIBUTION","INSTAGRAM","TIKTOK","YOUTUBE","SOUNDCLOUD","BANDCAMP","MUSIC_DISTRIBUTOR","GAME","AUTOMATION","LEGAL","RIGHTS","FUNDING","EDITOR","ADMIN"]){
        const s=this.services[key];
        if(!s||!this.modes.includes(s.mode))errors.push(key+" service mode invalid");
        if(s&&s.authority!=="CENTRAL")errors.push(key+" service authority must remain CENTRAL");
      }
      if(!this.rules.length)errors.push("service rules missing");
      return {ok:errors.length===0,errors,version:this.version};
    }
  };
  root.ESCIE_SERVICE_CONTRACT=CONTRACT;
  if(typeof module!=="undefined"&&module.exports)module.exports=CONTRACT;
})(typeof window!=="undefined"?window:globalThis);
