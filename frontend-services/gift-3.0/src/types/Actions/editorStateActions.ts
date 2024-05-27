
import { ApiTransitions } from '../ApiClasses/GraphRepresentation/Transitions'
import { ApiNode } from '../Node'
import { OperatorEnum } from '../Operators'
import { Point } from '../Points'
import { DerivedAutomatonViews, Viewstate } from '../view'

//Alles bezueglich dem allgmeienen EditorState
export const CHANGE_VIEW_STATE = "CHANGE_VIEW_STATE"

export const ADDGLOBALINPUT = "ADDGLOBALINPUT"
export const REMOVEGLOBALINPUT = "REMOVEGLOBALINPUT"
export const CHANGEGLOBALINPUTNAME = "CHANGEGLOBALINPUTNAME"

export const SET_GLOABL_INPUT = "SET_GLOBAL_INPUT"
export const RESET_GLOBAL_INPUT = "RESET_GLOBAL_INPUT"

export const ADDGLOBALOUTPUT = "ADDGLOBALOUTPUT"
export const REMOVEGLOBALOUTPUT = "REMOVEGLOBALOUTPUT"
export const CHANGEGLOBALOUTPUTNAME = "CHANGEGLOBALOUTPUTNAME"

export const CHANGECUSTOMOPERATOR = "CHANGECUSTOMOPERATOR"

export const SET_GLOBAL_INPUT_DONT_CARE = "SET_GLOBAL_INPUT_DONT_CARE"

// Alles bezueglich Automaten
export const NEWAUTOMATON = "NEWAUTOMATON"
export const REMOVEAUTOMATON = "REMOVEAUTOMATON"
export const CHANGEAUTOMATONNAME = "CHANGEAUTOMATONNAME"
export const SETAUTOMATONINFO = "SETAUTOMATONINFO"

export const SET_INITIAL_STATE = "SET_INITIAL_STATE"

export const ADDCONTROLSIGNAL = "ADDCONTROLSIGNAL"
export const REMOVECONTROLSIGNAL = "REMOVECONTROLSIGNAL"
export const CHANGECONTROLSIGNALNAME = "CHANGECONTROLSIGNALNAME"

export const ADDACTIVEAUTOMATON = "ADDACTIVEAUTOMATON"
export const REMOVEACTIVEAUTOMATON = "REMOVEACTIVEAUTOMATON"

export const REMOVE_REDUNDANT_BRACKETS_FROM_EXPRESSIONS = "REMOVE_REDUNDANT_BRACKETS_FROM_EXPRESSIONS"
export const MINIMIZE_ALL_EXPRESSIONS_IN_GRAPH = "MINIMIZE_ALL_EXPRESSIONS_IN_GRAPH"

export const COMPUTE_NEXT_CLOCK = "COMPUTE_NEXT_CLOCK"

export const SET_DERIVED_AUTOMATON_STATE_CORDS = "SET_DERIVED_AUTOMATON_STATE_CORDS"

export const SET_DERIVED_AUTOMATON_TRANSITION_CORDS = "SET_DERIVED_AUTOMATON_TRANSITION_CORDS"

export const RESET_DERIVED_AUTOMATON_POSITIONS = "RESET_DERIVED_AUTOMATON_POSITIONS"

export const RESET_TO_INITAL_STATES = "RESET_TO_INITAL_STATES"

//Alles bezueglich Knoten
export const ADDNODE = "ADDNODE"
export const REMOVENODE = "REMOVENODE"
export const CHANGENODENUMBER = "CHANGENODENUMBER"
export const CHANGE_NODE_NAME = "CHANGE_NODE_NAME"
export const SETNODECORDS = "SETNODECORDS"

export const ADDACTIVENODE = "ADDACTIVENODE"
export const REMOVEACTIVENODE = "REMOVEACTIVENODE"

export const SETOUTPUT = "SETOUTPUT"
export const RESETOUTPUT = "RESETOUTPUT"

