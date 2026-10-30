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
const DATA_SOURCES={
 city_open_data:{name:"Ville de Montréal — Données ouvertes",url:"https://donnees.montreal.ca/",uses:["road network","street assets","signals","cycling","collisions","public places","commercial premises","heritage","construction"]},
 city_planning:{name:"Ville de Montréal — Land-use planning maps",url:"https://montreal.ca/en/services/land-use-planning-interactive-maps",uses:["zoning","density","heritage","urban form","borough structure"]},
 city_heritage:{name:"Ville de Montréal — Heritage databases",url:"https://montreal.ca/en/services/view-heritage-databases",uses:["heritage buildings","historic streets","architectural character"]},
 stm_open_data:{name:"STM — Open data / GTFS",url:"https://www.stm.info/a-propos/documents-donnees/donnees-ouvertes",uses:["metro stations","bus routes","scheduled transit","service patterns"]},
 osm:{name:"OpenStreetMap",url:"https://www.openstreetmap.org/",uses:["street geometry","paths","landmarks","transport context"]},
 montreal_stats:{name:"Montréal en statistiques",url:"https://montreal.ca/en/services/montreal-en-statistiques",uses:["neighbourhood socio-economic context"]}
};
const BOROUGHS={
"AHUNTSIC-CARTIERVILLE":{borough:"Ahuntsic-Cartierville",character:"residential / commercial / river-edge",urban:["du Bois-de-Boulogne","Fleury","Henri-Bourassa"],transit:["Henri-Bourassa","Sauvé"]},
"ANJOU":{borough:"Anjou",character:"suburban commercial / industrial",urban:["Galeries d'Anjou","Jean-Talon Est","Louis-H.-La Fontaine"],transit:["Radisson","Honoré-Beaugrand"]},
"CÔTE-DES-NEIGES–NOTRE-DAME-DE-GRÂCE":{borough:"Côte-des-Neiges–Notre-Dame-de-Grâce",character:"dense residential / institutional / multicultural",urban:["Côte-des-Neiges","Sherbrooke","Décarie"],transit:["Côte-des-Neiges","Snowdon","Villa-Maria"]},
"LACHINE":{borough:"Lachine",character:"canal / industrial heritage / residential",urban:["Notre-Dame","Saint-Joseph","Lachine Canal"],transit:["Lachine"]},
"LASALLE":{borough:"LaSalle",character:"industrial / residential / river-edge",urban:["Newman","Champlain","LaSalle"],transit:["Angrignon"]},
"LE PLATEAU-MONT-ROYAL":{borough:"Le Plateau-Mont-Royal",character:"dense plexes / cafés / storefronts / nightlife",urban:["Mont-Royal","Saint-Denis","Saint-Laurent","Rachel"],transit:["Mont-Royal","Sherbrooke","Laurier"]},
"LE SUD-OUEST":{borough:"Le Sud-Ouest",character:"industrial-transition / brick rowhouses / canal",urban:["Notre-Dame","Atwater","Saint-Henri","Wellington"],transit:["Atwater","Lionel-Groulx","Saint-Henri"]},
"L'ÎLE-BIZARD–SAINTE-GENEVIÈVE":{borough:"L'Île-Bizard–Sainte-Geneviève",character:"island-edge / low-density / natural",urban:["Boulevard Gouin","Jacques-Bizard"],transit:[]},
"MERCİER–HOCHELAGA-MAISONNEUVE":{borough:"Mercier–Hochelaga-Maisonneuve",character:"working-class residential / industrial / Olympic corridor",urban:["Ontario","Pie-IX","Sherbrooke"],transit:["Pie-IX","Joliette","Préfontaine"]},
"MONTRÉAL-NORD":{borough:"Montréal-Nord",character:"dense residential / commercial / river-edge",urban:["Pie-IX","Henri-Bourassa","Lacordaire"],transit:["Henri-Bourassa","Sauvé"]},
"OUTREMONT":{borough:"Outremont",character:"stone-and-brick residential / institutional",urban:["Bernard","Van Horne","Laurier"],transit:["Outremont","Édouard-Montpetit"]},
"PIERREFONDS-ROXBORO":{borough:"Pierrefonds-Roxboro",character:"low-density residential / green corridors",urban:["Boulevard de Pierrefonds","Gouin"],transit:["Côte-Vertu"]},
"RIVIÈRE-DES-PRAIRIES–POINTE-AUX-TREMBLES":{borough:"Rivière-des-Prairies–Pointe-aux-Trembles",character:"river-edge / industrial / low-density residential",urban:["Sherbrooke Est","Henri-Bourassa","Gouin"],transit:["Honoré-Beaugrand"]},
"ROSEMONT–LA PETITE-PATRIE":{borough:"Rosemont–La Petite-Patrie",character:"duplexes / alleys / commercial strips / markets",urban:["Beaubien","Rosemont","Jean-Talon","Masson"],transit:["Rosemont","Beaubien","Jean-Talon"]},
"SAINT-LAURENT":{borough:"Saint-Laurent",character:"industrial / airport-adjacent / residential",urban:["Côte-Vertu","Henri-Bourassa","Décarie"],transit:["Côte-Vertu","Du Collège"]},
"SAINT-LÉONARD":{borough:"Saint-Léonard",character:"residential / commercial / industrial edge",urban:["Jean-Talon Est","Langelier","Lacordaire"],transit:["Langelier","Radisson"]},
"VERDUN":{borough:"Verdun",character:"dense residential / commercial / waterfront",urban:["Wellington","Verdun","De l'Église"],transit:["Verdun","De l'Église"]},
"VILLE-MARIE":{borough:"Ville-Marie",character:"downtown / historic core / high-rise / waterfront",urban:["Saint-Catherine","Sainte-Catherine","René-Lévesque","Notre-Dame","de la Commune"],transit:["Berri-UQAM","McGill","Peel","Guy-Concordia","Champ-de-Mars","Place-d'Armes"]},
"VILLERAY–SAINT-MICHEL–PARC-EXTENSION":{borough:"Villeray–Saint-Michel–Parc-Extension",character:"dense plexes / immigrant commerce / rail corridors / back lanes",urban:["Jean-Talon","Parc","Saint-Laurent","Jarry","Acadie"],transit:["Parc","Acadie","Jarry","Jean-Talon"]}
};
const DISTRICT_TEXTURE={
"PARC-EXTENSION":{borough:"Villeray–Saint-Michel–Parc-Extension",density:"HIGH",building:["plex","walkup","row storefront"],street:["narrow local","commercial arterial","back lane"],activity:["corner stores","takeout","family traffic","delivery","metro foot traffic"],night:"mixed residential/commercial"},
"MILE END":{borough:"Le Plateau-Mont-Royal",density:"HIGH",building:["plex","loft","storefront"],street:["local","commercial","bike corridor"],activity:["cafés","music","creative work","nightlife","cycling"],night:"active"},
"PLATEAU":{borough:"Le Plateau-Mont-Royal",density:"VERY HIGH",building:["plex","rowhouse","storefront"],street:["local","arterial","bike corridor"],activity:["cafés","bars","shops","pedestrians","cycling"],night:"very active"},
"ROSEMONT":{borough:"Rosemont–La Petite-Patrie",density:"HIGH",building:["plex","rowhouse","duplex"],street:["local","commercial","alley"],activity:["families","markets","shops","cycling","delivery"],night:"residential"},
"DOWNTOWN":{borough:"Ville-Marie",density:"VERY HIGH",building:["high-rise","office","retail"],street:["arterial","one-way","pedestrian"],activity:["commuters","tourists","transit","delivery","nightlife"],night:"high activity"},
"OLD MONTREAL":{borough:"Ville-Marie",density:"HIGH",building:["historic stone","warehouse","hotel"],street:["cobble/heritage","pedestrian","arterial"],activity:["tourists","restaurants","waterfront","events"],night:"tourism/nightlife"},
"SAINT-HENRI":{borough:"Le Sud-Ouest",density:"HIGH",building:["brick rowhouse","plex","industrial"],street:["local","commercial","industrial"],activity:["workers","cafés","deliveries","canal traffic"],night:"mixed"},
"VERDUN":{borough:"Verdun",density:"HIGH",building:["plex","duplex","storefront"],street:["local","commercial","waterfront"],activity:["families","shops","cycling","waterfront"],night:"active commercial"}
};
REF.data_sources=DATA_SOURCES;
REF.boroughs=BOROUGHS;
REF.district_texture=DISTRICT_TEXTURE;
REF.city_scale={borough_count:19,street_network_reference_km:4000,simulation_note:"Playable districts are a compressed, data-informed Montréal representation; real geometry is not claimed survey-grade."};
REF.environment={winter:{snowbanks:true,plowing:true,slush:true,short_daylight:true},spring:{potholes:true,wet:true,construction:true},summer:{terraces:true,cycling:true,long_daylight:true},autumn:{wet_leaves:true,cool_pavement:true,short_daylight:true}};

const sim=window.ESCIE_WORLD_SIMULATION;
if(sim){sim.CITY_REFERENCE=Object.assign({},sim.CITY_REFERENCE||{},REF);sim.cityReference=()=>REF;sim.districtReference=d=>REF.districts[String(d||"").toUpperCase()]||null;}
window.ESCIE_CITY_REFERENCE=REF;
})();