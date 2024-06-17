import { AppActions } from '../types/Actions/appActions';
import { ADDACTIVEAUTOMATON, ADDACTIVENODE, ADDCONTROLSIGNAL, ADDGLOBALINPUT, ADDGLOBALOUTPUT, ADDNODE, ADDTRANSITION, CHANGEAUTOMATONNAME, CHANGECONDITION, CHANGECONTROLSIGNALNAME, CHANGECUSTOMOPERATOR, CHANGEENDPOINT, CHANGEGLOBALINPUTNAME, CHANGEGLOBALOUTPUTNAME, CHANGENODENUMBER, CHANGESTARTPOINT, CHANGESUPPORTPOINT, CHANGE_VIEW_STATE, COMPUTE_NEXT_CLOCK, MINIMIZE_ALL_EXPRESSIONS_IN_GRAPH, NEWAUTOMATON, REMOVEACTIVEAUTOMATON, REMOVEACTIVENODE, REMOVEAUTOMATON, REMOVECONTROLSIGNAL, REMOVEGLOBALINPUT, REMOVEGLOBALOUTPUT, REMOVENODE, REMOVE_REDUNDANT_BRACKETS_FROM_EXPRESSIONS, RESETCONTROLSIGNAL, RESETOUTPUT, RESET_GLOBAL_INPUT, SETAUTOMATONINFO, SETCONTROLSIGNAL, SETNODECORDS, SETOUTPUT, SET_DERIVED_AUTOMATON_STATE_CORDS, SET_GLOABL_INPUT, SET_GLOBAL_INPUT_DONT_CARE, SET_DERIVED_AUTOMATON_TRANSITION_CORDS, SET_INITIAL_STATE, REMOVE_TRANSITION, RESET_TO_INITAL_STATES, EXPAND_TRANSITION_MATRIX, SHRINK_TRANSITION_MATRIX, CHANGE_TRANSITION_MATRIX_ENTRY, REMOVE_TRANSITION_MATRIX_ENTRY, CHANGE_NODE_NAME, RESET_DERIVED_AUTOMATON_POSITIONS } from '../types/Actions/editorStateActions';
import { OperatorEnum } from '../types/Operators';
import { DerivedAutomatonViews, Viewstate } from '../types/view';
import { Point } from '../types/Points';
import { ApiNode, Node, NodePosition } from '../types/Node';
import { ApiTransitions } from '../types/ApiClasses/GraphRepresentation/Transitions';


//Alle Actions bezueglich des globalen EditorStates

/**
 * Wechseln der Ansicht
 * @param newView Ansicht zu der gewechselt werden soll
 */
export function ChangeView(newView: Viewstate): AppActions {
    return {
        type: CHANGE_VIEW_STATE,
        payload: newView
    }
}

/**
 * Erstellt eine neue Eingangsvariable mit diesem Namen als nutzerdefinierten Namen (intern mit x_i bezeichnet)
 * @param customName Name der neuen Variablen (wird bei Nichtangabe zur internen Bezeichnung gesetzt !!Diese kann bei unguenstiger Wahl der Operatoren als Buchstabe einen Operator enthalten!!)
 * @trhows invalidName falls der Name nicht nur aus alphanumerischen Symbolen bzw "-" und "_" besteht
 * @throws nameAlredayTaken wenn der Name bereits vergeben wurde
 * @throws nameContainsOperators falls Operator in Namen enthalten
 * @throws "name must not be zVariable" falls der uebergebene Namen dem Bennenungsschema von zVariablen entspricht (darf Teil des Namens nicht aber der ganze Name sein)
 */
export function AddGlobalInput(customName?: string): AppActions {
    return {
        type: ADDGLOBALINPUT,
        payload: customName
    }
}

/**
 * Entfernt den uebergebenen Eingang falls er existiert (sonst passiert nichts)
 * @param customName nutzerdefinierter Name des Eingangssignals
 */
export function RemoveGlobalInput(customName: string): AppActions {
    return {
        type: REMOVEGLOBALINPUT,
        payload: customName
    }
}

