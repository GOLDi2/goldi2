import { current } from "immer";
import { cloneDeep, functionsIn, omit } from "lodash";
import { AccessorConverter } from "typedoc/dist/lib/converter/nodes";
import { SetNodeCords } from "../../actioncreator/editorState";
import { isUsableAutomatonName, getNextUsableNumber, getMaxRepresentableStateNumber, removeTransitionsFromNode, removeTransitionsToNode, doForAllExpressionsInGraph, getNodeIndex, treatTransitionCorruptionsAfterNodeCordChange, isUsableSignalName, getSignalPairIndexFromInternalNumber, getSignalId, isValidOperatorSymbol, calculateShortestPath, calculateRelativTransitionPosition, calculateRelativTransitionSupportPosition, calculateDistance, calculateTransitionBezier, computeSignalName, getAllControlSignalNamesFromExpression, getAllzVariableNamesFromExpression } from "../../actioncreator/helperfunctions";
import { CustomNameSelector, DerivedVariableAssignmentSelector, InputVariableSelector, InternEquationSetSelector, OutputVariableSelector, PlacedHardwareautomatonStructuresSelector, PlacedMergedautomatonStructuresSelector } from "../../selectors/normalizedEditorStateSelectors";
import { AppActions } from "../../types/Actions/appActions";
import { CHANGE_VIEW_STATE, SET_DERIVED_AUTOMATON_STATE_CORDS } from "../../types/Actions/editorStateActions";
import { ApiAutomaton } from "../../types/ApiClasses/GraphRepresentation/Automaton";
import { Automaton, AutomatonPositionStructure, AutomatonStructure, createUiAutomatonData, UiAutomatonData } from "../../types/Automaton";
import { binaryStringToGeneralTree, binaryStringToTreeErrorTupel } from "../../types/BooleanEquations/BinaryStringToTree";
import { calculateNextStateFromEquations, computeHardwareAutomatonStructures } from "../../types/BooleanEquations/computeHardwareAutomaton";
import { CustomNames } from "../../types/BooleanEquations/CustomNames";
import { ConstantType, VariableTyp } from "../../types/BooleanEquations/LogicTrees/TreeNodeInterfaces";
import { CompleteTreeRoot, ICompleteTreeRoot } from "../../types/BooleanEquations/LogicTrees/TreeRoots";
import { CompleteTreeConstantNode } from "../../types/BooleanEquations/LogicTrees/Variables";
import { minimizeLogicTree } from "../../types/BooleanEquations/Minimizer/minimizeTree";
import { ControlSignal, InternalIndependentControlSignal, S_NAME } from "../../types/ControlSignal";
import { ControlSignalPair } from "../../types/ControlSignalPair";
import { DuplicateNameError, ExpressionSyntaxError, HStarNotAFunctionOfxError, NameError, NameSyntaxError, NumberError, NumberResetError, UnknownVariableInExpressionError, OutputVariableInExpressionError, VariableTypeTupel } from "../../types/Error";
import { ExpressionErrorTupel, NameErrorTupel } from "../../types/ErrorElements";
import { CustomInputRepresentation, InternalInput, X_NAME } from "../../types/Input";
import { createNodePosition, DEFAULT_NODE_RADIUS, NodePosition, RawNode } from "../../types/Node";
import { AppState } from "../../types/NormalizedState/AppState";
import { AutomatonFrameWork, AutomatonSubState, createFixedPosition, createRawTransitionNormalized, DerivedViewNodePositions, DerivedViewTransitionPositions, FixedPosition, NodeSubState, RawTransitionNormalized, TransitionSubState } from "../../types/NormalizedState/AutomatonSubState";
import { MetaState } from "../../types/NormalizedState/MetaState";
import { NormalizedEditorState } from "../../types/NormalizedState/NormalizedEditorState";
import { StorageObject } from "../../types/NormalizedState/NormalizedObjects";
import { InputSubState, OutputSubState, NameTupel } from "../../types/NormalizedState/SignalSubState";
import { OperatorEnum } from "../../types/Operators";
import { CustomOutputRepresentation, Y_NAME } from "../../types/Output";
import { OutputSignalPair } from "../../types/OutputSignalPair";
import { Bezier, createBezier, createPoint, Point } from "../../types/Points";
import { Transition, TransitionPosition } from "../../types/Transition";
import { DerivedAutomatonViews, Viewstate } from "../../types/view";
import { ZNaming, ZVariable, Z_NAME } from "../../types/ZVariable";
import { removeIdFromIdList, removeTransitionFromTransitionList, removeNodeFromNodeList, addNodeToNodeList, getRawNodesToAutomaton, getAutomatonIdFromNodeID, getNodePositionsToAutomaton, getTransitionPositionsToAutomaton, getTransitonId, optimalNodePlacement, resetTemporaryDerivedStatePositions } from "./helperfunctions";

/**
 * Erstelle einen leeren Automaten
 * @param state State in dem der Automat erstellt werden soll
 * @param name Name des Automaten
 * @param info Info des Automaten
 */
export function addNewAutomaton(state: AutomatonSubState, name?: string, info?: string) {
    let automatonName: string //Name des zu erstellenden Automaten hier speichern
    let error: undefined | DuplicateNameError | NameSyntaxError = undefined // Eventuell enstehender Fehler der auch im State abgespeichert werden soll

    let automatonFrameWorks = state.automatonFrameWorks //Gerueste der Automaten im State

    //Berechne den naechsten automatisch generierten Automatenname (falls kein Name angegebn wurde oder der angegeben Namen fehlerhaft ist)

    const automatonNamePrefix = "automaton";

    let currentNumber = 0;
    //Hochzaehlen der Automatennummer bis ein unbenutzter Name erreicht wurde (hierbei darf die Funktion isUsableName keine Exception bei Dopplungen werfen)
    while (!isUsableAutomatonName(automatonFrameWorks, automatonNamePrefix + currentNumber, false)) {
        currentNumber++;
    }
    //Es wurde ein verfuegbarer Name gefunden
    let generatedAutomatonName = automatonNamePrefix + currentNumber;

    if (typeof name === 'undefined') {
        //kein Name uebergeben

        //standardname fuer Automaten bei Nichtangabe eines Namens (werden durchnummerriert)
        automatonName = generatedAutomatonName
    }
    else {
        //Es wurde eine Name uebergeben, der auf Verfuegbarkeit geprueft werden muss 
        //Bei Nichtverfuegbarkeit soll eine Exception geworfen werden
        try {
            isUsableAutomatonName(automatonFrameWorks, name, true)
            automatonName = name //Name war gueltig 
        }
        catch (e) {
            if (e instanceof DuplicateNameError || e instanceof NameSyntaxError) {
                //Alle moeglichen Fehler bei der Namensvergabe
                error = e
            }
            //automatisch generierten Namen verwenden
            automatonName = generatedAutomatonName
        }
    }
    //berechne die naechst freie Automaten-Id
    let id = getNextUsableNumber(automatonFrameWorks.automatonIDs)
    //Lege einen Automaten mit dieser  Id und dem Namen an
    if (!info) {
        info = automatonName
    }

    automatonFrameWorks.automatonIDs.push(id) //Id speichern
    let nameErrorTupel: NameErrorTupel = { validName: automatonName, error: error }
    let uiData = createUiAutomatonData(nameErrorTupel, id, info, false, { validNumber: 0, error: undefined }) //initialzustand: 0 (keine Fehler bei der Vergabe)
    automatonFrameWorks.uiAutomatonData[id] = uiData //Metadaten speichern
    automatonFrameWorks.currentStates[id] = { id: id, currentState: uiData.initialStateNumber.validNumber } //starte im Initalzustand
    automatonFrameWorks.nodeLists[id] = { id: id, nodeIds: [] } //Automat hat initial keine Knoten
    automatonFrameWorks.transitionLists[id] = { id: id, transitionIds: [] } // inital keine Kanten
    //keine fixierten Knoten in allen abgeleiteten Ansichten
    automatonFrameWorks.hardwareStatePositions[id] = { id: id, nodePositions: [] }
    automatonFrameWorks.fusionStatePositions[id] = { id: id, nodePositions: [] }

    //keine fixierten Kanten in allen abgeleiteten Ansichten
    automatonFrameWorks.fusionTransitionPositions[id] = { id: id, transitionPosition: [] }
    automatonFrameWorks.hardwareTransitionPositions[id] = { id: id, transitionPosition: [] }

    //Steuersignale des Automaten
    automatonFrameWorks.controlSignalLists[id] = { id: id, controlSignalIds: [] }
    automatonFrameWorks.controlSignalNameLists[id] = { id: id, nameList: {} }


    //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
    resetToInitialStates(state.automatonFrameWorks)
}

/**
 * Entferne einen Automaten
 * @param state State
 * @param automatonId Id des Automaten der entfernt werden soll
 */
export function removeAutomaton(state: AutomatonSubState, automatonId: number) {

    //Preufe ob der Automat existiert (seine Id ist in der Liste der AutomatenIds)
    //Wenn ja loesche seine ID
    if (removeIdFromIdList(state.automatonFrameWorks.automatonIDs, automatonId)) {
        //er existiert --> loesche ihn und all seine Elemente (id wurde in if ... geloescht)
        state.automatonFrameWorks.uiAutomatonData = omit(state.automatonFrameWorks.uiAutomatonData, automatonId) //Entferne seine Metadaten
        //entferne all seine Knoten und Kanten
        //entferne alle Kanten des Automaten sowie seine Kantenliste
        state.automatonFrameWorks.transitionLists[automatonId].transitionIds.forEach(transitionId => {
            //entfernde die aktuelle Kante
            removeTransitionFromTransitionList(state.transitionSubState, transitionId)
        })
        state.automatonFrameWorks.transitionLists = omit(state.automatonFrameWorks.transitionLists, automatonId) //Entferne die Kanten des Automaten
        state.automatonFrameWorks.nodeLists[automatonId].nodeIds.forEach(nodeId => {
            //entferne den Knoten
            removeNodeFromNodeList(state.nodeSubState, nodeId)
        })
        state.automatonFrameWorks.nodeLists = omit(state.automatonFrameWorks.nodeLists, automatonId) //Entferne die Knotenliste des Automaten

        //Entferne alle Daten der abgeleiteten Ansichten des Automaten
        state.automatonFrameWorks.fusionStatePositions = omit(state.automatonFrameWorks.fusionStatePositions, automatonId)
        state.automatonFrameWorks.fusionTransitionPositions = omit(state.automatonFrameWorks.fusionTransitionPositions, automatonId)
        state.automatonFrameWorks.hardwareStatePositions = omit(state.automatonFrameWorks.hardwareStatePositions, automatonId)
        state.automatonFrameWorks.hardwareTransitionPositions = omit(state.automatonFrameWorks.hardwareTransitionPositions, automatonId)
        state.automatonFrameWorks.currentStates = omit(state.automatonFrameWorks.currentStates, automatonId)
        state.automatonFrameWorks.controlSignalNameLists = omit(state.automatonFrameWorks.controlSignalNameLists, automatonId)
        state.automatonFrameWorks.controlSignalLists = omit(state.automatonFrameWorks.controlSignalLists, automatonId)

        // Ueberpruefe alle logischen Baeume innerhalb der Liste von Automaten auf eventuelle Korrumpierung nach dem Loeschen eines Automaten
        // Der Automat kann innerhalb der Baeume in den Steuersignalen oder z-Variablen refferenziert sein
        // Bei Korrumpierung wird der Baum zu logische 1 zurueckgesetzt
        //erstelle eine Funktion diesen Test und das eventuelle Ruecksetzen umsetzt
        let nodeCorruptionTreatement = function (expression: ICompleteTreeRoot): void {
            if (CompleteTreeRoot.corruptionCheckForAutomaton(expression, automatonId)) {
                //setze den Baum zurueck (initial zu logisch 1) --> nie Fehler da Konstante keine z-Variable enthaelt
                expression.tree = (new CompleteTreeConstantNode(ConstantType.ConstantOne))
            }
            //wenn der Automat nicht enthalten war --> tue nichts
        }
        //wende sie auf alle Ausduecke im Baum an
        doForAllExpressionsInGraph(state, nodeCorruptionTreatement)


        //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
        resetToInitialStates(state.automatonFrameWorks)
    }

}

/**
 * Benenne einen Automaten um 
 * @param state State
 * @param automatonId Id des Automaten der umbennant werden soll 
 * @param newName Neuer Name des Automaten
 */
