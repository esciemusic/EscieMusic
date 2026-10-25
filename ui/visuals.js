/* ESCIE VISUALS
 * Presentation layer. It reads visual metadata and safely binds public visual assets.
 * It never creates canon, publication state, or evidence.
 */
(function(){
 "use strict";

 const IMAGE_TYPES=["image","photo"];
 const VIDEO_TYPES=["video"];
 const HOSTS=["youtube.com","www.youtube.com","youtu.be","www.youtube-nocookie.com","youtube-nocookie.com","vimeo.com","player.vimeo.com"];

 function safeURL(value){
  if(typeof value!=="string"||!value.trim())return null;
  try{
   const u=new URL(value,window.location.href);
   if(!["http:","https:"].includes(u.protocol))return null;
   return u;
  }catch(e){return null;}
 }

 function visualAsset(asset){
  if(typeof asset==="string") return {url:asset,type:"image"};
  if(!asset||typeof asset!=="object")return null;
  const url=safeURL(asset.url||asset.src||asset.href);
  if(!url)return null;
  const type=String(asset.type||asset.kind||"image").toLowerCase();
  if(!IMAGE_TYPES.includes(type)&&!VIDEO_TYPES.includes(type)&&type!=="iframe")return null;
  if(type==="iframe"&&!HOSTS.includes(url.hostname.toLowerCase()))return null;
  return {url:url.href,type,alt:String(asset.alt||"").trim(),caption:String(asset.caption||"").trim(),poster:String(asset.poster||"").trim()};
 }

 function renderAsset(asset){
  const item=visualAsset(asset);
  if(!item)return "";
  if(item.type==="video"){
   return '<video class="section-visual-media" muted loop playsinline preload="metadata"'+
     (item.poster?' poster="'+escapeHTML(item.poster)+'"':'')+
     ' aria-hidden="true"><source src="'+escapeHTML(item.url)+'"></video>';
  }
  if(item.type==="iframe"){
   return '<iframe class="section-visual-media" src="'+escapeHTML(item.url)+'" title="ESCIE visual" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" aria-hidden="true"></iframe>';
  }
  return '<img class="section-visual-media" src="'+escapeHTML(item.url)+'" alt="'+escapeHTML(item.alt)+'" loading="lazy" decoding="async">';
 }

 function escapeHTML(value){
  return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 }

 function init(){
  const items=window.ESCIE_VISUALS||[];
  const normalized=typeof window.normalizeEscieVisuals==="function"?window.normalizeEscieVisuals(items):items;
  normalized.forEach(v=>{
   const el=Array.from(document.querySelectorAll(".section-visual")).find(node=>node.dataset.visualSection===v.section);
   if(!el)return;
   el.dataset.visualMode=v.mode;
   el.style.setProperty("--visual-intensity",String(v.intensity));
   if(v.symbols.length)el.dataset.visualSymbols=v.symbols.join(" ");
   const asset=renderAsset(v.asset);
   if(asset){
    el.insertAdjacentHTML("afterbegin",asset);
    el.classList.add("has-visual-asset");
   }
  });
 }

 window.ESCIE_VISUALS_UI={init,renderAsset};
})();
