
import { AppActions } from "../../types/Actions/appActions";
import { ADDACTIVEAUTOMATON, ADDACTIVENODE, ADDCONTROLSIGNAL, ADDGLOBALINPUT, ADDGLOBALOUTPUT, ADDNODE, ADDTRANSITION, CHANGEAUTOMATONNAME, CHANGECONDITION, CHANGECONTROLSIGNALNAME, CHANGECUSTOMOPERATOR, CHANGEENDPOINT, CHANGEGLOBALINPUTNAME, CHANGEGLOBALOUTPUTNAME, CHANGENODENUMBER, CHANGESTARTPOINT, CHANGESUPPORTPOINT, CHANGE_NODE_NAME, CHANGE_TRANSITION_MATRIX_ENTRY, CHANGE_VIEW_STATE, COMPUTE_NEXT_CLOCK, EditorStateActionTypes, EXPAND_TRANSITION_MATRIX, MINIMIZE_ALL_EXPRESSIONS_IN_GRAPH, NEWAUTOMATON, REMOVEACTIVEAUTOMATON, REMOVEACTIVENODE, REMOVEAUTOMATON, REMOVECONTROLSIGNAL, REMOVEGLOBALINPUT, REMOVEGLOBALOUTPUT, REMOVENODE, REMOVE_REDUNDANT_BRACKETS_FROM_EXPRESSIONS, REMOVE_TRANSITION, REMOVE_TRANSITION_MATRIX_ENTRY, RESETCONTROLSIGNAL, RESETOUTPUT, RESET_DERIVED_AUTOMATON_POSITIONS, RESET_GLOBAL_INPUT, RESET_TO_INITAL_STATES, SETAUTOMATONINFO, SETCONTROLSIGNAL, SETNODECORDS, SETOUTPUT, SET_DERIVED_AUTOMATON_STATE_CORDS, SET_DERIVED_AUTOMATON_TRANSITION_CORDS, SET_GLOABL_INPUT, SET_GLOBAL_INPUT_DONT_CARE, SET_INITIAL_STATE, SHRINK_TRANSITION_MATRIX } from "../../types/Actions/editorStateActions";
import { Automaton } from "../../types/Automaton";
import { createNormalizedEditorState, NormalizedEditorState } from "../../types/NormalizedState/NormalizedEditorState";
import { addActiveAutomaton, addActiveNode, addControlSignal, addGlobalInput, addGlobalOutput, addNewAutomaton, addNode, addTransition, changeAutomatonName, changeControlSignalName, changeCustomOperator, changeDerivedViewTransitionPoints, changeGlobalInputName, changeGlobalOutputName, changeNodeName, changeNodeNumber, changeTransitionCondition, changeTransitionEnd, changeTransitionStart, changeTransitionSupport, changeView, computeNextClock, minimizeAllExpressionsInGraph, removeActiveAutomaton, removeActiveNode, removeAutomaton, removeControlSignal, removeGlobalInput, removeGlobalOutput, removeNode, removeRedundantBracketsInExpressions, removeTransition, removeTransitionMatrixEntry, resetControlSignal, resetDerivedAutomatonPositions, resetGloablInput, resetOutput, resetToInitialStates, setAutomatonInfo, setControlSignal, setDerivedViewStateCords, setGloablInput, setGlobalInputDontCare, setInitialState, setNodeCords, setOutput } from "./actionFunctions";

/**
 * Initialzustand des Editors
 * Jede Klasse kennt ihren Initialzustand
 */

const initialState: NormalizedEditorState = createNormalizedEditorState();

/**
 * Reducer fuer den Editorstate (ist KEIN Producer damit {@link appStateReducer} die Patches aller Aenderungen auf dem AppState sammeln kann --> muss einen Draft uebergeben bekommen)
 * @param draft Arbeitskopie des aktuellen Zustand des Editors (muss ein Draft eines Producers auf hoeherer Hirachieebene sein)
 * @param action auszufuehrende Action, die auf dem aktuellen Zustand ausgefuehrt wird
 */
