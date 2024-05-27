import { BaseInternAdressable ,CustomNameRepresentation,ExternRepresentation,SignalTreeRepresentation } from './Signal';
import { immerable } from 'immer'
import { truncate } from 'lodash';
import { getAutomatonName, getCustomNameFromInternalRepresentation } from '../actioncreator/helperfunctions';
import { CustomNames } from './BooleanEquations/CustomNames';
import { ApiControlSignalAssignment } from './ApiClasses/SignalAssignments';
import { SignalAssignment } from './BooleanEquations/SignalAssignment';
import { CompleteTreeControlSignalNode } from './BooleanEquations/LogicTrees/Variables';
import { BaseCompleteTreeNode } from './BooleanEquations/LogicTrees/TreeNodeInterfaces';
import { NameTupel } from './NormalizedState/SignalSubState';
import { NameErrorTupel } from './ErrorElements';


/** Vorsilbe des internen Names von Steuervariablen */
export const S_NAME = "s"

/**
 * Steuersignale zur Realisierung paralleler Automaten:s_i
 * Dieser Datentyp ist im State verankert
 * Beinhaltet noch NICHT alle noetigen Informationen zur Darstellung als Baum (zugehoeriger Automat fehlt)
 * Benoetigen daher noch das wissen ueber den zugeordneten Automaten um zu einer Externen Darstellung zu werden
 */
export class ControlSignal implements NameTupel{
    [immerable] = true

    /**Interne Nummer i des Steuersignals s_i (nur im Kontext des zugehoerigen Automaten eindeutig) */
    public id: number

    /** nutzerdefinierte Bezeichnung */
    public customName: NameErrorTupel;
    /**
     * Erstellung einer neuen Steuervariablen
     * @param number Nummer i des internern Namen s_i
     * @param customName nutzerdefinierter Name (bei Nichtangabe entspricht dieser der internen, fortlaufenden Nummerierung) (muss vorher uber {@link isUsableSignalName} geprueft werden)
     */
    constructor(number: number, customName?: NameErrorTupel) {

        this.id = number

        if (typeof customName != 'undefined') {
            this.customName = customName;
        }
        else {
            this.customName ={validName:S_NAME + this.id , error:undefined} ; //keine Fehler
        }
    }

    /**
     * Erstelle eine unabhaengige Darstellung dieses Signals, welche ihren zugeordneten Automaten kennt
     */
    createIndependentRepresentation(automatonId: number): ExternalIndependentControlSignal {
        return new ExternalIndependentControlSignal(new InternalIndependentControlSignal(this.id , automatonId),this.customName)
    }

    // getCustomName(): string {
    //     return this.customName.validName
    // }
    /**
     * Setze den nutzerdefinierten Namen
     * @param customName nutzerdefinierter Name  (muss vorher uber {@link isUsableSignalName} geprueft werden)
     */
    // setCustomName(customName: string) {
    //     this.customName = customName
    // }
    getInternalName(): string {
        return S_NAME + this.id
    }
    getNumber(): number {
        return this.id
    }

}
/**
 * Global eindeutige Darstellung einer SteuerVariablen nur anhand ihres customNames und des Automaten
 * --> nutzerdefinierte Darstellung eines Steuersignals
 */
export class customControlSignalRepresentation extends CustomNameRepresentation{   
    /**Id des zugehoreigen Automaten (fuer globale Eindeutigkeit noetig) */ 
    automatonId:number
    /**
     * Erstelle neue nutzerdefinierte externe Darsetllung einer SteuerVariablen (global eindeutig)
     * @param customName externer Name der SteuerVariablen 
     * @param automatonId Id des zugehoerigen Automaten
     */
    constructor(customName:string , automatonId:number){
        super(customName)
        this.automatonId = automatonId
    }
}

/**
 * Klasse fuer Steuersignale ausserhalb ihres Automaten in interner Form (speichern auch ihren zugehoerigen Automaten)
 * Beinhaltet alle noetigen Informationen zur Darstellung als Baum
 */
export class InternalIndependentControlSignal extends BaseInternAdressable implements SignalTreeRepresentation {
    [immerable] = true;

    /**Id des Automaten zu dem das Sognal zugeordnet wird */
    public automatonId: number;

    /**
     * Erstellt ein neues unabhaengiges Steuersignal
     * @param number Nummer i der internen Bezeichnung s_i
     * @param automatonId Id des Automaten zu dem das Signal zugeordnet
     */
    constructor(number: number, automatonId: number) {
        super(number)
        this.automatonId = automatonId;
    }

