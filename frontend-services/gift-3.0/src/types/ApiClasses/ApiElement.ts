import { SignalAssignment } from '../BooleanEquations/SignalAssignment'
import { ApiNode } from '../Node'
import { ApiAutomatonEquationSet, ApiEquation as ApiEquation } from './Equation'
import { ApiAutomaton } from './GraphRepresentation/Automaton'
import { ApiControlSignalPair } from './GraphRepresentation/ControlSignalPair'
import { ApiOutputSignalPair } from './GraphRepresentation/OutputSiganalPair'
import { ApiTransitions } from './GraphRepresentation/Transitions'
import { ApiControlSignalAssignment, ApiOutputAssignment, ApiSignalAssignment, ApiZVariableAssignment } from './SignalAssignments'
import { ApiFullSystemAssignment } from './SystemAssignment'

/**Typ fuer die Elemente der Hauptdarstellungsform nach aussen (Graph) */
export type mainApiRepresentation = ApiNode | ApiAutomaton | ApiControlSignalPair | ApiOutputSignalPair | ApiTransitions | outputFormats

/**Typ fuer alle Klassen, die zur Darstellung von Ausgaben der Selektoren abseits der Automaten benoetigt werden */
export type outputFormats = ApiSignalAssignment | ApiFullSystemAssignment | ApiEquation | ApiAutomatonEquationSet

/**Typ fuer alle in der Api berechenbaren Darstellungsformen */
export type ApiRepresentation = mainApiRepresentation 
