import { cloneDeep } from "lodash";
import { getTransitionsFromNode } from "../../actioncreator/helperfunctions";
import { ApiAutomaton } from "../ApiClasses/GraphRepresentation/Automaton";
import { Automaton, AutomatonStructure, RawAutomatonStructure } from "../Automaton";
import { ControlSignal } from "../ControlSignal";
import { ControlSignalPair } from "../ControlSignalPair";
import { CompletenessInfo, ContradictionInfo, Node, RawNode } from "../Node";
import { OperatorEnum } from "../Operators";
import { OutputSignalPair } from "../OutputSignalPair";
import { Signalpair } from "../Signalpair";
import { RawTransition, Transition } from "../Transition";
import { DerivedAutomatonViews } from "../view";
import { AutomatonViewConfig, MergedAutomatonViewConfig } from "../NormalizedState/ViewConfig";
import { placeStatesAndTransitions } from "./computeHardwareAutomaton";
import { CustomNames } from "./CustomNames";
import { CompleteTreeOneOperandOperatorNode, CompleteTreeTwoOperandOperatorNode } from "./LogicTrees/Operators";
import { BaseCompleteTreeNode, ConstantType } from "./LogicTrees/TreeNodeInterfaces";
import { CompleteTreeRoot, ICompleteTreeRoot } from "./LogicTrees/TreeRoots";
import { CompleteTreeConstantNode } from "./LogicTrees/Variables";
import { minimizeLogicTree } from "./Minimizer/minimizeTree";


/**
 * Berechne die Struktur der fusionierten Automaten
 * Fuehre hierfuer alle Knoten des gleichen Zustands zu einem zusammen und passe den Verlauf der Kanten dementsprechend an 
 * @param automatonStructures Struktur der umzuwandelnden Automaten
 * @returns Struktur des fusionierten Automaten (innerhalb der Knote- und Kantenliste sind ID und Zustandsnummer jeweils identisch, jeder Zustand ist nur einem Knoten zugeordnet)
 */
export function computeMergedAutomatonStructures(automatonStructures: Array<RawAutomatonStructure>): Array<RawAutomatonStructure> {
    //berechne den Fusionsautomaten fuer jeden Automaten
    // console.log("berechne merged Automaten neu");

    let mergedStructures: Array<RawAutomatonStructure> = [] //Ergebnisliste
    automatonStructures.forEach(currentStrucutre => {
        //berechne den fuisonierten Automaten
        let mergedAutomaton = computeMergedAutomatonStructure(currentStrucutre)
        //berechne alle weiteren geforderten Eigenschaften der Ansicht
        let result = computeMergedAutomatonCharacteristics(mergedAutomaton)
        //speichere den Automaten
        mergedStructures.push(result)
    })

    return mergedStructures
   

}


/**
 * Berechne die Struktur des fusionierten Automaten
 * Fuehre hierfuer alle Knoten des gleichen Zustands zu einem zusammen und passe den Verlauf der Kanten dementsprechend an 
 * @param automatonStructure Struktur des umzuwandelnden Automaten
 * @returns Struktur des fusionierten Automaten (innerhalb der Knote- und Kantenliste sind ID und Zustandsnummer jeweils identisch, jeder Zustand ist nur einem Knoten zugeordnet)
 */
