import { bsdlData, boundaryCell } from "./bsdl"
import { map_MC_FPGA, map_RPi_FPGA } from "./pinMappings"
import { binToHex, reverseString, saveStringArray, replaceAt, hexToBin } from "./util"

export interface jtagPins {
    tck: boundaryCell,
    tms: boundaryCell,
    tdo: boundaryCell,
    tdi: boundaryCell
}

type svfStableState = "RESET" | "IDLE" | "DRPAUSE" | "IRPAUSE" | "DRSHIFT" | "IRSHIFT"

export function add_fpga_header(output_instructions: Array<string>, bsdl: bsdlData) {
    output_instructions.push("! Initialize FPGA")
    output_instructions.push("HDR 0;")
    output_instructions.push("HIR 0;")
    output_instructions.push("TDR 0;")
    output_instructions.push("TIR 0;")
    output_instructions.push("ENDDR IDLE;")
    output_instructions.push("ENDIR IDLE;")
    output_instructions.push("FREQUENCY 1,00e+06 HZ;")
    output_instructions.push("STATE IDLE;\n")
    output_instructions.push("! Check the IDCODE")
    output_instructions.push(`SIR ${bsdl.instructionLength} TDI(${bsdl.instructions.idcode});`)
    output_instructions.push(`SDR ${bsdl.idcode.length * 4} TDI (00000000) TDO(${bsdl.idcode}) MASK(FFFFFFFF);\n`)
}

export function generate_value_check_fpga_mc(jtag: jtagPins, bsdl: bsdlData, output_instructions: Array<string>, mc_port: string, value: "0" | "1") {
    if (value != "0" && value != "1") process.exit(1)
    const fpga_port = map_MC_FPGA.get(mc_port)
    const nvalue = value == "0" ? "1" : "0"

    let vector = ""
    for (let i = 0; i < bsdl.boundaryCellsLength; i++) {
        vector += "0"
    }
    for (const cell of bsdl.boundaryCells) {
        if (cell.port != "*" && cell.function != "OBSERVE_ONLY") {
            vector = replaceAt(vector, parseInt(cell.controllCell!), cell.disableValue!)
        } else if (cell.function == "INTERNAL") {
            vector = replaceAt(vector, cell.cellNumber, cell.safeBit == "X" ? "0" : cell.safeBit)
        }
    }

    vector = replaceAt(vector, parseInt(jtag.tck.controllCell!), jtag.tck.enableValue!)
    vector = replaceAt(vector, parseInt(jtag.tms.controllCell!), jtag.tms.enableValue!)
    vector = replaceAt(vector, parseInt(jtag.tdi.controllCell!), jtag.tdi.enableValue!)
    vector = replaceAt(vector, parseInt(jtag.tdo.controllCell!), jtag.tdo.disableValue!)
    vector = replaceAt(vector, jtag.tck.cellNumber, "0")
    vector = replaceAt(vector, jtag.tms.cellNumber, "0")
    vector = replaceAt(vector, jtag.tdi.cellNumber, "0")
    vector = replaceAt(vector, jtag.tdo.cellNumber, "0")

    let tdo = ""
    let mask = ""
    for (let i = 0; i < bsdl.boundaryCellsLength; i++) {
        tdo += "0"
        mask += "0"
    }
    for (const port of map_MC_FPGA.keys()) {
        const boundaryCell = bsdl.boundaryCells.find(bc => bc.port == map_MC_FPGA.get(port))
        if ([jtag.tck, jtag.tdi, jtag.tdo, jtag.tms].includes(boundaryCell!) || port == "RESET") continue
        if (port == mc_port) {
            tdo = replaceAt(tdo, boundaryCell?.cellNumber!, value)
            mask = replaceAt(mask, boundaryCell?.cellNumber!, "1")
        } else {
            tdo = replaceAt(tdo, boundaryCell?.cellNumber!, nvalue)
            mask = replaceAt(mask, boundaryCell?.cellNumber!, "1")
        }
    }

    output_instructions.push("! Checking Value")
    output_instructions.push(`! [instruction-label] Running-${value}-Test: ${mc_port} <-> ${map_MC_FPGA.get(mc_port)}`)
    output_instructions.push(`SDR ${bsdl.boundaryCellsLength} TDI (${binToHex(reverseString(vector))})
        TDO (${binToHex(reverseString(tdo))})
        MASK (${binToHex(reverseString(mask))});\n`)
}

