/* ESCIE UNIVERSE CONTRACT — shared cross-layer invariants.
 * Architecture metadata only. It does not replace public content canon.
 */
(function(root){
  "use strict";
  const CONTRACT={
    id:"ESCIE_UNIVERSE",
    version:"2.0.0",
    layers:Object.freeze({
      CENTRAL:"central",
      PUBLIC:"public",
      GAME:"game"
    }),
    identity:{
      artist:"ESCIE",
      universe:"ONE ESCIE REALITY",
      thesis:"THE ART DOES NOT CREATE THE UNIVERSE. THE UNIVERSE CREATES THE ART.",
      musicRule:"MUSIC IS ONE OF THE PRIMARY FORCES THROUGH WHICH THE WORLD IS EXPERIENCED, REMEMBERED AND CHANGED."
    },
    hierarchy:Object.freeze({
      level1:["HOME","WORLD","TRACE"],
      level2:["PEOPLE","PLACES","MOMENTS","OBJECTS","ART"],
      deeper:["FRAGMENTS","PROOF","BODIES","ARCHIVES","CONNECTIONS"],
      modes:["CASE FILES","GLASS EYE"]
    }),
    worldTypes:Object.freeze(["PERSON","PLACE","MOMENT","OBJECT","ART"]),
    deepTypes:Object.freeze(["FRAGMENT","PROOF","BODY","ARCHIVE"]),
    boundaries:Object.freeze({
      publicIsCanonicalDoorway:true,
      centralIsPrivateControlPlane:true,
      gameIsExtension:true,
      gameHosting:"EXTERNAL_PLATFORM_READY",
      gamePublicLink:null,
      gamePresentation:"3D",
      gameplay2D:false,
      pauseMap2DOnly:true,
      centralHumanApproval:true,
      canonicalGameWriteFromPlayer:false
    }),
    publicSections:Object.freeze(["NOW","WORLD","TRACE","ART","ARCHIVES","THE CASE FILES","GLASS EYE","ESCIE"]),
    worldNodes:Object.freeze(["PEOPLE","PLACES","MOMENTS","OBJECTS","ART"]),
    validate(){
      const errors=[];
      if(this.layers.CENTRAL!=="central"||this.layers.PUBLIC!=="public"||this.layers.GAME!=="game")errors.push("layer contract invalid");
      if(this.boundaries.gameplay2D!==false||this.boundaries.pauseMap2DOnly!==true)errors.push("game 3D/2D boundary invalid");
      if(this.boundaries.publicIsCanonicalDoorway!==true||this.boundaries.gameIsExtension!==true)errors.push("public/game ownership boundary invalid");
      if(this.boundaries.centralHumanApproval!==true||this.boundaries.centralIsPrivateControlPlane!==true)errors.push("central control boundary invalid");
      const expectedWorldTypes=["PERSON","PLACE","MOMENT","OBJECT","ART"];
      const expectedSections=["NOW","WORLD","TRACE","ART","ARCHIVES","THE CASE FILES","GLASS EYE","ESCIE"];
      if(JSON.stringify(this.worldTypes)!==JSON.stringify(expectedWorldTypes))errors.push("world type contract is out of sync");
      if(JSON.stringify(this.publicSections)!==JSON.stringify(expectedSections))errors.push("public section contract is out of sync");
      return {ok:errors.length===0,errors,version:this.version};
    },
    balanceStatus(){
      const b=root.ESCIE_LAYER_BALANCE;
      return b&&typeof b.validate==="function"?b.validate():{ok:false,errors:["layer balance unavailable"]};
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
