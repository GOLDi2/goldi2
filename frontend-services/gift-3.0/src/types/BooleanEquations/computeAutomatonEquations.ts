import { eq } from 'lodash';
import { calculateNeededVariables, getMaxCustomStateNumber, getNodeIndex, isBitNeededforEncoding, mergeTwoLists, stateNumberToLogicTree } from '../../actioncreator/helperfunctions';
import { Automaton, AutomatonStructure, RawAutomatonStructure } from '../Automaton';
import { ControlSignal, ExternalIndependentControlSignal, InternalIndependentControlSignal } from '../ControlSignal';
import { OperatorEnum } from '../Operators';
import { ExternalOutput, InternalOutput } from '../Output';
import { ZVariable } from '../ZVariable';
import { AutomatonEquationSet } from './EquationSet';
import { CSEquation, OutputEquation, ZEquation } from './Equations';
import { ICompleteTreeRoot } from './LogicTrees/TreeRoots';
import { CompleteTreeTwoOperandOperatorNode } from './LogicTrees/Operators';
import { BaseCompleteTreeNode, ConstantType } from './LogicTrees/TreeNodeInterfaces';
import { CompleteTreeConstantNode } from './LogicTrees/Variables';
import { OutputSignalPair } from '../OutputSignalPair';
import { ControlSignalPair } from '../ControlSignalPair';


/**
 * Lies die Gleichungssets aller Automaten innerhalb einer Automatenliste aus 
 * @param automatonList Liste der auszulesenden Automaten
 * @param outputs Liste an Ausgaengen fuer die in jedem Fall eine Gleichung ausgelesen werden soll (auch wenn sie im Automaten nicht verwendet werden und somit = 0 sind)
 *                  Bei Nichtangabe werden nur zu den in den jeweiligen Automaten vorkommenden Ausgaengen die Gleichungen ausgelesen
 * @param outputs Liste an Steuersignalen fuer die in jedem Fall eine Gleichung ausgelesen werden soll 
 *                Zu jedem hier enthaltenen Signal wird auch eine Gleichung mit ... = 0 ausgelesen, falls das Signal in seinem Automaten nicht verwendet wurde
 *                  Bei Nichtangabe werden nur zu den in den jeweiligen Automaten vorkommenden Steuersignalen die Gleichungen ausgelesen
 * @returns Liste mit der Gleichungsbeschreibung aller Automaten (es werden nur Gleichungen fuer die im jeweiligen Automaten verwendeten Variablen ausgelesen)
 */
export function computeEquationSets(automatonList: Array<RawAutomatonStructure>, outputs: Array<InternalOutput> = [], controlSignals: Array<InternalIndependentControlSignal> = []): Array<AutomatonEquationSet> {
    // console.log("berechne Gleichungen neu")

    //erstelle Liste fuer alle Gleichungssets
    let equationSetList: Array<AutomatonEquationSet> = [];

    //Laufe ueber alle Automaten und lies deren Gleichungen aus
    for (let automatonCounter = 0; automatonCounter < automatonList.length; automatonCounter++) {
        let currentAutomaton = automatonList[automatonCounter]
        equationSetList.push(computeEquationSet(currentAutomaton, outputs, controlSignals))
    }
    return equationSetList
}



/**
 * Lies alle Gleichungen aus einem Automaten aus (z- , Ausgabe- und Steuersignalausgabegleichungen)
 * @param automaton Auszulesneder Automat
 * @param outputs Liste an Ausgaengen fuer die in jedem Fall eine Gleichung ausgelesen werden soll (auch wenn sie in diesem Automaten nicht verwendet werden und somit = 0 sind)
 *                  Bei Nichtangabe werden nur zu den in diesem Automaten vorkommenden Ausgaengen die Gleichungen ausgelesen
 * @param outputs Liste an Steuersignalen fuer die in jedem Fall eine Gleichung ausgelesen werden soll 
 *                Zu jedem hier enthaltenen Signal wird auch eine Gleichung mit ... = 0 ausgelesen, falls das Signal zu diesem Automaten gehoert aber in ihm nicht verwendet wurde
 *                  Bei Nichtangabe werden nur zu den in diesem Automaten vorkommenden Steuersignalen die Gleichungen ausgelesen
 * @returns Set aller Gleichungen zur Beschreibung dieses Automaten (es werden nur Gleichungen fuer die in diesem Automaten verwendeten Variablen ausgelesen)
 */
