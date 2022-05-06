import { map_MC_FPGA, map_RPi_FPGA } from "./pinMappings"
import { add_fpga_header, jtagPins, generate_clock, generate_move, generate_sir, generate_sdr, generate_value_check_fpga_mc } from "./svfGenerator"
import { binToHex, saveStringArray } from "./util"
import { bsdl_fpga, bsdl_mc } from "./globals"

const jtag: jtagPins = {
    tck: bsdl_fpga.boundaryCells.find(cell => cell.port == "PL24B")!,
    tms: bsdl_fpga.boundaryCells.find(cell => cell.port == "PL24A")!,
    tdo: bsdl_fpga.boundaryCells.find(cell => cell.port == "PL23D")!,
    tdi: bsdl_fpga.boundaryCells.find(cell => cell.port == "PB13B")!
}

function generate_reset_fpga() {
    let output_instructions: Array<string> = []
    add_fpga_header(output_instructions, bsdl_fpga)
    output_instructions.push("STATE RESET")
    output_instructions.push("STATE IDLE")
    saveStringArray(output_instructions, `dist/generated_tests/test_reset_fpga.svf`)
}

function generate_gpio_test_rpi(value: "0" | "1") {
    if (value != "0" && value != "1") process.exit(1);

    const nvalue = value == "1" ? "0" : "1";

    // write pins
    for (const rpi_pin of map_RPi_FPGA.keys()) {
        let output_instructions: Array<string> = []
        add_fpga_header(output_instructions, bsdl_fpga)

        const fpga_pin = map_RPi_FPGA.get(rpi_pin)
        if (!fpga_pin) process.exit(1);

        // Preload
        output_instructions.push("! Preload")
        output_instructions.push(`SIR ${bsdl_fpga.instructionLength} TDI(${bsdl_fpga.instructions.sample});`)
        let str = []
        for (const bc of bsdl_fpga.boundaryCells) {
            if (bc.port != "*") {
                if (bc.port == fpga_pin) {
                    str[bc.cellNumber] = value
                } else {
                    str[bc.cellNumber] = nvalue
                }
                if (bc.controllCell && bc.disableValue && bc.disableResult) {
                    str[parseInt(bc.controllCell)] = bc.port == fpga_pin ? parseInt(bc.enableValue!) : parseInt(bc.disableValue!)
                }
            } else {
                if (bc.function == "INTERNAL") {
                    if (bc.safeBit == "X") str[bc.cellNumber] = "0"
                    else str[bc.cellNumber] = bc.safeBit
                }
            }
        }
        let bin = str.reverse().join("")
        output_instructions.push(`SDR ${bsdl_fpga.boundaryCellsLength} TDI (${binToHex(bin)});\n`)

        // Extest
        output_instructions.push("! Extest")
        output_instructions.push(`SIR ${bsdl_fpga.instructionLength} TDI(${bsdl_fpga.instructions.extest});\n`)

        saveStringArray(output_instructions, `dist/generated_tests/test_gpio_write_${rpi_pin}_${value}.svf`)
    }

    // read pins
    for (const rpi_pin of map_RPi_FPGA.keys()) {
        let output_instructions: Array<string> = []
        add_fpga_header(output_instructions, bsdl_fpga)

        const fpga_pin = map_RPi_FPGA.get(rpi_pin)
        if (!fpga_pin) process.exit(1);

        output_instructions.push(`SIR ${bsdl_fpga.instructionLength} TDI(${bsdl_fpga.instructions.sample});`)
        let str = []
        for (const bc of bsdl_fpga.boundaryCells) {
            if (bc.port != "*") {
                if (bc.port == fpga_pin) {
                    str[bc.cellNumber] = value
                } else {
                    str[bc.cellNumber] = "0"
                }
                if (bc.controllCell && bc.disableValue && bc.disableResult) {
                    str[parseInt(bc.controllCell)] = "0"
                }
            } else {
                if (bc.function == "INTERNAL") {
                    str[bc.cellNumber] = "0"
                }
            }
        }
        const tdo = binToHex(str.reverse().join(""))
        str.reverse()
        str[bsdl_fpga.boundaryCells.find(bc => bc.port == fpga_pin)?.cellNumber!] = "1";
        const mask = binToHex(str.reverse().join(""))
        let tdi = "0".repeat(Math.floor(bsdl_fpga.boundaryCellsLength/4))
        if (bsdl_fpga.boundaryCellsLength % 4 > 0) tdi += "0"
        output_instructions.push(`SDR ${bsdl_fpga.boundaryCellsLength} TDI (${tdi}) \nTDO  (${tdo}) \nMASK (${mask});\n`)

        saveStringArray(output_instructions, `dist/generated_tests/test_gpio_read_${rpi_pin}_${value}.svf`)
    }
}

