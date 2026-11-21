(function(){
"use strict";
window.ESCIE_WORLD_ENGINE_ACTIVE=true;
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const safeDecode=value=>{try{return decodeURIComponent(String(value??""));}catch(_e){return String(value??"");}};
const coll=(name,fallback=[])=>{const v=window[name];return Array.isArray(v)?v:(v&&Array.isArray(v.records)?v.records:fallback)};
const state={tab:"atlas",q:"",type:"ALL",selected:null,trail:[],visited:[],eyeOpen:false,exploreOpen:false,outsideOpen:false,moreOpen:false,returningFrom:null,returnFlash:null,street:null,roomOrigin:null,attentionSince:0,attentionNoticed:false,focusOrigin:null,focusDetailRequest:false,focusRestoreRequest:false};
const tabs=[["atlas","ATLAS","world"],["people","THE PEOPLE","person"],["places","PLACES","world"],["moments","MOMENTS","moment"],["objects","OBJECTS","world"],["fragments","FRAGMENTS","photo-negative"],["bodies","BODIES","empty-chair"],["proof","PROOF","key"],["path","PATH","web"],["timeline","TIMELINE","now"],["symbols","SYMBOLS","daisy"],["trace","TRACE","web"],["trails","TRAILS","web"]];function glyph(name,label){const safe=String(name||"").replace(/[^a-z0-9-]/gi,"");if(!safe)return "";return '<svg class="escie-symbol-glyph world-entry-glyph" viewBox="0 0 32 32" focusable="false" aria-hidden="true"><use href="./assets/escie-symbols.svg#'+esc(safe)+'"></use></svg>';}
const raf=typeof requestAnimationFrame==="function"?requestAnimationFrame:fn=>setTimeout(fn,0);
const caf=typeof cancelAnimationFrame==="function"?cancelAnimationFrame:clearTimeout;
const reduceMotion=()=>typeof window.matchMedia==="function"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let searchFrame=null;
function scheduleSearchRender(render,filtered){
 caf(searchFrame);
 searchFrame=raf(()=>{
   searchFrame=null;
   if(typeof render!=="function"||typeof filtered!=="function")return;
   render(filtered());
 });
}
function isPublicWorldRecord(r){
 if(!r||typeof r!=="object")return false;
 if(r.public_disclosure===false)return false;
 const visibility=String(r.visibility||"").toLowerCase();
 if(["withheld","private","internal","draft"].includes(visibility))return false;
 const status=String(r.status||"").toLowerCase();
 if(["withheld","private","internal","draft"].includes(status))return false;
 if(r.released===false||r.published===false)return false;
 return true;
}
function records(){
 const sources=[coll("ESCIE_LIVE_RECORDS"),coll("ESCIE_MUSIC"),coll("ESCIE_PEOPLE"),coll("ESCIE_LOCATIONS"),coll("ESCIE_MOMENTS"),coll("ESCIE_OBJECTS"),coll("ESCIE_FRAGMENTS"),coll("ESCIE_BODIES"),coll("ESCIE_PATHS"),coll("ESCIE_PROOF"),coll("ESCIE_NODES"),coll("ESCIE_PROJECTS"),coll("ESCIE_ARCHIVE"),coll("ESCIE_INVESTIGATION"),coll("ESCIE_SYMBOLS")];
 const seen=new Set(),out=[];
 sources.flat().forEach(r=>{if(!isPublicWorldRecord(r))return;const id=r.id||r.recordId||r.slug||r.title;if(id&&!seen.has(id)){seen.add(id);out.push({...r,id})}});
 return out;
}
function type(r){return String(r.type||r.kind||r.category||"WORK").trim().toUpperCase()||"WORK"}
function title(r){return String(r.title||r.name||r.label||"UNTITLED").trim()||"UNTITLED"}
function searchText(r){return [r.id,r.type,r.kind,r.category,r.title,r.name,r.label,r.description,r.summary,r.story,r.date,r.release_date,r.moment_date,r.created_at,Array.isArray(r.tags)?r.tags.join(" "):""] .map(v=>String(v??"")).join(" ").toLowerCase()}
function rels(){
 const local=coll("ESCIE_RELATIONSHIPS").concat(coll("ESCIE_LIVE_RELATIONSHIPS"));
 const contract=window.ESCIE_RELATIONSHIP;
 const seen=new Set();
 return local.concat(coll("ESCIE_RELATIONSHIPS_PUBLIC")).map(r=>r&&({...r,from:r.from||r.source_id||r.sourceId,to:r.to||r.target_id||r.targetId})).filter(r=>{
   if(!r||!r.from||!r.to)return false;
   if(contract&&typeof contract.normalize==="function")r=contract.normalize(r);
   if(contract&&typeof contract.validate==="function"&&!contract.validate(r).valid)return false;
   if(contract&&typeof contract.canDisclose==="function"){
     if(!contract.canDisclose(r))return false;
   }else{
     if(r.public_disclosure!==true)return false;
     if(r.visibility!==undefined&&String(r.visibility).toLowerCase()!=="public")return false;
     if(r.status!==undefined&&["withheld","archived","inactive"].includes(String(r.status).toLowerCase()))return false;
   }
   const key=[String(r.from),String(r.type||"related"),String(r.to)].join("|");
   if(seen.has(key))return false;
   seen.add(key);return true;
 });
}
function related(id){
 const map=new Map(records().map(r=>[String(r.id),r])),out=[];
 rels().forEach(x=>{
   if(String(x.from)===String(id)&&map.has(String(x.to)))out.push({r:x,node:map.get(String(x.to))});
   else if(String(x.to)===String(id)&&map.has(String(x.from)))out.push({r:{...x,type:inverse(x.type)},node:map.get(String(x.from))});
 });
 const selected=map.get(String(id));
 if(selected&&Array.isArray(selected.related_records))selected.related_records.forEach(rid=>{if(map.has(String(rid))&&!out.some(x=>String(x.node.id)===String(rid)))out.push({r:{type:"related"},node:map.get(String(rid))})});
 return out;
}
function inverse(t){const inv={created_by:"created",part_of:"contains",located_at:"location_of",recorded_at:"recording_location_of",performed_at:"performance_location_of",inspired_by:"inspires",supports:"supported_by",contradicts:"contradicted_by"};return inv[t]||t||"related"}
function liveContents(){
 const live=window.ESCIE_WORLD_LIVE&&window.ESCIE_WORLD_LIVE.data;
 if(!live||!Array.isArray(live.contents))return [];
 const map=new Map(records().map(r=>[String(r.id),r]));
 return live.contents.map(function(x){
   const id=String(x&&x.record_id||"");
   const target=map.get(id)||{id:id,type:x.type||"OBJECT",title:x.title||id,description:x.description||"Something in this place."};
   return {node:target,presence:x.presence||"PRESENT",weight:x.weight,context:x.context||{}};
 }).filter(x=>x.node&&x.node.id);
}
function liveDiscoveries(node){
 const live=window.ESCIE_WORLD_LIVE&&window.ESCIE_WORLD_LIVE.data;
 if(!live||!Array.isArray(live.discoveries)||!node)return [];
 const map=new Map(records().map(r=>[String(r.id),r]));
 return live.discoveries.map(function(x){
   const id=String(x&&x.record_id||"");
   const target=map.get(id)||{
     id:id,
     type:x.type||"WORK",
     title:x.title||id,
     description:x.description||"A place in the World."
   };
   return {node:target,r:{type:x.relationship||"related",weight:x.weight}};
 }).filter(Boolean);
}
function liveEnvironment(){return window.ESCIE_WORLD_LIVE&&window.ESCIE_WORLD_LIVE.data&&window.ESCIE_WORLD_LIVE.data.environment||null;}
function livePlace(){
 const data=window.ESCIE_WORLD_LIVE&&window.ESCIE_WORLD_LIVE.data;
 return data&&data.place||null;
}
function liveEncounter(){
 const data=window.ESCIE_WORLD_LIVE&&window.ESCIE_WORLD_LIVE.data;
 return data&&data.encounter||null;
}
function liveObjectContext(){
 const data=window.ESCIE_WORLD_LIVE&&window.ESCIE_WORLD_LIVE.data;
 if(!data||!data.object)return null;
 const place=data.place||{};
 const object=data.object||{};
 const context=object.context&&typeof object.context==="object"?object.context:{};
 return {
   presence:object.presence||"PRESENT",
   weight:object.weight,
   notice:String(context.notice||context.context||"").trim(),
   origin:place,
   originRecordId:place.record_id||null
 };
}
function placeIdentity(room){
 const p=livePlace()||{};
 const meta=p.metadata&&typeof p.metadata==="object"?p.metadata:{};
 return {
   role:meta.role||"",
   texture:Array.isArray(meta.texture)?meta.texture:[],
   anchors:Array.isArray(meta.anchors)?meta.anchors:[],
   name:p.name||title(room)
 };
}
function placeAtmosphere(record,layer){
 const env=liveEnvironment()||{};
 const visual=env.visual_state&&typeof env.visual_state==="object"?env.visual_state:{};
 const audio=env.audio_state&&typeof env.audio_state==="object"?env.audio_state:{};
 const r=record&&typeof record==="object"?record:{};
 const rawTags=Array.isArray(r.tags)?r.tags:Array.isArray(r.profile&&r.profile.tags)?r.profile.tags:[];
 const text=[r.title,r.name,r.description].filter(Boolean).join(" ").toLowerCase();
 const tags=rawTags.map(function(x){return String(x).toLowerCase();}).join(" ");
 const source=text+" "+tags;
 let character=String(layer||"place").toUpperCase()==="NEIGHBORHOOD"?"DISTRICT":String(layer||"place").toUpperCase()==="STREET"?"STREET":String(layer||"place").toUpperCase()==="ROOM"?"ROOM":"LIVED";
 if(/apartment|home|room|kitchen|bedroom|hallway|interior/.test(source))character="INTERIOR";
 else if(/alley|street|corner|sidewalk|avenue|boulevard|road|station/.test(source))character="STREET";
 else if(/park|garden|river|mountain|forest|yard|outdoor/.test(source))character="OPEN_AIR";
 else if(/church|school|store|shop|bar|cafe|restaurant|building/.test(source))character="PUBLIC_PLACE";
 return {weather:env.weather||"UNKNOWN",temperature:env.temperature,light:visual.light||env.daylight||"UNKNOWN",surface:visual.surface||"NATURAL",signal:visual.signal||"AMBIENT",sound:audio.primary||"AMBIENT_CITY",season:env.season||"UNKNOWN",character:character,layer:String(layer||"place").toUpperCase()};
}
function worldNow(){
 const env=liveEnvironment()||{};
 const d=new Date();
 let dateLabel="",timeLabel="";
 if(!Number.isNaN(d.getTime())){
  dateLabel=new Intl.DateTimeFormat("en-CA",{weekday:"long",month:"long",day:"numeric",timeZone:"America/Toronto"}).format(d);
  timeLabel=new Intl.DateTimeFormat("en-CA",{hour:"numeric",minute:"2-digit",timeZone:"America/Toronto"}).format(d);
 }
 return {date:dateLabel,time:timeLabel,season:String(env.season||"").trim(),weather:String(env.weather||"").trim(),temperature:env.temperature};
}
const CELESTIAL_LAYERS=["UNIVERSE","SUN","MOON","STARS","CELESTIAL_EVENT"];
function lunarPhase(date){
 const synodic=29.530588853;
 const known=Date.UTC(2000,0,6,18,14,0);
 const days=(date.getTime()-known)/86400000;
 const age=((days%synodic)+synodic)%synodic;
 const names=["NEW MOON","WAXING CRESCENT","FIRST QUARTER","WAXING GIBBOUS","FULL MOON","WANING GIBBOUS","LAST QUARTER","WANING CRESCENT"];
 const index=Math.round(age/synodic*8)%8;
 return {age,name:names[index],illumination:(1-Math.cos(age/synodic*2*Math.PI))/2};
}
function celestialContext(){
 const env=liveEnvironment()||{};
 const now=new Date();
 const parts=new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"numeric",hour12:false,timeZone:"America/Toronto"}).formatToParts(now);
 const hour=Number(parts.find(function(p){return p.type==="hour";})?.value||0);
 const minute=Number(parts.find(function(p){return p.type==="minute";})?.value||0);
 const clock=hour+(minute/60);
 const localMinutes=function(d){
  const ps=new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"numeric",hour12:false,timeZone:"America/Toronto"}).formatToParts(d);
  return Number(ps.find(function(p){return p.type==="hour";})?.value||0)*60+Number(ps.find(function(p){return p.type==="minute";})?.value||0);
 };
 const nowMinutes=hour*60+minute;
 const sunrise=env.sunrise?new Date(env.sunrise):null;
 const sunset=env.sunset?new Date(env.sunset):null;
 let phase=clock<6?"NIGHT":clock<8?"DAWN":clock>=20?"NIGHT":clock>=18?"DUSK":"DAY";
 if(sunrise&&!isNaN(sunrise)&&sunset&&!isNaN(sunset)){
  const sr=localMinutes(sunrise), ss=localMinutes(sunset);
  if(nowMinutes>=sr-45&&nowMinutes<sr+45)phase="DAWN";
  else if(nowMinutes>=ss-45&&nowMinutes<ss+45)phase="DUSK";
  else if(nowMinutes>=sr+45&&nowMinutes<ss-45)phase="DAY";
  else phase="NIGHT";
 }
 const night=phase==="NIGHT";
 const moon=lunarPhase(now);
 return {
  universe:"EARTH",
  sun:night?"BELOW_HORIZON":"ABOVE_HORIZON",
  skyPhase:phase,
  moon:moon.name,
  moonAge:moon.age,
  moonIllumination:moon.illumination,
  stars:night?"VISIBLE_IF_SKY_ALLOWS":"DAYLIGHT",
  sunrise:sunrise&&!isNaN(sunrise)?sunrise.toISOString():null,
  sunset:sunset&&!isNaN(sunset)?sunset.toISOString():null,
  daylight:env.daylight||env.visual_state?.light||null
 };
}
function celestialMarkup(){
 const c=celestialContext();
 const active=[];
 if(c.sun==="ABOVE_HORIZON")active.push("DAYLIGHT");
 else active.push("NIGHT SKY");
 if(c.stars==="VISIBLE_IF_SKY_ALLOWS")active.push("STARS");
 return '<div class="world-celestial" data-world-moon="'+esc(c.moon)+'" data-world-sun="'+esc(c.sun)+'" aria-label="Celestial context"><span class="world-kicker">UNDER THIS SKY</span><span>'+esc(active.join(" · "))+' · '+esc(c.moon)+'</span></div>';
}
const WORLD_LAYERS=[
 "EXISTENCE","PRESENCE","PLACE","TIME","LIFE","EXPERIENCE","INTERPRETATION","ART","PERSPECTIVE","VISITOR","PARTICIPATION","MEMORY","OUTSIDE_WORLD"
];
const WORLD_LAYER_RULES={
 EXISTENCE:function(){return true;},
 PRESENCE:function(r){return !!r;},
 PLACE:function(r){return /PLACE|LOCATION|ROOM|BUILDING|STREET|NEIGHBORHOOD|HOME/i.test(String(r?.type||r?.kind||""));},
 TIME:function(r){return !!(r?.date||r?.moment_date||r?.event_date||r?.release_date||r?.occurred_at||r?.temporal_state||r?.time_state);},
 LIFE:function(r){return /PERSON|PEOPLE|ANIMAL/i.test(String(r?.type||r?.kind||""));},
 EXPERIENCE:function(r){return !!(r?.description||r?.atmosphere||r?.mood||r?.experience);},
 INTERPRETATION:function(r){return !!(r?.interpretation||r?.theory||r?.reason||r?.notes);},
 ART:function(r){return /ART|MUSIC|POEM|PAINT|DRAW|WRITING|PHOTO|VIDEO|AUDIO/i.test(String(r?.type||r?.kind||""));},
 PERSPECTIVE:function(r){return !!(r?.perspective||r?.point_of_view||r?.voice);},
 VISITOR:function(){return !!state.selected;},
 PARTICIPATION:function(r){return !!(r?.glass_eye||r?.contributor||r?.submission);},
 MEMORY:function(r){return !!(r?.memory||r?.remembered||r?.source==="memory");},
 OUTSIDE_WORLD:function(r){return !!(r?.outside_world||r?.external); }
};
function worldLayerCoverage(r){
 return WORLD_LAYERS.filter(function(layer){return WORLD_LAYER_RULES[layer](r);});
}
function worldLayerFor(r){
 const x=String(r?.type||r?.kind||"").toUpperCase();
 if(/ART|MUSIC|POEM|PAINT|DRAW|WRITING/.test(x))return "ART";
 if(/PERSON|PEOPLE/.test(x))return "LIFE";
 if(/OBJECT/.test(x))return "PRESENCE";
 if(/PLACE|LOCATION|ROOM|BUILDING|STREET|NEIGHBORHOOD/.test(x))return "PLACE";
 return "EXPERIENCE";
}
function worldLayerMarkup(r){
 const layer=worldLayerFor(r); return '<span class="world-layer-mark" data-world-layer="'+esc(layer)+'">'+esc(layer.replace(/_/g," "))+'</span>';
}

