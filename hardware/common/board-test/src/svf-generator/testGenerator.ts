import { mapFpgaIo, mapIoFpga, mapMcFpga, mapRpiFpga } from './pinMappings'
import {
    addFpgaHeader,
    JtagPins,
    generateClock,
    generateMove,
    generateSIR,
    generateSDR,
    generateValueCheckFpgaMc,
} from './jtagOverSvfGenerator'
import { bsdlFpga, bsdlMc } from './bsdl'
import { IOBoardTestLabel } from '../utils/types'
import { saveStringArray, binToHex } from '../utils/utilityFunctions'

const jtag: JtagPins = {
    tck: bsdlFpga.boundaryCells.find((cell) => cell.pin == 'PL24B')!,
    tms: bsdlFpga.boundaryCells.find((cell) => cell.pin == 'PL24A')!,
    tdo: bsdlFpga.boundaryCells.find((cell) => cell.pin == 'PL23D')!,
    tdi: bsdlFpga.boundaryCells.find((cell) => cell.pin == 'PB13B')!,
}

function generateResetFpga() {
    const outputInstructions: string[] = []
    addFpgaHeader(outputInstructions, bsdlFpga)
    outputInstructions.push('STATE RESET')
    outputInstructions.push('STATE IDLE')
    saveStringArray(outputInstructions, `dist/generated_tests/test_reset_fpga.svf`)
}

function generateGpioTestIo(value: '0' | '1') {
    if (value != '0' && value != '1') process.exit(1)

    const invertedValue = value == '1' ? '0' : '1'

    // write pins
    for (const ioPin in mapIoFpga) {
        const outputInstructions: string[] = []
        addFpgaHeader(outputInstructions, bsdlFpga)

        const fpgaPin = mapIoFpga[ioPin]
        if (!fpgaPin) process.exit(1)

        // Preload
        outputInstructions.push('! Preload')
        outputInstructions.push(
            `SIR ${bsdlFpga.instructionLength} TDI(${bsdlFpga.instructions.sample});`
        )
        const tdiValues = []
        for (const boundaryCell of bsdlFpga.boundaryCells) {
            if (boundaryCell.pin != '*') {
                if (boundaryCell.pin == fpgaPin) {
                    tdiValues[boundaryCell.cellNumber] = value
                } else {
                    tdiValues[boundaryCell.cellNumber] = invertedValue
                }
                if (
                    boundaryCell.controllCell &&
                    boundaryCell.disableValue &&
                    boundaryCell.disableResult
                ) {
                    tdiValues[parseInt(boundaryCell.controllCell)] =
                        boundaryCell.pin == fpgaPin
                            ? parseInt(boundaryCell.enableValue!)
                            : parseInt(boundaryCell.disableValue!)
                }
            } else {
                if (boundaryCell.function == 'INTERNAL') {
                    if (boundaryCell.safeBit == 'X')
                        tdiValues[boundaryCell.cellNumber] = '0'
                    else tdiValues[boundaryCell.cellNumber] = boundaryCell.safeBit
                }
            }
        }
        const tdi = binToHex(tdiValues.reverse().join(''))
        outputInstructions.push(`SDR ${bsdlFpga.boundaryCellsLength} TDI (${tdi});\n`)

        // Extest
        outputInstructions.push('! Extest')
        outputInstructions.push(
            `SIR ${bsdlFpga.instructionLength} TDI(${bsdlFpga.instructions.extest});\n`
        )

        saveStringArray(
            outputInstructions,
            `dist/generated_tests/test_io_board_write_${ioPin}_${value}.svf`
        )
    }

    // read pins
    for (const ioPin in mapIoFpga) {
        const outputInstructions: Array<string> = []
        addFpgaHeader(outputInstructions, bsdlFpga)

        const fpgaPin = mapIoFpga[ioPin]
        if (!fpgaPin) process.exit(1)

        outputInstructions.push(
            `SIR ${bsdlFpga.instructionLength} TDI(${bsdlFpga.instructions.sample});`
        )
        const tdoValues = []
        for (const boundaryCell of bsdlFpga.boundaryCells) {
            if (boundaryCell.pin != '*') {
                if (boundaryCell.pin == fpgaPin) {
                    tdoValues[boundaryCell.cellNumber] = value
                } else {
                    tdoValues[boundaryCell.cellNumber] = '0'
                }
                if (
                    boundaryCell.controllCell &&
                    boundaryCell.disableValue &&
                    boundaryCell.disableResult
                ) {
                    tdoValues[parseInt(boundaryCell.controllCell)] = '0'
                }
            } else {
                if (boundaryCell.function == 'INTERNAL') {
                    tdoValues[boundaryCell.cellNumber] = '0'
                }
            }
        }
        const tdo = binToHex(tdoValues.reverse().join(''))
        tdoValues.reverse()
        tdoValues[
            bsdlFpga.boundaryCells.find(
                (boundaryCell) => boundaryCell.pin == fpgaPin
            )?.cellNumber!
        ] = '1'
        const mask = binToHex(tdoValues.reverse().join(''))
        let tdi = '0'.repeat(Math.floor(bsdlFpga.boundaryCellsLength / 4))
        if (bsdlFpga.boundaryCellsLength % 4 > 0) tdi += '0'
        outputInstructions.push(
            `SDR ${bsdlFpga.boundaryCellsLength} TDI (${tdi}) \nTDO  (${tdo}) \nMASK (${mask});\n`
        )

        saveStringArray(
            outputInstructions,
            `dist/generated_tests/test_io_board_read_${ioPin}_${value}.svf`
        )
    }
}