function computeMergedAutomatonStructure(automatonStructure: RawAutomatonStructure): RawAutomatonStructure {

    let mergedAutomatonStructure: RawAutomatonStructure = { id: automatonStructure.id, nodes: [], transitions: [] }//Speicher fuer das Ergebnis anlegen
    let nodes = automatonStructure.nodes //Greife die Knoten
    let transitions = automatonStructure.transitions //Greife die Kanten
    let automatonId = automatonStructure.id
    //Erstelle die Liste fuer die fusionierten Knoten (in dieser existiert nur noch ein Knoten pro existentem Zustand und die KnotenID und ZustandsID sind identisch)
    let mergedNodes: Array<RawNode> = []


    //Laufe ueber alle Knoten des gegebenen Automaten und fasse gleiche Zustaende zu einem Knoten zusammen
    for (let nodeCounter = 0; nodeCounter < nodes.length; nodeCounter++) {
        let currentNode = nodes[nodeCounter] //Greife den aktuellen Knoten der zusammengefasst werden soll

        //Pruefe ob der Zustand des aktuellen Knotens bereits einen Eintrag in der Liste der fusionierten Knoten hat
        // --> Wenn nein muss ein neuer Knoten fuer diesen Zustand in die Liste der fusionierten Knoten eingefuegt werden
        let fusionNodeIndex = mergedNodes.findIndex(mergedNode => mergedNode.customStateNumber.validNumber === currentNode.customStateNumber.validNumber)
        if (fusionNodeIndex < 0) {
            //es existiert noch kein Knoten fuer diesen Zustand --> fuege eine Kopie ein damit der Originalknoten im Weiteren nicht veraendert wird
            let currentNodeCopie = cloneDeep(currentNode)
            currentNodeCopie.id = currentNodeCopie.customStateNumber.validNumber //Gleichsetzen der Id und des Zustandes 
            //(erzeugt keine Probleme, da in der Liste der fusionierten Knoten jeder Zustand und damit jede ID nur ein mal vorkommen darf)

            //entferne die Fehler aller Ausgaben des Knotens (abgeleitete Ansichten sollen die letzen Fehler der Originalansicht nicht kennen)
            currentNodeCopie.controlSignalAssignment.forEach(assignment => assignment.equationErrorTupel.error = undefined)
            currentNodeCopie.outputAssignment.forEach(assignment => assignment.equationErrorTupel.error = undefined)
            mergedNodes.push(currentNodeCopie)
        }
        else {
            //es existiert bereits ein fusionierter Knoten fuer diesen Zustand 
            // --> fusioniere den aktuellen Knoten in den bereits bestehenden (uebernimm seine Ausgaben und verkette sie mit ODER an den fusionierten Knoten)

            let fusionNode = mergedNodes[fusionNodeIndex] //greife den Knoten mit dem fusioniert werden soll

            // fusionNode.isActive = fusionNode.isActive || currentNode.isActive //fusionierter Knoten ist aktiv sobald einer der in die Fuison eingegangen Knoten aktiv war

            //fusioniere die Ausgaben beider Knoten: Falls eine Ausgabe bereits innerhalb des zusammengefuehrten Knotens existiert, so erweitere sie mit ODER
            //Falls nicht, so fuege sie hinzu
            //laufe ueber alle Ausgaben des aktuellen Knotens
            currentNode.controlSignalAssignment.forEach(currentAssignment => {
                //pruefe ob bereits eine Ausgabe fuer diese Variable im Fuisonsknoten existiert 
                //Hierbei kann den Steuersignalen ein Platzhalterautomatenname zugewiesen werden solange der gleiche fuer alle verwendet wird, da alle Steuersignalausgaben
                // des betrachteten Automaten sich auf seine Steuersignale beziehen
                let assignmentToMergeWith = fusionNode.controlSignalAssignment.find(assignment =>
                    ControlSignalPair.getVariable(assignment,automatonId).matchesToInternalRepresentation(ControlSignalPair.getVariable(currentAssignment,automatonId)))

                if (assignmentToMergeWith) {
                    // Es existiert bereits eine Ausgabe fuer diese Variable --> erweitere die logische Bedingung mit oder um die Ausgabe des aktuellen Knotens
                    let newEquation = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.OrOperator, assignmentToMergeWith.equationErrorTupel.validExpression.tree, currentAssignment.equationErrorTupel.validExpression.tree)
                    //Speichere die erweiterte Ausgabe im Fusionsknoten
                    assignmentToMergeWith.equationErrorTupel.validExpression = {tree:newEquation} 
                }
                else {
                    //Fuer diese Variable existiert noch keine Ausgabe --> Fuege sie in die Ausgaben des Fusionsknotens hinzu
                    fusionNode.controlSignalAssignment.push(currentAssignment)
                }
            })

            //Analoges Vorgehen fuer alle Ausgaben y_i
            //laufe ueber alle Ausgaben des aktuellen Knotens
            currentNode.outputAssignment.forEach(currentAssignment => {
                //pruefe ob bereits eine Ausgabe fuer diese Variable im Fuisonsknoten existiert 
                let assignmentToMergeWith = fusionNode.outputAssignment.find(assignment =>OutputSignalPair.getVariable(assignment).matchesToInternalRepresentation(OutputSignalPair.getVariable(currentAssignment)))

                if (assignmentToMergeWith) {
                    // Es existiert bereits eine Ausgabe fuer diese Variable --> erweitere die logische Bedingung mit oder um die Ausgabe des aktuellen Knotens
                    let newEquation = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.OrOperator, assignmentToMergeWith.equationErrorTupel.validExpression.tree, currentAssignment.equationErrorTupel.validExpression.tree)
                    //Speichere die erweiterte Ausgabe im Fusionsknoten
                    assignmentToMergeWith.equationErrorTupel.validExpression = {tree:newEquation}
                }
                else {
                    //Fuer diese Variable existiert noch keine Ausgabe --> Fuege sie in die Ausgaben des Fusionsknotens hinzu
                    fusionNode.outputAssignment.push(currentAssignment)
                }
            })

        }
        //Der aktuelle Knoten wurde fertig in die Fusion mitaufgenommen
    }
    mergedAutomatonStructure.nodes = mergedNodes //Speichere die fusionierten Knoten im Ergebnis 

    //Anschliessend muessen alle Kanten in die neue Struktur uebernommen werden (Kanten mit gleichen End- und Anfangszustaenden fusionieren --> Bedingungen mit ODER verknuepfen)
    let mergedTransitions: Array<RawTransition> = []
    //Laufe ueber alle Kanten
    transitions.forEach(transition => {
        //Bisher: Kanten speichern ID des Anfangs- und Endknoten
        //In Fusionierter Darstellung sind ID und Zustandsnummer identisch --> Bestimme fuer alle Kanten die Zustandsnummer ihrers Anfangs- und Endknotens, welche als IDs der fusionierten Knoten vorliegen

        //Finde fuer jede Kante deren Anfangs- und Endknoten in der Liste der originalen Knoten --> greife seine Zustandsnummer
        let fromNode = nodes.find(node => node.id === transition.fromNodeId) // sollte immer existieren, da fuer jede Kante auch beide Knoten in der Liste existieren sollten
        let toNode = nodes.find(node => node.id === transition.toNodeId) // sollte immer existieren, da fuer jede Kante auch beide Knoten in der Liste existieren sollten
        if (fromNode && toNode) {
            //Zustandsnummern der Knoten in der Originalliste sind die IDs der Knoten in der fusionierten Liste
            let fromStateNumber = fromNode.customStateNumber
            let toStateNumber = toNode.customStateNumber
            //beide Eintraege sollten immer Existieren sofern die Knoten- und Kantenliste valide waren
            //Fuege die Kante in die Liste der fusioniereten Kanten hinzu
            //Pruefe dafuer ob bereits eine Kante zwischen den beiden Zustaenden existiert --> Wenn ja, dann verknuepfe die Bedinungen mit ODER , Wenn nein fuege die aktuelle Kante der Liste hinzu
            let transitionToMergeWith = mergedTransitions.find(mergedTransition => mergedTransition.fromNodeId === fromStateNumber.validNumber && mergedTransition.toNodeId === toStateNumber.validNumber)
            if (transitionToMergeWith) {
                //Es existiert bereits eine Kante zwischen den beiden Zustaenden --> erweitere die Bedingung mit ODER
                let newCondition = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.OrOperator, transitionToMergeWith.condition.validExpression.tree, transition.condition.validExpression.tree)
                transitionToMergeWith.condition.validExpression = ({tree:newCondition}) //setzen der fusionierten Bedingung

            }
            else {
                //Es existiert noch keine Kante zwischen den Zustaenden --> Erstelle sie (Erstlle eine Kopie der aktuellen Kante)
                let transitionCopie = cloneDeep(transition)
                transitionCopie.fromNodeId = fromStateNumber.validNumber //ID und Zustand der Knoten in der fusionierten Liste sind gleich
                transitionCopie.toNodeId = toStateNumber.validNumber //ID und Zustand der Knoten in der fusionierten Liste sind gleich
                transitionCopie.condition.error = undefined //Abgleitete Ansichten sind fehlerfrei, da die Designautomaten fehlerfrei gehalten werden

                mergedTransitions.push(transitionCopie) //speichern der neuen Kante

            }

        }
        // Die aktuelle Kante wurde fertig bearbeitet
    })

    //Speichere die fusionierten Kanten im Ergebnis 
    mergedAutomatonStructure.transitions = mergedTransitions

    //Ausgabe der Struktur des fusionierten Automaten

    return mergedAutomatonStructure

}

