/*
 * ESCIE FRAGMENT REGISTRY
 *
 * Fragments are preserved pieces of recorded or referenced material:
 * images, audio, video, documents, text, objects, captures, and other
 * reusable pieces of evidence or context.
 *
 * IMPORTANT:
 * - A fragment is material, not automatically meaning.
 * - A fragment's source, provenance, transformation, and disclosure state matter.
 * - Reuse does not establish ownership, authorship, chronology, or interpretation.
 * - The same fragment may appear in multiple contexts without becoming a new fragment.
 *
 * This registry is intentionally empty until ESCIE establishes its records.
 */

const ESCIE_FRAGMENTS = [];

if (typeof window !== "undefined") {
  window.ESCIE_FRAGMENTS = ESCIE_FRAGMENTS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_FRAGMENTS;
}
