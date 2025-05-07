import { cloneDeep, merge } from "lodash";
import { calculateShortestPath, calculateTransitionBezier, mergeTwoLists } from "../../actioncreator/helperfunctions";
import { optimalNodePlacement } from "../../reducers/normalizedReducers/helperfunctions";
import { Automaton, AutomatonPositionStructure, AutomatonStructure, RawAutomatonStructure } from "../Automaton";
import { ControlSignal, ExternalIndependentControlSignal } from "../ControlSignal";
import { ControlSignalPair } from "../ControlSignalPair";
import { Node, NodePosition } from "../Node";
import { ExternalOutput } from "../Output";
import { IOutputSignalPair, OutputSignalPair } from "../OutputSignalPair";
import { Bezier, Point } from "../Points";
import { SignalTreeRepresentation } from "../Signal";
import { Transition, TransitionPosition } from "../Transition";
import { DerivedAutomatonViews } from "../view";
import { ZVariable } from "../ZVariable";
import { computeEquationSet, computeEquationSets } from "./computeAutomatonEquations";
import { OutputEquation, ZEquation } from "./Equations";
import { AutomatonEquationSet } from "./EquationSet";
import { ConstantType } from "./LogicTrees/TreeNodeInterfaces";
import { CompleteTreeRoot, ICompleteTreeRoot } from "./LogicTrees/TreeRoots";
import { CompleteTreeConstantNode } from "./LogicTrees/Variables";
import { createVariableAssignmentFromIndex, minimizeLogicTree, minimizeTruthTable } from "./Minimizer/minimizeTree";
import { TruthTable } from "./Minimizer/TruthTable";
import { DerivedSystemAssignment } from "./SystemAssignment";

// /**
//  * Berechne die Hardwareautomaten (immer vollstaendig und wiederspruchsfrei) aus einer Liste an Gleichungssets von Automaten
//  * @param equationSets Sets der Gleichungen der Automaten die in die resultierenden Hardwareautomaten umgerechnet werden sollen
//  * @param outputList List der Ausgangsvariablen die den Hardwareautomaten bekannt seien sollen (werden in jedem Zustand mit einer Ausgabe belegt)
//  * @returns Automatendarstellungen der zugehoerigen Hardwareautomaten 
//  *           (in den ausgegebenen Automaten sind die Konzepte Knoten und Zustand aequivlalent, weshalb die KontenId immer zur Zustandsnummer gewaehlt wird)
//  */
// export function computeHardwareAutomatonsFromAutomatonList(automatons: Array<Automaton>): Array<Automaton> {
//     //neue Liste fuer die Hardwareautomaten
//     let hardwareAutomatonList: Array<Automaton> = []
//     //wandle jeden Automaten in seine HW-Darstellung um
//     automatons.forEach(automaton => hardwareAutomatonList.push(computeHardwareAutomatonFromAutomaton(automaton)))
//     return hardwareAutomatonList
// }



// /**
//  * Berechne den Hardwareautomaten (immer vollstaendig und wiederspruchsfrei) zu einem Automaten
//  * @param automaton Automat zu dem der Hardwareautomat berechnet werden soll
//  * @returns Automatendarstellungen des zugehoerigen Hardwareautomaten 
//  *          (in dem ausgegebenen Automaten sind die Konzepte Knoten und Zustand aequivlalent, weshalb die KontenId immer zur Zustandsnummer gewaehlt wird)
//  */
//  function computeHardwareAutomatonFromAutomaton(automaton: Automaton):Automaton{
//     //Berechne die Gleichungen des Auotmaten
//     let equationSet = computeEquationSet(automaton)

//     //Berechne die Struktur des Hw-Automaten anhand der Gleichunge
//     let hardwareAutomatonStructure = computeHardwareAutomatonStructureFromEquationSet(equationSet)

//     //Erstelle den fertigen Automaten anhand der berechneten Struktur und weiterer Informationen aus dem originalen Automaten
//     let hardwareAutomaton = new Automaton(automaton.getDerivedAutomatonName(DerivedAutomatonViews.HardwareAutomaton),automaton.id,automaton.info , automaton.isActive)
//     hardwareAutomaton.initialStateNumber = automaton.currentStateNumber //setze den Initialzustand
//     hardwareAutomaton.currentStateNumber = hardwareAutomaton.initialStateNumber //starte im Initialzustand
//     hardwareAutomaton.controlSignals = automaton.controlSignals //uebernimm alle Steuersignale die dem Automaten bekannt sind 



