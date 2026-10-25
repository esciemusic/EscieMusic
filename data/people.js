/*
 * ESCIE PEOPLE REGISTRY
 *
 * People are PERSON records.
 *
 * This registry intentionally begins empty. Real people should only be
 * added when ESCIE intentionally establishes a record for them.
 *
 * A person's appearance in a song, photograph, document, relationship,
 * or audience theory does not automatically establish identity,
 * biography, authorship, or meaning.
 */

const ESCIE_PEOPLE = [];

if (typeof window !== "undefined") {
  window.ESCIE_PEOPLE = ESCIE_PEOPLE;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_PEOPLE;
}
