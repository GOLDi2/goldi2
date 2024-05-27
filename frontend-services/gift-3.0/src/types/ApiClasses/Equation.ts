import { FullApiTransformable } from "../ApiTransformable";
import { CustomNames } from "../BooleanEquations/CustomNames";

/**
 * Interface fuer die Ausgabedarstellung einer Gleichung (z , Steuersignale und Ausgaben)
 * Da sich diese spaeter immer innerhalb eines Sets befinden, welches einem Automaten zugeordnet ist, koennen sie ihren herkunftsautomaten vergessen
 */
export interface ApiEquation{
    /**Name der Variablen, die durch die GLeichung beschrieben wird */
    name:string

    /**Gleichung */
    equation:string
}

/**
 * Ausgabedarstellung einer z-Gleichung (fuer ein z_i)
 */
export class ApiZEquation implements ApiEquation{

     /**Name der Variablen, die durch die GLeichung beschrieben wird */
     name:string

     /**Gleichung */
     equation:string

     /**
      * Erstelle eine neue z-Glecihung in Ausgabeformat
      * @param name Name der Variablen
      * @param equation Gleichung zur Definition der Variablen
      */
     constructor(name:string , equation:string){
         this.equation = equation;
         this.name = name;
     }
}

/**
 * Ausgabedarstellung einer Ausgabegleichung fuer ein Steuersignal (fuer ein s_i)
 */
export class ApiControlSignalEquation implements ApiEquation{
     /**Name der Variablen, die durch die GLeichung beschrieben wird */
     name:string

     /**Gleichung */
     equation:string

   /**
      * Erstelle eine neue Ausgabegleichung fuer ein Steuersignal in Ausgabeformat
      * @param name Name der Variablen
      * @param equation Gleichung zur Definition der Variablen
      */
     constructor(name:string , equation:string){
        this.equation = equation;
        this.name = name;
    }
}


/**
 * Ausgabedarstellung einer Ausgabegleichung fuer einen Ausgang (fuer ein y_i)
 */
export class ApiOutputEquation implements ApiEquation{
    /**Name der Variablen, die durch die GLeichung beschrieben wird */
    name:string

    /**Gleichung */
    equation:string

  /**
     * Erstelle eine neue Ausgabegleichung fuer einen Ausgang in Ausgabeformat
     * @param name Name der Variablen
     * @param equation Gleichung zur Definition der Variablen
     */
    constructor(name:string , equation:string){
       this.equation = equation;
       this.name = name;
   }
}




/**
 * Darstellung eines Automaten in Form seiner Gleichungen (Ausgabe- und z-Gleichungen) in Ausgabeform
 */
export class ApiAutomatonEquationSet{
    /**Name des Automaten */
    public automatonName:string 

    /**z-Gleichungen des Automaten*/
    public zEquations: Array<ApiZEquation>

    /**Ausgabegleichungen des Automaten */
    public outputEquations: Array<ApiOutputEquation>

    /**Gleichungen fue die Steuervariablen des Automaten */
    public controlSignalEquations: Array<ApiControlSignalEquation>

    /**
     * Erstellt eine neue Gleichungsbeschreibung eines Automaten in Ausgabeformat
     * @param automatonName Name des Automaten 
     * @param zEquations Liste aller z-Gleichungen
     * @param outputEquations Liste aller Ausgabegleichungen fuer die y_i
     * @param csEquations Liste aller Ausgabegleichungen fuer die s_i
     */
    constructor(automatonName:string , zEquations:Array<ApiZEquation> , outputEquations: Array<ApiOutputEquation> , csEquations: Array<ApiControlSignalEquation> ){
        this.automatonName = automatonName;
        this.controlSignalEquations = csEquations;
        this.outputEquations = outputEquations;
        this.zEquations = zEquations;
    }
}
