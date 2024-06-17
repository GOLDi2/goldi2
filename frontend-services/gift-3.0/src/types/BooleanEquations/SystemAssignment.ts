
import { immerable } from 'immer';
import { FullApiTransformable } from '../ApiTransformable';
import { CustomNames } from './CustomNames';
import { ApiAutomatonAssignment, ApiFullSystemAssignment } from '../ApiClasses/SystemAssignment';
import { ApiControlSignalAssignment, ApiInputAssignment, ApiOutputAssignment, ApiZVariableAssignment } from '../ApiClasses/SignalAssignments';
import { InternalIndependentControlSignalAssignment } from '../ControlSignal';
import { InternalInputAssignment } from '../Input';
import { InternalOutputAssignment } from '../Output';
import { ZVariable, ZVariableAssignment } from '../ZVariable';
import { SignalAssignment } from './SignalAssignment';
import { getAutomatonName } from '../../actioncreator/helperfunctions';

/**
 * Darstellung aller aktuellen Belegungen der Eingange und z-Variablen
 * Es sind alle aktuell existenten Eingaenge und die Belegung aller existenten ZVariablen enthalten
 */
export class BaseSystemAssignment {
    [immerable] = true;
    /**aktuelle Belegung aller Eingaenge */
    public inputAssignment: Array<InternalInputAssignment>;

    /**Aktuelle Belegung der z-Variablen --> fehlende Variablen sind als false zu interpretieren*/
    public zVariableAssignment: Array<ZVariableAssignment>;

    /**
     * Erstellt eine neue Teilbelegung des Systems (ohne Steuervariablen)
     * @param inputAssignment Liste aller Eingaenge mit deren aktueller Belegung
     * @param zVariableAssignment Liste der Belegungen aller z-Variablen (bei Nichtangabe alle als false ansehen, indem die Liste leer gelassen wird)
     */
    constructor(inputAssignment: Array<InternalInputAssignment>, zVariableAssignment: Array<ZVariableAssignment> = []) {
        this.inputAssignment = inputAssignment;
        this.zVariableAssignment = zVariableAssignment;
    }
}

/**
 * Interne Darstellung einer Vollstaendigen Belegung aller Variablen zu einem konkreten Zeitpunkt
 * Erweitert {@link BaseSystemAssignment} um die Belegung aller Stuersignale des Systems (auch wenn diese nicht verwendet werden sind sie = 0)
 */
export class DerivedSystemAssignment extends BaseSystemAssignment {
    [immerable] = true;
    /**aktuelle Belegung aller Steuersignale --> evtl. fehlende Variablen sind als false zu interpretieren*/
    public controlSignalAssignment: Array<InternalIndependentControlSignalAssignment>



    /**
     * Erstellt eine neuen Belegung des Systems (ohne Ausgaenge)
     * @param inputAssignment Liste aller Eingaenge mit deren aktueller Belegung
     * @param controlSignals Liste aller Steuersignale (unabhaengig vom Automaten) mit deren Belegung 
     * @param zVariableAssignment Liste aller z-Variablen mit deren Belegung
     */
    constructor(inputAssignment: Array<InternalInputAssignment>, zVariableAssignment: Array<ZVariableAssignment>, controlSignalAssignment: Array<InternalIndependentControlSignalAssignment>) {
        super(inputAssignment, zVariableAssignment);

        this.controlSignalAssignment = controlSignalAssignment;

    }
}

/**
 * Darstellung einer selbsterstellten Belegung zum Auswerten von Ausdruecken fuer jede moegliche Belegung
 * Wird im Vergleich zur Oberklasse selbstaendig und inkrementell erstellt und spiegelt NICHT die Systembelegung wieder
 * Enthaelt NICHT zwingend alle Variablen sondern nur die, die fuer die Auswertung eines Ausdrucks benoetigt werden
 */
export class CustomDerivedSystemAssignment extends DerivedSystemAssignment {

    /**
     * Erstelle eine neue leere Belegung die nun inkrementell gefuellt wird
     */
    constructor() {
        super([], [], [])
    }
    /**
     * Einfuegen einer neuen Variablenbelegung (eventuelle Dopplungen muessen vorher ausgeschlossen werden und werden hier nicht aufgeloest)
     * @param variableAssignment belegte Variable die eingefuegt werden soll 
     */
    addAssignment(variableAssignment: SignalAssignment): void {
        //Welcher Typ von belegter variable liegt vor --> fuege sie in die richtige Liste ein
        if (variableAssignment instanceof InternalInputAssignment) {
            this.inputAssignment.push(variableAssignment)
        }
        else if (variableAssignment instanceof ZVariableAssignment) {
            this.zVariableAssignment.push(variableAssignment)
        }
        else if (variableAssignment instanceof InternalIndependentControlSignalAssignment) {
            this.controlSignalAssignment.push(variableAssignment)
        }
        //in allen anderen Faellen gehoert Variable nicht in die Belegung (sollte nie auftreten)
    }
}

/**
 * Darstellung einer vollstaendigen Belegung des Systems
 * Erweitert {@link DerivedSystemAssignment}
 * Es sind die Belegungen aller Steuersignale und Ausgaben enthalten (wird ein Signal in keinem Knoten im
 * ganzen System als Ausgabe verwendet, so ist seine Belegung implizit logisch 0 )
 *  (z_i , x_i , s_i , y_i)
 */
export class FullSystemAssignment extends DerivedSystemAssignment implements FullApiTransformable {
    [immerable] = true;
    /**aktuelle Belegung aller Ausgaenge --> evtl. fehlende Variablen sind als false zu interpretieren*/
    public outputAssignment: Array<InternalOutputAssignment>

