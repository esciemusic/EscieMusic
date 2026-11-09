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
    ready: false,
    universeContract: null
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

  function safeExternalURL(value) {
    const raw = String(value == null ? "" : value).trim();
    if (!raw) return "";
    try {
      const parsed = new URL(raw, window.location.href);
      return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
    } catch (error) {
      return "";
    }
  }

  function glassEyeYouTubeURL(value) {
    const raw = String(value == null ? "" : value).trim();
    if (!raw) return "";
    try {
      const parsed = new URL(raw, window.location.href);
      const host = parsed.hostname.toLowerCase().replace(/^www\\./, "");
      let id = "";
      if (host === "youtu.be") id = parsed.pathname.replace(/^\//, "").split("/")[0];
      else if (host === "youtube.com" || host === "youtube-nocookie.com") {
        if (parsed.pathname === "/watch") id = parsed.searchParams.get("v") || "";
        else if (parsed.pathname.startsWith("/embed/")) id = parsed.pathname.split("/")[2] || "";
        else if (parsed.pathname.startsWith("/shorts/")) id = parsed.pathname.split("/")[2] || "";
      }
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return "";
      return "https://www.youtube-nocookie.com/embed/" + id + "?rel=0&modestbranding=1";
    } catch (error) { return ""; }
  }

  function getGlobal(name, fallback) {
    return window[name] !== undefined ? window[name] : fallback;
  }

  function validateUniverseContract() {
    const contract = getGlobal("ESCIE_UNIVERSE_CONTRACT", null);
    ESCIE_RUNTIME.universeContract = contract;
    if (contract && typeof contract.validate === "function") {
      const result = contract.validate();
      if (!result.ok) console.error("ESCIE UNIVERSE CONTRACT FAILURE", result.errors);
      return result;
    }
    return { ok: false, errors: ["universe contract unavailable"] };
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
    let saved = state && state.language;
    try { saved = localStorage.getItem("escie-language") || saved; } catch (error) {}
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

    try { localStorage.setItem("escie-language", normalized); } catch (error) {}

    document.documentElement.lang = normalized;
    document.querySelectorAll("[data-language]").forEach(button => {
      const active = button.getAttribute("data-language") === normalized;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
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
        const targetId = route;
        const exists = targetId === "entry" || !!byId(targetId);
        if (!exists) return "";
        return '<a class="nav-link node-link' + (route === currentRoute ? ' is-current' : '') + '" href="' + escapeHTML(target) + '"' +
          (route === currentRoute ? ' aria-current="page"' : '') + ' data-node-target="' + escapeHTML(targetId) + '">' +
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

  function reduceMotion() {
    return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initializeSectionVisuals() {
    const visuals = Array.from(document.querySelectorAll(".section-visual"));
    if (!visuals.length) return;
    const visualUI = getGlobal("ESCIE_VISUALS_UI", null);
    if (visualUI && typeof visualUI.init === "function") visualUI.init();
    if (reduceMotion() || !("IntersectionObserver" in window)) {
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
        '<h3>' + escapeHTML(transmissionLabel) + "</h3>" +
        '<p>' + escapeHTML(transmissionText) + "</p>" +
        (publicMusic ? '<button class="record-action record-card" type="button" data-record-id="' + escapeHTML(recordId(publicMusic)) + '">OPEN TRANSMISSION</button>' : '') +
        '<div class="now-meta">' +
          '<span>' + escapeHTML(location) + "</span>" +
          '<span>' + escapeHTML(String(site.publicYear || new Date().getFullYear())) + "</span>" +
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
    if(!work.length){
      container.innerHTML='<div class="record-filters-empty"><span>METADATA / PUBLIC WORK</span><strong>NO PUBLIC WORK RECORDS YET.</strong><p>Released work will appear here with its metadata filters when it enters the public record.</p></div>';
      return;
    }
    const vals=k=>Array.from(new Set(work.map(r=>r&&r[k]).filter(Boolean))).sort();
    const options=(a,v,l)=>`<option value="">${escapeHTML(l)}</option>`+a.map(x=>`<option value="${escapeHTML(x)}"${v===x?" selected":""}>${escapeHTML(x)}</option>`).join("");
    const loc=Array.from(new Set(work.flatMap(r=>Array.isArray(r.locations)?r.locations:[]))).sort();
    const sym=Array.from(new Set(work.flatMap(r=>Array.isArray(r.symbols)?r.symbols:[]))).sort();
    const projects=Array.from(new Set(work.flatMap(r=>{const p=r&&r.project; if(p)return [p]; return r&&r.type==="project"&&r.id?[r.id]:[];}))).sort();
    const filterField=(label,key,values,allLabel)=>values.length>1?`<label>${label}<select data-work-filter="${key}">${options(values,f[key],allLabel)}</select></label>`:"";
    const filterMarkup=[
      filterField("TYPE","type",vals("type"),"ALL TYPES"),
      filterField("STATUS","status",vals("status"),"ALL STATUS"),
      filterField("PROJECT","project",projects,"ALL PROJECTS"),
      filterField("LOCATION","location",loc,"ALL LOCATIONS"),
      filterField("MOTIF","symbol",sym,"ALL MOTIFS")
    ].filter(Boolean).join("");
    if(!filterMarkup){
      container.innerHTML="";
      return;
    }
    container.innerHTML=`<div class="record-filters-heading"><span>DISCOVER BY METADATA</span><button type="button" class="record-filter-clear">CLEAR</button></div><div class="record-filter-grid">${filterMarkup}</div><p class="record-filter-count">${filtered.length} OF ${work.length} PUBLIC WORK RECORD${work.length===1?"":"S"}</p>`;
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

    container.innerHTML = motifMarkup("art") + visible.map(track => {
      const context = recordContext(track);
      const parent = context.parents[0];
      const parentRecord = parent ? getAllRecords().find(item => recordId(item) === parent.record) : null;
      const media = Array.isArray(track.media) ? track.media : [];
      const audio = media.find(item => String(item && (item.type || item.kind) || "").toLowerCase() === "audio" && safeExternalURL(item.url));
      const stage = String(track.release_status || track.status || "TRANSMISSION").toUpperCase();
      const projectLabel = parentRecord ? recordTitle(parentRecord) : (track.project || "ESCIE");
      const number = track.number ? String(track.number).padStart(3, "0") : "—";
      const listen = audio
        ? '<button class="record-action record-card" type="button" data-record-id="' + escapeHTML(recordId(track)) + '">LISTEN</button>'
        : '<span class="record-action is-muted">AUDIO PENDING</span>';
      return '<article class="music-card" data-record-id="' + escapeHTML(recordId(track)) + '"' + narrationAttributes(track) + '>' +
        '<div class="music-card-top"><span class="eyebrow">' + escapeHTML(number) + ' / ' + escapeHTML(projectLabel) + '</span><span class="merch-status">' + escapeHTML(stage) + '</span></div>' +
        '<div class="music-card-body"><h3>' + escapeHTML(recordTitle(track)) + '</h3>' +
        '<p>' + escapeHTML(track.description || track.summary || "ESCIE music record.") + '</p>' +
        '<div class="music-card-meta"><span>' + escapeHTML(track.release_date || "DATE WITHHELD") + '</span><span>' + escapeHTML((track.tags || []).slice(0, 3).join(" · ") || "SIGNAL") + '</span></div>' +
        listen + '</div></article>';
    }).join("");
  }

  function renderProjects() {
    const container = byId("projects-container");
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

      return '<article class="project-card" data-record-type="body" data-record-id="' +
        escapeHTML(recordId(project)) + '"' + narrationAttributes(project) + '>' +
        '<p class="eyebrow">CURRENT TRANSMISSION</p>' +
        '<h3>' + escapeHTML(recordTitle(project)) + "</h3>" +
        '<div class="project-structure">' +
          releasedStructure.map(part =>
            '<button class="project-part record-card" type="button" data-record-id="' + escapeHTML(part.trackId || "") + '">' +
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
    const registry=getGlobal("ESCIE_RECORD_REGISTRY",null),records=getAllPublicRecords();
    const byIdMap=new Map(records.filter(Boolean).map(record=>[recordId(record),record]));
    const base=registry&&typeof registry.publicRelationships==="function"
      ? registry.publicRelationships(filters||{})
      : normalizeCollection(getRelationships()).filter(relationship=>relationship&&relationship.public_disclosure===true&&relationship.visibility!=="private"&&relationship.visibility!=="withheld");
    const live=normalizeCollection(getGlobal("ESCIE_LIVE_RELATIONSHIPS",[])).map(r=>({
      id:r.id,from:r.from_record_id||r.from,to:r.to_record_id||r.to,type:r.type||"connection",category:r.category||null,
      public_disclosure:true,visibility:"public"
    }));
    return base.concat(live).filter(r=>r&&byIdMap.has(r.from)&&byIdMap.has(r.to));
  }

  function renderWorld(){
    const container=byId("world-container"); if(!container)return;
    const locations=normalizeCollection(getLocations()).filter(isPublic).filter(place=>recordId(place)==="montreal");
    const records=getAllPublicRecords().filter(isPublic);
    const counts={};
    ["person","place","moment","fragment","proof","investigation"].forEach(type=>counts[type]=records.filter(r=>String(r.type||"").toLowerCase()===type).length);
    const nowRecord=getGlobal("ESCIE_SITE",{});
    container.innerHTML='<div class="world-index">'+motifMarkup("world")+
      '<p class="eyebrow">MONTRÉAL / THE WORLD</p>'+
      '<div class="world-now-strip"><strong>'+escapeHTML(nowRecord.location||"MONTRÉAL, QUÉBEC")+'</strong><em>THE WORLD STARTS HERE.</em></div>'+
      '<div class="world-place-list">'+locations.map((place,index)=>
        '<article class="world-place world-place-current" role="button" tabindex="0" aria-label="Open '+escapeHTML(recordTitle(place))+'" data-record-id="'+escapeHTML(recordId(place))+'">'+
          '<span class="world-place-index">'+String(index+1).padStart(2,"0")+'</span>'+
          '<div class="world-place-copy"><h3>'+escapeHTML(recordTitle(place))+'</h3><p>'+escapeHTML(place.description||"THE CITY ANCHOR.")+'</p></div>'+
          ''+
        '</article>').join("")+'</div>'+
      '<div class="world-record-pulse"><span class="eyebrow">THE CITY RECORD</span>'+
        '<div class="world-record-stats">'+
          '<span><strong>'+counts.person+'</strong> PEOPLE</span><span><strong>'+counts.moment+'</strong> MOMENTS</span><span><strong>'+counts.fragment+'</strong> FRAGMENTS</span><span><strong>'+counts.proof+'</strong> PROOF</span>'+
        '</div>'+
      '</div>'+
      '<div class="world-wear-layer">'+
        '<div class="world-wear-head"><p class="eyebrow">THE WORLD YOU CAN WEAR</p><span>PHYSICAL LAYER</span></div>'+
        '<div id="merch-filters" class="merch-controls" aria-label="Clothing filters"></div>'+
        '<div id="merch-container" class="merch-container" hidden></div>'+
      '</div>'+
      '</div>';
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
    const recordTypes=Array.from(new Set(records.map(r=>String(r.type||"record")).filter(Boolean))).sort();
    const nodeOptions=nodeRecords.sort((x,y)=>recordTitle(x).localeCompare(recordTitle(y))).map(r=>'<option value="'+escapeHTML(recordId(r))+'"'+(state.record===recordId(r)?" selected":"")+'>'+escapeHTML(recordTitle(r))+'</option>').join("");
    const typeOptions=types.map(t=>'<option value="'+escapeHTML(t)+'"'+(state.type===t?" selected":"")+'> '+escapeHTML(t.replace(/_/g," "))+'</option>').join("");
    const categoryOptions=categories.map(t=>'<option value="'+escapeHTML(t)+'"'+(state.category===t?" selected":"")+'> '+escapeHTML(t.replace(/_/g," "))+'</option>').join("");
    const recordTypeOptions=recordTypes.map(t=>'<option value="'+escapeHTML(t)+'">'+escapeHTML(t.replace(/_/g," "))+'</option>').join("");
    const recordSearch=String(state.search||"").trim().toLowerCase();
    const recordTypeFilter=String(state.recordType||"").trim().toLowerCase();
    const searchable=records.filter(r=>{
      const matchesType=!recordTypeFilter||String(r.type||"record").toLowerCase()===recordTypeFilter;
      const matchesSearch=!recordSearch||recordTitle(r).toLowerCase().includes(recordSearch)||(r.description||"").toLowerCase().includes(recordSearch);
      return matchesType&&matchesSearch;
    }).slice(0,16);
    const recordResults=searchable.map(r=>{
      const connected=all.some(link=>link.from===recordId(r)||link.to===recordId(r));
      return '<button type="button" class="web-record-result" data-record-id="'+escapeHTML(recordId(r))+'"><strong>'+escapeHTML(recordTitle(r))+'</strong><span>'+escapeHTML(r.type||"record")+' · '+(connected?"CONNECTED":"UNCONNECTED")+'</span></button>';
    }).join("");
    const hasSearch=recordSearch.length>0||recordTypeFilter.length>0;
    const resultMarkup=hasSearch?(recordResults||'<span class="inspector-note">NO MATCHES.</span>'):"";
    const count=registry&&typeof registry.relationshipCounts==="function"?registry.relationshipCounts(state):{relationships:relationships.length,nodes:new Set(relationships.flatMap(r=>[r.from,r.to])).size};
    container.innerHTML=
      '<div class="web-intro">'+motifMarkup("web")+
      '<p class="eyebrow">THE WEB / CONNECTION LEDGER</p>'+
      '<div class="record-filters web-filters"><div class="record-filters-heading"><span>EXPLORE THE NETWORK</span><button type="button" class="record-filter-clear" data-web-filter-clear>CLEAR</button></div>'+
      '<div class="record-filter-grid"><label>RECORD<select data-web-filter="record"><option value="">ALL CONNECTED RECORDS</option>'+nodeOptions+'</select></label>'+
      '<label>TYPE<select data-web-filter="type"><option value="">ALL CONNECTION TYPES</option>'+typeOptions+'</select></label>'+
      '<label>CATEGORY<select data-web-filter="category"><option value="">ALL CATEGORIES</option>'+categoryOptions+'</select></label>'+
      '</div><p class="record-filter-count">'+escapeHTML(String(relationships.length))+' OF '+escapeHTML(String(all.length))+' ESTABLISHED CONNECTION'+(all.length===1?"":"S")+' · '+escapeHTML(String(count.nodes||0))+' NODES</p></div>'+
      '<div class="web-record-search"><label>SEARCH THE PUBLIC RECORD<input type="search" data-web-search value="'+escapeHTML(state.search||"")+'" placeholder="People, places, moments, fragments…"></label>'+
      (recordTypes.length>1?'<div class="web-record-tools"><span class="eyebrow">BROWSE RECORD TYPE</span><select data-web-record-type><option value="">ALL PUBLIC RECORDS</option>'+recordTypes.map(t=>'<option value="'+escapeHTML(t)+'"'+(recordTypeFilter===String(t).toLowerCase()?" selected":"")+'>'+escapeHTML(t.replace(/_/g," "))+'</option>').join("")+'</select></div>':"")+
      '<div class="web-record-results">'+resultMarkup+'</div></div></div>'+
      (relationships.length?'<div class="web-list">'+relationships.map(relationship=>{
        const from=byIdMap.get(relationship.from),to=byIdMap.get(relationship.to);
        return '<article class="web-connection" data-relationship-id="'+escapeHTML(relationship.id||"")+'">'+
          '<button class="web-node web-node-button" type="button" data-record-id="'+escapeHTML(relationship.from)+'"><strong>'+escapeHTML(recordTitle(from))+'</strong><span>'+escapeHTML(from.type||"record")+'</span></button>'+
          '<span class="web-arrow" aria-hidden="true">→</span><span class="web-type">'+escapeHTML((relationship.type||"CONNECTION").replace(/_/g," "))+'</span><span class="web-arrow" aria-hidden="true">→</span>'+
          '<button class="web-node web-node-button" type="button" data-record-id="'+escapeHTML(relationship.to)+'"><strong>'+escapeHTML(recordTitle(to))+'</strong><span>'+escapeHTML(to.type||"record")+'</span></button>'+
        '</article>';}).join("")+'</div>':
        '<div class="archive-status web-empty-state"><p class="eyebrow">NO PUBLIC CONNECTIONS YET</p><h3>THE WEB IS WAITING.</h3><p>There are no established links to draw yet. The record search above still lets you inspect what is public. Connections appear when ESCIE establishes them or approved audience material creates a reviewed relationship.</p><button type="button" class="web-participate-link" data-web-participate>ADD A FINDING THROUGH GLASS EYE</button></div>');
  }


  function renderGameItemInspector(item){
    const api=window.ESCIE_GAME_REGISTRY;
    if(!api||typeof api.inspectGameItem!=="function")return "";
    const inspected=api.inspectGameItem(item,{owned:[],discovered:[],unlocked:[]});
    if(!inspected.ok)return "";
    const action=inspected.acquisition==="REAL_MONEY"?"ENTER CHECKOUT":
      inspected.acquisition==="EARNED"?"EARN IN THE SIGNAL":
      inspected.acquisition==="FREE"||inspected.acquisition==="CLAIMABLE"?"FOUND / CLAIM IN GAME":
      inspected.acquisition==="OWNED"?"OWNED":"LOCKED";
    return '<div class="game-item-inspection"><span>ACQUISITION</span><strong>'+escapeHTML(action)+'</strong></div>';
  }

  function renderGameShop(){
  const root=document.getElementById("game-shop-container");
  if(!root)return;
  const api=window.ESCIE_GAME_REGISTRY;
  const items=api&&typeof api.items==="function"?api.items():[];
  const esc=v=>typeof escapeHTML==="function"?escapeHTML(String(v??"")):String(v??"");
  if(!items.length){
    root.innerHTML='<div class="game-shop-empty">NO ITEMS AVAILABLE.</div>';
    return;
  }
  root.innerHTML=items.map(item=>{
    const type=String(item.price_type||"FREE").toUpperCase();
    const price=type==="REAL_MONEY"&&item.price!==null?("CAD "+esc(item.price)):type==="EARNED"?(esc(item.price||0)+" "+esc(item.currency||"SIGNAL")):"FREE";
    const purchaseURL=safeExternalURL(item.external_purchase_url);
    const action=type==="REAL_MONEY"&&purchaseURL
      ? '<a class="game-item-action" href="'+esc(purchaseURL)+'" target="_blank" rel="noopener noreferrer">ENTER CHECKOUT</a>'
      : type==="EARNED" ? '<span class="game-item-action is-muted">EARN IN THE SIGNAL</span>'
      : '<span class="game-item-action is-muted">FOUND / CLAIMED IN GAME</span>';
    return '<article class="game-item-card"><div class="game-item-type">'+esc(type)+'</div><h3>'+esc(item.title)+'</h3><p>'+esc(item.description)+'</p><div class="game-item-price">'+price+'</div>'+renderGameItemInspector(item)+action+'</article>';
  }).join("");
}
function renderClothing(){
    const container=byId("clothing-container");
    if(!container)return;
    const clothing=normalizeCollection(getGlobal("ESCIE_CLOTHING",[])).filter(item=>item&&item.public_visibility!=="hidden"&&item.release_status!=="locked");
    if(!clothing.length){
      container.innerHTML='<div class="archive-status"><p class="eyebrow">WARDROBE STATE</p><h3>THE CLOTHING LAYER IS READY.</h3><p>The first wardrobe will appear here as garments are approved for public release.</p></div>';
      return;
    }
    const cards=clothing.map(item=>{
      const category=String(item.category||"CORE");
      const stage=String(item.production_stage||"DESIGN");
      const front=item.front&&item.front.text?item.front.text:"";
      const back=item.back&&item.back.text?item.back.text:"";
      const details=[item.color,item.gsm_target,item.fit].filter(Boolean).join(" · ");
      return '<article class="clothing-card" data-clothing-id="'+escapeHTML(item.id)+'">'+
        '<div class="clothing-card-head"><span class="eyebrow">'+escapeHTML(category)+'</span><span class="pill">'+escapeHTML(stage)+'</span></div>'+
        '<h3>'+escapeHTML(item.title||"UNTITLED")+'</h3>'+
        '<p>'+escapeHTML(item.notes||"Clothing from the ESCIE world.")+'</p>'+
        '<div class="clothing-specs"><span>'+escapeHTML(details)+'</span><span>'+escapeHTML((item.sizes||[]).join(" / "))+'</span></div>'+
        '<div class="clothing-markup"><span>'+escapeHTML(front)+'</span><span>'+escapeHTML(back)+'</span></div>'+
      '</article>';
    }).join("");
    container.innerHTML='<div class="clothing-intro"><p class="eyebrow">DROP 001 / THE FIRST WARDROBE</p><h3>THE GARMENT STANDS ON ITS OWN.</h3><p>Clothing is part of the world, not a requirement for understanding it. Digital connections remain secondary.</p></div><div class="clothing-grid">'+cards+'</div>';
  }

  function renderMerch(){
    const container=byId("merch-container");
    if(!container)return;
    const config=getGlobal("ESCIE_MERCH",{});
    const merchLocked=String(config.public_visibility||"").toLowerCase()==="hidden"||String(config.release_status||"").toLowerCase()!=="released";
    if(merchLocked){
      container.innerHTML="";
      container.hidden=true;
      return;
    }
    container.hidden=false;
    const clothing=normalizeCollection(getGlobal("ESCIE_CLOTHING",[])).filter(item=>item&&item.type==="CLOTHING"&&String(item.public_visibility||"").toLowerCase()!=="hidden"&&String(item.release_status||"released").toLowerCase()==="released");
    const filterState=String(container.dataset.filter||"ALL").toUpperCase();
    const visible=clothing.filter(item=>filterState==="ALL"||String(item.category||"CORE").toUpperCase()===filterState);
    const storeUrl=safeExternalURL(config.storefront_url);
    const storeLabel=String(config.storefront_label||"OPEN THE STORE");
    const universeLinks=Array.isArray(config.universe_links)?config.universe_links:[];
    const intro='<div class="merch-world-intro">'+
      '<div class="merch-world-copy"><p class="eyebrow">THE PHYSICAL LAYER / '+escapeHTML(String(config.shop_concept||"THE WORLD YOU CAN OWN"))+'</p>'+
      '<h3>TAKE A TRACE WITH YOU.</h3>'+
      '<p>Clothing is where the ESCIE universe leaves the screen and enters ordinary life. Montréal, the signal, the archive and the eye become things you can carry.</p></div>'+
      '<div class="merch-universe-links"><span class="eyebrow">CONNECTED RECORDS</span>'+
      universeLinks.map(label=>{const id=String(label).toLowerCase().replace(/[^a-z0-9]+/g,"-");return '<a href="#'+escapeHTML(id)+'" class="merch-universe-link">'+escapeHTML(label)+' ↗</a>';}).join("")+
      '</div></div>';
    if(!visible.length){
      container.innerHTML=intro+'<div class="merch-empty"><p class="eyebrow">WARDROBE / '+escapeHTML(filterState)+'</p><h3>NOTHING IS PUBLIC HERE YET.</h3><p>The physical layer only shows garments that have a defined production path.</p></div>';
      return;
    }
    const cards=visible.map(item=>{
      const packet=item.production_packet||{};
      const stage=String(item.production_stage||"DESIGN");
      const priority=String(item.priority||"STANDARD");
      const sizes=Array.isArray(item.sizes)?item.sizes.join(" / "):"";
      const details=[item.color,item.garment,item.fabric,item.gsm_target].filter(Boolean).join(" · ");
      const front=item.front&&item.front.text?item.front.text:"";
      const back=item.back&&item.back.text?item.back.text:"";
      const image=item.image?String(item.image):"";
      const ready=String(item.status||"").toUpperCase()==="RELEASED"&&!!storeUrl;
      const action=ready?'<a class="merch-card-action" href="'+escapeHTML(storeUrl)+'" target="_blank" rel="noopener noreferrer">BUY / '+escapeHTML(storeLabel)+'</a>':'<span class="merch-card-action is-quiet">SAMPLE / HUMAN APPROVAL</span>';
      return '<article class="merch-card" data-merch-category="'+escapeHTML(item.category||"CORE")+'">'+
        '<div class="merch-card-top"><span class="eyebrow">'+escapeHTML(item.category||"CORE")+'</span><span class="merch-status">'+escapeHTML(stage)+'</span></div>'+
        '<div class="merch-card-art">'+(image?'<img src="'+escapeHTML(image)+'" alt="'+escapeHTML(item.title||"ESCIE garment")+'" loading="lazy">':'')+
        '<span>'+escapeHTML(front||"ESCIE")+'</span><i></i><strong>'+escapeHTML(back||item.title||"")+'</strong></div>'+
        '<div class="merch-card-body"><h3>'+escapeHTML(item.title||"UNTITLED")+'</h3>'+
        '<p>'+escapeHTML(item.notes||"Physical ESCIE object.")+'</p>'+
        '<dl class="merch-specs"><div><dt>GARMENT</dt><dd>'+escapeHTML(details||"SPECIFICATION PENDING")+'</dd></div>'+
        '<div><dt>FIT / SIZE</dt><dd>'+escapeHTML((item.fit||"FIT PENDING")+" · "+sizes)+'</dd></div>'+
        '<div><dt>PRODUCTION</dt><dd>'+escapeHTML(priority+" · "+(packet.quantity_decision||"HUMAN GATE"))+'</dd></div></dl>'+action+
        '</div></article>';
    }).join("");
    const storeAction=storeUrl?'<a class="merch-store-link" href="'+escapeHTML(storeUrl)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(storeLabel)+' ↗</a>':'<span class="merch-store-link is-disabled">STORE LAYER / NOT CONNECTED</span>';
    container.innerHTML=intro+
      '<div class="merch-statusbar"><div><span class="eyebrow">DROP 001 / HEART ON MY SLEEVE</span><strong>'+visible.length+' PHYSICAL RECORD'+(visible.length===1?"":"S")+'</strong></div>'+
      '<p>Presentation lives here. Checkout, inventory, shipping and taxes remain outside the universe interface.</p>'+storeAction+'</div>'+
      '<div class="merch-grid-list">'+cards+'</div>';
  }

  function bindMerchFilters(){
    const host=byId("merch-filters");
    const clothing=normalizeCollection(getGlobal("ESCIE_CLOTHING",[])).filter(item=>item&&item.type==="CLOTHING");
    if(host){
      const categories=Array.from(new Set(clothing.map(item=>String(item.category||"CORE").toUpperCase()))).sort();
      const current=String(byId("merch-container")?.dataset.filter||"ALL").toUpperCase();
      host.innerHTML=["ALL"].concat(categories).map(value=>'<button type="button" class="merch-filter '+(current===value?"is-active":"")+'" data-merch-filter="'+escapeHTML(value)+'">'+escapeHTML(value)+'</button>').join("");
    }
    const controls=document.querySelectorAll("[data-merch-filter]");
    controls.forEach(button=>{
      if(button.dataset.bound==="1")return;
      button.dataset.bound="1";
      button.addEventListener("click",()=>{
        const value=String(button.getAttribute("data-merch-filter")||"ALL").toUpperCase();
        const container=byId("merch-container");
        if(container)container.dataset.filter=value;
        controls.forEach(item=>item.classList.toggle("is-active",item===button));
        renderMerch();
      });
    });
  }

  function renderArchive() {
    const container = byId("archive-container");
    if (!container) return;

    const records = getAllPublicRecords().filter(record => {
      const manifest = recordManifest(record);
      const archiveState = String(record.archive_state || record.archive?.state || "").toLowerCase();
      const manifestArchive = !!(manifest && manifest.sections && manifest.sections.archive === true);
      const archiveType = String(record.type || record.identity?.type || "").toLowerCase() === "archive";
      const archivedState = archiveState === "archived";
      return manifestArchive || archiveType || archivedState;
    }).filter(isPublic);

    if (!records.length) {
      renderEmpty(container, "THE ARCHIVE IS BEING PRESERVED. PUBLIC TRACES WILL APPEAR WHEN THEY ENTER THE ARCHIVE.");
      return;
    }

    const ordered = records.slice().sort((a, b) => {
      const aTime = Date.parse(a.updated_at || a.created_at || a.date || "") || 0;
      const bTime = Date.parse(b.updated_at || b.created_at || b.date || "") || 0;
      if (aTime !== bTime) return bTime - aTime;
      return recordTitle(a).localeCompare(recordTitle(b));
    });

    container.innerHTML =
      '<div class="archive-index">' +
        motifMarkup("archives") +
        '<div class="archive-index-head"><p class="eyebrow">PRESERVED TRACE / ' + escapeHTML(String(ordered.length)) + ' RECORD' + (ordered.length === 1 ? '' : 'S') + '</p><span class="archive-index-note">OPEN THE RECORD TO FOLLOW ITS TRACE.</span></div>' +
        '<div class="archive-list">' +
          ordered.map((record,index) => {
            const type = String(record.type || record.identity?.type || "record").toUpperCase();
            const dateSource = record.date || record.created_at || record.updated_at || "";
            const dateValue = dateSource ? new Date(dateSource) : null;
            const year = record.year ? String(record.year) : (dateValue && !Number.isNaN(dateValue.getTime()) ? String(dateValue.getFullYear()) : "");
            const location = record.location ? String(record.location) : "";
            const meta = [type, year, location].filter(Boolean).join(" · ");
            return '<article class="archive-record" role="button" tabindex="0" aria-label="Open ' + escapeHTML(recordTitle(record)) + '" data-record-id="' + escapeHTML(recordId(record)) + '">' +
              '<div class="archive-record-index" aria-hidden="true">' + String(index + 1).padStart(2,"0") + '</div>' +
              '<div class="archive-record-body"><p class="eyebrow">' + escapeHTML(meta || "RECORD") + '</p>' +
              '<h3>' + escapeHTML(recordTitle(record)) + '</h3>' +
              (record.description ? '<p>' + escapeHTML(record.description) + '</p>' : '') +
              '</div>' +
            '</article>';
          }).join("") +
        '</div>' +
      '</div>';
  }

  function renderInvestigation() {
    const container = byId("investigation-container");
    if (!container) return;

    const investigations = getAllPublicRecords().filter(record => {
      const manifest = recordManifest(record);
      return manifest ? !!(manifest.sections && manifest.sections.investigation) : String(record.type || "").toLowerCase() === "investigation";
    }).filter(isPublic);

    if (!investigations.length) {
      container.innerHTML = '<div class="investigation-status">' +
        motifMarkup("investigation") +
        '<p class="eyebrow">THE CASE FILES / OPEN</p>' +
        '<h3>QUESTIONS BEFORE ANSWERS.</h3>' +
        '<p>This is the place for questions that matter. A case can gather evidence, contradictions, sources, context and unresolved material without forcing a conclusion.</p>' +
        '<div class="case-file-tools">' +
          '<div><span class="eyebrow">FOLLOW</span><strong>QUESTIONS</strong><p>What does the record still not explain?</p></div>' +
          '<div><span class="eyebrow">CHECK</span><strong>EVIDENCE</strong><p>What can be documented, sourced or reviewed?</p></div>' +
          '<div><span class="eyebrow">LEAVE</span><strong>UNRESOLVED</strong><p>What remains open without being turned into fact?</p></div>' +
        '</div>' +
        '<button type="button" class="case-participate-link" data-web-participate>BRING A FINDING THROUGH GLASS EYE</button>' +
      '</div>';
      return;
    }

    const ordered = investigations.slice().sort((a,b) => {
      const aTime = Date.parse(a.updated_at || a.created_at || a.date || "") || 0;
      const bTime = Date.parse(b.updated_at || b.created_at || b.date || "") || 0;
      if (aTime !== bTime) return bTime - aTime;
      return recordTitle(a).localeCompare(recordTitle(b));
    });

    const countLabel = ordered.length === 1 ? "OPEN CASE FILE" : "OPEN CASE FILES";
    container.innerHTML =
      '<div class="investigation-index">' +
        motifMarkup("investigation") +
        '<div class="investigation-index-head"><p class="eyebrow">' + String(ordered.length) + ' ' + countLabel + '</p><span class="investigation-index-note">QUESTIONS STAY OPEN UNTIL THE RECORD CAN SUPPORT AN ANSWER.</span></div>' +
        '<div class="case-file-list">' +
          ordered.map((item,index) => {
            const evidence = Array.isArray(item.evidence) ? item.evidence.length : (Array.isArray(item.sources) ? item.sources.length : 0);
            const contradictions = Array.isArray(item.contradictions) ? item.contradictions.length : 0;
            const status = String(item.status || "OPEN").toUpperCase();
            const meta = [status, evidence ? evidence + " EVIDENCE" : "", contradictions ? contradictions + " CONTRADICTIONS" : ""].filter(Boolean).join(" · ");
            return '<article class="investigation-case" role="button" tabindex="0" aria-label="Open ' + escapeHTML(recordTitle(item)) + '" data-record-id="' + escapeHTML(recordId(item)) + '"' + narrationAttributes(item) + '>' +
              '<div class="investigation-case-index" aria-hidden="true">' + String(index + 1).padStart(2,"0") + '</div>' +
              '<div class="investigation-case-body">' +
                '<p class="eyebrow">' + escapeHTML(meta) + '</p>' +
                '<h3>' + escapeHTML(recordTitle(item)) + '</h3>' +
                (item.description ? '<p>' + escapeHTML(item.description) + '</p>' : '') +
              '</div>' +
            '</article>';
          }).join("") +
        '</div>' +
      '</div>';
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

    const identity = Array.isArray(about.role) && about.role.length
      ? about.role.join(" · ").toUpperCase()
      : "THE FATHER · THE MAN · THE MONSTER";

    container.innerHTML =
      '<p class="about-identity" aria-label="ESCIE identity facets">' + escapeHTML(identity) + "</p>" +
      '<div class="about-principles">' +
        '<p><span>PRINCIPLE</span>' + escapeHTML(
          about.principle || site.philosophy || "The art does not create the universe. The universe creates the art."
        ) + "</p>" +
      '</div>' +
      socialMarkup;
  }

  function renderGlassEye() {
    const container=byId("glass-eye-container"); if(!container)return;
    const memory=getGlobal("ESCIE_GLASS_EYE_MEMORY",null),journey=getGlobal("ESCIE_GLASS_EYE_JOURNEY",null);
    const state=memory&&typeof memory.state==="function"?memory.state():{};
    const path=journey&&typeof journey.journey==="function"?(journey.journey().path||[]):(Array.isArray(state.path)?state.path:[]);
    const journeyState=journey&&typeof journey.journey==="function"?journey.journey():{};
    const lastSignal=journeyState.last_signal||null;
    const recent=path.slice(-6).reverse();
    const esc=v=>escapeHTML(v==null?"":v);
    const language=String(ESCIE_RUNTIME.glassLanguage||"en").toLowerCase();
    const copy={
      en:{side:"THIS IS YOUR SIDE OF THE SCREEN.",core:"SEE · HEAR · FOLLOW · MISS · RETURN",body:"What you notice, hear and follow belongs to your journey here.",see:"SEE WHAT I SAW",follow:"FOLLOW MY THREAD",return:"RETURN TO THE WORLD",info:"ⓘ INFO",clear:"CLEAR MY MEMORY",local:"LOCAL MEMORY / NON-CANONICAL",memory:"YOUR MEMORY",private:"LOCAL · PRIVATE · NON-CANONICAL",last:"LAST SIGNAL",recent:"RECENT PATH",footer:["YOUR PATH","YOUR MEMORY","NO CANON","NO CENTRAL HISTORY"],infoMsg:"The Glass Eye is the audience eye: a place to look through the screen, follow what catches you, and leave with your own path."},
      fr:{side:"C'EST VOTRE CÔTÉ DE L'ÉCRAN.",core:"VOIR · ENTENDRE · SUIVRE · MANQUER · REVENIR",body:"Ce que vous remarquez, entendez et suivez appartient à votre parcours ici.",see:"VOIR CE QUE J'AI VU",follow:"SUIVRE MON FIL",return:"RETOURNER AU MONDE",info:"ⓘ INFO",clear:"EFFACER MA MÉMOIRE",local:"MÉMOIRE LOCALE / NON CANONIQUE",memory:"VOTRE MÉMOIRE",private:"LOCALE · PRIVÉE · NON CANONIQUE",last:"DERNIER SIGNAL",recent:"PARCOURS RÉCENT",footer:["VOTRE PARCOURS","VOTRE MÉMOIRE","AUCUN CANON","AUCUN HISTORIQUE CENTRAL"],infoMsg:"Le Glass Eye est l'œil du public : un endroit pour regarder à travers l'écran, suivre ce qui vous accroche et repartir avec votre propre parcours."},
      es:{side:"ESTE ES TU LADO DE LA PANTALLA.",core:"VER · OÍR · SEGUIR · PERDER · VOLVER",body:"Lo que notas, escuchas y sigues pertenece a tu recorrido aquí.",see:"VER LO QUE VI",follow:"SEGUIR MI HILO",return:"VOLVER AL MUNDO",info:"ⓘ INFO",clear:"BORRAR MI MEMORIA",local:"MEMORIA LOCAL / NO CANÓNICA",memory:"TU MEMORIA",private:"LOCAL · PRIVADA · NO CANÓNICA",last:"ÚLTIMA SEÑAL",recent:"RECORRIDO RECIENTE",footer:["TU RECORRIDO","TU MEMORIA","SIN CANON","SIN HISTORIAL CENTRAL"],infoMsg:"Glass Eye es el ojo del público: un lugar para mirar a través de la pantalla, seguir lo que te llama y salir con tu propio recorrido."}
    }[language]||null;
    const t=copy||({});
    const videoConfig=getGlobal("ESCIE_GLASS_EYE_VIDEO",{});
    const videoURL=glassEyeYouTubeURL(videoConfig&&videoConfig.url);
    const videoMarkup=videoURL
      ? '<div class="glass-video-window" data-glass-video-window>'+
          '<div class="glass-video-label"><span>GLASS EYE / PRIMARY WINDOW</span><span>YOUTUBE</span></div>'+
          '<div class="glass-video-frame"><iframe src="'+esc(videoURL)+'" title="Glass Eye primary YouTube window" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>'+
        '</div>'
      : '<div class="glass-video-window glass-video-window-empty" data-glass-video-window aria-label="Glass Eye primary video window"><div class="glass-video-label"><span>GLASS EYE / PRIMARY WINDOW</span><span>YOUTUBE</span></div><div class="glass-video-placeholder"><span>PUBLIC VIDEO WINDOW</span><strong>AWAITING APPROVED VIDEO</strong></div></div>';
    container.innerHTML=
      '<div class="glass-frame glass-eye-interface">'+
        '<div class="glass-readout"><span>THE GLASS EYE</span><span>VIEWER LAYER / LOCAL MEMORY</span></div>'+
        '<div class="glass-language" role="group" aria-label="Glass Eye language">'+
          ["en","fr","es"].map(code=>'<button type="button" data-glass-language="'+code+'" class="'+(language===code?"is-active":"")+'">'+code.toUpperCase()+'</button>').join("")+
        '</div>'+
        '<div class="glass-center">'+
          '<span class="glass-dot"></span>'+
          '<strong>'+esc(t.side)+'</strong>'+
          '<span class="glass-core-line">'+esc(t.core)+'</span>'+
          '<p>'+esc(t.body)+'</p>'+
        '</div>'+
        videoMarkup+
        '<div class="glass-eye-actions" role="group" aria-label="Glass Eye actions">'+
          '<button type="button" data-glass-eye-action="observe" aria-pressed="false">'+esc(t.see)+'</button>'+
          '<button type="button" data-glass-eye-action="follow" aria-pressed="false">'+esc(t.follow)+'</button>'+
          '<button type="button" data-glass-eye-action="return" aria-pressed="false">'+esc(t.return)+'</button>'+
          '<button type="button" data-glass-eye-action="info" aria-pressed="false">'+esc(t.info)+'</button>'+
        '</div>'+
        '<p class="glass-eye-response" aria-live="polite">'+esc(t.local)+'</p>'+
        '<div class="glass-memory-inline">'+
          '<div><span>'+esc(t.memory)+'</span><strong>'+esc(t.private)+'</strong></div>'+
          '<div class="glass-path-line"><span>'+esc(t.last)+'</span><em>'+esc(lastSignal||"NONE RECORDED")+'</em></div>'+
          '<div class="glass-path-line"><span>'+esc(t.recent)+'</span><em>'+esc(path.length?(path[path.length-1].type+" / "+(path[path.length-1].target_id||"—")):"NO PATH YET")+'</em></div>'+
          (recent.length?'<div class="glass-path-events">'+recent.map(e=>'<span>'+esc(e.type)+" / "+esc(e.target_id||"—")+'</span>').join("")+'</div>':'')+
          '<button type="button" class="glass-memory-clear-inline" data-glass-eye-action="clear-memory">'+esc(t.clear)+'</button>'+
        '</div>'+
        '<div class="glass-footer">'+t.footer.map(esc).map(item=>'<span>'+item+'</span>').join("")+'</div>'+
      '</div>';
    const participationCopy={
      en:{open:"PARTICIPATION / THE RECORD IS OPEN",title:"LEAVE SOMETHING BEHIND.",intro:"Post a comment, fan theory, finding, mention or media. Submissions are reviewed before anything enters the public record.",notice:"YOU NOTICE",send:"YOU SEND",review:"WE REVIEW",observe:"OBSERVE",contribute:"CONTRIBUTE",record:"RECORD",noticeText:"Something catches your eye, ear or memory.",sendText:"Leave a theory, finding, mention, comment or media.",reviewText:"Approved material can enter the public record and create new connections.",submission:"SUBMISSION TYPE",name:"NAME / ALIAS",location:"LOCATION / CONTEXT",contribution:"YOUR CONTRIBUTION",upload:"UPLOAD PHOTO / VIDEO / AUDIO",placeholderName:"ANONYMOUS",placeholderOptional:"OPTIONAL",placeholderBody:"What did you see, hear, find or think?",submit:"SUBMIT TO THE GLASS EYE",approved:"APPROVED PUBLIC CONTRIBUTIONS",loading:"LOADING…",received:"RECEIVED. HELD FOR REVIEW — NOT CANON.",failed:"SUBMISSION FAILED.",none:"NO APPROVED CONTRIBUTIONS YET.",openMedia:"OPEN APPROVED MEDIA ↗"},
      fr:{open:"PARTICIPATION / LE REGISTRE EST OUVERT",title:"LAISSEZ QUELQUE CHOSE DERRIÈRE.",intro:"Publiez un commentaire, une théorie, une découverte, une mention ou un média. Les envois sont révisés avant toute entrée dans le registre public.",notice:"VOUS REMARQUEZ",send:"VOUS ENVOYEZ",review:"NOUS RÉVISONS",observe:"OBSERVER",contribute:"CONTRIBUER",record:"INSCRIRE",noticeText:"Quelque chose attire votre œil, votre oreille ou votre mémoire.",sendText:"Laissez une théorie, une découverte, une mention, un commentaire ou un média.",reviewText:"Le contenu approuvé peut entrer dans le registre public et créer de nouvelles connexions.",submission:"TYPE D’ENVOI",name:"NOM / ALIAS",location:"LIEU / CONTEXTE",contribution:"VOTRE CONTRIBUTION",upload:"TÉLÉVERSER PHOTO / VIDÉO / AUDIO",placeholderName:"ANONYME",placeholderOptional:"OPTIONNEL",placeholderBody:"Qu’avez-vous vu, entendu, trouvé ou pensé ?",submit:"ENVOYER AU GLASS EYE",approved:"CONTRIBUTIONS PUBLIQUES APPROUVÉES",loading:"CHARGEMENT…",received:"REÇU. EN ATTENTE DE RÉVISION — NON CANONIQUE.",failed:"ÉCHEC DE L’ENVOI.",none:"AUCUNE CONTRIBUTION APPROUVÉE POUR L’INSTANT.",openMedia:"OUVRIR LE MÉDIA APPROUVÉ ↗"},
      es:{open:"PARTICIPACIÓN / EL REGISTRO ESTÁ ABIERTO",title:"DEJA ALGO ATRÁS.",intro:"Publica un comentario, teoría, hallazgo, mención o contenido multimedia. Todo envío se revisa antes de entrar al registro público.",notice:"TÚ NOTAS",send:"TÚ ENVÍAS",review:"NOSOTROS REVISAMOS",observe:"OBSERVAR",contribute:"CONTRIBUIR",record:"REGISTRAR",noticeText:"Algo llama tu atención, oído o memoria.",sendText:"Deja una teoría, hallazgo, mención, comentario o contenido multimedia.",reviewText:"El material aprobado puede entrar al registro público y crear nuevas conexiones.",submission:"TIPO DE ENVÍO",name:"NOMBRE / ALIAS",location:"LUGAR / CONTEXTO",contribution:"TU CONTRIBUCIÓN",upload:"SUBIR FOTO / VIDEO / AUDIO",placeholderName:"ANÓNIMO",placeholderOptional:"OPCIONAL",placeholderBody:"¿Qué viste, escuchaste, encontraste o pensaste?",submit:"ENVIAR AL GLASS EYE",approved:"CONTRIBUCIONES PÚBLICAS APROBADAS",loading:"CARGANDO…",received:"RECIBIDO. EN REVISIÓN — NO ES CANON.",failed:"ENVÍO FALLIDO.",none:"AÚN NO HAY CONTRIBUCIONES APROBADAS.",openMedia:"ABRIR MEDIO APROBADO ↗"}
    }[language]||null;
    const p=participationCopy||{};
    container.insertAdjacentHTML("beforeend",
      '<section class="glass-participation" aria-labelledby="glass-participation-title">'+
        '<div class="glass-participation-head"><p class="eyebrow">'+esc(p.open)+'</p><h3 id="glass-participation-title">'+esc(p.title)+'</h3><p>'+esc(p.intro)+'</p></div><div class="glass-participation-path"><div><span class="eyebrow">01 / '+esc(p.notice)+'</span><strong>'+esc(p.observe)+'</strong><p>'+esc(p.noticeText)+'</p></div><div><span class="eyebrow">02 / '+esc(p.send)+'</span><strong>'+esc(p.contribute)+'</strong><p>'+esc(p.sendText)+'</p></div><div><span class="eyebrow">03 / '+esc(p.review)+'</span><strong>'+esc(p.record)+'</strong><p>'+esc(p.reviewText)+'</p></div></div>'+
        '<form class="glass-participation-form" data-glass-participation-form>'+
          '<div class="glass-participation-types" role="group" aria-label="'+esc(p.submission)+'">'+
            ["COMMENT","THEORY","FINDING","MENTION"].map((kind,i)=>'<button type="button" class="'+(i===0?"is-active":"")+'" data-glass-kind="'+kind+'">'+kind+'</button>').join("")+
          '</div>'+
          '<input type="hidden" name="kind" value="COMMENT">'+
          '<label>'+esc(p.name)+'<input name="displayName" maxlength="80" placeholder="'+esc(p.placeholderName)+'"></label>'+
          '<label>'+esc(p.location)+'<input name="location" maxlength="160" placeholder="'+esc(p.placeholderOptional)+'"></label>'+
          '<label>'+esc(p.contribution)+'<textarea name="body" maxlength="5000" rows="5" placeholder="'+esc(p.placeholderBody)+'"></textarea></label>'+
          '<label>'+esc(p.upload)+'<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/wav,audio/ogg"></label>'+
          '<button type="submit" class="glass-submit">'+esc(p.submit)+'</button>'+
          '<p class="glass-participation-status" data-glass-participation-status aria-live="polite"></p>'+
        '</form>'+
        '<div class="glass-approved" data-glass-approved><p class="eyebrow">'+esc(p.approved)+'</p><div data-glass-approved-list><span class="inspector-note">'+esc(p.loading)+'</span></div></div>'+
      '</section>');
    const participation=window.ESCIE_GLASS_EYE_PARTICIPATION;
    const form=container.querySelector("[data-glass-participation-form]");
    const status=container.querySelector("[data-glass-participation-status]");
    container.querySelectorAll("[data-glass-kind]").forEach(button=>button.addEventListener("click",()=>{
      container.querySelectorAll("[data-glass-kind]").forEach(b=>b.classList.remove("is-active"));
      button.classList.add("is-active");
      form.querySelector('[name="kind"]').value=button.getAttribute("data-glass-kind")||"COMMENT";
    }));
    if(form&&participation&&typeof participation.submit==="function")form.addEventListener("submit",async event=>{
      event.preventDefault();
      const data=new FormData(form);
      if(status)status.textContent="SENDING…";
      try{
        await participation.submit({kind:data.get("kind"),displayName:data.get("displayName"),location:data.get("location"),body:data.get("body"),file:data.get("file")});
        form.reset();
        form.querySelector('[name="kind"]').value="COMMENT";
        container.querySelectorAll("[data-glass-kind]").forEach((b,i)=>b.classList.toggle("is-active",i===0));
        if(status)status.textContent=p.received;
        loadApproved();
      }catch(error){if(status)status.textContent=error&&error.message?error.message:p.failed;}
    });
    async function loadApproved(){
      if(!participation||typeof participation.approved!=="function")return;
      const list=container.querySelector("[data-glass-approved-list]");
      if(!list)return;
      const rows=await participation.approved(12);
      list.innerHTML=rows.length?rows.map(row=>{
        const media=String(row.media_url||"");
        const path=String(row.media_path||"").toLowerCase();
        const safeMedia=/^https:\/\//i.test(media)?escapeHTML(media):"";
        let mediaMarkup="";
        if(safeMedia&&/\.(png|jpe?g|gif|webp|avif)(?:$|\?)/i.test(path))mediaMarkup='<img class="glass-approved-media" src="'+safeMedia+'" alt="Approved Glass Eye contribution" loading="lazy" decoding="async">';
        else if(safeMedia&&/\.(mp4|webm|mov|m4v)(?:$|\?)/i.test(path))mediaMarkup='<video class="glass-approved-media" controls preload="metadata" src="'+safeMedia+'"></video>';
        else if(safeMedia&&/\.(mp3|wav|m4a|ogg|aac)(?:$|\?)/i.test(path))mediaMarkup='<audio class="glass-approved-media" controls preload="metadata" src="'+safeMedia+'"></audio>';
        else if(safeMedia)mediaMarkup='<a class="glass-approved-media-link" href="'+safeMedia+'" target="_blank" rel="noopener noreferrer">'+esc(p.openMedia)+'</a>';
        return '<article class="glass-approved-item"><div><strong>'+esc(row.display_name||p.placeholderName)+'</strong><span>'+esc(row.kind||"COMMENT")+(row.location_label?" / "+esc(row.location_label):"")+'</span></div>'+(row.body?'<p>'+esc(row.body)+'</p>':"")+mediaMarkup+'</article>';
      }).join("") :'<span class="inspector-note">'+esc(p.none)+'</span>';
    }
    loadApproved();
    container.querySelectorAll("[data-glass-language]").forEach(button=>button.addEventListener("click",()=>{
      ESCIE_RUNTIME.glassLanguage=button.getAttribute("data-glass-language")||"en";
      renderGlassEye();
    }));
    const response=container.querySelector(".glass-eye-response");
    container.querySelectorAll("[data-glass-eye-action]").forEach(button=>button.addEventListener("click",()=>{
      const action=button.getAttribute("data-glass-eye-action");
      if(action==="clear-memory"){if(memory&&typeof memory.clear==="function")memory.clear();renderGlassEye();return;}
      container.querySelectorAll("[data-glass-eye-action]").forEach(item=>{
        if(item.getAttribute("data-glass-eye-action")!=="clear-memory")item.setAttribute("aria-pressed","false");
      });
      button.setAttribute("aria-pressed","true");
      const messages={observe:t.local,follow:t.local,return:t.return,info:t.infoMsg};
      if(response)response.textContent=messages[action]||t.local;
      if(action!=="info"&&memory&&typeof memory.record==="function")memory.record({type:"GLASS_EYE_"+String(action||"").toUpperCase(),target_id:"glass-eye",timestamp:new Date().toISOString()});
      if(action==="return"){
        const world=byId("world"),trigger=world&&world.querySelector(".section-drop-trigger");
        if(trigger&&!world.classList.contains("section-open"))trigger.click();
      }
    }));
  }
  function getAllRecords() {
    const registry = getGlobal("ESCIE_RECORD_REGISTRY", null);
    const base = registry && typeof registry.records === "function"
      ? normalizeCollection(registry.records())
      : [
          { id: "escie", type: "identity", title: "ESCIE", description: "ESCIE THE ARTIST. THE ART SPEAKS FOR ITSELF.", status: "active", published: true, visibility: "public" },
          ...normalizeCollection(getMusic()),
          ...normalizeCollection(getProjects()),
          ...normalizeCollection(getArchive()),
          ...normalizeCollection(getInvestigation()),
          ...normalizeCollection(getPeople()),
          ...normalizeCollection(getLocations())
        ];
    const live = normalizeCollection(getGlobal("ESCIE_LIVE_RECORDS", []));
    const map = new Map(base.filter(record => record && recordId(record)).map(record => [recordId(record), record]));
    live.filter(record => record && recordId(record)).forEach(record => map.set(recordId(record), record));
    return Array.from(map.values());
  }

  function getAllPublicRecords() {
    const registry = getGlobal("ESCIE_RECORD_REGISTRY", null);
    const canonical = registry && typeof registry.allPublicRecords === "function"
      ? registry.allPublicRecords().filter(isPublic)
      : getAllRecords().filter(isPublic);
    const live = normalizeCollection(getGlobal("ESCIE_LIVE_RECORDS", []))
      .filter(isPublic)
      .filter(record => record && recordId(record));
    const map = new Map();
    canonical.forEach(record => map.set(recordId(record), record));
    live.forEach(record => map.set(recordId(record), record));
    return Array.from(map.values());
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
      now:"NOW",
      art:"ART",
      world:"THE WORLD",
      web:"THE WEB",
      archives:"THE ARCHIVES",
      investigation:"THE CASE FILES",
      "glass-eye":"GLASS EYE",
      escie:"ESCIE"
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

  let inspectorLastFocus = null;

  function closeRecordInspector() {
    const modal = byId("record-inspector");
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("inspector-open");
    if (inspectorLastFocus && typeof inspectorLastFocus.focus === "function") {
      inspectorLastFocus.focus();
    }
    inspectorLastFocus = null;
  }

  function showSymbolInspector(symbolId) {
    const modal = byId("record-inspector");
    if (!modal) return;
    inspectorLastFocus = document.activeElement;
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
      const control=event.target.closest("[data-web-filter],[data-web-record-type]");
      if(!control)return;
      ESCIE_RUNTIME.webFilters=ESCIE_RUNTIME.webFilters||{};
      const key=control.getAttribute("data-web-filter")||"recordType";
      ESCIE_RUNTIME.webFilters[key]=control.value||"";
      renderWeb();
    });

    let webSearchTimer=null;
    document.addEventListener("input", event => {
      const search=event.target.closest("[data-web-search]");
      if(!search)return;
      ESCIE_RUNTIME.webFilters=ESCIE_RUNTIME.webFilters||{};
      ESCIE_RUNTIME.webFilters.search=search.value||"";
      clearTimeout(webSearchTimer);
      webSearchTimer=setTimeout(()=>{
        renderWeb();
        const next=byId("web-container")&&byId("web-container").querySelector("[data-web-search]");
        if(next){next.focus();next.setSelectionRange(next.value.length,next.value.length);}
      },120);
    });

    document.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const archiveTrigger = event.target.closest(".archive-record[data-record-id]");
      if (!archiveTrigger) return;
      event.preventDefault();
      archiveTrigger.click();
    });

    document.addEventListener("click", event => {
      const webParticipate=event.target.closest("[data-web-participate]");
      if(webParticipate){
        const glass=byId("glass-eye"),button=glass&&glass.querySelector(".section-drop-trigger");
        if(button&&!glass.classList.contains("section-open"))button.click();
        return;
      }
      const webClear=event.target.closest("[data-web-filter-clear]");
      if(webClear){ ESCIE_RUNTIME.webFilters={}; renderWeb(); return; }

      const webControl=event.target.closest("[data-web-filter],[data-web-record-type]");
      if(webControl)return;

      const clearFilters=event.target.closest(".record-filter-clear");
      if(clearFilters){
        ESCIE_RUNTIME.workFilters={};
        renderWorkFilters(); renderMusic(); renderProjects();
        return;
      }


      const close = event.target.closest("[data-inspector-close]");
      if (close) {
        closeRecordInspector();
        return;
      }

      const sectionTrigger = event.target.closest("[data-section-target]");
      if (sectionTrigger) {
        const section = sectionTrigger.getAttribute("data-section-target");
        const target = ({
          art:"art",
          world:"world",
          web:"web",
          archives:"archives",
          investigation:"investigation",
          "glass-eye":"glass-eye",
          escie:"escie"
        })[section];
        if (target) {
          modal.hidden = true;
          document.body.classList.remove("inspector-open");
          const element = byId(target);
          history.pushState(null, "", "#"+target);window.dispatchEvent(new Event("hashchange"));
        }
        return;
      }

      const symbolTrigger = event.target.closest("[data-symbol-id]");
      if (symbolTrigger) {
        showSymbolInspector(symbolTrigger.getAttribute("data-symbol-id"));
        return;
      }

      if (event.target.closest(".nested-drop-trigger")) return;
      if (event.target.closest(".nested-drop-panel") && event.target.closest("a,button,input,select,textarea")) return;
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
                  return type === "audio" && safeExternalURL(entry.url);
                });
                return itemAudio ? {
                  id: recordId(item),
                  title: recordTitle(item),
                  url: safeExternalURL(itemAudio.url),
                  sourceId: recordId(item)
                } : null;
              })
              .filter(Boolean);
            player.setQueue(queue, { autoAdvance: true });
          }
          player.load({
            id: recordId(record),
            title: recordTitle(record),
            url: safeExternalURL(audio.url),
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
        event.preventDefault();
        closeRecordInspector();
        return;
      }

      if (event.key !== "Enter" && event.key !== " ") return;

      const trigger = event.target.closest("[data-record-id]");
      if (!trigger) return;

      // Native controls already receive keyboard activation. Handle only
      // record surfaces that are not themselves interactive controls.
      if (event.target.closest("button,a,input,select,textarea")) return;

      event.preventDefault();
      trigger.click();
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

  function buildSearchIndex() {
    const index = getSearchIndex();
    if (!index || typeof index.build !== "function") return [];

    const registry = getGlobal("ESCIE_RECORD_REGISTRY", null);
    const records = (registry && typeof registry.records === "function"
      ? registry.records()
      : [
          { id: "escie", type: "identity", title: "ESCIE", description: "ESCIE THE ARTIST. THE ART SPEAKS FOR ITSELF.", status: "active", published: true, visibility: "public" },
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
    const savedTheme = document.documentElement.dataset.theme;
    if (savedTheme === "light" || savedTheme === "dark") {
      if (state) state.theme = savedTheme;
    }
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
      const resizeApply = window.ESCIE_PERFORMANCE?.throttle ? window.ESCIE_PERFORMANCE.throttle(() => responsive.apply(document.documentElement), 100) : () => responsive.apply(document.documentElement);
      window.addEventListener("resize", resizeApply, { passive: true });
    }

    const events = getEvents();
    if (events && typeof events.on === "function") {
      events.on("language:changed", () => {
        renderEntry();
        renderNavigation();
        renderNow();
        renderMusic();
        renderProjects();
        renderClothing();
        renderMerch();
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

  function updateEntryState(route) {\n    const node = byId("entry-state");\n    if (!node) return "";\n    const active = String(route || "entry").replace(/^#/, "") || "entry";\n    node.dataset.route = active;\n    return node.textContent || "";\n  }\n\n  function bindNavigationRuntime() {
    const router = getRouter();
    if (!router) return;

    // Register the public section routes before resolving the current hash.
    // The shared router is intentionally content-agnostic, so the public shell
    // owns the list of navigable section IDs.
    if (typeof router.register === "function") {
      const hasRoute = route => router.routes && typeof router.routes.has === "function"
        ? router.routes.has(route)
        : false;

      if (!hasRoute("entry")) router.register("entry", null);
      normalizeCollection(getGlobal("ESCIE_NAVIGATION", [])).forEach(node => {
        const route = String(node && node.target || "").replace(/^#/, "");
        if (route && !hasRoute(route)) router.register(route, null);
      });
      document.querySelectorAll("main > section[id]").forEach(section => {
        if (section.id && !hasRoute(section.id)) router.register(section.id, null);
      });
    }

    const navigate = () => {
      const route = window.location.hash.replace(/^#/, "") || "entry";
      const resolved = typeof router.resolve === "function" ? router.resolve(route) : null;
      const activeRoute = resolved || route || "entry";
      document.body.dataset.route = activeRoute;
      document.documentElement.dataset.route = activeRoute;
      updateEntryState(activeRoute);
      renderEntry();
      document.documentElement.classList.remove("route-shift");
      if (!reduceMotion()) {
        void document.documentElement.offsetWidth;
        document.documentElement.classList.add("route-shift");
      }
      renderNavigation();
      refreshNavigationState();
      const accordion = window.ESCIE_SECTION_ACCORDION;
      if (accordion && typeof accordion.open === "function" && activeRoute !== "entry") {
        accordion.open(activeRoute, false);
      }
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

    const entryState = byId("entry-state");
    if (entryState) {
      const labels = { dawn: "SIGNAL // DAWN", day: "SIGNAL // DAY", dusk: "SIGNAL // DUSK", night: "SIGNAL // NIGHT" };
      entryState.textContent = labels[state] || "SIGNAL // NIGHT";
    }
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
      if (firstLink) {
        const focusFirst = function () {
          if (state.open) firstLink.focus();
        };
        if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(focusFirst);
        else window.setTimeout(focusFirst, 0);
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
    renderClothing();
    renderMerch();
    bindMerchFilters();
    renderWorld();
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

  function bindEntryLogo() {
    const logo = document.querySelector(".site-logo");
    if (!logo || logo.dataset.topReturnReady === "1") return;
    logo.dataset.topReturnReady = "1";
    logo.addEventListener("click", function(event) {
      event.preventDefault();
      try {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch (error) {
        return;
      }
      const state = getRuntimeState();
      if (state) state.route = "entry";
      window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
      document.body.dataset.route = "entry";
      document.documentElement.dataset.route = "entry";
      render();
      refreshNavigationState();
    });
  }

  function initialize() {
    if (ESCIE_RUNTIME.initialized) return ESCIE_RUNTIME;

    validateUniverseContract();
    ESCIE_RUNTIME.initialized = true;
    initializeSystemContracts();
    render();
    setupMobileMenu();
    bindEntryLogo();
    setupRecordInspector();
    const live=getGlobal("ESCIE_PUBLIC_LIVE",null);
    if(live&&live.ready&&typeof live.ready.then==="function"){live.ready.then(function(){render();refreshNavigationState();}).catch(function(error){console.warn("ESCIE LIVE PUBLIC SOURCE UNAVAILABLE",error);});}
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
      "ESCIE_VISUALS_UI",
      "ESCIE_PERFORMANCE"
    ]);

    const universe = validateUniverseContract();
    report.universe = universe;
    report.layerBalance = (window.ESCIE_LAYER_BALANCE && window.ESCIE_LAYER_BALANCE.validate) ? window.ESCIE_LAYER_BALANCE.validate() : {ok:false,errors:["layer balance unavailable"]};
    if (!universe.ok || !report.layerBalance.ok) {
      report.ok = false;
      report.failed = report.failed.concat(["ESCIE_UNIVERSE_CONTRACT"]);
    }

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
