import { MinimizationLevel } from "../NormalizedState/ViewConfig";

export const CHANGELANGUAGE = "CHANGELANGUAGE"

// Allgemeine Actions
export const SET_EQUATION_MINIMIZATION_LEVEL = "SET_EQUATION_MINIMIZATION_LEVEL"

export const SET_ZERO_TRANSITIONS_VISIBILITY = "SET_ZERO_TRANSITIONS_VISIBILITY"
export const SET_ZERO_OUTPUT_VISIBILITY = "SET_ZERO_OUTPUT_VISIBILITY"
export const SET_AUTOMATON_VISIBILITY = "SET_AUTOMATON_VISIBILITY"


//Actions zur Fusionsansicht
export const SET_INCOMPLETE_STATES_HIGHLIGHTING = "SET_INCOMPLETE_STATES_HIGHLIGHTING"
export const SET_SELF_CONTRADICTORY_STATES_HIGHLIGHTING = "SET_SELF_CONTRADICTORY_STATES_HIGHLIGHTING"

export const SHOW_MINIMIZED_EXPRESSIONS = "SHOW_MINIMIZED_EXPRESSIONS"

/**
 * Definition aller moeglichen Action-Types innerhalb der GUI als Interfaces 
 */


//////////////////////////////////////////////////////////////////////////////////////////+
//Allgemeine Actions
export interface ChangeLanguageAction{
    type: typeof CHANGELANGUAGE;
    payload:string;
}

export interface SetEquationMinimizationLevelAction{
    type: typeof SET_EQUATION_MINIMIZATION_LEVEL;
    payload: MinimizationLevel
}

export interface SetZeroTransitionsVisibilityAction{
    type: typeof SET_ZERO_TRANSITIONS_VISIBILITY;
    /** sollen Nullkanten angezeigt werden? */
    payload:boolean
}

export interface SetZeroOutputVisibilityAction{
    type: typeof SET_ZERO_OUTPUT_VISIBILITY;
    /** sollen Nullausgaben angezeigt werden? */
    payload:boolean
}

export interface SetAutomatonVisibilityAction{
    type: typeof SET_AUTOMATON_VISIBILITY;
    /**Sollen nur aktive Automaten angezeigt werden?*/
    payload:boolean
}


/////////////////////////////////////////////////////////////////////////////
//Actions zur Ansicht der Fusionsautomaten
export interface SetIncompleteStatesHighlightingAction{
    type: typeof SET_INCOMPLETE_STATES_HIGHLIGHTING;
    /**Sollen unvollstaendige Zustaende innerhalb der Fusionsautomaten angezeigt werden?*/
    payload:boolean
}

export interface SetSelfContradictoryStatesHighlightingAction{
    type: typeof SET_SELF_CONTRADICTORY_STATES_HIGHLIGHTING;
    /**Sollen widerspruchsbehaftete Zustaende innerhalb der Fusionsautomaten angezeigt werden?*/
    payload:boolean
}

export interface ShowMinimizedExpressionsAction{
    type: typeof SHOW_MINIMIZED_EXPRESSIONS;
    /**Sollen die Ausdruecke in den Fusionsautomaten (alle Ausgaben und Kantenbedingungen) minimiert angezeigt werden? */
    payload:boolean
}




type GeneralActionTypes = ChangeLanguageAction | SetEquationMinimizationLevelAction | SetZeroTransitionsVisibilityAction | SetZeroOutputVisibilityAction 
                            | SetAutomatonVisibilityAction;

type MergedAutomatonActionTypes = SetIncompleteStatesHighlightingAction | SetSelfContradictoryStatesHighlightingAction | ShowMinimizedExpressionsAction

/**
 * Verkettung aller Actions innerhalb der GUI
 */
export type ViewConfigActionTypes = GeneralActionTypes | MergedAutomatonActionTypes