    createAssignment(assignment: boolean): InternalIndependentControlSignalAssignment {
        return new InternalIndependentControlSignalAssignment(this, assignment)
    }

    createCompleteTreeNode(bracketCounter?: number): BaseCompleteTreeNode {
        //erstelle neuen Steuersignalknoten
        return new CompleteTreeControlSignalNode(this, bracketCounter)
    }

    /** 
     * Ausgabe nutzerdefinierten Names dieser Variable ohne Vorsilbe des Automaten (nicht global eindeutig)
     * Muss im Kontext des richtigen Automaten verwendet/angezeigt werden
     * @returns nutzerdefinierter Name dieses Signals ohne Automatenvorsilbe
     */
    getCustomName(customNames:CustomNames):string{

        let name = getCustomNameFromInternalRepresentation(customNames.controlSignals, this)
        return name
    }

    toCustomString(customNames: CustomNames): string {
        //stelle sich extern da --> bestimme den customName
        let customName =  this.getCustomName(customNames)
        //bestimme den Automatennamen
        let automatonName = getAutomatonName(this.automatonId , customNames)


        //fuer globale Eindeutigkeit muss der Automatenname angehangen werde
        return automatonName + "." + customName
    }

    getInternalName(): string {
        return S_NAME + this.number
    }
    getAutomatonId(): number {
        return this.automatonId
    }
    matchesToInternalRepresentation(internalSignal:BaseInternAdressable):boolean{
        //fuer Glecihheit muss das zu pruefende Signal die gleiche Steuervariable sein
        let match = false
        if(internalSignal instanceof InternalIndependentControlSignal){
             //Stimmen alle Parameter? (innerhalb der Steuersignale muss fuer Eindeutigkeit  die Nummer  und der Automat uebereinstimmen)
            if(internalSignal.number === this.number && internalSignal.automatonId === this.automatonId){
                //alles gleich 
                 match =true
            }
        }
        //sonst stimmt etwas nicht ueberein --> kein Match
        return match
    }

}

/**
 * Klasse fuer Steuersignale ausserhalb ihres Automaten in externer Form (speichern auch ihren zugehoerigen Automaten)
 * Beinhaltet alle noetigen Informationen zur Darstellung als Baum 
 */
export class ExternalIndependentControlSignal extends ExternRepresentation {

    public variable:InternalIndependentControlSignal

    /**
    * Erstellt ein neues unabhaengiges Steuersignal in seiner externen Darstellung
    * @param controlSignal interne Darstellung des Steuersignals fuer das die externe Darstellung erstellt werden soll
    * @param customName nutzerdefinierter Name
    */
    constructor(controlSignal:InternalIndependentControlSignal, customName: NameErrorTupel) {
        super(controlSignal , customName)
    }

    matchesToCustomNameRepresentation(candidate:CustomNameRepresentation):boolean{
        //stimmt ueberein wenn beide Signale Steuersignale sind und alle  Parameter gleich sind
         let match = false
         if(candidate instanceof customControlSignalRepresentation){
              //Stimmen alle Parameter? (innerhalb der Steuersignale muss fuer Eindeutigkeit  die Nummer  und der Automat uebereinstimmen)
             if(candidate.customName.toLocaleLowerCase() === this.customName.validName.toLocaleLowerCase() && candidate.automatonId === this.variable.automatonId){
                 //alles gleich 
                  match =true
             }
         }
         //sonst stimmt etwas nicht ueberein --> kein Match
         return match
     }   
}

/**
 * Darstellung der Belegung eines Steuersignals, das nur mit seinem internen Namen und unabhaengig von seinem Automaten gespeichert wird
 */
export class InternalIndependentControlSignalAssignment extends SignalAssignment {
    [immerable] = true;
    public variable: InternalIndependentControlSignal
    /**
     * Erstelle eine neue Belegung eines Steuersignals
     * @param controlSignal zu belegendes Seteuersignal
     * @param assignment Belegung des Steuersignals
     */
    constructor(controlSignal: InternalIndependentControlSignal, assignment = false) {
        super(controlSignal, assignment)
    }

    toExternalGraphRepresentation(customNames: CustomNames): ApiControlSignalAssignment {
        //berechne den nutzerNamen der variablen
        let customName = this.getVariable().toCustomString(customNames)
        return new ApiControlSignalAssignment(customName, this.assignment)
    }
    getAssignment(): boolean {
        return this.assignment
    }
    /**setzen der Belegung der Variablen */
    setAssignment(assignment: boolean): void {
        this.assignment = assignment
    }
    getVariable(): InternalIndependentControlSignal {
        return this.variable
    }
}


