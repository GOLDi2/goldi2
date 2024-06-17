import { immerable } from 'immer';
import { IGNORED } from 'typedoc/dist/lib/utils/options/sources/typescript';
import { ApiZVariableAssignment } from './ApiClasses/SignalAssignments';
import { CustomNames } from './BooleanEquations/CustomNames';
import { CompleteTreeZVariableNode } from './BooleanEquations/LogicTrees/Variables';
import { SignalAssignment } from './BooleanEquations/SignalAssignment';
import { BaseInternAdressable, CustomNameRepresentation, ExternRepresentation, SignalTreeRepresentation} from './Signal';

/**Vorsilbe des internen Namens von z-Variablen */
export const Z_NAME= "z"
/**Regex der das Schema der Bennenung von Z-Variablen beschreibt  
 * Namen von Z-Variablen sind zu reservieren und duerfen nicht durch andere Variablen besetzt werden (nur keine direkte 1:1 Uebereinstimmung erlaubt)
*/
export const ZNaming= new RegExp(Z_NAME +"[0-9]+$","i")

/**
 * Interne Darsetellung einer z-Variablen z_i
 * Beinhaltet alle noetigen Informationen zur Darstellung als Baum
 * kann innerhalb von z-Gleichungen ein Teil der Gleichung sein
 */
export class ZVariable extends BaseInternAdressable implements SignalTreeRepresentation{
    [immerable] = true

    /**Name des Automaten zu dem die Variable gehoert */
    public automatonId:number;

    /**
     * Erstelle die z-Variable z_i (alle Namen zu z_i setzen)
     * @param number Index i der Variablen z_i
     * @param automatonId Id des zugehoerigen Automaten
     */
    constructor(automatonId:number ,number:number){
        super(number)
        this.automatonId = automatonId;
    }

    createAssignment(assignment:boolean):ZVariableAssignment{
        return new ZVariableAssignment(this , assignment)
    }

    createCompleteTreeNode(bracketCounter?:number):CompleteTreeZVariableNode{
        //erstelle einen neuen Knoten fuer eine z-Variable
        return new CompleteTreeZVariableNode(this, bracketCounter)
    }
    toCustomString():string{
        // Da alle z-Variablen innerhalb eines Ausdrucks immer zum gleichen Automaten gehoren genuegt die Ausgabe des Namens ohne die Vorsilbe des Atuomatennamens
        return this.getInternalName()
    }

    toAutomatonPrefixCustomString(customNames:CustomNames):string{
        //Automatenprefix: Automatenname
        let resultString = ""
        let automatonName = customNames.automatonNames.find(currentTupel => currentTupel.id === this.getAuomatonId())?.customName.validName //Name des Automaten dieser Variable
        if(automatonName !== undefined){
            resultString = automatonName +"." + this.toCustomString()
        }
        return resultString
    }

    getInternalName():string{
        return Z_NAME+this.number
    }
    getAuomatonId():number{
        return this.automatonId
    }

    
    matchesToInternalRepresentation(internalSignal:BaseInternAdressable):boolean{
        //fuer Glecihheit muss das zu pruefende Signal die gleiche z-Variable sein
        let match = false
        if(internalSignal instanceof ZVariable){
            //Stimmen alle Parameter ?
            if(internalSignal.automatonId === this.automatonId && internalSignal.number === this.number){
                //alles gleich 
                match =true
            }
        }
        //sonst stimmt etwas nicht ueberein -->kein Match
        return match
    }

     
    // getCustomName():string{
    //     //externe Darstellung genauso wie intern
    //     return this.getInternalName()
    // }
}



/**
 * Darstellung der aktuellen Belegung einer z-Variablen
 */
export class ZVariableAssignment extends SignalAssignment{
    [immerable] = true

   public variable:ZVariable
     /**
      * Erstelle eine neue Belegung einer Z-Variablen
      * @param zVariable zu belegende z-Variable
      * @param assignment aktuelle Belegung
      */
    constructor(zVariable:ZVariable,assignment:boolean) {
        super(zVariable , assignment)
    }

    toExternalGraphRepresentation():ApiZVariableAssignment{
        //In die Belegung geht der interne Name ein, da der Automatenname extra abgelegt wird
        return new ApiZVariableAssignment(this.getVariable().getInternalName() , this.assignment)
    }
    getVariable():ZVariable{
        return this.variable
    }
   
}