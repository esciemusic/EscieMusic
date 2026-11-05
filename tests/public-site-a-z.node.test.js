const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("A-Z audit contract exists and names all public sections",()=>{
  const audit=read("PUBLIC_SITE_A_TO_Z_AUDIT.md");
  for(const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") assert.match(audit,new RegExp("\\b"+letter+"\\b"),"A-Z audit must cover "+letter);
  for(const id of ["now","art","world","web","archives","investigation","glass-eye","escie"]) assert.match(audit,new RegExp(id.replace("-","\\-"),"i"));
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
  assert.doesNotMatch(app,/motifMarkup\("work"\)/);
  assert.doesNotMatch(app,/motifMarkup\("the-web"\)/);
  assert.doesNotMatch(app,/motifMarkup\("archive"\)/);
  assert.ok(app.includes('motifMarkup("art")'));
  assert.ok(app.includes('motifMarkup("web")'));
  assert.ok(app.includes('motifMarkup("archives")'));
  assert.match(app,/art:"ART"/);
  assert.match(app,/archives:"THE ARCHIVES"/);
});

test("A-Z Pass 1 accordion labels are section-local",()=>{
  const index=read("index.html");
  assert.ok(index.includes('var otherHeading=other.querySelector("h2")'));
  assert.ok(index.includes('b.setAttribute("aria-label",(active?"Close ":"Open ")+otherTitle)'));
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
  assert.doesNotMatch(app,/renderGameShop\(\);/);
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
  assert.ok(app.includes('["http:", "https:"].includes(parsed.protocol)'));
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

test("A-Z Pass 1 keeps the deferred November 22 countdown inactive",()=>{
  const app=read("app.js");
  const index=read("index.html");
  assert.doesNotMatch(app,/2026-11-22|November 22|Nov 22/);
  assert.ok(index.includes('data-escie-countdown hidden'));
  assert.ok(index.includes('NEXT TRANSMISSION'));
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
  assert.ok(app.includes('safeExternalURL(item.url)'));
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



test("A-Z Pass 1 canonical visual selectors remain across public styles",()=>{
  const style=read("style.css");
  const aesthetic=read("aesthetic.css");
  for(const css of [style,aesthetic]){
    assert.doesNotMatch(css,/\.section-visual-work(?:\b|[-:])/);
    assert.doesNotMatch(css,/\.section-visual-archive::before/);
  }
  assert.ok(style.includes(".section-visual-art::before"));
  assert.ok(style.includes(".section-visual-archives::before"));
});


test("A-Z Pass 1 clothing disclosure fails closed for hidden or locked garments",()=>{
  const app=read("app.js");
  assert.match(app,/getGlobal\("ESCIE_CLOTHING",\[\]\)\)\.filter\(item=>item&&item\.public_visibility!==\"hidden\"&&item\.release_status!==\"locked\"\)/);
});


test("A-Z Pass 1 visual selectors use canonical section IDs",()=>{
  const css=read("style.css");
  assert.doesNotMatch(css,/section-visual-(work|archive)(?!s)/);
  assert.doesNotMatch(css,/section-visual-glass(?!-eye)/);
  assert.match(css,/section-visual-archives/);
  assert.match(css,/section-visual-glass-eye/);
});


test("A-Z Pass 1 symbols remain actionable controls",()=>{
  const app=read("app.js");
  assert.ok(app.includes('class="section-motif-item" type="button" data-symbol-id='));
  assert.ok(app.includes('closest("[data-symbol-id]")'));
  assert.ok(app.includes('showSymbolInspector(symbolTrigger.getAttribute("data-symbol-id"))'));
});


test("A-Z Pass 1 theme selectors use canonical section visual IDs",()=>{
  const css=read("aesthetic.css");
  assert.doesNotMatch(css,/\.section-visual-archive(?!s)/);
  assert.doesNotMatch(css,/\.section-visual-glass(?!-eye)/);
  assert.ok(css.includes('html[data-theme="light"]'));
  assert.ok(css.includes('html[data-theme="light"] .section-visual-archives'));
  assert.ok(css.includes('html[data-theme="light"] .section-visual-glass-eye'));
});


test("A-Z Pass 1 external checkout URLs fail closed",()=>{
  const app=read("app.js");
  assert.ok(app.includes("const purchaseURL=safeExternalURL(item.external_purchase_url)"));
  assert.ok(app.includes('type==="REAL_MONEY"&&purchaseURL'));
});


test("A-Z Pass 1 canonical Archives visual markup",()=>{
  const html=read("index.html");
  assert.ok(html.includes('section-visual-archives" data-visual-section="archives"'));
  assert.doesNotMatch(html,/section-visual-archive" data-visual-section="archives"/);
});


test("A-Z Pass 1 canonical Glass Eye visual markup",()=>{
  const html=read("index.html");
  assert.ok(html.includes('section-visual-glass-eye" data-visual-section="glass-eye"'));
  assert.doesNotMatch(html,/section-visual-glass" data-visual-section="glass-eye"/);
});


test("A-Z Pass 1 time state remains lightweight and date-independent",()=>{
  const app=read("app.js");
  assert.ok(app.includes("function updateTimeState()"));
  assert.doesNotMatch(app,/setInterval\(/);
  assert.doesNotMatch(app,/2026-11-22|November 22|Nov 22/);
  assert.doesNotMatch(app,/countdown/i);
});


test("A-Z Pass 2 entry keeps the live signal state above ESCIE",()=>{
  const index=read("index.html");
  const app=read("app.js");
  const aesthetic=read("aesthetic.css");
  assert.match(index,/id="entry-state" class="entry-state"/);
  assert.ok(index.indexOf('id="entry-state"') < index.indexOf("<h1>ESCIE</h1>"));
  assert.ok(app.includes('const entryState = byId("entry-state");'));
  assert.ok(app.includes("SIGNAL // DAWN"));
  assert.ok(app.includes("SIGNAL // DAY"));
  assert.ok(app.includes("SIGNAL // DUSK"));
  assert.ok(app.includes("SIGNAL // NIGHT"));
  assert.ok(aesthetic.includes(".entry-state{"));
});


test("A-Z Pass 2 open-section visuals use restrained motion with reduced-motion fallback",()=>{
  const css=read("aesthetic.css");
  assert.ok(css.includes("@keyframes escieSignalDrift"));
  assert.ok(css.includes("@keyframes escieSignalScan"));
  assert.ok(css.includes("section-open .section-visual{animation:escieSignalDrift"));
  assert.ok(css.includes("prefers-reduced-motion:reduce"));
  assert.ok(css.includes("section-open .section-visual::after{animation:escieSignalScan"));
});


test("A-Z Pass 2 accordion navigation stays compact and mutually exclusive",()=>{
  const index=read("index.html");
  const css=read("aesthetic.css");
  assert.ok(index.includes('className="section-drop-trigger"'));
  assert.ok(index.includes('className="section-drop-panel"'));
  assert.ok(index.includes('other.classList.toggle("section-open",active)'));
  assert.ok(index.includes('other.classList.toggle("section-collapsed",!active)'));
  assert.ok(index.includes('p.hidden=!active'));
  assert.ok(css.includes(".section-collapsed{min-height:0 !important;}"));
  assert.ok(css.includes(".section-collapsed .section-drop-panel{display:none !important;}"));
});


test("A-Z Pass 2 Glass Eye primary window contract stays approved and responsive",()=>{
  const app=read("app.js");
  const css=read("aesthetic.css");
  assert.ok(app.includes('glass-video-window'));
  assert.ok(app.includes('glassEyeYouTubeURL(videoConfig&&videoConfig.url)'));
  assert.ok(app.includes('https://www.youtube-nocookie.com/embed/'));
  assert.ok(app.includes('LOCAL · PRIVATE · NON-CANONICAL'));
  assert.ok(app.includes('data-glass-eye-action="observe"'));
  assert.ok(app.includes('data-glass-eye-action="follow"'));
  assert.ok(app.includes('data-glass-eye-action="return"'));
  assert.ok(css.includes(".glass-video-window{"));
  assert.ok(css.includes("aspect-ratio:16/9"));
  assert.ok(css.includes(".glass-video-frame iframe{"));
});


test("A-Z Pass 2 World includes the physical clothing layer without exposing locked merchandise",()=>{
  const app=read("app.js");
  const css=read("aesthetic.css");
  const merch=read("data/merch.js");
  assert.ok(app.includes('id="merch-filters" class="merch-controls"'));
  assert.ok(app.includes('id="merch-container" class="merch-container" hidden'));
  assert.ok(app.includes('THE WORLD YOU CAN WEAR'));
  assert.ok(css.includes(".world-wear-layer{"));
  assert.ok(css.includes(".world-wear-layer .merch-container[hidden]{display:none!important}"));
  assert.match(merch,/public_visibility:"hidden"/);
  assert.match(merch,/release_status:"locked"/);
});
