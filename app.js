/*
  ============================================================
  ESCIE SITE ENGINE
  ============================================================

  The interface is modular.
  The content is data-driven.
  The language layer is permanent.

  This engine is intentionally presentation-focused.

  Canonical data, relationships, history, automation and
  intelligence will be introduced through separate layers
  rather than being embedded inside individual renderers.
*/


/* =========================================================
   CORE UTILITIES
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


/* =========================================================
   LANGUAGE
========================================================= */

function speak(text) {

  if (
    window.ESCIE_LANGUAGE_ENGINE &&
    typeof window.ESCIE_LANGUAGE_ENGINE.speak === "function"
  ) {
    return window.ESCIE_LANGUAGE_ENGINE.speak(text);
  }

  return text;
}


function languagePhrase(key, fallback = "") {

  if (
    window.ESCIE_LANGUAGE_ENGINE &&
    typeof window.ESCIE_LANGUAGE_ENGINE.phrase === "function"
  ) {
    return window.ESCIE_LANGUAGE_ENGINE.phrase(
      key,
      fallback
    );
  }

  return fallback;
}


function enforceESCIELanguage() {

  if (
    window.ESCIE_LANGUAGE_ENGINE &&
    typeof window.ESCIE_LANGUAGE_ENGINE.enforceInterface === "function"
  ) {
    window.ESCIE_LANGUAGE_ENGINE.enforceInterface();
  }

}


/* =========================================================
   PUBLICATION
========================================================= */

function isPublished(item) {

  return (
    item &&
    item.published === true &&
    item.status !== "hidden"
  );

}


/* =========================================================
   ESCIE RUNTIME
========================================================= */

/*
  The runtime is the first layer between the interface and
  the deeper ESCIE system.

  For now it exposes the existing data safely.

  Later this becomes the bridge to:

  RECORDS
  RELATIONSHIPS
  EVENTS
  HISTORY
  BRAIN
  CONTROL
  SIGNAL ENGINE
  GLASS EYE
*/

window.ESCIE_RUNTIME = {

  version: "0.1.0",

  getData(name, fallback = []) {

    if (
      Object.prototype.hasOwnProperty.call(
        window,
        name
      )
    ) {
      return window[name];
    }

    return fallback;

  },

  getSite() {

    return this.getData(
      "ESCIE_SITE",
      null
    );

  },

  getNavigation() {

    return this.getData(
      "ESCIE_NAVIGATION",
      []
    );

  },

  getMusic() {

    return this.getData(
      "ESCIE_MUSIC",
      []
    );

  },

  getProjects() {

    return this.getData(
      "ESCIE_PROJECTS",
      []
    );

  },

  getSignals() {

    return this.getData(
      "ESCIE_SIGNALS",
      []
    );

  },

  getArchive() {

    return this.getData(
      "ESCIE_ARCHIVE",
      []
    );

  },

  getInvestigation() {

    return this.getData(
      "ESCIE_INVESTIGATION",
      []
    );

  }

};


/* =========================================================
   SITE
========================================================= */

function initializeSite() {

  renderNavigation();

  renderMusic();

  renderBAM();

  renderInvestigation();

  renderArchive();

  renderSignals();

  renderAbout();

  /*
    The final interface pass happens AFTER all dynamic
    content has been rendered.

    This makes ESCIE orthography universal.
  */

  enforceESCIELanguage();

}


/* =========================================================
   NAVIGATION
========================================================= */

function renderNavigation() {

  const navigation = byId(
    "main-navigation"
  );

  if (!navigation) {
    return;
  }


  const items =
    window.ESCIE_RUNTIME.getNavigation();


  navigation.innerHTML = "";


  items
    .filter(
      item => item.visible !== false
    )
    .forEach(item => {

      const link =
        document.createElement("a");


      link.href =
        item.target || "#top";


      link.dataset.target =
        item.target || "#top";


      link.textContent =
        speak(item.label || "");


      navigation.appendChild(link);

    });

}


function initializeNavigation() {

  const trigger =
    byId("mobile-menu-button");

  const navigation =
    byId("main-navigation");


  if (!trigger || !navigation) {
    return;
  }


  function openIndex() {

    navigation.classList.add(
      "is-open"
    );

    document.body.classList.add(
      "menu-open"
    );


    trigger.setAttribute(
      "aria-expanded",
      "true"
    );


    trigger.setAttribute(
      "aria-label",
      speak("Close index")
    );

  }


  function closeIndex() {

    navigation.classList.remove(
      "is-open"
    );

    document.body.classList.remove(
      "menu-open"
    );


    trigger.setAttribute(
      "aria-expanded",
      "false"
    );


    trigger.setAttribute(
      "aria-label",
      speak("Open index")
    );

  }


  function toggleIndex() {

    if (
      navigation.classList.contains(
        "is-open"
      )
    ) {

      closeIndex();

    } else {

      openIndex();

    }

  }


  trigger.addEventListener(
    "click",
    toggleIndex
  );


  navigation.addEventListener(
    "click",
    event => {

      const link =
        event.target.closest("a");


      if (!link) {
        return;
      }


      const target =
        link.dataset.target;


      if (!target) {
        return;
      }


      event.preventDefault();

      closeIndex();


      setTimeout(() => {

        const section =
          document.querySelector(target);


        if (section) {

          section.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }

      }, 80);

    }
  );


  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {
        closeIndex();
      }

    }
  );

}