export function changeAutomatonName(state: NormalizedEditorState, automatonId: number, newName: string) {
    //pruefe ob der neue Name noch verfuegbar ist (Wenn nein wird exception geweorfen)
    let nameErrorTupel: NameErrorTupel //Ergebnis das im State gespeichert werden soll

    //wenn der Automat existiert liegen seine Metadaten bei dem Key mit der Id des AUtomaten
    let matchAutomatonUiData = state.automatonSubState.automatonFrameWorks.uiAutomatonData[automatonId]
    if (matchAutomatonUiData !== undefined) {
        //Automat existiert --> bennene ihn um 

        try {
            isUsableAutomatonName(state.automatonSubState.automatonFrameWorks, newName, true)
            nameErrorTupel = { validName: newName, error: undefined } //Name war gueltig --> uebernimm ihn (keine Fehler)
        }
        catch (e) {
            // Name war Fehlerhaft --> behalte den aktuelle Namen bei
            nameErrorTupel = { validName: matchAutomatonUiData.name.validName, error: undefined }
            if (e instanceof DuplicateNameError || e instanceof NameSyntaxError) {
                //Alle moeglichen Fehler bei der Namensvergabe speichern
                nameErrorTupel.error = e
            }
        }

        //speicher das Ergebnis der Umbennenung ab
        matchAutomatonUiData.name = nameErrorTupel

    }

}

/**
 * Setze die Beschreibung eines Automaten
 * @param state State
 * @param automatonId Id des Automaten 
 * @param newInfo neue Beschreibung 
 */
export function setAutomatonInfo(state: NormalizedEditorState, automatonId: number, newInfo: string) {

    //wenn der Automat existiert liegen seine Metadaten bei dem Key mit der Id des AUtomaten
    let matchAutomatonUiData = state.automatonSubState.automatonFrameWorks.uiAutomatonData[automatonId]
    if (matchAutomatonUiData) {
        //Automat existiert --> bennene ihn um
        matchAutomatonUiData.info = newInfo
    }
}
/**
 * Fuegt einem bestehnden Automaten einen neuen Knoten hinzu (tut nichts falls Automat nicht existiert)
 * @param automatonId Id des Automaten dem der Knoten hinzugefuegt werden soll
 * @param customStateNumber Name des Zustandes (bei Nichtangabe automatisch gesetzt)
 * @param position Position des Knotens (bei Nichtangabe automatisch platziert)
 */
export function addNode(state: AutomatonSubState, automatonId: number, customStateNumber?: number, position?: Point | undefined) {
    //Preufe ob der Automat existiert 
    // Wenn ja muss seine Knotenliste existieren
    let matchNodeList = state.automatonFrameWorks.nodeLists[automatonId]
    if (matchNodeList) {
        //bei Nichtangabe der Zustandsnummer wird automatisch die naechste freie berechnet
        if (customStateNumber === undefined) {
            //Fuege die Zustandsnummern aller Knoten dieses Automaten in eine Liste ein
            let stateNumberList: Array<number> = []
            matchNodeList.nodeIds.forEach(currentNodeId => {
                //fuege die Zustandsnummer des aktuellen Knotens der Liste hinzu
                stateNumberList.push(state.nodeSubState.logicInformation[currentNodeId].customStateNumber.validNumber)
            })
            //berechne die naechst freie Zustandsnummer
            customStateNumber = getNextUsableNumber(stateNumberList)
        }
        //bei Nichtangabe der Position diese automatisch setzen
        if (position === undefined) {
            //berechne eine automatische Platzierung --> suche dafuer die Positionen aller Knoten dieses Automaten
            let nodePositions = getNodePositionsToAutomaton(state, automatonId)
            position = optimalNodePlacement(nodePositions)

        }
        //setze den initialen Namen des Knotens zu der Zustandsnummer
        let name = "Z" + customStateNumber

        //erstelle einen neuen Knoten
        let newNodeId = addNodeToNodeList(state.nodeSubState, customStateNumber, position, name)
        //Fuege diesen Knoten der Knotenliste des Automaten hinzu
        matchNodeList.nodeIds.push(newNodeId)
    }

    //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
    resetToInitialStates(state.automatonFrameWorks)

    //Aendert etwas an den Knotenpositionen und ggf. an der Positionierung in den abgeleiteten Ansichten --> temporaer fixierte Zustaende nicht mehr fixieren
    resetTemporaryDerivedStatePositions(state.automatonFrameWorks, automatonId)

}

/**
 * Entferne einen Knoten eines Automatens (tut nichts falls Automat nicht existiert)
 * @param nodeId Id des zu loeschenden Knotens
 */
export function removeNode(state: AutomatonSubState, nodeId: number) {
    //entferne den Knoten aus der Liste aller Knoten --> pruefe dabei ob er uerbhaupt existiert hat
    if (removeNodeFromNodeList(state.nodeSubState, nodeId)) {
        //Knoten hat existiert --> entferne ihn aus den Knotenlisten seines Automaten (sollte eigentlich nur in einer enthalten sein)
        let matchAutomatonId = getAutomatonIdFromNodeID(state, nodeId)

        if (matchAutomatonId !== undefined) {
            //entferne den Knoten aus der Knotenliste des Automaten
            removeIdFromIdList(state.automatonFrameWorks.nodeLists[matchAutomatonId].nodeIds, nodeId)
            //Der Knoten war einem Automaten zugeordnet --> preufe ob dessen Initialzustand zureuckgesetzt werden muss

            //berechne den neuen groesstmoeglichen Zustand innerhalb der Knoten des Automaten
            let maxStateNumber = getMaxRepresentableStateNumber(getRawNodesToAutomaton(state, matchAutomatonId))


            //ist die neue hoechste darstellbare Zustandsnummer des Automaten kleiner als der Startzustand --> startzustand anpassen: zu 0 setzen
            let matchAutomatonUiData = state.automatonFrameWorks.uiAutomatonData[matchAutomatonId]
            if (maxStateNumber < matchAutomatonUiData.initialStateNumber.validNumber) {
                let oldNumber = matchAutomatonUiData.initialStateNumber.validNumber
                matchAutomatonUiData.initialStateNumber = { validNumber: 0, error: new NumberResetError(oldNumber) }; //Speichere dass die Nummer zureuckgesetzt wurde          
            }

            //Entferne alle Kanten, die diesen Knoten als Start- oder Endpunkt haben
            //alle mit jenem Startpunkt loeschen
            removeTransitionsFromNode(state, nodeId)
            //Alle mit jenem Endpunkt loeschen
            removeTransitionsToNode(state, nodeId)

            //Aendert etwas an den Knotenpositionen und ggf. an der Positionierung in den abgeleiteten Ansichten --> temporaer fixierte Zustaende nicht mehr fixieren
            resetTemporaryDerivedStatePositions(state.automatonFrameWorks, matchAutomatonId)

        }

        //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
        resetToInitialStates(state.automatonFrameWorks)


    }


}


/**
 * Entferne eine Kante aus dem System
 * @param nodeId Id der zu loeschenden Kante
 */
export function removeTransition(state: AutomatonSubState, transitionId: number) {
    //entferne die Kante aus der Liste aller Kanten --> pruefe dabei ob sie uerbhaupt existiert hat
    if (removeTransitionFromTransitionList(state.transitionSubState, transitionId)) {
        //Die Kante hat existiert --> loesche ihre Vorkommen in den Automaten (sollte nur in einem sein)
        for (let automatonCounter = 0; automatonCounter < state.automatonFrameWorks.automatonIDs.length; automatonCounter++) {
            //loesche die KantenId aus der Kantenliste des aktuellen Automaten (falls sie darin enthalten ist)
            let currentTransitionList = state.automatonFrameWorks.transitionLists[automatonCounter].transitionIds
            if (removeIdFromIdList(currentTransitionList, transitionId)) {
                //der Knoten war diesem Automaten zugeordnet
                break; //Knoten darf nur einem Automaten zugeordnet gewesen sein
            }
        }

        //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
        resetToInitialStates(state.automatonFrameWorks)
    }

}

/**
 * Veraendert die customNodeNumber (die Zustandskoodierung) eines Knotens, falls dieser existiert und die neue Koodierung zulaessig (>0) ist 
 * @param state State mit den Informationen
 * @param nodeId Id des gesuchten Knotens
 * @param newNodeName neue Nummer / Zustandskoodierung des Knotens
 */
export function changeNodeNumber(state: AutomatonSubState, nodeId: number, newStateNumber: number) {
    //Pruefe ob der gesuchte Knoten existiert --> wenn ja aendere seine Zustandskoodierung
    let matchNodeLogicData = state.nodeSubState.logicInformation[nodeId]
    let oldStateNumber = matchNodeLogicData.customStateNumber

    if (matchNodeLogicData !== undefined) {
        //der Knoten existiert --> Finde heraus zu welchem Automaten der Knoten gehoert
        let matchAutomatonId = getAutomatonIdFromNodeID(state, nodeId)
        if (matchAutomatonId !== undefined) {
            //sollte immer der Fall sein (Knoten gehoert immer zu Automaten


            //passe die Zustandsnummer an --> preuffe ob sie valide ist
            if (newStateNumber >= 0) {
                //ist valide --> uebernimm sie

                //Enferne die Position des entsprechenden Zustandes des HW-Automaten falls diese gesetzt war

                //Durchsuche die Liste der Positionen nach einem Eintrag fuer den Zustand des aktuellen Knotens
                let hardwareStatePositions = state.automatonFrameWorks.hardwareStatePositions[matchAutomatonId].nodePositions
                let hardwareTransitionPositions = state.automatonFrameWorks.hardwareTransitionPositions[matchAutomatonId].transitionPosition
                let hardwareStatePositionMatchIndex = getNodeIndex(hardwareStatePositions, oldStateNumber.validNumber) //In HW ist ID=Zustandsnummer
                if (hardwareStatePositionMatchIndex > -1) {
                    //Der Zustand besitzt einen Eintrag --> entferne ihne
                    hardwareStatePositions.splice(hardwareStatePositionMatchIndex, 1)
                }
                //entferne alle fixierten Kanten die von diesem Zustand ausgehen bzw. zu diesem fuehren (die Nummer des Zustands ist dessen ID)
                // --> behalte alle Eintraege die weder zu noch von dem veranderten Zustand weg fuehren
                hardwareTransitionPositions = hardwareTransitionPositions.filter(transition =>
                    transition.fromNodeId !== oldStateNumber.validNumber && transition.toNodeId !== oldStateNumber.validNumber)

                //ansonsten: tue nichts


                matchNodeLogicData.customStateNumber = { validNumber: newStateNumber, error: undefined } //kein Fehler bei der Vergabe


                //berechne den neuen groesstmoeglichen Zustand
                let maxStateNumber = getMaxRepresentableStateNumber(getRawNodesToAutomaton(state, matchAutomatonId))

                //ist die neue hoechste darstellbare Zustandsnummer des Automaten kleiner als der Startzustand --> startzustand anpassen: zu 0 setzen
                let matchAutomatonUiData = state.automatonFrameWorks.uiAutomatonData[matchAutomatonId]
                if (maxStateNumber < matchAutomatonUiData.initialStateNumber.validNumber) {
                    let oldNumber = matchAutomatonUiData.initialStateNumber.validNumber
                    matchAutomatonUiData.initialStateNumber = { validNumber: 0, error: new NumberResetError(oldNumber) }; //Fehlermedlung fuer Reset speichern
                }

                //Aendert ggf. etwas an der Positionierung in den abgeleiteten Ansichten --> temporaer fixierte Zustaende nicht mehr fixieren
                resetTemporaryDerivedStatePositions(state.automatonFrameWorks, matchAutomatonId)

                //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
                resetToInitialStates(state.automatonFrameWorks)
            }
            else {
                //invalide neue nummer --> behalte die alte bei und speichere den Fehler
                matchNodeLogicData.customStateNumber.error = new NumberError(newStateNumber)

                //keine Aenderung am System --> kein Ruecksetzen der Zusatende
            }


        }
    }
}



/**
 * Veraendert den Namen eines Knotens, falls dieser existiert (alle Namen sind zulaessig)
 * @param state State mit den Informationen
 * @param nodeId Id des gesuchten Knotens
 * @param newName neuer Name des Knotens
 */
export function changeNodeName(state: AutomatonSubState, nodeId: number, newNodeName: string) {

    //Pruefe ob der gesuchte Knoten existiert --> wenn ja aendere seinen Namen
    let currentMatchNodeName = state.nodeSubState.names[nodeId]

    if (currentMatchNodeName !== undefined) {
        //der Knoten existiert --> bennene ihn um
        currentMatchNodeName.customName = { validName: newNodeName, error: undefined } //alle Namen sind zulaessig --> keine Fehler moeglich
    }
}


