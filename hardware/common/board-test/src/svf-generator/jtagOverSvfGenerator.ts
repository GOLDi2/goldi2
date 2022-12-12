import { MCBoardTestLabel } from '../utils/types'
import { replaceAt, binToHex, reverseString, hexToBin } from '../utils/utilityFunctions'
import { BsdlData, BoundaryCell } from './bsdl'
import { mapMcFpga } from './pinMappings'

export interface JtagPins {
    tck: BoundaryCell
    tms: BoundaryCell
    tdo: BoundaryCell
    tdi: BoundaryCell
}

type SvfStableState = 'RESET' | 'IDLE' | 'DRPAUSE' | 'IRPAUSE' | 'DRSHIFT' | 'IRSHIFT'

export function addFpgaHeader(outputInstructions: Array<string>, bsdl: BsdlData) {
    outputInstructions.push('! Initialize FPGA')
    outputInstructions.push('HDR 0;')
    outputInstructions.push('HIR 0;')
    outputInstructions.push('TDR 0;')
    outputInstructions.push('TIR 0;')
    outputInstructions.push('ENDDR IDLE;')
    outputInstructions.push('ENDIR IDLE;')
    outputInstructions.push('FREQUENCY 1,00e+06 HZ;')
    outputInstructions.push('STATE IDLE;\n')
    outputInstructions.push('! Check the IDCODE')
    outputInstructions.push(
        `SIR ${bsdl.instructionLength} TDI(${bsdl.instructions.idcode});`
    )
    outputInstructions.push(
        `SDR ${bsdl.idcode.length * 4} TDI (00000000) TDO(${
            bsdl.idcode
        }) MASK(FFFFFFFF);\n`
    )
}

export function generateValueCheckFpgaMc(
    jtag: JtagPins,
    bsdl: BsdlData,
    outputInstructions: Array<string>,
    mcPin: string,
    value: '0' | '1'
) {
    if (value != '0' && value != '1') process.exit(1)
    const invertedValue = value == '0' ? '1' : '0'

    let vector = ''
    for (let i = 0; i < bsdl.boundaryCellsLength; i++) {
        vector += '0'
    }
    for (const cell of bsdl.boundaryCells) {
        if (cell.pin != '*' && cell.function != 'OBSERVE_ONLY') {
            vector = replaceAt(vector, parseInt(cell.controllCell!), cell.disableValue!)
        } else if (cell.function == 'INTERNAL') {
            vector = replaceAt(
                vector,
                cell.cellNumber,
                cell.safeBit == 'X' ? '0' : cell.safeBit
            )
        }
    }

    vector = replaceAt(vector, parseInt(jtag.tck.controllCell!), jtag.tck.enableValue!)
    vector = replaceAt(vector, parseInt(jtag.tms.controllCell!), jtag.tms.enableValue!)
    vector = replaceAt(vector, parseInt(jtag.tdi.controllCell!), jtag.tdi.enableValue!)
    vector = replaceAt(vector, parseInt(jtag.tdo.controllCell!), jtag.tdo.disableValue!)
    vector = replaceAt(vector, jtag.tck.cellNumber, '0')
    vector = replaceAt(vector, jtag.tms.cellNumber, '0')
    vector = replaceAt(vector, jtag.tdi.cellNumber, '0')
    vector = replaceAt(vector, jtag.tdo.cellNumber, '0')

    let tdo = ''
    let mask = ''
    for (let i = 0; i < bsdl.boundaryCellsLength; i++) {
        tdo += '0'
        mask += '0'
    }
    for (const pin in mapMcFpga) {
        const boundaryCell = bsdl.boundaryCells.find(
            (boundaryCell) => boundaryCell.pin == mapMcFpga[pin]
        )
        if (
            [jtag.tck, jtag.tdi, jtag.tdo, jtag.tms].includes(boundaryCell!) ||
            pin == 'RESET'
        )
            continue
        if (pin == mcPin) {
            tdo = replaceAt(tdo, boundaryCell?.cellNumber!, value)
            mask = replaceAt(mask, boundaryCell?.cellNumber!, '1')
        } else {
            tdo = replaceAt(tdo, boundaryCell?.cellNumber!, invertedValue)
            mask = replaceAt(mask, boundaryCell?.cellNumber!, '1')
        }
    }

    const instructionLabel: MCBoardTestLabel = {
        expected: value,
        fpgaPin: mapMcFpga[mcPin]!,
    }
    outputInstructions.push('! Checking Value')
    outputInstructions.push(`! [instruction-label] ${JSON.stringify(instructionLabel)}`)
    outputInstructions.push(`SDR ${bsdl.boundaryCellsLength} TDI (${binToHex(
        reverseString(vector)
    )})
        TDO (${binToHex(reverseString(tdo))})
        MASK (${binToHex(reverseString(mask))});\n`)
}

