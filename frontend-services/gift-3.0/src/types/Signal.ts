import { immerable } from 'immer';
import { Type } from 'typedoc/dist/lib/models';
import { FullApiTransformable } from './ApiTransformable';
import { CustomNames } from './BooleanEquations/CustomNames';
import { BaseCompleteTreeNode } from './BooleanEquations/LogicTrees/TreeNodeInterfaces';
import { SignalAssignment } from './BooleanEquations/SignalAssignment';
import { InternalIndependentControlSignal } from './ControlSignal';
import { NameErrorTupel } from './ErrorElements';
import { InternalInput } from './Input';
import { ExternalOutput, InternalOutput } from './Output';
import { ZVariable } from './ZVariable';



/**
 * Basisiimplementierung fuer alle Objekte die die interne Nummer ihrer Variabeln kennen und alle alle Informationen beinhatlen die sie im gesamten State eindeutig machen
 * !!! Sind unabhaengig von der Lage im State und immer global eindutig !!!
 * Hiervon erben alle intern Adressierbaren Elemente und spezifizieren ihren internen Namen
 * Koennen sich anhand einer globalen Variablenliste vollstaendig darstellen
 */
export abstract class BaseInternAdressable{
    [immerable] = true;
    /**interne Signalnummer (ggf. nur lokal eindeutig --> die erbenden Klassen nutzen ggf. weitere Informationen um die Eindeutigkeit zu erzuegen) */
    public number:number

    /**
     * Erstelle eine neus intern adressierbares Objekt
     * @param number Nummer des Objektes (muss > 0 sein)
     * @throws "invalid variableNumber" falls die uebergebene Nummer <0 ist
     */
    constructor(number:number){
        if(number<0){
            throw new Error("invalid variableNumber");
        }
        this.number = number
    }

    /**Ausgabe der internen Nummer des Signals 
     * @returns interne Nummer des Signals
    */
    getNumber():number{
        return this.number
    }

    /**Ausgabe des internen Namen 
     * @returns Interner Name des Signals als String (ggf. nur lokal eindeutig)
    */
    abstract getInternalName():string

    /**
     * Mit nutzerdefiniertem Namen ausgeben (dieser ist innerhalb aller im System erlaubten Gleichungstypen eindeutig)
     * Eingaenge,Ausgaenge und z-Variablen werden direkt mit ihrem Namen dargestellt (nie Verwechslung innerhalb einer Gleihcung moeglich da Ein- und Ausgaenge nie auf der gleichen
     * Seite der Gleichung auftreten und alle z-Variablen innerhalb einer Gleichung hier immer zu dem gleichen Automaten gehoren muessen) , Steuersignale mit "automatenname.Variablenname"
     * @param customNames nutzerdefinierte Bezeichnungen aller Variablen im System
     * @returns nutzerdefinierte Bezeichnung als String (global eindeutig innerhalb einer Gleichung --> nur Eingaenge und Ausgaenge haben ggf. gleichen String)
     */
    abstract toCustomString(customNames:CustomNames):string

    /**
     * Entsrpche ich einer Darstellungsform des uebergebene Signal ? (alle Parameter die das Signal global eindeutig identifizieren stimmen ueberein)
     * @param internalSignal interene Signaldarstellung mit der verglichen werden soll
     * @returns ist die uebergebene Signaldarstellung eine Darstellung von mir ?
     */
    abstract matchesToInternalRepresentation(internalSignal:BaseInternAdressable):boolean
 
}

/**
 * Darstellung eines global Eindeutigen  Signals nur anhand seines nutzerdefinierten Namens
 * --> Nutzerdefinierte Darstellung von Signalen
 */
export abstract class CustomNameRepresentation {
    /**externer (lokal eindeutiger)  Name --> erbende Klassen spezifizeiren evtl. mehr Parameter fuer globale Eindeutigkeit*/
    customName:string
    constructor(customName:string) {
        this.customName = customName 
    }
}


/** Interface fuer die Logikbaum-gerechte Darstellungsform von Variablen ( diese beinhalten alle Informationen zur Baumdarstellung) 
 * All diese Variablen koennen in einem Baum enthalten sein und sich zu Einem Baum bzw. einer Belegung ihrer selbst transfromieren
*/
export interface SignalTreeRepresentation extends BaseInternAdressable{
    
    /**
     * Erstelle einen logischen Baum aus sich selbst
     * @param bracketCounter Wie viele Klammern hat der Knoten um sich herum
     */
    createCompleteTreeNode(bracketCounter?:number):BaseCompleteTreeNode

    /**
        * Erstelle eine Belegung von sich selbst in interner Darstellung
        * @param assignment Belegung die der Variablen zugeordnet werden soll
        * @returns Paar dieser Variablen mit ihrer aktuellen Belegung
        */
       createAssignment(assignment:boolean):SignalAssignment

}

/**
 * abstrakte Klasse zur Darstellung einer Variablen mit ihrem nutzerdefinierten Namen (also ihre extrene Darstellung)
 * Sind global eindeutig
 */
export abstract class ExternRepresentation {
    [immerable] = true;

    /** Variable fuer die ihre exteren Darstellung abgebildet werden soll  */
    public variable: InternalIndependentControlSignal | InternalInput | InternalOutput

    /** nutzerdefinierter Name mit dem das Signal (lokal eindeutig) von aussen adressiert wird (beinhaltet NICHT automatenname. ...) */
    public customName:NameErrorTupel

    /**
     * Erstellt die externe Darstellung einer Variabeln
     * @param variable interne Darstellung der Variablen fuer die die externe Darstellung erzeugt werden soll
     * @param customName nutzerdefinierter Name der Variablen
     */
    constructor(variable: InternalIndependentControlSignal | InternalInput | InternalOutput , customName:NameErrorTupel){
        this.customName = customName
        this.variable = variable
    }

    /**
     * Bin ich die externe Darstellung der uebergebenen internen Darstellung? (alle Parameter die das Signal global eindeutig identifizieren stimmen ueberein)
     * Wenn ja trage ich den customName des internen Signals
     * @param internalSignal interene Signaldarstellung mit der verglichen werden soll
     */
     matchesToInternalRepresentation(internalSignal:BaseInternAdressable):boolean{
        //pruefe ob es sich bei der an dieser externen Darstellung angehangenen internen Variablen um die gesuchte Variable handelt
        return this.variable.matchesToInternalRepresentation(internalSignal)
    }

     /**
     * Entspreche ich der externen Darstellung dieses Signals (nur durch seinen custom Name spezifiziert)
     * @param candidate zu pruefender Kandidat
     */
    abstract matchesToCustomNameRepresentation(candidate:CustomNameRepresentation):boolean


}
