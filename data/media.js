/* ESCIE MEDIA LIBRARY
 * Canonical metadata for photographs, artwork, video stills and other visual
 * assets used across the public site and THE WORLD.
 *
 * Files live under assets/media/. This registry tells the system WHAT an asset
 * is, WHERE it belongs, and HOW it may be reused. It never invents location
 * coordinates: enter verified coordinates when known.
 */
(function(root){
  "use strict";

  const ESCIE_MEDIA=[
    {
      id:"photo-parc-extension-example-001",
      type:"photo",
      status:"draft",
      asset:"assets/media/photo-parc-extension-example-001.jpg",
      title:"Graffiti Wall / Benches / Autumn",
      alt:"Blue graffiti mural behind benches with fallen autumn leaves",
      caption:"",
      tags:["montreal","graffiti","street","autumn","architecture","benches"],
      location:{
        locationId:"LITTLE_ITALY",
        label:"DANTE PARK · LITTLE ITALY",
        coordinates:{lat:null,lng:null,accuracyM:null},
        coordinateSource:"user_provided",
        district:"Little Italy",
        address:"",
        notes:"User identified this photograph as Dante Park in Little Italy. Exact coordinates can be added when available."
      },
      capture:{
        date:null,
        photographer:"ESCIE",
        source:"original",
        notes:""
      },
      rights:{
        usage:"site_and_world",
        credit:"",
        license:""
      },
      placement:{
        publicSections:["WORK","THE WORLD","ARCHIVE","INVESTIGATION"],
        worldDistricts:["LITTLE_ITALY"],
        worldBuildings:[],
        visualRoles:["environment","reference","archive"],
        priority:50
      },
      game:{
        enabled:true,
        useAsReference:true,
        useAsTexture:false,
        useAsBillboard:false,
        useAsEvidence:false
      }
    }
  ];

  function clean(value){ return String(value==null?"":value).trim(); }

  function normalize(item){
    if(!item||typeof item!=="object"||!clean(item.id)||!clean(item.asset)) return null;
    const location=item.location&&typeof item.location==="object"?item.location:{};
    const coordinates=location.coordinates&&typeof location.coordinates==="object"?location.coordinates:{};
    const placement=item.placement&&typeof item.placement==="object"?item.placement:{};
    const game=item.game&&typeof item.game==="object"?item.game:{};
    const lat=coordinates.lat==null?null:Number(coordinates.lat);
    const lng=coordinates.lng==null?null:Number(coordinates.lng);
    return Object.assign({},item,{
      id:clean(item.id),
      type:clean(item.type||"photo").toLowerCase(),
      status:clean(item.status||"draft").toLowerCase(),
      asset:clean(item.asset),
      title:clean(item.title),
      alt:clean(item.alt),
      caption:clean(item.caption),
      tags:Array.isArray(item.tags)?item.tags.map(clean).filter(Boolean):[],
      location:Object.assign({},location,{
        locationId:clean(location.locationId),
        label:clean(location.label),
        district:clean(location.district),
        address:clean(location.address),
        coordinates:{
          lat:Number.isFinite(lat)?lat:null,
          lng:Number.isFinite(lng)?lng:null,
          accuracyM:coordinates.accuracyM==null?null:Number(coordinates.accuracyM)
        }
      }),
      placement:Object.assign({},placement,{
        publicSections:Array.isArray(placement.publicSections)?placement.publicSections.map(clean).filter(Boolean):[],
        worldDistricts:Array.isArray(placement.worldDistricts)?placement.worldDistricts.map(clean).filter(Boolean):[],
        worldBuildings:Array.isArray(placement.worldBuildings)?placement.worldBuildings.map(clean).filter(Boolean):[],
        visualRoles:Array.isArray(placement.visualRoles)?placement.visualRoles.map(clean).filter(Boolean):[],
        priority:Number.isFinite(Number(placement.priority))?Number(placement.priority):50
      }),
      game:Object.assign({},game,{
        enabled:game.enabled!==false,
        useAsReference:game.useAsReference!==false,
        useAsTexture:game.useAsTexture===true,
        useAsBillboard:game.useAsBillboard===true,
        useAsEvidence:game.useAsEvidence===true
      })
    });
  }

  function all(){
    const seen=new Set();
    return ESCIE_MEDIA.map(normalize).filter(item=>{
      if(!item||seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  function get(id){ return all().find(item=>item.id===clean(id))||null; }

  function byLocation(locationId){
    const id=clean(locationId);
    return all().filter(item=>item.location.locationId===id);
  }

  function forSection(section){
    const key=clean(section).toUpperCase();
    return all()
      .filter(item=>item.placement.publicSections.map(v=>v.toUpperCase()).includes(key))
      .sort((a,b)=>b.placement.priority-a.placement.priority);
  }

  function forWorldDistrict(district){
    const key=clean(district).toUpperCase();
    return all().filter(item=>item.placement.worldDistricts.map(v=>v.toUpperCase()).includes(key));
  }

  function forWorldBuilding(buildingId){
    const key=clean(buildingId).toUpperCase();
    return all().filter(item=>item.placement.worldBuildings.map(v=>v.toUpperCase()).includes(key));
  }

  function coordinates(itemOrId){
    const item=typeof itemOrId==="string"?get(itemOrId):normalize(itemOrId);
    if(!item) return null;
    const c=item.location.coordinates;
    return Number.isFinite(c.lat)&&Number.isFinite(c.lng)?{lat:c.lat,lng:c.lng,accuracyM:c.accuracyM}:null;
  }

  function validate(){
    const items=all();
    const ids=items.map(item=>item.id);
    const invalidCoordinates=items.filter(item=>{
      const c=item.location.coordinates;
      return (c.lat!=null&&!Number.isFinite(c.lat))||(c.lng!=null&&!Number.isFinite(c.lng));
    }).map(item=>item.id);
    return {
      ok:new Set(ids).size===ids.length&&invalidCoordinates.length===0,
      count:items.length,
      duplicateIds:ids.filter((id,i)=>ids.indexOf(id)!==i),
      invalidCoordinates,
      unpublished:items.filter(item=>item.status!=="published").map(item=>item.id)
    };
  }

  root.ESCIE_MEDIA_LIBRARY=ESCIE_MEDIA;
  root.ESCIE_MEDIA_CATALOG={
    all,
    get,
    byLocation,
    forSection,
    forWorldDistrict,
    forWorldBuilding,
    coordinates,
    validate
  };

  if(typeof module!=="undefined"&&module.exports){
    module.exports={ESCIE_MEDIA,all,get,byLocation,forSection,forWorldDistrict,forWorldBuilding,coordinates,validate};
  }
})(typeof window!=="undefined"?window:globalThis);
