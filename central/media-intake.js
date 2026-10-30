/* ESCIE CENTRAL · MEDIA INTAKE
 * One intake record -> deterministic canonical destinations.
 * Central owns classification; individual site files do not.
 */
(function(root){
  "use strict";
  const DEST={
    media:"data/media.js",
    locations:"data/locations.js",
    city:"data/world-city.js",
    archive:"data/archive.js",
    investigation:"data/investigation.js"
  };
  const clean=v=>String(v==null?"":v).trim();
  function slug(v){return clean(v).toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_|_$/g,"").slice(0,80)}
  function normalize(input){
    const i=input||{}, location=i.location||{}, coordinates=i.coordinates||{};
    const type=clean(i.type||"photo").toLowerCase();
    const id=clean(i.id)||("media-"+Date.now());
    const lat=coordinates.lat===""||coordinates.lat==null?null:Number(coordinates.lat);
    const lng=coordinates.lng===""||coordinates.lng==null?null:Number(coordinates.lng);
    return {
      id,type,asset:clean(i.asset),title:clean(i.title)||id,alt:clean(i.alt),
      caption:clean(i.caption),tags:Array.isArray(i.tags)?i.tags.map(clean).filter(Boolean):[],
      location:{
        locationId:clean(location.locationId)||slug(location.label),
        label:clean(location.label),district:clean(location.district),
        placeType:clean(location.placeType)||"place",
        landmarkId:clean(location.landmarkId)||null,
        coordinates:{lat:Number.isFinite(lat)?lat:null,lng:Number.isFinite(lng)?lng:null,accuracyM:coordinates.accuracyM==null?null:Number(coordinates.accuracyM)},
        coordinateSource:clean(location.coordinateSource)||"user_provided"
      },
      placement:{
        publicSections:Array.isArray(i.publicSections)?i.publicSections.map(clean).filter(Boolean):[],
        worldDistricts:Array.isArray(i.worldDistricts)?i.worldDistricts.map(clean).filter(Boolean):[],
        worldBuildings:Array.isArray(i.worldBuildings)?i.worldBuildings.map(clean).filter(Boolean):[],
        visualRoles:Array.isArray(i.visualRoles)?i.visualRoles.map(clean).filter(Boolean):["environment","reference"]
      },
      game:{enabled:i.gameEnabled!==false,useAsReference:i.gameReference!==false,useAsTexture:i.gameTexture===true,useAsBillboard:i.gameBillboard===true,useAsEvidence:i.gameEvidence===true}
    };
  }
  function route(record){
    const r=normalize(record), destinations=[{file:DEST.media,reason:"canonical visual asset record"}];
    if(r.location.locationId||r.location.landmarkId) destinations.push({file:DEST.locations,reason:"place/landmark relationship"});
    if(r.placement.worldDistricts.length||r.placement.worldBuildings.length||r.location.landmarkId) destinations.push({file:DEST.city,reason:"THE WORLD geographic placement"});
    if(r.game.useAsEvidence) destinations.push({file:DEST.investigation,reason:"explicit evidence usage"});
    if(r.publicSections.includes("ARCHIVE")||r.type==="archive") destinations.push({file:DEST.archive,reason:"archive placement"});
    return {record:r,destinations:[...new Map(destinations.map(d=>[d.file,d])).values()],status:"PENDING_APPROVAL"};
  }
  function toWritePlan(record){
    const routed=route(record);
    return Object.assign(routed,{operation:"UPSERT_MEDIA",canonicalId:routed.record.id,createdAt:new Date().toISOString(),humanApprovalRequired:true});
  }
  root.ESCIE_CENTRAL_MEDIA={DEST,normalize,route,toWritePlan};
  if(typeof module!=="undefined"&&module.exports)module.exports={DEST,normalize,route,toWritePlan};
})(typeof window!=="undefined"?window:globalThis);