//     /**
//      *  platziere jeden Zustand entspechend der Vorgaben auf der Zeichenflaeche:
//      *      -Ist seine Position durch den Nutzer speziell definiert (besitzt einen Eintrag in {@link hardwareStatePositions}) so muss diese ubernommen werden 
//      *      -Ist dies nicht der Fall, so pruefe ob der Zustand durch einen Knoten im originalen Automaten repraesentiert wird --> Wenn ja uebernimm seine Position
//      *       (wird ein Zustand durch mehrere Knoten koodiert, so ubernimm die Position des Knotens der weiter vorn in der Liste der Knoten liegt)
//      *      -Ist dies auch nicht der Fall (Zustand existiert nur im HW-Automaten ohne Knoten im original- Automaten) so platziere ihne automatisch 
//      */
//     let templateStrucure = new AutomatonStructure(automaton.id,automaton.nodes , automaton.transitions) //Automatenstruktur, deren Positionen ggf. uebernommen werden
//     let placedElements = placeStatesAndTransitions(hardwareAutomatonStructure , templateStrucure , automaton.hardwareStatePositions , automaton.hardwareTransitionPositions)

//     //Uebernimm die platzierten Elemente
//     hardwareAutomaton.nodes = placedElements.nodes
//     hardwareAutomaton.transitions = placedElements.transitions

//     //Ausagbe der fertigen Automaten
//     return hardwareAutomaton


// }

/**
 * Berechne die Struktur der Hardwareautomaten (immer vollstaendig und wiederspruchsfrei) zu gegebenen Automaten
 * @param automatonStructures Struktur der Automaten die in Hw- umgerechnet werden sollen
 * @returns Struktur Automatendarstellungen der zugehoerigen Hardwareautomaten 
 *          (in dem ausgegebenen Automaten sind die Konzepte Knoten und Zustand aequivlalent, weshalb die KontenId immer zur Zustandsnummer gewaehlt wird)
 *          Die berechneten Strukturen besitzen die Id des Automaten aus dem sie berechnet wurden
 */
export function computeHardwareAutomatonStructures(automatonStructures: Array<RawAutomatonStructure>): Array<RawAutomatonStructure> {
    // console.log("hw neu berechnen")
    //Berechne die Gleichungen der Auotmaten
    let equationSet = computeEquationSets(automatonStructures)

    //Berechne die Hw-Struktur fuer jedes Gleichungsset
    let hwStructures: Array<RawAutomatonStructure> = [] //Liste fuer die berechneten Strukturen
    equationSet.forEach(currentSet => hwStructures.push(computeHardwareAutomatonStructureFromEquationSet(currentSet)))


    return hwStructures
}




/**
 * Berechne den Hardwareautomaten (immer vollstaendig und wiederspruchsfrei) aus einem Gleichungsset eines Automaten
 * @param equationSet Set der Gleichungen eines Automaten der in den resultierenden Hardwareautomaten umgerechnet werden soll
 * @returns Strukturdarstellung des Hardwareautomaten
 *              Die Knoten sind hierbei die Zustaende (Es gilt also fuer jeden Knoten: Knotennummer = Zustandsnummer des Knotens) und jeweils einzigartig in der Liste
 *              (muss um Metainformationen zum Automaten ergaenzt werden)
 */
