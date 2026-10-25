/*
 * ESCIE PROJECT REGISTRY
 *
 * Projects are bodies of work.
 * A project groups existing records; it does not manufacture them.
 *
 * Project metadata may describe presentation and editorial structure.
 * Individual works belong in the appropriate record registry.
 */

const ESCIE_PROJECTS = [
  {
    id: "bam-by-any-means",
    artist: "ESCIE",
    title: "BAM: BY ANY MEANS",
    type: "project",
    status: "development",
    published: false,

    description:
      "ESCIE's debut project and first transmission.",

    questions: [
      "WHO MADE HIM?",
      "WHAT DID HE BECOME?",
      "WHAT WILL HE MAKE?"
    ],

    structure: [
      { number: "001", title: "DALLAS '63", role: "THE MYTH" },
      { number: "002", title: "NO SHADE", role: "THE MONSTER" },
      { number: "003", title: "I NEED A FLEX", role: "THE FATHER" },
      { number: "004", title: "BACC 2 BASICS", role: "THE TRAP" },
      { number: "005", title: "SANA, SANA, COLITA DE RANA", role: "THE INHERITANCE" },
      { number: "006", title: "PUMPY TO THE CHEST", role: "THE CONSEQUENCE" },
      { number: "007", title: "LOADING THE CLIP", role: "THE EVIDENCE" },
      { number: "008", title: "DICHOTOMY", role: "THE HUMAN" }
    ]
  }
];

if (typeof window !== "undefined") {
  window.ESCIE_PROJECTS = ESCIE_PROJECTS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ESCIE_PROJECTS;
}
