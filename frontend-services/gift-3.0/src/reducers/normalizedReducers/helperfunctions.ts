import { current } from "@reduxjs/toolkit";
import { plainToInstance } from "class-transformer";
import 'reflect-metadata';
import 'es6-shim';
import { cond, omit } from "lodash";
import { isUsableAutomatonName, getNextUsableNumber, calculateDistance } from "../../actioncreator/helperfunctions";
import { Automaton, UiAutomatonData } from "../../types/Automaton";
import { CustomNames } from "../../types/BooleanEquations/CustomNames";
import { CompleteTreeOneOperandOperatorNode, CompleteTreeTwoOperandOperatorNode } from "../../types/BooleanEquations/LogicTrees/Operators";
import { ICompleteTreeRoot } from "../../types/BooleanEquations/LogicTrees/TreeRoots";
import { CompleteTreeConstantNode, CompleteTreeInputNode, CompleteTreeControlSignalNode, CompleteTreeZVariableNode } from "../../types/BooleanEquations/LogicTrees/Variables";
import { NameErrorTupel } from "../../types/ErrorElements";
import { createNodePosition, createRawNode, DEFAULT_NODE_RADIUS, NodePosition, RawNode } from "../../types/Node";
import { AutomatonFrameWork, AutomatonSubState, NodeSubState, TransitionSubState } from "../../types/NormalizedState/AutomatonSubState";
import { NormalizedEditorState } from "../../types/NormalizedState/NormalizedEditorState";
import { createPoint, Point } from "../../types/Points";
import { RawTransition, TransitionPosition } from "../../types/Transition";
import { BaseCompleteTreeNode } from "../../types/BooleanEquations/LogicTrees/TreeNodeInterfaces";



/**
 * Entferne eine Kante aus der Liste aller Kante 
 * !! eventelle Verweise innerhalb der Kantenlisten der Automaten werden nicht entfernt !!
 * @param id Id der Kante die entfernt werden soll
 * @param state State aus dem die Kante entfernt werden soll
 * @returns wurde die Kante gefunden und somit entfernt?
 */
export function removeTransitionFromTransitionList(state: TransitionSubState, id: number): boolean {
    let wasRemoved = false //wurde die Kante gefunden und damit entfernt?
    //entferne die id der Kante aus der Liste der IDs --> nur wenn sie gefunden wurde muss weitergemacht werden
    if (removeIdFromIdList(state.transitionIds, id)) {
        //entferne alle Informationen zu der Kante
        state.transitionNodeData = omit(state.transitionNodeData, id)
        state.transitionPositions = omit(state.transitionPositions, id)
        state.logicInformation = omit(state.logicInformation, id)
        wasRemoved = true
    }
    return wasRemoved

}



