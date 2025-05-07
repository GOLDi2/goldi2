import { immerable } from "immer";
import { NameErrorTupel } from "../ErrorElements";
import { HasID, StorageObject } from "./NormalizedObjects";

/** Teil des States, der alle Informationen zu den Ein- und Ausgangsvariablen abspeichert*/
export interface SignalSubState {

    /** Alle Informationen zu den Eingangsvariablen */
    inputSubState: InputSubState

    /** Alle Informationen zu den Ausgangsvariablen */
    outputSubState: OutputSubState

}
/** Erstelle einen neuen Substate fuer die Ein- und Ausgangsvariablen (initial leer) */
export function createSignalSubState(): SignalSubState {
    let inputSubState = createInputSubState() //neue Substate (leer)
    let outputSubState = createOutputSubState() //neue Substate (leer)

    return { inputSubState: inputSubState, outputSubState: outputSubState }
}

/** Teil des States, der alle Informationen zu den Einvariablen abspeichert */
export interface InputSubState {

    /** 
     * Liste mit den IDs aller aktuell existenten Variablen
     * Diese dienen gleichzeitig als Key innerhalb aller Speicherobjekte auf dieser Ebene fuer die entsprechenden Informationen der Variablen
     */
    inputIDs: Array<number>

    /**
     * Objekt ("Liste") zum Speichern der Belegungen aller Variablen
     * Die Belegung des Eingangs x_i (mit Id: i) ist unter dem Key i abgelegt
     */
    assignments: StorageObject<InputAssignment>


    /**
     * Objekt ("Liste") zum Speichern der nutzerdefinierten Namen aller Variablen
     * Der Name des Eingangs x_i (mit Id: i) ist unter dem Key i abgelegt
     */
    customNames: StorageObject<NameTupel>

}


/**
 * Erstelle einen neuen Substae fuer die Informationen der Eingaenge
 * Initalbelegung: leer
 */
export function createInputSubState(): InputSubState {
    let inputIDs: Array<number> = [] //inital sind keine Eingaenge existent --> keine IDs
    //Keine weiteren Eintraege noetig
    let assignments = {}
    let customNames = {}

    return { inputIDs: inputIDs, assignments: assignments, customNames: customNames }
}


/** Teil des States, der alle Informationen zu den Ausgangsvariablen abspeichert */
export interface OutputSubState {

    /** 
     * Liste mit den IDs aller aktuell existenten Variablen
     * Diese dienen gleichzeitig als Key innerhalb aller Speicherobjekte auf dieser Ebene fuer die entsprechenden Informationen der Variablen
     */
    outputIDs: Array<number>


    /**
     * Objekt ("Liste") zum Speichern der nutzerdefinierten Namen aller Variablen
     * Der Name des Ausgangs y_i (mit Id: i) ist unter dem Key i abgelegt
     */
    customNames: StorageObject<NameTupel>

}

/**
* Erstelle einen neuen Substae fuer die Informationen der Ausgaenge
* Initalbelegung: leer
*/
export function createOutputSubState(): OutputSubState {
    let outputIDs: Array<number> = [] //inital sind keine Ausgaenge existent --> keine IDs
    //Keine weiteren Eintraege noetig
    let customNames = {}

    return { customNames: customNames, outputIDs: outputIDs }
}











/** Tupel als Speicher fuer die Belegunge einer Variablen */
export interface InputAssignment extends HasID {

    /** Id der Eingangsvariablen deren Belegung mit diesem Tupel abgespeichert wird */
    id: number

    /**logische Belegung der Eingangsvariablen mit obiger ID */
    assignment: boolean
}

/** Tupel fuer einen nutzerdefinierten Namen und einen eventuell aufgetretenen Fehler von etwas im State adressierbaren */
export interface NameTupel extends HasID {

    /** Id des Signals dessen Name mit diesem Tupel abgespeichert wird */
    id: number

    /** nutzerdefinierter Name des Signals und eventuell aufgetretene Fehler*/
    customName: NameErrorTupel

}
