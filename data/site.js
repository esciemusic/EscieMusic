/*
 * ESCIE SITE CONFIGURATION
 *
 * Stable identity and top-level site configuration.
 * Content records belong in the data registries; this file only defines
 * the site's identity and global editorial premise.
 */

const ESCIE_SITE = {
  name: "ESCIE",
  pronunciation: "S.C.",
  location: "Montréal, Canada",
  publicYear: 2026,
  tagline: "REALITY WITH THE SIGNAL DISTORTED.",
  philosophy: "The music does not create the universe. The universe creates the music.",
  developmentYear: 2026,
  status: "development"
};

if (typeof window !== "undefined") {
  window.ESCIE_SITE = ESCIE_SITE;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_SITE;
}
