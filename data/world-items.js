/* ESCIE WORLD ITEMS — canonical equipment and vehicle registries */
(function(){
"use strict";
const equipment={
 FISTS:{id:"FISTS",type:"WEAPON",slot:"HAND",label:"FISTS",damage:9,range:1,stamina:10,price:0,owned:true,durability:Infinity},
 POCKET_KNIFE:{id:"POCKET_KNIFE",type:"WEAPON",slot:"HAND",label:"POCKET KNIFE",damage:14,range:1,stamina:11,price:35,durability:80},
 BAT:{id:"BAT",type:"WEAPON",slot:"HAND",label:"BASEBALL BAT",damage:22,range:1,stamina:16,price:60,durability:120},
 HOODIE:{id:"HOODIE",type:"ARMOR",slot:"BODY",label:"HOODIE",armor:3,price:40,durability:100},
 JACKET:{id:"JACKET",type:"ARMOR",slot:"BODY",label:"HEAVY JACKET",armor:8,price:90,durability:140}
};
const vehicles={
 TAXI:{id:"TAXI",type:"CAR",label:"TAXI",price:0,owned:false,speed:2,risk:1,radio:true},
 STREET_CAR:{id:"STREET_CAR",type:"CAR",label:"STREET CAR",price:0,owned:false,speed:2,risk:3,radio:true},
 COMPACT:{id:"COMPACT",type:"CAR",label:"COMPACT",price:3500,owned:false,speed:3,risk:1,radio:true},
 SEDAN:{id:"SEDAN",type:"CAR",label:"SEDAN",price:6000,owned:false,speed:3,risk:1,radio:true},
 BIKE:{id:"BIKE",type:"BIKE",label:"BIKE",price:250,speed:2,risk:0,radio:false},
 SKATEBOARD:{id:"SKATEBOARD",type:"BOARD",label:"SKATEBOARD",price:100,speed:1,risk:0,radio:false},
 ROLLERBLADES:{id:"ROLLERBLADES",type:"BOARD",label:"ROLLERBLADES",price:140,speed:1,risk:0,radio:false}
};
window.ESCIE_WORLD_ITEMS={equipment,vehicles};
})();
