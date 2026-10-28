(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const coll=(name,fallback=[])=>{const v=window[name];return Array.isArray(v)?v:(v&&Array.isArray(v.records)?v.records:fallback)};
const state={tab:"atlas",q:"",reality:"ALL",type:"ALL",selected:null};
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
 return local.concat(coll("ESCIE_RELATIONSHIPS_PUBLIC")).filter(r=>r&&r.from&&r.to&&(r.visibility===undefined||String(r.visibility).toLowerCase()==="public")&&(r.status===undefined||!["withheld","archived","inactive"].includes(String(r.status).toLowerCase())));
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
function detail(r){
 const links=related(r.id);
 return '<aside class="world-detail" aria-live="polite"><div class="world-detail-head"><div><span class="world-kicker">NODE // '+esc(type(r))+'</span><h3>'+esc(title(r))+'</h3></div><button type="button" class="world-close" data-close-node aria-label="Close node">×</button></div><div class="world-detail-meta"><span>'+esc(reality(r))+'</span><span>'+esc(String(r.certainty||"UNKNOWN").toUpperCase())+'</span><span>'+esc(String(r.status||"UNKNOWN").toUpperCase())+'</span></div><p>'+esc(r.description||r.summary||r.story||"No public description yet.")+'</p><div class="world-kicker">CONNECTIONS · '+links.length+'</div><div class="world-connections">'+(links.length?links.map(x=>'<button type="button" data-node="'+esc(x.node.id)+'"><strong>'+esc(title(x.node))+'</strong><small>'+esc(x.r.type||"related")+'</small></button>').join(""):'<span class="world-empty">No public connection recorded yet.</span>')+'</div><div class="world-detail-actions"><button type="button" data-focus-search>SEARCH THIS NODE</button></div></aside>';
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
function render(){
 const root=$("world-container");if(!root)return;
 const all=records(),rows=filtered(),types=[...new Set(all.map(type))].sort();
 let body="";
 if(state.tab==="atlas")body='<div class="world-intro"><span class="world-kicker">A MAP WITHOUT BORDERS</span><h3>ENTER ANYWHERE.</h3><p>Montréal, memory, music, people, places, fragments and proof are connected here. Choose a node. Follow the connection. Keep your own route.</p></div>'+graphView(rows)+'<div class="world-list">'+rows.map(card).join("")+'</div>';
 if(state.tab==="timeline"){const sorted=rows.slice().sort((a,b)=>String(a.date||a.release_date||a.moment_date||a.created_at||"9999").localeCompare(String(b.date||b.release_date||b.moment_date||b.created_at||"9999")));body='<div class="world-intro"><span class="world-kicker">THE CHRONOLOGICAL SPINE</span><h3>TIME IS A LAYER.</h3><p>Known dates, release dates and moments can coexist with unknown time. Absence stays visible.</p></div><div class="world-list">'+sorted.map(r=>'<button type="button" class="world-card" data-node="'+esc(r.id)+'"><div class="world-card-main"><span class="world-kicker">'+esc(r.date||r.release_date||r.moment_date||"DATE UNKNOWN")+'</span><h3>'+esc(title(r))+'</h3><p>'+esc(type(r))+" · "+esc(reality(r))+'</p></div></button>').join("")+'</div>';
 if(state.tab==="reality"){const counts={};rows.forEach(r=>counts[reality(r)]=(counts[reality(r)]||0)+1);body='<div class="world-intro"><span class="world-kicker">REALITY IS NOT ONE THING.</span><h3>REAL / MEMORY / MYTH.</h3><p>A record can be real and uncertain, remembered and supported, dramatized without becoming a lie. The category describes the layer—not a verdict on existence.</p></div><div class="world-states">'+Object.entries(counts).map(([k,v])=>'<button class="world-state '+(state.reality===k?"active":"")+'" data-reality="'+esc(k)+'"><strong>'+esc(k)+'</strong><span>'+v+'</span></button>').join("")+'</div><div class="world-list">'+rows.slice(0,80).map(card).join("")+'</div>';
 if(state.tab==="symbols"){const syms=coll("ESCIE_SYMBOLS",[..."CAMERA|DAISY|CHILD'S SHOE|NIGHTLIGHT|KEY|EMPTY CHAIR|VHS".split("|")].map((name,i)=>({id:"symbol-"+i,name})));body='<div class="world-intro"><span class="world-kicker">RECURRING VISUAL LANGUAGE</span><h3>NOT DECORATION.</h3><p>Symbols become doors when they recur. Their meaning can evolve, contradict itself or remain unknown.</p></div><div class="world-symbols">'+syms.map(s=>'<button type="button" class="world-symbol" data-node="'+esc(s.id)+'"><span class="symbol-glyph">·</span><strong>'+esc(s.name||s.title)+'</strong><small>'+esc(s.motif||"Appearances and connections will accumulate here.")+'</small></button>').join("")+'</div>';
 if(state.tab==="trails")body='<div class="world-intro"><span class="world-kicker">EXPLORATION TRAILS</span><h3>NO WRONG DOOR.</h3><p>Every entry point can lead somewhere else. The audience builds its own route through the public graph.</p></div>'+trails(rows);
 const nav='<div class="world-tabs">'+tabs.map(t=>'<button class="'+(state.tab===t[0]?"active":"")+'" data-world-tab="'+t[0]+'">'+t[1]+'</button>').join("")+'</div>';
 root.innerHTML='<div class="world-engine"><div class="world-header"><div><span class="world-kicker">ESCIE WORLD ENGINE</span><h3>THE WORLD BEHIND THE WORK.</h3><p>Explore the universe. Follow the signal. Decide what you believe.</p></div></div>'+nav+'<div class="world-controls"><input id="world-public-search" value="'+esc(state.q)+'" placeholder="SEARCH THE WORLD…" aria-label="Search the ESCIE world"><select id="world-public-type"><option value="ALL">ALL TYPES</option>'+types.map(t=>'<option value="'+esc(t)+'" '+(state.type===t?"selected":"")+'>'+esc(t)+'</option>').join("")+'</select></div>'+body+(state.selected?((()=>{const r=all.find(x=>String(x.id)===String(state.selected));return r?detail(r):""})()):"")+'</div>';
 bind(root);
}
function bind(root){
 root.querySelectorAll("[data-world-tab]").forEach(b=>b.onclick=()=>{state.tab=b.dataset.worldTab;render()});
 const search=$("world-public-search");if(search)search.oninput=e=>{state.q=e.target.value;render();const x=$("world-public-search");if(x){x.focus();x.setSelectionRange(state.q.length,state.q.length)}};
 const select=$("world-public-type");if(select)select.onchange=e=>{state.type=e.target.value;render()};
 root.querySelectorAll("[data-reality]").forEach(b=>b.onclick=()=>{state.reality=b.dataset.reality;state.tab="atlas";render()});
 root.querySelectorAll("[data-node]").forEach(b=>b.onclick=e=>{e.preventDefault();state.selected=b.dataset.node;render();setTimeout(()=>document.querySelector(".world-detail")?.scrollIntoView({behavior:"smooth",block:"nearest"}),0)});
 root.querySelectorAll("[data-close-node]").forEach(b=>b.onclick=()=>{state.selected=null;render()});
 root.querySelectorAll("[data-focus-search]").forEach(b=>b.onclick=()=>{const s=$("world-public-search");if(s){s.value=title(records().find(r=>String(r.id)===String(state.selected))||{});s.dispatchEvent(new Event("input"));s.focus()}});
}
function init(){
 const nav=document.getElementById("main-navigation"),root=$("world-container");if(!nav||!root)return;
 if(!nav.querySelector('a[href="#world"]')){const a=document.createElement("a");a.href="#world";a.textContent="THE WORLD";a.dataset.route="world";nav.appendChild(a)}
 render();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();