import { immerable } from 'immer';
import { ControlSignalPair } from '../../ControlSignalPair';
import { DEFAULT_NODE_RADIUS, NodePosition } from '../../Node';
import { OutputSignalPair } from '../../OutputSignalPair';
import { Point } from '../../Points';
import { ApiControlSignalPair } from './ControlSignalPair';
import { ApiOutputSignalPair } from './OutputSiganalPair';


/**
 * Musste aufgrund von zyklischen Abhaengigkeiten bei Imports ausgelagert werden
 * siehe {@link ApiNode}
 */