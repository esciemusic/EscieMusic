/* ESCIE SOCIAL / EXTERNAL PRESENCE
 *
 * Only confirmed URLs belong here. Empty entries remain invisible until
 * an official account is supplied; the UI never invents handles.
 */
const ESCIE_SOCIAL=[
  {id:"instagram",label:"INSTAGRAM",platform:"instagram",url:"",status:"unconfigured"},
  {id:"youtube",label:"YOUTUBE",platform:"youtube",url:"",status:"unconfigured"},
  {id:"spotify",label:"SPOTIFY",platform:"spotify",url:"",status:"unconfigured"},
  {id:"tiktok",label:"TIKTOK",platform:"tiktok",url:"",status:"unconfigured"},
  {id:"facebook",label:"FACEBOOK",platform:"facebook",url:"",status:"unconfigured"},
  {id:"x",label:"X",platform:"x",url:"",status:"unconfigured"}
];
if(typeof window!=="undefined")window.ESCIE_SOCIAL=ESCIE_SOCIAL;
if(typeof module!=="undefined"&&module.exports)module.exports=ESCIE_SOCIAL;