export function computeHardwareAutomatonStructureFromEquationSet(equationSet: AutomatonEquationSet): RawAutomatonStructure {
    //lies alle Gleichungen aus
    //pruefe ob die Liste der z-Gleichungen nicht leer ist --> falls ja fuege eine Gleichung fuer z_0=0 ein
    let zEquations = equationSet.zEquations
    if (zEquations.length === 0) {
        zEquations.push(new ZEquation(new ZVariable(equationSet.automatonId, 0),
           {tree:(new CompleteTreeConstantNode(ConstantType.ConstantZero))}))
    }


    //Erstelle die (vorerst leere) Strukturdarstellung fuer den Hardwareautomaten
    let hardwareAutomatonStructure: RawAutomatonStructure = { id: equationSet.automatonId, nodes: [], transitions: [] }

    //berechne die Anzahl an Hardwarezustaenden (2^(Anzahl der z-Gleichungen))
    let stateCount = Math.pow(2, zEquations.length)
    //erstelle so viele Zustaende (da nur die KnotenId angegeben wird ist die Zustandsnummer = der KnotenID)
    //initialisiere die Knotenliste leer damit die Implementierung unabhaengig vom Konstruktor des Automaten ist
    //(da Knoten aufsteigend von 0 an eingefuegt wurden enttspricht der Index im Array der Zustandsnummer)
    for (let counter = 0; counter < stateCount; counter++) {
        //ID = Zustandsnummer im Hardwareautomaten
        let node = new Node(counter)
        node.customStateNumber.validNumber = counter
        hardwareAutomatonStructure.nodes.push(node)
    }

    //Greife die Gleichungen die ausgewertet werden muessen
    let controlSignalEquations = equationSet.controlSignalEquations
    let outputEquations = equationSet.outputEquations


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Aufbauen der Automatenstruktur aus den z- und Ausgabegleichungen

    //Erstelle eine Liste mit allen moeglichen Variablen (ohne Dopllungen) fuer die spaetere Erstellung einer Belegung anhand eines Belegungsindexes
    // Geststalt der Liste fuer n z-Gleichungen : (MSB) z_(n-1) , z_(n-2) , .... , z_0 , Alle Signale s_i und x_i (LSB)

    //Da die Liste aller z-Gleichungen vollstaendig seien muss gibt es so viele z_i wie Gleichungen (immer > 0)
    //Die zVariablen sollten nicht aus den rechten Seiten der Gleichungen extrahiert werden, da dort ggf. nicht alle enthalten sind

    //sortiere dafuer die z-Gleichungen in absteigendem Index (deshalb *-1) der z-Variable der Gleichung
    zEquations.sort(((a: ZEquation, b: ZEquation) => (a.getVariable().getNumber() - b.getVariable().getNumber()) * (-1)))
    //extrahiere die z-Variablen in gleicher Reihenfolge aus den Gleichungen
    //Extrahiere gleichzeitig alle anderen Variablen (ohne die z-Variablen) die in den Gleichungen vorkommen ohne Dopplungen
    let zVariables: Array<ZVariable> = []
    let variables: Array<SignalTreeRepresentation> = []
    zEquations.forEach(currentZEquation => {
        zVariables.push(currentZEquation.getVariable());
        variables = mergeTwoLists(variables, CompleteTreeRoot.extractAllIncludedVariables(currentZEquation.equation));
    })
    //!!! Ab hier muessen die z-Gleichungs- und die z-Variablenlisten in der gleichen Reihenfolge (absteigend sortiert) bleiben !!! 
    // die Variable z_(n-1) ist nun an Stelle 0 (das MSB) 

    //Extrahiere auch alle Variablen aus den Ausgabegleichungen und Steuersignalgleichungen
    outputEquations.forEach(currentOutputEquation => { variables = mergeTwoLists(variables,CompleteTreeRoot.extractAllIncludedVariables(currentOutputEquation.equation)) })
    controlSignalEquations.forEach(currentCSEquation => {variables = mergeTwoLists(variables, CompleteTreeRoot.extractAllIncludedVariables(currentCSEquation.equation))})
    //In der Liste sind alle vorkommenden Variablen enthalten --> entferne alle z-Variablen aus dieser List
    //alle nicht z-Variablen uebernehmen
    let noZVariables: Array<SignalTreeRepresentation> = []; //temporaere List
    for (let variabelCounter = 0; variabelCounter < variables.length; variabelCounter++) {
        let currentVariable = variables[variabelCounter]
        if (!(currentVariable instanceof ZVariable)) {
            noZVariables.push(currentVariable)
        }
    }
    variables = noZVariables
    //!!! Reihenfolge darf ab hier nicht mehr geandert werden , damit Ersetzungen der Variablen nach der Minimierung korrekt ist !!!

    //Anzahl an moeglichen Belegungen dieser Variablenliste (Liste der "Eingange")
    let inputAssignmentCount = Math.pow(2, variables.length)


    //Werte nun die Ausgabe- und zGleichungen fuer jeden Zustand (alle Moeglichen Belegungen der zVariablen) jeweils fuer alle moeglichen Belegungen der Eingangs- und Steuervariablen aus
    //Vermerke in einer großen Wertetabelle welcher Zustand aus dem aktuellen Zustand bei der aktuellen Eingangsbelegung erreicht wird
    //reserviere fuer jede moelgiche Transition (aus Z x Z) eine Ausgangsspalte der Wertetabelle  ( "|" als Spaltentrenner)
    //fuer m Zustaende ergibt sich: 
    //Schema der  m* m vielen Spalten:  Z0 -> Z0 | Z0 -> Z1 | ... | Z0 -> Z(m-1) | Z1 -> Z0 | Z1 -> Z2 | ... | Z1 -> Z(m-1) | Z2 - Z0 | ... | Zn -> Z0 | ... | Z(m-1) -> Z(m-1)


    //es wird nur ueber die nicht z-Variablen als Eingaenge minimiert (zVariablen sind weder in Ausagbe noch den Kanten enthalten)
    //erst nach gesamten Durchlauf aller Zustaende auswertbar
    let transitionTruthTable = new TruthTable(variables.length, stateCount * stateCount)

    //laufe uber alle moeglichen Zustaende (2^(Anzahl der zVariablen viele)  ab Z0)
    for (let currentStateCounter = 0; currentStateCounter < stateCount; currentStateCounter++) {
        //erstelle eine Belegung der zVariablen fuer diesen Belegungsindex (diesen Zustand)
        let zVariableAssignment = createVariableAssignmentFromIndex(zVariables, currentStateCounter)

        //erstelle nun eine Tabelle fuer die Ausgabe dieses Zustandes --> pro Zustand einzeln auswerten
        //Werte jede der Ausgabegelichungen fuer den aktuellen Zustand und die aktuelle Eingangsbelegung aus
        //globales Schema der Spalten fuer die x Ausgaben und y Steuersignal im aktuellen Zustand :
        // Werteverlauf Ausgabe 1 | ... | Werteverlauf Ausgabe x | Werteverlauf Steuersignal 1 | ... | Werteverlauf Steuersignal y
        //so viele Spalten wie Ausgabe und Steuersignalgleichungen
        //falls beide Listen leer seien sollten so hat die Tabelle 0 Ausgaenge (leere Tabelle), die im weiteren zu keinen Fehlern fuehrt
        let outputTruthTable = new TruthTable(variables.length, outputEquations.length + controlSignalEquations.length)
        //laufe fuer jeden Zustand ueber jede moegliche Belegung der "Einganenge" (der anderen Variablen)
        for (let inputAssignmentIndex = 0; inputAssignmentIndex < inputAssignmentCount; inputAssignmentIndex++) {
            //erstelle die zugehoerige Belegung der Variablen ("Eingaenge") fuer diesen Belegungsindex
            let inputAssignment = createVariableAssignmentFromIndex(variables, inputAssignmentIndex)

            //fuehre beide Belegungslisten Zusammen (innerhalb der Eingangsbelegung sind keine z-Variablen gesetzt , innerhalb der z-Belegung nur z-Variablen) 
            let fullAssignment = new DerivedSystemAssignment(inputAssignment.inputAssignment, zVariableAssignment.zVariableAssignment, inputAssignment.controlSignalAssignment)

            //werte jede z-Gleichung fuer diese Belegung aus und berechne aus den Ergebnissen den Folgezustand fuer die aktuelle Belegung im aktuellen Zustand 

            let nextStateNumber = calculateNextStateFromEquations(zEquations, fullAssignment)


            //nun steht in der nextStateNumber der Folgezustand bei der aktuellen Belegung im aktuellen Zustand
            //Schreibe eine 1 in die Spalte: (aktueller Zustand -> Folgezustande) , wobei die Spaltennummerierung nach dem obigen Schema erfolgt
            // Index fuer die 1 im Werteverlauf der Spalte ist der aktuellen Eingangsbelegungsindex (!ohne zVariablen)
            //fuer jede Auswertung wird eine 1 in einen Werteverlauf einer Spalten geschrieben 
            //in einem Hardwareautomaten erreicht man aus jedem Zustand fuer jede Belegung genau einen Folgezustand (in Hardware immer vollstaendig und widerspruchsfrei)

            //berechne den Index der Spalte (aktueller Zustand -> Folgezustande) = aktuellerZustand * m + FolgeZustand
            let columnIndex = currentStateCounter * stateCount + nextStateNumber
            transitionTruthTable.setOutputOne(inputAssignmentIndex, columnIndex)


            //Berechne jede Ausgabegleichung fuer die aktuellen Belegungen 
            for (let outputEquationCounter = 0; outputEquationCounter < outputEquations.length; outputEquationCounter++) {
                //greife die aktuelle Ausgabegleichung
                let currentOutputEquation = outputEquations[outputEquationCounter]
                //werte sie aus (fuer die aktuelle Belegung)
                let result =CompleteTreeRoot.evaluate(currentOutputEquation.equation , fullAssignment)
                //falls das Ergebnis true ist, so vermerke es in der Spalte des aktuellen Ausgangs fuer die aktuelle Belegung in der Ausgabetabelle des aktuellen Zustands
                if (result) {
                    outputTruthTable.setOutputOne(inputAssignmentIndex, outputEquationCounter)
                }
                //sonst:tue nichts
            }
            //Berechne jede Steuersignalausgabegleichung fuer die aktuellen Belegungen 
            for (let controlSignalEquationCounter = 0; controlSignalEquationCounter < controlSignalEquations.length; controlSignalEquationCounter++) {
                //greife die aktuelle Ausgabegleichung
                let currentControlSignalEquation = controlSignalEquations[controlSignalEquationCounter]
                //werte sie aus (fuer die aktuelle Belegung)
                let result =CompleteTreeRoot.evaluate(currentControlSignalEquation.equation , fullAssignment)
                //falls das Ergebnis true ist, so vermerke es in der Spalte des aktuellen Steuersignalausgangs fuer die aktuelle Belegung in der Ausgabetabelle des aktuellen Zustands
                //die Spalten fuer die Steuersignalausgaben beginnen hinter denen fuer die Ausgaben
                if (result) {
                    outputTruthTable.setOutputOne(inputAssignmentIndex, outputEquations.length + controlSignalEquationCounter)
                }
                //sonst:tue nichts
            }

        }
        //es wurde alles fuer den aktuellen Zustand ausgewertet 
        //minimiere die Tabelle fuer die Ausgabe dieses Zustandes 
        let placeholderEquation = minimizeTruthTable(outputTruthTable)
        //Reihenfolge der minimierten Gleichungen entspricht der der Spalten in der Tabelle (erst Ausgabegleichungen , dann Steuersignalausgaben)
        //ersetze alle Platzhalter mit den Variablen (Reihenfolge der Variablen in der List muss noch der zuer Erstellung der Sytsembelegung entsprechen)
        let minimizedEquations: Array<ICompleteTreeRoot> = [];
        placeholderEquation.forEach(placeholderEquation => minimizedEquations.push({tree:placeholderEquation.replacePlaceholders(variables)}))

        let currentNode = hardwareAutomatonStructure.nodes[currentStateCounter]

        //fuege alle Asugaben / Steuersignalausgaben dem aktuellen Zustand / Knoten hinzu 
        //(da Knoten aufsteigend von 0 an eingefuegt wurden enttspricht der Index im Array der Zustandsnummer)
        for (let equationCounter = 0; equationCounter < minimizedEquations.length; equationCounter++) {
            //die ersten Gleichungen koodieren die Ausgabegleichungen 
            if (equationCounter < outputEquations.length) {
                //erstelle die neue Ausgabe (keine Fehler in abgeleiteten Ansichten)
                let outputPair:IOutputSignalPair = {varibableNumber:outputEquations[equationCounter].getVariable().getNumber() , equationErrorTupel:{validExpression: minimizedEquations[equationCounter] , error:undefined}} 
                // OutputSignalPair.createOutputSignalpair(outputEquations[equationCounter].getVariable().getNumber(), minimizedEquations[equationCounter])
                currentNode.outputAssignment.push(outputPair)
            }

            //alle weiteren koodieren die Steuersignalausgaben
            else {
                //Berechne den Index des Steuersignals in der Liste (offset der Laenge Ausgabegleichungsliste abziehen)
                let controlSignalEquationIndex = equationCounter - outputEquations.length
                // console.log(minimizedEquations[equationCounter]);
                
                //erstelle die neue Ausgabe fuer das Steuersignal (keine Fehler in abgeleiteten Ansichten)
                let controlSignalPair = {varibableNumber:controlSignalEquations[controlSignalEquationIndex].getVariable().getNumber() , equationErrorTupel:{validExpression: minimizedEquations[equationCounter] , error:undefined}} 
                // let controlSignalPair = ControlSignalPair.createControlSignalPair(controlSignalEquations[controlSignalEquationIndex].getVariable().getNumber(), minimizedEquations[equationCounter])
                
                currentNode.controlSignalAssignment.push(controlSignalPair)
            }
        }
        // der aktuelle Zustand ist fertig bearbeitet und vollstaendig im Automaten 
    }

    //Minimiere die Werteverlaufe aller Kanten 
    let placeHolderTransitionExpressions = minimizeTruthTable(transitionTruthTable)
    //Reihenfolge der minimierten Gleichungen entspricht der der Spalten in der Tabelle (siehe Schema oben)
    //ersetze alle Platzhalter mit den Variablen (Reihenfolge der Variablen in der List muss noch der zuer Erstellung der Sytsembelegung entsprechen)
    let minimizedEquations: Array<ICompleteTreeRoot> = [];
    placeHolderTransitionExpressions.forEach(placeholderEquation => minimizedEquations.push({tree:(placeholderEquation.replacePlaceholders(variables))}))

    //laufe ueber alle minimierten Kantenbedingungen aus Z x Z
    //teile den Laufindex wieder in den Startzustand Z_i und den Endzustand Z_j aus dem Tupel (Z_i -> Z_j) auf
    // die Kante von (Z_i -> Z_j) wird in der Spalte/ der Gleichung mit Index: startState*(Anzahl Zustaende) + Endstate koodiert
    let currentId = 0
    for (let startState = 0; startState < stateCount; startState++) {
        for (let endState = 0; endState < stateCount; endState++) {
            //berechne den Index der Spalte/ der Gleichung fuer diese Transition
            let collumIndex = startState * stateCount + endState
            //extrahiere die Gleichung
            let currentTransitionExpression = minimizedEquations[collumIndex]

            // //greife start und Endknoten
            // let startNode = hardwareAutomatonStructure.nodes[startState]
            // let endNode = hardwareAutomatonStructure.nodes[endState]

            // let transitionPoints = calculateShortestPath(startNode.position, endNode.position);

            // //einfuegen der aktuellen Kante (Zustandsnummer und Index innerhalb der Knotenliste sind gleich)
            // hardwareAutomatonStructure.transitions.push(new Transition(currentId,startState, transitionPoints.transitionStart, endState, transitionPoints.transitionEnd, undefined, currentTransitionExpression))
            //beim Automatischen generieren der Kantenbedingungen treten keine Fehler auf, da die Kanten der Desginautomaten immer valide gehalten werden
            hardwareAutomatonStructure.transitions.push({ id: currentId, fromNodeId: startState, toNodeId: endState, condition: {validExpression: currentTransitionExpression , error:undefined} }) 
            currentId++

        }
    }


    //Automaten ausgeben
    return hardwareAutomatonStructure

}

