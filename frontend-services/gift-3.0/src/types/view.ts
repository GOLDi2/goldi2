/**
 * Enumeration fuer alle moeglichen Ansichten innerhalb der GUI
 */
export const enum Viewstate{
StateDiagram = "STATEDIAGRAM",
TransitionMatrix = "TRANSITIONMATRIX",
MachineTable = "MACHINETABLE",
zEquations = "ZEQUATIONS",
Simulation = "SIMULATION"
}

/**
 * Liste aller Ansichten von Automaten, die aus den im State abgelegten Automaten berechnet werden koennen
 */
export const enum DerivedAutomatonViews{
    /** Hardwareautomaten als eine moegliche Ansicht */
    HardwareAutomaton = "HARDWARE_AUTOMATON",
    /** Fusionierte Automaten als eine moegliche Ansicht */
    MergedAutomaton = "MERGED_AUTOMATON"
}
