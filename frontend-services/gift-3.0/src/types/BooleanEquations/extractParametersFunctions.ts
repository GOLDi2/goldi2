import { IGNORED } from 'typedoc/dist/lib/utils/options/sources/typescript';
import { calculateNeededVariables, getCustomNameFromInternalRepresentation, getMaxCustomStateNumber, getNodeIndex } from '../../actioncreator/helperfunctions';
import { CurrentStateTupel } from '../ApiClasses/SystemAssignment';
import { Automaton, AutomatonStructure, RawAutomatonStructure, UiAutomatonData } from '../Automaton';
import { InternalIndependentControlSignal, InternalIndependentControlSignalAssignment, ExternalIndependentControlSignal } from '../ControlSignal';
import { NameErrorTupel } from '../ErrorElements';
import { ExternalInput, InternalInput, InternalInputAssignment } from '../Input';
import { ControlSignalList, ControlSignalNameList } from '../NormalizedState/AutomatonSubState';
import { StorageObject } from '../NormalizedState/NormalizedObjects';
import { NameTupel } from '../NormalizedState/SignalSubState';
import { Operators } from '../Operators';
import { ExternalOutput, InternalOutput, InternalOutputAssignment } from '../Output';
import { RawTransition } from '../Transition';
import { DerivedAutomatonViews } from '../view';
import { ZVariable, ZVariableAssignment } from '../ZVariable';
import { AutomatonEquationSet } from './EquationSet';
import { CompleteTreeRoot } from './LogicTrees/TreeRoots';
import { DerivedSystemAssignment, FullSystemAssignment, BaseSystemAssignment } from './SystemAssignment';


/**
 * Extrahiert die Liste aller Automatennamen
 * @param automatonIds Ids der Automaten
 * @param uiAutomatonData Liste aller Automaten aus der extrahiert werden soll
 * @returns Liste Automatennamen
 */
export function extractAutomatonNameList(automatonIds:Array<number>,uiAutomatonData:StorageObject<UiAutomatonData>): Array<NameTupel> {
    //Liste fuer alle Automatennamen
    let automatonNameList: Array<NameTupel> = [];
    //Extrahiere alle Automatennamen mit ihrer Id
    automatonIds.forEach(currentAutomatonID => {
        //greife die Daten zu dem Automaten
        let name = uiAutomatonData[currentAutomatonID].name

        automatonNameList.push({id:currentAutomatonID , customName:name})
    })

    return automatonNameList
}

/**
 * Extrahiert die Eingangsvariablen mit ihren nutzerdefinierten Namen
 * @param inputIds Liste mit den Ids aller aktuelle existenten Eingaenge
 * @param customNames Speicherobjekt fuer die nutzerdefinierten Namen der Eingaenge
 * @returns Liste der Inputs in deren externer Darstellung
 */
export function extractInputs(inputIds:Array<number>, customNames:StorageObject<NameTupel> ): Array<ExternalInput> {
    //Liste der Inputs ohne deren Belegung
    let inputList:Array<ExternalInput> = [];
    //Extrahiere alle Inputs mit ihrem nutzerdefinierten Namen
    inputIds.forEach(currentId => {
        //Fuege die aktuelle Variable mit ihrem Namen in die Liste ein
        let customName = customNames[currentId].customName
        inputList.push(new ExternalInput(new InternalInput(currentId) , customName))
    })
    return inputList
}



/**
 * Extrahiert die Ausgangsvariablen in deren interner Darstellung
 * @param outputIds Liste mit den Ids aller aktuelle existenten Ausgaenge
 * @returns Liste der Ausgaenge in deren interner Darstellung
 */
export function extractInternalOutputs(outputIds:Array<number> ): Array<InternalOutput> {
    //Liste der Outputs ohne deren Belegung
    let outputList:Array<InternalOutput> = [];
    //Extrahiere alle Outputs
    outputIds.forEach(currentId => {
        //Fuege die aktuelle Variable  in die Liste ein
        outputList.push(new InternalOutput(currentId))
    })
    return outputList
}


/**
 * Extrahiert die Ausgangsvariablen mit ihren nutzerdefinierten Namen
 * @param outputIds Liste mit den Ids aller aktuelle existenten Ausgaenge
 * @param customNames Speicherobjekt fuer die nutzerdefinierten Namen der Ausgaenge
 * @returns Liste der Ausgaenge in deren externer Darstellung
 */
