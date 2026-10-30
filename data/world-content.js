/* ESCIE WORLD CONTENT — canonical authored game-start records */
(function(){
"use strict";
const start={x:2,y:7};
let npcs=[{id:"witness",x:8,y:3,label:"THE WITNESS",lines:["You came through the signal. I have seen that before.","Do not confuse what you find with what is proven."],choices:[{label:"WHO ARE YOU?",text:"Someone who stayed long enough to notice the pattern."},{label:"WHAT IS THIS PLACE?",text:"A real street. Everything after that is interpretation."},{label:"I NEED THE KEY.",text:"Then find the thing that responds to the distortion.",discovery:"game-discovery-witness",queries:["query:witness","query:key"]}]}];
const objects=[
{id:"camera",x:12,y:2,label:"CAMERA",text:"A camera watches the lane. Its lens is pointed somewhere specific.",discovery:"game-discovery-camera",queries:["query:camera","query:surveillance"]},
{id:"shoe",x:6,y:5,label:"BABY SHOE",text:"A small shoe sits near the curb. Meaning unresolved.",discovery:"game-discovery-shoe",queries:["query:baby shoe","query:shoe","query:childhood"],item:"game-item-baby-shoe"},
{id:"signal",x:13,y:7,label:"SIGNAL",text:"The distortion is strongest here. Something continues beyond this street.",discovery:"game-discovery-trail",queries:["query:trail","query:path","query:signal","query:distortion"]},
{id:"door",x:3,y:2,label:"DOOR",text:"Locked. Behind it: fluorescent light and something that sounds like a television.",discovery:null},
{id:"chair",x:9,y:7,label:"CHAIR",text:"An empty chair faces the wall. There is nothing on it.",discovery:null},
{id:"pocket-knife",x:7,y:6,label:"POCKET KNIFE",text:"A worn pocket knife sits where someone could have dropped it.",discovery:"game-discovery-pocket-knife",queries:["query:knife","query:weapon"],equipment:"POCKET_KNIFE"},
{id:"jacket",x:11,y:6,label:"HEAVY JACKET",text:"A heavy jacket hangs from a rusted hook. It still has some weight to it.",discovery:"game-discovery-jacket",queries:["query:jacket","query:clothing"],equipment:"JACKET"}
];
const walls=new Set(["0,0","1,0","2,0","3,0","4,0","5,0","6,0","7,0","8,0","9,0","10,0","11,0","12,0","13,0","14,0","15,0","0,1","15,1","0,2","15,2","0,3","4,3","5,3","15,3","0,4","4,4","5,4","15,4","0,5","4,5","15,5","0,6","15,6","0,7","15,7","0,8","15,8","0,9","1,9","2,9","3,9","4,9","5,9","6,9","7,9","8,9","9,9","10,9","11,9","12,9","13,9","14,9","15,9"]);
const MARKET=[
 {id:"game-item-green-pass",title:"GREEN PASS",description:"A future access token for deeper layers of THE WORLD.",price:3,currency:"SIGNAL",type:"EARNED"},
 {id:"game-item-vhs-tape",title:"VHS TAPE",description:"A found recording from ROOM 01. It is also evidence.",price:0,currency:"SIGNAL",type:"FOUND"},
 {id:"game-item-baby-shoe",title:"BABY SHOE",description:"A found object. Meaning unresolved.",price:0,currency:"SIGNAL",type:"FOUND"}
];
const WORLD_LOOT_TABLE=[
 {id:"POCKET_KNIFE",kind:"EQUIPMENT",weight:35,reason:"FIELD FIND",contexts:["lane","room01"]},
 {id:"HOODIE",kind:"EQUIPMENT",weight:25,reason:"FIELD FIND",contexts:["lane","room01","room02"]},
 {id:"JACKET",kind:"EQUIPMENT",weight:12,reason:"RARE FIND",contexts:["room01","room02"]},
 {id:"BAT",kind:"EQUIPMENT",weight:6,reason:"RARE FIND",contexts:["room02","trace"]},
 {id:"SIGNAL",kind:"SIGNAL",weight:22,amount:1,reason:"SIGNAL FRAGMENT",contexts:["lane","room01","room02","trace"]}
];
const rooms={
 room01:[
  {id:"tv",x:5,y:2,label:"TELEVISION",text:"The television has no picture. The audio is a low recording of street noise.",discovery:"game-discovery-tv",queries:["query:television","query:audio"]},
  {id:"tape",x:2,y:5,label:"TAPE",text:"A VHS tape marked only with a date. No name.",discovery:"game-discovery-tape",queries:["query:tape","query:archive"],item:"game-item-vhs-tape"},
  {id:"green-door",x:7,y:6,label:"GREEN DOOR",text:"A second door. The lock has a green indicator and no handle.",discovery:null}
 ],
 room02:[
  {id:"console",x:5,y:3,label:"GREEN TERMINAL",text:"A green terminal wakes when it recognizes the pass. It displays three options: LISTEN, TRACE, OPEN.",discovery:"game-discovery-terminal",queries:["query:terminal","query:deeper"]},
  {id:"archive",x:2,y:6,label:"ARCHIVE CABINET",text:"The cabinet contains an index of places, people and moments. Several entries are deliberately blank.",discovery:"game-discovery-deeper-archive",queries:["query:archive","query:places","query:people"]},
  {id:"trace-gate",x:6,y:6,label:"TRACE GATE",text:"A narrow green frame has appeared in the wall. It has no handle. The terminal may be the only way through.",discovery:null}
 ],
 trace:[
  {id:"trace-core",x:4,y:4,label:"TRACE CORE",text:"The signal has stopped behaving like a clue. It is behaving like a path.",discovery:"game-discovery-trace-core",queries:["query:trace-core","query:path","query:signal"]},
  {id:"exit-signal",x:6,y:2,label:"SIGNAL EXIT",text:"A final marker points toward something outside the playable layer.",discovery:"game-discovery-exit",queries:["query:exit","query:outside"]},
  {id:"return-frame",x:1,y:1,label:"RETURN FRAME",text:"A frame back to ROOM 02.",discovery:null}
 ]
};
const runtimeNPC={
 witness:{id:"witness",x:8,y:3,role:"WITNESS",status:"UNKNOWN",awareness:78,social_context:"LOCAL",facing:"S",peripheral:true,schedule:[{start:0,end:420,activity:"SLEEP",target:{x:8,y:3}},{start:420,end:540,activity:"COMMUTE",target:{x:10,y:3}},{start:540,end:1020,activity:"WATCH",target:{x:8,y:3}},{start:1020,end:1260,activity:"SOCIAL",target:{x:10,y:7}},{start:1260,end:1440,activity:"HOME",target:{x:8,y:3}}]},
 surveillance:[{id:"lane-camera",x:12,y:2,type:"CAMERA",radius:5,awareness:95,facing:"S",peripheral:false}]
};
window.ESCIE_WORLD_CONTENT={start,walls,npcs,objects,market:MARKET,lootTable:WORLD_LOOT_TABLE,rooms,runtimeNPC};
})();
