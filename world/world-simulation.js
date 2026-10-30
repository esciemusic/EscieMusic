(()=>{"use strict";const K="escie_world_simulation_v1",D={money:40, stamina:100,neighbourhood:"PARC-EXTENSION",hunger:82,energy:78,health:100,stress:12,social:35,reputation:0,status:"UNKNOWN",path:"UNDEFINED",transport:"FOOT",season:"AUTUMN",weather:"COLD",day:1,hour:12,minute:0,wanted:0,legal_status:"CLEAR",sentence_minutes:0,damage:0,sleep:0,drug_effect:0,alcohol_effect:0,position:{x:2,y:7},access:[],skills:{fitness:0,skate:0,parkour:0},jobs:[],clubs:[],events:[],relationships:{},inventory:[],property:[],graffiti:[],dreams:[],choice_history:[],npc_memory:{},jobs_history:[],financial_history:[],health_history:[],surveillance:[],transport_history:[],access_history:[]};let cache=null,dirty=false,lastPersist=0;const clone=s=>JSON.parse(JSON.stringify(s));const read=()=>{if(cache)return clone(cache);try{cache=Object.assign({},D,JSON.parse(localStorage.getItem(K)||"{}"))}catch(e){cache=Object.assign({},D)}return clone(cache)};const persist=s=>{try{const raw=JSON.stringify(s);localStorage.setItem(K,raw);if(localStorage.getItem(K)!==raw)throw new Error("SAVE_VERIFY_FAILED:"+K);dirty=false;lastPersist=Date.now();return s}catch(e){try{window.dispatchEvent(new CustomEvent("escie:storage-error",{detail:{key:K,error:String(e?.message||e)}}))}catch(_e){}return s}};const save=s=>{cache=clone(s);dirty=false;return persist(cache)};const markDirty=s=>{cache=clone(s);dirty=true;return cache};const flush=()=>dirty?persist(cache):cache||read();const clamp=n=>Math.max(0,Math.min(100,n));const change=d=>{const s=read();for(const k in d)if(typeof s[k]=="number")s[k]+=d[k];s.money=Math.max(0,Math.round(s.money));["hunger","energy","health","stress","social"].forEach(k=>s[k]=clamp(s[k]));s.wanted=Math.max(0,Math.round(s.wanted));if(!save(s))return null;return s};const advance=m=>{const s=read(),minutes=Math.max(0,Number(m)||0);s.minute+=minutes;while(s.minute>=60){s.minute-=60;s.hour++}while(s.hour>=24){s.hour-=24;s.day++}s.hunger=clamp(s.hunger-minutes/180);s.energy=clamp(s.energy-minutes/240);if(s.sentence_minutes>0){s.sentence_minutes=Math.max(0,s.sentence_minutes-minutes);if(!s.sentence_minutes)s.legal_status="CLEAR"}s.season=["WINTER","SPRING","SUMMER","AUTUMN"][Math.floor(((s.day-1)%360)/90)];s.weather=s.season=="WINTER"?"SNOW/COLD":s.season=="SUMMER"?"WARM":s.season=="SPRING"?"RAIN/COOL":"COLD";if(Array.isArray(s.pending_reports)&&s.pending_reports.length){const nowTotal=(Number(s.day||1)*1440)+(Number(s.hour||0)*60)+Number(s.minute||0);s.pending_reports=s.pending_reports.filter(r=>{if(Number(r.reportAt||Infinity)>nowTotal)return true;try{window.ESCIE_WORLD_LAW?.reportCrime?.(r.source||"SECURITY REPORT",Number(r.level||1))}catch(e){}s.surveillance=(s.surveillance||[]).concat([{type:"REPORTED",source:r.source||"SECURITY",target:r.target||null,day:s.day,hour:s.hour}]).slice(-100);return false});}markDirty(s);if(Date.now()-lastPersist>=30000)flush();return read()};const setPosition=(x,y)=>{const s=read();s.position={x:Number(x)||0,y:Number(y)||0};return save(s)};const transport=m=>{if(["FOOT","RUN","PARKOUR","SKATEBOARD","ROLLERBLADES","BIKE","BUS","METRO","CAR"].includes(m)){const s=read();s.transport=m;s.transport_history=(s.transport_history||[]).concat([{mode:m,day:s.day,hour:s.hour}]).slice(-100);if(m=="RUN")s.energy=clamp(s.energy-2);if(m=="PARKOUR")s.energy=clamp(s.energy-3);if(m=="SKATEBOARD"||m=="ROLLERBLADES"||m=="BIKE")s.energy=clamp(s.energy-1);if(!save(s))return null;dispatchEvent(new CustomEvent("escie-transport",{detail:{mode:m}}))}return read()};const choice=(id,answer,e={})=>{const s=change(e);if(!s)return null;s.choice_history=(s.choice_history||[]).concat([{id,answer,day:s.day,hour:s.hour}]).slice(-100);return save(s)};const access=(id,r={})=>{const s=read();if(r.money&&s.money<r.money||r.reputation&&s.reputation<r.reputation||r.status&&s.status!=r.status||r.access&&!s.access.includes(r.access)||r.time&&(s.hour<r.time[0]||s.hour>=r.time[1]))return false;if(r.skills)for(const k in r.skills)if((s.skills[k]||0)<r.skills[k])return false;return true};const train=(skill,a=5)=>{const s=read();s.skills[skill]=Math.min(100,(s.skills[skill]||0)+a);s.energy=clamp(s.energy-5);s.hunger=clamp(s.hunger-3);return save(s)};const commitCrime=(type="THEFT",opts={})=>{
 const s=read(),crime=String(type||"THEFT").toUpperCase();
 const table={THEFT:{wanted:2,stress:5,pay:10},VEHICLE_THEFT:{wanted:3,stress:8,pay:0},ROBBERY:{wanted:4,stress:10,pay:35},BURGLARY:{wanted:4,stress:9,pay:25},ASSAULT:{wanted:4,stress:12,pay:0},VANDALISM:{wanted:2,stress:6,pay:0},TRESPASS:{wanted:1,stress:3,pay:0}};
 const rule=table[crime]||table.THEFT,baseRisk=Math.max(0,Number(opts.risk??1)),witnessedNow=opts.witnessed===true||baseRisk>=2;
 s.stress=clamp(Number(s.stress||0)+rule.stress);
 s.crime_history=(s.crime_history||[]).concat([{type:crime,target:opts.target||null,witnessed:witnessedNow,day:s.day,hour:s.hour,neighbourhood:s.neighbourhood}]).slice(-100);
 s.events=(s.events||[]).concat([{type:"CRIME",crime,target:opts.target||null,witnessed:witnessedNow,day:s.day,hour:s.hour}]).slice(-200);const security=window.ESCIE_WORLD_CITY?.buildingSecurity?.[String(opts.target||"")];if(security&&["BURGLARY","ROBBERY","THEFT","VANDALISM"].includes(crime)){const total=(Number(s.day||1)*1440)+(Number(s.hour||0)*60)+Number(s.minute||0);s.pending_reports=(s.pending_reports||[]).concat([{source:"SECURITY CAMERA · "+String(opts.target),target:opts.target||null,level:Math.max(1,Math.min(3,Math.ceil(Number(security.cameras||1)/2))),reportAt:total+Math.max(1,Math.round(Number(security.alertDelay||1800)/60))}]).slice(-50);s.surveillance=(s.surveillance||[]).concat([{type:"CAMERA_CAPTURE",building:opts.target,day:s.day,hour:s.hour}]).slice(-100);}
 if(!save(s))return {ok:false,reason:"SAVE_FAILED"};
 if(witnessedNow)witnessed(crime,Math.max(1,rule.wanted+Math.max(0,Math.floor(baseRisk-2))));
 return {ok:true,crime,wanted:witnessedNow?read().wanted:Number(read().wanted||0),witnessed:witnessedNow,reward:rule.pay,state:read()};
};
const witnessed=(source,level=1)=>{const s=read();s.wanted=Math.max(s.wanted,Math.max(1,Number(level)||1));s.legal_status="WANTED";s.surveillance=(s.surveillance||[]).concat([{type:"WITNESSED_"+source,level:s.wanted,day:s.day,hour:s.hour}]).slice(-100);const out=save(s);if(!out)return null;try{window.dispatchEvent(new CustomEvent("escie:world-detection",{detail:{source,level:s.wanted}}))}catch(e){}return out};const graffiti=(tag,loc,seen=false)=>{const s=read();s.graffiti.push({tag,location:loc,day:s.day});s.reputation++;if(!save(s))return null;if(seen&&!witnessed("GRAFFITI",2))return null;return read()};const steal=(id,seen=false)=>{const s=read();s.inventory.push(id);s.stress=clamp(s.stress+5);s.choice_history.push({id:"steal:"+id,answer:"STEAL",day:s.day});if(!save(s))return null;if(seen)witnessed("THEFT",8);return read()};const dream=t=>{const s=read();if(!(s.damage>=40||s.sleep>=80||s.drug_effect>0||s.alcohol_effect>0))return false;s.dreams.push({trigger:t,day:s.day});if(!save(s))return false;dispatchEvent(new CustomEvent("escie-dream",{detail:{trigger:t}}));return true};const serve=m=>{const s=read();s.sentence_minutes=Math.min(1440,s.sentence_minutes+Math.max(1,m));s.legal_status="SENTENCED";s.events=(s.events||[]).concat([{type:"SENTENCE",minutes:m,day:s.day}]).slice(-100);return save(s)};const use=(k)=>{const s=read();s.events=(s.events||[]).concat([{type:k=="drug"?"SUBSTANCE_DRUG":"SUBSTANCE_ALCOHOL",day:s.day,hour:s.hour}]).slice(-100);if(k=="drug")s.drug_effect=Math.min(100,s.drug_effect+35);if(k=="alcohol")s.alcohol_effect=Math.min(100,s.alcohol_effect+25);s.stress=clamp(s.stress-8);if(!save(s))return null;dream(k);return s};const dreamLevel=(scenario)=>{const s=read();const d=typeof scenario==="string"?scenario:(scenario?.id||"LOCATION_BLEED");const levels={WATCHED:{rule:"VISIBILITY",threat:"SURVEILLANCE",exit:"HIDE"},OBJECT_MEMORY:{rule:"MEMORY",threat:"OBJECT",exit:"LEAVE"},PRESSURE:{rule:"PSYCHOLOGY",threat:"STRESS",exit:"WAKE"},LOCATION_BLEED:{rule:"DISTORTION",threat:"UNKNOWN",exit:"FIND_EXIT"}};const l=levels[d]||levels.LOCATION_BLEED;return {id:d,rule:l.rule,threat:l.threat,exit:l.exit,context:dreamContext()};};
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
const enterDream=(type)=>{const s=read(),d=DREAM_STATES[type]||DREAM_STATES.NIGHTMARE;s.dreams=s.dreams||[];const event={type:d.id,title:d.title,reasons:evaluateDream(s)?.causes||[],day:s.day,hour:s.hour,intensity:d.intensity,horror:!!d.horror};s.dreams.unshift(event);s.dream=s.dreams.slice(0,25);s.sleep=0;s.drug_effect=Math.max(0,Number(s.drug_effect)-1);s.alcohol_effect=Math.max(0,Number(s.alcohol_effect)-1);if(!save(s))return null;return event};
const CITY=window.ESCIE_WORLD_CITY||{};
const WORLD_STREETS=CITY.streetNodes||{};
const STREET_REALISM=CITY.streetRealism||{};
const STREET_EDGES=CITY.streetEdges||{};
const NPC_POPULATIONS=CITY.npcPopulations||{};
const NPC_DAY_PLAN=CITY.npcDayPlan||[];
const WORLD_BUILDINGS=CITY.buildings||{};
const INTERIORS=CITY.interiors||{};
const CITY_REFERENCE=window.ESCIE_CITY_REFERENCE||{};
const WORLD_LANDMARKS=CITY.landmarks||{};
const CITY_BACKBONE=CITY.cityBackbone||{};
const CITY_CONNECTIONS=CITY.cityConnections||[];
const PUBLIC_TRANSIT=CITY.publicTransit||{};
const CITY_DISTRICTS=CITY.districts||{};

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
const npcPopulation=(district)=>NPC_POPULATIONS[String(district||"").toUpperCase()]||[];
const npcHomeTarget=(n)=>{const b=findBuilding(String(n.district||"").toUpperCase(),n.home);return b?findLandmark(n.district,b.landmark):null};
const npcWorkTarget=(n)=>{const b=findBuilding(String(n.district||"").toUpperCase(),n.work);return b?findLandmark(n.district,b.landmark):null};
const npcSpawn=(n)=>{const t=npcHomeTarget(n)||{x:n.x??2,y:n.y??7};return {x:t.x,y:t.y}};
const seedDistrictNPCs=(district)=>{
  const d=String(district||"").toUpperCase(),pop=npcPopulation(d),api=window.ESCIE_WORLD_NPC;
  if(!api?.registerNPC)return [];
  return pop.map(n=>{const existing=api.state?.().npcs?.[n.id];const x=existing?.x??n.x,y=existing?.y??n.y;
    return api.registerNPC(Object.assign({},n,{district:d,x,y,schedule:NPC_DAY_PLAN.map(p=>Object.assign({},p,{target:p.target==="home"?npcSpawn(Object.assign({},n,{district:d})):npcWorkTarget(Object.assign({},n,{district:d}))||{x:n.x,y:n.y}}))}))
  });
};
const seedWorldNPCs=()=>Object.keys(NPC_POPULATIONS).flatMap(seedDistrictNPCs);
const NPC_SOCIAL_RULES={FRIENDLY:{delta:3,reason:"friendly interaction"},HOSTILE:{delta:-5,reason:"hostile interaction"},OBSERVANT:{delta:1,reason:"noticed player"},CAUTIOUS:{delta:0,reason:"cautious interaction"}};
const npcInteraction=(npcId,type="TALK",opts={})=>{const api=window.ESCIE_WORLD_NPC;if(!api)return {ok:false,reason:"NPC_SYSTEM_UNAVAILABLE"};const n=api.state?.().npcs?.[npcId];if(!n)return {ok:false,reason:"NPC_NOT_FOUND"};const sim=window.ESCIE_WORLD_SIMULATION,s=sim?.state?.()||{},reaction=api.reaction(npcId,{status:s.status,wanted:s.wanted});const rule=NPC_SOCIAL_RULES[reaction]||NPC_SOCIAL_RULES.OBSERVANT;let delta=rule.delta;if(type==="HELP")delta+=2;if(type==="INSULT")delta-=8;if(type==="THREATEN")delta-=15;if(type==="GIFT")delta+=6;if(s.wanted>=8&&type!=="HELP")delta-=4;const relationship=api.relationship(npcId,delta,type+" · "+rule.reason);api.rememberInteraction(npcId,{type,relationship,day:s.day});return {ok:true,npc:n,reaction,delta,relationship};};

const NPC_JOB_OFFERS={SHOPKEEPER:{id:"corner_shift",pay:30,minutes:120,label:"SHOP SHIFT"},BARISTA:{id:"cafe_shift",pay:32,minutes:120,label:"CAFE SHIFT"},MUSICIAN:{id:"studio_session",pay:45,minutes:120,label:"STUDIO SESSION"},WORKER:{id:"day_shift",pay:35,minutes:120,label:"DAY SHIFT"},TRAINER:{id:"training_assist",pay:40,minutes:120,label:"TRAINING ASSIST"},CLINIC_WORKER:{id:"clinic_shift",pay:42,minutes:120,label:"CLINIC SHIFT"},OFFICE_WORKER:{id:"office_shift",pay:45,minutes:120,label:"OFFICE SHIFT"},VENUE_WORKER:{id:"venue_shift",pay:38,minutes:120,label:"VENUE SHIFT"},VENDOR:{id:"vendor_shift",pay:30,minutes:120,label:"VENDOR SHIFT"},ARCHIVIST:{id:"archive_shift",pay:40,minutes:120,label:"ARCHIVE SHIFT"},RESIDENT:{id:"local_task",pay:25,minutes:60,label:"LOCAL TASK"}};
const npcJobOffer=(npcId)=>{const api=window.ESCIE_WORLD_NPC,n=api?.state?.().npcs?.[npcId],sim=window.ESCIE_WORLD_SIMULATION;if(!n||!sim)return {ok:false,reason:"NPC_NOT_FOUND"};const offer=NPC_JOB_OFFERS[n.role]||NPC_JOB_OFFERS.RESIDENT;const s=sim.state();const sameDistrict=String(n.district||"").toUpperCase()===String(s.neighbourhood||"").toUpperCase();if(!sameDistrict)return {ok:false,reason:"WRONG_DISTRICT"};return {ok:true,npcId,role:n.role,offer,relationship:Number(n.relationship||0),available:Number(n.relationship||0)>=-10};};
const NPC_MISSIONS={SHOPKEEPER:{id:"RUN_STOCK",title:"RUN THE STOCK",objective:"Deliver a supply to the local shop.",pay:45,minutes:45,rep:2},BARISTA:{id:"CAFE_DELIVERY",title:"CAFE DELIVERY",objective:"Make a delivery before the rush.",pay:50,minutes:40,rep:2},MUSICIAN:{id:"STUDIO_RUN",title:"STUDIO RUN",objective:"Carry a recording item to the studio.",pay:65,minutes:50,rep:3},TRAINER:{id:"GYM_HELP",title:"GYM HELP",objective:"Help finish a training session.",pay:55,minutes:60,rep:2},OFFICE_WORKER:{id:"OFFICE_RUN",title:"OFFICE RUN",objective:"Deliver documents to the office.",pay:60,minutes:45,rep:2},CLINIC_WORKER:{id:"CLINIC_RUN",title:"CLINIC RUN",objective:"Get supplies to the clinic.",pay:60,minutes:45,rep:3},VENUE_WORKER:{id:"VENUE_RUN",title:"VENUE RUN",objective:"Prepare the venue before opening.",pay:55,minutes:60,rep:2},ARCHIVIST:{id:"ARCHIVE_RUN",title:"ARCHIVE RUN",objective:"Bring a record to the archive.",pay:60,minutes:50,rep:3},RESIDENT:{id:"LOCAL_DELIVERY",title:"LOCAL DELIVERY",objective:"Complete a local delivery.",pay:35,minutes:30,rep:1}};
const CRIME_JOBS={
 BURGLARY:{id:"BURGLARY",title:"NIGHT ENTRY",item:"STOLEN_GOODS",pay:90,wanted:4},
 ROBBERY:{id:"ROBBERY",title:"TAKE THE CASH",item:"TAKEN_CASH",pay:120,wanted:5}
};
const crimeJobOffer=(type="BURGLARY",target=null)=>{
 const s=read(),c=CRIME_JOBS[String(type).toUpperCase()]||CRIME_JOBS.BURGLARY;
 if(s.crime_job)return {ok:false,reason:"CRIME_JOB_ACTIVE",job:s.crime_job};
 return {ok:true,job:Object.assign({},c,{target:target||null})};
};
const crimeJobAccept=(type="BURGLARY",target=null)=>{
 const q=crimeJobOffer(type,target);if(!q.ok)return q;
 const s=read(),c=q.job;
 s.crime_job={id:c.id,title:c.title,item:c.item,pay:c.pay,wanted:c.wanted,target:c.target,step:"PREPARE",prepared:false,taken:false,escaped:false,fenced:false,fenceBuilding:null,started:{day:s.day,hour:s.hour,minute:s.minute}};
 s.events=(s.events||[]).concat([{type:"CRIME_JOB_ACCEPTED",crime:c.id,target:c.target,day:s.day,hour:s.hour}]).slice(-300);
 save(s);return {ok:true,job:s.crime_job};
};
const crimeJobProgress=(step,opts={})=>{
 const s=read(),j=s.crime_job;if(!j)return {ok:false,reason:"NO_CRIME_JOB"};
 const x=String(step||"").toUpperCase(),target=String(opts.target||"").toUpperCase();
 const allowed={
  PREPARE:["PREPARE","EQUIPMENT"],
  ENTER:["ENTER","BURGLARY","ROBBERY"],
  TAKE:["TAKE","LOOT","STEAL"],
  ESCAPE:["ESCAPE","LEAVE"],
  FENCE:["FENCE","SELL"]
 };
 if(!(allowed[j.step]||[]).includes(x))return {ok:false,reason:"WRONG_CRIME_STEP",step:j.step};
 if(j.step==="PREPARE"){j.prepared=true;j.step="ENTER";}
 else if(j.step==="ENTER"){if(j.target&&target&&j.target.toUpperCase()!==target)return {ok:false,reason:"WRONG_TARGET"};j.step="TAKE";}
 else if(j.step==="TAKE"){j.taken=true;s.inventory=s.inventory||[];s.inventory.push(j.item);j.step="ESCAPE";}
 else if(j.step==="ESCAPE"){j.escaped=true;j.step="FENCE";}
 else if(j.step==="FENCE"){if(!j.taken||!j.escaped)return {ok:false,reason:"NOT_READY"};j.fenced=true;s.money+=Number(j.pay||0);s.reputation=Math.max(-100,Number(s.reputation||0)-1);s.inventory=(s.inventory||[]).filter(x=>x!==j.item);s.crime_history=(s.crime_history||[]).concat([{type:j.id,target:j.target,completed:true,day:s.day,hour:s.hour}]).slice(-100);s.events=(s.events||[]).concat([{type:"CRIME_JOB_COMPLETE",crime:j.id,target:j.target,pay:j.pay,day:s.day,hour:s.hour}]).slice(-300);s.crime_job=null;save(s);return {ok:true,complete:true,reward:j.pay};}
 s.events=(s.events||[]).concat([{type:"CRIME_JOB_STEP",crime:j.id,step:j.step,target:j.target,day:s.day,hour:s.hour}]).slice(-300);
 save(s);return {ok:true,job:j};
};
const npcMissionOffer=(npcId)=>{const api=window.ESCIE_WORLD_NPC,n=api?.state?.().npcs?.[npcId],sim=window.ESCIE_WORLD_SIMULATION;if(!n||!sim)return {ok:false,reason:"NPC_NOT_FOUND"};const offer=NPC_MISSIONS[n.role]||NPC_MISSIONS.RESIDENT,s=sim.state();if(String(n.district||"").toUpperCase()!==String(s.neighbourhood||"").toUpperCase())return {ok:false,reason:"WRONG_DISTRICT"};return {ok:true,npcId,offer,active:s.active_mission||null,available:Number(n.relationship||0)>=0&&!s.active_mission};};
const npcMissionAccept=(npcId)=>{const q=npcMissionOffer(npcId);if(!q.ok||!q.available)return Object.assign(q,{reason:q.ok?"MISSION_UNAVAILABLE":q.reason});const s=read();s.active_mission={id:q.offer.id,npcId,title:q.offer.title,objective:q.offer.objective,pay:q.offer.pay,rep:q.offer.rep,progress:0,targetBuilding:n.workplace_id||n.work_building?.id||n.social_place_id||n.social_building?.id||null,targetDistrict:n.district||s.neighbourhood,started:{day:s.day,hour:s.hour,minute:s.minute}};s.events=(s.events||[]).concat([{type:"MISSION_ACCEPTED",mission:q.offer.id,npcId,day:s.day,hour:s.hour}]).slice(-300);save(s);return {ok:true,mission:s.active_mission};};
const npcMissionProgress=(action,target)=>{
 const s=read(),m=s.active_mission;if(!m)return {ok:false,reason:"NO_ACTIVE_MISSION"};
 const a=String(action||"").toUpperCase(),t=String(target||"").toUpperCase(),expected=String(m.id||"").toUpperCase();
 const rules={RUN_STOCK:["SHOP","BUY","DELIVER"],CAFE_DELIVERY:["CAFE","EAT","DELIVER"],STUDIO_RUN:["STUDIO","LISTEN","RECORD","DELIVER"],GYM_HELP:["GYM","TRAIN"],OFFICE_RUN:["OFFICE","WORK","DELIVER"],CLINIC_RUN:["CLINIC","HEAL","DELIVER"],VENUE_RUN:["VENUE","PREPARE","LISTEN"],ARCHIVE_RUN:["ARCHIVE","INVESTIGATE","READ","DELIVER"],LOCAL_DELIVERY:["SHOP","CAFE","VENUE","DELIVER"]};
 const valid=(rules[expected]||[]).includes(a)||t===String(m.targetBuilding||"").toUpperCase();
 if(!valid)return {ok:false,reason:"WRONG_OBJECTIVE",mission:m};
 m.progress=100;m.completed=true;
 s.events=(s.events||[]).concat([{type:"MISSION_OBJECTIVE",mission:m.id,action:a,target,building:m.targetBuilding,day:s.day,hour:s.hour}]).slice(-300);
 save(s);return {ok:true,mission:m};
};
const npcMissionComplete=()=>{const s=read(),m=s.active_mission;if(!m||!m.completed)return {ok:false,reason:"MISSION_NOT_COMPLETE"};s.money+=Number(m.pay||0);s.reputation+=Number(m.rep||0);s.active_mission=null;s.events=(s.events||[]).concat([{type:"MISSION_COMPLETE",mission:m.id,pay:m.pay,day:s.day,hour:s.hour}]).slice(-300);save(s);return {ok:true,reward:{money:m.pay,rep:m.rep}};};
const npcJobAccept=(npcId)=>{const offer=npcJobOffer(npcId);if(!offer.ok||!offer.available)return Object.assign(offer,{reason:offer.ok?"RELATIONSHIP_TOO_LOW":offer.reason});const sim=window.ESCIE_WORLD_SIMULATION,api=window.ESCIE_WORLD_NPC,n=api.state().npcs[npcId];const result=sim.job(offer.offer.id,offer.offer.pay);sim.advance(offer.offer.minutes);api.relationship(npcId,2,"ACCEPTED "+offer.offer.label);api.rememberInteraction(npcId,{type:"JOB",job:offer.offer.id,pay:offer.offer.pay});return {ok:true,offer:offer.offer,state:result};};
const npcFavor=(npcId,type="FAVOR")=>{const api=window.ESCIE_WORLD_NPC,n=api?.state?.().npcs?.[npcId],sim=window.ESCIE_WORLD_SIMULATION;if(!n||!sim)return {ok:false,reason:"NPC_NOT_FOUND"};const s=sim.state(),rel=Number(n.relationship||0);if(rel<10)return {ok:false,reason:"TRUST_REQUIRED",relationship:rel};const reward=type==="FAVOR"?(10+Math.max(0,Math.min(30,Math.floor(rel/5)))):0;sim.change({social:3,stress:-2});if(reward)sim.job("favor:"+npcId,reward);api.relationship(npcId,3,"COMPLETED FAVOR");api.rememberInteraction(npcId,{type:"FAVOR",reward,day:s.day});api.rumor?.(npcId,"player","They came through when I needed help.",1);return {ok:true,reward,relationship:api.state().npcs[npcId]?.relationship||0};};
const districtBuildings=(neighbourhood)=>{const d=String(neighbourhood||"").toUpperCase();return (WORLD_BUILDINGS[d]||[]).map(x=>Object.assign({},x,{district:d}))};
const findBuilding=(neighbourhood,id)=>districtBuildings(neighbourhood).find(x=>x.id===id)||null;
const leaveBuilding=()=>{
  const s=read();if(!s.interior)return {ok:true,state:s};
  const previous=s.interior;s.interior=null;
  s.events=(s.events||[]).concat([{type:"BUILDING_EXIT",building:previous.building_id,day:s.day,hour:s.hour,minute:s.minute}]).slice(-300);
  if(!save(s))return {ok:false,reason:"SAVE_FAILED"};return {ok:true,previous,state:read()};
};
const enterBuilding=(neighbourhood,id)=>{
  const b=findBuilding(neighbourhood,id);if(!b)return {ok:false,reason:"BUILDING_NOT_FOUND"};
  const s=read(),a=String(b.access||"PUBLIC");
  if(a==="LOCKED"&&!((s.property||[]).includes(b.id)))return {ok:false,reason:"LOCKED"};
  if(a==="EARNED"&&!((s.access||[]).includes(b.id)))return {ok:false,reason:"ACCESS_REQUIRED"};
  if(a==="DISCOVERED"&&!((s.access||[]).includes(b.id)))return {ok:false,reason:"DISCOVERY_REQUIRED"};
  s.access=s.access||[];if(!s.access.includes(b.id))s.access.push(b.id); s.interior={building_id:b.id,district:b.district,interior:b.interior,room:(INTERIORS[b.interior]?.rooms||[])[0]||"ENTRY",x:3,y:6,entered_day:s.day,entered_minute:(s.hour*60+s.minute)};
  s.access_history=(s.access_history||[]).concat([{type:"BUILDING_ENTER",building:b.id,district:b.district,day:s.day,hour:s.hour}]).slice(-200);if(!save(s))return {ok:false,reason:"SAVE_FAILED"};
  return {ok:true,building:b,interior:INTERIORS[b.interior]||null,state:read()};
};
const districtLandmarks=(neighbourhood)=>{const d=String(neighbourhood||"").toUpperCase();return (WORLD_LANDMARKS[d]||[]).map(x=>Object.assign({},x,{district:d}))};
const findLandmark=(neighbourhood,id)=>districtLandmarks(neighbourhood).find(x=>x.id===String(id||"").toUpperCase()||x.id===id)||null;
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
  const d=district(to);if(d){s.position=Object.assign({},d.spawn);s.neighbourhood=to;if(!save(s))return Object.assign({},result,{ok:false,reason:"SAVE_FAILED"})}
  return Object.assign({},result,{city_route:route,city_mode:mode});
};
const transitService=(s,mode)=>{
  const h=Number(s.hour)+Number(s.minute||0)/60;
  if(mode==="METRO") return h>=5.25 && h<25;
  return true;
};
const publicTransit=(mode,destination,opts={})=>{const s=read(),m=String(mode||"METRO").toUpperCase(),d=String(destination||"").toUpperCase(),dest=PUBLIC_TRANSIT[d];if(!dest||!["BUS","METRO"].includes(m))return {ok:false,reason:"ROUTE_UNAVAILABLE"};if(!transitService(s,m))return {ok:false,reason:"SERVICE_CLOSED",mode:m};const current=String(s.neighbourhood||"PARC-EXTENSION").toUpperCase();if(current===d)return {ok:false,reason:"ALREADY_THERE"};const zones=Math.max(1,Math.min(3,Math.ceil(Math.abs(d.charCodeAt(0)-current.charCodeAt(0))/6)));const minutes=m==="METRO"?Math.max(5,8+zones*4):Math.max(8,12+zones*6);const fare=dest.baseFare; if(s.money<fare)return {ok:false,reason:"INSUFFICIENT_FUNDS",fare};s.money=Math.max(0,s.money-fare);s.neighbourhood=d;s.position=Object.assign({},CITY_DISTRICTS[d]?.spawn||s.position);s.transport=m;s.transport_history=(s.transport_history||[]).concat([{mode:m,destination:d,minutes,fare,day:s.day,hour:s.hour}]).slice(-100);s.financial_history=(s.financial_history||[]).concat([{type:"EXPENSE",amount:fare,reason:m+" FARE",day:s.day}]).slice(-100);const skipped=opts.skip!==false;s.events=(s.events||[]).concat([{type:"TRANSIT",mode:m,destination:d,minutes,skipped,day:s.day,hour:s.hour}]).slice(-100);if(!save(s))return {ok:false,reason:"SAVE_FAILED"};if(!advance(minutes))return {ok:false,reason:"TIME_SAVE_FAILED"};return {ok:true,mode:m,destination:d,minutes,fare,skipped,stations:dest.metro,bus:dest.bus,lines:dest.lines,state:read()}};
const routePlan=(destination,mode="METRO",opts={})=>{const s=read(),d=String(destination||"").toUpperCase(),m=String(mode||"METRO").toUpperCase(),current=String(s.neighbourhood||"PARC-EXTENSION").toUpperCase();if(current===d)return {ok:false,reason:"ALREADY_THERE"};if(!PUBLIC_TRANSIT[d])return {ok:false,reason:"ROUTE_UNAVAILABLE"};if(!["METRO","BUS"].includes(m))return {ok:false,reason:"ROUTE_UNAVAILABLE"};const from=s.position&&String(s.neighbourhood||"PARC-EXTENSION").toUpperCase()===current?s.position:(CITY_DISTRICTS[current]?.spawn||s.position||{x:2,y:7});const currentNode=nearestStreetNode(current,from);const targetNodes=WORLD_STREETS[d]||[];const candidates=targetNodes.filter(n=>m==="METRO"?n.type==="METRO":true);const targetNode=(candidates.length?candidates:targetNodes)[0]||null;const to=targetNode||CITY_DISTRICTS[d]?.spawn||{x:8,y:6};const distance=Math.abs(Number(from.x)-Number(to.x))+Math.abs(Number(from.y)-Number(to.y));const stationWalk=currentNode?currentNode.distance:distance;const walked=Math.max(2,Math.min(15,Number(opts.walkMinutes??Math.ceil(stationWalk/2)+1)));const dest=PUBLIC_TRANSIT[d];const service=transitService(s,m);const zones=Math.max(1,Math.min(3,Math.ceil(Math.max(1,distance)/4)));const minutes=m==="METRO"?Math.max(5,8+zones*4):Math.max(8,12+zones*6);const fare=dest.baseFare;return {ok:service&&s.money>=fare,reason:!service?"SERVICE_CLOSED":s.money<fare?"INSUFFICIENT_FUNDS":null,mode:m,destination:d,walking_minutes:walked,minutes,total_minutes:walked+minutes,fare,lines:dest.lines,stations:dest.metro,bus:dest.bus,distance,from_node:currentNode?.id||null,from_node_label:currentNode?.label||null,to_node:targetNode?.id||null,to_node_label:targetNode?.label||null,to_station:targetNode?.station||null,street_distance:distance};};const navigate=(destination,mode="METRO",opts={})=>{const plan=routePlan(destination,mode,opts);if(!plan.ok)return plan;advance(plan.walking_minutes);const route=publicTransit(plan.mode,plan.destination,{skip:true});if(!route.ok)return Object.assign(route,{walking_minutes:plan.walking_minutes});return Object.assign(route,{walking_minutes:plan.walking_minutes,total_minutes:plan.walking_minutes+route.minutes,distance:plan.distance,segments:[{mode:"FOOT",minutes:plan.walking_minutes,destination:"TRANSIT STOP"},{mode:plan.mode,minutes:route.minutes,destination:plan.destination}]});};const job=(id,pay=25)=>{const s=read();s.jobs=s.jobs||[];if(!s.jobs.includes(id))s.jobs.push(id);s.money+=Math.max(0,pay);s.energy=clamp(s.energy-5);s.hunger=clamp(s.hunger-3);s.jobs_history=(s.jobs_history||[]).concat([{id,pay,day:s.day}]).slice(-100);s.financial_history=(s.financial_history||[]).concat([{type:"INCOME",amount:pay,source:id,day:s.day}]).slice(-100);return save(s)};const activity=(type,opts={})=>{const s=read(),t={EAT:15,SLEEP:480,REST:60,WORK:120,SOCIAL:60,TRAIN:60}[String(type||"").toUpperCase()]||30;if(type==="EAT"){const cost=Number(opts.cost??8);if(s.money<cost)return {ok:false,reason:"INSUFFICIENT_FUNDS"};s.money-=cost;s.hunger=clamp(s.hunger+30);s.stress=clamp(s.stress-4);s.financial_history=(s.financial_history||[]).concat([{type:"EXPENSE",amount:cost,reason:"FOOD",day:s.day}]).slice(-100)}else if(type==="SLEEP"){s.sleep=0;s.energy=clamp(s.energy+55);s.stress=clamp(s.stress-15);s.health=clamp(s.health+5)}else if(type==="REST"){s.energy=clamp(s.energy+18);s.stress=clamp(s.stress-6)}else if(type==="SOCIAL"){s.social=clamp(s.social+12);s.stress=clamp(s.stress-5)}else if(type==="WORK"){const pay=Number(opts.pay??25);s.money+=Math.max(0,pay);s.energy=clamp(s.energy-12);s.hunger=clamp(s.hunger-8);s.stress=clamp(s.stress+4);s.jobs_history=(s.jobs_history||[]).concat([{id:opts.id||"SHIFT",pay,day:s.day}]).slice(-100);s.financial_history=(s.financial_history||[]).concat([{type:"INCOME",amount:pay,source:opts.id||"SHIFT",day:s.day}]).slice(-100);if(s.status==="UNKNOWN")s.status="WORKING";if(s.path==="UNDEFINED")s.path="WORK"}else if(type==="TRAIN"){s.energy=clamp(s.energy-8);s.hunger=clamp(s.hunger-5);s.skills[opts.skill||"fitness"]=Math.min(100,(s.skills[opts.skill||"fitness"]||0)+Number(opts.amount||5));if(s.path==="UNDEFINED")s.path="DISCIPLINE"}s.events=(s.events||[]).concat([{type:"ACTIVITY",activity:String(type),day:s.day,hour:s.hour}]).slice(-100);if(!save(s))return {ok:false,reason:"SAVE_FAILED"};if(!advance(t))return {ok:false,reason:"TIME_SAVE_FAILED"};return {ok:true,state:read(),minutes:t}};
const combatAttack=(targetId,opts={})=>{
 const s=read();const target=window.ESCIE_WORLD_NPC?.state?.().npcs?.[targetId];if(!target)return {ok:false,reason:"TARGET_NOT_FOUND"};
 if(s.legal_status==="DECEASED")return {ok:false,reason:"DEAD"};
 const stamina=Number(s.stamina??100);if(stamina<8)return {ok:false,reason:"EXHAUSTED"};
 const eq=window.ESCIE_WORLD_EQUIPMENT;const equipped=eq?.weapon?.()||{id:"FISTS",damage:9,stamina:10,label:"FISTS"};if(eq?.durability?.(equipped.id)===0)return {ok:false,reason:"BROKEN"};const weapon=String(opts.weapon||equipped.id||"FISTS").toUpperCase();const base=Number(equipped.damage||9);
 const hit=Math.max(1,Math.round(base*(1-Math.min(.6,Number(target.armor||0)/100))));
 s.stamina=Math.max(0,stamina-Number(equipped.stamina||10));s.stress=clamp(s.stress+2);
 s.events=(s.events||[]).concat([{type:"COMBAT_ATTACK",target:targetId,weapon,damage:hit,day:s.day,hour:s.hour}]).slice(-100);if(!save(s))return {ok:false,reason:"SAVE_FAILED"};
 const wear=eq?.consume?.(equipped.id,1);
 const result=window.ESCIE_WORLD_NPC?.damageNPC?.(targetId,hit,weapon)||{ok:true};
 return {ok:true,hit,weapon,target:result,durability:wear?.remaining,state:read()};
};
const combatDefend=()=>{
 const s=read();s.stamina=Math.min(100,Number(s.stamina??100)+4);s.stress=clamp(s.stress-1);s.events=(s.events||[]).concat([{type:"COMBAT_DEFEND",day:s.day,hour:s.hour}]).slice(-100);if(!save(s))return {ok:false,reason:"SAVE_FAILED"};return {ok:true,state:read()};
};
const applyDamage=(amount=0,cause="UNKNOWN",opts={})=>{
 const s=read(),eq=window.ESCIE_WORLD_EQUIPMENT,d0=Math.max(0,Number(amount)||0),armor=Number(eq?.armor?.()||0),d=Math.max(0,Math.round(d0*(1-Math.min(.7,armor/100))));if(!d)return {ok:true,damage:0,state:s};
 s.health=clamp(s.health-d);s.damage=clamp((s.damage||0)+d);s.stress=clamp(s.stress+Math.min(30,d*.4));
 s.events=(s.events||[]).concat([{type:"INJURY",damage:d,cause,day:s.day,hour:s.hour}]).slice(-100);
 if(s.health<=0){s.legal_status="DECEASED";s.status="DECEASED";s.events=(s.events||[]).concat([{type:"DEATH",cause,day:s.day,hour:s.hour}]).slice(-100);if(!save(s))return {ok:false,reason:"SAVE_FAILED"};return {ok:false,dead:true,respawn:true,state:read()}}
 if(s.health<=25){s.legal_status="HOSPITAL";s.status="RECOVERING";s.access=(s.access||[]);if(!save(s))return {ok:false,reason:"SAVE_FAILED"};return {ok:true,hospital:true,state:read()}}
 if(!save(s))return {ok:false,reason:"SAVE_FAILED"};return {ok:true,damage:d,state:read()};
};
const respawn=(opts={})=>{
 const s=read();if(s.legal_status!=="DECEASED"&&s.health>0)return {ok:false,reason:"NOT_DEAD"};
 const spawn=opts.spawn||{x:2,y:7,neighbourhood:"PARC-EXTENSION"};
 s.health=100;s.damage=0;s.stress=Math.max(20,Math.min(65,Number(s.stress)||20));s.hunger=Math.max(30,Number(s.hunger)||30);s.energy=70;s.wanted=0;s.legal_status="CLEAR";s.status="RECOVERING";s.sentence_minutes=0;s.position={x:spawn.x,y:spawn.y};s.neighbourhood=spawn.neighbourhood;s.transport="FOOT";
 s.day=Number(s.day||1)+1;s.hour=6;s.minute=0;
 s.events=(s.events||[]).concat([{type:"RESPAWN",day:s.day,hour:s.hour,location:s.neighbourhood}]).slice(-100);
 if(!save(s))return {ok:false,reason:"SAVE_FAILED"};return {ok:true,respawned:true,state:read()};
};
const hospital=()=>{
 const s=read();if(s.legal_status!=="HOSPITAL"&&s.health>25)return {ok:false,reason:"NOT_HOSPITALIZED"};
 const minutes=Math.max(60,Math.min(1440,180+Math.round((100-s.health)*8)));
 s.health=Math.max(70,Math.min(100,s.health+Math.round((100-s.health)*.8)));s.damage=Math.max(0,Math.round(s.damage*.2));s.stress=clamp(s.stress-15);s.legal_status="CLEAR";s.status=s.status==="DECEASED"?"DECEASED":"RECOVERING";
 s.events=(s.events||[]).concat([{type:"HOSPITAL",minutes,day:s.day,hour:s.hour}]).slice(-100);if(!save(s))return {ok:false,reason:"SAVE_FAILED"};if(!advance(minutes))return {ok:false,reason:"TIME_SAVE_FAILED"};return {ok:true,minutes,state:read()};
};
const radioBroadcast=()=>{
 const hour=Number(read().hour||0), lines=["MONTRÉAL WEATHER SERVICE · COLD AIR MOVING THROUGH THE CITY.","CITY DESK · TRANSIT RUNNING WITH MINOR DELAYS.","NIGHT SIGNAL · YOU ARE LISTENING TO A BROADCAST THAT WAS NOT HERE YESTERDAY.","PUBLIC NOTICE · CHECK YOUR SURROUNDINGS. THE CITY REMEMBERS WHAT YOU DO.","LOCAL FREQUENCY · THIS MESSAGE IS GENERATED FOR THE CURRENT WORLD STATE."];
 return {title:"THE WORLD RADIO",line:lines[hour%lines.length],generated:true,public_domain:true};
};
const buildingAction=(interior,action,opts={})=>{
 const s=read(),a=String(action||"").toUpperCase(),i=String(interior||"").toUpperCase();
 const fail=reason=>({ok:false,reason,state:read()});
 if(a==="LEAVE")return {ok:true,leave:true,state:read()};
 if(["EAT","SLEEP","REST","SOCIAL","WORK","TRAIN"].includes(a))return activity(a,opts);
 if(a==="BUY"){const cost=Math.max(1,Number(opts.cost||12));if(s.money<cost)return fail("INSUFFICIENT_FUNDS");return spend(cost,opts.reason||"BUILDING_PURCHASE"),{ok:true,purchased:true,cost,state:read()}}
 if(a==="HEAL"){const cost=Math.max(0,Number(opts.cost??20));if(s.health>=100)return fail("ALREADY_HEALTHY");if(s.money<cost)return fail("INSUFFICIENT_FUNDS");s.money-=cost;s.health=Math.min(100,s.health+35);s.damage=Math.max(0,s.damage-30);s.stress=clamp(s.stress-8);s.financial_history=(s.financial_history||[]).concat([{type:"EXPENSE",amount:cost,reason:"CLINIC",day:s.day}]).slice(-100);if(!save(s))return fail("SAVE_FAILED");if(!advance(30))return fail("TIME_SAVE_FAILED");return {ok:true,healed:true,state:read()}};
 if(a==="RECORD"){s.events=(s.events||[]).concat([{type:"RECORD_SESSION",interior:i,day:s.day,hour:s.hour}]).slice(-100);s.stress=clamp(s.stress+2);if(!save(s))return fail("SAVE_FAILED");if(!advance(30))return fail("TIME_SAVE_FAILED");return {ok:true,recorded:true,state:read()}};
 if(a==="LISTEN"||a==="READ"||a==="INVESTIGATE"||a==="TRACE"){s.events=(s.events||[]).concat([{type:"INTERIOR_DISCOVERY",action:a,interior:i,day:s.day,hour:s.hour}]).slice(-100);if(!save(s))return fail("SAVE_FAILED");if(!advance(15))return fail("TIME_SAVE_FAILED");return {ok:true,discovery:a,state:read()}};
 if(a==="DANCE"){return activity("SOCIAL",{reason:"DANCE"})}
 return fail("ACTION_NOT_IMPLEMENTED");
};
const financialNotice=(type,amount,reason)=>{try{window.dispatchEvent(new CustomEvent("escie:financial-event",{detail:{type,amount,reason}}))}catch(e){}};const spend=(amount,reason)=>{const s=read();amount=Math.max(0,Number(amount)||0);if(s.money<amount)return false;s.money-=amount;s.financial_history=(s.financial_history||[]).concat([{type:"EXPENSE",amount,reason,day:s.day}]).slice(-100);const out=save(s);financialNotice("EXPENSE",amount,reason);return out};const npcMemory=(id,data={})=>{const s=read();s.npc_memory=s.npc_memory||{};s.npc_memory[id]=Object.assign({},s.npc_memory[id]||{},data,{last_day:s.day});return save(s)};const decayWanted=(m=1)=>{const s=read();if(s.sentence_minutes>0)return s;if(s.wanted>0){s.wanted=Math.max(0,s.wanted-Math.max(0,Number(m)||0));if(!s.wanted)s.legal_status="CLEAR"}return save(s)};const markSurveillance=(type,level=1)=>witnessed(type,level);const detect=(source,level=1)=>{const s=read();s.surveillance=(s.surveillance||[]).concat([{type:"DETECTION",source,level,day:s.day,hour:s.hour}]).slice(-100);if(!save(s))return null;return witnessed(source,level)};const clearWanted=()=>{const s=read();if(s.sentence_minutes>0)return s;s.wanted=0;s.legal_status="CLEAR";return save(s)};window.ESCIE_WORLD_SIMULATION={state:read,save:flush,flush,change,advance,setTransport:transport,setPosition,movePlayer,publicTransit,cityRoute,cityNavigate,routePlan,navigate,transitRoutes:PUBLIC_TRANSIT,transitService,districts:CITY_DISTRICTS,streetNodes:WORLD_STREETS,streetRealism:STREET_REALISM,streetContext,streetEdges:STREET_EDGES,streetGraph,nearestStreetNode,streetPath,montrealReference,districtReference,districtTexture,districtActivityProfile,seasonalSurface,corridorContext,landmarks:WORLD_LANDMARKS,districtLandmarks,findLandmark,buildings:WORLD_BUILDINGS,CITY_REFERENCE,interiors:INTERIORS,districtBuildings,findBuilding,enterBuilding,leaveBuilding,npcPopulations:NPC_POPULATIONS,npcDayPlan:NPC_DAY_PLAN,seedDistrictNPCs,seedWorldNPCs,npcInteraction,NPC_SOCIAL_RULES,npcJobOffer,npcJobAccept,npcMissionOffer,npcMissionAccept,npcMissionProgress,npcMissionComplete,npcFavor,NPC_MISSIONS,NPC_JOB_OFFERS,crimeJobOffer,crimeJobAccept,crimeJobProgress,CRIME_JOBS,district,activateDistrict,activity,choice,canAccess:access,train,graffiti,steal,dream,enterDream,evaluateDream,dreamContext,dreamSceneContext,dreamScenario,dreamScenarioPool,dreamDirector:DREAM_DIRECTOR,buildDreamLevel,dreamLevel,serve,useSubstance:use,job,spend,applyDamage,hospital,respawn,combatAttack,combatDefend,radioBroadcast,buildingAction,npcMemory,decayWanted,markSurveillance,witnessed,detect,clearWanted};if(!localStorage.getItem(K))save(D);else read()})();