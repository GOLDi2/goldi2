import { bsdlRaw, parseBsdl} from "./bsdl"
import * as bsdl_fpga_raw from "./bsdl/machxo2/bsdl-machxo2.json" 
import * as bsdl_mc_raw from "./bsdl/atmega2560/bsdl-atmega2560.json"
import { map_RPi_FPGA } from "./pinMappings"
import { generate_gpio_test_rpi, add_fpga_header, jtagPins, generate_clock, generate_move, generate_sir, generate_sdr } from "./svfGenerator"
import { binToHex, saveStringArray } from "./util"

const bsdl_fpga = parseBsdl(bsdl_fpga_raw as bsdlRaw)
const bsdl_mc = parseBsdl(bsdl_mc_raw as bsdlRaw)

const jtag: jtagPins = {
    tck: bsdl_fpga.boundaryCells.find(cell => cell.port == "PL24B")!,
    tms: bsdl_fpga.boundaryCells.find(cell => cell.port == "PL24A")!,
    tdo: bsdl_fpga.boundaryCells.find(cell => cell.port == "PL23D")!,
    tdi: bsdl_fpga.boundaryCells.find(cell => cell.port == "PB13B")!
    // tck: bsdl_fpga.boundaryCells.find(cell => cell.port == "PT11B")!,
    // tms: bsdl_fpga.boundaryCells.find(cell => cell.port == "PT18B")!,
    // tdo: bsdl_fpga.boundaryCells.find(cell => cell.port == "PT15A")!,
    // tdi: bsdl_fpga.boundaryCells.find(cell => cell.port == "PT11A")!
}

function generate_gpio_test_mc() {
    let output_instructions: Array<string> = []

    add_fpga_header(output_instructions, bsdl_fpga)

    // enter extest mode
    output_instructions.push("! Preload/Sample")
    output_instructions.push(`SIR ${bsdl_fpga.instructionLength} TDI(${bsdl_fpga.instructions.sample});`)
    let str = []
    for (const bc of bsdl_fpga.boundaryCells) {
        if (bc.port != "*") {
            str[bc.cellNumber] = "0"
            if (bc.controllCell && bc.disableValue && bc.disableResult) {
                const control_cell = parseInt(bc.controllCell)
                const disable_value = parseInt(bc.disableValue)
                str[control_cell] = disable_value == 1 ? 0 : 1
            }
        } else {
            if (bc.function == "INTERNAL") {
                if (bc.safeBit == "X") str[bc.cellNumber] = "1"
                else str[bc.cellNumber] = bc.safeBit
            }
        }
    }
    let bin = str.reverse().join("")
    output_instructions.push(`SDR ${bsdl_fpga.boundaryCellsLength} TDI (${binToHex(bin)});\n`)
    output_instructions.push("! Extest")
    output_instructions.push(`SIR ${bsdl_fpga.instructionLength} TDI(${bsdl_fpga.instructions.extest});\n`)

    // reset jtag microcontroller
    output_instructions.push("! Reset Microcontroller")
    for (let i = 0; i < 5; i++) generate_clock(jtag, bsdl_fpga, output_instructions, "1", "0")
    generate_move(jtag, bsdl_fpga, output_instructions, "RESET", "IDLE")

    // read idcode microcontroller
    output_instructions.push("! Check the IDCODE of the Microcontroller")
    generate_sir(jtag, bsdl_fpga, output_instructions, bsdl_mc.instructions.idcode)
    let sdr_data = ""
    for (let i = 0; i < bsdl_mc.idcode.length; i++) sdr_data += "0"
    generate_sdr(jtag, bsdl_fpga, output_instructions, sdr_data, bsdl_mc.idcode)

    // bypass test
    // output_instructions.push("! Check the IDCODE of the Microcontroller")
    // generate_sir(jtag, bsdl_fpga, output_instructions, "F")
    // let sdr_data = "5555555555"
    // let tdo_data = "AAAAAAAAAA"
    // generate_sdr(jtag, bsdl_fpga, output_instructions, sdr_data, tdo_data)

    // send vectors microcontroller and check return values (both mc and fpga?)

    // reset jtag microcontroller
    output_instructions.push("! Reset Microcontroller")
    for (let i = 0; i < 5; i++) generate_clock(jtag, bsdl_fpga, output_instructions, "1", "0")

    // move fpga out of extest
    output_instructions.push("! Reset FPGA")
    output_instructions.push("STATE RESET;")

    saveStringArray(output_instructions, `generated_tests/test_fpga_mc.svf`)
}

generate_gpio_test_rpi(bsdl_fpga, map_RPi_FPGA, "0")
generate_gpio_test_rpi(bsdl_fpga, map_RPi_FPGA, "1")

generate_gpio_test_mc()