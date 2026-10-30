/* ESCIE WORLD QUEST DATA — canonical authored quest definitions */
(function(root){
  "use strict";
  const QUESTS=[
    {id:"quest-first-signal",title:"FIRST SIGNAL",description:"Find the strongest distortion in the lane.",requires:["game-discovery-trail"],reward:1},
    {id:"quest-witness",title:"THE WITNESS",description:"Speak to THE WITNESS and receive the key instruction.",requires:["game-discovery-witness"],reward:1},
    {id:"quest-room01",title:"ROOM 01",description:"Open the locked door and enter the unknown address.",requires:["room01"],reward:2},
    {id:"quest-archive",title:"THE DATED TAPE",description:"Find the television and VHS tape inside ROOM 01.",requires:["game-discovery-tv","game-discovery-tape"],reward:2},
    {id:"quest-field-gear",title:"FIELD GEAR",description:"Recover a useful tool from the street and prove you can work with what you find.",requires:["gear:POCKET_KNIFE"],reward:2},
    {id:"quest-green-access",title:"GREEN ACCESS",description:"Acquire the Green Pass and enter the deeper layer.",requires:["game-item-green-pass","room02"],reward:3},
    {id:"quest-winter-weight",title:"WINTER WEIGHT",description:"Recover the heavy jacket and learn what protection costs.",requires:["gear:JACKET"],reward:2},
    {id:"quest-trace",title:"TRACE",description:"Wake the Green Terminal and open the Trace Gate.",requires:["game-discovery-terminal","query:trace"],reward:4},
    {id:"quest-exit",title:"THE SIGNAL EXIT",description:"Reach the end marker in the Trace Layer.",requires:["game-discovery-exit"],reward:5}
  ];
  root.ESCIE_WORLD_QUESTS=QUESTS;
})(typeof window!=="undefined"?window:globalThis);
