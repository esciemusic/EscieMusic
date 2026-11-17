/* ESCIE prototype — World content contract
 * Prototype-only foundation. Production schemas remain untouched.
 * Purpose: make every future World record predictable before real content is added.
 */
(function(){
  "use strict";

  const TYPES = Object.freeze([
    "person","place","moment","art","fragment","proof","body",
    "symbol","timeline","archive","investigation","connection"
  ]);

  const VISIBILITY = Object.freeze(["public","private","internal","withheld","draft"]);
  const STATUS = Object.freeze(["draft","review","approved","published","archived","withheld"]);
  const CERTAINTY = Object.freeze(["known","probable","uncertain","unknown","disputed"]);

  const COMMON = Object.freeze([
    "id","type","title","summary","status","visibility","public_disclosure",
    "certainty","created_at","updated_at","tags"
  ]);

  const TYPE_FIELDS = Object.freeze({
    person:["name","role","aliases"],
    place:["location","address","coordinates"],
    moment:["date","end_date","people","places"],
    art:["medium","artist","release_state","media"],
    fragment:["source","excerpt","context"],
    proof:["source","evidence_type","captured_at"],
    body:["subject","medium","condition"],
    symbol:["meaning","appearances"],
    timeline:["date","event_type","references"],
    archive:["archive_type","preserved_at","references"],
    investigation:["question","case_state","references"],
    connection:["from","to","relationship_type","direction","strength","source"]
  });

  const RELATIONSHIP_TYPES = Object.freeze([
    "belongs_to","located_at","happened_at","involves","created_by",
    "references","contains","follows","precedes","connects_to",
    "contrasts_with","derived_from","documents","appears_in",
    "related_to","influences"
  ]);

  const RELATIONSHIP_DIRECTIONS = Object.freeze(["directed","undirected"]);
  const RELATIONSHIP_STRENGTH = Object.freeze(["weak","normal","strong","defining"]);

  function isRecord(value){
    return Boolean(value && typeof value==="object" && !Array.isArray(value));
  }

  function validEnum(value,list){ return list.includes(value); }

  function validateRecord(record){
    const errors=[];
    if(!isRecord(record)){ return {ok:false,errors:["record must be an object"]}; }

    if(!record.id || typeof record.id!=="string") errors.push("id is required");
    if(!validEnum(record.type,TYPES)) errors.push("type is invalid");
    if(!record.title || typeof record.title!=="string") errors.push("title is required");
    if(!validEnum(record.status,STATUS)) errors.push("status is invalid");
    if(!validEnum(record.visibility,VISIBILITY)) errors.push("visibility is invalid");
    if(typeof record.public_disclosure!=="boolean") errors.push("public_disclosure must be boolean");
    if(!validEnum(record.certainty,CERTAINTY)) errors.push("certainty is invalid");
    if(!Array.isArray(record.tags)) errors.push("tags must be an array");

    const fields=TYPE_FIELDS[record.type]||[];
    fields.forEach(function(field){
      if(record[field]===undefined) return;
      if(["people","places","references","appearances","media","aliases","coordinates"].includes(field)){
        if(!Array.isArray(record[field])) errors.push(field+" must be an array");
      }
    });

    if(record.visibility!=="public" && record.public_disclosure===true){
      errors.push("non-public visibility cannot have public_disclosure=true");
    }
    if(record.status==="published" && record.visibility!=="public"){
      errors.push("published records must be public");
    }
    if(record.status==="published" && record.public_disclosure!==true){
      errors.push("published records must have public_disclosure=true");
    }

    return {ok:errors.length===0,errors};
  }

  function validateRelationship(record){
    const errors=[];
    if(!isRecord(record)) return {ok:false,errors:["relationship must be an object"]};
    ["id","from","to","relationship_type","direction","strength","certainty","visibility","public_disclosure"].forEach(function(field){
      if(record[field]===undefined || record[field]===null || record[field]==="") errors.push(field+" is required");
    });
    if(!validEnum(record.relationship_type,RELATIONSHIP_TYPES)) errors.push("relationship_type is invalid");
    if(!validEnum(record.direction,RELATIONSHIP_DIRECTIONS)) errors.push("direction is invalid");
    if(!validEnum(record.strength,RELATIONSHIP_STRENGTH)) errors.push("strength is invalid");
    if(!validEnum(record.certainty,CERTAINTY)) errors.push("certainty is invalid");
    if(!validEnum(record.visibility,VISIBILITY)) errors.push("visibility is invalid");
    if(typeof record.public_disclosure!=="boolean") errors.push("public_disclosure must be boolean");
    if(record.visibility!=="public" && record.public_disclosure===true) errors.push("non-public relationship cannot be disclosed");
    return {ok:errors.length===0,errors};
  }

  function canPublish(record){
    const result=validateRecord(record);
    return result.ok &&
      record.status==="approved" &&
      record.visibility==="public" &&
      record.public_disclosure===true;
  }

  function canPublishRelationship(record){
    const result=validateRelationship(record);
    return result.ok &&
      record.visibility==="public" &&
      record.public_disclosure===true &&
      record.certainty!=="disputed";
  }

  const fixtures=Object.freeze([
    {
      id:"prototype-person-escie",type:"person",title:"ESCIE",summary:"Prototype person record.",
      status:"approved",visibility:"public",public_disclosure:true,certainty:"known",
      created_at:"prototype",updated_at:"prototype",tags:["artist"],name:"ESCIE",role:"artist",aliases:[]
    },
    {
      id:"prototype-place-montreal",type:"place",title:"Montréal",summary:"Prototype Home record.",
      status:"approved",visibility:"public",public_disclosure:true,certainty:"known",
      created_at:"prototype",updated_at:"prototype",tags:["home"],location:"Montréal, Québec, Canada",address:"",coordinates:[]
    },
    {
      id:"prototype-art-work",type:"art",title:"Prototype Work",summary:"Safe placeholder for future public art.",
      status:"approved",visibility:"public",public_disclosure:true,certainty:"known",
      created_at:"prototype",updated_at:"prototype",tags:["prototype"],medium:"mixed",artist:"prototype-person-escie",release_state:"approved",media:[]
    }
  ]);

  const fixtureRelationships=Object.freeze([
    {
      id:"prototype-escie-montreal",from:"prototype-person-escie",to:"prototype-place-montreal",
      relationship_type:"located_at",direction:"directed",strength:"defining",certainty:"known",
      visibility:"public",public_disclosure:true,source:"prototype"
    },
    {
      id:"prototype-art-escie",from:"prototype-art-work",to:"prototype-person-escie",
      relationship_type:"created_by",direction:"directed",strength:"defining",certainty:"known",
      visibility:"public",public_disclosure:true,source:"prototype"
    }
  ]);

  const contract=Object.freeze({
    version:"0.1.0-prototype",
    principle:"Create once → classify once → connect once → review → approve → publish.",
    types:TYPES,
    visibility:VISIBILITY,
    status:STATUS,
    certainty:CERTAINTY,
    commonFields:COMMON,
    typeFields:TYPE_FIELDS,
    relationshipTypes:RELATIONSHIP_TYPES,
    relationshipDirections:RELATIONSHIP_DIRECTIONS,
    relationshipStrength:RELATIONSHIP_STRENGTH,
    validateRecord,
    validateRelationship,
    canPublish,
    canPublishRelationship,
    fixtures,
    fixtureRelationships
  });

  window.ESCIE_WORLD_CONTENT_CONTRACT=contract;
})();
