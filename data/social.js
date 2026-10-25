/* ESCIE SOCIAL / EXTERNAL PRESENCE
 *
 * Only confirmed official URLs belong here. The renderer consumes the
 * normalized public list; it never invents handles or destinations.
 */
const ESCIE_SOCIAL_PLATFORMS=["instagram","youtube","spotify","tiktok","facebook","x"];
const ESCIE_SOCIAL=[
  {id:"instagram",label:"INSTAGRAM",platform:"instagram",url:"",status:"unconfigured"},
  {id:"youtube",label:"YOUTUBE",platform:"youtube",url:"",status:"unconfigured"},
  {id:"spotify",label:"SPOTIFY",platform:"spotify",url:"",status:"unconfigured"},
  {id:"tiktok",label:"TIKTOK",platform:"tiktok",url:"",status:"unconfigured"},
  {id:"facebook",label:"FACEBOOK",platform:"facebook",url:"",status:"unconfigured"},
  {id:"x",label:"X",platform:"x",url:"",status:"unconfigured"}
];
function normalizeEscieSocial(items){
  if(!Array.isArray(items))return [];
  return items.map(item=>{
    if(!item||typeof item!=="object")return null;
    const platform=String(item.platform||item.id||"").toLowerCase().trim();
    const url=String(item.url||"").trim();
    if(!ESCIE_SOCIAL_PLATFORMS.includes(platform)||!/^https?:\\/\\//i.test(url))return null;
    try{
      const parsed=new URL(url);
      if(!["http:","https:"].includes(parsed.protocol))return null;
      return {id:String(item.id||platform),label:String(item.label||platform).trim(),platform,url:parsed.href,status:String(item.status||"active")};
    }catch(error){return null;}
  }).filter(Boolean);
}
if(typeof window!=="undefined"){
  window.ESCIE_SOCIAL=ESCIE_SOCIAL;
  window.ESCIE_SOCIAL_PLATFORMS=ESCIE_SOCIAL_PLATFORMS;
  window.normalizeEscieSocial=normalizeEscieSocial;
}
if(typeof module!=="undefined"&&module.exports)module.exports={ESCIE_SOCIAL,ESCIE_SOCIAL_PLATFORMS,normalizeEscieSocial};