/**
 * Veraendert die Lage / die Koordinaten des angesprochenen Knotens, falls dieser existiert und die Koordinaten zuleassig sind
 * @param State State mit den Informationen
 * @param nodeId Id des zu verschiebenden Knotens
 * @param newPosition neue Position des Knotens
 */
export function setNodeCords(state: AutomatonSubState, nodeId: number, newPosition: Point) {
    let matchNodePosition = state.nodeSubState.nodePositions[nodeId]
    if (matchNodePosition) {
        //der angegebene Automat wurde gefunden --> suche den zu verschiebenden Knoten und verschiebe ihn
        // Alle Kanten zu oder von diesem Knoten muessen ebenfalls in ihrem Verlauf angepasst werden

        //Neue Koordinaten fuer den Knoten setzen
        matchNodePosition.position = newPosition

        //Bestimme den Automaten zu dem der Knoten gehoert 
        let matchAutomatonId = getAutomatonIdFromNodeID(state, nodeId)
        if (matchAutomatonId !== undefined) {
            //Der Knoten war einem Automaten zugeordnet (eigentlich immer wenn keine Datenfehler)
            //Bestimme die Knoten und Kanten des Automaten mit ihrer Position
            let matchAutomatonNodes = getNodePositionsToAutomaton(state, matchAutomatonId)
            let matchAutomatonTransitions = getTransitionPositionsToAutomaton(state, matchAutomatonId)
            // console.log(matchAutomatonNodes)
            // console.log(matchAutomatonTransitions)

            //passe den Verlauf der betroffenen Kanten an
            treatTransitionCorruptionsAfterNodeCordChange(matchAutomatonNodes, matchAutomatonTransitions, nodeId, newPosition)

            //Eine Verschiebung eines Knotens im Designautomaten soll dazu fuehren, dass Zustaende der abgeleiteten Ansichten, welche keine Vorlageknoten im Designautomaten haben
            // und nicht permanent fixiert waren beim nachsten Berechnen des Selektors gemaess der neuen Positionen der Knoten erneut automatisch platziert werden
            // --> loesche allle temporaer platzierten Eintraege in den Positionsvorgaben der Konten der abgeleiteten Ansichten
            resetTemporaryDerivedStatePositions(state.automatonFrameWorks, matchAutomatonId)
        }

    }
}


/**
 * Erstellt eine neue Eingangsvariable mit diesem Namen als nutzerdefinierten Namen (intern mit x_i bezeichnet)
 * @param customName Name der neuen Variablen (wird bei Nichtangabe zur internen Bezeichnung gesetzt)
 */
export function addGlobalInput(state: InputSubState, customName?: string) {
    //berechne die naechste freie Id fuer eine Eingangsvariable
    let inputId = getNextUsableNumber(state.inputIDs)
    let result: NameErrorTupel //Ergebnis das im State gespeichert wird


    //extrahiere die Namen aus dem State
    let currentInputs: Array<NameTupel> = Object.values(state.customNames)
    //berechne den nachsten noch freien Variablennamen (starte bei index 0 und zaehle hoch)
    let currentIndex = 0;
    let nextfreeInputName: string
    do {
        nextfreeInputName = X_NAME + currentIndex
        currentIndex++;
    }
    while (!isUsableSignalName(currentInputs, nextfreeInputName, false))
    //Es wurde ein freier Name gefunden
    if (customName === undefined) {
        //es wurde kein Name vorgegeben --> nutze den brechneten (keine Fehler aufgetreten)
        result = { validName: nextfreeInputName, error: undefined }
    }
    else {
        //Es wurde eine Name uebergeben, der auf Verfuegbarkeit geprueft werden muss (falls nicht gueltig wird der automatisch berechnet Name genutzt)
        result = computeSignalName(customName, currentInputs, nextfreeInputName)
    }

    //fuege den neuen Eingang hinzu
    state.inputIDs.push(inputId) //Id speichern
    state.customNames[inputId] = { id: inputId, customName: result } // Name speicher
    state.assignments[inputId] = { id: inputId, assignment: false } //initale Belegung:false


}


/**
 * Entfernt den uebergebenen Eingang falls er existiert (sonst passiert nichts)
 * @param customName nutzerdefinierter Name des Eingangssignals
 */
export function removeGlobalInput(state: NormalizedEditorState, customName: string) {
    //finde den Eingang, der diesen Namen besitzt 
    let inputSubState = state.inputSubState
    let automatonSubState = state.automatonSubState
    //laufe ueber die Namen aller Eingaenge
    let matchId: number | undefined //Id des Eingangs mit dem gegebenen Namen
    inputSubState.inputIDs.forEach(currentId => {
        //greife den Namen dieses Eingangs und gleiche ihn ab
        if (inputSubState.customNames[currentId].customName.validName.toLocaleLowerCase() === customName.toLocaleLowerCase()) {
            //Dieser Eingang soll entfernt werden
            matchId = currentId
        }
    })

    //entferne den Eingang um falls er gefunden wurde
    if (matchId !== undefined) {
        //Erstelle eine Repreasentation des entfernten Eingangs
        let removedInput = new InternalInput(matchId)
        //Id entfernen
        removeIdFromIdList(inputSubState.inputIDs, matchId)
        inputSubState.assignments = omit(inputSubState.assignments, matchId) //Belegung entfernen
        inputSubState.customNames = omit(inputSubState.customNames, matchId) //Name entfernen

        // console.log(inputSubState.inputIDs)

        //suche alle logischen Baueme die diesen Eingang beinhalten und verwirf diese (Ruecksetzen aller betroffenen Baeume zu logisch 1)
        // Ueberpruefe alle logischen Baeume innerhalb der Liste von Automaten auf eventuelle Korrumpierung nach dem Loeschen des Eingangs
        // Bei Korrumpierung wird der Baum zu logische 1 zurueckgesetzt
        //erstelle eine Funktion diesen Test und das eventuelle Ruecksetzen umsetzt
        let expressionCorruptionTreatement = function (expression: ICompleteTreeRoot): void {
            if (CompleteTreeRoot.corruptionCheckForInput(expression, removedInput)) {
                //setze den Baum zurueck (initial zu logisch 1) --> nie Fehler da Konstante keine z-Variable enthaelt
                expression.tree = (new CompleteTreeConstantNode(ConstantType.ConstantOne))
            }
            //wenn der Automat nicht enthalten war --> tue nichts
        }
        //wende sie auf alle Ausduecke im Baum an
        doForAllExpressionsInGraph(automatonSubState, expressionCorruptionTreatement)

        //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
        resetToInitialStates(state.automatonSubState.automatonFrameWorks)
    }

}
/**
 * Erstellt eine neue Ausgangsvariable mit diesem Namen als nutzerdefinierten Namen (intern mit y_i bezeichnet)
 * @param customName Name der neuen Variablen (wird bei Nichtangabe zur internen Bezeichnung gesetzt)
 */
export function addGlobalOutput(state: OutputSubState, customName?: string) {
    //berechne die naechste freie Id fuer eine Ausgangsvariable
    let outputID = getNextUsableNumber(state.outputIDs)

    //Berechne die externe Darstellung der aktuellen Ausgangsvariablen 
    let currentOutputs = Object.values(state.customNames)

    let result: NameErrorTupel //Ergebnis das im State gespeichert wird

    //berechne den nachsten noch freien Variablennamen (starte bei index 0 und zaehle hoch)
    let currentIndex = 0;
    let nextfreeOutputName: string
    do {
        nextfreeOutputName = Y_NAME + currentIndex
        currentIndex++;
    }
    while (!isUsableSignalName(currentOutputs, nextfreeOutputName, false))
    //Es wurde ein freier Name gefunden
    if (customName === undefined) {
        //es wurde kein Name vorgegeben --> nutze den brechneten (keine Fehler aufgetreten)
        result = { validName: nextfreeOutputName, error: undefined }
    }
    else {
        //Es wurde eine Name uebergeben, der auf Verfuegbarkeit geprueft werden muss (falls nicht gueltig wird der automatisch berechnet Name genutzt)
        result = computeSignalName(customName, currentOutputs, nextfreeOutputName)
    }

    //fuege den neuen Ausgang hinzu
    state.outputIDs.push(outputID) //Id speichern
    state.customNames[outputID] = { id: outputID, customName: result } // Name speicher

}


/**
 * Entfernt den uebergebenen Ausgang falls er existiert (sonst passiert nichts)
 * @param customName nutzerdefinierter Name des Ausgangssignals
 */
export function removeGlobalOutput(state: NormalizedEditorState, customName: string) {
    //finde den Eingang, der diesen Namen besitzt 
    let outputSubState = state.outputSubState
    let automatonSubState = state.automatonSubState
    //laufe ueber die Namen aller Ausgaenge
    let matchId: number | undefined //Id des Ausgangs mit dem gegebenen Namen
    outputSubState.outputIDs.forEach(currentId => {
        //greife den Namen dieses Eingangs und gleiche ihn ab
        if (outputSubState.customNames[currentId].customName.validName.toLocaleLowerCase() === customName.toLocaleLowerCase()) {
            //Dieser Eingang soll entfernt werden
            matchId = currentId
        }
    })

    //entferne den Ausgang um falls er gefunden wurde
    if (matchId !== undefined) {
        let removedOutputeID = matchId
        removeIdFromIdList(outputSubState.outputIDs, matchId) //Id entfernen
        outputSubState.customNames = omit(outputSubState.customNames, matchId) //Name entfernen

        // die Belegung dieses Ausgangs muss noch in allen Knoten aller Automaten geloescht werden 
        //Laufe ueber alle Automaten
        automatonSubState.automatonFrameWorks.automatonIDs.forEach(currentAutomatonId => {
            //suche alle Knoten des aktuellen Automaten
            let automatonNods = getRawNodesToAutomaton(state.automatonSubState, currentAutomatonId)
            //preufe die Ausgabe aller Knoten
            automatonNods.forEach(currentNode => {
                let currentNodeOutput = currentNode.outputAssignment
                //ist der Ausgang in der Ausgabe des Knotens gesetzt ?  Wenn jaentferne ihn aus der Liste der gesetzten Ausgaenge dieses Zustands
                let outputMatchIndex = getSignalPairIndexFromInternalNumber(currentNodeOutput, removedOutputeID)

                if (outputMatchIndex > -1) {
                    //Es wurde der gesuchte Ausgang gefunden --> entferne ihn aus der Liste der gesetzten Ausgaenge dieses Zustands
                    currentNodeOutput.splice(outputMatchIndex, 1)
                }
            })
        })

        //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
        resetToInitialStates(state.automatonSubState.automatonFrameWorks)
    }

}


/**
 * Benennt ein existierendes Eingangssignal um (tut nichts wenn dieses nicht vorhanden)
 * @param oldName nutzerdefinierter Name des umzubenennden Eingangs  
 * @param newName Neuer nutzerdefinierter Name des Eingangs
 */
export function changeGlobalInputName(state: InputSubState, oldCustomName: string, newCustomName: string) {
    //extrahiere alle aktuelle Eingaenge
    let inputList = Object.values(state.customNames)

    // bestimme den Index des umzubennenden Eingangs innerhalb der Liste der Eingaenge
    let matchId = getSignalId(inputList, oldCustomName)

    if (matchId !== undefined) {
        //es wurde ein Eingang mit dem alten Namen gefunden --> pruefe deb zu setzenden Namen 

        //pruefe ob der neue Name noch verfuegbar ist
        let reslut = computeSignalName(newCustomName, inputList, oldCustomName) //alter Name wird beibehalten falls der neue ungueltig ist

        state.customNames[matchId].customName = reslut
    }

}

/**
 * Benennt ein existierendes Ausgangssignal um (tut nichts wenn dieses nicht vorhanden)
 * @param oldName nutzerdefinierter Name des umzubenennden Ausgangs  
 * @param newName Neuer nutzerdefinierter Name des Ausgangs
 */
export function changeGlobalOutputName(state: OutputSubState, oldCustomName: string, newCustomName: string) {
    //extrahiere alle aktuelle Ausganege
    let outputList = Object.values(state.customNames)


    // bestimme den Index des umzubennenden Eingangs innerhalb der Liste der Eingaenge
    let matchId = getSignalId(outputList, oldCustomName)

    if (matchId !== undefined) {
        //es wurde ein Eingang mit dem alten Namen gefunden --> pruefe den zu setzenden Namen

        //pruefe ob der neue Name noch verfuegbar ist
        let reslut = computeSignalName(newCustomName, outputList, oldCustomName) //alter Name wird beibehalten falls der neue ungueltig ist
        state.customNames[matchId].customName = reslut
    }

}
/**
 * Fuege einem Automaten ein Steuersginal hinzu
 * @param automatonId Id des Automaten
 * @param newCustomName nutzerdefinierter Name des Steuersignals
 */
