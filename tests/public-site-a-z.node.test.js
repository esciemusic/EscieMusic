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

test("A-Z Pass 1 preserves the approved public experience surfaces",()=>{
  const app=read("app.js");
  const nav=read("navigation.js");
  assert.match(nav,/id:"now"/);
  assert.match(nav,/id:"art"/);
  assert.match(nav,/id:"world"/);
  assert.match(nav,/id:"web"/);
  assert.match(nav,/id:"archives"/);
  assert.match(nav,/id:"investigation"/);
  assert.match(nav,/id:"glass-eye"/);
  assert.match(nav,/id:"escie"/);
  assert.match(app,/function renderGlassEye\(\)/);
  assert.match(app,/function renderWorld\(\)/);
  assert.match(app,/function renderArchive\(\)/);
  assert.match(app,/function renderInvestigation\(\)/);
  assert.match(app,/glassEyeYouTubeURL/);
});

test("A-Z Pass 1 keeps game exploration out of the public doorway",()=>{
  const index=read("index.html");
  const app=read("app.js");
  assert.doesNotMatch(index,/Enter the World|game-shop|game shop/i);
  assert.doesNotMatch(app,/GAME_SHOP|game-shop/i);
});

test("A-Z Pass 1 preserves record inspector focus return and visible close focus",()=>{
  const app=read("app.js");
  const style=read("style.css");
  assert.match(app,/inspectorLastFocus/);
  assert.match(app,/function closeRecordInspector\(\)/);
  assert.match(app,/closeRecordInspector\(\);/);
  assert.match(style,/\.record-inspector-close:focus-visible/);
});

test("A-Z Pass 1 preserves keyboard closing for section and nested interfaces",()=>{
  const index=read("index.html");
  assert.match(index,/event\.key!=="Escape"/);
  assert.match(index,/var openSection=sections\.find/);
  assert.match(index,/new MutationObserver/);
  assert.match(index,/window\.ESCIE_NESTED_DROPDOWNS/);
});

test("A-Z Pass 1 keeps runtime initialization guarded against duplicate lifecycle setup",()=>{
  const app=read("app.js");
  assert.match(app,/if \(ESCIE_RUNTIME\.initialized\) return ESCIE_RUNTIME/);
  assert.match(app,/if\(button\.dataset\.bound==="1"\)return/);
});

test("A-Z Pass 1 keeps unreleased public registries sealed",()=>{
  const projects=read("data/projects.js");
  const music=read("data/music.js");
  const investigation=read("data/investigation.js");
  const archive=read("data/archive.js");
  assert.match(projects,/ESCIE_PROJECTS=\[\]/);
  assert.match(music,/ESCIE_MUSIC=\[\]/);
  assert.match(investigation,/ESCIE_INVESTIGATION\s*=\s*\[\]/);
  assert.match(archive,/ESCIE_ARCHIVE\s*=\s*\[\]/);
  assert.doesNotMatch(projects,/BAM|Dallas\s*[’']63/i);
  assert.doesNotMatch(music,/BAM|Dallas\s*[’']63/i);
});

test("A-Z Pass 1 keeps the canonical eight-section shell",()=>{
  const index=read("index.html");
  for(const id of ["now","art","world","web","archives","investigation","glass-eye","escie"]){
    assert.match(index,new RegExp('<section id="'+id+'"'));
  }
});

test("A-Z Pass 1 keeps external media URL handling fail-closed",()=>{
  const app=read("app.js");
  assert.match(app,/function safeExternalURL\(value\)/);
  assert.match(app,/\["http:","https:"\]\.includes\(parsed\.protocol\)/);
  assert.doesNotMatch(app,/window\.open\(/);
});

test("A-Z Pass 1 keeps canonical hash routing and top return behavior",()=>{
  const app=read("app.js");
  const index=read("index.html");
  assert.match(app,/hashchange/);
  assert.match(app,/window\.location\.hash/);
  assert.match(index,/href="#top"/);
  assert.match(index,/href="#main-content"/);
});

test("A-Z Pass 1 preserves keyboard and preference accessibility contracts",()=>{
  const index=read("index.html");
  const style=read("style.css");
  const aesthetic=read("aesthetic.css");
  assert.match(index,/class="skip-link"/);
  assert.match(index,/id="theme-toggle"[^>]*aria-label=/);
  assert.match(index,/data-language="en"/);
  assert.match(index,/data-language="fr"/);
  assert.match(index,/data-language="es"/);
  assert.match(style,/:focus-visible/);
  assert.match(aesthetic,/:focus-visible/);
});

test("A-Z Pass 1 does not contain an active November 22 countdown",()=>{
  const app=read("app.js");
  const index=read("index.html");
  assert.doesNotMatch(app,/2026-11-22|COUNTDOWN|countdown/);
  assert.doesNotMatch(index,/2026-11-22|COUNTDOWN|countdown/);
});

test("A-Z Pass 1 time state is lightweight and does not create a recurring timer",()=>{
  const app=read("app.js");
  assert.match(app,/function updateTimeState\(\)/);
  assert.doesNotMatch(app,/setInterval\(/);
});

test("A-Z Pass 1 runtime initialization is idempotent",()=>{
  const app=read("app.js");
  assert.match(app,/if \(ESCIE_RUNTIME\.initialized\) return ESCIE_RUNTIME;/);
  assert.strictEqual((app.match(/setupRecordInspector\(\);/g)||[]).length,1);
  assert.strictEqual((app.match(/setupMobileMenu\(\);/g)||[]).length,1);
});

test("A-Z Pass 1 merch filter listeners are bound once per control",()=>{
  const app=read("app.js");
  assert.match(app,/button\.dataset\.bound==="1"/);
  assert.match(app,/button\.dataset\.bound="1"/);
});

test("A-Z Pass 1 public audio playback accepts only safe URLs",()=>{
  const app=read("app.js");
  assert.match(app,/audio && safeExternalURL\(item\.url\)/);
  assert.match(app,/type === "audio" && safeExternalURL\(entry\.url\)/);
  assert.match(app,/url: safeExternalURL\(audio\.url\)/);
});

test("A-Z Pass 1 Glass Eye YouTube fails closed and uses privacy embed",()=>{
  const app=read("app.js");
  assert.match(app,/youtube-nocookie\.com\/embed/);
  assert.match(app,/AWAITING APPROVED VIDEO/);
  assert.match(app,/allowfullscreen/);
});

test("A-Z Pass 1 web filters use one consolidated change lifecycle",()=>{
  const app=read("app.js");
  const block=app.slice(app.indexOf("function setupRecordInspector"),app.indexOf("function setupRecordInspector")+5000);
  assert.strictEqual((block.match(/document\.addEventListener\("change"/g)||[]).length,2);
  assert.match(block,/\[data-web-filter\],\[data-web-record-type\]/);
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


test("A-Z Pass 1 rejects legacy public visual selectors",()=>{
  const style=read("style.css");
  const aesthetic=read("aesthetic.css");
  assert.doesNotMatch(style,/\\.section-visual-work(?:\\b|[-:])/);
  assert.doesNotMatch(style,/\\.section-visual-archive::before/);
  assert.doesNotMatch(aesthetic,/\\.section-visual-work(?:\\b|[-:])/);
  assert.doesNotMatch(aesthetic,/\\.section-visual-archive::before/);
  assert.match(style,/\\.section-visual-art::before/);
  assert.match(style,/\\.section-visual-archives::before/);
});
