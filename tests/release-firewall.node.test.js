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

  assert(!music.includes('release_status:"locked"'),"public music source must not contain locked releases");
  assert(!projects.includes("PUMPY TO THE CHEST"),"public project source must not contain unreleased track titles");
  assert(!projects.includes("I NEED A FLEX"),"public project source must not contain unreleased track titles");
  assert(!projects.includes("SANA, SANA, COLITA DE RANA"),"public project source must not contain unreleased track titles");
  assert(!projects.includes("BACC 2 BASICS"),"public project source must not contain unreleased track titles");
  assert(!projects.includes("DICHOTOMY"),"public project source must not contain unreleased track titles");
  assert(!relationships.includes("bam-002-pumpy-to-the-chest"),"public relationship source must not contain unreleased track ids");
  assert(!relationships.includes("bam-003-i-need-a-flex"),"public relationship source must not contain unreleased track ids");
  assert(!relationships.includes("bam-004-sana-sana"),"public relationship source must not contain unreleased track ids");
  assert(!relationships.includes("bam-005-bacc-2-basics"),"public relationship source must not contain unreleased track ids");
  assert(!relationships.includes("bam-006-dichotomy"),"public relationship source must not contain unreleased track ids");
  assert(runtime.includes("music:[]")&&runtime.includes("relationships:[]"),"checked-in release runtime must remain empty");
  return {passed:true};
}

if(require.main===module) console.log(JSON.stringify(run()));
module.exports={run};
