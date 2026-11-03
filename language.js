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


function applyEscieInterfaceTranslations(language = "en") {
  const normalized = ["en","fr","es"].includes(String(language).toLowerCase()) ? String(language).toLowerCase() : "en";
  const table = ESCIE_INTERFACE_TRANSLATIONS[normalized] || ESCIE_INTERFACE_TRANSLATIONS.en;
  const ignored = new Set(["SCRIPT","STYLE","NOSCRIPT","TEXTAREA","INPUT","SELECT","OPTION"]);
  if (!document.body) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);
  nodes.forEach((textNode) => {
    if (!textNode.parentElement || ignored.has(textNode.parentElement.tagName)) return;
    const source = textNode.__escieI18nSource ?? textNode.nodeValue;
    if (!source || !source.trim()) return;
    textNode.__escieI18nSource = source;
    const key = source.trim();
    if (!table[key]) return;
    const startIndex = source.indexOf(key);
    textNode.nodeValue = source.slice(0,startIndex) + table[key] + source.slice(startIndex + key.length);
  });
  document.querySelectorAll("[aria-label],[title],[placeholder]").forEach((element) => {
    ["aria-label","title","placeholder"].forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;
      const source = element.dataset.escieI18nSource ?? element.getAttribute(attribute) ?? "";
      element.dataset.escieI18nSource = source;
      if (table[source]) element.setAttribute(attribute, table[source]);
    });
  });
}



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
  "en": {
    "OPEN INDEX": "OPEN INDEX",
    "CLOSE INDEX": "CLOSE INDEX",
    "LANGUAGE": "LANGUAGE",
    "LIGHT MODE": "LIGHT MODE",
    "DARK MODE": "DARK MODE",
    "SKIP TO CONTENT": "SKIP TO CONTENT",
    "ENTER THE WORLD": "ENTER THE WORLD",
    "NOW": "NOW",
    "ART": "ART",
    "THE WORLD": "THE WORLD",
    "THE WEB": "THE WEB",
    "THE ARCHIVES": "THE ARCHIVES",
    "THE CASE FILES": "THE CASE FILES",
    "HEART ON MY SLEEVE": "HEART ON MY SLEEVE",
    "GLASS EYE": "GLASS EYE",
    "ESCIE": "ESCIE",
    "SIGNAL // WAITING": "SIGNAL // WAITING",
    "CURRENT SIGNAL": "CURRENT SIGNAL",
    "MONTRÉAL, QUÉBEC, CANADA": "MONTRÉAL, QUÉBEC, CANADA",
    "REALITY WITH THE SIGNAL DISTORTED.": "REALITY WITH THE SIGNAL DISTORTED.",
    "THE SIGNAL REMAINS DISTORTED.": "THE SIGNAL REMAINS DISTORTED.",
    "WHERE LIFE BECOMES THE MEDIUM.": "WHERE LIFE BECOMES THE MEDIUM.",
    "BROAD STROKES AND FINE LINES — THE THINGS ESCIE MAKES FROM LIFE.": "BROAD STROKES AND FINE LINES — THE THINGS ESCIE MAKES FROM LIFE.",
    "QUESTIONS, EVIDENCE, CONTRADICTIONS AND UNRESOLVED THREADS — FOLLOW WHAT THE RECORD CAN SUPPORT.": "QUESTIONS, EVIDENCE, CONTRADICTIONS AND UNRESOLVED THREADS — FOLLOW WHAT THE RECORD CAN SUPPORT.",
    "SEE · HEAR · FOLLOW · MISS · RETURN": "SEE · HEAR · FOLLOW · MISS · RETURN",
    "CURRENT STATE": "CURRENT STATE",
    "OPEN TRANSMISSION": "OPEN TRANSMISSION",
    "LISTEN": "LISTEN",
    "AUDIO PENDING": "AUDIO PENDING",
    "ALL TYPES": "ALL TYPES",
    "ALL STATUS": "ALL STATUS",
    "ALL PROJECTS": "ALL PROJECTS",
    "ALL LOCATIONS": "ALL LOCATIONS",
    "ALL MOTIFS": "ALL MOTIFS",
    "ENTER CHECKOUT": "ENTER CHECKOUT",
    "OPEN THE STORE": "OPEN THE STORE",
    "THE WORLD YOU CAN OWN": "THE WORLD YOU CAN OWN",
    "CONNECTED": "CONNECTED",
    "UNCONNECTED": "UNCONNECTED",
    "CONNECTION": "CONNECTION",
    "PUBLIC": "PUBLIC",
    "PRIVATE": "PRIVATE",
    "WITHHELD": "WITHHELD",
    "LIMITED": "LIMITED",
    "UNTITLED": "UNTITLED",
    "ARCHIVE": "ARCHIVE",
    "RECORD": "RECORD",
    "UNPLACED": "UNPLACED",
    "COMMENT": "COMMENT",
    "THEORY": "THEORY",
    "FINDING": "FINDING",
    "MENTION": "MENTION",
    "ANONYMOUS": "ANONYMOUS",
    "OPTIONAL": "OPTIONAL",
    "SUBMISSION FAILED.": "SUBMISSION FAILED.",
    "RECEIVED. HELD FOR REVIEW — NOT CANON.": "RECEIVED. HELD FOR REVIEW — NOT CANON.",
    "NO PATH YET": "NO PATH YET",
    "NO CANON": "NO CANON",
    "NO CENTRAL HISTORY": "NO CENTRAL HISTORY",
    "THE ARCHIVE IS BEING PRESERVED. PUBLIC TRACES WILL APPEAR WHEN THEY ENTER THE ARCHIVE.": "THE ARCHIVE IS BEING PRESERVED. PUBLIC TRACES WILL APPEAR WHEN THEY ENTER THE ARCHIVE.",
    "ESCIE IS THE ARTIST. THE WORK SPEAKS FROM HERE.": "ESCIE IS THE ARTIST. THE WORK SPEAKS FROM HERE.",
    "THIS IS YOUR SIDE OF THE SCREEN.": "THIS IS YOUR SIDE OF THE SCREEN."
  },
  "fr": {
    "OPEN INDEX": "OUVRIR L'INDEX",
    "CLOSE INDEX": "FERMER L'INDEX",
    "LANGUAGE": "LANGUE",
    "LIGHT MODE": "MODE CLAIR",
    "DARK MODE": "MODE SOMBRE",
    "SKIP TO CONTENT": "ALLER AU CONTENU",
    "ENTER THE WORLD": "ENTRER DANS LE MONDE",
    "NOW": "MAINTENANT",
    "ART": "ART",
    "THE WORLD": "LE MONDE",
    "THE WEB": "LE RÉSEAU",
    "THE ARCHIVES": "LES ARCHIVES",
    "THE CASE FILES": "LES DOSSIERS",
    "HEART ON MY SLEEVE": "HEART ON MY SLEEVE",
    "GLASS EYE": "ŒIL DE VERRE",
    "ESCIE": "ESCIE",
    "SIGNAL // WAITING": "SIGNAL // EN ATTENTE",
    "CURRENT SIGNAL": "SIGNAL ACTUEL",
    "MONTRÉAL, QUÉBEC, CANADA": "MONTRÉAL, QUÉBEC, CANADA",
    "REALITY WITH THE SIGNAL DISTORTED.": "LA RÉALITÉ AVEC LE SIGNAL DÉFORMÉ.",
    "THE SIGNAL REMAINS DISTORTED.": "LE SIGNAL RESTE DÉFORMÉ.",
    "WHERE LIFE BECOMES THE MEDIUM.": "LÀ OÙ LA VIE DEVIENT LE MÉDIUM.",
    "BROAD STROKES AND FINE LINES — THE THINGS ESCIE MAKES FROM LIFE.": "GRANDS TRAITS ET LIGNES FINES — CE QU'ESCIE FAIT DE LA VIE.",
    "QUESTIONS, EVIDENCE, CONTRADICTIONS AND UNRESOLVED THREADS — FOLLOW WHAT THE RECORD CAN SUPPORT.": "QUESTIONS, PREUVES, CONTRADICTIONS ET FILS NON RÉSOLUS — SUIVEZ CE QUE LE REGISTRE PEUT ÉTABLIR.",
    "SEE · HEAR · FOLLOW · MISS · RETURN": "VOIR · ENTENDRE · SUIVRE · MANQUER · REVENIR",
    "CURRENT STATE": "ÉTAT ACTUEL",
    "OPEN TRANSMISSION": "OUVRIR LA TRANSMISSION",
    "LISTEN": "ÉCOUTER",
    "AUDIO PENDING": "AUDIO EN ATTENTE",
    "ALL TYPES": "TOUS LES TYPES",
    "ALL STATUS": "TOUS LES STATUTS",
    "ALL PROJECTS": "TOUS LES PROJETS",
    "ALL LOCATIONS": "TOUS LES LIEUX",
    "ALL MOTIFS": "TOUS LES MOTIFS",
    "ENTER CHECKOUT": "ACCÉDER AU PAIEMENT",
    "OPEN THE STORE": "OUVRIR LA BOUTIQUE",
    "THE WORLD YOU CAN OWN": "LE MONDE QUE VOUS POUVEZ POSSÉDER",
    "CONNECTED": "CONNECTÉ",
    "UNCONNECTED": "NON CONNECTÉ",
    "CONNECTION": "CONNEXION",
    "PUBLIC": "PUBLIC",
    "PRIVATE": "PRIVÉ",
    "WITHHELD": "RETENU",
    "LIMITED": "LIMITÉ",
    "UNTITLED": "SANS TITRE",
    "ARCHIVE": "ARCHIVE",
    "RECORD": "REGISTRE",
    "UNPLACED": "NON CLASSÉ",
    "COMMENT": "COMMENTAIRE",
    "THEORY": "THÉORIE",
    "FINDING": "DÉCOUVERTE",
    "MENTION": "MENTION",
    "ANONYMOUS": "ANONYME",
    "OPTIONAL": "OPTIONNEL",
    "SUBMISSION FAILED.": "ÉCHEC DE L’ENVOI.",
    "RECEIVED. HELD FOR REVIEW — NOT CANON.": "REÇU. EN ATTENTE DE RÉVISION — NON CANONIQUE.",
    "NO PATH YET": "AUCUN PARCOURS POUR L’INSTANT",
    "NO CANON": "AUCUN CANON",
    "NO CENTRAL HISTORY": "AUCUN HISTORIQUE CENTRAL",
    "THE ARCHIVE IS BEING PRESERVED. PUBLIC TRACES WILL APPEAR WHEN THEY ENTER THE ARCHIVE.": "L’ARCHIVE EST PRÉSERVÉE. LES TRACES PUBLIQUES APPARAÎTRONT LORSQU’ELLES ENTRERONT DANS L’ARCHIVE.",
    "ESCIE IS THE ARTIST. THE WORK SPEAKS FROM HERE.": "ESCIE EST L’ARTISTE. L’ŒUVRE PARLE D’ICI.",
    "THIS IS YOUR SIDE OF THE SCREEN.": "C’EST VOTRE CÔTÉ DE L’ÉCRAN."
  },
  "es": {
    "OPEN INDEX": "ABRIR ÍNDICE",
    "CLOSE INDEX": "CERRAR ÍNDICE",
    "LANGUAGE": "IDIOMA",
    "LIGHT MODE": "MODO CLARO",
    "DARK MODE": "MODO OSCURO",
    "SKIP TO CONTENT": "IR AL CONTENIDO",
    "ENTER THE WORLD": "ENTRAR AL MUNDO",
    "NOW": "AHORA",
    "ART": "ARTE",
    "THE WORLD": "EL MUNDO",
    "THE WEB": "LA RED",
    "THE ARCHIVES": "LOS ARCHIVOS",
    "THE CASE FILES": "LOS EXPEDIENTES",
    "HEART ON MY SLEEVE": "HEART ON MY SLEEVE",
    "GLASS EYE": "OJO DE VIDRIO",
    "ESCIE": "ESCIE",
    "SIGNAL // WAITING": "SEÑAL // ESPERANDO",
    "CURRENT SIGNAL": "SEÑAL ACTUAL",
    "MONTRÉAL, QUÉBEC, CANADA": "MONTRÉAL, QUÉBEC, CANADÁ",
    "REALITY WITH THE SIGNAL DISTORTED.": "LA REALIDAD CON LA SEÑAL DISTORSIONADA.",
    "THE SIGNAL REMAINS DISTORTED.": "LA SEÑAL SIGUE DISTORSIONADA.",
    "WHERE LIFE BECOMES THE MEDIUM.": "DONDE LA VIDA SE CONVIERTE EN EL MEDIO.",
    "BROAD STROKES AND FINE LINES — THE THINGS ESCIE MAKES FROM LIFE.": "TRAZOS AMPLIOS Y LÍNEAS FINAS — LO QUE ESCIE HACE CON LA VIDA.",
    "QUESTIONS, EVIDENCE, CONTRADICTIONS AND UNRESOLVED THREADS — FOLLOW WHAT THE RECORD CAN SUPPORT.": "PREGUNTAS, PRUEBAS, CONTRADICCIONES E HILOS SIN RESOLVER — SIGUE LO QUE EL REGISTRO PUEDE SOSTENER.",
    "SEE · HEAR · FOLLOW · MISS · RETURN": "VER · OÍR · SEGUIR · PERDER · VOLVER",
    "CURRENT STATE": "ESTADO ACTUAL",
    "OPEN TRANSMISSION": "ABRIR LA TRANSMISIÓN",
    "LISTEN": "ESCUCHAR",
    "AUDIO PENDING": "AUDIO PENDIENTE",
    "ALL TYPES": "TODOS LOS TIPOS",
    "ALL STATUS": "TODOS LOS ESTADOS",
    "ALL PROJECTS": "TODOS LOS PROYECTOS",
    "ALL LOCATIONS": "TODAS LAS UBICACIONES",
    "ALL MOTIFS": "TODOS LOS MOTIVOS",
    "ENTER CHECKOUT": "ENTRAR AL PAGO",
    "OPEN THE STORE": "ABRIR LA TIENDA",
    "THE WORLD YOU CAN OWN": "EL MUNDO QUE PUEDES POSEER",
    "CONNECTED": "CONECTADO",
    "UNCONNECTED": "NO CONECTADO",
    "CONNECTION": "CONEXIÓN",
    "PUBLIC": "PÚBLICO",
    "PRIVATE": "PRIVADO",
    "WITHHELD": "RESERVADO",
    "LIMITED": "LIMITADO",
    "UNTITLED": "SIN TÍTULO",
    "ARCHIVE": "ARCHIVO",
    "RECORD": "REGISTRO",
    "UNPLACED": "SIN UBICAR",
    "COMMENT": "COMENTARIO",
    "THEORY": "TEORÍA",
    "FINDING": "HALLAZGO",
    "MENTION": "MENCIÓN",
    "ANONYMOUS": "ANÓNIMO",
    "OPTIONAL": "OPCIONAL",
    "SUBMISSION FAILED.": "ENVÍO FALLIDO.",
    "RECEIVED. HELD FOR REVIEW — NOT CANON.": "RECIBIDO. EN REVISIÓN — NO ES CANON.",
    "NO PATH YET": "AÚN NO HAY RECORRIDO",
    "NO CANON": "SIN CANON",
    "NO CENTRAL HISTORY": "SIN HISTORIAL CENTRAL",
    "THE ARCHIVE IS BEING PRESERVED. PUBLIC TRACES WILL APPEAR WHEN THEY ENTER THE ARCHIVE.": "EL ARCHIVO SE ESTÁ CONSERVANDO. LAS HUELLAS PÚBLICAS APARECERÁN CUANDO ENTREN EN EL ARCHIVO.",
    "ESCIE IS THE ARTIST. THE WORK SPEAKS FROM HERE.": "ESCIE ES EL ARTISTA. LA OBRA HABLA DESDE AQUÍ.",
    "THIS IS YOUR SIDE OF THE SCREEN.": "ESTE ES TU LADO DE LA PANTALLA."
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

  setLanguage(language) {
    const normalized = ["en","fr","es"].includes(String(language || "").toLowerCase()) ? String(language).toLowerCase() : "en";
    if (window.ESCIE_STATE) window.ESCIE_STATE.language = normalized;
    document.documentElement.lang = normalized;
    try { localStorage.setItem("escie-language", normalized); } catch (error) {}
    document.querySelectorAll("[data-language]").forEach(button => {
      const active = button.getAttribute("data-language") === normalized;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    const events = window.ESCIE_EVENTS;
    if (events && typeof events.emit === "function") events.emit("language:changed", { language: normalized });
    if (typeof applyEscieInterfaceTranslations === "function") {
      applyEscieInterfaceTranslations(normalized);
      Promise.resolve().then(() => applyEscieInterfaceTranslations(normalized));
    }
    return normalized;
  },

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
window.applyEscieInterfaceTranslations = applyEscieInterfaceTranslations;
window.ESCIE_LANGUAGE = ESCIE_LANGUAGE;
window.ESCIE_LANGUAGE_ENGINE = ESCIE_LANGUAGE_ENGINE;