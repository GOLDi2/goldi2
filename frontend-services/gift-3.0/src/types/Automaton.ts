import { IdSelector } from '@reduxjs/toolkit';
import { fromPairs } from 'lodash';
import { ControlSignal } from './ControlSignal';
import { ApiNode, Node, NodePosition, RawNode } from './Node';
import { RawTransition, Transition, TransitionPosition } from './Transition';
import { immerable } from 'immer'
import { ApiAutomaton } from './ApiClasses/GraphRepresentation/Automaton';
import { CustomNames } from './BooleanEquations/CustomNames';
import { FullApiTransformable } from './ApiTransformable';
import { ApiTransitions } from './ApiClasses/GraphRepresentation/Transitions';
import { Bezier, Point } from './Points';
import { AutomatonViewConfig, MergedAutomatonViewConfig } from './NormalizedState/ViewConfig';
import { CompleteTreeTwoOperandOperatorNode } from './BooleanEquations/LogicTrees/Operators';
import { BaseCompleteTreeNode, ConstantType } from './BooleanEquations/LogicTrees/TreeNodeInterfaces';
import { CompleteTreeConstantNode } from './BooleanEquations/LogicTrees/Variables';
import { minimizeLogicTree } from './BooleanEquations/Minimizer/minimizeTree';
import { OperatorEnum } from './Operators';
import { DerivedAutomatonViews } from './view';
import { HasID } from './NormalizedState/NormalizedObjects';
import { is } from 'immer/dist/internal';
import { NameErrorTupel, NumberErrorTupel } from './ErrorElements';
import { NumberError, NumberResetError } from './Error';


/**
 * Darstellung der Struktur eines Automaten (seine Kanten und Knoten)
 */
export interface AutomatonStructure extends RawAutomatonStructure, HasID {
    /**Id des Automaten */
    id: number

    /**Liste aller Knoten */
    nodes: Array<Node>
    /**Liste aller Kanten */
    transitions: Array<Transition>

}
/**
 * Darstellung aller logik-relevanten Eigenschaften eines Automaten (keine Informationen zur grafischen Darstellung)
 */
export interface RawAutomatonStructure extends HasID {
    /**Id des Automaten zu dem die Eintraege gehoeren */
    id: number
    /** Logik-relevante Daten der Knoten */
    nodes: Array<RawNode>

    /**Logik-relevante Daten der Kanten */
    transitions: Array<RawTransition>

}


/** Tupel fuer die Darstellung der Postionen aller Elemente eines Automaten */
export interface AutomatonPositionStructure extends HasID {
    /**Id des Automaten zu dem die Eintraege gehoeren */
    id: number
    /**Positionen der Knoten */
    nodePositions: Array<NodePosition>

    /**Postionen der Kanten */
    transitionPositions: Array<TransitionPosition>

}
/** Container aller fuer die Darstellung relevanten Informationen eines Automaten  */
export interface UiAutomatonData extends HasID {
    /**Id des Automaten */
    id: number

    /** Individueller Name des Automaten */
    name: NameErrorTupel;

    /** genauere Beschreibung der Funktion oder weitere Informationen*/
    info: string;

    /** Initialzustand bei Start des Automaten*/
    initialStateNumber: NumberErrorTupel<NumberError | NumberResetError> ;

    /**Ist der Automat innerhalb der GUI aktiv ? */
    isActive: boolean;

}

/**
     * Erstellung einer neuen Ui-Automaten Darstellung
     * @param name nutzerdefinierter Name des Automaten 
     * @param id Id des Automaten (eindeutig innerhalb aller Automaten)
     * @param info Beschreibung des Automaten (bei Nichtangabe leer)
     */
export function createUiAutomatonData(name: NameErrorTupel, id: number, info: string, isActive: boolean, initialState: NumberErrorTupel<NumberError | NumberResetError>): UiAutomatonData {
    return { id: id, name: name, info: info, isActive: isActive, initialStateNumber: initialState }

}

/**
 * Erweitert {@link UiAutomatonData} um den aktuellen Zustand des Automaten
 */
export class AutomatonMetaData implements UiAutomatonData {


    [immerable] = true;

    /**Id des Automaten */
    id: number

    /** Individueller Name des Automaten */
    name: NameErrorTupel;

    /** genauere Beschreibung der Funktion oder weitere Informationen*/
    info: string;

