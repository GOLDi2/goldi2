import { immerable } from "immer";
import { InternalIndependentControlSignal } from "../../ControlSignal";
import { BaseInternAdressable, SignalTreeRepresentation } from "../../Signal";
import { ZVariable } from "../../ZVariable";
import { CustomNames } from "../CustomNames";
import { DerivedSystemAssignment, BaseSystemAssignment } from "../SystemAssignment";
import { TreeNode } from "./GeneralTree";

/**
 * Enumeration fuer alle moeglichen Typen von Variablen in den Ausdruecken
 */
export const enum VariableTyp {
    ControlSignal = "CONTROL_SIGNAL",
    InputSignal = "INPUT_SIGNAL",
    zSignal = "Z_SIGNAL",
}

/**
 * Enumeration fuer alle moeglichen Typen von logischen Konstanten
 */
export const enum ConstantType {
    ConstantOne = "CONSTANT_ONE",
    ConstantZero = "CONSTANT_ZERO"
}

/**
 * Basisimplementierung eines jeden Knotens eines vollstaendigen Baums ohne Platzhaltervariablen (koennen alle Arten von variablen enthalten)
 * hier koennen alle Methoden umgesetzt werden, die fuer alle Knoten gleich sind
 * Diese Elemente haengen an der Wurzel
 * Arbeitet nur mit internen Bezeichnungen fuer die Variablen und Operatoren
 */
export abstract class BaseCompleteTreeNode{
    // [immerable] = true;
     /** Anzahl an Klammer die beim Auslesen um diesen Block gesetzt werden sollen 
     * 0 bedeutet hierbei, dass nur die Klammern gesetzt werden,  die zur Korrekten Baumdarstellung noetig sind
     * 1 bedeutet, dass in jedem Fall um den Block eine Klammer gesetzt wird
     * jede Zahl >1 ist die Anhazhl an Klammern die um diesen Block stehen werden
    */
    public bracketCounter:number

    /** Indikator ob der Ausdruck z-Variablen enthaelt*/
    public zIndicator:boolean

    /** Indikator ob der Ausdruck Steuersignale enthaelt*/
    public controlSignalIndicator:boolean

    /**
     * Erstelle eine neue Basisdarstellung eines Knotens eines vollstaendigen Baums
     * @param zIndicator Indikator ob der Ausdruck z-Variablen enthaelt
     * @param controlSignalIndicator Indikator ob der Ausdruck Steuersignale enthaelt
     * @param bracketCounter Anzahl an Klammer die um den Block gesetzt werden sollen (initial =0 --> setzt nur die semantisch notwendigen Klammern)
     */
    constructor(bracketCounter:number=0 , zIndicator:boolean , controlSignalIndicator:boolean){
        this.bracketCounter = bracketCounter
        if(bracketCounter >0){
            this.bracketCounter = bracketCounter
        }
        else{
            this.bracketCounter = 0
        }
        this.zIndicator = zIndicator
        this.controlSignalIndicator = controlSignalIndicator
    }

     /**
     * Auswertung ob der Ausdruck Steuersignale enthaelt 
     * @returns enthaelt der Ausdruck Steuersignale?
     */
    containsControlSignals():boolean{
        return this.controlSignalIndicator
    }

    /**
     * Auswertung ob der AUsdruck z-Variablen enthaelt 
     * @returns enthaelt der Ausdruck z-Variablen?
     */
    containsZVariables():boolean{
        return this.zIndicator
    }
    

     /**Setze die Anzahl an Klammer die beim Auslesen um diesen Block gesetzt werden sollen 
     * 0 bedeutet hierbei, dass nur die Klammern gesetzt werden,  die zur Korrekten Baumdarstellung noetig sind
     * 1 bedeutet, dass in jedem Fall um den Block eine Klammer gesetzt wird
     * jede Zahl >1 ist die Anhazhl an Klammern die um diesen Block stehen werden
     * alle Zahlen kleiner als 0 werden als 0 angesehen
    */
    setBracketCounter(newValue:number):void{
        //Erlaube keine negativen Werte --> falls doch tue nichts
        if(newValue >= 0){
            this.bracketCounter = newValue
        }
    }

     /**lies die Anzahl an Klammer die beim Auslesen um diesen Block gesetzt werden sollen aus 
     * 0 bedeutet hierbei, dass nur die Klammern gesetzt werden,  die zur Korrekten Baumdarstellung noetig sind
     * 1 bedeutet, dass in jedem Fall um den Block eine Klammer gesetzt wird
     * jede Zahl >1 ist die Anhazhl an Klammern die um diesen Block stehen werden
    */
    getBracketCounter():number{
        return this.bracketCounter
    }

