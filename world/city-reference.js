(()=>{"use strict";
const REF={
 version:3,
 mobility:{
  cycling:{all_season_km:740,total_km:1083,seasonal_start:"04-01",seasonal_end:"11-15",protected_km:251,marked_km:489},
  pedestrian:{shared_street_speed_kmh:20},
  underground_network:{name:"RESO",approx_km:32},
  winter:{snow_clearance:true},
 },
 network:{major_corridors:["Jean-Talon","Parc","Acadie","Saint-Viateur","Mont-Royal","Saint-Denis","Saint-Laurent","Sherbrooke","Rosemont","Beaubien","Notre-Dame","Wellington"],transit_hubs:["Parc","Acadie","Jean-Talon","Laurier","Mont-Royal","Berri-UQAM","McGill","Peel","Guy-Concordia","Champ-de-Mars","Place-d’Armes","Saint-Henri","Vendôme","De l’Église","Verdun"]},
 source:"MONTRÉAL_REFERENCE_LAYER",
 method:"OFFICIAL_CITY_REFERENCE",
 accuracy:"REFERENCE_SCALE_NOT_SURVEY_GRADE",
 districts:{
  "PARC-EXTENSION":{borough:"Villeray–Saint-Michel–Parc-Extension",corridors:["Jean-Talon","Parc","Acadie","Hutchison"],stations:["Parc","Acadie"],character:"dense mixed residential / commercial"},
  "MILE END":{borough:"Le Plateau-Mont-Royal",corridors:["Saint-Viateur","Saint-Urbain","Laurier","Mont-Royal"],stations:["Laurier","Mont-Royal"],character:"mixed residential / creative commercial"},
  "PLATEAU":{borough:"Le Plateau-Mont-Royal",corridors:["Saint-Denis","Saint-Laurent","Mont-Royal","Sherbrooke"],stations:["Laurier","Mont-Royal","Sherbrooke"],character:"dense residential / commercial"},
  "ROSEMONT":{borough:"Rosemont–La Petite-Patrie",corridors:["Rosemont","Beaubien","Jean-Talon","Iberville"],stations:["Rosemont","Beaubien","Jean-Talon"],character:"residential / commercial"},
  "DOWNTOWN":{borough:"Ville-Marie",corridors:["Saint-Denis","McGill","Peel","Guy"],stations:["Berri-UQAM","McGill","Peel","Guy-Concordia"],character:"high-density business / transit / underground-city"},
  "OLD MONTREAL":{borough:"Ville-Marie",corridors:["Notre-Dame","De la Commune"],stations:["Champ-de-Mars","Place-d'Armes"],character:"historic core / waterfront"},
  "SAINT-HENRI":{borough:"Le Sud-Ouest",corridors:["Notre-Dame","Saint-Henri","Vendôme"],stations:["Saint-Henri","Vendôme"],character:"residential / industrial-transition"},
  "VERDUN":{borough:"Verdun",corridors:["Wellington","Verdun","De l'Église"],stations:["De l'Église","Verdun"],character:"residential / commercial / waterfront"}
 },
 road_classes:{LOCAL:"LOCAL",COLLECTOR:"COLLECTOR",ARTERIAL:"ARTERIAL",HIGHWAY:"HIGHWAY",PEDESTRIAN:"PEDESTRIAN"},
 climate:{seasonal_surface:["SNOW","SLUSH","WET","DRY"],winter_effects:["reduced traction","snowbanks","shorter daylight"],spring_effects:["potholes","wet pavement","construction"],summer_effects:["dry pavement","heat","outdoor activity"],autumn_effects:["wet leaves","cool pavement","shorter daylight"]},
 road_behavior:{
  pedestrian_priority:["PEDESTRIAN","SHARED"],
  shared_speed_kmh:20,
  seasonal_cycle_routes:true,
  winter_cycle_routes:true,
 },
 rules:[
  "Real Montréal street and transit relationships are the spatial reference.",
  "Use fictionalized businesses and original characters.",
  "Do not imply survey-grade coordinates.",
  "ESCIE distortion is layered over recognizable city structure."
 ],
 source_urls:{
  open_data:"https://donnees.montreal.ca/",
  planning:"https://montreal.ca/en/services/land-use-planning-interactive-maps",
  heritage:"https://montreal.ca/en/services/view-heritage-databases",
  toponymy:"https://montreal.ca/en/services/learn-about-place-names",
  open_data:"https://montreal.ca/en/articles/open-data-platform-easy-access-10641"
 }
};
const sim=window.ESCIE_WORLD_SIMULATION;
if(sim){sim.CITY_REFERENCE=Object.assign({},sim.CITY_REFERENCE||{},REF);sim.cityReference=()=>REF;sim.districtReference=d=>REF.districts[String(d||"").toUpperCase()]||null;}
window.ESCIE_CITY_REFERENCE=REF;
})();