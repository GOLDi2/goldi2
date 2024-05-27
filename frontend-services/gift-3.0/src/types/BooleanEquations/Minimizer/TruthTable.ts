import { is } from "immer/dist/internal";
import { SignalTreeRepresentation } from "../../Signal"


/**
 * Darstellung einer Wertetabelle, die die Funktionsindizes aller Ausgangsvariablen beinhaltet
 * Kann unabhaengig von den Variablen die sie repraesentiert verwendet werden
 */
export class TruthTable{
    /**Anzahl der Eingangsvariablen --> fuer 0 Eingangsvariablen liegt eine Konstante vor, deren Tabelle nur aus einer Zeile fuer Index 0 besteht*/
    private inputCount:number

   /**
     * Speichern der Werteverlaeufe aller Ausgaenge als Funktionsindex (das Array besteht aus so vielen Eintraegen wie Anzahl der Ausgangsvariablen)
     * (bei Bit Null (ganz rechts als letztes Zeichen in der Binaerkooedierung des Bigints) innerhalb eines Funktionsindexes steht 
     * die Ausgangsbelegung fuer den Eingangsbelegungsindex 0)
     * 
     * Bsp. fuer einen Index:  bei 3 Eingangsvariablen sind die Eingangsbelegungsindize 0 , 1, ... ,7 moeglich 
     *              der Werteverlauf  lambda(X_0)-->0110 0011<--lambda(X_7) waere als von rechts nach links gelesen der Funktionsindex MSB-->1100 0110<--LSB 
     *              innerhalb des Bigints wuerde als Bit7-->1100 0110<-- Bit0 (Basis2) bzw. 198 (Basis10) stehen
     *              das von rechts nach links lesen entspricht hierbei dem von unten nach oben lesen in einer Wertetabelle
     */
    private functionIndexes:Array<bigint>


    /** 
     * Funktionsindex der Dont-Care-Belegung (h-Stern) der gesamten Tabelle (kann als eigene Spalte angesehen werden, die kein Ausgang ist)
     * Alle Ausgaenge der Tabelle werden ggf. mit Hilfe dieses Ausdrucks noch staerker minimiert
     * Aufbau des Funktionsindexes wie bei {@link functionIndexes} 
     */
    private dontCareFunctionIndex: bigint

    /**
     * Erstelle eine neue Wertetabelle 
     * Ihre initale Dont-Care-Belegung ist hierbei logisch 0
     * @param inputCount Anzahl der Eingangsvariablen (muss >= 0 sein)
     *      fuer 0 Eingangsvariablen liegt eine Konstante vor, deren Tabelle nur aus einer Zeile fuer Index 0 besteht
     * @param outputCount Anzahl der Ausgangsvariablen (muss >= 0 sein,  bei 0 Existiert kein Ausgang der adressiert werden kann)
     */
    constructor(inputCount:number , outputCount:number){
        //Anzahl der Eingaenge >= 0 und <32 (0 Eingaenge fuer Konstanten)
        if(inputCount>= 0 && inputCount<32){
            this.inputCount = inputCount;
        }
        else{
            throw new Error("invalid InputCount");
        }

        //Anzahl der Ausgaenge >=0
        if(outputCount>=0){
            //Erstelle so viele Zeilen fuer Ausgangsfunktionsindizes wie Ausgangsvariablen
            this.functionIndexes = new Array(outputCount).fill(BigInt(0))
        }
        else{
            throw new Error("invalid OutputCount");
        }
        //initale Dont-Care-Belegung = logisch 0
        this.dontCareFunctionIndex = BigInt(0)
         
    }
    /**
     * Fuer wie viele Eingaenge ist die Tabelle aktuell ausgelegt
     * @returns Anzahl der Eingangsvariablen die aktuell in der Tabelle dargestellt werden koennen  (=0 falls es eine Tabelle einer Konstanten mit nur einer Zeile ist)
     */
    getInputCount():number{
        return this.inputCount
    }

    /**
     * Fuer wie viele Ausgaenge ist die Tabelle aktuell ausgelegt
     * @returns Anzahl der Ausgangsvariablen die aktuell in der Tabelle dargestellt werden koennen (=0 falls es eine leere Tabelle fuer 0 AUsgaenge ist)
     */
    getOutputCount():number{
        return this.functionIndexes.length
    }

    /**
     * Ausgabe aller Funktionsindizes der Ausgaenge: beim Bit 0 steht die Belegung fuer die Eingangsbelegung mit Index 0
     * Pro Ausgang wird eine Zeile im Array fuer einen Funktionsindex verwendet
     * @returns Funktionsindizes der Ausgaenge 
     */
    getFunctionIndexes():Array<bigint>{
        return this.functionIndexes
    }

