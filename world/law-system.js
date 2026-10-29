/* ESCIE THE WORLD · Law / response foundation */
(()=>{"use strict";
const KEY="escie_world_law_v1";
const DEFAULT={units:[],active:false,level:0,lastDispatch:null,arrests:0,escapes:0};
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")||JSON.parse(JSON.stringify(DEFAULT))}catch(e){return JSON.parse(JSON.stringify(DEFAULT))}};
const save=s=>{localStorage.setItem(KEY,JSON.stringify(s));return s};
const dispatch=(source="UNKNOWN",level=1)=>{const s=read(),sim=window.ESCIE_WORLD_SIMULATION?.state?.()||{};s.level=Math.max(s.level,Number(level)||1);s.active=s.level>0;s.lastDispatch={source,level:s.level,day:sim.day||1,hour:sim.hour||0,neighbourhood:sim.neighbourhood||"UNKNOWN"};s.units=s.units.length?s.units:[{id:"unit_01",type:"POLICE",status:"DISPATCHED"}];save(s);return {ok:true,...s}};
const tick=()=>{const s=read(),sim=window.ESCIE_WORLD_SIMULATION?.state?.()||{};if(!sim.wanted){s.active=false;s.level=0;s.units=[]}else{dispatch("WANTED_STATE",sim.wanted)}return save(s)};
const arrest=()=>{const s=read(),sim=window.ESCIE_WORLD_SIMULATION;if(!sim)return {ok:false,reason:"SIMULATION_UNAVAILABLE"};const st=sim.state();if(!st.wanted)return {ok:false,reason:"NOT_WANTED"};s.arrests++;s.active=false;s.units=[];s.level=0;save(s);const served=sim.serve(Math.max(15,st.wanted*30));return {ok:true,sentence:served?.sentence_minutes||0}};
const escape=()=>{const s=read();s.escapes++;s.active=false;s.level=0;s.units=[];return save(s)};
const state=read;
window.ESCIE_WORLD_LAW={state,dispatch,tick,arrest,escape};
addEventListener("escie:world-detection",e=>dispatch(e.detail?.source||"DETECTION",e.detail?.level||1));
})();