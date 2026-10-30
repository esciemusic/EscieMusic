const fs=require("fs");
const path=require("path");
const cp=require("child_process");
const ROOT=path.join(__dirname,"..");
const SKIP=new Set(["node_modules",".git"]);
function walk(dir,out=[]){
  for(const name of fs.readdirSync(dir,{withFileTypes:true})){
    if(SKIP.has(name.name))continue;
    const full=path.join(dir,name.name);
    if(name.isDirectory())walk(full,out);
    else if(name.isFile()&&name.name.endsWith(".js"))out.push(full);
  }
  return out;
}
const files=walk(ROOT);
const failures=[];
for(const file of files){
  const r=cp.spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
  if(r.status!==0)failures.push({file:path.relative(ROOT,file),error:(r.stderr||r.stdout||"").trim()});
}
if(failures.length)throw new Error("JavaScript syntax failures:\n"+failures.map(x=>x.file+"\n"+x.error).join("\n"));
console.log("ESCIE JavaScript syntax sweep OK:",files.length,"files");
