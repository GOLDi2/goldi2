
import { immerable } from "immer"
import { checkForOwnControlSignals, getAllzVariableNamesFromExpression } from "../../actioncreator/helperfunctions"
import { CurrentStateTupel } from "../ApiClasses/SystemAssignment"
import { UiAutomatonData } from "../Automaton"
import { binaryStringToTreeErrorTupel } from "../BooleanEquations/BinaryStringToTree"
import { CustomNames } from "../BooleanEquations/CustomNames"

import { ConstantType, VariableTyp } from "../BooleanEquations/LogicTrees/TreeNodeInterfaces"
import { CompleteTreeRoot, ICompleteTreeRoot } from "../BooleanEquations/LogicTrees/TreeRoots"
import { CompleteTreeConstantNode } from "../BooleanEquations/LogicTrees/Variables"
import { ExpressionSyntaxError, OutputSignalExpressionVariableError, OwnControlSignalsExpressionError, TransitionExpressionVariableError, UnknownVariableInExpressionError, OutputVariableInExpressionError, VariableTypeTupel } from "../Error"
import { ExpressionErrorTupel } from "../ErrorElements"
import { Node, NodePosition, RawNode } from "../Node"
import { Bezier } from "../Points"
import { RawTransition, TransitionPosition } from "../Transition"
import { HasID, StorageObject } from "./NormalizedObjects"
import { NameTupel } from "./SignalSubState"

/** Teil des States der alle Informationen bezueglich der Automaten speichert */
export interface AutomatonSubState {

    /**
     * Speichern der Grundgerueste aller Automaten 
     * Ordnet zwar jedem Automaten all seine Bestandteile via Ids zu, aber diese muessen noch aus den anderen Teilen des States extrahiert werden
     */
    automatonFrameWorks: AutomatonFrameWork

    /** Speicher fuer alle Informationen bezueglich aller Knoten im System */
    nodeSubState: NodeSubState

    /** Speicher fuer alle Informationen bezueglich aller Kanten im System */
    transitionSubState: TransitionSubState

}

/**
 * Erstelle einen neuen Substat fuer alle Informationen bezueglich der Automaten (initial leer)
 */
export function createAutomatonSubState(): AutomatonSubState {
    return { automatonFrameWorks: createAutomatonFramework(), nodeSubState: createNodeSubState(), transitionSubState: createTransitionSubState() }
}

/**
 * Speichern der Grundgerueste aller Automaten 
 * Ordnet zwar jedem Automaten all seine Bestandteile via Ids zu, aber diese muessen noch aus den anderen Teilen des States extrahiert werden
 */
export interface AutomatonFrameWork {
    /** 
     * Liste mit den IDs aller aktuell existenten Automaten
     * Diese dienen gleichzeitig als Key innerhalb aller Speicherobjekte auf dieser Ebene fuer die entsprechenden Informationen zu den Automaten
     */
    automatonIDs: Array<number>


    /**
     * Objekt ("Liste") zum Speichern der Darstellungsrelevanten Inforamtionen aller Automaten
     * Die Informationen zum Automaten mit ID: i sind als Eintrag mit dem key i abgelegt
     */
    uiAutomatonData: StorageObject<UiAutomatonData>

    /**
      * Objekt ("Liste") zum Speichern der aktuellen Zustaende aller Automaten
      * Die Informationen zum Automaten mit ID: i sind als Eintrag mit dem key i abgelegt
      */
    currentStates: StorageObject<CurrentStateTupel>

    /**
     * Objekt ("Liste") zum Speichern der Knotenlisten aller Automaten
     * Die Liste der Knoten des Automaten mit ID: i sind als Eintrag mit dem key i abgelegt
     */
    nodeLists: StorageObject<NodeList>

    /**
    * Objekt ("Liste") zum Speichern der Kantenlisten aller Automaten
    * Die Liste der Kanten des Automaten mit ID: i sind als Eintrag mit dem key i abgelegt
    */
    transitionLists: StorageObject<TransitionList>

    /**
   * Objekt ("Liste") zum Speichern der Steuersignale aller Automaten
   * Die Liste der Steuersignale des Automaten mit ID: i sind als Eintrag mit dem key i abgelegt
   */
    controlSignalLists: StorageObject<ControlSignalList>

