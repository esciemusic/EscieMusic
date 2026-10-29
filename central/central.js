(function(){
"use strict";
const STORAGE_KEY="escie-central-drafts-v1";
const state={drafts:loadDrafts(),tasks:[],view:"home"};

function loadDrafts(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch(e){return[]}}
function saveDrafts(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state.drafts))}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function routesFor(type,text){
  const t=(type+" "+text).toLowerCase(), routes=[];
  if(/music|song|track|album/.test(t)){routes.push("WEB / WORK","ARCHIVE","SOCIAL / ANNOUNCEMENT")}
  if(/photo|visual|image|video/.test(t)){routes.push("ARCHIVE","WEB / GLASS EYE","SOCIAL")}
  if(/investigat|evidence|proof|question/.test(t)){routes.push("INVESTIGATION","ARCHIVE")}
  if(/event|release|show|drop/.test(t)){routes.push("NOW","WEB / TIMELINE","SOCIAL")}
  if(/story|memory|moment|people|place/.test(t)){routes.push("ARCHIVE","THE WEB")}
  if(!routes.length)routes.push("CENTRAL DRAFT","REVIEW ROUTING")
  return [...new Set(routes)]
}
function render(){
  document.getElementById("content-count").textContent=state.drafts.length;
  document.getElementById("task-count").textContent=state.tasks.length;
  const view=document.getElementById("view");
  const views={
    home:["COMMAND","The private control layer for the ESCIE ecosystem.",homeView()],
    post:["POST","Create one source record and let Central determine the downstream destinations.",postView()],
    work:["WORK","Projects, songs, releases and creative production live here.",genericView("No canonical work records are connected to Central yet.","The first connector will read the existing ESCIE project/music registries without duplicating them.")],
    archive:["ARCHIVE","One source of truth for media, documents, people, places, moments and evidence.",genericView("Archive connector staged.","Central will eventually ingest files, normalize metadata and preserve relationships.")],
    social:["SOCIAL","Prepare once, then distribute to connected platforms.",genericView("Publishing connectors are staged.","No external account is claimed connected from this app yet.")],
    web:["WEB","The public website is a destination, not the control room.",genericView("Website bridge staged.","Approved Central records will eventually become public website updates.")],
    investigation:["INVESTIGATION","Questions, sources, evidence, connections and certainty.",genericView("Investigation workspace staged.","Nothing is treated as verified unless its evidence supports it.")],
    tasks:["TASKS","The things that need to happen next.",tasksView()],
    brain:["BRAIN","The recommendation and routing layer. ESCIE remains the authority.",brainView()]
  };
  const v=views[state.view]||views.home;
  view.innerHTML='<p class="eyebrow">ESCIE CENTRAL</p><h2>'+esc(v[0])+'</h2><p class="view-lede">'+esc(v[1])+'</p>'+v[2];
  view.focus({preventScroll:true});
}
function homeView(){
  const latest=state.drafts.slice(-3).reverse();
  return '<div class="module-grid"><div class="module"><h3>QUICK POST</h3><p>Create content here first. Central will classify it and propose destinations before anything is published.</p><button class="primary-action" id="home-post" type="button" style="margin-top:14px">＋ CREATE</button></div><div class="module"><h3>APPROVAL GATE</h3><p>External publishing stays behind an explicit approval step. The Brain can suggest; it cannot silently publish.</p></div><div class="module"><h3>RECENT DRAFTS</h3>'+(latest.length?'<div class="list">'+latest.map(d=>'<div class="list-row"><strong>'+esc(d.type.toUpperCase())+'</strong><span>'+esc(d.text.slice(0,70))+'</span></div>').join("")+'</div>':'<div class="empty">No drafts yet.</div>')+'</div><div class="module"><h3>CONNECTOR STATE</h3><p>Website: staged · Social: staged · Archive: staged · Brain: local routing prototype.</p></div></div>';
}
function postView(){return '<div class="module"><h3>ONE SOURCE → MANY DESTINATIONS</h3><p>Use ＋ POST above to create a source record. This prototype stores drafts locally on the device and generates routing suggestions. External publishing is intentionally not active yet.</p></div>'}
function tasksView(){return state.tasks.length?'<div class="list">'+state.tasks.map(t=>'<div class="list-row"><strong>'+esc(t)+'</strong><span>OPEN</span></div>').join("")+'</div>':'<div class="empty">No tasks yet. Tasks will eventually be generated from missing metadata, unfinished work and approved recommendations.</div>'}
function brainView(){return '<div class="module-grid"><div class="module"><h3>ROUTER</h3><p>Classifies a draft and suggests destinations using explicit rules first.</p></div><div class="module"><h3>CERTAINTY</h3><p>Tracks context, provenance, open questions and unresolved connections without defining what the audience must believe.</p></div><div class="module"><h3>APPROVAL</h3><p>Human approval remains the final authority for publishing and important canon changes.</p></div><div class="module"><h3>NEXT</h3><p>Connect canonical registries, secure backend storage, file ingestion and real publishing APIs.</p></div></div>'}
function genericView(title,body){return '<div class="attention"><strong>'+esc(title)+'</strong><br>'+esc(body)+'</div>'}

function openComposer(){document.getElementById("post-dialog").showModal();document.getElementById("post-text").focus()}
function analyze(){
  const text=document.getElementById("post-text").value.trim(),type=document.getElementById("post-type").value,context=document.getElementById("post-context").value.trim();
  const routes=routesFor(type,text+" "+context);
  document.getElementById("routing-output").innerHTML=routes.map(r=>'<span class="route-chip">'+esc(r)+'</span>').join("");
  if(!text){document.getElementById("post-text").focus();return}
  state.drafts.push({id:"draft-"+Date.now(),text,type,context,routes,createdAt:new Date().toISOString()});
  saveDrafts();render();
  document.getElementById("post-dialog").close();
}
document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{state.view=btn.dataset.view;document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("is-active",b===btn));render()}));
document.getElementById("new-post").addEventListener("click",openComposer);
document.getElementById("analyze-post").addEventListener("click",analyze);
document.getElementById("view").addEventListener("click",e=>{if(e.target&&e.target.id==="home-post")openComposer()});
document.getElementById("post-dialog").addEventListener("click",e=>{if(e.target===e.currentTarget)e.currentTarget.close()});
render();
if("serviceWorker" in navigator){navigator.serviceWorker.register("./sw.js").catch(()=>{})}
})();