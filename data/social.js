/* ESCIE SOCIAL / EXTERNAL PRESENCE
 *
 * Only confirmed official URLs belong here. Empty entries remain invisible.
 * This registry is identity-level external presence, not record canon.
 */
const ESCIE_SOCIAL_HOSTS={
  instagram:["instagram.com","www.instagram.com"],
  youtube:["youtube.com","www.youtube.com","youtu.be","www.youtu.be"],
  spotify:["open.spotify.com"],
  tiktok:["tiktok.com","www.tiktok.com"],
  facebook:["facebook.com","www.facebook.com","m.facebook.com"],
  x:["x.com","www.x.com","twitter.com","www.twitter.com"]
};
const ESCIE_SOCIAL_PLATFORMS=Object.keys(ESCIE_SOCIAL_HOSTS);
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
      const host=parsed.hostname.toLowerCase();
      const allowed=ESCIE_SOCIAL_HOSTS[platform]||[];
      if(!["http:","https:"].includes(parsed.protocol)||!allowed.includes(host))return null;
      return {id:String(item.id||platform),label:String(item.label||platform).trim(),platform,url:parsed.href,status:String(item.status||"active")};
    }catch(error){return null;}
  }).filter(Boolean);
}
function auditEscieSocial(items){
  const normalized=normalizeEscieSocial(items);
  const source=Array.isArray(items)?items:[];
  return {
    configured:normalized.length,
    rejected:Math.max(0,source.filter(item=>item&&item.url).length-normalized.length),
    platforms:normalized.map(item=>item.platform),
    ok:normalized.every(item=>ESCIE_SOCIAL_PLATFORMS.includes(item.platform))
  };
}
if(typeof window!=="undefined"){
  window.ESCIE_SOCIAL=ESCIE_SOCIAL;
  window.ESCIE_SOCIAL_HOSTS=ESCIE_SOCIAL_HOSTS;
  window.ESCIE_SOCIAL_PLATFORMS=ESCIE_SOCIAL_PLATFORMS;
  window.normalizeEscieSocial=normalizeEscieSocial;
  window.auditEscieSocial=auditEscieSocial;
}
if(typeof module!=="undefined"&&module.exports)module.exports={ESCIE_SOCIAL,ESCIE_SOCIAL_HOSTS,ESCIE_SOCIAL_PLATFORMS,normalizeEscieSocial,auditEscieSocial};
