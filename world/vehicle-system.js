/* ESCIE THE WORLD · Vehicle registry / ownership / radio layer */
(()=>{"use strict";
const KEY="escie_world_vehicles_v1";
const VEHICLES={
 TAXI:{id:"TAXI",type:"CAR",label:"TAXI",price:0,owned:false,speed:2,risk:1,radio:true},
 COMPACT:{id:"COMPACT",type:"CAR",label:"COMPACT",price:3500,owned:false,speed:3,risk:1,radio:true},
 SEDAN:{id:"SEDAN",type:"CAR",label:"SEDAN",price:6000,owned:false,speed:3,risk:1,radio:true},
 BIKE:{id:"BIKE",type:"BIKE",label:"BIKE",price:250,speed:2,risk:0,radio:false},
 SKATEBOARD:{id:"SKATEBOARD",type:"BOARD",label:"SKATEBOARD",price:100,speed:1,risk:0,radio:false},
 ROLLERBLADES:{id:"ROLLERBLADES",type:"BOARD",label:"ROLLERBLADES",price:140,speed:1,risk:0,radio:false}
};
const DEFAULT={owned:["BIKE","SKATEBOARD","ROLLERBLADES"],current:null,radio:true,condition:{},history:[]};
const clone=o=>JSON.parse(JSON.stringify(o));
const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||"null");return v&&Array.isArray(v.owned)?v:clone(DEFAULT)}catch(e){return clone(DEFAULT)}};
const save=s=>{try{const raw=JSON.stringify(s);localStorage.setItem(KEY,raw);if(localStorage.getItem(KEY)!==raw)throw new Error("SAVE_VERIFY_FAILED:"+KEY);return s}catch(e){return null}};
const get=id=>VEHICLES[String(id||"").toUpperCase()]||null;
const own=id=>read().owned.includes(String(id).toUpperCase());
const acquire=(id)=>{const s=read(),v=get(id);if(!v)return {ok:false,reason:"UNKNOWN_VEHICLE"};if(!s.owned.includes(v.id))s.owned.push(v.id);if(!save(s))return {ok:false,reason:"SAVE_FAILED"};return {ok:true,vehicle:v,state:s}};
const enter=(id)=>{const s=read(),v=get(id);if(!v)return {ok:false,reason:"UNKNOWN_VEHICLE"};if(!v.owned&&!s.owned.includes(v.id)&&v.id!=="TAXI")return {ok:false,reason:"NOT_OWNED"};s.current=v.id;s.history.unshift({type:"ENTER",vehicle:v.id,day:window.ESCIE_WORLD_SIMULATION?.state?.().day||1});s.history=s.history.slice(0,100);if(!save(s))return {ok:false,reason:"SAVE_FAILED"};window.ESCIE_WORLD_SIMULATION?.setTransport?.(v.type==="CAR"?"CAR":v.type);return {ok:true,vehicle:v,state:s}};
const exit=()=>{const s=read();const old=s.current;s.current=null;s.history.unshift({type:"EXIT",vehicle:old,day:window.ESCIE_WORLD_SIMULATION?.state?.().day||1});s.history=s.history.slice(0,100);if(!save(s))return {ok:false,reason:"SAVE_FAILED"};window.ESCIE_WORLD_SIMULATION?.setTransport?.("FOOT");return {ok:true,state:s}};
const radio=()=>{const s=read(),v=get(s.current);if(!v?.radio)return {ok:false,reason:"NO_RADIO"};return window.ESCIE_WORLD_SIMULATION?.radioBroadcast?.()||{ok:false,reason:"RADIO_UNAVAILABLE"}};
const damage=(amount=0)=>{const s=read();if(!s.current)return {ok:false,reason:"NO_VEHICLE"};const id=s.current;s.condition[id]=Math.max(0,Number(s.condition[id]??100)-Math.max(0,Number(amount)||0));if(!save(s))return {ok:false,reason:"SAVE_FAILED"};return {ok:true,condition:s.condition[id],vehicle:get(id)}};
const state=()=>{const s=read();return {owned:s.owned.map(get).filter(Boolean),current:get(s.current),radio:s.radio,condition:s.condition,history:s.history}};
window.ESCIE_WORLD_VEHICLES={state,vehicles:VEHICLES,get,own,acquire,enter,exit,radio,damage};
})();