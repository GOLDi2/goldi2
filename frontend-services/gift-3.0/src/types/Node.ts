import { ControlSignalPair, IControlSignalPair } from './ControlSignalPair';
import { IOutputSignalPair, OutputSignalPair } from './OutputSignalPair';
import { immerable } from 'immer'
import { ExternalOutput } from './Output';
import { ControlSignal } from './ControlSignal';
import { CustomNames } from './BooleanEquations/CustomNames';
import { ApiTransformable, FullApiTransformable } from './ApiTransformable';
import { ApiOutputSignalPair } from './ApiClasses/GraphRepresentation/OutputSiganalPair';
import { ApiControlSignalPair } from './ApiClasses/GraphRepresentation/ControlSignalPair';
import { createPoint, Point } from './Points';
import { AutomatonViewConfig, MergedAutomatonViewConfig } from './NormalizedState/ViewConfig';
import { TransitionPosition } from './Transition';
import { HasID } from './NormalizedState/NormalizedObjects';
import { CompleteTreeRoot, ICompleteTreeRoot } from './BooleanEquations/LogicTrees/TreeRoots';
import { CompleteTreeConstantNode } from './BooleanEquations/LogicTrees/Variables';
import { ConstantType } from './BooleanEquations/LogicTrees/TreeNodeInterfaces';
import { Z_NAME } from './ZVariable';
import { Signalpair } from './Signalpair';
import { NameErrorTupel, NumberErrorTupel } from './ErrorElements';
import { NumberError } from './Error';

/** Standardmaessiger Knotenradius */
export const DEFAULT_NODE_RADIUS = 50;

/**
 * Darstellung der grafischen Parameter eines Knotens
 */
export interface NodePosition extends HasID {
    /**Nummer des Knotens der dessen grafische Parameter gespeichert werden*/
    id: number

    /**Position des Knotens  */
    position: Point

    /** Radius des Kreises */
    radius: number

    /** Ist der Knoten aktiv? */
    isActive: boolean

    // static wrap(object:INodePosition):NodePosition{
    //     return new NodePosition()
    // }
}

/**
    * Erstelle die Positionsdarstellung eines Knotens 
    * @param id Id des Knotens
    * @param position Position des Knotens
    * @param radius Radius des Knotens (bei Nichtangabe Standardwert)
    * @param isActive Ist der Knoten aktiv?
    */
export function createNodePosition(id: number, position: Point, radius = DEFAULT_NODE_RADIUS, isActive = false): NodePosition {
    return { id: id, position: position, radius: radius, isActive: isActive }
}

/**
 * Darstellung eines Knotens nur anhand der logik-relevanten Eigenschaften (keine Informationen zu seiner Darstellung)
 */
export interface RawNode extends HasID {
    /** interne ID */
    id: number;

    /** individuelle Zustandskoodierung Z_i und ein eventuell aufgetretener Fehler*/
    customStateNumber: NumberErrorTupel<NumberError>;

    /** Ausgabe des Knotens: alle internen y_i , die in diesem Knoten gesetzt werden
     * logische Bedingungen duerfen nicht von Steuersignalen abhaengen 
    */
    outputAssignment: Array<IOutputSignalPair>;

    /** Steuersignalausgabe des Knotens: alle internen s_i, die in diesem Knoten gesetzt sind 
     * logische Bedingungen duerfen nicht von Steuersignalen abhaengen 
    */
    controlSignalAssignment: Array<IControlSignalPair>;

    /** 
     * Repreasentiert der Knoten einen vollstaendigen Zustand? (Im Sinne der Vollstaendigkeit und Widerspruchsfreiheit) innerhalb eines Fusionsautomaten?
     * -    Es liegt undefined vor, falls keine Aussage ueber diese Eigenschaft getroffen wurde
     * -    Liegt ein Eintrag vor, so handelt es sich bei dem Knoten um die eindeutoge Darstellung eines Zustands, der anhand dieses Werts bezueglich seiner
     *      Vollstaendigkeit charakterisiert wird
    */
    completenessInfo: CompletenessInfo | undefined