    /** Initialzustand bei Start des Automaten*/
    initialStateNumber: NumberErrorTupel<NumberError | NumberResetError>;

    /**Ist der Automat innerhalb der GUI aktiv ? */
    isActive: boolean;

    /** Steuervariablen des Automate */
    controlSignals: Array<ControlSignal>

    /** aktueller Zustand (im Hardwarefall identisch zum Konzept:Knoten) als Bearbeitungszustand*/
    currentStateNumber: number;

    constructor(uiData: UiAutomatonData, currentState: number, controlSignals: Array<ControlSignal> = []) {
        this.id = uiData.id
        this.name = uiData.name 
        this.info = uiData.info
        this.isActive = uiData.isActive
        this.initialStateNumber = uiData.initialStateNumber
        this.currentStateNumber = currentState
        this.controlSignals = controlSignals
    }

}

/**
 * Berechne den Namen, der einer abgeleiteten Darstellung dieses Automaten gegben werden soll
 * @param derivedForm Art des abgeleiteten Automaten fuer den der Name gesucht ist
 * @param designAutomaton Automat feur den der Name berechnet werden soll
 * @returns Name des von diesem Automaten abgeleiteten Automaten
*/
export function getDerivedAutomatonName(designAutomaton: AutomatonMetaData, derivedForm: DerivedAutomatonViews): string {
    //Bisher: immer den gleichen Namen uebernehmen
    return designAutomaton.name.validName
}

/**
 * Vollständige Darstellung eines Automaten als Knotenliste und Transitionstabelle
 * Enthaelt alle weiteren Informationen zu von ihm abgleiteten Ansichten
 */
export class Automaton implements FullApiTransformable, AutomatonStructure, UiAutomatonData {
    [immerable] = true

    /**Id des Automaten */
    public id: number

    /** Individueller Name des Automaten */
    public name: NameErrorTupel;

    /** genauere Beschreibung der Funktion oder weitere Informationen*/
    public info: string;

    /** Initialzustand bei Start des Automaten*/
    public initialStateNumber: NumberErrorTupel<NumberError | NumberResetError>;

    /** aktueller Zustand (im Hardwarefall identisch zum Konzept:Knoten) als Bearbeitungszustand*/
    public currentStateNumber: number;

    /** Liste aller Knoten des Automaten*/
    public nodes: Array<Node>;

    /** Transitionstabelle */
    public transitions: Array<Transition>;

    /** Steuervariablen des Automate */
    public controlSignals: Array<ControlSignal>

    /**Ist der Automat innerhalb der GUI aktiv ? */
    public isActive: boolean;

    /**
     * Erstellung eines neuen Automaten mit einem Knoten
     * @param name nutzerdefinierter Name des Automaten 
     * @param id Id des Automaten (eindeutig innerhalb aller Automaten)
     * @param info Beschreibung des Automaten (bei Nichtangabe leer)
     */
    constructor(name: NameErrorTupel, id: number, info: string, initialStateNumber: NumberErrorTupel<NumberError | NumberResetError>, currentStateNumber: number, nodes: Array<Node>, transitions: Array<Transition>, controlSignals: Array<ControlSignal>
        , isActive: boolean) {
        this.id = id
        this.name = name
        this.info = info
        this.initialStateNumber = initialStateNumber,
            this.currentStateNumber = currentStateNumber,
            this.nodes = nodes
        this.transitions = transitions,
            this.controlSignals = controlSignals
        this.isActive = isActive

    }

