/* ESCIE MERCH COMMERCE CONTRACT — product metadata; checkout remains external. */
(function(root){
  "use strict";
  const ESCIE_MERCH={
    version:"2.0",
    monetization:"MERCH_ONLY",
    storefront_url:"",
    storefront_label:"OPEN THE STORE",
    checkout_owner:"EXTERNAL_STOREFRONT",
    free_layers:["MUSIC","INVESTIGATION","ARCHIVE","QR","SOCIAL_PARTICIPATION","COMMENTS","VIDEO","WEBSITE"],
    categories:["CORE","BAM"],
    art_direction:"MONTRÉAL CONCRETE / VHS / DOCUMENTARY / GOTHIC / DAMAGED MEDIA",
    art_license:"ESCIE-owned original artwork; master files remain outside checkout metadata.",
    drops:[
      {id:"drop-001",title:"DROP 001 — THE FIRST WARDROBE",status:"READY_FOR_ART_PRODUCTION",category:"CORE",
       products:[
        {id:"escie-tee-black",title:"ESCIE SIGNAL TEE",type:"tee",colorway:"black",art:"escie-signal-mark"},
        {id:"escie-hoodie-black",title:"ESCIE SIGNAL HOODIE",type:"hoodie",colorway:"black",art:"escie-signal-mark"},
        {id:"bam-tee-blue",title:"BAM / BY ANY MEANS TEE",type:"tee",colorway:"midnight-blue",art:"bam-001-front"},
        {id:"bam-poster",title:"BAM EVIDENCE POSTER",type:"poster",colorway:"paper",art:"bam-evidence-sheet"},
        {id:"signal-sticker-sheet",title:"SIGNAL STICKER SHEET",type:"sticker-sheet",colorway:"mixed",art:"signal-symbol-sheet"}
       ]},
      {id:"drop-002",title:"THE GLASS EYE",status:"ART_DIRECTION_READY",category:"CORE",
       products:[
        {id:"glass-eye-tee",title:"THE GLASS EYE TEE",type:"tee",colorway:"washed-black",art:"glass-eye-mark"},
        {id:"glass-eye-print",title:"THE GLASS EYE PRINT",type:"art-print",colorway:"paper",art:"glass-eye-still"}
       ]}
    ],
    artLibrary:[
      {id:"escie-signal-mark",format:["screenprint","embroidery","sticker","web"],required:true},
      {id:"bam-001-front",format:["screenprint","poster","web"],required:true},
      {id:"bam-evidence-sheet",format:["poster","print","web"],required:true},
      {id:"signal-symbol-sheet",format:["sticker","web"],required:true},
      {id:"glass-eye-mark",format:["screenprint","embroidery","web"],required:true},
      {id:"glass-eye-still",format:["print","web"],required:true},
      {id:"site-master-visuals",format:["web","social","background"],required:true}
    ]
  };
  root.ESCIE_MERCH=ESCIE_MERCH;
  if(typeof module!=="undefined"&&module.exports)module.exports=ESCIE_MERCH;
})(typeof window!=="undefined"?window:globalThis);