export const normalizedEditorStateReducer = (draft: NormalizedEditorState = initialState, action: AppActions): NormalizedEditorState => {
    switch (action.type) {
        case NEWAUTOMATON: {
            //Lege einen neuen Automaten an

            addNewAutomaton(draft.automatonSubState, action.payload.name, action.payload.info);
            break;
        }


        case REMOVEAUTOMATON: {
            //entferne einenen Automaten
            removeAutomaton(draft.automatonSubState, action.payload)

            break;
        }
        case CHANGEAUTOMATONNAME: {
            //bennenne einen Automaten um
            changeAutomatonName(draft, action.payload.automatonId, action.payload.newName)

            break;

        }
        case SETAUTOMATONINFO: {
            //vereandere seine Informationen
            setAutomatonInfo(draft, action.payload.automatonId, action.payload.info)

            break;
        }

        case ADDNODE: {
            //feuge einem Automaten einen Knoten hinzu
            addNode(draft.automatonSubState, action.payload.automatonId, action.payload.customStateNumber, action.payload.position)

            break;
        }
        case REMOVENODE: {
            //loesche  einen Knoten
            removeNode(draft.automatonSubState, action.payload.nodeId)

            break;
        }

        case CHANGENODENUMBER: {
            //veraendere die Zustandsnummer
            changeNodeNumber(draft.automatonSubState, action.payload.nodeId, action.payload.newNodeNumber)

            break;
        }

        case CHANGE_NODE_NAME: {
            //bennenne einen Knoten um
            changeNodeName(draft.automatonSubState, action.payload.nodeId, action.payload.newNodeName)

            break;
        }

        case SETNODECORDS: {
            //verschiebe einen Knoten
            setNodeCords(draft.automatonSubState, action.payload.nodeId, action.payload.newPosition)

            break;
        }

        case ADDGLOBALINPUT: {
            //fuege eine Eingangsvariable hinzu
            addGlobalInput(draft.inputSubState, action.payload)

            break;
        }

        case REMOVEGLOBALINPUT: {
            //entferne einen Eingang
            removeGlobalInput(draft, action.payload)

            break;
        }

        case ADDGLOBALOUTPUT: {
            //fuege einen Ausgang ein
            addGlobalOutput(draft.outputSubState, action.payload)

            break;
        }

        case REMOVEGLOBALOUTPUT: {
            //entferne einen Ausgang

            removeGlobalOutput(draft, action.payload)
            break;
        }

        case CHANGEGLOBALINPUTNAME: {
            //bennene einen Eingang um
            changeGlobalInputName(draft.inputSubState, action.payload.oldCustomName, action.payload.newCustomName)

            break;
        }

        case CHANGEGLOBALOUTPUTNAME: {
            //bennene einen Ausgang um
            changeGlobalOutputName(draft.outputSubState, action.payload.oldCustomName, action.payload.newCustomName)

            break;
        }

        case ADDCONTROLSIGNAL: {
            //Steuersignal einfuegen
            addControlSignal(draft.automatonSubState, action.payload.automatonId, action.payload.customName)

            break;
        }

        case REMOVECONTROLSIGNAL: {
            //Steuersignal entfernen
            removeControlSignal(draft.automatonSubState, action.payload.automatonId, action.payload.customName)

            break;
        }

        case CHANGECONTROLSIGNALNAME: {
            //umbenennene eines Steuersignals 
            changeControlSignalName(draft.automatonSubState, action.payload.automatonId, action.payload.newCustomName, action.payload.oldCustomName)

            break;
        }

        case SETOUTPUT: {
            //setze eine Ausgabe in einem Knoten
            setOutput(draft, action.payload.nodeId, action.payload.customOutputName, action.payload.equation)

            break;
        }

        case ADDACTIVEAUTOMATON: {
            //markiere einen Automaten als aktiv
            addActiveAutomaton(draft.automatonSubState.automatonFrameWorks, action.payload)

            break;
        }

        case REMOVEACTIVEAUTOMATON: {
            //markiere einen Automaten als aktiv
            removeActiveAutomaton(draft.automatonSubState.automatonFrameWorks, action.payload)

            break;
        }

        case RESETOUTPUT: {
            //entferne die Ausagbe eines Knotens
            resetOutput(draft, action.payload.nodeId, action.payload.customOutputName)

            break;
        }

        case ADDACTIVENODE: {
            //aktiviere einen Knoten
            addActiveNode(draft.automatonSubState.nodeSubState, action.payload)

            break;
        }

        case REMOVEACTIVENODE: {
            //deaktiviere einen Knoten
            removeActiveNode(draft.automatonSubState.nodeSubState, action.payload)

            break;
        }

        case SETCONTROLSIGNAL: {
            //Setze die Ausgabe eines Setuersignals in einem Knoten
            setControlSignal(draft, action.payload.nodeId, action.payload.customControlSignalName, action.payload.equation)

            break;
        }

        case RESETCONTROLSIGNAL: {
            //Setze die Ausgabe eines Setuersignals in einem Knoten zurueck 
            resetControlSignal(draft, action.payload.nodeId, action.payload.customControlSignalName)

            break;
        }

        case CHANGECUSTOMOPERATOR: {
            //Veraendere ein Operatorsymbol
            changeCustomOperator(draft, action.payload.operatorTyp, action.payload.newOperatorSymbol)

            break;
        }

        case ADDTRANSITION: {
            //erstelle eine Kante
            addTransition(draft, action.payload.automatonId, action.payload.fromNodeId, action.payload.toNodeId, action.payload.condition)

            break;
        }

        case REMOVE_TRANSITION: {
            //loesche eine Kante
            removeTransition(draft.automatonSubState, action.payload.transitionId)

            break;
        }

        case CHANGECONDITION: {
            //veraendere die Bedingung einer Kante
            changeTransitionCondition(draft, action.payload.fromNodeId, action.payload.toNodeId, action.payload.condition)

            break;
        }

        case CHANGESTARTPOINT: {
            //vereaendere den Anfangspunkt einer Kante
            changeTransitionStart(draft.automatonSubState, action.payload.transitionId, action.payload.newPoint)

            break;
        }

        case CHANGEENDPOINT: {
            //vereaendere den Anfangspunkt einer Kante
            changeTransitionEnd(draft.automatonSubState, action.payload.transitionId, action.payload.newPoint)

            break;
        }

        case CHANGESUPPORTPOINT: {
            //veraendere den Stuetzpunkt der Kante
            changeTransitionSupport(draft.automatonSubState, action.payload.transitionId, action.payload.newPoint)

            break;
        }

        case SET_GLOABL_INPUT: {
            //setze einen Eingang zu 1
            setGloablInput(draft.inputSubState, action.payload.customName)

            break;
        }

        case RESET_GLOBAL_INPUT: {
            //setze einen Eingang zu 0
            resetGloablInput(draft.inputSubState, action.payload.customName)

            break;
        }

        case SET_INITIAL_STATE: {
            //setze einen Initialzustand
            setInitialState(draft.automatonSubState, action.payload.automatonId, action.payload.newInitialStateNumber)

            break;
        }
        case CHANGE_VIEW_STATE: {
            //veraendere die Ansicht
            changeView(draft, action.payload)

            break;
        }

        case REMOVE_REDUNDANT_BRACKETS_FROM_EXPRESSIONS: {
            //enferne alle unnoetigen Klammern
            removeRedundantBracketsInExpressions(draft.automatonSubState)

            break;
        }

        case MINIMIZE_ALL_EXPRESSIONS_IN_GRAPH: {
            //Minimiere alle logischen Ausdruecke in den Automaten
            minimizeAllExpressionsInGraph(draft.automatonSubState)

            break;
        }

        case COMPUTE_NEXT_CLOCK: {
            //berechne den naechsten Takt im System
            computeNextClock(draft)

            break;
        }

        case SET_GLOBAL_INPUT_DONT_CARE: {
            //setze die Globale Dont-Care-Belegung 
            setGlobalInputDontCare(draft, action.payload.hStarExpression)

            break;
        }

        case SET_DERIVED_AUTOMATON_STATE_CORDS: {
            //verschiebe einen Zustand in einer abgleiteten Ansicht
            setDerivedViewStateCords(draft, action.payload.derivedView, action.payload.automatonId, action.payload.stateNumber, action.payload.newPoint)

            break;
        }

        case SET_DERIVED_AUTOMATON_TRANSITION_CORDS: {
            //verschiebe einen Kante in einer abgleiteten Ansicht
            changeDerivedViewTransitionPoints(draft, action.payload.derivedView, action.payload.automatonId, action.payload.transitionId
                , action.payload.newEndPoint, action.payload.newStartPoint, action.payload.supportPoint)

            break;
        }

        case RESET_DERIVED_AUTOMATON_POSITIONS:{
            //setze die Positionen einer abgeleiteten Ansciht zurueck
            resetDerivedAutomatonPositions(draft.automatonSubState.automatonFrameWorks , action.payload.derivedView , action.payload.automatonId)

            break;
        }

        case RESET_TO_INITAL_STATES: {
            //setze alle Automaten in ihren Initialzustand zureuck
            resetToInitialStates(draft.automatonSubState.automatonFrameWorks)

            break;
        }

        case EXPAND_TRANSITION_MATRIX: {
            //Fuege der Transitionsmatrix eine Zeile+Spalte (einen neuen Knoten hinzu) --> fuege dem System einen Knoten hinzu
            addNode(draft.automatonSubState, action.payload.automatonId)

            break;
        }

        case SHRINK_TRANSITION_MATRIX: {
            //Entferne aus der Transitionsmatrix eine Zeile+Spalte (einen Knoten loeschen) --> loesche einen Knoten im System
            removeNode(draft.automatonSubState, action.payload.nodeId)

            break;
        }

        case CHANGE_TRANSITION_MATRIX_ENTRY: {
            //Veraendere einen Eintrag in der Transitionsmatrix --> veraendere die Bedingung einer Kante (erstelle sie falls noch nicht vorhanden)
            changeTransitionCondition(draft, action.payload.fromNodeId, action.payload.toNodeId, action.payload.condition) //ggf. Bedingung ueberschreiben

            break;
        }

        case REMOVE_TRANSITION_MATRIX_ENTRY: {
            //Loesche einen Eintrag in der Transitionsmatrix --> Loesche eine Kante im System
            removeTransitionMatrixEntry(draft.automatonSubState, action.payload.fromNodeId, action.payload.toNodeId)

            break;
        }



        default:
            break;



    }
    return draft
}