export function extractOutputs(outputIds:Array<number>, customNames:StorageObject<NameTupel> ): Array<ExternalOutput> {
    //Liste der Outputs ohne deren Belegung
    let outputList:Array<ExternalOutput> = [];
    //Extrahiere alle Outputs mit ihrem nutzerdefinierten Namen
    outputIds.forEach(currentId => {
        //Fuege die aktuelle Variable mit ihrem Namen in die Liste ein
        let customName = customNames[currentId].customName
        outputList.push(new ExternalOutput(new InternalOutput(currentId) , customName))
    })
    return outputList
}

/**
 * Extrahiert die Liste unabhaengiger Steuerletiablen
 * @param internControlSignals Interne Darstellung der Steuersignale die in die externe Darstellung gebracht werden soll
 * @param controlSignalNameLists Speicher der Namen aller Steuersignale aller Automaten aus dem State
 * @returns Liste unabhaengiger Steuersignale 
 */
export function extractControlSignals(internControlSignals:Array<InternalIndependentControlSignal> , controlSignalNameLists:StorageObject<ControlSignalNameList>): Array<ExternalIndependentControlSignal> {

    let controlSignals: Array<ExternalIndependentControlSignal> = [];
    //alle Steuersignale aller Automaten uebernehmen --> werden mit automatXy.signalName bezeichnet
    //suche fuer jede interne Darstellung den nutzerdefinierten Namen
    internControlSignals.forEach(currentSignal => {
        //suche seinen Namen
        let name = controlSignalNameLists[currentSignal.getAutomatonId()].nameList[currentSignal.getNumber()].customName
        //fuege es hinzu
        controlSignals.push(new ExternalIndependentControlSignal(new InternalIndependentControlSignal(currentSignal.number , currentSignal.automatonId) , name))
    })
    return controlSignals;
}

/**
 * Extrahiert die Liste unabhaengiger Steuervariablen in deren internen Darstellung
 * @param automatonIds Ids der Automaten
 * @param uiAutomatonData Liste aller Automaten aus der extrahiert werden soll
 * @returns Liste unabhaengiger Steuersignale (interne Darstellung)
 */
export function extractInternControlSignals(automatonIds:Array<number>, controlSignalLists:StorageObject<ControlSignalList>): Array<InternalIndependentControlSignal> {

    let controlSignals: Array<InternalIndependentControlSignal> = [];
    //alle Steuersignale aller Automaten uebernehmen --> werden mit automatXy.signalName bezeichnet
    //Laufe ueber alle Automaten
    automatonIds.forEach(currentAutomatonID => {
        //greife die Daten zu dem Automaten
        let currentAutomatonSignalIds = controlSignalLists[currentAutomatonID].controlSignalIds

         //Speichere das aktuell betrachtete Signal
         //Fuege es als unabhaengiges Signal in die Liste ein
         currentAutomatonSignalIds.forEach(currentSignalId => controlSignals.push( new InternalIndependentControlSignal(currentSignalId , currentAutomatonID)))
    })
    
    return controlSignals;
}


/**
 * Erstellt eine Belegung fuer alle Eingange und z-Variablen 
 * @param inputs Liste aller Eingaenge mit deren Belegung
 * @param zVariablesList Liste aller aktuell existierenden zVariablen aller Automaten, deren Zustande in z-Variablen koodiert werden sollen
 * @param currentStates Aktuelle Zustaende aller Automaten
 * @returns Belegung aller Eingaenge und z-Variablen
 */
export function extractBaseSystemAssignment(inputs: Array<InternalInputAssignment>, zVariablesList: Array<ZVariable> , currentStates:Array<CurrentStateTupel>): BaseSystemAssignment {
    //Extrahiere alle Eingaenge mit deren Belegung
    let inputAssignment = inputs;
    //Koodiere die aktuellen Zustaende aller Automaten in z-Variablen
    let zVariablesAssignment = extractZVariableAssignment(zVariablesList ,currentStates );

    return new BaseSystemAssignment(inputAssignment, zVariablesAssignment);

}


/**
 * Erstelle eine Belegung der Eingaenge, z-Variablen und Steuersignale 
 * @param baseSystemAssignment Aktuelle Belegung fuer alle Eingange und z-Variablen 
 * @param equationSets Gleichungen anhand derer die Belegungen berechnet werden sollen
 * @returns vollstaendige Belegung aller gesetzten Eingange, z-Variablen und Steuersignale  
 *          (alle nicht gelisteten Ausgaben/Steuersignale wurden nicht in den Automaten gesetzt und sind damit implizit logisch 0)
 */
