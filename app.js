/*
=========================================================
ESCIE — LIVING SIGNAL
=========================================================

The website observes the visitor's local time and changes
the atmospheric state accordingly.

This is intentionally subtle.
ESCIE should feel alive, not like an animated gimmick.
=========================================================
*/


document.addEventListener("DOMContentLoaded", () => {

  const body = document.body;
  const sky = document.querySelector(".sky-layer");


  /*
  ---------------------------------------------------------
  TIME OF DAY
  ---------------------------------------------------------
  */

  function getTimePhase() {

    const now = new Date();

    const hour = now.getHours();

    if (hour >= 5 && hour < 8) {
      return "dawn";
    }

    if (hour >= 8 && hour < 17) {
      return "day";
    }

    if (hour >= 17 && hour < 20) {
      return "golden-hour";
    }

    if (hour >= 20 && hour < 23) {
      return "dusk";
    }

    return "night";
  }


  /*
  ---------------------------------------------------------
  ATMOSPHERIC STATE
  ---------------------------------------------------------
  */

  function updateAtmosphere() {

    const phase = getTimePhase();

    body.dataset.time = phase;

    /*
      Optional accessibility hook.
      Future versions can use this same state to alter
      imagery, typography, audio or investigation content.
    */

    if (sky) {
      sky.dataset.phase = phase;
    }

  }


  /*
  ---------------------------------------------------------
  INITIAL STATE
  ---------------------------------------------------------
  */

  updateAtmosphere();


  /*
  ---------------------------------------------------------
  CHECK EVERY MINUTE
  ---------------------------------------------------------
  */

  setInterval(() => {

    updateAtmosphere();

  }, 60 * 1000);


  /*
  ---------------------------------------------------------
  SMOOTH SCROLLING
  ---------------------------------------------------------
  */

  document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", event => {

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

    });

  });


  /*
  ---------------------------------------------------------
  MENU
  ---------------------------------------------------------
  */

  const menuButton =
    document.querySelector(".menu-button");

  const navigation =
    document.querySelector(".main-nav");


  if (menuButton && navigation) {

    menuButton.addEventListener("click", () => {

      navigation.classList.toggle("mobile-open");

    });

  }


  /*
  ---------------------------------------------------------
  SUBTLE PARALLAX
  ---------------------------------------------------------
  ---------------------------------------------------------
  Only the atmospheric layer moves.
  The actual content remains stable.
  ---------------------------------------------------------
  */

  let ticking = false;

  window.addEventListener("scroll", () => {

    if (!ticking) {

      window.requestAnimationFrame(() => {

        const scrollY =
          window.scrollY;

        if (sky) {

          sky.style.transform =
            `translateY(${scrollY * 0.035}px)`;

        }

        ticking = false;

      });

      ticking = true;

    }

  });


});