/* =========================================================
   MUSIC
========================================================= */

function renderMusic() {

  const container =
    byId("music-container");


  if (!container) {
    return;
  }


  container.innerHTML = "";


  const publishedMusic =
    window.ESCIE_RUNTIME
      .getMusic()
      .filter(isPublished);


  if (!publishedMusic.length) {

    container.innerHTML = `
      <div class="empty-state">
        <span>${escapeHTML(
          speak(
            languagePhrase(
              "unavailable",
              ""
            )
          )
        )}</span>
      </div>
    `;

    return;

  }


  publishedMusic.forEach(
    track => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "music-card";


      card.innerHTML = `

        <div class="music-card-number">
          ${escapeHTML(
            track.number || ""
          )}
        </div>

        <h3>
          ${escapeHTML(
            speak(track.title || "")
          )}
        </h3>

        <p>
          ${escapeHTML(
            speak(track.subtitle || "")
          )}
        </p>

      `;


      container.appendChild(card);

    }
  );

}


/* =========================================================
   BAM
========================================================= */

function renderBAM() {

  const container =
    byId("bam-container");


  if (!container) {
    return;
  }


  container.innerHTML = "";


  const project =
    window.ESCIE_RUNTIME
      .getProjects()
      .find(
        item =>
          item.id ===
          "bam-by-any-means"
      );


  if (
    !project ||
    !isPublished(project)
  ) {

    container.innerHTML = `
      <div class="empty-state">
        <span>${escapeHTML(
          speak(
            languagePhrase(
              "hidden",
              ""
            )
          )
        )}</span>
      </div>
    `;

    return;

  }


  const structure =
    project.structure || [];


  container.innerHTML = `

    <div class="project-introduction">

      <p class="project-description">
        ${escapeHTML(
          speak(
            project.description || ""
          )
        )}
      </p>


      <div class="project-structure">

        ${structure
          .map(
            (part, index) => `

              <div class="project-part">

                <span class="project-part-number">
                  ${String(
                    index + 1
                  ).padStart(3, "0")}
                </span>

                <span class="project-part-title">
                  ${escapeHTML(
                    speak(part)
                  )}
                </span>

              </div>

            `
          )
          .join("")}

      </div>

    </div>

  `;

}


/* =========================================================
   INVESTIGATION
========================================================= */

