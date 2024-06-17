
import { ExternalIndependentControlSignal, InternalIndependentControlSignal } from '../ControlSignal';
import { NameErrorTupel } from '../ErrorElements';
import { ExternalInput, InternalInput } from '../Input';
import { StorageObject } from '../NormalizedState/NormalizedObjects';
import { NameTupel } from '../NormalizedState/SignalSubState';
import { Operators } from '../Operators';
import { ExternalOutput } from '../Output';
import { ZVariable } from '../ZVariable';

/**
 * Sammlung aller nutzerdefinierten Signale mit deren Signalnamen und  die Operatoren
 * Einzige Schnittstelle zur Darstellung von Signalen mit deren nutzerdefinierten Namen
 */
export class CustomNames {

    /**Liste aller nutzerdefinierten Automatennamen */
    public automatonNames: Array<NameTupel>

    /**
     * Objekt ("Liste") zum Speichern der Darstellungsrelevanten Inforamtionen (Positionen) aller Knoten
     * Die Informationen zum Knoten mit ID: i sind als Eintrag mit dem key i abgelegt
     */
    public nodeNames: StorageObject<NameTupel>

    /**Nutzerdefinierte Operatoren */
    public operators: Operators;

    /**Nutzerdefinierte Inputs */
    public inputs: Array<ExternalInput>

    /**Nutzerdefinierte Outputs */
    public outputs: Array<ExternalOutput>

    /**Nutzerdefinierte Steuersignale */
    public controlSignals: Array<ExternalIndependentControlSignal>

    /**Liste aller aktuell existierednen z-Variablen */
    public zVariables: Array<ZVariable>


    /**
     * Erstelle eine neue Sammlung aller nutzerdefinierten Elemente
     * @param automatonNames Nutzerdefinierte Automatennamen
     * @param nodeNames Nutzerdefinierte Knotennamen
     * @param customOperators Nutzerdefinierte Operatoren 
     * @param customInputs Nutzerdefinierte Inputs
     * @param customOutputs Nutzerdefinierte Outputs
     * @param customControlSignals Nutzerdefinierte Steuersignale
     * @param zVariables Liste aller aktuell existierednen z-Variablen
     */
    constructor(automatonNames: Array<NameTupel>, nodeNames: StorageObject<NameTupel>,customOperators: Operators, customInputs: Array<ExternalInput>, customOutputs: Array<ExternalOutput>, customControlSignals: Array<ExternalIndependentControlSignal>,
        zVariables: Array<ZVariable>) {
        this.controlSignals = customControlSignals;
        this.operators = customOperators;
        this.inputs = customInputs
        this.outputs = customOutputs;
        this.zVariables = zVariables;
        this.automatonNames = automatonNames
        this.nodeNames = nodeNames
    }
}