export function computeEquationSet(automatonStructure: RawAutomatonStructure, outputs: Array<InternalOutput> = [], controlSignals: Array<InternalIndependentControlSignal> = []): AutomatonEquationSet {
    let zEquationSet = computeZEquations(automatonStructure)
    let outputEquationSet = computeOutPutEquations(automatonStructure)

    //Alle Variablen fuer die es keine Gleichung gab wurden in diesem Automaten nicht verwendet und sind damit = 0 --> fuelle falls geforder auf
    outputs.forEach(currentOutput => {
        //pruefe ob schon eine Gleichung existiert
        let matchEquation = outputEquationSet.find(equation => equation.getVariable().matchesToInternalRepresentation(currentOutput))
        if (matchEquation === undefined) {
            //Es existiert keine Gleichung --> erstelle eine Ausgabe = 0 Gleichung
            let zeroEquation = new OutputEquation(currentOutput, { tree: new CompleteTreeConstantNode(ConstantType.ConstantZero) })
            outputEquationSet.push(zeroEquation)
        }
    })


    //Steuersignalgleichungen auslesen
    let controlSignalEquationSet = computeControlSignaleEquations(automatonStructure)

    //Alle Steuervariablen fuer die es keine Gleichung gab wurden in diesem Automaten nicht verwendet und sind damit = 0 --> fuelle falls geforder auf
    //Filtere nach allen Steuersignalen dieses Automaten
    let matchControlSignals = controlSignals.filter(currentSignal => currentSignal.getAutomatonId() === automatonStructure.id)
    matchControlSignals.forEach(currentControlSignal => {
        //pruefe ob schon eine Gleichung existiert
        let matchEquation = controlSignalEquationSet.find(equation => equation.getVariable().matchesToInternalRepresentation(currentControlSignal))
        if (matchEquation === undefined) {
            //Es existiert keine Gleichung --> erstelle eine Ausgabe = 0 Gleichung
            let zeroEquation = new CSEquation(currentControlSignal, { tree: new CompleteTreeConstantNode(ConstantType.ConstantZero) })
            controlSignalEquationSet.push(zeroEquation)
        }
    })

    return new AutomatonEquationSet(automatonStructure.id, zEquationSet, outputEquationSet, controlSignalEquationSet)
}



/**
 * Lies die z-Gleichungen aus einer Automatenstruktur aus 
 * @param automaton auszuwertender Automaten
 * @returns Liste aller z-Gleichungen, die den Automaten beschreiben
 */
