import produce, { Patch, produceWithPatches } from "immer";
import { AppActions } from "../../types/Actions/appActions";
import { AppState, createAppState } from "../../types/NormalizedState/AppState";
import { NormalizedEditorState } from "../../types/NormalizedState/NormalizedEditorState";
import {  normalizedEditorStateReducer } from "./normalizedEditorStateReducer";
import { viewConfigReducer } from "../viewConfig";

/**
 * Reducer fuer das ganze System  (ist Producer und bekommt echten State uebergeben--> copy-on-write is in effect)
 * Wendet die eingehenden Actions auf alle Teilstates an und sammle alle Aenderungen in Form von Patches 
 * {@link normalizedEditorStateReducer} und {@link viewConfigReducer} sind keine Producer damit alle Aenderungen von diesem Producer erkannt und als Patches gespeichert werden koennen
 * @see [immer produceWithPatches](https://immerjs.github.io/immer/docs/patches#producewithpatches)
 * @param state Metastate auf dem die Action ausgefuhert werden soll (echter State von dem durch Immer eine Arbeitskopie erstellt wird)
 * @param action auszufuehrende Action
 * @returns neuer State und Liste der Patches die aus dieser Aenderung resultieren (Patches zum rueckgaengigmachen und zum erneuten Ausfuehren der Aenderung)
 *              [nextState , patches , inversePatches]
 */
export const appStateReducer = (state:AppState = createAppState(), action: AppActions):[AppState , Patch[] , Patch[]]=> {
    //Wende produce an um innerhalb der Teilreducer immer auf einem Draft zu arbeiten
    //produceWithPatches speichert alle Aenderungen die durch die Action auf dem State vorgenommen wurden sowie die Patches die benoetigt werden um die Action rueckgaengig zu machen
    return produceWithPatches(state , draft => {
        //Wende die Action auf beide Teilstates an (nur wenn derjenige betroffen ist werden Aenderungen an ihm ausgefuehrt)
        normalizedEditorStateReducer(draft.normalizedEditorState,action)
        viewConfigReducer(draft.viewState ,action )
    })
}
