/* ESCIE GLASS EYE PRIMARY VIDEO
 * Public configuration only.
 * The URL is intentionally empty until an artist-approved YouTube video is selected.
 */
(function(root){
  "use strict";
  const CONFIG={
    provider:"youtube",
    url:"",
    title:"Glass Eye primary YouTube window"
  };
  root.ESCIE_GLASS_EYE_VIDEO=CONFIG;
  if(typeof module!=="undefined"&&module.exports)module.exports=CONFIG;
})(typeof window!=="undefined"?window:globalThis);