export function generateClock(
    jtag: JtagPins,
    bsdl: BsdlData,
    outputInstructions: Array<string>,
    valueTMS: '0' | '1',
    valueTDI: '0' | '1',
    valueTDO?: '0' | '1'
) {
    let vector = ''
    for (let i = 0; i < bsdl.boundaryCellsLength; i++) {
        vector += '0'
    }
    for (const cell of bsdl.boundaryCells) {
        if (cell.pin != '*' && cell.function != 'OBSERVE_ONLY') {
            vector = replaceAt(vector, parseInt(cell.controllCell!), cell.disableValue!)
        } else if (cell.function == 'INTERNAL') {
            vector = replaceAt(
                vector,
                cell.cellNumber,
                cell.safeBit == 'X' ? '0' : cell.safeBit
            )
        }
    }

    if (vector.length != bsdl.boundaryCellsLength)
        console.error('vector does not have the correct size')

    // enable/disable control cells
    vector = replaceAt(vector, parseInt(jtag.tck.controllCell!), jtag.tck.enableValue!)
    vector = replaceAt(vector, parseInt(jtag.tms.controllCell!), jtag.tms.enableValue!)
    vector = replaceAt(vector, parseInt(jtag.tdi.controllCell!), jtag.tdi.enableValue!)
    vector = replaceAt(vector, parseInt(jtag.tdo.controllCell!), jtag.tdo.disableValue!)
    vector = replaceAt(vector, jtag.tdo.cellNumber, '0')

    // set tms and tdi to their respective values
    vector = replaceAt(vector, jtag.tms.cellNumber, valueTMS)
    vector = replaceAt(vector, jtag.tdi.cellNumber, valueTDI)

    outputInstructions.push(
        `! Generated Clock TMS=${valueTMS}, TDI=${valueTDI}, Expected TDO=${valueTDO}`
    )

    // set tck to 0
    vector = replaceAt(vector, jtag.tck.cellNumber, '0')
    outputInstructions.push(
        `SDR ${bsdl.boundaryCellsLength} TDI (${binToHex(reverseString(vector))});`
    )

    // set tck to 1
    vector = replaceAt(vector, jtag.tck.cellNumber, '1')
    // output_instructions.push(`SDR ${bsdl.boundaryCellsLength} TDI (${binToHex(reverseString(vector))});`)

    let mask = ''
    let tdo_exp = binToHex(reverseString(vector))
    for (let i = 0; i < bsdl.boundaryCellsLength; i++) {
        mask += '0'
    }
    if (valueTDO) {
        mask = replaceAt(mask, jtag.tdo.cellNumber, '1')
        tdo_exp = binToHex(
            reverseString(replaceAt(vector, jtag.tdo.cellNumber, valueTDO))
        )
    }
    mask = replaceAt(mask, jtag.tms.cellNumber, '1')
    mask = replaceAt(mask, jtag.tdi.cellNumber, '1')
    outputInstructions.push(`SDR ${bsdl.boundaryCellsLength} TDI (${binToHex(
        reverseString(vector)
    )})
        TDO (${tdo_exp})
        MASK (${binToHex(reverseString(mask))});\n`)
}