export function computeZEquations(automatonStructure: RawAutomatonStructure): Array<ZEquation> {
    // Erstelle liste fuer alle ausgelesenen Gleichungen 
    let equationList: Array<ZEquation> = [];
    //Speichere die Transitionen
    let transitions = automatonStructure.transitions;
    //Berechne die Anzahl benoetiger z-Variablen/Gleichungen fuer den Automaten Anhand der groessten Zustandsnummer (nicht Knotennummer)
    let equationCount = calculateNeededVariables(getMaxCustomStateNumber(automatonStructure.nodes))

    //berechne fuer jede z-Variable ihre gleichung 
    for (let equationNumber = 0; equationNumber < equationCount; equationNumber++) {
        //erstelle die aktuell betroffene z-Variabel
        let currentZVariable = new ZVariable(automatonStructure.id, equationNumber)
        //initial ist die rechte Seite der z-Gleichung logisch Null
        let rightExp: BaseCompleteTreeNode = new CompleteTreeConstantNode(ConstantType.ConstantZero);
        // Laufe ueber alle Kanten und pruefe, ob diese zu einem Knoten geht, fuer dessen Koodierung die aktuelle z-Variable der gleichung gesetzt (=1)seien muss
        for (let transitionCounter = 0; transitionCounter < transitions.length; transitionCounter++) {
            //Merke die aktuelle Transition
            let currentTransition = transitions[transitionCounter];
            //bestimme den Endknoten der Kante
            let endNodeIndex = automatonStructure.nodes.findIndex(node => node.id === currentTransition.toNodeId)
            //bestimme den Anfangsknoten der Kante
            let startNodeIndex = automatonStructure.nodes.findIndex(node => node.id === currentTransition.fromNodeId)
            if (endNodeIndex > -1 && startNodeIndex > -1) {
                //der Zielknoten und Startknoten existiert --> greife sie heraus
                let endNode = automatonStructure.nodes[endNodeIndex];
                let startNode = automatonStructure.nodes[startNodeIndex]
                //pruefe ob die aktuelle z-VAriable fuer die Koodierung des Endzustandes der Kante gesetzt seien muss --> wenn ja muss die Kante in die aktuelle z-Gleichung
                if (isBitNeededforEncoding(endNode.customStateNumber.validNumber, equationNumber)) {
                    //erstelle Ausdruck fuer den Ursprungsknoten der Kante 
                    let fromStateExpression = stateNumberToLogicTree(automatonStructure.id, startNode.customStateNumber.validNumber, equationCount)
                    //greife den Ausdruck fuer die Uebergangsbedingung der Kante
                    let condition = currentTransition.condition.validExpression.tree;

                    //erstelle neuen Teil der z-Glecihung durch UND Verknuepfung beider Terme (nutze den speziellstmoeglichen Operatortypen)
                    let expressionPart = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.AndOperator, fromStateExpression, condition)

                    //erweitere die z-Glechung um den neuen Term
                    //Wenn noch die initiale Logisch Null noch vorleigt, so ersetze sie (in einem anderen Fall kann der Oberste Knoten nie eine Konstante sein, 
                    //da er sonst immer ein &Operator wäre)
                    if (rightExp instanceof CompleteTreeConstantNode) {
                        rightExp = expressionPart;
                    }
                    else {
                        //Anhaengen des neuen Teilausdrucks (nutze den speziellstmoeglichen Operatortypen)
                        // TODO: ggf.logisch 1 nicht anhaengen
                        rightExp = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.OrOperator, rightExp, expressionPart)
                    }
                }
            }
        }
        //speichere die fertige z-GLeichung 
        equationList.push(new ZEquation(currentZVariable, { tree: rightExp }))
    }
    return equationList
}


/**
 * Lies die Ausgabegleichungen aller y_i eines Automaten aus
 * @param automatonStructure Struktur des auszulesenden Automaten
 * @returns Liste aller Ausgaenge y_i die im Automaten verwendet wurden mit deren Ausgabelgleichung
 */
