import { ICompleteTreeRoot } from "./BooleanEquations/LogicTrees/TreeRoots";
import { DuplicateNameError, ExpressionSyntaxError, NameSyntaxError, NumberError, UnknownVariableInExpressionError , OutputVariableInExpressionError } from "./Error";

/** Element zur Speicherung eines Namens und eines eventuell aufgetretenen Fehlers bei der Namensvergabe, welches so im State abgelegt wird und auch in die GUI gegeben wird */
export interface NameErrorTupel{
    /** 
     * Valider Namen, der vergeben wurde und nun auch im System genutzt wird 
     * Fuehrte die Nutzereingabe zu einem Fehler, so wird hier ein automatisch vergebener Name abgelegt
     */
    validName:string

    /** Bei der letzen Namensvergabe eventuell aufgetretener Fehler (ist undefined falls es keine Fehler gab) */
    error:DuplicateNameError | NameSyntaxError | undefined
}

/** Element zur Speicherung einer Nummer und eines eventuell aufgetretenen Fehlers, welches so im State abgelegt wird und auch in die GUI gegeben wird */
export interface NumberErrorTupel<T>{
    /** 
     * Valide Nummer, die vergeben wurde und nun auch im System genutzt wird 
     * Fuehrte die Nutzereingabe zu einem Fehler, so wird hier eine automatisch vergebene Nummer abgelegt
     */
    validNumber:number

    /** Bei der letzen Namensvergabe eventuell aufgetretener Fehler (ist undefined falls es keine Fehler gab) */
    error: T | undefined
}


/** 
 * Element zur Speciherung eines logischen Ausdrucks und eines eventuell aufgetretenen Fehlers beim Parsen, welches so im State abgelegt wird 
 * Kann individuell auf alle im jeweiligen Kontext moeglichen Fehler angepasst werden
*/
export interface ExpressionErrorTupel<T>{
    /** 
     * Valider Ausdruck, der vergeben wurde und nun auch im System genutzt wird 
     * Fuehrte die Nutzereingabe zu einem Fehler, so wird hier ein automatisch gesetzter Ausdruck abgelegt
     */
    validExpression:ICompleteTreeRoot

    /** 
     * Beim letzten Parsen eventuell aufgetretener Fehler (ist undefined falls es keine Fehler gab) 
     * Es muessen explizit alle Typen von Fehler gelistet werden, die auftreten koennen
    */
    error:  undefined | T
}