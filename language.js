/*
  ESCIE LANGUAGE ENGINE

  RULES:

  1. CC ORTHOGRAPHY IS PERMANENT.
  2. THE SITE NEVER EXPLAINS THAT RULE.
  3. NARRATION CAN SHIFT BETWEEN MODES.
  4. THE SITE KNOWS MORE THAN THE VISITOR.
  5. THE SOURCE OF THAT KNOWLEDGE IS NEVER IDENTIFIED.
  6. REALITY, MEMORY, PSYCHOLOGY, STREET, MYTH AND SIGNAL
     MAY BLEED INTO EACH OTHER.
  7. THE INTERFACE NEVER CALLS ATTENTION TO ITSELF.
*/

const ESCIE_ORTHOGRAPHY = {

  transform(text) {

    if (typeof text !== "string") {
      return text;
    }

    return text.replace(/ck/gi, (match) => {

      if (match === "CK") {
        return "CC";
      }

      if (match === "Ck") {
        return "Cc";
      }

      return "cc";
    });
  }

};


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


const ESCIE_LANGUAGE = {

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


const ESCIE_LANGUAGE_ENGINE = {

  /*
    Permanent orthographic transformation.
  */

  speak(text) {

    return ESCIE_ORTHOGRAPHY.transform(text);

  },


  /*
    Return one phrase from the ESCIE vocabulary.
  */

  phrase(category, index = null) {

    const collection = ESCIE_LANGUAGE[category];

    if (!collection || !collection.length) {
      return "";
    }

    if (index === null) {
      const randomIndex = Math.floor(
        Math.random() * collection.length
      );

      return this.speak(collection[randomIndex]);
    }

    return this.speak(
      collection[index % collection.length]
    );

  },


  /*
    Return information about a narration mode.
  */

  mode(name) {

    return ESCIE_LANGUAGE_MODES[name]
      || ESCIE_LANGUAGE_MODES.unknown;

  },


  /*
    Render transformed text into an element.
  */

  render(element, text) {

    if (!element) {
      return;
    }

    element.textContent = this.speak(text);

  },


  /*
    Render transformed human text without interpreting it as HTML.
    The caller can opt into explicit HTML rendering elsewhere when
    that is genuinely required.
  */

  renderText(element, text) {

    if (!element) {
      return;
    }

    element.textContent = this.speak(text);

  },


  /*
    Apply the CC law to visible interface text.

    This deliberately ignores:
    - scripts
    - styles
    - form fields
    - technical attributes
    - URLs
  */

  enforceInterface() {

    const ignoredTags = new Set([
      "SCRIPT",
      "STYLE",
      "NOSCRIPT",
      "TEXTAREA",
      "INPUT",
      "SELECT",
      "OPTION"
    ]);


    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );


    const nodes = [];

    let node;

    while ((node = walker.nextNode())) {

      if (
        !node.parentElement ||
        ignoredTags.has(node.parentElement.tagName)
      ) {
        continue;
      }

      nodes.push(node);

    }


    nodes.forEach((textNode) => {

      const original = textNode.nodeValue;

      if (!original || !original.trim()) {
        return;
      }

      textNode.nodeValue = this.speak(original);

    });


    /*
      Apply the same rule to human-facing accessibility
      labels without touching URLs or technical attributes.
    */

    document
      .querySelectorAll("[aria-label], [title]")
      .forEach((element) => {

        if (element.hasAttribute("aria-label")) {

          element.setAttribute(
            "aria-label",
            this.speak(
              element.getAttribute("aria-label")
            )
          );

        }

        if (element.hasAttribute("title")) {

          element.setAttribute(
            "title",
            this.speak(
              element.getAttribute("title")
            )
          );

        }

      });

  }

};


/*
  Global access.
*/

window.ESCIE_ORTHOGRAPHY = ESCIE_ORTHOGRAPHY;
window.ESCIE_LANGUAGE_MODES = ESCIE_LANGUAGE_MODES;
window.ESCIE_LANGUAGE = ESCIE_LANGUAGE;
window.ESCIE_LANGUAGE_ENGINE = ESCIE_LANGUAGE_ENGINE;