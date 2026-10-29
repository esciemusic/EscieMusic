/* ESCIE CLOTHING REGISTRY
 * Drop 001 is the first physical wardrobe of the world.
 * Clothing remains useful without digital connections; digital metadata is secondary.
 */
(function(){
  "use strict";
  const ESCIE_CLOTHING=[
    {
      id:"clothing-escie-tee-001",
      type:"CLOTHING",
      title:"ESCIE HEAVY TEE",
      collection:"DROP 001 — THE FIRST WARDROBE",
      category:"CORE",
      garment:"Heavyweight oversized T-shirt",
      status:"DESIGN_READY",
      production_stage:"SAMPLE",
      color:"WASHED BLACK",
      fabric:"100% cotton",
      gsm_target:"240–280 GSM",
      fit:"Boxy / relaxed / dropped shoulder",
      sizes:["S","M","L","XL","2XL","3XL"],
      front:{text:"ESCIE",placement:"left chest",width_mm:"90–110",ink:"DIRTY WHITE"},
      back:{art_direction:"Montréal photographic composition; documentary, cold, damaged-media texture; restrained green signal accent",width_mm:"300–330",height_mm:"400–450",text:"THE SIGNAL REMAINS DISTORTED."},
      label:"ESCIE / THE SIGNAL REMAINS DISTORTED.",
      hidden_detail:"DAISY — INTERIOR",
      decoration:{sample:"DTF or DTG",production:"SCREEN PRINT TARGET"},
      digital_connection:false,
      priority:"HIGHEST",
      specification:{
      measurements:{chest:"",length:"",shoulder:"",sleeve:""},
      tolerance:"±1 cm",
      shrinkage_max:"3%",
      decoration_placement:"",
      fit_reference:"",
    },
    production_packet:{sample_priority:1,quote_required:true,approval_gate:"HUMAN",qc:["fit","fabric","print","wash","shrinkage","seams"],photo_required:true,quantity_decision:"POST-SAMPLE"},
      notes:"Master garment for ESCIE clothing system."
    },
    {
      id:"clothing-escie-hood-001",
      type:"CLOTHING",
      title:"ESCIE HEAVY HOODIE",
      collection:"DROP 001 — THE FIRST WARDROBE",
      category:"CORE",
      garment:"Heavy pullover hoodie",
      status:"DESIGN_READY",
      production_stage:"SAMPLE",
      color:"WASHED BLACK",
      fabric:"Cotton-faced fleece",
      gsm_target:"400–500 GSM eventual target",
      fit:"Oversized / boxy / dropped shoulder",
      sizes:["S","M","L","XL","2XL","3XL"],
      front:{text:"ESCIE",placement:"left chest",width_mm:"90–110",ink:"DIRTY WHITE"},
      back:{art_direction:"Montréal photographic composition integrated into garment; monochrome with selective green",width_mm:"300–340",height_mm:"400–460",text:"THE SIGNAL REMAINS DISTORTED."},
      sleeves:[{side:"RIGHT",text:"THE SIGNAL"},{side:"LEFT",text:"REMAINS DISTORTED"}],
      hood:{interior_detail:"DAISY",decoration:"EMBROIDERY"},
      label:"ESCIE / THE SIGNAL REMAINS DISTORTED.",
      digital_connection:false,
      priority:"HIGHEST",
      production_packet:{sample_priority:2,quote_required:true,approval_gate:"HUMAN",qc:["fit","fabric","print","embroidery","wash","shrinkage","seams"],photo_required:true,quantity_decision:"POST-SAMPLE"},
      notes:"Flagship ESCIE garment."
    },  ];
  window.ESCIE_CLOTHING_AUDIT={
  version:"1.0",
  validate:function(item){
    if(!item||item.type!=="CLOTHING")return {ok:false,errors:["not a clothing record"]};
    const p=item.production_packet||{};
    const errors=[];
    if(p.approval_gate!=="HUMAN")errors.push("production approval must remain human-gated");
    if(p.quantity_decision!=="POST-SAMPLE")errors.push("quantity decision must wait until after sample");
    if(p.quote_required!==true)errors.push("quote required");
    if(p.photo_required!==true)errors.push("approved sample photography required");
    if(!Array.isArray(p.qc)||!p.qc.length)errors.push("physical QC checklist required");
    return {ok:errors.length===0,errors};
  },
  all:function(){return ESCIE_CLOTHING.map(this.validate);}
};
window.ESCIE_CLOTHING=ESCIE_CLOTHING;
})();