export function addControlSignal(state: AutomatonSubState, automatonId: number, newCustomName: string | undefined) {
    //Preufe ob der Automat existiert (Genau dann wenn sein Steuersignal-Eintraege existieren)
    let matchAutomatonControlSignals = state.automatonFrameWorks.controlSignalLists[automatonId]
    let matchAutomatonControlSignalNames = state.automatonFrameWorks.controlSignalNameLists[automatonId]
    if ((matchAutomatonControlSignals !== undefined) && (matchAutomatonControlSignalNames !== undefined)) {
        //Der Automat existiert --> extrahiere seine Steuersignale

        //berechne die naechste freie Id fuer eine Steuersignal im Automaten
        //extrahiere alle aktuellen Nummern
        let currentIdList: Array<number> = matchAutomatonControlSignals.controlSignalIds
        let currentNames: Array<NameTupel> = Object.values(matchAutomatonControlSignalNames.nameList)

        let signalId = getNextUsableNumber(currentIdList)

        let result: NameErrorTupel //Ergebnis das im State gespeichert wird

        //berechne den nachsten noch freien Variablennamen (starte bei index 0 und zaehle hoch)
        let currentIndex = 0;
        let nextFreeControlsignalName: string
        do {
            nextFreeControlsignalName = S_NAME + currentIndex
            currentIndex++;
        }
        while (!isUsableSignalName(currentNames, nextFreeControlsignalName, false))
        //Es wurde ein freier Name gefunden

        if (newCustomName === undefined) {
            //es wurde kein Name vorgegeben --> nutze den brechneten (keine Fehler aufgetreten)
            result = { validName: nextFreeControlsignalName, error: undefined }
        }
        else {

            //Es wurde eine Name uebergeben, der auf Verfuegbarkeit geprueft werden muss (falls nicht gueltig wird der automatisch berechnet Name genutzt)
            result = computeSignalName(newCustomName, currentNames, nextFreeControlsignalName)
        }

        //fuege das Signal hinzu
        matchAutomatonControlSignals.controlSignalIds.push(signalId)
        matchAutomatonControlSignalNames.nameList[signalId] = { id: signalId, customName: result }

    }
}

/**
 * Loesche ein Steuersginal aus einem Automaten
 * @param automatonId Id des Automaten
 * @param customName nutzerdefinierter Name des Steuersignals
 */
export function removeControlSignal(state: AutomatonSubState, automatonId: number, customName: string) {
    //Preufe ob der Automat existiert (Genau dann wenn sein Ui-Eintrag existiert)
    let matchAutomatonControlSignals = state.automatonFrameWorks.controlSignalLists[automatonId]
    let matchAutomatonControlSignalNames = state.automatonFrameWorks.controlSignalNameLists[automatonId]
    if ((matchAutomatonControlSignals !== undefined) && (matchAutomatonControlSignalNames !== undefined)) {
        //Der Automat existiert --> extrahiere seine Steuersignale

        let currentIdList: Array<number> = matchAutomatonControlSignals.controlSignalIds
        let currentNames: Array<NameTupel> = Object.values(matchAutomatonControlSignalNames.nameList)

        //suche das zu leoschende Singal
        let matchID = getSignalId(currentNames, customName)
        if (matchID !== undefined) {
            //das zu leoschende Signal existiert --> greife es

            removeIdFromIdList(currentIdList, matchID)
            matchAutomatonControlSignalNames.nameList = omit(matchAutomatonControlSignalNames.nameList, matchID)
            let independentRemovedCs = new InternalIndependentControlSignal(matchID, automatonId)

            // suche alle logischen Baueme die dieses Steuersignal beinhalten und verwirf diese (Ruecksetzen aller betroffenen Baeume zu logisch 1)

            // Ueberpruefe alle logischen Baeume innerhalb der Liste von Automaten auf eventuelle Korrumpierung nach dem Loeschen des Steuersignals
            // Bei Korrumpierung wird der Baum zu logische 1 zurueckgesetzt
            //erstelle eine Funktion diesen Test und das eventuelle Ruecksetzen umsetzt
            let treeCorruptionTreatement = function (expression: ICompleteTreeRoot): void {
                if (CompleteTreeRoot.corruptionCheckForControlSignal(expression, independentRemovedCs)) {
                    //setze den Baum zurueck (initial zu logisch 1) --> nie Fehler da Konstante keine z-Variable enthaelt
                    expression.tree = (new CompleteTreeConstantNode(ConstantType.ConstantOne))
                }
                //wenn der Automat nicht enthalten war --> tue nichts
            }
            //wende sie auf alle Ausduecke im Baum an
            doForAllExpressionsInGraph(state, treeCorruptionTreatement)


            // die Belegung dieses Signals muss noch in allen Knoten aller Automaten geloescht werden 
            //Laufe ueber alle Automaten
            state.automatonFrameWorks.automatonIDs.forEach(currentAutomatonId => {
                //suche alle Knoten des aktuellen Automaten
                let automatonNods = getRawNodesToAutomaton(state, currentAutomatonId)
                //preufe die Ausgabe aller Knoten
                automatonNods.forEach(currentNode => {
                    let currentNodeOutput = currentNode.controlSignalAssignment
                    //ist der Ausgang in der Ausgabe des Knotens gesetzt ?  Wenn jaentferne ihn aus der Liste der gesetzten Ausgaenge dieses Zustands
                    let outputMatchIndex = getSignalPairIndexFromInternalNumber(currentNodeOutput, independentRemovedCs.getNumber())

                    if (outputMatchIndex > -1) {
                        //Es wurde der gesuchte Ausgang gefunden --> entferne ihn aus der Liste der gesetzten Ausgaenge dieses Zustands
                        currentNodeOutput.splice(outputMatchIndex, 1)
                    }
                })
            })




            //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
            resetToInitialStates(state.automatonFrameWorks)
        }

    }
}


/**
 * Umbennenen eins Steuersginals aus einem Automaten
 * @param automatonId Id des Automaten
 * @param newCustomName neuer nutzerdefinierter Name des Steuersignals
 * @param oldCustomName alter nutzerdefinierter Name des Steuersignals
 */
export function changeControlSignalName(state: AutomatonSubState, automatonId: number, newCustomName: string, oldCustomName: string) {
    //Preufe ob der Automat existiert (Genau dann wenn seine Steuersignale existieren)
    let matchAutomatonControlSignalNames = state.automatonFrameWorks.controlSignalNameLists[automatonId]
    if (matchAutomatonControlSignalNames !== undefined) {
        //Der Automat existiert --> extrahiere seine Steuersignale

        let currentNames: Array<NameTupel> = Object.values(matchAutomatonControlSignalNames.nameList)
        //suche das zu leoschende Singal
        let matchID = getSignalId(currentNames, oldCustomName)
        if (matchID !== undefined) {
            //das zu leoschende Signal existiert  --> greife es
            let siglanToRename = matchAutomatonControlSignalNames.nameList[matchID]
            if (siglanToRename !== undefined) {
                //sollte immer der Fall sein
                //Teste den neuen Namen auf Gueltigkeit und uebernimm ihn ggf.
                siglanToRename.customName = computeSignalName(newCustomName, currentNames, oldCustomName) //wenn neuer Name nicht gueltig ist wird der alte beibehalten
                //pruefe ob der neue Name noch verfuegbar ist (Wenn nein wird exception geweorfen)

            }


        }
    }
}


/**
 * Setzt eine Ausgangsvariable in einem Knoten zu einem logischen Ausdruck falls diese existiert
 * @param nodeId Id des Knotens in dem der Ausgang gesetzt werden soll
 * @param customOutputName nutzerdefinierter Name der zu setztenden Ausgangsvariable
 * @param equation logischer Ausdruck fuer den Ausgang --> darf keine z-Variablen enthalten
 */
export function setOutput(state: NormalizedEditorState, nodeId: number, outputName: string, equation: string) {
    //pruefe ob der gesuchte Knoten existiert
    let matchNode = state.automatonSubState.nodeSubState.logicInformation[nodeId]
    if (matchNode) {
        //er existiert --> pruefe ob der zu setzende Ausgang existiert
        //ordne dem Konten seinen Automaten zu
        let automatonId = getAutomatonIdFromNodeID(state.automatonSubState, nodeId)
        //extrahiere die globalen Ausgaben
        let outputs = Object.values(state.outputSubState.customNames)
        let outputId = getSignalId(outputs, outputName)

        if ((outputId !== undefined) && (automatonId !== undefined)) {
            //Der zu setzende Ausgang existiert im System
            //Suche den zu setzenden Ausgang innerhalb der Ausgaenge des Knotens
            let destNodeMatchIndex = getSignalPairIndexFromInternalNumber(matchNode.outputAssignment, outputId)

            //wenn der Ausgang bereits belegt war so nutze die aktuelle Ausgabe als Backup falls der neue Ausruck einen Fehler beinhaltet
            //ist undefined, falls noch keine Ausgabe existiert hat --> beim Erstellen der neuen Ausgabe wird die Standardbedingung verwendet
            let backupCondition = matchNode.outputAssignment[destNodeMatchIndex]?.equationErrorTupel.validExpression

            //Erstelle den logischen Baum fuer den Ausdruck --> Ausgabe darf von Steuersignalen abhangen aber keine z-Variablen beinhalten
            let customNames = CustomNameSelector(state)

            let outputSignalpair = OutputSignalPair.createOutputSignalpair(outputId, equation, customNames, automatonId, backupCondition) //faengt alle eventuellen Fehler ab


            //Ist der Ausgang innerhalb des Knotens schon gesetzt? --> ersetzen der logischen Bedingung
            if (destNodeMatchIndex == -1) {
                //die zu setzende Ausgangsletiable existiert und ist innerhalb des Knotens noch nicht gesetzt
                // --> fuege sie mit dem logischen Ausdruck in die Liste des Knotens ein
                matchNode.outputAssignment.push(outputSignalpair)
            }
            else {
                //der Ausgang war bereits gesetzt --> veraendere den logischen Ausdruck (setze eine neue Belegung um erneut auf das Enthaltensein von zVariablen zu preufen)
                //wirft Fehler wenn der zu setzende Ausdruck z-Variablen enthaelt

                matchNode.outputAssignment[destNodeMatchIndex] = outputSignalpair
            }

            //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
            resetToInitialStates(state.automatonSubState.automatonFrameWorks)
        }
        //in allen anderen Faellen existiert der zu setzende Ausgang nicht --> tue nichts
    }
}

/**
 * Fuegt einen Automaten zur Liste der aktiven Automaten hinzu falls dieser existiert
 * @param automatonId Id des hinzuzufuegenden Automaten
 */
export function addActiveAutomaton(state: AutomatonFrameWork, automatonId: number) {
    //suche den Automaten
    let matchAutomatonUi = state.uiAutomatonData[automatonId]
    if (matchAutomatonUi) {
        //Der Automat existiert --> aktiviere ihn
        matchAutomatonUi.isActive = true
    }
}

/**
 * Entfernt einen Automaten aus der Liste der aktiven Automaten hinzu falls dieser existiert
 * @param automatonId Id des zu deaktivierenden Automaten
 */
export function removeActiveAutomaton(state: AutomatonFrameWork, automatonId: number) {
    //suche den Automaten
    let matchAutomatonUi = state.uiAutomatonData[automatonId]
    if (matchAutomatonUi) {
        //Der Automat existiert --> deaktiviere ihn
        matchAutomatonUi.isActive = false
    }
}

/**
 * Setzt eine Ausgangsvariable innerhalb eines Zustandes, die aktuell belegt ist auf 0 zurueck (falls diese existiert)
 * @param nodeId Id es Knotens in dem die Ausgangsvariable zu 0 gesetzt werden soll
 * @param customOutputName nutzerdefienierter Name der zurueckzusetzenden Ausgangsvariablen
 */