    /**
    * Objekt ("Liste") zum Speichern der Namen der Steuersignale aller Automaten
    * Die Liste der Namen der Steuersignale des Automaten mit ID: i sind als Eintrag mit dem key i abgelegt
    * Innerhalb der Liste wird das Signal mit Id i unter key i abgelegt
    */
    controlSignalNameLists: StorageObject<ControlSignalNameList>

    /**
     * Objekt ("Liste") zum Speichern der Positionen der Hardwareknoten aller Automaten
     * Die Positionen der HardwareKnoten des Automaten mit ID: i sind als Eintrag mit dem key i abgelegt
     * 
     * Liste mit den Positionen aller Zustaende im Hardwareautomaten, die temporaer oder permanent an einer Position fixiert wurden
     *  --> Hierbei wird die id des Knotens(identisch zu seiner Zustandsnummer) gespeichert 
     * 
     * Zuastaende deren Postion hier abgelegt ist werden beim naechsten Aufruf des Selektors fuer die Hardwareautomaten an der angegebenen Stelle platziert
     * Fuer Zustaende ohne Eintrag in dieser Liste gibt es aktuell keine Positionsvorgaben weshalb sie automatisch platziert werden koennen (entweder gemeass der Position ihres
     *  Vorlageknotens im Desginautomaten oder durch den Platzierungsalgortihmus)
     * 
     * Unterscheidung:
     *  1. temporaer fixiert Zustaende:
     *      Ihre Positionsangabe ist mit einem Flag "tempFixed" markiert 
     *      Betrifft nur Zustaende die keine Vorlage im Designautomaten haben und noch nicht durch den Nutzer platziert wurden
     *      Die Positionsangabe ist nicht vom Nutzer gefordert (sondern Resultat einer vergangenen automatischen Platzierung), soll jedoch trotzdem bei der naechsten Neuzeichnung des Automaten
     *      verwendet werden
     *      Eine solche Fixierung verhindert, dass sich der Zustand nach einer Verschiebung in der abgeleiteten Ansicht automatisch neu platziert 
     *      (Verschiebung eines Knotens im Hardwareautomaten soll nur diesen Beeinflussen)
     *      Eine solche Fixierung wird wahrend einer Verschiebung von Knoten im Designautomaten geloescht um zu ermoeglichen, dass der temporaer fixierte Knoten nach einer Umgestaltung des Designautomaten
     *      , welche in der Umpositionierung von Hardwarezustaenden resultieren kann, entsprechend neupositioniert wird  
     * 
     *  2. permanent fixierte Zustaende:
     *      Bei der Positionsangabe ist das Flag "tempFixed" nicht gesetzt 
     *      Betrifft nur Zustaende die explizit im Hardwareautomaten durch den Nutzer platziert wurden
     *      Die Positionsangabe ist  vom Nutzer gefordert und soll in jedem Fall beibehalten werden
     *      Eine solche Fixierung verhindert, dass sich der Zustand nach einer Verschiebung in der abgeleiteten Ansicht oder im Hardwareautomaten automatisch neu platziert 
     *      (Zustand in jedem Fall in seiner Position fixiert)
     * 
     */
    hardwareStatePositions: StorageObject<DerivedViewNodePositions>

    /** analog zu {@link hardwareStatePositions} fuer die Zustaende der fusionierten Ansicht */
    fusionStatePositions: StorageObject<DerivedViewNodePositions>



