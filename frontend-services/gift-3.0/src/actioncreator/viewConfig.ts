import { AppActions } from '../types/Actions/appActions';
import { SET_AUTOMATON_VISIBILITY, SET_EQUATION_MINIMIZATION_LEVEL, SET_INCOMPLETE_STATES_HIGHLIGHTING, SET_SELF_CONTRADICTORY_STATES_HIGHLIGHTING, SET_ZERO_OUTPUT_VISIBILITY, SET_ZERO_TRANSITIONS_VISIBILITY, SHOW_MINIMIZED_EXPRESSIONS } from '../types/Actions/viewConfig';
import { MinimizationLevel } from '../types/NormalizedState/ViewConfig';
// Liste aller Actioncreator für Actions, welche die GUI betreffen

/**
 * Erstellt Action zum Veraendern der Sprache
 * @param newLanguage neue Sprache
 */
export const doChangeLanguage =(newLanguage:string): AppActions => (
    {
        type: "CHANGELANGUAGE",
        payload:newLanguage
    }
);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Allgemeine Actions 

/**
 * Setze den geforderten Minimierungsgrad der ausgelsenen Gleichungen
 * @param minimizationLevel wie stark sollen die ausgelesenen Gleichungen minimiert werden?
 */
export function SetEquationMinimizationLevel(minimizationLevel:MinimizationLevel):AppActions{
    return{
        type:SET_EQUATION_MINIMIZATION_LEVEL,
        payload: minimizationLevel
    }
}

/**
 * Veranedern der Einstellung ob Nullkanten innerhalb der Automatenansicht angezeigt werden sollen oder nicht 
 * (bezieht sich nur auf Kanten an denen eine reine logisch 0 ohne Operatoren steht)
 * @param showZeroTransitions Sollen Nullkanten innerhalb der Automatendarstellung angezeigt werden?
 */
export function SetZeroTransitionsVisibility(showZeroTransitions:boolean):AppActions{
    return{
        type:SET_ZERO_TRANSITIONS_VISIBILITY,
        payload: showZeroTransitions
    }
}

/**
 * Veranedern der Einstellung ob Nullausgaben (Ausgabe im Knoten = logisch 0) innerhalb der Automatenansicht angezeigt werden sollen oder nicht 
 * (bezieht sich nur auf Ausgaben bei denen eine reine logisch 0 ohne Operatoren steht)
 * Wird dies zu true gesetzt werden in allen Knoten alle Ausgaben angezeigt (nicht nur die die im jeweiligen Knoten explizit gesetzt wurden)
 * @param showZeroOutputs Sollen Nullausgaben innerhalb der Automatendarstellung angezeigt werden?
 */
export function SetZeroOutputVisibility(showZeroOutputs:boolean):AppActions{
    return{
        type:SET_ZERO_OUTPUT_VISIBILITY,
        payload: showZeroOutputs
    }
}


/**
 * Veranedern der Einstellung ob nur aktive Automaten innerhalb der Automatenansicht angezeigt werden sollen oder nicht 
 * @param onlyShowActiveAutomatons Sollen nur die aktiven Automaten innerhalb der Automatendarstellung angezeigt werden?
 */
export function SetAutomatonVisibility(onlyShowActiveAutomatons:boolean):AppActions{
    return{
        type:SET_AUTOMATON_VISIBILITY,
        payload: onlyShowActiveAutomatons
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Actions fuer den View auf die Fusionsautomaten

/**
 * Veranedern der Einstellung ob unvollstaendige Zustaende innerhalb der Fusionsautomaten hervorgehoben werden sollen oder nicht
 * @param showIncompleteStates Sollen unvollstaendige Zustaende hervorgehoben werden ? 
 */
 export function SetIncompleteStatesHighlighting(showIncompleteStates:boolean):AppActions{
    return{
        type:SET_INCOMPLETE_STATES_HIGHLIGHTING,
        payload: showIncompleteStates
    }
}

/**
 * Veranedern der Einstellung ob widerspruchsbehaftete Zustaende innerhalb der Fusionsautomaten hervorgehoben werden sollen oder nicht
 * @param showSelfContradictoryStates Sollen widerpsuchsbehaftete Zustaende hervorgehoben werden ? 
 */
 export function SetSelfContradictoryStatesHighlightingAction(showSelfContradictoryStates:boolean):AppActions{
    return{
        type:SET_SELF_CONTRADICTORY_STATES_HIGHLIGHTING,
        payload: showSelfContradictoryStates
    }
}

/**
 * Veranedern der Einstellung ob die logischen Ausdruecke innerhalb der Fusionsautomaten (Ausgaben und Kantenbedingungen) minimiert angezeigt werden sollen oder nicht 
 * @param showMinimizedExpressions Sollen die logischen Ausdruecke innerhalb der Fusionsautomaten (Ausgaben und Kantenbedingungen) minimiert angezeigt werden ?
 */
 export function ShowMinimizedExpressions(showMinimizedExpressions:boolean):AppActions{
    return{
        type:SHOW_MINIMIZED_EXPRESSIONS,
        payload: showMinimizedExpressions
    }
}