export function generate_clock(jtag: jtagPins, bsdl: bsdlData, output_instructions: Array<string>, vtms: "0" | "1", vtdi: "0" | "1", vtdo?: "0" | "1") {
    let vector = ""
    for (let i = 0; i < bsdl.boundaryCellsLength; i++) {
        vector += "0"
    }
    for (const cell of bsdl.boundaryCells) {
        if (cell.port != "*" && cell.function != "OBSERVE_ONLY") {
            vector = replaceAt(vector, parseInt(cell.controllCell!), cell.disableValue!)
        } else if (cell.function == "INTERNAL") {
            vector = replaceAt(vector, cell.cellNumber, cell.safeBit == "X" ? "0" : cell.safeBit)
        }
    }

    if (vector.length != bsdl.boundaryCellsLength) console.error("vector does not have the correct size")

    // enable/disable control cells
    vector = replaceAt(vector, parseInt(jtag.tck.controllCell!), jtag.tck.enableValue!)
    vector = replaceAt(vector, parseInt(jtag.tms.controllCell!), jtag.tms.enableValue!)
    vector = replaceAt(vector, parseInt(jtag.tdi.controllCell!), jtag.tdi.enableValue!)
    vector = replaceAt(vector, parseInt(jtag.tdo.controllCell!), jtag.tdo.disableValue!)
    vector = replaceAt(vector, jtag.tdo.cellNumber, "0")

    // set tms and tdi to their respective values
    vector = replaceAt(vector, jtag.tms.cellNumber, vtms)
    vector = replaceAt(vector, jtag.tdi.cellNumber, vtdi)

    output_instructions.push(`! Generated Clock TMS=${vtms}, TDI=${vtdi}, Expected TDO=${vtdo}`)

    // set tck to 0
    vector = replaceAt(vector, jtag.tck.cellNumber, "0")
    output_instructions.push(`SDR ${bsdl.boundaryCellsLength} TDI (${binToHex(reverseString(vector))});`)

    // set tck to 1
    vector = replaceAt(vector, jtag.tck.cellNumber, "1")
    // output_instructions.push(`SDR ${bsdl.boundaryCellsLength} TDI (${binToHex(reverseString(vector))});`)
    
    let mask = ""
    let tdo_exp = binToHex(reverseString(vector))
    for (let i = 0; i < bsdl.boundaryCellsLength; i++) {
        mask += "0"
    }
    if (vtdo) {
        mask = replaceAt(mask, jtag.tdo.cellNumber, "1")
        tdo_exp = binToHex(reverseString(replaceAt(vector, jtag.tdo.cellNumber, vtdo)))
    }
    mask = replaceAt(mask, jtag.tms.cellNumber, "1")
    mask = replaceAt(mask, jtag.tdi.cellNumber, "1")
    output_instructions.push(`SDR ${bsdl.boundaryCellsLength} TDI (${binToHex(reverseString(vector))})
        TDO (${tdo_exp})
        MASK (${binToHex(reverseString(mask))});\n`)
}

export function generate_move(jtag: jtagPins, bsdl: bsdlData, output_instructions: Array<string>, from: svfStableState, to: svfStableState) {
    output_instructions.push(`! Generated Move ${from} -> ${to}`)
    switch (from)
    {
        case "RESET":
            if (to == "RESET") { 
                break 
            }
            if (to == "IDLE") { 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "DRPAUSE") { 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "IRPAUSE") { 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "DRSHIFT") { 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "IRSHIFT") { 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            break
        case "IDLE":
            if (to == "RESET") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                break 
            }
            if (to == "IDLE") { 
                break 
            }
            if (to == "DRPAUSE") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "IRPAUSE") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "DRSHIFT") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "IRSHIFT") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            break
        case "DRPAUSE":
            if (to == "RESET") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                break 
            }
            if (to == "IDLE") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "DRPAUSE") { 
                break 
            }
            if (to == "IRPAUSE") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "DRSHIFT") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "IRSHIFT") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            break
        case "IRPAUSE":
            if (to == "RESET") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                break 
            }
            if (to == "IDLE") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "DRPAUSE") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "IRPAUSE") { 
                break 
            }
            if (to == "DRSHIFT") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "IRSHIFT") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            break
        case "DRSHIFT":
            if (to == "RESET") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                break 
            }
            if (to == "IDLE") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "DRPAUSE") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "IRPAUSE") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            break
        case "IRSHIFT":
            if (to == "RESET") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                break 
            }
            if (to == "IDLE") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "DRPAUSE") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            if (to == "IRPAUSE") { 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                generate_clock(jtag, bsdl, output_instructions, "1", "0") 
                generate_clock(jtag, bsdl, output_instructions, "0", "0") 
                break 
            }
            break
        default:
            console.error("from state is not a stable state!\n");
    }
}