function generateGpioTestRpi(value: '0' | '1') {
    if (value != '0' && value != '1') process.exit(1)

    const invertedValue = value == '1' ? '0' : '1'

    // write pins
    for (const rpiPin in mapRpiFpga) {
        const outputInstructions: Array<string> = []
        addFpgaHeader(outputInstructions, bsdlFpga)

        const fpgaPin = mapRpiFpga[rpiPin]
        if (!fpgaPin) process.exit(1)

        // Preload
        outputInstructions.push('! Preload')
        outputInstructions.push(
            `SIR ${bsdlFpga.instructionLength} TDI(${bsdlFpga.instructions.sample});`
        )
        const tdiValues = []
        for (const boundaryCell of bsdlFpga.boundaryCells) {
            if (boundaryCell.pin != '*') {
                if (boundaryCell.pin == fpgaPin) {
                    tdiValues[boundaryCell.cellNumber] = value
                } else {
                    tdiValues[boundaryCell.cellNumber] = invertedValue
                }
                if (
                    boundaryCell.controllCell &&
                    boundaryCell.disableValue &&
                    boundaryCell.disableResult
                ) {
                    tdiValues[parseInt(boundaryCell.controllCell)] =
                        boundaryCell.pin == fpgaPin
                            ? parseInt(boundaryCell.enableValue!)
                            : parseInt(boundaryCell.disableValue!)
                }
            } else {
                if (boundaryCell.function == 'INTERNAL') {
                    if (boundaryCell.safeBit == 'X')
                        tdiValues[boundaryCell.cellNumber] = '0'
                    else tdiValues[boundaryCell.cellNumber] = boundaryCell.safeBit
                }
            }
        }
        const tdi = binToHex(tdiValues.reverse().join(''))
        outputInstructions.push(`SDR ${bsdlFpga.boundaryCellsLength} TDI (${tdi});\n`)

        // Extest
        outputInstructions.push('! Extest')
        outputInstructions.push(
            `SIR ${bsdlFpga.instructionLength} TDI(${bsdlFpga.instructions.extest});\n`
        )

        saveStringArray(
            outputInstructions,
            `dist/generated_tests/test_gpio_write_${rpiPin}_${value}.svf`
        )
    }

    // read pins
    for (const rpiPin in mapRpiFpga) {
        const outputInstructions: Array<string> = []
        addFpgaHeader(outputInstructions, bsdlFpga)

        const fpgaPin = mapRpiFpga[rpiPin]
        if (!fpgaPin) process.exit(1)

        outputInstructions.push(
            `SIR ${bsdlFpga.instructionLength} TDI(${bsdlFpga.instructions.sample});`
        )
        const tdoValues = []
        for (const boundaryCell of bsdlFpga.boundaryCells) {
            if (boundaryCell.pin != '*') {
                if (boundaryCell.pin == fpgaPin) {
                    tdoValues[boundaryCell.cellNumber] = value
                } else {
                    tdoValues[boundaryCell.cellNumber] = '0'
                }
                if (
                    boundaryCell.controllCell &&
                    boundaryCell.disableValue &&
                    boundaryCell.disableResult
                ) {
                    tdoValues[parseInt(boundaryCell.controllCell)] = '0'
                }
            } else {
                if (boundaryCell.function == 'INTERNAL') {
                    tdoValues[boundaryCell.cellNumber] = '0'
                }
            }
        }
        const tdo = binToHex(tdoValues.reverse().join(''))
        tdoValues.reverse()
        tdoValues[
            bsdlFpga.boundaryCells.find(
                (boundaryCell) => boundaryCell.pin == fpgaPin
            )?.cellNumber!
        ] = '1'
        const mask = binToHex(tdoValues.reverse().join(''))
        let tdi = '0'.repeat(Math.floor(bsdlFpga.boundaryCellsLength / 4))
        if (bsdlFpga.boundaryCellsLength % 4 > 0) tdi += '0'
        outputInstructions.push(
            `SDR ${bsdlFpga.boundaryCellsLength} TDI (${tdi}) \nTDO  (${tdo}) \nMASK (${mask});\n`
        )

        saveStringArray(
            outputInstructions,
            `dist/generated_tests/test_gpio_read_${rpiPin}_${value}.svf`
        )
    }
}

