/*
 * ESCIE TESTS — MEDIA EMBEDS
 */
(function(){
  "use strict";
  function assert(condition,message){if(!condition)throw new Error(message);}
  function run(){
    const media=typeof window!=="undefined"?window.ESCIE_MEDIA:null;
    if(!media)return {skipped:true,reason:"media renderer unavailable"};
    assert(media.safeURL("https://example.com/a.mp3"),"https media should be accepted");
    assert(media.safeURL("javascript:alert(1)")==null,"javascript media must be rejected");
    assert(media.kind({type:"image"},new URL("https://example.com/a.jpg"))==="image","images should resolve to image media");
    assert(media.countPlayable([
      {type:"audio",url:"https://example.com/a.mp3"},
      {type:"video",url:"https://example.com/a.mp4"},
      {type:"iframe",url:"https://www.youtube.com/watch?v=test"},
      {type:"iframe",url:"https://evil.example/embed"}
    ])===3,"only supported public media should be counted");
    assert(media.renderAll([{type:"image",url:"https://example.com/a.jpg",alt:"TEST"}]).includes("<img"),"images should render as native images");
    assert(media.renderAll([{type:"audio",url:"https://example.com/a.mp3"}]).includes("<audio"),"audio should render as native audio");
    assert(media.renderAll([{type:"video",url:"https://example.com/a.mp4"}]).includes("<video"),"video should render as native video");
    assert(media.renderAll([{type:"iframe",url:"https://www.youtube.com/watch?v=test"}]).includes("<iframe"),"YouTube should render as iframe");
    assert(media.renderAll([{type:"iframe",url:"https://evil.example/embed"}])==="","unapproved iframe host must render nothing");
    return {passed:true};
  }
  if(typeof window!=="undefined")window.ESCIE_TEST_MEDIA={run};
  if(typeof module!=="undefined"&&module.exports)module.exports={run};
})();
