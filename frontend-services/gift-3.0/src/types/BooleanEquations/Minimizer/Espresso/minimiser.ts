// @ts-ignore
import { Module } from "./espresso";

import { TruthTable } from "../TruthTable";


/**Singleton des Espresso-Minierers --> wird global exportiert */
class EspressoMinimizer {

  /**Espresso-Minimierer als geladenes Modul */
  private module: Module = Module;

  /**Ist das Modul bereits gleaden? */
  private isLoaded: boolean;

  /**
   * Erstelle einen neuen Minimierer
   */
  constructor() {
    //Ist das Modul fertig geladen? --> wenn ja dies vermerken
    this.module.onRuntimeInitialized = (e: any) => {
      this.isLoaded = true;
      // console.log("jetzt ready")
    };
  }

  /**
   * Minimiere eine Wertetabelle 
   * Der Aufbau des Inputs fuer Espresso kann aus {@see https://ptolemy.berkeley.edu/projects/embedded/pubs/downloads/espresso/index.htm} bzw. {@see http://www.ecs.umass.edu/ece/labs/vlsicad/ece667/links/espresso.html} entnommen werden
   * Ein gutes Verstaendis fuer das Ein- und Ausgabeformat kann man ebenfalls durch die Dokumentation von {@see https://www.npmjs.com/package/espresso-logic-minimizer} entwickeln
   * Hierbei sei jedoch angemerkt, dass letzteres Paket hier NICHT verwendet wurde (die Dokumentation zeigt lediglich die Ein- und Ausgabeformate von Espresso gut auf)
   * @param truthTable zu minimierende Wertetabelle
   * @returns minimierter Ausdrueck fuer jede Ausgangsvariable der Tabelle in Espressoformatierung
   */
  minimizeTruthTable(truthTable: TruthTable): Array<string> {

    //speichere die Anzahl der Eingaenge der Wertetabell
    let inputCount = truthTable.getInputCount()

    //Erstelle den Espressogerechten Inputstring aus der Wertetabelle
    let inputString: string;
    //nenne die Anzahl der Eingaenge und der Ausgange (von Wertetabelle uebernehmen)
    inputString = `.i ${inputCount}\n.o ${truthTable.getOutputCount()}\n`

    //Baue den Wertetabellenkoerper zusammen (zeilenweise)
    //Form einer Zeile : Eingangsbelegung Ausgangsbelegung
    // Beispiel fuer eine Zeile: i = 7 bei 3 Eingaengen und 7 Ausgaengen :  111 0100101


    //berechne wie viele Eingangsbelegungsindizes es maximal Geben darf (dies entspricht auch der Laenge eines Funktionsindexes eines Ausgangs)
    let indexCount = Math.pow(2, inputCount)

    // //lies alle Werteverlaeufe der Ausgangsvariablen als string aus (alle String muessen gleiche Laenge mit fuehrenden Nullen haben)
    // let functionIndexStrings:Array<string> = [];
    // //Extrahiere die Funktionsindizes der Ausgaenge
    // let functionIndexes = truthTable.getFunctionIndexes()
    // for(let outputCounter = 0 ;outputCounter<functionIndexes.length ; outputCounter++){
    //   //greife den aktuellen Funktionsindex
    //   let currentIndex = functionIndexes[outputCounter]
    //   //wandle ihn in einen string fester Laenge um (jeder Funktionsindex muss aus 2^Anzhal Eingangsvariablen vielen Bits bestehen)
    //   let functionIndexString = assignmentIndexToBitString(currentIndex ,indexCount)
    //   //fuege ihn in die Liste aller Werteverlauefe als Strings ein
    //   functionIndexStrings.push(functionIndexString)
    // }


    //greife den gloabel Dont-Care-Funktionsindex der Tabelle (dieser wird zur Minimierung aller Ausganege verwendet)
    let dontCareFunctionIndex = truthTable.getDontCareFunctionIndex()

    //laufe uber alle Eingangsbelegungsindizes die fuer die Wertetabelle moeglich sind
    for (let assignmentCounter = 0; assignmentCounter < indexCount; assignmentCounter++) {
      //erstelle den Zaehler als BigInt
      let bigIntAssignmentCounter = BigInt(assignmentCounter)
      //String fuer eine ganze Zeile
      let rowString = "";

      //stelle den Belegungsindex als binaeren Sting mit so vielen Buchstaben wie Eingangsvariablen dar
      let inputColumns = assignmentIndexToBitString(assignmentCounter, inputCount)

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //erstelle die Spalten der Ausgaenge in dieser Zeile

      //String fuer die Ausgangsbelegung der Zeile der Form: Ausgang0 (spaeter Platzhalter 0) |Ausgang1(spaeter Platzhalter1)| ... 
      let outputColumns = "";

      //greife die Funkrionsindizes der Ausgaenge 
      let functionIndexes = truthTable.getFunctionIndexes()

      //pruefe ob der Dont-Care-Werteverlauf fuer die aktuelle Eingangsbelegung zu 1 gesetzt ist
      //isoliere das Bit, welches zum aktuellen Ausgangsbelegungsindex gehoert (Ausgang für Belegung 0 ist das LSB im Funktionsindex)
      //schiebe den Funktionsindex dafuer um den aktuellen Eingangsbelegungsdindex nach rechts und pruefe das LSB (UND-Verknuepfung mit 1)
      let currentDontCareBit = (dontCareFunctionIndex >> bigIntAssignmentCounter) & BigInt(1);

      //falls das Dont-Care-Bit gesetzt ist, so setze fuer alle Ausgaenge das dont-Care-Symbol von Espresso ("-")
      if (currentDontCareBit === BigInt(1)) {
        outputColumns = "-".repeat(functionIndexes.length)
      }
      else {
        //h-Stern war fuer diese Eingangsbelegung nicht gesetzt --> laufe uber alle Ausgaenge und baue die Zeile der Ausgaenge anhand ihrer Funktionsindizes auf  
        for (let outputCounter = 0; outputCounter < functionIndexes.length; outputCounter++) {
          //greife den aktuellen Funktionsindex 
          let currentIndex = functionIndexes[outputCounter]

          //isoliere das Bit, welches zum aktuellen Ausgangsbelegungsindex gehoert (Ausgang für Belegung 0 ist das LSB im Funktionsindex)
          //schiebe den Funktionsindex dafuer um den aktuellen Eingangsbelegungsdindex nach rechts und pruefe das LSB (UND-Verknuepfung mit 1)
          let currentBit = (currentIndex >> bigIntAssignmentCounter) & BigInt(1)

          //Ist das Bit = 1, so setze eine 1 in den String der Ausgangsbelegung dieser Zeile
          //Ist das Bit = 0, so setze eine 0 
          if (currentBit === BigInt(1)) {
            outputColumns = outputColumns + "1"
          }
          else {
            outputColumns = outputColumns + "0"
          }


          // //fuege das Bit des Funktionsindexes fuer die Aktuelle Eingangsbelegung in den String der Zeile hinzu
          // //der Ausgangsbelegung 0 wird hierbei das letze Bit im Funktionsindexstring (LSB) ganz rechts zugeordnet (stringlaenge-1)
          // outputColumns = outputColumns + currentIndexString[indexCount-1-assignmentCounter]
        }
      }



      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      //setze die Zeile aus den Eingaengen und den Ausgaengen zusammen (nach jeder Zeile einen Zeilenumbruch setzen)
      rowString = inputColumns + " " + outputColumns + "\n"
      //anhaengen der ganzen zeile an den EspressoString
      inputString = inputString + rowString
    }

    // Inputsring wurde vollstaendig gebaut --> Anhang .e
    inputString = inputString + ".e"

    // console.log(inputString)

    //Pruefe ob der Minimierer geladen ist --> Wenn nicht Fehler ausgeben
    if (!this.isLoaded) {
      throw Error("Minimizer Not Loaded");
    }
    //starte Espresso mit dieser Wertetabelle 
    let outputStrings = this.runEspresso(inputString);

    //Ausgabe der minimierten Ausdruecke in Espressoformatierung
    return outputStrings
  }


