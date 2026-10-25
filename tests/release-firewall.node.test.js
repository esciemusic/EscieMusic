/*
 * ESCIE TESTS — RELEASE FIREWALL SOURCE
 *
 * Public source must contain no release queue material.
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
  const injector=read("publishing/inject-release.js");

  assert(!music.includes('release_status:"locked"'),"public music source must not contain locked releases");
  assert(!music.includes("bam-001-dallas-63"),"public music source must not contain transmitted BAM metadata");
  assert((music.match(/"id":/g)||[]).length===0,"public music source must contain no music records");
  assert(!projects.includes("bam-by-any-means"),"public project source must not contain release metadata");
  assert((projects.match(/trackId:/g)||[]).length===0,"public project source must contain no BAM structure");
  assert(!relationships.includes("bam-001-dallas-63"),"public relationships must not contain release-project metadata");
  return {passed:true};
}

if(require.main===module) console.log(JSON.stringify(run()));
module.exports={run};
