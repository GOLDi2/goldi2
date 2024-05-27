import produce, { applyPatches, Patch } from "immer";
import { AppActions, LOAD_STATE_FROM_FILE, REDO, UNDO } from "../../types/Actions/appActions";
import { AppState } from "../../types/NormalizedState/AppState";
import { createMetaState, MetaState } from "../../types/NormalizedState/MetaState";
import { appStateReducer } from "./appState";
import { enablePatches } from "immer"
import { current } from "@reduxjs/toolkit";
// Erlaube das Nutzen von Patches fuer Redo und Undo
enablePatches()



/** Anzahl der maximal erlaubten Versionen im Speicher (beinhaltet sowohl zukuenftige als auch vorangegangene Versionen)*/
const MAXIMUM_NUMBER_OF_VERSIONS = 20

/** Liste fuer alle Actiontypes die ggf. nicht in die Versionsgeschichte einfliessen sollen (koennen somit nicht rueckgaengig gemacht werden) */
const notUndoableActionTypes: Array<string> = [REDO, UNDO]



/** 
 * Reducer fuer den Metastate (ist Producer und bekommt echten State uebergeben--> copy-on-write is in effect)
 * Er fuehrt die Actions auf dem State der Anwendung aus und speichert die jeweiligen Veraenderungen um diese ggf. rueckgaengig machen zu koennen
 * Nutze auch hier einen Producer damit auch die oberste Ebene des States aus immutable Data besteht --> Immer unterstuetzt nested producer
 * @see [immer nested Producers](https://immerjs.github.io/immer/docs/pitfalls#always-use-the-result-of-nested-producers): 
 *          Immer unterstutzt den Fall dass in einem Producer ein Teil des Drafts anhand des Ergebnis eines anderen Producers gesetzt wird und wahrt hierbei das Konzept 
 *          der immutable Data 
 *          Hier: innerer Producer( applyPatches im Falle einer Metaaction bzw. {@link appStateReducer} im Falle einer normalen Action) veraendert den normalen Appstate
 *          immutable und ausserer Producer {@link curriedMetaStateReducer} uerbernimmt dieses Teilergebnis in den Draft des gesamten Metastates und fuehrt ggf. weitere 
 *          Aenderungen durch. Am Ende werden von Immer alle Aenderungen immutable aus dem Draft des Metastates in den naechsten Metastate ueberfuehrt.
 *          !!Objekte, welche durch {@link applyPacthes} wiederhergestellt werden, verlieren das Symbol "immerable" und sind somit nicht mehr draftable
 *          --> Im State duerfen also alle Objekte, welche zur Laufzeit erstellt und geloescht werden koennen, NICHT als Objekte von Klassen realisiert werden.
 *              Sie MUESSEN ein reines JASON- Objekt (welches ggf. einem Interface genuegt) sein. Alle Objekte, die trotz moeglicher Aenderungen mit Klassen realisiert werden
 *              (z.B. die Knoten des Logikbaums {@link ICompleteTreeRoot}) MUESSEN immutable veraendert werden !!
 *          --> Objekte welche permanent existieren (alle Hirachiestufen des States) koenen auch durch Klassen umgesetzt werden
 *                      
 * @param state Metastate auf dem die Action ausgefuhert werden soll (echter State von dem durch Immer eine Arbeitskopie erstellt wird)
 * @param action auszufuehrende Action 
 * @returns Neuer Metastate nach dem Ausfuehren der Action
 */
