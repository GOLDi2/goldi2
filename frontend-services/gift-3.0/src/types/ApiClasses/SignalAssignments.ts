/**Ausgabedarstellung einer Variablen */
export interface ApiVaiable{
      /**Name der Variablen */
      name:string
}


/**Interface fuer alle Belegungen von Variablen in Ausgabedarstellung */
export interface ApiSignalAssignment extends ApiVaiable{
    /**Name der Variablen */
    name:string
    /**aktuelle Belegung */
    assignment:boolean
} 

/** Ausgabedarstellung eines Eingangs */
class ApiInput{
    /**Name der Eingangsvariablen */
    public name:string

    /**
     * Erstelle eine neue Ausgabedarstellung einer Eingangsvariablen
     * @param name Name der Variablen
     */
    constructor(name:string){
        this.name = name
    }
}

/**Ausgabedarstellung einer Eingangsvariablen mit ihrer Belegung */
export class ApiInputAssignment extends ApiInput implements ApiSignalAssignment{
    /**Belegung der Vaiablen */
    public assignment:boolean

    /**
     * Erstelle eine neue Ausgabedarstellung einer Eingangsvariablen mit deren Belegung
     * @param name Name der Vaiablen
     * @param assignment aktuelle Belegung
     */
    constructor(name:string , assignment:boolean){
        super(name)
        this.assignment=assignment
    }
}



/**
 * Ausgabedarstellung einer Steuervariablen mit ihrer aktuellen Belegung
 * Kennen den zugehoerigen Automaten nicht mehr selbst, da sie diesem untergeordnet sind
*/
export class ApiControlSignalAssignment implements ApiSignalAssignment{

     /**Name der Variablen */
     public name:string
     /**aktuelle Belegung */
     public assignment:boolean

     /**
      * Erstelle eine neue Steuervariablen mit deren Belegung in Ausgabedarstellung
      * @param name Name der Variablen
      * @param assignment Belegung der Variablen
      */
     constructor(name:string  , assignment:boolean){
        this.name= name
        this.assignment = assignment
        }
}


/**
 * Ausgabedarstellung einer z-Variablen mit ihrer aktuellen Belegung
 * Kennen den zugehoerigen Automaten nicht mehr selbst, da sie diesem untergeordnet sind
*/
export class ApiZVariableAssignment implements ApiSignalAssignment{

    /**Name der Variablen */
    public name:string
    /**aktuelle Belegung */
    public assignment:boolean
   
    /**
     * Erstelle eine neue z-Variable mit deren Belegung in Ausgabedarstellung
     * @param name Name der Variablen
     * @param assignment Belegung der Variablen
     */
    constructor(name:string  , assignment:boolean){
       this.name= name
       this.assignment = assignment
       }
}

/**Ausgabedarstellung einer Ausgabevariablen y_i */
export class ApiOutputAssignment  implements ApiSignalAssignment{

    /**Name der Ausgangsvariablen */
    public name:string
    /**Belegung der Vaiablen */
    public assignment:boolean

    /**
     * Erstelle eine neue Ausgabedarstellung einer Ausgangsvariablen mit deren Belegung
     * @param name Name der Vaiablen
     * @param assignment aktuelle Belegung
     */
    constructor(name:string , assignment:boolean){
        this.name = name
        this.assignment=assignment
    }
}
