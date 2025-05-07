import { immerable } from "immer";
import { Automaton } from "../Automaton";
import { ConstantType } from "../BooleanEquations/LogicTrees/TreeNodeInterfaces";
import { ICompleteTreeRoot } from "../BooleanEquations/LogicTrees/TreeRoots";
import { CompleteTreeConstantNode } from "../BooleanEquations/LogicTrees/Variables";
import { ExpressionSyntaxError, HStarNotAFunctionOfxError, UnknownVariableInExpressionError, OutputVariableInExpressionError } from "../Error";
import { ExpressionErrorTupel } from "../ErrorElements";
import { createNewOperators, Operators } from "../Operators";
import { ExternalOutput } from "../Output";
import { Viewstate } from "../view";
import { AutomatonSubState, createAutomatonSubState } from "./AutomatonSubState";
import { createInputSubState, createOutputSubState, InputSubState, OutputSubState } from "./SignalSubState";

//Initial: grafische Darstellung
const INITIAL_VIEWSTATE = Viewstate.StateDiagram;

/**
 * interner Zustand der Bearbeitungsumgebung 
 */
export interface NormalizedEditorState {

   /**Aktuelle Ansicht des Editors */
   viewState: Viewstate

   /** Informationen zu den globalen Eingaengen fuer alle parallelen Automaten: Vektor x*/
   inputSubState: InputSubState;

   /** Informationen zu den globale Ausgaben der parallelen Automaten (Oder-Verknuepfung der Teilausgaben): Vektor y */
   outputSubState: OutputSubState;

   /** globale Dont-Care Belegungen (h-Stern) als logischer Ausdruck als Tupel mit dem eventuell zuletzt aufgetretenen Fehler beim Einlesen */
   globalInputDontCare: ExpressionErrorTupel<HStarNotAFunctionOfxError | ExpressionSyntaxError | UnknownVariableInExpressionError | OutputVariableInExpressionError>;

   /** Information zu den Automaten im System */
   automatonSubState: AutomatonSubState

   /** aktuell verwendete Operatorsymbole*/
   operators: Operators


}

/**
 * Erstellung eines neuen Editors
 */
export function createNormalizedEditorState(): NormalizedEditorState {

   let viewState = INITIAL_VIEWSTATE;
   let inputSubState = createInputSubState() //leerer Substate
   let outputSubState = createOutputSubState() //leerer Substate
   let automatonSubState = createAutomatonSubState() //leerer Substate

   //initales h-Stern: logisch 0 (keine Fehler)
   let globalInputDontCare = { validExpression: { tree: new CompleteTreeConstantNode(ConstantType.ConstantZero) }, error: undefined }

   //Erstelle einen neuen Satz an Operatoren mit den Standardoperatoren
   let operators = createNewOperators()

   return { viewState: viewState, inputSubState: inputSubState, outputSubState: outputSubState, automatonSubState: automatonSubState, globalInputDontCare: globalInputDontCare, operators: operators }
}