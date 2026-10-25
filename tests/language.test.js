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
    }
  };
  window.ESCIE_TESTS=window.ESCIE_TESTS||[];
  window.ESCIE_TESTS.push(test);
  if(typeof module!=="undefined"&&module.exports)module.exports=test;
})();