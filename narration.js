/*
  ESCIE NARRATION ENGINE

  The visitor receives information.
  The visitor does not receive the whole record.

  Narration changes perception.
  It does not change the underlying fact.

  CC orthography remains permanent.
*/


const ESCIE_NARRATION = {

  documentary: {

    distance: "close",

    certainty: "high",

    fragmentation: "low",

    context: "high",

    contradiction: "low",

    omission: "low",

    languageMode: "documentary"

  },


  memory: {

    distance: "close",

    certainty: "unstable",

    fragmentation: "high",

    context: "partial",

    contradiction: "medium",

    omission: "medium",

    languageMode: "memory"

  },


  psychological: {

    distance: "internal",

    certainty: "unstable",

    fragmentation: "high",

    context: "low",

    contradiction: "high",

    omission: "high",

    languageMode: "psychological"

  },


  street: {

    distance: "immediate",

    certainty: "direct",

    fragmentation: "low",

    context: "medium",

    contradiction: "low",

    omission: "low",

    languageMode: "street"

  },


  myth: {

    distance: "symbolic",

    certainty: "distorted",

    fragmentation: "medium",

    context: "low",

    contradiction: "high",

    omission: "high",

    languageMode: "myth"

  },


  signal: {

    distance: "remote",

    certainty: "partial",

    fragmentation: "high",

    context: "partial",

    contradiction: "medium",

    omission: "high",

    languageMode: "signal"

  },


  unknown: {

    distance: "unknown",

    certainty: "unknown",

    fragmentation: "high",

    context: "low",

    contradiction: "high",

    omission: "very-high",

    languageMode: "unknown"

  }

};


/*
  The narration engine never changes the source record.

  It creates a presentation layer around the record.
*/

const ESCIE_NARRATION_ENGINE = {


  get(mode) {

    return (
      ESCIE_NARRATION[mode] ||
      ESCIE_NARRATION.unknown
    );

  },


  resolve(item) {

    if (!item) {

      return {
        mode: "unknown",
        profile: this.get("unknown")
      };

    }


    const mode =
      item.narration ||
      item.voice ||
      item.languageMode ||
      "unknown";


    return {

      mode,

      profile: this.get(mode)

    };

  },


  /*
    Determine how much context the visitor receives.

    This does NOT delete the original data.

    It only tells the renderer how much to reveal.
  */

  reveal(item) {

    const narration = this.resolve(item);

    const profile = narration.profile;


    return {

      showContext:
        profile.context !== "low",

      showExtendedContext:
        profile.context === "high",

      allowFragmentation:
        profile.fragmentation === "high",

      allowContradiction:
        profile.contradiction === "high",

      allowOmission:
        profile.omission !== "low",

      mode: narration.mode

    };

  },


  /*
    Generate a presentation state.

    The state can later be used by individual
    components without changing the source data.
  */

  present(item) {

    const narration = this.resolve(item);

    const reveal = this.reveal(item);


    return {

      narration: narration.mode,

      profile: narration.profile,

      reveal,

      source:

        item.source ||
        item.origin ||
        null,

      certainty:

        item.certainty ||
        narration.profile.certainty

    };

  },


  /*
    Return a language phrase appropriate to the
    current narration mode.

    The visitor never sees the mode name.
  */

  phrase(mode, category, index = null) {

    const resolved =
      this.get(mode);

    const languageMode =
      resolved.languageMode;


    if (
      window.ESCIE_LANGUAGE_ENGINE &&
      typeof window.ESCIE_LANGUAGE_ENGINE.phrase === "function"
    ) {

      return window.ESCIE_LANGUAGE_ENGINE.phrase(
        category,
        index
      );

    }


    return "";

  }

};


/*
  Global access.
*/

window.ESCIE_NARRATION = ESCIE_NARRATION;

window.ESCIE_NARRATION_ENGINE =
  ESCIE_NARRATION_ENGINE;