/**
 * Interface fuer alle Tupel aus einer Variablen und ihrer logischen Belegung
 */

import { mainApiRepresentation } from './ApiClasses/ApiElement';
import { ApiTransformable, FullApiTransformable } from './ApiTransformable';
import { CustomNames } from './BooleanEquations/CustomNames';
import { ConstantType } from './BooleanEquations/LogicTrees/TreeNodeInterfaces';
import { CompleteTreeRoot, ICompleteTreeRoot } from './BooleanEquations/LogicTrees/TreeRoots';
import { CompleteTreeConstantNode } from './BooleanEquations/LogicTrees/Variables';
import { InternalIndependentControlSignal, InternalIndependentControlSignalAssignment } from './ControlSignal';
import { ControlSignalExpressionVariableError, ExpressionSyntaxError, OutputSignalExpressionVariableError, OwnControlSignalsExpressionError, UnknownVariableInExpressionError , OutputVariableInExpressionError } from './Error';
import { ExpressionErrorTupel } from './ErrorElements';
import { InternalOutput } from './Output';
import { BaseInternAdressable } from './Signal';
import { AutomatonViewConfig } from './NormalizedState/ViewConfig';


/**
 * Darstellung eines Tupels aus einer Ausgabe/ Steuersignalausgabe mit der zugehoerigen Belegungsgleichung
 * Ist nur lokal im Automaten eindeutig
 */
export interface Signalpair {
    /**Nummer der Variablen die durch die Gleichung belegt wird (nur lokal im Automaten eindeutig) */
    varibableNumber: number

    /**Belegungsgleichung fuer die Variable mit einem eventuell aufgetretenen Fehler */
    equationErrorTupel: ExpressionErrorTupel<UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | OutputSignalExpressionVariableError | ControlSignalExpressionVariableError | OwnControlSignalsExpressionError>
}