export function generate_sir(jtag: jtagPins, bsdl: bsdlData, output_instructions: Array<string>, instruction: string, instruction_bin_length: number) {
    const instruction_bin = hexToBin(instruction, instruction_bin_length)
    //console.log(instruction + " -> " + instruction_bin)
    output_instructions.push(`! Generated SIR ${instruction}`)
    generate_move(jtag, bsdl, output_instructions, "IDLE", "IRSHIFT")
    for (let i = instruction_bin.length - 1; i >= 0; i--) {
        if (instruction_bin[i] == "0") {
            generate_clock(jtag, bsdl, output_instructions, i == 0 ? "1" : "0", "0")
        } else if (instruction_bin[i] == "1") {
            generate_clock(jtag, bsdl, output_instructions, i == 0 ? "1" : "0", "1")
        } else {
            console.error("instruction not valid")
        }
    }
    generate_clock(jtag, bsdl, output_instructions, "0", "0")
    generate_move(jtag, bsdl, output_instructions, "IRPAUSE", "IDLE")
}

export function generate_sdr(jtag: jtagPins, bsdl: bsdlData, output_instructions: Array<string>, data: string, data_bin_length: number, tdo?: string, mask?: string) {
    const data_bin = hexToBin(data, data_bin_length)
    //console.log(data + " -> " + data_bin)
    
    if (tdo) {
        const tdo_bin = hexToBin(tdo, data_bin_length)
        if (data_bin.length != tdo_bin.length) console.error("data and tdo have different length")
        output_instructions.push(`! Generated SDR ${data} TDO ${tdo}`)
        generate_move(jtag, bsdl, output_instructions, "IDLE", "DRSHIFT")
        for (let i = data_bin.length - 1; i >= 0; i--) {
            if (data_bin[i] == "0" && tdo_bin[i] == "0") {
                generate_clock(jtag, bsdl, output_instructions, i == 0 ? "1" : "0", "0", "0")
            } else if (data_bin[i] == "0" && tdo_bin[i] == "1") {
                generate_clock(jtag, bsdl, output_instructions, i == 0 ? "1" : "0", "0", "1")
            } else if (data_bin[i] == "1" && tdo_bin[i] == "0") {
                generate_clock(jtag, bsdl, output_instructions, i == 0 ? "1" : "0", "1", "0")
            } else if (data_bin[i] == "1" && tdo_bin[i] == "1") {
                generate_clock(jtag, bsdl, output_instructions, i == 0 ? "1" : "0", "1", "1")
            } else {
                console.error("data or tdo not valid")
            }
        }
    } else {
        output_instructions.push(`! Generated SDR ${data}`)
        generate_move(jtag, bsdl, output_instructions, "IDLE", "DRSHIFT")
        for (let i = data_bin.length - 1; i >= 0; i--) {
            if (data_bin[i] == "0") {
                generate_clock(jtag, bsdl, output_instructions, i == 0 ? "1" : "0", "0")
            } else if (data_bin[i] == "1") {
                generate_clock(jtag, bsdl, output_instructions, i == 0 ? "1" : "0", "1")
            }
        }
    }

    generate_clock(jtag, bsdl, output_instructions, "0", "0")
    generate_move(jtag, bsdl, output_instructions, "DRPAUSE", "IDLE")
}