/**
 * Benennt ein existierendes Eingangssignal um (tut nichts wenn dieses nicht vorhanden)
 * @param oldName nutzerdefinierter Name des umzubenennden Eingangs  
 * @param newName Neuer nutzerdefinierter Name des Eingangs
 * @trhows invalidName falls der Name nicht nur aus alphanumerischen Symbolen bzw "-" und "_" besteht
 * @throws nameAlreadyTaken falls der neue Name bereits verwendet wird
 * @throws nameContainsOperators falls Operator in Namen enthalten
 * @throws "name must not be zVariable" falls der uebergebene Namen dem Bennenungsschema von zVariablen entspricht (darf Teil des Namens nicht aber der ganze Name sein)
 */
export function ChangeGlobalInputName(oldName: string, newName: string): AppActions {
    return {
        type: CHANGEGLOBALINPUTNAME,
        payload: { oldCustomName: oldName, newCustomName: newName }
    }
}

/**
 * Setzt die Belegung eines Eingangs zu 1 
 * @param customInputName Name des zu setzenden Eingangs
 */
export function SetGloablInput(customInputName: string): AppActions {
    return {
        type: SET_GLOABL_INPUT,
        payload: { customName: customInputName }
    }
}

/**
 * Setzt die Belegung eines Eingangs zu 0
 * @param customInputName Name des zu setzenden Eingangs
 */
export function ResetGlobalInput(customInputName: string): AppActions {
    return {
        type: RESET_GLOBAL_INPUT,
        payload: { customName: customInputName }
    }
}


/**
 * Erstellt eine neue Ausgangsvariable mit diesem Namen als nutzerdefinierten Namen (intern mit y_i bezeichnet)
 * @param customName Name der neuen Variablen (wird bei Nichtangabe zur internen Bezeichnung gesetzt !!Diese kann bei unguenstiger Wahl der Operatoren als Buchstabe einen Operator enthalten!!)
 * @trhows invalidName falls der Name nicht nur aus alphanumerischen Symbolen bzw "-" und "_" besteht
 * @throws nameAlredayTaken wenn der Name bereits vergeben wurde
 * @throws nameContainsOperators falls Operator in Namen enthalten
 * @throws "name must not be zVariable" falls der uebergebene Namen dem Bennenungsschema von zVariablen entspricht (darf Teil des Namens nicht aber der ganze Name sein)
 */
export function AddGlobalOutput(customName?: string): AppActions {
    return {
        type: ADDGLOBALOUTPUT,
        payload: customName
    }
}

/**
 * Entfernt den uebergebenen Ausgang falls er existiert (sonst passiert nichts)
 * Entfernt auch seine Ausgangsbelegung innerhalb aller Knoten
 * @param customName nutzerdefinierter Name des Ausgangssignals
 */
export function RemoveGlobalOutput(customName: string): AppActions {
    return {
        type: REMOVEGLOBALOUTPUT,
        payload: customName
    }
}
/**
 * Benennt ein existierendes Ausgangssignal um (tut nichts wenn dieses nicht vorhanden)
 * @param oldName nutzerdefinierter Name des umzubenennden Ausgangs  
 * @param newName Neuer nutzerdefinierter Name des Ausgangs
 * @trhows invalidName falls der Name nicht nur aus alphanumerischen Symbolen bzw "-" und "_" besteht
 * @throws nameAlreadyTaken falls der neue Name bereits verwendet wird 
 * @throws nameContainsOperators falls Operator in Namen enthalten
 * @throws "name must not be zVariable" falls der uebergebene Namen dem Bennenungsschema von zVariablen entspricht (darf Teil des Namens nicht aber der ganze Name sein)
 */
export function ChangeGlobalOutputName(oldName: string, newName: string): AppActions {
    return {
        type: CHANGEGLOBALOUTPUTNAME,
        payload: { oldCustomName: oldName, newCustomName: newName }
    }
}