function computeOutPutEquations(automatonStructure: RawAutomatonStructure): Array<OutputEquation> {
    //Liste fuer alle Gleichungen
    let equationList: Array<OutputEquation> = [];

    //Sammle alle Ausgaben, die in diesem Automaten verwendet/gesetzt werden
    let outputList: Array<InternalOutput> = []
    //Laufe ueber alle Knote
    automatonStructure.nodes.forEach(currentNode => {
        //Laufe ueber alle Ausgaben des Knotens
        currentNode.outputAssignment.forEach(currentOutput => {
            //Haenge diese Ausgabe an die Liste aller Ausgaben des Automaten an (ohne Duplikate)
            outputList = mergeTwoLists(outputList, [OutputSignalPair.getVariable(currentOutput)])
        })
    })


    //Laufe ueber alle Ausgaenge und erstelle ihre Gleichung 
    for (let equationCounter = 0; equationCounter < outputList.length; equationCounter++) {
        //greife aktuellen Ausgang als linke Seite der Gleichung
        let currentEquationOutput = outputList[equationCounter]
        //initial ist die rechte Seite der Gleichung logisch Null
        let rightExp: BaseCompleteTreeNode = new CompleteTreeConstantNode(ConstantType.ConstantZero);

        //berechne mit wie vielen z-Variablen die Knoten koodiert werden muessen
        let zVariableCount = calculateNeededVariables(getMaxCustomStateNumber(automatonStructure.nodes))


        //Laufe ueber alle Knoten und pruefe deren Ausgabe
        for (let nodeCounter = 0; nodeCounter < automatonStructure.nodes.length; nodeCounter++) {
            let currentNode = automatonStructure.nodes[nodeCounter]
            //greife Ausgaben des aktuellen Knoten
            let currentNodeOutput = automatonStructure.nodes[nodeCounter].outputAssignment

            //laufe ueber alle Ausgaben des Knotens
            for (let outputCounter = 0; outputCounter < currentNodeOutput.length; outputCounter++) {
                // greife den aktuellen Ausgang
                let currentOutput = currentNodeOutput[outputCounter]

                //beschreibt er die Belegung der Ausgangsvariablen der aktuellen Gleichung --> wenn ja in Gleichung aufnehmen
                if (currentEquationOutput.matchesToInternalRepresentation(OutputSignalPair.getVariable(currentOutput))) {
                    //Ausgabebedingung in Glecihung aufnehmen

                    //erstelle Ausdruck fuer den aktuellen Knoten in z-Variblen 
                    let stateExpression = stateNumberToLogicTree(automatonStructure.id, currentNode.customStateNumber.validNumber, zVariableCount)
                    //greife den Ausdruck fuer die Ausgabebedingung
                    let condition = currentOutput.equationErrorTupel.validExpression.tree;

                    //erstelle neuen Teil der Glecihung durch UND Verknuepfung beider Terme (nutze den speziellstmoeglichen Operatortypen)
                    let expressionPart = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.AndOperator, stateExpression, condition)

                    //Erweitere die Ausgabegleichung um den neuen Term
                    //Wenn noch die initiale Logisch Null noch vorleigt, so ersetze sie (in einem anderen Fall kann der Oberste Knoten nie eine Konstante sein, 
                    //da er sonst immer ein &Operator wäre)
                    if (rightExp instanceof CompleteTreeConstantNode) {
                        rightExp = expressionPart;
                    }
                    else {
                        // TODO: ggf.logisch 1 nicht anhaengen (nutze den speziellstmoeglichen Operatortypen)
                        //Anhaengen des neuen Teilausdrucks
                        rightExp = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.OrOperator, rightExp, expressionPart)
                    }
                }
            }
        }
        //speichere die fertige Gleichung
        equationList.push(new OutputEquation(currentEquationOutput, { tree: rightExp }))
    }
    return equationList
}


/**
 * Lies die Ausgabegleichungen aller s_i eines Automaten aus (ggf. mit = 0 gefuellt)
 * @param automaton Struktur des auszulesenden Automaten
 * @returns Liste aller Steuervariablen s_i mit deren Ausgabelgleichung
 */
