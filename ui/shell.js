/*
 * ESCIE UI — SHELL
 *
 * Owns the public interface shell and its lifecycle.
 * The shell presents system state; it does not create canon.
 */

const ESCIE_UI_SHELL = {
  root: null,

  mount(root) {
    this.root = typeof root === "string"
      ? document.querySelector(root)
      : root;

    return this.root;
  },

  setState(state = {}) {
    if (!this.root) return null;

    if (state.uiState) {
      this.root.dataset.escieState = state.uiState;
    }

    if (state.route) {
      this.root.dataset.escieRoute = state.route;
    }

    return this.root;
  }
};

if (typeof window !== "undefined") window.ESCIE_UI_SHELL = ESCIE_UI_SHELL;
if (typeof module !== "undefined" && module.exports) module.exports = ESCIE_UI_SHELL;
