import { immerable } from 'immer'
import { Viewstate } from '../view';
import { AutomatonFrameWork } from './AutomatonSubState';

/**
 * Sammlung aller Anforderungen an die Berechnung der externen Darstellung der Daten aus dem State
 * Definiere welche Daten in welcher Form extrahiert werden sollen
 * Diese gehen als Konfiguration in die Selektoren ein, welche dann die Daten des States entsprechend der Konfiguration berechnen
 */
export interface ViewConfig {

    /** Konifiguration fuer die allgemeine Darstellung aller Automaten (Koniguration fuer den Automatenselektor)*/
    automatonViewConfig: AutomatonViewConfig

    /* *Konfiguration fuer die Darstellung der Gleichungen (Konfiguration fuer den Gleichungsselektor) */
    equationViewConfig: EquationViewConfig

    /** Konfiguration fuer die Darstellung der abgeleiteten fusionierten Automaten */
    mergedAutomatonViewConfig: MergedAutomatonViewConfig

}
/**
  * Erstelle die initiale Konfiguration fuer die Selektoren zur Berechnung der externen Darstellung
  */
export function createViewConfig(): ViewConfig {
    let automatonViewConfig = createAutomatonViewConfig() //initiale Konfiguration des Automatenselektors 
    let equationViewConfig = createEquationViewConfig() //initiale Koonfiguration des Gleichungsselektors
    let mergedAutomatonViewConfig = createMergedAutomatonViewConfig() //initiale Koonfiguration der Ansicht 

    return { automatonViewConfig: automatonViewConfig, equationViewConfig: equationViewConfig, mergedAutomatonViewConfig: mergedAutomatonViewConfig }
}


/** 
 * Konfiguration fuer die Extraktion der Automaten aus dem State durch den Automatenselektor 
*/
export interface AutomatonViewConfig {

    /**Sollen Nullkanten (logisch 0 als Bedingung) werden ?*/
    showZeroTransitions: boolean

    /**
     * Sollen die Ausagben, die gleich Null sind angezeigt werden ?
     * Wird dies zu true gesetzt werden in allen Knoten alle Ausgaben angezeigt (nicht nur die die im jeweiligen Knoten explizit gesetzt wurden)
    */
    showZeroOutputs: boolean

    /**Sollen nur die aktiven Automaten angezeigt werden ?*/
    onlyShowActiveAutomatons: boolean

}


/**
 * Erstelle eine initale Koniguration fuer den Automatenselektor
 */
export function createAutomatonViewConfig(): AutomatonViewConfig {
    let showZeroTransitions = true // initial Nullkanten anzeigen
    let showZeroOutputs = true //inital Nullausgaben anzeigen
    let onlyShowActiveAutomatons = true //initial nur aktive Automaten anzeigen

    return { showZeroOutputs: showZeroOutputs, showZeroTransitions: showZeroTransitions, onlyShowActiveAutomatons: onlyShowActiveAutomatons }
}

/** 
* Konfiguration fuer die Extraktion der Gleichungen aus dem State durch den Gleichungsselektor 
*/
export interface EquationViewConfig {

    /** Wie stark sollen die Gleichungen vor der Ausgabe minimeiert werden?*/
    minimizationLevel: MinimizationLevel

}

/**
 * Erstelle die initale Konfiguration fuer den Gleichungsselektor
 */
export function createEquationViewConfig(): EquationViewConfig {
    return { minimizationLevel: MinimizationLevel.Unminimized } //inital keine Minimierung der Gleichungen
}

/**
 * Konfiguration fuer die die abgeleitete Automatenansicht der Fusionsautomaten in der die Kozenpte der Zustaende und der Knoten aeqauivalent sind (ein Knoten pro Zustand)
 */
export interface MergedAutomatonViewConfig {

    /** Sollen unvollstaendige Zuastaende markiert werden ? */
    highlightIncompleteStates: boolean

    /** Sollen wiederspruechlige Zustaende markiert werden ? */
    highlightSelfContradictoryStates: boolean

    /** Sollen die Ausduecke in den Fusionsautomaten minimiert werden (Ausgaben und Kanten)? */
    minimizeExpressions: boolean

}

/**
    * Erstelle eine neue Konfiguration fuer die Ansicht der Fusionsautomaten
    */
export function createMergedAutomatonViewConfig(): MergedAutomatonViewConfig {
    //initial werder Widerspreuche und Unvollstaednigkeiten angezeigt
    let highlightIncompleteStates = true
    let highlightSelfContradictoryStates = true

    //initial die Ausdruecke nicht minimieren
    let minimizeExpressions = false

    return { highlightIncompleteStates: highlightIncompleteStates, highlightSelfContradictoryStates: highlightSelfContradictoryStates, minimizeExpressions: minimizeExpressions }
}


/** Enumeration fuer die verschiednen Stufen der Minimierung von Ausdruecken */
export const enum MinimizationLevel {
    /** keine Minimierung durchfuehren */
    Unminimized = "UNMINIMIZED",
    /** Minimierung ohne h-Stern (Dont-Care = 0) */
    Minimized = "MINIMIZED",
    /** Minimierung bezueglich h-Stern (Einbeziehung des Dont-Care-Ausdrucks)*/
    HStarMinimized = "HStarMinimized"
}


/** Typ fuer alle existenten Arten von Konfigurationen */
export type ViewConfigs = AutomatonViewConfig | EquationViewConfig


