// Viewer state is local and non-canonical.
// Site-wide language selection is owned by the main ESCIE site, not Glass Eye.
export const VIEWER_STATE_VERSION = 1;
export const VIEWER_STATE_KEYS = Object.freeze([
  'theme','path','viewed','dismissed','draft'
]);
