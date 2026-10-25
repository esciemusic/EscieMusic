/*
  ============================================================
  ESCIE NAVIGATION
  ============================================================

  Navigation describes the public destinations of the ESCIE
  experience.

  It does not describe every piece of content.

  Content belongs to the system.
  Navigation provides the doors into that system.
*/

const ESCIE_NAVIGATION = [

  {
    id: "entry",
    label: "ENTRY",
    target: "#entry",
    visible: true,
    primary: true,
    order: 1
  },

  {
    id: "now",
    label: "NOW",
    target: "#now",
    visible: true,
    primary: true,
    order: 2
  },

  {
    id: "art",
    label: "WORK",
    target: "#art",
    visible: true,
    primary: true,
    order: 3
  },

  {
    id: "web",
    label: "WEB",
    target: "#web",
    visible: true,
    primary: true,
    order: 4
  },

  {
    id: "archives",
    label: "ARCHIVE",
    target: "#archives",
    visible: true,
    primary: true,
    order: 5
  },

  {
    id: "investigation",
    label: "CASES",
    target: "#investigation",
    visible: true,
    primary: true,
    order: 6
  },

  {
    id: "escie",
    label: "ESCIE",
    target: "#escie",
    visible: true,
    primary: true,
    order: 7
  },

  {
    id: "glass-eye",
    label: "GLASS EYE",
    target: "#glass-eye",
    visible: true,
    primary: true,
    order: 8
  }

];


/*
  ============================================================
  NAVIGATION HELPERS
  ============================================================
*/

window.ESCIE_NAVIGATION = ESCIE_NAVIGATION;