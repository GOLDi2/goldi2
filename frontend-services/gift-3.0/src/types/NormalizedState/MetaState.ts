import { immerable, Patch, produceWithPatches } from "immer";
import { AppState, createAppState } from "./AppState";
import { StorageObject } from "./NormalizedObjects";

/** 
 * Metastate der Anwendung
 * Speichert neben dem State der Anwendung auch die Informationen uber den Versionsverlauf des States 
 * (kennt alle verganegenen und ggf. zukuenfitgen States um Redo und Undo implemntieren zu koennen)
 */
export interface MetaState{

    /** interner Zustand der gesamten Anwendung */
    appState:AppState

    /** 
     * Liste mit allen vorangegenagenen und ggf. zukuenfitgen Aenderungen (falls diese bekannt sind) 
     * Die Nummer einer Version dient als Key fuer die Aenderungen die innerhalb dieser Version durchgefuehrt wurden
     */
    versionHistory:StorageObject<Changes>

    /** Nummer der aktuellen Version */
    currentVersion:number

    
    /** Kann auf dem aktuellen State eine Action rueckgaengig gemacht werden? (kann auf die vorherige Version gesprungen werden?)
     * 
     * 
     * Die Flags werden gemeass der folgenden Regeln gesetzt: 
     * @see [Immer Redo and Undo](https://techinscribed.com/implementing-undo-redo-functionality-in-redux-using-immer/?utm_source=stackoverflow&utm_medium=referral&utm_campaign=stackoverflow_answering)
     * - When we receive an undoable action – we can always undo but cannot redo anymore. That’s how undo-redo works in Google Docs.
     * - Whenever you perform an undo – you can always redo and keep doing undo as long as we have a patch for it.
     * - Whenever you redo – you can always undo and keep doing redo as long as we have a patch for it.
     * 
     */
    canUndo:boolean

    /** Kann auf dem aktuellen State eine rueckgaengig gemachte Action erneut ausgefuehrt werden? (kann auf die nachste Version aus der Zukunf gesprungen werden?) */
    canRedo:boolean

}

export function createMetaState():MetaState{
    let versionHistory = {}//noch keine Versionsgeschichte
    let canRedo = false //inital keine Versionsgeschichte vorhanden
    let canUndo = false
    return {appState: createAppState() , versionHistory:versionHistory, currentVersion:-1 , canRedo:canRedo , canUndo:canUndo}
}


/**
 *  Darstellung aller Aenderungen einer Action in Form einer Liste von Patches 
 * Beinhaltet sowohl die Patches zum Wiederherstellen des Ausgangszustandes als auch die um die Aenderung erneut auszufuehren
 */
export interface Changes{

    /** Patches die durch die Action ausgefuehrt wurden */
    redoPatches: Array<Patch>
    /** Patches um die ausgefuhrten Patches rueckgaengig zu machen */
    undoPatches:Array<Patch>
}