   /**Setze alle Klammerzaehler im ganzen Baum zu 0 sodass dieser nur noch mit den noetigsten Klammern ausgelsen wird 
    * alle Knoten setzen ihren eigenen Zaehler zu 0 --> Operatoren rufen dies zudem auf ihren Kindern auf (uberschreiben der Methode)
    */
    resetTreeBrackets():void{
        this.bracketCounter =0
    }

     /**
     * Knoten gibt sich und alle seine Kinder als logischen Ausdruck als String mit den internen Bezeichnungen und Operatoren zurueck
     * @returns aktueller Baum als logischer Ausdruck mit internen Bezeichnungen der Variablen und Operatoren (lokal eindeutige Namen)
     */
    abstract toInternalString(): string

     /**
     * Knoten gibt sich und alle seine Kinder als logischen Ausdruck als String mit den nutzerdefinierten Bezeichnungen und Operatoren zurueck
     * Es kuemmert sich immer der Vaterknoten um die korrekte Klammerung des Kindes
     * Eingaenge,Ausgaenge und z-Variablen werden direkt mit ihrem Namen dargestellt (nie verwechslung innerhalb einer Gleihcung moeglich da Ein- und Ausgaenge nie auf der gleichen
     * Seite der Gleichung auftreten und alle z-Variablen innerhalb einer Gleichung immer zu dem gleichen Automaten gehoren) , Steuersignale mit "automatenname.Variablenname"
     * @param customNames Alle aktuell im Sytsem definierten Variablen mit deren nutzerdefinierten Namen
     * @returns aktueller Baum als logischer Ausdruck mit nutzerdefinierten Bezeichnungen der Variabalen und Operatoren (alle Bezeichnungen sind innerhalb der Gleichung eindeutig)
     */
    abstract toCustomString(customNames:CustomNames): string

     /**
     * Ueberpruft ob der Eingang mit diesem Namen im Baum enthalten ist, wodurch der Baum korrumpiert ist
     * @param internalSignal Eingang in seiner internen Darstellung
     * @returns ist der Baum korrumpiert?
     */
    abstract corruptionCheckForInput(internalSignal: BaseInternAdressable): boolean

    /**
     * Ueberpruft ob ein Signal innerhalb des Baumes diesem Automaten zugeordnet ist , wodurch der Baum korrumpiert ist
     * @param id Id des Automaten
     * @returns ist der Baum korrumpiert? <==> ein Signal (z- oder Steuervariable) dieses Automaten ist im Baum enthalten
     */
    abstract corruptionCheckForAutomaton(id: number): boolean

    /**
     * Uebertprueft ob dieses Steuersignal im Baum verwendet wurde
     * @param controlSignal zu pruefendes Steuersignal in seiner internen Darstellung
     * @returns ist der Baum korrumpiert?
     */
    abstract corruptionCheckForControlSignal(controlSignal:InternalIndependentControlSignal): boolean

     /**
     * Auswertung des Ausdrucks anhand der vollstaendigen Belegung aller Variablen
     * @param variableAssignment Belegung aller Variablen, anhand derer der Ausdruck ausgewertet werden soll
     * @returns logische Belegung des Ausdrucks nach Auswertung 
     */
    abstract evaluate(variableAssignment: DerivedSystemAssignment): boolean

    /**
     * Extrahieret die Liste aller Variablen, die in diesem logischen Ausdruck verwendet werden
     * @returns unsortiert Liste aller im Ausdruck verwendeten Variablen (liegt nur eine Konstante vor, so ist die Liste leer)
     */
    abstract extractAllIncludedVariables():Array<SignalTreeRepresentation>

    /**
     * Auswertung des Ausdrucks nur Anhand der Eingangsbelegung
     * Alle eventuell enthaltenen Steuersignale werden fuer die Auswertung zu logisch 0 gesetzt
     * @param variableAssignment Belegung fuer die der Ausdruck ausgewertet werden soll
     * @returns logische Belegung des Ausdrucks nach Auswertung  
     */
    abstract evaluateWithoutCS(variableAssignment:BaseSystemAssignment):boolean

    /** Auslesen aller Steuersignale dieses Ausdrucks */
    abstract extractAllIncludedControlSignals():Array<InternalIndependentControlSignal>
    
    /** Auslesen aller zVariablen dieses Ausdrucks */
     abstract extractAllIncludedZVariables():Array<ZVariable>
}
