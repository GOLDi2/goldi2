import _, { cloneDeep } from 'lodash';
import { removeTransition } from '../reducers/normalizedReducers/actionFunctions';
import { calculateGraphCentreOfMass } from '../reducers/normalizedReducers/helperfunctions';
import { Automaton, AutomatonStructure } from '../types/Automaton';
import { CustomNames } from '../types/BooleanEquations/CustomNames';
import { TreeNode } from '../types/BooleanEquations/LogicTrees/GeneralTree';
import { CompleteTreeOneOperandOperatorNode, CompleteTreeTwoOperandOperatorNode } from '../types/BooleanEquations/LogicTrees/Operators';
import { BaseCompleteTreeNode, ConstantType, VariableTyp } from '../types/BooleanEquations/LogicTrees/TreeNodeInterfaces';
import { CompleteTreeRoot, ICompleteTreeRoot } from '../types/BooleanEquations/LogicTrees/TreeRoots';
import { CompleteTreeZVariableNode, CompleteTreeConstantNode, CompleteTreeInputNode } from '../types/BooleanEquations/LogicTrees/Variables';
import { SignalAssignment } from '../types/BooleanEquations/SignalAssignment';
import { ControlSignal, ExternalIndependentControlSignal, InternalIndependentControlSignal } from '../types/ControlSignal';
import { DuplicateNameError, NameSyntaxError, OwnControlSignalsExpressionError, VariableTypeTupel } from '../types/Error';
import { NameErrorTupel } from '../types/ErrorElements';
import { ExternalInput, InternalInput, InternalInputAssignment } from '../types/Input';
import { DEFAULT_NODE_RADIUS, Node, NodePosition, RawNode } from '../types/Node';
import { AutomatonFrameWork, AutomatonSubState } from '../types/NormalizedState/AutomatonSubState';
import { HasID } from '../types/NormalizedState/NormalizedObjects';
import { NameTupel } from '../types/NormalizedState/SignalSubState';
import { createNewOperators, OperatorEnum, Operators } from '../types/Operators';
import { ExternalOutput, InternalOutput } from '../types/Output';
import { Bezier, calculateAngle, createBezier, createPoint, Point } from '../types/Points';
import { BaseInternAdressable, CustomNameRepresentation, ExternRepresentation, SignalTreeRepresentation } from '../types/Signal';
import { Signalpair } from '../types/Signalpair';
import { Transition, TransitionPosition } from '../types/Transition';
import { ZNaming, ZVariable } from '../types/ZVariable';

//erlaubter Syntax fuer alle Namen: alphanumerische Zeichen, "_" und "{" bzw. "}"
const allowedNameSyntax = new RegExp(/^[a-z][a-z0-9_{}]*$/i)

//Punkte und Leerzeichen in Operatoren verboten --> Falls veraendert muss auch der OperatorCheck angepasst werden
const forbiddenOperatorSyntax = new RegExp(/^.*(\.|\ |[a-zA-Z0-9_{}]).*/)


/**
 * Ueberprueft ob der uebergebene Automatenname noch verfuegbar ist, oder ob dieser bereits verwednet wird
 * @param automatonList List der Automaten in denen der Name einzigartig sein soll
 * @param name zu pruefender Name 
 * @param throwException soll eine Exception geworfen werden, wenn der Name bereits verwendet wird?
 * @throws {@link NameSyntaxError} falls der Name nicht nur aus alphanumerischen Symbolen bzw "{" , "}" und "_" besteht
 * @throws {@link DuplicateNameError}  wenn der Name bereits verwendet wird und throwException == true
 * @returns Kann der uebergebene Name verwendet werden? 
 */
export function isUsableAutomatonName(automatonSubState: AutomatonFrameWork, name: string, throwException: boolean): boolean {
    var usableName: boolean = true;

    //Case sensitivity beim zu pruefenden Namen vermeiden
    name = name.toLocaleLowerCase();

    //Name darf nur aus alphanumerischen Symbolen bzw "-" und "_" bestehen

    if (!name.match(allowedNameSyntax) && throwException) {
        throw new NameSyntaxError(name)
    }

    //Pruefe fuer jeden aktuell existemten Automaten ob der zu setzende Name bereits vergeben ist
    automatonSubState.automatonIDs.forEach(id => {
        //hat der Automat mit dieser Id bereits den zu setzenden Namen reserviert?
        if (automatonSubState.uiAutomatonData[id].name.validName.toLocaleLowerCase() === name) {
            //Dopplung gefunden
            usableName = false;
            if (throwException) {
                //Es soll eine Exception geworfen werden
                throw new DuplicateNameError(name);
            }
        }
    })
    return usableName;
}

//!! Entfaellt da namen keine Operatoren mehr enthalten sollen
// /**
//  * Pruefe ob der Name einen nutzerdefinierten Operator enthealt
//  * @param name Name der geprueft werden soll
//  * @param operators Liste aller Operatoren
//  * @returns Ist der Name frei von nutzerdefinierten Operatoren?
//  */
// function nameFreeOfOperators(name:string , operators:Operators):boolean{
//     name.toLocaleLowerCase();
//     var freeFromOperators = true;
//     //Pruefe ob mindestens ein Operator entahlten ist --> return false
//     if(name.includes(operators.customAndOperator.toLocaleLowerCase()) || name.includes(operators.customExclusivOrOperator.toLocaleLowerCase()) 
//         || name.includes(operators.customNotOperator.toLocaleLowerCase()) || name.includes(operators.customOrOperator.toLocaleLowerCase())){
//         freeFromOperators =false;
//     }
//     return freeFromOperators;
// }

// /**
//  * Suche eines Automaten bei bekanntem Namen
//  * @param automatonList zu Durchsuchende Liste
//  * @param name Name nach dem gesucht wird
//  * @returns Index des Automaten mit dem gesuchten Namen (-1, wenn nicht gefunden)
//  */
// export function getAutomatonIndex(automatonList: Array<Automaton>, name: string): number {
//     return automatonList.findIndex(automaton => automaton.name.toLocaleLowerCase() === name.toLocaleLowerCase());
// }

