/*
 * ESCIE TESTS — RELEASE FIREWALL SOURCE
 *
 * The public repository must contain only transmitted BAM metadata.
 * Future release metadata belongs only in the GitHub Actions secret queue.
 */
const fs=require("fs");

function assert(condition,message){
  if(!condition) throw new Error(message);
}

function read(path){return fs.readFileSync(path,"utf8");}

function run(){
  const music=read("data/music.js");
  const projects=read("data/projects.js");
  const relationships=read("data/relationships.js");
  const runtime=read("data/release-runtime.js");
  const injector=read("publishing/inject-release.js");

  assert(!music.includes('release_status:"locked"'),"public music source must not contain locked releases");
  assert((music.match(/"id":/g)||[]).length===1,"public music source must contain only transmitted music records");
  assert((projects.match(/trackId:/g)||[]).length===1,"public project source must contain only transmitted project structure");
  assert((relationships.match(/type:"contains"/g)||[]).length===1,"public relationship source must contain only transmitted containment links");
  assert(runtime.includes("music:[]")&&runtime.includes("relationships:[]"),"checked-in release runtime must remain empty");
  assert(!injector.includes("DALLAS '63")&&!injector.includes("PUMPY TO THE CHEST")&&!injector.includes("I NEED A FLEX"),"release injector source must not contain release titles");
  return {passed:true};
}

if(require.main===module) console.log(JSON.stringify(run()));
module.exports={run};