    /** 
      * Repreasentiert der Knoten einen widerspruchsfreien Zustand? (Im Sinne der Vollstaendigkeit und Widerspruchsfreiheit) innerhalb eines Fusionsautomaten?
      * -    Es liegt undefined vor, falls keine Aussage ueber diese Eigenschaft getroffen wurde
      * -    Liegt ein Eintrag vor, so handelt es sich bei dem Knoten um die eindeutoge Darstellung eines Zustands, der anhand dieses Werts bezueglich seiner
      *      Widerspruchsfreiheit charakterisiert wird
     */
    contradictionInfo: ContradictionInfo | undefined


}

/**
  * Erstelle die Logikinformationen eines Knotens
  * @param id Id des Knotens
  * @param customStateNumber Zustandsnummer des Knotens 
  * @param outputAssignment Ausgabe des Knotens (y_i): bei Nichtangabe leer
  * @param controlSignalAssignment Ausgabe des Knotens (s_i): bei Nichtangabe leer
  * @param isComplete Ist der Zustand vollstaendig?
  * @param isFreeOfContradictions Ist der Zustand widerspruchsfrei?
  */
export function createRawNode(id: number, customStateNumber: NumberErrorTupel<NumberError>, outputAssignment: Array<IOutputSignalPair> = [], controlSignalAssignment: Array<IControlSignalPair> = [],
    isComplete?: CompletenessInfo, isFreeOfContradictions?: ContradictionInfo):RawNode {
    return { id: id, customStateNumber: customStateNumber, outputAssignment: outputAssignment, controlSignalAssignment: controlSignalAssignment, completenessInfo: isComplete, contradictionInfo: isFreeOfContradictions }
}


/**
 * Darstellung eines Knotens des Automaten
 * Ein Knoten mit individueller Zustandskoodierung wird als Zustand bezeichnet
 */
export class Node implements ApiTransformable {
    [immerable] = true;
    /** interne ID */
    public id: number;

    /**Position des Knotens  */
    public position: Point

    /** individuelle Zustandskoodierung Z_i*/
    public customStateNumber: NumberErrorTupel<NumberError>;

    /** Radius des Knotenkreises*/
    public radius: number

    /** Ausgabe des Knotens: alle internen y_i , die in diesem Knoten gesetzt werden
     * logische Bedingungen duerfen nicht von Steuersignalen abhaengen 
    */
    public outputAssignment: Array<IOutputSignalPair>;

    /** Steuersignalausgabe des Knotens: alle internen s_i, die in diesem Knoten gesetzt sind 
     * logische Bedingungen duerfen nicht von Steuersignalen abhaengen 
    */
    public controlSignalAssignment: Array<IControlSignalPair>;

    /** Ist der Knoten gerade aktiv? */
    public isActive: boolean;

    /** 
     * Falls es sich bei diesem Knoten um einen Knoten einer abgleiteten Ansicht handelt, konnen hier ggf. die IDs der Knoten des Designautomaten, welche die gleiche 
     * Zustandsnummer wie der abgeleitete Knoten besitzen gespeichert werden (hilfreich fuer die Zuordnung des Knotennamens in abgeleiteten Anscihten)
     * Ist undefined falls es sich nicht um einen Knoten aus einer abgleiteten Ansicht handelt
     * Ist leer falls es sich um einen abgeleiteten Knoten handelt der jedoch keinen Vorbildknoten hatte (dargestellter Zustand existiert nur in der abgeleiteten Ansicht)
     * */
    public templateNodeIds: Array<number> | undefined


    /** 
    * Repreasentiert der Knoten einen vollstaendigen Zustand eines Fusionsautomaten? (Im Sinne der Vollstaendigkeit und Widerspruchsfreiheit)
    * -    Es liegt undefined vor, falls keine Aussage ueber diese Eigenschaft getroffen wurde (Knoten ist nicht Teil eines Fusionsautomaten)
    * -    Liegt ein Eintrag vor, so handelt es sich bei dem Knoten um die eindeutoge Darstellung eines Zustands, der anhand dieses Werts bezueglich seiner
    *      Vollstaendigkeit charakterisiert wird
    */
    public completenessInfo: CompletenessInfo | undefined

