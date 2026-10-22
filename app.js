/*
  =========================================================
  ESCIE — APPLICATION ENGINE
  =========================================================

  The site is content-driven.

  DATA
    ↓
  NARRATIVE
    ↓
  CC ORTHOGRAPHY
    ↓
  INTERFACE

  The interface never explains itself.
*/


/* =========================================================
   CORE HELPERS
   ========================================================= */

function byId(id) {
  return document.getElementById(id);
}


function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {
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

  return (
    item &&
    item.published === true
  );
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
   INDEX / NAVIGATION
   ========================================================= */

function renderNavigation() {

  const navigation =
    byId("main-navigation");

  if (
    !navigation ||
    !window.ESCIE_NAVIGATION
  ) {
    return;
  }

  const visibleItems =
    ESCIE_NAVIGATION.filter(
      item => item.visible !== false
    );


  navigation.innerHTML =
    visibleItems
      .map(item => `

        <a
          href="${escapeHTML(item.target)}"
          class="nav-link"
          data-target="${escapeHTML(item.target)}"
        >
          ${escapeHTML(
            speak(item.label)
          )}
        </a>

      `)
      .join("");

}


function initializeNavigation() {

  const navigation =
    byId("main-navigation");

  const trigger =
    byId("mobile-menu-button");

  if (
    !navigation ||
    !trigger
  ) {
    return;
  }


  /* -----------------------------------------
     OPEN / CLOSE
     ----------------------------------------- */

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
      "Close index"
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
      "Open index"
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


  /* -----------------------------------------
     INDEX BUTTON
     ----------------------------------------- */

  trigger.addEventListener(
    "click",
    toggleIndex
  );


  /* -----------------------------------------
     NAVIGATION LINKS
     ----------------------------------------- */

  navigation.addEventListener(
    "click",
    event => {

      const link =
        event.target.closest(
          "a[href^='#']"
        );

      if (!link) {
        return;
      }

      const targetId =
        link.getAttribute(
          "href"
        );

      const target =
        document.querySelector(
          targetId
        );

      if (!target) {
        return;
      }

      event.preventDefault();

      closeIndex();

      setTimeout(
        () => {

          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        },
        100
      );

    }
  );


  /* -----------------------------------------
     ESC KEY
     ----------------------------------------- */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        navigation.classList.contains(
          "is-open"
        )
      ) {

        closeIndex();

      }

    }
  );


  /* -----------------------------------------
     CLICK OUTSIDE NAV CONTENT
     ----------------------------------------- */

  navigation.addEventListener(
    "click",
    event => {

      if (
        event.target === navigation
      ) {

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

  if (
    !container ||
    !window.ESCIE_MUSIC
  ) {
    return;
  }


  const publishedMusic =
    ESCIE_MUSIC.filter(
      isPublished
    );


  if (
    !publishedMusic.length
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <p>
          ${escapeHTML