// /**
//  * Loeschen eines Automatomaten aus der uebergebenen Liste
//  * @param automatonList Liste aus der Automat entfernt werden soll
//  * @param name Name des zu loeschenden Automaten
//  * @returns Neues Array in dem der gesuchte Automat entfertn wurde 
//  */
// export function removeAutomatonByName(automatonList: Array<Automaton>, name: string): Array<Automaton> {
//     return automatonList.filter(automaton => automaton.name.toLocaleLowerCase() !== name.toLocaleLowerCase())
// }

/**
 * Suche eines Knotens bei bekannter Id in einer Knotenliste
 * @param nodeList Knotenliste in der gesucht werden soll
 * @param id Id des Zielknoten
 * @returns Index des gesuchten Knotens innerhalb der Knotenliste (-1 falls nicht gefunden)
 */
export function getNodeIndex(nodeList: Array<NodePosition>, id: number) {
    return nodeList.findIndex(node => node.id === id)
}

/**
 * Sucht nach der nachsten verfuegbaren Nummer/Id in der Liste
 * @param list Liste an Zahlen fuer die die naechste freie Zahl gesucht sit
 * @returns naechste freie Zahl (Id) innerhlab der Liste
 */
export function getNextUsableNumber(list: Array<number>): number {
    //Zaehler fuer aktuelle Id 
    var currentId = 0;
    do {
        //Cheke ob die Id bereits vergeben ist
        var isUsableId = true;
        for (var i = 0; i < list.length; i++) {
            //ist die aktuelle Id nutzbar?
            if (list[i] === currentId) {
                //Id existiert bereits
                isUsableId = false;
            }
        }
        //inkrementiere ID um die naechste zu pruefen
        if (isUsableId === false) {
            currentId++;
        }
    } while (isUsableId == false)


    return currentId;
}

/**
 * Prueft ob das gegebene Signal (nur durch seinen Typ und CustomName bebkannt) noch verfuegbar ist
 * @param signalList Liste der Signale in der der das Signal eindeutig seien soll
 * @param nameToCheck zu pruefendes Signalname 
 * @param throwException Soll eine Exception bei einer moeglichen Dopplung geworfen werden?
 * @throws{@link DuplicateNameError} falls der Name bereits in der Liste vergeben ist
 * @throws {@link NameSyntaxError} falls der Name nicht nur aus alphanumerischen Symbolen bzw "-" und "_" besteht oder dem Namenschema einer z-Variablen entspricht (darf Teil des Namens nicht aber der ganze Name sein)
 * @returns ist das Signal innerhalb der Liste noch verfuegbar?
 */
export function isUsableSignalName(signalList: Array<NameTupel>, nameToCheck: string, throwException: boolean): boolean {
    var usableName: boolean = true;
    //Case sensitivity beim zu pruefenden Namen vermeiden
    let customName = nameToCheck.toLocaleLowerCase();

    //Name darf nur aus alphanumerischen Symbolen bzw "{" , "}" und "_" bestehen
    if (!customName.match(allowedNameSyntax)) {
        throw new NameSyntaxError(nameToCheck)
    }

    //  // sind Operatoren im Namen enthalten? --> wenn ja Exception werfen
    // if(!nameFreeOfOperators(customName , operators)){
    //     throw new Error ("nameContainsOperators")
    // }

    //der Name darf nicht dem Namensschema einer moeglichen z-Variablen entsprechen (Uneindeutigkeit falls diese z-Variable erzeugt wird)
    //zudem waere das Eindeutige Interpretieren von z- bzw. Ausgabegleichungen nicht mehr moeglich
    if (customName.match(ZNaming)) {
        //Name entspricht dem Namen einer moeglichen zVariablen -->Fehler
        throw new NameSyntaxError(nameToCheck)
    }

    //Jedes Element der Liste auf Dopplung mit gegebenem Namen pruefen
    for (var i = 0; i < signalList.length; i++) {
        if (signalList[i].customName.validName.toLocaleLowerCase() === nameToCheck.toLocaleLowerCase()) {
            //Dopplung gefunden
            usableName = false;
            if (throwException) {
                //Es soll eine Exception geworfen werden
                throw new DuplicateNameError(nameToCheck);
            }
        }
    }
    return usableName;
}

/**
 * Ueberpruefe den Namen eines Signals auf Gueltigkeit und speichere eventuell aufgetretene Fehler
 * @param nameToCheck Name der geprueft werden soll --> wird bei Gueltigkeit in das Ergebnis uebernommen
 * @param signalList Liste der Signale in der der das Signal eindeutig seien soll
 * @param backupName Name der uebernommen wird, falls der zu pruefende Namen ungueltig ist
 * @returns Tupel aus dem uebernommenen Namen (backupName oder der zu pruefende Name) und eventuell aufgetretenen Fehlern
 */
export function computeSignalName(nameToCheck: string, signalList: Array<NameTupel>, backupName: string): NameErrorTupel {
    let reslut: NameErrorTupel = { validName: backupName, error: undefined } //initial: keine Fehler und den BackupName verwenden

    //pruefe ob der zu setzende Name verwendet werden kann
    try {
        isUsableSignalName(signalList, nameToCheck, true) //Immer Exceptions beim pruefen werfen
        reslut.validName = nameToCheck //Name war gueltig --> uebernimm ihn
    }
    catch (e) {
        //Der Name ist fehlerhaft und kann nicht verwendet werden --> speichere den Fehler 
        //Im Ergebnis wird der BackupName beibehalten
        if (e instanceof NameSyntaxError || e instanceof DuplicateNameError) { //Nur diese Fehler koennen beim Test des Namens auftreten
            reslut.error = e
        }
    }

    return reslut
}

/**
 Suche der ID eines Signals bei bekanntem nutzerdefinierten Namen
 * @param signalList Signalliste in der gesucht werden soll
 * @param customName gesuchter Signalname
 * @returns ID des gesuchten Signals (undefined falls nicht gefunden)
 */
export function getSignalId(signalList: Array<NameTupel>, customName: string): number | undefined {
    let match = signalList.find(signal => signal.customName.validName.toLocaleLowerCase() === customName.toLocaleLowerCase())
    if (match) {
        return match.id
    }
    else {
        return match
    }
}