  /**
   * Fuehre den Espressominimierer auf einer Wertetabelle in Epressoformatierung aus
   * @param dataString Wertetabelle als String in Espressoformatierung
   * @returns Array aus Strings welches die DNF fuer jede Ausgangsvariable in Espressosyntax koodiert
   */
  private runEspresso(dataString: string): string[] {
    //Variable fuer die spaetere Ausgabe
    let output: string[] = [];
    //Pruefe ob der Minimierer geladen ist --> wenn nicht Fehler werfen
    if (!this.isLoaded) {
      throw Error("Minimizer Not Loaded");
    }
    //schreibe die Wertetabelle in eine Datei, welche als Eingabe fuer Espresso verwendet wird 
    this.module.FS.writeFile("Input.txt", dataString, {
      flags: "w+",
    });
    //Starten von Espresso mit der Eingabedatei --> diese wird mit dem Ergebnis ueberschrieben
    let runEspreso = this.module.cwrap("run_espresso_from_path", "number", ["string"]);
    let startAdress: number = runEspreso("Input.txt");

    //Auslesen des Ergebnisses aus der Eingabedatei (in Stringarray einfuegen und ausgeben)
    for (let i = 0; i <= 100; i += 4) {
      let curArdress: number = this.module.getValue(startAdress + i, "*");
      if (curArdress != 0) {
        output.push(this.module.UTF8ToString(curArdress));
      } else {
        break;
      }
    }
    return output;
  }
}


/**
 * Umwandeln einer Zahl in einen binaeren String mit einer vorgegebenen Anzahl an Bits (MSB als 0tes zeichen , LSB als letztes Zeichen)
 * @param assignmentIndex umzuwandelnde Zahl
 * @param bitCounter Anzahl der Bits fuer die Koodierung
 * @return binaere Koodierung der Zahl als BitString mit vorgegebener Laenge
 */
function assignmentIndexToBitString(assignmentIndex: number, bitCounter: number): string {
  //konvertiere den Index in einen binaeren String 
  let bitString = ""

  //extrahiere pro Schleifendurchaluf das Bit mit der Nummer des Schleifenzaehlers aus der umzuwandelnden Zahl
  //beginne bei dem LSB der umzuwandelnden Zahl (dieses Bit steht dann ganz rechts im fertigen String)
  for (let bitIndex = 0; bitIndex < bitCounter; bitIndex++) {
    //ist das Bit mit der Nummer des Schleifenzaehlers in der uebergebenen Zahl gesetzt ? --> Wenn ja so haenge eine 1 an den Anfang des Strings an
    //schiebe die zu konvertierende Zahl dafuer um den aktuellen Zaehler nach rechts und pruefe das LSB (UND-Verknuepfung mit 1)
    //Anhaengen des Ergebnisses an den Anfang des Strings, da die Zahl vom LSB (ganz rechts im String) an aufgebaut wird
    if (((assignmentIndex >> bitIndex) & 1) === 1) {
      bitString = "1" + bitString;
    }
    else {
      bitString = "0" + bitString
    }
  }


  return bitString

}

export const MINIMIZER = new EspressoMinimizer()