    /**
     * Erstellt eine neuen Belegung des Systems mit den Ausgaengen
     * @param inputAssignment Liste aller Eingaenge mit deren aktueller Belegung
     * @param controlSignals Liste aller Steuersignale (unabhaengig vom Automaten) mit deren Belegung 
     * @param zVariableAssignment Liste aller z-Variablen mit deren Belegung
     * @param outputAssignment Liste aller Ausgaenge mit deren Belegung
     */
    constructor(inputAssignment: Array<InternalInputAssignment>, zVariableAssignment: Array<ZVariableAssignment>, controlSignalAssignment: Array<InternalIndependentControlSignalAssignment>,
        outputAssignment: Array<InternalOutputAssignment>) {
        super(inputAssignment, zVariableAssignment, controlSignalAssignment);

        this.outputAssignment = outputAssignment;

    }

    toExternalGraphRepresentation(customNames: CustomNames): ApiFullSystemAssignment {
        //alle Belegungen in Ausgabeformat bringen

        //alle Eingange 
        let apiInputs: Array<ApiInputAssignment> = [];
        for (let signalCounter = 0; signalCounter < this.inputAssignment.length; signalCounter++) {
            let currentPair = this.inputAssignment[signalCounter];
            apiInputs.push(currentPair.toExternalGraphRepresentation(customNames))
        }

        //alle Ausgaenge 
        let apiOutputs: Array<ApiOutputAssignment> = [];
        for (let signalCounter = 0; signalCounter < this.outputAssignment.length; signalCounter++) {
            let currentPair = this.outputAssignment[signalCounter];
            apiOutputs.push(currentPair.toExternalGraphRepresentation(customNames))
        }


        //Nun muessen alle automatengebundenen Variablen ihrem Automaten zugeordnet werden
        //Erstelle eine Liste fuer alle Belegungen aler aktuell existierenden Automaten (Es sollten nur Variablen zu diesen Automaten existieren)
        let automatonAssignmentList: Array<ApiAutomatonAssignment> = []
        customNames.automatonNames.forEach(automatonNameTupel => {
            let automatonAssignment = new ApiAutomatonAssignment(automatonNameTupel.customName.validName)
            automatonAssignment.currentState = 0
            automatonAssignmentList.push(automatonAssignment)
        })

        //hierbei jeweils den Einfluss der Belegung der zVariablen auf den Zustand des Automaten berechnen
        for (let zCounter = 0; zCounter < this.zVariableAssignment.length; zCounter++) {
            //Greife die aktuelle z-Belegung und ihre zVariable 
            let currentZAssignment = this.zVariableAssignment[zCounter];
            let currentZVariable = currentZAssignment.getVariable()

            //Suche den Namen des Automaten zu dem diese Variable gehoert --> sollte immer existieren 
            let automatonName = customNames.automatonNames.find(automatonNameTupel => automatonNameTupel.id === currentZVariable.getAuomatonId())?.customName

            if (automatonName) {
                //Suche den Automaten zu dem die Variable gehoert
                let matchName = automatonName
                let matchAutomaton = automatonAssignmentList.find(automatonAssignment => automatonAssignment.automatonName === matchName.validName)
                if (matchAutomaton) {
                    //Sollte immer existieren

                    //Berechne die Api-Darstellung der Belegung
                    let apiZAssignment = currentZAssignment.toExternalGraphRepresentation()

                    //Berechne den Eingluss der zVariablen auf den Automatenzustand (wenn Belegung = 1, dann 2^(Nummer von z) als Einfluss)
                    let stateInfluence = 0;
                    if (currentZAssignment.getAssignment()) {
                        //Belegung ist 1 --> Zustand wird beeinflusst
                        stateInfluence = stateInfluence + (1 << currentZVariable.getNumber())
                    }

                    //Der zugehoerige Automat sollte immer in der Liste existieren

                    //Wenn ja dann fuege dem Automaten die zVariable hinzu (mit ihrem Einfluss auf den State)

                    //fuege die Variable hinzu
                    matchAutomaton.zVariableAssignment.push(apiZAssignment)
                    //berechne den Einfluss auf den state
                    matchAutomaton.currentState = matchAutomaton.currentState + stateInfluence

                }

            }

        }

        //alle Steuersignale ihrem entsprechenden Automaten zuordenen 
        for (let controlSignalCounter = 0; controlSignalCounter < this.controlSignalAssignment.length; controlSignalCounter++) {
            //Greife die aktuelle Seterusignalbelegung und ihre Variable
            let currentControlSignalAssignment = this.controlSignalAssignment[controlSignalCounter];
            let currentControlSignal = currentControlSignalAssignment.getVariable()

            //Berechne die Api-Darstellung der Belegung
            let apiControlSignalAssignment = currentControlSignalAssignment.toExternalGraphRepresentation(customNames)

            //Suche den Namen des Automaten zu dem diese Variable gehoert --> sollte immer existieren 
            let automatonName = customNames.automatonNames.find(automatonNameTupel => automatonNameTupel.id === currentControlSignal.getAutomatonId())?.customName
            if (automatonName) {
                //Suche den Automaten zu dem die Variable gehoert
                let matchName = automatonName
                let matchAutomaton = automatonAssignmentList.find(automatonAssignment => automatonAssignment.automatonName === matchName.validName)
                if(matchAutomaton){
                    //Sollte immmer existieren

                    //fuege die Variable hinzu
                    matchAutomaton.controlSignalAssignment.push(apiControlSignalAssignment)

                }

            }
        }

        //Neue Api-Belegung erstellen
        return new ApiFullSystemAssignment(apiInputs, automatonAssignmentList, apiOutputs)
    }
}