/**
 * Suche eines Signalbelegungstupels bei bekannter interner Darstellung der belegten Variablen (diese ist nur innerhalb eines Automaten eindeutig)
 * @param signalList Signalliste in der gesucht werden soll (innerhalb dieser muss das gesuchte Element eindeutig sein --> die Liste darf nur von einem Knoten eines Automaten stammen)
 * @param internalNumber interne Nummer des gesuchten Signals
 * @returns Index des gesuchten Signals innerhalb der Signalliste (-1 falls nicht gefunden)
 */
export function getSignalPairIndexFromInternalNumber(signalList: Array<Signalpair>, internalNumber: number): number {
    //console.log(signalList)
    //console.log("gesucht    " + internalNumber )
    return signalList.findIndex(signal => signal.varibableNumber === internalNumber)
}


/**
 * Sucht die nutzerdefinierte Bezeichnung zu einer internen Darstellung eines Signals (das Signal ist global eindeutig dargestellt)
 * @param signalList Liste der Signale in der gesucht werden soll
 * @param internalSignal interne Darstellung des Signals zu dem die nutzerdefinierte Bezeichnug gesucht wird
 * @returns nutzerdefinierter Name des Signals bzw. "" wenn dieses nicht existiert
 */
export function getCustomNameFromInternalRepresentation(signalList: Array<ExternRepresentation>, internalSignal: BaseInternAdressable): string {
    //laufe ueber alle Eintrage und pruefe ob sie mit dem gesuchten ubereinstimmen (muss eindeutig sein)
    let customName = ""
    for (let signalCounter = 0; signalCounter < signalList.length; signalCounter++) {
        let currentSignal = signalList[signalCounter]
        if (currentSignal.matchesToInternalRepresentation(internalSignal)) {
            //das gesuchte Signal wurde gefunden (kann nur eins geben --> fertig)
            customName = currentSignal.customName.validName
            break;
        }
    }
    return customName
}


/**
 * Ueberprueft ob das Operatorsymbol nutzbar und innerhalb des Operatorsatzes einzigartig ist (Operatoren duerfen nur Sonderzeichen sein, daher sind sie disjunkt von Namen)
 * @param currentOperators aktuell verwendeter Operatorsatz
 * @param operatorSymbol zu pruefendes Operatorsymbol
 * @param changedOperatorTyp welcher Operator soll ersetzt werden ?
 * @throws {@link NameSyntaxError} falls der neue Operator fuer Operatoren verbotene Zeichen (einen Punkt oder ein Leerzeichen) enthaelt
 * @throws {@link DuplicateNameError} falls der Operator bereits verwendet wird (eventuell nur als Teilstring eines anderen)
 * @returns ist der Operator zulaessig?
 * 
 */
export function isValidOperatorSymbol(currentOperators: Operators, operatorSymbol: string, changedOperatorTyp: OperatorEnum): boolean {

    var isValid = false;
    //Objekt fuer zu preufende Operatoren (bedenke dass der zu ersetztende Operator nicht mit in die Analyse auf Mehrdeutigkeit eingehen darf --> setze ihn zu "" damit er z.B.
    // mit sich selbst ersetzt werden darf)
    var operatorsToCheck: Operators;

    //welcher Operator wird neu gesetzt? --> jeweils sein Operatorsymbol temporaer auf einen verbotenen Ausdruck setzen



    var tempOperator = "."
    //TODO: eleganter loesen

    if (!tempOperator.match(forbiddenOperatorSyntax)) {
        // console.log("Bedenke Anpassung des temporaeren Operatos in den helperfunctions in der Methode zur Ptuefung der Operatoren")
        throw new Error("tempOperatorMissMatch")
    }
    switch (changedOperatorTyp) {
        case OperatorEnum.AndOperator: {
            operatorsToCheck = createNewOperators(tempOperator, currentOperators.customOrOperator.validName, currentOperators.customNotOperator.validName, currentOperators.customExclusivOrOperator.validName)
            break;
        }
        case OperatorEnum.OrOperator: {
            operatorsToCheck = createNewOperators(currentOperators.customAndOperator.validName, tempOperator, currentOperators.customNotOperator.validName, currentOperators.customExclusivOrOperator.validName)
            break;
        }
        case OperatorEnum.NotOperator: {
            operatorsToCheck = createNewOperators(currentOperators.customAndOperator.validName, currentOperators.customOrOperator.validName, tempOperator, currentOperators.customExclusivOrOperator.validName)
            break;
        }
        case OperatorEnum.ExclusicOrOperator: {
            operatorsToCheck = createNewOperators(currentOperators.customAndOperator.validName, currentOperators.customOrOperator.validName, currentOperators.customNotOperator.validName, tempOperator)
            break;
        }
    }

    //keine Case sensitivity 
    operatorSymbol = operatorSymbol.toLocaleLowerCase();
    //Pruefe ob der Operator nicht dem Syntax eines Namens entspricht (Operatoren duerfen nur Sonderzeichen sein)

    // Ein Operator darf weiterhin nicht aus einem Leerzeichen " " bzw. einem Punkt "." bestehen
    /** Verbotener Operatorsyntax : {@link forbiddenOperatorSyntax}*/
    if (!operatorSymbol.match(forbiddenOperatorSyntax) && !operatorSymbol.match(ZNaming)) {
        //Der Operator erfuellt die Syntaxanforderungen --> pruefe auf Enthaltensein in Variablen, Automaten oder Steuersignalen

        //Pruefe ob das neue Symbol bereits als anderer Operator verwendet wird (muessen komplett disjunkt sein)
        //Pruefe ob die alten Operatoren in dem neuen neuen enthalten sind
        if (!operatorsToCheck.customAndOperator.validName.toLocaleLowerCase().includes(operatorSymbol) && !operatorsToCheck.customExclusivOrOperator.validName.toLocaleLowerCase().includes(operatorSymbol)
            && !operatorsToCheck.customNotOperator.validName.toLocaleLowerCase().includes(operatorSymbol) && !operatorsToCheck.customOrOperator.validName.toLocaleLowerCase().includes(operatorSymbol)
            && !operatorSymbol.includes(operatorsToCheck.customAndOperator.validName.toLocaleLowerCase()) && !operatorSymbol.includes(operatorsToCheck.customOrOperator.validName.toLocaleLowerCase())
            && !operatorSymbol.includes(operatorsToCheck.customNotOperator.validName.toLocaleLowerCase()) && !operatorSymbol.includes(operatorsToCheck.customExclusivOrOperator.validName.toLocaleLowerCase())) {
            //Symbol wird noch nicht verwendet 
            //Es muss nicht mehr geprueft werden ob der Operator in den Variablennamen enthalten ist, da deren Namen disjunkte Syntaxanforderungen besitzen

            isValid = true;


            // //Pruefe auf Enthaltensein des Operators in den Automatennamen --> wenn ja Excpetion werfen
            // for(var nameCounter = 0 ; nameCounter < automatonNameList.length ; nameCounter ++){
            //     var currentName = automatonNameList[nameCounter].toLocaleLowerCase();
            //     if(currentName.includes(operatorSymbol)){
            //         throw new Error ("OperatorAlreadyPartOfAutomatonName")
            //     }
            // }

            // //Pruefe auf Enthaltensein des Operators in den Eingaengen --> wenn ja Excpetion werfen
            // for(var nameCounter = 0 ; nameCounter <customNames.inputs.length; nameCounter++){
            //     var currentName = customNames.inputs[nameCounter].getCustomName().toLocaleLowerCase();
            //     if(currentName.includes(operatorSymbol)){
            //         throw new Error ("OperatorAlreadyPartOfInputName")
            //     }
            // }

            //  //Pruefe auf Enthaltensein des Operators in den Steuersignalen --> wenn ja Excpetion werfen
            //  for(var nameCounter = 0 ; nameCounter <customNames.controlSignals.length; nameCounter++){
            //     var currentName = customNames.controlSignals[nameCounter].getCustomName().toLocaleLowerCase();
            //     if(currentName.includes(operatorSymbol)){
            //         throw new Error ("OperatorAlreadyPartOfControlSignalName")
            //     }
            // }
            // //der Name darf nicht dem Namensschema einer moeglichen z-Variablen entsprechen 
            // if(operatorSymbol.match(ZNaming)){
            //     //Name entspricht dem Namen einer moeglichen zVariablen -->Fehler
            //     throw new Error("name must not be zVariable")
            // }

            // Es wurden keine Dopplungen gefunden --> Operator kann verwendet werden

        }
        else {
            throw new DuplicateNameError(operatorSymbol, `The operator '${operatorSymbol}' is already taken.`)
        }
    }
    else {
        throw new NameSyntaxError(operatorSymbol, `The operator '${operatorSymbol}' is invalid because it does not meet the syntax requirements.`)
    }
    return isValid

}

