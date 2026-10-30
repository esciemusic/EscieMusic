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
window.ESCIE_WORLD_CONTENT={start,walls,npcs,objects,market:MARKET,lootTable:WORLD_LOOT_TABLE};
})();