/**
 * Berechne alle weiteren Eigenschaften der Fuisonierten Automaten (Vollstaendigkeit und Widerspruchsfreiheit)
 * @param mergedAutomaton Automat fuer den die Eigenschaften berechnet werden sollen
 */
function computeMergedAutomatonCharacteristics(mergedAutomaton: RawAutomatonStructure): RawAutomatonStructure {

    //berechne die gesuchten Eigenschaften fuer jeden Knoten
    mergedAutomaton.nodes.forEach(currentNode => {
        //Pruefe auf Vollstaendigkeit 
        //preufe ob der Knoten vollstaendig ist
        currentNode.completenessInfo = isCompleteState(currentNode.id, mergedAutomaton.transitions)

        //Pruefe auf Widerspruchsfreiheit
        //preufe ob der Knoten widerspruchsfrei ist
        currentNode.contradictionInfo = isStateFreeOfContradictions(currentNode.id, mergedAutomaton.transitions)
    })

    return mergedAutomaton

}



/**
 * Berechne ob ein Zustand vollstaendig ist (alle ausgehenden Kanten ergeben mit oder verknuepft logisch 1)
 * @param nodeId Id des zu preufenden Knotens (muss aus einer Darstellung stammen in der das Konzept von Knoten und Zustaende aequivlaent ist)
 * @param transitions Liste aller Kanten (muss aus einer Darstellung stammen in der das Konzept von Knoten und Zustaende aequivlaent ist)
 * @returns ist der zu pruefende Knoten/ Zustand vollstaendig (und eventuelle Unvollstaendigkeit)?
 *      Bei Vollstaendigkeit ist der Ausdruck der Unvollstaendigkeit logisch 0
 */