function generate_gpio_test_mc(value: "0" | "1") {
    let output_instructions: Array<string> = []

    add_fpga_header(output_instructions, bsdl_fpga)

    // enter extest mode fpga
    output_instructions.push("! Preload/Sample")
    output_instructions.push(`SIR ${bsdl_fpga.instructionLength} TDI(${bsdl_fpga.instructions.sample});`)
    let str: Array<"0"|"1"> = []
    for (const bc of bsdl_fpga.boundaryCells) {
        if (bc.port != "*") {
            str[bc.cellNumber] = "0"
            if (bc.controllCell && bc.disableValue && bc.disableResult) {
                const control_cell = parseInt(bc.controllCell)
                str[control_cell] = bc.disableValue
            }
        } else {
            if (bc.function == "INTERNAL") {
                if (bc.safeBit == "X") str[bc.cellNumber] = "0"
                else str[bc.cellNumber] = bc.safeBit
            }
        }
    }
    let bin = str.reverse().join("")
    output_instructions.push(`SDR ${bsdl_fpga.boundaryCellsLength} TDI (${binToHex(bin)});\n`)
    output_instructions.push("! Enter Extest FPGA")
    output_instructions.push(`SIR ${bsdl_fpga.instructionLength} TDI(${bsdl_fpga.instructions.extest});\n`)

    // reset jtag microcontroller
    output_instructions.push("! Reset Microcontroller")
    for (let i = 0; i < 5; i++) generate_clock(jtag, bsdl_fpga, output_instructions, "1", "0")
    generate_move(jtag, bsdl_fpga, output_instructions, "RESET", "IDLE")

    // read idcode microcontroller
    output_instructions.push("! Check the IDCODE of the Microcontroller")
    generate_sir(jtag, bsdl_fpga, output_instructions, bsdl_mc.instructions.idcode, bsdl_mc.instructionLength)
    let sdr_data = ""
    for (let i = 0; i < bsdl_mc.idcode.length; i++) sdr_data += "0"
    generate_sdr(jtag, bsdl_fpga, output_instructions, sdr_data, bsdl_mc.idcode.length, bsdl_mc.idcode)
    saveStringArray(output_instructions, `dist/generated_tests/test_idcode_mc.svf`)

    // enter extest mode microcontroller
    output_instructions.push("! Enter Extest Microcontroller")
    generate_sir(jtag, bsdl_fpga, output_instructions, bsdl_mc.instructions.extest, bsdl_mc.instructionLength)

    // send vectors microcontroller and check return values
    if (value != "0" && value != "1") process.exit(1);
    const nvalue = value == "1" ? "0" : "1";

    for (const mc_port of map_MC_FPGA.keys()) {
        output_instructions.push("! Testing Ports " + mc_port + " <-> " + map_MC_FPGA.get(mc_port) + ", value = " + value)
        let str = []
        for (const bc of bsdl_mc.boundaryCells) {
            if (bc.port != "*") {
                if (bc.port == "RESET") {
                    str[bc.cellNumber] = "1"
                } else if (bc.port == mc_port) {
                    str[bc.cellNumber] = value
                } else {
                    str[bc.cellNumber] = nvalue
                }
                if (bc.controllCell && bc.disableValue && bc.disableResult) {
                    str[parseInt(bc.controllCell)] = bc.enableValue
                }
            } else {
                if (bc.function == "INTERNAL") {
                    if (bc.safeBit == "X") str[bc.cellNumber] = "0"
                    else str[bc.cellNumber] = bc.safeBit
                }
            }
        }
        let sdr_data_mc = binToHex(str.reverse().join(""))
        generate_sdr(jtag, bsdl_fpga, output_instructions, sdr_data_mc, bsdl_mc.boundaryCellsLength)
        generate_value_check_fpga_mc(jtag, bsdl_fpga, output_instructions, mc_port, value)
    }

    // reset jtag microcontroller
    output_instructions.push("! Reset Microcontroller")
    for (let i = 0; i < 5; i++) generate_clock(jtag, bsdl_fpga, output_instructions, "1", "0")
    generate_clock(jtag, bsdl_fpga, output_instructions, "0", "0")

    // move fpga out of extest
    output_instructions.push("! Reset FPGA")
    output_instructions.push("STATE RESET;")
    output_instructions.push("STATE IDLE;")

    saveStringArray(output_instructions, `dist/generated_tests/test_fpga_mc_${value}.svf`)
}

generate_reset_fpga()

generate_gpio_test_rpi("0")
generate_gpio_test_rpi("1")

generate_gpio_test_mc("0")
generate_gpio_test_mc("1")
