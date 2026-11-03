const ESCIE_SITE={name:"ESCIE",location:"Montréal, Québec, Canada",publicYear:2026,tagline:"REALITY WITH THE SIGNAL DISTORTED.",philosophy:"The music does not create the universe. The universe creates the music.",premise:"ESCIE is the doorway. The work is art, memory, life and proof.",status:"active",publicPreview:true,version:"0.2.3"};

(function(root){
  if(typeof window!=="undefined") window.ESCIE_SITE=ESCIE_SITE;
  if(typeof module!=="undefined"&&module.exports) module.exports=ESCIE_SITE;
  if(typeof document==="undefined") return;

  const labels={
    art:"ART",
    world:"THE WORLD",
    web:"THE WEB",
    archives:"THE ARCHIVES",
    investigation:"THE CASE FILES",
    merch:"THE WORLD YOU CAN WEAR",
    "glass-eye":"GLASS EYE",
    escie:"ESCIE"
  };
  const symbols={
    art:"✳",
    world:"◌",
    web:"⌕",
    archives:"▣",
    investigation:"?",
    merch:"◇",
    "glass-eye":"◎",
    escie:"◇"
  };

  function polish(){
    const now=document.getElementById("now");
    if(now) now.hidden=true;

    Object.keys(labels).forEach(id=>{
      const section=document.getElementById(id);
      if(!section) return;
      const heading=section.querySelector("h2");
      if(heading) heading.textContent=labels[id];

      const trigger=section.querySelector(".section-drop-trigger");
      if(trigger){
        const title=trigger.querySelector(".section-drop-title");
        if(title) title.textContent=labels[id];
        if(!trigger.querySelector(".section-drop-universe-symbol")){
          const mark=document.createElement("span");
          mark.className="section-drop-universe-symbol";
          mark.setAttribute("aria-hidden","true");
          mark.textContent=symbols[id]||"·";
          const plus=trigger.querySelector(".section-drop-symbol");
          if(plus) trigger.insertBefore(mark,plus);
          else trigger.appendChild(mark);
        }
      }
    });

    const escie=document.querySelector("#escie .section-lede");
    if(escie) escie.textContent="ESCIE IS THE ARTIST. THE WORK SPEAKS FROM HERE.";

    const merch=document.querySelector("#merch .merch-lede");
    if(merch) merch.textContent="Clothing is the physical layer of the ESCIE world. The work remains free.";

    document.documentElement.dataset.publicPolish="ready";
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",polish,{once:true});
  else polish();
})(typeof window!=="undefined"?window:globalThis);