export function resetOutput(state: NormalizedEditorState, nodeId: number, outputName: string) {
    //pruefe ob der gesuchte Knoten existiert
    let matchNode = state.automatonSubState.nodeSubState.logicInformation[nodeId]
    if (matchNode !== undefined) {
        //er existiert --> pruefe ob der rueckzusetzende setzende Ausgang existiert

        //extrahiere die globalen Ausgaben
        let outputs = Object.values(state.outputSubState.customNames)
        let outputId = getSignalId(outputs, outputName)

        if (outputId !== undefined) {
            //Der zu setzende Ausgang existiert im System
            //Suche den zu setzenden Ausgang innerhalb der Ausgaenge des Knotens
            let destNodeMatchIndex = getSignalPairIndexFromInternalNumber(matchNode.outputAssignment, outputId)

            //loesche die Ausgabe
            matchNode.outputAssignment.splice(destNodeMatchIndex, 1)

            //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
            resetToInitialStates(state.automatonSubState.automatonFrameWorks)
        }
    }
}


/**
 * Fuegt einen Knoten zur Liste der aktiven Knoten hinzu falls dieser existiert
 * @param nodeId Id des hinzuzufuegenden Knotens
 */
export function addActiveNode(state: NodeSubState, nodeId: number) {
    //suche den Knoten
    let matchNodePosition = state.nodePositions[nodeId]
    if (matchNodePosition !== undefined) {
        //Der Knoten existiert --> aktiviere ihn
        matchNodePosition.isActive = true
    }
}

/**
 * Entferne einen Knoten aus der Liste der aktiven Knoten hinzu falls dieser existiert
 * @param nodeId Id des zu deaktivierenden Knotens
 */
export function removeActiveNode(state: NodeSubState, nodeId: number) {
    //suche den Knoten
    let matchNodePosition = state.nodePositions[nodeId]
    if (matchNodePosition !== undefined) {
        //Der Knoten existiert --> aktiviere ihn
        matchNodePosition.isActive = false
    }
}


/**
 * Setzt eine Ausgangsvariable in einem Knoten zu einem logischen Ausdruck falls diese existiert
 * @param nodeId Id des Knotens in dem der Ausgang gesetzt werden soll
 * @param customOutputName nutzerdefinierter Name der zu setztenden Ausgangsvariable
 * @param equation logischer Ausdruck fuer den Ausgang --> darf keine z-Variablen enthalten
 */
export function setControlSignal(state: NormalizedEditorState, nodeId: number, controlSignalName: string, equation: string) {
    //pruefe ob der gesuchte Knoten existiert
    let matchNode = state.automatonSubState.nodeSubState.logicInformation[nodeId]
    if (matchNode !== undefined) {
        //er existiert --> pruefe ob der zu setzende Ausgang existiert
        //ordne dem Konten seinen Automaten zu
        let automatonId = getAutomatonIdFromNodeID(state.automatonSubState, nodeId)
        if (automatonId !== undefined) {
            //sollte immer der Fall sein
            //extrahiere die Steuersignale des Automaten
            let controlSignals: Array<NameTupel> = Object.values(state.automatonSubState.automatonFrameWorks.controlSignalNameLists[automatonId].nameList)

            let controlSignalId = getSignalId(controlSignals, controlSignalName)
            if (controlSignalId !== undefined) {
                //Der zu setzende Ausgang existiert im Automaten
                //Suche den zu setzenden Ausgang innerhalb der Ausgaenge des Knotens
                let destNodeMatchIndex = getSignalPairIndexFromInternalNumber(matchNode.controlSignalAssignment, controlSignalId)

                //wenn der Ausgang bereits belegt war so nutze die aktuelle Ausgabe als Backup falls der neue Ausruck einen Fehler beinhaltet
                //ist undefined, falls noch keine Ausgabe existiert hat --> beim Erstellen der neuen Ausgabe wird die Standardbedingung verwendet
                let backupCondition = matchNode.controlSignalAssignment[destNodeMatchIndex]?.equationErrorTupel.validExpression


                //Erstelle den logischen Baum fuer den Ausdruck --> Steuersignalausgabe darf nicht von Steuersignalen abhangen aber keine z-Variablen beinhalten
                let customNames = CustomNameSelector(state)

                let controlSignalPair = ControlSignalPair.createControlSignalPair(controlSignalId, equation, customNames, backupCondition) //faengt alle eventuellen Fehler ab


                //Ist der Ausgang innerhalb des Knotens schon gesetzt? --> ersetzen der logischen Bedingung
                if (destNodeMatchIndex === -1) {
                    //die zu setzende Ausgangsletiable existiert und ist innerhalb des Knotens noch nicht gesetzt
                    // --> fuege sie mit dem logischen Ausdruck in die Liste des Knotens ein

                    //eventuelller Fehler wenn der zu setzende Ausdruck z-Variablen beinhaltet
                    matchNode.controlSignalAssignment.push(controlSignalPair)
                }
                else {
                    //der Ausgang war bereits gesetzt --> veraendere den logischen Ausdruck (setze eine neue Belegung um erneut auf das Enthaltensein von zVariablen zu preufen)
                    matchNode.controlSignalAssignment[destNodeMatchIndex] = controlSignalPair
                }

                //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
                resetToInitialStates(state.automatonSubState.automatonFrameWorks)
            }
            //in allen anderen Faellen existiert der zu setzende Ausgang nicht --> tue nichts
        }


    }
}

/**
 * Setzt eine Steuersignalausgabe innerhalb eines Zustandes, die aktuell belegt ist auf 0 zurueck (falls diese existiert)
 * @param nodeId Id es Knotens in dem die Ausgangsvariable zu 0 gesetzt werden soll
 * @param customName nutzerdefienierter Name der zurueckzusetzenden Ausgangsvariablen
 */
export function resetControlSignal(state: NormalizedEditorState, nodeId: number, customName: string) {
    //pruefe ob der gesuchte Knoten existiert
    let matchNode = state.automatonSubState.nodeSubState.logicInformation[nodeId]
    if (matchNode !== undefined) {
        //er existiert --> pruefe ob der rueckzusetzende setzende Steuersignalausgang existiert

        //ordne dem Konten seinen Automaten zu
        let automatonId = getAutomatonIdFromNodeID(state.automatonSubState, nodeId)
        if (automatonId !== undefined) {
            //sollte immer der Fall sein
            //extrahiere die Steuersignale des Automaten
            let controlSignals: Array<NameTupel> = Object.values(state.automatonSubState.automatonFrameWorks.controlSignalNameLists[automatonId].nameList)

            let controlSignalId = getSignalId(controlSignals, customName)
            if (controlSignalId !== undefined) {
                //Der zu setzende Ausgang existiert im System
                //Suche den zu setzenden Ausgang innerhalb der Ausgaenge des Knotens
                let destNodeMatchIndex = getSignalPairIndexFromInternalNumber(matchNode.controlSignalAssignment, controlSignalId)

                //loesche die Ausgabe
                matchNode.controlSignalAssignment.splice(destNodeMatchIndex, 1)

                //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
                resetToInitialStates(state.automatonSubState.automatonFrameWorks)
            }
        }
    }

}

/**
 * Setzt ein neus Operatorsymbol 
 * @param operatorTyp Welcher Operator soll veraendert werden?
 * @param newOperatorSymbol neues Symbol fuer den Operator
 */
export function changeCustomOperator(state: NormalizedEditorState, operatorTyp: OperatorEnum, newOperatorSymbol: string) {
    //pruefe ob das Symbol als Operator genutzt werdem kann --> wirft Exception wenn nicht
    let operators = state.operators;

    let error: undefined | DuplicateNameError | NameSyntaxError = undefined //Speicher fuer einen eventuell auftretenden Fehler (initial: kein Fehler --> undefined)
    try {
        //pruefe ob der Operator gueltig ist
        isValidOperatorSymbol(operators, newOperatorSymbol, operatorTyp)
    }
    catch (e) {
        //es ist ein Fehler aufgetreten --> speichere ihn
        if (e instanceof DuplicateNameError || e instanceof NameSyntaxError) { // alle moeglichen Fehler der Methode
            error = e //Fehler speichern
        }
    }

    //speicher das Ergebnis im State --> Falls ein Fehler aufgetreten ist wird der alte Operator beibehalten
    if (error !== undefined) {
        //Fehler aufgetreten --> alten Wert beibehalten (nur Fehler aendern)
        switch (operatorTyp) {
            case OperatorEnum.AndOperator:
                operators.customAndOperator.error = error
                break;
            case OperatorEnum.OrOperator:
                operators.customOrOperator.error = error;
                break;
            case OperatorEnum.NotOperator:
                operators.customNotOperator.error = error;
                break;
            case OperatorEnum.ExclusicOrOperator:
                operators.customExclusivOrOperator.error = error;
                break;
        }

    }
    else {
        //kein Fehler --> neues Symbol setzen (und Fehler ruecksetzen indem man den undefined Fehler speichert)
        let newEntry = { validName: newOperatorSymbol, error: error }
        switch (operatorTyp) {
            case OperatorEnum.AndOperator:
                operators.customAndOperator = newEntry;
                break;
            case OperatorEnum.OrOperator:
                operators.customOrOperator = newEntry;
                break;
            case OperatorEnum.NotOperator:
                operators.customNotOperator = newEntry;
                break;
            case OperatorEnum.ExclusicOrOperator:
                operators.customExclusivOrOperator = newEntry;
                break;
        }
    }
}


/**
 * Erstellt eine neue Transition (Uberschreibe die bestehende falls diese existiert)
 * @param automatonId Id des Automaten in dem die Kante liegt
 * @param fromNodeId StartknotenId 
 * @param toNodeId ZielknotenId
 * @param condition logische Uebergangsbedingung (1 bei Nichtangabe) --> darf keine z-Variablen enthalten
 */
export function addTransition(state: NormalizedEditorState, automatonId: number, fromNodeId: number, toNodeId: number, condition?: string) {
    //existiert der Zielautomat?
    let matchAutomatonTransitions = state.automatonSubState.automatonFrameWorks.transitionLists[automatonId]
    if (matchAutomatonTransitions) {
        //der Automat existiert

        //pruefe ob die beiden Knoten existieren (genau dann wenn ihre Positionen existieren)
        let fromNodePosition = state.automatonSubState.nodeSubState.nodePositions[fromNodeId]
        let toNodePosition = state.automatonSubState.nodeSubState.nodePositions[toNodeId]

        if ((fromNodePosition !== undefined) && (toNodePosition !== undefined)) {
            //Preufe ob die beiden Knoten dem gleichen Automaten zugeordnet sind (muss der aus der Action sein)
            let fromAutomatonID = getAutomatonIdFromNodeID(state.automatonSubState, fromNodeId)
            if (fromAutomatonID === getAutomatonIdFromNodeID(state.automatonSubState, toNodeId) && fromAutomatonID === automatonId) {

                //die Knoten existieren --> pruefe ob der Automat bereits eine Kante zwischen den beiden hat
                let existingTransitionId = getTransitonId(state.automatonSubState.transitionSubState, fromNodeId, toNodeId)

                let customNames = CustomNameSelector(state)
                let defaultExpression: ICompleteTreeRoot = { tree: new CompleteTreeConstantNode(ConstantType.ConstantOne) } //Standardmaessige Bedingung im Falle von Fehlern

                if (existingTransitionId === -1) {
                    //Die Kante existiert noch nicht
                    //ertelle die neue Kante
                    //berechne die id der Kante
                    let nextTransitionId = getNextUsableNumber(state.automatonSubState.transitionSubState.transitionIds)

                    //berechne den Verlauf der Kante
                    let bezier: Bezier = calculateTransitionBezier(fromNodePosition, toNodePosition)

                    // Fuege die erstellte Kante in die Kantenliste ein
                    state.automatonSubState.transitionSubState.transitionIds.push(nextTransitionId)
                    state.automatonSubState.transitionSubState.transitionNodeData[nextTransitionId] = { fromNodeId: fromNodeId, toNodeId: toNodeId, id: nextTransitionId }

                    state.automatonSubState.transitionSubState.logicInformation[nextTransitionId] = createRawTransitionNormalized(nextTransitionId, customNames, defaultExpression, automatonId, condition) //Faengt alle Fehler ab und speichert sie
                    state.automatonSubState.transitionSubState.transitionPositions[nextTransitionId] = { id: nextTransitionId, bezier: bezier }

                    //Fuege die Kante dem Automaten hinzu
                    matchAutomatonTransitions.transitionIds.push(nextTransitionId)


                }
                else {
                    //Die Kante existiert bereits, ihre Bedingung soll aber ueberschrieben werden
                    //Falls die neu eingegebene Bedingung ungueltig ist, so behalte die alte bei
                    //Faengt alle Fehler ab und speichert sie im Tupel
                    let currentTransition = state.automatonSubState.transitionSubState.logicInformation[existingTransitionId]
                    //Uebernimm die ID der bestehenden Kante (und deren Bedingung, wenn die neue ungueltig ist)
                    state.automatonSubState.transitionSubState.logicInformation[existingTransitionId] = createRawTransitionNormalized(currentTransition.id, customNames, currentTransition.condition.validExpression, automatonId, condition)

                }
                //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
                resetToInitialStates(state.automatonSubState.automatonFrameWorks)
            }

        }
    }

}
/**
 * Veraendert die logische Bedingung eines Kantenuebergangs (loescht die Kante falls eine leere Bedingung uebergeben wurde)
 * @param automatonId Id des Automaten in dem die Kante liegt
 * @param fromNodeId Startknoten der Kante
 * @param toNodeId Endknoten der Kante
 * @param newCondition neue logische Uebergangsbedingung (1 bei Nichtangabe)--> darf keine z-Variablen enthalten 
 */
