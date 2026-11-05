const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("ESCIE identity remains the artist endpoint",()=>{
  const index=read("index.html");
  const app=read("app.js");
  const about=read("data/about.js");
  assert.match(index,/id="escie" class="site-section escie-section"/);
  assert.match(index,/ESCIE THE ARTIST\. THE ART SPEAKS FOR ITSELF\./);
  assert.match(app,/function renderAbout\(\)/);
  assert.match(app,/ESCIE THE ARTIST\. THE ART SPEAKS FOR ITSELF\./);
  assert.match(about,/role:\["the Father","the Man","the Monster"\]/);
  assert.match(about,/description:"ESCIE THE ARTIST\. THE ART SPEAKS FOR ITSELF\."/);
  assert.match(about,/ESCIE THE ARTIST\. THE ART SPEAKS FOR ITSELF\./);
});

test("ESCIE identity does not expose unreleased BAM material",()=>{
  const index=read("index.html");
  const about=read("data/about.js");
  assert.doesNotMatch(index,/BAM|Dallas['’]?\s*['’]?63/i);
  assert.doesNotMatch(about,/BAM|Dallas['’]?\s*['’]?63/i);
});
