(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const coll=(name,fallback=[])=>{const v=window[name];return Array.isArray(v)?v:(v&&Array.isArray(v.records)?v.records:fallback)};
const state={tab:"atlas",q:"",reality:"ALL",type:"ALL",selected:null,trail:[],visited:[],eyeOpen:false};
const tabs=[["atlas","ATLAS"],["timeline","TIMELINE"],["reality","REALITY"],["symbols","SYMBOLS"],["trails","TRAILS"]];
function records(){
 const sources=[coll("ESCIE_MUSIC"),coll("ESCIE_PEOPLE"),coll("ESCIE_LOCATIONS"),coll("ESCIE_MOMENTS"),coll("ESCIE_FRAGMENTS"),coll("ESCIE_BODIES"),coll("ESCIE_PATHS"),coll("ESCIE_NODES"),coll("ESCIE_PROJECTS"),coll("ESCIE_ARCHIVE"),coll("ESCIE_INVESTIGATION"),coll("ESCIE_SYMBOLS")];
 const seen=new Set(),out=[];
 sources.flat().forEach(r=>{if(!r||typeof r!=="object")return;const id=r.id||r.recordId||r.slug||r.title;if(id&&!seen.has(id)){seen.add(id);out.push({...r,id})}});
 return out;
}
function type(r){return String(r.type||r.kind||r.category||"WORK").toUpperCase()}
function reality(r){return String(r.reality_level||r.reality||"UNKNOWN").toUpperCase()}
function title(r){return r.title||r.name||r.label||"UNTITLED"}
function rels(){
 const local=coll("ESCIE_RELATIONSHIPS");
 return local.concat(coll("ESCIE_RELATIONSHIPS_PUBLIC")).map(r=>r&&({...r,from:r.from||r.source_id||r.sourceId,to:r.to||r.target_id||r.targetId})).filter(r=>r&&r.from&&r.to&&(r.visibility===undefined||String(r.visibility).toLowerCase()==="public")&&(r.status===undefined||!["withheld","archived","inactive"].includes(String(r.status).toLowerCase())));
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
 return records().filter(r=>(state.type==="ALL"||type(r)===state.type)&&(state.reality==="ALL"||reality(r)===state.reality)&&(!q||JSON.stringify(r).toLowerCase().includes(q)));
}
function card(r){
 return '<button type="button" class="world-card world-node-card" data-node="'+esc(r.id)+'"><div class="world-card-main"><span class="world-kicker">'+esc(type(r))+" · "+esc(reality(r))+'</span><h3>'+esc(title(r))+'</h3><p>'+esc(String(r.description||r.summary||r.story||"A doorway into the ESCIE universe.").slice(0,220))+'</p></div><span class="world-arrow" aria-hidden="true">↗</span></button>';
}
function remember(id){if(!id)return;if(!state.visited.includes(String(id)))state.visited.push(String(id));if(state.trail[state.trail.length-1]!==String(id))state.trail.push(String(id));state.trail=state.trail.slice(-12);try{sessionStorage.setItem("escie_world_trail",JSON.stringify(state.trail));sessionStorage.setItem("escie_world_visited",JSON.stringify(state.visited.slice(-100)))}catch(e){}}
function pathContext(){const rs=records(),out=[];for(let i=1;i<state.trail.length;i++){const from=rs.find(r=>String(r.id)===String(state.trail[i-1])),to=rs.find(r=>String(r.id)===String(state.trail[i]));if(!from||!to)continue;const link=related(from.id).find(x=>String(x.node.id)===String(to.id));out.push({from,to,relationship:link&&link.r&&link.r.type?String(link.r.type).replace(/_/g," "):"UNLINKED THREAD"});}return out;}
function investigationSummary(){const p=pathContext();const unknowns=state.visited.map(id=>records().find(r=>String(r.id)===String(id))).filter(Boolean).filter(r=>reality(r)==="UNKNOWN"||String(r.certainty||"").toUpperCase()==="UNKNOWN").length;return {steps:p.length,unknowns};}
function loadTrail(){try{const a=JSON.parse(sessionStorage.getItem("escie_world_trail")||"[]");const b=JSON.parse(sessionStorage.getItem("escie_world_visited")||"[]");if(Array.isArray(a))state.trail=a;if(Array.isArray(b))state.visited=b}catch(e){}}
function detail(r){
 const links=related(r.id);
 return '<aside class="world-detail" aria-live="polite"><div class="world-detail-head"><div><span class="world-kicker">NODE // '+esc(type(r))+'</span><h3>'+esc(title(r))+'</h3></div><button type="button" class="world-close" data-close-node aria-label="Close node">×</button></div><div class="world-detail-meta"><span>'+esc(reality(r))+'</span><span>'+esc(String(r.certainty||"UNKNOWN").toUpperCase())+'</span><span>'+esc(String(r.status||"UNKNOWN").toUpperCase())+'</span></div><p>'+esc(r.description||r.summary||r.story||"No public description yet.")+'</p><div class="world-kicker">CONNECTIONS · '+links.length+'</div><div class="world-connections">'+(links.length?links.map(x=>'<button type="button" data-node="'+esc(x.node.id)+'"><strong>'+esc(title(x.node))+'</strong><small>'+esc(x.r.type||"related")+'</small></button>').join(""):'<span class="world-empty">No public connection recorded yet.</span>')+'</div><div class="world-detail-actions"><button type="button" data-focus-search>SEARCH THIS NODE</button><button type="button" data-copy-node>COPY NODE LINK</button></div><div class="world-path"><span class="world-kicker">YOUR PATH</span><div id="world-path-items">START HERE</div></div></aside>';
}
function graphView(rows){
 const map=new Map(rows.map(r=>[String(r.id),r])),edges=[];
 rels().forEach(x=>{if(map.has(String(x.from))&&map.has(String(x.to)))edges.push(x)});
 return '<div class="world-graph"><div class="world-graph-note"><span class="world-kicker">RELATIONSHIP GRAPH</span><strong>'+rows.length+' nodes · '+edges.length+' public edges</strong></div><div class="world-graph-grid">'+rows.slice(0,80).map(r=>'<button type="button" class="world-graph-node" data-node="'+esc(r.id)+'"><i></i><span>'+esc(title(r))+'</span><small>'+esc(type(r))+'</small></button>').join("")+'</div></div>';
}
function trails(rows){
 const map=new Map(rows.map(r=>[String(r.id),r])),adj=new Map();
 rels().forEach(x=>{if(map.has(String(x.from))&&map.has(String(x.to))){if(!adj.has(String(x.from)))adj.set(String(x.from),[]);if(!adj.has(String(x.to)))adj.set(String(x.to),[]);adj.get(String(x.from)).push(x.to);adj.get(String(x.to)).push(x.from)}});
 const starts=rows.filter(r=>(adj.get(String(r.id))||[]).length).slice(0,6);
 return '<div class="world-list">'+(starts.length?starts.map(s=>{const ns=(adj.get(String(s.id))||[]).map(id=>map.get(String(id))).filter(Boolean).slice(0,3);return '<article class="world-card"><div class="world-card-main"><span class="world-kicker">TRAILHEAD</span><h3>'+esc(title(s))+'</h3><p>'+ns.map(n=>'<button type="button" class="inline-node" data-node="'+esc(n.id)+'">'+esc(title(n))+'</button>').join(" · ")+'</p></div><span class="world-arrow">→</span></article>'}).join(""):'<div class="world-intro"><p>Trails appear as public relationships accumulate.</p></div>')+'</div>';
}
function discoveryReason(current,node,base){if(!current)return "OPEN THREAD";if(base.some(x=>String(x.id)===String(node.id))){const rel=related(current.id).find(x=>String(x.node.id)===String(node.id));return rel&&rel.type?"FOLLOWED FROM "+String(rel.type).replace(/_/g," "):"DIRECT CONNECTION";}if(state.trail.length>1){const previous=records().find(r=>String(r.id)===String(state.trail[state.trail.length-2]));if(previous&&type(node)===type(previous))return "CONTINUES THE THREAD";if(previous&&reality(node)===reality(previous))return "SAME LAYER AS PREVIOUS";}if(type(node)===type(current))return "SAME KIND";if(reality(node)===reality(current))return "SAME REALITY LAYER";if(Array.isArray(node.tags)&&Array.isArray(current.tags)&&node.tags.some(t=>current.tags.includes(t)))return "SHARED SIGNAL";return "UNEXPLORED";}
function discovery(rows){const seen=new Set(state.visited.map(String));const current=state.selected?records().find(r=>String(r.id)===String(state.selected)):null;const base=current?related(current.id).map(x=>x.node):[];const pool=base.concat(rows).filter(Boolean).filter(r=>!seen.has(String(r.id)));const scored=pool.map(r=>{let score=0;if(base.some(x=>String(x.id)===String(r.id)))score+=10;if(current&&type(r)===type(current))score+=2;if(current&&reality(r)===reality(current))score+=1;if(Array.isArray(r.tags)&&current&&Array.isArray(current.tags))score+=r.tags.filter(t=>current.tags.includes(t)).length;return {r,score,reason:discoveryReason(current,r,base)};}).sort((a,b)=>b.score-a.score);const out=[];const usedTypes=new Set();for(const x of scored){if(out.length>=3)break;if(!usedTypes.has(type(x.r))||x.score>=10){out.push(x);usedTypes.add(type(x.r));}}if(out.length<3)for(const x of scored){if(out.length>=3)break;if(!out.some(y=>String(y.r.id)===String(x.r.id)))out.push(x);}return out;}
function eyePanel(){
 const rows=filtered(),explored=state.visited.length,connected=state.selected?related(state.selected).length:0,last=state.trail.length?records().find(r=>String(r.id)===String(state.trail[state.trail.length-1])):null,next=discovery(rows),summary=investigationSummary(),path=pathContext();
 return "<div class=\"glass-eye-panel\"><div><span class=\"world-kicker\">THE GLASS EYE</span><h3>YOU ARE INSIDE THE SIGNAL.</h3><p>This is the audience layer. It remembers your route on this device, not who you are. Nothing you discover becomes canon because you discovered it.</p></div><div class=\"glass-eye-stats\"><div><strong>"+explored+"</strong><span>VISITED</span></div><div><strong>"+connected+"</strong><span>CONNECTIONS HERE</span></div><div><strong>"+rows.length+"</strong><span>VISIBLE NODES</span></div><div><strong>"+summary.steps+"</strong><span>THREAD STEPS</span></div><div><strong>"+summary.unknowns+"</strong><span>UNKNOWN VISITED</span></div></div>"+(last?"<div class=\"glass-eye-last\"><span class=\"world-kicker\">LAST SIGNAL</span><button type=\"button\" data-node=\""+esc(last.id)+"\">"+esc(title(last))+"</button></div>":"")+"<div class=\"world-kicker\">NEXT SIGNALS</div><div class=\"glass-eye-discovery\">"+next.map(x=>"<button type=\"button\" data-node=\""+esc(x.node.id)+"\"><strong>"+esc(title(x.node))+"</strong><small>"+esc(x.reason)+" · "+esc(type(x.node))+" · "+esc(reality(x.node))+"</small></button>").join("")+"</div><div class=\"glass-eye-actions\"><button type=\"button\" data-eye-clear>CLEAR MY PATH</button><button type=\"button\" data-eye-close>CLOSE EYE</button></div></div>";
}
function render(){
 const root=$("world-container");if(!root)return;
 const all=records(),rows=filtered(),types=[...new Set(all.map(type))].sort();
 let body="";
 if(state.tab==="atlas")body='<div class="world-intro"><span class="world-kicker">A MAP WITHOUT BORDERS</span><h3>ENTER ANYWHERE.</h3><p>Montréal, memory, music, people, places, fragments and proof are connected here. Choose a node. Follow the connection. Keep your own route.</p></div>'+graphView(rows)+'<div class="world-list">'+rows.map(card).join("")+'</div>';
 if(state.tab==="timeline"){const sorted=rows.slice().sort((a,b)=>String(a.date||a.release_date||a.moment_date||a.created_at||"9999").localeCompare(String(b.date||b.release_date||b.moment_date||b.created_at||"9999")));body='<div class="world-intro"><span class="world-kicker">THE CHRONOLOGICAL SPINE</span><h3>TIME IS A LAYER.</h3><p>Known dates, release dates and moments can coexist with unknown time. Absence stays visible.</p></div><div class="world-list">'+sorted.map(r=>'<button type="button" class="world-card" data-node="'+esc(r.id)+'"><div class="world-card-main"><span class="world-kicker">'+esc(r.date||r.release_date||r.moment_date||"DATE UNKNOWN")+'</span><h3>'+esc(title(r))+'</h3><p>'+esc(type(r))+" · "+esc(reality(r))+'</p></div></button>').join("")+'</div>';
 }
 if(state.tab==="reality"){const counts={};rows.forEach(r=>counts[reality(r)]=(counts[reality(r)]||0)+1);body='<div class="world-intro"><span class="world-kicker">REALITY IS NOT ONE THING.</span><h3>REAL / MEMORY / MYTH.</h3><p>A record can be real and uncertain, remembered and supported, dramatized without becoming a lie. The category describes the layer—not a verdict on existence.</p></div><div class="world-states">'+Object.entries(counts).map(([k,v])=>'<button class="world-state '+(state.reality===k?"active":"")+'" data-reality="'+esc(k)+'"><strong>'+esc(k)+'</strong><span>'+v+'</span></button>').join("")+'</div><div class="world-list">'+rows.slice(0,80).map(card).join("")+'</div>';
 }
 if(state.tab==="symbols"){const syms=coll("ESCIE_SYMBOLS",[..."CAMERA|DAISY|CHILD'S SHOE|NIGHTLIGHT|KEY|EMPTY CHAIR|VHS".split("|")].map((name,i)=>({id:"symbol-"+i,name})));body='<div class="world-intro"><span class="world-kicker">RECURRING VISUAL LANGUAGE</span><h3>NOT DECORATION.</h3><p>Symbols become doors when they recur. Their meaning can evolve, contradict itself or remain unknown.</p></div><div class="world-symbols">'+syms.map(s=>'<button type="button" class="world-symbol" data-node="'+esc(s.id)+'"><span class="symbol-glyph">·</span><strong>'+esc(s.name||s.title)+'</strong><small>'+esc(s.motif||"Appearances and connections will accumulate here.")+'</small></button>').join("")+'</div>';
 }
 if(state.tab==="trails")body='<div class="world-intro"><span class="world-kicker">EXPLORATION TRAILS</span><h3>NO WRONG DOOR.</h3><p>Every entry point can lead somewhere else. The audience builds its own route through the public graph.</p></div>'+trails(rows); }

 const nav='<div class="world-tabs"><button class="'+(state.eyeOpen?"active":"")+'" data-glass-eye>GLASS EYE</button>'+tabs.map(t=>'<button class="'+(state.tab===t[0]?"active":"")+'" data-world-tab="'+t[0]+'">'+t[1]+'</button>').join("")+'</div>';
 root.innerHTML='<div class="world-engine"><div class="world-header"><div><span class="world-kicker">ESCIE WORLD ENGINE</span><h3>THE WORLD BEHIND THE WORK.</h3><p>Explore the universe. Follow the signal. Decide what you believe.</p></div></div>'+nav+'<div class="world-controls"><input id="world-public-search" value="'+esc(state.q)+'" placeholder="SEARCH THE WORLD…" aria-label="Search the ESCIE world"><select id="world-public-type"><option value="ALL">ALL TYPES</option>'+types.map(t=>'<option value="'+esc(t)+'" '+(state.type===t?"selected":"")+'>'+esc(t)+'</option>').join("")+'</select></div>'+body+(state.selected?((()=>{const r=all.find(x=>String(x.id)===String(state.selected));return r?detail(r):""})()):"")+'</div>';
 if(state.eyeOpen)root.insertAdjacentHTML("beforeend",eyePanel());
 bind(root);
}
function syncNodeHash(id){try{if(id)history.replaceState(null,"","#world-node="+encodeURIComponent(String(id)));else history.replaceState(null,"",location.pathname+location.search)}catch(e){}}\nfunction bind(root){
 root.querySelectorAll("[data-glass-eye]").forEach(b=>b.onclick=()=>{state.eyeOpen=!state.eyeOpen;render()});
 root.querySelectorAll("[data-eye-clear]").forEach(b=>b.onclick=()=>{state.trail=[];state.visited=[];try{sessionStorage.removeItem("escie_world_trail");sessionStorage.removeItem("escie_world_visited")}catch(e){}render()});
 root.querySelectorAll("[data-eye-close]").forEach(b=>b.onclick=()=>{state.eyeOpen=false;render()});
 root.querySelectorAll("[data-world-tab]").forEach(b=>b.onclick=()=>{state.tab=b.dataset.worldTab;render()});
 const search=$("world-public-search");if(search)search.oninput=e=>{state.q=e.target.value;render();const x=$("world-public-search");if(x){x.focus();x.setSelectionRange(state.q.length,state.q.length)}};
 const select=$("world-public-type");if(select)select.onchange=e=>{state.type=e.target.value;render()};
 root.querySelectorAll("[data-reality]").forEach(b=>b.onclick=()=>{state.reality=b.dataset.reality;state.tab="atlas";render()});
 root.querySelectorAll("[data-node]").forEach(b=>b.onclick=e=>{e.preventDefault();remember(b.dataset.node);state.selected=b.dataset.node;syncNodeHash(state.selected);render();setTimeout(()=>document.querySelector(".world-detail")?.scrollIntoView({behavior:"smooth",block:"nearest"}),0)});
 const path=$("world-path-items");if(path){const map=new Map(records().map(r=>[String(r.id),r]));path.innerHTML=state.trail.map(id=>map.get(String(id))).filter(Boolean).map(n=>"<button type=\"button\" data-node=\""+esc(n.id)+"\">"+esc(title(n))+"</button>").join(" → ")||"START HERE";path.querySelectorAll("[data-node]").forEach(b=>b.onclick=e=>{e.preventDefault();remember(b.dataset.node);state.selected=b.dataset.node;syncNodeHash(state.selected);render()})}
 root.querySelectorAll("[data-copy-node]").forEach(b=>b.onclick=async()=>{const u=location.href.split("#")[0]+"#world-node="+encodeURIComponent(state.selected||"");try{await navigator.clipboard.writeText(u);b.textContent="COPIED";setTimeout(()=>b.textContent="COPY NODE LINK",1200)}catch(e){}});
 root.querySelectorAll("[data-close-node]").forEach(b=>b.onclick=()=>{state.selected=null;syncNodeHash(null);render()});
 root.querySelectorAll("[data-focus-search]").forEach(b=>b.onclick=()=>{const s=$("world-public-search");if(s){s.value=title(records().find(r=>String(r.id)===String(state.selected))||{});s.dispatchEvent(new Event("input"));s.focus()}});
}
function handleWorldHash(){const hash=location.hash.match(/^#world-node=(.+)$/);if(!hash){state.selected=null;render();return}try{const id=decodeURIComponent(hash[1]);if(records().some(r=>String(r.id)===String(id))){state.selected=id;remember(id);render();}}catch(e){}}
function init(){
 loadTrail();
 const hash=location.hash.match(/^#world-node=(.+)$/);if(hash){try{state.selected=decodeURIComponent(hash[1]);remember(state.selected)}catch(e){}}
 const nav=document.getElementById("main-navigation"),root=$("world-container");if(!nav||!root)return;
 if(!nav.querySelector('a[href="#world"]')){const a=document.createElement("a");a.href="#world";a.textContent="THE WORLD";a.dataset.route="world";nav.appendChild(a)}
 render();
}
window.addEventListener("hashchange",handleWorldHash);\nif(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();