export function changeTransitionCondition(state: NormalizedEditorState, fromNodeId: number, toNodeId: number, newCondition: string) {


    //Preufe ob die neue Bedingung leer ist (loesche die evtl. vorhandene Kante)
    //Eingabe eines leeren Strings (oder nur Leerzeichen) soll die Kante leoschen
    let emptyInput = false
    if ((newCondition.match("^\\s*$") !== null)) {
        emptyInput = true //leere Eingabe
    }

    //Suche zu welchem Automaten die Knoten gehoeren
    //beide Knoten muessen immer zum gleichen Automaten gehoeren
    let automatonId = getAutomatonIdFromNodeID(state.automatonSubState, fromNodeId)
    if (automatonId !== undefined) {
        //Der Automat zu den Knoten existiert
        //Existiert die Kante ?
        let transitionId = getTransitonId(state.automatonSubState.transitionSubState, fromNodeId, toNodeId) // Id der Kante

        if (transitionId > -1) {
            //die Kante existiert

            if (emptyInput) {
                //loesche die bestehende Kante (leere Eingabe)
                removeTransition(state.automatonSubState, transitionId)
            }
            else {
                //Es soll eine Kante veraendert werden

                let customNames = CustomNameSelector(state)
                //suche die aktuelle Bedingung der Kante die im Fehlerfall beibehalten werden soll
                let currentCondition = state.automatonSubState.transitionSubState.logicInformation[transitionId].condition.validExpression
                //setze die Bedingung der Kante --> faengt alle Fehler ab
                state.automatonSubState.transitionSubState.logicInformation[transitionId] = createRawTransitionNormalized(transitionId, customNames, currentCondition, automatonId, newCondition)

            }


        }
        else {
            //Die Kante existiert nicht --> fuege sie ggf. ein
            if (!emptyInput) {
                //Fuege die Kante ein, falls die Bedingung nicht leer war (falls sie leer war wird vom Nutzer mit loeschen gerechnet)
                addTransition(state, automatonId, fromNodeId, toNodeId, newCondition) //Fuegt die Kante nur ein wenn beide Knoten zum gleichen Automaten gehoeren
            }
        }

        //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
        resetToInitialStates(state.automatonSubState.automatonFrameWorks)
    }

}
/**
 * Veraendere den Angangspunkt einer Kante
 * @param transitionId Id der Kante
 * @param newPoint neuer Anfangspunkt (absolute Koordinaten)
 */
export function changeTransitionStart(state: AutomatonSubState, transitionId: number, newPoint: Point) {
    //existiert die Kante
    let matchTransitonPosition = state.transitionSubState.transitionPositions[transitionId]
    if (matchTransitonPosition !== undefined) {


        let toNodeId = state.transitionSubState.transitionNodeData[transitionId].toNodeId
        let fromNodeId = state.transitionSubState.transitionNodeData[transitionId].fromNodeId
        //greife den Knoten (bzw. seine Position)
        let toNodePosition = state.nodeSubState.nodePositions[toNodeId]
        let fromNodePosition = state.nodeSubState.nodePositions[fromNodeId]

        //Bedenke: Die Lage des Stuetzpunktes der Kante ist auf den aktuellen Abstand zwischen dem aktuellen Start- und Endpunkt der Kante normiert
        //      --> Damit der Stuetzpunkt trotz Veraenderung des Startpunktes an der gleichen Stelle bleibt muss seine Position zunaechst anhand der alten Lage der Ansatzpunkte
        //          entnormiert werden. Nach der Aenderung des Startpunktes der Kante wird er auf die neue Distanz normiert (bleibt dadurch an der gleichen Stelle)

        //Entnormiere die Position des Stuetzpunktes anhand des aktuellen Abstandes der absoluten Ansatzpunkte
        let absoluteStartPoint = createPoint(matchTransitonPosition.bezier.startPoint.xCord + fromNodePosition.position.xCord, matchTransitonPosition.bezier.startPoint.yCord + fromNodePosition.position.yCord)
        //absolute Position des Ansatzpunktes berechnen
        let absoluteEndPoint = createPoint(matchTransitonPosition.bezier.endPoint.xCord + toNodePosition.position.xCord, matchTransitonPosition.bezier.endPoint.yCord + toNodePosition.position.yCord)
        let distance = calculateDistance(absoluteStartPoint, absoluteEndPoint) // Abstand zwischen den aktuellen Ansatzpunkten
        //entnormierte Lage des Stuetzpunktes (relativ zum absoluten alten Startpunkt der nun geandert wird)
        let denormedSupport = createPoint(matchTransitonPosition.bezier.supportPoint.xCord * distance, matchTransitonPosition.bezier.supportPoint.yCord * distance)


        //berechne die relative Lage des neuen Startpunktes der Kante zur Position des Startknotens

        let relativPosition = calculateRelativTransitionPosition(fromNodePosition, newPoint)
        //speichere die neue Position
        matchTransitonPosition.bezier.startPoint = relativPosition


        //Passe die Normierung des Stuetzpunktes an die neue Lage an (normiere ihn auf die Distanz zwischen dem neuen Startpunkt und dem unveraenderten Endpunkt)
        let distanceAfterPositionChange = calculateDistance(absoluteEndPoint, newPoint) //Nur der Startpunkt wurde verschoben
        let newSupport = createPoint(denormedSupport.xCord / distanceAfterPositionChange, denormedSupport.yCord / distanceAfterPositionChange)
        matchTransitonPosition.bezier.supportPoint = newSupport //speichere seine Position

    }
}





/**
 * Veraendere den Endpunkt einer Kante
 * @param transitionId Id der Kante
 * @param newPoint neuer Endpunkt (absolute Lage)
 */
export function changeTransitionEnd(state: AutomatonSubState, transitionId: number, newPoint: Point) {
    //existiert die Kante
    let matchTransitonPosition = state.transitionSubState.transitionPositions[transitionId]
    if (matchTransitonPosition !== undefined) {
        let toNodeId = state.transitionSubState.transitionNodeData[transitionId].toNodeId
        let fromNodeId = state.transitionSubState.transitionNodeData[transitionId].fromNodeId
        //greife den Knoten (bzw. seine Position)
        let toNodePosition = state.nodeSubState.nodePositions[toNodeId]
        let fromNodePosition = state.nodeSubState.nodePositions[fromNodeId]


        //Bedenke: Die Lage des Stuetzpunktes der Kante ist auf den aktuellen Abstand zwischen dem aktuellen Start- und Endpunkt der Kante normiert
        //      --> Damit der Stuetzpunkt trotz Veraenderung des Endpunktes der Kante an der gleichen Stelle bleibt muss seine Position zunaechst anhand der alten Lage der Ansatzpunkte
        //          entnormiert werden. Nach der Aenderung des Endpunktes der Kante wird er auf die neue Distanz normiert (bleibt dadurch an der gleichen Stelle)

        //Entnormiere die Position des Stuetzpunktes anhand des aktuellen Abstandes der absoluten Ansatzpunkte (Vor der Aenderung)
        let absoluteEndPoint = createPoint(matchTransitonPosition.bezier.endPoint.xCord + toNodePosition.position.xCord, matchTransitonPosition.bezier.endPoint.yCord + toNodePosition.position.yCord) //absolute Position des Kantenendes 
        //absolute Position des Ansatzpunktes berechnen
        let absoluteStartPoint = createPoint(matchTransitonPosition.bezier.startPoint.xCord + fromNodePosition.position.xCord, matchTransitonPosition.bezier.startPoint.yCord + fromNodePosition.position.yCord)
        let distance = calculateDistance(absoluteStartPoint, absoluteEndPoint) // Abstand zwischen den aktuellen Ansatzpunkten
        //entnormierte Lage des Stuetzpunktes (relativ zum absoluten Startpunkt der Kante)
        let denormedSupport = createPoint(matchTransitonPosition.bezier.supportPoint.xCord * distance, matchTransitonPosition.bezier.supportPoint.yCord * distance)


        //berechne die relative Lage des neuen Endpunktes der Kante zur Position des Endknotens
        let relativPosition = calculateRelativTransitionPosition(toNodePosition, newPoint)
        //speichere die neue Position
        matchTransitonPosition.bezier.endPoint = relativPosition

    
        //Passe die Normierung des Stuetzpunktes an die neue Lage an (normiere ihn auf die Distanz zwischen dem neuen Endpunkt und dem unveraenderten Startpunkt)
        let distanceAfterPositionChange = calculateDistance(absoluteStartPoint, newPoint) //Nur der Endpunkt wurde verschoben
        let newSupport = createPoint(denormedSupport.xCord / distanceAfterPositionChange, denormedSupport.yCord / distanceAfterPositionChange)
        matchTransitonPosition.bezier.supportPoint = newSupport //Position speichern
    }
}

/**
 * Veraendere den Stuetzpunkt einer Kante
 * @param transitionId Id der Kante
 * @param newPoint neuer Stuetzpunkt (relativ zum absoluten Startpunkt der Kante)
 */
export function changeTransitionSupport(state: AutomatonSubState, transitionId: number, newPoint: Point) {
    //existiert die Kante
    let matchTransitonPosition = state.transitionSubState.transitionPositions[transitionId]
    if (matchTransitonPosition !== undefined) {

        //berechne die normierten Koordinaten des Stuetzpunktes --> Suche die Ansatzknoten

        let toNodeId = state.transitionSubState.transitionNodeData[transitionId].toNodeId
        let fromNodeId = state.transitionSubState.transitionNodeData[transitionId].fromNodeId

        //Positionen der Knoten
        let toNodePosition = state.nodeSubState.nodePositions[toNodeId]
        let fromNodePosition = state.nodeSubState.nodePositions[fromNodeId]


        //Knoten sollten immer existieren
        if ((fromNodePosition !== undefined) && (toNodePosition !== undefined)) {
            //normiere den Stuetpunkt (State-gerechte Darstellung der Position)
            let normalizedPosition = calculateRelativTransitionSupportPosition(fromNodePosition.position, toNodePosition.position,
                { relativStart: matchTransitonPosition.bezier.startPoint, relativEnd: matchTransitonPosition.bezier.endPoint }, newPoint)

            //speichere den Verlauf
            matchTransitonPosition.bezier.supportPoint = normalizedPosition;
        }
    }
}


/**
 * Setzt die Belegung eines Eingangs zu 1 
 * @param customInputName Name des zu setzenden Eingangs
 */
export function setGloablInput(state: InputSubState, customInputName: string) {
    //pruefe ob der Eingang existiert
    let inputs = Object.values(state.customNames)
    let matchId = getSignalId(inputs, customInputName)

    if (matchId !== undefined) {
        //setze die Belegung zu 1
        state.assignments[matchId].assignment = true;
    }
}

/**
 * Setzt die Belegung eines Eingangs zu 0 
 * @param customInputName Name des zu rueckzusetzenden Eingangs
 */
export function resetGloablInput(state: InputSubState, customInputName: string) {
    //pruefe ob der Eingang existiert
    let inputs = Object.values(state.customNames)
    let matchId = getSignalId(inputs, customInputName)

    if (matchId !== undefined) {
        //setze die Belegung zu 1
        state.assignments[matchId].assignment = false;
    }
}


/**
 * Setzte den neuen Startzustand (nicht Knoten) eines Automatens
 * @param automatonId Id des begtroffenen Automaten
 * @param newInitialStateNumber Nummer des neuen Initialzustandes
 */
