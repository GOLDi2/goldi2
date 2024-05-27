import { createDraftSafeSelector } from "@reduxjs/toolkit"
import { cloneDeep, cloneDeepWith } from "lodash"
import { ApiExpressionErrorTupel } from "../types/ApiClasses/ApiExpressionErrorTupel"
import { ApiAutomatonEquationSet } from "../types/ApiClasses/Equation"
import { ApiAutomaton } from "../types/ApiClasses/GraphRepresentation/Automaton"
import { ApiFullSystemAssignment, CurrentStateTupel } from "../types/ApiClasses/SystemAssignment"
import { Automaton, AutomatonMetaData, AutomatonPositionStructure, AutomatonStructure, getDerivedAutomatonName, RawAutomatonStructure, UiAutomatonData } from "../types/Automaton"
import { computeEquationSets } from "../types/BooleanEquations/computeAutomatonEquations"
import { computeHardwareAutomatonStructures, placeStatesAndTransitions } from "../types/BooleanEquations/computeHardwareAutomaton"
import { computeMergedAutomatonStructures } from "../types/BooleanEquations/computeMergedAutomatons"
import { CustomNames } from "../types/BooleanEquations/CustomNames"
import { AutomatonEquationSet } from "../types/BooleanEquations/EquationSet"
import { extractAutomatonNameList, extractBaseSystemAssignment, extractControlSignals, extractDerivedSystemAssignment, extractFullSystemAssignment, extractInputs, extractInternalOutputs, extractInternControlSignals, extractOutputs, extractZVariables } from "../types/BooleanEquations/extractParametersFunctions"
import { CompleteTreeRoot, ICompleteTreeRoot } from "../types/BooleanEquations/LogicTrees/TreeRoots"
import { SignalAssignment } from "../types/BooleanEquations/SignalAssignment"
import { FullSystemAssignment } from "../types/BooleanEquations/SystemAssignment"
import { ControlSignal, ExternalIndependentControlSignal } from "../types/ControlSignal"
import { ExpressionSyntaxError, HStarNotAFunctionOfxError, UnknownVariableInExpressionError , OutputVariableInExpressionError } from "../types/Error"
import { ExternalInput, InternalInput, InternalInputAssignment } from "../types/Input"
import { Node, NodePosition, RawNode } from "../types/Node"
import { AppState } from "../types/NormalizedState/AppState"
import { AutomatonSubState, DerivedViewNodePositions, DerivedViewTransitionPositions, NodeSubState, RawTransitionNormalized, TransitionList, TransitionNodeData, TransitionSubState } from "../types/NormalizedState/AutomatonSubState"
import { NormalizedEditorState } from "../types/NormalizedState/NormalizedEditorState"
import { StorageObject } from "../types/NormalizedState/NormalizedObjects"
import { InputAssignment, InputSubState, OutputSubState, NameTupel } from "../types/NormalizedState/SignalSubState"
import { Operators } from "../types/Operators"
import { ExternalOutput } from "../types/Output"
import { RawTransition, Transition, TransitionPosition } from "../types/Transition"
import { DerivedAutomatonViews, Viewstate } from "../types/view"
import { EquationViewConfig } from "../types/NormalizedState/ViewConfig"
import { ZVariable } from "../types/ZVariable"
import { buildInternDerivedAutomaton, computeDerivedViewPositions, placeDerivedViewElements, transformAutomatonListToApi } from "./helpers"
import { getAutomatonViewConfig, getEquationViewConfig, getMergedAutomatonViewConfig } from "./viewConfigSelectors"


////////////////////////////////////////////////////////////////////////////////////////////////
// Liste aller Getter

function getInputIdList(state: NormalizedEditorState): Array<number> {
    return state.inputSubState.inputIDs
}

function getInputNamesList(state: NormalizedEditorState): StorageObject<NameTupel> {
    return state.inputSubState.customNames
}

function getInputAssignmentList(state: NormalizedEditorState) {
    return state.inputSubState.assignments
}

