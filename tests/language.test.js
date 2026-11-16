/* ESCIE LANGUAGE CONTRACT TESTS */
(function(){
  "use strict";
  const test={
    name:"language",
    run:function(assert){
      const engine=window.ESCIE_LANGUAGE_ENGINE;
      assert(engine&&typeof engine.renderText==="function","language text renderer must exist");
      const node=document.createElement("div");
      engine.renderText(node,"A <b>test</b>");
      assert(node.textContent==="A <b>test</b>","renderText must keep text as text");
      assert(node.querySelector("b")===null,"renderText must not create HTML nodes");
      const required=["NO TRANSMISSION LOADED","YOUR MEMORY","CLEAR MY MEMORY","FILE IS TOO LARGE. MAXIMUM 10 MB.","TRANSMISSION INTERRUPTED.","Observed. Recorded. Filed."];
      ["en","fr","es"].forEach(language=>{
        required.forEach(key=>assert(engine.translate(key,language)!==key,`missing ${language} translation: ${key}`));
      });
      assert(engine.translate("NO TRANSMISSION LOADED","fr")==="AUCUNE TRANSMISSION CHARGÉE","French runtime translation must resolve");
      assert(engine.translate("NO TRANSMISSION LOADED","es")==="NO HAY TRANSMISIÓN CARGADA","Spanish runtime translation must resolve");
      assert(engine.translate("A GOOD PERSON. I'M JUST NOT NICE.","fr")==="UNE BONNE PERSONNE. JE NE SUIS SIMPLEMENT PAS GENTIL.","French hero tagline must resolve");
      assert(engine.translate("A GOOD PERSON. I'M JUST NOT NICE.","es")==="UNA BUENA PERSONA. SIMPLEMENTE NO SOY AMABLE.","Spanish hero tagline must resolve");
      assert(engine.translate("MONTRÉAL, QUÉBEC, CANADA","fr")==="MONTRÉAL, QUÉBEC, CANADA","French hero location must remain canonical");
      assert(engine.translate("MONTRÉAL, QUÉBEC, CANADA","es")==="MONTRÉAL, QUÉBEC, CANADÁ","Spanish hero location must resolve");
      assert(engine.translate("ESCIE THE ARTIST. THE ART SPEAKS FOR ITSELF.","fr")==="ESCIE EST L’ARTISTE. L’ART PARLE DE LUI-MÊME.","French artist statement must preserve intended meaning");
      assert(engine.translate("ESCIE THE ARTIST. THE ART SPEAKS FOR ITSELF.","es")==="ESCIE ES EL ARTISTA. EL ARTE HABLA POR SÍ MISMO.","Spanish artist statement must preserve intended meaning");
      assert(engine.translate("MY WORLD","fr")==="MON MONDE","French World Home label must resolve");
      assert(engine.translate("MY WORLD","es")==="MI MUNDO","Spanish World Home label must resolve");
      assert(engine.translate("Montréal is home. Everything else is still the world.","fr")==="Montréal est chez nous. Tout le reste fait toujours partie du monde.","French World Home copy must resolve");
      assert(engine.translate("Montréal is home. Everything else is still the world.","es")==="Montréal es el hogar. Todo lo demás sigue siendo parte del mundo.","Spanish World Home copy must resolve");
      assert(engine.translate("WHERE MY WORLD AND THE WORLD INTERTWINE.","fr")==="LÀ OÙ MON MONDE ET LE MONDE S’ENTRECROISENT.","French World anchor copy must resolve");
      assert(engine.translate("WHERE MY WORLD AND THE WORLD INTERTWINE.","es")==="DONDE MI MUNDO Y EL MUNDO SE ENTRELAZAN.","Spanish World anchor copy must resolve");
      assert(engine.translate("THE OUTSIDE WORLD","fr")==="LE MONDE EXTÉRIEUR","French Outside World label must resolve");
      assert(engine.translate("THE OUTSIDE WORLD","es")==="EL MUNDO EXTERIOR","Spanish Outside World label must resolve");
      assert(engine.translate("Start anywhere. The World is bigger than the doorway.","fr")==="Commencez n’importe où. Le monde est plus grand que l’entrée.","French World closing copy must resolve");
      assert(engine.translate("Start anywhere. The World is bigger than the doorway.","es")==="Empieza donde quieras. El mundo es más grande que la entrada.","Spanish World closing copy must resolve");
      assert(engine.translate("SIGNAL QUIET","fr")==="SIGNAL SILENCIEUX","French signal status must resolve");
      assert(engine.translate("SIGNAL QUIET","es")==="SEÑAL EN SILENCIO","Spanish signal status must resolve");
      assert(engine.translate("The signal is quiet. The record remains.","fr")==="Le signal est silencieux. Le registre demeure.","French signal message must resolve");
      assert(engine.translate("The signal is quiet. The record remains.","es")==="La señal está en silencio. El registro permanece.","Spanish signal message must resolve");
      assert(engine.translate("NIGHTLIGHT","fr")==="NIGHTLIGHT","canonical symbol names must remain unchanged");
      assert(engine.translate("NIGHTLIGHT","es")==="NIGHTLIGHT","canonical symbol names must remain unchanged");
      const mode=engine.mode("documentary");
      assert(mode&&typeof mode.description==="string","mode description must remain available");
    }
  };
  window.ESCIE_TESTS=window.ESCIE_TESTS||[];
  window.ESCIE_TESTS.push(test);
  if(typeof module!=="undefined"&&module.exports)module.exports=test;
})();
assert(language.includes("WHAT IS ALIVE RIGHT NOW. THE WORK AND EVENTS BEING PUSHED INTO THE PRESENT."), "NOW present-tense copy must be translatable");
assert(language.includes("RIEN N’EST POUSSÉ ICI POUR L’INSTANT."), "French NOW empty state must be defined");
assert(language.includes("TODAVÍA NO SE ESTÁ IMPULSANDO NADA AQUÍ."), "Spanish NOW empty state must be defined");