export function setInitialState(state: AutomatonSubState, automatonId: number, newInitialStateNumber: number) {
    //existiert der gesuchte Automat
    let exists = state.automatonFrameWorks.automatonIDs.includes(automatonId)

    if (exists) {
        //der Automat existiert 

        //existiert der neu zu setztende Startzustand?
        //berechne den groesstmoeglich darstellbaren Zustand innerhalb der Knoten des Automaten
        let nodes = getRawNodesToAutomaton(state, automatonId)
        let maxStateNumber = getMaxRepresentableStateNumber(nodes)
        if (newInitialStateNumber <= maxStateNumber && newInitialStateNumber > -1) {
            // der Zustand existiert (wenn auch nur im Hardwareautomaten)
            //Initialzustand kann ein Zustand sein, der zwar im Hardwareautomaten existiert (ist mit den aktuellen z-Variablen darstellbar)
            //,aber keinen Knoten in der Gui besitzt
            state.automatonFrameWorks.uiAutomatonData[automatonId].initialStateNumber = { validNumber: newInitialStateNumber, error: undefined } //kein Fehler bei der Vergabe

            //aendert etwas am System (bezueglich der Logik) --> setze alle Zustaende aller Automaten auf deren Initialzustand
            resetToInitialStates(state.automatonFrameWorks)

        }
        else {
            //Fehler bei der Vergabe speichern und aktuellen Wert beibehalten
            state.automatonFrameWorks.uiAutomatonData[automatonId].initialStateNumber.error = new NumberError(newInitialStateNumber)

            //keine Aenderung an der logik-Strukur des Systems --> Zusatende muessen nicht zureuckgesetzt werden
        }
    }
}





/**
 * Wechseln der Ansicht
 * @param newView Ansicht zu der gewechselt werden soll
 */
export function changeView(state: NormalizedEditorState, newView: Viewstate) {
    state.viewState = newView
}


/**
 * Entferne alle Redundanten Klammern (alle die nicht zwingend fuer die korrekte Darstellung der Ausdruecke benoetigt werden) aus den vom Nutzer eingegebenen logischen Ausdrucken
 */
export function removeRedundantBracketsInExpressions(state: AutomatonSubState) {
    //erstelle eine Funktion die von einem Baum alle redundanten Klammern entfernt
    let removeRedundantBracketFromExpression = (expression: ICompleteTreeRoot): void => { CompleteTreeRoot.resetTreeBrackets(expression) }
    //wende sie auf alle Ausduecke im Baum an
    doForAllExpressionsInGraph(state, removeRedundantBracketFromExpression)
}


/**
 * Minimiere alle logischen Ausdruecke im Graphen (Kanten und Ausgaben)
 */
export function minimizeAllExpressionsInGraph(state: AutomatonSubState) {
    //erstelle eine Funktion die einen Baum minimiert
    let minimzeExpression = (expression: ICompleteTreeRoot): void => {expression.tree = minimizeLogicTree(expression.tree)}
    //wende sie auf alle Ausduecke im Baum an
    doForAllExpressionsInGraph(state, minimzeExpression)

}

/**
 * Berechne den Systemzustand fuer den naechsten Takt der Simulation
 */
export function computeNextClock(state: NormalizedEditorState) {

    //berechne fuer jeden Automaten den naechsten Zustand anhand der aktuellen Belgung des Systems --> nutze den Selektor
    let currentSystemAssignment = DerivedVariableAssignmentSelector(state)

    //berechne die z-Gleichungen aller Automaten --> nutze den Selektor
    //TODO: ggf. eigenen Selektor fuer nur z-Gleichungen (ohne alle anderen Gleichungen)
    let zEquationSets = InternEquationSetSelector(state)
    //laufe ueber alle Gleichungssets
    zEquationSets.forEach(currentSet => {
        let currentAutomatonId = currentSet.automatonId
        //werte sie fuer die aktuelle Belegung aus und berechne den Folgezustand (dieser ist eventuell nicht durch einen Konten im vom Nutzer erstellten Automaten vertreten,
        //      jedoch in jedem Fall im Hardwareautomaten als Zustand gegben)
        let nextState = calculateNextStateFromEquations(currentSet.zEquations, currentSystemAssignment)

        //Suche den Automaten der zu dem Set gehoert und setze seinen Zustand
        state.automatonSubState.automatonFrameWorks.currentStates[currentAutomatonId] = { id: currentAutomatonId, currentState: nextState }

    })
}

/**
 * Setze den Ausdruck fuer die globale Dont-Care-Belegung (h-Stern(x))
 * @param hStarExpression logischer Ausdruck der fuer h-Stern gesetzt werden soll (darf nur eine Funktion von x sein und damit weder z-Variablen noch Steuersignale enthalten
 */
export function setGlobalInputDontCare(state: NormalizedEditorState, hStarExpression: string) {
    //parse den Ausdruck zu einem Baum (beim Parsen werden keine zVariablen zugelassen/erkannt, da diese keinem Automaten zugeordnet werden koennen)
    //Fange eventuell auftretende Fehler beim parsen ab --> Im Fehlerfall: logisch 0 als BackupAusdruck verwenden (logisch 0 als hStern hat keinen Einfluss)
    let defaultExpression: ICompleteTreeRoot = { tree: new CompleteTreeConstantNode(ConstantType.ConstantZero) }
    //erweitere die moeglichen Fehlertypen im Ergbnis um den Fehler bzgl. hStern damit das Ergbnis direkt im State gespeichert werden kann
    let dontCareExpressionErrorTupel: ExpressionErrorTupel<HStarNotAFunctionOfxError | ExpressionSyntaxError | UnknownVariableInExpressionError | OutputVariableInExpressionError>
        = binaryStringToTreeErrorTupel(hStarExpression, defaultExpression, CustomNameSelector(state))

    //pruefe zur Sicherheit dass der Baum nur aus Eingaengsvariabeln beseteht (kein z-Variablen oder Setuersignale)
    if (CompleteTreeRoot.containsControlSignals(dontCareExpressionErrorTupel.validExpression) || CompleteTreeRoot.containsZVariables(dontCareExpressionErrorTupel.validExpression)) {
        //Fehler da h-Stern  nur eine Funktion von x --> suche alle nicht erlaubten Variablen in dem Ausdruck
        let customNames = CustomNameSelector(state)
        let invalidVariables: Array<VariableTypeTupel<VariableTyp.zSignal | VariableTyp.ControlSignal>> = [...getAllControlSignalNamesFromExpression(dontCareExpressionErrorTupel.validExpression, customNames), ...getAllzVariableNamesFromExpression(dontCareExpressionErrorTupel.validExpression)]
        //Speicher den Fehler im Ergebnis und setze den validen Ausdruck zu logisch 0 (backup von oben)
        dontCareExpressionErrorTupel.error = new HStarNotAFunctionOfxError(hStarExpression, invalidVariables)
        dontCareExpressionErrorTupel.validExpression = defaultExpression
    }
    //h-Stern ist Funktion von x --> speichere den Ausdruck
    state.globalInputDontCare = dontCareExpressionErrorTupel
}



/**
 * Veraendert die Lage / die Koordinaten des angesprochenen Zustandes in der angegebenen abgeleiteten Ansicht, falls dieser existiert und die Koordinaten zuleassig sind
 * "Anpinnen" des Zustandes an seine aktuelle Position (wird nicht mehr automatisch verschoben)
 * @param derivedView abgeleitete Ansicht in der der Zustand verschoben werden soll
 * @param automatonId Id des Automaten fuer den der Zustand in seinem abgeleiteten Automaten platziert werden soll
 * @param stateNumber Nummer des zu verschiebenden Zustands (entspricht der ID des Knotens innerhalb der abgeleiteten Automatendarstellungen)
 * @param newPoint neuer Punkt fuer den Zustand
 */
export function setDerivedViewStateCords(state: NormalizedEditorState, derivedView: DerivedAutomatonViews, automatonId: number, stateNumber: number, newPoint: Point) {

    //verschiebe einen Zustand innerhalb einer abgeleiteten Ansicht bzw. speichere diese Vorgabe fuer die Lage des Zustandes fuer die naechsten Darstellungen
    //"Anpinnen" der aktuellen Position damit diese nicht mehr automatisch verschoben wird

    //suche den angesprochenen Automaten
    let exists = state.automatonSubState.automatonFrameWorks.automatonIDs.includes(automatonId)
    if (exists === true) {
        //der gesuchte Automat existiert 


        //preufe ob der Zustand bereits eine nutzerdefinierte Position in der geforderten Ansicht beseitzt --> wenn ja ueberschreibe sie
        let statePositionList: Array<FixedPosition> //Liste der Positionsanforderungen fuer die Zustaende in der angegebenen Ansicht
        let transitionPositionList: Array<TransitionPosition>  //Liste der Positionsanforderungen an die Kanten in der angegebenen Ansicht

        //Die Api-Darstellung des abgeleiteten Automaten wird ggf. benotigt, da diese Informationen ueber die Lage aller Elemente (Kanten+Knoten) binhaltet
        //Nicht nur ueber die fest durch den Nutzer fixierten (innerhalb der Positionslisten im Automaten)
        let apiAutomatonStrucur: AutomatonStructure | undefined  //greife sie aus entsprechenden Selector

        //Welche Ansicht soll veraendert werden? 
        switch (derivedView) {
            case DerivedAutomatonViews.HardwareAutomaton: {
                //Aenderung am Hardwareautomaten
                statePositionList = state.automatonSubState.automatonFrameWorks.hardwareStatePositions[automatonId].nodePositions
                transitionPositionList = state.automatonSubState.automatonFrameWorks.hardwareTransitionPositions[automatonId].transitionPosition
                //suche den HW-Automaten an dem Aenderungen vorgenommen werden sollen


                let hwAutomatons = PlacedHardwareautomatonStructuresSelector(state)
                let matchApiAutomaton = hwAutomatons.find(currentAutomaton => currentAutomaton.id === automatonId)
                if (matchApiAutomaton !== undefined) {
                    apiAutomatonStrucur = cloneDeep(matchApiAutomaton)
                }
                break;
            }
            case DerivedAutomatonViews.MergedAutomaton: {

                //Aenderungen an den fusionierten Automaten
                statePositionList = state.automatonSubState.automatonFrameWorks.fusionStatePositions[automatonId].nodePositions
                transitionPositionList = state.automatonSubState.automatonFrameWorks.fusionTransitionPositions[automatonId].transitionPosition
                //suche den Fusions-Automaten an dem Aenderungen vorgenommen werden sollen
                let mergedAutomatons = PlacedMergedautomatonStructuresSelector(state)
                let matchApiAutomaton = mergedAutomatons.find(currentAutomaton => currentAutomaton.id === automatonId)
                if (matchApiAutomaton !== undefined) {
                    apiAutomatonStrucur = cloneDeep(matchApiAutomaton)
                }
                break;
            }
        }

        if (apiAutomatonStrucur === undefined) {
            //setze eine leere Vorlage 
            apiAutomatonStrucur = { id: automatonId, nodes: [], transitions: [] }
        }

        let placedNode: FixedPosition
        //in abgeleiteten Darstellungen ist die ID die Zustandsnummer
        let positionRequirementMatchIndex = getNodeIndex(statePositionList, stateNumber)
        if (positionRequirementMatchIndex > -1) {
            //der Zustand besitzt schon eine Position --> ueberschreibe sie (ist jetzt in jedem Fall permanent fixiert)
            placedNode = statePositionList[positionRequirementMatchIndex]
            placedNode.position = newPoint
            placedNode.tempFixed = false //permanent fixiert

        }
        else {
            //Der Zustand hatte noch keine vorgegebene Position --> fuege sie hinzu (ist permanent fixiert)
            //FIX
            //placedNode = {id:stateNumber , position:newPoint , isActive:false , radius:DEFAULT_NODE_RADIUS}
            placedNode = createFixedPosition(createNodePosition(stateNumber, newPoint), false)
            statePositionList.push(placedNode)
        }

        //Fixiere alle Zustaende der abgeleiteten Ansicht temporaer (werden trotzdem durch Verschiebung im Designautomaten beeinflusst da dann die temporaere Fixierung geloest wird) 
        // , wenn sie noch nicht fixiert waren
        // um zu verhindern, dass sie nach einer Verschiebung eines Knoten in der abgeleiteten Ansciht auch neu platziert werden
        apiAutomatonStrucur.nodes.forEach(currentState => {
            //Pruefe ob der Zustand bereits eine fixierte Position hat
            let matchPosition = statePositionList.find(state => state.id === currentState.id)
            if (matchPosition === undefined) {
                //Zustand war nocht nicht fixiert --> fixiere ihn
                let nodePosition = createNodePosition(currentState.id, currentState.position, currentState.radius, currentState.isActive)
                statePositionList.push(createFixedPosition(nodePosition, true)) //ist temporaer fixiert
            }
        })


        // //Veraendere noch die Lage des Knotens in den berechneten Positionen der abgeleiteten Ansicht um auf Basis davon die Kanten neu anzuordnen
        // let nodeToMove = apiAutomatonStrucur.nodes.find(currentApiNode => currentApiNode.id === stateNumber)
        // if(nodeToMove){
        //     //verschiebe ihn
        //     nodeToMove.position = newPoint
        // }

        //fixiere alle Kanten, die am verschobenen Zustand haengen, damit deren Verlauf durch die Verschiebung des Knotens nicht 
        // auf den kuerzesten Weg zurueckgesetzt wird, sondern unveraendert bleibt 
        //(Verschiebung eines Knotens soll nicht alle verbundenen Kanten auf ganz andere Verlaufe zuruecksetzen)
        //Es genuegt jeweils den Stuetzpunkt zu uebernehmen, da die Ansatzpunkte anschliessend anhand der Zustandsverschiebung neu platziert werden
        //laufe ueber alle Kanten der Api-Darstellung 
        let apiTransitions = apiAutomatonStrucur.transitions
        apiTransitions.forEach(currentApiTransition => {
            //preufe ob diese Kante am verschobenen Zustand haengt
            if (currentApiTransition.fromNodeId === stateNumber || currentApiTransition.toNodeId === stateNumber) {
                //die Kante heangt am verschobenen Zustand 

                //Pruefe ob sie bereits fixiert war --> wenn nein fixiere sie (wenn ja dann tue nichts)
                let matchPosition = transitionPositionList.find(transitionRequirement =>
                    ((transitionRequirement.fromNodeId === currentApiTransition.fromNodeId) && (transitionRequirement.toNodeId === currentApiTransition.toNodeId)))

                if (matchPosition === undefined) {
                    //Kante war noch nicht fixiert --> fixiere sie 
                    //Berechnung der relativen Punkte entfaellt, da nur der Stutzpunkt der Kante uerbernommen werden soll
                    //setze die relativen Ansatzpunkte zu 0 (werden durch die anschliessend Neuausrichtung der Kanten richtig ausgerichtet)
                    // let normalizedSupport: Point
                    // if (placedNode.id === currentApiTransition.fromNodeId) {
                    //     //der platzierte Knoten war der Anfangsknoten
                    //     normalizedSupport = calculateRelativTransitionSupportPosition(placedNode.position, currentApiTransition.bezier.endPoint, currentApiTransition.bezier.supportPoint)
                    // }
                    // else {
                    //     //platzierter Knoten war der Endknoten
                    //     normalizedSupport = calculateRelativTransitionSupportPosition(currentApiTransition.bezier.startPoint, placedNode.position, currentApiTransition.bezier.supportPoint)
                    // }


                    currentApiTransition.bezier.supportPoint = currentApiTransition.bezier.supportPoint
                    transitionPositionList.push(currentApiTransition)
                }
                //sonst: Kante war schon fixiert --> tue nichts
            }

        })


        //Anpassung aller eventuell druch die Zustandsverschiebung betroffenen Verlauefe von Kanten, die bereits durch den nutzer fixiert wurden
        //Kanten die nicht manuell fixiert wurden zeichnen sich immer richtig fuer die neue Position, da deren Verlauefe stets neu berechnet werden
        //nur manuell fixierte Kanten kommen in Frage (wurden diese manuell fixiert, so sind auch die Knoten die sie verbinden fixiert und damit in der Knotenliste ds HW-Automaten)
        treatTransitionCorruptionsAfterNodeCordChange(apiAutomatonStrucur.nodes, transitionPositionList, stateNumber, newPoint)

    }
    //Der Automat existiert nicht --> tue nichts

}

