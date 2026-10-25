/*
============================================================
ESCIE — UNIVERSAL RECORD CONTRACT
============================================================

The Universal Record is the common structural language of
everything inside the ESCIE system.

ART
PEOPLE
PLACES
MOMENTS
FRAGMENTS
BODIES
PATHS
INVESTIGATIONS
PROOF

The record is the body.

Relationships are the joints.

Events are the nervous system.

The interface is only one way of seeing the body.

IMPORTANT:

This layer does NOT decide meaning.

It does NOT create canon.

It does NOT invent relationships.

It does NOT classify truth.

It provides structure so those things can be handled
consistently later.
============================================================
*/


const ESCIE_RECORD = {


  /*
  ==========================================================
  RECORD TYPES
  ==========================================================
  */

  TYPES: {

    ART: "art",

    PERSON: "person",

    PLACE: "place",

    MOMENT: "moment",

    FRAGMENT: "fragment",

    BODY: "body",

    PATH: "path",

    INVESTIGATION: "investigation",

    PROOF: "proof"

  },


  /*
  ==========================================================
  DISCLOSURE STATES
  ==========================================================

  These describe whether something is allowed to appear
  publicly.

  They do NOT describe whether something is true.
  ==========================================================
  */

  VISIBILITY: {

    PUBLIC: "public",

    LIMITED: "limited",

    PRIVATE: "private",

    WITHHELD: "withheld"

  },


  /*
  ==========================================================
  ARCHIVE STATES
  ==========================================================
  */

  ARCHIVE_STATES: {

    ACTIVE: "active",

    ARCHIVED: "archived",

    DRAFT: "draft",

    DELETED: "deleted"

  },


  /*
  ==========================================================
  KNOWLEDGE STATES
  ==========================================================

  These are deliberately separate from "truth".

  Something can be known but withheld.

  Something can be unknown but publicly discussed.

  Something can be unresolved without being false.
  ==========================================================
  */

  KNOWLEDGE_STATES: {

    KNOWN: "known",

    UNKNOWN: "unknown",

    WITHHELD: "withheld",

    UNRESOLVED: "unresolved",

    NOT_APPLICABLE: "not_applicable"

  },


  /*
  ==========================================================
  ORIGINS
  ==========================================================
  */

  ORIGINS: {

    LIFE: "life",

    MEMORY: "memory",

    OBSERVATION: "observation",

    DOCUMENTATION: "documentation",

    CONVERSATION: "conversation",

    RESEARCH: "research",

    IMAGINATION: "imagination",

    EXISTING_ART: "existing_art",

    UNKNOWN: "unknown"

  },


  /*
  ==========================================================
  TRANSFORMATIONS
  ==========================================================
  */

  TRANSFORMATIONS: {

    NONE: "none",

    SELECTED: "selected",

    EDITED: "edited",

    COMBINED: "combined",

    RECONSTRUCTED: "reconstructed",

    DRAMATIZED: "dramatized",

    EXAGGERATED: "exaggerated",

    FICTIONALIZED: "fictionalized",

    REIMAGINED: "reimagined"

  },


  /*
  ==========================================================
  CERTAINTY
  ==========================================================
  */

  CERTAINTY: {

    VERIFIED: "verified",

    STRONGLY_SUPPORTED: "strongly_supported",

    CREDIBLE: "credible",

    PLAUSIBLE: "plausible",

    UNCERTAIN: "uncertain",

    DISPUTED: "disputed",

    UNVERIFIED: "unverified",

    UNKNOWN: "unknown"

  },


  /*
  ==========================================================
  CREATE
  ==========================================================

  Creates a predictable Universal Record.

  Existing data can eventually be normalized through this
  function without forcing every old file to be rewritten
  immediately.
  ==========================================================
  */

  create(data = {}) {

    const now = new Date().toISOString();

    return {

      /*
      --------------------------------------------------------
      IDENTITY
      --------------------------------------------------------
      */

      identity: {

        id: data.id || null,

        type: data.type || null,

        title: data.title || "",

        alternate_titles: Array.isArray(data.alternate_titles)
          ? data.alternate_titles
          : [],

        slug: data.slug || null

      },


      /*
      --------------------------------------------------------
      CONTENT
      --------------------------------------------------------
      */

      content: {

        description: data.description || ""

      },


      /*
      --------------------------------------------------------
      DISCLOSURE
      --------------------------------------------------------
      */

      disclosure: {

        visibility:
          data.visibility ||
          ESCIE_RECORD.VISIBILITY.PUBLIC,

        public_disclosure:
          data.public_disclosure !== undefined
            ? data.public_disclosure
            : true

      },


      /*
      --------------------------------------------------------
      ARCHIVE
      --------------------------------------------------------
      */

      archive: {

        state:
          data.archive_state ||
          ESCIE_RECORD.ARCHIVE_STATES.ACTIVE

      },


      /*
      --------------------------------------------------------
      TAXONOMY
      --------------------------------------------------------
      */

      taxonomy: {

        tags: Array.isArray(data.tags)
          ? data.tags
          : [],

        languages: Array.isArray(data.languages)
          ? data.languages
          : []

      },


      /*
      --------------------------------------------------------
      KNOWLEDGE / PROVENANCE
      --------------------------------------------------------
      */

      provenance: {

        knowledge:
          data.knowledge ||
          ESCIE_RECORD.KNOWLEDGE_STATES.UNKNOWN,

        origin:
          data.origin ||
          ESCIE_RECORD.ORIGINS.UNKNOWN,

        transformation:
          data.transformation ||
          ESCIE_RECORD.TRANSFORMATIONS.NONE,

        certainty:
          data.certainty ||
          ESCIE_RECORD.CERTAINTY.UNKNOWN

      },


      /*
      --------------------------------------------------------
      SYSTEM
      --------------------------------------------------------
      */

      system: {

        status: data.status || "active",

        created_at:
          data.created_at ||
          now,

        updated_at:
          data.updated_at ||
          now

      }

    };

  },


  /*
  ==========================================================
  VALIDATE
  ==========================================================

  This is intentionally structural.

  Validation asks:

  "Is this shaped correctly?"

  It does NOT ask:

  "Is this true?"
  ==========================================================
  */

  validate(record) {

    const errors = [];


    if (!record || typeof record !== "object") {

      errors.push("Record must be an object.");

      return {

        valid: false,

        errors

      };

    }


    if (!record.identity) {

      errors.push("Missing identity.");

    }


    if (!record.identity?.id) {

      errors.push("Missing identity.id.");

    }


    if (!record.identity?.type) {

      errors.push("Missing identity.type.");

    }


    if (!record.content) {

      errors.push("Missing content.");

    }


    if (!record.disclosure) {

      errors.push("Missing disclosure.");

    }


    if (!record.archive) {

      errors.push("Missing archive.");

    }


    if (!record.taxonomy) {

      errors.push("Missing taxonomy.");

    }


    if (!record.system) {

      errors.push("Missing system.");

    }

    const validType = Object.values(ESCIE_RECORD.TYPES).includes(record.identity?.type);
    if (record.identity?.type && !validType) {
      errors.push("Invalid identity.type.");
    }

    const validVisibility = Object.values(ESCIE_RECORD.VISIBILITY).includes(record.disclosure?.visibility);
    if (record.disclosure?.visibility && !validVisibility) {
      errors.push("Invalid disclosure.visibility.");
    }

    if (
      record.disclosure &&
      record.disclosure.visibility !== ESCIE_RECORD.VISIBILITY.PUBLIC &&
      record.disclosure.public_disclosure === true
    ) {
      errors.push("Non-public visibility cannot declare public disclosure.");
    }

    const validArchiveState = Object.values(ESCIE_RECORD.ARCHIVE_STATES).includes(record.archive?.state);
    if (record.archive?.state && !validArchiveState) {
      errors.push("Invalid archive.state.");
    }


    return {

      valid: errors.length === 0,

      errors

    };

  },


  /*
  ==========================================================
  NORMALIZE
  ==========================================================

  Converts an existing object into the Universal Record
  structure.

  This is one of the most important functions in the
  architecture because it allows old and new content to
  coexist while the system evolves.
  ==========================================================
  */

  normalize(data = {}) {

    return ESCIE_RECORD.create({

      id:
        data.id ||
        data.identity?.id ||
        null,

      type:
        data.type ||
        data.identity?.type ||
        null,

      title:
        data.title ||
        data.identity?.title ||
        data.name ||
        "",

      alternate_titles:
        data.alternate_titles ||
        data.identity?.alternate_titles ||
        [],

      slug:
        data.slug ||
        data.identity?.slug ||
        null,

      description:
        data.description ||
        data.content?.description ||
        "",

      visibility:
        data.visibility ||
        data.disclosure?.visibility,

      public_disclosure:
        data.public_disclosure !== undefined
          ? data.public_disclosure
          : data.disclosure?.public_disclosure,

      archive_state:
        data.archive_state ||
        data.archive?.state,

      tags:
        data.tags ||
        data.taxonomy?.tags ||
        [],

      languages:
        data.languages ||
        data.taxonomy?.languages ||
        [],

      knowledge:
        data.knowledge ||
        data.provenance?.knowledge,

      origin:
        data.origin ||
        data.provenance?.origin,

      transformation:
        data.transformation ||
        data.provenance?.transformation,

      certainty:
        data.certainty ||
        data.provenance?.certainty,

      status:
        data.status ||
        data.system?.status ||
        "active",

      created_at:
        data.created_at ||
        data.system?.created_at,

      updated_at:
        data.updated_at ||
        data.system?.updated_at

    });

  },


  /*
  ==========================================================
  TYPE CHECK
  ==========================================================
  */

  isType(record, type) {

    if (!record || !type) {

      return false;

    }


    return (

      record.identity?.type === type ||

      record.type === type

    );

  },


  /*
  ==========================================================
  IDENTITY HELPER
  ==========================================================
  */

  getId(record) {

    if (!record) {

      return null;

    }


    return (

      record.identity?.id ||

      record.id ||

      null

    );

  },


  /*
  ==========================================================
  TITLE HELPER
  ==========================================================
  */

  getTitle(record) {

    if (!record) {

      return "";

    }


    return (

      record.identity?.title ||

      record.title ||

      record.name ||

      ""

    );

  },


  /*
  ==========================================================
  PUBLIC CHECK
  ==========================================================
  */

  isPublic(record) {

    if (!record) {

      return false;

    }


    const visibility =

      record.disclosure?.visibility ||

      record.visibility;


    const disclosure =

      record.disclosure?.public_disclosure;


    if (visibility === ESCIE_RECORD.VISIBILITY.PRIVATE) {

      return false;

    }


    if (visibility === ESCIE_RECORD.VISIBILITY.WITHHELD) {

      return false;

    }


    if (disclosure === false) {

      return false;

    }


    return true;

  }

};


/*
============================================================
GLOBAL CONTRACT
============================================================
*/

if (typeof window !== "undefined") {
  window.ESCIE_RECORD = ESCIE_RECORD;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_RECORD;
}