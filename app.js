/*
============================================================
ESCIE — APPLICATION RUNTIME
============================================================

The runtime is the bridge between:

ESCIE DATA
     ↓
UNIVERSAL RECORDS
     ↓
RELATIONSHIPS / THE WEB
     ↓
RUNTIME
     ↓
INTERFACE

The runtime does not create canon.

The runtime does not invent relationships.

The runtime does not decide meaning.

It organizes what already exists and exposes it
consistently to the interface.
============================================================
*/


/*
============================================================
UTILITY
============================================================
*/

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


/*
============================================================
LANGUAGE
============================================================
*/

function speak(key) {

  if (

    window.ESCIE_LANGUAGE &&

    typeof window.ESCIE_LANGUAGE.get === "function"

  ) {

    return window.ESCIE_LANGUAGE.get(key);

  }


  return key;

}


function languagePhrase(value) {

  if (!value) {

    return "";

  }


  if (

    typeof value === "string" &&

    value.startsWith("language:")

  ) {

    return speak(

      value.replace(

        "language:",

        ""

      )

    );

  }


  return value;

}


function enforceESCIELanguage() {

  if (

    window.ESCIE_LANGUAGE &&

    typeof window.ESCIE_LANGUAGE.init === "function"

  ) {

    window.ESCIE_LANGUAGE.init();

  }

}


/*
============================================================
PUBLICATION
============================================================
*/

function isPublished(item) {

  if (!item) {

    return false;

  }


  if (item.published === false) {

    return false;

  }


  if (item.status === "draft") {

    return false;

  }


  if (item.status === "private") {

    return false;

  }


  if (

    window.ESCIE_RECORD &&

    typeof window.ESCIE_RECORD.isPublic === "function"

  ) {

    if (

      item.identity ||

      item.disclosure ||

      item.provenance

    ) {

      return window.ESCIE_RECORD.isPublic(item);

    }

  }


  return true;

}


/*
============================================================
RECORD LAYER
============================================================

Existing data remains untouched.

The runtime normalizes records only when requested.

This allows the site to transition gradually instead of
requiring a destructive migration.
============================================================
*/

function normalizeRecord(record) {

  if (!record) {

    return null;

  }


  if (

    window.ESCIE_RECORD &&

    typeof window.ESCIE_RECORD.normalize === "function"

  ) {

    return window.ESCIE_RECORD.normalize(record);

  }


  return record;

}


function normalizeRecords(records) {

  if (!Array.isArray(records)) {

    return [];

  }


  return records

    .map(normalizeRecord)

    .filter(Boolean);

}


/*
============================================================
RECORD ACCESS
============================================================
*/

function getRecordId(record) {

  if (

    window.ESCIE_RECORD &&

    typeof window.ESCIE_RECORD.getId === "function"

  ) {

    return window.ESCIE_RECORD.getId(record);

  }


  return record?.id || null;

}


function getRecordTitle(record) {

  if (

    window.ESCIE_RECORD &&

    typeof window.ESCIE_RECORD.getTitle === "function"

  ) {

    return window.ESCIE_RECORD.getTitle(record);

  }


  return (

    record?.title ||

    record?.name ||

    ""

  );

}


/*
============================================================
RELATIONSHIP LAYER
============================================================

THE WEB is accessed through the runtime.

The runtime never creates relationships automatically.

The relationship contract lives in relationship.js.

If relationship.js is not yet loaded, the runtime safely
returns empty collections rather than failing.
============================================================
*/

function normalizeRelationship(
  relationship
) {

  if (!relationship) {

    return null;

  }


  if (

    window.ESCIE_RELATIONSHIP &&

    typeof window.ESCIE_RELATIONSHIP.normalize === "function"

  ) {

    return window.ESCIE_RELATIONSHIP.normalize(
      relationship
    );

  }


  return relationship;

}


function normalizeRelationships(
  relationships
) {

  if (!Array.isArray(relationships)) {

    return [];

  }


  return relationships

    .map(normalizeRelationship)

    .filter(Boolean);

}


function getRelationshipId(
  relationship
) {

  if (!relationship) {

    return null;

  }


  return relationship.id || null;

}


function getRelationshipType(
  relationship
) {

  if (!relationship) {

    return null;

  }


  return relationship.type || null;

}


function getRelationshipFrom(
  relationship
) {

  if (!relationship) {

    return null;

  }


  return (

    relationship.from ||

    relationship.source ||

    null

  );

}


function getRelationshipTo(
  relationship
) {

  if (!relationship) {

    return null;

  }


  return (

    relationship.to ||

    relationship.target ||

    null

  );

}


/*
============================================================
RUNTIME
============================================================
*/