export function extractDerivedSystemAssignment(baseSystemAssignment:BaseSystemAssignment ,
    equationSets:Array<AutomatonEquationSet>): DerivedSystemAssignment {

    //berechne die Belegung der Steuervariable anhand der anderen Belegungen
    let controlSignalAssignment = extractControlSignalAssignment(equationSets, baseSystemAssignment)

    return new DerivedSystemAssignment(baseSystemAssignment.inputAssignment, baseSystemAssignment.zVariableAssignment, controlSignalAssignment)

}

/**
 * Erstelle eine vollstaendige Belegung der Eingaenge, z-Variablen, Steuersignale und Ausgaenge
 * @param derivedSystemAssignment Aktuelle Belegung fuer alle Eingange, Steuersignale und z-Variablen 
 * @param equationSets Gleichungen anhand derer die Belegungen berechnet werden sollen
 * @returns vollstaendige Belegung aller gesetzten Eingange, z-Variablen, Steuersignale und Ausgaenge
 *  (alle nicht gelisteten Ausgaben/Steuersignale wurden nicht in den Automaten gesetzt und sind damit implizit logisch 0)
 */
export function extractFullSystemAssignment(derivedSystemAssignment:DerivedSystemAssignment ,equationSets:Array<AutomatonEquationSet>): FullSystemAssignment {

    //berechne Belegung aller Ausgenge
    let outputAssignment = extractOutputAssignment(equationSets, derivedSystemAssignment)

    return new FullSystemAssignment(derivedSystemAssignment.inputAssignment, derivedSystemAssignment.zVariableAssignment, derivedSystemAssignment.controlSignalAssignment,
        outputAssignment)

}

/**
 * Extrahiere alle aktuell existierenden z-Variablen
 * @param automatonList Liste aller Automaten fuer die die z-Variablen gesucht werden
 * @returns Liste aller automatenunabhaengigen z-Variablen
 */
export function extractZVariables(automatonStructureList: Array<RawAutomatonStructure>): Array<ZVariable> {
    //Liste fuer die z-Variablen aller Automaten
    let zVariables: Array<ZVariable> = [];
    //Laufe ueber alle Automatenstrukturen
    automatonStructureList.forEach(currentStructure => {
        //berechne die Anzahl benoetigter z-Variablen aus maximaler Zustandsnummer
        let maxStateNumber = getMaxCustomStateNumber(currentStructure.nodes);
        let neededVariables = calculateNeededVariables(maxStateNumber)
    
        //erstelle so viele z-Variablen fuer den aktuellen Automaten (z_0 bis z_(Anzahl-1))
        for(let zCounter=0; zCounter<neededVariables ; zCounter++){
            zVariables.push(new ZVariable(currentStructure.id , zCounter))
        }
    })

    //Liste ausgeben
    return zVariables
}


/**
 * Berechne die Belegung aller z-Variablen aller Automaten aus deren aktuellen Zustaenden
 * @param zVariablesList Liste aller aktuell existierenden zVariablen aller Automaten, deren Zustande in z-Variablen koodiert werden sollen
 * @param currentStates Aktuelle Zustaende aller Automaten
 * @returns Liste aller automatenunabhaengigen z-Variablen, die die aktuellen Zustaende der Automaten koordieren
 */
function extractZVariableAssignment(zVariablesList: Array<ZVariable> , currentStates:Array<CurrentStateTupel>): Array<ZVariableAssignment> {
    //die aktuellen Zustaende aller Automaten als Z-Variablen Koordieren und diese speichern
    let zVariablesAssignment: Array<ZVariableAssignment> = [];
   
    //laufe ueber die aktuellen Zustaende aller Automaten
    currentStates.forEach(currentStateTupel => {
        //Finde alle zVariablen, die zu diesem Automaten gehoeren (Id gleich)
       let currentAutomatonZVariables = zVariablesList.filter(zVariable => zVariable.getAuomatonId() === currentStateTupel.id)
       //laufe ueber alle Variablen und finde heraus ob die aktuelle zVariable zum koodieren des Zustandes gebraucht wird 
       currentAutomatonZVariables.forEach(currentZVariable => {
             //verschiebe die aktuelle Zustandsnummer um die Nummer der zVariablen viele Stellen bitweise nach rechts 
            //entsteht nun bei der Und-Verknueofung mit 1 eine 1 als Ergebnis, so muss die zVariable fuer die Koodierung gesetzt sein
            let result = (currentStateTupel.currentState >> currentZVariable.getNumber()) & 1

            //ist das Ergebnis 1 so setze die z-Variable
            let isSet:boolean = false
            if(result === 1){ isSet =true}

            //Speichere die zvariable
            zVariablesAssignment.push(new ZVariableAssignment(currentZVariable , isSet))
            
       })

    })

    return zVariablesAssignment
}