    /**
     * Ausgabe des Dont-Care-Funktionsindexes der Tabelle
     * @returns Dont-Care-Funktionsindex der Tabelle
     */
    getDontCareFunctionIndex():bigint{
        return this.dontCareFunctionIndex
    }

    /**
     * Was ist der aktuell maximal moegliche Eingangsbelegungsindex fuer die Aktuelle Anzahl an Eingangsvariablen?
     * @returns maximal moeglicher Eingangsbelegungsindex (dieser kann noch adressiert werden)
     */
    private getMaxInputIndex():number{
        // maximal 2^(Anzahl Eingaenge) -1 Eingangsbelegungen
        return Math.pow(2,this.inputCount)-1
    }
    /**
     * Setze einen Eintrag fuer einen bestimmten Ausgang (Spalte) bei einer Eingangsbelegung (Zeile) zu 1
     * fuer 0 Eingangsvariablen liegt eine Konstante vor, deren Tabelle nur aus einer Zeile fuer Index 0 besteht
     * @param inputAssignmentIndex Eingangsbelegungsindex der Zeile (von 0 bis 2^(Anzahl der Eingangsvariablen) -1)
     * @param outputVariable Index der zu setzenden Ausgangsvariablen (von 0 bis Anzahl der Ausgangsvariablen -1)
     * @throws "invalid inputAssignmentIndex" falls der angegebene Eingangsbelegungsindex nicht innerhalb der Tabelle existiert (zu gross oder <0)
     * @throws "invalid outputIndex" Falls die zu setzende Ausgangsvariable nicht innerahlb der Tabelle existiert
     */
    setOutputOne(inputAssignmentIndex:number , outputVariable:number):void{
            //Fuege eine 1-Belegung in den Werteverlauf des gegebenen Ausgangs fuer diese Eingangsbelegung ein 
            
            //pruefe ob die angegebenen Indize fuer die Belegung und die Ausgangsvariable moeglich sind bei der aktuellen Tabellengroesse
            if(outputVariable>-1 && outputVariable<this.getOutputCount()){
                //Fuege dem Funktionsindex des angegebenen Ausgangs eine 1 fuer den gewissen Index des Eingangs hinzu

                this.functionIndexes[outputVariable] = this.setOne(this.functionIndexes[outputVariable] , inputAssignmentIndex)
                
            }
            else{
                //der gesuchte Ausgang existiert nicht innerhalb der Tabelle
                throw new Error("invalid outputIndex")
            }

    }

    /**
     * Setze einen Eintrag der Dont-Care-Belegung fuer einen gegebenen Eingangsbelegungsindex (Zeilenindex) zu 1
     * fuer 0 Eingangsvariablen liegt eine Konstante vor, deren Tabelle nur aus einer Zeile fuer Index 0 besteht
     * @param inputAssignmentIndex Eingangsbelegungsindex der Zeile (von 0 bis 2^(Anzahl der Eingangsvariablen) -1)
     * @throws "invalid inputAssignmentIndex" falls der angegebene Eingangsbelegungsindex nicht innerhalb der Tabelle existiert (zu gross oder <0)
     */
    setDontCareOne(inputAssignmentIndex:number){
         //Fuege eine 1-Belegung in den Werteverlauf des Dont-Care-Ausdrucks fuer diese Eingangsbelegung ein 
            
        this.dontCareFunctionIndex = this.setOne(this.dontCareFunctionIndex , inputAssignmentIndex)
    }

    /**
     * Setze einen Funktionsindex fuer eine der Ausgangsvariablen
     * @param functionIndex zu setzender Funktinsindex (muss mit der Anzahl der Eingaenge der Wertetabelle darstellbar sein)
     * @param outputVariable Nummer der Spalte der Ausgangsvariablen fuer die der Index eingesetzt werden muss
     * @throws "invalid outputindex" falls der adressierte Ausgangsvariablenindex innerhalb der Tabelle nicht existiert
     * @throws "invalid functionindex" falls der zu setzende Funktionsindex nicht erlaubt ist (ist negativ oder zu gross fuer die Anzahl an Eingaengen dieser Tabelle)
     * 
     */
    setFunctionIndex(functionIndex:bigint , outputVariable:number):void{
        //Pruefe ob eine in dieser Tabelle existierende Ausgangsvariable adressiert wird und ob der Funktionsindex mit der Anzahl der Eingaenge der Tabelle darstellbar ist
        //mit n Eingangsvariblen besitzt die Tabelle 2^n Zeilen ,weshalb der Funktionsindex in Binaerdarstellung maximal aus 2^n vielen 0en / 1en bestehen kann
        if(!(outputVariable>-1 && outputVariable<this.getOutputCount())){
           throw new Error("invalid outputindex")

        }
        if(!this.isValidFunctionIndex(functionIndex)){
            throw new Error("invalid functionindex")
        }

        //alle Tests bestanden --> setze den Funktionsindex
        this.functionIndexes[outputVariable] = functionIndex

    }

