/* =========================================================
   ESCIE SITE ENGINE
   Version 0.3 — Modular Foundation
   ========================================================= */

/* ---------------------------------------------------------
   BASIC HELPERS
   --------------------------------------------------------- */

function byId(id) {
  return document.getElementById(id);
}

function escapeHTML(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isPublished(item) {
  return item && item.published === true;
}


/* ---------------------------------------------------------
   SITE INITIALIZATION
   --------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", function () {

  initializeSite();
  initializeTimeSystem();
  initializeNavigation();
  initializeMobileMenu();
  initializeParallax();

});


/* ---------------------------------------------------------
   MAIN SITE ENGINE
   --------------------------------------------------------- */

function initializeSite() {

  renderNavigation();
  renderMusic();
  renderBAM();
  renderInvestigation();
  renderArchive();
  renderSignals();

}


/* ---------------------------------------------------------
   NAVIGATION
   --------------------------------------------------------- */

function renderNavigation() {

  const nav = document.querySelector(".nav-links");

  if (!nav || typeof ESCIE_NAVIGATION === "undefined") {
    return;
  }

  nav.innerHTML = "";

  ESCIE_NAVIGATION
    .filter(item => item.visible !== false)
    .forEach(item => {

      const link = document.createElement("a");

      link.href = item.target;
      link.textContent = item.label;

      nav.appendChild(link);

    });

}


/* ---------------------------------------------------------
   MUSIC
   --------------------------------------------------------- */

function renderMusic() {

  const container = byId("music-container");

  if (!container || typeof ESCIE_MUSIC === "undefined") {
    return;
  }

  const publishedTracks = ESCIE_MUSIC.filter(isPublished);

  if (publishedTracks.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <span class="micro-label">MUSIC</span>
        <h3>NO PUBLIC TRANSMISSIONS YET.</h3>
        <p>
          The archive is being assembled.
          Music will appear here when it is released.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = publishedTracks
    .map(track => {

      return `
        <article class="media-card music-card">

          <div class="card-number">
            ${escapeHTML(track.number || "")}
          </div>

          <div class="card-body">

            <span class="micro-label">
              ${escapeHTML(track.role || "TRANSMISSION")}
            </span>

            <h3>
              ${escapeHTML(track.title)}
            </h3>

            ${
              track.description
                ? `<p>${escapeHTML(track.description)}</p>`
                : ""
            }

            ${
              track.releaseDate
                ? `
                  <span class="release-date">
                    ${escapeHTML(track.releaseDate)}
                  </span>
                `
                : ""
            }

          </div>

        </article>
      `;

    })
    .join("");

}


/* ---------------------------------------------------------
   BAM PROJECT
   --------------------------------------------------------- */

function renderBAM() {

  const container = byId("bam-container");

  if (!container || typeof ESCIE_PROJECTS === "undefined") {
    return;
  }

  const bam = ESCIE_PROJECTS.find(
    project => project.id === "bam-by-any-means"
  );

  /*
    IMPORTANT:

    BAM remains completely invisible while published:false.

    The site does not reveal unreleased material.
  */

  if (!isPublished(bam)) {

    container.innerHTML = `
      <div class="empty-state">

        <span class="micro-label">
          CASE 001
        </span>

        <h3>
          TRANSMISSION PENDING.
        </h3>

        <p>
          The case exists.
          The transmission has not been released.
        </p>

      </div>
    `;

    return;
  }

  container.innerHTML = `

    <div class="project-header">

      <span class="micro-label">
        ${escapeHTML(bam.year || "")}
      </span>

      <h2>
        ${escapeHTML(bam.title)}
      </h2>

      ${
        bam.description
          ? `<p>${escapeHTML(bam.description)}</p>`
          : ""
      }

    </div>

    <div class="project-structure">

      ${
        Array.isArray(bam.structure)
          ? bam.structure.map((part, index) => `
              
              <div class="structure-item">

                <span>
                  ${String(index + 1).padStart(3, "0")}
                </span>

                <strong>
                  ${escapeHTML(part)}
                </strong>

              </div>

            `).join("")
          : ""
      }

    </div>

  `;

}


/* ---------------------------------------------------------
   INVESTIGATION
   --------------------------------------------------------- */

function renderInvestigation() {

  const container = byId("investigation-container");

  if (
    !container ||
    typeof ESCIE_INVESTIGATION === "undefined"
  ) {
    return;
  }

  const publishedCases =
    ESCIE_INVESTIGATION.filter(isPublished);

  if (publishedCases.length === 0) {

    container.innerHTML = `
      <div class="empty-state investigation-empty">

        <span class="micro-label">
          INVESTIGATION
        </span>

        <h3>
          CASE FILES SEALED.
        </h3>

        <p>
          Evidence will appear when the investigation becomes public.
        </p>

      </div>
    `;

    return;
  }

  container.innerHTML = publishedCases
    .map(caseFile => {

      return `

        <article class="case-card">

          <div class="case-number">
            CASE ${escapeHTML(caseFile.caseNumber)}
          </div>

          <h3>
            ${escapeHTML(caseFile.title)}
          </h3>

          <div class="case-question">
            ${escapeHTML(caseFile.question || "")}
          </div>

          ${
            Array.isArray(caseFile.secondaryQuestions)
              ? `
                <div class="secondary-questions">

                  ${caseFile.secondaryQuestions
                    .map(question => `
                      <span>
                        ${escapeHTML(question)}
                      </span>
                    `)
                    .join("")}

                </div>
              `
              : ""
          }

        </article>

      `;

    })
    .join("");

}


/* ---------------------------------------------------------
   ARCHIVE
   --------------------------------------------------------- */

function renderArchive() {

  const container = byId("archive-container");

  if (!container || typeof ESCIE_ARCHIVE === "undefined") {
    return;
  }

  const publishedArchive =
    ESCIE_ARCHIVE.filter(isPublished);

  if (publishedArchive.length === 0) {

    container.innerHTML = `
      <div class="empty-state">

        <span class="micro-label">
          ARCHIVE
        </span>

        <h3>
          NOTHING PUBLIC YET.
        </h3>

        <p>
          Places, fragments, memories, images,
          sounds and evidence will eventually live here.
        </p>

      </div>
    `;

    return;
  }

  container.innerHTML = publishedArchive
    .map(entry => {

      return `

        <article class="archive-card">

          <span class="micro-label">
            ${escapeHTML(entry.type || "ARCHIVE")}
          </span>

          <h3>
            ${escapeHTML(entry.title)}
          </h3>

          ${
            entry.description
              ? `<p>${escapeHTML(entry.description)}</p>`
              : ""
          }

          ${
            entry.location
              ? `
                <span class="archive-location">
                  ${escapeHTML(entry.location)}
                </span>
              `
              : ""
          }

        </article>

      `;

    })
    .join("");

}


/* ---------------------------------------------------------
   SIGNALS / EMBEDS
   --------------------------------------------------------- */

function renderSignals() {

  const container = byId("signal-container");

  if (!container || typeof ESCIE_SIGNALS === "undefined") {
    return;
  }

  const activeSignals =
    ESCIE_SIGNALS.filter(signal => signal.active !== false);

  if (activeSignals.length === 0) {

    container.innerHTML = `
      <div class="empty-state">

        <span class="micro-label">
          SIGNAL
        </span>

        <h3>
          NO ACTIVE SIGNALS.
        </h3>

      </div>
    `;

    return;
  }

  container.innerHTML = activeSignals
    .map(signal => {

      return createSignalCard(signal);

    })
    .join("");

}


function createSignalCard(signal) {

  let mediaHTML = "";

  if (
    signal.embed &&
    signal.embed.enabled === true &&
    signal.embed.source
  ) {

    mediaHTML = createSignalEmbed(signal);

  } else {

    mediaHTML = `
      <div class="embed-placeholder">

        <span>
          SIGNAL READY
        </span>

        <small>
          ${escapeHTML(signal.description || "")}
        </small>

      </div>
    `;

  }

  return `

    <article class="signal-card">

      <div class="signal-header">

        <span class="micro-label">
          ${escapeHTML(signal.type || "SIGNAL")}
        </span>

        <h3>
          ${escapeHTML(signal.name)}
        </h3>

      </div>

      ${mediaHTML}

      ${
        signal.profileUrl
          ? `
            <a
              class="signal-link"
              href="${escapeHTML(signal.profileUrl)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              OPEN SIGNAL ↗
            </a>
          `
          : ""
      }

    </article>

  `;

}


/* ---------------------------------------------------------
   EMBED ENGINE
   --------------------------------------------------------- */

function createSignalEmbed(signal) {

  const type = signal.embed.type;
  const source = signal.embed.source;

  if (type === "youtube") {

    return createYouTubeEmbed(source);

  }

  if (type === "soundcloud") {

    return createSoundCloudEmbed(source);

  }

  /*
    TikTok, Instagram and Audiomack are deliberately
    left open for platform-specific embed logic later.

    We do NOT pretend they are supported automatically
    until their actual embed/API behavior is established.
  */

  return `
    <div class="embed-placeholder">

      <span>
        EMBED READY
      </span>

      <small>
        ${escapeHTML(signal.name)} transmission infrastructure is ready.
      </small>

    </div>
  `;

}


/* ---------------------------------------------------------
   YOUTUBE
   --------------------------------------------------------- */

function createYouTubeEmbed(videoId) {

  if (!videoId) {
    return `
      <div class="embed-placeholder">
        <span>YOUTUBE READY</span>
      </div>
    `;
  }

  return `

    <div class="embed-frame youtube-frame">

      <iframe
        src="https://www.youtube.com/embed/${encodeURIComponent(videoId)}?playsinline=1"
        title="ESCIE YouTube Transmission"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen>
      </iframe>

    </div>

  `;

}


/* ---------------------------------------------------------
   SOUNDCLOUD
   --------------------------------------------------------- */

function createSoundCloudEmbed(url) {

  if (!url) {
    return `
      <div class="embed-placeholder">
        <span>SOUNDCLOUD READY</span>
      </div>
    `;
  }

  const encodedURL = encodeURIComponent(url);

  return `

    <div class="embed-frame soundcloud-frame">

      <iframe
        width="100%"
        height="166"
        scrolling="no"
        frameborder="no"
        allow="autoplay"
        src="https://w.soundcloud.com/player/?url=${encodedURL}&color=%23000000&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false">
      </iframe>

    </div>

  `;

}


/* ---------------------------------------------------------
   TIME / LIVING SKY
   --------------------------------------------------------- */

function initializeTimeSystem() {

  updateTimeOfDay();

  setInterval(updateTimeOfDay, 60000);

}


function updateTimeOfDay() {

  const hour = new Date().getHours();

  let period = "night";

  if (hour >= 5 && hour < 8) {

    period = "dawn";

  } else if (hour >= 8 && hour < 16) {

    period = "day";

  } else if (hour >= 16 && hour < 19) {

    period = "golden";

  } else if (hour >= 19 && hour < 22) {

    period = "dusk";

  } else {

    period = "night";

  }

  document.body.dataset.time = period;

}


/* ---------------------------------------------------------
   SMOOTH NAVIGATION
   --------------------------------------------------------- */

function initializeNavigation() {

  document.addEventListener("click", function (event) {

    const link = event.target.closest('a[href^="#"]');

    if (!link) return;

    const targetID =
      link.getAttribute("href");

    const target =
      document.querySelector(targetID);

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    closeMobileMenu();

  });

}


/* ---------------------------------------------------------
   MOBILE MENU
   --------------------------------------------------------- */

function initializeMobileMenu() {

  const toggle =
    document.querySelector(".menu-toggle");

  const nav =
    document.querySelector(".nav-links");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", function () {

    nav.classList.toggle("open");

    toggle.classList.toggle("open");

  });

}


function closeMobileMenu() {

  const nav =
    document.querySelector(".nav-links");

  const toggle =
    document.querySelector(".menu-toggle");

  if (nav) {
    nav.classList.remove("open");
  }

  if (toggle) {
    toggle.classList.remove("open");
  }

}


/* ---------------------------------------------------------
   SKY PARALLAX
   --------------------------------------------------------- */

function initializeParallax() {

  const sky =
    document.querySelector(".sky-layer");

  if (!sky) {
    return;
  }

  let ticking = false;

  window.addEventListener("scroll", function () {

    if (ticking) return;

    window.requestAnimationFrame(function () {

      const offset =
        window.scrollY * 0.08;

      sky.style.transform =
        `translate3d(0, ${offset}px, 0)`;

      ticking = false;

    });

    ticking = true;

  });

}