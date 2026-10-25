/*
 * ESCIE TESTS — IDLE SIGNAL
 *
 * The idle atmosphere is presentation-only and must not create content.
 */
(function(){
  "use strict";
  function assert(condition,message){if(!condition)throw new Error(message);}
  function run(){
    const idle=typeof window!=="undefined"?window.ESCIE_IDLE_SIGNAL:null;
    if(!idle)return {skipped:true,reason:"idle signal unavailable"};
    assert(Array.isArray(idle.states)&&idle.states.length===4,"idle signal must expose four presentation states");
    assert(typeof idle.hasPublicTransmission==="function","idle signal must expose its public-content gate");
    assert(idle.hasPublicTransmission({allPublicRecords:()=>[]})===false,"empty public registry should activate idle mode");
    assert(idle.hasPublicTransmission({allPublicRecords:()=>[{type:"music"}]})===true,"public transmission should deactivate idle mode");
    return {passed:true};
  }
  if(typeof window!=="undefined")window.ESCIE_TEST_IDLE_SIGNAL={run};
  if(typeof module!=="undefined"&&module.exports)module.exports={run};
})();
