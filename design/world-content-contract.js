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
    "certainty","created_at","updated_at","tags","locale","media","rights","source"
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
  const MEDIA_TYPES = Object.freeze(["image","audio","video","document","embed"]);
  const RIGHTS_STATES = Object.freeze(["cleared","licensed","owned","unknown","restricted","expired"]);
  const RELEASE_STATES = Object.freeze(["unreleased","scheduled","released","embargoed","withheld"]);
  const RELATIONSHIP_STRENGTH = Object.freeze(["weak","normal","strong","defining"]);

  function validateMedia(media){
    const errors=[];
    if(!isRecord(media)){return {ok:false,errors:["media must be an object"]};}
    if(!media.id || typeof media.id!=="string") errors.push("media id is required");
    if(!validEnum(media.type,MEDIA_TYPES)) errors.push("media type is invalid");
    if(!media.source || typeof media.source!=="string") errors.push("media source is required");
    if(!validEnum(media.rights_state,RIGHTS_STATES)) errors.push("media rights_state is invalid");
    if(!media.alt && media.type==="image") errors.push("image alt text is required");
    if(media.public_disclosure!==true && media.visibility==="public") errors.push("public media must be disclosed");
    return {ok:errors.length===0,errors};
  }

  function validateReleaseState(record){
    const errors=[];
    if(record.type!=="art") return {ok:true,errors:[]};
    if(!validEnum(record.release_state,RELEASE_STATES)) errors.push("art release_state is invalid");
    if(record.release_state==="unreleased" && record.public_disclosure===true) errors.push("unreleased art cannot be publicly disclosed");
    if(record.release_state==="released" && record.status==="published" && record.visibility!=="public") errors.push("released art must be public when published");
    return {ok:errors.length===0,errors};
  }

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
    if(record.type==="art" && record.media!==undefined){
      if(!Array.isArray(record.media)) errors.push("media must be an array");
      else record.media.forEach(function(media){
        const mediaResult=validateMedia(media);
        if(!mediaResult.ok) mediaResult.errors.forEach(function(error){errors.push(error);});
      });
    }
    const releaseResult=validateReleaseState(record);
    if(!releaseResult.ok) releaseResult.errors.forEach(function(error){errors.push(error);});

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
      created_at:"prototype",updated_at:"prototype",tags:["prototype"],medium:"mixed",artist:"prototype-person-escie",release_state:"released",media:[]
    }
  ]);

  const stressFixtures=Object.freeze([
    {id:"stress-moment-01",type:"moment",title:"Prototype Moment",summary:"A representative moment for density testing.",status:"approved",visibility:"public",public_disclosure:true,certainty:"known",created_at:"prototype",updated_at:"prototype",tags:["stress","moment"],date:"2026-01-01",end_date:"",people:["prototype-person-escie"],places:["prototype-place-montreal"]},
    {id:"stress-fragment-01",type:"fragment",title:"Prototype Fragment",summary:"A short fragment used to test deeper World layers.",status:"approved",visibility:"public",public_disclosure:true,certainty:"probable",created_at:"prototype",updated_at:"prototype",tags:["stress","fragment"],source:"prototype",excerpt:"A representative fragment.",context:"Prototype context."},
    {id:"stress-proof-01",type:"proof",title:"Prototype Proof",summary:"A representative evidence record.",status:"approved",visibility:"public",public_disclosure:true,certainty:"known",created_at:"prototype",updated_at:"prototype",tags:["stress","proof"],source:"prototype",evidence_type:"image",captured_at:"2026-01-01"},
    {id:"stress-body-01",type:"body",title:"Prototype Body",summary:"A representative body/media record.",status:"approved",visibility:"public",public_disclosure:true,certainty:"uncertain",created_at:"prototype",updated_at:"prototype",tags:["stress","body"],subject:"prototype-person-escie",medium:"photograph",condition:"preserved"},
    {id:"stress-symbol-01",type:"symbol",title:"Prototype Symbol",summary:"A representative recurring symbol.",status:"approved",visibility:"public",public_disclosure:true,certainty:"probable",created_at:"prototype",updated_at:"prototype",tags:["stress","symbol"],meaning:"prototype meaning",appearances:["stress-moment-01"]},
    {id:"stress-timeline-01",type:"timeline",title:"Prototype Timeline Event",summary:"A representative timeline entry.",status:"approved",visibility:"public",public_disclosure:true,certainty:"known",created_at:"prototype",updated_at:"prototype",tags:["stress","timeline"],date:"2026-01-01",event_type:"moment",references:["stress-moment-01"]},
    {id:"stress-archive-01",type:"archive",title:"Prototype Archive",summary:"A representative preserved record.",status:"approved",visibility:"public",public_disclosure:true,certainty:"known",created_at:"prototype",updated_at:"prototype",tags:["stress","archive"],archive_type:"preserved",preserved_at:"2026-01-01",references:["stress-fragment-01"]},
    {id:"stress-investigation-01",type:"investigation",title:"Prototype Investigation",summary:"A representative investigation layer.",status:"approved",visibility:"public",public_disclosure:true,certainty:"uncertain",created_at:"prototype",updated_at:"prototype",tags:["stress","investigation"],question:"What connects these records?",case_state:"open",references:["stress-proof-01","stress-fragment-01"]}
  ]);

  const stressGraph=Object.freeze([
    ["prototype-person-escie","located_at","prototype-place-montreal"],
    ["prototype-art-work","created_by","prototype-person-escie"],
    ["prototype-art-work","references","stress-moment-01"],
    ["stress-moment-01","involves","prototype-person-escie"],
    ["stress-moment-01","happened_at","prototype-place-montreal"],
    ["stress-fragment-01","derived_from","stress-moment-01"],
    ["stress-proof-01","documents","stress-moment-01"],
    ["stress-body-01","related_to","prototype-person-escie"],
    ["stress-symbol-01","appears_in","stress-moment-01"],
    ["stress-timeline-01","references","stress-moment-01"],
    ["stress-archive-01","contains","stress-fragment-01"],
    ["stress-investigation-01","references","stress-proof-01"],
    ["stress-investigation-01","references","stress-fragment-01"]
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

  function readiness(){
    const recordChecks=fixtures.concat(stressFixtures).map(validateRecord);
    const relationshipChecks=fixtureRelationships.map(validateRelationship);
    const recordPass=recordChecks.filter(function(x){return x.ok;}).length;
    const relationshipPass=relationshipChecks.filter(function(x){return x.ok;}).length;
    return Object.freeze({
      records:recordChecks.length?recordPass/recordChecks.length:1,
      relationships:relationshipChecks.length?relationshipPass/relationshipChecks.length:1,
      stressRecords:stressFixtures.length,
      stressValidRecords:stressFixtures.filter(function(x){return validateRecord(x).ok;}).length,
      publishableRecords:fixtures.filter(canPublish).length,
      publishableRelationships:fixtureRelationships.filter(canPublishRelationship).length,
      ok:recordPass===recordChecks.length && relationshipPass===relationshipChecks.length
    });
  }

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
    mediaTypes:MEDIA_TYPES,
    rightsStates:RIGHTS_STATES,
    releaseStates:RELEASE_STATES,
    validateRecord,
    validateRelationship,
    validateMedia,
    validateReleaseState,
    canPublish,
    canPublishRelationship,
    readiness,
    fixtures,
    stressFixtures,
    stressGraph,
    fixtureRelationships
  });

  window.ESCIE_WORLD_CONTENT_CONTRACT=contract;
})();
