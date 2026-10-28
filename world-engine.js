(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const coll=(name,fallback=[])=>{const v=window[name];return Array.isArray(v)?v:(v&&Array.isArray(v.records)?v.records:fallback)};
const state={tab:"atlas",q:"",reality:"ALL",type:"ALL"};
const tabs=[["atlas","ATLAS"],["timeline","TIMELINE"],["reality","REALITY"],["symbols","SYMBOLS"],["trails","TRAILS"]];
function records(){
 const sources=[
  coll("ESCIE_MUSIC"),coll("ESCIE_PEOPLE"),coll("ESCIE_LOCATIONS"),coll("ESCIE_MOMENTS"),
  coll("ESCIE_FRAGMENTS"),coll("ESCIE_BODIES"),coll("ESCIE_PATHS"),coll("ESCIE_NODES"),
  coll("ESCIE_PROJECTS"),coll("ESCIE_ARCHIVE"),coll("ESCIE_INVESTIGATION")
 ];
 const seen=new Set(),out=[];
 sources.flat().forEach(r=>{if(!r||typeof r!=="object")return;const id=r.id||r.recordId||r.slug||r.title;if(id&&!seen.has(id)){seen.add(id);out.push(r)}});
 return out;
}
function type(r){return String(r.type||r.kind||r.category||"WORK").toUpperCase()}
function reality(r){return String(r.reality_level||r.reality||"UNKNOWN").toUpperCase()}
function title(r){return r.title||r.name||r.label||"UNTITLED"}
function filtered(){
 const q=state.q.toLowerCase().trim();
 return records().filter(r=>(state.type==="ALL"||type(r)===state.type)&&(state.reality==="ALL"||reality(r)===state.reality)&&(!q||JSON.stringify(r).toLowerCase().includes(q)));
}
function card(r){
 const desc=r.description||r.summary||r.story||"A doorway into the ESCIE universe.";
 return '<article class="world-card"><div class="world-card-main"><span class="world-kicker">'+esc(type(r))+' · '+esc(reality(r))+'</span><h3>'+esc(title(r))+'</h3><p>'+esc(String(desc).slice(0,220))+'</p></div><span class="world-arrow" aria-hidden="true">↗</span></article>';
}
function render(){
 const root=$("world-container");if(!root)return;
 const all=records(),rows=filtered(),types=[...new Set(all.map(type))].sort();
 let body="";
 if(state.tab==="atlas")body='<div class="world-intro"><span class="world-kicker">A MAP WITHOUT BORDERS</span><h3>ENTER ANYWHERE.</h3><p>Montréal, memory, music, people, places, fragments and proof are connected here. The world does not ask you to follow one path.</p></div><div class="world-stats"><span>'+all.length+' NODES</span><span>'+new Set(all.map(reality)).size+' REALITY STATES</span><span>∞ CONNECTIONS</span></div><div class="world-list">'+rows.map(card).join("")+'</div>';
 if(state.tab==="timeline"){const sorted=rows.slice().sort((a,b)=>String(a.date||a.release_date||a.moment_date||a.created_at||"9999").localeCompare(String(b.date||b.release_date||b.moment_date||b.created_at||"9999")));body='<div class="world-intro"><span class="world-kicker">THE CHRONOLOGICAL SPINE</span><h3>TIME IS A LAYER.</h3><p>Known dates, release dates and moments can coexist with unknown time. Absence stays visible.</p></div><div class="world-list">'+sorted.map(r=>'<article class="world-card"><div class="world-card-main"><span class="world-kicker">'+esc(r.date||r.release_date||r.moment_date||"DATE UNKNOWN")+'</span><h3>'+esc(title(r))+'</h3><p>'+esc(type(r))+' · '+esc(reality(r))+'</p></div></article>').join("")+'</div>';
 if(state.tab==="reality"){const counts={};rows.forEach(r=>counts[reality(r)]=(counts[reality(r)]||0)+1);body='<div class="world-intro"><span class="world-kicker">REALITY IS NOT ONE THING.</span><h3>REAL / MEMORY / MYTH.</h3><p>A record can be real and uncertain, remembered and supported, dramatized without becoming a lie. The categories describe the layer—not a verdict on existence.</p></div><div class="world-states">'+Object.entries(counts).map(([k,v])=>'<button class="world-state '+(state.reality===k?"active":"")+'" data-reality="'+esc(k)+'"><strong>'+esc(k)+'</strong><span>'+v+'</span></button>').join("")+'</div><div class="world-list">'+rows.slice(0,60).map(card).join("")+'</div>';
 if(state.tab==="symbols"){const syms=coll("ESCIE_SYMBOLS",[...["CAMERA","DAISY","CHILD'S SHOE","NIGHTLIGHT","KEY","EMPTY CHAIR","VHS"].map((name,i)=>({id:"symbol-"+i,name}))]);body='<div class="world-intro"><span class="world-kicker">RECURRING VISUAL LANGUAGE</span><h3>NOT DECORATION.</h3><p>Symbols become doors when they recur. Their meaning can evolve, contradict itself or remain unknown.</p></div><div class="world-symbols">'+syms.map(s=>'<article class="world-symbol"><span class="symbol-glyph">·</span><strong>'+esc(s.name||s.title)+'</strong><small>'+esc(s.motif||"Appearances and connections will accumulate here.")+'</small></article>').join("")+'</div>';
 if(state.tab==="trails"){const trails=[["MUSIC → PLACE → MEMORY","Start with a song and follow where it happened."],["PERSON → MOMENT → STORY","Follow a person through the moments they touch."],["SYMBOL → ART → PROJECT","Track an image as it changes meaning."],["QUESTION → EVIDENCE → CONTRADICTION","Investigate without forcing an answer."]];body='<div class="world-intro"><span class="world-kicker">EXPLORATION TRAILS</span><h3>NO WRONG DOOR.</h3><p>Every entry point can lead somewhere else. The audience builds its own route through the world.</p></div><div class="world-list">'+trails.map(t=>'<article class="world-card"><div class="world-card-main"><span class="world-kicker">TRAIL</span><h3>'+t[0]+'</h3><p>'+t[1]+'</p></div><span class="world-arrow">→</span></article>').join("")+'</div>';
 const nav='<div class="world-tabs">'+tabs.map(t=>'<button class="'+(state.tab===t[0]?"active":"")+'" data-world-tab="'+t[0]+'">'+t[1]+'</button>').join("")+'</div>';
 root.innerHTML='<div class="world-engine"><div class="world-header"><div><span class="world-kicker">ESCIE WORLD ENGINE</span><h3>THE WORLD BEHIND THE WORK.</h3><p>Explore the universe. Follow the signal. Decide what you believe.</p></div></div>'+nav+'<div class="world-controls"><input id="world-public-search" value="'+esc(state.q)+'" placeholder="SEARCH THE WORLD…" aria-label="Search the ESCIE world"><select id="world-public-type"><option value="ALL">ALL TYPES</option>'+types.map(t=>'<option '+(state.type===t?"selected":"")+'>'+esc(t)+'</option>').join("")+'</select></div>'+body+'</div>';
 root.querySelectorAll("[data-world-tab]").forEach(b=>b.onclick=()=>{state.tab=b.dataset.worldTab;render()});
 const search=$("world-public-search");if(search){search.oninput=e=>{state.q=e.target.value;render();const x=$("world-public-search");if(x){x.focus();x.setSelectionRange(state.q.length,state.q.length)}}}
 const select=$("world-public-type");if(select)select.onchange=e=>{state.type=e.target.value;render()};
 root.querySelectorAll("[data-reality]").forEach(b=>b.onclick=()=>{state.reality=b.dataset.reality;state.tab="atlas";render()});
}
function init(){
 const nav=document.getElementById("main-navigation"),root=$("world-container");if(!nav||!root)return;
 if(!nav.querySelector('a[href="#world"]')){const a=document.createElement("a");a.href="#world";a.textContent="THE WORLD";a.dataset.route="world";nav.appendChild(a)}
 render();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();