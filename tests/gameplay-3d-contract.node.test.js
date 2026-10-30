const fs=require("fs");
const path=require("path");
const ROOT=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const assert=(v,m)=>{if(!v)throw new Error(m);};

const html=read("world/index.html");
const runtime=read("world/3d-reality.js");

assert(html.includes('id="world-pause"'),"3D world must retain the map/pause system view");
assert(html.includes('class="world-pause-head"'),"map/pause menu must remain the designated 2D system view");
assert(!html.includes('id="mobile-gamepad"'),"gameplay must not expose a 2D virtual gamepad");
assert(!html.includes('class="world-controls"'),"gameplay must not expose a 2D control bar");
assert(!html.includes('data-3d-camera'),"camera mode must be part of 3D gameplay, not a 2D gameplay toolbar");
assert(runtime.includes('let touchGesture='),"touch gameplay must use direct gestures instead of a 2D controller");
assert(runtime.includes('touchGesture.mode==="move"'),"touch must support direct movement in the 3D world");
assert(runtime.includes('player.yaw-=dx*.006'),"touch must support direct 3D camera look");
assert(runtime.includes('if(g.mode==="pause"){togglePause();return;}'),"two-touch gesture must retain pause access");
assert(runtime.includes('fight3D();'),"touch input must retain combat access");
assert(runtime.includes('interact();'),"touch input must retain interaction access");
console.log("ESCIE 3D-only gameplay contract OK");
