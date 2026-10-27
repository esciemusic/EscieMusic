/*
 * ESCIE PRIVATE RELEASE INJECTOR
 *
 * Reads ESCIE_RELEASE_QUEUE_JSON from the GitHub Actions environment.
 * Only records explicitly marked released are written into the Pages artifact.
 * The queue never belongs in the public repository.
 */
const fs=require("fs");
const raw=process.env.ESCIE_RELEASE_QUEUE_JSON||"";
const output="data/release-runtime.js";
if(!raw.trim()) console.log("Release injector: no private queue supplied; emitting empty public release runtime.");
function fail(message){throw new Error("Release injector: "+message);}
let queue={tracks:[]};
if(raw.trim()){
  try{queue=JSON.parse(raw);}catch(error){fail("ESCIE_RELEASE_QUEUE_JSON is not valid JSON");}
}
if(!queue||typeof queue!=="object"||!Array.isArray(queue.tracks)) fail("queue must be an object with a tracks array");
const allowedStatuses=new Set(["locked","released"]);
queue.tracks.forEach(track=>{
  if(!track||typeof track!=="object") fail("every queue entry must be an object");
  if(!track.id) fail("every queue entry requires an id");
  if(!allowedStatuses.has(String(track.release_status||"").toLowerCase())) fail("invalid release_status for "+track.id);
});
const released=queue.tracks.filter(track=>track&&String(track.release_status).toLowerCase()==="released");
const seen=new Set();
released.forEach(track=>{
  if(seen.has(track.id)) fail("duplicate released track id: "+track.id);
  seen.add(track.id);
  if(!track.title||!track.number||!track.role) fail("released track requires id, number, title and role: "+track.id);
  if(track.published!==true) fail("released track must be published: "+track.id);
  if(track.visibility!=="public") fail("released track must be public: "+track.id);
  if(track.status&& !["development","active","published","archived","silence"].includes(String(track.status).toLowerCase())) fail("invalid status: "+track.id);
  if(!track.project) fail("released track requires a project: "+track.id);
});
released.sort((a,b)=>String(a.number||"").localeCompare(String(b.number||""),undefined,{numeric:true}));
const projectStructures={};
const projects=[];
released.forEach(track=>{
  if(!projectStructures[track.project]) projectStructures[track.project]=[];
  if(!projects.some(project=>project.id===track.project)){
    projects.push({id:track.project,artist:track.artist||"ESCIE",title:track.project_title||track.project,type:"project",status:"active",published:true,release_mode:"progressive",visibility:"public",description:track.project_description||"",structure:[]});
  }
  projectStructures[track.project].push({number:track.number,title:track.title,role:track.role,trackId:track.id});
});
const relationships=released.map(track=>({id:"rel-"+track.project+"-contains-"+track.id.replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,""),from:track.project,type:"contains",to:track.id,status:"active",confidence:"verified",canonical_status:"canonical",visibility:"public",public_disclosure:true}));
const payload="/* GENERATED — public released subset only. */\\n"+
"const ESCIE_RELEASE_RUNTIME="+JSON.stringify({music:released,relationships,projectStructures,projects})+";\\n"+
"if(typeof window!==\"undefined\")window.ESCIE_RELEASE_RUNTIME=ESCIE_RELEASE_RUNTIME;\\n"+
"if(typeof module!==\"undefined\"&&module.exports)module.exports=ESCIE_RELEASE_RUNTIME;\\n";
fs.writeFileSync(output,payload,{encoding:"utf8"});
console.log("Release injector: "+released.length+" transmitted record(s) emitted.");