function getOutputIdList(state: NormalizedEditorState): Array<number> {
    return state.outputSubState.outputIDs
}

function getOutputNamesList(state: NormalizedEditorState): StorageObject<NameTupel> {
    return state.outputSubState.customNames
}


function getAutomatonIdList(state: NormalizedEditorState): Array<number> {
    return state.automatonSubState.automatonFrameWorks.automatonIDs
}


function getNodeIdList(state: NormalizedEditorState): Array<number> {
    return state.automatonSubState.nodeSubState.nodeIds
}

function getAutomatonUiData(state: NormalizedEditorState): StorageObject<UiAutomatonData> {
    return state.automatonSubState.automatonFrameWorks.uiAutomatonData
}

function getAutomatonNodeLists(state: NormalizedEditorState) {
    return state.automatonSubState.automatonFrameWorks.nodeLists
}

function getAutomatonTransitionLists(state: NormalizedEditorState) {
    return state.automatonSubState.automatonFrameWorks.transitionLists
}

function getTransitonLogic(state: NormalizedEditorState) {
    return state.automatonSubState.transitionSubState.logicInformation
}

function getTransitonPositions(state: NormalizedEditorState) {
    return state.automatonSubState.transitionSubState.transitionPositions
}

function getTransitonNodeData(state: NormalizedEditorState) {
    return state.automatonSubState.transitionSubState.transitionNodeData
}


function getNodeLogic(state: NormalizedEditorState) {
    return state.automatonSubState.nodeSubState.logicInformation
}

function getNodePositions(state: NormalizedEditorState) {
    return state.automatonSubState.nodeSubState.nodePositions
}


export function getOperators(editorState: NormalizedEditorState): Operators {
    return editorState.operators
}

function getCurrentStates(editorState: NormalizedEditorState): StorageObject<CurrentStateTupel> {
    return editorState.automatonSubState.automatonFrameWorks.currentStates
}

function getControlSignalIdLists(state: NormalizedEditorState) {
    return state.automatonSubState.automatonFrameWorks.controlSignalLists
}
function getControlSignalNameLists(state: NormalizedEditorState) {
    return state.automatonSubState.automatonFrameWorks.controlSignalNameLists
}

function getDontCareExpressionErrorTupel(state: AppState) {
    return state.normalizedEditorState.globalInputDontCare
}

function getDontCareExpression(state: AppState):ICompleteTreeRoot {
    return state.normalizedEditorState.globalInputDontCare.validExpression
}

function getNodeSubState(editorState: NormalizedEditorState): NodeSubState {
    return editorState.automatonSubState.nodeSubState
}

function getTransitionSubState(editorState: NormalizedEditorState): TransitionSubState {
    return editorState.automatonSubState.transitionSubState
}


export function getViewState(state: AppState): Viewstate {
    return state.normalizedEditorState.viewState
}

function getHardwareStatePositions(editorState: NormalizedEditorState) {
    return editorState.automatonSubState.automatonFrameWorks.hardwareStatePositions
}

function getHardwareTransitionPositions(editorState: NormalizedEditorState) {
    return editorState.automatonSubState.automatonFrameWorks.hardwareTransitionPositions
}


function getMergedStatePositions(editorState: NormalizedEditorState) {
    return editorState.automatonSubState.automatonFrameWorks.fusionStatePositions
}

function getMergedTransitionPositions(editorState: NormalizedEditorState) {
    return editorState.automatonSubState.automatonFrameWorks.fusionTransitionPositions
}

function getNodeNames(editorState:NormalizedEditorState){
    return editorState.automatonSubState.nodeSubState.names
}

//Ueberfuehrungsfunktionen, die den gesamten State entgegennhmen und anhand dessen das Ergebnis eines Selektors ausgeben, der selbst nur einen Teil des States als Parameter benoetigt
//Erzeugt keinen zusaetzlichen Rechenaufwand, da es lediglich eine Bruecke zum Selektor darstellt (Ergebniscache des Selektors wird ebenfalls ausgenutzt)
function SelectCustomNamesFromAppState(state: AppState): CustomNames {
    return CustomNameSelector(state.normalizedEditorState)
}


