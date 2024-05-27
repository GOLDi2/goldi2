
import { createDraftSafeSelector } from '@reduxjs/toolkit';
import { produce } from 'immer'
import { AppActions } from '../types/Actions/appActions';
import { CHANGELANGUAGE, SET_AUTOMATON_VISIBILITY, SET_EQUATION_MINIMIZATION_LEVEL, SET_INCOMPLETE_STATES_HIGHLIGHTING, SET_SELF_CONTRADICTORY_STATES_HIGHLIGHTING, SET_ZERO_OUTPUT_VISIBILITY, SET_ZERO_TRANSITIONS_VISIBILITY, SHOW_MINIMIZED_EXPRESSIONS, ViewConfigActionTypes } from '../types/Actions/viewConfig';
import { createViewConfig, ViewConfig } from '../types/NormalizedState/ViewConfig';

/**
 * Erstelle die initiale Konfiguration fuer die Selektoren zur Berechnung der externen Darstellung der Daten aus dem State
 */
const initialState: ViewConfig = createViewConfig();

/**
 * Reducer fuer alle Veraenderungen an der Konfiguration der Ansicht (der Parameter der Selektoren) 
 * (ist KEIN Producer damit {@link appStateReducer} die Patches aller Aenderungen auf dem AppState sammeln kann --> muss einen Draft uebergeben bekommen)
 * @param draft Arbeitskopie des aktuellen Zustand der ViewConfig (muss ein Draft eines Producers auf hoeherer Hirachieebene sein)
 * @param action auszufuehrende Action, die auf dem aktuellen Zustand ausgefuehrt wird
 */
export const viewConfigReducer = (draft = initialState, action: AppActions): ViewConfig => {
    switch (action.type) {

        case SET_EQUATION_MINIMIZATION_LEVEL: {
            //Setze wie stark die ausgelesenen Gleichungen minimiert werden sollen
            draft.equationViewConfig.minimizationLevel = action.payload
            break;
        }

        case SET_ZERO_TRANSITIONS_VISIBILITY: {
            //setze die Konfiguration ob Nullkanten angezeigt werden sollen
            draft.automatonViewConfig.showZeroTransitions = action.payload

            break;
        }

        case SET_ZERO_OUTPUT_VISIBILITY: {
            //setze die Konfiguration ob Nullausgaben angezeigt werden sollen
            draft.automatonViewConfig.showZeroOutputs = action.payload

            break;
        }

        case SET_AUTOMATON_VISIBILITY: {
            //setze die Konfiguration ob nur aktive Automaten angezeigt werden sollen
            draft.automatonViewConfig.onlyShowActiveAutomatons = action.payload

            break;
        }

        case SET_INCOMPLETE_STATES_HIGHLIGHTING: {
            //setze die Konfiguration ob unvollstaendige Zustaende der Fusionsautomaten hervorgehoben werden sollen
            draft.mergedAutomatonViewConfig.highlightIncompleteStates = action.payload

            break;
        }

        case SET_SELF_CONTRADICTORY_STATES_HIGHLIGHTING: {
            //setze die Konfiguration ob widerspruchsbehaftete Zustaende der Fusionsautomaten hervorgehoben werden sollen
            draft.mergedAutomatonViewConfig.highlightSelfContradictoryStates = action.payload

            break;
        }

        case SHOW_MINIMIZED_EXPRESSIONS: {
            //setze die Konfiguration ob ob die logischen Ausdruecke innerhalb der Fusionsautomaten (Ausgaben und Kantenbedingungen) minimiert angezeigt werden sollen
            draft.mergedAutomatonViewConfig.minimizeExpressions = action.payload

            break;
        }



        default:
            break;
    }
    return draft;
}