    /**
     * Transformiere diesen Autoamten gemaess der aktuellen Konfiguration in seine Ausgabedarstellung
     * @param customNames nutzerdefinierte Namen die verwendet werden sollen
     * @param automatonViewConfig Konfiguration fuer die Automatendarstelllung
     * @param mergedAutomatonViewConfig Konfiguration fuer die Darstellung von Fusionsautomaten
     *      Sollte nur uebergeben werden, wenn es sich bei diesem Automatenum einen Fusionsautomaten handelt (geht aus Berechnungen hervor)
     * @returns externe Darstellung des Automaten in einer Liste (dies ist leer falls dieser Automat gemaess der aktuellen Konfiguration nicht transformiert werden soll)
     */
    toExternalGraphRepresentation(customNames: CustomNames, automatonViewConfig: AutomatonViewConfig, mergedAutomatonViewConfig?: MergedAutomatonViewConfig): Array<ApiAutomaton> {

        //Ergebnis der Transformation (ist leer falls der Automat gemaess der aktuellen Konfiguration nicht angezeigt werden soll)
        let transformedAutomaton: Array<ApiAutomaton> = []

        //Falls dieser Automat nicht aktiv ist, aber nur aktive Automaten transformiert werden sollen so tue nichts --> leere Ausgabe
        if (automatonViewConfig.onlyShowActiveAutomatons && !this.isActive) {
            //Automat ist nicht aktiv und soll daher nicht angezeigt werden --> tue nichts
        }
        else {
            //Automat soll angezeigt werden --> transfomiere ihn
            let apiNodes: Array<ApiNode> = []; //Liste fuer die transformierten Knoten
            let apiTransitions: Array<ApiTransitions> = [];// Liste fuer die transformierten Kanten


            //alle Knoten normal transformieren (jeder Knoten achtet auf die eventuelle Darstellung fuer Vollstaendigkeit und Widerspruchsfreiheit)
            for (let nodeCounter = 0; nodeCounter < this.nodes.length; nodeCounter++) {
                //Greife aktuellen Knoten
                let currentNode = this.nodes[nodeCounter]
                //Transformiere den aktuellen Knoten
                apiNodes.push(currentNode.toExternalGraphRepresentation(customNames, automatonViewConfig, this.id, mergedAutomatonViewConfig))
            }


            //Transformiere alle Kanten
            for (let transitionCounter = 0; transitionCounter < this.transitions.length; transitionCounter++) {
                //Greife aktuelle Kante
                let currentTransition = this.transitions[transitionCounter]
                //Transformiere die Kante --> hange das Ergebnis an die Liste an (Ergebnis ist leer falls die Kante gemaess der aktuellen Konfiguration nicht dargestellt werden soll)
                //Kantenbedingung muss ggf. minimiert werden (in der Kantenumwandlung enthalten)
                apiTransitions.push(...currentTransition.toExternalGraphRepresentation(customNames, automatonViewConfig, this.nodes,mergedAutomatonViewConfig?.minimizeExpressions))
            }

            transformedAutomaton = [new ApiAutomaton(this.id, this.name, this.info, this.initialStateNumber, apiNodes, apiTransitions, this.currentStateNumber)]
        }

        return transformedAutomaton
    }

    /**
     * Berechne den Namen, der einer abgeleiteten Darstellung dieses Automaten gegben werden soll
     * @param derivedForm Art des abgeleiteten Automaten fuer den der Name gesucht ist
    * @returns Name des von diesem Automaten abgeleiteten Automaten
        */
    getDerivedAutomatonName(derivedForm: DerivedAutomatonViews): string {
        //Bisher: immer den gleichen Namen uebernehmen
        return getDerivedAutomatonName(this, derivedForm)
    }

}


/**
 * Sind die Konzepte Knoten und Zustaende in dieser Knotenliste gleich? 
 * Dies ist der Fall falls es fuer jeden Zustand nur maximal einen Knoten gibt der ihn repraesentiert
 * @param nodeList Knotenliste fuer die die Eigenschaft gepreuft werden soll
 * @returns Sind die Konzepte Knoten und Zustaende in dieser Knotenliste gleich? 
 */
function nodesAndStatesEqual(nodeList: Array<Node>): boolean {
    let nodesAndStatesEqual = true //sind die Konzepte Knoten und Zustaende in dieser Knotenliste gleich (inital: true , wird bei Verstoessen zu false gesetzt)?
    //Preufe ob es fuer jeden Zustand maximal einen Knoten gibt --> laufe ueber alle Knoten
    for (let nodeCounter = 0; nodeCounter < nodeList.length; nodeCounter++) {
        //greife den aktuellen Knoten
        let currentNode = nodeList[nodeCounter]
        //gibt es mehrer Knoten die die Zusatndsnummer des aktuellen Knotens haben --> wenn ja sind die Konzepte verschieden
        if (nodeList.filter(node => node.customStateNumber.validNumber === currentNode.customStateNumber.validNumber).length > 1) {
            //mehrer Knoten fuer den gleichen Zustand --> Abbruch der SChleife moeglich
            nodesAndStatesEqual = false
            break
        }
    }
    return nodesAndStatesEqual
}
