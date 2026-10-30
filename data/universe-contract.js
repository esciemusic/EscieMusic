/* ESCIE UNIVERSE CONTRACT — shared cross-layer invariants.
 * This is architecture metadata, not editorial canon and never writes player state.
 */
(function(root){
  "use strict";
  const CONTRACT={
    id:"ESCIE_UNIVERSE",
    version:"1.0.0",
    layers:Object.freeze({
      CENTRAL:"central",
      PUBLIC:"public",
      GAME:"game"
    }),
    identity:{
      artist:"ESCIE",
      universe:"ONE ESCIE REALITY",
      thesis:"REALITY WITH THE SIGNAL DISTORTED.",
      musicRule:"THE MUSIC DOES NOT CREATE THE UNIVERSE. THE UNIVERSE CREATES THE MUSIC."
    },
    boundaries:Object.freeze({
      publicIsCanonicalDoorway:true,
      gameIsExtension:true,
      gamePresentation:"3D",
      gameplay2D:false,
      pauseMap2DOnly:true,
      realityFilter:false,
      centralHumanApproval:true,
      canonicalGameWriteFromPlayer:false
    }),
    publicSections:Object.freeze(["NOW","WORK","THE WORLD","THE WEB","ARCHIVE","INVESTIGATION","GLASS EYE","ESCIE"]),
    worldClasses:Object.freeze(["DRIFTER","RUNNER","INVESTIGATOR","SURVIVOR"]),
    worldNodes:Object.freeze(["ART","THE PEOPLE","PLACES","MOMENTS","FRAGMENTS","PROOF","BODIES","PATH","THE WEB","THE ARCHIVES"]),
    requiredGameSystems:Object.freeze(["simulation","npc-life","npc","law","investigation","rpg","vehicles","interiors","dialogue","3d"]),
    validate(){
      const errors=[];
      if(this.layers.CENTRAL!=="central"||this.layers.PUBLIC!=="public"||this.layers.GAME!=="game")errors.push("layer contract invalid");
      if(this.boundaries.realityFilter!==false)errors.push("removed Reality Filter must remain disabled");
      if(this.boundaries.gameplay2D!==false||this.boundaries.pauseMap2DOnly!==true)errors.push("game 3D/2D boundary invalid");
      if(this.boundaries.publicIsCanonicalDoorway!==true||this.boundaries.gameIsExtension!==true)errors.push("public/game ownership boundary invalid");
      if(this.boundaries.centralHumanApproval!==true)errors.push("central approval guard missing");
      return {ok:errors.length===0,errors,version:this.version};
    },
    layerStatus(){
      const w=typeof window!=="undefined"?window:{};
      return {
        central:!!w.ESCIE_CENTRAL_API,
        public:!!w.ESCIE_SITE,
        game:!!(w.ESCIE_3D_WORLD||w.ESCIE_WORLD_SIMULATION)
      };
    }
  };
  root.ESCIE_UNIVERSE_CONTRACT=CONTRACT;
  if(typeof module!=="undefined"&&module.exports)module.exports=CONTRACT;
})(typeof window!=="undefined"?window:globalThis);
