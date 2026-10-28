/*
 * ESCIE — THE WEB
 * Universal Relationship Contract
 *
 * A relationship is an explicit connection between two records.
 *
 * IMPORTANT:
 * - Correlation is not a relationship.
 * - Interpretation is not a relationship.
 * - A suggested connection is not canon.
 * - Relationships never silently become facts.
 * - Unresolved is a state, not a relationship type.
 *
 * Core model:
 *
 * A → RELATIONSHIP → B
 *
 * The Web is the connective tissue of the ESCIE world.
 */

(function () {
  "use strict";

  const ESCIE_RELATIONSHIP = {

    VERSION: "1.0.0",

    /*
     * ---------------------------------------------------------
     * RELATIONSHIP STATUS
     * ---------------------------------------------------------
     */

    STATUS: Object.freeze({
      ACTIVE: "active",
      INACTIVE: "inactive",
      PROPOSED: "proposed",
      DISPUTED: "disputed",
      WITHHELD: "withheld",
      ARCHIVED: "archived"
    }),

    /*
     * ---------------------------------------------------------
     * CANONICAL STATUS
     * ---------------------------------------------------------
     *
     * Canonical status answers:
     *
     * "Has ESCIE established this connection?"
     *
     * It does NOT answer:
     * "Is this objectively true?"
     */

    CANONICAL_STATUS: Object.freeze({
      CANONICAL: "canonical",
      PROVISIONAL: "provisional",
      PROPOSED: "proposed",
      NON_CANONICAL: "non_canonical",
      UNKNOWN: "unknown"
    }),

    /*
     * ---------------------------------------------------------
     * VISIBILITY
     * ---------------------------------------------------------
     */

    VISIBILITY: Object.freeze({
      PUBLIC: "public",
      LIMITED: "limited",
      PRIVATE: "private",
      WITHHELD: "withheld"
    }),

    /*
     * ---------------------------------------------------------
     * CONFIDENCE
     * ---------------------------------------------------------
     *
     * Confidence describes certainty about the connection.
     * It is separate from canonical status.
     */

    CONFIDENCE: Object.freeze({
      VERIFIED: "verified",
      STRONGLY_SUPPORTED: "strongly_supported",
      CREDIBLE: "credible",
      PLAUSIBLE: "plausible",
      UNCERTAIN: "uncertain",
      DISPUTED: "disputed",
      UNVERIFIED: "unverified",
      UNKNOWN: "unknown"
    }),

    /*
     * ---------------------------------------------------------
     * RELATIONSHIP TYPES
     * ---------------------------------------------------------
     *
     * There is intentionally NO generic "related_to".
     *
     * If we do not know what kind of relationship exists,
     * the relationship should remain unresolved rather than
     * inventing a generic connection.
     */

    TYPES: Object.freeze({

      STRUCTURAL: Object.freeze([
        "contains",
        "part_of",
        "version_of",
        "grouped_with",
        "derived_from"
      ]),

      CREATIVE: Object.freeze([
        "created",
        "created_by",
        "contributed_to",
        "inspired_by",
        "responds_to",
        "recontextualizes",
        "contrasts_with",
        "echoes"
      ]),

      PEOPLE: Object.freeze([
        "family_of",
        "friend_of",
        "collaborated_with",
        "influenced_by",
        "featured_in",
        "subject_of"
      ]),

      PLACE: Object.freeze([
        "located_at",
        "created_at",
        "recorded_at",
        "performed_at",
        "occurred_at",
        "depicts",
        "references",
        "anchored_in"
      ]),

      TIME_EVENT: Object.freeze([
        "occurred_during",
        "created_during",
        "preceded_by",
        "followed_by",
        "coincides_with",
        "resulted_in"
      ]),

      PROOF_INVESTIGATION: Object.freeze([
        "supports",
        "contradicts",
        "corroborates",
        "contextualizes",
        "challenges",
        "investigates",
        "examines",
        "includes"
      ]),

      INTERPRETIVE: Object.freeze([
        "possibly_related",
        "resembles",
        "associated_with"
      ])
    }),

    /*
     * ---------------------------------------------------------
     * FLATTENED TYPE LIST
     * ---------------------------------------------------------
     */

    ALL_TYPES: [],

    /*
     * ---------------------------------------------------------
     * INVERSE RELATIONSHIPS
     * ---------------------------------------------------------
     *
     * These are semantic inverse pairs where an inverse is
     * meaningful.
     *
     * Not every relationship has a perfect inverse.
     */

    INVERSE_TYPES: Object.freeze({

      contains: "part_of",
      part_of: "contains",

      created: "created_by",
      created_by: "created",
      contributed_to: "contributed_to",

      inspired_by: "inspires",

      responds_to: "responded_to",

      recontextualizes: "recontextualized_by",

      contrasts_with: "contrasts_with",

      echoes: "echoed_by",

      family_of: "family_of",
      friend_of: "friend_of",

      collaborated_with: "collaborated_with",

      influenced_by: "influences",
      influences: "influenced_by",

      featured_in: "features",
      features: "featured_in",

      subject_of: "has_subject",

      located_at: "location_of",

      created_at: "creation_location_of",

      recorded_at: "recording_location_of",

      performed_at: "performance_location_of",

      occurred_at: "occurrence_location_of",

      depicts: "depicted_by",

      references: "referenced_by",
      anchored_in: "anchor_for",
      anchor_for: "anchored_in",

      occurred_during: "contains_event",

      created_during: "contains_creation",

      preceded_by: "followed_by",
      followed_by: "preceded_by",

      coincides_with: "coincides_with",

      resulted_in: "resulted_from",

      resulted_from: "resulted_in",

      supports: "supported_by",
      contradicts: "contradicted_by",

      corroborates: "corroborated_by",

      contextualizes: "contextualized_by",

      challenges: "challenged_by",

      investigates: "investigated_by",

      examines: "examined_by",

      includes: "included_in",

      possibly_related: "possibly_related",
      resembles: "resembles",
      associated_with: "associated_with"
    }),

    /*
     * ---------------------------------------------------------
     * VALIDATION
     * ---------------------------------------------------------
     */

    REQUIRED_FIELDS: Object.freeze([
      "id",
      "from",
      "type",
      "to"
    ]),

    /*
     * ---------------------------------------------------------
     * ID GENERATION
     * ---------------------------------------------------------
     */

    createId: function () {
      return (
        "rel-" +
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).slice(2, 8)
      );
    },

    /*
     * ---------------------------------------------------------
     * TYPE CHECKING
     * ---------------------------------------------------------
     */

    isType: function (type) {
      return this.ALL_TYPES.indexOf(type) !== -1;
    },

    getCategory: function (type) {
      const categories = this.TYPES;

      for (const category in categories) {
        if (!Object.prototype.hasOwnProperty.call(categories, category)) {
          continue;
        }

        if (categories[category].indexOf(type) !== -1) {
          return category;
        }
      }

      return null;
    },

    /*
     * ---------------------------------------------------------
     * NORMALIZATION
     * ---------------------------------------------------------
     */

    normalize: function (data) {

      data = data || {};

      const now = new Date().toISOString();

      const relationship = {

        id: data.id || this.createId(),

        from: data.from || data.source || null,

        type: data.type || data.relationship_type || null,

        to: data.to || data.target || null,

        status: data.status || this.STATUS.ACTIVE,

        confidence: data.confidence || this.CONFIDENCE.UNKNOWN,

        canonical_status:
          data.canonical_status ||
          data.canonical ||
          this.CANONICAL_STATUS.UNKNOWN,

        basis: data.basis || null,

        source: data.source_reference || data.basis_source || null,

        evidence: Array.isArray(data.evidence)
          ? data.evidence.slice()
          : [],

        date: data.date || null,

        context: data.context || null,

        note: data.note || null,

        visibility:
          data.visibility ||
          this.VISIBILITY.PUBLIC,

        public_disclosure:
          data.public_disclosure !== undefined
            ? data.public_disclosure
            : null,

        created_at:
          data.created_at ||
          now,

        updated_at:
          data.updated_at ||
          now,

        created_by:
          data.created_by ||
          null,

        modified_by:
          data.modified_by ||
          null,

        history:
          Array.isArray(data.history)
            ? data.history.slice()
            : []
      };

      return relationship;
    },

    /*
     * ---------------------------------------------------------
     * VALIDATION
     * ---------------------------------------------------------
     */

    validate: function (relationship) {

      const errors = [];

      if (!relationship || typeof relationship !== "object") {
        return {
          valid: false,
          errors: ["Relationship must be an object."]
        };
      }

      this.REQUIRED_FIELDS.forEach(function (field) {
        if (
          relationship[field] === undefined ||
          relationship[field] === null ||
          relationship[field] === ""
        ) {
          errors.push(
            "Missing required field: " + field
          );
        }
      });

      if (
        relationship.type &&
        !this.isType(relationship.type)
      ) {
        errors.push(
          "Unknown relationship type: " +
          relationship.type
        );
      }

      if (
        relationship.status &&
        Object.values(this.STATUS).indexOf(
          relationship.status
        ) === -1
      ) {
        errors.push(
          "Unknown relationship status: " +
          relationship.status
        );
      }

      if (
        relationship.confidence &&
        Object.values(this.CONFIDENCE).indexOf(
          relationship.confidence
        ) === -1
      ) {
        errors.push(
          "Unknown confidence value: " +
          relationship.confidence
        );
      }

      if (
        relationship.canonical_status &&
        Object.values(this.CANONICAL_STATUS).indexOf(
          relationship.canonical_status
        ) === -1
      ) {
        errors.push(
          "Unknown canonical status: " +
          relationship.canonical_status
        );
      }

      if (
        relationship.visibility &&
        Object.values(this.VISIBILITY).indexOf(
          relationship.visibility
        ) === -1
      ) {
        errors.push(
          "Unknown visibility value: " +
          relationship.visibility
        );
      }

      if (
        relationship.from &&
        relationship.to &&
        relationship.from === relationship.to
      ) {
        errors.push(
          "Self-referential relationships require explicit handling."
        );
      }

      if (
        relationship.visibility !== this.VISIBILITY.PUBLIC &&
        relationship.public_disclosure === true
      ) {
        errors.push(
          "Non-public visibility cannot declare public disclosure."
        );
      }

      if (
        relationship.canonical_status === this.CANONICAL_STATUS.CANONICAL &&
        relationship.status !== this.STATUS.ACTIVE
      ) {
        errors.push(
          "Canonical relationships must be active."
        );
      }

      if (
        relationship.canonical_status === this.CANONICAL_STATUS.CANONICAL &&
        relationship.visibility !== this.VISIBILITY.PUBLIC
      ) {
        errors.push(
          "Canonical relationships must be publicly visible."
        );
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    /*
     * ---------------------------------------------------------
     * CREATE
     * ---------------------------------------------------------
     *
     * Creation does NOT automatically make a relationship
     * canonical.
     */

    create: function (data) {

      const relationship = this.normalize(data);

      const validation = this.validate(
        relationship
      );

      if (!validation.valid) {
        return {
          relationship: relationship,
          valid: false,
          errors: validation.errors
        };
      }

      return {
        relationship: relationship,
        valid: true,
        errors: []
      };
    },

    /*
     * ---------------------------------------------------------
     * CANONICAL CHECK
     * ---------------------------------------------------------
     */

    isCanonical: function (relationship) {

      if (!relationship) {
        return false;
      }

      return (
        relationship.canonical_status ===
        this.CANONICAL_STATUS.CANONICAL
      );
    },

    /*
     * ---------------------------------------------------------
     * PUBLIC CHECK
     * ---------------------------------------------------------
     */

    isPublic: function (relationship) {

      if (!relationship) {
        return false;
      }

      if (
        relationship.visibility !==
        this.VISIBILITY.PUBLIC
      ) {
        return false;
      }

      if (
        relationship.status ===
        this.STATUS.WITHHELD
      ) {
        return false;
      }

      if (
        relationship.status ===
        this.STATUS.ARCHIVED
      ) {
        return false;
      }

      return true;
    },

    /*
     * ---------------------------------------------------------
     * DIRECTION HELPERS
     * ---------------------------------------------------------
     */

    isFrom: function (relationship, recordId) {

      if (!relationship) {
        return false;
      }

      return relationship.from === recordId;
    },

    isTo: function (relationship, recordId) {

      if (!relationship) {
        return false;
      }

      return relationship.to === recordId;
    },

    connects: function (relationship, recordA, recordB) {

      if (!relationship) {
        return false;
      }

      return (
        (
          relationship.from === recordA &&
          relationship.to === recordB
        ) ||
        (
          relationship.from === recordB &&
          relationship.to === recordA
        )
      );
    },

    /*
     * ---------------------------------------------------------
     * INVERSE TYPE
     * ---------------------------------------------------------
     */

    getInverseType: function (type) {

      return (
        this.INVERSE_TYPES[type] ||
        null
      );
    },

    /*
     * ---------------------------------------------------------
     * INVERSE RELATIONSHIP
     * ---------------------------------------------------------
     *
     * Produces a representation of the opposite direction.
     *
     * This does NOT automatically save or canonize anything.
     */

    invert: function (relationship) {

      if (!relationship) {
        return null;
      }

      const inverseType =
        this.getInverseType(
          relationship.type
        );

      if (!inverseType) {
        return null;
      }

      const inverted = Object.assign(
        {},
        relationship,
        {
          id: this.createId(),

          from: relationship.to,

          to: relationship.from,

          type: inverseType,

          created_at:
            new Date().toISOString(),

          updated_at:
            new Date().toISOString(),

          history: Array.isArray(
            relationship.history
          )
            ? relationship.history.slice()
            : []
        }
      );

      return inverted;
    },

    /*
     * ---------------------------------------------------------
     * COLLECTION HELPERS
     * ---------------------------------------------------------
     */

    normalizeMany: function (relationships) {

      if (!Array.isArray(relationships)) {
        return [];
      }

      return relationships
        .map(function (relationship) {
          return ESCIE_RELATIONSHIP.normalize(
            relationship
          );
        });
    },

    validateMany: function (relationships) {

      if (!Array.isArray(relationships)) {
        return {
          valid: false,
          errors: ["Relationships must be an array."]
        };
      }

      const errors = [];

      relationships.forEach(function (
        relationship,
        index
      ) {

        const result =
          ESCIE_RELATIONSHIP.validate(
            relationship
          );

        if (!result.valid) {
          result.errors.forEach(function (error) {
            errors.push(
              "Relationship " +
              index +
              ": " +
              error
            );
          });
        }
      });

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    /*
     * ---------------------------------------------------------
     * QUERY HELPERS
     * ---------------------------------------------------------
     */

    findById: function (
      relationships,
      id
    ) {

      if (!Array.isArray(relationships)) {
        return null;
      }

      return (
        relationships.find(function (
          relationship
        ) {
          return relationship.id === id;
        }) || null
      );
    },

    findFrom: function (
      relationships,
      recordId
    ) {

      if (!Array.isArray(relationships)) {
        return [];
      }

      return relationships.filter(
        function (relationship) {
          return relationship.from === recordId;
        }
      );
    },

    findTo: function (
      relationships,
      recordId
    ) {

      if (!Array.isArray(relationships)) {
        return [];
      }

      return relationships.filter(
        function (relationship) {
          return relationship.to === recordId;
        }
      );
    },

    findConnected: function (
      relationships,
      recordId
    ) {

      if (!Array.isArray(relationships)) {
        return [];
      }

      return relationships.filter(
        function (relationship) {

          return (
            relationship.from === recordId ||
            relationship.to === recordId
          );
        }
      );
    },

    findByType: function (
      relationships,
      type
    ) {

      if (!Array.isArray(relationships)) {
        return [];
      }

      return relationships.filter(
        function (relationship) {
          return relationship.type === type;
        }
      );
    },

    findByCategory: function (
      relationships,
      category
    ) {

      if (!Array.isArray(relationships)) {
        return [];
      }

      return relationships.filter(
        function (relationship) {

          return (
            ESCIE_RELATIONSHIP.getCategory(
              relationship.type
            ) === category
          );
        }
      );
    },

    findCanonical: function (
      relationships
    ) {

      if (!Array.isArray(relationships)) {
        return [];
      }

      return relationships.filter(
        function (relationship) {

          return ESCIE_RELATIONSHIP.isCanonical(
            relationship
          );
        }
      );
    },

    findPublic: function (
      relationships
    ) {

      if (!Array.isArray(relationships)) {
        return [];
      }

      return relationships.filter(
        function (relationship) {

          return ESCIE_RELATIONSHIP.isPublic(
            relationship
          );
        }
      );
    },

    /*
     * ---------------------------------------------------------
     * DUPLICATE DETECTION
     * ---------------------------------------------------------
     */

    sameConnection: function (
      a,
      b
    ) {

      if (!a || !b) {
        return false;
      }

      return (
        a.from === b.from &&
        a.type === b.type &&
        a.to === b.to
      );
    },

    hasConnection: function (
      relationships,
      from,
      type,
      to
    ) {

      if (!Array.isArray(relationships)) {
        return false;
      }

      return relationships.some(
        function (relationship) {

          return (
            relationship.from === from &&
            relationship.type === type &&
            relationship.to === to
          );
        }
      );
    },

    /*
     * ---------------------------------------------------------
     * CORRELATION / INTERPRETATION / CANON SEPARATION
     * ---------------------------------------------------------
     *
     * The Brain and future correlation engine can use these
     * states to keep observations separate from canon.
     */

    isInterpretive: function (relationship) {

      if (!relationship) {
        return false;
      }

      return (
        this.getCategory(
          relationship.type
        ) === "INTERPRETIVE"
      );
    },

    isProposed: function (relationship) {

      if (!relationship) {
        return false;
      }

      return (
        relationship.status ===
        this.STATUS.PROPOSED ||
        relationship.canonical_status ===
        this.CANONICAL_STATUS.PROPOSED
      );
    },

    isDisputed: function (relationship) {

      if (!relationship) {
        return false;
      }

      return (
        relationship.status ===
        this.STATUS.DISPUTED ||
        relationship.confidence ===
        this.CONFIDENCE.DISPUTED
      );
    },

    /*
     * ---------------------------------------------------------
     * PUBLIC DISCLOSURE
     * ---------------------------------------------------------
     *
     * A relationship may exist without its explanation
     * being public.
     */

    canDisclose: function (
      relationship
    ) {

      if (!relationship) {
        return false;
      }

      if (!this.isPublic(relationship)) {
        return false;
      }

      if (
        relationship.public_disclosure === false
      ) {
        return false;
      }

      return true;
    },

    /*
     * ---------------------------------------------------------
     * SAFE PUBLIC VIEW
     * ---------------------------------------------------------
     *
     * Produces only the fields safe for a public-facing
     * relationship view.
     *
     * Private editorial metadata remains excluded.
     */

    toPublicView: function (
      relationship
    ) {

      if (!this.canDisclose(relationship)) {
        return null;
      }

      return {
        id: relationship.id,

        from: relationship.from,

        type: relationship.type,

        to: relationship.to,

        status: relationship.status,

        confidence: relationship.confidence,

        canonical_status:
          relationship.canonical_status,

        date: relationship.date,

        context: relationship.context,

        note: relationship.note,

        visibility: relationship.visibility
      };
    },

    /*
     * ---------------------------------------------------------
     * HISTORY
     * ---------------------------------------------------------
     */

    appendHistory: function (
      relationship,
      event
    ) {

      if (!relationship) {
        return null;
      }

      const updated =
        Object.assign(
          {},
          relationship
        );

      if (!Array.isArray(updated.history)) {
        updated.history = [];
      }

      updated.history.push(
        Object.assign(
          {},
          event || {},
          {
            timestamp:
              (event && event.timestamp) ||
              new Date().toISOString()
          }
        )
      );

      updated.updated_at =
        new Date().toISOString();

      return updated;
    }
  };


  /*
   * ---------------------------------------------------------
   * BUILD FLATTENED TYPE LIST
   * ---------------------------------------------------------
   */

  ESCIE_RELATIONSHIP.ALL_TYPES =
    Object.freeze(
      Object.keys(
        ESCIE_RELATIONSHIP.TYPES
      ).reduce(
        function (all, category) {

          return all.concat(
            ESCIE_RELATIONSHIP.TYPES[category]
          );

        },
        []
      )
    );


  /*
   * ---------------------------------------------------------
   * GLOBAL EXPORT
   * ---------------------------------------------------------
   */

  if (typeof window !== "undefined") {
    window.ESCIE_RELATIONSHIP =
      ESCIE_RELATIONSHIP;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = ESCIE_RELATIONSHIP;
  }

})();
