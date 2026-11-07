const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("closed public sections collapse to their index row",()=>{
  const css=read("aesthetic.css");
  assert.match(css,/\.section-collapsed\{min-height:0 !important;\}/,"collapsed sections must override the base min-height");
  assert.match(css,/\.section-collapsed \.section-drop-panel\{display:none !important;\}/,"collapsed panels must not reserve layout space");
});

test("public source keeps unreleased work sealed",()=>{
  const index=read("index.html");
  const projects=read("data/projects.js");
  const music=read("data/music.js");
  const investigation=read("data/investigation.js");
  const runtime=read("data/release-runtime.js");
  assert.doesNotMatch(index,/BAM|Dallas['’]?\s*['’]?63/i,"index must not expose unreleased BAM/Dallas content");
  assert.match(projects,/ESCIE_PROJECTS=\[\]/,"public project registry must remain empty until release");
  assert.match(music,/ESCIE_MUSIC=\[\]/,"public music registry must remain empty until release");
  assert.match(investigation,/ESCIE_INVESTIGATION = \[\]/,"public investigation registry must remain empty until approved case-file material exists");
  assert.match(runtime,/music:\[\]/,"deploy-time release runtime must contain no unreleased music in the checked-in public source");
  assert.match(runtime,/projects:\[\]/,"deploy-time release runtime must contain no unreleased projects in the checked-in public source");
});

test("public/Central boundary remains explicit",()=>{
  const boundary=read("REPOSITORY_BOUNDARY.md");
  assert.match(boundary,/No cross-repository source imports/);
  assert.match(boundary,/Central operational state remains owned by EscieCentral\/Supabase/);
  assert.doesNotMatch(indexFrom("index.html"),/EscieCentral|github\.com\/esciemusic\/EscieCentral/i);assert.doesNotMatch(indexFrom("data\/file-manifest.js"),/central-connect\/|central\//i);
});

function indexFrom(p){return read(p);}