export function generateMove(
    jtag: JtagPins,
    bsdl: BsdlData,
    outputInstructions: Array<string>,
    from: SvfStableState,
    to: SvfStableState
) {
    outputInstructions.push(`! Generated Move ${from} -> ${to}`)
    switch (from) {
        case 'RESET':
            if (to == 'RESET') {
                break
            }
            if (to == 'IDLE') {
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'DRPAUSE') {
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'IRPAUSE') {
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'DRSHIFT') {
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'IRSHIFT') {
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            break
        case 'IDLE':
            if (to == 'RESET') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                break
            }
            if (to == 'IDLE') {
                break
            }
            if (to == 'DRPAUSE') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'IRPAUSE') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'DRSHIFT') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'IRSHIFT') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            break
        case 'DRPAUSE':
            if (to == 'RESET') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                break
            }
            if (to == 'IDLE') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'DRPAUSE') {
                break
            }
            if (to == 'IRPAUSE') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'DRSHIFT') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'IRSHIFT') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            break
        case 'IRPAUSE':
            if (to == 'RESET') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                break
            }
            if (to == 'IDLE') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'DRPAUSE') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'IRPAUSE') {
                break
            }
            if (to == 'DRSHIFT') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'IRSHIFT') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            break
        case 'DRSHIFT':
            if (to == 'RESET') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                break
            }
            if (to == 'IDLE') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'DRPAUSE') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'IRPAUSE') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            break
        case 'IRSHIFT':
            if (to == 'RESET') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                break
            }
            if (to == 'IDLE') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'DRPAUSE') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            if (to == 'IRPAUSE') {
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                generateClock(jtag, bsdl, outputInstructions, '1', '0')
                generateClock(jtag, bsdl, outputInstructions, '0', '0')
                break
            }
            break
        default:
            console.error('from state is not a stable state!\n')
    }
}

export function generateSIR(
    jtag: JtagPins,
    bsdl: BsdlData,
    outputInstructions: Array<string>,
    instruction: string,
    instructionBinaryLength: number
) {
    const instructionBinary = hexToBin(instruction, instructionBinaryLength)
    outputInstructions.push(`! Generated SIR ${instruction}`)
    generateMove(jtag, bsdl, outputInstructions, 'IDLE', 'IRSHIFT')
    for (let i = instructionBinary.length - 1; i >= 0; i--) {
        if (instructionBinary[i] == '0') {
            generateClock(jtag, bsdl, outputInstructions, i == 0 ? '1' : '0', '0')
        } else if (instructionBinary[i] == '1') {
            generateClock(jtag, bsdl, outputInstructions, i == 0 ? '1' : '0', '1')
        } else {
            console.error('instruction not valid')
        }
    }
    generateClock(jtag, bsdl, outputInstructions, '0', '0')
    generateMove(jtag, bsdl, outputInstructions, 'IRPAUSE', 'IDLE')
}

export function generateSDR(
    jtag: JtagPins,
    bsdl: BsdlData,
    outputInstructions: Array<string>,
    data: string,
    dataBinaryLength: number,
    tdo?: string
) {
    const dataBinary = hexToBin(data, dataBinaryLength)

    if (tdo) {
        const tdoBinary = hexToBin(tdo, dataBinaryLength)
        if (dataBinary.length != tdoBinary.length)
            console.error('data and tdo have different length')
        outputInstructions.push(`! Generated SDR ${data} TDO ${tdo}`)
        generateMove(jtag, bsdl, outputInstructions, 'IDLE', 'DRSHIFT')
        for (let i = dataBinary.length - 1; i >= 0; i--) {
            if (dataBinary[i] == '0' && tdoBinary[i] == '0') {
                generateClock(
                    jtag,
                    bsdl,
                    outputInstructions,
                    i == 0 ? '1' : '0',
                    '0',
                    '0'
                )
            } else if (dataBinary[i] == '0' && tdoBinary[i] == '1') {
                generateClock(
                    jtag,
                    bsdl,
                    outputInstructions,
                    i == 0 ? '1' : '0',
                    '0',
                    '1'
                )
            } else if (dataBinary[i] == '1' && tdoBinary[i] == '0') {
                generateClock(
                    jtag,
                    bsdl,
                    outputInstructions,
                    i == 0 ? '1' : '0',
                    '1',
                    '0'
                )
            } else if (dataBinary[i] == '1' && tdoBinary[i] == '1') {
                generateClock(
                    jtag,
                    bsdl,
                    outputInstructions,
                    i == 0 ? '1' : '0',
                    '1',
                    '1'
                )
            } else {
                console.error('data or tdo not valid')
            }
        }
    } else {
        outputInstructions.push(`! Generated SDR ${data}`)
        generateMove(jtag, bsdl, outputInstructions, 'IDLE', 'DRSHIFT')
        for (let i = dataBinary.length - 1; i >= 0; i--) {
            if (dataBinary[i] == '0') {
                generateClock(jtag, bsdl, outputInstructions, i == 0 ? '1' : '0', '0')
            } else if (dataBinary[i] == '1') {
                generateClock(jtag, bsdl, outputInstructions, i == 0 ? '1' : '0', '1')
            }
        }
    }

    generateClock(jtag, bsdl, outputInstructions, '0', '0')
    generateMove(jtag, bsdl, outputInstructions, 'DRPAUSE', 'IDLE')
}
