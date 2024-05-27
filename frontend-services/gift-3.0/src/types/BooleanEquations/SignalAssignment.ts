
import { immerable } from 'immer';
import { mainApiRepresentation } from '../ApiClasses/ApiElement';
import { FullApiTransformable } from '../ApiTransformable';
import { BaseInternAdressable } from '../Signal';
import { CustomNames } from './CustomNames';

/**
 * Darstellung eines Tupels aus einer Variablen mit ihrer Belegung
 */
export abstract class SignalAssignment implements FullApiTransformable{
    [immerable] = true;
    /**logische Belegung der Variablen */
    public assignment:boolean
    /**variable die belegt werden soll */
    public variable:BaseInternAdressable
 
    /**erzeuge das API aequivalent des Elementes */
    abstract toExternalGraphRepresentation(customNames:CustomNames):mainApiRepresentation

    /**
     * Erstelle eine neue Variablenbelegung
     * @param variable Variable die belegt werden soll
     * @param assignment logische Belegung der variablen (automatisch false bei Nichtangabe)
     */
    constructor(variable:BaseInternAdressable , assignment:boolean=false){
        this.assignment = assignment;
        this.variable = variable
    }

    /**Belegung der Variablen ausgeben 
     * @returns Belegung der Variablen
    */
    getAssignment():boolean{
        return this.assignment
    }

    /**setzen der Belegung der Variablen 
     * @param assignment Belegung die fuer die Variable gesetzt werden soll
    */
    setAssignment(assignment:boolean):void{
        this.assignment = assignment
    }

    /**Ausgabe der Variablen die Belegt wird */
    getVariable():BaseInternAdressable{
        return this.variable
    }


}

