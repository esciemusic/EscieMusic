(function(){
"use strict";
window.ESCIE_WORLD_ENGINE_ACTIVE=true;
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const coll=(name,fallback=[])=>{const v=window[name];return Array.isArray(v)?v:(v&&Array.isArray(v.records)?v.records:fallback)};
const state={tab:"atlas",q:"",type:"ALL",selected:null,trail:[],visited:[],eyeOpen:false,exploreOpen:false};
const tabs=[["atlas","ATLAS","world"],["people","THE PEOPLE","person"],["places","PLACES","world"],["moments","MOMENTS","moment"],["fragments","FRAGMENTS","photo-negative"],["bodies","BODIES","empty-chair"],["proof","PROOF","key"],["path","PATH","web"],["timeline","TIMELINE","now"],["symbols","SYMBOLS","daisy"],["trails","TRAILS","web"]];function glyph(name,label){const safe=String(name||"").replace(/[^a-z0-9-]/gi,"");if(!safe)return "";return '<svg class="escie-symbol-glyph world-entry-glyph" viewBox="0 0 32 32" focusable="false" aria-hidden="true"><use href="./assets/escie-symbols.svg#'+esc(safe)+'"></use></svg>';}
const raf=typeof requestAnimationFrame==="function"?requestAnimationFrame:fn=>setTimeout(fn,0);
const caf=typeof cancelAnimationFrame==="function"?cancelAnimationFrame:clearTimeout;
const reduceMotion=()=>typeof window.matchMedia==="function"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function scheduleSearchRender(render){let searchFrame=null;caf(searchFrame);searchFrame=raf(()=>{renderNow()});function renderNow(){render(filtered())}} // Compatibility scheduler contract: caf(searchFrame);searchFrame=raf(()=>{render()}
function records(){
 const sources=[coll("ESCIE_LIVE_RECORDS"),coll("ESCIE_MUSIC"),coll("ESCIE_PEOPLE"),coll("ESCIE_LOCATIONS"),coll("ESCIE_MOMENTS"),coll("ESCIE_FRAGMENTS"),coll("ESCIE_BODIES"),coll("ESCIE_PATHS"),coll("ESCIE_PROOF"),coll("ESCIE_NODES"),coll("ESCIE_PROJECTS"),coll("ESCIE_ARCHIVE"),coll("ESCIE_INVESTIGATION"),coll("ESCIE_SYMBOLS")];
 const seen=new Set(),out=[];
 sources.flat().forEach(r=>{if(!r||typeof r!=="object")return;const id=r.id||r.recordId||r.slug||r.title;if(id&&!seen.has(id)){seen.add(id);out.push({...r,id})}});
 return out;
}
function type(r){return String(r.type||r.kind||r.category||"WORK").trim().toUpperCase()||"WORK"}
function title(r){return String(r.title||r.name||r.label||"UNTITLED").trim()||"UNTITLED"}
function searchText(r){return [r.id,r.type,r.kind,r.category,r.title,r.name,r.label,r.description,r.summary,r.story,r.date,r.release_date,r.moment_date,r.created_at,Array.isArray(r.tags)?r.tags.join(" "):""] .map(v=>String(v??"")).join(" ").toLowerCase()}
function rels(){
 const local=coll("ESCIE_RELATIONSHIPS").concat(coll("ESCIE_LIVE_RELATIONSHIPS"));
 const seen=new Set();
 return local.concat(coll("ESCIE_RELATIONSHIPS_PUBLIC")).map(r=>r&&({...r,from:r.from||r.source_id||r.sourceId,to:r.to||r.target_id||r.targetId})).filter(r=>{
   if(!r||!r.from||!r.to)return false;
   if(r.visibility!==undefined&&String(r.visibility).toLowerCase()!=="public")return false;
   if(r.status!==undefined&&["withheld","archived","inactive"].includes(String(r.status).toLowerCase()))return false;
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
function filtered(){
 const q=state.q.toLowerCase().trim();
 return records().filter(r=>(state.type==="ALL"||type(r)===state.type)&&(!q||searchText(r).includes(q)));
}
function card(r){
 const depth=related(r.id).length?"DEEPER THREAD":"SURFACE RECORD";
 return '<button type="button" class="world-card world-node-card" data-node="'+esc(r.id)+'" data-depth="'+(related(r.id).length?"deep":"surface")+'"><div class="world-card-main"><span class="world-kicker">'+esc(type(r))+' // '+depth+'</span><h3 data-no-translate class="record-identity">'+esc(title(r))+'</h3><p>'+esc(String(r.description||r.summary||r.story||"A doorway into the ESCIE universe.").slice(0,220))+'</p></div><span class="world-arrow" aria-hidden="true">↗</span></button>';
}
function remember(id){if(id==null)return;const value=String(id).trim();if(!value)return;if(!state.visited.includes(value))state.visited.push(value);if(state.trail[state.trail.length-1]!==value)state.trail.push(value);state.trail=state.trail.slice(-12);state.visited=state.visited.slice(-100);try{sessionStorage.setItem("escie_world_trail",JSON.stringify(state.trail));sessionStorage.setItem("escie_world_visited",JSON.stringify(state.visited))}catch(e){}}
function pathContext(){const rs=records(),out=[];for(let i=1;i<state.trail.length;i++){const from=rs.find(r=>String(r.id)===String(state.trail[i-1])),to=rs.find(r=>String(r.id)===String(state.trail[i]));if(!from||!to)continue;const link=related(from.id).find(x=>String(x.node.id)===String(to.id));out.push({from,to,relationship:link&&link.r&&link.r.type?String(link.r.type).replace(/_/g," "):"UNLINKED THREAD"});}return out;}
function investigationSummary(){const p=pathContext();const unknowns=state.visited.map(id=>records().find(r=>String(r.id)===String(id))).filter(Boolean).filter(r=>String(r.certainty||"").toUpperCase()==="UNKNOWN").length;return {steps:p.length,unknowns};}
function loadTrail(){try{const a=JSON.parse(sessionStorage.getItem("escie_world_trail")||"[]");const b=JSON.parse(sessionStorage.getItem("escie_world_visited")||"[]");if(Array.isArray(a))state.trail=a.filter(v=>typeof v==="string"&&v.trim()).slice(-12);if(Array.isArray(b))state.visited=b.filter(v=>typeof v==="string"&&v.trim()).slice(-100)}catch(e){state.trail=[];state.visited=[]}}
const focusDetail=()=>{const el=container.querySelector(".world-detail");if(el){el.setAttribute("tabindex","-1");if(typeof el.focus==="function")el.focus();}};
function roomContents(room){
 const all=records().filter(function(r){return r&&String(r.id)!==String(room.id);});
 const linked=related(room.id).map(function(x){return x.node;});
 const tagged=all.filter(function(r){const tags=Array.isArray(r.tags)?r.tags.map(String):[];return tags.includes(String(room.id))||tags.includes(String(room.slug||room.id));});
 const seen=new Set(),out=[]; linked.concat(tagged).forEach(function(r){if(r&&!seen.has(String(r.id))){seen.add(String(r.id));out.push(r);}}); return out;
}
function roomDetail(room){
 const contents=roomContents(room);
 const profile=room&&room.profile&&typeof room.profile==="object"?room.profile:{};
 const texture=Array.isArray(profile.texture)?profile.texture:[];
 const anchors=Array.isArray(profile.anchors)?profile.anchors:[];
 const items=contents.map(function(r){
   const kind=type(r),label=kind==="MUSIC"?"MUSIC":kind==="ART"?"ART":kind==="PERSON"?"PERSON":kind==="MOMENT"?"MOMENT":kind;
   return '<button type="button" class="world-room-item" data-node="'+esc(r.id)+'"><span class="world-room-item-kind">'+esc(label)+'</span><strong>'+esc(title(r))+'</strong><small>'+esc(r.description||r.summary||"A piece of life in this room.")+'</small></button>';
 }).join('');
 const textureLine=texture.length?texture.map(function(x){return '<span>'+esc(String(x).replace(/-/g," "))+'</span>';}).join(''):'';
 const anchorLine=anchors.length?anchors.map(function(x){return '<span>'+esc(x)+'</span>';}).join(''):'';
 return '<div class="world-room-scene">'+
   '<div class="world-room-threshold"><button type="button" class="world-home-return" data-close-node>← MONTRÉAL</button><span class="world-kicker">A ROOM IN THE HOME</span><span class="world-kicker">INSIDE</span><h3 data-no-translate class="record-identity">'+esc(title(room))+'</h3><p>'+esc(room.description||"A room in the Montréal home.")+'</p></div>'+
   '<div class="world-room-place"><div class="world-room-place-image" aria-hidden="true"><span></span><span></span><span></span></div><div class="world-room-place-copy"><span class="world-kicker">PLACE</span><strong>'+esc(room.profile&&room.profile.role||"LIVED PLACE")+'</strong><p>This is a place first. The records live inside it.</p></div></div>'+
   (textureLine?'<div class="world-room-details"><div><span class="world-kicker">TEXTURE</span><div class="world-room-tags">'+textureLine+'</div></div>'+(anchorLine?'<div><span class="world-kicker">LANDMARKS / ANCHORS</span><div class="world-room-tags">'+anchorLine+'</div></div>':'')+'</div>':'')+
   '<div class="world-room-life"><div class="world-room-life-head"><span class="world-kicker">WHAT LIVES HERE</span><p>People, moments, art, music, objects and traces appear as they are actually added to this place.</p></div>'+(items||'<div class="world-empty">Nothing has been opened here yet.</div>')+'</div>'+
 '</div>';
}
function detail(r){
 const roomIds=["little-italy","parc-extension"];
 if(r&&roomIds.includes(String(r.id)))return roomDetail(r);
 const symbol=r&&String(r.id||"").indexOf("symbol-")===0?coll("ESCIE_SYMBOLS").find(x=>x&&String(x.id)===String(r.id)):null;
 if(symbol){
   const trail=coll("ESCIE_LIVE_RECORDS").concat(coll("ESCIE_MUSIC"),coll("ESCIE_ARCHIVE"),coll("ESCIE_INVESTIGATION")).filter(x=>x&&Array.isArray(x.symbols)&&x.symbols.includes(symbol.id));
   return '<aside class="world-detail" aria-live="polite"><div class="world-detail-head"><div><span class="world-kicker">MOTIF // RECURRING</span><h3 data-no-translate class="record-identity">'+esc(symbol.name||"SYMBOL")+'</h3></div><button type="button" class="world-close" data-close-node aria-label="Close symbol">×</button></div><div class="world-detail-meta"><span>'+esc(symbol.status||"RECURRING")+'</span><span>'+esc((symbol.placements||[]).join(" / ")||"UNPLACED")+'</span></div><p>'+esc(symbol.motif||"Meaning intentionally left open.")+'</p><div class="world-kicker">PUBLIC RECORD LINKS · '+trail.length+'</div><div class="world-connections">'+(trail.length?trail.map(x=>'<button type="button" data-node="'+esc(x.id)+'"><strong>'+esc(title(x))+'</strong><small>carries motif</small></button>').join(""):'<span class="world-empty">No public record is explicitly carrying this motif yet.</span>')+'</div><div class="world-detail-actions"><button type="button" data-copy-node>COPY NODE LINK</button></div></aside>';
 }
 const links=related(r.id);
 const connections=links.length?links.map(x=>'<button type="button" data-node="'+esc(x.node.id)+'"><strong>'+esc(title(x.node))+'</strong><small>'+esc(x.r.type||"related")+'</small></button>').join(""):'<span class="world-empty">No public connection recorded yet.</span>';
 return '<aside class="world-detail" aria-live="polite"><div class="world-detail-head"><div><span class="world-kicker">NODE // '+esc(type(r))+'</span><h3 data-no-translate class="record-identity">'+esc(title(r))+'</h3></div><button type="button" class="world-close" data-close-node aria-label="Close node">×</button></div><div class="world-detail-meta"><span>'+esc(String(r.certainty||"UNKNOWN").toUpperCase())+'</span><span>'+esc(String(r.status||"UNKNOWN").toUpperCase())+'</span></div><p>'+esc(r.description||r.summary||r.story||"No public description yet.")+'</p><div class="world-kicker">CONNECTIONS · '+links.length+'</div><div class="world-connections">'+connections+'</div><div class="world-detail-actions"><button type="button" data-focus-search>SEARCH THIS NODE</button><button type="button" data-copy-node>COPY NODE LINK</button></div><div class="world-path"><span class="world-kicker">YOUR PATH</span><div id="world-path-items">START HERE</div></div></aside>';
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
 return '<div class="world-list">'+(starts.length?starts.map(s=>{const ns=(adj.get(String(s.id))||[]).map(id=>map.get(String(id))).filter(Boolean).slice(0,3);return '<article class="world-card"><div class="world-card-main"><span class="world-kicker">TRAILHEAD</span><h3 data-no-translate class="record-identity">'+esc(title(s))+'</h3><p>'+ns.map(n=>'<button type="button" class="inline-node" data-node="'+esc(n.id)+'">'+esc(title(n))+'</button>').join(" · ")+'</p></div><span class="world-arrow">→</span></article>'}).join(""):'<div class="world-intro"><p>Trails appear as public relationships accumulate.</p></div>')+'</div>';
}
function discoveryReason(current,node,base){if(!current)return "OPEN THREAD";if(base.some(x=>String(x.id)===String(node.id))){const rel=related(current.id).find(x=>String(x.node.id)===String(node.id));return rel&&rel.type?"FOLLOWED FROM "+String(rel.type).replace(/_/g," "):"DIRECT CONNECTION";}if(state.trail.length>1){const previous=records().find(r=>String(r.id)===String(state.trail[state.trail.length-2]));if(previous&&type(node)===type(previous))return "CONTINUES THE THREAD";}if(type(node)===type(current))return "SAME KIND";if(Array.isArray(node.tags)&&Array.isArray(current.tags)&&node.tags.some(t=>current.tags.includes(t)))return "SHARED SIGNAL";return "UNEXPLORED";}
function discovery(rows){const seen=new Set(state.visited.map(String));const current=state.selected?records().find(r=>String(r.id)===String(state.selected)):null;const base=current?related(current.id).map(x=>x.node):[];const pool=base.concat(rows).filter(Boolean).filter(r=>!seen.has(String(r.id)));const scored=pool.map(r=>{let score=0;if(base.some(x=>String(x.id)===String(r.id)))score+=10;if(current&&type(r)===type(current))score+=2;if(Array.isArray(r.tags)&&current&&Array.isArray(current.tags))score+=r.tags.filter(t=>current.tags.includes(t)).length;return {r,score,reason:discoveryReason(current,r,base)};}).sort((a,b)=>b.score-a.score);const out=[];const usedTypes=new Set();for(const x of scored){if(out.length>=3)break;if(!usedTypes.has(type(x.r))||x.score>=10){out.push(x);usedTypes.add(type(x.r));}}if(out.length<3)for(const x of scored){if(out.length>=3)break;if(!out.some(y=>String(y.r.id)===String(x.r.id)))out.push(x);}return out;}
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
 return "<div id=\"glass-eye-panel\" role=\"region\" aria-label=\"The Glass Eye\" class=\"glass-eye-panel\"><div><span class=\"world-kicker\">GLASS EYE</span><h3>SEE · HEAR · FOLLOW · MISS · RETURN</h3><p>The audience eye. This is your side of the screen. Your path is remembered on this device, but it never becomes canon.</p></div>"+(last?"<div class=\"glass-eye-last\"><span class=\"world-kicker\">LAST SIGNAL</span><button type=\"button\" data-node=\""+esc(last.id)+"\">"+esc(title(last))+"</button></div>":"")+"<div class=\"world-kicker\">NEXT SIGNALS</div><div class=\"glass-eye-discovery\">"+next.map(x=>"<button type=\"button\" data-node=\""+esc(x.node.id)+"\"><strong>"+esc(title(x.node))+"</strong><small>"+esc(x.reason)+" · "+esc(type(x.node))+"</small></button>").join("")+"</div><div class=\"glass-eye-actions\"><button type=\"button\" data-eye-clear>CLEAR MY PATH</button><button type=\"button\" data-eye-close>CLOSE EYE</button></div></div>";
}
function montrealRecord(){
 const rows=coll("ESCIE_LOCATIONS",[]).filter(r=>r&&String(r.visibility||"").toLowerCase()!=="withheld"&&r.public_disclosure!==false);
 return rows.find(r=>String(r.id||"").toLowerCase()==="montreal")||rows.find(r=>String(r.title||"").toUpperCase()==="MONTRÉAL")||null;
}
function homeRooms(){
 const locations=coll("ESCIE_LOCATIONS",[]);
 return ["little-italy","parc-extension"].map(id=>locations.find(r=>r&&String(r.id||"")===id)).filter(r=>r&&String(r.visibility||"").toLowerCase()!=="withheld"&&r.public_disclosure!==false);
}
// Canonical World entry contracts: data-world-tab="places" data-world-tab="people" data-world-tab="moments" href="#art"
// Entry tone: Come in. Look around.
function worldLensMarkup(){
 const lensAttrs={atlas:'data-world-tab="atlas"',people:'data-world-tab="people"',places:'data-world-tab="places"',moments:'data-world-tab="moments"',fragments:'data-world-tab="fragments"',bodies:'data-world-tab="bodies"',proof:'data-world-tab="proof"',path:'data-world-tab="path"',timeline:'data-world-tab="timeline"',symbols:'data-world-tab="symbols"',trails:'data-world-tab="trails"'};
 return '<div class="world-index-shell">'+
   '<button type="button" class="world-index-toggle" data-world-explore aria-expanded="'+(state.exploreOpen?"true":"false")+'"><span class="world-kicker">EXPLORE</span><strong>OPEN THE WORLD INDEX</strong><span aria-hidden="true">'+(state.exploreOpen?"−":"+")+'</span></button>'+
   '<div class="world-lens-nav" role="tablist" aria-label="ESCIE World navigation"'+(state.exploreOpen?"":" hidden")+'>'
   +tabs.map(function(t){
     const active=state.tab===t[0];
     return '<button type="button" role="tab" aria-selected="'+(active?"true":"false")+'" '+lensAttrs[t[0]]+'>'+glyph(t[2],t[1])+'<span>'+esc(t[1])+'</span></button>';
   }).join("")+'</div></div>';
}
function lensRows(){
 const map={people:"ESCIE_PEOPLE",places:"ESCIE_LOCATIONS",moments:"ESCIE_MOMENTS",fragments:"ESCIE_FRAGMENTS",bodies:"ESCIE_BODIES",proof:"ESCIE_PROOF",path:"ESCIE_PATHS",timeline:"ESCIE_MOMENTS",symbols:"ESCIE_SYMBOLS",trails:"ESCIE_PATHS"};
 const rows=state.tab==="atlas"?records():coll(map[state.tab],[]);
 return rows.filter(function(r){return r&&String(r.visibility||"").toLowerCase()!=="withheld"&&r.public_disclosure!==false;}).slice(0,60);
}
function worldLensContent(){
 if(state.tab==="atlas")return '<div class="world-home-house"><div class="world-home-city"><span class="world-kicker">THE HOME</span><strong>MONTRÉAL</strong><p>MONTRÉAL IS HOME.</p></div></div>';
 const rows=lensRows();
 return '<div class="world-list">'+(rows.length?rows.map(card).join(""):'<div class="world-empty">Nothing has been opened here yet.</div>')+'</div>';
}
function worldHome(){
 const city=montrealRecord(),rooms=homeRooms();
 const roomCards=rooms.map(function(room){
   return '<button type="button" class="world-room" data-node="'+esc(room.id)+'"><span class="world-room-mark" aria-hidden="true"></span><div><span class="world-kicker">ROOM</span><strong>'+esc(title(room))+'</strong><p>'+esc(room.description||"A room in the Montréal home.")+'</p></div><span class="world-arrow" aria-hidden="true">↗</span></button>';
 }).join("");
 const currentTab=state.tab!=="atlas";
 return '<div class="world-home">'+
   '<div class="world-home-intro"><span class="world-kicker">MY WORLD</span><h3>THE WORLD</h3><p>The world is already here. ESCIE is one way of seeing it.</p><small>Montréal is home. The world continues.</small></div>'+
   ((currentTab||state.exploreOpen)?worldLensMarkup():'')+
   (currentTab?worldLensContent():'<div class="world-home-house"><div class="world-home-city"><span class="world-kicker">HOME</span><strong>'+esc(city&&city.title||"MONTRÉAL")+'</strong><p>WHERE MY WORLD AND THE WORLD INTERTWINE.</p></div><div class="world-home-rooms">'+(roomCards||'<span class="world-empty">Nothing has been opened yet.</span>')+'</div></div>')+
   ((currentTab||state.exploreOpen)?'':'<div class="world-home-actions"><button type="button" class="world-enter-index" data-world-explore aria-expanded="false"><span class="world-kicker">DISCOVER</span><strong>OPEN THE WORLD</strong><span aria-hidden="true">↗</span></button></div>')+
   '<button type="button" class="world-home-outside" data-outside-world><span class="world-kicker">BEYOND HOME</span><strong>THE WORLD CONTINUES</strong><p>Everything beyond Montréal can enter here too.</p></button>'+
   (currentTab?'':'<p class="world-home-note">You do not have to understand the whole thing. Start somewhere.</p>')+
 '</div>';
}
function mountWorld(){
 const container=$("world-container"); if(!container)return;
 container.classList.add("world-engine");
 const route=String(location.hash||"");
 const match=route.match(/(?:world-node=)([^&]+)/);
 state.selected=match?decodeURIComponent(match[1]):null;
 function draw(){
   if(state.selected){
     const node=records().find(r=>String(r.id)===String(state.selected));
     if(node){container.innerHTML=detail(node);focusDetail();return;}
     state.selected=null;
   }
   container.innerHTML=worldHome();
 }
 container.addEventListener("click",function(event){
   const lens=event.target.closest("[data-world-tab]");
   if(lens){
     state.tab=lens.getAttribute("data-world-tab")||"atlas";
     state.selected=null;
     history.replaceState(null,"","#world");
     draw();
     return;
   }
   const explore=event.target.closest("[data-world-explore]");\n   if(explore){\n     state.exploreOpen=true;\n     state.tab="atlas";\n     state.selected=null;\n     history.replaceState(null,"","#world");\n     draw();\n     return;\n   }\n   const node=event.target.closest("[data-node]");
   if(node){
     const id=node.getAttribute("data-node");
     if(id){state.selected=id;remember(id);history.replaceState(null,"","#world-node="+encodeURIComponent(id));draw();}
     return;
   }
   if(event.target.closest("[data-close-node]")||event.target.closest("[data-outside-world]")){
     state.selected=null;
     history.replaceState(null,"","#world");
     draw();
   }
 });
 window.addEventListener("hashchange",function(){
   const m=String(location.hash||"").match(/(?:world-node=)([^&]+)/);
   state.selected=m?decodeURIComponent(m[1]):null;
   draw();
 });
 draw();
}
if(typeof document!=="undefined"){
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mountWorld,{once:true});
 else mountWorld();
}
})();