/**
 * Berechne den naechsten Zustand anhand eines Sets an z-Gleichungen und einer Systembelegung
 * @param zEquations Liste der z-Gleichungen anhand derer der Folgezustand berechnet werden soll
 * @param systemAssignment Systembelegung fuer die die Gleichungen ausgewertet werden sollen
 * @returns Nummer des Folgezustandes
 */
export function calculateNextStateFromEquations(zEquations: Array<ZEquation>, systemAssignment: DerivedSystemAssignment): number {
    //initial: 0 als naechster Zustand
    let nextStateNumber = 0;
    //berechne das Ergebnis jeder z-Gleichung und setze den Folgezustand aus der Superposition der Beitraege der einzelnen Gleichungen zusammen
    zEquations.forEach(currentZEquation => {
        //Berechne die aktuelle Gleichung
        let result =CompleteTreeRoot.evaluate(currentZEquation.equation,systemAssignment)
        //Addiere den Beitrag zum Folgezustand (wenn result = true , dann muss auf den Folgezustand 2^(Index der z-Variablen der Gleichung) addiert werden)
        if (result) {
            nextStateNumber = nextStateNumber + (1 << currentZEquation.getVariable().getNumber())
            // + Math.pow(2, currentZEquation.variable.getNumber())
        }
    })
    return nextStateNumber
}