    /** 
      * Repreasentiert der Knoten einen widerspruchsfreien Zustand eines Fusionsautomaten ? (Im Sinne der Vollstaendigkeit und Widerspruchsfreiheit)
      * -    Es liegt undefined vor, falls keine Aussage ueber diese Eigenschaft getroffen wurde (Knoten ist nicht Teil eines Fusionsautomaten)
      * -    Liegt ein Eintrag vor, so handelt es sich bei dem Knoten um die eindeutoge Darstellung eines Zustands, der anhand dieses Werts bezueglich seiner
      *      Widerspruchsfreiheit charakterisiert wird
     */
    public contradictionInfo: ContradictionInfo | undefined

    /**
     * Erstellt einen neuen Knoten
     * @param id Id des Knotens
     * @param customStateNumber Zustandscodierung des Knotens (bei Nichtangabe = id)
     * @param cordX x-Koordinate (bei Nichtangabe = 0)
     * @param cordY y-Koordinate (bei Nichtangabe = 0 )
     */
    constructor(id: number, customStateNumber?: NumberErrorTupel<NumberError>, cordX: number = 0, cordY: number = 0, radius = DEFAULT_NODE_RADIUS, isActive?: boolean,
        isComplete?: CompletenessInfo, isFreeOfContradictions?: ContradictionInfo) {
        this.id = id
        this.position = createPoint(cordX, cordY)
        if (typeof customStateNumber != 'undefined') {
            this.customStateNumber = customStateNumber;
        }
        else {
            this.customStateNumber = {validNumber: this.id , error:undefined}; //kein Fehler bei der Vergabe
        }
        if (typeof isActive == 'undefined') {
            this.isActive = false;
        }
        else {
            this.isActive = isActive;
        }

        this.radius = radius;
        //Knoten kennt nur Ausgangs-/ Steuervariablen, die für ihn =1 sind (anfagns alle mit 0 initialisiert)
        this.outputAssignment = [];
        this.controlSignalAssignment = [];
        this.completenessInfo = isComplete
        this.contradictionInfo = isFreeOfContradictions

    }

    /**
     * Ueberfuehre diesen Knoten entsprechend der aktuellen Konfiguration in seine externe Darstellung
     * @param automatonViewConfig aktuelle Konfiguration fuer die Transformation 
     * @param automatonId Id des Auotmaten zu dem dieser Knoten geheoert
     * @param mergedAutomatonViewConfig Konfiguration fuer die Darstellung von Fusionsautomaten
     *     Sollte nur uebergeben werden, wenn es sich bei diesem Knoten um einen Knoten eines Fusionsautomaten handelt (geht aus Berechnungen hervor)
     * @returns externe Darstellung dieses Knotens gemeass der uebergebenen Konfiguration
     */
    toExternalGraphRepresentation(customNames: CustomNames, automatonViewConfig: AutomatonViewConfig, automatonId: number, mergedAutomatonViewConfig?: MergedAutomatonViewConfig): ApiNode {
        //Ueberfuehre alle Ausgaben
        let apiOutputs = transfromOutputs(automatonId, this.controlSignalAssignment, this.outputAssignment, customNames, automatonViewConfig, mergedAutomatonViewConfig?.minimizeExpressions)

        //suche den Namen des Knotens
        let names = getNodeName(this.id, this.templateNodeIds, this.customStateNumber.validNumber, customNames)

        //Transformation zu neuem Api-Knoten
        //Beachte ob Informationen zur Vollstaendigkeit und Widerspruchsfreiheit angezeigt werden sollen
        //Info zur Vollstaendigkeit und Widerspruchsfreiheit inital undefiniert
        let apiCompletenessInfo:ApiCompletenessInfo|undefined = undefined 
        let apiContradictionInfo:ApiContradictionInfo | undefined = undefined
        //Falls dieser Knoten eine Info zu seiner Vollstaendigkeit bzw. Widerspruchsfreiheit hatte forme sie in Ausgabedarstellung um
        if(this.completenessInfo !== undefined){ //Knoten besass Info --> Forme sie in Ausgabedarstellung um
            apiCompletenessInfo = {isComplete:this.completenessInfo.isComplete , incompleteness:CompleteTreeRoot.toCustomString(this.completenessInfo.incompleteness,customNames)}
        }
        if(this.contradictionInfo !== undefined){//Knoten besass Info --> Forme sie in Ausgabedarstellung um
            apiContradictionInfo = {isFreeOfContradictions: this.contradictionInfo.isFreeOfContradictions , contradiction: CompleteTreeRoot.toCustomString(this.contradictionInfo.contradiction , customNames)}
        }
        let apiNode = new ApiNode(this.id, this.customStateNumber, names, this.position, this.radius, apiOutputs.apiOutputs, apiOutputs.apiControlSignalOutputs, this.isActive, apiCompletenessInfo, apiContradictionInfo)

        //Liegt eine Konfiguration fuer die Ansicht der Fusionsautomaten vor, so muessen ggf. weitere Eigenschaften der Knoten angezeigt/ ausgeblendet werden
        // Die Flags zur Vollstaendigkeit und Widerspruchesfreiheit sind nur in den Fuisonsautomaten gesetzt
        if (mergedAutomatonViewConfig !== undefined) {
            //Es liegt eine Konfiguration vor --> Hierbei sollte es sich um einen Fusionsautomaten handeln
            //Pruefe ob die Eigenschaften Vollstaendigkeit und Widerspruchsfreiheit angezeigt werden sollen --> wenn nein blende sie aus (undefined als Flags)
            if (!mergedAutomatonViewConfig.highlightIncompleteStates) {
                //Unvollstaendigkeiten nicht hervorheben --> Flag wieder zu undefined setzen
                apiNode.completenessInfo = undefined
            }
            if (!mergedAutomatonViewConfig.highlightSelfContradictoryStates) {
                //Widerspruche nicht hervorheben --> Flag wieder zu undefined setzen
                apiNode.contradictionInfo = undefined
            }
        }

        return apiNode

    }

