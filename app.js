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
    if (saved && saved !== "en") {
      return normalizeLanguage(saved);
    }

    const browser = normalizeLanguage(
      navigator.language || navigator.userLanguage || "en"
    );

    return browser;
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

  function isPublic(record) {
    if (!record) return false;
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

  function renderNavigation() {
    const nav = byId("main-navigation");
    if (!nav) return;

    const items = normalizeCollection(getNavigation())
      .filter(item => item && item.primary !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

    const currentRoute = (window.location.hash || "#entry").replace(/^#/, "");
    nav.innerHTML = items.map(item => {
      const label = item.label || item.title || item.id || "";
      const target = item.target || item.href || ("#" + (item.id || "").toLowerCase().replace(/\s+/g, "-"));
      const route = target.replace(/^#/, "");
      return '<a class="nav-link' + (route === currentRoute ? ' is-current' : '') + '" href="' + escapeHTML(target) + '"' +
        (route === currentRoute ? ' aria-current="page"' : '') + '>' +
        escapeHTML(label) + "</a>";
    }).join("");
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

    container.innerHTML =
      '<div class="now-state">' + motifMarkup("now") + '' +
        '<p class="eyebrow">CURRENT STATE</p>' +
        '<h3>' + escapeHTML(active ? "ACTIVE TRANSMISSION" : "SIGNAL QUIET") + "</h3>" +
        '<p>' + escapeHTML(
          active && active.description
            ? active.description
            : "The signal is quiet. The reality is not."
        ) + "</p>" +
        '<div class="now-meta">' +
          '<span>' + escapeHTML(location) + "</span>" +
          '<span>' + escapeHTML(String(site.publicYear || new Date().getFullYear())) + "</span>" +
          '<span>' + escapeHTML(status) + "</span>" +
        "</div>" +
      "</div>";
  }

  function renderMusic() {
    const container = byId("music-container");
    if (!container) return;

    const music = normalizeCollection(getMusic());
    const visible = music.filter(isPublic);

    if (!visible.length) {
      renderEmpty(container, "THE MUSIC EXISTS. IT HAS NOT BEEN TRANSMITTED HERE YET.");
      return;
    }

    container.innerHTML = motifMarkup("work") + visible.map(track =>
      '<article class="music-card" data-record-type="art" data-record-id="' +
      escapeHTML(recordId(track)) + '"' + narrationAttributes(track) + '>' +
        '<p class="music-card-index">' + escapeHTML(track.number || "ART") + "</p>" +
        '<div class="music-card-content"><h3>' + escapeHTML(recordTitle(track)) + "</h3>" +
        (track.role ? "<p>" + escapeHTML(track.role) + "</p>" : "") +
        "</div></article>"
    ).join("");
  }

  function renderProjects() {
    const container = byId("bam-container");
    if (!container) return;

    const projects = normalizeCollection(getProjects());
    const visible = projects.filter(isPublic);

    if (!visible.length) {
      renderEmpty(container, "THE WORK IS BEING PREPARED.");
      return;
    }

    container.innerHTML = visible.map(project => {
      const structure = Array.isArray(project.structure) ? project.structure : [];
      return '<article class="bam-project" data-record-type="body" data-record-id="' +
        escapeHTML(recordId(project)) + '"' + narrationAttributes(project) + '>' +
        '<p class="eyebrow">' + escapeHTML(project.type || "BODY") + "</p>" +
        '<h3>' + escapeHTML(recordTitle(project)) + "</h3>" +
        (project.description ? "<p>" + escapeHTML(project.description) + "</p>" : "") +
        (project.questions ? '<div class="project-questions">' + project.questions.map(q => '<span>' + escapeHTML(q) + '</span>').join("") + '</div>' : "") +
        (structure.length ? '<div class="bam-structure">' + structure.map(part => '<button class="bam-part record-card" type="button" data-record-id="' + escapeHTML(part.trackId || "") + '"><span>' + escapeHTML(part.number) + '</span><strong>' + escapeHTML(part.title) + '</strong><em>' + escapeHTML(part.role) + '</em></button>').join("") + '</div>' : "") +
      "</article>";
    }).join("");
  }

  function renderWeb() {
    const container = byId("web-container");
    if (!container) return;

    const relationships = normalizeCollection(getRelationships());
    const records = getAllRecords();
    const byIdMap = new Map(records.filter(Boolean).map(record => [recordId(record), record]));
    const visible = relationships.filter(relationship =>
      relationship &&
      relationship.public_disclosure === true &&
      relationship.visibility !== "private" &&
      relationship.visibility !== "withheld" &&
      byIdMap.has(relationship.from) &&
      byIdMap.has(relationship.to)
    );

    if (!visible.length) {
      renderEmpty(container, "THE WEB EXISTS. PUBLIC CONNECTIONS WILL APPEAR WHEN THEY ARE ESTABLISHED.");
      return;
    }

    container.innerHTML =
      '<div class="web-intro">' + motifMarkup("the-web") + '<p class="eyebrow">RELATIONSHIP GRAPH</p>' +
      '<p>Nothing here is decorative. A connection is shown because the record system says it exists.</p></div>' +
      '<div class="web-list">' +
      visible.map(relationship => {
        const from = byIdMap.get(relationship.from);
        const to = byIdMap.get(relationship.to);
        return '<article class="web-connection" data-relationship-id="' + escapeHTML(relationship.id || "") + '">' +
          '<button class="web-node web-node-button" type="button" data-record-id="' + escapeHTML(relationship.from) + '">' +
            '<strong>' + escapeHTML(recordTitle(from)) + '</strong><span>' + escapeHTML(from.type || "record") + '</span>' +
          '</button>' +
          '<span class="web-arrow" aria-hidden="true">→</span>' +
          '<span class="web-type">' + escapeHTML(relationship.type || "CONNECTION") + '</span>' +
          '<span class="web-arrow" aria-hidden="true">→</span>' +
          '<button class="web-node web-node-button" type="button" data-record-id="' + escapeHTML(relationship.to) + '">' +
            '<strong>' + escapeHTML(recordTitle(to)) + '</strong><span>' + escapeHTML(to.type || "record") + '</span>' +
          '</button>' +
        '</article>';
      }).join("") +
      '</div>';
  }

  function renderArchive() {
    const container = byId("archive-container");
    if (!container) return;

    const archive = normalizeCollection(getArchive());
    const visible = archive.filter(isPublic);

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
      '<div class="archive-status"><p class="eyebrow">' + visible.length + ' PUBLIC RECORD' + (visible.length === 1 ? '' : 'S') + '</p></div>' +
      visible.map(record =>
      '<article class="archive-entry" data-record-id="' +
      escapeHTML(recordId(record)) + '"' + narrationAttributes(record) + '>' +
        '<h3>' + escapeHTML(recordTitle(record)) + "</h3>" +
      "</article>"
    ).join("");
  }

  function renderInvestigation() {
    const container = byId("investigation-container");
    if (!container) return;

    const investigations = normalizeCollection(getInvestigation());
    const visible = investigations.filter(isPublic);

    if (!visible.length) {
      container.innerHTML =
        '<div class="investigation-status">' + motifMarkup("investigation") + '' +
          '<p class="eyebrow">CASE STATE / OPEN</p>' +
          '<h3>THE QUESTIONS ARE HERE BEFORE THE ANSWERS.</h3>' +
          '<p>No public case has been established yet. When one is opened, this layer will distinguish questions, evidence, contradictions, context and unresolved material rather than presenting speculation as fact.</p>' +
          '<div class="reality-legend"><span>REAL</span><span>MEMORY</span><span>DRAMATIZED</span><span>FICTIONALIZED</span><span>MYTH</span></div>' +
        '</div>';
      return;
    }

    container.innerHTML =
      '<div class="investigation-status"><p class="eyebrow">' + visible.length + ' ACTIVE PUBLIC CASE' + (visible.length === 1 ? '' : 'S') + '</p></div>' +
      visible.map(item =>
      '<article class="investigation-case" data-record-id="' +
      escapeHTML(recordId(item)) + '"' + narrationAttributes(item) + '>' +
        '<h3>' + escapeHTML(recordTitle(item)) + "</h3>" +
      "</article>"
    ).join("");
  }

  function renderAbout() {
    const container = byId("about-container");
    if (!container) return;

    const site = getSite();
    const about = getGlobal("ESCIE_ABOUT", {});
    container.innerHTML =
      '<p class="about-lead">' + escapeHTML(
        about.description || "ESCIE is an interface to reality itself."
      ) + "</p>" +
      '<div class="about-principles">' +
        '<p><span>PRINCIPLE</span>' + escapeHTML(
          about.principle || site.philosophy || "The music does not create the universe. The universe creates the music."
        ) + "</p>" +
        '<p><span>IDENTITY</span>' + escapeHTML(
          Array.isArray(about.role) ? about.role.join(" / ") : (about.role || "artist / writer / narrator")
        ) + "</p>" +
        '<p><span>PRONUNCIATION</span>' + escapeHTML(about.pronunciation || site.pronunciation || "S.C.") + "</p>" +
      '</div>' +
      '<p class="about-location">' + escapeHTML(site.location || "Montréal, Canada") +
      " / " + escapeHTML(String(site.publicYear || new Date().getFullYear())) +
      " / " + escapeHTML(site.status || "development") + "</p>";
  }

  function renderGlassEye() {
    const container = byId("glass-eye-container");
    if (!container) return;

    const music = normalizeCollection(getMusic()).filter(isPublic);
    const projects = normalizeCollection(getProjects()).filter(isPublic);
    const archive = normalizeCollection(getArchive()).filter(isPublic);

    container.innerHTML =
      '<div class="glass-frame">' + motifMarkup("glass-eye") + '' +
        '<div class="glass-crosshair" aria-hidden="true"></div>' +
        '<div class="glass-corner glass-corner-tl"></div><div class="glass-corner glass-corner-tr"></div>' +
        '<div class="glass-corner glass-corner-bl"></div><div class="glass-corner glass-corner-br"></div>' +
        '<div class="glass-readout"><span>GLASS EYE // LIVE INTERFACE</span><span>REC / OBSERVE / PRESERVE</span></div>' +
        '<div class="glass-center"><span class="glass-dot"></span><strong>NO IMAGE SUPPLIED</strong><p>The eye records what is actually available. It does not manufacture evidence.</p></div>' +
        '<div class="glass-footer"><span>WORK ' + music.length + '</span><span>BODIES ' + projects.length + '</span><span>ARCHIVE ' + archive.length + '</span></div>' +
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
    return getAllRecords().filter(isPublic);
  }

  function showRecordInspector(record) {
    const modal = byId("record-inspector");
    if (!modal || !record) return;
    const body = modal.querySelector(".record-inspector-body");
    if (!body) return;

    const reality = record.reality || record.reality_level || record.knowledge || "UNSPECIFIED";
    const status = record.status || "unknown";
    const description = record.description || "No public description has been established.";
    const symbols = getRecordSymbols(record);
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
      '<dl class="record-facts"><div><dt>REALITY</dt><dd>' + escapeHTML(reality) + '</dd></div>' +
      '<div><dt>STATUS</dt><dd>' + escapeHTML(status) + '</dd></div>' +
      '<div><dt>ID</dt><dd>' + escapeHTML(recordId(record)) + '</dd></div></dl>' +
      (symbols.length ? '<div class="record-symbols"><p class="eyebrow">RECURRING MOTIFS</p>' +
        symbols.map(symbol => '<button class="record-symbol-link" type="button" data-symbol-id="' + escapeHTML(symbol.id) + '">' +
          escapeHTML(symbol.name) + '<span>' + escapeHTML(symbol.motif || "") + '</span></button>').join("") + '</div>' : '') +
      (related.length ? '<div class="record-related"><p class="eyebrow">CONNECTED RECORDS</p>' +
        related.map(item => '<button class="record-related-link" type="button" data-record-id="' + escapeHTML(recordId(item)) + '">' +
          escapeHTML(recordTitle(item)) + '</button>').join('') + '</div>' : '');
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

    document.addEventListener("click", event => {
      const close = event.target.closest("[data-inspector-close]");
      if (close) {
        modal.hidden = true;
        document.body.classList.remove("inspector-open");
        return;
      }

      const trigger = event.target.closest("[data-record-id]");
      if (!trigger) return;
      const record = getAllPublicRecords().find(item => recordId(item) === trigger.getAttribute("data-record-id"));
      if (record) showRecordInspector(record);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !modal.hidden) {
        modal.hidden = true;
        document.body.classList.remove("inspector-open");
      }
    });
  }

  function renderEntry() {
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
        "REALITY WITH THE SIGNAL DISTORTED."
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

  function buildSearchIndex() {
    const index = getSearchIndex();
    if (!index || typeof index.build !== "function") return [];

    const records = [
      { id: "escie", type: "identity", title: "ESCIE", description: "The central consciousness / interface.", status: "active", published: true, visibility: "public" },
      ...normalizeCollection(getMusic()),
      ...normalizeCollection(getProjects()),
      ...normalizeCollection(getArchive()),
      ...normalizeCollection(getInvestigation()),
      ...normalizeCollection(getPeople()),
      ...normalizeCollection(getLocations())
    ].filter(record =>
      record &&
      (record.id || record.recordId) &&
      isPublic(record)
    );

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

    const records = [
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

    const publicInvestigations = normalizeCollection(getInvestigation()).filter(isPublic);
    if (publicInvestigations.length) return investigation;

    const publicArchive = normalizeCollection(getArchive()).filter(isPublic);
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
      renderNavigation();
      if (typeof router.navigate === "function" && router.resolve(route)) {
        router.navigate(route);
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
    if (!button || !nav) return;

    button.addEventListener("click", function () {
      const open = document.body.classList.toggle("menu-open");
      button.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        document.body.classList.remove("menu-open");
        nav.classList.remove("is-open");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function render() {
    renderEntry();
    renderNavigation();
    renderNow();
    renderMusic();
    renderProjects();
    renderWeb();
    renderArchive();
    renderInvestigation();
    renderAbout();
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

    return health.check([
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
      "ESCIE_SEARCH_INDEX"
    ]);
  };
  ESCIE_RUNTIME.render = render;
  ESCIE_RUNTIME.initialize = initialize;

  window.ESCIE_RUNTIME = ESCIE_RUNTIME;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