export function castJSONtoType(iRoot: BaseCompleteTreeNode): BaseCompleteTreeNode{
        if((<any>iRoot).stringRepresentation!=undefined){
            let d = plainToInstance(CompleteTreeConstantNode, iRoot)
            return d
        }
        else if((<any>iRoot).variable!=undefined && (<any>iRoot).variable.automatonId===undefined){
            let d = plainToInstance(CompleteTreeInputNode, iRoot)
            return d
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if((<any>iRoot).variable!=undefined && (<any>iRoot).controlSignalIndicator === true){
            let d = plainToInstance(CompleteTreeControlSignalNode, iRoot)
            return d
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if((<any>iRoot).variable!=undefined && (<any>iRoot).controlSignalIndicator === false){
            let d = plainToInstance(CompleteTreeZVariableNode, iRoot)
            return d
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if(((<any>iRoot).child!=undefined)){
            let d: CompleteTreeOneOperandOperatorNode = new CompleteTreeOneOperandOperatorNode((<any>iRoot).type, castJSONtoType((<any>iRoot).child), iRoot.bracketCounter)
            return d
        }
        else if(((<any>iRoot).leftChild!=undefined)){
            let d: CompleteTreeTwoOperandOperatorNode = new CompleteTreeTwoOperandOperatorNode((<any>iRoot).type, castJSONtoType((<any>iRoot).leftChild), castJSONtoType((<any>iRoot).rightChild), iRoot.bracketCounter)
            return d
        }
        else{
            return iRoot
        }
}



























/**
 * Entferne einen Knoten aus der Liste aller Knoten
 * !! eventuelle Kanten zu/von diesem Knoten werden nicht entfernt , Der Knoten muss noch aus der Knotenliste der Automaten entfernt werden!!
 * @param id Id des Knotens der entfernt werden soll
 * @param state State aus dem der Knoten entfernt werden soll
 * @returns wurde der Knoten gefunden und somit entfernt? 
 */
export function removeNodeFromNodeList(state: NodeSubState, id: number): boolean {
    let wasRemoved = false //wurde die Kante gefunden und damit entfernt?
    //entferne die id der Kante aus der Liste der IDs --> nur wenn sie gefunden wurde muss weitergemacht werden
    if (removeIdFromIdList(state.nodeIds, id)) {
        //entferne alle Informationen zu der Kante
        state.logicInformation = omit(state.logicInformation, id)
        state.nodePositions = omit(state.nodePositions, id)
        state.names = omit(state.names, id)
        wasRemoved = true
    }
    return wasRemoved
}

/**
 * Entferne eine Id aus einer Liste von IDs
 * @param idList Liste der IDs aus der die Id entfernt werden soll
 * @param idToRemove zu entferndende ID
 * @returns wurde die Id gefunden und somit entfernt?
 */
export function removeIdFromIdList(idList: Array<number>, idToRemove: number): boolean {
    let wasRemoved = false //wurde die Id gefunden und entfernt?
    //existiert die Id in der Liste ?
    let matchIndex = idList.findIndex(id => id === idToRemove)
    if (matchIndex > -1) {
        //entferne die Id
        idList.splice(matchIndex, 1)
        wasRemoved = true
    }
    return wasRemoved
}


/**
 * Erstelle einen neuen Knoten innerhalb der globalen Knotenliste
 * @param state State
 * @param customStateNumber Zustandsnummer des Knotens 
 * @param position Position des Knotens
 * @param name Name des Knotens
 * @returns Id des erstellten Knotens
 */
export function addNodeToNodeList(state: NodeSubState, customStateNumber: number, position: Point, name: string): number {

    //Fuege einen Knoten in die globale Liste aller Knoten hinzu 
    let newNodeID = getNextUsableNumber(state.nodeIds) //naechste freie Id eines Knotens
    state.nodeIds.push(newNodeID) //speicher den Knoten in der Liste aller Knoten
    //speichere die Positon und die Logikinformationen fuer den neu erstellten Knoten
    state.logicInformation[newNodeID] = createRawNode(newNodeID, {validNumber: customStateNumber , error:undefined}) //initial:leere Ausgabe und kein Fehler bei der Nummernvergabe
    // FIX
   // state.nodePositions[newNodeID] = {id:newNodeID , position:position , radius:DEFAULT_NODE_RADIUS , isActive:false}
    state.nodePositions[newNodeID] = createNodePosition(newNodeID, position)

    let nameTupel:NameErrorTupel = {validName:name , error: undefined} //keine Fehler beim Namen moeglich
    state.names[newNodeID] = { id: newNodeID, customName: nameTupel }

    return newNodeID
}

/**
 * Extrahiere die logik-Informationen aller Knoten eines Automaten
 * @param state State aus dem extrahiert werden soll
 * @param automatonId Id des Automaten zu dem die Knoten gesucht sind
 * @returns Liste der Knoten des Automaten in Form ihrer Logikdarstellung
 */
export function getRawNodesToAutomaton(state: AutomatonSubState, automatonId: number): Array<RawNode> {
    //extrahiere alle Knoten des Automaten
    let nodeList: Array<RawNode> = []
    //fuege alle Knoten des Automaten hinzu
    state.automatonFrameWorks.nodeLists[automatonId].nodeIds.forEach(currentNodeId => {
        //fuege den aktuellen Knoten in die Liste ein
        nodeList.push(state.nodeSubState.logicInformation[currentNodeId])
    })
    return nodeList
}

/**
 * Extrahiere die Positions-Informationen aller Knoten eines Automaten
 * @param state State aus dem extrahiert werden soll
 * @param automatonId Id des Automaten zu dem die Knoten gesucht sind
 * @returns Liste der Knoten des Automaten in Form ihrer Positionsdarstellung
 */
export function getNodePositionsToAutomaton(state: AutomatonSubState, automatonId: number): Array<NodePosition> {
    //extrahiere alle Knoten des Automaten
    let nodeList: Array<NodePosition> = []
    //fuege alle Knoten des Automaten hinzu
    state.automatonFrameWorks.nodeLists[automatonId].nodeIds.forEach(currentNodeId => {
        //fuege den aktuellen Knoten in die Liste ein
        nodeList.push(state.nodeSubState.nodePositions[currentNodeId])
    })
    return nodeList
}

/**
 * Extrahiere die logik-Informationen aller Kanten eines Automaten
 * @param state State aus dem extrahiert werden soll
 * @param automatonId Id des Automaten zu dem die Kanten gesucht sind
 * @returns Liste der Kanten des Automaten in Form ihrer Logikdarstellung
 */
export function getRawTransitionsToAutomaton(state: AutomatonSubState, automatonId: number): Array<RawTransition> {
    //extrahiere alle Kanten des Automaten
    let transitionList: Array<RawTransition> = []
    //fuege alle Kanten des Automaten hinzu
    state.automatonFrameWorks.transitionLists[automatonId].transitionIds.forEach(currentTransitionId => {
        //fuege den aktuellen Knoten in die Liste ein
        let fromNodeId = state.transitionSubState.transitionNodeData[currentTransitionId].fromNodeId
        let toNodeId = state.transitionSubState.transitionNodeData[currentTransitionId].toNodeId
        let condition = state.transitionSubState.logicInformation[currentTransitionId].condition
        transitionList.push({ id: currentTransitionId, condition: condition, toNodeId: toNodeId, fromNodeId: fromNodeId })
    })
    return transitionList
}

/**
 * Extrahiere die Positions-Informationen aller Kanten eines Automaten
 * @param state State aus dem extrahiert werden soll
 * @param automatonId Id des Automaten zu dem die Kanten gesucht sind
 * @returns Liste der Kanten des Automaten in Form ihrer Positionsdarstellung
 */
export function getTransitionPositionsToAutomaton(state: AutomatonSubState, automatonId: number): Array<TransitionPosition> {
    //extrahiere alle Kanten des Automaten
    let transitionList: Array<TransitionPosition> = []
    //fuege alle Knoten des Automaten hinzu
    state.automatonFrameWorks.transitionLists[automatonId].transitionIds.forEach(currentTransitionId => {
        //fuege den aktuellen Kanten in die Liste ein
        //Suche den Anfangs- und Endknoten der Kante, sowie deren Verlauf
        let fromNodeId = state.transitionSubState.transitionNodeData[currentTransitionId].fromNodeId
        let toNodeId = state.transitionSubState.transitionNodeData[currentTransitionId].toNodeId
        let bezier = state.transitionSubState.transitionPositions[currentTransitionId].bezier
        //Speichere die Kante
        transitionList.push({ id: currentTransitionId, fromNodeId: fromNodeId, toNodeId: toNodeId, bezier: bezier })
    })
    return transitionList
}


/**
 * Suche den Automaten zu dem ein Knoten gehoert (sollte nur zu einem gehoeren wenn Datenhaltung korrkt)
 *  Falls der Knoten zu mehreren Auotmaten zugeordnet ist (Datenhaltungsfehler) so wird der erste Automat asugegeben
 * @param state State aus dem extrahiert werden soll
 * @param nodeId Id des Knotens dessen Automat gesucht wird
 * @returns Id des Automaten zu dem der Knoten gehoert (undefined wenn er zu keinem Automaten gehoert)
 */
export function getAutomatonIdFromNodeID(state: AutomatonSubState, nodeId: number): number | undefined {
    let matchAutomatonId //Id des Automaten zu dem der Knoten gehoert
    for (let automatonCounter = 0; automatonCounter < state.automatonFrameWorks.automatonIDs.length; automatonCounter++) {
        //loesche die Knotenid aus der Knotenliste des aktuellen Automaten (falls sie darin enthalten ist)
        let currentNodeList = state.automatonFrameWorks.nodeLists[automatonCounter].nodeIds
        if (currentNodeList.includes(nodeId)) {
            matchAutomatonId = automatonCounter
            break; //Knoten sollte nur zu einem Automaten gehoeren
        }
    }

    return matchAutomatonId
}

/**
 * Suche die KantenId der Kante zwischen zwei Knoten (-1 falls diese nicht existiert)
 * @param state State aus dem extrahiert werden soll
 * @param fromNodeId Id des Anfangsknotens
 * @param toNodeId Id des Endknotens
 * @returns Id der Kante zwischen den Knoten (-1 falls diese nicht existiert)
 */
export function getTransitonId(state: TransitionSubState, fromNodeId: number, toNodeId: number): number {
    let matchId = -1 //Id der gesuchten Kante
    //Laufe ueber alle Kanten

    for (let transitionCounter = 0; transitionCounter < state.transitionIds.length; transitionCounter++) {
        //greife die aktuelle KantenId
        let currentTransitionId = state.transitionIds[transitionCounter]
        //pruefe ob die Kante bereits den Verlauf hat der erstellt werden soll
        let matchTransitonNodes = state.transitionNodeData[currentTransitionId]
        if (matchTransitonNodes.fromNodeId === fromNodeId && matchTransitonNodes.toNodeId === toNodeId) {
            // alreadyExists = true //Die Kante existiert schon
            matchId = currentTransitionId //Id der bereits existierenden Kante meken
            break;
        }
    }

    return matchId
}



/**
 * Berechne eine moegliche Lage eines Knotens, der der aktuellen Liste an Knoten hinzugefuegt werden soll
 * Hierbei wird versucht den Knoten so nah wie moeglich an den Schwerpunkt des Graphen zu platzieren und gleichzeitig 
 * einen gewisser Abstand zu allen bereits existierenden Knoten zu halten
 * @param nodePositions Positionen aller aktuell existierenden Knoten
 * @returns Position fuer den Knoten der neu eingefuegt werden soll
 */
export function optimalNodePlacement(nodePositions: Array<NodePosition>): Point {
    let resultPosition: Point | undefined = undefined//Ergebnisposition
    //Versuche den neuen Knoten nah an den Schwerpunkt des Graphen zu platzieren
    let centreOfMass = calculateGraphCentreOfMass(nodePositions) //Schwerpunkt --> neuen Knoten moeglichst nah daran platzieren




    //Pruefe ob sich innerhalb eines gewissen "Schutzradius" zu diesem Punkt kein anderer Knoten befindet --> Wenn der Bereich frei, dann Knoten dort platieren
    let minimumSpacingRadius = 6 * DEFAULT_NODE_RADIUS //Radius fuer den Bereich um den neu zu plazierenden Knoten, in dem sich kein anderer Knoten befinden darf

    if (!isOtherNodeCloseToPosition(nodePositions, centreOfMass, minimumSpacingRadius)) {
        //Der Schwerpunkt ist bereits ein verfuegbarer Platz --> platziere den Knoten dort
        resultPosition = centreOfMass
    }
    else {
        //Der Schwerpunkt eignet sich nicht --> Pruefe itterativ allle Positionen auf immer groesser werdenden Kreisboegen um den Schwerpunkt
        let stepCounter = 1 // Wie oft wurde der Radius des zu testenden Kreisbogens schon erhoeht ?
        //laufe ueber immer groesser werdende Kreisboegen (pro Durchalauf fixen Radius addieren) solange kein Ergebnis gesetzt wurde und pruefe mehrere Punkte auf dem Kreisbogen
        let numberOfCircleSegments = 36 //Anzahl an Punkten die auf jedem Kreisbogen getestet werden sollen (ein Punkt alle 360/x Grad)
        let segmentAngle = (360 / numberOfCircleSegments) / 180 * Math.PI //Winkel eines Segments im Bogenmass

        while (resultPosition === undefined) {
            let currentRadius = stepCounter * minimumSpacingRadius //Radius des aktuell zu pruefenden Kreises

            //laufe ueber alle Segmente des Kreisbogens die getestet werden sollen 
            for (let segmentCounter = 0; segmentCounter < numberOfCircleSegments; segmentCounter++) {
                //berechne den zu testenden Punkt in diesem  Segment des Kreises
                let currentAngle = segmentAngle * segmentCounter //Winkel fuer das Segment in dem der Punkt gestestet werden soll
                let positionToTest: Point = createPoint(centreOfMass.xCord + currentRadius * Math.cos(currentAngle), centreOfMass.yCord + currentRadius * Math.sin(currentAngle))
                //preufe ob die Position frei ist (wenn ja setze sie als Ergebnis , wenn nicht pruefe alle weiteren Segmente auf diesem Radius)
                if (!isOtherNodeCloseToPosition(nodePositions, positionToTest, minimumSpacingRadius)) {
                    //Platz ist frei --> setze ihn als Ergebnis
                    resultPosition = positionToTest
                    break
                }
            }

            stepCounter++ //im naechsten Schritt groesseren Kreis testen
        }
    }

    return resultPosition
}



/**
 * Berechne den "Schwerpunkt des Graphen" 
 * @param nodePositions Positionen aller aktuell existierenden Knoten
 * @returns Position des "Schwerpunktes des Graphen"
 */
export function calculateGraphCentreOfMass(nodePositions: Array<NodePosition>): Point {
    //Berechne den Schwerpunkt: Addiere die Koordinaten aller Punkte auf und Teile durch die Anzahl an Punkten
    let centreOfMass: Point //Ergebnis
    if (nodePositions.length === 0) {
        centreOfMass = {xCord:200, yCord:200}
    }
    else {
        //Summe der Koorinaten
        let sumXCord = 0
        let sumYCord = 0
        //Aufaddieren
        nodePositions.forEach(currentPosition => {

            sumXCord = sumXCord + currentPosition.position.xCord
            sumYCord = sumYCord + currentPosition.position.yCord
        })
        //Durch die Anzahl der Knoten teilen
        let nodeCount = nodePositions.length
        centreOfMass = createPoint(sumXCord / nodeCount, sumYCord / nodeCount)

    }



    return centreOfMass
}



/**
 * Pruefe ob sich im Kreis mit dem Radius "minimumSpacingRadius" um die Position  "positionToTest" kein anderer Knoten aus einer Liste von Knoten befindet
 * @param nodePositions Positionen aller Knoten fuer die gepreuft werden soll ob sie in dem Kreis liegen
 * @param positionToTest Punkt fuer den gepreuft werden soll ob das umliegende Gebiet frei ist
 * @param minimumSpacingRadius Radius des Kreises um den zu testenden Punkt in dem keine anderen Knoten liegen duerfen
 * @returns befindet sich ein Knoten der uebergebenen Liste im Kreis mit dem uebergebenen Radius um den uebergebenen Punkt?
 */
function isOtherNodeCloseToPosition(nodePositions: Array<NodePosition>, positionToTest: Point, minimumSpacingRadius: number): boolean {
    let nodeInTestCircle = false //befindet sich ein Knoten der uebergebenen Liste im Kreis mit dem uebergebenen Radius um den uebergebenen Punk
    //laufe uber alle Knoten und pruefe ob sie zu nah liegen
    for (let nodeCounter = 0; nodeCounter < nodePositions.length; nodeCounter++) {
        let currentPosition = nodePositions[nodeCounter].position //aktuell zu testende Position
        //Berechne die Distanz zur zu testenden Position
        let distance = calculateDistance(positionToTest, currentPosition)

        //Pruefe ob der Knoten im Kreis liegt
        if (distance < minimumSpacingRadius) {
            //Ja liegt er --> Ausgabe von true (weitere Knoten muessen nicht gepreuft werden, da die Anzahl der Knoten in Kreis egal ist)
            nodeInTestCircle = true
            break
        }
    }
    return nodeInTestCircle

}


/**
 * Entferne alle temporaern Positionsvorgaben von Knoten aller abgeleiteten Ansichten eines Automaten
 * @param automatonFrameWork State in dem die Operation ausgefuehrt werden soll
 * @param automatonId Id des Automaten fuer den die Angaben entfernt werden sollen (falls kein Automat mit dieser ID existiert passiert nichts)
 */
export function resetTemporaryDerivedStatePositions(automatonFrameWork: AutomatonFrameWork, automatonId: number): void {
    //Positionsvoragben des zugehoerigen HW-Automaten
    if (automatonFrameWork.hardwareStatePositions[automatonId] !== undefined){
        automatonFrameWork.hardwareStatePositions[automatonId].nodePositions = automatonFrameWork.hardwareStatePositions[automatonId].nodePositions.filter(statePosition => !statePosition.tempFixed) //loesche alle temporaer fixierten Positionen
    }
     
    //Positionsvoragben des zugehoerigen Fusions-Automaten
    if (automatonFrameWork.fusionStatePositions[automatonId] !== undefined) {
        automatonFrameWork.fusionStatePositions[automatonId].nodePositions = automatonFrameWork.fusionStatePositions[automatonId].nodePositions.filter(statePosition => !statePosition.tempFixed) //loesche alle temporaer fixierten Positionen
    }

}