    // /**
    //  * Erstelle eine Darstellung dieses Knotens, die nur die logik-relevanten Daten kennt
    //  */
    // createRawNode(): RawNode {
    //     let rawNode: RawNode = createRawNode(this.id, this.customStateNumber, this.outputAssignment, this.controlSignalAssignment)
    //     return rawNode
    // }

    /**
     * Erstelle eine Darstellung dieses Knotens, die nur die positions-relevanten Daten kennt
     */
    createNodePosition(): NodePosition {
        let nodePosition: NodePosition = createNodePosition(this.id, this.position)
        return nodePosition
    }
}


/**
 * Ausgabedarstellung eines Knotens die durch die Selektoren aus dem internen State erzeugt wird
 */
export class ApiNode implements NodePosition {
    [immerable] = true;

    /** interne ID */
    public id: number;

    /**
     * Liste aller Namen dieses Knotens mit eventuell aufgetretenen Fehlern pro Name
     * Innerhalb des Designautomaten kann dies nur ein Name sein, da jedem Knoten dort ein Name zugeordnet wird
     * Innerhalb von abgeleiteten Ansichten werden jedoch mehrere Knoten, die den gleichen Zustand darstellen zu einem zusammengefasst --> der Knoten kennt nun die Namen aller 
     *  Teilknoten die zu ihm zusammengefasst wurden
     * Ggf. nur ersten Eintrag anzeigen (oder Liste aller Namen zum durchschalten anzeigen)
     */
    public names: Array<NameErrorTupel>

    /**Position des Knotens  */
    public position: Point

    /** individuelle Zustandskoodierung Z_i*/
    public customStateNumber: NumberErrorTupel<NumberError>;

    /** Radius des Knotenkreises*/
    public radius: number

    /** Ausgabe des Knotens: alle internen y_i , die in diesem Knoten gesetzt werden */
    public outputAssignment: Array<ApiOutputSignalPair>;

    /** Steuersignalausgabe des Knotens: alle internen s_i, die in diesem Knoten gesetzt sind */
    public controlSignalAssignment: Array<ApiControlSignalPair>;

    /** Ist der Knoten aktuell aktiv? */
    public isActive: boolean

