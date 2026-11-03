/*
  ESCIE LANGUAGE ENGINE

  RULES:

  1. CC ORTHOGRAPHY IS PERMANENT.
  2. THE SITE NEVER EXPLAINS THAT RULE.
  3. NARRATION CAN SHIFT BETWEEN MODES.
  4. THE SITE KNOWS MORE THAN THE VISITOR.
  5. THE SOURCE OF THAT KNOWLEDGE IS NEVER IDENTIFIED.
  6. MEMORY, PSYCHOLOGY, STREET, MYTH AND SIGNAL
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




const ESCIE_INTERFACE_TRANSLATIONS = Object.freeze({
  en: {
    "OPEN INDEX":"OPEN INDEX","CLOSE INDEX":"CLOSE INDEX","LANGUAGE":"LANGUAGE","LIGHT MODE":"LIGHT MODE","DARK MODE":"DARK MODE",
    "SKIP TO CONTENT":"SKIP TO CONTENT","ENTER THE WORLD":"ENTER THE WORLD","NOW":"NOW","ART":"ART","THE WORLD":"THE WORLD","THE WEB":"THE WEB",
    "THE ARCHIVES":"THE ARCHIVES","THE CASE FILES":"THE CASE FILES","HEART ON MY SLEEVE":"HEART ON MY SLEEVE","GLASS EYE":"GLASS EYE","ESCIE":"ESCIE",
    "SIGNAL // WAITING":"SIGNAL // WAITING","CURRENT SIGNAL":"CURRENT SIGNAL","MONTRÉAL, QUÉBEC, CANADA":"MONTRÉAL, QUÉBEC, CANADA",
    "REALITY WITH THE SIGNAL DISTORTED.":"REALITY WITH THE SIGNAL DISTORTED.","THE SIGNAL REMAINS DISTORTED.":"THE SIGNAL REMAINS DISTORTED.",
    "WHERE LIFE BECOMES THE MEDIUM.":"WHERE LIFE BECOMES THE MEDIUM.","BROAD STROKES AND FINE LINES — THE THINGS ESCIE MAKES FROM LIFE.":"BROAD STROKES AND FINE LINES — THE THINGS ESCIE MAKES FROM LIFE.",
    "QUESTIONS, EVIDENCE, CONTRADICTIONS AND UNRESOLVED THREADS — FOLLOW WHAT THE RECORD CAN SUPPORT.":"QUESTIONS, EVIDENCE, CONTRADICTIONS AND UNRESOLVED THREADS — FOLLOW WHAT THE RECORD CAN SUPPORT.",
    "SEE · HEAR · FOLLOW · MISS · RETURN":"SEE · HEAR · FOLLOW · MISS · RETURN"
  },
  fr: {
    "OPEN INDEX":"OUVRIR L'INDEX","CLOSE INDEX":"FERMER L'INDEX","LANGUAGE":"LANGUE","LIGHT MODE":"MODE CLAIR","DARK MODE":"MODE SOMBRE",
    "SKIP TO CONTENT":"ALLER AU CONTENU","ENTER THE WORLD":"ENTRER DANS LE MONDE","NOW":"MAINTENANT","ART":"ART","THE WORLD":"LE MONDE","THE WEB":"LE RÉSEAU",
    "THE ARCHIVES":"LES ARCHIVES","THE CASE FILES":"LES DOSSIERS","HEART ON MY SLEEVE":"HEART ON MY SLEEVE","GLASS EYE":"ŒIL DE VERRE","ESCIE":"ESCIE",
    "SIGNAL // WAITING":"SIGNAL // EN ATTENTE","CURRENT SIGNAL":"SIGNAL ACTUEL","MONTRÉAL, QUÉBEC, CANADA":"MONTRÉAL, QUÉBEC, CANADA",
    "REALITY WITH THE SIGNAL DISTORTED.":"LA RÉALITÉ AVEC LE SIGNAL DÉFORMÉ.","THE SIGNAL REMAINS DISTORTED.":"LE SIGNAL RESTE DÉFORMÉ.",
    "WHERE LIFE BECOMES THE MEDIUM.":"LÀ OÙ LA VIE DEVIENT LE MÉDIUM.","BROAD STROKES AND FINE LINES — THE THINGS ESCIE MAKES FROM LIFE.":"GRANDS TRAITS ET LIGNES FINES — CE QU'ESCIE FAIT DE LA VIE.",
    "QUESTIONS, EVIDENCE, CONTRADICTIONS AND UNRESOLVED THREADS — FOLLOW WHAT THE RECORD CAN SUPPORT.":"QUESTIONS, PREUVES, CONTRADICTIONS ET FILS NON RÉSOLUS — SUIVEZ CE QUE LE REGISTRE PEUT ÉTABLIR.",
    "SEE · HEAR · FOLLOW · MISS · RETURN":"VOIR · ENTENDRE · SUIVRE · MANQUER · REVENIR"
  },
  es: {
    "OPEN INDEX":"ABRIR ÍNDICE","CLOSE INDEX":"CERRAR ÍNDICE","LANGUAGE":"IDIOMA","LIGHT MODE":"MODO CLARO","DARK MODE":"MODO OSCURO",
    "SKIP TO CONTENT":"IR AL CONTENIDO","ENTER THE WORLD":"ENTRAR AL MUNDO","NOW":"AHORA","ART":"ARTE","THE WORLD":"EL MUNDO","THE WEB":"LA RED",
    "THE ARCHIVES":"LOS ARCHIVOS","THE CASE FILES":"LOS EXPEDIENTES","HEART ON MY SLEEVE":"HEART ON MY SLEEVE","GLASS EYE":"OJO DE VIDRIO","ESCIE":"ESCIE",
    "SIGNAL // WAITING":"SEÑAL // ESPERANDO","CURRENT SIGNAL":"SEÑAL ACTUAL","MONTRÉAL, QUÉBEC, CANADÁ":"MONTRÉAL, QUÉBEC, CANADÁ",
    "REALITY WITH THE SIGNAL DISTORTED.":"LA REALIDAD CON LA SEÑAL DISTORSIONADA.","THE SIGNAL REMAINS DISTORTED.":"LA SEÑAL SIGUE DISTORSIONADA.",
    "WHERE LIFE BECOMES THE MEDIUM.":"DONDE LA VIDA SE CONVIERTE EN EL MEDIO.","BROAD STROKES AND FINE LINES — THE THINGS ESCIE MAKES FROM LIFE.":"TRAZOS AMPLIOS Y LÍNEAS FINAS — LO QUE ESCIE HACE CON LA VIDA.",
    "QUESTIONS, EVIDENCE, CONTRADICTIONS AND UNRESOLVED THREADS — FOLLOW WHAT THE RECORD CAN SUPPORT.":"PREGUNTAS, PRUEBAS, CONTRADICCIONES E HILOS SIN RESOLVER — SIGUE LO QUE EL REGISTRO PUEDE SOSTENER.",
    "SEE · HEAR · FOLLOW · MISS · RETURN":"VER · OÍR · SEGUIR · PERDER · VOLVER"
  }
});


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

  translate(text, language = "en") {
    const key = String(text == null ? "" : text);
    const table = ESCIE_INTERFACE_TRANSLATIONS[language] || ESCIE_INTERFACE_TRANSLATIONS.en;
    return this.speak(table[key] || key);
  },

  interfaceLabel(text, language = "en") {
    return this.translate(text, language);
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
window.ESCIE_INTERFACE_TRANSLATIONS = ESCIE_INTERFACE_TRANSLATIONS;
window.ESCIE_LANGUAGE = ESCIE_LANGUAGE;
window.ESCIE_LANGUAGE_ENGINE = ESCIE_LANGUAGE_ENGINE;