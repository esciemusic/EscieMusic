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
window.ESCIE_WORLD_CITY={streetNodes,streetEdges,streetRealism,npcPopulations,npcDayPlan};
})();