window.ESCIE_RUNTIME = {

  /*
  ----------------------------------------------------------
  RECORD
  ----------------------------------------------------------
  */

  record: {

    normalize: normalizeRecord,

    normalizeAll: normalizeRecords,

    getId: getRecordId,

    getTitle: getRecordTitle,

    isPublic: isPublished

  },


  /*
  ----------------------------------------------------------
  RELATIONSHIP
  ----------------------------------------------------------
  */

  relationship: {

    normalize: normalizeRelationship,

    normalizeAll: normalizeRelationships,

    getId: getRelationshipId,

    getType: getRelationshipType,

    getFrom: getRelationshipFrom,

    getTo: getRelationshipTo,

    isCanonical:

      function (relationship) {

        if (

          !window.ESCIE_RELATIONSHIP ||

          typeof window.ESCIE_RELATIONSHIP.isCanonical !==
            "function"

        ) {

          return false;

        }


        return window.ESCIE_RELATIONSHIP.isCanonical(
          relationship
        );

      },


    isPublic:

      function (relationship) {

        if (

          !window.ESCIE_RELATIONSHIP ||

          typeof window.ESCIE_RELATIONSHIP.isPublic !==
            "function"

        ) {

          return false;

        }


        return window.ESCIE_RELATIONSHIP.isPublic(
          relationship
        );

      },


    isProposed:

      function (relationship) {

        if (

          !window.ESCIE_RELATIONSHIP ||

          typeof window.ESCIE_RELATIONSHIP.isProposed !==
            "function"

        ) {

          return false;

        }


        return window.ESCIE_RELATIONSHIP.isProposed(
          relationship
        );

      },


    isInterpretive:

      function (relationship) {

        if (

          !window.ESCIE_RELATIONSHIP ||

          typeof window.ESCIE_RELATIONSHIP.isInterpretive !==
            "function"

        ) {

          return false;

        }


        return window.ESCIE_RELATIONSHIP.isInterpretive(
          relationship
        );

      },


    findById:

      function (
        relationships,
        id
      ) {

        if (

          !window.ESCIE_RELATIONSHIP ||

          typeof window.ESCIE_RELATIONSHIP.findById !==
            "function"

        ) {

          return null;

        }


        return window.ESCIE_RELATIONSHIP.findById(
          relationships,
          id
        );

      },


    findFrom:

      function (
        relationships,
        recordId
      ) {

        if (

          !window.ESCIE_RELATIONSHIP ||

          typeof window.ESCIE_RELATIONSHIP.findFrom !==
            "function"

        ) {

          return [];

        }


        return window.ESCIE_RELATIONSHIP.findFrom(
          relationships,
          recordId
        );

      },


    findTo:

      function (
        relationships,
        recordId
      ) {

        if (

          !window.ESCIE_RELATIONSHIP ||

          typeof window.ESCIE_RELATIONSHIP.findTo !==
            "function"

        ) {

          return [];

        }


        return window.ESCIE_RELATIONSHIP.findTo(
          relationships,
          recordId
        );

      },


    findConnected:

      function (
        relationships,
        recordId
      ) {

        if (

          !window.ESCIE_RELATIONSHIP ||

          typeof window.ESCIE_RELATIONSHIP.findConnected !==
            "function"

        ) {

          return [];

        }


        return window.ESCIE_RELATIONSHIP.findConnected(
          relationships,
          recordId
        );

      },


    findByType:

      function (
        relationships,
        type
      ) {

        if (

          !window.ESCIE_RELATIONSHIP ||

          typeof window.ESCIE_RELATIONSHIP.findByType !==
            "function"

        ) {

          return [];

        }


        return window.ESCIE_RELATIONSHIP.findByType(
          relationships,
          type
        );

      },


    findCanonical:

      function (
        relationships
      ) {

        if (

          !window.ESCIE_RELATIONSHIP ||

          typeof window.ESCIE_RELATIONSHIP.findCanonical !==
            "function"

        ) {

          return [];

        }


        return window.ESCIE_RELATIONSHIP.findCanonical(
          relationships
        );

      },


    findPublic:

      function (
        relationships
      ) {

        if (

          !window.ESCIE_RELATIONSHIP ||

          typeof window.ESCIE_RELATIONSHIP.findPublic !==
            "function"

        ) {

          return [];

        }


        return window.ESCIE_RELATIONSHIP.findPublic(
          relationships
        );

      }

  },


  /*
  ----------------------------------------------------------
  SITE
  ----------------------------------------------------------
  */

  getSite() {

    return window.ESCIE_SITE || {};

  },


  /*
  ----------------------------------------------------------
  NAVIGATION
  ----------------------------------------------------------
  */

  getNavigation() {

    return Array.isArray(
      window.ESCIE_NAVIGATION
    )

      ? [...window.ESCIE_NAVIGATION]

      : [];

  },


  /*
  ----------------------------------------------------------
  MUSIC
  ----------------------------------------------------------
  */

  getMusic() {

    return Array.isArray(
      window.ESCIE_MUSIC
    )

      ? [...window.ESCIE_MUSIC]

      : [];

  },


  /*
  ----------------------------------------------------------
  PROJECTS
  ----------------------------------------------------------
  */

  getProjects() {

    return Array.isArray(
      window.ESCIE_PROJECTS
    )

      ? [...window.ESCIE_PROJECTS]

      : [];

  },


  /*
  ----------------------------------------------------------
  SIGNALS
  ----------------------------------------------------------
  */

  getSignals() {

    return Array.isArray(
      window.ESCIE_SIGNALS
    )

      ? [...window.ESCIE_SIGNALS]

      : [];

  },


  /*
  ----------------------------------------------------------
  ARCHIVE
  ----------------------------------------------------------
  */

  getArchive() {

    return Array.isArray(
      window.ESCIE_ARCHIVE
    )

      ? [...window.ESCIE_ARCHIVE]

      : [];

  },


  /*
  ----------------------------------------------------------
  INVESTIGATION
  ----------------------------------------------------------
  */

  getInvestigation() {

    return Array.isArray(
      window.ESCIE_INVESTIGATION
    )

      ? [...window.ESCIE_INVESTIGATION]

      : [];

  },


  /*
  ----------------------------------------------------------
  PEOPLE
  ----------------------------------------------------------
  */

  getPeople() {

    return Array.isArray(
      window.ESCIE_PEOPLE
    )

      ? [...window.ESCIE_PEOPLE]

      : [];

  },


  /*
  ----------------------------------------------------------
  THE WEB
  ----------------------------------------------------------
  */

  getRelationships() {

    if (
      !Array.isArray(
        window.ESCIE_RELATIONSHIPS
      )
    ) {

      return [];

    }


    return normalizeRelationships(
      window.ESCIE_RELATIONSHIPS
    );

  },


  /*
  ----------------------------------------------------------
  NORMALIZED COLLECTIONS
  ----------------------------------------------------------

  These are intentionally derived views.

  They do not replace the source data.
  ----------------------------------------------------------
  */

  getArtRecords() {

    return normalizeRecords(

      this.getMusic()

    );

  },


  getBodyRecords() {

    return normalizeRecords(

      this.getProjects()

    );

  },


  getInvestigationRecords() {

    return normalizeRecords(

      this.getInvestigation()

    );

  },


  getArchiveRecords() {

    return normalizeRecords(

      this.getArchive()

    );

  },


  getFragmentRecords() {

    return normalizeRecords(

      this.getSignals()

    );

  },


  /*
  ----------------------------------------------------------
  DERIVED WEB VIEWS
  ----------------------------------------------------------
  */

  getPublicRelationships() {

    return this.relationship.findPublic(
      this.getRelationships()
    );

  },


  getCanonicalRelationships() {

    return this.relationship.findCanonical(
      this.getRelationships()
    );

  },


  getRelationshipsForRecord(
    recordId
  ) {

    return this.relationship.findConnected(
      this.getRelationships(),
      recordId
    );

  },


  getPublicRelationshipsForRecord(
    recordId
  ) {

    return this.relationship.findPublic(
      this.getRelationshipsForRecord(
        recordId
      )
    );

  }

};


