(()=>{"use strict";
const REF={
 version:1,
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
 rules:[
  "Real Montréal street and transit relationships are the spatial reference.",
  "Use fictionalized businesses and original characters.",
  "Do not imply survey-grade coordinates.",
  "ESCIE distortion is layered over recognizable city structure."
 ],
 source_urls:{
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