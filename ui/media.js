/*
 * ESCIE UI — MEDIA EMBEDS
 *
 * Presentation-only renderer for already-public media.
 * It never decides whether material is public; callers must pass a public
 * record. External iframe providers are allowlisted and all URLs are
 * validated before insertion.
 */
(function(){
  "use strict";

  const IFRAME_HOSTS=[
    "youtube.com","www.youtube.com","youtu.be","www.youtube-nocookie.com",
    "youtube-nocookie.com","vimeo.com","player.vimeo.com",
    "soundcloud.com","w.soundcloud.com","open.spotify.com"
  ];

  const AUDIO_EXT=/\.(mp3|m4a|aac|wav|ogg|oga|flac)(?:$|[?#])/i;
  const VIDEO_EXT=/\.(mp4|webm|mov|m4v|ogv)(?:$|[?#])/i;

  function esc(value){
    return String(value==null?"":value)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
      .replace(/'/g,"&#39;");
  }

  function normalize(item){
    if(!item) return null;
    if(typeof item==="string") return {url:item};
    if(typeof item!=="object") return null;
    return Object.assign({},item,{url:item.url||item.src||item.href||item.embed||null});
  }

  function safeURL(value){
    if(!value) return null;
    try{
      const raw=String(value).trim();
      if(!raw) return null;
      if(raw.startsWith("/")&&!raw.startsWith("//")) return raw;
      const url=new URL(raw,window.location.href);
      if(!["http:","https:"].includes(url.protocol)) return null;
      return url;
    }catch(error){ return null; }
  }

  function hostAllowed(url){
    const host=String(url.hostname||"").toLowerCase();
    return IFRAME_HOSTS.some(allowed=>host===allowed||host.endsWith("."+allowed));
  }

  function embedURL(url){
    const host=String(url.hostname||"").toLowerCase();
    const path=url.pathname||"";
    if(host==="youtu.be"){
      const id=path.replace(/^\//,"").split("/")[0];
      return id?"https://www.youtube-nocookie.com/embed/"+encodeURIComponent(id)+"?rel=0":null;
    }
    if(host==="youtube.com"||host==="www.youtube.com"||host==="youtube-nocookie.com"||host==="www.youtube-nocookie.com"){
      const shorts=path.match(/^\/shorts\/([^/]+)/i);
      const watch=url.searchParams.get("v");
      const embedded=(path.match(/^\/embed\/([^/]+)/i)||[])[1];
      const id=shorts?shorts[1]:(embedded||watch);
      return id?"https://www.youtube-nocookie.com/embed/"+encodeURIComponent(id)+"?rel=0":null;
    }
    if(host==="vimeo.com"){
      const id=(path.match(/\/([0-9]+)$/)||[])[1];
      return id?"https://player.vimeo.com/video/"+id:null;
    }
    if(host==="player.vimeo.com") return url.href;
    if(host==="open.spotify.com"){
      const match=path.match(/^\/(track|album|playlist|episode|show)\/([^/]+)/i);
      return match?"https://open.spotify.com/embed/"+match[1]+"/"+encodeURIComponent(match[2]):url.href;
    }
    if(host==="soundcloud.com"){
      return "https://w.soundcloud.com/player/?url="+encodeURIComponent(url.href)+"&auto_play=false&hide_related=true&show_comments=false";
    }
    return url.href;
  }

  function kind(item,url){
    const declared=String(item.type||item.kind||"").toLowerCase();
    if(declared==="audio"||declared==="video") return declared;
    if(declared==="iframe"||declared==="embed") return "iframe";
    if(hostAllowed(url)) return "iframe";
    if(VIDEO_EXT.test(url.href)) return "video";
    if(AUDIO_EXT.test(url.href)) return "audio";
    return null;
  }

  function render(item,index){
    const media=normalize(item);
    if(!media) return "";
    const url=safeURL(media.url);
    if(!url) return "";

    const mediaKind=kind(media,url);
    if(!mediaKind) return "";

    const title=esc(media.title||media.caption||"MEDIA");
    const caption=media.caption?'<p class="media-caption">'+esc(media.caption)+'</p>':"";
    const label=media.label?'<span class="media-label">'+esc(media.label)+'</span>':"";

    if(mediaKind==="audio"){
      return '<figure class="escie-media escie-media-audio" data-media-index="'+index+'">'+
        label+'<audio controls preload="metadata" src="'+esc(url.href)+'">'+
        '<span>'+title+'</span></audio>'+caption+'</figure>';
    }

    if(mediaKind==="video"){
      const poster=media.poster?safeURL(media.poster):null;
      return '<figure class="escie-media escie-media-video" data-media-index="'+index+'">'+
        label+'<video controls preload="metadata" playsinline '+(poster?'poster="'+esc(poster.href)+'"':"")+' src="'+esc(url.href)+'">'+
        '<span>'+title+'</span></video>'+caption+'</figure>';
    }

    if(mediaKind==="iframe"){
      if(!hostAllowed(url)) return "";
      const embed=embedURL(url);
      if(!embed) return "";
      const allow=String(media.allow||"fullscreen; picture-in-picture").replace(/[^a-zA-Z0-9;= _-]/g,"");
      return '<figure class="escie-media escie-media-embed" data-media-index="'+index+'">'+
        label+'<iframe src="'+esc(embed)+'" title="'+title+'" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="'+esc(allow)+'" allowfullscreen></iframe>'+
        caption+'</figure>';
    }

    return "";
  }

  function renderAll(items){
    if(!Array.isArray(items)) return "";
    const output=items.map(render).filter(Boolean);
    return output.length?'<div class="escie-media-stack">'+output.join("")+"</div>":"";
  }

  function countPlayable(items){
    return Array.isArray(items)?items.map(normalize).filter(item=>{
      const url=item&&safeURL(item.url);
      return url&&kind(item,url);
    }).length:0;
  }

  window.ESCIE_MEDIA={
    render:render,
    renderAll:renderAll,
    countPlayable:countPlayable,
    normalize:normalize,
    safeURL:safeURL,
    iframeHosts:IFRAME_HOSTS.slice()
  };
  if(typeof module!=="undefined"&&module.exports) module.exports={render,renderAll,countPlayable,normalize,safeURL,iframeHosts:IFRAME_HOSTS.slice()};
})();