export const curriedMetaStateReducer = (state: MetaState = createMetaState(), action: AppActions): MetaState => {
    return produce(state, draft => {
        //Pruefe ob eine Undo oder Redo Action vorliegt (Metaactions)
        switch (action.type) {
            //In den Metaactions wird nicht auf dem draft, sondern immutable auf dem echten state gearbeitet














            case LOAD_STATE_FROM_FILE: {
                //veraendere die Ansicht
                draft.appState = (<any>action.payload).appState;
                draft.canRedo = (<any>action.payload).canRedo;
                draft.canUndo = (<any>action.payload).canUndo;
                draft.currentVersion = (<any>action.payload).currentVersion;
                draft.versionHistory = (<any>action.payload).versionHistory;
    
                break;
            }
    













            case UNDO: {
                //Falls der aktuelle State ein Undo erlaubt so fuehre es aus (sonst: tue nichts)
                if (state.canUndo) {
                    //ein Undo ist moeglich --> Fuehre es auf dem State aus
                    //applyPatches fuhrt die Aenderungen in Form der Patches auf dem ersten Argument (dem State aus)
                    //applyPacthes ist selbst ein Producer weshalb alle Aenderungen auf einer Kopie des States ausgefuehrt werden und anschliessend immutable uebernommen werden
                    //  Daher kann der tatsaechliche State uebergeben werden
                    let stateAfterUndo: AppState = applyPatches(state.appState, state.versionHistory[state.currentVersion].undoPatches)
                    // console.log(stateAfterUndo);
                    

                    //nun muessen noch Flags zum Redo und Undo gemaess der Anforderungen gesetzt werden --> fuehre alle Aenderungen auf dem Draft aus
                    draft.appState = stateAfterUndo //Ubernimm die Aenderungen der Patches 
                    draft.currentVersion = draft.currentVersion - 1 //setze die Version um eins zurueck
                    draft.canUndo = draft.versionHistory.hasOwnProperty(draft.currentVersion)//Pruefe ob es fuer diese Version noch Patches gibt auf Basis derer man erneut zuruecksetzen kann
                    draft.canRedo = true //Undo kann immer rueckgaengig gemacht werden

                }
                break;
            }

            case REDO: {
                //Falls der aktuelle State ein Redo erlaubt so fuehre es aus (sonst: tue nichts)
                if (state.canRedo) {
                    //ein Redo ist moeglich --> Fuehre es auf dem State aus
                    //applyPatches fuhrt die Aenderungen in Form der Patches auf dem ersten Argument (dem State aus)
                    //applyPacthes ist selbst ein Producer weshalb alle Aenderungen auf einer Kopie des States ausgefuehrt werden und anschliessend immutable uebernommen werden
                    //  Daher kann der tatsaechliche State uebergeben werden
                    let currentVersion = state.currentVersion + 1
                    let stateAfterRedo = applyPatches(state.appState, state.versionHistory[currentVersion].redoPatches)
                    // console.log(stateAfterRedo);

                    //nun muessen noch Flags zum Redo und Undo gemaess der Anforderungen gesetzt werden --> fuehre alle Aenderungen auf dem Draft aus
                    draft.appState = stateAfterRedo //Ubernimm die Aenderungen der Patches (nested Producer sind erlaubt)
                    draft.currentVersion = currentVersion //Uebernimm die neue Versionsnummer
                    draft.canUndo = true //Redo kann immer zurueckgesetzt werden
                    //Pruefe ob es fuer die naechste  Version noch Patches gibt auf Basis derer man erneut nach vorne springen kann 
                    draft.canRedo = draft.versionHistory.hasOwnProperty(currentVersion + 1)

                }

                break;
            }

            default: {
                //Es liegt keine Metaaction vor --> fuehre die Action normal aus
                //Fuehre die Action auf dem State der Anwendung aus und speichere die dabei entstehenden Patches, sowie den Folgezustand
                let [nextAppState, patches, inversePatches]: [AppState, Patch[], Patch[]] = appStateReducer(state.appState, action) //Immer unterstuetzt nested producer
                //(Aufruf des Producers fuer den Appstate im Producer fuer den MetaState) 
                // Da es sich beim AppStateReducer um einen Producer handelt kann direkt der State uebergeben werden, da Aenderungen auf einer Kopie ausgefuehrt werden

                // console.log(nextAppState);
                
                draft.appState = nextAppState //Speichere den naechsten State

                //pruefe ob die Action zu den Actions gehoert die in die Versionsgeschichte einfliessen sollen (kann rueckgaengig gemacht werden)
                if (notUndoableActionTypes.findIndex(currentActionType => currentActionType === action.type) === -1) {
                    //Liegt eine Action vor die Rueckgaengig gemacht werden kann, so verbiete erneutes Vorwaertsgehen auf einen dadurch ungueltigen Zustand
                    draft.canUndo = true
                    draft.canRedo = false

                    //Die Action war nicht in der Liste der Actions die nicht in die Versionen einfliessen --> speichere die Aenderungen dieser Action als eine neue Version
                    draft.currentVersion++ //naechste Version
                    draft.versionHistory[draft.currentVersion] = { redoPatches: patches, undoPatches: inversePatches } //Speichere alle Aenderungen dieser Version

                    delete draft.versionHistory[draft.currentVersion + 1] //Aenderungen in der Gegenwart machen eventuell noch bekannte Aenderungen im naechsten Schritt nichtig (ergben potentiell keinen Sinn mehr)
                    delete draft.versionHistory[draft.currentVersion - MAXIMUM_NUMBER_OF_VERSIONS] // Eventuell zu weit in der Vergangenheit liegende Versionen loeschen (bedenke maximale Laenge der Versionsgeschichte)
                }

                break;
            }
        }

        return draft
    })

}