    /** 
     * Repreasentiert der Knoten einen vollstaendigen Zustand? (Im Sinne der Vollstaendigkeit und Widerspruchsfreiheit)
     * -    Es liegt undefined vor, falls keine Aussage ueber diese Eigenschaft getroffen wurde
     * -    Liegt ein Eintrag vor, so handelt es sich bei dem Knoten um die eindeutoge Darstellung eines Zustands, der anhand dieses Werts bezueglich seiner
     *      Vollstaendigkeit charakterisiert wird
    */
    public completenessInfo: ApiCompletenessInfo | undefined

    /** 
      * Repreasentiert der Knoten einen widerspruchsfreien Zustand? (Im Sinne der Vollstaendigkeit und Widerspruchsfreiheit)
      * -    Es liegt undefined vor, falls keine Aussage ueber diese Eigenschaft getroffen wurde
      * -    Liegt ein Eintrag vor, so handelt es sich bei dem Knoten um die eindeutoge Darstellung eines Zustands, der anhand dieses Werts bezueglich seiner
      *      Widerspruchsfreiheit charakterisiert wird
     */
    public contradictionInfo: ApiContradictionInfo | undefined

    /**
     * Erstelle eine neue Ausgabedarstellung eines Knotens
     * Flags zur Vollstaendigkeit- und Widerspruchsfreiheit sind zu undefined gesetzt und muessen bei Bedarf nach der Erstellung gesetzt werden
     * @param id Id
     * @param names Liste aller Namen dieses Knotens {@link this.names}
     * @param customStateNumber Zustandsnummer des Knotens
     * @param cords Lage auf der Zeichenebene als Punkt
     * @param radius Radius des Kreises
     * @param outputAssignment Belegung der Ausgaenge
     * @param controlSignalAssignment Belegung der Steuervariablen 
     * @param isActive Ist der Knoten aktuell aktiv?
     * @param isComplete ist der Zustand der durch diesen Knoten repraesentiert wird vollstaendig?
                Dafuer muss ein Knoten vorliegen, dessen Zustand nur durch diesen Knoten repraesentiert wird
     * @param isFreeOfContradictions ist der Zustand der durch diesen Knoten repraesentiert wird widerspruchsfrei?
                Dafuer muss ein Knoten vorliegen, dessen Zustand nur durch diesen Knoten repraesentiert wird
     */
    constructor(id: number, customStateNumber: NumberErrorTupel<NumberError>, names: Array<NameErrorTupel>, cords: Point, radius: number, outputAssignment: Array<ApiOutputSignalPair>,
        controlSignalAssignment: Array<ApiControlSignalPair>, isActive: boolean, isComplete?: ApiCompletenessInfo, isFreeOfContradictions?: ApiContradictionInfo) {
        this.id = id
        this.position = cords
        this.customStateNumber = customStateNumber;
        this.radius = radius;
        this.outputAssignment = outputAssignment;
        this.controlSignalAssignment = controlSignalAssignment;
        this.isActive = isActive;

        //Knoten selbst kann keine Aussagen ueber sein Vollstaendigkeit- und Widerspruchsfreiheit treffen, da dies vom Automaten als ganzes abhaengig ist
        //   --> setze Flags zu undefined
        this.completenessInfo = isComplete;
        this.contradictionInfo = isFreeOfContradictions;
        this.names = names
    }

}

/**
 * Ueberfuehre alle Ausgaben eines Knotens in die Api-Darstellung
 * @param automatonId ID des Automaten zu dem der Knoten gehoert
 * @param controlSignalAssignments Steuersignalausgabe des Knotens
 * @param outputAssignments Assgabe des Knotens
 * @param automatonViewConfig aktuelle Konfiguration fuer die Transformation 
 * @param minimizeExpressions Sollen die Ausgaben minimiert angezeigt werde?
 * @returns Ausgaben des Knotens in der Api-Darstellung
 */