function generateGpioTestMc(value: '0' | '1') {
    const outputInstructions: Array<string> = []

    addFpgaHeader(outputInstructions, bsdlFpga)

    // enter extest mode fpga
    outputInstructions.push('! Preload/Sample')
    outputInstructions.push(
        `SIR ${bsdlFpga.instructionLength} TDI(${bsdlFpga.instructions.sample});`
    )
    const tdiValues = []
    for (const boundaryCell of bsdlFpga.boundaryCells) {
        if (boundaryCell.pin != '*') {
            tdiValues[boundaryCell.cellNumber] = '0'
            if (
                boundaryCell.controllCell &&
                boundaryCell.disableValue &&
                boundaryCell.disableResult
            ) {
                const control_cell = parseInt(boundaryCell.controllCell)
                tdiValues[control_cell] = boundaryCell.disableValue
            }
        } else {
            if (boundaryCell.function == 'INTERNAL') {
                if (boundaryCell.safeBit == 'X') tdiValues[boundaryCell.cellNumber] = '0'
                else tdiValues[boundaryCell.cellNumber] = boundaryCell.safeBit
            }
        }
    }
    const tdi = binToHex(tdiValues.reverse().join(''))
    outputInstructions.push(`SDR ${bsdlFpga.boundaryCellsLength} TDI (${tdi});\n`)
    outputInstructions.push('! Enter Extest FPGA')
    outputInstructions.push(
        `SIR ${bsdlFpga.instructionLength} TDI(${bsdlFpga.instructions.extest});\n`
    )

    // reset jtag microcontroller
    outputInstructions.push('! Reset Microcontroller')
    for (let i = 0; i < 5; i++)
        generateClock(jtag, bsdlFpga, outputInstructions, '1', '0')
    generateMove(jtag, bsdlFpga, outputInstructions, 'RESET', 'IDLE')

    // read idcode microcontroller
    outputInstructions.push('! Check the IDCODE of the Microcontroller')
    generateSIR(
        jtag,
        bsdlFpga,
        outputInstructions,
        bsdlMc.instructions.idcode,
        bsdlMc.instructionLength
    )
    let sdrData = ''
    for (let i = 0; i < bsdlMc.idcode.length; i++) sdrData += '0'
    generateSDR(
        jtag,
        bsdlFpga,
        outputInstructions,
        sdrData,
        bsdlMc.idcode.length,
        bsdlMc.idcode
    )
    saveStringArray(outputInstructions, `dist/generated_tests/test_idcode_mc.svf`)

    // enter extest mode microcontroller
    outputInstructions.push('! Enter Extest Microcontroller')
    generateSIR(
        jtag,
        bsdlFpga,
        outputInstructions,
        bsdlMc.instructions.extest,
        bsdlMc.instructionLength
    )

    // send vectors microcontroller and check return values
    if (value != '0' && value != '1') process.exit(1)
    const invertedValue = value == '1' ? '0' : '1'

    for (const mcPin in mapMcFpga) {
        if (mcPin == 'RESET') continue
        outputInstructions.push(
            '! Testing Ports ' + mcPin + ' <-> ' + mapMcFpga[mcPin] + ', value = ' + value
        )
        const sdrValues = []
        for (const boundaryCell of bsdlMc.boundaryCells) {
            if (boundaryCell.pin != '*') {
                if (boundaryCell.pin == 'RESET') {
                    sdrValues[boundaryCell.cellNumber] = '1'
                } else if (boundaryCell.pin == mcPin) {
                    sdrValues[boundaryCell.cellNumber] = value
                } else {
                    sdrValues[boundaryCell.cellNumber] = invertedValue
                }
                if (
                    boundaryCell.controllCell &&
                    boundaryCell.disableValue &&
                    boundaryCell.disableResult
                ) {
                    sdrValues[parseInt(boundaryCell.controllCell)] =
                        boundaryCell.enableValue
                }
            } else {
                if (boundaryCell.function == 'INTERNAL') {
                    if (boundaryCell.safeBit == 'X')
                        sdrValues[boundaryCell.cellNumber] = '0'
                    else sdrValues[boundaryCell.cellNumber] = boundaryCell.safeBit
                }
            }
        }
        const sdr = binToHex(sdrValues.reverse().join(''))
        generateSDR(jtag, bsdlFpga, outputInstructions, sdr, bsdlMc.boundaryCellsLength)
        generateValueCheckFpgaMc(jtag, bsdlFpga, outputInstructions, mcPin, value)
    }

    // reset jtag microcontroller
    outputInstructions.push('! Reset Microcontroller')
    for (let i = 0; i < 5; i++)
        generateClock(jtag, bsdlFpga, outputInstructions, '1', '0')
    generateClock(jtag, bsdlFpga, outputInstructions, '0', '0')

    // move fpga out of extest
    outputInstructions.push('! Reset FPGA')
    outputInstructions.push('STATE RESET;')
    outputInstructions.push('STATE IDLE;')

    saveStringArray(outputInstructions, `dist/generated_tests/test_fpga_mc_${value}.svf`)
}

