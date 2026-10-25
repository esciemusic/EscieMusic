/* ESCIE VISUALS
 * Presentation layer. It reads visual metadata and safely binds public visual assets.
 * It never creates canon, publication state, or evidence.
 */
(function(){
 "use strict";

 const IMAGE_TYPES=["image","photo"];
 const VIDEO_TYPES=["video"];
 const HOSTS=["youtube.com","www.youtube.com","youtu.be","www.youtube-nocookie.com","youtube-nocookie.com","vimeo.com","player.vimeo.com"];
 const MEDIA_CLEANUPS=new WeakMap();
 let SECTION_OBSERVER=null;
 let RESIZE_HANDLER=null;

 function safeURL(value){
  if(typeof value!=="string"||!value.trim())return null;
  try{
   const u=new URL(value,window.location.href);
   if(!["http:","https:"].includes(u.protocol))return null;
   return u;
  }catch(e){return null;}
 }

 function safePoster(value){
  const u=safeURL(value);
  return u ? u.href : null;
 }

 function visualAsset(asset){
  if(typeof asset==="string") return {url:asset,type:"image"};
  if(!asset||typeof asset!=="object")return null;
  const url=safeURL(asset.url||asset.src||asset.href);
  if(!url)return null;
  const type=String(asset.type||asset.kind||"image").toLowerCase();
  if(!IMAGE_TYPES.includes(type)&&!VIDEO_TYPES.includes(type)&&type!=="iframe")return null;
  if(type==="iframe"&&!HOSTS.includes(url.hostname.toLowerCase()))return null;
  if(type==="iframe"&&url.username)return null;
  const poster=safePoster(asset.poster);
  return {url:url.href,type,alt:String(asset.alt||"").trim(),caption:String(asset.caption||"").trim(),poster};
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
   return '<iframe class="section-visual-media" src="'+escapeHTML(item.url)+'" title="ESCIE visual" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin" aria-hidden="true"></iframe>';
  }
  return '<img class="section-visual-media" src="'+escapeHTML(item.url)+'" alt="'+escapeHTML(item.alt)+'" loading="lazy" decoding="async">';
 }

 function escapeHTML(value){
  return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 }

 function reducedMotion(){return window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;}

 function observeMedia(el){
  const media=el.querySelector(".section-visual-media");
  if(!media||media.tagName!=="VIDEO")return;
  if(reducedMotion())return;
  if(!("IntersectionObserver" in window)){return;}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting&&!document.hidden){media.play().catch(()=>{});}else{media.pause();}
  }),{threshold:.15});
  observer.observe(el);
  const onVisibility=()=>{if(document.hidden)media.pause();else if(!reducedMotion()&&el.getBoundingClientRect().bottom>0&&el.getBoundingClientRect().top<window.innerHeight)media.play().catch(()=>{});};
  document.addEventListener("visibilitychange",onVisibility);
  MEDIA_CLEANUPS.set(el,()=>{
    observer.disconnect();
    document.removeEventListener("visibilitychange",onVisibility);
  });
}

 function init(){
  if(SECTION_OBSERVER){SECTION_OBSERVER.disconnect();SECTION_OBSERVER=null;}
  if(RESIZE_HANDLER){window.removeEventListener("resize",RESIZE_HANDLER);RESIZE_HANDLER=null;}
  document.querySelectorAll(".section-visual").forEach(el=>{

   const cleanup=MEDIA_CLEANUPS.get(el);
   if(cleanup)cleanup();
   el.querySelectorAll(".section-visual-media").forEach(media=>media.remove());
   el.classList.remove("has-visual-asset");
   delete el.dataset.visualMode;
   delete el.dataset.visualSymbols;
   el.style.removeProperty("--visual-intensity");
  });
  const visuals=Array.from(document.querySelectorAll(".section-visual"));
  const setActiveVisual=active=>{
   visuals.forEach(el=>el.classList.toggle("visual-active",el===active));
  };
  if("IntersectionObserver" in window){
   const visible=new Set();
   const chooseActive=()=>{
    let best=null;
    let bestScore=0;
    visuals.forEach(el=>{
     if(!visible.has(el))return;
     const rect=el.getBoundingClientRect();
     const top=Math.max(rect.top,0);
     const bottom=Math.min(rect.bottom,window.innerHeight);
     const height=Math.max(0,bottom-top);
     const width=Math.max(0,Math.min(rect.right,window.innerWidth)-Math.max(rect.left,0));
     const area=height*width;
     if(area<=0)return;
     const centerDistance=Math.abs((rect.top+rect.bottom)/2-window.innerHeight/2);
     const score=area/(1+centerDistance*.015);
     if(score>bestScore){bestScore=score;best=el;}
    });
    setActiveVisual(best);
   };
   SECTION_OBSERVER=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
     if(entry.isIntersecting)visible.add(entry.target);
     else visible.delete(entry.target);
    });
    chooseActive();
   },{threshold:[0,.2,.35,.5,.7,1],rootMargin:"-12% 0px -12% 0px"});
   visuals.forEach(el=>SECTION_OBSERVER.observe(el));
   RESIZE_HANDLER=chooseActive;
   window.addEventListener("resize",RESIZE_HANDLER,{passive:true});
  }else{
   setActiveVisual(visuals[0]||null);
  }

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
    observeMedia(el);
   }
  });
 }

 window.ESCIE_VISUALS_UI={init,renderAsset};
})();