/**
 * Setzt ein neus Operatorsymbol 
 * @param operatorTyp Welcher Operator soll veraendert werden?
 * @param newOperatorSymbol neues Symbol fuer den Operator
 * @throws OperatorDoesntMatchSytaxRequirement falls der neue Operator einen Punkt "." oder ein Leerzeichen " " enthaelt
 * @throws OperatorAlreadyUsed falls der Operator bereits verwendet wird (eventuell nur als Teilstring eines anderen)
 * @throws "operatros must not be alphanumeric" falls der Operator dem Namensschema von Variablennamen entspricht
 */
export function ChangeCustomOperator(operatorTyp: OperatorEnum, newOperatorSymbol: string): AppActions {
    return {
        type: CHANGECUSTOMOPERATOR,
        payload: { operatorTyp: operatorTyp, newOperatorSymbol: newOperatorSymbol }
    }

}

/**
 * Setze den Ausdruck fuer die globale Dont-Care-Belegung (h-Stern(x))
 * @param hStarExpression logischer Ausdruck der fuer h-Stern gesetzt werden soll (darf nur eine Funktion von x sein und damit weder z-Variablen noch Steuersignale enthalten)
 * @throws "hStar has to be a function of x" Falls innerhalb des Ausdrucks Variablen auftreten, die keine Eingaenge sind (z-Variablen oder Steuersignale)
 */