function isCompleteState(nodeId: number, transitions: Array<RawTransition>):CompletenessInfo {
    //Bilde die Oderverknuepfung aller ausgehenden Kanten (Id des Anfangsknotens der Kante entspricht der gegebenen Id)
    let outgoingTransitions = transitions.filter(transition => transition.fromNodeId === nodeId) //ausgehende Kanten
    let isComplete: boolean

    //all deren Bedingungen mit oder verknuepfen (inital logisch 0 --> aendert nichts am Werteverlauf bei der Oderverknuepfung)
    let concatenatedCondition: BaseCompleteTreeNode = new CompleteTreeConstantNode(ConstantType.ConstantZero)
    outgoingTransitions.forEach(currentTransition => {
        //aktuelle Bedingung mit oder anhaengen
        concatenatedCondition = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.OrOperator, concatenatedCondition, currentTransition.condition.validExpression.tree)
    })
    //Pruefe ob die Verkettung minimiert logisch 1 ist 
    concatenatedCondition = minimizeLogicTree(concatenatedCondition)
    // console.log(concatenatedCondition.toInternalString());

    if (concatenatedCondition instanceof CompleteTreeConstantNode && concatenatedCondition.getType() === ConstantType.ConstantOne) {
        //Zustand ist vollstaendig
        isComplete = true
    }
    else { isComplete = false }
    //in jedem Falle die unvollstaendigkeit abspeichern: diese wird durch die Negation des verketteten Ausdrucks gewonnen  (Im Falle der Vollstaendigkeit ist der Ausdruck logisch 0)
    //minimiere den Ausdruck

    let incompleteness: ICompleteTreeRoot = CompleteTreeRoot.minimize({tree: new CompleteTreeOneOperandOperatorNode(OperatorEnum.NotOperator , concatenatedCondition)})

    return {isComplete:isComplete , incompleteness: incompleteness}
}