function worldReturnState(){
 const key="escie_world_return_state";
 try{return JSON.parse(localStorage.getItem(key)||"{}")||{};}catch(e){return {};}
}
function rememberWorldReturn(){
 const now=Date.now(); const data=worldReturnState();
 data.lastVisit=now; data.visits=Math.max(0,Number(data.visits||0))+1;
 try{localStorage.setItem("escie_world_return_state",JSON.stringify(data));}catch(e){}
 return data;
}
function returnWelcomeMarkup(){
 const data=worldReturnState();
 if(!data.lastVisit)return "";
 const elapsed=Date.now()-Number(data.lastVisit||0);
 if(elapsed<6*60*60*1000)return "";
 return '<div class="world-return-welcome" role="status"><span class="world-kicker">RETURN</span><strong>THE WORLD KEPT GOING.</strong><p>Things may be different from the last time you were here.</p></div>';
}
function worldChangeState(){
 const key="escie_world_last_seen"; try{return JSON.parse(localStorage.getItem(key)||"{}")||{};}catch(e){return {};}
}
function worldChangeSnapshot(){
 const env=state.environment||{}; return {weather:String(env.weather||""),temperature:String(env.temperature??""),season:String(env.season||""),light:String(env.light||""),signal:String(env.signal||"")};
}
function worldContentSnapshot(){
 const nodes=[];
 try{
   const src=Array.isArray(window.ESCIE_WORLD_DATA)?window.ESCIE_WORLD_DATA:(window.ESCIE_WORLD_DATA?.records||[]);
   src.forEach(function(r){
     const id=String(r?.id||"");
     if(id&&isPublicWorldRecord(r))nodes.push(id);
   });
 }catch(e){}
 return nodes.sort().slice(0,200);
}
function worldContentChangeMarkup(){
 const key="escie_world_content_seen"; let previous=[];
 try{previous=JSON.parse(localStorage.getItem(key)||"[]");if(!Array.isArray(previous))previous=[];}catch(e){}
 const current=worldContentSnapshot(); if(!current.length)return "";
 const added=current.filter(id=>!previous.includes(id));
 try{localStorage.setItem(key,JSON.stringify(current));}catch(e){}
 if(!previous.length||!added.length)return "";
 const id=added[0];
 return '<div class="world-return-change world-content-change" role="status"><span class="world-kicker">WHILE YOU WERE GONE</span><strong>SOMETHING NEW IS HERE.</strong><p>The World has a new public presence to discover.</p><button type="button" class="world-return-thread-button" data-return-new="'+esc(String(id))+'">SEE WHAT CHANGED</button></div>';
}
function worldReturnTrailMarkup(){
 const trail=Array.isArray(state.trail)?state.trail:[]; if(!trail.length)return "";
 const last=trail[trail.length-1]; const label=String(last?.title||last?.name||last?.id||"").trim(); if(!label)return "";
 return '<div class="world-return-thread"><span class="world-kicker">YOUR LAST THREAD</span><strong>'+esc(label)+'</strong><p>You can continue from where you left off, or wander somewhere else.</p><button type="button" class="world-return-thread-button" data-return-thread="'+esc(String(last.id||""))+'">RETURN TO IT</button></div>';
}
function worldWanderMarkup(){
 const trail=Array.isArray(state.trail)?state.trail:[]; if(!trail.length)return "";
 return '<div class="world-wander-prompt"><span class="world-kicker">OR WANDER</span><p>You do not have to follow the thread you left behind.</p><button type="button" class="world-return-thread-button" data-wander-world>WANDER THE WORLD</button></div>';
}
function worldSerendipityMarkup(){
 const pool=Array.isArray(state.trail)?state.trail.slice():[]; const current=String(state.selected||"");
 const candidates=pool.filter(function(x){return x&&String(x.id||"")!==current;}); if(!candidates.length)return "";
 const pick=candidates[Math.floor(Math.random()*candidates.length)]; const id=String(pick.id||""); const label=String(pick.title||pick.name||id).trim(); if(!id||!label)return "";
 return '<div class="world-serendipity"><span class="world-kicker">ANOTHER THREAD</span><strong>'+esc(label)+'</strong><p>Not everything needs a reason. You can follow this one simply because it is here.</p><button type="button" class="world-return-thread-button" data-serendipity-node="'+esc(id)+'">FOLLOW IT</button></div>';
}
function rememberWorldSnapshot(){
 try{localStorage.setItem("escie_world_last_seen",JSON.stringify({at:Date.now(),snapshot:worldChangeSnapshot()}));}catch(e){}
}
function worldChangedSinceLastVisit(){
 const previous=worldChangeState(), current=worldChangeSnapshot(); if(!previous.at)return null;
 const changes=[]; Object.keys(current).forEach(k=>{if(String(previous.snapshot?.[k]??"")!==String(current[k]??"")&&current[k])changes.push(k);});
 return changes.length?changes:null;
}
function returnChangeMarkup(){
 const changes=worldChangedSinceLastVisit(); if(!changes)return "";
 const labels={weather:"weather",temperature:"temperature",season:"season",light:"light",signal:"signal"};
 const readable=changes.map(k=>labels[k]||k).slice(0,3).join(", ");
 return '<div class="world-return-change" role="status"><span class="world-kicker">WHILE YOU WERE GONE</span><strong>THE WORLD MOVED.</strong><p>'+esc(readable.charAt(0).toUpperCase()+readable.slice(1))+' changed since your last visit.</p></div>';
}
function worldNowMarkup(){
 const now=worldNow();
 const line=[now.date,now.time].filter(Boolean).join(" · ");
 const conditions=[now.weather,now.temperature==null?"":String(now.temperature)+"°"].filter(Boolean).join(" · ");
 if(!line&&!conditions)return "";
 return '<section class="world-now" aria-label="World now"><div><span class="world-kicker">NOW</span><strong>'+esc(line||"THE PRESENT")+'</strong></div><div class="world-now-conditions"><span>'+esc(conditions||"")+'</span><span>'+esc(now.season||"")+'</span></div></section>';
}
function refreshWorldClock(container){
 const root=container&&container.querySelector(".world-now");
 if(!root)return;
 const now=worldNow();
 const line=[now.date,now.time].filter(Boolean).join(" · ");
 const conditions=[now.weather,now.temperature==null?"":String(now.temperature)+"°"].filter(Boolean).join(" · ");
 const strong=root.querySelector("strong");
 const spans=root.querySelectorAll(".world-now-conditions span");
 if(strong)strong.textContent=line||"THE PRESENT";
 if(spans[0])spans[0].textContent=conditions;
 if(spans[1])spans[1].textContent=now.season||"";
}
function scheduleWorldRefresh(container){
 if(!container)return;
 if(container._escieWorldRefreshTimer)clearTimeout(container._escieWorldRefreshTimer);
 const tick=function(){
  if(!document.hidden){refreshWorldClock(container);}
  scheduleWorldRefresh(container);
 };
 const delay=30000;
 container._escieWorldRefreshTimer=setTimeout(tick,delay);
}
function filtered(){
 const q=state.q.toLowerCase().trim();
 return records().filter(r=>(state.type==="ALL"||type(r)===state.type)&&(!q||searchText(r).includes(q)));
}
function card(r){
 const links=related(r.id);
 const depth=links.length?"DEEPER THREAD":"SURFACE";
 const why=links.length?"CONNECTED TO "+links.length+" THREAD"+(links.length===1?"":"S"):"";
 return '<button type="button" class="world-card world-node-card" data-node="'+esc(r.id)+'" data-depth="'+(links.length?"deep":"surface")+'"><div class="world-card-main"><span class="world-kicker">'+esc(type(r))+' // '+depth+'</span><h3 data-no-translate class="record-identity">'+esc(title(r))+'</h3><p>'+esc(String(r.description||r.summary||r.story||"A doorway into the World.").slice(0,220))+'</p>'+(why?'<small class="world-card-thread">'+esc(why)+'</small>':'')+'</div><span class="world-arrow" aria-hidden="true">OPEN</span></button>';
}
function persistTrace(){try{localStorage.setItem("escie_world_trail",JSON.stringify(state.trail));localStorage.setItem("escie_world_visited",JSON.stringify(state.visited));}catch(e){}}
function remember(id){if(id==null)return;const value=String(id).trim();if(!value)return;if(!state.visited.includes(value))state.visited.push(value);if(state.trail[state.trail.length-1]!==value)state.trail.push(value);state.trail=state.trail.slice(-12);state.visited=state.visited.slice(-100);persistTrace()}
function backtrackTrace(){if(state.trail.length<2)return false;state.trail.pop();persistTrace();const previous=String(state.trail[state.trail.length-1]||"").trim();if(!previous)return false;state.selected=null;state.street=null;state.placeStreet=null;state.roomOrigin=null;openWorldNode(previous,{preserveTrail:true});return true;}
function rememberReturn(target,from){const t=String(target||"").trim(),f=String(from||"").trim();if(!t)return;state.returningFrom=f||null;state.returnFlash={from:f,to:t,at:Date.now()};}
 
