/*
  ESCIE — APPLICATION ENGINE

  Content is separate from presentation.
  Language is separate from content.
  The CC orthography is applied through
  ESCIE_LANGUAGE_ENGINE before interface text
  reaches the visitor.
*/


/* =========================================================
   CORE HELPERS
   ========================================================= */

function byId(id) {
  return document.getElementById(id);
}


function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function speak(text) {
  if (
    window.ESCIE_LANGUAGE_ENGINE &&
    typeof window.ESCIE_LANGUAGE_ENGINE.speak === "function"
  ) {
    return window.ESCIE_LANGUAGE_ENGINE.speak(text);
  }

  return text;
}


function isPublished(item) {
  return item && item.published === true;
}


/* =========================================================
   SITE INITIALIZATION
   ========================================================= */

function initializeSite() {
  renderNavigation();
  renderMusic();
  renderBAM();
  renderInvestigation();
  renderArchive();
  renderSignals();
  renderAbout();
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function renderNavigation() {
  const navigation = byId("main-navigation");

  if (!navigation || !window.ESCIE_NAVIGATION) {
    return;
  }

  const visibleItems = ESCIE_NAVIGATION.filter(
    item => item.visible !== false
  );

  navigation.innerHTML = visibleItems
    .map(item => `
      <a
        href="${escapeHTML(item.target)}"
        class="nav-link"
        data-target="${escapeHTML(item.target)}"
      >
        ${escapeHTML(speak(item.label))}
      </a>
    `)
    .join("");
}


function initializeNavigation() {
  document.addEventListener("click", event => {

    const link = event.target.closest(
      'a[href^="#"]'
    );

    if (!link) {
      return;
    }

    const targetId = link.getAttribute("href");

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}


/* =========================================================
   MUSIC
   ========================================================= */

function renderMusic() {
  const container = byId("music-container");

  if (!container || !window.ESCIE_MUSIC) {
    return;
  }

  const publishedMusic = ESCIE_MUSIC.filter(isPublished);

  if (!publishedMusic.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>${escapeHTML(
          speak("THE RECORD HAS NOT BEEN OPENED.")
        )}</p>
      </div>
    `;

    return;
  }

  container.innerHTML = publishedMusic
    .map(track => {

      const title = speak(track.title);
      const section = speak(track.section || "");
      const description = speak(track.description || "");

      return `
        <article class="music-card">

          <div class="music-card-index">
            ${escapeHTML(
              speak(track.id || "")
            )}
          </div>

          <div class="music-card-content">

            <p class="music-card-section">
              ${escapeHTML(section)}
            </p>

            <h3>
              ${escapeHTML(title)}
            </h3>

            ${
              description
                ? `<p>${escapeHTML(description)}</p>`
                : ""
            }

          </div>

        </article>
      `;
    })
    .join("");
}


/* =========================================================
   BAM
   ========================================================= */

function renderBAM() {
  const container = byId("bam-container");

  if (!container || !window.ESCIE_PROJECTS) {
    return;
  }

  const project = ESCIE_PROJECTS.find(
    item => item.id === "bam-by-any-means"
  );

  if (!project || !isPublished(project)) {

    container.innerHTML = `
      <div class="empty-state">

        <p>
          ${escapeHTML(
            speak("THE TRANSMISSION HAS NOT BEEN OPENED.")
          )}
        </p>

      </div>
    `;

    return;
  }

  container.innerHTML = `
    <article class="bam-project">

      <p class="eyebrow">
        ${escapeHTML(speak("CURRENT TRANSMISSION"))}
      </p>

      <h2>
        ${escapeHTML(speak(project.title))}
      </h2>

      <p>
        ${escapeHTML(
          speak(project.description || "")
        )}
      </p>

      ${
        Array.isArray(project.structure)
          ? `
            <div class="bam-structure">
              ${project.structure
                .map((item, index) => `
                  <div class="bam-part">

                    <span>
                      ${String(index + 1).padStart(3, "0")}
                    </span>

                    <strong>
                      ${escapeHTML(speak(item))}
                    </strong>

                  </div>
                `)
                .join("")}
            </div>
          `
          : ""
      }

    </article>
  `;
}


/* =========================================================
   INVESTIGATION
   ========================================================= */

function renderInvestigation() {
  const container = byId("investigation-container");

  if (!container || !window.ESCIE_INVESTIGATION) {
    return;
  }

  const publishedCases =
    ESCIE_INVESTIGATION.filter(isPublished);

  if (!publishedCases.length) {

    container.innerHTML = `
      <div class="empty-state">

        <p>
          ${escapeHTML(
            speak("THE QUESTION REMAINS OPEN.")
          )}
        </p>

      </div>
    `;

    return;
  }

  container.innerHTML = publishedCases
    .map(caseFile => `

      <article class="investigation-case">

        <p class="eyebrow">
          ${escapeHTML(
            speak(
              `CASE ${caseFile.caseNumber || ""}`
            )
          )}
        </p>

        <h3>
          ${escapeHTML(
            speak(caseFile.title || "")
          )}
        </h3>

        ${
          caseFile.question
            ? `
              <p class="investigation-question">
                ${escapeHTML(
                  speak(caseFile.question)
                )}
              </p>
            `
            : ""
        }

        ${
          Array.isArray(caseFile.secondaryQuestions)
            ? `
              <div class="investigation-secondary">
                ${caseFile.secondaryQuestions
                  .map(question => `
                    <p>
                      ${escapeHTML(
                        speak(question)
                      )}
                    </p>
                  `)
                  .join("")}
              </div>
            `
            : ""
        }

      </article>

    `)
    .join("");
}


/* =========================================================
   ARCHIVE
   ========================================================= */

function renderArchive() {
  const container = byId("archive-container");

  if (!container || !window.ESCIE_ARCHIVE) {
    return;
  }

  const publishedEntries =
    ESCIE_ARCHIVE.filter(isPublished);

  if (!publishedEntries.length) {

    container.innerHTML = `
      <div class="empty-state">

        <p>
          ${escapeHTML(
            speak("SOME THINGS WERE LEFT BEHIND.")
          )}
        </p>

      </div>
    `;

    return;
  }

  container.innerHTML = publishedEntries
    .map(entry => `

      <article class="archive-entry">

        ${
          entry.date
            ? `
              <time>
                ${escapeHTML(
                  speak(entry.date)
                )}
              </time>
            `
            : ""
        }

        <h3>
          ${escapeHTML(
            speak(entry.title || "")
          )}
        </h3>

        ${
          entry.description
            ? `
              <p>
                ${escapeHTML(
                  speak(entry.description)
                )}
              </p>
            `
            : ""
        }

      </article>

    `)
    .join("");
}


/* =========================================================
   SIGNAL
   ========================================================= */

function renderSignals() {
  const container = byId("signal-container");

  if (!container || !window.ESCIE_SIGNALS) {
    return;
  }

  const activeSignals =
    ESCIE_SIGNALS.filter(
      signal => signal.active !== false
    );

  container.innerHTML = activeSignals
    .map(signal => {

      const profileUrl =
        signal.profileUrl || "#";

      let embedHTML = "";

      if (
        signal.embed &&
        signal.embed.enabled === true
      ) {

        if (
          signal.embed.type === "youtube" &&
          signal.embed.source
        ) {

          embedHTML = `
            <div class="signal-embed">
              <iframe
                src="https://www.youtube.com/embed/${encodeURIComponent(
                  signal.embed.source
                )}?playsinline=1"
                title="${escapeHTML(
                  speak(signal.name)
                )}"
                frameborder="0"
                allowfullscreen>
              </iframe>
            </div>
          `;

        } else if (
          signal.embed.type === "soundcloud" &&
          signal.embed.source
        ) {

          embedHTML = `
            <div class="signal-embed">
              <iframe
                src="https://w.soundcloud.com/player/?url=${encodeURIComponent(
                  signal.embed.source
                )}"
                title="${escapeHTML(
                  speak(signal.name)
                )}"
                frameborder="0"
                allow="autoplay">
              </iframe>
            </div>
          `;
        }

      }

      return `

        <article class="signal-card">

          <div class="signal-card-header">

            <span class="signal-type">
              ${escapeHTML(
                speak(signal.type || "signal")
              )}
            </span>

            <h3>
              ${escapeHTML(
                speak(signal.name || "")
              )}
            </h3>

          </div>

          ${
            signal.description
              ? `
                <p>
                  ${escapeHTML(
                    speak(signal.description)
                  )}
                </p>
              `
              : ""
          }

          ${embedHTML}

          <a
            href="${escapeHTML(profileUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="signal-link"
          >
            ${escapeHTML(
              speak("OPEN TRANSMISSION")
            )}
          </a>

        </article>

      `;
    })
    .join("");
}


/* =========================================================
   ABOUT
   ========================================================= */

function renderAbout() {
  const container = byId("about-container");

  if (!container || !window.ESCIE_SITE) {
    return;
  }

  container.innerHTML = `

    <p class="about-location">
      ${escapeHTML(
        speak(ESCIE_SITE.location || "")
      )}
    </p>

    <p class="about-tagline">
      ${escapeHTML(
        speak(ESCIE_SITE.tagline || "")
      )}
    </p>

    <p class="about-philosophy">
      ${escapeHTML(
        speak(ESCIE_SITE.philosophy || "")
      )}
    </p>

  `;
}


/* =========================================================
   TIME SYSTEM
   ========================================================= */

function initializeTimeSystem() {

  function updateTimeState() {

    const hour = new Date().getHours();

    let state = "night";

    if (hour >= 5 && hour < 8) {
      state = "dawn";
    } else if (hour >= 8 && hour < 16) {
      state = "day";
    } else if (hour >= 16 && hour < 19) {
      state = "golden";
    } else if (hour >= 19 && hour < 22) {
      state = "dusk";
    }

    document.body.dataset.time = state;
  }

  updateTimeState();

  setInterval(
    updateTimeState,
    60000
  );
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initializeMobileMenu() {

  const menuButton =
    byId("mobile-menu-button");

  const navigation =
    byId("main-navigation");

  if (!menuButton || !navigation) {
    return;
  }

  menuButton.addEventListener(
    "click",
    () => {

      navigation.classList.toggle(
        "is-open"
      );

      menuButton.classList.toggle(
        "is-open"
      );

    }
  );

}


/* =========================================================
   PARALLAX / SKY
   ========================================================= */

function initializeParallax() {

  const sky =
    document.querySelector(".sky");

  if (!sky) {
    return;
  }

  window.addEventListener(
    "scroll",
    () => {

      const offset =
        window.scrollY * 0.12;

      sky.style.transform =
        `translateY(${offset}px)`;

    },
    { passive: true }
  );

}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeSite();

    initializeTimeSystem();

    initializeNavigation();

    initializeMobileMenu();

    initializeParallax();

  }
);