function transfromOutputs(automatonId: number, controlSignalAssignments: Array<IControlSignalPair>, outputAssignments: Array<IOutputSignalPair>, customNames: CustomNames, automatonViewConfig: AutomatonViewConfig , minimizeExpressions = false ): { apiOutputs: Array<ApiOutputSignalPair>, apiControlSignalOutputs: Array<ApiControlSignalPair> } {

    let apiOutputs: Array<ApiOutputSignalPair> = [];
    //Laufe ueber alle Ausgabevariablen im System und suche eine zugehoerige Ausgabe in diesem Knoten (falls nicht vorhanden muss ggf. = 0 ausgegeben werden)
    customNames.outputs.forEach(currentOutput => {
        //besitzt dieser Knoten eine Ausgabe fuer diese Variable?
        let matchOutput = outputAssignments.find(currentAssignment => OutputSignalPair.getVariable(currentAssignment).matchesToInternalRepresentation(currentOutput.variable))
        if (matchOutput !== undefined) {
            //Der Knoten hat eine Ausgabe fuer sie --> fuege sie hinzu
            //Transformiere das aktuelle Ausgabepaar und fuege es der Liste hinzu 
            //(das Ergebnis der Transformation ist leer falls die Asugabe gemeass der aktuellen Konfiguration nicht angezeigt werden soll)
            apiOutputs.push(...OutputSignalPair.toExternalGraphRepresentation(matchOutput,customNames,automatonViewConfig,minimizeExpressions))
        }
        else {
            //Der Knoten hat keine explizit gesetzte Ausgabe fuer diese Variable (implizit = 0 gesetzt) --> pruefe ob diese implizite Setzung angezeigt werden soll
            if (automatonViewConfig.showZeroOutputs) {
                //Ja soll sie --> Fuege eine Ausgabepaar mit Ausgabe = 0 hinzu (dabei enstehen keine Fehler)
                let zeroOutput:IOutputSignalPair = {varibableNumber:currentOutput.variable.getNumber() , equationErrorTupel: {validExpression:{tree:(new CompleteTreeConstantNode(ConstantType.ConstantZero))} , error:undefined}}
                apiOutputs.push(... OutputSignalPair.toExternalGraphRepresentation(zeroOutput,customNames,automatonViewConfig))
            }
            //sonst: nicht angegebene Ausgabe muss nicht angezeigt werden
        }
    })

    //Ueberfuehre alle Steuersignalpaar
    //Laufe ueber alle Steuervariablen dieses Automaten und suche eine zugehoerige Ausgabe in diesem Knoten (falls nicht vorhanden muss ggf. = 0 ausgegeben werden)
    let thisAutomatonControlSignals = customNames.controlSignals.filter(controlsignal => controlsignal.variable.getAutomatonId() === automatonId) //Steuersignale dieses Automaten
    let apiControlSignals: Array<ApiControlSignalPair> = [];
    thisAutomatonControlSignals.forEach(currentControlSignal => {
        //besitzt dieser Knoten eine Ausgabe fuer diese Variable?
        let matchOutput = controlSignalAssignments.find(currentAssignment => ControlSignalPair.getVariable(currentAssignment,automatonId).matchesToInternalRepresentation(currentControlSignal.variable))
        if (matchOutput !== undefined) {
            //Der Knoten hat eine Ausgabe fuer sie --> fuege sie hinzu
            //Transformiere das aktuelle Ausgabepaar und fuege es der Liste hinzu 
            //(das Ergebnis der Transformation ist leer falls die Asugabe gemeass der aktuellen Konfiguration nicht angezeigt werden soll)
            apiControlSignals.push(...ControlSignalPair.toExternalGraphRepresentation(matchOutput,customNames, automatonViewConfig, automatonId,minimizeExpressions))
        }
        else {
            //Der Knoten hat keine explizit gesetzte Ausgabe fuer diese Variable (implizit = 0 gesetzt) --> pruefe ob diese implizite Setzung angezeigt werden soll
            if (automatonViewConfig.showZeroOutputs) {
                //Ja soll sie --> Fuege eine Ausgabepaar mit Ausgabe = 0 hinzu (dabei ensteht kein Fehler fuer den Baum)
                let zeroOutput:IControlSignalPair = {varibableNumber:currentControlSignal.variable.getNumber() , equationErrorTupel: {validExpression:{tree:(new CompleteTreeConstantNode(ConstantType.ConstantZero))} , error:undefined}}
                apiControlSignals.push(... ControlSignalPair.toExternalGraphRepresentation(zeroOutput,customNames, automatonViewConfig, automatonId))
            }
            //sonst: nicht angegebene Ausgabe muss nicht angezeigt werden
        }
    })

    return { apiOutputs: apiOutputs, apiControlSignalOutputs: apiControlSignals }
}

