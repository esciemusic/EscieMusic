/* ESCIE TESTS — SOCIAL LINKS */
(function(){
  "use strict";
  function assert(condition,message){if(!condition)throw new Error(message);}
  function run(){
    const social=typeof window!=="undefined"?window.ESCIE_SOCIAL:null;
    const normalize=typeof window!=="undefined"?window.normalizeEscieSocial:null;
    if(!social||!normalize)return {skipped:true,reason:"social registry unavailable"};
    assert(Array.isArray(social),"social registry must be an array");
    assert(social.every(item=>item&&item.id&&item.label&&item.platform),"social entries require identity metadata");
    const ids=social.map(item=>item.id);
    assert(new Set(ids).size===ids.length,"social IDs must be unique");
    const normalized=normalize([
      {id:"instagram",label:"INSTAGRAM",platform:"instagram",url:"https://instagram.com/example"},
      {id:"bad",label:"BAD",platform:"unknown",url:"https://example.com"},
      {id:"unsafe",label:"UNSAFE",platform:"youtube",url:"javascript:alert(1)"},
      {id:"youtube",label:"YOUTUBE",platform:"youtube",url:"https://youtube.com/@example"}
    ]);
    assert(normalized.length===2,"normalizer should keep only supported secure social entries");
    assert(normalized.every(item=>/^https?:\\/\\//i.test(item.url)),"normalized links must use http or https");
    return {passed:true,configured:normalized.length};
  }
  if(typeof window!=="undefined")window.ESCIE_TEST_SOCIAL={run};
  if(typeof module!=="undefined"&&module.exports)module.exports={run};
})();
