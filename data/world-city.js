/* ESCIE WORLD CITY DATA — canonical street graph and authored NPC population */
(function(){
"use strict";
const streetNodes={
  "PARC-EXTENSION":[
    {id:"HOME",label:"HOME",x:2,y:7,type:"STREET"},
    {id:"DUROCHER",label:"DUROCHER",x:3,y:7,type:"STREET"},
    {id:"HUTCHISON",label:"HUTCHISON",x:3,y:6,type:"STREET"},
    {id:"JEAN_TALON",label:"JEAN-TALON",x:4,y:5,type:"STREET"},
    {id:"PARC",label:"PARC METRO",x:4,y:6,type:"METRO",station:"Parc"},
    {id:"BEAUMONT",label:"BEAUMONT",x:5,y:5,type:"STREET"},
    {id:"ACADIE",label:"ACADIE METRO",x:6,y:4,type:"METRO",station:"Acadie"},
    {id:"OGILVY",label:"OGILVY",x:7,y:5,type:"STREET"}
  ],
  "MILE END":[
    {id:"LAURIER",label:"LAURIER",x:4,y:5,type:"METRO",station:"Laurier"},
    {id:"SAINT_VIATEUR",label:"SAINT-VIATEUR",x:6,y:5,type:"STREET"},
    {id:"MONT_ROYAL",label:"MONT-ROYAL",x:8,y:5,type:"METRO",station:"Mont-Royal"},
    {id:"SAINT_URBAIN",label:"SAINT-URBAIN",x:8,y:6,type:"STREET"},
    {id:"ROSEMONT",label:"ROSEMONT EDGE",x:11,y:6,type:"STREET"}
  ],
  "PLATEAU":[
    {id:"LAURIER",label:"LAURIER",x:3,y:5,type:"METRO",station:"Laurier"},
    {id:"SAINT_DENIS",label:"SAINT-DENIS",x:5,y:5,type:"STREET"},
    {id:"MONT_ROYAL",label:"MONT-ROYAL",x:7,y:5,type:"METRO",station:"Mont-Royal"},
    {id:"SAINT_LAURENT",label:"SAINT-LAURENT",x:8,y:6,type:"STREET"},
    {id:"SHERBROOKE",label:"SHERBROOKE",x:10,y:7,type:"METRO",station:"Sherbrooke"}
  ],
  "ROSEMONT":[
    {id:"ROSEMONT",label:"ROSEMONT",x:4,y:5,type:"METRO",station:"Rosemont"},
    {id:"BEAUBIEN",label:"BEAUBIEN",x:8,y:6,type:"METRO",station:"Beaubien"},
    {id:"JEAN_TALON",label:"JEAN-TALON",x:11,y:4,type:"METRO",station:"Jean-Talon"},
    {id:"IBERVILLE",label:"IBERVILLE",x:10,y:6,type:"STREET"}
  ],
  "DOWNTOWN":[
    {id:"BERRI_UQAM",label:"BERRI-UQAM",x:4,y:7,type:"METRO",station:"Berri-UQAM"},
    {id:"SAINT_DENIS",label:"SAINT-DENIS",x:5,y:6,type:"STREET"},
    {id:"MCGILL",label:"MCGILL",x:7,y:5,type:"METRO",station:"McGill"},
    {id:"PEEL",label:"PEEL",x:10,y:5,type:"METRO",station:"Peel"},
    {id:"GUY_CONCORDIA",label:"GUY-CONCORDIA",x:12,y:7,type:"METRO",station:"Guy-Concordia"}
  ],
  "OLD MONTREAL":[
    {id:"CHAMP_DE_MARS",label:"CHAMP-DE-MARS",x:5,y:5,type:"METRO",station:"Champ-de-Mars"},
    {id:"PLACE_DARMES",label:"PLACE-D'ARMES",x:9,y:7,type:"METRO",station:"Place-d'Armes"},
    {id:"OLD_PORT",label:"OLD PORT",x:11,y:8,type:"STREET"}
  ],
  "SAINT-HENRI":[
    {id:"SAINT_HENRI",label:"SAINT-HENRI",x:4,y:6,type:"METRO",station:"Saint-Henri"},
    {id:"PLACE_SAINT_HENRI",label:"PLACE-SAINT-HENRI",x:7,y:4,type:"METRO",station:"Place-Saint-Henri"},
    {id:"NOTRE_DAME",label:"NOTRE-DAME",x:8,y:6,type:"STREET"},
    {id:"VENDOME",label:"VENDÔME",x:11,y:6,type:"METRO",station:"Vendôme"}
  ],
  "VERDUN":[
    {id:"DE_LEGLISE",label:"DE L'ÉGLISE",x:5,y:5,type:"METRO",station:"De l'Église"},
    {id:"WELLINGTON",label:"WELLINGTON",x:7,y:6,type:"STREET"},
    {id:"VERDUN",label:"VERDUN",x:9,y:6,type:"METRO",station:"Verdun"}
  ]
};

// Montréal street realism metadata: used to generate believable surface conditions and traversal context.
const STREET_REALISM={
 "LOCAL":{lanes:2,sidewalk:true,parking:true,speed:30},
 "COLLECTOR":{lanes:2,sidewalk:true,parking:true,speed:40},
 "ARTERIAL":{lanes:4,sidewalk:true,parking:false,speed:50},
 "LANEWAY":{lanes:1,sidewalk:false,parking:false,speed:10}
};
const montrealReference=()=>window.ESCIE_CITY_REFERENCE||null;
const districtTexture=(district)=>{
 const r=montrealReference(),d=String(district||"").toUpperCase();
 return r?.district_texture?.[d]||null;
};
const districtReference=(district)=>{
 const r=montrealReference(),d=String(district||"").toUpperCase();
 return r?.districts?.[d]||null;
};
const seasonalSurface=()=>{
 const s=read(),r=montrealReference(),env=r?.environment?.[String(s.season||"").toLowerCase()]||{};
 if(s.season==="WINTER")return {surface:s.weather==="SNOW/COLD"?"SNOW":"SLUSH",traction:0.68,visibility:0.78,plowing:!!env.plowing,snowbanks:!!env.snowbanks};
 if(s.season==="SPRING")return {surface:"WET",traction:0.88,visibility:0.9,potholes:!!env.potholes,construction:!!env.construction};
 if(s.season==="SUMMER")return {surface:"DRY",traction:1,visibility:1,terraces:!!env.terraces,cycling:!!env.cycling};
 return {surface:"WET",traction:0.92,visibility:0.88,wetLeaves:!!env.wet_leaves};
};
const districtActivityProfile=(district)=>{
 const t=districtTexture(district);
 return t?{density:t.density,buildings:t.building,streets:t.street,activity:t.activity,night:t.night}:null;
};
const corridorContext=(district,nodeId)=>{
 const d=String(district||"").toUpperCase(),n=(WORLD_STREETS[d]||[]).find(x=>x.id===nodeId),ref=districtReference(d);
 if(!n)return null;
 const label=String(n.label||"").toUpperCase();
 const corridor=(ref?.corridors||[]).find(c=>label.includes(String(c).toUpperCase().replace(/É/g,"E")));
 const transit=ref?.stations?.find(s=>String(s).toUpperCase()===String(n.station||"").toUpperCase());
 return {district:d,node:n.id,label:n.label,corridor:corridor||null,transit:transit||null,texture:districtActivityProfile(d),season:seasonalSurface()};
};
const streetContext=(district,nodeId)=>{
 const n=(WORLD_STREETS[String(district||"").toUpperCase()]||[]).find(x=>x.id===nodeId);
 if(!n)return null;
 const label=String(n.label||"").toUpperCase();
 const type=n.type==="METRO"?"TRANSIT":label.includes("SIGNAL")?"LANEWAY":["JEAN-TALON","SAINT-DENIS","SAINT-LAURENT","SHERBROOKE","NOTRE-DAME","WELLINGTON"].some(x=>label.includes(x))?"ARTERIAL":"LOCAL";
 return Object.assign({district:String(district||"").toUpperCase(),node:n.id,label:n.label},STREET_REALISM[type],{classification:type});
};

const nearestStreetNode=(neighbourhood,position)=>{
  const nodes=WORLD_STREETS[String(neighbourhood||"").toUpperCase()]||[];
  if(!nodes.length)return null;
  const p=position||{x:2,y:7};
  return nodes.reduce((best,n)=>{
    const d=Math.abs(Number(p.x)-n.x)+Math.abs(Number(p.y)-n.y);
    return !best||d<best.distance?Object.assign({},n,{distance:d}):best
  },null)
};
;
const streetEdges={
  "PARC-EXTENSION":[["HOME","DUROCHER"],["DUROCHER","HUTCHISON"],["HUTCHISON","PARC"],["PARC","JEAN_TALON"],["JEAN_TALON","BEAUMONT"],["BEAUMONT","ACADIE"],["ACADIE","OGILVY"]],
  "MILE END":[["LAURIER","SAINT_VIATEUR"],["SAINT_VIATEUR","MONT_ROYAL"],["MONT_ROYAL","SAINT_URBAIN"],["SAINT_URBAIN","ROSEMONT"]],
  "PLATEAU":[["LAURIER","SAINT_DENIS"],["SAINT_DENIS","MONT_ROYAL"],["MONT_ROYAL","SAINT_LAURENT"],["SAINT_LAURENT","SHERBROOKE"]],
  "ROSEMONT":[["ROSEMONT","BEAUBIEN"],["BEAUBIEN","IBERVILLE"],["IBERVILLE","JEAN_TALON"]],
  "DOWNTOWN":[["BERRI_UQAM","SAINT_DENIS"],["SAINT_DENIS","MCGILL"],["MCGILL","PEEL"],["PEEL","GUY_CONCORDIA"]],
  "OLD MONTREAL":[["CHAMP_DE_MARS","PLACE_DARMES"],["PLACE_DARMES","OLD_PORT"]],
  "SAINT-HENRI":[["SAINT_HENRI","PLACE_SAINT_HENRI"],["PLACE_SAINT_HENRI","NOTRE_DAME"],["NOTRE_DAME","VENDOME"]],
  "VERDUN":[["DE_LEGLISE","WELLINGTON"],["WELLINGTON","VERDUN"]]
};
;
const streetRealism={
 "LOCAL":{lanes:2,sidewalk:true,parking:true,speed:30},
 "COLLECTOR":{lanes:2,sidewalk:true,parking:true,speed:40},
 "ARTERIAL":{lanes:4,sidewalk:true,parking:false,speed:50},
 "LANEWAY":{lanes:1,sidewalk:false,parking:false,speed:10}
};
const npcPopulations={
  "PARC-EXTENSION":[
    {id:"resident_pe_01",role:"RESIDENT",home:"HOME_01",work:"SHOP_01",x:2,y:7,awareness:55},
    {id:"shopkeeper_pe_01",role:"SHOPKEEPER",home:"HOME_01",work:"SHOP_01",x:4,y:5,awareness:65}
  ],
  "MILE END":[
    {id:"barista_me_01",role:"BARISTA",home:"STUDIO_ME",work:"CAFE_ME",x:6,y:5,awareness:60},
    {id:"musician_me_01",role:"MUSICIAN",home:"STUDIO_ME",work:"STUDIO_ME",x:8,y:5,awareness:70}
  ],
  "PLATEAU":[
    {id:"worker_pl_01",role:"WORKER",home:"CLUB_PL",work:"SHOP_PL",x:5,y:5,awareness:55},
    {id:"trainer_pl_01",role:"TRAINER",home:"GYM_PL",work:"GYM_PL",x:10,y:7,awareness:65}
  ],
  "ROSEMONT":[
    {id:"worker_ro_01",role:"WORKER",home:"APARTMENT_RO",work:"SHOP_RO",x:8,y:6,awareness:55},
    {id:"clinic_ro_01",role:"CLINIC_WORKER",home:"APARTMENT_RO",work:"CLINIC_RO",x:11,y:4,awareness:75}
  ],
  "DOWNTOWN":[
    {id:"office_dt_01",role:"OFFICE_WORKER",home:"OFFICE_DT",work:"OFFICE_DT",x:7,y:5,awareness:55},
    {id:"venue_dt_01",role:"VENUE_WORKER",home:"VENUE_DT",work:"VENUE_DT",x:12,y:7,awareness:65}
  ],
  "OLD MONTREAL":[
    {id:"archivist_om_01",role:"ARCHIVIST",home:"ARCHIVE_OM",work:"ARCHIVE_OM",x:9,y:7,awareness:80},
    {id:"vendor_om_01",role:"VENDOR",home:"VENUE_OM",work:"VENUE_OM",x:11,y:8,awareness:55}
  ],
  "SAINT-HENRI":[
    {id:"cafe_sh_01",role:"BARISTA",home:"CAFE_SH",work:"CAFE_SH",x:8,y:6,awareness:60},
    {id:"clinic_sh_01",role:"CLINIC_WORKER",home:"CLINIC_SH",work:"CLINIC_SH",x:11,y:6,awareness:75}
  ],
  "VERDUN":[
    {id:"shop_ve_01",role:"SHOPKEEPER",home:"APARTMENT_VE",work:"SHOP_VE",x:7,y:6,awareness:60},
    {id:"trainer_ve_01",role:"TRAINER",home:"GYM_VE",work:"GYM_VE",x:7,y:6,awareness:65}
  ]
};
;
const npcDayPlan=[
  {start:0,end:360,activity:"SLEEP",target:"home"},
  {start:360,end:540,activity:"COMMUTE",target:"work"},
  {start:540,end:1020,activity:"WORK",target:"work"},
  {start:1020,end:1140,activity:"SOCIAL",target:"social"},
  {start:1140,end:1320,activity:"COMMUTE",target:"home"},
  {start:1320,end:1440,activity:"SLEEP",target:"home"}
];
;
/* Extended city authoring: buildings, interiors, transit, landmarks and travel graph. */
const interiors={
  ROOM_HOME:{name:"HOME",rooms:["MAIN","BEDROOM","BATHROOM"],actions:["SLEEP","REST","PHONE","INVENTORY"]},
  SHOP:{name:"SHOP",rooms:["FRONT","STOCK"],actions:["BUY","TALK","LEAVE"]},
  CAFE:{name:"CAFE",rooms:["DINING","COUNTER"],actions:["EAT","SOCIAL","TALK","LEAVE"]},
  SIGNAL_ROOM:{name:"SIGNAL ROOM",rooms:["ENTRY","ARCHIVE","TERMINAL"],actions:["INVESTIGATE","LISTEN","TRACE","LEAVE"]},
  STUDIO:{name:"STUDIO",rooms:["CONTROL","RECORDING","LOUNGE"],actions:["RECORD","LISTEN","SOCIAL","LEAVE"]},
  CLUB:{name:"CLUB",rooms:["FLOOR","BAR","BACK"],actions:["SOCIAL","DANCE","TALK","LEAVE"]},
  GYM:{name:"GYM",rooms:["FLOOR","LOCKER"],actions:["TRAIN","REST","LEAVE"]},
  APARTMENT:{name:"APARTMENT",rooms:["ENTRY","LIVING","BEDROOM"],actions:["REST","SLEEP","PHONE","LEAVE"]},
  CLINIC:{name:"CLINIC",rooms:["WAITING","TREATMENT"],actions:["HEAL","TALK","LEAVE"]},
  OFFICE:{name:"OFFICE",rooms:["LOBBY","WORKSPACE"],actions:["WORK","TALK","LEAVE"]},
  VENUE:{name:"VENUE",rooms:["ENTRY","MAIN","BACK"],actions:["SOCIAL","LISTEN","LEAVE"]},
  ARCHIVE:{name:"ARCHIVE",rooms:["FOYER","STACKS","RECORDS"],actions:["INVESTIGATE","READ","LEAVE"]}
};
const world_buildings={
  "PARC-EXTENSION":[
    {id:"HOME_01",name:"HOME",landmark:"HOME_LANE",type:"RESIDENTIAL",access:"OWNED",interior:"ROOM_HOME"},
    {id:"SHOP_01",name:"CORNER SHOP",landmark:"JEAN_TALON_STRIP",type:"SHOP",access:"PUBLIC",interior:"SHOP"},
    {id:"CAFE_01",name:"CAFE",landmark:"JEAN_TALON_STRIP",type:"FOOD",access:"PUBLIC",interior:"CAFE"},
    {id:"SIGNAL_01",name:"SIGNAL ROOM",landmark:"SIGNAL_LANE",type:"INVESTIGATION",access:"DISCOVERED",interior:"SIGNAL_ROOM"}
  ],
  "MILE END":[
    {id:"CAFE_ME",name:"CAFE",landmark:"SAINT_VIATEUR",type:"FOOD",access:"PUBLIC",interior:"CAFE"},
    {id:"STUDIO_ME",name:"STUDIO",landmark:"SAINT_VIATEUR",type:"MUSIC",access:"EARNED",interior:"STUDIO"},
    {id:"SHOP_ME",name:"SHOP",landmark:"SAINT_VIATEUR",type:"SHOP",access:"PUBLIC",interior:"SHOP"}
  ],
  "PLATEAU":[
    {id:"SHOP_PL",name:"SHOP",landmark:"SAINT_DENIS",type:"SHOP",access:"PUBLIC",interior:"SHOP"},
    {id:"CLUB_PL",name:"CLUB",landmark:"MONT_ROYAL",type:"SOCIAL",access:"PUBLIC",interior:"CLUB"},
    {id:"GYM_PL",name:"GYM",landmark:"SHERBROOKE",type:"TRAINING",access:"PUBLIC",interior:"GYM"}
  ],
  "ROSEMONT":[
    {id:"SHOP_RO",name:"SHOP",landmark:"BEAUBIEN",type:"SHOP",access:"PUBLIC",interior:"SHOP"},
    {id:"APARTMENT_RO",name:"APARTMENT",landmark:"IBERVILLE",type:"RESIDENTIAL",access:"LOCKED",interior:"APARTMENT"},
    {id:"CLINIC_RO",name:"CLINIC",landmark:"JEAN_TALON",type:"HEALTH",access:"PUBLIC",interior:"CLINIC"}
  ],
  "DOWNTOWN":[
    {id:"OFFICE_DT",name:"OFFICE",landmark:"MCGILL",type:"WORK",access:"EARNED",interior:"OFFICE"},
    {id:"SHOP_DT",name:"SHOP",landmark:"PEEL",type:"SHOP",access:"PUBLIC",interior:"SHOP"},
    {id:"VENUE_DT",name:"VENUE",landmark:"GUY_CONCORDIA",type:"ENTERTAINMENT",access:"PUBLIC",interior:"VENUE"}
  ],
  "OLD MONTREAL":[
    {id:"ARCHIVE_OM",name:"ARCHIVE",landmark:"PLACE_DARMES",type:"HISTORY",access:"DISCOVERED",interior:"ARCHIVE"},
    {id:"VENUE_OM",name:"VENUE",landmark:"OLD_PORT",type:"ENTERTAINMENT",access:"PUBLIC",interior:"VENUE"}
  ],
  "SAINT-HENRI":[
    {id:"CAFE_SH",name:"CAFE",landmark:"NOTRE_DAME",type:"FOOD",access:"PUBLIC",interior:"CAFE"},
    {id:"CLINIC_SH",name:"CLINIC",landmark:"VENDOME",type:"HEALTH",access:"PUBLIC",interior:"CLINIC"},
    {id:"STUDIO_SH",name:"STUDIO",landmark:"NOTRE_DAME",type:"MUSIC",access:"EARNED",interior:"STUDIO"}
  ],
  "VERDUN":[
    {id:"SHOP_VE",name:"SHOP",landmark:"WELLINGTON",type:"SHOP",access:"PUBLIC",interior:"SHOP"},
    {id:"GYM_VE",name:"GYM",landmark:"WELLINGTON",type:"TRAINING",access:"PUBLIC",interior:"GYM"},
    {id:"APARTMENT_VE",name:"APARTMENT",landmark:"VERDUN_METRO",type:"RESIDENTIAL",access:"LOCKED",interior:"APARTMENT"}
  ]
};
const secondaryBuildings={"PARC-EXTENSION":[{id:"LAUNDROMAT_PE",name:"LAUNDROMAT",landmark:"DUROCHER",type:"SERVICE",access:"PUBLIC",interior:"SHOP"}],"MILE END":[{id:"REHEARSAL_ME",name:"REHEARSAL ROOM",landmark:"SAINT_VIATEUR",type:"MUSIC",access:"PUBLIC",interior:"STUDIO"}],"PLATEAU":[{id:"BOOKSHOP_PL",name:"BOOKSHOP",landmark:"SAINT_DENIS",type:"SHOP",access:"PUBLIC",interior:"SHOP"}],"ROSEMONT":[{id:"DINER_RO",name:"DINER",landmark:"BEAUBIEN",type:"FOOD",access:"PUBLIC",interior:"CAFE"}],"DOWNTOWN":[{id:"APARTMENT_DT",name:"APARTMENT",landmark:"SAINT_DENIS",type:"RESIDENTIAL",access:"LOCKED",interior:"APARTMENT"}],"OLD MONTREAL":[{id:"WORKSHOP_OM",name:"WORKSHOP",landmark:"OLD_PORT",type:"SERVICE",access:"PUBLIC",interior:"SHOP"}],"SAINT-HENRI":[{id:"LAUNDROMAT_SH",name:"LAUNDROMAT",landmark:"NOTRE_DAME",type:"SERVICE",access:"PUBLIC",interior:"SHOP"}],"VERDUN":[{id:"DINER_VE",name:"DINER",landmark:"WELLINGTON",type:"FOOD",access:"PUBLIC",interior:"CAFE"}]};Object.keys(secondaryBuildings).forEach(d=>{world_buildings[d]=(world_buildings[d]||[]).concat(secondaryBuildings[d]);});
/* CANONICAL SECURITY CONTEXT
 * Security metadata belongs to the authored city model; the 3D layer only renders/observes it.
 */
const building_security={
 "SHOP_01":{cameras:2,coverage:10,alertDelay:1800},
 "SHOP_ME":{cameras:2,coverage:9,alertDelay:1800},
 "SHOP_PL":{cameras:2,coverage:10,alertDelay:1600},
 "SHOP_RO":{cameras:2,coverage:10,alertDelay:1600},
 "SHOP_DT":{cameras:3,coverage:12,alertDelay:1400},
 "SHOP_VE":{cameras:2,coverage:10,alertDelay:1800},
 "BOOKSHOP_PL":{cameras:2,coverage:9,alertDelay:2000},
 "WORKSHOP_OM":{cameras:2,coverage:10,alertDelay:1900},
 "LAUNDROMAT_PE":{cameras:1,coverage:8,alertDelay:2200},
 "LAUNDROMAT_SH":{cameras:1,coverage:8,alertDelay:2200}
};
const world_landmarks={"PARC-EXTENSION":[{id:"PARC_METRO",name:"PARC METRO",node:"PARC",type:"TRANSIT"},{id:"JEAN_TALON_STRIP",name:"JEAN-TALON STRIP",node:"JEAN_TALON",type:"COMMERCE"},{id:"HOME_LANE",name:"HOME LANE",node:"HOME",type:"RESIDENTIAL"},{id:"SIGNAL_LANE",name:"SIGNAL LANE",node:"ACADIE",type:"INVESTIGATION"}],"MILE END":[{id:"LAURIER_METRO",name:"LAURIER METRO",node:"LAURIER",type:"TRANSIT"},{id:"SAINT_VIATEUR",name:"SAINT-VIATEUR",node:"SAINT_VIATEUR",type:"COMMERCE"},{id:"MONT_ROYAL_METRO",name:"MONT-ROYAL METRO",node:"MONT_ROYAL",type:"TRANSIT"}],"PLATEAU":[{id:"SAINT_DENIS",name:"SAINT-DENIS",node:"SAINT_DENIS",type:"COMMERCE"},{id:"MONT_ROYAL",name:"MONT-ROYAL",node:"MONT_ROYAL",type:"SOCIAL"},{id:"SHERBROOKE",name:"SHERBROOKE",node:"SHERBROOKE",type:"TRANSIT"}],"ROSEMONT":[{id:"BEAUBIEN",name:"BEAUBIEN",node:"BEAUBIEN",type:"COMMERCE"},{id:"IBERVILLE",name:"IBERVILLE",node:"IBERVILLE",type:"RESIDENTIAL"},{id:"JEAN_TALON",name:"JEAN-TALON",node:"JEAN_TALON",type:"TRANSIT"}],"DOWNTOWN":[{id:"BERRI_UQAM",name:"BERRI-UQAM",node:"BERRI_UQAM",type:"TRANSIT"},{id:"MCGILL",name:"MCGILL",node:"MCGILL",type:"WORK"},{id:"PEEL",name:"PEEL",node:"PEEL",type:"COMMERCE"},{id:"GUY_CONCORDIA",name:"GUY-CONCORDIA",node:"GUY_CONCORDIA",type:"ENTERTAINMENT"}],"OLD MONTREAL":[{id:"CHAMP_DE_MARS",name:"CHAMP-DE-MARS",node:"CHAMP_DE_MARS",type:"TRANSIT"},{id:"PLACE_DARMES",name:"PLACE-D'ARMES",node:"PLACE_DARMES",type:"HISTORY"},{id:"OLD_PORT",name:"OLD PORT",node:"OLD_PORT",type:"ENTERTAINMENT"}],"SAINT-HENRI":[{id:"SAINT_HENRI",name:"SAINT-HENRI",node:"SAINT_HENRI",type:"TRANSIT"},{id:"NOTRE_DAME",name:"NOTRE-DAME",node:"NOTRE_DAME",type:"COMMERCE"},{id:"VENDOME",name:"VENDÔME",node:"VENDOME",type:"HEALTH"}],"VERDUN":[{id:"DE_LEGLISE",name:"DE L'ÉGLISE",node:"DE_LEGLISE",type:"TRANSIT"},{id:"WELLINGTON",name:"WELLINGTON",node:"WELLINGTON",type:"COMMERCE"},{id:"VERDUN_METRO",name:"VERDUN METRO",node:"VERDUN",type:"TRANSIT"}]};
const city_backbone={
  "PARC-EXTENSION":["PARC","ACADIE"],
  "MILE END":["LAURIER","MONT_ROYAL"],
  "PLATEAU":["LAURIER","MONT_ROYAL","SHERBROOKE"],
  "ROSEMONT":["ROSEMONT","BEAUBIEN","JEAN_TALON"],
  "DOWNTOWN":["BERRI_UQAM","MCGILL","PEEL","GUY_CONCORDIA"],
  "OLD MONTREAL":["CHAMP_DE_MARS","PLACE_DARMES"],
  "SAINT-HENRI":["SAINT_HENRI","PLACE_SAINT_HENRI","VENDOME"],
  "VERDUN":["DE_LEGLISE","VERDUN"]
};
const city_connections=[
  ["PARC-EXTENSION","MILE END","ACADIE","LAURIER","BLUE"],
  ["MILE END","PLATEAU","LAURIER","LAURIER","ORANGE"],
  ["MILE END","ROSEMONT","MONT_ROYAL","ROSEMONT","ORANGE"],
  ["PLATEAU","DOWNTOWN","SHERBROOKE","BERRI_UQAM","ORANGE"],
  ["ROSEMONT","DOWNTOWN","JEAN_TALON","BERRI_UQAM","ORANGE"],
  ["DOWNTOWN","OLD MONTREAL","BERRI_UQAM","CHAMP_DE_MARS","ORANGE"],
  ["DOWNTOWN","SAINT-HENRI","GUY_CONCORDIA","SAINT_HENRI","ORANGE"],
  ["DOWNTOWN","VERDUN","BERRI_UQAM","DE_LEGLISE","GREEN"]
];
const public_transit={
  "PARC-EXTENSION":{metro:["Parc","Acadie"],bus:["51","80"],lines:["BLUE","ORANGE"],baseFare:3.75},
  "PLATEAU":{metro:["Mont-Royal","Sherbrooke","Laurier"],bus:["11","14","55"],lines:["ORANGE"],baseFare:3.75},
  "DOWNTOWN":{metro:["Berri-UQAM","McGill","Guy-Concordia","Peel"],bus:["24","105","55"],lines:["GREEN","ORANGE","YELLOW"],baseFare:3.75},
  "OLD MONTREAL":{metro:["Champ-de-Mars","Place-d'Armes"],bus:["55","715"],lines:["ORANGE"],baseFare:3.75},
  "SAINT-HENRI":{metro:["Saint-Henri","Place-Saint-Henri","Vendôme"],bus:["35","90"],lines:["ORANGE"],baseFare:3.75},
  "VERDUN":{metro:["De l'Église","Verdun"],bus:["37","58"],lines:["GREEN"],baseFare:3.75},
  "ROSEMONT":{metro:["Rosemont","Beaubien","Jean-Talon"],bus:["18","197"],lines:["ORANGE"],baseFare:3.75},
  "MILE END":{metro:["Laurier","Rosemont","Mont-Royal"],bus:["51","55"],lines:["ORANGE","BLUE"],baseFare:3.75}
};
const districts={
 "PARC-EXTENSION":{spawn:{x:2,y:7}},
 "MILE END":{spawn:{x:4,y:5}},
 "PLATEAU":{spawn:{x:3,y:5}},
 "ROSEMONT":{spawn:{x:4,y:5}},
 "DOWNTOWN":{spawn:{x:4,y:7}},
 "OLD MONTREAL":{spawn:{x:5,y:5}},
 "SAINT-HENRI":{spawn:{x:4,y:6}},
 "VERDUN":{spawn:{x:5,y:5}}
};
/* CANONICAL DENSITY EXPANSION
 * Authored population/building additions live here so the runtime remains behavior-only.
 */
const densityNPCs={
 "PARC-EXTENSION":[
  {id:"resident_pe_02",role:"RESIDENT",home:"HOME_01",work:"CAFE_01",x:3,y:7,awareness:45},
  {id:"barista_pe_01",role:"BARISTA",home:"HOME_01",work:"CAFE_01",x:5,y:6,awareness:58},
  {id:"worker_pe_01",role:"WORKER",home:"HOME_01",work:"SHOP_01",x:6,y:5,awareness:50}
 ],
 "MILE END":[
  {id:"resident_me_01",role:"RESIDENT",home:"CAFE_ME",work:"SHOP_ME",x:4,y:5,awareness:48},
  {id:"shopkeeper_me_01",role:"SHOPKEEPER",home:"STUDIO_ME",work:"SHOP_ME",x:7,y:5,awareness:62},
  {id:"resident_me_02",role:"RESIDENT",home:"STUDIO_ME",work:"CAFE_ME",x:9,y:5,awareness:52}
 ],
 "PLATEAU":[
  {id:"resident_pl_01",role:"RESIDENT",home:"CLUB_PL",work:"SHOP_PL",x:4,y:5,awareness:48},
  {id:"shopkeeper_pl_01",role:"SHOPKEEPER",home:"CLUB_PL",work:"SHOP_PL",x:6,y:6,awareness:60},
  {id:"musician_pl_01",role:"MUSICIAN",home:"CLUB_PL",work:"CLUB_PL",x:8,y:6,awareness:68}
 ],
 "ROSEMONT":[
  {id:"resident_ro_01",role:"RESIDENT",home:"APARTMENT_RO",work:"SHOP_RO",x:6,y:6,awareness:48},
  {id:"vendor_ro_01",role:"VENDOR",home:"APARTMENT_RO",work:"SHOP_RO",x:9,y:5,awareness:55},
  {id:"worker_ro_01",role:"WORKER",home:"APARTMENT_RO",work:"CLINIC_RO",x:10,y:4,awareness:52}
 ],
 "DOWNTOWN":[
  {id:"resident_dt_01",role:"RESIDENT",home:"VENUE_DT",work:"SHOP_DT",x:6,y:7,awareness:48},
  {id:"vendor_dt_01",role:"VENDOR",home:"VENUE_DT",work:"SHOP_DT",x:9,y:6,awareness:60},
  {id:"musician_dt_01",role:"MUSICIAN",home:"VENUE_DT",work:"VENUE_DT",x:11,y:7,awareness:68}
 ],
 "OLD MONTREAL":[
  {id:"resident_om_01",role:"RESIDENT",home:"VENUE_OM",work:"VENUE_OM",x:7,y:6,awareness:45},
  {id:"vendor_om_02",role:"VENDOR",home:"VENUE_OM",work:"VENUE_OM",x:10,y:7,awareness:58},
  {id:"worker_om_01",role:"WORKER",home:"ARCHIVE_OM",work:"ARCHIVE_OM",x:8,y:6,awareness:64}
 ],
 "SAINT-HENRI":[
  {id:"resident_sh_01",role:"RESIDENT",home:"CAFE_SH",work:"STUDIO_SH",x:5,y:6,awareness:48},
  {id:"musician_sh_01",role:"MUSICIAN",home:"STUDIO_SH",work:"STUDIO_SH",x:9,y:5,awareness:68},
  {id:"vendor_sh_01",role:"VENDOR",home:"CAFE_SH",work:"CAFE_SH",x:7,y:5,awareness:54}
 ],
 "VERDUN":[
  {id:"resident_ve_01",role:"RESIDENT",home:"APARTMENT_VE",work:"SHOP_VE",x:5,y:6,awareness:48},
  {id:"worker_ve_01",role:"WORKER",home:"APARTMENT_VE",work:"SHOP_VE",x:8,y:6,awareness:52},
  {id:"vendor_ve_01",role:"VENDOR",home:"APARTMENT_VE",work:"GYM_VE",x:10,y:5,awareness:58}
 ]
};
Object.keys(densityNPCs).forEach(d=>{
  npcPopulations[d]=(npcPopulations[d]||[]).concat(densityNPCs[d]);
});

Object.assign(window.ESCIE_WORLD_CITY,{landmarks:world_landmarks,buildings:world_buildings,interiors,buildingSecurity:building_security,cityBackbone:city_backbone,cityConnections:city_connections,publicTransit:public_transit,districts});


})();