export const SETCONTROLSIGNAL = "SETCONTROLSIGNAL"
export const RESETCONTROLSIGNAL = "RESETCONTROLSIGNAL"

// Alle Actions bezueglich der Kanten
export const ADDTRANSITION = "ADDTRANSITION"
export const REMOVE_TRANSITION = "REMOVE_TRANSITION"
export const CHANGECONDITION = "CHANGECONDITION"

export const CHANGESTARTPOINT = "CHANGESTARTPOINT"
export const CHANGEENDPOINT = "CHANGEENDPOINT"
export const CHANGESUPPORTPOINT = "CHANGESUPPORTPOINT"

// Alle Actions bezueglich der Transitionsmatrix
export const EXPAND_TRANSITION_MATRIX = "EXPAND_TRANSITION_MATRIX"
export const SHRINK_TRANSITION_MATRIX = "SHRINK_TRANSITION_MATRIX"

export const CHANGE_TRANSITION_MATRIX_ENTRY = "CHANGE_TRANSITION_MATRIX_ENTRY"
export const REMOVE_TRANSITION_MATRIX_ENTRY = "REMOVE_TRANSITION_MATRIX_ENTRY"


/**
 * Definition aller moeglichen Action-Types innerhalb des Editors als Interfaces 
 */

 //Alle Actions bezueglich des Allgemeinen editor states
export interface ChangeViewStateAction{
    type: typeof CHANGE_VIEW_STATE;
    payload: Viewstate
}

export interface AddGlobalInputAction{
    type: typeof ADDGLOBALINPUT;
    payload: string | undefined //CustomName fuer den neuen Input
}

export interface RemoveGlobalInputAction {
    type: typeof REMOVEGLOBALINPUT;
    payload: string //customName
}

export interface ChangeGlobalInputNameAction{
    type: typeof CHANGEGLOBALINPUTNAME,
    payload: {oldCustomName:string , newCustomName:string }
}

export interface SetGlobalInputAction{
    type: typeof SET_GLOABL_INPUT,
    payload: {customName:string}
}

export interface ResetGlobalInputAction{
    type: typeof RESET_GLOBAL_INPUT,
    payload: {customName:string}
}

export interface AddGlobalOutputAction{
    type: typeof ADDGLOBALOUTPUT;
    payload: string | undefined //customName
}

export interface RemoveGlobalOutputAction{
    type: typeof REMOVEGLOBALOUTPUT,
    payload: string //customName
}

export interface ChangeGlobalOutputNameAction{
    type: typeof CHANGEGLOBALOUTPUTNAME,
    payload: {oldCustomName:string , newCustomName:string}
}

export interface ChangeCustomOperatorAction{
    type: typeof CHANGECUSTOMOPERATOR,
    payload: {operatorTyp: OperatorEnum , newOperatorSymbol: string}
}

export interface SetGlobalInputDontCareAction{
    type: typeof SET_GLOBAL_INPUT_DONT_CARE,
    payload: {hStarExpression:string}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 //Alle Actions bezueglich Automaten
export interface NewAutomatonAction{
    type: typeof NEWAUTOMATON;
    payload: {name:string | undefined ,info: string }
}
 export interface RemoveAutomatonAction{
     type: typeof REMOVEAUTOMATON;
     payload: number // Id des zu loeschenden Automaten
 }
 export interface ChangeAutomatonNameAction{
    type: typeof CHANGEAUTOMATONNAME;
    payload: {automatonId: number , newName: string}
 }

 export interface SetAutomatonInfoAction{
     type: typeof SETAUTOMATONINFO;
     payload: {automatonId:number , info:string}
 }

