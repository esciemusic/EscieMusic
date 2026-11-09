/* ESCIE UNIFIED ENTITY BRIDGE
 * Public site reads only the public projection. Central remains the canonical control plane.
 */
(function(){
 "use strict";
 const root=window;
 const API="https://ljdkjzvnwnaluevtzker.supabase.co/functions/v1/escie-public";
 async function load(){
  const response=await fetch(API,{headers:{Accept:"application/json"},cache:"no-store"});
  if(!response.ok)throw Error("ESCIE_PUBLIC_ENTITY_HTTP_"+response.status);
  const body=await response.json();
  const entities=Array.isArray(body&&body.entities)?body.entities:[];
  root.ESCIE_UNIFIED_ENTITIES=entities;
  root.ESCIE_UNIFIED_ENTITY_INDEX=Object.fromEntries(entities.map(x=>[String(x.id),x]));
  return entities;
 }
 root.ESCIE_UNIFIED={status:"LOADING",ready:load().then(function(v){root.ESCIE_UNIFIED.status="READY";return v;}).catch(function(error){root.ESCIE_UNIFIED.status="OFFLINE";root.ESCIE_UNIFIED.error=String(error&&error.message||error);root.ESCIE_UNIFIED_ENTITIES=[];root.ESCIE_UNIFIED_ENTITY_INDEX={};return [];})};
})();