function generateCableTests() {
    let i = 0
    for (const cableColor of [
        'green',
        'grey',
        'blue',
        'white',
        'pink',
        'black',
        'red',
        'yellow',
    ]) {
        const outputInstructions: string[] = []
        addFpgaHeader(outputInstructions, bsdlFpga)

        // Extest
        outputInstructions.push('! Extest')
        outputInstructions.push(
            `SIR ${bsdlFpga.instructionLength} TDI(${bsdlFpga.instructions.extest});\n`
        )

        for (let ioPin = i; ioPin < i + 8; ioPin++) {
            const fpgaPin = mapIoFpga[ioPin]
            if (!fpgaPin) throw new Error('IO pin is not connected to a fpga pin')

            const tdiValues = []
            const tdoValues = []
            const maskValues = []
            for (const boundaryCell of bsdlFpga.boundaryCells) {
                if (boundaryCell.pin != '*') {
                    if (mapFpgaIo[boundaryCell.pin]) {
                        maskValues[boundaryCell.cellNumber] = '1'
                    } else {
                        maskValues[boundaryCell.cellNumber] = '0'
                    }
                    if (boundaryCell.pin == fpgaPin) {
                        tdiValues[boundaryCell.cellNumber] = '1'
                        tdoValues[boundaryCell.cellNumber] = '1'
                    } else {
                        tdiValues[boundaryCell.cellNumber] = '0'
                        tdoValues[boundaryCell.cellNumber] = '0'
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
            outputInstructions.push(`! Testing Pin ${ioPin}`)
            outputInstructions.push(`SDR ${bsdlFpga.boundaryCellsLength} TDI (${tdi});`)
            outputInstructions.push('RUNTEST 0.5 SEC;\n')

            const instructionLabel: IOBoardTestLabel = {
                color: cableColor,
                expected: '1',
                fpgaPin: fpgaPin,
            }
            outputInstructions.push(
                `! [instruction-label] ${JSON.stringify(instructionLabel)}`
            )
            outputInstructions.push(
                `SDR ${bsdlFpga.boundaryCellsLength} TDI (${tdi}) \nTDO (${tdo}) \nMASK (${mask});`
            )
            outputInstructions.push('RUNTEST 0.5 SEC;\n')
        }

        // move fpga out of extest
        outputInstructions.push('! Reset FPGA')
        outputInstructions.push('STATE RESET;')
        outputInstructions.push('STATE IDLE;')
        saveStringArray(
            outputInstructions,
            `dist/generated_tests/test_io_board_cable_${cableColor}.svf`
        )

        i += 8
    }
}

generateResetFpga()

generateGpioTestRpi('0')
generateGpioTestRpi('1')

generateGpioTestMc('0')
generateGpioTestMc('1')

generateGpioTestIo('0')
generateGpioTestIo('1')

generateCableTests()
