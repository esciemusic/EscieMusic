/*
  ESCIE
  Reality With The Signal Distorted
  2027 Site Foundation
*/


/* ================================
   LIVING TIME / SKY
================================ */

function updateTimeAtmosphere() {

  const now = new Date();

  const hour = now.getHours();
  const minutes = now.getMinutes();

  const time = hour + minutes / 60;

  let phase = "night";

  if (time >= 5 && time < 8) {
    phase = "dawn";
  }

  else if (time >= 8 && time < 17) {
    phase = "day";
  }

  else if (time >= 17 && time < 19) {
    phase = "golden";
  }

  else if (time >= 19 && time < 21) {
    phase = "dusk";
  }

  else {
    phase = "night";
  }

  document.body.dataset.time = phase;

  const sky = document.querySelector(".sky");

  if (sky) {
    sky.dataset.phase = phase;
  }
}


/* Run immediately */

updateTimeAtmosphere();


/* Update every minute */

setInterval(
  updateTimeAtmosphere,
  60000
);


/* ================================
   SMOOTH NAVIGATION
================================ */

document.querySelectorAll(
  'a[href^="#"]'
).forEach(link => {

  link.addEventListener(
    "click",
    event => {

      const targetId =
        link.getAttribute("href");

      const target =
        document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });


      /* Close mobile navigation */

      const nav =
        document.getElementById("mainNav");

      const toggle =
        document.getElementById("menuToggle");

      if (nav) {
        nav.classList.remove("mobile-open");
      }

      if (toggle) {
        toggle.setAttribute(
          "aria-expanded",
          "false"
        );
      }

    }
  );

});


/* ================================
   MOBILE MENU
================================ */

const menuToggle =
  document.getElementById("menuToggle");

const mainNav =
  document.getElementById("mainNav");


if (menuToggle && mainNav) {

  menuToggle.addEventListener(
    "click",
    () => {

      const open =
        mainNav.classList.toggle(
          "mobile-open"
        );

      menuToggle.setAttribute(
        "aria-expanded",
        open ? "true" : "false"
      );

    }
  );

}


/* ================================
   SUBTLE SKY MOVEMENT
================================ */

let lastScrollY = 0;

window.addEventListener(
  "scroll",
  () => {

    const sky =
      document.querySelector(".sky");

    if (!sky) {
      return;
    }

    const currentScroll =
      window.scrollY;

    const movement =
      currentScroll * 0.025;

    sky.style.transform =
      `translateY(${movement}px)`;

    lastScrollY =
      currentScroll;

  },
  {
    passive: true
  }
);


/* ================================
   EMBED SYSTEM
================================ */

/*
  Future media can be added here.

  YouTube:
  Add a YouTube video ID.

  SoundCloud:
  Add the complete SoundCloud URL.

  We are deliberately keeping the content
  separate from the site's structure so that
  future automation can update these values.
*/


const ESCIE_MEDIA = {

  youtube: {
    active: false,

    videoId: "",

    title: "Current Transmission"
  },


  soundcloud: {
    active: false,

    url: "",

    title: "Current Audio Transmission"
  }

};


/* ================================
   YOUTUBE EMBED
================================ */

function createYouTubeEmbed() {

  if (!ESCIE_MEDIA.youtube.active) {
    return;
  }

  if (!ESCIE_MEDIA.youtube.videoId) {
    return;
  }

  const placeholder =
    document.querySelector(
      ".youtube-placeholder"
    );

  if (!placeholder) {
    return;
  }

  const frame =
    document.createElement("div");

  frame.className =
    "embed-frame youtube-frame";

  frame.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${ESCIE_MEDIA.youtube.videoId}?playsinline=1"
      title="${ESCIE_MEDIA.youtube.title}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
    </iframe>
  `;

  placeholder.replaceWith(frame);
}


/* ================================
   SOUNDCLOUD EMBED
================================ */

function createSoundCloudEmbed() {

  if (!ESCIE_MEDIA.soundcloud.active) {
    return;
  }

  if (!ESCIE_MEDIA.soundcloud.url) {
    return;
  }

  const placeholder =
    document.querySelector(
      ".soundcloud-placeholder"
    );

  if (!placeholder) {
    return;
  }

  const frame =
    document.createElement("div");

  frame.className =
    "embed-frame soundcloud-frame";

  const encodedUrl =
    encodeURIComponent(
      ESCIE_MEDIA.soundcloud.url
    );

  frame.innerHTML = `
    <iframe
      scrolling="no"
      frameborder="no"
      allow="autoplay"
      src="https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23243b55&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false">
    </iframe>
  `;

  placeholder.replaceWith(frame);
}


/* Initialize embeds */

createYouTubeEmbed();
createSoundCloudEmbed();