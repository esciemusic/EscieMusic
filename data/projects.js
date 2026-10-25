/* ESCIE PUBLIC PROJECT REGISTRY
 * Only transmitted projects belong here.
 * Unreleased project metadata is injected only during the private Pages build.
 */
const ESCIE_PROJECTS=[];
if(typeof window!=="undefined") window.ESCIE_PROJECTS=ESCIE_PROJECTS;
if(typeof module!=="undefined"&&module.exports) module.exports=ESCIE_PROJECTS;