/**
 * Loesche alle Kanten, die aus dem gegebenen Knoten ausgehen
 * @param state State in dem die Informationen liegen
 * @param fromNodeId Id des Knoten, von dem alle ausgehenden Kanten geloescht werden sollen
 */
export function removeTransitionsFromNode(state: AutomatonSubState, fromNodeId: number) {
    //Durchlaufe alle Kanten und suche alle mit dem uebergebenen Ursprung
    //laufe ueber alle Kanten  (Erstelle Kopie der Id-Liste da sich diese waherend des Loeschens veraendert)
    let transitionsIds = cloneDeep(state.transitionSubState.transitionIds)
    transitionsIds.forEach(currentTransitionId => {
        // console.log(state.transitionSubState.transitionIds.toLocaleString())
        //pruefe die aktuelle Kante
        if (state.transitionSubState.transitionNodeData[currentTransitionId].fromNodeId === fromNodeId) {
            //Die Kante entspringt aus dem Knoten --> loesche sie
            removeTransition(state, currentTransitionId)
        }
    })
}

/**
 * Loesche alle Kanten, die zu dem gegebenen Knoten fuehren
 * @param state State in dem die Informationen liegen
 * @param fromNodeId Id des Knoten, von dem alle eingehenden Kanten geloescht werden sollen
 */
export function removeTransitionsToNode(state: AutomatonSubState, toNodeId: number) {
    //Durchlaufe alle Kanten und suche alle mit dem uebergebenen Ende
    //laufe ueber alle Kanten
    let transitionsIds = cloneDeep(state.transitionSubState.transitionIds)
    transitionsIds.forEach(currentTransitionId => {
        //pruefe die aktuelle Kante
        if (state.transitionSubState.transitionNodeData[currentTransitionId].toNodeId === toNodeId) {
            //Die Kante fuehr zu dem Knoten --> loesche sie
            removeTransition(state, currentTransitionId)
        }
    })
}

/**
 * Suche alle Kanten die von einem Knoten ausgehen
 * @param transitions Liste aller zu durchsuchenden Kanten
 * @param fromNodeId Id des Ursprungsknotens
 * @returns Array aller Transitionen, die von disem Knoten ausgehen
 */
export function getTransitionsFromNode(transitions: Array<TransitionPosition>, fromNodeId: number): Array<TransitionPosition> {
    return transitions.filter(transition => transition.fromNodeId === fromNodeId)
}

/**
 * Suche alle Kanten die zu diesem Knoten fuehren
 * @param transitions Liste aller zu durchsuchenden Kanten
 * @param fromNodeId Id des Zielknotens
 * @returns Array aller Transitionen, die zu diesem Knoten fuehren
 */
export function getTransitionsToNode(transitions: Array<TransitionPosition>, toNodeId: number): Array<TransitionPosition> {
    return transitions.filter(transition => transition.toNodeId === toNodeId)
}

/**
 * Berechnet die Ansatzpunkte der Kante mit geringstem Abstand zwischen zwei Knoten
 * @param startNodeCenter Mittelpunkt des Startknotens
 * @param endNodeCenter Mittelpunkt des Zielknotens
 * @returns Ansatzpunkte der Kanten fuer kuerzeste Verbindung (relativ zur Lage der Ansatzknoten)
 */
