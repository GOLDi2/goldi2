import { immerable } from 'immer';
import { cloneDeep } from 'lodash';
import { getAutomatonName } from '../../actioncreator/helperfunctions';
import { ApiAutomatonEquationSet, ApiControlSignalEquation, ApiOutputEquation, ApiZEquation } from '../ApiClasses/Equation';
import { FullApiTransformable } from '../ApiTransformable';
import { ControlSignal } from '../ControlSignal';
import { Node } from '../Node';
import { ExternalOutput } from '../Output';
import { Transition } from '../Transition';
import { EquationViewConfig, MinimizationLevel } from '../NormalizedState/ViewConfig';
import { CustomNames } from './CustomNames';
import { AutomatonEquation, CSEquation, OutputEquation, ZEquation } from './Equations';
import { ConstantType } from './LogicTrees/TreeNodeInterfaces';
import { CompleteTreeRoot, ICompleteTreeRoot } from './LogicTrees/TreeRoots';
import { CompleteTreeConstantNode } from './LogicTrees/Variables';



/**
 * vollstaendige Darstellung eines Automaten in Form seiner Gleichungen (Ausgabe- und z-Gleichungen)
 */
export class AutomatonEquationSet {
    [immerable] = true;
    /**Id des Automaten */
    public automatonId: number

    /**vollstaendige Liste aller z-Gleichungen des Automaten
     * Es ist jede z-Variable enthalten (ggf. z_i := 0 )
     * Automaten ohne Knoten/Zustaende werden dennoch mit einer z-Variablen z_0 = 0 beschrieben 
    */
    public zEquations: Array<ZEquation>

    /**Ausgabegleichungen des Automaten */
    public outputEquations: Array<OutputEquation>

    /**Gleichungen fue die Steuervariablen des Automaten */
    public controlSignalEquations: Array<CSEquation>

    // /**Initialzustand des Automaten */
    // public initialState:number

    /**
     * Erstellt eine neue Gleichungsbeschreibung eines Automaten
     * @param id Id des Automaten 
     * @param zEquations Liste aller z-Gleichungen
     * @param outputEquations Liste aller Ausgabegleichungen fuer die y_i
     * @param csEquations Liste aller Ausgabegleichungen fuer die s_i
     * @param initialState Initialzustand des Automaten
     */
    constructor(id: number, zEquations: Array<ZEquation>, outputEquations: Array<OutputEquation>, csEquations: Array<CSEquation>) {
        this.automatonId = id;
        this.controlSignalEquations = csEquations;
        this.outputEquations = outputEquations;
        this.zEquations = zEquations;
        // this.initialState = initialState
    }

    /**
     * Ueberfuehre das Gleichungsset in seine externe Darstellung
     * @param customNames Nutzerdefinierte Namen die fuer verwendet werden sollen
     * @param equationViewConfig Konfiguration fuer die Berechnung der externen Darstellung
     * @param dontCareExpression Dont-Care-Ausdruck ueber den ggf. minimiert werden soll (falls die Konfiguration Minimierung ueber hStern vorschreibt)
     * @returns externe Darstellung des Gleichungssets
     */
    toExternalGraphRepresentation(customNames: CustomNames, equationViewConfig: EquationViewConfig, dontCareExpression: ICompleteTreeRoot): ApiAutomatonEquationSet {

        //finde den nutzerdefinierten Namen des Automatens dieses Gleichungssets
        let automatonName = getAutomatonName(this.automatonId, customNames)

        //Alle Gleichungen in Ausgabeformat bringen
        //Bedenke dass die in diesem Objekt gespeicherten Gleichungen NICHT inplace minimiert werden duerfen, da diese im Cache des Selektors gespeichert und damit nicht veraendert werden duerfen

        //Lege daher Kopien (echte Kopien, keine Refferenzen) der Gleichungen an auf denen gearbeitet wird (die ggf. vorher minimiert werden)
        let controlSignalEquationWorkingSet: Array<CSEquation> = []
        let zEquationWorkingSet: Array<ZEquation> = []
        let outputEquationWorkingSet: Array<OutputEquation> = []

        //Sollen die GLeichungen minimiert werden, wenn ja wie?
        switch (equationViewConfig.minimizationLevel) {
            case MinimizationLevel.Unminimized: {
                //Da die Gleichungen nicht minimiert werden sollen werden sie im Laufe der Ausgabe nicht veraendert --> arbeite auf den gepeichterten Objekten
                controlSignalEquationWorkingSet = this.controlSignalEquations
                zEquationWorkingSet = this.zEquations
                outputEquationWorkingSet = this.outputEquations

                break;
            }
            //In allen anderen Faellen werden die Gleichungen durch die Minimierung veraendert --> Arbeite auf Kopien
            case MinimizationLevel.Minimized: {
                //alle Gleichungen vor der Ausgabe ohne hStern minimieren (erstellt gleichzeitig eine Kopie) 
                this.controlSignalEquations.forEach(currentEquation => controlSignalEquationWorkingSet.push(currentEquation.minimize()))
                this.zEquations.forEach(currentEquation => zEquationWorkingSet.push(currentEquation.minimize()))
                this.outputEquations.forEach(currentEquation => outputEquationWorkingSet.push(currentEquation.minimize()))
        
                break;
            }
            case MinimizationLevel.HStarMinimized: {
                //alle Gleichungen vor der Ausgabe unter Einbeziehung von der Dont-Care-Belegung minimieren (mit hStern) (erstellt gleichzeitig eine Kopie)
                this.controlSignalEquations.forEach(currentEquation => controlSignalEquationWorkingSet.push(currentEquation.minimize(dontCareExpression)))
                this.zEquations.forEach(currentEquation => zEquationWorkingSet.push(currentEquation.minimize(dontCareExpression)))
                this.outputEquations.forEach(currentEquation => outputEquationWorkingSet.push(currentEquation.minimize(dontCareExpression)))
                break;
            }
        }

        //Alle z-Gleichungen transformieren
        let apiZEquations: Array<ApiZEquation> = [];
        for (let equationCount = 0; equationCount < zEquationWorkingSet.length; equationCount++) {
            //Greife aktuelle Gleichung --> transformiere sie in Ausgabedarstellung  
            let currentEquation = zEquationWorkingSet[equationCount];
            apiZEquations.push(currentEquation.toExternalGraphRepresentation(customNames))
        }

        //Alle s-Gleichungen transformieren
        let apiControlSignalEquations: Array<ApiControlSignalEquation> = [];
        for (let equationCount = 0; equationCount < controlSignalEquationWorkingSet.length; equationCount++) {
            //Greife aktuelle Gleichung --> transformiere sie in Ausgabedarstellung  
            let currentEquation = controlSignalEquationWorkingSet[equationCount];
            apiControlSignalEquations.push(currentEquation.toExternalGraphRepresentation(customNames))
        }
        
        //Alle y-Gleichungen transformieren
        let apiOutputEquations: Array<ApiOutputEquation> = [];
        for (let equationCount = 0; equationCount < outputEquationWorkingSet.length; equationCount++) {
            //Greife aktuelle Gleichung --> transformiere sie in Ausgabedarstellung  
            let currentEquation = outputEquationWorkingSet[equationCount];
            apiOutputEquations.push(currentEquation.toExternalGraphRepresentation(customNames))
        }       

        //Ausgabe eines Gleichungssets in Ausgabeformat

        let apiSet: ApiAutomatonEquationSet
        apiSet = new ApiAutomatonEquationSet(automatonName, apiZEquations, apiOutputEquations, apiControlSignalEquations)

        return apiSet
    }
}

