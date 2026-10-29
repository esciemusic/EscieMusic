(()=>{"use strict";const K="escie_world_simulation_v1",D={money:40,neighbourhood:"PARC-EXTENSION",hunger:82,energy:78,health:100,stress:12,social:35,reputation:0,status:"UNKNOWN",path:"UNDEFINED",transport:"FOOT",season:"AUTUMN",weather:"COLD",day:1,hour:12,minute:0,wanted:0,legal_status:"CLEAR",sentence_minutes:0,damage:0,sleep:0,drug_effect:0,alcohol_effect:0,position:{x:2,y:7},access:[],skills:{fitness:0,skate:0,parkour:0},jobs:[],clubs:[],events:[],relationships:{},inventory:[],property:[],graffiti:[],dreams:[],choice_history:[],npc_memory:{},jobs_history:[],financial_history:[],health_history:[],surveillance:[],transport_history:[],access_history:[]};const read=()=>{try{return Object.assign({},D,JSON.parse(localStorage.getItem(K)||"{}"))}catch(e){return Object.assign({},D)}};const save=s=>{try{localStorage.setItem(K,JSON.stringify(s))}catch(e){}return s};const clamp=n=>Math.max(0,Math.min(100,n));const change=d=>{const s=read();for(const k in d)if(typeof s[k]=="number")s[k]+=d[k];s.money=Math.max(0,Math.round(s.money));["hunger","energy","health","stress","social"].forEach(k=>s[k]=clamp(s[k]));s.wanted=Math.max(0,Math.round(s.wanted));save(s);return s};const advance=m=>{const s=read();s.minute+=m;while(s.minute>=60){s.minute-=60;s.hour++}while(s.hour>=24){s.hour-=24;s.day++}s.hunger=clamp(s.hunger-m/180);s.energy=clamp(s.energy-m/240);if(s.sentence_minutes>0){s.sentence_minutes=Math.max(0,s.sentence_minutes-m);if(!s.sentence_minutes)s.legal_status="CLEAR"}s.season=["WINTER","SPRING","SUMMER","AUTUMN"][Math.floor(((s.day-1)%360)/90)];s.weather=s.season=="WINTER"?"SNOW/COLD":s.season=="SUMMER"?"WARM":s.season=="SPRING"?"RAIN/COOL":"COLD";return save(s)};const setPosition=(x,y)=>{const s=read();s.position={x:Number(x)||0,y:Number(y)||0};return save(s)};const transport=m=>{if(["FOOT","RUN","PARKOUR","SKATEBOARD","ROLLERBLADES","BIKE","BUS","METRO","CAR"].includes(m)){const s=read();s.transport=m;s.transport_history=(s.transport_history||[]).concat([{mode:m,day:s.day,hour:s.hour}]).slice(-100);if(m=="RUN")s.energy=clamp(s.energy-2);if(m=="PARKOUR")s.energy=clamp(s.energy-3);if(m=="SKATEBOARD"||m=="ROLLERBLADES"||m=="BIKE")s.energy=clamp(s.energy-1);save(s);dispatchEvent(new CustomEvent("escie-transport",{detail:{mode:m}}))}return read()};const choice=(id,answer,e={})=>{const s=change(e);s.choice_history=(s.choice_history||[]).concat([{id,answer,day:s.day,hour:s.hour}]).slice(-100);return save(s)};const access=(id,r={})=>{const s=read();if(r.money&&s.money<r.money||r.reputation&&s.reputation<r.reputation||r.status&&s.status!=r.status||r.access&&!s.access.includes(r.access)||r.time&&(s.hour<r.time[0]||s.hour>=r.time[1]))return false;if(r.skills)for(const k in r.skills)if((s.skills[k]||0)<r.skills[k])return false;return true};const train=(skill,a=5)=>{const s=read();s.skills[skill]=Math.min(100,(s.skills[skill]||0)+a);s.energy=clamp(s.energy-5);s.hunger=clamp(s.hunger-3);return save(s)};const witnessed=(source,level=1)=>{const s=read();s.wanted=Math.max(s.wanted,Math.max(1,Number(level)||1));s.legal_status="WANTED";s.surveillance=(s.surveillance||[]).concat([{type:"WITNESSED_"+source,level:s.wanted,day:s.day,hour:s.hour}]).slice(-100);return save(s)};const graffiti=(tag,loc,seen=false)=>{const s=read();s.graffiti.push({tag,location:loc,day:s.day});s.reputation++;if(seen)witnessed("GRAFFITI",2);return save(s)};const steal=(id,seen=false)=>{const s=read();s.inventory.push(id);s.stress=clamp(s.stress+5);s.choice_history.push({id:"steal:"+id,answer:"STEAL",day:s.day});save(s);if(seen)witnessed("THEFT",8);return read()};const dream=t=>{const s=read();if(!(s.damage>=40||s.sleep>=80||s.drug_effect>0||s.alcohol_effect>0))return false;s.dreams.push({trigger:t,day:s.day});save(s);dispatchEvent(new CustomEvent("escie-dream",{detail:{trigger:t}}));return true};const serve=m=>{const s=read();s.sentence_minutes=Math.min(1440,s.sentence_minutes+Math.max(1,m));s.legal_status="SENTENCED";s.events=(s.events||[]).concat([{type:"SENTENCE",minutes:m,day:s.day}]).slice(-100);return save(s)};const use=(k)=>{const s=read();s.events=(s.events||[]).concat([{type:k=="drug"?"SUBSTANCE_DRUG":"SUBSTANCE_ALCOHOL",day:s.day,hour:s.hour}]).slice(-100);if(k=="drug")s.drug_effect=Math.min(100,s.drug_effect+35);if(k=="alcohol")s.alcohol_effect=Math.min(100,s.alcohol_effect+25);s.stress=clamp(s.stress-8);save(s);dream(k);return s};const dreamLevel=(scenario)=>{const s=read();const d=typeof scenario==="string"?scenario:(scenario?.id||"LOCATION_BLEED");const levels={WATCHED:{rule:"VISIBILITY",threat:"SURVEILLANCE",exit:"HIDE"},OBJECT_MEMORY:{rule:"MEMORY",threat:"OBJECT",exit:"LEAVE"},PRESSURE:{rule:"PSYCHOLOGY",threat:"STRESS",exit:"WAKE"},LOCATION_BLEED:{rule:"DISTORTION",threat:"UNKNOWN",exit:"FIND_EXIT"}};const l=levels[d]||levels.LOCATION_BLEED;return {id:d,rule:l.rule,threat:l.threat,exit:l.exit,context:dreamContext()};};
const DREAM_LOCATIONS={
 "PARC-EXTENSION":{id:"PARC-EXTENSION-DREAM",label:"PARC-EXTENSION · AFTER HOURS",distortion:"STREETS REPEAT THEMSELVES"},
 "PLATEAU":{id:"PLATEAU-DREAM",label:"PLATEAU · NO EXIT",distortion:"EVERY DOOR LEADS BACK"},
 "DOWNTOWN":{id:"DOWNTOWN-DREAM",label:"DOWNTOWN · EMPTY CITY",distortion:"THE CITY IS STILL MOVING"},
 DEFAULT:{id:"UNKNOWN-DREAM",label:"UNKNOWN ADDRESS",distortion:"THE MAP DOES NOT MATCH"}
};
const buildDreamLevel=(director)=>{const d=director||DREAM_DIRECTOR.choose(read());const loc=DREAM_LOCATIONS[d.location]||DREAM_LOCATIONS.DEFAULT;return {scenario:d,location:loc,objective:d.id==="WATCHED"?"HIDE":d.id==="OBJECT_MEMORY"?"FIND THE OBJECT":d.id==="PRESSURE"?"WAKE":"FIND THE EXIT",active:true};};
const DREAM_DIRECTOR={
 version:1,
 choose:(s)=>{const cues=[];if(Number(s.wanted)>=8)cues.push("WATCHED");if(Number(s.stress)>=60)cues.push("PRESSURE");if((s.inventory||[]).length)cues.push("OBJECT_MEMORY");if(s.neighbourhood)cues.push("LOCATION_BLEED");const id=cues[0]||"LOCATION_BLEED";return {id,title:{WATCHED:"SOMEONE IS WATCHING",PRESSURE:"THE CITY IS TOO QUIET",OBJECT_MEMORY:"THE OBJECT REMEMBERS",LOCATION_BLEED:"THE LOCATION BLEEDS"}[id],cues,location:s.neighbourhood||"PARC-EXTENSION",seed:[s.day,s.hour,s.stress,s.wanted,(s.inventory||[]).length].join("-")}}
};
const dreamScenarioPool=()=>[
{id:"WATCHED",title:"SOMEONE IS WATCHING",trigger:"SURVEILLANCE"},
{id:"OBJECT_MEMORY",title:"THE OBJECT REMEMBERS",trigger:"OBJECT"},
{id:"PRESSURE",title:"THE CITY IS TOO QUIET",trigger:"STRESS"},
{id:"LOCATION_BLEED",title:"THE LOCATION BLEEDS",trigger:"LOCATION"}
];
const dreamScenario=()=>{const cues=dreamSceneContext();const has=x=>cues.some(v=>v.startsWith(x));if(has("SURVEILLANCE"))return {id:"WATCHED",title:"SOMEONE IS WATCHING",cues};if(has("OBJECT:"))return {id:"OBJECT_MEMORY",title:"THE OBJECT REMEMBERS",cues};if(has("STRESS"))return {id:"PRESSURE",title:"THE CITY IS TOO QUIET",cues};return {id:"LOCATION_BLEED",title:"THE LOCATION BLEEDS",cues}};
const dreamSceneContext=()=>{const x=dreamContext();const cues=[];if(x.neighbourhood)cues.push("LOCATION:"+x.neighbourhood);if(x.stress>=60)cues.push("STRESS");if(x.wanted>=8)cues.push("SURVEILLANCE");if(x.inventory.length)cues.push("OBJECT:"+x.inventory[0]);return cues};
const dreamContext=()=>{const s=read();return {neighbourhood:s.neighbourhood||"PARC-EXTENSION",stress:Number(s.stress||0),health:Number(s.health||100),wanted:Number(s.wanted||0),path:s.path||"UNDEFINED",transport:s.transport||"FOOT",relationships:s.relationships||{},inventory:(s.inventory||[]).slice(0,12),dreams:(s.dreams||[]).slice(0,5)}};
const DREAM_STATES={
  NIGHTMARE:{id:"NIGHTMARE",title:"NIGHT SIGNAL",intensity:1,causes:["DAMAGE","SLEEP","DRUG_EFFECT","ALCOHOL_EFFECT","STRESS"],horror:true},
  MEMORY:{id:"MEMORY",title:"MEMORY BLEED",intensity:1,causes:["SLEEP","STRESS"],horror:false},
  DISTORTION:{id:"DISTORTION",title:"SIGNAL DISTORTION",intensity:2,causes:["DRUG_EFFECT","ALCOHOL_EFFECT","STRESS"],horror:true}
};
const evaluateDream=(s)=>{const reasons=[];if(Number(s.damage)>=35)reasons.push("DAMAGE");if(Number(s.sleep)>=70)reasons.push("SLEEP");if(Number(s.drug_effect)>0)reasons.push("DRUG_EFFECT");if(Number(s.alcohol_effect)>0)reasons.push("ALCOHOL_EFFECT");if(Number(s.stress)>=70)reasons.push("STRESS");if(!reasons.length)return null;const nightmare=reasons.includes("DAMAGE")||reasons.includes("STRESS")||reasons.includes("DRUG_EFFECT");return nightmare?DREAM_STATES.NIGHTMARE:DREAM_STATES.MEMORY};
const enterDream=(type)=>{const s=read(),d=DREAM_STATES[type]||DREAM_STATES.NIGHTMARE;s.dreams=s.dreams||[];const event={type:d.id,title:d.title,reasons:evaluateDream(s)?.causes||[],day:s.day,hour:s.hour,intensity:d.intensity,horror:!!d.horror};s.dreams.unshift(event);s.dream=s.dreams.slice(0,25);s.sleep=0;s.drug_effect=Math.max(0,Number(s.drug_effect)-1);s.alcohol_effect=Math.max(0,Number(s.alcohol_effect)-1);save(s);return event};
const WORLD_STREETS={
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
const nearestStreetNode=(neighbourhood,position)=>{
  const nodes=WORLD_STREETS[String(neighbourhood||"").toUpperCase()]||[];
  if(!nodes.length)return null;
  const p=position||{x:2,y:7};
  return nodes.reduce((best,n)=>{
    const d=Math.abs(Number(p.x)-n.x)+Math.abs(Number(p.y)-n.y);
    return !best||d<best.distance?Object.assign({},n,{distance:d}):best
  },null)
};
const STREET_EDGES={
  "PARC-EXTENSION":[["HOME","DUROCHER"],["DUROCHER","HUTCHISON"],["HUTCHISON","PARC"],["PARC","JEAN_TALON"],["JEAN_TALON","BEAUMONT"],["BEAUMONT","ACADIE"],["ACADIE","OGILVY"]],
  "MILE END":[["LAURIER","SAINT_VIATEUR"],["SAINT_VIATEUR","MONT_ROYAL"],["MONT_ROYAL","SAINT_URBAIN"],["SAINT_URBAIN","ROSEMONT"]],
  "PLATEAU":[["LAURIER","SAINT_DENIS"],["SAINT_DENIS","MONT_ROYAL"],["MONT_ROYAL","SAINT_LAURENT"],["SAINT_LAURENT","SHERBROOKE"]],
  "ROSEMONT":[["ROSEMONT","BEAUBIEN"],["BEAUBIEN","IBERVILLE"],["IBERVILLE","JEAN_TALON"]],
  "DOWNTOWN":[["BERRI_UQAM","SAINT_DENIS"],["SAINT_DENIS","MCGILL"],["MCGILL","PEEL"],["PEEL","GUY_CONCORDIA"]],
  "OLD MONTREAL":[["CHAMP_DE_MARS","PLACE_DARMES"],["PLACE_DARMES","OLD_PORT"]],
  "SAINT-HENRI":[["SAINT_HENRI","PLACE_SAINT_HENRI"],["PLACE_SAINT_HENRI","NOTRE_DAME"],["NOTRE_DAME","VENDOME"]],
  "VERDUN":[["DE_LEGLISE","WELLINGTON"],["WELLINGTON","VERDUN"]]
};
const streetGraph=(neighbourhood)=>{
  const d=String(neighbourhood||"").toUpperCase();
  return {neighbourhood:d,nodes:WORLD_STREETS[d]||[],edges:STREET_EDGES[d]||[]};
};
const streetPath=(neighbourhood,fromId,toId)=>{
  const g=streetGraph(neighbourhood),adj={};g.nodes.forEach(n=>adj[n.id]=[]);
  g.edges.forEach(e=>{const a=e[0],b=e[1];if(adj[a]&&adj[b]){adj[a].push(b);adj[b].push(a)}});
  if(!adj[fromId]||!adj[toId])return null;
  const q=[[fromId]],seen=new Set([fromId]);
  while(q.length){const path=q.shift(),cur=path[path.length-1];if(cur===toId)return path;
    for(const next of adj[cur])if(!seen.has(next)){seen.add(next);q.push(path.concat(next))}}
  return null;
};
const NPC_POPULATIONS={
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
const NPC_DAY_PLAN=[
  {start:0,end:420,activity:"SLEEP",target:"home"},
  {start:420,end:540,activity:"COMMUTE",target:"work"},
  {start:540,end:1020,activity:"WORK",target:"work"},
  {start:1020,end:1140,activity:"SOCIAL",target:"social"},
  {start:1140,end:1320,activity:"COMMUTE",target:"home"},
  {start:1320,end:1440,activity:"SLEEP",target:"home"}
];
const npcPopulation=(district)=>NPC_POPULATIONS[String(district||"").toUpperCase()]||[];
const npcHomeTarget=(n)=>{const b=findBuilding(String(n.district||"").toUpperCase(),n.home);return b?findLandmark(n.district,b.landmark):null};
const npcWorkTarget=(n)=>{const b=findBuilding(String(n.district||"").toUpperCase(),n.work);return b?findLandmark(n.district,b.landmark):null};
const npcSpawn=(n)=>{const t=n.x!=null?{x:n.x,y:n.y}:npcHomeTarget(n)||{x:2,y:7};return {x:t.x,y:t.y}};
const seedDistrictNPCs=(district)=>{
  const d=String(district||"").toUpperCase(),pop=npcPopulation(d),api=window.ESCIE_WORLD_NPC;
  if(!api?.registerNPC)return [];
  return pop.map(n=>{const existing=api.state?.().npcs?.[n.id];const x=existing?.x??n.x,y=existing?.y??n.y;
    return api.registerNPC(Object.assign({},n,{district:d,x,y,schedule:NPC_DAY_PLAN.map(p=>Object.assign({},p,{target:p.target==="home"?npcSpawn(Object.assign({},n,{district:d,x:n.x,y:n.y})):npcWorkTarget(Object.assign({},n,{district:d}))||{x:n.x,y:n.y}}))}))
  });
};
const seedWorldNPCs=()=>Object.keys(NPC_POPULATIONS).flatMap(seedDistrictNPCs);
const WORLD_BUILDINGS={
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
const INTERIORS={
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
const districtBuildings=(neighbourhood)=>{const d=String(neighbourhood||"").toUpperCase();return (WORLD_BUILDINGS[d]||[]).map(x=>Object.assign({},x,{district:d}))};
const findBuilding=(neighbourhood,id)=>districtBuildings(neighbourhood).find(x=>x.id===id)||null;
const enterBuilding=(neighbourhood,id)=>{
  const b=findBuilding(neighbourhood,id);if(!b)return {ok:false,reason:"BUILDING_NOT_FOUND"};
  const s=read(),a=String(b.access||"PUBLIC");
  if(a==="LOCKED"&&!((s.property||[]).includes(b.id)))return {ok:false,reason:"LOCKED"};
  if(a==="EARNED"&&!((s.access||[]).includes(b.id)))return {ok:false,reason:"ACCESS_REQUIRED"};
  if(a==="DISCOVERED"&&!((s.access||[]).includes(b.id)))return {ok:false,reason:"DISCOVERY_REQUIRED"};
  s.access=s.access||[];if(!s.access.includes(b.id))s.access.push(b.id);
  s.access_history=(s.access_history||[]).concat([{type:"BUILDING_ENTER",building:b.id,district:b.district,day:s.day,hour:s.hour}]).slice(-200);save(s);
  return {ok:true,building:b,interior:INTERIORS[b.interior]||null,state:read()};
};
const WORLD_LANDMARKS={"PARC-EXTENSION":[{id:"PARC_METRO",name:"PARC METRO",node:"PARC",type:"TRANSIT"},{id:"JEAN_TALON_STRIP",name:"JEAN-TALON STRIP",node:"JEAN_TALON",type:"COMMERCE"},{id:"HOME_LANE",name:"HOME LANE",node:"HOME",type:"RESIDENTIAL"},{id:"SIGNAL_LANE",name:"SIGNAL LANE",node:"ACADIE",type:"INVESTIGATION"}],"MILE END":[{id:"LAURIER_METRO",name:"LAURIER METRO",node:"LAURIER",type:"TRANSIT"},{id:"SAINT_VIATEUR",name:"SAINT-VIATEUR",node:"SAINT_VIATEUR",type:"COMMERCE"},{id:"MONT_ROYAL_METRO",name:"MONT-ROYAL METRO",node:"MONT_ROYAL",type:"TRANSIT"}],"PLATEAU":[{id:"SAINT_DENIS",name:"SAINT-DENIS",node:"SAINT_DENIS",type:"COMMERCE"},{id:"MONT_ROYAL",name:"MONT-ROYAL",node:"MONT_ROYAL",type:"SOCIAL"},{id:"SHERBROOKE",name:"SHERBROOKE",node:"SHERBROOKE",type:"TRANSIT"}],"ROSEMONT":[{id:"BEAUBIEN",name:"BEAUBIEN",node:"BEAUBIEN",type:"COMMERCE"},{id:"IBERVILLE",name:"IBERVILLE",node:"IBERVILLE",type:"RESIDENTIAL"},{id:"JEAN_TALON",name:"JEAN-TALON",node:"JEAN_TALON",type:"TRANSIT"}],"DOWNTOWN":[{id:"BERRI_UQAM",name:"BERRI-UQAM",node:"BERRI_UQAM",type:"TRANSIT"},{id:"MCGILL",name:"MCGILL",node:"MCGILL",type:"WORK"},{id:"PEEL",name:"PEEL",node:"PEEL",type:"COMMERCE"},{id:"GUY_CONCORDIA",name:"GUY-CONCORDIA",node:"GUY_CONCORDIA",type:"ENTERTAINMENT"}],"OLD MONTREAL":[{id:"CHAMP_DE_MARS",name:"CHAMP-DE-MARS",node:"CHAMP_DE_MARS",type:"TRANSIT"},{id:"PLACE_DARMES",name:"PLACE-D'ARMES",node:"PLACE_DARMES",type:"HISTORY"},{id:"OLD_PORT",name:"OLD PORT",node:"OLD_PORT",type:"ENTERTAINMENT"}],"SAINT-HENRI":[{id:"SAINT_HENRI",name:"SAINT-HENRI",node:"SAINT_HENRI",type:"TRANSIT"},{id:"NOTRE_DAME",name:"NOTRE-DAME",node:"NOTRE_DAME",type:"COMMERCE"},{id:"VENDOME",name:"VENDÔME",node:"VENDOME",type:"HEALTH"}],"VERDUN":[{id:"DE_LEGLISE",name:"DE L'ÉGLISE",node:"DE_LEGLISE",type:"TRANSIT"},{id:"WELLINGTON",name:"WELLINGTON",node:"WELLINGTON",type:"COMMERCE"},{id:"VERDUN_METRO",name:"VERDUN METRO",node:"VERDUN",type:"TRANSIT"}]};
const districtLandmarks=(neighbourhood)=>{const d=String(neighbourhood||"").toUpperCase();return (WORLD_LANDMARKS[d]||[]).map(x=>Object.assign({},x,{district:d}))};
const findLandmark=(neighbourhood,id)=>districtLandmarks(neighbourhood).find(x=>x.id===String(id||"").toUpperCase()||x.id===id)||null;
const CITY_BACKBONE={
  "PARC-EXTENSION":["PARC","ACADIE"],
  "MILE END":["LAURIER","MONT_ROYAL"],
  "PLATEAU":["LAURIER","MONT_ROYAL","SHERBROOKE"],
  "ROSEMONT":["ROSEMONT","BEAUBIEN","JEAN_TALON"],
  "DOWNTOWN":["BERRI_UQAM","MCGILL","PEEL","GUY_CONCORDIA"],
  "OLD MONTREAL":["CHAMP_DE_MARS","PLACE_DARMES"],
  "SAINT-HENRI":["SAINT_HENRI","PLACE_SAINT_HENRI","VENDOME"],
  "VERDUN":["DE_LEGLISE","VERDUN"]
};
const CITY_CONNECTIONS=[
  ["PARC-EXTENSION","MILE END","ACADIE","LAURIER","BLUE"],
  ["MILE END","PLATEAU","LAURIER","LAURIER","ORANGE"],
  ["MILE END","ROSEMONT","MONT_ROYAL","ROSEMONT","ORANGE"],
  ["PLATEAU","DOWNTOWN","SHERBROOKE","BERRI_UQAM","ORANGE"],
  ["ROSEMONT","DOWNTOWN","JEAN_TALON","BERRI_UQAM","ORANGE"],
  ["DOWNTOWN","OLD MONTREAL","BERRI_UQAM","CHAMP_DE_MARS","ORANGE"],
  ["DOWNTOWN","SAINT-HENRI","GUY_CONCORDIA","SAINT_HENRI","ORANGE"],
  ["DOWNTOWN","VERDUN","BERRI_UQAM","DE_LEGLISE","GREEN"]
];
const cityRoute=(fromDistrict,toDistrict)=>{
  const a=String(fromDistrict||"").toUpperCase(),b=String(toDistrict||"").toUpperCase();
  if(!CITY_BACKBONE[a]||!CITY_BACKBONE[b])return null;
  if(a===b)return {districts:[a],connections:[]};
  const adj={};Object.keys(CITY_BACKBONE).forEach(d=>adj[d]=[]);
  CITY_CONNECTIONS.forEach(e=>{adj[e[0]].push({to:e[1],edge:e});adj[e[1]].push({to:e[0],edge:e})});
  const q=[[a]],seen=new Set([a]);
  while(q.length){const path=q.shift(),cur=path[path.length-1];if(cur===b){
    const connections=[];for(let n=1;n<path.length;n++){const e=CITY_CONNECTIONS.find(x=>(x[0]===path[n-1]&&x[1]===path[n])||(x[1]===path[n-1]&&x[0]===path[n]));if(e)connections.push({from:e[0],to:e[1],from_node:e[2],to_node:e[3],line:e[4]})}
    return {districts:path,connections};
  }for(const next of adj[cur])if(!seen.has(next.to)){seen.add(next.to);q.push(path.concat(next.to))}}
  return null;
};
const cityNavigate=(destination,opts={})=>{
  const s=read(),from=String(s.neighbourhood||"PARC-EXTENSION").toUpperCase(),to=String(destination||"").toUpperCase();
  const route=cityRoute(from,to);if(!route)return {ok:false,reason:"CITY_ROUTE_UNAVAILABLE"};
  if(from===to)return {ok:false,reason:"ALREADY_THERE",route};
  const mode=String(opts.mode||"METRO").toUpperCase();
  if(!["METRO","BUS"].includes(mode))return {ok:false,reason:"INTERDISTRICT_REQUIRES_TRANSIT"};
  const result=publicTransit(mode,to,{cityRoute:route});if(!result?.ok)return result;
  const d=district(to);if(d){s.position=Object.assign({},d.spawn);s.neighbourhood=to;save(s)}
  return Object.assign({},result,{city_route:route,city_mode:mode});
};
const PUBLIC_TRANSIT={
  "PARC-EXTENSION":{metro:["Parc","Acadie"],bus:["51","80"],lines:["BLUE","ORANGE"],baseFare:3.75},
  "PLATEAU":{metro:["Mont-Royal","Sherbrooke","Laurier"],bus:["11","14","55"],lines:["ORANGE"],baseFare:3.75},
  "DOWNTOWN":{metro:["Berri-UQAM","McGill","Guy-Concordia","Peel"],bus:["24","105","55"],lines:["GREEN","ORANGE","YELLOW"],baseFare:3.75},
  "OLD MONTREAL":{metro:["Champ-de-Mars","Place-d'Armes"],bus:["55","715"],lines:["ORANGE"],baseFare:3.75},
  "SAINT-HENRI":{metro:["Saint-Henri","Place-Saint-Henri","Vendôme"],bus:["35","90"],lines:["ORANGE"],baseFare:3.75},
  "VERDUN":{metro:["De l'Église","Verdun"],bus:["37","58"],lines:["GREEN"],baseFare:3.75},
  "ROSEMONT":{metro:["Rosemont","Beaubien","Jean-Talon"],bus:["18","197"],lines:["ORANGE"],baseFare:3.75},
  "MILE END":{metro:["Laurier","Rosemont","Mont-Royal"],bus:["51","55"],lines:["ORANGE","BLUE"],baseFare:3.75}
};
const transitService=(s,mode)=>{
  const h=Number(s.hour)+Number(s.minute||0)/60;
  if(mode==="METRO") return h>=5.25 && h<25;
  return true;
};
const publicTransit=(mode,destination,opts={})=>{const s=read(),m=String(mode||"METRO").toUpperCase(),d=String(destination||"").toUpperCase(),dest=PUBLIC_TRANSIT[d];if(!dest||!["BUS","METRO"].includes(m))return {ok:false,reason:"ROUTE_UNAVAILABLE"};if(!transitService(s,m))return {ok:false,reason:"SERVICE_CLOSED",mode:m};const current=String(s.neighbourhood||"PARC-EXTENSION").toUpperCase();if(current===d)return {ok:false,reason:"ALREADY_THERE"};const zones=Math.max(1,Math.min(3,Math.ceil(Math.abs(d.charCodeAt(0)-current.charCodeAt(0))/6)));const minutes=m==="METRO"?Math.max(5,8+zones*4):Math.max(8,12+zones*6);const fare=dest.baseFare; if(s.money<fare)return {ok:false,reason:"INSUFFICIENT_FUNDS",fare};s.money=Math.max(0,s.money-fare);s.neighbourhood=d;s.position=Object.assign({},CITY_DISTRICTS[d]?.spawn||s.position);s.transport=m;s.transport_history=(s.transport_history||[]).concat([{mode:m,destination:d,minutes,fare,day:s.day,hour:s.hour}]).slice(-100);s.financial_history=(s.financial_history||[]).concat([{type:"EXPENSE",amount:fare,reason:m+" FARE",day:s.day}]).slice(-100);const skipped=opts.skip!==false;s.events=(s.events||[]).concat([{type:"TRANSIT",mode:m,destination:d,minutes,skipped,day:s.day,hour:s.hour}]).slice(-100);save(s);advance(minutes);return {ok:true,mode:m,destination:d,minutes,fare,skipped,stations:dest.metro,bus:dest.bus,lines:dest.lines,state:read()}};
const routePlan=(destination,mode="METRO",opts={})=>{const s=read(),d=String(destination||"").toUpperCase(),m=String(mode||"METRO").toUpperCase(),current=String(s.neighbourhood||"PARC-EXTENSION").toUpperCase();if(current===d)return {ok:false,reason:"ALREADY_THERE"};if(!PUBLIC_TRANSIT[d])return {ok:false,reason:"ROUTE_UNAVAILABLE"};if(!["METRO","BUS"].includes(m))return {ok:false,reason:"ROUTE_UNAVAILABLE"};const from=s.position&&String(s.neighbourhood||"PARC-EXTENSION").toUpperCase()===current?s.position:(CITY_DISTRICTS[current]?.spawn||s.position||{x:2,y:7});const currentNode=nearestStreetNode(current,from);const targetNodes=WORLD_STREETS[d]||[];const candidates=targetNodes.filter(n=>m==="METRO"?n.type==="METRO":true);const targetNode=(candidates.length?candidates:targetNodes)[0]||null;const to=targetNode||CITY_DISTRICTS[d]?.spawn||{x:8,y:6};const distance=Math.abs(Number(from.x)-Number(to.x))+Math.abs(Number(from.y)-Number(to.y));const stationWalk=currentNode?currentNode.distance:distance;const walked=Math.max(2,Math.min(15,Number(opts.walkMinutes??Math.ceil(stationWalk/2)+1)));const dest=PUBLIC_TRANSIT[d];const service=transitService(s,m);const zones=Math.max(1,Math.min(3,Math.ceil(Math.max(1,distance)/4)));const minutes=m==="METRO"?Math.max(5,8+zones*4):Math.max(8,12+zones*6);const fare=dest.baseFare;return {ok:service&&s.money>=fare,reason:!service?"SERVICE_CLOSED":s.money<fare?"INSUFFICIENT_FUNDS":null,mode:m,destination:d,walking_minutes:walked,minutes,total_minutes:walked+minutes,fare,lines:dest.lines,stations:dest.metro,bus:dest.bus,distance,from_node:currentNode?.id||null,from_node_label:currentNode?.label||null,to_node:targetNode?.id||null,to_node_label:targetNode?.label||null,to_station:targetNode?.station||null,street_distance:distance};};const navigate=(destination,mode="METRO",opts={})=>{const plan=routePlan(destination,mode,opts);if(!plan.ok)return plan;advance(plan.walking_minutes);const route=publicTransit(plan.mode,plan.destination,{skip:true});if(!route.ok)return Object.assign(route,{walking_minutes:plan.walking_minutes});return Object.assign(route,{walking_minutes:plan.walking_minutes,total_minutes:plan.walking_minutes+route.minutes,distance:plan.distance,segments:[{mode:"FOOT",minutes:plan.walking_minutes,destination:"TRANSIT STOP"},{mode:plan.mode,minutes:route.minutes,destination:plan.destination}]});};const job=(id,pay=25)=>{const s=read();s.jobs=s.jobs||[];if(!s.jobs.includes(id))s.jobs.push(id);s.money+=Math.max(0,pay);s.energy=clamp(s.energy-5);s.hunger=clamp(s.hunger-3);s.jobs_history=(s.jobs_history||[]).concat([{id,pay,day:s.day}]).slice(-100);s.financial_history=(s.financial_history||[]).concat([{type:"INCOME",amount:pay,source:id,day:s.day}]).slice(-100);return save(s)};const activity=(type,opts={})=>{const s=read(),t={EAT:15,SLEEP:480,REST:60,WORK:120,SOCIAL:60,TRAIN:60}[String(type||"").toUpperCase()]||30;if(type==="EAT"){const cost=Number(opts.cost??8);if(s.money<cost)return {ok:false,reason:"INSUFFICIENT_FUNDS"};s.money-=cost;s.hunger=clamp(s.hunger+30);s.stress=clamp(s.stress-4);s.financial_history=(s.financial_history||[]).concat([{type:"EXPENSE",amount:cost,reason:"FOOD",day:s.day}]).slice(-100)}else if(type==="SLEEP"){s.sleep=0;s.energy=clamp(s.energy+55);s.stress=clamp(s.stress-15);s.health=clamp(s.health+5)}else if(type==="REST"){s.energy=clamp(s.energy+18);s.stress=clamp(s.stress-6)}else if(type==="SOCIAL"){s.social=clamp(s.social+12);s.stress=clamp(s.stress-5)}else if(type==="WORK"){const pay=Number(opts.pay??25);s.money+=Math.max(0,pay);s.energy=clamp(s.energy-12);s.hunger=clamp(s.hunger-8);s.stress=clamp(s.stress+4);s.jobs_history=(s.jobs_history||[]).concat([{id:opts.id||"SHIFT",pay,day:s.day}]).slice(-100);s.financial_history=(s.financial_history||[]).concat([{type:"INCOME",amount:pay,source:opts.id||"SHIFT",day:s.day}]).slice(-100);if(s.status==="UNKNOWN")s.status="WORKING";if(s.path==="UNDEFINED")s.path="WORK"}else if(type==="TRAIN"){s.energy=clamp(s.energy-8);s.hunger=clamp(s.hunger-5);s.skills[opts.skill||"fitness"]=Math.min(100,(s.skills[opts.skill||"fitness"]||0)+Number(opts.amount||5));if(s.path==="UNDEFINED")s.path="DISCIPLINE"}s.events=(s.events||[]).concat([{type:"ACTIVITY",activity:String(type),day:s.day,hour:s.hour}]).slice(-100);save(s);advance(t);return {ok:true,state:read(),minutes:t}};
const financialNotice=(type,amount,reason)=>{try{window.dispatchEvent(new CustomEvent("escie:financial-event",{detail:{type,amount,reason}}))}catch(e){}};const spend=(amount,reason)=>{const s=read();amount=Math.max(0,Number(amount)||0);if(s.money<amount)return false;s.money-=amount;s.financial_history=(s.financial_history||[]).concat([{type:"EXPENSE",amount,reason,day:s.day}]).slice(-100);const out=save(s);financialNotice("EXPENSE",amount,reason);return out};const npcMemory=(id,data={})=>{const s=read();s.npc_memory=s.npc_memory||{};s.npc_memory[id]=Object.assign({},s.npc_memory[id]||{},data,{last_day:s.day});return save(s)};const decayWanted=(m=1)=>{const s=read();if(s.sentence_minutes>0)return s;if(s.wanted>0){s.wanted=Math.max(0,s.wanted-Math.max(0,Number(m)||0));if(!s.wanted)s.legal_status="CLEAR"}return save(s)};const markSurveillance=(type,level=1)=>witnessed(type,level);const detect=(source,level=1)=>{const s=read();s.surveillance=(s.surveillance||[]).concat([{type:"DETECTION",source,level,day:s.day,hour:s.hour}]).slice(-100);save(s);return witnessed(source,level)};const clearWanted=()=>{const s=read();if(s.sentence_minutes>0)return s;s.wanted=0;s.legal_status="CLEAR";return save(s)};window.ESCIE_WORLD_SIMULATION={state:read,change,advance,setTransport:transport,setPosition,movePlayer,publicTransit,cityRoute,cityNavigate,routePlan,navigate,transitRoutes:PUBLIC_TRANSIT,transitService,districts:CITY_DISTRICTS,streetNodes:WORLD_STREETS,streetEdges:STREET_EDGES,streetGraph,nearestStreetNode,streetPath,landmarks:WORLD_LANDMARKS,districtLandmarks,findLandmark,buildings:WORLD_BUILDINGS,interiors:INTERIORS,districtBuildings,findBuilding,enterBuilding,npcPopulations:NPC_POPULATIONS,npcDayPlan:NPC_DAY_PLAN,seedDistrictNPCs,seedWorldNPCs,district,activateDistrict,activity,choice,canAccess:access,train,graffiti,steal,dream,enterDream,evaluateDream,dreamContext,dreamSceneContext,dreamScenario,dreamScenarioPool,dreamDirector:DREAM_DIRECTOR,buildDreamLevel,dreamLevel,serve,useSubstance:use,job,spend,npcMemory,decayWanted,markSurveillance,witnessed,detect,clearWanted};if(!localStorage.getItem(K))save(D)})();