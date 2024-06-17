import { immerable } from "immer";
import { createViewConfig, ViewConfig } from "./ViewConfig";
import { createNormalizedEditorState, NormalizedEditorState } from "./NormalizedEditorState";

/** Interface fuer den State der im Store gespeichert wird */
export interface AppState{

    /** Teilstate fuer den Zustand des Editors */
    normalizedEditorState:NormalizedEditorState

    /** Teilstate fuer Darstellung  */
    viewState:ViewConfig

}

export function createAppState():AppState{
    return {normalizedEditorState:createNormalizedEditorState() , viewState: createViewConfig()}
}