function SelectAutomatonsFromAppState(state: AppState): Array<Automaton> {
    return AutomatonSelector(state.normalizedEditorState)
}

function SelectInternEquationSetFromAppState(state: AppState): Array<AutomatonEquationSet> {
    return InternEquationSetSelector(state.normalizedEditorState)
}


function SelectInternHardwareAutomatonsFromAppState(state: AppState): Array<Automaton> {
    return InternHardwareautomatonSelector(state.normalizedEditorState)
}

function SelectInternMergedAutomatonsFromAppState(state: AppState): Array<Automaton> {
    return InternMergedautomatonSelector(state.normalizedEditorState)
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Selektoren
/**
 * Extrahiere den Ausdruck fuer hStern
 */
 export const DontCareExpressionSelector = createDraftSafeSelector(
    [getDontCareExpressionErrorTupel,SelectCustomNamesFromAppState],
    function(dontCareExpressionTupel , customNames):ApiExpressionErrorTupel<ExpressionSyntaxError | UnknownVariableInExpressionError | OutputVariableInExpressionError | HStarNotAFunctionOfxError>{
        //ueberfuehre den Ausdruck in einen String und uebernimm den eventuell gespeicherten Fehler
        return { validExpression:CompleteTreeRoot.toCustomString(dontCareExpressionTupel.validExpression ,customNames) , error:dontCareExpressionTupel.error  }       
    }
)


/**
 * Extrahiere alle Eingangsvariablen mit deren nutzerdefinierten Namen
 */
export const InputVariableSelector = createDraftSafeSelector(
    [getInputIdList, getInputNamesList],
    extractInputs
)

const InputVariableAssignmentSelector = createDraftSafeSelector(
    [getInputIdList, getInputAssignmentList],
    function (inputIds, inputAssignmentStorage): Array<InternalInputAssignment> {
        let inputAssignments: Array<InternalInputAssignment> = [] //Ergebnisse
        //suche die Belegung zu jedem Eingang
        inputIds.forEach(currentId => {
            //suche die Belegung dieses Eingangs
            let assignment = inputAssignmentStorage[currentId].assignment
            let input = new InternalInput(currentId)
            inputAssignments.push(new InternalInputAssignment(input, assignment))
        })
        return inputAssignments
    }
)

/**
 * Extrahiere alle Ausgangsvariablen in deren interner Darstellung
 */
export const InternOutputVariableSelector = createDraftSafeSelector(
    [getOutputIdList],
    extractInternalOutputs
)
 
/**
 * Extrahiere alle Ausgangsvariablen mit deren nutzerdefinierten Namen
 */
export const OutputVariableSelector = createDraftSafeSelector(
    [getOutputIdList, getOutputNamesList],
    extractOutputs
)

/**
 * Extrahiere alle unagbhaengigen Steuervariablen aller Automaten
 */
const InternControlSignalSelector = createDraftSafeSelector(
    [getAutomatonIdList, getControlSignalIdLists],
    extractInternControlSignals
)

/**
 * Extrahiere alle unagbhaengigen Steuervariablen aller Automaten
 */
const ControlSignalSelector = createDraftSafeSelector(
    [InternControlSignalSelector, getControlSignalNameLists],
    extractControlSignals
)

/**
 * Extrahiere die nutzerdefinierten Namen aller Automaten als Tupel mit ihrer Id
 */
const AutomatonNameSelector = createDraftSafeSelector(
    [getAutomatonIdList, getAutomatonUiData],
    extractAutomatonNameList
)



/**
 * Berechne die logische Grundstruktur aller Automaten im State (nur logik-relevante Informationen ueber Kanten und Knoten)
 */
const RawAutomatonStructureSelector = createDraftSafeSelector(
    [getAutomatonIdList, getAutomatonTransitionLists, getAutomatonNodeLists, getNodeLogic, getTransitonLogic, getTransitonNodeData],
    function (automatonIds: Array<number>, automatonTransitons, automatonNodeLists, nodeLogicList, transitionLogicList, transitionNodeData
    ): Array<RawAutomatonStructure> {
        
        //neue Liste fuer die Strukturen 
        let automatonStructures: Array<RawAutomatonStructure> = []

        //Alle Automaten hinzufuegen
        automatonIds.forEach(currentAutomatonId => {
            //greife die Kantenliste des Automaten
            let transitionIds = automatonTransitons[currentAutomatonId].transitionIds
            let rawTransitions: Array<RawTransition> = [] //Liste fuer die Kanten 
            //suche alle Informationen zu jeder Kante
            transitionIds.forEach(currentTransitionId => {
                let nodeData = transitionNodeData[currentTransitionId]
                let logicData = transitionLogicList[currentTransitionId]
                //baue die Kante zusammen
                rawTransitions.push({ id: currentTransitionId, fromNodeId: nodeData.fromNodeId, toNodeId: nodeData.toNodeId, condition:logicData.condition})
            })

            //greife die Knotenliste des Automaten
            let nodeIds = automatonNodeLists[currentAutomatonId].nodeIds
            let rawNodes: Array<RawNode> = [] //Liste fuer die Knoten 
            //suche alle Informationen zu jedem Knoten
            nodeIds.forEach(currentNodeId => {
                //baue die Kante zusammen
                rawNodes.push(nodeLogicList[currentNodeId])
            })

            //baue die Raw-Struktur zusammen
            automatonStructures.push({ id: currentAutomatonId, nodes: rawNodes, transitions: rawTransitions })
        })
        return automatonStructures
    }
)

/**
 * Berechne die logische Grundstruktur aller Automaten im State (nur logik-relevante Informationen ueber Kanten und Knoten)
 */
const AutomatonPositionsSelector = createDraftSafeSelector(
    [getAutomatonIdList, getAutomatonTransitionLists, getAutomatonNodeLists, getNodePositions, getTransitonPositions, getTransitonNodeData],
    function (automatonIds: Array<number>, automatonTransitons, automatonNodeLists, nodePositionStorage, transitonPositionStorage, transitionNodeData
    ): Array<AutomatonPositionStructure> {
        //neue Liste fuer die Positionen aller Elemente eines Automaten 
        let automatonStructures: Array<AutomatonPositionStructure> = []

        //Alle Automaten hinzufuegen
        automatonIds.forEach(currentAutomatonId => {
            //greife die Kantenliste des Automaten
            let transitionIds = automatonTransitons[currentAutomatonId].transitionIds
            let transitonPositions: Array<TransitionPosition> = [] //Liste fuer die Kanten 
            //suche alle Informationen zu jeder Kante
            transitionIds.forEach(currentTransitionId => {
                let nodeData = transitionNodeData[currentTransitionId]
                let position = transitonPositionStorage[currentTransitionId]
                //baue die Kante zusammen
                transitonPositions.push({ id: currentTransitionId, fromNodeId: nodeData.fromNodeId, toNodeId: nodeData.toNodeId, bezier: position.bezier })
            })

            //greife die Knotenliste des Automaten
            let nodeIds = automatonNodeLists[currentAutomatonId].nodeIds
            let nodePositions: Array<NodePosition> = [] //Liste fuer die Knoten 
            //suche alle Informationen zu jedem Knoten
            nodeIds.forEach(currentNodeId => {
                //baue die Kante zusammen
                nodePositions.push(nodePositionStorage[currentNodeId])
            })

            //baue die Struktur mit den Positionen zusammen
            automatonStructures.push({ id: currentAutomatonId, nodePositions: nodePositions, transitionPositions: transitonPositions })
        })
        return automatonStructures
    }
)






/**
 * Extrahiere die Belegung aller z-Variablen aus der Automatenliste
 * TODO: eventuell nur z-Variablen ohne Belegung extrahieren
 */
const ZVariableSelector = createDraftSafeSelector(
    RawAutomatonStructureSelector,
    extractZVariables
)



/**
 * Extrahiere alle nutzerdefinierten Namen 
 * Enthaelt auch alle Fehler, die bei der Namensvergabe eventuell entstanden sind
 * Schnittstelle um alle Internen Darstellungen in ihre externe anhand ihrer nutzerdefinierten Namen zu ueberfuehren
 */
export const CustomNameSelector = createDraftSafeSelector(
    [AutomatonNameSelector,getNodeNames, getOperators, InputVariableSelector, OutputVariableSelector, ControlSignalSelector, ZVariableSelector ],
    function (automatonNames: Array<NameTupel>, nodeNames:StorageObject<NameTupel>, customOperators: Operators, customInputs: Array<ExternalInput>,
        customOutputs: Array<ExternalOutput>, customControlSignals: Array<ExternalIndependentControlSignal>, zVariables: Array<ZVariable>): CustomNames {

        return new CustomNames(automatonNames,nodeNames, customOperators, customInputs, customOutputs, customControlSignals, zVariables)
    }
)




/**
 * Extrahiere die aktuellen Zustaende aller Automaten aus dem State
 */
const CurrentStatesSelector = createDraftSafeSelector(
    [getAutomatonIdList, getCurrentStates],
    function (automatonIds, currentStates): Array<CurrentStateTupel> {
        //extrahiere den aktuellen Zustand aller Automaten
        let stateTupels: Array<CurrentStateTupel> = [] //Liste fuer die Ergebnisse
        automatonIds.forEach(currentId => stateTupels.push(currentStates[currentId]))
        return stateTupels
    }
)

/**
 * Berechne die Metadaten der vom Nutzer eingegebenen Designautomaten aller Automaten im State 
 */
const AutomatonMetadataSelector = createDraftSafeSelector(
    [getAutomatonUiData, CurrentStatesSelector],
    function (uiAutomatonData, currentStateTuples): Array<AutomatonMetaData> {
        //neue Liste fuer die Automatenmetadaten
        let automatonStructures: Array<AutomatonMetaData> = []
        //alle Automaten hinzufuegen 
        currentStateTuples.forEach(currentTuple => {
            let currentAutomatonId = currentTuple.id //Id des Automaten
            // suche die Ui-daten zu diesem Automaten
            let uiData = uiAutomatonData[currentAutomatonId]

            automatonStructures.push(new AutomatonMetaData(uiData, currentTuple.currentState))
        })
        return automatonStructures
    }
)


/**
 * Berechnung einer aktuellen Belegung der Eingange und z-Variablen in deren interner Darstellung
 */
const BaseVariableAssignmentSelector = createDraftSafeSelector(
    [InputVariableAssignmentSelector, ZVariableSelector, CurrentStatesSelector],
    extractBaseSystemAssignment
)

/**
 * Auslesen der Gleichungssets aller Automaten in interner Darstellung
 * Fuer die externe Darstellung muessen diese noch transformiert werden
 */
export const InternEquationSetSelector = createDraftSafeSelector(
    [RawAutomatonStructureSelector , InternOutputVariableSelector , InternControlSignalSelector],
    computeEquationSets
)


/**
 * Berechnung einer aktuellen Belegung der Eingange, Steuersignale und z-Variablen in deren interner Darstellung
 * @returns aktuelle Belegung der Eingange, Steuersignale und z-Variablen
 */
export const DerivedVariableAssignmentSelector = createDraftSafeSelector(
    [BaseVariableAssignmentSelector, InternEquationSetSelector],
    extractDerivedSystemAssignment
)

/**
 * Berechnung einer aktuellen Belegung der Eingange, Steuersignale, Ausgaenge  und z-Variablen in deren interner Darstellung
 * @returns aktuelle Belegung der Eingange, Steuersignale und z-Variablen
 */
const FullVariableAssignmentSelector = createDraftSafeSelector(
    [DerivedVariableAssignmentSelector, InternEquationSetSelector],
    extractFullSystemAssignment
)

/**
 * Berechne die vollstaendige Belegung des Systems
 * Belegung aller Eingaenge, Ausgaenge, z-Variablen und Steruersignale
 */
export const FullApiSystemAssignmentSelector = createDraftSafeSelector(
    [FullVariableAssignmentSelector, CustomNameSelector],
    function (internDerivedSystemAssignment: FullSystemAssignment, customNames: CustomNames): ApiFullSystemAssignment {
        //Bringe die Belegung in Ausgabedarstellung
        return internDerivedSystemAssignment.toExternalGraphRepresentation(customNames)
    }
)



/**
 * Berechne die externe Gleichungsdarstellung aller Automaten gemaess der aktuellen Konfiguration dieses Selektors
 * (z-Gleichungen, Ausgabegleichungen fuer y_i und Ausgabegleichungen fuer s_i)
 * TODO: Keinen Effekt bezugelich der Effizienz bei Aenderungen der ViewConfig solange die Cachegroesse 1 ist --> Cachegroesse erhoehen
 * @returns Liste aller Gleichungssets (alle Gleichungen fuer jeden Automaten ggf. in der gewuenschten Art minimiert)
 */
export const EquationSetSelector = createDraftSafeSelector(
    [SelectInternEquationSetFromAppState, SelectCustomNamesFromAppState, getEquationViewConfig, getDontCareExpression],
    function (equationSets: Array<AutomatonEquationSet>, customNames: CustomNames, equationViewConfig: EquationViewConfig,
        dontCareExpression: ICompleteTreeRoot): Array<ApiAutomatonEquationSet> {
        //Transformiere alle Gleichungssets in Ausgabedarstellung
        let apiEquationSets: Array<ApiAutomatonEquationSet> = [];
        for (let setCounter = 0; setCounter < equationSets.length; setCounter++) {
            //greife aktuelles Set --> transformiere es
            let currentSet = equationSets[setCounter]
            apiEquationSets.push(currentSet.toExternalGraphRepresentation(customNames, equationViewConfig, dontCareExpression))
        }
        return apiEquationSets
    }
)


/**
 * Berechne die  Grundstruktur aller Automaten im State (Positionen und logische Informationen aller Elemente)
 */
export const AutomatonStructureSelector = createDraftSafeSelector(
    [getAutomatonIdList, getAutomatonTransitionLists, getAutomatonNodeLists, getNodeSubState, getTransitionSubState],
    function (automatonIds: Array<number>, automatonTransitons, automatonNodeLists, nodeSubState, transitionSubState): Array<AutomatonStructure> {
        //neue Liste fuer die Strukturen 
        let automatons: Array<AutomatonStructure> = []
        // console.log("struktur");
        
        //Alle Automaten hinzufuegen
        automatonIds.forEach(currentAutomatonId => {
            //greife die Kantenliste des Automaten
            let transitionIds = automatonTransitons[currentAutomatonId].transitionIds
            let transitions: Array<Transition> = [] //Liste fuer die Kanten 
            //suche alle Informationen zu jeder Kante
            transitionIds.forEach(currentTransitionId => {
                let nodeData = transitionSubState.transitionNodeData[currentTransitionId]
                let logicData = transitionSubState.logicInformation[currentTransitionId]
                let poition = transitionSubState.transitionPositions[currentTransitionId]
                //baue die Kante zusammen
                transitions.push(new Transition(currentTransitionId, nodeData.fromNodeId, poition.bezier.startPoint, nodeData.toNodeId, poition.bezier.endPoint,
                    poition.bezier.supportPoint,logicData.condition))
            })

            //greife die Knotenliste des Automaten
            let nodeIds = automatonNodeLists[currentAutomatonId].nodeIds
            let nodes: Array<Node> = [] //Liste fuer die Knoten 
            //suche alle Informationen zu jedem Knoten
            nodeIds.forEach(currentNodeId => {
                //baue die Kante zusammen
                let position = nodeSubState.nodePositions[currentNodeId]
                let logic = nodeSubState.logicInformation[currentNodeId]
                let node = new Node(currentNodeId, logic.customStateNumber, position.position.xCord, position.position.yCord, position.radius)
                node.controlSignalAssignment = logic.controlSignalAssignment;
                node.outputAssignment = logic.outputAssignment

                nodes.push(node)
            })

            automatons.push({ id: currentAutomatonId, nodes: nodes, transitions: transitions })

        })
        return automatons
    }
)


/**
 *Baue alle DesignAutomaten aus dem State zusammen 
 */
export const AutomatonSelector = createDraftSafeSelector(
    [AutomatonStructureSelector, getCurrentStates, getAutomatonUiData, getControlSignalIdLists , getControlSignalNameLists],
    function (automatonStructures: Array<AutomatonStructure>, currentStateStorage, automatonUiData , controlSignalIdLists , controlSignalNameLists): Array<Automaton> {
        //neue Liste fuer die Strukturen 
        let automatons: Array<Automaton> = []

        //Alle Automaten hinzufuegen
        automatonStructures.forEach(currentAutomatonStructure => {
            let currentAutomatonId = currentAutomatonStructure.id
            //Suche die Metadaten zu diesem Automaten
            let uiData = automatonUiData[currentAutomatonId]
            let currentState = currentStateStorage[currentAutomatonId].currentState

            //Suche die IDs der Steuersignale dieses Automaten
            let currentAutomatonControlSignalsIds = controlSignalIdLists[currentAutomatonId].controlSignalIds
            //baue jedes Steuersignal zusammen
            let controlSignals:Array<ControlSignal> = [] //Ergebnisliste
            currentAutomatonControlSignalsIds.forEach(currentId => controlSignals.push(new ControlSignal(currentId , controlSignalNameLists[currentAutomatonId].nameList[currentId].customName)))

            let automaton = new Automaton(uiData.name, uiData.id, uiData.info, uiData.initialStateNumber, currentState, currentAutomatonStructure.nodes, currentAutomatonStructure.transitions,
                controlSignals, uiData.isActive)

            automatons.push(automaton)


        })
        return automatons
    }
)


/**
 * Extrahiere alle Automaten (Designautomaten)
 */
export const ApiAutomatonSelector = createDraftSafeSelector(
    //Aufruf der Transformationsmethode ohne Konfiguration fuer abgeleitete Ansichte, da diese Ansicht nicht abgeleitet ist
    [SelectAutomatonsFromAppState, SelectCustomNamesFromAppState, getAutomatonViewConfig],
    function(automatons , customNames , automatonViewConfig):Array<ApiAutomaton>{
        // console.log("neue Designautomaten");
        
        //In den Designautomaten sollen nie Kanten verborgen werden --> Immer anzeigen
        let designViewConfig = cloneDeep(automatonViewConfig)
        designViewConfig.showZeroTransitions = true
        return transformAutomatonListToApi(automatons , customNames , designViewConfig)  
    }
   
)



/**
 * Extrahiere die Wunschpositionen aller Elemente in allen Hardwareautomaten 
 * Die Id der resultierenden Strukturen entspricht der des Automaten zu dem sie gehoeren
 */
const HardwareAutomatonPositionsSelector = createDraftSafeSelector(
    [getAutomatonIdList, getHardwareStatePositions, getHardwareTransitionPositions],
    computeDerivedViewPositions
)


/**
 * Extrahiere die Wunschpositionen aller Elemente in allen Fusionsautomaten 
 * Die Id der resultierenden Strukturen entspricht der des Automaten zu dem sie gehoeren
 */
const MergedAutomatonPositionsSelector = createDraftSafeSelector(
    [getAutomatonIdList, getMergedStatePositions, getMergedTransitionPositions],
    computeDerivedViewPositions
)


/**
 * Berechne die Strukturen aller Hardwareautomaten (deren Elemente muessen noch positioniert werden und zu vollstaendigen Automaten zusammengesetzt werden)
 * @returns Liste der Strukturen aller Hardwareautomaten
 */
const HardwareautomatonStructuresSelector = createDraftSafeSelector(
    [RawAutomatonStructureSelector],
    computeHardwareAutomatonStructures
)

/**
 * Berechne die Strukturen aller Fusionsautomaten (deren Elemente muessen noch positioniert werden und zu vollstaendigen Automaten zusammengesetzt werden)
 * @returns Liste der Strukturen aller Fusionsautomaten
 */
const MergedAutomatonStructuresSelector = createDraftSafeSelector(
    [RawAutomatonStructureSelector],
    computeMergedAutomatonStructures
)

/**
 * Berechne die Strukturen aller Hardwareautomaten und Postioniere alle Elemente entsprechend auf der Zeichenflaeche
 * @returns Liste der Strukturen aller Hardwareautomaten mit positionieren Elementen
 */
export const PlacedHardwareautomatonStructuresSelector = createDraftSafeSelector (
    [HardwareautomatonStructuresSelector, HardwareAutomatonPositionsSelector, AutomatonStructureSelector],
    placeDerivedViewElements
)   

/**
 * Berechne die Strukturen aller Fusionsautomaten und Postioniere alle Elemente entsprechend auf der Zeichenflaeche
 * @returns Liste der Strukturen aller Fusionautomaten mit positionieren Elementen
 */
export const PlacedMergedautomatonStructuresSelector = createDraftSafeSelector (
    [MergedAutomatonStructuresSelector, MergedAutomatonPositionsSelector, AutomatonStructureSelector],
    placeDerivedViewElements
)   

/**
 * Berechne alle Hardwareautomaten zu den Automaten im State in der internen Darstellung
 * 
 * @returns Liste aller Hardwareautomaten zu den aktiven Automaten im State
 */
const InternHardwareautomatonSelector = createDraftSafeSelector(
    [PlacedHardwareautomatonStructuresSelector, AutomatonMetadataSelector],
    function(placedHardwareautomatonStructures , automatonMetaData ){
        return buildInternDerivedAutomaton(placedHardwareautomatonStructures , automatonMetaData , DerivedAutomatonViews.HardwareAutomaton)
    }
)

/**
 * Berechne alle Fusionsautomaten zu den Automaten im State in der internen Darstellung
 * 
 * @returns Liste aller Fusionsautomaten zu den Automaten im State
 */
const InternMergedautomatonSelector = createDraftSafeSelector(
    [PlacedMergedautomatonStructuresSelector, AutomatonMetadataSelector],
    function(placedHardwareautomatonStructures , automatonMetaData ){
        return buildInternDerivedAutomaton(placedHardwareautomatonStructures , automatonMetaData , DerivedAutomatonViews.MergedAutomaton)
    }
)

/**
 * Berechne alle Hardwareautomaten 
 * TODO: Keinen Effekt solange die Cachegroesse 1 ist --> Cachegroesse erhoehen
 * @returns Liste aller Hardwareautomaten
 */
export const ApiHardwareautomatonSelector = createDraftSafeSelector(
    [SelectInternHardwareAutomatonsFromAppState, SelectCustomNamesFromAppState, getAutomatonViewConfig],
    transformAutomatonListToApi
)

/**
 * Berechne alle Hardwareautomaten 
 * TODO: Keinen Effekt solange die Cachegroesse 1 ist --> Cachegroesse erhoehen
 * @returns Liste aller Hardwareautomaten
 */
export const ApiMergedautomatonSelector = createDraftSafeSelector(
    [SelectInternMergedAutomatonsFromAppState, SelectCustomNamesFromAppState, getAutomatonViewConfig, getMergedAutomatonViewConfig],
    transformAutomatonListToApi
)