export function calculateShortestPath(startNodeCenter: Point, endNodeCenter: Point): { transitionStart: Point, transitionEnd: Point } {
    // Berechne den Winkel zwischen der x-Achse und der Geraden durch die Mittelpunkte beider Knoten
    let angle = calculateAngle(createPoint(startNodeCenter.xCord, startNodeCenter.yCord), createPoint(endNodeCenter.xCord, endNodeCenter.yCord))

    // Berechne den Ansatzpunkt der Kante auf dem Kreis des Startknotens (liegt in Richtung des Zielknotens)
    //  let cosFromXCord = startNodeCenter.xCord + DEFAULT_NODE_RADIUS * Math.cos(angle);
    let cosFromXCord = DEFAULT_NODE_RADIUS * Math.cos(angle);
    //  let sinFromYCord = startNodeCenter.yCord - DEFAULT_NODE_RADIUS * Math.sin(angle);
    let sinFromYCord = - DEFAULT_NODE_RADIUS * Math.sin(angle);
    let transitionStart: Point = { xCord: cosFromXCord, yCord: sinFromYCord }

    // Berechne den Ansatzpunkt der Kante auf dem Kreis des Endknotens (liegt in Richtung des Startknotens)
    //  let cosToXCord = endNodeCenter.xCord - DEFAULT_NODE_RADIUS * Math.cos(angle);
    //  let sinToYCord = endNodeCenter.yCord + DEFAULT_NODE_RADIUS * Math.sin(angle);
    let cosToXCord = - DEFAULT_NODE_RADIUS * Math.cos(angle);
    let sinToYCord = DEFAULT_NODE_RADIUS * Math.sin(angle);
    let transitionEnd: Point = { xCord: cosToXCord, yCord: sinToYCord }
    return { transitionStart, transitionEnd }


}

/**
 * Suche die groesste Zustandskoodierung innerhalb einer Knotenliste
 * @param nodes List der Knoten die durchsucht werden soll
 * @returns maximaler Zustandsindex innerhalb der Knotenliste (ist 0 falls die Liste leer ist)
 */
export function getMaxCustomStateNumber(nodes: Array<RawNode>): number {
    //Initial, falls kein Knoten existiert
    let maxCustomStateNumber = 0;
    //Ueber alle Knoten laufen und die groeßte Zustandsnummer finden
    for (let nodeCounter = 0; nodeCounter < nodes.length; nodeCounter++) {
        //Ist die aktuelle Nummer groesser?
        if (nodes[nodeCounter].customStateNumber.validNumber > maxCustomStateNumber) {
            maxCustomStateNumber = nodes[nodeCounter].customStateNumber.validNumber;
        }
    }
    return maxCustomStateNumber
}

/**
 * Berechnet die Anzahl an benoetigten Bits zur koodierung dieser Zustandsnummer (zur Darstellung von 0 wird 1 Bit benoetigt)
 * @param stateNumber Zustandsnummer fuer die die Anzahl an benoetigten Bits geprueft werden soll
 * @returns Anzahl an benoetigten Bits zur Darstellung der Zustandsnummer (ist immer >=1)
 */
export function calculateNeededVariables(stateNumber: number): number {
    // Ist die Zahl Null , so setze das Ergbnis zu 1
    if (stateNumber === 0) {
        stateNumber = 1;
    }
    else {
        //berechne den abgerundeten 2er log +1
        stateNumber = Math.floor(Math.log2(stateNumber) + 1)
    }
    return stateNumber
}

/**
 * Berechne die aktuell groesstmoegliche darstellbare Zustandsnummer (fuer die aktuell benoetigten z-Varoablen)
 * @param nodes List der Knoten die durchsucht werden soll
 * @returns Nummer des maximal darstellbaren Zustandes
 */
export function getMaxRepresentableStateNumber(nodes: Array<RawNode>): number {
    //berechne die Anzahl an z-Variablen, die noetig sind um den aktuell groessten Zustand zu koodieren
    let bitCount = calculateNeededVariables(getMaxCustomStateNumber(nodes));
    //mit x Bits koennen die Zustaende 0 , 1, ...., x-1 dargestellt werden
    //berechne den maximal darstellbaren Zustand mit so vielen Bits
    let maxStateNumber = Math.pow(2, bitCount) - 1;

    return maxStateNumber
}

/**
 * Berechne ob das Bit "bitNumber" fuer die binaere Koodierung des Zustandes(einer allgemeinen Zahl) gesetzt seien muss oder nicht
 * @param stateNumber binaer zu koodierende Zustandsnummer
 * @param bitNumber Nummer des Bits, das geprueft werden soll (Zaehlung beginnt bei 0) 
 * @returns muss das getestete Bit fuer die binaere Koodierung gesetzt sein?
 */
export function isBitNeededforEncoding(stateNumber: number, bitNumber: number): boolean {

    //erstelle eine Maske, mit der das aktuelle Bit maskiert wird
    let bitMask = 1;
    //Maske um bitNumber oft bitweise nach links schieben um damit zu maskieren
    bitMask = bitMask << bitNumber;

    //Maskiere die Nummer des Zustands mit der Maske
    //bleibt hierbei eine binaere 1 beim Bit:bitNumber , so ist die zugehoerige Zahl 2^bitNumber --> das Bit muss zur koodierung gesetzt werden
    return ((stateNumber & bitMask) === bitMask)
}

/**
 * Erstelle einen logischen Baum der den uebergebenen Zustand Z_i in z-Variablen z_i koodiert
 * @param automatonId Id des Automaten zu dem der Zustand und somit die z-Variablen gehoeren
 * @param stateNumber zu koodierende Zustandsnummer
 * @param bitsForEncoding Anzahl der z-Variablen die zur Koodierung verwendet werden sollen
 */