/**
 * Suche alle Namen dieses Knotens
 * Ist er Teil einer abgeleiteten Ansicht so ordne ihm die  Namen aller Knoten des Designautomaten zu, die zu ihm verschmolzen wurden (ggf. Standardnamen vergeben)
 * Ist der ein Teil eines Designautomaten so uebernimm seinen Namen
 * @param id Id des Knotens
 * @param templateNodeIds Liste mit den IDs der Vorlageknoten aus dem Designautomaten (alle Knoten die diesen Zustand dargestellt haben) --> ist undefined falls der Knoten nicht Teil 
 *      einer abgleieteten Ansicht ist 
 * @param customStateNumber Zustandsnummer des Knotens
 * @param customNames Nutzerdefinierte Namen im System
 */
function getNodeName(id: number, templateNodeIds: Array<number> | undefined, customStateNumber: number, customNames: CustomNames): Array<NameErrorTupel> {
    //suche den Namen des Knotens
    let names: Array<NameErrorTupel> = [] //Liste aller Namen des Knotens
    //Falls es sich bei diesem Knoten um einen abgeleiteten Knoten ist existiert die Liste mit den Ids der Vorlageknoten
    if (templateNodeIds !== undefined) {
        //es liegt ein Knoten einer abgeleiteten Ansciht vor --> ordne ihm alle Namen seiner Vorlageknoten zu
        //wenn kein Vorlageknoten existiert so setze den Zustand als Namen
        if (templateNodeIds.length === 0) {
            names.push({validName:Z_NAME + customStateNumber , error:undefined}) //keinen Fehler bei automatischer Bennenung
        }
        else {
            //Es existieren Vorlageknoten
            templateNodeIds.forEach(currentId => {
                names.push(customNames.nodeNames[currentId].customName)//suche die Namen der Vorlageknotens und speichere sie
            })
        }
    }
    else {
        //Der Knoten ist nicht Teil einer abgeleiteten Ansciht --> ordne ihm seinen eigenen Namen zu
        names.push(customNames.nodeNames[id].customName)
    }

    return names
}

/**
 * Interface zur Speicherung der Information zur Vollstaendigkeit eines Zustandes sowie eventuellen Unvollstaendigkeiten
 */
export interface CompletenessInfo{
    /** Ist der Zustand vollsteaendig? */
    isComplete:boolean

    /** Logischer Ausdruck der die Unvollstaendigkeit beschreibt (ist logisch 0 falls der Zustand vollstaendig ist) */
    incompleteness: ICompleteTreeRoot 
}

/**
 * Interface zur Speicherung der Information zur Vollstaendigkeit eines Zustandes sowie eventuellen Unvollstaendigkeiten
 */
 export interface ApiCompletenessInfo{
    /** Ist der Zustand vollsteaendig? */
    isComplete:boolean

    /** Logischer Ausdruck der die Unvollstaendigkeit beschreibt (ist logisch 0 falls der Zustand vollstaendig ist) */
    incompleteness: string 
}


/**
 * Interface zur Speicherung der Information zur Widerspruchsfreiheit eines Zustandes sowie eventuellen Widersprueche
 */
 export interface ContradictionInfo{
    /** Ist der Zustand widerspruchsfrei? */
    isFreeOfContradictions:boolean

    /** Logischer Ausdruck der den Widerspruch beschreibt (ist logisch 0 falls der Zustand widerspruchsfrei ist) */
    contradiction: ICompleteTreeRoot 
}

/**
 * Interface zur Speicherung der Information zur Widerspruchsfreiheit eines Zustandes sowie eventuellen Widersprueche
 */
 export interface ApiContradictionInfo{
    /** Ist der Zustand widerspruchsfrei? */
    isFreeOfContradictions:boolean

    /** Logischer Ausdruck der den Widerspruch beschreibt (ist logisch 0 falls der Zustand widerspruchsfrei ist) */
    contradiction: string 
}
