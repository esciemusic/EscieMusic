const fs=require('fs');
function assert(condition,message){if(!condition)throw new Error(message);}
function loadRuntime(){
  const source=fs.readFileSync('data/release-runtime.js','utf8');
  const match=source.match(/const ESCIE_RELEASE_RUNTIME=(.*?);\n/);
  if(!match)throw new Error('generated release runtime payload not found');
  return JSON.parse(match[1]);
}
function run(){
  const runtime=loadRuntime();
  assert(Array.isArray(runtime.music),'runtime music must be an array');
  assert(Array.isArray(runtime.relationships),'runtime relationships must be an array');
  assert(Array.isArray(runtime.projects),'runtime projects must be an array');
  assert(runtime.projectStructures&&typeof runtime.projectStructures==='object','runtime project structures must be an object');
  const musicById=new Map();
  runtime.music.forEach(track=>{
    assert(track&&track.id,'generated track must have an id');
    assert(track.release_status==='released','generated runtime must never contain locked tracks');
    assert(track.published===true,'generated tracks must be published');
    assert(track.visibility==='public','generated tracks must be public');
    assert(!musicById.has(track.id),'generated tracks must have unique ids');
    musicById.set(track.id,track);
  });
  const projectsById=new Map(runtime.projects.map(project=>[project.id,project]));
  Object.entries(runtime.projectStructures).forEach(([projectId,parts])=>{
    assert(projectsById.has(projectId),'every generated structure needs a generated project shell');
    assert(Array.isArray(parts),'generated project structure must be an array');
    const seen=new Set();
    parts.forEach(part=>{
      assert(part&&musicById.has(part.trackId),'generated project structure must reference a released track');
      assert(musicById.get(part.trackId).project===projectId,'generated structure track must belong to its project');
      assert(!seen.has(part.trackId),'generated project structure must not duplicate track ids');
      seen.add(part.trackId);
    });
  });
  runtime.relationships.forEach(rel=>{
    assert(rel&&rel.from&&rel.to,'generated relationship must have endpoints');
    assert(projectsById.has(rel.from)||musicById.has(rel.from),'generated relationship source must exist');
    assert(projectsById.has(rel.to)||musicById.has(rel.to),'generated relationship target must exist');
    assert(rel.public_disclosure===true,'generated relationships must be publicly disclosable');
  });
  return {passed:true,tracks:runtime.music.length,projects:runtime.projects.length};
}
if(require.main===module)console.log(JSON.stringify(run()));
module.exports={run};