import { HasID } from '../NormalizedState/NormalizedObjects';
import { ApiControlSignalAssignment, ApiInputAssignment, ApiOutputAssignment, ApiZVariableAssignment } from './SignalAssignments';

/**
 * Systembelegung im Ausgabeformat
 */
export class ApiFullSystemAssignment{
    /**Belegung aller Eingange */
    public inputAssignment: Array<ApiInputAssignment>

    /**aktuelle Belegung aller Ausgaenge*/
    public outputAssignment: Array<ApiOutputAssignment>

    /**Belegungen aller Variablen, die einem Automaten zugeordnet sind (z- und Steuervariablen) */
    public automatonAssignment: Array<ApiAutomatonAssignment>


    /**
     * Erstelle eine neue Systembelegung im Ausgabeformat
     * @param inputs Belegung aller Eingaenge
     * @param automatonAssignment Belegung aller automatengebundenen Variablen
     * @param outputs Belegung aller Ausgaenge
     */
    constructor(inputs:Array<ApiInputAssignment> , automatonAssignment:Array<ApiAutomatonAssignment>, outputs:Array<ApiOutputAssignment>){
        this.inputAssignment = inputs;
        this.automatonAssignment = automatonAssignment
        this.outputAssignment = outputs;
    }


}


/**
 * Gruppierung aller Belegungen der Variablen eines Automaten (z- und Steuervariablenbelegungen)
 */
export class ApiAutomatonAssignment{
    /**Name des  Automaten fuer die die Signalbelegungen gebuendelt werden*/
    public automatonName:string

     /**Aktuelle Belegung der z-Variablen dieses Automaten*/
     public zVariableAssignment: Array<ApiZVariableAssignment>

     /**aktuelle Belegung aller Steuersignale dieses Automaten*/
     public controlSignalAssignment: Array<ApiControlSignalAssignment>

     /**aktueller Zustand */
     public currentState:number

     /**
      * Erstelle ein Paket zum buendeln der Belegungen aller Variablen eines Automaten 
      * (alle Listen sind inital leer , inital ist der aktuelle Zustand = 0)
      * @param automatonName Name des Automaten dessen Variablenbelegungen gruppiert werden sollen
      */
     constructor(automatonName:string){
         this.automatonName = automatonName
         this.controlSignalAssignment = [];
         this.zVariableAssignment = [];
         this.currentState = 0;
     }
}

/** Speichere den aktuellen Zustand eines Automaten anhand seiner Id ab */
export interface CurrentStateTupel extends HasID{
    /**Id des Automaten */
    id: number

    /**aktueller Zustand des Automaten */
    currentState:number
}