export function stateNumberToLogicTree(automatonId: number, stateNumber: number, bitsForEncoding: number): BaseCompleteTreeNode {
    //Laufe ueber alle z-Variablen (z_0 bis z_i) , wobei i die Anzahl der Bits -1
    let bitCounter = bitsForEncoding - 1;
    //GesamtBaum fuer den ganzen Ausdruck
    let treeRoot: BaseCompleteTreeNode

    //Initialisiere den Baum mit der hoechsten z-Variablen (es wird fuer die Koodierung immer mind. eine benoetigt --> nie out of bounds)
    treeRoot = new CompleteTreeZVariableNode(new ZVariable(automatonId, bitCounter))

    //Bit ggf. negieren, falls es nicht fuer die Koodierung der Zustandsnummer benoetigt wird
    if (!isBitNeededforEncoding(stateNumber, bitCounter)) {
        treeRoot = new CompleteTreeOneOperandOperatorNode(OperatorEnum.NotOperator, treeRoot);
    }
    //fuer naechste Variable runterzaehlen
    bitCounter = bitCounter - 1

    //Alle weiteren Faelle normal behandeln
    for (bitCounter; bitCounter >= 0; bitCounter--) {
        //neuen Teilbaum fuer die aktuelle Variable erstellen
        let subTree: BaseCompleteTreeNode = new CompleteTreeZVariableNode(new ZVariable(automatonId, bitCounter))
        //Variable ggf. negieren
        if (!isBitNeededforEncoding(stateNumber, bitCounter)) {
            subTree = new CompleteTreeOneOperandOperatorNode(OperatorEnum.NotOperator, subTree);
        }
        //Teilbaum mit logisch Und an den ganzen Baum anhaengen
        treeRoot = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.AndOperator, treeRoot, subTree)
    }

    return treeRoot
}

/**
 * Vereinigung zweier Listen  mit Entfernung von Duplikaten
 * @param list1 Liste 1
 * @param list2 List 2
 * @returns Vereinigung beider Listen ohne Duplikate
 */
export function mergeTwoLists<ListType>(list1: Array<ListType>, list2: Array<ListType>): Array<ListType> {
    //reduziere Liste 2 auf Elemente, die nicht in Liste 1 enthalten sind
    //teste dafuer fuer jedes Element aus Liste 2, ob es bereits ein identisches Objekt in Liste 1 gibt
    let uniqueList2 = list2.filter(item2 => list1.findIndex(item1 => checkForEquality(item1, item2)) < 0)
    return list1.concat(uniqueList2)

}


/**
 * Ueberpreufe ob zwei Objekte identisch sind (im Sinne dass alle Attribute und der Typ gleich sind )
 * @param object1 Erstes Objekt
 * @param object2 Zweites Objekt
 * @returns sind beide Objekte gleich?
 */
function checkForEquality(object1: any, object2: any): boolean {
    return _.isEqual(object1, object2)
}

/**
 * Tue etwas fuer alle Logikbaume innerhalb der Graphendarstellung (Ausgaben , Steuersignalausgaben und Kanten)
 * @param automatonState State aller Automaten fuer die die Funktion auf allen Ausdruecken auszufuehren ist
 * @param forAllNodesFunction Funktion die auf allen Ausdruecken ausgehfuerht werden soll
 */
export function doForAllExpressionsInGraph(automatonState: AutomatonSubState, forAllNodesFunction: (expression: ICompleteTreeRoot) => void): void {
    //Suche alle logischen Ausdruecke innerhalb der Automatenliste

    //Laufe ueber alle Kantenbedingungen des Systems
    automatonState.transitionSubState.transitionIds.forEach(currentTransitionID => {
        //suche die Bedingung dieser Kante
        let currentExpression = automatonState.transitionSubState.logicInformation[currentTransitionID].condition
        forAllNodesFunction(currentExpression.validExpression)
    })

    //suche alle Ausgaben und Steuersignalausgaben in allen Knoten
    //laufe ueber alle Knotenausgaben 
    automatonState.nodeSubState.nodeIds.forEach(currentNodeID => {
        //Suche die Ausgabe des Knotens
        let currentNodeLogic = automatonState.nodeSubState.logicInformation[currentNodeID]
        //wende die anzuwendende Funktion auf jede Steuersignalausgabe an
        currentNodeLogic.controlSignalAssignment.forEach(output => forAllNodesFunction(output.equationErrorTupel.validExpression))
        //wende die anzuwendende Funktion auf jede Ausgabe an
        currentNodeLogic.outputAssignment.forEach(output => forAllNodesFunction(output.equationErrorTupel.validExpression))
    })
}

/**
 * Nach dem Verschieben eines Knotens muessen auch mit ihm verbundene Kanten verschoben werden
 * Verschiebe die Positionen von davon betroffenen Kanten (alle ein- und ausgehenden Kanten des verschobenen Knotens) entsprechend 
 * @param nodeList Liste der Knoten die durch die zu pruefenden Kanten verbunden sind
 * @param transitionList Liste aller Kanten, die auf eine eventuell noetige Korrektur ihrer Positionen untersucht werden soll (falls noetig wird diese direkt durchgefuehrt , die Kanten werden verschoben)
 * @param nodeId Id des verschobenen Knotens
 * @param newCords Punkt an den der Knoten verschoben wurde 
 */
