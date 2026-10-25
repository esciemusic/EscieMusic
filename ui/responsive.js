/*
 * ESCIE UI — RESPONSIVE
 *
 * Responsive behavior adapts the same experience to available space.
 * Mobile is not a reduced version of ESCIE; complexity is revealed
 * sequentially rather than removed.
 */

const ESCIE_UI_RESPONSIVE = {
  breakpoints: Object.freeze({
    mobile: 767,
    desktop: 768
  }),

  classify(width) {
    const value = typeof width === "number"
      ? width
      : (typeof window !== "undefined" ? window.innerWidth : 0);

    return value <= this.breakpoints.mobile ? "mobile" : "desktop";
  },

  apply(root, width) {
    if (!root) return null;

    const mode = this.classify(width);
    root.dataset.viewport = mode;
    return mode;
  }
};

if (typeof window !== "undefined") window.ESCIE_UI_RESPONSIVE = ESCIE_UI_RESPONSIVE;
if (typeof module !== "undefined" && module.exports) module.exports = ESCIE_UI_RESPONSIVE;