function renderInvestigation() {

  const container =
    byId(
      "investigation-container"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  const cases =
    window.ESCIE_RUNTIME
      .getInvestigation()
      .filter(isPublished);


  if (!cases.length) {

    container.innerHTML = `
      <div class="empty-state">
        <span>${escapeHTML(
          speak(
            languagePhrase(
              "investigation",
              ""
            )
          )
        )}</span>
      </div>
    `;

    return;

  }


  cases.forEach(
    caseFile => {

      const article =
        document.createElement(
          "article"
        );


      article.className =
        "investigation-case";


      article.innerHTML = `

        <span class="case-number">
          ${escapeHTML(
            speak(
              caseFile.caseNumber || ""
            )
          )}
        </span>

        <h3>
          ${escapeHTML(
            speak(
              caseFile.title || ""
            )
          )}
        </h3>

        <p class="case-question">
          ${escapeHTML(
            speak(
              caseFile.question || ""
            )
          )}
        </p>

        <div class="case-secondary">

          ${(caseFile.secondaryQuestions || [])
            .map(
              question => `
                <span>
                  ${escapeHTML(
                    speak(question)
                  )}
                </span>
              `
            )
            .join("")}

        </div>

      `;


      container.appendChild(
        article
      );

    }
  );

}


/* =========================================================
   ARCHIVE
========================================================= */

function renderArchive() {

  const container =
    byId("archive-container");


  if (!container) {
    return;
  }


  container.innerHTML = "";


  const entries =
    window.ESCIE_RUNTIME
      .getArchive()
      .filter(isPublished);


  if (!entries.length) {

    container.innerHTML = `
      <div class="empty-state">
        <span>${escapeHTML(
          speak(
            languagePhrase(
              "archived",
              ""
            )
          )
        )}</span>
      </div>
    `;

    return;

  }


  entries.forEach(
    entry => {

      const article =
        document.createElement(
          "article"
        );


      article.className =
        "archive-entry";


      article.innerHTML = `

        <span class="archive-type">
          ${escapeHTML(
            speak(
              entry.type || ""
            )
          )}
        </span>

        <h3>
          ${escapeHTML(
            speak(
              entry.title || ""
            )
          )}
        </h3>

        <p>
          ${escapeHTML(
            speak(
              entry.description || ""
            )
          )}
        </p>

      `;


      container.appendChild(
        article
      );

    }
  );

}


/* =========================================================
   SIGNAL
========================================================= */

function renderSignals() {

  const container =
    byId("signal-container");


  if (!container) {
    return;
  }


  container.innerHTML = "";


  const signals =
    window.ESCIE_RUNTIME
      .getSignals()
      .filter(
        signal =>
          signal.active !== false
      );


  signals.forEach(
    signal => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "signal-card";


      let media = "";


      if (
        signal.embed &&
        signal.embed.enabled === true &&
        signal.embed.source
      ) {


        if (
          signal.embed.type ===
          "youtube"
        ) {

          media = `
            <div class="signal-embed">

              <iframe
                src="https://www.youtube.com/embed/${encodeURIComponent(
                  signal.embed.source
                )}?playsinline=1"
                title="${escapeHTML(
                  speak(
                    signal.name
                  )
                )}"
                frameborder="0"
                allowfullscreen>
              </iframe>

            </div>
          `;

        }


        if (
          signal.embed.type ===
          "soundcloud"
        ) {

          media = `
            <div class="signal-embed">

              <iframe
                src="https://w.soundcloud.com/player/?url=${encodeURIComponent(
                  signal.embed.source
                )}"
                title="${escapeHTML(
                  speak(
                    signal.name
                  )
                )}"
                frameborder="0"
                allow="autoplay">
              </iframe>

            </div>
          `;

        }

      }


      if (!media) {

        media = `
          <div class="signal-placeholder">

            <span>
              ${escapeHTML(
                speak(
                  languagePhrase(
                    "transmission",
                    ""
                  )
                )
              )}
            </span>

          </div>
        `;

      }


      card.innerHTML = `

        <div class="signal-header">

          <span class="signal-name">
            ${escapeHTML(
              speak(
                signal.name || ""
              )
            )}
          </span>

          <span class="signal-type">
            ${escapeHTML(
              speak(
                signal.type || ""
              )
            )}
          </span>

        </div>

        ${media}

        <p class="signal-description">
          ${escapeHTML(
            speak(
              signal.description || ""
            )
          )}
        </p>

      `;


      container.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   ABOUT / ESCIE
========================================================= */

function renderAbout() {

  const container =
    byId("about-container");


  if (!container) {
    return;
  }


  const site =
    window.ESCIE_RUNTIME.getSite();


  if (!site) {
    return;
  }


  container.innerHTML = `

    <p class="about-location">
      ${escapeHTML(
        speak(
          site.location || ""
        )
      )}
    </p>

    <p class="about-tagline">
      ${escapeHTML(
        speak(
          site.tagline || ""
        )
      )}
    </p>

    <p class="about-philosophy">
      ${escapeHTML(
        speak(
          site.philosophy || ""
        )
      )}
    </p>

  `;

}


/* =========================================================
   TIME
========================================================= */

function initializeTimeSystem() {

  function updateTimeState() {

    const hour =
      new Date().getHours();


    let state = "night";


    if (
      hour >= 5 &&
      hour < 8
    ) {

      state = "dawn";

    }

    else if (
      hour >= 8 &&
      hour < 16
    ) {

      state = "day";

    }

    else if (
      hour >= 16 &&
      hour < 19
    ) {

      state = "golden";

    }

    else if (
      hour >= 19 &&
      hour < 22
    ) {

      state = "dusk";

    }


    document.body.dataset.time =
      state;

  }


  updateTimeState();


  setInterval(
    updateTimeState,
    60000
  );

}


/* =========================================================
   PARALLAX
========================================================= */

function initializeParallax() {

  if (
    window.matchMedia &&
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {

    return;

  }


  const sky =
    document.querySelector(
      ".sky"
    );


  if (!sky) {
    return;
  }


  window.addEventListener(
    "scroll",
    () => {

      const offset =
        window.scrollY * 0.08;


      sky.style.transform =
        `translate3d(0, ${offset}px, 0)`;

    },
    {
      passive: true
    }
  );

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeSite();

    initializeTimeSystem();

    initializeNavigation();

    initializeParallax();

  }
);