    /**
    * Objekt ("Liste") zum Speichern der Positionen der Hardkanten aller Automaten
    * Die Positionen der HardwareKanten des Automaten mit ID: i sind als Eintrag mit dem key i abgelegt
    * 
    * Wird eine Kante des zu diesem Automaten zugehoerigen Hardwareautomaten verschoben, so soll diese Verschiebung permanent gespeichert werden
    * Speichere also fuer alle Kanten , die nicht an der Position liegen sollen, an der sie bei der Berechnung des Hardwareautomaten auf Basis der Positionen
    * der Knoten dieses Automaten landen wuerden, ihre jewilige gewunschte Position 
    * Die Kanten werden mit diesem Verlauf "angepinnt" und werden nicht mehr autoamtisch verschoben/veraendert
    * Hierbei werden die ids der Anfangs- und Endknoten der Kante (identisch zu deren Zustandsnummer) gespeichert 
    * 
    * In der Liste bleiben auch Eintrage fuer Kanten, die gerade eventuell nicht mehr im HW-Automaten existieren wuerden (z.B zwischen nicht mehr existenten Zustaenden)
    * Alle Kanten die nicht in der Liste aufgefuehrt sind werden automatisch anhand der ihnen zugeordneten Knoten paltziert
    */
    hardwareTransitionPositions: StorageObject<DerivedViewTransitionPositions>



    /** analog zu {@link hardwareTransitionPositions} fuer die Kanten der fusionierten Ansicht */
    fusionTransitionPositions: StorageObject<DerivedViewTransitionPositions>

}
/** Erstelle einen Leeren Substate fuer die Gerueste der Automaten */
export function createAutomatonFramework(): AutomatonFrameWork {
    //inital: keine Eintrage
    return {
        automatonIDs: [], nodeLists: {}, transitionLists: {}, uiAutomatonData: {}, fusionStatePositions: {}, fusionTransitionPositions: {}, hardwareStatePositions: {},
        hardwareTransitionPositions: {}, currentStates: {}, controlSignalLists: {}, controlSignalNameLists: {}
    }
}



export interface NodeList extends HasID {
    /** Id des Automaten zu dem diese Knotenliste gehoert */
    id: number

    /** Liste mit den Ids aller Knoten die zu diesem Automaten gehoeren */
    nodeIds: Array<number>
}


export interface TransitionList extends HasID {
    /** Id des Automaten zu dem diese Kantenliste gehoert */
    id: number

    /** Liste mit den Ids aller Kanten die zu diesem Automaten gehoeren */
    transitionIds: Array<number>
}

export interface DerivedViewNodePositions extends HasID {
    /** Id des Automaten zu dem die Positionen der Hw-Elemente  gehoert */
    id: number

    /** Liste mit den Positionsangaben fuer die fixierten Knoten der abgeleiteten Ansicht (mit Angabe ueber eine temporaere oder permanente Fixierung)*/
    nodePositions: Array<FixedPosition>

}

export interface DerivedViewTransitionPositions extends HasID {
    /** Id des Automaten zu dem die Positionen der Hw-Elemente  gehoert */
    id: number

    /** Liste mit den Positionsangaben fuer die fixierten Kanten der abgeleiteten Ansicht */
    transitionPosition: Array<TransitionPosition>

}

export interface NodeSubState {

    /** 
    * Liste mit den IDs aller aktuell existenten Knoten
    * Diese dienen gleichzeitig als Key innerhalb aller Speicherobjekte auf dieser Ebene fuer die entsprechenden Informationen zu den Knoten
    */
    nodeIds: Array<number>

    /**
     * Objekt ("Liste") zum Speichern der Darstellungsrelevanten Inforamtionen (Positionen) aller Knoten
     * Die Informationen zum Knoten mit ID: i sind als Eintrag mit dem key i abgelegt
     */
    nodePositions: StorageObject<NodePosition>

    /**
     * Objekt ("Liste") zum Speichern der logik-relevanten Inforamtionen aller Knoten (Zustandsnummer und Ausgaben)
     * Die Informationen zum Knoten mit ID: i sind als Eintrag mit dem key i abgelegt
     */
    logicInformation: StorageObject<RawNode>

    /**
    * Objekt ("Liste") zum Speichern der Namen aller Knoten 
    * Die Informationen zum Knoten mit ID: i sind als Eintrag mit dem key i abgelegt
    */
    names: StorageObject<NameTupel>
}

/** Erstelle einen neuen Substate fuer die Informationen zu allen Knoten (initial leer) */
export function createNodeSubState(): NodeSubState {
    //Initial keine Eintraege
    return { nodeIds: [], logicInformation: {}, nodePositions: {}, names: {} }
}