export function treatTransitionCorruptionsAfterNodeCordChange(nodeList: Array<NodePosition>, transitionList: Array<TransitionPosition>, nodeId: number, newCords: Point) {
    //Alle eingehenden und ausgehenden Kanten neu anordnen (jeweils kuerzeste Verbindung)
    let ingoingTransitions = getTransitionsToNode(transitionList, nodeId);
    //nur die Nicht-Eigenscheifen anpassen
    ingoingTransitions = ingoingTransitions.filter(transition => transition.fromNodeId !== transition.toNodeId)

    //Verschiebe den Endpunkt und Anfangspunkt aller eingehenden Kanten, sodass sie die kurzeste Verbindung darstellen
    //(Eigenschleifen muessen zwar verschoben aber nicht in ihrem Verlauf neu berechnet werden)
    for (let transitionCounter = 0; transitionCounter < ingoingTransitions.length; transitionCounter++) {
        //speichere aktuelle Kante
        let currentTransition = ingoingTransitions[transitionCounter]
        //Index der aktuell betrachteten Kante innerhalb der reduzierten Liste aller eingehenden Kanten
        let currentTransitionStartIndex = getNodeIndex(nodeList, currentTransition.fromNodeId)
        if (currentTransitionStartIndex > -1) {
            //Ursprungsknoten der eingehenden Kante finden
            let currentTransitionStartNode = nodeList[currentTransitionStartIndex]
            //Mittelpunkt des Ursprungsknotens
            let currentTransitionStartPoint = currentTransitionStartNode.position
            //Mittelpunkt des verschobenen Knotens
            let currentTransitionEndPoint = newCords
            //neue Ansatzpunkte der Kanten berechnen
            let newTransitionPoints = calculateShortestPath(currentTransitionStartPoint, currentTransitionEndPoint)

            //setze neue Ansatzpunkte der Kanten
            currentTransition.bezier.endPoint = newTransitionPoints.transitionEnd
            currentTransition.bezier.startPoint = newTransitionPoints.transitionStart

        }

    }
    //Alle ausgehnden Kanten bestimmen
    //nur die Nicht-Eigenscheifen anpassen
    let outgoingTransitions = getTransitionsFromNode(transitionList, nodeId)
    outgoingTransitions = outgoingTransitions.filter(transition => transition.fromNodeId !== transition.toNodeId)

    //Alle ausgehnden Kanten in ihrem Ursprung und Ende verschieben 
    for (let transitionCounter = 0; transitionCounter < outgoingTransitions.length; transitionCounter++) {
        let currentTransition = outgoingTransitions[transitionCounter]
        //Finde den Index des Zielknotens der ausgehenden Kante
        let currentTransitionEndIndex = getNodeIndex(nodeList, currentTransition.toNodeId)
        if (currentTransitionEndIndex > -1) {
            //Finde Zielknoten 
            let currentTransitionEndNode = nodeList[currentTransitionEndIndex]
            //Mittelpunkt des verschobenen Knotens
            let currentTransitionStartPoint = newCords
            //Mittelpunkt des Zielknotens
            let currentTransitionEndPoint = currentTransitionEndNode.position
            //neue Ansatzpunkte der Kanten berechnen
            let newTransitionPoints = calculateShortestPath(currentTransitionStartPoint, currentTransitionEndPoint)

            //setze neue Ansatzpunkte der Kanten
            currentTransition.bezier.endPoint = newTransitionPoints.transitionEnd
            currentTransition.bezier.startPoint = newTransitionPoints.transitionStart

        }
    }

}

/**
 * Suche den Namen eines Automaten anhand seiner Id aus den Custom Names
 * @param id Id des gesuchten Automaten
 * @param customNames nutzerdefinierte Namen innerhalb derer gesucht werden soll
 * @returns Name des Automaten falls gefunden, wenn nicht dann "missingAutomaton" als leeren String
 */
export function getAutomatonName(id: number, customNames: CustomNames): string {
    //Suche das Tupel dieses Automaten (Id ist eindeutig)
    let matchTupel = customNames.automatonNames.find(tupel => tupel.id === id)

    let name = "missingAutomaton" //gesuchter Name
    //Falls das Tupel existiert (eigentlich immer) so gib den Namen aus , wenn nicht dann gib nichts aus
    if (matchTupel) { name = matchTupel.customName.validName }

    return name

}

/**
 * Berechne den Offset zwischen einem gegeben Punkt und einem Referenzpunkt (relative Lage zueinander)
 * @param referenceNode Refernezpunkt
 * @param positionToConvert Position, die relativ zur Referenz angegeben werden soll
 * @returns Offset zwischen dem gegeben Punkt und dem Referenzpunkt
 */
export function calculateRelativTransitionPosition(referenceNode: NodePosition, positionToConvert: Point) {
    let relativPosition = createPoint(positionToConvert.xCord - referenceNode.position.xCord, positionToConvert.yCord - referenceNode.position.yCord)
    return relativPosition
}

/**
 * Berechne die intern zu speichernde Positionsinformation (State-gerechte Darstellung) eines Stuetzpunktes einer Kante aus den von der GUI uebergebenen Koordinaten des Stuetzpunktes
 * @param fromNodePosition absolute Position des Startknotens der Kante
 * @param toNodePosition absolute Position des Endknotens der Kante
 * @param relativTransitionPoints Offset des Kantenanfangs zur Position des Startknoten und Offset des Kantenendes zur Position des Endknotens
 * @param supportPosition  Koordinaten des Stuetzpunktes relativ zum absolten Startpunkt der Kante, welche von der GUI uebergeben wurden und nun in die State-gerechte Darstellung konvertiert werden sollen
 * @returns State-gerechte Darstellung der Position des Stuetzpunktes der Kante
 */
export function calculateRelativTransitionSupportPosition(fromNodePosition: Point, toNodePosition: Point, relativTransitionPoints: { relativStart: Point, relativEnd: Point }, supportPosition: Point) {

    //Berechne den euklidischen Abstand der beiden Ansatzpunkte der Kante
    //berechne die absoluten Koordinaten der Ansatzpunkte fuer die Distanzberechnung
    let absoluteEndPoint = createPoint(relativTransitionPoints.relativEnd.xCord + toNodePosition.xCord, relativTransitionPoints.relativEnd.yCord + toNodePosition.yCord)
    let absoluteStartPoint = createPoint(relativTransitionPoints.relativStart.xCord + fromNodePosition.xCord, relativTransitionPoints.relativStart.yCord + fromNodePosition.yCord)

    let distance = calculateDistance(absoluteStartPoint, absoluteEndPoint) //Distanz zwischen Start und Ende der Kante (Laenge der Kante, wenn sie als Gerade implementiert waere)

    //Normiere die Lage des Stutzpunktes bezueglich des Abstandes der Punkte
    let normX = supportPosition.xCord / distance
    let normY = supportPosition.yCord / distance
    let relativPosition: Point = { xCord: normX, yCord: normY } //State-gerechte Darstellung (normierter )
    return relativPosition
}

/**
 * Berechne die euklidische Distanz zweier Punkte (Laenge der Verbindungsgeraden)
 * @param point1 Punkt 1
 * @param point2 Punkt 2
 * @returns Abstand der Punkte (euklidisch)
 */
export function calculateDistance(point1: Point, point2: Point): number {

    //Berechne die Differenzen der Kooridnaten beider Punkte
    let deltaX = point1.xCord - point2.xCord
    let deltaY = point1.yCord - point2.yCord

    //Berechne den euklidischen Abstand der beiden Ansatzpunkte der Kante
    let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    return distance
}


