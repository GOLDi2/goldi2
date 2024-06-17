import { BaseInternAdressable, CustomNameRepresentation, ExternRepresentation, SignalTreeRepresentation } from './Signal';
import { immerable } from 'immer'
import { getCustomNameFromInternalRepresentation } from '../actioncreator/helperfunctions';
import { CustomNames } from './BooleanEquations/CustomNames';
import { FullApiTransformable } from './ApiTransformable';
import { ApiInputAssignment } from './ApiClasses/SignalAssignments';
import { SignalAssignment } from './BooleanEquations/SignalAssignment';
import { CompleteTreeInputNode } from './BooleanEquations/LogicTrees/Variables';
import { BaseCompleteTreeNode } from './BooleanEquations/LogicTrees/TreeNodeInterfaces';
import { NameErrorTupel } from './ErrorElements';

/** Vorsilbe des internen Names von x-Variablen */
export const X_NAME = "x"

/**
 * interne Darstellung eiens Eingangssignals x_i ohne dessen Belegung und nutzerdefinierten Namen
 * Beinhaltet alle noetigen Informationen zur Darstellung als Baum
 */
export class InternalInput extends BaseInternAdressable implements SignalTreeRepresentation {
    [immerable] = true;

    /**
     * Erstellung einer neuen x-Variablen mit 
     * @param number Nummer i des Names x_i
     */
    constructor(number: number) {
        super(number)
    }


    createAssignment(assignment: boolean): InternalInputAssignment {
        return new InternalInputAssignment(this, assignment)
    }

    createCompleteTreeNode(bracketCounter?: number): BaseCompleteTreeNode {
        //Erstelle einen neuen Eingang als Knoten
        return new CompleteTreeInputNode(this, bracketCounter)
    }


    toCustomString(customNames: CustomNames): string {
        //suche diesen Eingang -->erstelle seine externe Darstellung und lies diese aus
        let customName = getCustomNameFromInternalRepresentation(customNames.inputs, this)
        return customName
    }

    getInternalName(): string {
        return X_NAME + this.number
    }

    matchesToInternalRepresentation(internalSignal:BaseInternAdressable):boolean{
        //fuer Glecihheit muss das zu pruefende Signal die gleiche Eingangsvariable sein
        let match = false
        if(internalSignal instanceof InternalInput){
             //Stimmen alle Parameter? (innerhalb der Eingaenge muss fuer Eindeutigkeit nur die Nummer uebereinstimmen)
            if(internalSignal.number === this.number){
                //alles gleich 
                 match =true
            }
        }
        //sonst stimmt etwas nicht ueberein --> kein Match
        return match
    }
}

/**
 * Nutzerdefinierte Darstellung eines Eingangssignals
 */
export class CustomInputRepresentation extends CustomNameRepresentation{
      /**
     * Erstelle ein global eindeutiges Eingangssignal in nutzerdefinierte Darstellung (global eindeutig)
     * @param customName nutzerdefinierter Name des Eingangs
     */
    constructor(customName:string){
        super(customName)
    }
}

/**
 * Darstellung einer Eingangsvariablen mit deren nutzerdefinierten Bezeichnung (externe Darstellung)
 */
export class ExternalInput extends ExternRepresentation {
    
    public variable:InternalInput
    
    /**
     * Erstelle eine externe Darstellung eines Eingangs x_i
     * @param input interne Darstellung des Eingangs x_i
     * @param customName nutzerdefinierter Name  (muss vorher uber {@link isUsableSignalName} geprueft werden) 
     */
    constructor(input: InternalInput, customName: NameErrorTupel) {
        super(input, customName)
    }

    matchesToCustomNameRepresentation(candidate:CustomNameRepresentation):boolean{
        //stimmt ueberein wenn beide Signale Eingeange sind und alle  Parameter gleich sind
         let match = false
         if(candidate instanceof CustomInputRepresentation){
              //Stimmen alle Parameter? (fuer Eingaenge muss nur der customName gleich sein)
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
 * interne Darstellung eiens Eingangssignals x_i mit dessen Belegung
 */
export class InternalInputAssignment extends SignalAssignment {
    [immerable] = true;
    public variable: InternalInput
    /**
     * Erstellung einer neuen x-Variablen mit ihrer aktuellen Belegung
     * @param input Eingangsvariable die belegt werden soll
     * @param assignment initiale Belegung des Eingangs (bei Nichtangabe: false)
     */
    constructor(input: InternalInput, assignment = false) {
        super(input, assignment)
    }

    toExternalGraphRepresentation(customNames: CustomNames): ApiInputAssignment {
        return new ApiInputAssignment(this.getVariable().toCustomString(customNames), this.assignment)
    }
    getAssignment(): boolean {
        return this.assignment
    }
    /**setzen der Belegung der Variablen */
    setAssignment(assignment: boolean): void {
        this.assignment = assignment
    }
    getVariable(): InternalInput {
        return this.variable
    }
}

