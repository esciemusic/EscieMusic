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

  function getRuntimeState() {
    return getGlobal("ESCIE_STATE", {});
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
    return isPublished(record);
  }

  function recordId(record) {
    return record && (record.id || record.recordId || null);
  }

  function recordTitle(record) {
    return record && (record.title || record.name || "UNTITLED");
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

    nav.innerHTML = items.map(item => {
      const label = item.label || item.title || item.id || "";
      const target = item.target || item.href || ("#" + (item.id || "").toLowerCase().replace(/\s+/g, "-"));
      return '<a class="nav-link" href="' + escapeHTML(target) + '">' +
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

    container.innerHTML =
      '<div class="now-state">' +
        '<p class="eyebrow">CURRENT STATE</p>' +
        '<h3>' + escapeHTML(active ? "ACTIVE TRANSMISSION" : "NORMAL") + "</h3>" +
        '<p>' + escapeHTML(
          active && active.description
            ? active.description
            : (site.tagline || "REALITY WITH THE SIGNAL DISTORTED.")
        ) + "</p>" +
      "</div>";
  }

  function renderMusic() {
    const container = byId("music-container");
    if (!container) return;

    const music = normalizeCollection(getMusic());
    const visible = music.filter(isPublic);

    if (!visible.length) {
      renderEmpty(container, "THE MUSIC IS STILL BEING DEVELOPED.");
      return;
    }

    container.innerHTML = visible.map(track =>
      '<article class="music-card" data-record-type="art" data-record-id="' +
      escapeHTML(recordId(track)) + '">' +
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
      renderEmpty(container, "PROJECTS ARE BEING DEVELOPED.");
      return;
    }

    container.innerHTML = visible.map(project =>
      '<article class="bam-project" data-record-type="body" data-record-id="' +
      escapeHTML(recordId(project)) + '">' +
        '<p class="eyebrow">' + escapeHTML(project.type || "BODY") + "</p>" +
        '<h3>' + escapeHTML(recordTitle(project)) + "</h3>" +
        (project.description ? "<p>" + escapeHTML(project.description) + "</p>" : "") +
      "</article>"
    ).join("");
  }

  function renderArchive() {
    const container = byId("archive-container");
    if (!container) return;

    const archive = normalizeCollection(getArchive());
    const visible = archive.filter(isPublic);

    if (!visible.length) {
      renderEmpty(container, "THE ARCHIVE IS QUIET.");
      return;
    }

    container.innerHTML = visible.map(record =>
      '<article class="archive-entry" data-record-id="' +
      escapeHTML(recordId(record)) + '">' +
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
      renderEmpty(container, "NO PUBLIC INVESTIGATION IS ACTIVE.");
      return;
    }

    container.innerHTML = visible.map(item =>
      '<article class="investigation-case" data-record-id="' +
      escapeHTML(recordId(item)) + '">' +
        '<h3>' + escapeHTML(recordTitle(item)) + "</h3>" +
      "</article>"
    ).join("");
  }

  function renderAbout() {
    const container = byId("about-container");
    if (!container) return;

    const site = getSite();
    container.innerHTML =
      '<p class="about-lead">' +
      escapeHTML(site.philosophy || "The music does not create the universe. The universe creates the music.") +
      "</p>" +
      '<p>' +
      escapeHTML(site.tagline || "REALITY WITH THE SIGNAL DISTORTED.") +
      "</p>";
  }

  function renderEntry() {
    const year = byId("entry-year");
    if (year) {
      year.textContent = getSiteValue("publicYear", new Date().getFullYear());
    }

    const tagline = document.querySelector(".hero-tagline");
    if (tagline) {
      tagline.textContent = getSiteValue(
        "tagline",
        "REALITY WITH THE SIGNAL DISTORTED."
      );
    }
  }

  function buildSearchIndex() {
    const index = getSearchIndex();
    if (!index || typeof index.build !== "function") return [];

    const records = [
      ...normalizeCollection(getMusic()),
      ...normalizeCollection(getProjects()),
      ...normalizeCollection(getArchive()),
      ...normalizeCollection(getInvestigation()),
      ...normalizeCollection(getPeople())
    ].filter(record =>
      record &&
      (record.id || record.recordId) &&
      isPublic(record)
    );

    return index.build(records);
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
      ...normalizeCollection(getInvestigation())
    ];

    const plan = build.createBuildPlan({
      environment: "runtime",
      records,
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

    const events = getEvents();
    if (events && typeof events.on === "function") {
      events.on("signal:emitted", signal => {
        if (state) {
          state.activeSignalId = signal && signal.sourceId || null;
          state.transmissionLevel = signal && signal.level || 0;
        }
        renderNow();
      });

      events.on("signal:cleared", () => {
        if (state) {
          state.activeSignalId = null;
          state.transmissionLevel = 0;
        }
        renderNow();
      });
    }
  }

  function bindNavigationRuntime() {
    const router = getRouter();
    if (!router) return;

    const navigate = () => {
      const route = window.location.hash.replace(/^#/, "") || "entry";
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
    renderArchive();
    renderInvestigation();
    renderAbout();
    updateTimeState();
  }

  function initialize() {
    if (ESCIE_RUNTIME.initialized) return ESCIE_RUNTIME;

    ESCIE_RUNTIME.initialized = true;
    initializeSystemContracts();
    render();
    setupMobileMenu();
    bindNavigationRuntime();

    const state = getRuntimeState();
    if (state) {
      state.status = "ready";
    }

    const shell = getShell();
    if (shell && typeof shell.setState === "function") {
      shell.setState(state || { status: "ready" });
    }

    ESCIE_RUNTIME.ready = true;
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
  ESCIE_RUNTIME.render = render;
  ESCIE_RUNTIME.initialize = initialize;

  window.ESCIE_RUNTIME = ESCIE_RUNTIME;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
