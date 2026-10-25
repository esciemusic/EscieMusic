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
 let MEDIA_QUERY=null;
 let MEDIA_QUERY_HANDLER=null;
 let FOCUS_REFRESH=null;
 let POINTER_HANDLER=null;

 
 function chooseVisualFocus(items,viewportWidth,viewportHeight){
  if(!Array.isArray(items)||!items.length)return -1;
  const vw=Math.max(0,Number(viewportWidth)||0);
  const vh=Math.max(0,Number(viewportHeight)||0);
  const center=vh*.5;
  let best=-1,bestScore=0;
  items.forEach((rect,index)=>{
   if(!rect||!Number.isFinite(rect.top)||!Number.isFinite(rect.bottom)||!Number.isFinite(rect.left)||!Number.isFinite(rect.right))return;
   const top=Math.max(rect.top,0),bottom=Math.min(rect.bottom,vh);
   const left=Math.max(rect.left,0),right=Math.min(rect.right,vw);
   const area=Math.max(0,bottom-top)*Math.max(0,right-left);
   const fullArea=Math.max(1,Math.max(0,rect.bottom-rect.top)*Math.max(0,rect.right-rect.left));
   if(area<=0)return;
   const ratio=area/fullArea;
   const distance=Math.abs((rect.top+rect.bottom)*.5-center);
   const score=ratio/(1+distance*.02);
   if(score>bestScore){bestScore=score;best=index;}
  });
  return best;
 }

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
  if(MEDIA_QUERY&&MEDIA_QUERY_HANDLER){
   MEDIA_QUERY.removeEventListener ? MEDIA_QUERY.removeEventListener("change",MEDIA_QUERY_HANDLER) : MEDIA_QUERY.removeListener(MEDIA_QUERY_HANDLER);
   MEDIA_QUERY=null;MEDIA_QUERY_HANDLER=null;
  }
  FOCUS_REFRESH=null;
  if(POINTER_HANDLER){
   window.removeEventListener("pointermove",POINTER_HANDLER);
   POINTER_HANDLER=null;
  }
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
    const visibleElements=visuals.filter(el=>visible.has(el));
    const winner=chooseVisualFocus(
     visibleElements.map(el=>el.getBoundingClientRect()),
     window.innerWidth,
     window.innerHeight
    );
    const active=winner>=0 ? visibleElements[winner] : null;
    visuals.forEach(el=>el.classList.toggle("visitor-present",el===active));
    setActiveVisual(active);
   };
   SECTION_OBSERVER=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
     if(entry.isIntersecting)visible.add(entry.target);
     else visible.delete(entry.target);
    });
    chooseActive();
   },{threshold:[0,.2,.35,.5,.7,1],rootMargin:"-12% 0px -12% 0px"});
   visuals.forEach(el=>SECTION_OBSERVER.observe(el));
   FOCUS_REFRESH=chooseActive;
   RESIZE_HANDLER=chooseActive;
   window.addEventListener("resize",RESIZE_HANDLER,{passive:true});
   chooseActive();
  }else{
   setActiveVisual(visuals[0]||null);
  }

  MEDIA_QUERY=window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  if(MEDIA_QUERY){
   MEDIA_QUERY_HANDLER=()=>{
    if(MEDIA_QUERY.matches) visuals.forEach(el=>{el.classList.remove("visual-active");el.classList.remove("visitor-present");});
    else if(FOCUS_REFRESH) FOCUS_REFRESH();
   };
   if(MEDIA_QUERY.addEventListener) MEDIA_QUERY.addEventListener("change",MEDIA_QUERY_HANDLER);
   else if(MEDIA_QUERY.addListener) MEDIA_QUERY.addListener(MEDIA_QUERY_HANDLER);
  }

  if(!reducedMotion() && window.matchMedia && window.matchMedia("(pointer:fine)").matches){
   let pointerFrame=0;
   let pointerX=0;
   let pointerY=0;
   const applyPointer=()=>{
    pointerFrame=0;
    visuals.forEach(el=>{
     if(!el.classList.contains("visual-active") && !el.classList.contains("visual-visible")) return;
     const depth=el.classList.contains("visual-active") ? 1 : .42;
     el.style.setProperty("--pointer-x",(pointerX*10*depth).toFixed(3)+"px");
     el.style.setProperty("--pointer-y",(pointerY*7*depth).toFixed(3)+"px");
     el.style.setProperty("--pointer-rotate",(pointerX*0.35*depth).toFixed(3)+"deg");
    });
   };
   POINTER_HANDLER=event=>{
    pointerX=event.clientX/window.innerWidth-.5;
    pointerY=event.clientY/window.innerHeight-.5;
    if(!pointerFrame) pointerFrame=window.requestAnimationFrame(applyPointer);
   };
   window.addEventListener("pointermove",POINTER_HANDLER,{passive:true});
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

 window.ESCIE_VISUALS_UI={init,renderAsset,chooseVisualFocus};
 if(typeof module!=="undefined"&&module.exports)module.exports={chooseVisualFocus};
})();