export function SetGlobalInputDontCare(hStarExpression: string): AppActions {
    return {
        type: SET_GLOBAL_INPUT_DONT_CARE,
        payload: { hStarExpression: hStarExpression }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Alle Actions bezueglich Automaten
/**
 * Erstellt einen neuen Automaten mit einem Zustand 
 * @param name nutzerdefinierte Bezeichnung (Automatisch mit automaton... belegt bei Nichtangabe)
 * @param info Beschreibung des Automaten
 * @throws nameAlreadyTaken wenn der uebergebenen Name bereits verwednet wird
 * @trhows invalidName falls der Name nicht nur aus alphanumerischen Symbolen bzw "{" , "}" und "_" besteht
 * @throws nameContainsOperators falls der gewuenschte Name nutzerdefinierte Operatoren enthaelt
 * @throws "name must not be zVariable" falls der uebergebene Namen dem Bennenungsschema von zVariablen entspricht (darf Teil des Namens nicht aber der ganze Name sein)
 */
export function NewAutomaton(name?: string, info?: string): AppActions {

    if (typeof info === 'undefined') {
        //keine Beschreibung angegben --> wird leer gelassen
        info = ""
    }

    return {
        type: NEWAUTOMATON,
        payload: { name, info }
    }

}
/**
 * Entfernt den angegebenen Automaten falls dieser existiert
 * @param id ID des zu loeschenden Automaten
 */
export function RemoveAutomaton(id: number): AppActions {
    return {
        type: REMOVEAUTOMATON,
        payload: id
    }
}

/**
 * Benennt einen existierenden Automaten um (tut nichts wenn dieser nicht existiert)
 * @param id Id des Automaten der umbennant werden soll
 * @param newName neuer Name fuer den Automaten
 * @throws nameAlreadyTaken wenn der neue Name bereits verwendet wird
 * @trhows invalidName falls der Name nicht nur aus alphanumerischen Symbolen bzw "{" , "}" und "_" besteht
 * @throws nameContainsOperators falls der gewuenschte Name nutzerdefinierte Operatoren enthaelt
 * @throws "name must not be zVariable" falls der uebergebene Namen dem Bennenungsschema von zVariablen entspricht (darf Teil des Namens nicht aber der ganze Name sein)
 */
export function ChangeAutomatonName(id: number, newName: string): AppActions {
    return {
        type: CHANGEAUTOMATONNAME,
        payload: { automatonId: id, newName: newName }
    }

}

/**
 * fuegt einem Automaten eine Beschreibung hinzu (tut nichts wenn dieser nicht existiert)
 * @param id Id des Automaten der umbennant werden soll
 * @param newInfo hinzuzufuegende Beschreibung
 */
export function SetAutomatonInfo(automatonId: number, newInfo: string): AppActions {
    return {
        type: SETAUTOMATONINFO,
        payload: { automatonId: automatonId, info: newInfo }
    }
}

/**
 * Setzte den neuen Startzustand (nicht Knoten) eines Automatens
 * @param automatonId Id des begtroffenen Automaten
 * @param newInitialStateNumber Nummer des neuen Initialzustandes
 */
export function SetInitialState(automatonId: number, newInitialStateNumber: number): AppActions {
    return {
        type: SET_INITIAL_STATE,
        payload: { automatonId: automatonId, newInitialStateNumber: newInitialStateNumber }
    }
}

/**
 * Fuegt einen Automaten zur Liste der aktiven Automaten hinzu falls dieser existiert
 * Diese wird immer aktuell gehalten
 * @param automatonId Id des hinzuzufuegenden Automaten
 */
export function AddActiveAutomaton(automatonId: number): AppActions {
    return {
        type: ADDACTIVEAUTOMATON,
        payload: automatonId
    }
}

/**
 * Entfernt einen aktiven Automaten falls dieser aktiv ist
 * @param automatonId Id des zu entfernenden Automaten
 */
export function RemoveActiveAutomaton(automatonId: number): AppActions {
    return {
        type: REMOVEACTIVEAUTOMATON,
        payload: automatonId
    }
}


/**
 * Erstellt eine neue Steuervariable mit diesem Namen als nutzerdefinierten Namen (intern mit s_i bezeichnet) im angegebenen Automaten
 * @param automatonId Id des Automaten zu dem die Variable hinzugefuegt werden soll
 * @param customName Name der neuen Variablen (wird bei Nichtangabe zur internen Bezeichnung gesetzt !!Diese kann bei unguenstiger Wahl der Operatoren als Buchstabe einen Operator enthalten!!)
 * @throws nameAlredayTaken wenn der Name bereits vergeben wurde
 * @throws nameContainsOperators falls Operator in Namen enthalten
 * @throws "name must not be zVariable" falls der uebergebene Namen dem Bennenungsschema von zVariablen entspricht (darf Teil des Namens nicht aber der ganze Name sein)
 */
export function AddControlSignal(automatonId: number, customName?: string): AppActions {
    return {
        type: ADDCONTROLSIGNAL,
        payload: { automatonId: automatonId, customName: customName }
    }
}

/**
 * Entfernt eine Steuervariable mit dem gegbenen Namen aus dem gegebenen Automaten (tut nichts falls die Variable nicht existiert)
 * @param automatonId Id des Automaten zu dem die Variable hinzugefuegt werden soll
 * @param customName nutzerdefinierter Name der Steuervariablen
 */
export function RemoveControlSignal(automatonId: number, customName: string): AppActions {
    return {
        type: REMOVECONTROLSIGNAL,
        payload: { automatonId: automatonId, customName: customName }
    }
}

/**
 * Bennennt eine bereits existierende Steuervariable im gegebenen Automaten um 
  * @param automatonId Id des Automaten zu dem die Variable hinzugefuegt werden soll
 * @param oldName Alter nutzerdefinierter Name der Steuervariablen
 * @param newName Neuer nutzerdefinierter Name der Steuervariablen
 * @throws nameAlredayTaken wenn der Name bereits vergeben wurde
 * @throws nameContainsOperators falls Operator in Namen enthalten
 * @throws "name must not be zVariable" falls der uebergebene Namen dem Bennenungsschema von zVariablen entspricht (darf Teil des Namens nicht aber der ganze Name sein)
 */
export function ChangeControlSignalName(automatonId: number, oldName: string, newName: string): AppActions {
    return {
        type: CHANGECONTROLSIGNALNAME,
        payload: { automatonId: automatonId, oldCustomName: oldName, newCustomName: newName }
    }
}

/**
 * Entferne alle Redundanten Klammern (alle die nicht zwingend fuer die korrekte Darstellung der Ausdruecke benoetigt werden) aus den vom Nutzer eingegebenen logischen Ausdrucken
 */
export function RemoveRedundantBracketsInExpressions(): AppActions {
    return {
        type: REMOVE_REDUNDANT_BRACKETS_FROM_EXPRESSIONS
    }
}

/**
 * Minimiere alle logischen Ausdruecke in den Graphen der Designautomaten (Kanten und Ausgaben)
 */
export function MinimizeAllExpressionsInGraph(): AppActions {
    return {
        type: MINIMIZE_ALL_EXPRESSIONS_IN_GRAPH
    }
}

/**
 * Berechne den Systemzustand fuer den naechsten Takt der Simulation
 */
export function ComputeNextClock(): AppActions {
    return {
        type: COMPUTE_NEXT_CLOCK
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//alle Actions bezueglich des Hardwareautomaten

/**
 * Veraendert die Lage / die Koordinaten des angesprochenen Zustandes in der angegebenen abgeleiteten Ansicht, falls dieser existiert und die Koordinaten zuleassig sind
 * "Anpinnen" des Zustandes an seine aktuelle Position (wird nicht mehr automatisch verschoben)
 * @param derivedView abgeleitete Ansicht in der der Zustand verschoben werden soll
 * @param automatonId Id des Automaten fuer den der Zustand in seinem abgeleiteten Automaten platziert werden soll
 * @param stateNumber Nummer des zu verschiebenden Zustands (entspricht der ID des Knotens innerhalb der abgeleiteten Automatendarstellungen)
 * @param newPoint neuer Punkt fuer den Zustand
 */
export function SetDerivedViewStateCords(derivedView: DerivedAutomatonViews, automatonId: number, stateNumber: number, newPoint: Point): AppActions {
    return {
        type: SET_DERIVED_AUTOMATON_STATE_CORDS,
        payload: { derivedView: derivedView, automatonId: automatonId, stateNumber: stateNumber, newPoint: newPoint }
    }
}



/**
 * Veraendert die Parameter einer Kante innerhalb einer abgeleiteten Ansicht
 * Wird der Verlauf einer Kante vorgegeben, so werden automatisch die aktuellen Lagen der Anfangs- und Endzustaende der Kante "angepinnt" (siehe z.B. {@link SetHardwareStateCords}) 
 * @param derivedView abgeleitete Ansicht in der der Zustand verschoben werden soll
 * @param automatonId Id des Automaten fuer den die Kante in seiner abgeleiteten Ansicht platziert werden soll
 * @param transitonId Id der Kante
 * @param endPoint Endpunkt der Kante
 * @param startPoint Startpunkt der Kante
 * @param supportPoint Stuetzpunkt der Kante
 */
export function ChangeDerivedViewTransitionPoints(derivedView: DerivedAutomatonViews, automatonId: number, transitonId: number, endPoint: Point, startPoint: Point, supportPoint: Point): AppActions {
    return {
        type: SET_DERIVED_AUTOMATON_TRANSITION_CORDS,
        payload: { derivedView: derivedView, automatonId: automatonId, transitionId: transitonId, newEndPoint: endPoint, newStartPoint: startPoint, supportPoint: supportPoint }
    }
}

/**
 * Setze die Positionen aller Elemente (Knoten und Kanten) einer abgeleiteten Ansicht zurueck
 * Die abgeleitete Ansicht wird dadurch vollstaendig automatisch angeordnet (hierbei wird sich am zugehoerigen Desginautomaten orientiert)
 * @param automatonId Id des Automaten fuer den die abgeleitete Ansicht zurueckgestezt werden soll (bei Nichtangabe fuhre es fuer alle Automaten aus)
 * @param derivedView abgeleitete Ansicht, die neu angeordnet werden soll
 */
export function ResetDerivedAutomatonPositions(derivedView: DerivedAutomatonViews , automatonId?:number): AppActions {
    return {
        type:RESET_DERIVED_AUTOMATON_POSITIONS,
        payload: {derivedView:derivedView , automatonId:automatonId}
    }
}


/** Setze alle Automaten in ihren Initialzustand zurueck */
export function ResetToInitialStates(): AppActions {
    return {
        type: RESET_TO_INITAL_STATES
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Alle Actions bezueglich Knoten und Zustaenden
/**
 * Fuegt einem bestehnden Automaten einen neuen Knoten hinzu (tut nichts falls Automat nicht existiert)
 * @param automatonId Id des Automaten dem der Knoten hinzugefuegt werden soll
 * @param customStateNumber Name des Zustandes (bei Nichtangabe automatisch gesetzt)
 * @param position Position des Knotens (bei Nichtangabe automatisch platziert)
 */
export function AddNode(automatonId: number, customStateNumber?: number, position?: Point): AppActions {
    return {
        type: ADDNODE,
        payload: { automatonId: automatonId, customStateNumber: customStateNumber, position: position }
    }
}
/**
 * Entfernt einen Knoten aus einem Automaten (tut nichts falls Knoten oder Automat nicht existieren)
 * @param nodeId Id des zu entfernden Knotens 
 */
export function RemoveNode(nodeId: number): AppActions {
    return {
        type: REMOVENODE,
        payload: { nodeId: nodeId }
    }
}

/**
 * Veraendert die customNodeNumber (die Zustandskoodierung) eines Knotens, falls dieser existiert und die neue Koodierung zulaessig (>0) ist 
 * @param nodeId Id des gesuchten Knotens
 * @param newNodeName neue Nummer / Zustandskoodierung des Knotens
 */
export function ChangeNodeNumber(nodeId: number, newNodeNumber: number): AppActions {
    return {
        type: CHANGENODENUMBER,
        payload: { nodeId: nodeId, newNodeNumber: newNodeNumber }
    }
}

/**
 * Veraendert den Namen eines Knotens, falls dieser existiert
 * @param nodeId Id des gesuchten Knotens
 * @param newName neuer Name des Knotens
 */
export function ChangeNodeName(nodeId: number, newNodeName: string): AppActions {
    return {
        type: CHANGE_NODE_NAME,
        payload: { nodeId: nodeId, newNodeName: newNodeName }
    }
}


/**
 * Veraendert die Lage / die Koordinaten des angesprochenen Knotens, falls dieser existiert und die Koordinaten zuleassig sind
 * @param nodeId Id des zu verschiebenden Knotens
 * @param newPosition neue Position des Knotens
 */
export function SetNodeCords(nodeId: number, newPosition: Point): AppActions {
    return {
        type: SETNODECORDS,
        payload: { nodeId: nodeId, newPosition: newPosition }
    }
}

/**
 * Aktiviert einen Knoten (falls dieser existiert)
 * @param nodeId Id des Knotens
 */
export function SetActiveNode(nodeId: number): AppActions {
    return {
        type: ADDACTIVENODE,
        payload: nodeId
    }
}

/**
 * Deaktiviert einen Knoten (falls dieser aktiv war)
 * @param nodeId Id des Knotens
 */
export function ResetActiveNode(nodeId: number): AppActions {
    return {
        type: REMOVEACTIVENODE,
        payload: nodeId
    }
}

/**
 * Setzt eine Ausgangsvariable in einem Knoten zu einem logischen Ausdruck falls diese existiert
 * @param nodeId Id des Knotens in dem der Ausgang gesetzt werden soll
 * @param customOutputName nutzerdefinierter Name der zu setztenden Ausgangsvariable
 * @param equation logischer Ausdruck fuer den Ausgang --> darf keine z-Variablen enthalten
 * @throws "Outputexpression must not contain z-Variables" falls der zu setzende Ausdruck z-Variablen beinhaltet
 * @throws "expression must not contain outputs" falls sich eine Ausgangsvariable innerhalb der Eingabe befindet
 * @throws "unknown variable" falls die Eingabe eine unbekannte Variable enthealt
 */
export function SetOutput(nodeId: number, customOutputName: string, equation: string): AppActions {
    return {
        type: SETOUTPUT,
        payload: { nodeId: nodeId, customOutputName: customOutputName, equation: equation }
    }
}

/**
 * Setzt eine Ausgangsvariable innerhalb eines Zustandes, die aktuell belegt ist auf 0 zurueck (falls diese existiert)
 * @param nodeId Id es Knotens in dem die Ausgangsvariable zu 0 gesetzt werden soll
 * @param customOutputName nutzerdefienierter Name der zurueckzusetzenden Ausgangsvariablen
 */
export function Resetoutput(nodeId: number, customOutputName: string): AppActions {
    return {
        type: RESETOUTPUT,
        payload: { nodeId: nodeId, customOutputName: customOutputName }
    }
}

/**
 * Setzt eine Steuervariable eines Automaten in einem Knoten zu einem logischen Ausdruck
 * @param nodeId Id des Knotens in dem der Ausgang zu 1 gesetzt werden soll
 * @param customOutputName nutzerdefinierter Name der zu setztenden Steuervariablen
 * @param equation logischer Ausdruck fuer das Steuersignal --> darf keine z-Variablen oder andere Steuersignale enthalten
 * @throws "Controlsignalexpression must not contain z-Variables or controlsignals" Falls der zu setzende Ausdruck z-Variabeln oder Steuersignale beinhaltet
 * @throws "expression must not contain outputs" falls sich eine Ausgangsvariable innerhalb der Eingabe befindet
 * @throws "unknown variable" falls die Eingabe eine unbekannte Variable enthealt
 */
export function SetControlSignal(nodeId: number, customControlSignalName: string, equation: string): AppActions {
    return {
        type: SETCONTROLSIGNAL,
        payload: { nodeId: nodeId, customControlSignalName: customControlSignalName, equation: equation }
    }
}

/**
 * Setzt eine Steuervariable eines Automaten in einem Knoten zu 0 falls diese existiert und belegt war
 * @param automatonName Name des Automaten in dem der Knoten liegt und zu dem die Variable gehoert
 * @param nodeId Id des Knotens in dem der Ausgang zu 0 gesetzt werden soll
 * @param customOutputName nutzerdefinierter Name der zu setztenden Steuervariablen
 */
export function ResetControlSignal(automatonName: string, nodeId: number, customControlSignalName: string): AppActions {
    return {
        type: RESETCONTROLSIGNAL,
        payload: { automatonName: automatonName, nodeId: nodeId, customControlSignalName: customControlSignalName }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Alle Action bezueglich Transitionen
/**
 * Erstellt eine neue Transition (Falls diese bereits existiert wird ihre Bedinung ueberschrieben)
 * @param automatonId Id des Automaten in dem die Kante liegt
 * @param fromNodeId StartknotenId 
 * @param toNodeId ZielknotenId
 * @param condition logische Uebergangsbedingung (1 bei Nichtangabe) --> darf keine z-Variablen enthalten
 * @throws transitionAlreadyExists falls die zu erstellende Kante bereits existiert
 * @throws "Transitionconditions must not contain z-Variables" falls die logische Bedingung der Kante eine z-Variable beinhaltet
 * @throws "expression must not contain outputs" falls sich eine Ausgangsvariable innerhalb der Eingabe befindet
 * @throws "unknown variable" falls die Eingabe eine unbekannte Variable enthealt
 */
export function AddTransition(automatonId: number, fromNodeId: number, toNodeId: number, condition?: string): AppActions {
    return {
        type: ADDTRANSITION,
        payload: { automatonId: automatonId, fromNodeId: fromNodeId, toNodeId: toNodeId, condition: condition }
    }
}

/**
 * Entferne eine Transition
 * @param transitionId Id der Kante
 */
export function RemoveTranistion(transitionId: number): AppActions {
    return {
        type: REMOVE_TRANSITION,
        payload: { transitionId: transitionId }
    }
}


/**
 * Veraendere die Bedingung einer Kante 
 * Dies erstellt eine Kante mit der Bedingung falls sie noch nicht existiert bzw. loescht eine ggf. bereits bestehende Kante falls die eingegebene Bedingung leer (nur Whitespaces) ist
 * @param fromNodeId StartknotenId 
 * @param toNodeId ZielknotenId
 * @param condition logische Uebergangsbedingung (1 bei Nichtangabe) --> darf keine z-Variablen enthalten
 * @throws "Transitionconditions must not contain z-Variables" falls die logische Bedingung der Kante eine z-Variable beinhaltet
 * @throws "expression must not contain outputs" falls sich eine Ausgangsvariable innerhalb der Eingabe befindet
 * @throws "unknown variable" falls die Eingabe eine unbekannte Variable enthealt
 */
export function ChangeTransitionCondition(fromNodeId: number, toNodeId: number, condition: string): AppActions {
    return {
        type: CHANGECONDITION,
        payload: { fromNodeId: fromNodeId, toNodeId: toNodeId, condition: condition }
    }
}

/**
 * Veraendert den Endpunkt einer Kante
 * @param transitionId Id der Kante
 * @param newPoint neuer Endpunkt
 */
export function ChangeTransitionEndPoint(transitionId: number, newPoint: Point): AppActions {
    return {
        type: CHANGEENDPOINT,
        payload: { newPoint: newPoint, transitionId: transitionId }
    }
}


/**
 * Veraendert den Startpunkt einer Kante
 * @param transitionId Id der Kante
 * @param newPoint neuer Anfangspunkt
 */
export function ChangeTransitionStartPoint(transitionId: number, newPoint: Point): AppActions {
    return {
        type: CHANGESTARTPOINT,
        payload: { transitionId: transitionId, newPoint: newPoint }
    }
}

/**
 * Veraendert den Stuetzpunkz einer Kante
 * @param transitionId Id der Kante
 * @param newPoint neuer Stuetzpunkt
 */
export function ChangeTransitionSupportPoint(transitionId: number, newPoint: Point): AppActions {
    return {
        type: CHANGESUPPORTPOINT,
        payload: { transitionId: transitionId, newPoint: newPoint }
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Alle Actions bezueglich der Transitionsmatrix

/**
 * Vergroessere die Transitionsmatrix um eine Spalte und eine Zeile (einen Knoten mehr)
 * @param automatonId Id des Automaten zu dem die Matrix gehoert
 */
export function ExpandTransitionMatrix(automatonId: number): AppActions {
    return {
        type: EXPAND_TRANSITION_MATRIX,
        payload: { automatonId: automatonId }
    }
}

/**
 * Verkleinere die Transitionsmatrix um eine Spalte und eine Zeile die zu dem angegebenen Knoten gehoert (einen Knoten weniger)
 * @param nodeId Id des Knotes dessen Zeile und Spalte entfernt werden sollen
 */
export function ShrinkTransitionMatrix(nodeId: number): AppActions {
    return {
        type: SHRINK_TRANSITION_MATRIX,
        payload: { nodeId: nodeId }
    }
}

/**
 * Veraendere einen Eintrag in der Transitionsmatrix

 * @param fromNodeId StartknotenId 
 * @param toNodeId ZielknotenId
 * @param condition logische Uebergangsbedingung 
 */
export function ChangeTransitionMatrixEntry(fromNodeId: number, toNodeId: number, condition: string): AppActions {
    return {
        type: CHANGE_TRANSITION_MATRIX_ENTRY,
        payload: { fromNodeId: fromNodeId, toNodeId: toNodeId, condition: condition }
    }
}

/**
 * Loesche einen Eintrag in der Transitionsmatrix eines Automaten
 * @param fromNodeId StartknotenId 
 * @param toNodeId ZielknotenId
 */
export function RemoveTransitionMatrixEntry(fromNodeId: number, toNodeId: number): AppActions {
    return {
        type: REMOVE_TRANSITION_MATRIX_ENTRY,
        payload: { fromNodeId: fromNodeId, toNodeId: toNodeId }
    }
}

