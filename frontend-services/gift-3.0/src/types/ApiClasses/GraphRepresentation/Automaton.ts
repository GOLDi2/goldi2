import { immerable } from 'immer';
import { ControlSignal } from '../../ControlSignal';
import { NameError, NumberError, NumberResetError } from '../../Error';
import { NameErrorTupel, NumberErrorTupel } from '../../ErrorElements';
import { ApiNode } from '../../Node';

import { ApiTransitions } from './Transitions';

/**
 * Ausgabedarstellung eines Automaten die durch die Selektoren aus dem internen State erzeugt wird
 */
export class ApiAutomaton{
    [immerable] = true

    /**Id des Automaten */
    public id:number 

    /** 
     * Individueller Name des Automaten der im System verwendet wird und ein ggf. angefallener Fehler bei der letzten Namensvergabe
     */
    public name:NameErrorTupel;

    /** genauere Beschreibung der Funktion oder weitere Informationen*/
    public info:string;

    /** Initialzustand bei Start des Automaten und eventuell aufgetretener Fehler*/
    public initialStateNumber:NumberErrorTupel<NumberError | NumberResetError>;

    /** Nummer des aktuellen Zustands */
    public currentStateNumber:number

    /** Liste aller Knoten des Automaten*/
    public nodes: Array<ApiNode>;

    /** Transitionstabelle */
    public transitions:Array<ApiTransitions>;

    /**Liste aller Steuervariablen des Automaten */
    public controlSignals:Array<string>
  
    /**
     * Erstellung eines neuen Automaten fuer die Schnittstelle nach aussen
     * @param id Id des Automaten
     * @param name Name des Automaten
     * @param info Beschriebung des Automaten
     * @param initialStateNumber Startknoten
     * @param nodes Liste aller Knoten
     * @param transitions Liste aller Transitionen
     * @param currentStateNumber Nummer des aktuellen Zustands
     */
    constructor(id:number , name:NameErrorTupel, info:string, initialStateNumber:NumberErrorTupel<NumberError | NumberResetError> , nodes:Array<ApiNode> , transitions:Array<ApiTransitions> 
                    , currentStateNumber:number){3
     this.id = id
     this.name = name;
     this.info = info;
     this.initialStateNumber =initialStateNumber;
     this.nodes =nodes;
     this.transitions=transitions;
     this.currentStateNumber = currentStateNumber;
         
    }
}