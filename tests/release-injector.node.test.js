/*
 * ESCIE TESTS — RELEASE INJECTOR
 *
 * Exercises the private queue -> public runtime boundary without storing
 * unreleased material in the repository.
 */
const fs=require("fs");
const os=require("os");
const path=require("path");
const child=require("child_process");

function assert(condition,message){if(!condition)throw new Error(message);}

function run(){
  const script=path.resolve("publishing/inject-release.js");
  const tempDir=fs.mkdtempSync(path.join(os.tmpdir(),"escie-release-"));
  const cwd=process.cwd();
  try{
    fs.mkdirSync(path.join(tempDir,"data"),{recursive:true});
    fs.copyFileSync("publishing/inject-release.js",path.join(tempDir,"inject-release.js"));
    const queue={
      tracks:[
        {id:"test-001-transmission",project:"test-project",project_title:"TEST PROJECT",project_description:"ESCIE debut project",number:"001",title:"TRANSMISSION ONE",role:"THE FIRST",release_status:"released",published:true,visibility:"public"},
        {id:"test-002-private",project:"test-project",number:"002",title:"PRIVATE TITLE",role:"THE MONSTER",release_status:"locked",published:true,visibility:"public"}
      ]
    };
    const result=child.spawnSync(process.execPath,[path.join(tempDir,"inject-release.js")],{
      cwd:tempDir,
      env:Object.assign({},process.env,{ESCIE_RELEASE_QUEUE_JSON:JSON.stringify(queue)}),
      encoding:"utf8"
    });
    assert(result.status===0,"release injector must accept a valid queue");
    const generated=fs.readFileSync(path.join(tempDir,"data","release-runtime.js"),"utf8");
    assert(generated.includes("test-001-transmission"),"released record must enter generated runtime");
    assert(generated.includes('"projects":[{"id":"test-project"'),"released project shell must enter generated runtime");
    assert(generated.includes('"trackId":"test-001-transmission"'),"released project structure must contain released track");
    assert(!generated.includes("test-002-private"),"locked record must never enter generated runtime");
    assert(!generated.includes("PRIVATE TITLE"),"locked title must never enter generated runtime");

    const invalidQueue={
      tracks:[{id:"bad-status",project:"test-project",number:"002",title:"Bad",role:"THE MONSTER",release_status:"maybe",published:true,visibility:"public"}]
    };
    const invalid=child.spawnSync(process.execPath,[path.join(tempDir,"inject-release.js")],{
      cwd:tempDir,
      env:Object.assign({},process.env,{ESCIE_RELEASE_QUEUE_JSON:JSON.stringify(invalidQueue)}),
      encoding:"utf8"
    });
    assert(invalid.status!==0,"invalid release status must fail the private build");
    return {passed:true};
  } finally {
    fs.rmSync(tempDir,{recursive:true,force:true});
  }
}

if(require.main===module)console.log(JSON.stringify(run()));
module.exports={run};
