/** 
 * Element zur Speciherung eines logischen Ausdrucks und eines eventuell aufgetretenen Fehlers beim Parsen, welches so im State abgelegt wird 
 * Kann individuell auf alle im jeweiligen Kontext moeglichen Fehler angepasst werden
*/
export interface ApiExpressionErrorTupel<T>{
    /** 
     * Valider Ausdruck, der vergeben wurde und nun auch im System genutzt wird (falls ein Fehler bei der letzen Eingabe aufgetreten ist, so wurde dieser automatisch gewaehlt)
     */
    validExpression:string

    /** 
     * Beim letzten Parsen eventuell aufgetretener Fehler (ist undefined falls es keine Fehler gab) 
     * Es muessen explizit alle Typen von Fehler gelistet werden, die auftreten koennen
    */
    error:  undefined | T
}