    /**
     * Setzen des Dont-Care-Werteverlaufs anhand eines Funktionsindexes
     * @param functionIndex Index der fuer den Dont-Care-Werteverlauf gesetzt werden soll
     * @throws "invalid functionindex" falls der zu setzende Funktionsindex nicht erlaubt ist (ist negativ oder zu gross fuer die Anzahl an Eingaengen dieser Tabelle)
     */
    setDontCareFunctionIndex(functionIndex:bigint):void{
        //preufe ob der Funktionsindex zum Fromat dieser Tabelle Passt --> wenn ja uebernimm ihn
        if(!this.isValidFunctionIndex(functionIndex)){
            throw new Error("invalid functionindex")
        }
        else{
            //Index ist okay
            this.dontCareFunctionIndex = functionIndex
        }
        
    }


    /**
     * Setze einen Eintrag eines Werteverlaufs bei einer Eingangsbelegung (Zeile) zu 1 (keine Vereanderung falls der Eintrag bereits auf 1 gesetzt war)
     * fuer 0 Eingangsvariablen liegt eine Konstante vor, deren Tabelle nur aus einer Zeile fuer Index 0 besteht
     * @param inputAssignmentIndex Eingangsbelegungsindex der Zeile (von 0 bis 2^(Anzahl der Eingangsvariablen) -1)
     * @param functionIndex Funktionsindex fuer den der 1-Eintrag gesetzt werden soll
     * @returns Funktionsindex in dem die 1-Belegung gesetzt wurde
     * @throws "invalid inputAssignmentIndex" falls der angegebene Eingangsbelegungsindex nicht innerhalb der Tabelle existiert (zu gross oder <0)
     */
    private setOne(functionIndex:bigint , inputAssignmentIndex:number):bigint{
          //Fuege eine 1-Belegung in den gegbenen Werteverlauf fuer diese Eingangsbelegung ein 
            
            //pruefe ob der angegebenen Index fuer die Belegung  moeglich ist bei der aktuellen Tabellengroesse
            if(inputAssignmentIndex <= this.getMaxInputIndex() && inputAssignmentIndex >-1){
                //Fuege dem gegebenen Funktionsindex eine 1 fuer den gewissen Index des Eingangs hinzu

                //anlegen einer Bitmaske die verschoben wird
                let bitMask:bigint = BigInt(1)
                //umwandeln es Eingangsindexes in einen Bigint um bitweise verschieben zu koennen
                let inputIndex = BigInt(inputAssignmentIndex)

                //verschiebe die Bitmaske so oft nach links, dass die 1 beim zu setzenden Bit steht
                bitMask = bitMask<<inputIndex

                //maskiere den Werteverlauf des gesuchten Ausgangs mit der Maske via Oder (setzen der 1 im Werteverlauf)
               functionIndex = functionIndex | bitMask 
                
            }
            else{
                throw new Error("invalid inputAssignmentIndex")
            }

            return functionIndex
    }

