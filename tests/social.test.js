/* ESCIE TESTS — SOCIAL LINKS */
(function(){
  "use strict";
  function assert(condition,message){if(!condition)throw new Error(message);}
  function run(){
    const social=typeof window!=="undefined"?window.ESCIE_SOCIAL:null;
    if(!social)return {skipped:true,reason:"social registry unavailable"};
    assert(Array.isArray(social),"social registry must be an array");
    assert(social.every(item=>item&&item.id&&item.label&&item.platform),"social entries require identity metadata");
    const configured=social.filter(item=>item.url);
    assert(configured.every(item=>/^https?:\\/\\//i.test(item.url)),"configured social links must use http or https");
    const ids=social.map(item=>item.id);
    assert(new Set(ids).size===ids.length,"social IDs must be unique");
    return {passed:true,configured:configured.length};
  }
  if(typeof window!=="undefined")window.ESCIE_TEST_SOCIAL={run};
  if(typeof module!=="undefined"&&module.exports)module.exports={run};
})();