export interface TransitionSubState {
    /** 
    * Liste mit den IDs aller aktuell existenten Kanten
    * Diese dienen gleichzeitig als Key innerhalb aller Speicherobjekte auf dieser Ebene fuer die entsprechenden Informationen zu den Kanten
    */
    transitionIds: Array<number>

    /**
    * Objekt ("Liste") zum Speichern des Verlaufs der Kanten (welche Knoten werden durch welche Kante verbunden?)
    * Die Informationen zur Transition mit ID: i sind als Eintrag mit dem key i abgelegt
    */
    transitionNodeData: StorageObject<TransitionNodeData>

    /**
     * Objekt ("Liste") zum Speichern der Darstellungsrelevanten Inforamtionen (Positionen) aller Transitionen
     * Die Informationen zur Transition mit ID: i sind als Eintrag mit dem key i abgelegt
     */
    transitionPositions: StorageObject<TransitionPositionNormalized>

    /**
     * Objekt ("Liste") zum Speichern der logik-relevanten Inforamtionen aller Kanten (logische Bedingung)
     * Die Informationen zum Knoten mit ID: i sind als Eintrag mit dem key i abgelegt
     */
    logicInformation: StorageObject<RawTransitionNormalized>
}

/** Erstelle einen neuen Substate fuer die Informationen zu allen Kanten (initial leer) */
export function createTransitionSubState(): TransitionSubState {
    //Initial keine Eintraege
    return { transitionIds: [], logicInformation: {}, transitionNodeData: {}, transitionPositions: {} }
}



/**
* Speichert fuer jede Transition welche Knoten durch diese verbunden werden
*/
export interface TransitionNodeData extends HasID {
    /** Id der Transition */
    id: number

    /**Id des Startknotens der Kante */
    fromNodeId: number;

    /**Id des Endknotens der Kante */
    toNodeId: number;
}

/**
* Darstellung des Verlaufs einer Kante (nur die grafischen Informationen)
*/
export interface TransitionPositionNormalized extends HasID {
    /** Id der Transition */
    id: number

    /** Paramtersatz zur Darstellung der Kante als Bezierkurve vom Grad 2. Enthaelt:
     *      - Koordinaten des Anfangspunktes relativ zum Startknoten (Offset zur Position des Startknotenmittelpunktes)
     *      - Koordinaten des Endpunktes relativ zum Endknoten (Offset zur Position des Endknotenmittelpunktes)
     *      - Koordinaten des Stuetzpunktes relativ zum absoluten Startpunkt der Kante und normiert auf die Distanz zwischen dem absoluten Start- und Endpunkt der Kante (Laenge der Kante)
    */
    bezier: Bezier

}



/**
 *  Darstellung einer Kante nur anhand ihrer logik-relevanten Parameter (keine Informationen zur Darstellung)
 */
export interface RawTransitionNormalized extends HasID {

    /** Id der Transition */
    id: number

    /**logischer Ausdruck fuer die Transition als Baum mit eienem eventuell aufgetretenen Fehler --> darf keine z-Variablen beinhalten*/
    condition: ExpressionErrorTupel<UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | TransitionExpressionVariableError | OwnControlSignalsExpressionError>;

}
/**
 * Erstelle eine Parameterdarstellung einer Kante
 * @param id Id der Kante
 * @param condition logischer Ausdruck fuer die Transition als Baum (darf keine z-Variablen enthalten) (bei einem ungueltigen Ausdruck oder Nichtangabe wird die backup-Bedingung verwendet)
 * @param customNames nutzerdefinierte Namen im System
 * @param backupCondition Logische Bedingung die im Falle eines Fehlers oder Nichtangabe der Bedingung verwendet werden soll
 * @param automatonId Id des Automaten zu dem die Kante gehoert
 * @returns Logik-Darstellung der Kante mit der vorgegbenen Bedingung und einem eventuell enstandenen Fehler
 */
