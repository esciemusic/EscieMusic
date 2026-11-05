const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
const config=fs.readFileSync(path.join(root,"data","glass-eye-video.js"),"utf8");
const css=fs.readFileSync(path.join(root,"style.css"),"utf8");

test("Glass Eye has a primary YouTube window between the eye interface and memory",()=>{
  assert.match(app,/ESCIE_GLASS_EYE_VIDEO/);
  assert.match(app,/data-glass-video-window/);
  assert.match(app,/title="Glass Eye primary YouTube window"/);\n  assert.match(app,/glassEyeYouTubeURL/);\n  assert.match(app,/youtube-nocookie\\.com\/embed/);
  assert.ok(app.indexOf("videoMarkup+") < app.indexOf("glass-memory-inline"),"primary video must precede viewer memory");
});

test("Glass Eye video configuration is public and approval-gated",()=>{
  assert.match(config,/provider:"youtube"/);
  assert.match(config,/url:""/);
  assert.match(config,/artist-approved YouTube video|artist-approved public video URL|artist-approved/i);
});

test("Glass Eye video presentation is responsive",()=>{
  assert.match(css,/\.glass-video-frame\{[^}]*aspect-ratio:16\/9/);
  assert.match(css,/\.glass-video-frame iframe\{[^}]*width:100%[^}]*height:100%/);
});