/*
============================================================
NAVIGATION
============================================================
*/

function renderNavigation() {

  const navigation =

    window.ESCIE_RUNTIME.getNavigation();


  const containers =

    document.querySelectorAll(

      "[data-escie-navigation]"

    );


  if (!containers.length) {

    return;

  }


  navigation

    .filter(
      item => item.visible !== false
    )

    .sort(

      (a, b) =>

        (a.order || 0) -

        (b.order || 0)

    )

    .forEach(item => {

      containers.forEach(container => {

        const link =

          document.createElement("a");


        link.href =
          item.target || "#";


        link.textContent =

          languagePhrase(
            item.label || item.id
          );


        link.dataset.navigationId =
          item.id || "";


        link.className =
          "escie-navigation-link";


        container.appendChild(link);

      });

    });

}


/*
============================================================
NAVIGATION INTERACTION
============================================================
*/

function initializeNavigation() {

  document.addEventListener(

    "click",

    event => {

      const link =

        event.target.closest(

          ".escie-navigation-link"

        );


      if (!link) {

        return;

      }


      const target =

        link.getAttribute("href");


      if (

        !target ||

        !target.startsWith("#")

      ) {

        return;

      }


      const destination =

        document.querySelector(target);


      if (!destination) {

        return;

      }


      event.preventDefault();


      destination.scrollIntoView({

        behavior: "smooth",

        block: "start"

      });


      history.replaceState(

        null,

        "",

        target

      );

    }

  );

}


/*
============================================================
MUSIC
============================================================
*/

function renderMusic() {

  const container =

    byId("music-container");


  if (!container) {

    return;

  }


  const music =

    window.ESCIE_RUNTIME

      .getMusic()

      .filter(isPublished);


  if (!music.length) {

    container.innerHTML = "";

    return;

  }


  container.innerHTML =

    music

      .map(track => {

        return `

          <article

            class="music-card"

            data-record-type="art"

            data-record-id="${escapeHTML(

              getRecordId(track)

            )}"

          >

            <div class="music-card-title">

              ${escapeHTML(

                getRecordTitle(track)

              )}

            </div>

          </