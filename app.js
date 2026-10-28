/*
 * ESCIE APPLICATION
 * Runtime composition layer.
 *
 * The application reads canonical data and system contracts, then renders
 * the public interface. UI state is derived; it does not become canon.
 */

(function () {
  "use strict";

  const ESCIE_RUNTIME = {
    version: "1.0.0",
    initialized: false,
    ready: false
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getGlobal(name, fallback) {
    return window[name] !== undefined ? window[name] : fallback;
  }

  function getSite() {
    return getGlobal("ESCIE_SITE", {});
  }

  function getNavigation() {
    return getGlobal("ESCIE_NAVIGATION", []);
  }

  function getProjects() {
    return getGlobal("ESCIE_PROJECTS", []);
  }

  function getMusic() {
    return getGlobal("ESCIE_MUSIC", []);
  }

  function getSignals() {
    return getGlobal("ESCIE_SIGNALS", []);
  }

  function getArchive() {
    return getGlobal("ESCIE_ARCHIVE", []);
  }

  function getInvestigation() {
    return getGlobal("ESCIE_INVESTIGATION", []);
  }

  function getPeople() {
    return getGlobal("ESCIE_PEOPLE", []);
  }

  function getLocations() {
    return getGlobal("ESCIE_LOCATIONS", []);
  }

  function getRelationships() {
    return getGlobal("ESCIE_RELATIONSHIPS", []);
  }

  function getSymbols() {
    return normalizeCollection(getGlobal("ESCIE_SYMBOLS", []));
  }

  function symbolsForSection(sectionId) {
    return getSymbols().filter(symbol =>
      symbol && Array.isArray(symbol.placements) && symbol.placements.includes(sectionId)
    );
  }

  function symbolFor(sectionId) {
    return symbolsForSection(sectionId)[0] || null;
  }

  function symbolGlyph(name) {
    const glyphs = {"CAMERA":"◎","DAISY":"✳","CHILD'S SHOE":"⌁","NIGHTLIGHT":"◌","KEY":"⌕","EMPTY CHAIR":"□","VHS":"▣"};
    return glyphs[name] || "·";
  }

  function motifMarkup(sectionId) {
    const symbols = symbolsForSection(sectionId);
    if (!symbols.length) return "";
    return '<div class="section-motif" aria-label="Recurring motifs: ' + escapeHTML(symbols.map(symbol => symbol.name).join(", ")) + '">' +
      symbols.map(symbol =>
        '<button class="section-motif-item" type="button" data-symbol-id="' + escapeHTML(symbol.id) + '" title="' + escapeHTML(symbol.motif || symbol.name) + '">' +
          '<span class="section-motif-glyph" aria-hidden="true">' + escapeHTML(symbolGlyph(symbol.name)) + '</span>' +
          '<span class="section-motif-name">' + escapeHTML(symbol.name) + '</span>' +
        '</button>'
      ).join("") +
      '</div>';
  }

  function getRecordSymbols(record) {
    if (!record || !Array.isArray(record.symbols)) return [];
    const symbols = getSymbols();
    return record.symbols
      .map(id => symbols.find(symbol => symbol && symbol.id === id))
      .filter(Boolean);
  }

  function symbolTrail(symbolId) {
    const symbol = getSymbols().find(item => item && item.id === symbolId);
    if (!symbol) return [];
    return getAllPublicRecords().filter(record =>
      Array.isArray(record.symbols) && record.symbols.includes(symbolId)
    );
  }

  function getRuntimeState() {
    return getGlobal("ESCIE_STATE", {});
  }

  function getLanguageEngine() {
    return getGlobal("ESCIE_LANGUAGE_ENGINE", null);
  }

  function normalizeLanguage(value) {
    const code = String(value || "").toLowerCase().split("-")[0];
    return ["en", "fr", "es"].includes(code) ? code : "en";
  }

  function detectLanguage() {
    const state = getRuntimeState();
    const saved = state && state.language;
    if (saved) {
      const normalizedSaved = normalizeLanguage(saved);
      if (["en", "fr", "es"].includes(normalizedSaved)) {
        return normalizedSaved;
      }
    }

    return normalizeLanguage(
      navigator.language || navigator.userLanguage || "en"
    );
  }

  function setLanguage(language) {
    const state = getRuntimeState();
    const normalized = normalizeLanguage(language);

    if (state) {
      state.language = normalized;
    }

    document.documentElement.lang = normalized;
    ESCIE_RUNTIME.language = normalized;

    const events = getEvents();
    if (events && typeof events.emit === "function") {
      events.emit("language:changed", { language: normalized });
    }

    return normalized;
  }

  function initializeLanguage() {
    const detected = detectLanguage();
    setLanguage(detected);

    const engine = getLanguageEngine();
    if (engine && typeof engine.mode === "function") {
      ESCIE_RUNTIME.languageEngine = engine;
    }

    return detected;
  }

  function getEvents() {
    return getGlobal("ESCIE_EVENTS", null);
  }

  function getShell() {
    return getGlobal("ESCIE_UI_SHELL", null);
  }

  function getRouter() {
    return getGlobal("ESCIE_UI_ROUTER", null);
  }

  function getSearchIndex() {
    return getGlobal("ESCIE_SEARCH_INDEX", null);
  }

  function getPublishBuild() {
    return getGlobal("ESCIE_PUBLISH_BUILD", null);
  }

  function getPublishValidate() {
    return getGlobal("ESCIE_PUBLISH_VALIDATE", null);
  }

  function getSignalEngine() {
    return getGlobal("ESCIE_SIGNAL_ENGINE", null);
  }

  function getBrain() {
    return getGlobal("ESCIE_BRAIN", null);
  }

  function getEvidenceAPI() {
    return getGlobal("ESCIE_EVIDENCE", null);
  }

  function getCorrelationAPI() {
    return getGlobal("ESCIE_CORRELATION_API", null);
  }

  function getAuditAPI() {
    return getGlobal("ESCIE_AUDIT_API", null);
  }

  function getControl() {
    return getGlobal("ESCIE_CONTROL", null);
  }

  function getProposalAPI() {
    return getGlobal("ESCIE_PROPOSAL_API", null);
  }

  function getDecisionAPI() {
    return getGlobal("ESCIE_DECISION_API", null);
  }

  function initializeCognitionBridge() {
    const brain = getBrain();
    const control = getControl();
    const events = getEvents();

    ESCIE_RUNTIME.brain = brain || null;
    ESCIE_RUNTIME.control = control || null;
    ESCIE_RUNTIME.evidence = getEvidenceAPI();
    ESCIE_RUNTIME.correlation = getCorrelationAPI();
    ESCIE_RUNTIME.audit = getAuditAPI();
    ESCIE_RUNTIME.proposals = getProposalAPI();
    ESCIE_RUNTIME.decisions = getDecisionAPI();

    ESCIE_RUNTIME.observe = function (input = {}) {
      return brain && typeof brain.observe === "function"
        ? brain.observe(input)
        : null;
    };

    ESCIE_RUNTIME.propose = function (input = {}) {
      if (!brain || typeof brain.propose !== "function") return null;
      return brain.propose(input);
    };

    ESCIE_RUNTIME.pendingControl = function () {
      return control && typeof control.pending === "function"
        ? control.pending()
        : [];
    };

    if (events && typeof events.on === "function") {
      events.on("control:item-added", () => {
        ESCIE_RUNTIME.controlItems = ESCIE_RUNTIME.pendingControl();
      });

      events.on("control:item-resolved", () => {
        ESCIE_RUNTIME.controlItems = ESCIE_RUNTIME.pendingControl();
      });
    }

    ESCIE_RUNTIME.controlItems = ESCIE_RUNTIME.pendingControl();
  }

  function normalizeCollection(value) {
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.records)) return value.records;
    if (value && typeof value === "object") return Object.values(value);
    return [];
  }

  function getSiteValue(key, fallback) {
    const site = getSite();
    return site[key] !== undefined ? site[key] : fallback;
  }

  function isPublished(record) {
    return !!(
      record &&
      (record.published === true || record.status === "published")
    );
  }

  function isReleaseVisible(record) {
    if (!record) return false;
    const registry = getGlobal("ESCIE_RECORD_REGISTRY", null);
    if (registry && typeof registry.releaseVisible === "function") {
      return registry.releaseVisible(record);
    }
    if (record.release_status) return record.release_status === "released";
    if (record.type === "project" && record.release_mode === "progressive") {
      const tracks = normalizeCollection(getMusic());
      return tracks.some(track =>
        track && track.project === record.id && track.release_status === "released"
      );
    }
    return true;
  }

  function isPublic(record) {
    if (!record || !isReleaseVisible(record)) return false;
    if (record.visibility && record.visibility !== "PUBLIC" &&
        record.visibility !== "public") return false;
    if (record.visibility === "PRIVATE" || record.visibility === "private") return false;
    if (record.visibility === "WITHHELD" || record.visibility === "withheld") return false;
    if (record.visibility === "LIMITED" || record.visibility === "limited") return false;
    const site = getSite();
    return isPublished(record) || (site.publicPreview === true && record.status === "active");
  }

  function recordId(record) {
    return record && (record.id || record.recordId || null);
  }

  function recordTitle(record) {
    return record && (record.title || record.name || "UNTITLED");
  }

  function getNarrationEngine() {
    return getGlobal("ESCIE_NARRATION_ENGINE", null);
  }

  function presentRecord(record) {
    const narration = getNarrationEngine();
    if (!narration || typeof narration.present !== "function") {
      return null;
    }

    return narration.present(record);
  }

  function narrationAttributes(record) {
    const presentation = presentRecord(record);
    if (!presentation) return "";

    return ' data-narration="' + escapeHTML(presentation.narration || "unknown") +
      '" data-certainty="' + escapeHTML(presentation.certainty || "unknown") + '"';
  }

  function renderEmpty(container, message) {
    if (!container) return;
    container.innerHTML =
      '<div class="empty-state"><span>' +
      escapeHTML(message) +
      "</span></div>";
  }

  function getInformationNodes() {
    const registry = getGlobal("ESCIE_RECORD_REGISTRY", null);
    if (registry && typeof registry.publicNodes === "function") {
      return registry.publicNodes();
    }
    return normalizeCollection(getGlobal("ESCIE_NODES", []))
      .filter(node => node && node.public !== false)
      .sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999));
  }

  function renderNavigation() {
    const nav = byId("main-navigation");
    if (!nav) return;

    const nodes = getInformationNodes();
    const rawRoute = (window.location.hash || "").replace(/^#/, "");
    const router = getRouter();
    const currentRoute = router && typeof router.resolve === "function"
      ? (router.resolve(rawRoute) || rawRoute)
      : rawRoute;

    nav.innerHTML =
      nodes.map(node => {
        const target = node.target || "#";
        const route = target.replace(/^#/, "");
        return '<a class="nav-link node-link' + (route === currentRoute ? ' is-current' : '') + '" href="' + escapeHTML(target) + '"' +
          (route === currentRoute ? ' aria-current="page"' : '') + '>' +
          '<span class="node-link-label">' + escapeHTML(node.label || node.id || "") + '</span>' +
          '<span class="node-link-symbol" aria-hidden="true">' + escapeHTML(node.symbol || "·") + '</span>' +
          '</a>';
      }).join("");
  }

  function refreshNavigationState() {
    const nav = byId("main-navigation");
    if (!nav) return;
    const rawRoute = (window.location.hash || "").replace(/^#/, "");
    const router = getRouter();
    const currentRoute = router && typeof router.resolve === "function"
      ? (router.resolve(rawRoute) || rawRoute)
      : rawRoute;
    nav.querySelectorAll(".nav-link").forEach(link => {
      const route = String(link.getAttribute("href") || "").replace(/^#/, "");
      const active = route === currentRoute;
      link.classList.toggle("is-current", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function syncRouteState() {
    const router = getRouter();
    const raw = (window.location.hash || "#entry").replace(/^#/, "") || "entry";
    const resolved = router && typeof router.resolve === "function" ? router.resolve(raw) : raw;
    document.body.dataset.route = resolved || raw || "entry";
    document.documentElement.dataset.route = document.body.dataset.route;
    refreshNavigationState();
    return document.body.dataset.route;
  }

  function initializeSectionVisuals() {
    const visuals = Array.from(document.querySelectorAll(".section-visual"));
    if (!visuals.length) return;
    const visualUI = getGlobal("ESCIE_VISUALS_UI", null);
    if (visualUI && typeof visualUI.init === "function") visualUI.init();
    if (!("IntersectionObserver" in window)) {
      visuals.forEach(el => el.classList.add("visual-visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visual-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    visuals.forEach(el => observer.observe(el));
  }

  function renderNow() {
    const container = byId("now-container");
    if (!container) return;

    const site = getSite();
    const signalEngine = getSignalEngine();
    const signals = normalizeCollection(getSignals());
    const activeSignal = signalEngine && signalEngine.current &&
      signalEngine.current.active ? signalEngine.current : null;
    const active = activeSignal || signals.find(signal =>
      signal && signal.active === true
    );

    const location = site.location || "Montréal, Canada";
    const status = site.status || "development";
    const publicMusic = getAllPublicRecords()
      .filter(record => record && record.type === "music" && isPublic(record))
      .sort((a, b) => String(a.number || "").localeCompare(String(b.number || ""), undefined, { numeric: true }))
      .slice(-1)[0] || null;
    const transmission = publicMusic || active;
    const transmissionLabel = publicMusic
      ? "CURRENT TRANSMISSION / " + String(publicMusic.number || "—").padStart(3, "0")
      : (active ? "ACTIVE SIGNAL" : "SIGNAL QUIET");
    const transmissionText = publicMusic
      ? recordTitle(publicMusic)
      : (active && active.description ? active.description : "The signal is quiet. The record remains.");

    container.innerHTML =
      '<div class="now-state">' + motifMarkup("now") + '' +
        '<p class="eyebrow">CURRENT STATE</p>' +
        '<h3>' + escapeHTML(transmissionLabel) + "</h3>" +
        '<p>' + escapeHTML(transmissionText) + "</p>" +
        (publicMusic ? '<button class="record-action record-card" type="button" data-record-id="' + escapeHTML(recordId(publicMusic)) + '">OPEN TRANSMISSION</button>' : '') +
        '<div class="now-meta">' +
          '<span>' + escapeHTML(location) + "</span>" +
          '<span>' + escapeHTML(String(site.publicYear || new Date().getFullYear())) + "</span>" +
          '<span>' + escapeHTML(status) + "</span>" +
        "</div>" +
      "</div>";
  }

  function getWorkRecords(){
    const registry=getGlobal("ESCIE_RECORD_REGISTRY",null);
    const all=getAllPublicRecords();
    return all.filter(record=>{
      const manifest=registry&&registry.manifestFor?registry.manifestFor(recordId(record)):null;
      return manifest?manifest.work:["project","music","body"].includes(record.type);
    });
  }

  function getFilteredWorkRecords(){
    const registry=getGlobal("ESCIE_RECORD_REGISTRY",null);
    const work=getWorkRecords();
    return registry&&registry.filter?registry.filter(work,ESCIE_RUNTIME.workFilters||{}):work;
  }

  function renderWorkFilters(){
    const container=byId("work-filters"); if(!container)return;
    const work=getWorkRecords(), filtered=getFilteredWorkRecords(), f=ESCIE_RUNTIME.workFilters||{};
    const vals=k=>Array.from(new Set(work.map(r=>r&&r[k]).filter(Boolean))).sort();
    const options=(a,v,l)=>`<option value="">${escapeHTML(l)}</option>`+a.map(x=>`<option value="${escapeHTML(x)}"${v===x?" selected":""}>${escapeHTML(x)}</option>`).join("");
    const loc=Array.from(new Set(work.flatMap(r=>Array.isArray(r.locations)?r.locations:[]))).sort();
    const sym=Array.from(new Set(work.flatMap(r=>Array.isArray(r.symbols)?r.symbols:[]))).sort();
    const projects=Array.from(new Set(work.flatMap(r=>{const p=r&&r.project; if(p)return [p]; return r&&r.type==="project"&&r.id?[r.id]:[];}))).sort();
        container.innerHTML=`<div class="record-filters-heading"><span>DISCOVER BY METADATA</span><button type="button" class="record-filter-clear">CLEAR</button></div><div class="record-filter-grid"><label>TYPE<select data-work-filter="type">${options(vals("type"),f.type,"ALL TYPES")}</select></label><label>STATUS<select data-work-filter="status">${options(vals("status"),f.status,"ALL STATUS")}</select></label><label>PROJECT<select data-work-filter="project">${options(projects,f.project,"ALL PROJECTS")}</select></label>${loc.length?`<label>LOCATION<select data-work-filter="location">${options(loc,f.location,"ALL LOCATIONS")}</select></label>`:""}${sym.length?`<label>MOTIF<select data-work-filter="symbol">${options(sym,f.symbol,"ALL MOTIFS")}</select></label>`:""}</div><p class="record-filter-count">${filtered.length} OF ${work.length} PUBLIC WORK RECORD${work.length===1?"":"S"}</p>`;
  }


  function renderMusic() {
    const container = byId("music-container");
    if (!container) return;

    const music = getFilteredWorkRecords().filter(record => record.type === "music");
    const visible = music.filter(isPublic);

    if (!visible.length) {
      renderEmpty(container, "THE MUSIC EXISTS. IT HAS NOT BEEN TRANSMITTED HERE YET.");
      return;
    }

    container.innerHTML = motifMarkup("work") + visible.map(track => {
      const context = recordContext(track);
      const parent = context.parents[0];
      const parentRecord = parent ? getAllRecords().find(item => recordId(item) === parent.record) : null;
      return '<article class="music-card" data-record-type="art" data-record-id="' +
      escapeHTML(recordId(track)) + '"' + narrationAttributes(track) + '>' +
        '<p class="music-card-index">' + escapeHTML(track.number || "ART") + "</p>" +
        '<div class="music-card-content"><h3>' + escapeHTML(recordTitle(track)) + "</h3>" +
        (track.role ? "<p>" + escapeHTML(track.role) + "</p>" : "") +
        (parentRecord ? '<p class="music-card-section">PART OF / ' + escapeHTML(recordTitle(parentRecord)) + '</p>' : '') +
        (window.ESCIE_MEDIA && Array.isArray(track.media) ? window.ESCIE_MEDIA.renderAll(track.media) : "") +
        "</div></article>";
    }).join("");
  }

  function renderProjects() {
    const container = byId("bam-container");
    if (!container) return;

    const projects = getFilteredWorkRecords().filter(record => record.type === "project");
    const visible = projects.filter(isPublic);

    if (!visible.length) {
      renderEmpty(container, "THE WORK IS BEING PREPARED.");
      return;
    }

    container.innerHTML = visible.map(project => {
      const structure = Array.isArray(project.structure) ? project.structure : [];
      const artwork = project.artwork || project.cover_art || project.cover || project.visual || null;
      const artworkURL = typeof artwork === "string" ? artwork : (artwork && (artwork.url || artwork.src || artwork.href));
      const projectVisuals = Array.isArray(project.visuals) ? project.visuals : (artworkURL ? [artworkURL] : []);
      const recordsById = new Map(getAllRecords().map(item => [recordId(item), item]));
      const releasedStructure = structure.filter(part => {
        const track = recordsById.get(part.trackId);
        return track && isReleaseVisible(track);
      });

      if (!releasedStructure.length) return "";

      return '<article class="bam-project" data-record-type="body" data-record-id="' +
        escapeHTML(recordId(project)) + '"' + narrationAttributes(project) + '>' +
        '<p class="eyebrow">CURRENT TRANSMISSION</p>' +
        '<h3>' + escapeHTML(recordTitle(project)) + "</h3>" +
        '<div class="bam-structure">' +
          releasedStructure.map(part =>
            '<button class="bam-part record-card" type="button" data-record-id="' + escapeHTML(part.trackId || "") + '">' +
              '<span>' + escapeHTML(part.number) + '</span>' +
              '<strong>' + escapeHTML(part.title) + '</strong>' +
              '<em>' + escapeHTML(part.role) + '</em>' +
            '</button>'
          ).join("") +
        '</div>' +
      "</article>";
    }).join("");
  }

  function getPublicRelationshipRecords(filters){
    const registry=getGlobal("ESCIE_RECORD_REGISTRY",null);
    const records=getAllPublicRecords();
    const byIdMap=new Map(records.filter(Boolean).map(record=>[recordId(record),record]));
    if(registry&&typeof registry.publicRelationships==="function"){
      return registry.publicRelationships(filters||{}).filter(r=>byIdMap.has(r.from)&&byIdMap.has(r.to));
    }
    return normalizeCollection(getRelationships()).filter(relationship=>
      relationship&&relationship.public_disclosure===true&&
      relationship.visibility!=="private"&&relationship.visibility!=="withheld"&&
      byIdMap.has(relationship.from)&&byIdMap.has(relationship.to)
    );
  }

  function renderWeb(){
    const container=byId("web-container"); if(!container)return;
    const registry=getGlobal("ESCIE_RECORD_REGISTRY",null);
    const state=ESCIE_RUNTIME.webFilters||{};
    const all=getPublicRelationshipRecords();
    const relationships=getPublicRelationshipRecords(state);
    const records=getAllPublicRecords();
    const byIdMap=new Map(records.filter(Boolean).map(record=>[recordId(record),record]));
    const allNodes=new Set(); all.forEach(r=>{allNodes.add(r.from);allNodes.add(r.to);});
    const nodeRecords=Array.from(allNodes).map(id=>byIdMap.get(id)).filter(Boolean);
    const types=registry&&typeof registry.relationshipTypes==="function"?registry.relationshipTypes():Array.from(new Set(all.map(r=>r.type).filter(Boolean))).sort();
    const categories=registry&&typeof registry.relationshipCategories==="function"?registry.relationshipCategories():[];
    const nodeOptions=nodeRecords.sort((x,y)=>recordTitle(x).localeCompare(recordTitle(y))).map(r=>'<option value="'+escapeHTML(recordId(r))+'"'+(state.record===recordId(r)?" selected":"")+'>'+escapeHTML(recordTitle(r))+'</option>').join("");
    const typeOptions=types.map(t=>'<option value="'+escapeHTML(t)+'"'+(state.type===t?" selected":"")+'> '+escapeHTML(t.replace(/_/g," "))+'</option>').join("");
    const categoryOptions=categories.map(t=>'<option value="'+escapeHTML(t)+'"'+(state.category===t?" selected":"")+'> '+escapeHTML(t.replace(/_/g," "))+'</option>').join("");
    const count=registry&&typeof registry.relationshipCounts==="function"?registry.relationshipCounts(state):{relationships:relationships.length,nodes:new Set(relationships.flatMap(r=>[r.from,r.to])).size};
    if(!all.length){renderEmpty(container,"THE WEB EXISTS. PUBLIC CONNECTIONS WILL APPEAR WHEN THEY ARE ESTABLISHED.");return;}
    container.innerHTML=
      '<div class="web-intro">'+motifMarkup("the-web")+
      '<p class="eyebrow">RELATIONSHIP GRAPH / '+escapeHTML(String(count.nodes))+' NODES / '+escapeHTML(String(count.relationships))+' CONNECTIONS</p>'+
      '<p>Nothing here is decorative. A connection is shown because the record system says it exists.</p>'+
      '<div class="record-filters web-filters"><div class="record-filters-heading"><span>EXPLORE THE WEB</span><button type="button" class="record-filter-clear" data-web-filter-clear>CLEAR</button></div>'+
      '<div class="record-filter-grid"><label>RECORD<select data-web-filter="record"><option value="">ALL RECORDS</option>'+nodeOptions+'</select></label>'+
      '<label>TYPE<select data-web-filter="type"><option value="">ALL TYPES</option>'+typeOptions+'</select></label>'+
      '<label>CATEGORY<select data-web-filter="category"><option value="">ALL CATEGORIES</option>'+categoryOptions+'</select></label></div>'+
      '<p class="record-filter-count">'+escapeHTML(String(relationships.length))+' OF '+escapeHTML(String(all.length))+' PUBLIC CONNECTION'+(all.length===1?"":"S")+'</p></div></div>'+
      (relationships.length?'<div class="web-list">'+relationships.map(relationship=>{
        const from=byIdMap.get(relationship.from),to=byIdMap.get(relationship.to);
        return '<article class="web-connection" data-relationship-id="'+escapeHTML(relationship.id||"")+'">'+
          '<button class="web-node web-node-button" type="button" data-record-id="'+escapeHTML(relationship.from)+'"><strong>'+escapeHTML(recordTitle(from))+'</strong><span>'+escapeHTML(from.type||"record")+'</span></button>'+
          '<span class="web-arrow" aria-hidden="true">→</span><span class="web-type">'+escapeHTML((relationship.type||"CONNECTION").replace(/_/g," "))+'</span><span class="web-arrow" aria-hidden="true">→</span>'+
          '<button class="web-node web-node-button" type="button" data-record-id="'+escapeHTML(relationship.to)+'"><strong>'+escapeHTML(recordTitle(to))+'</strong><span>'+escapeHTML(to.type||"record")+'</span></button>'+
        '</article>';}).join("")+'</div>':
        '<div class="archive-status"><p class="eyebrow">FILTER STATE</p><h3>NO CONNECTIONS MATCH.</h3><p>Clear or change the Web filters. No new relationship is inferred by an empty result.</p></div>');
  }

  function renderArchive() {
    const container = byId("archive-container");
    if (!container) return;

    const archive=getAllPublicRecords().filter(record=>{
      const manifest=recordManifest(record);
      return manifest ? manifest.sections.archive : record.type==="archive";
    });
    const visible=archive.filter(isPublic);

    if (!visible.length) {
      container.innerHTML =
        '<div class="archive-status">' + motifMarkup("archive") + '' +
          '<p class="eyebrow">PRESERVATION STATE</p>' +
          '<h3>NOTHING PUBLIC HAS BEEN PLACED HERE YET.</h3>' +
          '<p>The archive is designed to preserve source material when it becomes available: recordings, photographs, documents, fragments, artwork and other traces. Empty is a valid state.</p>' +
        '</div>';
      return;
    }

    container.innerHTML =
      '<div class="archive-status"><p class="eyebrow">' + visible.length + ' PUBLIC RECORD' + (visible.length === 1 ? '' : 'S') + '</p><p>Preserved material is shown as it enters the public record. Nothing is filled in merely because the archive has space for it.</p></div>' +
      visible.map(record =>
      '<article class="archive-entry" data-record-id="' +
      escapeHTML(recordId(record)) + '"' + narrationAttributes(record) + '>' +
        '<time>' + escapeHTML(record.date || record.date_start || record.status || "UNDATED") + '</time>' +
        '<div><h3>' + escapeHTML(recordTitle(record)) + "</h3>" +
        (record.description ? '<p>' + escapeHTML(record.description) + '</p>' : '') +
                (window.ESCIE_MEDIA && Array.isArray(record.media) ? window.ESCIE_MEDIA.renderAll(record.media) : '') +
        '</div></article>'
    ).join("");
  }

  function renderInvestigation() {
    const container = byId("investigation-container");
    if (!container) return;

    const investigations=getAllPublicRecords().filter(record=>{
      const manifest=recordManifest(record);
      return manifest ? manifest.sections.investigation : record.type==="investigation";
    });
    const visible=investigations.filter(isPublic);

    if (!visible.length) {
      container.innerHTML =
        '<div class="investigation-status">' + motifMarkup("investigation") + '' +
          '<p class="eyebrow">CASE STATE / OPEN</p>' +
          '<h3>THE QUESTIONS ARE HERE BEFORE THE ANSWERS.</h3>' +
          '<p>No public case has been established yet. When one is opened, this layer will distinguish questions, evidence, contradictions, context and unresolved material rather than presenting speculation as fact.</p>' +
          '' +
        '</div>';
      return;
    }

    container.innerHTML =
      '<div class="investigation-status"><p class="eyebrow">' + visible.length + ' ACTIVE PUBLIC CASE' + (visible.length === 1 ? '' : 'S') + '</p><p>Questions are separated from evidence. A public case can remain unresolved without the interface inventing an answer.</p></div>' +
      visible.map(item =>
      '<article class="investigation-case" data-record-id="' +
      escapeHTML(recordId(item)) + '"' + narrationAttributes(item) + '>' +
        '<p class="eyebrow">' + escapeHTML(item.status || "OPEN") + '</p>' +
        '<h3>' + escapeHTML(recordTitle(item)) + "</h3>" +
        (item.description ? '<p>' + escapeHTML(item.description) + '</p>' : '') +
      "</article>"
    ).join("");
  }

  function socialIconMarkup(platform) {
    const icons = {
      instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5"></rect><circle cx="12" cy="12" r="4.1"></circle><circle cx="17.4" cy="6.7" r="1.05" class="social-icon-fill"></circle></svg>',
      youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.3 7.1a2.7 2.7 0 0 0-1.9-1.9C17.7 4.7 12 4.7 12 4.7s-5.7 0-7.4.5a2.7 2.7 0 0 0-1.9 1.9C2.2 8.8 2.2 12 2.2 12s0 3.2.5 4.9a2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.4.5 7.4.5s5.7 0 7.4-.5a2.7 2.7 0 0 0 1.9-1.9c.5-1.7.5-4.9.5-4.9s0-3.2-.5-4.9Z"></path><path class="social-icon-cut" d="m10 9 5.2 3-5.2 3Z"></path></svg>',
      spotify: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.2"></circle><path class="social-icon-cut" d="M7 9.5c3.3-1 7.2-.7 10.1.7M7.6 12.4c2.8-.7 6.1-.5 8.7.7M8.5 15.1c2.2-.5 4.7-.3 6.7.5"></path></svg>',
      tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 4.1v10.2a4.7 4.7 0 1 1-3.4-4.5v3.1a1.8 1.8 0 1 0 1.8 1.7V4.1h3.2c.3 1.6 1.3 2.8 2.8 3.4v3a7 7 0 0 1-4.4-2.2v5.9a4.9 4.9 0 1 1-4.9-4.9c.6 0 1.2.1 1.7.3V4.1h3.2Z"></path></svg>',
      facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.7 20v-7h2.4l.4-2.8h-2.8V8.4c0-.8.3-1.4 1.5-1.4h1.5V4.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2H8.3V13h2.5v7Z"></path></svg>',
      x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.2h3.5l3.2 4.3 3.7-4.3h3.1l-5.4 6.1 6 7.5h-3.5l-3.8-4.9-4.2 4.9H4.5l5.9-6.7Z"></path></svg>'
    };
    return icons[String(platform || "").toLowerCase()] || '<span aria-hidden="true">↗</span>';
  }

  function renderSocialLinks(containerId, className, includeLabel) {
    const container = byId(containerId);
    if (!container) return;
    const socialNormalizer = getGlobal("normalizeEscieSocial", null);
    const social = typeof socialNormalizer === "function"
      ? socialNormalizer(getGlobal("ESCIE_SOCIAL", []))
      : normalizeCollection(getGlobal("ESCIE_SOCIAL", [])).filter(item => item && item.url && /^https?:\/\//i.test(String(item.url)));
    container.innerHTML = social.length
      ? (includeLabel ? '<span class="footer-social-label">EXTERNAL SIGNAL</span>' : '') + social.map(item =>
          '<a class="' + className + '" href="' + escapeHTML(item.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + escapeHTML(item.label || item.platform || "SIGNAL") + '" title="' + escapeHTML(item.label || item.platform || "SIGNAL") + '">' +
          '<span class="social-icon" aria-hidden="true">' + socialIconMarkup(item.platform) + '</span>' +
        '</a>'
        ).join("")
      : "";
  }

  function renderFooterSocial() {
    const container = byId("footer-social");
    if (!container) return;
    renderSocialLinks("footer-social", "footer-social-link", true);
  }

  function renderAbout() {
    const container = byId("about-container");
    if (!container) return;

    const site = getSite();
    const about = getGlobal("ESCIE_ABOUT", {});
    const socialNormalizer = getGlobal("normalizeEscieSocial", null);
    const social = typeof socialNormalizer === "function"
      ? socialNormalizer(getGlobal("ESCIE_SOCIAL", []))
      : normalizeCollection(getGlobal("ESCIE_SOCIAL", [])).filter(
          item => item && item.url && /^https?:\/\//i.test(String(item.url))
        );

    const socialMarkup = social.length
      ? '<div class="about-social" aria-label="ESCIE social links">' +
          '<p class="eyebrow">EXTERNAL SIGNAL</p>' +
          '<div class="about-social-list">' +
            social.map(item =>
              '<a class="about-social-link" href="' + escapeHTML(item.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + escapeHTML(item.label || item.platform || "SOCIAL") + '" title="' + escapeHTML(item.label || item.platform || "SOCIAL") + '">' +
                '<span class="social-icon" aria-hidden="true">' + socialIconMarkup(item.platform) + '</span>' +
              '</a>'
            ).join("") +
          '</div>' +
        '</div>'
      : '';

    container.innerHTML =
      '<p class="about-lead">' + escapeHTML(
        about.description || "ESCIE is the Father / the Man."
      ) + "</p>" +
      '<div class="about-principles">' +
        '<p><span>PRINCIPLE</span>' + escapeHTML(
          about.principle || site.philosophy || "The music does not create the universe. The universe creates the music."
        ) + "</p>" +
        '<p><span>IDENTITY</span>' + escapeHTML(
          Array.isArray(about.role) ? about.role.join(" / ") : (about.role || "father / man / central presence")
        ) + "</p>" +
      '</div>' +
      socialMarkup +
      '<p class="about-location">' + escapeHTML(site.location || "Montréal, Canada") +
      " / " + escapeHTML(String(site.publicYear || new Date().getFullYear())) +
      " / " + escapeHTML(site.status || "development") + "</p>";
  }

  function renderGlassEye() {
    const container = byId("glass-eye-container");
    if (!container) return;

    const records = getAllPublicRecords();
    const glassRecords = records.filter(record => {
      const manifest = recordManifest(record);
      return manifest ? manifest.sections.glassEye : false;
    });
    const music = glassRecords.filter(record => record.type === "music");
    const projects = glassRecords.filter(record => record.type === "project" || record.type === "body");
    const archive = glassRecords.filter(record => {
      const manifest = recordManifest(record);
      return manifest && manifest.sections.archive;
    });
    const latest = music.slice().sort((a, b) =>
      String(a.number || "").localeCompare(String(b.number || ""))
    ).slice(-1)[0] || null;
    const latestTitle = latest ? recordTitle(latest) : "NO PUBLIC TRANSMISSION";
    const latestNumber = latest ? (latest.number || "—") : "—";

    container.innerHTML =
      '<div class="glass-frame">' + motifMarkup("glass-eye") + '' +
        '<div class="glass-crosshair" aria-hidden="true"></div>' +
        '<div class="glass-corner glass-corner-tl"></div><div class="glass-corner glass-corner-tr"></div>' +
        '<div class="glass-corner glass-corner-bl"></div><div class="glass-corner glass-corner-br"></div>' +
        '<div class="glass-readout"><span>GLASS EYE // OBSERVATION INTERFACE</span><span>REC / OBSERVE / PRESERVE</span></div>' +
        '<div class="glass-center">' +
          '<span class="glass-dot"></span>' +
          '<strong>' + escapeHTML(latest ? "SIGNAL ACQUIRED" : "NO PUBLIC SIGNAL") + '</strong>' +
          '<p>' + escapeHTML(latest ? latestTitle : "The eye records what is actually available. It does not manufacture evidence.") + '</p>' +
          (latest ? '<button class="record-action glass-record-action record-card" type="button" data-record-id="' + escapeHTML(recordId(latest)) + '">OPEN TRANSMISSION / ' + escapeHTML(latestNumber) + '</button>' : '') +
        '</div>' +
        '<div class="glass-footer"><span>WORK ' + music.length + '</span><span>BODIES ' + projects.length + '</span><span>ARCHIVE ' + archive.length + '</span><span>PUBLIC RECORDS ' + records.length + '</span></div>' +
      '</div>';
  }
  function getAllRecords() {
    const registry = getGlobal("ESCIE_RECORD_REGISTRY", null);
    if (registry && typeof registry.records === "function") {
      return normalizeCollection(registry.records());
    }
    return [
      { id: "escie", type: "identity", title: "ESCIE", description: "The central consciousness / interface.", status: "active", published: true, visibility: "public" },
      ...normalizeCollection(getMusic()),
      ...normalizeCollection(getProjects()),
      ...normalizeCollection(getArchive()),
      ...normalizeCollection(getInvestigation()),
      ...normalizeCollection(getPeople()),
      ...normalizeCollection(getLocations())
    ].filter(record => record && recordId(record));
  }

  function getAllPublicRecords() {
    const registry = getGlobal("ESCIE_RECORD_REGISTRY", null);
    if (registry && typeof registry.allPublicRecords === "function") {
      return registry.allPublicRecords().filter(isPublic);
    }
    return getAllRecords().filter(isPublic);
  }

  function registryAudit() {
    const registry = getGlobal("ESCIE_RECORD_REGISTRY", null);
    return registry && typeof registry.relationshipAudit === "function"
      ? {
          relationships: registry.relationshipAudit(),
          symbols: typeof registry.symbolAudit === "function" ? registry.symbolAudit() : null,
          contract: typeof registry.contractAudit === "function" ? registry.contractAudit() : null,
          references: typeof registry.referenceAudit === "function" ? registry.referenceAudit() : null,
          release: typeof registry.releaseAudit === "function" ? registry.releaseAudit() : null,
          sections: typeof registry.sectionAudit === "function" ? registry.sectionAudit() : null
        }
      : null;
  }

  function recordManifest(record) {
    const registry = getGlobal("ESCIE_RECORD_REGISTRY", null);
    if (!registry || typeof registry.manifestFor !== "function" || !record) return null;
    return registry.manifestFor(recordId(record));
  }

  function recordAppearsIn(record) {
    const manifest = recordManifest(record);
    return manifest && Array.isArray(manifest.appearsIn) ? manifest.appearsIn : [];
  }

  function sectionLabel(section) {
    return ({
      work:"WORK",
      web:"THE WEB",
      archive:"ARCHIVE",
      investigation:"INVESTIGATION",
      glassEye:"GLASS EYE"
    })[section] || String(section || "").toUpperCase();
  }

  function recordContext(record) {
    const registry = getGlobal("ESCIE_RECORD_REGISTRY", null);
    if (!registry || typeof registry.contextFor !== "function" || !record) {
      return {parents:[],children:[],connections:[]};
    }
    return registry.contextFor(recordId(record)) || {parents:[],children:[],connections:[]};
  }

  function declaredRecordLinks(ids){
    const records=getAllPublicRecords();
    return (Array.isArray(ids)?ids:[]).map(id=>{
      const target=records.find(item=>recordId(item)===id);
      return target
        ? '<button class="record-related-link record-inline-link" type="button" data-record-id="'+escapeHTML(id)+'">'+escapeHTML(recordTitle(target))+'</button>'
        : '<span class="inspector-note">'+escapeHTML(id)+'</span>';
    }).join("");
  }

  function declaredReferenceLink(id){
    if(!id) return "";
    const target=getAllPublicRecords().find(item=>recordId(item)===id);
    return target
      ? '<button class="record-related-link record-inline-link" type="button" data-record-id="'+escapeHTML(id)+'">'+escapeHTML(recordTitle(target))+'</button>'
      : '<span class="inspector-note">'+escapeHTML(id)+'</span>';
  }

  function showRecordInspector(record) {
    const registry = getGlobal("ESCIE_RECORD_REGISTRY", null);
    if (registry && typeof registry.publicRecord === "function") {
      record = registry.publicRecord(recordId(record));
    }
    if (!record || !isPublic(record)) return;
    const modal = byId("record-inspector");
    if (!modal || !record) return;
    const body = modal.querySelector(".record-inspector-body");
    if (!body) return;

    const status = record.status || "unknown";
    const description = record.description || "No public description has been established.";
    const symbols = getRecordSymbols(record);
    const locations = Array.isArray(record.locations) ? record.locations : [];
    const people = Array.isArray(record.people) ? record.people : [];
    const tags = Array.isArray(record.tags) ? record.tags : [];
    const media = Array.isArray(record.media) ? record.media : [];
    const evidence = Array.isArray(record.evidence) ? record.evidence : [];
    const derivedContext = recordContext(record);
    const publicNodes = registry && typeof registry.nodesForRecord === "function"
      ? registry.nodesForRecord(recordId(record))
      : [];

    const relationships = normalizeCollection(getRelationships());
    const relatedIds = relationships
      .filter(r => r && (r.from === recordId(record) || r.to === recordId(record)))
      .map(r => r.from === recordId(record) ? r.to : r.from)
      .filter((id, index, list) => id && list.indexOf(id) === index);
    const related = relatedIds
      .map(id => getAllPublicRecords().find(item => recordId(item) === id))
      .filter(Boolean);
    body.innerHTML =
      '<p class="eyebrow">' + escapeHTML(record.type || "RECORD") + '</p>' +
      '<h3>' + escapeHTML(recordTitle(record)) + '</h3>' +
      '<p>' + escapeHTML(description) + '</p>' +
      (publicNodes.length ? '<p class="record-node-trace">APPEARS IN / ' + publicNodes.map(node => escapeHTML(node.label || node.id || "")).join(' · ') + '</p>' : '') +
      '<dl class="record-facts"><div><dt>STATUS</dt><dd>' + escapeHTML(status) + '</dd></div>' +
      '<div><dt>ID</dt><dd>' + escapeHTML(recordId(record)) + '</dd></div></dl>' +
      (recordAppearsIn(record).length ? '<div class="record-context record-appearance"><p class="eyebrow">APPEARS IN</p><p>' +
        recordAppearsIn(record).map(section => '<button class="record-related-link record-section-link" type="button" data-section-target="' + escapeHTML(section) + '">' + escapeHTML(sectionLabel(section)) + '</button>').join("") +
        '</p></div>' : '') +
      ((record.project || record.parent || record.source || record.origin || record.transformation || record.archive_state || record.certainty || record.knowledge) ?
        '<div class="record-context"><p class="eyebrow">PROVENANCE / STATE</p>' +
        (record.project ? '<p><strong>PROJECT</strong> ' + declaredReferenceLink(record.project) + '</p>' : '') +
        (record.parent ? '<p><strong>PARENT</strong> ' + declaredReferenceLink(record.parent) + '</p>' : '') +
        (record.source ? '<p><strong>SOURCE</strong> ' + declaredReferenceLink(record.source) + '</p>' : '') +
        (record.origin ? '<p><strong>ORIGIN</strong> ' + escapeHTML(record.origin) + '</p>' : '') +
        (record.transformation ? '<p><strong>TRANSFORMATION</strong> ' + escapeHTML(record.transformation) + '</p>' : '') +
        (record.archive_state ? '<p><strong>ARCHIVE STATE</strong> ' + escapeHTML(record.archive_state) + '</p>' : '') +
        (record.certainty ? '<p><strong>CERTAINTY</strong> ' + escapeHTML(record.certainty) + '</p>' : '') +
        (record.knowledge ? '<p><strong>KNOWLEDGE</strong> ' + escapeHTML(record.knowledge) + '</p>' : '') +
        '</div>' : '') +
      (window.ESCIE_MEDIA && media.length ? window.ESCIE_MEDIA.renderAll(media) : "") +
      (symbols.length ? '<div class="record-symbols"><p class="eyebrow">RECURRING MOTIFS</p>' +
        symbols.map(symbol => '<button class="record-symbol-link" type="button" data-symbol-id="' + escapeHTML(symbol.id) + '">' +
          escapeHTML(symbol.name) + '<span>' + escapeHTML(symbol.motif || "") + '</span></button>').join("") + '</div>' : '') +
      ((locations.length || people.length || tags.length || media.length || evidence.length) ?
        '<div class="record-context"><p class="eyebrow">DECLARED CONTEXT</p>' +
        (locations.length ? '<p><strong>LOCATIONS</strong> ' + declaredRecordLinks(locations) + '</p>' : '') +
        (people.length ? '<p><strong>PEOPLE</strong> ' + declaredRecordLinks(people) + '</p>' : '') +
        (tags.length ? '<p><strong>TAGS</strong> ' + escapeHTML(tags.join(" / ")) + '</p>' : '') +
        '<p><strong>MEDIA</strong> ' + escapeHTML(String(media.length)) + ' / <strong>EVIDENCE</strong> ' + escapeHTML(String(evidence.length)) + '</p>' +
        '</div>' : '') +
      (derivedContext.parents.length ? '<div class="record-context"><p class="eyebrow">CONTAINED BY</p>' +
        derivedContext.parents.map(item => '<button class="record-related-link" type="button" data-record-id="' + escapeHTML(item.record) + '">' +
          escapeHTML(recordTitle(getAllRecords().find(r => recordId(r) === item.record) || {title:item.record})) + '</button>').join("") + '</div>' : '') +
      (derivedContext.children.length ? '<div class="record-context"><p class="eyebrow">CONTAINS</p>' +
        derivedContext.children.map(item => '<button class="record-related-link" type="button" data-record-id="' + escapeHTML(item.record) + '">' +
          escapeHTML(recordTitle(getAllRecords().find(r => recordId(r) === item.record) || {title:item.record})) + '</button>').join("") + '</div>' : '') +
      (derivedContext.connections.length ? '<div class="record-context"><p class="eyebrow">RELATIONSHIPS</p>' +
        derivedContext.connections.map(item => '<p><strong>' + escapeHTML(item.direction === "out" ? "TO" : "FROM") + '</strong> ' +
          '<button class="record-related-link" type="button" data-record-id="' + escapeHTML(item.record) + '">' +
          escapeHTML(recordTitle(getAllRecords().find(r => recordId(r) === item.record) || {title:item.record})) + '</button>' +
          ' <span class="inspector-note">[' + escapeHTML(item.type) + ']</span></p>').join("") + '</div>' : '') +
      (related.length ? '<div class="record-related"><p class="eyebrow">CONNECTED RECORDS</p>' +
        related.map(item => '<button class="record-related-link" type="button" data-record-id="' + escapeHTML(recordId(item)) + '">' +
          escapeHTML(recordTitle(item)) + '</button>').join('') + '</div>' : '');
    modal.hidden = false;
    document.body.classList.add("inspector-open");
    const close = modal.querySelector("[data-inspector-close]");
    if (close) close.focus();
  }

  function showSymbolInspector(symbolId) {
    const modal = byId("record-inspector");
    if (!modal) return;
    const symbol = getSymbols().find(item => item && item.id === symbolId);
    if (!symbol) return;
    const body = modal.querySelector(".record-inspector-body");
    if (!body) return;
    const records = symbolTrail(symbolId);
    body.innerHTML =
      '<p class="eyebrow">RECURRING MOTIF</p>' +
      '<h3>' + escapeHTML(symbol.name) + '</h3>' +
      '<p>' + escapeHTML(symbol.motif || "Meaning intentionally left open.") + '</p>' +
      '<dl class="record-facts"><div><dt>STATUS</dt><dd>' + escapeHTML(symbol.status || "recurring") + '</dd></div>' +
      '<div><dt>SECTIONS</dt><dd>' + escapeHTML((symbol.placements || []).join(" / ") || "UNPLACED") + '</dd></div>' +
      '<div><dt>RECORD LINKS</dt><dd>' + escapeHTML(String(records.length)) + '</dd></div></dl>' +
      (records.length ? '<div class="record-related"><p class="eyebrow">PUBLIC RECORDS CARRYING THIS MOTIF</p>' +
        records.map(item => '<button class="record-related-link" type="button" data-record-id="' + escapeHTML(recordId(item)) + '">' +
          escapeHTML(recordTitle(item)) + '</button>').join("") + '</div>' :
        '<p class="inspector-note">No public record has been explicitly assigned this motif yet. The motif can exist visually without becoming canonically attached to a record.</p>');
    modal.hidden = false;
    document.body.classList.add("inspector-open");
    const close = modal.querySelector("[data-inspector-close]");
    if (close) close.focus();
  }

  function setupRecordInspector() {
    if (byId("record-inspector")) return;

    const modal = document.createElement("div");
    modal.id = "record-inspector";
    modal.className = "record-inspector";
    modal.hidden = true;
    modal.innerHTML =
      '<div class="record-inspector-backdrop" data-inspector-close></div>' +
      '<section class="record-inspector-panel" role="dialog" aria-modal="true" aria-labelledby="record-inspector-title">' +
        '<button class="record-inspector-close" type="button" data-inspector-close aria-label="Close record">CLOSE</button>' +
        '<div class="record-inspector-body"><h3 id="record-inspector-title">RECORD</h3></div>' +
      '</section>';
    document.body.appendChild(modal);

    document.addEventListener("change", event => {
      const control=event.target.closest("[data-work-filter]");
      if(!control)return;
      ESCIE_RUNTIME.workFilters=ESCIE_RUNTIME.workFilters||{};
      ESCIE_RUNTIME.workFilters[control.getAttribute("data-work-filter")]=control.value||"";
      renderWorkFilters(); renderMusic(); renderProjects();
    });

    document.addEventListener("change", event => {
      const control=event.target.closest("[data-web-filter]");
      if(!control)return;
      ESCIE_RUNTIME.webFilters=ESCIE_RUNTIME.webFilters||{};
      ESCIE_RUNTIME.webFilters[control.getAttribute("data-web-filter")]=control.value||"";
      renderWeb();
    });

    document.addEventListener("click", event => {
      const webClear=event.target.closest("[data-web-filter-clear]");
      if(webClear){ ESCIE_RUNTIME.webFilters={}; renderWeb(); return; }

      const webControl=event.target.closest("[data-web-filter]");
      if(webControl)return;

      const clearFilters=event.target.closest(".record-filter-clear");
      if(clearFilters){
        ESCIE_RUNTIME.workFilters={};
        renderWorkFilters(); renderMusic(); renderProjects();
        return;
      }


      const close = event.target.closest("[data-inspector-close]");
      if (close) {
        modal.hidden = true;
        document.body.classList.remove("inspector-open");
        return;
      }

      const sectionTrigger = event.target.closest("[data-section-target]");
      if (sectionTrigger) {
        const section = sectionTrigger.getAttribute("data-section-target");
        const target = ({
          work:"art",
          web:"web",
          archive:"archives",
          investigation:"investigation",
          glassEye:"glass-eye"
        })[section];
        if (target) {
          modal.hidden = true;
          document.body.classList.remove("inspector-open");
          const element = byId(target);
          if (element) element.scrollIntoView({behavior:"smooth",block:"start"});
          window.location.hash = target;
        }
        return;
      }

      const symbolTrigger = event.target.closest("[data-symbol-id]");
      if (symbolTrigger) {
        showSymbolInspector(symbolTrigger.getAttribute("data-symbol-id"));
        return;
      }

      const trigger = event.target.closest("[data-record-id]");
      if (!trigger) return;
      const record = getAllPublicRecords().find(item => recordId(item) === trigger.getAttribute("data-record-id"));
      if (!record) return;

      const player = window.ESCIE_UI_PLAYER;
      if (record.type === "music" && player && typeof player.load === "function") {
        const mediaAPI = getGlobal("ESCIE_MEDIA", null);
        const media = mediaAPI && typeof mediaAPI.normalizeAll === "function"
          ? mediaAPI.normalizeAll(Array.isArray(record.media) ? record.media : [])
          : (Array.isArray(record.media) ? record.media : []);
        const audio = media.find(item => {
          const type = item && String(item.type || item.kind || "").toLowerCase();
          return type === "audio" && item.url;
        });
        if (audio) {
          if (typeof player.setQueue === "function") {
            const queue = getAllPublicRecords()
              .filter(item => item && item.type === "music" && isPublic(item))
              .sort((a, b) => String(a.number || "").localeCompare(String(b.number || ""), undefined, { numeric: true }))
              .map(item => {
                const itemMedia = mediaAPI && typeof mediaAPI.normalizeAll === "function"
                  ? mediaAPI.normalizeAll(Array.isArray(item.media) ? item.media : [])
                  : (Array.isArray(item.media) ? item.media : []);
                const itemAudio = itemMedia.find(entry => {
                  const type = entry && String(entry.type || entry.kind || "").toLowerCase();
                  return type === "audio" && entry.url;
                });
                return itemAudio ? {
                  id: recordId(item),
                  title: recordTitle(item),
                  url: itemAudio.url,
                  sourceId: recordId(item)
                } : null;
              })
              .filter(Boolean);
            player.setQueue(queue, { autoAdvance: true });
          }
          player.load({
            id: recordId(record),
            title: recordTitle(record),
            url: audio.url,
            sourceId: recordId(record)
          });
          player.play();
          return;
        }
      }

      showRecordInspector(record);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !modal.hidden) {
        modal.hidden = true;
        document.body.classList.remove("inspector-open");
      }
    });
  }

  function renderEntry() {
    const stateLabel = byId("entry-state");
    if (stateLabel) {
      const route = syncRouteState();
      const nodes = getInformationNodes();
      const node = nodes.find(item => {
        const target = String(item && item.target || "").replace(/^#/, "");
        return target === route;
      });
      stateLabel.textContent = node && node.role
        ? String(node.role)
        : (route === "entry" ? "CURRENT SIGNAL" : String(route || "CURRENT SIGNAL").replace(/-/g, " ").toUpperCase());
      stateLabel.dataset.route = route;
    }

    const year = byId("entry-year");
    if (year) {
      year.textContent = getSiteValue("publicYear", new Date().getFullYear());
    }

    const location = byId("entry-location");
    if (location) {
      location.textContent = getSiteValue("location", "Montréal, Canada");
    }

    const tagline = byId("entry-tagline");
    if (tagline) {
      tagline.textContent = getSiteValue(
        "tagline",
        "THE SIGNAL REMAINS DISTORTED."
      );
    }

    const philosophy = byId("entry-philosophy");
    if (philosophy) {
      philosophy.textContent = getSiteValue(
        "philosophy",
        "The music does not create the universe. The universe creates the music."
      );
    }
  }

  function updateEntryState(route) {
    const stateLabel = byId("entry-state");
    if (!stateLabel) return;

    const normalizedRoute = String(route || "entry").replace(/^#/, "");
    const nodes = getInformationNodes();
    const node = nodes.find(item => {
      const target = String(item && item.target || "").replace(/^#/, "");
      return target === normalizedRoute;
    });

    stateLabel.textContent = node && node.role
      ? String(node.role)
      : (normalizedRoute === "entry"
        ? "CURRENT SIGNAL"
        : normalizedRoute.replace(/-/g, " ").toUpperCase());
    stateLabel.dataset.route = normalizedRoute;
  }

  function buildSearchIndex() {
    const index = getSearchIndex();
    if (!index || typeof index.build !== "function") return [];

    const registry = getGlobal("ESCIE_RECORD_REGISTRY", null);
    const records = (registry && typeof registry.records === "function"
      ? registry.records()
      : [
          { id: "escie", type: "identity", title: "ESCIE", description: "The central consciousness / interface.", status: "active", published: true, visibility: "public" },
          ...normalizeCollection(getMusic()),
          ...normalizeCollection(getProjects()),
          ...normalizeCollection(getArchive()),
          ...normalizeCollection(getInvestigation()),
          ...normalizeCollection(getPeople()),
          ...normalizeCollection(getLocations())
        ])
      .filter(record => {
        if (!record || !(record.id || record.recordId) || !isPublic(record)) return false;
        const manifest = registry && typeof registry.manifestFor === "function"
          ? registry.manifestFor(recordId(record))
          : null;
        return !manifest || manifest.search !== false;
      });

    const built = index.build(records);
    ESCIE_RUNTIME.searchIndex = Array.isArray(built) ? built : [];
    return ESCIE_RUNTIME.searchIndex;
  }

  function validatePublicBuild() {
    const build = getPublishBuild();
    const validate = getPublishValidate();

    if (!build || !validate ||
        typeof build.createBuildPlan !== "function" ||
        typeof validate.validateBuild !== "function") {
      return null;
    }

    const registry = getGlobal("ESCIE_RECORD_REGISTRY", null);
    const records = registry && typeof registry.allPublicRecords === "function"
      ? registry.allPublicRecords()
      : [
          ...normalizeCollection(getMusic()),
          ...normalizeCollection(getProjects()),
          ...normalizeCollection(getArchive()),
          ...normalizeCollection(getInvestigation()),
          ...normalizeCollection(getPeople()),
          ...normalizeCollection(getLocations())
        ];

    const publicRecords = records.filter(isPublic);

    const plan = build.createBuildPlan({
      environment: "runtime",
      records: publicRecords,
      routes: getNavigation(),
      assets: []
    });

    return validate.validateBuild(plan);
  }

  function initializeSystemContracts() {
    initializeSectionVisuals();
    const state = getRuntimeState();
    if (state) {
      state.status = "readying";
      state.initializedAt = state.initializedAt || new Date().toISOString();
    }

    const shell = getShell();
    if (shell && typeof shell.mount === "function") {
      shell.mount("#top");
    }

    initializeLanguage();
    initializeCognitionBridge();

    const player = window.ESCIE_UI_PLAYER;
    if (player && typeof player.attach === "function") {
      let audio = document.getElementById("escie-global-audio");
      if (!audio) {
        audio = document.createElement("audio");
        audio.id = "escie-global-audio";
        audio.preload = "none";
        audio.setAttribute("aria-hidden", "true");
        audio.style.display = "none";
        document.body.appendChild(audio);
      }
      player.attach(audio);
    }

    const router = getRouter();
    const navigation = normalizeCollection(getNavigation());

    if (router && typeof router.register === "function") {
      navigation.forEach(item => {
        const target = item && (item.target || item.href);
        if (!target || typeof target !== "string") return;

        const route = target.charAt(0) === "#"
          ? target.slice(1)
          : target;

        router.register(route, () => {
          if (state) state.route = route;
          if (shell && typeof shell.setState === "function") {
            shell.setState(state || { route });
          }
        });
      });
    }

    buildSearchIndex();
    validatePublicBuild();

    const responsive = window.ESCIE_UI_RESPONSIVE;
    if (responsive && typeof responsive.apply === "function") {
      responsive.apply(document.documentElement);
      window.addEventListener("resize", () => responsive.apply(document.documentElement));
    }

    const events = getEvents();
    if (events && typeof events.on === "function") {
      events.on("language:changed", () => {
        renderEntry();
        renderNavigation();
        renderNow();
        renderMusic();
        renderProjects();
        renderWeb();
        renderArchive();
        renderInvestigation();
        renderAbout();
    renderSocialLinks("entry-social", "entry-social-link", false);
    renderFooterSocial();
      });

      events.on("signal:emitted", signal => {
        if (state) {
          state.activeSignalId = signal && signal.sourceId || null;
          state.transmissionLevel = signal && signal.level || 0;
        }
        renderNow();
        applyUIState();
      });

      events.on("signal:cleared", () => {
        if (state) {
          state.activeSignalId = null;
          state.transmissionLevel = 0;
        }
        renderNow();
        applyUIState();
      });
    }
  }

  function resolveUIState() {
    const states = window.ESCIE_UI_STATES || {};
    const normal = states.NORMAL || "NORMAL";
    const transmission = states.ACTIVE_TRANSMISSION || "ACTIVE_TRANSMISSION";
    const archival = states.ARCHIVAL_RESURFACING || "ARCHIVAL_RESURFACING";
    const investigation = states.INVESTIGATION_ACTIVE || "INVESTIGATION_ACTIVE";
    const silence = states.SILENCE || "SILENCE";

    const runtimeState = getRuntimeState() || {};
    const signalLevel = Number(runtimeState.transmissionLevel || 0);

    if (signalLevel > 0) return transmission;

    const registry=getGlobal("ESCIE_RECORD_REGISTRY",null);
    const publicInvestigations=getAllPublicRecords().filter(record=>{
      const manifest=registry&&registry.manifestFor?registry.manifestFor(recordId(record)):null;
      return manifest&&manifest.investigation;
    });
    if (publicInvestigations.length) return investigation;

    const publicArchive=getAllPublicRecords().filter(record=>{
      const manifest=registry&&registry.manifestFor?registry.manifestFor(recordId(record)):null;
      return manifest&&manifest.archive;
    });
    if (publicArchive.length) return archival;

    if (getSiteValue("status", "development") === "silence") return silence;

    return normal;
  }

  function applyUIState() {
    const state = getRuntimeState() || {};
    state.uiState = resolveUIState();

    const shell = getShell();
    if (shell && typeof shell.setState === "function") {
      shell.setState(state);
    }

    return state.uiState;
  }

  function bindNavigationRuntime() {
    const router = getRouter();
    if (!router) return;

    const navigate = () => {
      const route = window.location.hash.replace(/^#/, "") || "entry";
      const resolved = typeof router.resolve === "function" ? router.resolve(route) : null;
      const activeRoute = resolved || route || "entry";
      document.body.dataset.route = activeRoute;
      document.documentElement.dataset.route = activeRoute;
      updateEntryState(activeRoute);
      renderEntry();
      document.documentElement.classList.remove("route-shift");
      void document.documentElement.offsetWidth;
      document.documentElement.classList.add("route-shift");
      renderNavigation();
      refreshNavigationState();
      if (resolved && typeof router.navigate === "function") {
        router.navigate(resolved);
      }
    };

    window.addEventListener("hashchange", navigate);
    navigate();
  }

  function updateTimeState() {
    const hour = new Date().getHours();
    let state = "night";

    if (hour >= 5 && hour < 8) state = "dawn";
    else if (hour >= 8 && hour < 18) state = "day";
    else if (hour >= 18 && hour < 21) state = "dusk";

    document.body.dataset.time = state;
  }

  function setupMobileMenu() {
    const button = byId("mobile-menu-button");
    const nav = byId("main-navigation");
    if (!button || !nav) return null;

    const state = {
      button,
      nav,
      open: false,
      lastFocused: null,
      previousOverflow: ""
    };

    const sync = function (open) {
      state.open = !!open;
      document.body.classList.toggle("menu-open", state.open);
      nav.classList.toggle("is-open", state.open);
      nav.dataset.open = String(state.open);
      nav.setAttribute("aria-hidden", String(!state.open));
      button.setAttribute("aria-expanded", String(state.open));
      button.setAttribute("aria-label", state.open ? "Close index" : "Open index");
      nav.style.visibility = state.open ? "visible" : "hidden";
      nav.style.opacity = state.open ? "1" : "0";
      nav.style.pointerEvents = state.open ? "auto" : "none";
      nav.style.transform = state.open ? "translateY(0)" : "translateY(-8px)";

      if (state.open) {
        if (!state.previousOverflow) state.previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = state.previousOverflow;
        state.previousOverflow = "";
      }
    };

    const closeMenu = function (restoreFocus = false) {
      const wasOpen = state.open;
      const returnTarget = state.lastFocused;
      sync(false);
      state.lastFocused = null;
      if (restoreFocus && wasOpen) {
        const target = returnTarget && typeof returnTarget.focus === "function"
          ? returnTarget
          : button;
        target.focus();
      }
    };

    const openMenu = function () {
      if (state.open) return;
      state.lastFocused = document.activeElement;
      sync(true);

      const firstLink = nav.querySelector("a");
      if (firstLink && typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(function () {
          if (state.open) firstLink.focus();
        });
      }
    };

    const toggleMenu = function () {
      if (state.open) closeMenu(true);
      else openMenu();
      return state.open;
    };

    const handleFocusTrap = function (event) {
      if (!state.open || event.key !== "Tab") return;

      const focusable = Array.from(nav.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(element => {
        const style = window.getComputedStyle(element);
        return !element.hidden && style.display !== "none" && style.visibility !== "hidden";
      });

      if (!focusable.length) {
        event.preventDefault();
        button.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    button.addEventListener("click", toggleMenu);
    nav.addEventListener("click", function (event) {
      const link = event.target.closest("a");
      if (link) closeMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (!state.open) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      handleFocusTrap(event);
    });

    document.addEventListener("pointerdown", function (event) {
      if (!state.open) return;
      const target = event.target;
      if (target instanceof Node && (nav.contains(target) || button.contains(target))) return;
      closeMenu(false);
    });

    window.addEventListener("hashchange", function () {
      if (state.open) closeMenu(false);
    });

    sync(false);

    ESCIE_RUNTIME.navigationMenu = {
      open: openMenu,
      close: closeMenu,
      toggle: toggleMenu,
      isOpen: function () { return state.open; }
    };

    return ESCIE_RUNTIME.navigationMenu;
  }

  function render() {
    renderEntry();
    renderNavigation();
    renderWorkFilters();
    renderNow();
    renderMusic();
    renderProjects();
    renderWeb();
    renderArchive();
    renderInvestigation();
    renderAbout();
    renderSocialLinks("entry-social", "entry-social-link", false);
    renderFooterSocial();
    renderGlassEye();
    const narration = getNarrationEngine();
    if (narration && typeof narration.present === "function") {
      ESCIE_RUNTIME.narration = narration;
    }

    updateTimeState();
    applyUIState();
  }

  function initialize() {
    if (ESCIE_RUNTIME.initialized) return ESCIE_RUNTIME;

    ESCIE_RUNTIME.initialized = true;
    initializeSystemContracts();
    render();
    setupMobileMenu();
    setupRecordInspector();
    bindNavigationRuntime();

    const state = getRuntimeState();
    if (state) {
      state.status = "ready";
    }

    const shell = getShell();
    if (shell && typeof shell.setState === "function") {
      shell.setState(state || { status: "ready" });
    }

    ESCIE_RUNTIME.setLanguage = setLanguage;

    ESCIE_RUNTIME.ready = true;

    if (window.ESCIE_TEST_RUNNER && typeof window.ESCIE_TEST_RUNNER.run === "function") {
      window.ESCIE_TEST_RUNNER.run();
    }

    window.dispatchEvent(new CustomEvent("escie:ready", {
      detail: ESCIE_RUNTIME
    }));

    return ESCIE_RUNTIME;
  }

  ESCIE_RUNTIME.byId = byId;
  ESCIE_RUNTIME.escapeHTML = escapeHTML;
  ESCIE_RUNTIME.getSite = getSite;
  ESCIE_RUNTIME.getNavigation = getNavigation;
  ESCIE_RUNTIME.getProjects = getProjects;
  ESCIE_RUNTIME.getMusic = getMusic;
  ESCIE_RUNTIME.getSignals = getSignals;
  ESCIE_RUNTIME.getArchive = getArchive;
  ESCIE_RUNTIME.getInvestigation = getInvestigation;
  ESCIE_RUNTIME.getPeople = getPeople;
  ESCIE_RUNTIME.search = function (query) {
    const search = window.ESCIE_SEARCH;
    const index = ESCIE_RUNTIME.searchIndex || [];
    return search && typeof search === "function"
      ? search(query, index)
      : [];
  };
  ESCIE_RUNTIME.present = function (item) {
    const narration = window.ESCIE_NARRATION_ENGINE;
    return narration && typeof narration.present === "function"
      ? narration.present(item)
      : null;
  };
  ESCIE_RUNTIME.player = window.ESCIE_UI_PLAYER || null;
  ESCIE_RUNTIME.transmission = window.ESCIE_TRANSMISSION || null;
  ESCIE_RUNTIME.health = function () {
    const health = window.ESCIE_HEALTH;
    if (!health || typeof health.check !== "function") {
      return { ok: false, checkedAt: new Date().toISOString(), checks: [], failed: ["ESCIE_HEALTH"] };
    }

    const report = health.check([
      "ESCIE_RECORD",
      "ESCIE_RELATIONSHIP",
      "ESCIE_SOURCE",
      "ESCIE_PROVENANCE",
      "ESCIE_HISTORY",
      "ESCIE_HISTORY_API",
      "ESCIE_STATE",
      "ESCIE_EVENTS",
      "ESCIE_PUBLISH_BUILD",
      "ESCIE_PUBLISH_VALIDATE",
      "ESCIE_SEARCH_INDEX",
      "ESCIE_VISUALS",
      "ESCIE_VISUALS_UI"
    ]);

    const visualAudit = ESCIE_RUNTIME.visualAudit();
    report.visuals = visualAudit;
    if (!visualAudit.ok) {
      report.ok = false;
      report.failed = report.failed.concat(["ESCIE_VISUALS_AUDIT"]);
    }

    return report;
  };
  ESCIE_RUNTIME.render = render;
  ESCIE_RUNTIME.initialize = initialize;
  ESCIE_RUNTIME.getAllRecords = getAllRecords;
  ESCIE_RUNTIME.getAllPublicRecords = getAllPublicRecords;
  ESCIE_RUNTIME.registryAudit = registryAudit;
  ESCIE_RUNTIME.visualAudit = function () {
    const audit = getGlobal("auditEscieVisuals", null);
    const items = getGlobal("ESCIE_VISUALS", []);
    return typeof audit === "function"
      ? audit(items)
      : { ok: false, reason: "visual audit unavailable" };
  };
  ESCIE_RUNTIME.filterRecords = function(filters){ const registry=getGlobal("ESCIE_RECORD_REGISTRY",null); return registry&&registry.filter ? registry.filter(getAllPublicRecords(),filters||{}) : getAllPublicRecords(); };
  ESCIE_RUNTIME.manifestFor = function(id){ const registry=getGlobal("ESCIE_RECORD_REGISTRY",null); return registry&&registry.manifestFor ? registry.manifestFor(id) : null; };
  ESCIE_RUNTIME.referenceAudit = function(){ const registry=getGlobal("ESCIE_RECORD_REGISTRY",null); return registry&&registry.referenceAudit ? registry.referenceAudit() : null; };
  ESCIE_RUNTIME.isReleaseVisible = isReleaseVisible;
  ESCIE_RUNTIME.publicRelationships = function(filters){ const registry=getGlobal("ESCIE_RECORD_REGISTRY",null); return registry&&registry.publicRelationships ? registry.publicRelationships(filters||{}) : getPublicRelationshipRecords(filters||{}); };
  ESCIE_RUNTIME.relationshipsFor = function(id,filters){ const registry=getGlobal("ESCIE_RECORD_REGISTRY",null); return registry&&registry.relationshipsFor ? registry.relationshipsFor(id,filters||{}) : getPublicRelationshipRecords(Object.assign({},filters||{},{record:id})); };
  ESCIE_RUNTIME.relationshipCounts = function(filters){ const registry=getGlobal("ESCIE_RECORD_REGISTRY",null); return registry&&registry.relationshipCounts ? registry.relationshipCounts(filters||{}) : null; };

  window.ESCIE_RUNTIME = ESCIE_RUNTIME;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
