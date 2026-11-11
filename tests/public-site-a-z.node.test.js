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

test("A-Z Pass 1 canonical navigation does not force section-to-section scrolling",()=>{
  const index=read("index.html");
  const app=read("app.js");
  assert.match(index,/scrollRestoration="manual"/);
  assert.doesNotMatch(index,/scrollIntoView/);
  assert.doesNotMatch(app,/scrollIntoView/);
  assert.doesNotMatch(index,/window\.location\.hash=link\.getAttribute\("href"\)/);
  assert.match(index,/history\.pushState\(null,"",link\.getAttribute\("href"\)\)/);
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

test("A-Z Pass 3 NOW quiet state is intentional and visually restrained",()=>{
  const app=read("app.js");
  const style=read("style.css");
  assert.match(app,/data-transmission-state.*publicTransmission.*released.*active.*quiet/);
  assert.match(style,/\.now-state\[data-transmission-state="quiet"\] h3\{[\s\S]*color:var\(--faint\)/);
  assert.match(style,/\.now-state\[data-transmission-state="quiet"\] > p:not\(\.eyebrow\)/);
});

test("A-Z Pass 3 NOW transmission revalidates through the public registry",()=>{
  const app=read("app.js");
  assert.match(app,/const publicTransmission = publicMusic && getGlobal\("ESCIE_RECORD_REGISTRY",null\)\?\.publicRecord/);
  assert.match(app,/const transmission = publicTransmission \|\| active/);
  assert.match(app,/publicTransmission \? '<button class="record-action record-card"/);
});

test("A-Z Pass 3 keeps NOW subordinate to the entry identity",()=>{
  const style=read("style.css");
  assert.match(style,/\.now-state h3\{max-width:820px;font-size:clamp\(24px,4\.8vw,58px\);line-height:1\.02\}/);
  assert.match(style,/\.now-section\{min-height:0\}/);
});

test("A-Z Pass 3 ART record opening stays public-scoped",()=>{
  const app=read("app.js");
  const start=app.indexOf("function showRecordInspector(record)");
  const end=app.indexOf("let inspectorLastFocus",start);
  const inspector=app.slice(start,end);
  assert.match(inspector,/registry\.publicRecord\(recordId\(record\)\)/);
  assert.match(inspector,/const relationships = getPublicRelationshipRecords\(\);/);
  assert.match(inspector,/getAllPublicRecords\(\)\.find\(r => recordId\(r\) === item\.record && isPublic\(r\)/);
  assert.doesNotMatch(inspector,/normalizeCollection\(getRelationships\(\)\)/);
  assert.doesNotMatch(inspector,/getAllRecords\(\)\.find\(r => recordId\(r\) === item\.record\)/);
});

test("A-Z Pass 3 ART record cards remain public-projection scoped",()=>{
  const app=read("app.js");
  const musicStart=app.indexOf("function renderMusic()");
  const projectsStart=app.indexOf("function renderProjects()",musicStart);
  const music=app.slice(musicStart,projectsStart);
  const projectEnd=app.indexOf("function getPublicRelationshipRecords()",projectsStart);
  const projects=app.slice(projectsStart,projectEnd);
  assert.match(music,/getAllPublicRecords\(\)\.find\(item => recordId\(item\) === parent\.record && isPublic\(item\)/);
  assert.match(music,/const stage = "TRANSMISSION"/);
  assert.match(projects,/new Map\(getAllPublicRecords\(\)\.filter\(item => item && isPublic\(item\)/);
  assert.match(projects,/isReleaseVisible\(track\)/);
  assert.match(projects,/data-record-id/);
  assert.doesNotMatch(music,/getAllRecords\(\)\.find\(item => recordId\(item\) === parent\.record/);
  assert.doesNotMatch(projects,/new Map\(getAllRecords\(\)/);
});

test("A-Z Pass 3 ART filters produce a distinct zero-match state without crossing release boundaries",()=>{
  const app=read("app.js");
  const aesthetic=read("aesthetic.css");
  const language=read("language.js");
  assert.match(app,/NO PUBLIC WORK MATCHES THIS TRACE/);
  assert.match(app,/data-empty-state/);
  assert.match(app,/filter-quiet/);
  assert.match(app,/filteredWork\.length/);
  assert.match(aesthetic,/data-empty-state="filter-quiet"/);
  assert.match(aesthetic,/border-bottom-color:rgba\(155,89,255/);
  assert.match(language,/NO PUBLIC WORK MATCHES THIS TRACE/);
  assert.match(language,/AUCUNE ŒUVRE PUBLIQUE NE CORRESPOND À CETTE TRACE/);
  assert.match(language,/NINGUNA OBRA PÚBLICA COINCIDE CON ESTA HUELLA/);
  assert.match(app,/getFilteredWorkRecords\(\)/);
  assert.doesNotMatch(app,/getAllRecords\(\)\.filter\([^\n]*workFilters/);
});

test("A-Z Pass 3 ART metadata filters are rendered, public-scoped, and usable",()=>{
  const app=read("app.js");
  const css=read("style.css");
  assert.match(app,/getWorkRecords\(\)/);
  assert.match(app,/data-work-filter/);
  assert.match(app,/ALL TYPES/);
  assert.match(app,/ALL STATUS/);
  assert.match(app,/ALL PROJECTS/);
  assert.match(app,/ALL LOCATIONS/);
  assert.match(app,/ALL MOTIFS/);
  assert.match(app,/record-filter-clear/);
  assert.match(app,/ESCIE_RUNTIME\.workFilters/);
  assert.match(app,/renderMusic\(\); renderProjects\(\)/);
  assert.match(css,/\.art-section #work-filters \.record-filter-grid\{/);
  assert.match(css,/\.art-section #work-filters \.record-filter-grid select\{/);
  assert.match(css,/\.art-section #work-filters \.record-filter-clear\{/);
  assert.match(css,/\.art-section #work-filters \.record-filter-count\{/);
  assert.match(css,/outline:1px solid rgba\(155,89,255/);
});

test("A-Z Pass 3 ART empty states read as intentional quiet transmission states",()=>{
  const app=read("app.js");
  const aesthetic=read("aesthetic.css");
  assert.match(app,/function renderEmpty\(container, message, state = "quiet"\)/);
  assert.match(app,/data-empty-state/);
  assert.match(app,/music-quiet/);
  assert.match(app,/work-quiet/);
  assert.match(aesthetic,/\.art-section \.empty-state\{/);
  assert.match(aesthetic,/\.art-section \.empty-state::before\{/);
  assert.match(aesthetic,/data-empty-state="music-quiet"/);
  assert.match(aesthetic,/data-empty-state="work-quiet"/);
  assert.doesNotMatch(aesthetic,/\.art-section \.empty-state[^{]*\{[\s\S]*background:\s*[^;]+;/);
});

test("A-Z Pass 3 NOW hands off to ART as a creative threshold, not a portfolio CTA",()=>{ 
  const html=read("index.html");
  const style=read("style.css");
  const nowIndex=html.indexOf('<section id="now"');
  const artIndex=html.indexOf('<section id="art"');
  assert.ok(nowIndex>=0 && artIndex>nowIndex,"ART must follow NOW in the public sequence");
  assert.match(html,/id="art"[^>]*>[\\s\\S]*class="art-threshold">WHERE LIFE BECOMES THE MEDIUM\.<\\/p>/);
  assert.match(html,/class="art-threshold">WHERE LIFE BECOMES THE MEDIUM\.<\\/p>[\\s\\S]*class="section-lede">BROAD STROKES AND FINE LINES/);
  assert.match(style,/\.art-threshold \{[\\s\\S]*max-width: 680px;[\\s\\S]*font-size: 10px;[\\s\\S]*letter-spacing: 0\.24em/);
  assert.doesNotMatch(html,/ENTER THE WORLD[^<]*<[^>]*art|VIEW ART|OPEN ART/i);
});

test("A-Z Pass 3 ART composition treats public work as creative records, not generic portfolio cards",()=>{
  const style=read("style.css");
  const app=read("app.js");
  assert.match(style,/\.art-section #art-container\{[\s\S]*width:min\(100%,900px\)/);
  assert.match(style,/\.art-section \.music-card\{[\s\S]*display:block/);
  assert.match(style,/\.art-section \.music-card-body h3\{[\s\S]*font-size:clamp\(22px,4vw,42px\)/);
  assert.match(style,/\.art-section \.music-card:hover,[\s\S]*background:linear-gradient\(90deg,rgba\(155,89,255,\.035\)/);
  assert.match(style,/@media\(max-width:700px\)[\s\S]*\.art-section \.music-card-body h3/);
  assert.match(app,/class="music-card-body"/);
  assert.match(app,/class="music-card-meta"/);
  assert.match(app,/class="project-card"/);
});

test("A-Z Pass 3 keeps the hero-to-NOW transition as a quiet threshold",()=>{
  const style=read("style.css");
  assert.match(style,/\.entry-section \+ \.now-section\{[\s\S]*padding-top:clamp\(68px,9vw,108px\)/);
  assert.match(style,/@media\(max-width:700px\)\{[\s\S]*\.entry-section \+ \.now-section\{[\s\S]*padding-top:64px/);
});

test("A-Z Pass 3 hero vertical hierarchy keeps state above identity",()=>{
  const style=read("style.css");
  assert.match(style,/\.entry-section #entry-container #entry-state\{[\s\S]*margin-bottom:clamp\(14px,2\.2vw,22px\)/);
  assert.match(style,/\.entry-section #entry-container #entry-social\{[\s\S]*min-height:0;[\s\S]*margin:0/);
});

test("A-Z Pass 3 desktop hero scales without over-constraining identity",()=>{
  const aesthetic=read("aesthetic.css");
  assert.match(aesthetic,/\.entry-section #entry-container \.entry-inner\{width:min\(100%,1280px\)\}/);
  assert.match(aesthetic,/font-size:clamp\(112px,22vw,320px\)/);
});

test("A-Z Pass 3 mobile hero respects viewport and safe-area composition",()=>{
  const style=read("style.css");
  assert.match(style,/@media\(max-width:700px\)\{[\s\S]*\.entry-section\{[\s\S]*min-height:100svh;[\s\S]*padding:78px 14px calc\(72px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(style,/\.entry-section \.section-label\{[\s\S]*top:74px;[\s\S]*left:14px/);
  assert.match(style,/\.entry-inner\{[\s\S]*width:min\(100%,100%\)/);
});

test("A-Z Pass 3 hero identity stays dominant over signal chamber",()=>{
  const style=read("style.css");
  assert.match(style,/\.entry-inner \{[\s\S]*isolation: isolate/);
  assert.match(style,/\.entry-section #entry-container h1,[\s\S]*z-index: 3/);
  assert.match(style,/\.signal-window \{\s*opacity: \.82;\s*\}/);
  assert.match(style,/\.signal-city \{\s*opacity: \.56;\s*\}/);
  assert.match(style,/@media\(max-width:700px\) \{\s*\.signal-window \{ opacity: \.74; \}\s*\.signal-city \{ opacity: \.50; \}\s*\}/);
});

test("A-Z Pass 3 signal atmosphere stays restrained",()=>{
  const style=read("style.css");
  assert.match(style,/animation: signalPulse 5\.6s ease-in-out infinite/);
  assert.match(style,/animation: signalScan 12s linear infinite/);
  assert.match(style,/background: rgba\(242,242,237,\.09\)/);
  assert.match(style,/0%,94%,100% \{ opacity: 1; \}/);
});

test("A-Z Pass 3 Montréal skyline scales for mobile",()=>{
  const style=read("style.css");
  assert.match(style,/@media\(max-width:700px\)\{[\s\S]*\.signal-window\{width:94vw;height:min\(58vw,360px\)\}/);
  assert.match(style,/\.signal-city\{left:4%;right:4%;bottom:13%;height:36%;opacity:\.72\}/);
  assert.match(style,/\.signal-city::before\{left:41%;bottom:54%;width:13%;height:46%\}/);
  assert.match(style,/\.signal-city::after\{left:71%;bottom:39%;width:16%;height:68%\}/);
});

test("A-Z Pass 3 signal chamber remains visual-only without runtime status state",()=>{
  const style=read("style.css");
  assert.match(style,/\.signal-chamber \{[\s\S]*opacity: \.72;/);
  assert.doesNotMatch(style,/\.idle-universe \.signal-chamber/);
  assert.doesNotMatch(style,/transition: opacity 900ms/);
});

test("A-Z Pass 3 keeps the public signal chamber visual-only",()=>{
  const index=read("index.html");
  const style=read("style.css");
  assert.ok(index.includes('class="signal-chamber"'));
  assert.ok(index.includes('class="signal-city"'));
  assert.doesNotMatch(index,/signal-status|data-escie-countdown|NEXT TRANSMISSION/);
  assert.doesNotMatch(index,/signal\/countdown/);
  assert.doesNotMatch(style,/\\.signal-status|\\.escie-countdown|\\.countdown-status|\\.countdown-value/);
});

test("A-Z Pass 3 entry signal state stays synchronized to local time boundaries",()=>{
  const app=read("app.js");
  assert.match(app,/let entryTimeStateTimer = null/);
  assert.match(app,/function scheduleTimeStateRefresh\(\)/);
  assert.match(app,/window\.setTimeout\(\(\) => \{/);
  assert.match(app,/entryState\.dataset\.signalState = state/);
  assert.doesNotMatch(app,/setInterval\(/);
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


test("A-Z Pass 3 public header identity and index stay compact",()=>{
  const index=read("index.html");
  const style=read("style.css");
  assert.match(index,/class="site-logo" aria-label="ESCIE — return to top"/);
  assert.match(index,/class="index-trigger"/);
  assert.match(index,/class="index-trigger-glyph"/);
  assert.doesNotMatch(index,/class="index-trigger-label"/);
  assert.match(style,/\.site-logo\s*\{[\s\S]*font-family:\s*var\(--escie-font-escie\)/);
  assert.match(style,/\.index-trigger\s*\{[\s\S]*min-width:\s*40px/);
  assert.match(style,/\.index-trigger-glyph\s*\{[\s\S]*width:\s*22px[\s\S]*height:\s*22px/);
});

test("A-Z Pass 3 public hero uses the authored ESCIE family fallback contract",()=>{
  const typography=read("typography.css");
  const aesthetic=read("aesthetic.css");
  assert.match(typography,/--escie-font-escie/);
  assert.match(aesthetic,/entry-section #entry-container h1\{[^}]*font-family:var\(--escie-font-escie\)/);
  assert.doesNotMatch(aesthetic,/Flesh Wound/);
  assert.doesNotMatch(aesthetic,/fonts\.googleapis\.com|fonts\.gstatic\.com/);
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


test("A-Z Pass 3 public runtime boundaries remain schema-aligned and exception-safe",()=>{
  const app=read("app.js"),live=read("data/public-live.js");
  assert.ok(app.includes("function updateEntryState(route)"));
  assert.ok(live.includes("from:from_record_id")&&live.includes("to:to_record_id")&&live.includes("type:relationship_type"));
  assert.ok(live.includes("status=eq.APPROVED"));
  assert.ok(live.includes("public_disclosure")&&live.includes("contract.validate")&&live.includes("contract.canDisclose"),"live relationships must fail closed through the relationship contract");
  assert.ok(live.includes("root.ESCIE_LIVE_RELATIONSHIPS=[]"),"live relationship projection must fail closed when the contract is unavailable");
  assert.ok(live.includes('publicIds.has(String(x.from||'));
  assert.ok(live.includes('publicIds.has(String(x.to||'));
  assert.ok(live.includes('function safeURL(value)'));
  assert.ok(live.includes('function publicMedia(items)'));
  assert.ok(live.includes('symbols:Array.isArray(row.symbols)?row.symbols:[]'));
  assert.doesNotMatch(live,/source:source|provenance:source\.provenance|evidence:Array\.isArray\(row\.evidence\)/);
  assert.ok(app.includes('const relationshipContract=getGlobal("ESCIE_RELATIONSHIP",null);'));
  assert.ok(app.includes("filters&&filters.type")&&app.includes("filters&&filters.record"),"live relationships must honor THE WEB filters");
  assert.ok(app.includes('? normalizeCollection(getGlobal("ESCIE_LIVE_RELATIONSHIPS",[]))'));
  assert.ok(app.includes(': [];'));
  assert.doesNotMatch(live,/select=id,from,to,type,visibility,public_disclosure,release_state/);
  assert.ok(live.includes("from:from_record_id")&&live.includes("to:to_record_id")&&live.includes("type:relationship_type"),"live relationships must use the durable record_relationships column names");
  assert.ok(live.includes("status=eq.APPROVED"),"live relationships must project approved relationships only");
  assert.doesNotMatch(live,/select=\*/,"public records must not fetch the full Central record payload");
  assert.ok(live.includes('version:"1.3.0"'),"public live projection version must advance with the schema hardening");
  assert.doesNotMatch(live,/ESCIE_IDLE_SIGNAL|hasPublicTransmission/);
});


test("A-Z Pass 3 seals Central cognition, provenance, history, and ingestion from the public shell",()=>{
  const index=read("index.html");
  const app=read("app.js");
  for(const privateScript of [
    "brain/brain.js","brain/evidence.js","brain/correlation.js","brain/audit.js",
    "brain/reference-audit.js","control/control.js","control/proposals.js",
    "control/decisions.js","ingestion/ingestion.js","ingestion/normalize.js",
    "ingestion/match.js","ingestion/deduplicate.js","core/sources.js",
    "core/provenance.js","core/history.js","core/permissions.js"
  ]) assert.equal(index.includes(privateScript),false,"public shell must not load "+privateScript);
  assert.match(app,/Private cognition\/control systems are intentionally absent from the public runtime/);
  assert.match(app,/ESCIE_RUNTIME\.brain = null/);
  assert.match(app,/ESCIE_RUNTIME\.control = null/);
  assert.match(app,/ESCIE_RUNTIME\.pendingControl = function \(\) \{ return \[\]; \}/);
  assert.doesNotMatch(app,/"ESCIE_SOURCE",/);
  assert.doesNotMatch(app,/"ESCIE_PROVENANCE",/);
  assert.doesNotMatch(app,/"ESCIE_HISTORY",/);
  assert.doesNotMatch(app,/"ESCIE_HISTORY_API",/);
});


test("A-Z Pass 3 header preferences use one language authority and accessible theme action labels",()=>{
  const index=read("index.html");
  const app=read("app.js");
  const language=read("language.js");
  assert.match(index,/data-language="en"/);
  assert.match(index,/data-language="fr"/);
  assert.match(index,/data-language="es"/);
  assert.match(index,/id="theme-toggle"[^>]*aria-label="Switch to light mode"/);
  assert.doesNotMatch(index,/id="theme-toggle"[^>]*aria-pressed/);
  assert.match(index,/engine\.setLanguage\(language\);\s*return;/);
  assert.doesNotMatch(index,/var events=window\.ESCIE_EVENTS/);
  assert.match(app,/const engine = getLanguageEngine\(\);/);
  assert.match(app,/engine && typeof engine\.setLanguage === "function"/);
  assert.match(app,/engine\.setLanguage\(detected\)/);
  assert.match(language,/applyEscieInterfaceTranslations\(normalized\)/);
});


test("A-Z Pass 3 hero signal respects reduced-motion preferences",()=>{
  const aesthetic=read("aesthetic.css");
  const style=read("style.css");
  assert.ok(aesthetic.includes(".entry-section #entry-tagline{animation:none!important}"));
  assert.ok(style.includes("env(safe-area-inset-bottom)"));
});


test("A-Z Pass 3 hero supporting copy preserves signal hierarchy",()=>{
  const aesthetic=read("aesthetic.css");
  const index=read("index.html");
  assert.match(index,/id="entry-tagline" class="hero-tagline"/);
  assert.match(index,/id="entry-location" class="hero-location"/);
  assert.ok(aesthetic.includes("#entry-container #entry-tagline{margin-top:clamp(22px,3.2vw,34px)"));
  assert.ok(aesthetic.includes("color:var(--escie-blue-bright)"));
  assert.ok(aesthetic.includes("#entry-container #entry-location{margin-top:clamp(12px,1.8vw,18px)"));
  assert.ok(aesthetic.includes("font-family:var(--escie-font-signal)"));
});


test("A-Z Pass 3 signal chamber respects reduced-motion preferences",()=>{
  const css=read("style.css");
  assert.ok(css.includes(".signal-chamber")&&css.includes(".signal-scan")&&css.includes(".signal-light")&&css.includes(".signal-window::before"));
  assert.ok(css.includes("transition: none;"));
});


test("A-Z Pass 3 Montréal skyline uses recognizable landmark silhouettes",()=>{
  const css=read("style.css");
  assert.ok(css.includes("Montréal skyline"));
  assert.ok(css.includes("Mount Royal cross"));
  assert.ok(css.includes("Olympic Stadium tower"));
  assert.ok(css.includes(".signal-city::before"));
  assert.ok(css.includes(".signal-city::after"));
});


test("ART is a complete creative body with a compact public taxonomy",()=>{
  const index=read("index.html"),app=read("app.js"),registry=read("data/registry.js"),art=read("data/art.js");
  for(const label of ["MUSIC","WORDS","VISUAL","PROJECTS"]) assert.ok(index.includes("<h3>"+label+"</h3>"),"ART must expose "+label);
  for(const label of ["POETRY","WRITING","DRAWINGS","PAINTING","FILM / VISUAL"]) assert.ok(app.includes('label:"'+label+'"'),"ART must retain "+label+" internally");
  assert.ok(index.includes('id="art-forms"'));
  assert.ok(index.includes('trigger.setAttribute("aria-expanded","false")'));
  assert.ok(index.includes('trigger.setAttribute("aria-controls",panelId)'));
  assert.ok(index.includes('panel.setAttribute("role","region")'));
  assert.ok(index.includes('panel.setAttribute("aria-label",title)'));
  assert.ok(index.includes('panel.hidden=true'));
  assert.ok(index.includes('trigger.setAttribute("aria-expanded",String(open))'));
  assert.ok(app.includes("function renderArtForm"));
  assert.ok(app.includes("function renderArtGroup"));
  assert.ok(app.includes('const populated=groups.map(group=>({'));
  assert.ok(app.includes('renderEmpty(container,emptyMessage||"THE WORK EXISTS. IT HAS NOT BEEN TRANSMITTED HERE YET.","art-group-quiet")'));
  assert.ok(app.includes('className="art-form-group"'));
  assert.ok(app.includes('className="art-form-label"'));
  assert.ok(app.includes('renderArtGroup("words-container"'));
  assert.ok(app.includes('renderArtGroup("visual-container"'));
  assert.doesNotMatch(index,/<h3>OTHER<\/h3>/);
  assert.doesNotMatch(index,/<h3>POETRY<\/h3>/);
  assert.doesNotMatch(index,/<h3>DRAWINGS<\/h3>/);
  assert.doesNotMatch(index,/<h3>PAINTING<\/h3>/);
  assert.doesNotMatch(index,/<h3>WRITING<\/h3>/);
  assert.doesNotMatch(index,/<h3>FILM \/ VISUAL<\/h3>/);
  assert.ok(registry.includes('["poetry",()=>collection("ESCIE_POETRY")]'));
  assert.ok(registry.includes('["drawing",()=>collection("ESCIE_DRAWINGS")]'));
  assert.ok(art.includes('id:"drawings",label:"DRAWINGS"'));
});


test("A-Z Pass 3 THE WEB connection field is covered by a public interaction contract",()=>{
  const app=read("app.js");
  const style=read("style.css");
  assert.match(app,/function renderWeb\(\)/);
  assert.match(app,/class="web-experience web-identity-field"/);
  assert.match(app,/class="web-connection-field"/);
  assert.match(app,/class="web-connection-main"/);
  assert.match(app,/class="web-node"/);
  assert.match(app,/class="web-connection-line"/);
  assert.match(app,/data-web-connection-toggle/);
  assert.match(app,/data-web-search/);
  assert.match(app,/data-web-filter="record"/);
  assert.match(app,/data-web-filter="type"/);
  assert.match(app,/data-web-participate/);
  assert.match(app,/aria-expanded="false"/);
  assert.match(app,/detail\.hidden===false/);
  assert.match(app,/setAttribute\("aria-expanded",open\?"false":"true"\)/);
  assert.match(style,/\.web-experience\{/);
  assert.match(style,/\.web-connection-main\{/);
  assert.match(style,/\.web-node /);
  assert.match(style,/\.web-connection-line/);
  assert.match(style,/\.web-discovery-tools/);
  assert.match(style,/\.web-record-results/);
  assert.match(style,/@media\(max-width:700px\)/);
});

test("A-Z Pass 3 THE WEB public relationship projection stays sanitized and fail-closed",()=>{
  const app=read("app.js");
  const live=read("data/public-live.js");
  const start=app.indexOf("function getPublicRelationshipRecords");
  const end=app.indexOf("function renderWorld",start);
  const projection=app.slice(start,end);
  assert.match(projection,/publicRelationships\(filters\|\|\{\}\)/);
  assert.match(projection,/relationshipContract\.validate\(r\)\.valid/);
  assert.match(projection,/relationshipContract\.canDisclose\(r\)/);
  assert.match(projection,/public_disclosure:true/);
  assert.match(projection,/visibility:"public"/);
  assert.match(projection,/byIdMap\.has\(r\.from\)&&byIdMap\.has\(r\.to\)/);
  assert.doesNotMatch(projection,/source:|provenance:|evidence:/);
  assert.doesNotMatch(live,/select=\*/);
  assert.doesNotMatch(live,/source:source|provenance:source\.provenance|evidence:Array\.isArray\(row\.evidence\)/);
});

test("A-Z Pass 3 THE WEB connection expansion stays local and links back into public records",()=>{
  const app=read("app.js");
  assert.match(app,/const webConnection=event\.target\.closest\("\[data-web-connection-toggle\]"\)/);
  assert.match(app,/const detail=webConnection\.parentElement&&webConnection\.parentElement\.querySelector\("\.web-connection-detail"\)/);
  assert.match(app,/webConnection\.setAttribute\("aria-expanded"/);
  assert.match(app,/data-record-id=/);
  assert.match(app,/OPEN \'+escapeHTML\(recordTitle\(from\)\.toUpperCase\(\)\)/);
  assert.match(app,/OPEN \'+escapeHTML\(recordTitle\(to\)\.toUpperCase\(\)\)/);
});

test("A-Z Pass 3 THE WEB empty state preserves the Glass Eye participation doorway",()=>{
  const app=read("app.js");
  assert.match(app,/NO PUBLIC CONNECTIONS YET/);
  assert.match(app,/THE WEB IS QUIET\./);
  assert.match(app,/data-web-participate/);
  assert.match(app,/const glass=byId\("glass-eye"\)/);
});


test("A-Z Pass 3 THE ARCHIVES preserved-trace field is covered by a public interaction contract",()=>{
  const app=read("app.js");
  const style=read("style.css");
  assert.match(app,/function renderArchive()/);
  assert.match(app,/manifest\.sections\.archive === true/);
  assert.match(app,/archiveType/);
  assert.match(app,/archivedState/);
  assert.match(app,/\.filter\(isPublic\)/);
  assert.match(app,/class="archive-index"/);
  assert.match(app,/class="archive-index-head"/);
  assert.match(app,/class="archive-list"/);
  assert.match(app,/class="archive-record"/);
  assert.match(app,/role="button"/);
  assert.match(app,/tabindex="0"/);
  assert.match(app,/data-record-id=/);
  assert.match(app,/OPEN THE RECORD TO FOLLOW ITS TRACE\./);
  assert.match(style,/\.archive-index\{/);
  assert.match(style,/\.archive-list\{/);
  assert.match(style,/\.archive-record\{/);
  assert.match(style,/\.archive-record-body\{/);
  assert.match(style,/@media\(max-width:700px\)/);
});

test("A-Z Pass 3 THE ARCHIVES remains public-only and fail-closed at the record boundary",()=>{
  const app=read("app.js");
  const start=app.indexOf("function renderArchive");
  const end=app.indexOf("function renderInvestigation",start);
  const projection=app.slice(start,end);
  assert.ok(start>=0&&end>start,"archive renderer boundary must remain discoverable");
  assert.match(projection,/getAllPublicRecords\(\)/);
  assert.match(projection,/\.filter\(isPublic\)/);
  assert.match(projection,/recordManifest\(record\)/);
  assert.doesNotMatch(projection,/ESCIE_SOURCE|ESCIE_PROVENANCE|ESCIE_HISTORY|pendingControl/);
  assert.doesNotMatch(projection,/source:|provenance:|evidence:/);
  assert.match(projection,/recordId\(record\)/);
  assert.match(projection,/recordTitle\(record\)/);
});

test("A-Z Pass 3 THE ARCHIVES empty state stays quiet and does not invent public records",()=>{
  const app=read("app.js");
  const start=app.indexOf("function renderArchive");
  const end=app.indexOf("function renderInvestigation",start);
  const projection=app.slice(start,end);
  assert.match(projection,/if \(!records\.length\)/);
  assert.match(projection,/THE ARCHIVE IS BEING PRESERVED\./);
  assert.match(projection,/PUBLIC TRACES WILL APPEAR WHEN THEY ENTER THE ARCHIVE\./);
  assert.doesNotMatch(projection,/sample|mock|demo|placeholder/i);
});


test("A-Z Pass 3 THE CASE FILES public field is covered by an interaction and evidence contract",()=>{
  const app=read("app.js");
  const style=read("style.css");
  assert.match(app,/function renderInvestigation\(\)/);
  assert.match(app,/class="investigation-index"/);
  assert.match(app,/class="investigation-index-head"/);
  assert.match(app,/class="case-file-list"/);
  assert.match(app,/class="investigation-case"/);
  assert.match(app,/role="button"/);
  assert.match(app,/tabindex="0"/);
  assert.match(app,/data-record-id=/);
  assert.match(app,/narrationAttributes\(item\)/);
  assert.match(app,/QUESTIONS STAY OPEN UNTIL THE RECORD CAN SUPPORT AN ANSWER\./);
  assert.match(app,/EVIDENCE/);
  assert.match(app,/CONTRADICTIONS/);
  assert.match(style,/\.investigation-index\{|\.investigation-case\{/);
  assert.match(style,/\.case-file-list\{/);
  assert.match(style,/@media\(max-width:700px\)/);
});

test("A-Z Pass 3 THE CASE FILES remains public-only and does not expose private provenance",()=>{
  const app=read("app.js");
  const start=app.indexOf("function renderInvestigation");
  const end=app.indexOf("function socialIconMarkup",start);
  const projection=app.slice(start,end);
  assert.ok(start>=0&&end>start,"case-file renderer boundary must remain discoverable");
  assert.match(projection,/getAllPublicRecords\(\)/);
  assert.match(projection,/\.filter\(isPublic\)/);
  assert.match(projection,/recordManifest\(record\)/);
  assert.doesNotMatch(projection,/ESCIE_SOURCE|ESCIE_PROVENANCE|ESCIE_HISTORY|pendingControl/);
  assert.doesNotMatch(projection,/provenance:/);
  assert.doesNotMatch(projection,/source:/);
});

test("A-Z Pass 3 THE CASE FILES empty state preserves the Glass Eye finding doorway",()=>{
  const app=read("app.js");
  const start=app.indexOf("function renderInvestigation");
  const end=app.indexOf("function socialIconMarkup",start);
  const projection=app.slice(start,end);
  assert.match(projection,/if \(!investigations\.length\)/);
  assert.match(projection,/QUESTIONS BEFORE ANSWERS\./);
  assert.match(projection,/What does the record still not explain\?/);
  assert.match(projection,/What can be documented, sourced or reviewed\?/);
  assert.match(projection,/What remains open without being turned into fact\?/);
  assert.match(projection,/data-web-participate/);
  assert.match(projection,/BRING A FINDING THROUGH GLASS EYE/);
});


test("A-Z Pass 3 GLASS EYE stays personal, local-first, and does not add a second language system",()=>{
  const app=read("app.js");
  const index=read("index.html");
  assert.match(app,/function renderGlassEye\(\)/);
  assert.match(app,/THIS IS YOUR SIDE OF THE SCREEN\./);
  assert.match(app,/YOUR MEMORY/);
  assert.match(app,/LOCAL · PRIVATE · NON-CANONICAL/);
  assert.match(app,/NO CENTRAL HISTORY/);
  assert.match(app,/SEE · HEAR · FOLLOW · MISS · RETURN/);
  assert.doesNotMatch(app,/glass-language/);
  assert.doesNotMatch(index,/glass-language/);
});

test("A-Z Pass 3 GLASS EYE participation remains reviewed before public record entry",()=>{
  const app=read("app.js");
  assert.match(app,/data-glass-participation-form/);
  assert.match(app,/COMMENT/);
  assert.match(app,/THEORY/);
  assert.match(app,/FINDING/);
  assert.match(app,/MENTION/);
  assert.match(app,/UPLOAD PHOTO \/ VIDEO \/ AUDIO/);
  assert.match(app,/Submissions are reviewed before anything enters the public record/);
  assert.match(app,/RECEIVED\. HELD FOR REVIEW — NOT CANON\./);
  assert.match(app,/ESCIE_GLASS_EYE_PARTICIPATION/);
  assert.match(app,/participation\.submit/);
  assert.match(app,/participation\.approved/);
});

test("A-Z Pass 3 GLASS EYE media stays approval-gated and safely embedded",()=>{
  const app=read("app.js");
  const config=read("data/glass-eye-video.js");
  assert.match(app,/glassEyeYouTubeURL\(videoConfig&&videoConfig\.url\)/);
  assert.match(app,/youtube-nocookie\.com\/embed/);
  assert.match(app,/AWAITING APPROVED VIDEO/);
  assert.match(app,/NO APPROVED AUDIO IS AVAILABLE YET\./);
  assert.match(config,/url:""/);
  assert.match(config,/artist-approved/i);
});

test("A-Z Pass 3 GLASS EYE preserves touch, keyboard, reduced-motion, and responsive behavior",()=>{
  const app=read("app.js");
  const style=read("style.css");
  const aesthetic=read("aesthetic.css");
  assert.match(app,/data-glass-eye-action="observe"/);
  assert.match(app,/data-glass-eye-action="hear"/);
  assert.match(app,/data-glass-eye-action="follow"/);
  assert.match(app,/data-glass-eye-action="return"/);
  assert.match(app,/data-glass-eye-action="info"/);
  assert.match(app,/aria-pressed="false"/);
  assert.match(app,/setAttribute\("aria-pressed","true"\)/);
  assert.match(style,/\.glass-eye-actions button:focus-visible/);
  assert.match(style,/touch-action:manipulation/);
  assert.match(style,/@media\(max-width:700px\)/);
  assert.match(aesthetic,/prefers-reduced-motion:reduce/);
});