function computeControlSignaleEquations(automatonStructure: RawAutomatonStructure): Array<CSEquation> {
    //Liste fuer alle Gleichungen
    let equationList: Array<CSEquation> = [];


    //Sammle alle Ausgaben(Steuersignale), die in diesem Automaten verwendet/gesetzt werden
    let controlSignalList: Array<InternalIndependentControlSignal> = []
    //Laufe ueber alle Knote
    automatonStructure.nodes.forEach(currentNode => {
        //Laufe ueber alle Ausgaben des Knotens
        currentNode.controlSignalAssignment.forEach(currentCsOutput => {
            //Haenge diese Ausgabe an die Liste aller Ausgaben des Automaten an (ohne Duplikate)
            controlSignalList = mergeTwoLists(controlSignalList, [ ControlSignalPair.getVariable(currentCsOutput,automatonStructure.id)])
        })
    })


    //Laufe ueber alle Steuersignale und erstelle ihre Gleichung 
    for (let equationCounter = 0; equationCounter < controlSignalList.length; equationCounter++) {
        //greife aktuelles Steuersignal als linke Seite der Gleichung
        let internalControlSignal = controlSignalList[equationCounter]
        let currentEquationOutput: InternalIndependentControlSignal = new InternalIndependentControlSignal(internalControlSignal.getNumber(), automatonStructure.id)
        //initial ist die rechte Seite der Gleichung logisch Null
        let rightExp: BaseCompleteTreeNode = new CompleteTreeConstantNode(ConstantType.ConstantZero);

        //berechne mit wie vielen z-Variablen die Knoten koodiert werden muessen
        let zVariableCount = calculateNeededVariables(getMaxCustomStateNumber(automatonStructure.nodes))


        //Laufe ueber alle Knoten und pruefe deren Ausgabe
        for (let nodeCounter = 0; nodeCounter < automatonStructure.nodes.length; nodeCounter++) {
            let currentNode = automatonStructure.nodes[nodeCounter]
            //greife Ausgaben (bezueglich der Steuervariablen ) des aktuellen Knoten
            let currentNodeOutput = automatonStructure.nodes[nodeCounter].controlSignalAssignment

            //laufe ueber alle Ausgaben (bezueglich der Steuervariablen ) des Knotens
            for (let outputCounter = 0; outputCounter < currentNodeOutput.length; outputCounter++) {
                // greife den aktuellen Ausgang  (bezueglich der Steuervariablen )
                let currentOutput = currentNodeOutput[outputCounter]

                //beschreibt er die Belegung der Ausgangsvariablen der aktuellen Gleichung --> wenn ja in Gleichung aufnehmen
                if (currentEquationOutput.matchesToInternalRepresentation(ControlSignalPair.getVariable(currentOutput,automatonStructure.id))) {
                    //Ausgabebedingung in Glecihung aufnehmen

                    //erstelle Ausdruck fuer den aktuellen Knoten in z-Variblen 
                    let stateExpression = stateNumberToLogicTree(automatonStructure.id, currentNode.customStateNumber.validNumber, zVariableCount)
                    //greife den Ausdruck fuer die Ausgabebedingung
                    let condition = currentOutput.equationErrorTupel.validExpression.tree;

                    //erstelle neuen Teil der Glecihung durch UND Verknuepfung beider Terme
                    let expressionPart = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.AndOperator, stateExpression, condition)

                    //Erweitere die Ausgabegleichung um den neuen Term
                    //Wenn noch die initiale Logisch Null noch vorleigt, so ersetze sie (in einem anderen Fall kann der Oberste Knoten nie eine Konstante sein, 
                    //da er sonst immer ein &Operator wäre)
                    if (rightExp instanceof CompleteTreeConstantNode) {
                        rightExp = expressionPart;
                    }
                    else {
                        //Anhaengen des neuen Teilausdrucks
                        // TODO: ggf.logisch 1 nicht anhaengen
                        rightExp = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.OrOperator, rightExp, expressionPart)
                    }
                }
            }
        }
        //speichere die fertige Gleichung (da diese hier anhand der Steuersignalausgaben der Knoten, welche keine Steuersignale enthalten koennen, berechnet wird, sollte
        //      die Gleichung keine Steuersignale enthalten (kein Fehler beim Erstellen des Objekts moeglich)
        equationList.push(new CSEquation(currentEquationOutput,{tree:rightExp}))
    }
    return equationList
}