/* ESCIE LANGUAGE CONTRACT TESTS */
(function(){
  "use strict";
  const test={
    name:"language",
    run:function(assert){
      const engine=window.ESCIE_LANGUAGE_ENGINE;
      assert(engine&&typeof engine.renderText==="function","language text renderer must exist");
      const node=document.createElement("div");
      engine.renderText(node,"A <b>test</b>");
      assert(node.textContent==="A <b>test</b>","renderText must keep text as text");
      assert(node.querySelector("b")===null,"renderText must not create HTML nodes");
      const required=["NO TRANSMISSION LOADED","YOUR MEMORY","CLEAR MY MEMORY","FILE IS TOO LARGE. MAXIMUM 10 MB.","TRANSMISSION INTERRUPTED.","Observed. Recorded. Filed."];
      ["en","fr","es"].forEach(language=>{
        required.forEach(key=>assert(engine.translate(key,language)!==key,`missing ${language} translation: ${key}`));
      });
      assert(engine.translate("NO TRANSMISSION LOADED","fr")==="AUCUNE TRANSMISSION CHARGÉE","French runtime translation must resolve");
      assert(engine.translate("NO TRANSMISSION LOADED","es")==="NO HAY TRANSMISIÓN CARGADA","Spanish runtime translation must resolve");
      const mode=engine.mode("documentary");
      assert(mode&&typeof mode.description==="string","mode description must remain available");
    }
  };
  window.ESCIE_TESTS=window.ESCIE_TESTS||[];
  window.ESCIE_TESTS.push(test);
  if(typeof module!=="undefined"&&module.exports)module.exports=test;
})();