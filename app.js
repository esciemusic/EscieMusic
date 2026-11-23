    container.querySelectorAll("[data-glass-eye-action]").forEach(button=>button.addEventListener("click",()=>{
      const action=button.getAttribute("data-glass-eye-action");
      if(action==="clear-memory"){if(memory&&typeof memory.clear==="function")memory.clear();renderGlassEye();return;}
      container.querySelectorAll("[data-glass-eye-action]").forEach(item=>{
        if(item.getAttribute("data-glass-eye-action")!=="clear-memory")item.setAttribute("aria-pressed","false");
      });
      if(action!=="hear") button.setAttribute("aria-pressed","true");
      if(action==="hear"){
        const wasPressed=button.getAttribute("aria-pressed")==="true";
        const iframe=container.querySelector(".glass-video-frame iframe");
        if(!iframe||!videoURL){
          hearRequested=false;
          if(response)response.textContent="NO APPROVED AUDIO IS AVAILABLE YET.";
          return;
        }
        button.setAttribute("aria-pressed",wasPressed?"false":"true");
        try{
          if(wasPressed){
            iframe.contentWindow.postMessage(JSON.stringify({event:"command",func:"pauseVideo",args:[]}),"https://www.youtube-nocookie.com");
            if(response)response.textContent="PLAYBACK PAUSED.";
          }else{
            hearRequested=true;
            iframe.contentWindow.postMessage(JSON.stringify({event:"command",func:"playVideo",args:[]}),"https://www.youtube-nocookie.com");
            if(response)response.textContent="STARTING PLAYBACK. LISTEN.";
          }
        }catch(error){
          hearRequested=false;
          button.setAttribute("aria-pressed","false");
          if(response)response.textContent="PLAYBACK COULD NOT START.";
        }
        return;
      }
      const messages={
        observe:"YOU LOOKED. THAT IS NOW PART OF YOUR PATH.",
        follow:"YOU CHOSE A THREAD. FOLLOW IT OR LEAVE IT.",
        return:"YOU LEFT. THE EYE REMEMBERS YOUR SIDE OF THE SCREEN.",
        info:t.infoMsg
      };
      if(response)response.textContent=messages[action]||t.local;
      const eventType={observe:"OBSERVED",follow:"CONNECTED",return:"RETURNED"}[action]||null;
      if(eventType&&memory&&typeof memory.record==="function")memory.record({type:eventType,target_id:"glass-eye",timestamp:new Date().toISOString()});
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
      web:"TRACE",
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

    const relationships = getPublicRelationshipRecords();
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
        symbols.map(symbol => '<button class="record-symbol-link' + (symbol.status === "portal" ? ' record-symbol-portal' : '') + '" type="button" data-symbol-id="' + escapeHTML(symbol.id) + '"' + (symbol.status === "portal" ? ' data-symbol-portal="true"' : '') + ' data-symbol-record="' + escapeHTML(recordId(record)) + '">' +
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
          escapeHTML(recordTitle(getAllPublicRecords().find(r => recordId(r) === item.record && isPublic(r)) || {title:item.record})) + '</button>').join("") + '</div>' : '') +
      (derivedContext.children.length ? '<div class="record-context"><p class="eyebrow">CONTAINS</p>' +
        derivedContext.children.map(item => '<button class="record-related-link" type="button" data-record-id="' + escapeHTML(item.record) + '">' +
          escapeHTML(recordTitle(getAllPublicRecords().find(r => recordId(r) === item.record && isPublic(r)) || {title:item.record})) + '</button>').join("") + '</div>' : '') +
      (derivedContext.connections.length ? '<div class="record-context"><p class="eyebrow">RELATIONSHIPS</p>' +
        derivedContext.connections.map(item => '<p><strong>' + escapeHTML(item.direction === "out" ? "TO" : "FROM") + '</strong> ' +
          '<button class="record-related-link" type="button" data-record-id="' + escapeHTML(item.record) + '">' +
          escapeHTML(recordTitle(getAllPublicRecords().find(r => recordId(r) === item.record && isPublic(r)) || {title:item.record})) + '</button>' +
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
      renderWorkFilters(); renderMusic(); renderArtForms(); renderProjects();
    });

    document.addEventListener("change", event => {
      const control=event.target.closest("[data-trace-filter],[data-trace-record-type]");
      if(!control)return;
      ESCIE_RUNTIME.traceFilters=ESCIE_RUNTIME.traceFilters||{};
      const key=control.getAttribute("data-trace-filter")||"recordType";
      ESCIE_RUNTIME.traceFilters[key]=control.value||"";
      renderTrace();
    });

    let webSearchTimer=null;
    document.addEventListener("input", event => {
      const search=event.target.closest("[data-trace-search]");
      if(!search)return;
      ESCIE_RUNTIME.traceFilters=ESCIE_RUNTIME.traceFilters||{};
      ESCIE_RUNTIME.traceFilters.search=search.value||"";
      clearTimeout(webSearchTimer);
      webSearchTimer=setTimeout(()=>{
        renderTrace();
        const next=byId("trace-container")&&byId("trace-container").querySelector("[data-trace-search]");
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
      const traceConnection=event.target.closest("[data-trace-connection-toggle]");
      if(traceConnection){
        const detail=traceConnection.parentElement&&traceConnection.parentElement.querySelector(".trace-connection-detail");
        if(detail){const open=detail.hidden===false;detail.hidden=open;traceConnection.setAttribute("aria-expanded",open?"false":"true");}
        return;
      }
      const webParticipate=event.target.closest("[data-trace-participate]");
      if(webParticipate){
        const glass=byId("glass-eye"),button=glass&&glass.querySelector(".section-drop-trigger");
        if(button&&!glass.classList.contains("section-open"))button.click();
        return;
      }
      const webClear=event.target.closest("[data-trace-filter-clear]");
      if(webClear){ ESCIE_RUNTIME.traceFilters={}; renderTrace(); return; }
      const traceTrailBack=event.target.closest("[data-trace-trail-back]");
      if(traceTrailBack){
        const trail=Array.isArray(ESCIE_RUNTIME.traceTrail)?ESCIE_RUNTIME.traceTrail:[];
        if(trail.length>1){
          trail.pop();
          ESCIE_RUNTIME.traceFilters=ESCIE_RUNTIME.traceFilters||{};
          ESCIE_RUNTIME.traceFilters.record=trail[trail.length-1]||"";
          renderTrace();
        }
        return;
      }
      const traceTrailClear=event.target.closest("[data-trace-trail-clear]");
      if(traceTrailClear){
        ESCIE_RUNTIME.traceTrail=[];
        ESCIE_RUNTIME.traceFilters=ESCIE_RUNTIME.traceFilters||{};
        ESCIE_RUNTIME.traceFilters.record="";
        renderTrace();
        return;
      }


      const webControl=event.target.closest("[data-trace-filter],[data-trace-record-type]");
      if(webControl)return;

      const clearFilters=event.target.closest(".record-filter-clear");
      if(clearFilters){
        ESCIE_RUNTIME.workFilters={};
        renderWorkFilters(); renderMusic(); renderArtForms(); renderProjects();
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
        const symbolId = symbolTrigger.getAttribute("data-symbol-id");
        if (symbolTrigger.hasAttribute("data-symbol-portal")) {
          const recordIdValue = symbolTrigger.getAttribute("data-symbol-record") || "";
          const destination = symbolContextDestination(symbolId, recordIdValue);
          if (destination && destination.route) {
            const route = destination.route;
            const category = route.indexOf("#art/") === 0 ? route.slice(5) : "";
            const target = route.indexOf("#art/") === 0 ? "art" : route.slice(1);
            const hash = category ? route : "#" + target;

            if (route === "#trace" && destination.record) {
              ESCIE_RUNTIME.traceFilters = ESCIE_RUNTIME.traceFilters || {};
              ESCIE_RUNTIME.traceFilters.record = recordId(destination.record);
            }

            history.pushState(null, "", hash);
            window.dispatchEvent(new Event("hashchange"));

            if (destination.contextual && destination.record && (category || target === "world")) {
              window.setTimeout(() => {
                const current = getAllPublicRecords().find(item => recordId(item) === recordId(destination.record));
                if (current && target !== "world") showRecordInspector(current);
              }, 0);
            }
            return;
          }
        }
        showSymbolInspector(symbolTrigger.getAttribute("data-symbol-id"));
        return;
      }

      if (event.target.closest(".nested-drop-trigger")) return;
      if (event.target.closest(".nested-drop-panel") && event.target.closest("a,button,input,select,textarea")) return;
      const trigger = event.target.closest("[data-record-id]");
      if (!trigger) return;
      const record = getAllPublicRecords().find(item => recordId(item) === trigger.getAttribute("data-record-id"));
      if (!record) return;

      const webContainer = byId("trace-container");
      if (webContainer && webContainer.contains(trigger)) {
        const id = recordId(record);
        ESCIE_RUNTIME.traceTrail = Array.isArray(ESCIE_RUNTIME.traceTrail) ? ESCIE_RUNTIME.traceTrail : [];
        if (ESCIE_RUNTIME.traceTrail[ESCIE_RUNTIME.traceTrail.length - 1] !== id) {
          ESCIE_RUNTIME.traceTrail.push(id);
        }
        const existingIndex=ESCIE_RUNTIME.traceTrail.indexOf(id);
        if(existingIndex>=0) ESCIE_RUNTIME.traceTrail=ESCIE_RUNTIME.traceTrail.slice(0,existingIndex+1);
        else ESCIE_RUNTIME.traceTrail=ESCIE_RUNTIME.traceTrail.slice(-8);
        ESCIE_RUNTIME.traceFilters = ESCIE_RUNTIME.traceFilters || {};
        ESCIE_RUNTIME.traceFilters.record = id;
        renderTrace();
        return;
      }

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
        "A GOOD PERSON. I'M JUST NOT NICE."
      );
    }

    const philosophy = byId("entry-philosophy");
    if (philosophy) {
      philosophy.textContent = getSiteValue(
        "philosophy",
        "The art does not create the universe. The universe creates the art."
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
        syncHeroNowNode();
        renderMusic();
        renderArtForms();
        renderProjects();
        renderClothing();
        renderMerch();
        renderTrace();
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
        syncHeroNowNode();
        applyUIState();
      });

      events.on("signal:cleared", () => {
        if (state) {
          state.activeSignalId = null;
          state.transmissionLevel = 0;
        }
        renderNow();
        syncHeroNowNode();
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
      const hashRoute = window.location.hash.replace(/^#/, "") || "entry";
      // Node links are deep links into THE WORLD, not standalone page sections.
      // Keep the world accordion open while world-engine.js resolves the selected node.
      const route = /^(world-node=|world-tab=)/.test(hashRoute) ? "world" : hashRoute;
      const resolved = typeof router.resolve === "function" ? router.resolve(route) : null;
      const activeRoute = resolved || route || "entry";
      document.body.dataset.route = activeRoute;
      document.documentElement.dataset.route = activeRoute;
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

  let entryTimeStateTimer = null;

  function updateTimeState() {
    const now = new Date();
    const hour = now.getHours();
    let state = "night";

    if (hour >= 5 && hour < 8) state = "dawn";
    else if (hour >= 8 && hour < 18) state = "day";
    else if (hour >= 18 && hour < 21) state = "dusk";

    document.body.dataset.time = state;
    return state;
  }

  function scheduleTimeStateRefresh() {
    if (entryTimeStateTimer !== null) {
      window.clearTimeout(entryTimeStateTimer);
      entryTimeStateTimer = null;
    }

    const now = new Date();
    const nextBoundaryHours = [5, 8, 18, 21]
      .map(hour => {
        const next = new Date(now);
        next.setHours(hour, 0, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
        return next;
      })
      .sort((a, b) => a - b)[0];

    const delay = Math.max(1000, nextBoundaryHours.getTime() - now.getTime() + 50);
    entryTimeStateTimer = window.setTimeout(() => {
      updateTimeState();
      scheduleTimeStateRefresh();
    }, delay);
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
        syncHeroNowNode();
    renderMusic();
    renderArtForms();
    renderProjects();
    renderClothing();
    renderMerch();
    bindMerchFilters();
    renderWorld();
    renderTrace();
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