const CACHE="escie-world-shell-v1";
const CORE=[
 "./",
 "./index.html",
 "./world.css",
 "./game-shell.css",
 "./world-simulation.js",
 "./city-reference.js",
 "./npc-identity-system.js",
 "./npc-life-system.js",
 "./npc-system.js",
 "./equipment.js",
 "./vehicle-system.js",
 "./law-system.js",
 "./language-system.js",
 "./npc-dialogue-system.js",
 "./interior-system.js",
 "./rpg-system.js",
 "./world.js",
 "./3d-reality.js",
 "./dream-play.js",
 "../data/games.js"
];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()).catch(()=>self.skipWaiting()));});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k.startsWith("escie-world-shell-")).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET")return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});return res;}).catch(()=>caches.match("./"))));
});