/**
 * Berechne den Verlauf einer Kante
 * @param fromNode Startknoten
 * @param toNode Endknoten
 * @returns Verlauf der Kante
 */
export function calculateTransitionBezier(fromNode: NodePosition, toNode: NodePosition): Bezier {
    let supportPoint: Point
    //berechne die Ansatzpunkt der Kante --> Stuetzpunkt wird relativ zum Startpunkt der Kante angegeben
    let transitionPoints = calculateShortestPath(fromNode.position, toNode.position)

    if (fromNode.id === toNode.id) {
        //Es liegt eine Eigenschleife vor --> platziere den Stuetzpunkt entsprechend (dieser wird relativ angegeben) und setze die Ansatzpunkte nah aneinander 

        //TODO: ggf. individuelle Wahl des Ansatzpunktes der Eigenschleife auf Basis der Lage des Knotens und anderer Kanten
        //waehle einen Ansatzpunkte
        let angle = Math.PI //Winkel an dem die Kante ansetzt
        let endAngle = angle + Math.PI * 2 / 6 //60 Grad weiter das Ende setzen
        transitionPoints.transitionStart = { xCord: Math.cos(angle) * DEFAULT_NODE_RADIUS, yCord: Math.sin(angle) * DEFAULT_NODE_RADIUS } //Start der Kante
        transitionPoints.transitionEnd = { xCord: Math.cos(endAngle) * DEFAULT_NODE_RADIUS, yCord: Math.sin(endAngle) * DEFAULT_NODE_RADIUS }

        supportPoint = createPoint(fromNode.radius, 2 * fromNode.radius)
    }
    else {
        //keine Eigenschleife --> normal platzieren
        //Berechne die absoluten Ansatzpunkte
        let absoluteStartPoint = createPoint(fromNode.position.xCord + transitionPoints.transitionStart.xCord, fromNode.position.yCord + transitionPoints.transitionStart.yCord)
        let absoluteEndPoint = createPoint(toNode.position.xCord + transitionPoints.transitionEnd.xCord, toNode.position.yCord + transitionPoints.transitionEnd.yCord)

        //berechne den Abstand zwischen den Ansatzpunkten
        let distance = calculateDistance(absoluteEndPoint, absoluteStartPoint)


        // x-Koordinate des Punktes als halber Abstand (da das Kooerdinatensystem der Kante die x-Achse als Verbindung der Knoten besitzt)
        supportPoint = createPoint(distance / 2, 30) //fester Wert in y um zu vermeiden dass kanten identisch verlaufen

    }


    let normalizedPosition = calculateRelativTransitionSupportPosition(fromNode.position, toNode.position, { relativStart: transitionPoints.transitionStart, relativEnd: transitionPoints.transitionEnd }, supportPoint)

    let bezier = createBezier(transitionPoints.transitionStart, transitionPoints.transitionEnd, normalizedPosition)
    return bezier
}

/**
 * Lies alle Steuersignale mit ihrem nutzerdefinierten Namen aus einem Ausdruck aus
 * @param expression Ausdruck der durchsucht werden soll
 * @param customNames 
 * @returns Liste aller enthaltenen Steuersignale mit ihrem nutzerdefinierten Namen
 */
export function getAllControlSignalNamesFromExpression(expression: ICompleteTreeRoot, customNames: CustomNames): Array<VariableTypeTupel<VariableTyp.ControlSignal>> {
    //extrahiere  alle Setuersignale aus dem Ausdruck
    let controlSignals = CompleteTreeRoot.extractAllIncludedControlSignals(expression)

    //lies den Namen zu jedem Signal aus
    let result: Array<VariableTypeTupel<VariableTyp.ControlSignal>> = []
    controlSignals.forEach(signal => {
        result.push({ variableName: signal.toCustomString(customNames), variableTyp: VariableTyp.ControlSignal })
    })
    return result
}

/**
 * Lies alle ZVariablen einem Ausdruck aus
 * @param expression Ausdruck der durchsucht werden soll
 * @param customNames 
 * @returns Liste aller enthaltenen zVariablen
 */
export function getAllzVariableNamesFromExpression(expression: ICompleteTreeRoot): Array<VariableTypeTupel<VariableTyp.zSignal>> {
    //extrahiere  alle zVariablen aus dem Ausdruck
    let zVariables = CompleteTreeRoot.extractAllIncludedZVariables(expression)

    //lies den Namen zu jedem Signal aus
    let result: Array<VariableTypeTupel<VariableTyp.zSignal>> = []
    zVariables.forEach(signal => {
        result.push({ variableName: signal.toCustomString(), variableTyp: VariableTyp.zSignal })
    })
    return result
}

/**
 * Suche alle Steuersignale eines Automaten aus einem Ausdruck in der Darstellung, in der sie in einem Fehler gespeichert werden
 * @param expression Ausdruck der durchsucht werden soll
 * @param automatonId Id des Automaten fuer den die Steuersignale gesucht werden
 * @param customNames nutzerdefinierte Namen im System
 * @returns Fehlergerechte Darstellung der Steuersignale des gesuchten Automaten im gegebenen Ausdruck
 */
export function checkForOwnControlSignals(expression: ICompleteTreeRoot, automatonId: number, customNames: CustomNames): Array<VariableTypeTupel<VariableTyp.ControlSignal>> {

    //extrahiere alle Steuersignale aus dem Ausdruck
    let controlSignals = CompleteTreeRoot.extractAllIncludedControlSignals(expression)

    //suche alle Steursignale dieses Automaten (gleiche Id)
    controlSignals = controlSignals.filter(controlSignal => controlSignal.automatonId === automatonId)

    //Es liegen Variablen vor, die nicht enthalten seien duerfen --> speichere ihren Namen
    let controlSignalNames: Array<VariableTypeTupel<VariableTyp.ControlSignal>> = []
    controlSignals.forEach(currentSignal => controlSignalNames.push({ variableName: currentSignal.toCustomString(customNames), variableTyp: VariableTyp.ControlSignal }))

    return controlSignalNames


}
