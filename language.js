/*
  ESCIE LANGUAGE ENGINE
  ---------------------

  The interface has no single narrator.

  Its voice may move between:
  - documentary
  - memory
  - psychological
  - street
  - myth
  - signal
  - unknown

  One thing does not change:

  CC ORTHOGRAPHY.

  Every visible interface-generated piece of language
  passes through this layer before reaching the visitor.

  The interface never explains the rule.
*/


/* =========================================================
   1. CC ORTHOGRAPHY
   ========================================================= */

const ESCIE_ORTHOGRAPHY = {

  /*
    Words containing the hard "ck" construction receive
    the ESCIE CC treatment.

    Examples:
    back      → bacc
    black     → blacc
    track     → tracc
    fuck      → fucc
    background → baccground

    The replacement is deliberately simple:
    "ck" → "cc"

    This means the rule can operate continuously across
    future interface language without manually editing
    every sentence.
  */

  transform(text) {

    if (typeof text !== "string") {
      return text;
    }

    return text.replace(/ck/gi, match => {
      return match === "CK" ? "CC" : "cc";
    });
  }

};


/* =========================================================
   2. NARRATIVE MODES
   ========================================================= */

const ESCIE_LANGUAGE_MODES = {

  documentary: {
    tone: "cold",
    certainty: "high",
    description: "Observed. Recorded. Filed."
  },

  memory: {
    tone: "fragmented",
    certainty: "unstable",
    description: "Remembered differently each time."
  },

  psychological: {
    tone: "internal",
    certainty: "contradictory",
    description: "The evidence may not be outside the mind."
  },

  street: {
    tone: "direct",
    certainty: "immediate",
    description: "No distance between the event and the observer."
  },

  myth: {
    tone: "symbolic",
    certainty: "distorted",
    description: "What happened may have become something else."
  },

  signal: {
    tone: "fragmented",
    certainty: "partial",
    description: "Only part of the transmission survived."
  },

  unknown: {
    tone: "ambiguous",
    certainty: "unknown",
    description: "The source cannot be established."
  }

};


/* =========================================================
   3. INTERFACE LANGUAGE
   ========================================================= */

const ESCIE_LANGUAGE = {

  /*
    These are intentionally not conventional website
    status messages.

    They describe states without explaining them.
  */

  unavailable: [
    "NOTHING IS HERE YET.",
    "SOME THINGS WERE LEFT BEHIND.",
    "THE RECORD IS INCOMPLETE."
  ],

  hidden: [
    "NOT EVERYTHING WAS KEPT.",
    "SOME INFORMATION REMAINS OUT OF REACH.",
    "THE RECORD DOES NOT END HERE."
  ],

  missing: [
    "SOMETHING IS MISSING.",
    "THE GAP REMAINS.",
    "NO COMPLETE RECORD EXISTS."
  ],

  sealed: [
    "SEALED.",
    "NOT FOR RELEASE.",
    "THE RECORD REMAINS CLOSED."
  ],

  upcoming: [
    "NOT YET.",
    "THE TIME HAS NOT COME.",
    "THIS HAS NOT HAPPENED YET."
  ],

  archived: [
    "THE RECORD REMAINS.",
    "ARCHIVED.",
    "LEFT WHERE IT WAS FOUND."
  ],

  incomplete: [
    "INCOMPLETE.",
    "PART OF THE RECORD IS MISSING.",
    "THE REMAINING PIECES DO NOT AGREE."
  ],

  investigation: [
    "THE QUESTION REMAINS OPEN.",
    "THE RECORD CONTINUES.",
    "SOME ANSWERS ARRIVED BEFORE THE QUESTIONS."
  ],

  transmission: [
    "TRANSMISSION INTERRUPTED.",
    "SIGNAL DETECTED.",
    "PARTIAL TRANSMISSION.",
    "SIGNAL LOST."
  ]

};


/* =========================================================
   4. LANGUAGE ENGINE
   ========================================================= */

const ESCIE_LANGUAGE_ENGINE = {

  /*
    Apply the permanent orthographic layer.
  */

  speak(text) {
    return ESCIE_ORTHOGRAPHY.transform(text);
  },


  /*
    Select a phrase from one of the interface language
    groups.

    We deliberately do not make the selection predictable.
    The interface can therefore feel slightly different
    without requiring different code.
  */

  phrase(category, index = null) {

    const group = ESCIE_LANGUAGE[category];

    if (!group || !group.length) {
      return "";
    }

    let selectedIndex;

    if (
      typeof index === "number" &&
      index >= 0 &&
      index < group.length
    ) {
      selectedIndex = index;
    } else {
      selectedIndex = Math.floor(
        Math.random() * group.length
      );
    }

    return this.speak(group[selectedIndex]);
  },


  /*
    Render text safely into an element.
  */

  render(element, text) {

    if (!element) {
      return;
    }

    element.textContent = this.speak(text);
  },


  /*
    Render HTML text while still applying the CC rule
    to text content.

    This should only be used for controlled interface
    templates, never arbitrary user HTML.
  */

  renderText(element, text) {

    if (!element) {
      return;
    }

    element.textContent = this.speak(text);
  },


  /*
    Return the current narrative mode.

    This is deliberately separate from the orthography.
    The mode may change.
    The orthography does not.
  */

  mode(name) {

    if (
      name &&
      Object.prototype.hasOwnProperty.call(
        ESCIE_LANGUAGE_MODES,
        name
      )
    ) {
      return ESCIE_LANGUAGE_MODES[name];
    }

    return ESCIE_LANGUAGE_MODES.unknown;
  }

};


/* =========================================================
   5. GLOBAL ACCESS
   ========================================================= */

window.ESCIE_ORTHOGRAPHY = ESCIE_ORTHOGRAPHY;
window.ESCIE_LANGUAGE_MODES = ESCIE_LANGUAGE_MODES;
window.ESCIE_LANGUAGE = ESCIE_LANGUAGE;
window.ESCIE_LANGUAGE_ENGINE = ESCIE_LANGUAGE_ENGINE;