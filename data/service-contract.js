/* ESCIE SERVICE CONTRACT — third-party delegation policy.
 * Central may use specialized external services when they are better suited to the job.
 * External services never become canonical authorities.
 */
(function(root){
  "use strict";
  const CONTRACT={
    id:"ESCIE_SERVICE_CONTRACT",
    version:"1.0.0",
    principle:"USE THE BEST TOOL; KEEP THE TRUTH HERE.",
    modes:Object.freeze(["INTERNAL","CONNECTED","EXTERNAL_READY","EXTERNAL_EVALUATION"]),
    services:Object.freeze({
      STORAGE:{mode:"CONNECTED",authority:"CENTRAL",approval:false},
      RESEARCH:{mode:"EXTERNAL_READY",authority:"CENTRAL",approval:true},
      IMAGE:{mode:"EXTERNAL_READY",authority:"CENTRAL",approval:true},
      DISTRIBUTION:{mode:"EXTERNAL_READY",authority:"CENTRAL",approval:true},
      GAME:{mode:"EXTERNAL_EVALUATION",authority:"CENTRAL",approval:true},
      AUTOMATION:{mode:"EXTERNAL_READY",authority:"CENTRAL",approval:true}
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
      for(const key of ["STORAGE","RESEARCH","IMAGE","DISTRIBUTION","GAME","AUTOMATION"]){
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
