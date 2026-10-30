/* ESCIE LAYER BALANCE — responsibility and runtime-weight contract.
 * Keeps the universe deep without making one layer carry the whole system.
 */
(function(root){
  "use strict";
  const BALANCE={
    version:"1.0.0",
    principle:"DEPTH IS DISTRIBUTED; CANON REMAINS CENTRALIZED.",
    layers:{
      central:{
        role:"CONTROL / BRAIN / APPROVAL",
        owns:["ingestion","normalization","correlation","evidence","audit","proposals","decisions","connectors","release-control","operator-workflow"],
        doesNotOwn:["player-experience","gameplay","public-navigation","player-progression"],
        weight:"LOW-VISUAL / HIGH-INTELLIGENCE"
      },
      public:{
        role:"DOORWAY / CANONICAL EXPERIENCE",
        owns:["identity","music","BAM","art","archive","investigation-presentation","Glass Eye","The World entry","public-navigation","read-only-canonical-projections"],
        doesNotOwn:["private-operator-control","heavy-analysis","game-simulation","player-progression"],
        weight:"HIGH-VISUAL / LOW-BACKEND"
      },
      game:{
        role:"PLAYABLE 3D RPG EXTENSION",
        owns:["movement","world-simulation","NPC-life","NPCs","dialogue","missions","combat","law","investigation-in-play","vehicles","interiors","inventory","economy","progression","save-state"],
        doesNotOwn:["canonical-truth-authoring","private-operator-control","public-site-navigation"],
        weight:"HIGH-SIMULATION / EXPERIENCE-FIRST"
      }
    },
    flow:[
      "CENTRAL -> approved canonical projection -> PUBLIC",
      "PUBLIC -> doorway -> GAME",
      "GAME -> observed player experience/state -> CENTRAL diagnostics only",
      "GAME -> no silent canonical writes"
    ],
    performance:{
      public:"load experience-critical code first; defer diagnostics/admin-only work",
      game:"prioritize 3D frame/runtime budget; pause nonessential simulation when inactive",
      central:"prioritize correctness/audit over animation and presentation"
    },
    validate(){
      const errors=[];
      for(const key of ["central","public","game"]){
        const layer=this.layers[key];
        if(!layer||!layer.role||!Array.isArray(layer.owns)||!Array.isArray(layer.doesNotOwn))errors.push(key+" layer definition incomplete");
        if(layer&&layer.owns.some(x=>layer.doesNotOwn.includes(x)))errors.push(key+" ownership overlap");
      }
      if(this.layers.public.owns.includes("private-operator-control"))errors.push("public must not own private operator control");
      if(this.layers.game.owns.includes("canonical-truth-authoring"))errors.push("game must not author canonical truth");
      return {ok:errors.length===0,errors,version:this.version};
    }
  };
  root.ESCIE_LAYER_BALANCE=BALANCE;
  if(typeof module!=="undefined"&&module.exports)module.exports=BALANCE;
})(typeof window!=="undefined"?window:globalThis);