export function createRawTransitionNormalized(id: number, customNames: CustomNames, backupCondition: ICompleteTreeRoot, automatonId: number, condition?: string): RawTransitionNormalized {

    //bei Nichtangabe wird die Bedingung zu logisch 1 gesetzt --> enhaelt keine zVariablen
    let expressionErrorTupel: ExpressionErrorTupel<TransitionExpressionVariableError | ExpressionSyntaxError | UnknownVariableInExpressionError | OutputVariableInExpressionError | OwnControlSignalsExpressionError>

    //wurde keine Bedingung angegeben, so setze die Standardbedingung
    if (condition === undefined) {
        expressionErrorTupel = { validExpression: backupCondition, error: undefined } //kein Fehler
    }
    else {
        //es wurde eine Bedingung angegeben --> versuche sie zu parsen


        //lies den Ausdruck ein und fange eventuelle Fehler beim parsen ab
        //erweitere die moeglichen Fehlertypen im Ergbnis um den Fehler bzgl. der Kante damit das Ergbnis direkt im State gespeichert werden kann
        expressionErrorTupel = binaryStringToTreeErrorTupel(condition, backupCondition, customNames)


        //preuefe ob der Ausdruck keine zVariablen beinhaltet --> Wenn doch: Fehler
        if (CompleteTreeRoot.containsZVariables(expressionErrorTupel.validExpression)) {
            //suche die ungueltigen Variablen (zVariablen)
            let invalidVariables: Array<VariableTypeTupel<VariableTyp.zSignal>> = getAllzVariableNamesFromExpression(expressionErrorTupel.validExpression)


            //Speicher den Fehler im Ergebnis und setze den validen Ausdruck zu logisch 0 (backup von oben)
            expressionErrorTupel.error = new TransitionExpressionVariableError(condition, invalidVariables)
            expressionErrorTupel.validExpression = backupCondition

        }
        else {
            //wenn keine zVariablen enthalten waren preuefe ob der Ausdruck Steuersignale des eigenen Automaten enthaelt --> wenn ja: Fehler
            let controlSignalNames = checkForOwnControlSignals(expressionErrorTupel.validExpression, automatonId, customNames) //extrahiere alle Steuersignale des Automaten in fehlergerechter Darstellung
            if (controlSignalNames.length > 0) {
                //es waren eigene Steuersignale enthalten --> speichere sie und setze den validen Ausdruck zu logisch 0 (backup von oben)
                expressionErrorTupel.error = new OwnControlSignalsExpressionError(condition, controlSignalNames)
                expressionErrorTupel.validExpression = backupCondition
            }

        }

        //sonst:keine Fehler --> der eingegebene Ausdruck wird uebernommen
    }

    return { id: id, condition: expressionErrorTupel }
}

/** Darstellung aller Steuersginale eines Automaten */
export interface ControlSignalList extends HasID {

    /** Id des Automaten zu dem diesen Steuersignalen gehoert */
    id: number

    /** 
     * Liste mit den Ids aller Steuersignale die zu diesem Automaten gehoeren 
     * Die Id eines Signals wird gleichzeitig als Key in der Namensliste der Steuersignale dieses Automaten verwendet 
    */
    controlSignalIds: Array<number>

}


/** Darstellung aller Namen der Steuersginale eines Automaten */
export interface ControlSignalNameList extends HasID {

    /** Id des Automaten zu dem diesen Steuersignalen gehoert */
    id: number

    /**
     * Objekt ("Liste") zum Speichern der nutzerdefinierten Namen der Steuersignale dieses Automaten
     * Innerhalb der Liste befinden sich nur die Namen der Steuersginale dieses Automaten
     * Der Name des Signals s_i (mit Id i) dieses Automaten wird unter dem key i abgelegt
     */
    nameList: StorageObject<NameTupel>
}

/** Fixierung der Position eines Zustandes in einer abgeleiteten Ansicht */
export interface FixedPosition extends NodePosition {

    /** 
     * Flag als Indikator ob eine temporaere oder permanente Fixierung des Zustandes gemaess der Interpretation in {@link AutomatonFrameWork} vorliegt 
     * ist False falls eine permanente Fixierung vorliegt
    */
    tempFixed: boolean
}


export function createFixedPosition(nodePosition: NodePosition, tempFixed: boolean): FixedPosition {
    return { id: nodePosition.id, isActive: nodePosition.isActive, radius: nodePosition.radius, position: nodePosition.position, tempFixed: tempFixed }

}