    /**
     * Ueberpruefe ob ein Funktionsindex zum Format/ der Groesse dieser Tabelle passt (Index > 0 und nicht zu gross)
     * @param functionIndex zu pruefender Funktionsindex
     * @returns kann der Funktionsindex innerhalb dieser Tabelle verwendet werden?
     */
    private isValidFunctionIndex(functionIndex:bigint):boolean{
        let isvalid = false

        //fuer n Eingaenge hat die Tabelle 2^n viele Zeilen --> der Funktionsindex muss >0 sein und seine Stringfrom darf maximal aus 2^n vielen Zeichen bestehen
        //(ein Bit pro Zeile der Wertetabelle)
        if(functionIndex.toString(2).length <= Math.pow(2,this.inputCount) && functionIndex >= BigInt(0)){
            //Funktionsindex ist fuer die Tabellengroesse passend
            isvalid = true;
        }
        return isvalid
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Darstellung einer Wertetabelle, die die Belegungsindize aller 1-Eintraege aller Ausgangsvariablen beinhaltet
 * Kann eventuell noch doppelte Eintrage beinhalten und kann inkrementell aufgebaut werden
 */
 class TruthTableDraft{
    /**Alle Eingangsvariablen fuer die Wertetabelle (an der Stelle Null steht das LSB)*/
    public inputVariables: Array<SignalTreeRepresentation>

    /**Anzahl der Eingangsvariablen (ist immer > 0) */
    public inputCount:number

    /**Anzahl der Ausgangsvariablen */
    public outputCount:number

    /**
     * Liste aller Indize der 1 Eintraege der jeweiligen Ausgangsvariablen (kann noch Dopllungen enthalten)
     * Eine Zeile pro Liste aller 1-Belegungen einer Ausgangsvariablen
     */
    public oneEntrys:Array<Array<number>>

    /**Ist die Tabelle Finalisiert? 
     * (Wenn ja liegen keine Dopplungen der Belegungen mehr vor und alle Eintraege der Eingangsbelegungsindzies sind aufsteigend sortiert ) */
    public isFinalized:boolean

    /**
     * Erstelle eine neue Wertetabelle fuer die 1-Eintrage aller Werteverlaeufe
     * @param inputVariables Alle Eingangsvariablen fuer die Wertetabelle (LSB steht bei Eintrag 0) !!Liste darf nicht leer sein!!
     * @param outputCount Anzahl der Ausgangsvariablen
     */
    constructor(inputVariables:Array<SignalTreeRepresentation> , outputCount:number){
        //Ist die Variablenliste leer so kann dafuer keine Wertetabelle angelegt werden
        if(inputVariables.length >0){
            //TODO : ueber 32 Eingange nicht moeglich


            this.inputVariables = inputVariables;
            this.inputCount = inputVariables.length;
            this.outputCount = outputCount;
            //Erstelle so viele Zeilen wie Ausgangsvariablen in der Eintragsliste
            this.oneEntrys = new Array(this.outputCount)
            this.isFinalized=false;
        }
      else{
          throw new Error("Wertetabelle fuer 0 Eingaenge nicht moeglich")
      }
    }

    /**
     * Setze einen Eintrag fuer einen bestimmten Ausgang (Spalte) bei einer Eingangsbelegung (Zeile) zu 1 (kann ggf. Dopllungen erzeugen)
     * @param inputAssignmentIndex Eingangsbelegungsindex der Zeile (von 0 bis 2^(Anzahl der Eingangsvariablen) -1)
     * @param outputVariable Index der zu setzenden Ausgangsvariablen (von 0 bis Anzahl der Ausgangsvariablen -1)
     */
    setOneOutput(inputAssignmentIndex:number , outputVariable:number){
            //Fuege eine 1-Belegung fuer diese Zeile und die gegebene AusgangsvariablenSpalte hinzu 
            //eventuelle Redundanzen (Liste enthaelt mehrmals die gleiche 1-Belegung) noch nicht behandeln
            
            //pruefe ob die angegebenen Indize fuer die Belegung und die Ausgangsvariable moeglich sind bei der aktuellen Tabellengroesse
            if(inputAssignmentIndex < Math.pow(2,this.inputCount) && inputAssignmentIndex >-1 && outputVariable>-1 && outputVariable<Math.pow(2,this.outputCount)){
                //Fuege in die Zeile des Ausgangs den Index der 1 Belegung hinzu (auch wenn dieser ggf. schon in der Liste enthalten ist)
                this.oneEntrys[outputVariable].push(inputAssignmentIndex)
                //Veraenderungen bedeuten, dass die Tabelle nicht mehr finaisiert ist
                this.isFinalized=false;
            }
            else{
                throw new Error("invalid index")
            }

    }

    /**
     * Finalisiere die Wertetabelle (entfernt eventuelle Dopplungen und Soriert die Eintrage)
     * Das finalisierte Objekt kann nicht mehr vernaendert werden
     */
    finalize():void{
         //Sortiere alle 1-BelegungsIndizes aller Ausgangswerteverlaufe aufsteigend und entferne anschliessend alle Dopllungen

        //laufe ueber alle Ausgangswerteverlaufe
        for(let outputCounter= 0; outputCounter<this.oneEntrys.length ; outputCounter++){
            //Greife aktuelle Zeile fuer einen Ausgang
            let currentOutputRow = this.oneEntrys[outputCounter]
            //sortiere die Eingangsbelegungsindizes der 1Eintraege aufsteigend
            currentOutputRow.sort(function compareNumbers(a:number, b:number):number{return a - b})
            //eventuelle Dopplungen stehen nun hintereinander --> entferne diese
            //Laufe uber alle Eingangsbelegungsindizes bei denen die aktuelle Variable zu 1 gestzt wurde
            let entryCounter = 0;
            while(entryCounter < currentOutputRow.length-1){
                let currentIndex = currentOutputRow[entryCounter]
                let nextIndex = currentOutputRow[entryCounter+1]
                //ist der nachfolgende Index der gleiche wie der aktuelle --> aktueller Eintrag ist Dopplung und wird entfernt
                if(currentIndex === nextIndex){
                    //Dopllung gefunden --> entferne sie
                    currentOutputRow.splice(entryCounter,1)
                    //in diesem Fall darf der EntryCounter nicht inkrementiert werden, da sich die Liste verkuerzt hat
                } 
                else{
                    //Keine Dopllung--> entryCounter inkrementieren
                    entryCounter++
                }
            }
        }
        //Tabelle ist finalisiert
        this.isFinalized=true;
    }

}