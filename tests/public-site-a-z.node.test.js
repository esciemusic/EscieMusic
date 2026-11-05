const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("A-Z audit contract exists and names all public sections",()=>{
  const audit=read("PUBLIC_SITE_A_TO_Z_AUDIT.md");
  for(const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") assert.match(audit,new RegExp("\\b"+letter+"\\b"),"A-Z audit must cover "+letter);
  for(const id of ["now","art","world","web","archives","investigation","glass-eye","escie"]) assert.match(audit,new RegExp(id.replace("-","\\-")));
});

test("public registries and identity stay aligned",()=>{
  const site=read("data/site.js");
  const nodes=read("data/nodes.js");
  const symbols=read("data/symbols.js");
  const language=read("language.js");
  assert.doesNotMatch(site,/ESCIE IS THE ARTIST\. THE WORK SPEAKS FROM HERE\./);
  assert.match(nodes,/role:"THE FATHER \/ THE MAN \/ THE MONSTER"/);
  assert.match(nodes,/description:"ESCIE THE ARTIST\. THE ART SPEAKS FOR ITSELF\."/);
  assert.match(symbols,/placements:\["archives","investigation"\]/);
  assert.match(symbols,/placements:\["web","entry"\]/);
  assert.doesNotMatch(language,/ESCIE IS THE ARTIST\. THE WORK SPEAKS FROM HERE\./);
});

test("public section IDs remain canonical",()=>{
  const nav=read("navigation.js");
  const sections=read("data/public-sections.js");
  for(const id of ["now","art","world","web","archives","investigation","glass-eye","escie"]){
    assert.match(nav,new RegExp('id:"'+id+'"'));
    assert.match(sections,new RegExp('id:"'+id+'"'));
  }
});

test("public shell keeps the sealed release boundary",()=>{
  const index=read("index.html");
  const projects=read("data/projects.js");
  const music=read("data/music.js");
  assert.doesNotMatch(index,/BAM|Dallas['’]?\s*['’]?63/i);
  assert.match(projects,/ESCIE_PROJECTS=\[\]/);
  assert.match(music,/ESCIE_MUSIC=\[\]/);
  assert.doesNotMatch(index,/REAL[ /]+MEMORY[ /]+MYTH/i);
});


test("A-Z Pass 1 locks the live shell to the eight-section model",()=>{
  const index=read("index.html");
  const visuals=read("data/visuals.js");
  const navigation=read("navigation.js");
  assert.match(index,/id="now"[^>]*class="site-section now-section"/);
  assert.match(index,/id="art"[^>]*class="site-section art-section"/);
  assert.match(index,/id="world"[^>]*class="site-section world-section"/);
  assert.match(index,/id="web"[^>]*class="site-section web-section"/);
  assert.match(index,/id="archives"[^>]*class="site-section archives-section"/);
  assert.match(index,/id="investigation"[^>]*class="site-section investigation-section"/);
  assert.match(index,/id="glass-eye"[^>]*class="site-section glass-eye-section"/);
  assert.match(index,/id="escie"[^>]*class="site-section escie-section"/);
  assert.match(index,/var symbols=\{now:"◉"/);
  assert.doesNotMatch(index,/data-visual-section="work"/);
  assert.doesNotMatch(index,/data-visual-section="the-web"/);
  assert.doesNotMatch(index,/data-visual-section="archive"/);
  assert.match(visuals,/section:"art"/);
  assert.match(visuals,/section:"web"/);
  assert.match(visuals,/section:"archives"/);
  assert.doesNotMatch(visuals,/section:"work"/);
  assert.doesNotMatch(visuals,/section:"the-web"/);
  assert.doesNotMatch(visuals,/section:"archive"/);
  assert.match(navigation,/id:"now".*order:1/);
  assert.match(navigation,/id:"escie".*order:8/);
});


test("A-Z Pass 1 rejects remaining legacy shell visual class",()=>{
  const index=read("index.html");
  assert.match(index,/data-visual-section="art"/);
  assert.doesNotMatch(index,/section-visual-work/);
  assert.doesNotMatch(index,/data-visual-section="work"/);
  assert.doesNotMatch(index,/data-visual-section="archive"/);
  assert.doesNotMatch(index,/data-visual-section="the-web"/);
});


test("A-Z Pass 1 keeps runtime motif and section labels on canonical IDs",()=>{
  const app=read("app.js");
  assert.doesNotMatch(app,/motifMarkup\\("work"\\)/);
  assert.doesNotMatch(app,/motifMarkup\\("the-web"\\)/);
  assert.doesNotMatch(app,/motifMarkup\\("archive"\\)/);
  assert.match(app,/motifMarkup\\("art"\\)/);
  assert.match(app,/motifMarkup\\("web"\\)/);
  assert.match(app,/motifMarkup\\("archives"\\)/);
  assert.match(app,/art:"ART"/);
  assert.match(app,/archives:"THE ARCHIVES"/);
});

test("A-Z Pass 1 accordion labels are section-local",()=>{
  const index=read("index.html");
  assert.match(index,/var otherHeading=other\\.querySelector\\("h2"\\)/);
  assert.match(index,/b\\.setAttribute\\("aria-label",\\(active\\?"Close ":"Open " \\)\\+otherTitle\\)/);
});


test("A-Z Pass 1 blocks legacy section target aliases",()=>{
  const app=read("app.js");
  assert.doesNotMatch(app,/work:"art"/);
  assert.doesNotMatch(app,/archive:"archives"/);
  assert.match(app,/"glass-eye":"glass-eye"/);
  assert.match(app,/archives:"archives"/);
});


test("A-Z Pass 1 record section labels use canonical public routes",()=>{
  const app=read("app.js");
  assert.match(app,/now:"NOW"/);
  assert.match(app,/world:"THE WORLD"/);
  assert.match(app,/"glass-eye":"GLASS EYE"/);
  assert.doesNotMatch(app,/glassEye:"GLASS EYE"/);
});


test("A-Z Pass 1 restores saved language preference on boot",()=>{
  const index=read("index.html");
  assert.match(index,/localStorage\.getItem\("escie-language"\)/);
  assert.match(index,/var initialLanguage=\(savedLanguage\|\|state\.language\|\|navigator\.language\|\|"en"\)/);
  assert.match(index,/document\.documentElement\.lang=initialLanguage/);
});

test("A-Z Pass 1 web filters use one consolidated change lifecycle",()=>{
  const app=read("app.js");
  const block=app.slice(app.indexOf("function setupRecordInspector"),app.indexOf("function setupRecordInspector")+5000);
  assert.strictEqual((block.match(/document\\.addEventListener\\("change"/g)||[]).length,2);
  assert.match(block,/\\[data-web-filter\\],\\[data-web-record-type\\]/);
});

test("A-Z Pass 1 record inspector uses canonical section targets",()=>{
  const app=read("app.js");
  assert.match(app,/art:"art"/);
  assert.match(app,/archives:"archives"/);
  assert.match(app,/"glass-eye":"glass-eye"/);
  assert.doesNotMatch(app,/work:"art/);
  assert.doesNotMatch(app,/archive:"archives/);
  assert.doesNotMatch(app,/glassEye:"glass-eye/);
});

test("A-Z Pass 1 public accordion closes on Escape",()=>{
  const index=read("index.html");
  assert.match(index,/document\.addEventListener\("keydown",function\(event\)/);
  assert.match(index,/if\(event\.key!=="Escape"\)return/);
  assert.match(index,/openSection\.querySelector\("\.section-drop-trigger"\)/);
});

test("A-Z Pass 1 nested dropdown panel ids do not depend on Math.random",()=>{
  const index=read("index.html");
  assert.doesNotMatch(index,/nested-\+Math\.random/);
  assert.match(index,/var panelId=\(item\.id\|\|"nested-item"\)\+"-panel"/);
});