 export interface SetInitialStateAction{
     type: typeof SET_INITIAL_STATE;
     payload: {automatonId:number ; newInitialStateNumber:number}
 }
 
export interface AddControlSignalAction{
    type: typeof ADDCONTROLSIGNAL,
    payload : {automatonId:number , customName:string | undefined}
}

export interface RemoveControlSignalAction{
    type: typeof REMOVECONTROLSIGNAL,
    payload: {automatonId:number , customName:string}
}

export interface ChangeControlSignalNameAction{
    type: typeof CHANGECONTROLSIGNALNAME,
    payload: {automatonId: number , oldCustomName: string , newCustomName: string}
}

export interface AddActiveAutomatonAction{
    type: typeof ADDACTIVEAUTOMATON,
    payload: number //Id des Automaten
}

export interface RemoveActiveAutomatonAction{
    type: typeof REMOVEACTIVEAUTOMATON,
    payload: number //Id des Automaten
}

export interface RemoveRedundantBracketsInExpressionsAction{
    type: typeof REMOVE_REDUNDANT_BRACKETS_FROM_EXPRESSIONS
}

export interface MinimizeAllExpressionsInGraphAction{
    type: typeof MINIMIZE_ALL_EXPRESSIONS_IN_GRAPH
}

export interface ComputeNextClockAction{
    type: typeof COMPUTE_NEXT_CLOCK
}

export interface SetDerivedAutomatonStateCordsAction{
    type: typeof SET_DERIVED_AUTOMATON_STATE_CORDS
    payload: {derivedView:DerivedAutomatonViews,automatonId:number , stateNumber:number, newPoint:Point}
}

export interface SetDerivedAutomatonTransitionCordsAction{
    type: typeof SET_DERIVED_AUTOMATON_TRANSITION_CORDS
    payload: {derivedView: DerivedAutomatonViews ,automatonId:number, transitionId:number , newStartPoint:Point , newEndPoint:Point , supportPoint:Point}
}

export interface ResetDerivedAutomatonPositionsAction{
    type: typeof RESET_DERIVED_AUTOMATON_POSITIONS
    payload: {derivedView: DerivedAutomatonViews , automatonId:number|undefined}
}

export interface ResetToInitialStatesAction{
    type: typeof RESET_TO_INITAL_STATES
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 // Alle Actions bezueglich Knoten und Zustaenden
 export interface AddNodeAction{
    type: typeof ADDNODE;
    payload:{automatonId:number,customStateNumber:number|undefined,position:Point|undefined};
}

export interface RemoveNodeAction{
    type: typeof REMOVENODE;
    payload: {nodeId:number }
}

export interface ChangeNodeNumberAction{
    type: typeof CHANGENODENUMBER;
    payload: {nodeId:number, newNodeNumber:number}
}

export interface ChangeNodeNameAction{
    type: typeof CHANGE_NODE_NAME;
    payload: {nodeId:number, newNodeName:string}
}


export interface SetNodeCordsAction{
    type: typeof SETNODECORDS;
    payload: {nodeId:number, newPosition:Point}
}

export interface AddActiveNodeAction{
    type: typeof ADDACTIVENODE,
    payload: number //Id des Knotens
}

export interface RemoveActiveNodeAction{
    type: typeof REMOVEACTIVENODE,
    payload: number //Id des Knotens
}

export interface SetOutputAction{
    type: typeof SETOUTPUT;
    payload: {nodeId:number , customOutputName: string , equation:string}
}

export interface ResetOutputAction{
    type:typeof RESETOUTPUT;
    payload: {nodeId:number , customOutputName: string}
}

export interface SetCrontrolSignalAction{
    type: typeof SETCONTROLSIGNAL;
    payload: {nodeId:number , customControlSignalName:string , equation:string}
}

export interface ResetCrontrolSignalAction{
    type: typeof RESETCONTROLSIGNAL;
    payload: {automatonName: string , nodeId:number , customControlSignalName:string }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Alle Actions bezueglich der Kanten

export interface AddTransitionAction{
    type: typeof ADDTRANSITION;
    payload:{automatonId:number , fromNodeId: number , toNodeId: number  , condition:string|undefined}
}

export interface RemoveTranistionAction{
    type: typeof REMOVE_TRANSITION;
    payload:{transitionId:number}
}

export interface ChangeConditionAction{
    type: typeof CHANGECONDITION;
    payload: {fromNodeId: number , toNodeId: number  , condition:string}
}

export interface ChangeEndPointAction{
    type: typeof CHANGEENDPOINT;
    payload: {transitionId:number ,newPoint:Point}
}

export interface ChangeStartPointAction{
    type: typeof CHANGESTARTPOINT;
    payload: { transitionId:number ,newPoint:Point}
}

export interface ChangeSupportPointAction{
    type: typeof CHANGESUPPORTPOINT;
    payload: { transitionId:number ,newPoint:Point}
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Alle Actions bezueglich der Transitionsmatrix

export interface ExpandTransitionMatrixAction{
    type: typeof EXPAND_TRANSITION_MATRIX;
    payload: { automatonId:number }
}

export interface ShrinkTransitionMatrixAction{
    type: typeof SHRINK_TRANSITION_MATRIX;
    payload: {nodeId:number}
}

export interface ChangeTransitionMatrixEntryAction{
    type: typeof CHANGE_TRANSITION_MATRIX_ENTRY;
    payload: {fromNodeId:number , toNodeId:number , condition:string }
}

// export interface RemoveTransitionMatrixEntryAction{
//     type: typeof REMOVE_TRANSITION_MATRIX_ENTRY;
//     payload: {transitionId:number}
// }

export interface RemoveTransitionMatrixEntryAction{
    type: typeof REMOVE_TRANSITION_MATRIX_ENTRY;
    payload: {  fromNodeId:number , toNodeId:number}
}

/**
 * Verkettung aller Actions innerhalb des Editors
 */

type GeneralActionTypes = AddGlobalInputAction | RemoveGlobalInputAction | ChangeGlobalInputNameAction| SetGlobalInputAction | ResetGlobalInputAction 
                            | AddGlobalOutputAction | RemoveGlobalOutputAction |ChangeGlobalOutputNameAction  | ChangeCustomOperatorAction | SetGlobalInputDontCareAction 
                            | ChangeViewStateAction;

type AutomatonActionTypes = NewAutomatonAction |RemoveAutomatonAction |ChangeAutomatonNameAction | SetAutomatonInfoAction | SetInitialStateAction| AddControlSignalAction 
                                | RemoveControlSignalAction | ChangeControlSignalNameAction | AddActiveAutomatonAction | RemoveActiveAutomatonAction 
                                | RemoveRedundantBracketsInExpressionsAction | MinimizeAllExpressionsInGraphAction | ComputeNextClockAction | SetDerivedAutomatonStateCordsAction
                                | SetDerivedAutomatonTransitionCordsAction | ResetDerivedAutomatonPositionsAction | ResetToInitialStatesAction;

type NodeActionTypes = AddNodeAction | RemoveNodeAction | ChangeNodeNumberAction | ChangeNodeNameAction | SetNodeCordsAction |  AddActiveNodeAction | RemoveActiveNodeAction | SetOutputAction 
                                | ResetOutputAction | SetCrontrolSignalAction | ResetCrontrolSignalAction;

type TransitionActionTypes = AddTransitionAction | RemoveTranistionAction | ChangeConditionAction | ChangeEndPointAction | ChangeStartPointAction | ChangeSupportPointAction;

type TransitionMatrixActionTypes = ExpandTransitionMatrixAction | ShrinkTransitionMatrixAction | ChangeTransitionMatrixEntryAction | RemoveTransitionMatrixEntryAction

export type EditorStateActionTypes = AutomatonActionTypes | NodeActionTypes | GeneralActionTypes | TransitionActionTypes | TransitionMatrixActionTypes;