/**
 * Veraendert die Parameter einer Kante innerhalb einer abgeleiteten Ansicht
 * Wird der Verlauf einer Kante vorgegeben, so werden automatisch die aktuellen Lagen der Anfangs- und Endzustaende der Kante "angepinnt" (siehe z.B. {@link SetHardwareStateCords}) 
 * @param derivedView abgeleitete Ansicht in der der Zustand verschoben werden soll
 * @param automatonId Id des Automaten fuer den die Kante in seiner abgeleiteten Ansicht platziert werden soll
 * @param endPoint Endpunkt der Kante
 * @param startPoint Startpunkt der Kante
 * @param supportPoint Stuetzpunkt der Kante
 */
export function changeDerivedViewTransitionPoints(state: NormalizedEditorState, derivedView: DerivedAutomatonViews, automatonId: number, transitionId: number, endPoint: Point, startPoint: Point, supportPoint: Point) {
    //verschiebe eine Kante innerhalb einer abgeleiteten Ansicht bzw. speichere diese Vorgabe fuer die Lage der Kante fuer die naechsten Darstellungen


    //suche den angesprochenen Automaten
    let exists = state.automatonSubState.automatonFrameWorks.automatonIDs.includes(automatonId)
    if (exists) {
        //der gesuchte Automat existiert 

        let statePositionList: Array<NodePosition> //Liste der Positionsanforderungen fuer die Zustaende in der angegebenen Ansicht
        let transitionPositionList: Array<TransitionPosition>  //Liste der Positionsanforderungen an die Kanten in der angegebenen Ansicht
        let apiautomatonStructure: AutomatonStructure | undefined
        //Welche Ansicht soll veraendert werden? 
        switch (derivedView) {
            case DerivedAutomatonViews.HardwareAutomaton: {
                //Aenderung am Hardwareautomaten
                statePositionList = state.automatonSubState.automatonFrameWorks.hardwareStatePositions[automatonId].nodePositions
                transitionPositionList = state.automatonSubState.automatonFrameWorks.hardwareTransitionPositions[automatonId].transitionPosition
                //suche den HW-Automaten an dem Aenderungen vorgenommen werden sollen
                let hwAutomatons = PlacedHardwareautomatonStructuresSelector(state)
                apiautomatonStructure = hwAutomatons.find(currentAutomaton => currentAutomaton.id === automatonId)

                break;
            }
            case DerivedAutomatonViews.MergedAutomaton: {
                //Aenderungen an den fusionierten Automaten
                statePositionList = state.automatonSubState.automatonFrameWorks.fusionStatePositions[automatonId].nodePositions
                transitionPositionList = state.automatonSubState.automatonFrameWorks.fusionTransitionPositions[automatonId].transitionPosition
                //suche den Fusions-Automaten an dem Aenderungen vorgenommen werden sollen

                let fusionAutomatons = PlacedMergedautomatonStructuresSelector(state)
                apiautomatonStructure = fusionAutomatons.find(currentAutomaton => currentAutomaton.id === automatonId)

                break;
            }
        }


        if (apiautomatonStructure !== undefined) {

            //Suche den Anfangs- und Endknoten der Kante die bewegt werden soll
            let transitonToMove = apiautomatonStructure.transitions.find(transition => transition.id === transitionId)
            if (transitonToMove) {
                let fromNodeId = transitonToMove.fromNodeId
                let toNodeId = transitonToMove.toNodeId
                let fromNode = apiautomatonStructure.nodes.find(node => node.id === fromNodeId)
                let toNode = apiautomatonStructure.nodes.find(node => node.id === toNodeId)

                if ((fromNode !== undefined) && (toNode !== undefined)) {

                    //Erstelle einen neuen Bezierparametersatz anhand der bekannten Parameter
                    //berechne die relativen Positionen der Ansatzpunkte der Kante
                    let relativStartPosition = calculateRelativTransitionPosition(fromNode, startPoint)
                    let realtiveEndPosition = calculateRelativTransitionPosition(toNode, endPoint)
                    //Stuetzpunkt ist schon relativ angegeben --> normiere ihn
                    let normalizedSupportPosition = calculateRelativTransitionSupportPosition(fromNode.position, toNode.position,
                        { relativStart: relativStartPosition, relativEnd: realtiveEndPosition }, supportPoint)
                    let bezier = createBezier(relativStartPosition, realtiveEndPosition, normalizedSupportPosition)



                    //preufe ob die Kante bereits eine nutzerdefinierte Position beseitzt --> wenn ja ueberschreibe sie
                    let positionRequirementMatchIndex = transitionPositionList.findIndex(transition =>
                        ((transition.fromNodeId === fromNodeId) && (transition.toNodeId === toNodeId)))
                    if (positionRequirementMatchIndex > -1) {
                        //die Kante besitzt schon eine Position --> ueberschreibe sie anhand der in der Action gegebenen Parameter 
                        transitionPositionList[positionRequirementMatchIndex].bezier = bezier
                    }
                    else {
                        //Die Kante hatte noch keine vorgegebene Position --> fuege sie hinzu
                        let newEntry: TransitionPosition = { id: transitonToMove.id, fromNodeId: fromNodeId, toNodeId: toNodeId, bezier: bezier }
                        transitionPositionList.push(newEntry)
                    }
                }

            }

        }




    }
}


/**
 * Setze die Positionen aller Elemente (Knoten und Kanten) einer abgeleiteten Ansicht zurueck
 * Die abgeleitete Ansicht wird dadurch vollstaendig automatisch angeordnet (hierbei wird sich am zugehoerigen Desginautomaten orientiert)
 * @param automatonId Id des Automaten fuer den die abgeleitete Ansicht zurueckgestezt werden soll (bei Nichtangabe fuhre es fuer alle Automaten aus)
 * @param derivedView abgeleitete Ansicht, die neu angeordnet werden soll
 */
export function resetDerivedAutomatonPositions(state: AutomatonFrameWork, derivedView: DerivedAutomatonViews, automatonId?: number) {
    //loesche alle fixierten Positionen der geforderten Ansicht damit sich deren Elemente automatisch neu anordnen
    let nodePositions: StorageObject<DerivedViewNodePositions> //Knotenpositionen der abgeleiteten Ansicht
    let transitionPositions: StorageObject<DerivedViewTransitionPositions> //Kantenpositionen der abgeleiteten Ansicht 
    switch (derivedView) {
        case DerivedAutomatonViews.HardwareAutomaton: {
            nodePositions = state.hardwareStatePositions
            transitionPositions = state.hardwareTransitionPositions
            break;
        }
        case DerivedAutomatonViews.MergedAutomaton: {
            nodePositions = state.fusionStatePositions
            transitionPositions = state.fusionTransitionPositions
            break;
        }
    }
    //loesche die geforderten Positionen
    if (automatonId !== undefined) {
        //Es wurde eine AutomatenId angegeben --> nur die Positionen des angegebenen Automaten loeschen (falls dieser Automat existiert)
        let matchAutomatonNodePositions = nodePositions[automatonId]
        if (matchAutomatonNodePositions !== undefined) { matchAutomatonNodePositions.nodePositions = [] } //Positionen zuruecksetzen
        let matchAutomatonTransitionPositions = transitionPositions[automatonId]
        if (matchAutomatonTransitionPositions !== undefined) { matchAutomatonTransitionPositions.transitionPosition = [] }//Positionen zuruecksetzen
    }
    else {
        //keine Id angegeben --> alle Positionen aller Automaten zureucksetzen
        state.automatonIDs.forEach(currenId => {
            //loesche alle Positionsangaben zu diesem Automaten
            nodePositions[currenId].nodePositions = []
            transitionPositions[currenId].transitionPosition = []
        })
    }

    //Action aendert nichts an der Struktur der Automaten --> Automaten muessen nicht in Initialzustand zuruekcgesetzt werden
}

/** Setze alle Automaten in ihren Initialzustand zurueck */
export function resetToInitialStates(state: AutomatonFrameWork) {
    //laufe uber alle Automaten und setze sie in ihren Initialzustand
    state.automatonIDs.forEach(currentAutomatonId => {
        //greife seinen Initialzustand 
        let initialState = state.uiAutomatonData[currentAutomatonId].initialStateNumber
        //setze sie als aktuellen Zustand
        state.currentStates[currentAutomatonId].currentState = initialState.validNumber
    })
}

/**
 * Loesche einen Eintrag in der Transitionsmatrix (loesche eine Kante)
 * @param fromNodeId StartknotenId 
 * @param toNodeId ZielknotenId
 */
export function removeTransitionMatrixEntry(state: AutomatonSubState, fromNodeId: number, toNodeId: number) {
    //Pruefe ob es in diesem Automaten eine Kante zwischen den beiden Knoten gibt
    let matchTransitionId = getTransitonId(state.transitionSubState, fromNodeId, toNodeId)
    if (matchTransitionId > -1) {
        //Kante existiert --> loesche sie
        removeTransition(state, matchTransitionId)
        resetToInitialStates(state.automatonFrameWorks)
    }
}