/**
 * Berechne ob ein Zustand widerspruchsfrei ist (die Oderverknuepfung aller paarweise Undverknuepften Kanten ergibt logisch 0)
 * @param nodeId Id des zu preufenden Knotens (muss aus einer Darstellung stammen in der das Konzept von Knoten und Zustaende aequivlaent ist)
 * @param transitions Liste aller Kanten (muss aus einer Darstellung stammen in der das Konzept von Knoten und Zustaende aequivlaent ist)
 * @returns ist der zu pruefende Knoten/ Zustand widerspruchsfrei (und eventueller Widerspruch)?
 *      Bei Widerspruchsfreiheit ist der Ausdruck des Widerspruchs logisch 0
 */
function isStateFreeOfContradictions(nodeId: number, transitions: Array<RawTransition>):ContradictionInfo {
    //Bestimme alle ausgehenden Kanten (Id des Anfangsknotens der Kante entspricht der gegebenen Id)
    let outgoingTransitions = transitions.filter(transition => transition.fromNodeId === nodeId) //ausgehende Kanten
    let isFreeOfContradictions: boolean

    //Oderverknuepfung aller Paare (inital: logisch 0 da dies nichts am Weerteverlauf der Oderverknuepfung aendert)
    let concatenatedCondition: BaseCompleteTreeNode = new CompleteTreeConstantNode(ConstantType.ConstantZero)

    //Bilde alle Paare (es genuegt von jeder Kombination von 2 Kanten eine Permutation zu bilden, es sind keine Tupel fuer Kanten mit sich selbst noetig)
    // fuer zwei Kanten genuegt es also das Paar (Kante1 , Kante2) zu bilden (nicht  (Kante1 , Kante2) und (Kante2 , Kante1) als zwei verschiedene Paare)

    //laufe ueber alle ausgehenden Kanten (diese werden jeweils der erste Eintrag der Kantentupel)
    for (let firstTransitionIndex = 0; firstTransitionIndex < outgoingTransitions.length; firstTransitionIndex++) {
        let firstTransition = outgoingTransitions[firstTransitionIndex] //aktueller erster Eintrag des Tupels
        //Laufe ueber alle Kanten, die als zweiter Eintrag des Tupels in Frage kommen 
        // (sind nur die, die in der Kantenliste hinter der in der Aussenschleife betrachteten Kante liegen) --> bildet jeweils nur eine Permutation
        for (let secondTransitionIndex = firstTransitionIndex + 1; secondTransitionIndex < outgoingTransitions.length; secondTransitionIndex++) {
            let secondTransition = outgoingTransitions[secondTransitionIndex] //aktueller zweiter Eintrag des Tupels

            //Verknuepe die Bedingungen des Kantentupels mit UND
            let tupelCondition = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.AndOperator, firstTransition.condition.validExpression.tree, secondTransition.condition.validExpression.tree)

            //Haenge die paarweise Verknuepfung mit ODER an den zu preufenden Ausdruck an
            concatenatedCondition = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.OrOperator, concatenatedCondition, tupelCondition)
        }
    }

    //Pruefe ob die Verkettung minimiert logisch 0 ist 
    concatenatedCondition = minimizeLogicTree(concatenatedCondition)
    if (concatenatedCondition instanceof CompleteTreeConstantNode && concatenatedCondition.getType() === ConstantType.ConstantZero) {
        //Zustand ist widerspruchsfrei
        isFreeOfContradictions = true
    }
    else { isFreeOfContradictions = false }
    //in jedem Falle den Widerspruchsausdruck absepichern (Widerspruch ist der Ausdruck der aus der Minimierung der obigen paarweisen Oder-Verknuepfung der ausgehenden Kanten hervorgeht)

    return {isFreeOfContradictions:isFreeOfContradictions , contradiction:{tree:concatenatedCondition}}
}