function returnToPlace(id,from){
 const target=String(id||"").trim();if(!target)return;
 rememberReturn(target,from);
 if(state.focusDetailRequest){
  state.focusDetailRequest=false;
  state.focusRestoreRequest=true;
  state.focusOrigin={nodeId:String(from||"")};
 }
 openWorldNode(target,{preserveTrail:true,preserveReturn:true});
 window.clearTimeout(window.__ESCIE_WORLD_RETURN_TIMER);
 window.__ESCIE_WORLD_RETURN_TIMER=window.setTimeout(function(){state.returningFrom=null;state.returnFlash=null;draw();},4200);
}
function pathContext(){const rs=records(),out=[];for(let i=1;i<state.trail.length;i++){const from=rs.find(r=>String(r.id)===String(state.trail[i-1])),to=rs.find(r=>String(r.id)===String(state.trail[i]));if(!from||!to)continue;const link=related(from.id).find(x=>String(x.node.id)===String(to.id));out.push({from,to,relationship:link&&link.r&&link.r.type?String(link.r.type).replace(/_/g," "):"WANDERED"});}return out;}
function investigationSummary(){const p=pathContext();const unknowns=state.visited.map(id=>records().find(r=>String(r.id)===String(id))).filter(Boolean).filter(r=>String(r.certainty||"").toUpperCase()==="UNKNOWN").length;return {steps:p.length,unknowns};}
function loadTrail(){try{const a=JSON.parse(localStorage.getItem("escie_world_trail")||"[]");const b=JSON.parse(localStorage.getItem("escie_world_visited")||"[]");if(Array.isArray(a))state.trail=a.filter(v=>typeof v==="string"&&v.trim()).slice(-12);if(Array.isArray(b))state.visited=b.filter(v=>typeof v==="string"&&v.trim()).slice(-100)}catch(e){state.trail=[];state.visited=[]}}
function focusElement(el){
 if(!el||!el.isConnected||typeof el.focus!=="function")return false;
 try{el.focus({preventScroll:true});}catch(_e){try{el.focus();}catch(_e2){return false;}}
 return document.activeElement===el;
}
function focusDetail(){
 if(!state.focusDetailRequest)return false;
 const el=container.querySelector(".world-detail");
 if(!el)return false;
 el.setAttribute("tabindex","-1");
 const focused=focusElement(el);
 if(focused)state.focusDetailRequest=false;
 return focused;
}
function focusNodeControl(id){
 const target=String(id||"");
 if(!target)return false;
 const nodes=container.querySelectorAll("[data-node]");
 for(let i=0;i<nodes.length;i++){
  if(String(nodes[i].getAttribute("data-node")||"")===target)return focusElement(nodes[i]);
 }
 return false;
}
function restoreWorldFocus(){
 if(!state.focusRestoreRequest||!state.focusOrigin)return false;
 const focused=focusNodeControl(state.focusOrigin.nodeId);
 if(focused){state.focusRestoreRequest=false;state.focusOrigin=null;}
 return focused;
}