/**
 * 
 * Platziere alle Strukturelemente entspechend der Vorgaben auf der Zeichenflaeche (in place):
 *      -Ist die Position durch den Nutzer speziell definiert (besitzt einen Eintrag in der Positionsliste) so muss diese ubernommen werden 
 *      -Ist dies nicht der Fall, so uebernimm im Falle der Knoten die Position aus der Liste der Vorlagen (falls der Knoten dort existiert) und platziere die Kanten automatisch
 *       (wird ein Zustand durch mehrere Knoten koodiert, so ubernimm die Position des Knotens der weiter vorn in der Liste der Vorlageknoten liegt)
 *      -sind eventuelle Knoten nicht in der Liste der Vorlagen enthalten, so platziere ihne automatisch 
 * @param elementsToPlace Sammlung aller zu platzierender Elemente (werden in place Platziert)
 * @param templateAutomatonStructure Automatenstruktur die als Vorlage verwendet wird um ggf. daraus Positionen zu uerbernehmen, falls keine Nutzervorgaben existieren (i.A der Designautomat)
 * @param fixedPositions Tupel mit allen vom Nutzer vorgegebenen Positionen von Knoten und Kanten
 */
export function placeStatesAndTransitions(elementsToPlace: RawAutomatonStructure, templateAutomatonStructure: AutomatonStructure,
    fixedPositions: AutomatonPositionStructure): AutomatonStructure {

    /**
       *  platziere jeden Zustand entspechend der Vorgaben auf der Zeichenflaeche:
       *      -Ist seine Position durch den Nutzer speziell definiert (besitzt einen Eintrag in der Liste der Positionen) so muss diese ubernommen werden 
       *      -Ist dies nicht der Fall, so pruefe ob der Zustand durch einen Knoten im originalen Automaten repraesentiert wird --> Wenn ja uebernimm seine Position
       *       (wird ein Zustand durch mehrere Knoten koodiert, so ubernimm die Position des Knotens der weiter vorn in der Liste der Knoten liegt)
       *      -Ist dies auch nicht der Fall (Zustand existiert nur im HW-Automaten ohne Knoten im original- Automaten) so platziere ihne automatisch 
       */
    let placedStucture: AutomatonStructure = { id: elementsToPlace.id, nodes: [], transitions: [] }

    let templateNodes = templateAutomatonStructure.nodes //Knoten deren Anordnung ggf. als Vorlage verwendet wird
    let templateTransitions = templateAutomatonStructure.transitions //Kanten deren Anordnung ggf. als Vorlage verwendet wird
    let templateMatches: Array<TemplateMatch> = [] //Liste in der festgehalten wird, welcher Knoten ggf. anhand welcher Vorlage platziert wurde
    //--> alle Kanten die zwischen Knoten, deren Position aus der Vorlage uerbenommen wurde, verlaufen koennen in ihrem Verlauf ebenfalls uebernommen werden

    //Laufe ueber alle zu platzierenden Zustaende
    //Liste fuer alle Zustaende die keine nutzerdefinierte Position haben, und keinen Vorlageknopten im Designautomaten besitzen --> werden am Ende automatisch platziert
    let nodesToPlaceAutomated: Array<Node> = []
    for (let stateCounter = 0; stateCounter < elementsToPlace.nodes.length; stateCounter++) {
        //Greife den aktuellen Zustand 
        let currentState = elementsToPlace.nodes[stateCounter]
        let placedNode = new Node(currentState.id, currentState.customStateNumber)
        placedNode.outputAssignment = currentState.outputAssignment
        placedNode.controlSignalAssignment = currentState.controlSignalAssignment
        placedNode.completenessInfo = currentState.completenessInfo
        placedNode.contradictionInfo = currentState.contradictionInfo
        placedNode.templateNodeIds = [] //speichere hier die IDs aller Knoten des Designautomaten welche den gleichen Zustand wie der abgeleitete Knoten darstellen

        //Finde alle Knoten im Designautomaten, die diesen Zustand koodieren
        let matchNodes = templateNodes.filter(node => node.customStateNumber.validNumber === currentState.customStateNumber.validNumber)
        //Speichere in dem platzierten Knoten die IDs aller Vorlageknoten die den gleichen Zustand darstellen
        matchNodes.forEach(currentMatch => placedNode.templateNodeIds?.push(currentMatch.id)) //ID-Liste existiert immer, da oben angelegt

        //Pruefe ob fuer diesen Zustand eine nutzerdefinierte Position im vorgegeben wurde (Wenn ja gibt es einen Eintrag in der Liste der StatePositions)
        let positionRequirementMatchIndex = fixedPositions.nodePositions.findIndex(state => state.id === currentState.customStateNumber.validNumber) // ID ist in diesen Listen die Zustandsnummer
        if (positionRequirementMatchIndex > -1) {
            //Der Nutzer hat eine Position fuer diesen Zustand vorgegeben --> uebernimm sie
            placedNode.position = fixedPositions.nodePositions[positionRequirementMatchIndex].position
        }
        else {
            //Es wurde keine Position vorgegeben --> Pruefe ob es einen Knoten im original Automaten gibt der diesen Zustand koodiert 
            // Wenn ja uebernimm dessen Position (kommen mehrere Knoten in Frage so waehle den der weiter vorn in der Liste der Knoten steht)
            let matchNode = matchNodes[0]
            if (matchNode !== undefined) {
                //Es existiert mindestens ein Knoten der diesen Zustand koodiert --> uebernimm seine Position (des ersten Treffers)
                let templateNode = matchNode
                placedNode.position = templateNode.position
                //Speichere das Tupel aus dem platzierten Knoten und dem Vorlageknoten in der Liste aller Knoten, die anhand von Vorlagen platziert wurden
                templateMatches.push({ placedNodeId: currentState.id, templateNodeId: templateNode.id })

            }
            else {
                //Es liegt ein Zustand vor der nur im HW-Automaten existiert --> 
                //  speichere ihn zwischen um ihn am Ende automatisiert zu platzieren (anhand der Positionen aller bereits platzierten Knoten)
                nodesToPlaceAutomated.push(placedNode)
            }

        }
        //Speichere den platzierten Knoten
        placedStucture.nodes.push(placedNode)

    }
    //Alle Knoten, die Vorgaben fuer ihre Lage hatten wurden platziert --> platziere alle uebrigen guenstig automatisch
    nodesToPlaceAutomated.sort((a, b) => a.id - b.id) //Sortieren, damit die Reihenfolge in der die Knoten platziert werden bei gleichen Randbedingungen gleich ist
    nodesToPlaceAutomated.forEach(nodeToPlace => {
        nodeToPlace.position = optimalNodePlacement(placedStucture.nodes) //platziere den Knoten
        placedStucture.nodes.push(nodeToPlace) //Speichere seine Lage
    })



    //platziere alle berechneten Kanten zwischen den zuvor platzierten Zustaenden
    //Laufe ueber alle gegebenen Kanten
    for (let transitionCounter = 0; transitionCounter < elementsToPlace.transitions.length; transitionCounter++) {
        let currentTransition = elementsToPlace.transitions[transitionCounter] //greife die aktuelle Kante

        let placedPosition: Bezier | undefined

        //pruefe ob die Kante eine fixierte Position besietzt --> wenn ja uebernimm sie 
        let transitionMatchIndex = fixedPositions.transitionPositions.findIndex(transition =>
            currentTransition.fromNodeId === transition.fromNodeId && transition.toNodeId === currentTransition.toNodeId)
        if (transitionMatchIndex > -1) {
            //die Kante wurde fixiert --> uebernimm die vorgegbenen Werte
            placedPosition = fixedPositions.transitionPositions[transitionMatchIndex].bezier

        }
        else {
            //Kante war nicht fixiert --> platziere sie automatisch
            //preufe ob ihr Anfangs- und Endknoten ggf. anhand der Vorlage platziert wurde. 
            //Wenn ja kann die Position einer eventuell existenten Vorlagekante zwischen diesen beiden Knoten uerbernommen werden

            //Finde heraus ob die Anfangs- und Endknoten der aktuellen Kante anhand von Vorlagen platziert wurden
            let fromNodeTempleteMatch = templateMatches.find(templateMatche => templateMatche.placedNodeId === currentTransition.fromNodeId)
            let toNodeTempleteMatch = templateMatches.find(templateMatche => templateMatche.placedNodeId === currentTransition.toNodeId)
            let templateTransition //Variable fuer eventuelle Kante die als Vorlage verwendet werden Kann
            if ((fromNodeTempleteMatch !== undefined) && (toNodeTempleteMatch !== undefined)) {
                let templateFromNodeId = fromNodeTempleteMatch.templateNodeId
                let templateToNodeId = toNodeTempleteMatch.templateNodeId
                //beide Knoten wurden anhand von Vorlagen paltziert 
                // pruefe ob es eine Kante innerhalb der Vorlagekanten zwischen diesen beiden Knoten gibt, deren Verlauf uebernommen werden koennte
                templateTransition = templateTransitions.find(transition => transition.fromNodeId === templateFromNodeId && transition.toNodeId === templateToNodeId)
            }
            if (templateTransition !== undefined) {
                //Es existiert eine Kante als Vorlage --> uebernimm ihre Position
                placedPosition = templateTransition.bezier
            }
            else {
                //es existiert keine verwendbare Vorlage --> platziere die Kante automatisch
                //greife den Anfangs- und Endzustand der aktuellen Kante (da die struktur des Automaten berechent wurde, muessen alle Zustaende, die in Kanten auftauchen auch eindeutig existieren)
                let fromNode = placedStucture.nodes.find(node => node.id === currentTransition.fromNodeId) //sollte immer existieren
                let toNode = placedStucture.nodes.find(node => node.id === currentTransition.toNodeId) //sollte immer existieren

                if ((fromNode !== undefined) && (toNode !== undefined)) {
                    //Sollte bei validen uebergebenen Listen immer der Fall sein
                    //berechne die Lage der Kante anhand der Positionen dieser beiden Knoten

                    //  platziere die Kante entsprechend


                    placedPosition = calculateTransitionBezier(fromNode, toNode)
                    // console.log("hallo")

                }
                else { //sollte nie passieren
                    // console.log("transition skipped")
                }
            }


        }
        if (placedPosition !== undefined) {
            //Die Kante wurde nicht uebersprungen --> platziere sie

            placedStucture.transitions.push(new Transition(currentTransition.id, currentTransition.fromNodeId, placedPosition.startPoint,
                currentTransition.toNodeId, placedPosition.endPoint, placedPosition.supportPoint, currentTransition.condition))
        }


    }

    return placedStucture
    //Alle Elemente wurden paltziert


}

/** Tupel welches speichert welcher Vorlageknoten als Vorlage fuer die Position eines platzierten Knotens diente */
interface TemplateMatch {
    /** Id des Knotens der anhand der Vorlage platziert wurde */
    placedNodeId: number
    /** Id des Knotens der als Vorlage fuer die Platzierung des zu platzierenden Knotens genutzt wurde  */
    templateNodeId: number
}