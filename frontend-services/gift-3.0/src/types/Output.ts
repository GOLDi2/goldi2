import { BaseInternAdressable, CustomNameRepresentation, ExternRepresentation} from './Signal';
import {immerable} from 'immer'
import { getCustomNameFromInternalRepresentation } from '../actioncreator/helperfunctions';
import { CustomNames } from './BooleanEquations/CustomNames';
import { ApiOutputAssignment } from './ApiClasses/SignalAssignments';
import { SignalAssignment } from './BooleanEquations/SignalAssignment';
import { InternalInput, InternalInputAssignment } from './Input';
import { NameErrorTupel } from './ErrorElements';


    /** Vorsilbe des internen Names von Eingangsvariablen */
    export const Y_NAME = "y"
/**
 * Darstellung einer Ausgangsvariablen in interner Form (nur interner Name)
 */
export class InternalOutput extends BaseInternAdressable{
    [immerable]=true;

       /**
     * Erstellung einer neuen y-Variablen
     * @param number Nummer i des Names y_i
     */
    constructor(number:number){
        super(number)
    }

    createAssignment(customNames:CustomNames, assignment:boolean):InternalOutputAssignment{
        return new InternalOutputAssignment(this , assignment)
    }
    
     toCustomString(customNames:CustomNames):string{
        //suche diesen Eingang -->erstelle seine externe Darstellung und lies diese aus
        let customName = getCustomNameFromInternalRepresentation(customNames.outputs, this)
        return customName
    }
     
    getInternalName():string{
        return Y_NAME + this.number
    }

    matchesToInternalRepresentation(internalSignal:BaseInternAdressable):boolean{
        //fuer Glecihheit muss das zu pruefende Signal die gleiche Ausgangsvariable sein
        let match = false
        if(internalSignal instanceof InternalOutput){
            //Stimmt die Nummer ? --> diese identifiziert einen Ausgang innerhalb aller Ausgaenge eindeutig
            if(internalSignal.number === this.number){
                //alles gleich 
                match =true
            }
        }
        //sonst stimmt etwas nicht ueberein -->kein Match
        return match
    }
}

/**
 * Nutzerdefinierte Darstellung eines Ausgangssignals
 */
export class CustomOutputRepresentation extends CustomNameRepresentation{
    /**
     * Erstelle ein global eindeutiges Ausgangssignal in nutzerdefinierte Darstellung (global eindeutig)
     * @param customName nutzerdefinierter Name des Ausgangs
     */
    constructor(customName:string){
        super(customName)
    }
}

/**
 * Darstellung eines Ausgangssignals y_i in externer Darstellung (so werden sie im State abgelegt)
 * Ausgaben koennen nicht in einem logischen Baum entahlten sein
 */
export class ExternalOutput extends ExternRepresentation{
    public variable:InternalOutput

    /**
     * Erstelle eine neue Ausgangsvariable im Ausgabeformat
     * @param output Ausgang y_i der fuer den die externen Darstellung erstellt werden soll
     * @param customName nutzerdefinierter Name  (muss vorher uber {@link isUsableSignalName} geprueft werden)
     */
    constructor(output:InternalOutput, customName:NameErrorTupel){
        super(output , customName)
    }

    matchesToCustomNameRepresentation(candidate:CustomNameRepresentation):boolean{
        //stimmt ueberein wenn beide Signale Ausgeange sind und alle  Parameter gleich sind
         let match = false
         if(candidate instanceof CustomOutputRepresentation){
              //Stimmen alle Parameter? (fuer Ausgaenge muss nur der customName gleich sein)
             if(candidate.customName.toLocaleLowerCase() === this.customName.validName.toLocaleLowerCase()){
                 //alles gleich 
                  match =true
             }
         }
         //sonst stimmt etwas nicht ueberein --> kein Match
         return match
     }

}


/**
 * Interne Darstellung einer Ausgangsbelegung (werden nicht im State abgelegt sondern immer nur berechnet, weshalb sie eine interne Darstellungsform sind)
 */
export class InternalOutputAssignment extends SignalAssignment{
    [immerable] = true
    public variable:InternalOutput
   /**
    * Erstelle eine neue Belegung eines Ausgangs
    * @param output zu belegender Ausgang
    * @param assignment Belegung
    */
    constructor(output:InternalOutput , assignment=false){
        super(output , assignment)
    }

    toExternalGraphRepresentation(customNames:CustomNames):ApiOutputAssignment{
        //berechne den nutzerNamen der variablen
        let customName = this.getVariable().toCustomString(customNames)
        return new ApiOutputAssignment(customName,this.assignment)
    }

    getAssignment():boolean{
        return this.assignment
    }

    /**setzen der Belegung der Variablen */
    setAssignment(assignment:boolean):void{
        this.assignment = assignment
    }
    getVariable():InternalOutput{
        return this.variable
    }
}
