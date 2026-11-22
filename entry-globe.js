/* ESCIE — first-contact World globe */
(function(){
  "use strict";
  function init(){
    var globe=document.querySelector(".entry-world-globe .world-globe");
    if(!globe || globe.dataset.ready==="1") return;
    globe.dataset.ready="1";

    var down=false,startX=0,startY=0,lastTime=0,frame=0;
    var ry=0,rx=0,vy=0,vx=0,attentive=false;
    var meridians=[].slice.call(globe.querySelectorAll(".entry-globe-meridian"));
    var latitudes=[].slice.call(globe.querySelectorAll(".entry-globe-latitude"));
    var points=[].slice.call(globe.querySelectorAll(".entry-globe-point"));
    var home=globe.querySelector(".entry-globe-home");
    var pointData={
      home:[0.08,0.48],
      music:[-0.62,0.26],
      archive:[0.96,-0.22],
      case:[-1.18,-0.30],
      glass:[1.12,0.27]
    };

    function projectPoint(el,lon,lat){
      var pitch=rx*Math.PI/180, yaw=ry*Math.PI/180;
      var cl=Math.cos(lat), x=cl*Math.sin(lon+yaw), z=cl*Math.cos(lon+yaw), y=Math.sin(lat);
      var py=y*Math.cos(pitch)-z*Math.sin(pitch);
      var pz=y*Math.sin(pitch)+z*Math.cos(pitch);
      var px=x;
      var visible=(pz>-0.05);
      el.style.left=(50+px*43)+"%";
      el.style.top=(50-py*43)+"%";
      el.style.opacity=visible?(pz>.2?".95":".48"):".12";
      el.style.transform="translate(-50%,-50%) scale("+(visible?(0.88+Math.max(0,pz)*.32):".72")+")";
      el.style.filter=visible?"drop-shadow(0 0 7px rgba(255,255,255,"+(0.12+Math.max(0,pz)*.3)+"))":"none";
      return {x:px,y:py,z:pz};
    }

    function apply(){
      globe.style.animation="none";
      meridians.forEach(function(el,i){
        var base=[0,Math.PI/2,-Math.PI/2,Math.PI/4,-Math.PI/4][i]||0;
        var a=base+ry*Math.PI/180;
        var width=Math.max(.08,Math.abs(Math.cos(a)));
        el.style.transform="rotateY("+(Math.sin(a)*8)+"deg) scaleX("+width.toFixed(3)+")";
        el.style.opacity=(0.18+width*.18).toFixed(2);
      });
      latitudes.forEach(function(el,i){
        var tilt=[62,62,-62,-62][i]||62;
        var latitude=[.65,.22,-.22,-.65][i]||0;
        var pitch=rx*Math.PI/180;
        var scale=Math.max(.48,.82-Math.abs(Math.sin(latitude)*Math.sin(pitch))*.22);
        var lift=Math.sin(latitude)*Math.sin(pitch)*36;
        el.style.top=(50-lift)+"%";
        el.style.transform="rotateX("+tilt+"deg) scaleX("+scale.toFixed(3)+")";
        el.style.opacity=(0.12+Math.max(0,.26-Math.abs(Math.sin(latitude)*Math.sin(pitch))*.18)).toFixed(2);
      });
      points.forEach(function(el){
        var key=[].slice.call(el.classList).find(function(c){return pointData[c];});
        if(key)projectPoint(el,pointData[key][0],pointData[key][1]);
      });
      if(home){
        var p=projectPoint(home,pointData.home[0],pointData.home[1]);
        home.style.width="7px";home.style.height="7px";
        home.style.opacity=p.z>.05?"1":".18";
      }
      globe.style.setProperty("--globe-yaw",ry+"deg");
      globe.style.setProperty("--globe-pitch",rx+"deg");
      globe.style.setProperty("--globe-light-x",(34+Math.sin(ry*Math.PI/180)*10).toFixed(2)+"%");
      globe.style.setProperty("--globe-light-y",(27+Math.sin(rx*Math.PI/180)*8).toFixed(2)+"%");
    }

    function stop(e){
      down=false;
      try{if(e)globe.releasePointerCapture(e.pointerId);}catch(_){}
      globe.classList.remove("is-dragging");
      if(Math.abs(vy)>0.05 || Math.abs(vx)>0.05)startInertia();
    }

    function startInertia(){
      cancelAnimationFrame(frame);
      var last=performance.now();
      function step(now){
        var dt=Math.min(32,now-last);last=now;
        if(down)return;
        ry+=vy*(dt/16);rx+=vx*(dt/16);
        vy*=Math.pow(.94,dt/16);vx*=Math.pow(.94,dt/16);
        apply();
        if(Math.abs(vy)>0.05 || Math.abs(vx)>0.05)frame=requestAnimationFrame(step);
        else {vy=0;vx=0;startAutomatic();}
      }
      frame=requestAnimationFrame(step);
    }

    function startAutomatic(){
      cancelAnimationFrame(frame);
      var last=performance.now();
      function step(now){
        var dt=Math.min(40,now-last);last=now;
        if(down)return;
        ry+=(attentive?0.0035:0.012)*dt;
        apply();
        frame=requestAnimationFrame(step);
      }
      frame=requestAnimationFrame(step);
    }

    globe.addEventListener("pointerenter",function(){attentive=true;});
    globe.addEventListener("pointerleave",function(){if(!down)attentive=false;});
    globe.addEventListener("focusin",function(){attentive=true;});
    globe.addEventListener("focusout",function(){attentive=false;});

    globe.addEventListener("pointerdown",function(e){
      if(e.target.closest("a")) return;
      cancelAnimationFrame(frame);vy=0;vx=0;down=true;
      startX=e.clientX;startY=e.clientY;lastTime=performance.now();
      try{globe.setPointerCapture(e.pointerId);}catch(_){}
      globe.classList.add("is-dragging");
      e.preventDefault();
    });

    globe.addEventListener("pointermove",function(e){
      if(!down)return;
      var now=performance.now(),dt=Math.max(8,now-lastTime);
      var dx=e.clientX-startX,dy=e.clientY-startY;
      ry+=dx*.35;rx-=dy*.2;
      vy=(-dy*.2)/(dt/16);vx=(dx*.35)/(dt/16);
      startX=e.clientX;startY=e.clientY;lastTime=now;
      apply();
    });

    globe.addEventListener("pointerup",stop);
    globe.addEventListener("pointercancel",stop);

    function reset(){
      cancelAnimationFrame(frame);vy=0;vx=0;rx=0;ry=0;apply();startAutomatic();
    }

    globe.addEventListener("dblclick",reset);
    globe.addEventListener("keydown",function(e){
      if(e.key==="Escape"){reset();globe.focus();}
      if(e.key==="ArrowRight" || e.key==="ArrowLeft"){
        cancelAnimationFrame(frame);vy=0;vx=0;e.preventDefault();
        ry+=e.key==="ArrowRight"?18:-18;apply();
      }
    });

    apply();
    startAutomatic();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();