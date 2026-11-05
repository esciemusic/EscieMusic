const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("ESCIE identity remains the artist endpoint",()=>{
  const index=read("index.html");
  const app=read("app.js");
  assert.match(index,/id="escie" class="site-section escie-section"/);
  assert.match(index,/ESCIE IS THE ARTIST\. THE WORK SPEAKS FROM HERE\./);
  assert.match(app,/function renderAbout\(\)/);
  assert.match(app,/ESCIE IS THE ARTIST\. THE WORK SPEAKS FROM HERE\./);
});

test("ESCIE identity does not expose unreleased BAM material",()=>{
  const index=read("index.html");
  const about=read("data/about.js");
  assert.doesNotMatch(index,/BAM|Dallas['’]?\s*['’]?63/i);
  assert.doesNotMatch(about,/BAM|Dallas['’]?\s*['’]?63/i);
});