function safeMediaURL(value){
 const raw=String(value==null?"":value).trim();
 if(!raw)return "";
 try{
   const parsed=new URL(raw,window.location.href);
   if(["http:","https:"].includes(parsed.protocol))return parsed.href;
   if(parsed.origin===window.location.origin&&(parsed.protocol==="http:"||parsed.protocol==="https:"))return parsed.href;
 }catch(e){}
 return "";
}
function mediaPreview(r){
 const media=(r&&r.media&&typeof r.media==="object")?r.media:{};
 const url=safeMediaURL(media.url||r.media_url||r.image_url||r.thumbnail||"");
 const kind=String(media.type||r.media_type||"").toLowerCase();
 if(!url){
   const quote=r.quote||r.excerpt||r.fragment||r.text;
   if(quote)return '<div class="world-encounter-artifact world-encounter-writing"><span class="world-kicker">TRACE // WORDS</span><blockquote>'+esc(String(quote).slice(0,420))+'</blockquote></div>';
   return '<div class="world-encounter-artifact"><span class="world-kicker">TRACE // '+esc(type(r))+'</span><div class="world-artifact-mark" aria-hidden="true"></div><p>A piece of the World, waiting to be seen in full.</p></div>';
 }
 if(kind.includes("audio"))return '<div class="world-encounter-media world-encounter-audio"><span class="world-kicker">SOUND</span><audio controls preload="metadata" src="'+esc(url)+'"></audio></div>';
 if(kind.includes("video")||new RegExp("\\.(mp4|webm|mov)(?:$|\\?)","i").test(url))return '<div class="world-encounter-media"><span class="world-kicker">MOVING IMAGE</span><video controls preload="metadata" playsinline src="'+esc(url)+'"></video></div>';
 return '<div class="world-encounter-media"><span class="world-kicker">IMAGE</span><img loading="lazy" src="'+esc(url)+'" alt="" /></div>';
}
function encounterMeta(r){
 const tags=Array.isArray(r.tags)?r.tags.slice(0,6):[];
 return tags.length?'<div class="world-encounter-meta">'+tags.map(function(x){return '<span>'+esc(String(x).replace(/-/g," "))+'</span>';}).join('')+'</div>':'';
}
function liveWorldNode(id){
 const live=window.ESCIE_WORLD_LIVE&&window.ESCIE_WORLD_LIVE.data;
 if(!live)return null;
 const target=String(id||"");
 const candidates=(Array.isArray(live.discoveries)?live.discoveries:[]).map(x=>String(x.record_id||""));
 if(!candidates.includes(target))return null;
 const base=records().find(r=>String(r.id)===target);
 return base||null;
}
function writeWorldHash(hash,mode){
 const method=mode==="push"?"pushState":"replaceState";
 try{history[method](null,"",hash);}catch(_e){location.hash=hash;}
}
function clearWorldTransition(options){
 options=options||{};
 window.clearTimeout(window.__ESCIE_WORLD_RETURN_TIMER);
 state.attentionSince=0;
 state.attentionNoticed=false;
 if(!options.preserveReturn){state.returningFrom=null;state.returnFlash=null;}
}
function openWorldNode(id,options){
 const target=String(id||"").trim();
 if(!target)return;
 options=options||{};
 clearWorldTransition({preserveReturn:!!options.preserveReturn});
 const local=records().find(r=>String(r.id)===target);
 const live=liveWorldNode(target);
 const node=local||live||{id:target,type:"PLACE",title:target.replace(/^world-/,"").replace(/-/g," "),description:"A place in the World."};
 state.selected=target;
 state.attentionSince=Date.now();state.attentionNoticed=false;
 if(!options.preserveTrail)remember(target);
 try{
   state.street=null;
   if(!options.preserveSpatial)state.placeStreet=null;
   const api=window.ESCIE_WORLD_LIVE;
   if(api&&typeof api.navigate==="function")api.navigate(target);
 }catch(_e){}
 const originHash=state.roomOrigin&&state.roomOrigin.placeId?"&world-origin="+encodeURIComponent(String(state.roomOrigin.placeId))+(state.roomOrigin.street&&state.roomOrigin.street.id?"&world-origin-street="+encodeURIComponent(String(state.roomOrigin.street.id)):""):"";
 writeWorldHash("#world-node="+encodeURIComponent(target)+originHash,"push");
 draw();
 focusDetail();
}
function discoveryRail(node){
 const live=liveDiscoveries(node);
 const neighbors=(live.length?live:related(node.id)).slice(0,4);
 if(!neighbors.length)return '<div class="world-discovery-rail"><span class="world-kicker">NO OPEN THREADS YET</span><p>Stay here, or return to the World.</p></div>';
 return '<div class="world-discovery-rail"><div class="world-discovery-head"><span class="world-kicker">FOLLOW THE THREAD</span><p>Something here connects to something else.</p></div><div class="world-discovery-links">'+neighbors.map(function(x){return '<button type="button" class="world-discovery-link" data-node="'+esc(x.node.id)+'"><span class="world-kicker">'+esc(x.r&&x.r.type?String(x.r.type).replace(/_/g," "):"related")+'</span><strong>'+esc(title(x.node))+'</strong><span aria-hidden="true">↗</span></button>';}).join('')+'</div></div>';
}
function roomContents(room){
 const live=liveContents();
 if(live.length)return live.map(function(x){return x.node;});
 const all=records().filter(function(r){return r&&String(r.id)!==String(room.id);});
 const linked=related(room.id).map(function(x){return x.node;});
 const tagged=all.filter(function(r){const tags=Array.isArray(r.tags)?r.tags.map(String):[];return tags.includes(String(room.id))||tags.includes(String(room.slug||room.id));});
 const seen=new Set(),out=[]; linked.concat(tagged).forEach(function(r){if(r&&!seen.has(String(r.id))){seen.add(String(r.id));out.push(r);}}); return out;
}
function roomDetail(room){
 const contents=roomContents(room);
 const live=placeIdentity(room);
 const atmosphere=placeAtmosphere(room,"room");
 const profile=room&&room.profile&&typeof room.profile==="object"?room.profile:{};
 const texture=Array.isArray(profile.texture)?profile.texture:[];
 const anchors=Array.isArray(profile.anchors)?profile.anchors:[];
 const returnedId=state.returningFrom;
 const returnedObject=returnedId?contents.find(function(x){return String(x.id)===String(returnedId)}):null;
 const items=contents.map(function(r){
   const kind=type(r),label=kind==="MUSIC"?"MUSIC":kind==="ART"?"ART":kind==="PERSON"?"PERSON":kind==="MOMENT"?"MOMENT":kind;
   const returned=returnedId&&String(r.id)===String(returnedId);
   return '<button type="button" class="world-room-item'+(returned?' world-room-item-returned':'')+'" data-node="'+esc(r.id)+'">'+(returned?'<span class="world-room-return-mark" aria-hidden="true">RETURNED</span>':'')+'<span class="world-room-item-kind">'+esc(label)+'</span><strong>'+esc(title(r))+'</strong><small>'+esc(r.description||r.summary||"A piece of life in this room.")+'</small></button>';
 }).join('');
 const presence=contents.slice(0,6).map(function(r,i){
   const kind=String(type(r)||"OBJECT").toUpperCase();
   const label=kind==="OBJECT"?"OBJECT":kind;
   const returned=String(r.id)===String(returnedId);
   return '<span class="world-room-presence-item'+(returned?' world-room-presence-returned':'')+'" data-presence-index="'+i+'">'+(returned?'<span class="world-room-presence-return-mark">RETURNED</span>':'')+'<i aria-hidden="true"></i><b>'+esc(label)+'</b><span>'+esc(title(r))+'</span></span>';
 }).join('');
 const placeLabel=roomNeighborhood[String(room.id)]||"PLACE";
 const temporal=temporalMarkup(room);
const returnNotice=state.returnFlash&&state.returningFrom?'<div class="world-room-return-notice" role="status"><span class="world-kicker">RETURN</span><strong>BACK IN '+esc(live.name||title(room))+'</strong><p>You came back from '+esc(returnedObject?title(returnedObject):"the object")+'.</p></div>':'';
 const textureLine=texture.length?texture.map(function(x){return '<span>'+esc(String(x).replace(/-/g," "))+'</span>';}).join(''):'';
 const anchorLine=anchors.length?anchors.map(function(x){return '<span>'+esc(x)+'</span>';}).join(''):'';
 return `<div class="world-room-scene">${returnNotice}
   <div class="world-room-threshold"><button type="button" class="world-home-return" data-node="world-montreal">← ${esc(state.roomOrigin&&state.roomOrigin.place?title(state.roomOrigin.place):"MONTRÉAL")}</button><span class="world-kicker">MONTRÉAL / ${esc(roomNeighborhood[String(room.id)]||"PLACE")}</span><span class="world-kicker">${temporal}</span><span class="world-kicker">A ROOM IN THE HOME</span><h3 data-no-translate class="record-identity">${esc(title(room))}</h3><p>${esc(room.description||"A room in the Montréal home.")}</p></div>
   <div class="world-room-place" data-atmosphere-character="${esc(atmosphere.character)}" data-atmosphere-layer="${esc(atmosphere.layer)}" data-world-celestial-surface><div class="world-room-place-image" data-world-celestial-surface aria-hidden="true"><span></span><span></span><span></span></div><div class="world-room-place-copy"><span class="world-kicker">PLACE</span><strong>${esc(live.role||room.profile&&room.profile.role||"LIVED PLACE")}</strong><p>${esc(atmosphere.light+" · "+atmosphere.surface+" · "+atmosphere.sound)}</p></div></div>
   <div class="world-room-presence"><div class="world-room-presence-head"><span class="world-kicker">PRESENCE</span><p>The room is not a list. Look around first.</p></div><div class="world-room-presence-field">${presence||'<span class="world-room-presence-empty">Nothing is visibly present yet.</span>'}</div></div>
   <div class="world-room-details"><span class="world-kicker">THE AIR</span><div class="world-room-tags"><span>${esc(atmosphere.weather)}</span><span>${esc(atmosphere.temperature==null?"":String(atmosphere.temperature)+"°")}</span><span>${esc(atmosphere.signal)}</span></div></div>
   ${textureLine?'<div class="world-room-details"><span class="world-kicker">TEXTURE</span><div class="world-room-tags">'+textureLine+(anchorLine?anchorLine:'')+'</div></div>':''}
   <div class="world-room-life"><div class="world-room-life-head"><span class="world-kicker">WHAT LIVES HERE</span><p>People, moments, art, music, objects and traces appear as they are added to this place.</p></div>${items||'<div class="world-empty">Nothing has been opened here yet.</div>'}</div>
   ${contents.length?'<div class="world-room-next"><span class="world-kicker">NOTICE</span><p>Nothing here asks to be solved. Notice what is present, then choose where to look.</p></div>':''}</div>`;
}
function temporalContext(r){
 const explicit=r&&r.temporal_state||r&&r.time_state||r&&r.temporalState||null;
 if(explicit)return {state:String(explicit).toUpperCase(),field:"explicit",value:null,known:true};
 const now=Date.now();
 const candidates=["date","moment_date","event_date","release_date","occurred_at","created_at","updated_at"];
 let raw=null,field=null;
 for(const key of candidates){if(r&&r[key]){raw=r[key];field=key;break;}}
 if(!raw)return {state:"NOW",field:null,value:null,known:false};
 const t=Date.parse(String(raw));
 if(Number.isNaN(t))return {state:"DOCUMENTED",field:field,value:String(raw),known:true};
 const delta=t-now;
 let state="DOCUMENTED";
 if(Math.abs(delta)<86400000)state="NOW";
 else if(delta>0)state="AFTER";
 else if(delta<0)state="BEFORE";
 return {state:state,field:field,value:String(raw),known:true};
}
function temporalMarkup(r){
 const t=temporalContext(r);
 if(!t.known)return '<span class="world-time-state">NOW</span>';
 return '<span class="world-time-state" data-temporal-state="'+esc(t.state)+'">'+esc(t.state)+'</span>';
}
function encounterContext(r){
 const parts=[];
 const place=r.place||r.location||r.city||r.neighborhood;
 const date=r.date||r.release_date||r.moment_date||r.created_at;
 if(place)parts.push('<span><b>WHERE</b>'+esc(String(place))+'</span>');
 if(date)parts.push('<span><b>WHEN</b>'+esc(String(date))+'</span>');
 if(r.source)parts.push('<span><b>SOURCE</b>'+esc(String(r.source))+'</span>');
 return parts.length?'<div class="world-encounter-context">'+parts.join('')+'</div>':'';
}
function objectDetail(r){
 const temporal=temporalMarkup(r);
 const attentionCueText=attentionCue(r.id);
 const object=liveObjectContext()||{};
 const liveOrigin=object.origin||{};
 const contextualOrigin=state.roomOrigin&&state.roomOrigin.place?state.roomOrigin.place:null;
 const origin=contextualOrigin||liveOrigin;
 const originId=contextualOrigin?String(contextualOrigin.id):object.originRecordId||null;
 const originLabel=origin.name||title(origin)||"THE PLACE";
 const originKind=contextualOrigin?"ROOM":"PLACE";
 const originNeighborhood=contextualOrigin?roomNeighborhood[String(origin.id)]:"";
 const originPath=contextualOrigin?"MONTRÉAL / "+(originNeighborhood?String(originNeighborhood).toUpperCase()+" / ":"")+String(originLabel).toUpperCase():"MONTRÉAL / "+String(originLabel).toUpperCase();
 const links=related(r.id);
 const connections=links.length?links.map(x=>{
   const relation=String(x.r.type||"related").replace(/_/g," ");
   const reason=relation==="related"?"something nearby in the World":relation;
   return '<button type="button" data-node="'+esc(x.node.id)+'"><span class="world-kicker">'+esc(relation.toUpperCase())+'</span><strong>'+esc(title(x.node))+'</strong><small>'+esc(reason)+'</small></button>';
 }).join(""):'<span class="world-empty">Nothing is explicitly connected to this object yet.</span>';
 const connectionHint=links.length?'<p class="world-object-connection-hint">Connections are invitations, not instructions. You decide whether this thread matters.</p>':'';
 const notice=object.notice||String(r.description||"").trim();
 const presence=object.presence||"PRESENT";
 const attention=attentionRecord(r.id);
 const reinterpretation=attention.count>1?'<div class="world-reinterpretation" role="note"><span class="world-kicker">LOOK AGAIN</span><p>You have returned to this. The World has not changed its meaning for you. You may have.</p></div>':attention.count===1?'<div class="world-reinterpretation" role="note"><span class="world-kicker">SECOND LOOK</span><p>What you noticed before does not have to be what you notice now.</p></div>':"";
 const rawContext=object.context&&typeof object.context==="object"?object.context:{};
 const depthKeys=Object.keys(rawContext).filter(function(k){return !["notice","context"].includes(String(k).toLowerCase())}).slice(0,4);
 const depthFacts=depthKeys.map(function(k){return '<span><b>'+esc(String(k).replace(/_/g," ").toUpperCase())+'</b>'+esc(String(rawContext[k]??""))+'</span>';}).join("");
 const depthFactsBlock=depthFacts?'<div class="world-object-depth-facts">'+depthFacts+'</div>':'';
 const objectId=String(r.id||"").toLowerCase();
 const objectKind=objectId.includes("window")?"WINDOW":objectId.includes("key")?"KEY":objectId.includes("nightlight")?"NIGHTLIGHT":objectId.includes("chair")?"CHAIR":"OBJECT";
 const sensory={
   WINDOW:["LOOK THROUGH","light / weather / outside","the boundary does not explain what is beyond it."],
   KEY:["HOLD","weight / metal / touch","an object can belong somewhere without telling you where."],
   NIGHTLIGHT:["STAY WITH","glow / darkness / safety","small light changes the shape of a room."],
   CHAIR:["PAUSE","absence / fabric / position","someone can leave a presence behind."]
 }[objectKind]||["NOTICE","surface / weight / memory","ordinary things can remain ordinary."];
 const returnButton=originId?'<button type="button" class="world-object-return" data-return-node="'+esc(originId)+'" data-return-from="'+esc(r.id)+'">← RETURN TO '+esc(originLabel).toUpperCase()+'</button>':'<button type="button" class="world-object-return" data-close-node>← RETURN TO THE WORLD</button>';
 return '<div class="world-object-encounter world-object-'+objectKind.toLowerCase()+'" aria-live="polite">'+reinterpretation
   +'<div class="world-object-threshold">'+returnButton+'<span class="world-kicker">'+attentionCueText+'</span><span class="world-kicker">'+temporal+'</span><span class="world-kicker">OBJECT // '+esc(objectKind)+' // ENCOUNTER</span><span class="world-object-presence">'+esc(presence)+'</span><h3 data-no-translate class="record-identity">'+esc(title(r))+'</h3><p class="world-object-line">'+esc(r.description||"An ordinary thing, carrying more than it explains.")+'</p></div>'
   +'<div class="world-object-body"><div class="world-object-mark" aria-hidden="true"><span></span><span></span><span></span></div><div class="world-object-copy"><span class="world-kicker">'+esc(sensory[0])+'</span><p>'+esc(notice||sensory[2])+'</p><small class="world-object-sense">'+esc(sensory[1])+'</small></div></div>'
   +'<div class="world-object-origin"><span class="world-kicker">YOU ARE HERE</span><div class="world-object-origin-line"><span class="world-object-origin-dot" aria-hidden="true"></span><span>'+esc(originPath)+'</span><span class="world-object-origin-type">'+esc(originKind)+'</span></div></div>'
   +'<div class="world-object-context"><div><span class="world-kicker">WHERE IT WAS FOUND</span><strong>'+esc(originLabel)+'</strong><small>the room remains behind you</small></div><div><span class="world-kicker">PRESENCE</span><strong>'+esc(presence.replace(/_/g," "))+'</strong><small>how it sits in the room</small></div></div>'
   +'<div class="world-object-depth"><span class="world-kicker">GO DEEPER</span><p>Stay with the object before following anything else.</p>'+depthFactsBlock+discoveryRail(r)+'</div>'
   +'<div class="world-object-connections"><span class="world-kicker">WHAT THIS TOUCHES · '+links.length+'</span>'+connectionHint+'<div class="world-connections">'+connections+'</div></div>'
   +'<div class="world-object-return-bottom">'+returnButton+'</div>'
   +'</div>';
}
function homePlaceDetail(place){
 const atmosphere=placeAtmosphere(place,"neighborhood");
 const neighborhoods=homeNeighborhoods();
 const live=placeIdentity(place);
 const roomCards=neighborhoods.map(function(place){
   return '<button type="button" class="world-room world-neighborhood-entry" data-node="'+esc(place.id)+'"><span class="world-room-mark" aria-hidden="true"></span><div><span class="world-kicker">NEIGHBORHOOD</span><strong>'+esc(title(place))+'</strong><p>'+esc(place.description||"A Montréal neighborhood in the World.")+'</p></div><span class="world-arrow" aria-hidden="true">↗</span></button>';
 }).join("");
 return '<div class="world-home-place">'+
   '<div class="world-home-place-threshold"><button type="button" class="world-home-return" data-close-node>← WORLD</button><span class="world-kicker">HOME // MONTRÉAL</span><h3 data-no-translate class="record-identity">'+esc(live.name||title(place)||"MONTRÉAL")+'</h3><p>'+esc(place.description||"The place where ESCIE\'s world and the wider world meet.")+'</p></div>'+
   '<div class="world-home-place-atmosphere" data-atmosphere-character="'+esc(atmosphere.character)+'" data-atmosphere-layer="'+esc(atmosphere.layer)+'" data-world-celestial-surface><span class="world-kicker">RIGHT NOW</span><strong>'+esc(atmosphere.weather)+'</strong><span>'+esc(atmosphere.light)+' · '+esc(atmosphere.surface)+' · '+esc(atmosphere.sound)+'</span></div>'+
   '<div class="world-home-place-copy"><span class="world-kicker">HOME IS A PLACE, NOT A BORDER</span><p>Montréal is where this World is entered from. Streets, rooms, people, memories and everything beyond them can continue outward.</p></div>'+
   '<div class="world-home-rooms"><div class="world-room-life-head"><span class="world-kicker">ENTER THE CITY</span><p>Start with a neighborhood. Streets lead to places, and places lead inside.</p></div>'+roomCards+'</div>'+
   '<div class="world-home-place-outside"><span class="world-kicker">BEYOND HOME</span><button type="button" data-outside-world><strong>THE WORLD CONTINUES</strong><small>Leave Montréal without leaving the World.</small></button></div>'+
 '</div>';
}
function cityStreetNodes(district){
 const city=window.ESCIE_WORLD_CITY||{};
 const groups=city.streetNodes||{};
 const key=String(district||"").toUpperCase();
 return Array.isArray(groups[key])?groups[key]:[];
}
function cityStreetContext(district,nodeId){
 const city=window.ESCIE_WORLD_CITY||{};
 const fn=city.streetContext;
 if(typeof fn==="function")return fn(district,nodeId);
 const node=cityStreetNodes(district).find(function(x){return String(x.id)===String(nodeId);});
 return node?{district:String(district||"").toUpperCase(),node:node.id,label:node.label,type:node.type,station:node.station||null}:null;
}
function neighborhoodPlaceRecords(place){
 const all=coll("ESCIE_LOCATIONS",[]).concat(coll("ESCIE_LIVE_RECORDS",[]),coll("ESCIE_ARCHIVE",[]));
 return all.filter(function(r){
   if(!r||!isPublicWorldRecord(r))return false;
   const tags=Array.isArray(r.tags)?r.tags.map(function(x){return String(x).toLowerCase();}):[];
   const hay=[r.id,r.slug,r.title,r.name,r.neighborhood,r.district,r.street,r.address].map(function(x){return String(x||"").toLowerCase();}).join(" ");
   return hay.includes(String(place.id||"").toLowerCase())||hay.includes(String(title(place)).toLowerCase())||tags.includes(String(place.id||"").toLowerCase());
 });
}
function streetPlaceRecords(place,street){
 const candidates=neighborhoodPlaceRecords(place);
 const label=String(street.label||"").toLowerCase();
 const id=String(street.id||"").toLowerCase();
 return candidates.filter(function(r){
   const tags=Array.isArray(r.tags)?r.tags.map(function(x){return String(x).toLowerCase();}):[];
   const hay=[r.id,r.slug,r.title,r.name,r.street,r.address,r.place].map(function(x){return String(x||"").toLowerCase();}).join(" ");
   return hay.includes(label)||hay.includes(id)||tags.includes(label)||tags.includes(id);
 });
}
function placeRecordDetail(place,street){
 const atmosphere=placeAtmosphere(place,"place");
const temporal=temporalMarkup(place);
 const live=placeIdentity(place);
 const contents=roomContents(place);
 const rooms=contents.filter(function(r){return String(type(r)).toUpperCase()==="ROOM"||String(r.kind||"").toUpperCase()==="ROOM";});
 const objects=contents.filter(function(r){return String(type(r)).toUpperCase()==="OBJECT"||String(r.kind||"").toUpperCase()==="OBJECT";});
 const deeper=rooms.length?rooms:contents.filter(function(r){return objects.indexOf(r)===-1;});
 const roomCards=rooms.slice(0,8).map(function(r){
   return '<button type="button" class="world-room world-place-child" data-node="'+esc(r.id)+'"><span class="world-room-mark" aria-hidden="true"></span><div><span class="world-kicker">ROOM</span><strong>'+esc(title(r))+'</strong><p>'+esc(r.description||"A lived space inside "+title(place)+".")+'</p></div><span class="world-arrow" aria-hidden="true">↗</span></button>';
 }).join("");
 const objectCards=objects.slice(0,8).map(function(r){
   return '<button type="button" class="world-room world-place-child world-place-object" data-node="'+esc(r.id)+'"><span class="world-room-mark" aria-hidden="true"></span><div><span class="world-kicker">OBJECT</span><strong>'+esc(title(r))+'</strong><p>'+esc(r.description||"An object present in "+title(place)+".")+'</p></div><span class="world-arrow" aria-hidden="true">↗</span></button>';
 }).join("");
 const fallback=(!rooms.length&&!objects.length&&deeper.length)?deeper.slice(0,8).map(function(r){
   return '<button type="button" class="world-room world-place-child" data-node="'+esc(r.id)+'"><span class="world-room-mark" aria-hidden="true"></span><div><span class="world-kicker">'+esc(type(r)||"WORLD OBJECT")+'</span><strong>'+esc(title(r))+'</strong><p>'+esc(r.description||"Something present inside "+title(place)+".")+'</p></div><span class="world-arrow" aria-hidden="true">↗</span></button>';
 }).join(""):"";
 const sections=(roomCards?'<div class="world-place-inside-section"><div class="world-room-life-head"><span class="world-kicker">ROOMS</span><p>Enter the lived space. The World narrows again from here.</p></div>'+roomCards+'</div>':"")+
   (objectCards?'<div class="world-place-inside-section"><div class="world-room-life-head"><span class="world-kicker">PRESENT OBJECTS</span><p>Objects can be encountered without becoming another menu.</p></div>'+objectCards+'</div>':"")+
   (fallback?'<div class="world-place-inside-section"><div class="world-room-life-head"><span class="world-kicker">INSIDE</span></div>'+fallback+'</div>':"");
 return '<div class="world-home-place world-place-detail">'+
   '<div class="world-home-place-threshold"><button type="button" class="world-home-return" data-street-return="'+esc(state.street&&state.street.placeId||"")+'" data-street-id="'+esc(state.street&&state.street.node&&state.street.node.id||"")+'">← '+esc(street&&street.label||"STREET")+'</button><span class="world-kicker">MONTRÉAL / '+esc(street&&street.label||"STREET")+'</span><span class="world-kicker">'+temporal+'</span><span class="world-kicker">PLACE / BUILDING</span><h3 data-no-translate class="record-identity">'+esc(live.name||title(place))+'</h3><p>'+esc(place.description||"A public place in the World.")+'</p></div>'+
   '<div class="world-home-place-atmosphere" data-atmosphere-character="'+esc(atmosphere.character)+'" data-atmosphere-layer="'+esc(atmosphere.layer)+'" data-world-celestial-surface><span class="world-kicker">RIGHT NOW</span><strong>'+esc(atmosphere.weather)+'</strong><span>'+esc(atmosphere.light)+' · '+esc(atmosphere.surface)+' · '+esc(atmosphere.sound)+'</span></div>'+
   '<div class="world-home-place-copy"><span class="world-kicker">PLACE CONTEXT</span><p>'+esc(live.role||"A place within the street.")+'</p></div>'+
   '<div class="world-home-rooms"><div class="world-room-life-head"><span class="world-kicker">INSIDE</span><p>Rooms and public World objects appear only when they are actually attached to this place.</p></div>'+sections+(sections?"":'<div class="world-empty">Nothing deeper has been opened here yet.</div>')+'</div>'+
 '</div>';
}
function streetDetail(place,street){
 const atmosphere=placeAtmosphere(place,"place");
 const context=cityStreetContext(title(place),street.id)||street;
 const district=String(place.id||title(place)).toUpperCase();
 const city=window.ESCIE_WORLD_CITY||{};
 const edges=(city.streetEdges&&city.streetEdges[district])||[];
 const neighbors=[];
 edges.forEach(function(edge){
   if(!Array.isArray(edge))return;
   if(String(edge[0])===String(street.id))neighbors.push(edge[1]);
   if(String(edge[1])===String(street.id))neighbors.push(edge[0]);
 });
 const nodes=cityStreetNodes(district);
 const nearby=neighbors.map(function(id){return nodes.find(function(n){return String(n.id)===String(id);});}).filter(Boolean);
 const places=streetPlaceRecords(place,street);
 const placeCards=places.length?places.slice(0,8).map(function(r){
   return '<button type="button" class="world-room world-street-place" data-node="'+esc(r.id)+'"><span class="world-room-mark" aria-hidden="true"></span><div><span class="world-kicker">PLACE / BUILDING</span><strong>'+esc(title(r))+'</strong><p>'+esc(r.description||"A place on "+street.label+".")+'</p></div><span class="world-arrow" aria-hidden="true">↗</span></button>';
 }).join(""):'<div class="world-empty">No public place is attached to this street yet.</div>';
 const neighborCards=nearby.length?nearby.map(function(n){
   return '<button type="button" class="world-street-neighbor" data-street-id="'+esc(n.id)+'" data-street-district="'+esc(district)+'"><span class="world-kicker">'+esc(n.type||"STREET")+'</span><strong>'+esc(n.label)+'</strong><span aria-hidden="true">↗</span></button>';
 }).join(""):'<span class="world-empty">This street has no adjacent public street recorded yet.</span>';
 return '<div class="world-home-place world-street-detail">'+
   '<div class="world-home-place-threshold"><button type="button" class="world-home-return" data-neighborhood-id="'+esc(place.id)+'">← '+esc(title(place))+'</button><span class="world-kicker">MONTRÉAL / '+esc(title(place))+'</span><span class="world-kicker">STREET</span><h3 data-no-translate class="record-identity">'+esc(street.label)+'</h3><p>A street-level threshold inside '+esc(title(place))+'.</p></div>'+
   '<div class="world-home-place-atmosphere" data-atmosphere-character="'+esc(atmosphere.character)+'" data-atmosphere-layer="'+esc(atmosphere.layer)+'" data-world-celestial-surface><span class="world-kicker">RIGHT NOW</span><strong>'+esc(atmosphere.weather)+'</strong><span>'+esc(atmosphere.light)+' · '+esc(atmosphere.surface)+' · '+esc(atmosphere.sound)+'</span></div>'+
   '<div class="world-home-place-copy"><span class="world-kicker">STREET CONTEXT</span><p>'+esc((context.classification||context.type||street.type||"STREET"))+(context.station?" · METRO / "+String(context.station):"")+(context.speed?" · "+String(context.speed)+" KM/H":"")+'</p></div>'+
   '<div class="world-home-rooms"><div class="world-room-life-head"><span class="world-kicker">PLACES ON THIS STREET</span><p>Only public records actually attached to this street appear here.</p></div>'+placeCards+'</div>'+
   '<div class="world-home-rooms world-street-neighbors"><div class="world-room-life-head"><span class="world-kicker">CONTINUE</span><p>Move to an adjacent street when one is part of the canonical city graph.</p></div><div class="world-street-neighbor-grid">'+neighborCards+'</div></div>'+
 '</div>';
}
function neighborhoodDetail(place){
 const atmosphere=placeAtmosphere(place,"place");
 const childIds=neighborhoodRooms[String(place.id)||""]||[];
 const all=coll("ESCIE_LOCATIONS",[]).concat(coll("ESCIE_LIVE_RECORDS",[]),coll("ESCIE_ARCHIVE",[]));
 const children=childIds.map(function(id){return all.find(function(x){return x&&String(x.id)===String(id);});}).filter(Boolean);
 const streets=cityStreetNodes(title(place));
 const live=placeIdentity(place);
 const childCards=children.length?children.map(function(room){
   return '<button type="button" class="world-room world-neighborhood-child" data-node="'+esc(room.id)+'"><span class="world-room-mark" aria-hidden="true"></span><div><span class="world-kicker">PLACE INSIDE</span><strong>'+esc(title(room))+'</strong><p>'+esc(room.description||"A place inside "+title(place)+".")+'</p></div><span class="world-arrow" aria-hidden="true">↗</span></button>';
 }).join(""):'<div class="world-empty">Nothing inside this neighborhood has been opened publicly yet.</div>';
 const streetCards=streets.length?streets.map(function(street){
   return '<button type="button" class="world-room world-neighborhood-street" data-street-id="'+esc(street.id)+'" data-street-district="'+esc(String(place.id||title(place)).toUpperCase())+'"><span class="world-room-mark" aria-hidden="true"></span><div><span class="world-kicker">'+esc(street.type||"STREET")+'</span><strong>'+esc(street.label)+'</strong><p>'+esc(street.station?"Transit / "+street.station:"A street in "+title(place)+".")+'</p></div><span class="world-arrow" aria-hidden="true">↗</span></button>';
 }).join(""):'<div class="world-empty">The street layer has not been opened for this neighborhood yet.</div>';
 return '<div class="world-home-place world-neighborhood-place">'+
   '<div class="world-home-place-threshold"><button type="button" class="world-home-return" data-node="world-montreal">← MONTRÉAL</button><span class="world-kicker">NEIGHBORHOOD // MONTRÉAL</span><h3 data-no-translate class="record-identity">'+esc(live.name||title(place))+'</h3><p>'+esc(place.description||"A neighborhood in the Montréal home.")+'</p></div>'+
   '<div class="world-home-place-atmosphere" data-atmosphere-character="'+esc(atmosphere.character)+'" data-atmosphere-layer="'+esc(atmosphere.layer)+'" data-world-celestial-surface><span class="world-kicker">RIGHT NOW</span><strong>'+esc(atmosphere.weather)+'</strong><span>'+esc(atmosphere.light)+' · '+esc(atmosphere.surface)+' · '+esc(atmosphere.sound)+'</span></div>'+
   '<div class="world-home-place-copy"><span class="world-kicker">STREET LEVEL</span><p>Neighborhoods are the rooms of Montréal. From here, the World can narrow to a street, a building, or somewhere lived inside.</p></div>'+
   '<div class="world-home-rooms"><div class="world-room-life-head"><span class="world-kicker">STREETS</span><p>Walk into a real street node from the Montréal city graph.</p></div>'+streetCards+'</div>'+
   '<div class="world-home-rooms"><div class="world-room-life-head"><span class="world-kicker">PLACES WITHIN</span><p>Follow a place inward. Nothing here has to be a clue.</p></div>'+childCards+'</div>'+
 '</div>';
}
function detail(r){
 if(r&&state.street&&String(state.street.placeId)===String(r.id)&&state.street.node&&String(r.id)===String(state.street.placeId))return streetDetail(r,state.street.node);
 if(r&&state.placeStreet&&String(state.placeStreet.placeId)===String(r.id))return placeRecordDetail(r,state.placeStreet.place,state.placeStreet.street);
 if(r&&String(r.id)==="world-montreal")return homePlaceDetail(r);
 if(r&&(String(r.id)==="little-italy"||String(r.id)==="parc-extension"))return neighborhoodDetail(r);
 if(r&&String(type(r)).toUpperCase()==="OBJECT")return objectDetail(r);
 const roomIds=["world-apartment","world-street-corner","world-parc-extension"];
 if(r&&roomIds.includes(String(r.id)))return roomDetail(r);
 const symbol=r&&String(r.id||"").indexOf("symbol-")===0?coll("ESCIE_SYMBOLS").find(x=>x&&String(x.id)===String(r.id)):null;
 if(symbol){
   const trail=coll("ESCIE_LIVE_RECORDS").concat(coll("ESCIE_MUSIC"),coll("ESCIE_ARCHIVE"),coll("ESCIE_INVESTIGATION")).filter(x=>x&&Array.isArray(x.symbols)&&x.symbols.includes(symbol.id));
   return '<aside class="world-detail" aria-live="polite"><div class="world-detail-head"><div><span class="world-kicker">MOTIF // RECURRING</span><h3 data-no-translate class="record-identity">'+esc(symbol.name||"SYMBOL")+'</h3></div><button type="button" class="world-close" data-close-node aria-label="Close symbol">×</button></div><div class="world-detail-meta"><span>'+esc(symbol.status||"RECURRING")+'</span><span>'+esc((symbol.placements||[]).join(" / ")||"UNPLACED")+'</span></div><p>'+esc(symbol.motif||"Meaning intentionally left open.")+'</p><div class="world-kicker">PUBLIC RECORD LINKS · '+trail.length+'</div><div class="world-connections">'+(trail.length?trail.map(x=>'<button type="button" data-node="'+esc(x.id)+'"><strong>'+esc(title(x))+'</strong><small>carries motif</small></button>').join(""):'<span class="world-empty">No public record is explicitly carrying this motif yet.</span>')+'</div><div class="world-detail-actions"><button type="button" data-copy-node>COPY NODE LINK</button></div></aside>';
 }
 const links=related(r.id);
 const connections=links.length?links.map(x=>'<button type="button" data-node="'+esc(x.node.id)+'"><strong>'+esc(title(x.node))+'</strong><small>'+esc(x.r.type||"related")+'</small></button>').join(""):'<span class="world-empty">No public connection recorded yet.</span>';
 return '<aside class="world-detail" aria-live="polite"><div class="world-detail-head"><div><span class="world-kicker">ENCOUNTER // '+esc(type(r))+'</span><h3 data-no-translate class="record-identity">'+esc(title(r))+'</h3></div><button type="button" class="world-close" data-close-node aria-label="Close node">×</button></div><div class="world-detail-meta"><span>'+esc(String(r.certainty||"UNKNOWN").toUpperCase())+'</span><span>'+esc(String(r.status||"UNKNOWN").toUpperCase())+'</span></div>'+mediaPreview(r)+encounterContext(r)+'<p class="world-encounter-description">'+esc(r.description||r.summary||r.story||"No public description yet.")+'</p>'+encounterMeta(r)+'<div class="world-kicker">WHAT CONNECTS HERE · '+links.length+'</div><div class="world-connections">'+connections+'</div>'+discoveryRail(r)+'<div class="world-detail-actions"><button type="button" data-focus-search>SEARCH THIS NODE</button><button type="button" data-copy-node>COPY NODE LINK</button></div><div class="world-path"><span class="world-kicker">YOUR PATH</span><div id="world-path-items">START HERE</div></div></aside>';
}
function graphView(rows){
 const map=new Map(rows.map(r=>[String(r.id),r]));
 const edges=rels().filter(x=>map.has(String(x.from))&&map.has(String(x.to)));
 const nodes=rows.slice(0,80).map(r=>'<button type="button" class="world-graph-node" data-node="'+esc(r.id)+'"><i></i><span>'+esc(title(r))+'</span><small>'+esc(type(r))+'</small></button>').join("");
 return '<div class="world-graph"><div class="world-graph-note"><span class="world-kicker">RELATIONSHIP GRAPH</span><strong>'+rows.length+' nodes · '+edges.length+' public edges</strong></div><div class="world-graph-grid">'+nodes+'</div></div>';
}
function trails(rows){
 const map=new Map(rows.map(r=>[String(r.id),r])),adj=new Map();
 rels().forEach(x=>{if(map.has(String(x.from))&&map.has(String(x.to))){if(!adj.has(String(x.from)))adj.set(String(x.from),[]);if(!adj.has(String(x.to)))adj.set(String(x.to),[]);adj.get(String(x.from)).push(x.to);adj.get(String(x.to)).push(x.from)}});
 const starts=rows.filter(r=>(adj.get(String(r.id))||[]).length).slice(0,6);
 return '<div class="world-list">'+(starts.length?starts.map(s=>{const ns=(adj.get(String(s.id))||[]).map(id=>map.get(String(id))).filter(Boolean).slice(0,3);return '<article class="world-card"><div class="world-card-main"><span class="world-kicker">TRAILHEAD</span><h3 data-no-translate class="record-identity">'+esc(title(s))+'</h3><p>'+ns.map(n=>'<button type="button" class="inline-node" data-node="'+esc(n.id)+'">'+esc(title(n))+'</button>').join(" · ")+'</p></div><span class="world-arrow">→</span></article>'}).join(''):'<div class="world-intro"><p>Trails appear as public relationships accumulate.</p></div>')+'</div>';
}
function musicThreadheads(rs){
 return rs.filter(function(r){
   const k=String(r.type||r.kind||r.category||"").toUpperCase();
   return /MUSIC|SONG|TRACK|ALBUM|EP|SINGLE/.test(k) && related(r.id).length>0;
 }).slice(0,8);
}
function musicThreadMarkup(rs){
 const starts=musicThreadheads(rs);
 if(!starts.length)return "";
 const cards=starts.map(function(r){
   return '<button type="button" class="world-trace-music" data-node="'+esc(r.id)+'"><span class="world-kicker">MUSIC</span><strong>'+esc(title(r))+"</strong><small>Start a thread from this record.</small><span aria-hidden=\"true\">↗</span></button>";
 }).join("");
 return '<div class="world-trace-music-layer"><div class="world-trace-subhead"><span class="world-kicker">MUSIC AS A THREADHEAD</span><h4>START WITH A SONG.</h4><p>Music can be a doorway into people, places, moments, objects and memories when a public relationship already exists.</p></div><div class="world-trace-music-list">'+cards+"</div></div>";
}
function traceConstellationMarkup(rs){
 const ids=Array.isArray(state.trail)?state.trail.map(String):[];
 if(ids.length<2)return "";
 const map=new Map(rs.map(function(r){return [String(r.id),r];}));
 const names=ids.map(function(id){return map.get(id);}).filter(Boolean).slice(-9);
 const groups=[],current=[];
 for(let i=0;i<names.length;i++){
  const node=names[i];
  if(!current.length){current.push(node);continue;}
  const prev=current[current.length-1];
  const rel=related(prev.id).find(function(x){return String(x.node.id)===String(node.id);});
  if(rel){current.push(node);}
  else{if(current.length>1)groups.push(current.slice());current.length=0;current.push(node);}
 }
 if(current.length>1)groups.push(current.slice());
 if(!groups.length)return "";
 const points=groups.map(function(group){
   return '<div class="world-trace-constellation-group">'+group.map(function(r){return '<span class="world-trace-constellation-point"><i aria-hidden="true"></i><strong>'+esc(title(r))+'</strong><small>'+esc(type(r))+'</small></span>';}).join("")+'</div>';
 }).join("");
 const pointCount=groups.reduce(function(n,g){return n+g.length;},0);
 const linkCount=groups.reduce(function(n,g){return n+Math.max(0,g.length-1);},0);
 return '<div class="world-trace-constellation"><div class="world-trace-subhead"><span class="world-kicker">CONSTELLATION</span><h4>THE THREAD IS BECOMING A PATTERN.</h4><p>Legitimate connections become visible as your route gathers into connected groups. Wandering can start another thread without pretending the two are related.</p></div><div class="world-trace-constellation-groups">'+points+'</div><div class="world-trace-constellation-meta">'+esc(String(pointCount))+' connected points · '+esc(String(linkCount))+' links · '+esc(String(groups.length))+' thread'+(groups.length===1?'':'s')+'</div></div>';
}
function traceView(){
 const rs=records();
 const steps=state.trail.map((id,i)=>({node:rs.find(r=>String(r.id)===String(id)),index:i})).filter(x=>x.node);
 if(!steps.length)return '<section class="world-trace"><div class="world-trace-empty"><span class="world-kicker">TRACE</span><h3>NOTHING TO REMEMBER YET.</h3><p>Move through the World. Places, objects and encounters will leave a quiet trace here on this device.</p><button type="button" class="world-trace-return" data-world-explore><span class="world-kicker">START</span><strong>RETURN TO THE WORLD</strong></button></div>'+musicThreadMarkup(rs)+'</section>';
 const path=pathContext();
 const trailRows=records();
 const publicTrails=trails(trailRows);
 const items=steps.map(function(x,i){
   const next=steps[i+1];
   const relation=next&&path[i]?path[i].relationship:"";
   return '<button type="button" class="world-trace-step'+(i===steps.length-1?' world-trace-current':'')+'" data-trace-node="'+esc(x.node.id)+'"><span class="world-trace-number">'+String(i+1).padStart(2,"0")+'</span><span class="world-trace-copy"><span class="world-kicker">'+esc(type(x.node))+'</span><strong>'+esc(title(x.node))+'</strong>'+(relation?'<small>'+esc(relation)+'</small>':'')+'</span><span class="world-trace-arrow" aria-hidden="true">↗</span></button>';
 }).join('');
 const constellation=traceConstellationMarkup(rs);
 const trailsMarkup=publicTrails.includes("world-card")?'<div class="world-trace-trails"><div class="world-trace-subhead"><span class="world-kicker">TRAILS</span><h4>WHERE CONNECTIONS LEAD.</h4><p>Public trails emerge from relationships already established in the World.</p></div>'+publicTrails+'</div>':"";
 const music=musicThreadMarkup(rs);
 return '<section class="world-trace"><div class="world-trace-head"><span class="world-kicker">TRACE</span><h3>WHERE YOU HAVE BEEN.</h3><p>This is not a score or a progress bar. It is simply the memory of what you encountered through the World on this device.</p></div><div class="world-trace-path">'+items+'</div><div class="world-trace-foot"><span>'+steps.length+' point'+(steps.length===1?'':'s')+' remembered</span><span class="world-trace-controls">'+(steps.length>1?'<button type="button" class="world-trace-back" data-trace-back>BACK ONE POINT</button>':'')+'<button type="button" class="world-trace-clear" data-trace-clear>CLEAR TRACE</button></span></div>'+constellation+trailsMarkup+music+'</section>';
}
function discoveryReason(current,node,base){if(!current)return "OPEN THREAD";if(base.some(x=>String(x.id)===String(node.id))){const rel=related(current.id).find(x=>String(x.node.id)===String(node.id));return rel&&rel.type?"FOLLOWED FROM "+String(rel.type).replace(/_/g," "):"DIRECT CONNECTION";}if(state.trail.length>1){const previous=records().find(r=>String(r.id)===String(state.trail[state.trail.length-2]));if(previous&&type(node)===type(previous))return "CONTINUES THE THREAD";}if(type(node)===type(current))return "SAME KIND";if(Array.isArray(node.tags)&&Array.isArray(current.tags)&&node.tags.some(t=>current.tags.includes(t)))return "SHARED SIGNAL";return "UNEXPLORED";}
function discovery(rows){const seen=new Set(state.visited.map(String));const current=state.selected?records().find(r=>String(r.id)===String(state.selected)):null;const base=current?related(current.id).map(x=>x.node):[];const pool=base.concat(rows).filter(Boolean).filter(r=>!seen.has(String(r.id)));const scored=pool.map(r=>{const connected=base.some(x=>String(x.id)===String(r.id));let score=connected?10:0;if(current&&type(r)===type(current))score+=2;if(Array.isArray(r.tags)&&current&&Array.isArray(current.tags))score+=r.tags.filter(t=>current.tags.includes(t)).length;return {r,score,connected,reason:discoveryReason(current,r,base)};}).sort((a,b)=>b.score-a.score);const out=[];const usedTypes=new Set();for(const x of scored){if(out.length>=3)break;if(!usedTypes.has(type(x.r))||x.connected){out.push(x);usedTypes.add(type(x.r));}}if(out.length<3)for(const x of scored){if(out.length>=3)break;if(!out.some(y=>String(y.r.id)===String(x.r.id)))out.push(x);}return out;}
function gameMemory(){
 const api=window.ESCIE_GAME_GATEWAY;
 if(!api||typeof api.getMemory!=="function")return null;
 try{return api.getMemory()}catch(e){return null}
}
function gameUnlockedNodes(){const m=gameMemory();if(!m)return [];const keys=Array.isArray(m.world_unlocks)?m.world_unlocks.map(String).filter(x=>x.indexOf("query:")===0).map(x=>x.slice(6).toLowerCase()):[];if(!keys.length)return [];return records().map(r=>{const text=searchText(r);let score=0;keys.forEach(q=>{if(text.includes(q))score+=q.length>=6?3:1;if(String(title(r)).toLowerCase()===q)score+=8});return {r,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,12).map(x=>x.r)}
function playableLayer(){
 const m=gameMemory();
 if(!m)return "";
 const discoveries=Array.isArray(m.discoveries)?m.discoveries:[];
 const unresolved=Array.isArray(m.unresolved)?m.unresolved:[];
 const items=Array.isArray(m.inventory)?m.inventory:[];
 const active=String(m.visited&&m.visited.length?m.visited[m.visited.length-1]:"");
 const parts=[];
 const unlocked=gameUnlockedNodes();
 parts.push('<div class="glass-eye-game-layer"><div><span class="world-kicker">PLAYABLE LAYER</span><h3>WHAT YOU FOUND IN THE GAME</h3><p>Your game memory can point back into the public world. It does not create canon; it only records your route and unresolved threads on this device.</p></div><div class="glass-eye-stats"><div><strong>'+esc(String(m.signals||0))+'</strong><span>SIGNAL</span></div><div><strong>'+esc(String(items.length))+'</strong><span>ITEMS</span></div><div><strong>'+esc(String(discoveries.length))+'</strong><span>DISCOVERIES</span></div><div><strong>'+esc(String(unresolved.length))+'</strong><span>UNRESOLVED</span></div></div>');
 if(active)parts.push('<div class="glass-eye-last"><span class="world-kicker">CURRENT GAME SCENE</span><button type="button" data-game-route="'+esc(active)+'">'+esc(active.replace(/-/g," ").toUpperCase())+' ↗</button></div>');
 if(unlocked.length)parts.push('<div class="world-kicker">UNLOCKED WORLD THREADS</div><div class="glass-eye-discovery">'+unlocked.map(r=>'<button type="button" data-node="'+esc(r.id)+'"><strong>'+esc(title(r))+'</strong><small>GAME UNLOCK · '+esc(type(r))+'</small></button>').join("")+'</div><p class="world-kicker">These are existing public-world records surfaced by your playable path. The game does not create or alter them.</p>');
 if(discoveries.length)parts.push('<div class="world-kicker">DISCOVERED THREADS</div><div class="glass-eye-discovery">'+discoveries.slice(-6).map(id=>'<button type="button" data-game-route="'+esc(id)+'"><strong>'+esc(String(id).replace(/^game-discovery-/,"").replace(/-/g," ").toUpperCase())+'</strong><small>PLAYER DISCOVERY · NOT CANONICAL PROOF</small></button>').join("")+'</div>');
 parts.push('<div class="glass-eye-actions"><button type="button" data-game-open>RETURN TO PLAYABLE LAYER</button></div></div>');
 return parts.join("");
}
function eyePanel(){
 const rows=filtered(),last=state.trail.length?records().find(r=>String(r.id)===String(state.trail[state.trail.length-1])):null,next=discovery(rows);
 const connected=next.filter(x=>x.connected);
 const wander=next.filter(x=>!x.connected);
 const button=x=>"<button type=\"button\" data-node=\""+esc(x.r.id)+"\"><strong>"+esc(title(x.r))+"</strong><small>"+esc(x.reason)+" · "+esc(type(x.r))+"</small></button>";
 const follow=connected.length?"<div class=\"glass-eye-discovery-group\"><span class=\"world-kicker\">FOLLOW THE THREAD</span><p>Established relationships only.</p><div class=\"glass-eye-discovery\">"+connected.map(button).join("")+"</div></div>":"";
 const roam=wander.length?"<div class=\"glass-eye-discovery-group\"><span class=\"world-kicker\">WANDER</span><p>These are nearby discoveries, not established connections.</p><div class=\"glass-eye-discovery\">"+wander.map(button).join("")+"</div></div>":"";
 return "<div id=\"glass-eye-panel\" role=\"region\" aria-label=\"The Glass Eye\" class=\"glass-eye-panel\"><div><span class=\"world-kicker\">GLASS EYE</span><h3>SEE · HEAR · FOLLOW · MISS · RETURN</h3><p>The audience eye. This is your side of the screen. Your path is remembered on this device, but it never becomes canon.</p></div>"+(last?"<div class=\"glass-eye-last\"><span class=\"world-kicker\">LAST SIGNAL</span><button type=\"button\" data-node=\""+esc(last.id)+"\">"+esc(title(last))+"</button></div>":"")+follow+roam+"<div class=\"glass-eye-actions\"><button type=\"button\" data-eye-clear>CLEAR MY PATH</button><button type=\"button\" data-eye-close>CLOSE EYE</button></div></div>";
}
function montrealRecord(){
 const rows=coll("ESCIE_LOCATIONS",[]).filter(r=>r&&String(r.visibility||"").toLowerCase()!=="withheld"&&r.public_disclosure!==false);
 return rows.find(r=>String(r.id||"").toLowerCase()==="montreal")||rows.find(r=>String(r.title||"").toUpperCase()==="MONTRÉAL")||null;
}
function homeNeighborhoods(){
 const locations=coll("ESCIE_LOCATIONS",[]);
 return ["little-italy","parc-extension"].map(id=>locations.find(r=>r&&String(r.id||"")===id)).filter(r=>r&&String(r.visibility||"").toLowerCase()!=="withheld"&&r.public_disclosure!==false);
}
const neighborhoodRooms={"parc-extension":["world-apartment","world-street-corner"],"little-italy":[]};
const roomNeighborhood={"world-apartment":"parc-extension","world-street-corner":"parc-extension","world-parc-extension":"parc-extension"};
function homeRooms(){
 const wanted=["little-italy","parc-extension"];
 const map=new Map(records().map(function(r){return [String(r.id),r];}));
 return wanted.map(function(id){return map.get(id);}).filter(function(r){return r&&isPublicWorldRecord(r);});
}
// Canonical World entry contracts: data-world-tab="places" data-world-tab="people" data-world-tab="moments" href="#art"
// Entry tone: Come in. Look around.
function worldLensMarkup(){
 const lensAttrs={atlas:'data-world-tab="atlas"',objects:'data-world-tab="objects"',people:'data-world-tab="people"',places:'data-world-tab="places"',moments:'data-world-tab="moments"',fragments:'data-world-tab="fragments"',bodies:'data-world-tab="bodies"',proof:'data-world-tab="proof"',path:'data-world-tab="path"',trace:'data-world-tab="trace"',timeline:'data-world-tab="timeline"',symbols:'data-world-tab="symbols"',trails:'data-world-tab="trails"'};
 const primary=[
  ["places","PLACES","world"],
  ["people","PEOPLE","person"],
  ["moments","MOMENTS","moment"]
 ];
 const advanced=state.exploreOpen;
 const closer=[
  ["objects","OBJECTS","world"],
  ["trace","TRACE","web"]
 ];
 return '<div class="world-index-shell">'+
   '<div class="world-discovery-bar">'+
    '<button type="button" class="world-index-toggle" data-world-explore aria-expanded="'+(advanced?"true":"false")+'"><span class="world-kicker">DISCOVER</span><strong>'+(advanced?"LOOK CLOSER":"EXPLORE")+'</strong><span aria-hidden="true">'+(advanced?"−":"+")+'</span></button>'+
    (!advanced?primary.map(function(t){
      const active=state.tab===t[0];
      return '<button type="button" role="tab" class="world-primary-door" '+lensAttrs[t[0]]+' aria-selected="'+(active?"true":"false")+'" aria-label="'+esc(t[1])+'">'+glyph(t[2],t[1])+'<span>'+esc(t[1])+'</span></button>';
    }).join(""):"")+
   '</div>'+
   '<div class="world-lens-nav world-deeper-nav" role="tablist" aria-label="ESCIE World navigation"'+(advanced?"":" hidden")+'>'+
    '<span class="world-deeper-label">LOOK CLOSER</span>'+
    closer.map(function(t){
      const active=state.tab===t[0];
      return '<button type="button" role="tab" aria-selected="'+(active?"true":"false")+'" '+lensAttrs[t[0]]+'>'+glyph(t[2],t[1])+'<span>'+esc(t[1])+'</span></button>';
    }).join("")+
    '<button type="button" class="world-more-door" data-world-more aria-expanded="'+(state.moreOpen?"true":"false")+'"><span>'+(state.moreOpen?"LESS":"MORE")+'</span></button>'+
    (state.moreOpen?tabs.filter(function(t){return !["people","places","moments","trace","path","trails"].includes(t[0]);}).map(function(t){
      const active=state.tab===t[0];
      return '<button type="button" role="tab" aria-selected="'+(active?"true":"false")+'" '+lensAttrs[t[0]]+'>'+glyph(t[2],t[1])+'<span>'+esc(t[1])+'</span></button>';
    }).join(""):"")+ 
   '</div>'+
  '</div>';
}
function lensRows(){
 const map={people:"ESCIE_PEOPLE",places:"ESCIE_LOCATIONS",moments:"ESCIE_MOMENTS",objects:"ESCIE_OBJECTS",fragments:"ESCIE_FRAGMENTS",bodies:"ESCIE_BODIES",proof:"ESCIE_PROOF",path:"ESCIE_PATHS",timeline:"ESCIE_MOMENTS",symbols:"ESCIE_SYMBOLS",trails:"ESCIE_PATHS",trace:"ESCIE_PATHS"};
 const rows=state.tab==="atlas"?records():coll(map[state.tab],[]);
 return rows.filter(function(r){return r&&String(r.visibility||"").toLowerCase()!=="withheld"&&r.public_disclosure!==false;}).slice(0,60);
}
function worldLensContent(){
 if(state.tab==="atlas")return '<div class="world-home-house"><div class="world-home-city"><span class="world-kicker">THE HOME</span><strong>MONTRÉAL</strong><p>MONTRÉAL IS HOME.</p></div></div>';
 if(state.tab==="trace")return traceView();
 const rows=lensRows();
 return '<div class="world-list">'+(rows.length?rows.map(card).join(""):'<div class="world-empty">Nothing has been opened here yet.</div>')+'</div>';
}
function outsideWorldMarkup(){
 if(!state.outsideOpen)return "";
 const homeIds=new Set(["montreal","world-montreal","little-italy","parc-extension","world-parc-extension","world-apartment","world-street-corner"]);
 const places=records().filter(function(r){
   const k=String(type(r)).toUpperCase(),id=String(r.id||"").toLowerCase(),name=title(r).toLowerCase();
   if(!["PLACE","LOCATION"].includes(k)||homeIds.has(id))return false;
   return !name.includes("montréal")&&!name.includes("montreal");
 }).slice(0,8);
 const cards=places.length?places.map(function(r){
   return '<button type="button" class="world-outside-place" data-node="'+esc(r.id)+'"><span class="world-kicker">PLACE</span><strong>'+esc(title(r))+'</strong><small>'+esc(r.description||r.summary||"A place beyond Home.")+'</small><span aria-hidden="true">↗</span></button>';
 }).join(""):'<div class="world-outside-empty"><span class="world-kicker">OPEN SPACE</span><p>The World does not end at Montréal. It simply has not been filled in here yet.</p><small>Places enter this threshold as they become part of the public World.</small></div>';
 return '<section class="world-outside-layer" aria-label="The world beyond Montréal"><div class="world-outside-head"><span class="world-kicker">BEYOND HOME</span><h4>THE WORLD OUTSIDE</h4><p>Montréal is where the World is entered from. It is not where the World ends.</p></div><div class="world-outside-places">'+cards+'</div></section>';
}
function worldHome(){ const returnWelcome=returnWelcomeMarkup(); rememberWorldReturn();
 const city=montrealRecord(),rooms=homeRooms();
 const roomCards=rooms.map(function(room){
   return '<button type="button" class="world-room" data-node="'+esc(room.id)+'"><span class="world-room-mark" aria-hidden="true"></span><div><span class="world-kicker">ROOM</span><strong>'+esc(title(room))+'</strong><p>'+esc(room.description||"A room in the Montréal home.")+'</p></div><span class="world-arrow" aria-hidden="true">↗</span></button>';
 }).join("");
 const currentTab=state.tab!=="atlas";
 const outside=outsideWorldMarkup();
 const returnChange=returnChangeMarkup(); const contentChange=worldContentChangeMarkup(); const returnThread=worldReturnTrailMarkup(); rememberWorldSnapshot(); return '<div class="world-home">'+
   '<div class="world-home-intro"><span class="world-kicker">THE WORLD</span><h3>START HERE</h3><p>Montréal is home. Everything else is still the world.</p></div>'+worldNowMarkup()+returnWelcome+returnChange+contentChange+returnThread+
   (currentTab?worldLensContent():'<div class="world-home-house"><button type="button" class="world-home-city" data-node="world-montreal"><span class="world-kicker">HOME / PLACE</span><strong>'+esc(city&&city.title||"MONTRÉAL")+'</strong><p>WHERE HOME AND THE WORLD INTERTWINE.</p><span class="world-arrow" aria-hidden="true">↗</span></button><div class="world-home-rooms"><div class="world-room-life-head"><span class="world-kicker">WHAT’S HERE</span><p>Look around first. People, places, moments, objects and art can enter through what is actually here.</p></div>'+(roomCards||'<span class="world-empty">Nothing has been opened yet.</span>')+'</div></div>')+

   worldLensMarkup()+
   (currentTab?'':'<button type="button" class="world-home-outside" data-outside-world aria-expanded="'+(state.outsideOpen?"true":"false")+'"><span class="world-kicker">WANDER</span><strong>'+(state.outsideOpen?"COME BACK INSIDE":"THE WORLD CONTINUES")+'</strong><p>'+(state.outsideOpen?"Return to Montréal home.":"Leave the immediate thread and see what exists beyond Home.")+'</p></button>'+outside)+
   (currentTab?'':'<p class="world-home-note">The World gets deeper as you move through it. Nothing here asks you to solve it.</p>')+
 '</div>';
}
function mountWorld(){
 const container=$("world-container"); if(!container)return;
 container.classList.add("world-engine");
 function syncLiveState(){
   const live=window.ESCIE_WORLD_LIVE||{};
   container.dataset.worldLiveStatus=String(live.status||"OFFLINE").toLowerCase();
   if(live.data&&live.data.environment){
     const env=live.data.environment;
     container.dataset.worldWeather=String(env.weather||"UNKNOWN").toLowerCase();
     container.dataset.worldLight=String((env.visual_state&&env.visual_state.light)||env.daylight||"UNKNOWN").toLowerCase();
     container.dataset.worldSeason=String(env.season||"UNKNOWN").toLowerCase();
     container.dataset.worldSurface=String((env.visual_state&&env.visual_state.surface)||"NATURAL").toLowerCase();
   }
 }
 function syncWorldLayer(){
   let layer="home";
   if(state.street&&state.street.node)layer="street";
   else if(state.selected&&["world-apartment","world-street-corner","world-parc-extension"].includes(String(state.selected)))layer="room";
   else if(state.selected&&state.selected!=="world-montreal")layer="place";
   container.dataset.worldLayer=layer;
   const record=state.selected?records().find(function(r){return String(r.id)===String(state.selected);}):null;
   container.dataset.worldOntologyLayer=record?worldLayerFor(record):"EXISTENCE";
container.dataset.worldOntologyCoverage=record?worldLayerCoverage(record).join("|"):"EXISTENCE";
 const celestial=celestialContext();
 container.dataset.worldSun=celestial.sun;
 container.dataset.worldMoon=celestial.moon;
 container.dataset.worldStars=celestial.stars;
 container.dataset.worldSkyPhase=celestial.skyPhase;
 container.dataset.worldMoonIllumination=String(Math.round(celestial.moonIllumination*100));
 container.dataset.worldMoonlight=celestial.moonIllumination<.2?"LOW":celestial.moonIllumination<.65?"MEDIUM":"HIGH";
 container.dataset.worldCelestialLight=celestial.skyPhase==="NIGHT"?(celestial.moonIllumination<.2?"DARK":celestial.moonIllumination<.65?"MOONLIT":"BRIGHT_MOON"):(celestial.skyPhase==="DAWN"||celestial.skyPhase==="DUSK"?"TRANSITION":"DAYLIGHT");
 container.style.setProperty("--world-celestial-contrast",celestial.skyPhase==="NIGHT"?(celestial.moonIllumination<.2?".96":celestial.moonIllumination<.65?"1":"1.025"):(celestial.skyPhase==="DAWN"||celestial.skyPhase==="DUSK"?".985":"1.01"));
 }
 syncLiveState();
 loadTrail();
 refreshWorldClock(container);
 syncAttention(container);
 scheduleWorldRefresh(container);
 window.addEventListener("escie:world-state",function(){syncLiveState();draw();});
 const route=String(location.hash||"");
 const placeMatch=route.match(/(?:world-place=)([^&]+)/);
 const streetMatch=route.match(/(?:world-street=)([^&]+)/);
 const match=route.match(/(?:world-node=)([^&]+)/);
 state.selected=match?safeDecode(match[1]):null;
 if(streetMatch){
   const parts=safeDecode(streetMatch[1]).split(":");
   const placeId=parts.shift()||"";
   const streetId=parts.join(":");
   const place=records().find(function(r){return String(r.id)===String(placeId);});
   const street=place?cityStreetNodes(title(place)).find(function(x){return String(x.id)===String(streetId);}):null;
   if(place&&street){state.selected=String(place.id);state.street={placeId:String(place.id),node:street};}
 }
 if(placeMatch){
   const placeId=safeDecode(placeMatch[1]);
   const place=records().find(function(r){return String(r.id)===String(placeId);});
   if(place){state.selected=String(place.id);state.placeStreet={placeId:String(place.id),place:place,street:null};}
 }
 function attentionRecord(id){
 const key=String(id||"");if(!key)return {count:0,last:0};
 try{
  const raw=JSON.parse(localStorage.getItem("escie_world_attention")||"{}");
  if(raw&&typeof raw==="object"&&!Array.isArray(raw)&&raw[key])return raw[key];
  if(Array.isArray(raw)&&raw.includes(key))return {count:1,last:0};
 }catch(_e){}
 return {count:0,last:0};
}
function attentionMemory(id){return attentionRecord(id).count>0;}
function rememberAttention(id){
 const key=String(id||"");if(!key)return;
 try{
  const raw=JSON.parse(localStorage.getItem("escie_world_attention")||"{}");
  const data=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{};
  const prev=attentionRecord(key);
  data[key]={count:Number(prev.count||0)+1,last:Date.now()};
  const keys=Object.keys(data);
  keys.slice(0,Math.max(0,keys.length-100)).forEach(function(k){delete data[k];});
  localStorage.setItem("escie_world_attention",JSON.stringify(data));
 }catch(_e){}
}
function syncAttention(container){
 const id=String(state.selected||"");
 const count=id?attentionRecord(id).count:0;
 if(container){
  container.dataset.worldAttention=count>1?"LOOK_AGAIN":count===1?"NOTICED_BEFORE":"UNNOTICED";
  container.dataset.worldAttentionCount=String(count);
 }
}
function attentionCue(id){
 const count=attentionRecord(id).count;
 if(count>1)return '<span class="world-attention-memory">LOOK AGAIN</span>';
 if(count===1)return '<span class="world-attention-memory">NOTICED BEFORE</span>';
 return "";
}
function draw(){
   syncWorldLayer();
   if(state.selected){
     const node=records().find(r=>String(r.id)===String(state.selected))||liveWorldNode(state.selected)||(
       String(state.selected)==="world-montreal"?{id:"world-montreal",type:"PLACE",title:"Montréal",description:"Home. The place where the World begins, without being the boundary of it."}:null
     );
     if(node){container.innerHTML=detail(node);focusDetail();restoreWorldFocus();syncAttention(container);return;}
     state.selected=null;
   }
   container.innerHTML=worldHome();
   state.returningFrom=null;
   state.returnFlash=null;
 }
 container.addEventListener("click",function(event){
   state.focusDetailRequest=event.detail===0;
   state.focusRestoreRequest=false;
   const traceBack=event.target.closest("[data-trace-back]");
   if(traceBack){backtrackTrace();return;}
   const traceNode=event.target.closest("[data-trace-node]");
   if(traceNode){const id=traceNode.getAttribute("data-trace-node");if(id){if(state.focusDetailRequest)state.focusOrigin={nodeId:String(id)};openWorldNode(id,{preserveTrail:true});}return;}
   const traceClear=event.target.closest("[data-trace-clear]");
   if(traceClear){state.trail=[];state.visited=[];try{localStorage.removeItem("escie_world_trail");localStorage.removeItem("escie_world_visited")}catch(e){}draw();return;}
   const lens=event.target.closest("[data-world-tab]");
   if(lens){
     state.tab=lens.getAttribute("data-world-tab")||"atlas";
     state.outsideOpen=false;
     state.selected=null;
     writeWorldHash("#world","replace");
     draw();
     return;
   }
   const more=event.target.closest("[data-world-more]");
   if(more){state.moreOpen=!state.moreOpen;draw();return;}
   const explore=event.target.closest("[data-world-explore]");
   if(explore){
     state.exploreOpen=!state.exploreOpen;
     state.outsideOpen=false;
     if(!state.exploreOpen){state.tab="atlas";state.moreOpen=false;}
     state.selected=null;
     history.replaceState(null,"","#world");
     draw();
     return;
   }
   const outside=event.target.closest("[data-outside-world]");
   if(outside){
     state.outsideOpen=!state.outsideOpen;
     state.exploreOpen=false;
     state.moreOpen=false;
     state.tab="atlas";
     state.selected=null;
     history.replaceState(null,"","#world");
     draw();
     return;
   }
   const streetNode=event.target.closest("[data-street-id]");
   if(streetNode){
     const streetId=streetNode.getAttribute("data-street-id");
     const district=streetNode.getAttribute("data-street-district")||"";
     const placeId=state.selected&&records().find(function(r){return String(r.id)===String(state.selected);})?state.selected:null;
     const place=placeId?records().find(function(r){return String(r.id)===String(placeId);}):null;
     const targetPlace=place||records().find(function(r){return String(r.id)===String(district).toLowerCase();})||records().find(function(r){return String(r.id)===String(district);});
     const street=cityStreetNodes(district).find(function(x){return String(x.id)===String(streetId);});
     if(targetPlace&&street){
       state.street={placeId:String(targetPlace.id),node:street};
       state.selected=String(targetPlace.id);
       remember("street:"+String(targetPlace.id)+":"+String(street.id));
       writeWorldHash("#world-street="+encodeURIComponent(String(targetPlace.id)+":"+String(street.id)),"push");
       draw();
       focusDetail();
     }
     return;
   }
   const streetReturn=event.target.closest("[data-street-return]");
   if(streetReturn){
     const placeId=streetReturn.getAttribute("data-street-return")||"";
     const streetId=streetReturn.getAttribute("data-street-id")||"";
     const place=records().find(function(r){return String(r.id)===String(placeId);});
     const street=place?cityStreetNodes(title(place)).find(function(x){return String(x.id)===String(streetId);}):null;
     if(place&&street){
       state.placeStreet=null;
       state.street={placeId:String(place.id),node:street};
       state.selected=String(place.id);
       writeWorldHash("#world-street="+encodeURIComponent(String(place.id)+":"+String(street.id)),"push");
       draw();
       focusDetail();
     }
     return;
   }
   const neighborhoodBack=event.target.closest("[data-neighborhood-id]");
   if(neighborhoodBack){
     const id=neighborhoodBack.getAttribute("data-neighborhood-id");
     state.street=null;
     if(id)openWorldNode(id);
     return;
   }
   const returnNode=event.target.closest("[data-return-node]");
   if(returnNode){
     const id=returnNode.getAttribute("data-return-node");
     const from=returnNode.getAttribute("data-return-from");
     if(id)returnToPlace(id,from);
     return;
   }
   const serendipityNode=event.target.closest("[data-serendipity-node]");
   if(serendipityNode){
     const id=serendipityNode.getAttribute("data-serendipity-node");
     if(id)openWorldNode(id,{preserveTrail:true});
     return;
   }
   const wanderWorld=event.target.closest("[data-wander-world]");
   if(wanderWorld){
     state.selected=null;state.street=null;state.placeStreet=null;state.roomOrigin=null;state.outsideOpen=true;state.exploreOpen=false;state.moreOpen=false;state.tab="atlas";history.replaceState(null,"","#world");draw();
     return;
   }
   const returnNew=event.target.closest("[data-return-new]");
   if(returnNew){
     const id=returnNew.getAttribute("data-return-new");
     if(id){state.outsideOpen=false;state.exploreOpen=false;openWorldNode(id,{preserveTrail:true});}
     return;
   }
   const returnThread=event.target.closest("[data-return-thread]");
   if(returnThread){
     const id=returnThread.getAttribute("data-return-thread");
     if(id){state.outsideOpen=false;state.exploreOpen=false;openWorldNode(id,{preserveTrail:true});}
     return;
   }
   const roomReturn=event.target.closest("[data-room-place-return]");
   if(roomReturn){
     const placeId=roomReturn.getAttribute("data-room-place-return")||"";
     const origin=state.roomOrigin;
     if(origin&&String(origin.placeId)===String(placeId)){state.selected=String(placeId);state.placeStreet=origin;state.roomOrigin=null;const streetHash=origin.street&&origin.street.id?"&world-place-street="+encodeURIComponent(String(origin.street.id)):"";writeWorldHash("#world-place="+encodeURIComponent(String(placeId))+streetHash,"replace");draw();focusDetail();}
     return;
   }
   const node=event.target.closest("[data-node]");
   if(node){
     const id=node.getAttribute("data-node");
     if(state.focusDetailRequest)state.focusOrigin={nodeId:String(id||"")};
     if(state.street&&state.street.node){
       const streetPlace=streetPlaceRecords(records().find(function(r){return String(r.id)===String(state.street.placeId);})||{},state.street.node).find(function(r){return String(r.id)===String(id);});
       if(streetPlace){
         state.placeStreet={placeId:String(streetPlace.id),place:streetPlace,street:state.street.node};
         state.street=null;
         state.selected=String(streetPlace.id);
         writeWorldHash("#world-place="+encodeURIComponent(String(streetPlace.id)),"push");
         draw();
         focusDetail();
         return;
       }
     }
     if(id){
       if(state.placeStreet&&state.placeStreet.place&&roomContents(state.placeStreet.place).some(function(r){return String(r.id)===String(id);})){state.roomOrigin={placeId:String(state.placeStreet.place.id),place:state.placeStreet.place,street:state.placeStreet.street||null};}
       else if(["world-apartment","world-street-corner","world-parc-extension"].includes(String(state.selected))){const currentRoom=records().find(function(r){return String(r.id)===String(state.selected);});if(currentRoom&&roomContents(currentRoom).some(function(r){return String(r.id)===String(id);})){state.roomOrigin={placeId:String(currentRoom.id),place:currentRoom,street:null};}}
       else if(state.street){state.roomOrigin=null;}
       openWorldNode(id);
     }
     return;
   }
   if(event.target.closest("[data-close-node]")||event.target.closest("[data-outside-world]")){
     const restore=state.focusDetailRequest&&state.focusOrigin;
     state.selected=null;
     history.replaceState(null,"","#world");
     state.focusDetailRequest=false;
     state.focusRestoreRequest=!!restore;
     draw();
   }
 });
 function syncFromHash(){
   clearWorldTransition();
   state.focusDetailRequest=false;
   state.focusRestoreRequest=false;
   state.focusOrigin=null;
   state.exploreOpen=false;
   state.outsideOpen=false;
   state.moreOpen=false;
   state.tab="atlas";
   const h=String(location.hash||"");
   const sm=h.match(/(?:world-street=)([^&]+)/);
   const pm=h.match(/(?:world-place=)([^&]+)/);
   const m=h.match(/(?:world-node=)([^&]+)/);
   const om=h.match(/(?:world-origin=)([^&]+)/);
   const osm=h.match(/(?:world-origin-street=)([^&]+)/);
   const psm=h.match(/(?:world-place-street=)([^&]+)/);
   state.street=null;
   state.roomOrigin=null;
   state.selected=pm?safeDecode(pm[1]):(m?safeDecode(m[1]):null);
   if(om&&state.selected){
     const origin=records().find(function(r){return String(r.id)===String(safeDecode(om[1]));});
     if(origin){
       const street= osm ? cityStreetNodes(origin).find(function(x){return String(x.id)===String(safeDecode(osm[1]));}) : null;
       state.roomOrigin={placeId:String(origin.id),place:origin,street:street||null};
       if(street)state.placeStreet={placeId:String(origin.id),place:origin,street:street};
     }
   }
   if(pm){const place=records().find(function(r){return String(r.id)===String(state.selected);});if(place){const street=psm?cityStreetNodes(title(place)).find(function(x){return String(x.id)===String(safeDecode(psm[1]));}):null;state.placeStreet={placeId:String(place.id),place:place,street:street||null};}}
   if(m&&om&&state.roomOrigin&&["world-apartment","world-street-corner","world-parc-extension"].includes(String(state.selected))){
     state.placeStreet=null;
   }
   if(sm){
     const parts=safeDecode(sm[1]).split(":");
     const placeId=parts.shift()||"";
     const streetId=parts.join(":");
     const place=records().find(function(r){return String(r.id)===String(placeId);});
     const street=place?cityStreetNodes(title(place)).find(function(x){return String(x.id)===String(streetId);}):null;
     if(place&&street){state.selected=String(place.id);state.street={placeId:String(place.id),node:street};}
   }
   draw();
 }
 window.addEventListener("popstate",function(){syncFromHash();});
 window.addEventListener("hashchange",function(){syncFromHash();});
 syncFromHash();
 draw();
}
if(typeof document!=="undefined"){
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mountWorld,{once:true});
 else mountWorld();
}
})();