/**
 * Berechne die Belegung der Steuervariablen aller Automaten aus der Eingangsbelegung und den aktuellen Zustaenden der Automaten
 * @param equationSets Liste der Gleichungen, welche zur Berechnung der Belegungen verwendet werden sollen (fuer jeden Automaten darf nur ein Set in der Liste existieren)
 *                      (Signale ohne Gleichungen werden nicht im Ergebnis aufgefuehrt und sind damit implizit logisch 0)
 * @param variablesAssignment Belegung der Eingange und z-Variablen aller Automaten
 * @returns Belegung aller Steuersignale (nicht in den Automaten verwendete Signale werden nicht berechnet ==> waeren logisch 0)
 */
function extractControlSignalAssignment(equationSets:Array<AutomatonEquationSet>, variablesAssignment: BaseSystemAssignment): Array<InternalIndependentControlSignalAssignment> {

    let controlSignalAssignment: Array<InternalIndependentControlSignalAssignment> = [];
    //alle Steuersignale aller Automaten auswerten --> werden mit automatXy.signalName bezeichnet
    equationSets.forEach(currentEquationSet => {
        //werte fuer jedes im Automaten verwendete Signal (hat eine Gleichung) seine Gleichung aus
        currentEquationSet.controlSignalEquations.forEach(currentControlSignalEquation =>{
            //werte die Gleichung anhand der Belegung aus (Gleichungen fuer Steuersignale duerfen keine Steuersignale enthalten, weshalb sie mit einer 
            //abgeleiteten Belegung ausgewertet werden koennen)
            let assignment =CompleteTreeRoot.evaluateWithoutCS(currentControlSignalEquation.equation,variablesAssignment)
            //Speichere die Belegung 
            controlSignalAssignment.push(new InternalIndependentControlSignalAssignment(currentControlSignalEquation.getVariable() , assignment))
        })
    })
    return controlSignalAssignment;
} 


/**
 * Berechne die Belegung der Ausgeange aller Automaten aus der Eingangsbelegung und den aktuellen Zustaenden der Automaten
 * @param equationSets Liste der Gleichungen, welche zur Berechnung der Belegungen verwendet werden sollen (fuer jeden Automaten darf nur ein Set in der Liste existieren)
 *                      (Signale ohne Gleichungen werden nicht im Ergebnis aufgefuehrt und sind damit implizit logisch 0)
 * @param variablesAssignment Belegung der Eingange, Steuersignale und z-Variablen
 * @returns Belegung aller Ausgaenge (nicht in den Automaten verwendete Signale werden nicht berechnet ==> waeren logisch 0)
 */
function extractOutputAssignment(equationSets:Array<AutomatonEquationSet>, variablesAssignment: DerivedSystemAssignment): Array<InternalOutputAssignment> {
   
    let outputAssignment: Array<InternalOutputAssignment> = [];//Liste fuer die Ergebnisse
    //Laufe ueber die Gleichungen aller Automaten
    equationSets.forEach(currentEquationSet => {
        //Werte alle Ausgaben anhand der Belegung aus
        currentEquationSet.outputEquations.forEach(currentOutputEquation => {
            //Werte die Gleichung aus 
            let assignment =CompleteTreeRoot.evaluate(currentOutputEquation.equation,variablesAssignment)

            //Preufe ob dieser Ausgang bereits durch andere Automaten gesetzt war --> wenn ja muss das Ergebnis mit logisch ODER verknuepft werden
            let matchAssignment = outputAssignment.find(output => output.getVariable().matchesToInternalRepresentation(currentOutputEquation.getVariable()))
            if(matchAssignment){
                //Ausgang hatte schon Belegung --> logisch oder mit Ergebnis
                matchAssignment.setAssignment(matchAssignment.getAssignment()||assignment)
            }
            else{
                //War noch nicht belegt --> erzeuge neue Belegung
                outputAssignment.push(new InternalOutputAssignment(currentOutputEquation.getVariable(), assignment))
            }

        })
    })

    return outputAssignment
} 