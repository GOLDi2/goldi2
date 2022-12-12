import { bsdlFpga } from '../../svf-generator/bsdl'
import { addFpgaHeader } from '../../svf-generator/jtagOverSvfGenerator'
import { mapIoFpga, mapFpgaIo } from '../../svf-generator/pinMappings'
import {
    IOBoardConfiguration,
    ioBoardPinToSocket,
    isIOBoardModulePin,
    ioBoardSocketToPinOffset,
    ioBoardBoardPinToSocket,
    ioBoardSocketToCable,
    isValidIOBoardConfiguration,
} from '../../utils/ioBoard'
import { binToHex, saveStringArray } from '../../utils/utilityFunctions'

function internalIOPinToBoardPin(
    internalPin: number | undefined,
    configuration: IOBoardConfiguration
) {
    if (internalPin === undefined) return undefined

    const socket = ioBoardPinToSocket(internalPin, configuration)
    const localIoPin = internalPin % 8

    if (socket == 'none') return undefined
    if (!isIOBoardModulePin(localIoPin)) return undefined

    return ioBoardSocketToPinOffset(socket) + configuration.modulePinMapping[localIoPin]
}

function boardPinToInternalIOPin(boardPin: number, configuration: IOBoardConfiguration) {
    const localIoPin = boardPin % 8
    if (!isIOBoardModulePin(localIoPin))
        throw new Error(
            'Something went wrong when trying to locate pin position in socket'
        )

    const socket = ioBoardBoardPinToSocket(boardPin)
    if (socket === 'none') throw new Error('Board pin does not belong to any socket')

    const cable = ioBoardSocketToCable(socket, configuration)
    if (cable === 'none') throw new Error('Socket does not have any cable connected')

    let localOffset = 0
    for (let i = 0; i < 8; i++) {
        if (configuration.modulePinMapping[i] === localIoPin) localOffset = i
    }
    return Math.min(...configuration.cablePinsMapping[cable]) + localOffset
}

export function generateTestFromConfiguration(configuration: IOBoardConfiguration) {
    if (!isValidIOBoardConfiguration(configuration))
        throw new Error('IO Board Configuration is invalid')

    const value = '1'
    const invertedValue = '0'

    const outputInstructions: string[] = []
    addFpgaHeader(outputInstructions, bsdlFpga)

    // Extest
    outputInstructions.push('! Extest')
    outputInstructions.push(
        `SIR ${bsdlFpga.instructionLength} TDI(${bsdlFpga.instructions.extest});\n`
    )

    for (const boardPin in mapIoFpga) {
        const socket = ioBoardBoardPinToSocket(parseInt(boardPin))
        if (socket == 'none') continue // NOTE: or throw error?
        if (
            configuration.sockets[socket] == '24V in' ||
            configuration.sockets[socket] == 'none'
        )
            continue
        if (ioBoardSocketToCable(socket, configuration) === 'none') continue

        const ioPin = boardPinToInternalIOPin(parseInt(boardPin), configuration)

        const fpgaPin = mapIoFpga[ioPin]
        if (!fpgaPin) throw new Error('IO pin is not connected to a fpga pin')

        let tdiValues = []
        let tdoValues = []
        let maskValues = []
        for (const boundaryCell of bsdlFpga.boundaryCells) {
            if (boundaryCell.pin != '*') {
                if (mapFpgaIo[boundaryCell.pin]) {
                    maskValues[boundaryCell.cellNumber] = '1'
                } else {
                    maskValues[boundaryCell.cellNumber] = '0'
                }
                if (boundaryCell.pin == fpgaPin) {
                    if (configuration.sockets[socket] == '5V') {
                        tdiValues[boundaryCell.cellNumber] = invertedValue
                        tdoValues[boundaryCell.cellNumber] = invertedValue
                    } else {
                        tdiValues[boundaryCell.cellNumber] = value
                        tdoValues[boundaryCell.cellNumber] = value
                    }
                } else {
                    tdiValues[boundaryCell.cellNumber] = invertedValue
                    const connection = configuration.connections.find(
                        (connection) =>
                            (connection[0] == parseInt(boardPin) &&
                                connection[1] ==
                                    internalIOPinToBoardPin(
                                        mapFpgaIo[boundaryCell.pin],
                                        configuration
                                    )) ||
                            (connection[0] ==
                                internalIOPinToBoardPin(
                                    mapFpgaIo[boundaryCell.pin],
                                    configuration
                                ) &&
                                connection[1] == parseInt(boardPin))
                    )
                    if (connection) {
                        if (configuration.sockets[socket] == '5V') {
                            tdoValues[boundaryCell.cellNumber] = invertedValue
                        } else {
                            tdoValues[boundaryCell.cellNumber] = value
                        }
                    } else {
                        if (configuration.sockets[socket] == '5V') {
                            tdoValues[boundaryCell.cellNumber] = value
                        } else {
                            tdoValues[boundaryCell.cellNumber] = invertedValue
                        }
                    }
                }
                if (
                    boundaryCell.controllCell &&
                    boundaryCell.disableValue &&
                    boundaryCell.disableResult
                ) {
                    tdiValues[parseInt(boundaryCell.controllCell)] =
                        boundaryCell.pin == fpgaPin
                            ? boundaryCell.enableValue!
                            : boundaryCell.disableValue!
                }
            } else {
                maskValues[boundaryCell.cellNumber] = '0'
                tdoValues[boundaryCell.cellNumber] = '0'
                if (boundaryCell.function == 'INTERNAL') {
                    if (boundaryCell.safeBit == 'X')
                        tdiValues[boundaryCell.cellNumber] = '0'
                    else tdiValues[boundaryCell.cellNumber] = boundaryCell.safeBit
                }
            }
        }
        const tdi = binToHex(tdiValues.reverse().join(''))
        const tdo = binToHex(tdoValues.reverse().join(''))
        const mask = binToHex(maskValues.reverse().join(''))
        outputInstructions.push(`! Testing Pin ${boardPin}`)
        outputInstructions.push(`SDR ${bsdlFpga.boundaryCellsLength} TDI (${tdi});`)
        outputInstructions.push('RUNTEST 0.5 SEC;\n')
        outputInstructions.push(
            `SDR ${bsdlFpga.boundaryCellsLength} TDI (${tdi}) \nTDO (${tdo}) \nMASK (${mask});`
        )
        outputInstructions.push('RUNTEST 0.5 SEC;\n')
    }

    // move fpga out of extest
    outputInstructions.push('! Reset FPGA')
    outputInstructions.push('STATE RESET;')
    outputInstructions.push('STATE IDLE;')

    saveStringArray(outputInstructions, `dist/generated_tests/test_io_board.svf`)
}
