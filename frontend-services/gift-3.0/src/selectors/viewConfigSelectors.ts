////////////////////////////////////////////////////////////////////////////////////////////////

import { AppState } from "../types/NormalizedState/AppState";
import { AutomatonViewConfig, EquationViewConfig, MergedAutomatonViewConfig } from "../types/NormalizedState/ViewConfig";

// Liste aller Getter

/**
 * Ausgabe der aktuellen Konfiguration des Gleichungsselektors
 * @param state State aus dem die Konfiguration herausgelesen werden soll
 * @returns  Konfiguration des Gleichungsselektors
 */
export function getEquationViewConfig(state:AppState):EquationViewConfig{
    return state.viewState.equationViewConfig
}

/**
 * Ausgabe der aktuellen Konfiguration des Automatenselektors
 * @param state State aus dem die Konfiguration herausgelesen werden soll
 * @returns  Konfiguration des Automatenselektors
 */
export function getAutomatonViewConfig(state:AppState):AutomatonViewConfig{
    return state.viewState.automatonViewConfig
}

/**
 * Ausgabe der aktuellen Konfiguration der Ansicht der fusionierten Automaten
 * @param state State aus dem die Konfiguration herausgelesen werden soll
 * @returns  Konfiguration Konfiguration der Ansicht der fusionierten Automaten
 */
export function getMergedAutomatonViewConfig(state:AppState):MergedAutomatonViewConfig{
    return state.viewState.mergedAutomatonViewConfig
}